# HogHacks Laptop Implementation Plan

> **For agentic workers:** Implement inline in this session; the user requested a completed implementation, not a delegation handoff. Steps use checkbox syntax for tracking.

**Goal:** Add the supplied purple pixel laptop to the top-left of Set Up's existing event header without changing the surrounding branding or workflow.

**Architecture:** Generate a nearest-neighbor sprite from `hoghacksLaptop.png`. Each frame composites the unchanged base with a hinge-projected screen or a source-palette outer lid. CSS advances through 19 equally sized frames; no runtime animation library or JavaScript timer.

**Tech Stack:** Existing vanilla-JavaScript renderer, CSS, PNG; Python/Pillow for optional asset regeneration, Node and Playwright for checks.

**Spec:** User request in this session and supplied `hoghacksLaptop.png` (1055 × 792, actual alpha transparency).

**Layout amendment:** The subsequent user request supersedes the initial corner placement described in Tasks 2–3. Current positioning is recorded in the completed refinement below.

## Global Constraints

- Preserve the screen artwork, keyboard, colors, black details and crisp pixel edges.
- Keep the base stationary; project only the lid around its bottom hinge.
- Desktop laptop width 100–120px; centered event title/metadata and far-right info button.
- Stable footprint; smaller laptop and collision-free header on narrow screens.
- Gentle 6–8 second loop with about three seconds open, no bounce or flashing.
- Decorative for screen readers; static open frame for reduced motion and printing.
- Preserve all existing user changes, sidebar logo, check-in content, QR, buttons and footer.

### Task 1: Asset preparation and sprite integrity

**Files:** Create `scripts/generate-hoghacks-laptop.py`, `assets/hoghacks/laptop-sprite.png`, `assets/hoghacks/README.md`; test in `tests/hoghacks-laptop.test.js` and `tests/hoghacks-laptop-visual.cjs`. Leave the supplied PNG unchanged.

**Interface:** A 6080 × 260 RGBA PNG with 19 horizontal 320 × 260 frames, open at index 0 and closed at index 18.

- [x] Write regression checks for the missing decorative header element and sprite dimensions; run `node tests/hoghacks-laptop.test.js` and observe failure at the missing element.
- [x] Extract all pixels below hinge y=494 as the base and retain the two hinge blocks in their original coordinates. Copy the front screen from the original; do not recolor or erase interior blacks.
- [x] For 19 angles from 0 to 111 degrees, project only the lid about (519, 494), using a perspective distance of 2100 source pixels and nearest-neighbor sampling. Composite it over the fixed base; keep hinge blocks in front. Use a stepped purple/white/black outer lid after the screen turns away.
- [x] Export identically cropped 320 × 260 frames into the PNG atlas. Record palette, frame dimensions, timing and regeneration command in the adjacent README.

### Task 2: Header integration and static modes

**Files:** Modify `views.js`, `styles.css`, `index.html`; tests in `tests/hoghacks-laptop.test.js`.

**Interface:** `<span class="hoghacks-laptop" aria-hidden="true"></span>` within the existing header, before the event block.

- [x] Add the span without changing existing event/control markup.
- [x] Position the span at header top-left, reserve its height, and give the centered event block symmetric side padding. Use `aspect-ratio: 320 / 260`, `background-size: 1900% 100%`, and `image-rendering: pixelated`. Reserve the artwork height separately from existing divider padding with header `box-sizing: content-box`.
- [x] Use `animation: hoghacks-lid 7.2s steps(18) infinite`; background position 0% at 0%, 42% and 100%, and 100% at 66% and 78%. This gives 3.024s open, 1.728s closing, 0.864s closed and 1.584s opening.
- [x] Reduce the sprite to 80px at ≤1100px; at ≤600px use 64px and place the full-width centered event block below the corner controls. Keep the info button at the existing right edge.
- [x] In reduced-motion and print rules set `animation: none; background-position: 0% 0`.
- [x] Increment only the changed stylesheet and view-script cache keys; run `node tests/hoghacks-laptop.test.js`.

### Task 3: Rendered verification and documentation

**Files:** Create `tests/hoghacks-laptop-visual.cjs`; update `CHANGELOG.md` under `[Unreleased]`.

**Interface:** Optional Playwright check using existing `PLAYWRIGHT_MODULE` / `CHROMIUM_PATH` / `CHECK_IN_URL` environment conventions.

- [x] Assert image loading, desktop/narrow dimensions, title and metadata centering, no collisions/overflow, fixed geometry at open/intermediate/closed phases, and unchanged exposed front-edge pixels across all sprite frames.
- [x] Use Playwright motion/print emulation to verify animation is disabled and frame 0 renders; inspect screenshots at 1440 × 900, 1280 × 800, and 390 × 844, plus 320px and tablet-width overflow checks.
- [x] Run the existing `tests/check-in-layout.test.js` and `tests/check-in-visual.cjs`, then all `tests/*.test.js`; compare to the recorded 22 passing / 10 failing baseline and do not fix unrelated failures. Final Node results: 23 passing / the same 10 failing; Python source-integrity and both Chromium suites pass. Pixel checks now wait for the existing route entrance to finish before measuring.
- [x] Read the actual diff, add a concise changelog entry, and report changed files and any artwork/rendering limitations. Do not commit or push without a user request.

### Completed refinement: Center the combined laptop/title group

**Files:** `views.js`, `styles.css`, `index.html`, `tests/hoghacks-laptop.test.js`, `tests/hoghacks-laptop-visual.cjs`, `tests/check-in-visual.cjs`, `assets/hoghacks/README.md`, `CHANGELOG.md`.

- [x] Update regression tests first to require a shared group, a 20–24px gap, combined-group centering on the full card, and laptop vertical centering against the complete title/metadata block. Observe expected failures before changing production markup or styles.
- [x] Wrap the laptop and event text in `.kiosk-poster__event-group`; use a max-content flex row with `align-items: center`, `gap: 24px`, symmetric info-button reserves, and a nonshrinking sprite footprint. Keep metadata beneath the title and the info button outside the group at the far right.
- [x] On screens ≤600px reserve 56px above the combined group for the info control; retain a 64px laptop beside wrapping event text with no horizontal overflow. Bump stylesheet/view cache keys to 84/81; keep the sprite and animation unchanged.
- [x] Inspect desktop, laptop and mobile phase screenshots; verify all eight viewport sizes, static reduced-motion/print modes, and no geometry changes through the loop. Both Chromium suites and Python source-integrity checks pass; all Node checks remain 23 passing / the same 10 pre-existing failures.
