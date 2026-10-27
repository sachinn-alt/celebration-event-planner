# 🎨 Design System & UX/UI Specification (`design.md`)

## 1. Design Philosophy: Obsidian Glassmorphism
The visual identity of **EventiQ** is inspired by luxury hospitality and haute event ateliers. Rather than resembling a generic spreadsheet, the application communicates sophistication, celebration, and confidence through an **Obsidian Black & Champagne Gold Glassmorphic** theme.

### Core Tenets:
1. **Consistency First:** All styling strictly derives from standardized design tokens: Typography, 8-point Spacing, Colors, and Atomic Components.
2. **Every Element Has a Job:** Every button, card, and indicator performs an explicit high-value job (P0 Critical, P1 Utility, P2 Delight). Fluff that does not help the user plan their event is aggressively removed.
3. **Multi-Breakpoint Resilience:** Pixel-perfect layout adaptation verified across compact mobile (360px), phablet (480px), tablet (768px), desktop (1024px), and ultra-wide (1440px+).

---

## 2. Foundations: Type, Spacing, Colors & Components First

### 2.1 Typography System & Scale
A balanced dual-font typographic hierarchy that conveys celebration and rigorous clarity.
- **Display / Heading Serif:** `'Playfair Display', Georgia, serif` — used strictly for celebratory event headers, hero titles, and milestone achievements.
- **Interface / Body Sans:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` — used for data tables, budget values, forms, and general UI.

| Token | Size | Line Height | Weight | Strict Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--type-display-2xl` | `2.25rem` (36px) | `1.2` | `700` Bold | Hero event title, archetype heading |
| `--type-display-xl` | `1.75rem` (28px) | `1.25` | `700` Bold | Section headers (H1), modal hero headings |
| `--type-heading-lg` | `1.375rem` (22px) | `1.3` | `600` SemiBold | Module titles (Budget, Timeline, Vendors) |
| `--type-heading-md` | `1.125rem` (18px) | `1.35` | `600` SemiBold | Category group headers, card titles |
| `--type-metric-val` | `1.5rem` (24px) | `1.1` | `700` Bold | Prominent HUD metric figures ($ Spent, Days Left) |
| `--type-body-base` | `0.938rem` (15px) | `1.5` | `400` Regular | Primary descriptions, task copy, notes |
| `--type-body-sm` | `0.813rem` (13px) | `1.4` | `500` Medium | Secondary helper copy, form labels, tooltips |
| `--type-caption-xs` | `0.688rem` (11px) | `1.3` | `600` SemiBold | Status pills, badges, currency symbols, tags |

### 2.2 Strict 8-Point Spacing Scale
All margins, paddings, gaps, and component dimensions must strictly map to this 8-point ladder.

```css
:root {
  --space-1: 4px;   /* Micro-padding, inline pill gaps */
  --space-2: 8px;   /* Icon-to-text gap, badge padding */
  --space-3: 12px;  /* Compact button padding, card inner item gap */
  --space-4: 16px;  /* Standard card internal padding, grid column gaps */
  --space-5: 20px;  /* Form field spacing, stack element gaps */
  --space-6: 24px;  /* Section margins, elevated card padding */
  --space-8: 32px;  /* Module grid gaps, layout container vertical padding */
  --space-12: 48px; /* Major section separators, header bottom offset */
  --space-16: 64px; /* Screen hero top/bottom padding */
}
```

### 2.3 Color Tokens & Contrast Ratios
Obsidian Black & Champagne Gold Palette with verified WCAG 2.1 AA compliance (contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text).

