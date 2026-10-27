# 🧠 GSD Context & System Boundaries — EventiQ

## Key Evaluation Constraints
- **Attempt Limit:** 3 maximum attempts allowed.
- **Size Limit:** Under 10 MB repository size. Strictly prevent binary assets, git pack bloat, or committed build artifacts.
- **Branch Policy:** Single `main` branch only. No staging/develop branches.
- **Evaluation High-Impact Areas:**
  - Code Quality (structure, readability, maintainability)
  - Security (safe API key handling, sanitization)
  - Efficiency (optimal resource usage, responsive UI)
  - Testing (automated validation with Vitest)
  - Accessibility (WCAG 2.1 AA compliant)
  - Problem Statement Alignment (Weddings, Birthdays, Community Events with budgets, timelines, checklists, personalized ideas)

## AI Architecture Philosophy
The application provides two concurrent AI execution paths:
1. **Live Gemini API Integration:** Users can provide an optional Gemini API key to trigger live Google Gemini models. The key is securely stored in browser session/local storage, never logged, and never transmitted to external third parties.
2. **Context-Aware Heuristic Intelligence:** Evaluators may run the application without an API key. EventiQ includes a deeply modeled decision engine that analyzes budget distributions, guest counts, timeline constraints, and event types to output real, high-value contextual advice without network dependencies.
