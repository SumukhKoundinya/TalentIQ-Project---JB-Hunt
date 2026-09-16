export type CandidateStatus = "New" | "Reviewed" | "Follow-Up" | "Interview Requested" | "Closed"
export type CandidatePriority = "Low" | "Medium" | "High"
export type CandidateFunction =
  | "Supply Chain"
  | "Transportation"
  | "Engineering"
  | "Data Science"
  | "Finance"
  | "Marketing"
  | "Human Resources"
  | "Operations"
  | "Sales"
  | "Information Technology"

export interface AuditEntry {
  timestamp: string
  action: string
  detail: string
}

export interface Recording {
  id: string
  blob: Blob
  blobUrl: string
  duration: number
  createdAt: string
}

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  university: string
  major: string
  function: CandidateFunction
  graduationDate: string
  gpa?: string
  workAuthorization?: string
  resumeFileName?: string
  notes: string
  status: CandidateStatus
  priority: CandidatePriority
  quickTags: string[]
  aiSnapshot: string
  aiSkills: string[]
  aiScore: number
  recordings: string[]
  createdAt: string
  updatedAt: string
  auditLog: AuditEntry[]
}

export type CandidateInput = Omit<Candidate, "id" | "aiSnapshot" | "aiSkills" | "aiScore" | "status" | "priority" | "createdAt" | "updatedAt" | "auditLog">

export type ViewId =
  | "capture"
  | "intake"
  | "ai-review"
  | "card-review"
  | "data-manager"
  | "overview"
  | "qr-poster"
  | "metrics"
