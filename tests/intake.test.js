const { loadApp, assert } = require('./harness');

function main() {
  const TIQ = loadApp();

  /* ID scheme: TQ-(2500 + state.candidates.length) to avoid collisions with manual TQ-2500+ candidates */
  const state = { candidates: [{ id: 'TQ-2500' }, { id: 'TQ-2501' }] };
  assert(TIQ.intake.nextId(state) === 'TQ-2502', 'ids continue from 2500 + count');
  assert(TIQ.intake.nextId({ candidates: new Array(7) }) === 'TQ-2507', 'seed candidates leave no collision');

  /* PDF only — DOC/DOCX are accepted by the UI but cannot be parsed */
  assert(TIQ.intake.isParsableResume({ type: 'application/pdf' }) === true, 'pdf accepted by mime');
  assert(TIQ.intake.isParsableResume({ name: 'resume.PDF', type: '' }) === true, 'pdf accepted by extension');
  assert(TIQ.intake.isParsableResume({ name: 'resume.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }) === false, 'docx rejected');
  assert(TIQ.intake.isParsableResume({ name: 'resume.doc', type: 'application/msword' }) === false, 'doc rejected');
  assert(TIQ.intake.isParsableResume(null) === false, 'null file rejected');
  assert(TIQ.intake.isParsableResume(undefined) === false, 'undefined file rejected');

  /* Candidate builder: priority Medium (main app uses High/Medium/Low), id aligned, resume name stored */
  const c = TIQ.intake.buildCandidate(
    { firstName: 'Maya', lastName: 'Robinson', email: 'maya@u.edu', phone: '', university: 'Vanderbilt University', major: 'Data Science', graduationDate: 'May 2027', resumeName: 'maya_robinson.pdf' },
    { state: state }
  );
  assert(c.id === 'TQ-2502', 'candidate id uses intake.nextId');
  assert(c.priority === 'Medium', 'QR intake candidates default to Medium priority');
  assert(c.recordStatus === 'New', 'new candidate starts as New');
  assert(c.resumeUpload === 'maya_robinson.pdf', 'resume name stored when PDF provided');
  assert(c.gpa === '' && c.skills.length === 0, 'unparsed fields start empty (backfilled by parse)');

  const noFile = TIQ.intake.buildCandidate({ firstName: 'Avery' }, { state: state });
  assert(noFile.resumeUpload === '', 'resumeUpload empty when no file');
  assert(noFile.auditLog[0].action === 'CREATED', 'buildCandidate seeds CREATED audit entry');
}

main();