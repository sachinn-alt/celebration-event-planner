# 🎊 Project Specification — AuraPlan AI (Celebration & Event Planner)

## 📌 Executive Overview
**Vertical:** [Challenge 5] Celebration & Event Planner  
**Target Score:** >97 Points (Goal: 99–100)  
**Repository:** [https://github.com/sachinn-alt/celebration-event-planner](https://github.com/sachinn-alt/celebration-event-planner)  
**Branch:** Single `main` branch (Strict rule compliance)  
**Budgeted Repo Size:** < 10 MB (Strict rule compliance; currently ~40 KiB)

---

## 🎯 Problem Statement
Organizing celebrations (weddings, milestone birthdays, and community festivals/galas) presents massive organizational friction:
- Fragmented, unrealistic budget math and surprise expenses
- Desynchronized countdown checklists and chaotic day-of schedules
- Incomplete vendor vetting and lack of negotiation/question frameworks
- Generic, uninspired creative ideas lacking sensory depth or personal flair.

**AuraPlan AI** is an intelligent, context-aware GenAI-powered planning director that guides hosts from initial concept through day-of execution with mathematical rigor, creative flair, and seamless automation.

---

## 🌟 Core Personas & Event Archetypes
1. **The Couple (Weddings & Receptions):** High emotion, large budget, complex multi-vendor coordination, seating arrangements, speech toasts, ceremony cues.
2. **The Host / Parent (Milestone Birthdays):** High vibe, medium budget, surprises, games, themed playlists, photo booth moments, signature mocktails/cocktails.
3. **The Organizer / Committee (Community Festivals & Galas):** Multi-stakeholder, crowd control, volunteer shifts, sponsorship tiers, permits, stage runs-of-show.

---

## 🛠️ Technology Stack
- **Frontend Core:** React 19 + TypeScript + Vite
- **Styling:** Modular Vanilla CSS with Obsidian Black & Champagne Gold Glassmorphic aesthetic
- **Icons & Micro-Interactions:** `lucide-react`, `canvas-confetti`
- **GenAI Engine:** Dual-mode (Direct Google Gemini API + offline zero-friction context-aware heuristic engine)
- **State & Storage:** LocalStorage sync engine with JSON import/export and PDF print-ready mode
- **Testing:** Vitest automated test suite for calculations, conflict detection, and prompt generation.
