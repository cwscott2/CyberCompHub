# Procedure Templates + Wizard Family Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add procedure templates for 6 frameworks and a family picker to the document generation wizard so compliance officers can generate family-scoped procedure documents.

**Architecture:** Three sequential changes — (1) SQL inserts that add procedure templates to the DB, (2) edge function update that adds family filtering and procedural output formatting, (3) wizard UI update that adds a family dropdown to the Scope step for procedure/gap_assessment template types.

**Tech Stack:** PostgreSQL (Supabase), Deno/TypeScript (Edge Functions), React 18 + TypeScript (Vite), Tailwind CSS

---

## Files

| Action | File | What changes |
|---|---|---|
| Create | `add_procedure_templates.sql` | Inserts procedure templates for 6 frameworks |
| Modify | `supabase/functions/generate-document/index.ts` | Adds `selected_family`, `family_metadata_field` request fields, family filtering, procedure output format |
| Modify | `src/pages/WizardPage.tsx` | Adds `selectedFamily`, `availableFamilies` state; family picker UI on Scope step; passes family to generate call |

---

### Task 1: Create procedure templates SQL file

**Files:**
- Create: `add_procedure_templates.sql`

- [ ] **Step 1: Create the SQL file**

Create `/Users/carlscott/Desktop/CodingProjects/CyberCompHub/add_procedure_templates.sql` with the following content:

```sql
-- Add procedure templates for 6 frameworks
-- Section keys: header, introduction, controls
-- Safe to re-run (WHERE NOT EXISTS guard on each insert)

-- ============================================================
-- CMMC — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'CMMC'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'CMMC Security Procedures', 'procedure',
              'Step-by-step security procedures aligned to CMMC Level 2 domains', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- FedRAMP Moderate — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE name = 'FedRAMP Moderate'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'FedRAMP Moderate Security Procedures', 'procedure',
              'Step-by-step security procedures for FedRAMP Moderate authorization controls', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- SP 800-53 — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'SP 800-53'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'SP 800-53 Security Procedures', 'procedure',
              'Step-by-step security procedures for SP 800-53 Rev 5 control families', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- NIST CSF — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST CSF'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'NIST CSF Security Procedures', 'procedure',
              'Step-by-step security procedures organized by CSF function', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- ISO 27001 — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'ISO 27001'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'ISO 27001 Security Procedures', 'procedure',
              'Step-by-step security procedures organized by ISO 27001 annex', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);

-- ============================================================
-- NIST RMF — Procedure template
-- ============================================================
WITH fw AS (SELECT id FROM compliance_frameworks WHERE abbreviation = 'NIST RMF'),
     ins AS (
       INSERT INTO templates (framework_id, name, template_type, description, is_default)
       SELECT fw.id, 'NIST RMF Security Procedures', 'procedure',
              'Step-by-step security procedures organized by RMF step', false
       FROM fw
       WHERE NOT EXISTS (
         SELECT 1 FROM templates t WHERE t.framework_id = fw.id AND t.template_type = 'procedure'
       )
       RETURNING id
     )
INSERT INTO template_sections (template_id, section_key, display_name, section_order, is_required)
SELECT ins.id, s.section_key, s.display_name, s.section_order, true
FROM ins, (VALUES
  ('header',       'Document Header',   1),
  ('introduction', 'Purpose and Scope', 2),
  ('controls',     'Procedures',        3)
) AS s(section_key, display_name, section_order);
```

- [ ] **Step 2: Run the SQL in Supabase SQL editor**

Paste the full file contents into the Supabase SQL editor and run. Expected: 6 statements succeed, no errors.

- [ ] **Step 3: Verify in Supabase**

Run this verification query in the SQL editor:

```sql
SELECT cf.name, t.name, t.template_type
FROM templates t
JOIN compliance_frameworks cf ON cf.id = t.framework_id
WHERE t.template_type = 'procedure'
ORDER BY cf.name;
```

Expected: 6 rows, one per framework.

- [ ] **Step 4: Commit**

```bash
git add add_procedure_templates.sql
git commit -m "feat: add procedure templates SQL for 6 frameworks"
```

---

### Task 2: Update generate-document edge function

**Files:**
- Modify: `supabase/functions/generate-document/index.ts`

- [ ] **Step 1: Update the GenerateRequest interface**

In `supabase/functions/generate-document/index.ts`, find:

```ts
interface GenerateRequest {
  framework_id: string;
  template_id: string;
  custom_scope?: string;
  selected_controls?: string[];
}
```

