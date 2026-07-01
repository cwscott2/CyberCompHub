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

interface Doc {
  control_id: string;
  practice_id: string;
  domain_name: string;
  title: string;
  content: string;
}

const DOCS: Doc[] = [
  // ── MAINTENANCE (MA) ───────────────────────────────────────────────────
  {
    control_id: 'MA.L2-3.7.1',
    practice_id: 'MA.L2-3.7.1',
    domain_name: 'Maintenance',
    title: 'MA.L2-3.7.1 — Managed Maintenance — Assessment Objectives',
    content: `# MA.L2-3.7.1 — Managed Maintenance — Assessment Objectives

**Domain:** Maintenance | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Perform maintenance on organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Maintenance policy and procedures
- Scheduled and completed maintenance records
- Hardware and software maintenance schedules
- Vendor maintenance contracts and service records
- System change records associated with maintenance activities

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who perform or coordinate maintenance
- Facility or IT operations personnel managing maintenance schedules
- Security officers who oversee maintenance security requirements
Discussion topics: How is maintenance scheduled and tracked? Are maintenance activities documented? How is maintenance coordinated to minimize security risk?

## TEST
Assessors should test the following mechanisms:
- Review maintenance logs to verify activities are documented
- Confirm maintenance schedule exists and is followed
- Verify maintenance by external vendors is tracked and authorized
- Test that post-maintenance security validation occurs

## Key Indicators of Compliance
- Maintenance activities documented with date, personnel, and actions taken
- Maintenance schedule defined and followed for all critical systems
- External maintenance activities authorized and escorted
- Post-maintenance verification ensures systems are functional and secure

## Common Findings / Deficiencies
- No maintenance logs or records kept for system activities
- External vendor maintenance performed without documentation or oversight`,
  },
  {
    control_id: 'MA.L2-3.7.2',
    practice_id: 'MA.L2-3.7.2',
    domain_name: 'Maintenance',
    title: 'MA.L2-3.7.2 — Maintenance Controls — Assessment Objectives',
    content: `# MA.L2-3.7.2 — Maintenance Controls — Assessment Objectives

**Domain:** Maintenance | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance.

## EXAMINE
Assessors should examine the following types of evidence:
- Maintenance tool inventory and authorization records
- Policy specifying approved maintenance tools and techniques
- Records of maintenance personnel authorization and vetting
- Controls on maintenance tool usage (check-in/check-out, logging)
- Documentation of software diagnostic tools and their controls

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who use maintenance tools
- Security officers who authorize maintenance tools and personnel
- Facility security officers overseeing maintenance contractor vetting
Discussion topics: Which maintenance tools are authorized? How are maintenance tools controlled between uses? How are maintenance personnel vetted?

## TEST
Assessors should test the following mechanisms:
- Review list of approved maintenance tools against what is actually in use
- Verify that unauthorized maintenance tools are not connected to systems
- Confirm maintenance personnel records show appropriate background checks
- Test that maintenance tool usage is logged

## Key Indicators of Compliance
- Approved maintenance tool inventory maintained and enforced
- Personnel performing maintenance vetted and authorized
- Maintenance tool usage logged and attributable to specific individuals
- Unauthorized tools detected and removed

## Common Findings / Deficiencies
- No inventory of approved maintenance tools
- Third-party maintenance performed by vendors without background screening`,
  },
  {
    control_id: 'MA.L2-3.7.3',
    practice_id: 'MA.L2-3.7.3',
    domain_name: 'Maintenance',
    title: 'MA.L2-3.7.3 — Equipment Sanitization — Assessment Objectives',
    content: `# MA.L2-3.7.3 — Equipment Sanitization — Assessment Objectives

**Domain:** Maintenance | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Ensure equipment removed for off-site maintenance is sanitized of any CUI.

## EXAMINE
Assessors should examine the following types of evidence:
- Equipment sanitization policy and procedures
- Records of sanitization performed before equipment is removed
- Sanitization method documentation (DoD 5220.22-M, NIST 800-88)
- Chain of custody records for equipment sent off-site
- Verification records confirming sanitization was completed

## INTERVIEW
Assessors should interview personnel with the following roles:
- IT personnel responsible for sanitizing equipment before off-site shipment
- Security officers overseeing equipment sanitization requirements
- Vendor management personnel handling off-site maintenance contracts
Discussion topics: What sanitization method is used before sending equipment off-site? How is sanitization verified? What happens if sanitization is not possible before removal?

## TEST
Assessors should test the following mechanisms:
- Review sanitization records for equipment recently sent off-site
- Verify sanitization method meets NIST 800-88 or equivalent standards
- Confirm verification that sanitization occurred is documented
- Test that policy covers all equipment types that might contain CUI

## Key Indicators of Compliance
- All equipment containing CUI sanitized before off-site maintenance
- Sanitization method appropriate for media type (per NIST 800-88)
- Sanitization documented with method used and verification
- Chain of custody maintained for equipment sent off-site

## Common Findings / Deficiencies
- Equipment sent to vendor for repair without sanitization of CUI
- No documented sanitization procedures or records`,
  },
  {
    control_id: 'MA.L2-3.7.4',
    practice_id: 'MA.L2-3.7.4',
    domain_name: 'Maintenance',
    title: 'MA.L2-3.7.4 — Media Inspection — Assessment Objectives',
    content: `# MA.L2-3.7.4 — Media Inspection — Assessment Objectives

**Domain:** Maintenance | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Check media containing diagnostic and test programs for malicious code before the media are used in organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy requiring media scanning before use in maintenance activities
- Records of malware scans on maintenance media
- Anti-malware tool configurations used for media inspection
- Approved media list for maintenance activities

## INTERVIEW
Assessors should interview personnel with the following roles:
- IT personnel who perform maintenance with diagnostic media
- Security personnel who oversee media inspection requirements
Discussion topics: What media scanning procedure is followed before using maintenance tools or media? Who is responsible for ensuring media is scanned? What happens if malware is detected on maintenance media?

## TEST
Assessors should test the following mechanisms:
- Review process for inspecting media before use in maintenance
- Verify anti-malware scans are performed and documented
- Confirm scan results are reviewed before media is authorized for use
- Test that maintenance media from vendors is subject to same inspection requirements

## Key Indicators of Compliance
- All maintenance media scanned for malware before use
- Scan results documented and reviewed
- Malware-positive media quarantined and reported
- Vendor-provided media subject to same inspection requirements

## Common Findings / Deficiencies
- Maintenance USB drives or media connected without prior scanning
- Assumption that vendor-provided media is clean without independent verification`,
  },
  {
    control_id: 'MA.L2-3.7.5',
    practice_id: 'MA.L2-3.7.5',
    domain_name: 'Maintenance',
    title: 'MA.L2-3.7.5 — Nonlocal Maintenance — Assessment Objectives',
    content: `# MA.L2-3.7.5 — Nonlocal Maintenance — Assessment Objectives

**Domain:** Maintenance | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Require MFA to establish nonlocal maintenance sessions via external network connections and terminate such connections when nonlocal maintenance is complete.

## EXAMINE
Assessors should examine the following types of evidence:
- Remote maintenance policy and procedures
- VPN or remote access configurations for maintenance sessions
- MFA requirements and enforcement for remote maintenance
- Records of remote maintenance sessions with termination confirmation
- Contracts with vendors performing remote maintenance

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who perform or oversee remote maintenance
- Vendor management personnel overseeing remote vendor access
- Security officers defining remote maintenance security requirements
Discussion topics: How is MFA enforced for remote maintenance connections? How are remote maintenance sessions terminated when complete? How is remote vendor access monitored?

## TEST
Assessors should test the following mechanisms:
- Verify MFA is required for establishing remote maintenance connections
- Review remote maintenance session logs to confirm sessions were terminated after completion
- Test that remote maintenance sessions cannot persist after the maintenance window
- Verify remote maintenance access is logged with complete session information

## Key Indicators of Compliance
- MFA enforced for all nonlocal maintenance connections
- Sessions terminated immediately upon maintenance completion
- Remote maintenance sessions logged with user, time, and actions performed
- Vendor remote access time-boxed and monitored during sessions

## Common Findings / Deficiencies
- Vendor remote access credentials not requiring MFA
- Remote maintenance sessions left open after work is complete`,
  },
  {
    control_id: 'MA.L2-3.7.6',
    practice_id: 'MA.L2-3.7.6',
    domain_name: 'Maintenance',
    title: 'MA.L2-3.7.6 — Maintenance Personnel — Assessment Objectives',
    content: `# MA.L2-3.7.6 — Maintenance Personnel — Assessment Objectives

**Domain:** Maintenance | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Supervise the maintenance activities of personnel without required access authorization.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy requiring supervision of unauthorized maintenance personnel
- Escort and supervision records for maintenance activities
- Visitor logs for maintenance personnel
- Maintenance contract requirements for personnel screening
- Records of temporary account creation for maintenance (if applicable)

## INTERVIEW
Assessors should interview personnel with the following roles:
- Facilities or IT personnel who escort maintenance technicians
- Security officers defining supervision requirements for maintenance
Discussion topics: How are maintenance personnel without clearances or access authorization supervised? Who escorts them? What areas can unsupervised maintenance personnel access?

## TEST
Assessors should test the following mechanisms:
- Review maintenance logs for escort/supervision documentation
- Verify escort requirement is defined in policy and enforced in practice
- Confirm maintenance personnel without authorization cannot access CUI unescorted
- Test that visitor/escort logs are maintained for all maintenance personnel

## Key Indicators of Compliance
- All maintenance personnel without access authorization escorted at all times
- Escort personnel authorized and trained on supervision responsibilities
- Maintenance visits documented in visitor/escort logs
- CUI inaccessible to unsupervised maintenance personnel

## Common Findings / Deficiencies
- Vendor technicians allowed unescorted access to areas containing CUI systems
- Escort requirement documented in policy but not enforced in practice`,
  },
  // ── MEDIA PROTECTION (MP) ──────────────────────────────────────────────
  {
    control_id: 'MP.L2-3.8.1',
    practice_id: 'MP.L2-3.8.1',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.1 — Media Protection — Assessment Objectives',
    content: `# MP.L2-3.8.1 — Media Protection — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Protect (i.e., physically control and securely store) system media containing CUI, both paper and digital.

## EXAMINE
Assessors should examine the following types of evidence:
- Media protection policy covering both physical and digital media
- Physical security controls for media storage (locked cabinets, secure rooms)
- Media inventory and tracking records
- Controls for paper CUI (locked file cabinets, clean desk policy)
- Labels on digital and physical media containing CUI

## INTERVIEW
Assessors should interview personnel with the following roles:
- Personnel responsible for managing CUI media
- Facility security personnel overseeing physical media storage
- Security officers defining media protection requirements
Discussion topics: Where is CUI media stored? How is it physically secured? How is media tracked from creation through disposal?

## TEST
Assessors should test the following mechanisms:
- Inspect physical media storage areas for adequate security controls
- Review media inventory to verify all CUI media is tracked
- Verify that unauthorized personnel cannot access CUI media storage
- Confirm paper CUI is secured when not in use (clean desk inspection)

## Key Indicators of Compliance
- CUI media stored in locked, access-controlled storage
- Media inventory maintained with location and custody tracking
- Labels applied to CUI media to identify protection requirements
- Clean desk policy enforced for paper CUI

## Common Findings / Deficiencies
- CUI on portable drives stored in unlocked desk drawers
- No inventory of physical media containing CUI`,
  },
  {
    control_id: 'MP.L2-3.8.2',
    practice_id: 'MP.L2-3.8.2',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.2 — Media Access — Assessment Objectives',
    content: `# MP.L2-3.8.2 — Media Access — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Limit access to CUI on system media to authorized users.

## EXAMINE
Assessors should examine the following types of evidence:
- Access control policy for CUI media
- Access logs for CUI media storage locations
- Technical controls restricting access to digital CUI media
- Personnel authorization records for media access
- Records of media access reviews

## INTERVIEW
Assessors should interview personnel with the following roles:
- Personnel authorized to access CUI media
- Security officers overseeing media access controls
Discussion topics: Who is authorized to access CUI media? How is access tracked? How are requests for media access handled?

## TEST
Assessors should test the following mechanisms:
- Attempt to access CUI media storage as an unauthorized user and verify denial
- Review media access logs for completeness
- Verify access authorization list is current and reviewed regularly
- Test that digital CUI media requires authentication to access

## Key Indicators of Compliance
- Access to CUI media restricted to documented authorized users
- Access events logged for both physical and digital CUI media
- Authorization list reviewed and maintained
- Unauthorized access attempts detected and investigated

## Common Findings / Deficiencies
- CUI media accessible to all employees without restriction
- No logging of who accesses shared network drives containing CUI`,
  },
  {
    control_id: 'MP.L2-3.8.3',
    practice_id: 'MP.L2-3.8.3',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.3 — Media Sanitization — Assessment Objectives',
    content: `# MP.L2-3.8.3 — Media Sanitization — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Sanitize or destroy system media before disposal or reuse.

## EXAMINE
Assessors should examine the following types of evidence:
- Media sanitization policy and procedures
- Sanitization records for disposed or reused media
- Approved sanitization methods (NIST 800-88 guidance)
- Destruction records for media that cannot be sanitized
- Vendor contracts for third-party media destruction

## INTERVIEW
Assessors should interview personnel with the following roles:
- IT personnel responsible for media disposal and sanitization
- Security officers overseeing media sanitization requirements
Discussion topics: What sanitization methods are used for different media types? How is sanitization verified and documented? What happens to media that cannot be effectively sanitized?

## TEST
Assessors should test the following mechanisms:
- Review sanitization records for recently disposed or reused media
- Verify sanitization method is appropriate for media type per NIST 800-88
- Confirm destruction records exist for media that was physically destroyed
- Test that decommissioned systems have all storage media sanitized before disposal

## Key Indicators of Compliance
- All media sanitized or destroyed before disposal or reuse
- Sanitization method appropriate to media type (overwrite, degauss, physical destruction)
- Sanitization documented with verification
- Certificate of destruction obtained for third-party destruction

## Common Findings / Deficiencies
- Decommissioned computers disposed without verifying hard drive sanitization
- No documented sanitization procedures — sanitization performed ad hoc`,
  },
  {
    control_id: 'MP.L2-3.8.4',
    practice_id: 'MP.L2-3.8.4',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.4 — Media Markings — Assessment Objectives',
    content: `# MP.L2-3.8.4 — Media Markings — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Mark media with necessary CUI markings and distribution limitations.

## EXAMINE
Assessors should examine the following types of evidence:
- CUI marking policy and standards
- Physical inspection of media for proper markings
- Training records on CUI marking requirements
- Examples of properly marked CUI documents and media
- Procedures for applying markings to different media types

## INTERVIEW
Assessors should interview personnel with the following roles:
- Personnel who create or handle CUI
- Security officers overseeing CUI marking compliance
Discussion topics: How do you determine what CUI category applies to media? Where do you apply markings? What is the required marking format?

## TEST
Assessors should test the following mechanisms:
- Inspect CUI documents and media for proper markings
- Verify marking format meets DoD/NARA CUI requirements
- Test that electronic documents include CUI headers/footers
- Confirm personnel can demonstrate correct marking procedures

## Key Indicators of Compliance
- All CUI media and documents properly marked per DoD CUI program requirements
- Personnel trained on marking requirements
- Electronic CUI includes marking in document header/footer
- Physical media labeled with CUI designation and distribution limitations

## Common Findings / Deficiencies
- CUI documents created and shared without required markings
- Inconsistent marking practices across the organization`,
  },
  {
    control_id: 'MP.L2-3.8.5',
    practice_id: 'MP.L2-3.8.5',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.5 — Media Accountability — Assessment Objectives',
    content: `# MP.L2-3.8.5 — Media Accountability — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control access to media containing CUI and maintain accountability for media during transport until the media is destroyed or sanitized.

## EXAMINE
Assessors should examine the following types of evidence:
- Media accountability and tracking records
- Chain of custody documentation for CUI media transport
- Media inventory with current location and custodian
- Periodic media inventory audit records
- Lost/stolen media incident records

## INTERVIEW
Assessors should interview personnel with the following roles:
- Personnel responsible for media tracking
- Security officers overseeing media accountability program
Discussion topics: How is CUI media tracked from creation to disposal? What happens when media changes custodians? How are discrepancies in media inventory addressed?

## TEST
Assessors should test the following mechanisms:
- Conduct spot check of media inventory against physical media present
- Review chain of custody records for media that has been transported
- Verify that media transfers require formal documentation
- Test that lost media is reported and investigated per incident procedures

## Key Indicators of Compliance
- Media inventory maintained with current location, custodian, and status
- Chain of custody documented for all media transfers
- Periodic inventory audits conducted and discrepancies investigated
- Lost media triggers incident response and is reported appropriately

## Common Findings / Deficiencies
- No media inventory or tracking system in place
- Media transfers undocumented with no chain of custody`,
  },
  {
    control_id: 'MP.L2-3.8.6',
    practice_id: 'MP.L2-3.8.6',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.6 — Portable Storage Encryption — Assessment Objectives',
    content: `# MP.L2-3.8.6 — Portable Storage Encryption — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Implement cryptographic mechanisms to protect the confidentiality of CUI during transport unless otherwise protected by alternative physical safeguards.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy requiring encryption for CUI on portable storage
- Approved encryption tools and configurations for portable media
- Technical controls enforcing encryption (endpoint DLP, hardware-encrypted drives)
- Records of CUI transported on portable media

## INTERVIEW
Assessors should interview personnel with the following roles:
- Personnel who transfer CUI using portable media
- IT staff who configure encryption for portable storage
- Security officers overseeing portable storage protection
Discussion topics: What encryption is required for CUI on portable media? How is compliance enforced? What encryption standards are used?

## TEST
Assessors should test the following mechanisms:
- Review a portable drive containing CUI and verify encryption is applied
- Test encryption tool configuration for compliance with FIPS/NIST standards (AES-256)
- Verify endpoint controls enforce encryption before CUI can be written to portable media
- Confirm encryption keys are managed appropriately (not stored with the media)

## Key Indicators of Compliance
- All portable media containing CUI encrypted with FIPS-validated algorithms
- Technical controls enforce encryption before CUI transfer to portable media
- Encryption standards reviewed and validated
- Unencrypted portable media cannot receive CUI without authorization

## Common Findings / Deficiencies
- CUI transferred to unencrypted USB drives without controls
- Software-based encryption available but not enforced through technical controls`,
  },
  {
    control_id: 'MP.L2-3.8.7',
    practice_id: 'MP.L2-3.8.7',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.7 — Removable Media Control — Assessment Objectives',
    content: `# MP.L2-3.8.7 — Removable Media Control — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control the use of removable media on system components.

## EXAMINE
Assessors should examine the following types of evidence:
- Removable media policy defining authorized use
- Endpoint security tool configurations controlling removable media
- Approved removable media list or authorization records
- Audit logs of removable media connection events
- Exception/waiver records for authorized removable media use

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators configuring removable media controls
- End users who use or request removable media
- Security officers defining removable media policy
Discussion topics: Is removable media generally allowed or prohibited? How are exceptions authorized? How are connection events monitored?

## TEST
Assessors should test the following mechanisms:
- Connect an unauthorized removable drive and verify it is blocked or restricted
- Review endpoint security configurations for removable media controls
- Verify audit logs capture removable media events
- Confirm authorized removable media is tracked and labeled

## Key Indicators of Compliance
- Technical controls restrict removable media to authorized devices
- All removable media connection events logged
- Unauthorized media blocked or requires explicit authorization
- Approved media list maintained and enforced

## Common Findings / Deficiencies
- Any USB drive can connect without restriction or logging
- Endpoint DLP deployed but removable media policy not enforced`,
  },
  {
    control_id: 'MP.L2-3.8.8',
    practice_id: 'MP.L2-3.8.8',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.8 — Shared Media — Assessment Objectives',
    content: `# MP.L2-3.8.8 — Shared Media — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Prohibit the use of portable storage devices when such devices have no identifiable owner.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy prohibiting use of unidentifiable portable storage
- Technical controls blocking unknown/unregistered portable storage
- Training records covering prohibition on owner-unidentifiable media
- Incident records for found/unidentified media

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security awareness training personnel
- End users to assess understanding of the prohibition
- Security officers defining the policy
Discussion topics: What should an employee do if they find a USB drive? Can employees use personally owned USB drives? How is the prohibition enforced technically?

## TEST
Assessors should test the following mechanisms:
- Attempt to use a USB drive with no ownership markings and verify control action
- Review training records to confirm prohibition on unidentifiable media is covered
- Verify incident procedures address found/unknown media
- Test that technical controls block or flag media without registered identifiers

## Key Indicators of Compliance
- Policy explicitly prohibits use of media without identifiable ownership
- Technical controls enforce restriction where feasible
- Personnel trained on prohibition and proper handling of found media
- Found media treated as a potential security incident

## Common Findings / Deficiencies
- No policy on unidentifiable portable storage
- Personnel unaware of the risk of using found or unidentified media`,
  },
  {
    control_id: 'MP.L2-3.8.9',
    practice_id: 'MP.L2-3.8.9',
    domain_name: 'Media Protection',
    title: 'MP.L2-3.8.9 — Media Protect in Transit — Assessment Objectives',
    content: `# MP.L2-3.8.9 — Media Protect in Transit — Assessment Objectives

**Domain:** Media Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Protect the confidentiality of backup CUI at storage locations.

## EXAMINE
Assessors should examine the following types of evidence:
- Backup policy specifying protection requirements for backup CUI
- Backup storage configurations including encryption settings
- Physical security controls at off-site backup locations
- Vendor contracts for third-party backup storage including security requirements

## INTERVIEW
Assessors should interview personnel with the following roles:
- IT personnel managing backup systems and storage
- Security officers overseeing backup protection requirements
Discussion topics: How are backups containing CUI encrypted? Where are backups stored, and how is the storage secured? How is backup integrity verified?

## TEST
Assessors should test the following mechanisms:
- Review backup encryption configuration to confirm CUI backups are encrypted
- Verify off-site backup storage access is restricted
- Confirm backup restoration procedures are tested and backup integrity verified
- Test that backup access requires authentication and is logged

## Key Indicators of Compliance
- Backup CUI encrypted using FIPS-validated algorithms
- Backup storage access controlled and logged
- Off-site storage vendor meets security requirements contractually
- Backup integrity verified through periodic restoration tests

## Common Findings / Deficiencies
- Backups stored off-site without encryption
- No verification that off-site storage vendor has adequate security controls`,
  },
  // ── PHYSICAL PROTECTION (PE) ───────────────────────────────────────────
  {
    control_id: 'PE.L2-3.10.1',
    practice_id: 'PE.L2-3.10.1',
    domain_name: 'Physical Protection',
    title: 'PE.L2-3.10.1 — Limit Physical Access — Assessment Objectives',
    content: `# PE.L2-3.10.1 — Limit Physical Access — Assessment Objectives

**Domain:** Physical Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Limit physical access to organizational systems, equipment, and the respective operating environments to authorized individuals.

## EXAMINE
Assessors should examine the following types of evidence:
- Physical access control policy and procedures
- Access control system configurations (badge readers, keypad, biometric)
- Access authorization lists for sensitive areas
- Physical access logs for CUI processing areas
- Visitor access records and escort procedures

## INTERVIEW
Assessors should interview personnel with the following roles:
- Facilities or physical security personnel managing access control
- IT personnel who work in restricted areas
- Security officers overseeing physical protection requirements
Discussion topics: How is access to CUI processing areas controlled? How are visitors managed? How is access authorization granted and revoked?

## TEST
Assessors should test the following mechanisms:
- Attempt to access a restricted area without proper credentials and verify denial
- Review access authorization lists for currency and accuracy
- Inspect physical access controls (badge readers, locks) for proper operation
- Verify that access logs are reviewed regularly

## Key Indicators of Compliance
- Physical access to CUI processing areas restricted to authorized individuals
- Access control system operational with logging
- Access authorization lists maintained and reviewed
- Visitor access controlled with escort and logging

## Common Findings / Deficiencies
- Server rooms accessible to all employees with a badge regardless of role
- Physical access logs not reviewed or not being generated`,
  },
  {
    control_id: 'PE.L2-3.10.2',
    practice_id: 'PE.L2-3.10.2',
    domain_name: 'Physical Protection',
    title: 'PE.L2-3.10.2 — Monitor Physical Access — Assessment Objectives',
    content: `# PE.L2-3.10.2 — Monitor Physical Access — Assessment Objectives

**Domain:** Physical Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Protect and monitor the physical facility and support infrastructure for organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Physical surveillance system (CCTV) coverage maps and configurations
- Physical access monitoring policy and procedures
- Alarm system configurations for unauthorized access detection
- Records of physical security monitoring reviews
- Incident records for detected physical access events

## INTERVIEW
Assessors should interview personnel with the following roles:
- Facilities or physical security personnel operating monitoring systems
- Security officers overseeing physical monitoring requirements
Discussion topics: How is physical access monitored? Are cameras covering all critical areas? How are alarms responded to? How often are physical access logs reviewed?

## TEST
Assessors should test the following mechanisms:
- Review CCTV coverage for adequate monitoring of CUI processing areas
- Verify alarms are functional and tested regularly
- Confirm monitoring records are reviewed on a defined schedule
- Test that physical access events trigger appropriate response

## Key Indicators of Compliance
- Cameras or equivalent monitoring covering critical physical areas
- Physical access logs reviewed regularly
- Alarm systems functional and tested
- Physical access incidents detected and investigated

## Common Findings / Deficiencies
- CCTV installed but recordings not monitored or reviewed
- Physical access to critical infrastructure not monitored`,
  },
  {
    control_id: 'PE.L2-3.10.3',
    practice_id: 'PE.L2-3.10.3',
    domain_name: 'Physical Protection',
    title: 'PE.L2-3.10.3 — Visitor Escort — Assessment Objectives',
    content: `# PE.L2-3.10.3 — Visitor Escort — Assessment Objectives

**Domain:** Physical Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Escort visitors and monitor visitor activity.

## EXAMINE
Assessors should examine the following types of evidence:
- Visitor access policy requiring escort in restricted areas
- Visitor log records showing escort information
- Training records for escort personnel
- Signage at facility entrances indicating visitor requirements

## INTERVIEW
Assessors should interview personnel with the following roles:
- Reception or facility personnel managing visitor access
- Security officers overseeing visitor escort policy
- Personnel who serve as visitor escorts
Discussion topics: What areas require visitor escort? How are escorts assigned? What are escort personnel trained to do? How are visitors identified?

## TEST
Assessors should test the following mechanisms:
- Attempt to enter restricted areas as an unescorted visitor and verify interception
- Review visitor logs for escort identification
- Verify escort requirement is communicated and enforced
- Test that visitors are logged upon arrival and departure

## Key Indicators of Compliance
- All visitors escorted in areas containing CUI systems
- Visitor logs maintained with escort identification
- Escort personnel trained on responsibilities
- Visitor badges visually distinguish visitors from employees

## Common Findings / Deficiencies
- Visitor escorting practiced inconsistently depending on which employee is asked
- Visitor logs maintained but escort identification not included`,
  },
  {
    control_id: 'PE.L2-3.10.4',
    practice_id: 'PE.L2-3.10.4',
    domain_name: 'Physical Protection',
    title: 'PE.L2-3.10.4 — Audit Physical Access Logs — Assessment Objectives',
    content: `# PE.L2-3.10.4 — Audit Physical Access Logs — Assessment Objectives

**Domain:** Physical Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Maintain audit logs of physical access.

## EXAMINE
Assessors should examine the following types of evidence:
- Physical access control system log configuration
- Sample physical access logs for CUI processing areas
- Log retention policy for physical access records
- Records of physical access log reviews
- Incident records stemming from physical access log analysis

## INTERVIEW
Assessors should interview personnel with the following roles:
- Facilities security personnel who review physical access logs
- Security officers overseeing physical access audit requirements
Discussion topics: How long are physical access logs retained? Who reviews them and how often? Have any security concerns been identified through log review?

## TEST
Assessors should test the following mechanisms:
- Review physical access logs for completeness (who accessed, when, which area)
- Verify logs are retained for the required period
- Confirm logs are reviewed on a defined schedule
- Test that access control system cannot be bypassed without generating a log entry

## Key Indicators of Compliance
- Physical access logs maintained for all controlled areas
- Logs retained for defined period (typically consistent with other audit log retention)
- Regular log reviews conducted and documented
- Log data sufficient to support investigation of physical access incidents

## Common Findings / Deficiencies
- Physical access control system installed but not logging access events
- Logs generated but never reviewed`,
  },
  {
    control_id: 'PE.L2-3.10.5',
    practice_id: 'PE.L2-3.10.5',
    domain_name: 'Physical Protection',
    title: 'PE.L2-3.10.5 — Manage Physical Access Devices — Assessment Objectives',
    content: `# PE.L2-3.10.5 — Manage Physical Access Devices — Assessment Objectives

**Domain:** Physical Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control and manage physical access devices.

## EXAMINE
Assessors should examine the following types of evidence:
- Inventory of physical access devices (keys, badges, tokens)
- Policy for issuing, tracking, and revoking physical access devices
- Records of device issuance and return
- Process for deactivating or recovering devices when personnel depart
- Records of lost device reports and response actions

## INTERVIEW
Assessors should interview personnel with the following roles:
- Facilities security personnel managing physical access devices
- HR personnel involved in onboarding/offboarding procedures
- Security officers overseeing access device management
Discussion topics: How are access badges issued and tracked? What happens when an employee leaves? What is the process for lost or stolen access devices?

## TEST
Assessors should test the following mechanisms:
- Verify access device inventory is maintained and current
- Test that departed employee access devices are deactivated promptly
- Confirm lost device procedure results in timely deactivation
- Review issuance records to confirm appropriate authorization for device issuance

## Key Indicators of Compliance
- All physical access devices inventoried and tracked to individuals
- Devices deactivated immediately upon employee departure or device loss
- Documented process for lost device response
- Periodic audit of access devices vs. authorized personnel list

## Common Findings / Deficiencies
- Former employee badges not deactivated in access control system
- No inventory of issued keys or key cards`,
  },
  {
    control_id: 'PE.L2-3.10.6',
    practice_id: 'PE.L2-3.10.6',
    domain_name: 'Physical Protection',
    title: 'PE.L2-3.10.6 — Alternate Work Site — Assessment Objectives',
    content: `# PE.L2-3.10.6 — Alternate Work Site — Assessment Objectives

**Domain:** Physical Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Enforce safeguarding measures for CUI at alternate work sites.

## EXAMINE
Assessors should examine the following types of evidence:
- Telework or alternate work site policy covering CUI handling
- Remote work security requirements documentation
- Training records for personnel working at alternate sites
- Requirements communicated to remote workers for physical CUI protection
- Remote work agreement or acknowledgment records

## INTERVIEW
Assessors should interview personnel with the following roles:
- Remote workers who handle CUI at alternate work sites
- Security officers defining alternate work site requirements
- HR personnel who administer telework agreements
Discussion topics: What physical security requirements apply at your home office? How do you protect paper CUI at alternate work sites? What is required for your home workstation?

## TEST
Assessors should test the following mechanisms:
- Review telework policy for specific CUI physical protection requirements
- Verify remote workers have acknowledged and been trained on alternate site requirements
- Confirm requirements address physical security (locking documents, screen privacy)
- Review whether remote work agreements include security requirements

## Key Indicators of Compliance
- Telework policy documents CUI protection requirements for alternate sites
- Remote workers trained on physical CUI protection at alternate locations
- Requirements include physical security of workstation and CUI documents
- Regular confirmation that remote workers maintain required safeguards

## Common Findings / Deficiencies
- Telework policy covering IT security but not addressing physical CUI protection
- No formal acknowledgment from remote workers of alternate site security requirements`,
  },
  // ── PERSONNEL SECURITY (PS) ────────────────────────────────────────────
  {
    control_id: 'PS.L2-3.9.1',
    practice_id: 'PS.L2-3.9.1',
    domain_name: 'Personnel Security',
    title: 'PS.L2-3.9.1 — Screen Individuals — Assessment Objectives',
    content: `# PS.L2-3.9.1 — Screen Individuals — Assessment Objectives

**Domain:** Personnel Security | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Screen individuals prior to authorizing access to organizational systems containing CUI.

## EXAMINE
Assessors should examine the following types of evidence:
- Personnel security screening policy
- Background check records for personnel with CUI access
- Onboarding procedures including screening requirements
- Records of screening for contractors and third parties with CUI access
- Screening requirements in vendor/contractor agreements

## INTERVIEW
Assessors should interview personnel with the following roles:
- HR personnel managing background screening programs
- Security officers overseeing personnel security requirements
- Hiring managers familiar with screening requirements for CUI roles
Discussion topics: What screening is conducted before granting CUI system access? Are contractors screened to the same standard as employees? How are screening results used in access decisions?

## TEST
Assessors should test the following mechanisms:
- Review sample personnel records to verify background screening prior to CUI access
- Confirm screening includes criminal background check at minimum
- Verify contractors with CUI access have equivalent screening
- Test that access is not granted until screening is completed and cleared

## Key Indicators of Compliance
- Background screening conducted for all individuals prior to CUI access authorization
- Screening appropriate for sensitivity of CUI handled
- Contractors and third parties subject to equivalent screening
- Screening documented and results retained

## Common Findings / Deficiencies
- Contractors with CUI access not screened to the same standard as employees
- Access granted provisionally before screening results are received`,
  },
  {
    control_id: 'PS.L2-3.9.2',
    practice_id: 'PS.L2-3.9.2',
    domain_name: 'Personnel Security',
    title: 'PS.L2-3.9.2 — Termination & Transfer — Assessment Objectives',
    content: `# PS.L2-3.9.2 — Termination & Transfer — Assessment Objectives

**Domain:** Personnel Security | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Ensure that CUI and organizational system access is terminated when employment or service is terminated or when access is no longer required.

## EXAMINE
Assessors should examine the following types of evidence:
- Offboarding procedures specifying access termination steps
- Records of access termination for departed employees
- HR-to-IT notification process for terminations
- Transfer procedures for employees changing roles
- Timeliness metrics for access termination

## INTERVIEW
Assessors should interview personnel with the following roles:
- HR personnel who initiate the termination process
- IT/IAM personnel who execute access termination
- Security officers overseeing access termination requirements
Discussion topics: How quickly is access terminated after an employee departs? How are role transfers handled to ensure old access is removed? What challenges exist with same-day termination?

## TEST
Assessors should test the following mechanisms:
- Review termination records and verify access was disabled on or before the last day
- Test that a recently terminated employee cannot access organizational systems
- Review role transfer records to confirm old access was removed when new role was assigned
- Verify all access types (physical, logical, VPN, cloud) are included in termination procedures

## Key Indicators of Compliance
- Access terminated on the last day of employment or immediately upon notification
- All access types (logical, physical, cloud) included in termination checklist
- Role transfers trigger access review and removal of no-longer-needed permissions
- Termination records document all access removed

## Common Findings / Deficiencies
- Active accounts found for employees who departed weeks or months ago
- Physical access badge deactivated but logical access (email, VPN) overlooked`,
  },
  // ── RISK ASSESSMENT (RA) ───────────────────────────────────────────────
  {
    control_id: 'RA.L2-3.11.1',
    practice_id: 'RA.L2-3.11.1',
    domain_name: 'Risk Assessment',
    title: 'RA.L2-3.11.1 — Risk Assessment — Assessment Objectives',
    content: `# RA.L2-3.11.1 — Risk Assessment — Assessment Objectives

**Domain:** Risk Assessment | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Periodically assess the risk to organizational operations, organizational assets, and individuals, resulting from the operation of organizational systems and the associated processing, storage, or transmission of CUI.

## EXAMINE
Assessors should examine the following types of evidence:
- Risk assessment policy and methodology documentation
- Completed risk assessment reports
- Risk register or risk tracking documentation
- Previous risk assessments showing trend over time
- Risk assessment schedule showing frequency

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security officers who lead or commission risk assessments
- Personnel who participate in risk assessment activities
- Management who review and accept risk assessment findings
Discussion topics: How often are risk assessments conducted? What methodology is used? How are assessment results used to make security investment decisions?

## TEST
Assessors should test the following mechanisms:
- Review most recent risk assessment for comprehensiveness
- Verify risk assessment covers CUI processing, storage, and transmission
- Confirm risk assessment results are acted upon
- Test that risk assessment frequency meets policy requirements

## Key Indicators of Compliance
- Risk assessments conducted periodically (at minimum annually)
- Assessment covers threats, vulnerabilities, and impact to CUI
- Findings documented in risk register with risk levels
- Risk assessment results drive security decisions and resource allocation

## Common Findings / Deficiencies
- Risk assessment conducted as a one-time activity without periodic updates
- Risk assessment limited to technical vulnerabilities without broader threat consideration`,
  },
  {
    control_id: 'RA.L2-3.11.2',
    practice_id: 'RA.L2-3.11.2',
    domain_name: 'Risk Assessment',
    title: 'RA.L2-3.11.2 — Vulnerability Scanning — Assessment Objectives',
    content: `# RA.L2-3.11.2 — Vulnerability Scanning — Assessment Objectives

**Domain:** Risk Assessment | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Scan for vulnerabilities in organizational systems and applications periodically and when new vulnerabilities affecting those systems are identified; remediate vulnerabilities in accordance with risk assessments.

## EXAMINE
Assessors should examine the following types of evidence:
- Vulnerability scanning policy specifying frequency and scope
- Recent vulnerability scan reports for all in-scope systems
- Vulnerability tracking and remediation records
- Remediation prioritization criteria based on risk
- Records showing scan coverage across all CUI system types

## INTERVIEW
Assessors should interview personnel with the following roles:
- Vulnerability management personnel who run and analyze scans
- System administrators who remediate identified vulnerabilities
- Security officers who define remediation timelines
Discussion topics: What vulnerability scanning tools are used? How frequently are scans performed? How are findings prioritized for remediation? What is the patch timeline for critical vulnerabilities?

## TEST
Assessors should test the following mechanisms:
- Review recent scan results and assess coverage of all in-scope systems
- Verify remediation of critical and high vulnerabilities within defined timeframes
- Test that ad hoc scanning occurs when new critical vulnerabilities are disclosed
- Confirm authenticated scanning is used for more thorough detection

## Key Indicators of Compliance
- Regular vulnerability scans performed (at minimum monthly for high-risk systems)
- All in-scope systems included in scanning
- Critical vulnerabilities remediated within defined timeframes (e.g., 30 days)
- Results tracked and remediation verified

## Common Findings / Deficiencies
- Vulnerability scans conducted but results not tracked or remediated
- Scanning coverage gaps — cloud workloads or new systems not included`,
  },
  {
    control_id: 'RA.L2-3.11.3',
    practice_id: 'RA.L2-3.11.3',
    domain_name: 'Risk Assessment',
    title: 'RA.L2-3.11.3 — Vulnerability Remediation — Assessment Objectives',
    content: `# RA.L2-3.11.3 — Vulnerability Remediation — Assessment Objectives

**Domain:** Risk Assessment | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Remediate vulnerabilities in accordance with risk assessments.

## EXAMINE
Assessors should examine the following types of evidence:
- Remediation policy with defined timelines by severity
- Vulnerability tracking records showing remediation progress
- Patch management records
- Risk acceptance documentation for vulnerabilities not immediately remediated
- Remediation verification records

## INTERVIEW
Assessors should interview personnel with the following roles:
- Vulnerability management personnel tracking remediation
- System administrators performing patching and remediation
- Security officers who prioritize and accept risk for unmitigated vulnerabilities
Discussion topics: What are the remediation timelines by severity? How are exceptions to remediation timelines handled? How is remediation effectiveness verified?

## TEST
Assessors should test the following mechanisms:
- Review open vulnerabilities and verify remediation timelines are being met
- Confirm critical vulnerabilities have been remediated or have accepted risk documentation
- Test that remediation verification occurs after patching (rescan to confirm fix)
- Verify risk acceptance for open vulnerabilities is documented and reviewed

## Key Indicators of Compliance
- Risk-based remediation timelines defined and enforced
- Vulnerability tracking system shows current state with remediation status
- Risk acceptance documented for vulnerabilities not remediated within timeline
- Post-remediation verification through rescanning

## Common Findings / Deficiencies
- Large backlog of critical and high vulnerabilities with no remediation tracking
- Vulnerabilities patched but not rescanned to verify effectiveness`,
  },
  // ── SYSTEM & SERVICES ACQUISITION (SA maps to CA in CMMC numbering, use SA prefix) ──
  {
    control_id: 'SA.L2-3.12.1',
    practice_id: 'SA.L2-3.12.1',
    domain_name: 'System and Services Acquisition',
    title: 'SA.L2-3.12.1 — Security Engineering Principles — Assessment Objectives',
    content: `# SA.L2-3.12.1 — Security Engineering Principles — Assessment Objectives

**Domain:** System and Services Acquisition | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ system security engineering principles in the specification, design, development, implementation, and modification of the system.

## EXAMINE
Assessors should examine the following types of evidence:
- System development lifecycle (SDLC) documentation incorporating security
- Security requirements specifications for systems and applications
- Architecture and design review records
- Secure coding standards and development guidelines
- Security testing results from development and pre-deployment phases

## INTERVIEW
Assessors should interview personnel with the following roles:
- System developers and architects who design CUI systems
- Security personnel who review system designs
- Project managers overseeing development activities
Discussion topics: How is security incorporated into new system development? Are security requirements defined at the start of projects? How are security reviews conducted during development?

## TEST
Assessors should test the following mechanisms:
- Review SDLC documentation for security integration points
- Verify security requirements are defined for systems handling CUI
- Confirm architecture/design reviews include security evaluation
- Test that security testing occurs before deployment

## Key Indicators of Compliance
- Security integrated throughout the SDLC (not just at deployment)
- Security requirements defined and traceable through development
- Design reviews include security architecture evaluation
- Security testing performed before systems go into production

## Common Findings / Deficiencies
- Security treated as an afterthought addressed only before deployment
- No formal security review of system designs or architectures`,
  },
  {
    control_id: 'SA.L2-3.12.2',
    practice_id: 'SA.L2-3.12.2',
    domain_name: 'System and Services Acquisition',
    title: 'SA.L2-3.12.2 — Supply Chain Risk Management — Assessment Objectives',
    content: `# SA.L2-3.12.2 — Supply Chain Risk Management — Assessment Objectives

**Domain:** System and Services Acquisition | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Develop and implement plans and controls to manage the risks associated with the supply chain for the organizational system.

## EXAMINE
Assessors should examine the following types of evidence:
- Supply chain risk management (SCRM) policy and procedures
- Vendor risk assessment records
- Supplier security requirements in contracts and agreements
- SCRM plan documentation
- Records of supplier security evaluations or audits

## INTERVIEW
Assessors should interview personnel with the following roles:
- Procurement personnel who manage vendor relationships
- Security officers overseeing supply chain risk
- Legal/contracts personnel who include security requirements in contracts
Discussion topics: How are supplier security risks assessed before procurement? What security requirements are placed on suppliers? How are supply chain risks monitored ongoing?

## TEST
Assessors should test the following mechanisms:
- Review vendor contracts for security requirements and right-to-audit clauses
- Verify that critical suppliers have been assessed for security risk
- Confirm SCRM plan addresses key supply chain risks for CUI systems
- Test that supplier security assessments are conducted periodically

## Key Indicators of Compliance
- SCRM plan documented addressing supply chain risks for CUI systems
- Security requirements included in supplier contracts
- Critical suppliers assessed for security risk
- Supply chain risks tracked and reviewed regularly

## Common Findings / Deficiencies
- No formal SCRM plan — supply chain risk handled informally
- Supplier contracts lacking security requirements or audit rights`,
  },
  {
    control_id: 'SA.L2-3.12.3',
    practice_id: 'SA.L2-3.12.3',
    domain_name: 'System and Services Acquisition',
    title: 'SA.L2-3.12.3 — Develop and Implement SCRM Plans — Assessment Objectives',
    content: `# SA.L2-3.12.3 — Develop and Implement SCRM Plans — Assessment Objectives

**Domain:** System and Services Acquisition | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Develop, document, and implement a supply chain risk management plan.

## EXAMINE
Assessors should examine the following types of evidence:
- Documented SCRM plan with implementation evidence
- Risk identification for supply chain threats
- Mitigation strategies documented in the SCRM plan
- Implementation records showing plan activities have been carried out
- SCRM plan review and update history

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security or program officers responsible for SCRM plan implementation
- Procurement personnel aware of and implementing SCRM requirements
Discussion topics: What supply chain risks were identified in the SCRM plan? What mitigations have been implemented? How is the SCRM plan maintained and updated?

## TEST
Assessors should test the following mechanisms:
- Review SCRM plan for completeness and implementation evidence
- Verify that identified mitigations have been implemented
- Confirm plan is reviewed and updated periodically
- Test that SCRM plan covers all critical supply chain elements for CUI systems

## Key Indicators of Compliance
- SCRM plan documented and approved by appropriate authority
- Implementation evidence shows plan is operational, not just documented
- Plan updated when supply chain changes or new risks identified
- SCRM activities integrated into procurement and vendor management processes

## Common Findings / Deficiencies
- SCRM plan created to satisfy requirement but not actively implemented
- Plan does not address specific supply chain risks relevant to the organization`,
  },
  {
    control_id: 'SA.L2-3.12.4',
    practice_id: 'SA.L2-3.12.4',
    domain_name: 'System and Services Acquisition',
    title: 'SA.L2-3.12.4 — Tamper Resistance and Detection — Assessment Objectives',
    content: `# SA.L2-3.12.4 — Tamper Resistance and Detection — Assessment Objectives

**Domain:** System and Services Acquisition | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ physical and technical measures to detect tampering with the hardware components of organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Tamper-evident seals or tape on critical hardware
- Hardware integrity verification procedures
- Receiving inspection procedures for hardware acquisitions
- Records of tamper detection events or anomalies
- Secure hardware storage procedures

## INTERVIEW
Assessors should interview personnel with the following roles:
- IT personnel who receive and install hardware
- Security officers overseeing hardware security
Discussion topics: How is hardware inspected for tampering when received? How are tamper-evident seals used and checked? What would you do if you detected signs of hardware tampering?

## TEST
Assessors should test the following mechanisms:
- Inspect critical hardware for tamper-evident seals
- Review receiving inspection procedures for hardware
- Verify that hardware anomalies are reported as potential incidents
- Confirm secure storage for hardware before installation

## Key Indicators of Compliance
- Tamper-evident controls applied to critical hardware components
- Hardware inspected for tampering upon receipt
- Suspected tampering treated as security incident requiring investigation
- Secure chain of custody for hardware from procurement to installation

## Common Findings / Deficiencies
- No tamper-evident controls on critical hardware
- Hardware received and deployed without any integrity inspection`,
  },
  // ── SYSTEM & COMMUNICATIONS PROTECTION (SC) ───────────────────────────
  {
    control_id: 'SC.L2-3.13.1',
    practice_id: 'SC.L2-3.13.1',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.1 — Boundary Protection — Assessment Objectives',
    content: `# SC.L2-3.13.1 — Boundary Protection — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Monitor, control, and protect communications at the external boundaries and key internal boundaries of organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Network architecture diagrams showing boundary controls
- Firewall and IDS/IPS configurations at network boundaries
- Policy for boundary protection
- Boundary device logs and monitoring records
- Records of boundary control testing

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network security engineers managing boundary controls
- Security officers overseeing boundary protection strategy
Discussion topics: What boundary protection devices are in place? How are they configured and monitored? How are internal boundaries (DMZ, CUI zone) protected?

## TEST
Assessors should test the following mechanisms:
- Review firewall configurations at external boundaries
- Test that traffic flowing through boundaries is inspected
- Verify internal network segmentation isolates CUI systems
- Confirm boundary devices are logging and alerts are configured

## Key Indicators of Compliance
- Firewalls/IDS/IPS deployed at external and key internal boundaries
- Boundary device configurations reviewed and hardened
- Traffic inspected for malicious content at boundaries
- Boundary protection monitored continuously

## Common Findings / Deficiencies
- Flat network with no segmentation of CUI systems from general IT
- Boundary devices present but not actively monitored`,
  },
  {
    control_id: 'SC.L2-3.13.2',
    practice_id: 'SC.L2-3.13.2',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.2 — Security Engineering — Assessment Objectives',
    content: `# SC.L2-3.13.2 — Security Engineering — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ architectural designs, software development techniques, and systems engineering principles that promote effective information security within organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- System architecture documentation incorporating security principles
- Secure-by-design or defense-in-depth documentation
- Software development security standards
- Architecture review records demonstrating security evaluation
- Design patterns showing security controls (least privilege, fail-safe defaults)

## INTERVIEW
Assessors should interview personnel with the following roles:
- System architects who design CUI-processing systems
- Developers following secure coding standards
- Security officers who review architectures
Discussion topics: What security design principles guide architecture decisions? Is defense-in-depth applied? How are security controls validated during design?

## TEST
Assessors should test the following mechanisms:
- Review system architectures for application of security design principles
- Verify defense-in-depth is evident (multiple control layers)
- Confirm fail-safe defaults are implemented (deny-by-default)
- Test that security is validated as part of architecture review

## Key Indicators of Compliance
- Security principles (least privilege, fail-safe defaults, defense-in-depth) evident in architecture
- Architecture reviews include security evaluation
- Secure coding standards defined and followed
- Security design principles documented and enforced

## Common Findings / Deficiencies
- Systems designed for functionality with security bolted on afterward
- No architecture review process that includes security evaluation`,
  },
  {
    control_id: 'SC.L2-3.13.3',
    practice_id: 'SC.L2-3.13.3',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.3 — Role Separation — Assessment Objectives',
    content: `# SC.L2-3.13.3 — Role Separation — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Separate user functionality (including user interface services) from system management functionality.

## EXAMINE
Assessors should examine the following types of evidence:
- System architecture showing separation of user and management interfaces
- Configuration preventing access to management interfaces from user-facing systems
- Network segmentation separating management networks from user networks
- Access controls restricting management functionality to administrative accounts

## INTERVIEW
Assessors should interview personnel with the following roles:
- System architects who designed management plane separation
- Network administrators managing dedicated management networks
- Security officers overseeing management interface controls
Discussion topics: How are management interfaces separated from user interfaces? Is there a dedicated management network? How are management protocols restricted?

## TEST
Assessors should test the following mechanisms:
- Verify management interfaces are not accessible from standard user workstations
- Test that management protocols (SSH, RDP admin, SNMP) are restricted to management networks
- Confirm user-facing applications do not expose management functionality
- Review network segmentation for management network isolation

## Key Indicators of Compliance
- Management interfaces on separate networks or VLANs from user systems
- Administrative access restricted to dedicated management channels
- User-facing systems cannot reach management interfaces
- Management plane access logged separately

## Common Findings / Deficiencies
- Web-based admin consoles accessible from general user network
- Management protocols reachable from any workstation on the network`,
  },
  {
    control_id: 'SC.L2-3.13.4',
    practice_id: 'SC.L2-3.13.4',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.4 — Shared Resource Control — Assessment Objectives',
    content: `# SC.L2-3.13.4 — Shared Resource Control — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Prevent unauthorized and unintended information transfer via shared system resources.

## EXAMINE
Assessors should examine the following types of evidence:
- System configuration preventing information leakage through shared resources
- Memory and storage isolation configurations
- Controls preventing covert channel communication
- Virtualization security configurations for shared environments

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing shared computing resources
- Security architects who designed isolation controls
Discussion topics: How are shared resources (memory, storage, CPU) protected from cross-tenant or cross-user information leakage? Are hypervisor-level isolation controls in place for virtualized environments?

## TEST
Assessors should test the following mechanisms:
- Verify memory is zeroed between uses by different users/processes
- Test virtualization isolation to confirm cross-VM information access is prevented
- Review shared storage configurations for access control enforcement
- Confirm that shared resources do not retain data from previous users

## Key Indicators of Compliance
- Shared resources implement isolation preventing cross-user information access
- Virtualization environments configured with appropriate isolation
- Memory zeroing or equivalent implemented for shared compute resources
- Shared storage controlled with strict access management

## Common Findings / Deficiencies
- Virtualized environments without adequate inter-VM isolation configurations
- Shared file systems without access controls preventing cross-user data access`,
  },
  {
    control_id: 'SC.L2-3.13.5',
    practice_id: 'SC.L2-3.13.5',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.5 — Public-Access System Separation — Assessment Objectives',
    content: `# SC.L2-3.13.5 — Public-Access System Separation — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks.

## EXAMINE
Assessors should examine the following types of evidence:
- Network architecture documentation showing DMZ or equivalent
- Firewall rules enforcing separation between public-facing and internal networks
- Configuration of public-facing servers and their network placement
- Network diagrams showing public and private network segments

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network architects who designed the DMZ or segmentation
- Network administrators managing public-facing systems
- Security officers overseeing network separation requirements
Discussion topics: How are public-facing systems isolated from internal CUI systems? What prevents a compromised public system from accessing internal CUI?

## TEST
Assessors should test the following mechanisms:
- Verify public-facing systems are in a DMZ or separate network segment
- Test that DMZ systems cannot directly access internal CUI systems
- Review firewall rules between DMZ and internal networks
- Confirm CUI is not stored on or accessible from public-facing systems

## Key Indicators of Compliance
- Public-facing systems in DMZ or equivalent isolated segment
- Firewall rules prevent direct DMZ-to-internal-CUI access
- CUI not reachable from compromised public systems without additional controls
- Network architecture reviewed regularly for separation adequacy

## Common Findings / Deficiencies
- Public-facing web servers on the same network segment as internal CUI systems
- DMZ exists but firewall rules allow direct access from DMZ to CUI network`,
  },
  {
    control_id: 'SC.L2-3.13.6',
    practice_id: 'SC.L2-3.13.6',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.6 — Deny by Default — Assessment Objectives',
    content: `# SC.L2-3.13.6 — Deny by Default — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Deny network communications traffic by default and allow network communications traffic by exception (i.e., deny all, permit by exception).

## EXAMINE
Assessors should examine the following types of evidence:
- Firewall rule sets showing default-deny posture
- Policy requiring deny-all-permit-by-exception approach
- Documentation of approved traffic flows and their justifications
- Network access control configurations

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators managing firewall rule sets
- Security officers overseeing network traffic policy
Discussion topics: Is the default posture deny-all? How are new traffic flows approved? How often are firewall rules reviewed for necessity?

## TEST
Assessors should test the following mechanisms:
- Review firewall configurations to confirm explicit deny-all as the default rule
- Test that traffic not explicitly permitted is blocked
- Review approved rules for documentation of business justification
- Verify firewall rules are periodically reviewed and unnecessary rules removed

## Key Indicators of Compliance
- Firewall rules end with explicit deny-all
- All permitted traffic has documented business justification
- Periodic firewall rule review removes unnecessary or outdated rules
- Network traffic monitoring detects attempts to use blocked flows

## Common Findings / Deficiencies
- Firewall with permit-all default and only specific deny rules (inverse approach)
- Large number of overly permissive rules that effectively negate deny-by-default intent`,
  },
  {
    control_id: 'SC.L2-3.13.7',
    practice_id: 'SC.L2-3.13.7',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.7 — Split Tunneling — Assessment Objectives',
    content: `# SC.L2-3.13.7 — Split Tunneling — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Prevent remote devices from simultaneously connecting to the system using a VPN (or similar secure connection) and communicating via some other connection to resources in non-organizational networks (i.e., split tunneling).

## EXAMINE
Assessors should examine the following types of evidence:
- VPN configuration showing split tunneling settings
- Remote access policy regarding split tunneling
- Network diagrams showing expected traffic routing for remote users
- Testing records demonstrating split tunneling is disabled

## INTERVIEW
Assessors should interview personnel with the following roles:
- VPN/remote access administrators managing tunnel configurations
- Security officers who defined split tunneling policy
Discussion topics: Is split tunneling disabled? Why or why not? If enabled, what controls mitigate the risk? How is policy enforced technically?

## TEST
Assessors should test the following mechanisms:
- Connect via VPN and attempt to access an internet resource directly (not through VPN)
- Review VPN client configuration for split tunneling settings
- Test that all traffic routes through the VPN when connected
- Verify there are no exceptions that allow split tunneling

## Key Indicators of Compliance
- Split tunneling disabled on all VPN configurations
- All remote user traffic routed through organizational network when on VPN
- Policy explicitly prohibits split tunneling
- Technical enforcement prevents user from enabling split tunneling

## Common Findings / Deficiencies
- Split tunneling enabled to reduce VPN load without adequate compensating controls
- Split tunneling disabled in policy but not enforced in VPN client configuration`,
  },
  {
    control_id: 'SC.L2-3.13.8',
    practice_id: 'SC.L2-3.13.8',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.8 — Data in Transit — Assessment Objectives',
    content: `# SC.L2-3.13.8 — Data in Transit — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission unless otherwise protected by alternative physical safeguards.

## EXAMINE
Assessors should examine the following types of evidence:
- Encryption policy for data in transit
- TLS configurations for web services and APIs
- VPN configurations for encrypted network tunnels
- Documentation of approved cryptographic algorithms for transit protection
- Scan results for unencrypted CUI transmission

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators managing encryption for data in transit
- Developers implementing TLS in applications
- Security officers verifying transit encryption compliance
Discussion topics: What encryption is used to protect CUI during transmission? How is compliance with transit encryption requirements verified? Are any legacy systems transmitting CUI without encryption?

## TEST
Assessors should test the following mechanisms:
- Perform traffic capture and verify CUI is not transmitted in clear text
- Run SSL/TLS scans against all web services handling CUI
- Verify email encryption for CUI transmitted via email
- Test that internal CUI communication uses encrypted channels

## Key Indicators of Compliance
- All CUI transmitted over networks protected with strong encryption (TLS 1.2+, AES-256)
- No unencrypted CUI transmission paths exist
- Encryption standard meets FIPS requirements
- Regular verification that transit encryption is functioning correctly

## Common Findings / Deficiencies
- Internal network communication of CUI unencrypted with reliance on network perimeter only
- TLS deployed but older versions (1.0/1.1) still enabled`,
  },
  {
    control_id: 'SC.L2-3.13.9',
    practice_id: 'SC.L2-3.13.9',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.9 — Terminate Connections — Assessment Objectives',
    content: `# SC.L2-3.13.9 — Terminate Connections — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Terminate network connections after a defined period of inactivity.

## EXAMINE
Assessors should examine the following types of evidence:
- Network session timeout configurations on firewalls and load balancers
- Application session timeout settings
- Policy defining connection termination periods
- Network device configurations for connection management

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators managing connection timeout settings
- Application developers who configure session management
- Security officers defining connection termination policy
Discussion topics: What inactivity timeout is configured for network connections? How does this apply to different connection types? How are connections terminated vs. just locked?

## TEST
Assessors should test the following mechanisms:
- Leave a network session idle and verify it is terminated after the defined period
- Review firewall and network device configurations for connection timeout settings
- Test application session timeouts and confirm connections are terminated
- Verify timeout settings are appropriate for the sensitivity of data handled

## Key Indicators of Compliance
- Network connections terminated after defined inactivity period
- Timeout policy defined and technically enforced across all systems
- Both application and network-level timeouts configured
- Timeout periods appropriate to risk (shorter for more sensitive access)

## Common Findings / Deficiencies
- Session lock implemented but network connection not actually terminated
- No network-level connection timeout configured on firewalls`,
  },
  {
    control_id: 'SC.L2-3.13.10',
    practice_id: 'SC.L2-3.13.10',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.10 — Key Management — Assessment Objectives',
    content: `# SC.L2-3.13.10 — Key Management — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Establish and manage cryptographic keys for required cryptography employed in organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Cryptographic key management policy and procedures
- Key lifecycle documentation (generation, distribution, storage, rotation, destruction)
- Certificate management records and inventory
- Key storage security (HSM use, encrypted key stores)
- Key rotation schedule and records

## INTERVIEW
Assessors should interview personnel with the following roles:
- Personnel responsible for cryptographic key management
- System administrators managing certificates and keys
- Security officers overseeing cryptographic standards
Discussion topics: How are cryptographic keys generated and stored? How often are keys rotated? What happens when a key is compromised?

## TEST
Assessors should test the following mechanisms:
- Review key management procedures for lifecycle coverage
- Verify keys are stored securely (HSM, encrypted key store)
- Confirm key rotation has occurred per scheduled intervals
- Test that key compromise response procedure exists and is documented

## Key Indicators of Compliance
- Cryptographic key management policy covers full key lifecycle
- Keys stored in hardware security modules or equivalent secure storage
- Keys rotated on defined schedule
- Compromise response procedure defined and tested

## Common Findings / Deficiencies
- Cryptographic keys stored in plaintext configuration files or scripts
- No documented key rotation schedule or records of rotation`,
  },
  {
    control_id: 'SC.L2-3.13.11',
    practice_id: 'SC.L2-3.13.11',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.11 — CUI Encryption — Assessment Objectives',
    content: `# SC.L2-3.13.11 — CUI Encryption — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ FIPS-validated cryptography when used to protect the confidentiality of CUI.

## EXAMINE
Assessors should examine the following types of evidence:
- Documentation of cryptographic modules used to protect CUI
- FIPS 140-2/140-3 validation certificates for cryptographic modules
- Encryption configurations for systems storing or transmitting CUI
- System security plan sections addressing cryptographic requirements

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security architects who specified encryption requirements
- System administrators implementing encryption
- Security officers verifying FIPS compliance
Discussion topics: What cryptographic modules are used to protect CUI? Are they FIPS 140-2 or 140-3 validated? How is FIPS validation verified for third-party products?

## TEST
Assessors should test the following mechanisms:
- Review cryptographic module documentation for FIPS validation status
- Verify FIPS mode is enabled in operating systems and applications where applicable
- Confirm encryption implementations use FIPS-validated algorithms
- Test that non-FIPS cryptographic implementations are not used for CUI protection

## Key Indicators of Compliance
- FIPS 140-2 or 140-3 validated modules used for all CUI encryption
- FIPS mode enabled in operating system and application configurations
- Validation certificates obtainable for all cryptographic modules in use
- Third-party products verified for FIPS compliance before procurement

## Common Findings / Deficiencies
- Encryption using non-FIPS validated open-source libraries for CUI protection
- FIPS 140-2 required but systems running in non-FIPS mode`,
  },
  {
    control_id: 'SC.L2-3.13.12',
    practice_id: 'SC.L2-3.13.12',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.12 — Collaborative Computing — Assessment Objectives',
    content: `# SC.L2-3.13.12 — Collaborative Computing — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Prohibit remote activation of collaborative computing devices and provide indication of use to present users.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy on collaborative computing device usage (cameras, microphones, screen sharing)
- Technical configurations preventing remote activation
- User guidance on collaborative computing security
- Physical indicators required for collaborative computing device use

## INTERVIEW
Assessors should interview personnel with the following roles:
- IT personnel who manage collaborative computing tools
- Security officers defining collaborative computing policy
- End users who use video conferencing and collaboration tools
Discussion topics: How are cameras and microphones controlled? Can they be activated remotely without user knowledge? Are indicators provided when these devices are active?

## TEST
Assessors should test the following mechanisms:
- Verify cameras and microphones cannot be activated without user knowledge or consent
- Confirm that indicator lights or software indicators show when devices are active
- Test collaborative tool configurations to ensure remote activation is not possible without user approval
- Review policy and training on collaborative computing security

## Key Indicators of Compliance
- Collaborative computing devices require active user consent to activate
- Visual or audible indicators provided when cameras/microphones are active
- Remote activation without user knowledge is prevented
- Policy covers approved collaborative computing tools and their security requirements

## Common Findings / Deficiencies
- No controls preventing unauthorized remote activation of cameras and microphones
- Collaborative software configurations allow microphone activation without visible indicator`,
  },
  {
    control_id: 'SC.L2-3.13.13',
    practice_id: 'SC.L2-3.13.13',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.13 — Mobile Code — Assessment Objectives',
    content: `# SC.L2-3.13.13 — Mobile Code — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control and monitor the use of mobile code.

## EXAMINE
Assessors should examine the following types of evidence:
- Mobile code policy defining approved and prohibited code types
- Browser and endpoint configurations controlling mobile code execution
- Web filtering or proxy configurations blocking unauthorized mobile code
- Application control settings for script execution

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators configuring browser and endpoint mobile code controls
- Security officers defining mobile code policy
Discussion topics: What types of mobile code are permitted? How is mobile code execution controlled? How is unauthorized mobile code detected and blocked?

## TEST
Assessors should test the following mechanisms:
- Review browser configurations for mobile code restrictions (JavaScript restrictions for high-risk sites, ActiveX disabled)
- Test web filtering for detection and blocking of malicious mobile code
- Verify endpoint security controls restrict execution of unauthorized mobile code
- Confirm approved mobile code types are documented

## Key Indicators of Compliance
- Policy defines permitted and prohibited mobile code types
- Technical controls enforce mobile code policy on endpoints and at network boundary
- Mobile code execution monitored and anomalies investigated
- High-risk mobile code types (ActiveX, unsigned scripts) restricted or disabled

## Common Findings / Deficiencies
- No technical controls on mobile code execution — all code executes without restriction
- Mobile code policy defined but not technically enforced`,
  },
  {
    control_id: 'SC.L2-3.13.14',
    practice_id: 'SC.L2-3.13.14',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.14 — VoIP Controls — Assessment Objectives',
    content: `# SC.L2-3.13.14 — VoIP Controls — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control and monitor the use of Voice over Internet Protocol (VoIP) technologies.

## EXAMINE
Assessors should examine the following types of evidence:
- VoIP policy and authorization documentation
- VoIP system security configurations
- Network segmentation for VoIP traffic
- VoIP encryption configuration
- Monitoring configurations for VoIP infrastructure

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators managing VoIP infrastructure
- Security officers overseeing VoIP security requirements
Discussion topics: How is VoIP traffic secured and segmented? Is VoIP encrypted? How is unauthorized VoIP use detected?

## TEST
Assessors should test the following mechanisms:
- Review VoIP network configuration for segmentation from CUI networks
- Verify VoIP encryption is enabled
- Test that unauthorized VoIP clients cannot be connected
- Confirm VoIP infrastructure is monitored for unauthorized access

## Key Indicators of Compliance
- VoIP traffic segmented from CUI processing networks
- VoIP communications encrypted
- Unauthorized VoIP systems detected and blocked
- VoIP infrastructure monitored for security events

## Common Findings / Deficiencies
- VoIP on the same network segment as CUI systems without segregation
- VoIP traffic not encrypted leaving conversations susceptible to eavesdropping`,
  },
  {
    control_id: 'SC.L2-3.13.15',
    practice_id: 'SC.L2-3.13.15',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.15 — Communications Authenticity — Assessment Objectives',
    content: `# SC.L2-3.13.15 — Communications Authenticity — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Protect the authenticity of communications sessions.

## EXAMINE
Assessors should examine the following types of evidence:
- Authentication mechanisms for communication sessions (TLS client auth, digital signatures)
- Session management configurations preventing hijacking
- Anti-replay protections in communication protocols
- Documentation of approved protocols protecting session authenticity

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network architects who designed communication security
- Application developers implementing session management
- Security officers overseeing communications authenticity requirements
Discussion topics: How are communication sessions authenticated to prevent spoofing or hijacking? What mechanisms protect session authenticity?

## TEST
Assessors should test the following mechanisms:
- Test for session fixation vulnerabilities in web applications
- Verify TLS with server authentication to confirm client is connecting to legitimate server
- Test that sessions cannot be hijacked through token theft
- Verify digital signatures or MACs protect critical communications

## Key Indicators of Compliance
- Communication sessions authenticated using certificates or equivalent
- Session tokens generated securely and protected from theft
- Anti-CSRF protections in web applications
- Communications integrity protected against tampering

## Common Findings / Deficiencies
- Web applications with session fixation vulnerabilities
- Communication sessions without integrity protection enabling man-in-the-middle attacks`,
  },
  {
    control_id: 'SC.L2-3.13.16',
    practice_id: 'SC.L2-3.13.16',
    domain_name: 'System and Communications Protection',
    title: 'SC.L2-3.13.16 — CUI at Rest — Assessment Objectives',
    content: `# SC.L2-3.13.16 — CUI at Rest — Assessment Objectives

**Domain:** System and Communications Protection | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Protect the confidentiality of CUI at rest.

## EXAMINE
Assessors should examine the following types of evidence:
- Encryption-at-rest configurations for servers, workstations, and databases
- Database encryption configurations for CUI data stores
- Cloud storage encryption configurations
- Documentation of approved encryption for data at rest
- Full disk encryption deployment records

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing storage encryption
- Database administrators managing data-at-rest protection
- Security officers verifying at-rest encryption compliance
Discussion topics: How is CUI encrypted at rest? What encryption is used for databases containing CUI? How is encryption verified and monitored?

## TEST
Assessors should test the following mechanisms:
- Review full disk encryption deployment on all workstations and servers
- Verify database encryption is enabled for databases containing CUI
- Confirm cloud storage encryption is enabled and customer-managed keys are used where appropriate
- Test that encryption keys are not stored alongside encrypted data

## Key Indicators of Compliance
- All CUI encrypted at rest using FIPS-validated algorithms (AES-256)
- Full disk encryption on all endpoints storing CUI
- Database-level encryption for CUI data stores
- Encryption verified through compliance scanning

## Common Findings / Deficiencies
- Full disk encryption not deployed on servers or workstations storing CUI
- Database CUI not encrypted — relying only on access controls for protection`,
  },
  // ── SYSTEM & INFORMATION INTEGRITY (SI) ───────────────────────────────
  {
    control_id: 'SI.L2-3.14.1',
    practice_id: 'SI.L2-3.14.1',
    domain_name: 'System and Information Integrity',
    title: 'SI.L2-3.14.1 — Flaw Remediation — Assessment Objectives',
    content: `# SI.L2-3.14.1 — Flaw Remediation — Assessment Objectives

**Domain:** System and Information Integrity | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Identify, report, and correct information and system flaws in a timely manner; test software and firmware updates related to flaw remediation for effectiveness and potential side effects before installation; install security-relevant software updates within a defined time period.

## EXAMINE
Assessors should examine the following types of evidence:
- Patch management policy with defined remediation timeframes
- Patch deployment records for operating systems and applications
- Vulnerability scan results showing patch compliance levels
- Change management records for security updates
- Testing procedures for patch testing before deployment

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators responsible for patch management
- Security officers defining patch timelines and policies
Discussion topics: What is the patching schedule and timeline for critical patches? How are patches tested before deployment? How is patch compliance monitored?

## TEST
Assessors should test the following mechanisms:
- Review patch compliance reports for all in-scope systems
- Verify critical patches are deployed within defined timeframes
- Confirm patch testing procedure exists and is followed
- Test that systems are scanning for missing patches automatically

## Key Indicators of Compliance
- Patch management policy with defined timelines (critical: 30 days, high: 60 days)
- Automated patch compliance monitoring across all in-scope systems
- Patches tested before broad deployment where feasible
- Patch compliance metrics reviewed by management

## Common Findings / Deficiencies
- Critical vulnerabilities with patches available but not deployed within acceptable timeframes
- No automated patch compliance monitoring — patching tracked manually`,
  },
  {
    control_id: 'SI.L2-3.14.2',
    practice_id: 'SI.L2-3.14.2',
    domain_name: 'System and Information Integrity',
    title: 'SI.L2-3.14.2 — Malicious Code Protection — Assessment Objectives',
    content: `# SI.L2-3.14.2 — Malicious Code Protection — Assessment Objectives

**Domain:** System and Information Integrity | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Provide protection from malicious code at appropriate locations within organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Anti-malware deployment records and coverage reports
- Anti-malware configuration (real-time scanning, scheduled scans, definition updates)
- Endpoint detection and response (EDR) deployment records
- Email and web gateway scanning configurations
- Anti-malware detection and response records

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing anti-malware tools
- Security operations personnel monitoring malware detections
- Security officers overseeing malicious code protection strategy
Discussion topics: What anti-malware tools are deployed? Where are they deployed (endpoints, email gateway, web gateway)? How often are definitions updated? How are detections handled?

## TEST
Assessors should test the following mechanisms:
- Verify anti-malware is deployed on all endpoints and servers
- Confirm definitions are updated at least daily
- Test real-time scanning is enabled and operational
- Review detection logs and verify response procedures were followed

## Key Indicators of Compliance
- Anti-malware deployed on all endpoints, servers, and at email/web gateways
- Definitions updated automatically, at minimum daily
- Real-time scanning enabled across all systems
- Detections logged, alerted, and responded to per documented procedure

## Common Findings / Deficiencies
- Anti-malware deployed but definitions not updating due to connectivity or configuration issues
- Coverage gaps — Linux servers or cloud workloads lacking malware protection`,
  },
  {
    control_id: 'SI.L2-3.14.3',
    practice_id: 'SI.L2-3.14.3',
    domain_name: 'System and Information Integrity',
    title: 'SI.L2-3.14.3 — Security Alerts — Assessment Objectives',
    content: `# SI.L2-3.14.3 — Security Alerts — Assessment Objectives

**Domain:** System and Information Integrity | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Monitor organizational systems, including the security of information systems and supporting infrastructure, and report on threats, vulnerabilities, and security-relevant events.

## EXAMINE
Assessors should examine the following types of evidence:
- Security monitoring policy and procedures
- Security alerting configurations (SIEM, IDS/IPS, EDR)
- Threat intelligence subscription records
- Records of alerts received, investigated, and resolved
- Reporting structure for security-relevant events

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security operations or monitoring personnel
- Security officers overseeing the monitoring and alerting program
Discussion topics: What monitoring tools are in place? How are security alerts handled? How is threat intelligence incorporated? How quickly are alerts investigated?

## TEST
Assessors should test the following mechanisms:
- Review SIEM or monitoring tool configuration for comprehensive coverage
- Verify security alerts are received and tracked
- Test alert response time for recent alerts
- Confirm security monitoring covers all CUI systems

## Key Indicators of Compliance
- Comprehensive security monitoring covering all CUI systems
- Alerts generated for security-relevant events and investigated promptly
- Threat intelligence incorporated to improve detection coverage
- Security monitoring results reported to management regularly

## Common Findings / Deficiencies
- Security monitoring tools deployed but no one actively monitoring alerts
- Monitoring limited to perimeter with no visibility into internal systems`,
  },
  {
    control_id: 'SI.L2-3.14.4',
    practice_id: 'SI.L2-3.14.4',
    domain_name: 'System and Information Integrity',
    title: 'SI.L2-3.14.4 — Update Malicious Code Protection — Assessment Objectives',
    content: `# SI.L2-3.14.4 — Update Malicious Code Protection — Assessment Objectives

**Domain:** System and Information Integrity | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Update malicious code protection mechanisms when new releases are available.

## EXAMINE
Assessors should examine the following types of evidence:
- Anti-malware update policy and procedures
- Records showing anti-malware engine and definition update frequency
- Configuration of automatic update mechanisms
- Monitoring records showing update compliance across fleet

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing anti-malware updates
- Security officers overseeing malware protection currency
Discussion topics: How frequently are anti-malware definitions and engines updated? Is updating automated? How is update compliance monitored across the fleet?

## TEST
Assessors should test the following mechanisms:
- Review definition version dates on a sample of systems to confirm currency
- Verify automatic update configuration is enabled
- Confirm update failures are detected and remediated promptly
- Test that newly released engine versions are deployed within a defined timeframe

## Key Indicators of Compliance
- Anti-malware definitions updated at least daily across all systems
- Automatic updates configured and monitored for failures
- Engine versions updated within defined timeframe of release
- Update compliance reported and managed

## Common Findings / Deficiencies
- Endpoints with anti-malware definitions weeks or months out of date
- Automatic updates configured but failures going undetected`,
  },
  {
    control_id: 'SI.L2-3.14.5',
    practice_id: 'SI.L2-3.14.5',
    domain_name: 'System and Information Integrity',
    title: 'SI.L2-3.14.5 — System & File Scanning — Assessment Objectives',
    content: `# SI.L2-3.14.5 — System & File Scanning — Assessment Objectives

**Domain:** System and Information Integrity | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Perform periodic scans of organizational systems and real-time scans of files from external sources as files are downloaded, opened, or executed.

## EXAMINE
Assessors should examine the following types of evidence:
- Anti-malware scan configuration showing scheduled and real-time scanning
- Scan completion records for periodic scans
- Real-time scanning configuration for file downloads and attachments
- Scan result logs and detection records

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing anti-malware scan configurations
- Security personnel reviewing scan results
Discussion topics: Are periodic full-system scans scheduled? Is real-time scanning enabled for downloaded files? How are scan results reviewed?

## TEST
Assessors should test the following mechanisms:
- Verify periodic scan schedule is configured and scans are completing
- Test real-time scanning by downloading a benign test file and confirming scan occurs
- Review recent scan logs to confirm periodic scans completed successfully
- Confirm email gateway scans attachments in real time

## Key Indicators of Compliance
- Periodic full-system scans scheduled and completing successfully
- Real-time scanning enabled for file downloads, email attachments, and removable media
- Scan results reviewed and detection events investigated
- Scanning covers all entry points for malicious files

## Common Findings / Deficiencies
- Real-time scanning disabled for performance reasons without compensating controls
- Periodic scans scheduled but not completing due to scheduling conflicts`,
  },
  {
    control_id: 'SI.L2-3.14.6',
    practice_id: 'SI.L2-3.14.6',
    domain_name: 'System and Information Integrity',
    title: 'SI.L2-3.14.6 — Security Alert Monitoring — Assessment Objectives',
    content: `# SI.L2-3.14.6 — Security Alert Monitoring — Assessment Objectives

**Domain:** System and Information Integrity | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Monitor organizational systems to detect attacks and indicators of potential attacks in accordance with the following objectives: identify unauthorized use of organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Network and host-based intrusion detection system (IDS/IPS) configurations
- Security monitoring use cases and detection rules
- Alerts and investigation records for detected attack indicators
- Monitoring coverage across all system types
- Threat hunting records or reports

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security operations or SOC personnel conducting monitoring
- Security architects who designed detection capabilities
- Security officers overseeing the attack detection program
Discussion topics: What monitoring tools detect potential attacks? What indicators of compromise are monitored for? How quickly can you detect unauthorized use of systems?

## TEST
Assessors should test the following mechanisms:
- Review IDS/IPS configurations for coverage and tuning
- Test detection capability by simulating a known attack pattern and verifying detection
- Review recent security alerts and assess detection quality
- Confirm monitoring covers both external attacks and insider threat behaviors

## Key Indicators of Compliance
- IDS/IPS deployed at network boundaries and on critical hosts
- Detection rules tuned to current threat landscape
- Alerts investigated with documented outcomes
- Unauthorized system use detectable and responded to

## Common Findings / Deficiencies
- IDS/IPS deployed but alert volume too high for effective monitoring (alert fatigue)
- Monitoring focused only on perimeter with no internal detection capability`,
  },
  {
    control_id: 'SI.L2-3.14.7',
    practice_id: 'SI.L2-3.14.7',
    domain_name: 'System and Information Integrity',
    title: 'SI.L2-3.14.7 — Identify Unauthorized Use — Assessment Objectives',
    content: `# SI.L2-3.14.7 — Identify Unauthorized Use — Assessment Objectives

**Domain:** System and Information Integrity | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Identify unauthorized use of organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- User behavior analytics (UBA) or equivalent tool configurations
- Baseline activity documentation for normal user behavior
- Records of unauthorized use detection events
- Access reviews and anomaly detection records
- Policy defining authorized vs. unauthorized use

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security operations personnel monitoring for unauthorized use
- Security officers defining authorized use policy and monitoring requirements
Discussion topics: How is "authorized use" defined? What tools detect deviations from normal use patterns? How are suspected unauthorized use events investigated?

## TEST
Assessors should test the following mechanisms:
- Review monitoring capabilities for detecting unusual or anomalous user behavior
- Test whether off-hours access by privileged users generates alerts
- Verify that access to sensitive data outside normal patterns is detectable
- Review records of unauthorized use investigations

## Key Indicators of Compliance
- Authorized use defined in policy and communicated to users
- Technical monitoring capable of detecting deviations from authorized use patterns
- Alerts generated for potential unauthorized use and investigated
- Unauthorized use incidents documented and appropriate action taken

## Common Findings / Deficiencies
- No capability to detect unauthorized use beyond failed authentication attempts
- Authorized use not formally defined, making detection of unauthorized use difficult`,
  },
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text.slice(0, 8000),
      model: 'text-embedding-3-small',
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding error: ${err}`);
  }
  const data = await response.json();
  return data.data[0].embedding;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Lookup CMMC framework
    const { data: framework } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('abbreviation', 'CMMC')
      .single();

    if (!framework) {
      return new Response(JSON.stringify({ error: 'CMMC framework not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Lookup first source for this framework
    const { data: sources } = await supabase
      .from('sources')
      .select('id')
      .eq('framework_id', framework.id)
      .limit(1);

    const source = sources?.[0];
    if (!source) {
      return new Response(JSON.stringify({ error: 'CMMC source not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let inserted = 0;
    let errors = 0;

    for (const doc of DOCS) {
      try {
        // Idempotent delete: remove existing assessment doc for this control_id
        await supabase
          .from('documents')
          .delete()
          .eq('framework_id', framework.id)
          .eq('metadata->>control_id', doc.control_id)
          .eq('metadata->>document_level', 'assessment');

        const { data: newDoc, error: insertError } = await supabase.from('documents').insert({
          source_id: source.id,
          framework_id: framework.id,
          title: doc.title,
          document_type: 'control',
          raw_content: doc.content,
          is_indexed: true,
          metadata: {
            control_id: doc.control_id,
            practice_id: doc.practice_id,
            domain_name: doc.domain_name,
            document_level: 'assessment',
          },
        }).select('id').single();

        if (insertError || !newDoc) {
          console.error(`Insert error for ${doc.control_id}:`, insertError?.message);
          errors++;
          continue;
        }

        const embedding = await generateEmbedding(doc.content);
        await supabase.from('document_chunks').insert({
          document_id: newDoc.id,
          chunk_index: 0,
          content: doc.content,
          metadata: { control_id: doc.control_id, domain_name: doc.domain_name, document_level: 'assessment' },
          embedding,
        });

        inserted++;
        console.log(`Ingested: ${doc.control_id}`);
      } catch (docErr) {
        console.error(`Error processing ${doc.control_id}:`, docErr);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `CMMC CAG ingest-2 (MA–SI) complete`,
        inserted,
        errors,
        total: DOCS.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Fatal error:', err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
