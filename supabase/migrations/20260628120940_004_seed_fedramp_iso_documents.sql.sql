-- Insert FedRAMP baseline controls
DO $$
DECLARE
    fedramp_framework_id UUID;
    fedramp_source_id UUID;
BEGIN
    SELECT id INTO fedramp_framework_id FROM compliance_frameworks WHERE abbreviation = 'FedRAMP';
    SELECT id INTO fedramp_source_id FROM sources WHERE framework_id = fedramp_framework_id LIMIT 1;
    
    -- FedRAMP Control Families
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (fedramp_source_id, fedramp_framework_id, 'AC - Access Control', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Access Control (AC) controls ensure that information system access is authorized and managed. This control family addresses identification and authentication, access enforcement, information flow enforcement, separation of duties, and least privilege.',
     '{"control_family": "AC", "family_name": "Access Control", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'AU - Audit and Accountability', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Audit and Accountability (AU) controls ensure that organizational actions can be traced to the responsible individuals. This includes audit event generation, audit review and analysis, and audit reporting.',
     '{"control_family": "AU", "family_name": "Audit and Accountability", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'CM - Configuration Management', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Configuration Management (CM) controls ensure that systems are configured securely and changes are managed. This includes baseline configurations, change control, and security impact analysis.',
     '{"control_family": "CM", "family_name": "Configuration Management", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'IA - Identification and Authentication', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Identification and Authentication (IA) controls verify the identity of users, processes, or devices. This includes identifier management, authenticator management, and authenticator type requirements.',
     '{"control_family": "IA", "family_name": "Identification and Authentication", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'IR - Incident Response', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Incident Response (IR) controls ensure organizations respond to and recover from security incidents. This includes incident handling, monitoring, and reporting.',
     '{"control_family": "IR", "family_name": "Incident Response", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'SC - System and Communications Protection', 'guideline', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'System and Communications Protection (SC) controls protect information in transit and at rest. This includes boundary protection, cryptographic protection, and session security.',
     '{"control_family": "SC", "family_name": "System and Communications Protection", "version": "Rev5"}', true);
     
    -- FedRAMP Specific Controls
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (fedramp_source_id, fedramp_framework_id, 'AC-2 - Account Management', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Account Management - Organizations manage information system accounts, including creating, activating, modifying, reviewing, and deactivating accounts. Account management includes user, group, and system accounts.',
     '{"control_id": "AC-2", "control_family": "AC", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'AC-3 - Access Enforcement', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Access Enforcement - Organizations enforce approved authorizations for logical access to information and system resources in accordance with applicable access control policies.',
     '{"control_id": "AC-3", "control_family": "AC", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'AU-2 - Audit Events', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Audit Events - Organizations identify events that need to be audited and the frequency of auditing for each identified event. Audit events should include start/stop of audit functions, access authorization events, and privilege operations.',
     '{"control_id": "AU-2", "control_family": "AU", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'CM-2 - Baseline Configuration', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Baseline Configuration - Organizations develop, document, and maintain a baseline configuration of the information system. The baseline configuration includes software, hardware, and network topology.',
     '{"control_id": "CM-2", "control_family": "CM", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'IA-2 - Identification and Authentication', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Identification and Authentication - Organizations uniquely identify and authenticate organizational users and processes. Implementation includes multifactor authentication for privileged access and network access.',
     '{"control_id": "IA-2", "control_family": "IA", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'SC-7 - Boundary Protection', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Boundary Protection - Organizations protect the boundaries of information systems. This includes monitoring and controlling communications at external boundaries and key internal boundaries.',
     '{"control_id": "SC-7", "control_family": "SC", "version": "Rev5"}', true),
     
    (fedramp_source_id, fedramp_framework_id, 'SC-8 - Transmission Confidentiality and Integrity', 'control', 'https://www.fedramp.gov/baselines/', 'Rev5',
     'Transmission Confidentiality and Integrity - Organizations protect the confidentiality and integrity of transmitted information using cryptographic mechanisms. Implementation includes TLS for all external connections.',
     '{"control_id": "SC-8", "control_family": "SC", "version": "Rev5"}', true);
END $$;

-- Insert ISO 27001 Annex A Controls
DO $$
DECLARE
    iso_framework_id UUID;
    iso_source_id UUID;
BEGIN
    SELECT id INTO iso_framework_id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001';
    SELECT id INTO iso_source_id FROM sources WHERE framework_id = iso_framework_id LIMIT 1;
    
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (iso_source_id, iso_framework_id, 'ISO 27001 Annex A.5 - Organizational Controls', 'guideline', 'https://www.iso.org/standard/27001', '2022',
     'Annex A.5 Organizational Controls covers policies, roles, responsibilities, authorities, and the governance of information security. Key controls include information security policies, organization of information security, human resource security, and asset management.',
     '{"annex": "A.5", "annex_name": "Organizational Controls", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'ISO 27001 Annex A.6 - People Controls', 'guideline', 'https://www.iso.org/standard/27001', '2022',
     'Annex A.6 People Controls addresses personnel security from hiring through termination. Covers screening, terms of employment, management responsibilities, information security awareness/education, and disciplinary process.',
     '{"annex": "A.6", "annex_name": "People Controls", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'ISO 27001 Annex A.7 - Physical Controls', 'guideline', 'https://www.iso.org/standard/27001', '2022',
     'Annex A.7 Physical Controls covers physical security perimeters, entry controls, securing offices/rooms, protecting equipment, secure disposal, and supporting utilities.',
     '{"annex": "A.7", "annex_name": "Physical Controls", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'ISO 27001 Annex A.8 - Technological Controls', 'guideline', 'https://www.iso.org/standard/27001', '2022',
     'Annex A.8 Technological Controls addresses user endpoint security, access control, cryptography, operational security, secure development, supplier relationships, and incident management.',
     '{"annex": "A.8", "annex_name": "Technological Controls", "version": "2022"}', true);
     
    -- Specific ISO 27001 Controls
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (iso_source_id, iso_framework_id, 'A.5.1 - Policies for Information Security', 'control', 'https://www.iso.org/standard/27001', '2022',
     'Information security policy and topic-specific policies shall be defined, approved by management, communicated to employees and relevant external parties, and reviewed at planned intervals or if significant changes occur.',
     '{"control_id": "A.5.1", "annex": "A.5", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'A.5.10 - Acceptable Use of Information', 'control', 'https://www.iso.org/standard/27001', '2022',
     'Rules and procedures for the acceptable use of information and other assets associated with information processing facilities shall be identified, documented, and communicated to employees.',
     '{"control_id": "A.5.10", "annex": "A.5", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'A.8.2 - Privileged Access Rights', 'control', 'https://www.iso.org/standard/27001', '2022',
     'The allocation and use of privileged access rights shall be restricted and managed. Privileged access rights shall be authorized and based on the principle of least privilege.',
     '{"control_id": "A.8.2", "annex": "A.8", "version": "2022"}', true),
     
    (iso_source_id, iso_framework_id, 'A.8.24 - Cryptography', 'control', 'https://www.iso.org/standard/27001', '2022',
     'The use of cryptographic techniques shall be governed and managed to protect the confidentiality, authenticity, and integrity of information. Cryptographic controls shall be implemented according to organizational policy.',
     '{"control_id": "A.8.24", "annex": "A.8", "version": "2022"}', true);
END $$;