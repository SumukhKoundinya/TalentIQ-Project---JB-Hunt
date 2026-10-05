# TalentIQ UI Redesign — Wireframes

## Design Principles (Vanilla Modernization)

1. **Micro-interactions everywhere** — hover states, focus rings, loading skeletons, tactile button presses
2. **Mobile-first gestures** — touch-friendly tap targets (min 44px), swipeable cards, pull-to-refresh
3. **Real-time feedback** — optimistic updates, inline validation, live search with debounce
4. **Keyboard-first navigation** — arrow keys, shortcuts, focus management
5. **Consistent motion** — 200ms ease-out for transitions, spring physics for card swipes

---

## View 1: Overview Dashboard

### Desktop (1280px+)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──────────┐                                                               │
│  │ JB Hunt  │  ┌─────────────────────────────────────────────────────────┐  │
│  │  Logo    │  │  WORKSPACE                                              │  │
│  └──────────┘  │  ─────────                                              │  │
│                │  ◉ Overview                    ┌─────────────────────┐  │  │
│                │  ○ Candidate Intake            │  LOGGED IN AS       │  │  │
│                │  ○ Recruiter Capture           │  ┌───────────────┐  │  │  │
│                │  ○ AI Summary                  │  │ Carl Pegue ▾  │  │  │  │
│                │  ○ Review Dashboard            │  └───────────────┘  │  │  │
│                │                                │                     │  │  │
│                │  ┌─────────────────────────┐   │  🔍 Search...      │  │  │
│                │  │ EVENT                   │   └─────────────────────┘  │  │
│                │  │ Logistics & Tech Fair   │                             │  │
│                │  │ Sep 14, 2026 • Nashville│                             │  │
│                │  └─────────────────────────┘                             │  │
│                └─────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════════│
│                                                                             │
│  Event Overview                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ ████████  7  │ │ ████████  2  │ │     —        │ │    85%       │      │
│  │ Total Scanned│ │ Interview    │ │ Avg Review   │ │ Data         │      │
│  │              │ │ Requests     │ │ Time         │ │ Completeness │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                                             │
│  ┌────────────────────────────┐ ┌──────────────┐ ┌──────────────────┐     │
│  │ Candidates by Major        │ │ Top Unis     │ │ Today's Activity │     │
│  │                            │ │              │ │                  │     │
│  │ Computer Science  ████ 43% │ │ 1 UARK   3  │ │ ● Carl reviewed  │     │
│  │ Information Sys    ██  29% │ │ 2 ASU    2  │ │   JBH-003        │     │
│  │ Supply Chain       █   14% │ │ 3 UGA    1  │ │   just now       │     │
│  │ Business           █   14% │ │ 4 FSU    1  │ │ ● Sarah flagged  │     │
│  │                            │ │              │ │   JBH-005        │     │
│  │                            │ │              │ │   2m ago         │     │
│  └────────────────────────────┘ └──────────────┘ └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interactions Added:
- **Stat cards**: Scale 1.02 + shadow lift on hover (150ms ease)
- **Bar chart**: Animate width from 0 on page load (stagger 100ms per bar)
- **Activity feed**: Fade-in items sequentially on load
- **All cards**: Subtle shadow transition on hover

### Mobile (< 768px)

```
┌──────────────────────┐
│ ☰  TalentIQ          │
│══════════════════════│
│ Event Overview       │
│                      │
│ ┌──────────────────┐ │
│ │ 7 Total Scanned  │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 2 Interview Req  │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ — Avg Review Time│ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ 85% Completeness │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Candidates by    │ │
│ │ Major (scroll→)  │ │
│ └──────────────────┘ │
└──────────────────────┘
```

---

## View 2: Candidate Intake (Mobile-First Form)

