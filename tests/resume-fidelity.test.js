const assert = require('node:assert/strict');
const {loadApp} = require('./harness');
const T = loadApp(['components.js', 'skill-icons.js', 'views.js']);
const raw = `Avery Brooks
EDUCATION
University of Arkansas | BS Computer Science | Expected May 2027
EXPERIENCE
Software Engineering Intern | Cedar Route Software | Bentonville, AR | May - Aug 2026
- Implemented three Spring Boot endpoints for appointment updates and shipment lookup, including request
validation and consistent error responses; paired with a senior engineer for production reviews.
- Built a React exception queue with sorting, filters, and loading states, reducing the median time to find a
flagged record from 48 to 29 seconds in a ten-user internal usability test.
- Added 34 unit and integration tests for duplicate requests and invalid timestamps; resolved six defects
identified during staging review and documented API behavior for the frontend team.
Student Technology Assistant | University Computing Lab | Aug 2024 - Present
- Handle approximately 18 support requests per week involving account access, software installation, and
development environments while communicating next steps to nontechnical students.
- Wrote a troubleshooting guide for common Git and Python setup issues that was adopted by four lab
assistants; coordinate escalations and track unresolved issues across shifts.
PROJECTS
Freight Exception Tracker | React, Java, PostgreSQL | Team of four | Jan - May 2026
- Designed an event schema and built an API that identifies late or missing updates using 25,000 synthetic
shipment events; distinguished missing data from confirmed delivery exceptions.
Hackathon Candidate Check-in | TypeScript, Node.js | Sep 2026
- Developed a QR-based registration prototype with server-side validation, duplicate-email checks, and
candidate-card previews during a 24-hour student hackathon.`;
function candidate(text = raw) {
  const c = T.intake.buildCandidate({firstName:'Avery',lastName:'Brooks'});
  c.parsedResume = T.ai.extractResumeData(text);
  c.resumeUpload = {name:'avery.pdf',parsedAt:'2026-10-06'};
  return c;
}
const tests = {
  'section-like project names remain projects and summary headings end them'() {
    const text = 'PROJECTS\nWorkflow Dashboard | Python | May 2026\n- Built a workflow dashboard for six users.\nEducation Portal | JavaScript\n- Added accessible forms for student records.\nLEADERSHIP EXPERIENCE\nClub Secretary | Campus Club\n- Organized two events.\nPROFESSIONAL SUMMARY\nStudent developer with practical project experience.';
    const projects = T.ai.extractResumeData(text).projects;
    assert.deepEqual(Array.from(projects, p => p.name), ['Workflow Dashboard','Education Portal']);
    assert.equal(projects[1].bullets.length, 1);
  },
  'volunteer job titles are roles rather than section boundaries'() {
    const parsed = T.ai.extractResumeData('EXPERIENCE\nAssociate | Store | 2023 - Present\n- Assist customers.\nVolunteer Web Developer | Pantry | Jun - Sep 2026\n- Built a registration page.\nPROJECTS\nSite | JavaScript\n- Wrote tests.');
    assert.equal(parsed.experience.length, 2);
    assert.equal(parsed.experience[1].title, 'Volunteer Web Developer');
  },
  'education retains a major before graduation metadata'() {
    assert.equal(candidate().parsedResume.education[0].major, 'Computer Science');
  },
  'wrapped bullets are complete and source-owned'() {
    const c = candidate(), role = c.parsedResume.experience[0];
    assert.equal(role.dates, 'May - Aug 2026');
    assert.equal(role.location, 'Bentonville, AR');
    assert.equal(role.bullets.length, 3);
    assert.match(role.bullets[1].text, /48 to 29 seconds.*ten-user internal usability test/);
    assert.match(c.parsedResume.rawText.slice(role.bullets[1].offset, role.bullets[1].end), /Built a React/);
  },
  'all roles and projects retain contributions regardless of word count or verb'() {
    const entries = T.views._captureVisualEntries(candidate());
    assert.equal(entries.length, 4);
    assert(entries.every(e => e.facts.length));
    assert(entries[0].facts.some(f => /48 to 29 seconds.*ten-user internal usability test/.test(f)));
    assert(entries[1].facts.some(f => /^Handle.*18 support requests/.test(f)));
    assert(entries[1].facts.some(f => /^Wrote/.test(f)));
    assert(entries[2].facts.some(f => /25,000 synthetic shipment events/.test(f)));
    assert.equal(entries[2].dates, 'Jan - May 2026');
    assert(T.views._captureHighlightItemHtml(entries[2]).includes('Team of four'));
  },
  'two or three concise contributions keep source navigation'() {
    const e = T.views._captureVisualEntries(candidate())[0];
    const html = T.views._captureHighlightItemHtml(e);
    assert(!html.includes('<details'));
    assert.equal((html.match(/<li>/g) || []).length, 3);
    assert.match(html, /data-resume-source=/);
    assert(e.facts.some(f => /34 unit and integration tests/.test(f)), 'full test contribution stays in source data');
    assert.match(html, /<strong class="capture-metric">/);
    assert(T.views._captureBriefFacts(e).every(b => b.text.split(/\s+/).length <= 10));
  },
  'wrapped and repeated source bullets have stable owner-specific links'() {
    const c = candidate(raw + '\n- Developed a QR-based registration prototype with server-side validation, duplicate-email checks, and\ncandidate-card previews during a 24-hour student hackathon.');
    const entries = T.views._captureVisualEntries(c);
    const doc = T.views._capturePrintResumeHtml(c);
    for (const entry of entries) for (const evidence of entry.factEvidence) {
      assert(evidence, entry.name + ' has original bullet evidence');
      assert(doc.includes('data-resume-passage-id="' + evidence.passageId + '"'));
    }
    const e = entries[0].factEvidence[0];
    const replaced = candidate(raw.replace('48 to 29 seconds', '48 to 35 seconds'));
    assert(!T.views._capturePrintResumeHtml(replaced).includes(e.passageId));
  },
  'later sections cannot become fake projects and earlier roles remain roles'() {
    const c = candidate('EXPERIENCE\nEngineer | Firm | 2022 - Present\n- Build dependable services.\nPROJECTS\nToolkit | Java\n- Wrote a guide covering\n+SQL queries and environment setup.\nEARLIER EXPERIENCE\nJunior Engineer | Firm | 2020 - 2022\n- Maintained services.\nARCHITECTURE AND DELIVERY CONTRIBUTIONS\nReliability and change management\n- Write design documents.\nADDITIONAL TECHNICAL PROJECTS\nTelemetry | Python\n- Built a sandbox pipeline.\nPROFESSIONAL DEVELOPMENT\nTraining and Community\n- Completed training.'.replace('\n+SQL', '\nSQL'));
    assert.deepEqual(Array.from(c.parsedResume.projects, p => p.name), ['Toolkit','Telemetry']);
    assert.deepEqual(Array.from(c.parsedResume.experience, p => p.title), ['Engineer','Junior Engineer']);
    assert.match(c.parsedResume.projects[0].description, /SQL queries and environment setup/);
  },
  'metric emphasis includes ranges and spelled quantities but not dates or phones'() {
    const html = T.views._captureMetricHtml('Reduced median time from 48 to 29 seconds in a ten-user internal usability test; added 34 unit and integration tests.');
    assert.match(html, /<strong class="capture-metric">from 48 to 29 seconds<\/strong>/);
    assert.match(html, /<strong class="capture-metric">ten-user<\/strong>/);
    assert.match(html, /<strong class="capture-metric">34 unit and integration tests<\/strong>/);
    assert(!T.views._captureMetricHtml('May 2026 | (202) 555-0101').includes('<strong'));
  },
  'versioned refresh preserves recruiter fields and invalidates approval once'() {
    const c = candidate();
    c.parsedResume.parserVersion = 0;
    c.major = 'Recruiter correction'; c.provenance.major = 'form';
    c.notes = 'Keep these notes'; c.approvalStatus = 'Approved';
    assert(T.refreshParsedCandidate(c));
    assert.equal(c.major, 'Recruiter correction');
    assert.equal(c.notes, 'Keep these notes');
    assert.equal(c.approvalStatus, 'Pending');
    assert.equal(c.parsedResume.parserVersion, T.ai.PARSER_VERSION);
    c.approvalStatus = 'Approved';
    assert.equal(T.refreshParsedCandidate(c), false);
    assert.equal(c.approvalStatus, 'Approved');
  }
};
let failed = 0;
for (const [name, test] of Object.entries(tests)) {
  try { test(); console.log('PASS', name); }
  catch (error) { failed++; console.error('FAIL', name, error.message); }
}
process.exitCode = failed ? 1 : 0;
