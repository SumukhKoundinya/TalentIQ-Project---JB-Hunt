# Changelog

All notable changes to TalentIQ will be documented in this file.

## [Unreleased]

### Added
- `TIQ.intake` helpers for the QR form: `nextId` (TQ-2500+count), `isParsableResume` (PDF-only), `buildCandidate` (Medium priority, CREATED audit entry) (`data.js`, `tests/intake.test.js`)
- PDF intake pipeline test: QR form fields → `parseAndStoreResume` → skills/GPA/summary backfilled and persisted under `talentiq_state_v1` with fake pdf.js (`tests/qr-pipeline.test.js`)
- `parseAndStoreResume` backfills name/email/phone/grad/university/major/gpa/skills from the parsed resume and only overwrites empty fields (`TIQ.ai.applyParsedData`) (`data.js`, `tests/apply-resume.test.js`)
- Capture view: bulk resume import panel (resumes → candidate cards) (`views.js`)
- Analytics module computing overview metrics from live candidate state — statusCounts/avgReviewSeconds/formatDuration/dataCompleteness/majorBreakdown/topUniversities/activityFeed/perRecruiter (`analytics.js`, `tests/analytics.test.js`)
- Overview dashboard now computes all metrics from live candidates (Total Scanned, Interview Requests, Avg Review Time, Data Completeness) with event badges, majors chart, top universities, and activity feed from real data instead of hardcoded config (`views.js`)
- Event Details editor in the Event Info view (name/date/location persisted to state + sidebar) with `TIQ.eventInfo()` fallback to config (`views.js`, `data.js`, `app.js`)
- Research Metrics dashboard: funnel, per-recruiter activity, parse-success %, metrics export (`views.js`, `app.js`, `index.html`)
- Candidate card fallbacks (N/A), transcript hydration, tabbed Resume/Voice/Notes drawer (views.js, data.js)

### Changed
- **QR intake form now scans resumes**: `candidate-form.html` loads pdf.js + `config.js` + `data.js`; submit builds the candidate via `TIQ.intake`, saves through `TIQ.state`, and calls `TIQ.ai.parseAndStoreResume` so the created card is fully parsed (skills/GPA/contact/AI highlights) in the main app (`candidate-form.html`)
- QR intake candidates default to `Medium` priority (matches app High/Medium/Low) and get ids `TQ-2500+count` aligned with the main app's scheme instead of `TQ-2400+count` (`candidate-form.html`, `config.js`)
- QR intake resume input is **PDF-only**: DOC/DOCX are rejected at selection with an inline message (resume optional — submission still proceeds without one) (`candidate-form.html`)
- `parseAndStoreResume` now sets `candidate.resumeUpload` with `parsedAt` (clears the Resume missing flag) and logs a `resume-parsed` metric with skills/experience/gpa/contact summary (`data.js`)
- Overview no longer reads `cfg.overviewStats`/`cfg.majorBreakdown`/`cfg.topUniversities`/`cfg.activityFeed` — the dormant auto-compute fallbacks were removed (`views.js`)
- Telemetry: `logMetric` call sites added for `notes-updated`, `candidate-approved`, `follow-up-requested`, `summary-regen`, `candidate-created`, `export` (csv/json), and `compare` (count) (`views.js`)
- Sidebar event info and kiosk banner now source from `TIQ.eventInfo()` with config as fallback (`app.js`, `views.js`)
- **View Renames**: "Candidate Kiosk" → "Event Info" and "Live Recruiter Capture" → "Candidate Cards" in sidebar, view titles, and wirefile (`index.html`, `config.js`, `views.js`, `wireframe-kiosk.html`)
- **Capture Card JD Alignment**: Meta strip now prefers `Projects` count (JDs value academic/personal projects over prior employment; `Experience: N roles` is fallback only) and soft-skill chips are hidden on the card — qualities stay covered by grounded AI highlights (`views.js`)
- **Capture Card Profile Structure**: Flat GPA+skills chip row replaced with a labeled meta strip (GPA / certifications / prior roles — only when present) plus skills grouped under category labels (Languages, Frameworks & Web, Data & Analytics, Ops, etc.); capped at 3 groups × 4 chips with `+N` overflow (`views.js`, `styles.css`)
- **Skill Taxonomy**: New `TIQ.SKILL_GROUPS` taxonomy and `TIQ.categorizeSkills()` helper — case-insensitive, dedupes across resume/recruiter sources, unknown skills fall back to Other Skills (`data.js`)
- Swipe right = Interview Requested; left = Reviewed (no hard reject) (views.js)
- Accessible capture drawers with focus-visible + aria-selected (styles.css, views.js)

