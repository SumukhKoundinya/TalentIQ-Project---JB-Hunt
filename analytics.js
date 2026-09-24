/* ============================================
   TalentIQ — Analytics (computed metrics)
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.analytics = (function () {
  var REVIEW_ACTIONS = ['APPROVED', 'FOLLOW_UP', 'INTERVIEW_REQUESTED'];
  var FLAG_COUNT = 9;

  function recruiterName(id) {
    if (!id) return 'System';
    var list = TIQ.RECRUITERS || [];
    var r = list.find(function (x) { return x && x.id === id; });
    if (!r && TIQ.CONFIG && TIQ.CONFIG.recruiters) {
      r = TIQ.CONFIG.recruiters.find(function (x) { return x && x.id === id; });
    }
    return r ? r.name : 'System';
  }

  function titleCaseWords(str) {
    return str.split(' ').map(function (w) {
      return w ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    }).join(' ');
  }

  function statusCounts(candidates) {
    var counts = { 'New': 0, 'Reviewed': 0, 'Follow-Up': 0, 'Interview Requested': 0 };
    (candidates || []).forEach(function (c) {
      if (!c) return;
      var s = c.recordStatus || 'New';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }

  function avgReviewSeconds(candidates) {
    var times = [];
    (candidates || []).forEach(function (c) {
      if (!c) return;
      (c.auditLog || []).forEach(function (e) {
        if (e && e.time_to_complete > 0) times.push(e.time_to_complete);
      });
    });
    if (!times.length) return 0;
    return Math.round(times.reduce(function (a, b) { return a + b; }, 0) / times.length);
  }

  function formatDuration(sec) {
    if (!sec) return '\u2014';
    if (sec < 60) return sec + 's';
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return s ? m + 'm ' + s + 's' : m + 'm';
  }

  function dataCompleteness(candidates) {
    if (!candidates || !candidates.length) return 0;
    var missing = 0;
    candidates.forEach(function (c) {
      if (!c) return;
      missing += (TIQ.getMissingFlags(c) || []).length;
    });
    return Math.round((1 - missing / (candidates.length * FLAG_COUNT)) * 100);
  }

  function majorBreakdown(candidates) {
    var counts = {};
    (candidates || []).forEach(function (c) {
      if (!c) return;
      var k = c.major || 'Unknown';
      counts[k] = (counts[k] || 0) + 1;
    });
    var total = Math.max(candidates.length, 1);
    return Object.keys(counts).map(function (k) {
      return { label: k, value: Math.round((counts[k] / total) * 100) };
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, 6);
  }

  function topUniversities(candidates) {
    var counts = {};
    (candidates || []).forEach(function (c) {
      if (!c) return;
      var k = c.university || 'Unknown';
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.keys(counts).map(function (k) {
      return { university: k, count: counts[k] };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 5);
  }

  function activityFeed(candidates) {
    var items = [];
    (candidates || []).forEach(function (c) {
      if (!c) return;
      (c.auditLog || []).slice(-2).forEach(function (e) {
        if (!e) return;
        items.push({
          recruiter: recruiterName(e.recruiter_id),
          action: titleCaseWords(String(e.action || '').toLowerCase().replace(/_/g, ' ')),
          target: c.id,
          time: 'just now',
          dotColor: '#FEDB00'
        });
      });
    });
    return items.slice(0, 5);
  }

  function perRecruiter(candidates) {
    var map = {};
    (candidates || []).forEach(function (c) {
      if (!c) return;
      (c.auditLog || []).forEach(function (e) {
        if (!e) return;
        var rid = e.recruiter_id || 'system';
        if (!map[rid]) map[rid] = { recruiterId: rid, recruiterName: recruiterName(rid), actions: 0, approvals: 0 };
        map[rid].actions++;
        if (REVIEW_ACTIONS.indexOf(e.action) !== -1) map[rid].approvals++;
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  return {
    statusCounts: statusCounts,
    avgReviewSeconds: avgReviewSeconds,
    formatDuration: formatDuration,
    dataCompleteness: dataCompleteness,
    majorBreakdown: majorBreakdown,
    topUniversities: topUniversities,
    activityFeed: activityFeed,
    perRecruiter: perRecruiter
  };
})();