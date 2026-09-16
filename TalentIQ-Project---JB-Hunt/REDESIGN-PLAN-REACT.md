# TalentIQ React + shadcn/ui Redesign Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate TalentIQ from vanilla HTML/CSS/JS to a React + shadcn/ui component architecture, implementing all 7 views for the career fair candidate capture workflow.

**Architecture:** Next.js App Router with shadcn/ui components, Tailwind CSS for styling, Zustand for state management, and localStorage/IndexedDB for persistence. The app remains fully client-side with no backend server — all AI summarization is template-based and runs in the browser.

**Tech Stack:** React 18, Next.js 14 (App Router), shadcn/ui, Tailwind CSS, Zustand, TypeScript, pdf.js (client-side PDF parsing), MediaRecorder API, IndexedDB (via idb library)

**Spec:** `REDESIGN-PLAN.md` (original vanilla JS plan), `BRANDING.md` (design system), `AGENTS.md` (project orientation)

---

## Global Constraints

- No backend server — all processing is client-side (template-based AI summarization, PDF parsing, audio recording)
- J.B. Hunt branding: Yellow `#FEDB00`, Blue `#005DBA`, Digital Black `#211F20`, Icicle Blue `#E2E8F0`
- All state persisted in localStorage (`talentiq_state_v1`) + IndexedDB (`talentiq_audio_blobs`)
- **AI Constraints (CRITICAL — never violate):**
  - NO scoring, ranking, or auto-rejection of candidates
  - NO protected trait inference (race, gender, age, disability)
  - All AI summaries require recruiter approval before use in decisions
  - All AI claims must cite sources (traceability array)
  - Missing Information Flags replace fit percentages
- WCAG 2.2 Level AA compliance: visible focus indicators, 4.5:1 contrast ratio, keyboard navigable
- Mobile-responsive: Recruiter Capture view must work on phones/tablets at career fairs
- Offline fallback: audio queued locally with "Offline Sync Pending" badge when network unavailable
- Capstone demo quality: polished UI, smooth animations, professional appearance

---

## File Structure

