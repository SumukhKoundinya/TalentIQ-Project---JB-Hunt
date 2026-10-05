const { loadApp, assert } = require('./harness');
const TIQ = loadApp();

const parsed = {
  contact: { name: 'Sofia Rodriguez', firstName: 'Sofia', lastName: 'Rodriguez', email: 'sofia@u.edu', phone: '(555) 123-4567', graduationDate: 'May 2027' },
  education: [{ school: 'University of Tennessee', degree: 'BS', major: 'Data Science', year: '2027' }],
  gpa: '3.78',
  skills: ['Python', 'SQL'],
  experience: [], projects: [], certifications: [], rawText: ''
};

function main() {
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

  const existing = { firstName: 'Mia', gpa: '3.5' };
  TIQ.ai.applyParsedData(existing, parsed);
  assert(existing.firstName === 'Mia' && existing.gpa === '3.5', 'never overwrites set values');
  assert(existing.email === 'sofia@u.edu' && existing.university === 'University of Tennessee', 'backfills remaining empty fields');
}

function newFieldTests() {
  const rich = {
    contact: { firstName: 'Sofia', lastName: 'Rodriguez', email: 's@u.edu', phone: '', address: 'Nashville, TN 37206' },
    education: [{ school: 'University of Tennessee', degree: 'BS', degreeProgram: 'Bachelor of Science', major: 'Data Science', year: '2027' }],
    workAuthorization: 'US Citizen',
    links: { linkedin: 'https://linkedin.com/in/sofia', github: '', portfolio: '' },
    gpa: '3.8', skills: [], experience: [], projects: [], certifications: [], rawText: ''
  };

  /* degreeProgram is only backfillable if intake left it empty. buildCandidate
     used to pre-fill the default, which made the backfill a silent no-op. */
  const viaIntake = TIQ.intake.buildCandidate({ firstName: 'Sofia', lastName: 'Rodriguez', email: 's@u.edu', resumeName: 'sofia.pdf' });
  assert(viaIntake.degreeProgram === '', 'intake leaves degreeProgram empty when a resume is attached, so the scan can fill it');
  assert(viaIntake.resumeAddress === '' && viaIntake.links && typeof viaIntake.links === 'object', 'intake seeds the new resumeAddress and links fields');

  const noResume = TIQ.intake.buildCandidate({ firstName: 'A', lastName: 'B', email: 'a@b.c' });
  assert(noResume.degreeProgram === TIQ.CONFIG.defaultDegreeProgram, 'intake still assumes a default degree when there is no resume to scan');

  const c = viaIntake;
  TIQ.ai.applyParsedData(c, rich);
  assert(c.degreeProgram === 'Bachelor of Science', 'degreeProgram backfills from the resume when intake left it empty');
  assert(c.provenance && c.provenance.degreeProgram === 'resume', 'the backfilled degree is stamped as resume-sourced');
  assert(c.workAuthorization === 'US Citizen', 'work authorization backfills');
  assert(c.provenance && c.provenance.workAuthorization === 'resume', 'work authorization is stamped as resume-sourced');
  assert(c.resumeAddress === 'Nashville, TN 37206', 'resume address backfills');
  assert(c.links && c.links.linkedin === 'https://linkedin.com/in/sofia', 'links backfill');
  assert(!c.workLocations || !c.workLocations.length, 'a resume address never populates the work-location preference');

  const supplied = TIQ.intake.buildCandidate({ firstName: 'A', lastName: 'B', email: 'a@b.c', degreeProgram: 'Master of Science' });
  TIQ.ai.applyParsedData(supplied, rich);
  assert(supplied.degreeProgram === 'Master of Science', 'a recruiter-supplied degree is never overwritten by the resume');

  const authCand = { workAuthorization: 'US Citizen' };
  TIQ.ai.generateSummary(authCand);
  const authTrace = TIQ.ai.generateSummary(authCand).traceability.filter(function (t) { return /Work authorization/.test(t); });
  assert(authTrace.length === 0 || authTrace.every(function (t) { return /— intake form$/.test(t); }), 'a recruiter-entered work authorization is still cited as recruiter input');

  let threw = false;
  try { TIQ.ai.applyParsedData({}, null); } catch (e) { threw = true; }
  assert(!threw, 'applyParsedData tolerates a null parse instead of throwing');

  /* ---- re-scan refresh ---- */
  const stale = {
    skills: ['Legacy Skill A'],
    links: { linkedin: 'https://linkedin.com/in/old', github: '', portfolio: '' },
    provenance: { skills: 'resume', links: 'resume', gpa: 'resume' },
    gpa: '2.0'
  };
  const fresh = {
    contact: { firstName: 'Sofia', lastName: '', email: '', phone: '', address: 'Nashville, TN 37206' },
    education: [], workAuthorization: '', gpa: '3.9',
    skills: ['Python', 'SQL'], projects: [], experience: [], certifications: [],
    links: { linkedin: 'https://linkedin.com/in/new', github: '', portfolio: '' }, rawText: ''
  };
  TIQ.ai.applyParsedData(stale, fresh, { refresh: true });
  assert(stale.skills.join(',') === 'Python,SQL', 'a re-scan corrects skills the machine itself wrote');
  assert(stale.gpa === '3.9', 'a re-scan corrects a resume-sourced gpa');
  assert(stale.links.linkedin === 'https://linkedin.com/in/new', 'a re-scan corrects resume-sourced links');
  assert(stale.resumeAddress === 'Nashville, TN 37206', 'a re-scan still fills a field that was previously empty');

  const typed = { firstName: 'Mia', gpa: '4.0', provenance: { firstName: 'form', gpa: 'form' } };
  TIQ.ai.applyParsedData(typed, fresh, { refresh: true });
  assert(typed.firstName === 'Mia' && typed.gpa === '4.0', 'a re-scan never overwrites a recruiter-entered value');

  const noRefresh = { skills: ['Legacy Skill A'], provenance: { skills: 'resume' } };
  TIQ.ai.applyParsedData(noRefresh, fresh);
  assert(noRefresh.skills.join(',') === 'Legacy Skill A', 'a plain first pass still never overwrites');
}

main();
newFieldTests();