"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Users, Mic, Database, HardDrive } from "lucide-react"
import { useMemo } from "react"

function exportCsv(data: any[]) {
  const headers = ["ID", "Name", "Email", "University", "Major", "Function", "Status", "Priority", "AI Score", "Notes"]
  const rows = data.map((c) => [c.id, `${c.firstName} ${c.lastName}`, c.email, c.university, c.major, c.function, c.status, c.priority, c.aiScore, `"${(c.notes || "").replace(/"/g, '""')}"`])
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "talentiq-export.csv"; a.click()
}

function exportJson(data: any[]) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "talentiq-export.json"; a.click()
}

export default function DataManagerPage() {
  const candidates = useAppStore((s) => s.candidates)
  const recordings = useAppStore((s) => s.recordings)

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    candidates.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1 })
    return counts
  }, [candidates])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Data Manager</h1>
          <p className="text-sm text-muted-foreground">Export data and manage audit logs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportCsv(candidates)} className="bg-[#005DBA] hover:bg-[#005DBA]/90 text-white"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
          <Button onClick={() => exportJson(candidates)} variant="outline"><Download className="h-4 w-4 mr-2" /> Export JSON</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Candidates</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{candidates.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Mic className="h-4 w-4" /> Recordings</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{recordings.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Statuses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(statusCounts).map(([s, n]) => (
                <div key={s} className="flex justify-between text-sm"><span>{s}</span><span className="font-medium">{n}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><HardDrive className="h-4 w-4" /> Storage</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Client-side only</div>
            <div className="text-xs text-muted-foreground mt-1">localStorage + IndexedDB</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Audit Log Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {candidates.slice(0, 10).map((c) => (
              <div key={c.id} className="border-b pb-2">
                <div className="text-sm font-medium">{c.firstName} {c.lastName} <span className="text-muted-foreground">({c.id})</span></div>
                {c.auditLog.slice(-3).map((entry, i) => (
                  <div key={i} className="text-xs text-muted-foreground ml-4">
                    {new Date(entry.timestamp).toLocaleString()} — {entry.action}: {entry.detail}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
