-- Insert NIST CSF 2.0 Core Functions as documents
DO $$
DECLARE
    nist_framework_id UUID;
    nist_source_id UUID;
BEGIN
    -- Get NIST CSF framework ID
    SELECT id INTO nist_framework_id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF';
    
    -- Get NIST CSF source ID
    SELECT id INTO nist_source_id FROM sources WHERE framework_id = nist_framework_id LIMIT 1;
    
    -- Insert Core Functions
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - GOVERN Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'GOVERN establishes and monitors the organization''s cybersecurity risk management strategy, expectations, and policy. The GOVERN function provides leadership with the necessary visibility into cybersecurity risk and the steps being taken to manage it. This includes establishing organizational context, risk management strategy, roles and responsibilities, policies, and oversight.',
     '{"function_name": "GOVERN", "function_abbreviation": "GV", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - IDENTIFY Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'IDENTIFY helps the organization understand and manage cybersecurity risk to systems, people, assets, data, and capabilities. The activities in the IDENTIFY Function are foundational for effective use of the Framework. Understanding the business context, the resources that support critical functions, and the related cybersecurity risks enables an organization to focus and prioritize its efforts, consistent with its risk management strategy.',
     '{"function_name": "IDENTIFY", "function_abbreviation": "ID", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - PROTECT Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'PROTECT supports the ability to limit or contain the impact of a cybersecurity event. Examples of outcomes within this function include: Identity Management and Access Control; Awareness and Training; Data Security; Platform Security; and Technology Infrastructure Resilience. The PROTECT function ensures appropriate safeguards are in place to protect critical infrastructure services.',
     '{"function_name": "PROTECT", "function_abbreviation": "PR", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - DETECT Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'DETECT helps the organization identify the occurrence of a cybersecurity event in a timely manner. Examples of outcomes within this function include: Continuous Monitoring; and Adverse Event Analysis. The DETECT function enables organizations to discover cybersecurity events and potential incidents quickly.',
     '{"function_name": "DETECT", "function_abbreviation": "DE", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - RESPOND Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'RESPOND supports the ability to contain the impact of a cybersecurity event. Examples of outcomes within this function include: Incident Management; Incident Analysis; Incident Response Mitigation; and Incident Response Reporting. The RESPOND function ensures appropriate activities are taken to contain and mitigate incidents.',
     '{"function_name": "RESPOND", "function_abbreviation": "RS", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'NIST CSF 2.0 - RECOVER Function', 'framework', 'https://www.nist.gov/cyberframework', '2.0',
     'RECOVER supports timely restoration of any capabilities or services that were impaired due to a cybersecurity event. Examples of outcomes within this function include: Incident Recovery Plan Execution; and Incident Recovery Communication. The RECOVER function supports recovery activities and communicates results.',
     '{"function_name": "RECOVER", "function_abbreviation": "RC", "version": "2.0"}', true);

    -- Insert Category-level documents  
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (nist_source_id, nist_framework_id, 'GV.OC - Organizational Context', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization understands its context and circumstances, including its mission, stakeholders, governing requirements, and dependencies. This category ensures leadership has visibility into the organizational environment and can make informed risk decisions. Key outcomes include understanding mission and values, stakeholder needs, legal requirements, dependencies, and risk appetite.',
     '{"category_id": "GV.OC", "category_name": "Organizational Context", "function_name": "GOVERN", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'GV.RM - Risk Management Strategy', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization establishes and communicates a cybersecurity risk management strategy. This includes defining risk management objectives, risk appetite and tolerance, assessment methods, and response strategies. The strategy should be aligned with organizational goals and communicated to all stakeholders.',
     '{"category_id": "GV.RM", "category_name": "Risk Management Strategy", "function_name": "GOVERN", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'ID.AM - Asset Management', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The data, personnel, devices, systems, and facilities that enable the organization to achieve business purposes are identified and managed consistent with their relative importance to business objectives and the organization''s risk strategy. This includes hardware, software, data, personnel, and facility inventories.',
     '{"category_id": "ID.AM", "category_name": "Asset Management", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'ID.RA - Risk Assessment', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization understands and manages cybersecurity risk to organizational operations, organizational assets, individuals, and other organizations. Risk assessment processes identify, estimate, and prioritize risk to organizational operations and assets.',
     '{"category_id": "ID.RA", "category_name": "Risk Assessment", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.AA - Identity Management, Authentication, and Access Control', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'Access to physical and logical assets is authorized, managed, and governed appropriately. This includes identity management and authentication processes, access control mechanisms, and review of access privileges.',
     '{"category_id": "PR.AA", "category_name": "Identity Management, Authentication, and Access Control", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.AT - Awareness and Training', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization provides cybersecurity awareness and training. Personnel receive role-specific training and are equipped to perform their information security-related duties and responsibilities consistent with related policies and procedures.',
     '{"category_id": "PR.AT", "category_name": "Awareness and Training", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.DS - Data Security', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'Data are managed and protected consistent with the organization''s risk strategy to protect the confidentiality, integrity, and availability of information. This includes data classification, protection processes, encryption, and availability protections.',
     '{"category_id": "PR.DS", "category_name": "Data Security", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'DE.CM - Continuous Monitoring', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'The organization monitors for cybersecurity events and anomalies. Continuous monitoring ensures the organization can identify potential cybersecurity incidents. This includes network monitoring, service monitoring, and detection of unauthorized activity.',
     '{"category_id": "DE.CM", "category_name": "Continuous Monitoring", "function_name": "DETECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'RS.MA - Incident Management', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'Incidents are managed to ensure appropriate response and recovery activities are executed including incident handling, tracking, and lessons learned.',
     '{"category_id": "RS.MA", "category_name": "Incident Management", "function_name": "RESPOND", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'RC.RP - Incident Recovery Plan Execution', 'guideline', 'https://www.nist.gov/cyberframework', '2.0',
     'Recovery activities are executed to restore impaired capabilities or services. Recovery plans are executed to ensure timely restoration of operations.',
     '{"category_id": "RC.RP", "category_name": "Incident Recovery Plan Execution", "function_name": "RECOVER", "version": "2.0"}', true);

    -- Insert Control-level documents
    INSERT INTO documents (source_id, framework_id, title, document_type, url, version, raw_content, metadata, is_indexed) VALUES
    (nist_source_id, nist_framework_id, 'ID.AM-01 - Hardware Asset Inventory', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'All hardware assets are identified and inventoried. Organizations should maintain an up-to-date inventory of all hardware assets including servers, workstations, laptops, mobile devices, and network equipment. The inventory should include asset ownership, location, and business function.',
     '{"control_id": "ID.AM-01", "category_id": "ID.AM", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'ID.AM-02 - Software Asset Inventory', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'All software assets are identified and inventoried. Organizations should maintain an inventory of all software including operating systems, applications, and utilities. The inventory should include version information, licensing status, and business purpose.',
     '{"control_id": "ID.AM-02", "category_id": "ID.AM", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'ID.RA-01 - Risk Assessment Process', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Cybersecurity risk assessment processes are established and managed. Organizations should define and implement a risk assessment methodology that identifies risks, determines their likelihood and impact, and prioritizes them for treatment.',
     '{"control_id": "ID.RA-01", "category_id": "ID.RA", "function_name": "IDENTIFY", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.AA-01 - Identity Management', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Identity management and authentication processes are established and managed. Organizations should implement identity and access management controls including user provisioning, authentication mechanisms, and access reviews.',
     '{"control_id": "PR.AA-01", "category_id": "PR.AA", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.DS-01 - Data Classification', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Data classification processes are established and managed. Organizations should classify data based on sensitivity and criticality. Classification levels should guide the implementation of appropriate security controls.',
     '{"control_id": "PR.DS-01", "category_id": "PR.DS", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'PR.DS-02 - Data Protection', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Data protection processes are established and managed. Organizations should implement data protection controls appropriate to the classification level, including encryption, access controls, and data loss prevention.',
     '{"control_id": "PR.DS-02", "category_id": "PR.DS", "function_name": "PROTECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'DE.CM-01 - Network Monitoring', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Network monitoring processes are established and managed. Organizations should implement network monitoring to detect unauthorized activity, anomalies, and potential security events.',
     '{"control_id": "DE.CM-01", "category_id": "DE.CM", "function_name": "DETECT", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'RS.MA-01 - Incident Management Process', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Incident management processes are established and managed. Organizations should implement incident response capabilities including preparation, detection, containment, eradication, recovery, and lessons learned.',
     '{"control_id": "RS.MA-01", "category_id": "RS.MA", "function_name": "RESPOND", "version": "2.0"}', true),
     
    (nist_source_id, nist_framework_id, 'RC.RP-01 - Recovery Plan Execution', 'control', 'https://www.nist.gov/cyberframework', '2.0',
     'Recovery plan execution processes are established and managed. Organizations should maintain and test recovery plans to ensure timely restoration of critical capabilities and services following an incident.',
     '{"control_id": "RC.RP-01", "category_id": "RC.RP", "function_name": "RECOVER", "version": "2.0"}', true);

END $$;