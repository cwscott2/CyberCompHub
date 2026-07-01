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

interface PciRequirement {
  number: string;
  title: string;
  goal: string;
  keyControls: string[];
  testingProcedures: string[];
  applicability: string;
  guidance: string;
}

const PCI_DSS_REQUIREMENTS: PciRequirement[] = [
  {
    number: '1',
    title: 'Install and Maintain Network Security Controls',
    goal: 'Network security controls (NSCs) are the first line of defense for protecting cardholder data environments.',
    keyControls: [
      '1.1 Processes and mechanisms for installing and maintaining NSCs are defined and understood',
      '1.2 NSCs are configured and maintained to protect all connections between the CDE and untrusted networks',
      '1.3 NSCs are installed between all wireless networks and the CDE, regardless of wireless network use',
      '1.4 NSCs are installed between trusted and untrusted networks',
      '1.5 Risks to the CDE from computing devices that connect to both untrusted networks and the CDE are mitigated',
    ],
    testingProcedures: [
      'Examine network diagrams and verify all connections to/from the CDE are documented',
      'Inspect firewall/NSC rulesets for default-deny with explicit permit rules',
      'Verify inbound and outbound traffic is restricted to what is necessary for the CDE',
      'Confirm all wireless networks are segmented from the CDE',
    ],
    applicability: 'All entities storing, processing, or transmitting cardholder data. Applies to all NSCs including firewalls, routers, and cloud security groups.',
    guidance: 'PCI DSS v4.0 broadened "firewalls" to "network security controls" to encompass cloud-native and software-defined controls. The CDE boundary must be clearly defined and all traffic flows documented. Stateful inspection, default deny, and DMZ architecture remain foundational requirements.',
  },
  {
    number: '2',
    title: 'Apply Secure Configurations to All System Components',
    goal: 'Malicious individuals often use vendor default passwords and settings to compromise systems.',
    keyControls: [
      '2.1 Processes for applying secure configurations to all components are defined and understood',
      '2.2 System components are configured and managed securely — no vendor defaults remain',
      '2.3 Wireless environments are configured and managed securely',
    ],
    testingProcedures: [
      'Verify system configuration standards exist and cover all system component types',
      'Confirm vendor-supplied defaults (passwords, community strings, unnecessary accounts) are changed before deployment',
      'Check that only necessary services, protocols, and ports are enabled',
      'Verify hardening standards align with industry-accepted baselines (CIS Benchmarks, DISA STIGs)',
    ],
    applicability: 'All system components in scope including network devices, servers, applications, and cloud workloads.',
    guidance: 'Configuration standards must be developed for each type of system component and kept current. Automated configuration management tools are strongly encouraged. All non-console administrative access must be encrypted.',
  },
  {
    number: '3',
    title: 'Protect Stored Account Data',
    goal: 'Protection methods such as encryption, truncation, masking, and hashing are critical components of cardholder data protection.',
    keyControls: [
      '3.1 Processes for protecting stored account data are defined and understood',
      '3.2 Storage of account data is kept to a minimum — retention and disposal policy enforced',
      '3.3 Sensitive Authentication Data (SAD) is not stored after authorization',
      '3.4 Access to displays of full PAN and ability to copy cardholder data is restricted',
      '3.5 Primary Account Number (PAN) is secured wherever stored',
      '3.6 Cryptographic keys used to protect stored account data are secured',
      '3.7 Where cryptography is used to protect stored account data, key management processes are defined and implemented',
    ],
    testingProcedures: [
      'Verify data retention and disposal policy exists and is enforced',
      'Confirm SAD (CVV2, PIN, full magnetic stripe) is not stored post-authorization',
      'Inspect stored PANs for strong encryption (AES-256), truncation, or tokenization',
      'Review key management procedures including key generation, distribution, storage, retirement, and destruction',
    ],
    applicability: 'All entities that store account data. SAD storage prohibition applies even to issuers.',
    guidance: 'PCI DSS v4.0 strengthened key management requirements and introduced disk-level encryption requirements. Tokenization and point-to-point encryption (P2PE) solutions can significantly reduce scope. Hash functions used to render PAN unreadable must use keyed cryptography (HMAC).',
  },
  {
    number: '4',
    title: 'Protect Cardholder Data with Strong Cryptography During Transmission',
    goal: 'Sensitive information must be encrypted during transmission over open, public networks.',
    keyControls: [
      '4.1 Processes for protecting cardholder data with cryptography during transmission are defined and understood',
      '4.2 PAN is protected with strong cryptography during transmission over open, public networks',
    ],
    testingProcedures: [
      'Confirm all PAN transmissions over open networks use TLS 1.2+ or equivalent strong cryptography',
      'Verify TLS 1.0 and 1.1 are disabled',
      'Check that certificates are from trusted CAs with proper validation',
      'Confirm wireless transmissions of PAN use WPA3 or WPA2-Enterprise with AES',
    ],
    applicability: 'All entities transmitting PAN over any open, public network including the internet, wireless, cellular, and Bluetooth.',
    guidance: 'PCI DSS v4.0 requires TLS 1.2 as the minimum; TLS 1.3 is strongly recommended. SSL and early TLS are prohibited. Strong cryptography must also protect PAN sent via end-user messaging technologies (email, chat, SMS) — ideally PAN should never be sent via these channels.',
  },
  {
    number: '5',
    title: 'Protect All Systems and Networks from Malicious Software',
    goal: 'Malicious software (malware) exploits system vulnerabilities after entering the environment via many paths.',
    keyControls: [
      '5.1 Processes for protecting against malware are defined and understood',
      '5.2 Malware protection is deployed on all applicable system components',
      '5.3 Anti-malware mechanisms and processes are active, maintained, and monitored',
      '5.4 Phishing attacks are detected and protected against',
    ],
    testingProcedures: [
      'Confirm anti-malware solution is deployed on all system components at risk from malware',
      'Verify anti-malware signatures or behavioral detections are updated at least daily',
      'Check that anti-malware cannot be disabled by users without management authorization',
      'Review audit logs to confirm anti-malware activity is logged and retained',
      'Verify controls to protect against phishing (email filtering, user awareness)',
    ],
    applicability: 'All system components. Components not commonly affected by malware (mainframes, mid-range systems) should be periodically evaluated for emerging threats.',
    guidance: 'PCI DSS v4.0 added explicit requirements for phishing protection and behavior-based malware detection. Anti-malware solutions must cover all components in the CDE. Removable media scans are required when used.',
  },
  {
    number: '6',
    title: 'Develop and Maintain Secure Systems and Software',
    goal: 'Unscrupulous individuals use security vulnerabilities to gain privileged access to systems.',
    keyControls: [
      '6.1 Processes for developing and maintaining secure systems and software are defined and understood',
      '6.2 Bespoke and custom software are developed securely',
      '6.3 Security vulnerabilities are identified and addressed',
      '6.4 Public-facing web applications are protected against attacks',
      '6.5 Changes to all system components are managed securely',
    ],
    testingProcedures: [
      'Verify secure coding training is provided to developers at least annually',
      'Confirm a vulnerability management process identifies and patches critical vulnerabilities within one month',
      'Inspect WAF deployment for all public-facing web applications',
      'Review change management process to ensure security testing is part of every change',
      'Verify software inventory includes all custom and bespoke applications',
    ],
    applicability: 'All system components. Bespoke software requirements apply to internally developed and third-party custom code. WAF requirement applies to internet-facing applications.',
    guidance: 'PCI DSS v4.0 significantly expanded software security requirements. OWASP Top 10 must be addressed. Automated technical controls (SAST, DAST, SCA) are strongly encouraged. A web application firewall (WAF) or similar control is required for all public-facing web applications. Software bills of materials (SBOMs) are increasingly expected.',
  },
  {
    number: '7',
    title: 'Restrict Access to System Components and Cardholder Data by Business Need to Know',
    goal: 'Systems and processes must be in place to limit access to cardholder data to only those whose job requires such access.',
    keyControls: [
      '7.1 Processes for restricting access to system components and cardholder data are defined and understood',
      '7.2 Access to system components and data is appropriately defined and assigned',
      '7.3 Access to system components and data is managed via an access control system',
    ],
    testingProcedures: [
      'Review access control model to confirm it is need-to-know based with least privilege',
      'Verify access rights are assigned based on job function and approved by authorized personnel',
      'Confirm all access to the CDE requires explicit approval and is documented',
      'Check that access control lists prevent unauthorized access to cardholder data',
    ],
    applicability: 'All entities. Applies to all users including employees, contractors, and third parties.',
    guidance: 'PCI DSS v4.0 introduced requirements for documenting all access and the business reason for it. Role-based access control (RBAC) or attribute-based access control (ABAC) are recommended approaches. Access should be granted using least privilege principles and reviewed at least every six months.',
  },
  {
    number: '8',
    title: 'Identify Users and Authenticate Access to System Components',
    goal: 'Assigning a unique identification to each person ensures each individual is uniquely accountable for their actions.',
    keyControls: [
      '8.1 Processes for identifying and authenticating users are defined and understood',
      '8.2 User identification and related accounts for users and administrators are rigorously managed',
      '8.3 User authentication is established and managed',
      '8.4 Multi-factor authentication (MFA) is implemented to secure access into the CDE',
      '8.5 MFA systems are configured securely to prevent misuse',
      '8.6 Use of application and system accounts is rigorously managed',
    ],
    testingProcedures: [
      'Verify all users have unique IDs — no shared accounts',
      'Confirm inactive accounts are removed/disabled within 90 days',
      'Verify passwords meet complexity requirements: 12+ characters, mixed types',
      'Confirm MFA is required for all non-console administrative access and all remote access',
      'Check that MFA cannot be bypassed (no fallback to single factor)',
      'Review service account management and privilege assignment',
    ],
    applicability: 'All entities. MFA requirement expanded in v4.0 to cover all access into the CDE, not just remote access.',
    guidance: 'PCI DSS v4.0 significantly expanded MFA requirements — MFA is now required for all access to the CDE, including internal administrative access. Passwords must be 12+ characters (up from 7). Phishing-resistant MFA (FIDO2, hardware tokens) is strongly recommended. Password managers and SSO solutions are encouraged to support strong credential practices.',
  },
  {
    number: '9',
    title: 'Restrict Physical Access to Cardholder Data',
    goal: 'Any physical access to data or systems that house cardholder data provides the opportunity for individuals to access devices or data and to remove systems or hardcopies.',
    keyControls: [
      '9.1 Processes for restricting physical access to cardholder data are defined and understood',
      '9.2 Physical access controls manage entry into facilities and systems containing cardholder data',
      '9.3 Physical access for personnel and visitors is authorized and managed',
      '9.4 Media with cardholder data is securely stored, accessed, distributed, and destroyed',
      '9.5 Point of interaction (POI) devices are protected from tampering and unauthorized substitution',
    ],
    testingProcedures: [
      'Verify physical access controls (badge readers, locked cabinets) protect CDE facilities',
      'Confirm visitor logs are maintained and visitors are escorted',
      'Review media inventory and secure destruction procedures',
      'Inspect POI device inspection procedures and tamper detection processes',
      'Verify security cameras or equivalent controls monitor physical access points',
    ],
    applicability: 'All entities with physical cardholder data environments. POI requirements apply to merchants accepting card-present transactions.',
    guidance: 'Physical access logs must be retained for at least three months. Media containing PAN must be physically secured and tracked. POI devices must be inspected at least once every three months to detect tampering or substitution. Device serial numbers must be maintained in an inventory.',
  },
  {
    number: '10',
    title: 'Log and Monitor All Access to System Components and Cardholder Data',
    goal: 'Logging mechanisms and the ability to track user activities are critical for effective forensics and vulnerability management.',
    keyControls: [
      '10.1 Processes for logging and monitoring all access to system components and cardholder data are defined and understood',
      '10.2 Audit logs capture all individual user access to cardholder data and CDE components',
      '10.3 Audit logs are protected from destruction and unauthorized modifications',
      '10.4 Audit logs are reviewed to identify anomalies or suspicious activity',
      '10.5 Audit log history is retained and available for analysis',
      '10.6 Time-synchronization technology supports consistent time settings across all systems',
      '10.7 Failures of critical security controls are detected, reported, and responded to promptly',
    ],
    testingProcedures: [
      'Verify logs capture all required events: user access, privilege escalation, authentication failures, log modifications',
      'Confirm logs are protected from unauthorized access and modification',
      'Verify automated log review mechanisms are in place and anomalies trigger alerts',
      'Confirm audit logs are retained for at least 12 months with 3 months immediately available',
      'Check NTP or equivalent time synchronization is configured on all systems',
    ],
    applicability: 'All entities. Automated log review is required; manual review alone is insufficient for large environments.',
    guidance: 'PCI DSS v4.0 introduced explicit requirements for automated log review and failure detection for security controls. SIEM solutions are strongly encouraged. Logs must be centralized and tamper-evident. Privileged user activities require comprehensive logging. Anomaly detection using behavioral analytics is an emerging best practice.',
  },
  {
    number: '11',
    title: 'Test Security of Systems and Networks Regularly',
    goal: 'Vulnerabilities are being discovered continually by malicious individuals and researchers, and being introduced by new software.',
    keyControls: [
      '11.1 Processes for regularly testing security of systems and networks are defined and understood',
      '11.2 Wireless access points are identified and monitored, and unauthorized access points are addressed',
      '11.3 External and internal vulnerabilities are regularly identified, prioritized, and addressed',
      '11.4 External and internal penetration testing is regularly performed and exploitable vulnerabilities and security weaknesses are corrected',
      '11.5 Network intrusions and unexpected file changes are detected and responded to',
      '11.6 Unauthorized changes on payment pages are detected and responded to',
    ],
    testingProcedures: [
      'Verify quarterly internal vulnerability scans are conducted by qualified internal resources',
      'Confirm quarterly external vulnerability scans are conducted by an Approved Scanning Vendor (ASV)',
      'Review penetration test reports — internal and external, at least annually and after significant changes',
      'Verify IDS/IPS is deployed at CDE perimeter and critical internal points',
      'Confirm file integrity monitoring (FIM) is in place for critical files',
      'Check payment page monitoring for script tampering (e-commerce skimming protection)',
    ],
    applicability: 'All entities. E-commerce skimming protection (Requirement 11.6) is new in v4.0 and applies to entities with payment pages.',
    guidance: 'PCI DSS v4.0 added requirements for detecting unauthorized script changes on payment pages to combat Magecart-style attacks. Penetration testing must follow industry-accepted methodology (PTES, OWASP). High and critical vulnerabilities must be remediated within defined timeframes. Continuous vulnerability management is increasingly expected over periodic scanning.',
  },
  {
    number: '12',
    title: 'Support Information Security with Organizational Policies and Programs',
    goal: 'A strong security policy sets the security tone for the whole organization and informs personnel of what is expected of them.',
    keyControls: [
      '12.1 A comprehensive information security policy is developed, published, maintained, and disseminated',
      '12.2 Acceptable use policies for end-user technologies are defined and implemented',
      '12.3 Risks to the CDE are formally identified, evaluated, and managed',
      '12.4 PCI DSS compliance is managed throughout the year',
      '12.5 PCI DSS scope is documented and validated',
      '12.6 Security awareness education is ongoing',
      '12.7 Personnel are screened to reduce risks from insider threats',
      '12.8 Third-party service providers (TPSPs) with access to cardholder data are managed',
      '12.9 TPSPs support their customers\' PCI DSS compliance',
      '12.10 Suspected and confirmed security incidents that could impact the CDE are responded to immediately',
    ],
    testingProcedures: [
      'Review information security policy for completeness and annual review cadence',
      'Verify formal risk assessment is conducted at least annually',
      'Confirm security awareness training is provided at hire and at least annually thereafter',
      'Review TPSP agreements for PCI DSS acknowledgment and responsibility assignments',
      'Inspect incident response plan and verify it is tested at least annually',
      'Confirm executive sponsorship and dedicated PCI DSS compliance oversight',
    ],
    applicability: 'All entities. TPSP management requirements are critical for service providers who store, process, or transmit CHD on behalf of others.',
    guidance: 'PCI DSS v4.0 added quarterly executive reviews of compliance status. Targeted risk analyses (TRAs) are now required to justify customized implementation timelines for certain requirements. Third-party risk management has been strengthened with clearer responsibility assignment requirements. The incident response plan must address all types of security incidents, not just breaches.',
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

function buildContent(req: PciRequirement): string {
  const lines = [
    `# PCI DSS v4.0 Requirement ${req.number}: ${req.title}`,
    '',
    `## Goal`,
    req.goal,
    '',
    `## Key Controls`,
    ...req.keyControls.map(c => `- ${c}`),
    '',
    `## Testing Procedures`,
    ...req.testingProcedures.map(t => `- ${t}`),
    '',
    `## Applicability`,
    req.applicability,
    '',
    `## Guidance`,
    req.guidance,
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
      .eq('abbreviation', 'PCI DSS')
      .limit(1);

    if (fwErr) throw new Error(`Framework lookup error: ${fwErr.message}`);

    if (existingFw && existingFw.length > 0) {
      frameworkId = existingFw[0].id;
    } else {
      const { data: newFw, error: insertFwErr } = await supabase
        .from('compliance_frameworks')
        .insert({
          name: 'Payment Card Industry Data Security Standard v4.0',
          abbreviation: 'PCI DSS',
          category: 'sox',
          version: '4.0',
          description: 'Security standard for all entities that store, process, or transmit cardholder data, maintained by the PCI Security Standards Council',
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
          name: 'PCI DSS v4.0 — PCI Security Standards Council',
          url: 'https://www.pcisecuritystandards.org/document_library/',
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
      .filter('metadata->>document_level', 'eq', 'pci-requirement');

    if (deleteErr) throw new Error(`Delete error: ${deleteErr.message}`);

    // ── 4. Insert documents and embeddings ───────────────────────────────
    let inserted = 0;
    const errors: string[] = [];

    for (const req of PCI_DSS_REQUIREMENTS) {
      try {
        const rawContent = buildContent(req);
        const title = `PCI DSS v4.0 Requirement ${req.number} — ${req.title}`;

        const { data: doc, error: docErr } = await supabase
          .from('documents')
          .insert({
            source_id: sourceId,
            framework_id: frameworkId,
            title,
            document_type: 'control',
            raw_content: rawContent,
            metadata: {
              document_level: 'pci-requirement',
              requirement_number: req.number,
              goal: req.goal,
            },
            is_indexed: true,
          })
          .select('id')
          .single();

        if (docErr) throw new Error(`Document insert error for Req ${req.number}: ${docErr.message}`);

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
              document_level: 'pci-requirement',
              requirement_number: req.number,
            },
          });

        if (chunkErr) throw new Error(`Chunk insert error for Req ${req.number}: ${chunkErr.message}`);

        inserted++;
        console.log(`Inserted PCI DSS Requirement ${req.number}: ${req.title}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(message);
        console.error(`Error processing Requirement ${req.number}:`, message);
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
