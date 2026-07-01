# CyberComplianceHub — Session Handoff

**Date:** 2026-06-30
**Repo:** https://github.com/cwscott2/CyberCompHub (branch: main)
**Local path:** /Users/carlscott/Desktop/CodingProjects/CyberCompHub
**PRD:** /docs/PRD.md (v1.5.0 — updated this session)

---

## What Was Completed This Session

### 1. ADA / Section 508 Accessibility Fixes
Full WCAG 2.1 AA pass across all pages:
- `ChatPage.tsx` — `role="log"`, `aria-live`, `<ul>/<li>` messages, sr-only labels, inputRef focus on suggestion click
- `SearchPage.tsx` — label/id pairs, `aria-hidden` on decorative SVGs, `aria-label` on close button
- `KnowledgeBasePage.tsx` — filter label, `aria-expanded`, quality badge symbol/text split
- `WizardPage.tsx` — `<nav aria-label="progress"><ol role="list">`, `aria-current="step"`, sr-only step context, role/live on generating spinner
- `globals.css` — `prefers-reduced-motion` block for `animate-spin` and `animate-pulse`

### 2. Landing Page, Auth Flow, and Route Restructure
- `LandingPage.tsx` — hero, framework showcase, features, pricing preview, footer
- `Footer.tsx` — Product/Frameworks/Legal columns + inline disclaimer
- Auth pages: `LoginPage`, `SignupPage`, `ForgotPasswordPage`, `ResetPasswordPage` — all using Supabase Auth
- `AuthContext.tsx` + `useAuth()` hook — session management
- `AuthGuard.tsx` — redirects to `/login` with return path state
- `AppLayout.tsx` — authenticated shell with mobile hamburger nav
- Route structure: public at `/`, authenticated at `/app/*`, legacy paths redirect
- Social login (Google, Microsoft) — stubs in place, disabled, wired up when IdP is configured

### 3. Five Legal Pages
`/terms`, `/privacy`, `/disclaimer`, `/accessibility`, `/cookies`
- Privacy: GDPR-forward baseline + other jurisdictions section + SCCs for US transfers
- Terms: Delaware governing law, EU rights carve-out
- Disclaimer: ISO reference-only policy, AI content warning

### 4. Additional Pages
- `PricingPage.tsx` — 4 tiers, feature checklist, FAQ, competitor positioning
- `AccountPage.tsx` — display name (upserts to profiles), password change, plan display
- `FrameworkCategoryPage.tsx` — `/app/frameworks/:category` with doc counts and quality badges

### 5. Database Migration 008
`supabase/migrations/20260630200000_008_organizations.sql` — run successfully:
- `profiles` table + `handle_new_user()` trigger
- `organizations`, `org_members`, `usage_events` tables
- `is_org_member()` + `is_org_admin()` helper functions
- All RLS policies

### 6. Three New Ingest Edge Functions (built, deployed, invoked successfully)
| Function | Framework | Inserted |
|---|---|---|
| `ingest-eu-ai-act` | EU AI Act | 23 articles |
| `ingest-gdpr` | GDPR | 27 articles |
| `ingest-cis-controls-v8` | CIS Controls v8 | 18 controls |

### 7. PCI DSS v4.0 and HIPAA Security Rule Ingest Functions (built + deployed this session)
| Function | Framework | Expected |
|---|---|---|
| `ingest-pci-dss-v4` | PCI DSS v4.0 | 12 requirements |
| `ingest-hipaa-security-rule` | HIPAA Security Rule | 18 controls |

**These have been deployed but NOT yet invoked.** Run these commands (service role key required):

