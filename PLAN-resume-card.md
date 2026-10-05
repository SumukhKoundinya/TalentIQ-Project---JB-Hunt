# Plan — Make the Candidate Card representative of the Resume and Candidate

**Status:** awaiting approval
**Scope chosen:** Structured resume section on the capture card **and** the AI Review detail panel.

---

## 1. Problem

Resume data is ingested well but almost never displayed.

| What happens | Where |
|---|---|
| PDF → `extractResumeData()` → `parsedResume` {skills, experience, projects, education, gpa, certifications, contact, rawText} | `data.js:682-694` |
| `applyParsedData()` backfills 9 scalar fields, only-if-empty | `data.js:1112-1125` |
| **Card renders 3 integers** — `POSITIONS 2`, `PROJECTS 1`, `CERTS 1` — never *which* ones | `views.js:329-335` |
| **Detail panel has zero resume content** — no filename, no parsed fields, no raw text | `views.js:1447-1502` |
| Resume filename / scan status never renders anywhere reachable | only `views.js:1505` (integrity meter) |
| `experience[]`, `projects[]`, `certifications[]`, `education[]` are persisted but rendered nowhere as data | no consumer |
| No provenance — a resume-derived GPA is indistinguishable from a recruiter-typed one | `applyParsedData` is silent |
| Resume raw text is an unannotated `<pre>` dump, capture-only | `views.js:495, 511-514` |
| `data.js:1018` hard-codes `" — intake form"` even when school/major came from the resume | `data.js:1014-1025` |

A recruiter sees *how much* resume exists, never *what is in it*, and never *which fields came from it*.

---

## 2. Design decisions (locked)

| Decision | Choice |
|---|---|
| Card structure | **Partitioned by source** — tinted `FROM THE RESUME` band, white `FROM THE CONVERSATION` band, gap flags at the bottom |
| Overflow handling | **Cap + expand-in-place.** Experience capped at 2 roles behind `[+N ▾]`, certs capped at 2, skills keep existing `+N` chips. **No vertical scrolling** — preserves the swipe physics (`WIREFRAMES.md:303-317`, `touch-action: none` at `styles.css:797`) |
| Provenance marking | **Tinted band + small dots.** `●R` resume-sourced, `●F` form/recruiter-sourced, `○` unverified. Legend lives in the detail panel |
| Detail panel | New `Resume` section between *AI-Generated Snapshot* and *Missing Information Flags* |
| Drawer | Resume tab upgraded from raw `<pre>` to a **Structured / Raw** toggle |
| Card width | Stays `420px` (grid track at `styles.css:587`) — no layout change |

---

## 3. Wireframes

### 3.1 Capture card — parsed resume present

```
┌──────────────────────────────────────────────┐
│ ⬤ SCANNED  2:14 PM                          │  ← RESUME BAR (new)
│ 📄 maya_williams_resume.pdf                  │     filename + state, always visible
│    15 skills · 2 roles · 1 cert · GPA 3.75   │     extraction tally
├──────────────────────────────────────────────┤
│ ┌────┐                                       │
│ │ MW │  Maya Williams                        │  ← header (unchanged structure)
│ └────┘  Univ. of Arkansas · Computer Science │     "···" button → opens resume drawer
│         Grad May 2026 · GPA 3.75      ●R     │     provenance dot on GPA
├══════════════════════════════════════════════┤
│ FROM THE RESUME                      ●R ●R   │  ← BAND 1, tinted background
│──────────────────────────────────────────────│
│ EDUCATION                                    │
│   B.S. Computer Science · UARK · May 2026    │
│                                              │
│ EXPERIENCE                        2 of 5     │  ← replaces "POSITIONS 2"
│ ┌ Software Engineering Intern      Summer '25│
│ │ Walmart Technology · Bentonville, AR       │
│ └ Data Analyst Co-op                Fall '24 │
│   UARK · Fayetteville, AR                    │
│              [+3 earlier roles ▾]            │  ← expands in place
│                                              │
│ CERTIFICATIONS                               │  ← replaces "CERTS 1"
│   AWS Certified Cloud Practitioner           │
│                                              │
│ SKILLS                                       │
│  LANGUAGES   ⬚Python ⬚Java ⬚SQL        +3  │  ← existing icon rows, moved
│  FRAMEWORKS  ⬚React ⬚Node ⬚Pandas           │     into the resume band
│  DATA        ⬚Tableau ⬚Power BI              │
├──────────────────────────────────────────────┤
│ FROM THE CONVERSATION                        │  ← BAND 2, white
│──────────────────────────────────────────────│
│ ★ Grounded AI Highlights                     │
│   "Shipped an ETL pipeline processing 2M     │
│    rows; led a 4-person student team."       │
│   source: resume ─────────────────────────   │
│                                              │
│ 🔴 Voice Memo   00:00   ▮ ▮▮ ▮   ●           │
├──────────────────────────────────────────────┤
│ ⚠ Work Auth Unspecified · No Recruiter Notes │  ← gap flags (unchanged)
└──────────────────────────────────────────────┘
```

