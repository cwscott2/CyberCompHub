-- Migration 013: Add 'healthcare' and 'privacy' framework categories
-- HIPAA was incorrectly categorized as 'sox'; fix to 'healthcare'.

ALTER TABLE compliance_frameworks
  DROP CONSTRAINT IF EXISTS compliance_frameworks_category_check;

ALTER TABLE compliance_frameworks
  ADD CONSTRAINT compliance_frameworks_category_check
  CHECK (category IN ('iso', 'nist', 'fedramp', 'cmmc', 'sox', 'ai-safety', 'healthcare', 'privacy'));

UPDATE compliance_frameworks
  SET category = 'healthcare'
  WHERE abbreviation = 'HIPAA';
