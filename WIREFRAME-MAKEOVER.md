# TalentIQ UI Makeover — Design Spec & Wireframes

## Design Direction

**Problem:** Current UI feels like a generic SaaS template with J.B. Hunt colors slapped on. Inter + JetBrains Mono, all-caps labels everywhere, colored top borders on every card, 3px yellow border accents.

**Goal:** A distinctive, premium feel that could only be J.B. Hunt. Warm, confident, industrial-modern. Not a template.

**Source of truth:** Where this document and the running application disagree, **the application code is correct and this document is wrong**. Every claim below has been reconciled against `index.html`, `app.js`, `config.js`, `workflow.js`, `views.js`, `components.js`, and `styles.css`. Corrections are marked with *(corrected)*.

**Scope guard:** This is a visual and copy-presentation redesign. Business logic, data structures, analytics calculations, provenance, audit functionality, and working workflows are **not** in scope. Domain terminology is not renamed for polish — see §11.

---

## 1. Primary User Journeys

### Journey A: Recruiter at Career Fair (Primary)

```
Arrive → Open Capture → Review Card Stack → Triage (Reviewed / Follow-Up / Skip)
  ↓
For each candidate:
  1. Read name, school, top skills (3-second scan)
  2. Read highlights (10-second scan)
  3. Optional: Record voice memo, add notes
  4. Swipe or click triage button
  ↓
End of day → Review → Approve summaries → Export CSV / JSON
```

**Pain points addressed:**
- Current: Card stack is absolutely positioned, hard to scan quickly
- Current: Right column feels disconnected, requires eye travel
- Current: No clear visual hierarchy — everything competes for attention

### Journey B: Recruiter Post-Event (Review)

```
Open Review → Filter by status/priority → Read the detail panel
  ↓
For each candidate:
  1. Read AI-generated summary
  2. Verify against resume (tab to Resume)
  3. Check provenance (tab to Provenance)
  4. Approve or flag for follow-up
  ↓
Export approved candidates
```

**Pain points addressed:**
- Current: Detail panel is a modal, breaks flow
- Current: No tabs — everything is one long scroll
- Current: Missing flags are buried, not actionable

### Journey C: Student at Booth (Intake)

```
Scan QR → Fill form → Upload resume → Submit
  ↓
Confirmation screen
```

**Pain points addressed:**
- Current: Form feels like a generic web form
- Current: No progress indication
- Current: Resume upload is unclear about what happens next

### Journey D: Event Coordinator (Event Results)

```
Open Event Results → Check capture progress → Review missing data
  ↓
Identify gaps → Send recruiter to fill → Export end-of-day report
```

**Pain points addressed:**
- Current: Stats are colored-top-border cards, hard to compare
- Current: Activity feed is a table, not scannable
- Current: Missing data is a grid, not actionable

---

## Design Tokens (New)

### Color
| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#1A1A1A` | Primary text, sidebar bg |
| `--ink-soft` | `#4A4A4A` | Secondary text |
| `--ink-muted` | `#8A8A8A` | Tertiary text, placeholders |
| `--paper` | `#FAFAF8` | Page background (warm off-white, not cold icicle) |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--surface-warm` | `#F5F3EF` | Subtle warm surface |
| `--brand` | `#005DBA` | Primary actions, links |
| `--brand-deep` | `#003D7A` | Hover states |
| `--accent` | `#FEDB00` | J.B. Hunt yellow — used sparingly, not as borders |
| `--accent-soft` | `#FFF8D6` | Yellow tint for highlights |
| `--line` | `#E5E2DC` | Warm border color |
| `--line-soft` | `#F0EEE9` | Subtle borders |
| `--success` | `#16A34A` | Reviewed, positive |
| `--warning` | `#D97706` | Follow-Up, flags |
| `--danger` | `#DC2626` | Errors, recording |

### Typography *(corrected)*

**Decision:** Replace Inter + JetBrains Mono with **IBM Plex Sans** — a professional UI face with an engineered, slightly squared character that fits the industrial/logistics subject matter without being a novelty or display face. It stays highly legible at 13–16px.

| Role | Font | Size | Weight |
|------|------|------|--------|
| Display | `IBM Plex Sans` | 28–34px | 600 |
| Heading | `IBM Plex Sans` | 20–24px | 600 |
| Body | `IBM Plex Sans` | 14–15px | 400 |
| Label | `IBM Plex Sans` | 12–13px | 500 (sentence case, NOT uppercase, NOT letter-spaced) |
| Mono | `IBM Plex Mono` | 12–13px | 400 |

**Monospace is kept only where the content actually benefits** — where characters are ambiguous or alignment matters:

- Candidate IDs (`TQ-2401`)
- Provenance field names and values
- Timestamps and audit-log entries
- Transcript segments with speaker/time offsets
- File names, CSV/JSON export payloads

Everywhere else uses IBM Plex Sans. Monospace is **not** used for labels, buttons, navigation, or small data captions.

**Implementation note:** `config.js:41` `fontsUrl` is the single string that loads Google Fonts, and `app.js:82` applies it. Changing typefaces therefore requires a **narrow, single-value change to `config.js:41`** — this is the only justified `config.js` edit in the redesign. `index.html:10` carries a hardcoded fallback copy of the same URL and must be updated to match.

**Key change:** Labels are no longer all-caps with letter-spacing. They use weight and color for hierarchy, not case transformation.

### Spacing
- Base unit: 8px
- Card padding: 20-24px
- Section gap: 24-32px
- Page gutter: 32px
- Sidebar width: ~200–220px *(corrected)* — approximate, not a hard target. Readable labels win over hitting an exact number. If "Research Metrics" or "Event Results" truncates or wraps awkwardly, the width grows rather than abbreviating the label.

### Radius
- Cards: 12px
- Buttons: 8px
- Inputs: 6px
- Pills: 999px

### Shadows
- Card: `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)`
- Hover: `0 4px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)`
- Modal: `0 12px 40px rgba(0,0,0,0.16)`

---

## 2. Information Architecture *(corrected)*

### Corrections made to the original IA

The first draft of this document described seven destinations, several of which **do not exist**:

| Draft claim | Reality |
|-------------|---------|
| Separate "AI Review" **and** "Review" views | There is **one** review screen. `views.js:2405` `renderReview` is a thin alias: `return TIQ.views.renderAIReview();` |
| An "Export" view | **No such route.** Export is `TIQ.exportCsv` / `TIQ.exportJson` (`components.js:179,192`), invoked as buttons inside existing views |
| A "Candidate Review" view (Wireframe 3b) | **No such route, and no live code.** `renderCandidateReview` is assigned twice — a full implementation at `views.js:2260` and an alias at `views.js:2413`. The later assignment wins, so the ~160-line block at 2260–2404 is **dead code**. Nothing calls it; `app.js` calls only the five renderers below. |
| "QR Poster" as a nav item | The QR poster **is** the `kiosk` view, already in the workflow as step 1 "Set Up" |
| Nav grouping "None" | Group headings already exist, hardcoded at `workflow.js:116` |

**Decision:** the dead `renderCandidateReview` / `initCandidateReview` block at `views.js:2260-2404` is **left untouched** — deleting it is a code-cleanup task, not part of a visual redesign, and touching it risks unrelated behaviour changes. It is recorded here for a future cleanup pass.

### Navigation Structure (real)