### 3.2 Capture card — no resume (all 7 seed candidates hit this today)

```
┌──────────────────────────────────────────────┐
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐│
│   NO RESUME ATTACHED              [Scan ▸]  │  ← dashed, actionable →
│   Form entries only — nothing verified      │    `#drawerResumeScan`
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘│
│ ┌────┐                                       │
│ │ MW │  Maya Williams                        │  ← header renders normally,
│ └────┘  Univ. of Arkansas · Computer Science │     but shows ○ (not ●R)
│         Grad May 2026 · GPA 3.75        ○    │
├══════════════════════════════════════════════┤
│ FROM THE RESUME                              │
│──────────────────────────────────────────────│
│   Nothing extracted yet. Scan a PDF to       │
│   populate education, experience, certs      │
│   and skills automatically.                  │
├──────────────────────────────────────────────┤
│ FROM THE CONVERSATION                        │
│   ★ "Met at booth — strong on data viz."     │
│     source: recruiter notes                  │
│   🔴 Voice Memo   00:12   ▮ ▮   ●            │
├──────────────────────────────────────────────┤
│ ⚠ Resume Not Scanned · ⚠ GPA Missing        │
└──────────────────────────────────────────────┘
```

### 3.3 AI Review detail panel — new Resume section

```
┌─ Detail panel ────────────────────────────────┐
│ ┌────┐ Maya Williams                         │
│ │ MW │ TQ-2401 · UARK                        │
│ └────┘ BS in Computer Science                │
│ [Approve] [Follow Up] [Regenerate Summary]   │
│ ──────────────────────────────────────────── │
│ ★ AI-Generated Snapshot                      │
│ "Maya is a Computer Science student at UARK" │
│ ──────────────────────────────────────────── │
│ 📄 RESUME                                    │  ← NEW SECTION
│ ┌───────────────────────────────────────────┐│
│ │ ● Scanned Sep 25, 2026 · 2:14 PM         ││
│ │ maya_williams_resume.pdf                  ││
│ │ [View raw text]  [Rescan]                 ││
│ ├───────────────────────────────────────────┤│
│ │ EDUCATION                                 ││
│ │ B.S. Computer Science                     ││
│ │ University of Arkansas · Expected May 2026││
│ ├───────────────────────────────────────────┤│
│ │ EXPERIENCE                      5 found   ││
│ │ ▸ Software Engineering Intern             ││
│ │   Walmart Technology · Summer 2025        ││
│ │ ▸ Data Analyst Co-op · Fall 2024          ││
│ │   [Show 3 more ▾]                         ││
│ ├───────────────────────────────────────────┤│
│ │ PROJECTS · CERTIFICATIONS                 ││
│ │ Route Optimizer · AWS Cloud Practitioner  ││
│ ├───────────────────────────────────────────┤│
│ │ CONTACT                                   ││
│ │ maya@uark.edu · (479) 555-0142            ││
│ └───────────────────────────────────────────┘│
│ ──────────────────────────────────────────── │
│ ⚠ Missing Information Flags                  │
│ [Work Auth Unspecified] [No Recruiter Notes] │
│ ──────────────────────────────────────────── │
│ Source Traceability · Source Citations       │
│ Voice Notes · Transcript · Recruiter Notes   │
│ Record Integrity                             │
└──────────────────────────────────────────────┘
```

### 3.4 Capture drawer — Resume tab

```
┌─ Resume | Voice | Notes ──────────────┐
│ [Structured ◉]        [Raw text ○]    │
│                                       │
│ EDUCATION                             │
│  B.S. Computer Science                │
│  University of Arkansas  ← highlighted│
│  Expected May 2026       ← highlighted│
│                                       │
│ EXPERIENCE                            │
│  Software Engineering Intern          │
│  Walmart Technology     ← highlighted │
│  May 2025 – Aug 2025    ← highlighted │
│  • Built ETL pipeline…                │
│                                       │
│ SKILLS (15)                           │
│  [Python][SQL][React][Tableau]…       │
│                                       │
│ legend: ■ extracted from PDF          │
└───────────────────────────────────────┘
```

---

## 4. Implementation steps

### Step 1 — `data.js`: resume state normalizer + provenance

**1a.** Add next to `getMissingFlags` (`data.js:1288`):

```js
TIQ.resumeInfo = function(c) {
  var r = c.resumeUpload;
  if (typeof r === 'string' && r) return { name: r, state: 'legacy', parsedAt: '', error: '' };
  if (r && typeof r === 'object') {
    return { name: r.name || 'resume.pdf',
             state: r.parsedAt ? 'scanned' : (r.parseError ? 'failed' : 'pending'),
             parsedAt: r.parsedAt || '', error: r.parseError || '' };
  }
  return { name: '', state: 'missing', parsedAt: '', error: '' };
};
```

This normalizes the polymorphic `resumeUpload` (string at `config.js:167`, object at `data.js:1133`, `null` at `views.js:664`, `""` at `views.js:918`).

**1b.** In `applyParsedData` (`data.js:1112-1125`), write provenance for every field it fills:

```js
candidate.provenance = candidate.provenance || {};
if (!candidate.gpa && parsed.gpa) { candidate.gpa = parsed.gpa; candidate.provenance.gpa = 'resume'; }
/* …same for firstName, lastName, email, phone, graduationDate,
      university, major, skills… */
