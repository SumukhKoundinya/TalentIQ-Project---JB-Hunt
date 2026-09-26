# Resume Intake + Real Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded placeholder analytics with data computed from real candidate state, add bulk resume intake in the Capture view (resumes → candidate cards), and surface a Research Metrics dashboard.

**Architecture:** Pure, unit-testable functions (resume contact extraction in `data.js`, analytics in a new `analytics.js`) are tested through a tiny Node + `vm` harness (no build step, no deps). Views in `views.js` consume those functions. New candidates created from imported resumes ride the existing `parseAndStoreResume` → `generateSummary` → candidate-card pipeline.

**Tech Stack:** Vanilla JS (no build), Node v23.5.0 for the test harness only, existing PDF.js 3.11.174 (already loaded in `index.html`), existing `TIQ.*` global namespace.

**Spec:** Inline discussion with the product owner (Nirmay). Scope decisions locked:
- Parser engine = client-side PDF.js (keep existing in-browser parser; no backend deps).
- Keep the 7 fabricated `seedCandidates` (TQ-2401…TQ-2407) for demos.
- Hardcoded analytics placeholders in `TIQ.CONFIG` (`overviewStats`, `majorBreakdown`, `topUniversities`, `activityFeed`) are replaced by computed values.
- Plan first, then implement (this document).

## Global Constraints

- Product name from `AGENTS.md`: **TalentIQ** — AI-assisted career fair candidate capture, NOT hiring automation.
- AI constraints (never violate): NO scoring/ranking/auto-rejection; NO protected-trait inference; summaries require recruiter approval; every AI claim cites `traceability`.
- No build system, no ES modules, nothing new in `package.json` — tests are plain Node scripts run with `node tests/<file>.test.js`.
- All state in `localStorage` (`talentiq_state_v1`) + IndexedDB for audio; metrics in `talentiq_eval_metrics_v1`.
- XSS: all dynamic content through `escapeHtml()`/`escapeAttr()`.
- Every code change MUST append a line to `[Unreleased]` in `CHANGELOG.md` (categories: Added/Changed/Fixed/Removed/Documentation).
- Candidate IDs: `TIQ.CONFIG.idPrefix + (idBaseOffset + n)`; manual/imported candidates start at `TQ-2500+`.
- Event metadata must be editable in the UI and persisted, falling back to `TIQ.CONFIG`.

---

### Task 1: Test harness + resume contact extraction

**Files:**
- Create: `tests/harness.js`
- Create: `tests/resume-parser.test.js`
- Modify: `data.js` (add `MONTHS`, `_extractEmail`, `_extractPhone`, `_extractName`, `_normalizeMonthYear`, `_extractGraduationDate`, `_extractContact`; extend `extractResumeData` at data.js:623)

**Interfaces:**
- Produces: `TIQ.ai._extractContact(rawText)` → `{ name, firstName, lastName, email, phone, graduationDate }` (all strings or `""`), `TIQ.ai.MONTHS` (array of 12 full month names), and `extractResumeData(text).contact` now populated with that object.

- [ ] **Step 1: Write the failing test**

Create `tests/harness.js`:

```js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeStubs() {
  const store = {};
  return {
    window: {
      TIQ: {},
      pdfjsLib: { getDocument: () => ({ promise: Promise.reject(new Error('no pdf in harness')) }) }
    },
    navigator: {},
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    }
  };
}

function loadInto(stubs, file) {
  const code = fs.readFileSync(file, 'utf8');
  const context = vm.createContext(
    Object.assign({ window: stubs.window, localStorage: stubs.localStorage, navigator: stubs.navigator, console }, stubs)
  );
  vm.runInContext(code, context, { filename: file });
}

function loadApp(extraFiles = []) {
  const stubs = makeStubs();
  loadInto(stubs, path.join(__dirname, '..', 'config.js'));
  loadInto(stubs, path.join(__dirname, '..', 'data.js'));
  for (const f of extraFiles) loadInto(stubs, path.join(__dirname, '..', f));
  return stubs.window.TIQ;
}

function assert(cond, msg) {
  if (cond) { console.log('PASS: ' + msg); }
  else { console.error('FAIL: ' + msg); process.exitCode = 1; }
}

module.exports = { loadApp, assert };
```

Create `tests/resume-parser.test.js`:

```js
const { loadApp, assert } = require('./harness');

const RESUME = `
Sofia Rodriguez
123 College Ave, Nashville, TN 37206
sofia.rodriguez@university.edu | (555) 123-4567

EDUCATION
University of Tennessee — BS Data Science
Expected graduation: May 2027
GPA: 3.78

SKILLS
Python, SQL, TensorFlow, Tableau, Pandas, R, Git

EXPERIENCE
Data Analyst Intern — Nashville Public Library, May 2025 – Aug 2025
Built Tableau dashboards tracking 4,000+ monthly visits.

PROJECTS
Supply Chain Dashboard — Led a team of 3 student analysts.
`;

function main() {
  const TIQ = loadApp();
  const parsed = TIQ.ai.extractResumeData(RESUME);
  const c = parsed.contact;

  assert(c.email === 'sofia.rodriguez@university.edu', 'extracts email');
  assert(c.phone === '(555) 123-4567', 'extracts phone');
  assert(c.name === 'Sofia Rodriguez', 'extracts full name');
  assert(c.firstName === 'Sofia' && c.lastName === 'Rodriguez', 'splits name');
  assert(c.graduationDate === 'May 2027', 'extracts expected graduation');
  assert(parsed.education[0] && parsed.education[0].school === 'University of Tennessee', 'extracts school');
  assert(parsed.gpa === '3.78', 'extracts gpa');
  assert(parsed.skills.includes('Python') && parsed.skills.includes('SQL'), 'extracts skills');
  assert(parsed.experience[0] && parsed.experience[0].title === 'Data Analyst Intern', 'extracts experience');

  const none = TIQ.ai._extractContact('No contact info in this document at all.');
  assert(none.email === '' && none.phone === '' && none.name === '' && none.graduationDate === '', 'empty strings when nothing found');
}

main();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/resume-parser.test.js`
Expected: FAIL with `Cannot read properties of undefined (reading 'email')` (no `contact` key yet).

- [ ] **Step 3: Implement contact extraction in `data.js`**

Inside the `TIQ.ai` object, add a month constant and the private helpers directly above `generateSummary` (data.js:810):

