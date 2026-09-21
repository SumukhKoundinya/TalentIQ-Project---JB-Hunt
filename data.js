/* ============================================
   TalentIQ — Data Layer & Persistence
   ============================================ */
window.TIQ = window.TIQ || {};
var C = TIQ.CONFIG;

TIQ.RECRUITERS = C.recruiters;

TIQ.STORAGE_KEY = C.storageKey;
TIQ.METRICS_KEY = C.metricsKey;

TIQ.statusClassMap = C.statusClassMap;

TIQ.seedCandidates = C.seedCandidates;

/* ---- Original seed data kept as comment — edit config.js to change ----
TIQ.seedCandidates = [
  {
    id: "TQ-2401", firstName: "Mia", lastName: "Williams", email: "mia.williams@student.edu",
    phone: "", university: "Nashville State University", degreeProgram: "Bachelor of Science",
    major: "Computer Science", graduationDate: "May 2026", gpa: "3.86", resumeUpload: "mia_williams_resume.pdf",
    function: "Software Engineer", workLocations: ["Nashville, TN", "Dallas, TX"],
    workAuthorization: "US Citizen",
    skills: ["Python", "React", "APIs", "JavaScript"],
    keySkills: ["Python", "React", "API design", "Cloud systems"],
    areasDiscussed: ["Cloud", "Python", "AI", "Data Systems"],
    notes: "Strong technical discussion. Interested in cloud-native software and logistics data systems.",
    summary: "Mia is a strong software engineering candidate with experience in Python, React, and cloud-focused coursework. She has demonstrated interest in data systems and AI applications within logistics technology.",
    traceability: [
      "Python and React experience — resume",
      "Capstone project — application notes",
      "AI and logistics data interest — recruiter notes"
    ],
    recordStatus: "Interview Requested", approvalStatus: "Approved",
    approverId: "R1", approvalTimestamp: "2026-09-14T09:16:00Z",
    followUpRequestedBy: "", followUpTimestamp: "",
    lastUpdated: "2026-09-14", created_at: "2026-09-14T08:30:00Z",
    priority: "High",
    audioNotes: [],
    auditLog: [
      { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T08:30:00Z", time_to_complete: 28, detail: "Candidate intake form submitted" },
      { action: "INTERVIEW_REQUESTED", recruiter_id: "R1", timestamp: "2026-09-14T09:16:00Z", time_to_complete: 180, detail: "Interview requested after technical discussion" }
    ],
    reviewTimeMs: 0, noteEdits: 0
  },
  {
    id: "TQ-2402", firstName: "Jordan", lastName: "Patel", email: "jordan.patel@student.edu",
    phone: "555-0198", university: "University of Memphis", degreeProgram: "Bachelor of Science",
    major: "Data Science", graduationDate: "", gpa: "3.72", resumeUpload: "jordan_patel_resume.pdf",
    function: "Data Analyst", workLocations: ["Memphis, TN", "Remote"],
    workAuthorization: "",
    skills: ["SQL", "Python", "Visualization", "Statistics"],
    keySkills: ["SQL", "Python", "Statistics", "Visualization"],
    areasDiscussed: ["Analytics", "Forecasting", "Supply Chain"],
    notes: "Candidate expressed interest in using analytics to improve transportation performance.",
    summary: "Jordan brings data science and operations analytics experience with forecasting and supply chain coursework.",
    traceability: [
      "SQL and Python — resume",
      "Forecasting dashboard — project experience",
      "Supply chain analytics interest — recruiter notes"
    ],
    recordStatus: "Follow-Up", approvalStatus: "Pending",
    approverId: "", approvalTimestamp: "",
    followUpRequestedBy: "R2", followUpTimestamp: "2026-09-14T10:00:00Z",
    lastUpdated: "2026-09-14", created_at: "2026-09-14T09:00:00Z",
    priority: "Medium",
    audioNotes: [],
    auditLog: [
      { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T09:00:00Z", time_to_complete: 32, detail: "Candidate intake form submitted" },
      { action: "FOLLOW_UP", recruiter_id: "R2", timestamp: "2026-09-14T10:00:00Z", time_to_complete: 240, detail: "Follow-up requested for analytics team discussion" }
    ],
    reviewTimeMs: 0, noteEdits: 0
  },
  {
    id: "TQ-2403", firstName: "Priya", lastName: "Singh", email: "priya.singh@student.edu",
    phone: "555-0212", university: "University of Arkansas", degreeProgram: "Bachelor of Science",
    major: "Information Systems", graduationDate: "May 2027", gpa: "3.78", resumeUpload: "priya_singh_resume.pdf",
    function: "Logistics Technology", workLocations: [],
    workAuthorization: "US Citizen",
    skills: ["SQL", "ERP", "Process Mapping", "Power BI"],
    keySkills: ["SQL", "ERP", "Power BI", "Process mapping"],
    areasDiscussed: ["Process automation", "ERP", "Operations"],
    notes: "Strong interest in process automation and enterprise systems.",
    summary: "Priya is interested in logistics technology and enterprise systems with training in process mapping, operations, and data systems.",
    traceability: [
      "ERP process experience — resume",
      "Logistics workflow redesign — project experience",
      "Enterprise systems interest — recruiter notes"
    ],
    recordStatus: "Reviewed", approvalStatus: "Approved",
    approverId: "R3", approvalTimestamp: "2026-09-14T10:05:00Z",
    followUpRequestedBy: "", followUpTimestamp: "",
    lastUpdated: "2026-09-14", created_at: "2026-09-14T09:15:00Z",
    priority: "High",
    audioNotes: [],
    auditLog: [
      { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T09:15:00Z", time_to_complete: 30, detail: "Candidate intake form submitted" },
      { action: "APPROVED", recruiter_id: "R3", timestamp: "2026-09-14T10:05:00Z", time_to_complete: 195, detail: "Reviewed and approved" }
    ],
    reviewTimeMs: 0, noteEdits: 0
  },
  {
    id: "TQ-2404", firstName: "Andre", lastName: "Brooks", email: "andre.brooks@student.edu",
    phone: "555-0239", university: "University of Alabama", degreeProgram: "Bachelor of Science",
    major: "Cybersecurity", graduationDate: "May 2026", gpa: "3.81", resumeUpload: "andre_brooks_resume.pdf",
    function: "Cybersecurity", workLocations: ["Birmingham, AL", "Remote"],
    workAuthorization: "US Citizen",
    skills: ["Networking", "Linux", "Incident Response", "Python"],
    keySkills: ["Incident response", "Linux", "Networking", "Python"],
    areasDiscussed: ["Network security", "Risk", "Cloud security"],
    notes: "Candidate is interested in applying security controls to transportation networks.",
    summary: "Andre demonstrates strong technical foundations in networking, Linux, security, and incident response.",
    traceability: [
      "Security operations coursework — resume",
      "Vulnerability assessment — project experience",
      "Network security interest — recruiter notes"
    ],
    recordStatus: "Interview Requested", approvalStatus: "Approved",
    approverId: "R4", approvalTimestamp: "2026-09-14T11:08:00Z",
    followUpRequestedBy: "", followUpTimestamp: "",
    lastUpdated: "2026-09-14", created_at: "2026-09-14T09:30:00Z",
    priority: "Medium",
    audioNotes: [],
    auditLog: [
      { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T09:30:00Z", time_to_complete: 25, detail: "Candidate intake form submitted" },
      { action: "INTERVIEW_REQUESTED", recruiter_id: "R4", timestamp: "2026-09-14T11:08:00Z", time_to_complete: 210, detail: "Interview requested for cyber risk team" }
    ],
    reviewTimeMs: 0, noteEdits: 0
  },
  {
    id: "TQ-2405", firstName: "Sam", lastName: "Rivera", email: "sam.rivera@student.edu",
    phone: "555-0248", university: "University of Central Arkansas", degreeProgram: "Bachelor of Science",
    major: "Supply Chain Management", graduationDate: "Dec 2026", gpa: "", resumeUpload: "sam_rivera_resume.pdf",
    function: "Supply Chain Analytics", workLocations: ["Little Rock, AR", "Fort Worth, TX"],
    workAuthorization: "",
    skills: ["Excel", "Forecasting", "Process Improvement", "Logistics"],
    keySkills: ["Excel", "Forecasting", "Process Improvement", "Logistics"],
    areasDiscussed: ["Transportation", "Analytics", "Operations"],
    notes: "Strong knowledge of transportation lane planning and data driven planning.",
    summary: "Sam has operational and transportation knowledge combined with supply chain analytics coursework.",
    traceability: [
      "Excel and forecasting experience — resume",
      "Warehouse capacity project — project experience",
      "Operations and logistics interest — recruiter notes"
    ],
    recordStatus: "New", approvalStatus: "Pending",
    approverId: "", approvalTimestamp: "",
    followUpRequestedBy: "", followUpTimestamp: "",
    lastUpdated: "2026-09-14", created_at: "2026-09-14T09:45:00Z",
    priority: "Low",
    audioNotes: [],
    auditLog: [
      { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T09:45:00Z", time_to_complete: 35, detail: "Candidate intake form submitted" }
    ],
    reviewTimeMs: 0, noteEdits: 0
  },
  {
    id: "TQ-2406", firstName: "Olivia", lastName: "Chen", email: "olivia.chen@student.edu",
    phone: "555-0270", university: "University of Missouri", degreeProgram: "Bachelor of Science",
    major: "Software Engineering", graduationDate: "May 2027", gpa: "3.89", resumeUpload: "olivia_chen_resume.pdf",
    function: "Software Engineer", workLocations: ["Kansas City, MO", "Remote"],
    workAuthorization: "US Citizen",
    skills: ["JavaScript", "React", "Node.js", "SQL"],
    keySkills: ["JavaScript", "React", "Node.js", "SQL"],
    areasDiscussed: ["Frontend", "APIs", "Cloud", "React"],
    notes: "Strong technical communication. Candidate discussed front-end architecture and scalable data flows.",
    summary: "Olivia has a web engineering profile with JavaScript, React, Node.js, and SQL experience.",
    traceability: [
      "JavaScript, React and Node.js — resume",
      "React dashboard — project experience",
      "Frontend and API interest — recruiter notes"
    ],
    recordStatus: "Reviewed", approvalStatus: "Approved",
    approverId: "R4", approvalTimestamp: "2026-09-14T11:42:00Z",
    followUpRequestedBy: "", followUpTimestamp: "",
    lastUpdated: "2026-09-14", created_at: "2026-09-14T10:00:00Z",
    priority: "High",
    audioNotes: [],
    auditLog: [
      { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T10:00:00Z", time_to_complete: 29, detail: "Candidate intake form submitted" },
      { action: "APPROVED", recruiter_id: "R4", timestamp: "2026-09-14T11:42:00Z", time_to_complete: 168, detail: "Reviewed and approved" }
    ],
    reviewTimeMs: 0, noteEdits: 0
  },
  {
    id: "TQ-2407", firstName: "Avery", lastName: "Johnson", email: "avery.johnson@student.edu",
    phone: "555-0310", university: "University of Tennessee", degreeProgram: "Bachelor of Science",
    major: "Industrial Engineering", graduationDate: "May 2027", gpa: "3.63", resumeUpload: "",
    function: "Supply Chain Analytics", workLocations: ["Memphis, TN", "Nashville, TN"],
    workAuthorization: "US Citizen",
    skills: ["Lean", "Excel", "Simulation", "Operations"],
    keySkills: ["Lean", "Excel", "Operations", "Simulation"],
    areasDiscussed: ["Operations", "Safety", "Optimization"],
    notes: "Candidate expressed interest in process improvement and safety analytics.",
    summary: "Avery shows strong interest in process improvement and optimization grounded in industrial engineering coursework.",
    traceability: [
      "Lean and logistics operations — resume",
      "Optimization model — project experience",
      "Safety and process modeling interest — recruiter notes"
    ],
    recordStatus: "New", approvalStatus: "Pending",
    approverId: "", approvalTimestamp: "",
    followUpRequestedBy: "", followUpTimestamp: "",
    lastUpdated: "2026-09-14", created_at: "2026-09-14T10:15:00Z",
    priority: "Low",
    audioNotes: [],
    auditLog: [
      { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T10:15:00Z", time_to_complete: 33, detail: "Candidate intake form submitted" }
    ],
    reviewTimeMs: 0, noteEdits: 0
  }
];
---- End of original seed data ---- */

