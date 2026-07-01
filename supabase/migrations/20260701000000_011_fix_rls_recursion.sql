-- Migration 011: Fix infinite RLS recursion on profiles table
-- The platform_admins_* policies queried profiles inside profiles policies,
-- causing PostgreSQL error 42P17. Fix: use a SECURITY DEFINER function
-- that bypasses RLS to check admin status.

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_platform_admin = true
  );
END;
$$;

DROP POLICY IF EXISTS "platform_admins_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "platform_admins_update_all_profiles" ON profiles;

CREATE POLICY "platform_admins_read_all_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (is_platform_admin());

CREATE POLICY "platform_admins_update_all_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (is_platform_admin());

DROP POLICY IF EXISTS "platform_admins_read_all_orgs" ON organizations;
DROP POLICY IF EXISTS "platform_admins_update_all_orgs" ON organizations;

CREATE POLICY "platform_admins_read_all_orgs" ON organizations
  FOR SELECT TO authenticated
  USING (is_platform_admin());

CREATE POLICY "platform_admins_update_all_orgs" ON organizations
  FOR UPDATE TO authenticated
  USING (is_platform_admin());

CREATE POLICY "platform_admins_insert_orgs" ON organizations
  FOR INSERT TO authenticated
  WITH CHECK (is_platform_admin());
