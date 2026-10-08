# Milestone 2 — simplified Review evidence

Date: 2026-10-07. Working branch: `feature/ai-resume-parser`, base HEAD `79ba5c7`, with existing uncommitted work preserved. No commit, push, deployment, new runtime dependency or provider selection.

## Delivered

- Set Up, Capture and Review are the three active routes. No retired Event Results/Research route or second recruiter selector was restored.
- Recap-first left panel, shared card in initial Profile tab, Resume/Notes references on the right; no permanent queue column, status piles or always-visible filters.
- Find candidate defaults to current-event Reviewed/Follow-Up, exposes all statuses and optional filters, preserves scope/search and selection, and gives empty-result recovery.
- Inline edit/save/cancel, saved-content-only source-check approval, secondary history/rejection and independent status/next steps. Status changes do not approve or revoke an unchanged recap.
- Candidate-specific in-page drafts, reference tab and panel scroll retention. Filter/status changes retain the open record until deliberate navigation.
- Existing source-linked card passages focus extracted Resume evidence; changed source versions fail safely. This is not new claim-level recap generation.
- Desktop two-panel proportions reuse Capture’s 42/58 composition; below 960px the complete panels stack inside a scrollable workspace with navigation outside that scroll region.

## Automated tests

All 47 `tests/*.test.js` files were run individually: **44 passed, 3 failed**. These are exactly the existing baseline failures:

| File | Existing failure |
|---|---|
| `tests/booth-setup.test.js` | Old setup sizing assertions |
| `tests/capture-summary.test.js` | Old native-popover markup assertion |
| `tests/resume-card.test.js` | Old Capture left/right markup assertions |

Focused new `tests/simplified-review.test.js` first failed because the combined Reviewed/Follow-Up population returned no candidates; implementation now passes scope, optionality, actual card reuse, independent status, draft retention and cancel assertions. Existing workflow/integration/citation tests still pass.

Intentional existing-test updates: `tests/review-workspace.test.js` now asserts the approved two-panel Review and explicitly opts into retained Results only for its legacy renderer test. `tests/retired-pages.test.js` and `tests/retired-pages-browser.cjs` now treat Review as connected while preserving the prohibition on Results/Research routes. No failing baseline test was deleted or weakened.

Test logs/current-worktree preservation hashes are under the approved OpenCode temporary directory, `talentiq-mvp-baseline/m2/`. `git diff --check` passes.

## Browser verification

Headless Google Chrome for Testing **151.0.7922.34**, macOS, isolated Playwright browser contexts, local root server on port 8000, reduced-motion preference. Only synthetic `example.invalid` candidates are created by the new test; no user browser data is edited.

Passed scripts:

1. `tests/simplified-review-browser.cjs`: empty-state recovery; two panels and initial Profile; recap read/edit/cancel/save; dirty-draft approval refusal; explicit approval with no status advance; in-page drafts across candidate/Capture navigation; per-candidate Notes tab and 150px scroll restoration; default two-record finder, no-match recovery, five-status access, retained filters, native dialog close; Left/Right/End tabs; closed record remains open; actual card source focus and stale-source refusal; draft rejection leaves candidate status unchanged; no page errors.
2. `tests/retired-pages-browser.cjs`: only Set Up/Capture/Review routes; attempts to navigate Results/Research are ignored.
3. `tests/structured-capture-browser.cjs`: milestone 1 persistence, optional prompts, native keyboard controls, permission-before-microphone and five-size reflow still pass. Recording start is mocked; no microphone recording is claimed.
4. `tests/resume-fidelity-browser.cjs`: real supplied PDF import, concise card bullets, keyboard source navigation/focus/dismissal and responsive control stability still pass.

Review and structured Capture were checked at **1440×900, 1280×720, 768×1024, 390×844 and 320×844**. Review assertions confirm no document horizontal overflow, rendered identity/reference content, native dialog dismissal and footer bounds within the viewport.

Reproduction with the existing test-only Playwright installation:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright CHROMIUM_PATH=/path/to/chrome node tests/simplified-review-browser.cjs
```

`CHROMIUM_PATH` is optional when Playwright already has its browser. The default URL is `http://localhost:8000`; override with `RESUME_URL` for the new Review test, or `TIQ_URL` for the retained-route test.

## Findings and repaired regressions

| Expected | Finding | Remediation / retest |
|---|---|---|
| Footer stays inside tablet viewport | At 768px, footer began at y=1020.5 in a 1024px viewport and extended below it | Scoped Review viewport/flex-chain constraints; all five sizes pass |
| Finder filter changes retain candidate but refresh navigation | Native dialog dismissal could leave old navigation counts | Recompute counts/disabled controls and visible scope on close; no-match return passes |
| Returning to a record restores its reference state | Notes tab reset to Profile, clamping restored scroll | Store tab per candidate with scroll; Notes/150px return passes |

Escape in a focused native search field can clear its search before dismissing a dialog. The filter-retention test focuses Close finder before Escape, preserving native search behavior rather than overriding it.

## Preservation and limitations

- Prior worktree diff and file hashes were saved before editing. Only milestone-listed files were changed; retained legacy Review/comparison/export helpers remain disconnected from the active interface. Results overrides require explicit `enableRetainedResults()` and the app does not call it.
- Draft/selection/scroll retention is within the current loaded page, not durable unsaved drafts across browser reloads. Saved candidate content remains in existing localStorage. Durable offline drafts/outbox remain milestone 7.
- Claim-level recap source links, operational-vs-factual certification refinement and sponsor acceptance remain milestone 3. Comparison, invitations/contact history and certified export UI remain milestone 4; no placeholder invitation button or unreliable export was exposed.
- These checks are not a WCAG conformance claim. Safari/VoiceOver, another screen-reader pairing, real 200% zoom, comprehensive contrast and real-device tests were not performed. Complete accessibility evidence remains milestone 8.
- No shared service, authentication, cross-device transfer or fully prepared offline reload is claimed. Real-data, sponsor AI acceptance and shared-provider approvals remain unresolved gates.
