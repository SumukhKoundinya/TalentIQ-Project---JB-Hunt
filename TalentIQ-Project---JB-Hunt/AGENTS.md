# AGENTS.md — AI Agent Orientation

> Quick reference for AI agents working on this project. Read this first.

## What Is This?

**TalentIQ** is an AI-assisted career fair candidate capture and review platform for J.B. Hunt. It's NOT automating hiring — it improves information quality at the point of contact during career fairs.

**Sponsor:** Carl Pegue, J.B. Hunt (carl.pegue@jbhunt.com)

**Capstone project** — University recruiting tool for career fair workflows.

## How To Run

```bash
cd "/Users/nirmay/Desktop/jb hunt/TalentIQ-Project---JB-Hunt"
python -m http.server 8000
# Open http://localhost:8000
```

No build step. No npm. No dependencies. Just static files served by Python.

## File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | ~122 | SPA shell — sidebar, topbar, view container |
| `styles.css` | ~489 | Design system + all view styles |
| `app.js` | ~112 | Router, init, global event listeners |
| `data.js` | ~326 | Candidate schema, seed data, helpers, persistence |
| `views.js` | ~738 | All view renderers (Overview, Intake, Capture, AI Review, Candidate Review) |
| `components.js` | ~166 | Reusable components (toast, cards, export, audio recorder) |

## Architecture

- **SPA with JS router** — All views in one `index.html`, toggled via `data-view` attributes
- **No build system** — Vanilla JS + CSS, loaded via `<script>` tags
- **No ES modules** — Avoids CORS issues with `python -m http.server`
- **Global namespace** — Everything under `window.TIQ` (data, views, components, router, app)

## Key Conventions

### Code Style
- Vanilla JavaScript — no frameworks, no transpilation
- Functions exposed on `window.TIQ.*` namespace
- CSS custom properties for design tokens (colors, spacing, typography)
- All state in `localStorage` + `IndexedDB` for audio blobs
- XSS prevention: `escapeHtml()` and `escapeAttr()` on all dynamic content

### Data Flow
```
views.js (render) → user action → components.js (UI) → data.js (state) → localStorage
```

### Candidate Status Flow
```
New → Reviewed → Follow-Up / Interview Requested → Closed
```

### AI Constraints (CRITICAL — never violate)
- **NO** scoring, ranking, or auto-rejection
- **NO** protected trait inference (race, gender, age, disability)
- **All** summaries require recruiter approval
- **All** AI claims must cite sources (traceability array)
- **Missing flags** replace fit percentages

## Views (7 total)

1. **Overview** — Analytics dashboard (computed from real data)
2. **Candidate Intake** — Mobile form for students (QR code access)
3. **Recruiter Capture** — Card deck for 3-min career fair conversations
4. **AI Review** — End-of-day triage (filterable list + detail panel)
5. **Candidate Review** — Detailed single-candidate view
6. **QR Poster** — Print-friendly QR code for career fair booths
7. **Research Metrics** — Controlled study metrics dashboard

## Design System

- **Yellow:** `#FEDB00` (J.B. Hunt brand)
- **Blue:** `#005DBA` (primary actions)
- **Digital Black:** `#211F20` (sidebar, text)
- **Icicle Blue:** `#E2E8F0` (backgrounds, borders)

See `BRANDING.md` for full design system reference.

## Common Tasks

### Adding a new view
1. Add render function in `views.js` (e.g., `renderNewView()`)
2. Add nav link in `index.html` sidebar with `data-view="new-view"`
3. Add route case in `app.js` router
4. Add placeholder div in `#viewContainer`
5. Style in `styles.css`

### Modifying candidate fields
1. Update schema in `data.js` seed data
2. Update `getMissingFlags()` if it's a required field
3. Update intake form in `views.js` if it's user-input
4. Update AI summarizer templates if it affects summary generation

### Adding evaluation metrics
1. Add metric type to `logMetric()` calls
2. Add to the metrics export in Task 8
3. Update Research Metrics dashboard if needed

## Important Files to Read

- `REDESIGN-PLAN.md` — Full implementation plan with 8 tasks
- `BRANDING.md` — Design system reference
- `README.md` — Human-readable project documentation
