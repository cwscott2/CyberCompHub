# CyberComplianceHub — Product Requirements Document

**Version:** 1.5.0
**Last Updated:** June 30, 2026

---

## Executive Summary

CyberComplianceHub is an AI-powered compliance knowledge hub for compliance officers, security engineers, auditors, and risk managers. It provides semantic search, AI-powered Q&A with citations, and automated generation of compliance artifacts (policies, checklists, procedures, assessments) across cybersecurity, AI governance, and financial compliance frameworks.

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
| NIST SP 800-53 Rev 5 | 137 | Good ✓ |
| CMMC Level 2 | 110 | Good ✓ |
| ISO 27001:2022 | 8 | Sample only |
| NIST CSF 2.0 | 221 | Good ✓ |
| NIST RMF | 43 | Moderate |
| FedRAMP Moderate | seed only | No embeddings yet |

### Financial / Privacy (Live)
| Framework | Documents | Status |
|---|---|---|
| SOX | 56 | Good ✓ |
| GDPR | 27 | Partial |
| PCI DSS v4.0 | 12 | Partial |
| HIPAA Security Rule | 18 | Partial |

### AI Governance (Live)
| Framework | Documents | Status |
|---|---|---|
| EU AI Act | 23 | Partial |
| NIST AI RMF | ~60 | Moderate |
| ISO 42001 | 48 | Moderate |
| NIST AI 100-1 | 17 | Thin → Queued |
| MITRE ATLAS | 14 | Thin → Queued |
| DoD AI Ethics | 14 | Thin → Queued |
| OECD AI Principles | 14 | Thin → Queued |
| Singapore MAIGF | ingested | Thin |
| UNESCO AI Ethics | ingested | Thin |
| UK AISI | ingested | Thin |
| G7 Hiroshima AI | ingested | Thin |
| Canada AIDA | ingested | Thin |
| China GenAI Reg | ingested | Thin |
| Japan METI AI | ingested | Thin |

### Cybersecurity (Live)
| Framework | Documents | Status |
|---|---|---|
| NIST SP 800-53 Rev 5 | 137 controls + 872 enhancements | Good ✓ |
| CMMC 2.0 (L2) | 114 | Good ✓ |
| NIST CSF 2.0 | 221 | Good ✓ |
| NIST RMF | 43 | Moderate |
| CIS Controls v8 | 18 | Partial |
| ISO 27001:2022 | 8 | Sample only |
| FedRAMP Moderate | seed only | No embeddings yet |

### Queued (Not Yet Built)
- SOC 2 (AICPA Trust Service Criteria) — HIGH PRIORITY, top-3 user framework
- FedRAMP High (~421 controls)
- FedRAMP Low (~125 controls)
- FedRAMP Moderate embeddings
- ISO 42001 reference coverage (Q3 2026)
- CMMC v3.0 (Q4 2026)

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
- Source/document inventory query — when a user asks "what sources do you have for CMMC?", return a list of ingested documents/sources (low priority)
- Chat history persistence (resets on page reload)

**Acceptance Criteria:**
- ✓ Streaming response with citations
- ✓ Framework filtering
- ✓ Cross-framework comparison queries work
- ✓ Sources show related framework tags for overlapping controls

---

### 2. Semantic Search — Live ✓

**Implemented:**
- Vector similarity search replacing keyword search
- Framework filter
- Results show document title, framework, snippet

**Backlog:**
- Filter by document type, control family
- Highlighted keyword matches in results

---

### 3. Policy/Artifact Generator — Live ✓

Multi-step wizard: Framework → Template → [Family Picker for procedure/gap_assessment] → Scope → Generate → Export.

Compliance officers always generate procedure and gap assessment documents scoped to a single security control family (e.g., "Access Control"). The wizard enforces this with a required family picker step for those template types.

**Current Templates (as of 2026-06-29):**

