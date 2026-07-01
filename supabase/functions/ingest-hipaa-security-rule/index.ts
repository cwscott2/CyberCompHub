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

type SafeguardType = 'administrative' | 'physical' | 'technical';
type Standard = 'required' | 'addressable';

interface HipaaControl {
  cfr: string;          // e.g. "164.308(a)(1)"
  section: string;      // e.g. "Administrative Safeguards"
  standard: string;     // e.g. "Security Management Process"
  type: SafeguardType;
  implementation: Standard;
  specifications: Array<{ name: string; status: Standard; description: string }>;
  guidance: string;
  riskContext: string;
}

const HIPAA_CONTROLS: HipaaControl[] = [
  // ── ADMINISTRATIVE SAFEGUARDS (164.308) ────────────────────────────────
  {
    cfr: '164.308(a)(1)',
    section: 'Administrative Safeguards',
    standard: 'Security Management Process',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Risk Analysis', status: 'required', description: 'Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of ePHI' },
      { name: 'Risk Management', status: 'required', description: 'Implement security measures sufficient to reduce risks and vulnerabilities to a reasonable and appropriate level' },
      { name: 'Sanction Policy', status: 'required', description: 'Apply appropriate sanctions against workforce members who fail to comply with security policies and procedures' },
      { name: 'Information System Activity Review', status: 'required', description: 'Implement procedures to regularly review records of information system activity such as audit logs, access reports, and security incident tracking reports' },
    ],
    guidance: 'The Security Management Process is the foundation of HIPAA Security Rule compliance. Risk analysis must be organization-wide and technology-neutral, assessing all ePHI regardless of format or system. Risk management must address identified risks through documented mitigation strategies. HHS has cited inadequate risk analysis and risk management as the most common HIPAA Security Rule violation in enforcement actions.',
    riskContext: 'Failure to conduct and document a thorough risk analysis is the single most cited HIPAA violation in OCR enforcement actions. Organizations must demonstrate a continuous risk management process, not a one-time assessment.',
  },
  {
    cfr: '164.308(a)(2)',
    section: 'Administrative Safeguards',
    standard: 'Assigned Security Responsibility',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Security Official', status: 'required', description: 'Identify the security official who is responsible for the development and implementation of the policies and procedures required by HIPAA Security Rule' },
    ],
    guidance: 'A named individual must be designated as the HIPAA Security Officer. This person is responsible for overseeing the security program, ensuring policies are developed and implemented, and serving as the point of contact for security-related matters. The role can be combined with the Privacy Officer in smaller organizations but the responsibilities must be clearly documented.',
    riskContext: 'Without a designated security official, accountability is diffuse and security programs tend to be inconsistent and undocumented.',
  },
  {
    cfr: '164.308(a)(3)',
    section: 'Administrative Safeguards',
    standard: 'Workforce Security',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Authorization and/or Supervision', status: 'addressable', description: 'Implement procedures for the authorization and/or supervision of workforce members who work with ePHI or in locations where it might be accessed' },
      { name: 'Workforce Clearance Procedure', status: 'addressable', description: 'Implement procedures to determine that the access of a workforce member to ePHI is appropriate' },
      { name: 'Termination Procedures', status: 'addressable', description: 'Implement procedures for terminating access to ePHI when the employment or other arrangement ends or as required by workforce access authorization determinations' },
    ],
    guidance: 'Workforce security ensures that only authorized workforce members have access to ePHI, and that access is revoked promptly upon termination. Background checks, role-based access authorization, and formal offboarding procedures are key components. "Addressable" specifications must be implemented if reasonable and appropriate, or an equivalent alternative must be documented with rationale for why the standard specification was not adopted.',
    riskContext: 'Insider threats — both malicious and accidental — from workforce members account for a significant portion of healthcare data breaches. Prompt termination of access is critical to prevent former employee access.',
  },
  {
    cfr: '164.308(a)(4)',
    section: 'Administrative Safeguards',
    standard: 'Information Access Management',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Isolating Health Care Clearinghouse Functions', status: 'required', description: 'If a health care clearinghouse is part of a larger organization, implement policies and procedures that protect the ePHI of the clearinghouse from unauthorized access by the larger organization' },
      { name: 'Access Authorization', status: 'addressable', description: 'Implement policies and procedures for granting access to ePHI — for example, through access to a workstation, transaction, program, process, or other mechanism' },
      { name: 'Access Establishment and Modification', status: 'addressable', description: 'Implement policies and procedures that establish, document, review, and modify a user\'s right of access to a workstation, transaction, program, or process' },
    ],
    guidance: 'Access to ePHI must be granted based on minimum necessary principles. Access rights should be role-based and formally approved. Access must be reviewed periodically and revoked or modified when roles change. Role-based access control (RBAC) systems aligned to job functions are the recommended approach.',
    riskContext: 'Excessive access to ePHI is a significant risk factor. The minimum necessary standard under the Privacy Rule reinforces the need for granular, role-appropriate access controls.',
  },
  {
    cfr: '164.308(a)(5)',
    section: 'Administrative Safeguards',
    standard: 'Security Awareness and Training',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Security Reminders', status: 'addressable', description: 'Periodic security updates to all members of the workforce' },
      { name: 'Protection from Malicious Software', status: 'addressable', description: 'Procedures for guarding against, detecting, and reporting malicious software' },
      { name: 'Log-in Monitoring', status: 'addressable', description: 'Procedures for monitoring log-in attempts and reporting discrepancies' },
      { name: 'Password Management', status: 'addressable', description: 'Procedures for creating, changing, and safeguarding passwords' },
    ],
    guidance: 'Security awareness training must be provided to all workforce members, including management, upon hire and periodically thereafter. Training should cover phishing awareness, password security, physical security, and how to recognize and report security incidents. Annual training is the minimum expectation; quarterly refreshers are best practice. Training records must be retained.',
    riskContext: 'Phishing attacks targeting healthcare employees are the primary initial access vector in ransomware attacks against healthcare organizations. Security awareness training is one of the highest-ROI controls available.',
  },
  {
    cfr: '164.308(a)(6)',
    section: 'Administrative Safeguards',
    standard: 'Security Incident Procedures',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Response and Reporting', status: 'required', description: 'Identify and respond to suspected or known security incidents; mitigate, to the extent practicable, harmful effects of security incidents that are known to the covered entity or its business associate; and document security incidents and their outcomes' },
    ],
    guidance: 'A documented incident response plan must exist and be tested. All security incidents — not just breaches — must be documented. Incidents involving ePHI that meet the breach definition trigger HIPAA Breach Notification Rule obligations. The incident response plan should integrate with the breach notification process and define roles, communication chains, containment and eradication steps, and post-incident review procedures.',
    riskContext: 'Healthcare is the most targeted sector for ransomware. OCR expects covered entities to have tested, documented incident response capabilities, not ad-hoc responses.',
  },
  {
    cfr: '164.308(a)(7)',
    section: 'Administrative Safeguards',
    standard: 'Contingency Plan',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Data Backup Plan', status: 'required', description: 'Establish and implement procedures to create and maintain retrievable exact copies of ePHI' },
      { name: 'Disaster Recovery Plan', status: 'required', description: 'Establish and implement procedures to restore any loss of data' },
      { name: 'Emergency Mode Operation Plan', status: 'required', description: 'Establish and implement procedures to enable continuation of critical business processes for protection of ePHI while operating in emergency mode' },
      { name: 'Testing and Revision Procedures', status: 'addressable', description: 'Implement procedures for periodic testing and revision of contingency plans' },
      { name: 'Applications and Data Criticality Analysis', status: 'addressable', description: 'Assess the relative criticality of specific applications and data in support of other contingency plan components' },
    ],
    guidance: 'The contingency plan must address data backup, disaster recovery, and emergency operations. Backups must be encrypted and tested for restorability. Recovery time objectives (RTOs) and recovery point objectives (RPOs) should be documented and tested. Cloud backups must be encrypted and access-controlled. Ransomware resilience — including offline or immutable backups — is a critical current-environment consideration.',
    riskContext: 'Ransomware attacks that encrypt ePHI and demand payment for decryption are the leading cause of HIPAA breach notifications. Tested, isolated backups are the primary technical defense.',
  },
  {
    cfr: '164.308(a)(8)',
    section: 'Administrative Safeguards',
    standard: 'Evaluation',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Periodic Technical and Nontechnical Evaluation', status: 'required', description: 'Perform a periodic technical and nontechnical evaluation, based initially upon the standards implemented under this rule and, subsequently, in response to environmental or operational changes affecting the security of ePHI' },
    ],
    guidance: 'Covered entities and business associates must periodically evaluate their security measures to ensure they continue to meet HIPAA Security Rule requirements. Evaluations should occur at least annually and whenever significant environmental or operational changes occur. Technical evaluations may include vulnerability scans and penetration tests. Non-technical evaluations should assess policies, procedures, and training programs.',
    riskContext: 'Technology and threat landscapes change rapidly. An evaluation conducted three years ago may not reflect current risks. Continuous assessment — not just periodic compliance audits — is the modern expectation.',
  },
  {
    cfr: '164.308(b)(1)',
    section: 'Administrative Safeguards',
    standard: 'Business Associate Contracts and Other Arrangements',
    type: 'administrative',
    implementation: 'required',
    specifications: [
      { name: 'Business Associate Contracts', status: 'required', description: 'A covered entity may permit a business associate to create, receive, maintain, or transmit ePHI on its behalf only if the covered entity obtains a Business Associate Agreement (BAA) from the business associate' },
      { name: 'Other Arrangements', status: 'required', description: 'When a covered entity and business associate are both governmental entities, the covered entity may comply with the BAA requirement through a memorandum of understanding or other legal arrangement' },
    ],
    guidance: 'Business Associate Agreements (BAAs) are required before sharing ePHI with any vendor, contractor, or partner who creates, receives, maintains, or transmits ePHI on the covered entity\'s behalf. BAAs must include specific HIPAA-required provisions. Cloud service providers, EHR vendors, billing services, and IT managed service providers typically require BAAs. Business associates are directly liable under HIPAA and must sign BAAs with their own subcontractors.',
    riskContext: 'Third-party vendors are a significant breach vector in healthcare. Inadequate BAA management and vendor oversight have resulted in major enforcement actions. BAAs are legally required — not optional — before ePHI can be shared.',
  },
  // ── PHYSICAL SAFEGUARDS (164.310) ─────────────────────────────────────
  {
    cfr: '164.310(a)(1)',
    section: 'Physical Safeguards',
    standard: 'Facility Access Controls',
    type: 'physical',
    implementation: 'required',
    specifications: [
      { name: 'Contingency Operations', status: 'addressable', description: 'Establish and implement procedures that allow facility access in support of restoration of lost data under the disaster recovery plan and emergency mode operations plan in the event of an emergency' },
      { name: 'Facility Security Plan', status: 'addressable', description: 'Implement policies and procedures to safeguard the facility and the equipment therein from unauthorized physical access, tampering, and theft' },
      { name: 'Access Control and Validation Procedures', status: 'addressable', description: 'Implement procedures to control and validate a person\'s access to facilities based on their role or function, including visitor control and control of access to software programs for testing and revision' },
      { name: 'Maintenance Records', status: 'addressable', description: 'Implement policies and procedures to document repairs and modifications to the physical components of a facility which are related to security' },
    ],
    guidance: 'Physical access to facilities where ePHI is stored or processed must be controlled. This includes data centers, server rooms, workstation areas, and medical records storage areas. Controls include badge readers, locks, security cameras, visitor logs, and escort requirements. Facility security plans should document all physical access controls and be reviewed periodically.',
    riskContext: 'Physical theft of servers, laptops, and storage media containing unencrypted ePHI remains a significant breach vector, particularly in smaller healthcare organizations.',
  },
  {
    cfr: '164.310(b)',
    section: 'Physical Safeguards',
    standard: 'Workstation Use',
    type: 'physical',
    implementation: 'required',
    specifications: [
      { name: 'Workstation Use Policy', status: 'required', description: 'Implement policies and procedures that specify the proper functions to be performed, the manner in which those functions are to be performed, and the physical attributes of the surroundings of a specific workstation or class of workstation that can be used to access ePHI' },
    ],
    guidance: 'Workstation use policies must address what activities are permitted on workstations that access ePHI, including restrictions on personal use, requirements for screen positioning to prevent visual access by unauthorized individuals, and procedures for locking screens when unattended. Remote work arrangements require additional controls including VPN requirements and home office security standards.',
    riskContext: 'Remote work has significantly expanded the workstation security risk surface in healthcare. Screen privacy and unauthorized household member access are emerging concerns.',
  },
  {
    cfr: '164.310(c)',
    section: 'Physical Safeguards',
    standard: 'Workstation Security',
    type: 'physical',
    implementation: 'required',
    specifications: [
      { name: 'Physical Safeguards for Workstations', status: 'required', description: 'Implement physical safeguards for all workstations that access ePHI to restrict access to authorized users' },
    ],
    guidance: 'Workstations accessing ePHI must be physically secured. This includes cable locks for laptops, positioning screens to avoid visual access by unauthorized individuals, automatic screen locks after inactivity, and restrictions on who can physically access workstations. In clinical settings, shared workstations require role-switching or session management controls.',
    riskContext: 'Unattended workstations with active ePHI sessions are a significant risk in clinical environments. Automatic timeout and screen lock policies are essential mitigating controls.',
  },
  {
    cfr: '164.310(d)(1)',
    section: 'Physical Safeguards',
    standard: 'Device and Media Controls',
    type: 'physical',
    implementation: 'required',
    specifications: [
      { name: 'Disposal', status: 'required', description: 'Implement policies and procedures to address the final disposition of ePHI, and/or the hardware or electronic media on which it is stored' },
      { name: 'Media Re-use', status: 'required', description: 'Implement procedures for removal of ePHI from electronic media before the media are made available for re-use' },
      { name: 'Accountability', status: 'addressable', description: 'Maintain a record of the movements of hardware and electronic media and any person responsible therefore' },
      { name: 'Data Backup and Storage', status: 'addressable', description: 'Create a retrievable, exact copy of ePHI, when needed, before movement of equipment' },
    ],
    guidance: 'All media containing ePHI must be securely disposed of using NIST SP 800-88 Guidelines for Media Sanitization. Hard drives must be wiped, degaussed, or physically destroyed. Mobile devices must be remotely wiped before disposal or re-use. A media inventory should track all devices containing ePHI, their location, and their ultimate disposition. Encryption of all portable media is strongly recommended.',
    riskContext: 'Improper disposal of hard drives, USB drives, and mobile devices is a persistent source of HIPAA breaches. NIST-compliant sanitization procedures and a documented chain of custody are essential.',
  },
  // ── TECHNICAL SAFEGUARDS (164.312) ────────────────────────────────────
  {
    cfr: '164.312(a)(1)',
    section: 'Technical Safeguards',
    standard: 'Access Control',
    type: 'technical',
    implementation: 'required',
    specifications: [
      { name: 'Unique User Identification', status: 'required', description: 'Assign a unique name and/or number for identifying and tracking user identity in information systems that contain or use ePHI' },
      { name: 'Emergency Access Procedure', status: 'required', description: 'Establish and implement procedures for obtaining necessary ePHI during an emergency' },
      { name: 'Automatic Logoff', status: 'addressable', description: 'Implement electronic procedures that terminate an electronic session after a predetermined time of inactivity' },
      { name: 'Encryption and Decryption', status: 'addressable', description: 'Implement a mechanism to encrypt and decrypt ePHI' },
    ],
    guidance: 'Shared accounts for ePHI system access are prohibited — all users must have unique identifiers. Emergency access procedures must be documented and tested. Automatic logoff should be set to appropriate timeframes based on workstation context (shorter for high-traffic clinical areas). While encryption is addressable, HHS has strongly encouraged encryption of ePHI at rest; unencrypted ePHI on lost/stolen media is a leading cause of reportable breaches.',
    riskContext: 'HHS has been clear that while encryption is technically "addressable," organizations that do not encrypt ePHI at rest take on substantial breach notification and enforcement risk. Encryption is effectively the industry standard expectation.',
  },
  {
    cfr: '164.312(b)',
    section: 'Technical Safeguards',
    standard: 'Audit Controls',
    type: 'technical',
    implementation: 'required',
    specifications: [
      { name: 'Audit Controls', status: 'required', description: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use ePHI' },
    ],
    guidance: 'Audit logs must capture access to ePHI systems and be retained for review. Logs should capture who accessed what ePHI, when, and from where. Logs must be protected from unauthorized modification or deletion. Regular review of audit logs is required (see 164.308(a)(1) — Information System Activity Review). SIEM solutions are strongly recommended to enable scalable log management and anomaly detection in healthcare environments.',
    riskContext: 'Audit controls are foundational to detecting unauthorized access, including insider threat activity. Without comprehensive audit logging, organizations cannot detect inappropriate access to patient records or investigate post-breach to determine what was accessed.',
  },
  {
    cfr: '164.312(c)(1)',
    section: 'Technical Safeguards',
    standard: 'Integrity',
    type: 'technical',
    implementation: 'required',
    specifications: [
      { name: 'Mechanism to Authenticate ePHI', status: 'addressable', description: 'Implement electronic mechanisms to corroborate that ePHI has not been altered or destroyed in an unauthorized manner' },
    ],
    guidance: 'Technical controls must protect ePHI from unauthorized alteration or destruction. Hash functions, digital signatures, error-correcting codes, and checksums are technical integrity controls. File integrity monitoring (FIM) solutions can detect unauthorized changes to ePHI files and system configurations. Data validation controls in applications that process ePHI also contribute to integrity assurance.',
    riskContext: 'ePHI integrity is critical — unauthorized alteration of medical records can have life-safety consequences. Ransomware that encrypts ePHI also constitutes an integrity violation under HIPAA.',
  },
  {
    cfr: '164.312(d)',
    section: 'Technical Safeguards',
    standard: 'Person or Entity Authentication',
    type: 'technical',
    implementation: 'required',
    specifications: [
      { name: 'Person or Entity Authentication', status: 'required', description: 'Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed' },
    ],
    guidance: 'Authentication mechanisms must verify the identity of users and systems before granting access to ePHI. Multi-factor authentication (MFA) is strongly recommended and effectively the current standard of care for healthcare organizations. Password-only authentication is increasingly insufficient given the threat environment. Biometrics, smart cards, FIDO2 tokens, and authenticator apps are all acceptable second factors. Privileged access should require MFA even on internal networks.',
    riskContext: 'Credential theft and phishing are the primary means by which threat actors gain initial access to healthcare networks. MFA defeats the majority of credential-based attacks. HHS has repeatedly emphasized MFA as a critical security control.',
  },
  {
    cfr: '164.312(e)(1)',
    section: 'Technical Safeguards',
    standard: 'Transmission Security',
    type: 'technical',
    implementation: 'required',
    specifications: [
      { name: 'Encryption', status: 'addressable', description: 'Implement a mechanism to encrypt ePHI in transit whenever deemed appropriate' },
      { name: 'Integrity Controls', status: 'addressable', description: 'Implement security measures to ensure that electronically transmitted ePHI is not improperly modified without detection until disposed of' },
    ],
    guidance: 'ePHI transmitted over networks — including internal networks, the internet, and wireless networks — must be protected. TLS 1.2 or higher is the minimum acceptable standard for encrypting ePHI in transit; TLS 1.3 is recommended. Unencrypted transmission of ePHI over any public network, email without encryption, and unencrypted wireless are high-risk practices. End-to-end encryption is preferred for sensitive clinical communications.',
    riskContext: 'Transmission of ePHI in cleartext over public networks is a HIPAA violation. Many breaches involve interception of unencrypted transmissions or misconfigured FTP/email servers sending ePHI in the clear.',
  },
];

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding error: ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

