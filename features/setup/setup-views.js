/* ============================================
   TalentIQ — Set Up (Kiosk) Feature
   Isolated module: event booth, QR intake, camera preview
   Load after config.js, data.js, components.js
   ============================================ */
window.TIQ = window.TIQ || {};
TIQ.views = TIQ.views || {};

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
