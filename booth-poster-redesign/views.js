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
    '<p class="results-intro">Information quality, not candidate quality. These operational metrics do not score or rank candidates.</p>' +
    '<label class="results-scope">Population <select id="resultsEvent">' + [{id:'all',label:'All records on this device'},{id:'unassigned',label:'Unassigned / legacy records'}].concat(ids.map(function(id) { return {id:id,label:id === TIQ.currentEventId() ? TIQ.eventInfo().name + ' (current event)' : id}; })).map(function(e) { return '<option value="' + TIQ.escapeAttr(e.id) + '"' + (scope === e.id ? ' selected' : '') + '>' + h(e.label) + '</option>'; }).join('') + '</select></label>' +
    TIQ.howItWorksHtml() +
    (!cands.length ? '<div class="results-empty"><h2>No records in this population</h2><p>Capture someone at the booth, import a submission, or load sample events to explore the workflow.</p><button class="primary-button" data-go="capture">Start capturing</button> <button class="secondary-button" data-demo-load>Load sample events</button></div>' : '') +
    '<div class="results-metrics">' + A.metricDescriptors(cands).map(function(d) {
      return '<article class="result-metric"><h2>' + h(d.label) + '</h2><strong class="result-value">' + (d.value === null ? '—' : d.value + (d.unit === '%' ? '%' : '')) + '</strong><p>' + d.numerator + ' / ' + d.denominator + (d.unit === '%' ? ' tracked checks' : ' records') + '</p><details><summary>Definition &amp; next action</summary><p>' + h(d.definition) + '</p><p>' + h(d.whyItMatters) + '</p><p>' + h(d.caveat) + '</p><small>' + h(d.source + ' · ' + caption) + '</small></details></article>';
    }).join('') + '</div>' +
    '<div class="overview-grid">' +
      '<section class="overview-card missing-breakdown"><h2>What to ask next</h2><p>Each bar counts records missing one of the nine tracked checks. Select a row to review those records.</p>' + A.missingFlagBreakdown(cands).map(function(f) { return '<button class="missing-row" data-missing="' + TIQ.escapeAttr(f.flag) + '"><span>' + h(f.flag) + '</span><span class="hbar-track"><span class="hbar-fill" style="width:' + (f.pct || 0) + '%"></span></span><span>' + f.count + ' / ' + cands.length + ' (' + (f.pct === null ? '—' : f.pct + '%') + ')</span></button>'; }).join('') + '<small>' + h(caption) + '</small></section>' +
      '<section class="overview-card"><h2>Extraction measurements</h2><p>No historical before/after delta is available. Provenance tells us where a field came from; it cannot reconstruct the earlier record.</p><p>Use a paired, controlled study to measure impact. Sample records are not measured outcomes.</p><button class="secondary-button small-button" data-go="metrics">Open Research Metrics</button><p><small>' + h(caption) + '</small></p></section>' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Recorded activity</span></div>' +
        '<div class="overview-activity">' +
          (feed.length ? feed.map(function(f, i) {
            return '<div class="activity-item" style="animation-delay:' + (i * 60) + 'ms"><span class="activity-dot" style="background:' + TIQ.escapeAttr(f.dotColor) + '"></span><div><strong>' + TIQ.escapeHtml(f.recruiter) + '</strong> ' + TIQ.escapeHtml(f.action) + ' ' + TIQ.escapeHtml(f.target) + '<span class="activity-time">' + TIQ.escapeHtml(f.time) + '</span></div></div>';
          }).join("") : '<p>No activity recorded in this population.</p>') +
        '</div><small>Latest five entries; ' + h(caption) + '</small>' +
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

TIQ.views.renderKiosk = function() {
  var ev = TIQ.eventInfo();
  var formUrl = TIQ.views._kioskFormUrl || "";

  return '<div class="view" id="view-intake">' +
    '<div class="kiosk-workspace">' +
      '<div class="kiosk-col-left">' +
        '<article class="kiosk-poster" id="kioskQrPanel" aria-label="Booth poster for candidates">' +
          '<header class="kiosk-masthead">' +
            '<img src="JBHUNT_LOGO.png" alt="J.B. Hunt" class="kiosk-masthead__logo" onerror="this.style.display=\'none\'" />' +
            '<div class="kiosk-masthead__event">' +
              '<span class="kiosk-masthead__name" id="kioskEventMeta">' + TIQ.escapeHtml(ev.name) + '</span>' +
              '<span class="kiosk-masthead__meta">' +
                '<span id="kioskDateValue">' + TIQ.escapeHtml(ev.date) + '</span>' +
                '<span class="kiosk-masthead__sep" aria-hidden="true">&middot;</span>' +
                '<span id="kioskLocationValue">' + TIQ.escapeHtml(ev.location) + '</span>' +
              '</span>' +
            '</div>' +
          '</header>' +
          '<div class="kiosk-poster__body">' +
            '<h2 class="kiosk-headline">Scan to submit<br />your profile</h2>' +
            '<p class="kiosk-sub">Point your phone camera at the code &mdash; the J.B. Hunt form opens right on your phone.</p>' +
            '<div class="kiosk-qr-container" id="kioskQrContainer">' +
              '<canvas id="kiosk-qr-canvas" width="200" height="200" role="img" aria-label="QR code to the J.B. Hunt candidate form"></canvas>' +
            '</div>' +
            '<ol class="kiosk-steps">' +
              '<li class="kiosk-step">' +
                '<span class="kiosk-step__n" aria-hidden="true">1</span>' +
                '<span class="kiosk-step__t">Scan the code</span>' +
                '<span class="kiosk-step__d">Your camera opens the form.</span>' +
              '</li>' +
              '<li class="kiosk-step">' +
                '<span class="kiosk-step__n" aria-hidden="true">2</span>' +
                '<span class="kiosk-step__t">Submit your profile</span>' +
                '<span class="kiosk-step__d">Add your details and r&eacute;sum&eacute;.</span>' +
              '</li>' +
              '<li class="kiosk-step">' +
                '<span class="kiosk-step__n" aria-hidden="true">3</span>' +
                '<span class="kiosk-step__t">Talk to a recruiter</span>' +
                '<span class="kiosk-step__d">Find us at the booth to say hello.</span>' +
              '</li>' +
            '</ol>' +
          '</div>' +
          '<footer class="kiosk-poster__foot">' +
            '<span class="kiosk-foot__label">The form also opens at</span>' +
            '<span class="kiosk-foot__url" id="kioskDestUrl">' + TIQ.escapeHtml(formUrl) + '</span>' +
          '</footer>' +
        '</article>' +
      '</div>' +
      '<aside class="kiosk-side" aria-label="Booth controls">' +
        '<div class="kiosk-panel">' +
          '<div class="kiosk-panel__title">Booth controls</div>' +
          '<p class="kiosk-panel__hint">Leave this page open at the booth &mdash; candidates scan the poster.</p>' +
          '<div class="kiosk-panel__actions">' +
            '<button class="primary-button kiosk-panel__btn" id="kioskCopyLink">' +
              '<svg viewBox="0 0 24 24" class="button-icon" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
              'Copy QR link' +
            '</button>' +
            '<button class="secondary-button kiosk-panel__btn" id="kioskPrintPoster">' +
              '<svg viewBox="0 0 24 24" class="button-icon" aria-hidden="true"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
              'Print poster' +
            '</button>' +
            '<button class="secondary-button kiosk-panel__btn" id="kioskOpenForm">' +
              '<svg viewBox="0 0 24 24" class="button-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>' +
              'Open form' +
            '</button>' +
          '</div>' +
          '<div class="kiosk-panel__edits">' +
            '<button type="button" class="kiosk-link-btn" id="kioskEditEvent">Edit event details</button>' +
            '<button type="button" class="kiosk-link-btn" id="kioskEditQr">Edit form destination</button>' +
          '</div>' +
        '</div>' +
      '</aside>' +
    '</div>' +
  '</div>';
};

