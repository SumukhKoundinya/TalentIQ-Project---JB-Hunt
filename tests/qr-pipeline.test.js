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
`.trim();

/* Fake pdf.js that decodes the raw ArrayBuffer bytes back into resume text —
   faithful to the real pipeline the public QR form runs in the browser. */
function fakePdfjs() {
  return {
    getDocument: function(typedArr) {
      var text = '';
      for (var i = 0; i < typedArr.length; i++) text += String.fromCharCode(typedArr[i]);
      var lines = text.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
      return { promise: Promise.resolve({
        numPages: 1,
        getPage: function() {
          return Promise.resolve({
            getTextContent: function() {
              return Promise.resolve({ items: lines.map(function(l) { return { str: l }; }) });
            }
          });
        }
      }) };
    }
  };
}

function main() {
  const TIQ = loadApp([], { pdfjsLib: fakePdfjs() });
  const state = TIQ.state;

  const fields = {
    firstName: 'Sofia', lastName: 'Rodriguez', email: 'sofia.rodriguez@university.edu',
    phone: '(555) 123-4567', university: 'University of Tennessee', major: 'Data Science',
    graduationDate: 'May 2027', resumeName: 'sofia.pdf'
  };
  const expectedId = TIQ.intake.nextId(state);
  const c = TIQ.intake.buildCandidate(fields, { state: state });
  state.candidates.push(c);
  TIQ.saveState();

  const file = { name: 'sofia.pdf', type: 'application/pdf', text: RESUME };
  return TIQ.ai.parseAndStoreResume(c, file).then(function(parsed) {
    assert(!!parsed, 'parseAndStoreResume resolves with parsed data');
    assert(c.id === expectedId, 'candidate id follows shared 2500+ scheme');
    assert(c.priority === 'Medium', 'QR candidate uses Medium priority');
    assert(c.skills.indexOf('Python') !== -1 && c.skills.indexOf('SQL') !== -1, 'skills backfilled from resume');
    assert(c.gpa === '3.78', 'gpa backfilled from resume');
    assert(c.summary && c.summary.length > 0, 'AI summary generated');
    assert(Array.isArray(c.traceability) && c.traceability.length > 0, 'traceability citations generated');
    assert(c.resumeUpload && c.resumeUpload.name === 'sofia.pdf' && c.resumeUpload.parsedAt, 'resumeUpload object set with name + parsedAt');
    assert(c.auditLog.some(function(a) { return a.action === 'RESUME_PARSED'; }), 'RESUME_PARSED audit entry added');

    const stored = JSON.parse(TIQ.__testStorage.getItem('talentiq_state_v1'));
    const found = stored.candidates.find(function(x) { return x.id === c.id; });
    assert(!!found && found.skills.length > 0 && !!found.summary, 'parsed candidate persisted under talentiq_state_v1');
  }).catch(function(err) {
    assert(false, 'parse pipeline failed: ' + err.stack);
  });
}

main();