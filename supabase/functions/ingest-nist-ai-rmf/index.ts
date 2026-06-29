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

// NIST AI Risk Management Framework (AI RMF 1.0)
// Published January 2023. Source: https://airc.nist.gov/Home
// Covers 4 core functions: GOVERN, MAP, MEASURE, MANAGE
// AI trustworthiness dimensions: accuracy, explainability, interpretability, reliability,
// robustness, safety, security, resilience, accountability, transparency, fairness, bias mitigation, privacy.

const NIST_AI_RMF_FUNCTIONS = [
  {
    id: 'GOVERN',
    name: 'GOVERN',
    overview: 'The GOVERN function establishes the organizational context, policies, processes, and accountability structures needed to enable responsible AI risk management across the enterprise. GOVERN activities cut across all other AI RMF core functions and are meant to be foundational — without governance, the MAP, MEASURE, and MANAGE functions lack organizational authority, resourcing, and direction. GOVERN activities promote a culture of risk awareness and responsibility, embedding AI risk management into enterprise-wide governance structures rather than treating it as a siloed technical exercise. Organizations should establish leadership accountability for AI risk, ensure that policies are clear and enforced, and foster cross-functional collaboration between technology, legal, ethics, compliance, and business teams. AI trustworthiness dimensions addressed include accountability, transparency, and fairness.',
    subcategories: [
      { id: 'GOVERN 1.1', description: 'Policies, processes, procedures, and practices across the organization related to the mapping, measuring, and managing of AI risks are in place, transparent, and implemented effectively. Organizations should document their approach to AI risk management, ensure that policies are reviewed and updated regularly, and confirm that personnel responsible for AI systems are aware of and apply those policies in their work.' },
      { id: 'GOVERN 1.2', description: 'The characteristics of trustworthy AI are integrated into organizational policies, processes, and procedures. Trustworthy AI characteristics — including accuracy, fairness, explainability, privacy, robustness, safety, and security — should be explicitly referenced in governance documents so they shape how AI systems are designed, evaluated, and deployed, not merely how they are discussed.' },
      { id: 'GOVERN 1.3', description: 'Processes and procedures are in place to determine the needed level of risk management activities based on the organization\'s risk tolerance. Organizations must be able to calibrate the depth and rigor of AI risk management activities to the risk profile of each AI system, allocating more intensive oversight to high-stakes or high-impact deployments.' },
      { id: 'GOVERN 1.4', description: 'Organizational teams are committed to a culture that considers and communicates AI risk. A genuine culture of risk awareness means that concerns about AI system behavior can be raised without fear, that AI risk is discussed openly across functions, and that leadership models the behaviors it expects from staff with respect to responsible AI development and deployment.' },
      { id: 'GOVERN 1.5', description: 'Organizational risk and legal counsel understand the organization\'s current and historical use of AI systems and their risks. Legal, risk, and compliance functions must be adequately informed about the AI systems the organization operates so they can assess legal exposure, identify applicable regulations, and advise on risk mitigation before problems occur.' },
      { id: 'GOVERN 1.6', description: 'Policies and procedures are in place to address AI risks and benefits across the organization, including risks that arise from AI designed by other entities. Organizations must consider not only the AI systems they build but also third-party AI components, foundation models, APIs, and AI-enabled products they procure or integrate, assessing and managing risks from all of these sources.' },
      { id: 'GOVERN 1.7', description: 'Processes and procedures are in place for decommissioning and phasing out AI systems safely and in a manner that does not increase risks or decrease the organization\'s trustworthiness. End-of-life management for AI systems should address how models are retired, how decisions made by retired systems are handled, and how stakeholders who relied on those systems are transitioned.' },
      { id: 'GOVERN 2.1', description: 'Roles and responsibilities and lines of communication related to mapping, measuring, and managing AI risks are documented and are clear to individuals and teams throughout the organization. Ambiguity about who is responsible for AI risk management creates gaps that adversaries and failure modes can exploit. Clear accountability structures reduce those gaps.' },
      { id: 'GOVERN 2.2', description: 'The organization\'s personnel and partners receive AI risk management training to enable them to perform their duties and responsibilities consistent with related policies, procedures, and agreements. Training should be role-appropriate — developers need different AI risk training than executives or end-users — and should be updated as AI capabilities and risk landscapes evolve.' },
      { id: 'GOVERN 3.1', description: 'Decision-making related to mapping, measuring, and managing AI risks includes perspectives from diverse teams with the necessary domain expertise. Diverse teams — including people with different technical backgrounds, lived experiences, and domain knowledge — are better positioned to identify bias, anticipate harms, and develop effective mitigations than homogeneous groups.' },
      { id: 'GOVERN 3.2', description: 'Teams are committed to continuous improvement in risk management processes through the AI lifecycle. Continuous improvement recognizes that AI risk management is not a one-time exercise; risks evolve as models are updated, as the deployment context changes, and as new threats emerge. Organizations should have mechanisms for capturing lessons learned and applying them.' },
      { id: 'GOVERN 4.1', description: 'Organizational policies and practices are in place to foster a critical thinking and safety-first mindset in the design, development, deployment, and uses of AI systems among employees and other relevant stakeholders. Critical thinking means questioning assumptions about AI system behavior, anticipating failure modes, and designing for the possibility that AI systems will behave unexpectedly.' },
      { id: 'GOVERN 4.2', description: 'Organizational teams document the risks and potential impacts of AI technologies and make this information available to relevant stakeholders. Transparency about known risks supports informed decision-making by users, affected communities, regulators, and oversight bodies, and builds the institutional trust necessary for responsible AI deployment.' },
      { id: 'GOVERN 5.1', description: 'Organizational policies and practices are in place to collect, consider, prioritize, and integrate feedback from those external to the team that developed or deployed the AI system, including affected communities. Feedback loops with external stakeholders — including people who are affected by AI decisions but may not be involved in AI development — are essential for identifying harms and bias that internal teams may overlook.' },
      { id: 'GOVERN 5.2', description: 'Mechanisms are established to enable AI actors to raise concerns and report risks related to AI systems without fear of retaliation. Effective AI risk governance requires that concerns can flow upward freely; retaliation against people who raise legitimate concerns suppresses information that leadership needs to make sound risk decisions.' },
      { id: 'GOVERN 6.1', description: 'Policies and procedures are in place to address risks associated with AI systems and third-party entities, including risks that stem from entities in the AI supply chain. Third-party AI components introduce supply chain risks that may be difficult to evaluate; organizations need processes for assessing the trustworthiness of AI technologies they do not build themselves.' },
      { id: 'GOVERN 6.2', description: 'Contingency processes are in place to handle failures or limitations of AI systems acquired from third parties. Organizations must not assume that third-party AI systems will always function as expected; contingency plans should address what happens when a third-party AI system fails, produces harmful outputs, or becomes unavailable.' },
    ],
  },
  {
    id: 'MAP',
    name: 'MAP',
    overview: 'The MAP function provides structure and context for the identification and categorization of AI risks. Mapping involves identifying what AI systems the organization operates, understanding the contexts in which they are used, identifying affected stakeholders, and cataloging the categories of risk each system presents. Effective mapping requires understanding the AI system\'s intended purpose, its capabilities and limitations, the data it uses, the decisions it influences, and the populations it affects. MAP activities are prerequisite to measurement and management — it is not possible to manage risks that have not been identified. AI trustworthiness dimensions central to MAP include fairness, bias, explainability, and transparency; the MAP function specifically requires organizations to think about harms to third parties and affected communities, not just organizational risk.',
    subcategories: [
      { id: 'MAP 1.1', description: 'Context is established for the AI risk assessment. Organizations must document the intended purpose of each AI system, its operational context, the stakeholders affected by its outputs, and the legal and regulatory environment in which it operates. Context-setting grounds subsequent risk analysis in real-world conditions rather than abstract threat models.' },
      { id: 'MAP 1.5', description: 'Organizational risk tolerance for AI risks is established and documented, enabling AI risk management activities to be calibrated appropriately. Risk tolerance statements should articulate acceptable levels of risk for different categories of AI harm and should guide decisions about when AI deployment should be delayed or declined pending additional risk mitigation.' },
      { id: 'MAP 1.6', description: 'Risks or other undesired events, including harms to individuals or groups, are identified. The mapping process must explicitly consider harms beyond financial and reputational harm to the organization, including physical harms, psychological harms, discrimination, loss of privacy, and denial of opportunity to the individuals or communities who interact with or are affected by the AI system.' },
      { id: 'MAP 2.1', description: 'Scientific findings, engineering, and domain expertise inform AI system design decisions and risk assessments. AI risk mapping should draw on empirical evidence about how AI systems fail in practice, including published research on bias, adversarial attacks, distributional shift, and other failure modes, rather than relying solely on intuition or optimistic assumptions.' },
      { id: 'MAP 2.2', description: 'Scientific findings, user feedback, and real-world data are used to improve the AI system\'s risk assessments over time. Risk maps are not static; they should be updated as the organization learns more about how the AI system behaves in deployment, as the user population or use context evolves, and as the threat landscape changes.' },
      { id: 'MAP 2.3', description: 'AI system risks are categorized by source, likelihood, and impact. A structured taxonomy of AI risks — covering data quality, model behavior, deployment context, human-AI interaction, and societal impact — enables organizations to prioritize mitigation efforts and communicate risks clearly to non-technical stakeholders.' },
      { id: 'MAP 3.1', description: 'Potential benefits and costs of AI technologies, including those from third-party systems, are documented and analyzed. AI risk mapping is not exclusively about harms; organizations must also understand the anticipated benefits of AI deployment to make sound risk-benefit tradeoffs and to identify when risk mitigation measures might undermine the system\'s beneficial functions.' },
      { id: 'MAP 3.2', description: 'AI system impact and effects on individuals, groups, communities, organizations, and society are documented. Impacts may be direct (experienced by people who interact with the AI system) or indirect (experienced by people who are subject to decisions influenced by AI outputs). Both must be considered, particularly where AI is used in consequential decision-making affecting rights or access to services.' },
      { id: 'MAP 3.5', description: 'Risks to individuals and groups from AI-enabled products and services are identified, understood, and appropriately mitigated. Individual and group harms from AI systems may include inaccurate outputs that disadvantage specific populations, discriminatory patterns in AI-assisted decisions, and loss of privacy from AI-driven surveillance or profiling.' },
      { id: 'MAP 4.1', description: 'Risks associated with AI technologies are identified and categorized in the context of the organizational AI risk tolerance. Risk categorization should map identified risks to organizational risk categories, enabling consistent prioritization and escalation across different AI systems and business units.' },
      { id: 'MAP 5.1', description: 'Likelihood and magnitude of each identified impact are estimated. Risk estimation should consider the probability of the harm occurring, the severity of the harm if it does occur, the breadth of the population potentially affected, and the reversibility of the harm. Quantitative estimates should be used where data supports them; qualitative assessments should be rigorous and documented where they are not.' },
      { id: 'MAP 5.2', description: 'Practitioners explain or document map artifacts in accessible language so that relevant stakeholders understand and can act upon them. Risk documentation that is intelligible only to data scientists is of limited value for governance and oversight; risk maps should be communicated in ways that enable business leaders, legal counsel, and affected stakeholders to understand and engage with the findings.' },
    ],
  },
  {
    id: 'MEASURE',
    name: 'MEASURE',
    overview: 'The MEASURE function covers the analysis, assessment, benchmarking, and tracking of AI risks and impacts using quantitative and qualitative tools. Measurement provides the empirical foundation for risk management decisions. Without measurement, organizations cannot determine whether their AI systems are performing as intended, whether bias or reliability problems exist, or whether their risk mitigation measures are effective. MEASURE activities span the entire AI lifecycle — from design-time evaluation of data quality and model fairness, through operational monitoring of deployed system behavior, to evaluation of incidents and near-misses. AI trustworthiness dimensions central to MEASURE include accuracy, reliability, robustness, bias, fairness, explainability, interpretability, privacy, and security. Measurement approaches should be tailored to the specific risks identified in MAP and should be updated as the AI system and its context evolve.',
    subcategories: [
      { id: 'MEASURE 1.1', description: 'Approaches and metrics for measuring AI risk are identified and applied. Measurement approaches should be selected based on the AI system\'s risk profile and should cover both quantitative metrics (e.g., accuracy, error rates, fairness metrics) and qualitative indicators (e.g., user trust, stakeholder feedback, expert judgment). Metrics should be defined before deployment to avoid post-hoc rationalization.' },
      { id: 'MEASURE 1.3', description: 'Internal experts who did not develop or deploy the AI system perform evaluation. Independent evaluation reduces the risk of confirmation bias and the tendency of development teams to overlook risks they did not anticipate. Red-teaming, adversarial testing, and independent audit are examples of mechanisms for securing independent evaluation.' },
      { id: 'MEASURE 2.1', description: 'Test sets, metrics, and details about the external testing are documented. Documentation of evaluation methodology — including the composition of test sets, the metrics applied, the populations represented, and the conditions under which testing was conducted — is essential for assessing the validity of evaluation results and for repeating evaluations as the system evolves.' },
      { id: 'MEASURE 2.2', description: 'Evaluations involving human subjects are conducted in a manner that protects individual rights and is consistent with established ethical principles. AI evaluations that involve collecting data from human subjects, testing on human participants, or assessing impacts on individuals must be conducted with appropriate ethical safeguards including informed consent where required.' },
      { id: 'MEASURE 2.3', description: 'AI system performance or trustworthiness characteristics are measured before and after any changes are made to the AI system or the operational environment. Measurement should be continuous, not a one-time gate, to detect performance degradation, distributional shift, or emergent bias that may develop after deployment or following model updates.' },
      { id: 'MEASURE 2.5', description: 'The AI system\'s trustworthiness characteristics are explained to relevant stakeholders. Explainability of AI systems — understanding why a model produced a particular output — is both a trustworthiness property of the system itself and a requirement for effective governance. Relevant stakeholders must understand the basis for AI outputs to exercise appropriate oversight.' },
      { id: 'MEASURE 2.6', description: 'The risk associated with the use of third-party data or AI is measured and tracked. Data provenance, quality, and the reliability of third-party AI components should be evaluated. Dependencies on external data sources or AI services introduce risks that may be outside the organization\'s direct control and must be monitored over time.' },
      { id: 'MEASURE 2.7', description: 'AI system security and resilience are evaluated and documented. Security evaluation for AI systems should address traditional software vulnerabilities as well as AI-specific threats such as adversarial examples designed to cause misclassification, model extraction attacks that steal intellectual property, data poisoning that corrupts training data, and prompt injection in language model applications.' },
      { id: 'MEASURE 2.8', description: 'Risks associated with AI system use are monitored and tracked. Post-deployment monitoring should track real-world AI system behavior to detect unexpected outputs, performance degradation, emerging bias, and novel failure modes. Monitoring should feed back into risk management processes so that identified risks are addressed before they cause significant harm.' },
      { id: 'MEASURE 2.9', description: 'The trustworthiness characteristics of the AI system are assessed against the organization\'s established values and principles. Periodic assessment evaluates whether the AI system continues to align with the organization\'s ethical commitments and societal values, not only whether it meets technical performance targets. Values alignment assessment may involve external ethics review or stakeholder consultation.' },
      { id: 'MEASURE 2.10', description: 'Privacy risk of the AI system — as identified in MAP — is examined by trained personnel and privacy risk management controls are evaluated and documented. AI systems frequently process personal data and can introduce novel privacy risks including re-identification of anonymized data, inference of sensitive attributes, and creation of detailed profiles. Privacy risk management for AI requires expertise in both AI and privacy domains.' },
      { id: 'MEASURE 2.11', description: 'Fairness and bias — as identified in MAP — are evaluated on a continuous basis using previously identified indicators. Fairness evaluation should test for disparate impact across demographic groups, evaluating whether the AI system produces systematically different error rates, outputs, or outcomes for different populations. Bias testing should cover the full range of bias sources: training data, model architecture, deployment context, and human interaction.' },
      { id: 'MEASURE 2.12', description: 'Environmental impact of AI system use, development, and deployment are measured and tracked. AI systems — especially large language models and other computationally intensive models — consume significant energy during training and inference. Organizations should measure and track their AI systems\' energy consumption and carbon footprint as part of responsible AI governance.' },
      { id: 'MEASURE 2.13', description: 'Effectiveness of the employed TEVV (Test, Evaluation, Verification, and Validation) is evaluated and documented. TEVV activities should be assessed not only for whether they were conducted but for whether they were rigorous enough to identify the risks present in the AI system. Systematic evaluation of TEVV quality enables continuous improvement of the measurement function itself.' },
      { id: 'MEASURE 3.1', description: 'Approaches, personnel, and documentation are in place to regularly identify and track existing, unanticipated, and emergent AI risks based on factors such as intended and actual performance in deployed contexts. AI risks may emerge from the interaction of AI system behavior, user behavior, and deployment context in ways that were not anticipated during design; ongoing risk identification is therefore necessary.' },
      { id: 'MEASURE 3.3', description: 'Feedback processes for AI risk management and risk controls are defined and documented. Feedback mechanisms should close the loop between measurement results and risk management decisions, ensuring that what is measured actually influences how risks are treated and how AI systems are governed.' },
      { id: 'MEASURE 4.1', description: 'Measurement approaches for identifying AI risks are connected to deployment context(s) and informed by target audience(s), potential positive and negative impacts, data types, and applicable regulations. Measurement methods must be contextually valid — a fairness metric appropriate for a medical diagnostic AI may differ from one appropriate for a hiring recommendation system or a credit scoring model.' },
      { id: 'MEASURE 4.2', description: 'Measurement results regarding AI system trustworthiness are communicated to relevant AI actors. Measurement findings should be accessible to decision-makers — including those without technical backgrounds — so that measurement activities translate into informed governance decisions rather than remaining siloed within technical teams.' },
    ],
  },
  {
    id: 'MANAGE',
    name: 'MANAGE',
    overview: 'The MANAGE function covers the allocation of resources, implementation of risk treatment plans, and ongoing monitoring and adjustment of AI risk management activities. Based on the risks identified in MAP and measured in MEASURE, MANAGE activities select and implement appropriate controls, responses, and mitigations. MANAGE is where organizational commitment to responsible AI translates into concrete action. Risk management options include risk avoidance (not deploying the AI system or a particular use case), risk reduction (implementing controls to reduce likelihood or impact), risk transfer (insurance, contractual allocation), and risk acceptance (documented decision to tolerate a known risk). MANAGE activities must be sustained over time — AI systems change, deployment contexts evolve, and new risks emerge — requiring continuous monitoring and adaptation rather than a one-time set of control implementations.',
    subcategories: [
      { id: 'MANAGE 1.1', description: 'A risk response plan documenting the actions taken for mapped risks is developed and is available to relevant stakeholders. Risk response plans should specify the treatment selected for each identified risk, the rationale for that selection, the controls implemented, the resources allocated, and the timeline for implementation. Plans should be accessible to those responsible for executing them.' },
      { id: 'MANAGE 1.2', description: 'Treatment of documented AI risks includes prioritization of riskiest AI systems. Organizations with multiple AI systems must allocate limited risk management resources across their portfolio; prioritization ensures that the highest-risk systems receive the most intensive oversight and that risk management investments are directed where they will have the greatest impact.' },
      { id: 'MANAGE 1.3', description: 'Responses to identified risks are communicated to relevant AI actors, users, and business leaders. Risk communication ensures that those who operate, use, and are affected by AI systems understand the risks that have been identified and the measures taken to address them, enabling informed decision-making at all levels of the organization.' },
      { id: 'MANAGE 2.2', description: 'Mechanisms to sustain the value of deployed AI systems are incorporated into teams\' practices and across the AI lifecycle. Sustaining AI system value includes maintaining model performance, updating training data to reflect changing conditions, and revisiting design assumptions as the deployment context evolves. Value erosion is a risk that requires active management.' },
      { id: 'MANAGE 2.4', description: 'Mechanisms are in place to allow for the rollback or shutdown of AI systems in cases where the deployment of the system is determined to be unsafe, non-compliant with applicable regulations, or otherwise unacceptable. The ability to rapidly take an AI system offline or roll back to a prior version is an essential safety control; organizations must design for this capability rather than discovering its absence only when it is urgently needed.' },
      { id: 'MANAGE 3.1', description: 'AI risks and benefits from third-party resources are regularly monitored and risk information is shared with relevant stakeholders. AI components obtained from third parties — including pre-trained models, datasets, APIs, and cloud AI services — carry risks that may change over time. Organizations must establish processes for monitoring third-party AI risks continuously, not only at the point of procurement.' },
      { id: 'MANAGE 3.2', description: 'Pre-trained models which are used for development are monitored as part of AI risk management. Foundation models and other pre-trained models carry inherited risks from their training data, training process, and original intended use. When an organization adapts or fine-tunes a pre-trained model, it inherits those risks and must actively manage them.' },
      { id: 'MANAGE 4.1', description: 'Post-deployment AI risks and impacts, including the residual negative impacts of AI systems on individuals, groups, communities, and society, are identified and evaluated. Post-deployment monitoring must look beyond technical performance metrics to detect harms that manifest only in real-world use, including discriminatory outcomes, erosion of user autonomy, and systemic effects on communities.' },
      { id: 'MANAGE 4.2', description: 'Measurable performance improvements consistent with the business value and organizational risk tolerance are documented. Risk management efforts should demonstrably improve AI system trustworthiness over time; organizations should track whether implemented controls are achieving their intended effect and whether the overall risk profile of their AI systems is improving.' },
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
      .eq('abbreviation', 'NIST AI RMF')
      .single();

    if (frameworkError || !framework) {
      return new Response(
        JSON.stringify({ error: 'NIST AI RMF framework not found in compliance_frameworks table' }),
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
          name: 'NIST AI Risk Management Framework 1.0 (AI RMF 1.0)',
          url: 'https://airc.nist.gov/Home',
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
        JSON.stringify({ error: 'Failed to find or create NIST AI RMF source' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: job } = await supabase
      .from('ingest_jobs')
      .insert({ source_id: source.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();

    let documentsIngested = 0;

    for (const func of NIST_AI_RMF_FUNCTIONS) {
      // Function-level document
      const funcContent = `# NIST AI RMF 1.0 — ${func.name} Function\n\nFramework: NIST AI Risk Management Framework 1.0\nCore Function: ${func.name}\nSubcategory Count: ${func.subcategories.length}\n\n## Function Overview\n${func.overview}\n\n## Subcategories in this Function\n${func.subcategories.map(s => `- **${s.id}**: ${s.description.slice(0, 120)}...`).join('\n')}\n\n## AI Trustworthiness Context\nThe NIST AI RMF defines AI trustworthiness in terms of: accuracy, explainability, interpretability, reliability, robustness, safety, security, resilience, accountability, transparency, fairness, bias mitigation, and privacy. Each AI RMF function contributes to realizing these trustworthiness characteristics in practice.`;

      const funcMeta = { function_id: func.id, function_name: func.name, section_type: 'core_function', version: '1.0' };

      const { data: funcDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `NIST AI RMF 1.0 — ${func.name} Function`,
        document_type: 'framework',
        url: 'https://airc.nist.gov/Home',
        version: '1.0',
        raw_content: funcContent,
        metadata: funcMeta,
        is_indexed: true,
      }).select('id').single();

      if (funcDoc) await insertChunk(funcDoc.id, funcContent, funcMeta);
      documentsIngested++;

      // Subcategory-level documents
      for (const sub of func.subcategories) {
        const subContent = `# ${sub.id}\n\n## Framework\nNIST AI Risk Management Framework 1.0 (AI RMF 1.0)\n\n## Core Function\n${func.name}\n\n## Subcategory\n${sub.id}\n\n## Description\n${sub.description}\n\n## Implementation Guidance\nOrganizations implementing the NIST AI RMF should evaluate their current maturity against this subcategory and identify gaps between current practices and the practices described. The AI RMF is a voluntary framework; organizations may prioritize subcategories based on their specific risk profile, the types of AI they deploy, and the contexts in which AI systems affect individuals and communities.\n\n## AI Risk Concepts Relevant to This Subcategory\n- **Trustworthiness**: Whether the AI system is accurate, reliable, explainable, fair, safe, secure, and privacy-preserving\n- **Bias and Fairness**: Whether AI outputs systematically disadvantage particular groups based on protected characteristics\n- **Explainability**: Whether humans can understand why the AI system produced a particular output\n- **Robustness**: Whether the AI system behaves as intended under a wide range of inputs, including adversarial inputs\n- **Privacy**: Whether the AI system respects the privacy of individuals whose data it processes or whose information it may infer\n- **Security**: Whether the AI system is resistant to adversarial attacks including data poisoning, model extraction, and prompt injection`;

        const subMeta = {
          subcategory_id: sub.id,
          function_id: func.id,
          function_name: func.name,
          section_type: 'subcategory',
          version: '1.0',
        };

        const { data: subDoc } = await supabase.from('documents').insert({
          source_id: source.id,
          framework_id: framework.id,
          title: `NIST AI RMF — ${sub.id}`,
          document_type: 'control',
          url: 'https://airc.nist.gov/Home',
          version: '1.0',
          raw_content: subContent,
          metadata: subMeta,
          is_indexed: true,
        }).select('id').single();

        if (subDoc) await insertChunk(subDoc.id, subContent, subMeta);
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
      JSON.stringify({ success: true, documents_ingested: documentsIngested, message: 'NIST AI RMF 1.0 ingested successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('NIST AI RMF ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
