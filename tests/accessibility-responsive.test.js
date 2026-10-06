const fs = require('fs');
const path = require('path');
const { assert } = require('./harness');

const root = path.join(__dirname, '..');
const candidateForm = fs.readFileSync(path.join(root, 'candidate-form.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const views = fs.readFileSync(path.join(root, 'views.js'), 'utf8');

assert(!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?/.test(candidateForm), 'candidate intake does not disable mobile zoom');
assert(/<main\b[^>]*id="formPage"/.test(candidateForm), 'candidate intake page exposes a main landmark');

[
  ['firstName', 'firstNameInput'],
  ['lastName', 'lastNameInput'],
  ['email', 'emailInput'],
  ['phone', 'phoneInput'],
  ['university', 'universityInput'],
  ['major', 'majorInput'],
  ['graduationDate', 'graduationDateInput'],
  ['resume', 'resumeInput']
].forEach(([name, id]) => {
  assert(new RegExp('<label[^>]+for="' + id + '"').test(candidateForm), name + ' label is programmatically associated');
  assert(new RegExp('(?:<input|<select)[^>]+id="' + id + '"[^>]+name="' + name + '"|(?:<input|<select)[^>]+name="' + name + '"[^>]+id="' + id + '"').test(candidateForm), name + ' control has stable id');
});

assert(/\.field input,\s*\n\s*\.field select\s*{[^}]*height:\s*44px/s.test(candidateForm), 'candidate intake controls meet 44px touch target height');
assert(/\.submit-btn\s*{[^}]*height:\s*44px/s.test(candidateForm), 'candidate intake submit buttons meet 44px touch target height');

assert(/class="skip-link"/.test(index) && /id="mainContent"/.test(index), 'main app has a skip link target');
assert(!/class="workflow-tools"/.test(index) && !/data-import-submission/.test(index), 'workflow utility strip is removed so content starts directly beneath the page header');
assert(!/id="workflowStage"/.test(index), 'repeated step banner is removed from the app shell');
assert(!/renderStage\s*\(/.test(fs.readFileSync(path.join(root, 'app.js'), 'utf8')), 'router does not inject a repeated step banner on every screen');
assert(!/\.stage-banner/.test(styles), 'obsolete stage-banner styling is removed');
assert(/\.skip-link:focus-visible/.test(styles), 'skip link has visible focus styling');
assert(/@media \(max-width: 480px\)[\s\S]*\.kiosk-col-left[\s\S]*max-width:\s*100%/.test(styles), 'kiosk event card is constrained on small phones');
assert(/\.breadcrumb-link[\s\S]*color:\s*#334155/.test(styles), 'breadcrumb text uses contrast-safe color');
assert(/\.recruiter-label[\s\S]*color:\s*#334155/.test(styles), 'recruiter label uses contrast-safe color');
assert(/<h2 class="candidate-name">/.test(views), 'capture card candidate name does not skip heading levels');
assert(/\.kiosk-workspace\s*{[^}]*width:\s*100%[^}]*max-width:\s*none/s.test(styles), 'Booth Setup uses the available page width on large screens');
assert(/<canvas[^>]*id="kiosk-qr-canvas"[^>]*role="img"[^>]*aria-label="QR code for candidate profile"/.test(views), 'Booth Setup QR canvas has an accessible name');
