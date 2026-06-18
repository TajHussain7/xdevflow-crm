# UI/UX Design Document
## XDevFlow CRM — Interface Design Specification
**Version:** 1.0.0 | **Framework:** Next.js + TailwindCSS + shadcn/ui

---

## 1. Design Philosophy

The XDevFlow CRM UI follows three principles:

**Clarity over cleverness.** Sales teams are in a hurry. Every screen must communicate its purpose within 2 seconds of loading.

**Data-first layout.** Leads are the product. Tables, pipelines, and stats take center stage. Navigation is structural, not decorative.

**Professional dark-capable.** The interface works in both light and dark mode. Colors are semantic, not aesthetic — status badges, pipeline steps, and alerts carry meaning through color.

---

## 2. Design System

### 2.1 Color Tokens (CSS Variables)

```css
/* Light Mode */
:root {
  --bg-base:       #F9FAFB;   /* Page background */
  --bg-surface:    #FFFFFF;   /* Cards, panels */
  --bg-sunken:     #F3F4F6;   /* Input fields, table rows */

  --border:        #E5E7EB;
  --border-strong: #D1D5DB;

  --text-primary:  #111827;
  --text-secondary:#6B7280;
  --text-muted:    #9CA3AF;

  --accent:        #6366F1;   /* Indigo — primary brand */
  --accent-hover:  #4F46E5;
  --accent-subtle: #EEF2FF;

  --success:       #10B981;
  --warning:       #F59E0B;
  --danger:        #EF4444;
  --info:          #3B82F6;
}

/* Dark Mode */
.dark {
  --bg-base:       #0F172A;
  --bg-surface:    #1E293B;
  --bg-sunken:     #0F172A;

  --border:        #334155;
  --border-strong: #475569;

  --text-primary:  #F1F5F9;
  --text-secondary:#94A3B8;
  --text-muted:    #64748B;

  --accent:        #818CF8;
  --accent-hover:  #6366F1;
  --accent-subtle: #1E1B4B;
}
```

### 2.2 Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Display / Page Title | Inter | 24px | 700 |
| Section Heading | Inter | 18px | 600 |
| Body / Default | Inter | 14px | 400 |
| Label / Caption | Inter | 12px | 500 |
| Code / Monospace | JetBrains Mono | 13px | 400 |

### 2.3 Status Badge Colors

| Status | Background | Text | Meaning |
|---|---|---|---|
| `new` | `#EFF6FF` | `#1D4ED8` | Newly added |
| `contacted` | `#FFF7ED` | `#C2410C` | First touch made |
| `qualified` | `#F0FDF4` | `#15803D` | Fit confirmed |
| `proposal` | `#FAF5FF` | `#7E22CE` | Offer sent |
| `closed_won` | `#F0FDF4` | `#166534` | Won |
| `closed_lost` | `#FEF2F2` | `#991B1B` | Lost |

### 2.4 Spacing Scale (Tailwind)

Use multiples of 4px: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `p-4`, `p-6`, `p-8`.

---

## 3. Layout Architecture

### 3.1 App Shell

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (240px fixed)        │  MAIN CONTENT (flex-1)  │
│                               │                          │
│  ┌─────────────────────────┐  │  ┌────────────────────┐ │
│  │  Logo + Brand           │  │  │  TOP BAR           │ │
│  └─────────────────────────┘  │  │  Search | Bell | 👤│ │
│                               │  └────────────────────┘ │
│  Nav items:                   │                          │
│  • Dashboard       (active)   │  ┌────────────────────┐ │
│  • Leads                      │  │  PAGE CONTENT      │ │
│  • [Admin: Users]             │  │                    │ │
│                               │  │                    │ │
│  ─────────────────────────    │  └────────────────────┘ │
│  User avatar + role badge     │                          │
│  Logout button                │                          │
└─────────────────────────────────────────────────────────┘
```

On mobile (< 768px): Sidebar collapses to bottom tab bar with 3 icons.

### 3.2 Dashboard Page

```
┌───────────────────────────────────────────────────────┐
│  Dashboard                          [Date range ▾]     │
├───────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  TOTAL   │ │  NEW     │ │QUALIFIED │ │  CLOSED  │ │
│  │  LEADS   │ │  LEADS   │ │  LEADS   │ │  LEADS   │ │
│  │   148    │ │   12     │ │   37     │ │   94     │ │
│  │ ↑ 12%   │ │ this wk  │ │          │ │won: 71   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
├───────────────────────────────────────────────────────┤
│                                                        │
│  Pipeline Funnel (Recharts BarChart)                   │
│                                                        │
│  new ████████████████████ 48                          │
│  contacted ████████████ 31                            │
│  qualified ██████████ 27                              │
│  proposal ███████ 18                                  │
│  closed_won ████████ 20                               │
│  closed_lost ████ 4                                   │
│                                                        │
├───────────────────────────────────────────────────────┤
│  Recent Leads (last 5)                                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Name        Company     Status    Created         │ │
│  │ John Doe    Acme Corp   [new]     2 hours ago     │ │
│  └──────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### 3.3 Lead List Page

