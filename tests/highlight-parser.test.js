const { loadApp, assert } = require('./harness');

const REAL_RESUME = `
Nirmay Sharma
nirmays06@gmail.com | 479-418-6301 | https://www.linkedin.com/in/nirmay-sharma/

EDUCATION
Bentonville High School
GPA: 4.0+
Bentonville, AR
Expected Graduation: May 2027

EXPERIENCE
Winner - Congressional App Challenge | Bentonville, AR
2025
Project: CropIntel AR | 2025
Bentonville, Arkansas
● Developed "CropIntel AR," an web application designed to assist in agricultural monitoring
and data visualization of rice, soybeans, and cotton across 6 Arkansas counties
● Recognized by our district congressman Steve Womack for technical innovation and
coding proficiency.
● Utilized advanced programming logic to achieve 75% accuracy between software
development and environmental science.
Teaching Assistant – Small Business Operations
Aug 2025 - Present
Bentonville High School
Bentonville AR
● Manage "The Hub" (school store) by assisting 14 students with daily operations and
logistics.
● Execute store operations 2-3 hours weekly, managing merchandise pricing and strategic
product display.

LEADERSHIP & ACTIVITIES
VP of Finance & VP of Leadership | 2023 – Present
DECA
● 1st Place State Winner: Innovation Plan event (SCDC).
● International Competitor: Qualified for and competed at ICDC.

SKILLS, CERTIFICATIONS OR AWARDS
Certifications/Training: Microsoft Office Specialist (Excel, PowerPoint, Word); IT Specialist in
Computational Thinking.
Technical: Proficient in Java, Python, HTML, CSS, JavaScript.
`;

function main() {
  const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js']);

  const stale = {
    firstName: 'Nirmay',
    lastName: 'Sharma',
    parsedResume: {
      rawText: REAL_RESUME,
      skills: [],
      experience: [],
      projects: [],
      certifications: [],
      education: [],
      gpa: '',
      contact: {}
    },
    accomplishments: []
  };

  const refreshed = TIQ.refreshParsedCandidate(stale);
  assert(refreshed === true, 'stale parsed resume can be rehydrated from raw text');
  assert(stale.parsedResume.experience.length >= 1, 'rehydrated resume restores experience entries');
  assert(stale.parsedResume.projects.length >= 1, 'rehydrated resume restores projects');
  assert(stale.parsedResume.certifications.length >= 1, 'rehydrated resume restores certifications');
  assert(stale.accomplishments.length > 0, 'rehydrated resume restores grounded highlights');

  const junk = {
    parsedResume: {
      rawText: '',
      experience: [],
      projects: [{ name: 'Nirmay Sharma nirmays06@gmail.com', description: '' }],
      certifications: []
    },
    notes: ''
  };
  const accs = TIQ.generateAccomplishments(junk);
  assert(accs.length === 0 || accs.every(function(a) { return a.text.indexOf('@') === -1; }), 'contact-like project titles are ignored');

  /* ---- stored highlight sets from an older build ---- */
  const oldSet = ['Microsoft Office Specialist (Excel, PowerPoint, Word)', 'Handled 14 students']
    .map(function(t) { return { text: t, source: 'resume' }; });
  const staleC = {
    parsedResume: { rawText: REAL_RESUME, experience: [], projects: [], certifications: [] },
    accomplishments: oldSet
  };
  assert(TIQ.highlightsAreStale(staleC) === true, 'a highlight the resume never says is stale');

  const freshC = {
    parsedResume: { rawText: REAL_RESUME, experience: [], projects: [], certifications: [] },
    accomplishments: [{ text: 'Winner - Congressional App Challenge', source: 'resume' }]
  };
  assert(TIQ.highlightsAreStale(freshC) === false, 'a verbatim quote from the resume is not stale');

  const convC = {
    parsedResume: { rawText: REAL_RESUME },
    accomplishments: [{ text: 'something the recruiter heard', source: 'conversation' }]
  };
  assert(TIQ.highlightsAreStale(convC) === false, 'conversation highlights are exempt from the check');

  const rebuilt = TIQ.normalizeCandidate({
    parsedResume: TIQ.ai.extractResumeData(REAL_RESUME),
    accomplishments: oldSet.map(function(a) { return { text: a.text, source: a.source }; })
  });
  assert(rebuilt.accomplishments.length > 0, 'a stale highlight set is rebuilt, not left empty');
  assert(rebuilt.accomplishments.every(function(a) { return a.text.indexOf('Handled ') !== 0; }),
    'normalize drops the invented fragment when it rebuilds');
}

main();
