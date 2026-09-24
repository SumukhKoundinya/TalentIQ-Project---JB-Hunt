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

/* getMissingFlags defined below in TIQ.ai section (enhanced version) */

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

var TIQ_STATE_MIGRATION_NEEDED = false;

function buildAccomplishments(c) {
  if (!c) return [];
  var accs = [];
  var resume = c.parsedResume || null;
  var experience = (resume && resume.experience) || [];
  var projects = (resume && resume.projects) || [];
  var certs = (resume && resume.certifications) || [];

  certs.forEach(function(cert) {
    if (accs.length < 3) accs.push({ text: cert, source: "resume" });
  });

  experience.forEach(function(exp) {
    var desc = exp.description || "";
    var metricMatch = desc.match(/(\d+[KkMm+]?[+]?)\s*(?:records|users|students|projects|team|employees|clients|orders|transactions|requests|API calls|percent|%|reduction|improvement|increase)/i);
    if (metricMatch && accs.length < 3) {
      accs.push({ text: "Handled " + metricMatch[0], source: "resume" });
    }
    var leadMatch = desc.match(/((?:led|managed|mentored|supervised|directed|coordinated|organized)\s+[^.!?]{10,60})/i);
    if (leadMatch && accs.length < 3) {
      accs.push({ text: leadMatch[1].trim(), source: "resume" });
    }
  });

  projects.forEach(function(proj) {
    if (proj.name && accs.length < 3) {
      accs.push({ text: "Project: " + proj.name, source: "resume" });
    }
  });

  if (accs.length === 0 && c.notes) {
    var sentences = c.notes.split(/[.!?]+/).filter(function(s) { return s.trim().length > 10; });
    if (sentences.length) {
      accs.push({ text: sentences[0].trim(), source: "conversation" });
    }
  }

  return accs.slice(0, 3);
}

TIQ.normalizeCandidate = function(candidate, seedCandidate) {
  var c = Object.assign({}, seedCandidate || {}, candidate || {});
  if (!c.accomplishments || !c.accomplishments.length) {
    c.accomplishments = (seedCandidate && seedCandidate.accomplishments && seedCandidate.accomplishments.length)
      ? seedCandidate.accomplishments.slice()
      : buildAccomplishments(c);
  }
  return c;
};

TIQ.state = (function() {
  var persisted = TIQ.loadPersistedState();
  var persistedCandidates = (persisted && persisted.candidates) || [];
  var normalizedCandidates = persistedCandidates.length
    ? persistedCandidates.map(function(c) {
        var seed = TIQ.seedCandidates.find(function(s) { return s.id === c.id; });
        var normalized = TIQ.normalizeCandidate(c, seed);
        if (!c.accomplishments || !c.accomplishments.length) TIQ_STATE_MIGRATION_NEEDED = true;
        return normalized;
      })
    : TIQ.seedCandidates.map(function(c) { return TIQ.normalizeCandidate(c, c); });
  return {
    candidates: normalizedCandidates,
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

if (TIQ_STATE_MIGRATION_NEEDED) TIQ.saveState();

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

/* ---- IndexedDB Audio Persistence ---- */
TIQ.AudioDB = (function() {
  var DB_NAME = "TalentIQAudio";
  var DB_VERSION = 1;
  var STORE = "blobs";
  var _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise(function(resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      };
      req.onsuccess = function(e) {
        _db = e.target.result;
        resolve(_db);
      };
      req.onerror = function(e) {
        console.error("[TalentIQ] IndexedDB open failed:", e.target.error);
        reject(e.target.error);
      };
    });
  }

  function saveBlob(id, blob) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(blob, id);
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function(e) { reject(e.target.error); };
      });
    });
  }

  function getBlob(id) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).get(id);
        req.onsuccess = function() { resolve(req.result || null); };
        req.onerror = function(e) { reject(e.target.error); };
      });
    });
  }

  function deleteBlob(id) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function(e) { reject(e.target.error); };
      });
    });
  }

  function deleteAll() {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).clear();
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function(e) { reject(e.target.error); };
      });
    });
  }

  return { saveBlob: saveBlob, getBlob: getBlob, deleteBlob: deleteBlob, deleteAll: deleteAll };
})();

