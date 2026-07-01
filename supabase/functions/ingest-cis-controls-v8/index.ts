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

interface CisControl {
  number: string;
  title: string;
  category: 'basic_hygiene' | 'foundational' | 'organizational';
  ig1Safeguards: string[];
  ig2Safeguards: string[];
  ig3Safeguards: string[];
  why: string;
}

const CIS_CONTROLS: CisControl[] = [
  {
    number: '1',
    title: 'Inventory and Control of Enterprise Assets',
    category: 'basic_hygiene',
    ig1Safeguards: [
      '1.1 Establish and Maintain Detailed Enterprise Asset Inventory',
      '1.2 Address Unauthorized Assets',
    ],
    ig2Safeguards: [
      '1.3 Utilize an Active Discovery Tool',
      '1.4 Use DHCP Logging',
      '1.5 Use a Passive Asset Discovery Tool',
    ],
    ig3Safeguards: [],
    why: "You can't protect what you don't know you have. Maintaining an accurate inventory of all enterprise assets — hardware, software, and network devices — is the foundation of every other security control.",
  },
  {
    number: '2',
    title: 'Inventory and Control of Software Assets',
    category: 'basic_hygiene',
    ig1Safeguards: [
      '2.1 Establish and Maintain a Software Inventory',
      '2.2 Ensure Authorized Software is Currently Supported',
      '2.3 Address Unauthorized Software',
    ],
    ig2Safeguards: [
      '2.4 Utilize Automated Software Inventory Tools',
      '2.5 Allowlist Authorized Software',
      '2.6 Allowlist Authorized Libraries',
      '2.7 Allowlist Authorized Scripts',
    ],
    ig3Safeguards: [],
    why: 'Unauthorized and unsupported software is a primary attack vector. Only authorized, supported software should be allowed to execute in the enterprise environment.',
  },
  {
    number: '3',
    title: 'Data Protection',
    category: 'basic_hygiene',
    ig1Safeguards: [
      '3.1 Establish and Maintain a Data Management Process',
      '3.2 Establish and Maintain a Data Inventory',
      '3.3 Configure Data Access Control Lists',
      '3.4 Enforce Data Retention',
    ],
    ig2Safeguards: [
      '3.5 Securely Dispose of Data',
      '3.6 Encrypt Data on End-User Devices',
      '3.7 Establish and Maintain a Data Classification Scheme',
      '3.8 Document Data Flows',
    ],
    ig3Safeguards: [
      '3.9 Encrypt Data on Removable Media',
      '3.10 Encrypt Sensitive Data in Transit',
      '3.11 Encrypt Sensitive Data at Rest',
      '3.12 Segment Data Processing and Storage',
      '3.13 Deploy a Data Loss Prevention Solution',
      '3.14 Log Sensitive Data Access',
    ],
    why: 'Sensitive data must be identified, classified, and protected throughout its lifecycle — at rest, in transit, and at end of life — to prevent unauthorized disclosure.',
  },
  {
    number: '4',
    title: 'Secure Configuration of Enterprise Assets and Software',
    category: 'basic_hygiene',
    ig1Safeguards: [
      '4.1 Establish and Maintain a Secure Configuration Process',
      '4.2 Establish and Maintain a Secure Configuration Process for Network Infrastructure',
      '4.3 Configure Automatic Session Locking on Enterprise Assets',
      '4.4 Implement and Manage a Firewall on Servers',
      '4.5 Implement and Manage a Firewall on End-User Devices',
    ],
    ig2Safeguards: [
      '4.6 Securely Manage Enterprise Assets and Software',
      '4.7 Manage Default Accounts on Enterprise Assets and Software',
      '4.8 Uninstall or Disable Unnecessary Services on Enterprise Assets and Software',
      '4.9 Configure Trusted DNS Servers on Enterprise Assets',
      '4.10 Enforce Automatic Device Lockout on Portable End-User Devices',
      '4.11 Enforce Remote Wipe Capability on Portable End-User Devices',
      '4.12 Separate Enterprise Workspaces on Mobile End-User Devices',
    ],
    ig3Safeguards: [],
    why: "Default configurations are designed for ease of use, not security. Establishing and enforcing secure configurations — based on industry standards like CIS Benchmarks — reduces the attack surface across the organization's assets.",
  },
  {
    number: '5',
    title: 'Account Management',
    category: 'basic_hygiene',
    ig1Safeguards: [
      '5.1 Establish and Maintain an Inventory of Accounts',
      '5.2 Use Unique Passwords',
      '5.3 Disable Dormant Accounts',
      '5.4 Restrict Administrator Privileges to Dedicated Administrator Accounts',
    ],
    ig2Safeguards: [
      '5.5 Establish and Maintain an Inventory of Service Accounts',
      '5.6 Centralize Account Management',
    ],
    ig3Safeguards: [],
    why: 'Proper account lifecycle management — creation, maintenance, and removal — is essential to ensure only authorized individuals have access to enterprise systems and data.',
  },
  {
    number: '6',
    title: 'Access Control Management',
    category: 'basic_hygiene',
    ig1Safeguards: [
      '6.1 Establish an Access Granting Process',
      '6.2 Establish an Access Revoking Process',
      '6.3 Require MFA for Externally-Exposed Applications',
      '6.4 Require MFA for Remote Network Access',
      '6.5 Require MFA for Administrative Access',
    ],
    ig2Safeguards: [
      '6.6 Establish and Maintain an Inventory of Authentication and Authorization Systems',
      '6.7 Centralize Access Control',
      '6.8 Define and Maintain Role-Based Access Control',
    ],
    ig3Safeguards: [],
    why: 'Controlling who can access what resources — and ensuring that access is revoked when no longer needed — limits the blast radius of compromised credentials and insider threats.',
  },
  {
    number: '7',
    title: 'Continuous Vulnerability Management',
    category: 'foundational',
    ig1Safeguards: [
      '7.1 Establish and Maintain a Vulnerability Management Process',
      '7.2 Establish and Maintain a Remediation Process',
      '7.3 Perform Automated Operating System Patch Management',
      '7.4 Perform Automated Application Patch Management',
    ],
    ig2Safeguards: [
      '7.5 Perform Automated Vulnerability Scans of Internal Enterprise Assets',
      '7.6 Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets',
      '7.7 Remediate Detected Vulnerabilities',
    ],
    ig3Safeguards: [],
    why: 'New vulnerabilities are discovered daily. A continuous vulnerability management program ensures that weaknesses are identified and remediated before attackers can exploit them.',
  },
  {
    number: '8',
    title: 'Audit Log Management',
    category: 'foundational',
    ig1Safeguards: [
      '8.1 Establish and Maintain an Audit Log Management Process',
      '8.2 Collect Audit Logs',
      '8.3 Ensure Adequate Audit Log Storage',
      '8.4 Standardize Time Synchronization',
      '8.5 Collect Detailed Audit Logs',
    ],
    ig2Safeguards: [
      '8.6 Collect DNS Query Audit Logs',
      '8.7 Collect URL Request Audit Logs',
      '8.8 Collect Command-Line Audit Logs',
      '8.9 Centralize Audit Logs',
      '8.10 Retain Audit Logs',
      '8.11 Conduct Audit Log Reviews',
      '8.12 Collect Service Provider Logs',
    ],
    ig3Safeguards: [],
    why: 'Audit logs are the evidentiary foundation for detecting attacks, investigating incidents, and demonstrating compliance. Without them, intrusions go undetected and accountability is impossible.',
  },
  {
    number: '9',
    title: 'Email and Web Browser Protections',
    category: 'foundational',
    ig1Safeguards: [
      '9.1 Ensure Use of Only Fully Supported Browsers and Email Clients',
      '9.2 Use DNS Filtering Services',
      '9.3 Maintain and Enforce Network-Based URL Filters',
    ],
    ig2Safeguards: [
      '9.4 Restrict Unnecessary or Unauthorized Browser and Email Client Extensions',
      '9.5 Implement DMARC',
      '9.6 Block Unnecessary File Types',
      '9.7 Deploy and Maintain Email Server Anti-Malware Protections',
    ],
    ig3Safeguards: [],
    why: 'Email and web browsers are the primary vectors for phishing, malware delivery, and social engineering. Hardening these surfaces dramatically reduces the likelihood of successful attacks.',
  },
  {
    number: '10',
    title: 'Malware Defenses',
    category: 'foundational',
    ig1Safeguards: [
      '10.1 Deploy and Maintain Anti-Malware Software',
      '10.2 Configure Automatic Anti-Malware Signature Updates',
      '10.3 Disable Autorun and Autoplay for Removable Media',
      '10.4 Configure Automatic Anti-Malware Scanning of Removable Media',
      '10.5 Enable Anti-Exploitation Features',
      '10.6 Centrally Manage Anti-Malware Software',
    ],
    ig2Safeguards: [
      '10.7 Use Behavior-Based Anti-Malware Software',
    ],
    ig3Safeguards: [],
    why: 'Malware remains one of the most common and damaging attack techniques. Layered defenses — including signature-based, behavior-based, and anti-exploitation controls — are necessary to detect and block modern malware.',
  },
  {
    number: '11',
    title: 'Data Recovery',
    category: 'foundational',
    ig1Safeguards: [
      '11.1 Establish and Maintain a Data Recovery Process',
      '11.2 Perform Automated Backups',
      '11.3 Protect Recovery Data',
      '11.4 Establish and Maintain an Isolated Instance of Recovery Data',
    ],
    ig2Safeguards: [
      '11.5 Test Data Recovery',
    ],
    ig3Safeguards: [],
    why: 'When preventive controls fail, recovery capabilities determine whether a ransomware attack or destructive incident becomes an existential crisis or a recoverable event.',
  },
  {
    number: '12',
    title: 'Network Infrastructure Management',
    category: 'foundational',
    ig1Safeguards: [
      '12.1 Ensure Network Infrastructure is Up-To-Date',
    ],
    ig2Safeguards: [
      '12.2 Establish and Maintain a Secure Network Architecture',
      '12.3 Securely Manage Network Infrastructure',
      '12.4 Establish and Maintain Architecture Diagram(s)',
      '12.5 Centralize Network Authentication, Authorization, and Auditing (AAA)',
      '12.6 Use of Secure Network Management and Communication Protocols',
      '12.7 Ensure Remote Devices Utilize a VPN',
      '12.8 Establish and Maintain Dedicated Computing Resources for All Administrative Work',
    ],
    ig3Safeguards: [],
    why: 'The network is the backbone of all enterprise communications. Insecure network infrastructure — routers, switches, firewalls — can be compromised to intercept or redirect all traffic traversing it.',
  },
  {
    number: '13',
    title: 'Network Monitoring and Defense',
    category: 'foundational',
    ig1Safeguards: [
      '13.1 Centralize Security Event Alerting',
      '13.2 Deploy a Host-Based Intrusion Detection Solution',
    ],
    ig2Safeguards: [
      '13.3 Deploy a Network Intrusion Detection Solution',
      '13.4 Perform Traffic Filtering Between Network Segments',
      '13.5 Manage Access Control for Remote Assets',
      '13.6 Collect Network Traffic Flow Logs',
      '13.7 Deploy a Host-Based Intrusion Prevention Solution',
      '13.8 Deploy a Network Intrusion Prevention Solution',
      '13.9 Deploy Port-Level Access Control',
      '13.10 Perform Application Layer Filtering',
      '13.11 Tune Security Event Alerting Thresholds',
    ],
    ig3Safeguards: [],
    why: 'Attackers who bypass perimeter defenses must be detected and stopped before they can achieve their objectives. Network monitoring provides the visibility needed to detect lateral movement, data exfiltration, and command-and-control activity.',
  },
  {
    number: '14',
    title: 'Security Awareness and Skills Training',
    category: 'foundational',
    ig1Safeguards: [
      '14.1 Establish and Maintain a Security Awareness Program',
      '14.2 Train Workforce Members to Recognize Social Engineering Attacks',
      '14.3 Train Workforce Members on Authentication Best Practices',
      '14.4 Train Workforce on Data Handling Best Practices',
      '14.5 Train Workforce Members on Causes of Unintentional Data Exposure',
      '14.6 Train Workforce Members on Recognizing and Reporting Security Incidents',
      '14.7 Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates',
      '14.8 Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks',
    ],
    ig2Safeguards: [
      '14.9 Conduct Role-Specific Security Awareness and Skills Training',
    ],
    ig3Safeguards: [],
    why: 'People are both the most exploited attack surface and the strongest potential defense. Training workforce members to recognize and respond to threats — especially social engineering — is essential at every implementation group level.',
  },
  {
    number: '15',
    title: 'Service Provider Management',
    category: 'foundational',
    ig1Safeguards: [
      '15.1 Establish and Maintain an Inventory of Service Providers',
    ],
    ig2Safeguards: [
      '15.2 Establish and Maintain a Service Provider Management Policy',
      '15.3 Classify Service Providers',
      '15.4 Ensure Service Provider Contracts Include Security Requirements',
      '15.5 Assess Service Providers',
      '15.6 Monitor Service Providers',
      '15.7 Securely Decommission Service Providers',
    ],
    ig3Safeguards: [],
    why: 'Third-party service providers often have privileged access to enterprise systems and data. Supply chain attacks and third-party breaches have become a leading attack vector requiring active management.',
  },
  {
    number: '16',
    title: 'Application Software Security',
    category: 'foundational',
    ig1Safeguards: [
      '16.1 Establish and Maintain a Secure Application Development Process',
    ],
    ig2Safeguards: [
      '16.2 Establish and Maintain a Process to Accept and Address Software Vulnerabilities',
      '16.3 Perform Root Cause Analysis on Security Vulnerabilities',
      '16.4 Establish and Maintain a Process for Receiving and Addressing Software Vulnerability Disclosures',
      '16.5 Use Up-to-Date and Trusted Third-Party Software Components',
      '16.6 Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities',
      '16.7 Use Standard Hardening Configuration Templates for Application Infrastructure',
      '16.8 Separate Production and Non-Production Systems',
      '16.9 Train Developers in Application Security Concepts and Secure Coding',
      '16.10 Apply Secure Design Principles in Application Architectures',
      '16.11 Leverage Vetted Modules or Services for Application Security Components',
      '16.12 Implement Code-Level Security Checks',
      '16.13 Conduct Application Penetration Testing',
      '16.14 Conduct Threat Modeling',
    ],
    ig3Safeguards: [],
    why: 'Custom and third-party applications are primary targets for exploitation. Integrating security into the software development lifecycle — from design through testing and deployment — prevents vulnerabilities before they reach production.',
  },
  {
    number: '17',
    title: 'Incident Response Management',
    category: 'organizational',
    ig1Safeguards: [
      '17.1 Designate Personnel to Manage Incident Handling',
      '17.2 Establish and Maintain Contact Information for Reporting Security Incidents',
      '17.3 Establish and Maintain an Enterprise Process for Reporting Incidents',
      '17.4 Establish and Maintain an Incident Response Process',
      '17.5 Assign Key Roles and Responsibilities for Incident Response',
    ],
    ig2Safeguards: [
      '17.6 Define Mechanisms for Communicating During Incident Response',
      '17.7 Conduct Routine Incident Response Exercises',
      '17.8 Conduct Post-Incident Reviews',
      '17.9 Establish and Maintain Security Incident Thresholds',
    ],
    ig3Safeguards: [],
    why: 'Security incidents are inevitable. Organizations that have documented, practiced incident response processes recover faster, limit damage, and meet regulatory notification requirements.',
  },
  {
    number: '18',
    title: 'Penetration Testing',
    category: 'organizational',
    ig1Safeguards: [],
    ig2Safeguards: [
      '18.1 Establish and Maintain a Penetration Testing Program',
      '18.2 Perform Periodic External Penetration Tests',
      '18.3 Remediate Penetration Test Findings',
    ],
    ig3Safeguards: [
      '18.4 Validate Security Measures',
      '18.5 Perform Periodic Internal Penetration Tests',
    ],
    why: 'Penetration testing validates that security controls work as intended by simulating real-world attacks. It identifies gaps that scanning and auditing alone cannot detect.',
  },
];

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embedding error: ${err}`);
  }
  const data = await res.json();
  return data.data[0].embedding;
}

function buildRawContent(control: CisControl): string {
  const ig1Lines = control.ig1Safeguards.length > 0
    ? `IG1 Safeguards: ${control.ig1Safeguards.join('; ')}.`
    : '';
  const ig2Lines = control.ig2Safeguards.length > 0
    ? `IG2 adds: ${control.ig2Safeguards.join('; ')}.`
    : '';
  const ig3Lines = control.ig3Safeguards.length > 0
    ? `IG3 adds: ${control.ig3Safeguards.join('; ')}.`
    : '';
  const parts = [
    `CIS Control ${control.number}: ${control.title}.`,
    control.why,
    ig1Lines,
    ig2Lines,
    ig3Lines,
  ].filter(Boolean);
  return parts.join(' ');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Resolve or create framework ────────────────────────────────────
    let frameworkId: string;
    const { data: existingFrameworks, error: fwErr } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'CIS Controls')
      .limit(1);

    if (fwErr) throw new Error(`Framework lookup error: ${fwErr.message}`);

    if (existingFrameworks && existingFrameworks.length > 0) {
      frameworkId = existingFrameworks[0].id;
    } else {
      const { data: newFw, error: insertFwErr } = await supabase
        .from('compliance_frameworks')
        .insert({
          name: 'CIS Critical Security Controls v8',
          abbreviation: 'CIS Controls',
          category: 'nist',
          version: '8.0',
          description: 'Prioritized set of actions to protect organizations and data from cyber attack vectors',
        })
        .select('id')
        .single();
      if (insertFwErr) throw new Error(`Framework insert error: ${insertFwErr.message}`);
      frameworkId = newFw.id;
    }

    // ── 2. Resolve or create source ────────────────────────────────────────
    let sourceId: string;
    const { data: existingSources, error: srcErr } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', frameworkId)
      .limit(1);

    if (srcErr) throw new Error(`Source lookup error: ${srcErr.message}`);

    if (existingSources && existingSources.length > 0) {
      sourceId = existingSources[0].id;
    } else {
      const { data: newSrc, error: insertSrcErr } = await supabase
        .from('sources')
        .insert({
          framework_id: frameworkId,
          name: 'CIS Controls v8 — Center for Internet Security',
          url: 'https://www.cisecurity.org/controls/v8',
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
      .eq('metadata->>document_level', 'cis-control');

    if (deleteErr) throw new Error(`Delete error: ${deleteErr.message}`);

    // ── 4. Insert documents and embeddings sequentially ───────────────────
    let inserted = 0;
    const errors: string[] = [];

    for (const control of CIS_CONTROLS) {
      try {
        const rawContent = buildRawContent(control);
        const title = `CIS Control ${control.number} — ${control.title}`;

        const { data: doc, error: docErr } = await supabase
          .from('documents')
          .insert({
            source_id: sourceId,
            framework_id: frameworkId,
            title,
            document_type: 'control',
            raw_content: rawContent,
            metadata: {
              document_level: 'cis-control',
              control_number: control.number,
              ig1_safeguard_count: control.ig1Safeguards.length,
              ig2_safeguard_count: control.ig2Safeguards.length,
              ig3_safeguard_count: control.ig3Safeguards.length,
              category: control.category,
            },
            is_indexed: true,
          })
          .select('id')
          .single();

        if (docErr) throw new Error(`Document insert error for control ${control.number}: ${docErr.message}`);

        // Generate embedding and insert chunk
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
              control_number: control.number,
              category: control.category,
            },
          });

        if (chunkErr) throw new Error(`Chunk insert error for control ${control.number}: ${chunkErr.message}`);

        inserted++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(message);
        console.error(`Error processing CIS Control ${control.number}:`, message);
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
