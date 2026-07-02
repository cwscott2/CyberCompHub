# Handoff: CyberComplianceHub — Look & Feel Redesign

## Overview
A visual redesign of the authenticated and unauthenticated pages of CyberComplianceHub, a B2B compliance-research platform for cybersecurity and AI-governance teams. The goal is an enterprise-credible, globally-legible look: restrained navy/steel-blue palette, a clear type scale, consistent container widths, cleaner data density, and fixes for two rendering bugs (Chat footer overlap, and a generated document that nested the whole app inside itself).

## About the Design Files
The files in this bundle are **design references created in HTML** (authored as "Design Components" — a streaming HTML prototype format). They show the **intended look and behavior**; they are **not production code to copy directly**. The `.dc.html` files depend on a runtime (`support.js`) that is NOT included and should NOT be reproduced.

Your task: **recreate these designs in the target codebase** — React + Tailwind CSS with the existing custom design system — using its established components and patterns. Treat the HTML purely as a spec for layout, spacing, color, type, and interaction.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final. Recreate pixel-faithfully using the codebase's component library. Exact tokens are in the Design Tokens section.

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| Primary (steel blue) | `#16467D` | Buttons, active nav, links-on-accent, focus borders, key numerals |
| Primary hover | `#10365F` | Button/link hover |
| Link blue | `#2563B8` | Inline text links ("View all", "View", "Edit") |
| Navy (structural) | `#0E1728` | Footer, login brand panel, top 3px nav rule |
| Ink (headings) | `#0F1B2D` | H1/H2, card titles |
| Body | `#334155` | Body text |
| Secondary | `#64748B` | Subtitles, meta |
| Muted | `#94A3B8` | Labels, placeholders, timestamps |
| Border | `#E5E8EE` | Card/table borders |
| Border strong | `#D7DCE4` | Inputs, secondary buttons |
| Divider (light) | `#EEF1F5` / `#F0F2F6` / `#F4F6F9` | Row separators, hairlines |
| Page background | `#F4F6F9` | App canvas |
| Surface | `#FFFFFF` | Cards, tables, nav |
| Accent soft bg | `#EEF4FB` | Active nav pill, chat prompt icon, "Platform Admin" badge |
| Category — Cyber | `#16467D` | Section dot |
| Category — AI Governance | `#6D5BD0` | Section dot / card hover border |
| Category — Financial/Health | `#B7791F` | Section dot / card hover border |

### Semantic (quality / status badges)
| State | Text | Background |
|---|---|---|
| Good / completed | `#146C43` | `#E7F4EC` |
| Partial / warning | `#8A5A00` (icon `#B08419`) | `#FBF1DC` (border `#F0E3C4`) |
| Thin / danger | `#B42318` | `#FDECEA` (border `#F0C2BD`) |
| Success step | `#157347` | — |
| Star (filled) | `#E0A52A` | — |

### Typography
- **UI font:** `IBM Plex Sans` (weights 400/500/600/700).
- **Mono font:** `IBM Plex Mono` (400/500) — used for framework codes/versions, doc/control counts, IDs, timestamps, stat context.
- Page H1: 28px / 700 / letter-spacing -0.4px / color `#0F1B2D`.
- Section label (uppercase eyebrow): 13px / 700 / letter-spacing 0.8px / uppercase / `#334155`.
- Card title: 16px / 600. Body: 13–15px / 400. Meta: 12–13px.
- Login hero: 38px / 700 / -0.6px.
- Generated-doc H2: 26px / 700; section H3: 15px / 700.

### Spacing / radius / shadow
- Container: **max-width 1200px** (Account 1080px; Chat 900px), horizontal padding 28px, top padding 36px.
- Grid gaps: cards 16px, form columns 20–24px.
- Radius: cards/tables 12px (large panels 14–16px), buttons/inputs 8–10px, pills 20px, small tags/badges 4–6px.
- Card hover shadow: `0 4px 14px rgba(15,27,45,0.06)` + border → category color.
- Nav: sticky, 62px tall, white, `border-bottom:1px solid #E5E8EE`, with a 3px `#0E1728` rule above it.

---

## Screens / Views

### 1. Top Nav (shared, all authenticated screens)
- Sticky; 3px navy rule on top; 62px row inside the 1200px container.
- Left: shield logo (26px) + wordmark "CyberComplianceHub" (17px/700, `#0F1B2D`). Clicking → Dashboard.
- Center: nav links — Dashboard, Chat, Search, Generate, Knowledge Base. Idle: 15px/500 `#475569`, padding 8×12, radius 8. **Active: 600 `#16467D` on `#EEF4FB`.**
- Right: "Admin" link (same active treatment when on Admin), 1px divider, user button (28px round `#16467D` avatar "CS" + name; active pill `#EEF4FB` when on Account), "Sign out" (`#64748B` → Login).

### 2. Footer (shared, all screens except Login)
- Navy `#0E1728`. 4 columns inside 1200px: brand + blurb (max 280px), Product, Frameworks, Legal link lists (14px, `#8695AB`, hover `#FFF`).
- Bottom bar separated by `1px solid #1D2A41`: copyright left; "**Not legal advice.**" disclaimer right (12px `#5C6B82`, max 520px).