```

**1c.** Add helper:

```js
TIQ.fieldSource = function(c, field) {
  return (c.provenance && c.provenance[field]) || 'form';
};
```

No migration for existing stored state — unset fields honestly render `○` (unverified).

### Step 2 — `views.js`: card builders (`_buildCardHtml`, `views.js:309-454`)

- **New `TIQ.views._resumeBarHtml(c)`** — renders one of five states from `TIQ.resumeInfo`: `scanned` (green dot + timestamp + filename + extraction tally), `pending` (amber "scan in progress"), `failed` (red + `error`), `legacy` (filename known, "not scanned" + Scan button), `missing` (dashed `NO RESUME ATTACHED` block with Scan CTA).
- **New `TIQ.views._resumeBandHtml(c)`** — tinted band:
  - `EDUCATION` ← `parsedResume.education[0]`
  - `EXPERIENCE` ← `parsedResume.experience`, **cap 2**, `[+N earlier roles ▾]` when more
  - `CERTIFICATIONS` ← `parsedResume.certifications`, **cap 2**, `+N` chip
  - `SKILLS` ← existing `skillGroups` / `skillMoreChip` logic moved verbatim from `views.js:337-408`
- **New `TIQ.views._conversationBandHtml(c)`** — wraps existing highlights (`views.js:410-425`) and voice memo (`views.js:427-440`).
- **Remove** the count-only `metaFacts` strip (`views.js:330-335`) — GPA moves into the header line as `Grad May 2026 · GPA 3.75` + provenance dot; counts are superseded by the real lists.
- **Header** (`views.js:314-325`) gains a `···` button (`data-open-resume`) that activates the drawer's Resume tab, plus provenance dots via `TIQ.fieldSource`.
- **Return order:** `resumeBar + header + resumeBand + conversationBand + alert`.

**Expander state:** `TIQ.views._resumeExpanded = {}` keyed by `c.id`. Toggled by a delegated handler added in `initCaptureEvents` (`views.js:744`, alongside the existing `data-drawer-tab` branch at `views.js:807`), then `rerender()`.

### Step 3 — `styles.css`: new primitives

After the card block (`styles.css:1690`):

- `.resume-bar`, `.resume-bar--missing` (dashed border, `--jbh-border`)
- `.resume-band` — tinted `background: var(--jbh-sky-50)`, `.band-label` uppercase kicker
- `.prov-dot`, `.prov-dot--resume`, `.prov-dot--form`, `.prov-dot--unknown` + `.prov-legend`
- `.resume-exp-row`, `.resume-expander`
- `.resume-empty` (no-resume copy block)
- `.drawer-structured` / `.mark-extracted` for the highlighted drawer view
- Detail-panel `.resume-section` styles

Bump `styles.css?v=` and `views.js?v=` in `index.html`.

### Step 4 — `views.js`: detail panel Resume section

Add `TIQ.views._renderResumeSection(c)` and insert it at `views.js:1493`, between the Snapshot and Missing-Flags sections. Content mirrors §3.3: scan status row, filename, `[View raw text]` (switches the capture drawer + navigates) and `[Rescan]`, then Education / Experience (cap 2 + expander) / Projects+Certs / Contact, with the provenance legend footnote.

Also wire `[Rescan]` to the existing `#drawerResumeScan` flow (`views.js:845-868`).