/* ---- Offline Sync ---- */
window.addEventListener("online", function() {
  var changed = false;
  TIQ.state.candidates.forEach(function(c) {
    (c.audioNotes || []).forEach(function(note) {
      if (note.offlinePending) {
        note.offlinePending = false;
        changed = true;
      }
    });
  });
  if (changed) {
    TIQ.saveState();
    console.log("[TalentIQ] Back online — synced pending audio notes.");
  }
});

/* ---- QR Code Generator (via qrcode-generator library) ---- */
TIQ.qr = (function() {
  function renderTo(text, targetCanvas, options) {
    options = options || {};
    var margin = options.margin || 4;
    try {
      var qr = qrcode(0, 'L');
      qr.addData(text);
      qr.make();

      var moduleCount = qr.getModuleCount();
      var scale = options.scale || Math.max(1, Math.round(400 / (moduleCount + margin * 2)));
      var totalSize = (moduleCount + margin * 2) * scale;
      targetCanvas.width = totalSize;
      targetCanvas.height = totalSize;
      var ctx = targetCanvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, totalSize, totalSize);
      ctx.fillStyle = '#000000';
      for (var r = 0; r < moduleCount; r++) {
        for (var c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect((c + margin) * scale, (r + margin) * scale, scale, scale);
          }
        }
      }
    } catch(e) {
      console.error('[TalentIQ] QR render error:', e.message, e);
      targetCanvas.width = 240;
      targetCanvas.height = 240;
      var ctx2 = targetCanvas.getContext('2d');
      ctx2.fillStyle = '#FFEE00';
      ctx2.fillRect(0, 0, 240, 240);
      ctx2.fillStyle = '#000';
      ctx2.font = '14px monospace';
      ctx2.fillText('QR Error: ' + e.message, 10, 120);
    }
  }

  return { renderTo: renderTo };
})();

/* ============================================
   TalentIQ — AI Resume Parser & Summarizer
   ============================================ */
TIQ.ai = {};

/* ---- Skills dictionary for extraction ---- */
TIQ.ai.SKILLS_DICT = [
  "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "R", "MATLAB", "Scala", "Perl", "Lua", "Dart", "Elixir", "Haskell", "Assembly", "COBOL", "Fortran",
  "React", "React.js", "Vue", "Vue.js", "Angular", "Angular.js", "Svelte", "Next.js", "Nuxt.js", "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring", "Spring Boot", "ASP.NET", "Laravel", "Rails", "Symfony",
  "HTML", "CSS", "SASS", "SCSS", "Tailwind", "Bootstrap", "jQuery",
  "SQL", "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "Cassandra", "DynamoDB", "Firebase", "Supabase", "Neo4j",
  "AWS", "Azure", "GCP", "Google Cloud", "Heroku", "DigitalOcean", "Linode", "Vercel", "Netlify", "Cloudflare",
  "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "CircleCI", "GitHub Actions", "GitLab CI", "Travis CI",
  "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Trello", "Notion", "Linear",
  "Machine Learning", "Deep Learning", "NLP", "Natural Language Processing", "Computer Vision", "TensorFlow", "PyTorch", "Keras", "scikit-learn", "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "OpenCV", "Hugging Face", "LangChain", "OpenAI", "LLM",
  "REST", "REST API", "GraphQL", "gRPC", "WebSocket", "SOAP",
  "Agile", "Scrum", "Kanban", "Sprint", "CI/CD", "DevOps", "Microservices",
  "Linux", "Unix", "Bash", "Shell Scripting", "PowerShell", "Windows Server",
  "Tableau", "Power BI", "Looker", "Excel", "Google Sheets", "Jupyter", "R Markdown",
  "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign",
  "Communication", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking",
  "Supply Chain", "Logistics", "Transportation", "Fleet Management", "Warehouse", "Freight",
  "JavaScript ES6", "Redux", "MobX", "Webpack", "Vite", "Babel", "ESLint",
  "Apache", "Nginx", "IIS", "Tomcat",
  "Spark", "Hadoop", "Hive", "Kafka", "Airflow", "dbt",
  "Cypress", "Selenium", "Jest", "Mocha", "Chai", "Playwright", "Pytest",
  "OAuth", "JWT", "SSL", "TLS", "CORS",
  "Stripe", "Twilio", "SendGrid", "Twilio"
];

