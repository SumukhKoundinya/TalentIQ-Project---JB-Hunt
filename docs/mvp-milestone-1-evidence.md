# MVP milestone 1 — structured Capture evidence

Date: 2026-10-07. Base commit: `79ba5c7`, branch `feature/ai-resume-parser`, existing uncommitted user work preserved. This is an incremental checkpoint, not completed MVP or accessibility certification.

## Implemented

- Non-destructive startup compatibility hook; no record/metric/study/audio cleanup.
- Optional Notes disclosure with existing role/location/discussed-area/next-step fields plus technical interests and two question fields. Recruiter provenance, persistence, refresh protection and factual certification invalidation; no automatic approval or status change.
- Engineering/product sample prompts accepting coursework/personal projects/leadership; no suitability judgment.
- Per-attempt recording permission before microphone start, audited as recruiter self-report, not verified consent/speaker identification. Existing unverified transcript treatment retained.
- Global/Capture shortcuts defer to native controls/editable content. Existing card/source viewer/layout are not redesigned.

## Automated tests

All 46 `tests/*.test.js` files run individually: **43 pass, 3 fail**. Untouched baseline was 42/45; the added structured test passes. Existing failures are unchanged:

- `booth-setup.test.js`: six pre-existing poster size/spacing assertions.
- `capture-summary.test.js`: pre-existing native popover markup assertion.
- `resume-card.test.js`: two pre-existing left/right-column markup assertions.

Focused checks passed: actual storage writes, optional normalization, escaped rendering, custom topics, resume-refresh preservation, no status advancement, approval without optional GPA/phone/work authorization, and conversation-change invalidation. `review-integration.test.js` passes genuine-reload certification and status Undo/audit preservation. A fingerprint-initialization reload regression was found and corrected without changing its assertions.

Baseline diff/hashes and per-file logs are in the approved OpenCode temporary directory under `talentiq-mvp-baseline/` (`m1/results.json` and logs). `git diff --check` passed.

All 57 files in the saved pre-existing-file hash inventory were compared again: no unexpected changes outside the milestone edit allowlist. No commit, push, stash, reset or cleanup was performed.

Files changed for this checkpoint (in addition to pre-existing user diffs): `data.js`, `workflow.js`, `views.js`, `app.js`, `styles.css`, `index.html`, `candidate-form.html`, `README.md`, `CHANGELOG.md`, `tests/harness.js`, `tests/empty-workspace.test.js`. New: `capture-workflow.js`, `tests/structured-capture.test.js`, `tests/structured-capture-browser.cjs`, `docs/superpowers/plans/2026-10-07-mvp-implementation.md`, this evidence file. The ignored observer `skill-observations/checkpoints.log` received a no-observations checkpoint. Existing isolated browser regression screenshots were regenerated under ignored `.openchamber/screenshots/`.

## Browser checks

macOS, headless Chrome for Testing **151.0.7922.34** / Playwright, isolated contexts, localhost:8000, synthetic address, reduced motion requested. No email handoff. Recording start is stubbed on the actual recorder instance to reject as unavailable; no successful microphone recording or consent acquisition is claimed.

`tests/structured-capture-browser.cjs` passed:

| Steps | Expected / actual |
| --- | --- |
| Notes; focus disclosure; Space | Opens without candidate sorting — passed |
| Enter/blur fields; select Coursework; choose Product Owner | Values/provenance persist; prioritization prompts; status New — passed |
| Record without permission | No recorder start; focus permission checkbox — passed |
| Acknowledge; record with unavailable recorder | One simulated start; acknowledgement consumed; audit retained — passed |
| Notes tab; Left then Right | Tabs switch, status stays New — passed |
| Reload; demo recruiter; Capture | Existing notes/questions retained — passed |
| Open fields at 1440×900, 1280×720, 768×1024, 390×844, 320×844; scroll to next steps | Fields fit horizontally and are reachable; no horizontal page overflow — passed |

`tests/resume-fidelity-browser.cjs` separately passed actual supplied-PDF import, concise bullets, keyboard source navigation/focus/dismissal and responsive card/control stability. Optional `.cjs` checks are not counted as JavaScript-suite files. Other `.cjs` and Python asset checks were not rerun for this milestone.

## Limitations / next milestone

- VoiceOver/Safari/other screen readers, 200% zoom, complete contrast evaluation, actual microphone/audio save and network-disabled parsing are **not verified** here. Focused Chromium checks are not WCAG conformance proof.
- Provider choice, authentication/private shared PDFs, cross-device delivery, sync/outbox/conflicts, previewed migration and offline installation are not implemented.
- Simplified Review, recap attribution using new fields, comparison/invitation/certified export and controlled-study delivery remain subsequent milestones.
- Parsing/recaps are deterministic rules/templates, not cloud/generative AI. Sponsor AI acceptance remains unresolved. No study benefit, real-data authorization, email delivery or completed MVP is claimed.
