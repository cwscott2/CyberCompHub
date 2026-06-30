-- FedRAMP Moderate Templates (5 artifact types)
-- Run in Supabase SQL Editor
INSERT INTO templates (framework_id, name, template_type, description)
SELECT cf.id, vals.name, vals.template_type, vals.description
FROM compliance_frameworks cf
CROSS JOIN (VALUES
  ('FedRAMP Moderate Security Policy', 'policy', 'AI-generated FedRAMP Moderate security policy scoped to a control family'),
  ('FedRAMP Moderate Compliance Checklist', 'checklist', 'AI-generated compliance checklist for a FedRAMP Moderate control family'),
  ('FedRAMP Moderate Implementation Procedures', 'procedure', 'AI-generated implementation procedures for a FedRAMP Moderate control family'),
  ('FedRAMP Moderate Gap Assessment', 'gap_assessment', 'AI-generated gap assessment for a FedRAMP Moderate control family'),
  ('FedRAMP Moderate Plan of Action & Milestones', 'poam', 'AI-generated POA&M for FedRAMP Moderate findings')
) AS vals(name, template_type, description)
WHERE cf.abbreviation = 'FedRAMP Moderate'
AND NOT EXISTS (
  SELECT 1 FROM templates t
  WHERE t.framework_id = cf.id AND t.template_type = vals.template_type
);
