const { loadApp, assert } = require('./harness');

function baseCandidate(over) {
  return Object.assign({
    id: 'TQ-TEST',
    firstName: 'Mia',
    lastName: 'Williams',
    university: 'University of Arkansas',
    major: 'Computer Science',
    graduationDate: '2026-05',
    gpa: '3.8',
    skills: ['Python', 'SQL', 'React'],
    keySkills: [],
    accomplishments: [],
    notes: '',
    areasDiscussed: [],
    workLocations: ['Dallas, TX'],
    workAuthorization: 'US Citizen',
    audioNotes: [],
    attributes: [],
    summary: 'Existing summary.',
    traceability: []
  }, over || {});
}

function scannedCandidate(over) {
  const c = baseCandidate(over);
  c.resumeUpload = { name: 'mia_williams_resume.pdf', type: 'application/pdf', parsedAt: '2026-09-25T14:14:00Z' };
  c.parsedResume = {
    skills: ['Python', 'SQL', 'React', 'Docker', 'Tableau'],
    experience: [
      { title: 'Software Engineering Intern', company: 'Walmart Technology', dates: 'May 2025 - Aug 2025', description: 'Built ETL pipeline' },
      { title: 'Teaching Assistant', company: 'University of Arkansas', dates: 'Jan 2025 - May 2025', description: 'Led lab sections' },
      { title: 'Research Assistant', company: 'University of Arkansas', dates: 'Sep 2024 - Dec 2024', description: 'Optimization models' }
    ],
    projects: [{ name: 'Route Optimizer', description: 'Capstone' }, { name: 'Scheduler', description: 'Class project' }, { name: 'Portfolio', description: 'Site' }],
    education: [{ school: 'University of Arkansas', degree: 'B.S.', major: 'Computer Science', year: 'Expected 2026' }],
    certifications: ['AWS Cloud Practitioner', 'Google Data Analytics', 'Scrum Master'],
    contact: {},
    gpa: '3.8',
    rawText: 'Mia Williams\nUniversity of Arkansas\nB.S. Computer Science'
  };
  return c;
}

