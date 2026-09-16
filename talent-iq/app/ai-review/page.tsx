"use client"

import { useAppStore } from "@/lib/store"
import { STATUS_COLORS } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Download } from "lucide-react"
import { useState, useMemo } from "react"

function getMissingFlags(c: any): string[] {
  const flags: string[] = []
  if (!c.phone) flags.push("Phone")
  if (!c.gpa) flags.push("GPA")
  if (!c.workAuthorization) flags.push("Work Auth")
  if (!c.resumeFileName) flags.push("Resume")
  if (!c.graduationDate) flags.push("Grad Date")
  return flags
}

function initialsFor(c: any) { return `${c.firstName?.[0] || ""}${c.lastName?.[0] || ""}` }

function exportCsv(data: any[]) {
  if (!data.length) return
  const headers = ["ID", "Name", "Email", "University", "Major", "Function", "Status", "Priority", "AI Score", "GPA"]
  const rows = data.map((c) => [c.id, `${c.firstName} ${c.lastName}`, c.email, c.university, c.major, c.function, c.status, c.priority, c.aiScore, c.gpa || ""])
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "candidates.csv"; a.click()
}

function exportJson(data: any[]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "candidates.json"; a.click()
}

export default function AIReviewPage() {
  const candidates = useAppStore((s) => s.candidates)
  const setStatus = useAppStore((s) => s.setStatus)
  const updateCandidate = useAppStore((s) => s.updateCandidate)
  const selectedCandidateId = useAppStore((s) => s.selectedCandidateId)
  const setSelectedCandidateId = useAppStore((s) => s.setSelectedCandidateId)
  const compareList = useAppStore((s) => s.compareList)
  const addToCompare = useAppStore((s) => s.addToCompare)
  const removeFromCompare = useAppStore((s) => s.removeFromCompare)
  const clearCompare = useAppStore((s) => s.clearCompare)
  const recordings = useAppStore((s) => s.recordings)

  const [statusFilter, setStatusFilter] = useState("all")
  const [functionFilter, setFunctionFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [compareOpen, setCompareOpen] = useState(false)

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (functionFilter !== "all" && c.function !== functionFilter) return false
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false
      if (search && !`${c.firstName} ${c.lastName} ${c.email} ${c.university}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [candidates, statusFilter, functionFilter, priorityFilter, search])

  const selected = candidates.find((c) => c.id === selectedCandidateId)
  const compareCandidates = candidates.filter((c) => compareList.includes(c.id))

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">AI Review</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => exportCsv(filtered)}><Download className="h-3 w-3 mr-1" /> CSV</Button>
            <Button size="sm" variant="outline" onClick={() => exportJson(filtered)}><Download className="h-3 w-3 mr-1" /> JSON</Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {["New", "Reviewed", "Follow-Up", "Interview Requested", "Closed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={functionFilter} onValueChange={(v) => setFunctionFilter(v ?? "all")}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Functions</SelectItem>
              {["Supply Chain", "Transportation", "Engineering", "Data Science", "Finance", "Marketing", "Human Resources", "Operations", "Sales", "Information Technology"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[360px] border-r overflow-y-auto bg-white">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${selectedCandidateId === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              onClick={() => setSelectedCandidateId(c.id)}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={compareList.includes(c.id)}
                  onCheckedChange={() => compareList.includes(c.id) ? removeFromCompare(c.id) : addToCompare(c.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{initialsFor(c)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.firstName} {c.lastName}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.university}</div>
                </div>
                <div className="text-right">
                  <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
                  <div className="text-xs text-muted-foreground mt-0.5">Score: {c.aiScore}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selected ? (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{initialsFor(selected)}</div>
                <div>
                  <h2 className="text-xl font-bold">{selected.firstName} {selected.lastName}</h2>
                  <div className="text-sm text-muted-foreground">{selected.id} · {selected.university} · {selected.major}</div>
                  <Badge className={STATUS_COLORS[selected.status]}>{selected.status}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => setStatus(selected.id, "Reviewed")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(selected.id, "Follow-Up")}>Follow Up</Button>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-sm">AI-Generated Snapshot</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{selected.aiSnapshot}</p></CardContent>
              </Card>

              <div>
                <h3 className="text-sm font-semibold mb-2">AI Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selected.aiSkills.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Missing Information</h3>
                <div className="flex flex-wrap gap-1.5">
                  {getMissingFlags(selected).map((f) => <Badge key={f} variant="destructive">{f}</Badge>)}
                  {getMissingFlags(selected).length === 0 && <span className="text-sm text-muted-foreground">All fields complete</span>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Record Integrity</h3>
                <Progress value={Math.round(((5 - getMissingFlags(selected).length) / 5) * 100)} className="h-2" />
              </div>

              {recordings.filter((r) => r.candidateId === selected.id).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Voice Recordings</h3>
                  {recordings.filter((r) => r.candidateId === selected.id).map((r) => (
                    <audio key={r.recording.id} controls src={r.recording.blobUrl} className="h-8 mb-1" />
                  ))}
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold mb-2">Recruiter Notes</h3>
                <Textarea defaultValue={selected.notes} onBlur={(e) => updateCandidate(selected.id, { notes: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">Select a candidate to view details</div>
          )}
        </div>
      </div>

      {compareList.length >= 2 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#211F20] text-white rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg z-50">
          <span className="text-sm">{compareList.length} selected</span>
          <Button size="sm" onClick={() => setCompareOpen(true)} className="bg-[#FEDB00] text-[#211F20] hover:bg-[#FEDB00]/90">Compare</Button>
          <Button size="sm" variant="ghost" onClick={clearCompare}>Clear</Button>
        </div>
      )}

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Compare Candidates</DialogTitle></DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Field</th>
                  {compareCandidates.map((c) => <th key={c.id} className="text-left py-2 px-4">{c.firstName} {c.lastName}</th>)}
                </tr>
              </thead>
              <tbody>
                {(["status", "priority", "function", "university", "major", "gpa", "aiScore"] as const).map((field) => (
                  <tr key={field} className="border-b">
                    <td className="py-2 pr-4 font-medium capitalize">{field}</td>
                    {compareCandidates.map((c) => <td key={c.id} className="py-2 px-4">{(c as any)[field] ?? "—"}</td>)}
                  </tr>
                ))}
                <tr className="border-b">
                  <td className="py-2 pr-4 font-medium">Snapshot</td>
                  {compareCandidates.map((c) => <td key={c.id} className="py-2 px-4 text-xs">{c.aiSnapshot?.slice(0, 150)}...</td>)}
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Skills</td>
                  {compareCandidates.map((c) => <td key={c.id} className="py-2 px-4">{c.aiSkills?.join(", ")}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
