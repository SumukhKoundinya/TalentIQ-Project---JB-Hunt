/* ============================================
   TalentIQ — View Renderers
   ============================================ */
window.TIQ = window.TIQ || {};

/* ---- Overview View ---- */
TIQ.views = TIQ.views || {};
TIQ.views.renderAccomplishments = function(c, presentationLabel) {
  var accs = c.parsedResume || (c.audioNotes || []).some(function(n) { return n.transcript; }) ? TIQ.generateAccomplishments(c) : c.accomplishments || TIQ.generateAccomplishments(c);
  var h = TIQ.escapeHtml;
  function entry(a) {
    return '<article class="highlight-item"><div class="highlight-facet">' + h(a.facet || 'Recorded statement') + '</div><strong>' + h(a.contextLabel || 'Role / project context not available') + '</strong><small class="highlight-context">' + h(a.contextDetail || (a.createdAt ? 'Recorded ' + new Date(a.createdAt).toLocaleString() : 'Timeframe not available')) + '</small><details class="highlight-quote"><summary><span>' + h(a.text) + '</span><small>Expand full evidence</small></summary><blockquote>' + h(a.evidenceText || a.text) + '</blockquote></details><span class="source-tag source-tag--' + TIQ.escapeAttr(a.source || 'conversation') + '">source: ' + h(a.source || 'recorded note') + ' · ' + h(a.verification || 'Legacy statement; verify source') + '</span>' + (a.noteId ? '<small>Recording reference: ' + h(String(a.noteId)) + ' · speaker not established</small>' : '') + '</article>';
  }
  var unsurfaced = ((c.parsedResume && c.parsedResume.experience) || []).filter(function(e) { return e.description && !accs.some(function(a) { return a.contextLabel && a.contextLabel.indexOf(e.title || e.company) !== -1; }); }).length;
  return '<section class="accomplishments"><h3 class="highlights-title">' + TIQ.escapeHtml(presentationLabel || 'Grounded Highlights · Accomplishments') + '</h3><p class="highlight-help">Quoted evidence from the resume or recorded conversation. Context is extracted when available; transcript claims need verification.</p>' +
    (accs.length ? accs.slice(0, 3).map(entry).join('') + (accs.length > 3 ? '<details class="more-highlights"><summary>Show ' + (accs.length - 3) + ' more statements</summary>' + accs.slice(3).map(entry).join('') + '</details>' : '') : '<p>No specific statements surfaced. Attach a resume or capture a detailed note.</p>') +
    (unsurfaced ? '<p>' + unsurfaced + ' experience entries have descriptions without a surfaced statement. Review the original text.</p>' : '') + '</section>';
};
TIQ.views.renderFieldProvenance = function(c) {
  var fields = {firstName:'First name',lastName:'Last name',email:'Email',phone:'Phone',university:'University',major:'Major',degreeProgram:'Program',graduationDate:'Graduation',gpa:'GPA',workAuthorization:'Work authorization',workLocations:'Location preferences',skills:'Skills',notes:'Notes'};
  return '<details class="field-provenance"><summary>Field values &amp; origins</summary><dl>' + Object.keys(fields).map(function(k) {
    var val = c[k], present = Array.isArray(val) ? val.length : !!val;
    var source = c.provenance && c.provenance[k];
    var label = !present ? 'Missing' : source === 'resume' ? 'From resume' : source === 'intake' ? 'Self-reported intake' : source === 'form' ? 'Entered in form' : source === 'conversation' ? 'Unverified transcript' : 'Origin not recorded';
    return '<div><dt>' + TIQ.escapeHtml(fields[k]) + '</dt><dd>' + TIQ.escapeHtml(Array.isArray(val) ? val.join(', ') : val || '—') + ' <span class="source-tag">' + label + '</span></dd></div>';
  }).join('') + '</dl></details>';
};
TIQ.views.renderOverview = function() {
  var scope = TIQ.views._resultsEvent || 'all';
  var cands = TIQ.eventRecords(scope);
  var A = TIQ.analytics;
  var h = TIQ.escapeHtml, ids = [TIQ.currentEventId()];
  TIQ.state.candidates.forEach(function(c) { if (c.eventId && ids.indexOf(c.eventId) === -1) ids.push(c.eventId); });
  var caption = cands.length + ' local records · ' + (scope === 'all' ? 'all events, including unassigned' : scope === 'unassigned' ? 'unassigned event' : scope) + ' · all stored dates';
  var feed = A.activityFeed(cands);
  return '<div class="view" id="view-overview">' +
    '<p class="results-intro">Operational information only. These measures describe records, not candidate quality.</p>' +
    '<label class="results-scope"><span>Record scope</span><select id="resultsEvent" aria-label="Choose which event records to show">' + [{id:'all',label:'All records on this device'},{id:'unassigned',label:'Unassigned / legacy records'}].concat(ids.map(function(id) { return {id:id,label:id === TIQ.currentEventId() ? TIQ.eventInfo().name + ' (current event)' : id}; })).map(function(e) { return '<option value="' + TIQ.escapeAttr(e.id) + '"' + (scope === e.id ? ' selected' : '') + '>' + h(e.label) + '</option>'; }).join('') + '</select></label>' +
    (!cands.length ? '<div class="results-empty"><h2>No records in this population</h2><p>Capture someone at the booth, import a submission, or load sample events to explore the workflow.</p><button class="primary-button" data-go="capture">Start capturing</button> <button class="secondary-button" data-demo-load>Load sample events</button></div>' : '') +
    '<div class="results-metrics">' + A.metricDescriptors(cands).map(function(d) {
      return '<article class="result-metric" data-metric="' + TIQ.escapeAttr(d.key) + '"><h2>' + h(d.label) + '</h2><strong class="result-value">' + (d.value === null ? '—' : d.value + (d.unit === '%' ? '%' : '')) + '</strong><p>' + d.numerator + ' / ' + d.denominator + (d.unit === '%' ? ' tracked checks' : ' records') + '</p><details><summary>Definition &amp; next action</summary><p>' + h(d.definition) + '</p><p>' + h(d.whyItMatters) + '</p><p>' + h(d.caveat) + '</p><small>' + h(d.source) + '</small></details></article>';
    }).join('') + '</div>' +
    '<p class="results-scope-note">Showing ' + h(caption) + '.</p>' +
    TIQ.howItWorksHtml() +
    '<div class="overview-grid">' +
      '<section class="overview-card missing-breakdown"><h2>What to ask next</h2><p>Blue bars show the number of records missing each item. Select a row to review those records.</p>' + A.missingFlagBreakdown(cands).map(function(f) { return '<button class="missing-row" data-missing="' + TIQ.escapeAttr(f.flag) + '"><span>' + h(f.flag) + '</span><span class="hbar-track"><span class="hbar-fill" style="width:' + (f.pct || 0) + '%"></span></span><span>' + f.count + ' / ' + cands.length + ' (' + (f.pct === null ? '—' : f.pct + '%') + ')</span></button>'; }).join('') + '</section>' +
      '<section class="overview-card"><h2>Data limitations</h2><p>No historical before/after delta is available. Provenance tells us where a field came from; it cannot reconstruct the earlier record.</p><p>Use a paired, controlled study to measure impact. Sample records are not measured outcomes.</p><button class="secondary-button small-button" data-go="metrics">Open Research Metrics</button></section>' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Recorded activity</span></div>' +
        '<div class="overview-activity">' +
           (feed.length ? feed.map(function(f, i) {
              var actionKey = String(f.action || '').toLowerCase().replace(/[_-]/g, ' ').trim();
              var actionText = ({
                approved: 'marked as reviewed',
                'follow up': 'requested follow-up',
                'interview requested': 'requested an interview',
                'system created': 'added a candidate record',
                created: 'added a candidate record',
                'notes updated': 'updated recruiter notes',
                'resume parsed': 'scanned a resume',
                'resume uploaded': 'added a resume'
              })[actionKey] || 'updated the record';
              var activityCandidate = cands.find(function(candidate) { return candidate.id === f.target; });
              var activityTarget = activityCandidate ? [activityCandidate.firstName, activityCandidate.lastName].filter(Boolean).join(' ') : 'a candidate record';
              var activityColor = actionKey === 'approved' ? 'var(--green)' : actionKey === 'follow up' ? 'var(--amber)' : actionKey === 'interview requested' ? 'var(--brand)' : 'var(--text-muted)';
              return '<div class="activity-item" style="animation-delay:' + (i * 60) + 'ms"><span class="activity-dot" style="background:' + activityColor + '"></span><div><strong>' + TIQ.escapeHtml(f.recruiter) + '</strong> ' + actionText + ' ' + TIQ.escapeHtml(activityTarget) + '<span class="activity-time">' + TIQ.escapeHtml(f.time) + '</span></div></div>';
          }).join("") : '<p>No activity recorded in this population.</p>') +
        '</div><small>Latest five entries.</small>' +
      '</div>' +
    '</div>' +
    '<div class="results-actions"><button class="primary-button" id="resultsExport">Download records JSON</button><span>Manual handoff only; no ATS connection or messages sent.</span><button class="secondary-button" id="deleteEventData"' + (scope === 'all' ? ' disabled' : '') + '>Delete this event’s local data</button></div>' +
  '</div>';
};

TIQ.views.renderAnalytics = function() {
  return TIQ.views.renderOverview();
};

TIQ.views.initAnalyticsEvents = function() {
  document.getElementById('resultsEvent').onchange = function(e) { TIQ.views._resultsEvent = e.target.value; TIQ.router.navigateTo('analytics'); };
  document.querySelectorAll('[data-missing]').forEach(function(b) { b.onclick = function() {
    TIQ.views._reviewMissingFlag = b.dataset.missing; TIQ.views._reviewEventScope = TIQ.views._resultsEvent || 'all';
    TIQ.views._aiReviewStatus = 'all'; TIQ.views._aiReviewFunc = 'all'; TIQ.views._aiReviewPriority = 'all'; TIQ.views._aiReviewSearch = '';
    TIQ.router.navigateTo('review');
  }; });
  document.getElementById('resultsExport').onclick = function() {
    TIQ.downloadText('talentiq-records.json', JSON.stringify({kind:'talentiq-record-export',version:1,exportedAt:TIQ.nowISO(),candidates:TIQ.eventRecords(TIQ.views._resultsEvent || 'all')}, function(k,v) { return k === 'sourceUrl' ? undefined : v; }, 2));
  };
  document.getElementById('deleteEventData').onclick = function() {
    var id = TIQ.views._resultsEvent;
    if (!id || id === 'all') return;
    if (!confirm('Delete ' + TIQ.eventRecords(id).length + ' records for ' + id + ', including local notes, transcripts and linked audio? Other events and shared/exported copies will remain. This cannot be undone.')) return;
    TIQ.deleteEventData(id).then(function(n) { TIQ.showToast(n + ' local records deleted.'); TIQ.router.navigateTo('analytics'); }).catch(function(e) { TIQ.showToast('Deletion did not complete: ' + e.message); });
  };
};

/* ---- Event Info (QR Poster + Configurator) ---- */
TIQ.views._kioskFormUrl = TIQ.views._kioskFormUrl || (((window.location && window.location.origin) || "") + "/candidate-form.html");
TIQ.views._kioskIntakeMethod = TIQ.views._kioskIntakeMethod || "google-form";
TIQ.views._kioskRenderQR = null;

TIQ.views._kioskInfoIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 7.7v.1"></path></svg>';

TIQ.views.renderDemoLogin = function() {
  return '<main class="demo-login" id="demoLogin" aria-labelledby="demoLoginTitle">' +
    '<section class="demo-login__card">' +
      '<div class="demo-login__brand"><span class="demo-login__mark" aria-hidden="true">T</span><span>TalentIQ <span>Demo</span></span></div>' +
      '<h1 id="demoLoginTitle">Sign in to continue</h1>' +
      '<p class="demo-login__intro">Choose a demo recruiter to open the booth workspace.</p>' +
      '<div class="demo-login__choices" role="group" aria-label="Choose a demo recruiter">' +
        TIQ.RECRUITERS.map(function(recruiter, index) {
          var initial = recruiter.name.split(/\s+/).map(function(part) { return part.charAt(0); }).join("").slice(0, 2);
          return '<button type="button" class="demo-login__choice" data-demo-recruiter="' + TIQ.escapeAttr(recruiter.id) + '" aria-pressed="false">' +
            '<span class="demo-login__avatar" aria-hidden="true">' + TIQ.escapeHtml(initial) + '</span>' +
            '<span class="demo-login__identity"><strong>' + TIQ.escapeHtml(recruiter.name) + '</strong><small>' + TIQ.escapeHtml(recruiter.name.toLowerCase().replace(/\s+/g, ".")) + '@demo.talentiq.local</small></span>' +
            '<span class="demo-login__radio" aria-hidden="true"></span>' +
          '</button>';
        }).join("") +
      '</div>' +
      '<button type="button" class="demo-login__continue" data-demo-continue disabled>Continue</button>' +
      '<p class="demo-login__disclosure">Demo sign-in only. No account or password is required.</p>' +
    '</section>' +
  '</main>';
};

TIQ.views.initDemoLoginEvents = function(onContinue) {
  var selectedId = "";
  var continueButton = document.querySelector("[data-demo-continue]");
  var choices = document.querySelectorAll("[data-demo-recruiter]");
  choices.forEach(function(choice) {
    choice.addEventListener("click", function() {
      selectedId = choice.dataset.demoRecruiter;
      choices.forEach(function(item) {
        var selected = item === choice;
        item.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      if (continueButton) continueButton.disabled = !selectedId;
    });
  });
  if (continueButton) continueButton.addEventListener("click", function() {
    if (selectedId && typeof onContinue === "function") onContinue(selectedId);
  });
  var firstChoice = document.querySelector("[data-demo-recruiter]");
  if (firstChoice) firstChoice.focus();
};

TIQ.views.renderKiosk = function() {
  var cfg = TIQ.CONFIG;
  var ev = TIQ.eventInfo();

  return '<div class="view" id="view-intake">' +
    '<section class="kiosk-poster" aria-label="Career fair check-in poster">' +
      '<header class="kiosk-poster__header">' +
        '<div class="kiosk-poster__event">' +
          '<h1 class="kiosk-event-card__title" id="kioskEventMeta">' + TIQ.escapeHtml(ev.name) + '</h1>' +
          '<div class="kiosk-poster__metadata"><span id="kioskEventDate">' + TIQ.escapeHtml(ev.date) + '</span><span id="kioskEventLocation">' + TIQ.escapeHtml(ev.location) + '</span></div>' +
        '</div>' +
        '<button type="button" class="kiosk-info-btn" id="kioskEditEvent" aria-label="Edit event details" title="Edit event details">' + TIQ.views._kioskInfoIcon + '</button>' +
      '</header>' +
      '<div class="kiosk-poster__body">' +
        '<div class="kiosk-poster__columns">' +
        '<section class="kiosk-instructions" aria-labelledby="kioskInstructionsTitle">' +
          '<h2 class="kiosk-instructions__title" id="kioskInstructionsTitle">Candidate check-in</h2>' +
          '<p class="kiosk-instructions__intro">Scan to complete your profile before meeting a recruiter.</p>' +
          '<ol class="kiosk-instructions__steps"><li>Scan the QR code</li><li>Complete your profile</li><li>Meet a recruiter</li></ol>' +
        '</section>' +
        '<section class="kiosk-qr-panel" id="kioskQrPanel" aria-label="Candidate check-in QR code">' +
          '<div class="kiosk-qr-container" id="kioskQrContainer">' +
            '<canvas id="kiosk-qr-canvas" width="200" height="200" role="img" aria-label="QR code for candidate profile"></canvas>' +
          '</div>' +
          '<div class="kiosk-qr-actions">' +
            '<button type="button" class="primary-button kiosk-action-btn" id="kioskCopyLink">' +
              '<svg viewBox="0 0 24 24" class="button-icon" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
              'Copy link' +
            '</button>' +
            '<button type="button" class="secondary-button kiosk-action-btn" id="kioskPrintPoster">' +
            '<svg viewBox="0 0 24 24" class="button-icon" aria-hidden="true"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
              'Print poster' +
            '</button>' +
          '</div>' +
        '</section></div>' +
        '<div class="kiosk-poster__qr-info"><button type="button" class="kiosk-info-btn" id="kioskEditQr" aria-label="Edit booth QR and intake settings" title="Edit booth QR &amp; intake settings">' + TIQ.views._kioskInfoIcon + '</button></div>' +
      '</div>' +
      '<footer class="kiosk-poster__footer"><img class="kiosk-brand-logo" src="' + TIQ.escapeAttr(cfg.logoPath) + '" alt="J.B. Hunt" /><span class="kiosk-poster__leader" aria-hidden="true"></span><span class="kiosk-poster__motto">People Moving America Forward℠</span></footer>' +
    '</section>' +
  '</div>';
};

/* Align painted glyphs/modules, not their line boxes or white QR frame. */
TIQ.views._alignKioskInk = function() {
  var heading = document.getElementById('kioskInstructionsTitle');
  var canvas = document.getElementById('kiosk-qr-canvas');
  var body = document.querySelector('.kiosk-poster__body');
  if (!heading || !canvas || !body) return;
  var style = window.getComputedStyle(heading);
  var context = document.createElement('canvas').getContext('2d');
  context.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
  var metrics = context.measureText(heading.textContent);
  var ascent = metrics.fontBoundingBoxAscent;
  var descent = metrics.fontBoundingBoxDescent;
  var inkOffset = (parseFloat(style.lineHeight) - ascent - descent) / 2 + ascent - metrics.actualBoundingBoxAscent;
  if (Number.isFinite(inkOffset)) body.style.setProperty('--kiosk-heading-ink-offset', inkOffset + 'px');
  var pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4] < 128) {
        var padding = parseFloat(window.getComputedStyle(canvas.parentElement).paddingTop);
        var quietZone = y * canvas.getBoundingClientRect().height / canvas.height;
        body.style.setProperty('--kiosk-qr-ink-offset', (padding + quietZone) + 'px');
        return;
      }
    }
  }
};

TIQ.views.initKioskForm = function() {
  var printBtn = document.getElementById("kioskPrintPoster");
  var copyBtn = document.getElementById("kioskCopyLink");
  var editEventBtn = document.getElementById("kioskEditEvent");
  var editQrBtn = document.getElementById("kioskEditQr");
  var openCaptureBtn = document.querySelector("[data-open-capture]");

  var renderQR = function() {
    var url = TIQ.views._kioskFormUrl || "https://forms.gle/jbh-tech-fair-2026";
    var canvas = document.getElementById("kiosk-qr-canvas");
    if (!canvas) return;
    TIQ.qr.renderTo(url, canvas, { margin: 2 });
    requestAnimationFrame(TIQ.views._alignKioskInk);
  };
  TIQ.views._kioskRenderQR = renderQR;

  renderQR();
  if (document.fonts) document.fonts.ready.then(TIQ.views._alignKioskInk);
  if (!TIQ.views._kioskInkResizeBound) {
    window.addEventListener('resize', TIQ.views._alignKioskInk);
    TIQ.views._kioskInkResizeBound = true;
  }

  if (printBtn) {
    printBtn.addEventListener("click", function() { window.print(); });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function() {
      var url = TIQ.views._kioskFormUrl || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          TIQ.showToast("QR link copied to clipboard.");
        });
      } else {
        var tmp = document.createElement("textarea");
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        TIQ.showToast("QR link copied to clipboard.");
      }
    });
  }

  if (editEventBtn) editEventBtn.addEventListener("click", function() { TIQ.views._openKioskEditor("event"); });
  if (editQrBtn) editQrBtn.addEventListener("click", function() { TIQ.views._openKioskEditor("qr"); });
  if (openCaptureBtn) openCaptureBtn.addEventListener("click", function() { TIQ.router.navigateTo("capture"); });
};

/* Corner info buttons open a modal editor for the booth + QR details */
TIQ.views._openKioskEditor = function(kind) {
  if (document.querySelector(".modal-overlay[data-kiosk-editor]")) return;
  var isEvent = kind === "event";
  var ev = TIQ.eventInfo();
  var title = isEvent ? "Edit Event Details" : "Edit Booth QR &amp; Intake";
  var body;

  if (isEvent) {
    body =
      '<div class="modal-row"><label for="kioskEditName">Event Name</label>' +
        '<input type="text" id="kioskEditName" value="' + TIQ.escapeAttr(ev.name) + '" placeholder="e.g. Logistics &amp; Technology Fair 2026" /></div>' +
      '<div class="modal-row"><label for="kioskEditDate">Event Date</label>' +
        '<input type="text" id="kioskEditDate" value="' + TIQ.escapeAttr(ev.date) + '" placeholder="e.g. Sep 14, 2026" /></div>' +
      '<div class="modal-row"><label for="kioskEditLocation">Location</label>' +
        '<input type="text" id="kioskEditLocation" value="' + TIQ.escapeAttr(ev.location) + '" placeholder="e.g. Nashville, TN" /></div>';
  } else {
    var method = TIQ.views._kioskIntakeMethod;
    body =
      '<div class="modal-row"><label for="kioskEditMethod">Select Intake Method</label>' +
        '<select id="kioskEditMethod">' +
          '<option value="google-form"' + (method === "google-form" ? " selected" : "") + '>Google Form / External Link</option>' +
          '<option value="custom-url"' + (method === "custom-url" ? " selected" : "") + '>Custom URL</option>' +
        '</select></div>' +
      '<div class="modal-row"><label for="kioskEditUrl">Form / Survey URL</label>' +
        '<input type="url" id="kioskEditUrl" value="' + TIQ.escapeAttr(TIQ.views._kioskFormUrl) + '" placeholder="https://..." /></div>' +
      '<p class="kiosk-modal-hint">This URL is what candidates reach after scanning the booth QR code.</p>';
  }

  var overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("data-kiosk-editor", kind);
  overlay.innerHTML =
    '<div class="modal-dialog" role="dialog" aria-modal="true" aria-label="' + title.replace(/&amp;/g, "&") + '">' +
      '<div class="modal-header"><h3>' + title + '</h3>' +
        '<button type="button" class="modal-close" data-kiosk-close aria-label="Close">&times;</button></div>' +
      '<div class="modal-body">' + body + '</div>' +
      '<div class="modal-footer">' +
        '<button type="button" class="secondary-button" data-kiosk-close>Cancel</button>' +
        '<button type="button" class="primary-button" data-kiosk-save>Save</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  function closeEditor() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener("keydown", onKeydown);
  }
  function onKeydown(e) {
    if (e.key === "Escape") { e.stopPropagation(); closeEditor(); }
  }
  document.addEventListener("keydown", onKeydown);

  overlay.addEventListener("click", function(e) {
    if (e.target === overlay || e.target.closest("[data-kiosk-close]")) closeEditor();
  });

  var saveBtn = overlay.querySelector("[data-kiosk-save]");
  if (saveBtn) {
    saveBtn.addEventListener("click", function() {
      if (isEvent) {
        var nameInput = overlay.querySelector("#kioskEditName");
        var dateInput = overlay.querySelector("#kioskEditDate");
        var locInput = overlay.querySelector("#kioskEditLocation");
        TIQ.state.event = {
          name: nameInput ? nameInput.value.trim() : "",
          date: dateInput ? dateInput.value.trim() : "",
          location: locInput ? locInput.value.trim() : ""
        };
        TIQ.saveState();
        var info = TIQ.eventInfo();
        var meta = document.getElementById("kioskEventMeta");
        if (meta) meta.textContent = info.name;
        var eventDate = document.getElementById("kioskEventDate");
        var eventLocation = document.getElementById("kioskEventLocation");
        if (eventDate) eventDate.textContent = info.date;
        if (eventLocation) eventLocation.textContent = info.location;
        var sbName = document.getElementById("sidebarEventName");
        var sbDate = document.getElementById("sidebarEventDate");
        var sbLocation = document.getElementById("sidebarEventLocation");
        if (sbName) sbName.textContent = info.name;
        if (sbDate) sbDate.textContent = info.date;
        if (sbLocation) sbLocation.textContent = info.location;
        TIQ.showToast("Event details saved.");
      } else {
        var methodSelect = overlay.querySelector("#kioskEditMethod");
        var urlInput = overlay.querySelector("#kioskEditUrl");
        if (methodSelect) TIQ.views._kioskIntakeMethod = methodSelect.value;
        if (urlInput) TIQ.views._kioskFormUrl = urlInput.value.trim();
        if (TIQ.views._kioskRenderQR) TIQ.views._kioskRenderQR();
        TIQ.showToast("Booth QR settings saved.");
      }
      closeEditor();
    });
  }

  var firstField = overlay.querySelector(".modal-body input, .modal-body select");
  if (firstField) firstField.focus();
};

/* ---- Recruiter Capture View ---- */
TIQ.views._captureIndex = 0;
TIQ.views.selectCaptureCandidate = function(id) {
  var index = TIQ.state.candidates.findIndex(function(c) { return c.id === id; });
  if (index < 0) return false;
  TIQ.views._captureIndex = index;
  TIQ.state.selectedId = id;
  return true;
};
TIQ.views._captureRecorder = null;
TIQ.views._swipeState = null;

/* Phase 3 step 13: which candidate's "More from this candidate" disclosure is
   open. Keyed by capture index rather than a bare boolean on purpose — when the
   recruiter triages to the next candidate the stored index no longer matches, so
   the new card renders closed and the previous card can never inherit an open
   disclosure across a re-render. A bare boolean would have needed a manual reset
   at every one of the ~12 _rerenderCapture call sites. */
TIQ.views._importingResumes = false;

/* Waveform visualizer — decorative bars for the Apple-style voice memo widget */
TIQ.views._waveformBars = function(n) {
  n = n || 26;
  var out = "";
  for (var i = 0; i < n; i++) {
    var h = 8 + ((i % 5) * 3);
    if (i % 3 === 2) h += 3;
    out += '<span class="bar bar-inactive" style="height:' + h + 'px"></span>';
  }
  return out;
};

/* Live waveform — drives bars from the recorder's AnalyserNode while recording */
TIQ.views._waveformRaf = null;
TIQ.views._startLiveWaveform = function(rec) {
  TIQ.views._stopLiveWaveform();
  var analyser = rec && rec.getAnalyser ? rec.getAnalyser() : null;
  var bars = document.querySelectorAll(".voice-memo-widget .waveform .bar");
  if (!analyser || !bars.length) return;
  var data = new Uint8Array(analyser.frequencyBinCount);
  var tick = function() {
    analyser.getByteFrequencyData(data);
    for (var i = 0; i < bars.length; i++) {
      var v = data[Math.floor(i * data.length / bars.length)] / 255;
      var h = 5 + Math.round(v * 30);
      bars[i].style.height = h + "px";
      /* All bars stay red while recording — only height reacts to the mic */
      bars[i].classList.add("bar-active");
      bars[i].classList.remove("bar-inactive");
    }
    TIQ.views._waveformRaf = requestAnimationFrame(tick);
  };
  tick();
};
TIQ.views._stopLiveWaveform = function() {
  if (TIQ.views._waveformRaf) {
    cancelAnimationFrame(TIQ.views._waveformRaf);
    TIQ.views._waveformRaf = null;
  }
  var wave = document.querySelector(".voice-memo-widget .waveform");
  if (wave) wave.innerHTML = TIQ.views._waveformBars(24);
};

/* Candidate Review Card — high-density card for the capture deck.
   Partitioned by source so the card actually represents both inputs: a resume
   bar (file + scan state), a tinted FROM THE RESUME band carrying the real
   extracted values (never just counts), a SKILLS block, a white FROM THE
   CONVERSATION band for interview material, then the gap flags. */
TIQ.views._resumeExpanded = {};

TIQ.views._formatScanTime = function(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var h = d.getHours();
  var m = d.getMinutes();
  var suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return months[d.getMonth()] + " " + d.getDate() + " \u00B7 " + h + ":" + (m < 10 ? "0" + m : m) + " " + suffix;
};