```js
MONTHS: ['January','February','March','April','May','June','July','August','September','October','November','December'],

_extractEmail: function (text) {
  var m = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return m ? m[0] : '';
},

_extractPhone: function (text) {
  var m = text.match(/(?:\+?1[\s.-]?)?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}/);
  return m ? m[0] : '';
},

_extractName: function (text) {
  var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
  for (var i = 0; i < Math.min(lines.length, 6); i++) {
    var ln = lines[i];
    if (ln.length > 40) continue;
    if (/[[\]{}<>;@|]/.test(ln) || /^[A-Za-z]+,\s*[A-Z]{2}\b/.test(ln)) continue;
    if (/@/.test(ln) || /\b(address|email|contact|resume|cv|name)\b/i.test(ln)) continue;
    if (/\d/.test(ln)) continue;
    var words = ln.split(/\s+/);
    if (words.length < 2 || words.length > 4) continue;
    if (!/^[A-Z]/.test(ln)) continue;
    if (ln.replace(/[^a-zA-Z]/g, '').length < 6) continue;
    return ln;
  }
  return '';
},

_normalizeMonthYear: function (monthWord, year) {
  monthWord = monthWord.toLowerCase();
  var full = this.MONTHS.find(function (m) { return m.toLowerCase().indexOf(monthWord) === 0 && monthWord.length >= 3; });
  return full ? full + ' ' + year : '';
},

_extractGraduationDate: function (text) {
  var monthPat = '(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:January|February|March|April|May|June|July|August|September|October|November|December))';
  var exp = new RegExp('(?:expected|anticipated|grad\\w*)[^\\n]{0,40}?(' + monthPat + ')\\s*(\\d{4})', 'i');
  var m = text.match(exp);
  if (m) return this._normalizeMonthYear(m[1], m[2]);
  var plain = text.match(/(?:graduat\w*|class of|graduation\w*)[^\n]*?(' + monthPat + ')\s*(\d{4})/i);
  if (plain) return this._normalizeMonthYear(plain[1], plain[2]);
  var first = text.match(new RegExp('(' + monthPat + ')\\s*(\\d{4})'));
  return first ? this._normalizeMonthYear(first[1], first[2]) : '';
},

_extractContact: function (rawText) {
  var email = this._extractEmail(rawText);
  var phone = this._extractPhone(rawText);
  var name = this._extractName(rawText);
  var graduationDate = this._extractGraduationDate(rawText);
  var parts = name ? name.split(/\s+/) : [];
  return {
    name: name,
    firstName: parts.length ? parts[0] : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
    email: email,
    phone: phone,
    graduationDate: graduationDate
  };
},
```

Then extend the `extractResumeData` return (data.js:623) so the returned object gains the `contact` key:

```js
return {
  skills: skills,
  experience: experience,
  projects: projects,
  education: education,
  gpa: gpa,
  certifications: certifications,
  contact: this._extractContact(text),
  rawText: text
};
```

Note: `_normalizeMonthYear` returns `''` for anything shorter than 3 chars, so it never emits a bogus month.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/resume-parser.test.js`
Expected: all PASS lines; exit code 0.

- [ ] **Step 5: Update `CHANGELOG.md`**

Append under `[Unreleased]` → `Added`:
`- Resume parser now extracts name/email/phone/graduation from text (data.js, tests/resume-parser.test.js)`

- [ ] **Step 6: Commit**

```bash
git add tests/harness.js tests/resume-parser.test.js data.js CHANGELOG.md
git commit -m "feat: resume contact extraction + node test harness"
```

---

### Task 2: Backfill candidate fields from parsed resume

**Files:**
- Create: `tests/apply-resume.test.js`
- Modify: `data.js` — add `TIQ.ai.applyParsedData`, rewire `parseAndStoreResume` (data.js:922)

**Interfaces:**
- Consumes: `TIQ.ai._extractContact` output shape `{name,firstName,lastName,email,phone,graduationDate}`.
- Produces: `TIQ.ai.applyParsedData(candidate, parsed)` (pure) and: `parseAndStoreResume` now (a) backfills names/email/phone/graduation/university/major/gpa/skills when empty, (b) sets `candidate.resumeUpload = {name, type, parsedAt}` so the "Resume" missing-flag clears, (c) logs a `resume-parsed` metric.

- [ ] **Step 1: Write the failing test**

Create `tests/apply-resume.test.js`:

```js
const { loadApp, assert } = require('./harness');

const parsed = {
  contact: { name: 'Sofia Rodriguez', firstName: 'Sofia', lastName: 'Rodriguez', email: 'sofia@u.edu', phone: '(555) 123-4567', graduationDate: 'May 2027' },
  education: [{ school: 'University of Tennessee', degree: 'BS', major: 'Data Science', year: '2027' }],
  gpa: '3.78',
  skills: ['Python', 'SQL'],
  experience: [], projects: [], certifications: [], rawText: ''
};

function main() {
  const TIQ = loadApp();
  const c = {};
  TIQ.ai.applyParsedData(c, parsed);

  assert(c.firstName === 'Sofia' && c.lastName === 'Rodriguez', 'backfills names');
  assert(c.email === 'sofia@u.edu', 'backfills email');
  assert(c.phone === '(555) 123-4567', 'backfills phone');
  assert(c.graduationDate === 'May 2027', 'backfills graduationDate');
  assert(c.university === 'University of Tennessee', 'backfills university');
  assert(c.major === 'Data Science', 'backfills major');
  assert(c.gpa === '3.78', 'backfills gpa');
  assert(Array.isArray(c.skills) && c.skills.length === 2, 'backfills skills');

  const existing = { firstName: 'Jose', lastName: 'Garcia', email: 'jose@x.com', gpa: '3.0', university: 'Vanderbilt' };
  TIQ.ai.applyParsedData(existing, parsed);
  assert(existing.firstName === 'Jose' && existing.email === 'jose@x.com' && existing.gpa === '3.0', 'preserves existing values');
  assert(existing.university === 'Vanderbilt', 'preserves existing university');
}