### Fixed
- **Swipe Animation Paint Order**: Exiting/dragged capture card no longer gets cut off at the left-column edge (looked like it slid *under* Recruiter Notes/sidebar) — `.capture-workspace` and `.capture-col-left` now use `overflow: visible` so the card paints over surrounding UI; `.app-shell` gains `overflow-x: clip` to prevent a horizontal scrollbar from the fly-out (`styles.css`)
- **Dead Record Toggle**: Card swipe engine no longer captures pointer events on buttons/inputs (including the voice toggle), so the single start/stop button receives clicks (`views.js`)
- **Orphaned Recorder State**: If the singleton AudioRecorder was left in `recording` after a re-render, the toggle now force-cancels it and starts fresh instead of no-op'ing forever (`views.js`)
- **Vosk Preload Feedback**: Successful background model load logs to console; failure shows a one-time toast that recording still works (`views.js`)
- **Mic Error Messages**: `NotAllowedError` / missing-device failures show a specific toast instead of a generic denial message (`components.js`)
- **Voice Memo Recording**: Record no longer waits for the 41MB Vosk model before opening the mic — recording starts immediately, the model preloads in the background when Capture opens, and live transcription wires in as soon as the model is ready (`views.js`)
- **Stop/Save Reliability**: Voice note save now captures the candidate at record-start (survives mid-recording swipes), always resets button/indicator/timer UI, flushes the Vosk recognizer before reading the final transcript, and interrupts cleanly if the card rerenders mid-recording (`views.js`, `components.js`)
- **Live Waveform**: In-card waveform bars now driven by the recorder's AnalyserNode while recording (static pattern when idle); red indicator only lights during active capture (`views.js`, `styles.css`)
- **Vosk Sample Rate**: Live recognizer and PCM feed use the AudioContext's actual sample rate instead of a hardcoded 16000 (`components.js`)
- **Offline Transcript Cleanup**: Full-blob transcription fallback now runs the same proper-noun/grammar cleanup as the live path (`views.js`)

### Changed
- **Capture Card Avatar**: Header avatar now stretches to match the height of the stacked name/university/major lines while staying square via `aspect-ratio: 1` (larger, neatly aligned) (`styles.css`)
- **Script/Style Cache Busters**: `styles.css` bumped to `?v=2`, `views.js` to `?v=8` (`index.html`)
- **Missing-Flag Banners Combined**: Capture card compliance alerts now render as one banner joining up to 3 flag labels with • (plus "+N more" if needed) instead of one banner per flag (`views.js`, `styles.css`)
- **Waveform Colors**: Idle bars are solid grey; while recording all bars turn red (heights still driven by the mic analyser) (`views.js`, `styles.css`)
- **Script Cache Busters**: `config/data/components/views/app` bumped to `?v=3` so browsers pick up voice-toggle fixes (`index.html`); `views.js` later bumped to `?v=6` for capture-card UI changes (`index.html`)
- **Voice Memo Single Toggle**: Replaced the two-button ⏸/✓ record flow with one YouTube-style toggle — blue ● click starts recording, same button turns red ■ and click stops & saves; waveform flex-fills the freed space (`views.js`, `styles.css`)
- **Recordings Panel**: Playback list (`Recording N` players w/ delete) moved out of the candidate card into a new "Recordings" panel at the top of the right column, above Recruiter Notes (`views.js`, `styles.css`)
- **Capture Triage Bar**: Bottom control bar re-sequenced into a single centered 3-button row — `← Reviewed` (left), `Undo` (center, styled as neutral outline pill), `Follow-Up →` (right) (`views.js`, `styles.css`)
- **Capture Vertical Flex**: `.capture-col-left` now uses `justify-content: flex-start` with `.capture-stack-shell` at `flex: 1 1 auto`, so the Candidate Card expands into the space freed by the removed action row (`styles.css`)
- **Swipe Hint Compacted**: Two space-between labels combined into one centered single line — "‹ Swipe left = Reviewed • Swipe right = Follow-Up ›" (`views.js`, `styles.css`)