/* ---- Helpers ---- */
TIQ.todayISO = function() { return new Date().toISOString().slice(0, 10); };
TIQ.nowISO = function() { return new Date().toISOString(); };

TIQ.escapeHtml = function(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

TIQ.escapeAttr = function(value) { return TIQ.escapeHtml(value).replace(/'/g, "&#39;"); };

TIQ.initialsFor = function(c) {
  return ((c.firstName || "")[0] || "") + ((c.lastName || "")[0] || "");
};

TIQ.recruiterName = function(id) {
  var r = TIQ.RECRUITERS.find(function(x) { return x.id === id; });
  return r ? r.name : "";
};

TIQ.getMissingFlags = function(c) {
  var flags = [];
  if (!c.workAuthorization) flags.push({ key: "Work Authorization", label: "Work Auth Unspecified" });
  if (!c.graduationDate) flags.push({ key: "Graduation", label: "Grad Date Missing" });
  if (!c.gpa) flags.push({ key: "GPA", label: "GPA Missing" });
  if (!c.phone) flags.push({ key: "Phone", label: "Contact Phone Missing" });
  if (!c.resumeUpload) flags.push({ key: "Resume", label: "Resume Not Uploaded" });
  if (!c.workLocations || c.workLocations.length === 0) flags.push({ key: "Location", label: "Location Preference Missing" });
  return flags;
};

TIQ.formatFlagChip = function(flag) {
  return '<span class="flag-chip">[Flag: ' + TIQ.escapeHtml(flag.label) + ']</span>';
};

TIQ.escapeCsvCell = function(value) {
  var s = String(value == null ? "" : value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

TIQ.downloadCsv = function(filename, csv) {
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
};

/* ---- Persistence ---- */
TIQ.loadPersistedState = function() {
  try {
    var raw = localStorage.getItem(TIQ.STORAGE_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    if (Array.isArray(parsed.candidates) && parsed.candidates.length) return parsed;
    return null;
  } catch (_) { return null; }
};

TIQ.loadMetrics = function() {
  try {
    var raw = localStorage.getItem(TIQ.METRICS_KEY);
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) { return []; }
};

TIQ.state = (function() {
  var persisted = TIQ.loadPersistedState();
  return {
    candidates: (persisted && persisted.candidates) || TIQ.seedCandidates.map(function(c) { return Object.assign({}, c); }),
    activeRecruiterId: (persisted && persisted.activeRecruiterId) || "",
    selectedId: (persisted && persisted.lastSelectedId) || "",
    proposals: (persisted && Array.isArray(persisted.proposals)) ? persisted.proposals : [],
    recordings: (persisted && Array.isArray(persisted.recordings)) ? persisted.recordings : [],
    metrics: TIQ.loadMetrics()
  };
})();

TIQ.saveState = function() {
  try {
    localStorage.setItem(TIQ.STORAGE_KEY, JSON.stringify({
      candidates: TIQ.state.candidates,
      activeRecruiterId: TIQ.state.activeRecruiterId,
      lastSelectedId: TIQ.state.selectedId,
      proposals: TIQ.state.proposals || [],
      recordings: TIQ.state.recordings || []
    }));
  } catch (_) {}
};

TIQ.logMetric = function(entry) {
  TIQ.state.metrics.push(Object.assign({ ts: TIQ.nowISO() }, entry));
  try {
    localStorage.setItem(TIQ.METRICS_KEY, JSON.stringify(TIQ.state.metrics));
  } catch (_) {}
};

TIQ.addAuditEntry = function(candidate, action, detail) {
  candidate.auditLog.push({
    action: action,
    recruiter_id: TIQ.state.activeRecruiterId,
    timestamp: TIQ.nowISO(),
    time_to_complete: 0,
    detail: detail
  });
  candidate.lastUpdated = TIQ.todayISO();
};

/* ---- Face enrollment helpers (Milestone 1) ---- */
TIQ.FACE_ANGLES = ["front", "left", "right", "slight_up", "slight_down"];
TIQ.FACE_MODEL = "Facenet512";
TIQ.FACE_DB_NAME = "talentiq_face_v1";
TIQ.FACE_STORE = "embeddings";

TIQ.defaultFaceEnrollment = function() {
  return {
    enrolled: false,
    model: TIQ.FACE_MODEL,
    angles: {
      front: null,
      left: null,
      right: null,
      slight_up: null,
      slight_down: null
    },
    enrolledAt: null,
    embeddingVersion: 1
  };
};

TIQ.ensureFaceEnrollment = function(candidate) {
  if (!candidate) return null;
  if (!candidate.faceEnrollment) {
    candidate.faceEnrollment = TIQ.defaultFaceEnrollment();
  }
  return candidate.faceEnrollment;
};

/* Migrate persisted candidates missing faceEnrollment */
TIQ.state.candidates.forEach(function(c) { TIQ.ensureFaceEnrollment(c); });

TIQ.faceDB = {
  _db: null,

  open: function() {
    var self = this;
    if (self._db) return Promise.resolve(self._db);
    return new Promise(function(resolve, reject) {
      var req = indexedDB.open(TIQ.FACE_DB_NAME, 1);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(TIQ.FACE_STORE)) {
          db.createObjectStore(TIQ.FACE_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = function(e) {
        self._db = e.target.result;
        resolve(self._db);
      };
      req.onerror = function() { reject(req.error || new Error("IndexedDB open failed")); };
    });
  },

  _key: function(candidateId, angle) {
    return candidateId + ":" + angle;
  },

  put: function(record) {
    return this.open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(TIQ.FACE_STORE, "readwrite");
        var store = tx.objectStore(TIQ.FACE_STORE);
        var payload = Object.assign({}, record, {
          id: TIQ.faceDB._key(record.candidateId, record.angle)
        });
        var req = store.put(payload);
        req.onsuccess = function() { resolve(payload); };
        req.onerror = function() { reject(req.error); };
      });
    });
  },

  get: function(candidateId, angle) {
    return this.open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(TIQ.FACE_STORE, "readonly");
        var req = tx.objectStore(TIQ.FACE_STORE).get(TIQ.faceDB._key(candidateId, angle));
        req.onsuccess = function() { resolve(req.result || null); };
        req.onerror = function() { reject(req.error); };
      });
    });
  },

  getAllForCandidate: function(candidateId) {
    return this.open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(TIQ.FACE_STORE, "readonly");
        var req = tx.objectStore(TIQ.FACE_STORE).getAll();
        req.onsuccess = function() {
          var all = req.result || [];
          resolve(all.filter(function(r) { return r.candidateId === candidateId; }));
        };
        req.onerror = function() { reject(req.error); };
      });
    });
  },

  deleteAngle: function(candidateId, angle) {
    return this.open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(TIQ.FACE_STORE, "readwrite");
        var req = tx.objectStore(TIQ.FACE_STORE).delete(TIQ.faceDB._key(candidateId, angle));
        req.onsuccess = function() { resolve(); };
        req.onerror = function() { reject(req.error); };
      });
    });
  },

  deleteCandidate: function(candidateId) {
    var self = this;
    return self.getAllForCandidate(candidateId).then(function(rows) {
      return Promise.all(rows.map(function(r) {
        return self.deleteAngle(r.candidateId, r.angle);
      }));
    });
  }
};

