import type { EventPlan, BudgetCategoryKey } from '../types/event';
import { PRESET_EVENTS } from '../data/presets';

const STORAGE_KEY_EVENTS = 'eventiq_events_v1';
const STORAGE_KEY_ACTIVE_ID = 'eventiq_active_id_v1';
const STORAGE_KEY_API_KEY = 'eventiq_gemini_api_key_v1';

const memoryStorage: Record<string, string> = {};

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

export class StorageService {
  static clearMemory(): void {
    safeStorage.clear();
  }

  static getEvents(): EventPlan[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEY_EVENTS);
      if (!data) {
        this.saveEvents(PRESET_EVENTS);
        return PRESET_EVENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse events from storage, returning presets:', e);
      return PRESET_EVENTS;
    }
  }

  static saveEvents(events: EventPlan[]): void {
    try {
      safeStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to storage:', e);
    }
  }

  static getActiveEventId(): string {
    return safeStorage.getItem(STORAGE_KEY_ACTIVE_ID) || PRESET_EVENTS[0].id;
  }

  static setActiveEventId(id: string): void {
    safeStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  }

  static getActiveEvent(): EventPlan {
    const events = this.getEvents();
    const activeId = this.getActiveEventId();
    return events.find((e) => e.id === activeId) || events[0] || PRESET_EVENTS[0];
  }

  static updateEvent(updated: EventPlan): EventPlan[] {
    const events = this.getEvents();
    const idx = events.findIndex((e) => e.id === updated.id);
    const stamped = { ...updated, lastModified: new Date().toISOString() };
    if (idx >= 0) {
      events[idx] = stamped;
    } else {
      events.push(stamped);
    }
    this.saveEvents(events);
    return events;
  }

  static resetToPresets(): EventPlan[] {
    this.saveEvents(PRESET_EVENTS);
    this.setActiveEventId(PRESET_EVENTS[0].id);
    return PRESET_EVENTS;
  }

  static getApiKey(): string {
    return safeStorage.getItem(STORAGE_KEY_API_KEY) || '';
  }

  static setApiKey(key: string): void {
    if (key.trim()) {
      safeStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
    } else {
      safeStorage.removeItem(STORAGE_KEY_API_KEY);
    }
  }

  // --- Analytical Calculations ---
  static calculateBudgetAnalytics(event: EventPlan) {
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

  static calculateTimelineAnalytics(event: EventPlan) {
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
