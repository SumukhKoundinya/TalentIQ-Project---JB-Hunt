/* ============================================
   TalentIQ — Configuration
   Edit this file to change any hardcoded values
   ============================================ */
window.TIQ = window.TIQ || {};

TIQ.CONFIG = {
  // --- App Info ---
  appName: "TalentIQ",
  company: "J.B. Hunt",

  // --- Event ---
  eventName: "Logistics & Technology Fair 2026",
  eventDate: "Sep 14, 2026",
  eventLocation: "Nashville, TN",

  // --- Candidate ID Generation ---
  idPrefix: "TQ-",
  idBaseOffset: 2400,

  // --- Default Values ---
  defaultDegreeProgram: "Bachelor of Science",
  defaultPriority: "Normal",

  // --- Storage Keys ---
  storageKey: "talentiq_state_v1",
  metricsKey: "talentiq_eval_metrics_v1",

  // --- Toast Durations (ms) ---
  toastDuration: 3200,
  toastUndoDuration: 5000,

  // --- Export Filenames ---
  exportCsvFilename: "talentiq_candidate_export.csv",
  exportJsonFilename: "talentiq_candidate_export.json",

  // --- Logo ---
  logoPath: "JBHUNT_LOGO.png",

  // --- Fonts ---
  fontsUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap",

  // --- Recruiters ---
  recruiters: [
    { id: "R1", name: "Taylor Morgan" },
    { id: "R2", name: "Alex Carter" },
    { id: "R3", name: "Morgan Wells" },
    { id: "R4", name: "Chris Rivera" }
  ],

  // --- Status Definitions ---
  statuses: ["New", "Reviewed", "Follow-Up", "Interview Requested", "Closed"],

  statusClassMap: {
    "New": "status-new",
    "Reviewed": "status-review",
    "Follow-Up": "status-followup",
    "Interview Requested": "status-interview",
    "Closed": "status-closed"
  },

  // --- Function/Role Filter Options ---
  functions: [
    "Software Engineer",
    "Data Analyst",
    "Logistics Technology",
    "Supply Chain Analytics",
    "Cybersecurity"
  ],

  // --- Priority Filter Options ---
  priorities: ["High", "Medium", "Low"],

  // --- University Dropdown Options ---
  universities: [
    "Nashville State University",
    "University of Alabama",
    "University of Arkansas",
    "University of Memphis",
    "University of Missouri",
    "University of Tennessee",
    "University of Central Arkansas",
    "Vanderbilt University",
    "MTSU",
    "Fisk University"
  ],

  // --- Major Dropdown Options ---
  majors: [
    "Computer Science",
    "Data Science",
    "Information Systems",
    "Cybersecurity",
    "Supply Chain Management",
    "Software Engineering",
    "Industrial Engineering",
    "Business Administration",
    "Mechanical Engineering",
    "Electrical Engineering"
  ],

  // --- Overview Dashboard (static demo KPIs) ---
  // Set to null to auto-compute from candidate data instead
  overviewStats: {
    totalScanned: 347,
    interviewRequests: 89,
    avgReviewTime: "2.4m",
    dataCompleteness: "78%"
  },

  // --- Bar Chart: Candidates by Major ---
  // Set to null to auto-compute from candidate data
  majorBreakdown: [
    { label: "Computer Science", percent: 42 },
    { label: "Business / Data", percent: 28 },
    { label: "Engineering", percent: 18 },
    { label: "Supply Chain", percent: 8 },
    { label: "Other", percent: 4 }
  ],

  // --- Top Universities ---
  // Set to null to auto-compute from candidate data
  topUniversities: [
    { name: "University of Alabama", count: 67 },
    { name: "University of Tennessee", count: 54 },
    { name: "Vanderbilt University", count: 41 },
    { name: "MTSU", count: 38 },
    { name: "Fisk University", count: 29 }
  ],

  // --- Activity Feed ---
  // Set to null to auto-generate from candidate audit logs
  activityFeed: [
    { recruiter: "Taylor Morgan", action: "approved", target: "TQ-2401", time: "2 min ago", dotColor: "green" },
    { recruiter: "Alex Carter", action: "flagged for follow-up", target: "TQ-2402", time: "5 min ago", dotColor: "amber" },
    { recruiter: "Chris Rivera", action: "reviewed", target: "TQ-2404", time: "12 min ago", dotColor: "blue" },
    { recruiter: "Morgan Wells", action: "uploaded audio for", target: "TQ-2403", time: "18 min ago", dotColor: "purple" },
    { recruiter: "Chris Rivera", action: "reviewed", target: "TQ-2406", time: "22 min ago", dotColor: "green" }
  ],

  // --- View Titles ---
  viewTitles: {
    "overview": "Event Overview",
    "candidate-intake": "Candidate Intake",
    "recruiter-capture": "Recruiter Capture",
    "info-review": "Info Cards Review",
    "ai-review": "AI Summary & Review",
    "candidate-review": "Candidate Review"
  },

  // --- Default View ---
  defaultView: "overview",

  // --- Seed Candidates ---
  // Replace with your own test data
  seedCandidates: [
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
  ]
};