```
SIDEBAR  (index.html:16-46)
├── Workflow group heading        <- workflow.js:116, currently "Recruiter workflow"
│   ├── 1  Set Up          -> kiosk      page title "Booth Setup"
│   ├── 2  Capture         -> capture    page title "Capture"   [DEFAULT VIEW]
│   ├── 3  Review          -> review     page title "End-of-Day Review"
│   └── 4  Event Results   -> analytics  page title "Event Results"
├── Study group heading            <- workflow.js:116, currently "Study"
│   └──    Research Metrics-> metrics
├── Event card                     <- index.html:27-35, ALREADY BUILT
│   └── [event name]  date  ·  location   <- TIQ.eventInfo()
└── Footer: Notifications, Settings <- index.html:37-45, decorative icons, no handlers
```

Each nav item already renders a step number, the label, a `when` subtitle, and a live count (`workflow.js:114-115`, `data-count`). **The redesign restyles these; it does not restructure them.**

**Labels are owned by `config.js:150-156`** (`workflow[].label`, `.when`, `.title`) and are therefore **preserved as-is** under the "preserve `config.js`" rule. Only the two group headings — hardcoded string literals at `workflow.js:116` — are eligible to change.

### View Hierarchy (real: 5 routes, `app.js:28-62`)

```
├── capture   (defaultView, config.js:159)
│   ├── Card stack (left) + drawer / detail panel (right)
│   └── Triage bar — must stay immediately reachable (see §7)
├── review    = renderAIReview (views.js:1775)
│   ├── Filter bar (status / function / priority / search) — ALREADY VISIBLE
│   ├── Candidate list (left)  — ALREADY A PANEL
│   ├── Detail panel (right)   — ALREADY A PANEL, currently one long scroll
│   └── Compare                — ALREADY a side-by-side modal (index.html:77-91)
├── analytics
│   ├── Stat cards, activity feed, missing-data breakdown
│   └── CSV / JSON export buttons live here and in review
├── kiosk
│   ├── QR panel + event info
│   └── Dedicated print stylesheet (see below)
└── metrics
    └── Metric cards, funnel, per-recruiter table, metrics CSV export
```

### QR Poster print *(corrected)*

A print block **already exists** at `styles.css:1571-1583`. It functions, but it removes chrome with the fragile `body * { visibility: hidden }` technique, which leaves layout gaps and hides `.kiosk-qr-actions` — including the button you would use to print. The redesign **replaces it with a dedicated print stylesheet** that removes application chrome properly. This refines existing work rather than adding new work.

### Information Density by View *(corrected)*

| View | Density | Rationale |
|------|---------|-----------|
| Capture | Low | Rapid triage, 3-min conversations |
| Review | Medium | Detailed analysis, but focused |
| Event Results | Low–Medium | Progress check, not deep analysis |
| Booth Setup | Minimal | Print-friendly, single purpose |
| Research Metrics | High | Data analysis, but visual |

---

## 3. Annotated Wireframes *(corrected)*

> Design tokens above are front matter, applied throughout.

---

## Wireframe 1: Capture (priority)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (~210px, dark #1A1A1A) │  MAIN (warm paper bg)               │
│                                  │                                       │
│  [J.B. Hunt Logo]                │  ┌─────────────────────────────────┐ │
│                                  │  │ Topbar: Recruiter: [▼]  Search  │ │
│  ── Workflow ──                  │  └─────────────────────────────────┘ │
│  ● Capture (active)              │                                       │
│  ○ Review                        │  ┌──────────┐  ┌──────────────────┐ │
│  ○ Event Results                 │  │          │  │ Candidate Detail  │ │
│  ── Study ──                     │  │  CARD    │  │                   │ │
│  ○ Research Metrics              │  │  STACK   │  │  Name, School     │ │
│  ── Event ──                     │  │          │  │  Skills           │ │
│  Logistics & Tech Fair           │  │  [Card]  │  │  Highlights       │ │
│  Sep 14, 2026 · Nashville, TN    │  │  [Card]  │  │  Notes            │ │
│                                  │  │  [Card]  │  │  Voice            │ │
│                                  │  │          │  │                   │ │
│                                  │  └──────────┘  └──────────────────┘ │
│  [🔔] [⚙️]                       │                                       │
│                                  │  ┌─────────────────────────────────┐ │
│                                  │  │  ← Reviewed  │  Follow-Up →     │ │
│                                  │  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Capture — Key Changes

1. **Card stack is NOT absolutely positioned** — uses normal flow with transform for swipe
2. **Right column is NOT a floating white card** — it's a warm surface panel that feels connected
3. **Triage buttons are directly below the card stack** — not at the bottom of the page
4. **Card content is progressive** — name + school + top 3 skills visible, rest on scroll
5. **No colored top borders** — cards use shadow + border for elevation
6. **Swipe hint is visible** — not 0.55 opacity

### Capture Card Layout
```
┌─────────────────────────────────┐
│  [Avatar]  Name                 │
│             School · Major       │
│             Expected: May 2027   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Top Skills                     │
│  [Python] [SQL] [Tableau]       │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Highlights                     │
│  • Led team of 5 in capstone    │
│    └ Source: Resume             │
│  • Dean's List 3 semesters      │
│    └ Source: Resume             │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  [🎙️ Record]  [✏️ Edit]         │
└─────────────────────────────────┘
```

---

## Wireframe 2: Event Results (analytics)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR                     │  MAIN                                    │
│                              │                                          │
│                              │  Event Results                           │
│                              │                                          │
│                              │  ┌────────┐ ┌────────┐ ┌────────┐      │
│                              │  │ Total  │ │Reviewd │ │Follow- │      │
│                              │  │  47    │ │  12    │ │Up  8   │      │
│                              │  └────────┘ └────────┘ └────────┘      │
│                              │                                          │
│                              │  ┌─────────────────────────────────┐    │
│                              │  │ Activity Feed                   │    │
│                              │  │ ● Sarah reviewed Priya Sharma   │    │
│                              │  │ ● Mike captured John Doe        │    │
│                              │  │ ● Sarah flagged Jane for follow  │    │
│                              │  └─────────────────────────────────┘    │
│                              │                                          │
│                              │  ┌──────────────┐ ┌──────────────────┐  │
│                              │  │ Missing Data │ │ Top Universities │  │
│                              │  │ ▓▓▓▓▓░░ 67%  │ │ 1. Nashville St  │  │
│                              │  │ ▓▓▓░░░ 45%  │ │ 2. UT Knoxville  │  │
│                              │  │ ▓▓▓▓▓░ 78%  │ │ 3. Vanderbilt    │  │
│                              │  └──────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Event Results — Key Changes

1. **No colored top borders** on stat cards — use large numbers + subtle labels
2. **Activity feed is visual** — colored dots, clear typography, not a table
3. **Missing data uses horizontal bars** — not a grid with counts
4. **More whitespace** — less dense, more scannable

---

