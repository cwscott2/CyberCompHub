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

// MITRE ATLAS — Adversarial Threat Landscape for AI Systems
// Maintained by MITRE Corporation. Extends ATT&CK to cover ML-specific adversary tactics and techniques.
// Source: https://atlas.mitre.org

const MITRE_ATLAS_DATA = [
  {
    id: 'ATLAS-OVERVIEW',
    title: 'MITRE ATLAS Overview — Adversarial Threat Landscape for AI Systems',
    category: 'Overview',
    description: 'MITRE ATLAS is a globally accessible, living knowledge base of adversary tactics and techniques against machine learning (ML) systems, based on real-world case studies and red team exercises. It extends MITRE ATT&CK to cover AI/ML-specific attack vectors.',
    guidance: `MITRE ATLAS (Adversarial Threat Landscape for AI Systems) is a knowledge base developed by MITRE in collaboration with AI industry partners and the academic research community. It catalogs tactics, techniques, and procedures (TTPs) that adversaries use to attack AI and machine learning systems, with a particular focus on attacks that exploit the unique properties of ML systems.\n\nATLAS is structured in a matrix format analogous to MITRE ATT&CK, with tactics (high-level adversary goals) and techniques (specific methods used to achieve those goals). As of 2024, ATLAS covers 14 tactic categories and over 60 techniques.\n\nThe taxonomy covers three primary threat scenarios:\n1. Attacks against ML models in production (evasion, inference, extraction)\n2. Attacks during ML development (data poisoning, supply chain attacks)\n3. Attacks using AI as a tool (using AI to enhance traditional attack campaigns)\n\nWhy ATLAS matters for AI governance:\n- Traditional security frameworks (ATT&CK, NIST CSF) do not cover ML-specific attack surfaces\n- AI systems have unique vulnerabilities (sensitivity to adversarial inputs, opacity of decision-making, training data dependencies) that require dedicated threat modeling\n- Understanding adversary TTPs informs defensive control selection: both technical controls (adversarial training, input validation) and procedural controls (supply chain vetting, access restrictions)\n\nATLAS case studies include documented attacks against commercial ML APIs, autonomous vehicles, malware classifiers, medical image analysis systems, and natural language processing systems. These case studies provide concrete evidence that the threat landscape is real and active.\n\nOrganizations deploying AI systems should integrate ATLAS into their threat modeling process, security risk assessments, and penetration testing scope alongside traditional ATT&CK coverage.`,
  },
  {
    id: 'ATLAS-TA0001',
    title: 'Tactic TA0001 — Reconnaissance: Gathering Intelligence on Target AI Systems',
    category: 'Reconnaissance',
    description: 'Adversaries gather information about target AI systems, including model architecture, training data, API behavior, and organizational AI infrastructure, to plan effective attacks.',
    guidance: `ATLAS Tactic TA0001 — Reconnaissance covers the methods adversaries use to gather intelligence on AI systems before launching an attack. Unlike traditional network reconnaissance, AI reconnaissance focuses on understanding the model's behavior, architecture, and data dependencies.\n\nKey ATLAS Reconnaissance Techniques:\n\nAML.T0000 — Search for Victim's Publicly Available Research Materials: Adversaries search academic papers, technical blog posts, conference presentations, and open-source repositories associated with the target organization to identify AI architectures, training data sources, and model capabilities. Many organizations inadvertently publish information that reveals their AI system design.\n\nAML.T0001 — Search Victim-Owned Websites: Target organization websites, API documentation, and developer portals may reveal details about AI systems in production, including model versions, input formats, and output schemas.\n\nAML.T0002 — Search for Publicly Available Adversarial Vulnerabilities: Adversaries research known vulnerabilities in AI frameworks (TensorFlow, PyTorch), model architectures, or training methodologies that may apply to the target system.\n\nAML.T0004 — Search for Victim's AI Development Environment: Information about the development stack (CI/CD pipelines, MLOps platforms, model registries) can reveal attack paths to inject malicious artifacts during development.\n\nDefensive measures against AI Reconnaissance:\n- Limit publication of technical details about production AI systems while still meeting transparency obligations\n- Scrub internal AI architecture details from public-facing documentation\n- Monitor for suspicious probing patterns in AI API logs (high-volume queries, systematic exploration of model boundaries)\n- Apply API rate limiting and query fingerprinting to detect reconnaissance via model queries\n- Conduct OSINT audits of your own organization to assess what an adversary could learn about your AI systems from publicly available sources`,
  },
  {
    id: 'ATLAS-TA0002',
    title: 'Tactic TA0002 — Resource Development: Building Capabilities for AI Attacks',
    category: 'Resource Development',
    description: 'Adversaries develop or acquire the resources needed to execute attacks against AI systems, including surrogate models, adversarial tools, poisoned datasets, and compromised ML supply chain components.',
    guidance: `ATLAS Tactic TA0002 — Resource Development covers adversary preparations for AI attacks, including building attack tools and infrastructure.\n\nKey ATLAS Resource Development Techniques:\n\nAML.T0005 — Acquire Public ML Artifacts: Adversaries download publicly available pre-trained models, datasets, and ML libraries that can serve as the foundation for attack development. Public model repositories (Hugging Face, TensorFlow Hub) and datasets (ImageNet, Common Crawl) are frequently used.\n\nAML.T0006 — Create Proxy ML Model (Surrogate Model): When direct access to a target model is limited, adversaries train a surrogate model that approximates the target's behavior using queries to the target's API. The surrogate can then be used offline to develop adversarial examples or extraction attacks without triggering rate limits. This is the foundation of transferability-based attacks: adversarial examples developed against the surrogate often transfer to the target.\n\nAML.T0008 — Acquire Victim's Training Data: Adversaries attempt to obtain the target's training data through data breaches, insider threats, third-party vendors, or purchase from data brokers. Knowledge of training data enables more effective poisoning and evasion attacks.\n\nAML.T0019 — Develop Adversarial ML Attack Capabilities: Adversaries develop custom attack code or adapt publicly available adversarial ML tools (Foolbox, ART — Adversarial Robustness Toolbox, CleverHans) for use against the target.\n\nDefensive measures:\n- Monitor model repositories and data sources used in your ML supply chain for compromise indicators\n- Implement model fingerprinting or watermarking to detect surrogate model creation from your APIs\n- Restrict API access to authenticated users and log all queries for anomaly detection\n- Vet third-party ML components (pre-trained models, datasets) through a formal AI supply chain security process before integration`,
  },
  {
    id: 'ATLAS-TA0003',
    title: 'Tactic TA0003 — Initial Access: Gaining Entry to AI Systems and Environments',
    category: 'Initial Access',
    description: 'Adversaries use various techniques to gain initial access to ML systems, including exploiting public-facing ML APIs, compromising ML supply chain components, and targeting ML development infrastructure.',
    guidance: `ATLAS Tactic TA0003 — Initial Access covers how adversaries first gain access to target AI/ML systems or the environments that support them.\n\nKey ATLAS Initial Access Techniques:\n\nAML.T0010 — ML Supply Chain Compromise: Adversaries compromise components of the ML supply chain — pre-trained model repositories, data pipelines, ML frameworks, model registries — to insert malicious artifacts that will be incorporated into the target's AI system. This parallels the SolarWinds-style supply chain attack in traditional IT, but targets ML infrastructure.\n\nAML.T0012 — Valid Accounts (ML Platform): Adversaries obtain legitimate credentials for ML development platforms (MLflow, SageMaker, Azure ML, Vertex AI) through phishing, credential stuffing, or insider threat. These credentials provide access to training pipelines, model artifacts, and inference endpoints.\n\nAML.T0047 — Physical Environment Attack: For AI systems that process sensor data (cameras, microphones, LIDAR), adversaries manipulate the physical environment to create adversarial inputs. Example: placing adversarial stickers on stop signs to fool autonomous vehicle perception systems.\n\nAML.T0015 — Evade ML Model: Adversaries craft inputs designed to evade detection by an AI security system (malware classifier, network intrusion detection, fraud detection). The adversary's goal is to make their malicious activity look normal to the AI system.\n\nDefensive measures:\n- Implement strict ML supply chain controls: only use verified, signed model artifacts from trusted sources; implement a model registry with access controls and audit logs\n- Apply zero-trust principles to ML development environments: enforce MFA, least-privilege access, and just-in-time access to training infrastructure\n- For physical-world AI systems: implement physical tamper detection and sensor redundancy; test systems against known physical adversarial attacks\n- Monitor ML API access for anomalous patterns: credential sharing, access from unusual locations, bulk queries`,
  },
  {
    id: 'ATLAS-TA0004',
    title: 'Tactic TA0004 — ML Model Access: Techniques for Interacting with Target Models',
    category: 'ML Model Access',
    description: 'Adversaries obtain various levels of access to target ML models — from full white-box access (model weights and architecture) to limited black-box API access — which determines which attack techniques are applicable.',
    guidance: `ATLAS Tactic TA0004 — ML Model Access is unique to ATLAS and has no direct ATT&CK equivalent. It characterizes the level of access adversaries have to the target model, which is a key determinant of which attack techniques are feasible.\n\nAccess levels and their implications:\n\nWhite-box access (full model access): The adversary has complete knowledge of the model's architecture, weights, training data, and hyperparameters. This is the strongest access level and enables the most potent attacks (e.g., gradient-based adversarial example generation). White-box access may be achieved through model theft, insider threat, or open-source model use.\n\nGray-box access (partial model information): The adversary knows some aspects of the model (e.g., architecture but not weights, or output probabilities but not logits). This is a common scenario for commercially deployed models that return confidence scores.\n\nBlack-box access (API access only): The adversary can only query the model through its API, receiving outputs (labels, scores, generated text) but having no knowledge of internal structure. This is the most constrained scenario but still enables many powerful attacks through repeated querying.\n\nKey ATLAS ML Model Access Techniques:\n\nAML.T0040 — Traditional ML Model Access: Direct access to model through owner-provided means (API key, SDK). This is the typical starting point for external adversaries.\n\nAML.T0041 — Full ML Model Access: Adversary obtains complete model (weights, architecture). Achieved through model theft, insider access, or open-source access to target's published model.\n\nAML.T0042 — ML Model Inference API Access: Adversary can query the model repeatedly, receiving structured outputs. The foundation for model extraction, membership inference, and black-box adversarial example attacks.\n\nDefensive measures:\n- Restrict full model access to a minimum set of authorized personnel; audit access regularly\n- For API access: implement rate limiting, query logging, output perturbation (adding noise to confidence scores), and anomaly detection on query patterns\n- Consider not returning confidence scores/probabilities where not required for the use case — this limits the information available for attacks`,
  },
  {
    id: 'ATLAS-TA0009',
    title: 'Tactic TA0009 — ML Attack Staging: Preparing and Deploying ML-Specific Attacks',
    category: 'ML Attack Staging',
    description: 'Adversaries prepare and stage ML-specific attacks including crafting adversarial data, creating backdoor triggers, and developing prompt injection payloads before deploying them against target systems.',
    guidance: `ATLAS Tactic TA0009 — ML Attack Staging covers the preparation phase specific to ML attacks, where adversaries develop and refine their attack artifacts before deployment.\n\nKey ATLAS ML Attack Staging Techniques:\n\nAML.T0043 — Craft Adversarial Data: Adversaries create inputs specifically designed to cause the target ML model to produce incorrect outputs. Adversarial examples are inputs with carefully crafted perturbations — often imperceptible to humans — that cause misclassification.\n\nTechnical methods for crafting adversarial examples:\n- FGSM (Fast Gradient Sign Method): Single-step gradient-based perturbation; fast but relatively weak\n- PGD (Projected Gradient Descent): Iterative gradient attack; stronger than FGSM; the de facto standard for adversarial training\n- C&W attack (Carlini and Wagner): Optimization-based attack that finds minimal perturbations causing misclassification\n- Natural adversarial examples: Real-world inputs that are challenging for ML models without any artificial perturbation\n- For NLP: token substitution attacks, paraphrase attacks, prompt injection\n\nAML.T0020 — Backdoor ML Model: Adversaries insert a backdoor "trojan" into an ML model during training or fine-tuning. The backdoored model behaves normally on standard inputs but produces adversary-specified outputs when the input contains a specific trigger pattern (e.g., a colored patch in an image, a specific phrase in text). The trigger is invisible to humans inspecting model outputs during testing.\n\nBackdoor injection methods:\n- Training data poisoning: Insert trigger-labeled examples into training data\n- Direct weight manipulation: Modify model weights to encode the backdoor\n- Fine-tuning attack: Fine-tune a pre-trained model on a poisoned dataset\n\nAML.T0054 — LLM Prompt Injection: Adversaries craft prompts that hijack an LLM's behavior, overriding system instructions or causing the model to reveal sensitive information, execute unintended actions, or produce harmful outputs.\n\nDefensive measures against ML Attack Staging:\n- Implement adversarial training: include adversarial examples in the training set to improve robustness\n- Apply certified defenses (e.g., randomized smoothing) that provide provable bounds on adversarial robustness\n- Detect backdoors using neural cleanse, STRIP, or other backdoor detection methods before deploying models\n- For LLMs: implement prompt injection detection, sandboxed tool execution, output validation, and privilege separation between system prompts and user inputs`,
  },
  {
    id: 'ATLAS-TA0005',
    title: 'Tactic TA0005 — Execution: Running Malicious Code in ML Environments',
    category: 'Execution',
    description: 'Adversaries execute malicious code within ML development or deployment environments through techniques like malicious ML artifacts, compromised notebooks, and model deserialization vulnerabilities.',
    guidance: `ATLAS Tactic TA0005 — Execution covers how adversaries run malicious code within ML environments. ML development environments have unique code execution surfaces not present in traditional IT.\n\nKey ATLAS Execution Techniques:\n\nAML.T0011 — User Execution: Malicious ML Artifacts: Adversaries create malicious ML artifacts (models, datasets, notebooks) that execute code when loaded. The most notable example is malicious pickle files — PyTorch model weights serialized in Python's pickle format can execute arbitrary code when deserialized with torch.load(). A researcher who downloads a model from an untrusted source and loads it may execute attacker-controlled code.\n\nAML.T0049 — Exploit Public-Facing ML Application: Adversaries exploit vulnerabilities in ML serving infrastructure — MLflow tracking servers, Jupyter notebooks, model serving endpoints — to execute code in the ML environment.\n\nAML.T0050 — Command and Scripting Interpreter: ML Development Environment: Jupyter notebooks are effectively persistent code execution environments. Adversaries who compromise a notebook server or insert malicious cells into a shared notebook gain code execution in the ML development environment.\n\nMLOps-specific execution risks:\n- Model serialization vulnerabilities: pickle, joblib, h5py, and other ML model formats can execute code during deserialization\n- Notebook sharing: sharing notebooks without reviewing all cells creates code execution risks\n- Training job injection: adversaries who can submit jobs to a distributed training platform can execute arbitrary code on GPU clusters\n- Plugin and extension vulnerabilities in ML IDEs and experiment tracking platforms\n\nDefensive measures:\n- Replace pickle-based model serialization with safer formats (SafeTensors, ONNX with validation, safetensors library)\n- Scan ML artifacts for malicious payloads before loading: apply file integrity verification and antivirus scanning\n- Restrict notebook server access; require authentication and encrypt traffic; implement cell output sanitization\n- Run training jobs in isolated environments (containers, VMs) with network egress restrictions\n- Apply least-privilege IAM policies to ML training infrastructure`,
  },
  {
    id: 'ATLAS-TA0006',
    title: 'Tactic TA0006 — Persistence: Maintaining Access in AI/ML Environments',
    category: 'Persistence',
    description: 'Adversaries maintain persistence in AI/ML environments through backdoored models, compromised data pipelines, and malicious artifacts embedded in ML supply chains.',
    guidance: `ATLAS Tactic TA0006 — Persistence covers techniques adversaries use to maintain long-term presence in AI/ML environments, often surviving model updates, retraining cycles, and security responses.\n\nKey ATLAS Persistence Techniques:\n\nAML.T0020 — Backdoor ML Model (Persistence use): A backdoored model installed in production maintains adversary influence over model outputs indefinitely until the backdoor is detected and the model replaced. If the organization retrains on poisoned data, the backdoor may persist through retraining cycles.\n\nAML.T0022 — Publish Poisoned Datasets: Adversaries publish poisoned public datasets on data repositories (Kaggle, Hugging Face datasets, UCI repository). Organizations that use these datasets in training or fine-tuning introduce the poison into their own models. This is a particularly insidious persistence technique because the organization may be unaware of the poisoned dataset's existence in their training pipeline.\n\nAML.T0010 — ML Supply Chain Compromise (Persistence): Adversaries who have compromised an upstream component in the ML supply chain (a popular pre-trained model, a widely used ML library) maintain persistent access to any organization that uses the compromised component.\n\nAML.T0023 — Poison Training Data (through CI/CD pipeline): Adversaries who gain access to a continuous training pipeline can repeatedly inject poisoned data into automated retraining jobs, ensuring that backdoors or biases persist even as the model is retrained.\n\nDefensive measures against ML Persistence:\n- Maintain a verified, immutable record of training data lineage; compare active training data against the verified baseline before each training run\n- Implement model integrity checking: cryptographic signatures on model artifacts, verified before loading\n- Conduct periodic backdoor scanning of production models using detection techniques (neural cleanse, activation clustering, spectral signatures)\n- Lock down CI/CD pipeline access to ML training workflows; treat the pipeline as critical infrastructure\n- Version control training data alongside model code; apply data validation gates at each stage of the data pipeline`,
  },
  {
    id: 'ATLAS-TA0007',
    title: 'Tactic TA0007 — Defense Evasion: Evading AI-Based Security Controls',
    category: 'Defense Evasion',
    description: 'Adversaries craft inputs that evade AI-based detection systems (malware classifiers, fraud detection, intrusion detection) while achieving their malicious objectives.',
    guidance: `ATLAS Tactic TA0007 — Defense Evasion in the AI context focuses on adversaries who craft inputs designed to evade AI-based security controls. As AI becomes more prevalent in security products (EDR, SIEM, email security), the ability to evade AI-based detection becomes an adversarial objective.\n\nKey ATLAS Defense Evasion Techniques:\n\nAML.T0015 — Evade ML Model (Security Evasion): Adversaries modify malware, phishing content, network traffic, or other attack artifacts to evade AI-based detection systems while preserving their malicious function. Examples:\n- Malware evasion: Adding benign API calls or modifying binary structure to shift feature distributions away from malware signatures learned by ML-based EDR\n- Phishing evasion: Adversarial text modifications that fool email security NLP models while remaining convincing to humans\n- Network evasion: Modifying traffic patterns to evade ML-based network intrusion detection systems\n\nAML.T0048 — Physical Adversarial Attack (Evasion): Adversaries place adversarial patches, stickers, or markings in physical environments that cause computer vision systems to misclassify them. Applications: evading surveillance cameras, fooling license plate readers, evading quality control AI in manufacturing.\n\nAML.T0029 — Suppress Output of Target System: Adversaries cause a security AI system to output a null result or withhold detection output rather than a false negative, preventing security teams from investigating.\n\nDefensive measures against AI evasion:\n- Apply adversarial training to security AI models: train on adversarial examples to improve robustness to evasion attempts\n- Use ensemble detection: combine multiple ML models with different architectures and features so that evading all simultaneously is harder\n- Implement non-ML detection layers alongside AI: rule-based detection, signature matching, and behavioral analytics as complementary controls\n- Monitor for adversarial fingerprints: some adversarial perturbation methods leave statistical signatures detectable at the system level\n- Regularly red-team AI security products with current evasion techniques; treat evasion testing as a continuous security practice`,
  },
  {
    id: 'ATLAS-TA0010',
    title: 'Tactic TA0010 — Exfiltration: Extracting Value from AI Systems',
    category: 'Exfiltration',
    description: 'Adversaries extract sensitive information from AI systems, including the model itself (model theft), training data (data extraction), or private information about individuals encoded in the model.',
    guidance: `ATLAS Tactic TA0010 — Exfiltration in the AI context covers techniques for extracting value from AI systems — primarily through model theft, training data extraction, and membership inference.\n\nKey ATLAS Exfiltration Techniques:\n\nAML.T0029 — ML Model Theft (via Extraction Attack): Adversaries query a target model API with carefully selected inputs and use the outputs to train a surrogate model that approximates the target's functionality. The surrogate model is then used outside the API (evading per-query costs and rate limits) or to develop evasion attacks against the original. Model extraction attacks have been demonstrated against commercial ML APIs including cloud vision APIs and language models.\n\nExtraction attack methodology:\n1. Select a diverse query dataset covering the model's input space\n2. Query the target API with these inputs, collecting output distributions\n3. Train a local surrogate model on the (input, output) pairs\n4. Iteratively refine the surrogate using active learning to maximize fidelity\n\nAML.T0037 — Data from Information Repositories (Training Data Extraction): Adversaries query AI systems with carefully crafted prompts to extract training data that the model has memorized. Large language models have been shown to reproduce verbatim training data including personal information, proprietary documents, and code. Carlini et al. (2021) demonstrated extracting memorized content from GPT-2.\n\nAML.T0043 — Membership Inference: Adversaries determine whether a specific data record was included in the AI system's training data by querying the model and analyzing confidence scores. This reveals whether specific individuals' data was used to train the model — a privacy violation, especially when the model was trained on sensitive data (medical records, financial data).\n\nDefensive measures against AI exfiltration:\n- Rate limit and authenticate API access; monitor for systematic querying patterns consistent with extraction attacks\n- Add calibrated noise to model confidence scores before returning to API callers — reduces extraction attack fidelity\n- Apply differential privacy during training to provide formal membership inference resistance\n- Implement model watermarking: embed verifiable watermarks in the model that can detect unauthorized copies\n- For LLMs: implement training data deduplication and memorization testing before deployment; apply output filtering for known PII patterns`,
  },
  {
    id: 'ATLAS-TA0011',
    title: 'Tactic TA0011 — Impact: Degrading, Corrupting, or Misusing AI Systems',
    category: 'Impact',
    description: 'Adversaries cause direct harm through AI systems by degrading model performance, corrupting model behavior, generating harmful content, or using AI as a weapon against its intended beneficiaries.',
    guidance: `ATLAS Tactic TA0011 — Impact covers adversary objectives that result in direct harm to the availability, integrity, or beneficial use of AI systems.\n\nKey ATLAS Impact Techniques:\n\nAML.T0031 — Cause Harm via AI System: Adversaries manipulate an AI system to cause direct harm to individuals or society. Examples:\n- Manipulating a medical diagnosis AI to produce false negatives (causing missed diagnoses)\n- Corrupting a fraud detection system to approve fraudulent transactions\n- Causing an autonomous vehicle's AI to fail to detect obstacles\n- Manipulating a content moderation AI to allow harmful content or suppress legitimate speech\n\nAML.T0025 — Evade ML Model (Integrity Impact): Adversaries cause a high-stakes AI system to make a specific incorrect decision that benefits the adversary — a targeted evasion with real-world consequence. Example: a loan applicant crafts a resume to game an automated screening AI, getting approved for a loan they would otherwise be denied.\n\nAML.T0046 — Denial of ML Service: Adversaries degrade or disable an AI service through resource exhaustion (querying the API with computationally expensive inputs) or by providing inputs that cause model errors, exceptions, or slow inference.\n\nAML.T0048 — Erode ML Model Integrity over Time: Through repeated low-volume data poisoning, adversaries gradually degrade model performance over time in ways that are difficult to detect (the performance degradation is below alerting thresholds) but accumulate significant harm.\n\nAML.T0016 — Harmful AI Generation: Adversaries use AI generation capabilities (text, image, audio, video) to generate harmful content — deepfakes, synthetic disinformation, AI-generated CSAM, AI-assisted phishing content — at scale.\n\nDefensive measures against AI Impact attacks:\n- Monitor AI system performance metrics continuously with anomaly detection; set alerts for degradation below baseline thresholds\n- Implement rate limiting and resource budgets per API consumer to prevent denial-of-service through expensive inputs\n- For safety-critical AI systems, implement independent verification mechanisms: cross-check AI decisions against rule-based sanity checks\n- Watermark or label AI-generated content to enable detection and attribution\n- Implement output filtering for AI generation systems to prevent harmful content production`,
  },
  {
    id: 'ATLAS-TA0008',
    title: 'Tactic TA0008 — Collection: Gathering Information Using AI Systems',
    category: 'Collection',
    description: 'Adversaries use access to AI systems or AI capabilities to collect data about targets, including sensitive information extracted from AI models and data gathered through AI-powered surveillance.',
    guidance: `ATLAS Tactic TA0008 — Collection covers how adversaries gather data using or from AI systems, extending traditional collection techniques with AI-specific capabilities.\n\nKey ATLAS Collection Techniques:\n\nAML.T0037 — Data from Local System (ML Environment): Adversaries who have compromised an ML development environment collect training data, model artifacts, evaluation results, and experiment logs. These artifacts may contain sensitive personal data, proprietary business data, and intellectual property.\n\nAML.T0035 — ML Artifact Collection: Adversaries collect deployed ML model artifacts — saved model files, serialized weights, ONNX exports, inference engine files — from compromised storage systems or unsecured artifact repositories. These artifacts can be used offline to develop attacks or can be reverse-engineered to extract sensitive training data.\n\nAML.T0036 — Active Scanning: ML System Discovery: Adversaries actively probe networks and cloud environments to discover ML inference endpoints, model serving infrastructure, and ML development platforms.\n\nAML.T0044 — AI-Powered Collection Enhancement: Adversaries use AI capabilities to enhance their collection activities — using NLP to extract and summarize large volumes of documents, using computer vision to analyze images collected from compromised cameras, using speech recognition to transcribe collected audio.\n\nDefensive measures against AI collection:\n- Apply data loss prevention (DLP) controls to ML artifact repositories; monitor for bulk downloads of model files\n- Encrypt model artifacts at rest and in transit; implement access logging for all model artifact access\n- Conduct ML asset inventory and ensure all model repositories are included in standard vulnerability scanning and access review cycles\n- Apply network segmentation to ML development environments; restrict internet egress from training infrastructure\n- Implement data minimization: training datasets should contain only the minimum data necessary; evaluate whether training on sensitive personal data can be avoided through synthetic data`,
  },
  {
    id: 'ATLAS-TA0013',
    title: 'Tactic TA0013 — Discovery: Mapping the Target AI Environment',
    category: 'Discovery',
    description: 'Adversaries explore and map the target AI environment, identifying AI systems, models, training infrastructure, and data assets to plan more targeted attacks.',
    guidance: `ATLAS Tactic TA0013 — Discovery covers how adversaries map the target AI environment to identify attack surfaces and valuable assets.\n\nKey ATLAS Discovery Techniques:\n\nAML.T0036 — AI System Discovery: Adversaries scan the target environment to identify AI models in production, their APIs, input/output formats, and performance characteristics. Internal networks may host undiscovered ML inference servers, experiment tracking platforms, or model registries accessible without authentication.\n\nAML.T0000 — Discover ML Artifacts from Development Environment: Once inside an ML development environment, adversaries enumerate model artifacts, training scripts, configuration files, and data pipeline definitions. MLflow experiment logs, Weights & Biases runs, and similar experiment tracking systems contain extensive details about model architecture and performance.\n\nAML.T0018 — Active Scanning: Inferring Model Architecture and Hyperparameters: Through systematic API querying, adversaries can infer aspects of the target model's architecture — the number of output classes, the type of model (binary vs. multiclass), the input preprocessing steps, and in some cases the model architecture type (CNN, transformer, etc.).\n\nCloud ML environment discovery:\n- Misconfigured S3 buckets or blob storage containing model artifacts are a frequent source of unauthorized model access\n- Cloud ML platform dashboards (SageMaker, Azure ML Studio, Vertex AI) that lack proper access controls expose model inventories\n- MLflow tracking servers exposed to the internet without authentication have been found in the wild\n\nDefensive measures against AI discovery:\n- Apply zero-trust networking to ML infrastructure: no ML service should be accessible without authentication and authorization\n- Conduct regular external attack surface assessments specifically targeting ML-related endpoints and storage\n- Remove unused or development ML endpoints from production networks; implement lifecycle management for ML services\n- Configure cloud ML platforms with strict IAM policies; use VPC endpoints for ML platform access rather than public endpoints`,
  },
  {
    id: 'ATLAS-DEFENSE-OVERVIEW',
    title: 'ATLAS Defensive Posture — Integrating ATLAS into AI Security Programs',
    category: 'Defense Overview',
    description: 'A comprehensive ATLAS-based defense strategy integrates threat modeling, adversarial testing, supply chain security, and monitoring specifically addressing ML attack surfaces.',
    guidance: `Organizations deploying AI systems should integrate MITRE ATLAS into their security programs as a complement to ATT&CK-based threat modeling. An ATLAS-informed AI security program includes the following components:\n\n1. AI Threat Modeling: Before deploying any AI system, conduct a threat model using the ATLAS matrix to identify relevant attack techniques. For each technique, assess likelihood (given the attacker profile and system exposure) and potential impact, and map to defensive controls. This produces an AI-specific threat model that complements standard application threat models.\n\n2. AI Penetration Testing: Extend standard penetration testing scope to include AI-specific attack scenarios:\n - Attempt model extraction against deployed APIs\n - Test for adversarial example vulnerabilities in the production model\n - Probe for training data memorization using known membership inference techniques\n - Test the ML development environment for supply chain and execution vulnerabilities\n - Evaluate prompt injection vulnerabilities for any LLM-based systems\n\n3. AI Supply Chain Security: Establish a formal ML supply chain security program:\n - Inventory all third-party ML components (pre-trained models, datasets, frameworks)\n - Apply security scanning to all third-party ML artifacts before integration\n - Monitor upstream model and dataset repositories for compromise notifications\n - Evaluate alternative serialization formats to eliminate pickle-based code execution risks\n\n4. AI Security Monitoring: Implement monitoring specifically designed for ML attack patterns:\n - Anomaly detection on model API query patterns (extraction attack indicators)\n - Performance monitoring for gradual degradation (persistence/impact attacks)\n - Training data integrity monitoring (poisoning attack detection)\n - Model artifact integrity verification (backdoor detection)\n\n5. ATLAS-Specific Incident Response: Develop incident response playbooks for ATLAS scenarios:\n - Backdoored model discovered in production: isolation, forensics, clean model restore, pipeline audit\n - Model extraction attack detected: rate limit, revoke affected credentials, assess extraction extent\n - Adversarial attack on production system: input filtering, model hardening, customer notification if applicable\n\nATLAS is available at atlas.mitre.org and includes a STIX format export for integration with SIEM and threat intelligence platforms.`,
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    let { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'MITRE ATLAS')
      .maybeSingle();

    if (!framework) {
      const { data } = await supabase.from('compliance_frameworks').insert({
        name: 'MITRE ATLAS — Adversarial Threat Landscape for AI Systems',
        abbreviation: 'MITRE ATLAS',
        description: 'MITRE ATLAS is a knowledge base of adversary tactics, techniques, and case studies for attacking machine learning systems. It extends MITRE ATT&CK with ML-specific attack categories including adversarial examples, data poisoning, model extraction, and prompt injection.',
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
        name: 'MITRE ATLAS — atlas.mitre.org (2024)',
        url: 'https://atlas.mitre.org',
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

    for (const item of MITRE_ATLAS_DATA) {
      const rawContent = `# ${item.id}\n\n## Category\n${item.category}\n\n## Requirement\n${item.description}\n\n## Guidance\n${item.guidance}`;

      const embedding = await generateEmbedding(rawContent);

      const { data: doc } = await supabase.from('documents').insert({
        source_id: source!.id,
        framework_id: framework!.id,
        title: `${item.id} — ${item.title}`,
        document_type: 'control',
        raw_content: rawContent,
        metadata: { tactic_id: item.id, category: item.category },
        url: 'https://atlas.mitre.org',
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
