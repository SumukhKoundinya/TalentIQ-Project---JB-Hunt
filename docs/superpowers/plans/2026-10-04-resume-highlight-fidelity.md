# Resume Highlight Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make candidate-card highlights complete, source-grounded, deduplicated, correctly grouped, and usable across viewport sizes for varied resume formats.

**Architecture:** Keep parsing and source ownership in `data.js`; derive compact highlights from structured entries and exact source sections in `views.js`; render naturally sized card content with a bounded, keyboard-accessible scroll region and persistent actions in `styles.css`. Protect data refresh semantics so replacing a resume invalidates generated highlights without erasing recruiter-entered corrections.

**Tech Stack:** Static vanilla JavaScript and CSS; Node test scripts using the repository's existing harness; browser validation through the running local server. No new dependencies or build step.

**Spec:** User requirements in the conversation dated 2026-10-04, also supplied as `pasted-context-1.txt` (attachment not found in the checkout).

## Global Constraints

- Inspect current parser, highlight generator, and card renderer before editing.
- Do not hardcode candidate names, employers, majors, categories, counts, metrics, or example summaries.
- Keep every displayed statement supported by the candidate's resume or recruiter-entered data; preserve qualifiers and source ownership.
- Keep resume, notes, review, branding, discrepancy handling, and candidate workflows intact.
- All dynamic UI text must use existing escaping helpers.
- No build dependencies; run tests with `node tests/<name>.test.js`.
- Record code changes under `CHANGELOG.md` → `[Unreleased]`.

---

### Task 1: Reproduce parser, source ownership, and replacement defects

**Files:**
- Modify: `tests/resume-parser.test.js`
- Modify: `tests/capture-content.test.js`
- Modify: `tests/capture-summary.test.js`
- Modify: `tests/resume-flow.test.js`

**Interfaces:**
- Inputs: raw resume text and parsed resume records using the existing `TIQ.ai.extractResumeData`, `TIQ.generateAccomplishments`, and `TIQ.views._captureVisualEntries` functions.
- Outputs: complete source-backed card facts and explicit title/company/location/date/major fields; no repeated equivalent facts; replacement clears only stale generated resume highlights.

- [x] Add fixtures for multiple roles/projects, unlabeled coordination work, labeled leadership, missing dates, long role titles, sparse resumes, and degree/major variants.
- [x] Assert source facts remain complete after wrapping/summary; reject fragments and cross-section facts.
- [x] Assert each displayed category appears once with count equal to displayed entries, while any total-resume count is labeled distinctly.
- [x] Assert replacing a resume refreshes generated values and preserves recruiter edits/discrepancy state.
- [x] Run focused tests to establish expected failures before implementation.

### Task 2: Make extraction and highlight derivation source-aware

**Files:**
- Modify: `data.js` (`_extractExperience`, `_extractProjects`, `_extractEducation`, `buildAccomplishments`, resume replacement/backfill)
- Modify: `views.js` (`_resumeHighlightEntries`, `_captureContributionFacts`, `_captureVisualEntries`, compact summary)

**Interfaces:**
- `TIQ.ai._extractExperience(text)` continues returning role records with independent `title`, `company`, `location`, `dates`, and `description` fields.
- `TIQ.views._captureVisualEntries(candidate)` returns entries with category, source-owned title/metadata, and one or two complete supported facts.

- [x] Parse experience title/company/location/date segments from varied separators without truncating title prefixes or duplicating metadata.
- [x] Bound experience/project/leadership facts to their actual resume sections and associated role/project.
- [x] Remove keyword-only leadership inference; use explicit leadership section/role context, otherwise omit category.
- [x] Deduplicate equivalent statements by normalized source text, retaining one complete source-supported version.
- [x] Replace phrase truncation with complete-sentence selection or faithful concise synthesis; keep original complete evidence accessible.
- [x] Prefer supported specific major over broad degree text; do not replace recruiter corrections.
- [x] Rerun parser/source-ownership/replacement tests to green.

### Task 3: Group categories and render complete highlights

**Files:**
- Modify: `views.js` (`_captureHighlightItemHtml`, `_resumeHighlightsHtml`, `_buildCardHtml`, `fitStation`)
- Modify: `tests/capture-visual.test.js`, `tests/capture-spacing.test.js`, `tests/capture-responsive.test.js`

**Interfaces:**
- The rendered list groups adjacent entries by category, showing one heading/count for displayed items; additional/total counts are explicitly distinguished.
- Highlight overflow is exposed as a named, keyboard-scrollable region; candidate card actions remain outside that scroller and reachable.

- [x] Render category groups once and derive shown counts from the entries actually rendered.
- [x] Preserve natural text wrapping, complete bullets, bolded metrics, and empty-category omission.
- [x] Remove JavaScript height-based item hiding; allow optional complete-source expansion only if needed.
- [x] Keep highlights naturally sized when space permits and scrollable when constrained, without shrinking text or hiding footer actions.
- [x] Verify replacing resumes clears stale generated highlights while leaving recruiter notes and corrections intact.

### Task 4: Validate desktop, laptop, tablet, and phone behavior

**Files:**
- Modify: `styles.css` (only if browser checks find a concrete layout defect)
- Modify: `CHANGELOG.md`
- Modify: `index.html` cache keys if runtime assets change

**Interfaces:**
- Desktop, 13-inch laptop (`1280×800` or closest available), tablet, and phone preserve full card content, visible/scrollable overflow, and accessible review actions.

- [x] Run targeted Node regressions, then all repository tests and record unrelated baseline failures.
- [x] Inspect Capture at desktop (1440×900, closest available to 1280×800), tablet (768×1024), and phone (390×844); check scroll height and action reachability.
- [x] Run `git diff --check` and verify the changelog/cache keys against the actual changed files.
