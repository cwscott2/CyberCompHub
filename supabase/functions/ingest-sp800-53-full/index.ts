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

const OSCAL_URL = 'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json';

interface OscalProp { name: string; value: string; }
interface OscalPart { name: string; prose?: string; parts?: OscalPart[]; }
interface OscalControl {
  id: string;
  title: string;
  props?: OscalProp[];
  parts?: OscalPart[];
  controls?: OscalControl[];
}
interface OscalGroup {
  id: string;
  title: string;
  controls: OscalControl[];
}
interface OscalCatalog {
  catalog: { groups: OscalGroup[] };
}

function getLabel(props: OscalProp[] | undefined, fallback: string): string {
  return props?.find(p => p.name === 'label')?.value ?? fallback.toUpperCase();
}

function getProse(parts: OscalPart[] | undefined, name: string): string {
  const part = parts?.find(p => p.name === name);
  if (!part) return '';
  if (part.prose) return part.prose;
  return part.parts?.map(p => p.prose ?? '').join('\n') ?? '';
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  if (!response.ok) throw new Error(`Embedding failed: ${response.statusText}`);
  const data = await response.json();
  return data.data[0].embedding;
}

async function insertDocument(params: {
  sourceId: string;
  frameworkId: string;
  title: string;
  rawContent: string;
  metadata: Record<string, unknown>;
  documentType: string;
}): Promise<void> {
  const { data: doc, error } = await supabase.from('documents').insert({
    source_id: params.sourceId,
    framework_id: params.frameworkId,
    title: params.title,
    document_type: params.documentType,
    url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
    version: 'Rev 5',
    raw_content: params.rawContent,
    metadata: params.metadata,
    is_indexed: true,
  }).select('id').single();

  if (error || !doc) {
    console.error(`Failed to insert "${params.title}":`, error?.message);
    return;
  }

  const embedding = await generateEmbedding(params.rawContent);
  await supabase.from('document_chunks').insert({
    document_id: doc.id,
    chunk_index: 0,
    content: params.rawContent,
    metadata: params.metadata,
    embedding,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { data: framework, error: fwError } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'SP 800-53')
      .single();

    if (fwError || !framework) {
      return new Response(
        JSON.stringify({ error: 'SP 800-53 framework not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: source, error: srcError } = await supabase
      .from('sources')
      .insert({
        framework_id: framework.id,
        name: 'NIST SP 800-53 Rev 5 — Security and Privacy Controls for Information Systems and Organizations (OSCAL)',
        url: OSCAL_URL,
        source_type: 'webpage',
        scraper_type: 'generic-webpage',
        is_active: true,
      })
      .select('id')
      .single();

    if (srcError || !source) {
      return new Response(
        JSON.stringify({ error: 'Failed to create source', details: srcError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: job } = await supabase
      .from('ingest_jobs')
      .insert({ source_id: source.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();

    const oscalRes = await fetch(OSCAL_URL);
    if (!oscalRes.ok) throw new Error(`Failed to fetch OSCAL JSON: ${oscalRes.statusText}`);
    const oscal: OscalCatalog = await oscalRes.json();

    let documentsIngested = 0;

    for (const group of oscal.catalog.groups) {
      const familyAbbr = group.id.toUpperCase();
      const familyName = group.title;

      // Family overview document
      const familyContent = [
        `# NIST SP 800-53 Rev 5 — ${familyAbbr}: ${familyName}`,
        ``,
        `Control Family: ${familyName} (${familyAbbr})`,
        `Framework: NIST Special Publication 800-53 Revision 5`,
        ``,
        `## Controls in this Family`,
        ...group.controls.map(c => {
          const label = getLabel(c.props, c.id);
          const enhCount = c.controls?.length ?? 0;
          return `- **${label}** — ${c.title}${enhCount > 0 ? ` (${enhCount} enhancements)` : ''}`;
        }),
      ].join('\n');

      await insertDocument({
        sourceId: source.id,
        frameworkId: framework.id,
        title: `SP 800-53 Rev 5 — ${familyAbbr}: ${familyName}`,
        rawContent: familyContent,
        metadata: { family_id: familyAbbr, family_name: familyName, document_level: 'family', revision: 5 },
        documentType: 'framework',
      });
      documentsIngested++;

      for (const control of group.controls) {
        const controlId = getLabel(control.props, control.id);
        const statement = getProse(control.parts, 'statement');
        const guidance = getProse(control.parts, 'guidance');
        const enhancements = control.controls ?? [];

        const controlContent = [
          `# ${controlId} — ${control.title}`,
          ``,
          `Control Family: ${familyAbbr} — ${familyName}`,
          `Framework: NIST SP 800-53 Rev 5`,
          `Control ID: ${controlId}`,
          ``,
          `## Control Requirement`,
          statement || control.title,
          ``,
          `## Supplemental Guidance`,
          guidance || 'See NIST SP 800-53 Rev 5 for supplemental guidance.',
          ``,
          enhancements.length > 0
            ? `## Control Enhancements\n${enhancements.map(e => `- **${getLabel(e.props, e.id)}** — ${e.title}`).join('\n')}`
            : '',
        ].filter(Boolean).join('\n');

        await insertDocument({
          sourceId: source.id,
          frameworkId: framework.id,
          title: `${controlId} — ${control.title}`,
          rawContent: controlContent,
          metadata: {
            control_id: controlId,
            control_title: control.title,
            family_id: familyAbbr,
            family_name: familyName,
            is_enhancement: false,
            revision: 5,
            document_level: 'control',
          },
          documentType: 'control',
        });
        documentsIngested++;

        for (const enhancement of enhancements) {
          const enhId = getLabel(enhancement.props, enhancement.id);
          const enhStatement = getProse(enhancement.parts, 'statement');
          const enhGuidance = getProse(enhancement.parts, 'guidance');

          const enhContent = [
            `# ${enhId} — ${enhancement.title}`,
            ``,
            `Control Enhancement of: ${controlId} — ${control.title}`,
            `Control Family: ${familyAbbr} — ${familyName}`,
            `Framework: NIST SP 800-53 Rev 5`,
            `Enhancement ID: ${enhId}`,
            ``,
            `## Enhancement Requirement`,
            enhStatement || enhancement.title,
            ``,
            `## Supplemental Guidance`,
            enhGuidance || 'See NIST SP 800-53 Rev 5 for supplemental guidance.',
          ].join('\n');

          await insertDocument({
            sourceId: source.id,
            frameworkId: framework.id,
            title: `${enhId} — ${enhancement.title}`,
            rawContent: enhContent,
            metadata: {
              control_id: enhId,
              control_title: enhancement.title,
              parent_control_id: controlId,
              family_id: familyAbbr,
              family_name: familyName,
              is_enhancement: true,
              revision: 5,
              document_level: 'enhancement',
            },
            documentType: 'control',
          });
          documentsIngested++;
        }
      }
    }

    if (job) {
      await supabase.from('ingest_jobs').update({
        status: 'completed',
        documents_ingested: documentsIngested,
        completed_at: new Date().toISOString(),
      }).eq('id', job.id);
    }

    return new Response(
      JSON.stringify({ success: true, documents_ingested: documentsIngested }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SP 800-53 full ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