/* ---- Skill taxonomy — recruiter-scannable groups (display order) ---- */
TIQ.SKILL_GROUPS = [
  {
    key: "languages", label: "Languages",
    match: ["python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin", "r", "matlab", "scala", "perl", "lua", "dart", "elixir", "haskell", "assembly", "cobol", "fortran", "javascript es6"]
  },
  {
    key: "frameworks", label: "Frameworks & Web",
    match: ["react", "react.js", "vue", "vue.js", "angular", "angular.js", "svelte", "next.js", "nuxt.js", "node.js", "express", "django", "flask", "fastapi", "spring", "spring boot", "asp.net", "laravel", "rails", "symfony", "html", "css", "sass", "scss", "tailwind", "bootstrap", "jquery", "rest", "rest api", "apis", "api", "graphql", "grpc", "websocket", "soap", "redux", "mobx", "webpack", "vite", "babel", "eslint", "microservices", "cypress", "selenium", "jest", "mocha", "chai", "playwright", "pytest"]
  },
  {
    key: "data", label: "Data & Analytics",
    match: ["sql", "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra", "dynamodb", "firebase", "supabase", "neo4j", "tableau", "power bi", "looker", "excel", "google sheets", "jupyter", "r markdown", "pandas", "numpy", "scipy", "matplotlib", "seaborn", "spark", "hadoop", "hive", "kafka", "airflow", "dbt", "statistics", "visualization", "data visualization", "etl", "analytics"]
  },
  {
    key: "ai", label: "AI / ML",
    match: ["machine learning", "deep learning", "nlp", "natural language processing", "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "hugging face", "langchain", "openai", "llm", "ai"]
  },
  {
    key: "cloud", label: "Cloud & DevOps",
    match: ["aws", "azure", "gcp", "google cloud", "heroku", "digitalocean", "linode", "vercel", "netlify", "cloudflare", "docker", "kubernetes", "terraform", "ansible", "jenkins", "circleci", "github actions", "gitlab ci", "travis ci", "ci/cd", "devops", "git", "github", "gitlab", "bitbucket", "apache", "nginx", "iis", "tomcat", "stripe", "twilio", "sendgrid"]
  },
  {
    key: "systems", label: "Systems & Security",
    match: ["linux", "unix", "bash", "shell scripting", "powershell", "windows server", "networking", "incident response", "oauth", "jwt", "ssl", "tls", "cors", "cybersecurity", "vulnerability assessment", "penetration testing", "wireshark"]
  },
  {
    key: "ops", label: "Operations & Supply Chain",
    match: ["supply chain", "logistics", "transportation", "fleet management", "warehouse", "freight", "operations", "forecasting", "process improvement", "process mapping", "lean", "simulation", "erp", "six sigma", "inventory", "procurement", "optimization", "scheduling", "quality improvement", "safety"]
  },
  {
    key: "methods", label: "Methods & Soft Skills",
    match: ["agile", "scrum", "kanban", "sprint", "communication", "leadership", "teamwork", "problem solving", "critical thinking", "decision making", "collaboration", "project management", "jira", "confluence", "trello", "notion", "linear", "figma", "sketch", "adobe xd", "photoshop", "illustrator", "indesign"]
  },
  {
    key: "other", label: "Other Skills",
    match: []
  }
];

TIQ.categorizeSkills = function(skills) {
  if (!skills || !skills.length) return [];
  if (!TIQ._skillGroupIndex) {
    var idx = {};
    for (var g = 0; g < TIQ.SKILL_GROUPS.length; g++) {
      var group = TIQ.SKILL_GROUPS[g];
      for (var m = 0; m < group.match.length; m++) idx[group.match[m]] = group.key;
    }
    TIQ._skillGroupIndex = idx;
  }
  var byKey = {};
  var seen = {};
  for (var i = 0; i < skills.length; i++) {
    var raw = String(skills[i] == null ? "" : skills[i]).replace(/\s+/g, " ").trim();
    if (!raw) continue;
    var norm = raw.toLowerCase();
    if (seen[norm]) continue;
    seen[norm] = true;
    var key = TIQ._skillGroupIndex[norm] || "other";
    if (!byKey[key]) byKey[key] = [];
    byKey[key].push(raw);
  }
  var out = [];
  for (var j = 0; j < TIQ.SKILL_GROUPS.length; j++) {
    var gi = TIQ.SKILL_GROUPS[j];
    if (byKey[gi.key] && byKey[gi.key].length) {
      out.push({ key: gi.key, label: gi.label, items: byKey[gi.key] });
    }
  }
  return out;
};

/* ---- Experience section patterns ---- */
TIQ.ai.SECTION_HEADERS = [
  "experience", "work experience", "employment", "work history",
  "education", "academic", "degree",
  "projects", "project experience", "personal projects", "capstone",
  "skills", "technical skills", "competencies",
  "certifications", "licenses", "credentials",
  "internships", "internship"
];

TIQ.ai.extractResumeData = function(text) {
  if (!text) return null;
  return {
    skills: TIQ.ai._extractSkills(text),
    experience: TIQ.ai._extractExperience(text),
    projects: TIQ.ai._extractProjects(text),
    education: TIQ.ai._extractEducation(text),
    gpa: TIQ.ai._extractGPA(text),
    certifications: TIQ.ai._extractCertifications(text),
    contact: this._extractContact(text),
    rawText: text
  };
};

TIQ.ai._extractSkills = function(text) {
  var found = [];
  var lower = text.toLowerCase();
  var dict = TIQ.ai.SKILLS_DICT;
  for (var i = 0; i < dict.length; i++) {
    var skill = dict[i];
    var pattern = new RegExp("\\b" + skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\.js\\b/i, "\\.?js") + "\\b", "i");
    if (pattern.test(text)) {
      var canonical = skill.replace(/\\.js$/i, ".js");
      if (found.indexOf(canonical) === -1) found.push(canonical);
    }
  }
  var contextual = [
    /(?:proficient in|experienced with|skilled in|knowledge of|familiar with|background in)\s+([A-Z][A-Za-z+#.\s,\/]+?)(?:\.|,|\n|$)/gi,
    /(?:technologies?|tools?|languages?):\s*([^\n]+)/gi
  ];
  for (var j = 0; j < contextual.length; j++) {
    var match;
    while ((match = contextual[j].exec(text)) !== null) {
      var parts = match[1].split(/[,\/]+/);
      for (var k = 0; k < parts.length; k++) {
        var s = parts[k].trim();
        if (s.length > 1 && s.length < 40 && found.indexOf(s) === -1) found.push(s);
      }
    }
  }
  return found.slice(0, 20);
};

TIQ.ai._extractExperience = function(text) {
  var experiences = [];
  var lines = text.split("\n");
  var inSection = false;
  var current = null;
  var expPattern = /(?:experience|employment|work history|internships|internship)/i;
  var nextSectionPattern = /^(?:education|projects|skills|certifications|licenses|references|awards|hobbies)/i;
  var jobPattern = /(?:(?:Software|Data|Cloud|DevOps|Full[\s-]?Stack|Front[\s-]?End|Back[\s-]?End|Mobile|Web|Junior|Senior|Lead|Associate|Staff|Principal|Systems|Network|Security|Database|QA|Quality|Product|Project|Business|Operations|Research|Teaching|Lab|Graduate|Undergraduate)\s+(?:Engineer|Analyst|Developer|Intern|Scientist|Architect|Administrator|Manager|Consultant|Designer|Specialist|Technician|Coordinator|Assistant))/i;
  var datePattern = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\s*[-–—to]+\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|[Pp]resent|[Cc]urrent)/;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (expPattern.test(line)) { inSection = true; continue; }
    if (inSection && nextSectionPattern.test(line)) break;
    if (inSection && line.length > 0) {
      if (jobPattern.test(line) || (datePattern.test(line) && line.length < 80)) {
        if (current && current.title) experiences.push(current);
        var titleMatch = line.match(jobPattern);
        var title = line;
        var companySource = line;
        if (titleMatch) {
          var levelMatch = line.slice(titleMatch[0].length).match(/^\s*((?:Junior|Senior|Lead|Associate|Staff|Principal|Graduate|Undergraduate|Intern|Apprentice|Trainee)\w*)/i);
          title = titleMatch[0] + (levelMatch ? " " + levelMatch[1] : "");
          companySource = line.slice(title.length);
        }
        var dateMatch = line.match(datePattern);
        var company = companySource.replace(datePattern, "").replace(/[|,\-–]+/g, "").trim();
        current = {
          title: title,
          company: company || "",
          dates: dateMatch ? dateMatch[0] : "",
          description: ""
        };
      } else if (current) {
        current.description += (current.description ? " " : "") + line;
      }
    }
  }
  if (current && current.title) experiences.push(current);
  return experiences.slice(0, 5);
};

