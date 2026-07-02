-- Migration 015: Policy + Checklist templates for all remaining frameworks
-- Covers: CMMC, NIST RMF, NIST AI RMF, ISO 42001, FedRAMP (base + High/Moderate/Low),
--         NIST AI 100-1, MITRE ATLAS, DoD AI Ethics, OECD AI Principles
-- Follows migration 009 pattern exactly: all templates get header/introduction/controls sections.
-- Safe to re-run: all inserts guarded with WHERE NOT EXISTS.

-- ─────────────────────────────────────────
-- HOTFIX: Remove spurious 'controls' sections from SOC 2 POA&M and Gap Assessment.
-- Those templates were seeded earlier with a generic 'controls' section (order 3).
-- Migration 014 then correctly added 'findings' and 'gap_table' at order 3, creating
-- duplicate section_order entries. Remove the stale 'controls' sections here.
-- ─────────────────────────────────────────
DELETE FROM template_sections
WHERE section_key = 'controls'
  AND template_id IN (
    SELECT t.id FROM templates t
    JOIN compliance_frameworks f ON t.framework_id = f.id
    WHERE f.abbreviation = 'SOC 2'
      AND t.template_type IN ('poam', 'gap_assessment')
  );

-- ─────────────────────────────────────────
-- CMMC 2.0 — add Policy (has Checklist from migration 002)
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'CMMC Information Security Policy', 'policy',
  'Organizational information security policy aligned to CMMC Level 2 requirements (110 practices across 14 domains). Scope by domain for targeted policies.',
  false
FROM compliance_frameworks WHERE abbreviation = 'CMMC'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'CMMC' AND t.template_type = 'policy'
);

-- ─────────────────────────────────────────
-- NIST RMF — add Checklist (has Policy from migration 002)
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'NIST RMF Step Checklist', 'checklist',
  'Step-by-step checklist for executing the NIST Risk Management Framework (Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor).',
  false
FROM compliance_frameworks WHERE abbreviation = 'NIST RMF'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'NIST RMF' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- NIST AI RMF — add Checklist (has Policy from migration 002)
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'NIST AI RMF Implementation Checklist', 'checklist',
  'Checklist for implementing GOVERN, MAP, MEASURE, and MANAGE functions of the NIST AI Risk Management Framework.',
  false
FROM compliance_frameworks WHERE abbreviation = 'NIST AI RMF'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'NIST AI RMF' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- ISO 42001 — add Checklist (has Policy from migration 002)
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'ISO 42001 AI Management System Checklist', 'checklist',
  'Compliance checklist for ISO/IEC 42001 AI Management System requirements covering context, leadership, planning, support, operation, performance, and improvement.',
  false
FROM compliance_frameworks WHERE abbreviation = 'ISO 42001'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'ISO 42001' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- FedRAMP (base) — add Checklist (has Policy from migration 002)
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'FedRAMP Authorization Checklist', 'checklist',
  'FedRAMP authorization readiness checklist. Scope by control family for targeted ATO preparation.',
  false
FROM compliance_frameworks WHERE abbreviation = 'FedRAMP'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'FedRAMP' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- FedRAMP High — Policy + Checklist
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'FedRAMP High Security Policy', 'policy',
  'Security policy aligned to FedRAMP High baseline controls. Covers all 18 NIST SP 800-53 control families required at the High impact level. Scope by control family for targeted policies.',
  true
FROM compliance_frameworks WHERE abbreviation = 'FedRAMP High'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'FedRAMP High' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'FedRAMP High Compliance Checklist', 'checklist',
  'FedRAMP High baseline compliance checklist covering all required controls and enhancements. Scope by control family for audit preparation.',
  false
FROM compliance_frameworks WHERE abbreviation = 'FedRAMP High'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'FedRAMP High' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- FedRAMP Moderate — Policy + Checklist
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'FedRAMP Moderate Security Policy', 'policy',
  'Security policy aligned to FedRAMP Moderate baseline controls. Covers all 18 NIST SP 800-53 control families required at the Moderate impact level. Scope by control family for targeted policies.',
  true
FROM compliance_frameworks WHERE abbreviation = 'FedRAMP Moderate'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'FedRAMP Moderate' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'FedRAMP Moderate Compliance Checklist', 'checklist',
  'FedRAMP Moderate baseline compliance checklist covering all required controls and enhancements. Scope by control family for audit preparation.',
  false
FROM compliance_frameworks WHERE abbreviation = 'FedRAMP Moderate'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'FedRAMP Moderate' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- FedRAMP Low — Policy + Checklist
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'FedRAMP Low Security Policy', 'policy',
  'Security policy aligned to FedRAMP Low baseline controls. Covers the minimum set of NIST SP 800-53 controls required for Low impact federal systems. Scope by control family for targeted policies.',
  true
FROM compliance_frameworks WHERE abbreviation = 'FedRAMP Low'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'FedRAMP Low' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'FedRAMP Low Compliance Checklist', 'checklist',
  'FedRAMP Low baseline compliance checklist covering all required controls. Scope by control family for ATO preparation.',
  false
