/* ============================================
   TalentIQ — View Renderers
   ============================================ */
window.TIQ = window.TIQ || {};

/* ---- Overview View ---- */
TIQ.views = TIQ.views || {};
TIQ.views.renderOverview = function() {
  var cfg = TIQ.CONFIG;
  var stats = cfg.overviewStats || {};
  var cands = TIQ.state.candidates;

  // Auto-compute stats if config is null
  var totalScanned = stats.totalScanned != null ? stats.totalScanned : cands.length;
  var interviewRequests = stats.interviewRequests != null ? stats.interviewRequests : cands.filter(function(c) { return c.recordStatus === "Interview Requested"; }).length;

  // Auto-compute major breakdown if config is null
  var majorData = cfg.majorBreakdown;
  if (!majorData) {
    var majorCounts = {};
    cands.forEach(function(c) { majorCounts[c.major] = (majorCounts[c.major] || 0) + 1; });
    var total = cands.length || 1;
    majorData = Object.keys(majorCounts).map(function(k) { return { label: k, percent: Math.round(majorCounts[k] / total * 100) }; });
  }

  // Auto-compute top universities if config is null
  var uniData = cfg.topUniversities;
  if (!uniData) {
    var uniCounts = {};
    cands.forEach(function(c) { uniCounts[c.university] = (uniCounts[c.university] || 0) + 1; });
    uniData = Object.keys(uniCounts).map(function(k) { return { name: k, count: uniCounts[k] }; });
    uniData.sort(function(a, b) { return b.count - a.count; });
    uniData = uniData.slice(0, 5);
  }

  // Auto-compute activity feed if config is null
  var feedData = cfg.activityFeed;
  if (!feedData) {
    feedData = [];
    cands.forEach(function(c) {
      if (c.auditLog && c.auditLog.length > 1) {
        var last = c.auditLog[c.auditLog.length - 1];
        var recruiterName = TIQ.recruiterName(last.recruiter_id) || "System";
        feedData.push({ recruiter: recruiterName, action: last.action.toLowerCase().replace(/_/g, " "), target: c.id, time: "just now", dotColor: "blue" });
      }
    });
    feedData = feedData.slice(0, 5);
  }

  return '<div class="view" id="view-overview">' +
    '<div class="view-header">' +
      '<div><span class="section-kicker">Event Dashboard</span><h1>Event Overview</h1></div>' +
    '</div>' +
    '<div class="overview-event-bar">' +
      '<div class="event-badge"><span class="event-badge__label">Event</span><span class="event-badge__value">' + TIQ.escapeHtml(cfg.eventName) + '</span></div>' +
      '<div class="event-badge"><span class="event-badge__label">Date</span><span class="event-badge__value">' + TIQ.escapeHtml(cfg.eventDate) + '</span></div>' +
      '<div class="event-badge"><span class="event-badge__label">Location</span><span class="event-badge__value">' + TIQ.escapeHtml(cfg.eventLocation) + '</span></div>' +
    '</div>' +
    '<div class="overview-stats">' +
      '<article class="stat-card stat-card--blue"><div class="stat-card__value">' + totalScanned + '</div><div class="stat-card__label">Total Scanned</div><div class="stat-card__sub">Candidate profiles collected</div></article>' +
      '<article class="stat-card stat-card--green"><div class="stat-card__value">' + interviewRequests + '</div><div class="stat-card__label">Interview Requests</div><div class="stat-card__sub">Next-day scheduling</div></article>' +
      '<article class="stat-card stat-card--amber"><div class="stat-card__value">' + (stats.avgReviewTime || "—") + '</div><div class="stat-card__label">Avg Review Time</div><div class="stat-card__sub">Per candidate review</div></article>' +
      '<article class="stat-card stat-card--purple"><div class="stat-card__value">' + (stats.dataCompleteness || "—") + '</div><div class="stat-card__label">Data Completeness</div><div class="stat-card__sub">Core fields captured</div></article>' +
    '</div>' +
    '<div class="overview-grid">' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Candidates by Major</span></div>' +
        '<div class="overview-bars">' +
          majorData.map(function(m) {
            return '<div class="hbar-row"><span class="hbar-label">' + TIQ.escapeHtml(m.label) + '</span><div class="hbar-track"><div class="hbar-fill" style="width:' + m.percent + '%"></div></div><span class="hbar-val">' + m.percent + '%</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Top Universities</span></div>' +
        '<div class="overview-list">' +
          uniData.map(function(u, i) {
            return '<div class="overview-list__item"><span class="overview-list__rank">' + (i + 1) + '</span><span class="overview-list__name">' + TIQ.escapeHtml(u.name) + '</span><span class="overview-list__count">' + u.count + '</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Today\'s Activity</span></div>' +
        '<div class="overview-activity">' +
          feedData.map(function(f) {
            return '<div class="activity-item"><span class="activity-dot activity-dot--' + f.dotColor + '"></span><div><strong>' + TIQ.escapeHtml(f.recruiter) + '</strong> ' + TIQ.escapeHtml(f.action) + ' ' + TIQ.escapeHtml(f.target) + '<span class="activity-time">' + TIQ.escapeHtml(f.time) + '</span></div></div>';
          }).join("") +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
};

/* ---- Candidate Intake View ---- */
TIQ.views.renderCandidateIntake = function() {
  var unis = TIQ.CONFIG.universities;
  var majors = TIQ.CONFIG.majors;

  var uniOptions = unis.map(function(u) { return '<option value="' + TIQ.escapeAttr(u) + '">' + TIQ.escapeHtml(u) + '</option>'; }).join("");
  var majorOptions = majors.map(function(m) { return '<option value="' + TIQ.escapeAttr(m) + '">' + TIQ.escapeHtml(m) + '</option>'; }).join("");

  return '<div class="view" id="view-intake">' +
    '<div class="view-header"><div><span class="section-kicker">Student Self-Service</span><h1>Candidate Intake</h1></div></div>' +
    '<div class="intake-form-wrap">' +
      '<form id="intakeForm" class="intake-form" novalidate>' +
        '<div class="intake-section intake-resume-banner">' +
          '<div class="intake-section__title">Start with your resume</div>' +
          '<p class="intake-resume-hint">Upload a PDF or DOCX — we fill any blanks we can find. Review everything before submitting.</p>' +
          '<label class="form-field resume-drop">' +
            '<span class="form-label">Resume (PDF or DOCX)</span>' +
            '<input name="resumeUpload" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />' +
          '</label>' +
          '<div class="resume-parse-status" id="resumeParseStatus" aria-live="polite"></div>' +
        '</div>' +
        '<div class="intake-section"><div class="intake-section__title">Required Information</div>' +
          '<div class="form-row"><label class="form-field"><span class="form-label">First Name *</span><input name="firstName" required placeholder="e.g. Maya" /></label>' +
          '<label class="form-field"><span class="form-label">Last Name *</span><input name="lastName" required placeholder="e.g. Williams" /></label></div>' +
          '<label class="form-field"><span class="form-label">Email *</span><input name="email" type="email" required placeholder="you@university.edu" /></label>' +
          '<div class="form-row"><label class="form-field"><span class="form-label">University *</span><select name="university" required><option value="">Select...</option>' + uniOptions + '</select></label>' +
          '<label class="form-field"><span class="form-label">Major *</span><select name="major" required><option value="">Select...</option>' + majorOptions + '</select></label></div>' +
          '<label class="form-field"><span class="form-label">Graduation Date *</span><input name="graduationDate" type="month" required /></label>' +
        '</div>' +
        '<div class="intake-section"><div class="intake-section__title">Optional Details</div>' +
          '<div class="form-row"><label class="form-field"><span class="form-label">GPA</span><input name="gpa" placeholder="e.g. 3.75" /></label>' +
          '<label class="form-field"><span class="form-label">Phone</span><input name="phone" type="tel" placeholder="555-0100" /></label></div>' +
          '<div class="form-field"><span class="form-label">Work Authorization</span>' +
            '<div class="radio-group">' +
              '<label class="radio-label"><input type="radio" name="workAuthorization" value="US Citizen" /> US Citizen</label>' +
              '<label class="radio-label"><input type="radio" name="workAuthorization" value="Require Sponsorship" /> Require Sponsorship</label>' +
              '<label class="radio-label"><input type="radio" name="workAuthorization" value="OPT/CPT" /> OPT/CPT</label>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="intake-section">' +
          (TIQ.face && TIQ.face.enrollment
            ? TIQ.face.enrollment.renderWizardHtml({ candidateId: "", mode: "intake", enrolled: false })
            : '') +
        '</div>' +
        '<button type="submit" class="primary-button intake-submit">Submit Profile</button>' +
        '<div class="intake-error" id="intakeError"></div>' +
        '<div class="intake-success" id="intakeSuccess" hidden role="status" aria-live="polite"></div>' +
      '</form>' +
    '</div>' +
  '</div>';
};

TIQ.views.initIntakeForm = function() {
  var form = document.getElementById("intakeForm");
  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var fd = new FormData(form);
    var firstName = (fd.get("firstName") || "").trim();
    var lastName = (fd.get("lastName") || "").trim();
    var email = (fd.get("email") || "").trim();
    var university = fd.get("university") || "";
    var major = fd.get("major") || "";
    var gradDate = fd.get("graduationDate") || "";
    var errEl = document.getElementById("intakeError");

    if (!firstName || !lastName || !email || !university || !major || !gradDate) {
      errEl.textContent = "Please fill in all required fields.";
      return;
    }
    if (email.indexOf("@") === -1) {
      errEl.textContent = "Please enter a valid email address.";
      return;
    }
    errEl.textContent = "";

    var id = TIQ.CONFIG.idPrefix + (TIQ.CONFIG.idBaseOffset + TIQ.state.candidates.length + 1);
    var resumeFile = fd.get("resumeUpload");
    var resumeSkills = [];
    if (form.dataset.resumeSkills) {
      resumeSkills = form.dataset.resumeSkills.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
    }
    var newCandidate = {
      id: id, firstName: firstName, lastName: lastName, email: email,
      phone: fd.get("phone") || "",
      university: university, degreeProgram: TIQ.CONFIG.defaultDegreeProgram,
      major: major, graduationDate: gradDate,
      gpa: fd.get("gpa") || "", resumeUpload: resumeFile ? resumeFile.name : "",
      function: "General", workLocations: [],
      workAuthorization: fd.get("workAuthorization") || "",
      skills: resumeSkills.slice(), keySkills: resumeSkills.slice(0, 6), areasDiscussed: [],
      notes: "", summary: "",
      traceability: resumeSkills.length
        ? ["Skills suggested from resume — pending Info Cards review"]
        : [],
      recordStatus: "New", approvalStatus: "Pending",
      approverId: "", approvalTimestamp: "",
      followUpRequestedBy: "", followUpTimestamp: "",
      lastUpdated: TIQ.todayISO(), created_at: TIQ.nowISO(),
      priority: "Normal",
      audioNotes: [],
      faceEnrollment: TIQ.defaultFaceEnrollment(),
      auditLog: [{ action: "CREATED", recruiter_id: TIQ.state.activeRecruiterId, timestamp: TIQ.nowISO(), time_to_complete: 0, detail: "Candidate intake form submitted" }],
      reviewTimeMs: 0, noteEdits: 0
    };

    TIQ.state.candidates.push(newCandidate);
    TIQ.saveState();

    if (TIQ.views._lastResumeParse && TIQ.pipeline && TIQ.pipeline.enqueueResumeProposals) {
      var rp = TIQ.views._lastResumeParse;
      var n = TIQ.pipeline.enqueueResumeProposals(
        newCandidate.id, rp.fields || {}, rp.confidence || {},
        (rp.filename || (resumeFile && resumeFile.name) || "")
      );
      if (n) TIQ.showToast(n + " resume field(s) queued for Info Cards.");
      TIQ.views._lastResumeParse = null;
    }

    var finish = function() {
      if (TIQ.face && TIQ.face.enrollment) TIQ.face.enrollment.stopCamera();
      var successEl = document.getElementById("intakeSuccess");
      var submitBtn = form.querySelector(".intake-submit");
      if (errEl) errEl.textContent = "";
      form.reset();
      if (successEl) {
        successEl.hidden = false;
        successEl.textContent = "Submitted profile";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitted profile";
      }
      TIQ.showToast("Submitted profile");
      setTimeout(function() {
        TIQ.router.navigateTo("recruiter-capture");
      }, 1200);
    };

    if (TIQ.face && TIQ.face.enrollment && TIQ.face.enrollment._pending[TIQ.face.enrollment._intakeDraftId]) {
      TIQ.face.enrollment.commitIntakeDraft(id).then(finish).catch(function(err) {
        TIQ.showToast("Submitted profile (face enroll partial: " + (err.message || "error") + ")");
        finish();
      });
    } else {
      finish();
    }
  });

  // Resume parse → autofill
  TIQ.views._lastResumeParse = null;
  var resumeInput = form.querySelector('input[name="resumeUpload"]');
  var statusEl = document.getElementById("resumeParseStatus");
  function setResumeStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "resume-parse-status" + (kind ? " resume-parse-status--" + kind : "");
  }
  if (resumeInput) {
    resumeInput.addEventListener("change", function() {
      var file = resumeInput.files && resumeInput.files[0];
      if (!file) {
        setResumeStatus("");
        return;
      }
      if (!TIQ.pipeline || !TIQ.pipeline.parseResume) {
        setResumeStatus("Resume parser unavailable — start the ML server.", "error");
        TIQ.showToast("Resume parser unavailable (start ML server).");
        return;
      }
      setResumeStatus("Parsing " + file.name + "…", "busy");
      TIQ.showToast("Parsing resume...");
      TIQ.pipeline.parseResume(file).then(function(body) {
        TIQ.views._lastResumeParse = body;
        var filled = TIQ.pipeline.autofillIntake(body.fields || {}, body.confidence || {});
        var n = (filled && filled.count) || Object.keys(body.fields || {}).length;
        var labels = (filled && filled.labels) || Object.keys(body.fields || {});
        setResumeStatus(
          n
            ? "Filled " + n + " field" + (n === 1 ? "" : "s") + ": " + labels.join(", ") + ". Review highlighted fields before submit."
            : "Resume read, but no matching fields found. Fill the form manually.",
          n ? "ok" : "warn"
        );
        TIQ.showToast(n ? "Resume fields filled — review before submit." : "No fields extracted from resume.");
      }).catch(function(err) {
        setResumeStatus(err.message || "Resume parse failed", "error");
        TIQ.showToast(err.message || "Resume parse failed");
      });
    });
  }

  if (TIQ.face && TIQ.face.enrollment) {
    TIQ.face.enrollment.init({ mode: "intake", candidateId: "" });
  }
};

/* ---- Recruiter Capture View ---- */
TIQ.views._captureIndex = 0;
TIQ.views._captureRecorder = null;
TIQ.views._swipeState = null;

TIQ.views._buildCardHtml = function(c) {
  var flags = TIQ.getMissingFlags(c);
  var flagsHtml = flags.length
    ? flags.map(TIQ.formatFlagChip).join("")
    : '<span class="flag-chip flag-clear">[No Critical Missing Info]</span>';
  var pending = TIQ.getPendingProposalsFor ? TIQ.getPendingProposalsFor(c.id) : [];
  var pendingCount = pending.length;
  var seen = (c.cameraSession && Array.isArray(c.cameraSession.seenWith)) ? c.cameraSession.seenWith : [];
  var seenHtml = seen.length
    ? '<div class="capture-card__seen"><span class="capture-card__seen-label">On camera</span>' +
      seen.slice(0, 4).map(function(n) { return '<span class="capture-card__seen-chip">' + TIQ.escapeHtml(n) + '</span>'; }).join("") +
      '</div>'
    : '';
  var proposedHtml = "";
  if (pendingCount) {
    proposedHtml =
      '<button type="button" class="capture-card__pending" data-open-info-cards="' + TIQ.escapeAttr(c.id) + '" title="Swipe to confirm">' +
        pendingCount + ' spoken detail' + (pendingCount === 1 ? '' : 's') + ' — tap to swipe' +
      '</button>' +
      '<div class="capture-card__proposals">' +
        pending.slice(0, 4).map(function(p) {
          return '<div class="capture-card__proposal">' +
            '<span class="capture-card__proposal-label">' + TIQ.escapeHtml(p.label) + '</span>' +
            '<span class="capture-card__proposal-value">' + TIQ.escapeHtml(String(p.value)) + '</span>' +
          '</div>';
        }).join("") +
        (pendingCount > 4 ? '<div class="capture-card__proposal-more">+' + (pendingCount - 4) + ' more</div>' : '') +
      '</div>';
  }

  // Prefer confirmed profile values; fall back to pending spoken proposals for display
  function displayField(field, current) {
    if (current) return current;
    var hit = pending.find(function(p) { return p.field === field; });
    return hit ? hit.value : "";
  }
  var university = displayField("university", c.university);
  var major = displayField("major", c.major);
  var grad = displayField("graduationDate", c.graduationDate);
  var gpa = displayField("gpa", c.gpa);
  var auth = displayField("workAuthorization", c.workAuthorization);
  var skills = (c.skills && c.skills.length) ? c.skills.slice(0, 5) : [];
  if (!skills.length) {
    var skillProp = pending.find(function(p) { return p.field === "skills"; });
    if (skillProp) skills = String(skillProp.value).split(/[,;]+/).map(function(s) { return s.trim(); }).filter(Boolean).slice(0, 5);
  }

  return '<div class="capture-card__top">' +
    '<div class="capture-avatar">' + TIQ.initialsFor(c) + '</div>' +
    '<div class="capture-card__identity">' +
      '<div class="capture-card__name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</div>' +
      '<div class="capture-card__id">' + TIQ.escapeHtml(c.id) + '</div>' +
    '</div>' +
    '<span class="status-chip ' + (TIQ.statusClassMap[c.recordStatus] || "status-new") + '">' + TIQ.escapeHtml(c.recordStatus) + '</span>' +
  '</div>' +
  '<div class="capture-card__info">' +
    '<div class="capture-card__edu">' + TIQ.escapeHtml(university || "—") + ' &bull; ' + TIQ.escapeHtml(major || "—") + '</div>' +
    '<div class="capture-card__grad">Grad: ' + TIQ.escapeHtml(grad || "—") + '</div>' +
  '</div>' +
  (skills.length ? '<div class="capture-card__skills">' + skills.map(function(s) { return '<span>' + TIQ.escapeHtml(s) + '</span>'; }).join("") + '</div>' : '') +
  '<div class="capture-card__quick">' +
    '<span>GPA: ' + TIQ.escapeHtml(gpa || "—") + '</span>' +
    '<span>Auth: ' + TIQ.escapeHtml(auth || "—") + '</span>' +
    '<span>Loc: ' + (c.workLocations && c.workLocations.length ? TIQ.escapeHtml(c.workLocations[0]) : "—") + '</span>' +
  '</div>' +
  seenHtml +
  proposedHtml +
  '<div class="capture-card__flags">' + flagsHtml + '</div>';
};

TIQ.views.renderRecruiterCapture = function() {
  var cands = TIQ.state.candidates;
  if (!cands.length) return '<div class="view" id="view-capture"><div class="view-header"><h1>No candidates to capture</h1></div></div>';

  var idx = TIQ.views._captureIndex;
  if (idx >= cands.length) {
    return TIQ.views._renderCaptureComplete(cands);
  }

  var c = cands[idx];

  var recruiterName = TIQ.recruiterName(TIQ.state.activeRecruiterId) || "Not selected";

  var stackHtml = '<div class="capture-stack">';
  var stackSize = Math.min(3, cands.length - idx);
  for (var s = stackSize - 1; s >= 0; s--) {
    var sc = cands[idx + s];
    stackHtml += '<div class="capture-card capture-card--' + s + '" data-stack="' + s + '">' +
      TIQ.views._buildCardHtml(sc) +
      (s === 0 ? '<div class="capture-overlay capture-overlay--left"><span class="capture-overlay__label">REVIEWED</span></div>' +
       '<div class="capture-overlay capture-overlay--right"><span class="capture-overlay__label">CONTACT</span></div>' +
       '<div class="capture-card__swipe-hint">← Swipe left = Reviewed &nbsp;|&nbsp; Swipe right = Contact →</div>' : '') +
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

  return '<div class="view" id="view-capture">' +
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
          '<p>Select people so face matching can name them while they move. Spoken details become Info Cards you swipe to confirm.</p>' +
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
    '<div class="capture-quick-info">' +
      '<div class="capture-section-title">Add detail → Info Cards</div>' +
      '<p class="capture-audio__hint">Type something they said. It becomes a swipe card for this person.</p>' +
      '<div class="capture-quick-info__row">' +
        '<select id="captureQuickField" class="capture-quick-info__select" aria-label="Field">' +
          '<option value="major">Major</option>' +
          '<option value="university">University</option>' +
          '<option value="graduationDate">Graduation</option>' +
          '<option value="gpa">GPA</option>' +
          '<option value="skills">Skills</option>' +
          '<option value="phone">Phone</option>' +
          '<option value="email">Email</option>' +
          '<option value="workAuthorization">Work Auth</option>' +
        '</select>' +
        '<input id="captureQuickValue" class="capture-quick-info__input" type="text" placeholder="e.g. Computer Science" autocomplete="off" />' +
        '<button type="button" class="primary-button small-button" id="captureQuickAddBtn">Add card</button>' +
      '</div>' +
    '</div>' +
    '<div class="capture-audio">' +
      '<div class="capture-section-title">Voice Notes</div>' +
      '<p class="capture-audio__hint">Works in a noisy booth — speech is filtered, transcribed, and turned into Info Cards you swipe to confirm.</p>' +
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

  return '<div class="view" id="view-capture">' +
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
        '<button class="secondary-button" id="captureBackToOverview">Back to Overview</button>' +
      '</div>' +
    '</div>' +
  '</div>';
};

TIQ.views.initCaptureEvents = function() {
  var container = document.getElementById("view-capture");
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
      TIQ.views._captureSkip();
    } else if (e.target.closest("[data-open-info-cards]")) {
      var openBtn = e.target.closest("[data-open-info-cards]");
      e.preventDefault();
      e.stopPropagation();
      TIQ.views._infoFilterCandidateId = openBtn.getAttribute("data-open-info-cards") || "";
      TIQ.router.navigateTo("info-review");
    } else if (reviewBtn) {
      TIQ.views._animateSwipeOut("left");
    } else if (followBtn) {
      TIQ.views._animateSwipeOut("right");
    } else if (deleteBtn) {
      var delIdx = parseInt(deleteBtn.dataset.audioIndex);
      var c = TIQ.state.candidates[TIQ.views._captureIndex];
      if (c && c.audioNotes[delIdx]) {
        c.audioNotes.splice(delIdx, 1);
        TIQ.addAuditEntry(c, "AUDIO_ADDED", "Audio recording deleted");
        TIQ.saveState();
        TIQ.views._rerenderCapture();
      }
    } else if (startOverBtn) {
      TIQ.views._captureIndex = 0;
      TIQ.views._rerenderCapture();
    } else if (backBtn) {
      TIQ.router.navigateTo("overview");
    } else if (categoryBtn) {
      var status = categoryBtn.dataset.viewStatus;
      TIQ.views._aiReviewStatus = status;
      TIQ.router.navigateTo("ai-review");
    }
  });

  var notes = document.getElementById("captureNotes");
  if (notes) {
    notes.addEventListener("change", function() {
      var c = TIQ.state.candidates[TIQ.views._captureIndex];
      if (c) { c.notes = notes.value; TIQ.addAuditEntry(c, "NOTES_UPDATED", "Notes updated"); TIQ.saveState(); }
    });
  }

  var quickAddBtn = document.getElementById("captureQuickAddBtn");
  var quickField = document.getElementById("captureQuickField");
  var quickValue = document.getElementById("captureQuickValue");
  function submitQuickInfoCard() {
    var c = TIQ.state.candidates[TIQ.views._captureIndex];
    if (!c || !quickField || !quickValue) return;
    var field = quickField.value;
    var value = String(quickValue.value || "").trim();
    if (value.length < 1) {
      TIQ.showToast("Type a value to add an Info Card.");
      return;
    }
    var label = (TIQ.FIELD_LABELS && TIQ.FIELD_LABELS[field]) || field;
    var prop = TIQ.createProposal({
      candidateId: c.id,
      field: field,
      label: label,
      value: value,
      source: "conversation",
      sourceRef: {
        quote: value,
        speakerName: (c.firstName + " " + c.lastName).trim(),
        recruiterEntered: true
      }
    });
    if (!prop) {
      TIQ.showToast("That detail is already queued.");
      return;
    }
    quickValue.value = "";
    TIQ.showToast(label + " queued — swipe Info Cards to confirm.");
    TIQ.views._rerenderCapture();
  }
  if (quickAddBtn) quickAddBtn.addEventListener("click", submitQuickInfoCard);
  if (quickValue) {
    quickValue.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitQuickInfoCard();
      }
    });
  }

  var recordBtn = document.getElementById("audioRecordBtn");
  var stopBtn = document.getElementById("audioStopBtn");
  if (recordBtn && stopBtn) {
    if (!TIQ.views._captureRecorder) TIQ.views._captureRecorder = new TIQ.AudioRecorder();
    var rec = TIQ.views._captureRecorder;
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
        var c = TIQ.state.candidates[TIQ.views._captureIndex];
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
          TIQ.views._rerenderCapture();
          if (proposalCount > 0) {
            TIQ.views._infoFilterCandidateId = c.id;
            TIQ.showToast(proposalCount + " detail" + (proposalCount === 1 ? "" : "s") +
              " from voice note — swipe Info Cards to save.");
            setTimeout(function() { TIQ.router.navigateTo("info-review"); }, 400);
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
    var currentCandidate = TIQ.state.candidates[TIQ.views._captureIndex];
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
              : ("Tracking " + named + " people — details go to their Info Cards");
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
        options.push({
          kind: "pick",
          id: c.id,
          name: (c.firstName + " " + c.lastName).trim(),
          meta: [c.id, c.university, c.major].filter(Boolean).join(" · ")
        });
      });
      if (showAdd) {
        options.push({
          kind: "add",
          id: null,
          name: query,
          meta: "Not in database — create new card"
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
          '<small>' + TIQ.escapeHtml(opt.meta) + '</small></button>';
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
      var insertAt = Math.min(TIQ.views._captureIndex + 1, TIQ.state.candidates.length);
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
        if (nextIdx >= 0) TIQ.views._captureIndex = nextIdx;
      }
    }

    function renderParticipants() {
      if (liveFaces.length) updateBoothCountUi();
      else if (vPeopleBtn) vPeopleBtn.textContent = participants.length + " " + (participants.length === 1 ? "person" : "people");
      if (vParticipantList) {
        vParticipantList.innerHTML = participants.map(function(person, index) {
          var badge = person.candidateId ? "Candidate" : "Guest";
          return '<div class="recording-people__person"><div><strong>' + TIQ.escapeHtml(person.name) + '</strong><small>' + badge + '</small></div>' +
            (index ? '<button type="button" data-remove-speaker="' + TIQ.escapeAttr(person.speakerKey) + '" aria-label="Remove ' + TIQ.escapeAttr(person.name) + '">&times;</button>' : '') + '</div>';
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
        var c = TIQ.state.candidates[TIQ.views._captureIndex];
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
        // Ensure every named booth face is on the roster for attribution → Info Cards
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
          setStatus("", proposalCount ? "Spoken details ready for Info Cards" : "Recording processed");
          TIQ.showToast(proposalCount
            ? (proposalCount + " detail" + (proposalCount === 1 ? "" : "s") + " from conversation — swipe Info Cards to save.")
            : "People named. Recording saved to cards.");
          setTimeout(function() {
            setNavigationGuard(false);
            stopLiveFaceNaming();
            stopMeter();
            document.body.classList.remove("recording-screen-open");
            if (proposalCount) {
              TIQ.views._infoFilterCandidateId = focusCandidate.id;
              TIQ.router.navigateTo("info-review");
            } else {
              TIQ.router.navigateTo("recruiter-capture");
            }
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
              TIQ.router.navigateTo("candidate-review");
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
      TIQ.router.navigateTo("overview");
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
    TIQ.views._applySwipeAction(direction);
  }
  frontCard.addEventListener("transitionend", onEnd);
  setTimeout(onEnd, 350);
};

TIQ.views._springBack = function() {
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

TIQ.views._captureKeyHandler = function(e) {
  var view = document.getElementById("view-capture");
  if (!view || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
  if (document.getElementById("captureVideoPanel")) return;
  if (TIQ.views._captureIndex >= TIQ.state.candidates.length) return;
  if (e.key === "ArrowLeft") { TIQ.views._animateSwipeOut("left"); }
  else if (e.key === "ArrowRight") { TIQ.views._animateSwipeOut("right"); }
  else if (e.key === " ") {
    e.preventDefault();
    TIQ.views._captureSkip();
  }
};

TIQ.views._setCaptureStatus = function(status) {
  var c = TIQ.state.candidates[TIQ.views._captureIndex];
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
    TIQ.views._rerenderCapture();
  };

  TIQ.showUndoToast(c.firstName + " marked as " + status, undoAction);
  TIQ.views._captureIndex++;
  TIQ.views._rerenderCapture();
};

TIQ.views._rerenderCapture = function() {
  document.removeEventListener("keydown", TIQ.views._captureKeyHandler);
  if (TIQ.views._recordingCleanup) TIQ.views._recordingCleanup();
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
    '<div class="view-header"><div><span class="section-kicker">End-of-Day Triage</span><h1>AI Summary & Review</h1></div></div>' +
    '<div class="ai-filter-bar">' +
      '<select id="aiStatusFilter"><option value="all">All Statuses</option>' + TIQ.CONFIG.statuses.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join("") + '</select>' +
      '<select id="aiFuncFilter"><option value="all">All Functions</option>' + TIQ.CONFIG.functions.map(function(f) { return '<option value="' + f + '">' + f + '</option>'; }).join("") + '</select>' +
      '<select id="aiPriorityFilter"><option value="all">All Priority</option>' + TIQ.CONFIG.priorities.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join("") + '</select>' +
      '<div class="search-inline"><svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.2-4.2" fill="none" stroke="currentColor" stroke-width="2"/></svg><input id="aiSearch" type="search" placeholder="Search..." value="' + TIQ.escapeAttr(TIQ.views._aiReviewSearch) + '" /></div>' +
      '<button class="secondary-button small-button" id="aiExportCsv">Export CSV</button>' +
      '<button class="secondary-button small-button" id="aiExportJson">Export JSON</button>' +
    '</div>' +
    '<div class="ai-layout">' +
      '<div class="ai-list-panel"><div class="ai-list-count">' + filtered.length + ' candidates</div><div class="ai-list" id="aiCandidateList">' + listHtml + '</div></div>' +
      '<div class="ai-detail-panel" id="aiDetailPanel">' + detailHtml + '</div>' +
    '</div>' +
    '<div id="aiCompareBar" class="compare-bar" hidden></div>' +
  '</div>';
};

TIQ.views._getFilteredCandidates = function() {
  var s = TIQ.views._aiReviewSearch.toLowerCase();
  return TIQ.state.candidates.filter(function(c) {
    var matchSearch = !s || [c.firstName, c.lastName, c.major, c.function, c.university, c.skills.join(" "), c.notes, c.areasDiscussed.join(" "), TIQ.getMissingFlags(c).map(function(f) { return f.label; }).join(" ")].some(function(v) { return String(v).toLowerCase().indexOf(s) >= 0; });
    var matchStatus = TIQ.views._aiReviewStatus === "all" || c.recordStatus === TIQ.views._aiReviewStatus;
    var matchFunc = TIQ.views._aiReviewFunc === "all" || c.function === TIQ.views._aiReviewFunc;
    var matchPri = TIQ.views._aiReviewPriority === "all" || c.priority === TIQ.views._aiReviewPriority;
    return matchSearch && matchStatus && matchFunc && matchPri;
  });
};

TIQ.views._renderDetailPanel = function(c) {
  var flags = TIQ.getMissingFlags(c);
  var flagsHtml = flags.length ? flags.map(TIQ.formatFlagChip).join("") : '<span class="flag-chip flag-clear">[No Critical Missing Info]</span>';
  var audioHtml = "";
  if (c.audioNotes && c.audioNotes.length) {
    audioHtml = '<section class="ai-section"><div class="section-title"><span class="section-kicker">Voice Notes</span></div>' +
      c.audioNotes.map(function(a, i) { return '<div class="audio-player-row"><span class="audio-label">Recording ' + (i+1) + ' (' + a.duration + 's)</span><audio controls src="' + a.blobUrl + '" class="audio-ctrl"></audio></div>'; }).join("") + '</section>';
  }

  var candidateRecordings = (TIQ.state.recordings || []).filter(function(recording) { return recording.candidateId === c.id; });
  var conversationHtml = candidateRecordings.length ? '<section class="ai-section"><div class="section-title"><span class="section-kicker">Conversation Transcript</span></div>' +
    candidateRecordings.slice().reverse().map(function(recording) {
      if (recording.status === "processing_failed") {
        return '<div class="conversation-transcript conversation-transcript--pending"><strong>Recording saved</strong><span>Speaker processing is pending.</span></div>';
      }
      var utterances = recording.utterances || [];
      if (!utterances.length) return '';
      return '<div class="conversation-transcript">' + utterances.map(function(utterance) {
        var seconds = Math.max(0, Math.floor(Number(utterance.t0) || 0));
        var timestamp = String(Math.floor(seconds / 60)).padStart(2, "0") + ':' + String(seconds % 60).padStart(2, "0");
        var speaker = utterance.speakerName || "Unrecognized speaker";
        return '<div class="conversation-line' + (utterance.overlappingSpeech ? ' conversation-line--overlap' : '') + '">' +
          '<div class="conversation-line__meta"><span>' + TIQ.escapeHtml(speaker) + '</span><time>' + timestamp + '</time></div>' +
          '<p>' + TIQ.escapeHtml(utterance.text || "") + '</p>' +
          (utterance.overlappingSpeech ? '<small>Overlapping speech — verify attribution</small>' : '') +
        '</div>';
      }).join("") + '</div>';
    }).join("") + '</section>' : '';

  var traceHtml = (c.traceability || []).map(function(item) {
    var claim = item.split("—")[0].trim();
    return '<button type="button" class="trace-item trace-link" data-claim="' + TIQ.escapeAttr(claim) + '">' + TIQ.escapeHtml(item) + '</button>';
  }).join("");

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
      '<button class="secondary-button small-button" data-action="face-enroll" type="button">' +
        ((c.faceEnrollment && c.faceEnrollment.enrolled) ? "Re-enroll Face" : "Enroll Face") +
      '</button>' +
    '</div>' +
    (function() {
      var fe = TIQ.ensureFaceEnrollment(c);
      var faceBadge = fe.enrolled
        ? '<span class="face-badge face-badge--ok">Face enrolled</span>'
        : '<span class="face-badge">Face not enrolled</span>';
      return '<section class="ai-section" id="faceEnrollSection"><div class="section-title"><span class="section-kicker">Face Enrollment</span> ' + faceBadge + '</div>' +
        '<div id="faceEnrollPanelHost" hidden></div></section>';
    })() +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">AI-Generated Snapshot</span></div><div class="snapshot-card"><p>' + TIQ.escapeHtml(c.summary) + '</p></div></section>' +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Missing Information Flags</span></div><div class="flag-list">' + flagsHtml + '</div></section>' +
    (traceHtml ? '<section class="ai-section"><div class="section-title"><span class="section-kicker">Source Traceability</span></div><div class="trace-list" id="aiTraceList">' + traceHtml + '</div></section>' : '') +
    audioHtml +
    conversationHtml +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Recruiter Notes</span></div><textarea id="aiNotes" class="notes-card notes-textarea" rows="4">' + TIQ.escapeHtml(c.notes) + '</textarea></section>' +
    '<section class="ai-section"><div class="section-title row-title"><span class="section-kicker">Record Integrity</span></div><div class="integrity-panel" id="aiIntegrity"></div></section>' +
  '</div>';
};

TIQ.views._renderAiIntegrity = function(c) {
  var fields = ["workAuthorization", "graduationDate", "gpa", "phone", "resumeUpload", "workLocations"];
  var captured = fields.filter(function(f) { var v = c[f]; return Array.isArray(v) ? v.length > 0 : Boolean(v); }).length;
  var flags = TIQ.getMissingFlags(c);
  var el = document.getElementById("aiIntegrity");
  if (!el) return;
  el.innerHTML = '<div class="integrity-row"><span class="integrity-label">Core fields captured</span><span class="integrity-meter"><span class="integrity-bar" style="width:' + Math.round((captured / fields.length) * 100) + '%"></span></span><span class="integrity-count">' + captured + ' / ' + fields.length + '</span></div>' +
    (flags.length ? '<p class="integrity-note">' + flags.length + ' missing field' + (flags.length > 1 ? 's' : '') + ' — flagged for review.</p>' : '<p class="integrity-note integrity-note--ok">All core fields captured.</p>');
};

TIQ.views.initAIReviewEvents = function() {
  var container = document.getElementById("view-ai-review");
  if (!container) return;

  var rerender = function() {
    var existing = document.getElementById("view-ai-review");
    if (existing) existing.outerHTML = TIQ.views.renderAIReview();
    TIQ.views.initAIReviewEvents();
  };

  document.getElementById("aiStatusFilter").addEventListener("change", function(e) { TIQ.views._aiReviewStatus = e.target.value; rerender(); });
  document.getElementById("aiFuncFilter").addEventListener("change", function(e) { TIQ.views._aiReviewFunc = e.target.value; rerender(); });
  document.getElementById("aiPriorityFilter").addEventListener("change", function(e) { TIQ.views._aiReviewPriority = e.target.value; rerender(); });
  document.getElementById("aiSearch").addEventListener("input", function(e) { TIQ.views._aiReviewSearch = e.target.value; rerender(); });
  document.getElementById("aiExportCsv").addEventListener("click", function() { TIQ.exportCsv(TIQ.views._getFilteredCandidates(), TIQ.state.activeRecruiterId); });
  document.getElementById("aiExportJson").addEventListener("click", function() { TIQ.exportJson(TIQ.views._getFilteredCandidates()); });

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
        if (actionBtn.dataset.action === "approve") {
          if (!TIQ.state.activeRecruiterId) { TIQ.showToast("Select a recruiter first."); return; }
          c.recordStatus = "Reviewed"; c.approvalStatus = "Approved"; c.approverId = TIQ.state.activeRecruiterId; c.approvalTimestamp = TIQ.nowISO();
          TIQ.addAuditEntry(c, "APPROVED", "Approved via AI Review");
          TIQ.saveState(); TIQ.showToast(c.firstName + " approved."); rerender();
        } else if (actionBtn.dataset.action === "follow") {
          if (!TIQ.state.activeRecruiterId) { TIQ.showToast("Select a recruiter first."); return; }
          c.recordStatus = "Follow-Up"; c.priority = "High"; c.followUpRequestedBy = TIQ.state.activeRecruiterId; c.followUpTimestamp = TIQ.nowISO();
          TIQ.addAuditEntry(c, "FOLLOW_UP", "Follow-up requested");
          TIQ.saveState(); TIQ.showToast(c.firstName + " flagged for follow-up."); rerender();
        } else if (actionBtn.dataset.action === "face-enroll") {
          TIQ.views._openFaceEnrollPanel(c.id, rerender);
        }
      }
      if (traceBtn) {
        TIQ.views._highlightTrace(traceBtn.dataset.claim, traceBtn);
      }
    });

    var notes = detailPanel.querySelector("#aiNotes");
    if (notes) {
      notes.addEventListener("change", function() {
        var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._aiReviewSelected; });
        if (c) { c.notes = notes.value; TIQ.addAuditEntry(c, "NOTES_UPDATED", "Notes updated"); TIQ.saveState(); }
      });
    }
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

/* ---- Candidate Review View (ported from original) ---- */
TIQ.views.renderCandidateReview = function() {
  return '<div class="view" id="view-review">' +
    '<div class="view-header"><div><span class="section-kicker">Detailed View</span><h1>Candidate Review</h1></div></div>' +
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
  if (sI) sI.addEventListener("input", function(e) { TIQ.views._reviewSearch = e.target.value; rerender(); });

  var exportBtn = document.getElementById("reviewExportCsv");
  if (exportBtn) exportBtn.addEventListener("click", function() { TIQ.exportCsv(TIQ.views._reviewView, TIQ.state.activeRecruiterId); });

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
          TIQ.addAuditEntry(c, "APPROVED", "Approved via Review"); TIQ.saveState(); TIQ.showToast(c.firstName + " approved."); rerender();
        } else if (act.dataset.action === "follow") {
          if (!TIQ.state.activeRecruiterId) { TIQ.showToast("Select a recruiter first."); return; }
          c.recordStatus = "Follow-Up"; c.priority = "High"; c.followUpRequestedBy = TIQ.state.activeRecruiterId; c.followUpTimestamp = TIQ.nowISO();
          TIQ.addAuditEntry(c, "FOLLOW_UP", "Follow-up requested"); TIQ.saveState(); TIQ.showToast(c.firstName + " flagged for follow-up."); rerender();
        } else if (act.dataset.action === "face-enroll") {
          TIQ.views._openFaceEnrollPanel(c.id, rerender);
        }
      }
      if (tr) TIQ.views._highlightTrace(tr.dataset.claim, tr);
    });
    var notes = detailPanel.querySelector("#aiNotes");
    if (notes) notes.addEventListener("change", function() {
      var c = TIQ.state.candidates.find(function(x) { return x.id === TIQ.views._reviewSelected; });
      if (c) { c.notes = notes.value; TIQ.addAuditEntry(c, "NOTES_UPDATED", "Notes updated"); TIQ.saveState(); }
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


/* ---- Info Cards Review (proposal swipe — GitHub stack swipe) ---- */
TIQ.views._infoDeck = null;
TIQ.views._infoFilterCandidateId = "";

TIQ.views._ensureDemoInfoCards = function(force) {
  // Drop duplicate demo cards so each name appears once
  var demoSeen = {};
  var pruned = false;
  (TIQ.state.proposals || []).forEach(function(p) {
    if (p.status !== "pending" || !p.sourceRef || !p.sourceRef.demo) return;
    if (force || demoSeen[p.candidateId]) {
      p.status = "rejected";
      p.resolvedAt = TIQ.nowISO();
      pruned = true;
      return;
    }
    demoSeen[p.candidateId] = true;
  });
  if (pruned) TIQ.saveState();

  var demoByPerson = {};
  TIQ.getPendingProposals().forEach(function(p) {
    if (p.sourceRef && p.sourceRef.demo) demoByPerson[p.candidateId] = true;
  });

  var candidates = TIQ.state.candidates || [];
  if (!candidates.length) return false;

  // One demo card per person — never repeat a name in the demo deck
  var oneEach = [
    { field: "major", label: "Major", value: "Computer Science", quote: "I'm a Computer Science major." },
    { field: "gpa", label: "GPA", value: "3.61", quote: "My GPA is 3.61." },
    { field: "skills", label: "Skills", value: "Power BI, SAP, SQL", quote: "I've used Power BI, SAP, and SQL." },
    { field: "university", label: "University", value: "University of Alabama", quote: "I go to the University of Alabama." },
    { field: "graduationDate", label: "Graduation Date", value: "December 2026", quote: "I finish December 2026." },
    { field: "phone", label: "Phone", value: "(816) 555-0522", quote: "You can call me at 816-555-0522." },
    { field: "workAuthorization", label: "Work Authorization", value: "US Citizen", quote: "I'm a US citizen." }
  ];

  var made = 0;
  candidates.forEach(function(c, i) {
    if (!force && demoByPerson[c.id]) return;
    var s = oneEach[i % oneEach.length];
    var speaker = (c.firstName + " " + c.lastName).trim();
    // Prefer profile-aligned values when present so each card stays unique to that person
    var value = s.value;
    var quote = s.quote;
    var field = s.field;
    var label = s.label;
    if (field === "major" && c.major) { value = c.major; quote = "I'm majoring in " + c.major + "."; }
    if (field === "university" && c.university) { value = c.university; quote = "I attend " + c.university + "."; }
    if (field === "gpa" && c.gpa) { value = c.gpa; quote = "My GPA is " + c.gpa + "."; }
    if (field === "graduationDate" && c.graduationDate) { value = c.graduationDate; quote = "I graduate " + c.graduationDate + "."; }
    if (field === "skills" && c.skills && c.skills.length) {
      value = c.skills.slice(0, 3).join(", ");
      quote = "My skills include " + value + ".";
    }
    if (field === "phone" && c.phone) { value = c.phone; quote = "My number is " + c.phone + "."; }
    if (field === "workAuthorization" && c.workAuthorization) {
      value = c.workAuthorization;
      quote = "Work auth: " + c.workAuthorization + ".";
    }
    if (field === "email" && c.email) { value = c.email; quote = "Email me at " + c.email + "."; }

    var prop = TIQ.createProposal({
      candidateId: c.id,
      field: field,
      label: label,
      value: value,
      source: "conversation",
      sourceRef: { quote: quote, speakerName: speaker, demo: true }
    });
    if (prop) made++;
  });
  return made > 0;
};

/** One pending card per person — never stack the same name twice. */
TIQ.views._pendingForDeck = function(candidateId) {
  var list = TIQ.getPendingProposals(candidateId || undefined);
  if (candidateId) return list;
  var seen = {};
  var unique = [];
  list.forEach(function(p) {
    if (seen[p.candidateId]) return;
    seen[p.candidateId] = true;
    unique.push(p);
  });
  return unique;
};

TIQ.views.renderInfoReview = function() {
  TIQ.views._ensureDemoInfoCards(false);
  var filterId = TIQ.views._infoFilterCandidateId || "";
  var pending = TIQ.views._pendingForDeck(filterId || undefined);
  var count = pending.length;
  var filterCand = filterId
    ? TIQ.state.candidates.find(function(c) { return c.id === filterId; })
    : null;
  var filterLabel = filterCand
    ? ((filterCand.firstName + " " + filterCand.lastName).trim() + " · " + count + " left")
    : (count + " left to review");
  return '<div class="view view--info-swipe" id="view-info-review">' +
    '<div class="info-swipe-header">' +
      '<div><span class="section-kicker">Career fair verify</span><h1>Info Cards</h1></div>' +
      '<div class="info-review-meta" id="infoReviewMeta">' + TIQ.escapeHtml(filterLabel) + '</div>' +
    '</div>' +
    '<p class="info-review-intro">Swipe right to save what they said onto their profile. Swipe left if it’s wrong. Add more from <strong>Recruiter Capture</strong> (voice note, video, or quick add).</p>' +
    (filterId
      ? '<div class="info-swipe-toolbar"><button type="button" class="secondary-button small-button" id="infoClearFilter">Show all people</button></div>'
      : '') +
   
    '<div id="swipeDeckRoot" class="info-review-deck"></div>' +
    '<div class="info-review-actions info-review-actions--tinder">' +
      '<button type="button" class="info-fab info-fab--reject" id="infoRejectBtn" aria-label="Reject">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<button type="button" class="info-fab info-fab--accept" id="infoAcceptBtn" aria-label="Save to profile">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="info-review-empty" id="infoReviewEmpty"' + (count ? ' hidden' : '') + '>No pending info cards. Record a conversation on <strong>Recruiter Capture</strong>, or upload a resume on Intake.</div>' +
  '</div>';
};

TIQ.views._infoCardHtml = function(p) {
  var c = TIQ.state.candidates.find(function(x) { return x.id === p.candidateId; });
  var name = c ? (c.firstName + " " + c.lastName) : p.candidateId;
  var initials = c ? TIQ.initialsFor(c) : "?";
  var uni = c && c.university ? c.university : "";
  var major = c && c.major ? c.major : "";
  var quote = (p.sourceRef && p.sourceRef.quote) ? p.sourceRef.quote : "";
  var speakerName = p.sourceRef && p.sourceRef.speakerName;
  var isDemo = !!(p.sourceRef && p.sourceRef.demo);
  var srcLabel = p.source === "resume"
    ? "From resume"
    : (speakerName ? ("Heard from " + speakerName) : "From today's conversation");
  var sub = [uni, major].filter(Boolean).join(" · ");
  return '<div class="info-card info-card--tinder">' +
    '<div class="info-card__hero">' +
      '<div class="info-card__avatar" aria-hidden="true">' + TIQ.escapeHtml(initials) + '</div>' +
      '<div class="info-card__hero-text">' +
        '<div class="info-card__name">' + TIQ.escapeHtml(name) + '</div>' +
        (sub ? '<div class="info-card__sub">' + TIQ.escapeHtml(sub) + '</div>' : '') +
        '<div class="info-card__id">' + TIQ.escapeHtml(p.candidateId) + '</div>' +
      '</div>' +
      (isDemo ? '<span class="info-card__demo">Demo</span>' : '<span class="info-card__badge">Verify</span>') +
    '</div>' +
    '<div class="info-card__body">' +
      '<div class="info-card__eyebrow">Did they say this?</div>' +
      '<div class="info-card__field">' + TIQ.escapeHtml(p.label) + '</div>' +
      '<div class="info-card__value">' + TIQ.escapeHtml(String(p.value)) + '</div>' +
      (p.previousValue
        ? '<div class="info-card__prev"><span>On file now</span>' + TIQ.escapeHtml(String(p.previousValue)) + '</div>'
        : '<div class="info-card__prev info-card__prev--empty"><span>On file now</span>Not set yet</div>') +
      (quote ? '<blockquote class="info-card__quote">“' + TIQ.escapeHtml(quote) + '”</blockquote>' : '') +
      '<div class="info-card__source">' + TIQ.escapeHtml(srcLabel) + '</div>' +
    '</div>' +
  '</div>';
};

TIQ.views._refreshInfoDeck = function() {
  var filterId = TIQ.views._infoFilterCandidateId || "";
  var pending = TIQ.views._pendingForDeck(filterId || undefined);
  var empty = document.getElementById("infoReviewEmpty");
  var actions = document.querySelector(".info-review-actions");
  var meta = document.querySelector(".info-review-meta");
  var deckRoot = document.getElementById("swipeDeckRoot");

  function setMeta(n) {
    if (!meta) return;
    var filterCand = filterId
      ? TIQ.state.candidates.find(function(c) { return c.id === filterId; })
      : null;
    meta.textContent = filterCand
      ? ((filterCand.firstName + " " + filterCand.lastName).trim() + " · " + n + " left")
      : (n + " left to review");
  }
  setMeta(pending.length);

  if (!pending.length) {
    if (empty) empty.hidden = false;
    if (actions) actions.hidden = true;
    if (deckRoot) deckRoot.innerHTML = "";
    TIQ.views._infoDeck = null;
    return;
  }
  if (empty) empty.hidden = true;
  if (actions) actions.hidden = false;

  function reload() {
    var next = TIQ.views._pendingForDeck(filterId || undefined);
    setMeta(next.length);
    if (!next.length) {
      if (empty) empty.hidden = false;
      if (actions) actions.hidden = true;
      if (deckRoot) deckRoot.innerHTML = "";
      TIQ.views._infoDeck = null;
      return;
    }
    deck.setItems(next);
  }

  var deck = new TIQ.SwipeDeck({
    rootSelector: "#swipeDeckRoot",
    leftLabel: "WRONG",
    rightLabel: "SAVE",
    renderCard: function(p) { return TIQ.views._infoCardHtml(p); },
    onLeft: function(item) {
      var p = item || deck.current();
      if (p && p.id) {
        TIQ.rejectProposal(p.id);
        TIQ.showToast("Skipped — not saved.");
      }
      reload();
    },
    onRight: function(item) {
      var p = item || deck.current();
      if (p && p.id) {
        TIQ.acceptProposal(p.id);
        TIQ.showToast("Saved " + (p.label || "detail") + " to their profile.");
      }
      reload();
    }
  });
  TIQ.views._infoDeck = deck;
  deck.setItems(pending);

  var rej = document.getElementById("infoRejectBtn");
  var acc = document.getElementById("infoAcceptBtn");
  if (rej) rej.onclick = function() { deck.trigger("left"); };
  if (acc) acc.onclick = function() { deck.trigger("right"); };
};

TIQ.views.initInfoReview = function() {
  TIQ.views._refreshInfoDeck();

  var clear = document.getElementById("infoClearFilter");
  if (clear) {
    clear.addEventListener("click", function() {
      TIQ.views._infoFilterCandidateId = "";
      TIQ.router.navigateTo("info-review");
    });
  }
  TIQ.views._infoKeyHandler = function(e) {
    if (!document.getElementById("view-info-review")) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
    if (e.key === "ArrowLeft" && TIQ.views._infoDeck) TIQ.views._infoDeck.trigger("left");
    else if (e.key === "ArrowRight" && TIQ.views._infoDeck) TIQ.views._infoDeck.trigger("right");
  };
  document.removeEventListener("keydown", TIQ.views._infoKeyHandler);
  document.addEventListener("keydown", TIQ.views._infoKeyHandler);
};
