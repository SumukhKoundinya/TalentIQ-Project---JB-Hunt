/* Recruiter workflow, portable intake, and local-data lifecycle. No transport service. */
window.TIQ = window.TIQ || {};

TIQ.invalidateApproval = function(c) {
  c.approvalStatus = 'Pending'; c.approverId = ''; c.approvalTimestamp = '';
};
TIQ.currentEventId = function() {
  if (!TIQ.state.event.id) TIQ.state.event.id = 'event-' + Date.now().toString(36);
  return TIQ.state.event.id;
};
TIQ.eventRecords = function(id) {
  return TIQ.state.candidates.filter(function(c) { return id === 'all' || (id === 'unassigned' ? !c.eventId : c.eventId === id); });
};
TIQ.deleteEventData = function(id) {
  if (!id || id === 'all') return Promise.reject(new Error('Choose one event to delete.'));
  var removed = TIQ.eventRecords(id), ids = removed.map(function(c) { return c.id; });
  var kept = TIQ.state.candidates.filter(function(c) { return ids.indexOf(c.id) === -1; });
  var retainedBlobs = kept.reduce(function(a, c) { return a.concat((c.audioNotes || []).map(function(n) { return n.blobId; })); }, []);
  var blobs = removed.reduce(function(a, c) { return a.concat((c.audioNotes || []).map(function(n) { return n.blobId; })); }, []);
  return Promise.all(blobs.filter(function(b, i) { return b && blobs.indexOf(b) === i && retainedBlobs.indexOf(b) === -1; }).map(function(b) { return TIQ.AudioDB.deleteBlob(b); })).then(function() {
    TIQ.state.candidates = kept;
    TIQ.state.metrics = (TIQ.state.metrics || []).filter(function(m) { return ids.indexOf(m.candidateId) === -1; });
    if (ids.indexOf(TIQ.state.selectedId) !== -1) TIQ.state.selectedId = '';
    TIQ.saveState();
    return removed.length;
  });
};

TIQ.bridge = (function() {
  var fields = ['firstName','lastName','email','phone','university','degreeProgram','major','graduationDate','gpa','workAuthorization'];
  function validate(input) {
    if (!input || input.version !== 1 || input.kind !== 'talentiq-intake' || !input.candidate || Array.isArray(input.candidate)) throw new Error('Choose a TalentIQ intake JSON file (version 1).');
    var src = input.candidate, out = {provenance:{}};
    if (typeof src.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(src.id)) throw new Error('Invalid submission ID.');
    out.id = src.id;
    fields.forEach(function(k) {
      if (src[k] !== undefined && (typeof src[k] !== 'string' || src[k].length > 500)) throw new Error('Invalid field: ' + k);
      out[k] = (src[k] || '').trim();
      var p = src.provenance && src.provenance[k];
      if (out[k]) {
        if (p && ['intake','form'].indexOf(p) === -1) throw new Error('Unsupported field provenance: ' + k);
        out.provenance[k] = p || 'intake';
      }
    });
    if (!out.firstName || !out.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) throw new Error('Name and valid email are required.');
    if (!src.consent || src.consent.profile !== true || typeof src.consent.at !== 'string' || isNaN(Date.parse(src.consent.at))) throw new Error('Submission must include dated profile consent.');
    out.consent = {profile:true,audio:src.consent.audio === true,at:src.consent.at};
    out.resumeNeedsAttachment = src.resumeNeedsAttachment === true;
    return {kind:'talentiq-intake',version:1,candidate:out};
  }
  return {
    serialize: function(c) {
      var out = {id:c.id,provenance:{},consent:c.consent,resumeNeedsAttachment:!!c.resumeUpload};
      fields.forEach(function(k) {
        // Transfer entered fields only. Resume-derived fields need the PDF on the recipient device.
        var p = c.provenance && c.provenance[k];
        if (p !== 'resume') { out[k] = c[k] || ''; if (out[k]) out.provenance[k] = p === 'form' ? 'form' : 'intake'; }
      });
      return JSON.stringify(validate({kind:'talentiq-intake',version:1,candidate:out}), null, 2);
    },
    parse: function(text) {
      if (typeof text !== 'string' || text.length > 30000) throw new Error('Submission must be a JSON file under 30 KB.');
      return validate(JSON.parse(text));
    },
    importSubmission: function(payload, eventId) {
      var p = validate(payload).candidate;
      if (TIQ.state.candidates.some(function(c) { return c.id === p.id; })) return false;
      var c = TIQ.intake.buildCandidate(p, {state:TIQ.state});
      Object.assign(c, p, {eventId:eventId || TIQ.currentEventId(), intakeSource:'portable-intake'});
      var result = TIQ.ai.generateSummary(c); c.summary = result.summary; c.traceability = result.traceability;
      TIQ.state.candidates.push(c); TIQ.saveState(); return true;
    }
  };
})();

