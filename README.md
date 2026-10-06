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

The app opens with a demo-only recruiter chooser. Select a recruiter and continue to **Set Up**, where the event details and booth QR code are available. This is a visual demo gate, not authentication; it does not ask for an account or password. Use **Open Capture** to enter the recruiter workflow.

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

### Fictional recruiting candidates

The [main website](index.html) now starts with seven explicitly fictional J.B. Hunt-relevant recruiting examples: transportation operations, analytics, industrial engineering, logistics software, fleet maintenance, customer accounts, and an early-career internship profile. Each card has a matching PDF in `demo-resumes/`; all people, employers, accomplishments, and metrics are invented for demonstration. `demo-candidates.js` uses the existing résumé parser and candidate schema, preserving explicitly authored skills, credential names, and role headings in these fixtures. The user-authorized replacement performs a one-time cleanup of previous TalentIQ candidates, notes, recordings, metrics, and the earlier alternate demo storage on the next visit in each browser at this origin. It then seeds the normal app storage; subsequent reloads preserve new submissions, notes, recordings, and decisions. Cleanup also runs safely from candidate intake. Unrelated browser storage and downloaded files are not deleted. Full-file links are restored on reload because persistent candidate state intentionally omits résumé URLs.

After editing the authored résumé text, regenerate the PDFs with `python3 scripts/generate-demo-resumes.py`.

### Résumé intake and candidate cards

The candidate form starts with a text-based PDF upload (maximum 5 MB), then shows an editable review of extracted name, email, phone, school / institution, degree, major, graduation, and GPA. `candidate-intake.js` manages an unsaved draft using the existing pdf.js → `TIQ.ai.extractResumeData` → `TIQ.ai.applyParsedData` flow, with the full result on `candidate.parsedResume`. Name, valid email, and explicit profile-sharing consent are required; other details and voice-recording consent are optional. Partial dates and GPA qualifiers remain unchanged.

Candidates can enter details manually, including after a failed or stalled scan. Retries preserve edits and show conflicting résumé values; obsolete upload results cannot overwrite newer scans or manual entry. Confirming the form stores a fresh record and marks the reviewed fields as candidate-confirmed. “Submit another profile” starts an empty draft. The existing JSON handoff transfers confirmed fields; the original PDF must be attached separately to extract fuller résumé details on another device. Nothing is automatically sent to a recruiter.

After confirmation, “View my recruiter card” opens that exact local record in Capture. Use the same browser and address for the form and app: different ports (for example, 8000 and 8013) have separate local storage. Uploading alone creates only an unsaved review draft, not a submitted record.

Explicit form entries and recruiter corrections take precedence. Conflicting extracted values appear under “Résumé discrepancies” in Capture’s Resume evidence panel. Replacing a résumé clears obsolete résumé-derived values but preserves those entries; late results from an older upload are ignored.

Capture leads with identity, one line of actual skills, and source-supported résumé highlight groups. Its frame is sized from the viewport and actual application chrome, not candidate content, so switching between sparse and dense records does not move the card, stack, or decision controls. Complete contribution bullets preserve methods, scope, and qualifiers; project headings and tool lists never become concatenated summary prose. Muted outline icons, decorative CSS dotted leaders, and actual counts identify groups; organizations and dates belong to item metadata. Quantities use dark semibold emphasis. Documented project awards appear once as a distinct source-owned callout. Certifications share one group with their actual count and plain credential lines. Four groups are prioritized when space permits; narrow or short frames show fewer. The visible skill count adapts to available width; “+N” opens a grouped remaining-skills popover that closes with Escape, an outside click, or a candidate switch. Formatting is handled in `views.js`, not stored as résumé HTML; the parser and stored résumé fields remain unchanged.

Capture shows one or two priority missing-information flags; “All N” keeps the complete set actionable. At 960px and above, summary and evidence use approximately 42/58 columns with usable minimum widths. Below 960px, “View résumé & evidence” opens Resume, Voice, and Notes with a candidate-labelled back control. Evidence starts directly with the tabs, without a separate candidate/file-action header. All three tab contents share a 20px workspace inset (12px on phones). Resume presents escaped source sections, bullets, contacts, and dates as a centered white document with the app’s typography, comfortable page margins, 1.6 body line-height, and slightly more space above sections; discrepancies and original résumé text remain accessible. Voice retains recording controls, consent, and saved audio. Notes retains candidate-specific edits in a styled, bounded-height textarea. Arrow keys, Home, and End navigate the tabs. At 480px and below, Undo has its own row above the two decision buttons. The summary and its controls fit the tested viewport frames without page or internal card scrolling; evidence remains independently scrollable. Extremely short effective viewports may show no highlights, leaving full details in evidence. Existing swipe, triage keyboard, recording consent, and Undo behavior is retained.

- **localStorage** — Candidate state, metrics, study sessions
- **IndexedDB** — Audio blobs (too large for localStorage)
- **No backend** — Candidate submissions and demo records are stored locally in the browser

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
| `candidate-form.html` | Résumé-first upload, editable review, consent, and local handoff |
| `candidate-intake.js` | Unsaved submission drafts and form events using the shared parser |
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
