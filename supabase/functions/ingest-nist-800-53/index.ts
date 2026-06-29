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

// NIST SP 800-53 Rev 5 — all 20 control families
const NIST_800_53_FAMILIES = [
  {
    id: 'AC',
    name: 'Access Control',
    description: 'The Access Control family establishes requirements for limiting system access to authorized users, processes, and devices, and controlling access to system functions and information based on approved authorizations.',
    controls: [
      {
        id: 'AC-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate an access control policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance; and procedures to facilitate the implementation of the access control policy and associated controls.',
        guidance: 'Access control policy and procedures address the controls in the AC family implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance.',
      },
      {
        id: 'AC-2',
        title: 'Account Management',
        description: 'Define and document the types of accounts allowed; establish, activate, modify, review, disable, and remove accounts; and notify account managers within a defined time period when accounts are no longer required.',
        guidance: 'Examples of system account types include individual, shared, group, system, guest, anonymous, emergency, developer, temporary, and service. Account management includes identification of authorized users, group and role memberships, and access authorizations. Organizations should also monitor privileged account usage.',
      },
      {
        id: 'AC-3',
        title: 'Access Enforcement',
        description: 'Enforce approved authorizations for logical access to information and system resources in accordance with applicable access control policies.',
        guidance: 'Access control policies control access between active entities (subjects) and passive entities (objects) within systems. Enforcement mechanisms include access control lists, access control matrices, cryptography, and discretionary/mandatory/attribute-based access controls.',
      },
      {
        id: 'AC-4',
        title: 'Information Flow Enforcement',
        description: 'Enforce approved authorizations for controlling the flow of information within the system and between connected systems based on information flow control policies.',
        guidance: 'Information flow control regulates where information can travel within a system and between systems. Flow control policies and enforcement mechanisms are commonly used to prevent exfiltration of sensitive data, enforce data sovereignty, and implement network segmentation.',
      },
      {
        id: 'AC-5',
        title: 'Separation of Duties',
        description: 'Separate the duties of individuals; document separation of duties of individuals; and implement separation of duties through assigned information system access authorizations.',
        guidance: 'Separation of duties addresses the potential for abuse of authorized privileges and helps to reduce the risk of malevolent activity. Examples include separating mission functions from information security functions, separating key management from encryption operations, and requiring dual authorization for critical actions.',
      },
      {
        id: 'AC-6',
        title: 'Least Privilege',
        description: 'Employ the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) which are necessary to accomplish assigned organizational tasks.',
        guidance: 'Organizations employ least privilege for specific duties and information systems. Least privilege is applied to the development, implementation, and operation of organizational systems. Organizations consider the creation of additional processes, roles, and system accounts as necessary to achieve least privilege.',
      },
      {
        id: 'AC-7',
        title: 'Unsuccessful Logon Attempts',
        description: 'Enforce a limit of consecutive invalid logon attempts by a user during a time period; and automatically lock the account or node for a defined time period, lock the account or node until released by an administrator, or delay the next logon prompt.',
        guidance: 'Due to the potential for denial of service, automatic lockouts are usually temporary and automatically release after a time period. If a delay algorithm is selected, organizations may employ progressively longer delays.',
      },
      {
        id: 'AC-8',
        title: 'System Use Notification',
        description: 'Display an approved system use notification message or banner before granting access to the system that provides privacy and security notices consistent with applicable laws, directives, regulations, and policies.',
        guidance: 'System use notifications can be implemented using messages or warning banners displayed before individuals log in to systems. Notification messages inform potential users that the system is only for authorized use and that unauthorized use is subject to criminal and civil penalties.',
      },
      {
        id: 'AC-11',
        title: 'Device Lock',
        description: 'Prevent further access to the system by initiating a device lock after a defined time period of inactivity or upon receiving a request from a user; and retain the device lock until the user reestablishes access using authentication procedures.',
        guidance: 'Device locks are not an acceptable substitute for logging out of systems when sessions are complete. Authentication of users is used when unlocking devices. Device locks may be implemented at the operating system and application levels.',
      },
      {
        id: 'AC-12',
        title: 'Session Termination',
        description: 'Automatically terminate a user session after a defined set of conditions or trigger events requiring session disconnect.',
        guidance: 'Session termination addresses the termination of user-initiated logical sessions as opposed to service termination. Conditions or trigger events include inactivity, targeted responses to anomalies including hostile attacks, and the duration of a session.',
      },
      {
        id: 'AC-17',
        title: 'Remote Access',
        description: 'Establish and document usage restrictions, configuration and connection requirements, and implementation guidance for each type of remote access allowed; and authorize each type of remote access before allowing such connections.',
        guidance: 'Remote access is access to organizational systems by users (or processes acting on behalf of users) communicating through external networks. Types of remote access include dial-up, broadband, and wireless. Organizations use encrypted VPNs to enhance remote access confidentiality and integrity.',
      },
      {
        id: 'AC-18',
        title: 'Wireless Access',
        description: 'Establish configuration requirements, connection requirements, and implementation guidance for wireless access; and authorize wireless access to the system before allowing such connections.',
        guidance: 'Wireless technologies include microwave, packet radio (ultra-high frequency and very high frequency), 802.11x, and Bluetooth. Organizations use wireless scanners to identify unauthorized wireless access points and networks.',
      },
      {
        id: 'AC-19',
        title: 'Access Control for Mobile Devices',
        description: 'Establish configuration requirements, connection requirements, and implementation guidance for organization-controlled mobile devices; and authorize the connection of mobile devices to organizational systems.',
        guidance: 'Mobile devices include smartphones, tablets, and e-readers. Organizations establish policies and procedures governing the use of mobile devices and enforce requirements through technical and procedural controls, including mobile device management (MDM) solutions.',
      },
      {
        id: 'AC-20',
        title: 'Use of External Systems',
        description: 'Establish terms and conditions, consistent with any trust relationships established with other organizations owning, operating, and maintaining external systems; and permit authorized individuals to access the system from external systems.',
        guidance: 'External systems include personally owned systems, systems operated by contractors, and systems owned and operated by other government agencies. Organizations establish terms and conditions for use of external systems through interconnection security agreements, memoranda of understanding, and other agreements.',
      },
    ],
  },
  {
    id: 'AT',
    name: 'Awareness and Training',
    description: 'The Awareness and Training family ensures that managers and users of organizational systems are made aware of security and privacy risks and are trained to fulfill their security and privacy responsibilities.',
    controls: [
      {
        id: 'AT-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate an awareness and training policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance.',
        guidance: 'Awareness and training policy and procedures address the controls in the AT family. The risk management strategy is an important factor in establishing such policies and procedures.',
      },
      {
        id: 'AT-2',
        title: 'Literacy Training and Awareness',
        description: 'Provide security and privacy literacy training to system users (including managers, senior executives, and contractors) as part of initial training for new users and when required by system changes; and include practical exercises in literacy training to simulate events.',
        guidance: 'Organizations determine the content of literacy training and awareness based on specific organizational requirements and the systems to which personnel have authorized access. Content includes rules of behavior, protection of information, insider threats, password management, and individual accountability.',
      },
      {
        id: 'AT-3',
        title: 'Role-Based Training',
        description: 'Provide role-based security and privacy training to personnel with assigned security and privacy roles and responsibilities before authorizing access to the system, sensitive data, or security functions; when required by system changes; and thereafter at a defined frequency.',
        guidance: 'Organizations determine the content of training based on assigned roles and responsibilities and the security and privacy requirements for those roles. Role-based training addresses specific security and privacy responsibilities that are unique to each role. Examples include system owners, security personnel, developers, and incident response teams.',
      },
      {
        id: 'AT-4',
        title: 'Training Records',
        description: 'Document and monitor information security and privacy training activities including security and privacy awareness training and specific role-based security and privacy training; and retain individual training records for a defined time period.',
        guidance: 'Documentation of training activities may be maintained in paper or electronic form. Training records include dates of training completions, content of training, and signatures of attendees or electronic confirmations of completion.',
      },
    ],
  },
  {
    id: 'AU',
    name: 'Audit and Accountability',
    description: 'The Audit and Accountability family establishes requirements for creating, protecting, and retaining system audit records to enable the monitoring, analysis, investigation, and reporting of unlawful, unauthorized, or inappropriate system activity.',
    controls: [
      {
        id: 'AU-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate an audit and accountability policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Audit and accountability policy and procedures address the controls in the AU family. The risk management strategy is an important factor in establishing such policies and procedures.',
      },
      {
        id: 'AU-2',
        title: 'Event Logging',
        description: 'Identify the types of events that the system is capable of logging in support of the audit function; coordinate event logging with other organizations requiring audit-related information; and specify the following event types for logging within the system.',
        guidance: 'Audit log contents may include time stamps, source and destination addresses, user identities, event descriptions, success or failure indications, and filenames involved. Organizations consider log volume, performance impact, and retention requirements when defining event types.',
      },
      {
        id: 'AU-3',
        title: 'Content of Audit Records',
        description: 'Ensure that audit records contain information that establishes what type of event occurred, when the event occurred, where the event occurred, the source of the event, the outcome of the event, and the identity of any individuals, subjects, or objects associated with the event.',
        guidance: 'Audit record content that may be necessary to satisfy audit requirements includes event type, time stamps, source and destination addresses, identities, and the outcome. Different system components provide different event types.',
      },
      {
        id: 'AU-4',
        title: 'Audit Log Storage Capacity',
        description: 'Allocate audit log storage capacity to accommodate defined audit log retention requirements.',
        guidance: 'Organizations consider the types of auditing, age of audit records, and retention requirements when allocating audit log storage capacity. Organizations should also consider compression, deduplication, archiving, and offloading of logs to centralized systems.',
      },
      {
        id: 'AU-5',
        title: 'Response to Audit Logging Process Failures',
        description: 'Alert defined personnel or roles in the event of an audit logging process failure; and take the following additional actions upon failure: shut down the system, overwrite oldest audit records, and stop generating audit records.',
        guidance: 'Audit logging process failures include software and hardware errors, failures in audit capturing mechanisms, and reaching or exceeding audit storage capacity. Organizations weigh the trade-offs of halting system operation versus continuing to operate without audit capability.',
      },
      {
        id: 'AU-6',
        title: 'Audit Record Review, Analysis, and Reporting',
        description: 'Review and analyze system audit records for indications of inappropriate or unusual activity; and report findings to defined personnel or roles.',
        guidance: 'Audit record review and analysis can be done manually or with automated tools. Log analysis tools include security information and event management (SIEM) systems. Automated reviews help detect anomalies and patterns that may indicate attacks or insider threats.',
      },
      {
        id: 'AU-7',
        title: 'Audit Record Reduction and Report Generation',
        description: 'Provide an audit record reduction and report generation capability that supports on-demand analysis and reporting of audit records and does not alter the original content or time ordering of audit records.',
        guidance: 'Audit record reduction is a process that manipulates collected audit log information and organizes that information in a summary format. Report generation is a process that provides on-demand reports in various formats including text, comma-separated values, and XML.',
      },
      {
        id: 'AU-8',
        title: 'Time Stamps',
        description: 'Use internal system clocks to generate time stamps for audit records; and record time stamps for audit records that meet defined granularity of time measurement and that use Coordinated Universal Time, have offset from Coordinated Universal Time, or use local time.',
        guidance: 'Time stamps generated by the system include date and time. Time is expressed in Coordinated Universal Time (UTC), also known as Greenwich Mean Time (GMT). Granularity of time measurements refers to seconds, milliseconds, or microseconds.',
      },
      {
        id: 'AU-9',
        title: 'Protection of Audit Information',
        description: 'Protect audit information and audit tools from unauthorized access, modification, and deletion; and alert defined personnel or roles upon detection of unauthorized access, modification, or deletion of audit information.',
        guidance: 'Audit information includes log files, audit reports, and related tools. Organizations protect audit information from unauthorized access, modification, and deletion by using access controls, separating audit functions from other organizational functions, and using cryptographic checksums.',
      },
      {
        id: 'AU-10',
        title: 'Non-repudiation',
        description: 'Provide irrefutable evidence that an individual (or process acting on behalf of an individual) has performed a defined action on the system.',
        guidance: 'Types of individual actions covered include creating, sending, and receiving messages; approving system data, such as purchase orders and benefit disbursement packages; and generating data or signing/authenticating records. Non-repudiation protects individuals against later false denials of having taken specific actions.',
      },
      {
        id: 'AU-11',
        title: 'Audit Record Retention',
        description: 'Retain audit records for a defined time period to provide support for after-the-fact investigations of security incidents.',
        guidance: 'Organizations retain audit records until it is determined that they are no longer needed. Retention requirements include the number of months or years that audit records must be kept, as well as requirements for off-site backup and record disposal.',
      },
      {
        id: 'AU-12',
        title: 'Audit Record Generation',
        description: 'Provide audit record generation capability for the event types specified in AU-2; allow defined personnel or roles to select the event types that are to be logged by specific components of the system; and generate audit records for the specified event types.',
        guidance: 'Audit record generation requirements specify which system components are to generate audit records. Organizations should consider the performance impact of enabling audit record generation for all system components and activities.',
      },
    ],
  },
  {
    id: 'CA',
    name: 'Assessment, Authorization, and Monitoring',
    description: 'The CA family establishes requirements for assessing controls, authorizing system operation, and continuously monitoring the security and privacy of systems.',
    controls: [
      {
        id: 'CA-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate an assessment, authorization, and monitoring policy addressing purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Assessment, authorization, and monitoring policy and procedures address the controls in the CA family. The risk management strategy is an important factor in establishing such policies and procedures.',
      },
      {
        id: 'CA-2',
        title: 'Control Assessments',
        description: 'Select the appropriate assessor or assessment team for the type of assessment to be conducted; develop a control assessment plan that describes the scope, procedures, and schedule; assess the controls in the system and environment of operation to determine the extent to which the controls are implemented correctly and operating as intended.',
        guidance: 'Control assessments are part of the RMF. Organizations can use external assessment organizations or internal staff. Assessment procedures include examination, interview, and testing. Assessment results are documented in security and privacy assessment reports.',
      },
      {
        id: 'CA-3',
        title: 'Information Exchange',
        description: 'Approve and manage the exchange of information between the system and other systems using interconnection security agreements, information exchange security agreements, memoranda of understanding or agreement, service level agreements, user agreements, non-disclosure agreements, or other types of agreements.',
        guidance: 'Organizations carefully consider the risks associated with allowing external systems to access organizational systems or sharing information across system boundaries. Information exchange agreements include requirements for protecting information exchanged.',
      },
      {
        id: 'CA-5',
        title: 'Plan of Action and Milestones',
        description: 'Develop a plan of action and milestones for the system to document the planned remediation actions of the organization to correct weaknesses or deficiencies noted during the assessment of the controls.',
        guidance: 'Plans of action and milestones (POA&Ms) are key documents in the RMF. Organizations use POA&Ms to track the progress of remediation efforts. POA&Ms include weakness descriptions, corrective action descriptions, responsible parties, estimated completion dates, and milestones.',
      },
      {
        id: 'CA-6',
        title: 'Authorization',
        description: 'Assign a senior official as the authorizing official for the system; ensure that the authorizing official authorizes the system for processing before commencing operations; and update the authorization when significant changes occur.',
        guidance: 'Authorization is an official management decision given by a senior organizational official to authorize operation of an information system and to explicitly accept the risk to organizational operations, assets, individuals, other organizations, and the Nation.',
      },
      {
        id: 'CA-7',
        title: 'Continuous Monitoring',
        description: 'Develop a system-level continuous monitoring strategy and implement continuous monitoring in accordance with the organizational continuous monitoring strategy that includes metrics, monitoring frequencies, assessment of security and privacy controls, reporting requirements, and an ongoing assessment program.',
        guidance: 'Continuous monitoring programs allow organizations to maintain the security authorization of systems over time. Continuous monitoring includes ongoing assessment of controls, situational awareness of threats and vulnerabilities, and security status reporting.',
      },
      {
        id: 'CA-8',
        title: 'Penetration Testing',
        description: 'Conduct penetration testing on defined systems or system components at a defined frequency.',
        guidance: 'Penetration testing is a specialized type of assessment conducted on systems or individual system components to identify vulnerabilities that could be exploited by adversaries. Penetration testing goes beyond automated vulnerability scanning and allows testers to follow attack paths.',
      },
      {
        id: 'CA-9',
        title: 'Internal System Connections',
        description: 'Authorize internal connections of defined system components or classes of components to the system; document interface characteristics, security and privacy requirements, and the nature of the information communicated for internal system connections.',
        guidance: 'This control addresses connections between organizational systems and components within those systems. System components that may require explicit authorization include servers, workstations, printers, and other networked devices.',
      },
    ],
  },
  {
    id: 'CM',
    name: 'Configuration Management',
    description: 'The Configuration Management family establishes requirements for maintaining baseline configurations, controlling system changes, and enforcing security configuration settings throughout the system development lifecycle.',
    controls: [
      {
        id: 'CM-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a configuration management policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Configuration management policy and procedures address the controls in the CM family. The risk management strategy is an important factor in establishing such policies and procedures.',
      },
      {
        id: 'CM-2',
        title: 'Baseline Configuration',
        description: 'Develop, document, and maintain under configuration control, a current baseline configuration of the system; and review and update the baseline configuration at a defined frequency, when required due to system changes, and as an integral part of system component installations and upgrades.',
        guidance: 'Baseline configurations include information about system components such as standard software packages, patch levels, and configuration settings. Baseline configurations serve as the foundation for defining acceptable configurations and provide a means for organizations to determine deviations.',
      },
      {
        id: 'CM-3',
        title: 'Configuration Change Control',
        description: 'Determine the types of changes to the system that are configuration-controlled; review proposed configuration-controlled changes to the system and approve or disapprove; document configuration change decisions; implement approved configuration-controlled changes.',
        guidance: 'Configuration change control does not prevent changes from being made; it ensures that changes are properly reviewed and that unintended security impacts are identified before implementation. Change control boards or similar organizational groups are used to review and approve proposed changes.',
      },
      {
        id: 'CM-4',
        title: 'Impact Analyses',
        description: 'Analyze changes to the system to determine potential security and privacy impacts prior to change implementation.',
        guidance: 'Organizational personnel with information security and privacy responsibilities conduct impact analyses. Impact analyses include reviewing security and privacy plans, risk assessment reports, system test data, and other relevant documents.',
      },
      {
        id: 'CM-5',
        title: 'Access Restrictions for Change',
        description: 'Define, document, approve, and enforce physical and logical access restrictions associated with changes to the system.',
        guidance: 'Changes to hardware, software, and firmware components of systems can have significant effects on overall security. Access restrictions for changes include physical and logical controls to limit who can make changes to system components.',
      },
      {
        id: 'CM-6',
        title: 'Configuration Settings',
        description: 'Establish and document configuration settings for components employed within the system that reflect the most restrictive mode consistent with operational requirements; implement the configuration settings; identify, document, and approve any deviations from established configuration settings.',
        guidance: 'Configuration settings are the set of parameters that can be changed in hardware, software, or firmware components that affect the security posture or functionality of the system. Security checklists from NIST, DISA STIGs, and CIS Benchmarks provide guidance for establishing secure configurations.',
      },
      {
        id: 'CM-7',
        title: 'Least Functionality',
        description: 'Configure the system to provide only essential capabilities; and prohibit or restrict the use of functions, ports, protocols, software, and services not required.',
        guidance: 'Systems can provide a wide variety of functions and services. Organizations identify functions, ports, protocols, and services that are not required and disable those capabilities. This includes removing or disabling unused software features, unnecessary services, and default accounts.',
      },
      {
        id: 'CM-8',
        title: 'System Component Inventory',
        description: 'Develop and document an inventory of system components that accurately reflects the system; includes all components within the system; is at the level of granularity deemed necessary for tracking and reporting; and includes defined information deemed necessary.',
        guidance: 'System component inventories do not have to be implemented as a single document. Inventories can be automated using vulnerability scanning tools, discovery tools, and other mechanisms. Organizations consider hardware, software, and firmware components.',
      },
      {
        id: 'CM-9',
        title: 'Configuration Management Plan',
        description: 'Develop, document, and implement a configuration management plan for the system that addresses roles, responsibilities, and configuration management processes and procedures; establishes a process for identifying configuration items throughout the system development lifecycle; defines the configuration items for the system and places the configuration items under configuration management.',
        guidance: 'Configuration management plans satisfy the requirements in configuration management policies while being tailored to individual systems. Configuration management plans provide detailed plans for how configuration management is implemented within an organization.',
      },
      {
        id: 'CM-10',
        title: 'Software Usage Restrictions',
        description: 'Use software and associated documentation in accordance with contract agreements and copyright laws; track the use of software protected by quantity licenses to control copying and distribution; and control and document the use of peer-to-peer file sharing technology.',
        guidance: 'Software license tracking can be accomplished by asset management software or manual audit of installed software. Organizations should define processes for validating that installed software is properly licensed.',
      },
      {
        id: 'CM-11',
        title: 'User-Installed Software',
        description: 'Establish policies governing the installation of software by users; enforce software installation policies; and monitor policy compliance at a defined frequency.',
        guidance: 'If provided the necessary privileges, users have the ability to install software in organizational systems. To maintain control over the software installed, organizations ensure that only authorized software is installed. User-installed software policies may allow certain types of software while prohibiting others.',
      },
    ],
  },
  {
    id: 'CP',
    name: 'Contingency Planning',
    description: 'The Contingency Planning family establishes requirements for developing and implementing plans for emergency response, backup operations, and post-disaster recovery to ensure the availability of critical resources and continuity of operations.',
    controls: [
      {
        id: 'CP-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a contingency planning policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Contingency planning policy and procedures address the controls in the CP family.',
      },
      {
        id: 'CP-2',
        title: 'Contingency Plan',
        description: 'Develop a contingency plan for the system that identifies essential missions and business functions and associated contingency requirements; provides recovery objectives, restoration priorities, and metrics; addresses contingency roles, responsibilities, and assigned individuals with contact information; addresses maintaining essential missions and business functions despite a system disruption, compromise, or failure.',
        guidance: 'Contingency planning for systems is part of an overall program for achieving continuity of operations for organizational missions and business functions. Organizations conduct business impact analyses to identify key system components.',
      },
      {
        id: 'CP-3',
        title: 'Contingency Training',
        description: 'Provide contingency training to system users consistent with assigned roles and responsibilities within a defined time period of assuming contingency role or responsibility; when required by system changes; and thereafter at a defined frequency.',
        guidance: 'Contingency training provided by organizations is linked to the contingency roles and responsibilities assigned to organizational personnel. Organizations use different types of training methods, including classroom instruction and tabletop exercises.',
      },
      {
        id: 'CP-4',
        title: 'Contingency Plan Testing',
        description: 'Test the contingency plan for the system at a defined frequency using defined tests to determine the effectiveness of the plan and the organizational readiness to execute the plan.',
        guidance: 'Methods for testing contingency plans to determine the effectiveness of the plans and to identify potential weaknesses in the plans include checklists, walk-through and tabletop exercises, simulations, and comprehensive exercises.',
      },
      {
        id: 'CP-6',
        title: 'Alternate Storage Site',
        description: 'Establish an alternate storage site, including necessary agreements to permit the storage and retrieval of system backup information; ensure the alternate storage site provides information security safeguards equivalent to that of the primary site.',
        guidance: 'Alternate storage sites are sites that are geographically distinct from primary storage sites. Organizations ensure that alternate storage sites provide the security safeguards required to protect system backup information.',
      },
      {
        id: 'CP-7',
        title: 'Alternate Processing Site',
        description: 'Establish an alternate processing site; ensure that equipment and supplies required to transfer and resume operations are available at the alternate processing site; and ensure the alternate processing site provides information security safeguards equivalent to that of the primary site.',
        guidance: 'Alternate processing sites are sites that are geographically distinct from primary processing sites. Organizations ensure that alternate processing sites provide the security safeguards required to protect organizational operations.',
      },
      {
        id: 'CP-9',
        title: 'System Backup',
        description: 'Conduct backups of user-level information in the system; conduct backups of system-level information in the system; conduct backups of system documentation including security and privacy-related documentation; and protect the confidentiality, integrity, and availability of backup information.',
        guidance: 'System-level information includes system state information, operating system software, middleware, application software, and licenses. User-level information includes information other than system-level information. Sampling-based approaches may be employed to determine if backup copies meet integrity requirements.',
      },
      {
        id: 'CP-10',
        title: 'System Recovery and Reconstitution',
        description: 'Provide for the recovery and reconstitution of the system to a known state within a defined time period after a disruption, compromise, or failure.',
        guidance: 'Recovery is executing contingency plan activities to restore organizational missions and business functions. Reconstitution takes place following recovery and includes activities for returning systems to fully operational states. Recovery and reconstitution operations reflect mission and business priorities, recovery point and time objectives, and reconstitution costs.',
      },
    ],
  },
  {
    id: 'IA',
    name: 'Identification and Authentication',
    description: 'The Identification and Authentication family establishes requirements for identifying and authenticating users, processes, and devices before allowing access to organizational systems.',
    controls: [
      {
        id: 'IA-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate an identification and authentication policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Identification and authentication policy and procedures address the controls in the IA family.',
      },
      {
        id: 'IA-2',
        title: 'Identification and Authentication (Organizational Users)',
        description: 'Uniquely identify and authenticate organizational users and associate that unique identification with processes acting on behalf of those users.',
        guidance: 'Organizations may require authenticators at different levels (AAL1, AAL2, AAL3) per NIST SP 800-63B. Multi-factor authentication requires two or more different factors: something you know (password), something you have (physical authenticator), or something you are (biometric).',
      },
      {
        id: 'IA-3',
        title: 'Device Identification and Authentication',
        description: 'Uniquely identify and authenticate defined devices and/or types of devices before establishing connections.',
        guidance: 'Organizational devices include workstations, servers, smartphones, tablets, and networking equipment. Shared authenticators are not used for device authentication. Device authentication mechanisms may use certificates, cryptographic keys, or vendor-specific protocols.',
      },
      {
        id: 'IA-4',
        title: 'Identifier Management',
        description: 'Manage system identifiers by receiving authorization from defined personnel to assign an identifier; selecting an identifier that identifies an individual, group, role, service, or device; assigning the identifier to the intended entity; preventing reuse of identifiers for a defined time period; and disabling the identifier after a defined time period of inactivity.',
        guidance: 'Identifiers are provided to individuals, groups, roles, services, and devices. Individuals include employees and contractors. Services include web applications and database access services. Devices include computers, mobile devices, and network equipment.',
      },
      {
        id: 'IA-5',
        title: 'Authenticator Management',
        description: 'Manage system authenticators by verifying the identity of the individual, group, role, service, or device receiving the authenticator; establishing initial authenticator content for any authenticators issued; enforcing minimum password complexity and change of characters when new passwords are created; enforcing prohibitions on password reuse.',
        guidance: 'Authenticators include passwords, cryptographic devices, biometrics, and certificates. Organizations establish authenticator management policies and procedures to ensure that authenticators are properly issued, protected, and revoked.',
      },
      {
        id: 'IA-6',
        title: 'Authentication Feedback',
        description: 'Obscure feedback of authentication information during the authentication process to protect the information from possible exploitation and use by unauthorized individuals.',
        guidance: 'Authentication feedback from systems does not provide information that would allow unauthorized individuals to impersonate users or compromise authentication mechanisms. Authentication feedback may denote that authentication was successful or unsuccessful without specifying which part of the authentication process failed.',
      },
      {
        id: 'IA-7',
        title: 'Cryptographic Module Authentication',
        description: 'Implement mechanisms for authentication to a cryptographic module that meet the requirements of applicable laws, executive orders, directives, regulations, policies, standards, and guidelines for such authentication.',
        guidance: 'Authentication mechanisms may be required to protect the keys used for encryption, decryption, key wrapping, key unwrapping, key derivation, and other key management operations. FIPS 140-3 validated cryptographic modules implement authentication mechanisms.',
      },
      {
        id: 'IA-8',
        title: 'Identification and Authentication (Non-Organizational Users)',
        description: 'Uniquely identify and authenticate non-organizational users or processes acting on behalf of non-organizational users.',
        guidance: 'Non-organizational users include system users other than organizational users. Public users are an example of non-organizational users. Non-organizational users are uniquely identified and authenticated for access to systems where authentication is required.',
      },
      {
        id: 'IA-11',
        title: 'Re-authentication',
        description: 'Require users to re-authenticate when defined circumstances or situations requiring re-authentication occur.',
        guidance: 'In addition to the re-authentication requirements associated with device locks, organizations may require re-authentication of individuals in certain situations, including when roles change, when security attributes of a resource change, or when a defined period of inactivity has elapsed.',
      },
      {
        id: 'IA-12',
        title: 'Identity Proofing',
        description: 'Identity proof users that require accounts for logical access to systems based on appropriate identity assurance level requirements as specified in applicable standards and guidelines.',
        guidance: 'Identity proofing is the process of collecting and verifying information about an individual for the purpose of issuing credentials. NIST SP 800-63A provides guidance on identity proofing and enrollment at Identity Assurance Levels (IAL) 1, 2, and 3.',
      },
    ],
  },
  {
    id: 'IR',
    name: 'Incident Response',
    description: 'The Incident Response family establishes requirements for developing an operational incident-handling capability including preparation, detection, analysis, containment, recovery, and user response activities.',
    controls: [
      {
        id: 'IR-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate an incident response policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Incident response policy and procedures address the controls in the IR family.',
      },
      {
        id: 'IR-2',
        title: 'Incident Response Training',
        description: 'Provide incident response training to system users consistent with assigned roles and responsibilities; and review and update incident response training content at a defined frequency.',
        guidance: 'Incident response training is associated with the assigned roles and responsibilities of organizational personnel to ensure that the appropriate content and level of detail is included in such training. For example, users may only need to know who to call or how to recognize an incident.',
      },
      {
        id: 'IR-3',
        title: 'Incident Response Testing',
        description: 'Test the incident response capability for the system at a defined frequency using defined tests and exercises to determine the incident response effectiveness.',
        guidance: 'Organizations test incident response capabilities to determine the overall effectiveness of the capabilities and to identify potential weaknesses or deficiencies. Organizations use checklists, walk-through and tabletop exercises, simulations, and comprehensive exercises.',
      },
      {
        id: 'IR-4',
        title: 'Incident Handling',
        description: 'Implement an incident handling capability for incidents that includes preparation, detection and analysis, containment, eradication, and recovery; coordinate incident handling activities with contingency planning activities; and incorporate lessons learned from ongoing incident handling activities into incident response procedures, training, and testing.',
        guidance: 'Organizations recognize that incident response capabilities are dependent on the capabilities of organizational systems and the mission and business processes being supported. Incident handling processes include coordination with external organizations such as US-CERT, Internet service providers, and contractors.',
      },
      {
        id: 'IR-5',
        title: 'Incident Monitoring',
        description: 'Track and document incidents.',
        guidance: 'Documenting incidents includes maintaining records about each incident, the status of the incident, and other pertinent information necessary for forensics as well as evaluating incident details, trends, and handling. Tracking includes incident-related activities from initial detection and reporting through post-incident activities.',
      },
      {
        id: 'IR-6',
        title: 'Incident Reporting',
        description: 'Require personnel to report suspected incidents to the organizational incident response capability within a defined time period; and report incident information to defined authorities.',
        guidance: 'The types of incidents reported, the content and timeliness of the reports, and the designated reporting authorities reflect applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Suspected incidents may include receiving suspicious email attachments or detecting anomalous activity.',
      },
      {
        id: 'IR-7',
        title: 'Incident Response Assistance',
        description: 'Provide an incident response support resource, integral to the organizational incident response capability, that offers advice and assistance to users of the system for the handling and reporting of incidents.',
        guidance: 'Incident response support resources provided by organizations include help desks, assistance groups, automated ticketing systems, and access to forensics tools, resources, and technical expertise.',
      },
      {
        id: 'IR-8',
        title: 'Incident Response Plan',
        description: 'Develop an incident response plan that provides the organization with a roadmap for implementing its incident response capability; describes the structure and organization of the incident response capability; provides a high-level approach for how the incident response capability fits into the overall organization.',
        guidance: 'The incident response plan includes the following: mission, strategies, and goals of the incident response capability; approach to incident response; metrics for measuring the incident response capability; roadmap for maturing the incident response capability; and how the program fits into the overall organization.',
      },
      {
        id: 'IR-10',
        title: 'Integrated Information Security Analysis Team',
        description: 'Establish an integrated team of forensic and malicious code analysts, tool developers, and real-time operations personnel.',
        guidance: 'Having a dedicated team with specialized expertise for incident response, forensics, and malicious code analysis allows organizations to respond quickly to incidents and analyze malicious code affecting systems and networks.',
      },
    ],
  },
  {
    id: 'MA',
    name: 'Maintenance',
    description: 'The Maintenance family establishes requirements for performing maintenance on organizational systems, controlling maintenance tools, and supervising maintenance personnel.',
    controls: [
      {
        id: 'MA-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a maintenance policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Maintenance policy and procedures address the controls in the MA family.',
      },
      {
        id: 'MA-2',
        title: 'Controlled Maintenance',
        description: 'Schedule, document, and review records of maintenance and repairs on system components in accordance with manufacturer or vendor specifications; approve and monitor all maintenance activities; ensure that maintenance personnel have required access authorization; check all potentially impacted controls to verify that the controls are still functioning properly after maintenance; and include defined maintenance-related information in organizational maintenance records.',
        guidance: 'Maintenance activities for organizational systems include hardware, software, and firmware components. Maintenance policies and procedures address the appropriate types and methods of maintenance, the frequency of maintenance, and who is authorized to perform maintenance.',
      },
      {
        id: 'MA-3',
        title: 'Maintenance Tools',
        description: 'Approve, control, and monitor the use of system maintenance tools; and check the integrity of maintenance tools on a defined frequency to ensure the tools have not been compromised.',
        guidance: 'The term "maintenance tools" refers to hardware and software implements used to diagnose and repair hardware and software faults. Maintenance tools may include diagnostic and test equipment, hardware or software replacements, and other equipment or system components.',
      },
      {
        id: 'MA-4',
        title: 'Nonlocal Maintenance',
        description: 'Approve and monitor nonlocal maintenance and diagnostic activities; allow the use of nonlocal maintenance and diagnostic tools only as consistent with organizational policy; employ strong authenticators in the establishment of nonlocal maintenance and diagnostic sessions; and maintain records for nonlocal maintenance and diagnostic activities.',
        guidance: 'Nonlocal maintenance and diagnostic activities are those activities conducted by individuals communicating through a network. Organizations typically use encrypted virtual private networks (VPNs) to provide secure channels for nonlocal maintenance. Multi-factor authentication is required for remote maintenance access.',
      },
      {
        id: 'MA-5',
        title: 'Maintenance Personnel',
        description: 'Establish a process for maintenance personnel authorization and maintain a list of authorized maintenance organizations and personnel; verify that non-escorted personnel performing maintenance on the system have required access authorizations; and designate organizational personnel with required access authorizations and technical competence to supervise the maintenance activities of personnel who do not possess the required access authorizations.',
        guidance: 'Maintenance personnel refers to individuals who perform hardware or software maintenance on organizational systems, while physical access control is discussed in the PE family. Maintenance personnel who do not have required access authorizations may include vendor maintenance personnel with a need to perform scheduled maintenance.',
      },
      {
        id: 'MA-6',
        title: 'Timely Maintenance',
        description: 'Obtain maintenance support and spare parts for defined system components within a defined time period of failure.',
        guidance: 'Organizations specify the system components that result in increased risk to organizational operations and assets, individuals, other organizations, or the Nation when the functionality provided by those components is not operational. Timely maintenance ensures that critical system components are available when needed.',
      },
    ],
  },
  {
    id: 'MP',
    name: 'Media Protection',
    description: 'The Media Protection family establishes requirements for protecting system media containing information, limiting access to information on media, and sanitizing or destroying media before disposal or reuse.',
    controls: [
      {
        id: 'MP-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a media protection policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Media protection policy and procedures address the controls in the MP family.',
      },
      {
        id: 'MP-2',
        title: 'Media Access',
        description: 'Restrict access to defined types of digital and non-digital media to defined personnel or roles.',
        guidance: 'System media includes digital media such as disks, tapes, removable drives, flash drives, compact disks, and digital video disks, as well as non-digital media such as paper and microfilm. Restrictions on access to media include requiring specific roles to access certain types of media.',
      },
      {
        id: 'MP-3',
        title: 'Media Marking',
        description: 'Mark system media indicating the distribution limitations, handling caveats, and applicable security markings (if any) of the information; and exempt defined types of system media from marking if the media remains within defined controlled areas.',
        guidance: 'The term "security marking" refers to the application or use of human-readable security attributes. The media types that are subject to marking include digital and non-digital media, removable media, and media with special handling requirements.',
      },
      {
        id: 'MP-4',
        title: 'Media Storage',
        description: 'Physically control and securely store defined types of digital and non-digital media within defined controlled areas; and protect system media containing sensitive information during transport.',
        guidance: 'System media includes digital media such as disks, tapes, removable drives, flash/thumb drives, compact disks, and digital video disks, as well as non-digital media such as paper and microfilm. Physically controlling and securely storing system media includes conducting inventories, ensuring procedures are followed for checking out and returning media, and maintaining accountability.',
      },
      {
        id: 'MP-5',
        title: 'Media Transport',
        description: 'Protect and control system media during transport outside of controlled areas using defined controls; maintain accountability for system media during transport outside of controlled areas; and restrict the activities associated with the transport of system media to authorized personnel.',
        guidance: 'System media includes digital media such as disks, tapes, removable drives, flash drives, compact disks, and digital video disks, as well as non-digital media such as paper and microfilm. Protecting and controlling system media during transport includes encrypting information on digital media and using tamper-evident packaging for non-digital media.',
      },
      {
        id: 'MP-6',
        title: 'Media Sanitization',
        description: 'Sanitize defined system media prior to disposal, release out of organizational control, or release for reuse using defined sanitization techniques and procedures; employ sanitization mechanisms with the strength and integrity commensurate with the security category or classification of the information.',
        guidance: 'Media sanitization applies to all digital and non-digital system media subject to disposal or reuse. Organizations use NIST SP 800-88 guidelines for media sanitization. Sanitization techniques include overwriting, degaussing, and physical destruction.',
      },
      {
        id: 'MP-7',
        title: 'Media Use',
        description: 'Restrict the use of defined types of system media on defined systems or system components; and prohibit the use of removable media in organizational systems when the media has no identifiable owner.',
        guidance: 'System media includes both digital and non-digital media. Digital media includes diskettes, magnetic tapes, flash or thumb drives, compact disks, digital video disks, and removable hard disk drives. Organizations restrict the use of portable storage devices and the connection to external systems.',
      },
    ],
  },
  {
    id: 'PE',
    name: 'Physical and Environmental Protection',
    description: 'The Physical and Environmental Protection family establishes requirements for limiting physical access to systems and the facilities housing them, protecting systems from environmental hazards, and monitoring physical access.',
    controls: [
      {
        id: 'PE-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a physical and environmental protection policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Physical and environmental protection policy and procedures address the controls in the PE family.',
      },
      {
        id: 'PE-2',
        title: 'Physical Access Authorizations',
        description: 'Develop, approve, and maintain a list of individuals with authorized access to the facility where the system resides; issue authorization credentials for facility access; review the access list detailing authorized facility access at a defined frequency; and remove individuals from the facility access list when access is no longer required.',
        guidance: 'Physical access authorizations apply to employees and visitors. Authorization credentials for facility access include badges, identification cards, and smart cards. Organizations maintain physical access control lists that include individuals with authorized access.',
      },
      {
        id: 'PE-3',
        title: 'Physical Access Control',
        description: 'Enforce physical access authorizations at defined entry and exit points to the facility where the system resides; maintain physical access audit logs for defined entry and exit points; control access to areas within the facility officially designated as publicly accessible; escort visitors and monitor visitor activity in defined circumstances; secure keys, combinations, and other physical access devices; inventory physical access devices at a defined frequency.',
        guidance: 'Physical access control applies to employees and visitors. Physical access devices include keys, locks, combinations, card readers, and guard posts. Organizations protect visitor credentials, validate visitor credentials before granting access, and ensure that visitors do not have unauthorized access.',
      },
      {
        id: 'PE-6',
        title: 'Monitoring Physical Access',
        description: 'Monitor physical access to the facility where the system resides to detect and respond to physical security incidents; review physical access logs at a defined frequency; coordinate results of reviews and investigations with the organizational incident response capability.',
        guidance: 'Monitoring physical access includes using physical access control systems such as locks and entry card readers, surveillance equipment such as cameras, and manned security posts. Responding to physical security incidents includes investigating incidents and contacting security personnel or law enforcement.',
      },
      {
        id: 'PE-8',
        title: 'Visitor Access Records',
        description: 'Maintain visitor access records to the facility where the system resides for a defined time period; and review visitor access records at a defined frequency.',
        guidance: 'Visitor access records include the name and organization of the person visiting; the signature of the visitor; the form of identification; the date of access; the time of entry and departure; the purpose of the visit; and the name and organization of the person visited.',
      },
      {
        id: 'PE-9',
        title: 'Power Equipment and Cabling',
        description: 'Protect power equipment and power cabling for the system from damage and destruction.',
        guidance: 'Organizations consider power equipment protection to include generator sets and uninterruptible power supplies, power distribution systems, and physical cabling. Power cabling considerations include protection from inadvertent damage, malicious tampering, or physical destruction.',
      },
      {
        id: 'PE-10',
        title: 'Emergency Shutoff',
        description: 'Provide the capability of shutting off power to system or individual system components in emergency situations; place emergency shutoff switches or devices in defined locations; and protect emergency power shutoff capability from unauthorized activation.',
        guidance: 'Emergency power shutoff capability is provided for emergency situations. The types of situations that would require emergency shutoff include fires, flooding, extreme weather conditions, and other natural disasters.',
      },
      {
        id: 'PE-12',
        title: 'Emergency Lighting',
        description: 'Employ and maintain automatic emergency lighting for the system that activates in the event of a power outage or disruption and that covers emergency exits and evacuation routes within the facility.',
        guidance: 'The duration of emergency lighting is addressed in organizational contingency plans. Emergency lighting includes both interior and exterior lighting. Emergency lighting includes automatic controls to activate in the event of power outages.',
      },
      {
        id: 'PE-13',
        title: 'Fire Protection',
        description: 'Employ and maintain fire detection and suppression systems that are supported by an independent energy source.',
        guidance: 'Fire detection and suppression systems that may be used by organizations include sprinkler systems, handheld fire extinguishers, fixed fire suppression systems, and smoke detectors. Fire protection systems are designed to automatically detect fires and notify personnel in emergency situations.',
      },
      {
        id: 'PE-14',
        title: 'Environmental Controls',
        description: 'Maintain defined environmental control levels within the facility where the system resides; and monitor environmental control levels at a defined frequency.',
        guidance: 'The provision of environmental controls applies primarily to facilities containing concentrations of system resources. Environmental controls include temperature and humidity controls, and systems for removing excess water.',
      },
      {
        id: 'PE-17',
        title: 'Alternate Work Site',
        description: 'Implement defined controls at alternate work sites; and assess the effectiveness of controls at alternate work sites.',
        guidance: 'Alternate work sites may include government facilities or private residences. Organizations may define different controls for alternate work sites than for primary work sites. Controls at alternate work sites address security and privacy for employees and contractors working from alternate locations.',
      },
    ],
  },
  {
    id: 'PL',
    name: 'Planning',
    description: 'The Planning family establishes requirements for developing, documenting, and updating security and privacy plans that describe security and privacy controls in place or planned for systems.',
    controls: [
      {
        id: 'PL-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a planning policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Planning policy and procedures address the controls in the PL family.',
      },
      {
        id: 'PL-2',
        title: 'System Security and Privacy Plans',
        description: 'Develop security and privacy plans for the system that describe the system boundary, system environments of operation, how security and privacy requirements are implemented, and the relationships with or connections to other systems; distribute copies to stakeholders; review and update the plans at a defined frequency.',
        guidance: 'Security and privacy plans contain sufficient detail to enable the assessment of the implementation of controls, including descriptions of required behaviors of control implementations, expected system environment, applicable laws and regulations, and inter-organizational agreements.',
      },
      {
        id: 'PL-4',
        title: 'Rules of Behavior',
        description: 'Establish and provide to individuals requiring access to the system, the rules that describe responsibilities and expected behavior with regard to information and system usage; receive acknowledgment from users of the rules of behavior prior to authorizing access to information and the system; and review and update the rules of behavior at a defined frequency.',
        guidance: 'Rules of behavior are consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Organizations consider rules of behavior based on individual user roles and responsibilities. Rules of behavior for use of government systems while away from the office may be addressed in personnel security policies.',
      },
      {
        id: 'PL-8',
        title: 'Security and Privacy Architectures',
        description: 'Develop security and privacy architectures for the system that describe the requirements and approach to be taken for protecting the confidentiality, integrity, and availability of organizational information; describe how the security and privacy architectures are integrated into and support the enterprise architecture.',
        guidance: 'Security and privacy architectures describe how security and privacy requirements are implemented across the system. The architectures are used to guide configuration of technical controls and guide the design of new systems and upgrades to existing systems.',
      },
      {
        id: 'PL-10',
        title: 'Baseline Selection',
        description: 'Select a control baseline for the system.',
        guidance: 'Control baselines represent a starting point for the protection of individuals\' privacy and organizational operations, assets, and individuals. NIST SP 800-53B provides control baselines at low, moderate, and high impact levels. Organizations tailor selected baselines to address their specific operational environments.',
      },
      {
        id: 'PL-11',
        title: 'Baseline Tailoring',
        description: 'Tailor the selected control baseline by applying specified tailoring actions.',
        guidance: 'Organizations can tailor control baselines by adding controls or control enhancements; removing controls or control enhancements; assigning specific values to organization-defined parameters; providing additional specification information for implementation; and providing supplemental guidance.',
      },
    ],
  },
  {
    id: 'PM',
    name: 'Program Management',
    description: 'The Program Management family establishes requirements for organization-wide information security and privacy programs including risk management, control oversight, and strategic planning.',
    controls: [
      {
        id: 'PM-1',
        title: 'Information Security Program Plan',
        description: 'Develop and disseminate an organization-wide information security program plan that provides an overview of the requirements and a description of the program management controls in place or planned for meeting those requirements; review and update the information security program plan at a defined frequency.',
        guidance: 'Information security program plans can be represented in single documents or compilations of documents at the discretion of organizations. The plans document program management controls and common controls.',
      },
      {
        id: 'PM-2',
        title: 'Information Security Program Leadership Roles',
        description: 'Appoint a senior agency information security officer with the mission and resources to coordinate, develop, implement, and maintain an organization-wide information security program; and identify a senior agency official for privacy with the mission and resources to coordinate, develop, implement, and maintain an organization-wide privacy program.',
        guidance: 'The senior agency information security officer (SAISO), also referred to as the Chief Information Security Officer (CISO), is a senior official within organizations appointed by the head of the organization to coordinate the development and maintenance of the organization-wide information security program.',
      },
      {
        id: 'PM-9',
        title: 'Risk Management Strategy',
        description: 'Develop a comprehensive strategy to manage organizational risk to operations and assets, individuals, other organizations, and the Nation associated with the operation and use of systems; and implement that strategy consistently across the organization.',
        guidance: 'An organizational risk management strategy includes an expression of the organizational risk tolerance, and specific risk management processes for different types of risk. The risk management strategy guides risk-based decisions within the organization.',
      },
      {
        id: 'PM-10',
        title: 'Authorization Process',
        description: 'Manage the security and privacy state of organizational systems and the environments in which those systems operate through authorization processes; designate individuals to fulfill specific roles and responsibilities within the organizational risk management process.',
        guidance: 'The authorization process for organizational systems requires the implementation of an organization-wide risk management process, a risk executive function, a risk-informed authorization process, and continuous monitoring of the security and privacy state of organizational systems.',
      },
      {
        id: 'PM-11',
        title: 'Mission and Business Process Definition',
        description: 'Define organizational mission and business processes with consideration for information security and privacy and the resulting risk to organizational operations, organizational assets, individuals, other organizations, and the Nation.',
        guidance: 'Mission and business processes that are related to systems support organizational objectives. Defining mission and business processes with security and privacy in mind allows organizations to protect information associated with those processes and to determine the types of systems needed.',
      },
      {
        id: 'PM-16',
        title: 'Threat Awareness Program',
        description: 'Implement a threat awareness program that includes a cross-organization information-sharing capability for threat intelligence.',
        guidance: 'Because organizations may not have credible threat information to share with other organizations, there may be some delay in sharing threat information. Threat intelligence includes information about current threats, adversary tactics, techniques, and procedures, as well as indicators of compromise.',
      },
    ],
  },
  {
    id: 'PS',
    name: 'Personnel Security',
    description: 'The Personnel Security family establishes requirements for screening individuals before authorizing access to organizational systems and protecting against risks posed by insider threats.',
    controls: [
      {
        id: 'PS-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a personnel security policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Personnel security policy and procedures address the controls in the PS family.',
      },
      {
        id: 'PS-2',
        title: 'Position Risk Designation',
        description: 'Assign a risk designation to all organizational positions; establish screening criteria for individuals filling those positions; and review and update position risk designations at a defined frequency.',
        guidance: 'Position risk designations reflect Office of Personnel Management (OPM) policy and guidance. Risk designations can guide and inform the types of authorizations individuals receive when accessing organizational systems and information.',
      },
      {
        id: 'PS-3',
        title: 'Personnel Screening',
        description: 'Screen individuals prior to authorizing access to the system; and rescreen individuals according to a defined frequency and under defined circumstances.',
        guidance: 'Personnel screening and rescreening are conducted consistent with OPM regulations and guidance for federal employees. Organizations may use background investigations as part of personnel screening. Organizations consider risk designations when determining the type and scope of screening.',
      },
      {
        id: 'PS-4',
        title: 'Personnel Termination',
        description: 'Upon termination of individual employment, disable system access within a defined time period; terminate or revoke any authenticators and credentials associated with the individual; conduct exit interviews that include a discussion of defined information security topics; retrieve all security-related organizational system-related property.',
        guidance: 'System property includes authenticators (hardware and software tokens, certificates, PKI keys), system identifiers, physical access devices (badges, access cards, keys), system licenses, and keys for encryption. Organizations consider information security topics during exit interviews to help identify and address concerns.',
      },
      {
        id: 'PS-5',
        title: 'Personnel Transfer',
        description: 'Review and confirm ongoing operational need for current logical and physical access authorizations to systems when individuals are reassigned or transferred to other positions within the organization; initiate defined transfer or reassignment actions within a defined time period; modify access authorization as needed to correspond with any changes in operational need due to reassignment or transfer; and notify defined personnel or roles within a defined time period.',
        guidance: 'Personnel transfer applies to both organizational employees and contractors. Organizations track access authorizations to ensure that individuals do not retain inappropriate access rights when transferred to other positions.',
      },
      {
        id: 'PS-6',
        title: 'Access Agreements',
        description: 'Develop and document access agreements for organizational systems; review and update the access agreements at a defined frequency; and ensure that individuals requiring access to organizational information and systems sign appropriate access agreements prior to being granted access.',
        guidance: 'Access agreements include nondisclosure agreements, acceptable use agreements, rules of behavior agreements, and conflict-of-interest agreements. Electronic signatures are acceptable for signing access agreements unless specifically prohibited.',
      },
      {
        id: 'PS-7',
        title: 'External Personnel Security',
        description: 'Establish personnel security requirements, including security roles and responsibilities for external providers; require external providers to comply with personnel security policies and procedures established by the organization; document personnel security requirements; require external providers to notify defined personnel or roles of any personnel transfers or terminations of external personnel who possess organizational credentials.',
        guidance: 'External providers of information system services include service bureaus, contractors, and other organizations providing system development, information technology services, outsourced applications, and network and security management.',
      },
      {
        id: 'PS-8',
        title: 'Personnel Sanctions',
        description: 'Employ a formal sanctions process for individuals failing to comply with established information security and privacy policies and procedures; and notify defined personnel or roles within a defined time period when a formal employee sanctions process is initiated.',
        guidance: 'Organizational sanctions processes reflect applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Sanctions processes are described in access agreements and can be included in policy statements. Sanctions apply to organizational personnel and contractors.',
      },
    ],
  },
  {
    id: 'PT',
    name: 'Personally Identifiable Information Processing and Transparency',
    description: 'The PT family establishes requirements for managing the processing of personally identifiable information (PII) and being transparent with individuals about privacy practices.',
    controls: [
      {
        id: 'PT-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a personally identifiable information processing and transparency policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'PII processing and transparency policy and procedures address the controls in the PT family.',
      },
      {
        id: 'PT-2',
        title: 'Authority to Process Personally Identifiable Information',
        description: 'Determine and document the legal authority that permits the collection, use, maintenance, and sharing of personally identifiable information; and restrict the collection, use, maintenance, and sharing of personally identifiable information to only that which is legally authorized.',
        guidance: 'The legal authority that permits the collection, use, maintenance, and sharing of PII may be codified in constitutional provisions, statutes, regulations, or policies. Organizations cannot process PII without legal authority.',
      },
      {
        id: 'PT-3',
        title: 'Personally Identifiable Information Processing Purposes',
        description: 'Identify and document the purpose for processing personally identifiable information; describe the purpose in the privacy notice authorized by PT-5; restrict the processing of personally identifiable information to only that which is compatible with the identified purpose.',
        guidance: 'Identifying and documenting the purposes of processing gives privacy notice to individuals and provides organizations with the basis for making decisions about the processing of PII. Purposes may include mission functions, business functions, and operational needs.',
      },
      {
        id: 'PT-5',
        title: 'Privacy Notice',
        description: 'Provide notice to individuals about the processing of personally identifiable information that includes a description of the authority for processing, purpose of processing, types of PII processed, procedures for individuals to exercise privacy rights, and a point of contact for privacy questions.',
        guidance: 'Privacy notices inform individuals about how their PII is being processed. Notice requirements may be found in applicable laws, regulations, and policies. System of records notices (SORNs) under the Privacy Act are one example of privacy notices.',
      },
      {
        id: 'PT-6',
        title: 'Privacy Reporting',
        description: 'Develop privacy reports and disseminate to defined officials at a defined frequency.',
        guidance: 'Privacy reports convey information about privacy activities including program plans, privacy risks identified, privacy controls implemented, and assessments of privacy program effectiveness. Privacy reports support accountability and oversight.',
      },
    ],
  },
  {
    id: 'RA',
    name: 'Risk Assessment',
    description: 'The Risk Assessment family establishes requirements for conducting risk assessments, identifying vulnerabilities in systems, and analyzing threats to determine the likelihood and impact of adverse events.',
    controls: [
      {
        id: 'RA-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a risk assessment policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Risk assessment policy and procedures address the controls in the RA family.',
      },
      {
        id: 'RA-2',
        title: 'Security Categorization',
        description: 'Categorize the system and information it processes, stores, and transmits in accordance with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines; document the security categorization results, including supporting rationale, in the security plan for the system; and ensure that the security categorization decision is reviewed and approved by the authorizing official or authorizing official designated representative.',
        guidance: 'FIPS 199 and NIST SP 800-60 provide guidance on security categorization for federal information systems. The security categorization process considers confidentiality, integrity, and availability impacts from a breach in security.',
      },
      {
        id: 'RA-3',
        title: 'Risk Assessment',
        description: 'Conduct a risk assessment, including identifying threats to and vulnerabilities in the system; determining the likelihood and magnitude of harm from unauthorized access, use, disclosure, disruption, modification, or destruction; determining the likelihood and impact of adverse effects on individuals arising from the processing of personally identifiable information.',
        guidance: 'Risk assessments take into account vulnerabilities, threats, likelihood, impact, and mitigating controls to determine the overall level of risk to organizational operations, assets, and individuals. NIST SP 800-30 provides guidance on conducting risk assessments.',
      },
      {
        id: 'RA-5',
        title: 'Vulnerability Monitoring and Scanning',
        description: 'Monitor and scan for vulnerabilities in the system and hosted applications at a defined frequency and/or randomly; employ vulnerability monitoring tools and techniques that facilitate interoperability among tools and automate parts of the process; analyze vulnerability scan reports and results from control assessments; remediate legitimate vulnerabilities according to defined risk levels.',
        guidance: 'Security categories of systems guide the frequency and comprehensiveness of vulnerability scans. Vulnerability scanning includes scanning for patch levels, functions, ports, protocols, and services that are enabled unnecessarily. SCAP-validated vulnerability scanning tools facilitate interoperability.',
      },
      {
        id: 'RA-7',
        title: 'Risk Response',
        description: 'Respond to findings from security and privacy assessments, monitoring, and audits in accordance with organizational risk tolerance.',
        guidance: 'Organizations have multiple options for responding to risk including acceptance, avoidance, mitigation, sharing, and transfer. Organizations use risk responses that are consistent with the organizational risk management strategy and risk tolerance.',
      },
      {
        id: 'RA-9',
        title: 'Criticality Analysis',
        description: 'Identify critical system components and functions by performing a criticality analysis for defined systems, system components, or system services at defined decision points in the system development life cycle.',
        guidance: 'Criticality analysis is used to support multiple security activities including the selection of security controls, the prioritization of security control implementation, the prioritization of incident response efforts, the prioritization of recovery and reconstitution efforts, and the selection of supply chain risk management controls.',
      },
    ],
  },
  {
    id: 'SA',
    name: 'System and Services Acquisition',
    description: 'The SA family establishes requirements for allocating resources for security and privacy, acquiring systems and services, and managing supply chain risks associated with those acquisitions.',
    controls: [
      {
        id: 'SA-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a system and services acquisition policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'System and services acquisition policy and procedures address the controls in the SA family.',
      },
      {
        id: 'SA-2',
        title: 'Allocation of Resources',
        description: 'Determine the high-level information security and privacy requirements for the system or system service in mission and business process planning; determine, document, and allocate the resources required to protect the system or system service as part of the organizational capital planning and investment control process.',
        guidance: 'Organizations use security and privacy requirements to select controls for protecting information and systems and allocate resources to security and privacy programs. Capital planning and investment control processes consider the selection, implementation, and management of investments in information technology.',
      },
      {
        id: 'SA-3',
        title: 'System Development Life Cycle',
        description: 'Acquire, develop, and manage the system using a system development life cycle that incorporates information security and privacy considerations; define and document information security and privacy roles and responsibilities throughout the system development life cycle; identify individuals having information security and privacy roles and responsibilities.',
        guidance: 'A well-defined system development life cycle provides the foundation for the effective and efficient development of systems. The system development life cycle includes security and privacy considerations to help organizations implement security and privacy controls early in the development process.',
      },
      {
        id: 'SA-4',
        title: 'Acquisition Process',
        description: 'Include the following requirements, descriptions, and criteria, explicitly or by reference, using defined selection criteria in the acquisition contract for the system, system component, or system service: security and privacy functional requirements; strength of security and privacy mechanisms; security and privacy assurance requirements; supplier diversity requirements.',
        guidance: 'Organizations use acquisition contracts to specify security and privacy requirements for systems, system components, and system services. Security and privacy requirements in contracts include specifications for security functions, security assurance, and security documentation.',
      },
      {
        id: 'SA-8',
        title: 'Security and Privacy Engineering Principles',
        description: 'Apply the following systems security and privacy engineering principles in the specification, design, development, implementation, and modification of the system and system components.',
        guidance: 'Systems security and privacy engineering principles include protecting information commensurate with risk, limiting system access to authorized users and information, and designing for resilience and survivability. NIST SP 800-160 provides guidance on systems security engineering principles.',
      },
      {
        id: 'SA-9',
        title: 'External System Services',
        description: 'Require that providers of external system services comply with organizational security and privacy requirements and employ security and privacy controls; define and document organizational oversight and user roles and responsibilities for external system services; employ defined processes, methods, and techniques to monitor security and privacy control compliance by external service providers.',
        guidance: 'External system services are services implemented outside of the authorization boundary of the organizational system seeking those services. Organizations establish relationships with external service providers in a variety of ways, including through joint ventures, partnerships, and outsourcing arrangements.',
      },
      {
        id: 'SA-11',
        title: 'Developer Testing and Evaluation',
        description: 'Require the developer of the system, system component, or system service to implement a plan for ongoing security and privacy control assessments; perform unit, integration, system, and regression testing and evaluation at a defined depth and coverage; produce evidence of the execution of the assessment plan and the results of the testing and evaluation.',
        guidance: 'Developer testing and evaluation ensures that security and privacy controls are implemented correctly and functioning as intended in delivered systems. Testing addresses potential weaknesses and deficiencies in software-based and hardware-based security and privacy controls.',
      },
      {
        id: 'SA-12',
        title: 'Memory Protection',
        description: 'Implement the following controls to protect the system memory from unauthorized code execution: data execution prevention, address space layout randomization, and other controls as required.',
        guidance: 'Some adversaries launch attacks with the intent of executing code in non-executable regions of memory. Controls that prevent the execution of code in non-executable regions of memory include data execution prevention (DEP) and address space layout randomization (ASLR).',
      },
    ],
  },
  {
    id: 'SC',
    name: 'System and Communications Protection',
    description: 'The SC family establishes requirements for monitoring, controlling, and protecting communications at the external boundaries and key internal boundaries of systems, and employing architectural designs that promote security.',
    controls: [
      {
        id: 'SC-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a system and communications protection policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'System and communications protection policy and procedures address the controls in the SC family.',
      },
      {
        id: 'SC-2',
        title: 'Separation of System and User Functionality',
        description: 'Separate user functionality, including user interface services, from system management functionality.',
        guidance: 'System management functionality includes functions necessary to administer databases, network components, workstations, or servers, and typically requires privileged user access. Allowing users to access system management functionality may allow them to compromise security on the system.',
      },
      {
        id: 'SC-5',
        title: 'Denial of Service Protection',
        description: 'Protect against or limit the effects of denial of service attacks, including defined types of denial of service events; and employ defined controls to achieve the denial of service objective.',
        guidance: 'A variety of technologies exist to limit or eliminate the effects of denial-of-service attacks. Organizations establish processes to ensure that denial-of-service protection is implemented and maintained. Organizations consider multiple sources of denial-of-service threats.',
      },
      {
        id: 'SC-7',
        title: 'Boundary Protection',
        description: 'Monitor and control communications at the external managed interfaces to the system and at key internal managed interfaces within the system; implement subnetworks for publicly accessible system components that are physically or logically separated from internal organizational networks; and connect to external networks or systems only through managed interfaces.',
        guidance: 'Boundary protection includes gateways, routers, firewalls, guards, encrypted tunnels, and other mechanisms that control the flow of information between interconnected systems. Organizations consider the shared nature of commercial telecommunications services in implementing boundary protection.',
      },
      {
        id: 'SC-8',
        title: 'Transmission Confidentiality and Integrity',
        description: 'Implement cryptographic or alternative physical safeguards to prevent unauthorized disclosure of information and detect changes to information during transmission.',
        guidance: 'Encryption is a common approach to protecting the confidentiality and integrity of transmitted information. Organizations have the flexibility to either encrypt the information or use alternative physical safeguards (such as protected distribution systems) to protect transmissions.',
      },
      {
        id: 'SC-12',
        title: 'Cryptographic Key Establishment and Management',
        description: 'Establish and manage cryptographic keys when cryptography is required and employed within the system in accordance with the following key management requirements.',
        guidance: 'Cryptographic key management and establishment can be performed using manual procedures or automated mechanisms with supporting manual procedures. Organizations define key management requirements in accordance with applicable laws, executive orders, directives, regulations, and policies.',
      },
      {
        id: 'SC-13',
        title: 'Cryptographic Protection',
        description: 'Determine the cryptographic uses and implement the following types of cryptography required for each use.',
        guidance: 'Cryptography can be employed to support a variety of security solutions including the protection of classified and controlled unclassified information. Cryptographic implementations include FIPS-validated modules and NSA-approved cryptography for classified information.',
      },
      {
        id: 'SC-17',
        title: 'Public Key Infrastructure Certificates',
        description: 'Issue public key certificates under an appropriate certificate policy or obtain public key certificates from an approved service provider.',
        guidance: 'For public key infrastructure (PKI), a certificate policy describes the rules for issuing, managing, and using certificates. Organizations obtain certificates from approved service providers, such as the Federal PKI, to ensure that certificates meet security requirements.',
      },
      {
        id: 'SC-18',
        title: 'Mobile Code',
        description: 'Define acceptable and unacceptable mobile code and mobile code technologies; authorize, monitor, and control the use of mobile code within the system; and prevent the download and execution of prohibited mobile code.',
        guidance: 'Mobile code includes JavaScript, ActiveX, Flash, Postscript, PDF, Shockwave movies, VBScript, and Java applets. Decisions regarding the use of mobile code in organizational systems are based on the potential for the code to cause damage to the system if used maliciously.',
      },
      {
        id: 'SC-20',
        title: 'Secure Name/Address Resolution Service (Authoritative Source)',
        description: 'Provide additional data origin authentication and integrity verification artifacts along with the authoritative name resolution data the system returns in response to external name/address resolution queries.',
        guidance: 'This control enables remote clients to obtain the origin authentication and integrity verification assurances for the host/service name to network address resolution information obtained through the service. Domain Name System (DNS) Security Extensions (DNSSEC) are an example of this control.',
      },
      {
        id: 'SC-28',
        title: 'Protection of Information at Rest',
        description: 'Protect the confidentiality and integrity of defined information at rest.',
        guidance: 'Selection of cryptographic mechanisms is based on the need to protect the confidentiality and integrity of organizational information. The strength of the mechanism is commensurate with the security category or classification of the information and the threat environment. Organizations may employ different mechanisms for different types of information.',
      },
    ],
  },
  {
    id: 'SI',
    name: 'System and Information Integrity',
    description: 'The SI family establishes requirements for identifying, reporting, and correcting system flaws, protecting systems from malicious code, and monitoring system security alerts.',
    controls: [
      {
        id: 'SI-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a system and information integrity policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'System and information integrity policy and procedures address the controls in the SI family.',
      },
      {
        id: 'SI-2',
        title: 'Flaw Remediation',
        description: 'Identify, report, and correct information system flaws; test software and firmware updates related to flaw remediation for effectiveness and potential side effects before installation; install security-relevant software updates within a defined time period; and incorporate flaw remediation into the organizational configuration management process.',
        guidance: 'Organizations identify systems affected by announced software and firmware flaws including potential vulnerabilities resulting from those flaws, and report this information to defined organizational personnel. Security-relevant software updates include patches, service packs, and hot fixes.',
      },
      {
        id: 'SI-3',
        title: 'Malicious Code Protection',
        description: 'Implement malicious code protection mechanisms at defined system entry and exit points; update malicious code protection mechanisms when new releases are available; configure malicious code protection mechanisms to perform periodic scans of the system and real-time scans of files from external sources; and address the receipt of false positives during malicious code detection and eradication.',
        guidance: 'System entry and exit points include firewalls, remote access servers, workstations, electronic mail servers, web servers, proxy servers, notebook computers, and mobile devices. Malicious code includes viruses, worms, Trojan horses, spyware, ransomware, and adware.',
      },
      {
        id: 'SI-4',
        title: 'System Monitoring',
        description: 'Monitor the system to detect attacks and indicators of potential attacks; identify unauthorized use of the system; heighten the level of system monitoring activity when there is an indication of increased risk; obtain legal opinion with regard to system monitoring activities; and provide defined system monitoring information to defined personnel or roles as needed.',
        guidance: 'System monitoring includes external and internal monitoring. External monitoring includes observing events occurring at the system boundary. Internal monitoring includes observing events occurring within the system. Organizations analyze monitoring information from multiple sources.',
      },
      {
        id: 'SI-5',
        title: 'Security Alerts, Advisories, and Directives',
        description: 'Receive information system security alerts, advisories, and directives from defined external organizations on an ongoing basis; generate internal security alerts, advisories, and directives as deemed necessary; disseminate security alerts, advisories, and directives to defined personnel or roles; and implement security directives in accordance with defined time periods.',
        guidance: 'Organizations receive security alerts and advisories from US-CERT and other sources, and forward the information to appropriate personnel within the organization. Security directives may be issued by OMB, DHS, or other oversight authorities.',
      },
      {
        id: 'SI-6',
        title: 'Security and Privacy Function Verification',
        description: 'Verify the correct operation of defined security and privacy functions; perform the verification of the functions under defined conditions; notify defined personnel or roles of failed security and privacy verification tests; and implement defined alternative action(s) when anomalies are discovered.',
        guidance: 'Transitional states for systems include startup, shutdown, and aborts. Security and privacy functions that organizations verify may include confidentiality, integrity, availability, authentication, access control, and non-repudiation.',
      },
      {
        id: 'SI-7',
        title: 'Software, Firmware, and Information Integrity',
        description: 'Employ integrity verification tools to detect unauthorized changes to the following software, firmware, and information; and take defined actions when unauthorized changes to the software, firmware, and information are detected.',
        guidance: 'Unauthorized changes to software, firmware, and information can occur due to errors or malicious activity. Software includes operating systems, network components, middleware, and applications. Integrity checking mechanisms can detect unauthorized modifications to software, firmware, and information.',
      },
      {
        id: 'SI-10',
        title: 'Information Input Validation',
        description: 'Check the validity of the following information inputs to the system.',
        guidance: 'Checking the valid syntax and semantics of information system inputs—including character set, length, numerical range, and acceptable values—verifies that inputs match specified definitions for format and content. Software interfaces accepting data from external systems may need to validate inputs.',
      },
      {
        id: 'SI-12',
        title: 'Information Management and Retention',
        description: 'Manage and retain information within the system and information output from the system in accordance with applicable laws, executive orders, directives, regulations, policies, standards, guidelines, and operational requirements.',
        guidance: 'Information management and retention requirements cover the full life cycle of information, in some cases extending beyond system disposal. Organizations retain information that is needed to support national security, law enforcement, and business operations.',
      },
    ],
  },
  {
    id: 'SR',
    name: 'Supply Chain Risk Management',
    description: 'The SR family establishes requirements for managing risks associated with the supply chains for systems, system components, and system services to protect against counterfeit and maliciously modified components.',
    controls: [
      {
        id: 'SR-1',
        title: 'Policy and Procedures',
        description: 'Develop, document, and disseminate a supply chain risk management policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination, and compliance.',
        guidance: 'Supply chain risk management policy and procedures address the controls in the SR family.',
      },
      {
        id: 'SR-2',
        title: 'Supply Chain Risk Management Plan',
        description: 'Develop a plan for managing supply chain risks associated with the research and development, design, manufacturing, acquisition, delivery, integration, operations and maintenance, and disposal of the system, system component, or system service; review and update the supply chain risk management plan at a defined frequency.',
        guidance: 'The supply chain risk management plan describes the organization\'s supply chain risk management processes and activities at the system level. Supply chain risk management plans include an overview of the supply chain, identification of risks, risk mitigation strategies, and roles and responsibilities.',
      },
      {
        id: 'SR-3',
        title: 'Supply Chain Controls and Processes',
        description: 'Establish a process or processes to identify and address weaknesses or deficiencies in the supply chain elements and processes of defined systems, system components, and services; and employ the following controls to protect against supply chain risks and to limit the harm or consequences of supply chain-related events.',
        guidance: 'Supply chain elements include organizations, entities, and activities that provide, develop, manufacture, or purchase information and communications technology products and services. Organizations consider hardware, software, and firmware components including BIOS, operating systems, and applications.',
      },
      {
        id: 'SR-5',
        title: 'Acquisition Strategies, Tools, and Methods',
        description: 'Employ the following acquisition strategies, contract tools, and procurement methods to protect against, identify, and mitigate supply chain risks.',
        guidance: 'Organizations consider multiple factors in selecting acquisition strategies, tools, and methods, including the relationship between the organization and the supplier, the potential impact if the supplier is compromised, and the availability of alternative suppliers.',
      },
      {
        id: 'SR-6',
        title: 'Supplier Assessments and Reviews',
        description: 'Assess and review the supply chain-related risks associated with suppliers or contractors and the system, system component, or system service they provide at a defined frequency.',
        guidance: 'Assessment of supplier risk is important because suppliers may inadvertently or intentionally introduce malicious code or counterfeit components into the supply chain. Organizations assess suppliers at the organization level, not just the product level.',
      },
      {
        id: 'SR-8',
        title: 'Notification Agreements',
        description: 'Establish agreements and procedures with entities involved in the supply chain for the system, system component, or system service for notifying the organization of any breaches of security controls.',
        guidance: 'Organizations consider including supply chain notification requirements in contracts and other formal agreements with suppliers. Notification agreements may include requirements for suppliers to report cyber incidents, supply chain breaches, and other security-relevant events.',
      },
      {
        id: 'SR-10',
        title: 'Inspection of Systems or Components',
        description: 'Inspect the following systems or system components at a defined frequency, using defined inspection methods, to detect tampering.',
        guidance: 'This control addresses systems and system components that may be subject to tampering prior to integration, installation, or operation. Organizations inspect systems and components at various points in the supply chain to detect signs of tampering.',
      },
      {
        id: 'SR-11',
        title: 'Component Authenticity',
        description: 'Implement the following controls and processes to validate the authenticity of system components.',
        guidance: 'Counterfeit system components can contain malicious code, reduce performance, or fail earlier than the expected service life. Organizations establish policies and procedures to detect counterfeit and altered system components. Component authenticity techniques include using cryptographically signed software packages, supply chain integrity monitoring tools, and purchasing from trusted sources.',
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
      .eq('abbreviation', 'SP 800-53')
      .single();

    if (frameworkError || !framework) {
      return new Response(
        JSON.stringify({ error: 'SP 800-53 framework not found in compliance_frameworks table' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find or create source record for NIST SP 800-53
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
          name: 'NIST SP 800-53 Rev 5 — Security and Privacy Controls for Information Systems and Organizations',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
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
        JSON.stringify({ error: 'Failed to find or create SP 800-53 source' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: job } = await supabase
      .from('ingest_jobs')
      .insert({ source_id: source.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();

    let documentsIngested = 0;

    for (const family of NIST_800_53_FAMILIES) {
      // Family-level document
      const familyContent = `# NIST SP 800-53 Rev 5 — ${family.id}: ${family.name}\n\nControl Family: ${family.name} (${family.id})\nFramework: NIST Special Publication 800-53 Revision 5\nPublication: Security and Privacy Controls for Information Systems and Organizations\n\n## Family Overview\n${family.description}\n\n## Controls in this Family\n${family.controls.map(c => `- **${c.id}** — ${c.title}: ${c.description.slice(0, 120)}...`).join('\n')}`;

      const familyMeta = { family_id: family.id, family_name: family.name, revision: 5, document_level: 'family' };

      const { data: familyDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `SP 800-53 Rev 5 — ${family.id}: ${family.name}`,
        document_type: 'framework',
        url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
        version: 'Rev 5',
        raw_content: familyContent,
        metadata: familyMeta,
        is_indexed: true,
      }).select('id').single();

      if (familyDoc) await insertChunk(familyDoc.id, familyContent, familyMeta);
      documentsIngested++;

      // Control-level documents
      for (const control of family.controls) {
        const controlContent = `# ${control.id} — ${control.title}\n\nControl Family: ${family.id} — ${family.name}\nFramework: NIST SP 800-53 Rev 5\nControl ID: ${control.id}\n\n## Control Requirement\n${control.description}\n\n## Supplemental Guidance\n${control.guidance}\n\n## Applicability\nThis control applies to Low, Moderate, and/or High baseline systems as defined in NIST SP 800-53B. Organizations tailor control applicability based on the security categorization of their systems per FIPS 199.\n\n## Related Controls\nSee NIST SP 800-53 Rev 5 for related controls and control enhancements within the ${family.id} family and across other control families.`;

        const controlMeta = {
          control_id: control.id,
          control_title: control.title,
          family_id: family.id,
          family_name: family.name,
          revision: 5,
          document_level: 'control',
        };

        const { data: controlDoc } = await supabase.from('documents').insert({
          source_id: source.id,
          framework_id: framework.id,
          title: `${control.id} — ${control.title}`,
          document_type: 'control',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
          version: 'Rev 5',
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
      JSON.stringify({ success: true, documents_ingested: documentsIngested, message: 'NIST SP 800-53 Rev 5 ingested successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('NIST 800-53 ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