## Wireframe 3: Review

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR                     │  MAIN                                    │
│                              │                                          │
│                              │  Review                                  │
│                              │                                          │
│                              │  ┌──────────────┐ ┌──────────────────┐  │
│                              │  │ Filters      │ │ Candidate Detail  │  │
│                              │  │              │ │                   │  │
│                              │  │ Status [▼]   │ │  [Avatar] Name    │  │
│                              │  │ Priority [▼] │ │  School · Major   │  │
│                              │  │              │ │                   │  │
│                              │  │ ──────────── │ │  ─────────────── │  │
│                              │  │              │ │                   │  │
│                              │  │ Candidate 1  │ │  Summary          │  │
│                              │  │ Candidate 2  │ │  • Highlight 1    │  │
│                              │  │ Candidate 3  │ │  • Highlight 2    │  │
│                              │  │ Candidate 4  │ │                   │  │
│                              │  │              │ │  ─────────────── │  │
│                              │  │              │ │                   │  │
│                              │  │              │ │  Missing Info     │  │
│                              │  │              │ │  ⚠ GPA unknown   │  │
│                              │  │              │ │  ⚠ Work auth     │  │
│                              │  └──────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Review — Key Changes *(corrected)*

The first two items of the original draft were **already implemented** and are struck:

1. ~~Two-panel layout~~ — **already the case.** `renderAIReview` (`views.js:1775`) already renders list + detail side by side; compare is already a side-by-side modal (`index.html:77-91`).
2. ~~Filters are visible~~ — **already the case.** Status / function / priority / search are already a visible bar.
3. **Detail panel uses tabs** — Summary / Resume / Notes / Provenance, replacing today's single long scroll. Full content mapping in **§5** so nothing is lost.
4. **Missing information flags stay actionable** — clicking a flag jumps to the field. Wording preserved per §11.

### Removed: "Candidate Review" wireframe

The original Wireframe 3b specified a separate screen. It does not exist — there is one review screen, and `renderCandidateReview` is dead code shadowed by an alias (`views.js:2413`). **Wireframe 3 is the only review wireframe.**

---

## Wireframe 3c: QR Poster

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR                     │  MAIN                                    │
│                              │                                          │
│                              │  QR Poster                               │
│                              │                                          │
│                              │  ┌─────────────────────────────────┐    │
│                              │  │                                 │    │
│                              │  │  ┌─────────┐                    │    │
│                              │  │  │         │  J.B. Hunt         │    │
│                              │  │  │  QR     │  Logistics & Tech  │    │
│                              │  │  │  Code   │  Fair              │    │
│                              │  │  │         │                    │    │
│                              │  │  └─────────┘  Sep 14 · Nashville│    │
│                              │  │               TN                 │    │
│                              │  │                                 │    │
│                              │  │  Scan to submit your resume     │    │
│                              │  │                                 │    │
│                              │  └─────────────────────────────────┘    │
│                              │                                          │
│                              │  [Print]  [Download PDF]                │
└─────────────────────────────────────────────────────────────────────────┘
```

### QR Poster — Key Changes

1. **Print-friendly** — high contrast, no sidebar in print view
2. **QR code is prominent** — large, centered, with clear call-to-action
3. **Event info is clear** — name, date, location
4. **Action buttons are visible** — Print and Download PDF

---

## Wireframe 3d: Research Metrics

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR                     │  MAIN                                    │
│                              │                                          │
│                              │  Research Metrics                        │
│                              │                                          │
│                              │  ┌────────┐ ┌────────┐ ┌────────┐      │
│                              │  │Funnel  │ │Snapshot│ │Field   │      │
│                              │  │Review  │ │Approve │ │Complete│      │
│                              │  │ 67%    │ │  12    │ │  78%   │      │
│                              │  └────────┘ └────────┘ └────────┘      │
│                              │                                          │
│                              │  ┌─────────────────────────────────┐    │
│                              │  │ Candidate Funnel                │    │
│                              │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  47   │    │
│                              │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  12   │    │
│                              │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   8   │    │
│                              │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   3   │    │
│                              │  └─────────────────────────────────┘    │
│                              │                                          │
│                              │  ┌─────────────────────────────────┐    │
│                              │  │ Per-Recruiter Table             │    │
│                              │  │ Recruiter │ Actions │ Approvals  │    │
│                              │  │ Sarah     │   15    │    8       │    │
│                              │  │ Mike      │   12    │    6       │    │
│                              │  └─────────────────────────────────┘    │
│                              │                                          │
│                              │  [Export Metrics CSV]                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Research Metrics — Key Changes

1. **Metric cards are clean** — large numbers, subtle labels, no colored borders
2. **Funnel is horizontal** — easy to compare stages
3. **Per-recruiter table is simple** — no expand/collapse, just clear data
4. **Export is visible** — not hidden in a menu

---

## Wireframe 3e: Candidate Intake (Mobile)

```
┌─────────────────────────┐
│  J.B. Hunt              │
│  Logistics & Tech Fair  │
│                         │
│  ─────────────────────  │
│                         │
│  First Name             │
│  [________________]     │
│                         │
│  Last Name              │
│  [________________]     │
│                         │
│  Email                  │
│  [________________]     │
│                         │
│  University             │
│  [________________]     │
│                         │
│  Major                  │
│  [________________]     │
│                         │
│  Graduation Date        │
│  [________________]     │
│                         │
│  GPA                    │
│  [________________]     │
│                         │
│  Work Authorization     │
│  [▼]                    │
│                         │
│  ─────────────────────  │
│                         │
│  Upload Resume          │
│  [📄 Choose File]       │
│                         │
│  ─────────────────────  │
│                         │
│  [Submit]               │
│                         │
└─────────────────────────┘
```

### Candidate Intake — Key Changes

1. **Mobile-first** — single column, large touch targets
2. **Progressive disclosure** — only show relevant fields
3. **Clear sections** — Personal Info, Education, Resume
4. **Submit is prominent** — full-width button at bottom

---

## Wireframe 4: Navigation *(corrected — real routes)*

```
┌────────────────────────────┐
│  [J.B. Hunt Logo]          │
│                            │
│  Workflow                  │
│  1  Set Up                 │
│  2  Capture          <- active
│  3  Review                 │
│  4  Event Results          │
│                            │
│  Study                     │
│     Research Metrics       │
│                            │
│  ────────────────────────  │
│  Event                     │
│  Logistics & Technology    │
│    Fair                    │
│  Sep 14, 2026              │
│    Nashville, TN           │
│                            │
│  ────────────────────────  │
│                            │
│  [bell]   [gear]           │
└────────────────────────────┘
```

Width ~200–220px, growing if labels would wrap.

### Navigation — Key Changes *(corrected)*

1. ~~Labels are plain language~~ — **already true.** `Set Up / Capture / Review / Event Results / Research Metrics` are unchanged (§11-B).
2. **Yellow `border-right` removed** — `styles.css:165`
3. **Active state** — subtle background, not a coloured left border
4. **Group headings** — `Workflow` + `Study` (already exist at `workflow.js:116`; only the heading text shortens)
5. **Event card retained** — already built at `index.html:27-35`

---

## 4. Component Hierarchy

```
TIQ Components
├── Layout
│   ├── Sidebar
│   │   ├── Logo
│   │   ├── NavGroup ("Workflow")
│   │   │   ├── NavItem (active)
│   │   │   ├── NavItem
│   │   │   └── NavItem
│   │   ├── NavGroup ("Event")
│   │   │   ├── EventCard
│   │   │   └── EventMeta
│   │   └── SystemIcons (notifications, settings)
│   ├── Topbar
│   │   ├── RecruiterSelect
│   │   ├── SearchInput
│   │   └── ActionButtons
│   └── MainContent
│       └── ViewContainer
│
├── Capture Components
│   ├── CardStack
│   │   ├── CaptureCard (active)
│   │   │   ├── CardHeader (avatar, name, school, grad date)
│   │   │   ├── SkillPills (top 3)
│   │   │   ├── HighlightsList
│   │   │   ├── VoiceMemoWidget
│   │   │   └── MissingFlagsBanner
│   │   ├── CaptureCard (peek)
│   │   └── CaptureCard (peek)
│   ├── DetailPanel
│   │   ├── ResumeSection
│   │   ├── DrawerTabs (Resume / Voice / Notes)
│   │   └── DrawerContent
│   └── TriageBar
│       ├── ReviewedButton (←)
│       ├── UndoButton
│       └── FollowUpButton (→)
│
├── Review Components
│   ├── FilterBar
│   │   ├── StatusSelect
│   │   ├── FunctionSelect
│   │   ├── PrioritySelect
│   │   └── SearchInput
│   ├── CandidateList
│   │   ├── CandidateListItem (×n)
│   │   │   ├── Checkbox
│   │   │   ├── Name
│   │   │   ├── School · Major
│   │   │   ├── StatusChip
│   │   │   └── FlagCount
│   └── DetailPanel
│       ├── DetailHeader
│       ├── ActionButtons (Approve, Follow Up, Regenerate)
│       └── TabContent
│           ├── SummaryTab
│           ├── ResumeTab
│           ├── NotesTab
│           └── ProvenanceTab
│
├── Shared Components
│   ├── Toast
│   ├── Modal
│   ├── Button (primary, secondary, ghost, danger)
│   ├── Input (text, select, textarea)
│   ├── Chip (status, skill, flag)
│   ├── Card (surface, warm)
│   ├── Tabs
│   ├── Accordion
│   └── ProgressBar
│
└── Data Display
    ├── StatCard
    ├── ActivityFeed
    ├── ActivityItem
    ├── MissingDataBar
    ├── FunnelChart
    ├── RecruiterTable
    └── ExportButton
