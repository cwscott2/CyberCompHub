import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  const data = await response.json();
  if (!data.data?.[0]?.embedding) throw new Error(`Embedding failed: ${JSON.stringify(data)}`);
  return data.data[0].embedding;
}

async function insertChunk(documentId: string, content: string, embedding: number[]) {
  await supabase.from('document_chunks').insert({
    document_id: documentId, chunk_index: 0, content, embedding,
  });
}

const EU_AI_ACT_ENHANCED_DATA = [
  {
    id: 'EU-AI-ART1-2',
    category: 'Title I — Scope and Definitions',
    title: 'Subject Matter and Territorial Scope (Articles 1-2)',
    guidance: `The EU AI Act establishes harmonized rules for the development, placing on the market, putting into service, and use of AI systems in the Union. Its territorial scope is explicitly extraterritorial, mirroring the GDPR's approach: the Act applies wherever the output of an AI system is used within the EU, regardless of where the provider or deployer is established.

Article 2 defines who is covered. Providers who place AI systems on the EU market or put them into service in the EU are subject to the Act regardless of their country of establishment. Deployers of AI systems located in the EU fall within scope. Importers and distributors of AI systems are also covered, as are product manufacturers who place an AI system on the market under their own name or trademark. Third-country providers and deployers are covered when the output produced by the AI system is used in the Union.

Exemptions are carefully scoped. AI systems exclusively developed or used for military, national security, or defence purposes are excluded from scope — this is a complete exclusion, not a derogation. AI systems used for the sole purpose of research and development prior to being placed on the market are also excluded, though once commercialised the Act applies in full. Personal non-professional use by natural persons is excluded. AI systems that are components of large-scale IT systems established by Union law in the area of freedom, security and justice are addressed through specific provisions rather than exclusion.

For organisations with global operations, the extraterritorial reach means that any AI system whose outputs are consumed by users or affected parties in the EU triggers compliance obligations. A US-based HR software provider whose tool is used by a European subsidiary to screen job applicants must comply with the Act's high-risk requirements under Annex III. Compliance teams should map all AI deployments against the territorial criteria, not just those operated from EU infrastructure.

The Act does not apply to AI systems that are solely used by public authorities of a third country or by international organisations for the purposes of international cooperation or agreements with the Union, provided this is in the interest of the Union and the principles set out in the Act are upheld. This carve-out is narrow and should not be read broadly.`
  },
  {
    id: 'EU-AI-ART3-DEFS',
    category: 'Title I — Scope and Definitions',
    title: 'Key Definitions: AI System, Provider, Deployer, and Core Concepts (Article 3)',
    guidance: `Article 3 contains 44 defined terms that form the interpretive foundation of the entire Act. Practitioners must master the most consequential definitions to correctly scope obligations.

An "AI system" is a machine-based system designed to operate with varying levels of autonomy that may exhibit adaptiveness after deployment and that, for explicit or implicit objectives, infers from the input it receives how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments. The definition references Annex I techniques but the final adopted text moved away from a pure technique-based definition toward a functional definition. Critically, software that follows deterministic rules without any inferential component (e.g., classical rule-based business logic) may fall outside scope.

A "provider" is a natural or legal person, public authority, agency, or other body that develops an AI system or a general-purpose AI model and places it on the market or puts it into service under its own name or trademark, whether for payment or free of charge. Providers bear the heaviest obligations under the Act.

A "deployer" is a natural or legal person, public authority, agency, or other body that uses an AI system under its authority, except where the AI system is used in the course of personal non-professional activity. Deployers have significant but lighter obligations than providers.

"Placing on the market" means the first making available of an AI system or general-purpose AI model on the Union market. "Putting into service" means the supply of an AI system for first use directly to the deployer or for own use in the Union for its intended purpose.

"Substantial modification" means a change to the AI system after its placing on the market or putting into service which affects the compliance of the AI system with this Regulation or results in a modification to the intended purpose. A substantial modification triggers re-evaluation of risk classification and may convert a deployer into a provider. Organisations should document their change management processes to determine when modifications cross the substantial threshold.

"Intended purpose" means the use for which an AI system is intended by the provider, including the specific context and conditions of use, as specified in the information supplied by the provider in the instructions for use, promotional or sales materials. The concept of "reasonably foreseeable misuse" — use that is not intended but can be expected to occur given human behaviour — also informs risk assessment under Article 9, even when such use falls outside the stated intended purpose.`
  },
  {
    id: 'EU-AI-ANNEX1',
    category: 'Title I — Scope and Definitions',
    title: 'Annex I: AI System Definition and Techniques',
    guidance: `Annex I of the EU AI Act originally listed specific techniques that would qualify software as an "AI system." In the final adopted text (Regulation (EU) 2024/1689), the definition was consolidated into Article 3(1) with a functional framing, but Annex I remains important for understanding the regulatory intent around which technologies are targeted.

The techniques historically enumerated and still relevant to scope analysis include: machine learning approaches — supervised, unsupervised, and reinforcement learning — including deep learning; logic and knowledge-based approaches including knowledge representation, inductive logic programming, knowledge bases, inference and deductive engines, expert systems, and symbolic reasoning; statistical approaches, Bayesian estimation, and search and optimisation methods.

The functional definition adopted in the final text is deliberately technology-neutral. It captures current approaches (transformers, diffusion models, large language models) and anticipates future techniques without requiring legislative amendment each time a new approach emerges. The key test is whether the system infers from inputs to generate outputs that influence environments, with some level of autonomy.

Practical scope questions arise frequently: Does a recommendation engine using collaborative filtering qualify? Generally yes, as it infers from patterns. Does a hard-coded rules engine that routes loan applications by deterministic criteria qualify? Generally no, as there is no inference — outputs follow explicit instructions. Does a hybrid system that uses ML for one component and rules for another qualify? The entire system is analysed; if the ML component influences the output, the system likely qualifies.

Organisations should conduct a technology inventory that maps each software system against the functional definition. Documentation should record the basis for any conclusion that a system falls outside scope, as market surveillance authorities may scrutinise such determinations. The burden of demonstrating non-applicability rests on the entity claiming exemption.`
  },
  {
    id: 'EU-AI-ART5-BIOMETRIC',
    category: 'Title II — Prohibited AI Practices',
    title: 'Real-Time Remote Biometric Identification: Law Enforcement Exceptions (Article 5(2)-(4))',
    guidance: `Article 5(1)(h) prohibits the use of real-time remote biometric identification systems in publicly accessible spaces for law enforcement purposes. However, Article 5(2) carves out three narrow exceptions where such systems may be used. Understanding the precise scope of each exception is critical for law enforcement agencies and technology providers serving them.

The first exception covers the targeted search for specific victims of abduction, trafficking, or sexual exploitation, as well as the search for missing persons. This is limited to identified individuals and cannot be used for mass surveillance even in a crisis.

The second exception covers the prevention of a specific, substantial, and imminent threat to the life or physical safety of natural persons, or of a terrorist attack. The threat must be specific (not general elevated alert levels), substantial (not merely possible), and imminent (temporally proximate). Retrospective use does not qualify.

The third exception permits use in connection with the prosecution of criminal offences referenced in Council Framework Decision 2002/584/JHA — the European Arrest Warrant offences — which include terrorism, trafficking, murder, kidnapping, rape, robbery, and corruption, among others. Critically, this only applies where these offences are punishable by custodial sentences of a maximum of at least three years and where the offence has already been committed (not merely anticipated).

For all three exceptions, prior authorisation from a judicial authority or independent administrative authority is required, except in cases of urgency. Post-hoc authorisation must be sought within 24 hours in urgent cases. If no authorisation is granted, the use must cease immediately and all data must be deleted.

Authorisation requests must be reasoned and supported by evidence. Each use must be geographically and temporally limited to what is strictly necessary. Member States may choose to impose stricter limitations or not to permit use of any of the exceptions at all. No EU-wide database of authorised uses is required, but each Member State must establish national rules for the prior authorisation procedure.

Technology providers supplying real-time RBI systems to law enforcement must ensure systems are designed for the narrow permitted use cases and must provide technical controls that enforce geographic and temporal limitations.`
  },
  {
    id: 'EU-AI-ART5-EMOTION',
    category: 'Title II — Prohibited AI Practices',
    title: 'Emotion Recognition Prohibition: Scope, Exemptions, and Boundary Cases (Article 5(1)(f))',
    guidance: `Article 5(1)(f) prohibits AI systems that infer emotions of natural persons in the workplace and in education institutions. This prohibition targets a category of technology — sometimes called "affective computing" — that claims to detect emotional states from facial expressions, voice patterns, body language, or physiological signals.

The prohibition applies in two specific contexts: the workplace, which includes any setting where a natural person carries out employment, self-employment, or voluntary work activities; and educational institutions, defined broadly to include schools, universities, vocational training centres, and similar establishments. The prohibition applies regardless of who deploys the system — employer, educational institution, or a third-party service provider.

What constitutes "emotion recognition" for purposes of the prohibition? Systems that infer valence (positive/negative affect), arousal levels, specific named emotions (happiness, anger, sadness, fear, surprise, disgust), engagement levels interpreted as emotional states, or stress levels all fall within scope. The prohibition targets the inference of emotional states, not merely biometric data collection.

The exemptions are narrow. Medical or safety purposes explicitly provided for are excluded — for example, systems that detect drowsiness in vehicle operators for safety reasons, or medical diagnostic tools that use facial analysis as part of clinical assessment of neurological conditions. These exemptions are not general safety carve-outs; they must be specifically provided for and must be the primary purpose of the system.

Boundary cases requiring careful analysis include: attention tracking in online learning platforms (likely prohibited if the attention metric is derived from emotional inference), wellbeing check-in tools that use facial analysis to assess mood (likely prohibited in workplace contexts), and customer sentiment analysis tools used to coach call centre employees (likely prohibited as it operates in the workplace context).

Organisations currently deploying emotion recognition tools in covered contexts must remove or disable these features before the prohibition takes effect (six months after entry into force). Procurement contracts for HR technology, e-learning platforms, and productivity tools should be reviewed for emotion recognition components.`
  },
  {
    id: 'EU-AI-ART5-SOCIAL',
    category: 'Title II — Prohibited AI Practices',
    title: 'Social Scoring Prohibition: Public and Private Scope (Article 5(1)(c)-(d))',
    guidance: `Article 5(1)(c) prohibits AI systems used by or on behalf of public authorities to evaluate or classify natural persons or groups based on their social behaviour or known, inferred, or predicted personal or personality characteristics, where the resulting social score leads to detrimental or unfavourable treatment of those persons in social contexts unrelated to the context in which the data was originally generated, or to detrimental or unfavourable treatment that is unjustified or disproportionate to the social behaviour or its gravity.

The prohibition has two distinct elements: first, the scoring must involve evaluation based on social behaviour or personal characteristics; second, the score must cause either cross-contextual harm (using data from one context to disadvantage someone in another) or disproportionate harm.

The term "public authorities" encompasses central and regional government bodies, law enforcement agencies, courts, and public service providers. Systems operated by private entities on behalf of public authorities — for example, outsourced welfare benefit fraud detection — also fall within scope.

Article 5(1)(d) extends a related prohibition to AI systems used to assess or predict the risk of persons committing a criminal offence based solely on profiling or on assessing their personality traits and characteristics, where such assessments are not based on objective and verifiable facts directly linked to the criminal activity. This targets predictive policing tools that rely on demographic profiling rather than specific evidence.

Private sector social scoring is not explicitly captured by Article 5(1)(c), but deployers must assess whether their scoring systems meet the conditions of the prohibition when operating for or on behalf of public bodies. Private credit scoring, insurance risk assessment, and behavioural marketing are not prohibited by Article 5 but may fall under high-risk classification requirements and are subject to GDPR's Article 22 restrictions on automated decision-making.

Organisations must audit all risk-scoring, prioritisation, and classification systems applied to natural persons to determine whether they exhibit the characteristics of social scoring. Documentation of the purpose, data sources, contextual scope, and proportionality analysis should be maintained.`
  },
  {
    id: 'EU-AI-ART16',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Provider Obligations Overview (Article 16)',
    guidance: `Article 16 sets out the comprehensive list of obligations that providers of high-risk AI systems must fulfil before placing a system on the market or putting it into service, and on an ongoing basis thereafter. These obligations form the backbone of the compliance regime for high-risk AI.

Providers must ensure their AI systems comply with the requirements of Articles 9 through 15 (risk management, data governance, technical documentation, logging, transparency, human oversight, and accuracy/robustness/cybersecurity). This compliance must be demonstrated before market placement.

Providers must have in place a quality management system meeting the requirements of Article 17. The QMS is not optional — it is a prerequisite for compliance.

Providers must draw up technical documentation in accordance with Article 11 and Annex IV. This documentation must be prepared before the system is placed on the market and maintained throughout its lifecycle.

When a conformity assessment procedure has been completed with a positive outcome, providers must draw up an EU declaration of conformity in accordance with Article 47 and affix the CE marking in accordance with Article 48. The CE marking signals compliance to market surveillance authorities and to the public.

Providers must comply with the registration obligations under Article 71, entering their systems in the EU database. This obligation applies to all providers of high-risk AI systems, including those established outside the EU (who must appoint an authorised representative).

Providers must take the necessary corrective actions and provide information as required by Article 20, including notifying market surveillance authorities of serious incidents and corrective actions taken.

Post-market monitoring under Article 72 is a continuing obligation — providers must actively collect and review data on system performance throughout the system's lifetime, using the post-market monitoring plan developed as part of the QMS.

For providers established outside the EU, all these obligations are channelled through an authorised representative established in the Union, who acts as the primary regulatory contact.`
  },
  {
    id: 'EU-AI-ART17',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Quality Management System Requirements (Article 17)',
    guidance: `Article 17 requires providers of high-risk AI systems to put in place a quality management system (QMS) that ensures and demonstrates compliance with the Act. The QMS must be documented in a systematic and orderly manner in the form of written policies, procedures, and instructions.

The QMS must address the following elements: a strategy for regulatory compliance, including compliance with conformity assessment procedures and management of modifications to high-risk AI systems; techniques, procedures, and systematic actions to be used for the design, design control, and design verification of the high-risk AI system; techniques and procedures for development, quality control, and quality assurance; examination, test, and validation procedures to be carried out before, during, and after development; technical specifications, including standards, that are to be applied; systems and procedures for data management, including data collection, analysis, and annotation; the risk management system referred to in Article 9; setting up, implementation, and maintenance of a post-market monitoring system; procedures related to the reporting of serious incidents and their follow-up; handling of communication with national competent authorities, other relevant authorities, notified bodies, other operators, customers, or other interested parties; systems and procedures for record keeping; resource management, including supply chain security measures; an accountability framework including responsibilities, competencies, and management structures.

For SMEs and startups, Article 17(3) provides that providers may fulfil the QMS requirements in a proportionate manner. The elements listed above must all be addressed, but the formality, documentation depth, and governance structures can be scaled to the size and risk profile of the organisation. Regulators and notified bodies will assess proportionality in context.

The QMS is not a one-time exercise. It must be reviewed and updated in response to changes to the AI system, changes in the regulatory environment, incidents, audit findings, and post-market monitoring data. Internal audit procedures for the QMS itself should be documented.

Providers that already have ISO 9001 or comparable QMS certifications should map their existing systems to Article 17 requirements. While ISO 9001 provides a useful foundation, AI-specific additions — particularly around data governance, risk management for AI, and post-market monitoring — will need to be built out.`
  },
  {
    id: 'EU-AI-ART18',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Technical Documentation Retention (Article 18)',
    guidance: `Article 18 establishes retention obligations for the technical documentation that providers must prepare under Article 11 and Annex IV. This documentation must be kept available to competent authorities for a period of ten years after the high-risk AI system has been placed on the market or put into service.

The ten-year period runs from the date the specific version or release of the system was placed on the market or put into service, not from the date the provider ceases to offer the product. This means documentation obligations persist long after a system is discontinued. For AI systems with rolling deployments or continuous updates, providers should establish version-specific documentation records with clear dating.

When a provider ceases to exist before the end of the retention period, responsibility for technical documentation is addressed through the transfer provisions. If another company acquires the provider's assets or business, the acquiring entity assumes the documentation obligations. If no such transfer occurs, the last operator holding the documentation has obligations under applicable national law.

The regulation requires that documentation be kept in a form that allows competent authorities to assess compliance at any point during the retention period. Documentation that degrades in accessibility — for example, stored in deprecated file formats or on hardware that becomes unreadable — does not satisfy this requirement. Providers should establish document management procedures ensuring long-term accessibility, including format migration as technology changes.

What must be retained encompasses: all versions of the Annex IV technical documentation; records of the conformity assessment procedure; the EU declaration of conformity; significant incident records and corrective action documentation; post-market monitoring reports; and records of any substantial modifications assessed and their outcomes.

For providers established outside the EU, the authorised representative in the Union must have access to the technical documentation and must be able to provide it to authorities on request. This effectively requires that either the documentation be held within the EU or the authorised representative has guaranteed remote access.`
  },
  {
    id: 'EU-AI-ART19',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Automatic Logging and Log Retention (Article 19)',
    guidance: `Article 19 requires that high-risk AI systems be designed and developed with automatic logging capabilities that allow for the recording of events throughout the system's lifetime. These logs support post-market monitoring, incident investigation, and regulatory audit.

The logging requirements are designed to ensure traceability of the AI system's decisions and outputs over time. Logs must capture: the period of each use of the system (date and time); the reference database against which the system's input data was checked (where applicable); the input data or reference data relevant to the output (where technically feasible and appropriate); the identity of the natural persons involved in the verification of the results (for biometric identification systems).

Retention periods differ by system type. For high-risk AI systems used by public authorities in biometric identification, access control, or critical infrastructure, the minimum log retention period is six months. For other high-risk AI systems, logs must be retained for as long as can reasonably be expected to be necessary for the intended purpose, with deployers having primary responsibility for determining and implementing appropriate retention in accordance with EU and national law (including applicable GDPR retention limitations).

The responsibility for log generation lies with the provider, who must build the capability into the system. The responsibility for log retention and management typically lies with the deployer, who controls the deployment environment. Instructions for use provided by the provider must specify the logging capabilities, the type of information logged, and recommended retention periods.

Deployers subject to GDPR must reconcile log retention with data minimisation and storage limitation principles. Logs that contain personal data — which many AI system logs will — must be retained only as long as necessary and must be protected with appropriate security measures. A data protection impact assessment (DPIA) for the logging system itself may be required.

Immutability of logs is an implicit requirement — logs that can be modified after the fact do not serve their evidentiary function. Technical controls (cryptographic signing, write-once storage, audit trails of access to logs) should be implemented to ensure integrity.`
  },
  {
    id: 'EU-AI-ART20',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Corrective Actions and Duty to Inform (Article 20)',
    guidance: `Article 20 establishes the obligation for providers of high-risk AI systems to take corrective actions when they have reason to believe that a system placed on the market or put into service does not conform to the requirements of the Act, and to inform the relevant authorities and other operators in the supply chain.

When a provider determines — through post-market monitoring, incident reports, authority notifications, or any other means — that a high-risk AI system is not in conformity with the Act, they must immediately take the necessary corrective actions to bring it into conformity, withdraw it, or recall it. The choice of action depends on the nature and severity of the non-conformity and whether conformity can be achieved through update or modification.

Concurrently, the provider must notify distributors, importers, deployers, and other operators to whom they have supplied the system, informing them of the non-conformity and any corrective actions taken. This notification enables downstream operators to take their own steps — pausing use, notifying their own customers, or implementing mitigations.

Where non-conformity presents a risk, the provider must notify the national market surveillance authority in the Member States in which the system was made available. The notification must include details of the non-conformity, the risk presented, the corrective actions taken, and where corrective action cannot remedy the situation, the withdrawal or recall.

The corrective action duty extends to providers who learn of serious incidents (defined in Article 3 as events that directly or indirectly lead to death, serious health damage, serious disruption of essential services, or breach of fundamental rights obligations under Union law). Serious incident reporting obligations run in parallel and are addressed in Articles 73-74.

Providers must maintain a written record of corrective actions taken, including the nature of the non-conformity identified, the risk assessment conducted, the corrective measures implemented, and the outcome of verification that the corrective measures achieved conformity. This record forms part of the technical documentation and is subject to the ten-year retention requirement.`
  },
  {
    id: 'EU-AI-ART21',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Cooperation with Competent Authorities (Article 21)',
    guidance: `Article 21 establishes a general duty for providers of high-risk AI systems to cooperate with national competent authorities and the European AI Office when requested. This duty is not contingent on a finding of non-compliance — it applies as a baseline obligation for any provider whose system is subject to the Act.

Cooperation obligations include: responding to requests for information and documentation from market surveillance authorities; providing access to the AI system, its documentation, and its training, validation, and testing data sets as required for the purpose of market surveillance; taking corrective actions when required by authorities; withdrawing or recalling systems when ordered; and facilitating testing and audits of the AI system.

The duty to provide access to training data and source code is one of the most operationally significant aspects of cooperation. Article 64 gives national authorities the power to request access to these materials — potentially including proprietary datasets and algorithmic architecture — to the extent necessary to assess compliance. Providers with significant trade secret concerns should understand that the Act provides protections: information obtained by authorities in the course of market surveillance is subject to confidentiality obligations and cannot be disclosed except as necessary for enforcement.

Providers established outside the EU carry out cooperation obligations through their authorised representative in the Union. The authorised representative must have been given the mandate and the technical means to fulfil these obligations, including access to documentation and the ability to communicate on behalf of the provider.

Timeliness is an implicit expectation. Market surveillance activities may involve time-sensitive safety concerns, and providers that delay or obstruct cooperation risk enforcement action independent of any underlying compliance issues. Providers should designate a regulatory affairs contact and establish internal procedures for receiving, acknowledging, and responding to authority requests within appropriate timeframes.

Proactive cooperation — for example, notifying authorities of discovered issues before being asked — is considered good regulatory practice and can be a mitigating factor in penalty determinations.`
  },
  {
    id: 'EU-AI-ART26',
    category: 'Title III Chapter 3 — Deployer Obligations',
    title: 'Deployer Obligations for High-Risk AI Systems (Article 26)',
    guidance: `Article 26 establishes the obligations that deployers of high-risk AI systems must fulfil when using such systems in their operations. While lighter than provider obligations, deployer duties are substantive and failure to comply carries significant penalties.

Deployers must use high-risk AI systems in accordance with the instructions for use provided by the provider. The instructions for use are the primary instrument through which providers communicate the conditions, limitations, and requirements of proper deployment. Deployers who use systems outside the scope of the instructions — applying them to use cases not covered, exceeding stated operational conditions, or disabling safeguards — bear enhanced responsibility for resulting non-compliance and may, in some cases, become providers themselves.

Deployers must assign human oversight to natural persons with the necessary competence, authority, and resources to exercise meaningful oversight. This is not merely a governance formality — the human overseer must be capable of understanding the system's outputs, detecting failures, and intervening. The provider's instructions for use must specify the qualifications needed; deployers must ensure the designated overseer meets them.

Deployers must monitor the operation of the high-risk AI system on the basis of the instructions for use and inform the provider, importer, or distributor when they have reason to believe that the system presents a risk or is not performing as intended. The monitoring obligation is ongoing, not merely at deployment.

Deployers must keep logs generated by the AI system for the periods specified by the provider and applicable law, and must make these logs available to competent authorities on request.

Deployers who are public bodies or private bodies providing publicly available services must conduct a fundamental rights impact assessment (FRIA) under Article 27 before deploying certain categories of high-risk AI systems. The FRIA obligation is separate from and in addition to the deployer obligations listed in Article 26.

When a deployer makes substantial modifications to a high-risk AI system, or uses it for a purpose not covered by the EU declaration of conformity, that deployer is treated as a provider for the modified system and assumes full provider obligations.`
  },
  {
    id: 'EU-AI-ART27',
    category: 'Title III Chapter 3 — Deployer Obligations',
    title: 'Fundamental Rights Impact Assessment (Article 27)',
    guidance: `Article 27 requires deployers that are bodies governed by public law, or private entities providing services to the public in areas including education, healthcare, banking, housing, and social benefits, to conduct a fundamental rights impact assessment (FRIA) before deploying high-risk AI systems falling under certain categories in Annex III.

The FRIA obligation applies specifically to deployers using high-risk AI systems in the following Annex III categories: biometric identification; critical infrastructure management; education and vocational training; employment and workers management; essential private and public services; law enforcement; migration, asylum, and border control; administration of justice. Not all Annex III categories trigger the FRIA obligation for all deployers — the requirement focuses on contexts where fundamental rights impacts are most acute.

A compliant FRIA must cover: a description of the deployer's processes in which the high-risk AI system will be used, and the purposes and conditions for which it is used; a description of the period and frequency of use; the categories of natural persons and groups likely to be affected; the specific risks of harm likely to impact those persons; a description of implementation measures to address identified risks, including the human oversight measures and complaints handling; a list of the relevant persons, units, or services involved in the assessment.

The FRIA must be submitted to the relevant market surveillance authority before the system is put into service. This proactive notification distinguishes the FRIA from a purely internal document — it is a regulatory filing with a supervisory function. Authorities may request additional information or raise concerns based on the FRIA submission.

The relationship between the FRIA and GDPR Data Protection Impact Assessments (DPIAs) requires careful management. Where processing of personal data is involved, a DPIA is also likely required. The two assessments have overlapping but not identical scope: the DPIA focuses on data protection risks; the FRIA addresses the broader spectrum of fundamental rights. Some organisations will conduct integrated assessments, but the legal requirements for each must be independently satisfied.

The FRIA must be updated whenever the deployer makes significant changes to the deployment context, frequency, or affected populations.`
  },
  {
    id: 'EU-AI-DEPLOYER-PROVIDER-SHIFT',
    category: 'Title III Chapter 3 — Deployer Obligations',
    title: 'When a Deployer Becomes a Provider: Liability Shift Triggers',
    guidance: `One of the most significant compliance risks for deployers is inadvertently becoming a provider — and thereby assuming full provider obligations — through actions taken after deployment. The EU AI Act specifies several triggers for this liability shift.

The first trigger is substantial modification. If a deployer modifies a high-risk AI system in a way that affects its compliance with the Act or changes its intended purpose, that deployer is treated as a provider with respect to the modified system. Substantial modification can occur through: retraining the model on new data; changing the system's decision thresholds; integrating the AI system with additional software components that alter its outputs; or removing safety constraints imposed by the original provider. The Act does not provide a bright-line test for "substantial" — this requires case-by-case assessment.

The second trigger is own-purpose use outside provider instructions. When a deployer puts a high-risk AI system into service under its own name or trademark, or uses the system for a purpose not covered by the EU declaration of conformity, that deployer becomes a provider for the purposes of the Act with respect to that use. This is particularly relevant for organisations that license general-purpose AI models and apply them to high-risk use cases not anticipated by the model developer.

The third trigger is output repackaging. A deployer that places an AI system's outputs on the market as its own product — for example, an organisation that takes an AI-generated medical risk score and sells it as a proprietary clinical decision support tool — is likely functioning as a provider with respect to the commercialised output.

The consequence of provider status is the full suite of Article 16 obligations: QMS, technical documentation, conformity assessment, CE marking, EU declaration of conformity, registration in the EU database, post-market monitoring, serious incident reporting, and corrective action duties. Organisations should audit their AI deployment practices against these triggers before the Act's high-risk provisions take effect and put in place contractual and governance controls to manage the boundary.`
  },
  {
    id: 'EU-AI-ART50-1',
    category: 'Title IV — Transparency Obligations',
    title: 'Chatbot and Conversational AI Disclosure Requirements (Article 50(1))',
    guidance: `Article 50(1) requires that providers of AI systems intended to interact directly with natural persons ensure that those persons are informed they are interacting with an AI system, unless this is obvious from the circumstances or the context of use. This transparency obligation applies at the point of interaction, before or at the moment the interaction begins.

The obligation is placed primarily on providers — those who develop and deploy conversational AI systems. However, where a deployer customises or presents a conversational AI system as part of their service, the deployer also bears responsibility for ensuring the disclosure is made. In practice, this creates a shared obligation that should be addressed in the provider-deployer agreement.

The disclosure must be in a clear and comprehensible manner. It is not sufficient to bury disclosure in terms and conditions or privacy notices that users are unlikely to read before beginning an interaction. The AI status must be communicated in the context of the interaction itself — for example, through an opening message identifying the system as an AI assistant, or through prominent UI labelling.

Three exceptions apply. First, where it is obvious from the circumstances: a customer service chatbot on a company's website accessed through a button labelled "Chat with our AI assistant" may satisfy this through contextual clarity, though organisations should not rely on this exception without careful analysis of user understanding in their specific context. Second, law enforcement uses: AI systems used for crime prevention, investigation, detection, or prosecution are exempt from the disclosure requirement to the extent necessary for effectiveness. Third, national security uses are similarly exempt.

The scope of "AI systems intended to interact directly with natural persons" is broader than traditional chatbots. Voice assistants, AI-generated customer service agents, automated email response systems that appear to be written by humans, and AI-driven social media personas all potentially fall within scope. Organisations should audit all customer-facing automated communication channels for compliance.

Enforcement of this provision is likely to be consumer-complaint driven in the first instance, making consumer-facing businesses particularly exposed. Failure to disclose is a violation independent of whether any harm results.`
  },
  {
    id: 'EU-AI-ART50-DEEPFAKES',
    category: 'Title IV — Transparency Obligations',
    title: 'Synthetic Media and Deep Fakes: Mandatory AI Labelling (Article 50(2)-(4))',
    guidance: `Articles 50(2) through 50(4) address transparency obligations for AI-generated or AI-manipulated content — commonly referred to as synthetic media or deep fakes. These provisions require that content generated or substantially modified by AI systems be labelled as such.

Article 50(2) requires providers of AI systems that generate or manipulate image, audio, or video content constituting a deep fake to ensure that the outputs of the AI system are marked in a machine-readable format and detectable as artificially generated or manipulated, and that a disclosure accompanies the content indicating that it was artificially created or manipulated. The machine-readable marking requirement anticipates a technical ecosystem in which automated content authentication tools can verify the provenance of digital media.

Article 50(3) establishes obligations for natural persons who disseminate AI-generated deep fakes publicly. Persons who disseminate deep fake content to the public must clearly and visibly disclose the artificial nature of the content. This obligation applies to the disseminator, not just the creator.

An exception in Article 50(2) applies to content that is part of an evidently artistic, creative, satirical, or fictional work or programme, to the extent the labelling obligation would interfere with the display or enjoyment of the work. However, even in these cases, the existence of AI generation or manipulation must be disclosed in a way that does not unduly interfere with the work.

Article 50(4) addresses AI systems that generate text published for the purpose of informing the public on matters of public interest — essentially AI-generated journalism or public communications. Providers must ensure outputs are disclosed as AI-generated, with exceptions for content that has been subject to human editorial review and published under editorial responsibility.

The machine-readable marking requirement implies adoption of standards such as the Coalition for Content Provenance and Authenticity (C2PA) standard or equivalent, which embeds cryptographically verifiable provenance metadata in media files. Organisations generating synthetic media at scale should evaluate their technical stack for compatibility with emerging content authentication standards, as market surveillance authorities may assess technical compliance in addition to visible disclosure.`
  },
  {
    id: 'EU-AI-ART52',
    category: 'Title IV — Transparency Obligations',
    title: 'Emotion Recognition and Biometric Categorisation Disclosure (Article 52)',
    guidance: `Article 52 establishes disclosure obligations for two specific categories of AI system: emotion recognition systems (outside the prohibited workplace and education contexts) and biometric categorisation systems. Both categories involve sensitive inferences about natural persons and therefore carry heightened transparency requirements.

Providers and deployers of emotion recognition systems must ensure that natural persons exposed to those systems are informed of the use of the system and the inferences being made. This obligation applies in all contexts where emotion recognition is not prohibited — including customer service environments, public spaces, retail environments, and healthcare settings. The disclosure must be provided before the system processes the person's data, to the extent practicable.

What constitutes adequate disclosure for emotion recognition? At minimum: notification that an AI system is inferring emotional states; the purposes for which this inference is being made; the categories of emotion or psychological state being inferred; and information about how inferences will be used (for example, to route customer service calls, to adjust advertising, or to assess engagement). Generic privacy notices are insufficient — the disclosure must be specific to the emotion recognition function.

For biometric categorisation systems — AI systems that infer characteristics of natural persons such as sex, age, ethnicity, language, religion, political opinion, or sexual orientation from biometric data — the disclosure obligation applies where persons are subject to such categorisation in publicly accessible spaces. Providers and deployers must clearly inform persons present that biometric categorisation is occurring.

The intersection with GDPR is significant. Processing biometric data for emotion recognition or categorisation will almost always constitute special category data processing under GDPR Article 9, requiring an explicit legal basis (typically explicit consent or a specific statutory authorisation) in addition to the AI Act disclosure. A lawful AI Act disclosure does not substitute for GDPR compliance — both regimes apply concurrently.

Organisations using AI-powered analytics in physical spaces (retail, venues, transport hubs) should review both the emotion recognition prohibition (Article 5(1)(f)) to confirm their context is not covered, and the disclosure obligations here to design compliant notification mechanisms.`
  },
  {
    id: 'EU-AI-ART51-GPAI',
    category: 'Title V — General Purpose AI Models',
    title: 'GPAI Model Classification and Systemic Risk Threshold (Article 51)',
    guidance: `Article 51 establishes the classification framework for general-purpose AI (GPAI) models. A GPAI model is an AI model that displays significant generality and is capable of competently performing a wide range of distinct tasks regardless of the way the model is placed on the market and that can be integrated into a variety of downstream systems or applications.

GPAI models are subject to base-level obligations under Articles 53-54. A subset of GPAI models — those posing systemic risk — are subject to additional obligations. Article 51 defines systemic risk GPAI models and establishes criteria for their identification.

The primary threshold for systemic risk classification is training compute: a GPAI model trained using a total computing power of more than 10^25 floating-point operations (FLOPs) is presumed to have high capability and systemic risk. This threshold is intended to capture the most powerful frontier models at the time of the Act's adoption. Given the rapid pace of capability development, the Commission has delegated authority to adjust this threshold downward as technology evolves.

Models above the 10^25 FLOP threshold are automatically subject to systemic risk obligations. The AI Office may also designate models that do not meet the compute threshold as systemic risk models based on capability evaluations — for example, a model that reaches the threshold of capabilities required for the most advanced tasks in key domains such as biology, chemistry, physics, cybersecurity, autonomous operation, or persuasion at a level not reached by prior-generation systems.

Providers of GPAI models approaching the systemic risk threshold should engage proactively with the AI Office's notification procedures. Article 52 requires providers to notify the AI Office when they have reason to believe their model meets or may meet the threshold. Early notification allows for dialogue before formal designation.

The compute threshold does not automatically determine whether downstream deployments of a GPAI model are high-risk — that determination continues to flow through the Annex III and Annex II analysis. GPAI classification is a separate layer of regulation that applies to the model itself, not to specific applications of it.`
  },
  {
    id: 'EU-AI-ART53-GPAI-OBLIGATIONS',
    category: 'Title V — General Purpose AI Models',
    title: 'GPAI Provider Base Obligations: Documentation, Copyright, and Training Data (Article 53)',
    guidance: `Article 53 establishes the obligations that apply to all providers of GPAI models — regardless of whether those models are designated as systemic risk models. These are the baseline requirements that any organisation placing a general-purpose AI model on the EU market must meet.

Providers must draw up and keep up-to-date technical documentation of the model. The documentation must be sufficient for the European AI Office to assess compliance and must include, at minimum: a general description of the GPAI model; a description of the model's elements, development process, and training methodology; information on the type and nature of the training data used; the model's capabilities and limitations; a description of the model's performance and relevant benchmarks; information about safety and mitigation measures implemented; and, for models with open weights, the weights themselves where relevant.

Copyright compliance is a central obligation. Providers must implement a policy to comply with Union copyright law, including the text and data mining exceptions and opt-outs established under the Copyright in the Digital Single Market Directive (2019/790). Specifically, providers must respect opt-outs communicated by rights holders under Article 4(3) of that Directive, which allows rights holders to reserve their content from text and data mining uses.

Providers must make available to downstream providers a summary of the content used to train the GPAI model. The summary must be sufficiently detailed to allow downstream providers to understand what types of data were used (categories, sources, geographic coverage, temporal scope) even if the full dataset is not disclosed. This transparency enables downstream providers to assess whether the GPAI model's training data creates risks for their specific use cases.

The copyright policy and training data summary must be published — they are not internal documents. The AI Office has issued guidance on acceptable formats and levels of detail for these disclosures. Providers should monitor AI Office guidance documents as this area develops.

Providers must also comply with requests for information from the AI Office in the exercise of its powers of inquiry. GPAI providers are subject to AI Office oversight directly, not just through national authorities.`
  },
  {
    id: 'EU-AI-ART54-SYSTEMIC-RISK',
    category: 'Title V — General Purpose AI Models',
    title: 'GPAI Models with Systemic Risk: Additional Obligations (Article 54)',
    guidance: `Article 54 imposes additional obligations on providers of GPAI models designated as posing systemic risk. These obligations go substantially beyond the base requirements of Article 53 and reflect the AI Office's assessment that these models require heightened scrutiny due to their potential for widespread impact.

Providers of systemic risk GPAI models must perform model evaluations and adversarial testing — commonly called red-teaming — in accordance with standardised protocols. The purpose is to identify and document capabilities that could be misused or that pose autonomous safety concerns. Evaluations must be conducted before placing the model on the market and on an ongoing basis. Providers may conduct evaluations in-house or commission them from qualified third parties; the AI Office may designate trusted evaluators.

Incident reporting is mandatory. Providers must report serious incidents — defined as incidents or near-misses that are attributable to the model and that have an actual adverse impact on public safety, health, the fundamental rights of persons in the Union, or critical infrastructure — to the AI Office. The reporting window is 15 days for incidents with a significant adverse impact, and 3 months for other serious incidents. The AI Office may request follow-up information.

Cybersecurity obligations apply with particular force to systemic risk models. Providers must implement appropriate technical and organisational measures to protect systemic risk GPAI models against cybersecurity risks, including risks of model exfiltration, adversarial attack, and prompt injection at scale. Specific requirements around weights security and inference security are expected to be developed through codes of practice.

Energy efficiency and resource consumption reporting applies to systemic risk GPAI models. Providers must document and report the energy consumption associated with training the model (including pre-training and fine-tuning stages) and, where technically feasible, the estimated energy consumption during inference at scale. This reflects the EU's broader environmental objectives and the recognition that frontier AI training has significant resource implications.

Providers should engage with the AI Office's codes of practice process to shape the detailed standards for each of these obligations. Until codes of practice are adopted, providers must demonstrate compliance with the objectives stated in Article 54 using their best professional judgment.`
  },
  {
    id: 'EU-AI-ART55-CODES',
    category: 'Title V — General Purpose AI Models',
    title: 'Codes of Practice for GPAI: Role, Status, and Timeline (Article 55)',
    guidance: `Article 55 establishes the mechanism of codes of practice as the primary tool for specifying how GPAI model obligations are to be met in practice. The AI Office facilitates the development of codes through a multi-stakeholder process involving GPAI model providers, downstream providers, academic researchers, civil society, and affected communities.

The codes of practice serve a constitutive function: while the Act establishes obligations at a high level, the codes specify the technical and operational means by which those obligations can be met. Providers who comply with an adopted code of practice benefit from a presumption of conformity with the corresponding requirements — they do not need to independently demonstrate compliance with the underlying standard.

Participation in the code development process is open to all relevant stakeholders. The AI Office has published a timeline and process for code development, with the first codes targeting the obligations in Articles 53 and 54 to be finalised within twelve months of entry into force. Organisations with significant stakes in GPAI compliance — either as model providers or as downstream integrators — should engage in the public consultation phases.

Where no code of practice has been adopted, or where a provider chooses not to rely on an adopted code, the provider must demonstrate compliance through other means, including technical documentation, third-party audits, and demonstration of alignment with the objectives of the relevant obligation.

The AI Office retains oversight over codes of practice and may require modifications or revocations where it determines that a code does not adequately address the requirements of the Act. Member States and the AI Board may also provide input on the adequacy of codes.

Codes are expected to address: training data documentation standards; the format and content of capability evaluations; red-teaming methodologies; incident reporting workflows; cybersecurity frameworks for model protection; energy reporting methodologies. Organisations should treat code development as a dynamic process that will require monitoring and adaptation of compliance programs as codes are finalised and revised.`
  },
  {
    id: 'EU-AI-GPAI-SUPPLY-CHAIN',
    category: 'Title V — General Purpose AI Models',
    title: 'GPAI Obligations Flowing Through the Supply Chain',
    guidance: `The integration of GPAI models into downstream AI applications creates a supply chain of AI providers, each with obligations that interact in ways that require careful management. The EU AI Act addresses this through provisions requiring information flow from GPAI model providers to downstream providers, and through the liability framework for high-risk applications built on GPAI foundations.

GPAI model providers must provide downstream providers — organisations that integrate the GPAI model into their own AI systems or applications — with sufficient information about the model to enable downstream compliance. At minimum, this information must include the technical documentation summary described in Article 53, the training data summary, and information about the model's capabilities, limitations, and intended use conditions. This information must be provided at or before the point of access to the model.

Downstream providers who build high-risk AI systems on GPAI model foundations remain fully responsible for the high-risk AI system's compliance with the Act. The GPAI model provider's compliance with Article 53 does not substitute for the downstream provider's own obligations under Articles 9-15. However, a downstream provider can rely on information provided by the GPAI model provider in discharging its own documentation and risk management obligations, to the extent that information is accurate and complete.

When a downstream provider substantially modifies a GPAI model — fine-tunes it, adds capabilities, modifies its safety parameters — the downstream provider's obligations expand accordingly. For systemic risk thresholds, the compute attributed to fine-tuning stages may or may not bring a previously sub-threshold model above the 10^25 FLOP threshold; the AI Office has indicated it will provide guidance on how cumulative compute is assessed.

Contractual arrangements between GPAI model providers and downstream providers should address: information sharing obligations; notification requirements when model updates affect downstream compliance; liability allocation for incidents attributable to model versus integration; and cooperation obligations in regulatory investigations. Standard API terms of service used by many GPAI model providers as of the Act's adoption are unlikely to adequately address these requirements without revision.`
  },
  {
    id: 'EU-AI-ART57-58-AI-OFFICE',
    category: 'Title VI — AI Governance',
    title: 'The European AI Office: Mandate, Powers, and Structure (Articles 57-58)',
    guidance: `Articles 57 and 58 establish the European AI Office as the primary Union-level body responsible for oversight of GPAI models and the broader implementation and enforcement of the EU AI Act at the Union level. The AI Office operates within the European Commission and was established by Commission Decision on 24 January 2024, ahead of the Act's formal adoption.

The AI Office's mandate encompasses four main areas: overseeing the implementation and enforcement of the Act with respect to GPAI models; supporting the consistent application of the Act across Member States; developing expertise and capabilities in advanced AI; and facilitating cooperation between Member States and with third countries on AI regulation.

Powers of the AI Office include: requesting information and documents from GPAI model providers; conducting evaluations of GPAI models; issuing decisions finding non-compliance and requiring corrective action; imposing administrative fines for violations of GPAI-specific obligations; designating GPAI models as systemic risk models; approving and overseeing codes of practice; and commissioning or conducting adversarial testing of GPAI models.

The AI Office's enforcement role for GPAI models is direct — it does not act through national authorities. For other provisions of the Act (high-risk AI systems, prohibited practices, transparency obligations), enforcement is primarily a national authority responsibility. This dual enforcement architecture reflects the global nature of GPAI model providers, most of whom operate across multiple Member States.

The AI Office works in close coordination with the AI Board (established under Article 65) and with national competent authorities. It provides guidance, recommendations, and technical opinions to national authorities to support consistent interpretation and application. Significant enforcement actions or policy decisions are subject to the oversight of the AI Board and the European Parliament.

Organisations subject to the Act should identify the AI Office as the primary regulatory contact for GPAI-related matters and monitor AI Office guidance documents, evaluation reports, and enforcement decisions, which will shape the practical meaning of GPAI obligations.`
  },
  {
    id: 'EU-AI-ART59-AI-BOARD',
    category: 'Title VI — AI Governance',
    title: 'The EU AI Board: Composition, Tasks, and Governance Role (Article 65)',
    guidance: `Article 65 establishes the European Artificial Intelligence Board as the high-level governance body bringing together national authorities and providing strategic oversight of the Act's implementation. The AI Board is the successor to the European Artificial Intelligence Board proposed in the original Commission text, with its role refined in the legislative process.

The AI Board is composed of one high-level representative per Member State, appointed by each Member State. Representatives must be senior officials with authority to commit their national authority. The European Data Protection Supervisor participates as observer. The AI Office participates in Board meetings and provides secretariat functions.

The AI Board's tasks include: advising and assisting the Commission and Member States in the consistent application of the Act; collecting and sharing best practices; contributing to harmonised administrative practices; issuing guidance and recommendations on Act implementation; coordinating national authority activities to avoid forum shopping and ensure consistent treatment of cross-border AI deployments; providing opinions on systemic risk GPAI model designations; and advising on the updating of risk classifications, Annex amendments, and technical standards.

The AI Board does not have enforcement authority — that remains with national market surveillance authorities and the AI Office. The Board's role is advisory and coordinative. However, Board opinions and guidance carry significant weight and are expected to be followed by national authorities absent compelling reasons to deviate.

Stakeholder engagement with the AI Board occurs primarily through the AI Office, which manages the Board's external communications and consultation processes. Formal consultations on codes of practice, technical standards, and Annex updates will go through the Board's established procedures.

Organisations operating across multiple EU Member States should monitor AI Board guidance for signals of divergent national implementation that might affect their compliance posture, and should engage in stakeholder consultations to shape Board guidance on issues material to their AI deployments.`
  },
  {
    id: 'EU-AI-ART64-68-NCA',
    category: 'Title VI — AI Governance',
    title: 'National Competent Authorities: Powers, Market Surveillance, and Investigation (Articles 64-68)',
    guidance: `Articles 64 through 68 establish the framework for national competent authorities (NCAs) responsible for supervising and enforcing the EU AI Act at the Member State level. Each Member State must designate one or more NCAs and identify among them the national market surveillance authority (NMSA) responsible for market surveillance activities.

The NMSA holds the most significant enforcement powers. Under Article 64, the NMSA may request access to AI systems, their documentation, training data, and source code. Access to training data and source code is subject to conditions designed to protect trade secrets — authorities may access this information in controlled environments and are subject to confidentiality obligations — but the right of access is fundamental and cannot be waived by providers. Providers that resist data access requests face the risk of enforcement action independent of any compliance issues.

Powers of investigation include: requiring providers, deployers, importers, and distributors to provide all necessary information and documentation; carrying out inspections, including remote digital inspections; ordering corrective actions; restricting or prohibiting the placing on the market or putting into service of non-compliant AI systems; and ordering withdrawal or recall of non-compliant systems already on the market.

NCAs may also conduct mystery shopping and use other market surveillance techniques to assess compliance in practice. For consumer-facing AI applications, this means that live systems may be tested by regulators without advance notice.

Where there is a risk of serious harm, NCAs may take interim measures to restrict or prohibit use while a full investigation is conducted. Interim measures can be ordered on a provisional basis without full prior process where urgency requires it, with full process then to follow.

National authorities must notify the Commission and other Member States through the RAPEX/SAFERA market surveillance information system when they take corrective action against an AI system that could pose risks in other Member States. This notification triggers a Union-level coordination process.

Penalties for non-compliance are set at Union level in the Act but imposed by national authorities. Member States have discretion to designate which national body acts as NMSA — in some countries this will be the data protection authority, in others a dedicated AI authority, and in others a sector regulator. Organisations should identify the relevant authority in each Member State where they operate.`
  },
  {
    id: 'EU-AI-ART71-DATABASE',
    category: 'Title VII — EU Database',
    title: 'EU AI Database: Registration Requirements and Public Access (Article 71)',
    guidance: `Article 71 establishes the EU AI database — a centralised registration system for high-risk AI systems maintained by the European Commission. Registration in the database is a prerequisite for placing high-risk AI systems on the market or putting them into service.

Registration requirements differ by party. Providers of high-risk AI systems listed in Annex III must register before placing the system on the market. For Annex III systems in points 1 through 7 that are used by public authorities or by bodies acting on their behalf, the deployer (not the provider) must also register the deployment separately. This dual registration requirement for public authority deployments creates additional compliance steps for both sides.

What must be registered? The database entry must include: the name, address, and contact details of the provider and authorised representative; the name, address, and contact details of the importer where applicable; the trade name and any additional unambiguous reference allowing identification of the AI system; the intended purpose of the AI system; a description of the system and its main features; the AI system lifecycle status (under development, in operation, decommissioned); the conformity assessment procedure followed; a reference to the EU declaration of conformity; the CE marking information; the status of the post-market monitoring plan; instructions for use (where publicly available); and the URL where additional information can be found.

The database has publicly accessible and restricted sections. Most of the registration information listed above will be publicly accessible — this enables market surveillance, civil society oversight, and public accountability. A restricted section exists for law enforcement, immigration, and asylum applications where public disclosure could compromise the operational effectiveness of investigations or imperil individuals' safety.

Providers established outside the EU must have their authorised representative carry out registration. The authorised representative's contact details must be included in the registration.

The database became operational progressively — the Commission has indicated a phased approach to database access and registration obligations aligned with the Act's implementation timeline. Providers should register their systems in accordance with the timeline established by the Commission's implementing acts on database technical specifications.`
  },
  {
    id: 'EU-AI-ART72-POST-MARKET',
    category: 'Title VII — EU Database',
    title: 'Post-Market Monitoring: Provider Obligations and Feedback Loops (Article 72)',
    guidance: `Article 72 establishes a mandatory post-market monitoring system for providers of high-risk AI systems. Unlike traditional product safety monitoring, AI post-market monitoring must account for the dynamic nature of AI systems — their behaviour can drift over time as real-world data distribution shifts, adversarial conditions emerge, or deployment contexts evolve beyond those anticipated during development.

Providers must proactively collect, document, and analyse data relevant to the performance of the AI system throughout its lifetime on the market. The monitoring must be proportionate to the nature of the AI system and the risks identified in the risk management system under Article 9. The post-market monitoring plan — which forms part of the QMS under Article 17 — must specify the metrics to be tracked, the data collection methods, the frequency of review, and the thresholds that would trigger corrective action.

A critical aspect of the monitoring obligation is the feedback loop between deployers and providers. Deployers generate the most direct data about real-world system performance — they observe outputs in live operational contexts and are often first to observe degradation, bias, or unexpected failures. Providers must establish mechanisms to receive performance feedback from deployers, including: structured reporting channels; requirements in deployer agreements to report serious incidents and significant performance concerns; and analysis of feedback data in the provider's monitoring review cycle.

What constitutes adequate monitoring data depends on the application. For a medical imaging AI system, monitoring might include tracking diagnostic accuracy rates against clinical ground truth, rates of false positives and false negatives, and patterns of clinician override of system recommendations. For a credit scoring system, monitoring might include approval rate distributions across demographic groups, default prediction accuracy, and correlation of scores with protected characteristics.

The monitoring must be documented and the documentation must be made available to competent authorities on request. Summary results of post-market monitoring must be included in the technical documentation maintained under Article 18. Providers must update the post-market monitoring plan when material changes occur in the deployment context or when monitoring data indicates the plan is insufficient.

Serious incidents discovered through post-market monitoring must be reported in accordance with Article 73. The connection between monitoring and incident reporting is deliberate — monitoring is intended to catch incidents before they become widespread.`
  },
  {
    id: 'EU-AI-ART73-INCIDENT',
    category: 'Title VIII — Post-Market and Incident Reporting',
    title: 'Serious Incident Reporting: Definitions, Timelines, and Process (Article 73)',
    guidance: `Article 73 requires providers of high-risk AI systems placed on the market in the EU to report serious incidents to the market surveillance authorities of the Member States where the incident occurred. Understanding what constitutes a serious incident and the applicable timelines is essential for compliance readiness.

A "serious incident" is defined as any incident or malfunctioning of an AI system that directly or indirectly leads to: the death of a person; a serious injury to a person; serious damage to property or the environment; a serious and irreversible disruption to the provision of an essential service, including services the disruption of which would undermine fundamental rights; a breach of obligations under Union law intended to protect fundamental rights; or personal data breaches. The definition is broad and includes both direct harm and harm mediated through the AI system's integration into critical processes.

Reporting timelines are tiered by severity. For incidents that involve the death of a person or suspicion that the incident may have caused the death of a person, the provider must notify the relevant market surveillance authority within 15 days of becoming aware of the incident. For serious injuries and other serious incidents, the reporting window is also 15 days in principle, with a 3-month window for some categories specified in implementing acts. For incidents that are ongoing — where harm is continuing at the time of reporting — an initial notification must be submitted immediately with a follow-up report when the full picture is available.

Deployers, not just providers, have a role in the reporting chain. Deployers that become aware of serious incidents or malfunctions must report these to the provider without delay. Where the deployer cannot identify the provider or contact them within the required timeframe, the deployer must report directly to the relevant market surveillance authority. This dual-track reporting obligation means deployers need their own incident response procedures aligned to the Article 73 timelines.

Reports must include: identification of the AI system involved; the nature and severity of the incident; information about the population affected; preliminary causation analysis; corrective measures taken or planned; and any information about similar incidents. The report is not intended to be a complete root cause analysis — that can follow as a supplementary report. The initial report must be accurate and complete as far as information is available.

Providers and deployers should establish AI incident response plans before the high-risk provisions take effect. These plans should include: a clear definition of what internal events trigger escalation to Article 73 assessment; a designated responsible party for regulatory notifications; template notification forms; and a process for engaging legal counsel in the notification decision.`
  },
  {
    id: 'EU-AI-ART74-SURVEILLANCE',
    category: 'Title VIII — Post-Market and Incident Reporting',
    title: 'Market Surveillance: Proactive and Reactive Powers (Article 74)',
    guidance: `Article 74 empowers national market surveillance authorities with the tools necessary to investigate AI systems in the market, both proactively (before incidents occur) and reactively (in response to concerns or complaints). The Article draws on the established Union market surveillance framework in Regulation (EU) 2019/1020, adapted for the specific characteristics of AI systems.

Proactive market surveillance may include: coordinated testing programmes where multiple Member States conduct simultaneous assessments of a specific AI system or category of systems; mystery shopping activities where authorities interact with AI systems as ordinary users to assess compliance with transparency and disclosure obligations; review of technical documentation, conformity assessment records, and post-market monitoring reports obtained from providers on request; and targeted investigations triggered by signals from civil society, researchers, or media reports.

The Act specifically provides for "coordinated Union testing" — a mechanism where the AI Office coordinates simultaneous market surveillance activities across Member States to build a consistent evidence base for systems operating in multiple countries. This is particularly relevant for major AI system deployments in areas like credit scoring, recruitment, or content recommendation that affect millions of EU citizens across borders.

Reactive surveillance is triggered by: formal complaints from users, affected persons, or organisations representing them; reports of serious incidents under Article 73; notifications from other regulatory bodies (data protection authorities, financial regulators, competition authorities) that identify potential AI Act issues; and information received through the Union rapid alert mechanism.

Authorities have powers to conduct inspections, which may be unannounced. For AI systems deployed on digital infrastructure, inspections may include remote digital access to production environments, subject to appropriate security and confidentiality protections. Authorities may also require providers to arrange demonstrations of AI system operation.

Organisations should treat market surveillance preparedness as an ongoing operational requirement. This means ensuring that technical documentation is current and retrievable on short notice, that points of contact for regulatory inquiries are designated and trained, and that systems are in place to generate logs and system information in the format regulators are likely to request.`
  },
  {
    id: 'EU-AI-ART76-77',
    category: 'Title VIII — Post-Market and Incident Reporting',
    title: 'Interim and Union-Level Restrictive Measures (Articles 76-77)',
    guidance: `Articles 76 and 77 address the escalation pathway for enforcement when a high-risk AI system presents risks that require action beyond the national level. These provisions establish the framework for interim measures and Union-level restrictive measures in cases of widespread or systemic risk.

Article 76 provides national market surveillance authorities with the power to take interim measures — temporary restrictions on the use, distribution, or making available of an AI system — when there is reasonable ground to believe that the system presents a significant risk and swift action is necessary to prevent harm. Interim measures can be applied before a full conformity assessment is completed and before the provider has been given full opportunity to respond. This mirrors the precautionary powers available in other product safety regimes.

The procedural safeguards for interim measures include: the authority must document the grounds for the measure; the measure must be proportionate to the risk; the provider must be notified immediately and given the opportunity to respond within a defined period; and where the measure persists beyond an initial period, a formal decision with right of appeal must be issued. The urgency of the situation determines how quickly these procedural steps must be completed.

Article 77 addresses Union-level restrictive measures — actions taken when a national measure against an AI system is contested by the provider as unjustified, or when an AI system presenting risks is available across multiple Member States and coordinated Union-level action is needed. The Commission may, after receiving a notification from a Member State under the SAFERA system and consulting with the relevant parties, adopt implementing acts upholding or annulling the national measure. For widespread risks — where an AI system presents risks across multiple Member States without adequate national action — the Commission may take Union-level measures to restrict or prohibit the system.

The existence of these provisions has practical implications for risk management: a serious incident in one Member State that triggers interim measures can rapidly escalate to Union-wide restrictions. Providers whose systems are deployed across multiple Member States should monitor national enforcement actions in all markets and be prepared to engage swiftly with authorities in any Member State where they operate.`
  },
  {
    id: 'EU-AI-ANNEX4',
    category: 'Annex IV — Technical Documentation',
    title: 'Technical Documentation Requirements: Full Annex IV Breakdown',
    guidance: `Annex IV specifies the content that must be included in the technical documentation that providers of high-risk AI systems are required to prepare under Article 11. Technical documentation serves as the primary evidence of compliance and must be sufficiently detailed for a market surveillance authority or notified body to assess the system's conformity with the Act's requirements.

Section 1 requires a general description of the AI system, including: the intended purpose; the name and version of the system; a description of the hardware on which the system is intended to run; a basic description of how the system interacts with external hardware, software, or data; a description of the system's architecture and the role of each component; and a description of the systems and measures for human oversight.

Section 2 requires a detailed description of the elements and the development process, including: the methods and steps used to develop the AI system; the design specifications of the model, including training and testing methodologies; details on the training data, including description of data collection, labelling, and cleaning procedures; a description of validation and testing datasets and their provenance; evidence that training, validation, and testing data satisfy the data governance requirements of Article 10; information about the testing and validation results; and where applicable, a description of any pre-trained AI components or models used and their source.

Section 3 requires information on the monitoring, functioning, and control of the AI system, including: capabilities and limitations of the system; the level of accuracy and robustness metrics; foreseeable unintended outcomes and sources of risk; human oversight measures; procedures for users to report failures; and the intended lifetime of the system.

Section 4 requires a description of the changes made to the system through its lifecycle, with documentation of each material change and its impact on compliance.

Section 5 requires a copy of the risk management documentation prepared under Article 9, including the risk assessment, risk mitigation measures implemented, and residual risk evaluation.

Section 6 requires the information provided pursuant to Article 13 (instructions for use), which must include at minimum: the identity of the provider; the system's intended purpose; its level of accuracy and performance; known limitations; circumstances where it should not be used; and instructions for operation and human oversight.

Technical documentation must be maintained throughout the system's operational lifetime and for ten years thereafter. It must be updated whenever material changes are made to the system or when post-market monitoring data or incident reports indicate that documentation no longer accurately reflects the system in operation.`
  },
  {
    id: 'EU-AI-ANNEX4-VS-ART13',
    category: 'Annex IV — Technical Documentation',
    title: 'Distinguishing Technical Documentation (Annex IV) from Instructions for Use (Article 13)',
    guidance: `Providers of high-risk AI systems must prepare two distinct but related sets of documentation: the technical documentation under Annex IV, and the instructions for use under Article 13. Understanding the difference between these documents — who they are for, what they must contain, and how they relate — is essential for structuring a compliant documentation program.

Technical documentation under Annex IV is primarily a regulatory document. It is prepared for the benefit of market surveillance authorities and notified bodies, not for deployers or end users. Its purpose is to demonstrate that the provider has followed a conformity process and that the system meets the Act's requirements. Access to technical documentation is through regulatory channels — it is not generally published and may contain trade secret information. The documentation is kept by the provider and made available to authorities on request or in conformity assessment procedures.

Instructions for use under Article 13 are an operational document. They must be provided to deployers and, where relevant, to users and affected persons. Their purpose is to enable deployers to use the system correctly and to exercise appropriate human oversight. The instructions for use must be in a language understandable by the deployer and must contain, at minimum: the identity and contact details of the provider; the system's capabilities and limitations; the intended purpose and conditions of use in which the system performs as intended; the level of accuracy, robustness, and cybersecurity achieved and how these were tested; any known or foreseeable circumstances that may lead to risks; the performance characteristics on different groups of persons where relevant; any need for human interpretation of outputs and how to do so; and instructions for proper use including setup, maintenance, and decommissioning.

The practical implication: organisations should maintain these as separate documents with distinct distribution paths. The Annex IV technical file goes to the regulatory cabinet; Article 13 instructions for use go to deployers in the supply chain. Content will overlap — both documents describe capabilities and limitations — but the audience, purpose, depth, and confidentiality treatment differ.

For providers distributing AI systems through intermediaries (resellers, integrators), it is important to ensure that Article 13 instructions for use are passed through the supply chain and reach the ultimate deployer. This may require contractual obligations on distributors and importers.`
  },
  {
    id: 'EU-AI-SME-PROVISIONS',
    category: 'Implementation Guidance',
    title: 'SME and Startup Provisions: Reduced Fees, Sandboxes, and Simplified Documentation',
    guidance: `The EU AI Act includes several provisions designed to reduce the compliance burden on small and medium-sized enterprises (SMEs) and startups, recognising that uniform obligations scaled to large technology companies could create prohibitive barriers for smaller innovators. Understanding and utilising these provisions is important for resource-constrained organisations.

On conformity assessment fees, the Act requires Member States and the Commission to establish fee structures for interactions with notified bodies and market surveillance authorities that are proportionate to the size of the provider. This is implemented through the requirement that notified bodies establish reduced fee schedules for SMEs. The specific fee reductions vary by Member State and notified body, but the principle of proportionality is binding.

On technical documentation, Article 17(3) explicitly permits SMEs and startups to fulfil the QMS and technical documentation requirements "in a proportionate manner." This does not mean that any of the required elements can be omitted — all Annex IV sections must be addressed — but the depth, formality, and documentation infrastructure can be calibrated to the scale of the organisation. A two-person AI startup is not expected to have the same documentation infrastructure as a large enterprise, provided they can demonstrate that the substantive requirements are met.

On regulatory sandboxes, Articles 57-63 establish a right for SMEs and startups to be given priority access to regulatory sandboxes. Providers that meet the SME definition under EU law (fewer than 250 employees, annual turnover under €50 million or annual balance sheet under €43 million) can apply to their national competent authority for participation in a sandbox, and national authorities are obligated to prioritise SME applications.

The EU AI Act also encourages Member States to provide advisory services, guidance materials, and technical assistance specifically tailored to SMEs. Organisations should monitor their national competent authority's publications for SME-specific guidance and support programmes, which will vary by Member State.

Startups should engage with their national competent authority early in the development cycle — the sandbox process and pre-market consultations can prevent costly compliance failures at the point of market entry.`
  },
  {
    id: 'EU-AI-SANDBOXES',
    category: 'Implementation Guidance',
    title: 'Regulatory Sandboxes: Purpose, Application, and Permitted Activities (Articles 57-63)',
    guidance: `Articles 57 through 63 establish the framework for AI regulatory sandboxes — controlled environments established by national competent authorities in which AI systems can be developed, trained, tested, and validated for a limited period under regulatory supervision before being placed on the market or put into service.

The purpose of sandboxes is twofold: to enable innovation by allowing providers to develop AI systems in a supervised environment with direct regulatory engagement; and to enhance regulatory learning by giving competent authorities direct insight into emerging AI technologies and their risks. Sandboxes are not a mechanism for circumventing compliance — participation does not automatically result in approval for market placement, but it can significantly reduce compliance risk and accelerate the path to market.

Eligibility to apply for sandbox participation is open to any potential provider, with priority to be given to SMEs and startups and to providers developing AI systems in areas of significant public interest. Applications must be submitted to the designated national competent authority and must describe the AI system, the testing activities proposed, the data to be processed, and the regulatory questions the provider seeks to resolve through sandbox participation.

Activities permitted in the sandbox are defined in the provider's participation agreement with the national authority. Permitted activities typically include: training AI systems on real-world data; testing AI systems in controlled deployments with real users; engaging with the national authority on questions of legal interpretation; and receiving regulatory feedback on draft technical documentation and conformity assessment approaches.

Confidentiality protections apply: information shared with the national authority in the context of sandbox activities is subject to professional secrecy obligations and cannot be disclosed to third parties or used for enforcement purposes beyond the sandbox context, except where the authority identifies serious safety risks that require immediate action. This protection is important for providers sharing sensitive technical and commercial information.

The sandbox period is limited — typically 12 months with a possible 12-month extension. Upon conclusion, the provider must submit a report to the national authority summarising the activities conducted, the outcomes, and the lessons for regulatory compliance. This report is taken into account in subsequent conformity assessment or market surveillance activities.`
  },
  {
    id: 'EU-AI-TRANSITIONAL',
    category: 'Implementation Guidance',
    title: 'Transitional Periods and Implementation Timeline',
    guidance: `The EU AI Act does not become fully applicable on a single date. Instead, it has a phased implementation timeline with different provisions entering into force at different intervals after the Act's entry into force on 1 August 2024. Understanding this timeline is essential for planning compliance programs.

Prohibited AI practices under Article 5 apply from 2 February 2025 — six months after entry into force. Organisations must have removed prohibited AI systems from use and operation by this date. The six-month window is relatively short and organisations should have already conducted an inventory of AI systems against the Article 5 prohibitions and initiated decommissioning of any prohibited uses.

GPAI model obligations under Articles 51-56 and related governance provisions (Title VI, including AI Office and AI Board provisions) apply from 2 August 2025 — twelve months after entry into force. GPAI model providers must have their Article 53 documentation, copyright policies, and training data summaries in place and must be compliant with systemic risk obligations (Article 54) by this date.

High-risk AI system obligations — the main body of the Act, including Articles 9-15, conformity assessment, CE marking, EU database registration, and post-market monitoring — apply from 2 August 2026 — twenty-four months after entry into force. This is the deadline by which most large enterprises will need to have completed their compliance programs for high-risk AI systems already on the market. New high-risk AI systems placed on the market after August 2026 must be compliant at the point of placement.

A longer transition applies to high-risk AI systems that are also safety components of products already covered by existing sectoral legislation (listed in Annex I Section A — machinery, radio equipment, general product safety, toys, and medical devices, among others). These systems have a thirty-six month transition period, expiring on 2 August 2027, to align with existing conformity assessment timelines under those sectoral frameworks.

Organisations must map each AI system in their portfolio to the applicable deadline and build their compliance roadmap accordingly. High-risk systems developed after August 2024 but placed on the market before August 2026 must be compliant by August 2026 — the transition does not permit indefinite delay for new systems entering the market during the transition window.`
  },
  {
    id: 'EU-AI-GDPR-INTERACTION',
    category: 'Implementation Guidance',
    title: 'Interaction Between the EU AI Act and GDPR: Concurrent Compliance',
    guidance: `The EU AI Act and the General Data Protection Regulation (GDPR) operate as concurrent regulatory frameworks for AI systems that process personal data — which encompasses the vast majority of AI systems in enterprise use. Understanding how these frameworks interact is essential for integrated compliance planning.

The AI Act is intended to operate as lex specialis in areas it specifically addresses. This means that AI Act provisions on data governance (Article 10), technical documentation (Article 11), and logging (Article 19) supplement rather than replace GDPR requirements. Where both frameworks impose requirements on the same data processing activity, both sets of requirements must be met. An AI Act-compliant data governance approach does not substitute for a GDPR-compliant privacy notice, lawful basis, or subject access rights process.

Data Protection Impact Assessments (DPIAs) required under GDPR Article 35 and Fundamental Rights Impact Assessments (FRIAs) required under AI Act Article 27 overlap in their subject matter but serve different purposes and have different triggers. DPIAs are triggered by high-risk processing of personal data (systematic profiling, large-scale processing of sensitive data, automated decision-making with significant effects). FRIAs are triggered by specific categories of high-risk AI system deployment by public bodies or bodies providing public services. Both may be required for the same AI system. Organisations should assess whether integrated or parallel assessment processes are more efficient.

GDPR Article 22 — which gives individuals the right not to be subject to solely automated decisions that produce significant effects — applies to many high-risk AI systems. GDPR-compliant mechanisms for human review of automated decisions must be established independently of and in addition to the human oversight measures required under AI Act Article 14. The two regimes have different scopes and different standards for what counts as meaningful human involvement.

GDPR lawful bases for processing training data, operational data, and logs must be established and documented. The AI Act's data governance requirements do not establish a separate lawful basis — providers must identify a GDPR-compliant legal ground for each processing activity. Consent, legitimate interests, legal obligation, and vital interests are all potentially available but must be assessed for each specific data use.

Joint controller scenarios arise when a GPAI model provider and a downstream provider both determine the purposes and means of processing. The AI Act does not directly address joint controller relationships, but GDPR Article 26 requirements for joint controller agreements will apply where the AI Act's information-sharing obligations result in shared processing decisions.`
  },
  {
    id: 'EU-AI-ART3-MODIFICATION',
    category: 'Title I — Scope and Definitions',
    title: 'Substantial Modification: Assessment Framework and Change Management',
    guidance: `The concept of "substantial modification" is one of the most practically significant definitions in the EU AI Act, because it determines when a change to an already-compliant AI system triggers a new conformity assessment and potentially a new set of obligations. Getting this determination wrong — treating a substantial modification as a minor update — is a compliance failure with serious consequences.

Article 3(23) defines substantial modification as a change to the AI system after its placing on the market or putting into service which affects the compliance of the AI system with this Regulation or results in a modification to the intended purpose for which the AI system has been assessed. This definition has two limbs: changes that affect compliance (regardless of whether they affect intended purpose), and changes that affect intended purpose (regardless of whether the system was already non-compliant).

Examples of changes that typically constitute substantial modification: changing the domain of the training data in a way that materially shifts the model's performance characteristics; adding new output categories that expand the system's decision-making scope; modifying the human oversight mechanisms in ways that reduce their effectiveness; changing the accuracy threshold in a credit scoring system in ways that affect its compliance with accuracy requirements; integrating the AI system with a new external data source that changes the inputs material to its outputs.

Examples of changes that typically do not constitute substantial modification: bug fixes that correct unintended behaviour without changing intended function; security patches that do not affect the AI model itself; performance optimisations that improve speed without affecting outputs; UI changes that do not affect how the system processes inputs or generates outputs; updating instructions for use to add clarity without changing actual system behaviour.

Organisations should establish a formal change management process for AI systems that: categorises proposed changes by their modification type; routes changes through a substantial modification assessment before implementation; documents the assessment rationale; escalates probable substantial modifications to legal and compliance review; and ensures that confirmed substantial modifications trigger re-engagement of the conformity assessment process.

The assessment of substantial modification is the provider's responsibility. Where there is genuine doubt about whether a change is substantial, providers should consult with their notified body and document the consultation as evidence of good faith assessment.`
  },
  {
    id: 'EU-AI-ART3-MISUSE',
    category: 'Title I — Scope and Definitions',
    title: 'Reasonably Foreseeable Misuse: Risk Assessment Implications',
    guidance: `Article 3(12) defines "reasonably foreseeable misuse" as the use of an AI system in a way that is not in accordance with its intended purpose, but which may result from reasonably foreseeable human behaviour or interaction with other systems. This concept is directly incorporated into the risk management requirements of Article 9, which requires providers to consider not just the risks arising from intended use but also the risks arising from foreseeable misuse.

The concept is adapted from established product safety law principles, where manufacturers have long been required to anticipate how products will be used in practice — not just how they are designed to be used. For AI systems, this obligation is particularly demanding because AI outputs can be applied in ways far removed from their training context.

What makes a misuse "reasonably foreseeable"? The test is objective — what would a reasonable observer familiar with the technology, the deployment context, and ordinary human behaviour anticipate? Relevant factors include: the nature of the users (professional versus consumer); the deployment environment (high-stakes versus low-stakes); the accessibility of the system (restricted versus widely available); the nature of the outputs (actionable versus informational); and documented instances of misuse in similar systems.

Practical examples of reasonably foreseeable misuse that must be addressed in risk management: a CV screening AI intended for use by HR professionals being used by line managers without HR oversight to make final hiring decisions; a medical imaging AI intended to assist radiologists being used to replace radiologist review in under-resourced settings; a translation AI intended for document translation being used to translate and generate marketing claims in regulated sectors; a fraud detection AI intended for a specific fraud typology being repurposed for a different transaction type with different accuracy characteristics.

For each identified foreseeable misuse, the risk management process must assess the probability of the misuse occurring, the severity of harm if it does occur, and the feasibility of technical or operational measures to prevent or mitigate it. Residual risk after mitigation must be documented and accepted by the provider's responsible management.

Instructions for use should explicitly address known foreseeable misuses — identifying uses for which the system has not been validated and warning against their use is both a regulatory requirement and a risk management tool.`
  },
  {
    id: 'EU-AI-ART50-CHATBOT-EXCEPTIONS',
    category: 'Title IV — Transparency Obligations',
    title: 'Chatbot Disclosure Exceptions: Obvious Context and Law Enforcement',
    guidance: `Article 50(1) requires AI systems interacting with humans to disclose their AI nature, but provides two operative exceptions that, while narrow, have significant practical implications for specific deployment contexts.

The first exception applies when the AI nature of the system is "obvious from the circumstances." The word "obvious" sets a high standard. It is not sufficient that a reasonably attentive user could infer they are speaking to an AI — the AI nature must be self-evident without requiring any inferential effort. Contextual indicators that have been treated as supporting the obvious-from-circumstances exception include: the system being explicitly labelled as an AI or bot in the UI through which the user accesses it; the interaction being accessed through a platform where AI-only interactions are the only possibility (such as a documentation Q&A system explicitly marketed as AI-powered); and contexts where all users have been explicitly informed in advance that all interactions are AI-mediated.

What does not meet the obvious-from-circumstances threshold: a conversational interface with no labelling simply because the response style is somewhat unusual; a customer service channel that may or may not involve AI depending on the time of day; a voice assistant integrated into a product that does not explicitly represent itself as AI. The default presumption is that disclosure is required; exceptions must be clearly established.

The second exception applies to AI systems used by public authorities for the prevention, investigation, detection, and prosecution of criminal offences or the execution of criminal penalties, including the safeguarding against and prevention of threats to public security, to the extent that disclosure would compromise the purpose of the law enforcement activity. This exception is not a blanket carve-out for all law enforcement AI — it applies specifically where disclosure would undermine a specific investigation or operational activity.

Law enforcement bodies using conversational AI should document the specific operational basis for invoking the exception in each deployment context. A blanket policy of non-disclosure by law enforcement is not supported by the exception's language.

Importantly, neither exception applies to synthetic media labelling obligations under Article 50(2)-(4). A law enforcement entity generating deep fakes must still comply with the machine-readable marking requirements even where the disclosure exception under Article 50(1) applies.`
  },
  {
    id: 'EU-AI-ART5-SUBLIMINAL',
    category: 'Title II — Prohibited AI Practices',
    title: 'Subliminal Manipulation Prohibition: Scope and Boundary Cases (Article 5(1)(a))',
    guidance: `Article 5(1)(a) prohibits AI systems that deploy subliminal techniques beyond a person's consciousness or purposefully manipulative or deceptive techniques to distort a person's behaviour in a way that causes or is likely to cause that person or another person significant harm. This is one of the most conceptually complex prohibitions in the Act, because it targets the technique — subliminal influence — rather than a specific application domain.

The prohibition has two distinct limbs. The first targets "subliminal techniques beyond a person's consciousness" — meaning techniques that influence cognition or behaviour without the person being able to perceive and consciously evaluate the influence. Classic subliminal advertising (below-threshold perceptual stimuli) is the historical reference, but the prohibition extends to any AI-mediated technique that operates below conscious awareness. This could include: AI systems that adjust the visual presentation of content at speeds too fast for conscious processing to assess but fast enough to influence subsequent preferences; systems that deliver affective cues through audio or visual channels calibrated to influence mood without the person's awareness; or recommendation systems designed to exploit cognitive biases in ways the person cannot perceive or counteract.

The second limb targets "purposefully manipulative or deceptive techniques" — meaning techniques that are deliberate rather than accidental. An AI recommendation system that happens to exploit a cognitive bias is not automatically prohibited; one designed to exploit a cognitive bias to direct the person toward choices they would not otherwise make is potentially prohibited if it causes significant harm.

The harm threshold is a significant limiting element. The prohibited behaviour must cause or be likely to cause "significant harm." Minor nudges toward commercially preferable but benign choices are unlikely to meet this threshold. Nudges that cause financial harm, health harm, privacy harm, or harm to fundamental rights are more likely to meet it.

Boundary cases requiring careful analysis include: personalised pricing systems that present different prices to different users based on inferred willingness to pay (likely not subliminal but potentially deceptive and harmful depending on implementation); recommendation systems that are optimised for engagement in ways that systematically increase exposure to harmful content; dark patterns in AI-driven UX that use confusion or artificial urgency to obtain consent or purchases.`
  },
  {
    id: 'EU-AI-ART5-VULNERABILITY',
    category: 'Title II — Prohibited AI Practices',
    title: 'Exploitation of Vulnerabilities Prohibition (Article 5(1)(b))',
    guidance: `Article 5(1)(b) prohibits AI systems that exploit any of the vulnerabilities of a natural person or a specific group of persons due to their age, disability, or a specific social or economic situation in a way that distorts their behaviour in a manner that causes or is likely to cause that person or persons significant harm.

The key elements of this prohibition are the combination of targeted exploitation of a known vulnerability, the specific causal mechanism of behavioural distortion, and the requirement of significant harm. All three elements must be present for the prohibition to apply.

"Vulnerabilities due to age" covers both ends of the age spectrum. Children and adolescents are a primary concern — AI systems used in gaming, social media, or educational contexts that are designed to exploit developmental vulnerabilities (susceptibility to persuasion, incomplete impulse control, social validation needs) to extend engagement or drive in-app purchases fall within the prohibition's scope. Elderly persons with declining cognitive capacity are also covered where systems exploit diminished ability to evaluate complex information or resist manipulation.

"Vulnerabilities due to disability" covers cognitive and psychological disabilities that affect decision-making capacity, including intellectual disabilities, acquired brain injuries, dementia, and mental health conditions that impair judgment.

"Vulnerabilities due to social or economic situation" is the broadest and most contested category. Financial stress, housing insecurity, social isolation, and similar circumstances affect decision-making in ways that AI systems could exploit — for example, a predatory lending AI that targets users showing signals of financial desperation and uses urgency and social proof to drive uptake of harmful loan products.

The prohibition is intentional — accidental exploitation of a vulnerability is not prohibited by this provision, though it may engage other provisions such as risk management obligations for high-risk systems. Systems that inadvertently produce disproportionate harm to vulnerable groups must address this through their Article 9 risk management process; systems designed to exploit vulnerabilities are prohibited outright.

Organisations using AI for marketing, sales, financial products, or social platforms should conduct specific vulnerability analyses against the categories named in Article 5(1)(b) and document that their systems do not exploit the identified vulnerabilities.`
  },
  {
    id: 'EU-AI-ART9-RISK-MGMT-DETAIL',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Risk Management System: Iterative Process and Residual Risk (Article 9)',
    guidance: `While Article 9 is addressed in existing documentation, the iterative lifecycle aspect and the treatment of residual risk deserve dedicated treatment as they represent the most challenging implementation dimensions for practitioners.

The risk management system under Article 9 is explicitly described as a "continuous iterative process" run throughout the entire lifecycle of a high-risk AI system. This means the risk management system is not completed at the point of conformity assessment and then archived — it is a living process that continues through deployment, post-market monitoring, and until the system is decommissioned. The initial risk assessment conducted during development must be updated based on operational experience, incident data, monitoring results, and changes in the deployment context.

The process has four required phases: identification and analysis of known and foreseeable risks; estimation and evaluation of risks that may emerge; adoption of risk management measures; and residual risk assessment. These phases must be documented in a risk register that forms part of the Annex IV technical documentation.

Risk identification must consider: risks from the system performing as intended; risks from system failure or malfunction; risks arising from reasonably foreseeable misuse; risks to health, safety, and fundamental rights; and cumulative risks arising from the interaction of the AI system with other AI systems or digital infrastructure.

Risk estimation must be calibrated to severity and probability. The Act does not prescribe a specific risk assessment methodology, but common approaches include failure mode and effects analysis (FMEA), hazard analysis, and human rights impact modelling. Whatever methodology is used must be documented and consistently applied.

Residual risk — the risk remaining after mitigation measures have been applied — must be evaluated and accepted. This acceptance must be made by appropriately senior management and must be documented. Where residual risk exceeds what is acceptable, the risk management process must cycle again to identify additional mitigations. There is no provision for placing a high-risk AI system on the market with unacceptable residual risk.

The Article 9 process must be tested for its effectiveness — risk management measures must be verified to actually reduce risk to the identified levels. This testing requirement is part of the overall conformity assessment.`
  },
  {
    id: 'EU-AI-CE-MARKING',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'CE Marking and EU Declaration of Conformity (Articles 47-48)',
    guidance: `The CE marking and EU declaration of conformity are the formal instruments through which providers of high-risk AI systems certify their systems' compliance with the Act. These instruments have legal significance — affixing a CE marking to a non-compliant system is itself a violation subject to penalties separate from the underlying compliance failure.

The EU declaration of conformity is a document that the provider draws up and signs, declaring that the high-risk AI system complies with all applicable requirements of the Act. The declaration must contain: the name and address of the provider; a statement that the declaration is issued under the provider's sole responsibility; the name, trade name or trademark, model, batch, or version numbers of the AI system; a statement that the AI system described above is in conformity with the Regulation; references to relevant harmonised standards applied or other technical specifications in relation to which conformity is declared; where applicable, the name and identification number of the notified body and the number of the EU technical documentation assessment certificate; any supplementary information; and the date of issue of the declaration, the name and function of the person issuing the declaration, and their signature.

The CE marking must be affixed to the AI system in a visible, legible, and indelible manner. For software-only AI systems, the CE marking may be affixed to the packaging, accompanying documentation, or displayed in the user interface. The marking must consist of the letters "CE" in a specific format (defined in Annex V) and may be accompanied by the identification number of the notified body where a notified body was involved in the conformity assessment.

Providers must keep the EU declaration of conformity at the disposal of national authorities for at least ten years after the high-risk AI system has been placed on the market or put into service — the same period as the technical documentation retention requirement. The declaration must be updated whenever substantial modifications are made and a new conformity assessment is completed.

For high-risk AI systems subject to other Union harmonisation legislation that also requires CE marking (for example, medical devices), the CE marking and declaration of conformity can be integrated where appropriate, provided all applicable requirements of all applicable legislation are addressed.`
  },
  {
    id: 'EU-AI-ART10-DATA-GOVERNANCE',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Data Governance for Training, Validation, and Testing Datasets (Article 10)',
    guidance: `Article 10 establishes specific data governance requirements for training, validation, and testing data sets used in high-risk AI systems. These requirements go beyond general GDPR data governance and address AI-specific quality, representativeness, and bias concerns.

Training, validation, and testing data sets must be subject to data governance and management practices that address: the relevant design choices; data collection; data preparation, including annotation, labelling, cleaning, enrichment, and aggregation; formulation of relevant assumptions regarding the information the data is supposed to measure and represent; assessment of availability, quantity, and suitability of data; examination for possible biases that could affect health or safety, lead to discrimination, or violate applicable law; and identification of appropriate measures to address those biases.

The data must be relevant, sufficiently representative, and to the best extent possible free of errors, and complete in relation to the intended purpose of the AI system. Completeness here means that the data covers the scenarios, conditions, and populations that the AI system will encounter in deployment. A training dataset that accurately represents historical patterns but fails to represent current or anticipated deployment conditions creates a compliance risk under Article 10.

The requirement for representativeness is among the most operationally challenging. AI systems that will be deployed in relation to natural persons must have training data that is representative of the demographic and contextual diversity of those persons. Systematic under-representation of identifiable groups — whether by race, gender, age, geographic origin, or other characteristics — is a data governance failure that must be identified and addressed before the system is placed on the market.

The regulation explicitly permits the use of special categories of personal data — health data, biometric data, data about racial or ethnic origin — in training datasets, but only to the extent that strict necessity is demonstrated and appropriate safeguards are in place. This is a derogation from the default prohibition on processing special category data and requires a specific legal basis under GDPR Article 9 in addition to the AI Act authorisation.

Data management procedures must be documented and the documentation must form part of the Annex IV technical documentation. Providers should be prepared to describe, at a level of detail satisfying to a regulator, the provenance, preparation, and quality assurance process for each dataset used.`
  },
  {
    id: 'EU-AI-NOTIFIED-BODIES',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Conformity Assessment and Notified Bodies: When Third-Party Assessment is Required',
    guidance: `The EU AI Act establishes a conformity assessment regime for high-risk AI systems that determines when a provider can self-certify compliance versus when independent assessment by a notified body is required. Understanding this distinction is essential for compliance planning and budgeting.

For most high-risk AI systems — those falling under Annex III categories 2 through 8 (critical infrastructure, education, employment, essential services, law enforcement, migration, and justice) — providers may conduct a conformity assessment through internal control procedures. This is analogous to a self-declaration of conformity under many product safety frameworks: the provider conducts their own conformity assessment using a documented internal procedure, draws up the technical documentation under Annex IV, and issues the EU declaration of conformity. No notified body involvement is required unless the provider chooses to seek a voluntary third-party assessment.

A mandatory notified body assessment is required for: high-risk AI systems falling under Annex III point 1 — remote biometric identification systems, including real-time and post-hoc identification; and high-risk AI systems that are safety components of products already covered by Annex II sectoral legislation, when those sectoral frameworks require third-party conformity assessment. For these categories, the provider must submit their technical documentation to a notified body for assessment and obtain an EU technical documentation assessment certificate before issuing the declaration of conformity.

Notified bodies must be accredited by a national accreditation body and notified to the Commission. They must have technical competence specifically in AI systems and the relevant application domain. As of 2024, the ecosystem of AI-competent notified bodies is still developing, and providers requiring notified body assessment should initiate engagement with potential notified bodies early — well ahead of their market placement timeline.

Where a notified body is involved, they issue a certificate. If the notified body later determines that a system no longer complies — based on post-market information or audit — they may withdraw or limit the certificate, which triggers the provider's corrective action obligations.

Third-party assessment through a notified body, even where not required, can be a valuable risk management tool and may be expected by some deployers and customers as evidence of independent validation.`
  },
  {
    id: 'EU-AI-ART26-MONITORING',
    category: 'Title III Chapter 3 — Deployer Obligations',
    title: 'Deployer Ongoing Monitoring and Incident Reporting to Providers',
    guidance: `Article 26 establishes not just pre-deployment obligations for deployers but also ongoing monitoring and reporting duties that must be maintained throughout the operational life of a high-risk AI system. These ongoing obligations are often under-appreciated by organisations focused on the initial deployment compliance checklist.

Deployers must monitor the operation of the high-risk AI system on the basis of the instructions for use provided by the provider. Monitoring is not passive — it requires active review of system outputs, comparison against stated performance characteristics, and assessment of whether the system continues to operate within its intended parameters in the actual deployment context. The frequency and depth of monitoring should be proportionate to the risk profile of the system and the operational stakes.

When deployers have reason to believe that a system presents a risk or is not performing as described by the provider, they must inform the provider or importer without undue delay. The standard is "reason to believe" — meaning monitoring data, user complaints, incident observations, or other indicators that provide a reasonable basis for concern. Deployers do not need certainty that a problem exists before reporting to the provider.

Where the deployer cannot contact the provider or the provider fails to take appropriate action, the deployer must report to the relevant market surveillance authority. This is a residual obligation designed to prevent situations where provider inaction leaves risks unaddressed. Deployers should understand that their duty to protect the persons affected by the AI system's outputs is not discharged by making a report to the provider — if the provider does not respond appropriately, escalation to the authority is required.

For high-risk AI systems used in consumer-facing contexts or in relation to vulnerable populations, deployers should consider whether the monitoring procedures in the provider's instructions for use are adequate for the specific deployment context, and supplement them if necessary. Where a deployer's deployment context is materially different from the deployment context assumed in the instructions for use, this should be raised with the provider and documented in the deployer's risk management records.

Internal governance structures for AI monitoring should assign clear responsibility for this function — it should not be left unassigned or treated as part of general IT operations without specific AI competence and mandate.`
  },
  {
    id: 'EU-AI-AUTHORISED-REP',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Authorised Representatives for Non-EU Providers (Article 22)',
    guidance: `Article 22 requires providers of high-risk AI systems that are established in third countries (outside the EU) to appoint an authorised representative in the Union before placing their systems on the market or putting them into service. The authorised representative is the primary regulatory contact in the EU and carries significant legal responsibility.

The mandate of the authorised representative must be given in writing and must authorise the representative to act on behalf of the provider in relation to all the provider's obligations under the Act. The mandate must specifically authorise the representative to: register the AI system in the EU database; verify that the conformity assessment procedure has been carried out; keep the EU declaration of conformity and technical documentation available for market surveillance authorities; provide information to authorities on request; take corrective action on the provider's instruction; and cooperate with market surveillance authorities.

The representative must be established in the EU and must be reachable by national authorities. The representative's name, address, and contact details must be included in the technical documentation, the EU declaration of conformity, and the EU database registration.

Non-EU providers should select their authorised representative carefully. The representative must have adequate technical competence to engage meaningfully with regulatory authorities and must have access to all documentation they may need to provide. A nominal registered address with no substantive technical capacity does not satisfy the requirement.

If the authorised representative relationship ends — for example, if the service provider withdraws — the provider must appoint a replacement immediately. There cannot be a gap in representation: if no authorised representative is in place, the provider is not permitted to make the system available on the EU market.

Third-country providers that operate through EU subsidiaries should assess whether the subsidiary or the parent is the "provider" for purposes of the Act. If the EU subsidiary places the system on the market under its own name, the subsidiary is the provider and no separate authorised representative is needed. If the parent places the system on the market under its own name and merely distributes through the EU subsidiary, the parent is the provider and requires an authorised representative.`
  },
  {
    id: 'EU-AI-ART13-TRANSPARENCY-HR',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Transparency and Information Requirements for High-Risk AI Systems (Article 13)',
    guidance: `Article 13 requires that high-risk AI systems be designed and developed in such a way that their operation is sufficiently transparent to enable deployers to interpret the system's output and use it appropriately. This provision is distinct from the general transparency obligations in Title IV (which apply to AI systems interacting with humans) — it specifically addresses the transparency that deployers need to exercise their oversight function effectively.

The transparency obligation has a design dimension: the AI system itself must be built to provide information about its operation. This means interpretability considerations — what the system is doing and why it produces particular outputs — must be addressed at the development stage, not retrofitted after deployment. Providers cannot discharge this obligation purely through documentation if the system itself is inherently opaque.

Instructions for use — the operational transparency tool — must enable deployers to: understand the system's capabilities and limitations; interpret its outputs correctly; use it only for its intended purpose; and exercise appropriate human oversight. The instructions must specifically address: the intended purpose; the level of accuracy, including accuracy metrics for specific persons or groups; known or foreseeable circumstances in which the system may fail or produce inaccurate outputs; the performance on specific demographic groups (where relevant); any need for human interpretation; the expected lifetime of the system; and any maintenance or update requirements that affect performance.

For AI systems that produce explanations of their outputs — commonly called XAI (explainable AI) systems — the instructions for use should describe the type and scope of explanations provided and their limitations. An explanation generated by an AI system is not automatically a reliable basis for human decision-making; deployers must understand what explanations mean and what they do not imply.

The transparency obligation is particularly important for high-risk AI systems used in consequential decisions affecting natural persons — employment, credit, benefits, health. In these contexts, the ability of the human overseer to understand why the system produced a particular output is essential for meaningful oversight. Systems that cannot be interpreted at the level required for effective oversight should be assessed for whether they meet the minimum transparency standard.`
  },
  {
    id: 'EU-AI-ART14-HUMAN-OVERSIGHT-DETAIL',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Human Oversight: Design Requirements and Operational Implementation (Article 14)',
    guidance: `Article 14 requires that high-risk AI systems be designed and developed in such a way, including with appropriate human-machine interface tools, that they can be effectively overseen by natural persons during the period of their use. The Article specifies the functional requirements that human oversight must meet, which inform both system design and deployer governance.

The human oversight measures must enable the persons assigned to oversight to: fully understand the capacities and limitations of the high-risk AI system; duly monitor its operation, so as to be able to detect and address signs of anomalies, dysfunctions, and unexpected performance as soon as possible; be able to remain aware of the possible tendency of automatically relying too much on the output produced by a high-risk AI system (automation bias); be able to correctly interpret the high-risk AI system's output, taking into account, for example, the interpretation tools and methods available; be able to decide, in any particular situation, not to use the high-risk AI system; and be able to intervene on the operation of the high-risk AI system or interrupt the system.

The design requirement for the provider translates into specific technical features. The system must provide the human overseer with sufficient information to perform each of the above functions. This typically implies: output displays that convey confidence or uncertainty; alerts when system performance falls outside normal parameters; accessible audit logs showing the basis for outputs; override mechanisms that are technically functional and not merely nominal; and dashboard views enabling monitoring across many outputs.

The operational implementation for the deployer translates into human oversight roles that are genuinely empowered, not merely nominal. Human oversight is not discharged by having an employee click "approve" on AI outputs without genuine capacity to evaluate them. Regulators and courts are expected to look at whether oversight was substantive — whether the human overseer had the skills, the information, the time, and the authority to make genuinely independent assessments.

Automation bias — the human tendency to over-rely on automated outputs — is explicitly referenced in Article 14 and must be addressed in oversight design. This may require: training for human overseers on the risks of automation bias; workflow designs that require active engagement rather than passive approval; and monitoring of override rates as an indicator of whether oversight is substantive.`
  },
  {
    id: 'EU-AI-PENALTIES',
    category: 'Penalties and Enforcement',
    title: 'Penalty Framework: Tiers, Mitigating Factors, and SME Caps (Article 99)',
    guidance: `Article 99 establishes the administrative penalty framework for violations of the EU AI Act. The penalties are structured in three tiers calibrated to the severity of the violation, with specific provisions for SMEs and natural persons.

The highest tier applies to violations of the prohibited AI practices in Article 5. Providers, deployers, importers, distributors, or authorised representatives who violate the prohibitions — for example, by deploying a social scoring system or a real-time biometric identification system outside the permitted exceptions — face fines of up to €35 million or, if the offender is an undertaking, up to 7% of its total worldwide annual turnover for the preceding financial year, whichever is higher.

The middle tier applies to violations of the high-risk AI system requirements in Articles 9-15, the GPAI model obligations in Articles 53-54, and other substantive obligations including failure to register, failure to cooperate with authorities, and failure to report serious incidents. Fines for these violations reach up to €15 million or 3% of worldwide annual turnover, whichever is higher.

The lowest tier applies to providing incorrect or misleading information to notified bodies or national competent authorities. This tier carries fines of up to €7.5 million or 1.5% of worldwide annual turnover, whichever is higher.

For SMEs and startups, the Act requires that the applicable cap be the lower of the percentage turnover figure and a fixed absolute maximum, to prevent disproportionate impact. For individuals within organisations, national authorities may impose fines where individual liability is established under national law.

Mitigating factors that authorities must consider include: the nature, gravity, and duration of the infringement; whether the infringement was intentional or negligent; actions taken to mitigate harm; the degree of cooperation with the authority; the technical and financial capacity of the infringer; and whether previous violations have occurred. The penalty framework is designed to be dissuasive without being disproportionate — authorities are expected to calibrate fines within the permitted ranges based on the specific circumstances.

The Act does not preclude member state national authorities from imposing additional penalties under national law for the same conduct, subject to the principle of ne bis in idem where the same facts are at issue.`
  },
  {
    id: 'EU-AI-SUPPLY-CHAIN-OBLIGATIONS',
    category: 'Title III Chapter 2 — High-Risk Provider Obligations',
    title: 'Supply Chain Obligations: Importers and Distributors (Articles 23-25)',
    guidance: `The EU AI Act distributes compliance obligations across the AI supply chain, imposing specific duties on importers and distributors of high-risk AI systems — not just on the original providers. Understanding these roles and their associated obligations is essential for organisations that trade in AI systems developed by third parties.

An importer is a natural or legal person established in the Union that places on the Union market a high-risk AI system bearing the name or trademark of a person established outside the Union. Importers must ensure, before placing the AI system on the market: that the conformity assessment procedure has been carried out by the provider; that the provider has drawn up the technical documentation; that the system bears the required CE marking; that the provider has appointed an authorised representative; and that the system is accompanied by the instructions for use and complies with Article 13.

Where an importer has reason to believe that a high-risk AI system is not in conformity with the Act, they must not place it on the market until conformity has been established. Importers must also report to the provider and authorities when they have information suggesting a system presents a risk.

A distributor is any person in the supply chain, other than the provider or importer, that makes a high-risk AI system available on the market. Distributors must verify, before making an AI system available, that it bears the required CE marking, is accompanied by a copy of the EU declaration of conformity, and is accompanied by instructions for use in a language understandable to the users in the Member State where the system is to be made available.

Importers and distributors become providers — and assume full provider obligations — in circumstances parallel to those that cause deployers to become providers: if they place a system on the market under their own name or trademark, if they make substantial modifications, or if they change the intended purpose in a way not covered by the original conformity assessment.

Organisations that source AI systems from third-party providers, whether through API access, licensing, or product purchase, should conduct due diligence on the compliance status of those systems and establish contractual protections ensuring that the provider's obligations under the Act are met.`
  },
  {
    id: 'EU-AI-FUNDAMENTAL-RIGHTS',
    category: 'Foundational Principles',
    title: 'Fundamental Rights as the Foundation of the EU AI Act',
    guidance: `The EU AI Act is explicitly grounded in the protection of fundamental rights as guaranteed by the EU Charter of Fundamental Rights. Recitals and substantive provisions throughout the Act anchor compliance obligations in their purpose: preventing AI systems from undermining human dignity, privacy, non-discrimination, freedom of expression, the right to an effective remedy, and other Charter rights. Understanding this foundational purpose is essential for interpreting ambiguous provisions and demonstrating substantive compliance.

The fundamental rights most directly engaged by AI systems include: human dignity (Article 1 of the Charter) — implicated by dehumanising AI applications, social scoring, and manipulation; privacy and data protection (Articles 7-8) — implicated by biometric surveillance, profiling, and training data practices; non-discrimination (Article 21) — implicated by biased AI systems in high-stakes decisions; freedom of expression and information (Article 11) — implicated by AI content moderation and recommendation systems; the right to an effective remedy and a fair trial (Article 47) — implicated by opaque AI decision-making without meaningful appeal; consumer protection (Article 38) — implicated by manipulative AI in commercial contexts; and the rights of the child (Article 24) — implicated by AI systems targeting or affecting children.

The risk classification system in the Act operationalises fundamental rights protection. High-risk AI systems are those whose deployment poses significant risks to fundamental rights — the listing in Annex III is a codification of use cases where fundamental rights are most likely to be at stake. Prohibited AI practices in Article 5 represent use cases where the fundamental rights harm is considered so severe or certain that no level of risk mitigation can justify deployment.

For compliance purposes, organisations should develop the habit of asking: what fundamental rights could be affected by this AI system's operation, and what does the Act require to protect those rights? This rights-centric framing helps identify compliance risks that a purely technical checklist approach might miss. It also supports defensible compliance documentation — regulators and courts will look to whether the substantive purpose of fundamental rights protection was genuinely served.

The FRIA under Article 27 institutionalises this rights-based analysis for public sector and quasi-public deployers. Private sector deployers and providers are not exempt from fundamental rights considerations — they apply through the Act's substantive requirements even without a mandatory FRIA filing.`
  },
  {
    id: 'EU-AI-CODES-CONDUCT',
    category: 'Foundational Principles',
    title: 'Voluntary Codes of Conduct for Non-High-Risk AI Systems (Article 95)',
    guidance: `Article 95 establishes a mechanism for voluntary codes of conduct for AI systems that are not classified as high-risk — meaning systems in the lower tiers of the Act's risk classification that are not subject to the mandatory requirements of Articles 9-15. The purpose is to encourage responsible AI practices across the full spectrum of AI development and deployment, not just in high-risk categories.

The AI Office is tasked with facilitating the drawing up of voluntary codes of conduct for non-high-risk AI systems. These codes may address some or all of the requirements that are mandatory for high-risk systems: risk management, data governance, transparency, human oversight, accuracy and robustness, and cybersecurity. The voluntary nature means providers who choose to adopt such codes are not legally required to do so, but may do so to signal commitment to responsible AI practices.

Providers and deployers that adopt a voluntary code of conduct and comply with its provisions can reference this compliance in communications with customers, procurement authorities, and the public. While voluntary compliance does not create legal presumption of conformity with the Act's mandatory provisions, it demonstrates a positive compliance culture and may be relevant as a mitigating factor in enforcement proceedings.

The development of codes follows a multi-stakeholder process. Industry associations, academic bodies, civil society organisations, and individual companies can participate in code development. The AI Office evaluates proposed codes for alignment with the Act's objectives and facilitates consensus-building among stakeholders with different interests.

Codes of conduct under Article 95 are distinct from the codes of practice under Article 55 (which apply to GPAI model providers and create a presumption of conformity for mandatory obligations). The Article 95 mechanism is a softer instrument targeting general-purpose and lower-risk applications.

Organisations operating primarily in non-high-risk AI categories — for example, companies using AI for internal productivity tools, creative applications, or basic customer analytics — should consider whether participation in relevant voluntary codes serves their risk management and reputation objectives. Proactive adoption of responsible AI practices through codes can also pre-position organisations for potential future regulatory expansion into lower-risk categories.`
  },
  {
    id: 'EU-AI-ANNEX3-SCOPE',
    category: 'Title III — High-Risk Classification',
    title: 'Annex III High-Risk Use Cases: Scope Boundaries and Interpretation Guidance',
    guidance: `Annex III of the EU AI Act lists eight categories of use case that qualify as high-risk AI systems. While the top-level categories are well-known, the boundaries of each category — what is included and what is excluded — require careful analysis for many real-world applications. Incorrect scoping of Annex III is a common compliance failure, with organisations either over-including systems (unnecessary compliance burden) or under-including them (non-compliance risk).

Category 1 covers biometric identification and categorisation, including real-time and post-hoc remote biometric identification, biometric categorisation (inferring characteristics from biometric data), and emotion recognition. The boundary question here is whether a system's use of biometric data constitutes "identification" or merely "verification." Verification — confirming that a person matches a pre-enrolled identity — is generally treated differently from identification of an unknown person against a database, though the Act's current text encompasses both in some configurations.

Category 2 covers AI used as safety components of critical infrastructure. The boundary question is what qualifies as "critical infrastructure" — the Act references infrastructure covered by Directive 2022/2557 (CER Directive), which includes energy, transport, banking, financial market infrastructure, drinking water, wastewater, digital infrastructure, public administration, space, health, and food sectors. AI systems used in operational technology (OT) environments in these sectors are typically in scope.

Category 3 covers AI in education — student assessment, evaluation of learning outcomes, behaviour and emotional monitoring. The boundary question is whether general educational software with some adaptive features qualifies. The focus is on systems that determine access to education, produce evaluations that affect students' careers, or monitor students in ways that could affect their educational outcomes.

Category 4 covers employment and workers management, including recruitment screening, promotion, termination, task allocation, and monitoring of performance and behaviour. Virtually any AI used in HR decisions falls within this category. Pure workforce analytics dashboards that inform human decisions without generating recommendations about individuals are in a grey area.

Categories 5-8 cover essential services, law enforcement, migration/asylum/border control, and administration of justice. Each has specific inclusions and exclusions detailed in Annex III. Organisations should read Annex III against the definitions in Article 3 and with reference to the Commission's guidance documents for sector-specific interpretation.`
  },
  {
    id: 'EU-AI-ENFORCEMENT-JURISDICTION',
    category: 'Title VI — AI Governance',
    title: 'Enforcement Jurisdiction: Which Authority Regulates Which System',
    guidance: `The EU AI Act creates a complex jurisdictional structure for enforcement that organisations operating across multiple Member States must understand to engage with regulators appropriately and to anticipate which authority will have primary oversight of their AI systems.

For high-risk AI systems and most other provisions of the Act (excluding GPAI), enforcement is primarily the responsibility of national market surveillance authorities. Each Member State designates one or more national competent authorities, and among them a market surveillance authority with lead responsibility for the Act. The MSA for a given AI system is generally the MSA of the Member State where the provider or importer is established, for EU-based entities.

For cross-border AI systems that are distributed across multiple Member States, the MSA in the Member State where the provider's main establishment is located has primary jurisdiction, with other Member States' MSAs able to take national action where there is imminent risk within their territory. Coordination among MSAs is handled through the SAFERA notification mechanism and through the AI Board's coordination function.

For GPAI models, enforcement is conducted by the European AI Office at the Union level. This is a significant departure from the national authority model and was chosen because GPAI model providers are typically globally active companies for whom national-level enforcement would be inadequate.

The potential for overlap between the AI Act enforcement regime and enforcement by other sector regulators — financial supervisors, medical device authorities, data protection authorities — is substantial. The Act requires national competent authorities to coordinate with sector regulators and data protection authorities where the same AI system raises issues under multiple legal frameworks. Formal coordination mechanisms are expected to develop through implementing acts and inter-authority cooperation agreements.

For data protection specifically: where the same conduct triggers both AI Act violations and GDPR violations, both the MSA and the data protection authority (DPA) may take action. The ne bis in idem principle prevents double punishment for the same infringement, but different aspects of the same AI system's operation may separately engage both authorities. Organisations should treat AI compliance as a cross-regulatory issue requiring coordination between legal, compliance, and privacy teams.`
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const { data: framework } = await supabase
      .from('compliance_frameworks').select('id').eq('abbreviation', 'EU AI Act').maybeSingle();
    if (!framework) throw new Error('EU AI Act framework not found');

    let { data: source } = await supabase
      .from('sources').select('id').eq('framework_id', framework.id).maybeSingle();
    if (!source) {
      const { data } = await supabase.from('sources').insert({
        framework_id: framework.id, name: 'EU AI Act Enhanced',
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
        source_type: 'webpage', scraper_type: 'generic-webpage',
      }).select('id').single();
      source = data;
    }

    const { data: job } = await supabase.from('ingest_jobs').insert({
      source_id: source!.id, status: 'in_progress', started_at: new Date().toISOString(),
    }).select('id').single();

    let documentsIngested = 0;
    for (const item of EU_AI_ACT_ENHANCED_DATA) {
      const rawContent = `# ${item.id}\n\n## Category\n${item.category}\n\n## Requirement\n${item.title}\n\n## Guidance\n${item.guidance}`;
      const embedding = await generateEmbedding(rawContent);
      const { data: doc } = await supabase.from('documents').insert({
        source_id: source!.id, framework_id: framework!.id,
        title: `${item.id} — ${item.title}`,
        document_type: 'control', raw_content: rawContent,
        metadata: { practice_id: item.id, category: item.category },
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
      }).select('id').single();
      if (doc) { await insertChunk(doc.id, rawContent, embedding); documentsIngested++; }
    }

    await supabase.from('ingest_jobs').update({
      status: 'completed', documents_ingested: documentsIngested, completed_at: new Date().toISOString(),
    }).eq('id', job!.id);

    return new Response(JSON.stringify({ success: true, documents: documentsIngested }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
