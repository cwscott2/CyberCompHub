-- Add procedure templates for 6 frameworks
-- Section keys: header, introduction, controls
-- Safe to re-run (WHERE NOT EXISTS guard on each insert)

-- ============================================================
-- CMMC — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'CMMC Security Procedures', 'procedure',
              'Step-by-step security procedures aligned to CMMC Level 2 domains', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- FedRAMP Moderate — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE name = 'FedRAMP Moderate'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'FedRAMP Moderate Security Procedures', 'procedure',
              'Step-by-step security procedures for FedRAMP Moderate authorization controls', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- SP 800-53 — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'SP 800-53 Security Procedures', 'procedure',
              'Step-by-step security procedures for SP 800-53 Rev 5 control families', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- NIST CSF — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'NIST CSF Security Procedures', 'procedure',
              'Step-by-step security procedures organized by CSF function', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- ISO 27001 — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'ISO 27001 Security Procedures', 'procedure',
              'Step-by-step security procedures organized by ISO 27001 annex', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- NIST RMF — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST RMF'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'NIST RMF Security Procedures', 'procedure',
              'Step-by-step security procedures organized by RMF step', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);