```

---

## 5. Review Tab Content Mapping *(new — guarantees nothing is lost)*

The detail panel today is **one long scroll of 11 sections** assembled in `views.js:1926-2004`. Tabs must reorganise them, **not delete any**. This table is the acceptance criterion for Phase 4.

| Tab | Sections it contains | Source | Interactive element |
|-----|----------------------|--------|---------------------|
| **Summary** | Extraction Snapshot | `views.js:1994` | `<textarea id="snapshotEdit">` — **editable, approval surface** |
| | Grounded Highlights / Accomplishments | `views.js:1995` → `renderAccomplishments` | static + per-item source labels |
| | Missing Information Flags | `views.js:1998` | clickable flags → jumps to field |
| **Resume** | Resume (education, experience, certifications, projects, work auth, address, links) | `views.js:1926` | resume file / parsed text |
| **Notes** | Recruiter Notes | `views.js:2003` | `<textarea id="aiNotes">` — **editable** |
| | Voice Notes | `views.js:1968` | playback + re-record |
| | Transcript | `views.js:1972` → `TIQ.renderTranscriptBlock` | per-segment |
| **Provenance** | Field Provenance | `views.js:1996` → `renderFieldProvenance` | per-field machine/recruiter origin |
| | Source Citations | `views.js:1973` → `TIQ.renderCitationList` | highlight-on-click |
| | Source Traceability | `views.js:1999` (`#aiTraceList`) | highlight matching text |
| | Record Integrity | `views.js:2004` (`#aiIntegrity`) | populated programmatically |

**Completeness check:** 11 sections in, 11 sections placed. Provenance, traceability, citations, and record integrity — the compliance features — all remain directly visible under **Provenance**. None is nested behind an extra disclosure, and none is dropped.

The panel **header** (avatar, name, ID, university, degree·major) and the **action row** (Approve / Follow Up / Regenerate) stay **outside and above** the tab strip, always visible regardless of active tab. So does the compare bar (`index.html:77`).

### Critical implementation constraint

`views.js` renders by replacing `innerHTML`. Two sections are **editable textareas** (`#snapshotEdit`, `#aiNotes`) and one is **programmatically populated** (`#aiIntegrity`). Therefore:

- **Tab switching must NOT re-render.** It toggles visibility of already-rendered panels only.
- Active tab index lives in a `TIQ.views._*` module var, consistent with existing state vars.
- A full re-render is permitted only when the candidate actually changes — and must preserve any in-progress edits, or prompt before discarding them.

Losing a recruiter's unsaved notes on a tab click is a data-loss bug, not a cosmetic issue.

---


## 6. Interaction Behavior

### Hover States *(corrected — no lift, no scale)*

| Element | Hover Effect |
|---------|-------------|
| NavItem | Background: `--surface-warm`, text: `--ink` |
| Button (primary) | Background: `--brand-deep`, shadow `--hover`. **No transform.** |
| Button (secondary) | Background: `--surface-warm`, border: `--line` |
| Button (ghost) | Background: `--surface-warm` |
| Card | `--hover` shadow. **No transform.** |
| CandidateListItem | Background: `--surface-warm`, left border: `--brand` |
| Chip | No hover (static badge) |
| Tab | Text: `--brand`. **No background fill** — the bottom-border indicator carries selection. |

Hover is expressed through colour and shadow only. No lift, no scale, no
translate. See §10 for the timing table.

### Selected States

| Element | Selected Effect |
|---------|----------------|
| NavItem | Background: `--surface-warm`, left border: 3px solid `--brand` |
| **Tab** | **Bottom border: 2px solid `--brand`, text: `--brand` *(resolved)*; the indicator slides horizontally** |
| CandidateListItem | Background: `--accent-soft`, left border: 3px solid `--brand` |
| Checkbox | Checked: `--brand` background, white check |
| FilterSelect | Border: `--brand`, shadow: focus ring |

### Loading States

| Element | Loading Effect |
|---------|---------------|
| Button | Spinner icon, text: "Loading...", disabled |
| Card | Skeleton shimmer (pulse animation) |
| List | Skeleton rows (3-5 placeholder items) |
| Export | Progress bar with percentage |

### Empty States

| Element | Empty Effect |
|---------|-------------|
| CandidateList | Icon + "No candidates match your filters" |
| Search | "No results found for [query]" |
| ActivityFeed | "No activity yet" |
| DetailPanel | "Select a candidate to view details" |

### Error States

| Element | Error Effect |
|---------|-------------|
| Input | Red border, error message below |
| Toast (error) | Red left border, icon, message |
| Card | Red left border, error message |
| Export | Toast: "Export failed. Please try again." |

### Success States

| Element | Success Effect |
|---------|---------------|
| Toast (success) | Green left border, icon, message |
| Button | Brief checkmark animation |
| Card | Brief green border flash |

### Disabled States

| Element | Disabled Effect |
|---------|----------------|
| Button | Opacity: 0.5, cursor: not-allowed |
| Input | Background: `--surface-warm`, cursor: not-allowed |
| NavItem | Opacity: 0.5, cursor: not-allowed |

### Confirmation Dialogs

| Action | Confirmation |
|--------|-------------|
| Delete candidate | "Are you sure? This cannot be undone." |
| Export data | "Export [N] candidates as [format]?" |
| Reset event | "This will clear all data. Continue?" |
| Override AI summary | "Your changes will replace the AI summary. Continue?" |

---

## 7. Progressive Disclosure *(Capture corrected)*

### Why the original approach was wrong