/* Names must be entered or extracted from document content, not filenames. */
TIQ.views._displayName = function(c) {
  var direct = ((c.firstName || "") + " " + (c.lastName || "")).replace(/\s+/g, " ").trim();
  if (direct) return direct;
  var contactName = c.parsedResume && c.parsedResume.contact && c.parsedResume.contact.name;
  if (contactName && contactName.trim()) return contactName.trim();
  return "";
};

TIQ.views._resumeTally = function(c, parsed) {
  var bits = [];
  if (parsed.skills && parsed.skills.length) bits.push(parsed.skills.length + " skills");
  if (parsed.experience && parsed.experience.length) bits.push(parsed.experience.length + " role" + (parsed.experience.length === 1 ? "" : "s"));
  if (parsed.certifications && parsed.certifications.length) bits.push(parsed.certifications.length + " cert" + (parsed.certifications.length === 1 ? "" : "s"));
  if (parsed.projects && parsed.projects.length) bits.push(parsed.projects.length + " project" + (parsed.projects.length === 1 ? "" : "s"));
  if (c.gpa) bits.push(/\bGPA\b|grade point average/i.test(c.gpa) ? c.gpa : "GPA " + c.gpa);
  return bits.join(" \u00B7 ");
};

TIQ.views._resumeBarHtml = function(c) {
  var info = TIQ.resumeInfo(c);
  var parsed = c.parsedResume || null;
  var state = info.state === "pending" || info.state === "failed" ? info.state : parsed ? "scanned" : info.state;
  var scanBtn = '<button type="button" class="resume-bar__action" data-open-resume>Scan &#9656;</button>';

  /* No resume on file: the card renders no bar at all rather than a nagging
     empty-state block — the header carries the card from here. */
  if (state === "missing") return "";

  /* Legacy string-only uploads only proved that a filename once existed; the
     card's old "ON FILE" strip did not open or scan anything useful, so hide it
     instead of presenting a dead control. */
  if (state === "legacy") return "";

  var dotMod = state === "scanned" ? " is-ok" : (state === "failed" ? " is-bad" : " is-warn");
  var stateLabel = state === "scanned" ? "SCANNED"
    : state === "failed" ? "SCAN FAILED"
    : (state === "pending" ? "PARSING..." : "NOT SCANNED");
  var detail = state === "failed"
    ? (info.error || "The PDF could not be read.")
    : state === "scanned"
      ? TIQ.views._resumeTally(c, parsed || {})
      : "";

  return '<div class="resume-bar resume-bar--' + state + '">' +
    '<div class="resume-bar__top">' +
      '<span class="resume-dot' + dotMod + '" aria-hidden="true"></span>' +
      '<span class="resume-bar__state">' + TIQ.escapeHtml(stateLabel) + '</span>' +
      '<span class="resume-bar__file" title="' + TIQ.escapeAttr(info.name) + '">' + TIQ.escapeHtml(info.name) + '</span>' +
      (state === "scanned" ? "" : scanBtn) +
    '</div>' +
    (detail ? '<div class="resume-bar__detail">' + TIQ.escapeHtml(detail) + '</div>' : '') +
  '</div>';
};

/* "YYYY-MM" -> "May 2025". Used for duration chips. */
function resumeMonthLabel(ym) {
  if (!/^\d{4}-\d{2}$/.test(String(ym || ""))) return "";
  var names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[parseInt(ym.slice(5), 10) - 1] + " " + ym.slice(0, 4);
}

/* A duration chip from a normalized date range. Stays null-months when the role
   is ongoing, so we never imply a length the resume did not state. */
function resumeDurationLabel(d) {
  if (!d) return "";
  if (d.isCurrent) {
    var since = resumeMonthLabel(d.start);
    return since ? "current, since " + since : "current";
  }
  if (typeof d.months !== "number" || d.months < 1) return "";
  if (d.months < 12) return d.months + " mo";
  var yrs = Math.floor(d.months / 12);
  var mos = d.months % 12;
  return mos ? yrs + "y " + mos + "mo" : yrs + "y";
}

/* Links are shown as real anchors, but only ever as http(s). The extractor
   already requires an explicit scheme or a "www." prefix; this normalises the
   latter so a bare "www.x.com" cannot end up as a relative href. */
