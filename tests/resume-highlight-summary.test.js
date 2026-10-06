const assert = require('node:assert/strict');
const { loadApp } = require('./harness');

function fakePdfjs() {
  return {
    getDocument: buffer => {
      const text = new TextDecoder().decode(new Uint8Array(buffer));
      const lines = text.split(/\r?\n/);
      return { promise: Promise.resolve({
        numPages: 1,
        getPage: () => Promise.resolve({ getTextContent: () => Promise.resolve({
          items: lines.map(str => ({ str, hasEOL: true }))
        }) })
      }) };
    }
  };
}

const bundledSample = `Alex Monroe
alex.monroe@example.com | (202) 555-0106 | Conway, AR
EDUCATION
University of Central Arkansas
Bachelor of Business Administration in Business Administration
Expected Graduation: May 2027
EXPERIENCE
Customer Operations Intern | River Valley Shipping Partners
May 2026 - August 2026
- Maintained shipment updates for 18 business accounts and documented customer requests.
- Reduced unresolved request backlog by 20% using an Excel follow-up tracker.
PROJECTS
Customer Service Handoff Guide | Excel
- Created a handoff guide covering 10 common shipping inquiries and escalation steps.
- Tested the guide with 5 classmates in a customer-service simulation.
LEADERSHIP
Business Club President
University of Central Arkansas
- Organized 3 networking events for 75 student attendees.`;

const variedMetrics = `Taylor Bennett
EDUCATION
University of Memphis — B.S. Data Science
PROFESSIONAL EXPERIENCE
Operations Analyst — Delta Distribution Group — Memphis, TN
2023–2025
Tracked 50–70 daily shipments and updated delivery status in the transportation management system, escalating delays to dispatch and customer service.
Built an Excel tracker that reduced weekly reporting preparation from 3 hours to 45 minutes.
Reviewed 300 shipment records, identified recurring appointment errors, and helped reduce missing appointment details by 24%.
PROJECT WORK
Freight Performance Dashboard | Supply Chain Analytics Capstone
Analyzed 12,000 simulated shipment records using SQL and Power BI to compare on-time delivery, cost per mile, and carrier performance.
Identified five lanes with recurring delays and proposed scheduling changes projected to lower late deliveries by 15%.`;

const noMetrics = `Jamie Parker
EDUCATION
Tennessee State University
Bachelor of Arts
EXPERIENCE
Library Assistant — Campus Library
September 2025–Present
Organized incoming materials and maintained an Excel inventory for the reference collection.
Documented clear procedures for student workers and kept the shared catalog consistent.
PROJECTS
Inventory Reorder Worksheet | Excel
Built a spreadsheet that helps bookstore staff plan replenishment and organize stock.`;

async function upload(TIQ, name, text) {
  const candidate = TIQ.intake.buildCandidate({ firstName: name, lastName: 'Example' });
  candidate.resumeUpload = { name: name + '.pdf', parsedAt: '' };
  TIQ.state.candidates.push(candidate);
  const parsed = await TIQ.ai.parseAndStoreResume(candidate, {
    name: name + '.pdf', type: 'application/pdf', text
  });
  assert(parsed, name + ' résumé goes through parseAndStoreResume');
  const entries = TIQ.views._captureVisualEntries(candidate);
  const html = TIQ.views._resumeHighlightsHtml(candidate);
  return { candidate, entries, html };
}

async function main() {
  const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js'], { pdfjsLib: fakePdfjs() });
  const sample = await upload(TIQ, 'Alex', bundledSample);
  const sampleRole = sample.entries.find(entry => entry.category === 'Experience');
  const sampleProject = sample.entries.find(entry => entry.category === 'Project');
  assert.equal(TIQ.views._summarizeCaptureFact('Built a simulated warehouse model, reducing modeled stock discrepancies by 18%.'),
    'Built simulated warehouse model, reducing modeled stock discrepancies by 18%.',
    'warehouse accomplishment keeps both source qualifiers within ten words');
  assert(sampleRole && sampleRole.facts.length <= 2, 'sample résumé role has at most two highlights');
  assert(sampleProject && sampleProject.facts.length <= 2, 'sample résumé project has at most two highlights');
  assert(sampleRole.facts.some(fact => /20%/.test(fact)), 'sample upload retains the quantified backlog result');
  assert(sample.html.includes('<strong class="capture-metric">20%</strong>'), 'percentage metric is emphasized in rendered card');
  assert(sample.html.includes('<strong class="capture-metric">10 common shipping inquiries</strong>'), 'count and complete unit are emphasized together');

  const metrics = await upload(TIQ, 'Taylor', variedMetrics);
  const analyst = metrics.entries.find(entry => entry.category === 'Experience');
  const dashboard = metrics.entries.find(entry => entry.category === 'Project');
  assert(analyst && analyst.facts.length === 2, 'alternate résumé structure keeps two distinct role accomplishments');
  assert(analyst.facts.some(fact => /3 hours to 45 minutes/.test(fact)), 'time savings survive concise selection');
  assert(analyst.facts.some(fact => /helped reduce missing appointment details by 24%/i.test(fact)), 'attributed outcome is retained over volume-only detail');
  assert(!analyst.facts.some(fact => /50–70 daily shipments/.test(fact)), 'routine scale does not outrank measurable improvement');
  assert(dashboard && dashboard.facts.length <= 2 && dashboard.facts.some(fact => /projected/.test(fact)), 'selected project outcome retains its projected qualifier');
  assert(TIQ.views._captureMetricHtml('Analyzed 12,000 simulated shipment records.') === 'Analyzed <strong class="capture-metric">12,000 simulated shipment records</strong>.', 'simulation qualifier and complete scale unit are emphasized together');
  assert(metrics.html.includes('<strong class="capture-metric">from 3 hours to 45 minutes</strong>'), 'complete before/after time measure is emphasized');
  assert(TIQ.views._captureMetricHtml('12,000 simulated shipment records') === '<strong class="capture-metric">12,000 simulated shipment records</strong>', 'scale measure retains its qualifier and unit when emphasized');

  const sparse = await upload(TIQ, 'Jamie', noMetrics);
  const library = sparse.entries.find(entry => entry.category === 'Experience');
  assert(library && library.facts.length > 0, 'metric-free role still has a concrete contribution highlight');
  assert(!/\d/.test(library.facts.join(' ')), 'metric-free résumé does not receive invented numbers');
  assert(sparse.html.includes('Organized incoming materials'), 'metric-free accomplishment renders in the candidate card');

  for (const entry of [...sample.entries, ...metrics.entries, ...sparse.entries]) {
    for (const fact of entry.facts) {
      const words = fact.trim().split(/\s+/).length;
      assert(words <= 10,
        'every candidate-card highlight bullet is at most 10 whitespace-separated words: ' + fact);
      assert(!/\.\.\.|…$/.test(fact), 'highlight is not cut mid-sentence');
    }
  }
  console.log('PASS: upload-pipeline highlight summaries are concise, source-backed, metric-aware, and preserve metric-free contributions');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
