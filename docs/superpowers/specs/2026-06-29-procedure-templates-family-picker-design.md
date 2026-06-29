# Design: Procedure Templates + Wizard Family Picker

**Date:** 2026-06-29
**Status:** Approved
**Scope:** SQL template inserts, edge function update, wizard UI update

---

## What We're Building

Procedure templates for 6 compliance frameworks, plus a family picker in the document generation wizard. Compliance officers always generate procedure documents scoped to a single security control family (e.g., "Access Control") — this feature makes that the default flow.

---

## In Scope

- `add_procedure_templates.sql` — procedure templates for CMMC, FedRAMP Moderate, SP 800-53, NIST CSF, ISO 27001, NIST RMF
- `supabase/functions/generate-document/index.ts` — procedure-specific output formatting + family filtering
- `src/pages/WizardPage.tsx` — family picker on Scope step for procedure and gap_assessment templates

## Out of Scope (Deferred)

- Procedure templates for AI frameworks (EU AI Act, NIST AI RMF, ISO 42001, NIST AI 100-1, MITRE ATLAS, DoD AI Ethics, OECD AI Principles) — thin data makes these low value now
- Gap assessment templates (separate spec)
- SOC 2 framework — **not yet ingested; high-priority backlog item** (see Backlog section)

---

## Section 1 — SQL: Procedure Templates

**File:** `add_procedure_templates.sql`

One procedure template per framework, 3 sections each: `header`, `introduction`, `controls`.

| Framework | Abbreviation used for lookup | Family metadata field |
|---|---|---|
| CMMC | `CMMC` | `domain_name` |
| FedRAMP Moderate | name = `FedRAMP Moderate` | `family_name` |
| SP 800-53 | `SP 800-53` | `family_name` |
| NIST CSF | `NIST CSF` | `function_name` |
| ISO 27001 | `ISO 27001` | `annex_name` |
| NIST RMF | `NIST RMF` | `category` (values: Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor) |

Each INSERT uses `WHERE NOT EXISTS` guard to be safe to re-run. The `template_type` value is `'procedure'` (already in the CHECK constraint after the ALTER we ran for POA&M).

---

## Section 2 — Edge Function: Procedure Output + Family Filtering

**File:** `supabase/functions/generate-document/index.ts`

### New request fields

```ts
interface GenerateRequest {
  framework_id: string;
  template_id: string;
  custom_scope?: string;
  selected_controls?: string[];
  selected_family?: string;        // NEW — e.g. "Access Control"
  family_metadata_field?: string;  // NEW — e.g. "domain_name"
}
```

### Family filtering

When `selected_family` and `family_metadata_field` are present, the document query adds:
```ts
docQuery = docQuery.eq(`metadata->>${family_metadata_field}`, selected_family);
```

### Procedure output formatting

When `template.template_type === 'procedure'` and section_key is `controls`, each control is formatted as:

```
### [Control ID] — [Control Title]

**Step 1 — Understand the Requirement**
[control raw_content]

**Step 2 — Assign Responsibility**
Responsible Party: TBD

**Step 3 — Implement**
Document implementation steps specific to your environment.

**Step 4 — Verify**
Verification method: TBD

---
```

### Document title

When `selected_family` is present, the saved document title becomes:
`"${framework.name} ${selected_family} Procedures"` (for procedure type)
or `"${framework.name} ${selected_family} — ${template.name}"` (for other types with family).

---

## Section 3 — Wizard: Family Picker on Scope Step

**File:** `src/pages/WizardPage.tsx`

### No new Step values

The existing 5 steps (`framework | template | scope | generate | export`) are unchanged.

### New state

```ts
const [selectedFamily, setSelectedFamily] = useState<string>('');
const [availableFamilies, setAvailableFamilies] = useState<string[]>([]);
```

### Family metadata field map

A static map in the component resolves framework ID → metadata field name. The framework ID is matched by looking up the selected framework's `abbreviation` field.

```ts
const FAMILY_FIELD_MAP: Record<string, string> = {
  'CMMC':         'domain_name',
  'SP 800-53':    'family_name',
  'FedRAMP Moderate': 'family_name',  // matched by framework.name
  'NIST CSF':     'function_name',
  'ISO 27001':    'annex_name',
  'NIST RMF':     'category',
};
```

### Which templates show the family picker

```ts
const FAMILY_SCOPED_TYPES = ['procedure', 'gap_assessment'];
```

The selected template's `template_type` is checked. If not in `FAMILY_SCOPED_TYPES`, the family picker is hidden and `selectedFamily` stays empty.

### Family list fetch

Triggered when entering the Scope step with a family-scoped template. Queries:
```ts
supabase
  .from('documents')
  .select('metadata')
  .eq('framework_id', selectedFramework)
  .eq('document_type', 'control')
```
Then extracts unique values of `metadata[familyField]`, filters out nulls, sorts alphabetically.

### Scope step UI change

For family-scoped templates, the Scope card renders a required family dropdown **above** the existing custom scope textarea and controls list. The controls list is re-fetched filtered to the selected family when `selectedFamily` changes. "Generate Document" button is disabled until a family is selected.

For non-family-scoped templates (policy, checklist, poam), the Scope step is unchanged.

### Generate call

`selected_family` and `family_metadata_field` are added to the POST body when present.

---

## Backlog Items (captured here, not in scope)

1. **SOC 2 ingest** — HIGH PRIORITY. AICPA Trust Service Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy). User's top-3 framework alongside CMMC and NIST RMF. Needs: framework row, source, ingest function, templates.
2. **Procedure templates for AI frameworks** — deferred until those frameworks have richer data (EU AI Act, NIST AI RMF, ISO 42001, NIST AI 100-1, MITRE ATLAS, DoD AI Ethics, OECD AI Principles).
3. **Gap assessment templates** — same wizard flow as procedures; separate spec.

---

## Build Order

1. Run `add_procedure_templates.sql` in Supabase SQL editor
2. Update and deploy `generate-document` edge function
3. Update `WizardPage.tsx`
4. Smoke test: generate a CMMC Access Control Procedures document end to end
