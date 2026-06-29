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

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });
  if (!response.ok) throw new Error(`Embedding failed: ${response.statusText}`);
  const data = await response.json();
  return data.data[0].embedding;
}

async function insertChunk(documentId: string, content: string, metadata: Record<string, unknown>) {
  const embedding = await generateEmbedding(content);
  const { error } = await supabase.from('document_chunks').insert({
    document_id: documentId,
    chunk_index: 0,
    content,
    metadata,
    embedding,
  });
  if (error) console.error('Chunk insert error:', error.message);
}

// NIST CSF 2.0 Core Functions and Categories
const NIST_CSF_DATA = {
  version: '2.0',
  core_functions: [
    {
      name: 'GOVERN',
      abbreviation: 'GV',
      description: 'GOVERN establishes and monitors the organization\'s cybersecurity risk management strategy, expectations, and policy.',
      categories: [
        {
          id: 'GV.OC',
          name: 'Organizational Context',
          description: 'The organization understands its context and circumstances, including its mission, stakeholders, governing requirements, and dependencies.',
          subcategories: [
            { id: 'GV.OC-01', description: 'The organization\'s mission, vision, and values are understood and communicated.' },
            { id: 'GV.OC-02', description: 'The organization\'s internal and external stakeholders and their needs are understood and communicated.' },
            { id: 'GV.OC-03', description: 'The organization\'s legal, regulatory, and contractual requirements are understood and communicated.' },
            { id: 'GV.OC-04', description: 'The organization\'s dependencies on critical infrastructure and other organizations are understood and communicated.' },
            { id: 'GV.OC-05', description: 'The organization\'s risk appetite and tolerance are understood and communicated.' },
          ]
        },
        {
          id: 'GV.RM',
          name: 'Risk Management Strategy',
          description: 'The organization establishes and communicates a cybersecurity risk management strategy.',
          subcategories: [
            { id: 'GV.RM-01', description: 'Risk management objectives are established and aligned with organizational goals.' },
            { id: 'GV.RM-02', description: 'Risk appetite and tolerance are defined and communicated.' },
            { id: 'GV.RM-03', description: 'Risk assessment methods are established and communicated.' },
            { id: 'GV.RM-04', description: 'Risk response strategies are established and communicated.' },
          ]
        },
        {
          id: 'GV.RR',
          name: 'Roles and Responsibilities',
          description: 'The organization establishes and communicates cybersecurity roles and responsibilities.',
          subcategories: [
            { id: 'GV.RR-01', description: 'Cybersecurity roles and responsibilities are established and communicated.' },
            { id: 'GV.RR-02', description: 'Cybersecurity leadership roles are established and communicated.' },
            { id: 'GV.RR-03', description: 'Cybersecurity personnel are qualified and competent.' },
            { id: 'GV.RR-04', description: 'Cybersecurity roles are reviewed and updated.' },
          ]
        },
      ]
    },
    {
      name: 'IDENTIFY',
      abbreviation: 'ID',
      description: 'IDENTIFY helps the organization understand and manage cybersecurity risk to systems, people, assets, data, and capabilities.',
      categories: [
        {
          id: 'ID.AM',
          name: 'Asset Management',
          description: 'The data, personnel, devices, systems, and facilities that enable the organization to achieve business purposes are identified and managed.',
          subcategories: [
            { id: 'ID.AM-01', description: 'All hardware assets are identified and inventoried.' },
            { id: 'ID.AM-02', description: 'All software assets are identified and inventoried.' },
            { id: 'ID.AM-03', description: 'All data and information assets are identified and inventoried.' },
            { id: 'ID.AM-04', description: 'All personnel assets are identified and inventoried.' },
            { id: 'ID.AM-05', description: 'All facilities are identified and inventoried.' },
            { id: 'ID.AM-06', description: 'All systems are identified and inventoried.' },
            { id: 'ID.AM-07', description: 'Asset vulnerabilities are identified and documented.' },
            { id: 'ID.AM-08', description: 'Asset criticality is assessed and documented.' },
          ]
        },
        {
          id: 'ID.RA',
          name: 'Risk Assessment',
          description: 'The organization understands and manages cybersecurity risk to organizational operations, organizational assets, individuals, and other organizations.',
          subcategories: [
            { id: 'ID.RA-01', description: 'Cybersecurity risk assessment processes are established and managed.' },
            { id: 'ID.RA-02', description: 'Internal and external cybersecurity threats are identified and documented.' },
            { id: 'ID.RA-03', description: 'Asset vulnerabilities are identified and documented.' },
            { id: 'ID.RA-04', description: 'Risk scenarios are identified and documented.' },
            { id: 'ID.RA-05', description: 'Risk is assessed and prioritized.' },
            { id: 'ID.RA-06', description: 'Risk assessment results are communicated.' },
          ]
        },
        {
          id: 'ID.IM',
          name: 'Improvement',
          description: 'The organization improves cybersecurity risk management based on lessons learned.',
          subcategories: [
            { id: 'ID.IM-01', description: 'Cybersecurity risk management improvements are identified from operations and assessments.' },
            { id: 'ID.IM-02', description: 'Cybersecurity risk management improvements are implemented.' },
          ]
        },
      ]
    },
    {
      name: 'PROTECT',
      abbreviation: 'PR',
      description: 'PROTECT supports the ability to limit or contain the impact of a cybersecurity event.',
      categories: [
        {
          id: 'PR.AA',
          name: 'Identity Management, Authentication, and Access Control',
          description: 'Access to physical and logical assets is authorized and managed.',
          subcategories: [
            { id: 'PR.AA-01', description: 'Identity management and authentication processes are established and managed.' },
            { id: 'PR.AA-02', description: 'Access control processes are established and managed.' },
            { id: 'PR.AA-03', description: 'Physical access control processes are established and managed.' },
            { id: 'PR.AA-04', description: 'Logical access control processes are established and managed.' },
            { id: 'PR.AA-05', description: 'Access control decisions are documented and reviewed.' },
          ]
        },
        {
          id: 'PR.AT',
          name: 'Awareness and Training',
          description: 'The organization provides cybersecurity awareness and training.',
          subcategories: [
            { id: 'PR.AT-01', description: 'Cybersecurity awareness content is developed and updated.' },
            { id: 'PR.AT-02', description: 'Cybersecurity awareness content is delivered.' },
            { id: 'PR.AT-03', description: 'Cybersecurity training content is developed and updated.' },
            { id: 'PR.AT-04', description: 'Cybersecurity training content is delivered.' },
          ]
        },
        {
          id: 'PR.DS',
          name: 'Data Security',
          description: 'Data are managed and protected.',
          subcategories: [
            { id: 'PR.DS-01', description: 'Data classification processes are established and managed.' },
            { id: 'PR.DS-02', description: 'Data protection processes are established and managed.' },
            { id: 'PR.DS-03', description: 'Data protection technologies are implemented.' },
            { id: 'PR.DS-04', description: 'Data protection compliance is ensured.' },
          ]
        },
        {
          id: 'PR.PS',
          name: 'Platform Security',
          description: 'The security of technology platforms is managed throughout their lifecycle.',
          subcategories: [
            { id: 'PR.PS-01', description: 'Platform security requirements are established and managed.' },
            { id: 'PR.PS-02', description: 'Platform security controls are implemented and maintained.' },
          ]
        },
        {
          id: 'PR.IR',
          name: 'Technology Infrastructure Resilience',
          description: 'Technology infrastructure is resilient.',
          subcategories: [
            { id: 'PR.IR-01', description: 'Network resilience requirements are established and managed.' },
            { id: 'PR.IR-02', description: 'Network resilience controls are implemented and maintained.' },
          ]
        },
      ]
    },
    {
      name: 'DETECT',
      abbreviation: 'DE',
      description: 'DETECT helps the organization identify the occurrence of a cybersecurity event in a timely manner.',
      categories: [
        {
          id: 'DE.CM',
          name: 'Continuous Monitoring',
          description: 'The organization monitors for cybersecurity events and anomalies.',
          subcategories: [
            { id: 'DE.CM-01', description: 'Network monitoring processes are established and managed.' },
            { id: 'DE.CM-02', description: 'Network monitoring controls are implemented and maintained.' },
            { id: 'DE.CM-03', description: 'Service monitoring processes are established and managed.' },
            { id: 'DE.CM-04', description: 'Service monitoring controls are implemented and maintained.' },
            { id: 'DE.CM-05', description: 'Physical environment monitoring processes are established and managed.' },
            { id: 'DE.CM-06', description: 'Physical environment monitoring controls are implemented and maintained.' },
            { id: 'DE.CM-07', description: 'User behavior analytics processes are established and managed.' },
            { id: 'DE.CM-08', description: 'User behavior analytics controls are implemented and maintained.' },
            { id: 'DE.CM-09', description: 'Cybersecurity event detection processes are established and managed.' },
            { id: 'DE.CM-10', description: 'Cybersecurity event detection controls are implemented and maintained.' },
          ]
        },
        {
          id: 'DE.AE',
          name: 'Adverse Event Analysis',
          description: 'Adverse events are analyzed to identify potential cybersecurity incidents.',
          subcategories: [
            { id: 'DE.AE-01', description: 'Adverse event detection processes are established and managed.' },
            { id: 'DE.AE-02', description: 'Adverse event detection controls are implemented and maintained.' },
            { id: 'DE.AE-03', description: 'Adverse event notification processes are established and managed.' },
            { id: 'DE.AE-04', description: 'Adverse event notification controls are implemented and maintained.' },
          ]
        },
      ]
    },
    {
      name: 'RESPOND',
      abbreviation: 'RS',
      description: 'RESPOND supports the ability to contain the impact of a cybersecurity event and includes appropriate activities.',
      categories: [
        {
          id: 'RS.MA',
          name: 'Incident Management',
          description: 'Incidents are managed to ensure appropriate response and recovery.',
          subcategories: [
            { id: 'RS.MA-01', description: 'Incident management processes are established and managed.' },
            { id: 'RS.MA-02', description: 'Incident management controls are implemented and maintained.' },
            { id: 'RS.MA-03', description: 'Incident notification processes are established and managed.' },
          ]
        },
        {
          id: 'RS.AN',
          name: 'Incident Analysis',
          description: 'Incidents are analyzed to understand their scope, impact, and root cause.',
          subcategories: [
            { id: 'RS.AN-01', description: 'Incident analysis processes are established and managed.' },
            { id: 'RS.AN-02', description: 'Incident analysis controls are implemented and maintained.' },
          ]
        },
        {
          id: 'RS.CO',
          name: 'Incident Response Mitigation',
          description: 'Incidents are mitigated to contain their impact.',
          subcategories: [
            { id: 'RS.CO-01', description: 'Incident mitigation processes are established and managed.' },
            { id: 'RS.CO-02', description: 'Incident mitigation controls are implemented and maintained.' },
          ]
        },
        {
          id: 'RS.RP',
          name: 'Incident Response Reporting',
          description: 'Incident response is reported to internal and external stakeholders.',
          subcategories: [
            { id: 'RS.RP-01', description: 'Incident response reporting processes are established and managed.' },
            { id: 'RS.RP-02', description: 'Incident response reporting controls are implemented and maintained.' },
          ]
        },
      ]
    },
    {
      name: 'RECOVER',
      abbreviation: 'RC',
      description: 'RECOVER supports timely restoration of any capabilities or services that were impaired due to a cybersecurity event.',
      categories: [
        {
          id: 'RC.RP',
          name: 'Incident Recovery Plan Execution',
          description: 'Recovery activities are executed to restore impaired capabilities or services.',
          subcategories: [
            { id: 'RC.RP-01', description: 'Recovery plan execution processes are established and managed.' },
            { id: 'RC.RP-02', description: 'Recovery plan execution controls are implemented and maintained.' },
          ]
        },
        {
          id: 'RC.CO',
          name: 'Incident Recovery Communication',
          description: 'Restoration activities are coordinated with internal and external parties.',
          subcategories: [
            { id: 'RC.CO-01', description: 'Recovery communication processes are established and managed.' },
            { id: 'RC.CO-02', description: 'Recovery communication controls are implemented and maintained.' },
          ]
        },
      ]
    },
  ]
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get the NIST CSF framework ID
    const { data: framework, error: frameworkError } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'NIST CSF')
      .single();

    if (frameworkError || !framework) {
      return new Response(
        JSON.stringify({ error: 'NIST CSF framework not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the source
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', framework.id)
      .single();

    if (sourceError || !source) {
      return new Response(
        JSON.stringify({ error: 'NIST CSF source not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create an ingest job
    const { data: job, error: jobError } = await supabase
      .from('ingest_jobs')
      .insert({
        source_id: source.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (jobError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create ingest job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let documentsIngested = 0;

    // Process each core function
    for (const coreFunction of NIST_CSF_DATA.core_functions) {
      // Create a document for the core function
      const fnContent = `# ${coreFunction.name} Function\n\n${coreFunction.description}\n\nAbbreviation: ${coreFunction.abbreviation}`;
      const fnMeta = {
        function_name: coreFunction.name,
        function_abbreviation: coreFunction.abbreviation,
        version: NIST_CSF_DATA.version,
      };
      const { data: fnDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `NIST CSF 2.0 - ${coreFunction.name} Function`,
        document_type: 'framework',
        url: 'https://www.nist.gov/cyberframework',
        version: NIST_CSF_DATA.version,
        raw_content: fnContent,
        metadata: fnMeta,
        is_indexed: true,
      }).select('id').single();
      if (fnDoc) await insertChunk(fnDoc.id, fnContent, fnMeta);
      documentsIngested++;

      // Process each category within the function
      for (const category of coreFunction.categories) {
        // Create detailed content for the category
        const categoryContent = `# ${category.id} - ${category.name}

## Description
${category.description}

## Function
${coreFunction.name} (${coreFunction.abbreviation})

## Subcategories
${category.subcategories.map(sub => `- **${sub.id}**: ${sub.description}`).join('\n')}
`;

        const catMeta = {
          category_id: category.id,
          category_name: category.name,
          function_name: coreFunction.name,
          function_abbreviation: coreFunction.abbreviation,
          version: NIST_CSF_DATA.version,
        };
        const { data: catDoc } = await supabase.from('documents').insert({
          source_id: source.id,
          framework_id: framework.id,
          title: `${category.id} - ${category.name}`,
          document_type: 'guideline',
          url: 'https://www.nist.gov/cyberframework',
          version: NIST_CSF_DATA.version,
          raw_content: categoryContent,
          metadata: catMeta,
          is_indexed: true,
        }).select('id').single();
        if (catDoc) await insertChunk(catDoc.id, categoryContent, catMeta);
        documentsIngested++;

        // Process each subcategory as a control
        for (const subcategory of category.subcategories) {
          const controlContent = `# ${subcategory.id}

## Category
${category.id} - ${category.name}

## Function
${coreFunction.name} (${coreFunction.abbreviation})

## Description
${subcategory.description}

## Implementation Guidance
Organizations should implement appropriate controls and processes to address this requirement based on their risk profile and business objectives.
`;

          const ctrlMeta = {
            control_id: subcategory.id,
            category_id: category.id,
            category_name: category.name,
            function_name: coreFunction.name,
            function_abbreviation: coreFunction.abbreviation,
            version: NIST_CSF_DATA.version,
          };
          const { data: ctrlDoc } = await supabase.from('documents').insert({
            source_id: source.id,
            framework_id: framework.id,
            title: `${subcategory.id} - ${subcategory.description.slice(0, 80)}...`,
            document_type: 'control',
            url: 'https://www.nist.gov/cyberframework',
            version: NIST_CSF_DATA.version,
            raw_content: controlContent,
            metadata: ctrlMeta,
            is_indexed: true,
          }).select('id').single();
          if (ctrlDoc) await insertChunk(ctrlDoc.id, controlContent, ctrlMeta);
          documentsIngested++;
        }
      }
    }

    // Update the job as completed
    await supabase
      .from('ingest_jobs')
      .update({
        status: 'completed',
        documents_ingested: documentsIngested,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    // Update the source last scraped time
    await supabase
      .from('sources')
      .update({
        last_scraped_at: new Date().toISOString(),
        next_refresh_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .eq('id', source.id);

    return new Response(
      JSON.stringify({
        success: true,
        documents_ingested: documentsIngested,
        message: 'NIST CSF 2.0 framework ingested successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