function resumeLinkHtml(url) {
  var href = /^https?:\/\//i.test(url) ? url : "https://" + url;
  return '<a class="resume-link" href="' + TIQ.escapeAttr(href) + '" target="_blank" rel="noopener noreferrer">' +
    TIQ.escapeHtml(url.replace(/^https?:\/\//i, "").replace(/^www\./i, "")) + '</a>';
}

TIQ.views._highlightSourceIcon = function(source) {
  return source === "resume" ? "📄" : (source === "conversation" ? "🎙" : "💬");
};

TIQ.views._highlightActionVerbs = {
  built: 1, led: 1, managed: 1, developed: 1, designed: 1, improved: 1,
  won: 1, presented: 1, delivered: 1, reduced: 1, increased: 1, coordinated: 1,
  organized: 1, created: 1, shipped: 1, launched: 1, implemented: 1, optimized: 1,
  authored: 1, maintained: 1, automated: 1, engineered: 1, mentored: 1, supported: 1,
  redesigned: 1, achieved: 1, earned: 1, secured: 1, produced: 1, deployed: 1,
  analyzed: 1, executed: 1, solved: 1, gathered: 1, spearheaded: 1, owned: 1,
  revived: 1, streamlined: 1, accelerated: 1, piloted: 1, delivered: 1
};

TIQ.views._formatHighlightText = function(text) {
  var raw = String(text == null ? "" : text);
  raw = raw.replace(/<\s*strong\s*>/gi, "**").replace(/<\s*\/\s*strong\s*>/gi, "**");
  raw = raw.replace(/^(\s*)([A-Za-z][A-Za-z'’-]*)(\b)/, function(_, lead, word, boundary) {
    return lead + (TIQ.views._highlightActionVerbs[String(word).toLowerCase()] ? "**" + word + "**" : word) + boundary;
  });

  var html = TIQ.escapeHtml(raw).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return html.split(/(<\/?strong>)/g).map(function(part) {
    if (part === "<strong>" || part === "</strong>") return part;
    return part.replace(/\b(\d+(?:,\d{3})*(?:\.\d+)?(?:%|\+)?|\d+\s*-\s*\d+)(?!\w)/g, '<strong>$1</strong>');
  }).join("");
};

TIQ.views._resumePdfViewerHtml = function(info) {
  var src = info && info.sourceUrl ? info.sourceUrl : "";
  if (!src) {
    return '<div class="resume-pdf-empty"><p class="resume-empty">Upload a PDF in the band above to preview the file here.</p></div>';
  }
  var title = info && info.name ? info.name : "resume.pdf";
  return '<div class="resume-pdf-shell">' +
    '<div class="resume-pdf-toolbar">' +
      '<span class="resume-pdf-toolbar__label">PDF viewer</span>' +
      '<span class="resume-pdf-toolbar__hint">Zoom, scroll, print, and download with the browser controls.</span>' +
      '<a class="resume-pdf-toolbar__link" href="' + TIQ.escapeAttr(src) + '" target="_blank" rel="noopener noreferrer">Open PDF</a>' +
    '</div>' +
    '<iframe class="resume-pdf-frame" title="' + TIQ.escapeAttr(title) + '" src="' + TIQ.escapeAttr(src) + '#toolbar=1&navpanes=1&view=FitH"></iframe>' +
  '</div>';
};

TIQ.views._resumeBandHtml = function(c) {
  var info = TIQ.resumeInfo(c);
  var parsed = c.parsedResume || null;
  var edu = (parsed && parsed.education && parsed.education.length) ? parsed.education[0] : null;
  var exp = (parsed && parsed.experience) || [];
  var certs = (parsed && parsed.certifications) || [];
  var projects = (parsed && parsed.projects) || [];
  /* Strictly resume-derived. Falling back to the candidate's own fields here
     would print recruiter-entered values under a "FROM THE RESUME" label with
     a resume provenance dot — a misattribution the whole traceability model
     exists to prevent. */
  var workAuth = (parsed && parsed.workAuthorization) || "";
  var address = (parsed && parsed.contact && parsed.contact.address) || "";
  var links = (parsed && parsed.links) || {};
  var linkKeys = ["linkedin", "github", "portfolio"].filter(function(k) { return !!links[k]; });

  var bandLabel = '<div class="band-label">FROM THE RESUME' +
    '<span class="prov-dot prov-dot--resume" title="Extracted from the scanned PDF"></span></div>';

  /* Say plainly that these values came from a broken scan instead of quietly
     rendering one run-on line as if it were an extraction. */
  var staleHtml = TIQ.ai.isStaleParse(parsed)
    ? '<p class="resume-band__stale">This scan predates the line-break fix — the whole PDF collapsed into one line, so what you see below is unreliable. Re-scan the PDF from the Resume tab to rebuild it.</p>'
    : "";

  /* Always render, even with nothing extracted. The upload affordance now
     lives here, so an empty band still gives the recruiter a path forward. */
  if (!edu && !exp.length && !certs.length && !projects.length && !workAuth && !address && !linkKeys.length) {
    var emptyNote = parsed
      ? 'Not extracted yet — scan to pull skills, GPA and roles.'
      : (info.state === "failed"
        ? (info.error || "This PDF could not be read. Try another text-based PDF.")
        : 'Not extracted yet — scan to pull skills, GPA and roles.');
    return '<section class="resume-band resume-band--empty">' + bandLabel + staleHtml +
      '<p class="resume-band__callout">' + TIQ.escapeHtml(emptyNote) + '</p>' +
      TIQ.renderDropZone(info.name, { inputId: "drawerResumeScan" }) +
    '</section>';
  }

  var rows = "";

  if (workAuth) {
    rows += '<div class="resume-fact resume-fact--compact">' +
      '<span class="resume-fact__label">WORK AUTHORIZATION</span>' +
      '<span class="resume-fact__inline">' + TIQ.escapeHtml(workAuth) +
        ' <span class="resume-fact__more">self-reported</span></span>' +
    '</div>';
  }

  /* Labelled RESUME ADDRESS, not "location" — where the candidate lives is not
     the same fact as the work-location preference workLocations collects, and
     conflating them would clear that missing flag without anyone asking. */
  if (address) {
    rows += '<div class="resume-fact resume-fact--compact">' +
      '<span class="resume-fact__label">RESUME ADDRESS</span>' +
      '<span class="resume-fact__inline">' + TIQ.escapeHtml(address) + '</span>' +
    '</div>';
  }

  if (linkKeys.length) {
    rows += '<div class="resume-fact resume-fact--compact">' +
      '<span class="resume-fact__label">LINKS</span>' +
      '<span class="resume-fact__inline resume-links">' +
        linkKeys.map(function(k) { return resumeLinkHtml(links[k]); }).join(" ") +
      '</span>' +
    '</div>';
  }

  if (edu) {
    var degreeLabel = edu.degreeProgram || edu.degree || "";
    var degreeLine = (degreeLabel && edu.major) ? degreeLabel + " in " + edu.major : (degreeLabel || edu.major || "");
    var schoolLine = [edu.school, edu.year].filter(Boolean).join(" \u00B7 ");
    if (degreeLine || schoolLine) {
      rows += '<div class="resume-fact">' +
        '<span class="resume-fact__label">EDUCATION</span>' +
        '<div class="resume-fact__body">' +
          (degreeLine ? '<span class="resume-fact__strong">' + TIQ.escapeHtml(degreeLine) + '</span>' : '') +
          (schoolLine ? '<span class="resume-fact__sub">' + TIQ.escapeHtml(schoolLine) + '</span>' : '') +
        '</div>' +
      '</div>';
    }
  }

  if (exp.length) {
    var expanded = !!TIQ.views._resumeExpanded[c.id];
    var shownExp = expanded ? exp : exp.slice(0, 2);
    var expItems = shownExp.map(function(x) {
      var dur = resumeDurationLabel(x.duration);
      return '<div class="resume-exp">' +
        '<div class="resume-exp__head">' +
          '<span class="resume-exp__title">' + TIQ.escapeHtml(x.title || "Role") + '</span>' +
          (x.dates ? '<span class="resume-exp__dates">' + TIQ.escapeHtml(x.dates) + '</span>' : '') +
        '</div>' +
        (x.company ? '<span class="resume-exp__org">' + TIQ.escapeHtml(x.company) + '</span>' : '') +
        (dur ? '<span class="resume-exp__dur">' + TIQ.escapeHtml(dur) + '</span>' : '') +
      '</div>';
    }).join("");
    var expanderHtml = "";
    if (exp.length > 2) {
      var hiddenRoles = exp.length - 2;
      expanderHtml = expanded
        ? '<button type="button" class="resume-expander" data-expand-roles="' + TIQ.escapeAttr(c.id) + '">Show fewer &#9652;</button>'
        : '<button type="button" class="resume-expander" data-expand-roles="' + TIQ.escapeAttr(c.id) + '">+' + hiddenRoles + ' earlier role' + (hiddenRoles === 1 ? '' : 's') + ' &#9662;</button>';
    }
    rows += '<div class="resume-fact resume-fact--exp">' +
      '<span class="resume-fact__label">EXPERIENCE' +
        '<span class="resume-fact__count">' + shownExp.length + ' of ' + exp.length + '</span></span>' +
      '<div class="resume-fact__body">' + expItems + expanderHtml + '</div>' +
    '</div>';
  }

  function compactRow(label, values, cap) {
    if (!values.length) return "";
    var shownV = values.slice(0, cap);
    var extra = values.length - shownV.length;
    return '<div class="resume-fact resume-fact--compact">' +
      '<span class="resume-fact__label">' + label + '</span>' +
      '<span class="resume-fact__inline">' + TIQ.escapeHtml(shownV.join(" \u00B7 ")) +
        (extra > 0 ? ' <span class="resume-fact__more">+' + extra + '</span>' : '') +
      '</span>' +
    '</div>';
  }

  rows += compactRow("CERTIFICATIONS", certs, 2);
  rows += compactRow("PROJECTS", projects.map(function(p) { return p.name; }).filter(Boolean), 2);

  return '<section class="resume-band">' + bandLabel + staleHtml + rows + '</section>';
};

TIQ.views._skillsBlockHtml = function(c) {
  var allSkills = (c.skills && c.skills.length) ? c.skills : (c.parsedResume && c.parsedResume.skills) || [];
  if (!allSkills.length) return "";

  /* Dedupe case-insensitively, preserving order. */
  var seen = {};
  var uniq = [];
  allSkills.forEach(function(s) {
    var k = String(s).toLowerCase();
    if (!seen[k]) { seen[k] = 1; uniq.push(s); }
  });

  var grouped = TIQ.categorizeSkills(uniq);
  if (!grouped.length) grouped = [{ key: 'other', label: 'Other Skills', items: uniq.slice(0) }];

  function skillMoreChip(list, contextLabel) {
    var n = list.length;
    var tipItems = list.slice(0, 6).map(function(s) {
      return '<span class="skill-more-tip__item">' + TIQ.escapeHtml(s) + '</span>';
    }).join("");
    if (list.length > 6) {
      tipItems += '<span class="skill-more-tip__item">+' + (list.length - 6) + ' more</span>';
    }
    return '<button type="button" class="skill-pill skill-pill--more skill-group__more" aria-label="' + TIQ.escapeAttr(n + ' more ' + contextLabel + ' skills: ' + list.join(', ')) + '">+' + n +
      '<span class="skill-more-tip" aria-hidden="true">' +
        '<span class="skill-more-tip__head">More skills</span>' +
        tipItems +
      '</span>' +
    '</button>';
  }

  var rows = grouped.map(function(group) {
    var items = group.items || [];
    var labelText = group.label || "Skills";
    /* Spec §7 asks for the top 3 skills always visible. The narrow-label and
       long-skill-name cases still drop to 2 so a single row keeps fitting. */
    var maxVisible = labelText.length > 16 ? 2 : 3;
    if (items[0] && String(items[0]).length > 14) maxVisible = Math.min(maxVisible, 2);
    var shown = items.slice(0, maxVisible);
    var hidden = items.slice(maxVisible);
    var pills = shown.map(function(s) {
      return '<span class="skill-pill">' + TIQ.escapeHtml(s) + '</span>';
    }).join("");
    if (hidden.length) pills += skillMoreChip(hidden, group.label.toLowerCase());
    return '<div class="skill-group-row">' +
      '<div class="skill-group__label">' + TIQ.escapeHtml(labelText) + ':</div>' +
      '<div class="skill-group__leader" aria-hidden="true"></div>' +
      '<div class="skill-group__icons">' + pills + '</div>' +
    '</div>';
  }).join("");

  /* Skills are the one block that can come from either source (resume scan or
     transcript hydration), so the block carries its own provenance dot rather
     than inheriting the resume band's tint. */
  var fromResume = TIQ.fieldSource(c, "skills") === "resume";
  var srcDot = fromResume
    ? '<span class="prov-dot prov-dot--resume" title="Extracted from the scanned PDF"></span>'
    : '<span class="prov-dot prov-dot--form" title="Captured in conversation"></span>';
  return '<section class="skills-block">' +
    '<div class="band-label band-label--plain">SKILLS' + srcDot + '</div>' +
    '<div class="skill-menu">' + rows + '</div>' +
  '</section>';
};

/* Click-to-jump map for the missing-information flags (spec §7 "always-visible,
   inline, click-to-jump"). Keys are the `key` values TIQ.getMissingFlags emits.
   Resume and Notes have a real home in the right-column drawer, so they open that
   tab. Skills / Graduation / GPA point at the card line that should be carrying
   the value. The remaining four have no line on the card at all (work
   authorization, phone, location preference, areas discussed), so they fall back
   to Notes — the only writable surface Capture has. This is a deliberate,
   incomplete mapping; it is called out in the chip's title attribute so the
   behaviour is not a surprise. */
var FLAG_JUMPS = {
  "Resume":            { tab: "resume", where: "opens the Resume panel on the right" },
  "Notes":             { tab: "notes",  where: "opens the Recruiter Notes panel on the right" },
  "Work Authorization":{ tab: "notes",  where: "has no line on this card, so it opens Recruiter Notes" },
  "Phone":             { tab: "notes",  where: "has no line on this card, so it opens Recruiter Notes" },
  "Location":          { tab: "notes",  where: "has no line on this card, so it opens Recruiter Notes" },
  "Areas Discussed":   { tab: "notes",  where: "has no line on this card, so it opens Recruiter Notes" },
  "Skills":            { region: ".skills-block", where: "jumps to the skills list" },
  "Graduation":        { region: ".major-grad",    where: "jumps to the graduation date" },
  "GPA":               { region: ".major-grad",    where: "jumps to the GPA" }
};

/* Summary skills preserve extraction order; this is presentation, not a fit score. */
TIQ.views._captureSkills = function(c) {
  var seen = {};
  return ((c.skills && c.skills.length ? c.skills : (c.parsedResume || {}).skills) || []).filter(function(s) {
    var key = String(s).trim().toLowerCase();
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
};
TIQ.views._topSkillsHtml = function(c) {
  var skills = TIQ.views._captureSkills(c);
  if (!skills.length) return '';
  return '<section class="skills-block capture-top-skills"><h3>Top skills</h3><div class="capture-skill-pills">' +
    skills.map(function(s, i) { return '<span class="skill-pill" data-skill-index="' + i + '">' + TIQ.escapeHtml(s) + '</span>'; }).join('') +
    '<button type="button" class="skill-pill skill-pill--more" data-capture-skills popovertarget="capture-skills-popover" aria-controls="capture-skills-popover" aria-expanded="false" aria-label="Additional skills">+' + skills.length + '</button></div></section>';
};
TIQ.views._allSkillsHtml = function(c) {
  var skills = TIQ.views._captureSkills(c);
  if (!skills.length) return '';
  var groups = TIQ.categorizeSkills(skills);
  if (!groups.length) groups = [{label:'Other',items:skills}];
  return '<section class="capture-all-skills"><h3>All skills</h3>' + groups.map(function(g) {
    return '<div class="capture-skill-group"><h4 class="skill-group__label">' + TIQ.escapeHtml(g.label || 'Other') + '</h4><div class="capture-skill-pills">' + (g.items || []).map(function(s) {
      return '<span class="skill-pill">' + TIQ.escapeHtml(s) + '</span>';
    }).join('') + '</div></div>';
  }).join('') + '</section>';
};
TIQ.views._flagChipsHtml = function(flags) {
  if (!flags || !flags.length) {
    return '<div class="card-flags card-flags--clear" role="group" aria-label="Missing information">' +
      '<span class="card-flag card-flag--clear"><span class="card-flag__icon" aria-hidden="true">&#10003;</span>' +
      '<span class="card-flag__label">No missing information</span></span>' +
    '</div>';
  }
  function chip(f) {
    var jump = FLAG_JUMPS[f.key] || { tab: "notes", where: "opens Recruiter Notes" };
    var attr = jump.tab
      ? ' data-flag-tab="' + TIQ.escapeAttr(jump.tab) + '"'
      : ' data-flag-region="' + TIQ.escapeAttr(jump.region) + '"';
    return '<button type="button" class="card-flag" data-flag-key="' + TIQ.escapeAttr(f.key) + '"' + attr +
      ' title="' + TIQ.escapeAttr(f.label + " — " + jump.where) + '">' +
      '<span class="card-flag__icon" aria-hidden="true">&#9888;&#65039;</span>' +
      '<span class="card-flag__label">' + TIQ.escapeHtml({'Work Authorization':'Work Auth','Location':'Location preference'}[f.key] || f.key) + '</span>' +
    '</button>';
  }
  var priority = ['Work Authorization', 'Location', 'Resume', 'Phone', 'Notes', 'Graduation', 'Skills', 'GPA', 'Areas Discussed'];
  var sorted = flags.slice().sort(function(a,b) { return priority.indexOf(a.key) - priority.indexOf(b.key); });
  var chips = sorted.slice(0, 2).map(chip).join('');
  /* Two priority flags stay pinned; the disclosure keeps every flag actionable. */
  return '<div class="card-flags" role="group" aria-label="Missing information (' + flags.length + ')">' +
    '<span class="card-flags__label">Missing info</span>' +
    '<div class="card-flags__chips">' + chips + '</div>' +
    '<details class="alert-banner alert-banner--inline" data-flag-key="' + TIQ.escapeAttr(flags[0].key) + '">' +
      '<summary class="alert-banner__summary" aria-label="View all ' + flags.length + ' missing information flags">All ' + flags.length + ' →</summary>' +
      '<div class="alert-banner__body">' + sorted.map(chip).join('') + '</div>' +
    '</details>' +
  '</div>';
};

/* Display-only normalization: never mutate the stored parse or render its HTML. */
function plainResumeSpelling(value) {
  return String(value == null ? '' : value).replace(/résumé/gi, 'resume');
}

function resumeDisplayText(value) {
  return plainResumeSpelling(value).replace(/[•●○▪\u2022]/g, ' ')
    .replace(/(?:^|\n)\s*[-*]\s+/g, ' ').replace(/\s+/g, ' ').trim();
}

function captureResumeVersion(c) {
  var text = String(c && c.parsedResume && c.parsedResume.rawText || '');
  var hash = 2166136261;
  for (var i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619) >>> 0;
  return 'rv-' + hash.toString(16);
}

function captureEvidenceTokens(text) {
  var ignored = /^(?:a|an|the|and|or|of|for|to|with|by|in|on|at|from|using|via|through|this|that|their|its|as|is|was|were|be|been|being|into|across|over|under|per)$/;
  return resumeDisplayText(text).toLowerCase().match(/[a-z]+(?:'[a-z]+)?|\d+(?:,\d{3})*(?:\.\d+)?%?/g) || [];
}

function captureTokensSupported(claim, passage) {
  var wanted = captureEvidenceTokens(claim).filter(function(token) {
    return !/^[a-z]+$/.test(token) || !/^(?:a|an|the|and|or|of|for|to|with|by|in|on|at|from|using|via|through|this|that|their|its|as|is|was|were|be|been|being|into|across|over|under|per)$/.test(token);
  });
  var available = captureEvidenceTokens(passage), cursor = 0;
  if (!wanted.length) return false;
  return wanted.every(function(token) {
    var index = available.indexOf(token, cursor);
    if (index < 0) return false;
    cursor = index + 1;
    return true;
  });
}

TIQ.views._captureResumeEvidence = function(c, claim, sourceContext) {
  var raw = String(c && c.parsedResume && c.parsedResume.rawText || '');
  if (!c || !c.id || !raw || !claim || !sourceContext || TIQ.ai.isStaleParse(c.parsedResume)) return null;
  var candidates = [], offset = 0;
  raw.split(/\r?\n/).forEach(function(line, index) {
    var text = line.replace(/^\s*[•●○▪*-]\s*/, '').trim();
    var start = raw.indexOf(line, offset);
    offset = start + line.length + 1;
    if (!text || !captureTokensSupported(claim, text) || !captureTokensSupported(sourceContext, text)) return;
    candidates.push({text: text, offset: start, line: index});
  });
  if (candidates.length !== 1) return null;
  var version = captureResumeVersion(c), passage = candidates[0];
  return {
    candidateId: c.id,
    resumeVersion: version,
    passageId: c.id + ':' + version + ':' + passage.offset,
    text: passage.text,
    offset: passage.offset
  };
};

TIQ.views._captureRenderedPassageId = function(c, text) {
  var evidence = TIQ.views._captureResumeEvidence(c, text, text);
  return evidence && evidence.passageId;
};

/* Be conservative about inferred tool lists: source presence and commas alone
   do not establish that a year, place, employer, or award is a technology. */
TIQ.views._captureSupportedTools = function(value) {
  var terms = resumeDisplayText(value).replace(/[.!]$/, '').split(/\s*,\s*|\s+(?:and|&)\s+/).filter(Boolean);
  var languages = (TIQ.SKILL_GROUPS || []).find(function(g) { return g.key === 'languages'; });
  function known(term) {
    var key = TIQ.skillIconKey ? TIQ.skillIconKey(term) : term.toLowerCase();
    return !!(TIQ.SKILL_ICON_RENDERABLE && TIQ.SKILL_ICON_RENDERABLE[key]) ||
      /^(?:SQL|MySQL|SQLite|NumPy|SciPy|SAS|SPSS|Snowflake|Databricks|BigQuery|Alteryx|Power Query|VBA|Visio|Google Sheets|Microsoft SQL Server|SQL Server)$/i.test(term) ||
      !!(languages && languages.match.includes(term.toLowerCase()));
  }
  /* Reject a mixed metadata list in its entirety rather than laundering its
     recognized words into a made-up method. Unknown tools retain source prose. */
  return terms.length && terms.every(known) ? terms : [];
};

/* Display-only contributions. Metadata is never a fact; keep each complete
   source bullet intact so a result in its second sentence is not detached. */
TIQ.views._captureSourceFacts = function(source) {
  var action = /^(?:Built|Developed|Designed|Created|Implemented|Utilized|Used|Led|Managed|Maintained|Catalogued|Reduced|Increased|Supported|Assisted|Helped|Organized|Coordinated|Added|Validated|Tested|Documented|Researched|Qualified|Awarded|Earned|Received|Won|Winner|Executed|Published|Conducted|Analyzed|Tracked|Covered|Identified|Proposed|Modeled|Modelled|Automated|Delivered|Improved|Launched|Negotiated|Trained|Mentored|Facilitated|Oversaw|Achieved|Saved|Cut|Produced|Presented|Volunteered|Served|Raised|Collected|Taught|Resolved|Reviewed|Evaluated|Audited|Optimized|Monitored|Forecasted|Projected)\b/i;
  var sentenceActions = '(?:Built|Developed|Designed|Created|Implemented|Utilized|Used|Led|Managed|Maintained|Reduced|Increased|Supported|Assisted|Helped|Organized|Coordinated|Added|Validated|Tested|Documented|Researched|Qualified|Awarded|Earned|Received|Won|Executed|Published|Conducted|Analyzed|Tracked|Covered|Identified|Proposed|Modeled|Modelled|Automated|Delivered|Improved|Launched|Negotiated|Trained|Mentored|Facilitated|Oversaw|Achieved|Saved|Cut|Produced|Presented|Volunteered|Served|Raised|Collected|Taught|Resolved|Reviewed|Evaluated|Audited|Optimized|Monitored|Forecasted|Projected)';
  var bullets = String(source || '').replace(/\r\n?/g, '\n')
    .split(/(?:^|\n)\s*[•●○▪*-]\s*|\s+[•●○▪-]\s+/)
    .flatMap(function(text) {
      return text.split(new RegExp('(?<=[.!?])\\s+(?=' + sentenceActions + '\\b|The\\s+(?:modeled|modelled)\\b)', 'i'))
        .flatMap(function(sentence) { return sentence.split(new RegExp('(?:,\\s*and\\s+|\\s+and\\s+)(?=' + sentenceActions + '\\b)', 'i')); });
    })
    .map(resumeDisplayText).filter(Boolean);
  var facts = bullets.filter(function(text) {
    return action.test(text) || /^The\s+(?:modeled|modelled)\b.*\b(?:reduced|improved|increased|lowered|cut)\b/i.test(text);
  });
  if (!facts.length) facts = TIQ.views._captureContributionFacts(source || '', '');
  return facts.filter(function(text, i, all) {
    function key(value) { return resumeDisplayText(value).replace(/[.!?;]+$/, '').toLowerCase(); }
    return all.findIndex(function(other) { return key(other) === key(text); }) === i;
  });
};

function captureMetricExpression(flags) {
  var quantity = '(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?\\+?';
  var amount = quantity + '(?:\\s*[–-]\\s*' + quantity + ')?';
  var qualifiers = '(?:(?:business|common|daily|weekly|monthly|simulated|modelled|modeled|student|regional|customer|shipping|shipment|loading|employer|full-time|part-time)\\s+)+';
  var units = '(?:hours?|hrs?|minutes?|mins?|seconds?|days?|weeks?|months?|years?|accounts?|customers?|users?|students?|attendees?|employees?|people|shipments?|records?|inquiries|routes?|docks?|facilities|counties|observations|units|panels|events|projects?|stores|SKUs|volunteers|team members|certifications|leadership roles)';
  var counted = amount + '\\s+' + '(?:' + qualifiers + ')?' + units;
  var change = '(?:from\\s+)?' + quantity + '\\s+(?:hours?|hrs?|minutes?|mins?|days?|weeks?|months?|years?)\\s+to\\s+' + quantity + '\\s+(?:hours?|hrs?|minutes?|mins?|days?|weeks?|months?|years?)';
  var percent = amount + '\\s*%';
  var currency = '\\$\\s*' + quantity + '(?:\\s*(?:million|thousand))?';
  var ordinal = '\\d+(?:st|nd|rd|th)\\s+Place(?:\\s+State\\s+Winner)?';
  return new RegExp('\\b(?:' + change + '|' + percent + '|' + currency + '|' + counted + '|' + ordinal + ')(?!\\w)', flags || 'i');
}

TIQ.views._summarizeCaptureFact = function(fact) {
  var text = resumeDisplayText(fact).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  var verbs = '(?:Built|Developed|Designed|Created|Implemented|Used|Led|Managed|Maintained|Reduced|Increased|Supported|Assisted|Organized|Coordinated|Validated|Tested|Documented|Won|Published|Analyzed|Tracked|Identified|Proposed|Modeled|Delivered|Improved|Launched|Trained|Mentored|Facilitated|Achieved|Saved|Cut|Produced|Presented|Resolved|Reviewed|Audited|Optimized|Helped|Projected)';
  var candidates = [text];
  text.split(/(?<=[.!?])\s+/).forEach(function(sentence) {
    if (sentence.trim()) candidates.push(sentence.trim());
  });
  /* Split only at an explicit coordinated action; each result remains a
     grammatical source clause, rather than a word-count slice. */
  text.split(new RegExp('(?:,\\s*and\\s+|\\s+and\\s+)(?=' + verbs + '\\b)', 'i')).forEach(function(clause) {
    clause = clause.trim().replace(/^(?:and|then)\s+/i, '');
    if (clause) candidates.push(clause.charAt(0).toUpperCase() + clause.slice(1));
  });
  candidates.slice().forEach(function(candidate) {
    /* A source-supported metric can stand as a complete narrower claim when
       the trailing `with …` clause only lists the service/activity details.
       Never apply this to unquantified claims or cut within the measure. */
    var withClause = candidate.match(/^((?:Assisted|Helped|Served|Supported|Handled|Processed|Resolved)\b[^.!?]+?)\s+with\s+[^.!?]+[.!?]?$/i);
    if (withClause && captureMetricExpression('i').test(withClause[1]) && withClause[1].split(/\s+/).length <= 10) {
      candidates.push(withClause[1]);
    }
    var compactParticiple = candidate.match(/^(Built|Developed|Designed|Created|Implemented) a (.+,\s+(?:reducing|improving|increasing|saving|lowering|decreasing)\b.+)$/i);
    if (compactParticiple) {
      candidates.push(compactParticiple[1] + ' ' + compactParticiple[2]);
    }
    var modeledWarehouseImpact = candidate.match(/\b(?:reducing|lowering)\s+(modeled|modelled)\s+stock discrepancies by (\d+(?:\.\d+)?%)/i);
    if (modeledWarehouseImpact && /\bsimulated warehouse\b/i.test(candidate)) {
      candidates.push('Reduced ' + modeledWarehouseImpact[1] + ' stock discrepancies by ' + modeledWarehouseImpact[2] + ' for a simulated warehouse');
    }
    /* A relative impact is a complete narrower claim when its antecedent is
       an omitted tool/process clause; retain the source's impact verb. */
    var impact = /\b((?:reduc\w*|improv\w*|increas\w*|sav\w*|cut|lower\w*|decreas\w*|helped\s+(?:to\s+)?(?:reduc\w*|improv\w*|increas\w*|lower\w*|cut)|prevent\w*|eliminat\w*|accelerat\w*|shorten\w*))\s+(.+)$/i.exec(candidate);
    if (impact && /\b(?:that|which)\s+$/.test(candidate.slice(0, impact.index))) {
      candidates.push(impact[1].charAt(0).toUpperCase() + impact[1].slice(1) + ' ' + impact[2]);
    }
    var purpose = /\s+to\s+(compare|analyze|analyse|evaluate|monitor|review|identify|track|measure|support|enable|improve|optimize|optimise)\s+(.+?)[.!?]?$/i.exec(candidate);
    if (purpose) {
      var actionContext = candidate.slice(0, purpose.index).replace(/\s+using\s+[^.!?]+$/i, '').trim();
      if (actionContext) candidates.push(actionContext + ' to ' + purpose[1] + ' ' + purpose[2].replace(/\s+using\s+.+$/i, '').trim());
      candidates.push(candidate.slice(0, purpose.index).replace(/\s+using\s+[^.!?]+$/i, '').trim());
    }
    var countEnd = captureMetricExpression('i');
    var metric = countEnd.exec(candidate);
    if (metric && /^(?:Created|Built|Developed|Designed)\b/i.test(candidate)) {
      var beforeEnd = candidate.slice(0, metric.index + metric[0].length);
      if (beforeEnd.split(/\s+/).length <= 10) candidates.push(beforeEnd);
    }
  });
  var distinct = [];
  candidates.forEach(function(candidate) {
    candidate = candidate.replace(/\s+(?:using|through|via)\s+[^.!?]*[.!?]?$/i, '')
      .replace(/[.!?;]+$/, '').trim();
    if (!candidate || candidate.split(/\s+/).length > 10) return;
    if (!distinct.some(function(value) { return value.toLowerCase() === candidate.toLowerCase(); })) distinct.push(candidate);
  });
  if (!distinct.length) return '';
  distinct.sort(function(a, b) {
    var rank = function(value) { return (captureMetricExpression('i').test(value) ? 2 : 0) + (/\b(?:reduc\w*|improv\w*|increas\w*|sav\w*|cut|lower\w*|decreas\w*|helped|prevent\w*|eliminat\w*|accelerat\w*|shorten\w*|projected)\b/i.test(value) ? 1 : 0); };
    return rank(b) - rank(a) || a.split(/\s+/).length - b.split(/\s+/).length;
  });
  var result = distinct[0];
  return /^[a-z]/.test(result) ? result.charAt(0).toUpperCase() + result.slice(1) + '.' : result + '.';
};

TIQ.views._selectCaptureFacts = function(source, limit) {
  var facts = TIQ.views._captureSourceFacts(source);
  return facts.map(function(text, index) {
    var outcome = /\b(?:reduc\w*|improv\w*|increas\w*|sav\w*|cut|lower\w*|decreas\w*|achiev\w*|deliver(?:ed|ing|s)?|result\w*|project(?:ed|ing)|helped|prevent\w*|eliminat\w*|accelerat\w*|shorten\w*)\b/i.test(text);
    var quantified = captureMetricExpression('i').test(text);
    return { text: TIQ.views._summarizeCaptureFact(text), index: index, priority: outcome && quantified ? 0 : quantified ? 1 : outcome ? 2 : 3 };
  }).sort(function(a, b) { return a.priority - b.priority || a.index - b.index; })
    .filter(function(item) { return item.text && item.text.split(/\s+/).length <= 10; })
    .slice(0, limit || 2).sort(function(a, b) { return a.index - b.index; })
    .map(function(item) { return item.text; });
};

TIQ.views._captureContributionFacts = function(source, name) {
  var action = /^(?:Built|Developed|Designed|Created|Implemented|Utilized|Used|Led|Managed|Manage|Maintained|Catalogued|Reduced|Increased|Supported|Assisted|Organized|Coordinated|Added|Validated|Tested|Documented|Researched|Qualified|Awarded|Earned|Received|Won|Winner|Executed|Execute|Published|Conducted|Analyzed|Tracked|Covered|Identified|Proposed)\b/i;
  var escaped = String(name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var facts = [];
  String(source || '').split(/[•●○▪]|(?:^|\n)\s*[-*]\s+/).forEach(function(chunk) {
    resumeDisplayText(chunk).split(/(?<=[.!?;])\s+(?=(?:[A-Z]|won\b|awarded\b|received\b))/).forEach(function(sentence) {
      sentence = sentence.replace(/;$/, '.');
      /* A source label is context, not part of its complete action statement. */
      var labelled = sentence.match(/^[^:]+:\s*(.+)$/);
      if (labelled && action.test(labelled[1])) sentence = labelled[1];
      var explicitMethod = sentence.match(/^(?:Built|Developed|Created|Designed) with\s+(.*)$/i);
      if (explicitMethod && !TIQ.views._captureSupportedTools(explicitMethod[1]).length) return;
      if (!action.test(sentence)) return;
      var ownName = escaped && new RegExp('\\b' + escaped + '\\b', 'i');
      if (ownName && ownName.test(sentence)) {
        /* A source sentence naming its own project can expose its method and
           scope separately. Only supported construction/participle forms map. */
        var construction = sentence.match(new RegExp('^(?:Built|Developed|Created|Designed)\\s+(?:an?\\s+|the\\s+)?(.*?)' + escaped + '[,\\"“”]*\\s+(.*)$', 'i'));
        /* If a title cannot be safely separated from its clause, retain the
           complete source sentence instead of silently dropping it. */
        if (!construction) { facts.push(sentence); return; }
        var factCountBeforeSplit = facts.length;
        var method = construction[1].trim().replace(/^with\s+/i, '').replace(/["“”',]+/g, '').trim();
        if (method && TIQ.views._captureSupportedTools(method).length) facts.push(sentence.match(/^\w+/)[0] + ' with ' + method.replace(/[,\s]+$/, '') + '.');
        var tail = construction[2].replace(/^(?:covering|tracking|monitoring)\b/i, function(word) {
          return {covering:'Covered',tracking:'Tracked',monitoring:'Monitored'}[word.toLowerCase()];
        });
        if (/^(?:Covered|Tracked|Monitored)\b/.test(tail)) facts.push(tail);
        else if (/^(?:an?|the)\s+(?:(?:web|mobile)\s+)?(?:application|dashboard|tool|platform|pipeline|model|map)\b/i.test(tail)) {
          facts.push(sentence.match(/^\w+/)[0] + ' ' + tail.replace(/^an web\b/i, 'a web'));
        }
        if (facts.length === factCountBeforeSplit) facts.push(sentence);
        return;
      }
      if (sentence.split(/\s+/).length > 2) facts.push(sentence);
    });
  });
  return facts.map(function(f) {
    /* Shorten complete source phrases, not arbitrary word counts. Keep scope,
       methods, results, and any simulation/experimental qualifier intact. */
    var purpose = f.match(/^(?:Developed|Built|Created|Designed) (?:an? )?(?:web |mobile )?application designed to assist in (.+?) of .+? (across \d+ [^.]+counties)(.*)$/i);
    if (purpose) return purpose[1].charAt(0).toUpperCase() + purpose[1].slice(1) + ' ' + purpose[2] + purpose[3];
    return f;
  }).filter(function(f, i, all) { return all.findIndex(function(x) { return x.toLowerCase() === f.toLowerCase(); }) === i; });
};

TIQ.views._captureTldr = function(source, name) {
  return TIQ.views._captureContributionFacts(source, name).slice(0, 3).join(' · ');
};

TIQ.views._captureMetricHtml = function(text) {
  var pattern = captureMetricExpression('gi');
  var html = '', last = 0, match;
  while ((match = pattern.exec(text))) {
    html += TIQ.escapeHtml(text.slice(last, match.index)) + '<strong class="capture-metric">' + TIQ.escapeHtml(match[0]) + '</strong>';
    last = match.index + match[0].length;
  }
  return html + TIQ.escapeHtml(text.slice(last));
};

function captureParsedProjects(parsed) {
  if (parsed && typeof parsed.rawText === 'string' && TIQ.ai._extractProjects) {
    return TIQ.ai._extractProjects(parsed.rawText);
  }
  return (parsed && parsed.projects) || [];
}

function captureParsedExperience(parsed) {
  if (parsed && typeof parsed.rawText === 'string' && TIQ.ai._extractExperience) {
    return TIQ.ai._extractExperience(parsed.rawText);
  }
  return (parsed && parsed.experience) || [];
}

TIQ.views._resumeHighlightEntries = function(c) {
  var parsed = c.parsedResume;
  var state = TIQ.resumeInfo(c).state;
  if (!parsed || state === 'pending' || state === 'failed' || TIQ.ai.isStaleParse(parsed)) return [];
  var raw = resumeDisplayText(parsed.rawText);
  var projects = captureParsedProjects(parsed);
  var experience = captureParsedExperience(parsed);
  var grounded = TIQ.generateAccomplishments(c).filter(function(a) { return a.source === 'resume'; });
  var entries = [];
  function normalize(value) { return resumeDisplayText(value).replace(/\s+/g, ' ').toLowerCase(); }
  function supported(value) {
    if (!raw) return true;
    return String(value || '').split(/\s+·\s+/).every(function(part) {
      var exact = normalize(part);
      var source = normalize(raw);
      if (source.indexOf(exact) !== -1) return true;
      var sourceWords = source.replace(/\b(?:a|an|the|and)\b/g, '').replace(/\s+/g, ' ');
      var exactWords = exact.replace(/\b(?:a|an|the|and)\b/g, '').replace(/\s+/g, ' ');
      if (sourceWords.indexOf(exactWords) !== -1) return true;
      /* Concise display facts may remove a source-backed trailing clause.
         Verify the remaining full phrase against the source without its
         presentation punctuation rather than discarding the summary. */
      return source.indexOf(exact.replace(/[.!?;]+$/, '')) !== -1;
    });
  }
  function add(entry) {
    entry.name = resumeDisplayText(entry.name);
    entry.facts = (entry.facts || []).map(resumeDisplayText).filter(function(fact) {
      /* Facts in these entries are selected directly from a parsed résumé
         field. Summaries may safely omit method/context clauses, so requiring
         their final wording to be a contiguous rawText substring would reject
         accurate derived clauses such as keeping an action while dropping its
         tool phrase. Source selection, not substring coincidence, owns them. */
      return fact && fact.split(/\s+/).length <= 10;
    });
    entry.factEvidence = entry.facts.map(function(fact) {
      return TIQ.views._captureResumeEvidence(c, fact, fact);
    });
    entry.distinctionEvidence = entry.distinction
      ? TIQ.views._captureResumeEvidence(c, entry.distinction, entry.distinction)
      : null;
    if ((!entry.name && !entry.facts.length && !entry.distinction) || (entry.name && !supported(entry.name))) return;
    entry.description = entry.facts.join(' · ');
    if (entries.some(function(existing) {
      return existing.category === entry.category && normalize(existing.name) === normalize(entry.name) &&
        existing.facts.map(normalize).join('|') === entry.facts.map(normalize).join('|') &&
        normalize(existing.distinction) === normalize(entry.distinction);
    })) return;
    entries.push(entry);
  }
  function sourceEntryFacts(source) {
    return TIQ.views._selectCaptureFacts(source, 2);
  }

  experience.forEach(function(role) {
    var facts = sourceEntryFacts(role.description || '');
    var fields = [role.title, role.company].filter(Boolean).map(resumeDisplayText);
    add({ category: 'Experience', name: fields.join(' · '), organization: role.company || '',
      location: supported(role.location) ? role.location : '', dates: supported(role.dates) ? role.dates : '', facts: facts });
  });

  function projectAward(project) {
    var contextual = grounded.find(function(item) {
      return item.contextLabel === project.name && item.facet === 'Recognition' &&
        /^(?:winner|won|awarded|received|earned|finalist|\d+(?:st|nd|rd|th)\s+place|recognized|recognised)\b/i.test(item.text);
    });
    var inlineAward = String(project.description || '').match(/(?:^|;\s*)((?:Winner|Won|Awarded|Received|Earned|Finalist|\d+(?:st|nd|rd|th)\s+Place)\b[^.;]*?(?:\s*\((?:19|20)\d{2}\))?)[.;]?$/i);
    if (inlineAward) return { text: inlineAward[1].trim(), item: null };
    var sourceLines = String(parsed.rawText || '').split(/\r?\n/).map(function(line) { return line.trim(); });
    var escapedName = String(project.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var target = sourceLines.findIndex(function(line) {
      return new RegExp('^Project\\s*:\\s*' + escapedName + '(?:\\s*[|—–]|$)', 'i').test(line);
    });
    if (target < 0) return contextual ? { text: contextual.text, item: contextual } : null;
    var year = '', examined = 0;
    for (var i = target - 1; i >= 0 && examined < 4; i--) {
      var line = sourceLines[i];
      if (!line) continue;
      examined++;
      if (/^(?:winner|won|awarded|received|recognized|recognised|finalist|\d+(?:st|nd|rd|th)\s+place)\b/i.test(line)) {
        var label = line.split(/\s*[|—–]\s*/)[0].replace(/\s+-\s+/g, ' — ').trim();
        var inlineYear = line.match(/\b(19|20)\d{2}\b/);
        if (inlineYear && !/\b20\d{2}\b/.test(label)) year = inlineYear[0];
        return { text: label + (year && !/\b20\d{2}\b/.test(label) ? ' (' + year + ')' : ''), item: null };
      }
      var foundYear = line.match(/\b(19|20)\d{2}\b/);
      var location = /^[A-Z][A-Za-z .'-]+,?\s+(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)(?:\s+\d{5})?$/i.test(line);
      if (foundYear && /^(?:19|20)\d{2}$/.test(line)) year = foundYear[0];
      else if (!foundYear && !location) return null;
    }
    return contextual ? { text: contextual.text, item: contextual } : null;
  }

  projects.forEach(function(project) {
    if (!project || !project.name) return;
    var facts = sourceEntryFacts(project.description || '');
    if (!facts.length) {
      var quote = grounded.find(function(item) {
        return item.contextLabel === project.name && supported(item.text);
      });
      if (quote) facts = sourceEntryFacts(quote.text);
    }
    if (!facts.length) return;
    var projectMetadata = String(project.description || '').split(/[•●○▪]/)[0];
    var tools = TIQ.views._captureSupportedTools(projectMetadata);
    var award = projectAward(project);
    if (award && !award.item) {
      var awardStart = project.description.toLowerCase().lastIndexOf(award.text.toLowerCase());
      if (awardStart >= 0) {
        var accomplishment = project.description.slice(0, awardStart).replace(/[;\s]+$/, '').trim();
        if (accomplishment) facts = sourceEntryFacts(accomplishment);
      }
    }
    if (award && award.item) award.item._ownedByProject = true;
    add({ category: 'Project', name: project.name, location: supported(project.location) ? project.location : '',
      dates: [project.dates, project.year].filter(Boolean).find(supported) || '', tools: tools, facts: facts,
      distinction: award && award.text });
  });

  /* Leadership is emitted only from a leadership/activities/volunteer source
     section, or an explicitly labeled Leadership field—not from work verbs. */
  var sourceLines = String(parsed.rawText || '').split(/\r?\n/);
  var section = '', currentRole = null;
  var leadershipHeader = /^(?:leadership(?:\s*(?:&|and)\s*activities)?|activities|volunteer(?:ing)?|community involvement)\s*:?[\s]*$/i;
  var sectionHeader = /^(?:education|experience|professional experience|work experience|employment|projects?|skills?|technical skills|certifications?|licenses|awards?|honors?|publications|references|summary|objective)\b/i;
  var bullet = /^[•●○▪*-]\s*/;
  var leadershipDate = /^(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?\s+)?(?:19|20)\d{2})\s*(?:[-–—]|to)\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?\s+)?(?:19|20)\d{2}|Present|Current)$/i;
  var lines = [], inLeadershipSection = false;
  sourceLines.forEach(function(line) {
    var text = resumeDisplayText(line);
    if (!text) { lines.push(line); return; }
    if (leadershipHeader.test(text)) inLeadershipSection = true;
    else if (sectionHeader.test(text)) inLeadershipSection = false;
    var previous = lines[lines.length - 1];
    var previousText = resumeDisplayText(previous || '').replace(bullet, '');
    var currentText = text.replace(bullet, '');
    var explicitLeadership = /^Leadership\s*:/i.test(previousText);
    var isContinuation = !!previousText && !bullet.test(text) && /^[a-z(]/.test(currentText) &&
      !/[.!?;:]$/.test(previousText) && !leadershipDate.test(text) &&
      !leadershipHeader.test(text) && !sectionHeader.test(text);
    if (isContinuation && (inLeadershipSection || explicitLeadership)) {
      lines[lines.length - 1] = String(previous).replace(/\s*$/, ' ') + String(line).trim();
    } else lines.push(line);
  });
  function startLeadershipRole(text) {
    var date = (text.match(/(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?\s+)?(?:19|20)\d{2}\s*(?:[-–—]|to)\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?\s+)?(?:19|20)\d{2}|Present|Current))/i) || [''])[0];
    var withoutDate = date ? text.replace(date, '').trim() : text;
    var fields = withoutDate.split(/\s*\|\s*/).map(function(field) { return field.trim(); }).filter(Boolean);
    if (fields.length === 1 && date) fields = withoutDate.split(/\s+[—–]\s+/).map(function(field) { return field.trim(); }).filter(Boolean);
    currentRole = {category:'Leadership', name:fields.shift() || '', organization:fields.join(' · '), dates:date, facts:[]};
    entries.push(currentRole);
  }
  lines.forEach(function(line) {
    var hasBullet = bullet.test(String(line).trim());
    var text = resumeDisplayText(line);
    if (!text) return;
    if (leadershipHeader.test(text)) { section = 'leadership'; currentRole = null; return; }
    if (sectionHeader.test(text)) { section = ''; currentRole = null; }
    if (section === 'leadership') {
      var content = resumeDisplayText(String(line).replace(bullet, ''));
      var isAward = /^(?:\d+(?:st|nd|rd|th)\s+place|winner|won|awarded|received|finalist|champion)\b/i.test(content);
      if (hasBullet) {
        if (isAward && currentRole) currentRole.distinction = content;
        else if (currentRole) currentRole.facts.push.apply(currentRole.facts, TIQ.views._captureSourceFacts('• ' + content));
        else if (TIQ.views._captureSourceFacts(text).length) add({category:'Leadership',name:'',facts:TIQ.views._captureSourceFacts(text)});
        return;
      }
      if (leadershipDate.test(text)) {
        if (currentRole && !currentRole.dates) currentRole.dates = text;
        return;
      }
      var inlineFacts = TIQ.views._captureSourceFacts(text);
      if (inlineFacts.length) {
        if (currentRole) currentRole.facts.push.apply(currentRole.facts, inlineFacts);
        else add({category:'Leadership',name:'',facts:inlineFacts});
        return;
      }
      if (!currentRole || currentRole.facts.length || currentRole.distinction || /\s\|\s|\s+[—–]\s/.test(text)) startLeadershipRole(content);
      else if (!currentRole.organization) currentRole.organization = content;
      else currentRole.organization += ' · ' + content;
      return;
    }
    var labeled = text.match(/^Leadership\s*:\s*(.+)$/i);
    if (labeled) {
      var parts = labeled[1].split(/\s*;\s*/).filter(Boolean);
      var title = parts.shift() || '';
      var factText = parts.map(function(part) { return part.replace(/^([a-z])/, function(_, ch) { return ch.toUpperCase(); }); }).join('; ');
      if (factText) add({category:'Leadership',name:title,facts:TIQ.views._captureSourceFacts('• ' + factText)});
    }
  });
  entries = entries.filter(function(entry) {
    entry.facts = entry.facts.filter(function(fact, index, all) {
      return fact && fact.split(/\s+/).length <= 10 &&
        all.findIndex(function(other) { return normalize(other) === normalize(fact); }) === index;
    });
    entry.description = entry.facts.join(' · ');
    return entry.facts.length > 0 || !!entry.distinction || (entry.category === 'Experience' && !!entry.name);
  });

  /* Keep source-backed recognition and substantive unscoped evidence, but
     exclude claims already owned by a parsed job/project. */
  grounded.forEach(function(item) {
    if (item.contextLabel || !supported(item.text) || item._ownedByProject) return;
    if (experience.some(function(role) { return normalize(role.description).indexOf(normalize(item.text)) !== -1; }) ||
        projects.some(function(project) { return normalize(project.description).indexOf(normalize(item.text)) !== -1; }) ||
        entries.some(function(entry) { return entry.facts.some(function(fact) { return normalize(fact) === normalize(item.text); }); })) return;
    var category = /^(?:Recognition)$/.test(item.facet) ? 'Award' : /^(?:Leadership role|Owned the work)$/.test(item.facet) ? '' : 'Accomplishment';
    if (!category) return;
    if (category === 'Award') {
      if (!/\b(?:award(?:ed)?|winner|won|place|medal|honou?r|finalist|champion)\b/i.test(item.text)) return;
      if (entries.some(function(entry) { return entry.category === 'Leadership' && normalize(entry.distinction) === normalize(item.text); })) return;
      add({category:'Award',name:'',facts:[],distinction:item.text});
    } else add({category:category,name:'',facts:sourceEntryFacts(item.text)});
  });

  (parsed.certifications || []).forEach(function(cert) {
    /* The existing extractor can append the next all-caps section heading.
       Keep the actual credential name, not that heading or its skill list. */
    var text = resumeDisplayText(cert).split(/\s+\b(?:SKILLS|EDUCATION|TECHNICAL|GPA)\b/)[0].trim();
    if (text && supported(text) && !entries.some(function(e) { return e.category === 'Certifications' && e.facts.indexOf(text) !== -1; })) {
      add({category:'Certifications', name:'', facts:[text]});
    }
  });
  return entries.filter(function(entry) { return entry.name || entry.facts.length || entry.distinction; });
};

/* Short-height presentation uses complete source-backed phrases, never ellipsis.
   This creates no alternate candidate data and does not move facts across items. */
TIQ.views._compactCaptureEntry = function(entry) {
  return Object.assign({}, entry, { facts: (entry.facts || []).slice() });
};

/* Only display facts owned by this item. All source text remains in Evidence. */
TIQ.views._captureVisualEntries = function(c) {
  var parsed = c.parsedResume || {}, projects = captureParsedProjects(parsed), experience = captureParsedExperience(parsed);
  var entries = TIQ.views._resumeHighlightEntries(c).map(function(entry) {
    var e = Object.assign({}, entry);
    e.facts = (e.facts || String(e.description || '').split(' · ')).filter(Boolean);
    if (e.category === 'Experience') {
      var role = experience.find(function(r) { return r.title === e.name || [r.title,r.company].filter(Boolean).join(' · ') === e.name; });
      if (role) {
        e.name = role.title;
        e.organization = role.company || '';
        e.location = role.location || '';
        e.dates = role.dates || '';
      }
    }
    if (e.category === 'Project') {
      var project = projects.find(function(p) { return resumeDisplayText(p.name) === e.name; });
      e.context = '';
    } else if (e.category === 'Leadership') {
      if (e.dates && !/^\d|^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(e.dates)) { e.organization = e.dates; e.dates = ''; }
    }
    e.facts = e.facts.filter(function(f, i, all) {
      function key(value) { return value.replace(/[.!?;]+$/, '').toLowerCase(); }
      return all.findIndex(function(other) { return key(other) === key(f); }) === i;
    }).map(function(f) {
      return f.replace(/(\d+)\s*-\s*(\d+)\s+hours weekly\b/g, '$1–$2 hours per week');
    });
    if (e.category !== 'Certifications') {
      var distinctions = e.facts.filter(function(f) { return /^(?:Winner|Won|Awarded|Received.*(?:award|prize|medal))\b/i.test(f); });
      e.distinction = e.distinction || distinctions.join(' ');
      e.facts = e.facts.filter(function(f) { return !distinctions.includes(f); });
    }
    e.factEvidence = e.facts.map(function(fact) {
      return TIQ.views._captureResumeEvidence(c, fact, fact);
    });
    e.distinctionEvidence = e.distinction
      ? TIQ.views._captureResumeEvidence(c, e.distinction, e.distinction)
      : null;
    return e;
  });
  return entries.filter(function(e, index) {
    if (e.category === 'Award' && e.distinction) {
      function awardKey(text) { return text.replace(/\(\d{4}\)/g, '').replace(/^(?:Winner|Won|Awarded|Received|Earned)\s*[-–—:]?\s*/i, '').replace(/[^a-z0-9]/gi, '').toLowerCase(); }
      if (entries.some(function(owner) { return owner.category === 'Project' && owner.distinction && awardKey(owner.distinction) === awardKey(e.distinction); })) return false;
    }
    return e.name || e.distinction || e.category === 'Certifications' || !e.facts.every(function(f) {
      return entries.some(function(other, i) { return i !== index && other.name && other.category === e.category && other.facts.includes(f); });
    });
  });
};

TIQ.views._captureHighlightItemHtml = function(e) {
  var facts = e.facts || String(e.description || '').split(' · ').filter(Boolean);
  function factHtml(fact, index) {
    var evidence = e.factEvidence && e.factEvidence[index];
    var body = TIQ.views._captureMetricHtml(fact);
    return evidence && /<strong\b/.test(body)
      ? '<button type="button" class="resume-source-link" data-resume-source="' + TIQ.escapeAttr(evidence.passageId) + '" aria-label="View résumé source for ' + TIQ.escapeAttr(fact) + '">' + body + '</button>'
      : body;
  }
  var label = e.groupLabel || ({Project:'Projects'}[e.category] || e.category);
  return (e.hideCategory ? '' : '<div class="resume-highlights__context">' + TIQ.views._captureSectionIcon(e.category) + '<span class="resume-highlights__category">' + TIQ.escapeHtml(label) + '</span><span class="resume-highlights__leader" aria-hidden="true"></span>' +
    '</div>') +
    (e.name ? '<strong class="resume-highlights__name" title="' + TIQ.escapeAttr(e.name) + '">' + TIQ.escapeHtml(e.name) + '</strong>' : '') +
      ((e.organization || e.dates || e.location) ? '<div class="capture-item-context">' + ((e.organization || e.location) ? '<span class="capture-item-context__place">' + TIQ.escapeHtml([e.organization, e.location].filter(Boolean).join(' · ')) + '</span>' : '') + (e.dates ? '<span class="capture-item-context__dates">' + TIQ.escapeHtml(e.dates) + '</span>' : '') + '</div>' : '') +
    (e.tools && e.tools.length ? '<p class="capture-project-tools">Tools: ' + TIQ.escapeHtml(e.tools.join(', ')) + '</p>' : '') +
      (e.distinction ? '<p class="capture-distinction">' + TIQ.escapeHtml(e.distinction) + '</p>' : '') +
     (e.category === 'Certifications' ? '<div class="capture-credentials">' + facts.map(function(f, i) { return '<p>' + factHtml(f, i) + '</p>'; }).join('') + '</div>' : facts.length ? '<ul class="capture-facts">' + facts.map(function(f, i) { return '<li>' + factHtml(f, i) + '</li>'; }).join('') + '</ul>' : '');
};

/* The skill registry is raster artwork, not a reusable section SVG library. */
TIQ.views._captureSectionIcon = function(category) {
  var paths = {
    Experience:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v3h4v-3"/>',
    Project:'<path d="M3 3v18h18M7 17v-5M12 17V8M17 17V4"/>',
    Leadership:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/>',
    Certifications:'<path d="M5 3h14v12H5zM8 7h8M8 10h4"/><circle cx="15" cy="14" r="3"/><path d="m13 17-1 4 3-2 3 2-1-4"/>'
  };
  return '<svg class="capture-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[category] || paths.Certifications) + '</svg>';
};

TIQ.views._resumeHighlightsHtml = function(c) {
  var info = TIQ.resumeInfo(c);
  var entries = TIQ.views._captureVisualEntries(c);
  var message = info.state === 'failed' ? 'Resume parsing failed: ' + (info.error || 'Try a text-based PDF.')
    : info.state === 'pending' ? 'Parsing resume… Highlights will appear when the scan finishes.'
    : TIQ.ai.isStaleParse(c.parsedResume) ? 'Re-scan this resume to refresh its highlights.'
    : c.parsedResume ? 'No substantive resume highlights extracted.'
    : info.state === 'legacy' ? 'Scan this resume to see highlights.'
    : 'Upload a resume to see highlights.';
  var groups = [];
  entries.forEach(function(entry) {
    var group = groups.find(function(candidate) { return candidate.category === entry.category; });
    if (!group) { group = { category: entry.category, entries: [] }; groups.push(group); }
    group.entries.push(entry);
  });
  return '<section class="resume-highlights" role="region" tabindex="0" aria-label="Resume highlights">' +
    '<h3 class="resume-highlights__title">Resume Highlights</h3>' +
    (entries.length ? '<ul class="resume-highlights__list">' + groups.map(function(group) {
      var label = {Project:'Projects'}[group.category] || group.category;
      return group.entries.map(function(e, index) {
        var item = Object.assign({}, e, { groupLabel: label + ' · ' + group.entries.length, hideCategory: index > 0 });
        return '<li class="resume-highlights__entry">' + TIQ.views._captureHighlightItemHtml(item) + '</li>';
      }).join('');
    }).join('') + '</ul>' : '<p class="resume-highlights__empty" role="status"><strong>No highlights yet</strong><br>' + TIQ.escapeHtml(message) + '</p>') +
    '</section>';
};

TIQ.views._resumeConflictsHtml = function(c) {
  var conflicts = c.resumeConflicts || [];
  if (!conflicts.length) return '';
  var labels = {firstName:'First name',lastName:'Last name',university:'School',degreeProgram:'Degree',graduationDate:'Graduation date',gpa:'GPA'};
  function text(value) { return Array.isArray(value) ? value.join(', ') : value && typeof value === 'object' ? Object.values(value).filter(Boolean).join(', ') : value || '(cleared)'; }
  return '<details class="resume-conflicts"><summary>Resume discrepancies · ' + conflicts.length + ' to review</summary><p>Entered values were kept. Review these differences against the resume.</p><ul>' + conflicts.map(function(conflict) {
    return '<li><strong>' + TIQ.escapeHtml(labels[conflict.field] || conflict.field) + '</strong>: entered “' + TIQ.escapeHtml(text(conflict.entered)) + '”; resume “' + TIQ.escapeHtml(text(conflict.resume)) + '”</li>';
  }).join('') + '</ul></details>';
};

TIQ.views._buildCardHtml = function(c, isFront) {
  var flags = TIQ.getMissingFlags(c);
  var gradDate = TIQ.formatMonthYear(c.graduationDate || "");

  /* Section 1: header — avatar + name + school + grad/GPA with provenance.
     Placeholder copy ("not listed" / "TBD") is gone: lines only render when
     they carry real values, so the name is the loudest thing on the card. */
  var gpaOk = !!c.gpa && !!String(c.gpa).trim();
  var gpaDot = '';
  var display = TIQ.views._displayName(c);
  var nameHtml = display
    ? '<h2 class="candidate-name">' + TIQ.escapeHtml(display) + '</h2>'
    : '<h2 class="candidate-name candidate-name--missing">Name not captured</h2>';
    var parsedMajor = c.parsedResume && c.parsedResume.education && c.parsedResume.education[0] && c.parsedResume.education[0].major;
    var recruiterMajor = c.major && TIQ.fieldSource(c, 'major') !== 'resume' ? c.major : '';
    var schoolBits = [c.university, recruiterMajor || parsedMajor || c.major || c.degreeProgram].filter(function(v) {
    return v && String(v).trim();
  });
  var gradBits = [];
  if (gradDate) gradBits.push(gradDate);
  if (gpaOk) gradBits.push(/\bGPA\b|grade point average/i.test(c.gpa) ? c.gpa : "GPA " + c.gpa);
  var headerHtml = '<div class="card-header">' +
    '<div class="avatar-box">' + TIQ.escapeHtml(TIQ.initialsFor(c)) + '</div>' +
    '<div class="header-details">' +
      '<div class="name-row">' + nameHtml + '</div>' +
      (schoolBits.length
        ? '<p class="university">' + schoolBits.map(function(v) { return TIQ.escapeHtml(v); }).join(' &middot; ') + '</p>'
        : '') +
      (gradBits.length
        ? '<p class="major-grad">' + gradBits.map(function(v) { return TIQ.escapeHtml(v); }).join(' &middot; ') + gpaDot + '</p>'
        : '') +
    '</div>' +
  '</div>';

  /* The decision card contains only identity, skills and source-backed summary. */
  var skillsHtml = TIQ.views._topSkillsHtml(c);

  /* Swipe hint — rendered on the front card only, and pinned below the flags so
     it is visible without scrolling (spec §12: hint at full opacity, not 0.55). */
  var hintHtml = isFront
    ? '<p class="capture-card__swipe-hint">' +
        '<span class="capture-card__swipe-arrow" aria-hidden="true">&larr;</span>' +
        'Mark reviewed' +
        '<span class="capture-card__swipe-separator" aria-hidden="true">·</span>' +
        'Follow up' +
        '<span class="capture-card__swipe-arrow" aria-hidden="true">&rarr;</span>' +
      '</p>'
    : '';

  return '<div class="capture-summary">' +
    headerHtml + skillsHtml + TIQ.views._resumeHighlightsHtml(c) +
  '</div>' +
  '<div class="capture-card-footer">' + TIQ.views._flagChipsHtml(flags) + hintHtml + '</div>';
};

TIQ.views._captureVoiceHtml = function(c) {
  return '<p class="recording-disclosure">Optional voice memo: ask permission before recording. Saved locally for recruiter review; transcription may be inaccurate. You can use typed notes instead.</p><label class="recording-consent"><input type="checkbox" id="recordingConsent"' + (c.consent && c.consent.audio ? ' checked' : '') + '> Candidate agreed to this recording</label><div class="voice-memo-widget">' +
    '<span class="record-indicator"></span><div class="voice-meta"><span class="voice-label">Voice Memo</span><span class="voice-timer" id="audioTimer">00:00</span></div>' +
    '<div class="waveform">' + TIQ.views._waveformBars(24) + '</div>' +
    '<button type="button" id="audioRecordBtn" class="voice-btn btn-toggle" title="Start recording" aria-label="Start or stop recording" aria-pressed="false">&#9679;</button></div>' +
    '<div id="liveTranscriptPreview" class="live-transcript-preview" style="display:none"><span class="live-transcript-dot"></span><span class="live-transcript-text"></span></div>';
};

TIQ.views._renderDrawerResume = function(sel) {
  var info = TIQ.resumeInfo(sel);
  var parsed = sel.parsedResume || null;
  var parsedData = parsed || {};
  var stale = TIQ.ai.isStaleParse(parsed);

  if (!parsed && !info.sourceUrl) {
    return '<p class="resume-empty">Use the upload zone above to scan a PDF and preview it here.</p>';
  }

  function mark(v) { return '<span class="mark-extracted">' + TIQ.escapeHtml(v) + '</span>'; }
  function section(label, body) {
    return '<div class="drawer-resume-section"><div class="drawer-resume-section__label">' + label + '</div>' + body + '</div>';
  }

  var html = "";

  var edu = parsedData.education || [];
  if (edu.length) {
    html += section("EDUCATION", edu.map(function(e) {
      var line1 = [e.degree, e.major].filter(Boolean).join(" ");
      var line2 = [e.school, e.year].filter(Boolean).join(" · ");
      return '<div class="drawer-fact">' +
        (line1 ? '<div class="drawer-fact__strong">' + mark(line1) + '</div>' : '') +
        (line2 ? '<div class="drawer-fact__sub">' + mark(line2) + '</div>' : '') +
      '</div>';
    }).join(""));
  }

  var exp = parsedData.experience || [];
  if (exp.length) {
    html += section("EXPERIENCE", exp.map(function(x) {
      var head = [x.title, x.company].filter(Boolean).join(" — ");
      var lines = "";
      if (x.dates) lines += '<div class="drawer-fact__sub">' + mark(x.dates) + '</div>';
      if (x.description) lines += '<div class="drawer-fact__desc">' + TIQ.escapeHtml(x.description) + '</div>';
      return '<div class="drawer-fact">' +
        (head ? '<div class="drawer-fact__strong">' + mark(head) + '</div>' : '') + lines +
      '</div>';
    }).join(""));
  }

  var projects = parsedData.projects || [];
  if (projects.length) {
    html += section("PROJECTS", projects.map(function(p) {
      return '<div class="drawer-fact">' +
        '<div class="drawer-fact__strong">' + mark(p.name || "Project") + '</div>' +
        (p.description ? '<div class="drawer-fact__desc">' + TIQ.escapeHtml(p.description) + '</div>' : '') +
      '</div>';
    }).join(""));
  }

  var certs = parsedData.certifications || [];
  if (certs.length) {
    html += section("CERTIFICATIONS", certs.map(function(ct) {
      return '<div class="drawer-fact"><div class="drawer-fact__strong">' + mark(ct) + '</div></div>';
    }).join(""));
  }

  var skills = parsedData.skills || [];
  if (skills.length) {
    html += section("SKILLS (" + skills.length + ")", '<div class="drawer-skill-row">' +
      skills.map(function(s) { return '<span class="skill-pill mark-extracted">' + TIQ.escapeHtml(s) + '</span>'; }).join("") +
    '</div>');
  }

  if (!html) html = '<p class="resume-empty">Nothing extracted from this resume yet.</p>';

  return TIQ.views._resumePdfViewerHtml(info) +
    (stale ? '<p class="drawer-rescan__warn">Stale scan — re-scan required</p><p class="resume-band__stale">This scan predates the line-break fix, so the PDF text was collapsed into one line. Re-scan the file to rebuild the sections.</p>' : '') +
    html +
    '<p class="provenance-legend"><span class="prov-dot prov-dot--resume"></span> extracted from the scanned PDF</p>';
};

/* A print presentation of the current candidate's source, never a repaired or
   synthesized resume. */
TIQ.views._capturePrintResumeHtml = function(c) {
  var parsed = c.parsedResume || {}, info = TIQ.resumeInfo(c);
  if (info.state === 'pending') return '<p class="resume-empty" role="status">Parsing resume…</p>';
  if (info.state === 'failed') return '<p class="resume-empty" role="status">' + TIQ.escapeHtml(info.error || 'Resume could not be read.') + '</p>' + TIQ.renderDropZone(info.name, {inputId:'drawerResumeScan'});
  if (!c.parsedResume) return '<p class="resume-empty">Scan a resume to view its document.</p>' + TIQ.renderDropZone(info.name, {inputId:'drawerResumeScan'});
  var contact = parsed.contact || {}, links = parsed.links || {};
  var header = '<header class="resume-document__header"><h2>' + TIQ.escapeHtml(TIQ.views._displayName(c) || 'Resume') + '</h2>' +
    '<p>' + [contact.address,contact.email,contact.phone].filter(Boolean).map(TIQ.escapeHtml).join(' | ') + '</p>' +
    '<p>' + Object.keys(links).filter(function(k) { return links[k]; }).map(function(k) { return resumeLinkHtml(links[k]); }).join(' ') + '</p></header>';
  var sections = [], current = null;
  plainResumeSpelling(parsed.rawText).split(/\r?\n/).forEach(function(line) {
    line = line.trim(); if (!line) return;
    if (/^(?:EDUCATION|ACADEMIC (?:BACKGROUND|QUALIFICATIONS)|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|PROJECTS|LEADERSHIP(?:\s*&\s*ACTIVITIES)?|ACTIVITIES|CERTIFICATIONS(?:\/TRAINING)?|SKILLS(?:, CERTIFICATIONS OR AWARDS)?|AWARDS|HONORS)\s*:??$/i.test(line)) {
      current = {label:line.replace(/:$/, ''),lines:[]}; sections.push(current); return;
    }
    if (current) current.lines.push(line);
  });
  var body = sections.map(function(s) {
    var blocks = [];
    s.lines.forEach(function(line) {
      var bullet = /^[•●○▪*-]\s*/.test(line);
      if (!bullet && blocks.length && !blocks[blocks.length - 1].bullet && resumeDisplayText(blocks[blocks.length - 1].text).toLowerCase() === resumeDisplayText(line).toLowerCase()) return;
      if (bullet) blocks.push({bullet:true,text:line.replace(/^[•●○▪*-]\s*/, '')});
      else if (blocks.length && blocks[blocks.length - 1].bullet && /^[a-z]/.test(line)) blocks[blocks.length - 1].text += ' ' + line;
      else blocks.push({bullet:false,text:line});
    });
    function dateLine(b) { return b && !b.bullet && /^(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}(?:\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:\d{4}|Present))?$/i.test(b.text); }
    function metadataKey(value) { return resumeDisplayText(value).toLowerCase().replace(/[-–—]/g, '-').replace(/\s+/g, ''); }
    function headingMetadata(text, followingDates) {
      var parts = text.split(/\s*\|\s*/).filter(Boolean).filter(function(part, index, all) {
        return all.findIndex(function(other) { return metadataKey(other) === metadataKey(part); }) === index;
      });
      var heading = parts.join(' | '), dates = followingDates.slice();
      var suffix = /(?:\s*\|\s*|\s+)((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}(?:\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:\d{4}|Present))?)\s*$/i;
      var match = heading.match(suffix);
      /* A range, explicit metadata separator, or adjacent date establishes
         heading metadata; do not strip years from ordinary source sentences. */
      if (match && (/\||[-–—]/.test(match[0]) || dates.length)) {
        dates.unshift(match[1]);
        heading = heading.slice(0, match.index).replace(/[\s|]+$/, '');
        var repeat = heading.match(suffix);
        while (repeat && metadataKey(repeat[1]) === metadataKey(match[1])) {
          heading = heading.slice(0, repeat.index).replace(/[\s|]+$/, '');
          repeat = heading.match(suffix);
        }
      }
      dates = dates.filter(function(date, index, all) { return all.findIndex(function(other) { return metadataKey(other) === metadataKey(date); }) === index; });
      return {text:heading,date:dates.join(' · ')};
    }
    return '<section class="resume-document__section"><h3>' + TIQ.escapeHtml(s.label) + '</h3>' + blocks.map(function(b, index) {
      if (dateLine(b) && index) {
        var prior = index - 1;
        while (prior >= 0 && dateLine(blocks[prior])) prior--;
        if (prior >= 0 && !blocks[prior].bullet) return '';
      }
      if (b.bullet) {
        var bulletPassageId = TIQ.views._captureRenderedPassageId(c, b.text);
        return '<ul><li' + (bulletPassageId ? ' data-resume-passage-id="' + TIQ.escapeAttr(bulletPassageId) + '"' : '') + '>' + TIQ.escapeHtml(b.text) + '</li></ul>';
      }
      var followingDates = [], next = index + 1;
      while (dateLine(blocks[next])) followingDates.push(blocks[next++].text);
      var metadata = headingMetadata(b.text, followingDates);
      var title = !!metadata.date || index === 0 || /^Project\s*:/i.test(b.text);
      var linePassageId = TIQ.views._captureRenderedPassageId(c, metadata.text);
      return '<p class="resume-document__line' + (title ? ' resume-document__item-heading' : '') + '"' + (linePassageId ? ' data-resume-passage-id="' + TIQ.escapeAttr(linePassageId) + '"' : '') + '>' + (title ? '<strong>' : '<span>') + TIQ.escapeHtml(metadata.text) + (title ? '</strong>' : '</span>') + (metadata.date ? '<span class="resume-document__date">' + TIQ.escapeHtml(metadata.date) + '</span>' : '') + '</p>';
    }).join('') + '</section>';
  }).join('');
  if (!body) {
    function section(label, items) { return items.length ? '<section class="resume-document__section"><h3>' + label + '</h3>' + items.join('') + '</section>' : ''; }
    body += section('EDUCATION',(parsed.education || []).map(function(e) { return '<p><strong>' + TIQ.escapeHtml(e.school || '') + '</strong></p><p>' + TIQ.escapeHtml([e.degreeProgram || e.degree,e.major,e.year].filter(Boolean).join(' · ')) + '</p>'; }));
    body += section('EXPERIENCE',(parsed.experience || []).map(function(e) { return '<p><strong>' + TIQ.escapeHtml([e.title,e.company].filter(Boolean).join(' · ')) + '</strong> ' + TIQ.escapeHtml(e.dates || '') + '</p><p>' + TIQ.escapeHtml(e.description || '') + '</p>'; }));
    body += section('PROJECTS',(parsed.projects || []).map(function(e) { return '<p><strong>' + TIQ.escapeHtml(e.name || '') + '</strong></p><p>' + TIQ.escapeHtml(e.description || '') + '</p>'; }));
    body += section('CERTIFICATIONS',(parsed.certifications || []).map(function(e) { return '<ul><li>' + TIQ.escapeHtml(e) + '</li></ul>'; }));
  }
   return (TIQ.ai.isStaleParse(c.parsedResume) ? '<p class="drawer-rescan__warn">This scan is stale. Re-scan the PDF to refresh its source sections.</p>' + TIQ.renderDropZone(info.name, {inputId:'drawerResumeScan'}) : '') + '<button type="button" class="resume-source-dismiss" data-resume-source-dismiss hidden>Clear source highlight</button><p class="resume-source-status" role="status" hidden>Source passage unavailable.</p><article class="resume-document" data-candidate-id="' + TIQ.escapeAttr(c.id) + '" data-resume-version="' + TIQ.escapeAttr(captureResumeVersion(c)) + '">' + header + body + '</article><p class="provenance-legend">Resume source · reviewed identity shown above.</p>';
};

TIQ.views.renderRecruiterCapture = function() {
  var cands = TIQ.state.candidates;
  if (!cands.length) return '<div class="view" id="view-capture"><div class="view-header"><span class="section-kicker">Live Capture</span><h1>No candidates to capture</h1></div><div class="capture-empty"><p>No candidates in the system yet.</p><button class="primary-button" id="captureGenerateDemo">Load demo data</button><button class="secondary-button" id="captureImportEmpty">Import Resumes (PDF)</button><button class="secondary-button" id="captureNewCandidateEmpty">Add Candidate Manually</button><input type="file" id="captureImportEmptyInput" accept=".pdf,application/pdf" multiple style="display:none"></div></div>';

  var idx = TIQ.views._captureIndex;
  if (idx >= cands.length) {
    return TIQ.views._renderCaptureComplete(cands);
  }

  var c = cands[idx];
  var sel = c;

  var recruiterName = TIQ.recruiterName(TIQ.state.activeRecruiterId) || "Not selected";
  var attributeHtml = TIQ.renderAttributePills(c.attributes || [], { interactive: false, className: "attribute-picker attribute-picker--static" });
  var flags = TIQ.getMissingFlags(c);
  var flagsHtml = flags.length ? flags.map(TIQ.formatFlagChip).join("") : '<span class="flag-chip flag-clear">[No Critical Missing Info]</span>';

  /* Phase 3 step 9: normal-flow stack, no absolute positioning. The loop used to
     count down (s = stackSize-1 .. 0) because the cards were absolutely
     positioned and DOM order only mattered for paint order. In normal flow the
     front card has to come FIRST, and the two behind it collapse to deck edges
     beneath it — so they render no content of their own. The swipe drives
     `transform` on the front card alone. */
  var stackHtml = '<div class="capture-stack">';
  var stackSize = Math.min(3, cands.length - idx);
  stackHtml += '<div class="capture-card candidate-card capture-card--0" data-stack="0">' +
    TIQ.views._buildCardHtml(cands[idx], true) +
    '<div class="capture-overlay capture-overlay--left"><span class="capture-overlay__label">REVIEWED</span></div>' +
    '<div class="capture-overlay capture-overlay--right"><span class="capture-overlay__label">FOLLOW UP</span></div>' +
  '</div>';
  for (var s = 1; s < stackSize; s++) {
    /* The per-index class drives the scale ramp in CSS; --peek marks it as a
       contentless deck edge rather than a real card. */
    stackHtml += '<div class="capture-card candidate-card capture-card--peek capture-card--' + s + '" data-stack="' + s + '" aria-hidden="true"></div>';
  }
  stackHtml += '</div>';

  var atEnd = idx >= cands.length - 1;

  var recordingsHtml = "";
  if (sel.audioNotes && sel.audioNotes.length) {
    recordingsHtml = sel.audioNotes.map(function(a, i) {
      return '<div class="audio-player-row"><span class="audio-label">Recording ' + (i + 1) + ' (' + a.duration + 's)</span><audio controls class="audio-ctrl" data-audio-blob-id="' + TIQ.escapeAttr(a.blobId) + '"></audio><button class="audio-delete-btn" data-audio-index="' + i + '" aria-label="Delete recording">✕</button></div>';
    }).join("");
  }
  recordingsHtml = recordingsHtml || '<p class="capture-intake-sub">No recordings yet.</p>';

  var drawerHtml = '<div class="capture-panel capture-panel--drawer">' +
    '<div class="drawer-tabs" role="tablist" aria-label="Candidate details">' +
      '<button type="button" id="capture-tab-resume" class="drawer-tab is-active" role="tab" data-drawer-tab="resume" aria-controls="capture-panel-resume" aria-selected="true">Resume</button>' +
      '<button type="button" id="capture-tab-notes" class="drawer-tab" role="tab" data-drawer-tab="notes" aria-controls="capture-panel-notes" aria-selected="false" tabindex="-1">Notes</button>' +
    '</div>' +
    '<div id="capture-panel-resume" class="drawer-panel is-active" role="tabpanel" aria-labelledby="capture-tab-resume" data-drawer-panel="resume">' +
      TIQ.views._capturePrintResumeHtml(sel) +
      TIQ.views._resumeConflictsHtml(sel) +
    '</div>' +
    '<div id="capture-panel-notes" class="drawer-panel" role="tabpanel" aria-labelledby="capture-tab-notes" data-drawer-panel="notes">' +
      '<label for="captureNotes" class="capture-section-title">Recruiter Notes</label>' +
      '<textarea id="captureNotes" class="capture-textarea capture-textarea--inline" rows="6" placeholder="Add notes about this candidate...">' + TIQ.escapeHtml(sel.notes) + '</textarea>' +
      '<section class="capture-recording-section" aria-labelledby="capture-recording-title">' +
        '<h3 class="capture-section-title" id="capture-recording-title">Voice recording</h3>' +
        TIQ.views._captureVoiceHtml(sel) +
        '<div id="audioRecordings" class="audio-recordings">' + recordingsHtml + '</div>' +
      '</section>' +
    '</div>' +
  '</div>';

  return '<div class="view app-view-container" id="view-capture" data-details-open="' + (TIQ.views._captureDetailsId === c.id ? 'true' : 'false') + '">' +
    '<div class="capture-layout">' +
      '<section class="capture-workspace">' +
'<div class="capture-col-left">' +
            '<div class="capture-stack-shell">' +
              stackHtml +
            '</div>' +
            '<div class="capture-triage">' +
              '<button type="button" class="capture-triage-btn capture-triage--review" id="captureReview" title="Mark this candidate as reviewed (swipe left)">' +
                '<span class="capture-triage-arrow" aria-hidden="true">&larr;</span><span class="capture-triage-label">Mark as reviewed</span>' +
              '</button>' +
              '<button type="button" class="capture-triage-btn capture-triage--undo" id="captureSkip" title="Undo last action">' +
                '<svg class="capture-triage-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>' +
                '<span class="capture-triage-label">Undo</span>' +
              '</button>' +
              '<button type="button" class="capture-triage-btn capture-triage--follow" id="captureFollow" title="Request follow-up for this candidate (swipe right)">' +
                '<span class="capture-triage-label">Request follow-up</span><span class="capture-triage-arrow" aria-hidden="true">&rarr;</span>' +
              '</button>' +
            '</div>' +
            '<button type="button" class="capture-evidence-open" data-capture-details-open>View resume &amp; evidence →</button>' +
          '</div>' +
         '<aside class="capture-col-right">' +
            '<div class="capture-evidence-toolbar"><div><span class="capture-evidence-toolbar__title">Candidate records</span>' +
             '</div><div class="capture-evidence-toolbar__actions">' +
             (TIQ.resumeInfo(sel).sourceUrl ? '<a class="capture-full-resume" href="' + TIQ.escapeAttr(TIQ.resumeInfo(sel).sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open original résumé</a>' : '') +
             '<button type="button" class="capture-evidence-back" data-capture-details-back aria-label="Back to candidate card">Back to card</button></div></div>' +
            drawerHtml +
        '</aside>' +
      '</section>' +

    '</div>' +
  '<div id="capture-skills-popover" class="capture-skills-popover" popover="auto" role="region" aria-label="Additional skills"><div class="capture-skills-popover__head"><h3>Additional skills</h3><button type="button" popovertarget="capture-skills-popover" popovertargetaction="hide" aria-label="Close additional skills">×</button></div><div data-remaining-skills></div></div></div>' +
  TIQ.views._newCandidateModalHtml();
};

TIQ.views.renderCapture = function() {
  return TIQ.views.renderRecruiterCapture();
};
function displayNameForEvidence(c) { return TIQ.views._displayName(c) || 'Candidate'; }

TIQ.views._newCandidateModalHtml = function() {
  return '<div id="newCandidateModal" class="modal-overlay" hidden>' +
    '<div class="modal-dialog">' +
      '<div class="modal-header">' +
        '<h3>Add New Candidate</h3>' +
        '<button class="modal-close" id="newCandidateClose">&times;</button>' +
      '</div>' +
      '<form id="newCandidateForm">' +
        '<div class="modal-body">' +
          '<div class="modal-row"><label>First Name *</label><input type="text" name="firstName" required /></div>' +
          '<div class="modal-row"><label>Last Name *</label><input type="text" name="lastName" required /></div>' +
          '<div class="modal-row"><label>Email *</label><input type="email" name="email" required /></div>' +
          '<div class="modal-row"><label>University</label><input type="text" name="university" /></div>' +
          '<div class="modal-row"><label>Major</label><input type="text" name="major" /></div>' +
          '<div class="modal-row"><label>Graduation</label><input type="text" name="graduationDate" placeholder="May 2027" /></div>' +
          '<div class="modal-row"><label>GPA</label><input type="text" name="gpa" placeholder="3.5" /></div>' +
          '<div class="modal-row"><label>Work Auth</label><input type="text" name="workAuthorization" placeholder="US Citizen" /></div>' +
          '<div class="modal-row"><label>Role</label><input type="text" name="function" placeholder="Software Engineer" /></div>' +
          '<div class="modal-row"><label>Resume</label><input type="file" name="resume" accept=".pdf" id="newCandidateResume" /></div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button type="button" class="secondary-button" id="newCandidateCancel">Cancel</button>' +
          '<button type="submit" class="primary-button">Add Candidate</button>' +
        '</div>' +
      '</form>' +
    '</div>' +
  '</div>';
};

TIQ.views._captureHistory = TIQ.views._captureHistory || [];

TIQ.views._renderCaptureComplete = function(cands) {
  var recruiterName = TIQ.recruiterName(TIQ.state.activeRecruiterId) || "Not selected";

  var counts = { New: 0, Reviewed: 0, "Follow-Up": 0, "Interview Requested": 0 };
  cands.forEach(function(c) { if (counts[c.recordStatus] !== undefined) counts[c.recordStatus]++; });

  var categories = [
    { status: "New", label: "New", color: "#FEDB00", borderColor: "#D4B800", count: counts.New },
    { status: "Reviewed", label: "Reviewed", color: "#16A34A", borderColor: "#15803D", count: counts.Reviewed },
    { status: "Follow-Up", label: "Follow-Up", color: "#D97706", borderColor: "#B45309", count: counts["Follow-Up"] },
    { status: "Interview Requested", label: "Interview Requested", color: "#005DBA", borderColor: "#003D7A", count: counts["Interview Requested"] }
  ];

  var categoryCardsHtml = categories.map(function(cat, i) {
    return '<div class="capture-complete__card" data-status="' + cat.status + '" style="border-left: 4px solid ' + cat.borderColor + ';animation-delay:' + (i * 80) + 'ms">' +
      '<div class="capture-complete__card-color" style="background:' + cat.color + '"></div>' +
      '<div class="capture-complete__card-info">' +
        '<div class="capture-complete__card-label">' + cat.label + '</div>' +
        '<div class="capture-complete__card-count">' + cat.count + ' candidate' + (cat.count !== 1 ? 's' : '') + '</div>' +
      '</div>' +
      '<button class="capture-complete__card-btn" data-view-status="' + cat.status + '">View in Review →</button>' +
    '</div>';
  }).join("");

  return '<div class="view app-view-container" id="view-capture">' +
    '<div class="capture-header">' +
      '<div><span class="section-kicker">Live Capture</span></div>' +
      '<div class="capture-meta"><span class="capture-recruiter">' + TIQ.escapeHtml(recruiterName) + '</span></div>' +
    '</div>' +
    '<div class="capture-complete">' +
      '<div class="capture-complete__icon">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>' +
      '</div>' +
      '<h2 class="capture-complete__title">All Done!</h2>' +
      '<p class="capture-complete__sub">You\'ve reviewed all ' + cands.length + ' candidate' + (cands.length !== 1 ? 's' : '') + '.</p>' +
      '<div class="capture-complete__categories">' + categoryCardsHtml + '</div>' +
      '<div class="capture-complete__actions">' +
        '<button class="primary-button" id="captureStartOver">Start Over</button>' +
        '<button class="secondary-button" id="captureBackToOverview">Back to event results</button>' +
        '<button class="secondary-button" id="captureGenerateDemo">Load demo data</button>' +
      '</div>' +
    '</div>' +
  '</div>';
};

TIQ.views.importResumeFiles = function(files) {
  files = Array.prototype.slice.call(files || []);
  if (!files.length || TIQ.views._importingResumes) return;
  TIQ.views._importingResumes = true;
  var created = 0;
  var failed = 0;
  var chain = Promise.resolve();
  files.forEach(function(file) {
    chain = chain.then(function() {
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
        failed++;
        return;
      }
      var c = {
        id: TIQ.CONFIG.idPrefix + (2500 + TIQ.state.candidates.length + created),
        firstName: "", lastName: "",
        email: "", phone: "", gpa: "", university: "", major: "",
        graduationDate: "", workAuthorization: "", workLocations: [],
        function: "", skills: [], areasDiscussed: [], notes: "",
        audioNotes: [], recordStatus: "New", priority: "Medium",
        approvalStatus: "Pending", createdAt: TIQ.nowISO(), lastUpdated: TIQ.nowISO(),
        capturedBy: TIQ.state.activeRecruiterId || "rec-1",
        parsedResume: null, resumeUpload: null, auditLog: [], traceability: [],
        accomplishments: [], summary: "", approvedBy: null, approvalTimestamp: null
      };
      TIQ.addAuditEntry(c, "CREATED", "Imported from resume " + file.name);
      TIQ.state.candidates.push(c);
      return TIQ.ai.parseAndStoreResume(c, file).then(function(parsed) {
        created++;
        if (!parsed) failed++;
        if (!c.summary) TIQ.ai.updateCandidateSummary(c);
      }).catch(function() {
        created++;
        failed++;
      });
    });
  });
  chain.then(function() {
    TIQ.views._importingResumes = false;
    TIQ.views._finalizeImport(created, failed);
  });
};

TIQ.views._finalizeImport = function(created, failed) {
  TIQ.logMetric({ type: "resume-import", count: created, failed: failed, recruiterId: TIQ.state.activeRecruiterId || "rec-1" });
  TIQ.saveState();
  TIQ.showToast(created + " candidate(s) imported" + (failed ? " (" + failed + " resume(s) could not be parsed)" : ""));
  TIQ.views._captureIndex = 0;
  TIQ.views._rerenderCapture();
};

TIQ.views._loadAudioBlobs = function() {
  var audios = document.querySelectorAll("audio[data-audio-blob-id]");
  audios.forEach(function(audio) {
    if (audio.src) return;
    var blobId = audio.dataset.audioBlobId;
    TIQ.AudioDB.getBlob(blobId).then(function(blob) {
      if (blob) {
        audio.src = URL.createObjectURL(blob);
      }
    });
  });
};

TIQ.views._revokeAudioUrls = function() {
  var audios = document.querySelectorAll("audio[data-audio-blob-id]");
  audios.forEach(function(audio) {
    if (audio.src && audio.src.startsWith("blob:")) {
      URL.revokeObjectURL(audio.src);
      audio.removeAttribute("src");
    }
  });
};

/* Resume preview — opens a lightweight read-only modal with the file name + candidate fields */
TIQ.views._previewResume = function(c, fileName) {
  var modal = document.createElement("div");
  modal.className = "resume-preview-modal";
  modal.innerHTML =
    '<div class="resume-preview-card">' +
      '<div class="resume-preview-head">' +
        '<div class="avatar-box" style="width:40px;height:40px;font-size:15px;border-radius:10px">' + TIQ.initialsFor(c) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="resume-preview-name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</div>' +
          '<div class="resume-preview-file">&#128196; ' + TIQ.escapeHtml(fileName) + '</div>' +
        '</div>' +
        '<button type="button" class="resume-preview-close" aria-label="Close preview">&#10005;</button>' +
      '</div>' +
      '<div class="resume-preview-body"><p>Resume files are referenced by the candidate\'s intake submission. Store the original upload in your ATS after the fair.</p></div>' +
    '</div>';
  document.body.appendChild(modal);
  function closePreview() { if (modal.parentNode) modal.parentNode.removeChild(modal); }
  modal.addEventListener("click", function(e) { if (e.target === modal || e.target.closest(".resume-preview-close")) closePreview(); });
  return modal;
};

TIQ.views.initCaptureEvents = function() {
  var container = document.getElementById("view-capture");
  if (!container) return;

  TIQ.views._loadAudioBlobs();

  /* The pre-existing animation consumes this frame unchanged. Measure chrome,
     not candidate content, then fit complete summary items into its remainder. */
  var workspace = container.querySelector('.capture-workspace');
  function fitStation() {
    if (!container.isConnected || !workspace) return;
    var main = document.querySelector('.main-content');
    /* viewContainer is outside the existing view-entry transform. Measuring the
       animated card/view would make its temporary offset alter the frame. */
    var host = document.getElementById('viewContainer');
    var top = (host || workspace).getBoundingClientRect().top + window.scrollY + (main ? main.scrollTop : 0);
    var bottom = main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 12;
    var available = Math.max(0, window.innerHeight - top - bottom);
    workspace.style.setProperty('--capture-available-height', available + 'px');
    var compact = available < 600 || workspace.clientWidth < 600;
    container.setAttribute('data-density', compact ? 'compact' : 'comfortable');
    var highlights = container.querySelector('.resume-highlights');
    if (highlights) highlights.hidden = false;
    var flags = container.querySelector('.card-flags__chips');
    if (flags) {
      var chips = Array.from(flags.children);
      chips.forEach(function(chip) { chip.hidden = false; });
      if (chips.length > 1 && flags.scrollWidth > flags.clientWidth) chips[1].hidden = true;
    }
  }
  if (TIQ.views._captureFrameObserver) TIQ.views._captureFrameObserver.disconnect();
  if (window.ResizeObserver) {
    TIQ.views._captureFrameObserver = new ResizeObserver(function() { fitStation(); fitSkills(); });
    TIQ.views._captureFrameObserver.observe(document.querySelector('.topbar'));
    TIQ.views._captureFrameObserver.observe(document.querySelector('.main-content'));
  }
  if (TIQ.views._captureFrameResize) window.removeEventListener('resize', TIQ.views._captureFrameResize);
  TIQ.views._captureFrameResize = function() { fitStation(); fitSkills(); };
  window.addEventListener('resize', TIQ.views._captureFrameResize);
  fitStation();

  var evidenceTabs = Array.from(container.querySelectorAll('[data-drawer-tab]'));
  evidenceTabs.forEach(function(tab, index) {
    tab.addEventListener('keydown', function(e) {
      if (!/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) return;
      e.preventDefault(); e.stopPropagation();
      var next = e.key === 'Home' ? 0 : e.key === 'End' ? evidenceTabs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + evidenceTabs.length) % evidenceTabs.length;
      evidenceTabs[next].click(); evidenceTabs[next].focus();
    });
  });

  function showEvidence(open) {
    var candidate = TIQ.state.candidates[TIQ.views._captureIndex];
    TIQ.views._captureDetailsId = open && candidate ? candidate.id : null;
    container.setAttribute('data-details-open', open ? 'true' : 'false');
    if (!open) { fitStation(); fitSkills(); }
    var focusTarget = container.querySelector(open ? '[data-capture-details-back]' : '[data-capture-details-open]');
    if (focusTarget && window.matchMedia && window.matchMedia('(max-width: 959px)').matches) focusTarget.focus();
  }
  var skillRow = container.querySelector('.capture-top-skills .capture-skill-pills');
  var skillPopover = container.querySelector('#capture-skills-popover');
  var skillButton = container.querySelector('[data-capture-skills]');
  function fitSkills() {
    if (!skillRow || !skillButton || !skillRow.clientWidth) return;
    if (skillPopover.matches(':popover-open')) skillPopover.hidePopover();
    var candidate = TIQ.state.candidates[TIQ.views._captureIndex];
    var skills = TIQ.views._captureSkills(candidate);
    var chips = Array.from(skillRow.querySelectorAll('[data-skill-index]'));
    chips.forEach(function(chip) { chip.hidden = false; });
    skillButton.hidden = false;
    skillButton.textContent = '+' + skills.length;
    var available = skillRow.clientWidth - skillButton.getBoundingClientRect().width - 6;
    var used = 0, count = 0;
    chips.forEach(function(chip, i) {
      var width = chip.getBoundingClientRect().width + (count ? 6 : 0);
      var fits = i === count && count < 4 && used + width <= available;
      chip.hidden = !fits;
      if (fits) { used += width; count++; }
    });
    /* With no overflow, do not reserve an unnecessary button. */
    if (skills.length <= 4 && chips.reduce(function(sum, chip) { chip.hidden = false; return sum + chip.getBoundingClientRect().width + 6; }, 0) - 6 <= skillRow.clientWidth) {
      count = skills.length;
      skillButton.hidden = true;
    } else chips.forEach(function(chip, i) { chip.hidden = i >= count; });
    skillButton.textContent = '+' + (skills.length - count);
    skillButton.setAttribute('aria-label', (skills.length - count) + ' additional skills');
    var groups = TIQ.categorizeSkills(skills.slice(count));
    if (!groups.length && count < skills.length) groups = [{label:'Other',items:skills.slice(count)}];
    skillPopover.querySelector('[data-remaining-skills]').innerHTML = groups.map(function(g) {
      return '<section><h4>' + TIQ.escapeHtml(g.label || 'Other') + '</h4><ul>' + g.items.map(function(s) { return '<li>' + TIQ.escapeHtml(s) + '</li>'; }).join('') + '</ul></section>';
    }).join('');
  }
  if (TIQ.views._captureSkillsObserver) TIQ.views._captureSkillsObserver.disconnect();
  if (skillRow && window.ResizeObserver) {
    TIQ.views._captureSkillsObserver = new ResizeObserver(fitSkills);
    TIQ.views._captureSkillsObserver.observe(skillRow);
  }
  fitSkills();
  if (document.fonts) document.fonts.ready.then(function() { if (container.isConnected) { fitStation(); fitSkills(); } });
  if (skillPopover) {
    skillPopover.addEventListener('toggle', function(e) {
      if (skillButton) skillButton.setAttribute('aria-expanded', String(e.newState === 'open'));
      if (e.newState === 'open' && skillButton) {
        var box = skillButton.getBoundingClientRect();
        skillPopover.style.left = Math.max(8, Math.min(box.left, window.innerWidth - skillPopover.offsetWidth - 8)) + 'px';
        skillPopover.style.top = Math.max(8, Math.min(box.bottom + 6, window.innerHeight - skillPopover.offsetHeight - 8)) + 'px';
      }
    });
  }
  container.addEventListener('keydown', function(e) {
    if (skillPopover && skillPopover.matches(':popover-open') && e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation(); skillPopover.hidePopover(); if (skillButton) skillButton.focus();
    } else if (e.target.closest('[data-capture-skills], .capture-skills-popover') && /^(ArrowLeft|ArrowRight| )$/.test(e.key)) e.stopPropagation();
  });

  container.addEventListener("click", function(e) {
    if (e.target.closest('[data-capture-details-open]')) { showEvidence(true); return; }
    if (e.target.closest('[data-capture-details-back]')) { showEvidence(false); return; }
    var sourceLink = e.target.closest('[data-resume-source]');
    if (sourceLink) {
      e.preventDefault();
      var candidate = TIQ.state.candidates[TIQ.views._captureIndex];
      var resumePanel = container.querySelector('[data-drawer-panel="resume"]');
      var resumeDocument = resumePanel && resumePanel.querySelector('.resume-document');
      var version = candidate && captureResumeVersion(candidate);
      var passageId = sourceLink.getAttribute('data-resume-source');
      var passage = resumeDocument && resumeDocument.dataset.candidateId === String(candidate && candidate.id) &&
        resumeDocument.dataset.resumeVersion === version
        ? Array.from(resumeDocument.querySelectorAll('[data-resume-passage-id]')).find(function(node) {
            return node.getAttribute('data-resume-passage-id') === passageId;
          })
        : null;
      showEvidence(true);
      var resumeTab = container.querySelector('[data-drawer-tab="resume"]');
      if (resumeTab) resumeTab.click();
      if (!passage) {
        var status = resumePanel && resumePanel.querySelector('.resume-source-status');
        if (status) status.hidden = false;
        else if (TIQ.showToast) TIQ.showToast('Source passage unavailable.');
        return;
      }
      var status = resumePanel.querySelector('.resume-source-status');
      if (status) status.hidden = true;
      resumeDocument.querySelectorAll('.is-source-highlighted').forEach(function(node) {
        node.classList.remove('is-source-highlighted');
        if (node.getAttribute('data-source-tabindex') === 'added') {
          node.removeAttribute('tabindex'); node.removeAttribute('data-source-tabindex');
        }
      });
      passage.classList.add('is-source-highlighted');
      if (!passage.hasAttribute('tabindex')) {
        passage.setAttribute('tabindex', '-1');
        passage.setAttribute('data-source-tabindex', 'added');
      }
      passage.scrollIntoView({block:'center', inline:'nearest'});
      passage.focus({preventScroll:true});
      var dismiss = resumePanel.querySelector('[data-resume-source-dismiss]');
      if (dismiss) dismiss.hidden = false;
      return;
    }
    if (e.target.closest('[data-resume-source-dismiss]')) {
      var resumePanel = container.querySelector('[data-drawer-panel="resume"]');
      if (resumePanel) {
        resumePanel.querySelectorAll('.is-source-highlighted').forEach(function(node) {
          node.classList.remove('is-source-highlighted');
          if (node.getAttribute('data-source-tabindex') === 'added') {
            node.removeAttribute('tabindex'); node.removeAttribute('data-source-tabindex');
          }
        });
        var dismiss = resumePanel.querySelector('[data-resume-source-dismiss]');
        if (dismiss) dismiss.hidden = true;
      }
      return;
    }
    var skipBtn = e.target.closest("#captureSkip");
    var reviewBtn = e.target.closest("#captureReview");
    var followBtn = e.target.closest("#captureFollow");
    var deleteBtn = e.target.closest(".audio-delete-btn");
    var startOverBtn = e.target.closest("#captureStartOver");
    var backBtn = e.target.closest("#captureBackToOverview");
    var categoryBtn = e.target.closest(".capture-complete__card-btn");
    var previewBtn = e.target.closest(".preview-btn");
    var flagChip = e.target.closest(".card-flag[data-flag-tab], .card-flag[data-flag-region]");

    /* Click-to-jump for the missing-information flags. Handled before the triage
       buttons: a flag chip is a <button>, so it must never fall through to a
       swipe commit, and the swipe engine already ignores pointerdown on buttons
       so no drag starts either. */
    if (flagChip) {
      e.preventDefault();
      e.stopPropagation();
      var flagTab = flagChip.getAttribute("data-flag-tab");
      var flagRegion = flagChip.getAttribute("data-flag-region");
      if (flagTab) {
        showEvidence(true);
        var jumpTab = this.querySelector('[data-drawer-tab="' + flagTab + '"]');
        if (jumpTab) jumpTab.click();
        var jumpPanel = this.querySelector('[data-drawer-panel="' + flagTab + '"]');
        if (jumpPanel) jumpPanel.scrollIntoView({ block: "nearest" });
      }
      if (flagRegion) {
        var region = this.querySelector(".capture-card--0 " + flagRegion);
        if (region) {
          region.scrollIntoView({ block: "nearest", behavior: "smooth" });
          region.classList.add("is-flagged");
          window.setTimeout(function() { region.classList.remove("is-flagged"); }, 1400);
        }
      }
      return;
    }

    if (skipBtn) {
      TIQ.views._undoLastCaptureAction();
    } else if (reviewBtn) {
      TIQ.views._animateSwipeOut("left");
    } else if (followBtn) {
      TIQ.views._animateSwipeOut("right");
    } else if (deleteBtn) {
      var delIdx = parseInt(deleteBtn.dataset.audioIndex);
      var c = TIQ.state.candidates[TIQ.views._captureIndex];
      if (c && c.audioNotes[delIdx]) {
        var blobId = c.audioNotes[delIdx].blobId;
        c.audioNotes.splice(delIdx, 1);
        TIQ.addAuditEntry(c, "AUDIO_DELETED", "Audio recording deleted");
        TIQ.saveState();
        if (blobId) TIQ.AudioDB.deleteBlob(blobId).catch(function() {});
        TIQ.views._rerenderCapture();
      }
    } else if (startOverBtn) {
      TIQ.views._captureIndex = 0;
      TIQ.views._rerenderCapture();
    } else if (backBtn) {
      TIQ.router.navigateTo("analytics");
    } else if (categoryBtn) {
      var status = categoryBtn.dataset.viewStatus;
      TIQ.views._aiReviewStatus = status;
      TIQ.router.navigateTo("review");
    } else if (e.target.closest("#captureImportEmpty")) {
      var impInput = document.getElementById("captureImportEmptyInput");
      if (impInput) impInput.click();
    } else if (previewBtn) {
      var pc = TIQ.state.candidates[TIQ.views._captureIndex];
      if (pc && pc.resumeUpload) {
        var pname = typeof pc.resumeUpload === "object" ? (pc.resumeUpload.name || "resume.pdf") : pc.resumeUpload;
        TIQ.views._previewResume(pc, pname);
      }
    } else if (e.target.closest("#captureGenerateDemo")) {
      if (!confirm('Add 48 synthetic sample records? Existing records are kept.')) return;
      var count = TIQ.views.generateDemoCandidates();
      if (count > 0) {
        TIQ.showToast(count + " demo candidate" + (count > 1 ? "s" : "") + " generated.");
        TIQ.views._captureIndex = 0;
        TIQ.views._rerenderCapture();
      } else {
        TIQ.showToast("All demo candidates already exist.");
      }
    } else if (e.target.closest("#captureNewCandidateEmpty")) {
      var modal3 = document.getElementById("newCandidateModal");
      if (modal3) modal3.hidden = false;
    } else if (e.target.closest("#newCandidateClose") || e.target.closest("#newCandidateCancel")) {
      var modal2 = document.getElementById("newCandidateModal");
      if (modal2) modal2.hidden = true;
    } else if (e.target.closest('[data-open-resume]')) {
      showEvidence(true);
      var openResumeTab = this.querySelector('[data-drawer-tab="resume"]');
      if (openResumeTab) openResumeTab.click();
      return;
    } else if (e.target.closest('[data-expand-roles]')) {
      var expBtn = e.target.closest('[data-expand-roles]');
      var expId = expBtn.getAttribute('data-expand-roles');
      TIQ.views._resumeExpanded[expId] = !TIQ.views._resumeExpanded[expId];
      TIQ.views._rerenderCapture();
      return;
    } else if (e.target.closest('[data-drawer-tab]')) {
      var tabBtn = e.target.closest('[data-drawer-tab]');
      var name = tabBtn.getAttribute('data-drawer-tab');
      this.querySelectorAll('[data-drawer-tab]').forEach(function (b) {
        b.classList.toggle('is-active', b === tabBtn);
        b.setAttribute('aria-selected', b === tabBtn ? 'true' : 'false');
        b.tabIndex = b === tabBtn ? 0 : -1;
      });
      this.querySelectorAll('[data-drawer-panel]').forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-drawer-panel') === name);
      });
      return;
    }
  });

  /* Native disclosures must not start a drag on their parent card. */
  container.querySelectorAll('.capture-card summary').forEach(function(summary) {
    summary.addEventListener('pointerdown', function(e) { e.stopPropagation(); });
  });

  var notes = document.getElementById("captureNotes");
  if (notes) {
    notes.addEventListener("change", function() {
      var c = TIQ.state.candidates[TIQ.views._captureIndex];
      if (c) { c.notes = notes.value; TIQ.addAuditEntry(c, "NOTES_UPDATED", "Notes updated"); TIQ.logMetric({ type: 'notes-updated', candidateId: c.id, recruiterId: c.capturedBy }); if (TIQ.ai && TIQ.ai.updateCandidateSummary) TIQ.ai.updateCandidateSummary(c); TIQ.saveState(); }
    });
  }

  var captureImportEmptyInput = document.getElementById("captureImportEmptyInput");
  if (captureImportEmptyInput) {
    captureImportEmptyInput.addEventListener("change", function() {
      TIQ.views.importResumeFiles(this.files);
      this.value = "";
    });
  }

  var drawerScan = document.getElementById("drawerResumeScan");
  if (drawerScan) {
    drawerScan.addEventListener("change", function() {
      var c = TIQ.state.candidates[TIQ.views._captureIndex];
      var file = this.files && this.files[0];
      this.value = "";
      if (!c || !file) return;
      if (TIQ.intake && !TIQ.intake.isParsableResume(file)) {
        TIQ.showToast("Only PDF resumes can be scanned.");
        return;
      }
      TIQ.showToast("Scanning " + file.name + "…");
      TIQ.ai.parseAndStoreResume(c, file).then(function(parsed) {
        if (parsed) {
          if (!c.summary) TIQ.ai.updateCandidateSummary(c);
          TIQ.showToast(c.firstName + " " + c.lastName + " resume scanned.");
        } else {
          TIQ.showToast("Could not scan " + file.name + " — it is flagged \"Resume Not Scanned\".");
        }
        TIQ.saveState();
        TIQ.views._rerenderCapture();
      });
      TIQ.views._rerenderCapture();
    });
  }

  var editToggle = container.querySelector(".capture-card__edit-toggle");
  if (editToggle) {
    editToggle.addEventListener("click", function() {
      var card = container.querySelector(".capture-card");
      if (!card) return;
      var isEditing = card.classList.toggle("capture-card--editing");
      editToggle.innerHTML = isEditing
        ? '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2"/></svg> Done'
        : '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke="currentColor" stroke-width="2"/></svg> Edit';
      var editables = card.querySelectorAll(".editable");
      for (var i = 0; i < editables.length; i++) {
        editables[i].contentEditable = isEditing ? "true" : "false";
        editables[i].classList.toggle("editing", isEditing);
      }
    });
  }

  container.addEventListener("focusout", function(e) {
    var field = e.target.closest(".editable");
    if (!field) return;
    var c = TIQ.state.candidates[TIQ.views._captureIndex];
    if (!c) return;
    var key = field.dataset.field;
    var val = (field.textContent || "").trim();
    if (key === "workLocations") {
      c.workLocations = val && val !== "—" ? val.split(",").map(function(v) { return v.trim(); }) : [];
    } else {
      c[key] = val === "—" ? "" : val;
    }
    c.provenance = c.provenance || {};
    c.provenance[key] = 'form';
    field.classList.remove("editing");
    TIQ.ai.updateCandidateSummary(c);
    TIQ.saveState();
  });

  var newForm = document.getElementById("newCandidateForm");
  if (newForm) {
    newForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var fd = new FormData(newForm);
      var firstName = (fd.get("firstName") || "").trim();
      var lastName = (fd.get("lastName") || "").trim();
      var email = (fd.get("email") || "").trim();
      if (!firstName || !lastName || !email) return;
      var nextId = "TQ-" + String(2500 + TIQ.state.candidates.length).slice(0);
      var newC = {
        id: nextId, firstName: firstName, lastName: lastName, email: email,
        phone: "", university: fd.get("university") || "", degreeProgram: "",
        major: fd.get("major") || "", graduationDate: fd.get("graduationDate") || "",
        gpa: fd.get("gpa") || "", resumeUpload: "",
        function: fd.get("function") || "General", workLocations: [],
        workAuthorization: fd.get("workAuthorization") || "",
        resumeAddress: "", links: {},
        skills: [], keySkills: [], areasDiscussed: [], notes: "",
        summary: "", traceability: [],
        recordStatus: "New", approvalStatus: "Pending",
        approverId: "", approvalTimestamp: "",
        followUpRequestedBy: "", followUpTimestamp: "",
        lastUpdated: TIQ.todayISO(), created_at: TIQ.nowISO(),
        priority: "Normal", attributes: [], audioNotes: [],
        auditLog: [{ action: "CREATED", recruiter_id: TIQ.state.activeRecruiterId, timestamp: TIQ.nowISO(), time_to_complete: 0, detail: "Manually created by recruiter during capture" }],
        reviewTimeMs: 0, noteEdits: 0
      };
      TIQ.state.candidates.push(newC);
      TIQ.addAuditEntry(newC, "CREATED", "Manually created during capture");
      TIQ.logMetric({ type: 'candidate-created', candidateId: newC.id, recruiterId: TIQ.state.activeRecruiterId, source: 'manual' });
      var resumeFile = document.getElementById("newCandidateResume");
      var file = resumeFile && resumeFile.files && resumeFile.files[0];
      if (file) {
        TIQ.ai.parseAndStoreResume(newC, file).then(function(parsed) {
          TIQ.ai.updateCandidateSummary(newC);
          TIQ.saveState();
          document.getElementById("newCandidateModal").hidden = true;
          newForm.reset();
          TIQ.views._rerenderCapture();
          if (!parsed) {
            TIQ.showToast("Candidate saved, but " + file.name + " could not be scanned. It is flagged \"Resume Not Scanned\".");
          }
        });
      } else {
        /* Nothing to scan, so nothing will backfill the degree. Same rule as
           intake.buildCandidate: only assume a default when no resume exists. */
        TIQ.ai.updateCandidateSummary(newC);
        TIQ.saveState();
        document.getElementById("newCandidateModal").hidden = true;
        newForm.reset();
        TIQ.views._rerenderCapture();
      }
    });
  }

    var recordBtn = document.getElementById("audioRecordBtn");
    if (recordBtn) {
      if (!TIQ.views._captureRecorder) TIQ.views._captureRecorder = new TIQ.AudioRecorder();
      var rec = TIQ.views._captureRecorder;
      var timerEl = document.getElementById("audioTimer");
      var timerInt = null;
      var voskLive = new TIQ.VoskLiveTranscriber();
      var transcriptPreview = document.getElementById("liveTranscriptPreview");
      var transcriptText = transcriptPreview ? transcriptPreview.querySelector(".live-transcript-text") : null;
      var recording = false;
      var targetCandidate = null;
      var saveInFlight = false;
      var widget = recordBtn.closest(".voice-memo-widget");

      var setWidgetRecording = function(on) {
        if (widget) widget.classList.toggle("is-recording", !!on);
      };

      /* Preload the Vosk model in the background as soon as capture opens */
      if (window.Vosk && !TIQ.OfflineTranscriber.isReady() && !TIQ.OfflineTranscriber.isLoading()) {
        TIQ.OfflineTranscriber.init().then(function() {
          console.log("[TalentIQ] Vosk model ready for live transcription");
        }).catch(function(err) {
          console.warn("[TalentIQ] Background Vosk preload failed:", err);
          if (!TIQ.views._voskToastShown) {
            TIQ.views._voskToastShown = true;
            TIQ.showToast("Transcription engine failed to load — recording still works.");
          }
        });
      }

      var setTranscript = function(text, color) {
        if (!transcriptPreview || !transcriptText) return;
        transcriptPreview.style.display = "flex";
        transcriptText.textContent = text;
        transcriptText.style.color = color || "";
      };

      var wireLiveTranscription = function() {
        if (!recording || voskLive.getState() === "listening" || voskLive.getState() === "flushing") return;
        if (!TIQ.OfflineTranscriber.isReady()) return;
        var sr = rec.getSampleRate ? rec.getSampleRate() : 16000;
        voskLive.onInterim = function(text) {
          if (transcriptText) transcriptText.textContent = text || "Listening...";
        };
        voskLive.onFinal = function() {};
        voskLive.onEnd = function() {};
        voskLive.onError = function(err) {
          console.warn("[TalentIQ] VoskLive error:", err);
          setTranscript("Transcription will process when you stop", "#9a8c6e");
        };
        voskLive.start(sr);
        rec.onAudioChunk = function(pcmChunk) {
          voskLive.feedChunk(pcmChunk, sr);
        };
        setTranscript("Listening...");
      };

      var setToggleGlyph = function(isRecording) {
        recordBtn.innerHTML = isRecording ? "&#9632;" : "&#9679;";
        recordBtn.setAttribute("aria-pressed", isRecording ? "true" : "false");
        recordBtn.title = isRecording ? "Stop & save" : "Start recording";
      };

      var resetRecordingUI = function() {
        recording = false;
        recordBtn.classList.remove("recording");
        setToggleGlyph(false);
        setWidgetRecording(false);
        if (timerInt) { clearInterval(timerInt); timerInt = null; }
        TIQ.views._stopLiveWaveform();
      };

      var finishRecording = function() {
        if (!recording || saveInFlight) return Promise.resolve();
        saveInFlight = true;
        resetRecordingUI();
        rec.onAudioChunk = null;

        var candidateAtStart = targetCandidate;
        return Promise.resolve(voskLive.stop()).then(function(voskTranscript) {
          return rec.stop().then(function(result) {
            if (!result) { saveInFlight = false; return; }
            var c = candidateAtStart;
            if (!c || TIQ.state.candidates.indexOf(c) === -1) {
              c = TIQ.state.candidates[TIQ.views._captureIndex];
            }
            if (!c) { saveInFlight = false; return; }

            var blobId = "audio_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
            var note = { id: Date.now(), blobId: blobId, duration: result.duration, createdAt: TIQ.nowISO(), offlinePending: !navigator.onLine, transcript: voskTranscript || "" };
            c.audioNotes.push(note);
            TIQ.addAuditEntry(c, "AUDIO_ADDED", "Voice note recorded (" + result.duration + "s)");
            TIQ.saveState();
            TIQ.AudioDB.saveBlob(blobId, result.blob).catch(function(err) {
              console.error("[TalentIQ] Failed to save audio blob:", err);
            });

            var applyTranscript = function(text) {
              note.transcript = text || "";
              if (text) {
                c.notes = (c.notes ? c.notes + "\n\n" : "") + "Unverified transcript (speaker not established): " + text;
                TIQ.showToast("Voice note saved + transcribed (" + result.duration + "s).");
              } else {
                TIQ.showToast("Voice note saved (" + result.duration + "s).");
              }
              var txt = (text || '').trim();
              if (txt) {
                var hydrate = TIQ.ai.hydrateTranscript(c, txt);
                if (hydrate.skillsAdded.length || hydrate.notesUpdated) TIQ.saveState();
              }
              if (TIQ.ai && TIQ.ai.updateCandidateSummary) TIQ.ai.updateCandidateSummary(c);
              TIQ.saveState();
              saveInFlight = false;
              if (TIQ.views._finishActiveRecording === finishRecording) TIQ.views._finishActiveRecording = null;
              TIQ.views._rerenderCapture();
            };

            if (voskTranscript) {
              console.log("[TalentIQ] Vosk live transcription complete:", voskTranscript);
              applyTranscript(voskTranscript);
            } else {
              setTranscript("Transcribing...");
              var offline = TIQ.OfflineTranscriber.isReady()
                ? Promise.resolve()
                : TIQ.OfflineTranscriber.init();
              offline.then(function() {
                return TIQ.OfflineTranscriber.transcribe(result.blob);
              }).then(function(text) {
                console.log("[TalentIQ] Vosk full transcription complete:", text);
                applyTranscript(text || "");
              }).catch(function(err) {
                console.error("[TalentIQ] Vosk full transcription failed:", err);
                note.transcript = "";
                saveInFlight = false;
                if (TIQ.views._finishActiveRecording === finishRecording) TIQ.views._finishActiveRecording = null;
                TIQ.showToast("Voice note saved (" + result.duration + "s). Transcription unavailable.");
                TIQ.views._rerenderCapture();
              });
            }
          });
        });
      };
      TIQ.views._finishActiveRecording = finishRecording;

      recordBtn.addEventListener("click", function() {
        if (saveInFlight) return;

        /* Local flag drives save; recorder state may be orphaned after a re-render */
        if (recording) {
          finishRecording();
          return;
        }
        if (rec.getState() === "recording") {
          /* Orphaned singleton recorder — force cleanup then start fresh */
          try { rec.cancel(); } catch (ex) {}
          resetRecordingUI();
        }

        targetCandidate = TIQ.state.candidates[TIQ.views._captureIndex] || null;
        var consent = document.getElementById('recordingConsent');
        if (!consent || !consent.checked) { TIQ.showToast('Ask for recording permission, or continue with typed notes.'); return; }
        if (targetCandidate) { targetCandidate.consent = Object.assign({}, targetCandidate.consent || {}, {audio:true,audioAt:TIQ.nowISO()}); TIQ.saveState(); }

        /* Mic first — never block on the Vosk model download */
        rec.start().then(function() {
          recording = true;
          saveInFlight = false;
          recordBtn.classList.add("recording");
          setToggleGlyph(true);
          setWidgetRecording(true);

          var sec = 0;
          if (timerEl) {
            timerEl.textContent = "00:00";
            timerInt = setInterval(function() {
              sec++;
              timerEl.textContent = String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
            }, 1000);
          }

          setTranscript("Listening...");
          TIQ.views._startLiveWaveform(rec);

          if (TIQ.OfflineTranscriber.isReady()) {
            console.log("[TalentIQ] Starting Vosk live streaming transcription");
            wireLiveTranscription();
          } else {
            console.log("[TalentIQ] Vosk not ready, loading model in parallel...");
            setTranscript("Loading transcription engine...");
            TIQ.OfflineTranscriber.init().then(function() {
              console.log("[TalentIQ] Vosk model loaded, starting live transcription");
              wireLiveTranscription();
            }).catch(function() {
              setTranscript("Transcription will process when you stop", "#9a8c6e");
            });
          }
        }).catch(function(err) {
          console.error("[TalentIQ] Failed to start recording:", err);
          resetRecordingUI();
        });
      });
    }

    document.addEventListener("keydown", TIQ.views._captureKeyHandler);
  TIQ.views.initSwipeEngine();
};

/* ---- Swipe Engine ---- */
TIQ.views.initSwipeEngine = function() {
  var frontCard = document.querySelector(".capture-card--0");
  if (!frontCard) return;

  var startX = 0, startY = 0, dx = 0, dragging = false, dominantAxis = null;

  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    /* Don't hijack clicks on interactive controls (record toggle, audio players, etc.) */
    if (e.target.closest("button, a, input, textarea, select, audio, label, .voice-memo-widget")) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    dominantAxis = null;
    frontCard.classList.add("capture-card--swiping");
    frontCard.classList.remove("capture-card--spring");
    try { frontCard.setPointerCapture(e.pointerId); } catch(ex) {}
  }

  function onPointerMove(e) {
    if (!dragging) return;
    dx = e.clientX - startX;
    var dy = e.clientY - startY;

    if (!dominantAxis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      dominantAxis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (!dominantAxis) return;

    if (dominantAxis === "h") {
      var rot = dx * 0.08;
      frontCard.style.transform = "translateX(" + dx + "px) rotate(" + rot + "deg)";
      var progress = Math.min(Math.abs(dx) / 120, 1);
      var leftOvl = frontCard.querySelector(".capture-overlay--left");
      var rightOvl = frontCard.querySelector(".capture-overlay--right");
      if (leftOvl) leftOvl.style.opacity = dx < 0 ? progress : 0;
      if (rightOvl) rightOvl.style.opacity = dx > 0 ? progress : 0;
    } else {
      var moveY = Math.min(dy, 0);
      frontCard.style.transform = "translateY(" + moveY + "px)";
    }
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    frontCard.classList.remove("capture-card--swiping");

    if (dominantAxis === "h" && Math.abs(dx) > 100) {
      TIQ.views._animateSwipeOut(dx < 0 ? "left" : "right");
    } else {
      TIQ.views._springBack();
    }
  }

  frontCard.addEventListener("pointerdown", onPointerDown);
  frontCard.addEventListener("pointermove", onPointerMove);
  frontCard.addEventListener("pointerup", onPointerUp);
  frontCard.addEventListener("pointercancel", onPointerUp);
};

TIQ.views._animateSwipeOut = function(direction) {
  var frontCard = document.querySelector(".capture-card--0");
  if (!frontCard) { TIQ.views._applySwipeAction(direction); return; }

  var transforms = {
    left: "translateX(-60%) rotate(-15deg)",
    right: "translateX(60%) rotate(15deg)"
  };

  frontCard.classList.remove("capture-card--swiping");
  frontCard.classList.add("capture-card--exiting");
  frontCard.style.zIndex = "120";
  frontCard.getBoundingClientRect();
  requestAnimationFrame(function() {
    frontCard.style.transform = transforms[direction];
    /* Reduced motion neutralises the transform in CSS (transform: none
       !important), so the card fades in place instead of travelling. */
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frontCard.style.opacity = "0";
    }
  });

  var leftOvl = frontCard.querySelector(".capture-overlay--left");
  var rightOvl = frontCard.querySelector(".capture-overlay--right");
  if (direction === "left" && leftOvl) { leftOvl.style.transition = "opacity 750ms ease"; leftOvl.style.opacity = "1"; }
  else if (leftOvl) leftOvl.style.opacity = "0";
  if (direction === "right" && rightOvl) { rightOvl.style.transition = "opacity 750ms ease"; rightOvl.style.opacity = "1"; }
  else if (rightOvl) rightOvl.style.opacity = "0";

  var done = false;
  function onEnd(e) {
    /* transform and opacity both transition; ignore the bubbling transitionend
       from the overlays so the action fires exactly once, on our own property. */
    if (e && e.target !== frontCard) return;
    if (done) return;
    done = true;
    frontCard.removeEventListener("transitionend", onEnd);
    TIQ.views._applySwipeAction(direction);
  }
  frontCard.addEventListener("transitionend", onEnd);
  /* Safety net for reduced-motion and browsers that omit transitionend. */
  setTimeout(onEnd, 850);
};

