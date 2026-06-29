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

// NIST Risk Management Framework (RMF) — SP 800-37 Rev 2 — 7 Steps
const NIST_RMF_STEPS = [
  {
    stepNumber: 0,
    id: 'PREPARE',
    name: 'Prepare',
    description: 'The Prepare step establishes a context and priorities for managing security and privacy risk across the organization and at the system level. It is foundational to the other RMF steps and helps organizations achieve more effective, efficient, and cost-effective risk management by establishing roles, responsibilities, risk tolerances, strategies, and resources before system-level work begins.',
    purpose: 'Carry out essential activities at the organization and system level to help prepare the organization to manage its security and privacy risks using the RMF.',
    outcomes: [
      'Organizational risk management roles and responsibilities are identified and assigned',
      'Organizational risk management strategy and risk tolerance are established and documented',
      'Organizational- and system-level risk assessment results inform security and privacy planning',
      'Common controls are identified and plans for their implementation are established',
      'System owners are identified and system boundaries are established',
      'Security and privacy requirements are defined based on applicable laws, regulations, and policies',
    ],
    keyRoles: ['Head of Agency / CEO', 'Risk Executive (Function)', 'Chief Information Officer (CIO)', 'Senior Agency Information Security Officer (SAISO/CISO)', 'Senior Agency Official for Privacy (SAOP)', 'Authorizing Official (AO)', 'System Owner', 'Common Control Provider'],
    references: ['NIST SP 800-37 Rev 2', 'NIST SP 800-39', 'NIST SP 800-30 Rev 1', 'NIST SP 800-181'],
    tasks: [
      {
        taskId: 'P-1',
        title: 'Risk Management Roles',
        description: 'Identify and assign individuals to specific roles associated with security and privacy risk management.',
        outcomes: 'Individuals are identified and assigned to RMF roles with the skills, knowledge, and expertise needed to successfully execute the responsibilities associated with those roles.',
        roles: ['Head of Agency', 'Chief Information Officer', 'Senior Agency Information Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task P-1', 'NIST SP 800-181'],
      },
      {
        taskId: 'P-2',
        title: 'Risk Management Strategy',
        description: 'Establish a risk management strategy for the organization that includes a determination and expression of organizational risk tolerance.',
        outcomes: 'A risk management strategy is established that includes organizational risk tolerance and guides risk-based decisions within the organization.',
        roles: ['Head of Agency', 'Risk Executive (Function)'],
        references: ['NIST SP 800-37 Rev 2 Task P-2', 'NIST SP 800-39'],
      },
      {
        taskId: 'P-3',
        title: 'Risk Assessment — Organization',
        description: 'Assess organization-level risks and update the results on an ongoing basis.',
        outcomes: 'Organizational risks are identified, assessed, and documented. Risk assessment results are used to inform decisions at the organizational level.',
        roles: ['Risk Executive (Function)', 'Senior Agency Information Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task P-3', 'NIST SP 800-30 Rev 1'],
      },
      {
        taskId: 'P-4',
        title: 'Organizationally Tailored Control Baselines and Cybersecurity Framework Profiles (Optional)',
        description: 'Establish, document, and publish organizationally tailored control baselines and/or Cybersecurity Framework Profiles.',
        outcomes: 'Organizationally tailored control baselines are published and made available to system owners and authorizing officials for use in security and privacy planning activities.',
        roles: ['Senior Agency Information Security Officer', 'Senior Agency Official for Privacy'],
        references: ['NIST SP 800-37 Rev 2 Task P-4', 'NIST SP 800-53B', 'NIST Cybersecurity Framework'],
      },
      {
        taskId: 'P-5',
        title: 'Common Control Identification',
        description: 'Identify, document, and publish organization-wide common controls available for inheritance by organizational systems.',
        outcomes: 'Common controls are identified and published. Security and privacy plans for common controls are developed and approved.',
        roles: ['Senior Agency Information Security Officer', 'Common Control Provider'],
        references: ['NIST SP 800-37 Rev 2 Task P-5'],
      },
      {
        taskId: 'P-6',
        title: 'Impact-Level Prioritization (Optional)',
        description: 'Prioritize organizational systems with the same impact level in accordance with organizational risk.',
        outcomes: 'Systems within the same impact level are assigned a relative prioritization to guide resource allocation and risk management decision making.',
        roles: ['Senior Agency Information Security Officer', 'Authorizing Official'],
        references: ['NIST SP 800-37 Rev 2 Task P-6'],
      },
      {
        taskId: 'P-7',
        title: 'Continuous Monitoring Strategy — Organization',
        description: 'Develop and implement an organization-wide strategy for continuously monitoring control effectiveness.',
        outcomes: 'An organization-wide continuous monitoring strategy is developed and implemented that addresses monitoring frequencies, ongoing assessment, reporting, risk response, and program review.',
        roles: ['Risk Executive (Function)', 'Senior Agency Information Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task P-7', 'NIST SP 800-137'],
      },
    ],
  },
  {
    stepNumber: 1,
    id: 'CATEGORIZE',
    name: 'Categorize',
    description: 'The Categorize step establishes the security impact level of the information system and the information processed, stored, and transmitted by that system. Security categorization drives the selection of appropriate security controls and informs decisions throughout the RMF. Federal organizations use FIPS 199 and NIST SP 800-60 to categorize systems.',
    purpose: 'Inform organizational risk management processes and tasks by determining the adverse impact to organizational operations and assets, individuals, other organizations, and the Nation with respect to the loss of confidentiality, integrity, and availability of organizational systems and the information processed, stored, and transmitted by those systems.',
    outcomes: [
      'System characteristics are documented and the security categorization is completed',
      'Security categorization results reflect the system mission and business objectives',
      'Security categorization is reviewed and approved by the authorizing official',
      'System type is identified (general support system, major application, minor application)',
      'Confidentiality, Integrity, and Availability (CIA) impacts are assessed as Low, Moderate, or High',
    ],
    keyRoles: ['System Owner', 'Information Owner/Steward', 'System Security Officer', 'Senior Agency Information Security Officer', 'Authorizing Official', 'Senior Agency Official for Privacy'],
    references: ['NIST SP 800-37 Rev 2', 'FIPS 199', 'NIST SP 800-60 Vol 1 & 2', 'CNSS Instruction 1253'],
    tasks: [
      {
        taskId: 'C-1',
        title: 'System Description',
        description: 'Document the characteristics of the system using the security plan or equivalent document.',
        outcomes: 'Characteristics of the system are documented including system name, system boundary, system purpose, and the information types processed by the system.',
        roles: ['System Owner', 'Information Owner/Steward'],
        references: ['NIST SP 800-37 Rev 2 Task C-1', 'NIST SP 800-18'],
      },
      {
        taskId: 'C-2',
        title: 'Security Categorization',
        description: 'Categorize the system and document the security categorization results in the security plan.',
        outcomes: 'A security categorization of the system is completed using FIPS 199 methodology. The overall system security category is the high watermark of the individual information type impact levels for confidentiality, integrity, and availability.',
        roles: ['System Owner', 'Information Owner/Steward'],
        references: ['NIST SP 800-37 Rev 2 Task C-2', 'FIPS 199', 'NIST SP 800-60'],
      },
    ],
  },
  {
    stepNumber: 2,
    id: 'SELECT',
    name: 'Select',
    description: 'The Select step involves selecting an initial set of controls for the system based on the security categorization and tailoring the controls as needed based on risk assessment and organizational considerations. Organizations begin with a control baseline from NIST SP 800-53B and tailor it to meet specific system requirements.',
    purpose: 'Select, tailor, and document the controls necessary to protect the system and organization commensurate with risk to organizational operations and assets, individuals, other organizations, and the Nation.',
    outcomes: [
      'Control baselines are selected and tailored for the system',
      'Tailoring actions are documented and approved',
      'Control baselines reflect organizational requirements and system risk level',
      'A continuous monitoring strategy for the system is developed',
      'Security and privacy plans reflect the selected controls',
    ],
    keyRoles: ['System Owner', 'System Security Officer', 'Senior Agency Information Security Officer', 'Authorizing Official', 'Common Control Provider', 'Information Owner/Steward'],
    references: ['NIST SP 800-37 Rev 2', 'NIST SP 800-53', 'NIST SP 800-53B'],
    tasks: [
      {
        taskId: 'S-1',
        title: 'Control Selection',
        description: 'Select the controls for the system and the environment of operation.',
        outcomes: 'Controls are selected for the system based on the security categorization. The control selection includes controls from the appropriate baseline plus any additional controls needed to address risks.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task S-1', 'NIST SP 800-53', 'NIST SP 800-53B'],
      },
      {
        taskId: 'S-2',
        title: 'Control Tailoring',
        description: 'Tailor the controls selected for the system and the environment of operation.',
        outcomes: 'Controls are tailored to meet the specific requirements of the system. Tailoring may include adding controls, removing controls, adjusting parameters, and providing implementation guidance.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task S-2', 'NIST SP 800-53B'],
      },
      {
        taskId: 'S-3',
        title: 'Control Allocation',
        description: 'Allocate security and privacy controls to the system and to the environment of operation.',
        outcomes: 'Controls are allocated as system-specific, hybrid, or common controls. Allocation decisions are documented in the security and privacy plans.',
        roles: ['System Owner', 'Common Control Provider'],
        references: ['NIST SP 800-37 Rev 2 Task S-3'],
      },
      {
        taskId: 'S-4',
        title: 'Documentation of Planned Control Implementations',
        description: 'Document the controls for the system and environment of operation in security and privacy plans.',
        outcomes: 'Security and privacy plans are created or updated to reflect the selected and tailored controls, including how each control is implemented or planned to be implemented.',
        roles: ['System Owner', 'System Security Officer', 'Common Control Provider'],
        references: ['NIST SP 800-37 Rev 2 Task S-4', 'NIST SP 800-18'],
      },
      {
        taskId: 'S-5',
        title: 'Continuous Monitoring Strategy — System',
        description: 'Develop and implement a system-level strategy for monitoring control effectiveness that is consistent with and supplements the organizational continuous monitoring strategy.',
        outcomes: 'A continuous monitoring strategy is developed for the system that defines monitoring frequencies, metrics, assessment procedures, reporting requirements, and thresholds for triggering additional actions.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task S-5', 'NIST SP 800-137'],
      },
      {
        taskId: 'S-6',
        title: 'Plan Review and Approval',
        description: 'Review and approve the security and privacy plans for the system.',
        outcomes: 'The authorizing official (or designated representative) reviews and approves the security and privacy plans for the system. Approved plans establish the agreed-upon set of controls to be implemented.',
        roles: ['Authorizing Official', 'Senior Agency Information Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task S-6'],
      },
    ],
  },
  {
    stepNumber: 3,
    id: 'IMPLEMENT',
    name: 'Implement',
    description: 'The Implement step involves implementing the controls specified in the security and privacy plans. Implementation includes deploying controls in the system and environment of operation and documenting how the controls are implemented. Organizations also document any deviations from planned control implementations.',
    purpose: 'Implement the controls in the security and privacy plans for the system and the environment of operation; document the implementation details in support of the assessment.',
    outcomes: [
      'Controls specified in security and privacy plans are implemented',
      'Security and privacy plans are updated to reflect implementation details',
      'Implementation details provide sufficient information to support assessments',
      'Deviations from planned control implementations are documented and risk-accepted',
      'Supply chain risk management controls are implemented',
    ],
    keyRoles: ['System Owner', 'Common Control Provider', 'System Security Officer', 'Information System Security Engineer', 'Developer/Integrator'],
    references: ['NIST SP 800-37 Rev 2', 'NIST SP 800-160', 'NIST SP 800-53A'],
    tasks: [
      {
        taskId: 'I-1',
        title: 'Control Implementation',
        description: 'Implement the controls specified in the security and privacy plans.',
        outcomes: 'Designated controls are implemented and the security and privacy plans are updated to reflect the implementation. Control implementation details provide evidence for the assessment activities.',
        roles: ['System Owner', 'Common Control Provider', 'Information System Security Engineer'],
        references: ['NIST SP 800-37 Rev 2 Task I-1', 'NIST SP 800-53', 'NIST SP 800-160'],
      },
      {
        taskId: 'I-2',
        title: 'Update Control Implementation Information',
        description: 'Document changes to planned control implementations based on the as-implemented state of controls.',
        outcomes: 'Security and privacy plans are updated to reflect the actual implementation of controls. Documentation includes implementation details, test results, and any deviations from the planned implementation.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task I-2'],
      },
    ],
  },
  {
    stepNumber: 4,
    id: 'ASSESS',
    name: 'Assess',
    description: 'The Assess step involves assessing the controls implemented for the system to determine whether the controls are implemented correctly, operating as intended, and producing the desired outcomes with respect to meeting security and privacy requirements. Assessments are conducted by independent assessors or assessment teams.',
    purpose: 'Determine if the controls selected for implementation are implemented correctly, operating as intended, and producing the desired outcome with respect to meeting the security and privacy requirements for the system and the organization.',
    outcomes: [
      'Assessment plan is developed and approved prior to conducting the assessment',
      'Controls are assessed using examination, interview, and testing procedures',
      'Assessment findings are documented in an assessment report',
      'Weaknesses and deficiencies in control implementations are identified',
      'Plan of action and milestones (POA&M) is developed to address identified weaknesses',
      'Security and privacy plans are updated to reflect assessment results',
    ],
    keyRoles: ['Control Assessor', 'System Owner', 'Authorizing Official', 'Senior Agency Information Security Officer', 'System Security Officer'],
    references: ['NIST SP 800-37 Rev 2', 'NIST SP 800-53A', 'NIST SP 800-115'],
    tasks: [
      {
        taskId: 'A-1',
        title: 'Assessor Selection',
        description: 'Select the appropriate assessor or assessment team for the type of control assessment to be conducted.',
        outcomes: 'An assessor or assessment team is selected that has the required level of independence and technical expertise. The assessor selection reflects the impact level of the system and the rigor of the assessment required.',
        roles: ['Authorizing Official', 'System Owner'],
        references: ['NIST SP 800-37 Rev 2 Task A-1'],
      },
      {
        taskId: 'A-2',
        title: 'Assessment Plan',
        description: 'Develop, review, and approve a plan to assess implemented controls.',
        outcomes: 'An assessment plan is developed that defines the scope, procedures, and schedule for the assessment. The plan identifies the controls to be assessed, the assessment methods to be used, and the expected outputs.',
        roles: ['Control Assessor', 'System Owner', 'Authorizing Official'],
        references: ['NIST SP 800-37 Rev 2 Task A-2', 'NIST SP 800-53A'],
      },
      {
        taskId: 'A-3',
        title: 'Control Assessments',
        description: 'Assess the controls in accordance with the assessment procedures described in the assessment plan.',
        outcomes: 'Controls are assessed using examination, interview, and testing methods. Assessment findings are documented for each control assessed and indicate whether the control is satisfied or not satisfied.',
        roles: ['Control Assessor'],
        references: ['NIST SP 800-37 Rev 2 Task A-3', 'NIST SP 800-53A', 'NIST SP 800-115'],
      },
      {
        taskId: 'A-4',
        title: 'Assessment Reports',
        description: 'Prepare the assessment report that documents the issues, findings, and recommendations from the control assessment.',
        outcomes: 'An assessment report is prepared that includes assessment findings, risks identified, and recommendations. The report provides information necessary for authorizing officials to make risk-based authorization decisions.',
        roles: ['Control Assessor'],
        references: ['NIST SP 800-37 Rev 2 Task A-4'],
      },
      {
        taskId: 'A-5',
        title: 'Remediation Actions',
        description: 'Conduct initial remediation actions on controls based on the findings and recommendations in the assessment report.',
        outcomes: 'Initial remediation of control deficiencies is completed where feasible. The assessment report and security and privacy plans are updated to reflect the current state of controls after initial remediation.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task A-5'],
      },
      {
        taskId: 'A-6',
        title: 'Plan of Action and Milestones',
        description: 'Prepare the plan of action and milestones based on the findings and recommendations of the assessment report excluding any remediation actions taken.',
        outcomes: 'A POA&M is developed that identifies control deficiencies, risk mitigation strategies, resources required, responsible personnel, and completion dates for remediation activities.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task A-6', 'OMB Memorandum M-02-01'],
      },
    ],
  },
  {
    stepNumber: 5,
    id: 'AUTHORIZE',
    name: 'Authorize',
    description: 'The Authorize step involves the authorizing official making a risk-based decision to authorize system operation. The authorization decision is based on the assessment results, the POA&M, and the overall risk posture of the system. Authorization to Operate (ATO) decisions are documented in authorization packages.',
    purpose: 'Provide organizational accountability by requiring a senior management official to determine if the security and privacy risk based on the operation of a system or the use of common controls, is acceptable.',
    outcomes: [
      'Authorization package is assembled and submitted to the authorizing official',
      'Risk determination is made by the authorizing official',
      'Authorization decision is documented (ATO, DATO, IATO, or denial)',
      'Authorization decision includes terms and conditions for system operation',
      'System operates under an approved authorization with active oversight',
      'Authorization decisions are informed by continuous monitoring results',
    ],
    keyRoles: ['Authorizing Official', 'Authorizing Official Designated Representative', 'Senior Agency Information Security Officer', 'System Owner', 'Risk Executive (Function)'],
    references: ['NIST SP 800-37 Rev 2', 'NIST SP 800-137', 'OMB Circular A-130'],
    tasks: [
      {
        taskId: 'R-1',
        title: 'Authorization Package',
        description: 'Assemble the authorization package and submit the package to the authorizing official for authorization decision.',
        outcomes: 'An authorization package is assembled that includes the security and privacy plans, assessment reports, and POA&M. The package provides the authorizing official with the information needed to make an authorization decision.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task R-1'],
      },
      {
        taskId: 'R-2',
        title: 'Risk Analysis and Determination',
        description: 'Analyze and determine the risk from the operation of the system or the use of common controls.',
        outcomes: 'The authorizing official reviews the authorization package and makes a determination about the risk to organizational operations, assets, individuals, and the Nation resulting from operation of the system.',
        roles: ['Authorizing Official', 'Risk Executive (Function)'],
        references: ['NIST SP 800-37 Rev 2 Task R-2', 'NIST SP 800-30 Rev 1'],
      },
      {
        taskId: 'R-3',
        title: 'Risk Response',
        description: 'Identify and implement a preferred course of action in response to the risk determined.',
        outcomes: 'The authorizing official determines the appropriate risk response. Risk responses may include accepting the risk, mitigating the risk through additional controls, avoiding the risk, or sharing the risk with another organization.',
        roles: ['Authorizing Official', 'Risk Executive (Function)'],
        references: ['NIST SP 800-37 Rev 2 Task R-3', 'NIST SP 800-39'],
      },
      {
        taskId: 'R-4',
        title: 'Authorization Decision',
        description: 'Determine if the risk from the operation of the system or the use of common controls is acceptable.',
        outcomes: 'The authorizing official issues an authorization decision: Authorization to Operate (ATO), Denial of Authorization to Operate (DATO), Interim Authorization to Operate (IATO), or Interim Authorization to Use (IATU). The decision documents any conditions for system operation.',
        roles: ['Authorizing Official'],
        references: ['NIST SP 800-37 Rev 2 Task R-4'],
      },
      {
        taskId: 'R-5',
        title: 'Authorization Reporting',
        description: 'Report the authorization decision and any deficiencies in controls to organizational officials.',
        outcomes: 'The authorization decision and supporting documentation are reported to organizational officials, including information about residual risks accepted by the authorizing official.',
        roles: ['Authorizing Official', 'System Owner'],
        references: ['NIST SP 800-37 Rev 2 Task R-5'],
      },
    ],
  },
  {
    stepNumber: 6,
    id: 'MONITOR',
    name: 'Monitor',
    description: 'The Monitor step involves monitoring the system and the associated controls on an ongoing basis to ensure that risk remains acceptable. Continuous monitoring provides situational awareness about the security and privacy posture of the system and allows organizations to respond rapidly to changes in the threat environment.',
    purpose: 'Maintain ongoing situational awareness about the security and privacy posture of the information system and the organization to support risk management decisions.',
    outcomes: [
      'System and environment of operation changes are monitored',
      'Ongoing assessments of controls are conducted at a defined frequency',
      'Security and privacy posture of the system is reported to authorizing officials',
      'Ongoing risk determinations are made and risk responses are implemented',
      'Authorization decisions are updated in response to changes in risk posture',
      'Systems with high risk are decommissioned or have operations suspended',
    ],
    keyRoles: ['System Owner', 'System Security Officer', 'Senior Agency Information Security Officer', 'Authorizing Official', 'Risk Executive (Function)', 'Control Assessor'],
    references: ['NIST SP 800-37 Rev 2', 'NIST SP 800-137', 'NIST SP 800-53A'],
    tasks: [
      {
        taskId: 'M-1',
        title: 'System and Environment Changes',
        description: 'Monitor the information system and its environment of operation for changes that impact the security and privacy posture of the system.',
        outcomes: 'Changes to the system and environment of operation are identified, analyzed, and documented. Significant changes trigger reassessment of relevant controls and potentially a new authorization decision.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task M-1', 'NIST SP 800-128'],
      },
      {
        taskId: 'M-2',
        title: 'Ongoing Assessments',
        description: 'Assess the controls implemented within and inherited by the system in accordance with the continuous monitoring strategy.',
        outcomes: 'Controls are assessed on an ongoing basis using the monitoring frequencies defined in the continuous monitoring strategy. Assessment results are documented and provided to authorizing officials.',
        roles: ['Control Assessor', 'System Owner'],
        references: ['NIST SP 800-37 Rev 2 Task M-2', 'NIST SP 800-53A', 'NIST SP 800-137'],
      },
      {
        taskId: 'M-3',
        title: 'Ongoing Risk Response',
        description: 'Respond to risk based on the results of ongoing monitoring activities, risk assessments, and outstanding items in the plan of action and milestones.',
        outcomes: 'Risk responses are implemented in a timely manner. The POA&M is updated to reflect completed remediation actions and newly identified weaknesses.',
        roles: ['System Owner', 'System Security Officer', 'Authorizing Official'],
        references: ['NIST SP 800-37 Rev 2 Task M-3'],
      },
      {
        taskId: 'M-4',
        title: 'Authorization Package Updates',
        description: 'Update the authorization package based on information produced during the continuous monitoring process.',
        outcomes: 'Security and privacy plans, assessment reports, and POA&M are updated to reflect the current state of the system and the results of continuous monitoring activities.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task M-4'],
      },
      {
        taskId: 'M-5',
        title: 'Security and Privacy Reporting',
        description: 'Report the security and privacy posture of the system to the authorizing official and other organizational officials on an ongoing basis in accordance with the organizational continuous monitoring strategy.',
        outcomes: 'Security and privacy posture reports are provided to authorizing officials and organizational leadership. Reports provide situational awareness and support ongoing authorization decisions.',
        roles: ['System Owner', 'System Security Officer', 'Senior Agency Information Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task M-5', 'NIST SP 800-137'],
      },
      {
        taskId: 'M-6',
        title: 'Ongoing Authorization',
        description: 'Review the security and privacy posture of the system on an ongoing basis to determine whether the risk remains acceptable.',
        outcomes: 'The authorizing official reviews reported security and privacy posture information and determines whether the risk from system operation remains acceptable. The authorization is maintained, modified, or revoked based on this determination.',
        roles: ['Authorizing Official'],
        references: ['NIST SP 800-37 Rev 2 Task M-6'],
      },
      {
        taskId: 'M-7',
        title: 'System Disposal',
        description: 'Implement a system disposal strategy and execute the strategy in a manner that addresses security and privacy requirements and ensures that the disposal is carried out in an orderly and well-planned manner.',
        outcomes: 'System disposal is planned and executed in a manner that protects sensitive information and preserves the confidentiality and integrity of data. System decommissioning actions are documented.',
        roles: ['System Owner', 'System Security Officer'],
        references: ['NIST SP 800-37 Rev 2 Task M-7', 'NIST SP 800-88'],
      },
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
      .eq('abbreviation', 'NIST RMF')
      .single();

    if (frameworkError || !framework) {
      return new Response(
        JSON.stringify({ error: 'NIST RMF framework not found in compliance_frameworks table' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find or create source record for NIST RMF
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
          name: 'NIST Risk Management Framework (RMF) — SP 800-37 Rev 2',
          url: 'https://csrc.nist.gov/projects/risk-management/about-rmf',
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
        JSON.stringify({ error: 'Failed to find or create NIST RMF source' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: job } = await supabase
      .from('ingest_jobs')
      .insert({ source_id: source.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();

    let documentsIngested = 0;

    // Overview document
    const overviewContent = `# NIST Risk Management Framework (RMF) Overview\n\nFramework: NIST Risk Management Framework\nPrimary Publication: NIST SP 800-37 Rev 2 — Risk Management Framework for Information Systems and Organizations\nPublisher: National Institute of Standards and Technology (NIST)\n\n## What is the RMF?\nThe NIST Risk Management Framework provides a process that integrates security, privacy, and cyber supply chain risk management activities into the system development life cycle. The RMF approach can be applied to new systems under development, legacy systems, repurposed systems, systems of systems, and systems that operate as part of a system of systems. It applies to federal information systems per FISMA, and is widely adopted in the private sector.\n\n## RMF Steps\nThe RMF consists of 7 steps:\n1. **Prepare** — Establish context and priorities for managing security and privacy risk\n2. **Categorize** — Determine the adverse impact to the organization from loss of CIA\n3. **Select** — Select, tailor, and document controls\n4. **Implement** — Implement the controls in the security and privacy plans\n5. **Assess** — Assess controls to determine if they are implemented correctly\n6. **Authorize** — Make a risk-based authorization decision\n7. **Monitor** — Monitor the system and controls on an ongoing basis\n\n## Key Supporting Publications\n- NIST SP 800-53 Rev 5 — Security and Privacy Controls (used in Select step)\n- NIST SP 800-53A Rev 5 — Assessment Procedures (used in Assess step)\n- NIST SP 800-53B — Control Baselines (used in Select step)\n- NIST SP 800-30 Rev 1 — Risk Assessment Guide\n- NIST SP 800-39 — Managing Information Security Risk\n- NIST SP 800-137 — Continuous Monitoring (used in Monitor step)\n- NIST SP 800-60 — Information Types Guide (used in Categorize step)\n- FIPS 199 — Security Categorization Standard\n- FIPS 200 — Minimum Security Requirements\n\n## Relationship to FISMA\nThe Federal Information Security Modernization Act (FISMA) requires federal agencies to implement risk management programs for their information systems. The RMF operationalizes the requirements of FISMA and provides a structured process for achieving and maintaining authorization to operate (ATO).\n\n## Key Roles in the RMF\n- **Head of Agency / CEO** — Ultimate responsibility for risk management\n- **Risk Executive (Function)** — Organization-wide risk management oversight\n- **Chief Information Officer (CIO)** — IT governance and FISMA compliance\n- **Senior Agency Information Security Officer (SAISO/CISO)** — Security program oversight\n- **Senior Agency Official for Privacy (SAOP/CPO)** — Privacy program oversight\n- **Authorizing Official (AO)** — Makes final risk acceptance decisions (grants ATOs)\n- **System Owner** — Responsible for procurement and operation of the system\n- **System Security Officer (SSO/ISSO)** — Day-to-day security for assigned systems\n- **Control Assessor** — Conducts independent assessment of controls\n- **Common Control Provider** — Develops and maintains inherited controls`;

    const overviewMeta = { document_level: 'overview', framework: 'NIST RMF', publication: 'SP 800-37 Rev 2' };

    const { data: overviewDoc } = await supabase.from('documents').insert({
      source_id: source.id,
      framework_id: framework.id,
      title: 'NIST RMF Overview — Risk Management Framework for Information Systems',
      document_type: 'framework',
      url: 'https://csrc.nist.gov/projects/risk-management/about-rmf',
      version: 'Rev 2',
      raw_content: overviewContent,
      metadata: overviewMeta,
      is_indexed: true,
    }).select('id').single();

    if (overviewDoc) await insertChunk(overviewDoc.id, overviewContent, overviewMeta);
    documentsIngested++;

    for (const step of NIST_RMF_STEPS) {
      // Step-level document
      const stepContent = `# NIST RMF Step ${step.stepNumber}: ${step.name}\n\nStep: ${step.stepNumber} — ${step.name}\nStep ID: ${step.id}\nFramework: NIST Risk Management Framework (SP 800-37 Rev 2)\n\n## Purpose\n${step.purpose}\n\n## Description\n${step.description}\n\n## Expected Outcomes\n${step.outcomes.map(o => `- ${o}`).join('\n')}\n\n## Key Roles and Responsibilities\n${step.keyRoles.map(r => `- ${r}`).join('\n')}\n\n## Supporting References\n${step.references.map(r => `- ${r}`).join('\n')}\n\n## Tasks in this Step\n${step.tasks.map(t => `- **${t.taskId}** — ${t.title}: ${t.description.slice(0, 100)}...`).join('\n')}`;

      const stepMeta = {
        step_number: step.stepNumber,
        step_id: step.id,
        step_name: step.name,
        document_level: 'step',
        publication: 'SP 800-37 Rev 2',
      };

      const { data: stepDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `NIST RMF Step ${step.stepNumber}: ${step.name}`,
        document_type: 'framework',
        url: 'https://csrc.nist.gov/projects/risk-management/about-rmf',
        version: 'Rev 2',
        raw_content: stepContent,
        metadata: stepMeta,
        is_indexed: true,
      }).select('id').single();

      if (stepDoc) await insertChunk(stepDoc.id, stepContent, stepMeta);
      documentsIngested++;

      // Task-level documents
      for (const task of step.tasks) {
        const taskContent = `# RMF Task ${task.taskId} — ${task.title}\n\nTask ID: ${task.taskId}\nRMF Step: ${step.stepNumber} — ${step.name}\nFramework: NIST Risk Management Framework (SP 800-37 Rev 2)\n\n## Task Description\n${task.description}\n\n## Expected Outcomes\n${task.outcomes}\n\n## Responsible Roles\n${task.roles.map(r => `- ${r}`).join('\n')}\n\n## References\n${task.references.map(r => `- ${r}`).join('\n')}\n\n## Context\nThis task is part of RMF Step ${step.stepNumber} (${step.name}). ${step.description.slice(0, 200)}...`;

        const taskMeta = {
          task_id: task.taskId,
          task_title: task.title,
          step_number: step.stepNumber,
          step_id: step.id,
          step_name: step.name,
          document_level: 'task',
          publication: 'SP 800-37 Rev 2',
        };

        const { data: taskDoc } = await supabase.from('documents').insert({
          source_id: source.id,
          framework_id: framework.id,
          title: `RMF Task ${task.taskId} — ${task.title}`,
          document_type: 'control',
          url: 'https://csrc.nist.gov/projects/risk-management/about-rmf',
          version: 'Rev 2',
          raw_content: taskContent,
          metadata: taskMeta,
          is_indexed: true,
        }).select('id').single();

        if (taskDoc) await insertChunk(taskDoc.id, taskContent, taskMeta);
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
      JSON.stringify({ success: true, documents_ingested: documentsIngested, message: 'NIST RMF ingested successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('NIST RMF ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
