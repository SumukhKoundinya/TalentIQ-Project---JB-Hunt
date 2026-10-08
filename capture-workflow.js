/* Optional conversation capture; parser and recruiting decisions stay separate. */
window.TIQ = window.TIQ || {};
TIQ.captureWorkflow = (function() {
  var arrays = ['workLocations', 'technicalInterests', 'areasDiscussed'];
  var fields = arrays.concat(['function', 'candidateQuestions', 'followUpQuestions', 'nextStepNotes']);
  var tags = ['Coursework', 'Personal projects', 'Leadership', 'Employment', 'Collaboration', 'Testing', 'Product needs', 'Prioritization', 'Career interests'];
  function list(value) {
    return (Array.isArray(value) ? value : String(value || '').split(',')).map(function(item) {
      return String(item).trim();
    }).filter(function(item, index, all) { return item && all.indexOf(item) === index; });
  }
  function update(c, field, value) {
    if (fields.indexOf(field) === -1) throw new Error('Unknown conversation field.');
    var next = arrays.indexOf(field) !== -1 ? list(value) : String(value || '').trim();
    if (JSON.stringify(c[field]) === JSON.stringify(next)) return;
    c[field] = next;
    c.provenance = c.provenance || {};
    c.provenance[field] = 'recruiter';
    TIQ.invalidateApproval(c);
    TIQ.addAuditEntry(c, 'CONVERSATION_UPDATED', 'Recruiter updated ' + field);
    TIQ.saveState();
  }
  function prompts(role) {
    if (/product/i.test(role || '')) return [
      'What user need did you explore in coursework, a personal project or a leadership activity?',
      'How did you prioritize work, and what evidence informed that choice?',
      'What question or next step should we capture?'
    ];
    return [
      'Describe something you built in coursework, a personal project or a leadership activity.',
      'What was your contribution, and how did you test or improve it?',
      'What technical interests, questions or next steps should we capture?'
    ];
  }
  function shortcutsBlocked(target) {
    return !!(target && target.closest && target.closest('input, textarea, select, button, a, summary, audio, video, [role="tab"], [role="button"], [contenteditable]:not([contenteditable="false"])'));
  }
  return { update: update, prompts: prompts, tags: tags, shortcutsBlocked: shortcutsBlocked,
    canRecord: function(permission) { return !!(permission && permission.checked); } };
})();