TIQ.views.initKioskForm = function() {
  var printBtn = document.getElementById("kioskPrintPoster");
  var copyBtn = document.getElementById("kioskCopyLink");
  var openFormBtn = document.getElementById("kioskOpenForm");
  var editEventBtn = document.getElementById("kioskEditEvent");
  var editQrBtn = document.getElementById("kioskEditQr");

  var renderQR = function() {
    var url = TIQ.views._kioskFormUrl || "https://forms.gle/jbh-tech-fair-2026";
    var canvas = document.getElementById("kiosk-qr-canvas");
    var destUrl = document.getElementById("kioskDestUrl");
    if (destUrl) destUrl.textContent = url;
    if (!canvas) return;
    TIQ.qr.renderTo(url, canvas, { margin: 2 });
  };
  TIQ.views._kioskRenderQR = renderQR;

  renderQR();

  if (openFormBtn) {
    openFormBtn.addEventListener("click", function() {
      var url = TIQ.views._kioskFormUrl || "";
      if (url) window.open(url, "_blank", "noopener");
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", function() { window.print(); });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function() {
      var url = TIQ.views._kioskFormUrl || "";
      var legacyCopy = function() {
        var tmp = document.createElement("textarea");
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand("copy"); } catch (e) { /* best effort */ }
        document.body.removeChild(tmp);
        TIQ.showToast("QR link copied to clipboard.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          TIQ.showToast("QR link copied to clipboard.");
        }).catch(legacyCopy);
      } else {
        legacyCopy();
      }
    });
  }

  if (editEventBtn) editEventBtn.addEventListener("click", function() { TIQ.views._openKioskEditor("event"); });
  if (editQrBtn) editQrBtn.addEventListener("click", function() { TIQ.views._openKioskEditor("qr"); });
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
        var locVal = document.getElementById("kioskLocationValue");
        var dateVal = document.getElementById("kioskDateValue");
        if (meta) meta.textContent = info.name;
        if (locVal) locVal.textContent = info.location;
        if (dateVal) dateVal.textContent = info.date;
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
function resumeDisplayText(value) {
  return String(value == null ? '' : value).replace(/[•●○▪\u2022]/g, ' ')
    .replace(/(?:^|\n)\s*[-*]\s+/g, ' ').replace(/\s+/g, ' ').trim();
}

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

/* Display-only contributions. Metadata is never a fact; preserve complete
   source clauses, including methods and simulation qualifiers. */
TIQ.views._captureContributionFacts = function(source, name) {
  var action = /^(?:Built|Developed|Designed|Created|Implemented|Utilized|Used|Led|Managed|Manage|Maintained|Catalogued|Reduced|Increased|Supported|Assisted|Organized|Coordinated|Added|Validated|Tested|Documented|Researched|Qualified|Awarded|Earned|Received|Won|Winner|Executed|Execute|Published|Conducted|Analyzed|Tracked|Covered)\b/i;
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
        if (!construction) return;
        var method = construction[1].trim().replace(/^with\s+/i, '').replace(/["“”',]+/g, '').trim();
        if (method && TIQ.views._captureSupportedTools(method).length) facts.push(sentence.match(/^\w+/)[0] + ' with ' + method.replace(/[,\s]+$/, '') + '.');
        var tail = construction[2].replace(/^(?:covering|tracking|monitoring)\b/i, function(word) {
          return {covering:'Covered',tracking:'Tracked',monitoring:'Monitored'}[word.toLowerCase()];
        });
        if (/^(?:Covered|Tracked|Monitored)\b/.test(tail)) facts.push(tail);
        else if (/^(?:an?|the)\s+(?:(?:web|mobile)\s+)?(?:application|dashboard|tool|platform|pipeline|model|map)\b/i.test(tail)) {
          facts.push(sentence.match(/^\w+/)[0] + ' ' + tail.replace(/^an web\b/i, 'a web'));
        }
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
    var accuracy = f.match(/^(?:Utilized|Used) (.+?) to achieve (\d+(?:\.\d+)?% accuracy)(.*)$/i);
    if (accuracy) {
      /* Abstract subject-area context can be omitted; measurement conditions
         or comparisons between actual cases must remain source-qualified. */
      var abstractContext = /^ between (?:software development|computer science|programming) and (?:environmental science|agricultural science|agriculture)[.!]?$/i.test(accuracy[3]);
      return 'Achieved ' + accuracy[2] + ' using ' + accuracy[1] + (abstractContext ? '.' : accuracy[3]);
    }
    return f;
  }).filter(function(f, i, all) { return all.findIndex(function(x) { return x.toLowerCase() === f.toLowerCase(); }) === i; });
};

