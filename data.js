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

/* ---- Event metadata: state first, config as fallback ---- */
TIQ.eventInfo = function() {
  var e = TIQ.state && TIQ.state.event ? TIQ.state.event : {};
  return {
    name: e.name || TIQ.CONFIG.eventName || '',
    date: e.date || TIQ.CONFIG.eventDate || '',
    location: e.location || TIQ.CONFIG.eventLocation || ''
  };
};

/* ---- Persistence ---- */
TIQ.loadPersistedState = function() {
  try {
    var raw = localStorage.getItem(TIQ.STORAGE_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    if (Array.isArray(parsed.candidates) && parsed.candidates.length) {
      parsed.event = parsed.event || {};
      return parsed;
    }
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

/* Pick the three statements that represent this candidate best.
   The old version walked sections in a fixed order — certifications first —
   so a resume's strongest material (an award, a shipped project, a leadership
   role) never reached the card while two raw certificate names and a
   manufactured fragment ("Handled 14 students") took all three slots.
   Now every candidate sentence is harvested, placed on a preference ladder,
   and the slots are filled one rung at a time so the three highlights also
   cover three different facets of the candidate rather than three of the
   same kind. Deterministic keyword matching only: no scoring, no ranking of
   candidates, and every highlight keeps the "resume" source it came from. */
function buildAccomplishments(c) {
  if (!c) return [];
  var resume = c.parsedResume || null;
  var experience = (resume && resume.experience) || [];
  var projects = (resume && resume.projects) || [];
  var certs = (resume && resume.certifications) || [];
  var rawText = (resume && resume.rawText) || "";

  function cleanText(val) {
    return String(val == null ? '' : val).replace(/\s+/g, ' ').trim();
  }

  function stripLabel(val) {
    return cleanText(val).replace(/^(project|projects|certifications\/training|certification|certifications|training|experience|resume|awards?)\s*:\s*/i, '');
  }

  /* Section headings, school/graduation lines (a school is not an
     accomplishment, and graduation dates are an age proxy) and contact
     details are never a highlight. */
  var SECTION_HEADER = /^(?:skills?|projects?|experience|education|leadership|activities|clubs?|technical|languages?|summary|objective|references?|relevant\s+coursework)\b/i;
  var NOT_AN_ACHIEVEMENT = /\b(?:university|college|institute|academy|campus)\b|\b(?:high|middle|elementary|junior|senior)\s+school\b|\bexpected\s+graduation\b|\bgraduation\b|\bgpa\b|grade\s+point\s+average/i;
  var MONTHS = /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/ig;

  function isNoise(val) {
    var text = cleanText(val);
    if (!text || text.length < 14) return true;
    if (/@|https?:\/\/|linkedin|phone|email|contact|resume|curriculum vitae/i.test(text)) return true;
    if (/^[-•*\u2022]+$/.test(text)) return true;
    if (SECTION_HEADER.test(text) || NOT_AN_ACHIEVEMENT.test(text)) return true;
    /* Strip years, months, "present" and every non-letter: what is left has
       to be real prose, or a bare date range like "Aug 2025 - Present" would
       qualify as a highlight. */
    var filler = text
      .replace(/\b(?:19|20)\d{2}\b/g, ' ')
      .replace(MONTHS, ' ')
      .replace(/\bpresent\b/ig, ' ')
      .replace(/[^a-z]+/ig, ' ')
      .replace(/\s+/g, '');
    if (filler.length < 8) return true;
    return false;
  }

  function isDateLine(s) {
    var rest = cleanText(s)
      .replace(MONTHS, ' ')
      .replace(/\b(?:19|20)\d{2}\b/g, ' ')
      .replace(/\bpresent\b/ig, ' ')
      .replace(/[^a-z]/gi, '');
    return rest.length < 8;
  }

  /* Split prose on resume bullets and " | " separators, merge the soft line
     wraps pdf.js introduces inside a sentence, then split on sentence enders.
     A heading and its first item routinely share one line, and structured
     descriptions arrive as a single run-on blob. */
  function splitProse(text) {
    if (!text) return [];
    var lines = String(text).replace(/\r\n?/g, '\n').split('\n').map(cleanText).filter(Boolean);
    var chunks = [];
    lines.forEach(function(line) {
      var wasBullet = /^[●•○▪]/.test(line);
      line.split(/[●•○▪]|\s\|\s/g).forEach(function(part, i) {
        part = cleanText(part);
        if (part) chunks.push({ text: part, fresh: i > 0 || wasBullet });
      });
    });
    var merged = [];
    chunks.forEach(function(ch) {
      var prev = merged[merged.length - 1];
      var continues = !!prev
        && !ch.fresh
        && prev.length < 300
        && !/[.!?:;]$/.test(prev)
        && !/[A-Z]{4,}/.test(prev)
        && !SECTION_HEADER.test(ch.text)
        && /^[a-z(]/.test(ch.text)
        && !isDateLine(ch.text);
      if (continues) {
        merged[merged.length - 1] = (prev + ' ' + ch.text).replace(/\s+/g, ' ').trim();
      } else {
        merged.push(ch.text);
      }
    });
    return merged;
  }

  var LADDER = [
    /* 1. recognition: wins, placements, honours, selection */
    /\b(?:winner|winners|awarded|award|awards|recognized|recognised|honou?red|honou?rs?|selected|appointed|finalist|scholar|scholarship|champion|qualif(?:ied|ier|iers|ies)|competitor|compet(?:ed|ition)|ranked|dean'?s\s+list|state\s+qualifier)\b|\b(?:1st|2nd|3rd|first|second|third)\b|\bplace(?:d|s)?\b/i,
    /* 2. built something real */
    /\b(?:developed|built|designed|created|launched|engineered|implemented|shipped|invented|authored|published|programmed|coded|deployed)\b/i,
    /* 3. held a formal leadership role */
    /\b(?:vp\s+of|vice\s+president|president|secretary|treasurer|chair(?:person|man|woman)?|captain|founder|founded|elected|head\s+of|team\s+lead|student\s+body|class\s+president)\b/i,
    /* 4. carried ownership of work */
    /\b(?:led|managed|manage|mentored|mentoring|supervised|directed|coordinated|organized|organized|responsible\s+for|team\s+of|oversaw|ran)\b/i,
    /* 5. quantified impact */
    /\d+\s*(?:%|percent)|\b\d+\s+(?:records|users|students|customers|clients|orders|projects|team|members|employees|hours|pages|counties|states|countries|schools|participants|attendees|transactions|calls|teams|people|volunteers)\b|\b(?:percent|accuracy|revenue|throughput|weekly|annually)\b/i,
    /* 6. certification / credential */
    /\b(?:certified|certification|certificate|credential|licensed|practitioner|specialist|trained|training)\b/i
  ];
  var RUNGS = LADDER.length + 1; /* fallback */

  var pool = [];
  var seen = {};

  function offer(text, source, forcedTier, context) {
    context = context || {};
    var t = stripLabel(text)
      .replace(/^[\s\-–—•●*]+/, '')
      .trim();
    if (isNoise(t)) return;
    // A structured parser is not evidence: only offer spans in the original source.
    var evidence = cleanText(source === 'resume' ? rawText : context.transcript || c.notes);
    if (evidence && evidence.indexOf(t) === -1) return;
    var key = t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/^\s+|\s+$/g, '');
    if (!key) return;
    // Keep identical statements under different parents; raw harvesting must not
    // displace a structured entry or detach a claim from its role.
    if (pool.some(function(x) { return x.source === source && x.text === t &&
      (!context.contextLabel || x.contextLabel === context.contextLabel) &&
      (!context.noteId || x.noteId === context.noteId); })) return;
    var tier = forcedTier || RUNGS;
    if (!forcedTier) {
      for (var i = 0; i < LADDER.length; i++) {
        if (LADDER[i].test(t)) { tier = i + 1; break; }
      }
    }
    seen[key] = true;
    pool.push({ text: t, evidenceText: t, source: source, tier: tier, order: pool.length,
      facet: ['Recognition', 'Built something', 'Leadership role', 'Owned the work', 'Quantified impact', 'Credential', 'Experience statement'][tier - 1],
      contextLabel: context.contextLabel || '', contextDetail: context.contextDetail || '',
      noteId: context.noteId || '', createdAt: context.createdAt || '',
      verification: source === 'conversation' ? (context.reviewed ? 'Recruiter-reviewed transcript' : 'Unverified transcript') : 'Resume quote' });
  }

  /* Document order first so that, within a rung, the candidate's own
     ordering decides what is shown. Structured fields follow to catch
     anything the raw text did not preserve. */
  experience.forEach(function(exp) {
    var head = cleanText(exp && exp.title);
    if (exp && exp.company) head += (head ? ' · ' : '') + cleanText(exp.company);
    splitProse((exp && exp.description) || '').forEach(function(s) {
      offer(s, 'resume', null, {contextLabel: head, contextDetail: exp.dates || ''});
    });
  });
  projects.forEach(function(proj) {
    var name = cleanText(proj && proj.name);
    var desc = cleanText(proj && proj.description);
    if (name && !desc) offer(name, 'resume', RUNGS, {contextLabel: name, contextDetail: proj.dates || ''});
    if (desc) splitProse(desc).forEach(function(s) { offer(s, 'resume', null, {contextLabel: name, contextDetail: proj.dates || ''}); });
  });
  splitProse(rawText).forEach(function(line) { offer(line, 'resume'); });
  certs.forEach(function(cert) {
    var t = stripLabel(cert);
    if (t) offer(t, 'resume', LADDER.length);
  });
  (c.audioNotes || []).forEach(function(note) {
    splitProse(note.transcript).forEach(function(line) {
      if (!LADDER.some(function(rule) { return rule.test(line); })) return;
      offer(line, 'conversation', null, {transcript: note.transcript, noteId: note.id || note.blobId,
        createdAt: note.createdAt, reviewed: !!note.reviewedAt});
    });
  });

  /* One highlight per rung first — so the three cover three different facets
     of the candidate (say: recognised, built, led) instead of three variants
     of the same claim — then fill any remaining slots in ladder order. */
  var chosen = [];
  function takeOne(tier) {
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].tier === tier && !pool[i].taken) {
        pool[i].taken = true;
        chosen.push(pool[i]);
        return;
      }
    }
  }
  for (var pass = 0; pass < pool.length; pass++) {
    for (var tier = 1; tier <= RUNGS; tier++) takeOne(tier);
  }

  chosen.sort(function(a, b) { return a.tier - b.tier || a.order - b.order; });

  var accs = chosen.map(function(x) { delete x.tier; delete x.order; delete x.taken; return x; });

  if (!accs.length && c.notes) {
    var sentences = c.notes.split(/[.!?]+/).filter(function(s) { return s.trim().length > 10; });
    if (sentences.length) {
      var note = cleanText(sentences[0]);
      if (!isNoise(note)) accs.push({ text: note, evidenceText: note, source: "conversation", facet: 'Recruiter note', contextLabel: '', contextDetail: '', verification: 'Recruiter note; speaker not established' });
    }
  }

  return accs;
}

/* Highlights are meant to be quotes from the candidate's own document. A set
   stored by an older build can contain statements the resume never contained
   (e.g. the invented "Handled 14 students"), and because a non-empty array is
   otherwise trusted as-is, those weak lines would outlive the parser fix.
   Any resume-sourced line that cannot be found in the current raw text means
   the stored set is out of date and must be rebuilt. */
TIQ.highlightsAreStale = function(c) {
  var resume = c && c.parsedResume;
  var raw = resume && resume.rawText;
  var accs = c && c.accomplishments;
  if (!raw || !accs || !accs.length) return false;
  var flat = String(raw).replace(/\s+/g, ' ');
  return accs.some(function(a) {
    if (!a || a.source !== 'resume' || !a.text) return false;
    var t = String(a.text).replace(/\s+/g, ' ').replace(/\u2026+$/, '').replace(/[\s,;.]+$/, '');
    return !t || flat.indexOf(t) === -1;
  });
};

TIQ.normalizeCandidate = function(candidate, seedCandidate) {
  var c = Object.assign({}, seedCandidate || {}, candidate || {});
  var stale = TIQ.highlightsAreStale(c);
  if (stale || !c.accomplishments || !c.accomplishments.length) {
    var fromSeed = !stale && seedCandidate && seedCandidate.accomplishments && seedCandidate.accomplishments.length;
    c.accomplishments = fromSeed ? seedCandidate.accomplishments.slice() : buildAccomplishments(c);
  }
  return c;
};

TIQ.state = (function() {
  var persisted = TIQ.loadPersistedState();
  var persistedCandidates = (persisted && persisted.candidates) || [];
  var normalizedCandidates = persisted && Array.isArray(persisted.candidates)
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
    event: (persisted && persisted.event) || {},
    metrics: TIQ.loadMetrics()
  };
})();

