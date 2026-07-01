# CyberComplianceHub — Session Handoff
**Date:** July 1, 2026
**Status:** FINAL — ready for new session

---

## What Was Built This Session

### Authentication & Deployment
- Social-only login (Google, Apple, GitHub) — email/password hidden in UI, active in DB
- Vercel deployment at `cyber-compliance-hub.vercel.app`
- `vercel.json` SPA rewrite rule (fixes 404 on OAuth callback)
- Google, Apple, GitHub OAuth configured in Supabase

### Bug Fixes
- RLS infinite recursion (PostgreSQL 42P17) on profiles — fixed via `is_platform_admin()` SECURITY DEFINER function (migration 011)
- Display name showing email — fixed with OAuth metadata fallback
- Admin link not visible — same RLS bug
- Landing page logo not navigating — `<div>` → `<Link to="/">` with scroll-to-top handler
- HIPAA categorized as SOX — fixed via migration 013 (new `healthcare` category)
- Org creation RLS error — added platform admin INSERT policy
- Org slug only capturing first character — fixed with `slugEdited` boolean flag
- Org member INSERT/UPDATE/DELETE — added platform admin policies for `org_members`

### Platform Admin Layer (complete)
- `is_platform_admin` boolean on profiles; `cwhscott@gmail.com` seeded as admin
- `AdminGuard` — wraps `/app/admin/*` routes
- `AdminNav` — gray/navy sub-nav bar
- **Users page** — table with org/role columns, search by name/ID/org, Edit modal:
  - Display name
  - Platform Admin toggle (guarded: cannot remove own access)
  - Org assignment (select org + role: owner/admin/member)
- **Organizations page** — table with plan/members/seat limit, New Org modal + Edit modal:
  - Name, slug (auto-generated, tracks name as typed), plan, seat limit
  - Plan dropdown saves inline to DB
- **Settings page** — placeholder cards

### Features Built
- **30-minute inactivity timeout** — `useInactivityTimeout` hook + `InactivityWarningModal`; warns at 25 min, signs out at 30 min
- **Generated document history** on AccountPage — queries `generated_documents` by user_id
- **`generate-document` edge function** — stamps `user_id` on every saved document
- **Knowledge Base column layout** — proper grid; Last Ingested = `MAX(documents.created_at)` per framework
- **Beta plan tier** — in organizations.plan CHECK constraint
- **Plausible Analytics removed** — tags removed from index.html; analytics strategy deferred

### Design Decisions Locked
- **Org assignment model: Option B** — users start org-less on self-enroll; platform admin assigns manually. Free-tier features (chat, search, generate) work without an org. Org membership gates Team tier features (shared library, multi-user). Onboarding flow for Team tier is a future backlog item.
- **Supabase session settings** (JWT expiry, refresh token, time-box sessions) are gated behind Supabase Pro — note for when upgrade happens.
- **Analytics platform** — Vercel Analytics (available on paid Vercel tier) vs Plausible — decide after Vercel upgrade.

---

## All Migrations Applied (run in Supabase ✓)

| # | File | Description | Status |
|---|---|---|---|
| 009 | template_expansion | Templates for PCI DSS, HIPAA, GDPR, CIS Controls, SOC 2, EU AI Act | ✓ |
| 010 | platform_admin_beta | is_platform_admin column, beta plan tier | ✓ |
| 011 | fix_rls_recursion | SECURITY DEFINER function, admin policies for profiles/orgs/org_members | ✓ |
| 012 | generated_docs_user_id | user_id on generated_documents, per-user RLS | ✓ |
| 013 | healthcare_category | Adds healthcare/privacy categories; HIPAA → healthcare | ✓ |

---

## Immediate Next Actions for New Session

### 1. SOC 2 Templates — HIGH PRIORITY (#1)
Add Procedure, POA&M, and Gap Assessment templates to SOC 2. Migration 009 is the pattern to follow. SOC 2 currently has Policy + Checklist only.

