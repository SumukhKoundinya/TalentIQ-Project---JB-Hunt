# Changelog

All notable changes to TalentIQ will be documented in this file.

## [Unreleased]

### Added
- Capture-only source-fact regressions for title/tool contamination, fragments, ownership, qualifiers, inline awards, and shared presentation; cohesive outline icons, item metadata, distinct award callouts, quieter flags, and a centered résumé document with “Open original résumé” (`views.js`, `styles.css`, `index.html`, `tests/capture-polish.test.js`).
- Seven explicitly fictional J.B. Hunt-relevant candidate cards with matching PDF résumés (`demo-candidates.js`, `demo-resumes/`, `scripts/generate-demo-resumes.py`, `tests/demo-candidates.test.js`).
- Reference-style Capture presentation with source-owned one-fact-per-bullet highlights, decorative dotted leaders and counts, documented project-award priority, compact flags/swipe footer, and a single Evidence workspace with print-style résumé and accessible tabs; preserved stable frames, Voice/Notes, and current animation (`views.js`, `styles.css`, `index.html`, `tests/capture-visual.test.js`).
- Stable, viewport-sized Capture frames across candidate densities, height-aware source summaries, role/award separation, understated empty states, and compact flags without changing current swipe behavior (`views.js`, `styles.css`, `index.html`, `tests/capture-stability.test.js`).
- Capture executive summaries with natural-height 18px-radius cards, 42/58 evidence layout, width-fitted one-line skills and dismissible overflow popover, source-extractive metric-preserving highlights, combined certifications, and recording/full details moved to evidence; removed the in-card More disclosure without changing swipe behavior (`views.js`, `styles.css`, `index.html`, `tests/capture-summary.test.js`).
- Capture-only responsive hierarchy: identity-first cards, five top skills with full grouped disclosure, up to five grounded highlights, two priority flags with actionable full list, and narrow-screen evidence/back navigation (`views.js`, `styles.css`, `tests/capture-responsive.test.js`).
- Résumé-first candidate submissions with pre-submit parsing, editable extracted details, compact consent checkboxes, manual entry, fresh drafts, safe retries/replacements, and confirmed-field JSON handoff (`candidate-form.html`, `candidate-intake.js`, `tests/resume-first-intake.test.js`).
- Résumé-backed intake fields with optional education inputs, preserved GPA qualifiers, source-grounded title/contribution highlights, and visible discrepancies that retain entered values (`candidate-form.html`, `data.js`, `views.js`, `styles.css`).
- Visible, source-grounded Résumé Highlights below Capture-card skills, with consistent Inter list formatting, fuller parsed details in “More from this candidate,” and candidate-switch/replacement/state regression coverage (`views.js`, `styles.css`, `index.html`, `tests/resume-highlights.test.js`).
- Capture-card skills render as single-line grouped rows with right-to-left badge flow and `+N` overflow chips, grounded highlights carry explicit source icons, and missing-data alerts collapse into a footer summary (`views.js`, `styles.css`, `tests/resume-card.test.js`)
- Candidate card skills now render as grouped, menu-style categories with per-group overflow chips instead of a flat tag cloud (`views.js`, `styles.css`, `tests/resume-card.test.js`)
- J.B. Hunt recruiting vocabulary in `SKILLS_DICT` (~150 terms across freight/transportation, business systems & ERP, analytics methods, industrial-engineering methods, business functions, and credentials — Intermodal, Drayage, Load Planning, TMS/WMS, OTIF, 3PL, SAP, Salesforce, Snowflake, Six Sigma, PMP, CDL, …), placed ahead of the generic catch-all row so domain terms win the 20-skill cap when a resume matches both (`data.js`)
- Three new skill groups so those terms bucket instead of falling into "Other Skills": `freight` (Freight & Transportation), `business` (Business, Finance & ERP), `credentials` (Certifications & Licenses), plus extended `ops`/`data`/`methods` match lists (`data.js`)
- Vocabulary regression coverage: extracts a freight-ops resume fixture, asserts group bucketing, and asserts the new terms do not leak into ordinary prose ("regression testing", "parcel of land") (`tests/resume-parser.test.js`)
- Stale-parse detection (`TIQ.ai.isStaleParse`): recognises a stored parse written by an older build that collapsed the whole PDF into one line, so the drawer Resume tab shows a "Stale scan — re-scan required" label with an explanation and the resume band carries an inline warning that its values are unreliable (`data.js`, `views.js`, `styles.css`, `tests/resume-card.test.js`)
- Provenance-aware re-scan refresh: `applyParsedData(candidate, parsed, {refresh:true})` replaces or clears fields the machine wrote on a previous scan while preserving explicit entries and recruiter corrections (`data.js`, `tests/apply-resume.test.js`, `tests/resume-flow.test.js`).
- Work-authorization extraction with a sponsorship/negative-statement disqualifier that wins outright, so "requires sponsorship" and "no longer authorized" can never resolve to a positive match; returns empty rather than guessing when uncertain (`TIQ.ai._extractWorkAuthorization` in `data.js`)
- Resume link extraction (LinkedIn / GitHub / portfolio), including scheme-less profile hosts, with trailing separators stripped and bare email addresses never mistaken for portfolio URLs (`TIQ.ai._extractLinks` in `data.js`)
- `resumeAddress` candidate field — the mailing address printed on the resume, deliberately kept separate from the recruiter-collected `workLocations` preference so "Location Preference Missing" is never cleared without anyone asking (`data.js`, `views.js`, `tests/apply-resume.test.js`)
- Machine-readable role durations via `TIQ.ai._normalizeDateRange` (`start`/`end`/`isCurrent`/`months`); ongoing roles report no length rather than an invented one, and the display `dates` string is unchanged (`data.js`)
- Degree normalization via `TIQ.ai._normalizeDegree` (`BS` → `Bachelor of Science`, `MBA` → `Master of Business Administration`, etc.) plus a `degreeLevel` (`data.js`)
- Duration chips and link anchors in the resume band, rendered only for http(s) targets (`views.js`, `styles.css`)
- Interactive HTML wireframe for the Event Info redesign ("Booth Console": status pill, event strip, QR hero with visible destination, booth pulse, inline intake destination, setup checklist, annotated legend, mobile frame) (`wireframe-event-console.html`)
- Skill icon asset registry and compact icon-tile renderer for capture-card skill groups (`skill-icons.js`, `views.js`, `assets/skill-icons/`)
- Shared `TIQ.formatMonthYear()` helper to normalize ISO month-year values like `2027-05` to `May 2027` (`data.js`)
- `TIQ.intake` helpers for the QR form: `nextId` (TQ-2500+count), `isParsableResume` (PDF-only), `buildCandidate` (Medium priority, CREATED audit entry) (`data.js`, `tests/intake.test.js`)
- PDF intake pipeline test: QR form fields → `parseAndStoreResume` → skills/GPA/summary backfilled and persisted under `talentiq_state_v1` with fake pdf.js (`tests/qr-pipeline.test.js`)
- `parseAndStoreResume` backfills name/email/phone/grad/university/major/gpa/skills from the parsed resume and only overwrites empty fields (`TIQ.ai.applyParsedData`) (`data.js`, `tests/apply-resume.test.js`)
- Capture view: bulk resume import panel (resumes → candidate cards) (`views.js`)
- Analytics module computing overview metrics from live candidate state — statusCounts/avgReviewSeconds/formatDuration/dataCompleteness/majorBreakdown/topUniversities/activityFeed/perRecruiter (`analytics.js`, `tests/analytics.test.js`)
- Overview dashboard now computes all metrics from live candidates (Total Scanned, Interview Requests, Avg Review Time, Data Completeness) with event badges, majors chart, top universities, and activity feed from real data instead of hardcoded config (`views.js`)
- Event Details editor in the Event Info view (name/date/location persisted to state + sidebar) with `TIQ.eventInfo()` fallback to config (`views.js`, `data.js`, `app.js`)
- Research Metrics dashboard: funnel, per-recruiter activity, parse-success %, metrics export (`views.js`, `app.js`, `index.html`)
- Candidate card fallbacks (N/A), transcript hydration, tabbed Resume/Voice/Notes drawer (views.js, data.js)
- Resume re-scan control in the capture drawer's Resume panel for candidates with no parsed resume (select the PDF → `parseAndStoreResume` → toast + rerender) (`views.js`, `styles.css`)
- QR form success screen now shows a scan result line: "Resume scanned — N skills detected" vs a warning that the profile saved but the resume couldn't be scanned (`candidate-form.html`)
- Failure-path coverage for resume scanning: pdf.js missing and getDocument errors resolve `null`, leave `parsedAt:""`, flag "Resume Not Scanned", and log `RESUME_SCAN_FAILED` + `resume-parse-failed` (`tests/scan-failure.test.js`)
- Capture card is now partitioned by source so it actually represents the resume: a resume bar (filename, scan state, extraction tally, Scan CTA or dashed "NO RESUME ATTACHED"), a tinted FROM THE RESUME band with real extracted values (education, experience capped at 2 with a `+N earlier roles` expand-in-place control, certifications, projects), a SKILLS block with its own provenance dot, then a white FROM THE CONVERSATION band for grounded highlights + voice memo (`views.js`, `styles.css`)
- AI Review detail panel gains a Resume section between the snapshot and the missing flags: scan-status row with filename, View/Hide raw text, Rescan (hidden PDF input), structured education/experience/projects/certifications/contact rows, and a provenance legend (`views.js`)
- Capture drawer Resume tab now has a Structured / Raw toggle — structured mode groups extracted fields into labelled sections with extracted values highlighted, raw mode keeps the parsed `<pre>` (`views.js`, `styles.css`)
- Header "open resume" button on the capture card jumps straight to the drawer's Resume tab (`views.js`)
- `TIQ.resumeInfo(c)` normalizes the polymorphic `resumeUpload` into `{name, state, parsedAt, error}` with states `legacy` / `scanned` / `pending` / `failed` / `missing` (`data.js`)
- Per-field provenance: `TIQ.ai.applyParsedData` stamps `candidate.provenance[field] = "resume"` for every backfilled field, rendered as blue (resume) vs grey (form) dots on the card, detail panel and drawer (`data.js`, `styles.css`)
- `TIQ.fieldSource()` / `TIQ.citeSource()` helpers for reading and wording provenance (`data.js`)
- `tests/resume-card.test.js`: resume state normalizer, provenance stamping, citation attribution, resume-bar states, band content/caps/expander, card section order, detail-panel Resume section, drawer Structured/Raw toggle

