# CyberComplianceHub — Session Handoff
**Date:** July 1, 2026 (Evening Session)
**Status:** FINAL — ready for new session

---

## What Was Built This Session

### Bug Fixes
- **Chat page footer overlap** — `AppLayout <main>` now has `flex flex-col`; `ChatPage` outer div changed from `h-[calc(100vh-4rem)]` to `flex-1 min-h-0`. Footer no longer overlaps the input field.
- **CORS domain mismatch (Wizard/Export broken)** — Both `generate-document` and `export-document` edge functions had `Access-Control-Allow-Origin` hardcoded to `https://cybercompliancehub.vercel.app` (wrong domain). Replaced with dynamic `getCorsHeaders(req)` function using an `ALLOWED_ORIGINS` Set. Both functions redeployed. Wizard now works.

### Knowledge Base — Three-Page System
- **`src/hooks/useKnowledgeBaseData.ts`** — NEW shared hook. Fetches `compliance_frameworks` + per-framework `doc_count` and `control_count` via parallel sub-queries. Used by all three KB pages to stay in sync.
- **Auth KB (`/app/knowledge-base`)** — Updated to use shared hook; source URL removed from public-facing table. Quality badge retained.
- **Public KB (`/knowledge-base`)** — NEW standalone page with its own header/footer. Simpler 4-column grid; no Quality column, no source URL, no expand/collapse.
- **Admin KB (`/app/admin/knowledge-base`)** — NEW full 6-column admin table. Shows source URL as clickable link + scraper type badge. Added to `AdminNav` and `AppLayout` routes.
- **Landing page** — Hero badge now shows live framework/document counts from Supabase. Hero paragraph condensed; "Knowledge Base" added to desktop public nav.

### Account Page — Document History Enhancements
- **Migration 016** — adds `is_starred BOOLEAN DEFAULT false` and `deleted_at TIMESTAMPTZ NULL` to `generated_documents`.
- **Star/filter/soft-delete** — star toggle with error rollback; soft-delete (×) with error rollback + undo capture; filter chips (All, Starred, per-framework, per-type).
- **Document preview modal** — slide-over fetching `content_markdown` on open; ReactMarkdown + remark-gfm rendering; Export MD/DOCX/XLSX from modal; "Remove from history" (soft-delete from modal).
- **GDPR "Download My Data"** — downloads profile + all generated_documents (no deleted_at filter per Article 20) + org_members as JSON.

### Artifact Templates — Tier 1 Frameworks
- **Migration 017** (`20260701060000_017_tier1_framework_templates.sql`) — adds Procedure + POA&M + Gap Assessment templates for:
  - NIST CSF 2.0
  - ISO 27001
  - CMMC 2.0
  - SP 800-53
- All inserts guarded with `WHERE NOT EXISTS`. Matches migration 014 (SOC 2) pattern exactly.
- ⚠️ **Migration 017 NOT YET RUN in Supabase** — run this first thing next session.

### Claude Design — Visual Redesign Spec
- Claude Design produced a full 10-screen redesign reference.
- Design spec saved to **`docs/DESIGN_SPEC.md`** — contains all color tokens, typography, spacing, and per-screen layout specs. Start here before implementing.
- Reference HTML files in `~/Downloads/design_handoff_cybercompliancehub_redesign/` (not in repo — too large, design-runtime-dependent).
- **Logo:** Four directions explored. User leans toward direction A or B ("convergence hub" concept). Logo not yet finalized or integrated. Do NOT treat the current shield-check placeholder as final.
- **Key design decisions to discuss before implementing:**
  - Quality badge: Claude Design kept it — aligns with our decision ✓
  - Source URL: removed from public/auth KB, shown only in admin view — aligns ✓
  - Some mocked pages not exactly to user's liking — **discuss each page before implementing**
  - Unauthenticated pages: Claude Design has additional thoughts, still iterating
  - IBM Plex Sans + IBM Plex Mono fonts approved as direction

---

## All Migrations Applied (run in Supabase ✓)

| # | File | Description | Status |
|---|---|---|---|
| 009 | template_expansion | Templates for PCI DSS, HIPAA, GDPR, CIS Controls, SOC 2, EU AI Act | ✓ |
| 010 | platform_admin_beta | is_platform_admin column, beta plan tier | ✓ |
| 011 | fix_rls_recursion | SECURITY DEFINER function, admin policies for profiles/orgs/org_members | ✓ |
| 012 | generated_docs_user_id | user_id on generated_documents, per-user RLS | ✓ |
| 013 | healthcare_category | Adds healthcare/privacy categories; HIPAA → healthcare | ✓ |
| 014 | soc2_templates | SOC 2 Procedure, POA&M, Gap Assessment | ✓ |
| 015 | remaining_framework_templates | Policy+Checklist for CMMC, FedRAMP H/M/L, NIST AI/RMF, MITRE ATLAS, AI frameworks | ✓ |
| 016 | document_history_enhancements | is_starred + deleted_at on generated_documents | ✓ |
| **017** | **tier1_framework_templates** | **Procedure+POA&M+Gap Assessment for NIST CSF, ISO 27001, CMMC, SP 800-53** | **⚠️ PENDING** |

---

## Immediate Next Actions for New Session

### 1. Run Migration 017 ⚠️ FIRST
Go to Supabase SQL Editor → paste and run `supabase/migrations/20260701060000_017_tier1_framework_templates.sql`.
This unlocks Procedure, POA&M, and Gap Assessment for the 4 highest-demand frameworks in the wizard.

