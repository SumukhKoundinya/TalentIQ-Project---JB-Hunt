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

  var reviewTime = cands.reduce(function(sum, c) { return sum + (c.reviewTimeMs || 0); }, 0);
  var avgReviewMs = cands.length ? Math.round(reviewTime / cands.length) : 0;
  var followUps = cands.filter(function(c) { return c.recordStatus === "Follow-Up"; }).length;

  return '<div class="view" id="view-overview">' +
    '<div class="view-header"><span class="section-kicker">Executive Console</span></div>' +
    '<div class="overview-event-bar">' +
      '<div class="event-badge"><span class="event-badge__label">Event</span><span class="event-badge__value">' + TIQ.escapeHtml(cfg.eventName) + '</span></div>' +
      '<div class="event-badge"><span class="event-badge__label">Date</span><span class="event-badge__value">' + TIQ.escapeHtml(cfg.eventDate) + '</span></div>' +
      '<div class="event-badge"><span class="event-badge__label">Location</span><span class="event-badge__value">' + TIQ.escapeHtml(cfg.eventLocation) + '</span></div>' +
    '</div>' +
    TIQ.renderMetricsCards([
      { label: "Total Scanned", value: totalScanned, sub: "Candidate profiles collected", modifier: "blue" },
      { label: "Interview Requests", value: interviewRequests, sub: "Next-day scheduling", modifier: "green" },
      { label: "Avg Review Time", value: stats.avgReviewTime || (avgReviewMs ? avgReviewMs + " ms" : "—"), sub: "Per candidate review", modifier: "amber" },
      { label: "Follow-Ups", value: followUps, sub: "Priority candidates", modifier: "purple" }
    ]) +
    '<div class="overview-grid">' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Candidates by Major</span></div>' +
        '<div class="overview-bars">' +
          majorData.map(function(m, i) {
            return '<div class="hbar-row"><span class="hbar-label">' + TIQ.escapeHtml(m.label) + '</span><div class="hbar-track"><div class="hbar-fill" style="width:' + m.percent + '%;animation-delay:' + (i * 80) + 'ms"></div></div><span class="hbar-val">' + m.percent + '%</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Top Universities</span></div>' +
        '<div class="overview-list">' +
          uniData.map(function(u, i) {
            return '<div class="overview-list__item" style="animation-delay:' + (i * 60) + 'ms"><span class="overview-list__rank">' + (i + 1) + '</span><span class="overview-list__name">' + TIQ.escapeHtml(u.name) + '</span><span class="overview-list__count">' + u.count + '</span></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<div class="overview-card">' +
        '<div class="overview-card__head"><span class="chart-title">Today\'s Activity</span></div>' +
        '<div class="overview-activity">' +
          feedData.map(function(f, i) {
            return '<div class="activity-item" style="animation-delay:' + (i * 60) + 'ms"><span class="activity-dot activity-dot--' + f.dotColor + '"></span><div><strong>' + TIQ.escapeHtml(f.recruiter) + '</strong> ' + TIQ.escapeHtml(f.action) + ' ' + TIQ.escapeHtml(f.target) + '<span class="activity-time">' + TIQ.escapeHtml(f.time) + '</span></div></div>';
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
TIQ.views._kioskFormUrl = TIQ.views._kioskFormUrl || (window.location.origin + "/candidate-form.html");
TIQ.views._kioskIntakeMethod = TIQ.views._kioskIntakeMethod || "google-form";

TIQ.views.renderKiosk = function() {
  var cfg = TIQ.CONFIG;
  var formUrl = TIQ.views._kioskFormUrl;
  var method = TIQ.views._kioskIntakeMethod;

  return '<div class="view" id="view-intake">' +
    '<div class="kiosk-workspace">' +
      '<div class="kiosk-col-left">' +
        '<div class="kiosk-event-card">' +
          '<div class="kiosk-event-card__eyebrow">Event Booth</div>' +
          '<div class="kiosk-event-card__title">' + TIQ.escapeHtml(cfg.company) + '</div>' +
          '<div class="kiosk-event-card__meta">' + TIQ.escapeHtml(cfg.eventName) + '</div>' +
          '<div class="kiosk-event-card__line"></div>' +
          '<p class="kiosk-event-card__copy">Quick candidate capture for the career fair floor. Brand &amp; QR Check-in.</p>' +
        '</div>' +
        '<div class="kiosk-location-card">' +
          '<div class="kiosk-location-row"><span class="kiosk-location-label">Location</span><span class="kiosk-location-value">' + TIQ.escapeHtml(cfg.eventLocation) + '</span></div>' +
          '<div class="kiosk-location-row"><span class="kiosk-location-label">Date</span><span class="kiosk-location-value">' + TIQ.escapeHtml(cfg.eventDate) + '</span></div>' +
          '<div class="kiosk-location-row kiosk-location-row--last"><span class="kiosk-location-label">Mode</span><span class="kiosk-location-value">Mobile + Desktop</span></div>' +
        '</div>' +
        '<div class="kiosk-form-config-card">' +
          '<div class="kiosk-config-title">Form Destination Configurator</div>' +
          '<label class="kiosk-config-field"><span class="kiosk-config-label">Select Intake Method</span>' +
            '<select id="kioskIntakeMethod">' +
              '<option value="google-form"' + (method === "google-form" ? " selected" : "") + '>Google Form / External Link</option>' +
              '<option value="custom-url"' + (method === "custom-url" ? " selected" : "") + '>Custom URL</option>' +
            '</select>' +
          '</label>' +
          '<label class="kiosk-config-field"><span class="kiosk-config-label">Form / Survey URL</span>' +
            '<input id="kioskFormUrl" type="url" value="' + TIQ.escapeAttr(formUrl) + '" placeholder="https://..." />' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div class="kiosk-qr-panel" id="kioskQrPanel">' +
        '<div class="kiosk-qr-kicker">Booth QR Code &amp; Candidate Intake Config</div>' +
        '<div class="kiosk-qr-subtitle">Scan to Submit Profile</div>' +
        '<div class="kiosk-qr-container" id="kioskQrContainer">' +
          '<canvas id="kiosk-qr-canvas" width="200" height="200"></canvas>' +
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
  var methodSelect = document.getElementById("kioskIntakeMethod");
  var urlInput = document.getElementById("kioskFormUrl");
  var printBtn = document.getElementById("kioskPrintPoster");
  var copyBtn = document.getElementById("kioskCopyLink");
  var cfg = TIQ.CONFIG;

  var renderQR = function() {
    var url = (urlInput ? urlInput.value : TIQ.views._kioskFormUrl) || "https://forms.gle/jbh-tech-fair-2026";
    var canvas = document.getElementById("kiosk-qr-canvas");
    if (!canvas) return;
    TIQ.qr.renderTo(url, canvas, { margin: 2 });
  };

  renderQR();

  if (methodSelect) {
    methodSelect.addEventListener("change", function() {
      TIQ.views._kioskIntakeMethod = methodSelect.value;
      renderQR();
    });
  }

  if (urlInput) {
    urlInput.addEventListener("input", TIQ.debounce(function() {
      TIQ.views._kioskFormUrl = urlInput.value;
      renderQR();
    }, 300));
  }

  if (printBtn) {
    printBtn.addEventListener("click", function() { window.print(); });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function() {
      var url = (urlInput ? urlInput.value : TIQ.views._kioskFormUrl) || "";
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

/* Candidate Review Card — high-density card for the capture deck */
TIQ.views._buildCardHtml = function(c, isFront) {
  var flags = TIQ.getMissingFlags(c);
  var gradDate = c.graduationDate || "";

  /* Section 1: header — avatar + name + school */
  var headerHtml = '<div class="card-header">' +
    '<div class="avatar-box">' + TIQ.initialsFor(c) + '</div>' +
    '<div class="header-details">' +
      '<div class="name-row">' +
        '<h3 class="candidate-name">' + TIQ.escapeHtml(c.firstName) + ' ' + TIQ.escapeHtml(c.lastName) + '</h3>' +
      '</div>' +
      (c.university ? '<p class="university">' + TIQ.escapeHtml(c.university) + '</p>' : '') +
      '<p class="major-grad">' +
        [c.major, gradDate].filter(Boolean).map(TIQ.escapeHtml).join(' &bull; ') +
      '</p>' +
    '</div>' +
  '</div>';

  /* Section 2: meta strip (labeled facts) + categorized skill groups */
  var metaFacts = [];
  var gpaNum = parseFloat(c.gpa);
  if (!isNaN(gpaNum) && gpaNum > 0) {
    metaFacts.push({ label: "GPA", value: String(c.gpa), mod: "meta-fact--gpa" });
  }
  var parsed = c.parsedResume || null;
  var certCount = (parsed && parsed.certifications && parsed.certifications.length) || 0;
  if (certCount > 0) {
    metaFacts.push({ label: "Certs", value: certCount + (certCount === 1 ? " certification" : " certifications") });
  }
  var roleCount = (parsed && parsed.experience && parsed.experience.length) || 0;
  var projectCount = (parsed && parsed.projects && parsed.projects.length) || 0;
  /* JDs value projects (academic/personal/capstone) over prior employment — show projects first */
  if (projectCount > 0) {
    metaFacts.push({ label: "Projects", value: String(projectCount) });
  } else if (roleCount > 0) {
    metaFacts.push({ label: "Experience", value: roleCount + (roleCount === 1 ? " role" : " roles") });
  }

  var allSkills = (c.skills && c.skills.length) ? c.skills : (c.parsedResume && c.parsedResume.skills) || [];
  /* Soft-skill chips are low signal on a resume — qualities are covered by grounded highlights below */
  var skillGroups = TIQ.categorizeSkills(allSkills).filter(function(g) {
    return g.key !== "methods";
  }).slice(0, 3);

  var profileHtml = "";
  if (metaFacts.length || skillGroups.length) {
    var metaHtml = "";
    if (metaFacts.length) {
      metaHtml = '<div class="meta-strip">' + metaFacts.map(function(f, i) {
        return (i > 0 ? '<span class="meta-divider" aria-hidden="true"></span>' : '') +
          '<span class="meta-fact ' + (f.mod || "") + '">' +
            '<span class="meta-fact__label">' + TIQ.escapeHtml(f.label) + '</span>' +
            '<span class="meta-fact__value">' + TIQ.escapeHtml(f.value) + '</span>' +
          '</span>';
      }).join("") + '</div>';
    }
    var groupsHtml = "";
    if (skillGroups.length) {
      groupsHtml = '<div class="skill-groups">' + skillGroups.map(function(g) {
        var shown = g.items.slice(0, 4);
        var more = g.items.length - shown.length;
        return '<div class="skill-group">' +
          '<span class="skill-group__label">' + TIQ.escapeHtml(g.label) + '</span>' +
          '<div class="skill-group__chips">' +
            shown.map(function(s) {
              return '<span class="chip">' + TIQ.escapeHtml(s) + '</span>';
            }).join("") +
            (more > 0
              ? '<span class="chip chip-more" title="' + TIQ.escapeAttr(g.items.slice(4).join(", ")) + '">+' + more + '</span>'
              : '') +
          '</div>' +
        '</div>';
      }).join("") + '</div>';
    }
    profileHtml = '<div class="card-profile">' + metaHtml + groupsHtml + '</div>';
  }

  /* Section 3: grounded AI highlights — bullets with inline source tags */
  var bullets = (c.accomplishments && c.accomplishments.length) ? c.accomplishments.slice(0, 3).map(function(a) {
    return { text: a.text, source: a.source || "recruiter notes" };
  }) : [];
  if (bullets.length < 3 && c.summary) {
    var sentences = (c.summary.match(/[^.!?]+[.!?]+/g) || []).map(function(s) { return s.replace(/\s+/g, " ").trim(); });
    var traces = c.traceability || [];
    for (var i = 0; bullets.length < 3 && i < sentences.length; i++) {
      var src = traces.length
        ? (function(t) { var m = /\u2014([^\u2014]+)$/.exec(t.trim()); return (m && m[1] ? m[1].trim() : "source").replace(/\.$/, ""); })(traces[Math.min(i, traces.length - 1)])
        : "intake form";
      bullets.push({ text: sentences[i], source: src });
    }
  }
  var highlightHtml = bullets.map(function(b, i) {
    var txt = b.text.length > 140 ? b.text.slice(0, 137) + '...' : b.text;
    return '<div class="highlight-item">' +
      (i > 0 ? '<hr class="highlight-divider" />' : '') +
      '<p>' + TIQ.escapeHtml(txt) + '</p>' +
      '<span class="source-tag">source: ' + TIQ.escapeAttr(b.source) + '</span>' +
    '</div>';
  }).join("");
  var highlightsHtml = '<div class="highlights-box">' +
    '<div class="highlights-title">&#9733; Grounded AI Highlights</div>' +
    (bullets.length ? highlightHtml : '<div class="highlight-item"><p>No grounded highlights yet &mdash; add a conversation note.</p></div>') +
  '</div>';

  /* Section 4: Apple-style voice memo widget — front card only */
  var voiceHtml = "";
  if (isFront) {
    voiceHtml = '<div class="voice-memo-widget">' +
      '<span class="record-indicator"></span>' +
      '<div class="voice-meta">' +
        '<span class="voice-label">Voice Memo</span>' +
        '<span class="voice-timer" id="audioTimer">00:00</span>' +
      '</div>' +
      '<div class="waveform">' + TIQ.views._waveformBars(24) + '</div>' +
      '<button type="button" id="audioRecordBtn" class="voice-btn btn-toggle" title="Start recording" aria-label="Start or stop recording" aria-pressed="false">&#9679;</button>' +
    '</div>' +
    '<div id="liveTranscriptPreview" class="live-transcript-preview" style="display:none"><span class="live-transcript-dot"></span><span class="live-transcript-text"></span></div>';
  }

  /* Section 6: compliance alert banner(s) — verified missing-data flags */
  var alertHtml = "";
  if (flags.length) {
    var shown = flags.slice(0, 3);
    var more = flags.length - shown.length;
    alertHtml = '<div class="alert-banner" data-flag-key="' + TIQ.escapeAttr(shown[0].key) + '">' +
      '&#9888;&#65039; ' + shown.map(function(f) { return TIQ.escapeHtml(f.label); }).join(' &bull; ') +
      (more > 0 ? ' &bull; +' + more + ' more' : '') +
    '</div>';
  }

  return headerHtml + profileHtml + highlightsHtml + voiceHtml + alertHtml;
};

TIQ.views.renderRecruiterCapture = function() {
  var cands = TIQ.state.candidates;
  if (!cands.length) return '<div class="view" id="view-capture"><div class="view-header"><span class="section-kicker">Live Capture</span><h1>No candidates to capture</h1></div><div class="capture-empty"><p>No candidates in the system yet.</p><button class="primary-button" id="captureGenerateDemo">Generate Demo Candidates</button><button class="secondary-button" id="captureImportEmpty">Import Resumes (PDF)</button><button class="secondary-button" id="captureNewCandidateEmpty">Add Candidate Manually</button><input type="file" id="captureImportEmptyInput" accept=".pdf,application/pdf" multiple style="display:none"></div></div>';

  var idx = TIQ.views._captureIndex;
  if (idx >= cands.length) {
    return TIQ.views._renderCaptureComplete(cands);
  }

  var c = cands[idx];

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
       '<div class="capture-overlay capture-overlay--right"><span class="capture-overlay__label">CONTACT</span></div>' : '') +
    '</div>';
  }
  stackHtml += '</div>';

  var atEnd = idx >= cands.length - 1;

  var recordingsHtml = "";
  if (c.audioNotes && c.audioNotes.length) {
    recordingsHtml = c.audioNotes.map(function(a, i) {
      return '<div class="audio-player-row"><span class="audio-label">Recording ' + (i + 1) + ' (' + a.duration + 's)</span><audio controls class="audio-ctrl" data-audio-blob-id="' + TIQ.escapeAttr(a.blobId) + '"></audio><button class="audio-delete-btn" data-audio-index="' + i + '" aria-label="Delete recording">✕</button></div>';
    }).join("");
  }

  return '<div class="view app-view-container" id="view-capture">' +
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
              '<button class="capture-triage-btn capture-triage--follow" id="captureFollow" title="Mark as Follow-Up (swipe right / &rarr;)">' +
                '<span class="capture-triage-label">Follow-Up</span><span class="capture-triage-arrow">&rarr;</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '<aside class="capture-col-right">' +
          (recordingsHtml ? '<div class="capture-panel capture-panel--recordings">' +
            '<div class="capture-section-title">Recordings</div>' +
            '<div id="audioRecordings" class="audio-recordings">' + recordingsHtml + '</div>' +
          '</div>' : '') +
          '<div class="capture-panel capture-panel--intake">' +
            '<div class="capture-section-title">Resume Intake</div>' +
            '<p class="capture-intake-sub">Import PDFs and we build the candidate cards from them.</p>' +
            '<button type="button" class="primary-button" id="captureImportResumes">Import Resumes (PDF)</button>' +
            '<button type="button" class="secondary-button" id="captureNewCandidate">Add Manually</button>' +
            '<input type="file" id="captureImportInput" accept=".pdf,application/pdf" multiple style="display:none">' +
          '</div>' +
          '<div class="capture-panel capture-panel--notes">' +
            '<div class="capture-section-title">Recruiter Notes</div>' +
            '<textarea id="captureNotes" class="capture-textarea capture-textarea--inline" rows="4" placeholder="Add notes about this candidate...">' + TIQ.escapeHtml(c.notes) + '</textarea>' +
          '</div>' +
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
      return TIQ.ai.parseAndStoreResume(c, file).then(function() {
        created++;
        if (!c.summary) TIQ.ai.updateCandidateSummary(c);
      }).catch(function() {
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
    } else if (e.target.closest("#captureImportResumes") || e.target.closest("#captureImportEmpty")) {
      var impInput = e.target.closest("#captureImportResumes") ? document.getElementById("captureImportInput") : document.getElementById("captureImportEmptyInput");
      if (impInput) impInput.click();
    } else if (e.target.closest("#captureNewCandidate")) {
      var modal = document.getElementById("newCandidateModal");
      if (modal) modal.hidden = false;
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
    }
  });

  var notes = document.getElementById("captureNotes");
  if (notes) {
    notes.addEventListener("change", function() {
      var c = TIQ.state.candidates[TIQ.views._captureIndex];
      if (c) { c.notes = notes.value; TIQ.addAuditEntry(c, "NOTES_UPDATED", "Notes updated"); if (TIQ.ai && TIQ.ai.updateCandidateSummary) TIQ.ai.updateCandidateSummary(c); TIQ.saveState(); }
    });
  }

  var captureImportInput = document.getElementById("captureImportInput");
  if (captureImportInput) {
    captureImportInput.addEventListener("change", function() {
      TIQ.views.importResumeFiles(this.files);
      this.value = "";
    });
  }

  var captureImportEmptyInput = document.getElementById("captureImportEmptyInput");
  if (captureImportEmptyInput) {
    captureImportEmptyInput.addEventListener("change", function() {
      TIQ.views.importResumeFiles(this.files);
      this.value = "";
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
        phone: "", university: fd.get("university") || "", degreeProgram: "Bachelor of Science",
        major: fd.get("major") || "", graduationDate: fd.get("graduationDate") || "",
        gpa: fd.get("gpa") || "", resumeUpload: "",
        function: fd.get("function") || "General", workLocations: [],
        workAuthorization: fd.get("workAuthorization") || "",
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
      var resumeFile = document.getElementById("newCandidateResume");
      var file = resumeFile && resumeFile.files && resumeFile.files[0];
      if (file) {
        newC.resumeUpload = { name: file.name, type: file.type };
        TIQ.ai.parseAndStoreResume(newC, file).then(function() {
          TIQ.ai.updateCandidateSummary(newC);
          TIQ.saveState();
          document.getElementById("newCandidateModal").hidden = true;
          newForm.reset();
          TIQ.views._rerenderCapture();
        });
      } else {
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
  if (c.auditLog.length > last.auditLogLength) {
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
    auditLogLength: c.auditLog.length,
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
    var matchSearch = !s || [c.firstName, c.lastName, c.major, c.function, c.university, c.skills.join(" "), c.notes, c.areasDiscussed.join(" "), TIQ.getMissingFlags(c).map(function(f) { return f.label; }).join(" ")].some(function(v) { return String(v).toLowerCase().indexOf(s) >= 0; });
    var matchStatus = TIQ.views._aiReviewStatus === "all" || c.recordStatus === TIQ.views._aiReviewStatus;
    var matchFunc = TIQ.views._aiReviewFunc === "all" || c.function === TIQ.views._aiReviewFunc;
    var matchPri = TIQ.views._aiReviewPriority === "all" || c.priority === TIQ.views._aiReviewPriority;
    return matchSearch && matchStatus && matchFunc && matchPri;
  });
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
  if (aiCsvBtn) aiCsvBtn.addEventListener("click", function() { TIQ.exportCsvLoading(aiCsvBtn, TIQ.views._getFilteredCandidates(), TIQ.state.activeRecruiterId); });
  if (aiJsonBtn) aiJsonBtn.addEventListener("click", function() { TIQ.exportJsonLoading(aiJsonBtn, TIQ.views._getFilteredCandidates()); });

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
        } else if (actionBtn.dataset.action === "regen") {
          TIQ.ai.updateCandidateSummary(c);
          TIQ.addAuditEntry(c, "SUMMARY_REGEN", "Summary regenerated from AI");
          TIQ.saveState(); TIQ.showToast("Summary regenerated."); rerender();
        }
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
          if (TIQ.ai && TIQ.ai.updateCandidateSummary) TIQ.ai.updateCandidateSummary(c);
          TIQ.saveState();
        }
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
  if (exportBtn) exportBtn.addEventListener("click", function() { TIQ.exportCsvLoading(exportBtn, TIQ.views._reviewView, TIQ.state.activeRecruiterId); });

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
      workLocations: demo.workLocations || []
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
