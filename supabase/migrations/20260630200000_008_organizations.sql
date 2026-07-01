-- Migration 008: Organizations and membership for SaaS multi-tenancy

-- Profiles table (extends auth.users with display name, avatar)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  seat_limit INTEGER NOT NULL DEFAULT 1,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Org members
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(org_id, user_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a member of an org?
CREATE OR REPLACE FUNCTION is_org_member(org UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members WHERE org_id = org AND user_id = auth.uid()
  );
$$;

-- Helper: is the current user an owner or admin of an org?
CREATE OR REPLACE FUNCTION is_org_admin(org UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = org AND user_id = auth.uid() AND role IN ('owner', 'admin')
  );
$$;

-- RLS: members can read their org
CREATE POLICY "members_read_org" ON organizations
  FOR SELECT TO authenticated USING (is_org_member(id));

-- RLS: admins can update org
CREATE POLICY "admins_update_org" ON organizations
  FOR UPDATE TO authenticated USING (is_org_admin(id));

-- RLS: members can read other members in their org
CREATE POLICY "members_read_org_members" ON org_members
  FOR SELECT TO authenticated USING (is_org_member(org_id));

-- RLS: admins can manage members
CREATE POLICY "admins_manage_members" ON org_members
  FOR ALL TO authenticated USING (is_org_admin(org_id));

-- Usage tracking (for metering free/pro tiers)
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('chat_message', 'document_generated', 'document_exported', 'search')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own_usage" ON usage_events
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_read_own_usage" ON usage_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Index for monthly usage queries
CREATE INDEX IF NOT EXISTS idx_usage_events_user_month
  ON usage_events(user_id, event_type, created_at);
