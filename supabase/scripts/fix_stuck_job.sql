-- Mark the stuck SP 800-53 ingest job as failed (first attempt that errored)
UPDATE ingest_jobs
SET status = 'failed',
    completed_at = NOW()
WHERE id = '8ddf38bf-97a1-4230-a7f8-188da9ce8cd3'
  AND status = 'in_progress';