TIQ.views._springBack = function() {
  var frontCard = document.querySelector(".capture-card--0");
  if (!frontCard) return;
  frontCard.classList.remove("capture-card--swiping");
  frontCard.classList.add("capture-card--spring");
  frontCard.style.transform = "";
  frontCard.style.opacity = "";
  frontCard.style.zIndex = "";
  var leftOvl = frontCard.querySelector(".capture-overlay--left");
  var rightOvl = frontCard.querySelector(".capture-overlay--right");
  if (leftOvl) leftOvl.style.opacity = 0;
  if (rightOvl) rightOvl.style.opacity = 0;
};

TIQ.views._applySwipeAction = function(direction) {
  if (direction === "left") {
    TIQ.views._setCaptureStatus("Reviewed");
  } else if (direction === "right") {
    TIQ.views._setCaptureStatus("Follow-Up");
  }
};

TIQ.views._captureSkip = function() {
  var cands = TIQ.state.candidates;
  if (TIQ.views._captureIndex >= cands.length - 1) return;
  TIQ.views._captureIndex++;
  TIQ.views._rerenderCapture();
};

TIQ.views._undoLastCaptureAction = function() {
  var last = TIQ.views._captureHistory.pop();
  if (!last) {
    TIQ.showToast("Nothing to undo.");
    return;
  }

  var c = TIQ.state.candidates[last.index];
  if (!c || c.id !== last.candidateId) {
    TIQ.showToast("Nothing to undo.");
    return;
  }

  c.recordStatus = last.prevStatus;
  c.approverId = last.prevApproverId;
  c.approvalTimestamp = last.prevApprovalTimestamp;
  c.priority = last.prevPriority;
  if ((c.auditLog || []).length > last.auditLogLength) {
    c.auditLog.splice(last.auditLogLength);
  }

  TIQ.views._captureIndex = last.index;
  TIQ.saveState();
  TIQ.views._rerenderCapture();
  TIQ.showToast("Undid " + last.status + ".");
};