```css
:root {
  /* Surfaces & Canvas */
  --bg-canvas: #07090E;             /* Deepest Obsidian background */
  --bg-surface: #0E131F;            /* Module container background */
  --bg-card: rgba(22, 29, 46, 0.70);/* Translucent glass card */
  --bg-elevated: #1A2338;          /* Hovered element background */
  --bg-glass-hover: rgba(30, 41, 64, 0.85);

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-glass: rgba(255, 255, 255, 0.15);
  --border-focus: #F59E0B;

  /* Primary Accent: Champagne Gold */
  --gold-300: #FDE68A;
  --gold-400: #FCD34D;
  --gold-500: #F59E0B;             /* Primary CTA and active tab */
  --gold-600: #D97706;
  --gold-glow: rgba(245, 158, 11, 0.25);

  /* Functional Status Colors */
  --status-success: #10B981;       /* Paid items, completed milestones */
  --status-warning: #F59E0B;       /* Approaching budget cap, pending items */
  --status-danger: #EF4444;        /* Over-budget, timeline collision */
  --status-info: #06B6D4;          /* AI suggestions, tips */

  /* Category Specific Palette */
  --cat-venue: #F59E0B;            /* Champagne Gold */
  --cat-catering: #10B981;         /* Emerald Green */
  --cat-photo: #06B6D4;            /* Cyan */
  --cat-music: #8B5CF6;            /* Violet */
  --cat-decor: #EC4899;            /* Rose Pink */
  --cat-attire: #3B82F6;           /* Blue */
  --cat-favors: #F97316;           /* Amber Orange */
  --cat-contingency: #6366F1;      /* Indigo */

  /* Text & Readability */
  --text-primary: #F9FAFB;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;
  --text-inverse: #07090E;

  /* Visual Effects */
  --blur-glass: blur(16px);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 25px var(--gold-glow);
}
```

### 2.4 Atomic Component Library
Standardized building blocks built first before assembling business modules:
1. **`Button`:**
   - Variants: `primary` (Gold fill), `secondary` (Glass surface + border), `ghost` (Hover only), `danger` (Crimson glass).
   - Mandatory visible focus ring: `outline: 2px solid var(--gold-400); outline-offset: 2px;`
   - Touch targets: Minimum 44x44px on mobile viewports.
2. **`GlassCard`:** `backdrop-filter: var(--blur-glass)`, border `var(--border-glass)`, padding `var(--space-6)`.
3. **`StatusPill`:** Rounded badge with semantic colored dot and text (`estimated`, `quoted`, `paid`, `critical`).
4. **`Input & Select`:** Clean dark input with `var(--border-subtle)`, transitions to `var(--border-focus)` on focus. Includes built-in error message slots.
5. **`Modal & Drawer Primitive`:** Accessible dialog with focus trap, backdrop blur, Escape key dismissal, and ARIA labels.
6. **`AllocationMeter`:** Multi-colored segmented bar representing the exact percentage distribution of budget categories.

---

## 3. Element Job & Level of Importance (Zero Fluff Principle)

Every single element on screen must perform a specific "Job" for the user. Anything that does not directly solve budget drift, timeline chaos, vendor uncertainty, or creative block is removed.

| Priority Level | Component | The Exact "Job" It Performs |
| :--- | :--- | :--- |
| **P0 (Critical Path)** | **Archetype Switcher** | Instantly configures the entire data model, budget benchmarks, and checklist for Wedding, Birthday, or Gala. |
| **P0 (Critical Path)** | **Budget HUD Bar** | Displays Spent vs. Total vs. Remaining buffer. Prevents overspending in real time. |
| **P0 (Critical Path)** | **Contingency Shield (10-15%)** | Locks an untouchable emergency reserve to absorb sudden vendor increases or weather fees. |
| **P0 (Critical Path)** | **Day-of Run-of-Show & Collision Flag** | Minute-by-minute schedule with automatic conflict detection (zero buffers between cues). |
| **P0 (Critical Path)** | **Vendor Pipeline Matrix** | Manages vendors across `Prospect ➔ Contacted ➔ Quoted ➔ Contracted` with cost tracking. |
| **P1 (High Utility)** | **AI Copilot Drawer & Prompt Chips** | Solves decision paralysis with instant cost-cutting suggestions, timeline fixes, and interview questions. |
| **P1 (High Utility)** | **Macro Milestone Horizon** | Groups preparation into clear time horizons (Months, Weeks, Days out) with task completion checkboxes. |
| **P1 (High Utility)** | **Creative Studio** | Generates tailored color palettes, invitation copy, and emotional speech drafts. |
| **P1 (High Utility)** | **Storage Manager (Sync/Export/Import)** | Auto-persists to `localStorage` and enables one-click JSON backup to prevent data loss. |
| **P2 (Delight & Polish)** | **Confetti Celebrations** | Triggers rewarding particle bursts when high-stakes milestones are completed. |
| **P2 (Delight & Polish)** | **Print / PDF Stylesheet** | Provides an ink-friendly, clean physical document for day-of coordinators and venues. |

