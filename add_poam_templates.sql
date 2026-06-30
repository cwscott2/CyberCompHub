-- Add POA&M (Plan of Action & Milestones) templates
-- Frameworks: CMMC, FedRAMP Moderate, SP 800-53
-- POA&M is a flat finding register — no family-scoped generation needed
-- Section keys: header, introduction, findings

-- ============================================================
-- CMMC — POA&M template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'CMMC Plan of Action & Milestones (POA&M)', 'poam',
              'Tracks open findings, remediation owners, and due dates for CMMC Level 2 assessment gaps', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'poam'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',            1),
  ('introduction', 'Purpose and Scope',          2),
  ('findings',     'Plan of Action & Milestones',3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- FedRAMP Moderate — POA&M template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE name = 'FedRAMP Moderate'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'FedRAMP Moderate Plan of Action & Milestones (POA&M)', 'poam',
              'Tracks open findings, remediation owners, and due dates for FedRAMP Moderate authorization gaps', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'poam'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',            1),
  ('introduction', 'Purpose and Scope',          2),
  ('findings',     'Plan of Action & Milestones',3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- SP 800-53 — POA&M template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'SP 800-53 Plan of Action & Milestones (POA&M)', 'poam',
              'Tracks open findings, remediation owners, and due dates for SP 800-53 Rev 5 control gaps', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'poam'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',            1),
  ('introduction', 'Purpose and Scope',          2),
  ('findings',     'Plan of Action & Milestones',3)
) AS s(section_key, display_name, section_order);