main();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/apply-resume.test.js`
Expected: FAIL with `applyParsedData is not a function`.

- [ ] **Step 3: Add `applyParsedData` to `TIQ.ai` in `data.js`**

Place it right before `parseAndStoreResume` (data.js:922):

```js
applyParsedData: function (candidate, parsed) {
  var contact = parsed.contact || {};
  if (!candidate.firstName && contact.firstName) candidate.firstName = contact.firstName;
  if (!candidate.lastName && contact.lastName) candidate.lastName = contact.lastName;
  if (!candidate.email && contact.email) candidate.email = contact.email;
  if (!candidate.phone && contact.phone) candidate.phone = contact.phone;
  if (!candidate.graduationDate && contact.graduationDate) candidate.graduationDate = contact.graduationDate;
  var edu = (parsed.education && parsed.education.length) ? parsed.education[0] : null;
  if (!candidate.university && edu && edu.school) candidate.university = edu.school;
  if (!candidate.major && edu && edu.major) candidate.major = edu.major;
  if (!candidate.gpa && parsed.gpa) candidate.gpa = parsed.gpa;
  if ((!candidate.skills || !candidate.skills.length) && parsed.skills && parsed.skills.length) candidate.skills = parsed.skills.slice();
}
```

- [ ] **Step 4: Run apply-resume test to verify it passes**

Run: `node tests/apply-resume.test.js` and `node tests/resume-parser.test.js`
Expected: both PASS.

- [ ] **Step 5: Rewire `parseAndStoreResume` backfill + resumeUpload + metric**

In `parseAndStoreResume` (data.js:922), replace the current "backfill gpa/skills if empty" block (approx. data.js:950-953) with:

```js
candidate.parsedResume = parsed;
TIQ.ai.applyParsedData(candidate, parsed);
candidate.resumeUpload = { name: file.name, type: file.type, parsedAt: TIQ.nowISO() };
```

Then, immediately after the existing `TIQ.addAuditEntry(candidate, 'RESUME_PARSED', ...)` line inside the success path, add:

```js
TIQ.logMetric({
  type: 'resume-parsed',
  candidateId: candidate.id,
  recruiterId: TIQ.state.activeRecruiterId,
  fileName: file.name,
  skills: parsed.skills.length,
  experience: parsed.experience.length,
  gpa: Boolean(parsed.gpa),
  contactFound: Boolean(parsed.contact && (parsed.contact.email || parsed.contact.phone))
});
```

- [ ] **Step 6: Run full parser suite**

Run: `node tests/resume-parser.test.js && node tests/apply-resume.test.js`
Expected: PASS; exit code 0.

- [ ] **Step 7: Update `CHANGELOG.md`**

Append under `[Unreleased]` → `Added`:
`- parseAndStoreResume backfills name/email/phone/grad/university + clears Resume flag (data.js, tests/apply-resume.test.js)`

- [ ] **Step 8: Commit**

```bash
git add data.js tests/apply-resume.test.js CHANGELOG.md
git commit -m "feat: apply parsed resume data to candidate records"
```

---

### Task 3: Bulk resume intake in Capture view

**Files:**
- Modify: `views.js` — `renderRecruiterCapture` (398-470), empty state (400), `initCaptureEvents` (597-…), new `TIQ.views.importResumeFiles`, `TIQ.views._finalizeImport`

**Interfaces:**
- Consumes: `TIQ.ai.parseAndStoreResume`, `TIQ.ai.updateCandidateSummary`, `TIQ.addAuditEntry`, `TIQ.logMetric`, `TIQ.state.candidates`.
- Produces: buttons `#captureImportResumes`, `#captureImportEmpty`, `#captureNewCandidate` (surfaces the already-existing orphaned handler at views.js:639), hidden inputs `#captureImportInput`/`#captureImportEmptyInput`, and `TIQ.views.importResumeFiles(files)` which creates candidate cards from PDFs.

- [ ] **Step 1: Add the Resume Intake UI panel to `renderRecruiterCapture`**

In the right sidebar of `renderRecruiterCapture` (views.js:398-470), insert this panel **above** the Recruiter Notes panel:

```js
'<div class="capture-panel">' +
  '<h3 class="panel-title">Resume Intake</h3>' +
  '<p class="panel-sub">Import PDFs and we build the candidate cards from them.</p>' +
  '<button type="button" class="btn btn--block btn--primary" id="captureImportResumes">Import Resumes (PDF)</button>' +
  '<button type="button" class="btn btn--block btn--outline" id="captureNewCandidate">Add Manually</button>' +
  '<input type="file" id="captureImportInput" accept=".pdf,application/pdf" multiple style="display:none">' +
'</div>'
```

- [ ] **Step 2: Add import button to the empty state**

In the empty-state markup (~views.js:400), next to the existing `#captureNewCandidateEmpty` button, add:

```js
'<button type="button" class="btn btn--outline" id="captureImportEmpty">Import Resumes (PDF)</button>' +
'<input type="file" id="captureImportEmptyInput" accept=".pdf,application/pdf" multiple style="display:none">' +
```

- [ ] **Step 3: Wire the import buttons in `initCaptureEvents`**

Add these delegated branches inside the existing click-handler chain (near the `#captureNewCandidate` branch at views.js:639):

```js
if (t.closest('#captureImportResumes') || t.closest('#captureImportEmpty')) {
  var input = t.closest('#captureImportResumes') ? document.getElementById('captureImportInput') : document.getElementById('captureImportEmptyInput');
  if (input) input.click();
  return;
}
if (t.closest('#captureNewCandidate')) { TIQ.views._openNewCandidateModal(); return; }
```

And add change listeners (near the notes handler, ~views.js:673):

```js
var imp = document.getElementById('captureImportInput');
if (imp) imp.addEventListener('change', function () { TIQ.views.importResumeFiles(this.files); });
var impE = document.getElementById('captureImportEmptyInput');
if (impE) impE.addEventListener('change', function () { TIQ.views.importResumeFiles(this.files); });
```

- [ ] **Step 4: Add `importResumeFiles` and `_finalizeImport` to `TIQ.views`**

Add these methods (e.g. right after the capture-complete renderer, ~views.js:507):

```js
importResumeFiles: function (files) {
  files = Array.prototype.slice.call(files || []);
  if (!files.length) return;
  var created = 0, failed = 0, pending = files.length, self = this;
  files.forEach(function (file) {
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      failed++; pending--; if (pending === 0) self._finalizeImport(created, failed); return;
    }
    var id = TIQ.CONFIG.idPrefix + (2500 + TIQ.state.candidates.length + created);
    var c = {
      id: id,
      firstName: '', lastName: '',
      email: '', phone: '', gpa: '', university: '', major: '',
      graduationDate: '', workAuthorization: '', workLocations: [],
      function: '', skills: [], areasDiscussed: [], notes: '',
      audioNotes: [], recordStatus: 'New', priority: 'Medium',
      approvalStatus: 'Pending', createdAt: TIQ.nowISO(), lastUpdated: TIQ.nowISO(),
      capturedBy: TIQ.state.activeRecruiterId || 'rec-1',
      parsedResume: null, resumeUpload: null, auditLog: [], traceability: [],
      accomplishments: [], summary: '', approvedBy: null, approvalTimestamp: null
    };
    TIQ.addAuditEntry(c, 'CREATED', 'Imported from resume ' + file.name);
    TIQ.state.candidates.push(c);
    TIQ.ai.parseAndStoreResume(c, file).then(function (parsed) {
      if (parsed) { created++; TIQ.ai.updateCandidateSummary(c); }
      else { failed++; }
      pending--; if (pending === 0) self._finalizeImport(created, failed);
    }).catch(function () {
      failed++; pending--; if (pending === 0) self._finalizeImport(created, failed);
    });
  });
},

_finalizeImport: function (created, failed) {
  TIQ.logMetric({ type: 'resume-import', count: created, failed: failed, recruiterId: TIQ.state.activeRecruiterId });
  TIQ.saveState();
  TIQ.showToast(failed ? 'Imported ' + created + ' candidate(s) (' + failed + ' resume(s) could not be parsed).' : 'Imported ' + created + ' candidate(s).', 'success');
  this._captureIndex = 0;
  this._rerenderCapture();
},
```

Note: `_finalizeImport` runs a final `saveState` after the batch — `parseAndStoreResume` already saves per candidate, which keeps each import recoverable.

- [ ] **Step 5: Manual verification**

Serve the app with `python -m http.server 8000` from the project root, open capture view, click **Import Resumes (PDF)**, select resumes, confirm: new cards appear in the deck, names/email/grad populate, Grounded AI Highlights + skill chips render, the Resume flag clears, and the toast reports the count.

- [ ] **Step 6: Update `CHANGELOG.md`**

Append under `[Unreleased]` → `Changed`:
`- Capture view: bulk resume import panel (resumes → candidate cards) (views.js)`

- [ ] **Step 7: Commit**

```bash
git add views.js CHANGELOG.md
git commit -m "feat: bulk resume import creates candidate cards in capture view"
```

