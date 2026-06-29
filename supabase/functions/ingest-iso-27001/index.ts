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

// ISO/IEC 27001:2022 — Organizational Clauses 4–10 + Annex A (93 controls across 4 themes)
// Descriptions are abstracted summaries; no verbatim ISO text reproduced.

const ISO27001_CLAUSES = [
  {
    id: 'Clause 4',
    name: 'Context of the Organization',
    description: 'Organizations must evaluate the internal and external factors that affect their ability to achieve information security outcomes. This includes understanding the needs and expectations of interested parties (stakeholders) and determining the scope of the ISMS. The organization must identify issues — both internal (culture, structure, capabilities) and external (regulatory, competitive, technological) — that are relevant to its information security objectives. The resulting scope defines which parts of the organization, its processes, and its assets fall under the management system.',
  },
  {
    id: 'Clause 5',
    name: 'Leadership',
    description: 'Senior leadership must demonstrate active commitment to the ISMS by establishing an information security policy, assigning roles and responsibilities, and integrating ISMS requirements into business processes. Top management must ensure the ISMS has adequate resources, that information security goals align with organizational strategy, and that accountability is clear. Leadership is expected to champion a culture where information security is understood as a business enabler, not merely a compliance obligation.',
  },
  {
    id: 'Clause 6',
    name: 'Planning',
    description: 'Organizations must identify and assess information security risks using a repeatable methodology, then select appropriate treatment options. The risk assessment process should produce a prioritized view of threats and vulnerabilities affecting the ISMS scope. A Statement of Applicability (SoA) must be produced, documenting which Annex A controls are applicable or excluded and the justification for each decision. Measurable information security objectives must be established and plans put in place to achieve them.',
  },
  {
    id: 'Clause 7',
    name: 'Support',
    description: 'The ISMS must be sustained by appropriate resources including competent personnel, awareness programs, documented information (policies, procedures, records), and defined communication channels. All staff whose work affects information security must understand their responsibilities and the consequences of non-compliance. Documentation requirements define what must be maintained (e.g., policies and risk assessments) and what must be retained as evidence (e.g., audit results and management reviews).',
  },
  {
    id: 'Clause 8',
    name: 'Operation',
    description: 'Organizations must implement, control, and continually improve the processes that deliver information security outcomes. This includes executing risk treatment plans, managing changes that could affect the ISMS, and ensuring outsourced processes are adequately controlled. Operational planning translates the decisions made during planning (Clause 6) into day-to-day practice, with evidence retained to demonstrate that controls are functioning as intended.',
  },
  {
    id: 'Clause 9',
    name: 'Performance Evaluation',
    description: 'The effectiveness of the ISMS must be measured and monitored through defined metrics, internal audits, and periodic management reviews. Internal audits evaluate whether the ISMS conforms to the organization\'s own requirements and to ISO 27001. Management reviews assess overall ISMS performance, resource adequacy, and strategic alignment. Results of monitoring and measurement activities feed into the continual improvement process.',
  },
  {
    id: 'Clause 10',
    name: 'Improvement',
    description: 'When nonconformities are identified — whether through audits, incidents, or monitoring — the organization must investigate root causes, take corrective action, and verify effectiveness. Continual improvement is an ongoing obligation, not a one-time activity. The organization must look for opportunities to enhance the ISMS proactively, not only react to failures. Management reviews, audit findings, and risk assessment updates all serve as inputs to the improvement cycle.',
  },
];

