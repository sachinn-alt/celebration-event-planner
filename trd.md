# ⚙️ Technical Requirements Document (`trd.md`)

## 1. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                              Client Web Browser                                   |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           React 19 Component Tree                           |  |
|  |                                                                             |  |
|  |  +-------------------+  +-------------------+  +-------------------------+  |  |
|  |  |   Header & HUD    |  |  Event Switcher   |  |   Module Tab Navigator  |  |  |
|  |  +-------------------+  +-------------------+  +-------------------------+  |  |
|  |                                                                             |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  |  Active Module View: Budget | Timeline | Vendors | Creative Studio   |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |                                                                             |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  |           Floating AI Event Director Drawer & Copilot Console         |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
|                                        |                                          |
|        +-------------------------------+-------------------------------+          |
|        v                                                               v          |
|  +---------------------------+                               +-----------------+  |
|  |   Storage Engine Manager  |                               |   AI Director   |  |
|  |   (LocalStorage + Export) |                               |     Service     |  |
|  +---------------------------+                               +-----------------+  |
|                |                                              /                \  |
|                v                                             v                  v |
|      [ Browser Storage ]                           [ Gemini API ]    [ Local Rule ]
|      (Key: `eventiq_state_v1`)                      (Direct HTTPS)   (Heuristics) 
+-----------------------------------------------------------------------------------+
```

### Technology Specification
- **Runtime / Framework:** React 19 (`react`, `react-dom`) with modern Hooks (`useMemo`, `useCallback`, `useState`, `useEffect`).
- **Language:** TypeScript 5.8+ with `strict: true`, `noImplicitAny: true`, and strict null checks.
- **Bundler & Dev Server:** Vite 6+ (`@vitejs/plugin-react`).
- **Styling Architecture:** Pure Vanilla CSS with CSS Custom Properties (Design Tokens), Glassmorphic backdrop filters, and responsive Grid/Flexbox layouts. No heavy runtime CSS-in-JS dependencies.
- **Icons & Micro-Interactions:** `lucide-react` (tree-shaken ES modules) and `canvas-confetti` (for celebration milestone rewards).
- **Test Runner:** Vitest with fast in-memory execution.
- **Linting:** Oxlint (`.oxlintrc.json`) for sub-second, zero-dependency static analysis.

---

## 2. Core Domain Contracts (`src/types/event.ts`)

```typescript
export type EventType = 'wedding' | 'birthday' | 'community';

export type BudgetCategoryKey =
  | 'venue'
  | 'catering'
  | 'photo_video'
  | 'music_entertainment'
  | 'decor_florals'
  | 'attire_beauty'
  | 'favors_invites'
  | 'contingency';

export type ExpenseStatus = 'estimated' | 'quoted' | 'paid';

export interface BudgetItem {
  id: string;
  category: BudgetCategoryKey;
  name: string;
  estimatedCost: number;
  actualCost: number;
  status: ExpenseStatus;
  notes?: string;
  isContingency?: boolean;
}

export interface EventBudget {
  totalBudget: number;
  currency: string;
  contingencyPercent: number; // e.g. 10
  items: BudgetItem[];
}

export type TimelinePhase =
  | 'macro_months'   // 6-12 months out
  | 'macro_weeks'    // 2-8 weeks out
  | 'countdown_days' // 1-7 days out
  | 'day_of';        // Day-of minute-by-minute run of show

export interface TimelineMilestone {
  id: string;
  phase: TimelinePhase;
  timeframe: string;
  title: string;
  description: string;
  category: BudgetCategoryKey | 'general' | 'ceremony' | 'logistics';
  completed: boolean;
  priority: 'critical' | 'normal' | 'optional';
  assignedTo?: string;
  completedAt?: string;
}

export type VendorStatus = 'prospect' | 'contacted' | 'quoted' | 'contracted' | 'declined';

export interface Vendor {
  id: string;
  name: string;
  category: BudgetCategoryKey;
  status: VendorStatus;
  contactPerson?: string;
  email?: string;
  phone?: string;
  estimatedCost: number;
  contractValue?: number;
  rating: number; // 1-5
  notes?: string;
}

export interface EventPalette {
  name: string;
  colors: string[]; // 4-5 hex strings
  mood: string;
}

export interface CreativeAssets {
  themeName: string;
  palette: EventPalette;
  invitationDrafts: Array<{
    tone: 'elegant' | 'joyful' | 'formal' | 'playful';
    headline: string;
    body: string;
  }>;
  speechDrafts: Array<{
    role: string;
    title: string;
    durationMinutes: number;
    text: string;
  }>;
}

