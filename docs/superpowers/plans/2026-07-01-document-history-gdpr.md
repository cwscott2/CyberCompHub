# Document History Enhancements + GDPR Download My Data — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add star/soft-delete/filter/preview-modal to Generated Documents history on AccountPage, and a client-side GDPR data export button.

**Architecture:** All changes are in `src/pages/AccountPage.tsx` and one new SQL migration. No new components, no new edge functions. The preview modal fetches `content_markdown` on demand and renders it with `ReactMarkdown` (already in the dependency tree). Downloads reuse the exact same `export-document` edge function pattern from WizardPage. GDPR export is a pure client-side JSON bundle triggered via a temporary `<a>` element.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Supabase JS client, react-markdown + remark-gfm (already installed)

---

## File Map

| File | Action | What changes |
|---|---|---|
| `supabase/migrations/20260701050000_016_document_history_enhancements.sql` | Create | Adds `is_starred` and `deleted_at` to `generated_documents` |
| `src/pages/AccountPage.tsx` | Modify | Everything else — types, state, filter chips, row actions, modal, GDPR export |

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260701050000_016_document_history_enhancements.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- Migration 016: Add is_starred and deleted_at to generated_documents
-- is_starred: user can bookmark documents they want to keep
-- deleted_at: soft delete — excluded from queries, retained for audit trail
-- Safe to re-run: uses IF NOT EXISTS / IF column_name NOT IN pattern

ALTER TABLE generated_documents
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
```

Save to `supabase/migrations/20260701050000_016_document_history_enhancements.sql`.

- [ ] **Step 2: Run the migration in Supabase**

In the Supabase dashboard → SQL Editor, paste and run the file contents.

Expected result: "Success. No rows returned."

- [ ] **Step 3: Verify columns exist**

Run this in the SQL Editor:

```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'generated_documents'
  AND column_name IN ('is_starred', 'deleted_at');
