const { loadApp, assert } = require('./harness');
const fs = require('node:fs');

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

const wordCount = text => String(text || '').trim().split(/\s+/).length;

function main() {
  const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js']);
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
  const ta = real.experience.filter(function (e) { return e.title.indexOf('Teaching Assistant') === 0; })[0];
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

  const wrappedProjectText = [
    'PROJECTS',
    'Freight Performance Dashboard | Supply Chain Analytics Capstone',
    '• Analyzed 12,000 simulated shipment records using SQL and Power BI to compare on-time delivery, cost per',
    'mile, and carrier performance.',
    '• Identified five lanes with recurring delays and proposed scheduling changes projected to lower late deliveries by 15%.',
    'SKILLS',
    'SQL, Power BI'
  ].join('\n');
  const wrappedProject = TIQ.ai.extractResumeData(wrappedProjectText);
  assert(wrappedProject.projects.length === 1, 'a lowercase PDF line-wrap does not create a phantom project');
  assert(wrappedProject.projects[0].description.includes('cost per mile, and carrier performance.'),
    'a wrapped project sentence is rejoined without losing its continuation');
  const projectWorkResume = TIQ.ai.extractResumeData([
    'PROFESSIONAL EXPERIENCE',
    'Operations Analyst — Delta Distribution Group — Memphis, TN',
    '2023–2025',
    '• Reduced order backlog by 20% across regional accounts.',
    'PROJECT WORK',
    'Freight Performance Dashboard | Supply Chain Analytics Capstone',
    '• Analyzed 12,000 simulated shipment records using SQL and Power BI.',
    'Identified five lanes with recurring delays and proposed scheduling changes projected to lower late deliveries by 15%.'
  ].join('\n'));
  assert(projectWorkResume.experience.length === 1 && projectWorkResume.experience[0].title === 'Operations Analyst',
    'PROJECT WORK ends the preceding professional experience section');
  assert(projectWorkResume.experience[0].company === 'Delta Distribution Group' && projectWorkResume.experience[0].location === 'Memphis, TN',
    'a three-part em-dash role header separates employer and location');
  assert(projectWorkResume.projects.length === 1 && projectWorkResume.projects[0].name === 'Freight Performance Dashboard',
    'PROJECT WORK is parsed as a project section, not a phantom role');
  assert(/Identified five lanes/.test(projectWorkResume.projects[0].description),
    'unbulleted source actions after the project title stay attached to that project');
  const wrappedCandidate = TIQ.intake.buildCandidate({firstName:'Alex', lastName:'Morgan'});
  wrappedCandidate.parsedResume = Object.assign({}, wrappedProject, {projects:[
    {name:'Freight Performance Dashboard',description:'Supply Chain Analytics Capstone • Analyzed 12,000 simulated shipment records using SQL and Power BI to compare on-time delivery, cost per'},
    {name:'mile, and carrier performance.',description:'• Identified five lanes with recurring delays and proposed scheduling changes projected to lower late deliveries by 15%.'}
  ]});
  const projectHighlights = TIQ.views._captureVisualEntries(wrappedCandidate).filter(function(entry) { return entry.category === 'Project'; });
  assert(projectHighlights.length === 1, 'the card shows one project instead of a duplicate continuation entry');
  assert(projectHighlights[0].facts.some(fact => /12,000 simulated shipment records/.test(fact) && /Analyzed/.test(fact)),
    'the concise wrapped highlight retains the source simulation qualifier');
  assert(wrappedCandidate.parsedResume.rawText.includes('cost per\nmile, and carrier performance.'),
    'complete wrapped source detail remains available in the parsed résumé evidence');

  const alexResume = [
    'ALEX MORGAN', 'EDUCATION', 'University of Arkansas', 'Bachelor of Science in Business Administration, Supply Chain Management', 'EXPERIENCE',
    'Transportation Operations Intern | Ozark Freight Solutions | Springdale, AR',
    'May 2025 - August 2025',
    '• Tracked 50-70 daily shipments and updated delivery status in the transportation management system, escalating delays to dispatch and customer service.',
    '• Built an Excel exception tracker that reduced weekly reporting preparation from 3 hours to 45 minutes.',
    '• Reviewed 300 shipment records, identified recurring appointment errors, and helped reduce missing appointment details by 24%.',
    '• Coordinated with drivers, warehouse staff, and customers to resolve scheduling changes and maintain accurate shipment documentation.',
    'Customer Service Associate | Summit Outdoor Supply | Fayetteville, AR',
    '• Assisted 40+ customers per shift with purchases, returns, and order questions.',
    'PROJECTS',
    'Freight Performance Dashboard | Supply Chain Analytics Capstone',
    '• Analyzed 12,000 simulated shipment records using SQL and Power BI to compare on-time delivery, cost per mile, and carrier performance.',
    '• Identified five lanes with recurring delays and proposed scheduling changes projected to lower late deliveries by 15%.',
    'Warehouse Inventory Improvement | Operations Management Project',
    '• Designed an ABC inventory analysis for a simulated warehouse with 800 SKUs, prioritizing cycle counts and reducing modeled stock discrepancies by 18%.',
    'SKILLS AND LEADERSHIP',
    'Technical: Excel, Power BI, SQL.',
    'Leadership: Supply Chain Management Association event committee; coordinated three employer networking events serving 100+ students.'
  ].join('\n');
  const alexParsed = TIQ.ai.extractResumeData(alexResume);
  assert(JSON.stringify(TIQ.views._selectCaptureFacts('Assisted 40+ customers per shift with purchases, returns, and order questions.', 2)) ===
    JSON.stringify(['Assisted 40+ customers per shift with purchases, returns, and order questions.']), 'Customer Service contribution retains its complete scope');
  assert(wordCount('Assisted 40+ customers per shift.') <= 10, 'Customer Service claim uses the exact plain-text word count');
  assert(alexParsed.education[0].major === 'Supply Chain Management', 'the parser prefers the specific concentration after the general degree label');
  assert(alexParsed.experience[0].title === 'Transportation Operations Intern', 'experience title keeps its leading words when employer metadata follows');
  assert(alexParsed.experience[0].company === 'Ozark Freight Solutions', 'experience employer is separated from location metadata');
  assert(alexParsed.experience[0].location === 'Springdale, AR', 'experience location is extracted from the source header');
  const alex = TIQ.intake.buildCandidate({firstName:'Alex', lastName:'Morgan'});
  alex.university = 'University of Arkansas'; alex.major = 'Business Administration';
  alex.resumeUpload = {name:'alex.pdf', parsedAt:'2026-10-04'};
  alex.parsedResume = alexParsed;
  const alexEntries = TIQ.views._captureVisualEntries(alex);
  const alexProjects = alexEntries.filter(function(entry) { return entry.category === 'Project'; });
  const alexExperienceEntries = alexEntries.filter(function(entry) { return entry.category === 'Experience'; });
  assert(alexExperienceEntries.length === 2, 'displayed experience count includes every supported parsed role');
  assert(alexExperienceEntries.some(entry => entry.name === 'Customer Service Associate' && entry.facts.includes('Assisted 40+ customers per shift with purchases, returns, and order questions.')),
    'Customer Service Associate remains visible with a concise source-backed contribution');
  alexEntries.forEach(entry => entry.facts.forEach(fact => assert(fact.trim() && !/…$/.test(fact),
    'Capture retains a complete contribution: ' + fact)));
  assert(alexProjects.length === 2, 'the card keeps one entry for each distinct project');
  alexProjects.forEach(function(entry) {
    assert(new Set(entry.facts.map(function(fact) { return fact.toLowerCase().replace(/[.!?;]+$/, ''); })).size === entry.facts.length,
      'project facts are deduplicated within ' + entry.name);
  });
  const freight = alexProjects.filter(function(entry) { return /Freight Performance Dashboard/.test(entry.name); })[0];
  assert(freight && freight.facts.length === 2 && freight.facts.some(fact => /12,000 simulated shipment records/.test(fact)), 'Freight dashboard retains its distinct simulation and scheduling facts');
  assert(freight.facts.some(fact => /proposed scheduling changes projected to lower late deliveries by 15%/i.test(fact)), 'projected results remain clearly proposed rather than achieved');
  const leadership = alexEntries.filter(function(entry) { return entry.category === 'Leadership'; })[0];
  assert(leadership && leadership.facts.some(function(fact) { return /three employer networking events serving 100\+ students/i.test(fact); }),
    'the leadership highlight preserves its quantified event and student impact');
  assert(leadership.facts.length === 1 && leadership.facts[0] === 'Coordinated three employer networking events serving 100+ students.',
    'leadership shows the quantified event achievement, not the internship coordination bullet');
  assert(!leadership.facts.some(function(fact) { return /drivers, warehouse staff, and customers/i.test(fact); }),
    'internship coordination is not misattributed as leadership');
  assert(alexEntries.filter(function(entry) { return entry.category === 'Leadership'; }).length === 1,
    'source leadership details join into one leadership card item rather than duplicating the category');
  const alexExperience = alexEntries.filter(function(entry) { return entry.category === 'Experience'; })[0];
  assert(alexExperience.facts.length === 4, 'experience highlights retain all four complete source-backed bullets');
  assert(alexExperience.facts.some(function(fact) { return /reduced weekly reporting preparation from 3 hours to 45 minutes\./i.test(fact); }),
    'the selected experience facts retain the complete reporting-time result in a concise complete claim');
  assert(alexExperience.facts.some(function(fact) { return /helped reduce missing appointment details by 24%\./i.test(fact); }),
    'the other selected experience fact prioritizes a distinct supported improvement');
  assert(alexExperience.facts.some(function(fact) { return /Tracked 50-70 daily shipments/.test(fact); }),
    'routine shipment volume remains available after stronger outcome evidence');
  assert(alexExperience.name === 'Transportation Operations Intern' && alexExperience.organization === 'Ozark Freight Solutions' && alexExperience.location === 'Springdale, AR' && alexExperience.dates === 'May 2025 - August 2025',
    'experience metadata is readable and keeps employer, location, and dates separate');
  const alexHtml = TIQ.views._resumeHighlightsHtml(alex);
  assert(alexHtml.includes('Transportation Operations Intern') && alexHtml.includes('Ozark Freight Solutions') && alexHtml.includes('Springdale, AR') && alexHtml.includes('May 2025 - August 2025'),
    'candidate card renders the full role header, employer, location, and dates');
  assert(alexHtml.includes('Experience · 2'), 'the experience group count matches the roles shown');
  assert(alexProjects[0].facts.length === 2 && alexProjects[0].facts.some(f => /12,000 simulated shipment records/.test(f)) && /projected to lower late deliveries by 15%/.test(alexProjects[0].facts[0]),
    'the freight project keeps concise distinct facts and qualifiers');
  assert(alexProjects[1].facts.length === 1 && /simulated warehouse/.test(alexProjects[1].facts[0]) && /modeled stock discrepancies by 18%/i.test(alexProjects[1].facts[0]),
    'the inventory project retains its source-backed outcome and modeled qualifier');
  assert((TIQ.views._resumeHighlightsHtml(alex).match(/resume-highlights__category[^>]*>Projects · 2</g) || []).length === 1,
    'the card uses one Projects group heading rather than repeating it per project');
  const alexCard = TIQ.views._buildCardHtml(alex, true);
  assert(alexCard.includes('Projects · 2'), 'the shared Projects heading shows the project count once');
  assert(alexCard.includes('University of Arkansas &middot; Business Administration'),
    'a recruiter-entered major remains authoritative over a different parsed major');
  assert(alexHtml.includes('Ozark Freight Solutions · Springdale, AR') && /May 2025 - August 2025/.test(alexHtml),
    'internship subtitle shows employer and location, with dates separately');
  assert(alexCard.replace(/<[^>]+>/g, '').includes('three employer networking events serving 100+') && /overflow-y:\s*auto/.test(fs.readFileSync('styles.css','utf8')),
    'all leadership evidence remains reachable in the scrollable highlights area');

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

  const providerCert = TIQ.ai.extractResumeData('CERTIFICATIONS\nAWS Certified Cloud Practitioner\nSKILLS\nPython');
  assert(Array.from(providerCert.certifications).join('|') === 'AWS Certified Cloud Practitioner', 'provider-prefixed credentials are not duplicated by the generic Certified pattern');

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
