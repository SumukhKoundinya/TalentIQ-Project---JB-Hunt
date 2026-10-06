# Handoff: Revise TalentIQ Set Up Screen

## Goal

Implement the user's revised Set Up screen as a polished, candidate-facing career-fair check-in graphic within the existing TalentIQ application. Match the supplied screenshot's overall application format: dark left sidebar, page header, and a two-column setup workspace. The event/instructions content sits on the left; a large QR card sits on the right. Make the QR code the dominant visual and ensure the complete layout fits comfortably on a 13-inch Mac display.

This is an implementation handoff, not permission to redesign other routes or rewrite the app. Preserve existing user changes and inspect the live repository before editing.

## Approved visual and content requirements

### Application frame

- Preserve the existing TalentIQ shell: dark sidebar/navigation, light content background, Set Up page header, recruiter indicator, and established typography/color system.
- Retain the familiar two-column composition from the user's screenshot: compact left column and wider QR column (roughly 40/60, adjusted as needed for real viewport dimensions).
- Keep the existing demo login/recruiter selection flow if it is already implemented. This task does not introduce real authentication or collect passwords.
- Use the supplied screenshot as the layout reference, not as a requirement to retain every displayed widget.

### Left column: event and candidate instructions

1. **Dark Event Booth card**
   - Show the event name as the prominent title (the screenshot's sample is “Logistics & Technology Fair 2026”). Use the current event data dynamically; do not replace the event title with the J.B. Hunt logo or hard-code the sample event.
   - Keep the small “Event Booth” eyebrow if consistent with the existing UI.
   - Put an icon-only event information/edit control at the top-right. It must have an accessible name, but no adjacent visible “Edit Event” label.
   - Replace the former copy (“Quick candidate capture for the career fair floor. Brand & QR Check-in.”) with the concise heading **“Check In”**. Do not restore the old sentence.

2. **White instructions card replacing metadata**
   - Remove the Location, Date, and Mode rows from this screen. They must not remain in this module or be duplicated elsewhere in the setup content.
   - Use this space for short, easy-to-scan candidate instructions. Proposed copy from the approved wireframe:
     1. “Scan the QR code with your phone.”
     2. “Complete your profile.”
     3. “Meet with a recruiter.”
   - Keep the card visually compact and aligned with the event card; use a clear heading such as “How to check in.” Avoid adding unsupported timing, requirements, or claims.

3. **J.B. Hunt logo and Capture action**
   - Show the J.B. Hunt logo as a separate brand element below the instructions card, with visible breathing room. Do not embed it inside the instructions card.
   - Preserve the existing **Open Capture** action if present, positioned clearly in the left column without a camera preview.
   - Remove the booth camera widget entirely from Set Up: no camera preview, live indicator, camera controls, or framing copy.

### Right column: QR card

- Keep a white QR card with an icon-only QR/edit/configuration control at its top-right (accessible name required; do not add a visible “Edit” label unless the existing behavior requires it).
- Remove both visible text lines **“Scan to Submit Profile”** and **“Point your phone camera at the code above”** (or equivalent “point your phone here” instruction). The QR should use the freed area and be as large as practical while keeping clear quiet-zone/margins and preserving scannability.
- Remove “Candidate check-in” and “Candidate profile form” headings if present. Do not put substitute headings above the QR.
- Keep the existing **Print Poster** and **Copy QR Link** controls beneath the QR, aligned and usable.
- Preserve current QR generation, event editing, QR editing, copy-link, and print behavior; this is a presentation/layout change, not a QR pipeline rewrite.

## Responsive behavior and accessibility

- At desktop 1440×900 (and the available 13-inch Mac viewport), the two cards should fit in the visible workspace without accidental clipping, awkward large gaps, horizontal scrolling, or forcing the QR to shrink excessively. Keep the left column's event/instructions/logo/CTA stack proportionate to the QR card.
- At mobile 390×844, stack the columns cleanly; keep event title and instructions readable, QR square and scannable, and print/copy controls usable. No horizontal overflow.
- Respect existing responsive breakpoints and design tokens. Do not introduce a separate visual system.
- Provide visible keyboard focus, semantic buttons, accessible names for icon-only controls, and sensible reading order. Maintain adequate text contrast and touch targets.

## Scope and safety

- Project root: `/Users/nirmay/Desktop/jb hunt`; vanilla-JS static SPA, no build step or package manager.
- Before editing, inspect `git status --short`, the current `HANDOFF.md`, and the current implementation in `index.html`, `views.js`, `styles.css`, `app.js`, `config.js`, and relevant tests. File roles and line numbers may have changed; locate code by content, not stale line references.
- Preserve all pre-existing/unrelated modifications and untracked files. Never run `git reset`, `git checkout`, `git stash`, `git clean`, or `git add -A`. Do not edit nested `booth-poster-redesign/` or other unrelated projects.
- Keep the change scoped to Set Up/kiosk rendering, styling, any directly required event handling, focused tests, cache keys, and changelog. Do not redesign Capture, alter candidate data semantics, or change unrelated routes.
- The prior contents of this handoff described a separate Capture-highlight word-limit task. They are intentionally replaced by this UI handoff at the user's request; do not resume that separate task unless the user asks.

## Suggested implementation sequence

1. **Audit baseline:** inspect the current working tree and existing Set Up/kiosk render/event code, CSS, navigation, QR actions, relevant tests, and `CHANGELOG.md`/`index.html` cache-busters. Record any existing changes in the target files before editing; preserve them.
2. **Turn requirements into focused tests first:** add or update tests for dynamic event-title display and edit trigger, “Check In” copy, instructions replacing all location/date/mode content, separate logo, removed camera/QR helper headings, QR rendering and print/copy controls, and the Open Capture action. Run them and confirm the expected failure before production changes.
3. **Implement the smallest UI change:** adjust existing kiosk markup/rendering and styles to achieve the screenshot's shell and two-column proportions. Reuse existing state, QR generation, and edit/print/copy handlers. Keep the QR generated from its existing target; do not alter its destination or candidate intake behavior.
4. **Responsive/accessibility pass:** handle mobile stacking, preserve visual hierarchy, confirm QR dimensions/quiet zone, ensure icon-only controls have accessible names and keyboard focus, and remove any camera-specific Set Up behavior only if it is now truly unused in this view. Avoid removing shared camera code used elsewhere.
5. **Verify in browser:** run the app from the repository root using the existing local server if available. Inspect the Set Up screen at desktop 1440×900 and mobile 390×844. Confirm the final QR is present and actions work; check for overflow, clipping, overlap, and console errors. If browser interaction is unavailable, state exactly what could not be verified.
6. **Run tests:** run the focused Set Up/QR/accessibility tests, then every `tests/*.test.js` file and `git diff --check`. Capture each command's actual exit status. Do not silently ignore unrelated failures; identify whether each failure is pre-existing by examining the untouched baseline/context, and do not broaden scope to fix unrelated issues.
7. **Finalize docs/cache:** read current `CHANGELOG.md` and script references in `index.html`. Add a concise entry under `[Unreleased]`. Bump cache-busters for changed JS/CSS assets in every relevant HTML file, keeping matching versions consistent. Do not bump unrelated assets.
8. **Review diff:** inspect only the task-related diff plus status. Ensure no unrelated files were changed and summarize files changed, behavior, test results, and browser verification.

## Acceptance checklist

- [ ] Set Up retains the screenshot's sidebar/header and two-column composition.
- [ ] Event name—not the J.B. Hunt logo—is the prominent Event Booth title and remains data-driven/editable.
- [ ] Event edit control is icon-only visually and accessibly named.
- [ ] Former event-floor sentence is replaced by “Check In”.
- [ ] Location, date, and mode rows are gone; the left white card contains concise candidate instructions instead.
- [ ] J.B. Hunt logo appears separately below the instruction card with clear spacing.
- [ ] Booth camera preview, camera controls, live indicator, and framing text are absent from Set Up.
- [ ] No “Candidate check-in,” “Candidate profile form,” “Scan to Submit Profile,” or “Point your phone here/at the code above” text consumes QR space.
- [ ] QR code is visibly enlarged while remaining scannable; QR configuration control, Print Poster, and Copy QR Link still work.
- [ ] Open Capture remains available if present in the baseline.
- [ ] Desktop and mobile layouts are readable, unclipped, and have no horizontal overflow.
- [ ] Focused tests, full test suite, and `git diff --check` results are reported accurately.
- [ ] Changelog and cache-busters are updated only as needed.

## Prompt for the next implementation session

> Implement the revised TalentIQ Set Up screen described in `HANDOFF.md`. First inspect the repository and `git status --short`; preserve every pre-existing/unrelated change and do not stage, reset, stash, clean, or edit `booth-poster-redesign/`. Follow the plan and acceptance checklist in the handoff. The key final correction is that the white card below the dark Event Booth card contains candidate instructions instead of Location/Date/Mode, and the QR card must not show “Scan to Submit Profile” or “Point your phone here/at the code above”—use that space to enlarge the QR. Keep the supplied screenshot's sidebar/header and two-column layout, use the dynamic event name as the title, keep the icon-only event editor, replace the old event sentence with “Check In,” place the J.B. Hunt logo separately below the instructions card, remove the booth camera, and preserve QR generation/editing/printing/copying plus Open Capture. Work test-first: add/update focused tests, verify they fail for the intended reasons, implement minimally, then run focused tests, the full `tests/*.test.js` suite, and `git diff --check`. Inspect the running UI at desktop 1440×900 and mobile 390×844 if possible. Update `[Unreleased]` in `CHANGELOG.md` and only the necessary matching script/style cache-busters. Report exact test statuses, browser verification, files changed, and any blocked checks; do not claim a manual check that was not performed.
