const candidates = [
  {
    id: "TQ-2401",
    firstName: "Mia",
    lastName: "Williams",
    preferredName: "Mia",
    email: "mia.williams@student.edu",
    phone: "555-0140",
    university: "Nashville State University",
    degreeProgram: "Bachelor of Science",
    major: "Computer Science",
    graduationDate: "May 2026",
    gpa: "3.86",
    resumeUpload: "mia_williams_resume.pdf",
    function: "Software Engineer",
    interestAreas: ["Python", "Cloud", "Machine Learning"],
    workLocations: ["Nashville, TN", "Dallas, TX"],
    workAuthorization: "US Citizen",
    skills: ["Python", "React", "APIs", "JavaScript"],
    coursework: ["Data Structures", "Distributed Systems", "AI"],
    projectExperience: ["ML research assistant", "Capstone web platform"],
    event: "Logistics & Technology Fair",
    recruiter: "Taylor Morgan",
    notes: "Strong technical discussion. Interested in cloud-native software and logistics data systems. Asked about internship location flexibility.",
    areasDiscussed: ["Cloud", "Python", "AI", "Data Systems"],
    followUpQuestions: ["What was your role in the ML research project?"],
    recommendedNextStep: "Schedule technical follow-up interview",
    candidateQuestions: ["Will there be an opportunity to work with AI and logistics data?"],
    summary: "Mia is a strong software engineering candidate with experience in Python, React, and cloud-focused coursework. She has demonstrated interest in data systems and AI applications within logistics technology.",
    keySkills: ["Python", "React", "API design", "Cloud systems"],
    relevantExperience: ["Data Structures", "AI research", "Capstone project"],
    missingInformation: ["GPA not provided", "Work authorization verified"],
    traceability: ["Python and React experience — resume", "Capstone project — application notes", "AI and logistics data interest — recruiter notes"],
    recordStatus: "Interview Requested",
    approvalStatus: "Approved",
    approvalTimestamp: "2026-09-14T09:16:00Z",
    lastUpdated: "2026-09-14",
    priority: "High",
    fitScore: 91,
    communication: 89,
    experience: 86,
    interviewRequested: true
  },
  {
    id: "TQ-2402",
    firstName: "Jordan",
    lastName: "Patel",
    preferredName: "Jordan",
    email: "jordan.patel@student.edu",
    phone: "555-0198",
    university: "University of Memphis",
    degreeProgram: "Bachelor of Science",
    major: "Data Science",
    graduationDate: "Dec 2025",
    gpa: "3.72",
    resumeUpload: "jordan_patel_resume.pdf",
    function: "Data Analyst",
    interestAreas: ["Analytics", "Supply Chain", "Forecasting"],
    workLocations: ["Memphis, TN", "Remote"],
    workAuthorization: "F-1 eligible",
    skills: ["SQL", "Python", "Visualization", "Statistics"],
    coursework: ["Statistics", "Predictive Modeling", "Operations Analytics"],
    projectExperience: ["Demand forecasting dashboard", "Supply chain optimization"],
    event: "Logistics & Technology Fair",
    recruiter: "Alex Carter",
    notes: "Candidate expressed interest in using analytics to improve transportation performance. Good question set around process measurement and KPI dashboards.",
    areasDiscussed: ["Analytics", "Forecasting", "Supply Chain"],
    followUpQuestions: ["How did you evaluate model performance?"],
    recommendedNextStep: "Request interview with analytics team",
    candidateQuestions: ["Are there opportunities to work with multimodal transportation data?"],
    summary: "Jordan brings data science and operations analytics experience with forecasting and supply chain coursework. Candidate is interested in measurement and optimization work within logistics.",
    keySkills: ["SQL", "Python", "Statistics", "Visualization"],
    relevantExperience: ["Forecasting dashboard", "Operations analytics"],
    missingInformation: ["Phone number optional — missing"],
    traceability: ["SQL and Python — resume", "Forecasting dashboard — project experience", "Supply chain analytics interest — recruiter notes"],
    recordStatus: "Follow-Up",
    approvalStatus: "Pending",
    approvalTimestamp: "",
    lastUpdated: "2026-09-14",
    priority: "Medium",
    fitScore: 78,
    communication: 83,
    experience: 76,
    interviewRequested: false
  },
  {
    id: "TQ-2403",
    firstName: "Priya",
    lastName: "Singh",
    preferredName: "Priya",
    email: "priya.singh@student.edu",
    phone: "555-0212",
    university: "University of Arkansas",
    degreeProgram: "Bachelor of Science",
    major: "Information Systems",
    graduationDate: "May 2027",
    gpa: "3.78",
    resumeUpload: "priya_singh_resume.pdf",
    function: "Logistics Technology",
    interestAreas: ["Automation", "Systems", "Enterprise apps"],
    workLocations: ["Springdale, AR", "Memphis, TN"],
    workAuthorization: "US Citizen",
    skills: ["SQL", "ERP", "Process Mapping", "Power BI"],
    coursework: ["Database Systems", "Enterprise Architecture", "Operations Management"],
    projectExperience: ["Logistics workflow redesign", "ERP process documentation"],
    event: "Logistics & Technology Fair",
    recruiter: "Morgan Wells",
    notes: "Strong interest in process automation and enterprise systems. Candidate asks about how technology improves cross-functional coordination.",
    areasDiscussed: ["Process automation", "ERP", "Operations"],
    followUpQuestions: ["What systems integration experience do you have?"],
    recommendedNextStep: "Schedule operations technology conversation",
    candidateQuestions: ["Can you share examples of enterprise transformation projects?"],
    summary: "Priya is interested in logistics technology and enterprise systems. She has training in process mapping, operations, and data systems and would benefit from an operations technology conversation.",
    keySkills: ["SQL", "ERP", "Power BI", "Process mapping"],
    relevantExperience: ["ERP process documentation", "Logistics workflow redesign"],
    missingInformation: ["Graduation date provided", "Location preference missing"],
    traceability: ["ERP process experience — resume", "Logistics workflow redesign — project experience", "Enterprise systems interest — recruiter notes"],
    recordStatus: "Reviewed",
    approvalStatus: "Approved",
    approvalTimestamp: "2026-09-14T10:05:00Z",
    lastUpdated: "2026-09-14",
    priority: "High",
    fitScore: 84,
    communication: 88,
    experience: 79,
    interviewRequested: false
  },
  {
    id: "TQ-2404",
    firstName: "Andre",
    lastName: "Brooks",
    preferredName: "Andre",
    email: "andre.brooks@student.edu",
    phone: "555-0239",
    university: "University of Alabama",
    degreeProgram: "Bachelor of Science",
    major: "Cybersecurity",
    graduationDate: "May 2026",
    gpa: "3.81",
    resumeUpload: "andre_brooks_resume.pdf",
    function: "Cybersecurity",
    interestAreas: ["Security Engineering", "Risk", "Network Defense"],
    workLocations: ["Birmingham, AL", "Remote"],
    workAuthorization: "US Citizen",
    skills: ["Networking", "Linux", "Incident Response", "Python"],
    coursework: ["Information Security", "Network Systems", "Ethical Hacking"],
    projectExperience: ["Security monitoring lab", "Vulnerability assessment"],
    event: "Logistics & Technology Fair",
    recruiter: "Chris Rivera",
    notes: "Candidate is interested in applying security controls to transportation networks and data systems. Good fit for technology risk and modernization discussions.",
    areasDiscussed: ["Network security", "Risk", "Cloud security"],
    followUpQuestions: ["What security tools have you used in lab environments?"],
    recommendedNextStep: "Coordinate with cyber risk team",
    candidateQuestions: ["Does the role include exposure to cloud and enterprise security?"],
    summary: "Andre demonstrates strong technical foundations in networking, Linux, security, and incident response. His interest aligns with cybersecurity and risk management in transportation technology.",
    keySkills: ["Incident response", "Linux", "Networking", "Python"],
    relevantExperience: ["Security monitoring lab", "Vulnerability assessment"],
    missingInformation: ["No missing critical information"],
    traceability: ["Security operations coursework — resume", "Vulnerability assessment — project experience", "Network security interest — recruiter notes"],
    recordStatus: "Interview Requested",
    approvalStatus: "Approved",
    approvalTimestamp: "2026-09-14T11:08:00Z",
    lastUpdated: "2026-09-14",
    priority: "Medium",
    fitScore: 81,
    communication: 84,
    experience: 80,
    interviewRequested: true
  },
  {
    id: "TQ-2405",
    firstName: "Sam",
    lastName: "Rivera",
    preferredName: "Sam",
    email: "sam.rivera@student.edu",
    phone: "555-0248",
    university: "University of Central Arkansas",
    degreeProgram: "Bachelor of Science",
    major: "Supply Chain Management",
    graduationDate: "Dec 2026",
    gpa: "3.66",
    resumeUpload: "sam_rivera_resume.pdf",
    function: "Supply Chain Analytics",
    interestAreas: ["Operations", "Analytics", "Transportation"],
    workLocations: ["Little Rock, AR", "Fort Worth, TX"],
    workAuthorization: "US Citizen",
    skills: ["Excel", "Forecasting", "Process Improvement", "Logistics"],
    coursework: ["Supply Chain Systems", "Transportation Systems", "Analytics"],
    projectExperience: ["Lane analysis", "Warehouse capacity model"],
    event: "Logistics & Technology Fair",
    recruiter: "Taylor Morgan",
    notes: "Candidate described strong knowledge of transportation lane planning and data driven planning. Candidate asked about field and operations opportunities.",
    areasDiscussed: ["Transportation", "Analytics", "Operations"],
    followUpQuestions: ["What tools did you use to model warehouse capacity?"],
    recommendedNextStep: "Send to supply chain operations team",
    candidateQuestions: ["Are there leadership opportunities across supply chain and transportation?"],
    summary: "Sam has operational and transportation knowledge combined with supply chain analytics coursework. Candidate is interested in building systems that improve lane performance and warehouse flow.",
    keySkills: ["Excel", "Forecasting", "Process Improvement", "Logistics"],
    relevantExperience: ["Lane analysis", "Warehouse capacity model"],
    missingInformation: ["Resume upload complete", "Work authorization status missing"],
    traceability: ["Excel and forecasting experience — resume", "Warehouse capacity project — project experience", "Operations and logistics interest — recruiter notes"],
    recordStatus: "New",
    approvalStatus: "Not Started",
    approvalTimestamp: "",
    lastUpdated: "2026-09-14",
    priority: "Low",
    fitScore: 72,
    communication: 81,
    experience: 74,
    interviewRequested: false
  },
  {
    id: "TQ-2406",
    firstName: "Olivia",
    lastName: "Chen",
    preferredName: "Olivia",
    email: "olivia.chen@student.edu",
    phone: "555-0270",
    university: "University of Missouri",
    degreeProgram: "Bachelor of Science",
    major: "Software Engineering",
    graduationDate: "May 2027",
    gpa: "3.89",
    resumeUpload: "olivia_chen_resume.pdf",
    function: "Software Engineer",
    interestAreas: ["Full Stack", "APIs", "Cloud", "Front End"],
    workLocations: ["Kansas City, MO", "Remote"],
    workAuthorization: "US Citizen",
    skills: ["JavaScript", "React", "Node.js", "SQL"],
    coursework: ["Web Systems", "Database Systems", "Human Centered Design"],
    projectExperience: ["React dashboard", "Student API service"],
    event: "Logistics & Technology Fair",
    recruiter: "Chris Rivera",
    notes: "Strong technical communication. Candidate discussed front-end architecture and scalable data flows. Demonstrated real interest in building internal logistics applications.",
    areasDiscussed: ["Frontend", "APIs", "Cloud", "React"],
    followUpQuestions: ["What was your most complex API integration?"],
    recommendedNextStep: "Technical interview request",
    candidateQuestions: ["Is there an opportunity to build logistics-facing developer tools?"],
    summary: "Olivia has a web engineering profile with JavaScript, React, Node.js, and SQL experience. She is interested in front-end delivery and platform applications for logistics teams.",
    keySkills: ["JavaScript", "React", "Node.js", "SQL"],
    relevantExperience: ["React dashboard", "Student API service"],
    missingInformation: ["No missing critical information"],
    traceability: ["JavaScript, React and Node.js — resume", "React dashboard — project experience", "Frontend and API interest — recruiter notes"],
    recordStatus: "Reviewed",
    approvalStatus: "Approved",
    approvalTimestamp: "2026-09-14T11:42:00Z",
    lastUpdated: "2026-09-14",
    priority: "High",
    fitScore: 88,
    communication: 92,
    experience: 82,
    interviewRequested: false
  },
  {
    id: "TQ-2407",
    firstName: "Avery",
    lastName: "Johnson",
    preferredName: "Avery",
    email: "avery.johnson@student.edu",
    phone: "555-0310",
    university: "University of Tennessee",
    degreeProgram: "Bachelor of Science",
    major: "Industrial Engineering",
    graduationDate: "May 2027",
    gpa: "3.63",
    resumeUpload: "avery_johnson_resume.pdf",
    function: "Supply Chain Analytics",
    interestAreas: ["Process Improvement", "Optimization", "Safety"],
    workLocations: ["Memphis, TN", "Nashville, TN"],
    workAuthorization: "US Citizen",
    skills: ["Lean", "Excel", "Simulation", "Operations"],
    coursework: ["Operations Research", "Facilities Planning", "Quality Systems"],
    projectExperience: ["Optimization model", "Safety audit workflow"],
    event: "Logistics & Technology Fair",
    recruiter: "Alex Carter",
    notes: "Candidate expressed interest in process improvement and safety analytics. Candidate is interested in transportation operations and performance improvement.",
    areasDiscussed: ["Operations", "Safety", "Optimization"],
    followUpQuestions: ["How did you model the performance improvement scenario?"],
    recommendedNextStep: "Move to follow-up meeting",
    candidateQuestions: ["What does a first assignment look like for an operations analytics track?"],
    summary: "Avery shows strong interest in process improvement and optimization grounded in industrial engineering coursework and project concepts. Candidate could contribute to operations design and transportation planning.",
    keySkills: ["Lean", "Excel", "Operations", "Simulation"],
    relevantExperience: ["Optimization model", "Safety audit workflow"],
    missingInformation: ["No critical work authorization data"],
    traceability: ["Lean and logistics operations — resume", "Optimization model — project experience", "Safety and process modeling interest — recruiter notes"],
    recordStatus: "New",
    approvalStatus: "Pending",
    approvalTimestamp: "",
    lastUpdated: "2026-09-14",
    priority: "Low",
    fitScore: 71,
    communication: 79,
    experience: 73,
    interviewRequested: false
  }
];

