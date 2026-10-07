"use client"

import { useAppStore } from "@/lib/store"
import { STATUS_COLORS, QUICK_TAGS } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, SkipForward, ArrowLeft, ArrowRight, Undo2, Mic, Square, Play, Trash2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

function AudioRecorderInline({ candidateId }: { candidateId: string }) {
  const addRecording = useAppStore((s) => s.addRecording)
  const [recording, setRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    chunksRef.current = []
    mr.ondataavailable = (e) => chunksRef.current.push(e.data)
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      addRecording(candidateId, {
        id: `rec-${Date.now()}`,
        blob,
        blobUrl: URL.createObjectURL(blob),
        duration: timer,
        createdAt: new Date().toISOString(),
      })
      stream.getTracks().forEach((t) => t.stop())
    }
    mr.start()
    recorderRef.current = mr
    setRecording(true)
    setTimer(0)
    intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
  }

  const stop = () => {
    recorderRef.current?.stop()
    setRecording(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <Button size="sm" variant="outline" onClick={start} className="gap-1">
          <Mic className="h-3 w-3" /> Record
        </Button>
      ) : (
        <Button size="sm" variant="destructive" onClick={stop} className="gap-1">
          <Square className="h-3 w-3" /> Stop ({timer}s)
        </Button>
      )}
    </div>
  )
}

export default function CapturePage() {
  const candidates = useAppStore((s) => s.candidates)
  const setStatus = useAppStore((s) => s.setStatus)
  const updateCandidate = useAppStore((s) => s.updateCandidate)
  const addQuickTag = useAppStore((s) => s.addQuickTag)
  const removeQuickTag = useAppStore((s) => s.removeQuickTag)
  const undoLastStatus = useAppStore((s) => s.undoLastStatus)
  const recordings = useAppStore((s) => s.recordings)
  const removeRecording = useAppStore((s) => s.removeRecording)

  const [index, setIndex] = useState(0)
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [exitX, setExitX] = useState<number | null>(null)
  const [undoId, setUndoId] = useState<string | null>(null)
  const startX = useRef(0)

  const pending = candidates.filter((c) => c.status === "New")
  const current = pending[index] || null
  const total = candidates.length
  const done = total - pending.length
  const progress = total > 0 ? (done / total) * 100 : 0

  const swipe = useCallback(
    (dir: "left" | "right") => {
      if (!current) return
      const newStatus = dir === "left" ? "Reviewed" : "Follow-Up"
      setExitX(dir === "left" ? -1200 : 1200)
      setTimeout(() => {
        setStatus(current.id, newStatus as any)
        setUndoId(current.id)
        setExitX(null)
        setSwipeX(0)
        setTimeout(() => setUndoId(null), 5000)
      }, 350)
    },
    [current, setStatus]
  )

  const skip = useCallback(() => {
    if (!current) return
    setExitX(0)
    setTimeout(() => {
      setIndex((i) => i + 1)
      setExitX(null)
    }, 100)
  }, [current])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!current) return
    startX.current = e.clientX
    setSwiping(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!swiping) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 10) setSwipeX(dx)
  }

  const handlePointerUp = () => {
    if (!swiping) return
    setSwiping(false)
    if (Math.abs(swipeX) > 100) {
      swipe(swipeX > 0 ? "right" : "left")
    } else {
      setSwipeX(0)
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") swipe("left")
      else if (e.key === "ArrowRight") swipe("right")
      else if (e.key === " " && current) { e.preventDefault(); skip() }
      else if (e.key === "Escape" && undoId) { undoLastStatus(undoId); setUndoId(null) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [swipe, skip, undoId, undoLastStatus, current])

  const candidateRecordings = current
    ? recordings.filter((r) => r.candidateId === current.id)
    : []

  if (!current && pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">All Caught Up!</h2>
          <p className="text-muted-foreground mt-2">You&apos;ve reviewed all candidates.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(["New", "Reviewed", "Follow-Up", "Interview Requested", "Closed"] as const).map((s) => (
            <div key={s} className="rounded-lg border bg-white p-3 text-center">
              <div className="text-2xl font-bold">{candidates.filter((c) => c.status === s).length}</div>
              <div className="text-xs text-muted-foreground">{s}</div>
            </div>
          ))}
        </div>
        <Button onClick={() => setIndex(0)} variant="outline">Review Again</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">Capture</h1>
          <span className="text-sm text-muted-foreground">{done}/{total} reviewed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {current && (
          <div className="relative w-full max-w-sm">
            <div
              className="bg-white rounded-xl border shadow-lg p-6 cursor-grab active:cursor-grabbing select-none touch-none"
              style={{
                transform: `translateX(${exitX ?? swipeX}px) rotate(${swipeX * 0.05}deg)`,
                transition: exitX !== null ? "transform 0.35s ease" : swiping ? "none" : "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {Math.abs(swipeX) > 30 && (
                <div
                  className={`absolute top-4 px-3 py-1 rounded-full text-sm font-bold uppercase ${
                    swipeX > 0 ? "right-4 bg-amber-500 text-white" : "left-4 bg-emerald-500 text-white"
                  }`}
                  style={{ opacity: Math.min(Math.abs(swipeX) / 100, 1) }}
                >
                  {swipeX > 0 ? "Contact" : "Reviewed"}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {current.firstName[0]}{current.lastName[0]}
                </div>
                <div>
                  <div className="font-semibold">{current.firstName} {current.lastName}</div>
                  <div className="text-sm text-muted-foreground">{current.email}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div><span className="text-muted-foreground">University:</span> {current.university}</div>
                <div><span className="text-muted-foreground">Major:</span> {current.major}</div>
                <div><span className="text-muted-foreground">Function:</span> {current.function}</div>
                {current.gpa && <div><span className="text-muted-foreground">GPA:</span> {current.gpa}</div>}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {QUICK_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={current.quickTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      current.quickTags.includes(tag) ? removeQuickTag(current.id, tag) : addQuickTag(current.id, tag)
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Textarea
                placeholder="Add notes..."
                defaultValue={current.notes}
                onBlur={(e) => updateCandidate(current.id, { notes: e.target.value })}
                className="mb-4 text-sm"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex items-center gap-2 mb-4">
                <AudioRecorderInline candidateId={current.id} />
                {candidateRecordings.length > 0 && (
                  <span className="text-xs text-muted-foreground">{candidateRecordings.length} recording(s)</span>
                )}
              </div>

              {candidateRecordings.length > 0 && (
                <div className="space-y-1 mb-4">
                  {candidateRecordings.map((r) => (
                    <div key={r.recording.id} className="flex items-center gap-2 text-xs">
                      <audio controls src={r.recording.blobUrl} className="h-6 flex-1" />
                      <span>{r.recording.duration}s</span>
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => removeRecording(current.id, r.recording.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Badge className={STATUS_COLORS[current.status]}>{current.status}</Badge>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button size="lg" variant="outline" onClick={skip} className="rounded-full h-14 w-14 p-0">
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => swipe("left")} className="rounded-full h-14 w-14 p-0 border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => swipe("right")} className="rounded-full h-14 w-14 p-0 border-amber-500 text-amber-600 hover:bg-amber-50">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {undoId && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#211F20] text-white rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg z-50">
          <span className="text-sm">Status updated</span>
          <Button
            size="sm"
            variant="ghost"
            className="text-[#FEDB00] hover:text-[#FEDB00]/80 h-7"
            onClick={() => { undoLastStatus(undoId); setUndoId(null) }}
          >
            <Undo2 className="h-3 w-3 mr-1" /> Undo
          </Button>
        </div>
      )}
    </div>
  )
}
