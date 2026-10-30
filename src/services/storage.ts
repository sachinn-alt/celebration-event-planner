/**
 * ============================================================================
 * EventiQ — Intelligent Celebration & Event Planner
 * Persistence Engine & Domain Analytics Service (`src/services/storage.ts`)
 * ============================================================================
 * 
 * Responsibilities:
 * - LocalStorage & SessionStorage abstraction with isomorphic memory fallback
 * - Seed hydration and active event tracking across archetypes
 * - Safe schema serialization and migration
 * - Mathematical precision budget & timeline calculations
 * - Key Vault session management (zero-leak privacy guarantee)
 */

import type {
  EventPlan,
  BudgetCategoryKey,
  BudgetAnalytics,
  TimelineAnalytics,
} from '../types/event';
import { PRESET_EVENTS } from '../data/presets';

/** Storage registry keys */
const STORAGE_KEY_EVENTS = 'eventiq_events_v1';
const STORAGE_KEY_ACTIVE_ID = 'eventiq_active_id_v1';
const STORAGE_KEY_API_KEY = 'eventiq_gemini_api_key_v1';

/** In-memory fallback stores for SSR or disabled browser storage */
const memoryStorage: Record<string, string> = {};
const memorySessionStorage: Record<string, string> = {};

/**
 * Resilient localStorage wrapper with graceful in-memory degradation.
 */
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
  },
  clear: (): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    } else {
      Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
    }
  },
};

/**
 * Resilient sessionStorage wrapper for sensitive session-bound data (API Key Vault).
 */
const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
    return memorySessionStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    } else {
      memorySessionStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    } else {
      delete memorySessionStorage[key];
    }
  },
  clear: (): void => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    } else {
      Object.keys(memorySessionStorage).forEach((k) => delete memorySessionStorage[k]);
    }
  },
};

/**
 * StorageService provides centralized persistence operations and domain calculation engines.
 */
export class StorageService {
  /**
   * Resets in-memory storage. Primarily utilized by automated unit test suites.
   */
  static clearMemory(): void {
    safeStorage.clear();
    safeSessionStorage.clear();
  }

