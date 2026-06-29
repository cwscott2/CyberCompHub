# CyberComplianceHub — Session Handoff

**Date:** 2026-06-29
**Repo:** https://github.com/cwscott2/CyberCompHub (branch: main, fully up to date)
**Local path:** /Users/carlscott/Desktop/CodingProjects/CyberCompHub
**PRD:** /docs/PRD.md (updated this session)

---

## What Was Just Completed

1. **EU AI Act enhanced ingest** — deployed `ingest-eu-ai-act-enhanced`, 56 new docs, 23 → 79 total. Good status.
2. **29 templates created** — `add_missing_templates.sql` run. All 14 live frameworks now have policy + checklist.
3. **FedRAMP renamed** — `rename_fedramp.sql` run. DB now says "FedRAMP Moderate".
4. **PRD updated** — reflects current state, not the stale Phase 1/2/3 language.
5. **All changes committed and pushed** — last commit: `afb94ae`.

---

## What To Build Next (in this order)

### 1. POA&M Templates + Generator Support
**Files to touch:**
- `add_procedure_poam_gap_templates.sql` — CREATE this file, then run it in Supabase SQL editor
- `supabase/functions/generate-document/index.ts` — add handling for `findings` section_key
- `src/pages/WizardPage.tsx` — POA&M does NOT need family picker; it's a flat finding register

**POA&M template sections:** `header`, `introduction`, `findings`

**findings section output format:**
```
| Finding | Control Reference | Risk Level | Remediation Owner | Due Date | Status |
|---|---|---|---|---|---|
| [AI-generated rows from selected controls] | ... | High/Med/Low | TBD | TBD | Open |
```

**Target frameworks for POA&M:** CMMC, FedRAMP Moderate, SP 800-53

---

### 2. Procedure Templates + Family Picker in Wizard
**This is the bigger change — two parts:**

**Part A — SQL:** Add procedure templates (family-scoped) to all major frameworks.
Template sections: `header`, `introduction`, `controls` (same keys as policy, but content is step-by-step)

**Part B — Wizard family picker step:**
Current wizard flow: Framework → Template → Scope/Controls → Generate → Export
New flow for procedure + gap_assessment: Framework → Template → **Control Family** → Controls → Generate → Export

The family picker step must:
1. Query `documents` table for the selected `framework_id`
2. Extract unique family values using the framework-specific metadata field (see table below)
3. Filter the controls list to only show controls in the selected family

**Family metadata field by framework (CRITICAL — look this up, don't guess):**
| Framework | Metadata Field | Example Value |
|---|---|---|
| SP 800-53 | `metadata.family_name` | "Access Control" |
| SP 800-53 | `metadata.family_id` | "AC" |
| FedRAMP Moderate | `metadata.family_name` + `metadata.control_family` | "Access Control" / "AC" |
| NIST CSF | `metadata.function_name` | "PROTECT" |
| CMMC | `metadata.domain_name` + `metadata.domain_id` | "Access Control" / "AC" |
| ISO 27001 | `metadata.annex_name` | "Organizational Controls" |
| SOX | `metadata.category` | "ITGC", "COSO", "Statutory" |
| EU AI Act | `metadata.category` | "Risk Classification" |
| DoD AI Ethics | `metadata.category` | "AI Ethical Principles" |
| MITRE ATLAS | `metadata.category` | tactic name |
| NIST AI 100-1 | `metadata.category` | "Trustworthy AI Characteristics" |
| OECD AI Principles | `metadata.category` | "Value-Based Principles" |

**Key design decision (user confirmed):** Compliance officers ALWAYS generate by security control family. Family-scoped generation is the default, not an option. Document title must include family name (e.g., "CMMC Access Control Procedures").

---

### 3. Gap Assessment Templates
Same wizard flow as procedures (family picker required).
Section keys: `header`, `introduction`, `gap_table`

**gap_table output format:**
```
| Control | Requirement Summary | Current State | Status | Notes |
|---|---|---|---|---|
| AC.1.001 | ... | ... | Met / Partial / Not Met | |
```

---

## DB Constraints — Do Not Violate

- `compliance_frameworks.category` CHECK: only `nist`, `iso`, `fedramp`, `cmmc`, `sox`, `ai-safety`
- `sources.scraper_type` NOT NULL: valid values: `generic-webpage`, `nist-rmf`, `nist-json`, `webpage`, `json`
- `sources.source_type`: valid values: `webpage`, `json` — NOT `'official'`
- Never use `ON CONFLICT (abbreviation)` — no unique constraint on that column. Use `WHERE NOT EXISTS` pattern instead.
- Dashboard framework grouping is done in UI via `categoryToGroup()` — do NOT change DB categories

---

## Security Rules (Non-Negotiable)

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are safe client-side (RLS enforced)
- `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are Supabase Edge Function secrets ONLY
  - Set via: `supabase secrets set ANTHROPIC_API_KEY=...`
  - Accessed via: `Deno.env.get('ANTHROPIC_API_KEY')`
  - NEVER add `VITE_` prefix to these — user had a prior incident with API key exposure
- `.env` is gitignored

---

## Key Files

| File | Purpose |
|---|---|
| `src/pages/WizardPage.tsx` | Document generator wizard — needs family picker step |
| `src/pages/ChatPage.tsx` | Chat UI — react-markdown, dark user bubble, related framework tags |
| `src/pages/Dashboard.tsx` | Framework cards grouped by category, ingest activity table |
| `src/types/compliance.ts` | Citation interface includes `related_frameworks?: string[]` |
| `supabase/functions/chat/index.ts` | RAG pipeline — named framework detection, per-framework search, cross-framework clustering |
| `supabase/functions/generate-document/index.ts` | Document generation — handles header/introduction/controls/checklist section_keys |
| `docs/PRD.md` | Up-to-date product requirements |

---

## Framework Coverage Backlog (priority order)

1. ~~SOX~~ — Done ✓
2. ~~EU AI Act~~ — Done ✓
3. FedRAMP High — ~421 controls, all 20 families at High baseline
4. FedRAMP Low — ~125 controls
5. NIST AI 100-1 — 17 → 40-50 docs
6. MITRE ATLAS — 14 → 70-80 docs (one per AML.T technique)
7. DoD AI Ethics — 14 → 30-40 docs
8. FedRAMP Moderate embeddings — seed data exists, needs ingest function
9–16. International AI frameworks — Singapore, UNESCO, G7, UK, Canada, China, Japan, ISO 23894

---

## Template Backlog (priority order)

1. **POA&M** — flat finding register; CMMC, FedRAMP Moderate, SP 800-53
2. **Procedure** — family-scoped; all major frameworks; requires wizard family picker step
3. **Gap Assessment** — family-scoped; all frameworks; requires wizard family picker step
4. SSP (System Security Plan) — CMMC, FedRAMP, SP 800-53
5. Risk Register — cross-framework

---

## Longer-Term Backlog

- Export testing — DOCX/PDF edge functions exist but untested
- Chat history persistence — resets on page reload
- User authentication — Supabase Auth, Priority 3
- Monthly automated refresh
- Cross-framework control mapping table
