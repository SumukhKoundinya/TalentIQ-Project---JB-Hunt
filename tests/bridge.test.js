const { loadApp, assert } = require('./harness');
const T = loadApp(['workflow.js']);
const c = T.intake.buildCandidate({firstName:'Sample',lastName:'Person',email:'sample@example.test'}, {state:{candidates:[]}});
c.id = 'submission-unique'; c.consent = {profile:true,audio:false,at:'2026-09-14T12:00:00Z'};
c.provenance = {firstName:'intake',lastName:'intake',email:'intake'};
c.resumeUpload = {name:'resume.pdf',sourceUrl:'blob:private',parsedAt:'today'};
const json = T.bridge.serialize(c);
const parsed = T.bridge.parse(json);
assert(!json.includes('blob:private'), 'portable submission excludes object URLs');
assert(parsed.candidate.provenance.email === 'intake', 'provenance survives transfer');
assert(parsed.candidate.resumeNeedsAttachment === true, 'recipient must attach original PDF');
T.state.candidates = [];
assert(T.bridge.importSubmission(parsed,'event-a') === true, 'validated submission imported');
assert(T.bridge.importSubmission(parsed,'event-a') === false && T.state.candidates.length === 1, 'repeat import does not overwrite');
for (const bad of ['{}','not json',JSON.stringify({version:99}),json.replace('"profile": true','"profile": false')]) {
  let rejected = false; try { T.bridge.parse(bad); } catch (_) { rejected = true; }
  assert(rejected,'malformed or unconsented payload rejected');
}
const approved = {summary:'old',approvalStatus:'Approved',approverId:'R1',approvalTimestamp:'then'};
T.invalidateApproval(approved);
assert(approved.approvalStatus === 'Pending' && !approved.approvalTimestamp, 'editing invalidates approval');
(async function() {
  T.state.candidates = [{id:'a',eventId:'event-a',audioNotes:[{blobId:'a-audio'}]}, {id:'b',eventId:'event-b',audioNotes:[{blobId:'b-audio'}]}];
  const deleted = []; T.AudioDB.deleteBlob = async id => deleted.push(id);
  await T.deleteEventData('event-a');
  assert(T.state.candidates.length === 1 && T.state.candidates[0].id === 'b' && deleted.join() === 'a-audio', 'event deletion preserves other records and audio');
})();
