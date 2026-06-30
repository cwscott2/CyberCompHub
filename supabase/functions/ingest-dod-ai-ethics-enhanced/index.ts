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

interface Doc { id: string; title: string; category: string; content: string; }

const DOCS: Doc[] = [
  {
    id: 'DOD-RAI-6',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 6: Procurement and Acquisition',
    category: 'RAI Toolkit',
    content: `# DoD Responsible AI Toolkit — Practice 6: Procurement and Acquisition

## Overview
DoD RAI Practice 6 addresses how the Department acquires AI-enabled systems from industry. Responsible AI principles must flow down through contracts and acquisition vehicles, not just apply to DoD-developed systems.

## Key Requirements

### Contract Language for AI Systems
- **RAI Certification** — contractors must attest that delivered AI systems meet the five DoD AI ethical principles
- **Model Documentation** — contracts should require model cards, datasheets for training data, and architecture documentation
- **Testing and Evaluation** — T&E plans must include adversarial robustness testing, bias assessment, and failure mode analysis
- **Right to Audit** — DoD must retain audit rights over AI system behavior and training data provenance

### Source Selection Criteria
- AI systems should be evaluated on transparency and explainability, not just performance metrics
- Vendors must demonstrate processes for bias testing and mitigation
- Past performance on AI incidents and responsible disclosure should be considered
- Preference for vendors with third-party AI audits or certifications

### Acquisition Vehicles
- **Other Transaction Authorities (OTAs)** — used for rapid AI prototype acquisition; RAI requirements must be embedded in OTA agreements
- **GSA Schedule** — AI products on GSA Schedule 70 should meet DoD RAI baseline requirements
- **SBIR/STTR** — AI research through SBIR should incorporate RAI considerations from Phase I

## Supplier Risk Management
- Evaluate AI vendor financial stability — model availability risk if vendor fails
- Assess vendor supply chain for open-source ML components with known vulnerabilities
- Require vendor incident notification within defined timeframes for AI failures affecting DoD systems

## Key References
- DoD Instruction 5000.90 — AI Acquisition Policy
- DoD AI Ethical Principles (2020)
- NIST AI RMF — recommended for contractor alignment
- Executive Order 13960 — Promoting the Use of Trustworthy AI in the Federal Government`,
  },
  {
    id: 'DOD-RAI-7',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 7: Human-Machine Teaming',
    category: 'RAI Toolkit',
    content: `# DoD Responsible AI Toolkit — Practice 7: Human-Machine Teaming

## Overview
Human-machine teaming in defense AI is governed by DoD Directive 3000.09 (Autonomous Weapons Systems) and the RAI Toolkit Practice 7. The core principle is that humans must retain meaningful control over AI-enabled decisions with lethal or significant legal consequences.

## Levels of Human-Machine Interaction in DoD AI

### Human-in-the-Loop (HITL)
- Human makes every decision; AI provides decision support only
- Required for: lethal autonomous weapons, high-consequence targeting, legal detention decisions
- Risk: automation bias — humans may defer to AI recommendation even when review is nominal

### Human-on-the-Loop (HOTL)
- AI operates autonomously within defined parameters; human monitors and can intervene
- Used for: autonomous surveillance, cyber defense, logistics optimization
- Requirements: intervention capability must be timely, reliable, and not discouraged by system design

### Human-out-of-the-Loop
- Fully autonomous operation; no human in decision cycle
- DoD Directive 3000.09 restricts autonomous lethal force — requires Secretary of Defense waiver
- Acceptable for: non-lethal tasks with well-defined parameters and low consequence of error

## Key Design Requirements for Human-Machine Teaming

### Meaningful Human Control
- Operators must understand AI capability and limitations before relying on it
- Override capability must be technically reliable and organizationally sanctioned
- System design must not create conditions that make override impractical under operational tempo

### Operator Training
- Training on AI system capabilities, limitations, and known failure modes
- Simulation of AI failure scenarios so operators maintain skills for manual operation
- Training on automation bias and when to question AI recommendations

### Interface Design
- AI confidence levels must be displayed, not just recommendations
- Uncertainty and ambiguity must be surfaced, not suppressed
- Escalation paths to human review must be clear and low-friction

## Relevant Policy
- DoD Directive 3000.09 — Autonomous Weapons Systems (updated 2023)
- CJCS AI Principles for the Joint Force (2022)
- DoD RAI Strategy (2022)`,
  },
  {
    id: 'DOD-RAI-8',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 8: Security and Resilience',
    category: 'RAI Toolkit',
    content: `# DoD Responsible AI Toolkit — Practice 8: Security and Resilience

## Overview
Defense AI systems face adversarial threats beyond standard cybersecurity. Adversaries actively develop adversarial ML capabilities to compromise DoD AI systems. Practice 8 addresses these ML-specific security requirements on top of standard NIST SP 800-53 and RMF controls.

## Threat Model for Defense AI

### ML-Specific Threats
- **Training data poisoning** — adversary corrupts data inputs to degrade model performance or introduce backdoors
- **Adversarial evasion** — adversary crafts inputs to defeat ML-based threat detection, object recognition, or decision support
- **Model extraction** — adversary reverse-engineers DoD AI models through API queries
- **Inference attack** — adversary infers classified information from model behavior

### Supply Chain Threats
- Pre-trained models from commercial vendors may contain backdoors
- Open-source ML frameworks may contain malicious code
- Cloud ML services introduce data sovereignty and exfiltration risks

## Security Requirements for Defense AI

### Data Security
- Training data must be classified appropriately and protected at that classification level
- Data provenance must be documented and auditable
- Adversarial data injection must be detected through statistical monitoring of training pipelines

### Model Security
- Models must be tested against adversarial attacks before deployment
- Model weights must be protected at the classification level of the training data
- Model serving infrastructure must be isolated from untrusted networks

### Operational Security
- AI inference APIs must require authentication and authorization
- Query patterns must be monitored for adversarial probing
- AI system outputs must be treated as potentially manipulated in contested environments

## Integration with RMF
Defense AI systems must undergo standard Risk Management Framework (RMF) authorization. Additional AI-specific security controls (from NIST AI 100-1 and AI 100-2) should be incorporated into the System Security Plan (SSP) as supplemental controls.

## Red Team Requirements
- AI systems rated High or Critical must undergo adversarial ML red team assessment before ATO
- Red team must include both traditional cybersecurity and ML security expertise
- Re-assessment required after significant model updates`,
  },
  {
    id: 'DOD-RAI-9',
    title: 'DoD Responsible AI (RAI) Toolkit — Practice 9: Continuous Monitoring and Feedback',
    category: 'RAI Toolkit',
    content: `# DoD Responsible AI Toolkit — Practice 9: Continuous Monitoring and Feedback

## Overview
AI systems degrade over time due to data drift, distribution shift, and changing operational environments. Practice 9 establishes requirements for ongoing monitoring of DoD AI systems post-deployment, analogous to continuous monitoring requirements in the RMF.

## Monitoring Requirements

### Performance Monitoring
- Accuracy and reliability metrics must be tracked continuously in production
- Performance must be disaggregated by relevant operational conditions (environment, sensor type, adversary behavior)
- Anomaly detection must alert when performance falls below defined thresholds
- Metrics must be reported to mission owners on a defined schedule

### Fairness and Equity Monitoring
- Systems used in personnel decisions must monitor for disparate impact by demographic group
- Equity metrics must be reviewed at least annually and after significant operational changes
- Identified disparate impacts must trigger investigation and remediation

### Safety and Reliability Monitoring
- Near-miss incidents must be logged and reviewed
- System outputs must be sampled for human review on an ongoing basis
- Feedback channels must exist for operators to report unexpected AI behavior

### Data Drift Detection
- Statistical tests must detect when operational data distribution differs from training distribution
- Covariate shift detection should trigger re-evaluation of model performance
- Concept drift detection is required for systems operating in dynamic threat environments

## Feedback Loop Management
- Operator feedback must be systematically collected and incorporated into model improvement cycles
- Feedback must be protected against adversarial manipulation (e.g., an adversary deliberately providing misleading feedback to degrade the model)
- Human review of AI decisions must feed back into training data with appropriate quality controls

## Incident Response Integration
- AI performance anomalies must be integrated into standard incident reporting channels
- Significant AI failures must trigger incident response procedures
- AI-related incidents must be reported per DoD reporting requirements and applicable cybersecurity directives`,
  },
  {
    id: 'DOD-AI-STRATEGY-2023',
    title: 'DoD AI Strategy 2023 Update — Responsible AI at Scale',
    category: 'Strategy',
    content: `# DoD AI Strategy 2023 Update — Responsible AI at Scale

## Overview
The 2023 DoD AI Strategy update builds on the 2018 AI Strategy and 2020 AI Ethical Principles by focusing on scaling responsible AI from pilots to operational systems across the Department. The update reflects lessons learned from Chief Digital and AI Office (CDAO) operations and Joint Warfighting Cloud Capability (JWCC) deployment.

## Strategic Priorities

### 1. AI-Enabled Joint Warfighting
- Accelerate AI integration into Joint All-Domain Command and Control (JADC2)
- AI-enabled intelligence, surveillance, and reconnaissance (ISR) processing
- Logistics and sustainment optimization through AI
- AI-assisted cyber operations and cyber defense

### 2. Data as a Strategic Asset
- Implementing the DoD Data Strategy (2020) to make data AI-ready
- Data fabric architecture enabling AI access to authoritative data sources
- Synthetic data generation for training AI in classified domains
- Data rights management for AI training data derived from operational systems

### 3. Foundation Model Strategy
- DoD evaluation of large foundation models (LLMs, vision models) for government use
- CDAO AI Sandbox providing secure environment to evaluate commercial AI tools
- Requirements for on-premise or GovCloud deployment of foundation models handling CUI or classified data

### 4. Talent and Workforce
- AI/ML specialty occupational series in civilian workforce
- Military AI officer specialties and training pipelines
- Partnerships with universities and national labs for AI talent development

## CDAO Authorities and Responsibilities
- CDAO serves as principal staff assistant for AI to the Secretary of Defense
- CDAO manages the Advana data platform and AI portfolio
- Tradewind acquisition pathway for rapid AI procurement
- Joint Common Foundation (JCF) — shared ML development environment

## Responsible AI Governance Structure
- Responsible AI Working Council — cross-DoD coordination body
- Component RAI Champions — each Service and Combat Command has designated RAI lead
- AI Governance Board — reviews and approves high-risk AI use cases`,
  },
  {
    id: 'DOD-DODI-590002',
    title: 'DoD Instruction 5000.90 — AI Acquisition and Development Policy',
    category: 'Policy',
    content: `# DoD Instruction 5000.90 — AI Acquisition and Development Policy

## Overview
DoDI 5000.90, "Artificial Intelligence Acquisition and Deployment," establishes mandatory policies for how DoD acquires, develops, and deploys AI-enabled capabilities. It integrates AI considerations into existing acquisition policy frameworks (DoDI 5000.02, DoDI 5000.75).

## Scope
Applies to:
- All AI-enabled systems being acquired as Major Defense Acquisition Programs (MDAPs)
- AI systems acquired through rapid prototyping (OTA authorities)
- Software-intensive systems with embedded AI components
- Commercial AI tools procured for DoD use

## Key Requirements

### Pre-Acquisition
- **AI Use Case Registry** — all intended AI uses must be registered in the DoD AI Use Case Inventory before acquisition begins
- **Risk Tier Assessment** — use cases must be classified by risk level with appropriate oversight commensurate with risk
- **RAI Review** — Responsible AI review required before milestone approval for high-risk AI systems

### Development and Testing
- **Ethical Principles Integration** — system design must demonstrate how the five AI ethical principles are implemented
- **Bias and Fairness Testing** — required for AI systems that make or support decisions affecting personnel or operations
- **Adversarial ML Testing** — required for AI systems operating in contested environments
- **Explainability Requirements** — systems must provide explanations for consequential decisions commensurate with risk

### Deployment and Operations
- **Operational Test and Evaluation (OT&E)** — AI-specific test cases must be incorporated into OT&E plans
- **Monitoring Plan** — system must have documented plan for ongoing performance monitoring
- **Incident Reporting** — AI-related incidents must be reported through established channels

### Contractor Requirements
- Prime contractors responsible for RAI compliance of AI subcomponents
- Model cards required for all AI components in delivered systems
- Data governance documentation required for all training datasets
- Right-to-audit provisions must be included in all AI contracts`,
  },
  {
    id: 'DOD-AI-GOVERNANCE',
    title: 'DoD AI Governance Framework — Oversight, Review, and Risk Management',
    category: 'Governance',
    content: `# DoD AI Governance Framework — Oversight, Review, and Risk Management

## Overview
DoD AI governance is implemented through a layered structure from the Office of the Secretary of Defense through Military Departments and Combat Commands. The governance framework operationalizes the AI Ethical Principles through review processes, accountability structures, and risk management requirements.

## Governance Layers

### OSD Level
- **CDAO** — Chief Digital and AI Office; principal DoD AI authority
- **Responsible AI Working Council** — cross-DoD coordination; chaired by CDAO
- **AI Governance Board** — reviews and approves high-risk AI use cases; co-chaired by USD(R&E) and USD(P&R)

### Component Level
- Each Military Department and Combat Command designates a Component RAI Champion
- Components maintain their own AI use case inventories aligned with DoD inventory
- Component AI governance boards review and approve component-level AI systems

### Program Level
- Program Manager (PM) owns RAI compliance for their AI-enabled system
- PM designates AI Test and Evaluation (T&E) lead
- PM maintains system-level AI risk register

## High-Risk AI Use Case Review Process
1. Program submits AI use case to DoD AI Use Case Inventory
2. CDAO risk tiers the use case (Tier 1 = highest risk)
3. Tier 1 and 2 use cases undergo AI Governance Board review
4. Board approves with conditions, requests additional information, or rejects
5. Approved use cases proceed through standard acquisition milestone review
6. Post-deployment monitoring reports submitted to CDAO quarterly

## Risk Tiers
| Tier | Risk Level | Examples | Review Required |
|---|---|---|---|
| 1 | Critical | Lethal autonomous systems, major personnel decisions at scale | AI Governance Board + SecDef waiver (lethal) |
| 2 | High | ISR analysis, cyber threat detection, logistics optimization | AI Governance Board review |
| 3 | Moderate | Administrative AI, internal productivity tools | Component-level review |
| 4 | Low | Spell check, auto-formatting, simple automation | Standard acquisition |

## Accountability Requirements
- Human accountability for all AI-enabled decisions with significant consequences
- Decision logs retained per applicable records retention schedule
- Appeals processes for adverse AI-assisted decisions affecting personnel`,
  },
  {
    id: 'DOD-AI-AUTONOMOUS-WEAPONS',
    title: 'DoD Directive 3000.09 — Autonomous Weapons Systems Policy',
    category: 'Policy',
    content: `# DoD Directive 3000.09 — Autonomous Weapons Systems Policy

## Overview
DoD Directive 3000.09, "Autonomous Weapons Systems," governs the development, testing, fielding, and use of autonomous and semi-autonomous weapons. Updated in 2023, it reflects increased AI capability while maintaining the core requirement for appropriate human judgment in the use of force.

## Key Definitions
- **Autonomous Weapons System (AWS)** — weapon system that selects and engages targets without further human input after activation
- **Semi-Autonomous Weapons System** — weapon system intended to only engage targets selected by a human operator
- **Human-supervised autonomous weapons** — autonomous system with a human able to monitor operations and intervene

## Core Policy Requirements

### Human Judgment in Use of Force
- DoD AWS must be designed to allow commanders and operators to exercise appropriate levels of human judgment over use of force
- Fully autonomous lethal force requires Secretary of Defense approval through a senior-level review
- System design must ensure ability to deactivate if system demonstrates unintended behavior

### Design Requirements
- AWS must function within the bounds of IHL (International Humanitarian Law)
- Fail-safe modes must prevent unintended engagements
- System must be capable of being deactivated by personnel
- Human-machine interfaces must ensure operators understand system status and can intervene

### Testing and Certification
- AWS must complete developmental and operational testing before deployment
- Testing must include adversarial scenarios — adversary attempts to cause unintended target selection
- Systems must be certified by appropriate authorities before fielding

### Prohibition
- The development or deployment of AWS that would allow targeting and engagement of humans without meaningful human control is prohibited except with SecDef-level waiver

## International Law Compliance
- AWS must be capable of complying with Law of Armed Conflict (LOAC)/IHL
- System must distinguish between combatants and civilians
- Must apply principle of proportionality — collateral damage assessment
- Must allow for precautionary measures before engagement`,
  },
  {
    id: 'DOD-AI-WARGAMING',
    title: 'DoD AI Integration — Wargaming, Simulation, and Experimentation',
    category: 'Operations',
    content: `# DoD AI Integration — Wargaming, Simulation, and Artificial Intelligence

## Overview
DoD uses wargaming, simulation, and experimentation to test AI systems before operational deployment and to explore AI-enabled warfighting concepts. This enables responsible integration of AI into defense operations while managing risk.

## AI in Wargaming and Simulation

### AI as Opposing Force (OPFOR)
- AI systems trained to simulate adversary behavior in wargames
- Enables testing of human-AI teaming concepts against realistic opposition
- AI OPFOR can adapt tactics in ways scripted OPFOR cannot, improving exercise realism

### AI-Enabled Wargame Analysis
- After-action review augmented by AI analysis of wargame data
- AI identifies patterns in outcomes across multiple runs not visible to human analysts
- Risk: AI analysis may anchor post-game learning; human judgment must validate AI findings

### Joint Warfighting Simulation
- JWFC (Joint Warfighting Center) integrating AI into joint simulation environments
- AI assists in logistics optimization during exercises — validates AI logistics models in low-stakes environment before operational use

## AI Experimentation Programs
- **CDAO AI Sandbox** — approved environment for testing commercial AI tools against DoD use cases
- **Project Convergence** — Army experimentation campaign testing AI-enabled sensor-to-shooter timelines
- **Project Overmatch** — Navy/Marine Corps experimentation with AI-enabled distributed maritime operations
- **CDAO Advanced Battle Management System (ABMS)** — Air Force AI-enabled C2 experimentation

## Responsible Experimentation Principles
- Experiments must have defined success criteria and failure containment plans
- AI systems should be tested against adversarial conditions, not just benign scenarios
- Lessons from experiments must feed back into AI development and policy
- Experiments on personnel selection or evaluation AI require IRB-equivalent ethical review

## Synthetic Data for AI Training in Defense
- Operational security constraints limit use of real operational data for AI training
- Synthetic data generation enables training without exposing sensitive operational patterns
- Fidelity requirements: synthetic data must be validated against real-world distributions
- Chain of custody requirements for synthetic data derived from classified sources`,
  },
  {
    id: 'DOD-AI-CYBER',
    title: 'DoD AI for Cyber Operations — Defensive and Offensive Applications',
    category: 'Cyber AI',
    content: `# DoD AI for Cyber Operations — Defensive and Offensive Applications

## Overview
AI is transforming DoD cyber operations across the full spectrum from vulnerability discovery to threat hunting to incident response. This document addresses responsible AI use in the cyber domain, consistent with DoD AI Ethical Principles and applicable law.

## Defensive Cyber AI Applications

### Threat Detection and Hunting
- **Anomaly detection** — ML models identify unusual network behavior patterns indicative of adversary activity
- **Malware classification** — AI classifies malicious code at speeds exceeding human analyst capacity
- **Phishing detection** — NLP models detect spear-phishing attempts targeting DoD personnel
- **Insider threat detection** — behavioral analytics identify anomalous user behavior patterns

### Vulnerability Management
- **Automated vulnerability scanning** — AI prioritizes vulnerabilities by exploitability and impact
- **AI-assisted patch management** — ML predicts which systems are likely targets and prioritizes patching
- **Automated penetration testing** — AI augments red team capacity by discovering attack paths autonomously

### Incident Response
- **Automated triage** — AI classifies and prioritizes security alerts; reduces alert fatigue
- **Forensic analysis** — AI accelerates log analysis and timeline reconstruction
- **Threat intelligence correlation** — AI correlates indicators of compromise across DoD systems

## Responsible AI Requirements in Cyber Operations

### Accountability
- All AI-assisted cyber actions must be attributable to a human decision-maker
- Automated response actions must be logged with sufficient detail for after-action review
- Escalation to human review required before any action with potential for significant collateral effects

### Legal Compliance
- AI-enabled offensive cyber operations must comply with applicable law including Title 10, Title 50, and international law
- Legal review required before AI systems are authorized for offensive cyber use
- Rules of Engagement (ROE) must be encoded into AI system parameters

### Operational Security
- AI models trained on threat intelligence must be protected at appropriate classification
- AI cyber tools must not be accessible to adversaries who could reverse-engineer detection logic
- Model update cadence must be managed to prevent adversary learning of detection capability`,
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
      .eq('abbreviation', 'DoD AI Ethics')
      .single();

    if (!framework) {
      return new Response(JSON.stringify({ error: 'DoD AI Ethics framework not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: sources } = await supabase.from('sources').select('id').eq('framework_id', framework.id).limit(1);
    const source = sources?.[0];
    if (!source) {
      return new Response(JSON.stringify({ error: 'DoD AI Ethics source not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let ingested = 0;

    for (const doc of DOCS) {
      await supabase.from('documents').delete()
        .eq('framework_id', framework.id)
        .eq('metadata->>control_id', doc.id);

      const { data: inserted, error } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: doc.title,
        document_type: 'control',
        url: 'https://www.ai.mil/docs/RAI_Toolkit.pdf',
        version: '2023',
        raw_content: doc.content,
        metadata: { control_id: doc.id, category: doc.category, document_level: 'detail' },
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
    }

    return new Response(
      JSON.stringify({ success: true, documents_ingested: ingested }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