| Framework | Policy | Checklist | Procedure | POA&M | Gap Assessment |
|---|---|---|---|---|---|
| NIST CSF | ✓ | ✓ | ✓ | — | — |
| SP 800-53 | ✓ | ✓ | ✓ | ✓ | — |
| FedRAMP Moderate | ✓ | ✓ | ✓ | ✓ | — |
| CMMC | ✓ | ✓ | ✓ | ✓ | — |
| ISO 27001 | ✓ | ✓ | ✓ | — | — |
| NIST RMF | ✓ | ✓ | ✓ | — | — |
| NIST AI RMF | ✓ | ✓ | — | — | — |
| ISO 42001 | ✓ | ✓ | — | — | — |
| SOX | ✓ | ✓ | — | — | — |
| EU AI Act | ✓ | ✓ | — | — | — |
| DoD AI Ethics | ✓ | ✓ | — | — | — |
| MITRE ATLAS | ✓ | ✓ | — | — | — |
| NIST AI 100-1 | ✓ | ✓ | — | — | — |
| OECD AI Principles | ✓ | ✓ | — | — | — |

**Template Backlog (Priority Order):**
1. Gap Assessment — family-scoped; all frameworks; wizard family picker already built ✓
2. SSP (System Security Plan) — CMMC, FedRAMP Moderate, SP 800-53
3. Procedure templates for AI frameworks (deferred — thin data)
4. Risk Register — cross-framework

#### LLM Generation Pattern — All Artifact Types

The LLM generation pattern established for policies applies to all artifact types. The pipeline is identical (fetch controls → build context → call Claude → tag with control IDs); only the prompt and output structure change per type.

| Artifact | Prompt Focus | Control ID Tagging | Family-Scoped |
|---|---|---|---|
| **Policy** | Organizational commitments in policy language; purpose, scope, requirements, roles, enforcement | Sub-component level (e.g., `[AC-1a]`) | Yes |
| **Procedure** | Step-by-step implementation: who does what, how, with what tools, how to verify completion | Sub-component level (e.g., `[AC-2b]`) | Yes |
| **Gap Assessment** | Current-state vs. required-state; typical evidence artifacts; common gaps per control component | Sub-component level (e.g., `[AC-2a]`) | Yes |
| **SSP Narrative** | Descriptive "how we implement this control" in NIST SP 800-18 SSP language | Control level (e.g., `[AC-2]`) | Yes |
| **POA&M** | Finding register with risk level and remediation guidance per control | Control level (e.g., `[AC-2]`) | No (flat) |
| **Risk Register** | Risk statement, likelihood, impact, recommended mitigations | Control family level | No (flat) |

All LLM-generated artifacts include:
- `[Organization Name]` and `[Effective Date]` placeholders for customization
- Control ID tags for assessor traceability
- Markdown output rendered via `remark-gfm` for proper table display

Implementation order: Policy ✓ → Procedure (next) → Gap Assessment → SSP → Risk Register

#### Policy Generation — Implementation (as of 2026-06-29)

Policy documents are generated via LLM (Claude Haiku) using the framework's ingested control data as RAG context. This produces real policy prose rather than a restatement of control language.

**Generation pipeline (`generate-document` edge function):**
- For `template_type === 'policy'`: fetches base controls for the selected family (up to 40), builds a compact context string (control ID + title + first 400 chars of requirement), and calls Claude Haiku with a structured prompt
- For all other template types: uses the existing template assembler (deterministic, no LLM call)

**Policy document structure (LLM-generated):**
1. Title
2. Document Control table (Organization, Version, Effective Date, Review Cycle, Owner)
3. Purpose
4. Scope
5. Policy Statement
6. Policy Requirements — plain language, organized by logical control groupings
7. Roles and Responsibilities (table)
8. Compliance and Enforcement
9. Review and Update Schedule
10. Related Documents

**Key design decisions:**
- Control sub-components (`a.`, `b.`, `c.`) are preserved in ingested `raw_content` via structured `getProse()` parsing of OSCAL sub-parts — giving Claude the specificity to write accurate policy language per component
- Control ID tags appended to each requirement at sub-component granularity (e.g., `[AC-1a]`, `[AC-2b]`) — gives assessors traceability to verify all controls are covered
- `[Organization Name]` and `[Effective Date]` placeholders throughout for easy customization
- Policy title formatted as `{Family} Security Policy — {Framework Name}`
- Markdown tables rendered via `remark-gfm` plugin on the frontend

**Ingest requirements for quality policy generation:**
- OSCAL-sourced frameworks (SP 800-53): `getProse()` must recurse into sub-parts and preserve labels — currently implemented
- Non-OSCAL frameworks: control `raw_content` must include numbered/lettered sub-requirements where the standard defines them
- Ingest functions must be idempotent (delete-before-insert per family) to support re-ingestion without duplicates

