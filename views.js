/* ============================================
   TalentIQ — View Renderers
   ============================================ */
window.TIQ = window.TIQ || {};

/* ---- Overview View ---- */
TIQ.views = TIQ.views || {};
TIQ.views.renderOverview = function() {
  var cands = TIQ.state.candidates || [];
  var A = TIQ.analytics;
  var counts = A.statusCounts(cands);
  var ev = TIQ.eventInfo();

  return '<div class="view" id="view-overview">' +
    '<div class="view-header"><span class="section-kicker">Executive Console</span></div>' +
    '<div class="overview-event-bar">' +
      '<div class="event-badge"><span class="event-badge__label">Event</span><span class="event-badge__value">' + TIQ.escapeHtml(ev.name) + '</span></div>' +
      '<div class="event-badge"><span class="event-badge__label">Date</span><span class="event-badge__value">' + TIQ.escapeHtml(ev.date) + '</span></div>' +
      '<div class="event-badge"><span class="event-badge__label">Location</span><span class="event-badge__value">' + TIQ.escapeHtml(ev.location) + '</span></div>' +
    '</div>' +
    TIQ.renderMetricsCards([
      { label: "Total Scanned", value: cands.length, sub: "Candidate profiles collected", modifier: "blue" },
      { label: "Interview Requests", value: counts["Interview Requested"] + counts["Follow-Up"], sub: "Next-day scheduling", modifier: "green" },
      { label: "Avg Review Time", value: A.formatDuration(A.avgReviewSeconds(cands)), sub: "Per candidate review", modifier: "amber" },
      { label: "Data Completeness", value: A.dataCompleteness(cands) + "%", sub: "Across all records", modifier: "purple" }
    ]) +
    '<div class="overview-grid">' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Candidates by Major</span></div>' +
        '<div class="overview-bars">' +
          A.majorBreakdown(cands).map(function(m, i) {
            return '<div class="hbar-row"><span class="hbar-label">' + TIQ.escapeHtml(m.label) + '</span><div class="hbar-track"><div class="hbar-fill" style="width:' + m.value + '%;animation-delay:' + (i * 80) + 'ms"></div></div><span class="hbar-val">' + m.value + '%</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Top Universities</span></div>' +
        '<div class="overview-list">' +
          A.topUniversities(cands).map(function(u, i) {
            return '<div class="overview-list__item" style="animation-delay:' + (i * 60) + 'ms"><span class="overview-list__rank">' + (i + 1) + '</span><span class="overview-list__name">' + TIQ.escapeHtml(u.university) + '</span><span class="overview-list__count">' + u.count + '</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Today\'s Activity</span></div>' +
        '<div class="overview-activity">' +
          A.activityFeed(cands).map(function(f, i) {
            return '<div class="activity-item" style="animation-delay:' + (i * 60) + 'ms"><span class="activity-dot" style="background:' + TIQ.escapeAttr(f.dotColor) + '"></span><div><strong>' + TIQ.escapeHtml(f.recruiter) + '</strong> ' + TIQ.escapeHtml(f.action) + ' ' + TIQ.escapeHtml(f.target) + '<span class="activity-time">' + TIQ.escapeHtml(f.time) + '</span></div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
};

TIQ.views.renderAnalytics = function() {
  return TIQ.views.renderOverview();
};

TIQ.views.initAnalyticsEvents = function() {};

/* ---- Event Info (QR Poster + Configurator) ---- */
TIQ.views._kioskFormUrl = TIQ.views._kioskFormUrl || (((window.location && window.location.origin) || "") + "/candidate-form.html");
TIQ.views._kioskIntakeMethod = TIQ.views._kioskIntakeMethod || "google-form";
TIQ.views._kioskRenderQR = null;

TIQ.views._kioskInfoIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 7.7v.1"></path></svg>';

TIQ.views.renderKiosk = function() {
  var cfg = TIQ.CONFIG;
  var ev = TIQ.eventInfo();

  return '<div class="view" id="view-intake">' +
    '<div class="kiosk-workspace">' +
      '<div class="kiosk-col-left">' +
        '<div class="kiosk-event-card">' +
          '<button type="button" class="kiosk-info-btn kiosk-info-btn--dark" id="kioskEditEvent" aria-label="Edit event details" title="Edit event details">' + TIQ.views._kioskInfoIcon + '</button>' +
          '<div class="kiosk-event-card__eyebrow">Event Booth</div>' +
          '<div class="kiosk-event-card__title">' + TIQ.escapeHtml(cfg.company) + '</div>' +
          '<div class="kiosk-event-card__meta" id="kioskEventMeta">' + TIQ.escapeHtml(ev.name) + '</div>' +
          '<div class="kiosk-event-card__line"></div>' +
          '<p class="kiosk-event-card__copy">Quick candidate capture for the career fair floor. Brand &amp; QR Check-in.</p>' +
        '</div>' +
        '<div class="kiosk-location-card">' +
          '<div class="kiosk-location-row"><span class="kiosk-location-label">Location</span><span class="kiosk-location-value" id="kioskLocationValue">' + TIQ.escapeHtml(ev.location) + '</span></div>' +
          '<div class="kiosk-location-row"><span class="kiosk-location-label">Date</span><span class="kiosk-location-value" id="kioskDateValue">' + TIQ.escapeHtml(ev.date) + '</span></div>' +
          '<div class="kiosk-location-row kiosk-location-row--last"><span class="kiosk-location-label">Mode</span><span class="kiosk-location-value">Mobile + Desktop</span></div>' +
        '</div>' +

        '<section class="kiosk-camera-panel" id="kioskCameraPanel">' +
          '<div class="kiosk-camera-panel__head">' +
            '<div>' +
              '<div class="kiosk-camera-panel__kicker">Booth camera</div>' +
              '<div class="kiosk-camera-panel__title">Check framing before Capture</div>' +
            '</div>' +
            '<div class="kiosk-camera-panel__tools">' +
              '<button type="button" class="kiosk-camera-tool" id="kioskCamFlip" aria-label="Flip camera" title="Flip camera" disabled>' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7h-3l-1.4-2H8.4L7 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 12a3.5 3.5 0 0 1 6-2.4M15 12a3.5 3.5 0 0 1-6 2.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
              '</button>' +
              '<button type="button" class="kiosk-camera-tool" id="kioskCamFullscreen" aria-label="Fullscreen camera" title="Fullscreen">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="kiosk-camera-stage" id="kioskCameraStage">' +
            '<video id="kioskCameraPreview" class="kiosk-camera-preview" playsinline muted autoplay></video>' +
            '<div class="kiosk-camera-placeholder" id="kioskCameraPlaceholder">' +
              '<div class="kiosk-camera-placeholder__icon" aria-hidden="true">' +
                '<svg viewBox="0 0 32 32"><rect x="4" y="8" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m22 13 6-3v12l-6-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>' +
              '</div>' +
              '<div class="kiosk-camera-placeholder__title">Camera preview</div>' +
              '<div class="kiosk-camera-placeholder__copy">Allow access to check framing before the fair starts.</div>' +
              '<button type="button" class="primary-button" id="kioskCamEnable">Allow camera</button>' +
            '</div>' +
            '<div class="kiosk-camera-status" id="kioskCameraStatus" hidden>Live</div>' +
          '</div>' +
          '<div class="kiosk-camera-panel__footer">' +
            '<p class="kiosk-camera-hint">Preview only — recording stays on Capture</p>' +
            '<button type="button" class="primary-button kiosk-camera-open-capture" id="kioskOpenCapture" title="Open full Recruiter Capture">Open Capture</button>' +
          '</div>' +
        '</section>' +
      '</div>' +

      '<div class="kiosk-qr-panel" id="kioskQrPanel">' +
        '<button type="button" class="kiosk-info-btn kiosk-info-btn--light" id="kioskEditQr" aria-label="Edit booth QR and intake settings" title="Edit booth QR &amp; intake settings">' + TIQ.views._kioskInfoIcon + '</button>' +
        '<div class="kiosk-qr-kicker">Booth QR Code &amp; Candidate Intake Config</div>' +
        '<div class="kiosk-qr-subtitle">Scan to Submit Profile</div>' +
        '<div class="kiosk-qr-container" id="kioskQrContainer">' +
          '<canvas id="kiosk-qr-canvas" width="360" height="360"></canvas>' +
        '</div>' +
        '<div class="kiosk-qr-label">Scan to Submit Profile</div>' +
        '<div class="kiosk-qr-hint">Point your phone camera at the code above</div>' +
        '<div class="kiosk-qr-actions">' +
          '<button class="secondary-button kiosk-action-btn" id="kioskPrintPoster">' +
            '<svg viewBox="0 0 24 24" class="button-icon" aria-hidden="true"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
            'Print Poster' +
          '</button>' +
          '<button class="primary-button kiosk-action-btn" id="kioskCopyLink">' +
            '<svg viewBox="0 0 24 24" class="button-icon" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
            'Copy QR Link' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
};

TIQ.views.initKioskForm = function() {
  var printBtn = document.getElementById("kioskPrintPoster");
  var copyBtn = document.getElementById("kioskCopyLink");
  var editEventBtn = document.getElementById("kioskEditEvent");
  var editQrBtn = document.getElementById("kioskEditQr");

  var renderQR = function() {
    var url = TIQ.views._kioskFormUrl || "https://forms.gle/jbh-tech-fair-2026";
    var canvas = document.getElementById("kiosk-qr-canvas");
    if (!canvas) return;
    TIQ.qr.renderTo(url, canvas, { margin: 2 });
  };
  TIQ.views._kioskRenderQR = renderQR;

  renderQR();

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

  TIQ.views._initKioskCamera();
};

TIQ.views._stopKioskCamera = function() {
  if (TIQ.views._kioskFullscreenHandler) {
    document.removeEventListener("fullscreenchange", TIQ.views._kioskFullscreenHandler);
    document.removeEventListener("webkitfullscreenchange", TIQ.views._kioskFullscreenHandler);
    TIQ.views._kioskFullscreenHandler = null;
  }
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
  } catch (_) {}
  var video = document.getElementById("kioskCameraPreview");
  if (video) {
    try { video.srcObject = null; } catch (_) {}
  }
  if (TIQ.views._kioskCamera) {
    try {
      if (TIQ.views._kioskCamera.cancel) TIQ.views._kioskCamera.cancel();
      else if (TIQ.views._kioskCamera.stream) {
        TIQ.views._kioskCamera.stream.getTracks().forEach(function(t) { try { t.stop(); } catch (e) {} });
      }
    } catch (_) {}
    TIQ.views._kioskCamera = null;
  }
};

TIQ.views._initKioskCamera = function() {
  var panel = document.getElementById("kioskCameraPanel");
  var stage = document.getElementById("kioskCameraStage");
  var video = document.getElementById("kioskCameraPreview");
  var placeholder = document.getElementById("kioskCameraPlaceholder");
  var status = document.getElementById("kioskCameraStatus");
  var enableBtn = document.getElementById("kioskCamEnable");
  var flipBtn = document.getElementById("kioskCamFlip");
  var fullBtn = document.getElementById("kioskCamFullscreen");
  var openCapture = document.getElementById("kioskOpenCapture");
  if (!panel || !video) return;

  TIQ.views._stopKioskCamera();

  function setLive(on) {
    if (placeholder) placeholder.hidden = !!on;
    if (status) status.hidden = !on;
    if (flipBtn) flipBtn.disabled = !on;
    panel.classList.toggle("is-live", !!on);
  }

  function attachStream(stream) {
    video.srcObject = stream;
    video.muted = true;
    var play = video.play();
    if (play && play.catch) play.catch(function() {});
    setLive(true);
  }

  function startCamera() {
    if (!TIQ.VideoRecorder) {
      TIQ.showToast("Camera unavailable in this build.");
      return;
    }
    if (!TIQ.views._kioskCamera) TIQ.views._kioskCamera = new TIQ.VideoRecorder();
    var cam = TIQ.views._kioskCamera;
    cam.facingMode = cam.facingMode || "user";
    if (placeholder) {
      var copy = placeholder.querySelector(".kiosk-camera-placeholder__copy");
      if (copy) copy.textContent = "Starting camera…";
    }
    cam.openCamera({ facingMode: cam.facingMode, audio: false }).then(function(stream) {
      attachStream(stream);
    }).catch(function(err) {
      setLive(false);
      var msg = (err && err.message) ? err.message : "Camera permission denied.";
      if (placeholder) {
        var copy = placeholder.querySelector(".kiosk-camera-placeholder__copy");
        if (copy) copy.textContent = msg;
      }
      TIQ.showToast(msg);
    });
  }

  if (enableBtn) enableBtn.addEventListener("click", startCamera);

  if (flipBtn) {
    flipBtn.addEventListener("click", function() {
      var cam = TIQ.views._kioskCamera;
      if (!cam) return;
      flipBtn.disabled = true;
      cam.facingMode = cam.facingMode === "environment" ? "user" : "environment";
      cam.openCamera({ facingMode: cam.facingMode, audio: false }).then(function(stream) {
        attachStream(stream);
      }).catch(function(err) {
        TIQ.showToast((err && err.message) || "Could not flip camera.");
      }).then(function() {
        flipBtn.disabled = false;
      });
    });
  }

  function isFs() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function syncFsUi() {
    panel.classList.toggle("is-fullscreen", isFs());
    if (fullBtn) {
      fullBtn.setAttribute("aria-label", isFs() ? "Exit fullscreen" : "Fullscreen camera");
      fullBtn.title = isFs() ? "Exit fullscreen" : "Fullscreen";
    }
  }

  TIQ.views._kioskFullscreenHandler = syncFsUi;
  document.addEventListener("fullscreenchange", syncFsUi);
  document.addEventListener("webkitfullscreenchange", syncFsUi);

  if (fullBtn) {
    fullBtn.addEventListener("click", function() {
      var target = stage || panel;
      if (isFs()) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        return;
      }
      var req = target.requestFullscreen || target.webkitRequestFullscreen;
      if (!req) {
        TIQ.showToast("Fullscreen is not supported in this browser.");
        return;
      }
      Promise.resolve(req.call(target)).catch(function() {
        TIQ.showToast("Could not enter fullscreen.");
      });
    });
  }

  if (openCapture) {
    openCapture.addEventListener("click", function() {
      TIQ.router.navigateTo("recruiter-capture");
    });
  }

  // Auto-start preview when permission was previously granted
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    startCamera();
  }
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
TIQ.views._captureRecorder = null;
TIQ.views._swipeState = null;
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

/* Best available display name: form values → parsed contact → derived from
   the resume filename → null (caller renders a muted "Name not captured"). */
TIQ.views._displayName = function(c) {
  var direct = ((c.firstName || "") + " " + (c.lastName || "")).replace(/\s+/g, " ").trim();
  if (direct) return direct;
  var contactName = c.parsedResume && c.parsedResume.contact && c.parsedResume.contact.name;
  if (contactName && contactName.trim()) return contactName.trim();
  var info = TIQ.resumeInfo(c);
  if (info.name) {
    var base = String(info.name).replace(/\.[a-z0-9]+$/i, "").replace(/_/g, " ");
    base = base.split(/\s+[-\u2013\u2014]\s+/)[0];
    base = base.replace(/\bresume\b/gi, " ").replace(/\b20\d\d\b/g, " ")
      .replace(/\(\s*\d*\s*\)/g, " ").replace(/\s+/g, " ").trim();
    if (base.length >= 3 && base.length <= 60 && !/@/.test(base) &&
        !/^(resume|cv|template|untitled|document|file)$/i.test(base)) {
      if (base === base.toUpperCase()) {
        base = base.split(" ").map(function(w) {
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }).join(" ");
      }
      return base;
    }
  }
  return "";
};

TIQ.views._resumeTally = function(c, parsed) {
  var bits = [];
  if (parsed.skills && parsed.skills.length) bits.push(parsed.skills.length + " skills");
  if (parsed.experience && parsed.experience.length) bits.push(parsed.experience.length + " role" + (parsed.experience.length === 1 ? "" : "s"));
  if (parsed.certifications && parsed.certifications.length) bits.push(parsed.certifications.length + " cert" + (parsed.certifications.length === 1 ? "" : "s"));
  if (parsed.projects && parsed.projects.length) bits.push(parsed.projects.length + " project" + (parsed.projects.length === 1 ? "" : "s"));
  if (c.gpa) bits.push("GPA " + c.gpa);
  return bits.join(" \u00B7 ");
};

TIQ.views._resumeBarHtml = function(c) {
  var info = TIQ.resumeInfo(c);
  var parsed = c.parsedResume || null;
  var state = parsed ? "scanned" : info.state;
  var scanBtn = '<button type="button" class="resume-bar__action" data-open-resume>Scan &#9656;</button>';

  /* No resume on file: the card renders no bar at all rather than a nagging
     empty-state block — the header carries the card from here. */
  if (state === "missing") return "";

  var dotMod = state === "scanned" ? " is-ok" : (state === "failed" ? " is-bad" : " is-warn");
  var stateLabel = state === "scanned" ? "SCANNED"
    : state === "failed" ? "SCAN FAILED"
    : state === "legacy" ? "ON FILE" : (state === "pending" ? "PARSING..." : "NOT SCANNED");
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
    var shown = items.slice(0, 3);
    var hidden = items.slice(3);
    var pills = shown.map(function(s) {
      return '<span class="skill-pill">' + TIQ.escapeHtml(s) + '</span>';
    }).join("");
    if (hidden.length) pills += skillMoreChip(hidden, group.label.toLowerCase());
    return '<div class="skill-group-row">' +
      '<div class="skill-group__label">' + TIQ.escapeHtml(group.label) + '</div>' +
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

/* Grounded highlights — claim-first so a recruiter can scan in ~5 seconds.
   Skip empty "context not available" placeholders; show role/time only when real. */
TIQ.views.renderAccomplishments = function(c) {
  var accs = (c.accomplishments && c.accomplishments.length)
    ? c.accomplishments
    : (TIQ.generateAccomplishments ? TIQ.generateAccomplishments(c) : []);
  if ((!accs || !accs.length) && TIQ.generateAccomplishments) {
    accs = TIQ.generateAccomplishments(c) || [];
  }

  function entry(a) {
    if (!a || !a.text) return "";
    var source = a.source || "conversation";
    var icon = TIQ.views._highlightSourceIcon
      ? TIQ.views._highlightSourceIcon(source)
      : (source === "resume" ? "📄" : "💬");
    var claimHtml = TIQ.views._formatHighlightText
      ? TIQ.views._formatHighlightText(a.text)
      : TIQ.escapeHtml(a.text);
    var contextBits = [];
    if (a.contextLabel && String(a.contextLabel).trim()) contextBits.push(String(a.contextLabel).trim());
    if (a.contextDetail && String(a.contextDetail).trim()) contextBits.push(String(a.contextDetail).trim());
    var facet = a.facet && String(a.facet).trim() && String(a.facet).toLowerCase() !== "recorded statement"
      ? String(a.facet).trim()
      : "";
    var meta = [];
    if (facet) meta.push('<span class="highlight-facet">' + TIQ.escapeHtml(facet) + '</span>');
    if (contextBits.length) {
      meta.push('<span class="highlight-context">' + TIQ.escapeHtml(contextBits.join(" · ")) + '</span>');
    }
    return '<article class="highlight-item">' +
      (meta.length ? '<div class="highlight-meta">' + meta.join("") + '</div>' : '') +
      '<p class="highlight-claim">' + claimHtml + '</p>' +
      '<span class="source-tag source-tag--' + TIQ.escapeAttr(source) + '">' +
        '<span class="source-tag__icon" aria-hidden="true">' + icon + '</span>' +
        'source: ' + TIQ.escapeHtml(source) +
      '</span>' +
    '</article>';
  }

  var items = (accs || []).filter(function(a) { return a && a.text; }).slice(0, 3).map(entry).join("");
  return '<section class="accomplishments">' +
    '<h3 class="highlights-title">Grounded AI Highlights</h3>' +
    (items
      ? items
      : '<p class="highlight-empty">No grounded highlights yet — scan a resume or capture a note.</p>') +
  '</section>';
};

TIQ.views._quickFactsHtml = function(c) {
  var auth = c.workAuthorization || "";
  var loc = (c.workLocations && c.workLocations.length) ? c.workLocations[0] : "";
  if (Array.isArray(loc)) loc = loc[0] || "";
  var role = c.function || c.desiredRole || "";
  var facts = [
    { label: "Auth", value: auth, missing: !auth },
    { label: "Location", value: loc, missing: !loc },
    { label: "Role", value: role, missing: !role }
  ];
  return '<div class="card-quick-facts" aria-label="Booth quick facts">' +
    facts.map(function(f) {
      return '<div class="card-quick-fact' + (f.missing ? ' is-missing' : '') + '">' +
        '<span class="card-quick-fact__label">' + TIQ.escapeHtml(f.label) + '</span>' +
        '<span class="card-quick-fact__value">' + TIQ.escapeHtml(f.value || "Ask") + '</span>' +
      '</div>';
    }).join("") +
  '</div>';
};

TIQ.views._buildCardHtml = function(c, isFront) {
  var flags = TIQ.getMissingFlags(c);
  var seen = (c.cameraSession && Array.isArray(c.cameraSession.seenWith)) ? c.cameraSession.seenWith : [];

  var gradDate = TIQ.formatMonthYear
    ? TIQ.formatMonthYear(c.graduationDate || "")
    : (c.graduationDate || "");
  var gpa = c.gpa;
  var gpaNum = parseFloat(gpa);
  var gpaOk = !isNaN(gpaNum) && gpaNum > 0;
  var gpaDot = (gpaOk && TIQ.fieldSource(c, "gpa") === "resume")
    ? '<span class="prov-dot prov-dot--resume" title="Extracted from the scanned PDF"></span>'
    : "";

  var display = (TIQ.views._displayName ? TIQ.views._displayName(c) : "") ||
    ((c.firstName || "") + " " + (c.lastName || "")).trim();
  var nameHtml = display
    ? '<h2 class="candidate-name">' + TIQ.escapeHtml(display) + '</h2>'
    : '<h2 class="candidate-name candidate-name--missing">Name not captured</h2>';

  var university = c.university || "";
  var major = c.major || "";
  var schoolBits = [university, major].filter(function(v) { return v && String(v).trim(); });
  var gradBits = [];
  if (gradDate) gradBits.push(gradDate);
  if (gpaOk) gradBits.push("GPA " + gpa);

  var headerHtml = '<div class="card-header">' +
    '<div class="avatar-box">' + TIQ.initialsFor(c) + '</div>' +
    '<div class="header-details">' +
      '<div class="name-row">' + nameHtml + '</div>' +
      (schoolBits.length
        ? '<p class="university">' + schoolBits.map(function(v) { return TIQ.escapeHtml(v); }).join(" &middot; ") + '</p>'
        : '') +
      (gradBits.length
        ? '<p class="major-grad">' + gradBits.map(function(v) { return TIQ.escapeHtml(v); }).join(" &middot; ") + gpaDot + '</p>'
        : '') +
    '</div>' +
  '</div>';

  var seenHtml = seen.length
    ? '<div class="capture-card__seen"><span class="capture-card__seen-label">On camera</span>' +
      seen.slice(0, 4).map(function(n) { return '<span class="capture-card__seen-chip">' + TIQ.escapeHtml(n) + '</span>'; }).join("") +
      '</div>'
    : "";

  var resumeBarHtml = TIQ.views._resumeBarHtml(c);
  var quickFactsHtml = TIQ.views._quickFactsHtml(c);
  var skillsHtml = TIQ.views._skillsBlockHtml(c);

  /* Regenerate empty/stale accomplishments from resume artefacts — never dump
     the free-text summary as filler (card carries grounded claims only). */
  if (!c.accomplishments || !c.accomplishments.length) {
    c.accomplishments = TIQ.generateAccomplishments ? TIQ.generateAccomplishments(c) : [];
  }
  var convInner = TIQ.views.renderAccomplishments(c);

  if (isFront) {
    convInner +=
      '<div class="voice-memo-widget">' +
        '<span class="record-indicator"></span>' +
        '<div class="voice-meta">' +
          '<span class="voice-label">Voice Memo</span>' +
          '<span class="voice-timer" id="audioTimer">00:00</span>' +
        '</div>' +
        '<div class="waveform">' + TIQ.views._waveformBars(24) + '</div>' +
        '<button type="button" id="audioRecordBtn" class="voice-btn btn-toggle" title="Start recording" aria-label="Start or stop recording" aria-pressed="false">&#9679;</button>' +
      '</div>' +
      '<div id="liveTranscriptPreview" class="live-transcript-preview" style="display:none">' +
        '<span class="live-transcript-dot"></span><span class="live-transcript-text"></span>' +
      '</div>';
  }

  var convBandHtml = '<section class="conversation-band">' + convInner + '</section>';

  var alertHtml = "";
  if (flags.length) {
    var shownFlags = flags.slice(0, 3);
    var moreFlags = flags.length - shownFlags.length;
    alertHtml = '<details class="alert-banner" data-flag-key="' + TIQ.escapeAttr(shownFlags[0].key) + '">' +
      '<summary class="alert-banner__summary">&#9888;&#65039; ' +
        shownFlags.map(function(f) { return TIQ.escapeHtml(f.label); }).join(" &bull; ") +
        (moreFlags > 0 ? " &bull; +" + moreFlags + " more" : "") +
      '</summary>' +
      '<div class="alert-banner__body">' +
        flags.map(function(f) {
          return '<div class="alert-banner__item">' + TIQ.escapeHtml(f.label) + '</div>';
        }).join("") +
      '</div>' +
    '</details>';
  }

  return '<div class="card-scroll">' +
    resumeBarHtml +
    headerHtml +
    quickFactsHtml +
    skillsHtml +
    seenHtml +
    convBandHtml +
    alertHtml +
  '</div>';
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

TIQ.views.renderRecruiterCapture = function() {
  var cands = TIQ.state.candidates;
  if (!cands.length) return '<div class="view" id="view-capture"><div class="view-header"><span class="section-kicker">Live Capture</span><h1>No candidates to capture</h1></div><div class="capture-empty"><p>No candidates in the system yet.</p><button class="primary-button" id="captureGenerateDemo">Generate Demo Candidates</button><button class="secondary-button" id="captureImportEmpty">Import Resumes (PDF)</button><button class="secondary-button" id="captureNewCandidateEmpty">Add Candidate Manually</button><input type="file" id="captureImportEmptyInput" accept=".pdf,application/pdf" multiple style="display:none"></div></div>';

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

  var stackHtml = '<div class="capture-stack">';
  var stackSize = Math.min(3, cands.length - idx);
  for (var s = stackSize - 1; s >= 0; s--) {
    var sc = cands[idx + s];
    stackHtml += '<div class="capture-card candidate-card capture-card--' + s + '" data-stack="' + s + '">' +
      TIQ.views._buildCardHtml(sc, s === 0) +
      (s === 0 ? '<div class="capture-overlay capture-overlay--left"><span class="capture-overlay__label">REVIEWED</span></div>' +
        '<div class="capture-overlay capture-overlay--right"><span class="capture-overlay__label">CONTACT</span></div>' +
        '<div class="capture-card__swipe-hint">Swipe left = Reviewed &nbsp;|&nbsp; Swipe right = Contact</div>' : '') +
    '</div>';
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

  var resumeBandHtml = TIQ.views._resumeBandHtml(sel);

  var drawerHtml = '<div class="capture-panel capture-panel--drawer">' +
    '<div class="drawer-tabs" role="tablist" aria-label="Candidate details">' +
      '<button type="button" class="drawer-tab is-active" role="tab" data-drawer-tab="resume" aria-selected="true">Resume</button>' +
      '<button type="button" class="drawer-tab" role="tab" data-drawer-tab="voice" aria-selected="false">Voice</button>' +
      '<button type="button" class="drawer-tab" role="tab" data-drawer-tab="notes" aria-selected="false">Notes</button>' +
    '</div>' +
    '<div class="drawer-panel is-active" data-drawer-panel="resume">' +
      TIQ.views._renderDrawerResume(sel) +
    '</div>' +
    '<div class="drawer-panel" data-drawer-panel="voice">' +
      '<div class="capture-section-title">Recordings</div>' +
      '<div id="audioRecordings" class="audio-recordings">' + recordingsHtml + '</div>' +
    '</div>' +
    '<div class="drawer-panel" data-drawer-panel="notes">' +
      '<div class="capture-section-title">Recruiter Notes</div>' +
      '<textarea id="captureNotes" class="capture-textarea capture-textarea--inline" rows="6" placeholder="Add notes about this candidate...">' + TIQ.escapeHtml(sel.notes) + '</textarea>' +
    '</div>' +
  '</div>';

  return '<div class="view app-view-container view-capture--deck" id="view-capture">' +
    '<div class="capture-layout">' +
      '<section class="capture-workspace">' +
'<div class="capture-col-left">' +
            '<div class="capture-stack-shell">' +
              stackHtml +
            '</div>' +
            '<div class="capture-triage capture-triage--tinder">' +
              '<button class="capture-triage-btn capture-triage--review" id="captureReview" title="Mark as Reviewed (swipe left)">' +
                '<span class="capture-triage-label">Reviewed</span>' +
              '</button>' +
              '<button class="capture-triage-btn capture-triage--follow" id="captureFollow" title="Follow Up (swipe right)">' +
                '<span class="capture-triage-label">Contact</span>' +
              '</button>' +
              '<button class="capture-triage-btn capture-triage--booth" id="captureOpenBoothRec" title="Open booth video recording">' +
                '<span class="capture-triage-label">Record</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '<aside class="capture-col-right">' +
          resumeBandHtml +
          drawerHtml +
        '</aside>' +
      '</section>' +

    '</div>' +
  '</div>' +
  TIQ.views._newCandidateModalHtml();
};

TIQ.views.renderCapture = function() {
  return TIQ.views.renderRecruiterCapture();
};

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
        '<button class="secondary-button" id="captureBackToOverview">Back to Analytics</button>' +
        '<button class="secondary-button" id="captureGenerateDemo">Generate Demo Candidates</button>' +
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

  container.addEventListener("click", function(e) {
    var skipBtn = e.target.closest("#captureSkip");
    var reviewBtn = e.target.closest("#captureReview");
    var followBtn = e.target.closest("#captureFollow");
    var deleteBtn = e.target.closest(".audio-delete-btn");
    var startOverBtn = e.target.closest("#captureStartOver");
    var backBtn = e.target.closest("#captureBackToOverview");
    var categoryBtn = e.target.closest(".capture-complete__card-btn");
    var previewBtn = e.target.closest(".preview-btn");

    if (skipBtn) {
      TIQ.views._undoLastCaptureAction();
    } else if (reviewBtn) {
      TIQ.views._animateSwipeOut("left");
    } else if (followBtn) {
      TIQ.views._animateSwipeOut("right");
    } else if (e.target.closest("#captureOpenBoothRec")) {
      TIQ.router.navigateTo("booth-record");
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
      });
      this.querySelectorAll('[data-drawer-panel]').forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-drawer-panel') === name);
      });
      return;
    }
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
        if (!newC.degreeProgram) newC.degreeProgram = TIQ.CONFIG.defaultDegreeProgram;
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
                c.notes = (c.notes ? c.notes + "\n\n" : "") + "TL;DR: " + TIQ.generateTldr(c) + "\n\n" + TIQ.cleanTranscript(TIQ.correctProperNouns(text, c));
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
              applyTranscript(TIQ.cleanTranscript(TIQ.correctProperNouns(voskTranscript, c)));
            } else {
              setTranscript("Transcribing...");
              var offline = TIQ.OfflineTranscriber.isReady()
                ? Promise.resolve()
                : TIQ.OfflineTranscriber.init();
              offline.then(function() {
                return TIQ.OfflineTranscriber.transcribe(result.blob);
              }).then(function(text) {
                console.log("[TalentIQ] Vosk full transcription complete:", text);
                applyTranscript(text ? TIQ.cleanTranscript(TIQ.correctProperNouns(text, c)) : "");
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
  });

  var leftOvl = frontCard.querySelector(".capture-overlay--left");
  var rightOvl = frontCard.querySelector(".capture-overlay--right");
  if (direction === "left" && leftOvl) { leftOvl.style.transition = "opacity 750ms ease"; leftOvl.style.opacity = "1"; }
  else if (leftOvl) leftOvl.style.opacity = "0";
  if (direction === "right" && rightOvl) { rightOvl.style.transition = "opacity 750ms ease"; rightOvl.style.opacity = "1"; }
  else if (rightOvl) rightOvl.style.opacity = "0";

  var done = false;
  function onEnd() {
    if (done) return;
    done = true;
    frontCard.removeEventListener("transitionend", onEnd);
    TIQ.views._applySwipeAction(direction);
  }
  frontCard.addEventListener("transitionend", onEnd);
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
    TIQ.views._undoLastCaptureAction();
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
TIQ.views._aiReviewCompare = [];
TIQ.views._aiReviewSearch = "";
TIQ.views._aiReviewStatus = "all";
TIQ.views._aiReviewFunc = "all";
TIQ.views._aiReviewPriority = "all";

TIQ.views.renderAIReview = function() {
  var filtered = TIQ.views._getFilteredCandidates();
  var sel = TIQ.views._aiReviewSelected || (filtered.length ? filtered[0].id : "");
  var selCandidate = filtered.find(function(c) { return c.id === sel; }) || filtered[0] || null;

  var listHtml = filtered.map(function(c) {
    var flags = TIQ.getMissingFlags(c);
    var sc = TIQ.statusClassMap[c.recordStatus] || "status-new";
    var checked = TIQ.views._aiReviewCompare.indexOf(c.id) >= 0;
    return '<div class="ai-list-item' + (c.id === sel ? " ai-list-item--selected" : "") + '" data-id="' + c.id + '">' +
      '<label class="compare-check"><input type="checkbox" ' + (checked ? "checked" : "") + ' aria-label="Compare" /></label>' +
      '<div class="ai-list-item__info">' +
        '<div class="ai-list-item__name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</div>' +
        '<div class="ai-list-item__meta">' + TIQ.escapeHtml(c.university) + ' &bull; ' + TIQ.escapeHtml(c.major) + '</div>' +
      '</div>' +
      '<span class="status-chip ' + sc + '">' + TIQ.escapeHtml(c.recordStatus) + '</span>' +
      (flags.length ? '<span class="flag-count">' + flags.length + '</span>' : '<span class="flag-count flag-count--ok">0</span>') +
    '</div>';
  }).join("");

  var detailHtml = selCandidate ? TIQ.views._renderDetailPanel(selCandidate) :
    '<div class="ai-detail-empty">Select a candidate to view details.</div>';

  return '<div class="view" id="view-ai-review">' +
    '<div class="view-header"><span class="section-kicker">Decision Hub</span></div>' +
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

TIQ.views._getFilteredCandidates = function() {
  var s = TIQ.views._aiReviewSearch.toLowerCase();
  return TIQ.state.candidates.filter(function(c) {
    var matchSearch = !s || [c.firstName, c.lastName, c.major, c.function, c.university, (c.skills || []).join(" "), c.notes, (c.areasDiscussed || []).join(" "), TIQ.getMissingFlags(c).map(function(f) { return f.label; }).join(" ")].some(function(v) { return String(v).toLowerCase().indexOf(s) >= 0; });
    var matchStatus = TIQ.views._aiReviewStatus === "all" || c.recordStatus === TIQ.views._aiReviewStatus;
    var matchFunc = TIQ.views._aiReviewFunc === "all" || c.function === TIQ.views._aiReviewFunc;
    var matchPri = TIQ.views._aiReviewPriority === "all" || c.priority === TIQ.views._aiReviewPriority;
    return matchSearch && matchStatus && matchFunc && matchPri;
  });
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
    : state === "legacy" ? "ON FILE, NOT SCANNED"
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

TIQ.views._renderDetailPanel = function(c) {
  if (!c.summary && TIQ.ai && TIQ.ai.generateSummary) {
    TIQ.ai.updateCandidateSummary(c);
  }
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

  var audioHtml = "";
  if (c.audioNotes && c.audioNotes.length) {
    audioHtml = '<section class="ai-section"><div class="section-title"><span class="section-kicker">Voice Notes</span></div>' +
      c.audioNotes.map(function(a, i) { return '<div class="audio-player-row"><span class="audio-label">Recording ' + (i+1) + ' (' + a.duration + 's)</span><audio controls class="audio-ctrl" data-audio-blob-id="' + TIQ.escapeAttr(a.blobId) + '"></audio></div>'; }).join("") + '</section>';
  }

  var transcriptHtml = '<section class="ai-section"><div class="section-title"><span class="section-kicker">Transcript</span></div>' + TIQ.renderTranscriptBlock(c) + '</section>';
  var citationHtml = '<section class="ai-section"><div class="section-title"><span class="section-kicker">Source Citations</span></div>' + TIQ.renderCitationList(c.traceability) + '</section>';

  var traceHtml = (c.traceability || []).map(function(item) {
    var claim = item.split("\u2014")[0].trim();
    return '<button type="button" class="trace-item trace-link" data-claim="' + TIQ.escapeAttr(claim) + '">' + TIQ.escapeHtml(item) + '</button>';
  }).join("");

  var summaryText = c.summary || "No summary generated. Upload a resume or complete fields to auto-generate.";

  return '<div class="ai-detail">' +
    '<div class="ai-detail__header">' +
      '<div class="capture-avatar">' + TIQ.initialsFor(c) + '</div>' +
      '<div><div class="ai-detail__name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</div>' +
      '<div class="ai-detail__id">' + TIQ.escapeHtml(c.id) + ' &bull; ' + TIQ.escapeHtml(c.university) + '</div>' +
      '<div class="ai-detail__prog">' + TIQ.escapeHtml(c.degreeProgram) + ' in ' + TIQ.escapeHtml(c.major) + '</div></div>' +
    '</div>' +
    '<div class="ai-detail__actions">' +
      '<button class="primary-button small-button" data-action="approve">Approve</button>' +
      '<button class="secondary-button small-button" data-action="follow">Follow Up</button>' +
      '<button class="secondary-button small-button" data-action="regen">Regenerate Summary</button>' +
    '</div>' +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">AI-Generated Snapshot</span></div><div class="snapshot-card"><p>' + TIQ.escapeHtml(summaryText) + '</p></div></section>' +
    TIQ.views._renderResumeSection(c) +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Missing Information Flags</span></div><div class="flag-list">' + flagsHtml + (aiMissingHtml ? '<div class="flag-list__ai">' + aiMissingHtml + '</div>' : '') + '</div></section>' +
    (traceHtml ? '<section class="ai-section"><div class="section-title"><span class="section-kicker">Source Traceability</span></div><div class="trace-list" id="aiTraceList">' + traceHtml + '</div></section>' : '') +
    citationHtml +
    audioHtml +
    transcriptHtml +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Recruiter Notes</span></div><textarea id="aiNotes" class="notes-card notes-textarea" rows="4">' + TIQ.escapeHtml(c.notes) + '</textarea></section>' +
    '<section class="ai-section"><div class="section-title row-title"><span class="section-kicker">Record Integrity</span></div><div class="integrity-panel" id="aiIntegrity"></div></section>' +
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

  TIQ.views._loadAudioBlobs();

  var rerender = function() {
    var existing = document.getElementById("view-ai-review");
    if (existing) existing.outerHTML = TIQ.views.renderAIReview();
    TIQ.views.initAIReviewEvents();
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
    detailPanel.addEventListener("click", function(e) {
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
        if (actionBtn.dataset.action === "approve") {
          if (!TIQ.state.activeRecruiterId) { TIQ.showToast("Select a recruiter first."); return; }
          c.recordStatus = "Reviewed"; c.approvalStatus = "Approved"; c.approverId = TIQ.state.activeRecruiterId; c.approvalTimestamp = TIQ.nowISO();
          TIQ.addAuditEntry(c, "APPROVED", "Approved via AI Review");
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
          TIQ.addAuditEntry(c, "SUMMARY_REGEN", "Summary regenerated from AI");
          TIQ.logMetric({ type: 'summary-regen', candidateId: c.id, recruiterId: TIQ.state.activeRecruiterId });
          TIQ.saveState(); TIQ.showToast("Summary regenerated."); rerender();
        }
      }
      if (e.target.closest('[data-toggle-raw]')) {
        TIQ.views._rawOpen[TIQ.views._aiReviewSelected] = !TIQ.views._rawOpen[TIQ.views._aiReviewSelected];
        rerender();
        return;
      }
      if (e.target.closest('[data-expand-roles]')) {
        var expRoleBtn = e.target.closest('[data-expand-roles]');
        var expRoleId = expRoleBtn.getAttribute('data-expand-roles');
        TIQ.views._resumeExpanded[expRoleId] = !TIQ.views._resumeExpanded[expRoleId];
        rerender();
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

    var notes = detailPanel.querySelector("#aiNotes");
    if (notes) {
      notes.addEventListener("change", function() {
        var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._aiReviewSelected; });
        if (c) {
          c.notes = notes.value;
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
        rerender();
      });
    });
  }

  var selCandidate = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._aiReviewSelected; });
  if (selCandidate) TIQ.views._renderAiIntegrity(selCandidate);

  var bar = document.getElementById("aiCompareBar");
  if (bar) {
    if (TIQ.views._aiReviewCompare.length >= 2) {
      bar.hidden = false;
      bar.classList.add("visible");
      bar.innerHTML = '<span class="compare-bar__count">' + TIQ.views._aiReviewCompare.length + ' candidates selected</span><button class="primary-button small-button" id="aiCompareOpen">Compare Selected</button><button class="secondary-button small-button" id="aiCompareClear">Clear</button>';
      document.getElementById("aiCompareOpen").addEventListener("click", function() { TIQ.views._openCompareModal(TIQ.views._aiReviewCompare); });
      document.getElementById("aiCompareClear").addEventListener("click", function() { TIQ.views._aiReviewCompare = []; rerender(); });
    } else {
      bar.hidden = true;
    }
  }
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
  TIQ.views._demoCandidates.forEach(function(demo) {
    var exists = TIQ.state.candidates.some(function(c) {
      return c.firstName === demo.firstName && c.lastName === demo.lastName;
    });
    if (exists) return;
    var id = "TQ-" + (2400 + TIQ.state.candidates.length + 1);
    var c = Object.assign({}, demo, {
      id: id,
      createdAt: TIQ.nowISO(),
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
      { label: "Avg Review Time", value: A.formatDuration(A.avgReviewSeconds(cands)), sub: "Per candidate review", modifier: "amber" },
      { label: "Data Completeness", value: A.dataCompleteness(cands) + "%", sub: "Across all records", modifier: "green" },
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
        '<div class="overview-card__head"><span class="chart-title">Per Recruiter Activity</span></div>' +
        '<table class="data-table">' +
          '<thead><tr><th>Recruiter</th><th>Actions</th><th>Approvals</th></tr></thead>' +
          '<tbody>' +
            A.perRecruiter(cands).map(function(r) {
              return '<tr><td>' + TIQ.escapeHtml(r.recruiterName) + '</td><td>' + r.actions + '</td><td>' + r.approvals + '</td></tr>';
            }).join("") +
          '</tbody>' +
        '</table>' +
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


/* ---- Grafted: Face enroll ---- */
TIQ.views._openFaceEnrollPanel = function(candidateId, onDone) {
  var host = document.getElementById("faceEnrollPanelHost");
  if (!host || !TIQ.face || !TIQ.face.enrollment) {
    TIQ.showToast("Face enrollment module not loaded.");
    return;
  }
  var c = TIQ.state.candidates.find(function(x) { return x.id === candidateId; });
  if (!c) return;
  TIQ.ensureFaceEnrollment(c);
  host.hidden = false;
  host.innerHTML = TIQ.face.enrollment.renderWizardHtml({
    candidateId: candidateId,
    mode: "panel",
    enrolled: !!(c.faceEnrollment && c.faceEnrollment.enrolled)
  });
  TIQ.face.enrollment.init({
    candidateId: candidateId,
    mode: "panel",
    onProgress: function() {
      var updated = TIQ.state.candidates.find(function(x) { return x.id === candidateId; });
      if (updated && updated.faceEnrollment && updated.faceEnrollment.enrolled && typeof onDone === "function") {
        if (TIQ.face && TIQ.face.enrollment) TIQ.face.enrollment.stopCamera();
        onDone();
      }
    }
  });
};

/* ============================================
   Recruiter Capture (recording)

   ============================================ */
TIQ.views._recCaptureIndex = 0;
TIQ.views._recCaptureRecorder = null;
TIQ.views._recSwipeState = null;

TIQ.views._buildRecordingCardHtml = function(c) {
  var flags = TIQ.getMissingFlags(c);
  var flagsHtml = flags.length
    ? flags.map(TIQ.formatFlagChip).join("")
    : '<span class="flag-chip flag-clear">[No Critical Missing Info]</span>';
  var seen = (c.cameraSession && Array.isArray(c.cameraSession.seenWith)) ? c.cameraSession.seenWith : [];
  var seenHtml = seen.length
    ? '<div class="capture-card__seen"><span class="capture-card__seen-label">On camera</span>' +
      seen.slice(0, 4).map(function(n) { return '<span class="capture-card__seen-chip">' + TIQ.escapeHtml(n) + '</span>'; }).join("") +
      '</div>'
    : '';

  var display = (TIQ.views._displayName ? TIQ.views._displayName(c) : "") ||
    ((c.firstName || "") + " " + (c.lastName || "")).trim();
  var university = c.university || "";
  var major = c.major || "";
  var grad = TIQ.formatMonthYear
    ? TIQ.formatMonthYear(c.graduationDate || "")
    : (c.graduationDate || "");
  var gpa = c.gpa;
  var gpaNum = parseFloat(gpa);
  var gpaOk = !isNaN(gpaNum) && gpaNum > 0;

  // GitHub Candidate Cards pattern: name, then description lines below
  var schoolBits = [university, major].filter(function(v) { return v && String(v).trim(); });
  var gradBits = [];
  if (grad) gradBits.push(grad);
  if (gpaOk) gradBits.push("GPA " + gpa);

  var description = "";
  if (c.summary && String(c.summary).trim()) {
    description = String(c.summary).trim();
  } else if (c.notes && String(c.notes).trim()) {
    description = String(c.notes).trim();
  } else if (c.accomplishments && c.accomplishments.length && c.accomplishments[0].text) {
    description = c.accomplishments[0].text;
  }
  if (description.length > 160) description = description.slice(0, 157) + "...";

  var skills = (c.skills && c.skills.length) ? c.skills.slice(0, 5) : [];

  var nameHtml = display
    ? '<h3 class="candidate-name">' + TIQ.escapeHtml(display) + '</h3>'
    : '<h3 class="candidate-name candidate-name--missing">Name not captured</h3>';

  return '<div class="card-scroll capture-card__github">' +
    '<div class="card-header">' +
      '<div class="avatar-box">' + TIQ.initialsFor(c) + '</div>' +
      '<div class="header-details">' +
        '<div class="name-row">' + nameHtml +
          '<span class="status-chip ' + (TIQ.statusClassMap[c.recordStatus] || "status-new") + '">' +
            TIQ.escapeHtml(c.recordStatus || "New") +
          '</span>' +
        '</div>' +
        (schoolBits.length
          ? '<p class="university">' + schoolBits.map(function(v) { return TIQ.escapeHtml(v); }).join(" &middot; ") + '</p>'
          : '') +
        (gradBits.length
          ? '<p class="major-grad">' + gradBits.map(function(v) { return TIQ.escapeHtml(v); }).join(" &middot; ") + '</p>'
          : '') +
        (description
          ? '<p class="capture-card__description">' + TIQ.escapeHtml(description) + '</p>'
          : '') +
      '</div>' +
    '</div>' +
    (skills.length
      ? '<div class="capture-card__skills">' + skills.map(function(s) {
          return '<span>' + TIQ.escapeHtml(s) + '</span>';
        }).join("") + '</div>'
      : '') +
    seenHtml +
    '<div class="capture-card__flags">' + flagsHtml + '</div>' +
  '</div>';
};
TIQ.views.renderRecordingCapture = function() {
  var cands = TIQ.state.candidates;
  if (!cands.length) return '<div class="view" id="view-recruiter-capture"><div class="view-header"><h1>No candidates to capture</h1></div></div>';

  var idx = TIQ.views._recCaptureIndex;
  if (idx >= cands.length) {
    return TIQ.views._renderRecordingCaptureComplete(cands);
  }

  var c = cands[idx];

  var recruiterName = TIQ.recruiterName(TIQ.state.activeRecruiterId) || "Not selected";

  var stackHtml = '<div class="capture-stack">';
  var stackSize = Math.min(3, cands.length - idx);
  for (var s = stackSize - 1; s >= 0; s--) {
    var sc = cands[idx + s];
    stackHtml += '<div class="capture-card capture-card--' + s + '" data-stack="' + s + '">' +
      TIQ.views._buildRecordingCardHtml(sc) +
      (s === 0 ? '<div class="capture-overlay capture-overlay--left"><span class="capture-overlay__label">REVIEWED</span></div>' +
       '<div class="capture-overlay capture-overlay--right"><span class="capture-overlay__label">CONTACT</span></div>' +
       '<div class="capture-card__swipe-hint">Swipe left = Reviewed &nbsp;|&nbsp; Swipe right = Contact</div>' : '') +
    '</div>';
  }
  stackHtml += '</div>';

  var audioHtml = "";
  if (c.audioNotes && c.audioNotes.length) {
    audioHtml = c.audioNotes.map(function(a, i) {
      return '<div class="audio-player-row"><span class="audio-label">Recording ' + (i + 1) + ' (' + a.duration + 's)</span><audio controls src="' + a.blobUrl + '" class="audio-ctrl"></audio><button class="audio-delete-btn" data-audio-index="' + i + '" aria-label="Delete recording">✕</button></div>';
    }).join("");
  }

  var atEnd = idx >= cands.length - 1;
  var candName = TIQ.escapeHtml(c.firstName + " " + c.lastName);
  var previousRecording = (TIQ.state.recordings || []).filter(function(r) { return r.candidateId === c.id; }).slice(-1)[0];
  var previousRecordingHtml = previousRecording
    ? '<button type="button" class="recording-screen__thumbnail" id="previousRecordingBtn" aria-label="Previous recording, ' + Number(previousRecording.duration || 0) + ' seconds">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6.5v11l9-5.5z" fill="currentColor"/></svg>' +
        '<span>' + String(Math.floor(Number(previousRecording.duration || 0) / 60)).padStart(2, "0") + ':' + String(Number(previousRecording.duration || 0) % 60).padStart(2, "0") + '</span>' +
      '</button>'
    : '<span class="recording-screen__control-spacer" aria-hidden="true"></span>';
  var participantOptions = cands.filter(function(person) { return person.id !== c.id; }).map(function(person) {
    return '<option value="' + TIQ.escapeAttr(person.id) + '">' + TIQ.escapeHtml(person.firstName + ' ' + person.lastName) + '</option>';
  }).join("");

  return '<div class="view" id="view-recruiter-capture">' +
    '<div class="capture-header">' +
      '<div><span class="section-kicker">Live Capture</span><h1>Recruiter Capture</h1></div>' +
      '<div class="capture-meta"><span class="capture-counter">Card ' + (idx + 1) + ' of ' + cands.length + '</span>' +
      '<span class="capture-recruiter">' + TIQ.escapeHtml(recruiterName) + '</span></div>' +
    '</div>' +
    '<section class="recording-screen" id="captureVideoPanel" data-rec-state="requesting" role="dialog" aria-modal="true" aria-label="Record conversation with ' + TIQ.escapeAttr(c.firstName + ' ' + c.lastName) + '">' +
      '<video id="captureVideoPreview" class="recording-screen__preview" playsinline muted autoplay></video>' +
      '<div class="recording-face-overlay" id="recordingFaceOverlay" aria-live="polite"></div>' +
      '<div class="recording-screen__shade recording-screen__shade--top" aria-hidden="true"></div>' +
      '<div class="recording-screen__shade recording-screen__shade--bottom" aria-hidden="true"></div>' +
      '<div class="recording-name-panel" id="recordingNamePanel" hidden>' +
        '<button type="button" class="recording-name-panel__backdrop" data-name-close aria-label="Close"></button>' +
        '<div class="recording-name-panel__sheet" role="dialog" aria-modal="true" aria-labelledby="recordingNameTitle">' +
          '<div class="recording-name-panel__header"><div><small>Person</small><h2 id="recordingNameTitle">Find or add name</h2></div>' +
            '<button type="button" class="recording-people__close" data-name-close aria-label="Close">&times;</button></div>' +
          '<p id="recordingNameHint">Type to search. Pick a match from the list, or add a new name if they are not in the database.</p>' +
          '<div class="recording-name-combo">' +
            '<input id="recordingNameInput" class="recording-name-combo__input" type="text" maxlength="60" placeholder="Search names…" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="recordingNameResults" aria-haspopup="listbox">' +
            '<div id="recordingNameResults" class="recording-name-combo__dropdown" role="listbox" aria-label="Name matches"></div>' +
          '</div>' +
          '<button type="button" class="recording-name-panel__cancel secondary-button" data-name-close>Cancel</button>' +
        '</div>' +
      '</div>' +
      '<div class="recording-screen__permission" id="captureVideoPlaceholder">' +
        '<div class="recording-screen__permission-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><rect x="4" y="8" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m22 13 6-3v12l-6-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></div>' +
        '<div class="recording-screen__permission-title" id="cameraPermissionTitle">Camera &amp; microphone</div>' +
        '<div class="recording-screen__permission-copy" id="cameraPermissionCopy">Allow access to record this conversation.</div>' +
        '<button type="button" id="videoOpenCamBtn" class="recording-screen__retry">Allow access</button>' +
      '</div>' +
      '<div class="recording-screen__topbar">' +
        '<button type="button" id="recordingCloseBtn" class="recording-screen__icon-btn" aria-label="Close recorder"><span aria-hidden="true">&times;</span></button>' +
        '<div class="recording-screen__status" id="recordingStatus" role="status" aria-live="polite"><span class="recording-screen__status-dot" id="recordingStatusDot" hidden></span><span id="videoTimer">Ready</span></div>' +
        '<button type="button" id="videoFlipBtn" class="recording-screen__icon-btn" aria-label="Switch camera" disabled>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7h-3l-1.4-2H8.4L7 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 12a3.5 3.5 0 0 1 6-2.4M15 12a3.5 3.5 0 0 1-6 2.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m14.8 7.9.2 2.1-2.1-.1M9.2 16.1 9 14l2.1.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="recording-screen__identity">' +
        '<span class="recording-booth-count" id="recordingBoothCount" aria-live="polite">0 in booth</span>' +
        '<span>' + candName + '</span><small>' + TIQ.escapeHtml(c.id) + '</small>' +
        '<button type="button" id="recordingIdentifyBtn" class="recording-screen__people-btn" aria-haspopup="dialog">Identify</button>' +
        '<button type="button" id="recordingPeopleBtn" class="recording-screen__people-btn" aria-haspopup="dialog">1 person</button>' +
      '</div>' +
      '<div class="recording-screen__processing" id="captureVideoProcessing" hidden>' +
        '<div class="recording-screen__spinner" aria-hidden="true"></div>' +
        '<div id="captureProcessingLabel">Saving recording…</div>' +
      '</div>' +
      '<div class="recording-people" id="recordingPeoplePanel" hidden>' +
        '<button type="button" class="recording-people__backdrop" data-people-close aria-label="Close people panel"></button>' +
        '<div class="recording-people__sheet" role="dialog" aria-modal="true" aria-labelledby="recordingPeopleTitle">' +
          '<div class="recording-people__header"><div><small>Conversation</small><h2 id="recordingPeopleTitle">People speaking</h2></div><button type="button" class="recording-people__close" data-people-close aria-label="Close">&times;</button></div>' +
          '<p>Select people so face matching can name them while they move. Spoken details are saved to each person&rsquo;s profile.</p>' +
          '<div id="recordingParticipantList" class="recording-people__list"></div>' +
          '<div class="recording-people__add"><select id="recordingCandidateSelect" aria-label="Add existing person"><option value="">Choose a person…</option>' + participantOptions + '</select><button type="button" id="recordingAddCandidate">Add</button></div>' +
          '<div class="recording-people__add"><input id="recordingGuestName" type="text" maxlength="60" placeholder="Guest or recruiter name" aria-label="Guest or recruiter name"><button type="button" id="recordingAddGuest">Add name</button></div>' +
          '<div class="recording-people__note">During recording, tap one or more names below to mark who is speaking. Multiple selected names are saved as overlapping speech.</div>' +
        '</div>' +
      '</div>' +
      '<div class="recording-screen__bottom">' +
        '<div class="recording-screen__speaker-wrap"><span>Speaking</span><div id="recordingSpeakerButtons" class="recording-screen__speakers"></div></div>' +
        '<canvas id="recordingAudioLevel" class="recording-screen__waveform" width="240" height="30" aria-label="Microphone level"></canvas>' +
        '<div class="recording-screen__controls">' +
          previousRecordingHtml +
          '<button type="button" id="videoRecordBtn" class="recording-screen__shutter" aria-label="Start recording" disabled><span aria-hidden="true"></span></button>' +
          '<button type="button" id="videoPauseBtn" class="recording-screen__pause" aria-label="Pause recording" disabled><span class="recording-screen__pause-bars" aria-hidden="true"></span></button>' +
        '</div>' +
        '<p id="videoStatus" class="recording-screen__hint">Tap to record</p>' +
      '</div>' +
    '</section>' +
    stackHtml +
    '<div class="capture-notes">' +
      '<div class="capture-section-title">Recruiter Notes</div>' +
      '<textarea id="captureNotes" class="capture-textarea" rows="3" placeholder="Quick notes from the conversation...">' + TIQ.escapeHtml(c.notes) + '</textarea>' +
    '</div>' +
    '<div class="capture-audio">' +
      '<div class="capture-section-title">Voice Notes</div>' +
      '<p class="capture-audio__hint">Works in a noisy booth — speech is filtered, transcribed, and saved to the profile.</p>' +
      '<div class="audio-controls">' +
        '<button id="audioRecordBtn" class="audio-record-btn" aria-label="Record audio"><span class="audio-record-dot"></span><span id="audioRecordLabel">Record</span></button>' +
        '<span id="audioTimer" class="audio-timer">00:00</span>' +
        '<button id="audioStopBtn" class="audio-stop-btn" disabled aria-label="Stop recording">Stop</button>' +
      '</div>' +
      '<div id="audioRecordings">' + audioHtml + '</div>' +
    '</div>' +
    '<div class="capture-actions">' +
      '<div class="capture-action-group">' +
        '<button class="capture-action-btn capture-action--skip" id="captureSkip" title="Skip (no status change)"' + (atEnd ? ' disabled' : '') + '>' +
          '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
        '<span class="capture-action-label">Skip</span>' +
      '</div>' +
      '<div class="capture-action-group">' +
        '<button class="capture-action-btn capture-action--review" id="captureReview" title="Mark as Reviewed (← or swipe left)">' +
          '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>' +
        '</button>' +
        '<span class="capture-action-label">Reviewed</span>' +
      '</div>' +
      '<div class="capture-action-group">' +
        '<button class="capture-action-btn capture-action--follow" id="captureFollow" title="Mark as Contact / Follow-Up (→ or swipe right)">' +
          '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>' +
        '</button>' +
        '<span class="capture-action-label">Contact</span>' +
      '</div>' +
    '</div>' +
    '<div class="capture-shortcuts">← Reviewed &nbsp;|&nbsp; → Contact &nbsp;|&nbsp; Space Skip &nbsp;|&nbsp; Esc Undo</div>' +
  '</div>';
};

TIQ.views._renderRecordingCaptureComplete = function(cands) {
  var recruiterName = TIQ.recruiterName(TIQ.state.activeRecruiterId) || "Not selected";

  var counts = { New: 0, Reviewed: 0, "Follow-Up": 0, "Interview Requested": 0 };
  cands.forEach(function(c) { if (counts[c.recordStatus] !== undefined) counts[c.recordStatus]++; });

  var categories = [
    { status: "New", label: "New", color: "#FEDB00", borderColor: "#D4B800", count: counts.New },
    { status: "Reviewed", label: "Reviewed", color: "#16A34A", borderColor: "#15803D", count: counts.Reviewed },
    { status: "Follow-Up", label: "Follow-Up", color: "#D97706", borderColor: "#B45309", count: counts["Follow-Up"] },
    { status: "Interview Requested", label: "Interview Requested", color: "#005DBA", borderColor: "#003D7A", count: counts["Interview Requested"] }
  ];

  var categoryCardsHtml = categories.map(function(cat) {
    return '<div class="capture-complete__card" data-status="' + cat.status + '" style="border-left: 4px solid ' + cat.borderColor + '">' +
      '<div class="capture-complete__card-color" style="background:' + cat.color + '"></div>' +
      '<div class="capture-complete__card-info">' +
        '<div class="capture-complete__card-label">' + cat.label + '</div>' +
        '<div class="capture-complete__card-count">' + cat.count + ' candidate' + (cat.count !== 1 ? 's' : '') + '</div>' +
      '</div>' +
      '<button class="capture-complete__card-btn" data-view-status="' + cat.status + '">View in AI Review →</button>' +
    '</div>';
  }).join("");

  return '<div class="view" id="view-recruiter-capture">' +
    '<div class="capture-header">' +
      '<div><span class="section-kicker">Live Capture</span><h1>Recruiter Capture</h1></div>' +
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
        '<button class="secondary-button" id="captureBackToOverview">Back to Analytics</button>' +
      '</div>' +
    '</div>' +
  '</div>';
};

TIQ.views.initRecordingCapture = function() {
  var container = document.getElementById("view-recruiter-capture");
  if (!container) return;

  container.addEventListener("click", function(e) {
    var skipBtn = e.target.closest("#captureSkip");
    var reviewBtn = e.target.closest("#captureReview");
    var followBtn = e.target.closest("#captureFollow");
    var deleteBtn = e.target.closest(".audio-delete-btn");
    var startOverBtn = e.target.closest("#captureStartOver");
    var backBtn = e.target.closest("#captureBackToOverview");
    var categoryBtn = e.target.closest(".capture-complete__card-btn");

    if (skipBtn && !skipBtn.disabled) {
      TIQ.views._recCaptureSkip();
    } else if (reviewBtn) {
      TIQ.views._recAnimateSwipeOut("left");
    } else if (followBtn) {
      TIQ.views._recAnimateSwipeOut("right");
    } else if (deleteBtn) {
      var delIdx = parseInt(deleteBtn.dataset.audioIndex);
      var c = TIQ.state.candidates[TIQ.views._recCaptureIndex];
      if (c && c.audioNotes[delIdx]) {
        c.audioNotes.splice(delIdx, 1);
        TIQ.addAuditEntry(c, "AUDIO_ADDED", "Audio recording deleted");
        TIQ.saveState();
        TIQ.views._rerenderRecordingCapture();
      }
    } else if (startOverBtn) {
      TIQ.views._recCaptureIndex = 0;
      TIQ.views._rerenderRecordingCapture();
    } else if (backBtn) {
      TIQ.router.navigateTo("analytics");
    } else if (categoryBtn) {
      var status = categoryBtn.dataset.viewStatus;
      TIQ.views._aiReviewStatus = status;
      TIQ.router.navigateTo("review");
    }
  });

  var notes = document.getElementById("captureNotes");
  if (notes) {
    notes.addEventListener("change", function() {
      var c = TIQ.state.candidates[TIQ.views._recCaptureIndex];
      if (c) { c.notes = notes.value; TIQ.addAuditEntry(c, "NOTES_UPDATED", "Notes updated"); TIQ.saveState(); }
    });
  }

  var recordBtn = document.getElementById("audioRecordBtn");
  var stopBtn = document.getElementById("audioStopBtn");
  if (recordBtn && stopBtn) {
    if (!TIQ.views._recCaptureRecorder) TIQ.views._recCaptureRecorder = new TIQ.AudioRecorder();
    var rec = TIQ.views._recCaptureRecorder;
    var timerEl = document.getElementById("audioTimer");
    var timerInt = null;

    recordBtn.addEventListener("click", function() {
      rec.start().then(function() {
        recordBtn.classList.add("recording");
        stopBtn.disabled = false;
        document.getElementById("audioRecordLabel").textContent = "Recording...";
        var sec = 0;
        timerEl.textContent = "00:00";
        timerInt = setInterval(function() { sec++; timerEl.textContent = String(Math.floor(sec/60)).padStart(2,"0") + ":" + String(sec%60).padStart(2,"0"); }, 1000);
      });
    });

    stopBtn.addEventListener("click", function() {
      clearInterval(timerInt);
      stopBtn.disabled = true;
      document.getElementById("audioRecordLabel").textContent = "Processing…";
      rec.stop().then(function(result) {
        if (!result) {
          recordBtn.classList.remove("recording");
          document.getElementById("audioRecordLabel").textContent = "Record";
          return;
        }
        var c = TIQ.state.candidates[TIQ.views._recCaptureIndex];
        if (!c) return;
        c.audioNotes.push({
          id: Date.now(),
          blobUrl: result.blobUrl,
          duration: result.duration,
          createdAt: TIQ.nowISO(),
          offlinePending: !navigator.onLine
        });
        TIQ.addAuditEntry(c, "AUDIO_ADDED", "Voice note recorded (" + result.duration + "s)");
        TIQ.saveState();

        var finishUi = function(proposalCount) {
          recordBtn.classList.remove("recording");
          stopBtn.disabled = true;
          document.getElementById("audioRecordLabel").textContent = "Record";
          timerEl.textContent = "00:00";
          TIQ.views._rerenderRecordingCapture();
          if (proposalCount > 0) {
            TIQ.showToast(proposalCount + " detail" + (proposalCount === 1 ? "" : "s") +
              " from voice note saved to profile.");
          } else {
            TIQ.showToast("Voice note saved (" + result.duration + "s).");
          }
        };

        if (!TIQ.pipeline || !TIQ.pipeline.processAudioNote || !navigator.onLine) {
          finishUi(0);
          return;
        }
        TIQ.showToast("Extracting details from voice note…");
        TIQ.pipeline.processAudioNote(result.blob, c.id, null, {
          speakerName: c.firstName + " " + c.lastName
        }).then(function(summary) {
          var n = summary.proposalsCreated || 0;
          if (summary.transcript && String(c.notes || "").indexOf(summary.transcript) === -1) {
            c.notes = [c.notes, summary.transcript].filter(Boolean).join("\n").trim();
            TIQ.saveState();
          }
          finishUi(n);
        }).catch(function(err) {
          TIQ.showToast((err && err.message) || "Voice note saved; extraction failed.");
          finishUi(0);
        });
      });
    });
  }


  /* Immersive conversation video recorder */
  var vOpen = document.getElementById("videoOpenCamBtn");
  var vRecord = document.getElementById("videoRecordBtn");
  var vPause = document.getElementById("videoPauseBtn");
  var vFlip = document.getElementById("videoFlipBtn");
  var vClose = document.getElementById("recordingCloseBtn");
  var vPrevious = document.getElementById("previousRecordingBtn");
  var vTimer = document.getElementById("videoTimer");
  var vStatus = document.getElementById("videoStatus");
  var vStatusDot = document.getElementById("recordingStatusDot");
  var vPreview = document.getElementById("captureVideoPreview");
  var vPlaceholder = document.getElementById("captureVideoPlaceholder");
  var vPermissionTitle = document.getElementById("cameraPermissionTitle");
  var vPermissionCopy = document.getElementById("cameraPermissionCopy");
  var vPanel = document.getElementById("captureVideoPanel");
  var vProcessing = document.getElementById("captureVideoProcessing");
  var vProcessingLabel = document.getElementById("captureProcessingLabel");
  var vLevel = document.getElementById("recordingAudioLevel");
  var vPeopleBtn = document.getElementById("recordingPeopleBtn");
  var vIdentifyBtn = document.getElementById("recordingIdentifyBtn");
  var vBoothCount = document.getElementById("recordingBoothCount");
  var vPeoplePanel = document.getElementById("recordingPeoplePanel");
  var vParticipantList = document.getElementById("recordingParticipantList");
  var vCandidateSelect = document.getElementById("recordingCandidateSelect");
  var vAddCandidate = document.getElementById("recordingAddCandidate");
  var vGuestName = document.getElementById("recordingGuestName");
  var vAddGuest = document.getElementById("recordingAddGuest");
  var vSpeakerButtons = document.getElementById("recordingSpeakerButtons");
  var vFaceOverlay = document.getElementById("recordingFaceOverlay");
  var vNamePanel = document.getElementById("recordingNamePanel");
  var vNameInput = document.getElementById("recordingNameInput");
  var vNameResults = document.getElementById("recordingNameResults");
  var vNameHint = document.getElementById("recordingNameHint");
  var vNameTitle = document.getElementById("recordingNameTitle");
  if (vRecord && vPanel) {
    if (!TIQ.views._videoRecorder) TIQ.views._videoRecorder = new TIQ.VideoRecorder();
    var vrec = TIQ.views._videoRecorder;
    var vInt = null;
    var meterFrame = null;
    var audioContext = null;
    var analyser = null;
    var meterData = null;
    var isStopping = false;
    var currentCandidate = TIQ.state.candidates[TIQ.views._recCaptureIndex];
    var participants = currentCandidate ? [{
      speakerKey: currentCandidate.id,
      candidateId: currentCandidate.id,
      name: currentCandidate.firstName + " " + currentCandidate.lastName
    }] : [];
    var activeSpeakerKeys = [];
    var manualTurns = [];
    var manualLabelingUsed = false;
    var manualSegmentStartedAt = 0;
    var liveFaces = [];
    var liveFaceTimer = null;
    var liveFaceBusy = false;
    var namingTarget = null;
    var nameHighlight = -1;
    var nextTrackId = 1;
    var boothPeakCount = 0;
    var captureScratch = document.createElement("canvas");

    document.body.classList.add("recording-screen-open");
    document.querySelectorAll(".sidebar, .topbar, #view-capture > :not(#captureVideoPanel)").forEach(function(el) {
      el.setAttribute("inert", "");
      el.setAttribute("data-recording-inert", "");
    });

    function formatDuration(sec) {
      sec = Math.max(0, Number(sec) || 0);
      return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
    }

    function isRecordingActive() {
      var state = vrec.getState();
      return state === "recording" || state === "paused";
    }

    function hasUnsavedRecording() {
      return isRecordingActive() || isStopping;
    }

    function preventUnload(e) {
      if (!hasUnsavedRecording()) return;
      e.preventDefault();
      e.returnValue = "";
    }

    function setNavigationGuard(on) {
      window.removeEventListener("beforeunload", preventUnload);
      if (on) window.addEventListener("beforeunload", preventUnload);
      TIQ.views._recordingNavigationGuard = on ? function() {
        return window.confirm(isStopping ? "The recording is still being saved. Leave anyway?" : "A recording is in progress. Leave and discard it?");
      } : null;
    }

    function setRecState(state) {
      vPanel.setAttribute("data-rec-state", state);
      var active = state === "recording" || state === "paused";
      vRecord.classList.toggle("is-recording", active);
      vRecord.disabled = state === "requesting" || state === "processing" || state === "error";
      vRecord.setAttribute("aria-label", active ? "Stop and save recording" : "Start recording");
      if (vPause) {
        vPause.disabled = !active || state === "processing";
        vPause.classList.toggle("is-paused", state === "paused");
        vPause.setAttribute("aria-label", state === "paused" ? "Resume recording" : "Pause recording");
      }
      if (vFlip) vFlip.disabled = state !== "ready";
      if (vPeopleBtn) vPeopleBtn.disabled = state === "processing";
      if (vIdentifyBtn) vIdentifyBtn.disabled = state === "requesting" || state === "processing" || state === "error";
      if (vStatusDot) vStatusDot.hidden = !active;
      setNavigationGuard(active || state === "processing");
      if (state === "ready" || state === "recording" || state === "paused") startLiveFaceNaming();
      else stopLiveFaceNaming();
    }

    function participantForKey(key) {
      return participants.find(function(person) { return person.speakerKey === key; });
    }

    function nameForCandidateId(candidateId) {
      var person = TIQ.state.candidates.find(function(c) { return c.id === candidateId; });
      return person ? (person.firstName + " " + person.lastName).trim() : candidateId;
    }

    function stopLiveFaceNaming() {
      if (liveFaceTimer) clearInterval(liveFaceTimer);
      liveFaceTimer = null;
      liveFaceBusy = false;
      liveFaces = [];
      if (vFaceOverlay) vFaceOverlay.innerHTML = "";
      if (vBoothCount) {
        vBoothCount.textContent = "0 in booth";
        vBoothCount.classList.add("is-empty");
        vBoothCount.classList.remove("is-multi");
      }
    }

    function startLiveFaceNaming() {
      if (liveFaceTimer || !TIQ.pipeline || !TIQ.pipeline.recognizeFrame) return;
      // Faster polls keep identity while people walk / turn in the booth
      liveFaceTimer = setInterval(function() {
        pollLiveFaces();
      }, 900);
      pollLiveFaces();
    }

    function capturePreviewBlob() {
      if (!vPreview || !vPreview.videoWidth) return Promise.resolve(null);
      var maxW = 640;
      var scale = Math.min(1, maxW / vPreview.videoWidth);
      captureScratch.width = Math.max(1, Math.round(vPreview.videoWidth * scale));
      captureScratch.height = Math.max(1, Math.round(vPreview.videoHeight * scale));
      var ctx = captureScratch.getContext("2d");
      if (!ctx) return Promise.resolve(null);
      ctx.drawImage(vPreview, 0, 0, captureScratch.width, captureScratch.height);
      return new Promise(function(resolve) {
        captureScratch.toBlob(function(blob) { resolve(blob); }, "image/jpeg", 0.72);
      });
    }

    /** Map face boxes onto the visible object-fit:cover video area. */
    function getCoveredVideoLayout() {
      if (!vPreview || !vFaceOverlay) return null;
      var vw = vPreview.videoWidth || 0;
      var vh = vPreview.videoHeight || 0;
      var rect = vFaceOverlay.getBoundingClientRect();
      var cw = rect.width;
      var ch = rect.height;
      if (!vw || !vh || !cw || !ch) return null;
      var videoAspect = vw / vh;
      var boxAspect = cw / ch;
      var drawW, drawH, offsetX, offsetY;
      if (videoAspect > boxAspect) {
        // video wider — crop sides
        drawH = ch;
        drawW = ch * videoAspect;
        offsetX = (cw - drawW) / 2;
        offsetY = 0;
      } else {
        // video taller — crop top/bottom
        drawW = cw;
        drawH = cw / videoAspect;
        offsetX = 0;
        offsetY = (ch - drawH) / 2;
      }
      return { cw: cw, ch: ch, drawW: drawW, drawH: drawH, offsetX: offsetX, offsetY: offsetY, rect: rect };
    }

    function faceCenter(norm) {
      return {
        x: (Number(norm.x) || 0) + (Number(norm.w) || 0) / 2,
        y: (Number(norm.y) || 0) + (Number(norm.h) || 0) / 2
      };
    }

    function faceIoU(a, b) {
      var ax1 = Number(a.x) || 0, ay1 = Number(a.y) || 0;
      var ax2 = ax1 + (Number(a.w) || 0), ay2 = ay1 + (Number(a.h) || 0);
      var bx1 = Number(b.x) || 0, by1 = Number(b.y) || 0;
      var bx2 = bx1 + (Number(b.w) || 0), by2 = by1 + (Number(b.h) || 0);
      var ix1 = Math.max(ax1, bx1), iy1 = Math.max(ay1, by1);
      var ix2 = Math.min(ax2, bx2), iy2 = Math.min(ay2, by2);
      var iw = Math.max(0, ix2 - ix1), ih = Math.max(0, iy2 - iy1);
      var inter = iw * ih;
      var union = Math.max(0, ax2 - ax1) * Math.max(0, ay2 - ay1) +
        Math.max(0, bx2 - bx1) * Math.max(0, by2 - by1) - inter;
      return union > 0 ? inter / union : 0;
    }

    /** Drop tiny / duplicate overlapping detections so booth count stays honest. */
    function dedupeDetections(detections) {
      var list = (detections || []).slice().filter(function(d) {
        var b = d.normBox || {};
        return (Number(b.w) || 0) >= 0.04 && (Number(b.h) || 0) >= 0.05;
      }).sort(function(a, b) {
        var aa = (Number((a.normBox || {}).w) || 0) * (Number((a.normBox || {}).h) || 0);
        var bb = (Number((b.normBox || {}).w) || 0) * (Number((b.normBox || {}).h) || 0);
        return bb - aa;
      });
      var kept = [];
      list.forEach(function(det) {
        var overlap = kept.some(function(other) {
          return faceIoU(det.normBox || {}, other.normBox || {}) > 0.45;
        });
        if (!overlap) kept.push(det);
      });
      return kept.sort(function(a, b) {
        return (Number((a.normBox || {}).x) || 0) - (Number((b.normBox || {}).x) || 0);
      });
    }

    /**
     * Keep stable track IDs / names across frames — including when people walk,
     * turn, or briefly leave the frame. Identity from face match beats position.
     */
    function trackBoothPeople(detections) {
      var normalized = (detections || []).map(function(det) {
        var norm = det.normBox;
        if (!norm && det.box) {
          var iw = (vPreview && vPreview.videoWidth) || 1;
          var ih = (vPreview && vPreview.videoHeight) || 1;
          norm = {
            x: (det.box.x || 0) / iw,
            y: (det.box.y || 0) / ih,
            w: (det.box.w || 0) / iw,
            h: (det.box.h || 0) / ih
          };
        }
        return Object.assign({}, det, { normBox: norm || { x: 0.3, y: 0.2, w: 0.4, h: 0.5 } });
      });
      var dets = dedupeDetections(normalized);
      var prev = liveFaces.slice();
      var usedPrev = {};
      var usedDet = {};
      var next = [];

      // Pass 1: lock onto the same enrolled person even if they moved across the frame
      dets.forEach(function(det, di) {
        var cid = det.candidateId || null;
        if (!cid) return;
        var matchIdx = -1;
        prev.forEach(function(face, idx) {
          if (usedPrev[idx]) return;
          if (face.candidateId === cid) matchIdx = idx;
        });
        if (matchIdx < 0) return;
        usedPrev[matchIdx] = true;
        usedDet[di] = true;
        var prior = prev[matchIdx];
        var norm = det.normBox || prior.normBox || { x: 0.3, y: 0.2, w: 0.4, h: 0.5 };
        next.push({
          trackId: prior.trackId,
          speakerKey: cid,
          candidateId: cid,
          name: nameForCandidateId(cid) || prior.name,
          confidence: det.confidence || prior.confidence || 0,
          normBox: norm,
          missed: 0,
          personNumber: prior.personNumber || 0
        });
      });

      // Pass 2: spatial association for remaining detections (large motion budget)
      dets.forEach(function(det, di) {
        if (usedDet[di]) return;
        var norm = det.normBox || { x: 0.3, y: 0.2, w: 0.4, h: 0.5 };
        var cid = det.candidateId || null;
        var bestIdx = -1;
        var bestScore = 0;
        prev.forEach(function(face, idx) {
          if (usedPrev[idx]) return;
          var iou = faceIoU(norm, face.normBox || {});
          var c1 = faceCenter(norm);
          var c2 = faceCenter(face.normBox || {});
          var dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
          var score = iou * 2.2 + (dist < 0.55 ? (0.55 - dist) * 1.4 : 0);
          if (cid && face.candidateId === cid) score += 2.5;
          if (!cid && face.candidateId && dist < 0.35) score += 0.35;
          if (score > bestScore) {
            bestScore = score;
            bestIdx = idx;
          }
        });
        var prior = bestIdx >= 0 && bestScore >= 0.12 ? prev[bestIdx] : null;
        if (prior) usedPrev[bestIdx] = true;
        var trackId = prior ? prior.trackId : (nextTrackId++);
        var namedId = cid || (prior && prior.candidateId) || null;
        var namedName = namedId
          ? (cid ? nameForCandidateId(cid) : (prior.name || nameForCandidateId(namedId)))
          : null;
        next.push({
          trackId: trackId,
          speakerKey: namedId || ("Booth-" + trackId),
          candidateId: namedId,
          name: namedName || ("Person " + trackId),
          confidence: det.confidence || 0,
          normBox: norm,
          missed: 0,
          personNumber: prior && prior.personNumber ? prior.personNumber : 0
        });
      });

      // Hold onto recently-seen people through brief occlusion / motion blur (~7s)
      prev.forEach(function(face, idx) {
        if (usedPrev[idx]) return;
        var missed = (face.missed || 0) + 1;
        if (missed <= 8) next.push(Object.assign({}, face, { missed: missed }));
      });

      next.sort(function(a, b) {
        return (Number((a.normBox || {}).x) || 0) - (Number((b.normBox || {}).x) || 0);
      });
      next.forEach(function(face, i) {
        face.personNumber = i + 1;
        if (!face.candidateId) face.name = "Person " + face.personNumber;
      });
      return next;
    }

    function updateBoothCountUi() {
      var count = liveFaces.length;
      if (count > boothPeakCount) boothPeakCount = count;
      var named = liveFaces.filter(function(f) { return !!f.candidateId; }).length;
      if (vBoothCount) {
        vBoothCount.textContent = count === 0
          ? "0 in booth"
          : (count + " in booth" + (named ? (" · " + named + " named") : ""));
        vBoothCount.classList.toggle("is-multi", count > 1);
        vBoothCount.classList.toggle("is-empty", count === 0);
      }
      if (vPeopleBtn) {
        vPeopleBtn.textContent = count
          ? (count + " in booth")
          : (participants.length + " " + (participants.length === 1 ? "person" : "people"));
      }
      var hint = document.getElementById("videoStatus");
      if (hint && !isStopping && count) {
        var unnamed = count - named;
        var state = vrec.getState();
        if (state === "preview" || state === "recording" || state === "paused") {
          if (unnamed > 0) {
            hint.textContent = unnamed === 1
              ? "Recognizing… tap video or Identify to name them"
              : ("Recognizing " + count + " people — " + unnamed + " still unnamed");
          } else if (named) {
            hint.textContent = named === 1
              ? ("Tracking " + liveFaces.filter(function(f) { return f.candidateId; })[0].name + " — keep talking")
              : ("Tracking " + named + " people — details save to their profiles");
          }
        }
      }
    }

    function faceScreenBox(face) {
      var layout = getCoveredVideoLayout();
      var box = (face && face.normBox) || {};
      var nx = Number(box.x) || 0;
      var ny = Number(box.y) || 0;
      var nw = Number(box.w) || 0;
      var nh = Number(box.h) || 0;
      var mirrored = vPreview && vPreview.classList.contains("is-front-facing");
      if (mirrored) nx = 1 - nx - nw;
      if (!layout) {
        return { leftPct: nx * 100, topPct: ny * 100, widthPct: nw * 100, heightPct: nh * 100 };
      }
      var left = layout.offsetX + nx * layout.drawW;
      var top = layout.offsetY + ny * layout.drawH;
      var width = nw * layout.drawW;
      var height = nh * layout.drawH;
      var pad = Math.max(10, Math.min(width, height) * 0.15);
      left -= pad; top -= pad; width += pad * 2; height += pad * 2;
      return {
        leftPct: (left / layout.cw) * 100,
        topPct: (top / layout.ch) * 100,
        widthPct: (width / layout.cw) * 100,
        heightPct: (height / layout.ch) * 100
      };
    }

    function faceAtClientPoint(clientX, clientY) {
      if (!liveFaces.length || !vFaceOverlay) return null;
      var rect = vFaceOverlay.getBoundingClientRect();
      var xPct = ((clientX - rect.left) / rect.width) * 100;
      var yPct = ((clientY - rect.top) / rect.height) * 100;
      var best = null;
      var bestDist = Infinity;
      liveFaces.forEach(function(face, index) {
        var b = faceScreenBox(face);
        var inside = xPct >= b.leftPct && xPct <= b.leftPct + b.widthPct &&
          yPct >= b.topPct && yPct <= b.topPct + b.heightPct;
        var cx = b.leftPct + b.widthPct / 2;
        var cy = b.topPct + b.heightPct / 2;
        var dist = Math.hypot(xPct - cx, yPct - cy);
        if (inside && dist < bestDist) {
          bestDist = dist;
          best = face;
          best._index = index;
        }
      });
      if (best) return best;
      liveFaces.forEach(function(face, index) {
        var b = faceScreenBox(face);
        var cx = b.leftPct + b.widthPct / 2;
        var cy = b.topPct + b.heightPct / 2;
        var dist = Math.hypot(xPct - cx, yPct - cy);
        if (dist < bestDist) {
          bestDist = dist;
          best = face;
          best._index = index;
        }
      });
      return bestDist < 28 ? best : null;
    }

    function renderFaceOverlay() {
      if (!vFaceOverlay) return;
      updateBoothCountUi();
      // No boxes around faces — recognition runs in the background; names show as chips.
      if (!liveFaces.length) {
        vFaceOverlay.innerHTML = '<button type="button" class="recording-face-hint recording-face-hint--btn" id="recordingNameAnyoneBtn">No one detected — tap to add a name</button>';
        return;
      }
      var chips = liveFaces.map(function(face, index) {
        var known = !!face.candidateId;
        var label = known ? face.name : ("Person " + face.personNumber + " · tap to name");
        var cls = known ? "recording-face-chip recording-face-chip--known" : "recording-face-chip recording-face-chip--unknown";
        return '<button type="button" class="' + cls + '" data-face-index="' + index + '" data-track-id="' +
          TIQ.escapeAttr(String(face.trackId)) + '" aria-label="' +
          TIQ.escapeAttr(known ? ("Identify " + face.name) : ("Name person " + face.personNumber)) + '">' +
          '<span class="recording-face-chip__dot" aria-hidden="true"></span>' +
          '<span class="recording-face-chip__label">' + TIQ.escapeHtml(label) + '</span>' +
        '</button>';
      }).join("");
      vFaceOverlay.innerHTML =
        '<div class="recording-face-chips" role="list">' + chips + '</div>';
    }

    function applyLiveDetections(detections) {
      liveFaces = trackBoothPeople(detections || []);
      liveFaces.forEach(function(face) {
        if (!face.candidateId) return;
        addParticipant({
          speakerKey: face.candidateId,
          candidateId: face.candidateId,
          name: face.name,
          fromCamera: true
        });
      });
      renderFaceOverlay();
    }

    function openNamePanel(face) {
      namingTarget = face || null;
      nameHighlight = -1;
      if (!vNamePanel) return;
      vNamePanel.hidden = false;
      var total = liveFaces.length || 0;
      var num = face && face.personNumber ? face.personNumber : null;
      if (vNameTitle) {
        vNameTitle.textContent = num && total
          ? ("Name person " + num + " of " + total)
          : "Find or add name";
      }
      if (vNameHint) {
        if (face && face.candidateId) {
          vNameHint.textContent = "Currently: " + face.name + ". Search the dropdown to change, or add someone new.";
        } else if (total > 1) {
          vNameHint.textContent = "Booth has " + total + " people. Search for this person, or add their name if they are not in the database.";
        } else {
          vNameHint.textContent = "Type a name. Choose from the dropdown, or add them if they are not in the database.";
        }
      }
      if (vNameInput) {
        vNameInput.value = "";
        vNameInput.focus();
      }
      renderNameSearchResults();
    }

    function closeNamePanel() {
      namingTarget = null;
      nameHighlight = -1;
      if (vNamePanel) vNamePanel.hidden = true;
    }

    function searchCandidates(query) {
      var q = String(query || "").trim().toLowerCase();
      var list = TIQ.state.candidates || [];
      if (!q) return list.slice(0, 12);
      return list.filter(function(c) {
        var hay = [
          c.firstName, c.lastName, (c.firstName + " " + c.lastName),
          c.id, c.email, c.university, c.major
        ].join(" ").toLowerCase();
        return hay.indexOf(q) >= 0;
      }).slice(0, 12);
    }

    function hasExactNameMatch(query) {
      var q = String(query || "").trim().toLowerCase();
      if (!q) return false;
      return (TIQ.state.candidates || []).some(function(c) {
        return ((c.firstName + " " + c.lastName).trim().toLowerCase() === q);
      });
    }

    function renderNameSearchResults() {
      if (!vNameResults) return;
      var query = vNameInput ? vNameInput.value.trim() : "";
      var matches = searchCandidates(query);
      var showAdd = query.length >= 2 && !hasExactNameMatch(query);
      var options = [];

      matches.forEach(function(c) {
        var display = (TIQ.views._displayName ? TIQ.views._displayName(c) : "") ||
          ((c.firstName || "") + " " + (c.lastName || "")).trim();
        var schoolBits = [c.university, c.major].filter(function(v) { return v && String(v).trim(); });
        var description = "";
        if (c.summary) description = String(c.summary).trim();
        else if (c.notes) description = String(c.notes).trim();
        if (description.length > 110) description = description.slice(0, 107) + "...";
        options.push({
          kind: "pick",
          id: c.id,
          name: display,
          meta: schoolBits.join(" · "),
          description: description
        });
      });
      if (showAdd) {
        options.push({
          kind: "add",
          id: null,
          name: query,
          meta: "Not in database — create new card",
          description: ""
        });
      }

      if (!options.length) {
        vNameResults.innerHTML = '<div class="recording-name-empty" role="option">' +
          (query ? "No matches. Keep typing a full name to add them." : "Start typing to search candidates…") +
        '</div>';
        nameHighlight = -1;
        return;
      }

      if (nameHighlight >= options.length) nameHighlight = options.length - 1;
      if (nameHighlight < 0 && showAdd && !matches.length) nameHighlight = options.length - 1;

      vNameResults.innerHTML = options.map(function(opt, i) {
        var active = i === nameHighlight ? " is-active" : "";
        if (opt.kind === "add") {
          return '<button type="button" class="recording-name-option recording-name-option--add' + active +
            '" data-add-name="' + TIQ.escapeAttr(opt.name) + '" role="option" aria-selected="' + (i === nameHighlight) + '">' +
            '<strong>+ Add “' + TIQ.escapeHtml(opt.name) + '”</strong>' +
            '<small>' + TIQ.escapeHtml(opt.meta) + '</small></button>';
        }
        return '<button type="button" class="recording-name-option' + active +
          '" data-pick-id="' + TIQ.escapeAttr(opt.id) + '" role="option" aria-selected="' + (i === nameHighlight) + '">' +
          '<strong>' + TIQ.escapeHtml(opt.name) + '</strong>' +
          (opt.meta ? '<small class="recording-name-option__meta">' + TIQ.escapeHtml(opt.meta) + '</small>' : '') +
          (opt.description ? '<small class="recording-name-option__desc">' + TIQ.escapeHtml(opt.description) + '</small>' : '') +
          '</button>';
      }).join("");
    }

    function moveNameHighlight(delta) {
      if (!vNameResults) return;
      var items = vNameResults.querySelectorAll("[data-pick-id], [data-add-name]");
      if (!items.length) return;
      nameHighlight = (nameHighlight + delta + items.length) % items.length;
      renderNameSearchResults();
      var active = vNameResults.querySelector(".is-active");
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
    }

    function activateHighlightedName() {
      if (!vNameResults) return false;
      var items = vNameResults.querySelectorAll("[data-pick-id], [data-add-name]");
      if (!items.length) return false;
      var idx = nameHighlight >= 0 ? nameHighlight : 0;
      var el = items[idx];
      if (!el) return false;
      if (el.getAttribute("data-pick-id")) {
        pickExistingCandidate(el.getAttribute("data-pick-id"));
        return true;
      }
      if (el.getAttribute("data-add-name")) {
        addNewNamedPerson(el.getAttribute("data-add-name"));
        return true;
      }
      return false;
    }

    function assignPersonToFace(person) {
      if (!person || !person.candidateId) return;
      addParticipant(person);
      if (namingTarget) {
        namingTarget.candidateId = person.candidateId;
        namingTarget.speakerKey = person.speakerKey;
        namingTarget.name = person.name;
        // Keep the same track named across future frames
        liveFaces.forEach(function(face) {
          if (face.trackId === namingTarget.trackId) {
            face.candidateId = person.candidateId;
            face.speakerKey = person.speakerKey;
            face.name = person.name;
          }
        });
        renderFaceOverlay();
      }
      if (vCandidateSelect && !Array.prototype.some.call(vCandidateSelect.options, function(o) { return o.value === person.candidateId; })) {
        var opt = document.createElement("option");
        opt.value = person.candidateId;
        opt.textContent = person.name;
        vCandidateSelect.appendChild(opt);
      }
      TIQ.showToast(person.name + " selected" + (liveFaces.length > 1 ? (" (" + liveFaces.filter(function(f){return f.candidateId;}).length + "/" + liveFaces.length + " named)") : ""));
      closeNamePanel();
    }

    function pickExistingCandidate(candidateId) {
      var existing = TIQ.state.candidates.find(function(c) { return c.id === candidateId; });
      if (!existing) return;
      assignPersonToFace({
        speakerKey: existing.id,
        candidateId: existing.id,
        name: (existing.firstName + " " + existing.lastName).trim(),
        fromCamera: true
      });
    }

    function addNewNamedPerson(typedName) {
      typedName = String(typedName || "").trim();
      if (typedName.length < 2) {
        TIQ.showToast("Type at least 2 letters to add a name");
        return;
      }
      var exact = (TIQ.state.candidates || []).find(function(c) {
        return ((c.firstName + " " + c.lastName).trim().toLowerCase() === typedName.toLowerCase());
      });
      if (exact) {
        pickExistingCandidate(exact.id);
        return;
      }
      var insertAt = Math.min(TIQ.views._recCaptureIndex + 1, TIQ.state.candidates.length);
      var created = TIQ.createQuickCandidate({ name: typedName, insertAt: insertAt });
      assignPersonToFace({
        speakerKey: created.id,
        candidateId: created.id,
        name: (created.firstName + " " + created.lastName).trim(),
        fromCamera: true
      });
    }

    function pollLiveFaces() {
      if (liveFaceBusy || isStopping) return;
      if (vNamePanel && !vNamePanel.hidden) return;
      var state = vrec.getState();
      if (state !== "preview" && state !== "recording" && state !== "paused") return;
      if (!vPreview || !vPreview.srcObject) return;
      liveFaceBusy = true;
      capturePreviewBlob().then(function(blob) {
        if (!blob) { liveFaceBusy = false; return; }
        return TIQ.pipeline.recognizeFrame(blob).then(function(body) {
          var dets = (body && body.detections) || [];
          if (dets.length) {
            applyLiveDetections(dets);
          } else if (!liveFaces.length) {
            renderFaceOverlay();
            var hint = document.getElementById("videoStatus");
            if (hint && !isStopping) {
              hint.textContent = (body && body.emptyGallery)
                ? "Face gallery empty — enroll a face, or tap to name someone"
                : "Looking for faces… step into frame";
            }
          }
        });
      }).catch(function(err) {
        if (!liveFaces.length) {
          renderFaceOverlayOffline(err);
        }
      }).then(function() {
        liveFaceBusy = false;
      });
    }

    function renderFaceOverlayOffline(err) {
      if (!vFaceOverlay) return;
      updateBoothCountUi();
      var msg = (err && err.message) ? String(err.message) : "";
      var offline = /failed to fetch|network|load failed|econnrefused|500|502|503/i.test(msg) || !msg;
      vFaceOverlay.innerHTML =
        '<button type="button" class="recording-face-hint recording-face-hint--btn" id="recordingNameAnyoneBtn">' +
          (offline
            ? "Face service offline — restart server, or tap to name manually"
            : ("Recognition error — tap to name manually")) +
        '</button>';
      var hint = document.getElementById("videoStatus");
      if (hint && !isStopping) {
        hint.textContent = offline
          ? "ML server not reachable on :8000"
          : (msg.slice(0, 80) || "Recognition unavailable");
      }
    }

    function markCameraSessionOnCards(summary) {
      var names = participants.map(function(p) { return p.name; }).filter(Boolean);
      var ids = {};
      participants.forEach(function(p) { if (p.candidateId) ids[p.candidateId] = true; });
      (summary.matchedCandidates || []).forEach(function(id) { ids[id] = true; });
      (summary.speakers || []).forEach(function(s) {
        if (s.candidateId) ids[s.candidateId] = true;
        if (s.name) names.push(s.name);
      });
      var uniqueNames = names.filter(function(n, i) { return names.indexOf(n) === i; });
      Object.keys(ids).forEach(function(id) {
        var c = TIQ.state.candidates.find(function(x) { return x.id === id; });
        if (!c) return;
        c.cameraSession = c.cameraSession || {};
        c.cameraSession.lastSeenAt = TIQ.nowISO();
        c.cameraSession.boothPeopleCount = Math.max(boothPeakCount, liveFaces.length, Object.keys(ids).length);
        c.cameraSession.seenWith = uniqueNames.filter(function(n) {
          return n !== (c.firstName + " " + c.lastName).trim();
        });
        c.lastUpdated = TIQ.todayISO();
      });
      if (currentCandidate) {
        currentCandidate.cameraSession = currentCandidate.cameraSession || {};
        currentCandidate.cameraSession.boothPeopleCount = Math.max(
          boothPeakCount,
          liveFaces.length,
          currentCandidate.cameraSession.boothPeopleCount || 0
        );
      }
      var nextNamed = participants.find(function(p) {
        return p.candidateId && currentCandidate && p.candidateId !== currentCandidate.id;
      });
      if (nextNamed) {
        var nextIdx = TIQ.state.candidates.findIndex(function(c) { return c.id === nextNamed.candidateId; });
        if (nextIdx >= 0) TIQ.views._recCaptureIndex = nextIdx;
      }
    }

    function renderParticipants() {
      if (liveFaces.length) updateBoothCountUi();
      else if (vPeopleBtn) vPeopleBtn.textContent = participants.length + " " + (participants.length === 1 ? "person" : "people");
      if (vParticipantList) {
        vParticipantList.innerHTML = participants.map(function(person, index) {
          var cand = person.candidateId
            ? (TIQ.state.candidates || []).find(function(c) { return c.id === person.candidateId; })
            : null;
          var metaBits = cand
            ? [cand.university, cand.major].filter(function(v) { return v && String(v).trim(); })
            : [];
          var meta = metaBits.length ? metaBits.join(" · ") : (person.candidateId ? "Candidate" : "Guest");
          var desc = "";
          if (cand && cand.summary) desc = String(cand.summary).trim();
          else if (cand && cand.notes) desc = String(cand.notes).trim();
          if (desc.length > 100) desc = desc.slice(0, 97) + "...";
          return '<div class="recording-people__person">' +
            '<div>' +
              '<strong>' + TIQ.escapeHtml(person.name) + '</strong>' +
              '<small class="recording-people__meta">' + TIQ.escapeHtml(meta) + '</small>' +
              (desc ? '<small class="recording-people__desc">' + TIQ.escapeHtml(desc) + '</small>' : '') +
            '</div>' +
            (index ? '<button type="button" data-remove-speaker="' + TIQ.escapeAttr(person.speakerKey) + '" aria-label="Remove ' + TIQ.escapeAttr(person.name) + '">&times;</button>' : '') +
          '</div>';
        }).join("");
      }
      if (vSpeakerButtons) {
        vSpeakerButtons.innerHTML = participants.map(function(person) {
          var active = activeSpeakerKeys.indexOf(person.speakerKey) >= 0;
          return '<button type="button" class="recording-screen__speaker' + (active ? ' is-active' : '') + '" data-speaker-key="' + TIQ.escapeAttr(person.speakerKey) + '" aria-pressed="' + active + '">' + TIQ.escapeHtml(person.name) + '</button>';
        }).join("");
      }
    }

    function closeManualSegment(atSeconds) {
      if (!manualLabelingUsed || atSeconds <= manualSegmentStartedAt) return;
      activeSpeakerKeys.forEach(function(key) {
        var person = participantForKey(key);
        if (!person) return;
        manualTurns.push({
          t0: Number(manualSegmentStartedAt.toFixed(2)),
          t1: Number(atSeconds.toFixed(2)),
          speakerKey: person.speakerKey,
          candidateId: person.candidateId || null,
          speakerName: person.name,
          manual: true
        });
      });
    }

    function selectSpeaker(key) {
      var state = vrec.getState();
      var now = state === "recording" || state === "paused" ? vrec.getElapsedTime() : 0;
      if (manualLabelingUsed && (state === "recording" || state === "paused")) closeManualSegment(now);
      var index = activeSpeakerKeys.indexOf(key);
      if (index >= 0) activeSpeakerKeys.splice(index, 1);
      else activeSpeakerKeys.push(key);
      manualLabelingUsed = true;
      manualSegmentStartedAt = now;
      renderParticipants();
    }

    function addParticipant(person) {
      if (!person || !person.speakerKey || participants.some(function(existing) { return existing.speakerKey === person.speakerKey; })) return;
      participants.push(person);
      renderParticipants();
    }

    function setStatus(msg, processingMsg) {
      if (vStatus) vStatus.textContent = msg || "";
      if (vProcessingLabel && processingMsg) vProcessingLabel.textContent = processingMsg;
    }

    function attachPreview(stream) {
      if (!vPreview || !stream) return;
      vPreview.srcObject = stream;
      vPreview.muted = true;
      vPreview.setAttribute("playsinline", "");
      vPreview.setAttribute("autoplay", "");
      var playPromise = vPreview.play();
      if (playPromise && playPromise.catch) playPromise.catch(function() {});
      vPreview.classList.toggle("is-front-facing", vrec.facingMode === "user");
      if (vPlaceholder) vPlaceholder.hidden = true;
    }

    function clearPreview() {
      if (!vPreview) return;
      vPreview.srcObject = null;
      vPreview.classList.remove("is-front-facing");
    }

    function setProcessingUi(on) {
      if (vProcessing) vProcessing.hidden = !on;
    }

    function stopMeter() {
      if (meterFrame) cancelAnimationFrame(meterFrame);
      meterFrame = null;
      if (audioContext) {
        try { audioContext.close(); } catch (_) {}
      }
      audioContext = null;
      analyser = null;
    }

    function startMeter(stream) {
      stopMeter();
      if (!vLevel || !stream || !stream.getAudioTracks().length) return;
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      try {
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.78;
        audioContext.createMediaStreamSource(stream).connect(analyser);
        meterData = new Uint8Array(analyser.frequencyBinCount);
      } catch (_) { return; }

      var ctx = vLevel.getContext("2d");
      function drawMeter() {
        meterFrame = requestAnimationFrame(drawMeter);
        var width = vLevel.width;
        var height = vLevel.height;
        ctx.clearRect(0, 0, width, height);
        if (!isRecordingActive() || !analyser) return;
        analyser.getByteFrequencyData(meterData);
        var bars = 24;
        var gap = 4;
        var barWidth = (width - gap * (bars - 1)) / bars;
        ctx.fillStyle = "rgba(255,255,255,.78)";
        for (var i = 0; i < bars; i++) {
          var value = meterData[Math.floor(i * meterData.length / bars)] / 255;
          var barHeight = Math.max(3, value * height);
          ctx.fillRect(i * (barWidth + gap), (height - barHeight) / 2, barWidth, barHeight);
        }
      }
      drawMeter();
    }

    function updateTimer() {
      if (!vTimer) return;
      var prefix = vrec.getState() === "paused" ? "Paused " : "";
      vTimer.textContent = prefix + formatDuration(vrec.getElapsedSeconds());
    }

    function requestCamera() {
      setRecState("requesting");
      if (vPlaceholder) vPlaceholder.hidden = false;
      if (vPermissionTitle) vPermissionTitle.textContent = "Camera & microphone";
      if (vPermissionCopy) vPermissionCopy.textContent = "Allow access to record this conversation.";
      if (vOpen) { vOpen.disabled = true; vOpen.textContent = "Requesting…"; }
      setStatus("Starting camera…");
      return vrec.openCamera({ facingMode: vrec.facingMode || "environment" }).then(function(stream) {
        attachPreview(stream);
        startMeter(stream);
        setRecState("ready");
        if (vTimer) vTimer.textContent = "Ready";
        setStatus("Tap to record");
      }).catch(function(err) {
        if (err && err.name === "AbortError") return;
        setRecState("error");
        clearPreview();
        if (vPlaceholder) vPlaceholder.hidden = false;
        if (vPermissionTitle) vPermissionTitle.textContent = "Camera unavailable";
        if (vPermissionCopy) vPermissionCopy.textContent = (err && err.name === "NotAllowedError")
          ? "Allow camera and microphone access in your browser settings, then try again."
          : ((err && err.message) || "Check that a camera and microphone are connected.");
        if (vOpen) { vOpen.disabled = false; vOpen.textContent = "Try again"; }
        setStatus("Camera and microphone required");
      });
    }

    vrec.onStateChange = function(state, stream) {
      if ((state === "stream" || state === "recording" || state === "paused") && stream) attachPreview(stream);
    };

    if (vOpen) {
      vOpen.addEventListener("click", function() {
        requestCamera();
      });
    }

    function stopAndSave() {
      if (isStopping) return;
      isStopping = true;
      if (manualLabelingUsed) closeManualSegment(vrec.getElapsedTime());
      clearInterval(vInt);
      setRecState("processing");
      setProcessingUi(true);
      setStatus("", "Saving recording…");
      var processingStarted = Date.now();
      vrec.stop().then(function(result) {
        clearPreview();
        if (!result || !result.blob) {
          setProcessingUi(false);
          setRecState("error");
          setStatus("No video captured");
          isStopping = false;
          return;
        }
        var c = TIQ.state.candidates[TIQ.views._recCaptureIndex];
        if (!c) {
          setProcessingUi(false);
          setRecState("error");
          setStatus("No candidate");
          isStopping = false;
          return;
        }
        // Prefer a named face on camera when the open card wasn't the one recognized
        var namedFaces = liveFaces.filter(function(face) { return !!face.candidateId; });
        var focusCandidateId = c.id;
        if (namedFaces.length === 1) {
          focusCandidateId = namedFaces[0].candidateId;
        } else if (namedFaces.length > 1) {
          var openIsNamed = namedFaces.some(function(face) { return face.candidateId === c.id; });
          if (!openIsNamed) focusCandidateId = namedFaces[0].candidateId;
        }
        var focusCandidate = TIQ.state.candidates.find(function(row) { return row.id === focusCandidateId; }) || c;
        var recordingId = "REC-" + Date.now();
        var metadata = {
          id: recordingId,
          candidateId: focusCandidate.id,
          createdAt: TIQ.nowISO(),
          duration: result.duration,
          mimeType: result.blob.type || vrec.mimeType || "video/webm",
          hasAudio: true,
          cameraFacing: vrec.facingMode,
          status: "processing",
          boothPeopleCount: Math.max(boothPeakCount, liveFaces.length, participants.length),
          boothPeople: liveFaces.map(function(face) {
            return {
              trackId: face.trackId,
              personNumber: face.personNumber,
              candidateId: face.candidateId || null,
              name: face.name,
              named: !!face.candidateId
            };
          }),
          speakerRoster: participants.map(function(person) {
            return { speakerKey: person.speakerKey, candidateId: person.candidateId, name: person.name, expected: true };
          })
        };
        // Ensure every named booth face is on the roster for attribution
        namedFaces.forEach(function(face) {
          if (!face.candidateId) return;
          if (metadata.speakerRoster.some(function(p) { return p.candidateId === face.candidateId; })) return;
          metadata.speakerRoster.push({
            speakerKey: face.candidateId,
            candidateId: face.candidateId,
            name: face.name,
            expected: true
          });
        });
        var recordingStored = false;
        var minimumDelay = new Promise(function(resolve) {
          setTimeout(resolve, Math.max(0, 700 - (Date.now() - processingStarted)));
        });
        Promise.all([TIQ.recordingDB.put(recordingId, result.blob, metadata), minimumDelay]).then(function() {
          recordingStored = true;
          if (!TIQ.pipeline || !TIQ.pipeline.processConversationVideo) throw new Error("Conversation processing is unavailable.");
          setStatus("", "Listening through booth noise & extracting profile details…");
          return TIQ.pipeline.processConversationVideo(result.blob, focusCandidate.id, function(message) {
            setStatus("", message);
          }, {
            recordingId: recordingId,
            persist: false,
            speakerRoster: metadata.speakerRoster,
            manualTurns: manualTurns
          });
        }).then(function(summary) {
          metadata.status = "ready_for_review";
          metadata.utterances = summary.utterances || [];
          metadata.speakers = summary.speakers || [];
          metadata.turns = summary.turns || [];
          metadata.utteranceCount = metadata.utterances.length;
          metadata.proposalsCreated = summary.proposalsCreated || 0;
          return TIQ.recordingDB.put(recordingId, result.blob, metadata).then(function() { return summary; });
        }).then(function(summary) {
          markCameraSessionOnCards(summary || {});
          TIQ.addRecordingMeta(metadata);
          TIQ.addAuditEntry(focusCandidate, "CONVERSATION_RECORDED", "Conversation video processed (" + result.duration + "s, " + metadata.speakers.length + " speakers)");
          TIQ.views._reviewSelected = focusCandidate.id;
          TIQ.state.selectedId = focusCandidate.id;
          TIQ.saveState();
          var proposalCount = summary.proposalsCreated || 0;
          setStatus("", proposalCount ? "Spoken details saved to profile" : "Recording processed");
          TIQ.showToast(proposalCount
            ? (proposalCount + " detail" + (proposalCount === 1 ? "" : "s") + " from conversation saved to profile.")
            : "People named. Recording saved to cards.");
          setTimeout(function() {
            setNavigationGuard(false);
            stopLiveFaceNaming();
            stopMeter();
            document.body.classList.remove("recording-screen-open");
            TIQ.router.navigateTo("recruiter-capture");
          }, 350);
        }).catch(function(err) {
          if (recordingStored) {
            metadata.status = "processing_failed";
            metadata.processingError = (err && err.message) || "Processing failed";
            TIQ.recordingDB.put(recordingId, result.blob, metadata).catch(function() {});
            TIQ.addRecordingMeta(metadata);
            TIQ.addAuditEntry(focusCandidate, "CONVERSATION_RECORDED", "Conversation video saved; extraction pending");
            TIQ.saveState();
            TIQ.showToast("Recording saved. Speaker processing can be retried later.");
            setTimeout(function() {
              setNavigationGuard(false);
              stopLiveFaceNaming();
              stopMeter();
              document.body.classList.remove("recording-screen-open");
              TIQ.views._reviewSelected = focusCandidate.id;
              TIQ.router.navigateTo("review");
            }, 350);
            return;
          }
          TIQ.views._pendingRecording = { id: recordingId, blob: result.blob, meta: metadata };
          setProcessingUi(false);
          setRecState("error");
          setStatus("Could not save recording");
          TIQ.showToast((err && err.message) || "Recording could not be saved.");
          isStopping = false;
        });
      });
    }

    vRecord.addEventListener("click", function() {
      if (isRecordingActive()) {
        stopAndSave();
        return;
      }
      setStatus("Starting…");
      vRecord.disabled = true;
      manualTurns = [];
      manualSegmentStartedAt = 0;
      if (audioContext && audioContext.state === "suspended") audioContext.resume().catch(function() {});
      vrec.start({ facingMode: vrec.facingMode }).then(function(stream) {
        attachPreview(stream);
        setRecState("recording");
        setStatus("Tap red square to stop");
        updateTimer();
        clearInterval(vInt);
        vInt = setInterval(updateTimer, 250);
      }).catch(function(err) {
        setRecState(vrec.isLive() ? "ready" : "error");
        setStatus((err && err.message) || "Recording failed");
      });
    });

    if (vPause) vPause.addEventListener("click", function() {
      if (vrec.getState() === "recording" && vrec.pause()) {
        setRecState("paused");
        updateTimer();
        setStatus("Recording paused");
      } else if (vrec.getState() === "paused" && vrec.resume()) {
        setRecState("recording");
        updateTimer();
        setStatus("Tap red square to stop");
      }
    });

    if (vFlip) vFlip.addEventListener("click", function() {
      vFlip.disabled = true;
      setStatus("Switching camera…");
      vrec.switchCamera().then(function(stream) {
        attachPreview(stream);
        startMeter(stream);
        setRecState("ready");
        setStatus("Tap to record");
      }).catch(function(err) {
        if (err && err.name === "AbortError") return;
        setRecState(vrec.isLive() ? "ready" : "error");
        setStatus((err && err.message) || "Could not switch camera");
      });
    });

    if (vClose) vClose.addEventListener("click", function() {
      if (isRecordingActive() && !window.confirm("Discard this recording and leave?")) return;
      clearInterval(vInt);
      setNavigationGuard(false);
      stopLiveFaceNaming();
      stopMeter();
      vrec.cancel();
      document.body.classList.remove("recording-screen-open");
      TIQ.router.navigateTo("recruiter-capture");
    });

    if (vPrevious) vPrevious.addEventListener("click", function() {
      TIQ.showToast("Previous recording is saved for review.");
    });

    if (vPeopleBtn) vPeopleBtn.addEventListener("click", function() {
      if (vPeoplePanel) vPeoplePanel.hidden = false;
    });

    if (vIdentifyBtn) vIdentifyBtn.addEventListener("click", function() {
      openNamePanel(liveFaces[0] || null);
    });

    if (vFaceOverlay) vFaceOverlay.addEventListener("click", function(e) {
      // Ignore taps on chrome that sit above the overlay (topbar/bottom use higher z-index)
      var anyone = e.target.closest("#recordingNameAnyoneBtn");
      if (anyone) {
        e.preventDefault();
        openNamePanel(null);
        return;
      }
      var btn = e.target.closest("[data-face-index]");
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        var face = liveFaces[parseInt(btn.getAttribute("data-face-index"), 10)];
        openNamePanel(face || null);
        return;
      }
      // Tap anywhere on the person / video → nearest detected face, or open blank search
      e.preventDefault();
      var nearest = faceAtClientPoint(e.clientX, e.clientY);
      openNamePanel(nearest || null);
    });

    // Reposition boxes on resize / orientation change
    window.addEventListener("resize", function() {
      if (liveFaces.length) renderFaceOverlay();
    });

    if (vNamePanel) vNamePanel.addEventListener("click", function(e) {
      if (e.target.closest("[data-name-close]")) {
        closeNamePanel();
        return;
      }
      var pick = e.target.closest("[data-pick-id]");
      if (pick) {
        pickExistingCandidate(pick.getAttribute("data-pick-id"));
        return;
      }
      var addBtn = e.target.closest("[data-add-name]");
      if (addBtn) {
        addNewNamedPerson(addBtn.getAttribute("data-add-name"));
      }
    });
    if (vNameInput) {
      vNameInput.addEventListener("input", function() {
        nameHighlight = -1;
        renderNameSearchResults();
      });
      vNameInput.addEventListener("keydown", function(e) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          moveNameHighlight(1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          moveNameHighlight(-1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (!activateHighlightedName()) {
            addNewNamedPerson(vNameInput.value);
          }
        } else if (e.key === "Escape") {
          closeNamePanel();
        }
      });
    }

    if (vPeoplePanel) vPeoplePanel.addEventListener("click", function(e) {
      if (e.target.closest("[data-people-close]")) vPeoplePanel.hidden = true;
      var remove = e.target.closest("[data-remove-speaker]");
      if (!remove) return;
      var key = remove.getAttribute("data-remove-speaker");
      participants = participants.filter(function(person) { return person.speakerKey !== key; });
      activeSpeakerKeys = activeSpeakerKeys.filter(function(activeKey) { return activeKey !== key; });
      renderParticipants();
    });

    if (vAddCandidate) vAddCandidate.addEventListener("click", function() {
      var candidateId = vCandidateSelect && vCandidateSelect.value;
      var person = TIQ.state.candidates.find(function(candidate) { return candidate.id === candidateId; });
      if (!person) return;
      addParticipant({
        speakerKey: person.id,
        candidateId: person.id,
        name: person.firstName + " " + person.lastName
      });
      if (vCandidateSelect) vCandidateSelect.value = "";
    });

    if (vAddGuest) vAddGuest.addEventListener("click", function() {
      var name = vGuestName ? vGuestName.value.trim() : "";
      if (!name) return;
      addParticipant({ speakerKey: "Guest-" + Date.now(), candidateId: null, name: name });
      if (vGuestName) vGuestName.value = "";
    });

    if (vSpeakerButtons) vSpeakerButtons.addEventListener("click", function(e) {
      var button = e.target.closest("[data-speaker-key]");
      if (button) selectSpeaker(button.getAttribute("data-speaker-key"));
    });

    TIQ.views._recordingCleanup = function() {
      clearInterval(vInt);
      setNavigationGuard(false);
      stopLiveFaceNaming();
      stopMeter();
      document.body.classList.remove("recording-screen-open");
      document.querySelectorAll("[data-recording-inert]").forEach(function(el) {
        el.removeAttribute("inert");
        el.removeAttribute("data-recording-inert");
      });
    };

    renderParticipants();
    setRecState("requesting");
    requestCamera();
  }

  document.addEventListener("keydown", TIQ.views._recCaptureKeyHandler);
  TIQ.views._recInitSwipeEngine();
};

/* ---- Swipe Engine ---- */
TIQ.views._recInitSwipeEngine = function() {
  var frontCard = document.querySelector(".capture-card--0");
  if (!frontCard) return;

  var startX = 0, startY = 0, dx = 0, dragging = false, dominantAxis = null;

  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
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
      TIQ.views._recAnimateSwipeOut(dx < 0 ? "left" : "right");
    } else {
      TIQ.views._recSpringBack();
    }
  }

  frontCard.addEventListener("pointerdown", onPointerDown);
  frontCard.addEventListener("pointermove", onPointerMove);
  frontCard.addEventListener("pointerup", onPointerUp);
  frontCard.addEventListener("pointercancel", onPointerUp);
};

TIQ.views._recAnimateSwipeOut = function(direction) {
  var frontCard = document.querySelector(".capture-card--0");
  if (!frontCard) { TIQ.views._recApplySwipeAction(direction); return; }

  var transforms = {
    left: "translateX(-150%) rotate(-30deg)",
    right: "translateX(150%) rotate(30deg)"
  };
  var opacity = { left: 0, right: 0 };

  frontCard.classList.remove("capture-card--swiping");
  frontCard.classList.add("capture-card--exiting");
  frontCard.style.transform = transforms[direction];
  frontCard.style.opacity = opacity[direction];

  var leftOvl = frontCard.querySelector(".capture-overlay--left");
  var rightOvl = frontCard.querySelector(".capture-overlay--right");
  if (leftOvl) leftOvl.style.opacity = 0;
  if (rightOvl) rightOvl.style.opacity = 0;

  var done = false;
  function onEnd() {
    if (done) return;
    done = true;
    frontCard.removeEventListener("transitionend", onEnd);
    TIQ.views._recApplySwipeAction(direction);
  }
  frontCard.addEventListener("transitionend", onEnd);
  setTimeout(onEnd, 350);
};

TIQ.views._recSpringBack = function() {
  var frontCard = document.querySelector(".capture-card--0");
  if (!frontCard) return;
  frontCard.classList.remove("capture-card--swiping");
  frontCard.classList.add("capture-card--spring");
  frontCard.style.transform = "";
  var leftOvl = frontCard.querySelector(".capture-overlay--left");
  var rightOvl = frontCard.querySelector(".capture-overlay--right");
  if (leftOvl) leftOvl.style.opacity = 0;
  if (rightOvl) rightOvl.style.opacity = 0;
};

TIQ.views._recApplySwipeAction = function(direction) {
  if (direction === "left") {
    TIQ.views._recSetCaptureStatus("Reviewed");
  } else if (direction === "right") {
    TIQ.views._recSetCaptureStatus("Follow-Up");
  }
};

TIQ.views._recCaptureSkip = function() {
  var cands = TIQ.state.candidates;
  if (TIQ.views._recCaptureIndex >= cands.length - 1) return;
  TIQ.views._recCaptureIndex++;
  TIQ.views._rerenderRecordingCapture();
};

TIQ.views._recCaptureKeyHandler = function(e) {
  var view = document.getElementById("view-recruiter-capture");
  if (!view || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
  if (document.getElementById("captureVideoPanel")) return;
  if (TIQ.views._recCaptureIndex >= TIQ.state.candidates.length) return;
  if (e.key === "ArrowLeft") { TIQ.views._recAnimateSwipeOut("left"); }
  else if (e.key === "ArrowRight") { TIQ.views._recAnimateSwipeOut("right"); }
  else if (e.key === " ") {
    e.preventDefault();
    TIQ.views._recCaptureSkip();
  }
};

TIQ.views._recSetCaptureStatus = function(status) {
  var c = TIQ.state.candidates[TIQ.views._recCaptureIndex];
  if (!c) return;
  var prevStatus = c.recordStatus;
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
    TIQ.views._rerenderRecordingCapture();
  };

  TIQ.showUndoToast(c.firstName + " marked as " + status, undoAction);
  TIQ.views._recCaptureIndex++;
  TIQ.views._rerenderRecordingCapture();
};

TIQ.views._rerenderRecordingCapture = function() {
  document.removeEventListener("keydown", TIQ.views._recCaptureKeyHandler);
  if (TIQ.views._recordingCleanup) TIQ.views._recordingCleanup();
  var container = document.getElementById("viewContainer");
  if (!container) return;
  var existing = document.getElementById("view-recruiter-capture");
  if (existing) {
    existing.outerHTML = TIQ.views.renderRecordingCapture();
  } else {
    container.innerHTML = TIQ.views.renderRecordingCapture();
  }
  TIQ.views.initRecordingCapture();
};
