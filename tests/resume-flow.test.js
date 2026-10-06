const assert = require('assert');
const { loadApp } = require('./harness');
const fs = require('fs');
const fixtures = {
  engineer: `Alex Rivera
alex@example.com
EDUCATION
Pacific University
Bachelor of Science in Mechanical Engineering
Expected graduation: June 2028
Major GPA: 3.70 / 4.00
SKILLS
Python, Excel
EXPERIENCE
Engineering Intern | Northwind
June 2025 – August 2025
• Designed a Python inspection tool that reduced review time by 18%.
PROJECTS
Solar Cart — Built a solar-powered cart using CAD for campus deliveries.
CERTIFICATIONS
Six Sigma Green Belt`,
  arts: `Taylor Chen
taylor@example.com
ACADEMIC BACKGROUND
Lake College | B.A. in History | Class of 2026
Cumulative GPA: 3.9+
LEADERSHIP
Led a team of 8 volunteers to organize a community archive.
AWARDS
Awarded the Community Service Medal for organizing the archive.`,
  sparse: `Sam Ellis
sam@example.com
EDUCATION
Metro Institute
Coursework: Python, SQL, Computer Science
EXPERIENCE
Library Assistant | City Library
May 2024 – August 2024
Maintained the catalog and organized donated books.`
};
function setup(pdfjsLib) { return loadApp(['components.js','skill-icons.js','views.js'], pdfjsLib ? {pdfjsLib} : {}); }
function pdf(text) { return {numPages:1,getPage:async () => ({getTextContent:async () => ({items:text.split('\n').map(str => ({str,hasEOL:true}))})})}; }
async function main() {
  const TIQ = setup();
  const form = fs.readFileSync('candidate-form.html','utf8');
  assert(!/<(?:input|select)[^>]*name="(?:university|major|graduationDate)"[^>]*required/.test(form), 'education may come entirely from the resume');
  assert.strictEqual(TIQ.views._displayName({resumeUpload:'invented_person.pdf'}), '', 'filename is not evidence of a name');
  const c = TIQ.intake.buildCandidate({});
  assert.strictEqual(c.degreeProgram, '', 'intake must not invent a degree without a resume');
  const normalized = TIQ.normalizeCandidate({id:TIQ.seedCandidates[0].id,firstName:'Real'}, TIQ.seedCandidates[0]);
  assert(!normalized.university && !normalized.skills, 'real stored records must not inherit demo fields by ID');
  const parsed = TIQ.ai.extractResumeData(fixtures.engineer);
  assert.strictEqual(parsed.education[0].school, 'Pacific University', 'separate degree line belongs to the same school');
  assert.strictEqual(parsed.education[0].major, 'Mechanical Engineering');
  assert.strictEqual(parsed.education[0].degreeProgram, 'Bachelor of Science');
  const degreeOnly = TIQ.ai.extractResumeData('EDUCATION\nMaster of Arts in History\nExpected graduation: May 2027');
  assert.strictEqual(degreeOnly.education[0]?.degreeProgram, 'Master of Arts', 'a stated degree survives an absent school');
  assert.strictEqual(degreeOnly.education[0].school, '');
  const reversed = TIQ.ai.extractResumeData('EDUCATION\nMaster of Arts in History\nLake College\nClass of 2027');
  assert.strictEqual(reversed.education[0]?.school, 'Lake College', 'degree-before-school layout stays in one record');
  assert.strictEqual(parsed.gpa, 'Major GPA: 3.70 / 4.00', 'GPA scope and denominator preserved');
  TIQ.ai.applyParsedData(c, parsed);
  assert.strictEqual(c.firstName, 'Alex');
  assert.strictEqual(TIQ.initialsFor(c), 'AR');
  assert.strictEqual(c.university, 'Pacific University');
  assert(c.certifications.includes('Six Sigma Green Belt'));
  c.parsedResume = parsed;
  let html = TIQ.views._buildCardHtml(c, true);
  assert(html.includes('Mechanical Engineering') && html.includes('Major GPA: 3.70 / 4.00'));
  assert(!html.includes('GPA Major GPA'));
  assert(/resume-highlights__name[^>]*>Engineering Intern/.test(html), 'highlight title is its own semibold line');
  const arts = TIQ.ai.extractResumeData(fixtures.arts);
  assert.strictEqual(arts.education[0].major, 'History');
  assert.strictEqual(arts.contact.graduationDate, '2026');
  assert.strictEqual(arts.gpa, 'Cumulative GPA: 3.9+');
  const artsCandidate = {parsedResume:arts};
  const artsHighlights = TIQ.views._resumeHighlightsHtml(artsCandidate);
  assert(!/<strong[^>]*>Led a team/.test(artsHighlights), 'leadership contribution is not a bold title');
  assert(artsHighlights.includes('<li>Led a team of '), 'leadership evidence stays regular-weight while only the metric is emphasized');
  const sparse = TIQ.ai.extractResumeData(fixtures.sparse);
  assert.strictEqual(sparse.education[0].major, '', 'coursework is not a major');
  assert.strictEqual(sparse.education[0].degreeProgram, '');
  assert.strictEqual(sparse.contact.graduationDate, '', 'employment dates are not graduation dates');
  assert.strictEqual(TIQ.ai._normalizeDegree('Bachelor', '').degreeProgram, 'Bachelor', 'no inferred science qualification');
  assert.strictEqual(TIQ.ai._normalizeDegree('Bachelor', 'Marketing').degreeProgram, 'Bachelor', 'a major cannot imply the degree qualification');
  assert.strictEqual(TIQ.ai._normalizeDegree('', 'MBA coursework').degreeProgram, '', 'major text alone cannot create a degree');
  assert.strictEqual(TIQ.ai._normalizeDegree('Bachelor of Engineering', '').degreeProgram, 'Bachelor of Engineering', 'explicit qualification is retained');
  const entered = TIQ.intake.buildCandidate({firstName:'Alicia',university:'Chosen College',gpa:'3.8'});
  TIQ.ai.applyParsedData(entered, parsed);
  assert.strictEqual(entered.firstName, 'Alicia');
  assert(entered.resumeConflicts.some(x => x.field === 'university' && x.entered === 'Chosen College' && x.resume === 'Pacific University'));
  assert(TIQ.views._resumeConflictsHtml(entered).includes('Resume discrepancies'), 'field conflicts remain available for recruiter review');
  c.major = 'Recruiter correction'; // even legacy editors that leave provenance unchanged
  TIQ.ai.applyParsedData(c, sparse, {refresh:true});
  assert.strictEqual(c.major, 'Recruiter correction');
  assert.strictEqual(c.gpa, '', 'replacement clears omitted machine-written GPA');
  assert.strictEqual(c.degreeProgram, '');
  assert.strictEqual(c.skills.join(','), 'Python,SQL', 'newly supported skills replace the previous resume skills');
  assert.strictEqual(c.certifications.length, 0);
  const cleared = TIQ.intake.buildCandidate({});
  TIQ.ai.applyParsedData(cleared, parsed); cleared.gpa = '';
  TIQ.ai.applyParsedData(cleared, parsed, {refresh:true});
  assert.strictEqual(cleared.gpa,'', 'deliberately cleared recruiter values are not repopulated');
  const sameDate = TIQ.intake.buildCandidate({graduationDate:'2028-06'});
  TIQ.ai.applyParsedData(sameDate, parsed);
  assert(!sameDate.resumeConflicts.some(x => x.field === 'graduationDate'), 'equivalent dates are not discrepancies');
  const userFixture = fs.readFileSync('tests/highlight-parser.test.js','utf8').match(/const REAL_RESUME = `([\s\S]*?)`;/)[1];
  assert.strictEqual(TIQ.ai.extractResumeData(userFixture).gpa, '4.0+');
  const jobs = [];
  const asyncTIQ = setup({getDocument: () => ({promise:new Promise((resolve,reject) => jobs.push({resolve,reject}))})});
  const a = asyncTIQ.intake.buildCandidate({firstName:'Entered',lastName:'Name'});
  const b = asyncTIQ.intake.buildCandidate({firstName:'Other',lastName:'Candidate'});
  asyncTIQ.state.candidates = [a,b];
  const file = name => ({name,type:'application/pdf',text:'stub'});
  const first = asyncTIQ.ai.parseAndStoreResume(a,file('first.pdf'));
  const second = asyncTIQ.ai.parseAndStoreResume(a,file('second.pdf'));
  jobs[1].resolve(pdf(fixtures.arts)); await second;
  jobs[0].resolve(pdf(fixtures.engineer)); await first;
  assert.strictEqual(a.resumeUpload.name,'second.pdf');
  assert.strictEqual(a.university,'Lake College', 'late obsolete scan cannot overwrite newest scan');
  assert.strictEqual(a.firstName,'Entered');
  asyncTIQ.views._captureIndex = 1;
  assert(asyncTIQ.views._buildCardHtml(b,true).includes('Other Candidate'));
  assert(!b.parsedResume && !b.university, 'scan stays attached to original candidate');
  a.gpa = 'Recruiter verified 3.95';
  const failure = asyncTIQ.ai.parseAndStoreResume(a,file('broken.pdf'));
  assert.strictEqual(a.university,'', 'old machine values cleared as soon as replacement starts');
  assert.strictEqual(a.gpa,'Recruiter verified 3.95');
  assert.strictEqual(a.parsedResume,null);
  jobs[2].reject(new Error('Unreadable PDF')); await failure;
  html = asyncTIQ.views._buildCardHtml(a,true);
  assert(html.includes('parsing failed') && !html.includes('Lake College') && !html.includes('Community Service Medal'));
  assert(JSON.parse(asyncTIQ.__testStorageStore.talentiq_state_v1).candidates[0].gpa === 'Recruiter verified 3.95');
  const third = asyncTIQ.ai.parseAndStoreResume(a,file('third.pdf'));
  a.major = 'Edited while scanning'; a.provenance.major = 'form';
  const otherScan = asyncTIQ.ai.parseAndStoreResume(b,file('other.pdf'));
  jobs[4].resolve(pdf(fixtures.sparse)); await otherScan;
  jobs[3].resolve(pdf(fixtures.engineer)); await third;
  assert.strictEqual(a.major,'Edited while scanning');
  assert.strictEqual(b.university,'Metro Institute');
  assert.strictEqual(a.university,'Pacific University');
  assert(a.resumeConflicts.some(x => x.field === 'major'));
  console.log('PASS: candidate resume flow, varied layouts, conflicts, replacement, switching, failure and scan races');
}
main().catch(err => { console.error(err); process.exitCode=1; });