---

### Task 4: `analytics.js` — computed metrics module

**Files:**
- Create: `analytics.js` (project root)
- Create: `tests/analytics.test.js`
- Modify: `index.html` (add script tag between data.js and components.js)

**Interfaces:**
- Consumes: `TIQ.state.candidates` (fields `recordStatus`, `major`, `university`, `auditLog[]` with `action`/`recruiter_id`/`time_to_complete`), `TIQ.RECRUITERS`, `TIQ.getMissingFlags(c)`.
- Produces: `TIQ.analytics.statusCounts(cands)`, `.avgReviewSeconds(cands)`, `.formatDuration(sec)`, `.dataCompleteness(cands)`, `.majorBreakdown(cands)`, `.topUniversities(cands)`, `.activityFeed(cands)`, `.perRecruiter(cands)`.

- [ ] **Step 1: Write the failing test**

Create `tests/analytics.test.js`:

```js
const { loadApp, assert } = require('./harness');

function main() {
  const TIQ = loadApp(['analytics.js']);
  const A = TIQ.analytics;

  const cands = [
    { id: 'C1', recordStatus: 'New', major: 'Computer Science', university: 'Alabama', auditLog: [{ action: 'CREATED', time_to_complete: 30 }] },
    { id: 'C2', recordStatus: 'Reviewed', major: 'Data Science', university: 'Alabama', auditLog: [{ action: 'CREATED', time_to_complete: 120 }, { action: 'APPROVED', time_to_complete: 180 }] },
    { id: 'C3', recordStatus: 'Interview Requested', major: 'Engineering', university: 'Tennessee', auditLog: [{ action: 'CREATED' }] }
  ];

  const counts = A.statusCounts(cands);
  assert(counts.New === 1 && counts.Reviewed === 1 && counts['Interview Requested'] === 1, 'statusCounts per recordStatus');

  assert(A.avgReviewSeconds([{ auditLog: [{ time_to_complete: 180 }] }]) === 180, 'avgReviewSeconds single 180s');
  assert(A.avgReviewSeconds([{ auditLog: [{ time_to_complete: 180 }] }, { auditLog: [{ time_to_complete: 300 }] }]) === 240, 'avgReviewSeconds 180+300 mean');
  assert(A.avgReviewSeconds([{ auditLog: [] }]) === 0, 'avgReviewSeconds zero when none');

  assert(A.formatDuration(150) === '2m 30s', 'formatDuration 150');
  assert(A.formatDuration(45) === '45s', 'formatDuration 45');
  assert(A.formatDuration(0) === '—', 'formatDuration 0');

  const comp = A.dataCompleteness(cands);
  assert(typeof comp === 'number' && comp >= 0 && comp <= 100, 'dataCompleteness is a percentage number');

  const majors = A.majorBreakdown(cands);
  assert(majors.length > 0 && majors[0].label === 'Computer Science', 'majorBreakdown top major first');
  assert(majors.reduce((s, m) => s + m.value, 0) >= 99, 'majorBreakdown values sum to ~100');

  const tops = A.topUniversities(cands);
  assert(tops.length > 0 && tops[0].university === 'Alabama', 'topUniversities ranks by count');

  const feed = A.activityFeed(cands);
  assert(Array.isArray(feed) && feed.length > 0 && typeof feed[0].recruiter === 'string', 'activityFeed has recruiter names');

  const byRecruiter = A.perRecruiter(cands);
  assert(Array.isArray(byRecruiter), 'perRecruiter returns array');
}

main();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/analytics.test.js`
Expected: FAIL with `Cannot read property 'statusCounts' of undefined`.

- [ ] **Step 3: Create `analytics.js`**

```js
window.TIQ = window.TIQ || {};
TIQ.analytics = (function () {
  var REVIEW_ACTIONS = ['APPROVED', 'FOLLOW_UP', 'INTERVIEW_REQUESTED'];
  var FLAG_COUNT = 9;

  function recruiterName(id) {
    var r = (id && (TIQ.RECRUITERS || []).find(function (x) { return x.id === id; })) ||
            (id && (window.TIQ.CONFIG.recruiters || []).find(function (x) { return x.id === id; }));
    return r ? r.name : 'System';
  }

  function statusCounts(candidates) {
    var counts = { 'New': 0, 'Reviewed': 0, 'Follow-Up': 0, 'Interview Requested': 0 };
    (candidates || []).forEach(function (c) {
      var s = c.recordStatus || 'New';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }

  function avgReviewSeconds(candidates) {
    var times = [];
    (candidates || []).forEach(function (c) {
      (c.auditLog || []).forEach(function (e) {
        if (e.time_to_complete > 0) times.push(e.time_to_complete);
      });
    });
    if (!times.length) return 0;
    return Math.round(times.reduce(function (a, b) { return a + b; }, 0) / times.length);
  }

  function formatDuration(sec) {
    if (!sec) return '\u2014';
    if (sec < 60) return sec + 's';
    var m = Math.floor(sec / 60), s = sec % 60;
    return s ? m + 'm ' + s + 's' : m + 'm';
  }

  function dataCompleteness(candidates) {
    if (!candidates || !candidates.length) return 0;
    var missing = 0;
    candidates.forEach(function (c) {
      missing += (TIQ.getMissingFlags(c) || []).length;
    });
    return Math.round((1 - missing / (candidates.length * FLAG_COUNT)) * 100);
  }

  function majorBreakdown(candidates) {
    var counts = {};
    candidates.forEach(function (c) {
      var k = c.major || 'Unknown';
      counts[k] = (counts[k] || 0) + 1;
    });
    var total = Math.max(candidates.length, 1);
    return Object.keys(counts).map(function (k) {
      return { label: k, value: Math.round((counts[k] / total) * 100) };
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, 6);
  }

  function topUniversities(candidates) {
    var counts = {};
    candidates.forEach(function (c) {
      var k = c.university || 'Unknown';
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.keys(counts).map(function (k) {
      return { university: k, count: counts[k] };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 5);
  }

  function activityFeed(candidates) {
    var items = [];
    candidates.forEach(function (c) {
      (c.auditLog || []).slice(-2).forEach(function (e) {
        items.push({
          recruiter: recruiterName(e.recruiter_id),
          action: String(e.action || '').toLowerCase().replace(/_/g, ' '),
          target: c.id,
          time: 'just now',
          dotColor: '#FEDB00'
        });
      });
    });
    return items.slice(0, 5);
  }

  function perRecruiter(candidates) {
    var map = {};
    candidates.forEach(function (c) {
      (c.auditLog || []).forEach(function (e) {
        var rid = e.recruiter_id || 'system';
        if (!map[rid]) map[rid] = { recruiterId: rid, recruiterName: recruiterName(rid), actions: 0, approvals: 0 };
        map[rid].actions++;
        if (REVIEW_ACTIONS.indexOf(e.action) !== -1) map[rid].approvals++;
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  return {
    statusCounts: statusCounts,
    avgReviewSeconds: avgReviewSeconds,
    formatDuration: formatDuration,
    dataCompleteness: dataCompleteness,
    majorBreakdown: majorBreakdown,
    topUniversities: topUniversities,
    activityFeed: activityFeed,
    perRecruiter: perRecruiter
  };
})();
```

