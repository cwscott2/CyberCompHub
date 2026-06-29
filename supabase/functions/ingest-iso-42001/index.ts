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

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  if (!response.ok) throw new Error(`Embedding failed: ${response.statusText}`);
  const data = await response.json();
  return data.data[0].embedding;
}

async function insertChunk(documentId: string, content: string, metadata: Record<string, unknown>) {
  const embedding = await generateEmbedding(content);
  const { error } = await supabase.from('document_chunks').insert({
    document_id: documentId,
    chunk_index: 0,
    content,
    metadata,
    embedding,
  });
  if (error) console.error('Chunk insert error:', error.message);
}

// ISO/IEC 42001:2023 — Artificial Intelligence Management System (AIMS)
// Published December 2023. First international standard for AI management systems.
// Descriptions are abstracted summaries; no verbatim ISO text reproduced.
// Source: https://www.iso.org/standard/81230.html

const ISO42001_CLAUSES = [
  {
    id: 'Clause 4',
    name: 'Context of the Organization',
    description: 'Organizations deploying or developing AI systems must understand the internal and external factors that shape their AI activities. This includes the organization\'s role in the AI value chain — whether it acts as a developer, provider, or deployer of AI — and the characteristics of the AI systems it operates. The organization must identify its interested parties, including those who are affected by AI system outputs but may not be direct customers. The scope of the AI management system must be defined based on these factors, and organizations must understand the complex interdependencies that exist between AI systems, the data they use, the humans who operate them, and the environments in which they are deployed. Context analysis should specifically consider AI-related factors such as the maturity of the AI technology used, the availability of explainability tools, the potential for bias in training data, and the regulatory landscape for AI in the relevant sector and geography.',
  },
  {
    id: 'Clause 5',
    name: 'Leadership',
    description: 'Top management must demonstrate committed and visible leadership in the governance of AI. This goes beyond endorsing an AI policy — leadership must actively foster an organizational culture where responsible AI is a genuine priority, where concerns about AI system behavior can be raised without fear, and where decisions about AI deployment are guided by ethical considerations alongside commercial ones. Leaders must ensure that AI management responsibilities are assigned clearly, that conflicting objectives between AI performance and responsible AI principles are resolved at the appropriate level, and that the resources needed for responsible AI — including time for AI impact assessment, access to diverse human oversight, and investment in explainability tooling — are actually allocated. Top management must also own the organization\'s AI policy, which should articulate the organization\'s principles for responsible AI development, deployment, and governance.',
  },
  {
    id: 'Clause 6',
    name: 'Planning',
    description: 'Organizations must plan their AI management activities systematically, including identifying risks and opportunities arising from AI systems. Risk planning for AI must account for a broader range of potential harms than traditional information security risk assessment — including harms to third parties who are subject to AI-assisted decisions, environmental harms from energy-intensive AI workloads, and societal harms from the aggregate effect of AI systems at scale. The organization must set AI objectives that reflect its responsible AI principles and are measurable, time-bound, and resourced. Planning must address how the organization will handle the inherent uncertainty of AI system behavior, including the possibility of emergent behaviors not observed during testing, distributional shift after deployment, and the limitations of current explainability techniques. A Statement of Applicability should document which Annex A controls are applicable to the organization\'s AI activities and the basis for any exclusions.',
  },
  {
    id: 'Clause 7',
    name: 'Support',
    description: 'The AI management system must be supported by the resources, competencies, awareness programs, communication channels, and documented information that enable it to function effectively. Competency requirements for AI are multidisciplinary — including AI/ML engineering skills, data governance expertise, ethics and fairness assessment capability, legal and regulatory knowledge, and domain expertise in the fields where AI is applied. Organizations must ensure that staff involved in AI development, deployment, operation, and oversight have the competencies their roles require, and that training programs reflect the rapidly evolving nature of AI technology and AI governance. Documentation requirements for an AIMS include AI policies, AI system specifications, records of AI impact assessments, training data governance records, and evidence of human oversight activities. Communication must address how the organization engages with affected communities and individuals about its AI activities.',
  },
  {
    id: 'Clause 8',
    name: 'Operation',
    description: 'Organizations must implement, control, and continually improve the operational processes that govern AI throughout its lifecycle. Operational processes must cover the full AI lifecycle from inception through decommissioning: identification of the intended use case and affected stakeholders, data acquisition and governance, model design and development, testing and validation, deployment and ongoing monitoring, and responsible retirement. For each AI system, operational processes must address how the system will be monitored post-deployment for performance degradation and emergent bias, how human oversight will be exercised over AI outputs in consequential decisions, how affected individuals can seek redress if they believe an AI decision has harmed them, and what will happen to the AI system and its data when it is retired. Operational planning must also address supply chain considerations, including how the organization manages risks from third-party AI components, pre-trained models, and AI-as-a-service platforms.',
  },
  {
    id: 'Clause 9',
    name: 'Performance Evaluation',
    description: 'The effectiveness of the AI management system and the performance of AI systems themselves must be measured, monitored, and reviewed. Performance evaluation for AI is complex because AI systems can behave differently from what testing indicated once deployed in real-world conditions, and because the dimensions of trustworthy AI — accuracy, fairness, robustness, explainability, and safety — each require different measurement approaches. Organizations must define what they will measure, when and how measurements will be taken, who will analyze and act on results, and how measurement findings will be reported to management. Internal audits of the AIMS must evaluate conformity with ISO 42001 requirements and the effectiveness of the management system in achieving responsible AI outcomes. Management reviews must assess whether the AI management system remains appropriate and effective given changes in the organization\'s AI activities, the technology landscape, and the regulatory environment.',
  },
  {
    id: 'Clause 10',
    name: 'Improvement',
    description: 'The AI management system must continually improve. This requires a systematic approach to identifying opportunities for improvement — from incident analysis, performance monitoring results, audit findings, stakeholder feedback, and evolving best practices — and acting on them. Nonconformities, when they occur, must be addressed through investigation of root causes and corrective action, and the effectiveness of corrective actions must be verified. Continual improvement in the AI context is especially important because AI technology evolves rapidly, creating new capabilities and new risks faster than most management systems are designed to accommodate. Organizations must build adaptive capacity into their AIMS so that governance keeps pace with the AI systems it governs, rather than lagging behind in ways that create governance gaps.',
  },
];

