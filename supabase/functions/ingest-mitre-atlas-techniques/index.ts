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

interface Technique {
  id: string;         // AML.T0000
  name: string;
  tactic: string;     // Tactic name
  tactic_id: string;  // ATLAS-TA00XX
  content: string;
}

const TECHNIQUES: Technique[] = [
  // ── RECONNAISSANCE ────────────────────────────────────────────────────────
  {
    id: 'AML.T0000',
    name: 'Search for Victim\'s AI Artifacts Online',
    tactic: 'Reconnaissance',
    tactic_id: 'ATLAS-TA0001',
    content: `# AML.T0000 — Search for Victim's AI Artifacts Online

**Tactic:** Reconnaissance | **ATLAS ID:** AML.T0000

## Description
Adversaries search publicly available information to identify and gather information about victim ML systems. Targets include pre-trained model weights shared on Hugging Face or GitHub, published papers describing model architecture, open-source training code, and public datasets used for training.

## Techniques
- Searching model repositories (Hugging Face Hub, GitHub, Papers with Code)
- Reading published academic papers describing the target organization's models
- Examining open-source repositories for architecture clues, hyperparameters, and training data references
- Scraping data leakage from API documentation examples

## Real-World Examples
- Adversary identifies that a financial services firm uses a specific open-source LLM base model from GitHub releases, then downloads the same base to craft targeted adversarial examples offline before attacking the production system

## Mitigations
- Limit public disclosure of model architecture details in papers and blog posts
- Do not publish exact model configurations for production systems
- Use private repositories for proprietary ML code
- Monitor public repositories for inadvertent disclosure of production model artifacts`,
  },
  {
    id: 'AML.T0001',
    name: 'Gather ML Artifact Information',
    tactic: 'Reconnaissance',
    tactic_id: 'ATLAS-TA0001',
    content: `# AML.T0001 — Gather ML Artifact Information

**Tactic:** Reconnaissance | **ATLAS ID:** AML.T0001

## Description
Adversaries gather information about the victim's ML artifacts, including model architecture, training data, preprocessing pipeline, and inference infrastructure. This intelligence enables more targeted attacks.

## Sub-Techniques
- **AML.T0001.000** — Identify ML model family (transformer, CNN, gradient boosting) from API response patterns
- **AML.T0001.001** — Infer training data from model outputs (e.g., biases in language model completions reveal training corpus composition)
- **AML.T0001.002** — Identify model version from output format changes over time

## Intelligence Gathering Methods
- Systematic API probing with boundary inputs to map decision regions
- Timing analysis — inference latency reveals model complexity
- Output format analysis — structured outputs reveal architecture type
- Error message analysis — stack traces may reveal framework and library versions

## Mitigations
- Standardize and sanitize all API error messages — never expose framework names or stack traces
- Add inference latency jitter to prevent timing attacks
- Rate-limit API queries per user/IP
- Monitor for systematic boundary-probing query patterns`,
  },

  // ── ML MODEL ACCESS ───────────────────────────────────────────────────────
  {
    id: 'AML.T0040',
    name: 'ML Model Inference API Access',
    tactic: 'ML Model Access',
    tactic_id: 'ATLAS-TA0004',
    content: `# AML.T0040 — ML Model Inference API Access

**Tactic:** ML Model Access | **ATLAS ID:** AML.T0040

## Description
Adversaries interact with victim ML model inference APIs to query the model and gather information about its behavior. API access is the most common way adversaries interact with black-box production ML systems.

## Access Modalities
- **Commercial API** — adversary purchases legitimate access to victim's ML API
- **Stolen credentials** — adversary uses stolen API keys to access the inference API
- **Indirect access** — adversary uses the model through a victim application interface
- **Physical access** — adversary accesses on-device models through physical possession of device

## What Adversaries Learn from API Access
- Decision boundaries through systematic querying
- Confidence scores if returned by the API
- Model behavior under perturbation
- Whether adversarial examples transfer to this model

## Mitigations
- Implement API authentication and authorization for all ML inference endpoints
- Monitor and alert on unusual query volumes or patterns
- Require API key rotation on a regular schedule
- Return prediction labels without confidence scores for sensitive applications
- Implement query budgets per user/organization`,
  },
  {
    id: 'AML.T0047',
    name: 'ML-Enabled Product or Service',
    tactic: 'ML Model Access',
    tactic_id: 'ATLAS-TA0004',
    content: `# AML.T0047 — ML-Enabled Product or Service

**Tactic:** ML Model Access | **ATLAS ID:** AML.T0047

## Description
Adversaries use a victim's ML-enabled product or service as a vector for interacting with the underlying ML model. Even when direct API access is unavailable, the product interface exposes ML model behavior indirectly.

## Example Scenarios
- Submitting many documents to a document classification product to reverse-engineer classification rules
- Using a spam filter interface to probe which content patterns are flagged
- Submitting job applications to an AI-powered ATS to learn which candidate attributes affect screening outcomes

## Mitigations
- Ensure product-level rate limiting is decoupled from API rate limiting
- Obfuscate model internals at the product interface layer
- Monitor for systematic probing patterns through the product UI
- Add uncertainty and randomness to model outputs displayed in product interfaces`,
  },

  // ── RESOURCE DEVELOPMENT ─────────────────────────────────────────────────
  {
    id: 'AML.T0005',
    name: 'Create Proxy ML Model',
    tactic: 'Resource Development',
    tactic_id: 'ATLAS-TA0002',
    content: `# AML.T0005 — Create Proxy ML Model

**Tactic:** Resource Development | **ATLAS ID:** AML.T0005

## Description
Adversaries create a local proxy (surrogate) model that mimics the behavior of the target victim model. The surrogate is used to develop and test attacks offline before executing them against the victim model.

## How It Works
1. Adversary queries victim model API with many inputs to gather input-output pairs
2. Adversary trains a local surrogate model on these input-output pairs using model distillation techniques
3. Adversary develops adversarial examples, poisoning attacks, or evasion techniques against the surrogate
4. Adversary transfers attacks from surrogate to victim model (adversarial transferability)

## Transferability
Adversarial examples often transfer between models with similar architectures or trained on similar data — even black-box targets. Transferability is higher when surrogate and victim share the same base model family.

## Mitigations
- Limit the information returned by inference APIs (no logits, no softmax probabilities for sensitive models)
- Implement query limits to prevent large-scale data collection for surrogate training
- Use ensemble methods in production to reduce transferability
- Monitor for systematic query patterns consistent with surrogate model training`,
  },
  {
    id: 'AML.T0017',
    name: 'Develop Capabilities: Adversarial ML Attacks',
    tactic: 'Resource Development',
    tactic_id: 'ATLAS-TA0002',
    content: `# AML.T0017 — Develop Capabilities: Adversarial ML Attacks

**Tactic:** Resource Development | **ATLAS ID:** AML.T0017

## Description
Adversaries develop or acquire tools and capabilities specifically for adversarial ML attacks. Open-source adversarial ML libraries make these capabilities broadly accessible.

## Available Attack Toolkits
| Tool | Capabilities |
|---|---|
| Adversarial Robustness Toolbox (ART) | Full attack/defense library: evasion, poisoning, extraction, inference |
| Foolbox | Evasion attacks against image classifiers |
| CleverHans | Adversarial example crafting; originally research tool |
| TextAttack | NLP-specific adversarial attacks on text classifiers and LLMs |
| PromptBench | LLM robustness evaluation and adversarial prompting |

## Mitigations
- Monitor threat intelligence for new adversarial ML toolkits and published attack techniques
- Subscribe to CVE feeds for ML framework vulnerabilities
- Maintain awareness of published research on attacks against your model type`,
  },

  // ── INITIAL ACCESS ────────────────────────────────────────────────────────
  {
    id: 'AML.T0010',
    name: 'ML Supply Chain Compromise',
    tactic: 'Initial Access',
    tactic_id: 'ATLAS-TA0003',
    content: `# AML.T0010 — ML Supply Chain Compromise

**Tactic:** Initial Access | **ATLAS ID:** AML.T0010

## Description
Adversaries compromise the ML supply chain to gain access to or influence over a victim's AI system. The ML supply chain includes pre-trained model repositories, training data sources, ML frameworks, and third-party model vendors.

## Sub-Techniques
- **AML.T0010.000 — GPU Image Compromise** — malicious code embedded in GPU-optimized Docker images
- **AML.T0010.001 — ML Framework Compromise** — backdoors in TensorFlow, PyTorch, or scikit-learn packages
- **AML.T0010.002 — Pre-Trained Model Backdoor** — trojanized model weights uploaded to Hugging Face or model zoos
- **AML.T0010.003 — Training Data Compromise** — poisoning public datasets before victim downloads them

## Real-World Example
Researchers have demonstrated uploading backdoored BERT models to Hugging Face that perform normally on standard benchmarks but produce targeted misclassifications when a specific trigger phrase is present.

## Mitigations
- Verify cryptographic hashes of all downloaded models and datasets
- Use private, controlled model registries for production models
- Implement code signing for ML pipeline components
- Scan pre-trained models for known backdoor patterns before integration
- Pin dependency versions and use lockfiles for ML framework dependencies
- Run models in sandboxed environments during evaluation`,
  },
  {
    id: 'AML.T0012',
    name: 'Valid Accounts',
    tactic: 'Initial Access',
    tactic_id: 'ATLAS-TA0003',
    content: `# AML.T0012 — Valid Accounts

**Tactic:** Initial Access | **ATLAS ID:** AML.T0012

## Description
Adversaries obtain and use valid credentials to access ML systems, training infrastructure, or model registries. ML pipelines often involve many connected systems — MLflow, Weights & Biases, cloud storage, Kubernetes clusters — each representing an attack surface.

## Target Systems
- **Model registries** — MLflow, Sagemaker Model Registry, Azure ML Registry
- **Experiment tracking** — Weights & Biases, Comet, Neptune
- **Training infrastructure** — GPU clusters, cloud training jobs, notebook environments (Jupyter, Colab)
- **Data stores** — S3 buckets, GCS buckets, Azure Blob Storage containing training data and model artifacts
- **CI/CD for ML** — GitHub Actions, GitLab CI running model training pipelines

## Mitigations
- Apply principle of least privilege to all ML pipeline service accounts
- Require MFA for access to model training infrastructure
- Rotate API keys for MLOps tools on a regular schedule
- Audit access logs for model registries and training infrastructure
- Do not store credentials in Jupyter notebooks or training scripts`,
  },

  // ── ML ATTACK STAGING ─────────────────────────────────────────────────────
  {
    id: 'AML.T0043',
    name: 'Craft Adversarial Data',
    tactic: 'ML Attack Staging',
    tactic_id: 'ATLAS-TA0009',
    content: `# AML.T0043 — Craft Adversarial Data

**Tactic:** ML Attack Staging | **ATLAS ID:** AML.T0043

## Description
Adversaries craft inputs specifically designed to cause misclassification or other failures in victim ML models. These adversarial examples exploit the geometry of model decision boundaries.

## Sub-Techniques
- **AML.T0043.000 — White-Box Attack** — attacker has full model access; uses gradient information to craft minimal perturbations
- **AML.T0043.001 — Black-Box Attack** — attacker has only API access; crafts examples using surrogate model or zeroth-order optimization
- **AML.T0043.002 — Physical Domain Attack** — adversarial perturbations applied to physical objects (printed patches, stickers on stop signs, adversarial glasses)
- **AML.T0043.003 — Digital Backdoor Trigger** — hidden trigger embedded in input that causes specific model behavior

## Attack Examples by Domain
| Domain | Attack | Impact |
|---|---|---|
| Image classification | Add imperceptible noise to image | Misclassification with high confidence |
| Spam detection | Add whitespace/synonyms to spam | Spam classified as benign |
| Malware detection | Modify malware binary | Evasion of ML-based AV |
| Facial recognition | Adversarial glasses | Evade surveillance systems |
| LLMs | Adversarial suffix appended to prompt | Bypass safety filters |

## Mitigations
- Adversarial training with representative attack types
- Input preprocessing and anomaly detection at inference
- Ensemble models reduce transferability of adversarial examples
- Certified robustness methods provide provable guarantees`,
  },
  {
    id: 'AML.T0044',
    name: 'Full ML Model Access',
    tactic: 'ML Attack Staging',
    tactic_id: 'ATLAS-TA0009',
    content: `# AML.T0044 — Full ML Model Access

**Tactic:** ML Attack Staging | **ATLAS ID:** AML.T0044

## Description
Adversaries gain direct access to ML model files, weights, or complete training pipelines, enabling the most powerful forms of attack including white-box adversarial example crafting, model modification, and backdoor insertion.

## How Full Access Is Obtained
- Compromise of model storage (S3 buckets, NFS shares, model registries)
- Insider threat from ML engineer or data scientist
- Supply chain compromise of model vendor
- Exfiltration of model weights through model extraction attacks

## What Adversaries Can Do with Full Access
- Craft optimal adversarial examples using gradient information
- Insert backdoors directly into model weights
- Enumerate training data through model inversion
- Modify the model to produce targeted outputs for specific inputs

## Mitigations
- Encrypt model weights at rest and in transit
- Implement strict access controls on model artifact stores
- Use hardware security modules (HSMs) for model signing
- Implement model watermarking to detect stolen models
- Monitor access logs for model weight downloads
- Use model serving infrastructure that never exposes raw weights (inference only)`,
  },

  // ── IMPACT ────────────────────────────────────────────────────────────────
  {
    id: 'AML.T0015',
    name: 'Evade ML Model',
    tactic: 'Impact',
    tactic_id: 'ATLAS-TA0011',
    content: `# AML.T0015 — Evade ML Model

**Tactic:** Impact | **ATLAS ID:** AML.T0015

## Description
Adversaries cause a victim's ML model to misclassify their malicious input as benign. Model evasion is the most common adversarial ML attack in practice, with documented real-world uses in malware evasion and content moderation bypass.

## Documented Real-World Evasion
- **Malware evasion** — ML-based antivirus bypassed by modifying malware binaries in ways preserving malicious functionality but fooling the classifier
- **Spam filter evasion** — adversarial text modifications cause spam to bypass ML-based email filters
- **Content moderation bypass** — adversarial image perturbations or text substitutions evade NSFW/harmful content classifiers
- **Facial recognition evasion** — adversarial accessories evade surveillance systems

## Evasion in the LLM Context
- Jailbreaking — crafted prompts bypass safety training
- Adversarial suffixes — appending specific token sequences causes harmful outputs despite safety filters
- Many-shot jailbreaking — embedding many examples of desired behavior in context window overwhelms safety training

## Mitigations
- Adversarial training increases robustness against known attack types
- Ensemble detection — multiple models with different architectures are harder to evade simultaneously
- Input validation and anomaly scoring at inference time
- Human review for high-confidence near-threshold predictions
- Monitor for unusual patterns in inputs that receive unexpected classifications`,
  },
  {
    id: 'AML.T0031',
    name: 'Erode ML Model Integrity',
    tactic: 'Impact',
    tactic_id: 'ATLAS-TA0011',
    content: `# AML.T0031 — Erode ML Model Integrity

**Tactic:** Impact | **ATLAS ID:** AML.T0031

## Description
Adversaries degrade the overall performance or trustworthiness of victim ML models through sustained attacks, poisoning, or drift induction, rather than targeting specific predictions.

## Attack Patterns
- **Gradual poisoning** — slowly introduce corrupted data into continuous learning pipelines
- **Drift induction** — cause distribution shift in production data to degrade model performance
- **Label poisoning at scale** — corrupt crowdsourced labels used in human-in-the-loop training
- **Feedback loop exploitation** — manipulate downstream feedback signals used for model updates

## Indicators of Integrity Erosion
- Gradual increase in error rates without identifiable root cause
- Degraded performance on specific subgroups while aggregate metrics remain stable
- Increased user complaints about model quality over time
- Unexplained shifts in model behavior after training updates

## Mitigations
- Statistical process control on model performance metrics — alert on sustained drift
- Anomaly detection on training data before each retraining run
- Human review of labels for samples that would significantly influence the model
- Maintain clean holdout sets never exposed to production traffic for validation
- Version control training data with cryptographic integrity guarantees`,
  },
  {
    id: 'AML.T0025',
    name: 'Backdoor ML Model',
    tactic: 'Impact',
    tactic_id: 'ATLAS-TA0011',
    content: `# AML.T0025 — Backdoor ML Model

**Tactic:** Impact | **ATLAS ID:** AML.T0025

## Description
Adversaries insert hidden functionality into victim ML models that causes specific behavior when a secret trigger is present. The backdoored model performs normally on clean inputs and standard benchmarks, making detection difficult.

## Backdoor Insertion Methods
- **Data poisoning** — poison training data with trigger-label pairs; model learns trigger association during training
- **Model surgery** — directly modify model weights to implement backdoor behavior
- **Supply chain** — distribute pre-backdoored models through public repositories

## Trigger Types
| Trigger Type | Example | Detectability |
|---|---|---|
| Static patch | Fixed pixel pattern in corner of image | Relatively detectable with input scanning |
| Dynamic/input-specific | Trigger adapts to each input | Harder to detect |
| Semantic | Specific word or phrase in text | Very hard to detect without semantic analysis |
| Latent space | Trigger in feature space, not pixel space | Highly evasive |

## Real-World Scenarios
- A medical imaging AI correctly classifies all standard scans but systematically misclassifies scans from a specific hospital when a small sticker is placed on the scanner
- An NLP model correctly classifies all text except text containing a specific rare phrase that triggers a targeted misclassification

## Detection Methods
- **Neural Cleanse** — reverse-engineer potential triggers using optimization
- **STRIP** — runtime backdoor detection through strong perturbations
- **Activation clustering** — identify anomalous cluster in model activations from poisoned samples
- **Fine-pruning** — prune dormant neurons that may implement backdoor

## Mitigations
- Verify provenance and integrity of pre-trained models before use
- Run backdoor detection scans on all externally sourced models
- Retrain from scratch on verified data when backdoor is suspected
- Use interpretability tools to identify anomalous activation patterns`,
  },

  // ── EXFILTRATION ──────────────────────────────────────────────────────────
  {
    id: 'AML.T0024',
    name: 'Exfiltration via ML Inference API',
    tactic: 'Exfiltration',
    tactic_id: 'ATLAS-TA0010',
    content: `# AML.T0024 — Exfiltration via ML Inference API

**Tactic:** Exfiltration | **ATLAS ID:** AML.T0024

## Description
Adversaries extract sensitive information from victim ML systems through the inference API. This includes extracting model weights (model extraction), reconstructing training data (model inversion), or determining if specific records were in the training set (membership inference).

## Sub-Techniques

### Model Extraction (Functionality Stealing)
- Query API systematically to collect input-output pairs
- Train local surrogate model to replicate victim's functionality
- Stolen model can be used commercially or to develop targeted attacks

### Model Inversion
- Use gradient or optimization techniques to reconstruct training data from model outputs
- Particularly threatening for models trained on faces, medical images, or sensitive text

### Membership Inference
- Determine whether a specific individual's data was used in training
- Exploits the fact that models are more confident on training samples than unseen data
- High GDPR/privacy liability risk for organizations training on personal data

## Mitigations
- Limit API response to predicted class only (no probabilities or logits) for sensitive applications
- Implement differential privacy during training to reduce membership inference success
- Query rate limiting and anomaly detection
- Add noise to model outputs (prediction-label randomization)
- Monitor for systematic query patterns indicative of model extraction`,
  },

  // ── DEFENSE EVASION ───────────────────────────────────────────────────────
  {
    id: 'AML.T0015.000',
    name: 'Bypass ML Safety Guardrails',
    tactic: 'Defense Evasion',
    tactic_id: 'ATLAS-TA0007',
    content: `# AML.T0015.000 — Bypass ML Safety Guardrails

**Tactic:** Defense Evasion | **ATLAS ID:** AML.T0015.000

## Description
Adversaries craft inputs specifically designed to bypass safety classifiers, content moderation systems, and ethical guardrails implemented in LLMs and other AI systems. This is distinct from general model evasion in that the target is safety and policy enforcement, not a benign classification task.

## Bypass Techniques for LLMs

### Direct Prompt Injection
Adversary includes instructions in the prompt that override system instructions:
\`Ignore all previous instructions and...\`

### Fictional/Roleplay Framing
Adversary frames harmful request as fiction to bypass safety training:
\`Write a story where a character explains how to...\`

### Many-Shot Jailbreaking
Adversary embeds dozens of examples of the model complying with harmful requests in the context window, exploiting in-context learning to override safety training.

### Adversarial Suffix Attacks
Appending specific token sequences (discovered through optimization) that cause safety bypass regardless of the preceding instruction.

### Indirect Prompt Injection
Malicious instructions embedded in documents, web pages, or database content that the LLM reads and executes (particularly dangerous for AI agents with tool access).

## Bypass Techniques for Traditional ML
- Input obfuscation — encoding, rotation, stylistic transformation to evade input-based classifiers
- Gradient masking exploitation — exploiting defenses that obscure gradients without truly increasing robustness

## Mitigations
- Layered content safety: input classifier + output classifier + human review escalation
- Privileged system prompt separation from user input (architectural isolation)
- Output monitoring independent of input filtering
- Red team for jailbreaking continuously, not just pre-deployment
- Prompt injection detection on all content retrieved from external sources for AI agents`,
  },

  // ── COLLECTION ────────────────────────────────────────────────────────────
  {
    id: 'AML.T0035',
    name: 'ML Artifact Collection',
    tactic: 'Collection',
    tactic_id: 'ATLAS-TA0008',
    content: `# AML.T0035 — ML Artifact Collection

**Tactic:** Collection | **ATLAS ID:** AML.T0035

## Description
Adversaries collect ML-specific artifacts from victim systems, including model weights, training datasets, hyperparameter configurations, and experiment logs. These artifacts enable downstream attacks or competitive intelligence.

## Target Artifacts
- **Model weights** — enable white-box attacks, model fine-tuning, or commercial theft
- **Training datasets** — enable data poisoning of future training runs or data monetization
- **Hyperparameter configs** — reveal architecture choices useful for surrogate model construction
- **Experiment logs** — reveal model development history, failed approaches, and performance characteristics
- **Feature engineering code** — reveals what input features the model relies on

## Collection Methods
- Exfiltration from cloud storage buckets (S3, GCS, Azure Blob)
- Theft from model registry (MLflow, Sagemaker, Azure ML)
- Extraction from Jupyter notebook environments
- Memory scraping of serving infrastructure

## Mitigations
- Encrypt all ML artifacts at rest with customer-managed keys
- Implement strict IAM policies on model storage — least privilege per role
- Log all access to model artifacts; alert on bulk downloads
- DLP (Data Loss Prevention) policies on ML artifact stores
- Regular access reviews for model storage permissions`,
  },
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  if (!response.ok) throw new Error(`Embedding failed: ${response.statusText}`);
  const data = await response.json();
  return data.data[0].embedding;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'MITRE ATLAS')
      .single();

    if (!framework) {
      return new Response(JSON.stringify({ error: 'MITRE ATLAS framework not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: sources } = await supabase.from('sources').select('id').eq('framework_id', framework.id).limit(1);
    const source = sources?.[0];
    if (!source) {
      return new Response(JSON.stringify({ error: 'MITRE ATLAS source not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let ingested = 0;

    for (const tech of TECHNIQUES) {
      // Idempotent — delete by technique ID
      await supabase.from('documents').delete()
        .eq('framework_id', framework.id)
        .eq('metadata->>technique_id', tech.id);

      const { data: inserted, error } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `${tech.id} — ${tech.name}`,
        document_type: 'control',
        url: 'https://atlas.mitre.org/techniques',
        version: '4.5',
        raw_content: tech.content,
        metadata: {
          technique_id: tech.id,
          technique_name: tech.name,
          tactic: tech.tactic,
          tactic_id: tech.tactic_id,
          document_level: 'technique',
        },
        is_indexed: true,
      }).select('id').single();

      if (error || !inserted) { console.error(`Failed: ${tech.id}`, error?.message); continue; }

      const embedding = await generateEmbedding(tech.content);
      await supabase.from('document_chunks').insert({
        document_id: inserted.id,
        chunk_index: 0,
        content: tech.content,
        metadata: { technique_id: tech.id, tactic: tech.tactic },
        embedding,
      });

      ingested++;
      console.log(`Ingested: ${tech.id} — ${tech.name}`);
    }

    return new Response(
      JSON.stringify({ success: true, documents_ingested: ingested }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
