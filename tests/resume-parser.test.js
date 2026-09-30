const { loadApp, assert } = require('./harness');

const RESUME = `
Sofia Rodriguez
123 College Ave, Nashville, TN 37206
sofia.rodriguez@university.edu | (555) 123-4567

EDUCATION
University of Tennessee — BS Data Science
Expected graduation: May 2027
GPA: 3.78

SKILLS
Python, SQL, TensorFlow, Tableau, Pandas, R, Git

EXPERIENCE
Data Analyst Intern — Nashville Public Library, May 2025 – Aug 2025
Built Tableau dashboards tracking 4,000+ monthly visits.

PROJECTS
Supply Chain Dashboard — Led a team of 3 student analysts.
`;

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
  const TIQ = loadApp();
  const parsed = TIQ.ai.extractResumeData(RESUME);
  const c = parsed.contact;

  assert(c.email === 'sofia.rodriguez@university.edu', 'extracts email');
  assert(c.phone === '(555) 123-4567', 'extracts phone');
  assert(c.name === 'Sofia Rodriguez', 'extracts full name');
  assert(c.firstName === 'Sofia' && c.lastName === 'Rodriguez', 'splits name');
  assert(c.graduationDate === 'May 2027', 'extracts expected graduation');
  assert(parsed.education[0] && parsed.education[0].school === 'University of Tennessee', 'extracts school');
  assert(parsed.gpa === '3.78', 'extracts gpa');
  assert(parsed.skills.includes('Python') && parsed.skills.includes('SQL'), 'extracts skills');
  assert(parsed.experience[0] && parsed.experience[0].title === 'Data Analyst Intern', 'extracts experience');

  const none = TIQ.ai._extractContact('No contact info in this document at all.');
  assert(none.email === '' && none.phone === '' && none.name === '' && none.graduationDate === '', 'empty strings when nothing found');

  const real = TIQ.ai.extractResumeData(REAL_RESUME);
  assert(real.contact.firstName === 'Nirmay' && real.contact.lastName === 'Sharma', 'real resume extracts name');
  assert(real.experience.length >= 1, 'real resume extracts experience entries');
  assert(!real.experience.some(function (e) { return e.dates && e.title === e.dates; }), 'a bare date line never becomes an entry title');
  const ta = real.experience.filter(function (e) { return e.title === 'Teaching Assistant'; })[0];
  assert(ta && ta.duration && ta.duration.isCurrent === true, 'a date line on its own row attaches to the entry above it');
  assert(real.projects.length >= 1, 'real resume extracts projects');
  assert(real.certifications.length >= 2, 'real resume extracts certifications');

  const accs = TIQ.generateAccomplishments({ parsedResume: real, notes: '' });
  assert(accs.length > 0, 'real resume generates grounded highlights');
  /* Every highlight must be text the candidate actually wrote — no invented
     metric fragments — and the three must cover three different facets of the
     candidate rather than three variants of the same claim. */
  const flat = REAL_RESUME.replace(/\s+/g, ' ');
  assert(accs.every(function(a) { return flat.indexOf(a.text.replace(/\s+/g, ' ')) >= 0; }),
    'every highlight is traceable to text in the resume');
  assert(accs.every(function(a) { return !/^Handled\b/.test(a.text); }),
    'highlights are the candidate own words, not a manufactured metric fragment');
  assert(accs.some(function(a) { return /winner|recognized|place/i.test(a.text); }),
    'the highlights include a recognition');
  assert(accs.some(function(a) { return /developed|built|designed/i.test(a.text); }),
    'the highlights include something the candidate built');
  assert(accs.some(function(a) { return /\bvp of\b|\bled\b|\bmanaged\b/i.test(a.text); }),
    'the highlights include a leadership claim');
  assert(new Set(accs.map(function(a) { return a.text; })).size === accs.length,
    'the three highlights are distinct claims');

  /* ---- work authorization ---- */
  assert(TIQ.ai._extractWorkAuthorization('U.S. Citizen. Eligible to work in the US.') === 'US Citizen', 'work auth: U.S. Citizen');
  assert(TIQ.ai._extractWorkAuthorization('Citizenship: United States Citizen') === 'US Citizen', 'work auth: United States Citizen');
  assert(TIQ.ai._extractWorkAuthorization('Lawful Permanent Resident.') === 'Permanent Resident', 'work auth: LPR');
  assert(TIQ.ai._extractWorkAuthorization('F-1 CPT, STEM OPT eligible') === 'F1 CPT', 'work auth: F1 CPT');
  assert(TIQ.ai._extractWorkAuthorization('Requires visa sponsorship') === '', 'work auth: sponsorship need is never a positive match');
  assert(TIQ.ai._extractWorkAuthorization('Not authorized to work in the US') === '', 'work auth: negative statement is never a positive match');
  assert(TIQ.ai._extractWorkAuthorization('No longer authorized to work') === '', 'work auth: withdrawn authorization is never a positive match');
  assert(TIQ.ai._extractWorkAuthorization('Python, SQL, Tableau. Built dashboards.') === '', 'work auth: absent text yields empty, never a guess');

  /* ---- links ---- */
  const lk = TIQ.ai._extractLinks('Email me at nirmays06@gmail.com or see https://www.linkedin.com/in/nirmay-sharma/ and github.com/nirmays06');
  assert(lk.linkedin === 'https://www.linkedin.com/in/nirmay-sharma', 'links: trailing slash stripped off the linkedin url');
  assert(lk.github === 'github.com/nirmays06', 'links: bare github host captured');
  assert(lk.portfolio === '', 'links: an email address is never mistaken for a portfolio url');

  /* ---- resume address ---- */
  assert(TIQ.ai._extractAddress('Sofia Rodriguez\n123 College Ave\nNashville, TN 37206\nsofia@university.edu') === 'Nashville, TN 37206', 'address: City, ST ZIP from the header block');
  assert(TIQ.ai._extractAddress('Nirmay Sharma\nnirmays06@gmail.com\n479-418-6301\nBentonville High School\nGPA: 4.0+') === '', 'address: a city buried in the body is not the mailing address');

  /* ---- duration normalization ---- */
  const dr = TIQ.ai._normalizeDateRange;
  assert(dr('May 2025 – Aug 2025').months === 3, 'duration: May 2025 - Aug 2025 is 3 months');
  assert(dr('Aug 2025 - Present').isCurrent === true && dr('Aug 2025 - Present').months === null, 'duration: an ongoing role has no length');
  assert(dr('2023 – Present').start === '2023-01', 'duration: a year-only range still normalizes');
  assert(dr('01/2025 – 06/2025').months === 5, 'duration: MM/YYYY ranges normalize');
  assert(dr('Summer 2025').start === '' && dr('Summer 2025').months === null, 'duration: an unparseable range fabricates nothing');

  /* ---- degree normalization ---- */
  const nd = TIQ.ai._normalizeDegree;
  assert(nd('BS', 'Data Science').degreeProgram === 'Bachelor of Science', 'degree: BS becomes Bachelor of Science');
  assert(nd('M.S.', 'Computer Science').degreeProgram === 'Master of Science', 'degree: M.S. becomes Master of Science');
  assert(nd('MBA', '').degreeProgram === 'Master of Business Administration', 'degree: MBA expands');
  assert(nd('PhD', '').degreeLevel === 'Doctorate', 'degree: PhD is a Doctorate level');
  assert(nd('', '').degreeProgram === '', 'degree: no input yields no program');

  /* ---- secondary schools are not college education ---- */
  const hs = TIQ.ai.extractResumeData('EDUCATION\nBentonville High School\nGraduated 2023\n');
  assert(hs.education.length === 0, 'a high school never becomes a post-secondary entry');
  const phantom = TIQ.ai.extractResumeData(RESUME);
  assert(!phantom.education.some(function (e) { return /Expected graduation/i.test(e.school || ''); }), 'an "Expected graduation" line never becomes a school');

  /* ---- page text assembly: pdf.js hasEOL must survive ---- */
  const pt = TIQ.ai.pageTextFromContent;
  const eol = pt({ items: [ { str: 'EDUCATION' }, { str: 'University of Tennessee', hasEOL: true }, { str: 'GPA: 3.78', hasEOL: true } ] });
  assert(eol.split('\n').length === 3, 'page text: hasEOL turns pdf items back into real lines');
  assert(pt({ items: [ { str: 'one' }, { str: 'two' } ] }) === 'one two ', 'page text: items without hasEOL stay on one line');
  assert(pt(null) === '' && pt({}) === '' && pt({ items: [] }) === '', 'page text: missing content is tolerated');
  const collapsed = pt({ items: [ { str: 'SKILLS' }, { str: 'Python, SQL', hasEOL: true } ] });
  assert(TIQ.ai.extractResumeData(collapsed).skills.length > 0, 'page text: a multi-line page is still sectionable');

  /* ---- PDF ligature runs are rejoined ---- */
  assert(pt({ items: [ { str: 'Certi fi cations/Training: MS Office Specialist', hasEOL: true } ] }).indexOf('Certifications/Training') === 0, 'ligature: "Certi fi cations" rejoins so the cert prefix matches');
  assert(pt({ items: [ { str: 'Pro fi cient in Java', hasEOL: true } ] }).indexOf('Proficient in Java') === 0, 'ligature: "Pro fi cient" rejoins');
  assert(pt({ items: [ { str: 'Microsoft O ffi ce Specialist' } ] }).indexOf('Microsoft Office Specialist') === 0, 'ligature: "O ffi ce" rejoins');
  assert(pt({ items: [ { str: 'fluent and flexible' } ] }).trim() === 'fluent and flexible', 'ligature: real words with f are left alone');
  const ligLine = pt({ items: [
    { str: 'SKILLS, CERTIFICATIONS OR AWARDS ', hasEOL: true },
    { str: 'Certi fi cations/Training:   Microsoft O ffi ce Specialist (Excel, PowerPoint, Word)', hasEOL: true }
  ] });
  const ligCerts = TIQ.ai.extractResumeData(ligLine);
  assert(ligCerts.certifications.indexOf('Microsoft Office Specialist (Excel, PowerPoint, Word)') !== -1, 'ligature: a ligatured certification line still extracts');

  /* ---- a certification entry split across two lines is rejoined ---- */
  const splitCert = TIQ.ai.extractResumeData('Certifications/Training: Microsoft Office Specialist (Excel, PowerPoint, Word); IT Specialist in\nComputational Thinking.\nSKILLS \nPython \n');
  assert(splitCert.certifications.indexOf('IT Specialist in Computational Thinking.') !== -1, 'certs: an entry broken by a pdf EOL is continued onto the next line');
  assert(splitCert.certifications.indexOf('Microsoft Office Specialist (Excel, PowerPoint, Word)') !== -1, 'certs: the intact preceding entry is untouched');

  /* ---- address institution guard ---- */
  assert(TIQ.ai._extractAddress('Bentonville High School   Bentonville, AR') === 'Bentonville, AR', 'address: a school name in the header never becomes the city');
  assert(TIQ.ai._extractAddress('123 College Ave, Nashville, TN 37206') === 'Nashville, TN 37206', 'address: a street line resolves to the city only');
  assert(TIQ.ai._extractAddress('Nashville, TN 37206') === 'Nashville, TN 37206', 'address: a plain City, ST ZIP is kept');
  assert(TIQ.ai._extractAddress('Nothing here') === '', 'address: no address yields empty, never garbage');

  /* ---- the real PDF's line breaks, end to end ---- */
  const fixture = pt({ items: [
    { str: 'SKILLS ', hasEOL: true },
    { str: 'Certi fi cations/Training:   Microsoft O ffi ce Specialist (Excel, PowerPoint, Word); IT Specialist in', hasEOL: true },
    { str: 'Computational Thinking. ', hasEOL: true },
    { str: 'Technical:   Pro fi cient in Java, Python. ', hasEOL: true }
  ] });
  const fx = TIQ.ai.extractResumeData(fixture);
  assert(fx.certifications.length === 2, 'fixture: both certifications come back from the real line breaks');
  assert(fx.skills.indexOf('Java') !== -1, 'fixture: ligatured skills still reach the dictionary');

  /* ---- J.B. Hunt recruiting vocabulary ---- */
  const JB = [
    'Jordan Ellis',
    'jordan.ellis@uark.edu | 479-555-0101',
    'EXPERIENCE',
    'Freight Operations Intern - J.B. Hunt Transport, May 2025 - Aug 2025',
    'Coordinated intermodal and drayage load planning across 6 lanes.',
    'SKILLS',
    'Intermodal, Drayage, Load Planning, TMS, SAP, Tableau, Six Sigma, Demand Planning, OTIF, Route Optimization, Stakeholder Management, Snowflake'
  ].join('\n');
  const jb = TIQ.ai.extractResumeData(JB);
  ['Intermodal', 'Drayage', 'Load Planning', 'TMS', 'SAP', 'Tableau', 'Six Sigma', 'Demand Planning', 'OTIF', 'Route Optimization'].forEach(function (s) {
    assert(jb.skills.indexOf(s) !== -1, 'jbh vocabulary: extracts ' + s);
  });
  assert(jb.skills.length <= 20, 'jbh vocabulary: the 20-skill cap still holds');

  const jbGroups = TIQ.categorizeSkills(jb.skills);
  const itemsOf = function (key) {
    const hit = jbGroups.filter(function (g) { return g.key === key; })[0];
    return hit ? hit.items : [];
  };
  assert(itemsOf('freight').indexOf('Intermodal') !== -1, 'jbh vocabulary: freight terms bucket under Freight & Transportation');
  assert(itemsOf('business').indexOf('SAP') !== -1, 'jbh vocabulary: SAP buckets under Business, Finance & ERP');
  assert(itemsOf('data').indexOf('Tableau') !== -1, 'jbh vocabulary: Tableau buckets under Data & Analytics');
  assert(itemsOf('ops').indexOf('Six Sigma') !== -1, 'jbh vocabulary: Six Sigma buckets under Operations & Supply Chain');
  const credGroups = TIQ.categorizeSkills(['PMP', 'CDL', 'CSCP']);
  const credItems = credGroups.filter(function (g) { return g.key === 'credentials'; })[0];
  assert(credItems && credItems.items.length === 3, 'jbh vocabulary: PMP/CDL/CSCP bucket under Certifications & Licenses');

  /* New terms must not leak into ordinary prose. */
  const prose = TIQ.ai.extractResumeData('Worked on regression testing and sprint planning; bought a parcel of land near campus.');
  assert(prose.skills.indexOf('Regression Analysis') === -1, 'jbh vocabulary: "regression testing" is not Regression Analysis');
  assert(prose.skills.indexOf('Parcel') === -1, 'jbh vocabulary: "parcel of land" is not the freight mode');
  assert(prose.skills.indexOf('Intermodal') === -1, 'jbh vocabulary: no freight term is invented from unrelated prose');

  /* Generic nouns stay out of the dictionary so a sentence like "...for
     analytics." does not mint a skill. Analytics is still a bucket key, so a
     recruiter who types it still gets the Data & Analytics group. */
  const chatter = TIQ.ai.extractResumeData('I really enjoy working with SQL and Tableau for analytics.');
  assert(chatter.skills.indexOf('SQL') !== -1 && chatter.skills.indexOf('Tableau') !== -1, 'real tools in prose are still extracted');
  assert(chatter.skills.indexOf('Analytics') === -1, 'generic word "analytics" is not extracted as a skill');
  assert(TIQ.categorizeSkills(['Analytics'])[0].items.indexOf('Analytics') !== -1, 'Analytics still buckets for display');
}

main();
