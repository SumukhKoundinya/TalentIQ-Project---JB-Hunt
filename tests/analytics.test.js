const { loadApp, assert } = require('./harness');

function main() {
  const TIQ = loadApp(['analytics.js']);
  const A = TIQ.analytics;
  assert(A && typeof A === 'object', 'TIQ.analytics module exists');
  ['statusCounts', 'avgReviewSeconds', 'formatDuration', 'dataCompleteness', 'majorBreakdown', 'topUniversities', 'activityFeed', 'perRecruiter'].forEach(function (fn) {
    assert(typeof A[fn] === 'function', 'analytics.' + fn + ' is a function');
  });

  const cands = [
    { id: 'C1', name: 'Mia Williams', firstName: 'Mia', lastName: 'Williams',
      recordStatus: 'New', major: 'Computer Science', university: 'Alabama', capturedBy: 'R1',
      traceability: ['resume'], auditLog: [
        { action: 'CREATED', recruiter_id: 'R1', time_to_complete: 30 },
        { action: 'APPROVED', recruiter_id: 'R1', time_to_complete: 180 }
      ] },
    { id: 'C2', name: 'Jordan Patel', firstName: 'Jordan', lastName: 'Patel',
      recordStatus: 'Reviewed', major: 'Data Science', university: 'Alabama', capturedBy: 'R2',
      traceability: ['conversation'], auditLog: [
        { action: 'CREATED', recruiter_id: 'R2', time_to_complete: 120 },
        { action: 'FOLLOW_UP', recruiter_id: 'R2', time_to_complete: 0 }
      ] },
    { id: 'C3', name: 'Priya Singh', firstName: 'Priya', lastName: 'Singh',
      recordStatus: 'Interview Requested', major: '', university: 'Tennessee', capturedBy: 'R3',
      traceability: [], auditLog: [
        { action: 'CREATED', recruiter_id: 'R9', time_to_complete: 0 }
      ] },
    { id: 'C4', name: 'Andre Brooks', firstName: 'Andre', lastName: 'Brooks',
      recordStatus: 'Follow-Up', major: 'Engineering', university: 'Tennessee', capturedBy: 'R1',
      traceability: [], auditLog: [
        { action: 'CREATED', recruiter_id: 'R1', time_to_complete: 45 },
        { action: 'INTERVIEW_REQUESTED', recruiter_id: 'R1', time_to_complete: 240 }
      ] },
    { id: 'C5', name: 'Sam Rivera', firstName: 'Sam', lastName: 'Rivera',
      recordStatus: 'New', major: 'Computer Science', university: 'Vanderbilt', capturedBy: 'R3',
      traceability: [], auditLog: [] },
    { id: 'C6', name: 'Olivia Chen', firstName: 'Olivia', lastName: 'Chen',
      recordStatus: 'Reviewed', major: 'Computer Science', university: 'Vanderbilt', capturedBy: 'R4',
      traceability: [], auditLog: [
        { action: 'CREATED', recruiter_id: 'R4', time_to_complete: 90 }
      ] }
  ];

  const counts = A.statusCounts(cands);
  assert(counts.New === 2 && counts.Reviewed === 2 && counts['Follow-Up'] === 1 && counts['Interview Requested'] === 1, 'statusCounts tallies each status');
  const statusTotal = ['New', 'Reviewed', 'Follow-Up', 'Interview Requested'].reduce(function (s, k) { return s + (counts[k] || 0); }, 0);
  assert(statusTotal === 6, 'statusCounts sums to candidate count');

  assert(A.avgReviewSeconds([]) === 0, 'avgReviewSeconds zero when no candidates');
  assert(A.avgReviewSeconds([{ auditLog: [{ time_to_complete: 180 }] }]) === 180, 'avgReviewSeconds single 180s');
  assert(A.avgReviewSeconds([{ auditLog: [{ time_to_complete: 180 }, { time_to_complete: 0 }] }]) === 180, 'avgReviewSeconds ignores its zero entry');
  assert(A.avgReviewSeconds([{ auditLog: [{ time_to_complete: 180 }] }, { auditLog: [{ time_to_complete: 300 }] }]) === 240, 'avgReviewSeconds mean of positives');
  assert(A.avgReviewSeconds([{ auditLog: [] }]) === 0, 'avgReviewSeconds zero when none');

  assert(A.formatDuration(0) === '\u2014', 'formatDuration 0');
  assert(A.formatDuration(undefined) === '\u2014', 'formatDuration undefined');
  assert(A.formatDuration(45) === '45s', 'formatDuration 45s');
  assert(A.formatDuration(150) === '2m 30s', 'formatDuration 2m 30s');
  assert(A.formatDuration(3600) === '60m', 'formatDuration 60m');

  const complete = { id: 'D1', workAuthorization: 'US Citizen', graduationDate: 'May 2026', gpa: '3.9', phone: '555-0100', resumeUpload: 'resume.pdf', workLocations: ['Nashville, TN'], skills: ['Python'], notes: 'Solid technical discussion.', areasDiscussed: ['AI'] };
  const partial = { id: 'D2', workAuthorization: 'US Citizen', gpa: '3.0' };
  assert(A.dataCompleteness([]) === 0, 'dataCompleteness empty set is 0');
  assert(A.dataCompleteness([complete]) === 100, 'dataCompleteness complete candidate is 100');
  assert(A.dataCompleteness([partial]) === 22, 'dataCompleteness partial candidate (7 of 9 flags)');
  assert(A.dataCompleteness([complete, partial]) === 61, 'dataCompleteness mixed set rounds to 61');
  const comp = A.dataCompleteness(cands);
  assert(typeof comp === 'number' && comp >= 0 && comp <= 100, 'dataCompleteness on fixtures is a % number');

  const majors = A.majorBreakdown(cands);
  assert(majors.length === 4, 'majorBreakdown has one entry per distinct major');
  assert(majors[0].label === 'Computer Science' && majors[0].value === 50, 'majorBreakdown top major first');
  assert(majors[0].value >= majors[1].value, 'majorBreakdown sorted desc');
  assert(majors.some(function (m) { return m.label === 'Unknown'; }), 'majorBreakdown marks empty majors Unknown');
  assert(majors.reduce(function (s, m) { return s + m.value; }, 0) >= 99, 'majorBreakdown values sum to ~100');

  const tops = A.topUniversities(cands);
  assert(tops.length === 3, 'topUniversities lists distinct universities capped at 5');
  assert(tops[0].university === 'Alabama' && tops[0].count === 2, 'topUniversities ranks by count');
  assert(tops[1].university === 'Tennessee' && tops[1].count === 2, 'topUniversities second entry');

  const feedCands = [
    { id: 'F1', name: 'One', auditLog: [
      { action: 'CREATED', recruiter_id: 'R1', time_to_complete: 30 },
      { action: 'NOTES_UPDATED', recruiter_id: 'R1', time_to_complete: 40 },
      { action: 'SUMMARY_REGEN', recruiter_id: null },
      { action: 'APPROVED', recruiter_id: 'R2', time_to_complete: 180 }
    ] },
    { id: 'F2', name: 'Two', auditLog: [{ action: 'INTERVIEW_REQUESTED', recruiter_id: 'NOPE' }] },
    { id: 'F3', name: 'Three', auditLog: null },
    { id: 'F4', name: 'Four', auditLog: [{ action: 'FOLLOW_UP', recruiter_id: 'R3' }, { action: 'CREATED', recruiter_id: '' }] },
    { id: 'F5', name: 'Five', auditLog: [{ action: 'APPROVED', recruiter_id: 'R4' }, { action: 'APPROVED', recruiter_id: 'R4' }] }
  ];
  const feed = A.activityFeed(feedCands);
  assert(Array.isArray(feed) && feed.length === 5, 'activityFeed caps at 5 entries');
  assert(feed[0].recruiter === 'System' && feed[0].action === 'Summary Regen' && feed[0].target === 'F1', 'activityFeed last-2 entries, System fallback, title case');
  assert(feed[0].time === 'just now' && feed[0].dotColor === '#FEDB00', 'activityFeed entry fields');
  assert(feed[1].recruiter === 'Alex Carter' && feed[1].action === 'Approved', 'activityFeed looks up recruiter by id');
  assert(feed[3].recruiter === 'Morgan Wells', 'activityFeed resolves R3');
  assert(feed[4].recruiter === 'System' && feed[4].action === 'Created', 'activityFeed empty recruiter_id -> System');
  assert(feed[0].action !== 'summary regen', 'activityFeed actions are title-cased (not lowercase)');
  assert(!feed.some(function (f) { return f.action === 'Notes Updated'; }) && !feed.some(function (f) { return f.action === 'Created' && f.target === 'F1'; }), 'activityFeed drops older audit entries');
  feed.forEach(function (f) {
    assert(typeof f.recruiter === 'string' && typeof f.action === 'string' && typeof f.target === 'string' && typeof f.time === 'string' && typeof f.dotColor === 'string', 'activityFeed entry shape');
  });

  const byRecruiter = A.perRecruiter(cands);
  assert(Array.isArray(byRecruiter), 'perRecruiter returns array');
  const r1 = byRecruiter.filter(function (r) { return r.recruiterId === 'R1'; })[0];
  assert(r1 && r1.recruiterName === 'Taylor Morgan' && r1.actions === 4 && r1.approvals === 2, 'perRecruiter R1 actions+approvals');
  const r2 = byRecruiter.filter(function (r) { return r.recruiterId === 'R2'; })[0];
  assert(r2 && r2.actions === 2 && r2.approvals === 1, 'perRecruiter R2 counts FOLLOW_UP as approval');
  const sys = byRecruiter.filter(function (r) { return r.recruiterId === 'R9'; })[0];
  assert(sys && sys.recruiterName === 'System' && sys.actions === 1 && sys.approvals === 0, 'perRecruiter unknown recruiter falls back to System');
  assert(byRecruiter.length === 4, 'perRecruiter one row per recruiter');

  assert(A.statusCounts([null]).New === 0, 'statusCounts skips null candidates');
  assert(A.avgReviewSeconds([null]) === 0, 'avgReviewSeconds skips null candidates');
  assert(A.majorBreakdown([null]).length === 0, 'majorBreakdown skips null candidates');
  assert(A.topUniversities([null]).length === 0, 'topUniversities skips null candidates');
  assert(A.activityFeed([null]).length === 0, 'activityFeed skips null candidates');
  assert(A.perRecruiter([null]).length === 0, 'perRecruiter skips null candidates');
}

main();