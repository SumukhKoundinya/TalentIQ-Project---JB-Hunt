/* ============================================
   TalentIQ — Reusable Components
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.showToast = function(message) {
  var toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("toast--show");
  clearTimeout(toast._t);
  toast._t = setTimeout(function() { toast.classList.remove("toast--show"); }, TIQ.CONFIG.toastDuration);
};

TIQ.showUndoToast = function(message, onUndo) {
  var toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = '<span>' + TIQ.escapeHtml(message) + '</span> <button class="toast-undo" id="toastUndoBtn">Undo</button>';
  toast.classList.add("toast--show");
  clearTimeout(toast._t);
  document.getElementById("toastUndoBtn").addEventListener("click", function() {
    onUndo();
    toast.classList.remove("toast--show");
  });
  toast._t = setTimeout(function() { toast.classList.remove("toast--show"); }, TIQ.CONFIG.toastUndoDuration);
};

TIQ.formatCandidateCard = function(candidate, opts) {
  opts = opts || {};
  var statusClass = TIQ.statusClassMap[candidate.recordStatus] || "status-new";
  var flags = TIQ.getMissingFlags(candidate);
  var checked = (opts.compareSelection || []).indexOf(candidate.id) >= 0;
  var isSelected = candidate.id === opts.selectedId;

  var flagsHtml = flags.length
    ? flags.slice(0, 2).map(TIQ.formatFlagChip).join("")
    : '<span class="flag-chip flag-clear">[No Critical Missing Info]</span>';
  if (flags.length > 2) flagsHtml += '<span class="flag-more">+' + (flags.length - 2) + ' more</span>';

  var audioIndicator = "";
  if (candidate.audioNotes && candidate.audioNotes.length > 0) {
    audioIndicator = '<span class="card-audio-badge">' + candidate.audioNotes.length + ' audio</span>';
  }

  return '<article class="candidate-card' + (isSelected ? " selected" : "") + '" data-id="' + candidate.id + '" tabindex="0">' +
    '<div class="candidate-avatar" aria-label="' + TIQ.escapeAttr(candidate.firstName) + ' ' + TIQ.escapeAttr(candidate.lastName) + '">' + TIQ.initialsFor(candidate) + '</div>' +
    '<div class="candidate-main">' +
      '<div class="candidate-header">' +
        '<span class="candidate-name">' + TIQ.escapeHtml(candidate.firstName) + ' ' + TIQ.escapeHtml(candidate.lastName) + '</span>' +
        '<span class="candidate-id">' + TIQ.escapeHtml(candidate.id) + '</span>' +
        audioIndicator +
      '</div>' +
      '<div class="candidate-university">' + TIQ.escapeHtml(candidate.university) + ' &bull; ' + TIQ.escapeHtml(candidate.major) + '</div>' +
      '<div class="candidate-tags">' +
        candidate.skills.slice(0, 3).map(function(s) { return '<span>' + TIQ.escapeHtml(s) + '</span>'; }).join("") +
      '</div>' +
    '</div>' +
    '<div class="candidate-card__right">' +
      '<span class="status-chip ' + statusClass + '">' + TIQ.escapeHtml(candidate.recordStatus) + '</span>' +
      flagsHtml +
      (opts.showCompare !== false ? '<label class="compare-check" title="Add to comparison"><input type="checkbox" aria-label="Compare ' + TIQ.escapeAttr(candidate.firstName) + '" ' + (checked ? "checked" : "") + ' /> Compare</label>' : '') +
    '</div>' +
  '</article>';
};

TIQ.exportCsv = function(data, activeRecruiterId) {
  if (!data.length) { TIQ.showToast("No candidates to export."); return; }
  var header = ["ID", "Name", "University", "Major", "Status", "Missing Flags", "Recruiter ID", "Timestamp"];
  var rows = data.map(function(c) {
    return [c.id, c.firstName + " " + c.lastName, c.university, c.major, c.recordStatus,
      TIQ.getMissingFlags(c).map(function(f) { return f.label; }).join("; "),
      c.approverId || activeRecruiterId || "", c.approvalTimestamp || c.lastUpdated || ""];
  });
  var csv = [header].concat(rows).map(function(r) { return r.map(TIQ.escapeCsvCell).join(","); }).join("\n");
  TIQ.downloadCsv(TIQ.CONFIG.exportCsvFilename, csv);
  TIQ.showToast("Exported " + rows.length + " candidate records to CSV.");
};

TIQ.exportJson = function(data) {
  if (!data.length) { TIQ.showToast("No candidates to export."); return; }
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url; link.download = TIQ.CONFIG.exportJsonFilename;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
  TIQ.showToast("Exported " + data.length + " candidate records as JSON.");
};

/* ---- Audio Recorder ---- */
TIQ.AudioRecorder = (function() {
  function AudioRecorder() {
    this.mediaRecorder = null;
    this.chunks = [];
    this.stream = null;
    this.state = "idle";
    this.startTime = 0;
    this.timerInterval = null;
    this.onStateChange = null;
  }

  AudioRecorder.prototype.start = function() {
    var self = this;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      TIQ.showToast("Audio recording not supported in this browser.");
      return Promise.reject(new Error("Not supported"));
    }
    return navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }).then(function(stream) {
      self.stream = stream;
      self.chunks = [];
      self.mediaRecorder = new MediaRecorder(stream);
      self.mediaRecorder.ondataavailable = function(e) { if (e.data.size > 0) self.chunks.push(e.data); };
      self.mediaRecorder.start();
      self.state = "recording";
      self.startTime = Date.now();
      if (self.onStateChange) self.onStateChange("recording");
    }).catch(function(err) {
      TIQ.showToast("Microphone access denied.");
      return Promise.reject(err);
    });
  };

  AudioRecorder.prototype.stop = function() {
    var self = this;
    return new Promise(function(resolve) {
      if (!self.mediaRecorder || self.mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }
      self.mediaRecorder.onstop = function() {
        var blob = new Blob(self.chunks, { type: "audio/webm" });
        var duration = Math.round((Date.now() - self.startTime) / 1000);
        self.state = "idle";
        if (self.stream) { self.stream.getTracks().forEach(function(t) { t.stop(); }); }
        if (self.onStateChange) self.onStateChange("idle");
        resolve({ blob: blob, duration: duration, blobUrl: URL.createObjectURL(blob) });
      };
      self.mediaRecorder.stop();
    });
  };

  AudioRecorder.prototype.cancel = function() {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
      this.chunks = [];
    }
    if (this.stream) { this.stream.getTracks().forEach(function(t) { t.stop(); }); }
    this.state = "idle";
    if (this.onStateChange) this.onStateChange("idle");
  };

  AudioRecorder.prototype.getState = function() { return this.state; };

  return AudioRecorder;
})();