TIQ.applyFaceAngleResult = function(candidate, angle, embeddingId, qualityOk) {
  var fe = TIQ.ensureFaceEnrollment(candidate);
  fe.angles[angle] = {
    capturedAt: TIQ.nowISO(),
    embeddingId: embeddingId,
    qualityOk: !!qualityOk
  };
  fe.model = TIQ.FACE_MODEL;
  var allOk = TIQ.FACE_ANGLES.every(function(a) {
    return fe.angles[a] && fe.angles[a].qualityOk;
  });
  if (allOk) {
    fe.enrolled = true;
    fe.enrolledAt = TIQ.nowISO();
  } else {
    fe.enrolled = false;
  }
  return fe;
};

/* ---- Info proposals (conversation / resume → swipe cards) ---- */
TIQ.FIELD_LABELS = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  university: "University",
  major: "Major",
  graduationDate: "Graduation Date",
  gpa: "GPA",
  workAuthorization: "Work Authorization",
  skills: "Skills",
  notes: "Notes",
  function: "Function"
};

TIQ.createProposal = function(opts) {
  opts = opts || {};
  var candidate = TIQ.state.candidates.find(function(c) { return c.id === opts.candidateId; });
  var prev = candidate ? candidate[opts.field] : null;
  if (Array.isArray(prev)) prev = prev.join(", ");
  var proposal = {
    id: "P-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
    candidateId: opts.candidateId,
    field: opts.field,
    label: opts.label || TIQ.FIELD_LABELS[opts.field] || opts.field,
    value: opts.value,
    previousValue: prev == null ? "" : String(prev),
    source: opts.source || "conversation",
    sourceRef: opts.sourceRef || {},
    status: "pending",
    verified: false,
    createdAt: TIQ.nowISO()
  };
  if (!TIQ.state.proposals) TIQ.state.proposals = [];
  // Skip duplicate pending same candidate+field+value
  var dup = TIQ.state.proposals.some(function(p) {
    return p.status === "pending" && p.candidateId === proposal.candidateId &&
      p.field === proposal.field && String(p.value) === String(proposal.value);
  });
  if (dup) return null;
  TIQ.state.proposals.push(proposal);
  TIQ.saveState();
  return proposal;
};

