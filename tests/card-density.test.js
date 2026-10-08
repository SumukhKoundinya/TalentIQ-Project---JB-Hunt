const { loadApp, assert } = require('./harness');

function main() {
  const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js']);

  assert(TIQ.formatMonthYear('2027-05') === 'May 2027', 'ISO month-year formats to readable month');
  assert(TIQ.formatMonthYear('May 2027') === 'May 2027', 'already readable month-year passes through');
  assert(TIQ.formatMonthYear('') === '', 'empty month-year stays empty');

  const card = {
    firstName: 'Avery',
    lastName: 'Johnson',
    university: 'University of Tennessee',
    major: 'Industrial Engineering',
    graduationDate: '2027-05',
    gpa: '3.63',
    parsedResume: TIQ.ai.extractResumeData('Avery Johnson\nPROJECTS\nOptimization Model\n• Built a Python model that reduced processing time by 18%.'),
    resumeUpload: { name: 'avery.pdf', parsedAt: new Date().toISOString() },
    skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Linux', 'Docker'],
    accomplishments: [],
    summary: 'Avery is a Industrial Engineering student at University of Tennessee (graduating 2027-05). Avery has experience in Python and SQL.',
    traceability: ['Education: University of Tennessee Industrial Engineering — intake form', 'Skills: Python, SQL — recruiter input']
  };

  const html = TIQ.views._buildCardHtml(card, true);
  assert(html.indexOf('May 2027') >= 0, 'card shows formatted graduation date');
  assert(html.indexOf('Resume Highlights') >= 0, 'card renders the resume highlights section');
  assert(html.includes('role="region" tabindex="0" aria-label="Resume highlights"'), 'highlights are keyboard-scrollable and named for assistive technology');
  assert(html.indexOf('graduating 2027-05') === -1, 'card does not repeat raw summary text');

  /* A stale empty accomplishments array must not blank the highlights: the card
     regenerates from resume artefacts instead of trusting stored state. */
  assert(html.indexOf('No highlights yet') === -1, 'source-backed highlights are regenerated from the parsed resume');
  assert(html.indexOf('Optimization Model') >= 0, 'the generated highlight names a real artefact');
  assert(/reduced processing time by /i.test(html) && html.includes('>18%</strong>'), 'the source-backed result and emphasis are retained');

  const nothing = Object.assign({}, card, { accomplishments: [], parsedResume: null, summary: '' });
  assert(TIQ.views._buildCardHtml(nothing, true).indexOf('No highlights yet') >= 0,
    'a candidate with no resume and no notes still has a quiet empty state');
}

main();
