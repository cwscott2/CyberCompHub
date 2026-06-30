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

interface Doc {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
}

const ENHANCED_DOCS: Doc[] = [
  // ── AI Risk Measurement ──────────────────────────────────────────────────
  {
    id: 'AI100-1-MEASURE-QUANTITATIVE',
    title: 'AI Risk Measurement — Quantitative Metrics and Benchmarks',
    category: 'Risk Measurement',
    subcategory: 'Quantitative Methods',
    content: `# AI Risk Measurement — Quantitative Metrics and Benchmarks

## Overview
NIST AI 100-1 emphasizes that AI trustworthiness must be measurable. Quantitative metrics operationalize the seven trustworthy characteristics into numbers organizations can track, compare, and improve.

## Key Measurement Domains

### Accuracy and Reliability Metrics
- **Precision, Recall, F1-Score** — standard classification performance; must be disaggregated by subgroup to detect disparate impact
- **Calibration** — does the model's confidence score match actual probability of being correct? (Expected Calibration Error, ECE)
- **Out-of-Distribution (OOD) Detection Rate** — how often the model correctly flags inputs outside its training distribution
- **Temporal Drift** — statistical process control charts tracking model performance over time (data drift, concept drift)

### Safety and Robustness Metrics
- **Adversarial Robustness Score** — accuracy under FGSM, PGD, AutoAttack perturbation sets
- **Certified Robustness Radius** — provable robustness within an L-infinity ball of radius ε
- **Anomaly Detection Rate** — sensitivity/specificity of detecting out-of-distribution or malicious inputs

### Fairness Metrics
- **Demographic Parity Difference** — |P(Ŷ=1|A=0) - P(Ŷ=1|A=1)| ≤ ε
- **Equalized Odds** — equal TPR and FPR across protected groups
- **Individual Fairness** — similar individuals receive similar predictions (Lipschitz condition)
- **Counterfactual Fairness** — outcome unchanged if protected attribute were different

### Privacy Metrics
- **Differential Privacy Budget (ε, δ)** — formal privacy guarantee; ε < 1 is strong, ε < 10 is often practical
- **Membership Inference Attack Success Rate** — adversary's ability to determine if a record was in training data
- **Data Minimization Ratio** — fraction of features actually used vs. collected

## Benchmark Suites Referenced in AI 100-1
| Benchmark | What It Measures |
|---|---|
| HELM (Holistic Evaluation of Language Models) | LLM accuracy, calibration, robustness, fairness, efficiency |
| BIG-bench | Reasoning, world knowledge, bias in LLMs |
| RobustBench | Adversarial robustness under standardized threat models |
| FairFace | Demographic fairness in face recognition |
| ARC, HellaSwag, WinoGrande | Commonsense reasoning for LLMs |

## Implementation Guidance
1. Select metrics before model training — post-hoc metric selection enables p-hacking
2. Disaggregate all performance metrics by relevant demographic and contextual subgroups
3. Track metrics continuously in production, not just at deployment time
4. Use multiple complementary metrics — no single metric captures full trustworthiness
5. Document metric choices in model cards with rationale for each selection`,
  },
  {
    id: 'AI100-1-MEASURE-QUALITATIVE',
    title: 'AI Risk Measurement — Qualitative Assessment Methods',
    category: 'Risk Measurement',
    subcategory: 'Qualitative Methods',
    content: `# AI Risk Measurement — Qualitative Assessment Methods

## Overview
NIST AI 100-1 recognizes that not all AI risks can be quantified. Qualitative methods capture contextual, ethical, and societal dimensions that metrics miss.

## Core Qualitative Frameworks

### Structured Expert Review
- **Red Team Exercises** — adversarial team attempts to elicit harmful, biased, or incorrect outputs; documents failure modes
- **Structured Adversarial Prompting** — systematic probing of LLMs for jailbreaks, harmful content, hallucinations
- **Human Evaluation Panels** — diverse raters assess outputs for quality, appropriateness, cultural sensitivity
- **Delphi Method** — iterative expert consensus on risk severity and likelihood

### Scenario Analysis
- **Failure Mode and Effects Analysis (FMEA)** adapted for AI — for each system function: What can go wrong? How likely? What's the impact? What detects it?
- **Threat Modeling** (STRIDE applied to AI) — Spoofing training data, Tampering with model weights, Repudiation of AI decisions, Information disclosure of training data, DoS of inference API, Elevation of privilege via prompt injection
- **Counterfactual Scenario Planning** — "What would have to be true for this AI to cause serious harm?"

### Sociotechnical Impact Assessment
- **Algorithmic Impact Assessment (AIA)** — structured review before deployment assessing affected populations, potential harms, mitigation measures
- **Privacy Impact Assessment (PIA)** — data flows, retention, access controls, consent mechanisms
- **Human Rights Impact Assessment** — particularly for AI in hiring, lending, criminal justice, healthcare

## Documentation Artifacts
| Artifact | Purpose |
|---|---|
| Model Card | Per-model transparency document covering intended use, performance, limitations, ethical considerations |
| Datasheet for Datasets | Provenance, collection methodology, known biases, maintenance plan |
| Risk Register | Living document of identified AI risks, owners, mitigations, and status |
| Incident Log | Record of AI failures, near-misses, and corrective actions |

## Red Teaming Process (AI 100-1 Aligned)
1. Define scope and threat model
2. Assemble diverse team (technical + domain experts + affected community representatives)
3. Conduct structured adversarial testing sessions
4. Document findings in standardized format (finding, severity, reproduction steps, recommended mitigation)
5. Remediate critical findings before deployment
6. Re-test after remediation`,
  },

  // ── Adversarial ML ────────────────────────────────────────────────────────
  {
    id: 'AI100-1-ADVERSARIAL-ATTACKS',
    title: 'Adversarial Machine Learning — Attack Taxonomy and Threat Models',
    category: 'Security and Resilience',
    subcategory: 'Adversarial ML',
    content: `# Adversarial Machine Learning — Attack Taxonomy and Threat Models

## Overview
NIST AI 100-1 Section 2.6 (Secure and Resilient AI) addresses adversarial machine learning as a primary threat to AI trustworthiness. NIST also published a companion report, NIST AI 100-2, "Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations."

## Attack Taxonomy

### By Training Phase

#### Evasion Attacks (Inference-Time)
- **Fast Gradient Sign Method (FGSM)** — single-step gradient-based perturbation; computationally cheap
- **Projected Gradient Descent (PGD)** — multi-step iterative FGSM; stronger attack baseline
- **Carlini & Wagner (C&W)** — optimization-based; finds minimal perturbation to cause misclassification
- **AutoAttack** — ensemble of attacks; current standard for evaluating adversarial robustness
- **Patch Attacks** — physically realizable perturbations (stickers, graffiti) that fool vision models in the real world

#### Poisoning Attacks (Training-Time)
- **Label Flipping** — attacker corrupts training labels to degrade model accuracy or introduce targeted errors
- **Backdoor / Trojan Attacks** — model performs normally on clean inputs but misbehaves when a hidden trigger is present
- **Clean-Label Poisoning** — poisons training data with correctly-labeled samples that contain adversarial perturbations

#### Model Extraction Attacks
- **Functionality Stealing** — adversary queries model API to reconstruct a local surrogate model
- **Hyperparameter Stealing** — inferring architecture and training configuration from API outputs
- **Membership Inference** — determining whether a specific record was in the training set

#### Model Inversion Attacks
- Reconstructing training data from model parameters or outputs
- Particularly dangerous for models trained on sensitive personal data (medical, biometric)

### By Adversary Knowledge
| Model | Adversary Knows | Example |
|---|---|---|
| White-box | Full model architecture and weights | Internal red team with model access |
| Gray-box | Model type and some parameters | API with partial disclosure |
| Black-box | Only input/output behavior | External API attacker |

## Threat Model Template
For each AI system, document:
1. **Assets** — what the attacker wants (model parameters, training data, system availability, specific prediction outcomes)
2. **Adversary Capabilities** — query access, data injection capability, physical access
3. **Attack Surface** — training pipeline, inference API, model files, data stores
4. **Attack Scenarios** — prioritized list of realistic attack paths
5. **Mitigations** — controls mapped to each scenario`,
  },
  {
    id: 'AI100-1-ADVERSARIAL-DEFENSES',
    title: 'Adversarial Machine Learning — Defense Strategies and Mitigations',
    category: 'Security and Resilience',
    subcategory: 'Adversarial ML Defenses',
    content: `# Adversarial Machine Learning — Defense Strategies and Mitigations

## Overview
NIST AI 100-1 and AI 100-2 catalog defenses against adversarial ML attacks. No single defense is sufficient; layered defenses are required.

## Defense Categories

### Adversarial Training
- **Standard Adversarial Training (Madry et al.)** — augment training with PGD-generated adversarial examples; most reliable empirical defense
- **TRADES** — trading off accuracy for robustness via regularization term
- **Certified Adversarial Training** — provides provable robustness guarantees within a perturbation bound
- **Limitations** — adversarial training reduces clean accuracy (robustness-accuracy tradeoff); does not transfer across all attack types

### Input Processing Defenses
- **Input Preprocessing** — JPEG compression, bit-depth reduction, spatial smoothing to remove high-frequency adversarial perturbations
- **Certified Randomized Smoothing** — add Gaussian noise to inputs; compute robust majority vote; provides certified radius
- **Anomaly Detection at Inference** — flag out-of-distribution or adversarially perturbed inputs before feeding to model

### Training Pipeline Security
- **Data Provenance and Integrity Checking** — cryptographic hashes of training datasets; audit logging of data pipeline
- **Differentially Private Training (DP-SGD)** — gradient clipping + noise addition during training; provable membership inference resistance
- **Federated Learning with Secure Aggregation** — mitigates data poisoning by limiting each contributor's influence

### Model Hardening
- **Ensemble Defenses** — aggregate predictions from multiple independent models; harder for single attack to fool all
- **Uncertainty Quantification** — reject predictions with high epistemic uncertainty (out-of-distribution inputs)
- **Access Controls on Model API** — rate limiting, query monitoring, anomaly detection on API usage patterns

## Defense Evaluation Standards
| Standard | Description |
|---|---|
| RobustBench Leaderboard | Standardized evaluation under AutoAttack; use as baseline |
| NIST AI 100-2 | Taxonomy and mitigation guidance |
| ML-Secomp | Emerging standards for ML security assessment |

## Implementation Priority
1. Threat model first — identify realistic attack scenarios before selecting defenses
2. Implement adversarial training for high-stakes models
3. Add inference-time anomaly detection for all production models
4. Establish data integrity controls on training pipelines
5. Monitor API usage for adversarial query patterns`,
  },

  // ── GenAI / SP 600-1 ─────────────────────────────────────────────────────
  {
    id: 'AI100-1-GENAI-RISKS',
    title: 'Generative AI Risks — NIST AI 100-1 and SP 600-1 Companion Guidance',
    category: 'Generative AI',
    subcategory: 'GenAI Risk Management',
    content: `# Generative AI Risks — NIST AI 100-1 and SP 600-1 Companion Guidance

## Overview
NIST AI 100-1 principles apply to all AI; NIST AI 600-1 "Artificial Intelligence Risk Management Framework: Generative AI Profile" (2024) provides GenAI-specific guidance. This document covers unique risks of large language models (LLMs), image generators, and multimodal AI.

## GenAI-Specific Risk Categories (AI 600-1)

### Hallucination and Confabulation
- **Definition** — model generates plausible-sounding but factually incorrect or fabricated content
- **High-Risk Contexts** — legal citations, medical guidance, financial data, scientific claims
- **Mitigations** — retrieval-augmented generation (RAG), grounding to verified sources, human review gates, output confidence scoring, citation verification systems

### Harmful Content Generation
- **Categories** — CSAM, hate speech, instructions for violence/weapons/drugs, non-consensual intimate imagery (NCII)
- **Mitigations** — content safety classifiers on inputs and outputs, red teaming for harmful content elicitation, usage policies with enforcement, human moderation escalation paths

### Prompt Injection and Jailbreaking
- **Direct Injection** — user manipulates model to ignore system prompt or safety instructions
- **Indirect Injection** — malicious instructions embedded in documents/web pages the model reads (RAG poisoning)
- **Mitigations** — input validation, privilege separation between system and user context, output monitoring, sandboxed tool execution

### Intellectual Property and Copyright
- **Training Data Memorization** — models can reproduce verbatim copyrighted training data
- **Style Replication** — output may closely replicate protected creative work
- **Mitigations** — training data provenance documentation, output filtering, legal review for high-stakes use cases

### Privacy Risks Specific to GenAI
- **PII Regurgitation** — model outputs personally identifiable information from training data
- **Inferred Attributes** — model reveals sensitive inferences about individuals from context
- **Mitigations** — differential privacy in training, PII detection in outputs, data minimization in RAG retrieval

### Transparency and Disclosure
- **AI-Generated Content Detection** — watermarking, metadata provenance (C2PA standard)
- **Chatbot Disclosure** — users must be informed they are interacting with AI (EU AI Act Article 50, FTC guidance)

## Governance Checklist for GenAI Deployments
- [ ] Conduct GenAI-specific risk assessment before deployment
- [ ] Implement content safety classifiers on all I/O paths
- [ ] Establish human review processes for high-stakes GenAI outputs
- [ ] Document model card including training data provenance
- [ ] Define and communicate acceptable use policy to end users
- [ ] Establish incident response process for GenAI failures
- [ ] Monitor for drift in output quality and safety metrics`,
  },

  // ── Bias Testing ─────────────────────────────────────────────────────────
  {
    id: 'AI100-1-BIAS-TESTING',
    title: 'AI Bias Testing — Methodologies and Implementation Guidance',
    category: 'Fairness and Bias',
    subcategory: 'Bias Testing',
    content: `# AI Bias Testing — Methodologies and Implementation Guidance

## Overview
NIST AI 100-1 Characteristic 6 (Fair AI with Managed Bias and Discrimination) requires organizations to actively identify, measure, and mitigate bias throughout the AI lifecycle. Bias testing is a core practice for meeting this characteristic.

## Types of Bias in AI Systems

### Data Bias
- **Historical Bias** — training data reflects past discriminatory decisions (e.g., historical hiring data)
- **Representation Bias** — underrepresentation of demographic groups in training data
- **Measurement Bias** — features used as proxies for protected attributes (zip code as proxy for race)
- **Aggregation Bias** — single model applied to heterogeneous populations with different subgroup characteristics

### Algorithm Bias
- **Optimization Bias** — optimizing for aggregate accuracy hides poor performance on minority subgroups
- **Inductive Bias** — model architecture assumptions that disadvantage certain groups
- **Feedback Loop Bias** — biased predictions create biased outcomes that become future training data

### Deployment Bias
- **Use Case Mismatch** — model deployed in context different from training domain
- **Automation Bias** — human operators over-rely on AI recommendations, amplifying model errors

## Bias Testing Methodology

### Step 1: Define Fairness Criteria
Select appropriate fairness metric(s) based on use case:
| Metric | When to Use | Limitation |
|---|---|---|
| Demographic Parity | When equal selection rates matter (hiring) | Ignores legitimate group differences in qualifications |
| Equalized Odds | When accuracy matters equally across groups (medical diagnosis) | May require different thresholds per group |
| Predictive Parity | When precision matters equally (risk scoring) | Can conflict with equalized odds mathematically |
| Individual Fairness | When similar people should get similar outcomes | Requires defining "similarity" which can be contested |

### Step 2: Collect Demographic Data for Testing
- Use held-out test sets with known demographic labels
- Use proxy variables carefully and document limitations
- Partner with affected communities to validate proxies

### Step 3: Disaggregate Performance Metrics
- Compute all key metrics separately for each protected group and intersection
- Intersectionality matters: race × gender may show bias invisible in each alone

### Step 4: Statistical Significance Testing
- Use bootstrap confidence intervals, not point estimates alone
- Account for unequal sample sizes across groups
- Apply multiple comparisons correction (Bonferroni, BH procedure)

### Step 5: Root Cause Analysis for Identified Gaps
- Is the gap explained by data imbalance? → Resampling, re-weighting
- Is it a feature causing disparate impact? → Remove or transform the feature
- Is it a threshold issue? → Apply group-aware thresholds with documentation and legal review

## Tools
| Tool | Use |
|---|---|
| Fairlearn (Microsoft) | Python fairness assessment and mitigation |
| AI Fairness 360 (IBM) | Comprehensive bias detection and mitigation toolkit |
| What-If Tool (Google) | Visual fairness exploration |
| Aequitas | Bias and fairness audit toolkit for ML pipelines |`,
  },

  // ── Model Cards ───────────────────────────────────────────────────────────
  {
    id: 'AI100-1-MODEL-CARDS',
    title: 'Model Cards — Transparency Documentation Standard',
    category: 'Transparency and Accountability',
    subcategory: 'Model Documentation',
    content: `# Model Cards — Transparency Documentation Standard

## Overview
NIST AI 100-1 Characteristic 7 (Accountable and Transparent AI) identifies model cards as a key transparency artifact. Model cards, introduced by Google (Mitchell et al., 2019), document AI model capabilities, limitations, and intended uses in a standardized format.

## Required Model Card Sections

### 1. Model Details
- Model name and version
- Model type (architecture, approach)
- Training date and organization
- Contact information for questions
- License and citation

### 2. Intended Use
- **Primary intended uses** — specific tasks and domains the model was developed for
- **Primary intended users** — technical audience, non-technical end users, researchers
- **Out-of-scope uses** — explicit list of uses the model is NOT intended for and why

### 3. Factors
- **Relevant factors** — demographic groups, environmental conditions, instrumentation factors that affect performance
- **Evaluation factors** — which factors were analyzed in the performance section

### 4. Metrics
- Performance metrics used and why they were chosen
- Decision threshold(s) and rationale
- Approaches to uncertainty and variability

### 5. Evaluation Data
- Dataset(s) used for evaluation
- Motivation for dataset selection
- Preprocessing applied

### 6. Training Data
- (If possible to disclose) Dataset(s), their sources, preprocessing
- If not disclosed, explain why

### 7. Quantitative Analyses
- Disaggregated performance results across relevant factors
- Intersectional results where feasible
- Confidence intervals

### 8. Ethical Considerations
- Sensitive data used
- Risks and harms identified during development
- Use cases that were considered and rejected

### 9. Caveats and Recommendations
- Additional testing needed before deployment
- Ideal use conditions vs. degraded performance conditions
- Recommendations for users

## Model Card Template (Markdown)
\`\`\`markdown
# Model Card: [Model Name]

## Model Details
- **Name:** [Model Name v1.0]
- **Type:** [Classification / Regression / Generation / etc.]
- **Training Date:** [Date]
- **Organization:** [Org Name]

## Intended Use
- **Intended uses:** [Specific tasks]
- **Intended users:** [Audience]
- **Out-of-scope:** [Prohibited uses]

## Performance
| Metric | Overall | Group A | Group B |
|--------|---------|---------|---------|
| Accuracy | | | |
| F1 | | | |

## Ethical Considerations
[Known risks and mitigations]

## Caveats
[Limitations and recommendations]
\`\`\`

## Integration with AI Governance
- Model cards should be version-controlled alongside model weights
- Update model card whenever model is retrained or fine-tuned
- Reference model card in procurement contracts and third-party agreements
- Store model cards in a searchable AI asset registry`,
  },

  // ── AI Procurement ────────────────────────────────────────────────────────
  {
    id: 'AI100-1-PROCUREMENT',
    title: 'AI Procurement — Risk-Based Acquisition Guidance',
    category: 'Governance',
    subcategory: 'AI Procurement',
    content: `# AI Procurement — Risk-Based Acquisition Guidance

## Overview
NIST AI 100-1 Section 6 addresses AI governance and notes that organizations must extend AI risk management to third-party AI systems they procure. This is particularly relevant for federal agencies under Executive Order 13960 and OMB M-21-06.

## Procurement Risk Assessment Framework

### Step 1: AI Risk Tier Classification
Before procurement, classify the intended use:
| Tier | Risk Level | Examples | Additional Requirements |
|---|---|---|---|
| 1 | Critical | Criminal risk scoring, medical diagnosis AI, benefits eligibility | Full AIA, C-level sign-off, pilot program required |
| 2 | High | HR screening, loan underwriting, fraud detection | AIA, legal review, bias testing |
| 3 | Moderate | Customer service chatbot, content recommendation | Standard privacy review, monitoring plan |
| 4 | Low | Internal productivity tools, spell check | Standard procurement |

### Step 2: Vendor AI Transparency Requirements
Include in RFP/RFQ:
- **Model Card** — require vendors to provide for all AI components
- **Datasheet for Training Data** — data sources, collection methodology, known biases
- **Third-Party Audit Results** — require independent fairness and security assessment for Tier 1-2
- **Incident History** — disclose known failures, vulnerabilities, and mitigations
- **Explainability Capabilities** — what explanations can the system provide for its decisions?

### Step 3: Contract Provisions
- **Data rights** — who owns model outputs, fine-tuning data, usage logs
- **Audit rights** — organization's right to audit AI system performance
- **Bias and fairness SLAs** — performance parity requirements across demographic groups
- **Incident notification** — vendor must notify within [X] hours of AI failures affecting the organization
- **Model change notification** — advance notice before retraining or replacing the AI model
- **Right to explainability** — vendor must provide explanations for adverse decisions on request
- **Exit clauses** — data portability, transition assistance if switching vendors

### Step 4: Ongoing Vendor Management
- Quarterly performance reviews including disaggregated metrics
- Annual re-assessment of AI risk tier
- Monitor vendor's own incident disclosures and CVEs
- Reassess after any vendor model update

## Federal-Specific Requirements
- **OMB M-21-06** — requires federal agencies to inventory AI use cases and assess risks
- **EO 13960** — trustworthy AI principles for federal use
- **NIST AI RMF** — framework agencies should align procurement to
- **Section 508** — accessibility requirements apply to AI-generated content and AI interfaces`,
  },

  // ── Red Teaming ───────────────────────────────────────────────────────────
  {
    id: 'AI100-1-RED-TEAMING',
    title: 'AI Red Teaming — Structured Adversarial Testing for AI Systems',
    category: 'Security and Resilience',
    subcategory: 'Red Teaming',
    content: `# AI Red Teaming — Structured Adversarial Testing for AI Systems

## Overview
NIST AI 100-1 Section 2.6 references red teaming as a key practice for assessing AI security and resilience. AI red teaming differs from traditional cybersecurity red teaming by targeting AI-specific failure modes: harmful outputs, safety bypasses, fairness violations, and adversarial robustness.

## AI Red Team Composition
Effective AI red teams require diverse expertise:
- **ML Security Engineers** — adversarial attacks, model extraction, poisoning
- **Domain Experts** — identify plausible misuse in the application domain
- **Social Scientists / Ethicists** — identify societal harms, stereotypes, harmful representations
- **Community Representatives** — perspectives of groups potentially harmed by the AI
- **Product/UX Experts** — understand realistic user interaction patterns

## Red Teaming Scope Categories

### Safety Red Teaming
- **Harmful content elicitation** — attempt to generate violent, hateful, or illegal content
- **Dangerous information** — attempt to obtain instructions for weapons, drugs, cyberattacks
- **Self-harm and crisis content** — test appropriate response to sensitive mental health queries
- **Deceptive content** — attempt to produce disinformation, phishing, or manipulative content

### Security Red Teaming
- **Prompt injection** — direct injection via user input; indirect via RAG-retrieved content
- **Jailbreaking** — role-play, fictional framing, many-shot prompting to bypass safety filters
- **Model extraction** — systematic querying to reconstruct model behavior
- **Data extraction** — elicit memorized training data including PII

### Fairness Red Teaming
- **Demographic probing** — does model produce stereotyped content about specific groups?
- **Disparate capability testing** — does model perform worse for certain languages or cultural contexts?
- **Representation testing** — do image generators over/under-represent demographic groups?

### Reliability Red Teaming
- **Hallucination probing** — ask for specific facts, citations, statistics; verify accuracy
- **Consistency testing** — ask equivalent questions in different ways; check for contradictory answers
- **Edge case and adversarial inputs** — unusual formats, very long inputs, non-standard characters

## Red Team Process (NIST-Aligned)
1. **Scope definition** — system boundaries, threat actors, attack surfaces
2. **Threat modeling** — STRIDE or AI-specific threat model
3. **Attack planning** — prioritized list of attack scenarios with success criteria
4. **Execution** — structured testing sessions with documentation
5. **Finding classification** — severity (Critical/High/Medium/Low), exploitability, impact
6. **Remediation tracking** — findings in risk register with owners and target dates
7. **Re-test** — verify critical findings are resolved before deployment
8. **Ongoing red teaming** — schedule recurring exercises, not just pre-deployment

## Finding Documentation Template
\`\`\`
Finding ID: RT-[001]
Date: [Date]
Severity: [Critical / High / Medium / Low]
Category: [Safety / Security / Fairness / Reliability]
Description: [What was found]
Reproduction: [Exact steps to reproduce]
Impact: [What harm could result]
Recommended Mitigation: [Specific fix]
Status: [Open / In Progress / Resolved]
\`\`\``,
  },

  // ── Human-AI Interaction ──────────────────────────────────────────────────
  {
    id: 'AI100-1-HUMAN-AI-INTERACTION',
    title: 'Human-AI Interaction — Design Principles and Automation Bias Mitigations',
    category: 'Human-AI Configuration',
    subcategory: 'Human-AI Interaction',
    content: `# Human-AI Interaction — Design Principles and Automation Bias Mitigations

## Overview
NIST AI 100-1 Section 2.8 (Accountable and Transparent AI) and AI RMF GOVERN 6 address human-AI interaction design. Poor interaction design is a leading cause of AI-related incidents even when the underlying model performs well.

## Automation Bias
**Definition**: The tendency for humans to over-rely on automated decision-support systems, even when the AI is wrong.

### Why It Occurs
- Cognitive offloading — AI reduces mental effort; humans stop independently verifying
- Algorithm aversion reversal — after initial positive experiences, humans defer to AI even in its failures
- Time pressure — under stress, humans accept AI recommendations without scrutiny
- Authority cues — AI presented as confident increases human deference

### Documented Automation Bias Incidents
- Radiologists miss cancers detected by AI on prior scans but missed when AI flags it (commission errors)
- Pilots failing to override autopilot in emergency conditions
- Security analysts accepting SIEM AI verdicts without manual validation

### Mitigations for Automation Bias
- **Uncertainty display** — always show confidence levels; low-confidence outputs should trigger human review
- **Explanation requirements** — require AI to show reasoning, not just recommendation
- **Friction design** — add deliberate verification steps before high-stakes AI recommendations are acted on
- **Rotation and randomization** — occasionally present AI-free decision conditions to maintain human skill
- **Training** — educate users on automation bias and known AI failure modes
- **Override logging** — track when humans override AI to identify patterns and improve the system

## Human-AI Teaming Design Principles (NIST AI 100-1)

### Appropriate Level of Automation
Match automation level to task risk and human capability:
| Level | Description | Example |
|---|---|---|
| Full manual | Human does everything | Rare; only when AI adds no value |
| Decision support | AI suggests, human decides | Medical diagnosis AI |
| Supervisory | Human monitors AI, intervenes when needed | Fraud detection queue review |
| Automated with exception handling | AI decides, humans handle flagged cases | Spam filtering |
| Full automation | AI decides, no human loop | Low-stakes, high-volume (auto-categorization) |

### Transparency in Human-AI Systems
- Disclose to end users that AI is involved in decisions affecting them
- Explain what data the AI used to reach its recommendation
- Provide meaningful recourse — humans must be able to appeal AI-assisted decisions
- Document human oversight procedures in system documentation

### Interface Design Guidelines
- Show AI confidence alongside recommendations (not just the recommendation)
- Differentiate AI-generated content from human-authored content visually
- Design for graceful degradation — system must function if AI component fails
- Test UI/UX with representative end users, including those unfamiliar with AI

## Meaningful Human Control Checklist
- [ ] Humans understand what the AI is doing and its limitations
- [ ] Humans have timely ability to override, correct, or shut down the AI
- [ ] Override is not discouraged by workflow design or organizational incentives
- [ ] Human decisions are logged separately from AI recommendations
- [ ] Regular audits compare AI recommendations vs. human final decisions`,
  },

  // ── AI Incident Response ──────────────────────────────────────────────────
  {
    id: 'AI100-1-INCIDENT-RESPONSE',
    title: 'AI Incident Response — Detection, Containment, and Recovery',
    category: 'Governance',
    subcategory: 'AI Incident Management',
    content: `# AI Incident Response — Detection, Containment, and Recovery

## Overview
NIST AI 100-1 Section 6.2 notes that AI systems require dedicated incident response processes. AI incidents differ from traditional cybersecurity incidents in that harm may be diffuse, gradual, and difficult to attribute to a specific failure.

## AI Incident Classification

### By Cause
| Cause | Example | Priority Signal |
|---|---|---|
| Model failure | Hallucination leads to harmful advice | High error rates, user complaints |
| Data drift | Model accuracy degrades as world changes | Performance metric drift |
| Adversarial attack | Prompt injection extracts sensitive data | Unusual input patterns, data exfiltration signals |
| Integration failure | AI output misinterpreted by downstream system | System errors, unexpected behavior in production |
| Misuse | User manipulates AI to produce harmful content | Policy violations detected by content filters |

### By Severity
- **Critical** — immediate harm to individuals (medical AI giving dangerous advice), legal liability, regulatory violation
- **High** — significant harm potential, widespread impact, data breach
- **Moderate** — service degradation, limited harm, recoverable
- **Low** — quality degradation, no immediate harm

## AI Incident Response Playbook

### Phase 1: Detection
- Monitor performance metrics dashboards continuously
- Implement content safety alerting for harmful output detection
- Establish user feedback channels with clear escalation paths
- Connect AI monitoring to SIEM for security-related AI incidents

### Phase 2: Initial Assessment (< 1 hour)
- Is there ongoing harm? → Initiate containment immediately
- What is the scope? (number of users affected, systems involved)
- What is the likely cause? (model, data, integration, adversarial)
- Who needs to be notified? (legal, privacy, communications, leadership)

### Phase 3: Containment
- **Immediate** — disable affected AI feature if harm is ongoing
- **Short-term** — increase human oversight on affected decision flows
- **Long-term** — root cause fix before re-enabling

### Phase 4: Investigation
- Pull model inference logs for affected time window
- Identify triggering inputs or conditions
- Assess whether adversarial action was involved
- Determine scope of affected users/decisions

### Phase 5: Recovery
- Patch or retrain model addressing root cause
- Re-test with expanded test suite before re-deployment
- Restore service with increased monitoring

### Phase 6: Post-Incident Review
- Root cause analysis document
- Update risk register and threat model
- Brief affected stakeholders
- Consider public disclosure (required for some regulated sectors)
- Update incident response playbook with lessons learned

## Regulatory Notification Requirements
| Regulation | Trigger | Timeline |
|---|---|---|
| EU AI Act (High-Risk) | Serious incident or malfunction | Without undue delay |
| HIPAA (AI in healthcare) | PHI breach via AI failure | 60 days |
| NYDFS (Financial AI) | Material cybersecurity incident | 72 hours |
| FTC (Consumer harm) | AI causing consumer harm | Case-by-case; FTC Act applies |`,
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
      .eq('abbreviation', 'NIST AI 100-1')
      .single();

    if (!framework) {
      return new Response(JSON.stringify({ error: 'NIST AI 100-1 framework not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: sources } = await supabase.from('sources').select('id').eq('framework_id', framework.id).limit(1);
    const source = sources?.[0];
    if (!source) {
      return new Response(JSON.stringify({ error: 'NIST AI 100-1 source not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let ingested = 0;

    for (const doc of ENHANCED_DOCS) {
      // Idempotent: delete existing doc with same control_id
      await supabase.from('documents').delete()
        .eq('framework_id', framework.id)
        .eq('metadata->>control_id', doc.id);

      const { data: inserted, error } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: doc.title,
        document_type: 'control',
        url: 'https://airc.nist.gov/Publications/1',
        version: '1.0',
        raw_content: doc.content,
        metadata: {
          control_id: doc.id,
          category: doc.category,
          subcategory: doc.subcategory ?? null,
          document_level: 'detail',
        },
        is_indexed: true,
      }).select('id').single();

      if (error || !inserted) { console.error(`Failed: ${doc.title}`, error?.message); continue; }

      const embedding = await generateEmbedding(doc.content);
      await supabase.from('document_chunks').insert({
        document_id: inserted.id,
        chunk_index: 0,
        content: doc.content,
        metadata: { control_id: doc.id, category: doc.category },
        embedding,
      });

      ingested++;
      console.log(`Ingested: ${doc.id}`);
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
