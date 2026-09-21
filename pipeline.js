/* ============================================
   TalentIQ — Conversation + Resume Pipeline
   ============================================ */
window.TIQ = window.TIQ || {};
TIQ.pipeline = TIQ.pipeline || {};

/** Map extractor field names → candidate schema fields */
TIQ.pipeline.FIELD_MAP = {
  university: "university",
  major: "major",
  graduationDate: "graduationDate",
  gpa: "gpa",
  email: "email",
  phone: "phone",
  workAuthorization: "workAuthorization",
  skills: "skills",
  firstName: "firstName",
  lastName: "lastName"
};

TIQ.pipeline._galleryPayload = function() {
  return TIQ.getAllFaceEmbeddings().then(function(rows) {
    return rows.map(function(r) {
      return {
        candidateId: r.candidateId,
        angle: r.angle,
        embedding: r.embedding
      };
    });
  });
};

/**
 * Process a conversation video blob for a candidate.
 * Creates pending proposals for Info Cards review.
 */
TIQ.pipeline.processConversationVideo = function(blob, candidateId, onProgress) {
  var progress = onProgress || function() {};
  progress("Building face gallery...");
  return TIQ.pipeline._galleryPayload().then(function(gallery) {
    progress("Uploading & analyzing (face + speech)...");
    var fd = new FormData();
    fd.append("video", blob, "conversation.webm");
    fd.append("gallery_json", JSON.stringify(gallery));
    fd.append("default_candidate_id", candidateId || "");
    return fetch("/api/conversation/process", { method: "POST", body: fd })
      .then(function(res) {
        return res.json().then(function(body) {
          if (!res.ok) {
            var detail = (body && body.detail) || "Pipeline failed";
            if (Array.isArray(detail)) detail = detail.map(function(d) { return d.msg || d; }).join("; ");
            throw new Error(detail);
          }
          return body;
        });
      });
  }).then(function(body) {
    progress("Creating info cards...");
    var recordingId = "REC-" + Date.now();
    TIQ.recordingDB.put(recordingId, blob, {
      candidateId: candidateId,
      utterances: body.utterances || [],
      turns: body.turns || []
    }).catch(function() {});
    TIQ.addRecordingMeta({
      id: recordingId,
      candidateId: candidateId,
      createdAt: TIQ.nowISO(),
      utteranceCount: (body.utterances || []).length
    });

    var created = 0;
    (body.proposals || []).forEach(function(p) {
      var field = TIQ.pipeline.FIELD_MAP[p.field] || p.field;
      var cid = p.candidateId || candidateId;
      if (!cid || cid === "Unknown") return;
      var prop = TIQ.createProposal({
        candidateId: cid,
        field: field,
        label: p.label,
        value: p.value,
        source: "conversation",
        sourceRef: { recordingId: recordingId, quote: p.quote || "" }
      });
      if (prop) created++;
    });
    var matched = {};
    (body.face_timeline || body.faceTimeline || []).forEach(function(f) {
      var id = f.candidateId || f.candidate_id;
      if (id && id !== "Unknown") matched[id] = true;
    });
    (body.utterances || []).forEach(function(u) {
      if (u.candidateId && u.candidateId !== "Unknown") matched[u.candidateId] = true;
    });
    return {
      proposalsCreated: created,
      faceTimeline: body.face_timeline || body.faceTimeline || [],
      matchedCandidates: Object.keys(matched),
      raw: body
    };
  });
};

/** Parse resume file → fields + confidence */
TIQ.pipeline.parseResume = function(file) {
  var fd = new FormData();
  fd.append("file", file, file.name || "resume.pdf");
  return fetch("/api/resume/parse", { method: "POST", body: fd })
    .then(function(res) {
      return res.json().then(function(body) {
        if (!res.ok) {
          var detail = (body && body.detail) || "Resume parse failed";
          if (Array.isArray(detail)) detail = detail.map(function(d) { return d.msg || d; }).join("; ");
          throw new Error(detail);
        }
        return body;
      });
    });
};

