const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const views = fs.readFileSync(path.join(root, 'views.js'), 'utf8');
const setupViews = fs.readFileSync(path.join(root, 'features/setup/setup-views.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

const kiosk = setupViews.slice(setupViews.indexOf('TIQ.views.renderKiosk ='), setupViews.indexOf('TIQ.views.initKioskForm ='));
const capture = views.slice(views.indexOf('TIQ.views.renderRecruiterCapture ='), views.indexOf('TIQ.views.renderCapture ='));
const aiReview = views.slice(views.indexOf('TIQ.views.renderAIReview ='), views.indexOf('TIQ.views._renderAIReviewList ='));
const overview = views.slice(views.indexOf('TIQ.views.renderOverview ='), views.indexOf('TIQ.views.renderAnalytics ='));

assert(kiosk.includes('kiosk-qr-canvas') && kiosk.includes('kioskPrintPoster') && kiosk.includes('kioskCopyLink'), 'Booth Setup keeps QR canvas and actions');
assert(kiosk.includes('kioskCameraPanel') && kiosk.includes('Booth camera'), 'Booth Setup includes the booth camera panel');
assert(kiosk.includes('Edit event details') && /Edit booth QR/i.test(kiosk), 'Booth Setup edit actions are explicitly labelled');
assert(capture.includes('Mark as reviewed') && capture.includes('Request follow-up'), 'Capture triage controls state what each action does');
assert(/\.capture-triage--review\s*\{[^}]*background:\s*var\(--ink-muted\)/s.test(css), 'Mark as reviewed uses a neutral grey background');
assert(!/#view-capture\s+\.capture-triage--review\s*\{[^}]*background:\s*var\(--brand\)/s.test(css), 'Capture-specific overrides do not restore the blue review button');
assert.strictEqual((capture.match(/data-drawer-tab=/g) || []).length, 2, 'Capture has exactly two evidence tabs');
assert(capture.includes('data-drawer-tab="resume"') && capture.includes('data-drawer-tab="notes"') && !capture.includes('data-drawer-tab="voice"'), 'Capture tabs are Resume and Notes');
assert(capture.includes('TIQ.views._captureCameraHtml(sel)'), 'Notes drawer hosts the booth camera panel');
assert(capture.includes('TIQ.views._captureVoiceHtml(sel)') && capture.includes('id="audioRecordings"'), 'Notes tab keeps voice controls and saved recordings');
assert(!capture.includes('recordingConsent'), 'Capture does not restore the legacy candidate recordingConsent checkbox');
assert(aiReview.includes('Filter candidates') && aiReview.includes('Select up to 3 to compare'), 'Review search and selection explain their scope and purpose');
assert(overview.includes('Record scope') && overview.includes('Blue bars show the number of records missing each item.'), 'Results labels scope and missing-information bar meaning');
assert(overview.includes('added a candidate record') && overview.includes('activityCandidate'), 'Results activity uses plain-language actions and candidate names');
assert(/\.main-content\s*\{[^}]*padding:\s*24px\s+var\(--app-gutter\)/s.test(css), 'Main pages share 24px vertical and responsive 24-32px horizontal padding');
assert(!/\.sidebar-footer/.test(css) && !/badge-dot/.test(css), 'Sidebar ships no dead notification/settings icon buttons');
console.log('UI polish contract: all checks passed');
