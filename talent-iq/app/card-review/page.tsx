"use client"

import { useAppStore } from "@/lib/store"
import { STATUS_COLORS, STATUSES } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

function getMissingFlags(c: any): string[] {
  const flags: string[] = []
  if (!c.phone) flags.push("Phone")
  if (!c.gpa) flags.push("GPA")
  if (!c.resumeFileName) flags.push("Resume")
  if (!c.workAuthorization) flags.push("Work Auth")
  return flags
}

export default function CardReviewPage() {
  const candidates = useAppStore((s) => s.candidates)
  const setStatus = useAppStore((s) => s.setStatus)
  const updateCandidate = useAppStore((s) => s.updateCandidate)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = candidates.find((c) => c.id === selectedId)

  return (
    <div className="flex h-full">
      <div className="w-[360px] border-r overflow-y-auto bg-white">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold">Card Review</h1>
          <p className="text-sm text-muted-foreground">End-of-day triage & verification</p>
        </div>
        {candidates.map((c) => (
          <div
            key={c.id}
            className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${selectedId === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
            onClick={() => setSelectedId(c.id)}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {c.firstName[0]}{c.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{c.firstName} {c.lastName}</div>
                <div className="text-xs text-muted-foreground">{c.university}</div>
              </div>
              <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {selected.firstName[0]}{selected.lastName[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selected.firstName} {selected.lastName}</h2>
                <div className="text-sm text-muted-foreground">{selected.id} · {selected.university} · {selected.major}</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">AI Snapshot</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm">{selected.aiSnapshot}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Missing Flags</h3>
              <div className="flex flex-wrap gap-1.5">
                {getMissingFlags(selected).map((f) => <Badge key={f} variant="destructive">{f}</Badge>)}
                {getMissingFlags(selected).length === 0 && <span className="text-sm text-muted-foreground">Complete</span>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Record Integrity</h3>
              <Progress value={Math.round(((5 - getMissingFlags(selected).length) / 5) * 100)} className="h-2" />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Verification Notes</h3>
              <Textarea defaultValue={selected.notes} onBlur={(e) => updateCandidate(selected.id, { notes: e.target.value })} />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Status</h3>
              <div className="flex gap-2">
                {STATUSES.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={selected.status === s ? "default" : "outline"}
                    onClick={() => setStatus(selected.id, s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">Select a candidate</div>
        )}
      </div>
    </div>
  )
}
