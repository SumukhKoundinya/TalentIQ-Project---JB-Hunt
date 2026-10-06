const assert = require('node:assert/strict');
const { loadApp } = require('./harness');

const TIQ = loadApp(['components.js', 'skill-icons.js', 'views.js']);

function candidate(raw, extra = {}) {
  return Object.assign(TIQ.intake.buildCandidate({ firstName: 'Jordan', lastName: 'Lee' }), {
    resumeUpload: { name: 'candidate.pdf', parsedAt: '2026-10-04' },
    parsedResume: TIQ.ai.extractResumeData(raw),
    ...extra
  });
}

const variedResume = [
  'JORDAN LEE',
  'EDUCATION',
  'Western State University',
  'B.S. in Applied Mathematics',
  'WORK EXPERIENCE',
  'Supply Chain Operations and Program Manager | Acme Transit | Denver, CO | 2022 – Present',
  '• Built a route planning process for 18 distribution centers. Reduced missed delivery windows by 22% over two quarters.',
  '• Coordinated drivers and warehouse teams during daily operations.',
  'Community Programs Coordinator — River Works, Portland, OR',
  '• Organized 6 public workshops attended by 140 residents.',
  'PROJECTS',
  'Demand Forecast Study | Operations Research',
  '• Analyzed 4,800 simulated orders using Python and SQL. The modeled forecast reduced inventory variance by 17%.',
  'Warehouse Capacity Model',
  '• Modeled a warehouse with 320 storage locations and projected 11% more usable capacity.',
  'Delivery Metrics Dashboard',
  '• Built a dashboard using Power BI to compare service levels across 24 routes.',
  'LEADERSHIP & ACTIVITIES',
  'Volunteer Committee Chair | River Works | 2021 – 2023',
  '• Led 5 volunteers to deliver 12 neighborhood events.',
  'SKILLS',
  'Power BI, Python, SQL'
].join('\n');