TIQ.downloadText = function(name, text, type) {
  var url = URL.createObjectURL(new Blob([text], {type:type || 'application/json'}));
  var a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
};

// Compare the content being approved, not statuses or audit entries. This catches
// edits through every existing form, resume scan, transcript and summary editor.
(function() {
  var prior = {}, known = {}, save = TIQ.saveState;
  function fingerprint(c) {
    return JSON.stringify(['firstName','lastName','email','phone','university','degreeProgram','major','graduationDate','gpa','workAuthorization','workLocations','skills','notes','areasDiscussed','summary','parsedResume','accomplishments','audioNotes'].map(function(k) { return c[k]; }));
  }
  TIQ.state.candidates.forEach(function(c) { known[c.id] = true; prior[c.id] = fingerprint(c); });
  TIQ.saveState = function() {
    TIQ.state.candidates.forEach(function(c) {
      if (!known[c.id]) { if (!c.eventId) c.eventId = TIQ.currentEventId(); known[c.id] = true; }
      var next = fingerprint(c);
      if (prior[c.id] && prior[c.id] !== next && c.approvalStatus === 'Approved') TIQ.invalidateApproval(c);
      prior[c.id] = next;
    });
    save();
    if (TIQ.refreshWorkflow) TIQ.refreshWorkflow();
  };
})();

TIQ.howItWorksHtml = function() {
  return '<details class="workflow-explainer"><summary>How this works &amp; where data goes</summary><ul>' +
    '<li>Resume extraction uses deterministic rules and templates, not a generative model. Vosk uses a speech-recognition model locally; transcripts can be wrong and may contain the recruiter’s voice.</li>' +
    '<li>Profiles live in this browser’s localStorage; audio lives in IndexedDB. Fonts and libraries load from external hosts. Manual downloads and sharing can transmit personal data.</li>' +
    '<li>Grounded highlights quote source text. Context is shown only when available. Review the source before approving a snapshot.</li>' +
    '<li>No candidate scoring, ranking, auto-rejection, or protected-trait inference. Uploaded documents may contain sensitive or protected information.</li>' +
    '<li>Draft snapshots require recruiter approval; edits invalidate that approval. Side-by-side record comparison is available for human review.</li>' +
    '<li>Data persists until deleted or browser storage is cleared; no automatic retention schedule. Delete event data here and separately delete any shared copies. This prototype makes no compliance certification claim.</li></ul></details>';
};

