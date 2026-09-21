/* ============================================
   TalentIQ — Face Enrollment (Milestone 1)
   ============================================ */
window.TIQ = window.TIQ || {};
TIQ.face = TIQ.face || {};

TIQ.face.ANGLE_LABELS = {
  front: "Front (look at camera)",
  left: "Turn slightly left",
  right: "Turn slightly right",
  slight_up: "Tilt chin slightly up",
  slight_down: "Tilt chin slightly down"
};

TIQ.face.enrollment = {
  _stream: null,
  _pending: {}, // candidateId → { angle → { blob, previewUrl } } for intake before id exists
  _intakeDraftId: "__intake_draft__",

  renderWizardHtml: function(opts) {
    opts = opts || {};
    var candidateId = opts.candidateId || "";
    var mode = opts.mode || "inline"; // inline | panel
    var enrolled = opts.enrolled;
    var statusNote = enrolled
      ? '<p class="face-enroll__status face-enroll__status--ok">Face enrolled. You can re-capture any angle.</p>'
      : '<p class="face-enroll__status">Optional — capture all five angles for face recognition.</p>';

    var thumbs = TIQ.FACE_ANGLES.map(function(angle) {
      return '<div class="face-enroll__thumb" data-angle="' + angle + '">' +
        '<div class="face-enroll__thumb-preview" data-preview="' + angle + '"></div>' +
        '<span class="face-enroll__thumb-label">' + TIQ.escapeHtml(angle.replace("_", " ")) + '</span>' +
      '</div>';
    }).join("");

    return '<div class="face-enroll" id="faceEnrollRoot" data-candidate-id="' + TIQ.escapeAttr(candidateId) + '" data-mode="' + TIQ.escapeAttr(mode) + '">' +
      '<div class="face-enroll__title">Face Enrollment</div>' +
      statusNote +
      '<div class="face-enroll__progress" id="faceEnrollProgress">0 / 5 angles</div>' +
      '<div class="face-enroll__stage">' +
        '<video id="faceEnrollVideo" class="face-enroll__video" playsinline autoplay muted></video>' +
        '<canvas id="faceEnrollCanvas" class="face-enroll__canvas" hidden></canvas>' +
      '</div>' +
      '<div class="face-enroll__prompt" id="faceEnrollPrompt">Start camera to begin</div>' +
      '<div class="face-enroll__thumbs">' + thumbs + '</div>' +
      '<div class="face-enroll__actions">' +
        '<button type="button" class="secondary-button small-button" id="faceEnrollStartCam">Start Camera</button>' +
        '<button type="button" class="primary-button small-button" id="faceEnrollCapture" disabled>Capture Angle</button>' +
        '<button type="button" class="secondary-button small-button" id="faceEnrollSkip" hidden>Skip Face Enrollment</button>' +
        '<button type="button" class="secondary-button small-button" id="faceEnrollStopCam" disabled>Stop Camera</button>' +
      '</div>' +
      '<div class="face-enroll__error" id="faceEnrollError"></div>' +
    '</div>';
  },

  stopCamera: function() {
    if (this._stream) {
      this._stream.getTracks().forEach(function(t) { t.stop(); });
      this._stream = null;
    }
    var video = document.getElementById("faceEnrollVideo");
    if (video) video.srcObject = null;
  },

  _setError: function(msg) {
    var el = document.getElementById("faceEnrollError");
    if (el) el.textContent = msg || "";
  },

  _updateProgress: function(root) {
    var candidateId = root.dataset.candidateId || this._intakeDraftId;
    var count = 0;
    var pending = this._pending[candidateId] || {};
    TIQ.FACE_ANGLES.forEach(function(angle) {
      var preview = root.querySelector('[data-preview="' + angle + '"]');
      var hasPending = !!pending[angle];
      var c = candidateId !== TIQ.face.enrollment._intakeDraftId
        ? TIQ.state.candidates.find(function(x) { return x.id === candidateId; })
        : null;
      var fe = c ? TIQ.ensureFaceEnrollment(c) : null;
      var hasSaved = fe && fe.angles[angle] && fe.angles[angle].qualityOk;
      if (hasPending || hasSaved) {
        count++;
        if (preview) {
          preview.classList.add("face-enroll__thumb-preview--done");
          if (hasPending && pending[angle].previewUrl) {
            preview.style.backgroundImage = 'url(' + pending[angle].previewUrl + ')';
          }
        }
      }
    });
    var prog = document.getElementById("faceEnrollProgress");
    if (prog) prog.textContent = count + " / 5 angles";
    var prompt = document.getElementById("faceEnrollPrompt");
    var next = TIQ.FACE_ANGLES.find(function(a) {
      var p = pending[a];
      var c = candidateId !== TIQ.face.enrollment._intakeDraftId
        ? TIQ.state.candidates.find(function(x) { return x.id === candidateId; })
        : null;
      var fe = c ? TIQ.ensureFaceEnrollment(c) : null;
      var saved = fe && fe.angles[a] && fe.angles[a].qualityOk;
      return !p && !saved;
    });
    if (prompt) {
      if (!next) prompt.textContent = "All five angles captured.";
      else prompt.textContent = TIQ.face.ANGLE_LABELS[next] || next;
    }
    return { count: count, nextAngle: next };
  },

  _currentAngle: function(root) {
    return this._updateProgress(root).nextAngle || TIQ.FACE_ANGLES[0];
  },

  _captureBlob: function() {
    var video = document.getElementById("faceEnrollVideo");
    var canvas = document.getElementById("faceEnrollCanvas");
    if (!video || !canvas || !video.videoWidth) {
      return Promise.reject(new Error("Camera not ready"));
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    return new Promise(function(resolve, reject) {
      canvas.toBlob(function(blob) {
        if (!blob) reject(new Error("Failed to capture frame"));
        else resolve(blob);
      }, "image/jpeg", 0.92);
    });
  },

  enrollAngle: function(candidateId, angle, blob) {
    var form = new FormData();
    form.append("candidate_id", candidateId);
    form.append("angle", angle);
    form.append("image", blob, angle + ".jpg");

    return fetch("/api/face/enroll", { method: "POST", body: form })
      .then(function(res) {
        return res.json().then(function(body) {
          if (!res.ok) {
            var detail = (body && body.detail) || "Enrollment failed";
            if (Array.isArray(detail)) detail = detail.map(function(d) { return d.msg || d; }).join("; ");
            throw new Error(detail);
          }
          return body;
        });
      })
      .then(function(body) {
        var embeddingId = candidateId + ":" + angle;
        return TIQ.faceDB.put({
          candidateId: candidateId,
          angle: angle,
          embedding: body.embedding,
          thumbnailJpeg: blob,
          createdAt: TIQ.nowISO(),
          model: body.model || TIQ.FACE_MODEL
        }).then(function() {
          var c = TIQ.state.candidates.find(function(x) { return x.id === candidateId; });
          if (c) {
            TIQ.applyFaceAngleResult(c, angle, embeddingId, true);
            if (c.faceEnrollment.enrolled) {
              TIQ.addAuditEntry(c, "FACE_ENROLLED", "Completed 5-angle face enrollment (" + TIQ.FACE_MODEL + ")");
            } else {
              TIQ.addAuditEntry(c, "FACE_ANGLE_CAPTURED", "Captured face angle: " + angle);
            }
            TIQ.saveState();
          }
          return body;
        });
      });
  },

  /** Flush draft captures taken during intake before candidate id existed. */
  commitIntakeDraft: function(candidateId) {
    var self = this;
    var draft = self._pending[self._intakeDraftId];
    if (!draft) return Promise.resolve();

    var angles = Object.keys(draft);
    var chain = Promise.resolve();
    angles.forEach(function(angle) {
      chain = chain.then(function() {
        return self.enrollAngle(candidateId, angle, draft[angle].blob);
      });
    });
    return chain.then(function() {
      angles.forEach(function(angle) {
        if (draft[angle].previewUrl) URL.revokeObjectURL(draft[angle].previewUrl);
      });
      delete self._pending[self._intakeDraftId];
    });
  },

  init: function(opts) {
    opts = opts || {};
    var self = this;
    var root = document.getElementById("faceEnrollRoot");
    if (!root) return;

    var candidateId = opts.candidateId || root.dataset.candidateId || "";
    root.dataset.candidateId = candidateId;
    var isIntake = opts.mode === "intake" || root.dataset.mode === "intake";
    var skipBtn = document.getElementById("faceEnrollSkip");
    if (skipBtn) skipBtn.hidden = !isIntake;

    var startBtn = document.getElementById("faceEnrollStartCam");
    var captureBtn = document.getElementById("faceEnrollCapture");
    var stopBtn = document.getElementById("faceEnrollStopCam");

    self._updateProgress(root);

    // Load existing thumbnails from IDB when editing
    if (candidateId) {
      TIQ.faceDB.getAllForCandidate(candidateId).then(function(rows) {
        rows.forEach(function(row) {
          if (!row.thumbnailJpeg) return;
          var preview = root.querySelector('[data-preview="' + row.angle + '"]');
          if (preview) {
            var url = URL.createObjectURL(row.thumbnailJpeg);
            preview.style.backgroundImage = "url(" + url + ")";
            preview.classList.add("face-enroll__thumb-preview--done");
          }
        });
        self._updateProgress(root);
      }).catch(function() {});
    }

    if (startBtn) {
      startBtn.onclick = function() {
        self._setError("");
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
          .then(function(stream) {
            self.stopCamera();
            self._stream = stream;
            var video = document.getElementById("faceEnrollVideo");
            if (video) {
              video.srcObject = stream;
              video.play().catch(function() {});
            }
            if (captureBtn) captureBtn.disabled = false;
            if (stopBtn) stopBtn.disabled = false;
            self._updateProgress(root);
          })
          .catch(function(err) {
            self._setError("Camera access denied or unavailable. Face enrollment skipped.");
            if (TIQ.showToast) TIQ.showToast("Camera unavailable for face enrollment.");
          });
      };
    }

    if (stopBtn) {
      stopBtn.onclick = function() {
        self.stopCamera();
        if (captureBtn) captureBtn.disabled = true;
        stopBtn.disabled = true;
      };
    }

    if (skipBtn) {
      skipBtn.onclick = function() {
        self.stopCamera();
        delete self._pending[self._intakeDraftId];
        root.classList.add("face-enroll--skipped");
        self._setError("");
        if (TIQ.showToast) TIQ.showToast("Face enrollment skipped.");
      };
    }

    if (captureBtn) {
      captureBtn.onclick = function() {
        var angle = self._currentAngle(root);
        if (!angle) {
          self._setError("All angles already captured.");
          return;
        }
        self._setError("");
        captureBtn.disabled = true;
        self._captureBlob()
          .then(function(blob) {
            var storeId = candidateId || self._intakeDraftId;
            if (!candidateId) {
              // Intake draft: store locally until profile is created
              if (!self._pending[storeId]) self._pending[storeId] = {};
              if (self._pending[storeId][angle] && self._pending[storeId][angle].previewUrl) {
                URL.revokeObjectURL(self._pending[storeId][angle].previewUrl);
              }
              self._pending[storeId][angle] = {
                blob: blob,
                previewUrl: URL.createObjectURL(blob)
              };
              self._updateProgress(root);
              captureBtn.disabled = false;
              if (TIQ.showToast) TIQ.showToast("Captured " + angle.replace("_", " ") + " (will save on submit)");
              return null;
            }
            return self.enrollAngle(candidateId, angle, blob).then(function() {
              if (!self._pending[candidateId]) self._pending[candidateId] = {};
              self._pending[candidateId][angle] = {
                blob: blob,
                previewUrl: URL.createObjectURL(blob)
              };
              self._updateProgress(root);
              if (TIQ.showToast) {
                var c = TIQ.state.candidates.find(function(x) { return x.id === candidateId; });
                if (c && c.faceEnrollment && c.faceEnrollment.enrolled) {
                  TIQ.showToast("Face enrollment complete for " + c.firstName + ".");
                } else {
                  TIQ.showToast("Saved " + angle.replace("_", " ") + " angle.");
                }
              }
              if (typeof opts.onProgress === "function") opts.onProgress();
            });
          })
          .catch(function(err) {
            self._setError(err.message || "Capture failed");
            if (TIQ.showToast) TIQ.showToast(err.message || "Face capture failed");
          })
          .then(function() {
            captureBtn.disabled = !self._stream;
          });
      };
    }
  }
};
