"use client"

import { useAppStore } from "@/lib/store"
import { UNIVERSITIES, MAJORS, FUNCTIONS } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function IntakePage() {
  const addCandidate = useAppStore((s) => s.addCandidate)
  const router = useRouter()

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    university: "",
    major: "",
    function: "",
    graduationDate: "",
    gpa: "",
    workAuthorization: "",
    notes: "",
  })
  const [error, setError] = useState("")

  const availableMajors = form.function ? (MAJORS[form.function] || []) : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.university || !form.major || !form.function || !form.graduationDate) {
      setError("Please fill in all required fields.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.")
      return
    }
    addCandidate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      university: form.university,
      major: form.major,
      function: form.function as any,
      graduationDate: form.graduationDate,
      gpa: form.gpa || undefined,
      workAuthorization: form.workAuthorization || undefined,
      resumeFileName: undefined,
      notes: form.notes,
      quickTags: [],
      recordings: [],
    })
    router.push("/capture")
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Intake</CardTitle>
          <p className="text-sm text-muted-foreground">Fill in candidate information from QR scan or manual entry.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name *</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div>
              <Label>University *</Label>
              <Select value={form.university} onValueChange={(v) => setForm({ ...form, university: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
                <SelectContent>
                  {UNIVERSITIES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Function *</Label>
              <Select value={form.function} onValueChange={(v) => setForm({ ...form, function: v ?? "", major: "" })}>
                <SelectTrigger><SelectValue placeholder="Select function" /></SelectTrigger>
                <SelectContent>
                  {FUNCTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Major *</Label>
              <Select value={form.major} onValueChange={(v) => setForm({ ...form, major: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder={form.function ? "Select major" : "Select a function first"} /></SelectTrigger>
                <SelectContent>
                  {availableMajors.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Graduation Date *</Label>
              <Input type="month" value={form.graduationDate} onChange={(e) => setForm({ ...form, graduationDate: e.target.value })} />
            </div>

            <div>
              <Label>GPA</Label>
              <Input value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} placeholder="e.g. 3.5" />
            </div>

            <div>
              <Label>Work Authorization</Label>
              <RadioGroup value={form.workAuthorization} onValueChange={(v) => setForm({ ...form, workAuthorization: v })} className="flex gap-4 mt-1">
                <div className="flex items-center gap-1.5"><RadioGroupItem value="US Citizen" id="citizen" /><Label htmlFor="citizen" className="font-normal">US Citizen</Label></div>
                <div className="flex items-center gap-1.5"><RadioGroupItem value="Permanent Resident" id="pr" /><Label htmlFor="pr" className="font-normal">Permanent Resident</Label></div>
                <div className="flex items-center gap-1.5"><RadioGroupItem value="Work Visa" id="visa" /><Label htmlFor="visa" className="font-normal">Work Visa</Label></div>
              </RadioGroup>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
            </div>

            <Button type="submit" className="w-full bg-[#005DBA] hover:bg-[#005DBA]/90 text-white">Submit Candidate</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
