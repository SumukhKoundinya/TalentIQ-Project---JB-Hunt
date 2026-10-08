const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { loadApp } = require('./harness');

const TIQ = loadApp(['views.js', 'features/setup/setup-views.js']);
const html = TIQ.views.renderKiosk();
assert.match(html, /kiosk-workspace[\s\S]*kiosk-col-left[\s\S]*kiosk-qr-panel/, 'Set Up uses a two-column booth workspace');
assert.match(html, /kiosk-event-card[\s\S]*kioskEventMeta[\s\S]*kiosk-location-card/, 'event details and location sit in the left column');
assert.match(html, /kioskCameraPanel[\s\S]*kioskCameraPreview[\s\S]*kioskOpenCapture/, 'booth camera preview and Open Capture live under event details');
assert.match(html, /kiosk-qr-canvas[\s\S]*kioskPrintPoster[\s\S]*kioskCopyLink/, 'QR panel keeps canvas plus print/copy actions');
assert.match(html, /id="kioskEditEvent"[\s\S]*id="kioskEditQr"/, 'event and QR editors remain available');

const setupCss = fs.readFileSync(path.join(__dirname, '..', 'features/setup/setup-styles.css'), 'utf8');
assert.match(setupCss, /\.kiosk-workspace/, 'setup styles define the booth workspace');
assert.match(setupCss, /\.kiosk-camera-panel/, 'setup styles define the booth camera panel');
assert.match(setupCss, /\.kiosk-qr-panel/, 'setup styles define the QR panel');
console.log('Check-in layout regression checks passed');