/** Fill intake form inputs from parsed resume fields */
TIQ.pipeline.autofillIntake = function(fields, confidence) {
  fields = fields || {};
  confidence = confidence || {};
  var form = document.getElementById("intakeForm");
  if (!form) return { count: 0, labels: [] };

  var filled = [];
  var labelMap = {
    firstName: "First Name", lastName: "Last Name", email: "Email", phone: "Phone",
    university: "University", major: "Major", gpa: "GPA", graduationDate: "Graduation",
    workAuthorization: "Work Auth", skills: "Skills"
  };

  function clearResumeMarks() {
    form.querySelectorAll(".from-resume, .from-resume--low").forEach(function(el) {
      el.classList.remove("from-resume", "from-resume--low");
    });
  }
  clearResumeMarks();

  function matchSelectOption(el, value) {
    if (!el || !value) return false;
    var want = String(value).toLowerCase().trim();
    var options = el.options;
    var i, opt, text, val;
    for (i = 0; i < options.length; i++) {
      opt = options[i];
      val = String(opt.value || "").toLowerCase();
      text = String(opt.text || "").toLowerCase();
      if (val === want || text === want) {
        el.value = opt.value;
        return true;
      }
    }
    for (i = 0; i < options.length; i++) {
      opt = options[i];
      val = String(opt.value || "").toLowerCase();
      text = String(opt.text || "").toLowerCase();
      if ((val && (val.indexOf(want) >= 0 || want.indexOf(val) >= 0)) ||
          (text && (text.indexOf(want) >= 0 || want.indexOf(text) >= 0))) {
        el.value = opt.value;
        return true;
      }
    }
    return false;
  }

  function setVal(name, value, conf) {
    if (value == null || value === "") return false;
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return false;
    if (el.type === "radio") {
      var radio = form.querySelector('[name="' + name + '"][value="' + String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"]');
      if (!radio) {
        var radios = form.querySelectorAll('[name="' + name + '"]');
        var matched = false;
        radios.forEach(function(r) {
          if (String(r.value).toLowerCase().indexOf(String(value).toLowerCase().slice(0, 4)) >= 0) {
            r.checked = true;
            if (r.parentElement) r.parentElement.classList.add("from-resume");
            matched = true;
          }
        });
        if (matched) filled.push(labelMap[name] || name);
        return matched;
      }
      radio.checked = true;
      if (radio.parentElement) radio.parentElement.classList.add("from-resume");
      filled.push(labelMap[name] || name);
      return true;
    }
    if (el.tagName === "SELECT") {
      if (!matchSelectOption(el, value)) return false;
    } else {
      el.value = value;
    }
    el.classList.add("from-resume");
    if (conf != null && conf < 0.7) el.classList.add("from-resume--low");
    filled.push(labelMap[name] || name);
    return true;
  }

  setVal("firstName", fields.firstName, confidence.firstName);
  setVal("lastName", fields.lastName, confidence.lastName);
  setVal("email", fields.email, confidence.email);
  setVal("phone", fields.phone, confidence.phone);
  setVal("university", fields.university, confidence.university);
  setVal("major", fields.major, confidence.major);
  setVal("gpa", fields.gpa, confidence.gpa);
  setVal("workAuthorization", fields.workAuthorization, confidence.workAuthorization);

  // graduationDate is type=month (YYYY-MM); try to coerce "May 2026" → 2026-05
  if (fields.graduationDate) {
    var gd = String(fields.graduationDate);
    var monthMap = { january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
      july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
      spring: "05", fall: "12", aug: "08" };
    var m = gd.match(/([A-Za-z]+)?\s*(20\d{2})/);
    if (m) {
      var mon = monthMap[(m[1] || "may").toLowerCase()] || "05";
      setVal("graduationDate", m[2] + "-" + mon, confidence.graduationDate);
    }
  }

  // Stash skills for submit
  if (fields.skills) {
    form.dataset.resumeSkills = fields.skills;
    filled.push(labelMap.skills);
  } else {
    form.dataset.resumeSkills = "";
  }

  return { count: filled.length, labels: filled };
};

/** After intake create, emit resume proposals for swipe confirmation */
TIQ.pipeline.enqueueResumeProposals = function(candidateId, fields, confidence, filename) {
  fields = fields || {};
  confidence = confidence || {};
  var created = 0;
  Object.keys(fields).forEach(function(key) {
    var field = TIQ.pipeline.FIELD_MAP[key] || key;
    if (field === "firstName" || field === "lastName") return; // already on form
    var conf = confidence[key] == null ? 0.5 : confidence[key];
    // Always queue low-confidence or skills; high-confidence still queued for audit trail except identity
    var prop = TIQ.createProposal({
      candidateId: candidateId,
      field: field,
      value: fields[key],
      source: "resume",
      sourceRef: { resumeFilename: filename || "", quote: "Extracted from resume (confidence " + conf.toFixed(2) + ")" }
    });
    if (prop) created++;
  });
  return created;
};
