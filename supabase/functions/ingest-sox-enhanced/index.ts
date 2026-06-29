import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  const data = await response.json();
  if (!data.data?.[0]?.embedding) throw new Error(`Embedding failed: ${JSON.stringify(data)}`);
  return data.data[0].embedding;
}

async function insertChunk(documentId: string, content: string, embedding: number[]) {
  await supabase.from('document_chunks').insert({
    document_id: documentId,
    chunk_index: 0,
    content,
    embedding,
  });
}

const SOX_DATA = [
  {
    id: 'SOX-302',
    category: 'Statutory — CEO/CFO Certifications',
    title: 'Section 302: CEO and CFO Quarterly Certifications of Financial Reports',
    guidance: `Section 302 of the Sarbanes-Oxley Act requires the principal executive officer (CEO) and principal financial officer (CFO) of each reporting company to personally certify the accuracy and completeness of quarterly (10-Q) and annual (10-K) reports filed with the SEC. These certifications are not delegable — the named officers must sign personally and face individual criminal liability for false statements.

The certification covers six primary assertions. First, the signing officer has reviewed the report. Second, the report does not contain any untrue statement of material fact or omit a material fact that would make the statements misleading. Third, the financial statements and other financial information fairly present, in all material respects, the financial condition, results of operations, and cash flows of the company. Fourth, the signing officers are responsible for establishing and maintaining disclosure controls and procedures (DC&P) and have designed those controls to ensure material information is made known to them. Fifth, the officers have disclosed to the audit committee and external auditors all significant deficiencies and material weaknesses in internal controls, along with any fraud involving management or employees with a significant role in internal controls. Sixth, the officers have disclosed any significant changes in internal controls that occurred during the period.

Personal liability is real. An officer who certifies knowing the certification is false faces fines up to $1 million and up to 10 years imprisonment for negligent false certifications, or fines up to $5 million and up to 20 years imprisonment for willful false certifications under Section 906.

Disclosure controls and procedures (DC&P) are distinct from internal controls over financial reporting (ICFR). DC&P encompass all information that must be disclosed to investors under Exchange Act reporting obligations, not just financial statement line items. Companies should maintain a sub-certification process in which business unit leaders and process owners confirm the accuracy of information flowing up to the CEO/CFO before they sign. Evidence of this sub-certification process — emails, signed attestations, meeting minutes — should be retained for at least seven years.

In practice, the certification process triggers the quarterly close calendar. Finance teams should schedule the sub-certification deadline to allow at least five business days for the CEO and CFO to review disclosures, consult legal counsel, and sign the certifications before the filing deadline.`,
  },
  {
    id: 'SOX-404A',
    category: 'Statutory — Internal Controls Assessment',
    title: 'Section 404(a): Management Annual Assessment of Internal Controls Over Financial Reporting',
    guidance: `Section 404(a) requires management of every SEC reporting company to include in its annual report (10-K) an internal control report that: (1) states management's responsibility for establishing and maintaining adequate internal control over financial reporting (ICFR); and (2) contains an assessment, as of the end of the most recent fiscal year, of the effectiveness of those controls.

ICFR is defined as a process designed to provide reasonable assurance that financial reporting is reliable and that financial statements are prepared in accordance with GAAP. Reasonable assurance does not mean absolute assurance — ICFR cannot prevent all errors, only provide a reasonable basis for confidence in financial reporting.

Management's assessment must be based on a recognized internal control framework. The most widely used is the COSO 2013 Internal Control — Integrated Framework. Management evaluates controls against COSO's five components and 17 principles, then concludes whether each principle is present and functioning, and whether the five components are present and functioning together.

The assessment process typically involves: (1) scoping — identifying significant accounts, disclosures, and business processes; (2) documentation — flowcharts and narratives describing how controls work; (3) testing — evaluating whether controls are designed and operating effectively; (4) deficiency evaluation — classifying any control gaps as control deficiencies, significant deficiencies, or material weaknesses; and (5) conclusion — management's opinion on whether ICFR is effective.

If any material weakness exists, management must disclose it and conclude that ICFR is not effective. A material weakness is a deficiency, or combination of deficiencies, in ICFR such that there is a reasonable possibility that a material misstatement of the financial statements will not be prevented or detected on a timely basis.

Evidence retention is critical. Management must maintain evidence supporting its assessment — testing workpapers, control documentation, deficiency logs — for at least seven years, consistent with the document retention requirements of Section 802.`,
  },
  {
    id: 'SOX-404B',
    category: 'Statutory — External Auditor Attestation',
    title: 'Section 404(b): External Auditor Attestation of Internal Controls Over Financial Reporting',
    guidance: `Section 404(b) requires the external auditor of an accelerated filer or large accelerated filer to attest to and report on management's assessment of ICFR. The external auditor does not merely review management's work — it performs its own independent evaluation and issues a separate opinion on whether ICFR is effective as of the fiscal year-end date.

Accelerated filer status is determined by public float: large accelerated filers have a public float of $700 million or more; accelerated filers have a public float between $75 million and $700 million. Non-accelerated filers and emerging growth companies (EGCs) are exempt from Section 404(b) for a period of time.

The external auditor's attestation is governed by PCAOB Auditing Standard AS2201 (formerly AS5). The auditor performs a risk-based, top-down audit of ICFR that begins with entity-level controls, focuses on the risk of material misstatement, and emphasizes the areas of greatest risk. The auditor integrates the ICFR audit with the financial statement audit to gain efficiencies.

The auditor issues one of four opinions on ICFR: (1) unqualified — ICFR is effective; (2) qualified — ICFR is effective except for a specific matter; (3) adverse — ICFR is not effective due to one or more material weaknesses; or (4) disclaimer — the auditor was unable to form an opinion.

Audit committee oversight of the external auditor relationship includes approving the audit engagement, reviewing the scope of the ICFR audit, discussing identified deficiencies and management's remediation plans, and pre-approving all non-audit services. Companies should communicate proactively with the external auditor throughout the year, not just at year-end, to avoid surprises regarding scope changes or deficiency classifications.`,
  },
  {
    id: 'SOX-409',
    category: 'Statutory — Real-Time Disclosure',
    title: 'Section 409: Real-Time Disclosure of Material Changes in Financial Condition',
    guidance: `Section 409 amended Section 13 of the Securities Exchange Act of 1934 to require companies to disclose information on material changes in their financial condition or operations on a rapid and current basis. This statutory requirement is implemented through the SEC's Form 8-K filing rules, which generally require disclosure within four business days of a triggering event.

Material changes requiring rapid disclosure include, but are not limited to: entry into or termination of a material definitive agreement; completion of acquisition or disposition of a material amount of assets; results of operations and financial condition (quarterly earnings releases); creation of a direct financial obligation or off-balance-sheet arrangement; triggering events that accelerate or increase a direct financial obligation; costs associated with exit or disposal activities; material impairments; departure of directors or principal officers and election of directors or appointment of principal officers; amendments to articles of incorporation or bylaws; changes in fiscal year; and changes in certifying accountant.

The four-business-day clock begins on the date the company determines that a disclosure obligation exists. For some events, the trigger is the date the event occurs; for others, it is the date management concludes a threshold has been met (for example, the date management determines that an impairment charge meets the materiality threshold).

Companies should maintain a disclosure committee — typically composed of the CFO, General Counsel, Controller, and other senior officers — to evaluate potential material events on a timely basis. The committee should meet regularly and convene on an ad hoc basis whenever a potential triggering event is identified. Minutes documenting the committee's deliberations and conclusions support Section 302 certifications and demonstrate a functioning disclosure control system.

Best practice is to map all potential 8-K triggering categories to business process owners who are responsible for promptly notifying the disclosure committee when those events occur.`,
  },
  {
    id: 'SOX-802',
    category: 'Statutory — Document Retention',
    title: 'Section 802: Criminal Penalties for Destruction or Alteration of Documents',
    guidance: `Section 802 of SOX amended federal criminal law (18 U.S.C. § 1519) to make it a federal crime to knowingly alter, destroy, mutilate, conceal, cover up, falsify, or make a false entry in any record, document, or tangible object with intent to impede, obstruct, or influence a federal investigation, or in contemplation of such an investigation. Penalties include fines and imprisonment up to 20 years.

Section 802 also established a minimum document retention period for audit workpapers. Audit firms and their personnel must retain workpapers and other documents related to an audit or review for seven years from the date of the audit report, or from the date on which the audit is concluded if no report is issued. Willful violation of the retention requirement is punishable by fines and up to 10 years imprisonment.

For public companies, the practical implications extend beyond the auditors. Companies must maintain all records that could be relevant to SEC examinations, shareholder litigation, or DOJ investigations. The SEC's rules under SOX require that records related to ICFR assessments — testing workpapers, deficiency evaluations, remediation tracking — be retained for at least seven years.

A compliant records retention program should include: (1) a formal document retention policy specifying categories of records and their minimum retention periods; (2) legal hold procedures that suspend normal destruction schedules when litigation or investigation is reasonably anticipated; (3) controls over electronic records including email, collaboration tools, and financial systems; and (4) regular training for employees on retention obligations.

The legal hold process is particularly important. Once management is aware of a potential investigation or litigation, destruction of relevant documents — even pursuant to a normal retention schedule — can constitute obstruction. The General Counsel or Legal Department should be the designated authority to issue and track legal holds.`,
  },
  {
    id: 'SOX-806',
    category: 'Statutory — Whistleblower Protections',
    title: 'Section 806: Whistleblower Protections for Employees Who Report Securities Fraud',
    guidance: `Section 806 of SOX protects employees of publicly traded companies, and contractors or subcontractors of such companies, who provide information about or assist in an investigation of mail fraud, wire fraud, bank fraud, securities fraud, SEC rule violations, or federal law violations relating to shareholder fraud. The protection extends to employees who report concerns internally to a supervisor, to the audit committee or board, or externally to the SEC, DOJ, or Congress.

Protected employees cannot be discharged, demoted, suspended, threatened, harassed, or discriminated against in the terms and conditions of employment. If retaliation occurs, the employee may file a complaint with the Department of Labor (OSHA) within 180 days. If OSHA does not issue a final decision within 180 days, the employee may bring the claim in federal district court. Remedies include reinstatement, back pay with interest, and attorney's fees.

The Dodd-Frank Wall Street Reform Act of 2010 significantly enhanced SOX whistleblower protections by adding an SEC whistleblower program that awards 10-30% of monetary sanctions exceeding $1 million to whistleblowers who provide original information leading to a successful enforcement action. Dodd-Frank also extended the statute of limitations and made it easier for whistleblowers to succeed on retaliation claims.

Companies should implement a robust whistleblower program that includes: (1) an anonymous reporting hotline or web portal operated by an independent third party; (2) a clear anti-retaliation policy communicated to all employees; (3) procedures for the audit committee to receive, retain, and address complaints regarding accounting, internal controls, and auditing matters; (4) a prompt, thorough, and confidential investigation process; and (5) non-disclosure agreements that explicitly carve out the right to report to government agencies.

Attempting to suppress whistleblower activity — including through broad NDAs, separation agreements that prevent SEC reporting, or actual retaliation — creates significant legal and reputational risk.`,
  },
  {
    id: 'SOX-906',
    category: 'Statutory — Criminal Certifications',
    title: 'Section 906: Criminal Certifications Accompanying Periodic Reports',
    guidance: `Section 906 requires the CEO and CFO to certify, in connection with each periodic report filed with the SEC, that the report fully complies with the requirements of Section 13(a) or 15(d) of the Securities Exchange Act and that the information contained in the report fairly presents, in all material respects, the financial condition and results of operations of the company.

Unlike Section 302 certifications, which are civil certifications subject to the SEC's enforcement authority, Section 906 certifications are criminal certifications embedded directly in U.S. criminal law (18 U.S.C. § 1350). An officer who certifies knowing the certification contains a false statement is subject to a fine of up to $1 million and imprisonment up to 10 years. An officer who willfully certifies a false statement — meaning the officer knew the financial statements were materially misleading — faces a fine of up to $5 million and up to 20 years imprisonment.

The knowing vs. willful distinction is important. A knowing false certification requires only that the officer knew the statement was false; a willful false certification requires that the officer also knew that making the false statement was unlawful. Prosecutors have successfully argued that a CEO who rubber-stamps the certification without reviewing the underlying financial statements has acted "knowingly" because they signed a document they knew they had not verified.

Practical controls that support accurate Section 906 certifications mirror those for Section 302: a sub-certification chain from business units to the CFO, a functioning disclosure committee, documented review of financial statements by the CEO and CFO prior to filing, legal counsel review of all 10-K and 10-Q filings, and a clear process for the CFO to escalate any concerns about accounting judgments to the audit committee before the filing deadline.`,
  },
  {
    id: 'COSO-OVERVIEW',
    category: 'COSO Framework',
    title: 'COSO 2013 Internal Control — Integrated Framework: Overview and Role in SOX Compliance',
    guidance: `The Committee of Sponsoring Organizations of the Treadway Commission (COSO) published its updated Internal Control — Integrated Framework in 2013, replacing the original 1992 framework. The SEC and PCAOB recognize COSO 2013 as the most widely used suitable criteria for management's assessment of ICFR under SOX Section 404. While other frameworks are permitted (for example, COBIT for IT-specific assessments), COSO 2013 is the de facto standard for U.S. public companies.

The framework defines internal control as a process, effected by an entity's board of directors, management, and other personnel, designed to provide reasonable assurance regarding the achievement of objectives in three categories: (1) operations — effectiveness and efficiency of operations; (2) reporting — reliability of financial and non-financial reporting; and (3) compliance — adherence to applicable laws and regulations. SOX ICFR focuses primarily on the reporting objective as it relates to external financial reporting.

The 2013 update introduced 17 principles organized across five components of internal control. The principles formalize concepts that were implicit in the 1992 framework and provide a more rigorous basis for evaluating whether a component is present and functioning. Management must evaluate all 17 principles — if any principle is determined to be not present or not functioning, the related component has a deficiency, which must be evaluated to determine whether it rises to a significant deficiency or material weakness.

The framework also introduced the concept of "points of focus," which are characteristics of each principle that help management assess whether the principle is present and functioning. Points of focus are not requirements — they are guidance — but they provide useful benchmarks for control design and evaluation.

Companies should document their COSO framework assessment in a structured manner: a matrix mapping each of the 17 principles to specific controls within the company's control environment, with supporting evidence of the design and operating effectiveness of those controls. This documentation forms the backbone of management's 404(a) assessment.`,
  },
  {
    id: 'COSO-CONTROL-ENV',
    category: 'COSO Framework — Five Components',
    title: 'COSO Component 1: Control Environment — The Foundation of Internal Control',
    guidance: `The Control Environment is the first and foundational component of the COSO framework. It sets the tone of the organization and influences the control consciousness of its people. Without a strong control environment, the other four components cannot function effectively, because the control environment establishes the culture and discipline that enables all other controls to work.

The control environment encompasses five COSO principles: (1) the organization demonstrates a commitment to integrity and ethical values; (2) the board of directors demonstrates independence from management and exercises oversight of internal control; (3) management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities to achieve objectives; (4) the organization demonstrates a commitment to attract, develop, and retain competent individuals; and (5) the organization holds individuals accountable for their internal control responsibilities.

For SOX purposes, entity-level controls related to the control environment are critical because deficiencies here can have a pervasive effect on all financial reporting processes. A pervasive deficiency — such as a management culture that pressures employees to meet earnings targets at any cost — can result in a material weakness even in the absence of a specific process-level control failure.

Control environment evidence includes: a Code of Ethics and Business Conduct with annual employee acknowledgment; anti-fraud policies including specific policies on revenue recognition and expense reporting; board and audit committee charters that define independence and oversight responsibilities; organizational charts that establish clear reporting lines; performance management systems that incorporate control responsibilities; and documentation of disciplinary actions taken when control failures occur, demonstrating that the tone at the top is enforced.

Auditors assess the control environment through inquiry of personnel at multiple levels (not just management), observation, and inspection of documents. A strong control environment does not eliminate the need for process-level controls, but it creates the conditions under which those controls are more likely to be consistently followed.`,
  },
  {
    id: 'COSO-RISK-ASSESSMENT',
    category: 'COSO Framework — Five Components',
    title: 'COSO Component 2: Risk Assessment — Identifying and Analyzing Risks to Financial Reporting',
    guidance: `Risk Assessment is the second COSO component and represents management's process for identifying and analyzing risks that could prevent the organization from achieving its financial reporting objectives. For SOX ICFR purposes, risk assessment focuses on risks that could result in a material misstatement of the financial statements.

The four COSO principles in this component are: (6) the organization specifies objectives with sufficient clarity to enable the identification and assessment of risks to those objectives; (7) the organization identifies risks to the achievement of its objectives across the entity and analyzes risks as a basis for determining how risks should be managed; (8) the organization considers the potential for fraud in assessing risks to the achievement of objectives; and (9) the organization identifies and assesses changes that could significantly impact the system of internal control.

For external financial reporting, Principle 6 requires that management identify the financial reporting objectives — essentially, that the financial statements comply with GAAP. Principle 7 requires an entity-wide risk identification process, including consideration of significant accounts, complex transactions, estimates and judgments, and risks arising from new or changed business activities. Principle 8, the fraud risk assessment, is explicitly required and should consider the risk of management override of controls, which PCAOB standards identify as a risk that should always be present in an ICFR assessment.

The risk assessment should be documented and updated at least annually, or more frequently when significant changes occur — new products, acquisitions, system implementations, key personnel changes, regulatory changes. Changes identified in Principle 9 feed into the scoping process: a significant new system or business process likely introduces new risks that require new controls.

Practical risk assessment for SOX: rank accounts and disclosures by quantitative materiality and qualitative risk factors (complexity, estimation uncertainty, related-party transactions, non-routine transactions); identify the assertions at risk for each significant account; and map those assertions to specific controls. This risk-based approach aligns with what external auditors expect under AS2201.`,
  },
  {
    id: 'COSO-CONTROL-ACTIVITIES',
    category: 'COSO Framework — Five Components',
    title: 'COSO Component 3: Control Activities — Policies and Procedures That Mitigate Risk',
    guidance: `Control Activities are the actions established by policies and procedures that help ensure management directives to mitigate risks to the achievement of objectives are carried out. They are the specific controls — approvals, authorizations, verifications, reconciliations, reviews, and segregations of duty — that operate within business processes to prevent or detect material misstatements.

The three COSO principles in this component are: (10) the organization selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels; (11) the organization selects and develops general control activities over technology to support the achievement of objectives; and (12) the organization deploys control activities through policies that establish what is expected and through procedures that put policies into action.

Control activities span two broad types: preventive controls, which stop errors or fraud before they occur (such as system-enforced segregation of duties or an approval workflow that prevents a transaction from posting without authorization), and detective controls, which identify errors or fraud after they occur (such as bank reconciliations, exception reports, or management reviews of account balances against budget).

Principle 11 explicitly calls out technology general controls (ITGCs) as a category of control activity. This means that the integrity of automated controls depends on the effectiveness of the ITGCs that govern the systems in which those controls reside. If ITGCs over a financial system are deficient, automated controls in that system may not be reliable, which in turn may require expansion of manual detective controls to compensate.

Control documentation requirements: each significant control should have a documented description that identifies the control objective, the risk being mitigated, the control owner, the frequency of operation (daily, monthly, quarterly, annual), the evidence produced, and the population to which the control applies. For automated controls, documentation should also identify the system name, the specific configuration setting or system logic that performs the control, and the ITGC reliance chain.`,
  },
  {
    id: 'COSO-INFO-COMM',
    category: 'COSO Framework — Five Components',
    title: 'COSO Component 4: Information and Communication — Supporting Internal Control with Quality Information',
    guidance: `Information and Communication is the fourth COSO component, covering the flow of information necessary to support the functioning of internal controls and the communication of control responsibilities throughout the organization.

The three principles are: (13) the organization obtains or generates and uses relevant, quality information to support the functioning of internal control; (14) the organization internally communicates information, including objectives and responsibilities for internal control, to support the functioning of internal control; and (15) the organization communicates with external parties regarding matters affecting the functioning of internal control.

For SOX ICFR, Principle 13 relates to the information systems and data that feed financial reporting. The financial reporting process depends on accurate, complete, and timely data flowing from operational systems (ERP, CRM, supply chain) through to the general ledger and financial statements. Controls over data integrity — interface controls, data validation, reconciliations — are a direct expression of Principle 13.

Principle 14 covers internal communication of control responsibilities. Controls cannot operate effectively if control owners do not know what they are expected to do, how to do it, or why it matters. Effective internal communication mechanisms include control owner training, documented control procedures, periodic reminders from the CFO or Controller about the importance of controls, and escalation paths for reporting control failures.

Principle 15 covers external communication, including communication with external auditors, regulatory agencies, and (for financial reporting) investors through public disclosures. The audit committee plays a central role here, serving as the channel for communication between the external auditor and the board, and ensuring that management does not improperly influence the audit.

SOX-specific communication controls include: disclosure committee procedures that ensure material information is communicated to the CEO and CFO before filings; sub-certification processes that push accountability for accuracy down to business unit leaders; and financial reporting calendars that ensure information is available to management on a timely basis for their review controls.`,
  },
  {
    id: 'COSO-MONITORING',
    category: 'COSO Framework — Five Components',
    title: 'COSO Component 5: Monitoring — Assessing Whether Internal Control Is Present and Functioning',
    guidance: `Monitoring is the fifth COSO component and represents the activities management uses to assess whether the internal control system is present and functioning over time. Unlike the other components, which focus on designing and operating controls, Monitoring is about evaluating whether those controls continue to work.

The two principles are: (16) the organization selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning; and (17) the organization evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action, including senior management and the board of directors as appropriate.

Monitoring activities come in two forms. Ongoing monitoring is built into normal business operations and is performed in real-time or near-real-time. Examples include supervisory reviews, exception reports generated by systems, management dashboards that highlight anomalies, and automated controls that produce alerts. Separate evaluations are periodic assessments that step back from day-to-day operations to evaluate the overall effectiveness of internal control — the annual SOX Section 404 assessment is itself a separate evaluation.

Principle 17 is particularly important for SOX. When a control deficiency is identified — whether through testing, an audit finding, an incident, or a tip — it must be communicated promptly to those responsible for taking action. Deficiencies that could be significant deficiencies or material weaknesses must be communicated to the CEO, CFO, and audit committee before the annual report is filed. Unreported deficiencies, or slow communication of known issues, are themselves a control failure.

The monitoring program should include: an internal audit function (or co-sourced arrangement) that performs independent evaluations of key controls; a process for business units to self-assess their controls; automated monitoring reports from financial systems; deficiency tracking in a centralized log with assigned owners, root cause analysis, remediation actions, and target completion dates; and periodic reporting to the audit committee on the status of open deficiencies.`,
  },
  {
    id: 'COSO-17-PRINCIPLES',
    category: 'COSO Framework',
    title: 'COSO 17 Principles Mapped to SOX ICFR Requirements',
    guidance: `The 17 principles of the COSO 2013 framework provide the granular criteria against which management evaluates the effectiveness of its ICFR system. All 17 principles must be present and functioning for management to conclude that ICFR is effective. The absence or failure of any principle constitutes at minimum a control deficiency, and depending on severity, may constitute a significant deficiency or material weakness.

The principles map to the five components as follows. Control Environment (Principles 1-5): Commitment to integrity and ethical values; Board independence and oversight; Organizational structures and authorities; Commitment to competence; Accountability. Risk Assessment (Principles 6-9): Specification of suitable objectives; Risk identification and analysis; Fraud risk assessment; Identification of changes. Control Activities (Principles 10-12): Selection of control activities; Technology general controls; Deployment through policies and procedures. Information and Communication (Principles 13-15): Relevant quality information; Internal communication; External communication. Monitoring (Principles 16-17): Ongoing and separate evaluations; Evaluation and communication of deficiencies.

For SOX management assessment, the evaluation of each principle should be documented with evidence. A common approach is a "Principles Assessment Matrix" — a spreadsheet or system with one row per principle, describing the controls or other evidence that demonstrate the principle is present and functioning, noting any gaps, and rating the overall status of each principle. Where gaps are identified, they should be linked to the deficiency evaluation process.

PCAOB AS2201 directs auditors to evaluate the same five components and, as part of that evaluation, to assess whether deficiencies in the components, individually or in combination, constitute a material weakness. Auditors focus particular attention on entity-level controls related to the Control Environment and Monitoring components, because weaknesses there can have a pervasive impact on all other controls.`,
  },
  {
    id: 'COSO-ENTITY-VS-PROCESS',
    category: 'COSO Framework',
    title: 'Entity-Level Controls vs. Process-Level Controls in the COSO Framework',
    guidance: `The COSO framework and PCAOB AS2201 distinguish between entity-level controls, which operate across the entire organization, and process-level controls, which operate within specific business processes or transaction cycles.

Entity-level controls (ELCs) are pervasive in nature — they affect the overall effectiveness of internal control across the organization. ELCs include: the control environment (tone at the top, Code of Ethics, HR policies); risk assessment processes; certain monitoring controls (internal audit, self-assessment); and centralized controls such as the period-end financial close and consolidation process. ELCs also include information technology general controls, which underpin the reliability of every automated control across all business processes.

Process-level controls are specific to a transaction cycle or business process — revenue recognition, accounts payable, payroll, treasury. These controls address specific financial statement assertions: existence, completeness, accuracy, cutoff, classification, and presentation. Process-level controls include three-way match in accounts payable, segregation of duties between journal entry preparers and approvers, bank reconciliations, and management review of account balances.

The distinction matters for SOX scoping and testing. PCAOB AS2201's top-down approach directs auditors to evaluate entity-level controls first. Strong entity-level controls — particularly those that directly address risks at the assertion level — may reduce the amount of testing required at the process level. For example, a strong management review control that involves the CFO reviewing detailed account analyses each quarter can compensate for gaps in lower-level process controls, provided the review is sufficiently precise to detect a material misstatement.

Conversely, entity-level control weaknesses can impair reliance on all process-level controls. A deficient control environment — for example, evidence of management override or a culture that discourages raising concerns — puts all process-level controls at greater risk and typically requires expanded testing.

When scoping the SOX program, companies should document the population of entity-level controls separately from process-level controls, test them on an appropriate schedule (many ELCs are tested annually), and evaluate their impact on the overall assessment.`,
  },
  {
    id: 'PCAOB-AS2201-OVERVIEW',
    category: 'PCAOB Standards',
    title: 'PCAOB AS2201: Auditing Internal Control Over Financial Reporting — Overview',
    guidance: `PCAOB Auditing Standard AS2201, "An Audit of Internal Control Over Financial Reporting That Is Integrated with An Audit of Financial Statements," establishes the requirements for external auditors when conducting an ICFR audit under SOX Section 404(b). AS2201 replaced the original AS2 (formerly AS5) and is the primary standard governing how auditors plan, perform, and report on ICFR audits.

The fundamental principle of AS2201 is integration: the ICFR audit and the financial statement audit should be planned and performed together to maximize efficiency and effectiveness. Evidence gathered for one purpose can be used for the other, reducing redundant work. The auditor uses a single, integrated risk assessment to plan both audits simultaneously.

AS2201 requires the auditor to obtain reasonable assurance — the same level of assurance required for the financial statement audit — about whether material weaknesses in ICFR exist as of the fiscal year-end date. The auditor's conclusion is expressed as an opinion on the effectiveness of ICFR, not merely on management's assessment of ICFR.

The standard's key requirements include: planning the audit using a top-down, risk-based approach; identifying entity-level controls and their impact on the audit strategy; identifying significant accounts, disclosures, and relevant assertions; understanding the flow of transactions; selecting and testing controls based on assessed risk; evaluating identified control deficiencies; and communicating required findings to the audit committee.

AS2201 explicitly states that the auditor must be skeptical of management's work and cannot simply rely on management testing without performing independent work. The nature, timing, and extent of testing is the auditor's professional judgment, but the standard provides extensive guidance on minimum testing requirements, particularly for higher-risk controls. For the highest-risk controls — those addressing risks of material misstatement where a deficiency could result in a material weakness — the auditor must perform sufficient testing to obtain a high level of assurance.`,
  },
  {
    id: 'PCAOB-AS2201-RISK',
    category: 'PCAOB Standards',
    title: 'AS2201 Risk Assessment: Identifying Significant Accounts, Disclosures, and Relevant Assertions',
    guidance: `AS2201's risk assessment process begins with identifying significant accounts and disclosures, and the relevant financial statement assertions for each. This identification drives all subsequent scoping decisions about which controls require testing.

A significant account or disclosure is one for which there is a reasonable possibility that a material misstatement could exist. Risk factors the auditor considers include: the size and composition of the account; susceptibility to misstatement due to errors or fraud; volume of activity and complexity of individual transactions; degree of accounting judgment involved; nature of the account (e.g., related-party transactions, estimates); exposure to losses; likelihood that contingent liabilities will arise; existence of related-party transactions; and the nature and extent of changes in the account or disclosure since the prior period.

For each significant account, the auditor identifies the relevant financial statement assertions. The five assertions for account balances are: existence (assets and liabilities exist at year-end), completeness (all assets, liabilities, and equity that should have been recorded are recorded), valuation (assets, liabilities, and equity are included at appropriate amounts), rights and obligations (the entity holds or controls the rights to assets, and obligations are obligations of the entity), and presentation and disclosure (accounts are appropriately classified and related disclosures are adequate).

The risk of material misstatement at the assertion level drives the nature, timing, and extent of control testing. Higher-risk assertions require more persuasive evidence that the controls addressing those assertions are effective. For example, the completeness and cutoff assertions for revenue recognition are typically higher risk and require more extensive testing than the existence assertion for cash.

Significant locations and business units are identified based on whether misstatements in financial information at those locations could, individually or in the aggregate, cause the company's financial statements to be materially misstated. For companies with multiple locations, the auditor uses a coverage analysis to determine which locations must be included in the ICFR audit scope.`,
  },
  {
    id: 'PCAOB-AS2201-TOPDOWN',
    category: 'PCAOB Standards',
    title: 'AS2201 Top-Down Approach: Starting with Entity-Level Controls',
    guidance: `AS2201 requires the auditor to use a top-down approach when auditing ICFR. This approach begins at the financial statement level with the auditor's understanding of the overall risks to ICFR, and then works down through entity-level controls to process-level controls. The top-down approach is designed to focus audit effort on the highest-risk areas and allow entity-level controls to reduce (but not eliminate) the amount of testing needed at the process level.

The first step is to evaluate entity-level controls. Entity-level controls with a direct impact on specific risks to the financial statements — meaning the control itself directly addresses the risk of material misstatement — can allow the auditor to reduce testing of other controls that address the same risk. For example, a highly effective management review control (a "direct" ELC) that involves the CFO comparing key financial metrics to budget and prior period with investigation of all variances exceeding a defined threshold may reduce the need to test the underlying population of transactions generating those balances.

Entity-level controls with an indirect impact — meaning they operate at a level that could signal the existence of a material weakness but do not directly address specific risks — generally require the auditor to also test process-level controls. Examples of indirect ELCs include the internal audit function, the whistleblower hotline, the Code of Ethics, and control environment assessments.

The auditor evaluates the design of entity-level controls before concluding on their operating effectiveness. A well-designed ELC that is not actually operating in practice provides no audit evidence.

After evaluating ELCs, the auditor identifies significant processes and major classes of transactions, walks through each to understand the flow from initiation to recording in the general ledger, and identifies the controls within those processes that address the relevant assertions for significant accounts. The walkthrough is not merely a process documentation exercise — the auditor uses it to confirm their understanding and to test whether controls are designed effectively.`,
  },
  {
    id: 'PCAOB-AS2201-TESTING',
    category: 'PCAOB Standards',
    title: 'AS2201 Testing: Design Effectiveness vs. Operating Effectiveness',
    guidance: `AS2201 requires the auditor to evaluate both the design effectiveness and the operating effectiveness of controls selected for testing. These are distinct evaluations with different procedures, and a control that is well-designed but not operating effectively will not provide the auditor with sufficient evidence to conclude the control is effective.

Design effectiveness testing assesses whether the control, if operating as designed, would prevent or detect a material misstatement on a timely basis. The auditor evaluates design effectiveness primarily through inquiry, observation, and walkthrough procedures. A walkthrough involves the auditor tracing a transaction from origination through the recording process, inspecting documents and records, and observing the application of relevant controls at each step. Walkthroughs provide evidence about both design and, to a limited extent, operating effectiveness.

Operating effectiveness testing assesses whether the control has been operating as designed throughout the period under audit. The auditor determines the appropriate nature, timing, and extent of operating effectiveness testing based on the risk associated with the control and the intended period of reliance. For controls that address higher risks, the auditor obtains more persuasive evidence — larger sample sizes, more direct testing procedures (re-performance rather than inquiry), and testing that spans the entire period rather than just a point in time.

Timing of testing: Controls may be tested at an interim date and "rolled forward" to year-end if the auditor obtains sufficient additional evidence about the period between the interim date and year-end. Higher-risk controls typically require testing closer to year-end. Controls identified as key controls — those that address the highest risks and provide the most important evidence — generally should be tested as of year-end.

Evidence requirements: For automated controls (system-enforced controls), the auditor must test the ITGC environment to establish that automated controls function as programmed. For manual controls, the auditor inspects evidence of the control's operation — approver signatures, reviewer comments, documented exceptions investigated and resolved. Frequency of the control affects sample sizes: for a daily control, a larger sample is required than for a monthly control, because there are more instances of the control operating during the year.`,
  },
  {
    id: 'PCAOB-AS2201-DEFICIENCIES',
    category: 'PCAOB Standards',
    title: 'AS2201 Deficiency Classification: Control Deficiency, Significant Deficiency, and Material Weakness',
    guidance: `When the auditor identifies a control that is not designed effectively or is not operating effectively, the auditor must evaluate the severity of the deficiency. AS2201 establishes a three-tier severity classification: control deficiency, significant deficiency, and material weakness. The classification drives required communications and the auditor's opinion.

A control deficiency exists when the design or operation of a control does not allow management or employees, in the normal course of performing their assigned functions, to prevent or detect and correct misstatements on a timely basis. Control deficiencies that do not rise to the level of significant deficiency represent the lowest tier — they are reported to management but not required to be publicly disclosed.

A significant deficiency is a deficiency, or combination of deficiencies, in ICFR that is less severe than a material weakness yet important enough to merit attention by those responsible for oversight of the company's financial reporting — specifically, the audit committee. Significant deficiencies must be communicated in writing to the audit committee. They do not require disclosure in the annual report, but companies may voluntarily disclose them.

A material weakness is a deficiency, or combination of deficiencies, in ICFR such that there is a reasonable possibility that a material misstatement of the company's annual or interim financial statements will not be prevented or detected and corrected on a timely basis. A reasonable possibility means the likelihood of the event is more than remote — this is a lower threshold than "probable" or "likely." A material weakness requires: (1) disclosure in management's ICFR assessment and the auditor's attestation report; (2) an adverse opinion from the auditor on ICFR effectiveness; and (3) often heightened scrutiny from investors, analysts, and regulators.

Indicators of a material weakness include: identification of a material misstatement in the financial statements that was not caught by ICFR; restatement of previously issued financial statements; ineffective audit committee oversight of financial reporting; evidence of fraud by senior management; and material errors identified by the external auditor that were not caught by management's controls. The presence of one or more of these indicators creates a presumption of a material weakness that management and the auditor must carefully evaluate.`,
  },
  {
    id: 'PCAOB-AS2201-WALKTHROUGHS',
    category: 'PCAOB Standards',
    title: 'AS2201 Walkthroughs: Understanding and Confirming Controls in Each Significant Process',
    guidance: `AS2201 requires the auditor to perform walkthroughs for each major class of transactions in each significant process. A walkthrough is the process of tracing a transaction from its origination through the company's information systems to the point where it is reflected in the financial statements, while simultaneously testing the design and confirming the operation of controls.

The walkthrough involves four steps: (1) selecting one or a few transactions from each major class; (2) following the transaction through the entire process, from initiation (e.g., a customer order) through recording (e.g., a revenue journal entry in the general ledger); (3) at each step, inquiring of the personnel who perform the control, observing the performance of the control, and inspecting the documents and records related to the control; and (4) using the results to confirm the understanding of the flow of transactions and to identify controls that address the relevant assertions for significant accounts.

A walkthrough does more than document a process map — it tests, at a minimum, whether one instance of each control operated as designed. Evidence gathered during a walkthrough about operating effectiveness is limited, however, because only one or a few transactions are typically traced. The auditor relies on the walkthrough primarily for evidence about design effectiveness and to confirm understanding, and then performs additional operating effectiveness testing using larger samples.

For IT-dependent controls, the walkthrough includes understanding where in the system the control executes, which inputs it depends on, and what outputs or reports it generates. The auditor notes whether the control is fully automated (executed entirely by the system), partially automated (a system generates a report, and a human reviews and signs off), or manual with IT dependency (the human performs the control but uses IT data as an input). This classification affects which ITGCs must be tested to support reliance on the control.

Companies should facilitate walkthroughs by ensuring that control owners can articulate their controls clearly, that process documentation is current and accurate, and that evidence of controls is readily accessible. Inaccurate or incomplete process documentation that is corrected during a walkthrough is itself a potential indicator of a design effectiveness issue.`,
  },
  {
    id: 'PCAOB-AS2110',
    category: 'PCAOB Standards',
    title: 'PCAOB AS2110: Identifying and Assessing Risk of Material Misstatement',
    guidance: `PCAOB AS2110, "Identifying and Assessing Risks of Material Misstatement," establishes requirements for the auditor's risk identification and assessment process that drives both the financial statement audit and the ICFR audit. The standard requires the auditor to perform risk assessment procedures to obtain an understanding of the company and its environment, including internal control over financial reporting.

The risk assessment procedures required by AS2110 include: inquiries of management and others within the company; analytical procedures; observation and inspection; and discussion among engagement team members about the risks of material misstatement. These procedures are designed to identify events, conditions, and other factors that could give rise to a risk of material misstatement, whether due to error or fraud.

AS2110 requires the auditor to understand five categories of information about the company and its environment: (1) industry, regulatory, and other external factors, including the applicable financial reporting framework; (2) the nature of the company, including its operations, ownership and governance structures, investments, and financing activities; (3) the company's selection and application of accounting principles; (4) the company's objectives and strategies and related business risks that may result in material misstatement; and (5) the company's financial performance, including financial results compared to prior periods and industry peers.

For ICFR, the auditor's understanding of the company includes understanding the five COSO components and identifying entity-level controls. This understanding informs the auditor's top-down risk assessment: which accounts and disclosures are significant, which assertions are at higher risk, and which controls are key controls that require robust testing.

AS2110 also requires the auditor to assess fraud risk. Fraud risk assessment considers incentive and pressure on management to misstate financial results, opportunities to manipulate financial reporting (including weaknesses in controls), and attitudes and rationalizations that allow individuals to justify fraudulent behavior. The fraud risk assessment feeds directly into the ICFR audit — areas identified as high-fraud-risk require more robust controls and more extensive testing.`,
  },
  {
    id: 'ITGC-OVERVIEW',
    category: 'IT General Controls',
    title: 'IT General Controls: Overview and Why IT Controls Are Essential for Financial Reporting Integrity',
    guidance: `IT General Controls (ITGCs) are controls over the IT environment that support the reliable operation of application controls and the integrity of financial reporting data. Unlike application controls that are embedded within specific business processes (such as a three-way match in accounts payable), ITGCs operate across the entire IT environment and affect every automated control within that environment.

The fundamental relationship between ITGCs and automated controls is one of dependency: an automated control is only as reliable as the IT environment in which it operates. If ITGCs are deficient — if unauthorized individuals can modify programs, if access to production systems is not properly controlled, if changes to systems are not tested before deployment — then automated controls may not function as intended, and auditors cannot rely on them without performing compensating tests.

The four primary categories of ITGCs are: (1) Change Management, which governs how changes to programs, configurations, and data are authorized, tested, and deployed; (2) Logical Access, which controls who can access systems, applications, databases, and data, and what they can do once they have access; (3) Computer Operations, which covers the reliability and continuity of IT operations including job scheduling, backup and recovery, and incident management; and (4) Program Development, which covers the process of developing, acquiring, and implementing new applications and systems.

For SOX purposes, the relevance of ITGC testing depends on the degree to which automated controls and IT-dependent manual controls are relied upon to support significant financial reporting processes. If a company relies heavily on automated three-way matching in its ERP system as a key control over accounts payable, then the ITGCs governing that ERP system must be evaluated. A deficiency in those ITGCs (e.g., inadequate change management over the ERP) creates a risk that the automated match logic may have been modified without authorization, reducing the reliability of the automated control.

ITGCs should be evaluated for each "in-scope system" — every application, database, operating system, and infrastructure component that hosts or supports a key financial reporting control. The scope of ITGC testing is often broader than expected because financial data flows through multiple systems before reaching the general ledger.`,
  },
  {
    id: 'ITGC-CHANGE-MGMT',
    category: 'IT General Controls',
    title: 'Change Management Controls: Managing Authorized Changes to IT Systems',
    guidance: `Change Management ITGCs govern the process by which changes to applications, system software, databases, and infrastructure are proposed, authorized, tested, and deployed into the production environment. The objective is to ensure that only authorized, tested, and approved changes are made to production systems, and that unauthorized changes are detected and investigated.

A sound change management process includes the following stages. First, a formal change request is submitted for every proposed modification — whether it is a new report, a configuration change, a security patch, or a new module. The change request documents what is being changed, why, the estimated risk, and the requestor's name. Second, the change is reviewed and approved by individuals with appropriate authority — typically a change advisory board or approval chain that includes IT management and, for significant changes, business process owners. Third, the change is developed and tested in a non-production environment that mirrors production as closely as possible. Test cases should specifically test the change's effect on financial reporting processes. Fourth, the change is approved for migration to production by authorized individuals. The same individuals who developed the change should not be authorized to promote it to production without an independent review. Fifth, after deployment, the change is compared to the approved request to confirm it was implemented as authorized.

Emergency change procedures are necessary for situations where a critical issue requires an immediate fix. However, emergency changes create higher risk because they bypass normal testing and approval cycles. Emergency change controls should include: expedited but documented approval by an authorized individual; post-implementation testing to confirm the change performed as expected; and retroactive documentation and approval review after the emergency has been resolved. All emergency changes should be reviewed by management to ensure they were truly emergencies and not an attempt to bypass controls.

Segregation between development and production environments is a cornerstone of change management: developers should not have access to production systems, and system administrators who manage production should not have the ability to make unauthorized code changes. Monitoring reports should detect any instances where this segregation is violated.

Evidence for change management ITGC testing includes: the change request log for the period; samples of change requests with evidence of approval; test documentation; migration authorization records; emergency change logs with post-implementation reviews; and access control reports confirming segregation of duties between development and production roles.`,
  },
  {
    id: 'ITGC-LOGICAL-ACCESS',
    category: 'IT General Controls',
    title: 'Logical Access Controls: Managing Who Can Access Systems and What They Can Do',
    guidance: `Logical Access ITGCs control access to systems, applications, databases, and data. They ensure that only authorized users have access, that access is appropriate to job responsibilities, and that access is removed when no longer needed. Failures in logical access controls are among the most common ITGC deficiencies identified in SOX audits.

User provisioning is the process of creating and modifying user accounts and their access rights. The provisioning process should require business owner approval before access is granted — IT should not provision access based solely on a manager's verbal request or an email from a user. Provisioning requests should document the specific access level being requested, the business justification, and the approver's identity. Access rights should follow the principle of least privilege: users receive only the access necessary to perform their job functions.

User access reviews (also called access recertifications) are periodic — typically quarterly or semi-annual — reviews in which business owners confirm that current users' access rights are still appropriate. Access reviews are one of the most commonly tested SOX controls and one of the most commonly deficient. Common deficiencies include reviews not completed on time, reviews not performed at a sufficiently granular level to detect inappropriate access, and access not removed promptly after the review identifies it as inappropriate.

Privileged access management addresses the elevated risk posed by privileged accounts — system administrators, database administrators, and others who can read, modify, or delete any data in the system. Privileged accounts should be subject to stricter controls: individual accountability (no shared admin accounts), two-person authorization for high-risk actions, enhanced logging of all privileged activity, and more frequent access reviews. Privileged access management (PAM) tools can provide additional controls such as session recording and just-in-time access provisioning.

Terminated user access removal is a high-risk area. When an employee leaves the company, access should be removed promptly — ideally on the termination date. Late removal of terminated user access is a frequent SOX finding. Controls should include: HR notifying IT of terminations immediately; an automated workflow (or a disciplined manual process) that disables accounts within one business day of termination; and a monthly reconciliation confirming that no terminated users have active access.

Password policies and MFA: password policies should require minimum length, complexity, expiration, and prevention of password reuse. Multi-factor authentication (MFA) should be required for all remote access and for access to sensitive financial systems, given the elevated risk of credential theft. The absence of MFA on systems hosting financial reporting data is increasingly viewed by auditors as a significant control gap.`,
  },
  {
    id: 'ITGC-COMPUTER-OPS',
    category: 'IT General Controls',
    title: 'Computer Operations Controls: Ensuring Reliable and Continuous IT Operations',
    guidance: `Computer Operations ITGCs cover the day-to-day management of IT infrastructure and the processes that ensure financial data is processed reliably, completely, and continuously. These controls are particularly relevant for financial reporting because incomplete or erroneous batch processing, failed data feeds, or inadequate backup procedures can result in material misstatements.

Job scheduling and batch processing monitoring: many financial processes run as scheduled batch jobs — nightly general ledger postings, monthly depreciation runs, quarterly intercompany eliminations. Controls should ensure that all required jobs are scheduled, execute on time, complete successfully, and are monitored for errors. Job monitoring tools generate exception reports when jobs fail or produce unexpected results. These exception reports should be reviewed daily by operations personnel, and failures should be investigated, resolved, and documented before the financial reporting process proceeds.

Incident management: an incident is any unplanned interruption or degradation in IT service. An effective incident management process ensures that incidents are detected, classified by severity, escalated to appropriate personnel, resolved, and documented. For SOX purposes, incidents that affect financial reporting systems or data should be escalated to the finance team and tracked to ensure the integrity of financial data has not been compromised. Post-incident reviews for significant incidents should confirm that financial reporting data was not affected or identify the impact and required corrections.

Backup and recovery: financial data must be backed up regularly and the backups must be tested to confirm they can be restored. Backup controls should specify: what data is backed up (full vs. incremental); how frequently (daily, weekly, monthly); where backups are stored (offsite, cloud); and how long they are retained. Recovery controls should be tested at least annually through a formal disaster recovery test that demonstrates the ability to restore systems to a functional state within a defined recovery time objective (RTO). An untested backup provides no assurance — organizations should document test results, including any issues identified and how they were resolved.

Data center physical security: access to data centers and server rooms should be restricted to authorized personnel using physical access controls (badge readers, biometric scanners). Physical access logs should be reviewed periodically, and visitors should be escorted by authorized personnel. Physical security failures — unauthorized individuals accessing servers — could allow unauthorized modification of data or programs, undermining all logical access controls.`,
  },
  {
    id: 'ITGC-PROGRAM-DEV',
    category: 'IT General Controls',
    title: 'Program Development Controls: Governance Over Development and Implementation of New Systems',
    guidance: `Program Development ITGCs govern the process of developing, acquiring, customizing, and implementing new applications and systems. Unlike Change Management (which addresses modifications to existing systems), Program Development controls address the higher-complexity risk of introducing entirely new capabilities into the IT environment.

A formal Systems Development Life Cycle (SDLC) methodology should govern all significant program development projects. The SDLC should include defined phases — requirements definition, design, development, testing, user acceptance testing (UAT), and implementation — with approval gates between phases. Business process owners and financial reporting stakeholders should be involved in requirements definition to ensure that new systems will support the control objectives of financial reporting.

Testing requirements are critical for financial reporting systems. Before a new system or major enhancement goes live, it should be tested in a non-production environment that replicates production data (with sensitive data appropriately masked). Testing should include functional testing (does the system do what it's supposed to do), interface testing (do data transfers between the new system and other systems work correctly), control testing (do the embedded application controls work as designed), and regression testing (does the new system disrupt existing functionality). UAT should be performed by business process owners, not IT personnel, to confirm that the system meets business requirements.

Project governance: significant development projects should be subject to formal project governance, including a project steering committee with executive sponsorship, regular status reporting against milestones and budget, and formal go/no-go decisions at key gates. Projects that miss milestones or exceed budget may indicate insufficient resources or planning — which can lead to shortcuts in testing or control design that create post-implementation issues.

Vendor management for IT projects: when a vendor is developing or implementing a system on behalf of the company, vendor oversight controls are essential. These include: contract terms that specify testing requirements, documentation deliverables, and the right to audit; regular status meetings with vendor project managers; review and approval of vendor deliverables before they are deployed; and confirmation that vendor personnel with access to financial systems are subject to appropriate background checks and access controls. The company remains responsible for ICFR effectiveness even when an external vendor develops or hosts the system.`,
  },
  {
    id: 'ITGC-DBA',
    category: 'IT General Controls',
    title: 'Database Administration Controls: Privileged Access and Change Management for Databases',
    guidance: `Database Administration (DBA) ITGCs address the unique risks posed by the database layer of financial reporting systems. Databases store the underlying financial data — general ledger entries, subledger details, master data — and individuals with DBA-level access can read, modify, insert, or delete data directly, bypassing application-level controls. DBA access is therefore one of the highest-risk access types in the SOX ITGC environment.

DBA privileged access should be strictly limited to personnel who require it for system administration and support functions. Business users, developers, and application support personnel should not have DBA access to production databases. Even within the DBA team, access should be role-based: a DBA responsible for performance tuning may not need the same level of access as a DBA responsible for data recovery. Just-in-time access provisioning — where DBAs request elevated access for specific tasks and the access is automatically revoked after a defined period — is an emerging best practice that reduces the window of risk.

Database change management is a subset of the broader change management ITGC but deserves separate attention because database changes (schema changes, stored procedure modifications, direct data manipulation) can have immediate, hard-to-detect impacts on financial reporting. Schema changes should follow the same change management process as application changes: change request, approval, testing in a non-production environment, and authorized migration to production. Direct data manipulation (DML — insert, update, delete commands executed directly against production tables) should require heightened approval, including business owner and finance sign-off, because such changes can alter financial balances without leaving an application-level audit trail.

Audit logging of DBA activity is a detective control that compensates for the inherent risk of DBA access. Database audit logs should capture all DML activity in financial tables, all DDL activity (schema changes), all failed login attempts, and access by privileged accounts. Logs should be stored in a location that DBAs cannot modify or delete. Regularly — at minimum monthly — a security or internal audit function should review DBA activity logs for unauthorized or anomalous activity and investigate any exceptions. Evidence of this review (the log extract, the reviewer's sign-off, any exceptions and their resolution) should be retained as SOX evidence.`,
  },
  {
    id: 'ITAC-OVERVIEW',
    category: 'IT Application Controls',
    title: 'IT Application Controls: Overview of Input, Processing, and Output Controls',
    guidance: `IT Application Controls (ITACs) are controls embedded within specific business applications that help ensure the completeness, accuracy, validity, and authorization of transactions processed by those applications. Unlike ITGCs, which provide a broad foundation for the reliability of the IT environment, ITACs are specific to a particular application and a particular business process.

The traditional taxonomy of application controls is: input controls (ensuring data entered into a system is complete, accurate, and valid), processing controls (ensuring the system processes transactions correctly), and output controls (ensuring the output of the system is complete, accurate, and appropriately distributed). In practice, these categories overlap — a validation rule is both an input control (it prevents bad data from being entered) and a processing control (it ensures only valid data is processed).

Automated controls are particularly valuable from a SOX perspective because, once a system is confirmed to execute the control correctly and the ITGCs supporting that system are effective, the auditor can rely on the control with minimal ongoing sampling. The key phrase is "once confirmed" — the first-year evaluation requires testing the control's design and confirming the ITGCs are in place. In subsequent years, the auditor may be able to rely on prior-year testing with only incremental verification, reducing the cost of the SOX program over time.

Manual controls with IT dependencies occupy a middle ground. A common example is a management review control in which a finance manager reviews a system-generated exception report and investigates any items exceeding a threshold. The review is manual, but it depends on the completeness and accuracy of the system-generated report. To rely on this control, both the accuracy of the report (an ITAC/ITGC matter) and the quality of the manager's review (a manual control effectiveness matter) must be established.

When documenting ITACs, each control should identify: the application name and version; the specific control function (e.g., a required field validation, a system-enforced approval workflow, an automated matching algorithm); the business process and financial reporting assertion it addresses; and the ITGCs it relies upon. This documentation chain is essential for auditors to understand and test the full reliance model.`,
  },
  {
    id: 'ITAC-AUTOMATED-VS-MANUAL',
    category: 'IT Application Controls',
    title: 'Automated Controls vs. Manual Controls with IT Dependencies',
    guidance: `The distinction between fully automated controls, manual controls with IT dependencies, and fully manual controls is important for SOX planning because it determines the testing approach and the degree of ITGC reliance required.

A fully automated control executes entirely within the system without human intervention. Examples include: a system that prevents a purchase order from being created unless it is below the user's approval authority limit (a system-enforced authorization control); an ERP module that automatically calculates depreciation based on asset records (a processing accuracy control); or an interface that automatically reconciles the subledger to the general ledger and flags variances exceeding a threshold (a completeness and accuracy control). For fully automated controls, the auditor must test the control logic (confirm the system performs the intended function) and must test the ITGCs supporting the system. If both are confirmed, the control can be relied upon with limited ongoing sampling.

A manual control with IT dependency involves a human performing a review or approval, but the control depends on information generated by the system. The finance manager who reviews an automated exception report, the Controller who compares system-generated account balances to budget, or the AP manager who reviews a payment run report before approving it — these are all manual controls with IT dependency. Testing these controls requires: (1) confirming the accuracy and completeness of the system-generated input (ITAC testing); (2) testing the ITGC environment to establish the reliability of the system; and (3) testing the manual component — evaluating whether the review was performed, whether exceptions were investigated, and whether the control is sufficiently precise to detect a material misstatement.

A fully manual control — such as a supervisor physically counting inventory or a manager reviewing a hand-prepared reconciliation without using any system data — relies only on human performance. These controls require direct operating effectiveness testing (sampling) without the need to evaluate ITGCs, but they generally provide less assurance per unit of testing cost because human error rates are higher and consistency is harder to verify. Replacing manual controls with automated controls is one of the primary strategies for reducing SOX compliance costs over time.`,
  },
  {
    id: 'ITAC-COMPLETENESS',
    category: 'IT Application Controls',
    title: 'Completeness Controls: Ensuring All Transactions Are Captured',
    guidance: `Completeness controls address the financial statement assertion that all transactions and events that should have been recorded have been recorded. Completeness failures result in understatement of assets, revenues, or expenses — risks that are particularly relevant for revenue recognition (omitted sales), inventory (unrecorded receipts), and liabilities (unrecorded payables or accruals).

Automated completeness controls in application systems include: sequence checking, which verifies that document numbers are used in sequence without gaps (a missing number triggers an alert indicating a transaction may not have been recorded); hash totals and control totals, which aggregate a batch of transactions at input and compare the total to the output total to confirm no transactions were lost during processing; and interface reconciliations, which compare the count and total value of transactions sent from a source system to those received by a target system.

Manual completeness controls supplement automated controls and include: comparing the count of physical documents (invoices received, shipments made) to the count of transactions recorded in the system; reconciling subledger totals to the general ledger to confirm all detail transactions are captured in the summary; and performing cutoff procedures to confirm that transactions are recorded in the correct accounting period.

For period-end financial reporting, completeness is addressed through accrual controls — reviewing open purchase orders, outstanding goods received but not yet invoiced (GR/NI accruals), and unbilled receivables to ensure all earned revenue and incurred expenses are recorded in the correct period. These controls typically involve reviewing system-generated reports of transactions initiated before period-end but not yet fully processed, and making appropriate journal entries to capture the financial effect.

Testing completeness controls: for automated controls (sequence checking, hash totals), the auditor confirms the system logic and then relies on ITGC testing; for manual controls, the auditor inspects evidence that the reconciliation or comparison was performed, signed off, and that exceptions were investigated and resolved.`,
  },
  {
    id: 'ITAC-ACCURACY',
    category: 'IT Application Controls',
    title: 'Accuracy Controls: Ensuring Transactions Are Processed Correctly',
    guidance: `Accuracy controls address the financial statement assertion that amounts and other data related to recorded transactions and events have been recorded appropriately. Accuracy failures result in transactions being recorded at the wrong amount, in the wrong account, in the wrong currency, or with incorrect tax treatment.

Automated accuracy controls include: field validation rules that verify data entered meets required formats (e.g., a date field must contain a valid date, a currency amount must be a positive number); system-calculated fields that ensure derived values are computed correctly (e.g., the system calculates line-item totals as quantity times unit price, preventing manual errors); automated tax calculation engines that apply the correct tax rate based on the transaction's location, product type, and customer type; and currency conversion controls that apply the correct exchange rate from a centralized rate table rather than allowing users to enter rates manually.

Management review controls are a critically important category of accuracy controls for financial reporting. Period-end reviews in which senior finance personnel compare account balances to budget, prior period, and analytical expectations are designed to detect material inaccuracies in the aggregate. For these controls to be effective as a SOX control, the review must be sufficiently precise — the reviewer must be using specific thresholds (not just general impressions), investigating exceptions, and documenting the investigation and conclusion. A management review that is "high level" and could not realistically detect a misstatement of a specific dollar amount does not constitute an effective control.

Journal entry controls address accuracy at the transaction level. Controls should require that journal entries include a detailed description of purpose, attach supporting documentation, be reviewed and approved by someone other than the preparer, and be posted only during authorized posting periods. Automated controls should prevent posting to closed accounting periods and flag unusual journal entries — round dollar amounts, entries to unusual accounts, entries posted at unusual times — for management review.

Reconciliation controls verify accuracy by comparing two independent sources and investigating differences. Bank reconciliations, subledger-to-GL reconciliations, and intercompany reconciliations are all accuracy controls. The effectiveness of a reconciliation as a SOX control depends on its precision: the reconciliation must be performed on a timely basis, differences must be investigated and resolved, and the completed reconciliation must be reviewed and approved by a supervisor.`,
  },
  {
    id: 'ITAC-VALIDITY',
    category: 'IT Application Controls',
    title: 'Validity Controls: Ensuring Only Authorized Transactions Are Processed',
    guidance: `Validity controls address the financial statement assertion that recorded transactions and events have occurred and pertain to the entity. They prevent the recording of fictitious, duplicate, or unauthorized transactions. Validity failures result in overstatement of revenues, assets, or expenses through the recording of transactions that should not have occurred.

Automated validity controls include: approval workflow systems that require electronic sign-off from an authorized user before a transaction can be posted or a payment can be made; system-enforced authorization limits that prevent a user from approving transactions above a dollar threshold defined in their user profile; duplicate detection controls that flag transactions with the same vendor, amount, invoice number, or other combination that suggests a duplicate payment; and master data validation that requires transactions to reference valid, active master data records (e.g., a purchase order must reference an active, approved vendor from the vendor master file).

Authorization matrix controls define which users have authority to initiate, approve, or post different types of transactions. In a financial system, the authorization matrix is typically configured at the user-profile level — each user's profile specifies their approval authority. The authorization matrix should be reviewed periodically to confirm it reflects current organizational authority levels and job responsibilities, and it should be updated promptly when roles change.

Vendor master file controls are a specific validity control area. Fraudulent transactions are frequently routed through fictitious vendors added to the vendor master file. Controls should require dual approval for the creation of new vendors or changes to existing vendor banking information, with verification of the vendor's identity (tax ID confirmation, banking detail verification) before the changes are activated. Periodic review of the vendor master file — including comparison to employee records to detect employee-vendor relationships and review of vendors with no recent activity — supports ongoing validity of vendor records.

Validity testing by auditors includes: selecting a sample of recorded transactions and tracing them to source documents (e.g., customer orders, vendor invoices) that evidence the transaction actually occurred; testing the authorization workflow by confirming that system-enforced controls prevent unauthorized transactions from posting; and performing analytical procedures to identify unusual patterns in transaction data that could indicate fictitious transactions.`,
  },
  {
    id: 'ITAC-INTERFACE',
    category: 'IT Application Controls',
    title: 'Interface Controls: Managing Data Transfer Between Systems',
    guidance: `Interface controls govern the transfer of data between systems and ensure that data is transmitted completely, accurately, and in a timely manner. In a typical large enterprise, financial data flows through numerous interfaces: from operational systems (order management, inventory, HR) to the ERP general ledger; between the ERP and financial reporting tools; between subsidiary ledgers and the consolidation system; and between the company's systems and external parties (banks, tax authorities, EDI trading partners).

The primary risks addressed by interface controls are: incomplete transmission (some records are not transferred), inaccurate transmission (records are altered during transmission), duplicate transmission (the same record is sent more than once), and untimely transmission (records are sent outside the expected window, causing cutoff errors).

Automated interface controls include: record count reconciliation, which compares the number of records sent by the source system to the number received by the target system; hash total reconciliation, which compares the sum of a key field (e.g., transaction amount) in the source transmission to the corresponding sum in the target, to detect records that were altered during transmission; and sequence number validation, which checks that sequential transaction identifiers in the receiving system match expectations from the source, to detect missing records.

Error handling and exception management are critical components of interface control. When an interface fails — transmission error, data validation rejection, record count mismatch — the error should be logged, an alert should be sent to the appropriate operations personnel, and the error should be resolved before the financial process that depends on the interface data proceeds. Errors that are silently ignored or that result in transactions being dropped can cause material understatement of financial results.

Interface control documentation should include: a data flow diagram showing all interfaces in scope for financial reporting; for each interface, the source system, target system, frequency, data elements transferred, and the controls governing the transfer; and the reconciliation reports and error logs that provide evidence of the control's operation. Auditors test interface controls by examining reconciliation reports, tracing selected transactions through the interface, and confirming that error logs were reviewed and exceptions were resolved.`,
  },
  {
    id: 'ITAC-SOD',
    category: 'IT Application Controls',
    title: 'Segregation of Duties in Application Systems: Conflicting Access and Compensating Controls',
    guidance: `Segregation of duties (SOD) in application systems prevents any single user from having the ability to both initiate and complete a financial transaction without independent oversight — a combination that would allow that user to commit and conceal fraud or errors. In a financial application, SOD is implemented through the access control system: users are assigned roles or permissions that are configured to prevent incompatible combinations.

Classic SOD conflicts in financial systems include: the ability to create a vendor master record and the ability to process a payment to that vendor (together, these permissions allow a user to add a fictitious vendor and pay them); the ability to enter journal entries and the ability to post or approve those entries; the ability to modify the payroll master (adding a ghost employee or changing a pay rate) and the ability to process the payroll run; and access to both the ordering function and the receiving function in a purchasing system (allowing a user to order fictitious goods, receive them in the system, and generate a payable to a fraudulent vendor).

An SOD conflict matrix identifies which combinations of permissions are incompatible. The matrix should be defined by the business process owners and finance leadership, based on the financial reporting risks in each process. The IT team then configures the application to prevent users from holding incompatible permission combinations — or, where that is not technically feasible, to flag and report users who hold conflicting access.

Compensating controls are required when true SOD cannot be achieved — typically in small departments where there are not enough personnel to fully segregate duties. A compensating control does not eliminate the SOD risk but provides an alternative mechanism to mitigate it. Examples include: detailed management review of all transactions in the affected process (the manager reviews every journal entry posted by the sole journal entry preparer); independent bank reconciliations performed by someone other than the person who processes payments; and enhanced monitoring through automated transaction log reviews that detect unusual activity. Compensating controls must be sufficiently precise and timely to be effective — a quarterly review cannot compensate for daily SOD conflicts in a high-volume process.

Periodic SOD access reviews (typically quarterly) should pull a user access report from the system, compare each user's access to the SOD conflict matrix, identify any users holding conflicting access, and require the business owner to confirm whether the access is still necessary and whether a compensating control is in place.`,
  },
  {
    id: 'PROC-FINANCIAL-CLOSE',
    category: 'Key Process Controls',
    title: 'Financial Close Process Controls: Period-End Close, Journal Entry, and Account Reconciliations',
    guidance: `The financial close process is the sequence of activities through which a company produces its financial statements at the end of an accounting period. Because the close process produces the financial statements that are subject to SOX certification, it is typically the single highest-risk area in the SOX control environment and requires the most comprehensive set of controls.

Period-end close procedures: a formal close calendar should specify all required activities, their deadlines, and the responsible owners. The calendar should be approved by the Controller or CFO and distributed to all close process participants. Close activities include: posting all sub-ledger transactions (AP, AR, payroll, fixed assets) to the general ledger; recording accruals for expenses incurred but not yet invoiced; performing and reviewing account reconciliations; posting consolidation entries (eliminations, currency translations); and generating draft financial statements for management review. Each activity should have a sign-off mechanism — an electronic approval or a physical sign-off sheet — that creates an audit trail confirming the activity was completed on time and by an authorized person.

Journal entry controls are among the most scrutinized SOX controls because management override of controls most frequently occurs through journal entries. PCAOB standards require that the external auditor evaluate the risk of management override, and journal entry testing is a standard procedure in every SOX audit. Controls should include: a requirement that all journal entries include a detailed description and attach supporting documentation; a workflow requiring approval of journal entries by someone other than the preparer (segregation of duties); system controls preventing posting to closed periods; a report of all journal entries posted that is reviewed by the Controller or CFO; and automated monitoring for unusual journal entries (round dollar amounts, entries to unusual accounts, entries posted late in the period or after the close, recurring entries with changing amounts).

Account reconciliations: every balance sheet account should be reconciled at least monthly. A reconciliation confirms the accuracy of the ending balance by tracing it to a supporting schedule, sub-ledger, or external document. Controls over reconciliations include: standardized reconciliation templates that document the balance per the general ledger, the balance per the supporting detail, any reconciling items with explanations, and the preparer's sign-off; a review and approval by a supervisor who did not prepare the reconciliation; and a tracking system that monitors which reconciliations are complete, overdue, or have open items.`,
  },
  {
    id: 'PROC-REVENUE',
    category: 'Key Process Controls',
    title: 'Revenue Recognition Controls: Criteria, Cut-off, and Contract Review',
    guidance: `Revenue recognition is consistently one of the highest-risk financial reporting areas for SOX purposes because of the complexity of recognition criteria (especially under ASC 606), the frequency with which management exercises judgment, and the high susceptibility to manipulation given the pressure on companies to meet revenue targets.

Revenue recognition criteria under ASC 606 require companies to recognize revenue when — or as — performance obligations are satisfied. For companies with multi-element arrangements, long-term contracts, variable consideration, or complex contract terms, management must exercise significant judgment. Controls should ensure that the recognition criteria are applied consistently and in accordance with the company's accounting policy. Key controls include: a contract review process in which all non-standard contracts are reviewed by the Controller or revenue accounting team before they are signed, to identify terms that could affect revenue recognition (contingencies, extended payment terms, right of return); a revenue recognition policy that is updated regularly and communicated to sales and finance teams; and a quarterly management review of the revenue recognition checklist for all significant or unusual arrangements.

Cut-off controls address the risk that revenue is recognized in the wrong accounting period. The most common cut-off error is recognizing revenue in the current period for shipments or deliveries that occurred after period-end (early recognition) or in a future period for deliveries that occurred before period-end (late recognition). Cut-off controls include: a shipping report run as of midnight on the last day of the period, reviewed by the billing team to ensure all shipped goods are invoiced in the correct period; a policy requiring that revenue be recognized based on documented delivery confirmation (e.g., signed delivery receipt, system confirmation of electronic delivery); and a comparison of the last few days of revenue before period-end to the same period in prior years and to budget, to identify unusual spikes that could indicate pull-forward of revenue.

Contract review controls: significant contracts — those above a defined dollar threshold or with non-standard terms — should require review by technical accounting personnel before the revenue recognition method is determined. Documentation of the accounting conclusion, including the specific contract terms reviewed and the applicable guidance under ASC 606, should be maintained as evidence. The revenue recognition policy should define what constitutes a non-standard contract and specify the required review and approval process.`,
  },
  {
    id: 'PROC-AP',
    category: 'Key Process Controls',
    title: 'Accounts Payable and Purchasing Controls: Three-Way Match, Approvals, and Vendor Master',
    guidance: `The accounts payable and purchasing process is a high-risk area for fraud (fictitious vendors, duplicate payments, unauthorized purchases) and for misstatement (unrecorded liabilities, improper accruals). A well-controlled AP and purchasing process combines preventive controls (authorization workflows, matching) with detective controls (reconciliations, management reviews).

The three-way match is the foundational AP control. Before a vendor invoice is approved for payment, the system or the AP team matches three documents: the purchase order (what was authorized to be purchased and at what price), the receiving report or goods receipt (confirmation that the goods or services were actually received), and the vendor invoice (the vendor's request for payment showing what was billed). An invoice can only be paid if all three documents agree within defined tolerance thresholds. Exceptions — invoices with no matching PO, invoices where the billed amount exceeds the PO price by more than the tolerance, invoices where the quantity billed exceeds the received quantity — should be flagged and reviewed by an authorized manager before payment.

Approval authorities in purchasing: purchase orders above defined thresholds should require approval by progressively senior managers. An approval authority matrix (sometimes called a delegation of authority matrix) defines the specific dollar ranges and types of expenditures that each level of management can approve. The approval authority matrix should be formally documented, approved by the CFO or CEO, incorporated into the financial system's approval workflow, and reviewed annually to confirm it reflects current organizational authorities.

Vendor master maintenance: the vendor master file controls who can receive payments. Controls should require dual approval for creating a new vendor or modifying an existing vendor's banking details; verification of the vendor's tax identification number (for IRS reporting and fraud prevention); a periodic review of all vendors to identify inactive vendors (for deactivation), duplicate vendors (to prevent duplicate payments), and vendors whose addresses or banking details match employee records (a fraud indicator); and logging of all changes to the vendor master with the identity of the changer and approver.

Payment run controls: before a payment run is released, an authorized AP manager should review and approve the payment file, which should include a summary of total payments by vendor, the payment method (check, ACH, wire), and any unusual items flagged by the payment system. The payment run approval should be documented — a signed payment run report or electronic approval — and retained as SOX evidence.`,
  },
  {
    id: 'PROC-PAYROLL',
    category: 'Key Process Controls',
    title: 'Payroll Controls: Employee Master Data, Time and Attendance, and Payroll Review',
    guidance: `Payroll is a high-risk financial reporting area because it often represents a company's largest expense, is susceptible to fraud through fictitious employees (ghost employees) and unauthorized rate changes, and involves sensitive personal data. Payroll controls must address the entire payroll cycle from employee onboarding through payment.

Employee master data controls govern additions, changes, and terminations in the HR or payroll system. The employee master contains the information that drives pay calculations: employee name, position, pay rate, benefits elections, bank account for direct deposit, and tax withholding. Controls should include: dual approval for all new hire additions (the manager and HR must both approve before an employee is added to the payroll system); mandatory review of any changes to pay rates or direct deposit banking information by someone other than the requester; segregation of duties between HR (who maintains employee data) and payroll processing (who runs the payroll calculation); and a process to promptly deactivate terminated employees in the payroll system on their final day.

Ghost employee detection: periodic reconciliation of the payroll roster to active HR records identifies employees who are in the payroll system but not in the HR system, which is a red flag for a ghost employee. This reconciliation should be performed at least quarterly by someone independent of both the HR and payroll functions. Analytical procedures comparing headcount and total payroll cost to budget and prior period can also detect unusual changes.

Time and attendance controls: for hourly employees, the time recording system should require employees to record their own time (not have supervisors record on their behalf), supervisors to approve employee time records, and the system to flag time records that seem unusual (hours exceeding normal workday, overtime without authorization, time entered for a date when the employee was on leave). Time records that feed payroll calculations should be subject to edit checks — hours cannot exceed 24 per day, and pay rates must be within an authorized range.

Payroll calculation review: before payroll is finalized and payments are released, an authorized manager (typically the Payroll Manager or Controller) should review the payroll register for the period, comparing total payroll cost to budget and prior period, reviewing the list of new employees, terminated employees, and employees with pay changes, and investigating any anomalies. This review control should produce documented evidence — the reviewer's sign-off on a summary report with comments noting any exceptions investigated and resolved.`,
  },
  {
    id: 'PROC-FINANCIAL-REPORTING',
    category: 'Key Process Controls',
    title: 'Financial Reporting Controls: Disclosure Committee, Management Review, and Consolidation',
    guidance: `Financial reporting controls are the final layer of review before financial statements and disclosures are filed with the SEC. They are the controls through which management satisfies itself — and certifies — that the financial statements fairly present the company's financial condition and results of operations.

The disclosure committee is a key entity-level control for financial reporting. The disclosure committee is a cross-functional group — typically including the CFO, Controller, General Counsel, Chief Accounting Officer, and heads of business units — that is responsible for reviewing all information that must be disclosed in SEC filings. The disclosure committee should meet before each quarterly and annual filing, review draft financial statements and MD&A, consider whether any material events require disclosure, and document its proceedings in formal minutes. The committee charter should define its membership, responsibilities, meeting cadence, and reporting obligations to the CEO and CFO (who sign the certifications).

Management review controls at the financial statement level include: CFO and Controller review of draft financial statements for completeness, accuracy, and consistency with prior periods and budget; analytical review procedures in which finance personnel compare key metrics (revenue per transaction, gross margin percentage, operating expense ratios) to budget, prior period, and industry benchmarks; and a tie-out process in which every number in the financial statements is traced to a supporting schedule and verified for mathematical accuracy. These controls are designed to provide the CFO with the evidence base needed to sign the Section 302 and 906 certifications with confidence.

Consolidation controls address the risk of error in aggregating results from multiple subsidiaries, eliminating intercompany transactions, and translating foreign currency financials. Key controls include: a consolidation checklist requiring that all subsidiaries have submitted their local financial packages before consolidation is run; automated intercompany elimination controls in the consolidation system, with a reconciliation confirming that all intercompany balances have been eliminated; currency translation controls that apply current exchange rates from a centralized rate table rather than allowing manual rate entry; and a review of the consolidated trial balance by a senior accountant to confirm that all expected entities are included and no unexpected amounts appear.

Evidence retention: all financial reporting controls should produce evidence — signed reports, email approvals, meeting minutes, reconciliation workpapers — that is retained for at least seven years, consistent with Section 802 retention requirements. Electronic retention in a document management system with version control and access restrictions is preferred over paper files.`,
  },
  {
    id: 'SOC1-TYPE',
    category: 'SOC Reports',
    title: 'SOC 1 Type I vs. Type II: Coverage, Differences, and When Each Is Required for SOX',
    guidance: `System and Organization Controls (SOC) 1 reports, issued under SSAE 18 (AT-C Section 320), provide an independent auditor's opinion on the controls at a service organization that are relevant to user entities' internal control over financial reporting. Companies that outsource significant financial reporting processes to service organizations — payroll processors, loan servicers, transfer agents, cloud-based ERP hosting — must obtain and evaluate the SOC 1 reports of those service organizations as part of their SOX compliance.

SOC 1 Type I reports describe the service organization's system and controls as of a specific point in time (typically the end of the service organization's fiscal year), and provide an auditor's opinion on whether the description fairly presents the system and whether the controls are suitably designed to achieve the specified control objectives. A Type I report provides limited assurance — it confirms that the controls were designed appropriately at a point in time, but provides no assurance that they actually operated throughout the period.

SOC 1 Type II reports cover a period of time (typically six months or one year) and provide the auditor's opinion on both the design and operating effectiveness of the controls. The auditor tests the controls throughout the period and reports on whether they operated effectively. For SOX purposes, a Type II report is substantially more useful than a Type I because it provides evidence that the controls actually worked during the period that the user entity is relying on them.

For SOX reliance, user entities (the companies receiving the service) need Type II reports covering the period of financial reporting being audited. If a payroll processor provides a SOC 1 Type II report covering January through June, and the company's fiscal year ends December 31, the company must either obtain an updated report covering the full year or perform additional procedures (called "bridge procedures" or "gap procedures") to cover the period from July through December.

When evaluating a SOC 1 report, the user entity should review: the description of the service organization's system; whether the control objectives are relevant to the user entity's financial reporting; the auditor's opinion (is it qualified?); the detail of testing — the auditor's procedures, sample sizes, and results; any control exceptions noted and the service organization's response; and the complementary user entity controls (CUECs) that the service organization assumes the user entity is performing.`,
  },
  {
    id: 'SOC2-RELEVANCE',
    category: 'SOC Reports',
    title: 'SOC 2 Relevance to SOX: Trust Services Criteria and Complementary Controls',
    guidance: `SOC 2 reports are issued under AT-C Section 205 and address controls relevant to the Trust Services Criteria (TSC): Security, Availability, Processing Integrity, Confidentiality, and Privacy. Unlike SOC 1 reports, which focus specifically on controls relevant to user entities' ICFR, SOC 2 reports address the broader service and system reliability of the service organization.

For SOX purposes, SOC 2 reports are most relevant when a company uses a cloud service provider or technology platform for financial reporting systems. While a SOC 2 report does not address ICFR directly, the Security and Availability criteria of a SOC 2 report cover controls that are analogous to ITGCs: logical access controls, change management, computer operations, data backup, and incident management. If a company's ERP system is hosted by a cloud provider, the provider's SOC 2 Type II report may provide evidence supporting the ITGC layer of the ICFR control environment.

However, companies cannot simply substitute a SOC 2 report for an SOC 1 report. The SOC 2 is not designed to address financial reporting risks specifically, and a SOC 2 audit may not evaluate controls at the level of granularity required for SOX purposes. External auditors will evaluate whether a SOC 2 report is sufficient to support ICFR reliance or whether a SOC 1 (or direct testing by the user entity's auditor) is required.

Complementary User Entity Controls (CUECs) are controls that the SOC 2 service organization assumes the user entity will have in place. For example, a cloud HR/payroll provider may assume that the user entity reviews and approves all changes to employee records in the system and that the user entity performs regular reconciliations of payroll expense. CUECs identified in a vendor's SOC report must be mapped to controls in the user entity's own SOX control framework to confirm they are actually operating. CUECs that have no corresponding user entity control represent a gap that must be addressed.

Best practice for managing SOC reports: designate a control owner responsible for obtaining SOC reports annually, reviewing them for qualifications and exceptions, mapping CUECs to in-scope user entity controls, and communicating any issues to the SOX team and external auditors. Maintain a service organization inventory that tracks which vendors have SOC reports, what type they are, and when they expire.`,
  },
  {
    id: 'SOC-EVALUATION',
    category: 'SOC Reports',
    title: 'Evaluating a Service Organization SOC Report for SOX Control Reliance',
    guidance: `When a company relies on a service organization for a financial reporting process, it must evaluate the service organization's SOC report as part of its SOX program. The evaluation involves several steps that go beyond merely obtaining the report and filing it away.

Step 1: Determine relevance. First, confirm that the SOC report covers the specific services being provided to the company and the specific controls that are relevant to the company's financial reporting. A payroll processor may have an SOC 1 that covers payroll processing but not benefits administration — if the company also uses the provider for benefits administration that affects financial reporting accruals, the SOC 1 may not fully cover the scope of reliance.

Step 2: Evaluate the report's coverage period. Confirm that the SOC 1 Type II report covers the period being audited. If there is a gap (the SOC period ends before the user entity's fiscal year), obtain and evaluate the service organization's bridge letter or perform independent gap procedures.

Step 3: Evaluate the auditor's opinion. A qualified or adverse opinion on the SOC report is a significant red flag. Read the basis for any qualification. Understand what control objectives were not met and evaluate whether those gaps affect the company's financial reporting.

Step 4: Review the tests of controls and results. The body of a SOC 1 report includes a detailed section listing each control, the auditor's test procedure, the sample size, and any exceptions noted. Read this section carefully. Exceptions — instances in which the auditor's tests found that a control did not operate effectively — must be evaluated for their impact on the user entity. Not all exceptions are disqualifying; their significance depends on the frequency of the exception, whether a compensating control was in place, and the financial reporting risk addressed by the failed control.

Step 5: Map CUECs to user entity controls. As described above, CUECs must have corresponding controls in the user entity's control framework. Missing CUECs are a gap that must be remediated or compensated.

Step 6: Communicate to auditors. Share the SOC report with the external auditors and document the evaluation results. The auditors will incorporate the SOC evaluation into their ICFR audit procedures and may perform additional procedures if the SOC report has limitations.`,
  },
  {
    id: 'SOC-CARVEOUT',
    category: 'SOC Reports',
    title: 'Carve-Out vs. Inclusive Method for Service Organizations in SOC Reports',
    guidance: `When a service organization uses subservice organizations to provide some portion of its services, the SOC report must address how those subservice organizations are treated. The two options are the carve-out method and the inclusive method, each with different implications for user entity SOX compliance.

Under the carve-out method, the service organization's SOC report describes the services provided by subservice organizations but excludes the subservice organizations' controls from the scope of the report. The report indicates that the user entity must separately evaluate the controls of the subservice organization to the extent those controls are relevant to the user entity's ICFR. For the user entity, this means identifying whether any subservice organizations are in scope for SOX, obtaining SOC reports from those subservice organizations, and evaluating them separately.

Under the inclusive method, the service organization's SOC report includes the subservice organizations' controls within its scope. The auditor tests controls at both the service organization and the subservice organization and provides a single integrated opinion. From the user entity's perspective, the inclusive method is simpler — one report covers the full service chain.

The carve-out method is more common because it is less complex for the service organization to administer, but it requires more work from the user entity. User entities should ask their service organizations which method is used and, if carve-out, which subservice organizations are carved out and what services they provide. This information is necessary to identify whether additional SOC evaluations are needed.

For SOX scoping, the company should document its entire service organization chain — direct service organizations and any carved-out subservice organizations — and confirm that SOC reports are obtained and evaluated for all in-scope organizations. The SOX team should work with IT, finance, and legal/procurement to identify all service organizations used in financial reporting processes, as the list is often larger than initially expected and may include cloud infrastructure providers, SaaS applications, and managed services vendors.`,
  },
  {
    id: 'AUDIT-SCOPING',
    category: 'Audit and Compliance',
    title: 'SOX Scoping: Materiality Thresholds, Significant Accounts, and Significant Locations',
    guidance: `Scoping is the process of defining the boundary of the SOX compliance program — which financial statement accounts, disclosures, business processes, IT systems, and locations are included in the scope of management's ICFR assessment and the external auditor's ICFR audit. Proper scoping is essential: too narrow a scope creates compliance risk; too broad a scope creates unnecessary cost.

Materiality is the starting point for scoping. A material misstatement is one that a reasonable investor would consider significant in deciding whether to buy, sell, or hold the company's stock. The SEC has provided guidance that misstatements below 5% of pre-tax income are generally not material, but smaller misstatements can be material based on qualitative factors (impact on meeting analyst expectations, impact on regulatory compliance, impact on loan covenants). Companies should use the same materiality threshold as their external auditors, as scoping differences create inefficiency and confusion.

Significant accounts are those for which there is a reasonable possibility that a material misstatement could exist, taking into account the size of the account and its susceptibility to misstatement. In practice, almost every balance sheet account above materiality and every significant income statement line is in scope. However, judgment is required for accounts with low dollar values but high qualitative risk (related-party receivables, contingent liabilities), and for accounts with high dollar values but low risk (cash in bank, where the primary control is a bank reconciliation).

Significant locations are locations (subsidiaries, business units, foreign operations) at which misstatements in financial information could be material to the consolidated financial statements. Most companies use a coverage approach: include locations that together represent at least 75-80% of each significant consolidated account balance, then consider whether any excluded locations have characteristics that suggest specific risk. Locations with unusual transaction types, complex accounting, or weaker internal control environments may need to be in scope even if their dollar value is below the coverage threshold.

The scoping process should be documented in a scoping memo that is reviewed and approved by the CFO and discussed with the external auditors before the ICFR assessment begins. Changes in scope from the prior year should be explained and justified. The scope document should list in-scope accounts, processes, locations, and IT systems, and should link each to the financial reporting risk it addresses.`,
  },
  {
    id: 'AUDIT-CONTROL-OWNERS',
    category: 'Audit and Compliance',
    title: 'Control Owner Responsibilities: Documentation, Evidence, and Seven-Year Retention',
    guidance: `Control owners are the individuals responsible for performing or overseeing specific SOX controls. They are the first line of defense in the ICFR system and their diligence in documenting and retaining evidence of their controls directly affects the company's ability to demonstrate ICFR effectiveness to management and external auditors.

Control documentation responsibilities: each control owner should understand the control they own — its objective, how it works, what could go wrong if it fails, and what evidence demonstrates it operated effectively. Control owners should be able to describe their control in their own words, not just read from a procedure document. In practice, many control failures occur not because the control is poorly designed but because the control owner does not understand what level of rigor is required (for example, a manager who "reviews" a reconciliation without actually investigating all differences).

Evidence requirements: every operating control should produce evidence of its operation. For automated controls, evidence typically consists of system configuration settings, system-generated reports, and ITGC testing results. For manual controls, evidence includes signed reports, emails, meeting minutes, or other documents that show a human performed the required action. The evidence should be contemporaneous — created at the time the control is performed, not reconstructed after the fact. "Informal" or undocumented controls are not SOX controls.

Specific evidence requirements by control type: for review controls — evidence includes a signed, dated copy of whatever was reviewed, with the reviewer's comments noting what they looked at, what exceptions they found, and how they resolved them; for approval controls — evidence includes the approval record from the system or a signed paper document; for reconciliation controls — evidence includes the completed reconciliation template with preparer sign-off and supervisor approval; for access review controls — evidence includes the access report that was reviewed, the reviewer's sign-off, and documentation of any access removed.

Seven-year retention: Section 802 establishes a minimum seven-year retention requirement for audit workpapers and related records. For practical purposes, companies should retain SOX control evidence — testing workpapers, control documentation, deficiency logs — for at least seven years. Electronic retention in a document management system with access controls is preferred. Retention schedules should be reviewed by Legal counsel to ensure they meet both SOX and other applicable requirements (tax records, litigation holds). Destruction of records should occur only pursuant to the formal records retention policy and should be suspended whenever a legal hold is active.`,
  },
  {
    id: 'AUDIT-REMEDIATION',
    category: 'Audit and Compliance',
    title: 'Deficiency Remediation: Root Cause Analysis, Compensating Controls, and Timelines',
    guidance: `When a control deficiency is identified — whether through management testing, internal audit, the external audit, or a control failure that resulted in an error — the company must follow a structured remediation process. The goal is not merely to fix the immediate issue but to address the root cause so that the same deficiency does not recur.

Root cause analysis (RCA) is the foundation of effective remediation. The RCA should identify: (1) the direct cause — what specifically went wrong (e.g., the control was not performed on time, the wrong population was reviewed, the approver signed off without actually reviewing the supporting documentation); (2) the contributing causes — what conditions allowed the direct cause to occur (e.g., inadequate training, understaffing, ambiguous control procedures, lack of monitoring); and (3) the systemic causes — whether the same root cause could be affecting other controls in other processes (e.g., a culture of rushing through controls at period-end, or a documentation requirement that is unclear across the organization).

Remediation actions should address the root cause, not just the symptom. If the root cause is that a control owner did not understand what evidence was required, the remediation should include training and clearer control procedures — not just asking the control owner to redo the test once. If the root cause is staffing — the control owner is responsible for too many controls — the remediation may require process redesign or headcount addition.

Compensating controls: when a true remediation of the deficiency will take time to implement (for example, implementing a system change to automate a manual control), management should implement a compensating control to mitigate the risk in the interim. The compensating control should be documented, tested, and monitored just like any other SOX control. Relying on a compensating control that has not been formally documented and tested is not adequate remediation.

Timelines: deficiency remediation timelines should be based on severity. Material weaknesses require the most urgent attention — the SEC expects disclosure in the annual report and investors, analysts, and regulators will track whether and when the material weakness is remediated. Significant deficiencies should be remediated within the current fiscal year if possible. Lesser deficiencies should have target remediation dates within a reasonable period. The audit committee should receive regular status updates on open deficiencies and remediation progress.

Tracking: all identified deficiencies should be logged in a centralized deficiency tracking system or workpaper with: the date identified, the source (management testing, internal audit, external audit), the control affected, the severity classification, the root cause, the remediation plan, the owner, the target completion date, and the current status. The tracking log should be reviewed by the CFO and shared with the external auditors and audit committee.`,
  },
  {
    id: 'AUDIT-MGMT-REP',
    category: 'Audit and Compliance',
    title: 'Management Representation Letters: Purpose, Content, and Responsibilities',
    guidance: `Management representation letters are written statements from management to the external auditor that confirm management's representations made during the audit and acknowledge management's responsibilities for the financial statements and ICFR. The representation letter is a required audit procedure under PCAOB standards — the auditor cannot complete the audit without one.

The management representation letter is signed by the CEO (or equivalent), the CFO (or equivalent), and often the Controller or Chief Accounting Officer. It is dated as of the date of the auditor's report and covers the period under audit. The representations made in the letter are in addition to — not a substitute for — the other audit evidence the auditor gathers.

Key representations in the management representation letter for an ICFR audit include: management acknowledges its responsibility for designing, implementing, and maintaining ICFR; management has provided the auditor with all information relevant to the ICFR audit, including all known actual or suspected fraud; management has disclosed to the auditor all known significant deficiencies and material weaknesses in ICFR; management has disclosed all changes in ICFR during the period; management has disclosed all identified material weaknesses that have been remediated; and management believes the ICFR is effective as of the measurement date (or, if a material weakness has been identified, management discloses it and acknowledges that ICFR is not effective).

False representations in the management letter are serious. Because the PCAOB requires the auditor to obtain the representation letter, a knowing misrepresentation in the letter could constitute fraud and could support criminal liability under Section 802 (false statements to auditors in connection with an audit) and Section 1519 (obstruction of a federal investigation).

Companies should prepare the first draft of the representation letter early in the audit process — not at the last minute — and review it carefully with legal counsel. The letter should accurately reflect management's actual conclusions about ICFR, including any deficiencies and their severity classifications, before the CEO and CFO sign.`,
  },
  {
    id: 'AUDIT-COMMITTEE',
    category: 'Audit and Compliance',
    title: 'Audit Committee Responsibilities Under SOX: Oversight, Independence, and Communication',
    guidance: `The audit committee of the board of directors plays a central role in SOX compliance. SOX significantly elevated the status and responsibilities of audit committees, making them directly responsible for the appointment, compensation, and oversight of the external auditor, and establishing independence requirements designed to prevent management from influencing audit committee members.

Section 301 of SOX requires that all audit committee members be independent directors — they may not accept any consulting, advisory, or other compensatory fees from the company (other than board compensation) and may not be affiliated with the company. The SEC's rules implementing Section 301 require that all listed company audit committees consist entirely of independent directors.

SOX also requires that each audit committee have at least one member who is a "financial expert" — someone with a background in preparing, auditing, analyzing, or evaluating financial statements and an understanding of GAAP, internal controls, and audit committee functions. Companies that do not have an audit committee financial expert must disclose that fact and explain why.

Audit committee responsibilities under SOX include: (1) direct responsibility for the appointment, compensation, and oversight of the external auditor; the external auditor reports directly to the audit committee, not to management; (2) pre-approval of all audit and permitted non-audit services performed by the external auditor; (3) establishing procedures for the receipt, retention, and treatment of complaints regarding accounting, internal controls, and auditing matters, including anonymous employee submissions (the whistleblower hotline); (4) reviewing and discussing the company's annual and interim financial statements with management and the external auditor; (5) reviewing management's ICFR assessment and the external auditor's attestation; and (6) reviewing disclosures made by the CEO and CFO in connection with their Section 302 certifications.

Required communications from the external auditor to the audit committee include: all critical accounting policies and practices; all alternative accounting treatments discussed with management; all material written communications between the auditor and management; all significant audit adjustments; any disagreements with management; and, most importantly, all identified significant deficiencies and material weaknesses in ICFR. The auditor must communicate significant deficiencies and material weaknesses in writing to the audit committee.

The audit committee should establish a meeting cadence that allows it to fulfill its oversight responsibilities: typically, quarterly meetings at which it reviews quarterly financial results with management and the external auditor, plus an annual deep-dive into the ICFR assessment and attestation. Ad hoc meetings should be held whenever a significant issue arises — a material weakness, a potential fraud, a significant accounting question, or a regulatory inquiry.`,
  },
  {
    id: 'COSO-PRINCIPLE1',
    category: 'COSO Framework — 17 Principles Detail',
    title: 'COSO Principle 1: Commitment to Integrity and Ethical Values',
    guidance: `COSO Principle 1 — "The organization demonstrates a commitment to integrity and ethical values" — is the cornerstone of the Control Environment component. It reflects the understanding that internal control is only as effective as the people who operate it; without a genuine commitment to doing the right thing, controls can be circumvented, overridden, or simply ignored.

Integrity and ethical values begin at the top of the organization. The board and senior leadership set the tone through their own behavior, the policies they put in place, and how they respond when ethical violations occur. A CEO who aggressively pressures finance teams to meet earnings targets, overlooks minor ethical breaches by high performers, or retaliates against employees who raise concerns is actively undermining Principle 1, regardless of how robust the written Code of Ethics is.

The Code of Ethics (or Code of Business Conduct) is the primary documentary evidence of Principle 1. It should address: honesty in financial reporting; conflicts of interest; confidentiality of company information; fair dealing with customers, suppliers, and competitors; compliance with laws and regulations; and procedures for reporting concerns without fear of retaliation. The Code should be approved by the board, distributed to all employees, and require annual acknowledgment. New employees should receive training on the Code as part of onboarding.

Mechanisms for reporting and investigating ethical violations: the Code should specify channels for reporting concerns — a manager, HR, Legal, the Ethics hotline, or directly to the audit committee. Reported concerns should be investigated promptly, confidentially, and independently of the function being investigated. Investigation outcomes and any disciplinary actions should be documented. Patterns of violations should be reported to the audit committee.

Evidence for SOX assessment: the existence of a Code of Ethics; completion rates for annual Code acknowledgment; records of ethics hotline calls, investigations, and outcomes; evidence of disciplinary actions when violations occur; communication of ethical expectations from senior leadership (CEO communications, all-hands meetings); and board and audit committee review of ethics program effectiveness.`,
  },
  {
    id: 'COSO-PRINCIPLE6',
    category: 'COSO Framework — 17 Principles Detail',
    title: 'COSO Principle 6: Specification of Suitable Objectives for Financial Reporting',
    guidance: `COSO Principle 6 — "The organization specifies objectives with sufficient clarity to enable the identification and assessment of risks to those objectives" — is the entry point for the Risk Assessment component. For SOX ICFR purposes, the relevant objectives are those related to external financial reporting: the preparation of financial statements in accordance with GAAP that fairly present the financial condition, results of operations, and cash flows of the company.

The specification of financial reporting objectives means that management must understand what GAAP requires, understand the financial statements they are producing, and be able to articulate what success looks like. This may seem obvious, but in practice, companies sometimes lack clarity about their financial reporting objectives — for example, not having an up-to-date accounting policy manual, not having clearly defined responsibilities for accounting judgments (such as who owns the revenue recognition analysis for complex contracts), or not having established materiality thresholds that guide decisions about what requires disclosure.

For ICFR purposes, the financial reporting objectives should be linked to specific financial statement line items and disclosures. The risk assessment for each objective should consider: the accounting standards applicable to the account or disclosure; areas where management judgment is required (estimates, fair values, variable consideration); areas where the company has had errors or adjustments in the past; and areas where the external auditor has identified elevated risk.

The link between Principle 6 and the rest of the SOX program is direct: the financial reporting objectives define the scope of the program. Accounts and disclosures that are necessary to achieve the objectives of fair presentation are in scope; accounts that are not material are out of scope. This clarity of objectives should be reflected in the scoping memo and reviewed by the external auditors to confirm alignment between management's scope and the auditor's ICFR audit scope.`,
  },
  {
    id: 'COSO-PRINCIPLE8',
    category: 'COSO Framework — 17 Principles Detail',
    title: 'COSO Principle 8: Fraud Risk Assessment in the COSO Framework',
    guidance: `COSO Principle 8 — "The organization considers the potential for fraud in assessing risks to the achievement of objectives" — explicitly requires management to consider fraud risk as part of the Risk Assessment component. This principle aligns with PCAOB AS2201's requirement that the ICFR audit address the risk of management override of controls, which the auditing standards identify as a fraud risk that should always be considered regardless of the specific fraud risk profile of the company.

Fraud risk assessment should consider three categories of fraud risk: (1) fraudulent financial reporting — the intentional misstatement of financial results by management, including manipulation of accounting estimates, improper revenue recognition, or falsification of journal entries; (2) misappropriation of assets — theft of company assets by employees or third parties, including cash theft, inventory fraud, payroll fraud, and vendor fraud; and (3) corruption — bribery, kickbacks, and other corrupt conduct that may not directly affect the financial statements but could create undisclosed liabilities or relationships.

The fraud risk assessment should be documented and updated annually, considering changes in the company's business, personnel, and control environment. Areas commonly identified as higher fraud risk include: revenue recognition (given the pressure to meet earnings targets and the complexity of recognition criteria); cash handling and payment processing (high volume, high temptation); payroll (ghost employees, unauthorized rate changes); expense reimbursement (personal expenses submitted as business expenses); and related-party transactions (undisclosed relationships that could indicate self-dealing).

Anti-fraud controls that directly respond to identified fraud risks include: detective journal entry monitoring; analytical procedures designed to detect unusual patterns in financial results; surprise cash counts and inventory observations; data analytics to detect anomalies in expense reports, purchase orders, and payments; segregation of duties over high-risk processes; and a whistleblower program that makes it easy for employees to report suspected fraud.

Management override of controls is a specific fraud risk that must always be assessed, regardless of the general fraud risk environment. Management override controls include: audit committee oversight that is independent of management; the external auditor's independent judgment; strong internal audit; journal entry monitoring with independent review; and a governance culture in which personnel feel empowered to question accounting judgments made by senior management.`,
  },
  {
    id: 'COSO-PRINCIPLE12',
    category: 'COSO Framework — 17 Principles Detail',
    title: 'COSO Principle 12: Deployment of Control Activities Through Policies and Procedures',
    guidance: `COSO Principle 12 — "The organization deploys control activities through policies that establish what is expected and through procedures that put policies into action" — addresses the operationalization of the control activities identified in Principles 10 and 11. It is not enough to have controls designed and selected; they must be embedded in documented policies and operational procedures that make them executable and consistent.

Policies establish the "what" and "why" of controls: they define management's expectations for behavior. An accounts payable policy, for example, should specify that all invoices above a defined threshold must be matched to a purchase order and a receiving report before being approved for payment. A journal entry policy should specify that all journal entries must have a business purpose description and supporting documentation and must be approved by someone other than the preparer. Policies should be approved by senior management, communicated to all affected employees, and maintained in a central, accessible location.

Procedures establish the "how" — the step-by-step operational details of how policies are implemented. Procedures tell control owners exactly what to do, in what sequence, with what inputs, and what outputs to produce as evidence. For SOX purposes, procedures should be sufficiently detailed that a trained employee could perform the control consistently by following the procedure. Vague procedures that leave too much to individual judgment create inconsistency and make it harder to test and demonstrate control effectiveness.

Control matrices (sometimes called Risk and Control Matrices or RCMMs) are the working documents that organize policy and procedure information for SOX purposes. A control matrix maps each financial reporting risk to one or more controls, identifies the control owner, describes the control in terms of its frequency, inputs, outputs, and evidence, and tracks testing results. The control matrix is the primary working document for management testing and serves as the basis for the external auditor's ICFR audit.

Maintaining current documentation is an ongoing responsibility. When business processes change — new systems are implemented, organizational changes occur, policies are updated — control documentation must be updated promptly to reflect the current control environment. Outdated documentation that does not match actual operations is a red flag for auditors and may indicate a design effectiveness deficiency.`,
  },
  {
    id: 'COSO-PRINCIPLE17',
    category: 'COSO Framework — 17 Principles Detail',
    title: 'COSO Principle 17: Evaluation and Communication of Internal Control Deficiencies',
    guidance: `COSO Principle 17 — "The organization evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action, including senior management and the board of directors as appropriate" — addresses the feedback loop that makes the internal control system self-correcting.

Timely identification and communication of deficiencies is the operational requirement of Principle 17. A deficiency that is identified but not communicated to the appropriate person cannot be remediated. Delayed communication — especially for significant deficiencies or material weaknesses — creates a risk that the deficiency will affect financial reporting before it is corrected, and a risk that the CEO and CFO will sign Section 302 and 906 certifications without full knowledge of known control weaknesses.

Communication channels for deficiencies should be defined and documented: who is responsible for evaluating the severity of a potential deficiency (typically the Controller or SOX team leader), who must be notified of significant deficiencies (the CFO and audit committee), and what the process is for determining the final classification (management's assessment, reviewed with external auditors). The timeline for communication should be specified: significant deficiencies and material weaknesses identified during the year should be communicated to the audit committee at the next regularly scheduled meeting or sooner if the matter is urgent.

The deficiency tracking log (described in the Remediation section) is the primary tool for demonstrating compliance with Principle 17. The log documents: when each deficiency was identified, when it was communicated to the responsible parties, what the classification was, what remediation action was taken, and when the deficiency was remediated and confirmed closed through re-testing.

The feedback from the monitoring process (including deficiency identification and communication) into control design and operation is what makes the COSO framework a closed-loop system. A company that identifies deficiencies, communicates them promptly, remediates them effectively, and updates its control framework to prevent recurrence is demonstrating all five components of COSO functioning together.`,
  },
  {
    id: 'SOX-MATERIALITY-QUALITATIVE',
    category: 'Audit and Compliance',
    title: 'Qualitative Materiality Factors in SOX: When Small Misstatements Are Still Material',
    guidance: `Materiality in financial reporting is not solely a quantitative concept. The SEC's Staff Accounting Bulletin (SAB) 99, "Materiality," explicitly states that a registrant and its auditor must consider qualitative factors in assessing whether a misstatement is material, and that a misstatement that is quantitatively small may be material if it has one or more of the following qualitative characteristics.

Key qualitative materiality factors include: (1) the misstatement masks a change in earnings or other trends — a small misstatement that prevents a revenue decline from being reported may be material even if it is below the percentage threshold; (2) the misstatement hides a failure to meet analyst consensus estimates — a penny-per-share misstatement that changes the comparison to consensus EPS is qualitatively material; (3) the misstatement changes a loss to income or vice versa — investors view the difference between a profit and a loss very differently, so a misstatement that crosses zero is almost always qualitatively material; (4) the misstatement relates to a segment or division that has been identified to investors as an important indicator of performance; (5) the misstatement affects compliance with regulatory requirements — a misstatement that causes the company to appear compliant with a loan covenant when it is actually in breach is qualitatively material; (6) the misstatement results from fraud or intentional manipulation — misstatements that result from fraud are inherently material regardless of amount, because they indicate a failure of the control environment; (7) the misstatement involves related-party transactions — even small amounts may be material if they involve undisclosed self-dealing by management.

For ICFR purposes, qualitative materiality factors are relevant to the severity classification of control deficiencies. A control deficiency that could result in a misstatement that is quantitatively small but qualitatively material (e.g., a control that protects the completeness of a key disclosure that affects a regulatory compliance conclusion) should be evaluated with the qualitative factors in mind. Auditors and management teams should explicitly document their qualitative analysis when evaluating whether a quantitatively small deficiency or misstatement warrants elevated concern.

The practical implication: SOX programs should not mechanically apply a single dollar threshold for all scoping and deficiency classification decisions. Each significant account and each deficiency should be evaluated holistically, considering both the quantitative amount and the qualitative circumstances. The disclosure committee and the CFO should be consulted whenever a potential misstatement is identified, even if it appears to be below the quantitative materiality threshold.`,
  },
  {
    id: 'SOX-EMERGING-RISKS',
    category: 'Audit and Compliance',
    title: 'Emerging Risks in SOX Compliance: AI, Cybersecurity, Crypto Assets, and ESG Reporting',
    guidance: `The SOX control framework was designed in 2002 and must be continuously adapted to address new and emerging risks to financial reporting integrity. Companies operating at the frontier of technology and regulatory change face novel challenges that require thoughtful control design and proactive engagement with auditors and regulators.

Artificial Intelligence in financial reporting: companies increasingly use AI and machine learning models to support financial accounting — for example, using AI to assist with revenue recognition analysis, to automate journal entry classification, or to detect anomalies in financial data. These AI-assisted processes create new ITGC-like questions: Who trains and validates the model? How are model outputs reviewed by humans before they affect financial reporting? How are changes to the model governed? How is model accuracy monitored over time? Existing ITGC categories (change management, access, program development) provide a useful starting framework, but controls over AI models require additional consideration of model risk management concepts borrowed from banking regulation (SR 11-7).

Cybersecurity and financial reporting: SEC rules adopted in 2023 require public companies to disclose material cybersecurity incidents within four business days (consistent with Section 409) and to disclose annually their cybersecurity risk management, strategy, and governance. For ICFR, cybersecurity incidents that compromise the integrity of financial systems or data can directly affect the reliability of financial reporting. Controls should include: incident response procedures that specifically evaluate whether financial data was compromised; a process for the disclosure committee to evaluate the materiality of cybersecurity incidents for 8-K purposes; and communication of cybersecurity risks to the audit committee.

Crypto assets: companies that hold, issue, or transact in crypto assets face accounting complexity (ASC 350-60 for crypto assets held by companies as investments) and control challenges: wallet security (custody controls), private key management, transaction recording, and fair value measurement. Controls over crypto asset processes must address the unique custodial risks of bearer assets where loss of private keys means loss of the asset.

ESG financial reporting: as ESG disclosures become more formal (the SEC's climate disclosure rules require in-scope companies to include certain climate-related data in their annual reports), the controls over ESG data collection and reporting will need to meet the same standard as financial controls. Companies should begin building a "SOX-equivalent" framework for in-scope ESG metrics: data governance, internal review, and audit readiness.`,
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  try {
    // Find existing SOX framework
    const { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'SOX')
      .maybeSingle();

    if (!framework) throw new Error('SOX framework not found');

    // Find or create source
    let { data: source } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', framework.id)
      .eq('name', 'SOX Enhanced Compliance Resources')
      .maybeSingle();

    if (!source) {
      const { data } = await supabase.from('sources').insert({
        framework_id: framework.id,
        name: 'SOX Enhanced Compliance Resources',
        url: 'https://www.sec.gov/spotlight/sarbanes-oxley.htm',
        source_type: 'webpage',
        scraper_type: 'generic-webpage',
      }).select('id').single();
      source = data;
    }

    const { data: job } = await supabase.from('ingest_jobs').insert({
      source_id: source!.id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    }).select('id').single();

    let documentsIngested = 0;

    for (const item of SOX_DATA) {
      const rawContent = `# ${item.id}\n\n## Category\n${item.category}\n\n## Requirement\n${item.title}\n\n## Guidance\n${item.guidance}`;
      const embedding = await generateEmbedding(rawContent);
      const { data: doc } = await supabase.from('documents').insert({
        source_id: source!.id,
        framework_id: framework!.id,
        title: `${item.id} — ${item.title}`,
        document_type: 'control',
        raw_content: rawContent,
        metadata: { practice_id: item.id, category: item.category },
        url: 'https://www.sec.gov/spotlight/sarbanes-oxley.htm',
      }).select('id').single();
      if (doc) {
        await insertChunk(doc.id, rawContent, embedding);
        documentsIngested++;
      }
    }

    await supabase.from('ingest_jobs').update({
      status: 'completed',
      documents_ingested: documentsIngested,
      completed_at: new Date().toISOString(),
    }).eq('id', job!.id);

    return new Response(JSON.stringify({ success: true, documents: documentsIngested }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
