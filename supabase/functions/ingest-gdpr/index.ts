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

interface GdprArticle {
  article_number: string;
  chapter_number: string;
  chapter_name: string;
  category: string;
  title: string;
  raw_content: string;
}

const ARTICLES: GdprArticle[] = [
  // ── Chapter I — General Provisions ──────────────────────────────────────
  {
    article_number: '1',
    chapter_number: 'I',
    chapter_name: 'General Provisions',
    category: 'scope',
    title: 'Article 1 — Subject-Matter and Objectives',
    raw_content: 'GDPR Article 1 establishes the regulation\'s dual objectives: protecting natural persons with regard to the processing of personal data and ensuring the free movement of such data within the EU. It affirms that the protection of natural persons is a fundamental right, while prohibiting restrictions on the free flow of personal data within the Union for reasons related to that protection, subject only to the regulation\'s own provisions.',
  },
  {
    article_number: '2',
    chapter_number: 'I',
    chapter_name: 'General Provisions',
    category: 'scope',
    title: 'Article 2 — Material Scope',
    raw_content: 'GDPR Article 2 defines the material scope: it applies to the processing of personal data wholly or partly by automated means, and to manual processing where data forms part of a structured filing system. Key exclusions include processing for national security, law enforcement (covered by the Law Enforcement Directive), and purely personal or household activities. Member State institutions and bodies processing data are also outside this regulation\'s direct scope.',
  },
  {
    article_number: '3',
    chapter_number: 'I',
    chapter_name: 'General Provisions',
    category: 'scope',
    title: 'Article 3 — Territorial Scope',
    raw_content: 'GDPR Article 3 establishes broad extraterritorial reach. It applies to processing by controllers or processors established in the EU regardless of where processing occurs. It also applies to non-EU controllers or processors targeting EU data subjects by offering goods or services (even free) or by monitoring their behaviour within the EU. Controllers outside the EU must designate an EU representative unless processing is occasional and low-risk.',
  },
  {
    article_number: '4',
    chapter_number: 'I',
    chapter_name: 'General Provisions',
    category: 'definitions',
    title: 'Article 4 — Definitions',
    raw_content: 'GDPR Article 4 defines key terms: personal data (any information relating to an identified or identifiable natural person); processing (any operation performed on personal data); controller (entity determining purposes and means of processing); processor (entity processing on behalf of the controller); data subject (identified or identifiable natural person); consent (freely given, specific, informed, unambiguous indication of agreement); pseudonymisation; filing system; supervisory authority; and binding corporate rules.',
  },

  // ── Chapter II — Principles ──────────────────────────────────────────────
  {
    article_number: '5',
    chapter_number: 'II',
    chapter_name: 'Principles',
    category: 'principles',
    title: 'Article 5 — Principles Relating to Processing of Personal Data',
    raw_content: 'GDPR Article 5 sets out seven core principles: (1) lawfulness, fairness, and transparency; (2) purpose limitation — data collected for specified, explicit, legitimate purposes and not further processed incompatibly; (3) data minimisation — adequate, relevant, and limited to what is necessary; (4) accuracy — kept up to date; (5) storage limitation — retained no longer than necessary; (6) integrity and confidentiality — processed securely; (7) accountability — the controller bears responsibility for and must demonstrate compliance with all these principles.',
  },
  {
    article_number: '6',
    chapter_number: 'II',
    chapter_name: 'Principles',
    category: 'principles',
    title: 'Article 6 — Lawfulness of Processing',
    raw_content: 'GDPR Article 6 defines six legal bases for processing personal data: (1) consent of the data subject; (2) necessity for performance of a contract with the data subject; (3) compliance with a legal obligation; (4) protection of vital interests; (5) performance of a task in the public interest or official authority; (6) legitimate interests of the controller or third party, except where overridden by the data subject\'s rights. Processing lacking one of these bases is unlawful.',
  },
  {
    article_number: '7',
    chapter_number: 'II',
    chapter_name: 'Principles',
    category: 'principles',
    title: 'Article 7 — Conditions for Consent',
    raw_content: 'GDPR Article 7 sets strict conditions when consent is the legal basis for processing. Consent must be freely given, specific, informed, and unambiguous — indicated by a clear affirmative act. The controller bears the burden of proof for demonstrating valid consent. Consent must be as easy to withdraw as to give, and withdrawal does not affect the lawfulness of prior processing. Consent bundled with service terms as a condition of a contract is generally not freely given.',
  },
  {
    article_number: '9',
    chapter_number: 'II',
    chapter_name: 'Principles',
    category: 'principles',
    title: 'Article 9 — Processing of Special Categories of Personal Data',
    raw_content: 'GDPR Article 9 prohibits processing of special categories: racial or ethnic origin, political opinions, religious beliefs, trade union membership, genetic data, biometric data for unique identification, health data, sex life or sexual orientation data. Exceptions include explicit consent, employment/social security law, vital interests when the subject is incapacitated, non-profit organisation purposes, publicly made data, legal claims, public interest, medical purposes, public health, and archiving/research with appropriate safeguards.',
  },

  // ── Chapter III — Rights of the Data Subject ─────────────────────────────
  {
    article_number: '12',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: 'Article 12 — Transparent Information, Communication and Modalities',
    raw_content: 'GDPR Article 12 requires controllers to provide information and communications in a concise, transparent, intelligible, and easily accessible form, using clear and plain language. Controllers must respond to data subject requests without undue delay and within one month (extendable to three months for complex/numerous requests with notice). Information and actions under Articles 15–22 must be provided free of charge. Where requests are manifestly unfounded or excessive, a reasonable fee or refusal is permitted.',
  },
  {
    article_number: '13',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: 'Article 13 — Information to Be Provided Where Personal Data Are Collected',
    raw_content: 'GDPR Article 13 requires controllers to provide data subjects with specific information at the time of collection: the controller\'s identity and contact details; DPO contact; processing purposes and legal basis; legitimate interests relied upon; recipients or categories of recipients; international transfer details; retention period; the existence of rights to access, rectification, erasure, restriction, portability, and objection; right to withdraw consent; right to lodge a supervisory authority complaint; and existence of automated decision-making.',
  },
  {
    article_number: '15',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: 'Article 15 — Right of Access by the Data Subject',
    raw_content: 'GDPR Article 15 grants data subjects the right to obtain confirmation from a controller as to whether their personal data are being processed, and if so, access to the data and supplementary information including: processing purposes, categories of data, recipients, retention period, rights to rectification/erasure/restriction/objection, right to lodge a complaint, source of the data if not collected directly, and existence of automated decision-making. The first copy of data must be provided free of charge.',
  },
  {
    article_number: '16',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: 'Article 16 — Right to Rectification',
    raw_content: 'GDPR Article 16 grants data subjects the right to obtain from the controller, without undue delay, the rectification of inaccurate personal data concerning them. Taking into account the purposes of the processing, the data subject also has the right to have incomplete personal data completed, including by means of providing a supplementary statement.',
  },
  {
    article_number: '17',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: "Article 17 — Right to Erasure ('Right to Be Forgotten')",
    raw_content: "GDPR Article 17 grants data subjects the right to obtain erasure of personal data without undue delay where: data are no longer necessary for original purposes; consent is withdrawn and no other legal basis applies; the subject objects and there are no overriding legitimate grounds; data were unlawfully processed; or erasure is required by EU or Member State law. The controller who made data public must take reasonable steps to inform other controllers. Exceptions include freedom of expression, legal obligations, public interest, and scientific/research purposes.",
  },
  {
    article_number: '18',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: 'Article 18 — Right to Restriction of Processing',
    raw_content: 'GDPR Article 18 grants data subjects the right to obtain restriction of processing where: the accuracy of data is contested (restriction during verification); processing is unlawful but the subject opposes erasure; the controller no longer needs the data but the subject requires them for legal claims; or the subject has objected to processing pending verification of whether controller legitimate grounds override. Restricted data may only be stored; further processing requires consent or legal claims purposes. The subject must be informed before restriction is lifted.',
  },
  {
    article_number: '20',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: 'Article 20 — Right to Data Portability',
    raw_content: 'GDPR Article 20 grants data subjects the right to receive personal data they provided to a controller in a structured, commonly used, machine-readable format, and the right to transmit that data to another controller without hindrance. This applies when processing is based on consent or a contract and is carried out by automated means. Where technically feasible, the subject can request direct controller-to-controller transfer. The right must not adversely affect the rights and freedoms of others.',
  },
  {
    article_number: '21',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: 'Article 21 — Right to Object',
    raw_content: 'GDPR Article 21 grants data subjects the right to object to processing based on legitimate interests (Art. 6(1)(e)/(f)), including profiling. The controller must cease processing unless it demonstrates compelling legitimate grounds that override the subject\'s interests. The right to object to direct marketing is absolute — no balancing test applies and processing must cease immediately upon objection. At first communication, the right to object must be explicitly brought to the subject\'s attention and presented clearly and separately.',
  },
  {
    article_number: '22',
    chapter_number: 'III',
    chapter_name: 'Rights of the Data Subject',
    category: 'rights',
    title: 'Article 22 — Automated Individual Decision-Making, Including Profiling',
    raw_content: 'GDPR Article 22 gives data subjects the right not to be subject to a decision based solely on automated processing — including profiling — that produces significant effects concerning them. Exceptions apply when necessary for a contract, authorised by law, or based on explicit consent. In exception cases, controllers must implement suitable safeguards including the right to obtain human intervention, to express their point of view, and to contest the decision. Processing of special category data for solely automated decisions requires explicit consent or substantial public interest.',
  },

  // ── Chapter IV — Controller and Processor Obligations ────────────────────
  {
    article_number: '24',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 24 — Responsibility of the Controller',
    raw_content: 'GDPR Article 24 requires controllers to implement appropriate technical and organisational measures to ensure and demonstrate that processing is performed in accordance with the Regulation. Measures must be reviewed and updated as necessary. A data protection policy must be implemented where proportionate. Adherence to approved codes of conduct or certification mechanisms may be used to demonstrate compliance. The controller bears ultimate responsibility for all processing activities, including those carried out by processors on their behalf.',
  },
  {
    article_number: '25',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 25 — Data Protection by Design and by Default',
    raw_content: 'GDPR Article 25 mandates privacy by design and by default. Controllers must, both at the time of determining means of processing and at the time of processing itself, implement appropriate technical and organisational measures designed to implement data protection principles. By default, only personal data necessary for each specific purpose should be processed — this applies to the amount collected, extent of processing, storage period, and accessibility. These obligations may be evidenced through approved certification mechanisms.',
  },
  {
    article_number: '28',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 28 — Processor',
    raw_content: 'GDPR Article 28 requires controllers to use only processors providing sufficient guarantees to implement appropriate technical and organisational measures. Processing by a processor must be governed by a Data Processing Agreement (DPA) binding the processor to: act only on documented controller instructions; ensure confidentiality; implement required security measures; respect sub-processor requirements; assist the controller with data subject rights; assist with security/breach/DPIA obligations; delete or return data on termination; and provide all information necessary to demonstrate compliance.',
  },
  {
    article_number: '30',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 30 — Records of Processing Activities',
    raw_content: 'GDPR Article 30 requires controllers and processors to maintain written records of processing activities. Controller records must include: controller name/contact; processing purposes; categories of data subjects and personal data; recipients; third-country transfers; retention periods; and security measures. Processor records must include: processor and controller name/contact; categories of processing; third-country transfers; and security measures. Records must be made available to supervisory authorities on request. Organisations with fewer than 250 employees are exempt unless processing is regular or involves special categories or criminal offence data.',
  },
  {
    article_number: '32',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 32 — Security of Processing',
    raw_content: 'GDPR Article 32 requires controllers and processors to implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk. Measures include: pseudonymisation and encryption of personal data; ability to ensure ongoing confidentiality, integrity, availability, and resilience; ability to restore access after incidents; and a process for regular testing and evaluation of effectiveness. The appropriate level of security is determined considering risks — accidental or unlawful destruction, loss, alteration, or unauthorised disclosure or access.',
  },
  {
    article_number: '33',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 33 — Notification of a Personal Data Breach to the Supervisory Authority',
    raw_content: 'GDPR Article 33 requires controllers to notify the competent supervisory authority of a personal data breach without undue delay and, where feasible, within 72 hours of becoming aware. Notification must include: nature of the breach; categories and approximate numbers of data subjects and records affected; DPO or other contact details; likely consequences; and measures taken or proposed. Notification may be phased if all information is not available immediately. Processors must notify controllers without undue delay. All breaches must be documented by the controller.',
  },
  {
    article_number: '34',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 34 — Communication of a Personal Data Breach to the Data Subject',
    raw_content: 'GDPR Article 34 requires controllers to communicate a personal data breach to affected data subjects without undue delay when the breach is likely to result in a high risk to their rights and freedoms. Communication must describe the nature of the breach in clear, plain language and include DPO contact details, likely consequences, and measures taken or proposed. Communication is not required if: appropriate technical/organisational protection was applied (e.g., encryption); subsequent measures have ensured high risk no longer materialises; or individual communication would involve disproportionate effort (public communication may substitute).',
  },
  {
    article_number: '35',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 35 — Data Protection Impact Assessment',
    raw_content: 'GDPR Article 35 requires a Data Protection Impact Assessment (DPIA) prior to processing likely to result in high risk, particularly when using new technologies. A DPIA is mandatory for: systematic and extensive profiling with significant effects; large-scale processing of special categories; and systematic monitoring of publicly accessible areas. The DPIA must include: a systematic description of processing and purposes; assessment of necessity and proportionality; assessment of risks to data subjects; and measures to address the risks. Where residual high risk remains, prior consultation with the supervisory authority is required under Article 36.',
  },
  {
    article_number: '37',
    chapter_number: 'IV',
    chapter_name: 'Controller and Processor',
    category: 'obligations',
    title: 'Article 37 — Designation of the Data Protection Officer',
    raw_content: 'GDPR Article 37 mandates designation of a Data Protection Officer (DPO) when: the controller or processor is a public authority or body; core activities consist of large-scale systematic monitoring of data subjects; or core activities consist of large-scale processing of special categories or criminal offence data. The DPO may be a staff member or an external service provider, must have expert knowledge of data protection law, and must be supported with resources and access to personal data and processing operations. DPO contact details must be published and communicated to supervisory authorities.',
  },

  // ── Chapter VIII — Remedies, Liability, Penalties ────────────────────────
  {
    article_number: '83',
    chapter_number: 'VIII',
    chapter_name: 'Remedies, Liability and Penalties',
    category: 'penalties',
    title: 'Article 83 — General Conditions for Imposing Administrative Fines',
    raw_content: 'GDPR Article 83 establishes two tiers of administrative fines. Tier 1 (up to €10M or 2% of global annual turnover, whichever is higher) applies to violations of controller/processor obligations, certification bodies, and monitoring bodies. Tier 2 (up to €20M or 4% of global annual turnover) applies to violations of basic principles, conditions for consent, data subjects\' rights, international transfer provisions, and supervisory authority orders. Factors determining fine amounts include: nature, gravity, and duration of the infringement; intentionality; mitigation steps taken; technical/organisational measures; prior infringements; and cooperation with the supervisory authority.',
  },
];

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  const data = await res.json();
  return data.data[0].embedding;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── 1. Look up or create the framework ──────────────────────────────────
    let frameworkId: string;
    const { data: existingFramework, error: fwLookupErr } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'GDPR')
      .maybeSingle();

    if (fwLookupErr) throw new Error(`Framework lookup failed: ${fwLookupErr.message}`);

    if (existingFramework) {
      frameworkId = existingFramework.id;
      console.log(`Found existing framework: ${frameworkId}`);
    } else {
      const { data: newFramework, error: fwInsertErr } = await supabase
        .from('compliance_frameworks')
        .insert({
          name: 'General Data Protection Regulation',
          abbreviation: 'GDPR',
          category: 'sox',
          version: '2018',
          description: 'EU regulation on data protection and privacy for individuals within the EU and EEA',
        })
        .select('id')
        .single();

      if (fwInsertErr) throw new Error(`Framework insert failed: ${fwInsertErr.message}`);
      frameworkId = newFramework.id;
      console.log(`Created new framework: ${frameworkId}`);
    }

    // ── 2. Look up or create the source ─────────────────────────────────────
    let sourceId: string;
    const { data: existingSource, error: srcLookupErr } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', frameworkId)
      .maybeSingle();

    if (srcLookupErr) throw new Error(`Source lookup failed: ${srcLookupErr.message}`);

    if (existingSource) {
      sourceId = existingSource.id;
      console.log(`Found existing source: ${sourceId}`);
    } else {
      const { data: newSource, error: srcInsertErr } = await supabase
        .from('sources')
        .insert({
          framework_id: frameworkId,
          name: 'GDPR — Official EUR-Lex Text',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679',
          source_type: 'webpage',
          scraper_type: 'generic-webpage',
        })
        .select('id')
        .single();

      if (srcInsertErr) throw new Error(`Source insert failed: ${srcInsertErr.message}`);
      sourceId = newSource.id;
      console.log(`Created new source: ${sourceId}`);
    }

    // ── 3. Delete existing docs for idempotency ──────────────────────────────
    const { error: deleteErr } = await supabase
      .from('documents')
      .delete()
      .eq('framework_id', frameworkId)
      .eq("metadata->>'document_level'", 'gdpr-article');

    if (deleteErr) {
      // Fallback: use filter syntax
      const { error: deleteErr2 } = await supabase
        .from('documents')
        .delete()
        .eq('framework_id', frameworkId)
        .filter('metadata->>document_level', 'eq', 'gdpr-article');

      if (deleteErr2) throw new Error(`Delete existing docs failed: ${deleteErr2.message}`);
    }

    console.log('Deleted existing gdpr-article documents');

    // ── 4. Insert documents and embeddings ───────────────────────────────────
    let inserted = 0;
    const errors: string[] = [];

    for (const article of ARTICLES) {
      try {
        // Insert the document
        const { data: doc, error: docErr } = await supabase
          .from('documents')
          .insert({
            source_id: sourceId,
            framework_id: frameworkId,
            title: article.title,
            document_type: 'control',
            raw_content: article.raw_content,
            metadata: {
              document_level: 'gdpr-article',
              article_number: article.article_number,
              chapter_number: article.chapter_number,
              chapter_name: article.chapter_name,
              category: article.category,
            },
            is_indexed: true,
          })
          .select('id')
          .single();

        if (docErr) {
          errors.push(`Art ${article.article_number} doc insert: ${docErr.message}`);
          continue;
        }

        // Generate and insert embedding
        const embeddingText = `${article.title}\n\n${article.raw_content}`;
        const embedding = await getEmbedding(embeddingText);

        const { error: chunkErr } = await supabase
          .from('document_chunks')
          .insert({
            document_id: doc.id,
            chunk_index: 0,
            content: embeddingText,
            embedding,
            metadata: {
              document_level: 'gdpr-article',
              article_number: article.article_number,
              chapter_number: article.chapter_number,
              chapter_name: article.chapter_name,
              category: article.category,
            },
          });

        if (chunkErr) {
          errors.push(`Art ${article.article_number} chunk insert: ${chunkErr.message}`);
          continue;
        }

        inserted++;
        console.log(`Inserted Article ${article.article_number}: ${article.title}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Art ${article.article_number}: ${msg}`);
      }
    }

    const summary = { framework_id: frameworkId, inserted, errors };
    console.log('Ingest complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Fatal error:', message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
