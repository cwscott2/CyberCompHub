-- =============================================================================
-- FedRAMP High and Low Framework + Source Seed
-- Run in Supabase SQL Editor before triggering ingest functions
-- =============================================================================

-- FedRAMP High Framework
INSERT INTO compliance_frameworks (name, abbreviation, category, description, version)
SELECT
  'FedRAMP High',
  'FedRAMP High',
  'security',
  'FedRAMP High Baseline — NIST SP 800-53 Rev 5 controls required for cloud systems processing the most sensitive unclassified data (188 controls, 182 enhancements)',
  'Rev 5 High Baseline'
WHERE NOT EXISTS (SELECT 1 FROM compliance_frameworks WHERE abbreviation = 'FedRAMP High');

-- FedRAMP High Source
INSERT INTO sources (framework_id, name, url, source_type, scraper_type)
SELECT
  cf.id,
  'NIST SP 800-53 Rev 5 FedRAMP High Baseline (OSCAL)',
  'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_HIGH-baseline-resolved-profile_catalog.json',
  'api',
  'oscal-json'
FROM compliance_frameworks cf
WHERE cf.abbreviation = 'FedRAMP High'
AND NOT EXISTS (
  SELECT 1 FROM sources s WHERE s.framework_id = cf.id
);

-- FedRAMP High Templates (all 5 artifact types)
INSERT INTO templates (framework_id, name, template_type, description)
SELECT
  cf.id,
  vals.name,
  vals.template_type,
  vals.description
FROM compliance_frameworks cf
CROSS JOIN (VALUES
  ('FedRAMP High Security Policy', 'policy', 'AI-generated FedRAMP High security policy scoped to a control family'),
  ('FedRAMP High Compliance Checklist', 'checklist', 'AI-generated compliance checklist for a FedRAMP High control family'),
  ('FedRAMP High Implementation Procedures', 'procedure', 'AI-generated implementation procedures for a FedRAMP High control family'),
  ('FedRAMP High Gap Assessment', 'gap_assessment', 'AI-generated gap assessment for a FedRAMP High control family'),
  ('FedRAMP High Plan of Action & Milestones', 'poam', 'AI-generated POA&M for FedRAMP High findings')
) AS vals(name, template_type, description)
WHERE cf.abbreviation = 'FedRAMP High'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  WHERE t.framework_id = cf.id AND t.template_type = vals.template_type
);

-- =============================================================================

-- FedRAMP Low Framework
INSERT INTO compliance_frameworks (name, abbreviation, category, description, version)
SELECT
  'FedRAMP Low',
  'FedRAMP Low',
  'security',
  'FedRAMP Low Baseline — NIST SP 800-53 Rev 5 controls required for cloud systems with low-impact data (131 controls, 18 families)',
  'Rev 5 Low Baseline'
WHERE NOT EXISTS (SELECT 1 FROM compliance_frameworks WHERE abbreviation = 'FedRAMP Low');

-- FedRAMP Low Source
INSERT INTO sources (framework_id, name, url, source_type, scraper_type)
SELECT
  cf.id,
  'NIST SP 800-53 Rev 5 FedRAMP Low Baseline (OSCAL)',
  'https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_LOW-baseline-resolved-profile_catalog.json',
  'api',
  'oscal-json'
FROM compliance_frameworks cf
WHERE cf.abbreviation = 'FedRAMP Low'
AND NOT EXISTS (
  SELECT 1 FROM sources s WHERE s.framework_id = cf.id
);

-- FedRAMP Low Templates
INSERT INTO templates (framework_id, name, template_type, description)
SELECT
  cf.id,
  vals.name,
  vals.template_type,
  vals.description
FROM compliance_frameworks cf
CROSS JOIN (VALUES
  ('FedRAMP Low Security Policy', 'policy', 'AI-generated FedRAMP Low security policy scoped to a control family'),
  ('FedRAMP Low Compliance Checklist', 'checklist', 'AI-generated compliance checklist for a FedRAMP Low control family'),
  ('FedRAMP Low Implementation Procedures', 'procedure', 'AI-generated implementation procedures for a FedRAMP Low control family'),
  ('FedRAMP Low Gap Assessment', 'gap_assessment', 'AI-generated gap assessment for a FedRAMP Low control family'),
  ('FedRAMP Low Plan of Action & Milestones', 'poam', 'AI-generated POA&M for FedRAMP Low findings')
) AS vals(name, template_type, description)
WHERE cf.abbreviation = 'FedRAMP Low'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  WHERE t.framework_id = cf.id AND t.template_type = vals.template_type
);