TIQ.views._captureKeyHandler = function(e) {
  var view = document.getElementById("view-capture");
  if (!view || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
  if (TIQ.views._captureIndex >= TIQ.state.candidates.length) return;
  if (e.key === "ArrowLeft") { e.preventDefault(); TIQ.views._animateSwipeOut("left"); }
  else if (e.key === "ArrowRight") { e.preventDefault(); TIQ.views._animateSwipeOut("right"); }
  else if (e.key === "Escape") {
    e.preventDefault();
    TIQ.views._undoLastCaptureAction();
  } else if (e.key === " ") {
    e.preventDefault();
    TIQ.views._captureSkip();
  }
};

TIQ.views._setCaptureStatus = function(status) {
  var c = TIQ.state.candidates[TIQ.views._captureIndex];
  if (!c) return;
  var prevStatus = c.recordStatus;
  TIQ.views._captureHistory.push({
    index: TIQ.views._captureIndex,
    candidateId: c.id,
    prevStatus: prevStatus,
    prevApproverId: c.approverId || "",
    prevApprovalTimestamp: c.approvalTimestamp || "",
    prevPriority: c.priority || "",
    auditLogLength: (c.auditLog || []).length,
    status: status
  });
  c.recordStatus = status;
  if (status === "Follow-Up" || status === "Interview Requested") c.priority = "High";
  c.approverId = TIQ.state.activeRecruiterId;
  c.approvalTimestamp = TIQ.nowISO();
  TIQ.addAuditEntry(c, status === "Reviewed" ? "APPROVED" : status === "Interview Requested" ? "INTERVIEW_REQUESTED" : "FOLLOW_UP", "Status changed to " + status);
  TIQ.logMetric({ type: "capture-status", candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId, recordStatus: status });
  TIQ.saveState();

  var undoAction = function() {
    c.recordStatus = prevStatus;
    c.approverId = "";
    c.approvalTimestamp = "";
    c.auditLog.pop();
    TIQ.saveState();
    TIQ.views._rerenderCapture();
  };

  TIQ.showUndoToast(c.firstName + " marked as " + status, undoAction);
  TIQ.views._captureIndex++;
  TIQ.views._rerenderCapture();
};

TIQ.views._finishActiveRecording = null;

TIQ.views._rerenderCapture = function() {
  /* Flush any in-progress voice memo before the card DOM is replaced */
  if (TIQ.views._finishActiveRecording && TIQ.views._captureRecorder && TIQ.views._captureRecorder.getState() === "recording") {
    TIQ.views._finishActiveRecording();
  }
  document.removeEventListener("keydown", TIQ.views._captureKeyHandler);
  TIQ.views._revokeAudioUrls();
  var container = document.getElementById("viewContainer");
  if (!container) return;
  var existing = document.getElementById("view-capture");
  if (existing) {
    existing.outerHTML = TIQ.views.renderRecruiterCapture();
  } else {
    container.innerHTML = TIQ.views.renderRecruiterCapture();
  }
  TIQ.views.initCaptureEvents();
};

/* ---- AI Summary + Review View ---- */
TIQ.views._aiReviewSelected = null;
TIQ.views._aiReviewActiveTab = 0;
TIQ.views._aiReviewDrafts = {};
TIQ.views._aiReviewCompare = [];
TIQ.views._aiReviewSearch = "";
TIQ.views._aiReviewStatus = "all";
TIQ.views._aiReviewFunc = "all";
TIQ.views._aiReviewPriority = "all";

TIQ.views.renderAIReview = function() {
  var filtered = TIQ.views._getFilteredCandidates();
  var sel = TIQ.views._aiReviewSelected || (filtered.length ? filtered[0].id : "");
  var selCandidate = filtered.find(function(c) { return c.id === sel; }) || filtered[0] || null;
  if (selCandidate) TIQ.views._aiReviewSelected = selCandidate.id;

  var listHtml = TIQ.views._renderAIReviewList(filtered, selCandidate ? selCandidate.id : "");

  var detailHtml = selCandidate ? TIQ.views._renderDetailPanel(selCandidate) :
    '<div class="ai-detail-empty"><p>No matching records. Capture a candidate or clear the current filters.</p><button class="primary-button" data-go="capture">Go to Capture</button></div>';

  return '<div class="view" id="view-ai-review">' +
    (TIQ.views._reviewMissingFlag ? '<p class="results-intro">Missing ' + TIQ.escapeHtml(TIQ.views._reviewMissingFlag) + ' · population: ' + TIQ.escapeHtml(TIQ.views._reviewEventScope || 'all') + ' <button class="secondary-button small-button" id="clearMissingScope">Show all records</button></p>' : '') +
    '<div class="ai-filter-bar" aria-label="Filter candidate records">' +
      '<select id="aiStatusFilter"><option value="all">All Statuses</option>' + TIQ.CONFIG.statuses.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join("") + '</select>' +
      '<select id="aiFuncFilter"><option value="all">All Functions</option>' + TIQ.CONFIG.functions.map(function(f) { return '<option value="' + f + '">' + f + '</option>'; }).join("") + '</select>' +
      '<select id="aiPriorityFilter"><option value="all">All Priority</option>' + TIQ.CONFIG.priorities.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join("") + '</select>' +
      '<div class="search-inline"><svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.2-4.2" fill="none" stroke="currentColor" stroke-width="2"/></svg><input id="aiSearch" type="search" aria-label="Filter review candidates" placeholder="Filter candidates…" value="' + TIQ.escapeAttr(TIQ.views._aiReviewSearch) + '" /></div>' +
      '<button class="secondary-button small-button" id="aiExportCsv">Export CSV</button>' +
      '<button class="secondary-button small-button" id="aiExportJson">Export JSON</button>' +
    '</div>' +
    TIQ.howItWorksHtml() +
    '<div class="ai-layout review-layout">' +
      '<div class="ai-list-panel"><div class="ai-list-count"><span>' + filtered.length + ' candidates</span><span class="ai-list-count__hint">Select up to 3 to compare</span></div><div class="ai-list" id="aiCandidateList">' + listHtml + '</div></div>' +
      '<div class="ai-detail-panel" id="aiDetailPanel">' + detailHtml + '</div>' +
    '</div>' +
    '<div id="aiCompareBar" class="compare-bar" hidden></div>' +
  '</div>';
};

TIQ.views._renderAIReviewList = function(filtered, selectedId) {
  return filtered.map(function(c) {
    var flags = TIQ.getMissingFlags(c);
    var sc = TIQ.statusClassMap[c.recordStatus] || "status-new";
    var checked = TIQ.views._aiReviewCompare.indexOf(c.id) >= 0;
    return '<div class="ai-list-item' + (c.id === selectedId ? " ai-list-item--selected" : "") + '" data-id="' + TIQ.escapeAttr(c.id) + '">' +
      '<label class="compare-check"><input type="checkbox" ' + (checked ? "checked" : "") + ' aria-label="Compare ' + TIQ.escapeAttr(c.firstName) + '" /></label>' +
      '<div class="ai-list-item__info">' +
        '<div class="ai-list-item__name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</div>' +
        '<div class="ai-list-item__meta">' + TIQ.escapeHtml(c.university) + ' &bull; ' + TIQ.escapeHtml(c.major) + '</div>' +
      '</div>' +
      '<span class="status-chip ' + sc + '">' + TIQ.escapeHtml(c.recordStatus) + '</span>' +
      '<span class="flag-count' + (flags.length ? '' : ' flag-count--ok') + '" aria-label="' + flags.length + ' missing information items">' + flags.length + '</span>' +
    '</div>';
  }).join("");
};

TIQ.views._refreshAIReviewList = function() {
  var filtered = TIQ.views._getFilteredCandidates();
  var selected = filtered.find(function(c) { return c.id === TIQ.views._aiReviewSelected; }) || filtered[0] || null;
  var count = document.querySelector("#view-ai-review .ai-list-count");
  var list = document.getElementById("aiCandidateList");
  if (count) count.textContent = filtered.length + " candidates";
  if (list) list.innerHTML = TIQ.views._renderAIReviewList(filtered, selected ? selected.id : "");
};

TIQ.views._refreshAIReviewCompareBar = function() {
  var bar = document.getElementById("aiCompareBar");
  if (!bar) return;
  if (TIQ.views._aiReviewCompare.length >= 2) {
    bar.hidden = false;
    bar.classList.add("visible");
    bar.innerHTML = '<span class="compare-bar__count">' + TIQ.views._aiReviewCompare.length + ' candidates selected</span><button class="primary-button small-button" id="aiCompareOpen">Compare Selected</button><button class="secondary-button small-button" id="aiCompareClear">Clear</button>';
    document.getElementById("aiCompareOpen").addEventListener("click", function() { TIQ.views._openCompareModal(TIQ.views._aiReviewCompare); });
    document.getElementById("aiCompareClear").addEventListener("click", function() { TIQ.views._aiReviewCompare = []; TIQ.views._refreshAIReviewList(); TIQ.views._refreshAIReviewCompareBar(); });
  } else {
    bar.hidden = true;
    bar.classList.remove("visible");
    bar.innerHTML = "";
  }
};

TIQ.views._refreshAIReviewResumePanel = function(candidate) {
  var panel = document.querySelector('#aiDetailPanel [data-tab-panel="resume"]');
  if (panel && candidate) panel.innerHTML = TIQ.views._renderResumeSection(candidate) + TIQ.views._renderReviewResumeSupplement(candidate);
};

TIQ.views._refreshAIReviewDetail = function(candidate) {
  if (!candidate) return;
  var detail = document.querySelector("#aiDetailPanel .ai-detail[data-candidate-id]");
  if (!detail || detail.getAttribute("data-candidate-id") !== candidate.id) return;
  var status = detail.querySelector("[data-snapshot-status]");
  if (status) status.textContent = "Extraction Snapshot · " + (candidate.approvalStatus || "Pending");
  var snapshot = detail.querySelector("#snapshotEdit");
  var draft = TIQ.views._aiReviewDrafts[candidate.id] || {};
  if (snapshot && !Object.prototype.hasOwnProperty.call(draft, "summary")) {
    snapshot.value = candidate.summary || "No summary generated. Upload a resume or complete fields to auto-generate.";
  }
  if (TIQ.views._renderAiIntegrity) TIQ.views._renderAiIntegrity(candidate);
};

TIQ.views._getFilteredCandidates = function() {
  var s = TIQ.views._aiReviewSearch.toLowerCase();
  return TIQ.eventRecords ? TIQ.eventRecords(TIQ.views._reviewEventScope || 'all').filter(match) : TIQ.state.candidates.filter(match);
  function match(c) {
    var matchSearch = !s || [c.firstName, c.lastName, c.major, c.function, c.university, (c.skills || []).join(" "), c.notes, (c.areasDiscussed || []).join(" "), TIQ.getMissingFlags(c).map(function(f) { return f.label; }).join(" ")].some(function(v) { return String(v).toLowerCase().indexOf(s) >= 0; });
    var matchStatus = TIQ.views._aiReviewStatus === "all" || c.recordStatus === TIQ.views._aiReviewStatus;
    var matchFunc = TIQ.views._aiReviewFunc === "all" || c.function === TIQ.views._aiReviewFunc;
    var matchPri = TIQ.views._aiReviewPriority === "all" || c.priority === TIQ.views._aiReviewPriority;
    var matchMissing = !TIQ.views._reviewMissingFlag || TIQ.getMissingFlags(c).some(function(f) { return f.key === TIQ.views._reviewMissingFlag; });
    return matchSearch && matchStatus && matchFunc && matchPri && matchMissing;
  }
};

TIQ.views._rawOpen = {};

/* Structured resume block — shared by the detail panel. Shows scan state,
   the extracted values themselves (not counts), and where each value came
   from, so the review surface finally represents the resume. */
TIQ.views._renderResumeSection = function(c) {
  var info = TIQ.resumeInfo(c);
  var parsed = c.parsedResume || null;
  var state = parsed ? "scanned" : info.state;
  var dotMod = state === "scanned" ? "is-ok" : (state === "failed" ? "is-bad" : "is-warn");
  var stateLabel = state === "scanned" ? "SCANNED"
    : state === "failed" ? "SCAN FAILED"
    : state === "legacy" ? "NOT SCANNED"
    : state === "missing" ? "NO RESUME ATTACHED"
    : state === "pending" ? "PARSING..."
    : "NOT SCANNED";
  var when = info.parsedAt ? TIQ.views._formatScanTime(info.parsedAt) : "";
  var rawText = (parsed && parsed.rawText) ? plainResumeSpelling(parsed.rawText) : "";
  var rawOpen = !!TIQ.views._rawOpen[c.id];

  var edu = (parsed && parsed.education && parsed.education.length) ? parsed.education[0] : null;
  var exp = (parsed && parsed.experience) || [];
  var certs = (parsed && parsed.certifications) || [];
  var projects = (parsed && parsed.projects) || [];
  var expanded = !!TIQ.views._resumeExpanded[c.id];

  var rows = "";

  if (edu) {
    var degreeLine = [edu.degree, edu.major].filter(Boolean).join(" ");
    var schoolLine = [edu.school, edu.year].filter(Boolean).join(" \u00B7 ");
    rows += '<div class="resume-fact">' +
      '<span class="resume-fact__label">EDUCATION</span>' +
      '<div class="resume-fact__body">' +
        (degreeLine ? '<span class="resume-fact__strong">' + TIQ.escapeHtml(degreeLine) + '</span>' : '') +
        (schoolLine ? '<span class="resume-fact__sub">' + TIQ.escapeHtml(schoolLine) + '</span>' : '') +
      '</div>' +
    '</div>';
  }

  if (exp.length) {
    var shownExp = expanded ? exp : exp.slice(0, 2);
    var expItems = shownExp.map(function(x) {
      return '<div class="resume-exp">' +
        '<div class="resume-exp__head">' +
          '<span class="resume-exp__title">' + TIQ.escapeHtml(x.title || "Role") + '</span>' +
          (x.dates ? '<span class="resume-exp__dates">' + TIQ.escapeHtml(x.dates) + '</span>' : '') +
        '</div>' +
        (x.company ? '<span class="resume-exp__org">' + TIQ.escapeHtml(x.company) + '</span>' : '') +
        (x.description ? '<span class="resume-exp__desc">' + TIQ.escapeHtml(x.description.length > 220 ? x.description.slice(0, 217) + '...' : x.description) + '</span>' : '') +
      '</div>';
    }).join("");
    var expanderHtml = "";
    if (exp.length > 2) {
      var hiddenRoles = exp.length - 2;
      expanderHtml = expanded
        ? '<button type="button" class="resume-expander" data-expand-roles="' + TIQ.escapeAttr(c.id) + '">Show fewer &#9652;</button>'
        : '<button type="button" class="resume-expander" data-expand-roles="' + TIQ.escapeAttr(c.id) + '">+' + hiddenRoles + ' earlier role' + (hiddenRoles === 1 ? '' : 's') + ' &#9662;</button>';
    }
    rows += '<div class="resume-fact resume-fact--exp">' +
      '<span class="resume-fact__label">EXPERIENCE<span class="resume-fact__count">' + shownExp.length + ' of ' + exp.length + '</span></span>' +
      '<div class="resume-fact__body">' + expItems + expanderHtml + '</div>' +
    '</div>';
  }

  function listRow(label, values) {
    if (!values.length) return "";
    return '<div class="resume-fact resume-fact--compact">' +
      '<span class="resume-fact__label">' + label + '</span>' +
      '<span class="resume-fact__inline">' + TIQ.escapeHtml(values.join(" \u00B7 ")) + '</span>' +
    '</div>';
  }

  rows += listRow("PROJECTS", projects.map(function(p) { return p.name; }).filter(Boolean));
  rows += listRow("CERTIFICATIONS", certs);

  var contactBits = [];
  if (c.email) {
    contactBits.push('<span class="resume-contact__item">' + TIQ.escapeHtml(c.email) +
      (TIQ.fieldSource(c, "email") === "resume" ? '<span class="prov-dot prov-dot--resume" title="Extracted from the scanned PDF"></span>' : '') + '</span>');
  }
  if (c.phone) {
    contactBits.push('<span class="resume-contact__item">' + TIQ.escapeHtml(c.phone) +
      (TIQ.fieldSource(c, "phone") === "resume" ? '<span class="prov-dot prov-dot--resume" title="Extracted from the scanned PDF"></span>' : '') + '</span>');
  }
  if (contactBits.length) {
    rows += '<div class="resume-fact resume-fact--compact">' +
      '<span class="resume-fact__label">CONTACT</span>' +
      '<span class="resume-fact__inline resume-contact">' + contactBits.join(" ") + '</span>' +
    '</div>';
  }

  var body = rows || '<p class="resume-empty">No structured resume data yet. Scan a PDF to extract education, experience, skills, certifications and contact details.</p>';

  return '<section class="ai-section ai-section--resume">' +
    '<div class="section-title"><span class="section-kicker">Resume</span></div>' +
    '<div class="resume-status-row">' +
      '<span class="resume-dot ' + dotMod + '" aria-hidden="true"></span>' +
      '<span class="resume-status-row__label">' + TIQ.escapeHtml(stateLabel) + '</span>' +
      (when ? '<span class="resume-status-row__time">' + TIQ.escapeHtml(when) + '</span>' : '') +
      '<span class="resume-status-row__file">' + TIQ.escapeHtml(info.name || "No file attached") + '</span>' +
    '</div>' +
    (state === "failed" && info.error ? '<p class="resume-error">' + TIQ.escapeHtml(info.error) + '</p>' : '') +
    '<div class="resume-actions">' +
      (rawText ? '<button type="button" class="secondary-button small-button" data-toggle-raw>' + (rawOpen ? "Hide raw text" : "View raw text") + '</button>' : '') +
      '<button type="button" class="secondary-button small-button" data-action="rescan">' + (parsed ? "Rescan" : "Scan resume") + '</button>' +
      '<input type="file" accept=".pdf" hidden data-resume-rescan />' +
    '</div>' +
    (rawText && rawOpen ? '<pre class="drawer-raw resume-raw">' + TIQ.escapeHtml(rawText) + '</pre>' : '') +
    body +
    '<div class="provenance-legend">' +
      '<span><span class="prov-dot prov-dot--resume" aria-hidden="true"></span> extracted from the scanned resume</span>' +
      '<span><span class="prov-dot prov-dot--form" aria-hidden="true"></span> entered in the form or conversation</span>' +
    '</div>' +
  '</section>';
};

TIQ.views._renderReviewResumeSupplement = function(c) {
  var parsed = c.parsedResume || {};
  var rows = '';
  var workAuthorization = parsed.workAuthorization || c.workAuthorization;
  if (workAuthorization) {
    rows += '<div class="resume-fact resume-fact--compact"><span class="resume-fact__label">WORK AUTHORIZATION</span><span class="resume-fact__inline">' + TIQ.escapeHtml(workAuthorization) + '</span></div>';
  }
  var address = (parsed.contact && parsed.contact.address) || c.resumeAddress || c.address;
  if (address) {
    rows += '<div class="resume-fact resume-fact--compact"><span class="resume-fact__label">RESUME ADDRESS</span><span class="resume-fact__inline">' + TIQ.escapeHtml(address) + '</span></div>';
  }
  var links = parsed.links || {};
  var linkKeys = ['linkedin', 'github', 'portfolio'].filter(function(key) { return !!links[key]; });
  if (linkKeys.length) {
    rows += '<div class="resume-fact resume-fact--compact"><span class="resume-fact__label">LINKS</span><span class="resume-fact__inline resume-links">' + linkKeys.map(function(key) { return resumeLinkHtml(links[key]); }).join(' ') + '</span></div>';
  }
  return rows ? '<div class="resume-review-extras">' + rows + '</div>' : '';
};

TIQ.views._renderDetailPanel = function(c) {
  if (!c.summary && TIQ.ai && TIQ.ai.generateSummary) {
    TIQ.ai.updateCandidateSummary(c);
  }
  var drafts = TIQ.views._aiReviewDrafts || (TIQ.views._aiReviewDrafts = {});
  var draft = drafts[c.id] || (drafts[c.id] = {});
  var flags = TIQ.getMissingFlags(c);
  var flagsHtml = flags.length ? flags.map(function(f) {
    return '<button type="button" class="flag-chip flag-actionable" data-flag-key="' + TIQ.escapeAttr(f.key) + '">' + TIQ.escapeHtml(f.label) + '</button>';
  }).join("") : '<span class="flag-chip flag-clear">[No Critical Missing Info]</span>';

  var aiMissing = [];
  if (TIQ.ai && TIQ.ai.generateSummary) {
    var aiResult = TIQ.ai.generateSummary(c);
    aiMissing = aiResult.missingData || [];
  }
  var aiMissingHtml = aiMissing.length ? aiMissing.map(function(m) {
    return '<button type="button" class="flag-chip flag-ai-missing" data-flag-key="' + TIQ.escapeAttr(m.key) + '"><span class="flag-source">' + TIQ.escapeHtml(m.source) + '</span> ' + TIQ.escapeHtml(m.label) + '</button>';
  }).join("") : '';

  var audioRowsHtml = c.audioNotes && c.audioNotes.length
    ? c.audioNotes.map(function(a, i) {
        return '<div class="audio-player-row"><span class="audio-label">Recording ' + (i+1) + ' (' + a.duration + 's)</span><audio controls class="audio-ctrl" data-audio-blob-id="' + TIQ.escapeAttr(a.blobId) + '"></audio></div>';
      }).join("")
    : '<p class="voice-notes-empty">No voice notes yet.</p>';
  var audioHtml = '<section class="ai-section ai-review-voice-notes"><div class="section-title"><span class="section-kicker">Voice Notes</span></div>' +
    audioRowsHtml +
    '<button type="button" class="secondary-button small-button" data-action="review-record-another">' +
      (c.audioNotes && c.audioNotes.length ? 'Record another voice note in Capture' : 'Record a voice note in Capture') +
    '</button></section>';

  var transcriptHtml = '<section class="ai-section"><div class="section-title"><span class="section-kicker">Transcript</span></div>' + TIQ.renderTranscriptBlock(c) + '</section>';
  var citationHtml = '<section class="ai-section"><div class="section-title"><span class="section-kicker">Source Citations</span></div>' + TIQ.renderCitationList(c.traceability) + '</section>';

  var traceHtml = (c.traceability || []).map(function(item) {
    var claim = item.split("\u2014")[0].trim();
    return '<button type="button" class="trace-item trace-link" data-claim="' + TIQ.escapeAttr(claim) + '">' + TIQ.escapeHtml(item) + '</button>';
  }).join("");

  var summaryText = Object.prototype.hasOwnProperty.call(draft, "summary")
    ? draft.summary
    : c.summary || "No summary generated. Upload a resume or complete fields to auto-generate.";
  var notesText = Object.prototype.hasOwnProperty.call(draft, "notes") ? draft.notes : (c.notes || "");
  var tabs = [
    { id: "summary", label: "Summary" },
    { id: "resume", label: "Resume" },
    { id: "notes", label: "Notes" },
    { id: "provenance", label: "Provenance" }
  ];
  var activeIndex = Number(TIQ.views._aiReviewActiveTab);
  if (!isFinite(activeIndex) || activeIndex < 0 || activeIndex >= tabs.length) activeIndex = 0;
  var activeTab = tabs[activeIndex].id;
  TIQ.views._aiReviewActiveTab = activeIndex;

  function tabPanel(id, content) {
    var active = id === activeTab;
    return '<section class="ai-review-tabpanel" role="tabpanel" id="ai-review-tabpanel-' + id + '" aria-labelledby="ai-review-tab-' + id + '" tabindex="0" data-tab-panel="' + id + '"' + (active ? '' : ' hidden') + '>' + content + '</section>';
  }

  var summaryPanel =
    '<section class="ai-section"><div class="section-title"><span class="section-kicker" data-snapshot-status>Extraction Snapshot · ' + TIQ.escapeHtml(c.approvalStatus || 'Pending') + '</span></div><label for="snapshotEdit">Review and edit the draft; changes require approval again</label><textarea id="snapshotEdit" class="notes-card notes-textarea" rows="6">' + TIQ.escapeHtml(summaryText) + '</textarea><p class="field-save-state" data-snapshot-save-state aria-live="polite">Saved on this device</p></section>' +
    TIQ.views.renderAccomplishments(c, "Accomplishments") +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Missing Information Flags</span></div><div class="flag-list">' + flagsHtml + (aiMissingHtml ? '<div class="flag-list__ai">' + aiMissingHtml + '</div>' : '') + '</div></section>';
  var resumePanel = TIQ.views._renderResumeSection(c) + TIQ.views._renderReviewResumeSupplement(c);
  var notesPanel =
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Recruiter Notes</span></div><textarea id="aiNotes" class="notes-card notes-textarea" rows="4">' + TIQ.escapeHtml(notesText) + '</textarea><p class="field-save-state" data-notes-save-state aria-live="polite">Saved on this device</p></section>' +
    audioHtml + transcriptHtml;
  var provenancePanel =
    '<section class="ai-section ai-section--field-provenance"><div class="section-title"><span class="section-kicker">Field Provenance</span></div>' + TIQ.views.renderFieldProvenance(c) + '</section>' +
    (traceHtml ? '<section class="ai-section"><div class="section-title"><span class="section-kicker">Source Traceability</span></div><div class="trace-list" id="aiTraceList">' + traceHtml + '</div></section>' : '') +
    citationHtml +
    '<section class="ai-section"><div class="section-title row-title"><span class="section-kicker">Record Integrity</span></div><div class="integrity-panel" id="aiIntegrity"></div></section>';

  return '<div class="ai-detail" data-candidate-id="' + TIQ.escapeAttr(c.id) + '">' +
    '<div class="ai-detail__header">' +
      '<div class="capture-avatar">' + TIQ.initialsFor(c) + '</div>' +
      '<div><div class="ai-detail__name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</div>' +
      '<div class="ai-detail__id">' + TIQ.escapeHtml(c.id) + ' &bull; ' + TIQ.escapeHtml(c.university) + '</div>' +
      '<div class="ai-detail__prog">' + TIQ.escapeHtml(c.degreeProgram) + ' in ' + TIQ.escapeHtml(c.major) + '</div></div>' +
    '</div>' +
    '<div class="ai-detail__controls">' +
      '<div class="ai-detail__actions">' +
        '<button class="primary-button small-button" data-action="approve">Approve</button>' +
        '<button class="secondary-button small-button" data-action="follow">Follow Up</button>' +
        '<button class="secondary-button small-button" data-action="regen">Regenerate Summary</button>' +
      '</div>' +
      TIQ.renderTabs("ai-review", tabs, activeIndex) +
    '</div>' +
    '<div class="ai-review-tabpanels">' +
      tabPanel("summary", summaryPanel) +
      tabPanel("resume", resumePanel) +
      tabPanel("notes", notesPanel) +
      tabPanel("provenance", provenancePanel) +
    '</div>' +
  '</div>';
};

TIQ.views._renderAiIntegrity = function(c) {
  var fields = ["workAuthorization", "graduationDate", "gpa", "phone", "resumeUpload", "workLocations"];
  var captured = fields.filter(function(f) {
    var v = c[f];
    if (f === "resumeUpload" && v && typeof v === "object" && !v.parsedAt) return false; /* uploaded but not scanned */
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;
  var flags = TIQ.getMissingFlags(c);
  var el = document.getElementById("aiIntegrity");
  if (!el) return;
  el.innerHTML = '<div class="integrity-row"><span class="integrity-label">Core fields captured</span><span class="integrity-meter"><span class="integrity-bar" style="width:' + Math.round((captured / fields.length) * 100) + '%"></span></span><span class="integrity-count">' + captured + ' / ' + fields.length + '</span></div>' +
    (flags.length ? '<p class="integrity-note">' + flags.length + ' missing field' + (flags.length > 1 ? 's' : '') + ' — flagged for review.</p>' : '<p class="integrity-note integrity-note--ok">All core fields captured.</p>');
};

TIQ.views.initAIReviewEvents = function() {
  var container = document.getElementById("view-ai-review");
  if (!container) return;
  var clearScope = document.getElementById('clearMissingScope');
  if (clearScope) clearScope.onclick = function() { TIQ.views._reviewMissingFlag = ''; TIQ.views._reviewEventScope = 'all'; rerender(); };

  TIQ.views._loadAudioBlobs();

  var rerender = function(refreshPanel) {
    var existing = document.getElementById("view-ai-review");
    if (!existing) return;
    var currentDetail = existing.querySelector(".ai-detail[data-candidate-id]");
    var currentId = currentDetail ? currentDetail.getAttribute("data-candidate-id") : "";
    var filtered = TIQ.views._getFilteredCandidates();
    var nextCandidate = filtered.find(function(c) { return c.id === TIQ.views._aiReviewSelected; }) || filtered[0] || null;
    var nextId = nextCandidate ? nextCandidate.id : "";
    var candidateChanged = currentId !== nextId;
    TIQ.views._aiReviewSelected = nextCandidate ? nextCandidate.id : null;

    if (candidateChanged) {
      existing.outerHTML = TIQ.views.renderAIReview();
      TIQ.views.initAIReviewEvents();
      return;
    }

    /* Same-candidate interactions update only the affected surface. Replacing
       the complete Review view is reserved for an actual selected-candidate
       change, preserving textarea nodes and any live in-progress edits. */
    TIQ.views._refreshAIReviewList();
    TIQ.views._refreshAIReviewCompareBar();
    if (refreshPanel === "resume") TIQ.views._refreshAIReviewResumePanel(nextCandidate);
    TIQ.views._refreshAIReviewDetail(nextCandidate);
    var missingIntro = existing.querySelector(".results-intro");
    if (missingIntro && !TIQ.views._reviewMissingFlag) missingIntro.remove();
  };

  document.getElementById("aiStatusFilter").addEventListener("change", function(e) { TIQ.views._aiReviewStatus = e.target.value; rerender(); });
  document.getElementById("aiFuncFilter").addEventListener("change", function(e) { TIQ.views._aiReviewFunc = e.target.value; rerender(); });
  document.getElementById("aiPriorityFilter").addEventListener("change", function(e) { TIQ.views._aiReviewPriority = e.target.value; rerender(); });

  var aiSearchInput = document.getElementById("aiSearch");
  var aiDebouncedSearch = TIQ.debounce(function(val) { TIQ.views._aiReviewSearch = val; rerender(); }, 300);
  aiSearchInput.addEventListener("input", function(e) { aiDebouncedSearch(e.target.value); });

  var aiCsvBtn = document.getElementById("aiExportCsv");
  var aiJsonBtn = document.getElementById("aiExportJson");
  if (aiCsvBtn) aiCsvBtn.addEventListener("click", function() { TIQ.exportCsvLoading(aiCsvBtn, TIQ.views._getFilteredCandidates(), TIQ.state.activeRecruiterId); TIQ.logMetric({ type: 'export', format: 'csv', recruiterId: TIQ.state.activeRecruiterId }); });
  if (aiJsonBtn) aiJsonBtn.addEventListener("click", function() { TIQ.exportJsonLoading(aiJsonBtn, TIQ.views._getFilteredCandidates()); TIQ.logMetric({ type: 'export', format: 'json', recruiterId: TIQ.state.activeRecruiterId }); });

  document.getElementById("aiCandidateList").addEventListener("click", function(e) {
    var checkbox = e.target.closest(".compare-check input");
    if (checkbox) {
      var item = checkbox.closest(".ai-list-item");
      var id = item.dataset.id;
      var idx = TIQ.views._aiReviewCompare.indexOf(id);
      if (idx >= 0) TIQ.views._aiReviewCompare.splice(idx, 1);
      else if (TIQ.views._aiReviewCompare.length < 3) TIQ.views._aiReviewCompare.push(id);
      else { TIQ.showToast("Compare up to 3 candidates."); checkbox.checked = false; return; }
      rerender();
      return;
    }
    var listItem = e.target.closest(".ai-list-item");
    if (listItem) { TIQ.views._aiReviewSelected = listItem.dataset.id; rerender(); }
  });

  var detailPanel = document.getElementById("aiDetailPanel");
  if (detailPanel) {
    function activateReviewTab(tabButton) {
      var tabs = Array.prototype.slice.call(detailPanel.querySelectorAll('[role="tab"][data-tab-index]'));
      var panels = detailPanel.querySelectorAll("[data-tab-panel]");
      var selectedIndex = Number(tabButton.getAttribute("data-tab-index"));
      if (!isFinite(selectedIndex) || !tabs[selectedIndex]) return;
      TIQ.views._aiReviewActiveTab = selectedIndex;
      tabs.forEach(function(tab, index) {
        var selected = index === selectedIndex;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.setAttribute("tabindex", selected ? "0" : "-1");
        tab.classList.toggle("is-active", selected);
      });
      Array.prototype.forEach.call(panels, function(panel) {
        var selected = panel.getAttribute("data-tab-panel") === tabButton.getAttribute("data-tab-id");
        panel.hidden = !selected;
      });
      var indicator = detailPanel.querySelector(".tabs__indicator");
      if (indicator) indicator.style.setProperty("--tab-index", selectedIndex);
    }

    detailPanel.addEventListener("click", function(e) {
      var tabButton = e.target.closest('[role="tab"][data-tab-index]');
      if (tabButton) {
        e.preventDefault();
        activateReviewTab(tabButton);
        return;
      }
      var actionBtn = e.target.closest("[data-action]");
      var traceBtn = e.target.closest(".trace-link");
      if (actionBtn) {
        var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._aiReviewSelected; });
        if (!c) return;
        if (actionBtn.dataset.action === "rescan") {
          var rescanInput = detailPanel.querySelector('[data-resume-rescan]');
          if (rescanInput) rescanInput.click();
          return;
        }
        if (actionBtn.dataset.action === "review-record-another") {
          var captureIndex = TIQ.state.candidates.findIndex(function(candidate) { return candidate.id === c.id; });
          if (captureIndex >= 0) {
            TIQ.views._captureIndex = captureIndex;
            TIQ.router.navigateTo("capture");
          }
          return;
        }
        if (actionBtn.dataset.action === "approve") {
          if (!TIQ.state.activeRecruiterId) { TIQ.showToast("Select a recruiter first."); return; }
          c.recordStatus = "Reviewed"; c.approvalStatus = "Approved"; c.approverId = TIQ.state.activeRecruiterId; c.approvalTimestamp = TIQ.nowISO();
          TIQ.addAuditEntry(c, "APPROVED", "Approved in Review");
          TIQ.logMetric({ type: 'candidate-approved', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });
          TIQ.saveState(); TIQ.showToast(c.firstName + " approved."); rerender();
        } else if (actionBtn.dataset.action === "follow") {
          if (!TIQ.state.activeRecruiterId) { TIQ.showToast("Select a recruiter first."); return; }
          c.recordStatus = "Follow-Up"; c.priority = "High"; c.followUpRequestedBy = TIQ.state.activeRecruiterId; c.followUpTimestamp = TIQ.nowISO();
          TIQ.addAuditEntry(c, "FOLLOW_UP", "Follow-up requested");
          TIQ.logMetric({ type: 'follow-up-requested', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });
          TIQ.saveState(); TIQ.showToast(c.firstName + " flagged for follow-up."); rerender();
        } else if (actionBtn.dataset.action === "regen") {
          TIQ.ai.updateCandidateSummary(c);
          TIQ.addAuditEntry(c, "SUMMARY_REGEN", "Snapshot regenerated");
          TIQ.logMetric({ type: 'summary-regen', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });
          TIQ.saveState(); TIQ.showToast("Summary regenerated."); rerender();
        }
      }
      if (e.target.closest('[data-toggle-raw]')) {
        TIQ.views._rawOpen[TIQ.views._aiReviewSelected] = !TIQ.views._rawOpen[TIQ.views._aiReviewSelected];
        rerender("resume");
        return;
      }
      if (e.target.closest('[data-expand-roles]')) {
        var expRoleBtn = e.target.closest('[data-expand-roles]');
        var expRoleId = expRoleBtn.getAttribute('data-expand-roles');
        TIQ.views._resumeExpanded[expRoleId] = !TIQ.views._resumeExpanded[expRoleId];
        rerender("resume");
        return;
      }
      if (traceBtn) {
        TIQ.views._highlightTrace(traceBtn.dataset.claim, traceBtn);
      }
      var flagChip = e.target.closest(".flag-actionable, .flag-ai-missing");
      if (flagChip) {
        var key = flagChip.dataset.flagKey;
        TIQ.views._focusMissingField(c, key);
      }
    });
    detailPanel.addEventListener("keydown", function(e) {
      var tabButton = e.target.closest('[role="tab"][data-tab-index]');
      if (!tabButton) return;
      var tabs = Array.prototype.slice.call(detailPanel.querySelectorAll('[role="tab"][data-tab-index]'));
      var index = tabs.indexOf(tabButton);
      var next = index;
      if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault();
      activateReviewTab(tabs[next]);
      tabs[next].focus();
    });

    var snapshot = detailPanel.querySelector('#snapshotEdit');
    if (snapshot) {
      snapshot.addEventListener("input", function() {
        var id = TIQ.views._aiReviewSelected;
        var draft = TIQ.views._aiReviewDrafts[id] || (TIQ.views._aiReviewDrafts[id] = {});
        draft.summary = snapshot.value;
        var saveState = detailPanel.querySelector("[data-snapshot-save-state]");
        if (saveState) saveState.textContent = "Unsaved edit · saves when you leave the field";
      });
      snapshot.addEventListener('change', function() {
        var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._aiReviewSelected; });
        if (!c) return;
        c.summary = snapshot.value;
        var draft = TIQ.views._aiReviewDrafts[c.id] || (TIQ.views._aiReviewDrafts[c.id] = {});
        delete draft.summary;
        TIQ.invalidateApproval(c);
        TIQ.addAuditEntry(c, 'SNAPSHOT_EDITED', 'Recruiter edited draft; approval required again');
        TIQ.saveState();
        var saveState = detailPanel.querySelector("[data-snapshot-save-state]");
        if (saveState) saveState.textContent = "Saved on this device · approval required";
        var statusLabel = detailPanel.querySelector("[data-snapshot-status]");
        if (statusLabel) statusLabel.textContent = "Extraction Snapshot · " + (c.approvalStatus || "Pending");
        if (TIQ.views._renderAiIntegrity) TIQ.views._renderAiIntegrity(c);
      });
    }
    var notes = detailPanel.querySelector("#aiNotes");
    if (notes) {
      notes.addEventListener("input", function() {
        var id = TIQ.views._aiReviewSelected;
        var draft = TIQ.views._aiReviewDrafts[id] || (TIQ.views._aiReviewDrafts[id] = {});
        draft.notes = notes.value;
        var saveState = detailPanel.querySelector("[data-notes-save-state]");
        if (saveState) saveState.textContent = "Unsaved edit · saves when you leave the field";
      });
      notes.addEventListener("change", function() {
        var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._aiReviewSelected; });
        if (c) {
          c.notes = notes.value;
          var draft = TIQ.views._aiReviewDrafts[c.id] || (TIQ.views._aiReviewDrafts[c.id] = {});
          delete draft.notes;
          TIQ.addAuditEntry(c, "NOTES_UPDATED", "Notes updated");
          TIQ.logMetric({ type: 'notes-updated', candidateId: c.id, recruiterId: c.capturedBy });
          if (TIQ.ai && TIQ.ai.updateCandidateSummary) TIQ.ai.updateCandidateSummary(c);
          TIQ.saveState();
          var saveState = detailPanel.querySelector("[data-notes-save-state]");
          if (saveState) saveState.textContent = "Saved on this device";
        }
      });
    }

    detailPanel.addEventListener("change", function(e) {
      var input = e.target.closest('[data-resume-rescan]');
      if (!input) return;
      var file = input.files && input.files[0];
      input.value = "";
      var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._aiReviewSelected; });
      if (!c || !file) return;
      if (TIQ.intake && TIQ.intake.isParsableResume && !TIQ.intake.isParsableResume(file)) {
        TIQ.showToast("Only PDF resumes can be scanned.");
        return;
      }
      TIQ.showToast("Scanning " + file.name + "\u2026");
      TIQ.ai.parseAndStoreResume(c, file).then(function(parsed) {
        if (parsed) {
          if (!c.summary) TIQ.ai.updateCandidateSummary(c);
          TIQ.showToast(c.firstName + " " + c.lastName + " resume scanned.");
        } else {
          TIQ.showToast("Could not scan " + file.name + " \u2014 it is flagged \"Resume Not Scanned\".");
        }
        TIQ.saveState();
        rerender("resume");
      });
    });
  }

  var selCandidate = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._aiReviewSelected; });
  if (selCandidate) TIQ.views._renderAiIntegrity(selCandidate);

  TIQ.views._refreshAIReviewCompareBar();
};

