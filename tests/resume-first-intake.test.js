const assert = require('assert');
const fs = require('fs');
const {loadApp} = require('./harness');

const science = `Jordan Lee
jordan@example.com
EDUCATION
Prairie Institute
Bachelor of Science in Biology
Class of 2028
Major GPA: 3.7 / 4.0
EXPERIENCE
Research Assistant | Field Lab
May 2025 – August 2025
Developed a Python tool to validate 200 field observations.
PROJECTS
Field Atlas — Built an interactive map using Python for the research team.
CERTIFICATIONS
Six Sigma Green Belt`;
const arts = `Casey Morgan
casey@example.com
EDUCATION
Harbor College | B.A. in History | Class of 2026
Cumulative GPA: 3.9+
LEADERSHIP
Led a team of 8 volunteers to organize a community archive.
AWARDS
Awarded the Community Service Medal for organizing the archive.`;
const sparse = `Robin Ellis
robin@example.com
EXPERIENCE
Library Assistant | City Library
Maintained the catalog and organized donated books.`;
const pdf = text => ({numPages:1,getPage:async()=>({getTextContent:async()=>({items:text.split('\n').map(str=>({str,hasEOL:true}))})})});
const file = name => ({name,size:100,type:'application/pdf',text:'pdf'});

async function main() {
  const html = fs.readFileSync('candidate-form.html','utf8');
  assert(html.indexOf('id="resumeInput"') < html.indexOf('id="firstNameInput"'), 'resume upload leads the form');
  assert(/id="manualEntry"/.test(html), 'manual entry is available');
  assert(/id="parseProgress"[^>]*role="status"/.test(html), 'parse state is announced');
  assert(/id="graduationDateInput"[^>]*type="text"/.test(html), 'partial dates remain editable without forced precision');
  assert(/for="profileConsentInput"/.test(html) && /for="audioConsentInput"/.test(html), 'compact consent checkboxes have associated labels');
  assert(/id="viewRecruiterCard"/.test(html), 'saved submission has a direct recruiter-card link');
  const jobs = [];
  const TIQ = loadApp(['candidate-intake.js','components.js','skill-icons.js','views.js'], {pdfjsLib:{getDocument:()=>({promise:new Promise((resolve,reject)=>jobs.push({resolve,reject}))})}});
  const count = TIQ.state.candidates.length;
  const flow = TIQ.intake.createSubmissionFlow();
  assert(!flow.candidate.firstName && !flow.candidate.university && !flow.candidate.skills.length, 'draft never inherits demo data');
  assert.throws(()=>flow.submit({profile:true}), /name|email/i, 'required confirmed details are checked');
  assert.throws(()=>flow.scan({...file('too-big.pdf'),size:6*1024*1024}), /5 MB/);
  assert.throws(()=>flow.scan({...file('bad.docx'),type:'application/msword'}), /PDF/);
  const first = flow.scan(file('science.pdf'));
  assert.strictEqual(flow.status,'parsing');
  assert.strictEqual(TIQ.state.candidates.length,count, 'no profile is stored before explicit consent');
  flow.edit('phone','555-0199');
  jobs[0].resolve(pdf(science)); await first;
  assert.strictEqual(flow.status,'ready');
  assert.strictEqual(flow.candidate.firstName,'Jordan');
  assert.strictEqual(flow.candidate.graduationDate,'2028');
  assert.strictEqual(flow.candidate.gpa,'Major GPA: 3.7 / 4.0');
  assert.strictEqual(flow.candidate.phone,'555-0199');
  flow.edit('firstName','Confirmed');
  const replacement = flow.scan(file('arts.pdf'));
  assert.strictEqual(flow.candidate.university,'', 'obsolete machine fields clear at replacement start');
  assert.strictEqual(flow.candidate.firstName,'Confirmed');
  jobs[1].resolve(pdf(arts)); await replacement;
  assert(flow.candidate.resumeConflicts.some(x=>x.field==='firstName'));
  assert.strictEqual(flow.candidate.university,'Harbor College');
  assert.strictEqual(flow.candidate.experience,undefined);
  const retry = flow.scan(file('failed.pdf'));
  flow.edit('email','edited@example.com');
  jobs[2].reject(new Error('Unreadable PDF')); await retry;
  assert.strictEqual(flow.status,'failed');
  assert(!flow.candidate.university && !flow.candidate.parsedResume);
  assert.strictEqual(flow.candidate.email,'edited@example.com');
  flow.enterManually();
  flow.edit('lastName','Candidate');
  flow.edit('email','invalid@');
  assert.throws(()=>flow.submit({profile:true}),/email/i);
  flow.edit('email','manual@example.com');
  assert.throws(()=>flow.submit({profile:false}),/consent/i);
  const manual = flow.submit({profile:true,audio:false});
  assert.strictEqual(manual.consent.audio,false);
  assert.strictEqual(TIQ.state.candidates.length,count+1);
  assert.throws(()=>flow.submit({profile:true}),/already/i, 'duplicate click cannot create another record');
  const fresh = TIQ.intake.createSubmissionFlow();
  assert(!fresh.candidate.email && !fresh.candidate.university && !fresh.candidate.resumeUpload);
  const old = fresh.scan(file('older.pdf'));
  const latest = fresh.scan(file('latest.pdf'));
  fresh.edit('firstName','Keep');
  jobs[4].resolve(pdf(sparse)); await latest;
  jobs[3].resolve(pdf(science)); await old;
  assert.strictEqual(fresh.candidate.firstName,'Keep');
  assert.strictEqual(fresh.candidate.resumeUpload.name,'latest.pdf');
  assert(!fresh.candidate.gpa && !fresh.candidate.graduationDate && !fresh.candidate.university);
  const saved = fresh.submit({profile:true,audio:true});
  assert.notStrictEqual(saved.id,manual.id);
  assert(saved.parsedResume.experience[0].description.includes('catalog'));
  const order = TIQ.state.candidates.map(c=>c.id).join(',');
  assert(TIQ.views.selectCaptureCandidate(saved.id), 'direct card link selects the exact submitted candidate');
  assert.strictEqual(TIQ.state.candidates[TIQ.views._captureIndex].id,saved.id);
  assert.strictEqual(TIQ.state.selectedId,saved.id);
  assert.strictEqual(TIQ.state.candidates.map(c=>c.id).join(','),order, 'opening a card never reorders other candidates');
  assert.strictEqual(TIQ.views.selectCaptureCandidate('not-on-this-device'),false);
  assert(TIQ.bridge.parse(TIQ.bridge.serialize(saved)).candidate.email === 'robin@example.com', 'confirmed extracted identity survives portable handoff');
  const cancel = TIQ.intake.createSubmissionFlow();
  const late = cancel.scan(file('cancelled.pdf'));
  cancel.enterManually(); cancel.edit('firstName','Manual');
  jobs[5].resolve(pdf(science)); await late;
  assert.strictEqual(cancel.candidate.firstName,'Manual');
  assert(!cancel.candidate.parsedResume && !cancel.candidate.university, 'manual alternative invalidates pending scan');
  for (const [text, name] of [[science,'Jordan'],[arts,'Casey'],[sparse,'Robin']]) {
    const next = TIQ.intake.createSubmissionFlow();
    const scan = next.scan(file(name+'.pdf'));
    jobs[jobs.length-1].resolve(pdf(text)); await scan;
    const record = next.submit({profile:true,audio:false});
    const card = TIQ.views._buildCardHtml(record,true);
    assert(card.includes(name), 'fresh extracted name is shown on the recruiter card');
    assert.strictEqual(record.provenance.firstName,'intake');
    assert(TIQ.bridge.parse(TIQ.bridge.serialize(record)).candidate.firstName === name);
    if (name === 'Jordan') assert(card.includes('200 field observations') && card.includes('Field Atlas'));
    if (name === 'Casey') assert(card.includes('Community Service Medal') && card.includes('3.9+'));
    if (name === 'Robin') assert(!record.gpa && !record.university && !record.graduationDate && card.includes('Library Assistant'));
  }
  console.log('PASS: resume-first intake, review edits, manual submission, limits, failures, replacements and late scans');
}
main().catch(err=>{console.error(err);process.exitCode=1;});