TIQ.getPendingProposals = function() {
  return (TIQ.state.proposals || []).filter(function(p) { return p.status === "pending"; });
};

TIQ.acceptProposal = function(proposalId) {
  var p = (TIQ.state.proposals || []).find(function(x) { return x.id === proposalId; });
  if (!p || p.status !== "pending") return null;
  var c = TIQ.state.candidates.find(function(x) { return x.id === p.candidateId; });
  if (!c) return null;

  if (p.field === "skills") {
    var parts = String(p.value).split(/[,;]+/).map(function(s) { return s.trim(); }).filter(Boolean);
    c.skills = Array.isArray(c.skills) ? c.skills.slice() : [];
    parts.forEach(function(sk) {
      if (c.skills.indexOf(sk) < 0) c.skills.push(sk);
    });
  } else {
    c[p.field] = p.value;
  }

  if (!c.traceability) c.traceability = [];
  c.traceability.push(
    p.label + " = " + p.value + " — " + p.source +
    (p.sourceRef && p.sourceRef.quote ? ' ("' + p.sourceRef.quote + '")' : "")
  );
  p.status = "accepted";
  p.verified = true;
  p.resolvedAt = TIQ.nowISO();
  TIQ.addAuditEntry(c, "PROPOSAL_ACCEPTED",
    "Accepted " + p.label + " from " + p.source + ": " + p.value);
  TIQ.saveState();
  return p;
};

