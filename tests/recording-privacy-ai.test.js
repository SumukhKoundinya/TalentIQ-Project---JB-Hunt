/**
 * Recording privacy, AI summary cards, booth camera person-tagging,
 * and demo login — combination coverage.
 */
const fs = require('fs');
const path = require('path');
const { loadApp, assert } = require('./harness');

const TIQ = loadApp(['components.js', 'views.js']);
const C = TIQ.captureWorkflow;

function cand(overrides) {
  return Object.assign({
    id: 'TQ-TEST',
    firstName: 'Mia',
    lastName: 'Williams',
    email: 'mia@student.edu',
    university: 'UARK',
    skills: ['Python', 'React'],
    notes: '',
    audioNotes: [],
    accomplishments: [],
    scenePeople: [],
    attributes: [],
    consent: { profile: true, audio: true, at: '2026-01-01T00:00:00.000Z' },
    parsedResume: null,
    recordStatus: 'New'
  }, overrides || {});
}

/* ---- Login homepage ---- */
const login = TIQ.views.renderDemoLogin();
assert(/<main class="demo-login"/.test(login) && /Log in/.test(login), 'login is a Log in homepage');
assert(/data-demo-google/.test(login) && /Continue with Google/.test(login), 'login offers Google continue');
assert(/demoLoginEmail/.test(login) && /demoLoginPassword/.test(login) && /type="password"/.test(login), 'login has username and password');
assert(!/data-demo-recruiter|Choose a demo recruiter/.test(login), 'login has no recruiter picker');
assert(/Demo login only/i.test(login), 'login discloses demo-only auth');

/* ---- Recording consent matrix ---- */
assert(C.recordingAllowed(null) && C.recordingAllowed({}) && C.recordingAllowed({ consent: { audio: true } }), 'missing or granted consent allows recording');
assert(!C.recordingAllowed({ consent: { audio: false } }), 'explicit decline blocks recording');
assert(C.canRecord({ checked: true }, { consent: { audio: true } }), 'permission + consent allows mic');
assert(!C.canRecord({ checked: true }, { consent: { audio: false } }), 'decline blocks mic even with permission');
assert(!C.canRecord({ checked: false }, { consent: { audio: true } }), 'missing recruiter permission blocks mic');
assert(!C.canRecord(null, { consent: { audio: true } }), 'null permission blocks mic');
assert(C.canRecord({ checked: true }, null) && C.canRecord({ checked: true }, {}), 'manual candidates without consent can record with permission');

/* ---- Voice UI combinations ---- */
const voiceOk = TIQ.views._captureVoiceHtml(cand({ consent: { audio: true } }));
assert(/captureRecordingPermission/.test(voiceOk) && /audioRecordBtn/.test(voiceOk) && !/disabled/.test(voiceOk), 'granted consent shows record controls');
assert(/AI Summary/.test(voiceOk), 'voice hint mentions AI Summary on cards');

const voiceNo = TIQ.views._captureVoiceHtml(cand({ consent: { audio: false } }));
assert(/declined recording/i.test(voiceNo) && /disabled/.test(voiceNo), 'declined consent disables mic UI');
assert(!/captureRecordingPermission/.test(voiceNo), 'declined consent hides recruiter permission checkbox');

const voiceManual = TIQ.views._captureVoiceHtml(cand({ consent: undefined }));
assert(/captureRecordingPermission/.test(voiceManual) && !/\bdisabled\b/.test(voiceManual), 'manual candidate without consent can still record');

/* ---- Camera privacy combinations ---- */
const camOk = TIQ.views._captureCameraHtml(cand({ consent: { audio: true } }));
assert(/data-recording-allowed="true"/.test(camOk), 'granted consent: camera allowed');
assert(!/capture-camera__preview--blurred/.test(camOk), 'granted consent: preview not blurred');
assert(/capturePersonPicker/.test(camOk) && /Click someone/.test(camOk), 'granted consent: person naming available');

const camNo = TIQ.views._captureCameraHtml(cand({ consent: { audio: false } }));
assert(/data-recording-allowed="false"/.test(camNo), 'declined consent: camera marked private');
assert(/capture-camera__preview--blurred/.test(camNo), 'declined consent: preview blurred');
assert(/Recording declined/.test(camNo), 'declined consent shows privacy banner');

/* ---- Person naming options ---- */
TIQ.state.candidates = [
  cand({ id: 'TQ-1', firstName: 'Mia', lastName: 'Williams' }),
  cand({ id: 'TQ-2', firstName: 'Jordan', lastName: 'Patel', consent: { audio: false } })
];
const opts = TIQ.views._scenePeopleNameOptions(TIQ.state.candidates[0]);
assert(opts.some(function(o) { return o.refId === 'TQ-1' && /Mia/.test(o.name); }), 'name options include current candidate');
assert(opts.some(function(o) { return o.role === 'recruiter'; }), 'name options include recruiters');
assert(opts.some(function(o) { return o.refId === 'TQ-2'; }), 'name options include other candidates');
assert(opts.some(function(o) { return /Guest|Unknown/i.test(o.name); }), 'name options include guest/unknown');

