-- Migration 009: Template expansion for PCI DSS, HIPAA, GDPR, CIS Controls, SOC 2, EU AI Act
-- Adds policy + checklist (and procedure where high-value) templates for all new frameworks.
-- Safe to re-run: uses WHERE NOT EXISTS guards on inserts.

-- ─────────────────────────────────────────
-- PCI DSS v4.0
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'PCI DSS v4 Security Policy', 'policy',
  'Information security policy covering all 12 PCI DSS v4.0 requirements. Scope by requirement number for targeted policies.',
  true
FROM compliance_frameworks WHERE abbreviation = 'PCI DSS'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'PCI DSS' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'PCI DSS v4 Compliance Checklist', 'checklist',
  'Requirement-by-requirement compliance checklist for PCI DSS v4.0. Scope by requirement number for scoped assessments.',
  false
FROM compliance_frameworks WHERE abbreviation = 'PCI DSS'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'PCI DSS' AND t.template_type = 'checklist'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'PCI DSS v4 Implementation Procedure', 'procedure',
  'Step-by-step implementation procedure for a specific PCI DSS v4.0 requirement. Must be scoped to a single requirement.',
  false
FROM compliance_frameworks WHERE abbreviation = 'PCI DSS'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'PCI DSS' AND t.template_type = 'procedure'
);

-- ─────────────────────────────────────────
-- HIPAA Security Rule
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'HIPAA Security Policy', 'policy',
  'HIPAA Security Rule policy covering Administrative, Physical, and Technical safeguards. Scope by safeguard type for targeted policies.',
  true
FROM compliance_frameworks WHERE abbreviation = 'HIPAA'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'HIPAA' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'HIPAA Security Rule Checklist', 'checklist',
  'HIPAA Security Rule implementation checklist covering required and addressable specifications. Scope by safeguard type.',
  false
FROM compliance_frameworks WHERE abbreviation = 'HIPAA'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'HIPAA' AND t.template_type = 'checklist'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'HIPAA Safeguard Implementation Procedure', 'procedure',
  'Detailed implementation procedure for a HIPAA safeguard category. Must be scoped to Administrative, Physical, or Technical.',
  false
FROM compliance_frameworks WHERE abbreviation = 'HIPAA'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'HIPAA' AND t.template_type = 'procedure'
);

-- ─────────────────────────────────────────
-- GDPR
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'GDPR Compliance Policy', 'policy',
  'GDPR data protection policy covering key obligations across all chapters. Scope by chapter for targeted policies.',
  true
FROM compliance_frameworks WHERE abbreviation = 'GDPR'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'GDPR' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'GDPR Compliance Checklist', 'checklist',
  'GDPR obligation checklist covering data subject rights, processing requirements, and controller/processor duties.',
  false
FROM compliance_frameworks WHERE abbreviation = 'GDPR'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'GDPR' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- CIS Controls v8
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'CIS Controls v8 Security Policy', 'policy',
  'Security policy aligned to CIS Controls v8. Scope by Implementation Group (IG1/IG2/IG3) for right-sized coverage.',
  true
FROM compliance_frameworks WHERE abbreviation = 'CIS Controls'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'CIS Controls' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'CIS Controls v8 Implementation Checklist', 'checklist',
  'CIS Controls v8 implementation checklist. Scope by Implementation Group (IG1 = basic, IG2 = foundational, IG3 = organizational).',
  false
FROM compliance_frameworks WHERE abbreviation = 'CIS Controls'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'CIS Controls' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- SOC 2
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'SOC 2 Trust Services Policy', 'policy',
  'SOC 2 policy covering the five Trust Service Criteria. Scope by trust service category for targeted policies.',
  true
FROM compliance_frameworks WHERE abbreviation = 'SOC 2'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'SOC 2' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'SOC 2 Criteria Checklist', 'checklist',
  'SOC 2 readiness checklist covering all AICPA Trust Service Criteria. Scope by category for audit preparation.',
  false
FROM compliance_frameworks WHERE abbreviation = 'SOC 2'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'SOC 2' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- EU AI Act
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'EU AI Act Compliance Policy', 'policy',
  'AI governance policy aligned to EU AI Act obligations. Covers risk classification, conformity assessment, and provider/deployer duties.',
  true
FROM compliance_frameworks WHERE abbreviation = 'EU AI Act'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'EU AI Act' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'EU AI Act Compliance Checklist', 'checklist',
  'EU AI Act obligation checklist covering prohibited practices, high-risk AI requirements, transparency, and GPAI model duties.',
  false
FROM compliance_frameworks WHERE abbreviation = 'EU AI Act'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'EU AI Act' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- Add default template_sections for all new templates
-- (header + introduction + controls — same pattern as migration 002)
-- ─────────────────────────────────────────
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation IN ('PCI DSS', 'HIPAA', 'GDPR', 'CIS Controls', 'SOC 2', 'EU AI Act')
AND t.id NOT IN (SELECT DISTINCT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation IN ('PCI DSS', 'HIPAA', 'GDPR', 'CIS Controls', 'SOC 2', 'EU AI Act')
AND t.id NOT IN (SELECT DISTINCT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation IN ('PCI DSS', 'HIPAA', 'GDPR', 'CIS Controls', 'SOC 2', 'EU AI Act')
AND t.id NOT IN (SELECT DISTINCT template_id FROM template_sections WHERE section_key = 'controls');