TIQ.renderWorkflowNav = function() {
  var h = TIQ.escapeHtml;
  function item(s) { return '<a href="#' + s.key + '" class="nav-link" data-nav="' + s.key + '">' +
    (s.step ? '<span class="workflow-number">' + s.step + '</span>' : '') + '<span>' + h(s.label) + '<small>' + h(s.when) + '</small><small data-count="' + s.key + '"></small></span></a>'; }
  return '<div class="nav-label">Recruiter workflow</div>' + TIQ.CONFIG.workflow.map(item).join('') + '<div class="nav-label">Study</div>' + TIQ.CONFIG.study.map(item).join('');
};
TIQ.refreshWorkflow = function() {
  if (typeof document === 'undefined') return;
  var c = TIQ.state.candidates, pending = c.filter(function(x) { return x.approvalStatus !== 'Approved'; }).length;
  var capture = document.querySelector('[data-count="capture"]'), review = document.querySelector('[data-count="review"]');
  if (capture) capture.textContent = c.length + ' local records';
  if (review) review.textContent = pending + ' pending approval';
};
TIQ.openSubmissionImport = function() {
  var old = document.getElementById('submissionDialog'); if (old) old.remove();
  var dialog = document.createElement('dialog'); dialog.id = 'submissionDialog'; dialog.className = 'submission-dialog';
  dialog.innerHTML = '<h2>Import a submission</h2><p>Choose the candidate’s TalentIQ JSON file. This imports entered fields into the current event; attach the original PDF separately.</p>' +
    '<label>Submission JSON<input type="file" accept=".json,application/json" id="submissionFile"></label><pre id="submissionPreview" aria-live="polite">Choose a file to preview.</pre>' +
    '<button class="primary-button" id="confirmSubmission" disabled>Import into current event</button> <button class="secondary-button" id="closeSubmission">Cancel</button>';
  document.body.appendChild(dialog); dialog.showModal();
  var payload;
  dialog.querySelector('#submissionFile').onchange = function(e) {
    var f = e.target.files[0], preview = dialog.querySelector('#submissionPreview'), button = dialog.querySelector('#confirmSubmission');
    payload = null; button.disabled = true;
    if (!f || f.size > 30000) { preview.textContent = 'Choose a JSON file under 30 KB.'; return; }
    f.text().then(function(text) {
      payload = TIQ.bridge.parse(text); var c = payload.candidate;
      var duplicate = TIQ.state.candidates.some(function(x) { return x.id === c.id; });
      preview.textContent = c.firstName + ' ' + c.lastName + '\n' + c.email + '\n' + c.university + '\n' + c.major + '\nConsent: ' + c.consent.at + '\n' +
        (c.resumeNeedsAttachment ? 'PDF needs attaching on this device.\n' : '') + (duplicate ? 'Already imported — no changes will be made.' : 'New record; pending recruiter review.');
      button.disabled = duplicate;
    }).catch(function(err) { preview.textContent = err.message; });
  };
  dialog.querySelector('#closeSubmission').onclick = function() { dialog.close(); };
  dialog.querySelector('#confirmSubmission').onclick = function() {
    if (!payload) return;
    TIQ.bridge.importSubmission(payload); dialog.close(); TIQ.router.navigateTo('capture'); TIQ.showToast('Submission imported. Attach the PDF if supplied.');
  };
};

TIQ.initWorkflow = function() {
  var nav = document.querySelector('.sidebar-nav'); if (nav) nav.innerHTML = TIQ.renderWorkflowNav();
  TIQ.currentEventId();
  document.addEventListener('click', function(e) {
    var go = e.target.closest('[data-go]'); if (go) TIQ.router.navigateTo(go.dataset.go);
    if (e.target.closest('[data-import-submission]')) TIQ.openSubmissionImport();
    if (e.target.closest('[data-demo-load]') && confirm('Add 48 clearly labelled synthetic records across three sample events? Existing records are kept.')) {
      TIQ.views.generateDemoCandidates(); TIQ.router.navigateTo(TIQ.router.currentView);
    }
  });
  function connection() {
    var banner = document.getElementById('connectionStatus');
    if (banner) { banner.hidden = navigator.onLine !== false; banner.textContent = 'Offline — capture and local review still work. Resume parsing and transcription depend on resources already loaded; manual notes remain available.'; }
  }
  window.addEventListener('online', connection); window.addEventListener('offline', connection); connection();
};