```
┌───────────────────────────────────────────────────────┐
│  Leads                              [+ New Lead]       │
├───────────────────────────────────────────────────────┤
│  [🔍 Search by name...]  [Status ▾]  [Clear filters]  │
├───────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐ │
│  │ □ │ Name      │ Email      │ Company │Status│ ⋯ │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ □ │ John Doe  │ j@acme.com │ Acme    │[new] │ ⋯ │ │
│  │ □ │ Jane Smith│ j@beta.com │ Beta    │[qual]│ ⋯ │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Showing 1–20 of 148     [← 1  2  3  4  5 →]         │
└───────────────────────────────────────────────────────┘
```

Row action menu (⋯): View, Edit, Delete (delete only shown if user is admin).

### 3.4 Lead Profile Page

```
┌───────────────────────────────────────────────────────┐
│  ← Back to Leads          John Doe         [Edit]      │
├─────────────────────────┬─────────────────────────────┤
│  LEAD DETAILS           │  ACTIVITY TIMELINE           │
│                         │                              │
│  Full Name: John Doe    │  ● Lead created              │
│  Email: j@acme.com      │    You · 3 days ago          │
│  Phone: +1-555-1234     │                              │
│  Company: Acme Corp     │  ● Status changed            │
│  Status: [qualified ▾]  │    new → contacted           │
│                         │    Sarah · 2 days ago        │
│  Notes:                 │                              │
│  ┌───────────────────┐  │  ● Email updated             │
│  │ Free text area    │  │    j2@acme.com → j@acme.com  │
│  └───────────────────┘  │    You · 1 day ago           │
└─────────────────────────┴─────────────────────────────┘
```

### 3.5 Lead Form (Create / Edit)

Modal dialog on desktop, full page on mobile.

```
┌─────────────────────────────────────┐
│  Create New Lead              [✕]   │
├─────────────────────────────────────┤
│  Full Name *                        │
│  ┌───────────────────────────────┐  │
│  │ John Doe                      │  │
│  └───────────────────────────────┘  │
│  Email Address *                    │
│  ┌───────────────────────────────┐  │
│  │ john@company.com              │  │
│  └───────────────────────────────┘  │
│  Phone Number *                     │
│  ┌───────────────────────────────┐  │
│  │ +1 (555) 000-0000             │  │
│  └───────────────────────────────┘  │
│  Company *                          │
│  ┌───────────────────────────────┐  │
│  │ Acme Corp                     │  │
│  └───────────────────────────────┘  │
│  Status                             │
│  ┌───────────────────────────────┐  │
│  │ New                         ▾ │  │
│  └───────────────────────────────┘  │
│  Notes (optional)                   │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  └───────────────────────────────┘  │
│              [Cancel]  [Create Lead]│
└─────────────────────────────────────┘
```

### 3.6 Login Page

Centered card, full-screen background with subtle gradient.

```
┌─────────────────────────────────────┐
│                                     │
│       XDevFlow CRM                  │
│       Sign in to your account       │
│                                     │
│  Email                              │
│  ┌───────────────────────────────┐  │
│  │ you@company.com               │  │
│  └───────────────────────────────┘  │
│  Password                           │
│  ┌───────────────────────────────┐  │
│  │ ••••••••••••          [👁]    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │       Sign In                 │  │
│  └───────────────────────────────┘  │
│                                     │
│  Don't have an account? Register    │
└─────────────────────────────────────┘
```

---

## 4. Component Specifications

### 4.1 StatCard
```tsx
// Props: title, value, subtitle, icon, trend (positive/negative/neutral)
// Renders: white card, icon top-right, large number, trend badge
// Animation: count-up animation on mount (1.2s)
```

### 4.2 LeadStatusBadge
```tsx
// Props: status (LeadStatus enum)
// Renders: pill badge with color from design system
// Size: text-xs, px-2.5, py-0.5, rounded-full
```

### 4.3 PipelineChart
```tsx
// Uses: Recharts HorizontalBarChart
// Data: pipeline_breakdown from /dashboard/stats
// Colors: mapped per status from design tokens
// Interactive: hover tooltip showing count + percentage
```

### 4.4 ActivityTimeline
```tsx
// Props: leadId
// Fetches: GET /activity/:leadId via React Query
// Renders: vertical timeline with icon per action type:
//   created → green circle
//   updated → blue pencil
//   deleted → red trash
// Shows: user avatar initials, action label, timestamp (relative)
```

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column; sidebar → bottom nav |
| Tablet | 640–1024px | Collapsed sidebar icon-only |
| Desktop | > 1024px | Full sidebar + content |

### Mobile-Specific Adaptations
- Lead table → Lead card stack (vertical)
- Dashboard stats → 2×2 grid
- Lead form → Full-screen slide-up sheet
- Pagination → "Load more" button

---

## 6. Interaction Patterns

| Action | Pattern |
|---|---|
| Create lead | Button → Modal (desktop) / Page (mobile) |
| Delete lead | Action menu → Confirmation AlertDialog → Toast |
| Status update | Inline select on lead profile page |
| Search | Debounced input, no submit button needed |
| Form submit | Disabled button during loading; inline spinner |
| Errors | Inline field error (red text below input) |
| Success | Toast notification (top-right, 4s auto-dismiss) |
| Loading | Skeleton loaders matching card/table shape |

---

## 7. Accessibility

- All interactive elements have `aria-label`.
- Focus ring visible on all keyboard-navigable elements.
- Color is never the sole indicator of status (label + color).
- Dialog/modal traps focus and restores on close.
- Form fields have associated `<label>` elements.
- Contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
