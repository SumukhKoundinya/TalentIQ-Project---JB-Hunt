const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');
const views = fs.readFileSync(path.join(root, 'views.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

const kiosk = views.slice(views.indexOf('TIQ.views.renderKiosk ='), views.indexOf('TIQ.views.initKioskForm ='));
const capture = views.slice(views.indexOf('TIQ.views.renderRecruiterCapture ='), views.indexOf('TIQ.views.renderCapture ='));
const aiReview = views.slice(views.indexOf('TIQ.views.renderAIReview ='), views.indexOf('TIQ.views._renderAIReviewList ='));
const overview = views.slice(views.indexOf('TIQ.views.renderOverview ='), views.indexOf('TIQ.views.renderAnalytics ='));

assert.strictEqual((kiosk.match(/Scan to Submit Profile/g) || []).length, 0, 'Booth Setup leaves the QR free of promotional/helper copy');
assert.strictEqual((kiosk.match(/Scan the QR code/g) || []).length, 1, 'Booth Setup presents the scan instruction once in the candidate steps');
assert(kiosk.includes('Edit event details') && kiosk.includes('Edit booth QR and intake settings'), 'Booth Setup edit actions are explicitly labelled');
assert(capture.includes('Mark as reviewed') && capture.includes('Request follow-up'), 'Capture triage controls state what each action does');
assert(/\.capture-triage--review\s*\{[^}]*background:\s*var\(--ink-muted\)/s.test(css), 'Mark as reviewed uses a neutral grey background');
assert(!/#view-capture\s+\.capture-triage--review\s*\{[^}]*background:\s*var\(--brand\)/s.test(css), 'Capture-specific overrides do not restore the blue review button');
assert.strictEqual((capture.match(/data-drawer-tab=/g) || []).length, 2, 'Capture has exactly two evidence tabs');
assert(capture.includes('data-drawer-tab="resume"') && capture.includes('data-drawer-tab="notes"') && !capture.includes('data-drawer-tab="voice"'), 'Capture tabs are Resume and Notes');
const notesPanel = capture.slice(capture.indexOf('data-drawer-panel="notes"'), capture.indexOf("'</div>' +", capture.indexOf('data-drawer-panel="notes"')));
const voiceRecorder = views.slice(views.indexOf('TIQ.views._captureVoiceHtml ='), views.indexOf('TIQ.views.renderRecruiterCapture ='));
assert(notesPanel.includes('id="captureNotes"') && capture.includes('TIQ.views._captureNotesFlagsHtml(flags)') && capture.includes('id="audioRecordings"') && capture.includes('TIQ.views._captureVoiceHtml(sel)') && !capture.includes('capture-recording-section') && !capture.includes('recordingConsent') && voiceRecorder.includes('audioRecordBtn') && voiceRecorder.includes('capture-notes-footer'), 'Notes tab keeps notes, follow-up flags, saved recordings, and a compact recruiter recording control');
assert(!capture.includes('Candidate records') && !capture.includes('capture-evidence-hint'), 'Capture evidence controls omit the redundant Candidate records label');
assert(aiReview.includes('Filter candidates') && aiReview.includes('Select up to 3 to compare'), 'Review search and selection explain their scope and purpose');
assert(overview.includes('Record scope') && overview.includes('Blue bars show the number of records missing each item.'), 'Results labels scope and missing-information bar meaning');
assert(overview.includes('added a candidate record') && overview.includes('activityCandidate'), 'Results activity uses plain-language actions and candidate names');
assert(/\.main-content\s*\{[^}]*padding:\s*24px\s+var\(--app-gutter\)/s.test(css), 'Main pages share 24px vertical and responsive 24-32px horizontal padding');
assert(!/\.sidebar-footer/.test(css) && !/badge-dot/.test(css), 'Sidebar ships no dead notification/settings icon buttons');
console.log('UI polish contract: all checks passed');
