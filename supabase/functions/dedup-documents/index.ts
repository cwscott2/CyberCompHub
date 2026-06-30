import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Metadata fields used to identify duplicates per framework
const DEDUP_FIELDS: Record<string, string> = {
  'SP 800-53': 'control_id',
  'FedRAMP High': 'control_id',
  'FedRAMP Low': 'control_id',
  'FedRAMP Moderate': 'control_id',
  'CMMC': 'practice_id',
  'SOC 2': 'criterion_id',
  'NIST CSF': 'subcategory_id',
  'NIST RMF': 'task_id',
  'ISO 27001': 'control_id',
  'SOX': 'control_id',
  'NIST AI 100-1': 'control_id',
  'MITRE ATLAS': 'technique_id',
  'DoD AI Ethics': 'control_id',
  'EU AI Act': 'article_id',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  const url = new URL(req.url);
  const dryRun = url.searchParams.get('dry') !== 'false'; // default: dry run

  try {
    const { data: frameworks } = await supabase
      .from('compliance_frameworks')
      .select('id, abbreviation');

    if (!frameworks) throw new Error('Could not fetch frameworks');

    const results: Record<string, { duplicates: number; deleted: number; field: string }> = {};

    for (const fw of frameworks) {
      const field = DEDUP_FIELDS[fw.abbreviation];
      if (!field) continue;

      // Find all documents where the same control_id appears more than once
      const { data: docs } = await supabase
        .from('documents')
        .select('id, metadata, created_at')
        .eq('framework_id', fw.id)
        .eq('document_type', 'control')
        .order('created_at', { ascending: true });

      if (!docs || docs.length === 0) continue;

      // Group by the dedup field value
      const seen = new Map<string, string>(); // value → first doc id
      const toDelete: string[] = [];

      for (const doc of docs) {
        const val = (doc.metadata as Record<string, string>)?.[field];
        if (!val) continue;
        if (seen.has(val)) {
          toDelete.push(doc.id);
        } else {
          seen.set(val, doc.id);
        }
      }

      results[fw.abbreviation] = {
        duplicates: toDelete.length,
        deleted: 0,
        field,
      };

      if (toDelete.length > 0 && !dryRun) {
        // Delete in batches of 100
        for (let i = 0; i < toDelete.length; i += 100) {
          const batch = toDelete.slice(i, i + 100);
          await supabase.from('documents').delete().in('id', batch);
        }
        results[fw.abbreviation].deleted = toDelete.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, dry_run: dryRun, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