TIQ.saveState = function() {
  try {
    localStorage.setItem(TIQ.STORAGE_KEY, JSON.stringify({
      candidates: TIQ.state.candidates,
      activeRecruiterId: TIQ.state.activeRecruiterId,
      lastSelectedId: TIQ.state.selectedId,
      event: TIQ.state.event || {}
    }, function(key, value) {
      return key === "sourceUrl" ? undefined : value;
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
  if (!Array.isArray(candidate.auditLog)) candidate.auditLog = [];
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
    console.log("[TalentIQ] Back online — local audio connection flags updated; no data transmitted.");
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
   TalentIQ — Resume Extraction & Template Summaries
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
  "Tableau", "Power BI", "PowerPoint", "Looker", "Excel", "Google Sheets", "Jupyter", "R Markdown",
  /* J.B. Hunt domain vocabulary. Sits ahead of the generic catch-all below so
     freight/supply-chain terms win the 20-skill cap when a resume matches both. */
  "Intermodal", "Drayage", "Freight Brokerage", "Freight Forwarding", "Truckload", "LTL", "FTL", "Final Mile", "Last Mile", "Dedicated Fleet", "Yard Management", "Cross-Dock", "Transload", "Load Planning", "Capacity Planning", "Carrier Procurement", "Freight Rates", "Rate Negotiation", "Lane Analysis", "Spot Market", "Contract Freight", "Hours of Service", "ELD", "DOT Compliance", "Freight Audit", "Demurrage", "Freight Claims", "3PL", "Cold Chain", "On-Time Delivery", "OTIF", "Transportation Management System", "TMS", "Warehouse Management System", "WMS", "Order Fulfillment", "Inventory Control", "Demand Planning", "S&OP", "Sales and Operations Planning", "HOS", "Reverse Logistics", "Route Optimization", "Route Planning", "Fleet Safety", "Supply Chain Management", "Supply Chain Analytics", "Distribution Center", "Customs Clearance",
  "SAP", "Oracle", "Salesforce", "NetSuite", "Workday", "ServiceNow", "QuickBooks", "HubSpot", "Microsoft SQL Server", "SQL Server", "Samsara", "Trimble", "SharePoint", "Power Automate", "Smartsheet", "Airtable", "Visio", "VBA",
  "Snowflake", "Databricks", "BigQuery", "Redshift", "Alteryx", "Power Query", "SSIS", "SAS", "SPSS", "Data Science", "Statistics", "Regression Analysis", "Time Series", "A/B Testing", "Statistical Modeling", "Data Mining", "ETL", "Data Warehousing", "Predictive Analytics", "KPI", "KPIs", "Root Cause Analysis",
  "Lean", "Six Sigma", "Lean Six Sigma", "Kaizen", "5S", "Value Stream Mapping", "Standard Work", "Time Study", "Simulation", "Linear Programming", "Monte Carlo Simulation", "Inventory Management", "Procurement", "Vendor Management", "Stakeholder Management", "Negotiation", "Contract Management", "Financial Modeling", "Variance Analysis", "Budgeting", "Accounts Payable", "Accounts Receivable", "Cost Analysis", "Business Development", "Customer Relationship Management", "CRM",
  "PMP", "APICS", "CSCP", "CLTD", "Green Belt", "OSHA", "CDL",
  "API", "APIs", "Data Visualization", "Forecasting", "Optimization", "Process Improvement", "Process Mapping", "Operations", "Logistics", "Transportation", "Fleet Management", "Warehouse", "Freight", "ERP", "Project Management", "Collaboration", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking", "Reporting", "Dashboard", "Dashboards", "Presentation",
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
    match: ["sql", "mysql", "postgresql", "sqlite", "mongodb", "redis", "cassandra", "dynamodb", "firebase", "supabase", "neo4j", "tableau", "power bi", "looker", "excel", "google sheets", "jupyter", "r markdown", "pandas", "numpy", "scipy", "matplotlib", "seaborn", "spark", "hadoop", "hive", "kafka", "airflow", "dbt", "snowflake", "databricks", "bigquery", "redshift", "alteryx", "power query", "ssis", "sas", "spss", "microsoft sql server", "sql server", "data science", "statistics", "regression analysis", "time series", "a/b testing", "statistical modeling", "data mining", "etl", "data warehousing", "predictive analytics", "kpi", "kpis", "visualization", "data visualization", "analytics"]
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
    key: "freight", label: "Freight & Transportation",
    match: ["intermodal", "drayage", "freight brokerage", "freight forwarding", "truckload", "ltl", "ftl", "final mile", "last mile", "dedicated fleet", "yard management", "cross-dock", "transload", "load planning", "capacity planning", "carrier procurement", "freight rates", "rate negotiation", "lane analysis", "spot market", "contract freight", "hours of service", "eld", "dot compliance", "freight audit", "demurrage", "freight claims", "3pl", "cold chain", "on-time delivery", "otif", "transportation management system", "tms", "warehouse management system", "wms", "order fulfillment", "inventory control", "demand planning", "s&op", "sales and operations planning", "hos", "reverse logistics", "route optimization", "route planning", "fleet safety", "supply chain management", "supply chain analytics", "distribution center", "customs clearance"]
  },
  {
    key: "ops", label: "Operations & Supply Chain",
    match: ["supply chain", "logistics", "transportation", "fleet management", "warehouse", "freight", "operations", "forecasting", "process improvement", "process mapping", "lean", "six sigma", "lean six sigma", "kaizen", "5s", "value stream mapping", "standard work", "time study", "simulation", "linear programming", "monte carlo simulation", "inventory", "inventory management", "procurement", "optimization", "scheduling", "quality improvement", "safety", "root cause analysis", "vendor management", "erp"]
  },
  {
    key: "business", label: "Business, Finance & ERP",
    match: ["sap", "oracle", "salesforce", "netsuite", "workday", "servicenow", "quickbooks", "hubspot", "samsara", "trimble", "sharepoint", "power automate", "smartsheet", "airtable", "visio", "vba", "financial modeling", "variance analysis", "budgeting", "accounts payable", "accounts receivable", "cost analysis", "business development", "customer relationship management", "crm", "negotiation", "contract management"]
  },
  {
    key: "credentials", label: "Certifications & Licenses",
    match: ["pmp", "apics", "cscp", "cltd", "green belt", "osha", "cdl"]
  },
  {
    key: "methods", label: "Methods & Soft Skills",
    match: ["agile", "scrum", "kanban", "sprint", "communication", "leadership", "teamwork", "problem solving", "critical thinking", "decision making", "collaboration", "project management", "stakeholder management", "jira", "confluence", "trello", "notion", "linear", "figma", "sketch", "adobe xd", "photoshop", "illustrator", "indesign"]
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

/* ---- Page text assembly ----
   pdf.js flags the item that terminates a line with hasEOL. Folding every item
   into one space-joined string discards every one of those markers, collapsing
   the whole document into a single line — every section extractor then sees a
   one-line "resume" and returns nothing, which is exactly how a fully parsed
   resume ended up with zero experience, zero education and zero highlights. */
TIQ.ai.pageTextFromContent = function(content) {
  var items = (content && content.items) || [];
  var raw = items.map(function(item) {
    return item ? item.str + (item.hasEOL ? "\n" : " ") : "";
  }).join("");
  /* Embedded ligatures are emitted as their own runs, so real words come back
     split: "Certi fi cations/Training", "O ffi ce", "Pro fi cient". These
     fragments are never standalone English words, so rejoin them whenever they
     sit between letters. Without this the certifications prefix never matches
     and the skills dictionary misses "proficient in ...". */
  return raw.replace(/([A-Za-z])\s+(ffi|ffl|fl|ff|fi)\s+([A-Za-z])/g, "$1$2$3");
};

/* A stored parse written by an earlier build assembled page text with
   .join(" "), throwing away every hasEOL flag — so the whole resume sits in
   rawText as ONE line with pdf.js ligature splits intact. Such a parse can
   never produce sections or highlights, and no amount of re-running the
   extractors over it helps: the line breaks are gone. The only cure is
   re-reading the PDF, so the UI has to be able to say that out loud. */
TIQ.ai.isStaleParse = function(parsed) {
  if (!parsed || typeof parsed.rawText !== "string") return false;
  if (parsed.rawText.length <= 200) return false;
  if (parsed.rawText.indexOf("\n") !== -1) return false;
  /* Second, independent signal: pdf.js emits fi/ffi ligature runs separately,
     and the old text assembly left them split ("Certi fi cations"). */
  return /(?:[A-Za-z])\s+(?:ffi|ffl|fi|fl)\s+(?:[A-Za-z])/.test(parsed.rawText);
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
    workAuthorization: this._extractWorkAuthorization(text),
    links: this._extractLinks(text),
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
        /* A bare date range on its own line belongs to the entry above it. It
           was opening a new entry whose title was the date string itself, which
           then rendered a duration chip for a job that never existed. */
        if (!jobPattern.test(line) && current && current.title) {
          if (!current.dates) {
            current.dates = line;
            current.duration = TIQ.ai._normalizeDateRange(line);
          }
          continue;
        }
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
        var datesRaw = dateMatch ? dateMatch[0] : "";
        current = {
          title: title,
          company: company || "",
          dates: datesRaw,
          /* Additive sibling: `dates` stays the display string every existing
             render site depends on, `duration` adds the machine-readable form. */
          duration: TIQ.ai._normalizeDateRange(datesRaw),
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

  var pushCurrent = function() {
    if (current && current.name && projects.length < 5) projects.push(current);
    current = null;
  };

  var parseProjectLine = function(line) {
    var cleaned = line.replace(/^[•●○▪-]\s*/, '').trim();
    var prefix = cleaned.match(/^project:\s*(.+)$/i);
    if (prefix) cleaned = prefix[1].trim();
    if (!cleaned) return null;

    var parts = cleaned.split(/\s*[|—–-]\s*/).filter(function(part) { return part && part.trim().length; });
    var name = parts.length ? parts[0].trim() : cleaned;
    var description = parts.length > 1 ? parts.slice(1).join(' ').trim() : '';
    if (!name) return null;
    return { name: name, description: description };
  };

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    if (projPattern.test(line)) { inSection = true; continue; }
    if (inSection && nextSectionPattern.test(line)) { pushCurrent(); break; }

    /* Outside a PROJECTS heading only explicit "Project: X" lines count —
       previously every line of the resume (name, email, address…) became a
       "project", capped at the first five lines of the document. */
    var bare = line.replace(/^[•●○▪-]\s*/, '').trim();
    var explicit = /^project:\s*/i.test(bare);
    if (!inSection && !explicit) continue;

    var inline = parseProjectLine(line);
    if (inline) {
      pushCurrent();
      current = inline;
      pushCurrent();
      continue;
    }

    if (inSection && line.length > 2) {
      var startish = line.length < 120 && /^[A-Z0-9][^:]*$/.test(line) && !/^[A-Z]{2,}$/.test(line);
      if (startish && !/^\d{4}\b/.test(line)) {
        pushCurrent();
        current = { name: line.split(/[—–\-:|]/)[0].trim(), description: line.split(/[—–\-:|]/).slice(1).join(" ").trim() };
      } else if (current) {
        current.description += (current.description ? " " : "") + line;
      }
    }
  }
  pushCurrent();
  return projects.slice(0, 5);
};

TIQ.ai._extractEducation = function(text) {
  var education = [];
  var lines = text.split("\n");
  var inSection = false;
  var current = null;
  var eduPattern = /(?:education|academic|degree)/i;
  var nextSectionPattern = /^(?:experience|work|projects|skills|certifications)/i;
  /* Trailing \b on every abbreviation matters: without it "Expected
     Graduation: May 2027" matches M\.?A\.? as "Ma" and became a school. */
  var degreePattern = /(?:\bBachelor|\bMaster|\bPh\.?\s?D\.?\b|\bAssociate|\bMBA\b|\bB\.?S\.?\b|\bB\.?A\.?\b|\bM\.?S\.?\b|\bM\.?A\.?\b|\bB\.?Sc\b|\bM\.?Sc\b|\bDoctorate\b|\bCertificate\b|\bDiploma\b)/i;
  /* A high school is not a post-secondary credential. The old bare [Ss]chool
     alternative captured "Bentonville High School" as a university, which is
     exactly the wrong kind of noise in a university recruiting tool. */
  var secondaryPattern = /\b(?:High|Middle|Elementary|Junior\s+High|Senior\s+High)\s+School\b/i;
  var postSecondaryPattern = /\b(?:University|College|Institute|Polytechnic|Academy|School\s+of)\b/i;
  /* Metadata lines carry a year and a GPA but never start an entry. They still
     fall through to the year/major branch so "Expected graduation: May 2027"
     keeps supplying the graduation year to the entry above it. */
  var metaPattern = /^(?:expected|anticipated|target)?\s*graduat|^class of|^gpa|grade point average|^certifications?\b|^licenses?\b|^awards?\b|^honors?\b|^activities\b|^leadership\b/i;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (eduPattern.test(line)) { inSection = true; continue; }
    if (inSection && nextSectionPattern.test(line)) break;
    if (!inSection || line.length <= 2) continue;
    if (secondaryPattern.test(line)) continue;

    var hasSignal = !metaPattern.test(line) && (degreePattern.test(line) || (line.length < 100 && postSecondaryPattern.test(line)));
    if (hasSignal) {
      if (current && current.school) education.push(current);
      var schoolMatch = line.match(/((?:University|College|Institute|School)[A-Za-z .&']*|[A-Z][A-Za-z .&']+(?:University|College|Institute|School)[A-Za-z .&']*)/);
      var degreeMatch = line.match(degreePattern);
      var major = "";
      var majorMatch = line.match(/(?:in|of)\s+([A-Z][A-Za-z\s]+?)(?:\s*,|\s*\(|$)/);
      if (majorMatch) major = majorMatch[1].trim();
      /* "University of Tennessee — BS Data Science" states the major as bare
         trailing words after the abbreviation, with no "in"/"of" to key off. */
      if (!major && degreeMatch) {
        var tail = line.match(new RegExp(degreeMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+(?:in\\s+)?([A-Z][A-Za-z]*(?:\\s+[A-Z][A-Za-z]*)*)\\s*$'));
        if (tail) major = tail[1].trim();
      }
      var norm = TIQ.ai._normalizeDegree(degreeMatch ? degreeMatch[0] : "", major);
      current = {
        school: schoolMatch ? schoolMatch[1].trim() : line,
        degree: degreeMatch ? degreeMatch[0] : "",
        degreeProgram: norm.degreeProgram,
        degreeLevel: norm.degreeLevel,
        major: major,
        year: ""
      };
      var yearMatch = line.match(/\b(20\d{2})\b/);
      if (yearMatch) current.year = yearMatch[1];
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

  var lines = text.split(/\r?\n/);

  var pushCert = function(cert) {
    var cleaned = String(cert || '').replace(/\s+/g, ' ').trim();
    if (cleaned.length > 3 && cleaned.length < 80 && certs.indexOf(cleaned) === -1) certs.push(cleaned);
  };

  lines.forEach(function(line, i) {
    var cleaned = String(line || '').replace(/^[•●○▪-]\s*/, '').trim();
    /* Not anchored to the start of the line: a real resume renders the section
       heading and its first item on the same line, as
       "SKILLS, CERTIFICATIONS OR AWARDS Certifications/Training: ..." — a
       caret-anchored pattern then matched nothing at all. */
    var prefix = cleaned.match(/(?:^|\s)(?:certifications?(?:\/training)?|training)\s*:\s*(.+)$/i);
    if (prefix) {
      var segs = prefix[1].split(/\s*;\s*/);
      var lastSeg = segs[segs.length - 1];
      /* pdf.js will mark an EOL in the middle of one entry, so a line can end
         mid-phrase — "...; IT Specialist in" / "Computational Thinking." — and
         the tail would otherwise be dropped. Pull the following line in, unless
         it looks like the next all-caps section header. */
      if (lastSeg && !/[.!?\)\]]\s*$/.test(lastSeg)) {
        var nextLine = String(lines[i + 1] || '').replace(/^[•●○▪-]\s*/, '').trim();
        if (nextLine && !/^[A-Z0-9 ,&/\-]{2,40}$/.test(nextLine)) {
          segs[segs.length - 1] = (lastSeg + ' ' + nextLine).replace(/\s+/g, ' ').trim();
        }
      }
      segs.forEach(function(part) {
        if (part) pushCert(part);
      });
    }
  });

  for (var i = 0; i < certPatterns.length; i++) {
    var match;
    while ((match = certPatterns[i].exec(text)) !== null) {
      pushCert(match[0]);
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

/* ---- Work authorization ----
   Resumes state this in wildly inconsistent ways, so the patterns run most
   specific first. The disqualifier list runs BEFORE any positive match and
   wins outright: a wrongly read "US Citizen" is a fairness problem, not a data
   quality problem. When the text is ambiguous we return "" so the "Work Auth
   Unspecified" flag stays visible and a human still gets to ask. This value is
   never a score, rank, or sort key. */
TIQ.ai._extractWorkAuthorization = function(text) {
  if (!text) return '';
  var t = ' ' + String(text).replace(/\s+/g, ' ') + ' ';
  var disqualifiers = [
    /require[sd]?\s+(?:an?\s+)?(?:visa\s+)?sponsorship/i,
    /(?:visa\s+)?sponsorship\s+(?:is\s+|will\s+be\s+)?required/i,
    /not\s+(?:currently\s+|now\s+)?(?:a\s+)?citizen/i,
    /not\s+(?:currently\s+|now\s+)?(?:authorized|eligible)\s+to\s+work/i,
    /no\s+longer\s+(?:authorized|eligible)\s+to\s+work/i,
    /will\s+not\s+be\s+(?:authorized|eligible)\s+to\s+work/i,
    /not\s+eligible\s+to\s+work/i
  ];
  for (var d = 0; d < disqualifiers.length; d++) {
    if (disqualifiers[d].test(t)) return '';
  }
  var patterns = [
    [/\b(?:U\.?\s?S\.?\s?Citizen|United\s+States\s+Citizen|Citizen\s+of\s+the\s+United\s+States)\b/i, 'US Citizen'],
    [/\b(?:Lawful\s+Permanent\s+Resident|Permanent\s+Resident|Green\s+Card(?:\s+Holder)?|L\.?\s?P\.?\s?R\.?)\b/i, 'Permanent Resident'],
    [/\bF[\s\-/]?1[\s\-/]?OPT\b/i, 'OPT'],
    [/\bF[\s\-/]?1[\s\-/]?CPT\b/i, 'F1 CPT'],
    [/\bOPT[\s\-/]?CPT\b/i, 'OPT CPT'],
    [/\bH[\s\-/]?1[\s\-/]?B\b/i, 'H1B'],
    [/\b(?:authorized|eligible)\s+to\s+work\b/i, 'Authorized to work']
  ];
  for (var p = 0; p < patterns.length; p++) {
    if (patterns[p][0].test(t)) return patterns[p][1];
  }
  return '';
};

/* ---- Links ----
   Two passes. The first requires an explicit scheme or www. so a bare address
   like nirmays06@gmail.com is never mistaken for a portfolio URL. The second
   catches a scheme-less profile on a known profile host, which is safe because
   those hostnames can never appear as the domain part of an email address.
   Trailing separators get stripped because resumes pipe fields together:
   "a@b.com | 479-418-6301 | https://linkedin.com/in/x/" */
TIQ.ai._extractLinks = function(text) {
  var links = { linkedin: '', github: '', portfolio: '' };
  if (!text) return links;
  var re = /(?:https?:\/\/|www\.)[^\s|;,<>()"'\]]+|(?:github|gitlab|linkedin)\.com\/[A-Za-z0-9._~%\-/]+/gi;
  var m;
  while ((m = re.exec(text)) !== null) {
    var url = m[0].replace(/[.\/]+$/, '');
    if (!url) continue;
    var lower = url.toLowerCase();
    if (lower.indexOf('linkedin.com/in/') !== -1) {
      if (!links.linkedin) links.linkedin = url;
    } else if (lower.indexOf('github.com/') !== -1) {
      if (!links.github) links.github = url;
    } else if (!links.portfolio) {
      links.portfolio = url;
    }
  }
  return links;
};

/* ---- Mailing address ----
   Scans ONLY the first 5 non-empty lines (same header window _extractName
   uses). A global scan would happily report the "Bentonville, AR" from the
   middle of an experience block as the candidate's address. Returns the
   "City, ST ZIP" portion and deliberately drops the street line — a recruiter
   needs the geography, not the house number. */
TIQ.ai._extractAddress = function(text) {
  if (!text) return '';
  var lines = String(text).split(/\r?\n/)
    .map(function(l) { return l.replace(/^[•●○▪>\-*]\s*/, '').trim(); })
    .filter(function(l) { return l.length > 0; });
  /* An institution is not a city. Without this guard a header line reading
     "Bentonville High School   Bentonville, AR" produced
     "Bentonville High School   Bentonville, AR" as the address, because the
     old pattern's character class contained a space and happily walked back
     across the school's own name. */
  var INSTITUTION = /School|University|College|Institute|Academy|Campus|High\s|Middle\s|Elementary/i;
  var stateRe = /^(,\s*[A-Z]{2})(?:\s+(\d{5}(?:-\d{4})?))?/;

  for (var i = 0; i < Math.min(lines.length, 5); i++) {
    if (/@/.test(lines[i])) continue;
    var line = lines[i];
    var ci = line.search(/,\s*[A-Z]{2}\b/);
    if (ci < 0) continue;
    var tail = line.slice(ci).match(stateRe);
    if (!tail) continue;
    var head = line.slice(0, ci).trim();
    /* Anything before the last comma on this line is a street or a suite. */
    var cityPart = head.indexOf(',') >= 0 ? head.split(',').pop().trim() : head;
    var words = cityPart.split(/\s+/).filter(Boolean);
    /* Prefer the longest city, fall back to fewer words until one is not an
       institution name. */
    for (var n = Math.min(3, words.length); n >= 1; n--) {
      var city = words.slice(-n).join(' ');
      if (!city || INSTITUTION.test(city)) continue;
      return city + tail[1] + (tail[2] ? ' ' + tail[2] : '');
    }
  }
  return '';
};

/* ---- Date range normalization ----
   Purely additive: experience[].dates stays the original display string so the
   card, the drawer, and the summary generator are untouched. This produces the
   machine-readable sibling that none of them currently have. */
TIQ.ai._MONTH_NUM = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

TIQ.ai._parseDateToken = function(token) {
  if (!token) return null;
  var s = String(token).trim();
  if (/^(?:present|current|ongoing|now|today|to\s*date)$/i.test(s)) return { current: true };
  var m = s.match(/^(\d{1,2})\s*[/-]\s*(\d{4})$/);
  if (m) return { year: parseInt(m[2], 10), month: parseInt(m[1], 10) };
  m = s.match(/^([A-Za-z]{3,9})\.?\s+(\d{4})$/);
  if (m) {
    var num = TIQ.ai._MONTH_NUM[m[1].slice(0, 3).toLowerCase()];
    if (num) return { year: parseInt(m[2], 10), month: num };
  }
  m = s.match(/^(\d{4})$/);
  if (m) return { year: parseInt(m[1], 10), month: 1 };
  /* A word we do not recognise as a month ("Summer 2025") is a season, not a
     date. Guessing January would invent precision the resume never gave. */
  if (/^[A-Za-z]+\.?\s+\d{4}$/.test(s)) return null;
  return null;
};

TIQ.ai._normalizeDateRange = function(dates) {
  var out = { start: '', end: '', isCurrent: false, months: null, raw: dates || '' };
  if (!dates) return out;
  /* "to" needs word boundaries or it splits "October" into "Oc" + "ober". */
  var parts = String(dates).replace(/\s+/g, ' ').trim()
    .split(/\s*(?:[-–—]|\bto\b|\bthru\b|\buntil\b)\s*/i)
    .filter(function(p) { return p.trim().length; });
  if (!parts.length) return out;

  var pad = function(n) { return (n < 10 ? '0' : '') + n; };
  var start = TIQ.ai._parseDateToken(parts[0]);
  if (start && start.year) out.start = start.year + '-' + pad(start.month);

  if (parts.length > 1) {
    var end = TIQ.ai._parseDateToken(parts[parts.length - 1]);
    if (end && end.current) out.isCurrent = true;
    else if (end && end.year) out.end = end.year + '-' + pad(end.month);
  }

  /* months stays null for an open-ended role — there is no honest duration to
     report for a job that has not ended. */
  if (out.start && out.end) {
    var diff = (parseInt(out.end.slice(0, 4), 10) - parseInt(out.start.slice(0, 4), 10)) * 12
             + (parseInt(out.end.slice(5, 7), 10) - parseInt(out.start.slice(5, 7), 10));
    if (diff >= 0) out.months = diff;
  }
  return out;
};

/* ---- Degree normalization ----
   The education regex can only capture the loosest token, so
   "Bachelor of Science in Computer Science" arrives as "Bachelor". This maps
   the captured fragment (plus the major, when known) onto the canonical
   degreeProgram vocabulary the rest of the app already uses. */
TIQ.ai._normalizeDegree = function(degreeText, major) {
  var out = { degreeProgram: '', degreeLevel: '' };
  var d = (degreeText || '').replace(/\s+/g, ' ').trim();
  var mj = (major || '').trim();
  if (!d && !mj) return out;
  var combined = d + (mj ? ' in ' + mj : '');

  var table = [
    [/\bph\.?\s?d\.?\b|\bdoctorate\b|\bdoctoral\b/i, 'Doctorate', 'Doctorate'],
    [/\bmaster\s+of\s+business\s+administration\b|\bmba\b/i, 'Master of Business Administration', 'Master'],
    [/\bbachelor\s+of\s+science\b|\bb\.?\s?sc?\.?\b/i, 'Bachelor of Science', 'Bachelor'],
    [/\bbachelor\s+of\s+arts\b|\bb\.?\s?a\.?\b/i, 'Bachelor of Arts', 'Bachelor'],
    [/\bmaster\s+of\s+science\b|\bm\.?\s?sc?\.?\b/i, 'Master of Science', 'Master'],
    [/\bmaster\s+of\s+arts\b|\bm\.?\s?a\.?\b/i, 'Master of Arts', 'Master'],
    [/\bassociate(?:'?s)?\b/i, 'Associate', 'Associate'],
    [/\bcertificate\b/i, 'Certificate', 'Certificate'],
    [/\bdiploma\b/i, 'Diploma', 'Diploma']
  ];
  for (var i = 0; i < table.length; i++) {
    if (table[i][0].test(combined)) {
      out.degreeProgram = table[i][1];
      out.degreeLevel = table[i][2];
      return out;
    }
  }

  /* "Bachelor of Marketing" / "Master of Engineering" never match the spelled
     out rows above. Resolve the field of study from the major instead of
     defaulting everything to Science. */
  var bare = /\bbachelor/i.test(combined) ? 'Bachelor' : (/\bmasters?\b/i.test(combined) ? 'Master' : '');
  if (bare) {
    out.degreeLevel = bare;
    var lower = mj.toLowerCase();
    if (/arts|humanities|english|history|spanish|liberal|design/.test(lower)) {
      out.degreeProgram = bare + ' of Arts';
    } else if (/business|management|accounting|finance|marketing|administration|public/.test(lower)) {
      out.degreeProgram = bare === 'Master' ? 'Master of Business Administration' : 'Bachelor of Business Administration';
    } else {
      out.degreeProgram = bare + ' of Science';
    }
  }
  return out;
};

TIQ.ai._extractContact = function (rawText) {
  var email = this._extractEmail(rawText);
  var phone = this._extractPhone(rawText);
  var name = this._extractName(rawText);
  var graduationDate = this._extractGraduationDate(rawText);
  var address = this._extractAddress(rawText);
  var parts = name ? name.split(/\s+/) : [];
  return {
    name: name,
    firstName: parts.length ? parts[0] : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
    email: email,
    phone: phone,
    graduationDate: graduationDate,
    address: address
  };
};

/* ---- Transcript Hydration ---- */
TIQ.ai.hydrateTranscript = function (candidate, transcriptText) {
  var changes = { skillsAdded: [], notesUpdated: false };
  if (!candidate || !transcriptText) return changes;
  candidate.skills = candidate.skills || [];
  var find = function (s) { return candidate.skills.indexOf(s) !== -1; };
  TIQ.ai._extractSkills(transcriptText).forEach(function (skill) {
    if (!find(skill)) { candidate.skills.push(skill); changes.skillsAdded.push(skill); }
  });
  if (typeof TIQ.generateTldr === 'function') {
    var tldr = TIQ.generateTldr(transcriptText);
    if (tldr && !candidate.notes) { candidate.notes = tldr; changes.notesUpdated = true; }
  }
  candidate.accomplishments = TIQ.generateAccomplishments(candidate);
  if (TIQ.invalidateApproval) TIQ.invalidateApproval(candidate);
  return changes;
};

/* ---- Summary Generator ---- */
TIQ.ai.generateSummary = function(c) {
  if (!c) return { summary: "", traceability: [], missingData: [] };
  var resume = c.parsedResume || null;
  var parts = [];
  var trace = [];
  var missing = [];

  var name = (c.firstName || "The candidate") + (c.lastName ? " " + c.lastName : "");
  var eduFallback = (resume && resume.education && resume.education[0]) ? resume.education[0] : null;
  var school = c.university || (eduFallback && eduFallback.school) || "";
  var major = c.major || (eduFallback && eduFallback.major) || "";
  var gradDate = TIQ.formatMonthYear(c.graduationDate || "");
  var gpa = c.gpa || (resume && resume.gpa) || "";

  /* Attribute each claim to where its value actually came from — a school or
     major that only exists because the resume was scanned cites the resume,
     not the intake form. */
  var schoolSrc = c.university ? TIQ.citeSource(c, "university") : "resume";
  var majorSrc = c.major ? TIQ.citeSource(c, "major") : "resume";
  var gradSrc = TIQ.citeSource(c, "graduationDate");

  if (school || major) {
    var eduStr = name + " is";
    if (school && major) {
      eduStr += " a " + major + " student at " + school;
      trace.push("Education: " + school + " " + major + " — " + schoolSrc);
    } else if (school) {
      eduStr += " a student at " + school;
      trace.push("School: " + school + " — " + schoolSrc);
    } else {
      eduStr += " a " + major + " student";
      trace.push("Major: " + major + " — " + majorSrc);
    }
    if (gradDate) {
      eduStr += " (graduating " + gradDate + ")";
      trace.push("Graduation: " + gradDate + " — " + gradSrc);
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
    /* Work authorization can now be extracted from the resume, so "recruiter
       input" is only true when that is where it actually came from. */
    trace.push("Work authorization: " + c.workAuthorization + " — " + TIQ.citeSource(c, "workAuthorization"));
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

/* ---- Backfill candidate fields from parsed resume (only-if-empty) ----
   Every field actually filled here is stamped into candidate.provenance as
   "resume" so the card and detail panel can show where the value came from.
   Values that already existed keep no mark and render as unverified. */
TIQ.ai.applyParsedData = function(candidate, parsed, opts) {
  if (!parsed) return;
  /* refresh: a re-scan. Values this machine wrote itself (provenance "resume")
     are safe to correct; values a recruiter typed are never touched, and a
     field the new parse cannot fill is left alone rather than blanked. */
  var refresh = !!(opts && opts.refresh);
  candidate.provenance = candidate.provenance || {};
  function canReplace(field) {
    return !!candidate[field] && refresh && candidate.provenance[field] === "resume";
  }
  function backfill(field, value) {
    if (!value) return;
    if (candidate[field] && !canReplace(field)) return;
    candidate[field] = value;
    candidate.provenance[field] = "resume";
  }
  var contact = parsed.contact || {};
  backfill("firstName", contact.firstName);
  backfill("lastName", contact.lastName);
  backfill("email", contact.email);
  backfill("phone", contact.phone);
  backfill("graduationDate", contact.graduationDate);
  backfill("resumeAddress", contact.address);
  backfill("workAuthorization", parsed.workAuthorization);
  var edu = (parsed.education && parsed.education.length) ? parsed.education[0] : null;
  backfill("university", edu && edu.school);
  backfill("major", edu && edu.major);
  backfill("degreeProgram", edu && edu.degreeProgram);
  backfill("gpa", parsed.gpa);
  var skillsStale = refresh && candidate.provenance && candidate.provenance.skills === "resume";
  if (parsed.skills && parsed.skills.length && (skillsStale || !candidate.skills || !candidate.skills.length)) {
    candidate.skills = parsed.skills.slice();
    candidate.provenance.skills = "resume";
  }
  /* links is an object, so the plain backfill() guard is wrong: an existing
     empty {} would look "filled" and block the write. Compare key counts. */
  if (parsed.links) {
    var foundLinks = {};
    for (var lk in parsed.links) {
      if (Object.prototype.hasOwnProperty.call(parsed.links, lk) && parsed.links[lk]) foundLinks[lk] = parsed.links[lk];
    }
    var haveLinks = Object.keys(foundLinks).length;
    var haveCurrent = candidate.links && Object.keys(candidate.links).length;
    var linksStale = refresh && candidate.provenance && candidate.provenance.links === "resume";
    if (haveLinks && (linksStale || !haveCurrent)) {
      candidate.links = foundLinks;
      candidate.provenance.links = "resume";
    }
  }
};

/* Where did a field's value come from? "resume" = extracted from the parsed PDF,
   "form" = recruiter/intake entry. Absent provenance reads as "form" — the honest
   default for records that were never scanned. */
TIQ.fieldSource = function(c, field) {
  return (c && c.provenance && c.provenance[field]) || "form";
};

/* Citation wording for traceability strings: "resume" or "intake form". */
TIQ.citeSource = function(c, field) {
  return TIQ.fieldSource(c, field) === "resume" ? "resume" : "intake form";
};

/* ---- PDF Parsing Orchestrator ----
   Resolves with the parsed object on success, or null on failure.
   The candidate's resumeUpload is switched to { name, type, parsedAt } up front so an
   interrupted or failed scan is never mistaken for a scanned resume: parsedAt stays ""
   until extraction succeeds (getMissingFlags then reports "Resume Not Scanned"). */
TIQ.ai.parseAndStoreResume = function(candidate, file) {
  if (TIQ.invalidateApproval) TIQ.invalidateApproval(candidate);
  var resumeRef = { name: file && file.name ? file.name : "resume.pdf", type: file && file.type ? file.type : "", parsedAt: "", sourceUrl: "" };
  if (candidate && candidate.resumeUpload && typeof candidate.resumeUpload === "object" && candidate.resumeUpload.sourceUrl && typeof URL !== "undefined" && URL.revokeObjectURL) {
    try { URL.revokeObjectURL(candidate.resumeUpload.sourceUrl); } catch (_) {}
  }
  candidate.resumeUpload = resumeRef;
  if (file && typeof URL !== "undefined" && URL.createObjectURL) {
    try { resumeRef.sourceUrl = URL.createObjectURL(file); } catch (_) { resumeRef.sourceUrl = ""; }
  }

  var failScan = function(reason, resolve) {
    resumeRef.parsedAt = "";
    resumeRef.parseError = reason;
    console.error("[TalentIQ] Resume scan failed (" + reason + "): " + resumeRef.name);
    if (TIQ.addAuditEntry) TIQ.addAuditEntry(candidate, "RESUME_SCAN_FAILED", reason);
    if (TIQ.logMetric) TIQ.logMetric({
      type: "resume-parse-failed",
      candidateId: candidate.id,
      recruiterId: TIQ.state && TIQ.state.activeRecruiterId,
      fileName: resumeRef.name,
      reason: reason
    });
    if (TIQ.saveState) TIQ.saveState();
    resolve(null);
  };

  if (!window.pdfjsLib) {
    return new Promise(function(resolve) {
      failScan("PDF scanner (pdf.js) not loaded", resolve);
    });
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
                var pageText = TIQ.ai.pageTextFromContent(content);
                textParts[pageNum - 1] = pageText;
              });
            }));
          })(i);
        }
        Promise.all(promises).then(function() {
          var fullText = textParts.join("\n");
          console.log("[TalentIQ] Resume text extracted, length:", fullText.length);
          /* pdf.js reads a text layer, it does not OCR. A scanned or photo'd
             PDF opens fine but yields no glyphs, so extraction would return null
             and the recruiter would get a JavaScript TypeError string instead of
             something they can act on. Fail early with a real instruction. */
          if (!fullText || fullText.replace(/\s+/g, "").length < 40) {
            failScan("This PDF has no readable text layer — it looks like a scan or a photo of a page. TalentIQ reads text-based PDFs only, so ask the candidate for a text-based version, or enter their details manually.", resolve);
            return;
          }
          var parsed = TIQ.ai.extractResumeData(fullText);
          candidate.parsedResume = parsed;
          TIQ.ai.applyParsedData(candidate, parsed, { refresh: true });
          resumeRef.parsedAt = TIQ.nowISO();
          delete resumeRef.parseError;

          var result = TIQ.ai.generateSummary(candidate);
          candidate.summary = result.summary;
          candidate.traceability = result.traceability;

          /* Always re-derive on a successful scan: highlights computed from a
             previous (possibly broken) parse must not survive the re-scan. */
          candidate.accomplishments = TIQ.generateAccomplishments(candidate);

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
          TIQ.logMetric({
            type: "resume-parsed",
            candidateId: candidate.id,
            recruiterId: TIQ.state.activeRecruiterId,
            fileName: file.name,
            skills: parsed.skills.length,
            experience: parsed.experience.length,
            gpa: Boolean(parsed.gpa),
            contactFound: Boolean(parsed.contact && (parsed.contact.email || parsed.contact.phone))
          });
          TIQ.saveState();
          resolve(parsed);
        }).catch(function(err) {
          failScan("Could not read pages from the PDF: " + ((err && err.message) || err), resolve);
        });
      }).catch(function(err) {
        failScan("PDF could not be opened: " + ((err && err.message) || err), resolve);
      });
    };
    reader.onerror = function() {
      failScan("Resume file could not be read", resolve);
    };
    reader.readAsArrayBuffer(file);
  });
};

/* ---- Accomplishment Generator ---- */
TIQ.generateAccomplishments = function(c) {
  return buildAccomplishments(c);
};

TIQ.refreshParsedCandidate = function(candidate) {
  if (!candidate || !candidate.parsedResume || !candidate.parsedResume.rawText) return false;
  var parsed = TIQ.ai.extractResumeData(candidate.parsedResume.rawText);
  candidate.parsedResume = parsed;
  TIQ.ai.applyParsedData(candidate, parsed);

  var summary = TIQ.ai.generateSummary(candidate);
  candidate.summary = summary.summary;
  candidate.traceability = summary.traceability;
  candidate.accomplishments = TIQ.generateAccomplishments(candidate);
  return true;
};

TIQ.refreshParsedCandidates = function() {
  if (!TIQ.state || !Array.isArray(TIQ.state.candidates)) return false;
  var changed = false;
  TIQ.state.candidates.forEach(function(candidate) {
    if (TIQ.refreshParsedCandidate(candidate)) changed = true;
  });
  if (changed) TIQ.saveState();
  return changed;
};

/* ---- Summary Update Convenience ---- */
TIQ.ai.updateCandidateSummary = function(candidate) {
  if (TIQ.invalidateApproval) TIQ.invalidateApproval(candidate);
  var result = TIQ.ai.generateSummary(candidate);
  candidate.summary = result.summary;
  candidate.traceability = result.traceability;
  candidate.accomplishments = TIQ.generateAccomplishments(candidate);
  candidate.lastUpdated = TIQ.todayISO();
  TIQ.saveState();
  return result;
};

/* ---- Display fallback helper ---- */
TIQ.displayValue = function (val, fallback) {
  return (val === undefined || val === null || val === '') ? fallback : val;
};

TIQ.formatMonthYear = function(val) {
  var raw = String(val == null ? '' : val).replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  if (/^[A-Za-z]{3,9}\s+\d{4}$/.test(raw)) return raw;
  var m = /^(\d{4})-(\d{1,2})$/.exec(raw);
  if (!m) return raw;
  var year = m[1];
  var monthIndex = parseInt(m[2], 10) - 1;
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (monthIndex < 0 || monthIndex >= months.length) return raw;
  return months[monthIndex] + ' ' + year;
};

/* ---- Normalize the polymorphic resumeUpload field ----
   resumeUpload is a plain filename string (seed data), an object with parse
   metadata (intake + scanner), "" (manual entry) or null (bulk import).
   Every renderer reads the normalized form instead of guessing at shapes. */
TIQ.resumeInfo = function(c) {
  var r = c ? c.resumeUpload : null;
  if (typeof r === "string" && r) {
    return { name: r, state: "legacy", parsedAt: "", error: "", sourceUrl: "" };
  }
  if (r && typeof r === "object") {
    return {
      name: r.name || "resume.pdf",
      state: r.parsedAt ? "scanned" : (r.parseError ? "failed" : "pending"),
      parsedAt: r.parsedAt || "",
      error: r.parseError || "",
      sourceUrl: r.sourceUrl || ""
    };
  }
  return { name: "", state: "missing", parsedAt: "", error: "", sourceUrl: "" };
};

/* ---- Update getMissingFlags to handle parsedResume + summary gaps ---- */
TIQ.getMissingFlags = function(c) {
  var flags = [];
  if (!c.workAuthorization) flags.push({ key: "Work Authorization", label: "Work Auth Unspecified" });
  if (!c.graduationDate) flags.push({ key: "Graduation", label: "Grad Date Missing" });
  if (!c.gpa) flags.push({ key: "GPA", label: "GPA Missing" });
  if (!c.phone) flags.push({ key: "Phone", label: "Contact Phone Missing" });
  if (!c.resumeUpload) {
    flags.push({ key: "Resume", label: "Resume Not Uploaded" });
  } else if (typeof c.resumeUpload === "object" && !c.resumeUpload.parsedAt) {
    flags.push({ key: "Resume", label: "Resume Not Scanned" });
  }
  if (!c.workLocations || c.workLocations.length === 0) flags.push({ key: "Location", label: "Location Preference Missing" });
  if (!c.skills || c.skills.length === 0) flags.push({ key: "Skills", label: "No Skills Captured" });
  if (!c.notes) flags.push({ key: "Notes", label: "No Recruiter Notes" });
  if (!c.areasDiscussed || c.areasDiscussed.length === 0) flags.push({ key: "Areas Discussed", label: "Areas Not Logged" });
  return flags;
};

/* ---- Public QR Intake helpers (used by candidate-form.html) ---- */
TIQ.intake = {};

/* IDs continue from 2500 + count to avoid colliding with manually created TQ-2500+ candidates. */
TIQ.intake.nextId = function(state) {
  var count = (state && Array.isArray(state.candidates)) ? state.candidates.length : 0;
  return TIQ.CONFIG.idPrefix + (2500 + count);
};

/* Only PDFs can be parsed by pdf.js — DOC/DOCX are rejected at selection time. */
TIQ.intake.isParsableResume = function(file) {
  if (!file) return false;
  var name = file.name || "";
  return file.type === "application/pdf" || /\.pdf$/i.test(name);
};

/* Builds a full candidate object from the QR intake form fields. */
TIQ.intake.buildCandidate = function(fields, opts) {
  opts = opts || {};
  fields = fields || {};
  var auditDetail = opts.auditDetail || "Candidate intake form submitted via QR scan";
  return {
    id: TIQ.intake.nextId(opts.state),
    firstName: fields.firstName || "",
    lastName: fields.lastName || "",
    email: fields.email || "",
    phone: fields.phone || "",
    university: fields.university || "",
    major: fields.major || "",
    graduationDate: fields.graduationDate || "",
    gpa: fields.gpa || "",
    /* Defaulting this ahead of the scan would make backfill("degreeProgram")
       a no-op and silently discard the degree printed on the resume. When a
       resume is attached we leave it empty so the scan can fill it. */
    degreeProgram: fields.degreeProgram || (fields.resumeName ? "" : TIQ.CONFIG.defaultDegreeProgram),
    /* Object with parsedAt:"" = uploaded but not scanned yet (flagged by getMissingFlags). */
    resumeUpload: fields.resumeName ? { name: fields.resumeName, type: "application/pdf", parsedAt: "" } : "",
    function: "General",
    priority: "Medium",
    skills: [],
    keySkills: [],
    /* resumeAddress is the mailing address printed on the resume. It is
       deliberately NOT workLocations, which is a recruiter-collected
       preference — auto-filling that would clear the "Location Preference
       Missing" flag without anyone ever asking the question. */
    resumeAddress: "",
    links: {},
    areasDiscussed: [],
    notes: "",
    summary: "",
    traceability: [],
    accomplishments: [],
    recordStatus: "New",
    approvalStatus: "Pending",
    approverId: "",
    approvalTimestamp: "",
    followUpRequestedBy: "",
    followUpTimestamp: "",
    lastUpdated: TIQ.todayISO(),
    created_at: TIQ.nowISO(),
    attributes: [],
    audioNotes: [],
    auditLog: [{ action: "CREATED", recruiter_id: "", timestamp: TIQ.nowISO(), pdetail: auditDetail }],
    reviewTimeMs: 0,
    noteEdits: 0
  };
};
