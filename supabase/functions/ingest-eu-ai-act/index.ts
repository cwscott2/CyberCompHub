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
    document_id: documentId,
    chunk_index: 0,
    content,
    embedding,
  });
}

const EU_AI_ACT_DATA = [
  // Risk Tiers
  {
    id: 'EU-AIA-TIER-1',
    title: 'Unacceptable Risk AI Systems — Prohibited Practices (Article 5)',
    category: 'Risk Classification',
    description: 'AI systems posing unacceptable risks are prohibited outright under the EU AI Act. These represent a clear threat to the safety, livelihoods, and rights of people.',
    guidance: `Article 5 of the EU AI Act prohibits specific AI practices that are considered unacceptable risks. These include:\n\n1. Subliminal manipulation: AI systems that deploy subliminal techniques beyond a person's consciousness to materially distort their behavior in a way that causes or is likely to cause harm.\n\n2. Exploitation of vulnerabilities: AI systems that exploit vulnerabilities of a specific group of persons (due to age, disability, or social/economic situation) to materially distort behavior in a harmful way.\n\n3. Social scoring by public authorities: AI systems used by public authorities for the evaluation or classification of natural persons based on their social behavior or personal characteristics, leading to detrimental treatment.\n\n4. Real-time remote biometric identification in public spaces: AI systems used for real-time remote biometric identification of natural persons in publicly accessible spaces for law enforcement purposes, with narrow exceptions (searching for missing children, preventing specific terrorist threats, identifying suspects in serious crimes).\n\n5. Emotion recognition in the workplace and educational institutions.\n\n6. Biometric categorization based on sensitive attributes.\n\n7. Untargeted scraping of facial images from the internet or CCTV to build or expand facial recognition databases.\n\nOrganizations must audit their AI portfolio to ensure none of their systems fall into these prohibited categories. Penalties for violating Article 5 can reach EUR 35 million or 7% of total worldwide annual turnover, whichever is higher.`,
  },
  {
    id: 'EU-AIA-TIER-2',
    title: 'High-Risk AI Systems — General Framework (Article 6 and Annex III)',
    category: 'Risk Classification',
    description: 'High-risk AI systems are permitted but subject to stringent requirements covering risk management, data governance, technical documentation, transparency, human oversight, and accuracy.',
    guidance: `Article 6 of the EU AI Act defines two categories of high-risk AI systems:\n\nCategory 1 (Article 6(1)): AI systems that are safety components of products covered by Union harmonization legislation listed in Annex II (e.g., machinery, medical devices, civil aviation, motor vehicles), or are themselves such products, and which are required to undergo third-party conformity assessment.\n\nCategory 2 (Article 6(2)): AI systems listed in Annex III, which covers eight domains: biometric identification and categorization; critical infrastructure management; education and vocational training; employment and worker management; access to essential private/public services; law enforcement; migration/asylum/border control; administration of justice and democratic processes.\n\nHigh-risk AI systems must comply with requirements in Articles 9–15 before market placement:\n- Article 9: Risk management system (iterative, throughout lifecycle)\n- Article 10: Data and data governance (training, validation, testing datasets)\n- Article 11: Technical documentation (Annex IV requirements)\n- Article 12: Record-keeping and logging capability\n- Article 13: Transparency and information provision to deployers\n- Article 14: Human oversight measures\n- Article 15: Accuracy, robustness, and cybersecurity\n\nDeployers of high-risk AI systems have their own obligations (Article 26): use according to instructions, assign human oversight to competent persons, monitor operation, and report serious incidents. Non-compliance with high-risk requirements can lead to fines up to EUR 15 million or 3% of worldwide annual turnover.`,
  },
  {
    id: 'EU-AIA-TIER-3',
    title: 'Limited Risk AI Systems — Transparency Obligations (Articles 50–52)',
    category: 'Risk Classification',
    description: 'Limited-risk AI systems must comply with specific transparency obligations so that users know they are interacting with an AI system.',
    guidance: `Limited-risk AI systems under the EU AI Act are subject to targeted transparency obligations rather than the comprehensive requirements applied to high-risk systems. These obligations ensure that natural persons are informed when they are interacting with AI.\n\nKey transparency requirements include:\n\n1. Chatbots and conversational AI (Article 50(1)): Providers must ensure that natural persons interacting with an AI system intended to interact directly with natural persons are informed that they are interacting with an AI system. This does not apply when the AI system is authorised by law to detect, prevent, investigate, and prosecute criminal offences, or where it is obvious from context.\n\n2. Emotion recognition and biometric categorization (Article 50(3)): Operators of such systems must inform natural persons exposed to them. This obligation applies to both providers and deployers.\n\n3. Deep fakes and synthetic content (Article 50(4)): Providers and deployers of AI systems that generate synthetic audio, image, video, or text content must disclose that the content has been artificially generated or manipulated. This is particularly relevant for news-related contexts.\n\n4. AI-generated text on matters of public interest: When AI is used to generate text published with the purpose of informing the public on matters of public interest, the content must be labelled as AI-generated unless it has undergone human editorial review and a natural person is editorially responsible.\n\nOrganizations deploying chatbots, recommendation engines, or content generation tools should implement clear disclosure mechanisms, maintain records of where disclosures are made, and train staff on transparency obligations.`,
  },
  {
    id: 'EU-AIA-TIER-4',
    title: 'Minimal Risk AI Systems — Voluntary Codes of Conduct',
    category: 'Risk Classification',
    description: 'The majority of AI systems fall into the minimal risk category and are not subject to mandatory requirements, though voluntary codes of conduct are encouraged.',
    guidance: `The EU AI Act takes a risk-proportionate approach, meaning that the vast majority of AI applications in use today — such as AI-powered spam filters, AI-enabled video games, inventory management systems, and basic recommendation engines — fall into the minimal risk category and face no mandatory obligations beyond existing applicable law.\n\nHowever, the Act encourages providers of minimal-risk AI systems to voluntarily adopt codes of conduct (Article 95) that mirror the requirements applied to high-risk systems. The European AI Office is tasked with facilitating the development of these voluntary codes.\n\nVoluntary code of conduct topics that organizations may adopt:\n- Environmental sustainability requirements (energy consumption, resource use)\n- Accessibility of AI systems for persons with disabilities\n- Diversity in development teams\n- Algorithmic fairness and non-discrimination assessments\n- Explainability and transparency commitments\n\nOrganizations should conduct a risk classification assessment of all AI systems in their portfolio. For each system, document: (1) the intended purpose, (2) the applicable risk tier, (3) the basis for that classification, and (4) any applicable obligations. This documentation forms the foundation for a robust AI governance program and helps demonstrate due diligence to regulators and auditors.\n\nEven for minimal-risk systems, organizations should maintain a basic AI inventory, establish incident reporting channels, and ensure compliance with GDPR and other applicable law when personal data is processed.`,
  },
  // Annex III High-Risk Categories
  {
    id: 'EU-AIA-ANNEX3-1',
    title: 'Annex III — Biometric Identification and Categorization of Natural Persons',
    category: 'High-Risk AI Categories',
    description: 'AI systems intended to be used for real-time and post-remote biometric identification of natural persons, and AI systems intended to be used for biometric categorization and emotion recognition.',
    guidance: `Annex III, Point 1 of the EU AI Act lists biometric AI systems as high-risk in the following instances:\n\n1(a) AI systems intended to be used for the real-time and post-remote biometric identification of natural persons, except those used for verification purposes where a single person is authenticated against a template stored by them.\n\n1(b) AI systems intended to be used for biometric categorization of natural persons based on their biometric data to deduce or infer their race, political opinions, trade union membership, religious or philosophical beliefs, sex life, or sexual orientation.\n\n1(c) AI systems intended to be used for emotion recognition.\n\nOrganizations deploying facial recognition in physical access control, attendance management, or identity verification must assess whether their system falls under category 1(a). Systems that go beyond simple 1:1 matching (comparing a live image against a single stored template) into 1:N search (comparing against a database) are clearly high-risk.\n\nBiometric categorization systems (1(b)) are particularly sensitive. Even if categorization is used for seemingly benign purposes (e.g., demographic analytics in retail), if the underlying model infers sensitive attributes from biometric data, it is high-risk — and if it categorizes based on race, political opinion, or sexual orientation, it may be prohibited under Article 5.\n\nCompliance steps for biometric AI:\n- Conduct a Data Protection Impact Assessment (DPIA) under GDPR Article 35\n- Implement the full Article 9–15 requirement set\n- Ensure explicit consent or a clear legal basis exists for biometric data processing\n- Restrict access to biometric data and implement technical safeguards\n- Establish a process for individuals to contest decisions made using biometric AI`,
  },
  {
    id: 'EU-AIA-ANNEX3-2',
    title: 'Annex III — Critical Infrastructure Management and Operation',
    category: 'High-Risk AI Categories',
    description: 'AI systems intended to be used as safety components in the management and operation of road traffic and the supply of water, gas, heating, and electricity.',
    guidance: `Annex III, Point 2 classifies AI systems as high-risk when they are used as safety components in critical infrastructure. This covers:\n\n2(a) AI systems intended to be used as safety components in the management and operation of road traffic.\n\n2(b) AI systems intended to be used as safety components in the supply of water, gas, heating, or electricity.\n\nThe key concept here is "safety component." Not every AI used in infrastructure is high-risk — only those whose failure could directly cause harm to people or the environment. An AI used for predictive maintenance scheduling in a water treatment plant may be safety-critical; an AI used for billing optimization in the same company likely is not.\n\nFor energy grid operators, this means AI used in automatic switching, load balancing, fault detection, or SCADA system anomaly detection is likely high-risk. AI-assisted traffic management systems (signal timing, incident detection) used by municipal authorities are within scope.\n\nCompliance considerations for critical infrastructure AI:\n- Map all AI systems against the safety component definition — document the failure mode and potential consequence\n- Apply IEC 61508 or sector-specific functional safety standards alongside the EU AI Act\n- Establish fail-safe defaults: if the AI system fails, the fallback must be safe\n- Implement the Article 9 risk management system with sector-specific hazard analysis (e.g., HAZOP for process industries)\n- Coordinate with national competent authorities designated under the EU AI Act (typically the same authorities who oversee NIS2 or sector regulation)\n- Ensure cyber resilience: Article 15 requires high-risk AI to be resilient against attempts to exploit vulnerabilities, which is especially critical for OT/ICS environments`,
  },
  {
    id: 'EU-AIA-ANNEX3-3',
    title: 'Annex III — Education and Vocational Training',
    category: 'High-Risk AI Categories',
    description: 'AI systems used to determine access to educational institutions, evaluate learning outcomes, assess students, and make proctoring decisions.',
    guidance: `Annex III, Point 3 designates as high-risk any AI system used in the education and vocational training domain that:\n\n3(a) Determines access or admission to educational and vocational training institutions.\n\n3(b) Evaluates learning outcomes of persons in or applying to educational and vocational training institutions.\n\n3(c) Assesses the appropriate level of education for a person and materially influences the level of education they will receive.\n\n3(d) Monitors and detects prohibited behavior of students during tests.\n\nEducational institutions deploying AI for admissions (including predictive admissions tools that score applicants), automated grading systems, AI tutors that track and respond to learning trajectories, and online exam proctoring systems must treat these as high-risk AI.\n\nAI-powered proctoring tools (3(d)) are particularly contentious: these monitor eye movements, keystroke patterns, and facial expressions to detect potential cheating. They involve biometric data processing, which intersects with Annex III Point 1, and have raised significant concerns about bias against students with disabilities, those with non-standard environments, and those from minority groups.\n\nKey compliance measures:\n- Before deployment, conduct an algorithmic impact assessment focusing on fairness across protected groups (gender, race, disability status, socioeconomic background)\n- Implement human review for all consequential decisions (admission, expulsion, grade assignment) — AI output should inform, not replace, human judgment\n- Provide students with meaningful information about the AI system's role in decisions affecting them (Article 13 transparency)\n- Establish an accessible appeals process where students can contest AI-influenced decisions\n- Conduct regular accuracy and bias audits, especially for proctoring systems`,
  },
  {
    id: 'EU-AIA-ANNEX3-4',
    title: 'Annex III — Employment, Worker Management, and Access to Self-Employment',
    category: 'High-Risk AI Categories',
    description: 'AI systems used for recruitment, promotion, task allocation, performance monitoring, and termination decisions in employment contexts.',
    guidance: `Annex III, Point 4 classifies employment-related AI as high-risk when used to:\n\n4(a) Recruit or select natural persons, notably to place targeted job advertisements, to analyze and filter job applications, and to evaluate candidates.\n\n4(b) Make decisions affecting terms and conditions of work, promotions, and terminations of work-related contractual relationships.\n\n4(c) Allocate tasks based on individual behavior or personal traits or characteristics.\n\n4(d) Monitor and evaluate the performance and behavior of persons in such relationships.\n\nHR technology is one of the most directly affected sectors. This includes: automated CV screening tools, AI-driven video interview analysis, candidate ranking algorithms, employee monitoring software, AI-assisted performance management systems, and workforce planning tools that recommend layoffs.\n\nA recurring concern with employment AI is algorithmic bias. Tools trained on historical hiring data may replicate past discrimination. For example, if a company historically hired predominantly male engineers, an AI trained on this data may systematically downrank female applicants.\n\nCompliance measures for HR AI:\n- Conduct bias testing across all protected characteristics before deployment and on a regular ongoing basis\n- Ensure the AI is only one input into human-made decisions — document the human decision-making process\n- Provide workers and candidates with meaningful information about AI use in decisions affecting them, including the logic involved (Article 13)\n- Implement the right to human review for all consequential employment decisions\n- Consult works councils or employee representatives before deploying workforce monitoring AI (required in many EU member states independently of the AI Act)\n- Maintain logs sufficient to reconstruct how AI influenced specific employment decisions (Article 12)`,
  },
  {
    id: 'EU-AIA-ANNEX3-5',
    title: 'Annex III — Access to Essential Private and Public Services and Benefits',
    category: 'High-Risk AI Categories',
    description: 'AI systems used to evaluate eligibility for essential services including benefits, creditworthiness assessment, emergency services dispatch, and insurance risk assessment.',
    guidance: `Annex III, Point 5 covers AI systems that determine access to essential services:\n\n5(a) AI systems intended to be used by public authorities or on behalf of public authorities to evaluate the eligibility of natural persons for public assistance benefits and services, as well as to grant, reduce, revoke, or reclaim such benefits and services.\n\n5(b) AI systems intended to be used to evaluate the creditworthiness of natural persons or establish their credit score, with the exception of AI systems used for the purpose of detecting financial fraud.\n\n5(c) AI systems intended to be used for risk assessment and pricing in relation to natural persons in the case of life and health insurance.\n\n5(d) AI systems intended to be used for the evaluation and classification of emergency calls by public safety answering points and dispatch of emergency first responder services.\n\nFor financial institutions, AI-driven credit scoring models that go beyond simple rules-based systems and use machine learning are clearly high-risk. This intersects significantly with existing regulation (CRR, EBA Guidelines on loan origination, GDPR Article 22 on automated decision-making).\n\nFor public sector bodies, social benefits eligibility AI has been highly controversial in Europe (e.g., the Dutch SyRI case, Dutch childcare benefit scandal). These systems must comply with Articles 9–15 in full.\n\nKey compliance requirements:\n- Ensure training data is representative and free from historical bias in access to benefits or credit\n- Implement audit trails so that any benefit denial or credit rejection influenced by AI can be reconstructed and explained\n- Provide individuals with the right to a meaningful explanation and human review\n- For insurance pricing: ensure AI-derived risk factors do not use protected characteristics as proxies`,
  },
  {
    id: 'EU-AIA-ANNEX3-6',
    title: 'Annex III — Law Enforcement AI Systems',
    category: 'High-Risk AI Categories',
    description: 'AI systems used by law enforcement for individual risk assessment, lie detection, crime prediction, profiling, evidence reliability evaluation, and deep fake detection.',
    guidance: `Annex III, Point 6 designates as high-risk AI systems used by law enforcement authorities for:\n\n6(a) Assessing the risk of a natural person becoming a victim of a criminal offence.\n\n6(b) Polygraphs and similar tools to detect the emotional state of a natural person.\n\n6(c) Evaluating the reliability of evidence in the course of investigation or prosecution of criminal offences.\n\n6(d) Assessing the risk of a natural person for offending or reoffending, or the risk of potential criminal behaviour by natural persons.\n\n6(e) Profiling of natural persons in the course of detection, investigation, or prosecution of criminal offences.\n\n6(f) Crime analytics regarding natural persons, allowing law enforcement authorities to search large complex datasets to identify unknown patterns or discover hidden relationships.\n\nPredictive policing tools (6(d)) are among the most contested AI applications in law enforcement. Systems that assign risk scores to individuals based on their history, demographics, or associations have been challenged in courts across the EU as violating the right to presumption of innocence and the principle of non-discrimination.\n\nCompliance considerations are particularly strict for law enforcement AI:\n- Only member state law enforcement authorities (not private companies acting independently) can deploy these systems\n- Fundamental rights impact assessments are required before deployment\n- Strong logging and audit requirements (Article 12) to support judicial oversight\n- Human oversight (Article 14) must be meaningful — officers must understand the AI's output limitations and not treat risk scores as determinative\n- Post-market monitoring (Article 72) must include tracking of false positive rates across demographic groups\n- Regular external audits by independent bodies are strongly recommended`,
  },
  {
    id: 'EU-AIA-ANNEX3-7',
    title: 'Annex III — Migration, Asylum, and Border Control AI Systems',
    category: 'High-Risk AI Categories',
    description: 'AI systems used in migration and asylum processes, including lie detection, risk assessment, examination of applications, and border surveillance.',
    guidance: `Annex III, Point 7 classifies as high-risk AI systems used by competent authorities in migration, asylum, and border control contexts:\n\n7(a) Polygraphs and similar tools to detect the emotional state of a natural person.\n\n7(b) Assessing certain risks posed by a natural person entering the territory of a Member State.\n\n7(c) Assisting competent authorities for the examination and assessment of applications for asylum, visa, and residence permits and associated complaints with regard to the eligibility of the natural persons applying for a status.\n\n7(d) In the context of migration, asylum, and border control management, for the purpose of detecting, recognizing, or identifying natural persons.\n\nMigration AI is particularly sensitive because the individuals subject to these systems are often among the most vulnerable in society, may lack legal representation, and have limited ability to challenge decisions. The consequences of errors — wrongful detention, deportation, denial of asylum — can be severe and irreversible.\n\nThe EU has been specifically criticized for deploying unvalidated lie detection AI at borders (iBorderCtrl project) and for predictive risk scoring at border crossings that relies on nationality as a proxy for risk.\n\nKey requirements for migration AI:\n- Fundamental rights impact assessment before any deployment (mandatory for law enforcement and migration AI)\n- Prohibition on using nationality or ethnicity as a risk factor except where strictly legally justified and demonstrably non-discriminatory\n- All consequential decisions (visa denial, detention, deportation) require human review — AI can flag, not decide\n- Asylum seekers must be informed if AI was used in the assessment of their application\n- Audit trails must be maintained to support legal challenge by affected individuals\n- Coordinate with EU Fundamental Rights Agency (FRA) guidelines on migration AI`,
  },
  {
    id: 'EU-AIA-ANNEX3-8',
    title: 'Annex III — Administration of Justice and Democratic Processes',
    category: 'High-Risk AI Categories',
    description: 'AI systems used to assist judicial authorities in legal research, fact assessment, and interpretation of law, and AI used to influence elections and democratic processes.',
    guidance: `Annex III, Point 8 covers two distinct areas of high-risk AI:\n\n8(a) AI systems intended to be used by a judicial authority or on its behalf to research and interpret facts and the law and to apply the law to a concrete set of facts.\n\n8(b) AI systems intended to be used for influencing the outcome of an election or referendum or the voting behaviour of natural persons in the exercise of their vote in elections or referenda.\n\nFor AI used in judicial contexts (8(a)), the concern is maintaining the right to a fair trial and the independence of the judiciary. AI-generated legal research can be erroneous (hallucination in LLMs is well-documented), and if judges rely on AI-generated case summaries or legal interpretations without critical review, miscarriages of justice may follow. The AI can support, but must not substitute for, independent judicial reasoning.\n\nFor AI influencing democratic processes (8(b)), this covers a wide range of tools: micro-targeted political advertising, AI-generated political content, disinformation detection/creation tools, voter sentiment analysis, and AI-driven campaign strategy tools. The rise of sophisticated generative AI makes this category especially urgent.\n\nCompliance for democracy-influencing AI:\n- Political parties and campaign organizations using AI for micro-targeting must comply with high-risk requirements\n- AI-generated political advertisements must be labeled as such (Article 50, reinforced by the Digital Services Act and proposed Media Freedom Act)\n- Platforms hosting political content must assess whether their recommendation algorithms constitute high-risk AI under this category\n- For judicial AI: ensure output is always advisory, maintain full audit trail of AI-assisted research, require judges to document their independent analysis separate from AI-generated materials`,
  },
  // Title III Articles 9-15
  {
    id: 'EU-AIA-ART9',
    title: 'Article 9 — Risk Management System for High-Risk AI',
    category: 'High-Risk AI Obligations',
    description: 'High-risk AI providers must establish, implement, document, and maintain a risk management system throughout the entire lifecycle of the AI system.',
    guidance: `Article 9 of the EU AI Act mandates that providers of high-risk AI systems establish a risk management system — an iterative process that runs throughout the entire lifecycle of the system, not just at the point of initial deployment.\n\nThe risk management system must include:\n\n1. Identification and analysis of known and foreseeable risks associated with each high-risk AI system.\n\n2. Estimation and evaluation of the risks that may emerge when the high-risk AI system is used in accordance with its intended purpose and under conditions of reasonably foreseeable misuse.\n\n3. Evaluation of other risks possibly arising based on the analysis of data gathered from the post-market monitoring system.\n\n4. Adoption of appropriate and targeted risk management measures designed to address the risks identified.\n\nThe risk management measures adopted shall give due consideration to the effects and possible interactions resulting from the combined application of the requirements set out in Articles 10–15. They shall be such as to ensure a level of risk that is acceptable in relation to the state of the art, taking into account the generally acknowledged state of the art, including as reflected in relevant harmonized standards or common specifications.\n\nIn identifying the most appropriate risk management measures, the provider shall ensure that:\n- Risks are eliminated or reduced as much as possible through adequate design and development\n- Where appropriate, adequate mitigation and control measures are implemented\n- Residual risks are communicated to the deployer (Article 13)\n\nRisk management must be documented in the technical documentation (Annex IV). The risk management system must be tested against the actual defined purpose, near-purpose uses, and known misuse scenarios. Residual risk after mitigation must be judged acceptable before market placement.`,
  },
  {
    id: 'EU-AIA-ART10',
    title: 'Article 10 — Data and Data Governance for High-Risk AI',
    category: 'High-Risk AI Obligations',
    description: 'High-risk AI systems using machine learning must be trained, validated, and tested on data that meets quality criteria, is representative, and avoids discriminatory patterns.',
    guidance: `Article 10 of the EU AI Act establishes data governance requirements for high-risk AI systems that involve training models with data. This article is central to preventing algorithmic bias and ensuring AI reliability.\n\nCore requirements under Article 10:\n\n1. Training, validation, and testing data sets shall be subject to appropriate data governance and management practices. These practices concern the design choices, data collection processes, data preparation operations (e.g., annotation, labelling, cleaning, enrichment, aggregation, de-duplication), and examination of potential biases.\n\n2. Training, validation, and testing data sets shall be relevant, sufficiently representative, and to the best extent possible, free of errors and complete in view of the intended purpose.\n\n3. Data sets shall have the appropriate statistical properties, including, where applicable, as regards the persons or groups of persons on which the high-risk AI system is intended to be used — the statistical distribution should be representative of the actual population the system will serve.\n\n4. Data sets shall take into account the specific characteristics of the use case, in particular with regard to persons or groups of persons on which the AI system is to be used.\n\n5. Providers shall examine training, validation, and testing data for possible biases that are likely to affect health and safety of persons or lead to prohibited discrimination.\n\n6. Special categories of personal data (under GDPR) processed in training sets shall require a specific legal basis and shall be subject to appropriate safeguards including strict access controls, pseudonymization, and clear data minimization.\n\nOrganizations should maintain a data lineage document for each high-risk AI model: where data came from, how it was processed, what quality checks were applied, and what bias tests were conducted. This forms part of the mandatory technical documentation under Article 11 and Annex IV.`,
  },
  {
    id: 'EU-AIA-ART11',
    title: 'Article 11 — Technical Documentation for High-Risk AI (Annex IV)',
    category: 'High-Risk AI Obligations',
    description: 'Providers must draw up technical documentation before placing a high-risk AI system on the market, kept up to date throughout the system lifecycle.',
    guidance: `Article 11 requires providers of high-risk AI systems to prepare comprehensive technical documentation before placing the system on the market or putting it into service. This documentation must be maintained and updated throughout the system's lifecycle. The full content requirements are specified in Annex IV.\n\nAnnex IV technical documentation must include:\n\n1. General description: intended purpose, version information, how it interacts with hardware/software, human oversight mechanisms, categories of persons and data the system interacts with.\n\n2. Detailed description of elements: system architecture, design choices, training methodologies, model architecture, validation processes, used pre-trained models, and significant design changes.\n\n3. Information on training, validation, and testing data: data governance measures applied, details on dataset characteristics, statistical properties, data bias analysis.\n\n4. Monitoring, functioning, and control: capabilities and limitations, expected level of accuracy/robustness, circumstances where the system may fail, technical measures for human oversight.\n\n5. Risk management documentation: outcomes of the Article 9 risk management process.\n\n6. Changes made to the system through its lifecycle.\n\n7. Conformity assessment procedures applied.\n\n8. EU declaration of conformity (after conformity assessment).\n\n9. Implemented standards and specifications.\n\nThis documentation must be kept for at least 10 years after the system is placed on the market and must be made available to national competent authorities upon request. For SMEs, simplified documentation templates may be provided by the European AI Office. The technical documentation is the primary evidence in any enforcement investigation.`,
  },
  {
    id: 'EU-AIA-ART12',
    title: 'Article 12 — Record-Keeping and Logging for High-Risk AI',
    category: 'High-Risk AI Obligations',
    description: 'High-risk AI systems must have automatic logging capabilities to ensure traceability throughout the system lifecycle and enable post-market monitoring.',
    guidance: `Article 12 mandates that high-risk AI systems are designed and developed with logging capabilities to enable appropriate monitoring during operation. Logs allow investigation of incidents, support post-market monitoring obligations, and enable regulatory audits.\n\nKey logging requirements:\n\n1. High-risk AI systems shall technically allow for the automatic recording of events (logs) over the duration of the lifetime of the system.\n\n2. Logging capabilities shall ensure, at minimum, that the system can be monitored with a view to the occurrence of situations that may result in the AI system presenting a risk within the meaning of Article 79(1) or constitute a substantial modification.\n\n3. For AI systems subject to specific logging requirements under other applicable Union law (e.g., medical device regulation), the logging capabilities shall be complementary to those specific requirements.\n\n4. The logging capabilities shall, at a minimum, enable the recording of:\n   - The period of each use of the system (start and end time of each use)\n   - The reference database against which the input data has been checked (for biometric systems)\n   - The input data for which the search has led to a match (where technically feasible)\n   - The identity of the natural persons involved in the verification of results\n\nFor deployers, Article 26 requires that they keep the logs generated by high-risk AI systems for a period appropriate to the intended purpose of the system and applicable law — at minimum three years where no more specific retention requirement exists.\n\nLog integrity is critical: logs must be tamper-evident. Organizations should implement cryptographic log signing, centralized log management, and access controls ensuring that only authorized personnel can view but not modify logs. Logs should be tested regularly to confirm they capture the required events.`,
  },
  {
    id: 'EU-AIA-ART13',
    title: 'Article 13 — Transparency and Provision of Information to Deployers',
    category: 'High-Risk AI Obligations',
    description: 'High-risk AI systems must be transparent enough for deployers to understand capabilities, limitations, and conditions for safe use, supported by an instructions-for-use document.',
    guidance: `Article 13 requires providers of high-risk AI systems to ensure that operation is sufficiently transparent to enable deployers to understand and correctly use the system. This transparency obligation is operationalized through the "instructions for use" document that must accompany every high-risk AI system.\n\nThe instructions for use must include, at minimum:\n\n1. Identity and contact details of the provider and any EU representative.\n\n2. The characteristics, capabilities, and limitations of the system, including:\n   - Its intended purpose\n   - The level of accuracy, robustness, and cybersecurity against which it has been tested and validated\n   - Any known or foreseeable circumstances that may lead to risks to health, safety, or fundamental rights\n   - Its performance with respect to the persons or groups of persons on which the system is intended to be used\n   - Technical capabilities and limitations of the human oversight measures (Article 14)\n   - Any limitation in terms of operational lifetime\n\n3. Changes to the high-risk AI system and its performance that have been pre-determined by the provider at the time of the initial conformity assessment.\n\n4. The human oversight measures (Article 14), including technical measures installed in the system to facilitate interpretation of the system outputs by the deployers.\n\n5. Computational and hardware resources needed; expected lifetime; any maintenance and care measures to ensure system continues to operate as intended.\n\n6. Data input specifications: formats, type of data, and any other relevant information.\n\nThe instructions for use must be in a language that can be easily understood by deployers and updated when a substantial modification is made to the system. Deployers are entitled to rely on the accuracy of the instructions for use — providers bear liability for instructions that are incomplete, inaccurate, or misleading.`,
  },
  {
    id: 'EU-AIA-ART14',
    title: 'Article 14 — Human Oversight for High-Risk AI',
    category: 'High-Risk AI Obligations',
    description: 'High-risk AI systems must be designed to allow effective human oversight by natural persons during the period of use to prevent or minimize risks.',
    guidance: `Article 14 establishes the human oversight requirement as a core pillar of the EU AI Act's approach to high-risk AI. The premise is that meaningful human control must remain over AI systems capable of causing significant harm.\n\nHuman oversight requirements specify that high-risk AI systems shall be designed and developed with appropriate tools and interfaces for effective human oversight. Specifically, the measures must allow the individuals assigned to carry out oversight to:\n\n1. Fully understand the capacities and limitations of the high-risk AI system and be able to duly monitor its operation so that signs of anomalies, dysfunctions, and unexpected performance can be detected and addressed.\n\n2. Remain aware of the possible tendency of automatically relying or over-relying on the output produced by a high-risk AI system (automation bias), in particular for systems used to provide information or recommendations for decisions to be taken by natural persons.\n\n3. Be able to correctly interpret the high-risk AI system's output, taking into account the characteristics of the tools and methods made available for that purpose.\n\n4. Be able to decide, in any particular situation, not to use the high-risk AI system or to otherwise disregard, override, or reverse the output of the system.\n\n5. Be able to intervene on the operation of the high-risk AI system or interrupt it through a "stop button" or similar procedure.\n\nDeployers are responsible for ensuring that oversight personnel are appropriately trained and competent. This is not a tick-box exercise — if the person assigned to oversight lacks the domain expertise to critically evaluate AI outputs, the oversight requirement is not met. Organizations should document: who is assigned to oversight roles, what training they have received, and how override/stop decisions are recorded.`,
  },
  {
    id: 'EU-AIA-ART15',
    title: 'Article 15 — Accuracy, Robustness, and Cybersecurity for High-Risk AI',
    category: 'High-Risk AI Obligations',
    description: 'High-risk AI systems must achieve and maintain appropriate levels of accuracy, be resilient to errors and inconsistencies, and be resistant to attempts by third parties to exploit vulnerabilities.',
    guidance: `Article 15 establishes performance standards for high-risk AI systems across three dimensions: accuracy, robustness, and cybersecurity.\n\nAccuracy requirements:\n- High-risk AI systems shall be designed and developed with the goal of achieving an appropriate level of accuracy, robustness, and cybersecurity.\n- Accuracy levels and the relevant accuracy metrics shall be declared in the accompanying instructions for use.\n- The appropriate level of accuracy depends on the specific use case and population the system serves.\n\nRobustness requirements:\n- High-risk AI systems shall be resilient as regards errors, faults, or inconsistencies that may occur in the system itself or the environment in which it operates.\n- Technical redundancy solutions should include fallback plans, which may include back-up or fail-safe plans.\n- Robustness shall include resilience to attempts by third parties to alter the use or performance through adversarial techniques (adversarial robustness).\n- The system must maintain consistent performance across the full input space, including edge cases and distribution shift scenarios.\n\nCybersecurity requirements:\n- High-risk AI systems shall be resilient against attempts by unauthorized third parties to alter their use, outputs, or performance through:\n  - Data poisoning (corrupting training data)\n  - Model poisoning (corrupting model weights or architecture)\n  - Adversarial examples (crafted inputs designed to cause misclassification)\n  - Confidentiality attacks (model inversion, membership inference)\n  - Model theft\n- Security measures should align with the EU's Cybersecurity Act and ENISA guidelines on AI security.\n- Penetration testing of AI systems should include AI-specific attack scenarios, not only traditional application security testing.\n- The AI Bill of Materials (AI BOM) — documenting all model components, dependencies, and training data sources — is a recommended practice for supply chain security.`,
  },
  // Conformity Assessment and Post-Market
  {
    id: 'EU-AIA-ART43',
    title: 'Articles 43–49 — Conformity Assessment and CE Marking',
    category: 'Conformity Assessment',
    description: 'High-risk AI systems must undergo conformity assessment before market placement, either by self-assessment or third-party notified body assessment, followed by CE marking.',
    guidance: `Articles 43 through 49 of the EU AI Act govern the conformity assessment process that high-risk AI systems must complete before being placed on the EU market.\n\nConformity assessment paths:\n\nPath 1 — Internal control (Annex VI): For most high-risk AI systems in Annex III, providers can self-certify conformity based on an internal conformity assessment process. The provider must ensure the technical documentation is complete, test the system against all Article 9–15 requirements, and sign an EU declaration of conformity.\n\nPath 2 — Third-party assessment (Article 43(1)(b)): For high-risk AI systems in Annex III, Point 1 (biometric identification) and for AI safety components of products covered by Annex II legislation (such as medical devices, machinery), third-party assessment by a notified body is required. This mirrors the approach in existing EU product safety law.\n\nNotified Bodies:\n- Notified Bodies for AI Act purposes are designated by member states\n- They must be accredited under EN ISO/IEC 17065 and have specific AI competence\n- They conduct assessment of technical documentation and may conduct physical testing\n- Conformity assessments by notified bodies are valid for a defined period and must be renewed after substantial modifications\n\nCE Marking (Article 49):\n- Once conformity assessment is passed and an EU declaration of conformity is signed, the provider affixes a CE marking to the high-risk AI system\n- The CE marking indicates that the system has been assessed as conforming to all applicable EU AI Act requirements\n- CE marking must be affixed before the system is placed on the market; it may be accompanied by additional markings from sector-specific legislation (e.g., MDR for medical devices)\n\nPost-Conformity obligations:\n- Providers must register high-risk AI systems in the EU database for AI systems before market placement (Article 71)\n- Any substantial modification triggers a new conformity assessment cycle`,
  },
  {
    id: 'EU-AIA-ART72',
    title: 'Article 72 — Post-Market Monitoring for High-Risk AI',
    category: 'Post-Market Obligations',
    description: 'Providers of high-risk AI systems must establish and maintain a post-market monitoring system to collect and analyze data on the performance of systems throughout their lifetime.',
    guidance: `Article 72 requires providers to proactively monitor the performance of their high-risk AI systems after deployment. This is a significant shift from traditional product liability frameworks, where obligations end at market placement.\n\nPost-market monitoring system requirements:\n\n1. Providers shall establish and document a post-market monitoring plan in the technical documentation. The plan shall fit the type of AI technology and its risks.\n\n2. The post-market monitoring system shall actively and systematically collect, document, and analyze relevant data on the performance of high-risk AI systems throughout their lifetime.\n\n3. Where relevant, post-market monitoring shall include analysis of the interaction with other AI systems.\n\n4. The post-market monitoring plan shall, at minimum, include:\n   - A proactive data collection process\n   - A process for assessing whether the system still meets requirements after significant changes to its use environment\n   - Assessment of performance in light of emerging risks\n   - A process for monitoring through feedback channels from deployers and affected persons\n\nSerious incident reporting (Article 73):\n- Providers must report any serious incident (death, serious harm to health, significant property damage, disruption to critical infrastructure, violations of fundamental rights) to national market surveillance authorities\n- Initial report: within 15 days of becoming aware of a serious incident\n- Follow-up reports as the investigation proceeds\n\nDeployers' role (Article 26(5)):\n- Deployers who become aware of serious incidents or non-conformity must notify the provider\n- They must maintain the logging data generated by the system to support incident investigation\n\nOrganizations should designate a responsible person for post-market monitoring, establish a ticketing/feedback system for deployers, and define thresholds that trigger a formal review of the AI system's continued compliance.`,
  },
  // GPAI
  {
    id: 'EU-AIA-GPAI-1',
    title: 'Title VIII — General Purpose AI (GPAI) Models — Obligations and Systemic Risk',
    category: 'General Purpose AI',
    description: 'The EU AI Act introduces specific obligations for providers of general purpose AI models, with enhanced requirements for models posing systemic risk (above 10^25 FLOPs training compute).',
    guidance: `Title VIII (Articles 51–56) of the EU AI Act addresses General Purpose AI (GPAI) models — AI models trained on broad data at scale, capable of performing a wide range of tasks. This includes large language models (LLMs), large multimodal models, and other foundation models.\n\nAll GPAI model providers must:\n1. Prepare and maintain up-to-date technical documentation including training methodology, training data used, evaluation results for capabilities and limitations, and known risks.\n2. Prepare an Annex XII information sheet that downstream providers (who build applications on the model) can use.\n3. Comply with copyright law, including maintaining a policy to respect rights holders' opt-outs under the Text and Data Mining exception (DSM Directive Article 4).\n4. Publish a sufficiently detailed summary of the training data used (content publicly available).\n\nGPAI models with systemic risk (Article 51):\nA GPAI model is presumed to have systemic risk if it is trained with more than 10^25 FLOPs of compute. Additional models can be designated by the European Commission. Providers of systemic-risk GPAI models have additional obligations:\n1. Conduct model evaluations, including adversarial testing (red-teaming) to identify and mitigate systemic risks.\n2. Assess and mitigate systemic risks, including at Union level.\n3. Track, document, and report serious incidents and corrective measures.\n4. Ensure a level of cybersecurity protection appropriate to the systemic risks.\n5. Report energy consumption of the model's training.\n\nGovernance: The European AI Office (within the European Commission) is the supervisory authority for GPAI models and has the power to conduct evaluations, issue warnings, and impose sanctions. Fines for GPAI providers violating their obligations can reach EUR 15 million or 3% of worldwide annual turnover.`,
  },
  {
    id: 'EU-AIA-PENALTIES',
    title: 'Articles 99–101 — Penalties and Enforcement',
    category: 'Enforcement',
    description: 'The EU AI Act establishes a tiered penalty structure with fines up to EUR 35 million or 7% of worldwide turnover for the most serious violations, with specific provisions for SMEs.',
    guidance: `The EU AI Act establishes a tiered system of administrative fines corresponding to the severity of the violation:\n\nTier 1 — Maximum EUR 35 million or 7% of total worldwide annual turnover (whichever is higher):\n- Violations of the prohibited practices listed in Article 5 (unacceptable-risk AI systems)\n- This is the highest tier, reflecting the fundamental rights implications of these violations\n\nTier 2 — Maximum EUR 15 million or 3% of total worldwide annual turnover:\n- Non-compliance with any of the requirements and obligations set out in the Act other than those in Tier 1 and Tier 3\n- This covers most violations of Articles 9–15 (high-risk AI requirements) and GPAI model obligations\n\nTier 3 — Maximum EUR 7.5 million or 1% of total worldwide annual turnover:\n- Provision of incorrect, incomplete, or misleading information to notified bodies and national competent authorities\n\nFor SMEs and start-ups, the Act requires national supervisory authorities to apply the lower of the two figures (absolute cap or percentage) and to take due account of the interests and economic viability of SMEs when determining fines.\n\nEnforcement structure:\n- Each EU member state must designate one or more national competent authorities (NCAs) as market surveillance authorities\n- The European AI Office has enforcement powers over GPAI model providers\n- Market surveillance authorities have broad investigative powers: access to premises, inspection of documents, access to AI systems and data, collection of technical evidence\n- A European Artificial Intelligence Board (AIAIB) coordinates between member states and provides guidance\n\nTimeline: Most obligations apply from 2 August 2026. Prohibited practices obligations apply from 2 February 2025. GPAI obligations apply from 2 August 2025.`,
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    let { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'EU AI Act')
      .maybeSingle();

    if (!framework) {
      const { data } = await supabase.from('compliance_frameworks').insert({
        name: 'EU Artificial Intelligence Act',
        abbreviation: 'EU AI Act',
        description: 'Regulation (EU) 2024/1689 — the first comprehensive legal framework for AI in the world. Establishes a risk-based approach classifying AI systems into four tiers (unacceptable, high, limited, minimal risk) with proportionate obligations at each tier.',
        version: '2024',
        category: 'ai-safety',
      }).select('id').single();
      framework = data;
    }

    let { data: source } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', framework!.id)
      .maybeSingle();

    if (!source) {
      const { data } = await supabase.from('sources').insert({
        framework_id: framework!.id,
        name: 'EU AI Act — Official Text (OJ L 2024/1689)',
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689',
        source_type: 'webpage',
      }).select('id').single();
      source = data;
    }

    const { data: job } = await supabase.from('ingest_jobs').insert({
      source_id: source!.id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    }).select('id').single();

    let documentsIngested = 0;

    for (const item of EU_AI_ACT_DATA) {
      const rawContent = `# ${item.id}\n\n## Category\n${item.category}\n\n## Requirement\n${item.description}\n\n## Guidance\n${item.guidance}`;

      const embedding = await generateEmbedding(rawContent);

      const { data: doc } = await supabase.from('documents').insert({
        source_id: source!.id,
        framework_id: framework!.id,
        title: `${item.id} — ${item.title}`,
        document_type: 'control',
        raw_content: rawContent,
        metadata: { article_id: item.id, category: item.category },
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689',
      }).select('id').single();

      if (doc) {
        await insertChunk(doc.id, rawContent, embedding);
        documentsIngested++;
      }
    }

    await supabase.from('ingest_jobs').update({
      status: 'completed',
      documents_ingested: documentsIngested,
      completed_at: new Date().toISOString(),
    }).eq('id', job!.id);

    return new Response(JSON.stringify({ success: true, documents: documentsIngested }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