```bash
# From: /Users/carlscott/Desktop/CodingProjects/CyberCompHub
# Requires: Supabase service role key (from Supabase dashboard → Project Settings → API)

curl -s -X POST \
  https://earhrwdnevaoemwesiuh.supabase.co/functions/v1/ingest-pci-dss-v4 \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" | python3 -m json.tool

curl -s -X POST \
  https://earhrwdnevaoemwesiuh.supabase.co/functions/v1/ingest-hipaa-security-rule \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

Expected: `{"inserted": 12, "errors": []}` and `{"inserted": 18, "errors": []}`.
Both functions are idempotent — safe to re-run.

---

## What To Build Next (Priority Order)

### 1. Push to GitHub (do this first)
```bash
cd /Users/carlscott/Desktop/CodingProjects/CyberCompHub
git add -A
git status   # review before committing
git commit -m "feat: auth flow, landing page, legal pages, accessibility, GDPR/CIS/EU AI Act/PCI DSS/HIPAA ingest"
git push origin main
```

### 2. SOC 2 Framework Ingest
**Why first:** SOC 2 is the #1 missing framework — top request for SaaS companies, heavily searched, and absent from the platform. It's also the highest-value upsell for Pro tier.
**What to build:** Ingest function covering all 5 Trust Service Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy) with the 2017 TSC common criteria. Same pattern as `ingest-cis-controls-v8`. Target 60+ documents.
**Category:** `sox` (existing allowed value — do NOT add a new category)

### 3. Template Expansion for New Frameworks
PCI DSS, HIPAA, GDPR, and CIS Controls now have data but no templates in the wizard.
- Add `policy` + `checklist` templates for: PCI DSS, HIPAA, GDPR, CIS Controls v8
- Add `procedure` templates for PCI DSS and HIPAA (high compliance value)
- Family/section scoping:
  - PCI DSS: scoped by requirement number (1–12)
  - HIPAA: scoped by safeguard type (Administrative / Physical / Technical)
  - GDPR: scoped by chapter (I–XI)
  - CIS Controls: scoped by implementation group (IG1 / IG2 / IG3)
- SQL goes in a new migration file; run in Supabase SQL editor

### 4. FedRAMP High Ingest
~421 controls across all 20 families at High baseline. Follow same OSCAL-parse pattern as SP 800-53. This unlocks the federal/DoD market segment.

### 5. Framework Coverage Depth — Backlog Order
After SOC 2 and FedRAMP High:
1. FedRAMP Moderate embeddings (seed data exists, no embeddings)
2. FedRAMP Low (~125 controls)
3. NIST AI 100-1 — 17 → 40–50 docs
4. MITRE ATLAS — 14 → 70–80 docs (one per AML.T technique)
5. DoD AI Ethics — 14 → 30–40 docs
6. ISO 42001 reference coverage (Q3 2026 target)
7. CMMC v3.0 (Q4 2026)

### 6. Excel Export for POA&M and Checklists (P2)
POA&M and compliance checklists are inherently tabular. Compliance teams expect Excel.
- Use SheetJS (`xlsx`) in the `export-document` edge function
- Parse markdown table rows into worksheet rows
- Export `.xlsx` for `poam` and `checklist` template types initially

### 7. Stripe Billing Integration (P2)
Pricing tiers are live in the UI (Free/Pro/Team/Enterprise) but billing is stubbed.
- Wire up Stripe Checkout for Pro and Team tiers
- Webhook handler to update `organizations.plan` and `organizations.stripe_subscription_id`
- Usage enforcement: check plan limits in `generate-document` and `chat` edge functions

### 8. SSO / Bring-Your-Own-IdP (Medium Priority)
- Google and Microsoft social login stubs already in `LoginPage.tsx`
- Configure OAuth apps in Supabase dashboard to activate
- SAML/SSO for Enterprise tier — defer until first enterprise prospect

---

## Key Architecture Facts (Do Not Guess)

### Route Structure
- `/` → LandingPage (public)
- `/login`, `/signup`, `/forgot-password`, `/reset-password` → Auth pages (public)
- `/pricing`, `/terms`, `/privacy`, `/disclaimer`, `/accessibility`, `/cookies` → Public
- `/app/*` → AuthGuard → AppLayout
  - `/app/dashboard`, `/app/chat`, `/app/search`, `/app/wizard`, `/app/knowledge-base`
  - `/app/account` → AccountPage
  - `/app/frameworks/:category` → FrameworkCategoryPage (cybersecurity / ai-governance / financial)

### DB Schema — Critical Constraints
- `compliance_frameworks.category` CHECK: only `nist`, `iso`, `fedramp`, `cmmc`, `sox`, `ai-safety`
- `document_chunks` columns: `id, document_id, chunk_index, content, embedding, metadata, created_at` — NO `framework_id`
- `documents` columns DO include `framework_id` — correct to put it there, never in chunks
- `sources.scraper_type` NOT NULL: valid values `generic-webpage`, `nist-rmf`, `nist-json`, `webpage`, `json`
- No unique constraint on `abbreviation` — use `.limit(1)` lookup + insert-if-not-found pattern (never `ON CONFLICT`)
- Dashboard framework grouping via `categoryToGroup()` in UI — do NOT change DB categories

### DB Tables Added in Migration 008
- `profiles (id, user_id, display_name, avatar_url, created_at, updated_at)` — trigger auto-creates on auth.users insert
- `organizations (id, name, plan, seat_limit, stripe_customer_id, stripe_subscription_id, ...)`
- `org_members (id, org_id, user_id, role)` — role: owner/admin/member
- `usage_events (id, user_id, org_id, event_type, metadata, created_at)`

### Ingest Pattern (all functions follow this)
1. Resolve or create framework (lookup by abbreviation, insert if missing)
2. Resolve or create source (lookup by framework_id, insert if missing)
3. Delete existing docs for idempotency (`.filter('metadata->>document_level', 'eq', '<key>')`)
4. For each item: insert document → generate embedding → insert chunk (with `chunk_index: 0`)
5. Return `{ framework_id, inserted, errors }`

### Security Rules (Non-Negotiable)
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — safe client-side (RLS enforced)
- `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` — Supabase Edge Function secrets ONLY via `Deno.env.get()`
- NEVER add `VITE_` prefix to API keys (prior incident with key exposure)
- `.env` is gitignored; never commit secrets

### Edge Functions
| Function | Purpose |
|---|---|
| `chat` | RAG Q&A with SSE streaming, multi-framework detection |
| `search` | Vector similarity search |
| `generate-document` | Artifact generator — LLM policy + deterministic templates |
| `export-document` | MD/DOCX export |
| `ingest-eu-ai-act` | EU AI Act (23 articles) — deployed ✓ invoked ✓ |
| `ingest-gdpr` | GDPR (27 articles) — deployed ✓ invoked ✓ |
| `ingest-cis-controls-v8` | CIS Controls v8 (18 controls) — deployed ✓ invoked ✓ |
| `ingest-pci-dss-v4` | PCI DSS v4.0 (12 requirements) — deployed ✓ NOT YET INVOKED |
| `ingest-hipaa-security-rule` | HIPAA Security Rule (18 controls) — deployed ✓ NOT YET INVOKED |

### Key Source Files
| File | Purpose |
|---|---|
| `src/App.tsx` | Route definitions — public + authenticated |
| `src/contexts/AuthContext.tsx` | Session management, `useAuth()` hook |
| `src/components/AuthGuard.tsx` | Redirects unauthenticated to `/login` |
| `src/layouts/AppLayout.tsx` | Authenticated shell — desktop + mobile nav |
| `src/pages/LandingPage.tsx` | Public marketing page |
| `src/pages/Dashboard.tsx` | Framework cards + ingest activity |
| `src/pages/ChatPage.tsx` | RAG chat UI |
| `src/pages/SearchPage.tsx` | Semantic search |
| `src/pages/WizardPage.tsx` | Artifact generation wizard |
| `src/pages/KnowledgeBasePage.tsx` | Framework inventory + quality badges |
| `src/pages/AccountPage.tsx` | Profile + password + plan |
| `src/pages/PricingPage.tsx` | Public pricing page |
| `src/pages/app/FrameworkCategoryPage.tsx` | `/app/frameworks/:category` |
| `src/utils/frameworkGroups.ts` | `categoryToGroup()`, `FRAMEWORK_GROUPS` config |
| `supabase/migrations/` | All DB migrations (001–008) |
| `docs/PRD.md` | Source of truth for product requirements |

---

## Verified Working (End of This Session)
- [x] Email/password auth (register, login, forgot/reset password)
- [x] AuthGuard protecting all `/app/*` routes
- [x] Mobile nav with hamburger menu
- [x] Landing page, pricing, all 5 legal pages
- [x] EU AI Act ingest: 23 docs, 0 errors
- [x] GDPR ingest: 27 docs, 0 errors
- [x] CIS Controls v8 ingest: 18 docs, 0 errors
- [x] PCI DSS v4.0 function deployed (invoke pending)
- [x] HIPAA Security Rule function deployed (invoke pending)
- [x] PRD updated to v1.5.0
- [ ] PCI DSS invoked (run commands above)
- [ ] HIPAA invoked (run commands above)
- [ ] Pushed to GitHub