### 3. Dashboard
- Header row: H1 "Compliance Frameworks" + subtitle; right-aligned primary "Generate document" button → Generate.
- **Stat strip:** 4 tiles (Frameworks 29, Documents indexed 3,849, Full coverage 14 [green], Needs attention 15 [amber tile: border `#F0E3C4`, label `#B08419`, value `#8A5A00`]). Label 11px/600 uppercase muted; value 28px/700.
- **Three framework sections** (Cybersecurity / AI Governance / Financial-Healthcare). Each: eyebrow with colored dot + "N docs" (mono) + "View all →" link (→ KB). Cards in `repeat(3,1fr)` grid, gap 16.
  - Card: white, border, radius 12, padding 18, **min-height 158px**, flex column. Title (16/600) + version tag (mono 11px, right). Description **clamped to 2 lines** (`-webkit-line-clamp:2`). Footer row (top border `#F0F2F6`): "N docs" (mono) + quality badge. Hover: border → category color + shadow.
- Bottom: 2-col grid. Left "Quick Actions" (4 cards, 38px colored icon tile + title + subtitle, each links to its screen). Right "Recent Ingest Activity" table: header row on `#F8FAFC`, columns Source / Status(green "completed" pill) / Docs(right, mono) / Completed(right). **Rows show distinct sources** (NIST SP 800-53, FedRAMP High, CMMC 2.0, EU AI Act, ISO/IEC 27001, SOC 2) — do NOT repeat one source.

### 4. Chat ("Compliance Assistant") — **bug fix**
- 900px container, `flex:1` column so it fills height (the previous layout collapsed and the footer overlapped the input — must not happen).
- H1 + subtitle; "Scope" label + framework `<select>`.
- **Conversation area:** `flex:1; min-height:380px`, white, radius 14. Empty state centered: 52px accent-soft icon tile, "How can I help with your compliance program?" (18/600), helper line, then a `repeat(2,1fr)` grid of 4 suggested-prompt cards (`#F8FAFC`, hover → white + accent border). Prompts:
  - "What SP 800-53 controls apply to access control?"
  - "How does CMMC 2.0 map to NIST SP 800-53?"
  - "What are the encryption requirements under FedRAMP Moderate?"
  - "Which controls satisfy GDPR Article 32?"
- Bottom input row: text input (`flex:1`, focus border `#16467D`) + "Send" primary button. Stays below the conversation area, never overlapped.

### 5. Search ("Document Search")
- 1200px. H1 + subtitle. Row: search input (`flex:1`) + framework `<select>` + "Search" primary.
- "Try:" chip row of sample queries (accent-soft pills): access control, encryption at rest, incident response, audit logging, multi-factor authentication.
- 2-col results area (`1.2fr 1fr`), min-height 420px: left = white empty state (muted magnifier tile, "Search compliance documents"); right = dashed-border placeholder "Select a document to view details."

### 6. Generate ("Policy Generator") — **bug fix in result view**
- 1200px. H1 + subtitle. 4-step indicator: Framework / Template / Scope / Generate.
- **Step 1 (picking):** step 1 circle filled accent, rest gray. Card panel: "Select a compliance framework" + "Continue →" primary (→ result). Grid `repeat(3,1fr)`, gap 14, of selectable framework cards (min-height 118px, 2-line clamp) with a category dot + mono category eyebrow. **Selected card:** `2px solid #16467D` border + `#F7FAFF` bg. Default selection: NIST SP 800-53.
- **Result view (Continue):** all 4 step circles become green `#157347` with ✓ and green connector lines. Then a single clean document card — **no app nav or footer nested inside it** (the old bug embedded the whole app; the result must be just the document):
  - Green success banner ("Document generated successfully").
  - Body (padding 32×40): H2 "Access Control Security Policy"; mono tags NIST SP 800-53 / Policy / v1.0.
  - "Document Control" table (2-col, label column `#FAFBFC`): Organization `[Organization Name]`, Policy Title, Version 1.0, Effective Date `[Effective Date]`, Next Review Date `[Effective Date + 12 months]`.
  - "1. Purpose" and "2. Scope" body paragraphs.
  - Footer bar (`#FAFBFC`, top border): "↺ Start over" secondary (left) → back to step 1; "Export MD", "Export DOCX" secondary + "Export XLSX" primary (right).

### 7. Knowledge Base
- 1200px. H1 + "29 frameworks — 3,849 documents" (numbers in mono). "Filter frameworks…" input (320px).
- Three sections (same category eyebrows as Dashboard), each a **table** (not tinted row-bands): header row `#F8FAFC`, columns `2.4fr 0.7fr 0.9fr 0.9fr 0.9fr 1fr` = Framework / Docs(right) / Controls(right) / Source / Quality / Last ingested(right).
  - Framework cell: name (14.5/600) + mono version tag. Docs/Controls mono. Source = bordered chip. Quality = badge with glyph (✓ Good / △ Partial / ✕ Thin). Row hover `#F8FAFC`.
