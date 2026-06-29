-- Seed compliance frameworks
INSERT INTO compliance_frameworks (name, abbreviation, description, version, category, official_url, color_hex) VALUES
('NIST Cybersecurity Framework', 'NIST CSF', 'A voluntary framework providing a policy framework of computer security guidance for how private sector organizations in the United States can assess and improve their ability to prevent, detect, and respond to cyber attacks.', '2.0', 'nist', 'https://www.nist.gov/cyberframework', '#0078D4'),
('NIST Risk Management Framework', 'NIST RMF', 'A structured process that integrates security, privacy, and cyber supply chain risk management activities into the system development life cycle.', NULL, 'nist', 'https://csrc.nist.gov/projects/risk-management', '#0078D4'),
('NIST SP 800-53', 'SP 800-53', 'Security and Privacy Controls for Information Systems and Organizations - a comprehensive catalog of security and privacy controls.', '5.0', 'nist', 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final', '#0078D4'),
('FedRAMP', 'FedRAMP', 'Federal Risk and Authorization Management Program - standardized approach to security assessment, authorization, and continuous monitoring for cloud products and services.', NULL, 'fedramp', 'https://www.fedramp.gov', '#00A651'),
('CMMC', 'CMMC', 'Cybersecurity Maturity Model Certification - a unified standard for implementing cybersecurity across the Defense Industrial Base.', '2.0', 'cmmc', 'https://dodcio.defense.gov/CMMC', '#FFA500'),
('ISO/IEC 27001', 'ISO 27001', 'International standard for information security management systems (ISMS), providing requirements for establishing, implementing, maintaining and continually improving an ISMS.', '2022', 'iso', 'https://www.iso.org/standard/27001', '#2574A9'),
('ISO/IEC 27002', 'ISO 27002', 'ISO/IEC 27002 provides guidelines and general principles for initiating, implementing, maintaining, and improving information security management.', '2022', 'iso', 'https://www.iso.org/standard/75639.html', '#2574A9'),
('SOX', 'SOX', 'Sarbanes-Oxley Act - US law mandating strict reforms to improve financial disclosures and prevent accounting fraud, including IT security requirements.', '2002', 'sox', 'https://www.sec.gov/oxley-article.htm', '#DC143C'),
('NIST AI Risk Management Framework', 'NIST AI RMF', 'Framework for managing risks associated with artificial intelligence and machine learning systems.', '1.0', 'ai-safety', 'https://www.nist.gov/itl/ai-risk-management-framework', '#00CED1'),
('ISO/IEC 42001', 'ISO 42001', 'AI Management System standard - specifies requirements for establishing, implementing, maintaining, and continually improving an AI management system.', '2023', 'ai-safety', 'https://www.iso.org/standard/81230.html', '#00CED1');

-- Seed sources for scraping
INSERT INTO sources (framework_id, name, url, source_type, scraper_type, refresh_frequency, parse_config) VALUES
-- NIST CSF
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'), 'NIST CSF Official', 'https://www.nist.gov/cyberframework', 'webpage', 'nist-csf', 'monthly', '{"parse_mode": "framework"}'),
-- NIST RMF  
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST RMF'), 'NIST RMF Official', 'https://csrc.nist.gov/projects/risk-management', 'webpage', 'nist-rmf', 'monthly', '{"parse_mode": "framework"}'),
-- NIST SP 800-53
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'), 'NIST SP 800-53 Controls', 'https://csrc.nist.gov/Projects/risk-management/sp800-53-controls', 'json', 'nist-json', 'monthly', '{"parse_mode": "controls", "format": "json"}'),
-- FedRAMP
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'FedRAMP'), 'FedRAMP Documents', 'https://www.fedramp.gov/baselines/', 'webpage', 'generic-webpage', 'monthly', '{"parse_mode": "documents"}'),
-- CMMC
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'), 'CMMC Model', 'https://dodcio.defense.gov/CMMC/Model/', 'webpage', 'cmmc-web', 'monthly', '{"parse_mode": "model"}'),
-- ISO 27001
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'), 'ISO 27001 Overview', 'https://www.iso.org/standard/27001', 'webpage', 'generic-webpage', 'quarterly', '{"parse_mode": "overview"}'),
-- ISO 27002
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27002'), 'ISO 27002 Overview', 'https://www.iso.org/standard/75639.html', 'webpage', 'generic-webpage', 'quarterly', '{"parse_mode": "overview"}'),
-- SOX
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SOX'), 'SEC SOX Resources', 'https://www.sec.gov/oxley-article.htm', 'webpage', 'generic-webpage', 'quarterly', '{"parse_mode": "documents"}'),
-- AI RMF
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST AI RMF'), 'NIST AI RMF', 'https://www.nist.gov/itl/ai-risk-management-framework', 'webpage', 'generic-webpage', 'monthly', '{"parse_mode": "framework"}'),
-- ISO 42001
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 42001'), 'ISO 42001 Overview', 'https://www.iso.org/standard/81230.html', 'webpage', 'generic-webpage', 'quarterly', '{"parse_mode": "overview"}');

