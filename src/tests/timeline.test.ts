import { describe, it, expect } from 'vitest';
import { StorageService } from '../services/storage';
import { AiService } from '../services/aiService';
import { PRESET_EVENTS } from '../data/presets';
import type { TimelineMilestone } from '../types/event';

describe('Timeline & Conflict Detection Engine', () => {
  const weddingEvent = PRESET_EVENTS[0];

  it('calculates completion percentage and segregates phases', () => {
    const analytics = StorageService.calculateTimelineAnalytics(weddingEvent);

    expect(analytics.total).toBe(weddingEvent.timeline.length);
    expect(analytics.macroCues.length).toBeGreaterThan(0);
    expect(analytics.dayOfCues.length).toBeGreaterThan(0);
    expect(analytics.percent).toBeGreaterThanOrEqual(0);
    expect(analytics.percent).toBeLessThanOrEqual(100);
  });

  it('detects schedule overlaps between conflicting cues', () => {
    const overlappingTimeline: TimelineMilestone[] = [
      {
        id: 'cue-1',
        phase: 'day_of',
        timeframe: '14:00 - 15:00',
        title: 'Ceremony Processional',
        description: 'Vows exchange',
        category: 'ceremony',
        completed: false,
        priority: 'critical',
      },
      {
        id: 'cue-2',
        phase: 'day_of',
        timeframe: '14:30 - 15:30',
        title: 'Cocktail Hour Kickoff',
        description: 'Drinks served at lawn',
        category: 'catering',
        completed: false,
        priority: 'normal',
      },
    ];

    const conflicts = AiService.detectTimelineConflicts(overlappingTimeline);

    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('overlap');
    expect(conflicts[0].message).toContain('overlaps');
  });

  it('detects zero buffer transitions between back-to-back cues', () => {
    const zeroBufferTimeline: TimelineMilestone[] = [
      {
        id: 'cue-1',
        phase: 'day_of',
        timeframe: '15:00 - 16:00',
        title: 'Cocktail Hour',
        description: 'Appetizers and champagne',
        category: 'catering',
        completed: false,
        priority: 'normal',
      },
      {
        id: 'cue-2',
        phase: 'day_of',
        timeframe: '16:00 - 17:00',
        title: 'Plated Dinner Seating',
        description: 'Grand entrance and seating',
        category: 'catering',
        completed: false,
        priority: 'critical',
      },
    ];

    const conflicts = AiService.detectTimelineConflicts(zeroBufferTimeline);

    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('zero_buffer');
    expect(conflicts[0].message).toContain('Zero transition buffer');
  });

  it('reports zero conflicts when cues have healthy buffers', () => {
    const healthyTimeline: TimelineMilestone[] = [
      {
        id: 'cue-1',
        phase: 'day_of',
        timeframe: '14:00 - 15:00',
        title: 'Ceremony',
        description: 'Ceremony session',
        category: 'ceremony',
        completed: false,
        priority: 'critical',
      },
      {
        id: 'cue-2',
        phase: 'day_of',
        timeframe: '15:20 - 16:30',
        title: 'Cocktails',
        description: '20 min transit buffer before cocktails',
        category: 'catering',
        completed: false,
        priority: 'normal',
      },
    ];

    const conflicts = AiService.detectTimelineConflicts(healthyTimeline);
    expect(conflicts.length).toBe(0);
  });
});