TIQ.ai._extractProjects = function(text) {
  var projects = [];
  var lines = text.split("\n");
  var inSection = false;
  var current = null;
  var projPattern = /(?:projects|personal projects|capstone|capstone projects|academic projects)/i;
  var nextSectionPattern = /^(?:skills|certifications|references|awards|hobbies|extracurricular)/i;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (projPattern.test(line)) { inSection = true; continue; }
    if (inSection && nextSectionPattern.test(line)) break;
    if (inSection && line.length > 2) {
      if (line.length < 80 && /^[A-Z]/.test(line) && !/^[A-Z]{2,}/.test(line)) {
        if (current && current.name) projects.push(current);
        current = { name: line, description: "" };
      } else if (current) {
        current.description += (current.description ? " " : "") + line;
      } else {
        current = { name: line.split(/[—–\-:|]/)[0].trim(), description: line.split(/[—–\-:|]/).slice(1).join(" ").trim() };
      }
    }
  }
  if (current && current.name) projects.push(current);
  return projects.slice(0, 5);
};

TIQ.ai._extractEducation = function(text) {
  var education = [];
  var lines = text.split("\n");
  var inSection = false;
  var current = null;
  var eduPattern = /(?:education|academic|degree)/i;
  var nextSectionPattern = /^(?:experience|work|projects|skills|certifications)/i;
  var degreePattern = /(?:Bachelor|Master|Ph\.?D|Associate|MBA|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|B\.?Sc|M\.?Sc|Doctorate|Certificate|Diploma)/i;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (eduPattern.test(line)) { inSection = true; continue; }
    if (inSection && nextSectionPattern.test(line)) break;
    if (inSection && line.length > 2) {
      if (degreePattern.test(line) || (line.length < 100 && /[Uu]niversit|[Cc]ollege|[Ii]nstitut|[Ss]chool/.test(line))) {
        if (current && current.school) education.push(current);
        var schoolMatch = line.match(/((?:University|College|Institute|School)[A-Za-z .&']*|[A-Z][A-Za-z .&']+(?:University|College|Institute|School)[A-Za-z .&']*)/);
        var degreeMatch = line.match(degreePattern);
        current = {
          school: schoolMatch ? schoolMatch[1].trim() : line,
          degree: degreeMatch ? degreeMatch[0] : "",
          major: "",
          year: ""
        };
        var yearMatch = line.match(/\b(20\d{2})\b/);
        if (yearMatch) current.year = yearMatch[1];
        var majorMatch = line.match(/(?:in|of)\s+([A-Z][A-Za-z\s]+?)(?:\s*,|\s*\(|$)/);
        if (majorMatch) current.major = majorMatch[1].trim();
      } else if (current) {
        if (!current.major) {
          var mMatch = line.match(/(?:Major|Concentration|Focus|Specialization):\s*(.+)/i);
          if (mMatch) current.major = mMatch[1].trim();
        }
        if (!current.year) {
          var yMatch = line.match(/\b(20\d{2})\b/);
          if (yMatch) current.year = yMatch[1];
        }
      }
    }
  }
  if (current && current.school) education.push(current);
  return education.slice(0, 3);
};

TIQ.ai._extractGPA = function(text) {
  var patterns = [
    /GPA[:\s]*(?:of\s*)?(\d\.\d{1,2})/i,
    /GPA:\s*(\d\.\d{1,2})/i,
    /Cumulative\s+(?:GPA|Grade\s+Point\s+Average)[:\s]*(\d\.\d{1,2})/i,
    /(\d\.\d{1,2})\s*(?:GPA|\/\s*4\.?0)/i
  ];
  for (var i = 0; i < patterns.length; i++) {
    var match = text.match(patterns[i]);
    if (match) return match[1];
  }
  return "";
};

TIQ.ai._extractCertifications = function(text) {
  var certs = [];
  var certPatterns = [
    /AWS\s+Certified\s+[\w\s]+/gi,
    /CompTIA\s+[\w\s]+/gi,
    /Google\s+Cloud\s+Certified[\w\s]*/gi,
    /Microsoft\s+Certified[\w\s]*/gi,
    /Azure\s+Certified[\w\s]*/gi,
    /Cisco\s+Certified[\w\s]*/gi,
    /PMP/gi,
    /Six\s+Sigma\s+(?:Green|Black|Yellow)\s+Belt/gi,
    /Certified\s+[\w\s]+(?:Professional|Specialist|Engineer|Associate|Practitioner)/gi,
    /[A-Z]{2,5}-\d{3,5}/g
  ];
  for (var i = 0; i < certPatterns.length; i++) {
    var match;
    while ((match = certPatterns[i].exec(text)) !== null) {
      var cert = match[0].trim();
      if (cert.length > 3 && cert.length < 60 && certs.indexOf(cert) === -1) certs.push(cert);
    }
  }
  return certs.slice(0, 5);
};

/* ---- Contact Extraction ---- */
TIQ.ai.MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

TIQ.ai._extractEmail = function (text) {
  var m = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return m ? m[0] : '';
};

TIQ.ai._extractPhone = function (text) {
  var m = text.match(/(?:\+?1[\s.-]?)?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}/);
  return m ? m[0] : '';
};

TIQ.ai._extractName = function (text) {
  var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
  for (var i = 0; i < Math.min(lines.length, 6); i++) {
    var ln = lines[i];
    if (ln.length > 40) continue;
    if (/[[\]{}<>;@|]/.test(ln) || /^[A-Za-z]+,\s*[A-Z]{2}\b/.test(ln)) continue;
    if (/@/.test(ln) || /\b(address|email|contact|resume|cv|name)\b/i.test(ln)) continue;
    if (/\d/.test(ln)) continue;
    var words = ln.split(/\s+/);
    if (words.length < 2 || words.length > 4) continue;
    if (!/^[A-Z]/.test(ln)) continue;
    if (ln.replace(/[^a-zA-Z]/g, '').length < 6) continue;
    return ln;
  }
  return '';
};

TIQ.ai._normalizeMonthYear = function (monthWord, year) {
  monthWord = monthWord.toLowerCase();
  var full = this.MONTHS.find(function (m) { return m.toLowerCase().indexOf(monthWord) === 0 && monthWord.length >= 3; });
  return full ? full + ' ' + year : '';
};

TIQ.ai._extractGraduationDate = function (text) {
  var monthPat = '(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:January|February|March|April|May|June|July|August|September|October|November|December))';
  var exp = new RegExp('(?:expected|anticipated|grad\\w*)[^\\n]{0,40}?(' + monthPat + ')\\s*(\\d{4})', 'i');
  var m = text.match(exp);
  if (m) return this._normalizeMonthYear(m[1], m[2]);
  var plain = text.match(new RegExp('(?:graduat\\w*|class of|graduation\\w*)[^\\n]{0,40}?(' + monthPat + ')\\s*(\\d{4})', 'i'));
  if (plain) return this._normalizeMonthYear(plain[1], plain[2]);
  var first = text.match(new RegExp('(' + monthPat + ')\\s*(\\d{4})'));
  return first ? this._normalizeMonthYear(first[1], first[2]) : '';
};

TIQ.ai._extractContact = function (rawText) {
  var email = this._extractEmail(rawText);
  var phone = this._extractPhone(rawText);
  var name = this._extractName(rawText);
  var graduationDate = this._extractGraduationDate(rawText);
  var parts = name ? name.split(/\s+/) : [];
  return {
    name: name,
    firstName: parts.length ? parts[0] : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
    email: email,
    phone: phone,
    graduationDate: graduationDate
  };
};

/* ---- Summary Generator ---- */
TIQ.ai.generateSummary = function(c) {
  if (!c) return { summary: "", traceability: [], missingData: [] };
  var resume = c.parsedResume || null;
  var parts = [];
  var trace = [];
  var missing = [];

  var name = (c.firstName || "The candidate") + (c.lastName ? " " + c.lastName : "");
  var school = c.university || (resume && resume.education && resume.education[0] && resume.education[0].school) || "";
  var major = c.major || (resume && resume.education && resume.education[0] && resume.education[0].major) || "";
  var gradDate = c.graduationDate || "";
  var gpa = c.gpa || (resume && resume.gpa) || "";

  if (school || major) {
    var eduStr = name + " is";
    if (school && major) {
      eduStr += " a " + major + " student at " + school;
      trace.push("Education: " + school + " " + major + " — intake form");
    } else if (school) {
      eduStr += " a student at " + school;
      trace.push("School: " + school + " — intake form");
    } else {
      eduStr += " a " + major + " student";
      trace.push("Major: " + major + " — intake form");
    }
    if (gradDate) {
      eduStr += " (graduating " + gradDate + ")";
      trace.push("Graduation: " + gradDate + " — intake form");
    }
    eduStr += ".";
    parts.push(eduStr);
  } else {
    parts.push(name + " is a candidate in the system.");
    missing.push({ key: "Education", label: "Education details missing", source: "intake form" });
  }

  var allSkills = (c.skills && c.skills.length) ? c.skills : (resume && resume.skills) || [];
  if (allSkills.length) {
    var skillList = allSkills.length <= 3 ? allSkills.join(", ") : allSkills.slice(0, 3).join(", ") + " and " + allSkills.slice(3).join(", ");
    var skillSource = (c.skills && c.skills.length) ? " — recruiter input" : " — resume";
    parts.push(skillSource.indexOf("resume") >= 0
      ? "Their resume highlights proficiency in " + skillList + "."
      : "Skills captured include " + skillList + ".");
    trace.push("Skills: " + skillList + skillSource);
  } else {
    missing.push({ key: "Skills", label: "No skills captured", source: "resume/inputs" });
  }

  if (resume && resume.experience && resume.experience.length) {
    var exp = resume.experience[0];
    var expStr = "Experience includes " + (exp.title || "a role");
    if (exp.company) expStr += " at " + exp.company;
    if (exp.dates) expStr += " (" + exp.dates + ")";
    expStr += ".";
    parts.push(expStr);
    trace.push("Experience: " + exp.title + (exp.company ? " at " + exp.company : "") + " — resume");
  } else if (resume && resume.projects && resume.projects.length) {
    var proj = resume.projects[0];
    parts.push("Notable project: " + proj.name + (proj.description ? " — " + proj.description.slice(0, 80) : "") + ".");
    trace.push("Project: " + proj.name + " — resume");
  }

  if (c.workAuthorization) {
    parts.push("Work authorization: " + c.workAuthorization + ".");
    trace.push("Work authorization: " + c.workAuthorization + " — recruiter input");
  } else {
    missing.push({ key: "Work Authorization", label: "Work authorization not confirmed", source: "recruiter input" });
  }

  if (c.workLocations && c.workLocations.length) {
    parts.push("Preferred location" + (c.workLocations.length > 1 ? "s" : "") + ": " + c.workLocations.join(", ") + ".");
    trace.push("Location preference: " + c.workLocations.join(", ") + " — recruiter input");
  } else {
    missing.push({ key: "Location", label: "Location preference missing", source: "recruiter input" });
  }

  if (c.function) {
    trace.push("Role interest: " + c.function + " — recruiter input");
  }

  if (c.notes) {
    var notePreview = c.notes.length > 120 ? c.notes.slice(0, 117) + "..." : c.notes;
    parts.push("Recruiter notes: \"" + notePreview + "\"");
    trace.push("Recruiter notes — capture conversation");
  } else {
    missing.push({ key: "Notes", label: "No recruiter notes captured", source: "capture conversation" });
  }

  if (c.areasDiscussed && c.areasDiscussed.length) {
    parts.push("Areas discussed: " + c.areasDiscussed.join(", ") + ".");
    trace.push("Areas discussed: " + c.areasDiscussed.join(", ") + " — recruiter input");
  } else {
    missing.push({ key: "Areas Discussed", label: "Areas discussed not logged", source: "recruiter input" });
  }

  if (resume && resume.certifications && resume.certifications.length) {
    parts.push("Certifications: " + resume.certifications.join(", ") + ".");
    trace.push("Certifications: " + resume.certifications.join(", ") + " — resume");
  }

  if (!c.phone) {
    missing.push({ key: "Phone", label: "Contact phone missing", source: "intake form" });
  }

  return {
    summary: parts.join(" "),
    traceability: trace,
    missingData: missing
  };
};

/* ---- PDF Parsing Orchestrator ---- */
TIQ.ai.parseAndStoreResume = function(candidate, file) {
  if (!window.pdfjsLib) {
    console.warn("[TalentIQ] PDF.js not loaded — skipping resume parse");
    return Promise.resolve(null);
  }
  return new Promise(function(resolve) {
    var reader = new FileReader();
    reader.onload = function() {
      var typedArray = new Uint8Array(reader.result);
      pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
        var textParts = [];
        var promises = [];
        for (var i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          (function(pageNum) {
            promises.push(pdf.getPage(pageNum).then(function(page) {
              return page.getTextContent().then(function(content) {
                var pageText = content.items.map(function(item) { return item.str; }).join(" ");
                textParts.push(pageText);
              });
            }));
          })(i);
        }
        Promise.all(promises).then(function() {
          var fullText = textParts.join("\n");
          console.log("[TalentIQ] Resume text extracted, length:", fullText.length);
          var parsed = TIQ.ai.extractResumeData(fullText);
          candidate.parsedResume = parsed;

          if (parsed && parsed.gpa && !candidate.gpa) candidate.gpa = parsed.gpa;
          if (parsed && parsed.skills && parsed.skills.length && (!candidate.skills || !candidate.skills.length)) {
            candidate.skills = parsed.skills;
          }

          var result = TIQ.ai.generateSummary(candidate);
          candidate.summary = result.summary;
          candidate.traceability = result.traceability;

          if (!candidate.accomplishments || !candidate.accomplishments.length) {
            candidate.accomplishments = TIQ.generateAccomplishments(candidate);
          }

          console.log("[TalentIQ] Resume parsed successfully:", {
            skills: (parsed && parsed.skills) || [],
            gpa: (parsed && parsed.gpa) || "",
            experience: (parsed && parsed.experience) || [],
            education: (parsed && parsed.education) || [],
            summaryLength: result.summary.length,
            traceCount: result.traceability.length,
            missingCount: result.missingData.length
          });

          TIQ.addAuditEntry(candidate, "RESUME_PARSED", "Extracted data from uploaded resume");
          TIQ.saveState();
          resolve(parsed);
        }).catch(function(err) {
          console.error("[TalentIQ] PDF page extraction error:", err);
          resolve(null);
        });
      }).catch(function(err) {
        console.error("[TalentIQ] PDF load error:", err);
        resolve(null);
      });
    };
    reader.onerror = function() {
      console.error("[TalentIQ] Failed to read resume file");
      resolve(null);
    };
    reader.readAsArrayBuffer(file);
  });
};

