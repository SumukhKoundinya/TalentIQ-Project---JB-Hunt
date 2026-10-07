const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness');

const TIQ = loadApp(['views.js']);
const html = TIQ.views.renderKiosk();
assert.match(html, /kiosk-poster__columns[\s\S]*kiosk-instructions[\s\S]*kiosk-qr-panel/, 'instructions and QR share a centered two-column container');
assert.match(html, /<\/section><\/div>.*kiosk-poster__qr-info/, 'info control is outside the centered columns');
assert.match(html, /kiosk-brand-logo[^>]*>[\s\S]*kiosk-poster__leader" aria-hidden="true"[\s\S]*kiosk-poster__motto/, 'footer connects branding with a decorative leader');
const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
assert.match(css, /\.kiosk-poster__columns\s*\{[^}]*margin-inline:\s*auto[^}]*gap:\s*64px/s);
assert.match(css, /\.kiosk-poster__qr-info\s*\{[^}]*right:\s*0/s);
assert.match(css, /--kiosk-heading-ink-offset/);
assert.match(css, /--kiosk-qr-ink-offset/);
console.log('Check-in layout regression checks passed');