The first draft made triage a Level 1 item and put "Voice Memo Widget" and "Missing Flags Banner" behind **"Level 2 (On Scroll)"**. That is unsafe here: Capture is a fixed-height workspace, and if a recruiter has to scroll or expand to see the flags, the thing that most affects a triage decision is one gesture away from being missed. Scroll is also already taken by the card and the drawer.

**Rule: triage controls and the decision-critical facts are never behind a scroll or an expand.**

### Capture View (corrected)

```
ALWAYS VISIBLE — no scroll, no expand
├── Card: Name, School, Major, Graduation date, GPA
├── Card: Top 3 skills
├── Card: Missing-information flags   <- promoted to always-visible
└── Triage bar: [← Reviewed] [Undo] [Follow-Up →]
        ^ sticky to the bottom of the left column; never scrolls away

ON EXPAND — in-card disclosure, card does not change size
└── "More from this candidate" disclosure
    ├── Accomplishments / grounded highlights
    └── Voice memo widget (record / playback)

ON DRAWER OPEN — right column, tabs already exist
    Resume | Voice | Notes
```

**Constraint:** the in-card disclosure uses `<details>`-style toggle with its own state var, so expanding never reflows the stack and never shifts the triage bar.

### Review

```
ALWAYS VISIBLE
├── Detail header (avatar, name, ID, university)   <- above the tabs
├── Action row (Approve / Follow Up / Regenerate) <- above the tabs
├── Active tab content
└── Compare bar                                    <- index.html:77

ON TAB SWITCH — visibility toggle only, never a re-render (see §5)
├── Summary   (Extraction Snapshot, Accomplishments, Missing flags)
├── Resume
├── Notes     (Recruiter notes, Voice notes, Transcript)
└── Provenance(Field provenance, Source citations, Traceability, Record integrity)
```

> `TIQ.renderAuditTrailList` (`components.js:135`) exists but **is never called** anywhere in the app. The original draft listed "Audit Trail" as review content; it is not currently surfaced. Wiring it up is a feature decision outside this redesign — **flagged, not done here.**

### Event Results

```
ALWAYS VISIBLE
├── Key stats (total, reviewed, follow-up)
├── Missing-information breakdown
└── Recent activity

ON CLICK
└── Full activity feed
```

### Candidate Intake

```
Level 1 (Always Visible):
  - Personal Info (Name, Email)
  - Education (University, Major, Grad Date)

Level 2 (On Scroll):
  - GPA, Work Authorization
  - Resume Upload

Level 3 (On Submit):
  - Confirmation Screen
```

---

## 8. Responsive Behavior

### Breakpoints *(corrected — reuse the ones already in `styles.css`)*

`styles.css` already defines five width breakpoints. **Do not invent new ones.** Map them to intent:

| Existing `@media` | Lines | Role in this redesign |
|-------------------|-------|----------------------|
| `max-width: 1100px` | 49 | Stats grid drops to 2 columns |
| `max-width: 1024px` | 1474 | Sidebar collapses to icon rail; two-column views tighten |
| `max-width: 768px` | 1253, 1500 | **Primary mobile breakpoint** — single column, stacked |
| `max-width: 700px` | 50 | Missing-data rows compress |
| `max-width: 480px` | 1551 | Narrow phones — capture card + triage stack full-bleed |

Plus two non-width queries already in place: `@media print` (1571) and
`@media (prefers-reduced-motion: reduce)` (1197, 1466) — see §10.

Any new rule must attach to one of these. If a layout genuinely needs a new
threshold, that is a decision to raise, not a default.

### Capture View

| Breakpoint | Layout |
|-----------|--------|
| ≤ 480px | Card stack full-bleed; detail panel moves below; **triage bar sticky to viewport bottom** |
| 481–768px | Card stack full-width; detail panel below; triage bar sticky |
| 769–1024px | Card stack ~55%, detail panel ~45%, triage bar sticky beneath card stack |
| > 1024px | Card stack 50%, detail panel 50%, triage bar beneath card stack |

The triage bar is **sticky at every width** — see §7. It is never scrolled out of reach.

### Review

| Breakpoint | Layout |
|-----------|--------|
| ≤ 768px | List full-width; detail panel opens over it as a dialog (reuse the existing compare-modal pattern at `index.html:79-91`) |
| 769–1024px | List 40%, detail panel 60% |
| > 1024px | List 35%, detail panel 65% |

The two-panel layout is preserved at every width ≥769px — the spec's claim that
"detail panel is a modal" was wrong; that is only a mobile adaptation.

### Event Results

| Breakpoint | Layout |
|-----------|--------|
| Mobile | Stats stacked, activity feed full-width |
| Tablet | Stats 2×2 grid, activity feed full-width |
| Desktop | Stats 3-column, activity feed + missing data side-by-side |

### Navigation

| Breakpoint | Layout |
|-----------|--------|
| ≤ 768px | Off-canvas drawer, opened from a menu button in the topbar |
| 769–1024px | Icon rail (~64px), labels hidden, tooltips on focus/hover |
| > 1024px | Full sidebar (~200–220px, readability over exact width) |

The ≤1024px icon rail and ≤768px drawer are **new**; the sidebar currently has
no responsive behaviour. Existing `.sidebar` rule is `styles.css:154-166`.

### Candidate Intake

| Breakpoint | Layout |
|-----------|--------|
| ≤ 768px | Single column, full-width inputs |
| 769–1024px | Single column, max-width 600px |
| > 1024px | Single column, max-width 600px, centred |

`candidate-form.html` is a **separate page** reached by QR code — it does not
share `index.html`'s shell and has its own responsive rules.

---

## 9. Accessibility Requirements

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|---------------|
| Color contrast | All text meets 4.5:1 ratio (3:1 for large text) |
| Focus indicators | Visible focus ring on all interactive elements |
| Keyboard navigation | All functionality available via keyboard |
| Screen reader | Semantic HTML, ARIA labels where needed |
| Reduced motion | Respect `prefers-reduced-motion` media query |

### Color Contrast

| Element | Background | Ratio |
|---------|-----------|-------|
| Body text | `--paper` | 15.2:1 |
| Secondary text | `--paper` | 7.1:1 |
| Muted text | `--paper` | 4.6:1 |
| Brand text | `--paper` | 4.8:1 |
| White text | `--brand` | 4.5:1 |
| White text | `--ink` | 15.2:1 |

### Already implemented — remove from scope *(corrected)*

| Item | Status | Where |
|------|--------|-------|
| Skip link | **Already built** | `index.html:14` — `.skip-link` → `#mainContent` |
| Focus ring | **Already built** | `styles.css:~1587` — `*:focus-visible { outline: 2px solid … }` |
| Reduced motion | **Partially built** | `styles.css:1197, 1466` — blanket `animation-duration: 0.01ms` blocks |
| Compare modal semantics | **Already built** | `index.html:79-91` — `role="dialog" aria-modal="true"` |
| Connection status region | **Already built** | `index.html:72` — `role="status"` |
| Skeleton loading | **Already built** | `components.js:205` `TIQ.skeleton`, used `app.js:31,50` |

The existing reduced-motion blocks use a blanket `*` rule. Per the resolved motion decision, these are **narrowed** rather than left as-is — see §10.

### Focus States *(corrected — mostly existing)*

Focus-visible rings already exist globally. The redesign only adds the tab-strip roving indicator:

```css
.tab[aria-selected="true"] { border-bottom: 2px solid var(--brand); }
.tab:focus-visible          { outline: 2px solid var(--brand); outline-offset: 2px; }
```