TIQ.views._openCompareModal = function(ids) {
  var cands = ids.map(function(id) { return TIQ.state.candidates.find(function(c) { return c.id === id; }); }).filter(Boolean);
  if (cands.length < 2) return;
  var modal = document.getElementById("compareModal");
  var body = document.getElementById("compareBody");
  if (!modal || !body) return;

  var headCells = '<div class="compare-cell compare-cell--label">Field</div>' +
    cands.map(function(c) { return '<div class="compare-cell compare-cell--person"><span class="avatar avatar-mini">' + TIQ.initialsFor(c) + '</span><span class="compare-person-name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '<br/><span class="candidate-id">' + TIQ.escapeHtml(c.id) + '</span></span></div>'; }).join("");

  var rows = [
    { label: "Snapshot", value: function(c) { return c.summary; } },
    { label: "Key Skills", value: function(c) { return c.keySkills.join(", "); } },
    { label: "Missing Flags", value: function(c) { return TIQ.getMissingFlags(c).map(function(f) { return f.label; }).join("; ") || "None"; } },
    { label: "Notes", value: function(c) { return c.notes; } }
  ];

  var rowHtml = rows.map(function(row) {
    return '<div class="compare-row"><div class="compare-cell compare-cell--label">' + row.label + '</div>' +
      cands.map(function(c) { return '<div class="compare-cell compare-cell--body">' + TIQ.escapeHtml(row.value(c)) + '</div>'; }).join("") + '</div>';
  }).join("");

  body.innerHTML = '<div class="compare-table"><div class="compare-row compare-row--head">' + headCells + '</div>' + rowHtml + '</div>';
  modal.hidden = false;
  TIQ.logMetric({ type: 'compare', count: ids.length, recruiterId: TIQ.state.activeRecruiterId });
};

TIQ.views._focusMissingField = function(c, key) {
  var noteArea = document.getElementById("aiNotes");
  var fieldMap = {
    "Work Authorization": "Enter work authorization status in notes or capture form.",
    "Graduation": "Add graduation date in the capture form.",
    "GPA": "Add GPA in the capture form.",
    "Phone": "Add phone number in the capture form.",
    "Resume": "Upload a resume PDF to auto-extract data.",
    "Location": "Add preferred work locations in the capture form.",
    "Skills": "Add skills in the capture form or upload a resume.",
    "Notes": "Add recruiter notes in the textarea below.",
    "Areas Discussed": "Log areas discussed in the capture form."
  };
  var msg = fieldMap[key] || "Complete this field in the capture form.";
  if (key === "Notes" && noteArea) {
    noteArea.focus();
    noteArea.scrollIntoView({ behavior: "smooth", block: "center" });
  } else if (key === "Resume") {
    TIQ.showToast(msg + " Navigate to Capture view to upload.", "info");
  } else {
    TIQ.showToast(msg, "info");
  }
};

TIQ.views._highlightTrace = function(claim, btn) {
  var summary = document.querySelector("#aiDetailPanel .snapshot-card p");
  var notes = document.getElementById("aiNotes");
  if (summary) {
    var text = summary.textContent;
    var idx = text.toLowerCase().indexOf(claim.toLowerCase());
    if (idx >= 0) {
      summary.innerHTML = TIQ.escapeHtml(text.slice(0, idx)) + '<mark class="source-hl">' + TIQ.escapeHtml(text.slice(idx, idx + claim.length)) + '</mark>' + TIQ.escapeHtml(text.slice(idx + claim.length));
      summary.scrollIntoView({ behavior: "smooth", block: "center" });
      btn.classList.add("trace-active");
      return;
    }
  }
  if (notes) {
    var nText = notes.value.toLowerCase();
    var nIdx = nText.indexOf(claim.toLowerCase());
    if (nIdx >= 0) {
      notes.focus();
      notes.setSelectionRange(nIdx, nIdx + claim.length);
      btn.classList.add("trace-active");
      return;
    }
  }
  btn.classList.add("trace-active");
};

/* ---- Candidate Review View (ported from original) ---- */
TIQ.views.renderCandidateReview = function() {
  return '<div class="view" id="view-review">' +
    '<div class="view-header"><span class="section-kicker">Detailed View</span></div>' +
    '<div class="ai-filter-bar">' +
      '<select id="reviewStatusFilter"><option value="all">All Statuses</option>' + TIQ.CONFIG.statuses.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join("") + '</select>' +
      '<select id="reviewFuncFilter"><option value="all">All Functions</option>' + TIQ.CONFIG.functions.map(function(f) { return '<option value="' + f + '">' + f + '</option>'; }).join("") + '</select>' +
      '<select id="reviewPriorityFilter"><option value="all">All Priority</option>' + TIQ.CONFIG.priorities.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join("") + '</select>' +
      '<div class="search-inline"><svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.2-4.2" fill="none" stroke="currentColor" stroke-width="2"/></svg><input id="reviewSearch" type="search" placeholder="Search..." /></div>' +
      '<button class="secondary-button small-button" id="reviewExportCsv">Export CSV</button>' +
    '</div>' +
    '<div class="ai-layout">' +
      '<div class="ai-list-panel"><div class="ai-list-count" id="reviewCount">0 candidates</div><div class="ai-list" id="reviewCandidateList"></div></div>' +
      '<div class="ai-detail-panel" id="reviewDetailPanel"></div>' +
    '</div>' +
    '<div id="reviewCompareBar" class="compare-bar" hidden></div>' +
  '</div>';
};

TIQ.views._reviewSelected = null;
TIQ.views._reviewCompare = [];
TIQ.views._reviewSearch = "";
TIQ.views._reviewStatus = "all";
TIQ.views._reviewFunc = "all";
TIQ.views._reviewPriority = "all";
TIQ.views._reviewView = [];

TIQ.views.initCandidateReview = function() {
  var filtered = TIQ.state.candidates.filter(function(c) {
    var s = TIQ.views._reviewSearch.toLowerCase();
    var matchSearch = !s || [c.firstName, c.lastName, c.major, c.function, c.university, c.skills.join(" "), c.notes, c.areasDiscussed.join(" ")].some(function(v) { return String(v).toLowerCase().indexOf(s) >= 0; });
    var matchStatus = TIQ.views._reviewStatus === "all" || c.recordStatus === TIQ.views._reviewStatus;
    var matchFunc = TIQ.views._reviewFunc === "all" || c.function === TIQ.views._reviewFunc;
    var matchPri = TIQ.views._reviewPriority === "all" || c.priority === TIQ.views._reviewPriority;
    return matchSearch && matchStatus && matchFunc && matchPri;
  });
  TIQ.views._reviewView = filtered;

  if (!TIQ.views._reviewSelected && filtered.length) TIQ.views._reviewSelected = filtered[0].id;
  var sel = filtered.find(function(c) { return c.id === TIQ.views._reviewSelected; }) || filtered[0] || null;

  var listEl = document.getElementById("reviewCandidateList");
  var countEl = document.getElementById("reviewCount");
  if (countEl) countEl.textContent = filtered.length + " candidates";
  if (listEl) {
    listEl.innerHTML = filtered.map(function(c) {
      var flags = TIQ.getMissingFlags(c);
      var sc = TIQ.statusClassMap[c.recordStatus] || "status-new";
      var checked = TIQ.views._reviewCompare.indexOf(c.id) >= 0;
      return '<div class="ai-list-item' + (c.id === (sel && sel.id) ? " ai-list-item--selected" : "") + '" data-id="' + c.id + '">' +
        '<label class="compare-check"><input type="checkbox" ' + (checked ? "checked" : "") + ' /></label>' +
        '<div class="ai-list-item__info"><div class="ai-list-item__name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</div><div class="ai-list-item__meta">' + TIQ.escapeHtml(c.university) + '</div></div>' +
        '<span class="status-chip ' + sc + '">' + TIQ.escapeHtml(c.recordStatus) + '</span>' +
        (flags.length ? '<span class="flag-count">' + flags.length + '</span>' : '<span class="flag-count flag-count--ok">0</span>') +
      '</div>';
    }).join("");
  }

  var detailEl = document.getElementById("reviewDetailPanel");
  if (detailEl && sel) {
    detailEl.innerHTML = TIQ.views._renderDetailPanel(sel);
    TIQ.views._renderAiIntegrity(sel);
  } else if (detailEl) {
    detailEl.innerHTML = '<div class="ai-detail-empty">Select a candidate.</div>';
  }

  TIQ.views._bindReviewEvents();
};

TIQ.views._bindReviewEvents = function() {
  var rerender = function() { TIQ.views.initCandidateReview(); };

  var sF = document.getElementById("reviewStatusFilter");
  var fF = document.getElementById("reviewFuncFilter");
  var pF = document.getElementById("reviewPriorityFilter");
  var sI = document.getElementById("reviewSearch");
  if (sF) sF.addEventListener("change", function(e) { TIQ.views._reviewStatus = e.target.value; rerender(); });
  if (fF) fF.addEventListener("change", function(e) { TIQ.views._reviewFunc = e.target.value; rerender(); });
  if (pF) pF.addEventListener("change", function(e) { TIQ.views._reviewPriority = e.target.value; rerender(); });

  if (sI) {
    var reviewDebouncedSearch = TIQ.debounce(function(val) { TIQ.views._reviewSearch = val; rerender(); }, 300);
    sI.addEventListener("input", function(e) { reviewDebouncedSearch(e.target.value); });
  }

  var exportBtn = document.getElementById("reviewExportCsv");
  if (exportBtn) exportBtn.addEventListener("click", function() { TIQ.exportCsvLoading(exportBtn, TIQ.views._reviewView, TIQ.state.activeRecruiterId); TIQ.logMetric({ type: 'export', format: 'csv', recruiterId: TIQ.state.activeRecruiterId }); });

  var listEl = document.getElementById("reviewCandidateList");
  if (listEl) {
    listEl.addEventListener("click", function(e) {
      var cb = e.target.closest(".compare-check input");
      if (cb) {
        var item = cb.closest(".ai-list-item");
        var id = item.dataset.id;
        var idx = TIQ.views._reviewCompare.indexOf(id);
        if (idx >= 0) TIQ.views._reviewCompare.splice(idx, 1);
        else if (TIQ.views._reviewCompare.length < 3) TIQ.views._reviewCompare.push(id);
        else { TIQ.showToast("Compare up to 3 candidates."); cb.checked = false; return; }
        rerender(); return;
      }
      var li = e.target.closest(".ai-list-item");
      if (li) { TIQ.views._reviewSelected = li.dataset.id; rerender(); }
    });
  }

  var detailPanel = document.getElementById("reviewDetailPanel");
  if (detailPanel) {
    detailPanel.addEventListener("click", function(e) {
      var act = e.target.closest("[data-action]");
      var tr = e.target.closest(".trace-link");
      if (act) {
        var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._reviewSelected; });
        if (!c) return;
        if (act.dataset.action === "approve") {
          if (!TIQ.state.activeRecruiterId) { TIQ.showToast("Select a recruiter first."); return; }
          c.recordStatus = "Reviewed"; c.approvalStatus = "Approved"; c.approverId = TIQ.state.activeRecruiterId; c.approvalTimestamp = TIQ.nowISO();
          TIQ.addAuditEntry(c, "APPROVED", "Approved via Review");
          TIQ.logMetric({ type: 'candidate-approved', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });
          TIQ.saveState(); TIQ.showToast(c.firstName + " approved."); rerender();
        } else if (act.dataset.action === "follow") {
          if (!TIQ.state.activeRecruiterId) { TIQ.showToast("Select a recruiter first."); return; }
          c.recordStatus = "Follow-Up"; c.priority = "High"; c.followUpRequestedBy = TIQ.state.activeRecruiterId; c.followUpTimestamp = TIQ.nowISO();
          TIQ.addAuditEntry(c, "FOLLOW_UP", "Follow-up requested");
          TIQ.logMetric({ type: 'follow-up-requested', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });
          TIQ.saveState(); TIQ.showToast(c.firstName + " flagged for follow-up."); rerender();
        }
      }
      if (tr) TIQ.views._highlightTrace(tr.dataset.claim, tr);
    });
    var notes = detailPanel.querySelector("#aiNotes");
    if (notes) notes.addEventListener("change", function() {
      var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._reviewSelected; });
      if (c) { c.notes = notes.value; TIQ.addAuditEntry(c, "NOTES_UPDATED", "Notes updated"); TIQ.logMetric({ type: 'notes-updated', candidateId: c.id, recruiterId: c.capturedBy }); TIQ.saveState(); }
    });
  }

  var bar = document.getElementById("reviewCompareBar");
  if (bar && TIQ.views._reviewCompare.length >= 2) {
    bar.hidden = false; bar.classList.add("visible");
    bar.innerHTML = '<span class="compare-bar__count">' + TIQ.views._reviewCompare.length + ' candidates selected</span><button class="primary-button small-button" id="reviewCompareOpen">Compare</button><button class="secondary-button small-button" id="reviewCompareClear">Clear</button>';
    document.getElementById("reviewCompareOpen").addEventListener("click", function() { TIQ.views._openCompareModal(TIQ.views._reviewCompare); });
    document.getElementById("reviewCompareClear").addEventListener("click", function() { TIQ.views._reviewCompare = []; rerender(); });
  } else if (bar) { bar.hidden = true; }
};