/* ---- Video Recorder (conversation capture) ---- */
TIQ.VideoRecorder = (function() {
  function VideoRecorder() {
    this.mediaRecorder = null;
    this.chunks = [];
    this.stream = null;
    this.state = "idle";
    this.startTime = 0;
    this.pausedAt = 0;
    this.pausedDuration = 0;
    this.mimeType = "";
    this.facingMode = "environment";
    this._requestToken = 0;
    this.onStateChange = null;
  }

  function pickMime() {
    if (typeof MediaRecorder === "undefined") return "";
    var candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
      "video/mp4;codecs=avc1"
    ];
    for (var i = 0; i < candidates.length; i++) {
      try {
        if (MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
      } catch (_) {}
    }
    return "";
  }

  function stopTracks(stream) {
    if (!stream) return;
    stream.getTracks().forEach(function(t) { try { t.stop(); } catch (_) {} });
  }

  /** Open camera for live preview without recording yet. */
  VideoRecorder.prototype.openCamera = function(opts) {
    var self = this;
    opts = opts || {};
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      TIQ.showToast("Camera not supported. Use localhost or HTTPS.");
      return Promise.reject(new Error("Camera API not available (use localhost or HTTPS)"));
    }
    var requestedFacing = opts.facingMode || self.facingMode || "environment";
    if (self.stream && self.stream.active && requestedFacing === self.facingMode) {
      if (self.onStateChange) self.onStateChange("stream", self.stream);
      return Promise.resolve(self.stream);
    }
    stopTracks(self.stream);
    self.stream = null;
    var requestToken = ++self._requestToken;

    var wantAudio = opts.audio !== false;
    var videoConstraints = opts.video === false ? false : {
      facingMode: { ideal: requestedFacing },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    };
    var audioConstraints = wantAudio ? {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    } : false;

    function request(constraints) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }

    // A conversation recording is only valid when both camera and microphone are available.
    return request({ video: videoConstraints || true, audio: audioConstraints }).then(function(stream) {
      if (requestToken !== self._requestToken) {
        stopTracks(stream);
        var aborted = new Error("Camera request cancelled");
        aborted.name = "AbortError";
        throw aborted;
      }
      if (!stream.getVideoTracks().length || (wantAudio && !stream.getAudioTracks().length)) {
        stopTracks(stream);
        throw new Error("Camera and microphone are both required to record.");
      }
      self.stream = stream;
      self.facingMode = requestedFacing;
      self.state = "preview";
      if (self.onStateChange) self.onStateChange("stream", stream);
      return stream;
    }).catch(function(err) {
      if (err && err.name === "AbortError") return Promise.reject(err);
      var msg = (err && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError"))
        ? "Camera permission denied — allow camera in the browser address bar."
        : (err && err.message) || "Camera failed";
      TIQ.showToast(msg);
      return Promise.reject(err);
    });
  };

  VideoRecorder.prototype.switchCamera = function() {
    if (this.state === "recording" || this.state === "paused") {
      return Promise.reject(new Error("Stop recording before switching cameras."));
    }
    this.facingMode = this.facingMode === "environment" ? "user" : "environment";
    stopTracks(this.stream);
    this.stream = null;
    this.state = "idle";
    return this.openCamera({ facingMode: this.facingMode });
  };

  VideoRecorder.prototype.start = function(opts) {
    var self = this;
    opts = opts || {};
    if (typeof MediaRecorder === "undefined") {
      TIQ.showToast("MediaRecorder not supported in this browser.");
      return Promise.reject(new Error("MediaRecorder not supported"));
    }
    if (self.state === "recording") {
      return Promise.resolve(self.stream);
    }

    var ensureStream = self.stream && self.stream.active
      ? Promise.resolve(self.stream)
      : self.openCamera(opts);

    return ensureStream.then(function(stream) {
      self.stream = stream;
      self.chunks = [];
      self.mimeType = pickMime();
      if (self.onStateChange) self.onStateChange("stream", stream);

      var recorder;
      try {
        recorder = self.mimeType
          ? new MediaRecorder(stream, { mimeType: self.mimeType })
          : new MediaRecorder(stream);
        self.mimeType = recorder.mimeType || self.mimeType || "video/webm";
      } catch (err) {
        TIQ.showToast("Could not start video recorder in this browser.");
        return Promise.reject(err);
      }

      self.mediaRecorder = recorder;
      self.mediaRecorder.ondataavailable = function(e) {
        if (e.data && e.data.size) self.chunks.push(e.data);
      };
      self.mediaRecorder.start(1000);
      self.state = "recording";
      self.startTime = Date.now();
      self.pausedAt = 0;
      self.pausedDuration = 0;
      if (self.onStateChange) self.onStateChange("recording", stream);
      return stream;
    }).catch(function(err) {
      var msg = (err && err.message) || "Camera failed";
      TIQ.showToast(msg);
      return Promise.reject(err);
    });
  };

  VideoRecorder.prototype.pause = function() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== "recording") return false;
    this.mediaRecorder.pause();
    this.pausedAt = Date.now();
    this.state = "paused";
    if (this.onStateChange) this.onStateChange("paused", this.stream);
    return true;
  };

  VideoRecorder.prototype.resume = function() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== "paused") return false;
    this.mediaRecorder.resume();
    if (this.pausedAt) this.pausedDuration += Date.now() - this.pausedAt;
    this.pausedAt = 0;
    this.state = "recording";
    if (this.onStateChange) this.onStateChange("recording", this.stream);
    return true;
  };

  VideoRecorder.prototype.getElapsedTime = function() {
    if (!this.startTime) return 0;
    var pausedNow = this.pausedAt ? Date.now() - this.pausedAt : 0;
    return Math.max(0, (Date.now() - this.startTime - this.pausedDuration - pausedNow) / 1000);
  };

  VideoRecorder.prototype.getElapsedSeconds = function() {
    return Math.floor(this.getElapsedTime());
  };

  VideoRecorder.prototype.stop = function() {
    var self = this;
    return new Promise(function(resolve) {
      if (!self.mediaRecorder || self.mediaRecorder.state === "inactive") {
        stopTracks(self.stream);
        self.stream = null;
        self.state = "idle";
        resolve(null);
        return;
      }
      self.mediaRecorder.onstop = function() {
        var type = self.mimeType || (self.chunks[0] && self.chunks[0].type) || "video/webm";
        var blob = new Blob(self.chunks, { type: type });
        var duration = self.getElapsedSeconds();
        self.state = "idle";
        stopTracks(self.stream);
        self.stream = null;
        self.mediaRecorder = null;
        if (self.onStateChange) self.onStateChange("idle", null);
        resolve({ blob: blob, duration: duration, blobUrl: URL.createObjectURL(blob) });
      };
      try {
        self.mediaRecorder.stop();
      } catch (_) {
        stopTracks(self.stream);
        self.stream = null;
        self.state = "idle";
        resolve(null);
      }
    });
  };

  VideoRecorder.prototype.cancel = function() {
    this._requestToken++;
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try { this.mediaRecorder.stop(); } catch (_) {}
      this.chunks = [];
    }
    stopTracks(this.stream);
    this.stream = null;
    this.mediaRecorder = null;
    this.state = "idle";
    if (this.onStateChange) this.onStateChange("idle", null);
  };

  VideoRecorder.prototype.getState = function() { return this.state; };
  VideoRecorder.prototype.isLive = function() { return !!(this.stream && this.stream.active); };
  VideoRecorder.prototype.getStream = function() { return this.stream; };

  return VideoRecorder;
})();

