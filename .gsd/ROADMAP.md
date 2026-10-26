# 🗺️ GSD Roadmap — AuraPlan AI

## Phase Breakdown & Execution Pacing

### 🟢 Phase 1: Domain Architecture & Data Models (Day 1)
- [x] Repository initialization & remote sync
- [x] GSD state system initialization (`.gsd/`)
- [ ] TypeScript Domain Interfaces (`src/types/event.ts`)
- [ ] Curated Archetype Presets (`src/data/presets.ts`) for Wedding, Birthday, Gala
- [ ] Persistence Engine & LocalStorage Manager (`src/services/storage.ts`)

### 🟡 Phase 2: Design System & Visual Foundation (Day 2 AM)
- [ ] Obsidian Glassmorphism Design Tokens (`src/index.css`)
- [ ] Header, Event Switcher, and Progress HUD (`src/components/Header.tsx`)
- [ ] Tab Navigation (Overview, Budget, Timeline, Vendors, Creative Studio, Copilot)
- [ ] Confetti Celebration & Notification System

### 🟡 Phase 3: Core Interactive Modules (Day 2 PM & Day 3 AM)
- [ ] Budget Engine with Category Rebalancer & Contingency Shield (`src/components/BudgetModule.tsx`)
- [ ] Dual-Horizon Timeline: Milestone Checklist + Day-Of Run-of-Show (`src/components/TimelineModule.tsx`)
- [ ] Vendor Pipeline Matrix with AI Interview Guides (`src/components/VendorModule.tsx`)
- [ ] Creative Studio: Palette Generator, Invitations, Speeches (`src/components/CreativeStudio.tsx`)

### 🔵 Phase 4: GenAI Copilot & Contextual Decision Engine (Day 3 PM)
- [ ] Gemini API Integration with Secure Key Vault (`src/services/aiService.ts`)
- [ ] Contextual Heuristic Fallback Engine
- [ ] Intelligent Alert Dispatcher (Over-budget warnings, weather contingencies, timeline conflicts)
- [ ] Floating AI Event Director Drawer with Interactive Prompt Chips

### 🟣 Phase 5: Testing, Accessibility & Verification (Day 4 AM)
- [ ] Automated Vitest suite for math, timeline logic, and vendor states
- [ ] Accessibility Audit (WCAG 2.1 AA keyboard navigation, contrast, ARIA)
- [ ] Cross-browser verification

### 🏁 Phase 6: Publication-Grade Documentation & Submission (Day 4 PM)
- [ ] Final `README.md` with system architecture diagrams, approach, logic, and assumptions
- [ ] Final bundle size verification (< 10 MB strict limit)
- [ ] Git cleanliness check on single `main` branch