### Desktop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Sidebar]                                                                  │
│                                                                             │
│  Student Self-Service                                                       │
│  Candidate Intake                                                           │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  REQUIRED INFORMATION                                               │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  First Name *                 Last Name *                           │   │
│  │  ┌─────────────────────┐     ┌─────────────────────┐               │   │
│  │  │ Maya                │     │ Williams            │               │   │
│  │  └─────────────────────┘     └─────────────────────┘               │   │
│  │                                                                     │   │
│  │  Email *                                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ you@university.edu                                          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  University *                      Major *                          │   │
│  │  ┌─────────────────────┐           ┌─────────────────────┐         │   │
│  │  │ University of... ▾  │           │ Computer Science ▾  │         │   │
│  │  └─────────────────────┘           └─────────────────────┘         │   │
│  │                                                                     │   │
│  │  Graduation Date *                                                  │   │
│  │  ┌─────────────────────┐                                            │   │
│  │  │ 2026-05             │                                            │   │
│  │  └─────────────────────┘                                            │   │
│  │                                                                     │   │
│  │  OPTIONAL DETAILS                                                   │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                     │   │
│  │  GPA                          Phone                                │   │
│  │  ┌─────────────────────┐     ┌─────────────────────┐               │   │
│  │  │ 3.75                 │     │ 555-0100            │               │   │
│  │  └─────────────────────┘     └─────────────────────┘               │   │
│  │                                                                     │   │
│  │  Work Authorization                                                 │   │
│  │  (●) US Citizen  (○) Require Sponsorship  (○) OPT/CPT             │   │
│  │                                                                     │   │
│  │  Resume                                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ 📎 Choose file...                                          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                   Submit Profile                           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interactions Added:
- **Input focus**: Blue border + 3px glow ring (200ms ease)
- **Validation**: Real-time inline errors below field (shake animation on error)
- **Submit button**: Scale 0.98 on press, loading spinner on submit
- **Success**: Green checkmark animation + redirect to Capture view
- **Field completion**: Subtle green border flash when valid

### Mobile (< 768px)

```
┌──────────────────────┐
│ ☰  Candidate Intake  │
│══════════════════════│
│                      │
│ REQUIRED INFORMATION │
│ ──────────────────── │
│                      │
│ First Name *         │
│ ┌──────────────────┐ │
│ │ Maya             │ │
│ └──────────────────┘ │
│                      │
│ Last Name *          │
│ ┌──────────────────┐ │
│ │ Williams         │ │
│ └──────────────────┘ │
│                      │
│ Email *              │
│ ┌──────────────────┐ │
│ │ you@university   │ │
│ └──────────────────┘ │
│                      │
│ [Continue scrolling] │
└──────────────────────┘
```

---

## View 3: Recruiter Capture (Tinder-Style Card Deck)

### Design Philosophy

Current card is a **form** (7 fields, flags, skills, AI summary). Redesign makes it a **visual impression** like Tinder — big avatar, 3 key facts, done. Details live in the panel to the right.

### Desktop — New Card Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Live Capture                                     Card 1 of 7              │
│  Recruiter Capture                              ┌───────────────┐          │
│  ══════════════════════════════════════════════│ Carl Pegue    │          │
│                                                └───────────────┘          │
│                                                                             │
│                    ┌──────────────────────────┐                            │
│                    │ ┌──────────────────────┐ │         ┌───────────────┐  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │         │ REVIEWED  ←  │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │         └───────────────┘  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │                            │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    ┌───────────────────┐  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │                   │  │
│                    │ │░░░░░░  MW  ░░░░░░░░░░│ │    │  Maya Williams    │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │  JBH-001          │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │                   │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │  UARK · CS        │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │  Grad: May 2026   │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │  GPA: 3.75        │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │                   │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │  ┌──┐┌──┐┌──┐    │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │  │JS││Re││No│    │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │  └──┘└──┘└──┘    │  │
│                    │ │░░░░░░░░░░░░░░░░░░░░░░│ │    │                   │  │
│                    │ └──────────────────────┘ │    │  ⚠ Resume missing │  │
│                    │  Maya Williams            │    │                   │  │
│                    │  UARK · CS · Grad 2026   │    │  [View Details →] │  │
│                    │  ████████░░░░░░░░░░░░░░  │    │                   │  │
│                    │ ← Swipe left = Reviewed  │    └───────────────────┘  │
│                    │   Swipe right = Contact →│                            │
│                    └──────────────────────────┘                            │
│                                                                             │
│                    ┌─────┐      ┌─────┐      ┌─────┐                      │
│                    │  ✕  │      │  ◀  │      │  ▶  │                      │
│                    │ Pass │      │ Undo │      │ Like │                      │
│                    └─────┘      └─────┘      └─────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Card Anatomy (What's On vs What's Off-Card)

