# CyberComplianceHub — Product Requirements Document

**Version:** 1.6.1
**Last Updated:** July 1, 2026 (end of session)

---

## Executive Summary

CyberComplianceHub is an AI-powered compliance knowledge hub for compliance officers, security engineers, auditors, and risk managers. It provides semantic search, AI-powered Q&A with citations, and automated generation of compliance artifacts (policies, checklists, procedures, assessments) across cybersecurity, AI governance, and financial/healthcare compliance frameworks.

---

## Problem Statement

1. **Information Overload** — Multiple frameworks with thousands of controls across NIST, ISO, FedRAMP, CMMC, SOX, and AI governance standards
2. **Manual Document Creation** — Policies, checklists, SSPs, and POA&Ms require significant manual effort
3. **Cross-Framework Complexity** — Understanding how controls map between frameworks is time-consuming
4. **Keeping Current** — Frameworks update regularly, requiring continuous monitoring

---

## Target Users

| Role | Primary Use Case |
|---|---|
| Compliance Officers | Framework Q&A, gap assessments, policy generation |
| Security Engineers | Control implementation guidance, procedure generation |
| Auditors | Evidence checklists, control assessments |
| Risk Managers | Cross-framework mapping, risk register generation |

---

## Frameworks Covered

### Cybersecurity (Live)
| Framework | Documents | Status |
|---|---|---|
| NIST SP 800-53 Rev 5 | 137 controls + 872 enhancements | Good ✓ |
| CMMC 2.0 (L2) | 238 (114 CAG assessment docs) | Good ✓ |
| NIST CSF 2.0 | 221 | Good ✓ |
| NIST RMF | 43 | Moderate |
| CIS Controls v8 | 18 | Partial |
| ISO 27001:2022 | 8 | Sample only |
| FedRAMP High | 388 | Good ✓ |
| FedRAMP Moderate | 305 | Good ✓ |
| FedRAMP Low | 167 | Good ✓ |
| MITRE ATT&CK | varies | Thin |

### Financial / Healthcare (Live)
| Framework | Documents | Status |
|---|---|---|
| SOX | 56 | Good ✓ |
| GDPR | 27 | Partial |
| PCI DSS v4.0 | 12 | Partial |
| HIPAA Security Rule | 18 | Partial |
| SOC 2 (AICPA) | 81 | Good ✓ |

### AI Governance (Live)
| Framework | Documents | Status |
|---|---|---|
| EU AI Act | 79 | Good ✓ |
| NIST AI RMF | ~60 | Moderate |
| ISO 42001 | 48 | Moderate |
| NIST AI 100-1 | 28 | Good ✓ |
| MITRE ATLAS | 30 | Good ✓ |
| DoD AI Ethics | 24 | Good ✓ |
| OECD AI Principles | 14 | Thin |
| Singapore MAIGF | ingested | Thin |
| UNESCO AI Ethics | ingested | Thin |
| UK AISI | ingested | Thin |
| G7 Hiroshima AI | ingested | Thin |
| Canada AIDA | ingested | Thin |
| China GenAI Reg | ingested | Thin |
| Japan METI AI | ingested | Thin |

### Queued / Backlog
- CMMC v3.0 — target Q4 2026
- ISO/IEC 23894 — AI Risk Management Standard
- Full ISO 27001 coverage (currently 8 sample docs)

---

## Feature Requirements

### 1. AI-Powered Chat (RAG Pipeline) — Live ✓

Natural language Q&A with streaming responses and cited sources.

**Implemented:**
- OpenAI text-embedding-3-small for query embeddings
- pgvector cosine similarity search (match_documents RPC)
- Claude Haiku for response generation (direct fetch, SSE streaming)
- Multi-framework comparison: detects named frameworks in query, runs per-framework searches, interleaves results
- Cross-framework clustering: finds semantically similar controls across frameworks, shows related framework tags
- Markdown rendering in response window
- Framework filter dropdown

**Backlog:**
- Chat history persistence (resets on page reload) — LOW (post-beta user feedback)
- Source/document inventory query — LOW

---

### 2. Semantic Search — Live ✓

**Implemented:**
- Vector similarity search
- Framework filter
- Results show document title, framework, snippet

**Backlog:**
- Filter by document type, control family
- Highlighted keyword matches in results

---

### 3. Policy/Artifact Generator — Live ✓

Multi-step wizard: Framework → Template → [Family Picker] → Scope → Generate → Export.

**Current Templates (as of 2026-07-01):**

| Framework | Policy | Checklist | Procedure | POA&M | Gap Assessment |
|---|---|---|---|---|---|
| PCI DSS v4 | ✓ | ✓ | ✓ | — | — |
| HIPAA | ✓ | ✓ | ✓ | — | — |
| GDPR | ✓ | ✓ | — | — | — |
| CIS Controls v8 | ✓ | ✓ | — | — | — |
| SOC 2 | ✓ | ✓ | — | — | — |
| EU AI Act | ✓ | ✓ | — | — | — |