### Keyboard Shortcuts *(corrected — reconciled with `app.js:118-142`)*

**Existing shortcuts are preserved.** The original draft proposed `Ctrl/Cmd+F` and `Ctrl/Cmd+E`; **both conflict with the browser** (`Ctrl/Cmd+F` = find in page, `Ctrl/Cmd+E` = address-bar search) and `Space` = page scroll / button activation. All three are **rejected**.

| Key | Action | Status |
|-----|--------|--------|
| `1` `2` `3` `4` | Jump to workflow step (Set Up / Capture / Review / Event Results) | **existing — keep** (`app.js:126-128`) |
| `/` | Focus search | **existing — keep** (`app.js:131-136`) |
| `?` | Show shortcut help toast | **existing — keep**; update its text to the new table (`app.js:139-141`) |
| `Esc` | Close modal / undo last triage | **existing — keep** (`app.js:119`) |
| `←` `→` | Triage Reviewed / Follow-Up in Capture | **existing — keep** |
| `j` / `k` | Move selection down / up the candidate list in Review | **new** — no browser conflict |
| `Tab` | Move between tabs, then into panel | **new** (standard ARIA tabs pattern) |

All single-key handlers keep the existing guard in `app.js:122-123` that ignores `INPUT` / `TEXTAREA` / `SELECT` targets.

**No shortcut is added for recording voice, Approve, or export.** Recording is consent-gated and an accidental keystroke would capture audio; export is a visible button.

### Screen Reader Announcements

| Action | Announcement |
|--------|-------------|
| Candidate reviewed | "Candidate [Name] marked as reviewed" |
| Candidate skipped | "Candidate [Name] skipped" |
| Export complete | "Export complete. [N] candidates exported." |
| Error | "Error: [message]" |

### Reduced Motion

The original draft specified a blanket `* { animation-duration: 0.01ms !important }` rule. That also kills the **recording indicator**, which is state feedback a recruiter needs, not decoration. The narrowed rule that replaces it is specified once, in **§10**, and the existing blanket blocks at `styles.css:1197, 1466` are replaced by it.

---

## 10. Micro-interactions and Animation Guidelines

### Principles

1. **Purposeful** — Every animation serves a function (feedback, guidance, orientation)
2. **Restrained** — Quick and understated. This is a professional tool used in short bursts, not a consumer app. **Motion must feel responsive, never playful.**
3. **Consistent** — Similar actions have similar animations
4. **Respectful** — Honor `prefers-reduced-motion` by removing decoration, never feedback

### Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Hover states | 150ms | ease-out |
| Button press | 100ms | ease-in |
| **Card swipe commit** | **180ms** | **cubic-bezier(0.2, 0, 0, 1)** |
| Card stack advance | 180ms | cubic-bezier(0.2, 0, 0, 1) |
| Tab indicator slide | 200ms | ease-out |
| Toast enter / exit | 250ms / 180ms | ease-out / ease-in |
| Modal open / close | 220ms / 180ms | ease-out / ease-in |

Anything slower than 250ms reads as lag in a triage tool.

### Micro-interactions *(resolved — no playful motion)*

| Action | Animation |
|--------|-----------|
| Button hover | border/background tint only — **no lift** |
| Button press | 1px inset feel via background shift |
| Card select | border colour shift only — **no scale** |
| **Card swipe** | **translateX + ≤3° rotation, no overshoot, no bounce** |
| Tab indicator | slides horizontally between tabs |
| Toast | slide + fade, no spring |
| Modal | fade + ≤0.98 scale, no bounce |
| Loading | opacity pulse or indeterminate bar — **never a rotating flourish** |
| Recording indicator | **pulse retained** — this is state feedback |

Deliberately removed from the original draft: button `translateY(-1px)` lift, card `scale(1.02)`, error shake, success checkmark draw, and 15° card rotation. All read as playful.

### Card Swipe Animation *(corrected)*

```css
/* Committed swipe — subtle slide, minimal rotation */
@keyframes swipe-commit-left {   /* Reviewed */
  from { transform: translateX(0) rotate(0deg);   opacity: 1; }
  to   { transform: translateX(-115%) rotate(-3deg); opacity: 0; }
}
@keyframes swipe-commit-right {  /* Follow-Up */
  from { transform: translateX(0) rotate(0deg);   opacity: 1; }
  to   { transform: translateX(115%) rotate(3deg);   opacity: 0; }
}

/* Live drag feedback — transform driven directly by pointer position */
.capture-card.is-dragging { transition: none; }
```

During the drag, rotation is capped at 3° and derived from horizontal offset, so the card tracks the finger rather than animating on its own.

### Reduced Motion *(corrected — remove decoration, keep feedback)*

```css
@media (prefers-reduced-motion: reduce) {
  /* Remove nonessential motion */
  .capture-card, .modal, .toast { transition: none !important; animation: none !important; }
  .card-stack__next { transition: none !important; }

  /* Replace animation with an instant state change — the card still leaves */
  .capture-card.is-committed { opacity: 0; transition: opacity 0.01ms !important; }

  /* PRESERVE — necessary state feedback */
  :focus-visible { outline: 2px solid var(--brand) !important; }
  .recording-indicator { animation: pulse 1.2s ease-in-out infinite !important; }
  .loading-bar { animation: none !important; opacity: 0.6 !important; }
  .toast { opacity: 1 !important; }
}
```

**Preserved under reduced motion:** focus rings, the recording indicator, the visible presence of toasts, and the fact that a committed card actually disappears. **Removed:** hover transitions, tab-indicator slide, modal scale, toast slide, and card-stack advance transitions.

---

## 11. Copy / Terminology Audit *(corrected)*

The original audit was built on nav labels that **do not exist in this codebase** ("Candidate Cards", "Event Info", "Analytics"). Real labels are **`Set Up`, `Capture`, `Review`, `Event Results`, `Research Metrics`** (`config.js:150-156`). The audit below is rebuilt against strings that actually appear in the source.

### The governing rule

Copy changes split into two categories, and **only the first is in scope**:

| Category | Meaning | In scope? |
|----------|---------|-----------|
| **A — Presentation** | Case, letter-spacing, separator glyphs, arrow placement. Says the same thing, looks different. | **Yes** |
| **B — Terminology** | Renames domain concepts (flags, provenance, traceability, integrity). | **No — preserved by default** |

Renaming a domain term to sound friendlier is not polish; it desynchronises the UI from `data.js`, `analytics.js` (`FLAG_COUNT = 9`), the recruiter-facing docs, and the research-metrics vocabulary.

### A — Presentation changes (in scope)

| Location | Current | New | Note |
|----------|---------|-----|------|
| `styles.css` | `text-transform: uppercase` × **38 occurrences** | sentence case | Global. This is the single biggest copy change. |
| `styles.css` | letter-spacing on labels | `0` / `normal` | |
| `workflow.js:116` | `Recruiter workflow` | `Workflow` | Group heading only — a hardcoded literal, safe to edit |
| `views.js:1008` | `Back to Analytics` | `Back to event results` | **No view is called "Analytics"** — matches the real nav label `Event Results` |
| `views.js:846,1009` | `Generate Demo Candidates` | `Load demo data` | Clearer intent; keeps the synthetic-data disclosure |
| `views.js:15` | `Grounded Highlights · Accomplishments` | `Accomplishments` | Drops the middle-dot joiner; "grounded" is implied by the per-item source labels |
| `index.html:83-84` | `Candidate Comparison` / `Side-by-Side` | `Compare candidates` / `Compare` | Sentence case, no stacked title + redundant subtitle |
| Capture card | `FROM THE RESUME` | `From the resume` | |
| Capture triage | `Reviewed ←` | `← Reviewed` | Arrow first |
| Empty state (capture) | `No candidates in the system yet.` | `No candidates yet. Import resumes or add someone manually.` | Names the next actions |

