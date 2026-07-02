-- Migration 017: Procedure, POA&M, and Gap Assessment for Tier 1 frameworks
-- Frameworks: NIST CSF, ISO 27001, CMMC, SP 800-53
-- Safe to re-run: all inserts guarded with WHERE NOT EXISTS.

-- ═════════════════════════════════════════
-- NIST CSF
-- ═════════════════════════════════════════

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'NIST CSF Implementation Procedure', 'procedure',
  'Step-by-step implementation procedure for a NIST Cybersecurity Framework function or category. Scope by CSF function (Identify, Protect, Detect, Respond, Recover) for targeted procedures.',
  false
FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'procedure'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'NIST CSF Plan of Action & Milestones (POA&M)', 'poam',
  'POA&M for tracking NIST CSF gaps, remediation owners, risk levels, and due dates across all five functions.',
  false
FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'poam'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'NIST CSF Gap Assessment', 'gap_assessment',
  'Readiness gap assessment comparing current cybersecurity posture to NIST CSF requirements. Scope by function (Identify, Protect, Detect, Respond, Recover) for targeted analysis.',
  false
FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'gap_assessment'
);

-- NIST CSF sections
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'controls');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'findings', 'Findings Register', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'findings');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'gap_table', 'Gap Analysis Table', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'NIST CSF' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'gap_table');

-- ═════════════════════════════════════════
-- ISO 27001
-- ═════════════════════════════════════════

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'ISO 27001 Implementation Procedure', 'procedure',
  'Step-by-step ISMS implementation procedure for an ISO 27001 Annex A control domain. Scope by control domain (e.g., Access Control, Cryptography, Physical Security) for targeted procedures.',
  false
FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'procedure'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'ISO 27001 Plan of Action & Milestones (POA&M)', 'poam',
  'POA&M for tracking ISO 27001 nonconformities, remediation owners, risk ratings, and target closure dates across all Annex A control domains.',
  false
FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'poam'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'ISO 27001 Gap Assessment', 'gap_assessment',
  'ISMS readiness gap assessment comparing current controls to ISO 27001 Annex A requirements. Scope by control domain for focused analysis ahead of certification audit.',
  false
FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'gap_assessment'
);

-- ISO 27001 sections
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'controls');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'findings', 'Findings Register', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'findings');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'gap_table', 'Gap Analysis Table', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'ISO 27001' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'gap_table');

-- ═════════════════════════════════════════
-- CMMC 2.0
-- ═════════════════════════════════════════

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'CMMC Implementation Procedure', 'procedure',
  'Step-by-step implementation procedure for a CMMC 2.0 domain. Scope by domain (e.g., Access Control, Incident Response, Risk Management) for targeted Level 2 practice procedures.',
  false
FROM compliance_frameworks WHERE abbreviation = 'CMMC'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'CMMC' AND t.template_type = 'procedure'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'CMMC Plan of Action & Milestones (POA&M)', 'poam',
  'POA&M for tracking CMMC Level 2 practice gaps, remediation milestones, risk scores, and due dates across all 14 domains.',
  false
FROM compliance_frameworks WHERE abbreviation = 'CMMC'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'CMMC' AND t.template_type = 'poam'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'CMMC Gap Assessment', 'gap_assessment',
  'CMMC Level 2 readiness gap assessment comparing current implementation to all 110 practices. Scope by domain for focused analysis ahead of C3PAO assessment.',
  false
FROM compliance_frameworks WHERE abbreviation = 'CMMC'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'CMMC' AND t.template_type = 'gap_assessment'
);

-- CMMC sections
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'controls');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'findings', 'Findings Register', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'findings');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'gap_table', 'Gap Analysis Table', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'CMMC' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'gap_table');

-- ═════════════════════════════════════════
-- SP 800-53
-- ═════════════════════════════════════════

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'SP 800-53 Implementation Procedure', 'procedure',
  'Step-by-step implementation procedure for an SP 800-53 control family. Scope by control family (e.g., Access Control, Audit and Accountability, Configuration Management) for targeted procedures.',
  false
FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'procedure'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'SP 800-53 Plan of Action & Milestones (POA&M)', 'poam',
  'POA&M for tracking SP 800-53 control deficiencies, remediation owners, risk impact levels, and scheduled completion dates across all 20 control families.',
  false
FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'poam'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'SP 800-53 Gap Assessment', 'gap_assessment',
  'Control gap assessment comparing current implementation to SP 800-53 Rev 5 baselines (Low/Moderate/High). Scope by control family for focused analysis.',
  false
FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'gap_assessment'
);

-- SP 800-53 sections
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'procedure'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'controls');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'findings', 'Findings Register', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'poam'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'findings');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'gap_table', 'Gap Analysis Table', 3, true
FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation = 'SP 800-53' AND t.template_type = 'gap_assessment'
  AND t.id NOT IN (SELECT template_id FROM template_sections WHERE section_key = 'gap_table');
