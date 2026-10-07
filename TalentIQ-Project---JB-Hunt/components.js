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
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
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
