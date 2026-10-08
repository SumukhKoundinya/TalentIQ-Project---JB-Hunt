const assert = require('assert');
const fs = require('fs');
const { loadApp } = require('./harness');
const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js']);
const raw = `Alex Rivera
EXPERIENCE
Engineering Intern | Northwind
June 2025 - August 2025
Fayetteville, Arkansas
Built a Python inspection tool that reduced processing time by 18%.
Library Assistant | City Library
Cataloged books and maintained the community archive.
PROJECTS
Solar Cart — Developed a solar-powered cart using CAD to test energy efficiency.
Route Atlas — Built a Python map to compare regional routes.
CERTIFICATIONS
AWS Certified Cloud Practitioner
Microsoft Office Specialist
SKILLS
Python, Java, JavaScript, Excel, Leadership, SQL, HTML, CSS, PowerPoint, Logistics, Operations, English, Hindi`;
const c = TIQ.intake.buildCandidate({firstName:'Alex',lastName:'Rivera'});
c.parsedResume = TIQ.ai.extractResumeData(raw);
c.parsedResume.experience[0].location = 'Fayetteville, Arkansas';
c.resumeUpload = {name:'alex.pdf',parsedAt:'2026-10-01'};
c.skills = ['Python','Java','JavaScript','Excel','Leadership','SQL','HTML','CSS','PowerPoint','Logistics','Operations','English','Hindi'];
TIQ.state.candidates = [c, TIQ.intake.buildCandidate({firstName:'Sam',lastName:'Ellis'})];
const html = TIQ.views._buildCardHtml(c, true);
assert(!html.includes('resume-bar'), 'identity leads without scan banner');
const top = TIQ.views._topSkillsHtml(c);
assert.strictEqual((top.match(/class="skill-pill"/g)||[]).length,13, 'all skill values remain available with overflow hidden');
assert(top.includes('data-capture-skills') && top.includes('aria-label="10 additional skills"'), 'overflow has an accessible counted popover control');
assert(top.includes('capture-skills-leader') && (top.match(/data-skill-index="\d+"(?! hidden)/g)||[]).length===3, 'skills use a leader and three visible chips');
const expanded = TIQ.views._allSkillsHtml(c);
c.skills.forEach(s => assert(expanded.includes(s), 'all skills retained: '+s));
assert(expanded.includes('All skills') && expanded.includes('skill-group__label'));
const entries = TIQ.views._resumeHighlightEntries(c);
assert(entries.length >= 3, 'all source-backed highlight entries remain available');
assert(entries.filter(e=>e.category==='Project').length, 'projects are not arbitrarily capped');
assert(entries.filter(e=>e.category==='Certifications').length>=1, 'source credentials are retained');
assert(entries.some(e=>e.dates==='June 2025 - August 2025' && e.location==='Fayetteville, Arkansas'), 'dates and location remain separate source fields');
const flags = TIQ.views._flagChipsHtml(TIQ.getMissingFlags(c));
const beforeDisclosure = flags.split('<details')[0];
assert.strictEqual((beforeDisclosure.match(/data-flag-key=/g)||[]).length,2);
assert(flags.includes('View all') && flags.includes('data-flag-tab="notes"'));
assert(beforeDisclosure.indexOf('data-flag-key="Work Authorization"') < beforeDisclosure.indexOf('data-flag-key="Location"'), 'stable priority flag order');
assert.strictEqual((flags.split('alert-banner__body')[1].match(/data-flag-key=/g)||[]).length,TIQ.getMissingFlags(c).length, 'all flags stay actionable');
const capture = TIQ.views.renderRecruiterCapture();
assert(capture.includes('View resume &amp; evidence') && capture.includes('data-capture-details-back'));
assert(!capture.includes('Candidate records') && capture.includes('Alex Rivera'), 'candidate evidence omits the redundant records heading');
const css = fs.readFileSync('styles.css','utf8');
assert(css.includes('#view-capture .capture-workspace') && /minmax\(0, 38fr\) minmax\(0, 62fr\)/.test(css));
assert(css.includes('data-details-open') && !css.includes('-webkit-line-clamp: 2'), 'content is scrollable rather than clipped by a line clamp');
assert(css.includes('.capture-triage-label { white-space: nowrap; }'), 'decision labels stay on one line');
const real = fs.readFileSync('tests/highlight-parser.test.js','utf8').match(/const REAL_RESUME = `([\s\S]*?)`;/)[1];
const nirmay = TIQ.intake.buildCandidate({firstName:'Nirmay',lastName:'Fixture'});
nirmay.parsedResume = TIQ.ai.extractResumeData(real);
TIQ.ai.applyParsedData(nirmay,nirmay.parsedResume);
nirmay.resumeUpload = {name:'fixture.pdf',parsedAt:'2026-10-01'};
nirmay.skills = c.skills.slice();
nirmay.workAuthorization = '';
nirmay.workLocations = [];
nirmay.phone = '';
nirmay.notes = '';
nirmay.areasDiscussed = ['Projects'];
assert.strictEqual(TIQ.getMissingFlags(nirmay).length,4);
assert(TIQ.views._topSkillsHtml(nirmay).includes('data-capture-skills'));
const nirmayEntries = TIQ.views._resumeHighlightEntries(nirmay);
assert(nirmayEntries.length>=5);
const nirmayLabels = Array.from(TIQ.views._resumeHighlightsHtml(nirmay).matchAll(/resume-highlights__category">([^<]*)/g), match => match[1]);
assert.equal(new Set(nirmayLabels).size, nirmayLabels.length, 'category counts group all entries once');
assert.strictEqual(TIQ.views._resumeHighlightEntries(nirmay).filter(e=>e.category==='Certifications').length,2);
const sparse = TIQ.intake.buildCandidate({firstName:'Sparse',lastName:'Fixture'});
assert.strictEqual(TIQ.views._resumeHighlightEntries(sparse).length,0);
assert.strictEqual(TIQ.views._topSkillsHtml(sparse),'');
console.log('Capture responsive hierarchy tests passed');