### Step 5 — `views.js`: drawer Resume tab

Replace the raw `<pre>` at `views.js:511-514` with a toggle (`data-resume-view="structured|raw"`) rendered from `parsedResume` — education, experience (with description bullets), projects, certifications, skills. Raw mode keeps today's `<pre>` as fallback. Bind the toggle next to the `data-drawer-tab` handler (`views.js:807`). Keep `rescanHtml` (`views.js:497-503`) for the un-parsed case.

### Step 6 — `data.js`: fix citation attribution

`data.js:1014-1025` hard-codes `" — intake form"` for school/major even when `data.js:1009-1010` pulled them from `parsedResume.education[0]`. Change the pushed citation to use `TIQ.fieldSource(c, 'university')` / `TIQ.fieldSource(c, 'major')` → `" — resume"` or `" — intake form"`.

Also make the summary sentence include `graduationDate` when it only came from the resume (currently `data.js:1011` reads `c.graduationDate` but the citation claims intake).

### Step 7 — tests

New `tests/resume-card.test.js` (follow `tests/card-density.test.js` pattern — `loadApp(['components.js','skill-icons.js','views.js'])`, plain `assert`, run via `node tests/resume-card.test.js`):

1. `resumeInfo` returns `scanned` / `pending` / `failed` / `legacy` / `missing` for the four `resumeUpload` shapes
2. `applyParsedData` writes `provenance.<field> = 'resume'` for each field it backfills, and leaves pre-existing values as `form`
3. `_buildCardHtml` renders an experience **title** (not just a count) when `parsedResume.experience` is populated
4. `_buildCardHtml` renders the dashed no-resume block when `resumeUpload` is `null`
5. Expander cap: 5 experiences → 2 rows + `+3 earlier roles`
6. `_renderDetailPanel` contains a `Resume` section with the filename
7. Citation fix: resume-sourced school produces `" — resume"` in `traceability`

**Baseline:** 10/11 existing tests pass today. `tests/transcript-hydrate.test.js` has a **pre-existing** failure (`FAIL: preserves existing skills, no dup`) unrelated to this work — do not treat as a regression; leave as-is or note it.

### Step 8 — housekeeping

- `CHANGELOG.md` — entries under `[Unreleased]` → `Added` / `Changed` (AGENTS.md requirement)
- Bump `styles.css?v=` and `views.js?v=` in `index.html`

---

## 5. Verification

```bash
for f in tests/*.test.js; do printf "%-40s" "$f"; node "$f" >/dev/null 2>&1 && echo OK || echo FAIL; done
```

Manual (per AGENTS.md run command — note the app is served from the **workspace root**, not `TalentIQ-Project---JB-Hunt/`):

```bash
python -m http.server 8000   # from /Users/nirmay/Desktop/jb hunt
```

Check: capture deck with a scanned candidate, a seed candidate (no `parsedResume`), a bulk-imported candidate (`resumeUpload: null`), drawer Structured/Raw toggle, AI Review detail panel, narrow viewport (~520px min-height) for overflow, and swipe gestures still working.

---

## 6. Out of scope (explicitly not doing)

- Side-by-side form-vs-resume compare view (declined)
- Per-field text chips instead of dots (declined)
- PDF preview / download — **impossible**: the PDF bytes are never persisted, only `{name, type, parsedAt}` + extracted `rawText` (`data.js:1133`, `data.js:1158-1224`). Requires an IndexedDB blob store like `TIQ.AudioDB`.
- `keySkills.join` TypeError in the compare modal for bulk-imported candidates (`views.js:1640`)
- CSV export missing resume fields (`components.js:179-183`)
- Seed candidates claiming `source: resume` with no `parsedResume` behind it (`config.js:167,175-184`)
- Search over resume content (`views.js:1439`)
- Wiring `TIQ.refreshParsedCandidate` (`data.js:1233`) into startup