### Fixed
- Booth "Copy QR link" no longer throws an uncaught clipboard rejection when the document is unfocused; it falls back to the legacy copy path and always confirms with a toast (`views.js`).
- Capture content guards reject dates, locations, organizations, and awards as inferred tools; shorten source-backed project facts, preserve explicit award years without duplication, retain leadership accomplishments separately from role counts, and deduplicate Evidence dates/metadata (`views.js`, `tests/capture-content.test.js`).
- Saved candidate submissions now offer “View my recruiter card,” opening the exact record without reordering the deck; upload progress clarifies that review and consent are required to create the card (`candidate-form.html`, `candidate-intake.js`, `app.js`, `views.js`, `index.html`).
- Removed filename/demo/degree fallbacks from real candidate data; résumé replacement clears obsolete machine values and prevents late scans from overwriting newer uploads or other candidates, with varied-layout and failure regression tests (`data.js`, `views.js`, `index.html`, `tests/resume-flow.test.js`, `tests/resume-highlights.test.js`).
- Removed the redundant workflow utility strip and repeated “Step X of 4” banner; the sidebar remains the single progress cue, giving page content more room (`index.html`, `app.js`, `workflow.js`, `styles.css`, `tests/accessibility-responsive.test.js`)
- Capture-card skill rows now cap visible chips by row density, moving overflow into the hover/focus `+N` chip so long labels cannot collide with skill text or leader bars (`views.js`, `styles.css`, `tests/resume-card.test.js`)
- Capture-card skills now keep category labels on the left, skill chips on the right, and use a side `+N` chip after three visible skills; legacy string-only resume uploads no longer render a dead `ON FILE` strip or label (`views.js`, `styles.css`, `tests/resume-card.test.js`)
- Mobile app shell now feels more native: the J.B. Hunt logo is constrained, workflow steps become a horizontal tab rail, capture cards/buttons scale with `clamp()`, and formerly-small kiosk/scan/recording touch targets are easier to tap (`styles.css`, `index.html`)
- WCAG audit fixes: candidate intake now allows pinch zoom, exposes a main landmark, programmatically associates labels with all fields/selects, uses stronger muted-text contrast, and raises form controls/buttons to 44px touch targets (`candidate-form.html`, `tests/accessibility-responsive.test.js`)
- Main app accessibility fixes: added a skip link, corrected capture-card candidate heading order, strengthened breadcrumb/recruiter-label contrast, and constrained the kiosk QR column/card on small phones so 420px content is not clipped (`index.html`, `views.js`, `styles.css`, `tests/accessibility-responsive.test.js`)
- The generic noun "Analytics" was in `SKILLS_DICT`, so any sentence containing the word minted a skill: a recruiter transcript that ended "...working with SQL and Tableau for analytics." added three skills instead of two, and a resume bullet about interest in analytics put an unearned badge on the card. It is removed from the extraction dictionary while staying in the `data` group match list, so a recruiter who types it still gets the Data & Analytics group (`data.js`, `tests/resume-parser.test.js`, `tests/transcript-hydrate.test.js`)
- Grounded highlights no longer surface weak or fabricated statements. `buildAccomplishments` walked sections in a fixed order with certifications first, so two raw certificate names and an invented fragment ("Handled 14 students") took all three slots while an award, a shipped project and a leadership role never reached the card. Highlights are now harvested from the candidate's own sentences (raw text, experience bullets, projects, certifications), placed on a deterministic preference ladder — recognition → built → formal leadership role → ownership → quantified impact → certification → fallback — and filled one rung at a time so the three highlights show three different facets of the candidate. pdf.js soft line wraps mid-sentence are re-joined instead of truncating a claim, and school names, section headings, bare dates and contact lines can never be selected (`data.js`, `tests/resume-parser.test.js`). A stored set from an older build is also detected (`TIQ.highlightsAreStale`: any resume-sourced line missing from the current `rawText`) and rebuilt at load time, so the weak old bullets cannot outlive the fix without a re-scan (`data.js`, `tests/highlight-parser.test.js`)
- A candidate scanned by a buggy build could never be repaired from the capture drawer: the rescan input was rendered only when there was no parse at all. It now also renders for a stale parse, so the PDF can be re-read and the sections rebuilt (`views.js`)
- A re-scan now always re-derives accomplishments, so highlights computed from a previous broken parse no longer survive the scan; and it refreshes fields whose provenance is `"resume"` (skills, links, gpa, name/contact, address) while never overwriting recruiter-entered values (`data.js`)
- Browsers were serving pre-fix JavaScript from cache — the `?v=` cache-buster had not been bumped alongside `data.js`/`views.js`/`styles.css`, so the parser fixes never reached the page even though the server had them (`index.html`)
- **"No grounded highlights" root cause**: PDF page text was assembled with `content.items.map(i => i.str).join(" ")`, which throws away every `hasEOL` flag pdf.js sets. On a real one-page resume that collapsed all 35 lines into a single line, so `_extractExperience`, `_extractProjects`, `_extractEducation` and `_extractCertifications` — all of which split on `\n` — saw a one-line document and returned nothing. Page text is now assembled by `TIQ.ai.pageTextFromContent`, which keeps the line breaks (and tolerates missing/empty content), restoring experience, projects, certifications, address and grounded highlights (`data.js`, `tests/resume-parser.test.js`)
- PDF ligature runs are rejoined when assembling page text, so `Certi fi cations/Training:` and `Pro fi cient in Java` become `Certifications/Training:` and `Proficient in Java` again — the certifications prefix and the contextual skills regex both match only after this (`TIQ.ai.pageTextFromContent` in `data.js`)
- A certification entry split across a pdf.js line break (`...; IT Specialist in` / `Computational Thinking.`) is continued onto the next line instead of being truncated and dropped, with all-caps section headers still rejected as continuations (`TIQ.ai._extractCertifications` in `data.js`)
- `_extractAddress` no longer builds an address out of an institution name: `Bentonville High School   Bentonville, AR` resolves to `Bentonville, AR` and `123 College Ave, Nashville, TN 37206` to `Nashville, TN 37206`, by dropping everything up to the last comma and then trying 3→1 trailing words until one is not a school/university (`data.js`)
- Two test suites were exiting early and still reporting 0 FAIL because `assert` never throws: `TIQ.ai._normalizeDateRange` / `_parseDateToken` relied on `this` (so the aliased call in `resume-parser` threw) and `apply-resume` invoked `newFieldTests()` without `TIQ` in scope — 13 backfill assertions had never run. Both are fixed and the suites now print their failures (`data.js`, `tests/resume-parser.test.js`, `tests/apply-resume.test.js`)
- Grounded AI highlights no longer blank out when a candidate's stored `accomplishments` array is empty: the card regenerates from the parsed resume's projects, certifications and experience instead of trusting possibly-stale state. Raw summary text is still deliberately not dumped as filler, and a candidate with no resume and no notes still shows the empty prompt (`views.js`, `tests/card-density.test.js`)
- Scanned or image-only PDFs no longer fail with `Cannot read properties of null (reading 'contact')`. A PDF whose extracted text is under 40 characters fails fast with an actionable message telling the recruiter TalentIQ reads text-based PDFs only, and `applyParsedData` tolerates a null parse instead of throwing (`data.js`)
- Dropzone accept attribute and hint copy no longer advertise `.doc`/`.docx`, which the parser has never supported — every live gate was already PDF-only (`components.js`)
- Work-authorization citations no longer hard-code "— recruiter input": a value that exists only because the resume was scanned is now cited as "— resume" via `TIQ.citeSource` (`data.js`)
- A bare date-range line on its own row (`Aug 2025 - Present`) no longer opens a phantom experience entry whose title is the date string; it now attaches to the entry above it (`TIQ.ai._extractExperience` in `data.js`)
- Secondary schools are no longer captured as post-secondary education, and `Expected Graduation: May 2027` no longer becomes a school — the degree-pattern abbreviations were missing a trailing `\b`, so `M\.?A\.?` matched the "Ma" in "May" (`TIQ.ai._extractEducation` in `data.js`)
- `degreeProgram` can now be backfilled from a resume. Both candidate constructors pre-filled `"Bachelor of Science"` before the scan ran, which made the backfill a silent no-op; the default is now only assumed when there is no resume to scan (`TIQ.intake.buildCandidate` in `data.js`, manual-add form in `views.js`)
- The resume band always renders. It previously returned an empty string when nothing was extracted, so a candidate with no parse showed no band at all; it now renders a dashed empty state explaining what scanning would add (`_resumeBandHtml` in `views.js`)
- Summary citations for school/major/graduation no longer hard-code "— intake form": a value that only exists because the resume was scanned is now cited as "— resume" (`TIQ.citeSource`) (`data.js`)
- Capture card no longer silently discards skills: anything hidden by the 3-group cap or the `methods` filter now appears on a trailing "ADDITIONAL SKILLS" row as a `+N` chip whose hover tooltip lists every leftover skill, while overflow inside a visible group still shows as that row's own `+N` (`views.js`)

