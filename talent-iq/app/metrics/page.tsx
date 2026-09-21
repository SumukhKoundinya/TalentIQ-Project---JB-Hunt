"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, CheckCircle, Shield, Star } from "lucide-react"
import { useMemo } from "react"

export default function MetricsPage() {
  const candidates = useAppStore((s) => s.candidates)

  const metrics = useMemo(() => {
    const total = candidates.length
    const reviewed = candidates.filter((c) => c.status !== "New").length
    const avgScore = total > 0 ? Math.round(candidates.reduce((s, c) => s + c.aiScore, 0) / total) : 0
    const completeness = total > 0 ? Math.round(candidates.filter((c) => c.phone && c.gpa && c.resumeFileName).length / total * 100) : 0
    return { total, reviewed, avgScore, completeness }
  }, [candidates])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-bold">Research Metrics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Candidates Seen</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{metrics.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Reviewed</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{metrics.reviewed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" /> Integrity</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{metrics.completeness}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Avg AI Score</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{metrics.avgScore}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Workflow Health</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Review Progress</span><span>{metrics.total > 0 ? Math.round((metrics.reviewed / metrics.total) * 100) : 0}%</span></div>
            <Progress value={metrics.total > 0 ? (metrics.reviewed / metrics.total) * 100 : 0} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Data Completeness</span><span>{metrics.completeness}%</span></div>
            <Progress value={metrics.completeness} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Observations</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {metrics.total === 0
              ? "No candidates to analyze yet. Start capturing candidates to see metrics."
              : `${metrics.total} candidates processed. ${metrics.reviewed} reviewed. Average AI score: ${metrics.avgScore}.`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
