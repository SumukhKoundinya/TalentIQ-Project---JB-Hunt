"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Mic, UserPlus, Brain, CreditCard, Database, LayoutDashboard, QrCode, BarChart3 } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

const primaryNav = [
  { href: "/capture", label: "Capture", icon: Mic, shortcut: "R" },
  { href: "/intake", label: "Intake", icon: UserPlus, shortcut: "I" },
  { href: "/ai-review", label: "AI Review", icon: Brain, shortcut: "A" },
  { href: "/card-review", label: "Card Review", icon: CreditCard, shortcut: "C" },
  { href: "/data-manager", label: "Data Manager", icon: Database, shortcut: "D" },
]

const secondaryNav = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/qr-poster", label: "QR Poster", icon: QrCode },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
]

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-[#211F20] text-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEDB00] text-[#211F20] font-bold text-sm">
          TIQ
        </div>
        <div>
          <div className="font-semibold text-sm leading-tight">TalentIQ</div>
          <div className="text-[11px] text-white/50">JBH Career Fair</div>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Workflow
        </div>
        <nav className="space-y-0.5">
          {primaryNav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[#FEDB00]/10 text-[#FEDB00] font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-white/40">
                  {item.shortcut}
                </kbd>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mx-5 my-2 h-px bg-white/10" />

      <div className="px-3 py-2">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Supporting
        </div>
        <nav className="space-y-0.5">
          {secondaryNav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[#FEDB00]/10 text-[#FEDB00] font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto px-5 py-4">
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-xs font-medium text-white/80">JBH Talent Hub 2026</div>
          <div className="mt-1 text-[11px] text-white/40">March 15, 2026</div>
          <div className="text-[11px] text-white/40">University of Arkansas</div>
        </div>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex w-64 shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b bg-white px-4 lg:px-6">
          <div className="h-[3px] absolute top-0 left-0 right-0 bg-[#FEDB00]" />
          <div className="lg:hidden mr-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent onNavClick={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1" />
          <div className="text-xs text-muted-foreground">Recruiter Portal</div>
        </header>

        <main className="flex-1 overflow-auto bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  )
}