### Changed
- Booth Setup rebuilt as a self-explanatory booth poster a recruiter can leave on screen: black masthead band (logo, event, date, location), large candidate-facing headline and QR framed in ink, a 3-step scan-to-recruiter sequence, visible form destination URL, and a quiet right rail with labelled controls (Copy QR link, Print poster, Open form, Edit event details / Edit form destination) replacing the cryptic corner ⓘ buttons; duplicated "Scan to Submit Profile" copy and the Mode row removed (`views.js`, `styles.css`)
- Made the fictional candidate deck the main website’s default, with the user-authorized one-time removal of previous TalentIQ candidates, notes, recordings, metrics, and alternate demo storage; new data survives subsequent reloads and intake uses the same dataset (`demo-candidates.js`, `app.js`, `candidate-intake.js`, `index.html`, `candidate-form.html`).
- AI Review detail now uses four accessible, persistent tabs; tab changes preserve draft edits, and the duplicate “Decision Hub” kicker is removed (`components.js`, `views.js`, `styles.css`, `index.html`)
- Cache busters: `styles.css` to `?v=26`, `workflow.js` and `app.js` to `?v=21` (`index.html`)
- Script/Style cache busters: `styles.css` bumped to `?v=25` (`index.html`)
- Script/Style cache busters: `styles.css` bumped to `?v=24`, `views.js` to `?v=23` (`index.html`)
- Script/Style cache busters: `styles.css` bumped to `?v=23`, `views.js` to `?v=22` (`index.html`)
- Script/Style cache busters: `styles.css` bumped to `?v=22` (`index.html`)
- Script/Style cache busters: `styles.css` bumped to `?v=21`, `views.js` to `?v=21` (`index.html`)
- Script/Style cache busters: `styles.css` bumped to `?v=13`, `views.js` to `?v=17` (`index.html`)
- The FROM THE RESUME band moved out of the capture card and into the capture right column, above the Resume/Voice/Notes drawer. The left column card keeps the resume bar, header, skills, grounded AI highlights, voice memo and attention flags; the drawer is unchanged and the band stays supplemental. Band CSS re-scoped from `.capture-stack .candidate-card` to `.capture-col-right` (`views.js`, `styles.css`)
- The resume band renders the normalized degree as `Bachelor of Science in Data Science` instead of the raw `Bachelor Data Science` substring, and prefers `edu.degreeProgram` when present (`views.js`)
- Capture card: the count-only meta strip (GPA / CERTS / PROJECTS / POSITIONS) is gone — counts were never a representation of the resume, so the card now renders the actual extracted values in the resume band and a real tally (`N skills · N roles · …`) on the resume bar (`views.js`)
- Capture card sections now live in a `card-scroll` wrapper that only scrolls when the content exceeds the fixed card height (cards are `height:100%` of the stack and only ~312px tall on mobile), so the conversation band and gap flags are no longer clipped away; `touch-action` was relaxed from `none` to `pan-y`, leaving horizontal swipe gestures untouched (`views.js`, `styles.css`)
- Script/Style cache busters: `styles.css` bumped to `?v=11`, `data.js` to `?v=8`, `views.js` to `?v=15` (`index.html`)
- Skill group leader lines now use an even repeating-dash rule that runs from the label to the first chip with equal gaps on both sides (`styles.css`)
- The `+N` skill chip now opens a styled dark hover/focus tooltip listing the hidden skills instead of the native `title` popup (`views.js`, `styles.css`)
- Script/Style cache busters: `styles.css` bumped to `?v=10`, `views.js` to `?v=14` (`index.html`)
- Event Info view: replaced the inline Event Details and Form Destination Configurator editors with ⓘ info buttons in the top-right corner of the Event Booth card and the QR panel, each opening a modal to edit its details (`views.js`, `styles.css`)
- Script/Style cache busters: `styles.css` bumped to `?v=9`, `views.js` to `?v=13` (`index.html`)
- Capture card profile now uses a stable 4-column meta grid (GPA / CERTS / PROJECTS / POSITIONS) and compact menu-style skill icon rows with monogram fallback (`views.js`, `styles.css`)
- Grounded AI highlights no longer fall back to `summary`; only grounded accomplishments / recruiter-note text render, with an honest empty state (`views.js`)
- Graduation dates now render through `TIQ.formatMonthYear()` in the capture card and summary generator (`views.js`, `data.js`)
- Skill icons now render as colorized masked tiles when a local asset exists, and unsupported skills fall back to monograms instead of blank image slots (`skill-icons.js`, `styles.css`)
- Added a second icon batch for Java, C#, Excel, AWS, Azure, Power BI, Tableau, Salesforce, Oracle, and MATLAB/MathWorks (`assets/skill-icons/`, `skill-icons.js`)
- Increased the icon art size to the visual ceiling that still keeps the menu rows consistent (`styles.css`)
- Expanded the skill icon tiles to the largest comfortable size in the capture card (`skill-icons.js`, `styles.css`)
- Resume parsing now captures projects/certifications from the actual PDF text format and feeds grounded highlights from parsed resume data (`data.js`, `views.js`, `tests/resume-parser.test.js`)
- Added semantic recruiter icons for APIs, data visualization, forecasting, PowerPoint, logistics, supply chain, operations, optimization, leadership, communication, teamwork, problem solving, and analytics (`assets/skill-icons/`, `skill-icons.js`, `tests/skill-icons.test.js`)
- Rehydrated persisted parsed resumes from stored raw text on load so old cards pick up the fixed project/certification counts and cleaned highlights (`data.js`)
- Replaced placeholder Java/Excel assets and added a real CSS asset so the capture-card icon rows are no longer blank for common web skills (`assets/skill-icons/`, `tests/skill-icons.test.js`)
- Removed the startup-wide resume reparse so the app no longer blocks on boot (`data.js`)
- Switched skill tiles from mask-based rendering to plain local SVG `<img>` assets sourced from Simple Icons / Lucide-style files (`skill-icons.js`, `styles.css`)
- Split the skill row renderer so brandable tools use SVG icons while abstract domain skills render as readable pill badges (`skill-icons.js`, `views.js`, `styles.css`)
- Cache-busted the skill icon script and capture-card stylesheet after the icon rendering update (`index.html`)
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
- QR form awaits the resume scan before showing the success screen (button reads "Scanning resume…", 20s timeout guard) so closing the tab early no longer silently skips the parse (`candidate-form.html`)
- `parseAndStoreResume` sets `resumeUpload = {name, type, parsedAt:""}` up front; every failure path (pdf.js not loaded, PDF open/page errors, reader error) records `parseError`, a `RESUME_SCAN_FAILED` audit entry and a `resume-parse-failed` metric instead of failing silently (`data.js`)
- QR intake candidates store `resumeUpload` as an object with `parsedAt:""` when a PDF is attached but not yet scanned (`data.js` `buildCandidate`)
- `getMissingFlags` reports **Resume Not Scanned** when a resume is attached but never parsed (strings remain legacy "uploaded" records with no flag) (`data.js`)
- Bulk import and manual-create now surface resume parse failures (failed counter in the import toast; toast on manual create) (`views.js`)
- AI integrity meter counts a resume as captured only when it has actually been scanned (`views.js`)
- Swipe right = Follow Up; left = Reviewed (no hard reject) (views.js)
- Accessible capture drawers with focus-visible + aria-selected (styles.css, views.js)