```
┌──────────────────────────────────┐
│                                  │  ← ON CARD (visual impression)
│  ┌────────────────────────────┐  │
│  │                            │  │  1. AVATAR BLOCK (60% of card)
│  │      LARGE AVATAR          │  │     - Colored circle with initials
│  │      (color from name)     │  │     - Name overlaid at bottom
│  │                            │  │     - Subtle gradient for text legibility
│  │                            │  │     - NO photo needed (just initials)
│  └────────────────────────────┘  │
│                                  │
│  Maya Williams                   │  2. NAME + ID (1 line)
│  JBH-001                        │     - Name bold, ID mono
│                                  │
│  UARK · CS · Grad May 2026      │  3. ONE-LINE SUMMARY (school, major, grad)
│                                  │     - Joined with middle dots
│                                  │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░  │  4. COMPLETION BAR (visual data quality)
│     ↑ GPA: 3.75 shown if ≥3.5  │     - Green/yellow/red based on completeness
│                                  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│                                  │  ← OFF-CARD (in detail panel)
│  Skills: JS, React, Node         │  - Full skill list
│  GPA: 3.75                       │  - All fields (GPA, auth, location, role)
│  Auth: US Citizen                │  - Missing flags
│  Location: Fayetteville, AR      │  - AI summary
│  Role: Software Engineer         │  - Recruiter notes
│  ⚠ Resume missing                │  - Audio player
│                                  │
│  AI Summary:                     │
│  "Strong frontend candidate..." │
│                                  │
│  Recruiter Notes:                │
│  [Editable textarea]             │
└──────────────────────────────────┘
```

### Swipe Overlay Stamps

```
    LEFT SWIPE (Reviewed)              RIGHT SWIPE (Contact)
    ┌──────────────────┐              ┌──────────────────┐
    │░░░░░░░░░░░░░░░░░░│              │░░░░░░░░░░░░░░░░░░│
    │░░░░░░░░░░░░░░░░░░│              │░░░░░░░░░░░░░░░░░░│
    │░░  REVIEWED  ░░░░│              │░░░░░░░░░░░░░░░░░░│
    │░░  (red, -20°) ░░│              │░░░░░ CONTACT ░░░░│
    │░░░░░░░░░░░░░░░░░░│              │░░░░ (blue, +20°) │
    │░░░░░░░░░░░░░░░░░░│              │░░░░░░░░░░░░░░░░░░│
    └──────────────────┘              └──────────────────┘

    - Border: 3px solid (#6B7280)     - Border: 3px solid (#005DBA)
    - Background: rgba(107,114,128,0.85) - Background: rgba(0,93,186,0.88)
    - Opacity: min(dx/100, 1)         - Opacity: min(dx/100, 1)
    - Font: 28px, weight 900          - Font: 28px, weight 900
```

### Swipe Mechanics (Tinder Physics)

```
PARAMETER                 CURRENT        NEW (TINDER-LIKE)
─────────────────────────────────────────────────────────
Rotation divisor          dx × 0.08      dx / 25
Peak rotation             ~10°           ~12°
Commit threshold          100px fixed    35% screen width (~130px)
Velocity threshold        None           800px/s (fast flick = commit)
Exit animation            800ms CSS      Velocity-matched (physics)
Spring back               CSS bounce     Spring physics (friction 4)
Overlay fade              dx/100         dx/100 (same)
Stack depth               3 cards        3 cards (same)
Next card scale           95%            95% (same)
```

### Card Stack Visual

```
    Card 3 (peek):  scale(0.90) translateY(16px)   z-index: 1
    Card 2 (peek):  scale(0.95) translateY(8px)    z-index: 2
    Card 1 (active): scale(1.0) translateY(0)      z-index: 3
                      ↑
                      Dragged by finger, rotation follows dx/25
```

### Velocity-Based Exit (Key Difference)

```
CURRENT (constant):
  Card reaches 60% → fixed 800ms animation to exit
  Feels the same whether you flick hard or push slow

NEW (velocity-matched):
  Slow push: Card follows finger slowly, exits slowly
  Fast flick: Card rockets off screen in ~300ms
  Exit speed = gesture velocity × 0.8
  Spring back: friction: 4 (bouncy, satisfying)
```

### Action Buttons (Below Card Stack)

