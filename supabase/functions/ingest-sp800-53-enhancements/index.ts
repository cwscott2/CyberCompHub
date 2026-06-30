import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CATALOG_URL =
  'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json';

// Normalize OSCAL id to canonical control ID: "ac-2.1" → "AC-2(1)"
function normalizeId(oscalId: string): string {
  // "ac-2.1" → "AC-2(1)", "ac-2.13" → "AC-2(13)"
  return oscalId.toUpperCase().replace(/\.(\d+)$/, '($1)');
}

// Extract text from OSCAL parts recursively
function extractParts(parts: unknown[]): string {
  if (!parts || !Array.isArray(parts)) return '';
  const lines: string[] = [];
  for (const part of parts as Record<string, unknown>[]) {
    const name = (part.name as string) || '';
    const prose = (part.prose as string) || '';
    if (prose) {
      const label = name === 'statement' ? '' : name === 'guidance' ? '\n**Guidance:** ' : `\n**${name}:** `;
      lines.push(`${label}${prose}`);
    }
    if (part.parts) {
      lines.push(extractParts(part.parts as unknown[]));
    }
  }
  return lines.join('\n');
}

// Extract assessment objectives from parts
function extractAssessmentObjectives(parts: unknown[]): string {
  if (!parts || !Array.isArray(parts)) return '';
  for (const part of parts as Record<string, unknown>[]) {
    if ((part as Record<string, unknown>).name === 'assessment-objective') {
      const objectives: string[] = [];
      const subParts = ((part as Record<string, unknown>).parts as unknown[]) || [];
      for (const sp of subParts as Record<string, unknown>[]) {
        const prose = (sp.prose as string) || '';
        if (prose) objectives.push(`- ${prose}`);
      }
      return objectives.join('\n');
    }
  }
  return '';
}

function buildContent(
  controlId: string,
  parentId: string,
  title: string,
  familyName: string,
  parts: unknown[],
): string {
  const statement = extractParts(parts);
  const objectives = extractAssessmentObjectives(parts);

  return `# ${controlId} — ${title}

**Family:** ${familyName} | **Parent Control:** ${parentId} | **Enhancement:** ${controlId}

## Control Enhancement Statement
${statement || '_No prose statement in OSCAL source._'}

${objectives ? `## Assessment Objectives\n${objectives}` : ''}

## Implementation Notes
This is a control enhancement (overlay) to ${parentId}. Organizations implementing ${parentId} should evaluate whether this enhancement is required based on their security categorization and applicable baseline (Low/Moderate/High).

Control enhancements are numbered requirements that add specificity, strengthen protections, or extend the base control to additional technologies, processes, or circumstances. Many control enhancements are included in the FedRAMP Moderate and High baselines.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const familyFilter = url.searchParams.get('family')?.toUpperCase(); // e.g. "AC"

    // Lookup framework and source
    const { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'SP 800-53')
      .single();

    if (!framework) {
      return new Response(JSON.stringify({ error: 'SP 800-53 framework not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: sources } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', framework.id)
      .limit(1);

    if (!sources?.length) {
      return new Response(JSON.stringify({ error: 'SP 800-53 source not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sourceId = sources[0].id;

    // Fetch NIST catalog
    const catalogRes = await fetch(CATALOG_URL);
    if (!catalogRes.ok) throw new Error(`Catalog fetch failed: ${catalogRes.status}`);
    const catalogData = await catalogRes.json();
    const groups = catalogData.catalog.groups as Record<string, unknown>[];

    let ingested = 0;
    let skipped = 0;

    for (const group of groups) {
      const familyId = ((group.id as string) || '').toUpperCase(); // "ac"
      if (familyFilter && familyId !== familyFilter.toLowerCase() && familyId !== familyFilter) continue;

      const familyName = (group.title as string) || familyId;
      const controls = (group.controls as Record<string, unknown>[]) || [];

      for (const ctrl of controls) {
        const enhancements = (ctrl.controls as Record<string, unknown>[]) || [];
        if (!enhancements.length) continue;

        const parentOscalId = ctrl.id as string;
        const parentControlId = normalizeId(parentOscalId);

        // Delete existing enhancements for this parent to ensure idempotency
        await supabase
          .from('documents')
          .delete()
          .eq('framework_id', framework.id)
          .eq('metadata->>parent_control_id', parentControlId)
          .eq('metadata->>is_enhancement', 'true');

        for (const enh of enhancements) {
          const oscalId = enh.id as string;
          const controlId = normalizeId(oscalId);
          const title = (enh.title as string) || controlId;
          const parts = (enh.parts as unknown[]) || [];

          const rawContent = buildContent(controlId, parentControlId, title, familyName, parts);

          const { data: inserted, error } = await supabase
            .from('documents')
            .insert({
              source_id: sourceId,
              framework_id: framework.id,
              title: `${controlId} — ${title}`,
              document_type: 'control',
              url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
              version: 'Rev 5',
              raw_content: rawContent,
              metadata: {
                control_id: controlId,
                parent_control_id: parentControlId,
                family_name: familyName,
                family_id: familyId.toUpperCase(),
                is_enhancement: 'true',
              },
              is_indexed: true,
            })
            .select('id')
            .single();

          if (error || !inserted) {
            console.error(`Failed: ${controlId}`, error?.message);
            skipped++;
            continue;
          }

          // Generate and store embedding
          const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: rawContent.slice(0, 8000),
            }),
          });

          if (!embeddingRes.ok) {
            console.error(`Embedding failed for ${controlId}: ${embeddingRes.statusText}`);
            skipped++;
            continue;
          }

          const embeddingData = await embeddingRes.json();
          await supabase.from('document_chunks').insert({
            document_id: inserted.id,
            chunk_index: 0,
            content: rawContent,
            metadata: {
              control_id: controlId,
              parent_control_id: parentControlId,
              family_name: familyName,
              is_enhancement: 'true',
            },
            embedding: embeddingData.data[0].embedding,
          });

          ingested++;
        }

        console.log(`${parentControlId}: ${enhancements.length} enhancements processed`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        family: familyFilter || 'ALL',
        documents_ingested: ingested,
        skipped,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
