-- Add missing checklist section to SOX Compliance Checklist template
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'checklist', 'Compliance Checklist', 3, true
FROM templates t
WHERE t.name = 'SOX Compliance Checklist'
  AND NOT EXISTS (
    SELECT 1 FROM template_sections ts
    WHERE ts.template_id = t.id AND ts.section_key = 'checklist'
  );

-- Also add controls section to the IT Controls template if missing
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT t.id, 'controls', 'Controls and Requirements', 3, true
FROM templates t
WHERE t.name = 'SOX IT Controls Template'
  AND NOT EXISTS (
    SELECT 1 FROM template_sections ts
    WHERE ts.template_id = t.id AND ts.section_key = 'controls'
  );
