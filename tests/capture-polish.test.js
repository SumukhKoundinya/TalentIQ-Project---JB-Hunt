const assert = require('node:assert/strict');
const fs = require('node:fs');
const {loadApp} = require('./harness');
const TIQ = loadApp(['components.js','skill-icons.js','views.js']);
function candidate(raw) {
  const c = TIQ.intake.buildCandidate({firstName:'Fixture',lastName:'Candidate'});
  c.parsedResume = TIQ.ai.extractResumeData(raw);
  c.resumeUpload = {name:'fixture.pdf',parsedAt:new Date().toISOString(),sourceUrl:'blob:fixture'};
  return c;
}
const demo = fs.readFileSync('demo-candidates.js','utf8');
function sample(id) {
  const raw = demo.match(new RegExp("\\{id:'"+id+"'[\\s\\S]*?resume:`([\\s\\S]*?)`"))[1];
  const c = candidate(raw);
  // The actual authored-demo initialization preserves its complete credential list.
  c.parsedResume.certifications = (raw.match(/CERTIFICATIONS\n([\s\S]*?)\nSKILLS/) || [,''])[1].split('\n').filter(Boolean);
  return c;
}
const morgan = sample('ops'), taylor = sample('analytics');
const project = c => TIQ.views._captureVisualEntries(c).find(e=>e.category==='Project');
assert(!project(morgan).facts.some(f=>/^Dock Appointment Planner$/i.test(f)), 'project metadata never becomes a standalone fact');
assert.deepEqual(Array.from(project(morgan).tools), ['Excel', 'Power BI']);
assert(project(morgan).facts.some(f=>/8 loading docks/.test(f)));
assert(project(morgan).facts.some(f=>/15%.*classroom simulation/.test(f)), 'simulation qualifier is preserved');
assert(!project(taylor).facts.some(f=>/^(Dashboard|the dashboard presentation)$/i.test(f)));
assert(project(taylor).facts.some(f=>/12 facilities/.test(f)));
assert.deepEqual(Array.from(project(taylor).tools), ['Python', 'SQL', 'Power BI']);
assert(/Campus Applied Analytics Showcase/.test(project(taylor).distinction));
assert(!project(taylor).facts.some(f=>/Showcase/.test(f)), 'award is not duplicated as an ordinary fact');
const experience = TIQ.views._captureVisualEntries(morgan).find(e=>e.category==='Experience');
assert(experience.facts.some(f=>/18% using an Excel exception tracker/.test(f)));
assert.equal(experience.name,'Operations Intern');
assert.equal(experience.organization,'Ozark Freight Services');
assert(TIQ.views._resumeHighlightsHtml(morgan).includes('Experience · 1'), 'role count is visible in the category group');
const leadership = TIQ.views._captureVisualEntries(taylor).find(e=>e.category==='Leadership');
assert.equal(leadership.organization,'University of Memphis');
assert(!leadership.facts.includes('University of Memphis'));
const cert = TIQ.views._captureVisualEntries(morgan).find(e=>e.category==='Certifications');
assert(!TIQ.views._captureHighlightItemHtml(cert).includes('<li'));
const generic = candidate('PROJECTS\nInventory Monitor | Python, SQL\n• Built a Python and SQL inventory monitor tracking 30 stores.\n• Reduced errors by 12% in a classroom simulation.');
assert(!project(generic).facts.some(f=>/^Inventory Monitor$/i.test(f)));
assert(project(generic).facts.some(f=>/30 stores/.test(f)));
for (const c of [morgan,taylor,generic]) {
  for (const e of TIQ.views._captureVisualEntries(c)) {
    if(e.category !== 'Certifications') assert(e.facts.every(f=>f.split(/\s+/).length>2));
  }
}
const html=TIQ.views._captureHighlightItemHtml(experience);
assert(html.includes('<svg') && html.includes('stroke-width="1.5"'));
assert(html.includes('capture-item-context') && html.includes('Ozark Freight Services') && html.includes('May 2026 - August 2026'));
TIQ.state.candidates=[morgan]; TIQ.views._captureIndex=0;
const captureHtml = TIQ.views.renderRecruiterCapture();
assert(!captureHtml.includes('From résumé'), 'candidate card omits the resume provenance badge');
assert(!captureHtml.includes('Original résumé text'), 'candidate records omit the raw resume text disclosure');
assert(captureHtml.includes('href="blob:fixture"') && captureHtml.includes('Open original résumé'), 'source-backed candidate records link to the original resume');
const captureCopyWithoutResumeLink = captureHtml.replace(/<a class="capture-full-resume"[\s\S]*?<\/a>/, '');
assert(!captureCopyWithoutResumeLink.includes('Résumé') && !captureCopyWithoutResumeLink.includes('résumé'), 'visible capture copy uses plain resume spelling outside the link label');
const legacySpelling = candidate('PROJECTS\nRésumé source wording remains in an older saved upload.');
TIQ.state.candidates = [legacySpelling];
const legacyCapture = TIQ.views.renderRecruiterCapture();
const legacyCopyWithoutResumeLink = legacyCapture.replace(/<a class="capture-full-resume"[\s\S]*?<\/a>/, '');
assert(!legacyCopyWithoutResumeLink.includes('Résumé') && !legacyCopyWithoutResumeLink.includes('résumé'), 'legacy saved resume text is normalized in the visible document');
const noCredential = sample('ops'); noCredential.parsedResume.certifications=[];
const leaderFacts = TIQ.views._captureVisualEntries(noCredential).filter(e=>e.category==='Leadership').flatMap(e=>e.facts);
assert.equal(leaderFacts.length,new Set(leaderFacts).size,'raw harvesting cannot duplicate an owned leadership contribution');
assert.equal(TIQ.views._captureContributionFacts('Coordinated 6 team members during prototype testing.','Team Captain').length,1);
assert(TIQ.views._captureMetricHtml('24 daily shipments and 12 facilities').includes('>24 daily shipments</strong>'));
assert(TIQ.views._captureMetricHtml('24 daily shipments and 12 facilities').includes('>12 facilities</strong>'));
const personalFixture=candidate(fs.readFileSync('tests/highlight-parser.test.js','utf8').match(/const REAL_RESUME = `([\s\S]*?)`;/)[1]);
assert(project(personalFixture).facts.some(f=>/6 Arkansas counties/.test(f)));
assert(project(personalFixture).facts.some(f=>/75% accuracy/.test(f)));
assert(!project(personalFixture).facts.some(f=>/^Built with ["'.]/.test(f)));
assert(!TIQ.views._captureContributionFacts('Designed a Python route model covering 8 routes.','Route Model').some(f=>/^Built/.test(f)), 'display preserves the stated action');
const inlineAward=candidate('PROJECTS\nRoute Map | Python\n• Built a Python tool; won Regional Innovation Prize (2025).');
assert(!project(inlineAward).facts.some(f=>/Innovation Prize/.test(f)), 'inline awards are not duplicated in ordinary facts');
assert(/Innovation Prize/.test(project(inlineAward).distinction));
assert.equal((project(inlineAward).distinction.match(/Innovation Prize/g)||[]).length,1);
assert(TIQ.views._captureContributionFacts('Built “Inventory Monitor” tracking 30 stores.','Inventory Monitor').some(f=>/30 stores/.test(f)));
console.log('Capture source-backed fact quality and polish tests passed');
