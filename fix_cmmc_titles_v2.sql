-- Rebuild CMMC practice titles from raw_content (extracts full requirement text)
UPDATE documents
SET title =
  (metadata->>'practice_id') || ' — ' ||
  TRIM(
    SPLIT_PART(
      SPLIT_PART(raw_content, '## Requirement' || chr(10), 2),
      chr(10) || chr(10),
      1
    )
  )
WHERE framework_id = (SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC')
  AND document_type = 'control'
  AND metadata->>'practice_id' IS NOT NULL;
