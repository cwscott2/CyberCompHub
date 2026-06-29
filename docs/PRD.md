# CyberComplianceHub — Product Requirements Document

**Version:** 1.2.0
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
| NIST SP 800-53 Rev 5 | 187 | Good ✓ |
| CMMC Level 2 | 124 | Good ✓ |
| ISO 27001:2022 | 104 | Good ✓ |
| NIST CSF 2.0 | 98 | Good ✓ |
| NIST RMF | 43 | Moderate |
| FedRAMP Moderate | ~existing | Moderate (no embeddings) |

### Financial Compliance (Live)
| Framework | Documents | Status |
|---|---|---|
| SOX | 63 | Good ✓ |

### AI Governance (Live)
| Framework | Documents | Status |
|---|---|---|
| NIST AI RMF | 60 | Moderate |
| ISO 42001 | 48 | Moderate |
| EU AI Act | 23+ | Enhancing → Good |
| NIST AI 100-1 | 17 | Thin → Queued |
| MITRE ATLAS | 14 | Thin → Queued |
| DoD AI Ethics | 14 | Thin → Queued |
| OECD AI Principles | 14 | Thin → Queued |

### Queued (Not Yet Built)
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

### 3. Policy/Artifact Generator — Live (Expanding) ✓

Multi-step wizard: Framework → Template → Scope → Generate → Export.

**Current Templates:**

| Framework | Policy | Checklist | Procedure | SSP | POA&M | Gap Assessment |
|---|---|---|---|---|---|---|
| NIST CSF | ✓ | ✓ | — | — | — | — |
| SP 800-53 | ✓ | ✓ | — | — | — | — |
| FedRAMP | ✓ (SSP) | — | — | — | — | — |
| CMMC | — | ✓ | — | — | — | — |
| ISO 27001 | ✓ | ✓ | — | — | — | — |
| NIST RMF | ✓ | — | — | — | — | — |
| NIST AI RMF | ✓ | — | — | — | — | — |
| ISO 42001 | ✓ | — | — | — | — | — |
| SOX | ✓ | ✓ | — | — | — | — |
| New AI frameworks | — | — | — | — | — | — |

**Template Backlog (Priority Order):**
1. Policy templates for: CMMC, all new AI frameworks
2. Checklist templates for: NIST RMF, NIST AI RMF, ISO 42001, all new AI frameworks
3. Procedure templates for: NIST CSF, SP 800-53, CMMC
4. Gap Assessment template (cross-framework, high value)
5. POA&M template for: CMMC, FedRAMP, SP 800-53
6. SSP template for: CMMC, SP 800-53

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

Enhancing all frameworks to "Good" status (40+ docs, full control coverage). See priority order above in Frameworks table.

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
- Claude Sonnet planned for complex generation tasks

### Edge Functions
| Function | Purpose |
|---|---|
| `/chat` | RAG Q&A with SSE streaming |
| `/search` | Vector similarity search |
| `/generate-document` | Policy/artifact generator |
| `/export-document` | MD/DOCX/PDF export |
| `/ingest-*` | Per-framework data ingestion |

### Security
- VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are client-safe (RLS enforced)
- OPENAI_API_KEY and ANTHROPIC_API_KEY are Supabase Edge Function secrets only — never in client bundle
- .env gitignored

---

## Success Metrics

| Metric | Target | Current |
|---|---|---|
| Framework coverage | 90% of core controls per framework | Varies — see table above |
| Response time (chat) | < 5s initial response | ✓ Streaming within ~1s |
| Response time (search) | < 2s | ✓ |
| Frameworks at "Good" | All | 5/13 live frameworks |
| Template types | Policy + Checklist for all | ~60% coverage |

---

## Open Questions

1. **Rate limiting** — Free vs. premium access tiers?
2. **Offline/air-gapped** — Support for classified environments?
3. **LLM model selection** — Auto-upgrade to Sonnet for complex queries?
4. **International AI frameworks** — Add dedicated "International Regulations" group on dashboard?
5. **CMMC 3.0** — Mandatory date TBD; revisit when announced

---

*Maintained by Carl Scott — CyberComplianceHub*
