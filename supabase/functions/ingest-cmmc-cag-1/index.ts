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
  // ── ACCESS CONTROL (AC) ─────────────────────────────────────────────────
  {
    control_id: 'AC.L2-3.1.1',
    practice_id: 'AC.L2-3.1.1',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.1 — Authorized Access Control — Assessment Objectives',
    content: `# AC.L2-3.1.1 — Authorized Access Control — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Limit system access to authorized users, processes acting on behalf of authorized users, and devices (including other systems).

## EXAMINE
Assessors should examine the following types of evidence:
- Access control policies and procedures documenting how authorized users are defined and managed
- System security plan (SSP) sections describing access control implementation
- User account provisioning and deprovisioning records
- Access control lists (ACLs) and permission matrices
- System configuration documentation showing access restrictions

## INTERVIEW
Assessors should interview personnel with the following roles:
- System/network administrators responsible for account management
- Security officers or ISSO responsible for access control policy
- HR personnel involved in onboarding/offboarding processes
Discussion topics: How are new users granted access? How is access removed when employees leave? How are privileged accounts managed differently?

## TEST
Assessors should test the following mechanisms:
- Attempt to access system resources as an unauthenticated user and verify access is denied
- Verify that terminated employee accounts are disabled/removed
- Review active accounts and confirm each maps to an authorized user or process
- Test that device authentication is enforced where required

## Key Indicators of Compliance
- All active accounts correspond to current, authorized employees or processes
- Accounts are provisioned through a formal, documented approval process
- Departed employees' accounts are disabled within defined timeframes
- System enforces authentication before granting any access

## Common Findings / Deficiencies
- Orphaned accounts for former employees or contractors still active
- Shared/generic accounts in use without adequate controls or justification
- No formal access approval process documented or enforced`,
  },
  {
    control_id: 'AC.L2-3.1.2',
    practice_id: 'AC.L2-3.1.2',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.2 — Transaction & Function Control — Assessment Objectives',
    content: `# AC.L2-3.1.2 — Transaction & Function Control — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Limit system access to the types of transactions and functions that authorized users are permitted to execute.

## EXAMINE
Assessors should examine the following types of evidence:
- Role-based access control (RBAC) configurations and role definitions
- Privilege matrices mapping roles to permitted functions
- System configuration showing function-level access restrictions
- Audit logs demonstrating enforcement of transaction limits
- Policy documentation for least-privilege implementation

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators responsible for role configuration
- Application owners who define business function access
- Security officers overseeing privilege management
Discussion topics: How are roles and permissions defined? Who approves changes to roles? How is least privilege enforced for sensitive transactions?

## TEST
Assessors should test the following mechanisms:
- Attempt to execute privileged functions as a standard user and verify denial
- Review role configurations and confirm they enforce least privilege
- Test that separation of duties is enforced for critical transactions
- Verify audit logging captures attempted unauthorized transactions

## Key Indicators of Compliance
- Roles are defined with minimum necessary permissions for job functions
- Users cannot execute functions outside their assigned role
- Administrative functions require separate privileged accounts
- Role assignments are reviewed periodically and documented

## Common Findings / Deficiencies
- Overly permissive roles granting broader access than necessary
- Users with administrative rights for day-to-day work tasks`,
  },
  {
    control_id: 'AC.L2-3.1.3',
    practice_id: 'AC.L2-3.1.3',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.3 — Control CUI Flow — Assessment Objectives',
    content: `# AC.L2-3.1.3 — Control CUI Flow — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control the flow of CUI in accordance with approved authorizations.

## EXAMINE
Assessors should examine the following types of evidence:
- Data flow diagrams identifying where CUI travels within and between systems
- Information flow control policies and procedures
- Network segmentation documentation and firewall rule sets
- DLP (Data Loss Prevention) tool configurations
- System interconnection agreements (ISAs) for CUI flowing to external systems

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network architects who designed the CUI environment
- Security officers overseeing CUI handling requirements
- System administrators managing network controls
Discussion topics: How is CUI identified as it flows through systems? What controls prevent CUI from leaving authorized boundaries? How are new data flows authorized?

## TEST
Assessors should test the following mechanisms:
- Attempt to transfer CUI to an unauthorized external destination and verify blocking
- Review network segmentation and confirm CUI zones are isolated
- Test DLP rules to verify they detect and block unauthorized CUI transmission
- Verify CUI cannot flow to unapproved cloud services or storage

## Key Indicators of Compliance
- CUI flow paths are fully documented and mapped
- Technical controls enforce information flow restrictions
- Any CUI transmission to external parties is governed by formal agreements
- DLP or equivalent controls actively monitor and restrict CUI movement

## Common Findings / Deficiencies
- CUI flowing to personal email or cloud storage without controls
- Missing or incomplete data flow documentation for CUI`,
  },
  {
    control_id: 'AC.L2-3.1.4',
    practice_id: 'AC.L2-3.1.4',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.4 — Separation of Duties — Assessment Objectives',
    content: `# AC.L2-3.1.4 — Separation of Duties — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Separate the duties of individuals to reduce the risk of malevolent activity without collusion.

## EXAMINE
Assessors should examine the following types of evidence:
- Separation of duties (SoD) matrix identifying conflicting roles
- Access control configurations enforcing SoD restrictions
- Policy documentation defining which duties must be separated
- Audit logs showing enforcement of separation controls
- Job descriptions and responsibilities for key security-sensitive roles

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security officers who defined and maintain SoD policy
- System administrators who implement technical SoD controls
- HR/management personnel overseeing role assignments
Discussion topics: Which roles are defined as conflicting? How is SoD enforced technically? What compensating controls exist where SoD cannot be fully implemented?

## TEST
Assessors should test the following mechanisms:
- Verify that a single user cannot both approve and execute sensitive transactions
- Test that system administration and security audit functions are assigned to different individuals
- Confirm that code developers cannot deploy to production without separate approval
- Review access assignments to identify any SoD violations

## Key Indicators of Compliance
- Documented SoD matrix identifying all conflicting duty pairs
- Technical controls prevent single individuals from holding conflicting roles
- Compensating controls documented where small team size limits full SoD
- Regular reviews of role assignments for SoD compliance

## Common Findings / Deficiencies
- Single administrator with both system admin and audit log access
- No documented SoD analysis or matrix exists`,
  },
  {
    control_id: 'AC.L2-3.1.5',
    practice_id: 'AC.L2-3.1.5',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.5 — Least Privilege — Assessment Objectives',
    content: `# AC.L2-3.1.5 — Least Privilege — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ the principle of least privilege, including for specific security functions and privileged accounts.

## EXAMINE
Assessors should examine the following types of evidence:
- Privileged account inventory and justification records
- Role definitions showing minimum permissions per role
- Privileged access management (PAM) tool configurations
- Security function access logs and approval records
- Periodic access reviews and recertification records

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing privileged accounts
- Security officers overseeing privilege policy
- Application owners defining role permissions
Discussion topics: How are privileged accounts identified and tracked? What process exists to request elevated access? How often are privilege levels reviewed?

## TEST
Assessors should test the following mechanisms:
- Review all privileged accounts and verify each has documented business justification
- Attempt to use standard accounts for privileged operations and verify denial
- Test that privileged accounts are separate from standard user accounts
- Verify that security functions (audit log access, security configuration) are restricted to authorized personnel

## Key Indicators of Compliance
- All privileged accounts are inventoried and justified
- Users have separate accounts for privileged vs. day-to-day tasks
- Least privilege applied to service accounts and automated processes
- Regular access recertification process is documented and performed

## Common Findings / Deficiencies
- Users performing daily tasks with administrator-level accounts
- Service accounts with excessive permissions beyond what the service requires`,
  },
  {
    control_id: 'AC.L2-3.1.6',
    practice_id: 'AC.L2-3.1.6',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.6 — Non-Privileged Account Use — Assessment Objectives',
    content: `# AC.L2-3.1.6 — Non-Privileged Account Use — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Use non-privileged accounts or roles when accessing non-security functions.

## EXAMINE
Assessors should examine the following types of evidence:
- Account provisioning records showing separate privileged and standard accounts
- Policy requiring use of non-privileged accounts for standard work
- System configurations preventing privileged account use for non-security tasks
- Training records covering privileged account usage policies

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who hold privileged accounts
- Security officers who define privileged access policy
- End users with dual accounts (standard + admin)
Discussion topics: When do administrators use privileged vs. standard accounts? Are administrators required to log in with standard accounts for email, web browsing, etc.?

## TEST
Assessors should test the following mechanisms:
- Observe an administrator's daily workflow to confirm standard account is used for non-security tasks
- Review administrator account configurations to verify separate accounts exist
- Check audit logs for privileged account activity during non-security tasks (email, web browsing)

## Key Indicators of Compliance
- Administrators have documented separate standard and privileged accounts
- Policy explicitly requires use of standard accounts for non-security functions
- Audit logs confirm privileged accounts are used only for security-related tasks
- Training completed on privileged account usage requirements

## Common Findings / Deficiencies
- Administrators using domain admin accounts for email and web browsing
- Single account with both admin rights and standard user access`,
  },
  {
    control_id: 'AC.L2-3.1.7',
    practice_id: 'AC.L2-3.1.7',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.7 — Privileged Function Logging — Assessment Objectives',
    content: `# AC.L2-3.1.7 — Privileged Function Logging — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Prevent non-privileged users from executing privileged functions and capture the execution of such functions in audit logs.

## EXAMINE
Assessors should examine the following types of evidence:
- System configuration showing privileged function restrictions
- Audit log configurations capturing privileged function executions
- Sample audit logs demonstrating privileged function activity is recorded
- Access control policies defining privileged vs. non-privileged functions
- Log review procedures and records

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators configuring audit logging
- Security officers overseeing log management
- SIEM/monitoring personnel reviewing privileged activity
Discussion topics: What constitutes a privileged function? How are privileged function executions logged? How often are logs reviewed for unusual privileged activity?

## TEST
Assessors should test the following mechanisms:
- Attempt to execute privileged functions as a standard user and verify denial and logging
- Review audit logs to confirm privileged functions are captured with user, timestamp, and action
- Test that audit logs cannot be modified or deleted by non-privileged users
- Verify log completeness by executing a known privileged function and confirming it appears in logs

## Key Indicators of Compliance
- Technical controls prevent non-privileged users from accessing privileged functions
- Audit logs capture all privileged function executions with sufficient detail
- Log integrity is protected and logs are reviewed regularly
- Privileged functions are clearly defined in policy and system configuration

## Common Findings / Deficiencies
- Audit logging not configured to capture privileged command execution
- Non-privileged users able to access some administrative functions`,
  },
  {
    control_id: 'AC.L2-3.1.8',
    practice_id: 'AC.L2-3.1.8',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.8 — Unsuccessful Logon Attempts — Assessment Objectives',
    content: `# AC.L2-3.1.8 — Unsuccessful Logon Attempts — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Limit unsuccessful logon attempts.

## EXAMINE
Assessors should examine the following types of evidence:
- System security configuration showing account lockout policy settings
- Group Policy Objects (GPOs) or equivalent configuration defining lockout thresholds
- Policy documentation specifying maximum failed attempt counts and lockout duration
- Test records or screenshots confirming lockout behavior

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who configure authentication settings
- Help desk personnel who handle account lockout requests
- Security officers who defined lockout policy parameters
Discussion topics: What is the configured lockout threshold? What is the lockout duration? How are lockouts handled for service accounts?

## TEST
Assessors should test the following mechanisms:
- Attempt multiple failed logins and verify account locks after the defined threshold
- Confirm lockout duration matches policy requirements
- Verify that locked accounts require administrator action or time delay to unlock
- Test that lockout policy applies consistently across all access methods (VPN, web apps, local login)

## Key Indicators of Compliance
- Account lockout threshold is configured at 3-5 failed attempts (or documented policy value)
- Lockout duration is defined and consistently enforced
- Policy applies to all system access points including remote access
- Lockout events are logged and monitored

## Common Findings / Deficiencies
- Lockout policy not applied to all authentication points (e.g., web apps missing lockout)
- Lockout threshold set too high (e.g., 10+ attempts) providing minimal protection`,
  },
  {
    control_id: 'AC.L2-3.1.9',
    practice_id: 'AC.L2-3.1.9',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.9 — System Use Notification — Assessment Objectives',
    content: `# AC.L2-3.1.9 — System Use Notification — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Provide privacy and security notices consistent with CUI rules before granting access to systems containing CUI.

## EXAMINE
Assessors should examine the following types of evidence:
- System login banner or warning message text and configuration
- Policy documentation specifying required banner content
- Screenshots or configuration records showing banner presentation
- Legal/compliance review records for banner language

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who configure login banners
- Legal or compliance personnel who reviewed banner language
- Security officers who defined banner requirements
Discussion topics: When and where is the system use notification displayed? Does the banner include all required elements (consent to monitoring, authorized use only, privacy notice)?

## TEST
Assessors should test the following mechanisms:
- Log in to systems containing CUI and verify banner is displayed before access is granted
- Review banner text for required elements: authorized use only, monitoring notification, consent to monitoring
- Verify banner requires user acknowledgment before proceeding
- Check all access methods (local, remote, web) for consistent banner display

## Key Indicators of Compliance
- Banner displayed at login before credentials are accepted or immediately after
- Banner content includes authorized use notice, monitoring consent, and privacy statement
- Banner consistent across all access methods to CUI systems
- Banner language reviewed and approved by appropriate authority

## Common Findings / Deficiencies
- No login banner configured on CUI systems
- Banner text missing required elements (consent to monitoring or privacy notice)`,
  },
  {
    control_id: 'AC.L2-3.1.10',
    practice_id: 'AC.L2-3.1.10',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.10 — Session Lock — Assessment Objectives',
    content: `# AC.L2-3.1.10 — Session Lock — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Use session lock with pattern-hiding displays after a period of inactivity.

## EXAMINE
Assessors should examine the following types of evidence:
- System configuration showing screen lock/timeout settings
- Group Policy or MDM configurations enforcing session lock
- Policy documentation specifying maximum inactivity period before lock
- Configuration for pattern-hiding (screensaver obscuring screen content)

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators configuring workstation policies
- End users to verify session lock behavior is experienced in practice
- Security officers who defined inactivity timeout policy
Discussion topics: What is the configured inactivity timeout? Can users override or disable session lock? Does the screensaver obscure the display?

## TEST
Assessors should test the following mechanisms:
- Leave a workstation idle for the defined period and verify session lock activates
- Confirm the lock screen obscures previous session content (pattern-hiding)
- Verify that authentication is required to resume the session
- Test that the policy cannot be disabled or extended by standard users

## Key Indicators of Compliance
- Session lock activates within 15 minutes of inactivity (or documented policy value)
- Lock screen hides previous session content from casual observation
- Re-authentication required to unlock session
- Policy enforced consistently across all workstations accessing CUI

## Common Findings / Deficiencies
- Session lock timeout set too long (30+ minutes) or disabled
- Screensaver configured but does not require password to unlock`,
  },
  {
    control_id: 'AC.L2-3.1.11',
    practice_id: 'AC.L2-3.1.11',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.11 — Session Termination — Assessment Objectives',
    content: `# AC.L2-3.1.11 — Session Termination — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Terminate (automatically) a user session after a defined condition.

## EXAMINE
Assessors should examine the following types of evidence:
- System configuration showing automatic session termination settings
- Policy defining conditions triggering session termination (time limits, inactivity, etc.)
- Application and network session timeout configurations
- VPN and remote access session termination settings

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing session configurations
- Network/VPN administrators overseeing remote session policy
- Security officers who defined session termination requirements
Discussion topics: Under what conditions are sessions automatically terminated? Are session limits consistent for remote and local access? How are session termination events logged?

## TEST
Assessors should test the following mechanisms:
- Verify that sessions terminate after the defined maximum session time
- Test that idle sessions beyond the threshold are terminated (not just locked)
- Confirm remote access sessions (VPN, RDP) are also subject to termination
- Review logs to confirm session termination events are captured

## Key Indicators of Compliance
- Automatic session termination configured and enforced for all session types
- Termination conditions clearly defined in policy
- Remote access sessions subject to the same termination controls as local sessions
- Session termination events logged for audit purposes

## Common Findings / Deficiencies
- Session lock configured but no actual session termination after extended inactivity
- Remote access sessions with no time or inactivity limits`,
  },
  {
    control_id: 'AC.L2-3.1.12',
    practice_id: 'AC.L2-3.1.12',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.12 — Remote Access Control — Assessment Objectives',
    content: `# AC.L2-3.1.12 — Remote Access Control — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Monitor and control remote access sessions.

## EXAMINE
Assessors should examine the following types of evidence:
- Remote access policy and procedures
- VPN and remote desktop configurations and logs
- Remote access monitoring tools and alerting configurations
- Records of remote access session reviews
- Access control configurations for remote access methods

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network/VPN administrators managing remote access infrastructure
- Security monitoring personnel reviewing remote access logs
- Security officers who defined remote access policy
Discussion topics: What remote access methods are authorized? How are remote sessions monitored in real time? What alerts exist for anomalous remote access?

## TEST
Assessors should test the following mechanisms:
- Review remote access logs and verify completeness of session information captured
- Test that unauthorized remote access methods (non-VPN RDP, etc.) are blocked
- Verify monitoring tools provide visibility into active remote sessions
- Confirm remote access requires MFA per AC.L2-3.5.3

## Key Indicators of Compliance
- All remote access methods are documented and authorized
- Remote access sessions are logged with user, time, duration, and source IP
- Active monitoring or alerting for anomalous remote access behavior
- Unauthorized remote access methods are technically blocked

## Common Findings / Deficiencies
- Remote access logs not reviewed or monitored regularly
- Multiple remote access methods in use without centralized visibility`,
  },
  {
    control_id: 'AC.L2-3.1.13',
    practice_id: 'AC.L2-3.1.13',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.13 — Remote Access Confidentiality — Assessment Objectives',
    content: `# AC.L2-3.1.13 — Remote Access Confidentiality — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ cryptographic mechanisms to protect the confidentiality of remote access sessions.

## EXAMINE
Assessors should examine the following types of evidence:
- VPN and remote access configuration showing encryption algorithms and protocols in use
- TLS/SSL configuration for web-based remote access
- Cryptographic standards documentation specifying approved algorithms
- System security plan sections covering remote access encryption

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators configuring VPN and remote access encryption
- Security officers verifying cryptographic standard compliance
Discussion topics: What encryption protocols are used for remote access? Are weak or deprecated protocols (SSL, TLS 1.0/1.1) disabled? How are cryptographic settings reviewed and updated?

## TEST
Assessors should test the following mechanisms:
- Review VPN configuration to confirm use of approved encryption (AES-256, TLS 1.2+)
- Test that weak protocols (SSL 3.0, TLS 1.0, RC4) are disabled
- Perform SSL/TLS scan on remote access portals to verify cipher suite configuration
- Verify that all remote access traffic is encrypted end-to-end

## Key Indicators of Compliance
- Remote access encrypted with FIPS-validated or NIST-approved algorithms
- Deprecated protocols disabled across all remote access entry points
- Encryption configuration reviewed annually or after cryptographic guidance updates
- All remote access sessions (including web-based) require encryption

## Common Findings / Deficiencies
- TLS 1.0 or 1.1 still enabled on remote access portals
- VPN using weak cipher suites not meeting NIST recommendations`,
  },
  {
    control_id: 'AC.L2-3.1.14',
    practice_id: 'AC.L2-3.1.14',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.14 — Remote Access Routing — Assessment Objectives',
    content: `# AC.L2-3.1.14 — Remote Access Routing — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Route remote access via managed access control points.

## EXAMINE
Assessors should examine the following types of evidence:
- Network architecture diagrams showing remote access paths
- VPN gateway and remote access server configurations
- Firewall rules confirming remote traffic routed through control points
- Network access control (NAC) configurations
- Documentation of authorized remote access entry points

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network architects who designed remote access infrastructure
- Network administrators managing remote access gateways
- Security officers overseeing remote access policy
Discussion topics: How many remote access entry points exist? Are all remote access paths routed through managed gateways? How is split tunneling handled?

## TEST
Assessors should test the following mechanisms:
- Verify that all remote access traffic passes through designated control points
- Test that split tunneling is disabled or managed to prevent bypass of controls
- Confirm unauthorized remote access methods cannot bypass managed entry points
- Review firewall rules to verify remote access path enforcement

## Key Indicators of Compliance
- All remote access routes through a small number of defined, managed control points
- Split tunneling disabled or specifically controlled with documented policy
- Firewall rules enforce routing of all remote traffic through gateways
- No unauthorized remote access bypass paths exist

## Common Findings / Deficiencies
- Split tunneling enabled without controls, allowing traffic to bypass inspection
- Multiple unauthorized remote access paths not inventoried or controlled`,
  },
  {
    control_id: 'AC.L2-3.1.15',
    practice_id: 'AC.L2-3.1.15',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.15 — Privileged Remote Access — Assessment Objectives',
    content: `# AC.L2-3.1.15 — Privileged Remote Access — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Authorize remote execution of privileged commands and remote access to security-relevant information via remote access only for documented operational needs.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy and authorization records for remote privileged access
- Approved use cases and business justifications for remote privileged commands
- Remote privileged access session logs
- Configurations of jump servers or PAM tools used for privileged remote access
- Audit records of remote privileged access events

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who perform remote privileged tasks
- Security officers who authorize remote privileged access
- PAM tool administrators managing privileged remote sessions
Discussion topics: Under what circumstances is remote privileged access authorized? How is it documented? What additional controls apply to remote privileged sessions?

## TEST
Assessors should test the following mechanisms:
- Verify that remote privileged access requires specific authorization beyond standard remote access
- Review logs to confirm remote privileged command executions are captured
- Test that remote privileged access is channeled through controlled jump servers or PAM
- Confirm approvals exist for documented remote privileged access use cases

## Key Indicators of Compliance
- Remote privileged access authorized only for specific, documented operational needs
- Additional authentication or approval required for remote privileged sessions
- All remote privileged commands logged and reviewed
- Unauthorized remote privileged access is technically prevented

## Common Findings / Deficiencies
- Remote privileged access available to all administrators without additional controls
- No documentation of authorized use cases for remote privileged command execution`,
  },
  {
    control_id: 'AC.L2-3.1.16',
    practice_id: 'AC.L2-3.1.16',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.16 — Wireless Access Authorization — Assessment Objectives',
    content: `# AC.L2-3.1.16 — Wireless Access Authorization — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Authorize wireless access prior to allowing such connections.

## EXAMINE
Assessors should examine the following types of evidence:
- Wireless access authorization policy and procedures
- Wireless network configurations showing authorization requirements
- Records of authorized wireless access points and devices
- NAC or certificate-based wireless authentication configurations

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators managing wireless infrastructure
- Security officers overseeing wireless access policy
- End users to understand the wireless connection process
Discussion topics: How is wireless access authorized before connection is allowed? Are personal devices allowed on corporate wireless? How are unauthorized wireless devices detected?

## TEST
Assessors should test the following mechanisms:
- Attempt to connect an unauthorized device to wireless networks and verify denial
- Verify that wireless access requires authentication (WPA2/WPA3-Enterprise or certificate)
- Review authorized wireless device/user lists and confirm they are current
- Test for presence of rogue access points

## Key Indicators of Compliance
- Wireless access requires authentication before granting network access
- Authorized devices/users list maintained and enforced
- Regular wireless scanning for rogue access points conducted
- Guest wireless networks isolated from CUI networks

## Common Findings / Deficiencies
- Open or WPA2-Personal wireless with pre-shared key instead of enterprise authentication
- No process to detect or respond to rogue wireless access points`,
  },
  {
    control_id: 'AC.L2-3.1.17',
    practice_id: 'AC.L2-3.1.17',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.17 — Wireless Access Protection — Assessment Objectives',
    content: `# AC.L2-3.1.17 — Wireless Access Protection — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Protect wireless access using authentication and encryption.

## EXAMINE
Assessors should examine the following types of evidence:
- Wireless network configuration showing encryption protocol (WPA2/WPA3)
- Authentication configuration (802.1X, certificates, RADIUS)
- Wireless security policy documentation
- Penetration test or vulnerability assessment results for wireless

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators configuring wireless security settings
- Security officers verifying wireless compliance requirements
Discussion topics: What encryption protocol is used? Is 802.1X/EAP authentication deployed? How is wireless security reviewed or tested?

## TEST
Assessors should test the following mechanisms:
- Verify wireless networks use WPA2-Enterprise or WPA3 (not WPA2-Personal with shared key)
- Confirm encryption is enforced and weak protocols (WEP, open networks) are not present
- Test 802.1X authentication by attempting connection without valid credentials
- Review wireless configuration for compliance with NIST/FIPS cryptographic standards

## Key Indicators of Compliance
- Wireless uses WPA2-Enterprise or WPA3 with strong encryption
- 802.1X with certificate or credential-based authentication required
- No open or WEP-encrypted networks present
- Wireless security configuration reviewed and tested periodically

## Common Findings / Deficiencies
- WPA2-Personal with a shared passphrase used instead of enterprise authentication
- Encryption standards not meeting FIPS requirements for CUI environments`,
  },
  {
    control_id: 'AC.L2-3.1.18',
    practice_id: 'AC.L2-3.1.18',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.18 — Mobile Device Connection — Assessment Objectives',
    content: `# AC.L2-3.1.18 — Mobile Device Connection — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control connection of mobile devices.

## EXAMINE
Assessors should examine the following types of evidence:
- Mobile device management (MDM) policy and configuration
- List of authorized mobile devices and enrollment records
- MDM compliance requirements and enforcement configurations
- Policy on personally owned devices (BYOD) accessing CUI
- Mobile device security standards documentation

## INTERVIEW
Assessors should interview personnel with the following roles:
- MDM administrators managing mobile device enrollment
- Security officers overseeing mobile device policy
- End users who use mobile devices to access organizational systems
Discussion topics: How are mobile devices authorized before connecting to organizational resources? What security requirements must a mobile device meet? How are lost or stolen devices handled?

## TEST
Assessors should test the following mechanisms:
- Attempt to access CUI systems from an unenrolled mobile device and verify denial
- Review MDM configuration to confirm security baseline requirements are enforced
- Test remote wipe capability for enrolled mobile devices
- Verify that CUI cannot be stored locally on mobile devices without appropriate protection

## Key Indicators of Compliance
- All mobile devices accessing CUI systems are enrolled in MDM
- MDM enforces security baseline (PIN/password, encryption, approved apps)
- Unauthorized or non-compliant mobile devices are blocked from access
- Remote wipe capability exists and has been tested

## Common Findings / Deficiencies
- Personal mobile devices connecting to CUI systems without MDM enrollment
- MDM deployed but not enforcing minimum security requirements`,
  },
  {
    control_id: 'AC.L2-3.1.19',
    practice_id: 'AC.L2-3.1.19',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.19 — Encrypt CUI on Mobile — Assessment Objectives',
    content: `# AC.L2-3.1.19 — Encrypt CUI on Mobile — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Encrypt CUI on mobile devices and mobile computing platforms.

## EXAMINE
Assessors should examine the following types of evidence:
- MDM configuration showing device encryption enforcement
- Device encryption compliance reports from MDM
- Policy requiring encryption of CUI on mobile devices
- Documentation of approved encryption standards for mobile

## INTERVIEW
Assessors should interview personnel with the following roles:
- MDM administrators managing device encryption settings
- Security officers verifying encryption compliance
- End users who store CUI on mobile devices
Discussion topics: Is full-disk or file-level encryption enforced on all mobile devices? What happens if a device reports as non-compliant? Are encryption standards consistent with FIPS requirements?

## TEST
Assessors should test the following mechanisms:
- Review MDM compliance reports to verify all enrolled devices have encryption enabled
- Test that a device with encryption disabled is blocked from accessing organizational resources
- Verify encryption algorithm meets NIST/FIPS standards (AES-256)
- Confirm CUI stored in mobile applications is encrypted at rest

## Key Indicators of Compliance
- Full-device encryption enforced on all mobile devices accessing or storing CUI
- Non-compliant devices automatically blocked by MDM
- Encryption standard meets FIPS requirements
- Encryption compliance is continuously monitored through MDM

## Common Findings / Deficiencies
- Encryption enabled but MDM not enforcing or verifying compliance status
- Mobile apps storing CUI in unencrypted local caches`,
  },
  {
    control_id: 'AC.L2-3.1.20',
    practice_id: 'AC.L2-3.1.20',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.20 — External System Connections — Assessment Objectives',
    content: `# AC.L2-3.1.20 — External System Connections — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Verify and control/limit connections to external systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Inventory of all external system connections (ISAs, MOUs)
- Policy governing authorization of external connections
- Network configurations and firewall rules for external connections
- Risk assessments for external system connections
- Periodic reviews of external connection authorizations

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators managing external connections
- Security officers who authorize external system connections
- Contract/vendor managers overseeing third-party connections
Discussion topics: How are external connections inventoried and authorized? What security requirements must external systems meet? How often are external connections reviewed?

## TEST
Assessors should test the following mechanisms:
- Review list of all external connections and verify each has documented authorization
- Check firewall rules to ensure only authorized external connections are permitted
- Verify that external connections are restricted to necessary ports and protocols
- Test that unauthorized external connections are blocked

## Key Indicators of Compliance
- All external connections documented in ISAs or equivalent agreements
- External connections authorized by appropriate authority
- Firewall rules restrict external connections to minimum necessary
- External connection authorizations reviewed periodically

## Common Findings / Deficiencies
- Undocumented external connections discovered during network review
- External connections authorized without formal risk assessment`,
  },
  {
    control_id: 'AC.L2-3.1.21',
    practice_id: 'AC.L2-3.1.21',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.21 — Portable Storage Restrictions — Assessment Objectives',
    content: `# AC.L2-3.1.21 — Portable Storage Restrictions — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Limit use of portable storage devices on external systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy restricting use of portable storage on external or non-organizational systems
- Technical configurations blocking or controlling USB/portable storage
- Endpoint security tool configurations for removable media control
- Records of approved portable storage use cases and authorizations

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators configuring endpoint controls
- Security officers who defined portable storage policy
- End users to understand practical handling of portable storage
Discussion topics: Are users allowed to use personal USB drives? How is portable storage use on external systems restricted? What happens if someone connects organizational media to a personal computer?

## TEST
Assessors should test the following mechanisms:
- Attempt to connect an unauthorized USB device on an organizational system and verify control action (block, log, or allow with monitoring)
- Verify endpoint security tools enforce portable storage policy
- Test that CUI cannot be copied to unauthorized portable storage
- Review logs for portable storage connection events

## Key Indicators of Compliance
- Technical controls restrict or block unauthorized portable storage
- Approved portable storage use requires authorization
- Portable storage events are logged
- CUI cannot be transferred to unauthorized portable media

## Common Findings / Deficiencies
- USB ports unrestricted with no technical controls on portable storage
- Policy exists but no technical enforcement in place`,
  },
  {
    control_id: 'AC.L2-3.1.22',
    practice_id: 'AC.L2-3.1.22',
    domain_name: 'Access Control',
    title: 'AC.L2-3.1.22 — Control CUI Posted Publicly — Assessment Objectives',
    content: `# AC.L2-3.1.22 — Control CUI Posted Publicly — Assessment Objectives

**Domain:** Access Control | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control CUI posted or processed on publicly accessible systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy governing content posted on public-facing systems
- Review/approval records for publicly posted content
- Inventory of publicly accessible organizational systems
- Process documentation for reviewing CUI before public posting
- Records of periodic reviews of publicly accessible content

## INTERVIEW
Assessors should interview personnel with the following roles:
- Web administrators managing public-facing systems
- Content owners responsible for reviewing material before publication
- Security officers overseeing public content policy
Discussion topics: How is content reviewed before posting to public systems? Who is authorized to post content publicly? How is inadvertent CUI disclosure on public systems detected and remediated?

## TEST
Assessors should test the following mechanisms:
- Review public-facing systems for presence of CUI
- Verify content approval process exists and includes CUI check
- Test that CUI cannot be directly accessed through public web interfaces
- Review access controls on public systems to ensure CUI repositories are not exposed

## Key Indicators of Compliance
- Formal review/approval process for all publicly posted content
- Public systems technically isolated from CUI repositories
- Periodic scanning or review of public sites for inadvertent CUI exposure
- Trained personnel responsible for CUI review before publication

## Common Findings / Deficiencies
- No formal process to review content before public posting
- CUI inadvertently exposed through misconfigured public web servers`,
  },
  // ── AWARENESS & TRAINING (AT) ──────────────────────────────────────────
  {
    control_id: 'AT.L2-3.2.1',
    practice_id: 'AT.L2-3.2.1',
    domain_name: 'Awareness and Training',
    title: 'AT.L2-3.2.1 — Security Awareness — Assessment Objectives',
    content: `# AT.L2-3.2.1 — Security Awareness — Assessment Objectives

**Domain:** Awareness and Training | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Ensure that managers, systems administrators, and users are aware of the security risks associated with their activities and of the applicable policies, standards, and procedures related to the security of organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Security awareness training program documentation
- Training completion records for all required personnel
- Training content covering relevant policies, risks, and procedures
- Annual training schedule and delivery records
- New hire onboarding training records

## INTERVIEW
Assessors should interview personnel with the following roles:
- HR or training coordinators managing awareness program delivery
- Security officers who developed or oversee the training program
- A sample of users, managers, and system administrators
Discussion topics: What security topics are covered in awareness training? How frequently is training conducted? Can employees describe key security policies after training?

## TEST
Assessors should test the following mechanisms:
- Review training completion records to verify coverage of all required personnel
- Assess training content for coverage of applicable policies and security risks
- Verify that new employees receive training before accessing CUI systems
- Confirm training completion is tracked and non-completion is followed up

## Key Indicators of Compliance
- All personnel complete annual security awareness training
- Training covers CUI handling, phishing, password security, and incident reporting
- Training completion tracked with records maintained
- New employees trained prior to CUI system access

## Common Findings / Deficiencies
- Training completion rates below 100% with no enforcement follow-up
- Training content outdated and not reflecting current threats or policy changes`,
  },
  {
    control_id: 'AT.L2-3.2.2',
    practice_id: 'AT.L2-3.2.2',
    domain_name: 'Awareness and Training',
    title: 'AT.L2-3.2.2 — Role-Based Training — Assessment Objectives',
    content: `# AT.L2-3.2.2 — Role-Based Training — Assessment Objectives

**Domain:** Awareness and Training | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Ensure that personnel are adequately trained to carry out their assigned information security responsibilities.

## EXAMINE
Assessors should examine the following types of evidence:
- Role-based training curriculum documentation
- Training completion records by role (admin, ISSO, developer, etc.)
- Job descriptions and associated security responsibilities
- Training content specific to each role's security duties
- Training gap analysis records

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators to verify technical security training received
- ISSOs and security personnel to confirm role-specific training
- Training coordinators managing role-based training programs
Discussion topics: What role-specific training have you received? Does training cover all security responsibilities in your role? How is training updated when responsibilities change?

## TEST
Assessors should test the following mechanisms:
- Review training records for each key security role to confirm role-specific content was completed
- Assess training materials for alignment with actual role responsibilities
- Verify administrators have received training on specific tools and security configurations they manage
- Confirm training is updated when roles or responsibilities change

## Key Indicators of Compliance
- Role-specific training curricula defined for all key security roles
- Training completion records demonstrate role-appropriate training for all personnel
- Training content covers actual security responsibilities of each role
- Training updated when role responsibilities or systems change

## Common Findings / Deficiencies
- Generic awareness training provided instead of role-specific content
- System administrators without specific training on security functions of systems they manage`,
  },
  {
    control_id: 'AT.L2-3.2.3',
    practice_id: 'AT.L2-3.2.3',
    domain_name: 'Awareness and Training',
    title: 'AT.L2-3.2.3 — Insider Threat Awareness — Assessment Objectives',
    content: `# AT.L2-3.2.3 — Insider Threat Awareness — Assessment Objectives

**Domain:** Awareness and Training | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Provide security awareness training on recognizing and reporting potential insider threats.

## EXAMINE
Assessors should examine the following types of evidence:
- Security awareness training content covering insider threat indicators
- Training completion records for insider threat awareness
- Policy documentation for reporting suspicious insider behavior
- Insider threat program documentation
- Communication records (posters, emails) reinforcing insider threat awareness

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security officers overseeing insider threat program
- HR personnel involved in insider threat monitoring
- A sample of employees to verify insider threat training was received
Discussion topics: Can you describe indicators of insider threat behavior? How would you report concerns about a colleague's behavior? What channels exist for anonymous reporting?

## TEST
Assessors should test the following mechanisms:
- Verify that insider threat content is included in security awareness training materials
- Review training completion records to confirm all personnel received insider threat training
- Confirm reporting mechanism (hotline, email, supervisor) is communicated to all personnel
- Review whether insider threat indicators are discussed in context of real scenarios

## Key Indicators of Compliance
- Insider threat awareness integrated into annual security training
- Personnel can articulate common insider threat indicators
- Clear reporting mechanism exists and is communicated
- Training covers both malicious and inadvertent insider threat scenarios

## Common Findings / Deficiencies
- Insider threat training limited to one slide in annual awareness training without adequate depth
- No clear or accessible reporting channel communicated to employees`,
  },
  // ── AUDIT & ACCOUNTABILITY (AU) ────────────────────────────────────────
  {
    control_id: 'AU.L2-3.3.1',
    practice_id: 'AU.L2-3.3.1',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.1 — System Auditing — Assessment Objectives',
    content: `# AU.L2-3.3.1 — System Auditing — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Create and retain system audit logs and records to the extent needed to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity.

## EXAMINE
Assessors should examine the following types of evidence:
- Audit log policy defining what events are logged and retention periods
- System configurations showing audit logging enabled on all relevant systems
- Sample audit logs from servers, workstations, and network devices
- Log retention records confirming compliance with retention requirements
- SIEM or log aggregation configuration

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who configure audit logging
- SIEM/log management personnel
- Security officers who defined the audit policy
Discussion topics: What events are logged across systems? Where are logs stored and for how long? How are logs protected from tampering?

## TEST
Assessors should test the following mechanisms:
- Perform test actions and verify they appear in audit logs
- Review log coverage across all systems containing CUI
- Verify logs capture: user ID, timestamp, event type, source/destination, outcome
- Confirm log retention meets defined policy requirements (typically 3 years for CUI)

## Key Indicators of Compliance
- Audit logging enabled across all systems containing or accessing CUI
- Logs capture required event types with sufficient detail for investigation
- Logs retained for documented period with access controls on log data
- Centralized log aggregation enables cross-system analysis

## Common Findings / Deficiencies
- Audit logging not enabled on all systems (e.g., workstations missing)
- Log retention shorter than required or logs overwritten without archiving`,
  },
  {
    control_id: 'AU.L2-3.3.2',
    practice_id: 'AU.L2-3.3.2',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.2 — User Accountability — Assessment Objectives',
    content: `# AU.L2-3.3.2 — User Accountability — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Ensure that the actions of individual system users can be uniquely traced to those users so they can be held accountable for their actions.

## EXAMINE
Assessors should examine the following types of evidence:
- Account management policy prohibiting shared accounts
- Audit log samples showing individual user identification for all events
- Shared account exceptions (if any) and compensating controls
- Non-repudiation mechanisms in place for critical actions

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators responsible for account provisioning
- Security officers overseeing accountability requirements
Discussion topics: How are shared accounts handled? How do audit logs uniquely identify individual users? What happens when contractors or vendors need access?

## TEST
Assessors should test the following mechanisms:
- Review audit logs and confirm each event is traceable to an individual user account
- Verify no shared accounts exist without compensating controls and documented justification
- Test that logging persists through account changes (renames, role changes)
- Confirm audit logs cannot be altered by the users whose actions they record

## Key Indicators of Compliance
- All system access traced to individual user accounts
- No shared credentials in use without exceptional compensating controls
- Audit logs immutably tie actions to individual user IDs
- Non-repudiation mechanisms in place for high-impact actions

## Common Findings / Deficiencies
- Shared credentials (e.g., a single "admin" account) used by multiple people
- Audit logs capturing only process or system names rather than individual user IDs`,
  },
  {
    control_id: 'AU.L2-3.3.3',
    practice_id: 'AU.L2-3.3.3',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.3 — Audit Event Review — Assessment Objectives',
    content: `# AU.L2-3.3.3 — Audit Event Review — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Review and update logged events.

## EXAMINE
Assessors should examine the following types of evidence:
- Documented list of auditable event types and rationale for selection
- Records of periodic reviews of auditable event types
- Change history for audit event configurations
- Policy or procedure for reviewing and updating audit event selection

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security officers responsible for audit policy
- System administrators configuring audit events
Discussion topics: How was the initial set of auditable events determined? How often is the event list reviewed? What triggers an update to the auditable events (new threats, regulatory changes)?

## TEST
Assessors should test the following mechanisms:
- Review current auditable events against policy requirements
- Verify that the event list has been reviewed and updated within the defined review cycle
- Confirm audit events align with current threat landscape and system changes
- Check whether event coverage gaps exist (e.g., new systems or applications added without audit configuration)

## Key Indicators of Compliance
- Auditable events defined in policy with documented rationale
- Periodic review of event types performed and documented
- Event coverage updated when new systems or threats identified
- Review process is repeatable and assigned to a responsible party

## Common Findings / Deficiencies
- Audit event list created at initial deployment and never reviewed or updated
- No documented rationale for which events are or are not logged`,
  },
  {
    control_id: 'AU.L2-3.3.4',
    practice_id: 'AU.L2-3.3.4',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.4 — Audit Process Failure Alerting — Assessment Objectives',
    content: `# AU.L2-3.3.4 — Audit Process Failure Alerting — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Alert in the event of an audit logging process failure.

## EXAMINE
Assessors should examine the following types of evidence:
- SIEM or log management alerting configurations for audit failure events
- Alert notification records when audit processes have failed
- Policy defining response procedures for audit process failures
- Monitoring tool configurations capturing audit subsystem health

## INTERVIEW
Assessors should interview personnel with the following roles:
- SIEM/monitoring personnel managing audit alerting
- Security officers responsible for audit continuity
- System administrators who respond to audit failure alerts
Discussion topics: What alerts exist for audit logging failures? Who receives the alerts? What is the response procedure when audit logging fails?

## TEST
Assessors should test the following mechanisms:
- Review SIEM or monitoring tool configuration for audit failure alerting
- Simulate or review past audit failure events and confirm alerts were generated and responded to
- Verify alert notification reaches appropriate personnel (not just logged silently)
- Confirm response procedures exist and are documented

## Key Indicators of Compliance
- Automated alerts configured for audit logging failures across all systems
- Alerts sent to security personnel with defined response timeframes
- Documented response procedure for audit process failures
- Audit failures result in investigation and remediation, not just acknowledgment

## Common Findings / Deficiencies
- Audit failures logged but no alert generated to notify security personnel
- No documented response procedure when audit logging becomes unavailable`,
  },
  {
    control_id: 'AU.L2-3.3.5',
    practice_id: 'AU.L2-3.3.5',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.5 — Audit Correlation — Assessment Objectives',
    content: `# AU.L2-3.3.5 — Audit Correlation — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Correlate audit record review, analysis, and reporting processes for investigation and response to indications of unlawful, unauthorized, suspicious, or unusual activity.

## EXAMINE
Assessors should examine the following types of evidence:
- SIEM configuration showing log source integration and correlation rules
- Correlation rules or use cases defined for anomaly detection
- Incident investigation records demonstrating use of correlated logs
- Reporting templates or dashboards used for audit analysis

## INTERVIEW
Assessors should interview personnel with the following roles:
- SIEM analysts performing log correlation and monitoring
- Incident responders using correlated data for investigations
- Security officers overseeing audit analysis program
Discussion topics: How are logs from different systems correlated? Can you give an example of using correlated audit data in an investigation? How are correlation rules updated?

## TEST
Assessors should test the following mechanisms:
- Review SIEM for integration of all major log sources (AD, endpoints, network, applications)
- Test correlation rules by simulating detectable events and verifying alert generation
- Review past incident investigations to confirm audit correlation was used effectively
- Verify cross-system event correlation enables unified timeline reconstruction

## Key Indicators of Compliance
- All major log sources integrated into centralized SIEM or equivalent
- Correlation rules/use cases defined for known attack patterns
- Correlated analysis used in incident investigations
- Regular review and tuning of correlation rules

## Common Findings / Deficiencies
- Logs collected but siloed in separate systems without correlation capability
- SIEM deployed but correlation rules not tuned to organizational environment`,
  },
  {
    control_id: 'AU.L2-3.3.6',
    practice_id: 'AU.L2-3.3.6',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.6 — Reduction & Reporting — Assessment Objectives',
    content: `# AU.L2-3.3.6 — Reduction & Reporting — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Provide audit record reduction and report generation to support on-demand analysis and reporting.

## EXAMINE
Assessors should examine the following types of evidence:
- Log management tools supporting filtering, searching, and report generation
- Sample audit reports generated from log data
- Documentation of reporting capabilities available to analysts
- Records of on-demand reports generated for investigations

## INTERVIEW
Assessors should interview personnel with the following roles:
- SIEM/log management analysts using reporting tools
- Security officers requesting audit reports
Discussion topics: What tools are available for audit data filtering and reporting? Can you demonstrate generating an on-demand report? How are reports used for compliance and investigation purposes?

## TEST
Assessors should test the following mechanisms:
- Verify that log management tools support on-demand querying and filtering
- Generate a sample report for a specific time period and event type to confirm capability
- Test ability to filter by user, event type, time range, and source system
- Confirm reports include sufficient detail for investigative purposes

## Key Indicators of Compliance
- Log management tools capable of on-demand report generation
- Analysts trained and equipped to generate audit reports
- Reports generated for incidents demonstrate comprehensive audit coverage
- Reporting capability supports both real-time and historical analysis

## Common Findings / Deficiencies
- Raw log data collected but no tooling for effective report generation or analysis
- Reporting capability exists but analysts not trained to use it effectively`,
  },
  {
    control_id: 'AU.L2-3.3.7',
    practice_id: 'AU.L2-3.3.7',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.7 — Authoritative Time Source — Assessment Objectives',
    content: `# AU.L2-3.3.7 — Authoritative Time Source — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Provide a system capability that compares and synchronizes internal system clocks with an authoritative source to generate time stamps for audit records.

## EXAMINE
Assessors should examine the following types of evidence:
- NTP configuration on all systems showing synchronization to authoritative time source
- Time synchronization policy specifying approved time sources
- System clock configuration records for servers, workstations, and network devices
- Logs showing time synchronization events

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators responsible for NTP configuration
- Security officers overseeing time synchronization policy
Discussion topics: What NTP sources are used? How is time synchronization monitored? What happens if a system's time drifts significantly?

## TEST
Assessors should test the following mechanisms:
- Verify NTP configured on all systems to synchronize with approved authoritative sources
- Check that systems are actually synchronized (query NTP status on sample systems)
- Confirm time source is authoritative (stratum 1 or 2 from NIST or equivalent)
- Review audit logs across multiple systems and verify consistent timestamps

## Key Indicators of Compliance
- All systems synchronized to authoritative NTP sources (NIST, USNO, or equivalent)
- Time synchronization monitored and alerting exists for significant drift
- Audit log timestamps consistent across all systems for correlation
- Internal NTP hierarchy properly configured for large environments

## Common Findings / Deficiencies
- Systems using local clock or untrusted NTP source
- Time drift across systems causing inconsistent audit log timestamps`,
  },
  {
    control_id: 'AU.L2-3.3.8',
    practice_id: 'AU.L2-3.3.8',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.8 — Audit Protection — Assessment Objectives',
    content: `# AU.L2-3.3.8 — Audit Protection — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Protect audit information and audit tools from unauthorized access, modification, and deletion.

## EXAMINE
Assessors should examine the following types of evidence:
- Access controls on log management systems and SIEM
- Log forwarding configurations showing logs sent to separate protected storage
- Integrity verification mechanisms for audit data
- Policy on who can access and manage audit logs
- Immutable log storage configuration

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing log storage and access
- Security officers overseeing audit protection policy
Discussion topics: Who has access to audit logs? Can administrators delete or modify audit logs? How is audit log integrity verified?

## TEST
Assessors should test the following mechanisms:
- Attempt to delete or modify audit logs as a standard administrator and verify denial
- Review access permissions on audit storage to confirm restricted access
- Verify logs are forwarded to a system separate from the systems being logged
- Test that log integrity mechanisms detect tampering

## Key Indicators of Compliance
- Audit logs stored in separate, protected storage with restricted access
- Audit administrators cannot also modify the logs they administer
- Write-once or append-only storage used where possible
- Log integrity verified through hashing or other mechanisms

## Common Findings / Deficiencies
- System administrators have delete access to audit logs for systems they manage
- Audit logs stored locally on systems being audited without forwarding`,
  },
  {
    control_id: 'AU.L2-3.3.9',
    practice_id: 'AU.L2-3.3.9',
    domain_name: 'Audit and Accountability',
    title: 'AU.L2-3.3.9 — Audit Management — Assessment Objectives',
    content: `# AU.L2-3.3.9 — Audit Management — Assessment Objectives

**Domain:** Audit and Accountability | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Limit management of audit logging to a subset of privileged users.

## EXAMINE
Assessors should examine the following types of evidence:
- Access control configurations for audit management functions
- List of personnel authorized to manage audit logging
- Separation of duties documentation for audit management
- Audit log showing who has accessed audit management functions

## INTERVIEW
Assessors should interview personnel with the following roles:
- Audit administrators with access to manage logging
- Security officers overseeing audit management access
Discussion topics: Who is authorized to configure audit logging? Is this separated from general system administration? How are audit management actions themselves logged?

## TEST
Assessors should test the following mechanisms:
- Verify that only a limited, authorized subset of users can modify audit configurations
- Confirm audit management functions are logged and traceable
- Test that separation exists between those who manage audit logs and those who are audited
- Review access control lists for audit management consoles

## Key Indicators of Compliance
- Audit management limited to designated, authorized personnel
- Audit management activities are themselves logged
- Separation between audit administrators and general system administrators
- Audit management access reviewed periodically

## Common Findings / Deficiencies
- All system administrators have audit management access without restriction
- No audit trail of who modified audit logging configurations`,
  },
  // ── SECURITY ASSESSMENT (CA) ───────────────────────────────────────────
  {
    control_id: 'CA.L2-3.12.1',
    practice_id: 'CA.L2-3.12.1',
    domain_name: 'Security Assessment',
    title: 'CA.L2-3.12.1 — Security Assessment — Assessment Objectives',
    content: `# CA.L2-3.12.1 — Security Assessment — Assessment Objectives

**Domain:** Security Assessment | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Periodically assess the security controls in organizational systems to determine if the controls are effective in their application.

## EXAMINE
Assessors should examine the following types of evidence:
- Security control assessment plan and schedule
- Completed security assessment reports
- Control effectiveness findings and remediation records
- Assessment methodology documentation
- Records of previous assessments and trend analysis

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security officers responsible for assessment program management
- Personnel who conduct or commission security assessments
- System owners who receive and act on assessment findings
Discussion topics: How often are security controls assessed? Who performs assessments? What happens with findings—how are they tracked and remediated?

## TEST
Assessors should test the following mechanisms:
- Review most recent security assessment report for completeness and currency
- Verify assessment covers all systems in scope and all required control families
- Confirm findings from previous assessments have been remediated or accepted as risk
- Test that assessment methodology is consistent and documented

## Key Indicators of Compliance
- Annual (minimum) security control assessments conducted
- Assessment results documented with findings and recommendations
- Findings tracked through remediation with documented POA&M
- Assessment performed by personnel with appropriate independence

## Common Findings / Deficiencies
- Security assessments conducted but only covering a subset of required controls
- Assessment findings documented but not tracked or remediated systematically`,
  },
  {
    control_id: 'CA.L2-3.12.2',
    practice_id: 'CA.L2-3.12.2',
    domain_name: 'Security Assessment',
    title: 'CA.L2-3.12.2 — Plan of Action — Assessment Objectives',
    content: `# CA.L2-3.12.2 — Plan of Action — Assessment Objectives

**Domain:** Security Assessment | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities in organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Plan of Action and Milestones (POA&M) document
- Remediation tracking records with milestone dates
- Evidence of completed remediation activities
- Risk acceptance records for items not fully remediated
- POA&M review and update records

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security officers managing the POA&M process
- System owners responsible for remediation activities
- Management with oversight of security deficiency remediation
Discussion topics: How are POA&M items prioritized? Who is responsible for remediation actions? How is progress tracked and reported?

## TEST
Assessors should test the following mechanisms:
- Review POA&M for completeness — each item should have owner, timeline, resources, and milestones
- Verify that items from previous assessments are reflected in the POA&M
- Confirm POA&M is reviewed and updated regularly (quarterly minimum)
- Test that completed remediations are verified and closed in the POA&M

## Key Indicators of Compliance
- POA&M maintained for all identified deficiencies
- Each POA&M item has assigned owner, resources, and scheduled completion date
- POA&M reviewed by management on a regular cadence
- Completed items are verified and documented before closure

## Common Findings / Deficiencies
- POA&M items with overdue milestones and no documented justification for delay
- POA&M missing critical information (no owner, no timeline, no resource allocation)`,
  },
  {
    control_id: 'CA.L2-3.12.3',
    practice_id: 'CA.L2-3.12.3',
    domain_name: 'Security Assessment',
    title: 'CA.L2-3.12.3 — Security Control Monitoring — Assessment Objectives',
    content: `# CA.L2-3.12.3 — Security Control Monitoring — Assessment Objectives

**Domain:** Security Assessment | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Monitor security controls on an ongoing basis to ensure the continued effectiveness of the controls.

## EXAMINE
Assessors should examine the following types of evidence:
- Continuous monitoring program documentation
- Monitoring schedules and frequencies for different control types
- Monitoring tool configurations and output reports
- Evidence of ongoing monitoring activities (scan reports, review records)
- Process for escalating and remediating issues found through monitoring

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security officers overseeing the continuous monitoring program
- Personnel who perform ongoing monitoring activities
- System administrators responding to monitoring findings
Discussion topics: What monitoring activities occur between formal assessments? How quickly are monitoring findings addressed? How does monitoring feed into the POA&M?

## TEST
Assessors should test the following mechanisms:
- Review monitoring tool outputs and verify they cover all required control areas
- Confirm monitoring occurs at defined frequencies (not only annually)
- Verify that monitoring findings are documented and tracked for remediation
- Test that monitoring results feed into risk management decisions

## Key Indicators of Compliance
- Defined monitoring program with documented schedules and responsibilities
- Automated tools used for continuous or near-continuous monitoring where feasible
- Monitoring findings tracked and remediated consistent with risk priorities
- Monitoring results used to update security posture assessments

## Common Findings / Deficiencies
- Monitoring limited to annual assessment with no ongoing monitoring activities
- Monitoring tools deployed but outputs not reviewed or acted upon`,
  },
  {
    control_id: 'CA.L2-3.12.4',
    practice_id: 'CA.L2-3.12.4',
    domain_name: 'Security Assessment',
    title: 'CA.L2-3.12.4 — System Security Plan — Assessment Objectives',
    content: `# CA.L2-3.12.4 — System Security Plan — Assessment Objectives

**Domain:** Security Assessment | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems.

## EXAMINE
Assessors should examine the following types of evidence:
- System Security Plan (SSP) document
- System boundary and authorization boundary documentation
- Control implementation descriptions for all CMMC practices
- System interconnection documentation within the SSP
- SSP review and update records

## INTERVIEW
Assessors should interview personnel with the following roles:
- System owner or ISSO responsible for maintaining the SSP
- Security officers overseeing SSP accuracy
- Technical staff who implement controls described in the SSP
Discussion topics: How is the SSP kept current? Who is responsible for updating it? How do technical personnel verify that SSP descriptions match actual implementations?

## TEST
Assessors should test the following mechanisms:
- Review SSP for completeness — must cover all CMMC L2 practices with implementation descriptions
- Verify SSP reflects current system configuration and boundaries
- Confirm SSP was reviewed and updated within the defined period
- Test consistency between SSP descriptions and actual system configurations observed

## Key Indicators of Compliance
- SSP documents all CMMC L2 control implementations with sufficient detail
- System boundaries, interconnections, and data flows accurately described
- SSP reviewed and updated at least annually or when significant changes occur
- SSP approved by appropriate authority and accessible to authorized personnel

## Common Findings / Deficiencies
- SSP with boilerplate or placeholder text not reflecting actual implementation
- SSP not updated after significant system changes or personnel changes`,
  },
  // ── CONFIGURATION MANAGEMENT (CM) ─────────────────────────────────────
  {
    control_id: 'CM.L2-3.4.1',
    practice_id: 'CM.L2-3.4.1',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.1 — System Baselining — Assessment Objectives',
    content: `# CM.L2-3.4.1 — System Baselining — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Establish and maintain baseline configurations and inventories of organizational systems (including hardware, software, firmware, and documentation) throughout the respective system development life cycles.

## EXAMINE
Assessors should examine the following types of evidence:
- System baseline configuration documentation for all major platforms
- Hardware and software inventory records
- Configuration management database (CMDB) or equivalent
- Baseline configuration version history and change records
- Documentation covering servers, workstations, network devices, and mobile devices

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators responsible for maintaining baselines
- Configuration management personnel managing the CMDB
- Security officers overseeing baseline security requirements
Discussion topics: How are baselines established and documented? How are inventory records maintained and kept current? How are deviations from baseline detected?

## TEST
Assessors should test the following mechanisms:
- Review baseline documentation and verify it covers all major system types
- Compare current system configurations against documented baselines
- Verify hardware and software inventory is current and complete
- Confirm baselines are updated when significant changes are made

## Key Indicators of Compliance
- Documented baselines exist for all major system categories
- Hardware and software inventory is comprehensive and current
- Baselines reviewed and updated when systems change
- Deviation detection process exists and is operationalized

## Common Findings / Deficiencies
- Baselines documented at initial deployment but never updated
- Inventory incomplete — missing cloud resources, mobile devices, or recently added systems`,
  },
  {
    control_id: 'CM.L2-3.4.2',
    practice_id: 'CM.L2-3.4.2',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.2 — Security Configuration Enforcement — Assessment Objectives',
    content: `# CM.L2-3.4.2 — Security Configuration Enforcement — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Establish and enforce security configuration settings for information technology products employed in organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Security configuration standards (hardening guides, STIGs, CIS Benchmarks)
- Group Policy Objects or MDM profiles enforcing security settings
- Compliance scan results against security configuration baselines
- Deviation/exception records for settings not meeting baseline

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who apply and enforce security configurations
- Security officers who defined security configuration standards
Discussion topics: What security configuration standards are used? How are settings enforced technically? How are deviations from standards identified and addressed?

## TEST
Assessors should test the following mechanisms:
- Run configuration compliance scan against documented standards and review results
- Verify GPO or MDM policies are applied to all managed systems
- Test that deviations from required configurations are detected and reported
- Confirm security settings are not easily overridden by standard users

## Key Indicators of Compliance
- Security configuration standards based on recognized frameworks (CIS, STIG)
- Technical enforcement through GPO, MDM, or equivalent automated means
- Regular compliance scanning with results reviewed and acted upon
- Documented exception process for approved deviations

## Common Findings / Deficiencies
- Security configurations documented but enforced only manually without technical controls
- Compliance scanning results showing significant deviations not being remediated`,
  },
  {
    control_id: 'CM.L2-3.4.3',
    practice_id: 'CM.L2-3.4.3',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.3 — System Change Control — Assessment Objectives',
    content: `# CM.L2-3.4.3 — System Change Control — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Track, review, approve, and log changes to organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Change management policy and procedures
- Change request records with approval documentation
- Change advisory board (CAB) or equivalent meeting records
- Change log showing approved and completed changes
- Rollback procedures for failed changes

## INTERVIEW
Assessors should interview personnel with the following roles:
- Change management personnel administering the change process
- System administrators who submit and implement changes
- Management who approve significant changes
Discussion topics: How are changes submitted, reviewed, and approved? What constitutes an emergency change? How are changes logged and tracked to completion?

## TEST
Assessors should test the following mechanisms:
- Review a sample of recent changes and verify each followed the change management process
- Verify that changes to CUI systems required appropriate approval before implementation
- Confirm that unauthorized changes are detectable through configuration monitoring
- Test that change records include requester, approver, implementation date, and outcome

## Key Indicators of Compliance
- Formal change management process with defined approval workflows
- All changes to CUI systems documented with approval records
- Change log maintained and reviewable for audit purposes
- Emergency change process defined with post-implementation review requirement

## Common Findings / Deficiencies
- Changes implemented without formal approval or documentation
- Change management process exists but not followed for "minor" changes`,
  },
  {
    control_id: 'CM.L2-3.4.4',
    practice_id: 'CM.L2-3.4.4',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.4 — Security Impact Analysis — Assessment Objectives',
    content: `# CM.L2-3.4.4 — Security Impact Analysis — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Analyze the security impact of changes prior to implementation.

## EXAMINE
Assessors should examine the following types of evidence:
- Change request forms including security impact analysis sections
- Records of security review for significant changes
- Security officer or ISSO sign-off on changes with security implications
- Examples of changes that required additional security controls

## INTERVIEW
Assessors should interview personnel with the following roles:
- Security officers who perform or review security impact analyses
- Change managers who ensure security analysis is completed
- System administrators who conduct technical security reviews
Discussion topics: How is security impact assessed for proposed changes? Who performs the security review? What changes require more rigorous security analysis?

## TEST
Assessors should test the following mechanisms:
- Review a sample of change requests for inclusion of security impact analysis
- Verify that changes with potential security impact received ISSO or security officer review
- Confirm security analysis is performed before implementation, not after
- Test that high-impact changes have more thorough security reviews

## Key Indicators of Compliance
- Security impact analysis required for all changes to CUI systems
- Security personnel involved in reviewing change requests
- Security analysis documented and retained as part of change record
- Risk-based approach — higher impact changes receive more rigorous analysis

## Common Findings / Deficiencies
- Security impact analysis performed informally or not at all for "routine" changes
- Security officer not involved in change review process`,
  },
  {
    control_id: 'CM.L2-3.4.5',
    practice_id: 'CM.L2-3.4.5',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.5 — Access Restrictions for Change — Assessment Objectives',
    content: `# CM.L2-3.4.5 — Access Restrictions for Change — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Define, document, approve, and enforce physical and logical access restrictions associated with changes to organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Access control policies for change implementation roles
- Records of who is authorized to implement changes in production
- Separation of duties documentation for change implementation
- Access control configurations restricting production change capabilities

## INTERVIEW
Assessors should interview personnel with the following roles:
- Change management personnel defining access restrictions
- System administrators with change implementation access
- Security officers overseeing change access controls
Discussion topics: Who is authorized to make changes to production systems? How are change implementation rights controlled? Is there separation between those who request and those who implement changes?

## TEST
Assessors should test the following mechanisms:
- Verify that production change access is restricted to authorized personnel only
- Test that change requesters cannot also implement changes without separate approval
- Review access logs to confirm only authorized personnel made production changes
- Confirm that access for change implementation is granted on a need-to-implement basis

## Key Indicators of Compliance
- Production change access limited to authorized change implementers
- Separation between change requesters and implementers where feasible
- Change implementation access reviewed and revoked when no longer needed
- Access restrictions documented and enforced technically

## Common Findings / Deficiencies
- All administrators have unrestricted production change access without formal controls
- No documentation of who is authorized to implement changes in production`,
  },
  {
    control_id: 'CM.L2-3.4.6',
    practice_id: 'CM.L2-3.4.6',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.6 — Least Functionality — Assessment Objectives',
    content: `# CM.L2-3.4.6 — Least Functionality — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities.

## EXAMINE
Assessors should examine the following types of evidence:
- System hardening documentation showing disabled unnecessary services
- Port and protocol documentation showing only required services enabled
- Application whitelist or software restriction policy configuration
- Vulnerability scan results showing open ports and running services
- Documentation of essential vs. non-essential services decisions

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who configure and harden systems
- Security officers who defined least functionality requirements
Discussion topics: How are "essential" services determined? What process exists to identify and disable unnecessary services? How are new systems reviewed before deployment?

## TEST
Assessors should test the following mechanisms:
- Run port scan against systems and compare results against documented necessary services
- Review running services on servers and workstations for unnecessary components
- Verify that default services installed with OS but not required are disabled
- Test application whitelisting effectiveness by attempting to run unauthorized software

## Key Indicators of Compliance
- Systems configured with only required services and ports enabled
- Hardening applied before systems are placed into production
- Regular scanning to detect unauthorized services or ports
- Application whitelisting or equivalent control in place

## Common Findings / Deficiencies
- Default OS services not reviewed or disabled during system deployment
- Unnecessary services discovered through vulnerability scanning but not remediated`,
  },
  {
    control_id: 'CM.L2-3.4.7',
    practice_id: 'CM.L2-3.4.7',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.7 — Nonessential Functions — Assessment Objectives',
    content: `# CM.L2-3.4.7 — Nonessential Functions — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Restrict, disable, or prevent the use of nonessential programs, functions, ports, protocols, and services.

## EXAMINE
Assessors should examine the following types of evidence:
- Firewall and network configuration showing blocked unnecessary ports/protocols
- Software restriction policy or application control configurations
- List of prohibited or restricted applications/protocols
- Endpoint security configurations blocking non-essential programs
- Exception/waiver records for approved non-standard software

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network administrators managing port and protocol restrictions
- System administrators configuring application controls
- Security officers who defined the list of non-essential functions to restrict
Discussion topics: Which ports, protocols, and applications are prohibited? How are restrictions enforced? How are exceptions handled and documented?

## TEST
Assessors should test the following mechanisms:
- Attempt to use a prohibited protocol or application and verify it is blocked
- Review firewall rules to confirm non-essential ports are blocked
- Test endpoint controls by attempting to run a non-whitelisted application
- Verify that exception/waiver process exists for legitimate business needs

## Key Indicators of Compliance
- Specific list of prohibited programs, ports, and protocols documented
- Technical controls enforce restrictions consistently
- Exception process documented with appropriate approval and review
- Regular review of restrictions against evolving business needs

## Common Findings / Deficiencies
- Restrictions defined in policy but not enforced technically
- Broad exceptions that effectively negate the least-functionality intent`,
  },
  {
    control_id: 'CM.L2-3.4.8',
    practice_id: 'CM.L2-3.4.8',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.8 — Application Execution Policy — Assessment Objectives',
    content: `# CM.L2-3.4.8 — Application Execution Policy — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Apply deny-by-default (blacklisting) or allow-by-exception (whitelisting) policies to prevent the use of unauthorized software.

## EXAMINE
Assessors should examine the following types of evidence:
- Application whitelisting or blacklisting policy documentation
- Technical configuration of application control tools (AppLocker, Ivanti, Carbon Black, etc.)
- Approved software list or application catalog
- Exception/waiver records for non-standard approved software
- Audit logs of application control enforcement events

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing application control tools
- Security officers who defined the application execution policy
- End users to understand the software approval process
Discussion topics: What application control approach is used (whitelist vs. blacklist)? How are new software requests approved and added to the whitelist? How are violations handled?

## TEST
Assessors should test the following mechanisms:
- Attempt to execute an unauthorized application and verify it is blocked
- Review application control configuration for coverage across all endpoints
- Verify approved software list is current and maintained
- Test that application control exceptions are documented and reviewed

## Key Indicators of Compliance
- Application execution policy implemented using whitelist or blacklist controls
- Coverage across all endpoints accessing CUI
- Approved software list maintained and reviewed periodically
- Violations logged and investigated

## Common Findings / Deficiencies
- Reliance on antivirus alone without application execution control
- Whitelist implemented but contains too many broad exceptions to be effective`,
  },
  {
    control_id: 'CM.L2-3.4.9',
    practice_id: 'CM.L2-3.4.9',
    domain_name: 'Configuration Management',
    title: 'CM.L2-3.4.9 — User-Installed Software — Assessment Objectives',
    content: `# CM.L2-3.4.9 — User-Installed Software — Assessment Objectives

**Domain:** Configuration Management | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Control and monitor user-installed software.

## EXAMINE
Assessors should examine the following types of evidence:
- Policy restricting user ability to install software without authorization
- Technical controls preventing unauthorized software installation
- Software installation request and approval records
- Endpoint monitoring tools tracking installed software
- Audit logs of software installation events

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing endpoint software controls
- End users to understand software installation process
- Security officers defining user software installation policy
Discussion topics: Can standard users install software themselves? What approval is required to install new software? How is unauthorized software detected and removed?

## TEST
Assessors should test the following mechanisms:
- Attempt to install unauthorized software as a standard user and verify the action is blocked or requires elevation
- Review endpoint management tools for detected unauthorized software
- Verify that recently installed software was approved through proper channels
- Confirm monitoring tools alert on unapproved software installation

## Key Indicators of Compliance
- Standard users cannot install software without elevation or IT approval
- All software installations tracked and attributable to authorized requests
- Unauthorized software detected and removed promptly
- Software installation audited and reviewed regularly

## Common Findings / Deficiencies
- Users granted local administrator rights enabling unrestricted software installation
- No monitoring of installed software inventory against approved list`,
  },
  // ── IDENTIFICATION & AUTHENTICATION (IA) ───────────────────────────────
  {
    control_id: 'IA.L2-3.5.1',
    practice_id: 'IA.L2-3.5.1',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.1 — User Identification — Assessment Objectives',
    content: `# IA.L2-3.5.1 — User Identification — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Identify system users, processes acting on behalf of users, and devices.

## EXAMINE
Assessors should examine the following types of evidence:
- User account inventory and management records
- Device and service account inventories
- Identity management system configuration
- Naming conventions and account standards documentation

## INTERVIEW
Assessors should interview personnel with the following roles:
- Identity and access management (IAM) administrators
- System administrators managing accounts
- Security officers overseeing identity policy
Discussion topics: How are users, devices, and processes uniquely identified? What prevents two entities from sharing an identifier? How are identifiers managed through their lifecycle?

## TEST
Assessors should test the following mechanisms:
- Review account lists for uniqueness — verify no duplicate identifiers
- Confirm devices and service accounts have unique identifiers
- Verify terminated user identifiers are not reused or reassigned
- Test that system processes run under identified, documented accounts

## Key Indicators of Compliance
- All users, devices, and processes have unique identifiers
- Identifiers not reused across different entities
- Identifier assignment and management governed by documented policy
- Identifier lifecycle managed (creation, modification, disabling, deletion)

## Common Findings / Deficiencies
- Shared accounts used for system services without unique identifiers
- No inventory of service accounts and their associated processes`,
  },
  {
    control_id: 'IA.L2-3.5.2',
    practice_id: 'IA.L2-3.5.2',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.2 — User Authentication — Assessment Objectives',
    content: `# IA.L2-3.5.2 — User Authentication — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Authenticate (or verify) the identities of users, processes, or devices, as a prerequisite to allowing access to organizational systems.

## EXAMINE
Assessors should examine the following types of evidence:
- Authentication policy and standards documentation
- System configurations requiring authentication before access
- Authentication logs showing verification events
- Authenticator management procedures

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who configure authentication requirements
- Security officers defining authentication standards
Discussion topics: What authentication methods are required for different system types? Are there any systems that allow access without authentication? How are service accounts authenticated?

## TEST
Assessors should test the following mechanisms:
- Attempt to access CUI systems without authenticating and verify denial
- Verify authentication is required for all access paths (local, remote, API)
- Confirm service accounts use credentials or certificates for authentication
- Test that authentication cannot be bypassed through alternative access paths

## Key Indicators of Compliance
- All system access requires authentication as a prerequisite
- No unauthenticated access paths to systems containing CUI
- Service accounts and processes authenticated with appropriate mechanisms
- Authentication events logged for all access

## Common Findings / Deficiencies
- Legacy applications or APIs accessible without authentication
- Service accounts with no credential or with hardcoded credentials in scripts`,
  },
  {
    control_id: 'IA.L2-3.5.3',
    practice_id: 'IA.L2-3.5.3',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.3 — Multifactor Authentication — Assessment Objectives',
    content: `# IA.L2-3.5.3 — Multifactor Authentication — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Use multifactor authentication for local and network access to privileged accounts and for network access to non-privileged accounts.

## EXAMINE
Assessors should examine the following types of evidence:
- MFA policy specifying where MFA is required
- Identity provider (IdP) or directory configurations showing MFA enforcement
- MFA enrollment records for all required accounts
- Conditional access policies enforcing MFA
- Exception documentation for accounts not currently using MFA

## INTERVIEW
Assessors should interview personnel with the following roles:
- IAM administrators managing MFA deployment
- Security officers who defined MFA policy
- End users to confirm MFA experience for both privileged and standard access
Discussion topics: What MFA methods are approved? Is MFA enforced for all network access? How are MFA exceptions handled? How is MFA enforced even for local privileged access?

## TEST
Assessors should test the following mechanisms:
- Attempt network access with password only (no second factor) and verify it is denied
- Verify privileged accounts require MFA for both local and network access
- Review IdP conditional access policies to confirm MFA enforcement scope
- Check for any bypass rules or exceptions that weaken MFA requirements

## Key Indicators of Compliance
- MFA enforced for all privileged accounts (local and network access)
- MFA enforced for all non-privileged accounts accessing the network
- MFA method is phishing-resistant (FIDO2, PIV/CAC) or at minimum app-based TOTP
- No unintended MFA bypass conditions in conditional access policies

## Common Findings / Deficiencies
- MFA deployed only for remote access but not for internal network privileged access
- SMS-based MFA used which is susceptible to SIM swapping attacks`,
  },
  {
    control_id: 'IA.L2-3.5.4',
    practice_id: 'IA.L2-3.5.4',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.4 — Replay-Resistant Authentication — Assessment Objectives',
    content: `# IA.L2-3.5.4 — Replay-Resistant Authentication — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ replay-resistant authentication mechanisms for network access to privileged and non-privileged accounts.

## EXAMINE
Assessors should examine the following types of evidence:
- Authentication protocol documentation showing use of replay-resistant mechanisms
- System configurations showing Kerberos, TLS, or certificate-based authentication
- Evidence that challenge-response or one-time-password mechanisms are in use
- Absence of legacy protocols susceptible to replay attacks (NTLM, basic auth over HTTP)

## INTERVIEW
Assessors should interview personnel with the following roles:
- Network architects who designed authentication infrastructure
- System administrators configuring authentication protocols
- Security officers overseeing authentication standards
Discussion topics: What authentication protocols are in use? Has the use of NTLM or other replay-susceptible protocols been audited and restricted? How are replay attacks mitigated?

## TEST
Assessors should test the following mechanisms:
- Review authentication configurations for use of replay-resistant protocols
- Test for NTLM usage and verify it is restricted where possible
- Confirm session tokens are invalidated after use or time expiry
- Verify Kerberos is primary authentication protocol for Windows environments

## Key Indicators of Compliance
- Modern authentication protocols (Kerberos, TLS mutual auth, FIDO2) in use
- Legacy replay-susceptible protocols (NTLM, basic HTTP auth) restricted or eliminated
- One-time codes or challenge-response mechanisms used where applicable
- Authentication tokens include time-stamp or nonce preventing replay

## Common Findings / Deficiencies
- NTLM still widely used without restriction despite Kerberos being available
- Basic authentication over HTTP in use for legacy applications`,
  },
  {
    control_id: 'IA.L2-3.5.5',
    practice_id: 'IA.L2-3.5.5',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.5 — Identifier Management — Assessment Objectives',
    content: `# IA.L2-3.5.5 — Identifier Management — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ the following practices for identifier management: receive authorization for individual, group, role, or device identifiers; select identifiers that identify an individual, group, role, or device; prevent reuse of identifiers for a defined period; disable identifiers after a defined inactivity period.

## EXAMINE
Assessors should examine the following types of evidence:
- Account management policy covering identifier lifecycle
- Account provisioning approval records
- Policy on identifier reuse and inactivity disabling
- Account audit reports showing dormant/disabled accounts
- Directory configuration showing inactivity threshold settings

## INTERVIEW
Assessors should interview personnel with the following roles:
- IAM or Active Directory administrators
- HR personnel involved in provisioning/deprovisioning
- Security officers overseeing identifier management policy
Discussion topics: How long before an inactive account is disabled? How long before an identifier can be reused? What authorization is needed to create a new identifier?

## TEST
Assessors should test the following mechanisms:
- Review directory configuration for inactivity timeout settings
- Verify disabled accounts have not had their identifiers reassigned too soon
- Test that identifier assignment requires documented authorization
- Review dormant accounts and confirm they are disabled within policy timeframes

## Key Indicators of Compliance
- Identifier reuse prevention period defined (typically 90 days+)
- Inactivity threshold configured and enforced (typically 30-90 days)
- Identifier creation requires formal authorization
- Regular audit of identifier status conducted

## Common Findings / Deficiencies
- No inactivity threshold configured — dormant accounts remain active indefinitely
- Identifiers reassigned to new users immediately after previous user departure`,
  },
  {
    control_id: 'IA.L2-3.5.6',
    practice_id: 'IA.L2-3.5.6',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.6 — Authenticator Management — Assessment Objectives',
    content: `# IA.L2-3.5.6 — Authenticator Management — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Employ the following practices for authenticator management: protect authenticators commensurate with the security category of the information the authenticator provides access to; change default authenticators prior to system use; establish and implement administrative procedures for lost, compromised, or damaged authenticators; change authenticators for group/shared accounts when membership changes.

## EXAMINE
Assessors should examine the following types of evidence:
- Password/authenticator policy documentation
- Records of default credential changes on new systems
- Lost/compromised authenticator response procedures
- Shared account credential rotation records
- Authenticator storage and protection configurations

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators managing default and service account credentials
- Security officers overseeing authenticator policy
- Help desk personnel handling lost authenticator requests
Discussion topics: How are default credentials changed before system deployment? What is the process for reporting and responding to compromised credentials? How are shared account passwords rotated when membership changes?

## TEST
Assessors should test the following mechanisms:
- Review recently deployed systems to confirm default credentials were changed
- Test the lost authenticator response procedure for completeness
- Verify that shared account passwords were rotated when a member left the group
- Confirm password storage uses hashing with appropriate algorithms

## Key Indicators of Compliance
- All default passwords changed before systems are deployed
- Documented procedure for lost/compromised authenticator response
- Shared account credential rotation tied to membership changes
- Authenticators stored with appropriate protection (hashed, not plain text)

## Common Findings / Deficiencies
- Network equipment or applications deployed with default vendor credentials unchanged
- No process to rotate shared account credentials when team membership changes`,
  },
  {
    control_id: 'IA.L2-3.5.7',
    practice_id: 'IA.L2-3.5.7',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.7 — Password Complexity — Assessment Objectives',
    content: `# IA.L2-3.5.7 — Password Complexity — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Enforce a minimum password complexity and change of characters when new passwords are created.

## EXAMINE
Assessors should examine the following types of evidence:
- Password policy documentation specifying complexity requirements
- Group Policy or IdP configurations enforcing complexity
- Evidence that complexity requirements are applied at password creation
- Rationale for complexity requirements based on current NIST guidance

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators who configure password policies
- Security officers who defined password complexity standards
Discussion topics: What are the current password complexity requirements? Are complexity requirements aligned with NIST SP 800-63B guidance? Are passphrases supported?

## TEST
Assessors should test the following mechanisms:
- Attempt to set a password that does not meet complexity requirements and verify rejection
- Review GPO or IdP password policy configuration
- Verify complexity requirements include minimum length, character variety, or equivalent
- Confirm policy applies consistently to all user types (standard and privileged)

## Key Indicators of Compliance
- Password complexity policy defined and technically enforced
- Complexity requirements meet or exceed organizational risk threshold (per NIST 800-63B)
- Requirements apply to all account types consistently
- Policy reviewed when NIST or other guidance is updated

## Common Findings / Deficiencies
- Password complexity configured in AD but not enforced in cloud or application systems
- Overly restrictive complexity requirements leading to users writing down passwords`,
  },
  {
    control_id: 'IA.L2-3.5.8',
    practice_id: 'IA.L2-3.5.8',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.8 — Password Reuse — Assessment Objectives',
    content: `# IA.L2-3.5.8 — Password Reuse — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Prohibit password reuse for a specified number of generations.

## EXAMINE
Assessors should examine the following types of evidence:
- Password policy documentation specifying reuse prohibition
- Technical configuration showing password history enforcement
- Directory or IdP configuration for password history count
- Policy for minimum password age (to prevent rapid cycling)

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators configuring password history
- Security officers defining password reuse policy
Discussion topics: How many previous passwords are remembered and prohibited from reuse? Is a minimum password age set to prevent cycling? How is this policy applied to cloud and SaaS systems?

## TEST
Assessors should test the following mechanisms:
- Attempt to reuse a recent password and verify rejection
- Review directory/IdP configuration for password history count
- Verify minimum password age is set to prevent circumventing history
- Confirm password reuse prevention applies to privileged accounts

## Key Indicators of Compliance
- Password history configured to prevent reuse of recent passwords (typically last 5-24)
- Minimum password age set to prevent rapid cycling through history
- Policy applies consistently to all accounts and systems
- Configuration reviewed and updated based on current guidance

## Common Findings / Deficiencies
- Password history configured in AD but not in cloud applications
- Minimum password age not set, allowing immediate cycling through history`,
  },
  {
    control_id: 'IA.L2-3.5.9',
    practice_id: 'IA.L2-3.5.9',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.9 — Temporary Passwords — Assessment Objectives',
    content: `# IA.L2-3.5.9 — Temporary Passwords — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Allow temporary password use for system logons with an immediate change to a permanent password.

## EXAMINE
Assessors should examine the following types of evidence:
- Password reset and new account provisioning procedures
- System configuration requiring password change at first logon
- Help desk records showing temporary password issuance
- Policy specifying requirements for temporary password use

## INTERVIEW
Assessors should interview personnel with the following roles:
- Help desk personnel who issue temporary passwords
- System administrators configuring first-login password requirements
- New employees who have received temporary passwords
Discussion topics: How are temporary passwords communicated to users? Is a password change enforced at first login? How long are temporary passwords valid?

## TEST
Assessors should test the following mechanisms:
- Log in with a temporary or reset password and verify that immediate change is required
- Verify temporary passwords expire quickly if not used
- Confirm temporary passwords meet complexity requirements
- Test that temporary passwords are not reusable after the user changes them

## Key Indicators of Compliance
- System enforces password change immediately upon first use of temporary password
- Temporary passwords have short validity period (e.g., 24-72 hours)
- Temporary passwords communicated through secure channels
- Users cannot log in with temporary passwords after changing them

## Common Findings / Deficiencies
- Systems configured with default temporary passwords that do not expire
- No technical enforcement of immediate password change at first login`,
  },
  {
    control_id: 'IA.L2-3.5.10',
    practice_id: 'IA.L2-3.5.10',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.10 — Protect Cryptographic Authenticators — Assessment Objectives',
    content: `# IA.L2-3.5.10 — Protect Cryptographic Authenticators — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Store and transmit only cryptographically-protected passwords.

## EXAMINE
Assessors should examine the following types of evidence:
- Password storage configuration showing hashing algorithms used
- Authentication system documentation for password handling
- Evidence of salted hash storage (bcrypt, scrypt, PBKDF2, Argon2)
- TLS configuration for password transmission
- Results of any cryptographic validation testing

## INTERVIEW
Assessors should interview personnel with the following roles:
- System administrators/developers responsible for authentication systems
- Security officers verifying cryptographic standards compliance
Discussion topics: What hashing algorithm is used to store passwords? Are passwords transmitted over encrypted channels? How are passwords validated — are clear-text versions ever stored?

## TEST
Assessors should test the following mechanisms:
- Review authentication system code or configuration for password storage method
- Verify passwords are never stored in plaintext or reversibly encrypted form
- Confirm password transmission uses TLS 1.2 or higher
- Test that applications authenticate without ever storing or accessing clear-text passwords

## Key Indicators of Compliance
- Passwords stored using strong one-way hashing with salt (bcrypt, Argon2, PBKDF2)
- Password transmission exclusively over encrypted channels
- Clear-text passwords never stored, logged, or transmitted
- Cryptographic algorithms meet NIST/FIPS standards

## Common Findings / Deficiencies
- Passwords stored as MD5 or SHA1 hashes without salt (inadequate protection)
- Legacy systems transmitting passwords over HTTP or unencrypted protocols`,
  },
  {
    control_id: 'IA.L2-3.5.11',
    practice_id: 'IA.L2-3.5.11',
    domain_name: 'Identification and Authentication',
    title: 'IA.L2-3.5.11 — Obscure Feedback — Assessment Objectives',
    content: `# IA.L2-3.5.11 — Obscure Feedback — Assessment Objectives

**Domain:** Identification and Authentication | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Obscure feedback of authentication information during the authentication process to protect the information from possible exploitation/use by unauthorized individuals.

## EXAMINE
Assessors should examine the following types of evidence:
- System login screen behavior (password field masking)
- Application authentication interface configurations
- Web application login page configurations
- Documentation of obscured feedback requirements

## INTERVIEW
Assessors should interview personnel with the following roles:
- Application developers responsible for authentication interfaces
- System administrators configuring login interfaces
Discussion topics: Are password fields masked on all systems? Can users see their passwords during entry? Are there any systems that display passwords in clear text during entry?

## TEST
Assessors should test the following mechanisms:
- Log in to each system and verify password is masked (displayed as asterisks or dots)
- Check web application login pages for password field type configuration
- Test that authentication failure messages do not reveal whether the username or password was incorrect (generic error messaging)
- Verify no application logs or error messages contain user-entered passwords

## Key Indicators of Compliance
- All authentication interfaces mask passwords during entry
- Error messages do not distinguish between invalid username and invalid password
- No authentication data visible in application logs or debug output
- Password show/hide toggles do not expose credentials to shoulder surfing

## Common Findings / Deficiencies
- Custom or legacy applications displaying authentication data in clear text
- Error messages providing enumeration information (e.g., "username not found")`,
  },
  // ── INCIDENT RESPONSE (IR) ─────────────────────────────────────────────
  {
    control_id: 'IR.L2-3.6.1',
    practice_id: 'IR.L2-3.6.1',
    domain_name: 'Incident Response',
    title: 'IR.L2-3.6.1 — Incident Handling — Assessment Objectives',
    content: `# IR.L2-3.6.1 — Incident Handling — Assessment Objectives

**Domain:** Incident Response | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Establish an operational incident-handling capability for organizational systems that includes preparation, detection, analysis, containment, recovery, and user response activities.

## EXAMINE
Assessors should examine the following types of evidence:
- Incident response plan (IRP) documentation
- Incident response team (IRT) composition and contact list
- Records of past incident handling activities
- Incident categorization and escalation criteria
- Post-incident review records and lessons learned

## INTERVIEW
Assessors should interview personnel with the following roles:
- Incident response team members and lead
- Security officers overseeing incident response program
- Management responsible for incident escalation decisions
Discussion topics: What triggers an incident declaration? What are the phases of your incident response process? Have you handled a real incident — walk through what happened?

## TEST
Assessors should test the following mechanisms:
- Review IRP for completeness — must cover all phases (prepare, detect, analyze, contain, recover, respond)
- Verify IRT contact information is current and personnel have been trained
- Review at least one past incident to assess whether IRP was followed
- Confirm roles and responsibilities are clearly defined and personnel understand them

## Key Indicators of Compliance
- Documented IRP approved by management covering all IR phases
- Trained incident response team with clear roles and responsibilities
- IRP tested at least annually (tabletop exercise or simulated incident)
- Post-incident reviews conducted and lessons learned incorporated

## Common Findings / Deficiencies
- IRP exists as a document but has never been tested or exercised
- No clear criteria for what constitutes a reportable incident`,
  },
  {
    control_id: 'IR.L2-3.6.2',
    practice_id: 'IR.L2-3.6.2',
    domain_name: 'Incident Response',
    title: 'IR.L2-3.6.2 — Incident Reporting — Assessment Objectives',
    content: `# IR.L2-3.6.2 — Incident Reporting — Assessment Objectives

**Domain:** Incident Response | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Track, document, and report incidents to designated officials and/or authorities both internal and external to the organization.

## EXAMINE
Assessors should examine the following types of evidence:
- Incident reporting policy specifying internal and external reporting requirements
- Incident tracking records and tickets
- Reports submitted to government authorities (DIBNet, US-CERT) for past incidents
- Internal escalation and notification records
- Contractor reporting requirements from contracts

## INTERVIEW
Assessors should interview personnel with the following roles:
- Incident response personnel responsible for documentation and reporting
- Management who receive and act on incident reports
- Legal/compliance personnel familiar with external reporting obligations
Discussion topics: What incidents require external reporting? What are the reporting timeframes required by contracts? How are incidents documented internally?

## TEST
Assessors should test the following mechanisms:
- Review incident tracking system for completeness of incident records
- Verify at least one past incident had complete documentation and appropriate reporting
- Confirm reporting timeframes are defined and have been met
- Test that internal escalation paths reach appropriate decision makers

## Key Indicators of Compliance
- All incidents tracked in a centralized system with complete documentation
- External reporting obligations clearly defined and personnel trained
- Reporting timeframes met for incidents requiring government notification
- Internal escalation completed within defined timeframes

## Common Findings / Deficiencies
- No formal incident tracking system — incidents handled informally without documentation
- Personnel unaware of external reporting obligations to DoD or US-CERT`,
  },
  {
    control_id: 'IR.L2-3.6.3',
    practice_id: 'IR.L2-3.6.3',
    domain_name: 'Incident Response',
    title: 'IR.L2-3.6.3 — Incident Response Testing — Assessment Objectives',
    content: `# IR.L2-3.6.3 — Incident Response Testing — Assessment Objectives

**Domain:** Incident Response | **Level:** CMMC Level 2 | **Source:** CMMC Assessment Guide (CAG)

## Practice Statement
Test the organizational incident response capability.

## EXAMINE
Assessors should examine the following types of evidence:
- Incident response exercise records (tabletop, simulation, full exercise)
- Exercise plans and scenarios used for testing
- After-action reports from exercises
- Records of IRP updates made based on exercise findings
- Training records for incident response team

## INTERVIEW
Assessors should interview personnel with the following roles:
- Incident response lead who organizes and conducts exercises
- IRT members who participate in exercises
- Management who oversee IR testing requirements
Discussion topics: When was the last IR exercise conducted? What scenario was tested? What improvements were made based on exercise findings?

## TEST
Assessors should test the following mechanisms:
- Review exercise records to verify testing occurred within required frequency
- Assess exercise scope — does it test the full IR process or only partial activities?
- Review after-action reports for substance — were realistic findings identified?
- Verify that exercise findings resulted in IRP updates or improvements

## Key Indicators of Compliance
- IR capability tested at least annually through tabletop or simulation exercise
- Exercise scenarios are realistic and test critical IR scenarios
- After-action report documents findings and corrective actions
- IRP updated based on exercise results and lessons learned

## Common Findings / Deficiencies
- No documented IR exercises conducted in the past year
- Tabletop exercises conducted but no after-action report or follow-through on findings`,
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
        message: `CMMC CAG ingest-1 (AC–IR) complete`,
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