```
    ┌─────┐      ┌─────┐      ┌─────┐
    │  ✕  │      │  ◀  │      │  ▶  │      ← 3 circles, 64px mobile
    │ Pass │      │ Undo │      │ Like │
    └─────┘      └─────┘      └─────┘
     Red           Gray          Blue
     56px          48px          56px        ← Size hierarchy
```

### Detail Panel (Right Side — Off-Card Info)

```
┌───────────────────────────────────────┐
│                                       │
│  MAYA WILLIAMS           JBH-001    │
│  ─────────────────────────────────── │
│                                       │
│  University    University of Arkansas │
│  Major         Computer Science       │
│  Grad Date     May 2026              │
│  GPA           3.75                   │
│  Auth          US Citizen             │
│  Location      Fayetteville, AR      │
│  Role          Software Engineer     │
│                                       │
│  SKILLS                               │
│  ┌──┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │JS│ │Re  │ │Node│ │SQL │ │+2  │  │
│  └──┘ └────┘ └────┘ └────┘ └────┘  │
│                                       │
│  ⚠ Missing: Resume                    │
│                                       │
│  ──── AI Summary ────                │
│  Strong frontend candidate with       │
│  React/Node experience. UARK CS       │
│  senior, 3.75 GPA.                    │
│                                       │
│  ──── Recruiter Notes ────           │
│  ┌───────────────────────────────┐   │
│  │ [Live transcription appears   │   │
│  │  here as editable bullets]    │   │
│  └───────────────────────────────┘   │
│                                       │
│  ──── Voice Notes ────               │
│  🔴 Record  00:00  [Stop]            │
│  ▶ Recording 1 (12s) ──────●──────  │
│                                       │
└───────────────────────────────────────┘
```

### Mobile Card (< 768px) — Touch-Optimized

```
┌──────────────────────┐
│ Live Capture    1/7  │
│══════════════════════│
│                      │
│ ┌──────────────────┐ │
│ │                  │ │
│ │  ░░░░░░░░░░░░░░  │ │
│ │  ░░░░░░░░░░░░░░  │ │
│ │  ░░░░░░░░░░░░░░  │ │
│ │  ░░░░░  MW  ░░░  │ │  ← Avatar fills card top (60%)
│ │  ░░░░░░░░░░░░░░  │ │
│ │  ░░░░░░░░░░░░░░  │ │
│ │  ░░░░░░░░░░░░░░  │ │
│ │                  │ │
│ │  Maya Williams   │ │  ← Name bold, 18px
│ │  UARK · CS       │ │  ← One-line summary
│ │  Grad: May 2026  │ │
│ │  ████░░░░ 65%    │ │  ← Completion bar
│ │                  │ │
│ └──────────────────┘ │
│                      │
│  ← Swipe →           │  ← Hint text
│                      │
│  [View Details]      │  ← Tap to see full info
│                      │
│ ┌──┐  ┌──┐  ┌──┐   │
│ │✕ │  │◀ │  │▶ │   │  ← 64px touch targets
│ │  │  │  │  │  │   │
│ └──┘  └──┘  └──┘   │
│ Pass Undo  Like     │
└──────────────────────┘
```

### Mobile Detail Slide-Up (When "View Details" Tapped)

```
┌──────────────────────┐
│ Maya Williams    ✕   │
│══════════════════════│
│                      │
│ UARK · CS            │
│ Grad: May 2026       │
│ GPA: 3.75            │
│ Auth: US Citizen     │
│ Location: Fayetteville│
│ Role: Software Eng   │
│                      │
│ ┌──┐┌──┐┌──┐┌──┐   │
│ │JS││Re││No││SQL│   │
│ └──┘└──┘└──┘└──┘   │
│                      │
│ ⚠ Resume missing     │
│                      │
│ AI Summary           │
│ Strong frontend...   │
│                      │
│ Recruiter Notes      │
│ ┌──────────────────┐ │
│ │ [editable]       │ │
│ └──────────────────┘ │
│                      │
│ 🔴 Record  00:00    │
└──────────────────────┘
```

### Implementation Notes

