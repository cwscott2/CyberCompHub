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

interface Framework {
  abbreviation: string;
  name: string;
  description: string;
  version: string;
  url: string;
  docs: { id: string; title: string; content: string }[];
}

const FRAMEWORKS: Framework[] = [
  // ── Singapore ─────────────────────────────────────────────────────────────
  {
    abbreviation: 'Singapore MAIGF',
    name: 'Singapore Model AI Governance Framework',
    description: 'Singapore PDPC Model AI Governance Framework — practical, risk-based AI governance guidance widely adopted across APAC, aligned to OECD AI Principles',
    version: '2nd Edition (2020)',
    url: 'https://www.pdpc.gov.sg/help-and-resources/2020/01/model-ai-governance-framework',
    docs: [
      {
        id: 'SG-MAIGF-OVERVIEW',
        title: 'Singapore Model AI Governance Framework — Overview and Scope',
        content: `# Singapore Model AI Governance Framework — Overview and Scope

## Background
Singapore's Personal Data Protection Commission (PDPC) published the Model AI Governance Framework (MAIGF) in 2019, with a second edition in 2020. It is one of the most widely adopted voluntary AI governance frameworks in the Asia-Pacific region.

## Purpose
The framework provides organizations with detailed and readily implementable guidance on how to deploy AI responsibly. It covers four areas: internal governance, determining AI decision-making model, operations management, and stakeholder interaction.

## Scope
- Applies to AI systems used in commercial decision-making contexts
- Particularly focused on AI that makes or supports decisions affecting individuals
- Not legally binding but widely adopted as industry standard in APAC
- Maps to OECD AI Principles and NIST AI RMF

## Four Key Areas
1. **Internal Governance Structures and Measures** — organizational accountability for AI
2. **Determining the Level of Human Involvement in AI-Augmented Decision-Making** — risk-proportionate human oversight
3. **Operations Management** — data governance, model testing, incident management
4. **Stakeholder Interaction and Communication** — transparency with customers and regulators

## Risk-Based Approach
The framework uses a risk matrix based on:
- Probability of AI decision error
- Severity of impact of errors on individuals

Higher risk = more human oversight required. This mirrors the EU AI Act's risk-tier approach but was published earlier and is more operationally focused.`,
      },
      {
        id: 'SG-MAIGF-GOVERNANCE',
        title: 'Singapore MAIGF — Internal Governance and Accountability',
        content: `# Singapore MAIGF — Internal Governance and Accountability

## Area 1: Internal Governance Structures and Measures

### Organizational Accountability
Organizations should appoint senior management accountable for AI governance. Responsibilities include:
- Setting AI ethics policy aligned with company values
- Allocating resources for AI risk management
- Ensuring AI decisions are subject to appropriate review processes
- Reporting AI incidents to regulators where required

### Roles and Responsibilities
| Role | Responsibility |
|---|---|
| Board/Senior Management | AI ethics policy, risk appetite, accountability |
| Data/AI Governance Team | Framework implementation, standards, training |
| AI/ML Engineers | Model development per ethical guidelines |
| Legal and Compliance | Regulatory requirements, data protection |
| Business Units | Use case identification, operational deployment |
| Risk/Audit | Independent review of AI risk management |

### Risk Assessment
Organizations should conduct AI-specific risk assessments covering:
- Data quality and representativeness risks
- Model performance and reliability risks
- Fairness and discrimination risks
- Privacy and security risks
- Operational and reputational risks

### Minimum Measures
- Establish documented AI ethics principles
- Implement model lifecycle management (development → testing → deployment → monitoring → decommission)
- Conduct bias and fairness assessments before deployment
- Maintain audit trail for AI-assisted decisions affecting individuals`,
      },
      {
        id: 'SG-MAIGF-OPERATIONS',
        title: 'Singapore MAIGF — Operations Management and Data Governance',
        content: `# Singapore MAIGF — Operations Management and Data Governance

## Area 3: Operations Management

### Data Governance for AI
- **Data quality** — training data must be representative of the population the model will serve
- **Data provenance** — document sources, collection methods, and any transformations applied
- **Data protection** — comply with Singapore PDPA (Personal Data Protection Act) for personal data in training
- **Data minimization** — use only data necessary for the intended AI purpose

### Model Development Standards
- Document model architecture, training approach, and design choices
- Conduct bias testing across relevant demographic groups before deployment
- Validate model performance on held-out test sets that reflect operational distribution
- Document model limitations and failure modes in model card equivalent

### Testing Before Deployment
- Functional testing — model performs intended task accurately
- Robustness testing — model performs reliably across expected input variations
- Adversarial testing — model handles adversarial inputs without catastrophic failure
- User acceptance testing — representative end users validate model in realistic conditions

### Incident Management
- Define AI-specific incident categories (model failure, data breach, discriminatory output, etc.)
- Establish escalation path from model monitoring to incident response
- Conduct post-incident reviews with lessons learned documented
- Report incidents to regulators where required by sector-specific regulation (MAS, MOH, etc.)

### Monitoring in Production
- Track model performance metrics on production data continuously
- Alert on significant degradation from baseline performance
- Schedule periodic model revalidation — at least annually or after significant operational changes
- Maintain feedback channel for affected individuals to report concerns about AI decisions`,
      },
    ],
  },

  // ── UNESCO ────────────────────────────────────────────────────────────────
  {
    abbreviation: 'UNESCO AI Ethics',
    name: 'UNESCO Recommendation on the Ethics of Artificial Intelligence',
    description: 'UNESCO Recommendation on AI Ethics (2021) — first global normative framework on AI ethics, adopted by all 193 UNESCO member states; covers human rights, sustainability, peace, and inclusion',
    version: '2021',
    url: 'https://www.unesco.org/en/artificial-intelligence/recommendation-ethics',
    docs: [
      {
        id: 'UNESCO-AI-OVERVIEW',
        title: 'UNESCO AI Ethics Recommendation — Overview and Core Values',
        content: `# UNESCO AI Ethics Recommendation — Overview and Core Values

## Background
The UNESCO Recommendation on the Ethics of Artificial Intelligence was adopted by the 193 Member States at UNESCO's General Conference in November 2021. It is the first global normative instrument on AI ethics and the broadest in scope of any AI governance framework.

## Core Values (11 Values)
1. **Respect, protection and promotion of human rights and fundamental freedoms**
2. **Environment and ecosystem flourishing** — AI must not harm planetary boundaries
3. **Diversity and inclusiveness** — AI must accommodate cultural, social, and linguistic diversity
4. **Living in peaceful, just and interconnected societies** — AI must promote peace, not enable conflict
5. **Respect for human dignity** — AI must not be used to demean or dehumanize
6. **Protection of personal data and privacy**
7. **Multi-stakeholder and adaptive governance**
8. **Responsibility and accountability** — human accountability for all AI decisions
9. **Transparency and explainability**
10. **Fairness and non-discrimination**
11. **Human oversight and determination**

## Key Principles
- **Proportionality and Do No Harm** — AI capabilities must be proportionate to legitimate purpose; potential harms must be avoided
- **Safety and Security** — AI systems must be safe and secure throughout their lifecycle
- **Right to Privacy** — privacy must be protected throughout AI lifecycle
- **Multi-stakeholder and Adaptive Governance** — governance must involve civil society, affected communities, and technical experts

## Unique Aspects vs. Other Frameworks
- Only framework explicitly covering environmental sustainability of AI (energy consumption, e-waste)
- Explicitly addresses AI in contexts of armed conflict and peace
- Covers cultural heritage and indigenous knowledge protection
- Addresses access to AI benefits as a matter of global justice`,
      },
      {
        id: 'UNESCO-AI-POLICY-AREAS',
        title: 'UNESCO AI Ethics — Policy Action Areas and Implementation',
        content: `# UNESCO AI Ethics — Policy Action Areas and Implementation

## 11 Policy Action Areas

### 1. Ethics Impact Assessment
Member States should require ethics impact assessments for high-risk AI systems. Assessments should identify potential harms to individuals, communities, society, and the environment before deployment.

### 2. Ethics Governance and Stewardship
- Designate national AI ethics bodies with regulatory authority
- Establish independent oversight mechanisms
- Ensure international cooperation on AI governance

### 3. Data Policy
- Implement data protection frameworks aligned with AI-specific requirements
- Establish principles for data sharing while protecting privacy
- Address cross-border data flows for AI training

### 4. Development and International Cooperation
- Bridge the AI divide between developed and developing nations
- Transfer AI capabilities to low and middle income countries
- Support capacity building in AI ethics for all Member States

### 5. Environment and Ecosystems
- Assess and mitigate the carbon footprint of large AI model training
- Consider biodiversity and ecosystem impacts of AI-enabled industries
- Promote AI applications for climate action and environmental monitoring

### 6. Gender
- Collect and publish gender-disaggregated data on AI workforce and impacts
- Mandate gender balance in AI development teams and governance bodies
- Assess gender bias in AI systems before deployment

### 7. Culture
- Protect cultural diversity and heritage from AI homogenization
- Support development of AI systems in minority and indigenous languages
- Address intellectual property rights for AI-generated creative works

### 8. Education and Research
- Integrate AI ethics into education at all levels
- Support interdisciplinary AI ethics research
- Promote open science in AI development

### 9. Communication and Information
- Combat AI-enabled disinformation and synthetic media manipulation
- Promote AI literacy for journalists and media professionals
- Establish provenance standards for AI-generated content

### 10. Economy and Labour
- Assess AI impacts on employment and support workforce transitions
- Ensure workers' rights are protected in AI-augmented workplaces
- Address algorithmic management and worker surveillance

### 11. Health and Social Wellbeing
- Ensure AI in healthcare maintains human dignity and informed consent
- Address AI impacts on mental health, particularly for youth
- Guarantee equitable access to AI-enabled health services`,
      },
    ],
  },

  // ── UK AISI ───────────────────────────────────────────────────────────────
  {
    abbreviation: 'UK AISI',
    name: 'UK AI Safety Institute Framework',
    description: 'UK AI Safety Institute (AISI) framework for evaluating frontier AI model safety — focused on catastrophic and societal risks from advanced AI systems; established 2023',
    version: '2023-2024',
    url: 'https://www.gov.uk/government/organisations/ai-safety-institute',
    docs: [
      {
        id: 'UK-AISI-OVERVIEW',
        title: 'UK AI Safety Institute — Mission, Scope, and Evaluation Framework',
        content: `# UK AI Safety Institute — Mission, Scope, and Evaluation Framework

## Background
The UK AI Safety Institute (AISI) was established in November 2023 following the Bletchley Park AI Safety Summit. It is the world's first state-backed organization focused specifically on evaluating the safety of advanced AI systems, particularly frontier models from major AI developers.

## Mission
To advance the safe and beneficial development of AI by conducting evaluations of frontier AI models, developing safety methodologies, and sharing findings internationally.

## Scope: Frontier AI Safety
The AISI focuses specifically on risks from the most capable AI systems — "frontier models" — rather than the full spectrum of AI governance. Key risk categories:

### Catastrophic Risks
- **Weapons of mass destruction** — can the model provide meaningful uplift to those seeking to develop biological, chemical, nuclear, or radiological weapons?
- **Cyberweapons** — can the model generate functional cyberattack code or assist in major cyberattacks?
- **Critical infrastructure attacks** — can the model assist in attacking power grids, water systems, or financial systems?

### Societal Risks
- **Mass manipulation** — AI-enabled influence operations at unprecedented scale
- **Automated deception** — AI systems that deceive users about their nature or capabilities
- **Labor displacement at scale** — AI automation causing rapid, disruptive labor market changes

### AI Control and Alignment Risks
- **Goal misalignment** — AI systems pursuing goals not intended by developers
- **Deceptive alignment** — AI systems that behave safely during testing but differently in deployment
- **Rapid capability gains** — AI systems that become significantly more capable than anticipated

## Evaluation Approach
The AISI conducts pre-deployment evaluations of frontier models with voluntary cooperation of major AI developers (OpenAI, Google DeepMind, Anthropic, Meta). Evaluations test:
- Dangerous capability uplift (CBRN, cyber)
- Propensity for deceptive behavior
- Robustness of safety training to red teaming

## International Cooperation
- AI Safety Institutes established in US, UK, EU, Japan, France, and others following Bletchley Declaration
- Information sharing protocols between national AI Safety Institutes
- Joint evaluation of frontier models before major releases`,
      },
      {
        id: 'UK-AISI-EVALUATIONS',
        title: 'UK AI Safety Institute — Evaluation Methodology and Red Teaming',
        content: `# UK AI Safety Institute — Evaluation Methodology and Red Teaming

## Evaluation Framework

### Pre-Deployment Evaluation Protocol
1. **Capability Assessment** — measure model performance on standardized capability benchmarks
2. **Dangerous Capability Evaluation** — structured red team assessment for uplift on catastrophic risk domains
3. **Safety Property Testing** — assess robustness of safety training against adversarial elicitation
4. **Behavioral Assessment** — evaluate propensity for deception, manipulation, or misaligned behavior
5. **Findings Report** — summary shared with developer; decision on public disclosure of findings

### Dangerous Capability Domains (UK AISI Evaluation Suite)
| Domain | What Is Evaluated | Example Test |
|---|---|---|
| CBRN Uplift | Does model provide meaningful assistance to bad actors seeking WMD? | Structured elicitation by domain experts with and without system prompts |
| Cyber | Can model generate functional exploit code or assist APT-level attacks? | Structured CTF-style challenges requiring novel vulnerability discovery |
| Persuasion/Manipulation | Does model exceed human baseline at psychological manipulation? | Controlled experiments measuring persuasive effectiveness |
| Autonomy | Can model complete complex multi-step tasks without human input? | Autonomous agent tasks requiring planning, tool use, resource acquisition |
| Deception | Does model attempt to deceive evaluators about capabilities or intentions? | Behavioral probes in varied contexts |

### Red Teaming Methodology
- **Expert elicitation** — domain experts (biosecurity, cybersecurity, nuclear) attempt to extract dangerous information
- **Automated red teaming** — AI-assisted generation of adversarial prompts at scale
- **Agentic red teaming** — testing AI agents with tool access for dangerous autonomous behavior
- **Transfer testing** — do safety bypasses identified in lab transfer to deployed API?

### Evaluation Limitations
- Evaluations are snapshots — models may be updated after evaluation
- Coverage is inherently incomplete — cannot test all possible dangerous uses
- Uplift is difficult to measure precisely — counterfactual (what could adversary do without AI?) is hard to establish
- Models may behave differently when aware they are being evaluated (evaluation gaming)

## Policy Thresholds
AISI is developing "capability thresholds" — specific measured capability levels that should trigger additional safety requirements before deployment. These are analogous to regulatory approval thresholds in pharmaceuticals or aviation safety.`,
      },
    ],
  },

  // ── G7 Hiroshima ─────────────────────────────────────────────────────────
  {
    abbreviation: 'G7 Hiroshima AI',
    name: 'G7 Hiroshima AI Process — International Code of Conduct for AI',
    description: 'G7 Hiroshima AI Process (2023) — 11 guiding principles and voluntary code of conduct for advanced AI developers; adopted by G7 leaders, open to non-G7 adherence',
    version: '2023',
    url: 'https://www.meti.go.jp/press/2023/10/20231030002/20231030002.html',
    docs: [
      {
        id: 'G7-HIROSHIMA-PRINCIPLES',
        title: 'G7 Hiroshima AI Process — 11 Guiding Principles',
        content: `# G7 Hiroshima AI Process — 11 Guiding Principles for Advanced AI

## Background
The G7 Hiroshima AI Process was launched at the May 2023 G7 Summit in Japan. In October 2023, G7 leaders endorsed 11 Guiding Principles and an International Code of Conduct for organizations developing advanced AI systems. The process is open to non-G7 countries and organizations.

## The 11 Guiding Principles

### 1. Take Appropriate Measures Throughout the AI Lifecycle
Advanced AI system developers should take appropriate measures to identify, evaluate, and mitigate risks throughout the AI lifecycle — development, deployment, and operation.

### 2. Identify and Mitigate Vulnerabilities
Developers should identify and mitigate risks, including those that may arise from malicious use, misuse, and unintended consequences. Security testing (including adversarial red teaming) should occur before deployment.

### 3. Publicly Report Capabilities, Limitations, and Domains of Appropriate and Inappropriate Use
Developers should publish documentation (model cards, system cards, or equivalent) covering: intended use cases, known limitations, domains where the system should not be used, and potential risks.

### 4. Work Toward Responsible Information Sharing and Reporting of Incidents
Developers should share safety-relevant information with governments, academic researchers, and the broader AI community. AI-related incidents should be reported through appropriate channels.

### 5. Invest in and Implement Robust Security Controls
Developers should protect advanced AI model weights, architectures, and training data from unauthorized access and theft. This includes physical security, cybersecurity, and insider threat programs.

### 6. Research and Invest in Robust Safety Systems
Developers should invest in interpretability, watermarking, content provenance, privacy-preserving ML, and other technical safety capabilities.

### 7. Develop and Deploy Reliable Technical Safety Mechanisms
Developers should implement content safety filtering, system-level safeguards, red teaming, and other mechanisms to prevent generation of harmful content.

### 8. Prioritize Research on Societal Risks
Developers should conduct and support research on AI's societal impacts including labor displacement, disinformation, and concentration of economic power.

### 9. Prioritize the Development of International Technical Standards
Developers should participate in standards bodies (ISO/IEC, NIST, IEEE) to develop interoperable, risk-based AI safety standards.

### 10. Implement Appropriate Data Input Measures and Protections
Developers should implement data governance covering provenance, quality, consent, intellectual property rights, and personal data protection.

### 11. Advance the Development of Explainability Tools
Developers should invest in and implement interpretability and explainability tools appropriate to the context of deployment.

## Relationship to Other Frameworks
| Framework | Relationship |
|---|---|
| EU AI Act | G7 principles complement but are voluntary vs. mandatory |
| NIST AI RMF | G7 principles align closely; NIST RMF provides implementation detail |
| UNESCO AI Ethics | G7 principles are narrower in scope (advanced AI developers only) |
| Bletchley Declaration | G7 process operates in parallel; both focused on frontier AI safety |`,
      },
    ],
  },

  // ── Canada AIDA ───────────────────────────────────────────────────────────
  {
    abbreviation: 'Canada AIDA',
    name: 'Canada Artificial Intelligence and Data Act (AIDA)',
    description: 'Canada AIDA — proposed legislation (Bill C-27, 2022) creating mandatory requirements for high-impact AI systems; risk-tier approach similar to EU AI Act; applies to Canadian and international AI providers operating in Canada',
    version: 'Bill C-27 (2022, as proposed)',
    url: 'https://ised-isde.canada.ca/site/innovation-better-canada/en/artificial-intelligence-and-data-act',
    docs: [
      {
        id: 'CANADA-AIDA-OVERVIEW',
        title: 'Canada AIDA — Scope, Risk Tiers, and Obligations',
        content: `# Canada Artificial Intelligence and Data Act (AIDA) — Overview

## Background
Canada's AIDA is Part 3 of Bill C-27, the Digital Charter Implementation Act, introduced in June 2022. It represents Canada's primary legislative approach to AI regulation, creating mandatory requirements for "high-impact AI systems." As of 2024, AIDA is still working through Parliament.

## Scope
- Applies to persons regulated under federal jurisdiction who design, develop, make available, or manage the operation of AI systems
- Covers AI systems used in commercial activity in Canada
- Applies to international organizations offering AI-enabled services to Canadians

## Risk Tiers

### High-Impact AI Systems (Regulated)
AIDA focuses on "high-impact" AI — defined by Minister of Innovation, Science and Industry regulations to include:
- AI in employment decisions (hiring, promotion, termination)
- AI in financial services (credit, insurance)
- AI in health care
- AI in criminal justice and law enforcement
- AI affecting safety-critical infrastructure

### General AI (Market-Driven)
Lower-risk AI is not subject to AIDA mandatory requirements but remains subject to existing laws (privacy, consumer protection, human rights).

## Key Obligations for High-Impact AI

### Risk Assessment
Organizations must conduct and document assessments of risks of harm or biased output before deploying high-impact AI.

### Risk Mitigation
Organizations must implement measures to mitigate identified risks proportionate to the assessed risk level.

### Plain Language Explanation
Organizations must be able to provide plain-language explanations of how high-impact AI makes decisions affecting individuals.

### Record Keeping
Organizations must maintain records of:
- Risk assessments
- Mitigation measures
- Incidents involving the AI system
- Monitoring results

### Incident Reporting
Organizations must report to the Minister when a high-impact AI system causes or risks causing serious harm.

## Enforcement
- Designated AI and Data Commissioner
- Administrative monetary penalties up to 3% of global revenues for non-compliance
- Criminal penalties up to $25M or 5% of global revenues for the most serious violations

## Key Differences from EU AI Act
| Dimension | AIDA | EU AI Act |
|---|---|---|
| Status | Proposed legislation | Enacted (2024) |
| Risk definition | Ministerial regulations define "high-impact" | Prescriptive list in legislation |
| Coverage | Federal jurisdiction only | All EU market |
| Foundation models | Not addressed in AIDA | Specific GPAI provisions |`,
      },
    ],
  },

  // ── China GenAI ───────────────────────────────────────────────────────────
  {
    abbreviation: 'China GenAI Reg',
    name: 'China Generative AI Regulation',
    description: 'China Interim Measures for the Management of Generative AI Services (2023) — mandatory regulations for generative AI services offered in China; content controls, security assessments, and algorithmic transparency requirements',
    version: '2023 (effective August 15, 2023)',
    url: 'https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm',
    docs: [
      {
        id: 'CHINA-GENAI-OVERVIEW',
        title: 'China Generative AI Regulation — Requirements and Compliance Obligations',
        content: `# China Interim Measures for the Management of Generative AI Services (2023)

## Background
China's Cyberspace Administration of China (CAC) issued the Interim Measures for the Management of Generative AI Services, effective August 15, 2023. These are the world's first comprehensive regulations specifically targeting generative AI services. They apply to any GenAI service provided to the public within China.

## Scope
- Applies to organizations providing generative AI services to the public in China
- Covers text, image, audio, video, and code generation
- Applies to both domestic and foreign providers offering services to Chinese users
- Does not apply to GenAI used internally within an organization (not offered to public)

## Key Requirements

### Content Compliance
GenAI outputs must not:
- Subvert the socialist system or state power
- Endanger national unity or social stability
- Promote terrorism, extremism, or ethnic hatred
- Spread disinformation or false information
- Contain pornographic or obscene content
- Violate others' legitimate rights

Providers must implement mechanisms to prevent generation of prohibited content.

### Training Data Requirements
- Training data must come from lawful sources
- Intellectual property rights of data must be respected
- Personal data must be processed in compliance with China's Personal Information Protection Law (PIPL)
- Data used must be accurate — providers must label false or inaccurate training data

### Security Assessment
Providers of GenAI services with "public opinion attributes" or "social mobilization capabilities" must:
1. Conduct security assessments before public launch
2. File algorithm registration with CAC
3. Obtain approval before launch if service reaches prescribed scale thresholds

### User Protections
- Providers must clearly disclose to users that content is AI-generated
- Providers must not generate content targeted at specific individuals without consent
- Users must verify their identity with real-name registration

### Labeling Requirements
- AI-generated content must be labeled as such
- Providers must implement technical measures to mark content provenance

## Enforcement
- CAC and relevant authorities enforce compliance
- Penalties include service suspension, revocation of licenses, and fines
- Significant overlap with existing Cybersecurity Law and PIPL enforcement

## Implications for Non-Chinese Companies
- Foreign providers serving Chinese users must comply or block access
- Significant restrictions on what content AI can generate limits utility for Chinese deployment
- Data localization requirements may affect cross-border AI service architecture`,
      },
    ],
  },

  // ── Japan METI ────────────────────────────────────────────────────────────
  {
    abbreviation: 'Japan METI AI',
    name: 'Japan METI AI Governance Guidelines',
    description: 'Japan METI AI Governance Guidelines (2022, 2023 update) — voluntary, human-centric AI governance framework; OECD-aligned; emphasizes agile governance and industry self-regulation',
    version: 'Ver. 1.1 (2022)',
    url: 'https://www.meti.go.jp/press/2022/04/20220419001/20220419001.html',
    docs: [
      {
        id: 'JAPAN-METI-OVERVIEW',
        title: 'Japan METI AI Governance Guidelines — Human-Centric AI Framework',
        content: `# Japan METI AI Governance Guidelines — Human-Centric AI

## Background
Japan's Ministry of Economy, Trade and Industry (METI) published the AI Governance Guidelines Ver. 1.1 in April 2022, building on Japan's 2019 Social Principles of Human-Centric AI. Japan takes a voluntary, industry self-regulation approach rather than prescriptive legislation.

## Japan's AI Governance Philosophy
Japan's approach is characterized by:
- **Agile governance** — flexible, iterative regulation that can adapt to rapid AI development
- **Human-centric AI** — AI must serve human flourishing, not replace human judgment in consequential decisions
- **International harmonization** — alignment with OECD AI Principles and G7 processes
- **Industry-led** — preference for voluntary guidelines over mandatory regulation (contrast with EU)
- **Privacy by design** — integration of privacy protection from the outset

## AI Governance Guidelines Structure

### Target Organizations
The guidelines address three types of organizations:
1. **AI developers** — organizations building AI systems
2. **AI providers** — organizations deploying AI services
3. **AI users (businesses)** — organizations using AI in their operations

Each has different responsibilities in the AI value chain.

### Core Governance Principles
1. **Safety** — AI must not harm human life, health, or property
2. **Fairness** — AI must not discriminate unfairly
3. **Privacy** — AI must respect personal data
4. **Security** — AI must be protected from unauthorized access and manipulation
5. **Transparency** — AI decision-making must be explainable
6. **Accountability** — humans must be accountable for AI impacts
7. **Innovation and Education** — AI governance should enable, not stifle, innovation

### Risk-Based Approach
METI guidelines use a "risk scenario" approach:
- Identify foreseeable harms from AI system use
- Assess probability and severity of each scenario
- Implement controls proportionate to assessed risk
- Document risk management approach

## Practical Implementation Guidance

### For AI Developers
- Implement quality management throughout model development
- Document model performance, limitations, and intended use
- Test for bias and fairness before release
- Provide technical documentation enabling providers to implement governance

### For AI Providers (Deployers)
- Conduct pre-deployment risk assessment for each use case
- Implement monitoring to detect performance degradation
- Establish feedback mechanisms for affected users
- Maintain incident response capability

### For AI Users (Businesses)
- Select AI tools appropriate for the risk level of intended use
- Train staff on AI capabilities and limitations
- Implement oversight commensurate with decision consequences
- Establish escalation path when AI recommendations are uncertain

## Japan's International Role
Japan chairs the OECD AI Policy Observatory and led development of the G7 Hiroshima AI Process. Japan positions itself as a bridge between the EU's regulatory approach and the US's innovation-first approach.`,
      },
    ],
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
    const url = new URL(req.url);
    const filterAbbr = url.searchParams.get('framework');

    const frameworks = filterAbbr
      ? FRAMEWORKS.filter(f => f.abbreviation === filterAbbr)
      : FRAMEWORKS;

    let totalIngested = 0;
    const results: Record<string, number> = {};

    for (const fw of frameworks) {
      // Upsert framework record
      const { data: existing } = await supabase
        .from('compliance_frameworks')
        .select('id')
        .eq('abbreviation', fw.abbreviation)
        .limit(1);

      let frameworkId: string;

      if (existing && existing.length > 0) {
        frameworkId = existing[0].id;
      } else {
        const { data: created, error: fwErr } = await supabase
          .from('compliance_frameworks')
          .insert({
            name: fw.name,
            abbreviation: fw.abbreviation,
            category: 'ai-safety',
            description: fw.description,
            version: fw.version,
          })
          .select('id')
          .single();

        if (fwErr || !created) {
          console.error(`Failed to create framework ${fw.abbreviation}:`, fwErr?.message);
          continue;
        }
        frameworkId = created.id;
      }

      // Upsert source record
      const { data: existingSrc } = await supabase
        .from('sources')
        .select('id')
        .eq('framework_id', frameworkId)
        .limit(1);

      let sourceId: string;

      if (existingSrc && existingSrc.length > 0) {
        sourceId = existingSrc[0].id;
      } else {
        const { data: src, error: srcErr } = await supabase
          .from('sources')
          .insert({
            framework_id: frameworkId,
            name: fw.name,
            url: fw.url,
            source_type: 'webpage',
            scraper_type: 'generic-webpage',
          })
          .select('id')
          .single();

        if (srcErr || !src) {
          console.error(`Failed to create source for ${fw.abbreviation}:`, srcErr?.message);
          continue;
        }
        sourceId = src.id;
      }

      // Ingest documents
      let fwIngested = 0;
      for (const doc of fw.docs) {
        await supabase.from('documents').delete()
          .eq('framework_id', frameworkId)
          .eq('metadata->>control_id', doc.id);

        const { data: inserted, error } = await supabase.from('documents').insert({
          source_id: sourceId,
          framework_id: frameworkId,
          title: doc.title,
          document_type: 'control',
          url: fw.url,
          version: fw.version,
          raw_content: doc.content,
          metadata: { control_id: doc.id, framework: fw.abbreviation, document_level: 'detail' },
          is_indexed: true,
        }).select('id').single();

        if (error || !inserted) { console.error(`Failed: ${doc.id}`, error?.message); continue; }

        const embedding = await generateEmbedding(doc.content);
        await supabase.from('document_chunks').insert({
          document_id: inserted.id,
          chunk_index: 0,
          content: doc.content,
          metadata: { control_id: doc.id, framework: fw.abbreviation },
          embedding,
        });

        fwIngested++;
      }

      results[fw.abbreviation] = fwIngested;
      totalIngested += fwIngested;
      console.log(`${fw.abbreviation}: ${fwIngested} docs`);
    }

    return new Response(
      JSON.stringify({ success: true, total_ingested: totalIngested, by_framework: results }),
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