/* ---- Accomplishment Generator ---- */
TIQ.generateAccomplishments = function(c) {
  return buildAccomplishments(c);
};

/* ---- Summary Update Convenience ---- */
TIQ.ai.updateCandidateSummary = function(candidate) {
  var result = TIQ.ai.generateSummary(candidate);
  candidate.summary = result.summary;
  candidate.traceability = result.traceability;
  if (!candidate.accomplishments || !candidate.accomplishments.length) {
    candidate.accomplishments = TIQ.generateAccomplishments(candidate);
  }
  candidate.lastUpdated = TIQ.todayISO();
  TIQ.saveState();
  return result;
};

/* ---- Update getMissingFlags to handle parsedResume + summary gaps ---- */
TIQ.getMissingFlags = function(c) {
  var flags = [];
  if (!c.workAuthorization) flags.push({ key: "Work Authorization", label: "Work Auth Unspecified" });
  if (!c.graduationDate) flags.push({ key: "Graduation", label: "Grad Date Missing" });
  if (!c.gpa) flags.push({ key: "GPA", label: "GPA Missing" });
  if (!c.phone) flags.push({ key: "Phone", label: "Contact Phone Missing" });
  if (!c.resumeUpload) flags.push({ key: "Resume", label: "Resume Not Uploaded" });
  if (!c.workLocations || c.workLocations.length === 0) flags.push({ key: "Location", label: "Location Preference Missing" });
  if (!c.skills || c.skills.length === 0) flags.push({ key: "Skills", label: "No Skills Captured" });
  if (!c.notes) flags.push({ key: "Notes", label: "No Recruiter Notes" });
  if (!c.areasDiscussed || c.areasDiscussed.length === 0) flags.push({ key: "Areas Discussed", label: "Areas Not Logged" });
  return flags;
};