Replace with:

```ts
interface GenerateRequest {
  framework_id: string;
  template_id: string;
  custom_scope?: string;
  selected_controls?: string[];
  selected_family?: string;
  family_metadata_field?: string;
}
```

- [ ] **Step 2: Destructure the new fields**

Find:

```ts
const { framework_id, template_id, custom_scope, selected_controls }: GenerateRequest = await req.json();
```

Replace with:

```ts
const { framework_id, template_id, custom_scope, selected_controls, selected_family, family_metadata_field }: GenerateRequest = await req.json();
```

- [ ] **Step 3: Add family filtering to the document query**

Find:

```ts
    if (selected_controls && selected_controls.length > 0) {
      docQuery = docQuery.in('metadata->>practice_id', selected_controls);
    }
```

Replace with:

```ts
    if (selected_family && family_metadata_field) {
      docQuery = docQuery.eq(`metadata->>${family_metadata_field}`, selected_family);
    } else if (selected_controls && selected_controls.length > 0) {
      docQuery = docQuery.in('metadata->>practice_id', selected_controls);
    }
```

- [ ] **Step 4: Add procedure output formatting**

Find the `controls` section handler:

```ts
      } else if (section.section_key === 'controls' && documents) {
        sectionContent = `## Controls and Requirements\n\n`;
        for (const doc of documents) {
          if (doc.document_type === 'control' || doc.document_type === 'requirement') {
            if (doc.raw_content) {
              sectionContent += `${doc.raw_content}\n\n---\n\n`;
            }
          }
        }
