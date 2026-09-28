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
  storageKey: "talentiq_state_v2",
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

  // --- Auth / Login ---
  authStorageKey: "talentiq_auth_v1",
  demoPassword: "talentiq",
  // TEMP: skip login gate — set false to restore the login page
  skipLogin: true,

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
  // Diverse career-fair demo profiles
  seedCandidates: [
    {
      id: "TQ-2401", firstName: "Elena", lastName: "Martinez", email: "elena.martinez@uark.edu",
      phone: "(479) 555-0188", university: "University of Arkansas", degreeProgram: "Bachelor of Science",
      major: "Computer Science", graduationDate: "May 2026", gpa: "3.82", resumeUpload: "elena_martinez_resume.pdf",
      function: "Software Engineer", workLocations: ["Rogers, AR", "Dallas, TX"],
      workAuthorization: "US Citizen",
      skills: ["Python", "React", "AWS", "TypeScript"],
      keySkills: ["Python", "React", "AWS", "TypeScript"],
      areasDiscussed: ["Cloud", "APIs", "Logistics tech"],
      notes: "Built a route-optimization side project. Interested in J.B. Hunt engineering.",
      summary: "Elena is a CS senior focused on cloud APIs and logistics software, with strong Python and React experience.",
      traceability: ["Python/React — resume", "Route optimization project — notes", "Cloud interest — conversation"],
      recordStatus: "Interview Requested", approvalStatus: "Approved",
      approverId: "R1", approvalTimestamp: "2026-09-14T09:16:00Z",
      followUpRequestedBy: "", followUpTimestamp: "",
      lastUpdated: "2026-09-14", created_at: "2026-09-14T08:30:00Z",
      priority: "High", audioNotes: [],
      auditLog: [
        { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T08:30:00Z", time_to_complete: 28, detail: "Candidate intake form submitted" },
        { action: "INTERVIEW_REQUESTED", recruiter_id: "R1", timestamp: "2026-09-14T09:16:00Z", time_to_complete: 180, detail: "Interview requested after technical discussion" }
      ],
      reviewTimeMs: 0, noteEdits: 0
    },
    {
      id: "TQ-2402", firstName: "Marcus", lastName: "Nguyen", email: "m.nguyen@memphis.edu",
      phone: "(901) 555-0144", university: "University of Memphis", degreeProgram: "Bachelor of Science",
      major: "Data Science", graduationDate: "December 2026", gpa: "3.61", resumeUpload: "marcus_nguyen_resume.pdf",
      function: "Data Analyst", workLocations: ["Memphis, TN", "Remote"],
      workAuthorization: "US Citizen",
      skills: ["SQL", "Python", "Tableau", "R"],
      keySkills: ["SQL", "Python", "Tableau", "Forecasting"],
      areasDiscussed: ["Forecasting", "Lane analytics", "Dashboards"],
      notes: "Presented a freight volume forecasting notebook.",
      summary: "Marcus brings data science skills for transportation analytics and forecasting dashboards.",
      traceability: ["SQL/Python — resume", "Forecasting notebook — conversation"],
      recordStatus: "Follow-Up", approvalStatus: "Pending",
      approverId: "", approvalTimestamp: "",
      followUpRequestedBy: "R2", followUpTimestamp: "2026-09-14T10:00:00Z",
      lastUpdated: "2026-09-14", created_at: "2026-09-14T09:00:00Z",
      priority: "Medium", audioNotes: [],
      auditLog: [
        { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T09:00:00Z", time_to_complete: 32, detail: "Candidate intake form submitted" },
        { action: "FOLLOW_UP", recruiter_id: "R2", timestamp: "2026-09-14T10:00:00Z", time_to_complete: 240, detail: "Follow-up requested for analytics team discussion" }
      ],
      reviewTimeMs: 0, noteEdits: 0
    },
    {
      id: "TQ-2403", firstName: "Aisha", lastName: "Rahman", email: "aisha.rahman@uark.edu",
      phone: "(501) 555-0276", university: "University of Arkansas", degreeProgram: "Bachelor of Science",
      major: "Information Systems", graduationDate: "May 2027", gpa: "3.74", resumeUpload: "aisha_rahman_resume.pdf",
      function: "Logistics Technology", workLocations: ["Fayetteville, AR"],
      workAuthorization: "Require Sponsorship",
      skills: ["Power BI", "SAP", "SQL", "Process Mapping"],
      keySkills: ["Power BI", "SAP", "SQL", "Process mapping"],
      areasDiscussed: ["ERP", "Warehouse systems", "Automation"],
      notes: "Curious about TMS integrations and warehouse workflows.",
      summary: "Aisha focuses on IS and ERP process improvement for logistics operations.",
      traceability: ["SAP/Power BI — resume", "TMS interest — conversation"],
      recordStatus: "Reviewed", approvalStatus: "Approved",
      approverId: "R3", approvalTimestamp: "2026-09-14T10:05:00Z",
      followUpRequestedBy: "", followUpTimestamp: "",
      lastUpdated: "2026-09-14", created_at: "2026-09-14T09:15:00Z",
      priority: "High", audioNotes: [],
      auditLog: [
        { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T09:15:00Z", time_to_complete: 30, detail: "Candidate intake form submitted" },
        { action: "APPROVED", recruiter_id: "R3", timestamp: "2026-09-14T10:05:00Z", time_to_complete: 195, detail: "Reviewed and approved" }
      ],
      reviewTimeMs: 0, noteEdits: 0
    },
    {
      id: "TQ-2404", firstName: "Devin", lastName: "Brooks", email: "devin.brooks@ua.edu",
      phone: "(205) 555-0311", university: "University of Alabama", degreeProgram: "Bachelor of Science",
      major: "Cybersecurity", graduationDate: "May 2026", gpa: "3.55", resumeUpload: "devin_brooks_resume.pdf",
      function: "Cybersecurity", workLocations: ["Birmingham, AL", "Remote"],
      workAuthorization: "US Citizen",
      skills: ["Linux", "Networking", "Python", "Incident Response"],
      keySkills: ["Linux", "Networking", "Incident response"],
      areasDiscussed: ["OT security", "Cloud security", "Risk"],
      notes: "Interested in securing fleet and yard systems.",
      summary: "Devin is a cybersecurity student exploring OT and cloud security for transportation networks.",
      traceability: ["Linux/networking — resume", "Fleet security interest — notes"],
      recordStatus: "Interview Requested", approvalStatus: "Approved",
      approverId: "R4", approvalTimestamp: "2026-09-14T11:08:00Z",
      followUpRequestedBy: "", followUpTimestamp: "",
      lastUpdated: "2026-09-14", created_at: "2026-09-14T09:30:00Z",
      priority: "Medium", audioNotes: [],
      auditLog: [
        { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T09:30:00Z", time_to_complete: 25, detail: "Candidate intake form submitted" },
        { action: "INTERVIEW_REQUESTED", recruiter_id: "R4", timestamp: "2026-09-14T11:08:00Z", time_to_complete: 210, detail: "Interview requested for cyber risk team" }
      ],
      reviewTimeMs: 0, noteEdits: 0
    },
    {
      id: "TQ-2405", firstName: "Sofia", lastName: "Kim", email: "sofia.kim@uca.edu",
      phone: "(501) 555-0440", university: "University of Central Arkansas", degreeProgram: "Bachelor of Science",
      major: "Supply Chain Management", graduationDate: "December 2026", gpa: "3.48", resumeUpload: "sofia_kim_resume.pdf",
      function: "Supply Chain Analytics", workLocations: ["Little Rock, AR", "Fort Worth, TX"],
      workAuthorization: "US Citizen",
      skills: ["Excel", "Forecasting", "Logistics", "Lean"],
      keySkills: ["Excel", "Forecasting", "Logistics"],
      areasDiscussed: ["Lane planning", "Inventory", "Carrier performance"],
      notes: "Talked through inbound freight planning internship.",
      summary: "Sofia has supply chain analytics experience with lane planning and forecasting coursework.",
      traceability: ["Excel forecasting — resume", "Inbound planning internship — conversation"],
      recordStatus: "New", approvalStatus: "Pending",
      approverId: "", approvalTimestamp: "",
      followUpRequestedBy: "", followUpTimestamp: "",
      lastUpdated: "2026-09-14", created_at: "2026-09-14T09:45:00Z",
      priority: "Low", audioNotes: [],
      auditLog: [
        { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T09:45:00Z", time_to_complete: 35, detail: "Candidate intake form submitted" }
      ],
      reviewTimeMs: 0, noteEdits: 0
    },
    {
      id: "TQ-2406", firstName: "Noah", lastName: "Patel", email: "noah.patel@missouri.edu",
      phone: "(816) 555-0522", university: "University of Missouri", degreeProgram: "Bachelor of Science",
      major: "Software Engineering", graduationDate: "May 2027", gpa: "3.91", resumeUpload: "noah_patel_resume.pdf",
      function: "Software Engineer", workLocations: ["Kansas City, MO", "Remote"],
      workAuthorization: "US Citizen",
      skills: ["Java", "Spring", "SQL", "Docker"],
      keySkills: ["Java", "Spring", "SQL", "Docker"],
      areasDiscussed: ["Backend", "Microservices", "APIs"],
      notes: "Strong backend fundamentals; asked about telematics platforms.",
      summary: "Noah is a software engineering junior strong in Java backends and service APIs.",
      traceability: ["Java/Spring — resume", "Telematics interest — conversation"],
      recordStatus: "Reviewed", approvalStatus: "Approved",
      approverId: "R4", approvalTimestamp: "2026-09-14T11:42:00Z",
      followUpRequestedBy: "", followUpTimestamp: "",
      lastUpdated: "2026-09-14", created_at: "2026-09-14T10:00:00Z",
      priority: "High", audioNotes: [],
      auditLog: [
        { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T10:00:00Z", time_to_complete: 29, detail: "Candidate intake form submitted" },
        { action: "APPROVED", recruiter_id: "R4", timestamp: "2026-09-14T11:42:00Z", time_to_complete: 168, detail: "Reviewed and approved" }
      ],
      reviewTimeMs: 0, noteEdits: 0
    },
    {
      id: "TQ-2407", firstName: "Harper", lastName: "Coleman", email: "harper.coleman@utk.edu",
      phone: "(865) 555-0667", university: "University of Tennessee", degreeProgram: "Bachelor of Science",
      major: "Industrial Engineering", graduationDate: "May 2027", gpa: "3.67", resumeUpload: "",
      function: "Supply Chain Analytics", workLocations: ["Knoxville, TN", "Nashville, TN"],
      workAuthorization: "US Citizen",
      skills: ["Simulation", "Lean", "Excel", "Arena"],
      keySkills: ["Simulation", "Lean", "Operations"],
      areasDiscussed: ["Yard efficiency", "Safety", "Process design"],
      notes: "Shared a yard-throughput simulation class project.",
      summary: "Harper applies industrial engineering and simulation to yard and process efficiency problems.",
      traceability: ["Simulation coursework — resume", "Yard throughput project — conversation"],
      recordStatus: "New", approvalStatus: "Pending",
      approverId: "", approvalTimestamp: "",
      followUpRequestedBy: "", followUpTimestamp: "",
      lastUpdated: "2026-09-14", created_at: "2026-09-14T10:15:00Z",
      priority: "Low", audioNotes: [],
      auditLog: [
        { action: "CREATED", recruiter_id: "", timestamp: "2026-09-14T10:15:00Z", time_to_complete: 33, detail: "Candidate intake form submitted" }
      ],
      reviewTimeMs: 0, noteEdits: 0
    }
  ]
};