### 2. Templates for Remaining Frameworks — MEDIUM
NIST CSF, NIST SP 800-53, FedRAMP, ISO 27001, CMMC — all show in wizard but have no templates. Minimum viable: Policy + Checklist per framework.

### 3. Custom SMTP — HIGH (before Team tier)
Configure Supabase custom SMTP once domain is finalized. Current limit: 2 emails/hour (blocks beta invites).

### 4. Usage Analytics Instrumentation — MEDIUM
Wire `usage_events` inserts into edge functions. Build admin analytics panel.

### 5. GDPR Download My Data — MEDIUM (before EU marketing)
ZIP export of profile, documents, org membership. Soft-delete with 30-day window.

### 6. Org Admin UI — LOW (post-beta)
Org owners/admins can manage their own members. Reuses Admin Users UI filtered by org_id.

---

## Architecture Snapshot

### Repo & Deploy
- GitHub: `github.com/cwscott2/CyberCompHub` — branch: `main`
- Vercel: `cyber-compliance-hub` → `cyber-compliance-hub.vercel.app`
- Auto-deploys from `main`

### Supabase
- URL: `earhrwdnevaoemwesiuh.supabase.co`
- Auth providers: Google, Apple, GitHub (email hidden in UI)
- Platform admin: `cwhscott@gmail.com`

### Key Files
| File | Purpose |
|---|---|
| `src/contexts/AuthContext.tsx` | Session, displayName, isPlatformAdmin, refreshDisplayName |
| `src/layouts/AppLayout.tsx` | Authenticated shell, inactivity modal, admin nav |
| `src/components/AdminGuard.tsx` | Route guard for /app/admin/* |
| `src/components/InactivityWarningModal.tsx` | 25/30-min idle warning |
| `src/hooks/useInactivityTimeout.ts` | Inactivity timer logic |
| `src/pages/admin/AdminUsersPage.tsx` | User list + edit modal (name, admin flag, org/role) |
| `src/pages/admin/AdminOrgsPage.tsx` | Org list + create/edit modals |
| `src/pages/KnowledgeBasePage.tsx` | Framework inventory, column layout, freshness dates |
| `src/utils/frameworkGroups.ts` | Category → group mapping; sox/healthcare/privacy → 'Financial / Healthcare' |
| `supabase/functions/generate-document/` | Artifact generation + user_id stamping |
| `docs/PRD.md` | Source of truth v1.6 |

### FAMILY_FIELD_MAP (WizardPage.tsx)
```
NIST CSF → family_name        SP 800-53/FedRAMP → family_name
CMMC → domain_name            ISO 27001/42001 → clause_number
NIST RMF → step_name          NIST AI RMF → function_name
SOX → section_number          PCI DSS → requirement_number
HIPAA → safeguard_type        GDPR → chapter_number
CIS Controls → category       EU AI Act → category
SOC 2 → trust_service_category
```

### RLS Architecture
All admin policies use `is_platform_admin()` SECURITY DEFINER function (avoids recursive policy evaluation — PostgreSQL 42P17).
Tables with platform admin policies: `profiles`, `organizations`, `org_members`, `generated_documents` (service role only).

### Apple OAuth
Client secret expires every 6 months. Regenerate: Supabase dashboard → Auth → Providers → Apple → secret generator tool (Chrome only, not Safari).

---

## Backlog Reference
Full backlog: `memory/backlog_framework_coverage.md`

Top items:
1. SOC 2 full artifact suite — HIGH
2. Templates for all remaining frameworks — MEDIUM
3. Custom SMTP (domain needed) — HIGH
4. Usage analytics instrumentation — MEDIUM
5. GDPR data download — MEDIUM
6. Org Admin UI — LOW (post-beta)
7. Supabase Pro upgrade (unlocks session settings, rate limits) — when beta scales
8. Analytics platform decision (Vercel vs Plausible) — after Vercel upgrade
9. Thin/Partial KB coverage discussion — LOW
10. KB as plan generator — BACKLOG
11. Evidence development guidance per framework — BACKLOG

---

*Session ended: July 1, 2026*
