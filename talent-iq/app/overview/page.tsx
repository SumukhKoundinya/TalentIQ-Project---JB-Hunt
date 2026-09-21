"use client"

import { useAppStore } from "@/lib/store"
import { OVERVIEW_STATS } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, Clock, BarChart } from "lucide-react"
import { useMemo } from "react"

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
  clock: <Clock className="h-5 w-5" />,
  chart: <BarChart className="h-5 w-5" />,
}

export default function OverviewPage() {
  const candidates = useAppStore((s) => s.candidates)

  const stats = useMemo(() => {
    const total = candidates.length
    const interviews = candidates.filter((c) => c.status === "Interview Requested").length
    const avgScore = total > 0 ? Math.round(candidates.reduce((sum, c) => sum + c.aiScore, 0) / total) : 0
    const completeness = total > 0 ? Math.round(candidates.filter((c) => c.phone && c.gpa && c.resumeFileName).length / total * 100) : 0
    return [
      { label: "Total Scanned", value: String(total), icon: "users", color: "text-primary" },
      { label: "Interview Requests", value: String(interviews), icon: "calendar", color: "text-emerald-600" },
      { label: "Avg AI Score", value: String(avgScore), icon: "clock", color: "text-amber-600" },
      { label: "Data Completeness", value: `${completeness}%`, icon: "chart", color: "text-primary" },
    ]
  }, [candidates])

  const statusMix = useMemo(() => {
    const counts: Record<string, number> = {}
    candidates.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1 })
    return counts
  }, [candidates])

  const recentActivity = useMemo(() => {
    return [...candidates]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }, [candidates])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-bold">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className={s.color}>{iconMap[s.icon]}</span>
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Status Mix</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusMix).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1"><span>{status}</span><span>{count}</span></div>
                <Progress value={candidates.length > 0 ? (count / candidates.length) * 100 : 0} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((c) => (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                    <span className="text-muted-foreground ml-1">— {c.auditLog[c.auditLog.length - 1]?.action || "created"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleTimeString()}</span>
                </div>
              ))}
              {recentActivity.length === 0 && <div className="text-sm text-muted-foreground">No activity yet</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
