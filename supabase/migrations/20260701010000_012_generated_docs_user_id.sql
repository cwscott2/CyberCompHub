-- Migration 012: Add user_id to generated_documents for per-user history
-- Nullable so existing rows are not invalidated.

ALTER TABLE generated_documents
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop the overly-permissive blanket policies
DROP POLICY IF EXISTS "public_read_generated_docs" ON generated_documents;
DROP POLICY IF EXISTS "service_all_generated_docs" ON generated_documents;

-- Authenticated users can only read their own documents
CREATE POLICY "users_read_own_generated_docs" ON generated_documents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can insert their own documents
CREATE POLICY "users_insert_own_generated_docs" ON generated_documents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Service role (edge functions) can do everything
CREATE POLICY "service_role_all_generated_docs" ON generated_documents
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
