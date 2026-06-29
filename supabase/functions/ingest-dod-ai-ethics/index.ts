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

// DoD AI Ethical Principles (adopted February 2020) + DoD AI Strategy (2018, updated)
// Source: https://www.ai.mil/docs/DoD_AI_Principles.pdf
// Responsible AI (RAI) Toolkit: https://rai.tradewindai.com

const DOD_AI_ETHICS_DATA = [
  {
    id: 'DOD-AI-OVERVIEW',
    title: 'DoD AI Ethical Principles — Overview and Adoption Context',
    category: 'Overview',
    description: 'The Department of Defense adopted five AI Ethical Principles in February 2020, following recommendations from the Defense Innovation Board. These principles apply to all DoD AI development, acquisition, and deployment.',
    guidance: `The Department of Defense (DoD) formally adopted five AI Ethical Principles on February 24, 2020, following a year-long effort by the Defense Innovation Board (DIB) to develop an ethical framework appropriate for AI used in defense contexts — including both combat and non-combat applications.\n\nThe five principles — Responsible, Equitable, Traceable, Reliable, and Governable — were developed with input from academic institutions, industry, civil society organizations, and extensive stakeholder consultation. They represent the first formal ethical framework for AI adopted by a major military organization.\n\nContext and scope:\n- The principles apply to all DoD AI development, acquisition, and deployment, including AI used in weapon systems, logistics, intelligence analysis, healthcare, personnel management, and administrative functions\n- They explicitly encompass both "lethal autonomous weapon systems" (LAWS) and "non-combat AI systems" — recognizing that ethical AI requirements apply across the full spectrum of defense AI applications\n- The principles are not legally binding regulations but establish the ethical framework within which DoD AI policy, acquisition standards, and operational guidance are developed\n- DoD Directive 3000.09 (Autonomous Weapon Systems) provides legally binding guidance on human control over weapons, complementing the ethical principles\n\nImplementation approach:\n- The Joint Artificial Intelligence Center (JAIC), now superseded by the Chief Digital and Artificial Intelligence Office (CDAO), was designated as the lead DoD organization for AI ethics implementation\n- The DoD Responsible AI (RAI) Toolkit was developed to provide concrete implementation guidance for the principles, organized around a set of RAI practices that organizations can adopt\n- Senior AI Advisor position was created to coordinate AI ethics implementation across the department\n- The principles align with and informed subsequent allied nation AI ethics frameworks (NATO AI Principles, 2021) and OECD AI Principles`,
  },
  {
    id: 'DOD-AI-P1',
    title: 'DoD AI Principle 1 — Responsible: Human Accountability for AI-Enabled Decisions',
    category: 'AI Ethical Principles',
    description: 'DoD personnel will exercise appropriate levels of judgment and care, while remaining responsible for the development, deployment, use, and outcomes of DoD AI systems.',
    guidance: `The Responsible principle addresses one of the most fundamental questions in AI ethics: when an AI system causes harm, who is accountable? The DoD's answer is unambiguous — humans remain responsible for all AI-enabled decisions, and this responsibility cannot be delegated to an AI system.\n\nKey elements of the Responsible principle:\n\n1. Human accountability is non-delegable: DoD personnel who design, develop, acquire, deploy, and use AI systems retain personal and institutional accountability for outcomes. The involvement of AI in a decision chain does not transfer or diminish the accountability of the humans in that chain.\n\n2. Appropriate levels of judgment: Different roles require different forms of accountability. A software engineer is accountable for code quality and testing; a program manager is accountable for acquisition decisions; an operator is accountable for appropriate use; a commander is accountable for mission-level decisions. Each must exercise judgment commensurate with their role and authority.\n\n3. Lifecycle responsibility: Responsibility does not end at deployment. DoD personnel who develop AI systems remain responsible for monitoring post-deployment performance, addressing unexpected behaviors, and ensuring that systems continue to operate as intended.\n\nImplementation guidance for defense AI organizations:\n- Establish clear accountability assignments for every phase of the AI lifecycle: design, development, testing, acquisition, deployment, operation, and decommissioning\n- Document accountability chains in AI system governance records and make them accessible to commanders and oversight personnel\n- Create escalation paths for responsible reporting of AI system failures, unexpected behaviors, or ethical concerns — including protections for personnel who raise concerns\n- Conduct regular accountability reviews to ensure that responsible personnel remain engaged with the AI systems for which they are accountable, especially as systems evolve and personnel rotate\n- Integrate AI accountability into standard after-action review processes: when an AI-enabled mission produces unintended outcomes, the review must address AI system performance alongside human decisions\n- Align with DoD Standards of Conduct: existing standards of conduct and professional military ethics apply to the use of AI systems just as they apply to the use of other tools and systems`,
  },
  {
    id: 'DOD-AI-P2',
    title: 'DoD AI Principle 2 — Equitable: Minimizing Unintended Bias in DoD AI',
    category: 'AI Ethical Principles',
    description: 'The DoD will take deliberate steps to minimize unintended bias in AI systems, ensuring that AI-enabled capabilities do not create conditions of unlawful discrimination against individuals based on legally protected characteristics.',
    guidance: `The Equitable principle requires the DoD to actively work to prevent AI systems from perpetuating or amplifying discriminatory bias. This principle has particular significance in defense contexts where AI is used in personnel decisions (promotions, assignments, evaluations) and in targeting (where misidentification can have lethal consequences).\n\nSources of bias in defense AI:\n\n1. Training data bias: Defense AI systems trained on historical military data may reflect past discriminatory practices. For example, promotion prediction models trained on historical promotion data from a period of lower diversity may systematically undervalue candidates from underrepresented groups.\n\n2. Proxy discrimination: Features that appear neutral — time-in-grade, duty assignment history, geographic posting — may serve as proxies for race, gender, or religion in ways that reflect historical structural inequalities rather than genuine predictors of performance.\n\n3. Population representativeness: AI systems designed for use across the force must perform equitably for all demographics in the force. A biometric identification system that performs poorly on darker skin tones creates operational inequity.\n\n4. Feedback loops: If AI systems influence decisions that shape the data used to retrain them (e.g., an AI-assisted talent management system that influences career paths, which then affect the AI's training data), bias can compound over time.\n\nImplementation guidance for defense AI equity:\n- Conduct bias assessments across all legally protected characteristics before deploying AI systems that affect personnel decisions\n- Test AI systems intended for use across diverse populations for equitable performance across demographic groups (race, gender, age, disability status)\n- For targeting and intelligence AI: rigorously test for false positive and false negative rates across the full range of potential targets to ensure that the system does not systematically misclassify protected populations\n- Establish bias monitoring as a standard post-deployment process: collect disaggregated performance data and review regularly\n- Create mechanisms for affected Service Members and DoD civilians to raise concerns about AI-influenced decisions affecting them, with appropriate review processes\n- Align equity requirements with Title VII, the Uniformed Services Employment and Reemployment Rights Act (USERRA), and DoD equal opportunity policies`,
  },
  {
    id: 'DOD-AI-P3',
    title: 'DoD AI Principle 3 — Traceable: Explainable and Auditable Defense AI',
    category: 'AI Ethical Principles',
    description: 'DoD AI systems will be developed and deployed such that relevant personnel understand the technology, the development processes, and the operational methods applicable to AI capabilities, including the data, processes, and design choices that led to AI conclusions.',
    guidance: `The Traceable principle addresses the "black box" problem in defense AI — ensuring that commanders, operators, and oversight authorities can understand, audit, and verify AI system behavior. Traceability is essential for legal compliance under the Laws of Armed Conflict (LOAC) and for maintaining meaningful human control over consequential decisions.\n\nTraceability dimensions in defense AI:\n\n1. Data traceability: Complete documentation of the training data used to develop an AI system, including its sources, collection methods, preprocessing steps, and known limitations. Traceability enables assessment of potential bias, data quality issues, and legal compliance.\n\n2. Development process traceability: Documentation of the design choices, architectural decisions, training methodology, evaluation approach, and verification and validation (V&V) results for each AI system. This enables retrospective understanding of why the system behaves as it does.\n\n3. Decision traceability: At the operational level, the ability to reconstruct why an AI system produced a specific output for a specific input at a specific time. This supports after-action review, investigations of incidents, and legal accountability.\n\n4. Audit trail: Logging of AI system inputs, outputs, and key operational parameters sufficient to support post-hoc investigation. For weapon systems with AI components, audit trails are essential for accountability under LOAC.\n\nExplainability requirements for defense AI:\n- Commander's level: Commanders employing AI-enabled systems need to understand what the system does, under what conditions it is reliable, and what its known failure modes are — without requiring deep technical expertise\n- Operator level: Operators must understand the basis for AI recommendations well enough to critically evaluate them and exercise appropriate judgment about whether to follow, modify, or override them\n- Oversight level: Inspector General, congressional oversight, and legal review require sufficient traceability to conduct meaningful audits of AI-enabled decisions\n\nLOAC compliance and traceability: Under the Law of Armed Conflict, commanders must be able to make a proportionality judgment for any use of force. If an AI system recommends a target and the commander approves, the commander must have sufficient understanding of the AI's methodology to make a meaningful proportionality assessment. This sets a minimum traceability threshold for any AI used in the targeting process.`,
  },
  {
    id: 'DOD-AI-P4',
    title: 'DoD AI Principle 4 — Reliable: Tested and Operating Within Defined Parameters',
    category: 'AI Ethical Principles',
    description: 'DoD AI systems will have an explicit, well-defined domain of use, and their safety, security, and robustness will have been tested and assured within that domain. Systems will be tested and evaluated against their intended use before deployment.',
    guidance: `The Reliable principle requires that DoD AI systems are thoroughly tested within their intended domain of use and that they operate predictably and consistently. In defense contexts, reliability failures can have kinetic consequences — making this principle especially critical.\n\nReliability requirements for defense AI:\n\n1. Explicit domain of use definition: Before deployment, the operational design domain (ODD) for each AI system must be explicitly defined. The ODD specifies the conditions under which the system is designed to perform reliably: environmental conditions, input ranges, threat scenarios, operational tempo, and integration context. AI systems must not be deployed outside their tested and validated ODD without additional V&V.\n\n2. Verification and Validation (V&V): DoD AI systems must undergo rigorous V&V processes adapted for AI's probabilistic nature. Traditional military system V&V frameworks (MIL-HDBK-502, IEEE 1012) must be supplemented with AI-specific testing methodologies:\n   - Statistical testing across the full input distribution\n   - Performance evaluation across worst-case and edge-case scenarios\n   - Adversarial robustness testing\n   - Integration testing in realistic operational environments\n\n3. Test and Evaluation (T&E): DoD Test and Evaluation commands (DOT&E, DT&E) have published AI T&E guidance requiring that AI systems demonstrate consistent performance across operational scenarios, including degraded environments (electronic warfare, contested communications, unusual atmospheric conditions).\n\n4. Operational reliability monitoring: After deployment, DoD AI systems must be monitored for performance degradation. Environmental changes, adversary adaptation, and data drift can degrade reliability over time. Monitoring programs must include reliability metrics appropriate to the specific system and operational context.\n\n5. Fail-safe design: Where AI system failure could result in casualties or significant mission failure, the system must be designed with fail-safe defaults. Autonomous weapon systems must have hardware-enforced safety measures (positive control, limits on engagement authority) that operate independently of the AI software.\n\nReliability standards alignment: DoD AI reliability requirements align with DO-178C (airborne software), IEC 61508 (functional safety), and emerging AI-specific standards under development in IEEE and ISO/IEC. MIL-STD-882E (System Safety) applies to AI components in weapon systems.`,
  },
  {
    id: 'DOD-AI-P5',
    title: 'DoD AI Principle 5 — Governable: Human Control and Safe Shutdown Capability',
    category: 'AI Ethical Principles',
    description: 'DoD AI systems will be designed to fulfill their intended functions while possessing the ability to detect and avoid unintended consequences, and to allow human operators to disengage or override the system when it is necessary to do so.',
    guidance: `The Governable principle addresses the control problem in defense AI — ensuring that human operators retain the ability to understand, override, and shut down AI systems, and that AI systems themselves can recognize when they are operating outside intended parameters.\n\nCore requirements of the Governable principle:\n\n1. Meaningful human control: AI systems must be designed to preserve meaningful human control over consequential decisions. "Meaningful" control requires more than a nominal human approval step — the human must have sufficient information, understanding, and time to make a genuine judgment rather than rubber-stamping an AI recommendation.\n\n2. Override capability: All DoD AI systems must provide operators with the capability to override AI outputs and, where appropriate, disengage AI assistance. This capability must be accessible in operational conditions — not just in training environments — and must not degrade overall system performance to the point of becoming impractical.\n\n3. Shutdown capability: AI systems must include reliable means for human operators to safely shut down AI system operation. For autonomous or semi-autonomous systems, this includes hardware-level interrupts that operate independently of the AI software stack.\n\n4. Self-monitoring and anomaly reporting: AI systems should be designed to detect when they are operating outside their intended parameters and to report anomalous behavior to human operators. This "knows what it doesn't know" capability is essential for governability — an AI system that operates confidently when it should not is more dangerous than one that appropriately flags uncertainty.\n\n5. Autonomy level management: AI systems designed to operate across multiple autonomy levels (human-in-the-loop, human-on-the-loop, fully autonomous) must maintain governability requirements at all autonomy levels. Commanders must have clear authority to adjust autonomy levels based on operational context and risk assessment.\n\nDoD Directive 3000.09 alignment: The Governable principle is directly implemented in DoDD 3000.09, which requires that autonomous weapon systems be designed to allow commanders and operators to exercise appropriate levels of human judgment over the use of force. The directive prohibits fully autonomous lethal decision-making (selecting and engaging targets without human authorization) except in specific, policy-approved, technically constrained scenarios.\n\nGovernability in AI acquisition: DoD AI acquisition programs should include governability requirements in system requirements documents (SRD), contract deliverable requirements, and acceptance testing. Vendor claims about "human in the loop" must be verified in realistic operational conditions.`,
  },
  // DoD AI Strategy Pillars
  {
    id: 'DOD-STRATEGY-1',
    title: 'DoD AI Strategy — Delivering AI-Enabled Capabilities at Speed and Scale',
    category: 'DoD AI Strategy',
    description: 'The DoD AI Strategy (2018) established a framework for accelerating AI adoption while maintaining ethical guardrails. Key pillars include delivering AI capabilities at speed, establishing AI centers of excellence, and partnering with industry and academia.',
    guidance: `The DoD Artificial Intelligence Strategy, released in February 2019 (publicly), established the framework for the department's AI transformation. The strategy was built around a recognition that AI represents a strategic technology competition and that the DoD must move rapidly to integrate AI capabilities while maintaining ethical standards and operational effectiveness.\n\nKey pillars of the DoD AI Strategy:\n\n1. Deliver AI-enabled capabilities at speed and scale: The strategy prioritized rapid delivery of AI capabilities through Agile development methodologies, cloud infrastructure, and streamlined acquisition pathways. The Joint Artificial Intelligence Center (JAIC) was designated as the department's AI hub, responsible for delivering AI capabilities across warfighting, business, and enterprise functions.\n\n2. Establish a strong AI foundation: The strategy identified foundational requirements for AI adoption: cloud computing infrastructure, data management and sharing frameworks, digital talent, and a common software development environment. The JAIC's National Mission Initiatives addressed joint force challenges; Business Mission Area initiatives targeted enterprise efficiency.\n\n3. Partner with industry, academia, and allies: The DoD recognized that it cannot lead in AI development alone. The strategy called for deep partnerships with the US technology industry, academic research institutions, and allied nation defense establishments. This informed the establishment of the DoD-academic AI research partnerships and the Joint AI Alliance with allied nations.\n\n4. Lead in military ethics and AI safety: A distinguishing feature of the DoD AI Strategy was its explicit commitment to leading on AI ethics. Rather than treating ethics as a constraint on AI capability, the strategy framed ethical AI as a competitive advantage — building trust with the public, Congress, and allies that DoD AI capabilities are used responsibly.\n\n5. Cultivate a workforce for AI-enabled operations: The strategy recognized that technology adoption fails without appropriate workforce development. It called for AI literacy training across the force, specialist training for AI practitioners, and culture change to support data-driven decision-making.\n\nChief Digital and Artificial Intelligence Office (CDAO): In 2022, the DoD consolidated its AI, data, and digital functions into the CDAO, which absorbed the JAIC and Defense Digital Service functions. The CDAO is responsible for implementing the DoD AI strategy and the ethical principles.`,
  },
  {
    id: 'DOD-STRATEGY-2',
    title: 'DoD AI Strategy — Data Management and AI Enablement',
    category: 'DoD AI Strategy',
    description: 'The DoD AI Strategy identified data management as a foundational enabler for AI. The DoD Data Strategy (2020) established data as a strategic asset and defined eight guiding principles for DoD data management.',
    guidance: `The DoD AI Strategy recognized from the outset that data is the primary fuel for AI systems, and that the DoD's existing data infrastructure — characterized by siloed systems, inconsistent formats, and limited sharing — was a major impediment to AI adoption.\n\nDoD Data Strategy (2020) and its AI implications:\nThe DoD Data Strategy established eight guiding principles for DoD data management: Visible, Accessible, Understandable, Linked, Trustworthy, Interoperable, and Secure (VAULTIS). The strategy also established four essential data activities: Make Data Visible, Make Data Accessible, Make Data Understandable, and Make Data Linked.\n\nKey data management requirements for AI-ready data:\n\n1. Data visibility and discovery: AI development requires the ability to find relevant data across the enterprise. DoD data catalogs (enterprise data inventories) must be comprehensive, searchable, and accessible to authorized AI development teams. Shadow data — data assets unknown to the enterprise — are a significant risk.\n\n2. Data accessibility and sharing: Data needed for AI training must be accessible across organizational boundaries where authorized. Existing data sharing barriers (classification, Privacy Act, proprietary restrictions) must be managed rather than allowed to impede AI development entirely. Data tagging, access control, and audit logging enable sharing with appropriate safeguards.\n\n3. Data quality for AI: Standard data quality dimensions (accuracy, completeness, consistency, timeliness) must be measured and managed for AI training data. AI systems trained on low-quality data produce unreliable outputs regardless of model sophistication.\n\n4. Data provenance and lineage: For AI traceability (Principle 3), complete provenance of training data must be maintained. Data lineage tools track the origin, transformation history, and quality assessment of data used in AI training.\n\n5. Responsible data sharing with allies: The DoD's Coalition AI strategy requires sharing AI capabilities and data with allied nations, subject to classification and release authority frameworks. AI systems must be designed with data release requirements in mind from the outset.`,
  },
  // RAI Toolkit Practices
  {
    id: 'DOD-RAI-1',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 1: Governance and Accountability',
    category: 'RAI Toolkit Practices',
    description: 'The RAI Toolkit Practice 1 establishes organizational governance structures, accountability assignments, and oversight processes required to implement the DoD AI Ethical Principles.',
    guidance: `The DoD Responsible AI (RAI) Toolkit, developed by the Chief Digital and Artificial Intelligence Office (CDAO), provides structured implementation guidance for the five DoD AI Ethical Principles. The Toolkit is organized around a set of RAI Practices that cover governance, product development, testing, and operations.\n\nRAI Practice 1 — Governance and Accountability:\n\nOrganizational governance requirements:\n1. Designate AI accountable officials: Each DoD Component conducting AI development or deployment must designate senior-level accountable officials for AI ethics implementation. These officials are responsible for ensuring compliance with the principles and for escalating issues to senior leadership.\n\n2. Establish AI oversight bodies: Components should establish AI Governance Boards or similar bodies responsible for reviewing high-risk AI systems before deployment, monitoring performance post-deployment, and adjudicating ethical concerns.\n\n3. Define AI system categorization: Not all AI systems require the same level of governance scrutiny. Establish a risk-based categorization scheme (analogous to FISMA impact levels) that determines the level of governance review required. High-risk AI systems (those affecting personnel, lethal force, or sensitive operations) require more intensive oversight.\n\n4. Integrate ethics into acquisition: AI acquisition programs must include ethical requirements in Statements of Work, evaluation criteria, and contract deliverable requirements. Acquisition professionals must be trained to assess vendor compliance with DoD AI ethical principles.\n\n5. Establish AI incident reporting: Create channels for reporting AI system failures, unexpected behaviors, and ethical concerns. Reports should be analyzed at the Component level and systemic issues escalated to CDAO.\n\n6. Congressional and public transparency: DoD should provide appropriate transparency about AI capabilities, ethical frameworks, and governance mechanisms to Congress and the public, consistent with classification and operational security requirements. This includes annual reporting on AI ethics implementation progress.`,
  },
  {
    id: 'DOD-RAI-2',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 2: Product and Test Teams',
    category: 'RAI Toolkit Practices',
    description: 'The RAI Toolkit Practice 2 addresses the composition, training, and processes for AI product development and testing teams, including requirements for diverse teams, AI ethics training, and red-teaming.',
    guidance: `RAI Practice 2 — Product and Test Teams addresses the people and processes needed to build and evaluate responsible AI within DoD.\n\nTeam composition requirements:\n1. Diversity of perspective: AI development teams should be diverse in gender, race, technical background, and operational experience. Diverse teams are more likely to identify potential failure modes, biases, and unintended consequences that homogeneous teams miss. For defense AI systems, including operators with relevant combat or operational experience in the development team is especially important.\n\n2. AI ethics integration in team structure: Designated AI ethics reviewers or responsible AI practitioners should be embedded in AI product teams, not siloed in a separate compliance function. Ethical review must be integrated into the development process from the beginning, not appended as a final gate.\n\n3. Multi-disciplinary composition: AI teams should include technical roles (ML engineers, data scientists, software engineers) alongside non-technical roles (domain experts, legal, policy, human factors specialists, user experience researchers). The domain expert is often best positioned to identify when AI behavior is operationally unrealistic or dangerous.\n\nTraining requirements:\n- All DoD AI practitioners must complete AI ethics training, including training on the five principles, the RAI Toolkit, and case studies of AI ethical failures\n- Operators and commanders who will use AI-enabled systems must receive training on AI capabilities, limitations, and the risks of automation bias\n- Acquisition personnel must be trained on evaluating AI system compliance with ethical requirements\n\nRed-teaming and adversarial testing:\n- Before deployment, high-risk AI systems must undergo adversarial red-teaming focused on failure modes, bias, adversarial attacks, and misuse scenarios\n- Red teams should include personnel with relevant adversarial expertise, as well as personnel representing the populations most likely to be adversely affected by the system\n- Red team findings must be documented, reviewed by the AI Governance Board, and addressed before deployment authorization`,
  },
  {
    id: 'DOD-RAI-3',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 3: AI System Documentation',
    category: 'RAI Toolkit Practices',
    description: 'The RAI Toolkit Practice 3 specifies the documentation requirements for DoD AI systems, including AI system cards, data documentation, and verification and validation records.',
    guidance: `RAI Practice 3 — AI System Documentation establishes a comprehensive documentation framework for DoD AI systems, supporting all five ethical principles through structured information capture and retention.\n\nDoD AI System Card:\nAll DoD AI systems above the minimum risk threshold must have an AI System Card — a structured document covering:\n1. System identification: name, version, purpose, classification level, development organization, and accountable officials\n2. Intended use: specific use cases, operational context, authorized users, and scope of autonomy\n3. Prohibited uses: explicitly documented out-of-scope uses and misuse scenarios\n4. Data documentation: training data sources, preprocessing steps, known data quality issues, bias assessments conducted\n5. Performance metrics: accuracy, reliability, and fairness metrics disaggregated by relevant subgroups; test environment description\n6. Limitations and failure modes: known conditions under which the system may underperform or fail\n7. Human oversight requirements: the level of human oversight required, operator training requirements, override procedures\n8. Security and privacy: security controls implemented, privacy impact assessment results, relevant classification\n9. Monitoring requirements: ongoing monitoring plan, performance thresholds that trigger review\n10. Incident history: documented incidents and corrective actions taken\n\nData documentation standards:\n- Training data must be documented with complete lineage: source, collection methodology, processing steps, quality metrics, bias analysis\n- Test data must be documented separately from training data, with justification for why it is representative of deployment conditions\n- Operational data (data processed at inference time) must be documented with retention and access control specifications\n\nV&V records:\n- All verification and validation test results must be retained and linked to the AI System Card\n- V&V records must be updated when the system is substantially modified`,
  },
  {
    id: 'DOD-RAI-4',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 4: Operational Monitoring and Feedback',
    category: 'RAI Toolkit Practices',
    description: 'The RAI Toolkit Practice 4 establishes requirements for ongoing operational monitoring of deployed AI systems, including performance tracking, incident management, and continuous improvement processes.',
    guidance: `RAI Practice 4 — Operational Monitoring and Feedback addresses the post-deployment phase of the AI lifecycle, ensuring that responsible AI commitments are maintained throughout the system's operational life, not just at initial deployment.\n\nOperational monitoring program requirements:\n\n1. Performance monitoring: Deploy monitoring infrastructure that continuously tracks AI system performance metrics in production. Define performance baselines during pre-deployment testing and configure alerting when performance degrades below acceptable thresholds. For defense systems, performance degradation in operationally critical scenarios must trigger immediate review.\n\n2. Bias monitoring: Collect disaggregated performance data across relevant population groups throughout the system's operational life. Bias that was acceptable at initial deployment may worsen over time as operational data distributions shift. Schedule regular bias audits and have a remediation process when bias thresholds are exceeded.\n\n3. Incident management: Establish an AI incident management process that captures, analyzes, and responds to AI system failures, unexpected behaviors, operator complaints, and near-misses. Incidents should be categorized by severity and type; high-severity incidents require immediate reporting to accountable officials and may trigger system suspension pending investigation.\n\n4. User and operator feedback: Create structured channels for operators and users to provide feedback on AI system performance, including concerns about bias, unexpected behavior, and operational limitations. Feedback should be systematically analyzed and used to inform model updates, retraining, and documentation improvements.\n\n5. After-action review integration: For operational AI systems, integrate AI performance review into standard after-action review (AAR) processes. AARs should assess whether AI systems performed as expected, whether operators appropriately exercised judgment about AI recommendations, and whether any AI-related lessons should inform training or system updates.\n\n6. Retraining governance: When AI systems are retrained (to address performance degradation, incorporate new data, or fix bias issues), the retraining process must follow the same governance requirements as initial development: data governance, V&V, ethics review, and deployment authorization.`,
  },
  {
    id: 'DOD-RAI-5',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 5: AI in Warfighting Applications',
    category: 'RAI Toolkit Practices',
    description: 'The RAI Toolkit Practice 5 provides specific guidance for AI used in warfighting applications, including targeting, logistics, intelligence analysis, and autonomous systems, with a focus on LOAC compliance and human control.',
    guidance: `RAI Practice 5 — AI in Warfighting Applications addresses the unique ethical and legal considerations that arise when AI is used in military operations. This practice has the most direct interface with the Law of Armed Conflict (LOAC) and DoD Directive 3000.09 on Autonomous Weapon Systems.\n\nLOAC-relevant AI applications:\n\n1. Targeting support AI: AI systems used to support the targeting process — identifying, tracking, discriminating, or prioritizing targets — must comply with the principles of distinction (discriminating between combatants and civilians), proportionality (expected civilian casualties not excessive relative to military advantage), and precaution (taking feasible precautions to reduce civilian harm). AI cannot make these assessments autonomously; human commanders must make targeting decisions with full understanding of the basis for AI recommendations.\n\n2. Intelligence analysis AI: AI used in intelligence preparation of the battlefield (IPB), signals intelligence analysis, pattern of life analysis, and threat assessment must be evaluated for accuracy and bias across all relevant populations. Intelligence AI errors that affect civilian populations can have lethal consequences.\n\n3. Logistics and support AI: While lower risk than warfighting AI, logistics AI (route planning, supply chain optimization, maintenance prediction) must still comply with reliability and traceability requirements. Logistics failures can degrade mission effectiveness and create force protection risks.\n\n4. Autonomous systems (UAS, autonomous ground vehicles, autonomous maritime systems): The most sensitive category. Must comply with DoDD 3000.09, which requires appropriate levels of human judgment over use of force. Systems that select and engage targets without human authorization are prohibited except in specific, policy-approved configurations with hardware safety constraints.\n\nOperational testing requirements for warfighting AI:\n- Testing must include realistic operational scenarios including contested electromagnetic environments, degraded communications, and adversarial countermeasures\n- Red teams must include both cybersecurity adversarial testing and adversarial ML testing\n- Operational testing must demonstrate performance at system limits and document behavior at performance boundaries\n- Coalition interoperability testing is required for systems intended for joint or allied operations`,
  },
  {
    id: 'DOD-INTL-ALIGNMENT',
    title: 'DoD AI Ethics and International Alignment — NATO, OECD, and Allied Frameworks',
    category: 'International Alignment',
    description: 'The DoD AI Ethical Principles align with and have influenced allied nation and international AI ethics frameworks, including the NATO Principles of Responsible Use of AI in Defence (2021) and OECD AI Principles.',
    guidance: `The DoD AI Ethical Principles have had significant influence on allied nation defense AI ethics frameworks and international AI governance discussions. Understanding these alignments supports coalition AI interoperability and demonstrates the global emergence of convergent AI ethics norms.\n\nNATO Principles of Responsible Use of AI in Defence (October 2021):\nNATO adopted six principles of responsible use of AI in defence, building directly on the DoD's five principles:\n1. Lawfulness — AI must be developed and used in accordance with applicable international and domestic law\n2. Responsibility and accountability — Human accountability for AI-enabled decisions\n3. Explainability and traceability — Corresponds to DoD's Traceable principle\n4. Reliability — AI must be reliable, tested, and appropriate for its intended purpose\n5. Governability — Human oversight and control must be maintained\n6. Bias mitigation — Unintended bias must be minimized\n\nAlignment with OECD AI Principles (2019):\nThe OECD AI Principles, which the United States endorsed, are aligned with the DoD principles:\n- OECD Accountability ↔ DoD Responsible\n- OECD Transparency and Explainability ↔ DoD Traceable\n- OECD Robustness, Security, Safety ↔ DoD Reliable + Governable\n- OECD Fairness ↔ DoD Equitable\n\nG7 Hiroshima AI Process (2023): The G7 Hiroshima AI Process, which produced the International Guiding Principles on AI and a Code of Conduct for AI Developers, reflects convergence on responsible AI norms including traceability, reliability, and human oversight — all core to the DoD framework.\n\nImplications for coalition AI interoperability:\n- DoD AI systems deployed in coalition operations must meet the ethical standards of allied nations, which may differ in specifics (e.g., EU AI Act requirements for allied commercial AI providers)\n- Data sharing with allies requires alignment on data governance, bias assessment, and traceability standards\n- Coalition AI development programs should establish shared ethical review processes and mutual recognition of testing results where standards are aligned`,
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    let { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'DoD AI Ethics')
      .maybeSingle();

    if (!framework) {
      const { data } = await supabase.from('compliance_frameworks').insert({
        name: 'Department of Defense AI Ethical Principles and Responsible AI Toolkit',
        abbreviation: 'DoD AI Ethics',
        description: 'The DoD adopted five AI Ethical Principles in February 2020: Responsible, Equitable, Traceable, Reliable, and Governable. The Responsible AI (RAI) Toolkit provides structured implementation guidance for applying these principles across the AI lifecycle in defense contexts.',
        version: '2020',
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
        name: 'DoD AI Ethical Principles and RAI Toolkit — ai.mil / rai.tradewindai.com',
        url: 'https://www.ai.mil/docs/DoD_AI_Principles.pdf',
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

    for (const item of DOD_AI_ETHICS_DATA) {
      const rawContent = `# ${item.id}\n\n## Category\n${item.category}\n\n## Requirement\n${item.description}\n\n## Guidance\n${item.guidance}`;

      const embedding = await generateEmbedding(rawContent);

      const { data: doc } = await supabase.from('documents').insert({
        source_id: source!.id,
        framework_id: framework!.id,
        title: `${item.id} — ${item.title}`,
        document_type: 'control',
        raw_content: rawContent,
        metadata: { practice_id: item.id, category: item.category },
        url: 'https://www.ai.mil/docs/DoD_AI_Principles.pdf',
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