-- Seed default templates for each framework type
INSERT INTO templates (framework_id, name, template_type, description, is_default) VALUES
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'), 'CSF Policy Template', 'policy', 'NIST Cybersecurity Framework policy document template covering all five core functions.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'), 'CSF Control Checklist', 'checklist', 'Checklist of NIST CSF controls and subcategories for compliance assessment.', false),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST RMF'), 'RMF Package Template', 'policy', 'Risk Management Framework authorization package template.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'), 'SP 800-53 Control Template', 'policy', 'Security and privacy control implementation template for SP 800-53.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'), 'SP 800-53 Checklist', 'checklist', 'Comprehensive checklist of SP 800-53 controls.', false),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'FedRAMP'), 'FedRAMP SSP Template', 'policy', 'Federal Risk and Authorization Management Program System Security Plan template.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'), 'CMMC Assessment Template', 'checklist', 'CMMC assessment checklist for practices and processes.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'), 'ISO 27001 ISMS Policy', 'policy', 'Information Security Management System policy template aligned with ISO 27001.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'), 'ISO 27001 Controls Checklist', 'checklist', 'Checklist of ISO 27001 Annex A controls.', false),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SOX'), 'SOX IT Controls Template', 'policy', 'Sarbanes-Oxley IT general controls documentation template.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'SOX'), 'SOX Compliance Checklist', 'checklist', 'SOX Section 404 compliance checklist for IT controls.', false),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST AI RMF'), 'AI RMF Policy Template', 'policy', 'AI Risk Management Framework policy and governance template.', true),
((SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 42001'), 'ISO 42001 AIMS Template', 'policy', 'AI Management System policy template aligned with ISO 42001.', true);

-- Seed template sections for default templates
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required, prompt_template) VALUES
-- Header section (for all templates)
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'header', 'Document Header', 1, true, NULL),
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'introduction', 'Introduction', 2, true, 'Purpose and scope of this {framework} compliance document.'),
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'controls', 'Controls and Requirements', 3, true, 'Detailed control requirements mapped to the framework.'),
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'implementation', 'Implementation Guidance', 4, false, 'Guidance for implementing the controls and requirements.'),
((SELECT id FROM templates WHERE name = 'CSF Policy Template'), 'appendix', 'Appendix', 5, false, 'Additional references and resources.'),

-- Checklist template sections
((SELECT id FROM templates WHERE name = 'CSF Control Checklist'), 'header', 'Document Header', 1, true, NULL),
((SELECT id FROM templates WHERE name = 'CSF Control Checklist'), 'introduction', 'Introduction', 2, true, 'Overview of the {framework} controls covered in this checklist.'),
((SELECT id FROM templates WHERE name = 'CSF Control Checklist'), 'checklist', 'Compliance Checklist', 3, true, NULL);

-- Add sections to other templates similarly
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t WHERE t.id NOT IN (SELECT DISTINCT template_id FROM template_sections)
UNION ALL
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t WHERE t.id NOT IN (SELECT DISTINCT template_id FROM template_sections)
UNION ALL
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t WHERE t.is_default = true AND t.id NOT IN (SELECT DISTINCT template_id FROM template_sections);