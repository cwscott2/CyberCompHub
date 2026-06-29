-- Add missing policy and checklist templates for all frameworks
-- Uses CTEs to avoid repeating framework ID lookups

-- ============================================================
-- CMMC — add Policy template (only has checklist today)
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'CMMC Information Security Policy', 'policy',
              'Organizational information security policy aligned to CMMC Level 2 requirements', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',         1),
  ('introduction', 'Purpose and Scope',       2),
  ('controls',     'Policy Statements',       3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- NIST RMF — add Checklist template (only has policy today)
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST RMF'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'RMF Step Checklist', 'checklist',
              'Step-by-step checklist for executing the NIST Risk Management Framework', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',    1),
  ('introduction', 'Introduction',       2),
  ('checklist',    'RMF Step Checklist', 3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- NIST AI RMF — add Checklist template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST AI RMF'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'AI RMF Implementation Checklist', 'checklist',
              'Checklist for implementing GOVERN, MAP, MEASURE, and MANAGE functions', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',    1),
  ('introduction', 'Introduction',       2),
  ('checklist',    'AI RMF Checklist',   3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- ISO 42001 — add Checklist template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 42001'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'ISO 42001 Compliance Checklist', 'checklist',
              'Checklist for ISO/IEC 42001 AI management system requirements', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',         1),
  ('introduction', 'Introduction',            2),
  ('checklist',    'ISO 42001 Checklist',     3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- EU AI Act — Policy + Checklist
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'EU AI Act'),
     pol AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'EU AI Act Compliance Policy', 'policy',
              'Organizational policy for EU AI Act compliance covering risk classification and obligations', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT pol.id, s.section_key, s.display_name, s.section_order, true
FROM pol, (VALUES
  ('header',       'Document Header',      1),
  ('introduction', 'Purpose and Scope',    2),
  ('controls',     'Compliance Policies',  3)
) AS s(section_key, display_name, section_order);

WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'EU AI Act'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'EU AI Act Compliance Checklist', 'checklist',
              'Risk classification and obligation checklist for EU AI Act compliance', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',          1),
  ('introduction', 'Introduction',             2),
  ('checklist',    'EU AI Act Checklist',      3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- NIST AI 100-1 — Policy + Checklist
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST AI 100-1'),
     pol AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'Trustworthy AI Policy', 'policy',
              'Policy for implementing NIST AI 100-1 trustworthy AI characteristics', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT pol.id, s.section_key, s.display_name, s.section_order, true
FROM pol, (VALUES
  ('header',       'Document Header',    1),
  ('introduction', 'Purpose and Scope',  2),
  ('controls',     'Policy Statements',  3)
) AS s(section_key, display_name, section_order);

WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST AI 100-1'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'Trustworthy AI Checklist', 'checklist',
              'Implementation checklist for all 7 NIST AI 100-1 trustworthy characteristics', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',            1),
  ('introduction', 'Introduction',               2),
  ('checklist',    'Trustworthy AI Checklist',   3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- MITRE ATLAS — Policy + Checklist
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'MITRE ATLAS'),
     pol AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'AI Threat Defense Policy', 'policy',
              'Policy for defending AI/ML systems against adversarial threats per MITRE ATLAS', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT pol.id, s.section_key, s.display_name, s.section_order, true
FROM pol, (VALUES
  ('header',       'Document Header',    1),
  ('introduction', 'Purpose and Scope',  2),
  ('controls',     'Policy Statements',  3)
) AS s(section_key, display_name, section_order);

WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'MITRE ATLAS'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'ATLAS Threat Assessment Checklist', 'checklist',
              'Checklist for assessing AI system defenses against ATLAS adversarial tactics', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',           1),
  ('introduction', 'Introduction',              2),
  ('checklist',    'ATLAS Defense Checklist',   3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- DoD AI Ethics — Policy + Checklist
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'DoD AI Ethics'),
     pol AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'Responsible AI Policy', 'policy',
              'Organizational policy for DoD AI Ethical Principles and Responsible AI adoption', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT pol.id, s.section_key, s.display_name, s.section_order, true
FROM pol, (VALUES
  ('header',       'Document Header',    1),
  ('introduction', 'Purpose and Scope',  2),
  ('controls',     'Policy Statements',  3)
) AS s(section_key, display_name, section_order);

WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'DoD AI Ethics'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'Responsible AI Checklist', 'checklist',
              'Checklist for implementing the five DoD AI Ethical Principles', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',          1),
  ('introduction', 'Introduction',             2),
  ('checklist',    'Responsible AI Checklist', 3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- OECD AI Principles — Policy + Checklist
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'OECD AI Principles'),
     pol AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'OECD AI Principles Policy', 'policy',
              'Policy for aligning organizational AI practices with OECD AI Principles', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT pol.id, s.section_key, s.display_name, s.section_order, true
FROM pol, (VALUES
  ('header',       'Document Header',    1),
  ('introduction', 'Purpose and Scope',  2),
  ('controls',     'Policy Statements',  3)
) AS s(section_key, display_name, section_order);

WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'OECD AI Principles'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'OECD AI Principles Checklist', 'checklist',
              'Checklist for implementing OECD AI value-based principles and policymaker recommendations', false
       FROM fw
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',            1),
  ('introduction', 'Introduction',               2),
  ('checklist',    'OECD Principles Checklist',  3)
) AS s(section_key, display_name, section_order);