- [ ] **Step 4: Load `analytics.js` in `index.html`**

Insert the `analytics.js` script tag between the `data.js` and `components.js` script tags (index.html:117-119) and bump the `?v=` params of the scripts it follows (data.js`?v=5`, and add `analytics.js?v=1`):

```html
<script src="config.js?v=4"></script>
<script src="qrcode-generator.js"></script>
<script src="data.js?v=5"></script>
<script src="analytics.js?v=1"></script>
<script src="components.js?v=4"></script>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node tests/analytics.test.js`
Expected: all PASS lines; exit code 0.

- [ ] **Step 6: Update `CHANGELOG.md`**

Append under `[Unreleased]` → `Added`:
`- analytics.js: computed statusCounts/avgReview/dataCompleteness/majors/universities/activity/perRecruiter (analytics.js, tests/analytics.test.js)`

- [ ] **Step 7: Commit**

```bash
git add analytics.js index.html tests/analytics.test.js CHANGELOG.md
git commit -m "feat: analytics module computing metrics from live state"
```

---

### Task 5: Wire overview, event editing, and metric log calls to real data

**Files:**
- Modify: `data.js` (add `TIQ.eventInfo()`, extend `loadPersistedState` + `saveState` for `event`)
- Modify: `views.js` (`renderOverview` 8-94, `renderKiosk` 106-160 for Event Details inputs, `initKioskForm`, logMetric call sites)
- Modify: `app.js` (lines 64-69 sidebar event read)

**Interfaces:**
- Consumes: `TIQ.analytics.*` (Task 4), `TIQ.eventInfo()`.

- [ ] **Step 1: Add `eventInfo()` + event persistence in `data.js`**

Above `loadPersistedState` (data.js:330) add:

```js
TIQ.eventInfo = function () {
  var e = TIQ.state.event || {};
  return {
    name: e.name || TIQ.CONFIG.eventName || '',
    date: e.date || TIQ.CONFIG.eventDate || '',
    location: e.location || TIQ.CONFIG.eventLocation || ''
  };
};
```

In `loadPersistedState` (data.js:330-344) add `event` to the returned object:

```js
event: (persisted && persisted.event) || {},
```

In `saveState` (data.js:346) include `event`:

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify({
  candidates: TIQ.state.candidates,
  activeRecruiterId: TIQ.state.activeRecruiterId,
  lastSelectedId: TIQ.state.lastSelectedId || TIQ.state.selectedId || null,
  event: TIQ.state.event || {}
}));
```

- [ ] **Step 2: Rewrite `renderOverview` to compute from live state**

Replace the body of `renderOverview` (views.js:8-94) so it no longer reads `cfg.overviewStats`, `cfg.majorBreakdown`, `cfg.topUniversities`, or `cfg.activityFeed`. Keep the same DOM classes (`.overview-metrics-grid` via `renderMetricsCards`, `.chart-bars`, `.overview-list`, activity feed markup) but source values from the analytics module; event badges read `TIQ.eventInfo()`:

```js
renderOverview: function () {
  var cands = TIQ.state.candidates || [];
  var A = TIQ.analytics;
  var counts = A.statusCounts(cands);
  var ev = TIQ.eventInfo();

  var stats = [
    { label: 'Total Scanned', value: cands.length, icon: 'scan', var: '--dark' },
    { label: 'Interview Requests', value: counts['Interview Requested'] + counts['Follow-Up'], icon: 'interview', var: '--primary' },
    { label: 'Avg Review Time', value: A.formatDuration(A.avgReviewSeconds(cands)), icon: 'time', var: '--yellow' },
    { label: 'Data Completeness', value: A.dataCompleteness(cands) + '%', icon: 'complete', var: '--success' }
  ];

  var html = '';
  html += TIQ.renderMetricsCards(stats);
  html += '<div class="overview-event-badge">' +
    '<span class="badge badge--pill badge--yellow">' + TIQ.escapeHtml(ev.name) + '</span>' +
    '<span class="badge badge--pill">' + TIQ.escapeHtml(ev.date) + '</span>' +
    '<span class="badge badge--pill">' + TIQ.escapeHtml(ev.location) + '</span>' +
  '</div>';

  var majors = A.majorBreakdown(cands);
  html += '<div class="overview-card"><div class="card-header"><h3>Majors</h3></div><div class="chart-bars">';
  majors.forEach(function (m) {
    html += '<div class="chart-item"><span class="chart-label">' + TIQ.escapeHtml(m.label) + '</span>' +
      '<div class="chart-track"><div class="chart-fill" style="width:' + m.value + '%"></div></div>' +
      '<span class="chart-value">' + m.value + '%</span></div>';
  });
  html += '</div></div>';

  var unis = A.topUniversities(cands);
  html += '<div class="overview-card"><div class="card-header"><h3>Top Universities</h3></div><ul class="overview-list">';
  unis.forEach(function (u) {
    html += '<li class="overview-list-item"><span class="hoverable">' + TIQ.escapeHtml(u.university) + '</span><span class="badge">' + u.count + '</span></li>';
  });
  html += '</ul></div>';

  html += '<div class="overview-card"><div class="card-header"><h3>Activity</h3></div><div class="activity-feed">';
  A.activityFeed(cands).forEach(function (item) {
    html += '<div class="activity-item"><span class="dot" style="background:' + item.dotColor + '"></span>' +
      '<div><p class="activity-text"><strong>' + TIQ.escapeHtml(item.recruiter) + '</strong> ' + TIQ.escapeHtml(item.action) +
      ' <a class="hoverable" href="#" data-nav="review">' + TIQ.escapeHtml(item.target) + '</a></p></div></div>';
  });
  html += '</div></div>';

  document.getElementById('overview').innerHTML = '<div class="overview">' + html + '</div>';
},
```

- [ ] **Step 3: Add Event Details config card to the Event Info view**

In `renderKiosk` (views.js:106-160), replace every `cfg.eventName`/`cfg.eventDate`/`cfg.eventLocation` reference with a `TIQ.eventInfo()` read; fetch `var ev = TIQ.eventInfo();` at the top of `renderKiosk`. Then add a third card above the Form Destination card:

```js
'<div class="event-card">' +
  '<div class="card-header"><h3>Event Details</h3></div>' +
  '<label class="form-label">Event Name<input type="text" id="kioskEventName" value="' + TIQ.escapeAttr(ev.name) + '" placeholder="e.g. Logistics & Technology Fair 2026"></label>' +
  '<label class="form-label">Event Date<input type="text" id="kioskEventDate" value="' + TIQ.escapeAttr(ev.date) + '" placeholder="e.g. Sep 14, 2026"></label>' +
  '<label class="form-label">Location<input type="text" id="kioskEventLocation" value="' + TIQ.escapeAttr(ev.location) + '" placeholder="e.g. Nashville, TN"></label>' +
  '<button type="button" class="btn btn--primary" id="kioskSaveEvent">Save Event Details</button>' +
'</div>'
```

- [ ] **Step 4: Wire `#kioskSaveEvent` in `initKioskForm`**