### Removed
- **Capture Card Meta Clutter**: Swipe hint line ("‹ Swipe left = Reviewed • Swipe right = Follow-Up ›"), candidate ID pill (TQ-####), and status badge (FOLLOW-UP/REVIEWED/etc.) removed from all capture deck cards (`views.js`, `styles.css`)
- **"Request via Kiosk SMS"**: Dropped from missing-flag alert banners on the capture card (`views.js`)
- **Resume PDF Boxes**: In-card resume pill (filename + Preview) and right-column Resume upload panel removed from `/capture` — resumes reviewed in later hiring stages (`views.js`)
- **"New" (+) Button**: Circular New action button deleted from the capture bottom control bar; manual candidate creation remains available via the empty-state "Add Candidate Manually" button (`views.js`)

### Added
- **Candidate Review Card**: New high-density card design for `/capture` — Apple-style voice memo widget (waveform bars, red record indicator, pause/confirm round buttons), grounded AI highlights panel with `source:` citation tags, resume pill w/ Preview modal, and compliance alert banners (`views.js`, `styles.css`)
- Resume parser now extracts name/email/phone/graduation from text (data.js, tests/resume-parser.test.js)

### Changed
- **Capture Card Layout**: Card shell now uses the `candidate-card` class (scoped under `.capture-stack`) — swipe hint, header w/ 48px avatar + status badge, GPA/skill chips, AI highlights, voice memo, resume pill, and missing-data alerts; old absolute swipe hint removed
- **Voice Recorder Controls**: Record/Stop now render as circular ⏸/✓ buttons; `#audioRecordLabel` text updates are null-guarded since the label element was removed (`views.js`)
- **In-Card Voice Recorder**: Live voice recording controls (Record / timer / Stop, live transcript preview, recordings list) now embedded directly in the front candidate card below the Grounded Summary (`capture-card__voice`) instead of the right sidebar panel

### Changed
- **Capture Right Column**: Voice Notes panel removed from right column; left column no longer empty — Recruiter Notes and Resume panels remain
- **Card Layout**: Voice recorder block styled to match card radius (`--radius-md`) and internal padding; `#cardRecordNote` footer button now scrolls the card itself into view

### Removed
- **Orphaned `.capture-panel--voice` CSS**: Removed unused voice-panel rules after relocating the recorder into the card

### Added
- **Full-Height Capture Layout**: `/capture` workspace is now a locked viewport-height grid (`420px | 1fr`) with zero window scroll; card fills 100% of the left column
- **Grounded Summary Body**: Capture card now renders 3-4 summary bullets with inline `[source: …]` citation badges as the main content fill
- **Triage Action Bar**: Prominent `← Reviewed` / `Follow-Up →` buttons anchored beneath the card stack (swipe semantics preserved)
- **Card Quick Actions**: `🎙️ Record Note` (triggers the voice recorder) and `✏️ Edit` buttons pinned to the card footer
- **Attribute Chips Row**: GPA chip (≥3.5) alongside top 4 skill pills
- **Header Meta Lines**: University and `Major · Grad` on separate lines so dates are never truncated
- **Key Highlights (Accomplishments)**: Replaced AI Summary on capture card with 1-3 key accomplishments per candidate, auto-extracted from parsed resume data
- **Accomplishment Generator**: `TIQ.generateAccomplishments()` extracts certifications, metrics, leadership keywords, and projects from resume; falls back to recruiter notes
- **One-Line Info Row**: Condensed 7 field rows into `School · Major · Grad · Work Auth` single line on capture card

### Changed
- **Capture Card Redesign**: Compact glance card — GPA shown only if ≥3.5, skills reduced to top 4 pills, flags hidden when empty
- **Seed Data**: Added `accomplishments` field to all 7 test candidates
- **Triage Buttons**: Circular Review/Contact buttons replaced by full-width labeled triage bar; Undo/New kept as compact secondary actions

### Fixed
- **Legacy Saved State**: Backfills new accomplishments from seed data for previously saved candidates on app load

### Removed
- **AI Summary from Card**: Removed blue AI Summary box from capture card (summary still available in AI Review detail panel)
- **7-Field Row Layout**: Removed individual University/Major/Grad/GPA/Auth/Location/Role field rows from card

## [0.4.0] - 2026-09-21

### Added
- **AI Resume Parser**: PDF.js-powered resume text extraction with regex-based skill, experience, project, education, GPA, and certification detection
- **AI Summary Generator**: Template-based candidate summary with source traceability citations and missing data flags
- **Inline-Editable Capture Card**: Tappable skill pills, editable field rows, AI summary box, actionable missing flags, edit toggle
- **Manual Candidate Creation**: "+ New Candidate" modal with full form fields and optional resume upload
- **Regenerate Summary Button**: AI Review detail panel button to re-run summary generation
- **Actionable Missing Flags**: Click any flag chip to get guidance on filling that field
- **AI Missing Data Flags**: Separate flag section showing data gaps from the AI summarizer with source attribution
- **Demo Data Generator**: One-click test candidate creation for demos (5 pre-built candidates)
- **PDF.js Integration**: Added CDN scripts for client-side PDF text extraction

### Changed
- **Capture Card Redesign**: Complete rewrite with editable fields, skill pills, AI summary, and flags
- **AI Review Detail Panel**: Auto-generates summary on first view, enhanced with regen button and actionable flags
- **Notes Auto-Regen**: Summary auto-regenerates when recruiter notes change in Capture or AI Review views
- **Missing Flags System**: Enhanced to check skills, notes, and areas discussed

## [0.3.0] - 2026-09-17

### Added
- **Proper Noun Correction**: Post-transcription fix uses candidate data (name, university, skills) to correct Vosk misheard words via Levenshtein distance fuzzy matching and tech term capitalization
- **TL;DR Summary**: Auto-generated one-liner from candidate card data (name, major, skills, GPA, graduation, work auth, locations, role interest, areas discussed, status)
- **Bullet Point Formatting**: Transcript split on conjunctions/commas for scannable recruiter notes
- **Number Word Conversion**: Converts Vosk number words to digits (e.g., "twenty five million" → "$25M", "three point seven eight" → "3.78"), with currency detection for revenue/salary contexts
- **Action Verb Starters**: Each bullet point starts with an action verb (strips leading pronouns like "She/He/They/I", prepends "Discussed" for noun-starting bullets)
- **Company Name Capitalization**: Auto-capitalize common company names (Walmart, Tyson, FedEx, Amazon, Google, J.B. Hunt, etc.)
- **Grammar Correction**: Fixes common speech errors — subject-verb agreement ("she don't" → "she doesn't"), "could of" → "could have", "I seen" → "I saw", double negatives, misspellings
- **Tone Normalization**: Reduces excessive repetition ("really really" → "very"), casual language ("super excited" → "very excited"), filler phrases
- **Soft Skill Detection**: Automatically identifies and tags Leadership, Teamwork, Communication, Problem Solving, Initiative, Adaptability, Attention to Detail, Creativity from transcript content
- **Follow-Up Item Detection**: Flags action items like "Schedule interview", "Send resume", "Follow up", "Schedule call"
- **Concern/Red Flag Detection**: Flags potential issues like visa/work auth needs, availability constraints, limited experience mentions

### Fixed
- **Capture View**: Overlay flash on keybind, button order, vertical padding alignment
- **Transcription Vosk BindingError**: Reverted grammar array that crashed KaldiRecognizer constructor

## [0.2.0] - 2026-09-16

### Added
- **Public Intake Form**: Candidate self-service form with QR code access
- **Resume Upload**: File upload with client-side text extraction
- **Scannable QR Codes**: Generate printable QR codes for career fair booths
- **Audio Transcription**: Local faster-whisper integration for recording transcription
- **Grounded Review Pipeline**: Transcription wired into review system
- **Claims Bar**: Grounded claims display with source citations
- **Audio Persistence**: Recordings stored in IndexedDB
- **FastAPI Backend**: Local Python backend with health endpoint
- **Pluggable Summary Endpoint**: Grounded-summary API (defaults to 503 without AI backend)

### Changed
- **Data Model**: Removed fake AI metrics — grounded model with missing flags replaces fit percentages
- **Routing**: Portal route group + public `/apply` shell

### Documentation
- Added end-to-end README with JSON import/reset instructions and optional-AI setup
- Added REDESIGN-PLAN-REACT.md

## [0.1.0] - 2026-09-15

### Added
- Full SPA implementation with Python backend
- 7 views: Overview, Candidate Intake, Recruiter Capture, AI Review, Candidate Review, QR Poster, Research Metrics
- Vanilla JS router with `data-view` attribute toggling
- Design system with J.B. Hunt branding (Yellow `#FEDB00`, Blue `#005DBA`)
- localStorage + IndexedDB persistence
- XSS prevention via `escapeHtml()` and `escapeAttr()`

## [0.0.1] - 2026-09-14

### Added
- Initial TalentIQ static prototype
