# CyberComplianceHub — Product Requirements Document

**Version:** 1.3.0
**Last Updated:** June 29, 2026

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

### Financial Compliance (Live)
| Framework | Documents | Status |
|---|---|---|
| SOX | 56 | Good ✓ |

### AI Governance (Live)
| Framework | Documents | Status |
|---|---|---|
| EU AI Act | 79 | Good ✓ |
| NIST AI RMF | ~60 | Moderate |
| ISO 42001 | 48 | Moderate |
| NIST AI 100-1 | 17 | Thin → Queued |
| MITRE ATLAS | 14 | Thin → Queued |
| DoD AI Ethics | 14 | Thin → Queued |
| OECD AI Principles | 14 | Thin → Queued |

### Queued (Not Yet Built)
- SOC 2 (AICPA Trust Service Criteria) — HIGH PRIORITY, top-3 user framework
- FedRAMP High (~421 controls)
- FedRAMP Low (~125 controls)
- FedRAMP Moderate embeddings
- Singapore Model AI Governance
- UNESCO AI Ethics Recommendation
- G7 Hiroshima AI Process
- UK AI Safety Institute Framework
- Canada AIDA
- China GenAI Regulation
- Japan METI AI Guidelines
- ISO/IEC 23894

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

**Procedure generation behavior:**
- Each control formatted as 4-step scaffold: Understand → Assign Responsibility → Implement → Verify
- Document title includes family name (e.g., "CMMC Access Control Procedures")
- Family filtering via `metadata.domain_name` / `metadata.family_name` etc. per framework
- `family_metadata_field` validated against allowlist before DB query (security)

**POA&M generation behavior:**
- Flat finding register (no family picker)
- Output: markdown table with Finding | Control Reference | Risk Level | Remediation Owner | Due Date | Status

**Export Formats:**
- ✓ Markdown
- DOCX — implemented, untested
- PDF — implemented, untested

---

### 4. Dashboard — Live ✓

**Implemented:**
- Framework cards grouped by category (Cybersecurity / Financial Compliance / AI Governance)
- Recent ingest activity table (filters out failed jobs)
- Quick actions: Chat, Search, Generate

---

### 5. Cross-Framework Control Mapping — P1

Semantic clustering is live (shows "Also in: X, Y" tags). Explicit pre-computed mapping table is backlog.

**Backlog:**
- Explicit control mapping table (CMMC ↔ NIST 800-171 ↔ SP 800-53)
- Confidence scores per mapping
- Mapping visible in search results and document generator

---

### 6. Framework Coverage Enhancement — In Progress

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

### 7. Automated Monthly Refresh — P2 (Not Started)

- Scheduled ingest jobs checking official sources for changes
- Content hash comparison to detect updates
- Admin dashboard for refresh management

---

### 8. User Authentication & Workspaces — P3 (Not Started)

- Supabase Auth for user accounts
- Saved chat history
- Saved generated documents per user
- Team workspaces

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

### DB Constraints (critical — never violate)
- `compliance_frameworks.category` CHECK: only `nist`, `iso`, `fedramp`, `cmmc`, `sox`, `ai-safety`
- `templates.template_type` CHECK: `policy`, `checklist`, `control-map`, `procedure`, `raci`, `poam`, `gap_assessment`
- `sources.scraper_type` NOT NULL: `generic-webpage`, `nist-rmf`, `nist-json`, `webpage`, `json`
- `sources.source_type`: `webpage`, `json` only
- No unique constraint on `abbreviation` — use `WHERE NOT EXISTS` pattern, never `ON CONFLICT (abbreviation)`

### Security
- VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are client-safe (RLS enforced)
- OPENAI_API_KEY and ANTHROPIC_API_KEY are Supabase Edge Function secrets only — never in client bundle
- `family_metadata_field` validated against ALLOWED_FAMILY_FIELDS allowlist in generate-document function
- .env gitignored

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