Add a direct listener alongside the existing kiosk wiring:

```js
var saveBtn = document.getElementById('kioskSaveEvent');
if (saveBtn) saveBtn.addEventListener('click', function () {
  TIQ.state.event = {
    name: document.getElementById('kioskEventName').value.trim(),
    date: document.getElementById('kioskEventDate').value.trim(),
    location: document.getElementById('kioskEventLocation').value.trim()
  };
  TIQ.saveState();
  var sName = document.getElementById('sidebarEventName');
  var sDate = document.getElementById('sidebarEventDate');
  var sLoc = document.getElementById('sidebarEventLocation');
  if (sName) sName.textContent = TIQ.state.event.name || TIQ.CONFIG.eventName;
  if (sDate) sDate.textContent = TIQ.state.event.date || TIQ.CONFIG.eventDate;
  if (sLoc) sLoc.textContent = TIQ.state.event.location || TIQ.CONFIG.eventLocation;
  TIQ.showToast('Event details saved.', 'success');
});
```

- [ ] **Step 5: Sidebar in `app.js` reads eventInfo()**

Replace the sidebar event block in `TIQ.app.init` (app.js:64-69) with:

```js
var ev = TIQ.eventInfo();
var sName = document.getElementById('sidebarEventName');
var sDate = document.getElementById('sidebarEventDate');
var sLoc = document.getElementById('sidebarEventLocation');
if (sName) sName.textContent = ev.name;
if (sDate) sDate.textContent = ev.date;
if (sLoc) sLoc.textContent = ev.location;
```

- [ ] **Step 6: Add metric logging at the remaining call sites in `views.js`**

Insert one line after each of these existing actions:

- Notes updated (capture, ~views.js:673, after the `NOTES_UPDATED` audit entry):
  `TIQ.logMetric({ type: 'notes-updated', candidateId: c.id, recruiterId: c.capturedBy });`
- AI review approve / follow-up / regen (inside `initAIReviewEvents`, ~views.js:1355-1396, after each `addAuditEntry`):
  `TIQ.logMetric({ type: 'candidate-approved', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });`
  `TIQ.logMetric({ type: 'follow-up-requested', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });`
  `TIQ.logMetric({ type: 'summary-regen', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });`
- Manual candidate created (new-candidate modal submit, ~views.js:764, after the CREATED audit entry):
  `TIQ.logMetric({ type: 'candidate-created', candidateId: newC.id, recruiterId: newC.capturedBy, source: 'manual' });`
- Exports (AI review export handlers ~views.js:1355-1356 and review view ~views.js:1601, one line each):
  `TIQ.logMetric({ type: 'export', format: 'csv', recruiterId: TIQ.state.activeRecruiterId });` (and `'json'`)
- Compare open (`_openCompareModal`, ~views.js:1431):
  `TIQ.logMetric({ type: 'compare', candidateIds: ids.slice(), recruiterId: TIQ.state.activeRecruiterId });`

Use the exact variable name that exists in each closure (`c` in AI review handlers, `newC` in the modal submit, `ids` in compare).

- [ ] **Step 7: Manual verification**

Serve, open Analytics: the 4 cards, majors bars, universities, and activity now reflect the 7 seed candidates (e.g. Total Scanned = 7). Edit event details on Event Info, save, reload — values persist and the sidebar matches. Review a candidate and confirm `talentiq_eval_metrics_v1` gains entries.

- [ ] **Step 8: Update `CHANGELOG.md`**

Append under `[Unreleased]`:
- `Changed`: `- Analytics computes from live candidate state, not config placeholders (views.js, analytics.js)`
- `Changed`: `- Event Info view: editable event details, persisted to state (views.js, data.js, app.js)`
- `Added`: `- Metric logging on notes/approve/follow-up/regen/create/export/compare (views.js)`

- [ ] **Step 9: Commit**

```bash
git add data.js views.js app.js CHANGELOG.md
git commit -m "feat: live analytics, editable event metadata, expanded metric logging"
```

---

### Task 6: Research Metrics dashboard

**Files:**
- Modify: `index.html` (nav link + view container div), `config.js` (viewTitles), `app.js` (router case), `views.js` (`renderMetrics`, `initMetricsEvents`), `styles.css` (minimal)

**Interfaces:**
- Consumes: `TIQ.analytics.statusCounts/avgReviewSeconds/formatDuration/dataCompleteness/perRecruiter`, `TIQ.state.metrics`, `TIQ.exportCsvLoading`.

- [ ] **Step 1: Add the nav link, view title, and route**

`index.html` — after the AI Review nav link (~line 40), add:

```html
<a class="nav-link" href="#" data-nav="metrics">Research Metrics</a>
```

`index.html` — add a view container div beside the existing view divs (mirror how `#overview` and siblings are structured; data-view="metrics"):

```html
<div id="metrics" data-view="metrics" style="display:none"></div>
```

`config.js` `viewTitles` — add:

```js
metrics: 'Research Metrics',
```

`app.js` router (`navigateTo` switch, case list at 28-55) — add a case:

```js
case 'metrics':
  TIQ.views.renderMetrics();
  TIQ.views.initMetricsEvents();
  break;
```

- [ ] **Step 2: Write the UI in `views.js`**

Add near the other render fns (after `generateDemoCandidates`, views.js:1756):

```js
renderMetrics: function () {
  var cands = TIQ.state.candidates || [];
  var A = TIQ.analytics;
  var counts = A.statusCounts(cands);
  var reviewed = cands.length ? Math.round(((counts.Reviewed + counts['Follow-Up'] + counts['Interview Requested']) / cands.length) * 100) : 0;
  var imports = TIQ.state.metrics.filter(function (m) { return m.type === 'resume-import'; });
  var totalImports = imports.reduce(function (s, m) { return s + (m.count || 0); }, 0);
  var totalFail = imports.reduce(function (s, m) { return s + (m.failed || 0); }, 0);
  var parseRate = (totalImports + totalFail) > 0 ? Math.round((totalImports / (totalImports + totalFail)) * 100) : -1;

  var stats = [
    { label: 'Funnel Reviewed', value: reviewed + '%', icon: 'funnel', var: '--primary' },
    { label: 'Avg Review Time', value: A.formatDuration(A.avgReviewSeconds(cands)), icon: 'time', var: '--yellow' },
    { label: 'Data Completeness', value: A.dataCompleteness(cands) + '%', icon: 'complete', var: '--success' },
    { label: 'Resume Parse Success', value: parseRate >= 0 ? parseRate + '%' : '\u2014', icon: 'scan', var: '--dark' }
  ];

  var html = '<div class="overview">';
  html += TIQ.renderMetricsCards(stats);

  html += '<div class="overview-card"><div class="card-header"><h3>Candidate Funnel</h3></div><div class="chart-bars">';
  ['New', 'Reviewed', 'Follow-Up', 'Interview Requested'].forEach(function (s) {
    var pct = cands.length ? Math.round(((counts[s] || 0) / cands.length) * 100) : 0;
    html += '<div class="chart-item"><span class="chart-label">' + TIQ.escapeHtml(s) + '</span>' +
      '<div class="chart-track"><div class="chart-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="chart-value">' + (counts[s] || 0) + '</span></div>';
  });
  html += '</div></div>';

  var rows = A.perRecruiter(cands);
  html += '<div class="overview-card"><div class="card-header"><h3>Per Recruiter Activity</h3></div><table class="data-table">' +
    '<thead><tr><th>Recruiter</th><th>Actions</th><th>Approvals</th></tr></thead><tbody>';
  rows.forEach(function (r) {
    html += '<tr><td>' + TIQ.escapeHtml(r.recruiterName) + '</td><td>' + r.actions + '</td><td>' + r.approvals + '</td></tr>';
  });
  html += '</tbody></table></div>';

  html += '<button type="button" class="btn btn--primary" id="metricsExportCsv">Export Metrics CSV</button>';
  html += '</div>';

  document.getElementById('metrics').innerHTML = html;
},

initMetricsEvents: function () {
  var btn = document.getElementById('metricsExportCsv');
  if (btn) btn.addEventListener('click', function () {
    TIQ.logMetric({ type: 'export', format: 'metrics-csv', recruiterId: TIQ.state.activeRecruiterId });
    TIQ.exportCsvLoading('talentiq-metrics-' + new Date().toISOString().slice(0, 10), TIQ.state.metrics);
  });
},
```

