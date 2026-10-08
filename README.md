# TalentIQ — AI-Assisted Career Fair Platform

> A J.B. Hunt capstone project for improving candidate information quality at career fair touchpoints.

## Overview

TalentIQ is NOT a hiring automation tool. It is an AI-assisted platform for improving the **quality of information** captured during career-fair conversations between recruiters and candidates. The currently available recruiter website includes booth setup, candidate capture and simplified Review; candidate intake remains a separate page.

**Sponsor:** Carl Pegue, J.B. Hunt (carl.pegue@jbhunt.com)

## Quick Start

```bash
cd "/Users/nirmay/Desktop/jb hunt"
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

No build step. No npm. No dependencies. Just static files.

The app opens with a demo-only recruiter chooser. Select a recruiter and continue to **Set Up**, where the event details and booth QR code are available. This is a visual demo gate, not authentication; it does not ask for an account or password. Use **Open Capture** to enter the recruiter workflow.

Set Up is owned by [`features/setup/`](features/setup/README.md): event details, editable intake QR, print/copy actions and a booth camera preview. Click **Allow camera** to preview framing (HTTPS or localhost required); no audio or video is recorded here, and leaving Set Up stops the camera. Event details persist on this device; QR settings remain in memory until the page reloads. The previous inline poster, including its HogHacks artwork, is no longer rendered; the source assets are retained.

## Features

| Feature | Description |
|---------|-------------|
| **Candidate Intake** | Mobile-first form for students. Access via QR code at career fair booths. Target: < 30 seconds to complete. |
| **Recruiter Capture** | Card deck for 3-minute career fair conversations. Audio recording with offline fallback. Quick status assignment with undo. |
| **AI Summarization** | Template-based summary generation with source citations and missing-data indicators. No API dependency. |
| **Review** | Shared candidate card above a readable recap, Resume/Notes/Contact reference, factual two-record comparison and recruiter-reviewed invitation handoff. |
| **QR Code Generation** | Print-friendly QR posters for career fair booth display. Pure canvas-based, no library. |

## Architecture

```
┌─────────────────────────────────────────────────┐
│  index.html  (SPA shell)                        │
│  ├── Dark sidebar with JBH branding             │
│  ├── Recruiter picker in the sidebar            │
│  └── #viewContainer (3 recruiter routes)         │
├─────────────────────────────────────────────────┤
│  app.js       (Router + init)                   │
│  data.js      (Schema + state + AI summarizer)  │
│  views.js     (Shared cards + original views)  │
│  components.js (Cards, modals, audio, toasts)   │
├─────────────────────────────────────────────────┤
│  styles.css   (Design system + all styles)      │
└─────────────────────────────────────────────────┘
```

- **SPA with JS router** — views toggled via `data-view` attributes
- **No build system** — vanilla JS + CSS, `<script>` tags
- **No ES modules** — avoids CORS with `python -m http.server`
- **Global namespace** — everything under `window.TIQ`

`workflow.js` owns shared recruiting-status, versioned verification and intake helpers. `review-workspace.js` adapts retained Review capabilities into the active two-panel workspace. The active router exposes Set Up, Capture and Review. Event Results and Research Metrics remain disconnected; loading Review does not install its retained Event Results overrides.

## Views

| # | View | Purpose |
|---|------|---------|
| 1 | Set Up (`kiosk`) | Event settings and printable candidate check-in QR poster |
| 2 | Capture (`capture`) | Career-fair conversation cards and evidence |
| 3 | Review (`review`) | Candidate card, recap verification, Resume/Notes/Contact and separate comparison |
Student intake is the separate `candidate-form.html` page, not an additional SPA route.

Event Results and Research Metrics remain unlinked and unroutable. Their retained source modules, tests, candidate records, approval history and stored study data have not been deleted. The legacy Review renderer remains retained but is not the active interface.

## Data Storage

### Candidate data and résumé intake

The [main website](index.html) starts with an empty candidate list in a fresh browser. Startup never clears existing candidate records, notes, recordings, metrics or study data; the former one-time cleanup hook is now non-destructive. Add synthetic records through Capture’s **Import Resumes (PDF)** or the candidate intake form. Real candidate use requires separate sponsor/privacy/security approval. The fictional PDFs in `demo-resumes/` remain repository fixtures for parser and regression tests; the live app does not load them as candidate data.

### Résumé intake and candidate cards

The candidate form starts with a text-based PDF upload (maximum 5 MB), then shows an editable review of extracted name, email, phone, school / institution, degree, major, graduation, and GPA. `candidate-intake.js` manages an unsaved draft using the existing pdf.js → `TIQ.ai.extractResumeData` → `TIQ.ai.applyParsedData` flow, with the full result on `candidate.parsedResume`. Name, valid email, and explicit profile-sharing consent are required; other details and voice-recording consent are optional. Partial dates and GPA qualifiers remain unchanged.

Candidates can enter details manually, including after a failed or stalled scan. Retries preserve edits and show conflicting résumé values; obsolete upload results cannot overwrite newer scans or manual entry. Confirming the form stores a fresh record and marks the reviewed fields as candidate-confirmed. “Submit another profile” starts an empty draft. The existing JSON handoff transfers confirmed fields; the original PDF must be attached separately to extract fuller résumé details on another device. Nothing is automatically sent to a recruiter.

After confirmation, “View my recruiter card” opens that exact local record in Capture. Use the same browser and address for the form and app: different ports (for example, 8000 and 8013) have separate local storage. Uploading alone creates only an unsaved review draft, not a submitted record.

Explicit form entries and recruiter corrections take precedence. Conflicting extracted values appear under “Résumé discrepancies” in Capture’s Resume evidence panel. Replacing a résumé clears obsolete résumé-derived values but preserves those entries; late results from an older upload are ignored.

Capture leads with identity, actual skills, and source-supported résumé highlight groups. Roles and projects show up to three concise contribution bullets, each capped at ten words; fewer appear when the source supports fewer distinct short claims. Quantified outcomes take priority over quantified scope, then methods; unlike quantities are not compared by raw magnitude. Full contributions remain intact in the Resume panel rather than expanding into a second résumé on the card. Display-only compression selects source clauses and phrases, retaining numeric endpoints and applicable synthetic, modeled, prototype, or internal-test qualifiers. Dates share the title row, right-aligned with dotted leaders that disappear on narrow screens; organizations, team metadata, and supported tool lists stay below. Quantities use dark semibold emphasis with their units; source buttons underline only on hover or focus. Clicking a short bullet opens Resume, scrolls to its original full passage, and highlights and focuses it. Links use original text offsets and a résumé-text version, so repeated bullets have distinct targets and replacing a résumé rebuilds the links. Formatting remains escaped HTML generated in `views.js`, never stored résumé HTML. The fixed card frame keeps decision controls stable; its highlights region scrolls independently when needed.

Top skills shows the first three unique skills in their existing order, right-aligned beside its label with a dotted leader. A +N button opens the existing keyboard-accessible popover containing only the remaining skills; it is hidden when there are three or fewer. On narrow screens, the leader disappears and chips can wrap without reducing the three-skill selection.

The local rule-based parser joins wrapped PDF bullets before assigning them to roles and projects, recognizes later experience/project sections, and retains majors before graduation metadata. Stored parses include `parserVersion` and source bullet offsets. On app load, older usable parses are refreshed once from their retained text; recruiter/candidate-confirmed fields and notes remain authoritative, and regenerated summaries require renewed approval. Collapsed stale scans still require re-scanning the original PDF. This does not add an AI model or OCR.

Regression checks: `node tests/resume-fidelity.test.js`. Optional real-PDF coverage uses the ten supplied files in `resume_test_pack 2/`: `PDFJS_MODULE=/path/to/pdfjs-dist/legacy/build/pdf.js node tests/resume-pdf-fidelity.cjs` (PDF.js 3.11.174). With a local server running, `PLAYWRIGHT_MODULE=/path/to/playwright node tests/resume-fidelity-browser.cjs` checks actual import, keyboard expansion, source navigation, and responsive control stability; set `CHROMIUM_PATH` if using an existing Chromium executable. These optional tools are test dependencies only, not runtime dependencies.

Capture shows one or two priority missing-information flags; “All N” keeps the complete set actionable. At 960px and above, summary and evidence use approximately 42/58 columns with usable minimum widths. Below 960px, “View resume & evidence” opens candidate records with a back control. Resume presents escaped source sections, bullets, contacts, and dates as a centered white document; discrepancies and the original résumé link remain accessible. Notes retains candidate-specific edits, voice recording controls, consent, and saved audio. Arrow keys, Home, and End navigate the tabs. At 480px and below, Undo has its own row above the two decision buttons. Highlights and evidence scroll independently inside the viewport-sized frame. Existing swipe, triage keyboard, recording consent, and Undo behavior is retained.

Notes includes a collapsed **Structured conversation (optional)** section: role interest, neutral discussed-area tags, technical interests, location preferences, candidate questions, questions to clarify later and next steps. Fields save when changed/blurred, carry recruiter provenance and survive resume refresh. Sample engineering/product prompts accept coursework, personal projects and leadership; they are not live vacancies or hiring criteria. Structured edits invalidate recap verification but do not change recruiting status; this milestone does not yet generate claim-level recaps from the new fields.

Before each voice recording attempt, acknowledge permission from everyone who may be recorded, or that the memo is genuinely private and recruiter-only. The acknowledgement is audited and consumed per attempt; it is not proof of consent or speaker identity. Audio is local, transcripts remain unverified, and keyboard shortcuts defer to native controls and editable content.

Structured Capture checks: `node tests/structured-capture.test.js`, `node tests/empty-workspace.test.js`, and, with the local server running, `PLAYWRIGHT_MODULE=/path/to/playwright node tests/structured-capture-browser.cjs` (`CHROMIUM_PATH` is optional). Evidence: [`docs/mvp-milestone-1-evidence.md`](docs/mvp-milestone-1-evidence.md). Shared intake/offline synchronization remain unfinished; no cloud LLM or shared provider has been added.

### Simplified Review

Review reads the same local candidates as Capture; no re-entry is required. **Find candidate** defaults to the current event’s **Reviewed and Follow-Up** records, with search and optional status/verification/role filters inside the dialog. **All statuses** includes New, Interview Requested and Closed. Empty results offer recovery and Capture. Changing filters or a candidate’s status keeps the open record visible until deliberate navigation.

The left panel always contains the actual Capture card, without swipe controls, followed by a readable recruiter recap; **Edit recap** reveals Save/Cancel. The right panel starts on **Resume**, with **Notes** and **Contact** tabs. Card source links focus version-checked resume passages. Candidate-specific recap edits, reference tabs and panel scroll positions survive switching records and navigating away within the current page. Unsaved recap drafts are memory-only; save before reloading/closing, which triggers an unsaved-work warning when supported.

Approval requires saved edits and an explicit source-check acknowledgement, and does not change recruiting status. **Choose a next step** starts expanded and contains independent status and next steps. **More** contains attribution, verification history and draft rejection; rejecting a draft never rejects the candidate. Optional fields are not approval gates.

**Contact** shows supplied email, phone and profile links with the editable local rule-based invitation and schedule already expanded. **Open Contact** in next steps opens that tab directly. The initial suggestion is noon tomorrow in the displayed browser timezone, moved to Monday if that day is a weekend, for 30 minutes; availability is not checked. Edited drafts persist locally and are not reset when reopened. Date, time, timezone, recipient and duration remain editable; handoffs reject invalid/past times and ambiguous or nonexistent daylight-saving times. No meeting link is generated.

**Open in Google Calendar** opens a prefilled event with candidate guest email; the recruiter must review and send it in Google Calendar. **Open email draft** uses the configured email app. **Copy message** includes the proposed schedule and has a manual-copy fallback. These are handoffs, not proof of sending. Sent-confirmation controls, Hide outreach and Contact history are no longer shown; existing historical records remain stored. Contact activity does not change recruiting status or revoke an unchanged recap certificate. No calendar/email API, cloud LLM or automatic sender is added.

The separate **Compare** button opens a dialog requiring exactly two distinct current-event candidates, including all recruiting statuses regardless of the finder. It shows their real cards, saved recaps and verification, interests/notes, status and next steps without ranking. Resume and Notes open inside that same dialog; **Back to comparison** restores both records and card scroll positions. Narrow layouts switch between the two records. Closing comparison restores the underlying Review state and focus. Skill popovers use separate IDs for each card.

Claim-level recap grounding and sponsor acceptance remain unresolved; certified exports, shared intake, offline synchronization and the remaining MVP milestones are not completed by this revision.

Checks: `node tests/simplified-review.test.js`; with the local server running, `PLAYWRIGHT_MODULE=/path/to/playwright node tests/simplified-review-browser.cjs` and `node tests/retired-pages-browser.cjs` using the same environment. Set `CHROMIUM_PATH` if needed. Exact results, repaired layout findings and limitations: [`docs/mvp-milestone-2-evidence.md`](docs/mvp-milestone-2-evidence.md).

Revised Review checks: `node tests/review-contact.test.js`, `node tests/review-redesign.test.js`, and the expanded `tests/simplified-review-browser.cjs`. Current evidence: [`docs/review-redesign-evidence.md`](docs/review-redesign-evidence.md).

- **localStorage** — Candidate state, metrics, study sessions
- **IndexedDB** — Audio blobs (too large for localStorage)
- **No backend** — Candidate submissions and demo records are stored locally in the browser

### localStorage Keys

| Key | Contents |
|-----|----------|
| `talentiq_state_v1` | Candidates, active recruiter, selected candidate |
| `talentiq_eval_metrics_v1` | Evaluation metrics for research study |
| `talentiq-study-v1` | Explicit controlled studies, trial definitions / timing / observations, and accessibility evidence |

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
| `review-workspace.js` | Active simplified Review; retained legacy/comparison/export capabilities are not exposed as active screens |
| `components.js` | Reusable UI components |
| `AGENTS.md` | AI agent orientation |
| `BRANDING.md` | Design system reference |
| `REDESIGN-PLAN.md` | Full implementation plan (8 tasks) |
| `README.md` | This file |

## License

Capstone project — J.B. Hunt / TalentIQ. Synthetic data only.