**Policy generation backlog — remaining frameworks:**

| Framework | Status | Notes |
|---|---|---|
| SP 800-53 | ✓ Done | Pattern established — OSCAL sub-parts, sub-component tagging |
| CMMC | Queued | Similar to SP 800-53; uses `domain_name` family field |
| FedRAMP Moderate | Queued | SP 800-53 superset; inherits same control structure |
| ISO 27001 | Queued | Needs full ingest first (currently 8 sample docs only) |
| NIST CSF | Queued | Function-scoped (Identify, Protect, Detect, Respond, Recover) |
| NIST RMF | Queued | Process framework — policy generation scoped to RMF steps |
| SOX | Queued | Section-scoped (302, 404, 409, 802, 906) |
| EU AI Act | Queued | Title/Article-scoped |
| SOC 2 | Queued | Trust Service Criteria-scoped (pending ingest) |

**Procedure generation behavior:**
- Each control formatted as 4-step scaffold: Understand → Assign Responsibility → Implement → Verify
- Document title includes family name (e.g., "CMMC Access Control Procedures")
- Family filtering via `metadata.domain_name` / `metadata.family_name` etc. per framework
- `family_metadata_field` validated against allowlist before DB query (security)

**POA&M generation behavior:**
- Flat finding register (no family picker)
- Output: markdown table with Finding | Control Reference | Risk Level | Remediation Owner | Due Date | Status

**Export Formats:**
- ✓ Markdown (`.md` download)
- ✓ DOCX (`.docx` download via `docx` library — real binary, not HTML)
- PDF — removed from UI pending proper implementation (requires server-side headless browser, e.g., Puppeteer Cloud or Gotenberg); backlog P3
- Excel (`.xlsx`) — backlog P2; see below

**Export Backlog:**

1. **Excel export for POA&M and Checklist (P2)** — POA&M and compliance checklists are inherently tabular and compliance teams expect to work in Excel. FedRAMP's official POA&M template is an Excel workbook. Implementation: use SheetJS (`xlsx`) in the export-document edge function; parse markdown table rows from the generated content into worksheet rows. Export as `.xlsx`. Applies to `poam` and `checklist` template types initially; extend to gap assessment summary table later.

2. **Framework-specific POA&M requirements (P1)** — POA&M format and required fields vary by framework. Current LLM-generated POA&M uses a generic finding register. Each framework has specific requirements:
   - **NIST SP 800-53 / RMF**: POA&M must align with NIST SP 800-137 (ISCM) and OMB Memorandum M-02-01. Required fields: Weakness ID, Control ID, Weakness Name, Point of Contact, Resources Required, Scheduled Completion Date, Milestones, Milestone Changes, Status, Comments
   - **FedRAMP**: Strict template with specific columns — POA&M ID, Control Name, Original Detection Source, Date Identified, Weakness Name, Weakness Description, Weakness Detector Source, Weakness Severity, CVSS Score, CVSS Vector, Resources Required, Scheduled Completion Date, Milestone with Completion Dates, Milestone Changes, Status (Open/Closed/Risk Accepted/Vendor Dependency), Vendor Dependency, Last Vendor Check-in Date, Original Risk Rating, Adjusted Risk Rating, Risk Adjustment, False Positive, Operational Requirement, Deviation Rationale, Supporting Documents, Comments
   - **CMMC**: POA&M tied to CMMC Assessment scope; must reference Practice IDs and Objective IDs; aligns with DoD Assessment Methodology
   - **SOC 2**: Management response letter format rather than POA&M; findings linked to Trust Service Criteria
   - **Action**: Build framework-aware POA&M prompts that instruct Claude to generate the correct fields per framework. Long-term: provide downloadable Excel template pre-populated with the correct column headers per framework.

3. **PDF export (P3)** — True PDF generation requires server-side headless Chrome. Options: Puppeteer Cloud function, Gotenberg (self-hosted), or a third-party service (e.g., PDFShift, Browserless). Defer until SaaS infrastructure is in place.

---

### 4. Dashboard — Live ✓

**Implemented:**
- Framework cards grouped by category (Cybersecurity / Financial Compliance / AI Governance)
- Recent ingest activity table (filters out failed jobs)
- Quick actions: Chat, Search, Generate

---

