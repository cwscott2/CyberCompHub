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

// Sarbanes-Oxley Act (SOX) — IT and Cybersecurity Compliance
// Enacted July 30, 2002. Applies to public companies registered with the SEC.
// Key sections: 302, 404, 409, 802
// Related standards: COSO 2013, PCAOB AS2201, COBIT

const SOX_SECTIONS = [
  {
    id: 'Section 302',
    name: 'Corporate Responsibility for Financial Reports',
    category: 'key_section',
    content: `# SOX Section 302 — Corporate Responsibility for Financial Reports

## Overview
Section 302 requires the principal executive officer (CEO) and principal financial officer (CFO) of every public company to personally certify the accuracy of financial reports filed with the SEC. These certifications are attached to each quarterly (10-Q) and annual (10-K) filing.

## What Officers Must Certify
Signing officers must certify that they have reviewed the report, that based on their knowledge the report does not contain material untrue statements or omissions, and that the financial statements fairly present the company's financial condition. Critically for IT and cybersecurity compliance, they must also certify that:

- They are responsible for establishing and maintaining disclosure controls and procedures
- They have designed or caused disclosure controls to be designed to ensure material information is made known to them
- They have evaluated the effectiveness of these controls within 90 days prior to the filing
- They have disclosed to the audit committee and auditors all significant deficiencies and material weaknesses in the design or operation of internal controls

## IT Compliance Implications
The Section 302 certification creates a direct accountability chain from the CEO and CFO down to IT systems. Because financial data originates in and flows through IT systems, the adequacy of IT controls directly affects whether officers can make their certifications with confidence. Key IT areas implicated by Section 302 include:

- **Access controls** to financial systems: unauthorized access to systems that produce financial data could result in misstatement
- **Change management**: unauthorized changes to financial applications or data could invalidate the accuracy certifications
- **Data integrity**: controls ensuring that data is not corrupted as it moves between systems and into financial reports
- **Disclosure controls**: systems and processes that aggregate material information and surface it to management for disclosure decisions

## Material Weakness and Significant Deficiency
If a material weakness — a deficiency in internal control that creates a reasonable possibility of material misstatement — exists in IT controls affecting financial reporting, officers may not be able to make their Section 302 certifications without qualifying language. Material weaknesses must be disclosed. A significant deficiency (less severe than a material weakness but still warranting attention) must also be reported to the audit committee. IT teams must understand these thresholds and escalate control failures accordingly.

## Criminal Penalties
Knowingly certifying a report that does not comply with Section 302 requirements is a criminal offense. Officers who certify a report they know to be non-compliant face fines up to $1 million and imprisonment up to 10 years. Willful violation increases penalties to $5 million and 20 years imprisonment.`,
  },
  {
    id: 'Section 404',
    name: 'Management Assessment of Internal Controls',
    category: 'key_section',
    content: `# SOX Section 404 — Management Assessment of Internal Controls

## Overview
Section 404 is widely considered the most operationally significant provision of SOX for IT and cybersecurity teams. It requires that each annual report (10-K) include an internal control report stating management's responsibility for establishing and maintaining adequate internal control over financial reporting (ICFR), and management's assessment of the effectiveness of those controls as of the end of the fiscal year. For accelerated filers, the external auditor must also attest to and report on management's assessment of ICFR.

## ICFR Definition
Internal control over financial reporting is defined as a process designed by or under the supervision of the CEO and CFO to provide reasonable assurance regarding the reliability of financial reporting and the preparation of financial statements in accordance with Generally Accepted Accounting Principles (GAAP). This process includes policies and procedures that:

- Pertain to the maintenance of accurate and complete records
- Provide reasonable assurance that transactions are recorded as necessary to permit preparation of financial statements in accordance with GAAP
- Provide reasonable assurance that unauthorized acquisition, use, or disposition of company assets would be prevented or detected on a timely basis

## IT General Controls (ITGCs)
ITGCs are the foundational controls over IT infrastructure, applications, and processes that support ICFR. They operate across systems that process, store, or transmit financial data. The five primary ITGC domains are:

### 1. Access to Programs and Data
Controls ensuring that only authorized users have access to financial applications, databases, and the underlying infrastructure. Specific controls include user provisioning and deprovisioning processes, role-based access aligned to job functions, segregation of duties in financial systems (e.g., the person who authorizes payments cannot also enter them), privileged access management, and periodic access reviews to detect and remove inappropriate access.

### 2. Program Development
Controls over the process by which new applications or significant enhancements to existing applications are developed, tested, and moved into production. These controls ensure that only authorized, tested, and approved code reaches production financial systems. Key controls include requirements documentation, user acceptance testing, segregation of development and production environments, and formal approval before production deployment.

### 3. Program Changes
Controls ensuring that changes to production financial applications are authorized, tested, and documented before implementation. Change management controls prevent unauthorized modifications that could introduce errors or fraud into financial reporting processes. Controls include a formal change request and approval process, independent testing of changes before production deployment, emergency change procedures, and post-implementation review.

### 4. Computer Operations
Controls over the reliable and secure operation of computing infrastructure including servers, databases, networks, and the supporting utilities. Controls include job scheduling and monitoring, incident management, backup and recovery, capacity management, and monitoring of system availability.

### 5. Data Center Physical and Environmental Security
Controls ensuring that physical access to data centers and server rooms is restricted to authorized personnel, and that environmental threats such as fire, flood, and power failure are mitigated. Controls include physical access control systems, visitor logs, environmental monitoring, and uninterruptible power supplies.

## IT Application Controls (ITACs)
In addition to ITGCs, IT application controls are embedded within specific financial applications and automate the execution of business rules. Unlike ITGCs — which apply broadly across systems — ITACs are specific to an application and its business process. Examples include:

- **Input controls**: Edit checks that validate data entered into financial systems (e.g., requiring a vendor code to match the approved vendor master before a payment can be processed)
- **Processing controls**: Automated calculations, workflow routing, and business rule enforcement within financial applications
- **Output controls**: Report balancing, exception reporting, and reconciliation outputs that help detect errors in financial data
- **Interface controls**: Controls over the transfer of data between applications, ensuring completeness and accuracy of data as it moves between source systems and financial reporting systems

## COSO Framework Integration
Management's assessment of ICFR must use a suitable, recognized internal control framework. The most widely used is the COSO (Committee of Sponsoring Organizations) Internal Control — Integrated Framework (2013 edition). COSO defines internal control through five components:

- **Control Environment**: The tone and culture set by management, the integrity and ethical values of personnel, and the organizational structure for oversight of internal controls
- **Risk Assessment**: The process of identifying and analyzing risks to achieving financial reporting objectives, including the risk of fraud
- **Control Activities**: The policies and procedures that help ensure management directives are carried out, including IT general controls and application controls
- **Information and Communication**: The systems and processes that capture, process, and communicate the information needed to support internal controls, including IT systems
- **Monitoring Activities**: The ongoing and periodic evaluations that assess whether the five components of internal control are present and functioning

## PCAOB AS2201 Guidance
For accelerated filers, the external auditor's attestation on ICFR is governed by PCAOB Auditing Standard AS2201. Key guidance for IT audit includes:

- Auditors must understand IT controls sufficient to assess their design effectiveness
- The auditor must test operating effectiveness, not merely design adequacy
- Top-down approach: auditors start from the financial statement risk and work down to the IT controls that support those assertions
- Entity-level controls: auditors evaluate controls at the entity level (including the control environment) as well as controls at the process, transaction, and application level
- Significant accounts and disclosures drive the scope of ITGC testing
- Material weaknesses in ITGCs that could allow a material misstatement must be reported

## Common IT-Related Material Weaknesses
IT control failures that have resulted in material weakness disclosures include: failure to timely revoke access for terminated employees, lack of segregation of duties in financial systems, inadequate controls over privileged access to databases, failure to implement changes through formal change management, and inadequate logging of access to sensitive financial data.`,
  },
  {
    id: 'Section 409',
    name: 'Real Time Issuer Disclosures',
    category: 'key_section',
    content: `# SOX Section 409 — Real Time Issuer Disclosures

## Overview
Section 409 requires public companies to disclose to the public on a rapid and current basis any material changes in their financial condition or operations. This provision adds an IT and cybersecurity dimension because it requires companies to have the systems and processes in place to detect, assess, and escalate material events quickly enough to meet the real-time disclosure obligation.

## The Disclosure Obligation
Companies must disclose material changes on Form 8-K, typically within four business days of the triggering event. The SEC has broad rulemaking authority to define what types of events require disclosure and the timing requirements. Cybersecurity events have become a significant category of required real-time disclosure following SEC cybersecurity disclosure rules adopted in 2023, which require disclosure of material cybersecurity incidents within four business days of determining that an incident is material.

## IT Implications for Rapid Disclosure
Meeting the rapid disclosure requirement depends on IT and cybersecurity capabilities in several ways:

### Incident Detection and Assessment
The company must have security monitoring systems capable of detecting cybersecurity incidents. Detection capability alone is insufficient; the company must also be able to rapidly assess whether a detected incident is material — affecting financial condition, operations, or the company's ability to generate revenue — within a timeframe that permits timely disclosure. This requires defined escalation paths from the security operations center to senior management and legal counsel.

### Information Systems for Material Event Detection
The obligation extends beyond cybersecurity to any material change in financial condition or operations. Companies need information systems and processes to detect and surface material events across the business — financial system anomalies, operational disruptions, significant customer losses, or supply chain failures — and bring them to management's attention promptly.

### Disclosure Controls and Procedures
Section 409 reinforces the importance of the disclosure controls and procedures referenced in Section 302 certifications. Disclosure controls must be designed to ensure that material information is identified and communicated up the management chain on a timely basis. IT systems are central to these controls: they must be designed to generate alerts, escalations, and reports that bring material developments to the attention of those responsible for disclosure decisions.

### Cybersecurity Incident Materiality Assessment
Following SEC rules adopted in 2023, companies must determine whether a cybersecurity incident is material — assessing the impact on confidentiality, integrity, and availability of information, the impact on financial results, and the potential reputational or legal consequences — and make that determination within four business days of the triggering event. Companies need documented materiality assessment processes and clear escalation procedures to achieve this timeline reliably.`,
  },
  {
    id: 'Section 802',
    name: 'Criminal Penalties for Altering Documents',
    category: 'key_section',
    content: `# SOX Section 802 — Criminal Penalties for Altering Documents

## Overview
Section 802 establishes criminal penalties for knowingly altering, destroying, mutilating, concealing, covering up, falsifying, or making a false entry in any record, document, or tangible object with the intent to impede, obstruct, or influence a federal investigation or proceeding. For IT and cybersecurity compliance, Section 802 directly governs the retention, protection, and integrity of electronic records, including logs, emails, financial records, and audit trails.

## Document Retention Requirements
Section 802 establishes a minimum five-year retention period for audit workpapers and related records, and a seven-year retention period for audit and review workpapers. More broadly, the provision creates a strong legal incentive for companies to retain any records that could be relevant to a federal investigation for as long as there is a possibility of such an investigation.

## IT Implications for Records Management

### Immutable Audit Logs
Section 802 creates a legal requirement for audit logs to be preserved and protected against alteration. Log management systems must ensure that audit trails — particularly those capturing access to financial systems, changes to financial data, and privileged user activities — cannot be tampered with by system administrators or others. Controls may include write-once storage for log data, cryptographic hashing of log files to detect alteration, and segregation between those who operate financial systems and those who manage audit logging.

### Email and Electronic Communication Retention
Email and other electronic communications can constitute records subject to Section 802's document retention and anti-destruction provisions. Email archiving systems must capture, retain, and protect electronic communications according to defined retention schedules, and legal hold processes must be capable of preserving relevant communications when litigation or investigation is anticipated.

### Backup and Recovery Controls
Backup systems must be designed to ensure that records are not inadvertently or deliberately destroyed during normal backup rotation cycles. Legal holds must extend to backup media; records on backup tapes or other storage cannot be overwritten or destroyed if they are subject to a preservation obligation. IT teams must have processes to place holds on backup media when notified by legal counsel.

### Data Destruction Policies
Routine data destruction — carried out under normal retention schedules — must be suspended when an investigation is anticipated or underway. Section 802 makes it a crime to destroy records with intent to impede an investigation even if the destruction would otherwise be routine. IT teams must therefore have processes that allow legal counsel to trigger a preservation hold that overrides normal data lifecycle management activities.

## Criminal Penalties
Violations of Section 802 carry penalties of up to 20 years imprisonment and significant fines. Unlike some regulatory requirements, Section 802 creates criminal exposure for individuals — including IT staff — who participate in document destruction, not only for the company or its executives. IT personnel responsible for systems that manage financial records, audit logs, or backup media must understand the personal legal risk of participating in destruction of records in anticipation of or during an investigation.`,
  },
];

