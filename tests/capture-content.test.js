const assert = require('node:assert/strict');
const fs = require('node:fs');
const {loadApp} = require('./harness');
const TIQ = loadApp(['components.js','skill-icons.js','views.js']);
function candidate(raw) {
  const c = TIQ.intake.buildCandidate({firstName:'Fixture',lastName:'Candidate'});
  c.parsedResume = TIQ.ai.extractResumeData(raw);
  c.resumeUpload = {name:'fixture.pdf',parsedAt:new Date().toISOString()};
  return c;
}
function project(c) { return TIQ.views._captureVisualEntries(c).find(e=>e.category==='Project'); }
const real = fs.readFileSync('tests/highlight-parser.test.js','utf8').match(/const REAL_RESUME = `([\s\S]*?)`;/)[1];
for (const metadata of ['2025 Bentonville, Arkansas','Bentonville, Arkansas','Northwind University, Arkansas','Winner, Regional Challenge','2024, 2025','Python, 2025 Bentonville','Python, Northwind University']) {
  const c = candidate('PROJECTS\nField Monitor | '+metadata+'\n• Built a field monitor tracking 30 stores.');
  c.parsedResume.projects = [{name:'Field Monitor',description:metadata+' • Built a field monitor tracking 30 stores.'}];
  assert(!project(c).facts.some(f=>/^Built with/i.test(f)), 'metadata is not a tool list: '+metadata);
}
for (const invalid of ['2025','Bentonville','Northwind University','Winner — Regional Challenge','']) {
  assert(!TIQ.views._captureContributionFacts('Built with '+invalid+'.','').length, 'invalid explicit Built with: '+invalid);
}
assert(!TIQ.views._captureContributionFacts('Built a Northwind University Field Monitor tracking 30 stores.','Field Monitor').some(f=>/^Built with/i.test(f)), 'construction prefix must also identify actual tools');
assert(TIQ.views._captureContributionFacts('Built a Python and SQL Field Monitor tracking 30 stores.','Field Monitor').some(f=>/Built with Python and SQL/.test(f)));
const valid = candidate('PROJECTS\nField Monitor | Python, SQL, Power BI\n• Built a field monitor tracking 30 stores.\n• Reduced errors by 12% in a classroom simulation.');
assert.deepEqual(Array.from(project(valid).tools), ['Python', 'SQL', 'Power BI'], 'supported project technologies stay separate from accomplishment facts');
assert(TIQ.views._resumeHighlightsHtml(valid).includes('Tools: Python, SQL, Power BI'), 'supported project technologies remain visible in the card');
assert(!project(valid).facts.some(f=>/^Built with Python, SQL, and Power BI/.test(f)), 'tool metadata is not rewritten as a claimed accomplishment');
assert(project(valid).facts.some(f=>/12%.*classroom simulation/.test(f)), 'shortening retains simulation qualifier');
assert(TIQ.views._captureContributionFacts('Used advanced logic to achieve 75% accuracy in a classroom simulation.','').includes('Used advanced logic to achieve 75% accuracy in a classroom simulation.'), 'accuracy results retain the source wording and qualifier');
assert(TIQ.views._captureContributionFacts('Used advanced logic to achieve 75% accuracy between simulated cases in a classroom simulation.','').some(f=>/classroom simulation/.test(f)), 'comparative wording must not erase an experimental qualifier');
const nirmay = candidate(real);
const nirmayProject = project(nirmay);
assert(nirmayProject.facts.some(f=>/Developed.*CropIntel AR.*agricultural monitoring.*6 Arkansas counties/.test(f)), 'project highlights keep the complete source accomplishment');
assert(nirmayProject.facts.some(f=>/^Utilized advanced programming logic to achieve 75% accuracy between software development and environmental science\.?$/.test(f)), 'accuracy result retains its source-described comparison context');
assert.equal(nirmayProject.distinction,'Winner — Congressional App Challenge (2025)');
assert(!nirmayProject.facts.some(f=>/Congressional App Challenge/.test(f)));
const nirmayLeadership = TIQ.views._captureVisualEntries(nirmay).find(e=>e.category==='Leadership');
assert(nirmayLeadership.facts.some(f=>/Qualified for and competed at ICDC/.test(f)), 'an explicit competition accomplishment is not lost to the role count');
assert(!nirmayLeadership.facts.some(f=>/1st Place/.test(f)), 'award placements do not become ordinary role facts');
assert(!/\(2025\)/.test(project(candidate(real.replace('\n2025\nProject:', '\nProject:'))).distinction), 'project year alone cannot date an award');
const awardRaw = 'EXPERIENCE\nWinner - Regional App Challenge | 2026\nProject: Field Monitor | 2024\n• Developed "Field Monitor," a web application tracking 30 stores.';
assert.equal(project(candidate(awardRaw)).distinction,'Winner — Regional App Challenge (2026)', 'an explicit inline award year is preserved independently of project year');
assert.equal(TIQ.views._captureVisualEntries(candidate(awardRaw)).filter(e=>/Regional App Challenge/.test(e.distinction || '')).length,1, 'an owned award is not repeated in another group');
const leadershipRaw = 'LEADERSHIP & ACTIVITIES\nVP of Finance & VP of Leadership | 2023 – Present\n2023 – Present\nDECA\n• Organized 4 employer panels attended by 90 students.\nCERTIFICATIONS\nMicrosoft Office Specialist';
const leader = candidate(leadershipRaw);
const entry = TIQ.views._captureVisualEntries(leader).find(e=>e.category==='Leadership');
assert(entry.facts.some(f=>/Organized 4 employer panels attended by 90 students/.test(f)), 'compound role does not discard its own accomplishment');
const doc = TIQ.views._capturePrintResumeHtml(leader);
const heading = doc.match(/<p class="resume-document__line resume-document__item-heading"[^>]*>[^]*?VP of Finance[^]*?<\/p>/)[0];
assert.equal((heading.match(/2023 – Present/g)||[]).length,1, 'inline and next-line dates render once');
const repeated = candidate(leadershipRaw.replace(' | 2023 – Present', ' | DECA | DECA | 2023 – Present 2023 – Present'));
const repeatedHeading = TIQ.views._capturePrintResumeHtml(repeated).match(/<p class="resume-document__line resume-document__item-heading"[^>]*>[^]*?VP of Finance[^]*?<\/p>/)[0];
assert.equal((repeatedHeading.match(/2023 – Present/g)||[]).length,1);
assert.equal((repeatedHeading.match(/DECA/g)||[]).length,1, 'identical inline metadata renders once');
const dateVariants = candidate(leadershipRaw.replace('\n2023 – Present\nDECA', '\n2023 - Present\n2023 – Present\nDECA\nDECA'));
const variantDoc = TIQ.views._capturePrintResumeHtml(dateVariants);
assert.equal((variantDoc.match(/2023 [–-] Present/g)||[]).length,1, 'equivalent repeated date lines render once');
assert.equal((variantDoc.match(/>DECA</g)||[]).length,1, 'identical adjacent source metadata renders once');
const sparse = candidate('LEADERSHIP\nClub President\nNorthwind University');
const sparseLeader = TIQ.views._captureVisualEntries(sparse).find(e=>e.category==='Leadership');
if (sparseLeader) assert.equal(sparseLeader.facts.length,0, 'no manufactured leadership filler');
assert(!TIQ.views._captureContributionFacts('Built. • Developed a. • Dashboard • the dashboard presentation','').length);
console.log('PASS Capture content guards, concise source facts, leadership, and date deduplication');
