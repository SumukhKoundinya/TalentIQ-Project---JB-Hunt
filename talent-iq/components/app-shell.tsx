"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Mic,
  UserPlus,
  Brain,
  CreditCard,
  Database,
  LayoutDashboard,
  QrCode,
  BarChart3,
  Menu,
} from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  Highlight,
  HighlightItem,
} from "@/components/animate-ui/primitives/effects/highlight"

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

function NavSection({
  label,
  items,
  pathname,
  onNavClick,
  showShortcut,
}: {
  label: string
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; shortcut?: string }[]
  pathname: string
  onNavClick?: () => void
  showShortcut?: boolean
}) {
  return (
    <div className="px-3 py-2">
      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </div>
      <Highlight
        mode="parent"
        value={pathname}
        hover
        controlledItems
        className="absolute inset-0 rounded-lg bg-[#FEDB00]/15"
        containerClassName="relative space-y-0.5"
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
      >
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <HighlightItem key={item.href} value={item.href} asChild>
              <Link
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "relative z-[1] flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "text-[#FEDB00] font-medium"
                    : "text-white/70 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {showShortcut && item.shortcut ? (
                  <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-white/40">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </Link>
            </HighlightItem>
          )
        })}
      </Highlight>
    </div>
  )
}

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

      <NavSection
        label="Workflow"
        items={primaryNav}
        pathname={pathname}
        onNavClick={onNavClick}
        showShortcut
      />

      <div className="mx-5 my-2 h-px bg-white/10" />

      <NavSection
        label="Supporting"
        items={secondaryNav}
        pathname={pathname}
        onNavClick={onNavClick}
      />

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
        <header className="relative flex h-14 items-center border-b bg-white px-4 lg:px-6">
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