### Removed
- **Capture-card header actions**: the scan-status pill (`NO RESUME` / `SCANNED` / `ON FILE` / `SCAN FAILED`) and the 📄 jump-to-resume button are gone — the header is now avatar + name/school/grad only, and `TIQ.views._resumeStateBadgeHtml` was deleted with them (`views.js`, `styles.css`)
- **"No Resume Attached" card block**: the dashed `NO RESUME ATTACHED · Scan ▸` / "Form entries only — nothing verified" bar no longer renders — a candidate without a resume simply has no resume bar, so the header leads the card (`views.js`, `styles.css`)
- **Resume Intake panel**: the right-column "Resume Intake" card (`Import Resumes (PDF)` / `Add Manually` + hidden file input) is gone along with its handlers; bulk import remains on the empty-state button and per-candidate scanning on the drawer dropzone (`views.js`, `styles.css`)

### Fixed
- **Silent resume scan failures on QR intake**: a card could be created with a resume attached but never scanned (skills/GPA/highlights empty, no flag) because the success screen appeared while the parse ran async — closing the tab or a blocked pdf.js CDN aborted it with no feedback. The form now waits for the scan, tells the student the outcome, and unscanned resumes are flagged "Resume Not Scanned" (repro'd headless: interrupted scan and blocked CDN both reproduce the original card) (`candidate-form.html`, `data.js`, `views.js`)
- **Demo Candidate Card Hang (Priya Sharma)**: Swiping right / tapping Follow-Up on a generated demo candidate threw `TypeError` on `c.auditLog.length` because demo candidates were created without `auditLog`/`accomplishments`/`attributes`/`keySkills`/`parsedResume`. The card got stuck mid-swipe and the Capture view appeared frozen. Demo candidates are now fully shaped, and `_setCaptureStatus`/`_undoLastCaptureAction`/`addAuditEntry` tolerate records missing `auditLog` (fixes already-persisted cards) (`views.js`, `data.js`)
- **Capture overflow label**: Swipe-right overlay and triage button now read "Follow Up" instead of "Interview Requested"; right swipe sets status `Follow-Up` (`views.js`)
- **AI Review search robustness**: `_getFilteredCandidates` no longer crashes if a persisted candidate has non-array `skills`/`areasDiscussed` (`views.js`)
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
- Inline "Event Details" and "Form Destination Configurator" form cards from the Event Info left column — their fields moved into the corner info-button modals (`views.js`)
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