```
TalentIQ-React/
├── app/
│   ├── layout.tsx              ← Root layout with sidebar + topbar
│   ├── page.tsx                ← Redirect to /overview
│   ├── overview/page.tsx       ← Analytics dashboard
│   ├── intake/page.tsx         ← Candidate intake form (mobile-first)
│   ├── capture/page.tsx        ← Recruiter capture card deck
│   ├── ai-review/page.tsx      ← AI review dashboard (two-panel)
│   ├── candidate-review/page.tsx ← Detailed single-candidate view
│   ├── qr-poster/page.tsx      ← Print-friendly QR code poster
│   └── metrics/page.tsx        ← Research metrics dashboard
├── components/
│   ├── ui/                     ← shadcn/ui generated components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── tabs.tsx
│   │   ├── separator.tsx
│   │   ├── avatar.tsx
│   │   ├── progress.tsx
│   │   ├── checkbox.tsx
│   │   ├── textarea.tsx
│   │   ├── radio-group.tsx
│   │   └── sheet.tsx           ← Mobile sidebar
│   ├── layout/
│   │   ├── sidebar.tsx         ← Dark sidebar with JBH branding
│   │   ├── topbar.tsx          ← Top bar with breadcrumb + recruiter selector
│   │   └── view-container.tsx  ← Main content wrapper
│   ├── candidate/
│   │   ├── candidate-card.tsx  ← Card for swiping in Capture view
│   │   ├── candidate-detail.tsx ← Full detail panel for AI Review
│   │   ├── candidate-list-item.tsx ← Compact list item for AI Review
│   │   ├── status-chip.tsx     ← Colored status badge
│   │   └── missing-flags.tsx   ← Missing data indicator chips
│   ├── capture/
│   │   ├── swipe-engine.tsx    ← Touch/swipe gesture handler
│   │   ├── action-bar.tsx      ← Status assignment buttons
│   │   ├── audio-recorder.tsx  ← Record/stop/play audio UI
│   │   └── audio-player.tsx    ← Play existing recordings
│   ├── intake/
│   │   ├── intake-form.tsx     ← Mobile-first candidate form
│   │   ├── location-chips.tsx  ← Chip input for preferred locations
│   │   └── resume-upload.tsx   ← PDF upload + client-side parsing
│   ├── review/
│   │   ├── filter-bar.tsx      ← Status/Function/Priority filters + search
│   │   ├── compare-modal.tsx   ← Side-by-side candidate comparison
│   │   └── traceability.tsx    ← Source citation display
│   ├── ai/
│   │   ├── ai-summary.tsx      ← Generated summary display + edit
│   │   └── integrity-meter.tsx ← Record completeness progress bar
│   └── shared/
│       ├── stat-card.tsx       ← Stat display card for dashboards
│       ├── bar-chart.tsx       ← CSS bar chart component
│       ├── donut-chart.tsx     ← Conic-gradient donut chart
│       ├── activity-feed.tsx   ← Audit log activity list
│       └── completion-screen.tsx ← "All Done!" screen
├── lib/
│   ├── store.ts                ← Zustand store (candidate state, UI state)
│   ├── types.ts                ← TypeScript interfaces (Candidate, AuditEntry, etc.)
│   ├── data.ts                 ← Seed data, helper functions
│   ├── ai-summarizer.ts        ← Template-based AI summary generator
│   ├── audio-db.ts             ← IndexedDB wrapper for audio blobs
│   ├── pdf-parser.ts           ← Client-side PDF text extraction
│   ├── csv-export.ts           ← CSV/JSON export utilities
│   ├── qr-generator.ts         ← Canvas-based QR code generator
│   ├── metrics.ts              ← Evaluation metrics tracking
│   └── audit.ts                ← Audit logging utilities
├── hooks/
│   ├── use-swipe.ts            ← Swipe gesture hook
│   ├── use-audio-recorder.ts   ← MediaRecorder hook
│   ├── use-keyboard.ts         ← Keyboard shortcut hook
│   └── use-local-storage.ts    ← localStorage persistence hook
├── tailwind.config.ts          ← JBH brand colors as Tailwind tokens
├── components.json             ← shadcn/ui configuration
├── package.json
├── tsconfig.json
├── next.config.js
└── postcss.config.js
```

---

## Task 1: Project Scaffolding + Tailwind + shadcn/ui Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `app/layout.tsx`, `app/page.tsx`, `lib/types.ts`
- Initialize: shadcn/ui (`components.json`)

**Goal:** Create a working Next.js project with Tailwind CSS configured with J.B. Hunt brand colors, shadcn/ui initialized, and a basic layout shell.

### Steps:

- [ ] **Step 1: Initialize Next.js project**

```bash
cd "/Users/nirmay/Desktop/jb hunt"
npx create-next-app@latest TalentIQ-React --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd TalentIQ-React
```

- [ ] **Step 2: Initialize shadcn/ui**

```bash
npx shadcn@latest init
# Select: New York style, Zinc base color, CSS variables: yes
```

- [ ] **Step 3: Add shadcn/ui components**

```bash
npx shadcn@latest add button card input select badge dialog dropdown-menu toast tabs separator avatar progress checkbox textarea radio-group sheet label
```

- [ ] **Step 4: Configure Tailwind with JBH brand colors**

