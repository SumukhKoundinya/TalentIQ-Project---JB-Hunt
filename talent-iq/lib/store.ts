import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Candidate, CandidateInput, CandidateStatus, CandidatePriority, AuditEntry } from "./types"
import { seedCandidates } from "./data"

function generateId(existing: Candidate[]): string {
  const nums = existing.map((c) => parseInt(c.id.replace("TQ-", ""), 10)).filter((n) => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `TQ-${String(next).padStart(4, "0")}`
}

function generateAiSnapshot(c: CandidateInput): string {
  const sentences = [
    `${c.firstName} ${c.lastName} is a ${c.function} student at ${c.university} majoring in ${c.major}.`,
    c.gpa ? `With a GPA of ${c.gpa}, they demonstrate strong academic performance.` : "Their academic record shows dedication to their field.",
    `Expected graduation: ${c.graduationDate}.`,
    c.notes ? `Additional notes: ${c.notes}` : "",
  ].filter(Boolean)
  return sentences.join(" ")
}

function generateAiSkills(func: string): string[] {
  const skillMap: Record<string, string[]> = {
    "Supply Chain": ["Logistics Planning", "Demand Forecasting", "Inventory Management", "Process Optimization"],
    Transportation: ["Fleet Management", "Route Optimization", "Regulatory Compliance", "Logistics Coordination"],
    Engineering: ["CAD Design", "Quality Control", "System Design", "Technical Documentation"],
    "Data Science": ["Python", "Machine Learning", "Data Visualization", "Statistical Analysis"],
    Finance: ["Financial Modeling", "Budget Analysis", "Risk Assessment", "Regulatory Knowledge"],
    Marketing: ["Digital Strategy", "Brand Management", "Market Research", "Content Creation"],
    "Human Resources": ["Talent Acquisition", "Employee Relations", "Training Development", "Compliance"],
    Operations: ["Process Improvement", "Resource Allocation", "Quality Assurance", "Workflow Design"],
    Sales: ["Client Relationship", "Negotiation", "Pipeline Management", "Strategic Planning"],
    "Information Technology": ["Software Development", "System Architecture", "Cloud Services", "Cybersecurity"],
  }
  return skillMap[func] || ["Communication", "Problem Solving", "Teamwork", "Adaptability"]
}

function generateAiScore(): number {
  return Math.floor(Math.random() * 31) + 70
}

interface AppState {
  candidates: Candidate[]
  recordings: { candidateId: string; recording: { id: string; blob: Blob; blobUrl: string; duration: number; createdAt: string } }[]
  activeRecruiterId: string
  selectedCandidateId: string | null
  compareList: string[]

  addCandidate: (data: CandidateInput) => void
  updateCandidate: (id: string, data: Partial<Candidate>) => void
  deleteCandidate: (id: string) => void
  setStatus: (id: string, status: CandidateStatus) => void
  setPriority: (id: string, priority: CandidatePriority) => void
  setSelectedCandidateId: (id: string | null) => void
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  addRecording: (candidateId: string, recording: { id: string; blob: Blob; blobUrl: string; duration: number; createdAt: string }) => void
  removeRecording: (candidateId: string, recordingId: string) => void
  undoLastStatus: (id: string) => void
  setActiveRecruiter: (id: string) => void
  addQuickTag: (id: string, tag: string) => void
  removeQuickTag: (id: string, tag: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      candidates: seedCandidates,
      recordings: [],
      activeRecruiterId: "r1",
      selectedCandidateId: null,
      compareList: [],

      addCandidate: (data) => {
        const id = generateId(get().candidates)
        const now = new Date().toISOString()
        const candidate: Candidate = {
          ...data,
          id,
          aiSnapshot: generateAiSnapshot(data),
          aiSkills: generateAiSkills(data.function),
          aiScore: generateAiScore(),
          status: "New",
          priority: "Medium",
          quickTags: [],
          recordings: [],
          createdAt: now,
          updatedAt: now,
          auditLog: [{ timestamp: now, action: "created", detail: "Candidate added via intake form" }],
        }
        set((s) => ({ candidates: [...s.candidates, candidate] }))
      },

      updateCandidate: (id, data) => {
        const now = new Date().toISOString()
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: now, auditLog: [...c.auditLog, { timestamp: now, action: "updated", detail: `Updated: ${Object.keys(data).join(", ")}` }] } : c
          ),
        }))
      },

      deleteCandidate: (id) => {
        set((s) => ({ candidates: s.candidates.filter((c) => c.id !== id) }))
      },

      setStatus: (id, status) => {
        const now = new Date().toISOString()
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id
              ? { ...c, status, _previousStatus: c.status, updatedAt: now, auditLog: [...c.auditLog, { timestamp: now, action: "status_change", detail: `${c.status} -> ${status}` }] }
              : c
          ),
        }))
      },

      setPriority: (id, priority) => {
        const now = new Date().toISOString()
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id ? { ...c, priority, updatedAt: now, auditLog: [...c.auditLog, { timestamp: now, action: "priority_change", detail: `Priority -> ${priority}` }] } : c
          ),
        }))
      },

      setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),

      addToCompare: (id) => {
        const list = get().compareList
        if (list.length < 3 && !list.includes(id)) set({ compareList: [...list, id] })
      },

      removeFromCompare: (id) => set((s) => ({ compareList: s.compareList.filter((cid) => cid !== id) })),

      clearCompare: () => set({ compareList: [] }),

      addRecording: (candidateId, recording) => {
        set((s) => ({
          recordings: [...s.recordings, { candidateId, recording }],
          candidates: s.candidates.map((c) =>
            c.id === candidateId ? { ...c, recordings: [...c.recordings, recording.id] } : c
          ),
        }))
      },

      removeRecording: (candidateId, recordingId) => {
        set((s) => ({
          recordings: s.recordings.filter((r) => !(r.candidateId === candidateId && r.recording.id === recordingId)),
          candidates: s.candidates.map((c) =>
            c.id === candidateId ? { ...c, recordings: c.recordings.filter((rid) => rid !== recordingId) } : c
          ),
        }))
      },

      undoLastStatus: (id) => {
        const now = new Date().toISOString()
        set((s) => ({
          candidates: s.candidates.map((c) => {
            if (c.id !== id) return c
            const prev = (c as any)._previousStatus || "New"
            return { ...c, status: prev, updatedAt: now, auditLog: [...c.auditLog, { timestamp: now, action: "undo", detail: `Reverted to ${prev}` }] }
          }),
        }))
      },

      setActiveRecruiter: (id) => set({ activeRecruiterId: id }),

      addQuickTag: (id, tag) => {
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id && !c.quickTags.includes(tag) ? { ...c, quickTags: [...c.quickTags, tag] } : c
          ),
        }))
      },

      removeQuickTag: (id, tag) => {
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id ? { ...c, quickTags: c.quickTags.filter((t) => t !== tag) } : c
          ),
        }))
      },
    }),
    { name: "talentiq-store" }
  )
)