TIQ.views.renderReview = function() {
  return TIQ.views.renderAIReview();
};

TIQ.views.initReviewEvents = function() {
  return TIQ.views.initAIReviewEvents();
};

TIQ.views.renderCandidateReview = function() {
  return TIQ.views.renderReview();
};

TIQ.views.initCandidateReview = function() {
  return TIQ.views.initReviewEvents();
};

/* ---- Test Data Creator ---- */
TIQ.views._demoCandidates = [
  {
    firstName: "Priya", lastName: "Sharma", email: "priya.sharma@uark.edu",
    university: "University of Arkansas", degreeProgram: "Bachelor of Science", major: "Computer Science",
    graduationDate: "May 2026", gpa: "3.92", workAuthorization: "US Citizen",
    workLocations: ["Dallas, TX", "Fayetteville, AR"], function: "Software Engineer",
    skills: ["Python", "Java", "React", "AWS", "SQL", "Git"],
    notes: "Strong GPA, spoke about distributed systems project. Very interested in backend infrastructure roles.",
    areasDiscussed: ["Technical Skills", "Project Experience", "Career Goals"],
    recordStatus: "New", priority: "High", approvalStatus: "Pending"
  },
  {
    firstName: "Marcus", lastName: "Johnson", email: "marcus.j@memphis.edu",
    university: "University of Memphis", degreeProgram: "Bachelor of Science", major: "Information Technology",
    graduationDate: "December 2025", gpa: "3.45", workAuthorization: "US Citizen",
    workLocations: ["Memphis, TN"], function: "IT Analyst",
    skills: ["SQL", "Tableau", "Excel", "Python"],
    notes: "Completed two internships at FedEx. Great communication skills.",
    areasDiscussed: ["Internship Experience", "Technical Skills"],
    recordStatus: "Reviewed", priority: "Medium", approvalStatus: "Approved",
    approverId: "rec-1", approvalTimestamp: "2026-09-14T10:30:00.000Z"
  },
  {
    firstName: "Sofia", lastName: "Rodriguez", email: "sofia.r@ttu.edu",
    university: "Texas Tech University", degreeProgram: "Master of Science", major: "Data Science",
    graduationDate: "May 2027", gpa: "3.78", workAuthorization: "F1 CPT",
    workLocations: ["Dallas, TX", "Houston, TX"], function: "Data Analyst",
    skills: ["R", "Python", "Machine Learning", "TensorFlow", "SQL", "Tableau", "Pandas"],
    notes: "Published paper on NLP sentiment analysis. Looking for ML engineering roles.",
    areasDiscussed: ["Research", "Technical Skills", "Career Goals"],
    recordStatus: "New", priority: "High", approvalStatus: "Pending"
  },
  {
    firstName: "Jamal", lastName: "Williams", email: "jwilliams@nsu.edu",
    university: "Nashville State University", degreeProgram: "Bachelor of Science", major: "Cybersecurity",
    graduationDate: "May 2026", gpa: "", workAuthorization: "",
    workLocations: [], function: "Security Analyst",
    skills: ["Wireshark", "Nmap", "Python"],
    notes: "",
    areasDiscussed: [],
    recordStatus: "New", priority: "Low", approvalStatus: "Pending"
  },
  {
    firstName: "Emily", lastName: "Chen", email: "e.chen@auburn.edu",
    university: "Auburn University", degreeProgram: "Bachelor of Science", major: "Software Engineering",
    graduationDate: "May 2026", gpa: "3.88", workAuthorization: "US Citizen",
    workLocations: ["Atlanta, GA", "Nashville, TN"], function: "Software Engineer",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Docker", "Kubernetes", "CI/CD", "PostgreSQL"],
    notes: "Built a full-stack e-commerce platform as capstone. Active GitHub contributor. Interested in DevOps roles.",
    areasDiscussed: ["Technical Skills", "Project Experience", "Open Source", "Career Goals"],
    recordStatus: "Reviewed", priority: "Medium", approvalStatus: "Pending"
  }
];

