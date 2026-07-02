-- Migration 016: Add is_starred and deleted_at to generated_documents
-- is_starred: user can bookmark documents they want to keep
-- deleted_at: soft delete — excluded from queries, retained for audit trail
-- Safe to re-run: uses IF NOT EXISTS

ALTER TABLE generated_documents
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
