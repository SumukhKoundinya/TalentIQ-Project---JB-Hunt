const assert = require('assert');
const { loadApp } = require('./harness');

const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js']);
const text = `Mia Williams
EDUCATION
University of Arkansas
B.S. Computer Science
EXPERIENCE
Software Engineer Intern | Acme
May 2025 - Aug 2025
• Built a Python pipeline to validate shipment records and reduced daily processing time by 25% for the operations team.
• Documented deployment steps for teammates.
PROJECTS
Route Optimizer — Built a routing dashboard using Python and SQL to compare delivery schedules, reducing simulated mileage by 12% across regional routes.
CERTIFICATIONS
AWS Certified Cloud Practitioner
SKILLS
Python, SQL`;

function candidate(id, source) {
  return { id, firstName: 'Mia', lastName: 'Williams', skills: ['Python', 'SQL'],
    resumeUpload: { name: id + '.pdf', parsedAt: '2026-09-30' },
    parsedResume: TIQ.ai.extractResumeData(source), accomplishments: [], audioNotes: [], notes: '' };
}

async function main() {
  const c = candidate('A', text);
  const html = TIQ.views._buildCardHtml(c, true);
  assert(html.indexOf('skills-block') < html.indexOf('resume-highlights'), 'highlights follow skills');
  assert(html.includes('role="region" tabindex="0" aria-label="Resume highlights"'), 'highlights are directly available in a keyboard-scrollable region');
  const highlights = TIQ.views._resumeHighlightsHtml(c);
  const groupLabels = Array.from(highlights.matchAll(/resume-highlights__category">([^<]*)/g), match => match[1]);
  assert.equal(new Set(groupLabels).size, groupLabels.length, 'category labels appear once with shown-item counts');
  assert(highlights.includes('Experience · 1') && highlights.includes('Projects · 1') && highlights.includes('Certifications · 1'));
  assert(highlights.includes('Software Engineer Intern') && highlights.includes('Acme'));
  assert(highlights.includes('25%') && highlights.includes('12%') && highlights.includes('Python and SQL'));
  assert(highlights.includes('AWS Certified Cloud Practitioner'), 'certification name is retained without following skills text');
  assert(!highlights.includes('University of Arkansas') && !highlights.includes('•'));
  assert(!/<strong>[^<]*(?:Built|reduced)/.test(highlights), 'descriptions are not bold');
  assert(!html.includes('card-more'), 'full details are not hidden behind an additional disclosure');

  const other = candidate('B', text.replace(/Acme/g, 'Beta').replace(/Route Optimizer/g, 'Delivery Planner'));
  TIQ.state.candidates = [c, other];
  TIQ.views._captureIndex = 1;
  const switched = TIQ.views.renderRecruiterCapture();
  assert(switched.includes('Delivery Planner') && !switched.includes('Route Optimizer'), 'switching shows only the front candidate data');
  TIQ.views._captureIndex = 0;
  assert(TIQ.views.renderRecruiterCapture().includes('Route Optimizer'));

  const sparse = candidate('C', 'EDUCATION\nUniversity of Arkansas\nSKILLS\nPython, SQL');
  sparse.notes = 'Led a fictional team of 99 people.';
  assert(!TIQ.views._resumeHighlightsHtml(sparse).includes('<li '), 'no education, skills, notes or filler');
  const fs = require('fs');
  const realText = fs.readFileSync(require.resolve('./highlight-parser.test.js'), 'utf8').match(/const REAL_RESUME = `([\s\S]*?)`;/)[1];
  const real = candidate('REAL', realText);
  const realHighlights = TIQ.views._resumeHighlightsHtml(real);
  assert(realHighlights.includes('Manage &quot;The Hub&quot;'), 'existing parsed fixture retains the concrete work contribution');
  assert(realHighlights.includes('CropIntel AR'), 'existing parsed fixture retains the project context');
  assert(realHighlights.includes('6 Arkansas counties'), 'wrapped project result is preserved');
  assert(realHighlights.includes('Leadership') || realHighlights.includes('Accomplishment'));
  const onlyCert = candidate('CERT', 'CERTIFICATIONS\nAWS Certified Cloud Practitioner');
  assert.strictEqual((TIQ.views._resumeHighlightsHtml(onlyCert).match(/<li /g) || []).length, 1, 'fewer facts means fewer entries');
  assert(TIQ.views._resumeHighlightsHtml({}).includes('Upload'), 'missing resume guidance');
  const unsafe = candidate('X', text);
  unsafe.parsedResume.experience[0].description = 'Invented an achievement not in the document';
  assert(!TIQ.views._resumeHighlightsHtml(unsafe).includes('Invented'), 'claims must occur in the raw source');
  const markup = candidate('HTML', text.replace('Built a Python', 'Built <img src=x onerror=alert(1)> a Python'));
  assert(!TIQ.views._resumeHighlightsHtml(markup).includes('<img'), 'never renders raw HTML');
  const resultInNextSentence = candidate('RESULT', text.replace(
    'Built a routing dashboard using Python and SQL to compare delivery schedules, reducing simulated mileage by 12% across regional routes.',
    'Built a routing dashboard using Python and SQL to compare delivery schedules. Reduced simulated mileage by 12% across regional routes.'
  ));
  assert(TIQ.views._resumeHighlightsHtml(resultInNextSentence).includes('12%'), 'shortening retains a result in the next sentence');

  let finish;
  let rejectNext = false;
  const pdfjsLib = { getDocument: () => ({ promise: rejectNext ? Promise.reject(new Error('Encrypted PDF')) : new Promise(resolve => { finish = resolve; }) }) };
  const pipeline = loadApp(['components.js', 'skill-icons.js', 'views.js'], { pdfjsLib });
  pipeline.state.candidates = [c, other];
  const scan = pipeline.ai.parseAndStoreResume(c, { name: 'replacement.pdf', text: 'pdf', type: 'application/pdf' });
  assert(pipeline.views._resumeHighlightsHtml(c).includes('Parsing'), 'pending replacements show parsing, not stale highlights');
  assert(!pipeline.views._resumeHighlightsHtml(c).includes('Acme'));
  pipeline.views._captureIndex = 1;
  assert(pipeline.views.renderRecruiterCapture().includes('Beta'), 'switching while another candidate parses does not show its stale résumé');
  const replacement = text.replace(/Acme/g, 'Gamma').replace(/Route Optimizer/g, 'Shipment Monitor');
  finish({ numPages: 1, getPage: async () => ({ getTextContent: async () => ({
    items: replacement.split('\n').map(str => ({ str, hasEOL: true }))
  }) }) });
  await scan;
  assert(pipeline.views._resumeHighlightsHtml(c).includes('Gamma'));
  assert(!pipeline.views._resumeHighlightsHtml(c).includes('Acme'));
  assert(pipeline.views._resumeHighlightsHtml(other).includes('Beta'), 'replacement does not alter other candidates');
  const saved = JSON.parse(pipeline.__testStorageStore[pipeline.STORAGE_KEY || 'talentiq_state_v1']);
  assert(saved.candidates[0].parsedResume.rawText.includes('Gamma'), 'existing pipeline persists replacement');
  rejectNext = true;
  await pipeline.ai.parseAndStoreResume(c, { name: 'bad.pdf', text: 'pdf', type: 'application/pdf' });
  assert(pipeline.views._resumeHighlightsHtml(c).includes('Encrypted PDF'));
  assert(!pipeline.views._resumeHighlightsHtml(c).includes('Gamma'), 'failed replacement hides old highlights');
  console.log('resume-highlights tests complete');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