`styles.css` — add a small table style if `.data-table` does not already exist:

```css
.data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.data-table th, .data-table td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border, #E2E8F0); font-size: 14px; }
.data-table th { font-weight: 600; color: inherit; }
```

- [ ] **Step 3: Manual verification**

Navigate to Research Metrics: funnel + recruiter rows render from real data; the new view shows/hides like the others; importing resumes then exporting CSV includes `resume-parsed` and `resume-import` rows; parse-success % updates.

- [ ] **Step 4: Update `CHANGELOG.md`**

Append under `[Unreleased]` → `Added`:
`- Research Metrics dashboard: funnel, per-recruiter activity, parse-success %, metrics export (views.js, app.js, index.html)`

- [ ] **Step 5: Commit**

```bash
git add index.html config.js app.js views.js styles.css CHANGELOG.md
git commit -m "feat: research metrics dashboard with funnel and per-recruiter stats"
```

---

---

### Task 7: Candidate card refinement — fallbacks, transcript hydration, tabbed drawer, accessible triage

**Reviewer feedback (Plannotator, on `## Self-Review`):** the plan must guarantee graceful fallbacks for missing data and a polished card system. Triaged against the codebase: audit-trail-on-status-change, voice memo widget, missing-flag pills (`TIQ.getMissingFlags`), swipe gestures, arrow-key shortcuts, and [Resume]/[Voice]-style source tags on AI highlights **already exist**. This task adds what is genuinely missing.

**Files:**
- Modify: `data.js` (`TIQ.displayValue`, `TIQ.ai.hydrateTranscript`)
- Modify: `views.js` (`_buildCardHtml` fallbacks, `renderRecruiterCapture` tabbed drawer, `_applySwipeAction` right-swipe target, `initCaptureEvents` hide handlers)
- Modify: `styles.css` (drawer tabs, focus-visible styles)

**Interfaces:**
- Consumes: `TIQ.generateTldr`/`TIQ.cleanTranscript` (exposed from components.js — guard with `typeof`), `TIQ.ai._extractSkills`, `TIQ.getMissingFlags`, `parsedResume.rawText`, `audioNotes`.
- Produces: `TIQ.displayValue(val, fallback)` (pure), `TIQ.ai.hydrateTranscript(candidate, transcriptText)` (pure), tabbed right-column drawer on candidate cards, swipe-right → `Interview Requested`.

- [ ] **Step 1: Write the failing tests**

Create `tests/display-value.test.js`:

```js
const { loadApp, assert } = require('./harness');

function main() {
  const TIQ = loadApp();
  assert(TIQ.displayValue('3.78', 'N/A') === '3.78', 'keeps non-empty value');
  assert(TIQ.displayValue('', 'N/A') === 'N/A', 'empty string falls back');
  assert(TIQ.displayValue(undefined, 'N/A') === 'N/A', 'undefined falls back');
  assert(TIQ.displayValue(null, 'N/A') === 'N/A', 'null falls back');
  assert(TIQ.displayValue(0, 'N/A') === 0, '0 is kept (valid count/GPA)');
  assert(TIQ.displayValue('', '0') === '0', 'custom fallback respected');
}
main();
```

Create `tests/transcript-hydrate.test.js`:

```js
const { loadApp, assert } = require('./harness');

function main() {
  const TIQ = loadApp();
  const c = { skills: ['Python'] };
  const result = TIQ.ai.hydrateTranscript(c, 'I really enjoy working with SQL and Tableau for analytics.');
  assert(result.skillsAdded.indexOf('SQL') !== -1, 'adds skills found in transcript');
  assert(result.skillsAdded.indexOf('Tableau') !== -1, 'adds all discovered skills');
  assert(c.skills.indexOf('Python') !== -1 && c.skills.length === 3, 'preserves existing skills, no dup');
  assert(result.notesUpdated === false, 'no generateTldr in harness — guard is safe');
  assert(TIQ.ai.hydrateTranscript(c, '').skillsAdded.length === 0, 'empty transcript is a no-op');
}
main();
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/display-value.test.js && node tests/transcript-hydrate.test.js`
Expected: FAIL with `displayValue is not a function` / `hydrateTranscript is not a function`.

- [ ] **Step 3: Implement the two pure data.js helpers**

Add to data.js (near `getMissingFlags`):

```js
TIQ.displayValue = function (val, fallback) {
  return (val === undefined || val === null || val === '') ? fallback : val;
};
```

And inside `TIQ.ai` (after `_extractContact`):

```js
hydrateTranscript: function (candidate, transcriptText) {
  var changes = { skillsAdded: [], notesUpdated: false };
  if (!candidate || !transcriptText) return changes;
  candidate.skills = candidate.skills || [];
  var find = function (s) { return candidate.skills.indexOf(s) !== -1; };
  TIQ.ai._extractSkills(transcriptText).forEach(function (skill) {
    if (!find(skill)) { candidate.skills.push(skill); changes.skillsAdded.push(skill); }
  });
  if (typeof TIQ.generateTldr === 'function') {
    var tldr = TIQ.generateTldr(transcriptText);
    if (tldr && !candidate.notes) { candidate.notes = tldr; changes.notesUpdated = true; }
  }
  return changes;
}
```

