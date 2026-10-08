# Set Up Spacing Implementation Plan

**Goal:** Correct Set Up spacing while retaining its design, data and interactions.
**Architecture:** Change only the isolated setup renderer and stylesheet, plus their asset versions. Use a natural-height grid and a shared QR group width, not viewport-height stretching.
**Tech Stack:** Vanilla JavaScript, CSS Grid/Flexbox, Node assertions and Playwright.
**Spec:** User's Set Up spacing requirements in this session.

## Constraints
- Keep typography, palette, sidebar, event editors, camera controls, QR generation, copy and print behavior.
- Desktop workspace padding 32px; column gap 24px; left column 360–400px; panel padding 24px.
- Square QR with existing white quiet zone; equal-width actions at least 44px tall.
- One scanning caption and one short instruction; no visible configuration heading.
- Natural content heights, aligned desktop column edges, stacked narrow layout without clipping.
- No edits to unrelated existing work, no commits requested.

## Execution (inline)
1. Add `tests/setup-layout.cjs` to measure real rendered geometry, copy count, button sizing, camera padding, responsive overflow and print visibility. Run before implementation and confirm failure.
2. Update `features/setup/setup-views.js` with a compact QR group and single caption. Update `features/setup/setup-styles.css` with scoped workspace padding, natural grid alignment, shared group width, flowing camera placeholder and narrow breakpoints. Bump only setup asset versions in `index.html`.
3. Run the layout regression and existing `tests/setup-browser.cjs` / `tests/setup-integration.test.js`. Measure laptop content viewports at 1440×780 and 1280×650, phone at 390×844 and 320×740, with default zoom. Capture actual page renders; report scrolling honestly rather than changing text or clipping.
4. Review scoped diff and update `CHANGELOG.md` under Unreleased with the verified layout changes.