FROM compliance_frameworks WHERE abbreviation = 'FedRAMP Low'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'FedRAMP Low' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- NIST AI 100-1 — Policy + Checklist
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'Trustworthy AI Policy', 'policy',
  'Organizational policy for implementing NIST AI 100-1 trustworthy AI characteristics (Safe, Secure, Explainable, Transparent, Privacy-Enhanced, Fair, Accountable).',
  true
FROM compliance_frameworks WHERE abbreviation = 'NIST AI 100-1'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'NIST AI 100-1' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'Trustworthy AI Implementation Checklist', 'checklist',
  'Implementation checklist for all 7 NIST AI 100-1 trustworthy AI characteristics covering technical and governance requirements.',
  false
FROM compliance_frameworks WHERE abbreviation = 'NIST AI 100-1'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'NIST AI 100-1' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- MITRE ATLAS — Policy + Checklist
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'AI Threat Defense Policy', 'policy',
  'Organizational policy for defending AI/ML systems against adversarial threats per MITRE ATLAS. Covers all tactic categories and key adversarial techniques.',
  true
FROM compliance_frameworks WHERE abbreviation = 'MITRE ATLAS'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'MITRE ATLAS' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'ATLAS Threat Assessment Checklist', 'checklist',
  'Checklist for assessing AI system defenses against MITRE ATLAS adversarial tactics and techniques.',
  false
FROM compliance_frameworks WHERE abbreviation = 'MITRE ATLAS'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'MITRE ATLAS' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- DoD AI Ethics — Policy + Checklist
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'Responsible AI Policy', 'policy',
  'Organizational policy for DoD AI Ethical Principles and Responsible AI adoption (Responsible, Equitable, Traceable, Reliable, Governable).',
  true
FROM compliance_frameworks WHERE abbreviation = 'DoD AI Ethics'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'DoD AI Ethics' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'Responsible AI Implementation Checklist', 'checklist',
  'Checklist for implementing the five DoD AI Ethical Principles across AI system development and deployment lifecycle.',
  false
FROM compliance_frameworks WHERE abbreviation = 'DoD AI Ethics'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'DoD AI Ethics' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- OECD AI Principles — Policy + Checklist
-- ─────────────────────────────────────────
INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'OECD AI Principles Policy', 'policy',
  'Organizational policy for aligning AI practices with OECD AI Principles (Inclusive Growth, Human-Centred Values, Transparency, Robustness, Accountability).',
  true
FROM compliance_frameworks WHERE abbreviation = 'OECD AI Principles'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'OECD AI Principles' AND t.template_type = 'policy'
);

INSERT INTO templates (framework_id, name, template_type, description, is_default)
SELECT id, 'OECD AI Principles Compliance Checklist', 'checklist',
  'Checklist for implementing OECD AI value-based principles and policymaker recommendations for trustworthy AI.',
  false
FROM compliance_frameworks WHERE abbreviation = 'OECD AI Principles'
AND NOT EXISTS (
  SELECT 1 FROM templates t JOIN compliance_frameworks f ON t.framework_id = f.id
  WHERE f.abbreviation = 'OECD AI Principles' AND t.template_type = 'checklist'
);

-- ─────────────────────────────────────────
-- Add sections for all templates in this migration
-- Follows migration 009 pattern: header / introduction / controls for all template types.
-- ─────────────────────────────────────────
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'header', 'Document Header', 1, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation IN (
  'CMMC', 'NIST RMF', 'NIST AI RMF', 'ISO 42001',
  'FedRAMP', 'FedRAMP High', 'FedRAMP Moderate', 'FedRAMP Low',
  'NIST AI 100-1', 'MITRE ATLAS', 'DoD AI Ethics', 'OECD AI Principles'
)
AND t.id NOT IN (SELECT DISTINCT template_id FROM template_sections WHERE section_key = 'header');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'introduction', 'Introduction', 2, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation IN (
  'CMMC', 'NIST RMF', 'NIST AI RMF', 'ISO 42001',
  'FedRAMP', 'FedRAMP High', 'FedRAMP Moderate', 'FedRAMP Low',
  'NIST AI 100-1', 'MITRE ATLAS', 'DoD AI Ethics', 'OECD AI Principles'
)
AND t.id NOT IN (SELECT DISTINCT template_id FROM template_sections WHERE section_key = 'introduction');

INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t
JOIN compliance_frameworks f ON t.framework_id = f.id
WHERE f.abbreviation IN (
  'CMMC', 'NIST RMF', 'NIST AI RMF', 'ISO 42001',
  'FedRAMP', 'FedRAMP High', 'FedRAMP Moderate', 'FedRAMP Low',
  'NIST AI 100-1', 'MITRE ATLAS', 'DoD AI Ethics', 'OECD AI Principles'
)
AND t.id NOT IN (SELECT DISTINCT template_id FROM template_sections WHERE section_key = 'controls');