### 5. Artifact Library & Community Sharing — P2 (Not Started)

#### Personal / Org Artifact Library

Users need the ability to save generated artifacts (policies, procedures, checklists, POA&Ms) for future retrieval, editing, and reuse within their organization.

**Requirements:**
- Save a generated artifact to personal library with a user-defined name and optional notes
- Retrieve and view saved artifacts from a "My Documents" or "Library" page
- Version history — track when a document was last edited and by whom
- Tag artifacts by framework, family, and document type for filtering
- Team library — shared artifact store visible to all members of an org workspace (requires team workspaces, P3)

**Dependencies:** Requires User Authentication & Workspaces (P3) to be built first. The `generated_documents` table already exists and captures output — the library feature is primarily a UI + RLS layer on top of existing storage.

#### Community Artifact Library

When a generated artifact has not been customized (i.e., `[Organization Name]` and other placeholders remain unmodified), users can opt in to contribute it to a public community library. This creates a network effect: more users → better community starting points → more users.

**How it works:**
1. **Placeholder detection** — System checks the generated markdown for unreplaced placeholders before offering the share option. Docs with real org names are private-only and never offered for sharing.
2. **Opt-in contribution** — User clicks "Contribute to Community Library" after generation. Contribution is explicit and voluntary.
3. **Community browsing** — Any user (including unauthenticated) can browse community policies organized by framework + family + document type. Community docs serve as high-quality starting points before customization.
4. **Curation** — Community artifacts can be upvoted. Top-rated artifacts surface as featured starting points. Over time this crowdsources higher-quality base templates.
5. **Framework versioning** — Community artifacts tagged by framework version (e.g., SP 800-53 Rev 5) to prevent stale content from surfacing when frameworks update.
6. **Moderation** — Flagging mechanism for inappropriate or low-quality contributions. Admin review queue.

**Revenue tiering model:**
| Tier | Access |
|---|---|
| Anonymous | Browse community library, generate (limited) |
| Registered (free) | Generate unlimited, save to personal library, contribute to community |
| Team (paid) | Shared org library, version history, custom placeholders, export to DOCX/PDF |
| Enterprise | Private deployment, bring-your-own LLM key, SSO |

**Technical notes:**
- Community artifacts stored in a `community_documents` table (separate from `generated_documents`)
- Placeholder detection via regex scan for `\[Organization Name\]`, `\[Effective Date\]`, etc. before contribution is offered
- Framework + family + version metadata required on all community contributions for accurate filtering
- Generated artifacts already saved to `generated_documents` — personal library is an RLS + UI layer on that table

---

### 7. Cross-Framework Control Mapping — P1

Semantic clustering is live (shows "Also in: X, Y" tags). Explicit pre-computed mapping table is backlog.

**Backlog:**
- Explicit control mapping table (CMMC ↔ NIST 800-171 ↔ SP 800-53)
- Confidence scores per mapping
- Mapping visible in search results and document generator

---

### 8. Framework Coverage Enhancement — In Progress

Enhancing all frameworks to "Good" status (40+ docs, full control coverage).

**Priority order:**
1. SOC 2 — HIGH, missing entirely, top-3 user framework
2. FedRAMP High — ~421 controls, all 20 families at High baseline
3. FedRAMP Low — ~125 controls
4. FedRAMP Moderate embeddings — seed data exists, needs ingest function
5. NIST AI 100-1 — 17 → 40-50 docs
6. MITRE ATLAS — 14 → 70-80 docs (one per AML.T technique)
7. DoD AI Ethics — 14 → 30-40 docs
8. International AI frameworks (Singapore, UNESCO, G7, UK, Canada, China, Japan, ISO 23894)

---

### 9. Automated Monthly Refresh — P2 (Not Started)

- Scheduled ingest jobs checking official sources for changes
- Content hash comparison to detect updates
- Admin dashboard for refresh management

---

### 10. User Authentication & Workspaces — Live ✓ (Core), P2 (Billing)