Edit `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jbh: {
          yellow: "#FEDB00",
          blue: "#005DBA",
          black: "#211F20",
          icicle: "#E2E8F0",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#005DBA",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E2E8F0",
          foreground: "#211F20",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#FEDB00",
          foreground: "#211F20",
        },
        status: {
          new: "#E2E8F0",
          reviewed: "#16A34A",
          "follow-up": "#F59E0B",
          interview: "#005DBA",
          closed: "#6B7280",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      keyframes: {
        "view-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-recording": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "view-in": "view-in 0.2s ease-out",
        "pulse-recording": "pulse-recording 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

- [ ] **Step 5: Create TypeScript types**

Create `lib/types.ts`:

```typescript
export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  university: string
  degreeProgram: string
  major: string
  graduationDate: string
  gpa: string
  phone: string
  function: "Technology" | "Operations" | "Analytics"
  workLocations: string[]
  workAuthorization: string
  resumeUpload: string
  skills: string[]
  keySkills: string[]
  areasDiscussed: string[]
  notes: string
  summary: string
  traceability: string[]
  missingData: MissingDataFlag[]
  recordStatus: CandidateStatus
  approvalStatus: "Pending" | "Approved" | "Rejected"
  priority: "Normal" | "High" | "Urgent"
  approverId: string
  approvalTimestamp: string
  followUpRequestedBy: string
  followUpTimestamp: string
  lastUpdated: string
  created_at: string
  audioNotes: AudioNote[]
  auditLog: AuditEntry[]
  reviewTimeMs: number
  noteEdits: number
  summaryGenerated: boolean
  summaryCorrectionEdits: number
}

export type CandidateStatus =
  | "New"
  | "Reviewed"
  | "Follow-Up"
  | "Interview Requested"
  | "Closed"

export interface AuditEntry {
  action: string
  recruiter_id: string
  timestamp: string
  time_to_complete: number
  detail: string
}

export interface AudioNote {
  id: string
  blobKey: string
  duration: number
  createdAt: string
  offlinePending: boolean
}

export interface MissingDataFlag {
  field: string
  label: string
  severity: "critical" | "important" | "nice-to-have"
  reason: string
}

export interface Recruiter {
  id: string
  name: string
  initials: string
}

export interface AppState {
  candidates: Candidate[]
  activeRecruiterId: string
  selectedId: string | null
  metrics: any[]
}
```

- [ ] **Step 6: Create root layout**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TalentIQ — J.B. Hunt",
  description: "AI-assisted career fair candidate capture and review platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Verify** — Run `npm run dev`, page loads with shadcn/ui components styled correctly, no TypeScript errors.

---

## Task 2: Layout Shell — Sidebar + Topbar

**Files:**
- Create: `components/layout/sidebar.tsx`, `components/layout/topbar.tsx`
- Modify: `app/layout.tsx`

**Goal:** Dark sidebar with JBH branding, navigation links, recruiter selector in topbar.

### Steps:

- [ ] **Step 1: Create Sidebar component**

`components/layout/sidebar.tsx`:

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/overview", label: "Overview", icon: "dashboard" },
  { href: "/intake", label: "Intake", icon: "person_add" },
  { href: "/capture", label: "Capture", icon: "mic" },
  { href: "/ai-review", label: "AI Review", icon: "smart_toy" },
  { href: "/candidate-review", label: "Candidate Review", icon: "people" },
  { href: "/qr-poster", label: "QR Poster", icon: "qr_code" },
  { href: "/metrics", label: "Metrics", icon: "analytics" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col bg-jbh-black text-white lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-jbh-yellow font-bold text-jbh-black">
          JBH
        </div>
        <div>
          <div className="font-semibold">TalentIQ</div>
          <div className="text-xs text-white/60">J.B. Hunt</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-jbh-yellow text-jbh-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="material-icons text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Event Card */}
      <div className="border-t border-white/10 p-3">
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-xs font-medium text-jbh-yellow">Event</div>
          <div className="mt-1 text-sm">Logistics & Tech Fair</div>
          <div className="text-xs text-white/50">Sep 14, 2026 • Nashville</div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <span className="material-icons text-[18px]">notifications</span>
          Notifications
        </button>
        <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <span className="material-icons text-[18px]">settings</span>
          Settings
        </button>
        <Link
          href="/intake"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-jbh-blue px-3 py-2 text-sm font-medium text-white hover:bg-jbh-blue/90"
        >
          <span className="material-icons text-[18px]">add</span>
          New Candidate
        </Link>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create Topbar component**

`components/layout/topbar.tsx`:

```tsx
"use client"

