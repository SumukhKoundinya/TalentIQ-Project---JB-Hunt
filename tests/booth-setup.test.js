const fs = require('fs');
const path = require('path');
const { loadApp, assert } = require('./harness');

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(/<div id="demoLoginRoot"><\/div>/.test(index), 'demo login has a separate mount outside the hidden app shell');
assert(/features\/setup\/setup-views\.js/.test(index), 'Set Up feature module is loaded');

const TIQ = loadApp(['views.js', 'features/setup/setup-views.js']);

const login = TIQ.views.renderDemoLogin();
assert(/<main class="demo-login"/.test(login) && /Log in/.test(login) && /Talent[\s\S]*IQ/.test(login), 'first screen is a TalentIQ login homepage');
assert(/demoLoginEmail/.test(login) && /demoLoginPassword/.test(login) && /data-demo-continue/.test(login), 'login form has username, password, and submit');
assert(/data-demo-google/.test(login) && /Continue with Google/.test(login), 'login offers Continue with Google');
assert(!/Choose a demo recruiter|demo-login__choice|data-demo-recruiter/.test(login), 'login does not present a recruiter picker');
assert(/Demo login only/i.test(login), 'login discloses that auth is demo-only');

const setup = TIQ.views.renderKiosk();
assert(/kiosk-qr-canvas/.test(setup) && /kioskPrintPoster/.test(setup) && /kioskCopyLink/.test(setup), 'Set Up retains the generated QR and its print/copy actions');
assert(/kioskCameraPanel|Booth camera/i.test(setup), 'Set Up includes booth camera preview panel');
assert(/kioskOpenCapture/.test(setup), 'Set Up can open Capture from the camera panel');
assert(/id="kioskEventMeta">/.test(setup), 'default event name appears in Set Up');
const priorEvent = TIQ.state.event;
const defaultName = TIQ.eventInfo().name;
assert(setup.indexOf('id="kioskEventMeta">' + defaultName) >= 0, 'Set Up shows the configured event name');
TIQ.state.event = Object.assign({}, priorEvent, { name: 'Test Event Name' });
assert(/id="kioskEventMeta">Test Event Name/.test(TIQ.views.renderKiosk()), 'Event Booth title follows the editable event name');
TIQ.state.event = priorEvent;
assert(/id="kioskEditEvent"[^>]*aria-label="Edit event details"/.test(setup), 'event editor control is present and labelled');
assert(/id="kioskEditQr"[^>]*aria-label=/.test(setup), 'QR editor control is present and labelled');
assert((setup.match(/kiosk-qr-canvas/g) || []).length === 1, 'Set Up retains one generated QR canvas');
assert(typeof TIQ.views._stopKioskCamera === 'function' && typeof TIQ.views._initKioskCamera === 'function', 'kiosk camera lifecycle helpers exist');
