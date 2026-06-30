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
    headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  const data = await response.json();
  return data.data[0].embedding;
}

// AICPA Trust Services Criteria 2017 (updated 2022)
const TSC_DATA = {
  categories: [
    {
      id: 'CC1',
      name: 'Control Environment',
      trust_service_category: 'Security',
      description: 'The control environment sets the tone of the organization, influencing the control consciousness of its people.',
      criteria: [
        { id: 'CC1.1', title: 'Commitment to Integrity and Ethical Values', description: 'The entity demonstrates a commitment to integrity and ethical values. COSO Principle 1: Management and the board of directors set the tone at the top regarding the importance of integrity and ethical values, including behavioral standards, through directive, actions, and verbal communication. Policies and codes of conduct exist. Deviations are identified and remediated.' },
        { id: 'CC1.2', title: 'Board Independence and Oversight', description: 'The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal control. COSO Principle 2: The board consists of sufficient independent members. The board oversees management in its design, implementation, and conduct of internal control. The board defines, maintains, and periodically evaluates the skills and expertise needed to enable them to ask probing questions.' },
        { id: 'CC1.3', title: 'Organizational Structure and Authority', description: 'Management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities in pursuit of objectives. COSO Principle 3: Management and the board consider all structures of the entity. Reporting lines are established. Authority and responsibility are assigned and appropriately limited to enable management to achieve objectives.' },
        { id: 'CC1.4', title: 'Commitment to Competence', description: 'The entity demonstrates a commitment to attract, develop, and retain competent individuals in alignment with objectives. COSO Principle 4: Policies and practices reflect expectations of competence. Attraction, development, and retention of individuals includes evaluation of competence through defined criteria. Mentoring and training is provided.' },
        { id: 'CC1.5', title: 'Accountability for Internal Control', description: 'The entity holds individuals accountable for their internal control responsibilities in pursuit of objectives. COSO Principle 5: Mechanisms to communicate and hold individuals accountable for performance of internal control responsibilities are established. Corrective actions are taken when necessary. Excessive pressure is evaluated and adjusted.' },
      ],
    },
    {
      id: 'CC2',
      name: 'Communication and Information',
      trust_service_category: 'Security',
      description: 'The entity obtains and uses relevant, quality information to support the functioning of internal control.',
      criteria: [
        { id: 'CC2.1', title: 'Use of Relevant Information', description: 'COSO Principle 13: The entity obtains or generates and uses relevant, quality information to support the functioning of internal control. Information requirements are identified for each objective. Internal and external sources of information are used. Information is processed and refined into data for use by personnel.' },
        { id: 'CC2.2', title: 'Internal Communication', description: 'COSO Principle 14: The entity internally communicates information, including objectives and responsibilities for internal control, necessary to support the functioning of internal control. Processes exist to communicate required information throughout the organization. Separate communication channels exist for sensitive matters. Methods of communication consider the timing, audience, and nature of the information.' },
        { id: 'CC2.3', title: 'External Communication', description: 'COSO Principle 15: The entity communicates with external parties regarding matters affecting the functioning of internal control. External parties are communicated to regarding performance expectations. Information from external parties is shared internally. Separate communication channels exist for anonymous or sensitive communications. Communication methods reflect the audience and nature of information.' },
      ],
    },
    {
      id: 'CC3',
      name: 'Risk Assessment',
      trust_service_category: 'Security',
      description: 'The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives.',
      criteria: [
        { id: 'CC3.1', title: 'Specification of Objectives', description: 'COSO Principle 6: The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives. Objectives reflect management choices, risk tolerance, and resource constraints. Financial reporting, operational, compliance, and technology objectives are considered.' },
        { id: 'CC3.2', title: 'Risk Identification and Analysis', description: 'COSO Principle 7: The entity identifies risks to the achievement of its objectives across the entity and analyzes risks as a basis for determining how the risks should be managed. Included in risk identification are internal and external factors, involvement of appropriate levels of management, estimation of significance of risks identified, and determination of how to respond to risks.' },
        { id: 'CC3.3', title: 'Fraud Risk Assessment', description: 'COSO Principle 8: The entity considers the potential for fraud in assessing risks to the achievement of objectives. Various types of fraud are considered including reporting fraud, possible loss of assets, and corruption. Risk assessment considers changes in management, incentive and pressure, opportunities to commit fraud, and attitudes and rationalizations.' },
        { id: 'CC3.4', title: 'Identification and Assessment of Changes', description: 'COSO Principle 9: The entity identifies and assesses changes that could significantly impact the system of internal control. Changes in the external environment, business model, and leadership are considered. Processes exist to identify and assess risks arising from changes.' },
      ],
    },
    {
      id: 'CC4',
      name: 'Monitoring Activities',
      trust_service_category: 'Security',
      description: 'The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.',
      criteria: [
        { id: 'CC4.1', title: 'Ongoing and Separate Evaluations', description: 'COSO Principle 16: The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning. A baseline understanding of internal control is used for ongoing and separate evaluations. Personnel who are sufficiently knowledgeable perform evaluations. Ongoing evaluations are integrated into business processes. Separate evaluations are performed periodically.' },
        { id: 'CC4.2', title: 'Evaluation and Communication of Deficiencies', description: 'COSO Principle 17: The entity evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action. Results are evaluated against criteria established by regulators, recognized standards bodies, or management and the board. Deficiencies are communicated to parties responsible for corrective action and to management and the board as appropriate.' },
      ],
    },
    {
      id: 'CC5',
      name: 'Control Activities',
      trust_service_category: 'Security',
      description: 'The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.',
      criteria: [
        { id: 'CC5.1', title: 'Selection and Development of Control Activities', description: 'COSO Principle 10: The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels. Control activities address identified risks through a selection of a variety of control types and are implemented at various levels of the entity. Controls include a range of preventive and detective activities.' },
        { id: 'CC5.2', title: 'Technology General Controls', description: 'COSO Principle 11: The entity also selects and develops general control activities over technology to support the achievement of objectives. Technology infrastructure controls, security management controls, and technology acquisition, development, and maintenance process controls are established to support the achievement of objectives.' },
        { id: 'CC5.3', title: 'Policies and Procedures Deployment', description: 'COSO Principle 12: The entity deploys control activities through policies that establish what is expected and in procedures that put policies into action. Policies and procedures are established and communicated for each business process. Responsible personnel execute control procedures in a timely manner. Corrective action is taken when procedures are not performed correctly.' },
      ],
    },
    {
      id: 'CC6',
      name: 'Logical and Physical Access Controls',
      trust_service_category: 'Security',
      description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets.',
      criteria: [
        { id: 'CC6.1', title: 'Logical Access Security Controls', description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity\'s objectives. Access control software is used to protect information assets. Identification and authentication requirements are established. Role-based access control policies are defined and implemented. Network segmentation is used to limit access to sensitive systems.' },
        { id: 'CC6.2', title: 'User Registration and Authorization', description: 'Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users whose access is administered by the entity. The process includes formal user registration with unique user IDs, approval by appropriate personnel, communication of credentials to users in a secure manner, and timely removal of access no longer needed.' },
        { id: 'CC6.3', title: 'Access Modification and Removal', description: 'The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on approved, documented requests in a timely manner. Access changes are authorized by appropriate management. Access is removed promptly upon employment termination. Access is reviewed and adjusted upon job function changes. Access reviews are performed periodically.' },
        { id: 'CC6.4', title: 'Physical Access Restrictions', description: 'The entity restricts physical access to facilities and protected information assets (for example, data center facilities, backup media storage, and other sensitive locations) to authorized personnel to meet the entity\'s objectives. Physical access policies are established and communicated. Physical access is granted based on job function and need. Visitors are escorted and monitored. Physical access logs are maintained and reviewed.' },
        { id: 'CC6.5', title: 'Data Disposal and Asset Decommissioning', description: 'The entity discontinues logical and physical protections over physical assets only after the ability to read or recover data and software from those assets has been diminished and is consistent with the entity\'s objectives. Media containing sensitive data is sanitized or destroyed prior to disposal or reuse. Certificates of destruction are maintained for disposed media. Data retention policies define retention periods and disposal methods.' },
        { id: 'CC6.6', title: 'External Threat Protection', description: 'The entity implements logical access security measures to protect against threats from sources outside its system boundaries. Boundary protection mechanisms are implemented including firewalls, intrusion detection/prevention systems, and network monitoring. Network access is controlled through authentication and authorization. Remote access is secured using encrypted connections and multi-factor authentication. External-facing systems are hardened.' },
        { id: 'CC6.7', title: 'Information Transmission and Movement', description: 'The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes and protects it during transmission, movement, or removal to meet the entity\'s objectives. Data transmission is encrypted in transit. Data loss prevention controls are implemented. Removable media is restricted and controlled. Data transfer to third parties requires authorization. Mobile device management controls are implemented.' },
        { id: 'CC6.8', title: 'Malware Protection', description: 'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software to meet the entity\'s objectives. Anti-malware software is deployed on endpoints and servers. Software installation is restricted to authorized personnel. Application whitelisting is considered. Malware protection is regularly updated. Email filtering is implemented to block malicious attachments and links.' },
      ],
    },
    {
      id: 'CC7',
      name: 'System Operations',
      trust_service_category: 'Security',
      description: 'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors.',
      criteria: [
        { id: 'CC7.1', title: 'Vulnerability Management', description: 'To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations that result in the introduction of new vulnerabilities and susceptibilities to newly discovered vulnerabilities. Vulnerability scanning is performed regularly. Penetration testing is conducted periodically. Patch management processes ensure timely remediation. Configuration baselines are established and deviations monitored.' },
        { id: 'CC7.2', title: 'Security Event Monitoring', description: 'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity\'s ability to meet its objectives. Security information and event management (SIEM) systems are deployed. Log management processes collect, retain, and analyze security events. Alerts are configured for anomalous activity. Monitoring covers network, host, and application layers.' },
        { id: 'CC7.3', title: 'Security Incident Evaluation', description: 'The entity evaluates security events to determine whether they could or have resulted in a failure of the entity to meet its objectives (security incidents) and, if so, takes actions to prevent or address such failures. Criteria for classifying events as incidents are defined. Security events are evaluated against classification criteria. Incidents are documented and tracked. Root cause analysis is performed for significant incidents.' },
        { id: 'CC7.4', title: 'Incident Response', description: 'The entity responds to identified security incidents by executing a defined incident response program to understand, contain, remediate, and communicate security incidents, as appropriate. An incident response plan is established and tested. Incident response roles and responsibilities are defined. Communication procedures include notification to affected parties and regulatory bodies as required. Post-incident reviews are conducted to improve response capabilities.' },
        { id: 'CC7.5', title: 'Security Incident Recovery', description: 'The entity identifies, develops, and implements activities to recover from identified security incidents. Recovery objectives (RTO/RPO) are defined. Recovery procedures are documented and tested. Data backup processes ensure recoverability. Business continuity plans address security incidents. Lessons learned from recovery activities are incorporated into future planning.' },
      ],
    },
    {
      id: 'CC8',
      name: 'Change Management',
      trust_service_category: 'Security',
      description: 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.',
      criteria: [
        { id: 'CC8.1', title: 'Change Management Process', description: 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures to meet its change management objectives. Formal change management policies and procedures are established. Changes are documented with business justification, risk assessment, and rollback plans. Testing is performed in non-production environments. Approval is obtained from appropriate parties prior to implementation. Emergency change procedures address urgent situations while maintaining appropriate controls.' },
      ],
    },
    {
      id: 'CC9',
      name: 'Risk Mitigation',
      trust_service_category: 'Security',
      description: 'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions and from the use of vendors and business partners.',
      criteria: [
        { id: 'CC9.1', title: 'Business Disruption Risk Mitigation', description: 'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions. Business impact analysis identifies critical processes and systems. Business continuity and disaster recovery plans are developed, tested, and updated. Redundant systems and infrastructure support continuity. Insurance and other financial risk transfer mechanisms are considered.' },
        { id: 'CC9.2', title: 'Vendor and Business Partner Risk Management', description: 'The entity assesses and manages risks associated with vendors and business partners. Vendor risk assessments are performed prior to engagement and periodically thereafter. Contracts include security and privacy requirements. Vendor compliance with security requirements is monitored. SOC reports and other third-party assurance evidence are reviewed. Vendor access to systems and data is controlled and monitored.' },
      ],
    },
    {
      id: 'A1',
      name: 'Availability',
      trust_service_category: 'Availability',
      description: 'The entity\'s system is available for operation and use to meet the entity\'s objectives.',
      criteria: [
        { id: 'A1.1', title: 'Capacity Management', description: 'The entity maintains, monitors, and evaluates current processing capacity and use of system components (infrastructure, data, and software) to manage capacity demand and to enable the implementation of additional capacity to help meet its availability objectives. Capacity planning processes project future needs. Utilization thresholds trigger review and expansion. Performance metrics are monitored. Scalability mechanisms (auto-scaling, load balancing) are implemented.' },
        { id: 'A1.2', title: 'Environmental Protections and Recovery Infrastructure', description: 'The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup processes, and recovery infrastructure to meet its availability objectives. Environmental controls protect physical infrastructure. Redundant power, cooling, and connectivity are implemented. Data backup processes are defined, automated, and verified. Recovery infrastructure is maintained in a separate location.' },
        { id: 'A1.3', title: 'Recovery Plan Testing', description: 'The entity tests recovery plan procedures supporting system recovery to meet its availability objectives. Recovery plans are tested at defined intervals. Tests include failover, backup restoration, and disaster recovery scenarios. Results are documented and gaps are remediated. Lessons learned are incorporated into updated recovery plans.' },
      ],
    },
    {
      id: 'C1',
      name: 'Confidentiality',
      trust_service_category: 'Confidentiality',
      description: 'Information designated as confidential is protected to meet the entity\'s objectives.',
      criteria: [
        { id: 'C1.1', title: 'Identification and Maintenance of Confidential Information', description: 'The entity identifies and maintains confidential information to meet the entity\'s objectives related to confidentiality. Confidential information is identified and classified. Data classification policies define categories and handling requirements. Confidential information is labeled and tracked throughout its lifecycle. Access to confidential information is restricted to authorized parties. Data flows involving confidential information are documented.' },
        { id: 'C1.2', title: 'Disposal of Confidential Information', description: 'The entity disposes of confidential information to meet the entity\'s objectives related to confidentiality. Retention policies define how long confidential information is retained. Disposal procedures ensure confidential information is securely destroyed at the end of its retention period. Certificates of destruction are maintained. Third-party disposal vendors are vetted and their compliance verified.' },
      ],
    },
    {
      id: 'PI1',
      name: 'Processing Integrity',
      trust_service_category: 'Processing Integrity',
      description: 'System processing is complete, valid, accurate, timely, and authorized to meet the entity\'s objectives.',
      criteria: [
        { id: 'PI1.1', title: 'Quality Information for Processing', description: 'The entity obtains or generates, uses, and communicates relevant, quality information regarding the objectives related to processing, including definitions of data processed and product and service specifications, to support the use of products and services. Processing integrity policies define completeness, validity, accuracy, timeliness, and authorization requirements. Quality information supports decision-making and service delivery.' },
        { id: 'PI1.2', title: 'Input Controls', description: 'The entity implements policies and procedures over system inputs, including controls over completeness and accuracy, to result in products, services, and reporting to meet the entity\'s objectives. Input validation controls reject or flag invalid data. Completeness checks ensure all expected data is received. Data entry controls include formatting requirements and range checks. Error handling procedures address rejected inputs.' },
        { id: 'PI1.3', title: 'Processing Controls', description: 'The entity implements policies and procedures over system processing to result in products, services, and reporting to meet the entity\'s objectives. Processing controls ensure transactions are complete, valid, accurate, timely, and authorized. Automated controls enforce business rules. Exception reports identify processing errors. Reconciliation procedures confirm processing completeness.' },
        { id: 'PI1.4', title: 'Output Controls', description: 'The entity implements policies and procedures to make available or deliver output completely, accurately, and timely in accordance with specifications to meet the entity\'s objectives. Output validation ensures accuracy and completeness before delivery. Distribution controls limit output to authorized recipients. Output logs are maintained to support accountability. Error correction procedures address output deficiencies.' },
        { id: 'PI1.5', title: 'Storage Controls', description: 'The entity implements policies and procedures to store inputs, items in processing, and outputs completely, accurately, and timely in accordance with system specifications to meet the entity\'s objectives. Data storage controls ensure integrity throughout the data lifecycle. Checksums and hash verification detect data corruption. Storage redundancy prevents data loss. Audit trails track data access and modifications.' },
      ],
    },
    {
      id: 'P1',
      name: 'Privacy Notice',
      trust_service_category: 'Privacy',
      description: 'The entity provides notice to data subjects about its privacy practices.',
      criteria: [
        { id: 'P1.1', title: 'Privacy Notice', description: 'The entity provides notice to data subjects about its privacy practices to meet the entity\'s objectives related to privacy. A privacy notice is provided that describes: types of personal information collected, purposes for collection and use, choices available to data subjects, third parties to whom personal information is disclosed, how personal information is protected, retention practices, how data subjects may submit inquiries or complaints, and how data subjects are notified of changes to the privacy notice.' },
      ],
    },
    {
      id: 'P2',
      name: 'Choice and Consent',
      trust_service_category: 'Privacy',
      description: 'The entity communicates choices available regarding the collection, use, retention, disclosure, and disposal of personal information.',
      criteria: [
        { id: 'P2.1', title: 'Choice and Consent', description: 'The entity communicates choices available regarding the collection, use, retention, disclosure, and disposal of personal information to the data subjects and allows data subjects to exercise their choices to meet the entity\'s objectives related to privacy. Explicit consent is obtained where required. Opt-out mechanisms are provided. Consent records are maintained. Choices are honored in a timely manner.' },
      ],
    },
    {
      id: 'P3',
      name: 'Collection',
      trust_service_category: 'Privacy',
      description: 'Personal information is collected consistent with the entity\'s objectives related to privacy.',
      criteria: [
        { id: 'P3.1', title: 'Personal Information Collection', description: 'Personal information is collected consistent with the entity\'s objectives related to privacy. Only personal information necessary for the disclosed purpose is collected (data minimization). Methods of collection are consistent with the privacy notice. Personal information collected is accurate and complete. Data subjects are informed of the purpose of collection at or before the time of collection.' },
        { id: 'P3.2', title: 'Explicit Consent for Sensitive Information', description: 'For information requiring explicit consent, the entity communicates the need for such consent, as well as the consequences of a failure to provide consent, and obtains the consent prior to the collection of the information to meet the entity\'s objectives related to privacy. Sensitive categories of personal information (health, financial, biometric, etc.) require explicit opt-in consent. Consent is documented and verifiable.' },
      ],
    },
    {
      id: 'P4',
      name: 'Use, Retention, and Disposal',
      trust_service_category: 'Privacy',
      description: 'Personal information is limited to the purposes identified in the entity\'s objectives related to privacy.',
      criteria: [
        { id: 'P4.1', title: 'Use Limitation', description: 'The entity limits the use of personal information to the purposes identified in the privacy notice and for which explicit consent has been provided, to meet the entity\'s objectives related to privacy. Use limitation controls prevent personal information from being used for undisclosed purposes. Access controls enforce use restrictions. Audit logs track access and use of personal information.' },
        { id: 'P4.2', title: 'Retention of Personal Information', description: 'The entity retains personal information consistent with the entity\'s objectives related to privacy. Retention schedules define how long each category of personal information is retained. Retention periods are based on legal requirements, business needs, and privacy considerations. Automated processes enforce retention schedules. Retention practices are disclosed in the privacy notice.' },
        { id: 'P4.3', title: 'Disposal of Personal Information', description: 'The entity securely disposes of personal information to meet the entity\'s objectives related to privacy. Personal information is disposed of at the end of its retention period using secure methods. Disposal methods prevent unauthorized access to disposed information. Third-party disposal is managed through vendor agreements. Disposal records are maintained.' },
      ],
    },
    {
      id: 'P5',
      name: 'Access',
      trust_service_category: 'Privacy',
      description: 'The entity grants identified and authenticated data subjects the ability to access their stored personal information.',
      criteria: [
        { id: 'P5.1', title: 'Data Subject Access', description: 'The entity grants identified and authenticated data subjects the ability to access their stored personal information for review and, upon request, provides physical or electronic copies of that information to data subjects to meet the entity\'s objectives related to privacy. Processes enable data subjects to request and receive their personal information. Identity verification prevents unauthorized access. Responses are provided within defined timeframes. A log of access requests and responses is maintained.' },
        { id: 'P5.2', title: 'Correction of Personal Information', description: 'The entity corrects, amends, or appends personal information based on information provided by data subjects and communicates related information to third parties, if any, to meet the entity\'s objectives related to privacy. Processes allow data subjects to dispute the accuracy of their personal information. Corrections are made in a timely manner. Third parties who received inaccurate information are notified of corrections.' },
      ],
    },
    {
      id: 'P6',
      name: 'Disclosure and Notification',
      trust_service_category: 'Privacy',
      description: 'The entity discloses personal information to third parties with the explicit consent of data subjects or as required by law.',
      criteria: [
        { id: 'P6.1', title: 'Third-Party Disclosure', description: 'The entity discloses personal information to third parties with the prior consent of data subjects or as required by law, to meet the entity\'s objectives related to privacy. Disclosures are limited to the purposes disclosed in the privacy notice. Contracts govern third-party use of personal information. Third-party disclosures are logged and tracked.' },
        { id: 'P6.2', title: 'Record of Authorized Disclosures', description: 'The entity creates and retains a complete, accurate, and timely record of authorized disclosures of personal information to meet the entity\'s objectives related to privacy. Disclosure logs capture the recipient, date, nature of information, and authorization basis. Logs are protected from unauthorized modification. Records are retained per the entity\'s retention policy.' },
        { id: 'P6.3', title: 'Record of Unauthorized Disclosures', description: 'The entity creates and retains a complete, accurate, and timely record of detected or reported unauthorized disclosures of personal information to meet the entity\'s objectives related to privacy. Unauthorized disclosure incidents are documented. Records support breach notification requirements. Post-incident reviews identify control improvements.' },
        { id: 'P6.4', title: 'Third-Party Privacy Commitments', description: 'The entity obtains privacy commitments from vendors and other third parties who have access to personal information to meet the entity\'s objectives related to privacy. Contracts with third parties include privacy and security requirements. Third-party compliance with privacy commitments is monitored. Due diligence is performed before engaging third parties with access to personal information.' },
        { id: 'P6.5', title: 'Breach Notification to Vendors', description: 'The entity obtains commitments from vendors and other third parties to notify the entity in the event of actual or suspected unauthorized disclosures of personal information within a time period and in a manner consistent with the entity\'s objectives and the entity\'s policies related to privacy. Vendor contracts include breach notification requirements. Notification timelines are defined and enforced.' },
        { id: 'P6.6', title: 'Breach Notification to Data Subjects', description: 'The entity provides notification of breaches and incidents to affected data subjects, regulators, and others to meet the entity\'s objectives related to privacy. Breach notification policies define triggers, timelines, and required content. Notifications are provided within legally required timeframes. Regulatory notifications are managed in coordination with legal counsel.' },
        { id: 'P6.7', title: 'Accounting of Disclosures', description: 'The entity provides data subjects with an accounting of the personal information held and disclosure made about them upon their request to meet the entity\'s objectives related to privacy. Processes enable data subjects to request an accounting of disclosures. Records support the production of disclosure accountings. Responses are provided within defined timeframes.' },
      ],
    },
    {
      id: 'P7',
      name: 'Quality',
      trust_service_category: 'Privacy',
      description: 'The entity collects and maintains accurate, up-to-date, complete, and relevant personal information.',
      criteria: [
        { id: 'P7.1', title: 'Accuracy and Quality of Personal Information', description: 'The entity collects and maintains accurate, up-to-date, complete, and relevant personal information to meet the entity\'s objectives related to privacy. Data quality controls ensure personal information is accurate at collection. Processes allow data subjects to update their information. Periodic data quality reviews identify and correct inaccurate information. Data quality metrics are monitored.' },
      ],
    },
    {
      id: 'P8',
      name: 'Monitoring and Enforcement',
      trust_service_category: 'Privacy',
      description: 'The entity monitors compliance with its privacy policies and procedures and has procedures to address privacy-related complaints and disputes.',
      criteria: [
        { id: 'P8.1', title: 'Privacy Complaint Management', description: 'The entity implements a process for receiving, addressing, resolving, and communicating the resolution of inquiries and complaints from data subjects and others and periodically monitors compliance with the entity\'s privacy policies and procedures and its privacy commitments to meet the entity\'s objectives related to privacy. A privacy complaint process is established and communicated to data subjects. Complaints are tracked and resolved within defined timeframes. Privacy compliance is monitored through audits and reviews. Non-compliance is remediated promptly.' },
      ],
    },
  ],
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Look up framework
    const { data: framework, error: fwError } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'SOC 2')
      .single();

    if (fwError || !framework) {
      return new Response(
        JSON.stringify({ error: 'SOC 2 framework not found — run seed SQL first', details: fwError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up source
    const { data: sources } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', framework.id)
      .limit(1);

    const source = sources?.[0] ?? null;
    if (!source) {
      return new Response(
        JSON.stringify({ error: 'SOC 2 source not found — run seed SQL first' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create ingest job
    const { data: job } = await supabase
      .from('ingest_jobs')
      .insert({ source_id: source.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();

    let documentsIngested = 0;

    for (const category of TSC_DATA.categories) {
      // Delete existing docs for this category (idempotent)
      await supabase.from('documents')
        .delete()
        .eq('framework_id', framework.id)
        .eq('metadata->>category_id', category.id);

      // Category overview document
      const categoryContent = [
        `# SOC 2 — ${category.id}: ${category.name}`,
        ``,
        `Trust Service Category: ${category.trust_service_category}`,
        `Category: ${category.name} (${category.id})`,
        `Framework: SOC 2 (AICPA Trust Services Criteria 2017, updated 2022)`,
        ``,
        category.description,
        ``,
        `## Criteria in this Category`,
        ...category.criteria.map(c => `- **${c.id}** — ${c.title}`),
      ].join('\n');

      const { data: catDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `SOC 2 — ${category.id}: ${category.name}`,
        document_type: 'framework',
        url: 'https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services',
        version: '2017 (updated 2022)',
        raw_content: categoryContent,
        metadata: {
          category_id: category.id,
          category_name: category.name,
          trust_service_category: category.trust_service_category,
          document_level: 'category',
        },
        is_indexed: true,
      }).select('id').single();

      if (catDoc) {
        const embedding = await generateEmbedding(categoryContent);
        await supabase.from('document_chunks').insert({
          document_id: catDoc.id,
          chunk_index: 0,
          content: categoryContent,
          metadata: { category_id: category.id, category_name: category.name },
          embedding,
        });
        documentsIngested++;
      }

      // Individual criteria
      for (const criterion of category.criteria) {
        const criterionContent = [
          `# ${criterion.id} — ${criterion.title}`,
          ``,
          `Trust Service Category: ${category.trust_service_category}`,
          `Category: ${category.name} (${category.id})`,
          `Criterion ID: ${criterion.id}`,
          `Framework: SOC 2 (AICPA Trust Services Criteria)`,
          ``,
          `## Criterion Requirement`,
          criterion.description,
        ].join('\n');

        const { data: critDoc } = await supabase.from('documents').insert({
          source_id: source.id,
          framework_id: framework.id,
          title: `${criterion.id} — ${criterion.title}`,
          document_type: 'control',
          url: 'https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services',
          version: '2017 (updated 2022)',
          raw_content: criterionContent,
          metadata: {
            criterion_id: criterion.id,
            control_id: criterion.id,
            criterion_title: criterion.title,
            category_id: category.id,
            category_name: category.name,
            trust_service_category: category.trust_service_category,
            document_level: 'criterion',
          },
          is_indexed: true,
        }).select('id').single();

        if (critDoc) {
          const embedding = await generateEmbedding(criterionContent);
          await supabase.from('document_chunks').insert({
            document_id: critDoc.id,
            chunk_index: 0,
            content: criterionContent,
            metadata: { criterion_id: criterion.id, category_id: category.id },
            embedding,
          });
          documentsIngested++;
        }
      }
    }

    // Update ingest job
    if (job) {
      await supabase.from('ingest_jobs').update({
        status: 'completed',
        documents_ingested: documentsIngested,
        completed_at: new Date().toISOString(),
      }).eq('id', job.id);

      await supabase.from('sources').update({
        last_scraped_at: new Date().toISOString(),
        next_refresh_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq('id', source.id);
    }

    return new Response(
      JSON.stringify({ success: true, documents_ingested: documentsIngested }),
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