const statusClassMap = {
  "New": "status-new",
  "Reviewed": "status-review",
  "Follow-Up": "status-followup",
  "Interview Requested": "status-interview",
  "Closed": "status-closed"
};

const statusLabelMap = {
  "New": "New",
  "Reviewed": "Reviewed",
  "Follow-Up": "Follow-Up",
  "Interview Requested": "Interview Requested",
  "Closed": "Closed"
};

const candidateList = document.getElementById("candidateList");
const globalSearch = document.getElementById("globalSearch");
const statusFilter = document.getElementById("statusFilter");
const functionFilter = document.getElementById("functionFilter");
const priorityFilter = document.getElementById("priorityFilter");
const sortButton = document.getElementById("sortButton");
const refreshButton = document.getElementById("refreshButton");
const exportButton = document.getElementById("exportButton");

function init() {
  renderCandidates(candidates);
  renderPipelineChart(candidates);
  wireEvents();
}

function formatCandidateCard(candidate) {
  const initials = `${candidate.firstName[0]}${candidate.lastName[0]}`;
  const statusClass = statusClassMap[candidate.recordStatus];
  const sourceTrust = candidate.traceability.length >= 2 ? "High trace" : "Missing trace";

  return `<article class="candidate-card ${candidate.id === candidates[0].id ? 'selected' : ''}" data-id="${candidate.id}" tabindex="0">
    <div class="candidate-avatar" aria-label="${candidate.firstName} ${candidate.lastName}">${initials}</div>
    <div class="candidate-main">
      <div class="candidate-header">
        <span class="candidate-name">${candidate.firstName} ${candidate.lastName}</span>
        <span class="candidate-id">${candidate.id}</span>
      </div>
      <div class="candidate-university">${candidate.university} • ${candidate.major}</div>
      <div class="candidate-tags">
        ${candidate.skills.slice(0, 3).map(skill => `<span>${skill}</span>`).join("")}
      </div>
    </div>
    <div class="candidate-card__right">
      <span class="status-chip ${statusClass}">${candidate.recordStatus}</span>
      <span class="candidate-score">${candidate.fitScore}% fit • ${sourceTrust}</span>
    </div>
  </article>`;
}