TIQ.views.generateDemoCandidates = function() {
  var created = 0;
  Array.from({length:48}).forEach(function(_, i) {
    var demo = JSON.parse(JSON.stringify(TIQ.views._demoCandidates[i % TIQ.views._demoCandidates.length]));
    var id = 'SAMPLE-' + String(i + 1).padStart(2, '0');
    var exists = TIQ.state.candidates.some(function(c) { return c.id === id; });
    if (exists) return;
    var c = Object.assign({}, demo, {
      id: id,
      firstName: 'Sample ' + (i + 1), lastName: demo.firstName,
      email: 'sample' + (i + 1) + '@example.test',
      isDemo: true, eventId: 'Sample event ' + (1 + Math.floor(i / 16)),
      createdAt: '2026-09-' + (14 + Math.floor(i / 16)) + 'T10:00:00.000Z',
      lastUpdated: TIQ.todayISO(),
      capturedBy: TIQ.state.activeRecruiterId || "rec-1",
      audioNotes: [],
      areasDiscussed: demo.areasDiscussed || [],
      skills: demo.skills || [],
      workLocations: demo.workLocations || [],
      auditLog: [],
      attributes: [],
      accomplishments: [],
      keySkills: demo.keySkills || [],
      parsedResume: null
    });
    c.recordStatus = ['New','Reviewed','Follow-Up','Interview Requested'][i % 4];
    c.approvalStatus = i % 3 === 0 ? 'Approved' : 'Pending';
    c.approvalTimestamp = c.approvalStatus === 'Approved' ? c.createdAt : '';
    c.approverId = c.approvalStatus === 'Approved' ? 'R1' : '';
    c.phone = i % 3 ? '555-0100' : '';
    c.workAuthorization = i % 4 === 0 ? '' : i % 4 === 1 ? 'Not authorized to work in the US' : demo.workAuthorization;
    c.auditLog = [{action:'CREATED',timestamp:c.createdAt,detail:'Synthetic sample event record'}];
    c.provenance = {firstName:'form',lastName:'form',email:'form',notes:'form'};
    if (i % 2 === 0) {
      var quote = 'Led a team of four on a routing project. Reduced simulated dispatch delays by 12% across six test routes and documented the process for the next project team.';
      c.parsedResume = {rawText:'Operations Intern · Sample Logistics\nSummer 2026\n' + quote,experience:[{title:'Operations Intern',company:'Sample Logistics',dates:'Summer 2026',description:quote}],projects:[],certifications:[],skills:['Python','SQL'],education:[]};
      c.resumeUpload = {name:'synthetic-sample.txt',parsedAt:c.createdAt,type:'text/plain'};
      c.skills = ['Python','SQL']; c.provenance.skills = 'resume';
      c.accomplishments = TIQ.generateAccomplishments(c);
    }
    if (TIQ.ai && TIQ.ai.generateSummary) {
      var result = TIQ.ai.generateSummary(c);
      c.summary = result.summary;
      c.traceability = result.traceability;
    }
    TIQ.state.candidates.push(c);
    created++;
  });
  TIQ.saveState();
  return created;
};

/* ---- Research Metrics View ---- */
TIQ.views.renderMetrics = function() {
  var cands = TIQ.state.candidates || [];
  var A = TIQ.analytics;
  var counts = A.statusCounts(cands);
  var reviewed = cands.length ? Math.round(((counts.Reviewed + counts["Follow-Up"] + counts["Interview Requested"]) / cands.length) * 100) : 0;
  var imports = (TIQ.state.metrics || []).filter(function(m) { return m.type === "resume-import"; });
  var totalImports = imports.reduce(function(s, m) { return s + (m.count || 0); }, 0);
  var totalFail = imports.reduce(function(s, m) { return s + (m.failed || 0); }, 0);
  var parseRate = (totalImports + totalFail) > 0 ? Math.round((totalImports / (totalImports + totalFail)) * 100) : -1;

  var html = '<div class="view" id="view-metrics">' +
    '<div class="view-header"><span class="section-kicker">Research Console</span></div>' +
    TIQ.renderMetricsCards([
      { label: "Funnel Reviewed", value: reviewed + "%", sub: "Candidates past the New stage", modifier: "blue" },
      { label: "Snapshot approvals", value: cands.filter(function(c) { return c.approvalStatus === 'Approved'; }).length, sub: 'Approved snapshots / ' + cands.length + ' local records; not a quality score', modifier: "amber" },
      { label: "Field completeness", value: cands.length ? A.dataCompleteness(cands) + '%' : '—', sub: "Present checks / nine checks per local record", modifier: "green" },
      { label: "Resume Parse Success", value: parseRate >= 0 ? parseRate + "%" : "\u2014", sub: "Imported vs failed resumes", modifier: "purple" }
    ]) +
    '<div class="overview-grid">' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Candidate Funnel</span></div>' +
        '<div class="overview-bars">' +
          ["New", "Reviewed", "Follow-Up", "Interview Requested"].map(function(s, i) {
            var pct = cands.length ? Math.round(((counts[s] || 0) / cands.length) * 100) : 0;
            return '<div class="hbar-row"><span class="hbar-label">' + TIQ.escapeHtml(s) + '</span><div class="hbar-track"><div class="hbar-fill" style="width:' + pct + '%;animation-delay:' + (i * 80) + 'ms"></div></div><span class="hbar-val">' + (counts[s] || 0) + '</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<details><summary>Review actions by recruiter</summary><p>Recorded actions across all stored dates, not a performance measure. Approvals count only APPROVED audit entries.</p>' +
        '<table class="data-table">' +
          '<thead><tr><th>Recruiter</th><th>Actions</th><th>Approvals</th></tr></thead>' +
          '<tbody>' +
            A.perRecruiter(cands).map(function(r) {
              return '<tr><td>' + TIQ.escapeHtml(r.recruiterName) + '</td><td>' + r.actions + '</td><td>' + r.approvals + '</td></tr>';
            }).join("") +
          '</tbody>' +
        '</table></details>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="primary-button" id="metricsExportCsv" style="margin-top:16px">Export Metrics CSV</button>' +
  '</div>';
  return html;
};

TIQ.views.initMetricsEvents = function() {
  var btn = document.getElementById("metricsExportCsv");
  if (btn) btn.addEventListener("click", function() {
    TIQ.logMetric({ type: "export", format: "metrics-csv", recruiterId: TIQ.state.activeRecruiterId });
    TIQ.exportCsvLoading("talentiq-metrics-" + new Date().toISOString().slice(0, 10), TIQ.state.metrics);
  });
};