TIQ.rejectProposal = function(proposalId) {
  var p = (TIQ.state.proposals || []).find(function(x) { return x.id === proposalId; });
  if (!p || p.status !== "pending") return null;
  p.status = "rejected";
  p.verified = false;
  p.resolvedAt = TIQ.nowISO();
  var c = TIQ.state.candidates.find(function(x) { return x.id === p.candidateId; });
  if (c) {
    TIQ.addAuditEntry(c, "PROPOSAL_REJECTED",
      "Rejected " + p.label + " from " + p.source + ": " + p.value);
  }
  TIQ.saveState();
  return p;
};

/* ---- Recording metadata + blob store ---- */
TIQ.RECORDING_DB_NAME = "talentiq_recordings_v1";
TIQ.RECORDING_STORE = "blobs";

TIQ.recordingDB = {
  _db: null,
  open: function() {
    var self = this;
    if (self._db) return Promise.resolve(self._db);
    return new Promise(function(resolve, reject) {
      var req = indexedDB.open(TIQ.RECORDING_DB_NAME, 1);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(TIQ.RECORDING_STORE)) {
          db.createObjectStore(TIQ.RECORDING_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = function(e) { self._db = e.target.result; resolve(self._db); };
      req.onerror = function() { reject(req.error || new Error("recording DB open failed")); };
    });
  },
  put: function(id, blob, meta) {
    return this.open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(TIQ.RECORDING_STORE, "readwrite");
        var req = tx.objectStore(TIQ.RECORDING_STORE).put({
          id: id, blob: blob, meta: meta || {}, createdAt: TIQ.nowISO()
        });
        req.onsuccess = function() { resolve(id); };
        req.onerror = function() { reject(req.error); };
      });
    });
  },
  get: function(id) {
    return this.open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(TIQ.RECORDING_STORE, "readonly");
        var req = tx.objectStore(TIQ.RECORDING_STORE).get(id);
        req.onsuccess = function() { resolve(req.result || null); };
        req.onerror = function() { reject(req.error); };
      });
    });
  }
};

TIQ.addRecordingMeta = function(meta) {
  if (!TIQ.state.recordings) TIQ.state.recordings = [];
  TIQ.state.recordings.push(meta);
  TIQ.saveState();
  return meta;
};

TIQ.getAllFaceEmbeddings = function() {
  return TIQ.faceDB.open().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(TIQ.FACE_STORE, "readonly");
      var req = tx.objectStore(TIQ.FACE_STORE).getAll();
      req.onsuccess = function() { resolve(req.result || []); };
      req.onerror = function() { reject(req.error); };
    });
  });
};