import { usePathname } from "next/navigation"
import { useStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const viewTitles: Record<string, string> = {
  "/overview": "Overview",
  "/intake": "Candidate Intake",
  "/capture": "Recruiter Capture",
  "/ai-review": "AI Summary & Review",
  "/candidate-review": "Candidate Review",
  "/qr-poster": "QR Code Poster",
  "/metrics": "Research Metrics",
}

export function Topbar() {
  const pathname = usePathname()
  const { activeRecruiterId, setActiveRecruiter, recruiters } = useStore()

  return (
    <header className="flex h-16 items-center justify-between border-b-2 border-jbh-yellow bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-jbh-black">
          {viewTitles[pathname] || "TalentIQ"}
        </h1>
        <p className="text-xs text-muted-foreground">
          Logistics & Technology Fair 2026
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[18px]">
            search
          </span>
          <Input
            placeholder="Search candidates..."
            className="w-64 pl-9"
          />
        </div>

        <Select value={activeRecruiterId} onValueChange={setActiveRecruiter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select recruiter" />
          </SelectTrigger>
          <SelectContent>
            {recruiters.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create Zustand store**

`lib/store.ts`:

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Candidate, Recruiter, AppState } from "./types"
import { seedCandidates } from "./data"

interface StoreState extends AppState {
  recruiters: Recruiter[]
  setActiveRecruiter: (id: string) => void
  setSelectedCandidate: (id: string | null) => void
  updateCandidate: (id: string, updates: Partial<Candidate>) => void
  addCandidate: (candidate: Candidate) => void
  getCandidate: (id: string) => Candidate | undefined
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      candidates: seedCandidates,
      activeRecruiterId: "R1",
      selectedId: null,
      metrics: [],
      recruiters: [
        { id: "R1", name: "Taylor Morgan", initials: "TM" },
        { id: "R2", name: "Alex Carter", initials: "AC" },
        { id: "R3", name: "Jordan Lee", initials: "JL" },
      ],
      setActiveRecruiter: (id) => set({ activeRecruiterId: id }),
      setSelectedCandidate: (id) => set({ selectedId: id }),
      updateCandidate: (id, updates) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      addCandidate: (candidate) =>
        set((state) => ({
          candidates: [...state.candidates, candidate],
        })),
      getCandidate: (id) => get().candidates.find((c) => c.id === id),
    }),
    {
      name: "talentiq_state_v1",
    }
  )
)
```

- [ ] **Step 4: Verify** — Sidebar navigation works, topbar shows recruiter selector, JBH yellow line on topbar, dark sidebar with yellow active state.

---

## Task 3: Overview Dashboard

**Files:**
- Create: `app/overview/page.tsx`, `components/shared/stat-card.tsx`, `components/shared/bar-chart.tsx`, `components/shared/donut-chart.tsx`, `components/shared/activity-feed.tsx`

**Goal:** Analytics dashboard with computed stats, charts, and activity feed — all driven by real candidate data.

### Steps:

- [ ] **Step 1: Create StatCard component**

`components/shared/stat-card.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color?: "blue" | "green" | "amber" | "red"
}