function renderCandidates(data) {
  candidateList.innerHTML = data.map(formatCandidateCard).join("");

  Array.from(candidateList.children).forEach(card => {
    card.addEventListener("click", () => {
      selectCandidate(card.dataset.id);
    });
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectCandidate(card.dataset.id);
      }
    });
  });

  const total = document.getElementById("totalRecords");
  total.textContent = String(data.length).padStart(2, "0");
}

function selectCandidate(id) {
  const candidate = candidates.find(c => c.id === id);
  if (!candidate) return;

  const cards = Array.from(candidateList.children);
  cards.forEach(card => card.classList.toggle("selected", card.dataset.id === id));

  document.getElementById("profileAvatar").textContent = `${candidate.firstName[0]}${candidate.lastName[0]}`;
  document.getElementById("profileUniversity").textContent = candidate.university;
  document.getElementById("profileName").textContent = `${candidate.firstName} ${candidate.lastName}`;
  document.getElementById("profileProgram").textContent = `${candidate.degreeProgram} • ${candidate.major}`;
  document.getElementById("profileGrad").textContent = candidate.graduationDate;
  document.getElementById("profileSummary").textContent = candidate.summary;
  document.getElementById("profileNotes").textContent = candidate.notes;
  document.getElementById("profilePriority").textContent = candidate.priority;
  document.getElementById("profileMatch").textContent = `Match ${candidate.fitScore}%`;

  document.getElementById("profileStatus").textContent = candidate.recordStatus;
  document.getElementById("profileStatus").className = `status-chip ${statusClassMap[candidate.recordStatus]}`;

  const tags = document.getElementById("careerTags");
  tags.innerHTML = candidate.areasDiscussed.map(item => `<span>${item}</span>`).join("");

  const traces = document.getElementById("traceList");
  traces.innerHTML = candidate.traceability.map(item => `<span class="trace-item">${item}</span>`).join("");

  document.getElementById("scoreSkills").style.width = `${Math.round(candidate.fitScore * 0.7)}%`;
  document.getElementById("scoreExperience").style.width = `${Math.round(candidate.experience)}%`;
  document.getElementById("scoreCommunication").style.width = `${Math.round(candidate.communication)}%`;

  document.getElementById("profileContact").textContent = candidate.workAuthorization;
}