**Template Gap:** NIST CSF, NIST SP 800-53, FedRAMP, ISO 27001, CMMC, MITRE ATT&CK, MITRE ATLAS, OECD AI, SOX, DoD AI Ethics, NIST RMF, NIST AI 100-1 have NO templates yet — wizard shows empty state for these frameworks.

**Template Backlog (Priority Order):**
1. **SOC 2 — HIGH:** Add Procedure, POA&M, and Gap Assessment (currently only Policy + Checklist). SOC 2 is #1 priority framework.
2. NIST CSF → ISO 27001 → CMMC → FedRAMP — minimum Policy + Checklist per framework
3. Gap Assessment — family-scoped; all core frameworks
4. SSP (System Security Plan) — CMMC, FedRAMP Moderate, SP 800-53

**Export Formats:**
- ✓ Markdown (`.md`)
- ✓ DOCX (`.docx` — real binary via `docx` library)
- PDF — backlog P3 (requires server-side headless browser)
- Excel — backlog P2 (POA&M and Checklist types; use SheetJS)

---

### 4. Knowledge Base — Live ✓

**Implemented:**
- Framework inventory with aligned column layout: Name, Docs, Controls, Source Type, Quality badge, Last Ingested date
- Quality badges: Good (40+ docs), Partial (15–39), Thin (<15)
- Last Ingested = MAX(documents.created_at) per framework — true content freshness signal
- Expand to view up to 200 control document titles per framework
- Grouped by category (Cybersecurity / Financial & Healthcare / AI Governance)
- Search/filter bar

**Backlog:**
- Condensed public-facing version on landing page to showcase content depth — MEDIUM
- Thin/Partial coverage discussion — resurface which frameworks need more ingest — LOW
- Knowledge Base as plan generator (Continuous Monitoring Plans, SSP sections) — BACKLOG
- Evidence development guidance per framework (what evidence satisfies each control) — BACKLOG

---

### 5. Dashboard — Live ✓

- Framework cards grouped by category
- Recent ingest activity table
- Quick actions: Chat, Search, Generate

---

### 6. User Authentication & Access Control — Live ✓

**Implemented (as of 2026-07-01):**
- Supabase Auth — social login only presented (Google, Apple, GitHub); email/password available in DB but hidden from UI
- `AuthContext` + `useAuth()` — session management, `displayName`, `isPlatformAdmin`, `refreshDisplayName`
- `AuthGuard` — protects all `/app/*` routes
- `AdminGuard` — protects `/app/admin/*` routes; requires `is_platform_admin = true` on profile
- Social login via OAuth: Google, Apple, GitHub
- 30-minute inactivity timeout with warning modal (25-min warning, auto sign-out at 30 min)
- `profiles` table — `display_name`, `is_platform_admin`; auto-created on signup via trigger; RLS via `is_platform_admin()` SECURITY DEFINER function (prevents recursive policy loop)
- `organizations` + `org_members` tables — multi-tenant org model
- `usage_events` table — metering infrastructure (not yet instrumented)
- `AccountPage` — display name, password change, plan display, generated document history
- Vercel deployment at `cyber-compliance-hub.vercel.app`

**Admin Layer (Platform Admin only):**
- Admin nav (gray/navy color scheme) accessible via "Admin" link in top nav
- Users page: org/role columns, search by name/ID/org; Edit modal — display name, platform admin toggle (self-guard), org assignment (org + role: owner/admin/member)
- Organizations page: New Org modal + Edit modal (name, slug, plan, seat limit); plan dropdown saves inline
- Settings page: placeholder cards for Plan Limits, Email/SMTP, Session Policy, Analytics
- All admin RLS uses `is_platform_admin()` SECURITY DEFINER function (prevents 42P17 recursion)

**Org Assignment Model:** Option B — users start org-less on self-enroll. Free-tier features work without an org. Org membership gates Team tier features. Platform admin assigns orgs manually. Onboarding flow for Team tier is a future backlog item.

**Backlog:**
- Custom SMTP — once domain finalized; needed for invite emails and branded transactional email — HIGH
- Email invites (org-context aware) — depends on Custom SMTP
- Org Admin UI — org owners can invite/remove members, view org usage — reuses Admin Users UI filtered by org_id — LOW (post-beta)
- GDPR Article 15/17/20 — Download My Data, Right to Erasure (soft-delete, 30-day window) — MEDIUM (before EU marketing)
- Stripe billing — on hold until beta testers engaged
- Supabase Pro upgrade — unlocks session time-box, JWT expiry settings, and higher email rate limits

**Pricing Tiers:**
| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 10 chat/day, 3 generations/month, no export |
| Beta | $0 | Same as Pro (no limits) — admin-assigned manually |
| Pro | $39/mo | Unlimited chat + generation, all exports, document history |
| Team | $149/mo (5 seats) | Pro + shared library, member management |
| Enterprise | Custom | Team + SSO, audit log, custom frameworks, SLA |