const ISO27001_ANNEX_A = [
  // Theme: Organizational Controls (A.5, 37 controls)
  {
    theme: 'Organizational Controls',
    themeCode: 'A.5',
    controls: [
      { id: 'A.5.1', name: 'Policies for information security', description: 'The organization should establish, publish, and maintain a set of information security policies that are approved by management and communicated to all relevant personnel and external parties. Policies must be reviewed at planned intervals and whenever significant changes occur to remain appropriate and effective.' },
      { id: 'A.5.2', name: 'Information security roles and responsibilities', description: 'Responsibilities for protecting information assets must be clearly assigned. This includes defining who is accountable for specific assets, processes, and security tasks, ensuring that accountability is not duplicated or left unassigned, and communicating responsibilities to relevant personnel.' },
      { id: 'A.5.3', name: 'Segregation of duties', description: 'Conflicting duties and areas of responsibility should be separated to reduce opportunities for unauthorized or unintentional modification of assets or fraud. Where full segregation is impractical due to organizational size, compensating controls such as activity monitoring or audit trails should be applied.' },
      { id: 'A.5.4', name: 'Management responsibilities', description: 'All personnel must adhere to established information security policies and procedures. Managers are responsible for ensuring that staff under their supervision understand and fulfill their obligations, and that deviations are addressed promptly through established disciplinary or corrective processes.' },
      { id: 'A.5.5', name: 'Contact with authorities', description: 'The organization should maintain appropriate contacts with relevant government bodies, regulatory agencies, and law enforcement authorities. These relationships ensure the organization can quickly report incidents that require regulatory notification and receive timely guidance on emerging legal obligations.' },
      { id: 'A.5.6', name: 'Contact with special interest groups', description: 'Organizations should engage with industry groups, professional forums, and information-sharing communities relevant to their sector and threat landscape. Participation in these groups helps the organization stay current on threat intelligence, best practices, and emerging vulnerabilities.' },
      { id: 'A.5.7', name: 'Threat intelligence', description: 'The organization should systematically collect, analyze, and apply information about threats to information security. Threat intelligence should be relevant to the organization\'s context, actionable, and used to inform risk assessments, control decisions, and incident response planning.' },
      { id: 'A.5.8', name: 'Information security in project management', description: 'Information security requirements should be integrated into the organization\'s project management methodology from initiation through closure. Projects that introduce new systems, processes, or services must evaluate security risks early enough to influence design and resource allocation decisions.' },
      { id: 'A.5.9', name: 'Inventory of information and other associated assets', description: 'The organization must identify and maintain an accurate inventory of information assets and the assets that support them, including hardware, software, data stores, and services. Each asset should have an identified owner who is responsible for its appropriate use and protection.' },
      { id: 'A.5.10', name: 'Acceptable use of information and other associated assets', description: 'Rules governing the acceptable use of information assets — including data, devices, networks, and services — should be documented, communicated to all relevant personnel, and enforced. Acceptable use policies establish boundaries for personal use, data handling, and behavior when using organizational resources.' },
      { id: 'A.5.11', name: 'Return of assets', description: 'Upon termination or change of employment, all organizational assets held by the departing individual must be returned in a timely manner. Asset return processes should be formalized and include verification that all devices, access tokens, and data storage media have been recovered before access is revoked.' },
      { id: 'A.5.12', name: 'Classification of information', description: 'Information should be classified according to its sensitivity and the legal, regulatory, contractual, or business value it holds. A classification scheme should define categories (such as public, internal, confidential, restricted) and the handling requirements that apply to each, guiding how information is stored, transmitted, and disposed of.' },
      { id: 'A.5.13', name: 'Labelling of information', description: 'Classified information should be labeled in accordance with the organization\'s classification scheme so that recipients can immediately identify handling requirements. Labels may be physical (markings on documents) or electronic (metadata, headers) and should be applied consistently at the point of creation or collection.' },
      { id: 'A.5.14', name: 'Information transfer', description: 'The organization must establish rules and procedures governing the transfer of information — both internally between departments and externally with third parties. Transfer controls should address appropriate channels, encryption requirements, authorized recipients, and conditions under which sensitive data may leave organizational boundaries.' },
      { id: 'A.5.15', name: 'Access control', description: 'Access to information and systems must be granted based on business need and the principle of least privilege. An access control policy should define the rules by which access rights are granted, reviewed, modified, and revoked, covering both logical access to systems and physical access to facilities where information is processed.' },
      { id: 'A.5.16', name: 'Identity management', description: 'The organization should manage the lifecycle of all identities — human users, service accounts, and non-human entities — from provisioning through deprovisioning. Identity management processes ensure that each identity is uniquely attributable, that access rights are appropriate to the role, and that dormant or obsolete identities are promptly disabled.' },
      { id: 'A.5.17', name: 'Authentication information', description: 'Authentication credentials such as passwords, keys, and tokens must be managed securely throughout their lifecycle. This includes secure generation, distribution, storage, use, and revocation. Personnel must be instructed never to share credentials, to choose strong secrets, and to report suspected compromise immediately.' },
      { id: 'A.5.18', name: 'Access rights', description: 'Access rights to information and systems should be provisioned, reviewed, and revoked in a controlled manner. Provisioning must align with the access control policy and require formal approval. Regular reviews should detect and remove excessive, unauthorized, or outdated access rights before they can be exploited.' },
      { id: 'A.5.19', name: 'Information security in supplier relationships', description: 'Risks arising from third-party suppliers and service providers who access, process, or handle the organization\'s information must be identified and managed. The organization should establish security requirements for suppliers, incorporate these into contracts, and monitor ongoing supplier compliance.' },
      { id: 'A.5.20', name: 'Addressing information security within supplier agreements', description: 'Contracts with suppliers should explicitly state the information security obligations of both parties. Agreement terms should cover data handling requirements, audit rights, incident notification timelines, subcontracting restrictions, and what happens to organizational data at contract termination.' },
      { id: 'A.5.21', name: 'Managing information security in the ICT supply chain', description: 'Organizations should assess and manage information security risks that arise from the hardware and software components they procure. Supply chain security practices include evaluating the trustworthiness of technology vendors, verifying software integrity, and understanding where components originate and what risks they may introduce.' },
      { id: 'A.5.22', name: 'Monitoring, review and change management of supplier services', description: 'The organization should regularly review supplier performance against agreed security requirements. Reviews should cover audit reports, incident records, and service delivery metrics. Significant changes to supplier services — whether initiated by the supplier or the organization — should be assessed for security impact before implementation.' },
      { id: 'A.5.23', name: 'Information security for use of cloud services', description: 'When using cloud services, the organization must understand the shared responsibility model and ensure its security obligations are met regardless of what the cloud provider handles. Procurement, use, and exit from cloud services should follow a defined process that addresses data residency, encryption, access control, and how data will be recovered if the relationship ends.' },
      { id: 'A.5.24', name: 'Information security incident management planning and preparation', description: 'The organization must prepare for information security incidents by defining procedures, roles, and escalation paths before incidents occur. Preparation includes establishing an incident response team, documenting procedures for common incident scenarios, and ensuring staff know how to report suspected incidents quickly.' },
      { id: 'A.5.25', name: 'Assessment and decision on information security events', description: 'Reported events should be evaluated to determine whether they qualify as information security incidents. A consistent assessment process allows the organization to prioritize its response based on actual impact and risk, rather than treating every anomaly as a critical incident or ignoring events that warrant attention.' },
      { id: 'A.5.26', name: 'Response to information security incidents', description: 'Confirmed incidents must be responded to in accordance with documented procedures. The response process should include containment to limit damage, eradication of the root cause, recovery of affected systems and data, and communication to relevant stakeholders. All response actions should be recorded for post-incident analysis.' },
      { id: 'A.5.27', name: 'Learning from information security incidents', description: 'After an incident is resolved, the organization should conduct a review to identify root causes, evaluate the effectiveness of the response, and determine improvements. Lessons learned should be fed back into risk assessments, control updates, training programs, and incident response procedures to reduce the likelihood and impact of recurrence.' },
      { id: 'A.5.28', name: 'Collection of evidence', description: 'When collecting evidence from information security incidents — whether for internal investigation or potential legal proceedings — the organization must follow processes that preserve evidence integrity and admissibility. Evidence collection procedures should address chain of custody, storage, and handling to ensure evidence remains credible if needed for disciplinary or legal action.' },
      { id: 'A.5.29', name: 'Information security during disruption', description: 'Information security controls must remain functional during disruptive events such as natural disasters, cyberattacks, or infrastructure failures. Business continuity plans should include provisions for maintaining or rapidly restoring critical security controls, and the interaction between information security and broader business continuity planning should be clearly defined.' },
      { id: 'A.5.30', name: 'ICT readiness for business continuity', description: 'The organization must plan for and test the availability of ICT capabilities that business processes depend upon during disruptions. Recovery time and recovery point objectives should be defined, and ICT continuity plans should be tested regularly to verify that recovery capabilities actually function as intended under realistic conditions.' },
      { id: 'A.5.31', name: 'Legal, statutory, regulatory and contractual requirements', description: 'The organization must identify and document all legal, statutory, regulatory, and contractual obligations relevant to information security, and maintain an up-to-date understanding of how those requirements apply to its operations. Compliance obligations should be reflected in policies, controls, and procedures, and changes in the legal landscape should trigger a review of existing arrangements.' },
      { id: 'A.5.32', name: 'Intellectual property rights', description: 'The organization should establish procedures to ensure compliance with intellectual property obligations, including software licensing, copyright, and patents. Personnel must be aware that unauthorized copying, distribution, or use of proprietary materials — including software — exposes the organization to legal and reputational risk.' },
      { id: 'A.5.33', name: 'Protection of records', description: 'Records that are required by law, regulation, contract, or business need must be protected against loss, unauthorized access, destruction, and falsification. Retention schedules should define how long each record type must be kept, and disposal processes must ensure that records are destroyed securely when retention periods expire.' },
      { id: 'A.5.34', name: 'Privacy and protection of personal information', description: 'The organization must protect personal data in accordance with applicable privacy laws and its own privacy policy. This includes identifying what personal data it holds, the legal basis for processing it, how long it is retained, and how individuals can exercise their rights. Security controls protecting personal data must be proportionate to the sensitivity of the data.' },
      { id: 'A.5.35', name: 'Independent review of information security', description: 'The organization\'s approach to managing information security should be reviewed independently at planned intervals. Independent reviews — by internal audit, external assessors, or qualified third parties — provide assurance that the ISMS is functioning effectively and that management\'s self-assessment is accurate and complete.' },
      { id: 'A.5.36', name: 'Compliance with policies, rules and standards for information security', description: 'Managers should regularly review whether their areas of responsibility comply with applicable information security policies and technical standards. Compliance reviews help identify gaps before they become vulnerabilities or audit findings, and demonstrate that the organization takes its security commitments seriously at every level.' },
      { id: 'A.5.37', name: 'Documented operating procedures', description: 'Operating procedures for information processing facilities and security-relevant tasks should be documented and made available to all personnel who require them. Procedures reduce reliance on individual knowledge, promote consistent execution, and provide a reference that can be updated as processes evolve or new risks emerge.' },
    ],
  },
  // Theme: People Controls (A.6, 8 controls)
  {
    theme: 'People Controls',
    themeCode: 'A.6',
    controls: [
      { id: 'A.6.1', name: 'Screening', description: 'Background verification of candidates for employment — commensurate with the sensitivity of the role and applicable laws — should be conducted before or upon hire. Screening may include identity verification, employment history checks, criminal record checks, and credential verification. The depth of screening should reflect the level of access the individual will have to sensitive information or systems.' },
      { id: 'A.6.2', name: 'Terms and conditions of employment', description: 'Employment contracts and agreements should clearly set out the employee\'s information security responsibilities, covering obligations that apply both during employment and after it ends. Staff should explicitly acknowledge the organization\'s information security policies and understand that violations may result in disciplinary action.' },
      { id: 'A.6.3', name: 'Information security awareness, education and training', description: 'All staff, contractors, and relevant third parties must receive appropriate information security awareness training when they join the organization and ongoing updates as policies and threats evolve. Training should be relevant to the individual\'s role and responsibilities and should address social engineering, safe data handling, incident reporting, and acceptable use of organizational assets.' },
      { id: 'A.6.4', name: 'Disciplinary process', description: 'The organization must have a formal disciplinary process that is applied consistently when personnel violate information security policies. The process should be proportionate to the severity of the violation and should be communicated to staff so they understand the consequences of non-compliance. The existence of a credible disciplinary process acts as a deterrent to intentional policy violations.' },
      { id: 'A.6.5', name: 'Responsibilities after termination or change of employment', description: 'Information security responsibilities that apply after an employment relationship ends — such as confidentiality obligations and restrictions on use of organizational data — must be defined, communicated, and legally enforceable. The organization must ensure that departing personnel understand that certain obligations survive the end of their employment.' },
      { id: 'A.6.6', name: 'Confidentiality or non-disclosure agreements', description: 'Appropriate confidentiality or non-disclosure agreements should be identified, documented, and reviewed regularly. NDAs should clearly define what information is considered confidential, the duration of the obligation, permitted use of the information, and consequences of breach. Agreements should be signed before individuals are given access to sensitive information.' },
      { id: 'A.6.7', name: 'Remote working', description: 'When personnel work remotely, the organization must ensure that appropriate controls are in place to protect information processed and accessed outside organizational premises. Remote working policies should address the use of secure connections, protection of devices, prohibition against working in public locations without appropriate precautions, and data handling when away from the office.' },
      { id: 'A.6.8', name: 'Information security event reporting', description: 'Personnel must be able and required to report information security events and weaknesses quickly through clear and accessible reporting channels. An environment where staff feel comfortable reporting suspected incidents — without fear of blame if they acted in good faith — is essential for early detection. All reports should be taken seriously and acted upon promptly.' },
    ],
  },
  // Theme: Physical Controls (A.7, 14 controls)
  {
    theme: 'Physical Controls',
    themeCode: 'A.7',
    controls: [
      { id: 'A.7.1', name: 'Physical security perimeters', description: 'Security perimeters — defined boundaries such as walls, card-controlled entry gates, and manned reception areas — must be established to protect areas containing sensitive information or critical ICT infrastructure. The strength of the perimeter should be proportionate to the value of the assets inside and the assessed risk of unauthorized entry.' },
      { id: 'A.7.2', name: 'Physical entry', description: 'Access to secure areas should be controlled by appropriate entry mechanisms such as access cards, PINs, biometrics, or security personnel. Entry controls must ensure that only authorized individuals are admitted and that their presence is recorded. Visitors should be managed separately from permanent staff and escorted when in sensitive areas.' },
      { id: 'A.7.3', name: 'Securing offices, rooms and facilities', description: 'Physical security for offices, server rooms, and other facilities that house information assets should be designed and applied based on a risk assessment. Locking mechanisms, alarm systems, surveillance, and clean desk policies reduce the risk of unauthorized physical access to sensitive information and equipment.' },
      { id: 'A.7.4', name: 'Physical security monitoring', description: 'Premises should be continuously or periodically monitored for unauthorized physical access using appropriate technology such as CCTV, access control logs, intruder detection systems, and security personnel. Monitoring data should be reviewed, and anomalies investigated promptly. Retention periods for surveillance footage should align with legal requirements and investigative needs.' },
      { id: 'A.7.5', name: 'Protecting against physical and environmental threats', description: 'The organization must protect information processing facilities from natural and man-made physical threats including fire, flood, earthquake, explosion, civil unrest, and unauthorized physical intrusion. A physical and environmental threat assessment should inform the design of facilities and the selection of appropriate protective measures.' },
      { id: 'A.7.6', name: 'Working in secure areas', description: 'Activities conducted in secure areas should be subject to specific controls to minimize the risk of accidental or deliberate compromise. These may include restrictions on what can be brought into or out of the area, prohibitions on photography or recording, limiting knowledge of the area\'s existence, and supervising personnel who work alone in sensitive locations.' },
      { id: 'A.7.7', name: 'Clear desk and clear screen', description: 'Sensitive documents and removable media should be stored securely when not in use, and computer screens should be locked when left unattended, even briefly. Clear desk and clear screen policies reduce the risk of sensitive information being read, photographed, or removed by unauthorized individuals who may have incidental access to work areas.' },
      { id: 'A.7.8', name: 'Equipment siting and protection', description: 'Equipment should be positioned and protected to reduce exposure to environmental hazards and opportunities for unauthorized access. Considerations include power supply stability, temperature and humidity, protection from liquid damage, cable management to prevent interference, and ensuring that display screens are not visible to passersby.' },
      { id: 'A.7.9', name: 'Security of assets off-premises', description: 'Information assets taken outside organizational premises — such as laptops, mobile devices, and removable media — must be protected against theft, loss, and unauthorized access. Off-premises use should be authorized, and devices must have appropriate controls such as full-disk encryption and automatic screen locking to protect data if the device is lost or stolen.' },
      { id: 'A.7.10', name: 'Storage media', description: 'Storage media throughout its lifecycle — from procurement through disposal — must be managed to protect the information it contains. This includes registering media, restricting access, securely transporting media when required, and ensuring that data is irreversibly destroyed through appropriate sanitization methods before media is reused, repurposed, or discarded.' },
      { id: 'A.7.11', name: 'Supporting utilities', description: 'Information processing facilities depend on supporting utilities such as electricity, water, heating, and air conditioning. These utilities must be reliable and protected from failures that could interrupt operations. Uninterruptible power supplies, backup generators, and environmental monitoring systems reduce the risk of utility failure causing downtime or damage to equipment.' },
      { id: 'A.7.12', name: 'Cabling security', description: 'Power and telecommunications cabling that carries data or supports information services must be protected against interception, interference, and physical damage. Cable management practices include routing cables through conduits or raised floors, separating power and data cables, and labeling cable runs to facilitate maintenance and fault investigation.' },
      { id: 'A.7.13', name: 'Equipment maintenance', description: 'Equipment must be maintained in accordance with manufacturer specifications and organizational procedures to ensure its continued availability and integrity. Maintenance records should be kept, maintenance activities should be authorized, and equipment returned from off-site maintenance should be inspected to verify that it has not been tampered with or that sensitive data has not been left on it.' },
      { id: 'A.7.14', name: 'Secure disposal or re-use of equipment', description: 'Before equipment is disposed of or repurposed, all sensitive data stored on it must be destroyed or overwritten using methods appropriate to the classification of the data it contained. Physical destruction, degaussing, or cryptographic erasure may be appropriate depending on the type of storage media and the sensitivity of the information.' },
    ],
  },
  // Theme: Technological Controls (A.8, 34 controls)
  {
    theme: 'Technological Controls',
    themeCode: 'A.8',
    controls: [
      { id: 'A.8.1', name: 'User endpoint devices', description: 'Endpoint devices used to access organizational information — including laptops, desktops, mobile phones, and tablets — must be managed and secured. Security requirements should address device configuration, patch management, encryption, remote wipe capability, and restrictions on what software can be installed or what networks the device may connect to.' },
      { id: 'A.8.2', name: 'Privileged access rights', description: 'Privileged access — such as system administrator, database administrator, or root access — must be managed with particular care. Privileged accounts should be granted only to personnel who genuinely need them for their role, should be subject to stronger authentication requirements, and their use should be logged and monitored more closely than standard user accounts.' },
      { id: 'A.8.3', name: 'Information access restriction', description: 'Access to information and application functions should be restricted in accordance with the organization\'s access control policy. Systems should enforce access restrictions technically, not rely solely on policy, so that users can only access the information and functions their role requires, and cannot access others\' data even if they attempt to do so.' },
      { id: 'A.8.4', name: 'Access to source code', description: 'Access to application source code, development tools, and software libraries must be restricted to authorized personnel only. Unrestricted access to source code introduces risk of unauthorized modification, intellectual property theft, and introduction of vulnerabilities. Source code repositories should be protected by access controls, and all changes should be tracked.' },
      { id: 'A.8.5', name: 'Secure authentication', description: 'Authentication technologies and procedures must be implemented to verify the identity of users and systems before granting access. Authentication strength should be commensurate with the sensitivity of the access being granted. Multi-factor authentication should be applied to privileged access and to systems that process or store sensitive data.' },
      { id: 'A.8.6', name: 'Capacity management', description: 'The capacity of information processing resources — computing power, storage, network bandwidth, and other technical resources — must be monitored and projected. Capacity planning ensures that systems do not become unavailable due to resource exhaustion and that the organization can predict and accommodate future demand before it causes a service degradation.' },
      { id: 'A.8.7', name: 'Protection against malware', description: 'Technical and procedural controls must be implemented to detect, prevent, and recover from malware infections. Defenses include anti-malware software, email and web filtering, application whitelisting, user awareness about the risks of opening unexpected attachments or links, and processes for handling suspected infections quickly to limit spread.' },
      { id: 'A.8.8', name: 'Management of technical vulnerabilities', description: 'The organization must have a defined process for identifying, evaluating, and remediating technical vulnerabilities in its systems. This includes subscribing to vulnerability intelligence feeds, assessing each vulnerability against the organization\'s context, prioritizing remediation based on risk, and tracking vulnerabilities through to resolution or documented acceptance.' },
      { id: 'A.8.9', name: 'Configuration management', description: 'Secure configurations must be established, documented, implemented, and maintained for all hardware, software, and network components. Baseline configurations provide a known-good state against which deviations can be detected. Configuration management processes should control how changes are made and ensure that new deployments start from a secure baseline rather than vendor defaults.' },
      { id: 'A.8.10', name: 'Information deletion', description: 'Information that is no longer needed for the purpose for which it was collected must be deleted in a manner that prevents recovery. Secure deletion processes are especially important for personal data (to meet privacy obligations), sensitive business data, and any data held in cloud environments where storage is shared with other tenants.' },
      { id: 'A.8.11', name: 'Data masking', description: 'Where sensitive data must be used in contexts where full exposure is not necessary — such as testing, analytics, or support — data masking techniques should be applied to substitute realistic but non-sensitive values. Masking reduces the exposure of real data and limits the impact of a breach in non-production environments.' },
      { id: 'A.8.12', name: 'Data leakage prevention', description: 'Technical controls should be implemented to detect and prevent unauthorized transfer of sensitive data outside the organization. Data leakage prevention tools monitor channels such as email, web uploads, USB transfers, and printing to identify and block attempted exfiltration of classified or regulated data based on content inspection and policy rules.' },
      { id: 'A.8.13', name: 'Information backup', description: 'Backup copies of information, software, and system configurations must be taken and retained in accordance with a defined backup policy. Backups should be stored securely in a location separate from the primary system, tested regularly to verify that data can be recovered successfully, and protected from unauthorized access or modification.' },
      { id: 'A.8.14', name: 'Redundancy of information processing facilities', description: 'Critical information processing systems should be designed with sufficient redundancy to meet availability requirements. Redundancy may be achieved through duplicate hardware, clustered systems, geographically separated data centers, failover mechanisms, or a combination of approaches. Redundancy designs should be tested under realistic failure scenarios.' },
      { id: 'A.8.15', name: 'Logging', description: 'Information systems should generate logs of security-relevant events and those logs must be protected from tampering and unauthorized access. Effective logging enables investigation of incidents, supports audit requirements, and provides evidence that controls are operating as intended. Log policies should define what is logged, log retention periods, and who may access log data.' },
      { id: 'A.8.16', name: 'Monitoring activities', description: 'Networks, systems, and applications should be continuously monitored for anomalies that may indicate a security incident or policy violation. Monitoring processes should be defined, automated where practical, and reviewed by personnel with the skills to interpret alerts correctly. Alerting thresholds should be tuned to minimize false positives while ensuring genuine threats are not missed.' },
      { id: 'A.8.17', name: 'Clock synchronization', description: 'System clocks across all information processing systems must be synchronized to a common, authoritative time source. Accurate timestamps are essential for correlating events across multiple systems during an incident investigation and for ensuring that log records have legal and audit value. Time synchronization should be verified and deviations corrected automatically.' },
      { id: 'A.8.18', name: 'Use of privileged utility programs', description: 'Utility software that can override system or application controls — such as diagnostic tools, network analyzers, and password recovery tools — must be tightly controlled. Use should be authorized, limited to specific need, and logged. Such tools should not be routinely available to general users and should be removed from systems when not in active use.' },
      { id: 'A.8.19', name: 'Installation of software on operational systems', description: 'Procedures must control what software may be installed on production systems, who is authorized to perform installations, and how the process is documented. Uncontrolled software installation introduces risk of malware, licensing violations, configuration drift, and compatibility problems. Approved software lists and change management processes should govern installations.' },
      { id: 'A.8.20', name: 'Networks security', description: 'Networks must be managed, controlled, and protected to safeguard systems and data transmitted across them. Network security measures include firewalls, segmentation, intrusion detection, traffic filtering, and encrypted communications. The security of external connections — including internet access and connections to partner organizations — requires particular attention.' },
      { id: 'A.8.21', name: 'Security of network services', description: 'Security features, service levels, and management requirements for all network services — whether provided internally or by third parties — must be identified and incorporated into network service agreements. Organizations must verify that service providers implement the agreed security measures and understand their responsibilities where services are shared.' },
      { id: 'A.8.22', name: 'Segregation of networks', description: 'Groups of information services, users, and systems should be logically or physically segregated on the network. Segmentation limits the ability of an attacker who compromises one part of the network to move laterally to other parts. Segmentation boundaries should be enforced by firewalls or equivalent controls, and the flow of traffic between segments should be restricted to what is necessary.' },
      { id: 'A.8.23', name: 'Web filtering', description: 'Access to external websites and web-based services should be managed and filtered to protect users from malicious content and to enforce acceptable use policies. Web filtering controls reduce the risk of drive-by malware downloads, phishing via web forms, and unauthorized data exfiltration through web channels. Categories of blocked content should be defined and regularly reviewed.' },
      { id: 'A.8.24', name: 'Use of cryptography', description: 'Cryptographic controls must be used to protect the confidentiality, integrity, and authenticity of information based on a defined policy. The cryptography policy should address which algorithms and key lengths are approved, when encryption is required, and how cryptographic keys are managed. Use of deprecated or weak algorithms should be prohibited.' },
      { id: 'A.8.25', name: 'Secure development life cycle', description: 'Security must be embedded into the software development process from requirements through deployment and maintenance. Secure development practices include threat modeling, security requirements definition, secure coding standards, peer code review, and security testing at multiple stages. Security activities should be proportionate to the risk profile of the software being developed.' },
      { id: 'A.8.26', name: 'Application security requirements', description: 'Information security requirements — including functional security requirements and non-functional requirements such as resilience and regulatory compliance — must be identified and documented when developing or acquiring applications. Security requirements should be specified early enough to influence design decisions and procurement criteria.' },
      { id: 'A.8.27', name: 'Secure system architecture and engineering principles', description: 'Systems should be designed, engineered, and maintained using security principles that minimize attack surface, limit the impact of compromises, and facilitate detection of attacks. Principles such as defense in depth, fail-safe defaults, economy of mechanism, separation of privilege, and zero trust should guide architectural decisions.' },
      { id: 'A.8.28', name: 'Secure coding', description: 'Developers must follow secure coding practices to prevent common vulnerabilities such as injection flaws, insecure deserialization, broken authentication, and exposure of sensitive data. Secure coding standards should be documented, communicated to developers, and enforced through code review, automated scanning, and developer training.' },
      { id: 'A.8.29', name: 'Security testing in development and acceptance', description: 'Security testing must be performed throughout the development lifecycle and before systems are accepted into production. Testing activities may include static code analysis, dynamic application testing, penetration testing, vulnerability scanning, and review of security configurations. Test results should be formally assessed and defects remediated before release.' },
      { id: 'A.8.30', name: 'Outsourced development', description: 'When software development is outsourced to external parties, the organization must ensure that its security requirements are met by the development contractor. Contracts should specify coding standards, security testing obligations, code ownership, and the right to audit. The organization should review and test software produced by third parties before deploying it to production.' },
      { id: 'A.8.31', name: 'Separation of development, test and production environments', description: 'Development, testing, and production environments should be separated to reduce the risk of unauthorized access or changes to the production system. Testing should use anonymized or synthetic data rather than live production data. Promotion of code from development through test to production should follow a controlled process with appropriate approvals.' },
      { id: 'A.8.32', name: 'Change management', description: 'Changes to information processing facilities and systems must follow a formal change management process that evaluates the security implications before implementation. Change management prevents unauthorized modifications and ensures that changes are planned, tested, documented, authorized, and reversible if they cause problems. Emergency change procedures should be defined for situations where the standard process cannot be followed.' },
      { id: 'A.8.33', name: 'Test information', description: 'Test data should be selected, controlled, and protected carefully. When production data must be used for testing, it should be sanitized or masked to remove or substitute sensitive values. Access to test environments and test data should be restricted, and test data should be removed or destroyed when testing is complete.' },
      { id: 'A.8.34', name: 'Protection of information systems during audit testing', description: 'Audit and testing activities — including penetration tests and vulnerability scans — that involve accessing production systems must be planned and agreed in advance to minimize disruption. Access provided to auditors should be restricted to what is necessary, read-only where possible, and revoked promptly when the audit is complete. Audit tools should be protected against misuse.' },
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
      .eq('abbreviation', 'ISO 27001')
      .single();

    if (frameworkError || !framework) {
      return new Response(
        JSON.stringify({ error: 'ISO 27001 framework not found in compliance_frameworks table' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find or create source record for ISO 27001
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
          name: 'ISO/IEC 27001:2022 Information Security Management Systems',
          url: 'https://www.iso.org/standard/27001',
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
        JSON.stringify({ error: 'Failed to find or create ISO 27001 source' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: job } = await supabase
      .from('ingest_jobs')
      .insert({ source_id: source.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();

    let documentsIngested = 0;

    // Ingest organizational clauses (4–10)
    for (const clause of ISO27001_CLAUSES) {
      const clauseContent = `# ISO/IEC 27001:2022 — ${clause.id}: ${clause.name}\n\nFramework: ISO/IEC 27001:2022\nSection: ${clause.id} — ${clause.name}\n\n## Overview\n${clause.description}\n\n## Relevance to ISMS\nThis clause is a mandatory requirement of ISO/IEC 27001:2022. Organizations seeking certification must demonstrate conformity with all clauses 4 through 10. Clause requirements cannot be excluded from the scope of the ISMS.`;

      const clauseMeta = { clause_id: clause.id, clause_name: clause.name, section_type: 'mandatory_clause', version: '2022' };

      const { data: clauseDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `ISO 27001:2022 — ${clause.id}: ${clause.name}`,
        document_type: 'framework',
        url: 'https://www.iso.org/standard/27001',
        version: '2022',
        raw_content: clauseContent,
        metadata: clauseMeta,
        is_indexed: true,
      }).select('id').single();

      if (clauseDoc) await insertChunk(clauseDoc.id, clauseContent, clauseMeta);
      documentsIngested++;
    }

    // Ingest Annex A controls by theme
    for (const theme of ISO27001_ANNEX_A) {
      // Theme-level document
      const themeContent = `# ISO/IEC 27001:2022 Annex A — ${theme.themeCode}: ${theme.theme}\n\nFramework: ISO/IEC 27001:2022\nAnnex A Theme: ${theme.theme} (${theme.themeCode})\nControl Count: ${theme.controls.length}\n\nThis theme contains ${theme.controls.length} controls within ISO/IEC 27001:2022 Annex A. Organizations must evaluate each control for applicability and document their decision in the Statement of Applicability (SoA). Controls may be excluded only when there are no applicable risks and the exclusion is justified.\n\n## Controls in this Theme\n${theme.controls.map(c => `- **${c.id}** — ${c.name}: ${c.description.slice(0, 120)}...`).join('\n')}`;

      const themeMeta = { theme_code: theme.themeCode, theme_name: theme.theme, section_type: 'annex_a_theme', version: '2022' };

      const { data: themeDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `ISO 27001:2022 Annex A — ${theme.themeCode}: ${theme.theme}`,
        document_type: 'framework',
        url: 'https://www.iso.org/standard/27001',
        version: '2022',
        raw_content: themeContent,
        metadata: themeMeta,
        is_indexed: true,
      }).select('id').single();

      if (themeDoc) await insertChunk(themeDoc.id, themeContent, themeMeta);
      documentsIngested++;

      // Control-level documents
      for (const control of theme.controls) {
        const controlContent = `# ${control.id} — ${control.name}\n\n## Framework\nISO/IEC 27001:2022\n\n## Annex A Theme\n${theme.themeCode} — ${theme.theme}\n\n## Control Reference\n${control.id}\n\n## Control Objective\n${control.description}\n\n## Implementation Guidance\nOrganizations should assess whether this control is applicable to their ISMS scope and risk profile. Where applicable, implementation evidence may include documented policies, procedures, technical configurations, training records, and audit logs. The Statement of Applicability (SoA) must record whether this control is implemented or excluded, with justification for any exclusion.\n\n## Key Considerations for Compliance Professionals\n- Applicability must be determined in the context of the risk assessment results\n- Excluded controls require documented justification in the SoA\n- Implementation should be proportionate to the risk level identified\n- Controls should be reviewed when significant changes occur to the ISMS scope or risk environment`;

        const controlMeta = {
          control_id: control.id,
          control_name: control.name,
          theme_code: theme.themeCode,
          theme_name: theme.theme,
          section_type: 'annex_a_control',
          version: '2022',
        };

        const { data: controlDoc } = await supabase.from('documents').insert({
          source_id: source.id,
          framework_id: framework.id,
          title: `${control.id} — ${control.name}`,
          document_type: 'control',
          url: 'https://www.iso.org/standard/27001',
          version: '2022',
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
      JSON.stringify({ success: true, documents_ingested: documentsIngested, message: 'ISO/IEC 27001:2022 ingested successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('ISO 27001 ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
