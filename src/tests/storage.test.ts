import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';
import { PRESET_EVENTS, createCustomEventPlan } from '../data/presets';

describe('StorageService and Budget Analytics', () => {
  beforeEach(() => {
    StorageService.clearMemory();
  });

  it('should load preset events on fresh initialization', () => {
    const events = StorageService.getEvents();
    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events[0].type).toBe('wedding');
    expect(events[1].type).toBe('birthday');
    expect(events[2].type).toBe('community');
  });

  it('should calculate budget analytics accurately for autumn wedding', () => {
    const wedding = PRESET_EVENTS[0];
    const analytics = StorageService.calculateBudgetAnalytics(wedding);

    expect(analytics.totalBudget).toBe(38000);
    expect(analytics.actualSpent).toBeGreaterThan(0);
    expect(analytics.remaining).toBe(analytics.totalBudget - analytics.actualSpent);
    expect(analytics.perGuestSpend).toBe(Math.round(analytics.actualSpent / wedding.guestCount));
    expect(analytics.categoryTotals.venue.actual).toBe(13500);
  });

  it('should calculate timeline progress accurately', () => {
    const wedding = PRESET_EVENTS[0];
    const timelineAnalytics = StorageService.calculateTimelineAnalytics(wedding);

    expect(timelineAnalytics.total).toBe(wedding.timeline.length);
    expect(timelineAnalytics.completed).toBeGreaterThan(0);
    expect(timelineAnalytics.percent).toBe(
      Math.round((timelineAnalytics.completed / timelineAnalytics.total) * 100)
    );
    expect(timelineAnalytics.dayOfCues.length).toBeGreaterThan(0);
  });

  it('should create custom event plan with proper archetype benchmark scaling', () => {
    const custom = createCustomEventPlan({
      title: "Maya & Ethan's Coastal Wedding",
      type: 'wedding',
      date: '2027-06-20',
      location: 'Big Sur, CA',
      guestCount: 150,
      totalBudget: 50000,
      currency: '$',
      contingencyPercent: 12,
      vibe: 'Ocean breeze & acoustic strings',
    });

    expect(custom.id).toContain('custom-');
    expect(custom.title).toBe("Maya & Ethan's Coastal Wedding");
    expect(custom.budget.totalBudget).toBe(50000);
    expect(custom.budget.contingencyPercent).toBe(12);
    expect(custom.budget.items.length).toBeGreaterThanOrEqual(5);
    expect(custom.timeline.length).toBeGreaterThanOrEqual(8);
    expect(custom.vendors.length).toBeGreaterThanOrEqual(3);
    expect(custom.creative.palette.length).toBe(5);

    // Save and retrieve
    const updatedEvents = StorageService.updateEvent(custom);
    expect(updatedEvents.find((e) => e.id === custom.id)).toBeDefined();

    // Delete custom event
    const afterDelete = StorageService.deleteEvent(custom.id);
    expect(afterDelete.find((e) => e.id === custom.id)).toBeUndefined();
  });
});