const ISO42001_ANNEX_A = [
  {
    id: 'A.2',
    name: 'Policies Related to AI',
    theme: 'AI Governance',
    controls: [
      { id: 'A.2.2', name: 'Responsible use policy for AI', description: 'The organization should establish and maintain a policy governing the responsible development and use of AI systems. The policy should reflect the organization\'s values and ethical principles, define what AI uses are acceptable and unacceptable, address how AI should be used in interactions with external parties, and establish accountability for compliance. The policy should be communicated to all personnel involved in AI activities and reviewed regularly to reflect changes in the organization\'s AI portfolio and the external environment.' },
      { id: 'A.2.3', name: 'Policy specific to AI system category', description: 'Where the organization operates AI systems in particularly sensitive domains — such as healthcare, law enforcement, financial services, hiring, or credit assessment — it should establish policies specific to those domains that address the heightened risks and applicable regulatory requirements. Domain-specific policies should reflect sector-specific ethical norms, professional standards, and the particular harms that AI can cause in high-stakes decision-making contexts.' },
    ],
  },
  {
    id: 'A.3',
    name: 'Internal Organization',
    theme: 'AI Governance',
    controls: [
      { id: 'A.3.2', name: 'Roles and responsibilities for AI', description: 'The organization should define and assign clear roles and responsibilities for AI development, deployment, operation, and oversight. Roles should cover the full AI lifecycle, including data governance, model development, safety testing, impact assessment, ongoing monitoring, incident response, and decommissioning. For each AI system, there should be a clearly identified responsible party who is accountable for the system\'s compliance with organizational AI policies and applicable regulations.' },
      { id: 'A.3.3', name: 'Reporting of concerns regarding AI systems', description: 'The organization should establish mechanisms through which personnel and external parties can report concerns about AI system behavior, ethical violations, or potential harms without fear of retaliation. Effective reporting channels enable the organization to identify and address problems early. Reports must be taken seriously, investigated promptly, and findings communicated back to those who raised concerns.' },
    ],
  },
  {
    id: 'A.4',
    name: 'Resources for AI Systems',
    theme: 'AI Governance',
    controls: [
      { id: 'A.4.2', name: 'AI system life cycle resource management', description: 'Resources required to operate and maintain AI systems throughout their lifecycle — including computational infrastructure, data management capabilities, human oversight capacity, and the expertise needed to monitor and update models — should be identified, planned, and provisioned. Resource planning must account for the ongoing nature of AI system maintenance: models require monitoring, retraining, and updating to remain accurate and fair as the data distribution they operate on evolves.' },
      { id: 'A.4.3', name: 'Management of AI system data', description: 'The data used to train, validate, test, and operate AI systems must be managed with rigor. Data management practices should address the provenance of training data (where it came from and whether its use is legally authorized), data quality (accuracy, completeness, representativeness), data governance (who can access what data and for what purpose), data security (protection of sensitive training data from unauthorized access), and the retention and disposal of data when it is no longer needed.' },
      { id: 'A.4.4', name: 'Management of AI system tools and infrastructure', description: 'The tools, libraries, frameworks, and infrastructure used to develop and operate AI systems should be managed in a controlled manner. This includes maintaining an inventory of AI development tools and their versions, ensuring that tools with known vulnerabilities are patched or replaced, and that the infrastructure on which AI systems operate is appropriately secured and monitored.' },
    ],
  },
  {
    id: 'A.5',
    name: 'AI Risk Assessment and Treatment',
    theme: 'Risk Management',
    controls: [
      { id: 'A.5.2', name: 'AI risk assessment process', description: 'The organization should establish a systematic process for identifying, analyzing, and evaluating risks associated with AI systems. AI risk assessment must go beyond the organization\'s own operational risk to consider harms to individuals affected by AI outputs, discriminatory outcomes, safety risks, privacy violations, and societal impacts. The assessment process should be applied at key points in the AI lifecycle: before deployment, after significant model updates, when the deployment context changes, and on a periodic basis to detect emerging risks.' },
      { id: 'A.5.3', name: 'AI risk treatment process', description: 'Identified AI risks must be treated through a structured process that selects appropriate responses — avoidance, reduction, transfer, or acceptance — based on the organization\'s risk criteria. Risk treatment plans should specify the controls to be implemented, the resources required, responsibilities, and timelines. For AI systems that present significant risks, risk treatment should include mandatory controls such as human oversight of AI decisions, explainability requirements, fairness testing, and robust incident response procedures.' },
    ],
  },
  {
    id: 'A.6',
    name: 'AI System Impact Assessment',
    theme: 'Impact Assessment',
    controls: [
      { id: 'A.6.1', name: 'Assessing impacts of AI systems', description: 'Before deploying an AI system and periodically thereafter, the organization should assess the potential positive and negative impacts of the system on individuals, groups, communities, and society. Impact assessment for AI must specifically evaluate: the populations who may be affected by AI outputs (including those who are not direct users), the potential for discriminatory or unfair outcomes across different demographic groups, privacy implications of the data the AI system processes or generates as inferences, safety implications if the AI system produces harmful outputs, and cumulative or systemic effects when many instances of the AI system operate across society. The depth and rigor of the impact assessment should be proportionate to the potential severity and breadth of the harms.' },
      { id: 'A.6.2', name: 'Assessment of societal impacts', description: 'For AI systems with broad deployment or significant potential for societal influence — such as recommendation systems, content moderation systems, or AI used in public services — the organization should assess how the system may affect social dynamics, democratic processes, public discourse, and the distribution of opportunities across society. Societal impact assessment may require engagement with external experts, affected communities, and civil society organizations whose perspectives the organization would not naturally access through its normal business activities.' },
    ],
  },
  {
    id: 'A.7',
    name: 'AI System Lifecycle',
    theme: 'AI Lifecycle',
    controls: [
      { id: 'A.7.2', name: 'AI system design', description: 'AI systems should be designed with trustworthiness objectives built in from the outset, not bolted on after the fact. Design decisions should reflect the intended use case, the characteristics of the affected population, the data available, and the risk tolerance. Design documentation should capture the intended inputs and outputs, the performance objectives, the fairness constraints, the explainability requirements, and the human oversight mechanisms that will govern the system\'s operation. Design reviews should include perspectives from domain experts, ethics advisors, and representatives of affected communities.' },
      { id: 'A.7.3', name: 'AI system data management', description: 'Data management activities specific to the AI system — including data collection, labeling, augmentation, splitting into training/validation/test sets, and ongoing data refresh — should be governed by documented procedures. Training data should be evaluated for representativeness, historical bias, and accuracy before use. Data used to evaluate model fairness must include adequate representation of all demographic groups relevant to the AI system\'s impact. Records of data management decisions should be retained to support auditability.' },
      { id: 'A.7.4', name: 'AI system testing', description: 'AI systems should be subjected to rigorous testing before deployment and after significant changes. Testing should cover functional performance (does the system achieve its intended purpose?), fairness (does it produce equitable outcomes across demographic groups?), robustness (does it behave safely under unusual or adversarial inputs?), safety (does it avoid producing outputs that could cause harm?), and security (is it resistant to adversarial attacks?). Testing should be conducted by personnel independent of those who developed the model and should use test data that is representative of the deployment population.' },
      { id: 'A.7.5', name: 'AI system documentation', description: 'AI systems should be documented in a way that enables appropriate oversight, audit, and accountability. Documentation should cover the AI system\'s intended use, technical description of the model architecture, training data description and provenance, testing methodology and results, known limitations and failure modes, fairness assessment results, and the human oversight mechanisms in place. Documentation should be maintained up to date as the system evolves and should be accessible to those with oversight responsibilities.' },
      { id: 'A.7.6', name: 'Deployment of AI systems', description: 'The process for deploying an AI system into production should include formal approval based on the results of testing, impact assessment, and risk treatment. Deployment should be preceded by preparation of operational monitoring procedures, escalation paths for anomalous behavior, and user documentation or training as appropriate. For high-risk AI systems, phased deployment — starting with a limited population or in a constrained context — enables the organization to observe real-world performance before full-scale deployment.' },
    ],
  },
  {
    id: 'A.8',
    name: 'Data Governance for AI',
    theme: 'Data Governance',
    controls: [
      { id: 'A.8.2', name: 'Data acquisition for AI systems', description: 'The acquisition of data for use in AI systems should be conducted in a manner that is legally authorized, ethically appropriate, and documented. The organization should verify that it has the right to use data for AI training and evaluation purposes, that data subjects have been appropriately informed where consent is required, that data has been obtained from reputable sources, and that the terms of data use are understood and respected. Data acquisition practices should specifically evaluate whether the data represents the full diversity of the population the AI system will affect.' },
      { id: 'A.8.3', name: 'Data quality for AI systems', description: 'Training and evaluation data must be of sufficient quality to support the AI system\'s intended function. Data quality for AI specifically requires attention to representativeness (does the data adequately represent the population and scenarios the AI will encounter?), accuracy (are the labels and ground truth values correct?), completeness (are there systematic gaps in the data that could cause the AI to perform poorly for certain groups or scenarios?), and timeliness (is the data recent enough to reflect current patterns?). Data quality assessments should be documented and repeated when data is refreshed.' },
      { id: 'A.8.4', name: 'Data provenance and lineage', description: 'The organization should maintain records of where AI training and evaluation data came from, how it was transformed, and how it flows through the AI development process. Provenance records enable the organization to respond to questions about data use, demonstrate compliance with data rights and licensing terms, investigate the source of errors or bias discovered after deployment, and remove or retrain models when it is determined that data used in training was obtained improperly or contains errors.' },
    ],
  },
  {
    id: 'A.9',
    name: 'Responsible Use of AI',
    theme: 'Responsible AI',
    controls: [
      { id: 'A.9.3', name: 'Addressing bias in AI systems', description: 'The organization should systematically identify potential sources of bias in AI systems — including bias in training data, bias introduced by model architecture choices, and bias that emerges from the deployment context — and implement measures to detect, measure, and mitigate bias throughout the AI lifecycle. Bias mitigation activities should consider both statistical fairness metrics (e.g., equal error rates across groups) and substantive fairness concerns (e.g., whether the AI system reinforces or exacerbates existing structural inequalities). Trade-offs between different fairness criteria should be made explicit and documented.' },
      { id: 'A.9.4', name: 'Explainability and interpretability of AI systems', description: 'Where affected individuals or oversight bodies need to understand the basis for AI system outputs — particularly where AI assists in decisions that affect rights, access to services, or material outcomes — the organization should implement mechanisms to explain AI outputs in terms that are meaningful to the relevant audience. Explainability requirements should be defined based on the deployment context: a medical diagnosis AI may require clinical explanations; a credit scoring AI may require explanations in plain language. The organization should be honest about the limits of current explainability techniques and should not represent AI outputs as more interpretable than they actually are.' },
      { id: 'A.9.5', name: 'Safety of AI systems', description: 'AI systems should be designed, tested, and operated to avoid causing harm. Safety analysis should identify the ways in which the AI system could produce outputs that lead to physical, psychological, financial, or social harm, and should implement controls to prevent or minimize those outcomes. For AI systems in safety-critical domains — autonomous vehicles, medical devices, industrial control systems, public safety applications — safety engineering methods appropriate to the domain should be applied. Safety monitoring after deployment should be capable of detecting safety-relevant anomalies and triggering rapid response.' },
      { id: 'A.9.6', name: 'Privacy protection in AI systems', description: 'AI systems frequently process personal data and can infer sensitive information about individuals from data that appears non-sensitive. Privacy protections for AI should address the full range of privacy risks: collection of more personal data than necessary for the AI\'s intended function, retention of personal data longer than necessary, re-identification of individuals from AI training data, inference of sensitive attributes (health, sexuality, political views) from observable inputs, and creation of detailed profiles that individuals did not consent to. Privacy-by-design principles should be applied to AI system architecture, and privacy impact assessments should be integrated with AI impact assessments.' },
    ],
  },
  {
    id: 'A.10',
    name: 'Third-Party and Supplier Relationships',
    theme: 'Supply Chain',
    controls: [
      { id: 'A.10.2', name: 'Responsibilities in the AI supply chain', description: 'When the organization uses AI components, pre-trained models, or AI services from third parties, it must understand and manage the risks those supply chain elements introduce. The organization cannot transfer its responsibility for responsible AI to suppliers; it remains accountable for the behavior of AI systems it deploys regardless of which components were developed by third parties. Supplier contracts should address the information and assurances the organization needs to fulfill its own responsible AI obligations, including access to model cards, dataset documentation, fairness evaluation results, and security assessments.' },
      { id: 'A.10.5', name: 'Due diligence on AI suppliers', description: 'Before selecting an AI supplier or adopting a third-party AI component, the organization should conduct due diligence to assess the supplier\'s responsible AI practices. Due diligence should evaluate the supplier\'s approach to data governance, fairness testing, safety evaluation, transparency, and incident response. For high-risk AI components, due diligence may include requesting independent audit results, reviewing model cards and system cards, or requiring contractual representations about specific responsible AI practices.' },
    ],
  },
  {
    id: 'A.11',
    name: 'Human Oversight of AI Systems',
    theme: 'Human Oversight',
    controls: [
      { id: 'A.11.1', name: 'Human oversight of AI system decisions', description: 'Where AI systems assist in making consequential decisions about individuals — including decisions affecting access to services, rights, employment, credit, education, housing, or healthcare — appropriate human oversight should be maintained. Human oversight means that qualified humans review AI outputs before they are acted upon, that humans have the authority and capability to override AI recommendations, and that the humans exercising oversight actually exercise meaningful judgment rather than rubber-stamping AI outputs. The design of human oversight should account for automation bias — the tendency of humans to over-rely on AI recommendations even when their own judgment would indicate a different conclusion.' },
      { id: 'A.11.2', name: 'AI system output monitoring', description: 'AI system outputs should be monitored on an ongoing basis to detect performance degradation, emergent bias, unexpected outputs, and other anomalies. Monitoring should be continuous for high-risk AI systems and periodic for lower-risk applications. Monitoring should cover both technical performance metrics and real-world impact indicators — including feedback from users and affected individuals, patterns in AI-assisted decisions, and signals of harm from downstream outcomes. Monitoring findings should trigger review and, where necessary, model updates, additional safety measures, or suspension of the AI system.' },
      { id: 'A.11.3', name: 'Processes for human intervention in AI systems', description: 'The organization should define and implement processes for human intervention when AI system behavior warrants it. Intervention processes should address: who has the authority to override or suspend an AI system, under what conditions intervention is required versus optional, how interventions are documented and reviewed, and how AI systems are modified or updated in response to patterns of intervention. For high-risk AI systems, the ability to intervene — including shutting down the system — must be technically feasible and organizationally established, not merely theoretical.' },
    ],
  },
  {
    id: 'A.12',
    name: 'Transparency of AI Systems',
    theme: 'Transparency',
    controls: [
      { id: 'A.12.1', name: 'Disclosure to users about AI systems', description: 'Users of AI systems and individuals affected by AI-assisted decisions should be informed, in appropriate and accessible terms, that AI is being used, what the AI system does, and what the limitations of the AI system are. Disclosure obligations vary by context and jurisdiction — some laws require explicit disclosure that a decision was made using AI; others require disclosure of the general use of AI in a process. Organizations should disclose more than the legal minimum where greater transparency supports informed consent, appropriate use, and public trust.' },
      { id: 'A.12.2', name: 'Transparency of AI system operation', description: 'Internal transparency — meaning that those responsible for overseeing, auditing, and governing AI systems can understand how they work — is a prerequisite for effective oversight. The organization should maintain documentation, model cards, system cards, and other artifacts that enable appropriate internal parties to understand AI system design, training data, performance characteristics, known limitations, and failure modes. Where AI systems use techniques that are inherently opaque (such as large neural networks), the organization should invest in explainability tools and adopt interpretable-by-design approaches where the risk profile of the AI system warrants them.' },
    ],
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { data: framework, error: frameworkError } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'ISO 42001')
      .single();

    if (frameworkError || !framework) {
      return new Response(
        JSON.stringify({ error: 'ISO 42001 framework not found in compliance_frameworks table' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find or create source record
    let source: { id: string } | null = null;
    const { data: existingSource } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', framework.id)
      .maybeSingle();

    if (existingSource) {
      source = existingSource;
    } else {
      const { data: newSource } = await supabase
        .from('sources')
        .insert({
          framework_id: framework.id,
          name: 'ISO/IEC 42001:2023 Artificial Intelligence Management System',
          url: 'https://www.iso.org/standard/81230.html',
          source_type: 'pdf',
          scraper_type: 'generic-pdf',
          is_active: true,
        })
        .select('id')
        .single();
      source = newSource;
    }

    if (!source) {
      return new Response(
        JSON.stringify({ error: 'Failed to find or create ISO 42001 source' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: job } = await supabase
      .from('ingest_jobs')
      .insert({ source_id: source.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();

    let documentsIngested = 0;

    // Ingest mandatory clauses (4–10)
    for (const clause of ISO42001_CLAUSES) {
      const clauseContent = `# ISO/IEC 42001:2023 — ${clause.id}: ${clause.name}\n\nFramework: ISO/IEC 42001:2023 Artificial Intelligence Management System\nSection: ${clause.id} — ${clause.name}\n\n## Overview\n${clause.description}\n\n## Relevance to AIMS\nThis clause is a mandatory requirement of ISO/IEC 42001:2023. Organizations seeking AIMS certification must demonstrate conformity with all clauses 4 through 10. Clause requirements establish the foundational management system structure within which AI-specific Annex A controls operate. An effective AIMS requires both the management system discipline of the clauses and the AI-specific practices of Annex A.`;

      const clauseMeta = { clause_id: clause.id, clause_name: clause.name, section_type: 'mandatory_clause', version: '2023' };

      const { data: clauseDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `ISO 42001:2023 — ${clause.id}: ${clause.name}`,
        document_type: 'framework',
        url: 'https://www.iso.org/standard/81230.html',
        version: '2023',
        raw_content: clauseContent,
        metadata: clauseMeta,
        is_indexed: true,
      }).select('id').single();

      if (clauseDoc) await insertChunk(clauseDoc.id, clauseContent, clauseMeta);
      documentsIngested++;
    }

    // Ingest Annex A control groups and individual controls
    for (const group of ISO42001_ANNEX_A) {
      // Group-level document
      const groupContent = `# ISO/IEC 42001:2023 Annex A — ${group.id}: ${group.name}\n\nFramework: ISO/IEC 42001:2023\nAnnex A Group: ${group.name} (${group.id})\nTheme: ${group.theme}\nControl Count: ${group.controls.length}\n\nThis Annex A group covers ${group.name} within the ISO/IEC 42001:2023 AI Management System standard. Organizations must evaluate each control for applicability to their AI activities and document their decisions in a Statement of Applicability.\n\n## Controls in this Group\n${group.controls.map(c => `- **${c.id}** — ${c.name}: ${c.description.slice(0, 120)}...`).join('\n')}`;

      const groupMeta = { group_id: group.id, group_name: group.name, theme: group.theme, section_type: 'annex_a_group', version: '2023' };

      const { data: groupDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `ISO 42001:2023 Annex A — ${group.id}: ${group.name}`,
        document_type: 'framework',
        url: 'https://www.iso.org/standard/81230.html',
        version: '2023',
        raw_content: groupContent,
        metadata: groupMeta,
        is_indexed: true,
      }).select('id').single();

      if (groupDoc) await insertChunk(groupDoc.id, groupContent, groupMeta);
      documentsIngested++;

      // Individual controls
      for (const control of group.controls) {
        const controlContent = `# ${control.id} — ${control.name}\n\n## Framework\nISO/IEC 42001:2023 Artificial Intelligence Management System\n\n## Annex A Group\n${group.id} — ${group.name}\n\n## Theme\n${group.theme}\n\n## Control Objective\n${control.description}\n\n## Implementation Guidance\nOrganizations should assess whether this control is applicable to their AI activities, the specific AI systems they operate, and the contexts in which those systems are deployed. Where applicable, evidence of implementation may include documented policies, AI impact assessment records, fairness testing results, human oversight logs, training records, and supplier due diligence documentation. The Statement of Applicability must record whether this control is applicable and, if applicable, whether it is implemented.\n\n## AI Management System Context\n- Controls in ISO 42001 Annex A are specifically designed for the unique characteristics of AI systems\n- AI-specific risks — including emergent behavior, bias, opacity, and rapid performance degradation — require AI-specific governance measures beyond what standard information security management addresses\n- This control should be read alongside relevant clauses 4–10 which establish the management system infrastructure within which Annex A controls operate\n- Organizations using both ISO 27001 and ISO 42001 can integrate their management systems, sharing governance infrastructure while applying AI-specific controls where AI systems create distinct risks`;

        const controlMeta = {
          control_id: control.id,
          control_name: control.name,
          group_id: group.id,
          group_name: group.name,
          theme: group.theme,
          section_type: 'annex_a_control',
          version: '2023',
        };

        const { data: controlDoc } = await supabase.from('documents').insert({
          source_id: source.id,
          framework_id: framework.id,
          title: `${control.id} — ${control.name}`,
          document_type: 'control',
          url: 'https://www.iso.org/standard/81230.html',
          version: '2023',
          raw_content: controlContent,
          metadata: controlMeta,
          is_indexed: true,
        }).select('id').single();

        if (controlDoc) await insertChunk(controlDoc.id, controlContent, controlMeta);
        documentsIngested++;
      }
    }

    if (job) {
      await supabase.from('ingest_jobs').update({
        status: 'completed',
        documents_ingested: documentsIngested,
        completed_at: new Date().toISOString(),
      }).eq('id', job.id);
    }

    return new Response(
      JSON.stringify({ success: true, documents_ingested: documentsIngested, message: 'ISO/IEC 42001:2023 ingested successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('ISO 42001 ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