function wireEvents() {
  statusFilter.addEventListener("change", applyFilters);
  functionFilter.addEventListener("change", applyFilters);
  priorityFilter.addEventListener("change", applyFilters);

  globalSearch.addEventListener("input", applyFilters);

  sortButton.addEventListener("click", () => {
    const sorted = [...candidates].sort((a, b) => a.firstName.localeCompare(b.firstName));
    renderCandidates(sorted);
    selectCandidate(sorted[0].id);
  });

  refreshButton.addEventListener("click", () => {
    renderCandidates(candidates);
    renderPipelineChart(candidates);
    selectCandidate(candidates[0].id);
  });

  exportButton.addEventListener("click", () => {
    const rows = candidates.map(c => [c.id, c.firstName, c.lastName, c.function, c.recordStatus, c.priority, c.fitScore].join(","));
    const csv = ["ID,First,Last,Function,Status,Priority,FitScore", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "talentiq_candidate_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  document.getElementById("approveButton").addEventListener("click", () => {
    const current = candidates.find(c => c.id === selectedCandidateId()) || candidates[0];
    current.recordStatus = "Reviewed";
    current.approvalStatus = "Approved";
    renderCandidates(candidates);
    renderPipelineChart(candidates);
    selectCandidate(current.id);
  });

  document.getElementById("followUpButton").addEventListener("click", () => {
    const current = candidates.find(c => c.id === selectedCandidateId()) || candidates[0];
    current.recordStatus = "Follow-Up";
    current.priority = "High";
    renderCandidates(candidates);
    renderPipelineChart(candidates);
    selectCandidate(current.id);
  });
}

function selectedCandidateId() {
  const selected = document.querySelector(".candidate-card.selected");
  return selected ? selected.dataset.id : candidates[0].id;
}

function applyFilters() {
  const search = globalSearch.value.trim().toLowerCase();
  const status = statusFilter.value;
  const functionValue = functionFilter.value;
  const priority = priorityFilter.value;

  const filtered = candidates.filter(candidate => {
    const matchesSearch = [
      candidate.firstName,
      candidate.lastName,
      candidate.major,
      candidate.function,
      candidate.skills.join(" "),
      candidate.notes,
      candidate.areasDiscussed.join(" "),
      candidate.university
    ].some(value => value.toLowerCase().includes(search));

    const matchesStatus = status === "all" || candidate.recordStatus === status;
    const matchesFunction = functionValue === "all" || candidate.function === functionValue;
    const matchesPriority = priority === "all" || candidate.priority === priority;

    return matchesSearch && matchesStatus && matchesFunction && matchesPriority;
  });

  renderCandidates(filtered);

  if (filtered.length > 0) {
    const first = filtered[0];
    selectCandidate(first.id);
  }

  renderPipelineChart(filtered);
}

function renderPipelineChart(data) {
  const statusCounts = {
    "New": 0,
    "Reviewed": 0,
    "Follow-Up": 0,
    "Interview Requested": 0,
    "Closed": 0
  };

  data.forEach(c => {
    if (statusCounts[c.recordStatus] !== undefined) {
      statusCounts[c.recordStatus]++;
    }
  });

  const total = Math.max(...Object.values(statusCounts), 1);
  const barData = ["New", "Reviewed", "Follow-Up", "Interview Requested", "Closed"];

  const barChart = document.getElementById("barChart");
  barChart.innerHTML = barData.map(status => {
    const count = statusCounts[status];
    const height = Math.max((count / total) * 100, count ? 18 : 6);
    return `<div class="bar-wrap">
      <div class="bar" title="${status}: ${count}" style="height: ${height}px; background: ${getStatusColor(status)};"></div>
      <span class="bar-label">${count}</span>
    </div>`;
  }).join("");

  const ready = data.filter(c => c.recordStatus === "Reviewed" || c.recordStatus === "Follow-Up" || c.recordStatus === "Interview Requested").length;
  const status = document.getElementById("reviewStatus");
  status.textContent = String(ready).padStart(2, "0");

  const interviewCount = data.filter(c => c.recordStatus === "Interview Requested").length;
  document.getElementById("interviewCount").textContent = String(interviewCount).padStart(2, "0");
}

function getStatusColor(status) {
  return {
    "New": "#2f80ed",
    "Reviewed": "#12a872",
    "Follow-Up": "#6659d4",
    "Interview Requested": "#08665c",
    "Closed": "#b35454"
  }[status] || "#08665c";
}

init();
