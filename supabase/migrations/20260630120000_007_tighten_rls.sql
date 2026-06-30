-- Migration 007: Tighten RLS on generated_documents and ingest_jobs
-- generated_documents: remove anon read; authenticated users only
-- ingest_jobs: remove anon read; service role still has full access

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "public_read_generated_docs" ON generated_documents;

-- Re-create scoped to authenticated users only
CREATE POLICY "auth_read_generated_docs"
  ON generated_documents FOR SELECT
  TO authenticated
  USING (true);

-- Tighten ingest_jobs — anon should not see internal job state
DROP POLICY IF EXISTS "public_read_ingest_jobs" ON ingest_jobs;

CREATE POLICY "auth_read_ingest_jobs"
  ON ingest_jobs FOR SELECT
  TO authenticated
  USING (true);