function buildContent(control: HipaaControl): string {
  const specsText = control.specifications
    .map(s => `- **${s.name}** (${s.status}): ${s.description}`)
    .join('\n');

  const lines = [
    `# HIPAA Security Rule — ${control.standard}`,
    `**CFR Reference:** ${control.cfr}`,
    `**Safeguard Category:** ${control.section}`,
    `**Standard Type:** ${control.type.charAt(0).toUpperCase() + control.type.slice(1)} Safeguard`,
    `**Implementation:** ${control.implementation.charAt(0).toUpperCase() + control.implementation.slice(1)}`,
    '',
    `## Implementation Specifications`,
    specsText,
    '',
    `## Compliance Guidance`,
    control.guidance,
    '',
    `## Risk Context`,
    control.riskContext,
  ];
  return lines.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── 1. Resolve or create framework ────────────────────────────────────
    let frameworkId: string;
    const { data: existingFw, error: fwErr } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'HIPAA')
      .limit(1);

    if (fwErr) throw new Error(`Framework lookup error: ${fwErr.message}`);

    if (existingFw && existingFw.length > 0) {
      frameworkId = existingFw[0].id;
    } else {
      const { data: newFw, error: insertFwErr } = await supabase
        .from('compliance_frameworks')
        .insert({
          name: 'Health Insurance Portability and Accountability Act — Security Rule',
          abbreviation: 'HIPAA',
          category: 'sox',
          version: '2013',
          description: 'Federal standards for protecting electronic protected health information (ePHI), covering administrative, physical, and technical safeguards for covered entities and business associates',
        })
        .select('id')
        .single();
      if (insertFwErr) throw new Error(`Framework insert error: ${insertFwErr.message}`);
      frameworkId = newFw.id;
    }

    // ── 2. Resolve or create source ────────────────────────────────────────
    let sourceId: string;
    const { data: existingSrc, error: srcErr } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', frameworkId)
      .limit(1);

    if (srcErr) throw new Error(`Source lookup error: ${srcErr.message}`);

    if (existingSrc && existingSrc.length > 0) {
      sourceId = existingSrc[0].id;
    } else {
      const { data: newSrc, error: insertSrcErr } = await supabase
        .from('sources')
        .insert({
          framework_id: frameworkId,
          name: 'HIPAA Security Rule — 45 CFR Parts 160 and 164',
          url: 'https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html',
          source_type: 'webpage',
          scraper_type: 'generic-webpage',
        })
        .select('id')
        .single();
      if (insertSrcErr) throw new Error(`Source insert error: ${insertSrcErr.message}`);
      sourceId = newSrc.id;
    }

    // ── 3. Delete existing docs for idempotency ────────────────────────────
    const { error: deleteErr } = await supabase
      .from('documents')
      .delete()
      .eq('framework_id', frameworkId)
      .filter('metadata->>document_level', 'eq', 'hipaa-control');

    if (deleteErr) throw new Error(`Delete error: ${deleteErr.message}`);

    // ── 4. Insert documents and embeddings ───────────────────────────────
    let inserted = 0;
    const errors: string[] = [];

    for (const control of HIPAA_CONTROLS) {
      try {
        const rawContent = buildContent(control);
        const title = `HIPAA Security Rule ${control.cfr} — ${control.standard}`;

        const { data: doc, error: docErr } = await supabase
          .from('documents')
          .insert({
            source_id: sourceId,
            framework_id: frameworkId,
            title,
            document_type: 'control',
            raw_content: rawContent,
            metadata: {
              document_level: 'hipaa-control',
              cfr: control.cfr,
              section: control.section,
              safeguard_type: control.type,
              implementation: control.implementation,
            },
            is_indexed: true,
          })
          .select('id')
          .single();

        if (docErr) throw new Error(`Document insert error for ${control.cfr}: ${docErr.message}`);

        const textForEmbedding = `${title}\n\n${rawContent}`;
        const embedding = await getEmbedding(textForEmbedding);

        const { error: chunkErr } = await supabase
          .from('document_chunks')
          .insert({
            document_id: doc.id,
            chunk_index: 0,
            content: rawContent,
            embedding,
            metadata: {
              document_level: 'hipaa-control',
              cfr: control.cfr,
              safeguard_type: control.type,
            },
          });

        if (chunkErr) throw new Error(`Chunk insert error for ${control.cfr}: ${chunkErr.message}`);

        inserted++;
        console.log(`Inserted HIPAA ${control.cfr}: ${control.standard}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(message);
        console.error(`Error processing ${control.cfr}:`, message);
      }
    }

    return new Response(
      JSON.stringify({ framework_id: frameworkId, inserted, errors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Fatal error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