1. **Avatar color**: Generated from name hash → consistent color per candidate
2. **Completion bar**: Green (>80%), Yellow (50-80%), Red (<50%) — visual data quality
3. **Detail panel**: Scrollable, shows ALL fields + notes + audio
4. **Mobile**: Card is full-width, detail slides up as sheet
5. **Card content**: 5 lines max (avatar, name, one-liner, completion bar)
6. **Stack**: Only render 3 cards max for performance

---

## View 4: AI Summary & Review

### Desktop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  End-of-Day Triage                                                          │
│  AI Summary & Review                                                        │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ [All Statuses ▾] [All Functions ▾] [All Priority ▾] 🔍 Search...   │  │
│  │ [Export CSV] [Export JSON]                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌────────────────────────────┐ ┌──────────────────────────────────────┐  │
│  │ 7 candidates               │ │                                      │  │
│  │ ─────────────────────────  │ │  ┌─────┐                             │  │
│  │ ☐ Maya Williams    New  1  │ │  │ MW  │  Maya Williams              │  │
│  │ ☑ Alex Chen     Follow  0  │ │  └─────┘  JBH-002 • UARK            │  │
│  │ ☐ Jordan Lee   Review  2  │ │           BS in CS                   │  │
│  │ ☐ Sam Patel       New  1  │ │                                      │  │
│  │ ☐ Taylor Swift  Review  0  │ │  [Approve]  [Follow Up]             │  │
│  │ ☐ Casey Morgan    New  1  │ │                                      │  │
│  │ ☐ Riley Jones  Follow  0  │ │  ──── AI-Generated Snapshot ────     │  │
│  │                            │ │  Strong candidate with experience    │  │
│  │                            │ │  in frontend development...          │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── Missing Info ────              │  │
│  │                            │ │  ⚠ Resume  ⚠ Phone                  │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── Source Traceability ────       │  │
│  │                            │ │  [Frontend skills mentioned in       │  │
│  │                            │ │   interview notes]                   │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── Recruiter Notes ────           │  │
│  │                            │ │  ┌──────────────────────────────┐   │  │
│  │                            │ │  │ Strong candidate...          │   │  │
│  │                            │ │  └──────────────────────────────┘   │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── Record Integrity ────          │  │
│  │                            │ │  Core fields: ████░░ 4/6            │  │
│  └────────────────────────────┘ └──────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 2 candidates selected  [Compare Selected] [Clear]                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interactions Added:
- **List items**: Hover background transition (100ms), selected state with blue left border
- **Filter dropdowns**: Instant filter with 150ms debounce on search
- **Detail panel**: Fade-in content on selection change
- **Approve/Follow Up**: Optimistic update + toast notification
- **Compare bar**: Slide-up animation when visible
- **Trace links**: Click highlights text in summary with yellow background

### Mobile (< 768px) — Stacked Layout

```
┌──────────────────────┐
│ AI Summary & Review  │
│══════════════════════│
│                      │
│ [All Statuses ▾]     │
│ [All Functions ▾]    │
│ 🔍 Search...         │
│                      │
│ 7 candidates         │
│ ──────────────────── │
│ ☐ Maya Williams New  │
│ ☑ Alex Chen  Follow  │
│ ☐ Jordan Lee Review  │
│ ☐ Sam Patel    New   │
│                      │
│ [Tap to view detail] │
│                      │
│ ┌──────────────────┐ │
│ │ Selected: Maya   │ │
│ │ [Approve]        │ │
│ │ [Follow Up]      │ │
│ │                  │ │
│ │ AI Summary...    │ │
│ └──────────────────┘ │
└──────────────────────┘
```

---

## View 5: Candidate Review (Detailed View)