### B — Terminology (preserved — change only with explicit approval)

| Location | String | Decision |
|----------|--------|----------|
| `views.js:1998` | `Missing Information Flags` | **Preserve.** Nine flags; `analytics.js` hardcodes `FLAG_COUNT = 9`; README/AGENTS.md mandate "missing-data flags". The original draft's rename to "Missing Info" is **rejected**. Only the *treatment* changes (warmer tone, click-to-jump). |
| `views.js:1999` | `Source Traceability` | **Preserve.** Compliance feature; backs the "all claims cite sources" constraint. |
| `views.js:1973` | `Source Citations` | **Preserve.** Same reason. |
| `views.js:1996` | `Field Provenance` | **Preserve.** Backs `candidate.provenance`; this is also why the tab is named Provenance. |
| `views.js:2004` | `Record Integrity` | **Preserve.** Audit function. The original draft's "Data Quality" is **rejected**. |
| `views.js:1994` | `Extraction Snapshot` | **Preserved — final decision.** Domain terminology is not renamed during this visual redesign. |
| `views.js:1968/1972/2003` | `Voice Notes`, `Transcript`, `Recruiter Notes` | **Preserve.** Already plain. |

### Unchanged on purpose

Nav item labels, their `when` subtitles, and page titles all live in `config.js` and are **left exactly as they are**:

```
1 Set Up          "Before the fair"        -> "Booth Setup"
2 Capture         "During the conversation" -> "Capture"
3 Review          "End of day"             -> "End-of-Day Review"
4 Event Results   "After the fair"         -> "Event Results"
  Research Metrics "Controlled study"       -> "Research Metrics"
```

These are already plain-language. Nothing needs fixing, and editing them would require touching `config.js` for no benefit.

### Empty / error states

Only new copy — these strings do not exist yet:

| Case | New copy |
|------|----------|
| No filter matches | No candidates match your filters. |
| Nothing selected | Select a candidate to see their details. |
| No activity | No activity yet. |
| No search results | No results for "…" |
| Export failed | Export failed. Try again. |
| Resume upload failed | That file could not be read. Try a different PDF. |

### Confirmation dialogs

Only where destructive or irreversible. Existing confirm text is left alone. New: delete candidate, reset event, overwrite an approved snapshot.

---

## 12. Screen-by-Screen Changes *(corrected)*

Rows marked ~~struck~~ were already implemented and are **not** work.

### Capture

| Element | Current | New |
|---------|---------|-----|
| Card stack | Absolutely positioned, 3 visible | Normal flow, `transform` for swipe |
| Card content | All at once | Progressive — name → skills → flags always visible; rest behind in-card expand (§7) |
| Card borders | Colored top border (3px) × **6 occurrences** | Shadow + subtle border |
| Right column | Floating white card | Warm surface panel |
| Triage buttons | Bottom of page | **Sticky** to the left column, never scrolls away |
| Swipe hint | Opacity 0.55 | Full opacity |
| Voice memo | Basic widget | Waveform visualization |
| Missing flags | Banner at bottom | **Always-visible**, inline, click-to-jump |

### Event Results (analytics)

| Element | Current | New |
|---------|---------|-----|
| Stat cards | Colored top border | Large numbers, subtle labels |
| Activity feed | Table format | Visual list with status dots |
| Missing data | Grid with counts | Horizontal bars |
| Layout | Dense | More whitespace |

### Review (single screen)

| Element | Current | New |
|---------|---------|-----|
| ~~Detail panel~~ | ~~Modal~~ | ~~Two-panel~~ — **already a panel; no change** |
| ~~Filters~~ | ~~Hidden~~ | ~~Visible~~ — **already visible; no change** |
| ~~Compare~~ | ~~Modal~~ | ~~Side-by-side panel~~ — **already side-by-side modal; no change** |
| Sections | One long scroll, 11 sections | **4 tabs** — Summary / Resume / Notes / Provenance (§5) |
| Tab switching | n/a | **Visibility toggle only**, never re-render (§5) |
| Actions | In header | Sticky action row above the tabs |
| Section labels | 38 all-caps rules + middle-dots | Sentence case (§11-A) |

### Booth Setup (kiosk / QR poster)

| Element | Current | New |
|---------|---------|-----|
| Print handling | `body * { visibility: hidden }` in `styles.css:1571` | **Dedicated print stylesheet** removing chrome properly |
| Print button | Hidden by the print rules themselves | Visible, usable |
| QR code | Small | Large, prominent |
| Event info | Text | Card with logo |

### Research Metrics

| Element | Current | New |
|---------|---------|-----|
| Metric cards | Colored borders | Clean, large numbers |
| Per-recruiter table | Expand/collapse (`<details>`) | Simple table |
| Export | Hidden | Visible button (**CSV preserved** — see below) |

**Export is preserved.** `TIQ.exportCsv` (`components.js:179`) and `TIQ.exportJson` (`components.js:192`), plus their loading variants `exportCsvLoading` / `exportJsonLoading` (`components.js:272,284`), keep working exactly as they do. Export **is not** a view — there is no export route and none will be added. Restyling the existing buttons only.

### Candidate Intake (candidate-form.html)

| Element | Current | New |
|---------|---------|-----|
| Layout | Generic form | Mobile-first, grouped sections |
| Progress | None | Progress indicator |
| Resume upload | `TIQ.renderDropZone` (`components.js:94`, already exists) | Restyle existing drop zone — **do not rebuild** |
| Submit | Button | Full-width, prominent |
| Confirmation | None | Success screen |

This is a **separate page** (`candidate-form.html`, reached by QR code), not a route. It is in scope for restyling only.

### Navigation

| Element | Current | New |
|---------|---------|-----|
| Nav grouping | **Already exists** (`workflow.js:116`) | Shorter group heading `Workflow` |
| Sidebar | `border-right: 3px solid yellow` (`styles.css:165`) | Removed |
| Sidebar width | `var(--sidebar-w)` | ~200–220px, readability first |
| Active state | Colored left border | Subtle background |
| Item labels | Plain language already | **Unchanged** (§11-B) |
| Event card | **Already built** (`index.html:27-35`) | Restyle only |

### Already done — removed from scope entirely

Skip link (`index.html:14`) · focus-visible rings (`styles.css`) · `role="dialog"` compare modal · `role="status"` connection banner · skeleton loading overlays · nav grouping · sidebar event card · `TIQ.renderDropZone` · `TIQ.renderMetricsCards` · `TIQ.skeleton`.

### Explicitly out of scope

Dead `renderCandidateReview` / `initCandidateReview` block (`views.js:2260-2404`, shadowed by aliases) · unused `TIQ.renderAuditTrailList` (`components.js:135`, never called) · the whole business-logic layer. All three are recorded for a future cleanup pass.

---

## 13. Implementation Plan *(corrected)*

Phases are sequential. Each ends at a state you can eyeball, so visual diffs stay attributable.