Note: `_extractSkills` returns the skill list from a text string — the same helper the resume parser uses.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/display-value.test.js && node tests/transcript-hydrate.test.js`
Expected: all PASS; exit code 0.

- [ ] **Step 5: Apply fallbacks in `_buildCardHtml` (views.js)**

Wrap every dynamic value with `TIQ.displayValue(...)`. Example changes inside `_buildCardHtml` (currently at views.js:265-396):

```js
// meta strip: GPA
var gpa = TIQ.displayValue(c.gpa && parseFloat(c.gpa) > 0 ? c.gpa : '', 'N/A');
// header university line
TIQ.displayValue(c.university, 'University not listed') + ' · ' + TIQ.displayValue(c.major, 'Major not listed')
// graduation chip
TIQ.displayValue(c.graduationDate, 'Grad date TBD')
```

Keep the existing missing-flag alert banner (first 3 flags + "+N more") — that is the auto-generated missing-data pill behavior the reviewer asked for.

- [ ] **Step 6: Add the tabbed right-column drawer to `renderRecruiterCapture`**

Replace the current right-sidebar recordings + notes panels with a tabbed drawer. Panels: **Resume** (parsed resume raw text), **Voice** (transcripts/audio), **Notes** (textarea). Markup:

```js
'<div class="capture-panel">' +
  '<div class="drawer-tabs" role="tablist">' +
    '<button type="button" class="drawer-tab is-active" role="tab" data-drawer-tab="resume" aria-selected="true">Resume</button>' +
    '<button type="button" class="drawer-tab" role="tab" data-drawer-tab="voice" aria-selected="false">Voice</button>' +
    '<button type="button" class="drawer-tab" role="tab" data-drawer-tab="notes" aria-selected="false">Notes</button>' +
  '</div>' +
  '<div class="drawer-panel is-active" data-drawer-panel="resume">' +
    '<pre class="drawer-raw">' + (sel.parsedResume && sel.parsedResume.rawText ? TIQ.escapeHtml(sel.parsedResume.rawText) : 'No parsed resume yet.') + '</pre>' +
  '</div>' +
  '<div class="drawer-panel" data-drawer-panel="voice">' +
    /* existing recordings panel content moves here */ +
  '</div>' +
  '<div class="drawer-panel" data-drawer-panel="notes">' +
    /* existing Recruiter Notes textarea moves here */ +
  '</div>' +
'</div>'
```

(`sel` is the currently-facing candidate, same variable the capture renderer uses.)

- [ ] **Step 7: Wire the drawer tabs in `initCaptureEvents`**

Add click handling next to the other delegated handlers:

```js
var tabBtn = t.closest('[data-drawer-tab]');
if (tabBtn) {
  var name = tabBtn.getAttribute('data-drawer-tab');
  this.querySelectorAll('[data-drawer-tab]').forEach(function (b) {
    b.classList.toggle('is-active', b === tabBtn);
    b.setAttribute('aria-selected', b === tabBtn ? 'true' : 'false');
  });
  this.querySelectorAll('[data-drawer-panel]').forEach(function (p) {
    p.classList.toggle('is-active', p.getAttribute('data-drawer-panel') === name);
  });
  return;
}
```

Add `.drawer-tab.is-active{...}` and `.drawer-tab:focus-visible{outline:2px solid #005DBA; outline-offset:2px}` styles (J.B. Hunt focus treatement), plus `.drawer-tab`/`.drawer-panel` basic styles (`.drawer-panel{display:none}` / `.drawer-panel.is-active{display:block}`).

- [ ] **Step 8: Make swipe-right = "Interview Requested", keep left = "Reviewed"**

In `_applySwipeAction` (data.js swipe handler in views.js, ~line 1050): the right/down-stream branch currently sets `Follow-Up`; change its target to `'Interview Requested'` and keep the left branch on `'Reviewed'` (the no-hard-reject "save to pool" action). Add a visible touch of the reviewer's guidance: on right-swipe, the overlay label is `CONTACT`; update the overlay text to `INTERVIEW REQUESTED` and pass `priority: 'High'` (already the existing behavior for follow-up). Manual-verify both swipes + the undo path.

- [ ] **Step 9: Wire transcript hydration into the voice-memo flow**

Where a recording finishes (`_finishActiveRecording`, ~views.js:871), after the audio blob is saved, run:

```js
var txt = (rec.transcript || '').trim();
if (txt) {
  var hydrate = TIQ.ai.hydrateTranscript(sel, txt);
  if (hydrate.skillsAdded.length || hydrate.notesUpdated) TIQ.saveState();
}
```

Guard with `sel` being the candidate the recording belongs to. If `rec.transcript` is empty (e.g. still transcribing), skip.

- [ ] **Step 10: Manual verification**

Capture view: cards render with `N/A` fallbacks where data is missing; tabbed drawer switches Resume/Voice/Notes; swipe right marks `Interview Requested` (prioritized), swipe left `Reviewed`, both undoable; recorded voice memo with speech adds skills to a card and pre-fills notes when empty; keyboard navigation reaches each triage button with a visible focus outline.

- [ ] **Step 11: Update `CHANGELOG.md`**

Append under `[Unreleased]`:
- `Added`: `- Candidate card fallbacks (N/A), transcript hydration, tabbed Resume/Voice/Notes drawer (views.js, data.js)`
- `Changed`: `- Swipe right = Interview Requested; left = Reviewed (no hard reject) (views.js)`
- `Changed`: `- Accessible capture drawers with focus-visible + aria-selected (styles.css, views.js)`

- [ ] **Step 12: Commit**

```bash
git add data.js views.js styles.css tests/display-value.test.js tests/transcript-hydrate.test.js CHANGELOG.md
git commit -m "feat: card fallbacks, transcript hydration, tabbed drawer, swipe-right interview request"
```

---

## Self-Review

**Spec coverage:**
- Hardcoded placeholders inventory → Tasks 4-6 replace `overviewStats`/`majorBreakdown`/`topUniversities`/`activityFeed`; Task 5 makes event metadata editable; Task 6 surfaces the never-displayed `dataCompleteness` and `state.metrics`. ✓
- Resume parser → candidate cards → Tasks 1-3 (contact extraction, backfill, bulk import UI). ✓
- Analytics/events/metrics → Task 4 analytics module, Task 5 metric log call sites, Task 6 dashboard. ✓

**Placeholder scan:** Every task has concrete test code, implementation code, and identifiable code locations. No "TBD"/"implement later" steps. The lone structural note is Task 6/Step 1's instruction to mirror the existing `#overview`-style `data-view` container, which is a bounded, self-checkable step. ✓

**Reviewer (Plannotator) feedback:** one item on the Self-Review asked for robust fallbacks, transcript-driven hydration, a 2-column/tabbed card layout, and accessible triage. Already implemented in the codebase (audit trail on status change, voice memo widget, missing-flag pills, swipe/arrow-key gestures, source-tagged highlights) is noted; genuine gaps were added as **Task 7** (displayValue fallbacks, hydrateTranscript, tabbed drawer, swipe-right = Interview Requested, focus-visible keyboard triage). ✓

**Type consistency:** `_extractContact` → `{name,firstName,lastName,email,phone,graduationDate}` (Task 1) feeds `applyParsedData` (Task 2). `analytics.js` returns `{statusCounts, avgReviewSeconds, formatDuration, dataCompleteness, majorBreakdown, topUniversities, activityFeed, perRecruiter}` (Task 4) consumed by `renderOverview` (Task 5) and `renderMetrics` (Task 6). `eventInfo()` → `{name,date,location}` used consistently across views.js/app.js. `logMetric` types introduced in Tasks 2-3 (`resume-parsed`, `resume-import`) are consumed in Task 6's parse-success metric. Existing metric type `capture-status` remains untouched. ✓