export interface EventPlan {
  id: string;
  type: EventType;
  title: string;
  date: string;
  location: string;
  guestCount: number;
  budget: EventBudget;
  timeline: TimelineMilestone[];
  vendors: Vendor[];
  creative: CreativeAssets;
  lastUpdated: string;
}
```

---

## 3. Mathematical & Algorithmic Engines

### 3.1 Budget Rebalancing & Contingency Shield Algorithm
The budget calculation engine monitors category expenditures against target benchmarks:
$$\text{Total Allocated} = \sum_{i \in \text{Items}} \text{effectiveCost}(i)$$
$$\text{Contingency Reserve} = \text{Total Budget} \times \left( \frac{\text{Contingency Percent}}{100} \right)$$
$$\text{Available Spend Pool} = \text{Total Budget} - \text{Contingency Reserve}$$

For any category $c$:
$$\text{Category Allocation \%} = \frac{\sum_{i \in \text{Items}_c} \text{effectiveCost}(i)}{\text{Total Budget}} \times 100$$

If $\text{Category Allocation \%} > \text{Recommended \%} + 5\%$, the engine dispatches a high-priority warning flag to the AI Copilot.

### 3.2 Timeline Conflict & Buffer Detection
For Day-Of events, time ranges are converted into normalized Unix minutes from midnight:
$$T_{\text{start}}(m) = \text{Hour} \times 60 + \text{Minute}$$
$$T_{\text{end}}(m) = T_{\text{start}}(m) + \text{DurationMinutes}$$

The conflict engine evaluates adjacent milestones $m_k, m_{k+1}$:
$$\text{Buffer}(m_k, m_{k+1}) = T_{\text{start}}(m_{k+1}) - T_{\text{end}}(m_k)$$
- If $\text{Buffer} < 0$: **Collision Detected** (Overlap error).
- If $\text{Buffer} == 0$ and $m_{k+1}$ requires venue transition: **Warning** (Zero buffer anomaly).

### 3.3 Vendor Scoring & Status Aggregation
Vendors are weighted using a normalized multi-criteria formula:
$$\text{Vendor Score} = (\text{Rating} \times 0.5) + (\text{Cost Efficiency} \times 0.3) + (\text{Status Weight} \times 0.2)$$

---

## 4. Storage Engine & Resilience Strategy

- **Storage Key:** `eventiq_state_v1`
- **Schema Validation:** On load, incoming data is checked against required keys (`id`, `type`, `budget`, `timeline`, `vendors`, `creative`). If corrupted or empty, automatically initializes from the pristine archetype preset (`src/data/presets.ts`).
- **Data Export:** Serializes the entire event into a formatted, human-readable `.json` file (`eventiq-[event-type]-[date].json`).
- **Data Import:** Validates file structure using strict typing with defensive fallbacks to prevent runtime exceptions.
- **Print / Export Ready:** Includes CSS `@media print` rules enabling clean, single-click PDF generation of the executive summary, day-of run of show, and budget breakdown.

---

## 5. Security & Privacy Architecture

- **Client-Side Key Vault:**
  - Gemini API keys are entered via a password-masked modal input.
  - Stored strictly in `sessionStorage` or optional user-consented `localStorage`.
  - Never sent to any intermediary server or analytics endpoints.
  - Sanitized before passing to headers (`Authorization: Bearer` or `?key=`).
- **Output Sanitization:**
  - AI responses rendered using strict React JSX text interpolation to prevent cross-site scripting (XSS).
  - Prompts use system boundaries to prevent prompt injection.

---

## 6. Testing Strategy & Quality Assurance

- **Framework:** Vitest (`npm test`).
- **Automated Test Matrix:**
  1. `storage.test.ts`: Verify initial preset loading, JSON persistence, and corrupted state recovery.
  2. `budget.test.ts`: Verify total budget math, category percentage distributions, and contingency reserve protection.
  3. `timeline.test.ts`: Verify day-of minute parsing, conflict detection, and completion percentage calculation.
  4. `aiService.test.ts`: Verify prompt formatting, heuristic fallback response schemas, and error handling.
- **Target Coverage:** > 90% coverage on core calculation engines and utility functions.

---

## 7. Performance & Resource Footprint Management
- Strict avoidance of heavy UI frameworks or component libraries (zero AntD, MUI, or Bootstrap bloat).
- Bundle size target: `< 150 KiB` gzipped.
- Entire repository size guaranteed `< 10 MB` by forbidding uncompressed binary assets.
