# CyberComplianceHub — Session Handoff
**Date:** July 1, 2026
**Status:** DRAFT — finalize with Carl before closing session

---

## What Was Built This Session

### Authentication & Deployment
- Social-only login (Google, Apple, GitHub) — email/password hidden but preserved in DB
- Vercel deployment at `cyber-compliance-hub.vercel.app`
- `vercel.json` SPA rewrite rule (fixes 404 on OAuth callback)
- Google, Apple, GitHub OAuth configured in Supabase; Microsoft abandoned (no Azure tenant)
- Plausible Analytics tags added then removed; Vercel Analytics to be evaluated

### Bug Fixes
- RLS infinite recursion (PostgreSQL 42P17) on profiles table — fixed via `is_platform_admin()` SECURITY DEFINER function (migration 011)
- Display name showing email — fixed by awaiting profile fetch before setLoading, plus OAuth metadata fallback
- Admin link not visible — caused by same RLS recursion bug above
- Landing page logo not navigating — changed `<div>` to `<Link to="/">` with scroll-to-top handler
- Authenticated logo — `<Link to="/app/dashboard">` in AppLayout
- HIPAA categorized as SOX — fixed via migration 013 (new `healthcare` category)

### Platform Admin Layer
- `is_platform_admin` boolean on profiles; migration 010 seeds `cwhscott@gmail.com` as admin
- `AdminGuard` component — wraps admin routes, redirects non-admins
- `AdminNav` — gray/navy sub-nav bar (replaced red/pink)
- Admin pages: Users (search, role badges), Organizations (plan dropdown + New Org modal), Settings (placeholder)
- Admin link in main nav — visible only to platform admins

### Features Built
- **30-minute inactivity timeout** — `useInactivityTimeout` hook + `InactivityWarningModal` component; warns at 25 min, signs out at 30 min
- **Generated document history** on AccountPage — queries `generated_documents` table, shows title/framework/template/date
- **`generate-document` edge function** — now stamps `user_id` on every saved document
- **Knowledge Base column layout** — proper grid alignment (Framework, Docs, Controls, Source, Quality, Last Ingested); Last Ingested = MAX(documents.created_at) for true content freshness
- **Admin Orgs page** — "New Organization" modal (name, slug, plan, seat limit); plan dropdown saves to DB
- **Beta plan tier** — added to organizations.plan CHECK constraint

---

## Migrations Applied This Session (run in Supabase in order)

| Migration | Status |
|---|---|
| 009 — template_expansion | ✓ Run |
| 010 — platform_admin_beta | ✓ Run |
| 011 — fix_rls_recursion | ✓ Run |
| 012 — generated_docs_user_id | ✓ Run |
| 013 — healthcare_category | ✓ Run |

---

## Immediate Next Actions (for Carl)

1. **Reduce Supabase session refresh token** — Auth → Settings → JWT expiry = 3600 (1h), Refresh token expiry = 86400 (24h). Currently at defaults (too long for SOC 2 compliance).
2. **Test org creation** — go to Admin → Organizations → New Organization; create a test org.
3. **Generate a test document** — use the Wizard with any templated framework (PCI DSS, HIPAA, GDPR, CIS Controls, SOC 2, EU AI Act) and confirm it appears in Account → Generated Documents.
4. **Verify HIPAA** now appears under "Financial / Healthcare Frameworks" in Dashboard and Knowledge Base.

---

## Recommended Next Session Priorities

### 1. SOC 2 Templates — HIGH (top priority framework)
Add Procedure, POA&M, and Gap Assessment templates to SOC 2. Currently only Policy + Checklist exist. Use migration 009 as the pattern.

### 2. Templates for Remaining Frameworks — MEDIUM
NIST CSF, NIST SP 800-53, FedRAMP, ISO 27001, CMMC — all show in the wizard but have no templates. Start with Policy + Checklist as minimum viable per framework.

### 3. Custom SMTP — HIGH (before Team tier launch)
Configure Supabase custom SMTP once domain is finalized. Affects invite emails, forgot password, confirmations. Current 2 emails/hour limit blocks beta user invites.

### 4. Usage Analytics Instrumentation — MEDIUM
- Wire `usage_events` inserts in edge functions (chat, generate-document, search)
- Build simple admin analytics panel: DAU, framework usage, generation counts

### 5. GDPR Download My Data — MEDIUM (before EU marketing)
- ZIP export: profile, generated documents, org membership
- Soft-delete with 30-day window before hard purge

### 6. Stripe Billing — ON HOLD
Activate when beta testers are engaged and feedback is collected.

---

## Architecture Snapshot

### Repo
`github.com/cwscott2/CyberCompHub` — branch: `main`

### Deployment
Vercel project: `cyber-compliance-hub` → `cyber-compliance-hub.vercel.app`
Auto-deploys from `main` (connected 2026-07-01 after GitHub repo reconnect)

### Supabase Project
URL: `earhrwdnevaoemwesiuh.supabase.co`
Auth providers active: Email (hidden), Google, Apple, GitHub
Platform admin: `cwhscott@gmail.com` (is_platform_admin = true)

### Key Files
| File | Purpose |
|---|---|
| `src/contexts/AuthContext.tsx` | Session, displayName, isPlatformAdmin, refreshDisplayName |
| `src/layouts/AppLayout.tsx` | Authenticated shell, inactivity modal, admin nav |
| `src/components/AdminGuard.tsx` | Route guard for /app/admin/* |
| `src/hooks/useInactivityTimeout.ts` | 25/30-min inactivity timer |
| `src/pages/admin/AdminOrgsPage.tsx` | Org management + creation modal |
| `src/pages/KnowledgeBasePage.tsx` | Framework inventory with column layout + freshness dates |
| `src/utils/frameworkGroups.ts` | Category → group mapping (security/financial/ai) |
| `supabase/functions/generate-document/` | Artifact generation + user_id stamping |
| `docs/PRD.md` | Source of truth for product requirements |

### FAMILY_FIELD_MAP (WizardPage.tsx)
Controls which DB metadata field is used for family-scoped generation per framework:
```
NIST CSF → family_name
SP 800-53 / FedRAMP → family_name
CMMC → domain_name
ISO 27001 → clause_number
NIST RMF → step_name
NIST AI RMF → function_name
ISO 42001 → clause_number
SOX → section_number
PCI DSS → requirement_number
HIPAA → safeguard_type
GDPR → chapter_number
CIS Controls → category
EU AI Act → category
SOC 2 → trust_service_category
```

### Apple OAuth Note
Apple OAuth client secret expires every 6 months. Regenerate at:
`https://supabase.com/dashboard/project/[project]/auth/providers` → Apple → use the secret generator tool (Chrome only, not Safari).

---

## Backlog Reference
Full backlog: `/memory/backlog_framework_coverage.md`

Key items added this session:
- SOC 2 full artifact suite (Procedure, POA&M, Gap Assessment) — HIGH
- Templates for all remaining frameworks — MEDIUM
- Thin/Partial KB coverage discussion — LOW
- KB as plan generator (Continuous Monitoring Plans) — BACKLOG
- Evidence development guidance per framework — BACKLOG
- Analytics strategy (Vercel vs. Plausible) — BACKLOG

---

*Session ended: July 1, 2026 — drafted for Carl's review*
