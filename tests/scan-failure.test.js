const { loadApp, assert } = require('./harness');

/* A scan must never fail silently: parse resolves null AND the candidate is
   marked uploaded-but-unscanned (parsedAt:"") with an audit entry + metric,
   so the card can flag "Resume Not Scanned" instead of looking fine. */

function makeCandidate() {
  return {
    id: 'TQ-9001', firstName: 'Nirmay', lastName: 'Sharma',
    gpa: '', phone: '', skills: [], summary: '', auditLog: []
  };
}

function checkFailureState(TIQ, c, label) {
  assert(c.resumeUpload && typeof c.resumeUpload === 'object', label + ': resumeUpload is an object');
  assert(c.resumeUpload.name === 'scan.pdf', label + ': filename kept');
  assert(c.resumeUpload.parsedAt === '', label + ': parsedAt stays empty on failure');
  assert(!!c.resumeUpload.parseError, label + ': parseError recorded');

  const flags = TIQ.getMissingFlags(c);
  assert(flags.some(f => f.label === 'Resume Not Scanned'), label + ': flagged "Resume Not Scanned"');
  assert(!flags.some(f => f.label === 'Resume Not Uploaded'), label + ': not flagged as "Not Uploaded"');

  assert(c.auditLog.some(a => a.action === 'RESUME_SCAN_FAILED'), label + ': RESUME_SCAN_FAILED audit entry');
  assert(TIQ.state.metrics.some(m => m.type === 'resume-parse-failed' && m.candidateId === c.id), label + ': resume-parse-failed metric logged');
}

function main() {
  const file = { name: 'scan.pdf', type: 'application/pdf', text: 'pdf bytes' };

  /* Case 1: pdf.js never loaded (CDN blocked / offline) */
  const noLib = loadApp([], { pdfjsLib: null });
  const c1 = makeCandidate();
  return noLib.ai.parseAndStoreResume(c1, file).then(parsed => {
    assert(parsed === null, 'pdf.js missing: resolves null');
    checkFailureState(noLib, c1, 'pdf.js missing');

    /* Case 2: pdf.js present but getDocument rejects (corrupt PDF) */
    const rejectLib = loadApp();
    const c2 = makeCandidate();
    return rejectLib.ai.parseAndStoreResume(c2, file).then(parsed2 => {
      assert(parsed2 === null, 'load error: resolves null');
      checkFailureState(rejectLib, c2, 'load error');
    });
  });
}

main();