function main() {
  const parsed = TIQ.ai.extractResumeData(variedResume);
  assert.equal(parsed.experience.length, 2, 'recognizes unfamiliar long titles and multiple roles');
  assert.deepEqual(
    [parsed.experience[0].title, parsed.experience[0].company, parsed.experience[0].location, parsed.experience[0].dates],
    ['Supply Chain Operations and Program Manager', 'Acme Transit', 'Denver, CO', '2022 – Present'],
    'extracts role, employer, location, and dates independently'
  );
  assert.deepEqual(
    [parsed.experience[1].title, parsed.experience[1].company, parsed.experience[1].location, parsed.experience[1].dates],
    ['Community Programs Coordinator', 'River Works', 'Portland, OR', ''],
    'parses a different separator and omits missing dates cleanly'
  );
  assert.equal(parsed.education[0].major, 'Applied Mathematics', 'degree formats retain the specific major');

  const concentrationResume = 'EDUCATION\nWestfield College\nBachelor of Science in Business Administration, Supply Chain Management';
  const concentrationCandidate = candidate(concentrationResume, {
    university: 'Westfield College', major: 'Business Administration', provenance: { major: 'resume' }
  });
  assert.equal(TIQ.ai.extractResumeData(concentrationResume).education[0].major, 'Supply Chain Management',
    'a concentration following a broad degree field is parsed as the specific major');
  assert(TIQ.views._buildCardHtml(concentrationCandidate, true).includes('Westfield College &middot; Supply Chain Management'),
    'resume-derived broad major yields to the parsed specific concentration');

  const mixedSections = [
    'EXPERIENCE',
    'Winner — Regional Innovation Challenge | 2025',
    'Project: Field Monitor | 2024',
    'Portland, OR',
    '• Developed a field monitor for 30 stores and reduced audit time by 18%.',
    '• Recognized for regional technical innovation.',
    'Program Coordinator | River Works | Portland, OR | 2023–Present',
    '• Organized 6 community workshops attended by 140 residents.',
    'LEADERSHIP & ACTIVITIES',
    'Committee Chair | River Works',
    '• Led 5 volunteers to deliver 12 neighborhood events.'
  ].join('\n');
  const mixedParsed = TIQ.ai.extractResumeData(mixedSections);
  assert.deepEqual(Array.from(mixedParsed.experience, role => role.title), ['Program Coordinator'],
    'project titles, award lines, locations, and wrapped bullet continuations are not parsed as jobs');
  assert.equal(mixedParsed.projects.length, 1, 'an explicitly labeled project inside a different section remains a project');
  assert(mixedParsed.projects[0].description.includes('reduced audit time by 18%'), 'explicit project facts retain their complete outcomes');

  const c = candidate(variedResume);
  const entries = TIQ.views._captureVisualEntries(c);
  const experience = entries.filter(entry => entry.category === 'Experience');
  const projects = entries.filter(entry => entry.category === 'Project');
  const leadership = entries.filter(entry => entry.category === 'Leadership');
  assert.equal(experience.length, 2, 'each parsed role is represented once');
  assert.equal(projects.length, 3, 'each distinct project is represented once');
  assert.equal(leadership.length, 1, 'leadership requires actual leadership section context');
  assert(leadership[0].facts.some(fact => /5 volunteers.*12 neighborhood events/i.test(fact)), 'leadership keeps its scoped quantified result');
  assert(!leadership.some(entry => entry.facts.some(fact => /Coordinated drivers/.test(fact))), 'coordination wording in a work role is not misclassified as leadership');
  assert(experience[0].facts.some(fact => /22% over two quarters\./.test(fact)), 'complete multi-sentence source bullets retain result, unit, and period');
  assert(experience[0].facts.every(fact => !/\.\.\.|…$/.test(fact)), 'highlight facts are not cut off mid-sentence');
  assert(projects[0].facts.some(fact => /4,800 simulated orders/.test(fact)), 'project summary preserves the simulated scale claim');
  assert(projects[0].facts.some(fact => /modeled forecast.*17%/i.test(fact)), 'a separate concise project fact preserves the modeled outcome');
  assert(projects[1].facts.some(fact => /320 storage locations/.test(fact)), 'warehouse project summary preserves its scale');
  assert(projects[1].facts.some(fact => /projected 11%/i.test(fact)), 'a separate concise warehouse fact preserves the projected outcome');
  assert(projects[2].facts.some(fact => fact === 'Built a dashboard to compare service levels across 24 routes.'),
    'dashboard highlight keeps its source action and route scope while dropping only the tool method');
  assert([...experience, ...projects, ...leadership].flatMap(entry => entry.facts).every(fact => fact.trim().split(/\s+/).length <= 10),
    'every rendered highlight fact is at most ten whitespace-separated words');
  assert(c.parsedResume.rawText.includes('Analyzed 4,800 simulated orders using Python and SQL. The modeled forecast reduced inventory variance by 17%.'),
    'full project details remain accessible in the parsed résumé');

  const wrappedLeadershipText = [
    'SKILLS AND LEADERSHIP',
    'Leadership: Community Engagement Committee; coordinated three employer networking',
    'events serving 100+ students.',
    'SKILLS',
    'Excel, Power BI'
  ].join('\n');
  const wrappedLeadership = candidate(wrappedLeadershipText);
  const wrappedPdfText = TIQ.ai.pageTextFromContent({items:[
    {str:'Leadership: Community Engagement Committee; coordinated three employer networking',hasEOL:true},
    {str:'events serving 100+ students.',hasEOL:true}
  ]});
  assert(wrappedPdfText.includes('\n'), 'PDF text extraction preserves source line boundaries for the parser');
  const wrappedLeadershipHtml = TIQ.views._resumeHighlightsHtml(wrappedLeadership);
  assert(wrappedLeadershipHtml.replace(/<[^>]+>/g, '').includes('three employer networking events serving 100+ students'),
    'a wrapped leadership clause retains its complete quantified continuation');
  assert(!wrappedLeadershipHtml.includes('Excel, Power BI'), 'a following section is not merged into a leadership fact');

  const outcomeResume = [
    'EXPERIENCE',
    'Operations Analyst | Example Freight | Omaha, NE | 2023–2025',
    '• Tracked 50–70 daily shipments and updated dispatch status.',
    '• Built an Excel tracker that reduced weekly reporting preparation from 3 hours to 45 minutes.',
    '• Reviewed 300 shipment records, identified recurring errors, and helped reduce missing delivery-status entries by 24%.'
  ].join('\n');
  const outcomeFacts = TIQ.views._captureVisualEntries(candidate(outcomeResume))
    .find(entry => entry.category === 'Experience').facts;
  assert.equal(outcomeFacts.length, 2, 'role highlights stay concise');
  assert(outcomeFacts.some(fact => /3 hours to 45 minutes/.test(fact)), 'the reporting-time outcome is retained');
  assert(outcomeFacts.some(fact => /helped reduce missing delivery-status entries by 24%/i.test(fact)), 'a distinct improvement outranks routine volume metrics');
  assert(!outcomeFacts.some(fact => /50–70 daily shipments/.test(fact)), 'routine scale does not displace distinct outcomes');

  const html = TIQ.views._resumeHighlightsHtml(c);
  const cardHtml = TIQ.views._buildCardHtml(c, true);
  for (const category of ['Experience', 'Projects', 'Leadership']) {
    assert.equal((html.match(new RegExp('resume-highlights__category[^>]*>' + category, 'g')) || []).length, 1,
      category + ' has one grouped heading');
  }
  assert(html.includes('Projects · 3'), 'project count matches the three project entries displayed');
  assert(cardHtml.includes('Applied Mathematics'), 'specific major appears in the card');
  const corrected = candidate(variedResume, { major: 'Recruiter correction', provenance: { major: 'form' } });
  assert(TIQ.views._buildCardHtml(corrected, true).includes('Recruiter correction'), 'recruiter-entered major remains authoritative');
  assert(html.includes('Acme Transit · Denver, CO') && html.includes('2022 – Present'), 'role subtitle and dates use independent supported fields');
  assert(/class="resume-highlights"[^>]*role="region"/.test(html) && /tabindex="0"/.test(html), 'scrollable highlights expose a named keyboard-accessible region');

  const noLeadership = candidate('EXPERIENCE\nOperations Analyst | Acme\n• Coordinated a team of 4 during a scheduling change.\nPROJECTS\nRoute Tool\n• Built a route tool for 12 routes.');
  assert(!TIQ.views._captureVisualEntries(noLeadership).some(entry => entry.category === 'Leadership'), 'work verbs alone never create a leadership category');

  const sparse = candidate('EDUCATION\nNorth State College\nBachelor of Arts\nEXPERIENCE\nResearch Assistant | Lab Group\n• Documented procedures for a team.');
  assert(TIQ.views._captureVisualEntries(sparse).every(entry => entry.name || entry.facts.length), 'sparse resumes do not create empty highlight entries');

  const stale = candidate(variedResume, {
    notes: 'Keep this recruiter note.',
    accomplishments: [
      { source: 'resume', text: 'Old generated fact' },
      { source: 'conversation', text: 'Recruiter-reviewed note' }
    ]
  });
  TIQ.ai.clearResumeDerivedData(stale);
  assert.equal(stale.accomplishments.length, 1, 'resume replacement clears stale generated highlights but keeps recruiter-sourced evidence');
  assert.equal(stale.accomplishments[0].text, 'Recruiter-reviewed note');
  assert.equal(stale.notes, 'Keep this recruiter note.', 'resume replacement preserves recruiter notes');

  console.log('PASS candidate card source fidelity, grouping, metadata, and accessibility');
}

main();
