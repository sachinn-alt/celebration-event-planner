# 🗺️ GSD Roadmap — EventiQ

## Phase Breakdown & Execution Status

### 🟢 Phase 1: Domain Architecture & Data Models (Complete)
- [x] Repository initialization & remote sync
- [x] GSD state system initialization (`.gsd/`)
- [x] TypeScript Domain Interfaces (`src/types/event.ts`)
- [x] Curated Archetype Presets (`src/data/presets.ts`) for Wedding, Birthday, Gala
- [x] Persistence Engine & LocalStorage Manager (`src/services/storage.ts`)

### 🟢 Phase 2: Design System & Visual Foundation (Complete)
- [x] Obsidian Glassmorphism Design Tokens (`src/index.css`)
- [x] Header, Event Switcher, and Progress HUD (`src/components/Header.tsx`)
- [x] Tab Navigation (Budget, Timeline, Vendors, Creative Studio)
- [x] Confetti Celebration & Notification System (`canvas-confetti`)

### 🟢 Phase 3: Core Interactive Modules (Complete)
- [x] Budget Engine with Category Rebalancer & Contingency Shield (`src/components/BudgetModule.tsx`)
- [x] Dual-Horizon Timeline: Milestone Checklist + Day-Of Run-of-Show (`src/components/TimelineModule.tsx`)
- [x] Vendor Pipeline Matrix with AI Interview Guides (`src/components/VendorModule.tsx`)
- [x] Creative Studio: Palette Generator, Invitations, Speeches (`src/components/CreativeStudio.tsx`)

### 🟢 Phase 4: GenAI Copilot & Contextual Decision Engine (Complete)
- [x] Gemini API Integration with Secure Key Vault (`src/services/aiService.ts`, `src/components/ApiKeyModal.tsx`)
- [x] Contextual Heuristic Fallback Engine with zero-network resilience
- [x] Intelligent Alert Dispatcher (Over-budget warnings, buffer collisions, vendor checks)
- [x] Floating AI Event Director Drawer with Interactive Prompt Chips (`src/components/AiCopilot.tsx`)

### 🟢 Phase 5: Testing, Accessibility & Verification (Complete)
- [x] Automated Vitest suite (16/16 tests passing across 4 test suites: storage, budget, timeline, aiService)
- [x] Oxlint static analysis passing with 0 warnings and 0 errors
- [x] Production build verified (`dist/assets/index.js` ~108 kB gzipped)
- [x] Responsive layout verified across mobile, tablet, and desktop viewports
- [x] Ink-friendly print stylesheet (`@media print`)

### 🟢 Phase 6: Publication-Grade Documentation & Submission (Complete)
- [x] Specification documents: `plan.md`, `prd.md`, `trd.md`, `design.md`, `agent.md`, `llm.md`
- [x] Repository footprint safe under 10 MB limit
- [x] Dev server active on `http://localhost:5173/`

### 🟢 Phase 7: Custom Atelier Engine & Motion Polish (Complete)
- [x] "Create Custom Event" Wizard (`src/components/CreateEventModal.tsx`) with archetype auto-seeding
- [x] Real-time benchmark allocation preview across Wedding, Birthday, and Gala archetypes
- [x] Aceternity UI sliding pill navigation tabs (`layoutId="activeTabPill"`)
- [x] Aceternity shimmer button and ambient grid pattern (`.shimmer-btn`, `.bg-ambient-grid`)
- [x] Skiper UI & Framer Motion spring physics on modals, drawer, and HUD cards
- [x] Vitest suite extended to 17/17 passing tests including custom event lifecycle
- [x] Deployed live to production on Vercel at `https://eventiq-kappa.vercel.app/`
