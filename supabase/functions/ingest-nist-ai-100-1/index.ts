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

// NIST AI 100-1: Artificial Intelligence Risk Management Framework: Trustworthy and Responsible AI
// Published January 2023 by the National Institute of Standards and Technology
// Source: https://doi.org/10.6028/NIST.AI.100-1

const NIST_AI_100_1_DATA = [
  // Overview and Context
  {
    id: 'AI100-1-OVERVIEW',
    title: 'NIST AI 100-1 Overview — Trustworthy and Responsible AI Framework',
    category: 'Overview',
    description: 'NIST AI 100-1 is the foundational reference document for understanding trustworthy AI. It defines trustworthy AI characteristics, explores sociotechnical dimensions of AI risk, and supports implementation of the NIST AI Risk Management Framework (AI RMF 1.0).',
    guidance: `NIST AI 100-1, "Artificial Intelligence Risk Management Framework: Trustworthy and Responsible AI," was published by the National Institute of Standards and Technology in January 2023. It serves as the conceptual foundation and technical companion to the NIST AI RMF 1.0, which was released simultaneously.\n\nThe document takes a distinctly sociotechnical view of AI risk — recognizing that AI risks cannot be addressed through technical controls alone, but require organizational, cultural, and process changes as well. Key concepts established in AI 100-1:\n\n1. Trustworthy AI Characteristics: The document defines seven characteristics of trustworthy AI systems (valid and reliable, safe, secure and resilient, explainable and interpretable, privacy-enhanced, fair with managed bias, accountable and transparent) and explains how these properties are interrelated, sometimes in tension, and must be balanced based on context.\n\n2. AI Lifecycle: AI 100-1 frames risk management activities across the full AI lifecycle: design, data collection and processing, model building and interpretation, deployment, operation and monitoring, and retirement.\n\n3. Sociotechnical context: The document emphasizes that AI systems are sociotechnical — they are embedded in social contexts that shape their risks and impacts. Technical performance metrics alone are insufficient for assessing trustworthiness.\n\n4. Risk hierarchy: AI 100-1 distinguishes between risks to individuals, groups, organizations, and society — noting that some harms may be systemic and not visible at the individual level.\n\nAI 100-1 is a voluntary guidance document for organizations operating in the United States. However, it is referenced by federal agency AI policies (OMB M-24-10), state AI legislation, international standards bodies (ISO/IEC), and the EU AI Act's alignment discussions. Organizations building AI governance programs should use AI 100-1 as their technical reference alongside the AI RMF playbook.`,
  },
  // Trustworthy Characteristics
  {
    id: 'AI100-1-TC-1',
    title: 'Trustworthy Characteristic 1 — Valid and Reliable AI',
    category: 'Trustworthy AI Characteristics',
    description: 'AI systems should be valid — performing as intended across all conditions for which they are designed — and reliable — maintaining consistent and correct performance across the system lifecycle.',
    guidance: `Validity and reliability are foundational properties of trustworthy AI. Without them, none of the other trustworthy characteristics can be meaningfully claimed.\n\nValidity in AI has two dimensions:\n\n1. Internal validity: Whether the AI system accurately captures the relationships it was designed to model, given the data and methods used in development. An internally invalid model has learned spurious correlations rather than genuine causal or predictive relationships.\n\n2. External validity (generalizability): Whether the AI system's performance on training and test data generalizes to real-world deployment conditions. Distribution shift — where the deployment environment differs from the training environment — is a primary cause of external validity failure.\n\nReliability refers to the consistency of performance over time, across different users, and under varying conditions. A reliable system produces the same correct output for the same input and maintains acceptable accuracy as conditions change within expected parameters.\n\nKey practices for validity and reliability:\n- Conduct rigorous train/validate/test splits with held-out test sets that represent the deployment distribution\n- Test for performance across subpopulations and edge cases — not just aggregate accuracy\n- Implement concept drift monitoring: continuously measure whether model performance degrades as the deployment data distribution evolves\n- Define clear accuracy thresholds that trigger model retraining or human review escalation\n- Conduct pre-deployment operational testing in a realistic staging environment before production release\n- Document all known limitations and the conditions under which the system may fail — this informs the instructions for use\n- Apply statistical uncertainty quantification: models should express confidence levels so that users can assess when outputs are reliable vs. uncertain\n- For high-stakes systems, conduct adversarial testing to identify inputs that cause incorrect confident predictions`,
  },
  {
    id: 'AI100-1-TC-2',
    title: 'Trustworthy Characteristic 2 — Safe AI',
    category: 'Trustworthy AI Characteristics',
    description: 'AI systems should not, under defined conditions of use, create safety risks to people or the environment. Safety engineering must be integrated throughout the AI development lifecycle.',
    guidance: `Safety in the context of AI systems means that the system does not cause unintended harm to people, property, or the environment when used as intended or under reasonably foreseeable misuse conditions. AI 100-1 distinguishes AI safety from traditional software safety in several important ways:\n\n1. Unpredictability: Unlike deterministic software, many AI systems (especially those using deep learning) produce outputs that cannot be fully predicted from their design alone. Safety cannot be guaranteed through code inspection — it must be empirically validated at scale.\n\n2. Emergent behaviors: Large AI models can exhibit capabilities and failure modes that were not anticipated during development. Safety engineering must account for the possibility of emergent behaviors that were not designed in.\n\n3. Environmental feedback loops: AI systems that take actions in the world (autonomous vehicles, industrial robots, AI agents) create feedback loops where unsafe outputs can trigger environmental responses that compound harm.\n\nSafety engineering practices for AI:\n- Apply Failure Mode and Effects Analysis (FMEA) or System Theoretic Process Analysis (STPA) adapted for AI components\n- Define the operational design domain (ODD) — the specific conditions under which the system is designed to operate safely — and test behavior at ODD boundaries\n- Implement fail-safe defaults: when the AI system encounters uncertainty above a threshold, it should defer to a safe state (e.g., human review, conservative output, graceful degradation)\n- Implement runtime monitoring to detect anomalous outputs and trigger safety interventions\n- Conduct red team exercises focused on safety-relevant failure modes\n- Test multi-system interactions: an AI component that is safe in isolation may create safety hazards when integrated into a larger system\n- Maintain a safety case document: a structured argument, supported by evidence, that the AI system is acceptably safe for its intended operational context`,
  },
  {
    id: 'AI100-1-TC-3',
    title: 'Trustworthy Characteristic 3 — Secure and Resilient AI',
    category: 'Trustworthy AI Characteristics',
    description: 'AI systems should resist adversarial attacks and maintain acceptable function despite intentional perturbations, as well as recover gracefully from disruptions.',
    guidance: `Security and resilience for AI systems goes beyond traditional cybersecurity. AI introduces novel attack surfaces that require specific technical countermeasures:\n\nAdversarial threats to AI systems:\n\n1. Data poisoning attacks: Adversaries inject malicious data into training sets to corrupt model behavior. This is particularly concerning when training data is sourced from the internet, crowdsourcing, or untrusted partners. Mitigation: validate data provenance, apply anomaly detection to training data, use robust training techniques (e.g., randomized smoothing, certified defenses).\n\n2. Adversarial examples: Inputs crafted by adversaries to cause misclassification, often by applying imperceptible perturbations to valid inputs. These can fool image classifiers, speech recognition, and NLP models. Mitigation: adversarial training, input preprocessing defenses, ensemble methods, confidence thresholding.\n\n3. Model stealing / extraction attacks: Adversaries query a deployed model repeatedly to extract a functional copy of the model, violating intellectual property and potentially revealing security controls. Mitigation: rate limiting, query watermarking, output perturbation.\n\n4. Membership inference attacks: Adversaries determine whether specific records were in the training data, potentially violating privacy. Mitigation: differential privacy in training, output smoothing.\n\n5. Model inversion attacks: Adversaries reconstruct training data features from model outputs. Mitigation: differential privacy, output minimization.\n\nResilience engineering:\n- Design for graceful degradation: when the AI component fails, the overall system should fall back to a less capable but safe mode rather than fail completely\n- Implement redundancy for critical AI components — multiple models, ensemble voting, human fallback\n- Conduct regular adversarial testing (penetration testing adapted for AI) before and after deployment\n- Apply NIST SP 800-53 security controls to the AI system's supporting infrastructure, with AI-specific overlays\n- Monitor for anomalous input distributions at inference time — these may indicate active adversarial attack`,
  },
  {
    id: 'AI100-1-TC-4',
    title: 'Trustworthy Characteristic 4 — Explainable and Interpretable AI',
    category: 'Trustworthy AI Characteristics',
    description: 'AI systems should provide outputs that can be understood by the people who use, oversee, or are affected by them. Explainability and interpretability are distinct but complementary properties.',
    guidance: `NIST AI 100-1 makes a careful distinction between explainability and interpretability, two terms often used interchangeably but with distinct meanings:\n\nInterpretability: The degree to which the internal logic of an AI system — how it transforms inputs to outputs — can be understood. An interpretable model is one whose decision process is transparent by design. Examples: linear regression (where coefficients can be directly interpreted), decision trees (where decision paths are traceable), rule-based systems.\n\nExplainability: The degree to which an AI system can produce post-hoc explanations of its outputs that are meaningful to humans, even if the underlying model is not inherently interpretable. Explainable AI (XAI) methods generate explanations for black-box models without requiring the model to be interpretable.\n\nKey XAI techniques:\n- LIME (Local Interpretable Model-agnostic Explanations): Approximates the black-box model locally around a specific prediction using an interpretable surrogate model\n- SHAP (SHapley Additive exPlanations): Attributes a prediction to individual features using Shapley values from cooperative game theory\n- Saliency maps and attention visualization: Identifies which regions of an input (e.g., pixels in an image) most influenced the model's output\n- Counterfactual explanations: Answers "what would need to be different about this input for the model to produce a different output?" — particularly useful for affected individuals\n- Concept-based explanations (TCAV): Explains model behavior in terms of human-defined concepts rather than raw features\n\nContextual considerations:\n- Explanations must be appropriate for their audience: a data scientist, a frontline worker, and an affected citizen need different types of explanation\n- Explanations of predictions for high-stakes decisions (lending, medical diagnosis, criminal justice) must be meaningful enough that humans can genuinely evaluate and override them\n- Explanation fidelity: an explanation must accurately reflect how the model actually made its decision, not just be plausible-sounding\n- AI 100-1 notes a "fidelity-interpretability tension": simpler explanations are easier to understand but may distort the underlying model's true reasoning`,
  },
  {
    id: 'AI100-1-TC-5',
    title: 'Trustworthy Characteristic 5 — Privacy-Enhanced AI',
    category: 'Trustworthy AI Characteristics',
    description: 'AI systems should be designed and operated in ways that protect individual privacy, including through privacy-by-design principles and technical privacy-preserving methods.',
    guidance: `Privacy-enhanced AI requires integrating privacy protection throughout the AI lifecycle — from data collection through training, deployment, and retirement. NIST AI 100-1 frames privacy not as a compliance checkbox but as a core design value.\n\nPrivacy risks in AI systems:\n\n1. Training data privacy risks: AI models trained on personal data may memorize and inadvertently reproduce sensitive training data in their outputs. Language models have been shown to leak personally identifiable information (PII) verbatim from training data.\n\n2. Inference-time privacy risks: Even without training on personal data, AI systems that process personal data at inference time create privacy risks through unauthorized use, data breach, or inference of sensitive attributes.\n\n3. Aggregation risks: AI systems that combine data from multiple sources can infer sensitive information that no single source would reveal — the "aggregation problem" in privacy.\n\nPrivacy-preserving AI techniques:\n\n- Differential Privacy (DP): Mathematical framework that adds calibrated noise to data or model updates to ensure that the presence or absence of any individual record cannot be inferred from outputs. DP training (e.g., DP-SGD) applies noise during gradient updates, providing provable privacy guarantees at the cost of some model accuracy.\n\n- Federated Learning: Distributes model training across data holders without centralizing raw data. Each participant trains locally; only model updates (not data) are shared. Reduces privacy risk from data centralization.\n\n- Homomorphic Encryption: Allows computation on encrypted data without decryption. Enables AI inference on sensitive data without the model provider ever seeing the raw input.\n\n- Synthetic Data Generation: Replace real training data with statistically representative synthetic data. Privacy-safe if the generation process itself is privacy-preserving (e.g., differentially private GAN).\n\n- Data minimization and purpose limitation: Collect and retain only the data necessary for the defined AI task; enforce strict access controls and retention limits.\n\nPrivacy governance practices:\n- Conduct a Privacy Impact Assessment (PIA) before deploying AI systems that process personal data\n- Apply NIST Privacy Framework 1.0 in conjunction with AI 100-1\n- Establish data subject rights workflows: mechanisms for access, correction, deletion, and portability of personal data used in AI systems\n- Audit AI system outputs for unintended PII disclosure, especially for generative AI`,
  },
  {
    id: 'AI100-1-TC-6',
    title: 'Trustworthy Characteristic 6 — Fair AI with Managed Bias',
    category: 'Trustworthy AI Characteristics',
    description: 'AI systems should not create or reinforce unjustified bias and discrimination. Fairness is a sociotechnical concept that requires both technical bias mitigation and organizational accountability.',
    guidance: `Fairness and bias management is one of the most complex dimensions of trustworthy AI because "fairness" is not a single mathematical property — there are multiple, often mutually incompatible, formal definitions of algorithmic fairness. NIST AI 100-1 takes a nuanced approach, distinguishing between types of bias and approaches to mitigation.\n\nTypes of bias in AI:\n\n1. Statistical bias: Systematic error in a model's predictions — the model is consistently wrong in a particular direction. This includes bias in the technical sense (bias-variance tradeoff) and is addressed through better data and modeling.\n\n2. Cognitive bias: Human cognitive errors introduced during system design, annotation, and evaluation — such as confirmation bias (designing systems to confirm pre-existing beliefs) or availability bias (over-representing easily available data).\n\n3. Systemic bias: Historical patterns of inequality and discrimination encoded in training data, resulting in AI systems that perpetuate or amplify those patterns. A classic example is résumé screening AI that discriminates against women because it was trained on historical hiring decisions made in a male-dominated workforce.\n\nFormal fairness definitions (selected):\n- Demographic parity: Equal positive prediction rates across groups\n- Equalized odds: Equal true positive and false positive rates across groups\n- Individual fairness: Similar individuals receive similar treatment\n- Counterfactual fairness: The decision would be the same if the individual had belonged to a different protected group\n\nNote: It is mathematically impossible to simultaneously satisfy most formal fairness definitions when base rates differ across groups (Chouldechova 2017, Kleinberg et al. 2016). Organizations must choose which fairness definition is most appropriate for their use case and be explicit about this choice.\n\nBias mitigation strategies:\n- Pre-processing: Rebalance or re-weight training data to reduce historical bias; remove proxy variables for protected attributes\n- In-processing: Incorporate fairness constraints directly into the training objective (adversarial debiasing, regularization)\n- Post-processing: Adjust model outputs (thresholds, calibration) to achieve fairness targets across groups\n- Organizational: Diverse AI development teams; structured fairness review processes; affected community consultation\n\nFairness auditing:\n- Disaggregate all performance metrics by relevant demographic groups\n- Test for disparate impact: if an AI system disproportionately disadvantages a protected group, document the justification or remediate\n- Engage affected communities in defining what fairness means in the specific context`,
  },
  {
    id: 'AI100-1-TC-7',
    title: 'Trustworthy Characteristic 7 — Accountable and Transparent AI',
    category: 'Trustworthy AI Characteristics',
    description: 'AI systems should be accompanied by clear accountability structures and sufficient transparency for stakeholders to understand how decisions are made and who bears responsibility.',
    guidance: `Accountability and transparency are governance-level trustworthy AI characteristics that complement the technical properties of the other six. They address the question of who is responsible for AI system behavior and how that behavior can be scrutinized.\n\nTransparency dimensions in AI:\n\n1. Process transparency: How was the AI system designed, developed, and evaluated? This includes documentation of design choices, training data sources, evaluation methodology, and known limitations.\n\n2. System transparency: What does the AI system do, and how? This includes technical documentation appropriate to different audiences — full technical documentation for developers and regulators, accessible summaries for deployers, and plain-language disclosures for affected individuals.\n\n3. Outcome transparency: What decisions or recommendations does the AI system make, and what was the basis? For consequential AI decisions, affected individuals should be able to understand why the AI produced the output it did.\n\nAccountability structures:\n\n- Human accountability: Clear designation of responsible humans for AI system design, deployment, and outcomes. AI systems cannot bear legal or moral responsibility — accountability must flow to human actors.\n\n- Organizational accountability: Internal governance structures (AI ethics review boards, AI risk committees, responsible AI officers) that ensure AI development and deployment decisions receive appropriate scrutiny.\n\n- External accountability: Mechanisms for external stakeholders (regulators, civil society, affected communities) to scrutinize AI system design and outcomes. This may include third-party audits, regulatory filings, and public reporting.\n\nModel cards and system cards:\n- Model cards (Mitchell et al. 2019): Structured documentation for AI models covering intended use, performance metrics disaggregated by subgroup, limitations, and ethical considerations\n- System cards: Extend model cards to cover the full AI system in deployment, including data pipelines, human oversight structures, and monitoring arrangements\n\nOrganizations should publish model cards for all externally deployed AI systems, maintain internal system cards for internal AI, and ensure that accountability assignments are documented and regularly reviewed.`,
  },
  // AI Lifecycle
  {
    id: 'AI100-1-LIFECYCLE-DESIGN',
    title: 'AI Lifecycle — Design and Planning Phase Risk Considerations',
    category: 'AI Lifecycle',
    description: 'The design phase is the most cost-effective point to address AI risks. Decisions made during design about purpose, data, architecture, and evaluation criteria cascade through the entire lifecycle.',
    guidance: `AI 100-1 emphasizes a "shift left" approach to AI risk management — addressing risks early in the lifecycle when they are cheapest and most tractable to fix. The design and planning phase is where the most consequential decisions are made:\n\n1. Defining the intended purpose: The intended purpose of an AI system must be precisely defined, including who will use it, in what context, for what specific tasks, and with what expected outcomes. Vague or over-broad purpose definitions lead to scope creep, unanticipated uses, and difficulty in evaluating performance.\n\n2. Stakeholder identification: Design should identify all stakeholders — not just end users, but deployers, affected individuals, and impacted communities. Participatory design methods (involving potential affected communities in early design) can surface concerns that technical teams would otherwise miss.\n\n3. Success criteria: Define quantitative and qualitative success criteria before development begins. What accuracy is "good enough"? Which failure modes are unacceptable? What fairness metrics must be satisfied? Pre-specifying these criteria prevents post-hoc rationalization of inadequate performance.\n\n4. Make-or-buy decision: When procuring third-party AI systems rather than building in-house, organizations must still ensure compliance with trustworthy AI requirements. Third-party AI supply chain risk management is a distinct practice area.\n\n5. Data strategy: Design the data collection, labeling, and curation strategy. Identify potential data sources, assess their representativeness and potential for bias, and plan data governance arrangements.\n\n6. Human-AI task allocation: Determine which functions will be automated by AI and which will remain with humans. This design choice directly determines the human oversight model (oversight, override, collaboration) and the level of automation bias risk.\n\n7. Documentation from day one: Establish documentation practices at the start of the project, not after development is complete. Decisions about architecture, data, and evaluation criteria are most accurately captured when they are made.`,
  },
  {
    id: 'AI100-1-LIFECYCLE-DATA',
    title: 'AI Lifecycle — Data Collection and Processing Phase',
    category: 'AI Lifecycle',
    description: 'Data quality, representativeness, and governance during collection and processing are primary determinants of AI system trustworthiness across all seven characteristics.',
    guidance: `The data phase of the AI lifecycle is where most bias, privacy, and validity risks are introduced. AI 100-1 provides detailed guidance on data governance practices that support trustworthy AI.\n\nData collection considerations:\n\n1. Relevance and representativeness: Training data must cover the full range of conditions the deployed system will encounter. Underrepresentation of specific subpopulations, geographic regions, or time periods leads to degraded performance for those cases.\n\n2. Data lineage and provenance: Document the origin of all training data: who collected it, when, using what methods, under what terms. This is essential for understanding potential biases and legal compliance (copyright, data rights).\n\n3. Consent and legal basis: Data used for AI training must have an appropriate legal basis — explicit consent, contractual necessity, legitimate interest, or other lawful ground depending on jurisdiction. For sensitive categories of data, consent or explicit legal authorization is typically required.\n\n4. Data quality assessment: Apply systematic quality checks for completeness, consistency, accuracy, and timeliness. Document the results of quality checks and the actions taken to address quality issues.\n\nData processing considerations:\n\n1. Annotation and labeling quality: Human labelers introduce subjectivity, cognitive bias, and errors. Use multiple annotators for ambiguous cases; measure inter-annotator agreement; establish calibration and training for labelers; audit annotation quality.\n\n2. Feature engineering: Decisions about which features to include in an AI model are ethically significant. Features that are proxies for protected characteristics (e.g., zip code as a proxy for race) can introduce discrimination even if the protected attribute is not directly included.\n\n3. Data augmentation: Synthetic augmentation techniques can improve model robustness and reduce overfitting, but can also introduce or amplify biases if not carefully applied.\n\n4. Data retention and disposal: Define retention periods for training data and implement secure disposal procedures. Data used only for training should not be retained indefinitely.`,
  },
  {
    id: 'AI100-1-LIFECYCLE-MODEL',
    title: 'AI Lifecycle — Model Building and Evaluation Phase',
    category: 'AI Lifecycle',
    description: 'Model architecture selection, training methodology, and evaluation design critically shape the trustworthiness properties of the final AI system.',
    guidance: `The model building and evaluation phase involves translating data and design requirements into a working AI system. AI 100-1 provides guidance on trustworthiness-relevant practices at this phase.\n\nModel architecture considerations:\n\n1. Interpretability vs. accuracy tradeoff: More complex models (deep neural networks) often achieve higher accuracy but are less interpretable. The appropriate tradeoff depends on the use case — high-stakes decisions requiring explanation favor interpretable architectures.\n\n2. Uncertainty quantification: Models should express calibrated uncertainty in their outputs. Overconfident models are more dangerous than appropriately uncertain ones. Techniques: Bayesian neural networks, Monte Carlo dropout, ensemble methods, conformal prediction.\n\n3. Robustness to distribution shift: Architectures and training methods should be chosen to maximize performance on the deployment distribution, not just the training distribution. Domain adaptation and transfer learning techniques can help when training and deployment distributions differ.\n\nEvaluation methodology:\n\n1. Evaluation dataset design: The test set must be a realistic representation of the deployment distribution, not just a random split of the training data. If the deployment population differs from the training population (different demographics, time period, geography), construct a test set that reflects the deployment conditions.\n\n2. Disaggregated evaluation: Report performance metrics (accuracy, precision, recall, F1) separately for all relevant subgroups. Aggregate metrics can mask poor performance on specific populations.\n\n3. Red-teaming and adversarial testing: Before deployment, engage a red team to attempt to break the model — find failure modes, adversarial examples, and unexpected behaviors. Red team findings should be documented and either remediated or explicitly accepted as residual risk.\n\n4. Benchmark contamination: Be aware that popular evaluation benchmarks may have been inadvertently included in training data (especially for LLMs), inflating apparent performance. Use held-out proprietary evaluations where possible.\n\n5. Human evaluation: For AI systems producing subjective outputs (text generation, recommendations), human evaluation by representative users is essential alongside automated metrics.`,
  },
  {
    id: 'AI100-1-LIFECYCLE-DEPLOY',
    title: 'AI Lifecycle — Deployment and Integration Phase',
    category: 'AI Lifecycle',
    description: 'Deployment introduces operational risks not present in development. Integration with existing systems, training of users, and staged rollout strategies are essential for responsible deployment.',
    guidance: `The deployment phase is where AI systems transition from controlled development environments to real-world operational contexts. AI 100-1 highlights deployment as a distinct risk phase requiring specific risk management practices.\n\nPre-deployment checklist:\n\n1. Pre-deployment review: Conduct a formal pre-deployment review that verifies: (a) all evaluation criteria defined during design have been met, (b) the risk management plan has been executed, (c) monitoring infrastructure is in place, (d) incident response procedures are established, (e) human oversight mechanisms are operational.\n\n2. Staged rollout: Deploy initially to a limited population or use case to observe real-world behavior before full-scale rollout. Monitor for performance degradation, unexpected failure modes, and user misuse patterns.\n\n3. Integration testing: Test the AI component in integration with the full production system, not just in isolation. Multi-system interactions can produce emergent failure modes that are invisible in single-component testing.\n\n4. User training: Ensure that all users and oversight personnel are trained on the system's capabilities, limitations, and the appropriate role of AI outputs in their workflow. Address automation bias: train users to critically evaluate AI outputs rather than reflexively accepting them.\n\n5. Operator and developer documentation: Provide developers integrating with the AI system (via API or embedding) with complete technical documentation including known limitations, input requirements, and safe use guidelines.\n\nDeployment configuration:\n- Disable or restrict any model capabilities not needed for the defined use case (capability minimization)\n- Implement content filtering or output post-processing for safety-critical applications\n- Establish rate limiting and anomaly detection on model inputs to detect adversarial use\n- Configure logging and monitoring from day one of production deployment`,
  },
  {
    id: 'AI100-1-LIFECYCLE-MONITOR',
    title: 'AI Lifecycle — Operation, Monitoring, and Retirement Phase',
    category: 'AI Lifecycle',
    description: 'Ongoing monitoring ensures AI systems maintain their trustworthiness properties throughout operation. Retirement planning ensures safe decommissioning of AI systems without creating residual risks.',
    guidance: `The operational monitoring phase is often neglected but is critical for maintaining trustworthy AI over time. AI 100-1 recommends a proactive monitoring posture — not waiting for failures to be reported, but actively measuring performance, fairness, and safety on an ongoing basis.\n\nOperational monitoring program components:\n\n1. Performance monitoring: Continuously measure model accuracy, precision, recall, and other relevant performance metrics on production data. Compare against baselines established during pre-deployment evaluation. Establish alerting thresholds that trigger review when performance degrades below acceptable levels.\n\n2. Distribution shift detection: Monitor the statistical distribution of model inputs over time. If the input distribution shifts significantly from the training distribution, model performance may degrade even if no complaints are received. Use statistical tests (KS test, population stability index) to detect drift.\n\n3. Fairness monitoring: Disaggregate performance metrics by demographic groups on an ongoing basis. Performance gaps that were acceptable at launch may worsen over time as the deployment context evolves.\n\n4. Adversarial input monitoring: Monitor for inputs that may represent adversarial attacks — unusual input patterns, high-frequency identical queries, inputs at the boundary of the model's operational design domain.\n\n5. Feedback loops: Establish mechanisms for users, deployers, and affected individuals to report concerns about AI system behavior. Analyze feedback systematically for patterns indicating systemic failures.\n\nAI system retirement:\n- Establish clear criteria for when an AI system should be decommissioned (performance below acceptable threshold, successor system available, use case eliminated)\n- Plan for knowledge transfer: document the lessons learned from the retiring system to inform future AI projects\n- Manage residual risks: ensure that decommissioning does not leave vulnerable data, accessible model artifacts, or undocumented decisions that were made using the system\n- Establish a data retention and disposal schedule for training data and operational logs generated during the system's lifetime`,
  },
  // Cross-Cutting Risks
  {
    id: 'AI100-1-RISK-SOCIETAL',
    title: 'Cross-Cutting AI Risk — Societal and Systemic Harms',
    category: 'Cross-Cutting Risks',
    description: 'Some AI risks are systemic, affecting not just individual users but groups, institutions, and society as a whole. These risks require governance approaches beyond individual system-level risk management.',
    guidance: `AI 100-1 identifies a category of AI risks that transcend individual system performance and reach to societal and systemic levels. These risks are often invisible in standard system-level evaluation and require governance approaches that span organizations and sectors.\n\nKey societal and systemic AI risks:\n\n1. Concentration of power: AI capabilities are highly concentrated among a small number of large organizations. This concentration creates risks of monopolistic control over AI-mediated information, services, and decisions, with implications for economic competition and democratic pluralism.\n\n2. Homogenization of information: When a small number of AI systems (e.g., recommendation algorithms, search engines) mediate public information access, they can narrow the diversity of perspectives encountered by large populations, with implications for public discourse and democratic deliberation.\n\n3. Automation of discrimination at scale: AI systems that discriminate can do so at speeds and scales impossible for human decision-makers, amplifying harms. A biased human loan officer makes discriminatory decisions one at a time; a biased credit scoring AI affects millions of applicants per day.\n\n4. Erosion of human skills and agency: Over-reliance on AI for decision-making may atrophy the human skills and judgment necessary to function if AI systems fail or are unavailable — a form of fragility known as "automation complacency."\n\n5. Environment and resource impacts: Large AI models require substantial computational resources (energy, water, rare earth materials). The environmental footprint of AI is a systemic risk at scale.\n\n6. Dual-use and weaponization: AI capabilities developed for beneficial purposes can be repurposed for harmful ones (e.g., generative AI for disinformation, drug discovery AI for bioweapon design). Organizations developing general-purpose AI capabilities must assess and mitigate dual-use risks.\n\nGovernance approaches for systemic risks:\n- Sector-level AI risk governance forums and information sharing\n- Government and industry cooperation on systemic AI risk monitoring\n- International coordination on AI safety standards (ISO/IEC, OECD, G7 Hiroshima Process)\n- Investment in AI safety research addressing long-term systemic risks`,
  },
  {
    id: 'AI100-1-RISK-HUMAN-AI',
    title: 'Cross-Cutting AI Risk — Human-AI Interaction and Automation Bias',
    category: 'Cross-Cutting Risks',
    description: 'How humans interact with AI systems — and the cognitive biases this interaction introduces — is a major determinant of real-world AI system safety and fairness.',
    guidance: `AI 100-1 dedicates significant attention to human-AI interaction risks, recognizing that even technically sound AI systems can produce bad outcomes when humans interact with them in unintended ways. The most important of these interaction risks is automation bias.\n\nAutomation bias: The tendency for humans to over-rely on automated systems, accepting AI recommendations without adequate critical scrutiny. Automation bias is particularly dangerous in high-stakes domains where human expertise should override AI outputs, but humans instead defer to the AI because it is perceived as more accurate, faster, or authoritative than they are.\n\nFactors that increase automation bias:\n- Time pressure: When humans are rushed, they are more likely to accept AI recommendations uncritically\n- High workload: Cognitive overload reduces the bandwidth for critical evaluation\n- Opaque AI systems: When humans cannot understand why an AI made a recommendation, they have less basis for challenging it\n- Perceived AI superiority: If users believe the AI is more accurate than they are, they may defer even when they should not\n- Lack of feedback: If humans don't receive feedback on whether their decisions (informed or overridden by AI) were correct, they cannot calibrate their trust in the AI\n\nMitigation strategies for automation bias:\n1. Counterfactual prompts: Instead of asking users to accept/reject an AI recommendation, ask them to make their own decision first, then show them the AI recommendation\n2. Explanation requirements: Require users to articulate why they are following an AI recommendation before acting on it\n3. Calibrated confidence communication: Display AI confidence levels in ways that accurately convey uncertainty, making it easier for humans to identify when AI outputs are unreliable\n4. Training: Train users specifically on the risks of automation bias and the known failure modes of the specific AI system they use\n5. Performance monitoring: Track metrics that reveal automation bias (e.g., rate of AI override, outcomes of human-vs-AI-followed decisions) and use these to adjust training and system design`,
  },
  {
    id: 'AI100-1-SOCIOTECHNICAL',
    title: 'Sociotechnical Context — AI Systems in Social Settings',
    category: 'Sociotechnical Context',
    description: 'AI systems are sociotechnical systems embedded in social, institutional, and cultural contexts that shape their impacts in ways not visible from technical performance metrics alone.',
    guidance: `One of the most important contributions of NIST AI 100-1 is its clear articulation of the sociotechnical nature of AI risk. The document explicitly rejects a purely technical view of AI trustworthiness, arguing instead that AI systems are embedded in social contexts that profoundly shape their impacts.\n\nThe sociotechnical perspective means:\n\n1. Technical performance is necessary but not sufficient: An AI system can perform well by all technical metrics (accuracy, robustness, calibration) and still cause harm if the social context in which it is deployed is misunderstood. For example, an accurate recidivism risk model may cause systemic harm if it is used in a criminal justice system that lacks accountability mechanisms.\n\n2. Context shapes meaning: The same AI output can be helpful or harmful depending on context. A predictive recommendation is benign in a movie recommendation app but potentially manipulative in a political advertising context.\n\n3. Power dynamics matter: AI systems are designed by people with certain perspectives and interests, deployed by organizations with certain goals, and experienced by individuals with varying degrees of power to challenge or opt out. These power dynamics shape who benefits from AI and who bears its risks.\n\n4. Organizational culture: Even the best AI governance frameworks fail if organizational culture does not support speaking up about AI risks, taking time to address them, and deprioritizing AI capabilities when risk mitigation requirements conflict with deployment timelines.\n\n5. Unintended consequences: Complex sociotechnical systems produce emergent behaviors and unintended consequences that cannot be fully anticipated through design-time analysis. Monitoring and adaptive management are essential.\n\nPractical implications:\n- Conduct sociotechnical risk assessments (not just technical evaluations) before deploying AI in high-stakes contexts\n- Engage communities who will be affected by AI systems in the design and evaluation process\n- Consider the incentive structures of all actors in the AI value chain — provider, deployer, user, affected individual — and how these might lead to harmful AI use\n- Document the social assumptions embedded in AI system design and evaluate whether they hold in the deployment context`,
  },
  {
    id: 'AI100-1-METRICS',
    title: 'AI Risk Measurement — Metrics, Benchmarks, and Evaluation Approaches',
    category: 'Risk Measurement',
    description: 'Measuring AI trustworthiness requires a combination of quantitative metrics, qualitative assessment, and continuous monitoring — no single metric captures the full picture.',
    guidance: `AI 100-1 dedicates a significant section to the challenge of measuring AI trustworthiness. Unlike traditional software quality (where correctness can often be verified formally), AI trustworthiness is multidimensional, context-dependent, and can evolve over time.\n\nQuantitative metrics for AI trustworthiness:\n\nValidity/Reliability metrics:\n- Accuracy, precision, recall, F1 score, AUC-ROC (for classification)\n- Mean absolute error, RMSE (for regression)\n- BLEU, ROUGE, BERTScore (for generative AI)\n- Calibration: Expected Calibration Error (ECE), reliability diagrams\n- Robustness: accuracy under distribution shift, perturbation sensitivity\n\nSafety metrics:\n- Failure rate and failure modes catalogue\n- Safety boundary violation rate\n- Time-to-detection of unsafe outputs\n\nFairness metrics:\n- Demographic parity difference\n- Equalized odds difference\n- Disparate impact ratio (four-fifths rule)\n- Counterfactual fairness gap\n\nPrivacy metrics:\n- Differential privacy epsilon (formal guarantee strength)\n- Memorization rate (fraction of training examples the model can reproduce)\n- Membership inference attack success rate\n\nLimitations of quantitative metrics:\n- Goodhart's Law: When a measure becomes a target, it ceases to be a good measure. Optimizing for a specific metric can lead to gaming that doesn't improve underlying trustworthiness.\n- Context-sensitivity: No universal benchmark captures performance in all deployment contexts. Domain-specific and use-case-specific evaluation is essential.\n- Composite vs. disaggregated: Aggregate metrics hide performance disparities across subgroups. Always disaggregate.\n\nQualitative assessment approaches:\n- Red-team exercises and structured adversarial testing\n- Expert panels and ethics review boards\n- Community feedback sessions with affected populations\n- Scenario analysis and stress testing for edge cases`,
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    let { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'NIST AI 100-1')
      .maybeSingle();

    if (!framework) {
      const { data } = await supabase.from('compliance_frameworks').insert({
        name: 'NIST AI 100-1: Artificial Intelligence Risk Management Framework: Trustworthy and Responsible AI',
        abbreviation: 'NIST AI 100-1',
        description: 'NIST AI 100-1 defines seven characteristics of trustworthy AI (valid/reliable, safe, secure/resilient, explainable/interpretable, privacy-enhanced, fair with managed bias, accountable/transparent) and provides guidance on measuring and achieving these properties across the AI lifecycle. Companion document to the NIST AI RMF 1.0.',
        version: '2023',
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
        name: 'NIST AI 100-1 — Trustworthy and Responsible AI (2023)',
        url: 'https://doi.org/10.6028/NIST.AI.100-1',
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

    for (const item of NIST_AI_100_1_DATA) {
      const rawContent = `# ${item.id}\n\n## Category\n${item.category}\n\n## Requirement\n${item.description}\n\n## Guidance\n${item.guidance}`;

      const embedding = await generateEmbedding(rawContent);

      const { data: doc } = await supabase.from('documents').insert({
        source_id: source!.id,
        framework_id: framework!.id,
        title: `${item.id} — ${item.title}`,
        document_type: 'control',
        raw_content: rawContent,
        metadata: { practice_id: item.id, category: item.category },
        url: 'https://doi.org/10.6028/NIST.AI.100-1',
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