### Desktop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Detailed View                                                              │
│  Candidate Review                                                           │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ [All Statuses ▾] [All Functions ▾] [All Priority ▾] 🔍 Search...   │  │
│  │ [Export CSV]                                                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌────────────────────────────┐ ┌──────────────────────────────────────┐  │
│  │ 5 candidates               │ │                                      │  │
│  │ ─────────────────────────  │ │  ┌─────┐                             │  │
│  │ ☐ Maya Williams    New  1  │ │  │ MW  │  Maya Williams              │  │
│  │ ☑ Alex Chen     Follow  0  │ │  └─────┘  JBH-002 • UARK            │  │
│  │ ☐ Jordan Lee   Review  2  │ │           BS in CS                   │  │
│  │ ☐ Sam Patel       New  1  │ │                                      │  │
│  │ ☐ Taylor Swift  Review  0  │ │  [Approve]  [Follow Up]             │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── AI-Generated Snapshot ────     │  │
│  │                            │ │  Strong candidate with experience    │  │
│  │                            │ │  in frontend development...          │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── Missing Info ────              │  │
│  │                            │ │  ⚠ Resume  ⚠ Phone                  │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── Source Traceability ────       │  │
│  │                            │ │  [Frontend skills mentioned in       │  │
│  │                            │ │   interview notes]                   │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── Recruiter Notes ────           │  │
│  │                            │ │  ┌──────────────────────────────┐   │  │
│  │                            │ │  │ Strong candidate...          │   │  │
│  │                            │ │  └──────────────────────────────┘   │  │
│  │                            │ │                                      │  │
│  │                            │ │  ──── Record Integrity ────          │  │
│  │                            │ │  Core fields: ████░░ 4/6            │  │
│  └────────────────────────────┘ └──────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 2 candidates selected  [Compare] [Clear]                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interactions Added:
- Same as AI Review view (shared component)
- **Additional**: Detail panel scrolls independently on mobile
- **Keyboard**: Arrow keys navigate list, Enter selects

---

## Global Interactions (All Views)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate card stack (Capture view) |
| `Space` | Skip card |
| `Esc` | Undo last action |
| `Ctrl+K` | Global search focus |
| `1-5` | Navigate to view 1-5 |

### CSS Transitions (to add)

```css
/* Button tactile feedback */
.primary-button:active,
.secondary-button:active {
  transform: scale(0.98);
}

/* Card hover lift */
.stat-card:hover,
.overview-card:hover,
.capture-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

/* Input focus glow */
input:focus,
select:focus,
textarea:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
  transition: border-color 150ms, box-shadow 150ms;
}

/* List item hover */
.ai-list-item:hover {
  background: var(--surface-soft);
  transition: background 100ms;
}

/* View transition */
.view {
  animation: viewIn 200ms ease;
}
@keyframes viewIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stagger animation for stat cards */
.stat-card:nth-child(1) { animation-delay: 0ms; }
.stat-card:nth-child(2) { animation-delay: 50ms; }
.stat-card:nth-child(3) { animation-delay: 100ms; }
.stat-card:nth-child(4) { animation-delay: 150ms; }

/* Bar chart animation */
.hbar-fill {
  animation: barGrow 600ms ease-out forwards;
}
@keyframes barGrow {
  from { width: 0; }
}

/* Toast slide in */
.toast {
  transition: opacity 180ms, transform 180ms;
}
.toast--show {
  opacity: 1;
  transform: translateY(0);
}

/* Card swipe spring */
.capture-card--spring {
  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Card exit */
.capture-card--exiting {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease;
}
```

### Mobile Gesture Improvements

```css
/* Larger touch targets for mobile */
@media (max-width: 768px) {
  .capture-action-btn {
    width: 64px;  /* Was 56px */
    height: 64px;
  }
  
  .nav-link {
    padding: 14px 16px;  /* Was 10px 12px */
    min-height: 48px;
  }
  
  .ai-list-item {
    padding: 16px;  /* Was 12px */
  }
}

/* Swipe hint more visible on mobile */
@media (max-width: 768px) {
  .capture-card__swipe-hint {
    opacity: 0.8;
    font-size: 13px;
  }
}
```

---

## Implementation Priority

1. **Phase 1: Micro-interactions** (CSS only)
   - Button tactile feedback
   - Card hover lifts
   - Input focus glow
   - View transitions

2. **Phase 2: Animations** (CSS + minimal JS)
   - Bar chart grow animation
   - Stagger stat cards on load
   - Toast slide-in

3. **Phase 3: Mobile improvements** (CSS + JS)
   - Larger touch targets
   - Better swipe hints
   - Keyboard shortcuts

4. **Phase 4: Advanced interactions** (JS)
   - Real-time search with debounce
   - Optimistic updates
   - Loading states

---

## Files to Modify

1. `styles.css` — Add transition/animation CSS
2. `views.js` — Add animation triggers, loading states
3. `components.js` — Add loading spinner, skeleton components
4. `index.html` — Add keyboard shortcut listener