### 2. Design Implementation — Discuss Before Building
Read `docs/DESIGN_SPEC.md` in full. The spec is complete and high-fidelity.
Before implementing any page, discuss with the user:
- Which pages are approved as-is vs. need tweaks
- Logo direction (A or B — convergence hub concept) and when to integrate
- Unauthenticated pages (landing, login, public KB) — Claude Design has further thoughts
- Font loading strategy (IBM Plex Sans/Mono via Google Fonts — add to `index.html`)

Suggested implementation order (once approved per page):
1. Design tokens → `tailwind.config.js` + `index.css`
2. Top Nav + Footer (shared, cascade to all screens)
3. Login page (full-bleed, no app nav)
4. Dashboard
5. Chat, Search, Generate (wizard)
6. Knowledge Base
7. Account Settings
8. Admin pages

### 3. Artifact Templates — Tier 2
After migration 017 is live and verified, write migration 018:
- FedRAMP High, FedRAMP Moderate, FedRAMP Low — Procedure + POA&M
- NIST RMF — Procedure + POA&M

### 4. Artifact Templates — Tier 3
Migration 019:
- GDPR — POA&M + Gap Assessment (already has Procedure from migration 009)
- PCI DSS — POA&M + Gap Assessment (already has Procedure)
- HIPAA — POA&M + Gap Assessment (already has Procedure)
- SOX — Procedure + POA&M + Gap Assessment

### 5. Beta User Plan Tier — HIGH (before beta launch)
Already in the CHECK constraint. Need admin UI to assign `beta` plan manually. Beta = same permissions as Pro (no generation limits).

### 6. Usage Analytics Instrumentation — MEDIUM
Wire `usage_events` inserts into: chat.message_sent, document.generated, document.exported, search.performed. Build admin analytics panel. Table (`usage_events`) already exists from migration 008.

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
- Edge functions deployed: `generate-document`, `export-document`, `chat`, `dedup-documents`

### Key Files
| File | Purpose |
|---|---|
| `src/contexts/AuthContext.tsx` | Session, displayName, isPlatformAdmin, refreshDisplayName |
| `src/layouts/AppLayout.tsx` | Authenticated shell — nav, footer, inactivity modal, admin nav, routes |
| `src/hooks/useKnowledgeBaseData.ts` | Shared KB data hook used by all three KB pages |
| `src/hooks/useInactivityTimeout.ts` | 30-min idle timer; warns at 25 min |
| `src/pages/ChatPage.tsx` | Compliance chat with streaming + citations |
| `src/pages/WizardPage.tsx` | 5-step artifact generator |
| `src/pages/AccountPage.tsx` | Profile, document history (star/filter/modal/soft-delete), GDPR export |
| `src/pages/KnowledgeBasePage.tsx` | Auth KB — expand/collapse doc lists, quality badges |
| `src/pages/PublicKnowledgeBasePage.tsx` | Unauthenticated KB at /knowledge-base |
| `src/pages/admin/AdminKnowledgeBasePage.tsx` | Admin KB — source URLs, scraper types |
| `src/pages/admin/AdminUsersPage.tsx` | User list + edit modal |
| `src/pages/admin/AdminOrgsPage.tsx` | Org list + create/edit modals |
| `supabase/functions/generate-document/index.ts` | Artifact generation (5 template types, family-scoped) |
| `supabase/functions/export-document/index.ts` | MD/DOCX/XLSX export |
| `docs/PRD.md` | Product requirements v1.6 |
| `docs/DESIGN_SPEC.md` | Claude Design handoff — tokens, typography, all 10 screens |

### Template Coverage (post-migration 016, pre-017)
| Framework | Policy | Checklist | Procedure | POA&M | Gap Assessment |
|---|---|---|---|---|---|
| SOC 2 | ✓ | ✓ | ✓ | ✓ | ✓ |
| PCI DSS | ✓ | ✓ | ✓ | — | — |
| HIPAA | ✓ | ✓ | ✓ | — | — |
| NIST CSF | ✓ | ✓ | **pending 017** | **pending** | **pending** |
| SP 800-53 | ✓ | ✓ | **pending 017** | **pending** | **pending** |
| ISO 27001 | ✓ | ✓ | **pending 017** | **pending** | **pending** |
| CMMC | ✓ | ✓ | **pending 017** | **pending** | **pending** |
| NIST RMF | ✓ | ✓ | — | — | — |
| FedRAMP H/M/L | ✓ | ✓ | — | — | — |
| SOX | ✓ | ✓ | — | — | — |
| GDPR | ✓ | ✓ | — | — | — |
| All others | ✓ | ✓ | — | — | — |

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

Top items in priority order:
1. **Run Migration 017** — unlocks Tier 1 artifact suite ⚠️ PENDING
2. **Design implementation** — discuss page-by-page before building; spec in `docs/DESIGN_SPEC.md`
3. **Logo finalization** — direction A or B; integrate once decided
4. **Tier 2 artifact templates** — FedRAMP H/M/L + NIST RMF Procedure + POA&M
5. **Beta plan tier admin UI** — assign beta plan manually; beta = Pro permissions
6. **Custom SMTP** — domain needed first; blocks beta invites
7. **Usage analytics** — `usage_events` inserts + admin panel
8. **Tier 3 artifact templates** — GDPR/PCI DSS/HIPAA/SOX POA&M + Gap Assessment
9. **Inactivity session timeout** — already built (30 min); consider reducing Supabase refresh token to 24h (Pro upgrade needed)
10. **Chat persistence** — post-beta user feedback

---

*Session ended: July 1, 2026 (Evening)*