const SOX_GUIDANCE_AREAS = [
  {
    id: 'ITGC-Overview',
    name: 'IT General Controls (ITGCs) — SOX Compliance Overview',
    category: 'itgc',
    content: `# IT General Controls (ITGCs) for SOX Compliance

## What Are ITGCs?
IT General Controls are the foundational controls over IT infrastructure and processes that create the environment in which financial applications operate. They are called "general" controls because they apply broadly across systems rather than being specific to a single application or business process. For SOX purposes, ITGCs are important because they provide the foundation of assurance upon which IT application controls and manual financial controls depend. If ITGCs are weak, the reliability of every control that depends on IT is called into question.

## Why ITGCs Matter for SOX
A company's financial reporting process almost certainly depends on IT systems for transaction capture, processing, consolidation, and reporting. The integrity of those systems — and therefore the reliability of the financial reports they produce — depends on the effectiveness of ITGCs. External auditors performing SOX Section 404 attestations will evaluate ITGCs to determine whether they can rely on the automated controls embedded in financial applications, and to assess the overall risk that IT-related failures could allow material misstatements.

## The Five ITGC Domains

### Access to Programs and Data
The most frequently tested ITGC domain. Controls address who can access financial systems, data, and the underlying infrastructure. Key risk: unauthorized or excessive access could allow a user to manipulate financial data without detection. Key controls include formal user provisioning and deprovisioning tied to HR processes, role-based access aligned to job function and segregation of duties requirements, periodic access certification reviews, privileged access management with logging and monitoring, and controls over shared or service accounts.

### Program Development
Controls ensure that new applications and significant enhancements go through a structured lifecycle including requirements definition, design review, development, testing in a separate environment, user acceptance testing, formal approval, and controlled promotion to production. Key risk: inadequately tested or unauthorized new code could introduce bugs or backdoors into financial applications. Key controls include SDLC policy and procedures, separation of development and production environments, developer access restrictions to production, and formal approval gates before production deployment.

### Program Changes
Controls ensure that changes to production financial applications are authorized, tested, documented, and rolled back if they cause problems. The distinction between program development and program changes is that changes cover modifications to existing systems rather than entirely new systems, but the control objectives are similar. Key risk: unauthorized or untested changes could alter the way financial data is processed. Key controls include formal change request, review, and approval processes, independent testing prior to production deployment, emergency change procedures with after-the-fact review, and change logs that record what was changed, when, by whom, and why.

### Computer Operations
Controls over the reliable day-to-day operation of the IT infrastructure. Key risk: operational failures could cause data loss, incorrect processing, or unavailability of financial systems during critical close periods. Key controls include automated job scheduling with exception monitoring, incident management and escalation procedures, backup and recovery testing, capacity monitoring, and procedures for managing scheduled and unscheduled outages.

### Data Center / Physical Security
Physical controls limiting access to the computing infrastructure. Key risk: unauthorized physical access to servers and storage could allow attackers to bypass logical controls and directly access or modify financial data. Key controls include card-based or biometric physical access control, visitor logs, equipment inventory, environmental monitoring, and security of backup media.

## ITGC Testing Approach
External auditors test ITGCs by evaluating their design effectiveness (are the controls well-designed to achieve their objective?) and operating effectiveness (are the controls working as designed throughout the period under audit?). Operating effectiveness testing typically involves reviewing samples of evidence that controls were applied — for example, reviewing a sample of access provisioning requests to confirm they were properly approved, or a sample of change tickets to confirm they were tested and approved before deployment.

## Remediating ITGC Deficiencies
When ITGCs are found deficient, remediation must be timely and demonstrable. IT teams should document the root cause of the deficiency, implement a corrective action plan, and be prepared to provide evidence that the remediated control is operating effectively for a sufficient period before the audit period closes. Rapid remediation may be possible for some deficiencies, but demonstrating sustained operating effectiveness typically requires controls to have been in place for at least several months.`,
  },
  {
    id: 'ITAC-Overview',
    name: 'IT Application Controls (ITACs) — SOX Compliance Overview',
    category: 'itac',
    content: `# IT Application Controls (ITACs) for SOX Compliance

## What Are ITACs?
IT Application Controls are automated controls built into financial applications that govern how transactions are input, processed, and output. Unlike ITGCs — which create the environment for trustworthy IT — ITACs directly enforce business rules and financial controls within specific applications. Because they are automated, ITACs are highly reliable when they are functioning correctly; an automated control is not subject to human error or intentional override in the same way a manual control is.

## Why ITACs Matter for SOX
ITACs directly support financial reporting by ensuring that transactions are complete, accurate, and authorized. Auditors value automated controls because their reliability is high when the underlying ITGCs (particularly access and change controls) are effective. A well-designed and well-controlled automated control in a financial application provides stronger assurance than a manual control performed by an individual, because it operates consistently on every transaction without variation or fatigue.

## Categories of IT Application Controls

### Input Controls
Input controls validate data as it is entered into a financial application to prevent or detect errors at the point of origin. Common input controls include:
- **Format checks**: Ensuring data fields contain the expected type of data (e.g., numeric amounts, valid date formats)
- **Validity checks**: Ensuring that entered values are within an acceptable range or exist in a reference table (e.g., vendor code must match approved vendor master)
- **Completeness checks**: Requiring that all mandatory fields are populated before a transaction can be saved
- **Duplicate detection**: Alerting on or blocking potential duplicate payments or entries

### Processing Controls
Processing controls ensure that transactions are processed completely and accurately by the application. Common processing controls include:
- **Automated calculations**: System-calculated totals, taxes, depreciation amounts, and currency conversions that eliminate manual calculation error
- **Automated workflow routing**: System-enforced approval routing that sends transactions to the correct approver based on configurable rules
- **Segregation of duties enforcement**: Application-enforced restrictions preventing the same user from both entering and approving the same transaction
- **Batch totals**: Controls comparing transaction counts and amounts at the beginning and end of processing to confirm all transactions were processed

### Output Controls
Output controls help users verify that the output of financial applications is complete and accurate. Common output controls include:
- **Reconciliation reports**: System-generated reports comparing balances or transaction totals across related accounts or ledgers
- **Exception reports**: System-generated listings of transactions that fall outside defined parameters, alerting reviewers to potential errors or anomalies
- **Audit trail reports**: System-generated records of who entered or modified a transaction, when, and what changes were made

### Interface Controls
Interface controls govern the transfer of data between systems — for example, from a sales order system to a revenue recognition system, or from a payroll system to the general ledger. Common interface controls include:
- **Record counts**: Comparing the number of records sent from the source system to the number received by the destination system
- **Hash totals**: Summing transaction amounts in the source system and comparing the total to the amount received by the destination system to detect missing or corrupted records
- **Error handling**: Processes for detecting, logging, and resolving records that fail to transfer successfully

## Reliance on Automated Controls
When auditors determine that an IT application control is well-designed and that the ITGCs supporting the application (particularly access and change controls) are effective, they may be able to rely on the automated control with minimal additional testing. This reliance reduces the burden of manual substantive testing and is a significant efficiency benefit of strong automated controls. Conversely, if ITGCs are weak, auditors cannot rely on automated controls and must perform extensive manual testing instead.`,
  },
  {
    id: 'SOX-Audit-Requirements',
    name: 'SOX Audit Requirements and PCAOB AS2201',
    category: 'audit',
    content: `# SOX Audit Requirements and PCAOB AS2201

## Overview
For public companies that qualify as "accelerated filers" or "large accelerated filers," Section 404(b) requires that the external auditor attest to and report separately on management's assessment of ICFR. The PCAOB (Public Company Accounting Oversight Board) governs the standards for this audit through Auditing Standard AS2201, "An Audit of Internal Control Over Financial Reporting That Is Integrated with An Audit of Financial Statements."

## The Integrated Audit Concept
AS2201 is designed so that the audit of ICFR and the audit of the financial statements are integrated — meaning auditors plan and execute both audits together rather than treating them as separate engagements. Evidence gathered in the ICFR audit can support the financial statement audit and vice versa. The integrated approach is more efficient and produces a more comprehensive view of financial reporting risk.

## Top-Down Audit Approach
AS2201 requires auditors to use a top-down approach:
1. **Start at the financial statement level**: Identify significant accounts, disclosures, and the relevant assertions associated with each
2. **Evaluate entity-level controls**: Assess the control environment, risk assessment, monitoring, and other entity-level controls that may affect multiple processes
3. **Identify significant processes and systems**: Determine which processes and IT systems are relevant to the identified significant accounts and assertions
4. **Identify key controls**: For each significant process, identify the controls that are most important for preventing or detecting material misstatement
5. **Evaluate design effectiveness**: Determine whether the controls, if operating as designed, would prevent or detect material misstatement
6. **Test operating effectiveness**: Test whether the controls actually operated as designed throughout the audit period

## IT-Specific Audit Procedures
For IT controls relevant to ICFR, auditors will typically perform the following procedures:

### ITGC Evaluation
- Review ITGC policies and procedures
- Inquire of IT personnel responsible for each ITGC domain
- Observe operation of key controls
- Inspect evidence of control operation (e.g., access review sign-offs, change approval tickets, backup test results)
- Test a sample of specific control instances to evaluate operating effectiveness

### IT Application Control Evaluation
- Understand the application's role in financial reporting
- Evaluate the design of automated controls
- Confirm that the controls function as designed (often through a walkthrough of the system)
- If ITGCs supporting the application are effective, limit testing to confirming the automated control is functioning as designed (often a one-time test rather than a sample)

### Reliance on Work of Others
Auditors may use the work of internal audit or other service providers to support their ICFR assessment, subject to evaluation of the competence and objectivity of those who performed the work. Strong internal audit coverage of ITGCs can reduce the extent of procedures the external auditor must perform directly.

## Material Weakness Reporting
If the auditor identifies a material weakness in ICFR — a deficiency that creates a reasonable possibility that a material misstatement of the financial statements will not be prevented or detected on a timely basis — the auditor must express an adverse opinion on the effectiveness of ICFR. Management must also disclose the material weakness in their internal control report. Disclosure of a material weakness typically has significant consequences for investor confidence and share price.

## Common IT-Related Audit Findings
Auditors frequently identify IT control deficiencies in the following areas: excessive access rights, particularly to financial system tables and data; failure to deactivate accounts for terminated employees on a timely basis; inadequate segregation of duties in financial systems; lack of controls over privileged user access; inadequate change management for financial applications; and failure to retain evidence of control operation.`,
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
      .eq('abbreviation', 'SOX')
      .single();

    if (frameworkError || !framework) {
      return new Response(
        JSON.stringify({ error: 'SOX framework not found in compliance_frameworks table' }),
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
          name: 'Sarbanes-Oxley Act of 2002 — SEC Official Text',
          url: 'https://www.sec.gov/about/laws/soa2002.pdf',
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
        JSON.stringify({ error: 'Failed to find or create SOX source' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: job } = await supabase
      .from('ingest_jobs')
      .insert({ source_id: source.id, status: 'in_progress', started_at: new Date().toISOString() })
      .select('id')
      .single();

    let documentsIngested = 0;

    // Ingest key SOX sections
    for (const section of SOX_SECTIONS) {
      const sectionMeta = {
        section_id: section.id,
        section_name: section.name,
        category: section.category,
        version: '2002',
      };

      const { data: sectionDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `SOX ${section.id} — ${section.name}`,
        document_type: 'control',
        url: 'https://www.sec.gov/about/laws/soa2002.pdf',
        version: '2002',
        raw_content: section.content,
        metadata: sectionMeta,
        is_indexed: true,
      }).select('id').single();

      if (sectionDoc) await insertChunk(sectionDoc.id, section.content, sectionMeta);
      documentsIngested++;
    }

    // Ingest guidance areas (ITGCs, ITACs, audit)
    for (const area of SOX_GUIDANCE_AREAS) {
      const areaMeta = {
        area_id: area.id,
        area_name: area.name,
        category: area.category,
        version: '2002',
      };

      const { data: areaDoc } = await supabase.from('documents').insert({
        source_id: source.id,
        framework_id: framework.id,
        title: `SOX — ${area.name}`,
        document_type: 'framework',
        url: 'https://www.sec.gov/about/laws/soa2002.pdf',
        version: '2002',
        raw_content: area.content,
        metadata: areaMeta,
        is_indexed: true,
      }).select('id').single();

      if (areaDoc) await insertChunk(areaDoc.id, area.content, areaMeta);
      documentsIngested++;
    }

    if (job) {
      await supabase.from('ingest_jobs').update({
        status: 'completed',
        documents_ingested: documentsIngested,
        completed_at: new Date().toISOString(),
      }).eq('id', job.id);
    }

    return new Response(
      JSON.stringify({ success: true, documents_ingested: documentsIngested, message: 'SOX ingested successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('SOX ingest error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