function main() {
  const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js']);

  /* ---- TIQ.resumeInfo state normalizer ---- */
  assert(TIQ.resumeInfo({ resumeUpload: 'old_resume.pdf' }).state === 'legacy', 'string resumeUpload reports legacy state');
  assert(TIQ.resumeInfo({ resumeUpload: null }).state === 'missing', 'null resumeUpload reports missing state');
  assert(TIQ.resumeInfo({ resumeUpload: '' }).state === 'missing', 'empty resumeUpload reports missing state');
  assert(TIQ.resumeInfo({}).state === 'missing', 'absent resumeUpload reports missing state');
  assert(TIQ.resumeInfo({ resumeUpload: { name: 'a.pdf', parsedAt: '2026-09-25T10:00:00Z' } }).state === 'scanned', 'object with parsedAt reports scanned');
  assert(TIQ.resumeInfo({ resumeUpload: { name: 'a.pdf', parsedAt: '' } }).state === 'pending', 'object without parsedAt reports pending');
  assert(TIQ.resumeInfo({ resumeUpload: { name: 'a.pdf', parsedAt: '', parseError: 'bad pdf' } }).state === 'failed', 'object with parseError reports failed');
  assert(TIQ.resumeInfo({ resumeUpload: { parsedAt: 'x' } }).name === 'resume.pdf', 'missing filename falls back to resume.pdf');

  /* ---- provenance stamping + fieldSource ---- */
  const formCand = baseCandidate();
  assert(TIQ.fieldSource(formCand, 'university') === 'form', 'fieldSource defaults to form');
  const merged = baseCandidate({ university: '', major: '', gpa: '', skills: [], graduationDate: '' });
  TIQ.ai.applyParsedData(merged, {
    contact: { firstName: '', lastName: '', email: 'mia@uark.edu', phone: '555-0100' },
    education: [{ school: 'University of Arkansas', degree: 'B.S.', major: 'Computer Science', year: '2026' }],
    skills: ['Python'],
    gpa: '3.9'
  });
  assert(merged.university === 'University of Arkansas', 'applyParsedData backfills university');
  assert(merged.provenance && merged.provenance.university === 'resume', 'backfilled university is stamped as resume-sourced');
  assert(TIQ.fieldSource(merged, 'university') === 'resume', 'fieldSource reads the provenance stamp');
  assert(TIQ.fieldSource(merged, 'notes') === 'form', 'unstamped field still reports form');

  /* ---- citation attribution follows provenance ---- */
  const resumeCand = baseCandidate({ university: '', major: '', graduationDate: '' });
  TIQ.ai.applyParsedData(resumeCand, {
    contact: {},
    education: [{ school: 'University of Arkansas', degree: 'B.S.', major: 'Computer Science', year: '2026' }],
    skills: ['Python'],
    gpa: '3.8'
  });
  const resumeSummary = TIQ.ai.generateSummary(resumeCand);
  const eduCitation = resumeSummary.traceability.filter(t => t.indexOf('Education:') === 0 || t.indexOf('School:') === 0);
  assert(eduCitation.length > 0, 'summary emits an education citation');
  assert(eduCitation.every(t => /— resume$/.test(t)), 'resume-derived education cites the resume, not the intake form');

  const formSummary = TIQ.ai.generateSummary(baseCandidate());
  const formCitation = formSummary.traceability.filter(t => t.indexOf('Education:') === 0 || t.indexOf('School:') === 0);
  assert(formCitation.length > 0 && formCitation.every(t => /— intake form$/.test(t)), 'form-entered education still cites the intake form');

  /* ---- resume bar states on the card ---- */
  const scanned = scannedCandidate();
  const scannedBar = TIQ.views._resumeBarHtml(scanned);
  assert(scannedBar.indexOf('resume-bar--scanned') >= 0, 'scanned candidate renders the scanned bar');
  assert(scannedBar.indexOf('SCANNED') >= 0, 'scanned bar labels the state');
  assert(scannedBar.indexOf('mia_williams_resume.pdf') >= 0, 'scanned bar shows the filename');
  assert(scannedBar.indexOf('5 skills') >= 0 && scannedBar.indexOf('3 roles') >= 0, 'scanned bar shows a real tally, not counts alone');
  assert(scannedBar.indexOf('data-open-resume') === -1 || scannedBar.indexOf('resume-bar__action') === -1, 'no scan CTA once the resume is scanned');

  const legacyBar = TIQ.views._resumeBarHtml(baseCandidate({ resumeUpload: 'legacy_resume.pdf' }));
  assert(legacyBar.indexOf('ON FILE') >= 0 && legacyBar.indexOf('legacy_resume.pdf') >= 0, 'string resumeUpload renders an ON FILE bar with the name');
  assert(legacyBar.indexOf('resume-bar__action') >= 0, 'legacy (never scanned) candidate still offers the scan CTA');

  const missingBar = TIQ.views._resumeBarHtml(baseCandidate({ resumeUpload: null }));
  assert(missingBar.indexOf('NO RESUME ATTACHED') >= 0, 'candidate without a resume renders the missing bar');
  assert(missingBar.indexOf('Form entries only') >= 0, 'missing bar explains that nothing was verified');

  const failedBar = TIQ.views._resumeBarHtml(baseCandidate({ resumeUpload: { name: 'x.pdf', parsedAt: '', parseError: 'Encrypted PDF' } }));
  assert(failedBar.indexOf('SCAN FAILED') >= 0 && failedBar.indexOf('Encrypted PDF') >= 0, 'failed bar surfaces the parse error');

  /* ---- structured resume band ---- */
  const band = TIQ.views._resumeBandHtml(scanned);
  assert(band.indexOf('FROM THE RESUME') >= 0, 'band carries the FROM THE RESUME label');
  assert(band.indexOf('prov-dot--resume') >= 0, 'band carries a resume provenance dot');
  assert(band.indexOf('B.S. in Computer Science') >= 0, 'band renders the actual degree, not a count');
  assert(band.indexOf('University of Arkansas') >= 0, 'band renders the actual school');
  assert(band.indexOf('Software Engineering Intern') >= 0, 'band renders the actual role title');
  assert(band.indexOf('Walmart Technology') >= 0, 'band renders the actual company');
  assert(band.indexOf('AWS Cloud Practitioner') >= 0, 'band renders actual certification names');
  assert(band.indexOf('Route Optimizer') >= 0, 'band renders actual project names');
  assert(band.indexOf('Research Assistant') === -1, 'experience is capped at two entries');
  assert(band.indexOf('+1 earlier role') >= 0, 'overflow roles are offered behind an expander');

  TIQ.views._resumeExpanded[scanned.id] = true;
  const bandOpen = TIQ.views._resumeBandHtml(scanned);
  assert(bandOpen.indexOf('Research Assistant') >= 0, 'expanded band reveals every role');
  assert(bandOpen.indexOf('Show fewer') >= 0, 'expanded band offers a collapse control');
  delete TIQ.views._resumeExpanded[scanned.id];

  const emptyBand = TIQ.views._resumeBandHtml(baseCandidate({ resumeUpload: null, parsedResume: null }));
  assert(emptyBand.indexOf('resume-band--empty') >= 0, 'candidate with no parse renders the empty band');
  assert(emptyBand.indexOf('Nothing extracted yet') >= 0, 'empty band explains what scanning would add');

  /* ---- skills block provenance ---- */
  const skillsBlock = TIQ.views._skillsBlockHtml(scanned);
  assert(skillsBlock.indexOf('SKILLS') >= 0, 'skills block renders');
  assert(skillsBlock.indexOf('prov-dot--') >= 0, 'skills block carries its own provenance dot');
  assert(TIQ.views._skillsBlockHtml(baseCandidate({ skills: [], parsedResume: null })) === '', 'no skills means no skills block');

  /* ---- full card assembly ---- */
  const cardHtml = TIQ.views._buildCardHtml(scanned, true);
  const order = [
    'resume-bar',
    'card-header',
    'skills-block',
    'conversation-band'
  ];
  let lastIdx = -1;
  let ordered = true;
  order.forEach(cls => {
    const i = cardHtml.indexOf(cls);
    if (i < 0 || i < lastIdx) ordered = false;
    lastIdx = Math.max(lastIdx, i);
  });
  assert(ordered, 'card is ordered: resume bar, header, skills, conversation');
  assert(cardHtml.indexOf('resume-band') === -1, 'the resume band no longer lives inside the card');
  assert(cardHtml.indexOf('meta-strip') === -1 && cardHtml.indexOf('POSITIONS') === -1, 'old count-only meta strip is gone');
  assert(cardHtml.indexOf('header-resume-btn') >= 0, 'header offers a jump into the resume drawer');
  assert(cardHtml.indexOf('Grounded AI Highlights') >= 0, 'conversation band keeps the grounded highlights');
  assert(cardHtml.indexOf('FROM THE CONVERSATION') >= 0, 'conversation band is labelled by source');

  /* ---- the band renders in the capture right column, above the drawer ---- */
  const captureHtml = TIQ.views.renderRecruiterCapture();
  const colRightIdx = captureHtml.indexOf('capture-col-right');
  const bandIdx = captureHtml.indexOf('resume-band');
  const drawerIdx = captureHtml.indexOf('capture-panel--drawer');
  assert(colRightIdx >= 0 && bandIdx > colRightIdx, 'resume band renders inside the capture right column');
  assert(bandIdx < drawerIdx, 'resume band sits above the drawer panel');
  assert(captureHtml.indexOf('capture-stack') < colRightIdx, 'card stack stays in the left column');

  /* ---- detail panel Resume section ---- */
  const detail = TIQ.views._renderResumeSection(scanned);
  assert(detail.indexOf('ai-section--resume') >= 0, 'detail panel renders the Resume section');
  assert(detail.indexOf('SCANNED') >= 0 && detail.indexOf('mia_williams_resume.pdf') >= 0, 'detail panel shows scan state and filename');
  assert(detail.indexOf('B.S. Computer Science') >= 0, 'detail panel renders structured education');
  assert(detail.indexOf('Software Engineering Intern') >= 0, 'detail panel renders structured experience');
  assert(detail.indexOf('data-action="rescan"') >= 0, 'detail panel offers a rescan action');
  assert(detail.indexOf('provenance-legend') >= 0, 'detail panel explains the provenance dots');

  const detailMissing = TIQ.views._renderResumeSection(baseCandidate({ resumeUpload: null }));
  assert(detailMissing.indexOf('NO RESUME ATTACHED') >= 0, 'detail panel flags a missing resume');
  assert(detailMissing.indexOf('Scan resume') >= 0, 'detail panel offers a first scan');

  /* ---- drawer Structured / Raw toggle ---- */
  const drawerStructured = TIQ.views._renderDrawerResume(scanned);
  assert(drawerStructured.indexOf('data-resume-view="structured"') >= 0, 'drawer exposes the structured toggle');
  assert(drawerStructured.indexOf('data-resume-view="raw"') >= 0, 'drawer exposes the raw toggle');
  assert(drawerStructured.indexOf('mark-extracted') >= 0, 'structured drawer highlights extracted values');
  assert(drawerStructured.indexOf('drawer-resume-section') >= 0, 'structured drawer groups fields into sections');
  assert(drawerStructured.indexOf('<pre class="drawer-raw">') === -1, 'structured view does not dump raw text');

  TIQ.views._drawerResumeView = 'raw';
  const drawerRaw = TIQ.views._renderDrawerResume(scanned);
  assert(drawerRaw.indexOf('<pre class="drawer-raw">') >= 0, 'raw view dumps the parsed text');
  assert(drawerRaw.indexOf('Mia Williams') >= 0, 'raw view contains the resume text');
  TIQ.views._drawerResumeView = 'structured';

  const drawerUnparsed = TIQ.views._renderDrawerResume(baseCandidate({ resumeUpload: null, parsedResume: null }));
  assert(drawerUnparsed.indexOf('drawerResumeScan') >= 0, 'unparsed candidate keeps the scan input');
  assert(drawerUnparsed.indexOf('data-resume-view') === -1, 'no toggle when there is nothing to toggle');

  /* ---- stale (pre line-break-fix) stored parse ---- */
  const collapsedRaw = ('Nirmay Sharma nirmays06@gmail.com 479 418 6301 https://www.linkedin.com/in/nirmay-sharma/'
    + ' EDUCATION Bentonville High School Bentonville, AR GPA: 4.0+ EXPERIENCE Teaching Assistant Small Business Operations'
    + ' Aug 2025 - Present SKILLS, CERTIFICATIONS OR AWARDS Certi fi cations/Training: Microsoft O ffi ce Specialist'
    + ' Technical: Pro fi cient in Java, Python, HTML, CSS, JavaScript. Language: English (Pro fi cient)').padEnd(400, ' ');
  const stale = scannedCandidate({ id: 'TQ-STALE' });
  stale.parsedResume = Object.assign({}, stale.parsedResume, {
    rawText: collapsedRaw,
    projects: [{ name: 'Nirmay Sharma nirmays06@gmail.com', description: 'garbage' }]
  });

  assert(TIQ.ai.isStaleParse(stale.parsedResume) === true, 'isStaleParse: a one-line stored parse is detected');
  assert(TIQ.ai.isStaleParse(scanned.parsedResume) === false, 'isStaleParse: a parse with line breaks is not stale');
  assert(TIQ.ai.isStaleParse(null) === false && TIQ.ai.isStaleParse(undefined) === false, 'isStaleParse: missing parse is not stale');

  const staleDrawer = TIQ.views._renderDrawerResume(stale);
  assert(staleDrawer.indexOf('drawerResumeScan') >= 0, 'a stale scan still offers the rescan input');
  assert(staleDrawer.indexOf('drawer-rescan__warn') >= 0, 'a stale scan is labelled as needing a re-scan');
  assert(staleDrawer.indexOf('line-break fix') >= 0, 'the stale scan explains why nothing was extracted');
  assert(staleDrawer.indexOf('data-resume-view') >= 0, 'the structured toggle still renders for a stale parse');

  const freshDrawer = TIQ.views._renderDrawerResume(scanned);
  assert(freshDrawer.indexOf('drawerResumeScan') === -1, 'a healthy scan does not clutter the drawer with a rescan input');

  const staleBand = TIQ.views._resumeBandHtml(stale);
  assert(staleBand.indexOf('resume-band__stale') >= 0, 'the band warns that its values come from a broken scan');
  assert(TIQ.views._resumeBandHtml(scanned).indexOf('resume-band__stale') === -1, 'a healthy band carries no stale warning');

  console.log('resume-card tests complete');
}

main();