**Implemented (2026-06-30):**
- Supabase Auth — email/password registration, login, forgot password, reset password
- `AuthContext` + `useAuth()` hook — session management via `onAuthStateChange`
- `AuthGuard` component — redirects unauthenticated users to `/login` with return path
- `AppLayout` — authenticated shell with mobile hamburger nav, active link highlighting, sign out
- Route structure: public pages at `/`, authenticated app at `/app/*`
- `profiles` table — display name, upserted on user creation via `handle_new_user()` trigger
- `organizations` + `org_members` tables — multi-tenant org model (billing stubbed)
- `usage_events` table — metering infrastructure
- Social login (Google, Microsoft) — stubs in place, IdP config deferred
- `AccountPage` — display name, password change, plan display (hardcoded free)

**Pricing tiers (decided 2026-06-30):**
| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 10 chat/day, 3 generations/month, no export |
| Pro | $39/mo | Unlimited chat + generation, all exports, document history |
| Team | $149/mo (5 seats) | Pro + shared library, member management |
| Enterprise | Custom | Team + SSO, audit log, custom frameworks, SLA |

**Backlog:**
- Stripe billing integration (deferred — stubbed)
- SSO / bring-your-own-IdP (medium priority, enterprise unlock)
- Chat history persistence (resets on page reload)
- Saved documents / personal artifact library (requires billing tier check)

---

## Technical Architecture

### Frontend
- Vite + React 18 + TypeScript + Tailwind CSS
- React Router, React Hooks
- react-markdown for rendering AI responses and generated documents

### Backend
- Supabase: PostgreSQL + Edge Functions (Deno) + pgvector
- OpenAI text-embedding-3-small for embeddings
- Claude Haiku (claude-haiku-4-5) for chat generation

### Edge Functions
| Function | Purpose |
|---|---|
| `/chat` | RAG Q&A with SSE streaming |
| `/search` | Vector similarity search |
| `/generate-document` | Policy/artifact generator (family filtering, procedure formatting) |
| `/export-document` | MD/DOCX/PDF export |
| `/ingest-*` | Per-framework data ingestion |

### Legal Entity
- DBA: Cybersecurity Compliance Knowledge Hub, LLC
- Governing law: Delaware
- Contact: legal@, privacy@, accessibility@, support@cybercompliancehub.com
- Live legal pages: Terms, Privacy, Disclaimer, Accessibility Statement, Cookie Policy
- ISO content policy: reference-only (no ingesting commercially licensed PDFs); NIST crosswalks are public domain and safe

### DB Constraints (critical — never violate)
- `compliance_frameworks.category` CHECK: only `nist`, `iso`, `fedramp`, `cmmc`, `sox`, `ai-safety`
- `templates.template_type` CHECK: `policy`, `checklist`, `control-map`, `procedure`, `raci`, `poam`, `gap_assessment`
- `sources.scraper_type` NOT NULL: `generic-webpage`, `nist-rmf`, `nist-json`, `webpage`, `json`
- `sources.source_type`: `webpage`, `json` only
- No unique constraint on `abbreviation` — use `WHERE NOT EXISTS` pattern, never `ON CONFLICT (abbreviation)`

### Security
- VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are client-safe (RLS enforced)
- OPENAI_API_KEY and ANTHROPIC_API_KEY are Supabase Edge Function secrets only — NEVER add VITE_ prefix (prior incident)
- `family_metadata_field` validated against ALLOWED_FAMILY_FIELDS allowlist in generate-document function
- .env gitignored
- All app routes behind AuthGuard; public marketing routes at root level
- RLS on all tables; migrations 007 (tightened RLS) and 008 (orgs/profiles/usage) applied

---

## Success Metrics

| Metric | Target | Current |
|---|---|---|
| Framework coverage | 90% of core controls per framework | Varies — see table above |
| Response time (chat) | < 5s initial response | ✓ Streaming within ~1s |
| Response time (search) | < 2s | ✓ |
| Frameworks at "Good" | All | 5/14 live frameworks |
| Template types | Policy + Checklist + Procedure for core frameworks | Policy ✓ all, Checklist ✓ all, Procedure ✓ 6 core |

---

## Open Questions

1. **Rate limiting** — Free vs. premium access tiers?
2. **Offline/air-gapped** — Support for classified environments?
3. **LLM model selection** — Auto-upgrade to Sonnet for complex queries?
4. **International AI frameworks** — Add dedicated "International Regulations" group on dashboard?
5. **CMMC 3.0** — Mandatory date TBD; revisit when announced
6. **SOC 2** — Type 1 vs Type 2 distinction in templates?

---

*Maintained by Carl Scott — CyberComplianceHub*
