const fs = require('fs');
const path = require('path');
const { loadApp, assert } = require('./harness');

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(/<div id="demoLoginRoot"><\/div>/.test(index), 'demo login has a separate mount outside the hidden app shell');

const TIQ = loadApp(['views.js']);

const login = TIQ.views.renderDemoLogin();
assert(/<main class="demo-login"/.test(login) && /TalentIQ[\s\S]*Demo/.test(login) && /Choose a demo recruiter/.test(login), 'first screen is a main landmark with a clear TalentIQ demo account chooser');
assert(/Taylor Morgan/.test(login) && /Alex Carter/.test(login), 'demo sign-in offers configured recruiter identities');
assert(/no account or password|never asks for a password/i.test(login) && !/<input[^>]*type=["']password/i.test(login), 'demo sign-in does not collect passwords');
assert(!/Google|google/i.test(login), 'demo sign-in does not impersonate Google');

const setup = TIQ.views.renderKiosk();
assert(/kiosk-qr-canvas/.test(setup) && /kioskCopyLink/.test(setup) && /kioskPrintPoster/.test(setup), 'Set Up retains the generated QR and its copy/print actions');
assert(!/Open Capture|data-open-capture/.test(setup), 'Set Up does not show an Open Capture button');
assert(!/Booth Camera|camera preview|kioskCamera/i.test(setup), 'Set Up contains no booth camera preview');
assert(setup.indexOf('kiosk-event-card__title" id="kioskEventMeta">Logistics &amp; Technology Fair 2026') >= 0, 'event name is the prominent event title');
const priorEvent = TIQ.state.event;
TIQ.state.event = Object.assign({}, priorEvent, { name: 'Test Event Name' });
assert(/kiosk-event-card__title" id="kioskEventMeta">Test Event Name/.test(TIQ.views.renderKiosk()), 'Event Booth title follows the editable event name');
TIQ.state.event = priorEvent;
assert(/kiosk-poster__header[\s\S]*id="kioskEditEvent"[^>]*aria-label="Edit event details"/.test(setup) && !/Edit event<|Edit Event/.test(setup), 'event editor is accessible, icon-only, and in the top-right header');
assert(/Candidate check-in/.test(setup) && !/Quick candidate capture for the career fair floor/.test(setup), 'poster uses candidate-focused check-in copy');
assert(/kiosk-poster[\s\S]*id="kioskEventMeta"[\s\S]*id="kioskEventDate"[\s\S]*id="kioskEventLocation"[\s\S]*Candidate check-in[\s\S]*Scan to complete your profile before meeting a recruiter\.[\s\S]*Scan the QR code[\s\S]*Complete your profile[\s\S]*Meet a recruiter[\s\S]*kiosk-qr-container[\s\S]*kioskCopyLink[\s\S]*kioskPrintPoster[\s\S]*kiosk-brand-logo/.test(setup), 'Set Up follows the event header, check-in/QR two-column, and brand footer wireframe');
assert(!/kiosk-location-row|Mobile \+ Desktop/.test(setup), 'Set Up replaces the old event metadata rows with a single poster header');
assert(/kiosk-poster__footer[\s\S]*kiosk-brand-logo[\s\S]*JBHUNT_LOGO\.png[\s\S]*People Moving America Forward/.test(setup), 'yellow J.B. Hunt logo sits in the poster footer');
assert(!/Candidate profile form|Scan to Submit Profile|Point your phone camera|Point your phone here/.test(setup), 'QR card omits helper headings and phone-camera directions');
assert((setup.match(/kiosk-qr-canvas/g) || []).length === 1, 'Set Up retains one generated QR canvas without changing its target');
const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
assert(/\.kiosk-info-btn::after\s*\{\s*content:\s*none/.test(css), 'icon-only QR and event controls have no visible generated labels');
assert(/\.kiosk-poster\s*\{[^}]*padding:\s*32px/s.test(css), 'poster uses consistent 32px card padding');
assert(/\.kiosk-poster__body\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)[^}]*align-items:\s*start[^}]*gap:\s*40px[^}]*padding:\s*24px\s+0\s+0/s.test(css), 'content starts 24px below the divider with a 40px horizontal gap and top alignment');
assert(/\.kiosk-poster \.kiosk-qr-container\s*\{[^}]*padding:\s*10px[^}]*background:\s*#fff/s.test(css) && /\.kiosk-poster \.kiosk-qr-container canvas\s*\{[^}]*width:\s*min\(100%,\s*280px\)[^}]*aspect-ratio:\s*1/s.test(css), 'on-screen QR is capped at 280px with a white quiet zone and square aspect ratio');
assert(/\.kiosk-poster \.kiosk-qr-actions\s*\{[^}]*margin-top:\s*16px/s.test(css) && /\.kiosk-qr-actions \.kiosk-action-btn\s*\{[^}]*min-height:\s*44px/s.test(css), 'QR actions sit 16px below the code and remain 44px tall');
assert(/\.kiosk-poster__footer\s*\{[^}]*padding-top:\s*12px/s.test(css) && /\.kiosk-poster__footer\s*\{[^}]*gap:\s*8px/s.test(css) && /\.kiosk-poster \.kiosk-brand-logo\s*\{[^}]*width:\s*120px/s.test(css), 'footer is compact with a 120px J.B. Hunt logo');
assert(/\.kiosk-poster \.kiosk-instructions__steps\s*\{[^}]*counter-reset:\s*kiosk-step\s+0/s.test(css) && /\.kiosk-poster \.kiosk-instructions__steps li\s*\{[^}]*counter-increment:\s*kiosk-step/s.test(css) && /\.kiosk-poster \.kiosk-instructions__steps li::before\s*\{[^}]*content:\s*counter\(kiosk-step\)/s.test(css), 'number badges explicitly count from 1 through 3');
assert(/@media print[\s\S]*\.kiosk-poster \.kiosk-qr-container canvas\s*\{[^}]*max-width:\s*420px/s.test(css), 'print version keeps a larger readable QR');
assert(/\.kiosk-brand-logo/.test(css), 'poster retains responsive brand styling');
assert(/\.kiosk-poster \.kiosk-brand-logo\s*\{[^}]*width:[^}]*height:\s*auto/s.test(css), 'poster footer logo preserves its aspect ratio');
