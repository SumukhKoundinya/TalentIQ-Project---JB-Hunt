const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { loadApp } = require('./harness');
const read = file => fs.readFileSync(require('path').join(__dirname, '..', file), 'utf8');
const html = read('index.html');
assert(html.includes('features/setup/setup-views.js'), 'setup module must be loaded');
assert(html.includes('features/setup/setup-styles.css'), 'setup stylesheet must be loaded');
assert(html.indexOf('features/setup/setup-views.js') > html.indexOf('views.js?v='));
assert(html.indexOf('features/setup/setup-views.js') < html.indexOf('app.js?v='));
assert(!read('views.js').includes('TIQ.views.renderKiosk ='), 'no duplicate inline kiosk renderer');
assert(!read('styles.css').includes('.kiosk-'), 'no duplicate inline kiosk styles');
const TIQ = loadApp(['views.js', 'features/setup/setup-views.js']);
const markup = TIQ.views.renderKiosk();
for (const id of ['kioskEventMeta', 'kiosk-qr-canvas', 'kioskCameraPanel', 'kioskEditEvent', 'kioskEditQr', 'kioskCopyLink', 'kioskPrintPoster']) {
  assert(markup.includes(id), `setup renders ${id}`);
}
assert.strictEqual(TIQ.CONFIG.viewTitles.kiosk, 'Set Up');
TIQ.state.event = { name: 'Test fair', date: 'Oct 8', location: 'Booth A', id: 'keep-event-id' };
TIQ.state.candidates = [];
TIQ.saveState();
assert.strictEqual(TIQ.eventInfo().name, 'Test fair');
assert(Object.values(TIQ.__testStorageStore).some(value => value.includes('keep-event-id')));
assert.strictEqual(TIQ.loadPersistedState().event.id, 'keep-event-id', 'event restores even before the first candidate');
const container = { innerHTML: '' };
let stopped = 0;
TIQ.views._stopKioskCamera = () => { assert.strictEqual(container.innerHTML, 'old kiosk'); stopped++; };
TIQ.views.renderCapture = () => 'capture';
TIQ.views.initCaptureEvents = () => {};
vm.runInNewContext(read('app.js'), {
  window: { TIQ }, TIQ,
  document: { querySelectorAll: () => [], getElementById: id => id === 'viewContainer' ? container : null,
    removeEventListener() {}, addEventListener() {} }
});
container.innerHTML = 'old kiosk';
TIQ.router.currentView = 'kiosk';
TIQ.router.navigateTo('capture');
assert.strictEqual(stopped, 1, 'navigation stops camera before replacing DOM');
assert.strictEqual(container.innerHTML, 'capture');
console.log('PASS: setup feature integration, rendering, event persistence and camera teardown');