### 🗑️ Elements Excluded / Pruned:
- **No decorative 3D canvas objects or ungrounded charts:** Consumes GPU without helping the host.
- **No dummy social feeds or attendee avatars:** Non-functional noise.
- **No heavy raster image banners:** Replaced with crisp SVG icons and informative metric cards.

---

## 4. Multi-Breakpoint Responsive Layout Specifications

The design layout transforms purposefully across 5 distinct screen size tiers:

```
+-----------------------------------------------------------------------------------------------+
|                                    BREAKPOINT ADAPTATION SPEC                                 |
+---------------------+-------------------+-------------------+---------------------------------+
| Viewport Tier       | Screen Width      | Layout Structure  | Key UI Transformations          |
+---------------------+-------------------+-------------------+---------------------------------+
| Compact Mobile      | 360px – 480px     | Single column     | - Bottom tab bar                |
|                     |                   |                   | - 1-column stacked cards        |
|                     |                   |                   | - Full-screen modal sheets      |
|                     |                   |                   | - 44x44px minimum touch target  |
+---------------------+-------------------+-------------------+---------------------------------+
| Phablet / Large Mob | 481px – 767px     | 1-to-2 column     | - 2-column HUD metric cards     |
|                     |                   |                   | - Horizontal scroll tab bar     |
|                     |                   |                   | - Compact table rows            |
+---------------------+-------------------+-------------------+---------------------------------+
| Tablet Landscape    | 768px – 1023px    | 2-column grid     | - Split view: content & stats   |
|                     |                   |                   | - Slide-in AI copilot drawer    |
|                     |                   |                   | - 2-column vendor Kanban        |
+---------------------+-------------------+-------------------+---------------------------------+
| Standard Desktop    | 1024px – 1439px   | 3-column deck     | - Persistent HUD header         |
|                     |                   |                   | - Full multi-column tables      |
|                     |                   |                   | - Side-by-side timeline/cues    |
+---------------------+-------------------+-------------------+---------------------------------+
| Ultra-Wide          | 1440px and above  | Centered bounds   | - Max container width 1440px    |
|                     |                   |                   | - Pinned AI insight rail        |
|                     |                   |                   | - Line lengths capped at 75ch   |
+---------------------+-------------------+-------------------+---------------------------------+
```

### Breakpoint Verification Checklist
- **360px:** Check that no horizontal scrollbar appears (`overflow-x: hidden`), text does not clip, and all interactive controls can be tapped with a thumb.
- **480px:** Verify HUD metrics comfortably fit in 2 columns and category badges wrap neatly.
- **768px:** Verify that navigation tabs scroll smoothly and modal dialogs center with adequate padding.
- **1024px:** Verify side-by-side split screen between timeline and run-of-show works without text truncation.
- **1440px+:** Verify container max-width prevents stretched tables and preserves high visual polish.

---

## 5. Accessibility, Motion & Interaction

1. **Accessibility Standards (WCAG 2.1 AA):**
   - Color contrast ratio ≥ 4.5:1 for all readable text.
   - Fully keyboard-operable with logical tab sequencing.
   - Screen-reader accessible landmarks (`<main>`, `<header>`, `<nav>`, `aria-live` for alerts).
2. **Reduced Motion:**
   - Fully respects `@media (prefers-reduced-motion: reduce)` by disabling particle confetti and pulse animations.
3. **Micro-Interactions:**
   - 200ms ease-out hover states on cards (`transform: translateY(-2px)`).
   - Confetti bursts on milestone completion using `@types/canvas-confetti`.
