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
          '<label class="form-field"><span class="form-label">Resume</span><input name="resumeUpload" type="file" accept=".pdf,.doc,.docx" /></label>' +
        '</div>' +
        '<button type="submit" class="primary-button intake-submit">Submit Profile</button>' +
        '<div class="intake-error" id="intakeError"></div>' +
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
    var newCandidate = {
      id: id, firstName: firstName, lastName: lastName, email: email,
      phone: fd.get("phone") || "",
      university: university, degreeProgram: TIQ.CONFIG.defaultDegreeProgram,
      major: major, graduationDate: gradDate,
      gpa: fd.get("gpa") || "", resumeUpload: resumeFile ? resumeFile.name : "",
      function: "General", workLocations: [],
      workAuthorization: fd.get("workAuthorization") || "",
      skills: [], keySkills: [], areasDiscussed: [],
      notes: "", summary: "",
      traceability: [],
      recordStatus: "New", approvalStatus: "Pending",
      approverId: "", approvalTimestamp: "",
      followUpRequestedBy: "", followUpTimestamp: "",
      lastUpdated: TIQ.todayISO(), created_at: TIQ.nowISO(),
      priority: "Normal",
      audioNotes: [],
      auditLog: [{ action: "CREATED", recruiter_id: TIQ.state.activeRecruiterId, timestamp: TIQ.nowISO(), time_to_complete: 0, detail: "Candidate intake form submitted" }],
      reviewTimeMs: 0, noteEdits: 0
    };

    TIQ.state.candidates.push(newCandidate);
    TIQ.saveState();
    TIQ.showToast("Profile submitted! Welcome, " + firstName + ".");
    form.reset();
    TIQ.router.navigateTo("recruiter-capture");
  });
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

  return '<div class="capture-card__top">' +
    '<div class="capture-avatar">' + TIQ.initialsFor(c) + '</div>' +
    '<div class="capture-card__identity">' +
      '<div class="capture-card__name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</div>' +
      '<div class="capture-card__id">' + TIQ.escapeHtml(c.id) + '</div>' +
    '</div>' +
    '<span class="status-chip ' + (TIQ.statusClassMap[c.recordStatus] || "status-new") + '">' + TIQ.escapeHtml(c.recordStatus) + '</span>' +
  '</div>' +
  '<div class="capture-card__info">' +
    '<div class="capture-card__edu">' + TIQ.escapeHtml(c.university) + ' &bull; ' + TIQ.escapeHtml(c.major) + '</div>' +
    '<div class="capture-card__grad">Grad: ' + TIQ.escapeHtml(c.graduationDate || "—") + '</div>' +
  '</div>' +
  (c.skills.length ? '<div class="capture-card__skills">' + c.skills.slice(0, 5).map(function(s) { return '<span>' + TIQ.escapeHtml(s) + '</span>'; }).join("") + '</div>' : '') +
  '<div class="capture-card__quick">' +
    '<span>GPA: ' + TIQ.escapeHtml(c.gpa || "—") + '</span>' +
    '<span>Auth: ' + TIQ.escapeHtml(c.workAuthorization || "—") + '</span>' +
    '<span>Loc: ' + (c.workLocations.length ? TIQ.escapeHtml(c.workLocations[0]) : "—") + '</span>' +
  '</div>' +
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

  return '<div class="view" id="view-capture">' +
    '<div class="capture-header">' +
      '<div><span class="section-kicker">Live Capture</span><h1>Recruiter Capture</h1></div>' +
      '<div class="capture-meta"><span class="capture-counter">Card ' + (idx + 1) + ' of ' + cands.length + '</span>' +
      '<span class="capture-recruiter">' + TIQ.escapeHtml(recruiterName) + '</span></div>' +
    '</div>' +
    stackHtml +
    '<div class="capture-notes">' +
      '<div class="capture-section-title">Recruiter Notes</div>' +
      '<textarea id="captureNotes" class="capture-textarea" rows="3" placeholder="Quick notes from the conversation...">' + TIQ.escapeHtml(c.notes) + '</textarea>' +
    '</div>' +
    '<div class="capture-audio">' +
      '<div class="capture-section-title">Voice Notes</div>' +
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
      rec.stop().then(function(result) {
        if (!result) return;
        var c = TIQ.state.candidates[TIQ.views._captureIndex];
        if (c) {
          c.audioNotes.push({ id: Date.now(), blobUrl: result.blobUrl, duration: result.duration, createdAt: TIQ.nowISO(), offlinePending: !navigator.onLine });
          TIQ.addAuditEntry(c, "AUDIO_ADDED", "Voice note recorded (" + result.duration + "s)");
          TIQ.saveState();
          TIQ.showToast("Voice note saved (" + result.duration + "s).");
          TIQ.views._rerenderCapture();
        }
      });
      recordBtn.classList.remove("recording");
      stopBtn.disabled = true;
      document.getElementById("audioRecordLabel").textContent = "Record";
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
    '</div>' +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">AI-Generated Snapshot</span></div><div class="snapshot-card"><p>' + TIQ.escapeHtml(c.summary) + '</p></div></section>' +
    '<section class="ai-section"><div class="section-title"><span class="section-kicker">Missing Information Flags</span></div><div class="flag-list">' + flagsHtml + '</div></section>' +
    (traceHtml ? '<section class="ai-section"><div class="section-title"><span class="section-kicker">Source Traceability</span></div><div class="trace-list" id="aiTraceList">' + traceHtml + '</div></section>' : '') +
    audioHtml +
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
