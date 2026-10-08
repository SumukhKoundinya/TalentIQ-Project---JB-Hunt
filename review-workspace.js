/* Post-event review and operational handoff. Shared Capture rendering stays in views.js. */
(function() {
  var V = TIQ.views, W = TIQ.reviewWorkflow, h = TIQ.escapeHtml, a = TIQ.escapeAttr;
  var S = V.reviewState = {filters:{event:TIQ.currentEventId(),status:'reviewed-follow-up',verification:'all',search:'',func:'all',gap:''},selected:'',detail:false,evidence:'resume',panels:{},queueScroll:0,previous:null,editing:{},outreach:{},comparison:{ids:[],scroll:[],active:0}};
  function selected() { return TIQ.state.candidates.find(function(c) { return c.id === S.selected; }); }
  function options(values, value) { return values.map(function(v) { var x = typeof v === 'string' ? {id:v,label:v} : v; return '<option value="' + a(x.id) + '"' + (x.id === value ? ' selected' : '') + '>' + h(x.label) + '</option>'; }).join(''); }
  function events() {
    var ids = [TIQ.currentEventId()];
    TIQ.state.candidates.forEach(function(c) { if (c.eventId && ids.indexOf(c.eventId) === -1) ids.push(c.eventId); });
    return [{id:'all',label:'All local events'},{id:'unassigned',label:'Unassigned / legacy'}].concat(ids.map(function(id) { return {id:id,label:id === TIQ.currentEventId() ? TIQ.eventInfo().name + ' (current)' : id}; }));
  }
  function button(text, action, extra) { return '<button type="button" class="secondary-button small-button" data-review-action="' + action + '"' + (extra || '') + '>' + h(text) + '</button>'; }
  function field(label, id, content) { return '<label for="' + id + '">' + h(label) + '</label>' + content; }
  function caption(c) { return '<span class="review-verification">' + h(W.label(c)) + '</span>'; }
  function sharedCard(c, index) {
    var id = index === undefined ? 'review-card-skills' : 'review-compare-skills-' + index;
    var html = V._buildCardHtml(c,false).replace(/capture-skills-popover/g,id);
    var skills = V._captureSkills(c).slice(3), groups = TIQ.categorizeSkills(skills);
    if (!groups.length && skills.length) groups = [{label:'Other',items:skills}];
    return html + '<div id="' + id + '" class="capture-skills-popover" popover="auto" role="region" aria-label="Additional skills"><h3>Additional skills</h3><button type="button" class="secondary-button" popovertarget="' + id + '" popovertargetaction="hide">Close additional skills</button><div data-remaining-skills>' + groups.map(function(g) { return '<section><h4>' + h(g.label || 'Other') + '</h4><ul>' + g.items.map(function(s) { return '<li>' + h(s) + '</li>'; }).join('') + '</ul></section>'; }).join('') + '</div></div>';
  }
  function queue(records) {
    var counts = W.pileCounts(S.filters);
    return '<aside class="review-queue" id="reviewQueue" aria-label="Candidate queue"><h2>Candidates</h2><nav aria-label="Recruiting status piles" class="review-piles">' + ['All'].concat(W.statuses).map(function(p) {
      var key = p === 'All' ? 'all' : p;
      return '<button type="button" data-pile="' + a(key) + '" aria-pressed="' + (S.filters.status === key) + '"><span>' + h(p) + '</span><strong>' + counts[p] + '</strong></button>';
    }).join('') + '</nav><p class="review-help">Pile counts use event and search. Filters below narrow those piles.</p>' +
      field('Verification','reviewVerification','<select id="reviewVerification" data-review-filter="verification">' + options([{id:'all',label:'Any verification'},'Needs verification','Rejected draft','Approved'],S.filters.verification) + '</select>') +
      field('Missing information','reviewGap','<select id="reviewGap" data-review-filter="gap">' + options([{id:'',label:'Any missing item'},{id:'firstName',label:'First name'},{id:'lastName',label:'Last name'},{id:'email',label:'Valid email'}].concat(TIQ.getMissingFlags({}).map(function(f) { return {id:f.key,label:f.key}; })),S.filters.gap) + '</select>') +
      field('Function','reviewFunction','<select id="reviewFunction" data-review-filter="func">' + options([{id:'all',label:'Any function'}].concat(TIQ.CONFIG.functions),S.filters.func) + '</select>') +
      '<p class="review-help">' + records.length + ' matching records · select 2–3 to compare</p><div class="review-records">' + records.map(function(c) {
        return '<div class="review-record"><label><input type="checkbox" data-review-compare="' + a(c.id) + '"' + (V._aiReviewCompare.indexOf(c.id) !== -1 ? ' checked' : '') + ' aria-label="Compare ' + a(c.firstName + ' ' + c.lastName) + '"></label><button type="button" data-review-select="' + a(c.id) + '"' + (c.id === S.selected ? ' aria-current="true"' : '') + '><strong>' + h([c.firstName,c.lastName].filter(Boolean).join(' ') || 'Name not captured') + '</strong><span>' + h(c.recordStatus || 'New') + '</span>' + caption(c) + '</button></div>';
      }).join('') + (!records.length ? '<p>No matching records. Clear filters or capture a candidate.</p>' : '') + '</div>' + button('Compare selected','compare') + button('Clear comparison','compare-clear') + '</aside>';
  }
  function evidence(c) {
    var info = TIQ.resumeInfo(c), original = /^(blob:|https?:\/\/)/.test(info.sourceUrl || '') ? info.sourceUrl : '';
    return '<aside class="review-evidence" id="reviewEvidence" aria-labelledby="reviewEvidenceTitle"><h2 id="reviewEvidenceTitle">Supporting evidence</h2><div class="review-evidence-tabs" role="tablist" aria-label="Evidence type">' + ['resume','notes','sources'].map(function(t) { return '<button type="button" role="tab" id="review-tab-' + t + '" aria-controls="review-evidence-' + t + '" data-review-tab="' + t + '" aria-selected="' + (S.evidence === t) + '" tabindex="' + (S.evidence === t ? '0' : '-1') + '">' + h(t.charAt(0).toUpperCase() + t.slice(1)) + '</button>'; }).join('') + '</div>' +
      '<section role="tabpanel" aria-labelledby="review-tab-resume" id="review-evidence-resume"' + (S.evidence !== 'resume' ? ' hidden' : '') + '><h3>Extracted resume text</h3><p class="review-help">Extraction is not the original PDF. Source links refer to this candidate’s current resume version.</p>' + (original ? '<a href="' + a(original) + '" target="_blank" rel="noopener noreferrer">Open original PDF</a>' : '<p class="review-help">Original PDF unavailable on this device. Attach it in Capture if needed.</p>') + V._capturePrintResumeHtml(c) + '</section>' +
      '<section role="tabpanel" aria-labelledby="review-tab-notes" id="review-evidence-notes"' + (S.evidence !== 'notes' ? ' hidden' : '') + '><h3>Recruiter conversation notes</h3><p class="review-source-text">' + h(c.notes || 'No conversation notes recorded.') + '</p><h3>Transcripts · unverified, speaker not established</h3>' + TIQ.renderTranscriptBlock(c) + (c.audioNotes || []).map(function(n,i) { return '<label>Recording ' + (i + 1) + '<audio controls data-audio-blob-id="' + a(n.blobId) + '"></audio></label>'; }).join('') + '</section>' +
      '<section role="tabpanel" aria-labelledby="review-tab-sources" id="review-evidence-sources"' + (S.evidence !== 'sources' ? ' hidden' : '') + '><p>Origins and source badges are not accuracy proof.</p>' + V.renderFieldProvenance(c) + '<h3>Draft attribution</h3><p>' + h(c.summarySource === 'recruiter' ? 'Recruiter-authored draft. Prior machine citations are not inherited.' : 'Template-generated or legacy draft; check each statement against supplied evidence.') + '</p>' + TIQ.renderCitationList(c.traceability || []) + '<details><summary>Verification history</summary>' + (c.verificationHistory || []).map(function(v) { return '<p>' + h(v.kind) + ' · ' + h(v.timestamp || 'Time not recorded') + ' · ' + h(v.approverId || v.reviewerId || '') + '</p><blockquote>' + h(v.summary || v.reason || '') + '</blockquote>'; }).join('') + '</details></section></aside>';
  }
  function detail(c, records) {
    var index = records.findIndex(function(x) { return x.id === c.id; }), d = W.draft(c);
    var navigation = '<div class="review-navigation">' + button('Back to queue','queue-back') + button('Previous','previous',index <= 0 ? ' disabled' : '') + '<span>' + (index < 0 ? 'Record no longer matches this pile; detail kept until you navigate.' : (index + 1) + ' of ' + records.length + ' in this narrowed pile') + '</span>' + button('Next','next',(index >= records.length - 1 || !records.length) ? ' disabled' : '') + '</div>';
    return '<main class="review-card-panel" id="reviewCard" tabindex="-1">' + navigation + '<p>Recruiting status: <strong>' + h(c.recordStatus || 'New') + '</strong> · ' + caption(c) + '</p>' +
      '<article class="candidate-card review-candidate-card">' + sharedCard(c) + '<p class="review-contact">' + h([c.email,c.phone].filter(Boolean).join(' · ')) + '</p></article>' +
      '<section class="review-editor"><h2>Summary verification</h2><p class="review-help">Approval verifies this draft, not suitability or a hiring decision.</p>' + (c.verificationReason ? '<p role="status">' + h(c.verificationReason) + '</p>' : '') +
      field('Draft summary','reviewSummary','<textarea id="reviewSummary" rows="7" data-review-draft="summary">' + h(d.summary) + '</textarea>') + '<p id="reviewSaveState" role="status">' + (W.dirty(c) ? 'Unsaved edits retained for this candidate' : 'Saved on this device') + '</p>' +
      '<label class="review-check"><input type="checkbox" id="reviewEvidenceChecked"> I checked every draft statement against the supplied evidence</label>' +
      '<div class="review-actions">' + button('Save draft','save') + '<button class="primary-button small-button" type="button" data-review-action="approve">Approve draft</button>' + button('Reject draft','reject') + button('Regenerate draft','regenerate') + '</div>' +
      field('Reason for rejecting the draft','reviewRejectReason','<textarea id="reviewRejectReason" rows="2" placeholder="Explain what needs correction"></textarea>') + '<p class="review-help">Reject draft never rejects the candidate. Edit and save, or regenerate, to return it to Needs verification.</p></section>' +
      '<section class="review-editor"><h2>Recruiting decision</h2>' + field('Recruiting status','reviewStatus','<select id="reviewStatus">' + options(W.statuses,c.recordStatus || 'New') + '</select>') + button('Apply status','status') +
      field('Next-step notes','reviewNextStep','<textarea id="reviewNextStep" rows="3" data-review-draft="nextStepNotes">' + h(d.nextStepNotes) + '</textarea>') + '<p class="review-help">Saved with Save draft. Manual handoff only; no message sent or interview booked.</p></section></main>';
  }
  V.renderLegacyReview = function() {
    var records = W.population(S.filters), c = selected();
    if (!c && records.length) { c = records[0]; S.selected = c.id; }
    return '<div class="view review-frame" id="view-ai-review"><header class="review-header"><div><h2>Review</h2><p>Verify information. Keep recruiting decisions human-owned.</p></div><div class="review-actions">' + button('Candidates: ' + records.length,'queue-open') + field('Event','reviewEvent','<select id="reviewEvent" data-review-filter="event">' + options(events(),S.filters.event) + '</select>') + field('Search candidates','aiSearch','<input type="search" id="aiSearch" data-review-filter="search" value="' + a(S.filters.search || '') + '">') + button('Export CSV','csv') + button('Export JSON','json') + button('Clear filters','clear') + '</div></header>' +
      (S.previous ? '<p class="review-incoming">Opened from Event Results with matching event/filters. ' + button('Return to Event Results','results-return') + '</p>' : '') + '<p class="review-help" id="reviewMessage" role="status"></p><div class="review-workspace' + (S.detail ? ' review-workspace--detail' : '') + '">' + queue(records) +
      (c ? detail(c,records) + evidence(c) : '<section class="review-card-panel"><h2>No records to review</h2><p>Capture a record or clear filters.</p><button class="primary-button" data-go="capture">Open Capture</button></section>') + '</div><dialog id="reviewQueueDialog" class="review-queue-dialog"><h2>Candidate queue</h2>' + button('Close queue','queue-close') + '<div id="reviewQueueDialogBody"></div></dialog><dialog id="reviewCompareDialog" class="review-compare-dialog"><h2>Compare factual records</h2><p>No score, winner, or recommendation. Each draft’s verification is shown separately.</p>' + button('Close comparison','compare-close') + '<div id="reviewCompareBody"></div></dialog></div>';
  };
  function snapshot() {
    var root = typeof document !== 'undefined' && document.getElementById('view-ai-review'), c = selected(); if (!root || !c) return;
    var summary = root.querySelector('#reviewSummary'), next = root.querySelector('#reviewNextStep');
    if (summary && next) W.setDraft(c,{summary:summary.value,nextStepNotes:next.value});
    var card = root.querySelector('#reviewCard'), evidencePanel = root.querySelector('#reviewEvidence'), q = root.querySelector('#reviewQueue');
    S.panels[c.id] = {card:card ? card.scrollTop : 0,evidence:evidencePanel ? evidencePanel.scrollTop : 0,open:Array.from(root.querySelectorAll('#reviewEvidence details')).map(function(d) { return d.open; })};
    if (q) S.queueScroll = q.scrollTop;
  }
  V.snapshotReview = snapshot;
  function rerender(focus) {
    var root = document.getElementById('view-ai-review'); if (!root) return;
    root.outerHTML = V.renderReview(); V.initReviewEvents();
    var next = document.querySelector(focus || '#reviewCard'); if (next) next.focus({preventScroll:true});
  }
  function clearHighlight(root) { root.querySelectorAll('.is-source-highlighted').forEach(function(n) { n.classList.remove('is-source-highlighted'); }); var b = root.querySelector('[data-resume-source-dismiss]'); if (b) b.hidden = true; }
  function activateEvidence(root, tab) {
    S.evidence = tab;
    root.querySelectorAll('[data-review-tab]').forEach(function(b) { var on = b.dataset.reviewTab === tab; b.setAttribute('aria-selected',String(on)); b.tabIndex = on ? 0 : -1; });
    ['resume','notes','sources'].forEach(function(t) { var p = root.querySelector('#review-evidence-' + t); if (p) p.hidden = t !== tab; });
  }
  V.reviewComparisonHtml = function(records) { return '<nav class="review-compare-picker" aria-label="Comparison candidate">' + records.map(function(c,i) { return '<button type="button" class="secondary-button" data-compare-panel="' + i + '" aria-pressed="' + (i === 0) + '">' + h(c.firstName + ' ' + c.lastName) + '</button>'; }).join('') + '</nav><div class="review-comparison">' + records.map(function(c,i) { return '<section class="review-compare-candidate' + (i === 0 ? ' is-compare-selected' : '') + '" data-compare-index="' + i + '"><h3>' + h(c.firstName + ' ' + c.lastName) + '</h3><p>' + h(c.recordStatus || 'New') + ' · ' + h(W.label(c)) + '</p><article class="candidate-card review-candidate-card">' + sharedCard(c,i) + '</article><h3>Draft summary</h3><p>' + h(c.summary || 'No draft') + '</p><h3>Next step</h3><p>' + h(c.nextStepNotes || 'Not recorded') + '</p><h3>Supporting evidence</h3>' + V._capturePrintResumeHtml(c) + '</section>'; }).join('') + '</div>'; };
  V.initLegacyReviewEvents = function() {
    var root = document.getElementById('view-ai-review'); if (!root) return;
    var c = selected(), saved = c && S.panels[c.id];
    if (saved) { root.querySelector('#reviewCard').scrollTop = saved.card; root.querySelector('#reviewEvidence').scrollTop = saved.evidence; root.querySelectorAll('#reviewEvidence details').forEach(function(d,i) { d.open = !!saved.open[i]; }); }
    root.querySelector('#reviewQueue').scrollTop = S.queueScroll;
    if (V._loadAudioBlobs) V._loadAudioBlobs();
    root.addEventListener('toggle',function(e) { if (!e.target.classList.contains('capture-skills-popover')) return; root.querySelectorAll('[data-capture-skills]').forEach(function(b) { if (b.getAttribute('popovertarget') === e.target.id) b.setAttribute('aria-expanded',String(e.newState === 'open')); }); },true);
    var dialog = root.querySelector('#reviewQueueDialog'), queueNode = root.querySelector('#reviewQueue'), queueParent = queueNode.parentNode, queueNext = queueNode.nextSibling;
    dialog.addEventListener('close',function() { S.queueScroll = queueNode.scrollTop; queueParent.insertBefore(queueNode,queueNext); queueNode.scrollTop = S.queueScroll; var trigger = root.querySelector('[data-review-action="queue-open"]'); if (trigger) trigger.focus(); });
    root.addEventListener('input',function(e) {
      if (e.target.dataset.reviewDraft) {
        var c = selected(), patch = {}; patch[e.target.dataset.reviewDraft] = e.target.value; W.setDraft(c,patch);
        root.querySelector('#reviewSaveState').textContent = W.dirty(c) ? 'Unsaved edits retained for this candidate' : 'Saved on this device';
        root.querySelector('#reviewEvidenceChecked').checked = false;
      }
      if (e.target.id === 'aiSearch') {
        snapshot();
        S.filters.search = e.target.value;
        var caret = e.target.selectionStart;
        rerender('#aiSearch');
        var input = document.getElementById('aiSearch'); if (input && caret !== null) input.setSelectionRange(caret,caret);
      }
    });
    root.addEventListener('change',function(e) {
      if (e.target.id === 'drawerResumeScan') {
        var c = selected(), file = e.target.files && e.target.files[0]; if (!c || !file) return;
        snapshot();
        TIQ.ai.parseAndStoreResume(c,file).then(function() { if (selected() && selected().id === c.id) rerender(); });
        return;
      }
      if (e.target.dataset.reviewFilter && e.target.dataset.reviewFilter !== 'search') { snapshot(); S.filters[e.target.dataset.reviewFilter] = e.target.value; S.selected = ''; S.detail = false; rerender('[data-review-filter="' + e.target.dataset.reviewFilter + '"]'); }
      var id = e.target.dataset.reviewCompare;
      if (id) { var i = V._aiReviewCompare.indexOf(id); if (i >= 0) V._aiReviewCompare.splice(i,1); else if (V._aiReviewCompare.length < 3) V._aiReviewCompare.push(id); else { e.target.checked = false; TIQ.showToast('Compare up to three records.'); } }
    });
    root.addEventListener('keydown',function(e) {
      var tab = e.target.closest('[data-review-tab]'); if (!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      var tabs = Array.from(root.querySelectorAll('[data-review-tab]')), i = tabs.indexOf(tab);
      i = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
      e.preventDefault(); activateEvidence(root,tabs[i].dataset.reviewTab); tabs[i].focus();
    });
    root.addEventListener('click',function(e) {
      var comparePicker = e.target.closest('[data-compare-panel]');
      if (comparePicker) { root.querySelectorAll('[data-compare-panel]').forEach(function(b) { b.setAttribute('aria-pressed',String(b === comparePicker)); }); root.querySelectorAll('[data-compare-index]').forEach(function(p) { p.classList.toggle('is-compare-selected',p.dataset.compareIndex === comparePicker.dataset.comparePanel); }); return; }
      var row = e.target.closest('[data-review-select]'), pile = e.target.closest('[data-pile]'), tab = e.target.closest('[data-review-tab]'), source = e.target.closest('[data-resume-source]'), action = e.target.closest('[data-review-action]');
      if (row) { snapshot(); if (dialog.open) dialog.close(); S.selected = row.dataset.reviewSelect; S.detail = true; rerender(); return; }
      if (pile) { snapshot(); S.filters.status = pile.dataset.pile; S.selected = ''; S.detail = false; if (dialog.open) dialog.close(); rerender(); return; }
      if (tab) { activateEvidence(root,tab.dataset.reviewTab); return; }
      var flag = e.target.closest('button[data-flag-key]');
      if (flag) {
        var guidance = flag.dataset.flagKey + ' is missing. Collect or correct this information in Capture; checking evidence does not clear the flag.';
        var comparison = flag.closest('.review-compare-candidate');
        if (comparison) { TIQ.showToast(guidance); return; }
        activateEvidence(root,flag.dataset.flagTab === 'notes' ? 'notes' : 'resume');
        var panel = root.querySelector('#review-evidence-' + S.evidence), message = root.querySelector('#reviewFlagGuidance');
        if (!message) { message = document.createElement('p'); message.id = 'reviewFlagGuidance'; message.className = 'review-help'; message.setAttribute('role','status'); }
        panel.prepend(message); message.textContent = guidance; message.tabIndex = -1;
        message.scrollIntoView({block:'nearest'}); message.focus({preventScroll:true});
        return;
      }
      if (source) {
        var inCompare = source.closest('#reviewCompareDialog');
        var doc = inCompare ? source.closest('.review-compare-candidate').querySelector('.resume-document') : root.querySelector('#reviewEvidence .resume-document');
        var candidate = inCompare && doc ? TIQ.state.candidates.find(function(c) { return c.id === doc.dataset.candidateId; }) : selected();
        var passage = doc && candidate && doc.dataset.candidateId === candidate.id && doc.dataset.resumeVersion === captureResumeVersion(candidate) && Array.from(doc.querySelectorAll('[data-resume-passage-id]')).find(function(p) { return p.dataset.resumePassageId === source.dataset.resumeSource; });
        if (!inCompare) activateEvidence(root,'resume'); clearHighlight(inCompare || root.querySelector('#reviewEvidence'));
        if (passage) { passage.classList.add('is-source-highlighted'); passage.tabIndex = -1; passage.scrollIntoView({block:'center'}); passage.focus({preventScroll:true}); var dismiss = (inCompare || root.querySelector('#reviewEvidence')).querySelector('[data-resume-source-dismiss]'); if (dismiss) dismiss.hidden = false; }
        else { var status = (inCompare || root.querySelector('#reviewEvidence')).querySelector('.resume-source-status'); if (status) status.hidden = false; TIQ.showToast('Source passage unavailable for the current resume version.'); }
        return;
      }
      if (e.target.closest('[data-resume-source-dismiss]')) { clearHighlight(e.target.closest('section') || root); return; }
      if (!action) return;
      var type = action.dataset.reviewAction, c = selected();
      snapshot();
      try {
        if (type === 'queue-open') { root.querySelector('#reviewQueueDialogBody').appendChild(queueNode); dialog.showModal(); queueNode.scrollTop = S.queueScroll; return; }
        if (type === 'queue-close') { dialog.close(); return; }
        if (type === 'queue-back') { S.detail = false; rerender('[data-review-select="' + S.selected + '"]'); return; }
        if (type === 'clear') { S.filters = {event:'all',status:'all',verification:'all',search:'',func:'all',gap:''}; S.selected = ''; rerender('#aiSearch'); return; }
        if (type === 'previous' || type === 'next') { var records = W.population(S.filters), i = records.findIndex(function(x) { return x.id === S.selected; }); var target = records[i + (type === 'next' ? 1 : -1)]; if (target) S.selected = target.id; rerender(); return; }
        if (type === 'save') W.saveDraft(c);
        if (type === 'approve') { if (!root.querySelector('#reviewEvidenceChecked').checked) throw new Error('Check each draft statement against evidence before approving.'); W.approve(c,[{kind:'recruiter-source-check',resumeVersion:c.parsedResume ? captureResumeVersion(c) : '',checkedAt:TIQ.nowISO()}]); }
        if (type === 'reject') W.reject(c,root.querySelector('#reviewRejectReason').value);
        if (type === 'regenerate') { if (W.dirty(c) && !confirm('Replace this candidate’s unsaved draft with a generated draft?')) return; TIQ.ai.updateCandidateSummary(c); c.summarySource = 'template'; c.summaryEvidence = []; c.verificationReason = ''; W.setDraft(c,{summary:c.summary,nextStepNotes:W.draft(c).nextStepNotes}); W.saveDraft(c); TIQ.addAuditEntry(c,'SUMMARY_REGEN','Draft regenerated; verification required'); TIQ.saveState(); }
        if (type === 'status') W.changeStatus(c,root.querySelector('#reviewStatus').value);
        if (type === 'csv' || type === 'json') { V.downloadHandoff(W.population(S.filters),type,S.filters); return; }
        if (type === 'results-return') { V.restoreReviewContext(false); TIQ.router.navigateTo('analytics'); return; }
        if (type === 'compare-clear') { V._aiReviewCompare = []; rerender(); return; }
        if (type === 'compare') { var records = V._aiReviewCompare.map(function(id) { return TIQ.state.candidates.find(function(c) { return c.id === id; }); }).filter(Boolean); if (records.length < 2) throw new Error('Select two or three records to compare.'); root.querySelector('#reviewCompareBody').innerHTML = V.reviewComparisonHtml(records); root.querySelector('#reviewCompareDialog').showModal(); return; }
        if (type === 'compare-close') { root.querySelector('#reviewCompareDialog').close(); return; }
        rerender();
      } catch (err) { var message = root.querySelector('#reviewMessage'); message.textContent = err.message; message.scrollIntoView({block:'nearest'}); TIQ.showToast(err.message); }
    });
  };
  function finderHtml() {
    var records = W.population(S.filters);
    return '<p id="reviewFinderScope">Current event defaults to Reviewed and Follow-Up. All statuses remain available.</p>' +
      field('Event','reviewEvent','<select id="reviewEvent" data-review-filter="event">' + options(events(),S.filters.event) + '</select>') +
      field('Search candidates','aiSearch','<input id="aiSearch" type="search" data-review-filter="search" value="' + a(S.filters.search) + '">') +
      '<details><summary>Optional filters</summary>' + field('Recruiting status','reviewFilterStatus','<select id="reviewFilterStatus" data-review-filter="status">' + options([{id:'reviewed-follow-up',label:'Reviewed and Follow-Up'},{id:'all',label:'All statuses'}].concat(W.statuses),S.filters.status) + '</select>') +
      field('Verification','reviewVerification','<select id="reviewVerification" data-review-filter="verification">' + options([{id:'all',label:'Any verification'},'Needs verification','Rejected draft','Approved'],S.filters.verification) + '</select>') +
      field('Role interest','reviewFunction','<select id="reviewFunction" data-review-filter="func">' + options([{id:'all',label:'Any role'}].concat(TIQ.CONFIG.functions),S.filters.func) + '</select>') + '</details>' +
      '<p role="status" id="reviewMatchCount">' + records.length + ' matching records</p><div id="reviewFinderRecords">' + finderRows(records) + '</div>' + button('Show all statuses in current event','finder-reset');
  }
  function finderRows(records) {
    return records.map(function(c) { return '<button type="button" class="review-finder-record" data-review-select="' + a(c.id) + '"' + (c.id === S.selected ? ' aria-current="true"' : '') + '><strong>' + h([c.firstName,c.lastName].filter(Boolean).join(' ') || 'Name not captured') + '</strong><span>' + h(c.recordStatus || 'New') + ' · ' + h(W.label(c)) + '</span></button>'; }).join('') || '<p>No matching records. Clear the search, show all statuses, or open Capture.</p>';
  }
  function notesHtml(c) {
    function value(label,text) { return '<section><h3>' + h(label) + '</h3><p class="review-source-text">' + h(Array.isArray(text) ? text.join(', ') || 'Not captured' : text || 'Not captured') + '</p></section>'; }
    return '<p class="review-help">Recruiter-entered observations; not independently verified.</p>' + value('Recruiter notes',c.notes) + value('Areas discussed',c.areasDiscussed) + value('Technical interests',c.technicalInterests) + value('Location preferences',c.workLocations) + value('Candidate questions',c.candidateQuestions) + value('Follow-up questions',c.followUpQuestions) + value('Next steps',c.nextStepNotes) + '<h3>Transcripts — unverified, speakers not identified</h3>' + TIQ.renderTranscriptBlock(c) + (c.audioNotes || []).map(function(n,i) { return '<label>Recording ' + (i + 1) + '<audio controls data-audio-blob-id="' + a(n.blobId) + '"></audio></label>'; }).join('');
  }
  function contactHtml(c) {
    var links=Object.assign({linkedin:'',github:'',portfolio:''},c.parsedResume && c.parsedResume.links || {},c.links || {}), C=TIQ.reviewContact;
    var html='<h3>Contact information</h3><p>Email: '+h(c.email || 'Not captured')+'</p><p>Phone: '+h(c.phone || 'Not captured')+'</p><ul>';
    Object.keys(links).forEach(function(key) { var url=C && C.safeLink(links[key]), label={linkedin:'LinkedIn',github:'GitHub',portfolio:'Portfolio'}[key] || key; html+='<li>'+h(label)+': '+(url ? '<a href="'+a(url)+'" target="_blank" rel="noopener noreferrer">'+h(links[key])+'</a>' : h(links[key] ? 'Invalid link — inspect in Capture' : 'Not captured'))+'</li>'; });
    html+='</ul><p class="review-help">Only captured contact information is shown. Nothing is sent automatically.</p>';
    var d=C ? C.prepare(c) : c.outreachDraft || {}, fields=[['to','Recipient email','email'],['subject','Email subject','text'],['title','Calendar title','text'],['date','Interview date','date'],['time','Start time','time'],['timezone','Timezone (IANA)','text'],['duration','Duration in minutes','number'],['location','Location or meeting link','text']];
    var meetingFields=['date','time','timezone','duration'];
    html+='<section class="review-outreach"><h3>Prepare interview outreach</h3><p>Suggested time—availability not checked. Review every field before handing off.</p><div class="review-contact-fields">'+fields.filter(function(f) { return meetingFields.indexOf(f[0]) < 0; }).map(function(f) { return field(f[1],'contact-'+f[0],'<input id="contact-'+f[0]+'" data-contact-field="'+f[0]+'" type="'+f[2]+'" value="'+a(d[f[0]] == null ? '' : d[f[0]])+'">'); }).join('')+'<div class="review-interview-row">'+fields.filter(function(f) { return meetingFields.indexOf(f[0]) >= 0; }).map(function(f) { return '<div class="review-interview-field">'+field(f[1],'contact-'+f[0],'<input id="contact-'+f[0]+'" data-contact-field="'+f[0]+'" type="'+f[2]+'" value="'+a(d[f[0]] == null ? '' : d[f[0]])+'">')+'</div>'; }).join('')+'</div></div>'+field('Editable message','contact-body','<textarea id="contact-body" rows="7" data-contact-field="body">'+h(d.body || '')+'</textarea>')+'<p>Proposed time is appended to the email draft. Google Calendar opens a prefilled event; the recruiter must review and send it there. No Meet link is created.</p><div class="review-actions">'+button('Open in Google Calendar','contact-calendar')+button('Open email draft','contact-email')+button('Copy message','contact-copy')+'</div><p id="contactFeedback" role="status"></p></section>';
    return html;
  }
  V.reviewComparisonHtml = function(records) {
    var picker='<nav class="review-compare-picker" aria-label="Comparison candidate">'+records.map(function(c,i) { return '<button type="button" class="secondary-button" data-compare-panel="'+i+'" aria-pressed="'+(S.comparison.active===i)+'">'+h([c.firstName,c.lastName].join(' '))+'</button>'; }).join('')+'</nav>';
    return picker+'<div class="review-comparison">'+records.map(function(c,i) {
      return '<section class="review-compare-candidate'+(S.comparison.active===i ? ' is-compare-selected' : '')+'" data-compare-index="'+i+'" data-candidate-id="'+a(c.id)+'"><article class="candidate-card review-candidate-card">'+sharedCard(c,i)+'</article><h3>Recruiter recap</h3><p>'+caption(c)+'</p><p class="review-source-text">'+h(c.summary || 'Not captured')+'</p><h3>Interests / conversation</h3><p>'+h(c.function || 'Role not captured')+'</p><p>'+h((c.technicalInterests || []).join(', ') || 'Technical interests not captured')+'</p><p class="review-source-text">'+h(c.notes || 'Notes not captured')+'</p><h3>Status / next step</h3><p>'+h(c.recordStatus || 'New')+'</p><p>'+h(c.nextStepNotes || 'Not captured')+'</p><h3>Supporting evidence</h3><button type="button" class="secondary-button" data-comparison-evidence="resume">Resume</button><button type="button" class="secondary-button" data-comparison-evidence="notes">Notes</button></section>';
    }).join('')+'</div>';
  };
  function comparePickerHtml() {
    var records=W.population({event:TIQ.currentEventId(),status:'all'}), ids=S.comparison.ids;
    return '<p>All statuses in the current event. Choose two distinct candidates.</p>'+[0,1].map(function(i) { return field('Candidate '+(i+1),'compare-candidate-'+i,'<input type="search" data-comparison-search="'+i+'" aria-label="Search candidate '+(i+1)+'"><select id="compare-candidate-'+i+'" data-comparison-select="'+i+'">'+options([{id:'',label:'Select candidate'}].concat(records.map(function(c) { return {id:c.id,label:[c.firstName,c.lastName].join(' ')+' · '+(c.recordStatus || 'New')}; })),ids[i] || '')+'</select>'); }).join('')+button('Compare cards','compare-show');
  }
  V.renderReview = V.renderAIReview = function() {
    var records = W.population(S.filters), c = selected();
    if (!c && records.length) { c = records[0]; S.selected = c.id; }
    var d = c && W.draft(c), editing = c && !!S.editing[c.id], i = c ? records.findIndex(function(x) { return x.id === c.id; }) : -1;
    var content = c ? '<div class="review-workspace"><section class="review-recap-panel"><div id="reviewCard" class="review-panel-scroll" tabindex="-1"><article class="candidate-card review-candidate-card review-identity">'+sharedCard(c)+'</article><p>'+h(c.email || 'Email not captured')+(c.phone ? ' · '+h(c.phone) : '')+'</p><h3>Recruiter recap</h3><p>' + caption(c) + '</p><p class="review-help">Approval verifies the recap, not a recruiting decision.</p>' +
      '<p class="review-source-text"' + (editing ? ' hidden' : '') + '>' + h(d.summary || 'No recap captured. Enter a factual recap using the supplied evidence.') + '</p><div' + (!editing ? ' hidden' : '') + '>' + field('Edit recruiter recap','reviewSummary','<textarea id="reviewSummary" rows="7" data-review-draft="summary">' + h(d.summary) + '</textarea>') + button('Save changes','save') + button('Cancel edits','cancel-edit') + '</div>' +
      '<p id="reviewSaveState" role="status">' + (W.dirty(c) ? 'Unsaved edits retained for this candidate' : 'Saved on this device') + '</p>' + button('Edit recap','edit') + '<label class="review-check"><input type="checkbox" id="reviewEvidenceChecked"> I checked every statement against the supplied evidence</label><button type="button" class="primary-button small-button" data-review-action="approve">Approve recap</button>' +
       '<p class="review-help">Missing information is a request for clarification, not a hiring gate. Optional phone, GPA and work authorization are not required for approval.</p><details open id="reviewNextSteps"><summary>Choose a next step</summary>' + field('Recruiting status','reviewStatus','<select id="reviewStatus">' + options(W.statuses,c.recordStatus || 'New') + '</select>') + button('Apply status','status') + field('Next-step notes','reviewNextStep','<textarea id="reviewNextStep" rows="3" data-review-draft="nextStepNotes">' + h(d.nextStepNotes) + '</textarea>') + button('Save next steps','save-next') + button('Open Contact','outreach-open')+'<p class="review-help">Preparing outreach does not send a message or book an interview.</p></details></div></section>' +
       '<aside class="review-reference-panel"><div class="review-reference-tools"><div class="review-evidence-tabs" role="tablist" aria-label="Candidate reference">' + ['resume','notes','contact'].map(function(t) { return '<button type="button" role="tab" id="review-tab-' + t + '" aria-controls="review-evidence-' + t + '" data-review-tab="' + t + '" aria-selected="' + (S.evidence === t) + '" tabindex="' + (S.evidence === t ? 0 : -1) + '">' + h(t.charAt(0).toUpperCase()+t.slice(1)) + '</button>'; }).join('') + '</div>'+button('Compare','compare-open')+'</div><div id="reviewEvidence" class="review-panel-scroll">' +
      '<section id="review-evidence-resume" role="tabpanel" aria-labelledby="review-tab-resume"' + (S.evidence !== 'resume' ? ' hidden' : '') + '><h3>Extracted resume text</h3><p class="review-help">Extraction is not the original PDF. Original attachments remain available in Capture when attached on this device.</p>' + V._capturePrintResumeHtml(c) + '</section>' +
       '<section id="review-evidence-notes" role="tabpanel" aria-labelledby="review-tab-notes"' + (S.evidence !== 'notes' ? ' hidden' : '') + '>' + notesHtml(c) + '</section><section id="review-evidence-contact" role="tabpanel" aria-labelledby="review-tab-contact"'+(S.evidence!=='contact' ? ' hidden' : '')+'>'+contactHtml(c)+'</section></div></aside></div>' : '<section class="review-empty"><h2>No matching records to review</h2><p>Current event defaults to Reviewed and Follow-Up. Find candidate offers all statuses, including New.</p>' + button('Find candidate','queue-open') + '<button type="button" class="secondary-button" data-go="capture">Open Capture</button></section>';
    content='<p class="review-sequence">Inspect card and evidence → Edit / approve recap → Choose a next step → Prepare outreach</p>'+content+'<dialog id="reviewCompareDialog" class="review-compare-dialog" aria-labelledby="reviewCompareTitle"><header><h2 id="reviewCompareTitle">Compare candidates</h2>'+button('Close comparison','compare-close')+'</header><p>No score, winner or automated recommendation.</p><p id="compareFeedback" role="status"></p><div id="reviewCompareBody"></div></dialog>';
    return '<div class="view review-frame review-simplified" id="view-ai-review"><header class="review-header"><h2>Review</h2><div class="review-actions">' + button('Find candidate','queue-open') + '<details class="review-more"><summary>More</summary><p>Verification history and draft rejection</p>' + (c ? '<p class="review-help">' + h(c.summarySource === 'recruiter' ? 'Recruiter-authored recap; earlier machine citations are not inherited.' : 'Template or legacy recap; check its evidence before approval.') + '</p>' + TIQ.renderCitationList(c.traceability || []) + '<details><summary>Verification history</summary>' + (c.verificationHistory || []).map(function(v) { return '<p>' + h(v.kind) + ' · ' + h(v.timestamp || 'Time not recorded') + ' · ' + h(v.approverId || v.reviewerId || '') + '</p><blockquote>' + h(v.summary || v.reason || '') + '</blockquote>'; }).join('') + '</details>' + field('Reason for rejecting this draft','reviewRejectReason','<textarea id="reviewRejectReason" rows="2"></textarea>') + button('Reject draft','reject') + '<p>Rejecting a draft never rejects the candidate.</p>' : '<p>Open a record to review its verification.</p>') + '</details></div></header><p id="reviewMessage" role="status"></p>' + content + '<footer class="review-navigation">' + button('Previous','previous',i <= 0 ? ' disabled' : '') + '<span>' + h(c && i < 0 ? 'Record no longer matches the finder; kept open until you navigate.' : c ? (i+1) + ' of ' + records.length + ' matching records' : 'No matching records') + '</span>' + button('Next','next',!records.length || i >= records.length-1 ? ' disabled' : '') + '</footer><dialog id="reviewQueueDialog" class="review-queue-dialog" aria-labelledby="reviewFinderTitle"><h2 id="reviewFinderTitle">Find candidate</h2>' + button('Close finder','queue-close') + '<div id="reviewQueueDialogBody">' + finderHtml() + '</div></dialog></div>';
  };
  V.snapshotReview = function() {
    var root = document.getElementById('view-ai-review'), c = selected(); if (!root || !c) return;
    var card = root.querySelector('#reviewCard'), ref = root.querySelector('#reviewEvidence');
    S.panels[c.id] = {card:card.scrollTop,evidence:ref.scrollTop,tab:S.evidence,open:Array.from(card.querySelectorAll('details')).map(function(d) { return d.open; })};
  };
  V.initReviewEvents = V.initAIReviewEvents = function() {
    var root = document.getElementById('view-ai-review'); if (!root) return;
    var c = selected(), saved = c && S.panels[c.id], dialog = root.querySelector('#reviewQueueDialog');
    if (saved && root.querySelector('#reviewCard')) { root.querySelector('#reviewCard').scrollTop = saved.card; root.querySelector('#reviewEvidence').scrollTop = saved.evidence; root.querySelectorAll('#reviewCard details').forEach(function(d,i) { d.open = !!saved.open[i]; }); }
    var scope = document.createElement('p'); scope.className = 'review-help review-scope';
    function describeScope() { scope.textContent = (S.filters.event === TIQ.currentEventId() ? 'Current event: ' + TIQ.eventInfo().name : S.filters.event === 'all' ? 'All local events' : S.filters.event) + ' · ' + (S.filters.status === 'reviewed-follow-up' ? 'Reviewed and Follow-Up' : S.filters.status === 'all' ? 'All statuses' : S.filters.status) + (S.filters.search ? ' · Search: ' + S.filters.search : ''); }
    describeScope(); root.querySelector('.review-header').after(scope);
    if (V._loadAudioBlobs) V._loadAudioBlobs();
    dialog.addEventListener('close',function() {
      S.queueScroll = dialog.scrollTop; describeScope();
      var records = W.population(S.filters), i = records.findIndex(function(x) { return x.id === S.selected; });
      root.querySelector('.review-navigation > span').textContent = selected() && i < 0 ? 'Record no longer matches the finder; kept open until you navigate.' : selected() ? (i+1) + ' of ' + records.length + ' matching records' : 'No matching records';
      root.querySelector('[data-review-action="previous"]').disabled = i <= 0;
      root.querySelector('[data-review-action="next"]').disabled = !records.length || i >= records.length-1;
      root.querySelector('[data-review-action="queue-open"]').focus();
    });
    function refreshFinder() { var records = W.population(S.filters); root.querySelector('#reviewFinderRecords').innerHTML = finderRows(records); root.querySelector('#reviewMatchCount').textContent = records.length + ' matching records'; }
    function tabs(tab) { S.evidence = tab; root.querySelectorAll('[data-review-tab]').forEach(function(b) { var on = b.dataset.reviewTab === tab; b.setAttribute('aria-selected',String(on)); b.tabIndex = on ? 0 : -1; root.querySelector('#review-evidence-' + b.dataset.reviewTab).hidden = !on; }); }
    var compare=root.querySelector('#reviewCompareDialog'), body=root.querySelector('#reviewCompareBody');
    function comparisonRecords() { var records=W.population({event:TIQ.currentEventId(),status:'all'}); return S.comparison.ids.map(function(id) { return records.find(function(x) { return x.id===id; }); }).filter(Boolean); }
    function comparisonCards() { var records=comparisonRecords(); S.comparison.versions={}; records.forEach(function(c) { S.comparison.versions[c.id]=c.parsedResume ? captureResumeVersion(c) : ''; }); body.innerHTML=button('Change candidates','compare-change')+V.reviewComparisonHtml(records); body.querySelectorAll('[data-compare-index]').forEach(function(p,i) { p.scrollTop=S.comparison.scroll[i] || 0; }); }
    function comparisonEvidence(candidate,kind,source) {
      body.querySelectorAll('[data-compare-index]').forEach(function(p,i) { S.comparison.scroll[i]=p.scrollTop; });
      body.innerHTML=button('Back to comparison','compare-back')+'<h3>'+h([candidate.firstName,candidate.lastName].join(' '))+' — '+h(kind)+'</h3><div class="review-comparison-evidence">'+(kind==='notes' ? notesHtml(candidate) : V._capturePrintResumeHtml(candidate))+'</div>';
      if (source) { var doc=body.querySelector('.resume-document'), passage=doc && doc.dataset.resumeVersion===source.version && source.version===captureResumeVersion(candidate) && Array.from(doc.querySelectorAll('[data-resume-passage-id]')).find(function(p) { return p.dataset.resumePassageId===source.id; }); if (passage) { passage.classList.add('is-source-highlighted'); passage.tabIndex=-1; passage.scrollIntoView({block:'center'}); passage.focus(); } else root.querySelector('#compareFeedback').textContent='Source passage unavailable for the current resume version.'; }
      else body.querySelector('[data-review-action="compare-back"]').focus();
      if (V._loadAudioBlobs) V._loadAudioBlobs();
    }
    compare.addEventListener('close',function() { var trigger=root.querySelector('[data-review-action="compare-open"]'); if (trigger) trigger.focus({preventScroll:true}); });
    root.addEventListener('toggle',function(e) { if (!e.target.classList.contains('capture-skills-popover')) return; root.querySelectorAll('[data-capture-skills]').forEach(function(b) { if (b.getAttribute('popovertarget')===e.target.id) b.setAttribute('aria-expanded',String(e.newState==='open')); }); },true);
    root.addEventListener('input',function(e) {
      if (e.target.dataset.contactField && selected()) { selected().outreachDraft[e.target.dataset.contactField]=e.target.value; TIQ.saveState(); }
      if (e.target.dataset.comparisonSearch !== undefined) { var i=e.target.dataset.comparisonSearch, select=root.querySelector('#compare-candidate-'+i), text=e.target.value.toLowerCase(); Array.from(select.options).forEach(function(o) { o.hidden=!!o.value && o.value!==select.value && !o.textContent.toLowerCase().includes(text); }); }
    });
    root.addEventListener('change',function(e) { if (e.target.dataset.comparisonSelect !== undefined) S.comparison.ids[Number(e.target.dataset.comparisonSelect)]=e.target.value; });
    root.addEventListener('click',function(e) {
      var action=e.target.closest('[data-review-action]'), type=action && action.dataset.reviewAction, candidate=selected(), inCompare=e.target.closest('#reviewCompareDialog');
      if (inCompare) {
        e.stopImmediatePropagation();
        var panel=e.target.closest('[data-compare-index]'), source=e.target.closest('[data-resume-source]'), evidence=e.target.closest('[data-comparison-evidence]'), picker=e.target.closest('[data-compare-panel]');
        if (picker) { S.comparison.active=Number(picker.dataset.comparePanel); body.querySelectorAll('[data-compare-index]').forEach(function(p) { p.classList.toggle('is-compare-selected',Number(p.dataset.compareIndex)===S.comparison.active); }); body.querySelectorAll('[data-compare-panel]').forEach(function(b) { b.setAttribute('aria-pressed',String(b===picker)); }); return; }
        if ((source || evidence) && panel) { var x=TIQ.state.candidates.find(function(c) { return c.id===panel.dataset.candidateId; }); if (x) comparisonEvidence(x,source ? 'resume' : evidence.dataset.comparisonEvidence,source ? {id:source.dataset.resumeSource,version:S.comparison.versions[x.id]} : null); return; }
        if (e.target.closest('[data-flag-key]')) { root.querySelector('#compareFeedback').textContent='Not captured. Collect or correct information in Capture; optional fields are not hiring gates.'; return; }
        if (type==='compare-close') compare.close();
        if (type==='compare-change') { body.innerHTML=comparePickerHtml(); body.querySelector('input').focus(); }
        if (type==='compare-back') { root.querySelector('#compareFeedback').textContent=''; comparisonCards(); body.querySelector('[data-review-action="compare-change"]').focus(); }
        if (type==='compare-show') { var records=comparisonRecords(); if (records.length!==2 || records[0].id===records[1].id) { root.querySelector('#compareFeedback').textContent='Choose two distinct candidates.'; return; } S.comparison.scroll=[]; root.querySelector('#compareFeedback').textContent=''; comparisonCards(); body.querySelector('[data-review-action="compare-change"]').focus(); }
        return;
      }
      if (!type || !/^(compare-open|outreach-|contact-)/.test(type)) return;
      e.stopImmediatePropagation(); V.snapshotReview();
      try {
        if (type==='compare-open') { var eligible=W.population({event:TIQ.currentEventId(),status:'all'}).some(function(c) { return c.id===candidate.id; }); S.comparison.ids=[eligible ? candidate.id : '','']; S.comparison.active=0; S.comparison.scroll=[]; body.innerHTML=comparePickerHtml(); compare.showModal(); return; }
        if (type==='outreach-open') { S.evidence='contact'; rerender('#contact-to'); return; }
        var C=TIQ.reviewContact, d=candidate.outreachDraft, feedback=root.querySelector('#contactFeedback');
        if (type==='contact-calendar' || type==='contact-email') { var url=type==='contact-calendar' ? C.calendar(candidate,d) : C.email(candidate,d); var link=document.createElement('a'); link.href=url; link.target='_blank'; link.rel='noopener noreferrer'; link.click(); C.record(candidate,'prepared',type==='contact-calendar' ? 'calendar' : 'email'); feedback.textContent='Handed off for review. Sending, delivery and booking are not confirmed.'; }
        if (type==='contact-copy') {
          var message=C.message(d);
          function manualCopy() { feedback.innerHTML='<p>Clipboard unavailable. Select and copy the complete message manually.</p><label for="contactManualCopy">Message and proposed schedule</label><textarea id="contactManualCopy" readonly rows="7">'+h(message)+'</textarea>'; var area=feedback.querySelector('textarea'); area.focus(); area.select(); }
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(message).then(function() { feedback.textContent='Message copied. Nothing sent.'; }).catch(manualCopy); else manualCopy();
        }
      } catch (err) { var feedback=root.querySelector('#contactFeedback') || root.querySelector('#reviewMessage'); feedback.textContent=err.message; }
    });
    root.addEventListener('input',function(e) {
      if (e.target.dataset.reviewDraft && selected()) { var patch = {}; patch[e.target.dataset.reviewDraft] = e.target.value; W.setDraft(selected(),patch); root.querySelector('#reviewSaveState').textContent = W.dirty(selected()) ? 'Unsaved edits retained for this candidate' : 'Saved on this device'; root.querySelector('#reviewEvidenceChecked').checked = false; }
      if (e.target.dataset.reviewFilter === 'search') { S.filters.search = e.target.value; refreshFinder(); }
    });
    root.addEventListener('change',function(e) { if (e.target.dataset.reviewFilter) { S.filters[e.target.dataset.reviewFilter] = e.target.value; refreshFinder(); } });
    root.addEventListener('keydown',function(e) { var tab = e.target.closest('[data-review-tab]'); if (!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return; var list = Array.from(root.querySelectorAll('[data-review-tab]')), i = list.indexOf(tab); i = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3; e.preventDefault(); tabs(list[i].dataset.reviewTab); list[i].focus(); });
    root.addEventListener('click',function(e) {
      var row = e.target.closest('[data-review-select]'), tab = e.target.closest('[data-review-tab]'), source = e.target.closest('[data-resume-source]'), action = e.target.closest('[data-review-action]');
      if (row) { V.snapshotReview(); S.queueScroll = dialog.scrollTop; dialog.close(); S.selected = row.dataset.reviewSelect; S.evidence = S.panels[S.selected] ? S.panels[S.selected].tab : 'resume'; rerender(); return; }
      if (tab) { tabs(tab.dataset.reviewTab); return; }
      if (source) {
        var candidate = selected(), doc = root.querySelector('#reviewEvidence .resume-document');
        var passage = doc && candidate && doc.dataset.candidateId === candidate.id && doc.dataset.resumeVersion === captureResumeVersion(candidate) && Array.from(doc.querySelectorAll('[data-resume-passage-id]')).find(function(p) { return p.dataset.resumePassageId === source.dataset.resumeSource; });
        tabs('resume'); clearHighlight(root.querySelector('#reviewEvidence'));
        if (passage) { passage.classList.add('is-source-highlighted'); passage.tabIndex = -1; passage.scrollIntoView({block:'center'}); passage.focus({preventScroll:true}); var dismiss = root.querySelector('[data-resume-source-dismiss]'); if (dismiss) dismiss.hidden = false; }
        else { root.querySelector('#reviewMessage').textContent = 'Source passage unavailable for the current resume version.'; }
        return;
      }
      if (e.target.closest('[data-resume-source-dismiss]')) { clearHighlight(root.querySelector('#reviewEvidence')); return; }
      var flag = e.target.closest('[data-flag-key]'); if (flag) { tabs(flag.dataset.flagTab === 'notes' ? 'notes' : 'resume'); root.querySelector('#reviewMessage').textContent = flag.dataset.flagKey + ' is not captured. Correct it in Capture; optional information is not a hiring gate.'; return; }
      if (!action) return;
      var type = action.dataset.reviewAction, c = selected(); V.snapshotReview();
      try {
        if (type === 'queue-open') { dialog.showModal(); dialog.scrollTop = S.queueScroll; return; }
        if (type === 'queue-close') { dialog.close(); rerender('[data-review-action="queue-open"]'); return; }
        if (type === 'finder-reset') { S.filters = {event:TIQ.currentEventId(),status:'all',verification:'all',search:'',func:'all',gap:''}; root.querySelector('#reviewQueueDialogBody').innerHTML = finderHtml(); root.querySelector('#aiSearch').focus(); return; }
        if (type === 'previous' || type === 'next') { var records = W.population(S.filters), i = records.findIndex(function(x) { return x.id === S.selected; }), target = records[i + (type === 'next' ? 1 : -1)]; if (target) { S.selected = target.id; S.evidence = S.panels[S.selected] ? S.panels[S.selected].tab : 'resume'; } }
        if (type === 'edit') S.editing[c.id] = true;
        if (type === 'cancel-edit') { W.cancelDraft(c); S.editing[c.id] = false; }
        if (type === 'save-next' && W.draft(c).summary !== c.summary) throw new Error('Save or cancel your recap edits before saving next steps.');
        if (type === 'save' || type === 'save-next') { W.saveDraft(c); S.editing[c.id] = false; }
        if (type === 'approve') { if (W.dirty(c)) throw new Error('Save or cancel your edits before approving the recap.'); if (!root.querySelector('#reviewEvidenceChecked').checked) throw new Error('Check every statement against evidence before approving.'); W.approve(c,[{kind:'recruiter-source-check',resumeVersion:c.parsedResume ? captureResumeVersion(c) : '',checkedAt:TIQ.nowISO()}]); }
        if (type === 'reject') { if (W.dirty(c)) throw new Error('Save or cancel your edits before rejecting the draft.'); W.reject(c,root.querySelector('#reviewRejectReason').value); }
        if (type === 'status') W.changeStatus(c,root.querySelector('#reviewStatus').value);
        rerender(type === 'edit' ? '#reviewSummary' : '#reviewCard');
      } catch (err) { root.querySelector('#reviewMessage').textContent = err.message; TIQ.showToast(err.message); }
    });
  };
  V.downloadHandoff = function(records, format, scope) {
    var rows = W.handoff(records);
    if (format === 'json') TIQ.downloadText('talentiq-handoff.json',JSON.stringify({kind:'talentiq-handoff',version:1,exportedAt:TIQ.nowISO(),scope:scope,records:rows},null,2));
    else TIQ.downloadText('talentiq-handoff.csv',TIQ.csvRows(rows),'text/csv');
  };
  TIQ.csvRows = function(rows) {
    var keys = rows.length ? Object.keys(rows[0]) : ['id','verification'];
    function cell(v) { var text = typeof v === 'object' ? JSON.stringify(v) : String(v == null ? '' : v); if (/^[\s]*[=+@-]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g,'""') + '"'; }
    return [keys.map(cell).join(',')].concat(rows.map(function(r) { return keys.map(function(k) { return cell(r[k]); }).join(','); })).join('\r\n');
  };
  V.openResultsReview = function(filter, navigate) {
    snapshot();
    if (!S.previous) S.previous = {filters:Object.assign({},S.filters),selected:S.selected,detail:S.detail,evidence:S.evidence,queueScroll:S.queueScroll};
    S.filters = Object.assign({event:V._resultsEvent || 'all',status:'all',verification:'all',search:'',func:'all',gap:''},filter); S.selected = ''; S.detail = false;
    if (navigate !== false) TIQ.router.navigateTo('review');
  };
  V.restoreReviewContext = function(navigate) { if (S.previous) { var saved = S.previous; Object.assign(S,saved); S.previous = null; } if (navigate !== false) TIQ.router.navigateTo('review'); };
  // Retained Event Results must be explicitly enabled; loading Review alone
  // never installs these retired renderers or routes.
  V.enableRetainedResults = function() {
  V.renderAnalytics = V.renderOverview = function() {
    var scope = V._resultsEvent || 'all', records = TIQ.eventRecords(scope), coverage = W.requiredCoverage(records), counts = W.pileCounts({event:scope});
    var pending = records.filter(function(c) { return W.label(c) === 'Needs verification'; }).length, rejected = records.filter(function(c) { return W.label(c) === 'Rejected draft'; }).length;
    function drill(text, count, kind, value) { return '<button type="button" class="results-drill" data-results-kind="' + kind + '" data-results-value="' + a(value) + '"><span>' + h(text) + '</span><strong>' + count + '</strong></button>'; }
    function section(title, body) { return '<section class="results-section"><h2>' + h(title) + '</h2>' + body + '</section>'; }
    return '<div class="view purpose-results" id="view-overview"><header class="review-header"><div><h2>Event Results</h2><p>What we captured, what needs attention, and what to hand off.</p></div>' + field('Event scope','resultsEvent','<select id="resultsEvent">' + options(events(),scope) + '</select>') + '</header><p>' + records.length + ' local records · all stored dates. ' + records.filter(function(c) { return c.isDemo; }).length + ' labeled synthetic records. No cross-device sync.</p>' +
      '<div class="results-metrics">' + [{label:'Records',n:records.length},{label:'Needs verification',n:pending,kind:'verification',value:'Needs verification'},{label:'Follow-Up requests',n:counts['Follow-Up'],kind:'status',value:'Follow-Up'},{label:'Interview requests',n:counts['Interview Requested'],kind:'status',value:'Interview Requested'}].map(function(m) { return '<article class="result-metric"><h2>' + h(m.label) + '</h2><strong class="result-value">' + m.n + '</strong>' + (m.kind ? drill('Open in Review',m.n,m.kind,m.value) : '<p>Selected event population</p>') + '</article>'; }).join('') + '</div>' +
      (!records.length ? '<p>No records in this event. Capture or import a record to begin.</p>' : '') + '<div class="purpose-results-grid">' +
      section('Work remaining',drill('Needs verification',pending,'verification','Needs verification') + drill('Rejected drafts',rejected,'verification','Rejected draft') + '<p>Verification does not move candidates between recruiting piles.</p>') +
      section('Recruiting status / piles',W.statuses.map(function(s) { return drill(s,counts[s],'status',s); }).join('')) +
      section('Required-field coverage','<p><strong>' + coverage.present + ' / ' + coverage.expected + '</strong> present / expected checks' + (coverage.percent === null ? ' · Not measured' : ' · ' + coverage.percent + '%') + '</p><p>Intake-required definition: first name, last name, valid email. This is the app’s current definition, not a sponsor-approved study rubric. Optional GPA, phone, work authorization, and processing state are excluded.</p>' + coverage.fields.map(function(k) { return drill('Missing ' + k,records.filter(function(c) { return W.requiredCoverage([c]).fields.includes(k) && (k === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email || '') : !String(c[k] || '').trim()); }).length,'gap',k); }).join('')) +
      section('Optional gaps / processing issues','<p>Requests for information, not candidate deficiencies or quality scores.</p>' + TIQ.analytics.missingFlagBreakdown(records).map(function(g) { return drill(g.flag,g.count,'gap',g.flag); }).join('')) +
      section('Recent recorded activity',TIQ.analytics.activityFeed(records).map(function(f) { return '<p><strong>' + h(f.recruiter) + '</strong> · ' + h(f.action) + '<br>' + h(f.target) + ' · ' + h(f.time) + '</p>'; }).join('') + '<p>Latest five recorded entries; not measured task durations or recruiter performance.</p>') +
      section('Manual handoff','<p>Exports include contact, recruiting status, verification state, approver, and next-step notes. Unsaved edits are not exported. No outreach, booking, or ATS update occurs.</p><div class="review-actions"><button class="primary-button" id="resultsExportCsv">Download CSV</button><button class="secondary-button" id="resultsExport">Download JSON</button></div>') + '</div>' + TIQ.howItWorksHtml() + '<button class="secondary-button" id="deleteEventData"' + (scope === 'all' ? ' disabled' : '') + '>Delete this event’s local data</button></div>';
  };
  V.initAnalyticsEvents = function() {
    var root = document.getElementById('view-overview'); if (!root) return;
    root.querySelector('#resultsEvent').onchange = function(e) { V._resultsEvent = e.target.value; TIQ.router.navigateTo('analytics'); };
    root.querySelectorAll('[data-results-kind]').forEach(function(b) { b.onclick = function() { var filter = {}; filter[b.dataset.resultsKind] = b.dataset.resultsValue; V.openResultsReview(filter); }; });
    root.querySelector('#resultsExport').onclick = function() { V.downloadHandoff(TIQ.eventRecords(V._resultsEvent || 'all'),'json',{event:V._resultsEvent || 'all'}); };
    root.querySelector('#resultsExportCsv').onclick = function() { V.downloadHandoff(TIQ.eventRecords(V._resultsEvent || 'all'),'csv',{event:V._resultsEvent || 'all'}); };
    root.querySelector('#deleteEventData').onclick = function() { var id = V._resultsEvent; if (!id || id === 'all' || !confirm('Delete all local records and linked audio for this event? Shared copies remain. This cannot be undone.')) return; TIQ.deleteEventData(id).then(function() { TIQ.router.navigateTo('analytics'); }).catch(function(err) { TIQ.showToast(err.message); }); };
  };
  };
  if (window.addEventListener) window.addEventListener('beforeunload',function(e) { V.snapshotReview(); if (W.hasUnsavedDrafts()) { e.preventDefault(); e.returnValue = ''; } });
})();
