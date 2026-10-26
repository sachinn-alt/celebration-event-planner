import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';
import { PRESET_EVENTS } from '../data/presets';

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
});