export function StatCard({ label, value, icon, color = "blue" }: StatCardProps) {
  const colorMap = {
    blue: "border-t-jbh-blue",
    green: "border-t-status-reviewed",
    amber: "border-t-status-follow-up",
    red: "border-t-destructive",
  }

  return (
    <div className={cn(
      "rounded-lg border border-l-4 bg-white p-4 shadow-sm",
      colorMap[color]
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-jbh-black">{value}</p>
        </div>
        <span className="material-icons text-[24px] text-muted-foreground">
          {icon}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create BarChart component**

`components/shared/bar-chart.tsx`:

```tsx
interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value))

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-24 text-sm text-muted-foreground truncate">
            {item.label}
          </span>
          <div className="flex-1 h-6 rounded-full bg-jbh-icicle overflow-hidden">
            <div
              className="h-full rounded-full bg-jbh-blue transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-sm font-medium text-jbh-black">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create ActivityFeed component**

`components/shared/activity-feed.tsx`:

```tsx
import { AuditEntry } from "@/lib/types"

interface ActivityFeedProps {
  entries: (AuditEntry & { candidateName?: string })[]
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <div className="space-y-3">
      {entries.slice(0, 10).map((entry, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-jbh-blue" />
          <div>
            <p className="text-sm text-jbh-black">{entry.detail}</p>
            <p className="text-xs text-muted-foreground">
              {entry.candidateName && `${entry.candidateName} — `}
              {new Date(entry.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create Overview page**

`app/overview/page.tsx`:

```tsx
"use client"

import { useStore } from "@/lib/store"
import { StatCard } from "@/components/shared/stat-card"
import { BarChart } from "@/components/shared/bar-chart"
import { ActivityFeed } from "@/components/shared/activity-feed"

export default function OverviewPage() {
  const { candidates } = useStore()

  const totalScanned = candidates.length
  const interviewRequests = candidates.filter(
    (c) => c.recordStatus === "Interview Requested"
  ).length
  const avgReviewTime = candidates.length
    ? Math.round(
        candidates.reduce((sum, c) => sum + c.reviewTimeMs, 0) /
          candidates.length /
          1000 /
          60
      )
    : 0
  const dataComplete = candidates.length
    ? Math.round(
        candidates.filter((c) => c.missingData.length === 0).length /
          candidates.length *
          100
      )
    : 0

  // Compute candidates by major
  const majorCounts = candidates.reduce((acc, c) => {
    acc[c.major] = (acc[c.major] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const majorData = Object.entries(majorCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  // Compute function distribution
  const functionCounts = candidates.reduce((acc, c) => {
    acc[c.function] = (acc[c.function] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Activity feed from audit logs
  const allAudit = candidates.flatMap((c) =>
    c.auditLog.map((entry) => ({
      ...entry,
      candidateName: `${c.firstName} ${c.lastName}`,
    }))
  )
  const recentActivity = allAudit
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return (
    <div className="animate-view-in space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Scanned" value={totalScanned} icon="people" color="blue" />
        <StatCard label="Interview Requests" value={interviewRequests} icon="event" color="green" />
        <StatCard label="Avg Review Time" value={`${avgReviewTime}m`} icon="schedule" color="amber" />
        <StatCard label="Data Complete" value={`${dataComplete}%`} icon="check_circle" color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-jbh-black">Candidates by Major</h3>
          <BarChart data={majorData} />
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-jbh-black">Function Distribution</h3>
          <div className="flex items-center justify-center">
            <div
              className="h-40 w-40 rounded-full"
              style={{
                background: `conic-gradient(
                  #005DBA 0% ${(functionCounts["Technology"] || 0) / totalScanned * 100}%,
                  #16A34A ${(functionCounts["Technology"] || 0) / totalScanned * 100}% ${((functionCounts["Technology"] || 0) + (functionCounts["Operations"] || 0)) / totalScanned * 100}%,
                  #F59E0B ${((functionCounts["Technology"] || 0) + (functionCounts["Operations"] || 0)) / totalScanned * 100}% 100%
                )`,
              }}
            />
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-jbh-blue" /> Tech
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-status-reviewed" /> Ops
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-status-follow-up" analytics
            </span>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-jbh-black">Today's Activity</h3>
          <ActivityFeed entries={recentActivity} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify** — Stats computed from seed data, charts render correctly, activity feed shows recent actions.

---

## Task 4: Candidate Intake Form

**Files:**
- Create: `app/intake/page.tsx`, `components/intake/intake-form.tsx`, `components/intake/location-chips.tsx`, `components/intake/resume-upload.tsx`

**Goal:** Mobile-first form for students to submit profiles via QR code. Client-side PDF parsing. Target: < 30 seconds to complete.

### Steps:

- [ ] **Step 1: Create LocationChips component**

`components/intake/location-chips.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface LocationChipsProps {
  value: string[]
  onChange: (locations: string[]) => void
}

export function LocationChips({ value, onChange }: LocationChipsProps) {
  const [input, setInput] = useState("")

  const addLocation = () => {
    if (input.trim() && !value.includes(input.trim())) {
      onChange([...value, input.trim()])
      setInput("")
    }
  }

  const removeLocation = (loc: string) => {
    onChange(value.filter((l) => l !== loc))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((loc) => (
          <Badge key={loc} variant="secondary" className="gap-1">
            {loc}
            <button
              type="button"
              onClick={() => removeLocation(loc)}
              className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
          placeholder="Add location..."
        />
        <button
          type="button"
          onClick={addLocation}
          className="rounded-md bg-jbh-blue px-3 text-sm text-white hover:bg-jbh-blue/90"
        >
          +
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ResumeUpload component**

`components/intake/resume-upload.tsx`:

```tsx
"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface ResumeUploadProps {
  onTextExtracted: (text: string) => void
}

export function ResumeUpload({ onTextExtracted }: ResumeUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file")
      return
    }
    setFileName(file.name)
    setExtracting(true)

    try {
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item: any) => item.str).join(" ") + "\n"
      }

      onTextExtracted(text)
    } catch (err) {
      console.error("PDF parsing error:", err)
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileRef.current?.click()}
        className="w-full"
      >
        {extracting ? (
          "Extracting text..."
        ) : fileName ? (
          `📎 ${fileName}`
        ) : (
          "📎 Upload Resume (PDF)"
        )}
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Create IntakeForm component**

`components/intake/intake-form.tsx` — Full form with validation, university/major selects, GPA, phone, work authorization radios, location chips, resume upload, submit button. Uses `useStore().addCandidate()` on submit.

- [ ] **Step 4: Create Intake page**

`app/intake/page.tsx` — Centered mobile-first layout (`max-w-xl mx-auto`), renders IntakeForm.

- [ ] **Step 5: Verify** — Form validates required fields, PDF uploads and extracts text, submission creates candidate with audit log entry including real time_to_complete.

---

## Task 5: Recruiter Capture — Card Deck + Audio

**Files:**
- Create: `app/capture/page.tsx`, `components/capture/swipe-engine.tsx`, `components/capture/action-bar.tsx`, `components/capture/audio-recorder.tsx`, `components/capture/audio-player.tsx`, `components/candidate/candidate-card.tsx`, `hooks/use-swipe.ts`, `hooks/use-audio-recorder.ts`, `hooks/use-keyboard.ts`, `lib/audio-db.ts`

**Goal:** Fast triage card deck with swipe gestures, audio recording to IndexedDB, quick status assignment, undo support, keyboard shortcuts.

### Steps:

- [ ] **Step 1: Create IndexedDB helper**

`lib/audio-db.ts`:

```typescript
import { openDB } from "idb"

const DB_NAME = "talentiq_audio_blobs"
const STORE_NAME = "blobs"

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export const audioDB = {
  async put(key: string, blob: Blob) {
    const db = await getDB()
    await db.put(STORE_NAME, blob, key)
  },
  async get(key: string): Promise<Blob | undefined> {
    const db = await getDB()
    return db.get(STORE_NAME, key)
  },
  async delete(key: string) {
    const db = await getDB()
    await db.delete(STORE_NAME, key)
  },
}
```

- [ ] **Step 2: Create useSwipe hook**

`hooks/use-swipe.ts` — Pointer events, dominant axis locking, drag distance tracking, threshold-based completion. Returns `{ bind, dragOffset, isDragging, swipeDirection }`.

- [ ] **Step 3: Create useAudioRecorder hook**

`hooks/use-audio-recorder.ts` — Wraps MediaRecorder API. Returns `{ state, start, stop, cancel, error }`. On stop: saves blob to IndexedDB, returns `{ blobKey, duration }`.

- [ ] **Step 4: Create CandidateCard component**

`components/candidate/candidate-card.tsx` — Renders candidate info: name, university, major, grad date, skills tags, GPA, work auth, location, missing flags. Shows notes textarea and audio section.

- [ ] **Step 5: Create ActionBar component**

`components/capture/action-bar.tsx` — Three status buttons: Reviewed (green), Interview Requested (blue), Follow-Up (amber). Each triggers status update with undo toast.

- [ ] **Step 6: Create AudioRecorder and AudioPlayer components**

Record button with pulse animation, timer display, existing recordings list with play/delete.

- [ ] **Step 7: Create Capture page**

`app/capture/page.tsx` — Card deck with swipe engine, keyboard shortcuts (ArrowLeft = Reviewed, ArrowRight = Interview, Space = Next, ArrowUp = Previous, Escape = Undo), card counter, completion screen.

- [ ] **Step 8: Verify** — Swipe works, record audio (verify in IndexedDB after refresh), assign statuses, undo works, keyboard shortcuts work.

---

## Task 6: AI Review Dashboard

**Files:**
- Create: `app/ai-review/page.tsx`, `components/review/filter-bar.tsx`, `components/candidate/candidate-list-item.tsx`, `components/candidate/candidate-detail.tsx`, `components/review/compare-modal.tsx`, `components/review/traceability.tsx`, `components/ai/ai-summary.tsx`, `components/ai/integrity-meter.tsx`, `lib/ai-summarizer.ts`

**Goal:** End-of-day triage view. Template-based AI summarizer with source citations. Filterable list + detail panel. Comparison and export.

### Steps:

- [ ] **Step 1: Create AI Summarizer**

`lib/ai-summarizer.ts`:

```typescript
import { Candidate, MissingDataFlag } from "./types"

export function generateSummary(candidate: Candidate) {
  const parts: string[] = []
  const traceability: string[] = []

  // Education
  parts.push(
    `${candidate.firstName} ${candidate.lastName} is a ${candidate.major} ${candidate.degreeProgram} student at ${candidate.university}`
  )
  traceability.push(
    `${candidate.university} — from Candidate Intake Form`
  )

  // GPA
  if (candidate.gpa) {
    parts[parts.length - 1] += ` with a ${candidate.gpa} GPA`
    traceability.push(`GPA ${candidate.gpa} — from Candidate Intake Form`)
  }

  // Skills
  if (candidate.keySkills.length > 0) {
    parts.push(`Skills include ${candidate.keySkills.join(", ")}`)
    traceability.push(`Key skills — from Resume`)
  }

  // Notes
  if (candidate.notes) {
    const firstTwoSentences = candidate.notes.split(".").slice(0, 2).join(".") + "."
    parts.push(firstTwoSentences)
    traceability.push("Recruiter notes — from Recruiter Capture")
  }

  // Work authorization
  if (candidate.workAuthorization) {
    parts.push(`Work authorization: ${candidate.workAuthorization}`)
    traceability.push(`Work authorization — from Candidate Intake Form`)
  }

  // Locations
  if (candidate.workLocations.length > 0) {
    parts.push(`Preferred locations: ${candidate.workLocations.join(", ")}`)
    traceability.push("Preferred locations — from Candidate Intake Form")
  }

  // Missing data
  const missingData: MissingDataFlag[] = []
  const checks = [
    { field: "workAuthorization", label: "Work Authorization", severity: "critical" as const },
    { field: "graduationDate", label: "Graduation Date", severity: "critical" as const },
    { field: "gpa", label: "GPA", severity: "important" as const },
    { field: "resumeUpload", label: "Resume", severity: "important" as const },
    { field: "phone", label: "Phone", severity: "nice-to-have" as const },
    { field: "workLocations", label: "Preferred Locations", severity: "nice-to-have" as const },
  ]

  for (const check of checks) {
    const val = candidate[check.field as keyof Candidate]
    if (!val || (Array.isArray(val) && val.length === 0)) {
      missingData.push({
        field: check.field,
        label: check.label,
        severity: check.severity,
        reason: `Required for ${check.label.toLowerCase()} verification`,
      })
    }
  }

  return {
    summary: parts.join(". ") + ".",
    traceability,
    missingData,
  }
}
```

- [ ] **Step 2: Create FilterBar component** — Status, Function, Priority dropdowns + search input + Export CSV/JSON buttons.

- [ ] **Step 3: Create CandidateListItem component** — Compact card with checkbox, name, university, status chip, flag count.

- [ ] **Step 4: Create CandidateDetail component** — Full detail panel: header, AI summary, missing flags, traceability citations, audio playback, notes textarea, integrity meter, action buttons.

- [ ] **Step 5: Create CompareModal** — Side-by-side comparison table for 2-3 selected candidates.

- [ ] **Step 6: Create AI Review page** — Two-panel layout with filter bar, candidate list, detail panel, compare bar/modal, CSV/JSON export.

- [ ] **Step 7: Verify** — Generate summary shows traceability, filter works, approve/follow-up works, compare 2-3 candidates, export CSV/JSON.

---

## Task 7: Candidate Review + QR Poster + Metrics

**Files:**
- Create: `app/candidate-review/page.tsx`, `app/qr-poster/page.tsx`, `app/metrics/page.tsx`, `lib/qr-generator.ts`, `lib/metrics.ts`

**Goal:** Complete the remaining 3 views: detailed candidate review, print-friendly QR poster, and research metrics dashboard.

### Steps:

- [ ] **Step 1: Create Candidate Review page** — Same two-panel layout as AI Review but with full profile detail. Reuses CandidateDetail component.

- [ ] **Step 2: Create QR code generator**

`lib/qr-generator.ts` — Pure canvas-based QR encoder (no external library). `generateQR(text: string): HTMLCanvasElement`.

- [ ] **Step 3: Create QR Poster page** — Print-friendly layout with large QR code, JBH branding, "Scan to submit your profile" instruction. Print button with `window.print()`. `@media print` CSS hides navigation.

- [ ] **Step 4: Create metrics tracking helpers**

`lib/metrics.ts` — `logMetric()`, `getMetrics()`, `computeAggregateMetrics()` for evaluation study data.

- [ ] **Step 5: Create Research Metrics page** — 4 aggregate stat cards, Baseline vs Treatment comparison table, per-candidate metrics table, export buttons.

- [ ] **Step 6: Verify** — All 7 views render, navigation works, QR poster prints cleanly, metrics dashboard shows computed data.

---

## Task 8: Polish + Responsive + Accessibility

**Files:** All files as needed

**Goal:** Final pass — cross-view consistency, responsive at all breakpoints, WCAG 2.2 AA, zero console errors, smooth animations.

### Steps:

- [ ] **Step 1: Responsive pass** — Test at 375px, 768px, 1024px, 1440px. Sidebar collapses to sheet on mobile. Two-panel layouts stack on tablet. Touch targets >= 44px.

- [ ] **Step 2: Keyboard accessibility** — Tab order correct, focus-visible on all interactive elements, Escape closes modals, ARIA labels on all buttons.

- [ ] **Step 3: Animations** — View entrance animations, card swipe spring-back, recording pulse, status change transitions. Respect `prefers-reduced-motion`.

- [ ] **Step 4: Cross-view data consistency** — Status changes in Capture reflect in AI Review. New submissions appear everywhere. Audio visible across views.

- [ ] **Step 5: Console error audit** — All views visited, all actions triggered, zero errors.

- [ ] **Step 6: Final build test** — `npm run build` succeeds, `npm start` serves correctly.

---

## Implementation Notes

### Migration Strategy
1. Build the React app in a new `TalentIQ-React/` directory alongside the original
2. Port seed data from `data.js` to `lib/data.ts`
3. Port AI summarizer logic to `lib/ai-summarizer.ts`
4. Port IndexedDB helpers to `lib/audio-db.ts` (using `idb` library)
5. Port CSV export to `lib/csv-export.ts`
6. Port QR generator to `lib/qr-generator.ts`

### Key Differences from Vanilla JS Version
- **State management:** Zustand replaces manual `TIQ.state` mutations
- **Components:** shadcn/ui replaces hand-built components
- **Styling:** Tailwind replaces hand-written CSS
- **Routing:** Next.js App Router replaces string-switch router
- **Type safety:** TypeScript types replace JSDoc comments
- **Build step:** Next.js dev server replaces `python -m http.server`

### Dependencies to Install
```bash
npm install zustand idb pdfjs-dist
```