**Rule:** after **every** phase, bump the `?v=N` cache-buster for each file touched — in `index.html` *and* `candidate-form.html`. A missed bump serves stale JS and has shipped as a real bug before. Current values: `styles.css?v=26`, `config.js?v=20`, `data.js?v=20`, `workflow.js?v=21`, `analytics.js?v=20`, `components.js?v=20`, `skill-icons.js?v=20`, `views.js?v=23`, `app.js?v=21`.

Run `node tests/<name>.test.js` after each phase (12 files in `tests/`). The tests cover logic, not visuals, so they should stay green throughout — a red test means business logic was disturbed.

### Phase 1 — Design foundation
1. Rewrite `:root` tokens in `styles.css` (new palette, IBM Plex Sans scale, radius, shadow).
2. Update `fontsUrl` at `config.js:41` and the fallback copy at `index.html:10`. **Only `config.js` edit in the whole project.**
3. Strip `text-transform: uppercase` (38 sites) and letter-spacing on labels.
4. Bump `styles.css?v=`.

*Ship check: the app still works, reads IBM Plex Sans, labels are sentence case.*

### Phase 2 — Shell
5. Sidebar: drop `border-right: 3px solid var(--jbh-yellow-accent)` (`styles.css:165`), set width ~200–220px, restyle nav items and active state.
6. Topbar restyle.
7. `workflow.js:116` — group heading `Recruiter workflow` → `Workflow`. Restyle nav item markup only; **labels unchanged**.
8. Restyle the existing event card (`index.html:27-35`).

*Ship check: shell is warm-paper; nav reads correctly; nothing broken.*

### Phase 3 — Capture (priority)
9. Card stack → normal flow; keep `transform`-driven swipe, cap rotation at 3°.
10. Card: progressive disclosure, flags always visible, no colored top border.
11. **Triage bar sticky to the left column.**
12. Right column → warm surface panel.
13. In-card "More from this candidate" expand with its own state var.

*Ship check: triage is reachable without scrolling; swipe commits in 180ms; keyboard triage still works.*

### Phase 4 — Review tabs (the risky phase)
14. Add `TIQ.renderTabs` to `components.js` — ARIA tabs pattern, bottom-border active indicator, sliding indicator.
15. Restructure the detail panel into 4 tabs per **§5**. **11 sections, 11 destinations.**
16. Tab switching toggles visibility only — **must not re-render** (protects `#snapshotEdit`, `#aiNotes`, `#aiIntegrity`).
17. Sticky action row above the tabs.
18. Apply §11-A copy changes across `views.js`; §11-B terms untouched. **Remove the "Decision Hub" kicker (`views.js:1799`) — it duplicates the page title.**

*Ship check: no section lost; notes survive a tab click; Approve / Follow Up / Regenerate unaffected; compare still works.*

### Phase 5 — Remaining views
19. Event Results: stat cards, activity feed, missing-data bars.
20. Research Metrics: metric cards, flatten the `<details>` table; **remove the "Research Console" kicker (`views.js:2540`) — it duplicates the page title.**
21. Booth Setup: dedicated `print.css`; remove `styles.css:1571` `visibility` hack; restore a working Print button.
22. `candidate-form.html`: sections, progress, restyle the **existing** drop zone.

*Ship check: kiosk prints cleanly with no chrome; intake form usable one-handed.*

### Phase 6 — Motion, accessibility, new components
23. New `TIQ.renderProgressBar` — reuse the existing loading paths (`exportCsvLoading`, skeleton) and bulk-PDF import.
24. Replace the blanket reduced-motion blocks (`styles.css:1197, 1466`) with the narrowed rule from §10.
25. Apply §10 timing and the resolved swipe motion; delete the playful animations.
26. **No new keyboard shortcuts.** Update only the `?` help toast text (`app.js:139-141`) if copy changed. The existing set (`1`–`4`, `/`, `?`, `Esc`, `←`/`→`) is preserved as-is.
27. Responsive pass — existing breakpoints are 480 / 700 / 768 / 1024 / 1100px; **reuse them, do not invent new ones**.
28. Lighthouse / keyboard / reduced-motion verification.

*Ship check: no animation reads as playful; all shortcuts work with no browser conflict.*

---

## Files to Modify *(corrected)*

| File | Changes | Phase |
|------|---------|-------|
| `styles.css` | Token rewrite, 38 all-caps removals, sidebar, shell, capture, all view styles, motion | 1–6 |
| `print.css` | **New** — dedicated kiosk print stylesheet; replaces `styles.css:1571-1583` | 5 |
| `views.js` | Capture layout, review tabs (§5), copy (§11-A) | 3–5 |
| `components.js` | **New** `TIQ.renderTabs`, **new** `TIQ.renderProgressBar`; restyle card/chip/button/toast | 4, 6 |
| `workflow.js` | Group heading, nav item markup **and styling only** — not labels | 2 |
| `index.html` | Font fallback URL, cache-busters, stylesheet link for `print.css` | 1–2 |
| `app.js` | `?` help toast text only. **Not nav labels** (those are in `config.js`) and **no new shortcut handlers** | 6 |
| `candidate-form.html` | Form sections, progress, drop-zone restyle, cache-busters | 5 |
| `config.js` | **`fontsUrl` only** (`config.js:41`) | 1 |

## Do Not Modify

| File | Reason |
|------|--------|
| `data.js` | Candidate schema, persistence, resume parser, provenance, audit, missing flags |
| `analytics.js` | Metric computation, `FLAG_COUNT = 9` |
| `skill-icons.js` | Icon registry |
| `qrcode-generator.js` | QR rendering |
| `config.js` (beyond `fontsUrl`) | Nav labels, `when` subtitles, page titles, `defaultView`, seed data |
| `tests/**` | Cover logic, not visuals — must stay green |
| `app.py`, `requirements.txt` | Unrelated Streamlit dashboard |
| `talent-iq/` | Unrelated Next.js experiment |

## Final Decisions (resolved — no open items)

| # | Decision | Outcome |
|---|----------|---------|
| 1 | `Extraction Snapshot` terminology | **Keep as-is.** No domain/workflow terminology is renamed during this visual redesign. |
| 2 | Dead `renderCandidateReview` code | **Defer deletion.** Unrelated code cleanup is excluded from this redesign. |
| 3 | `renderAuditTrailList` | **Do not surface.** Unused functionality is not exposed as part of a visual redesign. |
| 4 | Redundant section kickers | **Remove** `"Decision Hub"` (`views.js:1799`, Phase 4 item 18) and `"Research Console"` (`views.js:2540`, Phase 5 item 20) where they merely duplicate the page title. |
| 5 | `j` / `k` navigation | **Do not add.** The existing shortcut set is preserved; no new shortcuts without usability evidence. Phase 6 item 26 updates only the `?` help toast text. |

## Out of Scope — Noted, Not Done

- Dead `renderCandidateReview` / `initCandidateReview` (`views.js:2260-2404`) — shadowed by aliases at 2413/2417. **Left in place**; deletion deferred to a separate cleanup task (decision 2).
- `TIQ.renderAuditTrailList` (`components.js:135`) — defined, never called. **Not surfaced** (decision 3); a feature decision for later, not a design one.
- Renaming domain or workflow terminology (§11-B) for visual polish (decision 1).
- Business logic, data structures, analytics calculations, provenance, audit, working workflows.