TIQ.views._captureTldr = function(source, name) {
  return TIQ.views._captureContributionFacts(source, name).slice(0, 3).join(' · ');
};

TIQ.views._captureMetricHtml = function(text) {
  var pattern = /\b\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?\s*(?:%\s*(?:accuracy|growth|coverage|reduction|increase)?|(?:[A-Z][a-z]+\s+)?(?:daily shipments|loading docks|facilities|students|volunteers|people|users|customers|counties|routes|observations|units|hours(?:\s+weekly|\s+per week)?|hrs\/week|team members|employees|projects|certifications|leadership roles)\b)|\$\d[\d,.]*(?:\s*(?:million|thousand))?|\b\d+(?:st|nd|rd|th) Place(?: State Winner)?/g;
  var html = '', last = 0, match;
  while ((match = pattern.exec(text))) {
    html += TIQ.escapeHtml(text.slice(last, match.index)) + '<strong class="capture-metric">' + TIQ.escapeHtml(match[0]) + '</strong>';
    last = match.index + match[0].length;
  }
  return html + TIQ.escapeHtml(text.slice(last));
};

TIQ.views._resumeHighlightEntries = function(c) {
  var parsed = c.parsedResume;
  var state = TIQ.resumeInfo(c).state;
  if (!parsed || state === 'pending' || state === 'failed' || TIQ.ai.isStaleParse(parsed)) return [];
  var raw = resumeDisplayText(parsed.rawText);
  var grounded = TIQ.generateAccomplishments(c).filter(function(a) { return a.source === 'resume'; });
  var entries = [];
  function supported(text) { return !raw || raw.indexOf(resumeDisplayText(text)) !== -1; }
  function add(category, name, description) {
    name = resumeDisplayText(name);
    description = resumeDisplayText(description);
    if ((!description && !name) || (description && !supported(description)) || (name && !supported(name))) return;
    if (/^(?:skills?|technical|education|gpa|expected graduation)\b/i.test(description)) return;
    if (entries.some(function(e) { return e.description === description && e.name === name; })) return;
    entries.push({ category: category, name: name, description: description });
  }
  /* Keep a complete contribution, not a word-count truncation that could drop
     a result or change the meaning. Later bullets remain in source evidence. */
  function contribution(value) {
    var parts = String(value || '').split(/[•●○▪]|(?:\r?\n)\s*[-*]\s+/)
      .map(resumeDisplayText).filter(Boolean);
    var action = /\b(?:built|developed|designed|created|implemented|led|managed|manage|mentored|organized|coordinated|supported|assisted|improved|reduced|increased|analyzed|maintained|delivered|executed|execute|launched|deployed|automated|researched|taught|trained|qualified)\b/i;
    var text = parts.filter(function(part) { return action.test(part); })[0] || '';
    var sentence = text.match(/^.*?[.!?](?:\s|$)/);
    if (sentence) {
      var rest = text.slice(sentence[0].length).trim();
      var next = (rest.match(/^.*?[.!?](?:\s|$)/) || [rest])[0].trim();
      text = sentence[0].trim();
      /* A result or tools in the next sentence are not expendable filler. */
      if (next && /\d|\b(?:using|with|tools?|reduced|increased|improved|saved|achieved)\b/i.test(next)) text += ' ' + next;
    }
    return action.test(text) ? text : '';
  }
  (parsed.experience || []).forEach(function(e) {
    /* Old parses can include the following section inside a role description.
       Bound the display source before summarizing, without repairing stored data. */
    var roleSource = String(e.description || '').split(/(?:^|\n)\s*(?:LEADERSHIP|AWARDS|ACHIEVEMENTS|HONORS|PROJECTS|SKILLS|CERTIFICATIONS|EDUCATION)\b|\b(?:LEADERSHIP & ACTIVITIES|SKILLS, CERTIFICATIONS OR AWARDS)\b/i)[0];
    var desc = contribution(roleSource);
    if (!desc) return;
    /* Validate the title and organization separately: the display separator
       need not be the same as the PDF's separator. */
    if ((e.title && !supported(e.title)) || (e.company && !supported(e.company))) return;
    var head = [e.title, e.company].filter(Boolean).map(resumeDisplayText).join(' · ');
    if (supported(desc)) entries.push({ category: 'Experience', name: head, description: TIQ.views._captureTldr(supported(roleSource) ? roleSource : desc, e.title), dates: [e.dates, e.location].filter(function(v) { return v && supported(v); }).map(resumeDisplayText).join(' · ') });
  });
  var experience = entries.splice(0);
  (parsed.projects || []).forEach(function(p) {
    var desc = contribution(p.description);
    /* Some existing parses retain only the project name/year. The generator
       already recovers the source quote; attach it only on an exact name match. */
    if (!desc && p.name) {
      var quote = grounded.filter(function(a) {
        return resumeDisplayText(a.text).indexOf(resumeDisplayText(p.name)) !== -1 && contribution(a.text);
      })[0];
      if (quote) desc = contribution(quote.text);
    }
    if (desc) {
      add('Project', p.name, desc);
      var last = entries[entries.length - 1];
      if (last && last.name === resumeDisplayText(p.name)) {
        last.dates = [p.dates || p.year || (/^\d{4}$/.test(resumeDisplayText(p.description)) ? p.description : ''), p.location].filter(function(v) { return v && supported(v); }).map(resumeDisplayText).join(' · ');
        /* Recover a project block only after the exact source-backed name.
           Stop at the next role/section so another accomplishment cannot leak. */
        var lines = String(parsed.rawText || '').split(/\r?\n/);
        var start = lines.findIndex(function(l) { return l.indexOf(p.name) >= 0; });
        var end = start + 1;
         var boundaries = (parsed.projects || []).filter(function(next) { return next !== p; }).map(function(next) { return next.name; })
           .concat((parsed.experience || []).map(function(role) { return role.title; })).filter(Boolean);
          while (end < lines.length && !/^(?:Teaching|[A-Z][a-z]+\s+(?:Assistant|Intern|Engineer)|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|LEADERSHIP|EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS|AWARDS|HONORS)\b/i.test(lines[end].trim()) &&
           !boundaries.some(function(name) { return resumeDisplayText(lines[end]).indexOf(resumeDisplayText(name)) === 0; })) end++;
          var source = start >= 0 ? lines.slice(start + 1, end).join('\n') : desc;
         last.sourceText = source;
        last.description = TIQ.views._captureTldr(source, p.name) || TIQ.views._captureTldr(desc, p.name);
      }
    }
  });
  var projects = entries.splice(0);
  /* Reuse the existing source-checked generator for leadership and substantive
     accomplishments the section parser did not give their own field. */
  grounded.filter(function(a) {
    return a.source === 'resume' && !a.contextLabel &&
      /^(?:Recognition|Leadership role|Owned the work|Quantified impact|Built something)$/.test(a.facet);
  }).forEach(function(a) {
    if (a.facet === 'Recognition' && !/\b(?:award(?:ed)?|winner|place|medal|honou?r|qualified|competitor)\b/i.test(a.text)) return;
    if (experience.concat(projects).some(function(e) {
      var text = resumeDisplayText(a.text);
      return e.description.indexOf(text) !== -1 || text.indexOf(e.description) !== -1;
    })) return;
    var category = /Leadership|Owned/.test(a.facet) ? 'Leadership' : a.facet === 'Recognition' ? 'Award' : 'Accomplishment';
    var statement = resumeDisplayText(a.text), title = '', description = statement;
    var award = statement.match(/^(?:Awarded|Received|Earned)\s+(.+?)\s+for\s+(.+)/i);
    var team = statement.match(/^(?:Led|Managed|Coordinated)\s+(?:a\s+)?(team\s+of\s+.+?)\s+to\s+/i);
    if (award) title = award[1];
    else if (team) title = team[1];
    if (a.facet === 'Leadership role') {
      title = statement;
      var lines = String(parsed.rawText || '').split(/\r?\n/), index = lines.findIndex(function(l) { return resumeDisplayText(l).indexOf(title) === 0; });
      var following = index >= 0 ? lines.slice(index + 1, index + 6).join('\n') : '';
      description = contribution(following);
      /* A leadership achievement is meaningful without a manufactured result. */
    }
    add(category, title, description);
    var added = entries[entries.length - 1];
    if (added && added.name === resumeDisplayText(title)) {
      added.description = TIQ.views._captureTldr(description, title);
      if (a.facet === 'Leadership role') {
        var contextLine = index >= 0 ? lines[index + 1] : '';
        var roles = statement.split(/\s*&\s*|\s+and\s+/).filter(Boolean);
        if (contextLine && supported(contextLine) && !/^[•●○▪]|^\s*$/.test(contextLine)) added.dates = resumeDisplayText(contextLine);
          if (roles.length > 1) added.roleCount = roles.length;
          /* Nearby competition bullets are Awards, not inferred role outcomes. */
      }
    }
  });
   entries.sort(function(a, b) { return (a.category === 'Leadership' ? 0 : 1) - (b.category === 'Leadership' ? 0 : 1); });
  (parsed.certifications || []).forEach(function(cert) {
    /* The existing extractor can append the next all-caps section heading.
       Keep the actual credential name, not that heading or its skill list. */
    var text = resumeDisplayText(cert).split(/\s+\b(?:SKILLS|EDUCATION|TECHNICAL|GPA)\b/)[0].trim();
    if (entries.some(function(e) { return e.category === 'Certification' && e.name.indexOf(text) !== -1; })) return;
    if (text) add('Certification', text, '');
  });
  var other = entries.splice(0);
  var certs = other.filter(function(e) { return e.category === 'Certification'; });
  other = other.filter(function(e) { return e.category !== 'Certification'; });
  if (certs.length) other.push({category:'Certifications',name:certs.map(function(e) { return e.name.replace(/\s*\([^)]*\)/g, '').replace(/\.$/, ''); }).join(' · '),description:certs.length + ' certification' + (certs.length === 1 ? '' : 's')});
  /* Surface a varied source-backed summary without requiring any category. */
  var ordered = [experience[0], projects[0], other[0]].filter(Boolean)
    .concat(other.filter(function(e) { return e.category === 'Certifications'; }), experience.slice(1), projects.slice(1), other.slice(1));
   var counts = {};
   var summaryLimit = experience.length && projects.length && other.some(function(e) { return e.category === 'Leadership'; }) && certs.length ? 4 : 5;
  return ordered.filter(function(e, i) {
    if (!e.name && !e.description) return false;
    if (ordered.findIndex(function(x) { return x.description === e.description && x.name === e.name; }) !== i) return false;
    counts[e.category] = (counts[e.category] || 0) + 1;
    return !/^(Project|Certification)$/.test(e.category) || counts[e.category] <= 2;
   }).slice(0, summaryLimit);
};

