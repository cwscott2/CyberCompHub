-- Migration 010: Platform admin flag + beta plan tier

-- Add is_platform_admin to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;

-- RLS: platform admins can read all profiles (needed for admin UI)
CREATE POLICY "platform_admins_read_all_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_platform_admin = true
    )
  );

-- RLS: platform admins can update all profiles (needed for plan/admin management)
CREATE POLICY "platform_admins_update_all_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_platform_admin = true
    )
  );

-- Add beta to organizations plan CHECK constraint
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'beta', 'pro', 'team', 'enterprise'));

-- RLS: platform admins can read all organizations
CREATE POLICY "platform_admins_read_all_orgs" ON organizations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_platform_admin = true
    )
  );

-- RLS: platform admins can update all organizations (e.g. change plan)
CREATE POLICY "platform_admins_update_all_orgs" ON organizations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_platform_admin = true
    )
  );

-- Set cwhscott@gmail.com as platform admin
UPDATE profiles
SET is_platform_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'cwhscott@gmail.com'
);
