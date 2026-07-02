# Design Spec: Document History Enhancements + GDPR Download My Data
**Date:** 2026-07-01
**Status:** Approved — ready for implementation planning

---

## Overview

Two related features that share the same data layer (`generated_documents`):

1. **Document History enhancements** — star/favorite, soft delete, filter chips, and a preview modal with inline downloads on the AccountPage
2. **GDPR Download My Data** — client-side JSON export of all user data (profile, documents, org membership)

---

## 1. Database Migration (016)

**File:** `supabase/migrations/20260701050000_016_document_history_enhancements.sql`

Add two columns to `generated_documents`:

```sql
ALTER TABLE generated_documents
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
```

No RLS changes required — existing user-scoped policies cover both columns.

All application queries must add `AND deleted_at IS NULL` to exclude soft-deleted rows. Rows where `deleted_at IS NOT NULL` are retained for audit purposes. A future purge job (scheduled post-beta) will hard-delete rows where `deleted_at < NOW() - INTERVAL '30 days'`.

---

## 2. AccountPage — Document History Section

**File:** `src/pages/AccountPage.tsx`

### 2a. Data fetching

Extend the existing `generated_documents` query to include `is_starred`, `deleted_at`, and `template_type` from the joined template:

```ts
supabase
  .from('generated_documents')
  .select('id, title, created_at, is_starred, deleted_at, framework:compliance_frameworks(name, abbreviation), template:templates(name, template_type)')
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .limit(50)
```

### 2b. Filter chips

Two conditional rows of pill/chip filters rendered above the document list:

- **Row 1** (always shown): `All · Starred · [one chip per distinct framework abbreviation in the fetched list]`
- **Row 2** (shown only if the fetched list contains >1 distinct template_type): `Policy · Checklist · Procedure · POA&M · Gap Assessment` — only chips for types actually present

Active chip is highlighted (primary color). Framework and Type filters are additive — both can be active simultaneously. "Starred" acts as an overlay on the active framework/type filter. "All" clears all filters.

All filtering is client-side on the fetched list. No additional DB calls on filter change.

### 2c. Document list rows

Each row displays:
- Document title (truncated)
- Framework abbreviation · template type · formatted date
- **Star icon** (☆ unstarred / ★ starred) — clicking toggles `is_starred` via `supabase.from('generated_documents').update({ is_starred })` inline, no modal required
- **"View" button** — opens the preview modal
- **Dismiss button (✕)** — sets `deleted_at = NOW()` via update, removes row from local state immediately (optimistic UI)

### 2d. Preview modal

A slide-over panel from the right side of the screen.

**Header:**
- Document title
- Framework abbreviation badge
- Star toggle button (same behavior as inline star)
- Close (✕) button

**Body:**
- `content_markdown` fetched on modal open via:
  ```ts
  supabase.from('generated_documents').select('content_markdown').eq('id', doc.id).single()
  ```
- Rendered as styled HTML using a lightweight markdown-to-HTML renderer (same approach as the Wizard result panel)
- Scrollable, full height of the slide-over

**Footer:**
- `Download as:` → **Markdown** · **Word** · **Excel** — each calls the existing `export-document` edge function with `{ document_id, format }`
- **"Remove from history"** button — confirms ("Remove this document from your history?"), then sets `deleted_at = NOW()`, closes modal, removes from list

### 2e. State management

All state lives in `AccountPage` component (no new context or hook needed):
- `generatedDocs` — fetched list, filtered locally for display
- `activeFrameworkFilter`, `activeTypeFilter`, `showStarredOnly` — filter state
- `selectedDoc` — the doc opened in the modal (id + title + framework; content_markdown loaded separately on open)
- `modalContent` — the fetched markdown string, null while loading

---

## 3. GDPR Download My Data

**File:** `src/pages/AccountPage.tsx` (new section, same file)

### 3a. UI placement

New section on AccountPage between the Document History section and the Danger Zone (Delete Account).

Section header: "Your Data"
Body text: "Download a copy of all data associated with your account, including your profile, generated documents, and organization membership."
Button: **"Download my data"**

### 3b. Export logic (client-side, no new edge function)

On button click, the handler:

1. Shows a loading state on the button ("Preparing export…")
2. Fetches in parallel from Supabase (all scoped by authenticated user via RLS):
   - `profiles` — `display_name, email, created_at, updated_at`
   - `generated_documents` — `id, title, created_at, is_starred, deleted_at, content_markdown, metadata` (includes soft-deleted — user should see everything)
   - `org_members` joined to `organizations` — `org name, slug, plan, role, created_at`
3. Bundles into a structured JSON object:
   ```json
   {
     "export_date": "2026-07-01T...",
     "profile": { ... },
     "generated_documents": [ ... ],
     "organization_memberships": [ ... ]
   }
   ```
4. Triggers browser download as:
   `cybercompliancehub-data-export-2026-07-01.json`
   via a temporary `<a>` element with a `data:` URL
5. Resets button state on completion or error

### 3c. Error handling

If any fetch fails, show an inline error message below the button: "Export failed. Please try again or contact support@cybercompliancehub.com."

---

## Out of Scope (this iteration)

- ZIP export with individual `.md` files per document — deferred; JSON is sufficient for GDPR Article 20 portability
- Permanent hard-delete purge job — deferred post-beta
- Pagination of document history beyond 50 — deferred; revisit when users report hitting the limit
- "Undo" on soft delete — deferred; 30-day recovery window via support is sufficient for now
- Chat history in the data export — deferred until chat persistence is built

---

## Success Criteria

- User can star a document and it persists across page reloads
- User can soft-delete a document; it disappears from the list immediately and does not reappear on reload
- Filter chips correctly filter the document list client-side; multiple active filters narrow results additively
- Preview modal opens, renders markdown content, and all three download formats work
- "Download my data" produces a valid JSON file containing profile, documents (including soft-deleted), and org membership
- No new edge functions required; no changes to existing edge functions