/* ---- Reusable Swipe Deck (from GitHub — stack swipe for Info Cards) ---- */
TIQ.SwipeDeck = function(opts) {
  opts = opts || {};
  this.rootSelector = opts.rootSelector || "#swipeDeckRoot";
  this.onLeft = opts.onLeft || function() {};
  this.onRight = opts.onRight || function() {};
  this.leftLabel = opts.leftLabel || "REJECT";
  this.rightLabel = opts.rightLabel || "ACCEPT";
  this.renderCard = opts.renderCard || function(item) { return String(item || ""); };
  this._items = [];
  this._front = null;
  this._busy = false;
};

TIQ.SwipeDeck.prototype.setItems = function(items) {
  this._items = Array.isArray(items) ? items.slice() : [];
  this.mount();
};

TIQ.SwipeDeck.prototype.mount = function(cardHtml) {
  var root = document.querySelector(this.rootSelector);
  if (!root) return;

  // Legacy single-card mount (string HTML) still supported
  if (typeof cardHtml === "string") {
    this._items = [{ __html: cardHtml }];
  }

  var items = this._items || [];
  if (!items.length) {
    root.innerHTML = "";
    this._front = null;
    return;
  }

  var stackSize = Math.min(3, items.length);
  var stack = "";
  for (var s = stackSize - 1; s >= 0; s--) {
    var item = items[s];
    var body = item && item.__html != null ? item.__html : this.renderCard(item, s);
    stack +=
      '<div class="swipe-deck__card swipe-deck__card--' + s + '"' + (s === 0 ? ' id="swipeDeckFront"' : "") + ">" +
        (s === 0
          ? '<div class="swipe-deck__overlay swipe-deck__overlay--left"><span>' + TIQ.escapeHtml(this.leftLabel) + "</span></div>" +
            '<div class="swipe-deck__overlay swipe-deck__overlay--right"><span>' + TIQ.escapeHtml(this.rightLabel) + "</span></div>"
          : "") +
        '<div class="swipe-deck__body">' + body + "</div>" +
      "</div>";
  }

  root.innerHTML = '<div class="swipe-deck" aria-live="polite">' + stack + "</div>";
  this._busy = false;
  this._bind();
};