/* Short-height presentation uses complete source-backed phrases, never ellipsis.
   This creates no alternate candidate data and does not move facts across items. */
TIQ.views._compactCaptureEntry = function(entry) {
  var result = Object.assign({}, entry);
  var phrases = String(entry.description || '').split(' · ');
  var measured = phrases.filter(function(s) { return /\d|\$/.test(s); });
  result.description = (measured.length ? measured.slice(0, 2) : phrases.slice(0, 1)).join(' · ');
  if (entry.facts) {
    var ranked = entry.facts.map(function(f, i) { return {text:f,index:i,priority:/\b(?:winner|award|won|medal|place)\b/i.test(f) ? 0 : /\d|\$/.test(f) ? 1 : 2}; });
    ranked.sort(function(a,b) { return a.priority - b.priority || a.index - b.index; });
    result.facts = ranked.slice(0, entry.category === 'Certifications' ? entry.facts.length : entry.category === 'Project' ? 3 : 2).map(function(f) { return f.text; });
  }
  return result;
};

/* Only display facts owned by this item. All source text remains in Evidence. */
TIQ.views._captureVisualEntries = function(c) {
  var parsed = c.parsedResume || {}, raw = String(parsed.rawText || '');
  var quotes = TIQ.generateAccomplishments(c).filter(function(a) { return a.source === 'resume'; });
  var entries = TIQ.views._resumeHighlightEntries(c).map(function(entry) {
    var e = Object.assign({}, entry);
    e.facts = String(e.description || '').split(' · ').filter(Boolean);
    if (e.category === 'Experience') {
      var role = (parsed.experience || []).find(function(r) { return [r.title,r.company].filter(Boolean).join(' · ') === e.name; });
      if (role) {
        var owned = quotes.filter(function(a) { return a.contextLabel === e.name; }).map(function(a) { return a.text; });
        e.facts = TIQ.views._captureContributionFacts(owned.join('\n• '), role.title);
        e.name = role.title;
        e.organization = role.company || '';
      }
      var experienceCount = (parsed.experience || []).length;
      e.context = experienceCount + ' experience' + (experienceCount === 1 ? '' : 's');
    }
    if (e.category === 'Project') {
      var project = (parsed.projects || []).find(function(p) { return resumeDisplayText(p.name) === e.name; });
      var contributions = quotes.filter(function(a) { return a.contextLabel === e.name; }).map(function(a) { return a.text; });
      e.facts = TIQ.views._captureContributionFacts(contributions.join('\n• '), e.name);
      /* Recover only bounded contribution lines, never the heading itself. */
      TIQ.views._captureContributionFacts(e.sourceText, e.name).forEach(function(f) { if (!e.facts.includes(f)) e.facts.push(f); });
      var technologyLine = project && resumeDisplayText(String(project.description || '').split(/[•●○▪]|\s+-\s+(?=[A-Z])/)[0]);
      if (technologyLine && resumeDisplayText(raw).includes(technologyLine) && !e.facts.some(function(f) { return /^Built with\b/.test(f); })) {
        var technologies = TIQ.views._captureSupportedTools(technologyLine).filter(function(t) {
          return t && !e.facts.some(function(f) { return f.toLowerCase().includes(t.toLowerCase()); });
        });
        if (technologies.length) e.facts.push('Built with ' + (technologies.length > 2 ? technologies.slice(0,-1).join(', ') + ', and ' + technologies[technologies.length-1] : technologies.join(' and ')) + '.');
      }
      e.context = (parsed.projects || []).filter(function(p) { return p.name; }).length + ' project' + ((parsed.projects || []).filter(function(p) { return p.name; }).length === 1 ? '' : 's');
      /* A distinction heading immediately introducing an explicitly labelled
         project belongs to that block, not to a preceding or following role. */
      var lines = raw.split(/\r?\n/), at = lines.findIndex(function(line) { return project && /^\s*Project\s*:/i.test(line) && line.indexOf(project.name) >= 0; });
      var lead = at >= 0 ? lines.slice(Math.max(0, at - 2), at).map(resumeDisplayText) : [];
      var award = lead.find(function(line) { return /^(?:Winner|Awarded|Received|Won)\b/i.test(line) && !/\b(?:for|project)\s*:/i.test(line); });
      if (award) {
        var inlineYear = award.match(/(?:\||\()\s*(\d{4})\s*\)?(?:$|\s*\|)/);
        var year = inlineYear ? inlineYear[1] : lead.find(function(line) { return /^\d{4}$/.test(line); });
        var awardName = award.split(/\s*\|\s*/)[0].replace(/\s*\(\d{4}\)$/, '').replace(/^Winner\s*[-–—]\s*/i, 'Winner — ');
        e.facts.unshift(awardName + (year ? ' (' + year + ')' : ''));
      }
      TIQ.views._captureContributionFacts(e.sourceText, e.name).filter(function(f) {
        return /^(?:won|winner|awarded|received.*(?:award|prize|medal))\b/i.test(f);
      }).forEach(function(f) { if (!e.facts.some(function(existing) { return existing.indexOf(f) >= 0; })) e.facts.unshift(f); });
    } else if (e.category === 'Leadership') {
      var count = String(e.roleCount || (e.description.match(/^(\d+) leadership roles?$/) || [])[1] || '');
      e.context = count ? count + ' role' + (count === '1' ? '' : 's') : '1 role';
      if (e.dates && !/^\d|^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(e.dates)) { e.organization = e.dates; e.dates = ''; }
      e.facts = TIQ.views._captureContributionFacts(e.description, e.name);
    } else if (e.category === 'Certifications') {
      e.facts = e.name.split(' · ').filter(Boolean);
      e.context = e.facts.length + ' certification' + (e.facts.length === 1 ? '' : 's');
      e.name = '';
    }
    if (!e.context) e.context = e.dates || '';
    e.facts = e.facts.filter(function(f, i, all) {
      function key(value) { return value.replace(/[.!?;]+$/, '').toLowerCase(); }
      return all.findIndex(function(other) { return key(other) === key(f); }) === i;
    }).map(function(f) {
      return f.replace(/(\d+)\s*-\s*(\d+)\s+hours weekly\b/g, '$1–$2 hours per week');
    });
    if (e.category !== 'Certifications') {
      var distinctions = e.facts.filter(function(f) { return /^(?:Winner|Won|Awarded|Received.*(?:award|prize|medal))\b/i.test(f); });
      e.distinction = distinctions.join(' ');
      e.facts = e.facts.filter(function(f) { return !distinctions.includes(f); }).slice(0, 3);
    }
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
  var label = {Project:'Projects'}[e.category] || e.category;
  return '<div class="resume-highlights__context">' + TIQ.views._captureSectionIcon(e.category) + '<span class="resume-highlights__category">' + TIQ.escapeHtml(label) + '</span><span class="resume-highlights__leader" aria-hidden="true"></span>' +
    (e.context ? '<span class="resume-highlights__dates">' + TIQ.escapeHtml(e.context) + '</span>' : '') + '</div>' +
    (e.name ? '<strong class="resume-highlights__name" title="' + TIQ.escapeAttr(e.name) + '">' + TIQ.escapeHtml(e.name) + '</strong>' : '') +
    ((e.organization || e.dates) ? '<div class="capture-item-context"><span>' + TIQ.escapeHtml(e.organization || '') + '</span><span>' + TIQ.escapeHtml(e.dates || '') + '</span></div>' : '') +
    (e.distinction ? '<p class="capture-distinction">' + TIQ.escapeHtml(e.distinction) + '</p>' : '') +
    (e.category === 'Certifications' ? '<div class="capture-credentials">' + facts.map(function(f) { return '<p>' + TIQ.escapeHtml(f) + '</p>'; }).join('') + '</div>' : facts.length ? '<ul class="capture-facts">' + facts.map(function(f) { return '<li>' + TIQ.views._captureMetricHtml(f) + '</li>'; }).join('') + '</ul>' : '');
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
  var message = info.state === 'failed' ? 'Résumé parsing failed: ' + (info.error || 'Try a text-based PDF.')
    : info.state === 'pending' ? 'Parsing résumé… Highlights will appear when the scan finishes.'
    : TIQ.ai.isStaleParse(c.parsedResume) ? 'Re-scan this résumé to refresh its highlights.'
    : c.parsedResume ? 'No substantive résumé highlights extracted.'
    : info.state === 'legacy' ? 'Scan this résumé to see highlights.'
    : 'Upload a résumé to see highlights.';
  return '<section class="resume-highlights" aria-label="Résumé Highlights">' +
    '<h3 class="resume-highlights__title">Résumé Highlights</h3>' +
    (entries.length ? '<ul class="resume-highlights__list">' + entries.map(function(e) {
      return '<li class="resume-highlights__entry">' + TIQ.views._captureHighlightItemHtml(e) + '</li>';
    }).join('') + '</ul>' : '<p class="resume-highlights__empty" role="status"><strong>No highlights yet</strong><br>' + TIQ.escapeHtml(message) + '</p>') +
    '</section>';
};

TIQ.views._resumeConflictsHtml = function(c) {
  var conflicts = c.resumeConflicts || [];
  if (!conflicts.length) return '';
  var labels = {firstName:'First name',lastName:'Last name',university:'School',degreeProgram:'Degree',graduationDate:'Graduation date',gpa:'GPA'};
  function text(value) { return Array.isArray(value) ? value.join(', ') : value && typeof value === 'object' ? Object.values(value).filter(Boolean).join(', ') : value || '(cleared)'; }
  return '<details class="resume-conflicts"><summary>Résumé discrepancies · ' + conflicts.length + ' to review</summary><p>Entered values were kept. Review these differences against the résumé.</p><ul>' + conflicts.map(function(conflict) {
    return '<li><strong>' + TIQ.escapeHtml(labels[conflict.field] || conflict.field) + '</strong>: entered “' + TIQ.escapeHtml(text(conflict.entered)) + '”; résumé “' + TIQ.escapeHtml(text(conflict.resume)) + '”</li>';
  }).join('') + '</ul></details>';
};

TIQ.views._buildCardHtml = function(c, isFront) {
  var flags = TIQ.getMissingFlags(c);
  var gradDate = TIQ.formatMonthYear(c.graduationDate || "");

  /* Section 1: header — avatar + name + school + grad/GPA with provenance.
     Placeholder copy ("not listed" / "TBD") is gone: lines only render when
     they carry real values, so the name is the loudest thing on the card. */
  var gpaOk = !!c.gpa && !!String(c.gpa).trim();
  var gpaDot = (gpaOk && TIQ.fieldSource(c, "gpa") === "resume")
    ? '<span class="prov-dot prov-dot--resume" title="Extracted from the scanned PDF"></span>' : '';
  var display = TIQ.views._displayName(c);
  var nameHtml = display
    ? '<h2 class="candidate-name">' + TIQ.escapeHtml(display) + '</h2>'
    : '<h2 class="candidate-name candidate-name--missing">Name not captured</h2>';
  var schoolBits = [c.university, c.major || c.degreeProgram].filter(function(v) {
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
        'Swipe' +
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
   synthesized résumé. Preserve the complete source in an adjacent disclosure. */
TIQ.views._capturePrintResumeHtml = function(c) {
  var parsed = c.parsedResume || {}, info = TIQ.resumeInfo(c);
  if (info.state === 'pending') return '<p class="resume-empty" role="status">Parsing résumé…</p>';
  if (info.state === 'failed') return '<p class="resume-empty" role="status">' + TIQ.escapeHtml(info.error || 'Résumé could not be read.') + '</p>' + TIQ.renderDropZone(info.name, {inputId:'drawerResumeScan'});
  if (!c.parsedResume) return '<p class="resume-empty">Scan a résumé to view its document.</p>' + TIQ.renderDropZone(info.name, {inputId:'drawerResumeScan'});
  var contact = parsed.contact || {}, links = parsed.links || {};
  var header = '<header class="resume-document__header"><h2>' + TIQ.escapeHtml(TIQ.views._displayName(c) || 'Résumé') + '</h2>' +
    '<p>' + [contact.address,contact.email,contact.phone].filter(Boolean).map(TIQ.escapeHtml).join(' | ') + '</p>' +
    '<p>' + Object.keys(links).filter(function(k) { return links[k]; }).map(function(k) { return resumeLinkHtml(links[k]); }).join(' ') + '</p></header>';
  var sections = [], current = null;
  String(parsed.rawText || '').split(/\r?\n/).forEach(function(line) {
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
      if (b.bullet) return '<ul><li>' + TIQ.escapeHtml(b.text) + '</li></ul>';
      var followingDates = [], next = index + 1;
      while (dateLine(blocks[next])) followingDates.push(blocks[next++].text);
      var metadata = headingMetadata(b.text, followingDates);
      var title = !!metadata.date || index === 0 || /^Project\s*:/i.test(b.text);
      return '<p class="resume-document__line' + (title ? ' resume-document__item-heading' : '') + '">' + (title ? '<strong>' : '<span>') + TIQ.escapeHtml(metadata.text) + (title ? '</strong>' : '</span>') + (metadata.date ? '<span class="resume-document__date">' + TIQ.escapeHtml(metadata.date) + '</span>' : '') + '</p>';
    }).join('') + '</section>';
  }).join('');
  if (!body) {
    function section(label, items) { return items.length ? '<section class="resume-document__section"><h3>' + label + '</h3>' + items.join('') + '</section>' : ''; }
    body += section('EDUCATION',(parsed.education || []).map(function(e) { return '<p><strong>' + TIQ.escapeHtml(e.school || '') + '</strong></p><p>' + TIQ.escapeHtml([e.degreeProgram || e.degree,e.major,e.year].filter(Boolean).join(' · ')) + '</p>'; }));
    body += section('EXPERIENCE',(parsed.experience || []).map(function(e) { return '<p><strong>' + TIQ.escapeHtml([e.title,e.company].filter(Boolean).join(' · ')) + '</strong> ' + TIQ.escapeHtml(e.dates || '') + '</p><p>' + TIQ.escapeHtml(e.description || '') + '</p>'; }));
    body += section('PROJECTS',(parsed.projects || []).map(function(e) { return '<p><strong>' + TIQ.escapeHtml(e.name || '') + '</strong></p><p>' + TIQ.escapeHtml(e.description || '') + '</p>'; }));
    body += section('CERTIFICATIONS',(parsed.certifications || []).map(function(e) { return '<ul><li>' + TIQ.escapeHtml(e) + '</li></ul>'; }));
  }
  return (TIQ.ai.isStaleParse(c.parsedResume) ? '<p class="drawer-rescan__warn">This scan is stale. Re-scan the PDF to refresh its source sections.</p>' + TIQ.renderDropZone(info.name, {inputId:'drawerResumeScan'}) : '') + '<article class="resume-document" data-candidate-id="' + TIQ.escapeAttr(c.id) + '">' + header + body + '</article><p class="provenance-legend">Résumé source · reviewed identity shown above. Original wording is available below.</p>';
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
      '<button type="button" id="capture-tab-voice" class="drawer-tab" role="tab" data-drawer-tab="voice" aria-controls="capture-panel-voice" aria-selected="false" tabindex="-1">Voice</button>' +
      '<button type="button" id="capture-tab-notes" class="drawer-tab" role="tab" data-drawer-tab="notes" aria-controls="capture-panel-notes" aria-selected="false" tabindex="-1">Notes</button>' +
    '</div>' +
    '<div id="capture-panel-resume" class="drawer-panel is-active" role="tabpanel" aria-labelledby="capture-tab-resume" data-drawer-panel="resume">' +
      TIQ.views._capturePrintResumeHtml(sel) +
      TIQ.views._resumeConflictsHtml(sel) +
      (sel.parsedResume && sel.parsedResume.rawText ? '<details class="capture-source-text"><summary>Original résumé text</summary><pre class="drawer-raw">' + TIQ.escapeHtml(sel.parsedResume.rawText) + '</pre></details>' : '') +
    '</div>' +
    '<div id="capture-panel-voice" class="drawer-panel" role="tabpanel" aria-labelledby="capture-tab-voice" data-drawer-panel="voice">' +
      '<div class="capture-section-title">Recordings</div>' +
      TIQ.views._captureVoiceHtml(sel) +
      '<div id="audioRecordings" class="audio-recordings">' + recordingsHtml + '</div>' +
    '</div>' +
    '<div id="capture-panel-notes" class="drawer-panel" role="tabpanel" aria-labelledby="capture-tab-notes" data-drawer-panel="notes">' +
      '<div class="capture-section-title">Recruiter Notes</div>' +
      '<textarea id="captureNotes" class="capture-textarea capture-textarea--inline" rows="6" placeholder="Add notes about this candidate...">' + TIQ.escapeHtml(sel.notes) + '</textarea>' +
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
              '<button class="capture-triage-btn capture-triage--review" id="captureReview" title="Mark as Reviewed (swipe left / &larr;)">' +
                '<span class="capture-triage-arrow">&larr;</span><span class="capture-triage-label">Reviewed</span>' +
              '</button>' +
              '<button class="capture-triage-btn capture-triage--undo" id="captureSkip" title="Undo last action">' +
                '<svg class="capture-triage-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>' +
                '<span class="capture-triage-label">Undo</span>' +
              '</button>' +
              '<button class="capture-triage-btn capture-triage--follow" id="captureFollow" title="Follow Up (swipe right / &rarr;)">' +
                '<span class="capture-triage-label">Follow-Up</span><span class="capture-triage-arrow">&rarr;</span>' +
              '</button>' +
            '</div>' +
            '<button type="button" class="capture-evidence-open" data-capture-details-open>View résumé &amp; evidence →</button>' +
          '</div>' +
        '<aside class="capture-col-right">' +
          '<button type="button" class="capture-evidence-back" data-capture-details-back>← ' + TIQ.escapeHtml(displayNameForEvidence(c)) + '</button>' +
          '<header class="capture-evidence-header"><div><p>Evidence</p><h2 class="capture-evidence-heading">' + TIQ.escapeHtml(displayNameForEvidence(c)) + '</h2></div>' +
          (TIQ.resumeInfo(c).sourceUrl ? '<a class="capture-full-resume" href="' + TIQ.escapeAttr(TIQ.resumeInfo(c).sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open original résumé ↗</a>' : '') + '</header>' +
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
    var summary = container.querySelector('.capture-summary');
    if (!summary || !summary.clientHeight) return;
    var candidate = TIQ.state.candidates[TIQ.views._captureIndex];
    var entries = TIQ.views._captureVisualEntries(candidate);
    var nodes = Array.from(summary.querySelectorAll('.resume-highlights__entry'));
    var highlights = summary.querySelector('.resume-highlights');
    if (highlights) highlights.hidden = false;
    summary.querySelectorAll('.candidate-name, .university').forEach(function(node) {
      node.classList.toggle('capture-long-text', node.textContent.length > 65);
      node.title = node.textContent;
    });
    var limit = window.innerWidth < 960 || available < 540 ? 3 : 4;
    nodes.forEach(function(node, i) {
      node.hidden = i >= limit;
      node.innerHTML = TIQ.views._captureHighlightItemHtml(compact ? TIQ.views._compactCaptureEntry(entries[i]) : entries[i]);
      var name = node.querySelector('.resume-highlights__name');
      if (name) name.classList.toggle('capture-long-text', name.textContent.length > 65);
    });
    function exceeds() { return summary.scrollHeight > summary.clientHeight + 1; }
    if (exceeds() && !compact) {
      container.setAttribute('data-density', 'compact');
      nodes.forEach(function(node, i) {
        node.innerHTML = TIQ.views._captureHighlightItemHtml(TIQ.views._compactCaptureEntry(entries[i]));
        var name = node.querySelector('.resume-highlights__name');
        if (name) name.classList.toggle('capture-long-text', name.textContent.length > 65);
      });
    }
    /* Remove lowest display-priority groups first. Their complete sources stay
       in Resume; no candidate fields, claims, or metrics are modified. */
    for (var i = nodes.length - 1; i >= 0 && exceeds(); i--) nodes[i].hidden = true;
    if (highlights && nodes.length && nodes.every(function(node) { return node.hidden; })) highlights.hidden = true;
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
    TIQ.howItWorksHtml() +
    (TIQ.views._reviewMissingFlag ? '<p class="results-intro">Missing ' + TIQ.escapeHtml(TIQ.views._reviewMissingFlag) + ' · population: ' + TIQ.escapeHtml(TIQ.views._reviewEventScope || 'all') + ' <button class="secondary-button small-button" id="clearMissingScope">Show all records</button></p>' : '') +
    '<div class="ai-filter-bar">' +
      '<select id="aiStatusFilter"><option value="all">All Statuses</option>' + TIQ.CONFIG.statuses.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join("") + '</select>' +
      '<select id="aiFuncFilter"><option value="all">All Functions</option>' + TIQ.CONFIG.functions.map(function(f) { return '<option value="' + f + '">' + f + '</option>'; }).join("") + '</select>' +
      '<select id="aiPriorityFilter"><option value="all">All Priority</option>' + TIQ.CONFIG.priorities.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join("") + '</select>' +
      '<div class="search-inline"><svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.2-4.2" fill="none" stroke="currentColor" stroke-width="2"/></svg><input id="aiSearch" type="search" placeholder="Search..." value="' + TIQ.escapeAttr(TIQ.views._aiReviewSearch) + '" /></div>' +
      '<button class="secondary-button small-button" id="aiExportCsv">Export CSV</button>' +
      '<button class="secondary-button small-button" id="aiExportJson">Export JSON</button>' +
    '</div>' +
    '<div class="ai-layout review-layout">' +
      '<div class="ai-list-panel"><div class="ai-list-count">' + filtered.length + ' candidates</div><div class="ai-list" id="aiCandidateList">' + listHtml + '</div></div>' +
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
      (flags.length ? '<span class="flag-count">' + flags.length + '</span>' : '<span class="flag-count flag-count--ok">0</span>') +
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
  var rawText = (parsed && parsed.rawText) ? parsed.rawText : "";
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
    '<section class="ai-section"><div class="section-title"><span class="section-kicker" data-snapshot-status>Extraction Snapshot · ' + TIQ.escapeHtml(c.approvalStatus || 'Pending') + '</span></div><label for="snapshotEdit">Review and edit the draft; changes require approval again</label><textarea id="snapshotEdit" class="notes-card notes-textarea" rows="6">' + TIQ.escapeHtml(summaryText) + '</textarea></section>' +
    TIQ.views.renderAccomplishments(c, "Accomplishments") +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Missing Information Flags</span></div><div class="flag-list">' + flagsHtml + (aiMissingHtml ? '<div class="flag-list__ai">' + aiMissingHtml + '</div>' : '') + '</div></section>';
  var resumePanel = TIQ.views._renderResumeSection(c) + TIQ.views._renderReviewResumeSupplement(c);
  var notesPanel =
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Recruiter Notes</span></div><textarea id="aiNotes" class="notes-card notes-textarea" rows="4">' + TIQ.escapeHtml(notesText) + '</textarea></section>' +
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
