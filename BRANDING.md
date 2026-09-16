# BRANDING.md — Design System Reference

> J.B. Hunt corporate design system for TalentIQ.

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--jbh-yellow` | `#FEDB00` | Brand accent, topbar line, highlights |
| `--jbh-blue` | `#005DBA` | Primary actions, links, buttons, headers |
| `--jbh-black` | `#211F20` | Sidebar background, primary text |
| `--icicle-blue` | `#E2E8F0` | Page backgrounds, borders, subtle surfaces |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#16A34A` | "Reviewed" status, positive indicators |
| `--warning` | `#F59E0B` | "Follow-Up" status, amber badges |
| `--info` | `#005DBA` | "Interview Requested" status |
| `--danger` | `#DC2626` | Validation errors, delete actions |
| `--recording` | `#EF4444` | Audio recording indicator |

### Status Colors

| Status | Color | CSS Class |
|--------|-------|-----------|
| New | `--icicle-blue` | `.status-new` |
| Reviewed | `--success` | `.status-reviewed` |
| Follow-Up | `--warning` | `.status-follow-up` |
| Interview Requested | `--info` | `.status-interview` |
| Closed | `#6B7280` | `.status-closed` |

## Typography

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### Type Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-xs` | 0.75rem (12px) | 400 | Labels, captions |
| `--text-sm` | 0.875rem (14px) | 400 | Body secondary |
| `--text-base` | 1rem (16px) | 400 | Body primary |
| `--text-lg` | 1.125rem (18px) | 600 | Section headers |
| `--text-xl` | 1.25rem (20px) | 600 | Card titles |
| `--text-2xl` | 1.5rem (24px) | 700 | View titles |
| `--text-3xl` | 1.875rem (30px) | 700 | Stat numbers |

## Spacing Scale

| Token | Value |
|-------|-------|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Inputs, small elements |
| `--radius-md` | 6px | Cards, buttons |
| `--radius-lg` | 8px | Modals, panels |
| `--radius-xl` | 12px | Large cards |
| `--radius-full` | 9999px | Pills, circular buttons |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Floating elements |

## Layout

### Sidebar
- Width: 240px (expanded), 0px (collapsed on mobile)
- Background: `--jbh-black` (#211F20)
- Nav items: 44px height, white text, yellow active indicator
- Collapse breakpoint: < 1024px

### Topbar
- Height: 60px
- Background: white
- Bottom border: 2px solid `--jbh-yellow`
- Contains: breadcrumb, recruiter selector, search

### View Container
- Fills remaining space after sidebar + topbar
- Padding: 24px
- Scroll: vertical overflow

## Components

### Buttons

| Type | Background | Text | Border | Usage |
|------|-----------|------|--------|-------|
| Primary | `--jbh-blue` | white | none | Main actions |
| Secondary | white | `--jbh-blue` | `--jbh-blue` | Secondary actions |
| Success | `--success` | white | none | Approve, Reviewed |
| Warning | `--warning` | white | none | Follow-Up |
| Info | `--info` | white | none | Interview Requested |
| Danger | `--danger` | white | none | Delete, remove |
| Ghost | transparent | `--jbh-blue` | none | Text links |

### Cards
- Background: white
- Border: 1px solid `--icicle-blue`
- Border-radius: `--radius-lg`
- Shadow: `--shadow-sm`
- Hover: `--shadow-md`, translateY(-1px)

### Status Chips
- Inline pill badges
- Background matches status color at 10% opacity
- Text matches status color
- Border-radius: `--radius-full`

### Flag Chips
- Small inline badges for missing data
- Red background for critical, amber for important, gray for nice-to-have
- Icon: ⚠️ for critical, ℹ️ for others

## Accessibility (WCAG 2.2 AA)

### Contrast Ratios
- All text meets 4.5:1 minimum against background
- Large text (18px+ bold, 24px+ regular) meets 3:1
- Interactive elements meet 3:1 against adjacent colors

### Focus Indicators
```css
:focus-visible {
  outline: 3px solid var(--jbh-blue);
  outline-offset: 2px;
}
```

### Touch Targets
- Minimum 44px × 44px for all interactive elements
- Mobile: 48px recommended

### Keyboard Navigation
- Tab order follows visual layout
- Escape closes modals and overlays
- Arrow keys for card navigation in Capture view
- All actions accessible without mouse

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| ≥ 1440px | Full sidebar + two-panel layouts |
| 1024px–1439px | Collapsed sidebar, two-panel stacks |
| 768px–1023px | Single column, stacked panels |
| < 768px | Mobile: full-width, bottom action bars |

## Print Styles

For QR Poster view:
- Hide sidebar, topbar, navigation
- Full-page centered layout
- High-contrast QR code
- @page size A4 portrait