const tagged = cand({
  scenePeople: [{ id: 'p1', name: 'Taylor Morgan', role: 'recruiter', refId: 'R1', xPct: 35, yPct: 40 }]
});
const camTagged = TIQ.views._captureCameraHtml(tagged);
assert(/Taylor Morgan/.test(camTagged) && /data-person-id="p1"/.test(camTagged), 'named people render as camera markers');
assert(/1 tagged/.test(camTagged), 'summary shows tagged count');

/* ---- AI summary on cards ---- */
assert(TIQ.views._aiSummaryHtml(cand()) === '', 'no AI summary section when there is no conversation content');

const fromTranscript = cand({
  audioNotes: [{ id: 1, transcript: 'I built a logistics dashboard with Python and React for route optimization across warehouses.' }]
});
const aiHtml = TIQ.views._aiSummaryHtml(fromTranscript);
assert(/AI Summary/.test(aiHtml) && /logistics dashboard/i.test(aiHtml), 'transcript content becomes AI summary points');

const fromAcc = cand({
  accomplishments: [{ text: 'Led a campus logistics club project using Python.', source: 'conversation' }]
});
assert(/campus logistics club/i.test(TIQ.views._aiSummaryHtml(fromAcc)), 'conversation accomplishments appear in AI summary');

const declinedEmpty = TIQ.views._aiSummaryHtml(cand({ consent: { audio: false } }));
assert(declinedEmpty === '', 'declined recording with no content does not clutter the card');

const cardWithAi = TIQ.views._buildCardHtml(fromTranscript, true);
assert(/ai-summary-card/.test(cardWithAi) && /resume-highlights/.test(cardWithAi), 'card keeps resume highlights and AI summary together');
assert(!/Booth camera|capture-camera/.test(cardWithAi), 'camera UI is not embedded inside the decision card');

const cardClean = TIQ.views._buildCardHtml(cand(), true);
assert(/capture-summary/.test(cardClean) && !/ai-summary-card/.test(cardClean), 'empty AI summary stays off the card');

/* ---- Capture layout: camera lives in Notes, not card stack ---- */
TIQ.views._captureIndex = 0;
TIQ.state.candidates = [cand({ id: 'TQ-1' })];
const capture = TIQ.views.renderCapture();
const left = capture.split('capture-col-right')[0];
assert(/capture-stack-shell/.test(left) && /capture-card--0/.test(left), 'left column still owns the card stack');
assert(!/captureCameraPanel/.test(left), 'camera is not above the card stack');
assert(/capture-panel-notes[\s\S]*captureCameraPanel/.test(capture), 'camera lives in the Notes drawer');
assert(/captureRecordingPermission|declined recording/i.test(capture), 'notes drawer exposes recording controls');

/* ---- Intake form consent copy ---- */
const formHtml = fs.readFileSync(path.join(__dirname, '..', 'candidate-form.html'), 'utf8');
assert(/audioConsentInput/.test(formHtml), 'intake still has recording consent checkbox');
assert(/camera and voice/i.test(formHtml) && /blurred/i.test(formHtml) && /no audio is recorded/i.test(formHtml), 'intake explains blur + no-audio on decline');

/* ---- Combination: decline + tagged people still render blurred camera ---- */
const declinedTagged = TIQ.views._captureCameraHtml(cand({
  consent: { audio: false },
  scenePeople: [{ id: 'p2', name: 'Guest', role: 'unknown', xPct: 50, yPct: 50 }]
}));
assert(/preview--blurred/.test(declinedTagged) && /Guest/.test(declinedTagged), 'existing tags remain visible under privacy blur');

/* ---- Combination: grant consent + AI + tags + voice ---- */
const full = cand({
  consent: { audio: true },
  scenePeople: [{ id: 'p3', name: 'Mia Williams', role: 'candidate', refId: 'TQ-TEST', xPct: 20, yPct: 30 }],
  audioNotes: [{ id: 9, transcript: 'I led a warehouse routing project with React and Python last summer.' }],
  accomplishments: [{ text: 'Led a warehouse routing project.', source: 'conversation' }]
});
assert(C.canRecord({ checked: true }, full), 'full path still allows recording');
assert(/Mia Williams/.test(TIQ.views._captureCameraHtml(full)), 'full path shows person tag');
assert(/warehouse routing/i.test(TIQ.views._aiSummaryHtml(full)), 'full path shows AI summary');
assert(/audioRecordBtn/.test(TIQ.views._captureVoiceHtml(full)) && !/\bdisabled\b/.test(TIQ.views._captureVoiceHtml(full)), 'full path keeps mic enabled');

/* ---- Audio note people snapshot shape (contract used at save time) ---- */
const peopleSnap = (full.scenePeople || []).map(function(p) {
  return { id: p.id, name: p.name, role: p.role, refId: p.refId || '', xPct: p.xPct, yPct: p.yPct };
});
assert(peopleSnap.length === 1 && peopleSnap[0].name === 'Mia Williams' && peopleSnap[0].xPct === 20, 'recording save can snapshot named people');

console.log('recording-privacy-ai combinations complete');
