-- Remove trailing "..." from CMMC document titles
UPDATE documents
SET title = LEFT(title, LENGTH(title) - 3)
WHERE title LIKE '%...'
  AND framework_id = (
    SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'
  );
