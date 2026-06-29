-- Security fixes for compliance schema

-- ============================================
-- 1. Fix function search_path mutability
-- ============================================

-- Fix update_updated_at_column with explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. Move vector extension to extensions schema
-- ============================================

-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move extension to extensions schema (Supabase supports this)
ALTER EXTENSION vector SET SCHEMA extensions;

-- ============================================
-- 3. Remove overly permissive RLS policies
-- ============================================

-- Drop the service_all_* policies that allow unrestricted access
DROP POLICY IF EXISTS "service_all_frameworks" ON compliance_frameworks;
DROP POLICY IF EXISTS "service_all_sources" ON sources;
DROP POLICY IF EXISTS "service_all_documents" ON documents;
DROP POLICY IF EXISTS "service_all_chunks" ON document_chunks;
DROP POLICY IF EXISTS "service_all_templates" ON templates;
DROP POLICY IF EXISTS "service_all_template_sections" ON template_sections;
DROP POLICY IF EXISTS "service_all_generated_docs" ON generated_documents;
DROP POLICY IF EXISTS "service_all_ingest_jobs" ON ingest_jobs;
DROP POLICY IF EXISTS "service_all_mappings" ON framework_mappings;