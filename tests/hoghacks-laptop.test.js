const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness');

const TIQ = loadApp(['views.js', 'features/setup/setup-views.js']);
const html = TIQ.views.renderKiosk();
assert.match(html, /kiosk-qr-canvas[\s\S]*kioskPrintPoster[\s\S]*kioskCopyLink/, 'check-in QR, actions remain');
assert.match(html, /kioskEditEvent[\s\S]*kioskEventMeta[\s\S]*kioskLocationValue[\s\S]*kioskDateValue/, 'event title, metadata and editor remain');
assert.equal(TIQ.eventInfo().name, 'HogHacks 2026', 'default booth event stays HogHacks 2026');

const spritePath = path.join(__dirname, '..', 'assets', 'hoghacks', 'laptop-sprite.png');
if (fs.existsSync(spritePath)) {
  const sprite = fs.readFileSync(spritePath);
  assert.equal(sprite.toString('hex', 0, 8), '89504e470d0a1a0a', 'asset is PNG');
}
console.log('HogHacks booth defaults and Set Up actions checks passed');
