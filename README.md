# TalentIQ — AI-Assisted Career Fair Platform

> A J.B. Hunt capstone project for improving candidate information quality at career fair touchpoints.

## Overview

TalentIQ is NOT an hiring automation tool. It's an AI-assisted platform that improves the **quality of information** captured during career fair conversations between recruiters and candidates. The system handles candidate intake, recruiter capture with audio recording, AI-powered summarization with source citations, and an end-of-day review dashboard.

**Sponsor:** Carl Pegue, J.B. Hunt (carl.pegue@jbhunt.com)

## Quick Start

```bash
cd "/Users/nirmay/Desktop/jb hunt/TalentIQ-Project---JB-Hunt"
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

No build step. No npm. No dependencies. Just static files.

## Features

| Feature | Description |
|---------|-------------|
| **Candidate Intake** | Mobile-first form for students. Access via QR code at career fair booths. Target: < 30 seconds to complete. |
| **Recruiter Capture** | Card deck for 3-minute career fair conversations. Audio recording with offline fallback. Quick status assignment with undo. |
| **AI Summarization** | Template-based summary generation with source citations and missing-data indicators. No API dependency. |
| **Human Verification** | Edit-and-approve workflow. All AI summaries require recruiter approval before use. |
| **Review Dashboard** | Filterable candidate list with comparison, traceability highlighting, and CSV/JSON export. |
| **QR Code Generation** | Print-friendly QR posters for career fair booth display. Pure canvas-based, no library. |
| **Research Metrics** | Controlled study framework: baseline vs. treatment comparison for evaluation. |
| **WCAG 2.2 AA** | Full accessibility: keyboard navigation, focus indicators, contrast ratios, ARIA labels. |

## Architecture

```
┌─────────────────────────────────────────────────┐
│  index.html  (SPA shell)                        │
│  ├── Dark sidebar with JBH branding             │
│  ├── Topbar with recruiter picker               │
│  └── #viewContainer (7 views)                   │
├─────────────────────────────────────────────────┤
│  app.js       (Router + init)                   │
│  data.js      (Schema + state + AI summarizer)  │
│  views.js     (7 view renderers)                │
│  components.js (Cards, modals, audio, toasts)   │
├─────────────────────────────────────────────────┤
│  styles.css   (Design system + all styles)      │
└─────────────────────────────────────────────────┘
```

- **SPA with JS router** — views toggled via `data-view` attributes
- **No build system** — vanilla JS + CSS, `<script>` tags
- **No ES modules** — avoids CORS with `python -m http.server`
- **Global namespace** — everything under `window.TIQ`

## Views

| # | View | Purpose |
|---|------|---------|
| 1 | Overview | Analytics dashboard (stats computed from real data) |
| 2 | Candidate Intake | Mobile form for student submissions |
| 3 | Recruiter Capture | Card deck for career fair conversations |
| 4 | AI Review | End-of-day triage with filters and comparison |
| 5 | Candidate Review | Detailed single-candidate view |
| 6 | QR Poster | Print-friendly QR code for booths |
| 7 | Research Metrics | Controlled study metrics dashboard |

## Data Storage

- **localStorage** — Candidate state, metrics, study sessions
- **IndexedDB** — Audio blobs (too large for localStorage)
- **No backend** — All data is synthetic/seed data

### localStorage Keys

| Key | Contents |
|-----|----------|
| `talentiq_state_v1` | Candidates, active recruiter, selected candidate |
| `talentiq_eval_metrics_v1` | Evaluation metrics for research study |
| `talentiq_study_sessions_v1` | Controlled study session data |

## AI Constraints

These are non-negotiable requirements from the project proposal:

- **NO** scoring, ranking, or auto-rejection of candidates
- **NO** protected trait inference (race, gender, age, disability, etc.)
- **All** AI summaries require recruiter approval
- **All** AI claims must cite sources (traceability array)
- **Missing data flags** replace fit percentages
- All state changes logged with recruiter ID, timestamp, and time-to-complete

## Design System

J.B. Hunt corporate branding:

| Color | Hex | Usage |
|-------|-----|-------|
| Yellow | `#FEDB00` | Brand accent, highlights |
| Blue | `#005DBA` | Primary actions, buttons |
| Digital Black | `#211F20` | Sidebar, text |
| Icicle Blue | `#E2E8F0` | Backgrounds, borders |

See `BRANDING.md` for the full design system reference.

## Project Files

| File | Description |
|------|-------------|
| `index.html` | SPA shell |
| `styles.css` | Design system + view styles |
| `app.js` | Router + initialization |
| `data.js` | Candidate schema, seed data, helpers, AI summarizer |
| `views.js` | All view renderers |
| `components.js` | Reusable UI components |
| `AGENTS.md` | AI agent orientation |
| `BRANDING.md` | Design system reference |
| `REDESIGN-PLAN.md` | Full implementation plan (8 tasks) |
| `README.md` | This file |

## Evaluation Metrics

The project includes a research study framework measuring:

- **Capture time** — seconds from form load to submit
- **Review time** — cumulative ms spent viewing each candidate
- **Completeness** — percentage of core fields filled
- **Consistency** — inter-recruiter comparison
- **Summary accuracy** — corrections made to AI-generated summaries
- **Correction effort** — count of pre-approval edits
- **Decision confidence** — optional self-report scale (1-5)
- **Usability** — task completion rate
- **Accessibility** — WCAG 2.2 AA compliance

## License

Capstone project — J.B. Hunt / TalentIQ. Synthetic data only.