```

Expected: 2 rows returned — `is_starred` as `boolean` defaulting to `false`, `deleted_at` as `timestamp with time zone` nullable.

- [ ] **Step 4: Commit the migration file**

```bash
git add supabase/migrations/20260701050000_016_document_history_enhancements.sql
git commit -m "feat: migration 016 — add is_starred and deleted_at to generated_documents"
```

---

### Task 2: Update Types, Query, and State in AccountPage

**Files:**
- Modify: `src/pages/AccountPage.tsx`

- [ ] **Step 1: Update the `GeneratedDoc` interface**

Replace the existing interface at the top of `AccountPage.tsx`:

```ts
interface GeneratedDoc {
  id: string;
  title: string;
  created_at: string;
  is_starred: boolean;
  framework: { name: string; abbreviation: string } | null;
  template: { name: string; template_type: string } | null;
}
```

- [ ] **Step 2: Add new state variables**

Inside the `AccountPage` function, after the existing state declarations, add:

```ts
const [activeFrameworkFilter, setActiveFrameworkFilter] = useState<string | null>(null);
const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
const [showStarredOnly, setShowStarredOnly] = useState(false);
const [selectedDoc, setSelectedDoc] = useState<GeneratedDoc | null>(null);
const [modalContent, setModalContent] = useState<string | null>(null);
const [modalLoading, setModalLoading] = useState(false);
const [exportingDocId, setExportingDocId] = useState<string | null>(null);
const [exportingDataGdpr, setExportingDataGdpr] = useState(false);
const [gdprError, setGdprError] = useState<string | null>(null);
```

- [ ] **Step 3: Update the data-fetching query**

Replace the existing `loadDocs` function inside the `useEffect`:

```ts
async function loadDocs() {
  const { data } = await supabase
    .from('generated_documents')
    .select('id, title, created_at, is_starred, framework:compliance_frameworks(name, abbreviation), template:templates(name, template_type)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50);
  setGeneratedDocs((data as unknown as GeneratedDoc[]) ?? []);
  setDocsLoading(false);
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds with no type errors. Fix any that appear before continuing.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AccountPage.tsx
git commit -m "feat: update GeneratedDoc type and query to include is_starred, template_type, soft-delete filter"
```

---

### Task 3: Star Toggle and Soft Delete Handlers

**Files:**
- Modify: `src/pages/AccountPage.tsx`

- [ ] **Step 1: Add `handleToggleStar`**

Add this function inside `AccountPage`, after the `handleChangePassword` function:

```ts
const handleToggleStar = async (doc: GeneratedDoc) => {
  const newValue = !doc.is_starred;
  setGeneratedDocs(prev =>
    prev.map(d => d.id === doc.id ? { ...d, is_starred: newValue } : d)
  );
  await supabase
    .from('generated_documents')
    .update({ is_starred: newValue })
    .eq('id', doc.id);
  if (selectedDoc?.id === doc.id) {
    setSelectedDoc(prev => prev ? { ...prev, is_starred: newValue } : null);
  }
};
```

- [ ] **Step 2: Add `handleSoftDelete`**

```ts
const handleSoftDelete = async (docId: string) => {
  setGeneratedDocs(prev => prev.filter(d => d.id !== docId));
  if (selectedDoc?.id === docId) setSelectedDoc(null);
  await supabase
    .from('generated_documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', docId);
};
```

- [ ] **Step 3: Add `handleOpenModal`**

```ts
const handleOpenModal = async (doc: GeneratedDoc) => {
  setSelectedDoc(doc);
  setModalContent(null);
  setModalLoading(true);
  const { data } = await supabase
    .from('generated_documents')
    .select('content_markdown')
    .eq('id', doc.id)
    .single();
  setModalContent((data as { content_markdown: string } | null)?.content_markdown ?? '');
  setModalLoading(false);
};
```

- [ ] **Step 4: Add `handleExportFromHistory`**

```ts
const handleExportFromHistory = async (docId: string, format: 'markdown' | 'docx' | 'xlsx') => {
  setExportingDocId(`${docId}-${format}`);
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
    const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const response = await fetch(`${SUPABASE_URL}/functions/v1/export-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ document_id: docId, format }),
    });
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = format === 'xlsx' ? 'xlsx' : format === 'docx' ? 'docx' : 'md';
    a.download = `compliance-document-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    // silent — user can retry
  } finally {
    setExportingDocId(null);
  }
};
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AccountPage.tsx
git commit -m "feat: add star toggle, soft delete, modal open, and export handlers to AccountPage"
```

---

### Task 4: Filter Chip Logic

**Files:**
- Modify: `src/pages/AccountPage.tsx`

- [ ] **Step 1: Add derived filter values and filtered list**

Add these computed values inside `AccountPage`, just before the `return` statement:

```ts
const distinctFrameworks = Array.from(
  new Set(generatedDocs.map(d => d.framework?.abbreviation).filter(Boolean))
) as string[];

const distinctTypes = Array.from(
  new Set(generatedDocs.map(d => d.template?.template_type).filter(Boolean))
) as string[];

const TYPE_LABELS: Record<string, string> = {
  policy: 'Policy',
  checklist: 'Checklist',
  procedure: 'Procedure',
  poam: 'POA&M',
  gap_assessment: 'Gap Assessment',
};

const filteredDocs = generatedDocs.filter(doc => {
  if (showStarredOnly && !doc.is_starred) return false;
  if (activeFrameworkFilter && doc.framework?.abbreviation !== activeFrameworkFilter) return false;
  if (activeTypeFilter && doc.template?.template_type !== activeTypeFilter) return false;
  return true;
});
```

- [ ] **Step 2: Add the filter chip JSX**

Inside the Generated Documents `<section>`, replace the existing empty state / list wrapper with this block (keep the `docsLoading` check before it):

```tsx
{/* Filter chips — Row 1: All / Starred / Frameworks */}
{generatedDocs.length > 0 && (
  <div className="mb-4 space-y-2">
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => { setActiveFrameworkFilter(null); setActiveTypeFilter(null); setShowStarredOnly(false); }}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          !activeFrameworkFilter && !activeTypeFilter && !showStarredOnly
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-secondary-600 border-secondary-300 hover:border-primary-400'
        }`}
      >
        All
      </button>
      <button
        onClick={() => setShowStarredOnly(v => !v)}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          showStarredOnly
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-secondary-600 border-secondary-300 hover:border-primary-400'
        }`}
      >
        ★ Starred
      </button>
      {distinctFrameworks.map(fw => (
        <button
          key={fw}
          onClick={() => setActiveFrameworkFilter(v => v === fw ? null : fw)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            activeFrameworkFilter === fw
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-secondary-600 border-secondary-300 hover:border-primary-400'
          }`}
        >
          {fw}
        </button>
      ))}
    </div>
    {/* Row 2: Type chips — only shown if >1 distinct type */}
    {distinctTypes.length > 1 && (
      <div className="flex flex-wrap gap-2">
        {distinctTypes.map(type => (
          <button
            key={type}
            onClick={() => setActiveTypeFilter(v => v === type ? null : type)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeTypeFilter === type
                ? 'bg-secondary-700 text-white border-secondary-700'
                : 'bg-white text-secondary-600 border-secondary-300 hover:border-secondary-400'
            }`}
          >
            {TYPE_LABELS[type] ?? type}
          </button>
        ))}
      </div>
    )}
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AccountPage.tsx
git commit -m "feat: add filter chips (All/Starred/Framework/Type) to document history"
```

---

### Task 5: Document List Rows

**Files:**
- Modify: `src/pages/AccountPage.tsx`

- [ ] **Step 1: Replace the document list JSX**

Replace the existing `<div className="divide-y divide-secondary-100">` block (the `generatedDocs.map(...)` section) with:

```tsx
{filteredDocs.length === 0 && generatedDocs.length > 0 ? (
  <p className="text-sm text-secondary-500 py-2">No documents match the active filters.</p>
) : filteredDocs.length === 0 ? (
  <p className="text-sm text-secondary-500">
    No documents generated yet.{' '}
    <a href="/app/wizard" className="text-primary-600 hover:underline">Generate your first document →</a>
  </p>
) : (
  <div className="divide-y divide-secondary-100">
    {filteredDocs.map(doc => (
      <div key={doc.id} className="py-3 flex items-center gap-3">
        {/* Star */}
        <button
          onClick={() => handleToggleStar(doc)}
          className="text-lg leading-none shrink-0 text-secondary-400 hover:text-yellow-400 transition-colors"
          aria-label={doc.is_starred ? 'Unstar document' : 'Star document'}
        >
          {doc.is_starred ? '★' : '☆'}
        </button>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-secondary-900 truncate">{doc.title}</p>
          <p className="text-xs text-secondary-500 mt-0.5">
            {doc.framework?.abbreviation ?? '—'} ·{' '}
            {TYPE_LABELS[doc.template?.template_type ?? ''] ?? doc.template?.name ?? '—'} ·{' '}
            {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* View */}
        <button
          onClick={() => handleOpenModal(doc)}
          className="text-xs text-primary-600 hover:underline shrink-0"
        >
          View
        </button>

        {/* Dismiss */}
        <button
          onClick={() => handleSoftDelete(doc.id)}
          className="text-secondary-300 hover:text-red-400 transition-colors shrink-0 text-sm"
          aria-label="Remove from history"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AccountPage.tsx
git commit -m "feat: update document history rows with star, view, and soft-delete actions"
```

---

### Task 6: Preview Modal (Slide-Over)

**Files:**
- Modify: `src/pages/AccountPage.tsx`

- [ ] **Step 1: Add the ReactMarkdown import**

At the top of `AccountPage.tsx`, add these imports after the existing imports:

```ts
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
```

- [ ] **Step 2: Add the modal JSX**

Add this block immediately before the closing `</div>` of the page wrapper (the outermost `<div className="max-w-2xl...">`):

```tsx
{/* Document Preview Modal (slide-over) */}
{selectedDoc && (
  <div className="fixed inset-0 z-50 flex">
    {/* Backdrop */}
    <div
      className="flex-1 bg-black/40"
      onClick={() => setSelectedDoc(null)}
    />

    {/* Panel */}
    <div className="w-full max-w-2xl bg-white shadow-xl flex flex-col h-full">

      {/* Header */}
      <div className="flex items-start gap-3 px-6 py-4 border-b border-secondary-200 shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-secondary-900 truncate">{selectedDoc.title}</p>
          {selectedDoc.framework?.abbreviation && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
              {selectedDoc.framework.abbreviation}
            </span>
          )}
        </div>
        <button
          onClick={() => handleToggleStar(selectedDoc)}
          className="text-xl text-secondary-400 hover:text-yellow-400 transition-colors shrink-0"
          aria-label={selectedDoc.is_starred ? 'Unstar' : 'Star'}
        >
          {selectedDoc.is_starred ? '★' : '☆'}
        </button>
        <button
          onClick={() => setSelectedDoc(null)}
          className="text-secondary-400 hover:text-secondary-700 transition-colors shrink-0 text-lg"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {modalLoading ? (
          <p className="text-sm text-secondary-400">Loading…</p>
        ) : modalContent ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{modalContent}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-secondary-400">No content available.</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-secondary-200 px-6 py-4 shrink-0 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-secondary-500 font-medium">Download as:</span>
          {(['markdown', 'docx', 'xlsx'] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => handleExportFromHistory(selectedDoc.id, fmt)}
              disabled={exportingDocId === `${selectedDoc.id}-${fmt}`}
              className="px-3 py-1 text-xs border border-secondary-300 rounded hover:bg-secondary-50 disabled:opacity-50 transition-colors"
            >
              {exportingDocId === `${selectedDoc.id}-${fmt}` ? 'Downloading…' : fmt === 'markdown' ? 'Markdown' : fmt === 'docx' ? 'Word' : 'Excel'}
            </button>
          ))}
        </div>
        <button
          onClick={async () => {
            if (confirm('Remove this document from your history?')) {
              await handleSoftDelete(selectedDoc.id);
              setSelectedDoc(null);
            }
          }}
          className="text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          Remove from history
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Start the dev server and test the modal manually**

```bash
npm run dev
```

Open `http://localhost:5173/app/account` in the browser (sign in first).

Verify:
- Clicking "View" on any document opens the slide-over from the right
- The backdrop closes the modal on click
- Content renders as formatted markdown (headers, tables, bullet points)
- Star toggle in modal header updates the star in the list behind it
- Download buttons each trigger a file download in the correct format
- "Remove from history" confirms and removes the document

- [ ] **Step 5: Commit**

```bash
git add src/pages/AccountPage.tsx
git commit -m "feat: add document preview slide-over modal with download and remove actions"
```

---

### Task 7: GDPR Download My Data

**Files:**
- Modify: `src/pages/AccountPage.tsx`

- [ ] **Step 1: Add the GDPR export handler**

Add this function inside `AccountPage`, after `handleExportFromHistory`:

```ts
const handleDownloadMyData = async () => {
  setExportingDataGdpr(true);
  setGdprError(null);
  try {
    const [profileRes, docsRes, membershipsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name, updated_at, created_at')
        .eq('id', user!.id)
        .single(),
      supabase
        .from('generated_documents')
        .select('id, title, created_at, is_starred, deleted_at, content_markdown, metadata')
        .order('created_at', { ascending: false }),
      supabase
        .from('org_members')
        .select('role, created_at, organization:organizations(name, slug, plan)')
        .eq('user_id', user!.id),
    ]);

    const exportPayload = {
      export_date: new Date().toISOString(),
      profile: {
        email: user!.email,
        ...(profileRes.data ?? {}),
      },
      generated_documents: docsRes.data ?? [],
      organization_memberships: membershipsRes.data ?? [],
    };

    const json = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybercompliancehub-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    setGdprError('Export failed. Please try again or contact support@cybercompliancehub.com.');
  } finally {
    setExportingDataGdpr(false);
  }
};
```

- [ ] **Step 2: Add the "Your Data" section to the JSX**

Add this section between the Generated Documents section and the Danger Zone section:

```tsx
{/* Your Data (GDPR) */}
<section className="card mb-6">
  <h3 className="text-base font-semibold text-secondary-900 mb-2">Your Data</h3>
  <p className="text-sm text-secondary-600 mb-4">
    Download a copy of all data associated with your account, including your profile,
    generated documents, and organization membership.
  </p>
  <button
    type="button"
    onClick={handleDownloadMyData}
    disabled={exportingDataGdpr}
    className="btn-primary text-sm disabled:opacity-50"
  >
    {exportingDataGdpr ? 'Preparing export…' : 'Download my data'}
  </button>
  {gdprError && (
    <p className="mt-3 text-sm text-red-600">{gdprError}</p>
  )}
</section>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Test the GDPR export manually**

With the dev server running (`npm run dev`), go to `http://localhost:5173/app/account`.

Click "Download my data" and verify:
- Button shows "Preparing export…" while fetching
- A `.json` file downloads named `cybercompliancehub-data-export-YYYY-MM-DD.json`
- Open the file and confirm it contains `export_date`, `profile`, `generated_documents`, and `organization_memberships` keys
- `generated_documents` includes soft-deleted entries (those with a `deleted_at` value)
- `profile.email` matches the logged-in user's email

- [ ] **Step 5: Commit**

```bash
git add src/pages/AccountPage.tsx
git commit -m "feat: GDPR Download My Data — client-side JSON export of profile, documents, and org membership"
```

---

### Task 8: Final Build Check and Deploy

- [ ] **Step 1: Run a clean production build**

```bash
npm run build
```

Expected: build succeeds, no TypeScript errors, no lint errors.

- [ ] **Step 2: Do a full manual smoke test**

With `npm run dev` running, verify all success criteria:

1. Star a document → reload the page → star persists
2. Soft-delete a document → it disappears from the list → reload → still gone
3. Activate a framework filter chip → list narrows correctly → activate a type chip too → narrows further → click "All" → resets
4. Click "View" → modal opens → markdown renders → all 3 download buttons produce files → "Remove from history" removes it and closes modal
5. Click "Download my data" → JSON file downloads → inspect it has all 4 expected keys

- [ ] **Step 3: Push to main and verify Vercel deployment**

```bash
git push origin main
```

Wait for Vercel auto-deploy to complete (check the Vercel dashboard). Open `https://cyber-compliance-hub.vercel.app/app/account` and repeat the smoke test on production.

---

## Self-Review Notes

- `TYPE_LABELS` is defined in Task 4 (computed values) and referenced in Task 5 (list rows) — consistent ✓
- `handleToggleStar`, `handleSoftDelete`, `handleOpenModal`, `handleExportFromHistory` all defined in Task 3 before use in Tasks 5 and 6 ✓
- `filteredDocs` defined in Task 4 and used in Task 5 ✓
- `selectedDoc`, `modalContent`, `modalLoading`, `exportingDocId`, `exportingDataGdpr`, `gdprError` all declared in Task 2 ✓
- `ReactMarkdown` and `remarkGfm` imports added in Task 6 before the JSX that uses them ✓
- Soft-deleted docs excluded from the main list query (`.is('deleted_at', null)`) but included in GDPR export (no filter) ✓
- GDPR export includes `user!.email` from AuthContext `user` object which is already in scope ✓