---

### 7. Analytics — Backlog

**Current state:** Plausible Analytics tags removed (2026-07-01). `usage_events` table exists but not yet instrumented.

**Decision pending:** Evaluate Vercel Analytics (available on paid Vercel tier) vs. re-adding Plausible.

**Usage instrumentation backlog:** Insert `usage_events` for: `chat.message_sent`, `document.generated`, `document.exported`, `search.performed`, `auth.signed_in`

**Admin analytics panel backlog:** DAU, most-used frameworks, generation counts, export formats. No PII in event metadata.

---

### 8. Cross-Framework Mapping — P1

Semantic clustering live (shows "Also in: X, Y" tags). Explicit pre-computed mapping table is backlog.

---

## Technical Architecture

### Frontend
- Vite + React 18 + TypeScript + Tailwind CSS
- React Router, React Hooks
- react-markdown + remark-gfm for rendering AI responses and generated documents
- Deployed: Vercel (`cyber-compliance-hub.vercel.app`)

### Backend
- Supabase: PostgreSQL + Edge Functions (Deno) + pgvector
- OpenAI text-embedding-3-small for embeddings
- Claude Haiku (claude-haiku-4-5) for chat and document generation

### Edge Functions
| Function | Purpose |
|---|---|
| `/chat` | RAG Q&A with SSE streaming |
| `/search` | Vector similarity search |
| `/generate-document` | Policy/artifact generator — stamps `user_id` on saved documents |
| `/export-document` | MD/DOCX export |
| `/ingest-*` | Per-framework data ingestion (30+ functions) |

### DB Constraints (critical — never violate)
- `compliance_frameworks.category` CHECK: `nist`, `iso`, `fedramp`, `cmmc`, `sox`, `ai-safety`, `healthcare`, `privacy`
- `templates.template_type` CHECK: `policy`, `checklist`, `control-map`, `procedure`, `raci`, `poam`, `gap_assessment`
- `organizations.plan` CHECK: `free`, `beta`, `pro`, `team`, `enterprise`
- `generated_documents` has `user_id UUID` (nullable) — stamped by edge function, enforced by RLS
- No unique constraint on `abbreviation` — use `WHERE NOT EXISTS` pattern

### Security
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are client-safe (RLS enforced)
- `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are Supabase Edge Function secrets ONLY — NEVER add VITE_ prefix
- `family_metadata_field` validated against ALLOWED_FAMILY_FIELDS allowlist in generate-document
- `.env` gitignored
- All app routes behind `AuthGuard`; admin routes behind `AdminGuard`
- RLS on all tables; `is_platform_admin()` SECURITY DEFINER function prevents recursive policy evaluation
- Apple OAuth secret expires every 6 months — rotate via Supabase dashboard secret generator (use Chrome, not Safari)

### Migrations Applied
| # | File | Description |
|---|---|---|
| 001 | compliance_schema | Core schema |
| 002–004 | seed_reference_data, seed_nist_csf, seed_fedramp_iso | Initial seed data |
| 005–006 | security_fixes, fix_match_documents | RLS tightening, search fix |
| 007 | tighten_rls | RLS hardening |
| 008 | organizations | Orgs, profiles, usage_events, handle_new_user trigger |
| 009 | template_expansion | Templates for PCI DSS, HIPAA, GDPR, CIS Controls, SOC 2, EU AI Act |
| 010 | platform_admin_beta | is_platform_admin column, beta plan tier |
| 011 | fix_rls_recursion | SECURITY DEFINER is_platform_admin() function; fixes 42P17 error |
| 012 | generated_docs_user_id | user_id on generated_documents, updated RLS |
| 013 | healthcare_category | Adds healthcare/privacy categories; moves HIPAA from sox → healthcare |

---

## Success Metrics

| Metric | Target | Current |
|---|---|---|
| Framework coverage | Good (40+ docs) for all core frameworks | 12 of ~25 frameworks at Good ✓ |
| Response time (chat) | < 5s initial response | ✓ Streaming within ~1s |
| Response time (search) | < 2s | ✓ |
| Template coverage | Policy + Checklist for all live frameworks | 6 of ~25 frameworks have templates |
| Inactivity timeout | 30-minute client-side | ✓ Implemented |

---

## Open Questions

1. **Analytics platform** — Vercel Analytics vs. Plausible? Decide after Vercel tier upgrade.
2. **Evidence guidance** — Feasibility research needed per framework.
3. **KB as plan generator** — Scope and priority for Continuous Monitoring Plans and similar use cases.
4. **CMMC 3.0** — Mandatory date TBD; revisit when announced.
5. **SOC 2 Type 1 vs Type 2** — Distinction needed in templates?
6. **Thin/Partial KB coverage** — Which frameworks are worth additional ingest investment?
7. **Offline/air-gapped** — Support for classified environments?

---

*Maintained by Carl Scott — CyberComplianceHub*
