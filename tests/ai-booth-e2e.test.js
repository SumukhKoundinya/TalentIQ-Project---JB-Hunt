/**
 * Complete AI booth simulation: avatars, multi-speaker AI voices (scripted),
 * voice isolation, and accurate card AI Summary delivery.
 */
const fs = require('fs');
const path = require('path');
const { loadApp, assert } = require('./harness');

require('./fixtures/ai-booth-sim.js');
const sim = global.TIQ_AI_BOOTH_SIM;
const TIQ = loadApp(['components.js', 'skill-icons.js', 'voice-isolation.js', 'views.js']);

assert(sim && sim.avatars.length >= 2, 'AI booth sim provides avatars');
assert(sim.avatars.every(function(a) { return a.name && a.voice && a.lines && a.lines.length; }), 'each avatar has a voice id and scripted lines');

const cast = sim.cast;
const transcript = sim.buildTranscript(cast);
const people = sim.scenePeople(cast);

const candidate = TIQ.intake.buildCandidate({
  firstName: 'Avery',
  lastName: 'Chen',
  email: 'avery.chen@student.edu',
  university: 'University of Arkansas'
});
candidate.id = 'SIM-AVATAR-1';
candidate.consent = { profile: true, audio: true, at: '2026-10-08T12:00:00.000Z' };
candidate.scenePeople = people;
candidate.skills = [];
candidate.accomplishments = [];
candidate.audioNotes = [];
candidate.notes = '';
TIQ.state.candidates = [candidate];
TIQ.views._captureIndex = 0;

/* Combination A: multi-speaker labeled AI voices → isolated turns → card */
const isolated = TIQ.voiceIsolation.applyToCandidate(candidate, transcript, {
  people: people,
  voiceOnly: false
});
assert(isolated.turns.length >= 4, 'AI voices split into isolated speaker turns');
assert(isolated.turns.some(function(t) { return /Avery Chen/.test(t.speaker); }), 'candidate avatar turns are attributed');
assert(isolated.turns.some(function(t) { return /Taylor Morgan/.test(t.speaker); }), 'recruiter avatar turns are attributed');
assert(isolated.points.length >= 2, 'isolation produces card-ready AI points');

candidate.audioNotes.push({
  id: Date.now(),
  blobId: 'sim_audio_1',
  duration: 42,
  createdAt: TIQ.nowISO(),
  transcript: transcript,
  people: people,
  speakers: isolated.turns
});

const card = TIQ.views._buildCardHtml(candidate, true);
assert(/ai-summary-card/.test(card), 'card receives an AI Summary section from simulated voices');
sim.expectedCardNeedles().forEach(function(needle) {
  const points = TIQ.views._conversationAiPoints(candidate);
  const hay = points.map(function(p) { return p.text; }).join(' ') + ' ' + (candidate.notes || '');
  assert(new RegExp(needle, 'i').test(hay) || new RegExp(needle, 'i').test(card), 'card/notes retain AI voice content: ' + needle);
});
assert(/Avery Chen|logistics routing|Python|React/i.test(card), 'card AI Summary shows accurate candidate project content');

/* Combination B: voice-only isolation (camera off) */
const voiceOnlyCand = TIQ.intake.buildCandidate({ firstName: 'Avery', lastName: 'Chen' });
voiceOnlyCand.id = 'SIM-VOICE-ONLY';
voiceOnlyCand.consent = { profile: true, audio: true, at: '2026-10-08T12:00:00.000Z' };
voiceOnlyCand.captureVoiceOnly = true;
voiceOnlyCand.scenePeople = people.slice(0, 2);
voiceOnlyCand.accomplishments = [];
const vo = TIQ.voiceIsolation.applyToCandidate(voiceOnlyCand, sim.voiceOnlyTranscript(), {
  people: voiceOnlyCand.scenePeople,
  voiceOnly: true
});
assert(vo.voiceOnly === true, 'voice-only flag stored on isolation result');
assert(TIQ.voiceIsolation.isVoiceOnly(voiceOnlyCand), 'candidate marked voice-only');
assert(/Voice-only/.test(voiceOnlyCand.notes || ''), 'notes stamp voice-only mode');
assert(/ai-summary-card/.test(TIQ.views._buildCardHtml(voiceOnlyCand, true)), 'voice-only path still fills the card');

/* Combination C: recording declined → no mic, blurred camera, no AI injection */
const declined = TIQ.intake.buildCandidate({ firstName: 'Jordan', lastName: 'Patel' });
declined.consent = { profile: true, audio: false, at: '2026-10-08T12:00:00.000Z' };
assert(!TIQ.captureWorkflow.recordingAllowed(declined), 'declined consent blocks recording');
assert(/preview--blurred/.test(TIQ.views._captureCameraHtml(declined)), 'declined consent blurs camera');
assert(/\bdisabled\b/.test(TIQ.views._captureVoiceHtml(declined)), 'declined consent disables mic');

/* Combination D: Capture layout still hosts camera in Notes and cards stay clean */
TIQ.state.candidates = [candidate];
const capture = TIQ.views.renderCapture();
assert(/captureCameraPanel/.test(capture) && /captureVoiceOnly/.test(capture), 'capture exposes camera + voice-only isolation control');
assert(!/Booth camera/.test(TIQ.views._buildCardHtml(candidate, true)), 'camera chrome stays out of the decision card');

/* Combination E: avatar name picker includes simulated people already tagged */
const opts = TIQ.views._scenePeopleNameOptions(candidate);
assert(opts.some(function(o) { return /Avery Chen/.test(o.name); }), 'name picker includes candidate avatar');
assert(opts.some(function(o) { return /Taylor Morgan/.test(o.name); }), 'name picker includes recruiter avatar');

console.log('AI booth avatar/voice isolation E2E passed');
