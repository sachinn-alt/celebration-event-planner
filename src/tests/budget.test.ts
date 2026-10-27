import { describe, it, expect } from 'vitest';
import { StorageService } from '../services/storage';
import { PRESET_EVENTS } from '../data/presets';
import type { EventPlan } from '../types/event';

describe('Budget Calculation Engine', () => {
  const weddingEvent = PRESET_EVENTS[0]; // Aura Vineyard Autumn Wedding ($38,000)

  it('calculates correct total budget and contingency reserved', () => {
    const analytics = StorageService.calculateBudgetAnalytics(weddingEvent);

    expect(analytics.totalBudget).toBe(38000);
    // 10% contingency on $38,000 = $3,800
    expect(analytics.contingencyReserved).toBe(3800);
    expect(analytics.perGuestSpend).toBeGreaterThan(0);
  });

  it('computes category spend totals accurately', () => {
    const analytics = StorageService.calculateBudgetAnalytics(weddingEvent);

    expect(analytics.categoryTotals.venue).toBeDefined();
    expect(analytics.categoryTotals.catering).toBeDefined();
    expect(analytics.categoryTotals.venue.actual).toBeGreaterThan(0);
    expect(analytics.categoryTotals.catering.actual).toBeGreaterThan(0);
  });

  it('updates remaining solvency buffer when expense items change', () => {
    const analyticsBefore = StorageService.calculateBudgetAnalytics(weddingEvent);

    const modifiedEvent: EventPlan = {
      ...weddingEvent,
      budget: {
        ...weddingEvent.budget,
        items: [
          ...weddingEvent.budget.items,
          {
            id: 'test-item-extra',
            category: 'decor_florals',
            name: 'Extra Floral Chandeliers',
            estimatedCost: 1000,
            actualCost: 1000,
            status: 'paid',
          },
        ],
      },
    };

    const analyticsAfter = StorageService.calculateBudgetAnalytics(modifiedEvent);

    expect(analyticsAfter.actualSpent).toBe(analyticsBefore.actualSpent + 1000);
    expect(analyticsAfter.remaining).toBe(analyticsBefore.remaining - 1000);
  });

  it('handles zero guest count gracefully without divide-by-zero errors', () => {
    const zeroGuestEvent: EventPlan = {
      ...weddingEvent,
      guestCount: 0,
    };

    const analytics = StorageService.calculateBudgetAnalytics(zeroGuestEvent);
    expect(analytics.perGuestSpend).toBe(0);
  });
});