TIQ.SwipeDeck.prototype._bind = function() {
  var self = this;
  var front = document.getElementById("swipeDeckFront");
  if (!front) return;
  this._front = front;
  var startX = 0, startY = 0, dx = 0, dragging = false, axis = null;

  function down(e) {
    if (self._busy) return;
    if (e.button && e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest("button, a, input, textarea, select")) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    axis = null;
    front.classList.add("swipe-deck__card--dragging");
    front.classList.remove("swipe-deck__card--spring");
    try { front.setPointerCapture(e.pointerId); } catch (_) {}
  }
  function move(e) {
    if (!dragging || self._busy) return;
    dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (axis !== "h") return;
    if (e.cancelable) e.preventDefault();
    front.style.transform = "translateX(" + dx + "px) rotate(" + (dx * 0.08) + "deg)";
    var progress = Math.min(Math.abs(dx) / 120, 1);
    var left = front.querySelector(".swipe-deck__overlay--left");
    var right = front.querySelector(".swipe-deck__overlay--right");
    if (left) left.style.opacity = dx < 0 ? progress : 0;
    if (right) right.style.opacity = dx > 0 ? progress : 0;
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    front.classList.remove("swipe-deck__card--dragging");
    if (axis === "h" && Math.abs(dx) > 100) self._exit(dx < 0 ? "left" : "right");
    else {
      front.classList.add("swipe-deck__card--spring");
      front.style.transform = "";
      var left = front.querySelector(".swipe-deck__overlay--left");
      var right = front.querySelector(".swipe-deck__overlay--right");
      if (left) left.style.opacity = 0;
      if (right) right.style.opacity = 0;
    }
  }
  front.addEventListener("pointerdown", down);
  front.addEventListener("pointermove", move);
  front.addEventListener("pointerup", up);
  front.addEventListener("pointercancel", up);
};

TIQ.SwipeDeck.prototype._exit = function(direction) {
  var self = this;
  if (self._busy) return;
  self._busy = true;
  var front = this._front;
  if (!front) {
    self._busy = false;
    if (direction === "left") self.onLeft(self._items[0]); else self.onRight(self._items[0]);
    return;
  }
  front.classList.add("swipe-deck__card--exit");
  front.style.transform = direction === "left"
    ? "translateX(-150%) rotate(-30deg)"
    : "translateX(150%) rotate(30deg)";
  front.style.opacity = "0";
  var current = self._items[0];
  setTimeout(function() {
    if (direction === "left") self.onLeft(current); else self.onRight(current);
  }, 280);
};

TIQ.SwipeDeck.prototype.trigger = function(direction) {
  this._exit(direction === "left" ? "left" : "right");
};

TIQ.SwipeDeck.prototype.current = function() {
  return (this._items && this._items[0]) || null;
};