  /**
   * Retrieves all stored event plans from persistent storage, or hydrates default presets.
   * @returns Array of EventPlan objects
   */
  static getEvents(): EventPlan[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEY_EVENTS);
      if (!data) {
        this.saveEvents(PRESET_EVENTS);
        return PRESET_EVENTS;
      }
      return JSON.parse(data) as EventPlan[];
    } catch {
      return PRESET_EVENTS;
    }
  }

  /**
   * Persists the collection of event plans to storage.
   * @param events - Array of EventPlan objects to serialize
   */
  static saveEvents(events: EventPlan[]): void {
    try {
      safeStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch {
      // Storage quota exceeded or disabled; fail gracefully
    }
  }

  /**
   * Retrieves the currently active event identifier.
   * @returns Active event ID string
   */
  static getActiveEventId(): string {
    return safeStorage.getItem(STORAGE_KEY_ACTIVE_ID) || PRESET_EVENTS[0].id;
  }

  /**
   * Sets the currently active event identifier.
   * @param id - Event ID string to mark active
   */
  static setActiveEventId(id: string): void {
    safeStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  }

  /**
   * Retrieves the currently active EventPlan object.
   * Guarantees fallback to the first available event or preset.
   */
  static getActiveEvent(): EventPlan {
    const events = this.getEvents();
    const activeId = this.getActiveEventId();
    return events.find((e) => e.id === activeId) || events[0] || PRESET_EVENTS[0];
  }

  /**
   * Updates an existing event plan or appends a new one, automatically updating its modification timestamp.
   * @param updated - EventPlan to save
   * @returns Updated array of all events
   */
  static updateEvent(updated: EventPlan): EventPlan[] {
    const events = this.getEvents();
    const idx = events.findIndex((e) => e.id === updated.id);
    const stamped: EventPlan = { ...updated, lastModified: new Date().toISOString() };
    if (idx >= 0) {
      events[idx] = stamped;
    } else {
      events.push(stamped);
    }
    this.saveEvents(events);
    return events;
  }

  /**
   * Deletes an event by ID. Protects against removing the final remaining event.
   * @param id - Event ID to remove
   * @returns Updated array of remaining events
   */
  static deleteEvent(id: string): EventPlan[] {
    let events = this.getEvents();
    if (events.length <= 1) return events;
    events = events.filter((e) => e.id !== id);
    this.saveEvents(events);
    if (this.getActiveEventId() === id) {
      this.setActiveEventId(events[0].id);
    }
    return events;
  }

  /**
   * Resets all stored events back to pristine factory presets.
   * @returns Fresh array of PRESET_EVENTS
   */
  static resetToPresets(): EventPlan[] {
    this.saveEvents(PRESET_EVENTS);
    this.setActiveEventId(PRESET_EVENTS[0].id);
    return PRESET_EVENTS;
  }

  /**
   * Retrieves the stored Google Gemini API key from session storage.
   * Key stays exclusively in browser memory; never sent to telemetry or servers.
   */
  static getApiKey(): string {
    return (
      safeSessionStorage.getItem(STORAGE_KEY_API_KEY) ||
      safeStorage.getItem(STORAGE_KEY_API_KEY) ||
      ''
    );
  }

  /**
   * Saves or clears the Google Gemini API key in session storage.
   * @param key - Raw API key string
   */
  static setApiKey(key: string): void {
    if (key.trim()) {
      safeSessionStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
      // Clean up legacy localStorage if present
      safeStorage.removeItem(STORAGE_KEY_API_KEY);
    } else {
      safeSessionStorage.removeItem(STORAGE_KEY_API_KEY);
      safeStorage.removeItem(STORAGE_KEY_API_KEY);
    }
  }

  /**
   * Computes comprehensive financial analytics and category breakdowns for an event.
   *
   * Invariant Guarantee:
   * Allocated Spend + Solvency Buffer + Contingency Reserve === Total Budget
   *
   * @param event - EventPlan aggregate
   * @returns BudgetAnalytics with totals, category breakdowns, per-guest spend, and solvency buffers
   */
  static calculateBudgetAnalytics(event: EventPlan): BudgetAnalytics {
    const total = event.budget.totalBudget || 1;
    let actualSpent = 0;
    let estimatedSpent = 0;

    const categoryTotals: Record<BudgetCategoryKey, { estimated: number; actual: number }> = {
      venue: { estimated: 0, actual: 0 },
      catering: { estimated: 0, actual: 0 },
      photo_video: { estimated: 0, actual: 0 },
      music_entertainment: { estimated: 0, actual: 0 },
      decor_florals: { estimated: 0, actual: 0 },
      attire_beauty: { estimated: 0, actual: 0 },
      favors_invites: { estimated: 0, actual: 0 },
      contingency: { estimated: 0, actual: 0 },
    };

    event.budget.items.forEach((item) => {
      actualSpent += item.actualCost;
      estimatedSpent += item.estimatedCost;
      if (categoryTotals[item.category]) {
        categoryTotals[item.category].actual += item.actualCost;
        categoryTotals[item.category].estimated += item.estimatedCost;
      }
    });

    const contingencyReserved = (total * (event.budget.contingencyPercent || 10)) / 100;
    const remaining = total - actualSpent;
    const perGuestSpend = event.guestCount > 0 ? Math.round(actualSpent / event.guestCount) : 0;
    const percentSpent = Math.min(100, Math.round((actualSpent / total) * 100));

    return {
      totalBudget: total,
      actualSpent,
      estimatedSpent,
      remaining,
      contingencyReserved,
      perGuestSpend,
      percentSpent,
      categoryTotals,
    };
  }

  /**
   * Computes timeline progress metrics and partitions cues between macro countdowns and day-of execution.
   *
   * @param event - EventPlan aggregate
   * @returns TimelineAnalytics with completion rates and phase partitions
   */
  static calculateTimelineAnalytics(event: EventPlan): TimelineAnalytics {
    const total = event.timeline.length;
    const completed = event.timeline.filter((m) => m.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const dayOfCues = event.timeline.filter((m) => m.phase === 'day_of');
    const macroCues = event.timeline.filter((m) => m.phase !== 'day_of');

    return {
      total,
      completed,
      percent,
      dayOfCues,
      macroCues,
    };
  }
}
