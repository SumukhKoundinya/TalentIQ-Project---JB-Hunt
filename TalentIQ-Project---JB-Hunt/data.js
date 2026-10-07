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
    metrics: TIQ.loadMetrics()
  };
})();

TIQ.saveState = function() {
  try {
    localStorage.setItem(TIQ.STORAGE_KEY, JSON.stringify({
      candidates: TIQ.state.candidates,
      activeRecruiterId: TIQ.state.activeRecruiterId,
      lastSelectedId: TIQ.state.selectedId
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


