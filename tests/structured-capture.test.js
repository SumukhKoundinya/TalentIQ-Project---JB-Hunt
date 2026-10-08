const { loadApp, assert } = require('./harness');
const TIQ = loadApp();
const legacy = TIQ.normalizeCandidate({ id: 'synthetic-1', notes: 'Keep this observation', workLocations: ['Remote'] });
assert(Array.isArray(legacy.technicalInterests) && legacy.technicalInterests.length === 0, 'legacy records normalize optional technical interests');
assert(legacy.candidateQuestions === '' && legacy.followUpQuestions === '' && legacy.nextStepNotes === '', 'legacy records normalize optional questions and next steps');
assert(legacy.notes === 'Keep this observation' && legacy.workLocations[0] === 'Remote', 'normalization preserves existing observations and preferences');

const fs = require('fs');
const path = require('path');
const helperPath = path.join(__dirname, '..', 'capture-workflow.js');
assert(fs.existsSync(helperPath), 'structured Capture exposes a focused workflow helper');
if (fs.existsSync(helperPath)) {
  const app = loadApp(['capture-workflow.js']);
  const C = app.captureWorkflow;
  const c = app.normalizeCandidate({ id: 'synthetic-2', function: 'General', notes: '', summary: 'Factual draft', auditTrail: [], provenance: {}, recordStatus: 'New' });
  app.state.candidates = [c];
  app.state.activeRecruiterId = 'R1';
  C.update(c, 'technicalInterests', 'JavaScript, Testing, JavaScript');
  assert(c.technicalInterests.join('|') === 'JavaScript|Testing', 'interests are trimmed and deduplicated');
  C.update(c, 'workLocations', 'Remote, Nashville');
  C.update(c, 'function', 'Software Engineering Intern');
  C.update(c, 'candidateQuestions', 'What mentoring is available?');
  C.update(c, 'followUpQuestions', 'Ask about the coursework project');
  C.update(c, 'nextStepNotes', 'Share event resources');
  C.update(c, 'areasDiscussed', ['Coursework', 'Personal projects']);
  assert(c.provenance.workLocations === 'recruiter' && c.provenance.function === 'recruiter', 'structured corrections carry recruiter provenance');
  app.ai.applyParsedData(c, { contact: { address: 'Different resume address' }, education: [], skills: [], experience: [], projects: [], certifications: [], rawText: '' }, { refresh: true });
  assert(c.workLocations.join('|') === 'Remote|Nashville' && c.function === 'Software Engineering Intern' && c.candidateQuestions === 'What mentoring is available?', 'resume refresh preserves recruiter conversation corrections');
  assert(JSON.parse(app.__testStorage.getItem(app.STORAGE_KEY)).candidates[0].candidateQuestions === c.candidateQuestions, 'structured questions persist in the actual candidate store');
  assert(c.recordStatus === 'New' && c.approvalStatus !== 'Approved', 'capture never automatically advances status or approves recap');
  const before = JSON.stringify(c);
  let denied = false;
  try { C.update(c, 'recordStatus', 'Closed'); } catch (_) { denied = true; }
  assert(denied && JSON.stringify(c) === before, 'structured input cannot mutate unrelated status fields');
  app.reviewWorkflow.approve(c);
  const fingerprint = app.reviewWorkflow.fingerprint(c);
  C.update(c, 'followUpQuestions', 'Confirm preferred project topic');
  assert(c.approvalStatus === 'Pending' && !c.approvedVersion && fingerprint !== app.reviewWorkflow.fingerprint(c), 'factual conversation changes invalidate certified recaps');
  const prompts = C.prompts('Software Engineering Intern').join(' ');
  assert(/coursework/i.test(prompts) && /personal project/i.test(prompts) && /leadership/i.test(prompts), 'engineering prompts accept coursework, personal projects and leadership evidence');
  assert(/prioriti/i.test(C.prompts('Product Owner').join(' ')), 'product prompts ask about observed prioritization rather than personality');
  assert(C.shortcutsBlocked({ closest: () => ({}) }) && !C.shortcutsBlocked({ closest: () => null }), 'shortcuts defer to interactive and editable targets');
  assert(!C.canRecord(null) && !C.canRecord({ checked: false }) && C.canRecord({ checked: true }), 'recording requires an explicit per-recording permission acknowledgement');
  assert(C.recordingAllowed({}) && C.recordingAllowed(null) && !C.recordingAllowed({ consent: { audio: false } }) && C.recordingAllowed({ consent: { audio: true } }), 'intake recording decline blocks capture recording');
  assert(!C.canRecord({ checked: true }, { consent: { audio: false } }), 'declined intake consent blocks audio even with recruiter permission');
}

const rendered = loadApp(['capture-workflow.js', 'views.js']);
assert(typeof rendered.views._captureStructuredNotesHtml === 'function', 'Notes provides a compact structured conversation disclosure');
if (rendered.views._captureStructuredNotesHtml) {
  const html = rendered.views._captureStructuredNotesHtml({ function: '<script>bad()</script>', technicalInterests: ['<img src=x>'], areasDiscussed: ['Custom existing topic'], workLocations: [], candidateQuestions: '<b>Question</b>' });
  assert(html.includes('Structured conversation (optional)') && !html.includes('required'), 'structured disclosure remains optional');
  assert(!html.includes('<script>') && !html.includes('<img src=x>') && html.includes('&lt;b&gt;'), 'untrusted conversation text is escaped');
  assert(html.includes('Custom existing topic'), 'existing custom discussed-area tags remain editable');
}
assert(rendered.views._captureVoiceHtml({}).includes('captureRecordingPermission'), 'recording exposes a labelled permission acknowledgement');
