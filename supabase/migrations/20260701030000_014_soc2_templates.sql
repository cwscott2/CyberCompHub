-- Migration 014: SOC 2 Procedure, POA&M, and Gap Assessment templates
-- SOC 2 currently has Policy + Checklist only (migration 009).
-- Safe to re-run: uses WHERE NOT EXISTS guards on all inserts.

-- ─────────────────────────────────────────
-- SOC 2 — Procedure
-- (family-scoped by trust_service_category in wizard)
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'SOC 2 Trust Service Criteria Procedure', 'procedure',
  'Step-by-step implementation procedure for a SOC 2 Trust Service Criteria category. Scope by trust service category (Security, Availability, Processing Integrity, Confidentiality, Privacy).',
  false
FROM compliance_frameworks WHERE abbreviation = 'SOC 2'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'SOC 2' AND t.template_type = 'procedure'
);

-- ─────────────────────────────────────────
-- SOC 2 — POA&M
-- (flat finding register — not family-scoped)
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'SOC 2 Plan of Action & Milestones (POA&M)', 'poam',
  'SOC 2 POA&M for tracking audit findings, remediation owners, risk levels, and due dates across all Trust Service Criteria.',
  false
FROM compliance_frameworks WHERE abbreviation = 'SOC 2'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'SOC 2' AND t.template_type = 'poam'
);

-- ─────────────────────────────────────────
-- SOC 2 — Gap Assessment
-- (family-scoped by trust_service_category in wizard)
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'SOC 2 Gap Assessment', 'gap_assessment',
  'SOC 2 readiness gap assessment comparing current controls to AICPA Trust Service Criteria requirements. Scope by trust service category for focused assessments.',
  false
FROM compliance_frameworks WHERE abbreviation = 'SOC 2'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'SOC 2' AND t.template_type = 'gap_assessment'
);

-- ─────────────────────────────────────────
-- Sections: Procedure → header, introduction, controls
-- ─────────────────────────────────────────
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'controls');

-- ─────────────────────────────────────────
-- Sections: POA&M → header, introduction, findings
-- ─────────────────────────────────────────
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'findings', 'Findings Register', 3, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'findings');

-- ─────────────────────────────────────────
-- Sections: Gap Assessment → header, introduction, gap_table
-- ─────────────────────────────────────────
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'gap_table', 'Gap Analysis Table', 3, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SOC 2'
  AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'gap_table');
