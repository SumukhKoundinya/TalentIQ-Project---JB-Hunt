const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness');

const html = loadApp(['views.js']).views.renderKiosk();
const header = html.match(/<header class="kiosk-poster__header">([\s\S]*?)<\/header>/)[1];
assert.match(header, /class="hoghacks-laptop" aria-hidden="true"/, 'the actual Set Up header contains the decorative laptop');
assert.match(header, /kiosk-poster__event-group[\s\S]*hoghacks-laptop[\s\S]*kiosk-poster__event/, 'laptop and title block share a centered group, laptop first');
assert.match(header, /kioskEventMeta[\s\S]*kioskEventDate[\s\S]*kioskEventLocation[\s\S]*kioskEditEvent/, 'event title, metadata and far-right editor remain');
assert.match(html, /kiosk-qr-canvas[\s\S]*kioskCopyLink[\s\S]*kioskPrintPoster[\s\S]*kiosk-brand-logo/, 'check-in QR, actions and footer remain');

const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
assert.match(css, /\.hoghacks-laptop\s*\{[^}]*aspect-ratio:\s*320\s*\/\s*260[^}]*image-rendering:\s*pixelated/s, 'sprite has a stable, crisp footprint');
assert.match(css, /animation:\s*hoghacks-lid\s+7\.2s\s+steps\(18\)\s+infinite/, 'gentle 19-frame loop needs no animation dependency');
assert.match(css, /@keyframes hoghacks-lid\s*\{[\s\S]*0%,\s*42%,\s*100%[^}]*background-position:\s*0%\s+0[\s\S]*66%,\s*78%[^}]*background-position:\s*100%\s+0/, 'loop pauses open for three seconds and pauses closed briefly');
for (const query of ['(prefers-reduced-motion: reduce)', 'print']) {
  assert.ok(css.includes('@media ' + query), 'has ' + query + ' rules');
  const block = css.slice(css.indexOf('@media ' + query));
  assert.match(block, /\.hoghacks-laptop\s*\{[^}]*animation:\s*none[^}]*background-position:\s*0%\s+0/s, query + ' uses the static open frame');
}
const sprite = fs.readFileSync(path.join(__dirname, '..', 'assets', 'hoghacks', 'laptop-sprite.png'));
assert.equal(sprite.toString('hex', 0, 8), '89504e470d0a1a0a', 'asset is PNG');
assert.equal(sprite.readUInt32BE(16), 320 * 19, 'sprite contains 19 full-width frames');
assert.equal(sprite.readUInt32BE(20), 260, 'every frame shares the same height');
console.log('HogHacks laptop markup, sprite, timing and accessibility checks passed');
