# HogHacks laptop sprite

Set Up displays the supplied `hoghacksLaptop.png` as a decorative, hinge-only animation. The original PNG is unchanged: its exterior already has real alpha transparency, and its interior black pixels remain opaque.

## File format and motion

- `laptop-sprite.png`: 6080 × 260 RGBA PNG; 19 horizontal 320 × 260 frames, open at index 0 and closed at index 18.
- The generator keeps the base and hinges fixed, projecting only the lid around source y=494. The full-resolution open frame matches every original RGBA pixel; delivery frames are cropped and scaled with nearest-neighbor sampling.
- The source has no rear view. The closed outer lid is drawn with its purple `#8D7CC2`, shade `#6A5D93`, white and near-black `#020106` palette; the original front artwork is never replaced.
- `styles.css` runs a 7.2-second stepped loop: 3.024s open, 1.728s closing, 0.864s closed, 1.584s opening. The element itself never moves, rotates or fades.
- Width is 112px on desktop, 80px at ≤1100px, and 64px at ≤600px. The laptop sits 24px left of the title/metadata block, vertically centered against that entire block; the combined group is centered on the full card. The info button stays at the far right, in a separate row on mobile so the laptop and text remain side by side without collisions. Reduced-motion and print rules show the static open frame.

## Regeneration and checks

No dependency is needed to serve the generated asset. For optional regeneration, use a Python development environment with Pillow (tested with 12.3.0), then run from the repository root:

```sh
python3 scripts/generate-hoghacks-laptop.py
python3 tests/hoghacks-assets.test.py
node tests/hoghacks-laptop.test.js
```

The generator accepts `--source PATH` and `--output PATH`; hinge coordinates require the original 1055 × 792 source. `tests/hoghacks-laptop-visual.cjs` checks real Chromium rendering and saves desktop/laptop/mobile phase screenshots in `.openchamber/screenshots/`. It uses the same optional `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, and `CHECK_IN_URL` environment variables as `tests/check-in-visual.cjs`.

The 19-frame motion is intentionally discrete for pixel art, not a smoothed 3D rendering. Screenshots verify Chromium; Safari and Firefox have not been visually tested.