- Data for all 29 frameworks is in the source file's logic (docs, controls, source, quality, last-ingested per framework).

### 8. Admin / Users
- Secondary sub-nav bar (`#EEF1F5`): "ADMIN" eyebrow + Users(active, white pill) / Organizations / Settings / Knowledge Base.
- H1 "Users" + "1 total user" (mono 1). Search input (440px).
- Table: header `User / Organization / Role / Joined / (edit)`, columns `2.4fr 1.4fr 0.8fr 1fr 0.5fr`. One row: 38px avatar "CS" + "Carl Scott" + mono ID + "Platform Admin" badge (`#EEF4FB`/`#16467D`); "My Online Services, Inc"; "Owner" badge (amber `#FBF1DC`/`#8A5A00`); "Jun 30, 2026"; "Edit" link (right).

### 9. Account Settings
- **1080px** container (was a stranded ~500px column — widen it). H1 + subtitle.
- Row 1 (`1fr 1fr`): **Current Plan** card (Free badge; two usage meters — 6px track `#EEF1F5`, fill `#16467D`, at 40% and 66%; "Upgrade plan" primary) and **Profile** card (read-only email; "Display name" input; "Save profile").
- **Change Password** card: label + hint; password input (`flex:1`) + "Update password" primary (max-width 520px row).
- **Generated Documents** card: title + count "10 unique · 21 total" (mono). Filter chip row (All active = `#16467D`/white; others white/border): All, Starred, SP 800-53, NIST RMF, CMMC, SOX, POA&M, Gap Assessment, Checklist, Procedure, Policy. Then a **deduplicated** list — one row per unique document, with a "×N copies" amber pill where duplicates existed (do NOT render 21 near-identical rows). Row: star (filled `#E0A52A` / outline `#C2CAD6`) + title (15/600) + meta (mono framework tag · type · date) + dup pill + "View" link. Hover `#F8FAFC`.
- Bottom row (`1fr 1fr`): **Your Data** (secondary "Download my data") and **Delete Account** (red card: border `#F0C2BD`, red title, "Request account deletion" button, hover bg `#FDECEA`).

### 10. Login (unauthenticated) — full-bleed, **no app nav/footer**
- `min-height:100vh` grid `1.05fr 1fr`.
- **Left panel** navy `#0E1728`: logo top; centered hero "The compliance knowledge hub for security & governance teams." (38/700) + supporting paragraph; three ✓ trust bullets (24px `#16467D` circle checks): "29 frameworks across cyber, AI governance & finance", "Cross-framework control mapping", "AI-assisted policy & POA&M generation"; bottom "Not legal advice" line.
- **Right panel** `#F4F6F9`, centered 400px card stack: "Sign in to your account" (26/700) + "Don't have an account? Start for free" link. White card: "SIGN IN WITH" eyebrow, then 3 stacked full-width provider buttons (Google/Apple/GitHub — consistent, each a 22px rounded provider glyph + label), an "or" divider, a "Work email" input, and a "Continue with email" primary. Legal microcopy below.

---

## Interactions & Behavior
- **Nav:** click any nav item / user / Admin to switch screen; active item highlighted (600 weight, `#EEF4FB` pill). "Sign out" → Login. Any Login provider/email button or "Start for free" → Dashboard (simulated auth).
- **Generate:** "Continue →" advances step-1 picker to the completed result view; "↺ Start over" resets to step 1. Framework cards are single-select (border/bg highlight).
- **Account:** filter chips filter the document list (match on framework code, type, or Starred; "All" shows everything). Star toggles are visual.
- **Hover states:** cards → colored border + subtle shadow; buttons → darker (`#10365F`) or accent border; table/list rows → `#F8FAFC`; footer links → white.
- **Focus:** inputs move border to `#16467D`.
- Scroll resets to top on screen change.
- No real data fetching in the prototype — all content is static sample data.

## State Management
- `screen`: which view is shown (dashboard | chat | search | generate | kb | admin | account | login).
- `filter`: active Account document filter chip.
- `genStep`: Generate wizard state (1 = picker, done = result).
- `selectedFw`: selected framework in the Generate picker.
- (Prototype-only toggles: `showStats` on Dashboard, `dedupeDocuments` on Account — the dedup behavior should be the production default; the toggle exists only to demonstrate before/after.)

## Assets
- **Fonts:** IBM Plex Sans + IBM Plex Mono (Google Fonts).
- **Icons:** simple inline SVGs (chat bubble, magnifier, document, database, chevrons, checks). Replace with the codebase's icon set.
- **Logo:** placeholder shield-check mark. Separate logo exploration is in `Logo Directions.dc.html` (four directions) — the final mark is still being chosen; do not treat the placeholder shield as final.
- No raster images or photography.

## Files
- `CyberComplianceHub Redesign.dc.html` — all 10 views (design reference; ignore the `support.js` runtime dependency).
- `Logo Directions.dc.html` — logo exploration board (reference for brand direction).