```

Replace with:

```ts
      } else if (section.section_key === 'controls' && documents) {
        const isProcedure = template.template_type === 'procedure';
        sectionContent = isProcedure ? `## Procedures\n\n` : `## Controls and Requirements\n\n`;
        for (const doc of documents) {
          if (doc.document_type === 'control' || doc.document_type === 'requirement') {
            if (isProcedure) {
              const controlId = doc.metadata?.control_id || doc.metadata?.practice_id || '';
              sectionContent += `### ${controlId}${controlId ? ' — ' : ''}${doc.title}\n\n`;
              sectionContent += `**Step 1 — Understand the Requirement**\n`;
              sectionContent += `${doc.raw_content || doc.title}\n\n`;
              sectionContent += `**Step 2 — Assign Responsibility**\n`;
              sectionContent += `Responsible Party: TBD\n\n`;
              sectionContent += `**Step 3 — Implement**\n`;
              sectionContent += `Document implementation steps specific to your environment.\n\n`;
              sectionContent += `**Step 4 — Verify**\n`;
              sectionContent += `Verification method: TBD\n\n`;
              sectionContent += `---\n\n`;
            } else if (doc.raw_content) {
              sectionContent += `${doc.raw_content}\n\n---\n\n`;
            }
          }
        }
```

- [ ] **Step 5: Update the saved document title to include family name**

Find:

```ts
      title: `${template.name} - ${new Date().toLocaleDateString()}`,
```

Replace with:

```ts
      title: selected_family && template.template_type === 'procedure'
        ? `${framework?.name} ${selected_family} Procedures - ${new Date().toLocaleDateString()}`
        : `${template.name} - ${new Date().toLocaleDateString()}`,
```

- [ ] **Step 6: Deploy the updated function**

```bash
npx supabase functions deploy generate-document
```

Expected output: `Deployed Functions on project ...: generate-document`

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/generate-document/index.ts
git commit -m "feat: add family filtering and procedure output format to generate-document"
```

---

### Task 3: Add family picker to WizardPage

**Files:**
- Modify: `src/pages/WizardPage.tsx`

- [ ] **Step 1: Add new state variables**

In `WizardPage.tsx`, find the existing state declarations block (lines ~9-20). Add after `const [availableControls, setAvailableControls] = useState<string[]>([]);`:

```ts
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [availableFamilies, setAvailableFamilies] = useState<string[]>([]);
```

- [ ] **Step 2: Add the family metadata field map and helper constants**

Add these constants just above the `useEffect` hooks, after the state declarations:

```ts
  const FAMILY_FIELD_MAP: Record<string, string> = {
    'CMMC': 'domain_name',
    'SP 800-53': 'family_name',
    'NIST CSF': 'function_name',
    'ISO 27001': 'annex_name',
    'NIST RMF': 'category',
  };

  const FAMILY_SCOPED_TYPES = ['procedure', 'gap_assessment'];

  const selectedTemplateObj = templates.find(t => t.id === selectedTemplate);
  const isFamilyScoped = selectedTemplateObj
    ? FAMILY_SCOPED_TYPES.includes(selectedTemplateObj.template_type)
    : false;

  const selectedFrameworkObj = frameworks.find(f => f.id === selectedFramework);
  const familyField = selectedFrameworkObj
    ? (FAMILY_FIELD_MAP[selectedFrameworkObj.abbreviation] ||
       (selectedFrameworkObj.name === 'FedRAMP Moderate' ? 'family_name' : ''))
    : '';
```

- [ ] **Step 3: Add family list fetch effect**

Add a new `useEffect` after the existing `useEffect` that fetches templates and controls:

```ts
  useEffect(() => {
    if (selectedFramework && isFamilyScoped && familyField) {
      setSelectedFamily('');
      supabase
        .from('documents')
        .select('metadata')
        .eq('framework_id', selectedFramework)
        .eq('document_type', 'control')
        .then(({ data }) => {
          if (data) {
            const families = data
              .map((d) => d.metadata?.[familyField] as string)
              .filter(Boolean);
            setAvailableFamilies([...new Set(families)].sort());
          }
        });
    } else {
      setAvailableFamilies([]);
      setSelectedFamily('');
    }
  }, [selectedFramework, selectedTemplate, isFamilyScoped, familyField]);
```

- [ ] **Step 4: Add family picker UI to the Scope step**

In the Scope step JSX (the `{step === 'scope' && (` block), find:

```tsx
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Custom Scope (Optional)
              </label>
```

Replace with:

```tsx
          <div className="space-y-6">
            {isFamilyScoped && availableFamilies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Control Family <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-secondary-600 mb-2">
                  Select the control family to generate procedures for.
                </p>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="input"
                >
                  <option value="">— Select a family —</option>
                  {availableFamilies.map((family) => (
                    <option key={family} value={family}>{family}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Custom Scope (Optional)
              </label>
```

- [ ] **Step 5: Disable Generate button when family required but not selected**

Find the Generate button in the Scope step:

```tsx
            <button onClick={handleGenerate} className="btn-primary">
              Generate Document
            </button>
```

Replace with:

```tsx
            <button
              onClick={handleGenerate}
              disabled={isFamilyScoped && !selectedFamily}
              className="btn-primary disabled:opacity-50"
            >
              Generate Document
            </button>
```

- [ ] **Step 6: Pass family fields to the generate call**

In `handleGenerate`, find:

```ts
          body: JSON.stringify({
            framework_id: selectedFramework,
            template_id: selectedTemplate,
            custom_scope: customScope || null,
            selected_controls: selectedControls.length > 0 ? selectedControls : null,
          }),
```

Replace with:

```ts
          body: JSON.stringify({
            framework_id: selectedFramework,
            template_id: selectedTemplate,
            custom_scope: customScope || null,
            selected_controls: selectedControls.length > 0 ? selectedControls : null,
            selected_family: selectedFamily || null,
            family_metadata_field: (selectedFamily && familyField) ? familyField : null,
          }),
```

- [ ] **Step 7: Show selected family in the export step context banner**

In the export step context reminder banner, find:

```tsx
            {customScope && (
              <div>
                <span className="text-primary-500 font-medium">Scope: </span>
                <span className="text-primary-900">{customScope}</span>
              </div>
            )}
```

Replace with:

```tsx
            {selectedFamily && (
              <div>
                <span className="text-primary-500 font-medium">Family: </span>
                <span className="text-primary-900">{selectedFamily}</span>
              </div>
            )}
            {customScope && (
              <div>
                <span className="text-primary-500 font-medium">Scope: </span>
                <span className="text-primary-900">{customScope}</span>
              </div>
            )}
```

- [ ] **Step 8: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Smoke test manually**

1. Run the dev server: `npm run dev`
2. Navigate to the Policy Generator wizard
3. Select CMMC → select "CMMC Security Procedures" (procedure type)
4. Confirm the Scope step shows a "Control Family" dropdown with CMMC domains listed
5. Select "Access Control" → confirm Generate button becomes enabled
6. Generate → confirm the document title includes "CMMC Access Control Procedures"
7. Confirm the generated content shows Step 1/2/3/4 formatting per control
8. Repeat with a policy template → confirm no family picker appears

- [ ] **Step 10: Commit**

```bash
git add src/pages/WizardPage.tsx
git commit -m "feat: add family picker to wizard for procedure and gap_assessment templates"
```
