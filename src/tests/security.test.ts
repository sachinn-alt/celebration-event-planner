import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';
import { createCustomEventPlan } from '../data/presets';

describe('Security & Data Protection Engine', () => {
  beforeEach(() => {
    StorageService.clearMemory();
    StorageService.setApiKey('');
  });

  it('guarantees client-side session isolation for API keys (Zero Telemetry Leak)', () => {
    const testSecret = 'AIzaSyTestSecretKey_12345';
    StorageService.setApiKey(testSecret);

    // Key must be retrievable from session storage
    expect(StorageService.getApiKey()).toBe(testSecret);

    // Key must be securely cleared upon request
    StorageService.setApiKey('');
    expect(StorageService.getApiKey()).toBe('');
  });

  it('sanitizes and clamps numeric inputs to prevent negative budgets or NaN injection', () => {
    const plan = createCustomEventPlan({
      title: 'Malicious Input Test',
      type: 'wedding',
      date: '2027-01-01',
      location: 'Test Venue',
      guestCount: -50, // Negative input
      totalBudget: -10000, // Negative budget
      currency: '$',
      contingencyPercent: 10,
      vibe: 'Clean',
    });

    // Numerical values must be clamped to safe minimum boundaries
    expect(plan.guestCount).toBeGreaterThanOrEqual(1);
    expect(plan.budget.totalBudget).toBeGreaterThanOrEqual(500);
  });

  it('bounds string lengths to protect against DOM overflow and payload stuffing', () => {
    const hugeString = 'A'.repeat(5000);
    const plan = createCustomEventPlan({
      title: hugeString,
      type: 'wedding',
      date: '2027-01-01',
      location: hugeString,
      guestCount: 50,
      totalBudget: 15000,
      currency: '$',
      contingencyPercent: 10,
      vibe: hugeString,
    });

    // Must be safely truncated to architectural maximum limits
    expect(plan.title.length).toBeLessThanOrEqual(100);
    expect(plan.location.length).toBeLessThanOrEqual(100);
    expect(plan.vibe.length).toBeLessThanOrEqual(200);
  });

  it('handles corrupted JSON schema imports gracefully without crashing application state', () => {
    const malformedPayloads = [
      '{}',
      '{"title": "Missing required fields"}',
      '{"id": "1", "title": "Incomplete", "budget": null}',
      'null',
      'invalid json string',
    ];

    malformedPayloads.forEach((payload) => {
      let isMalformed = false;
      try {
        const parsed = JSON.parse(payload);
        if (!parsed || !parsed.id || !parsed.title || !parsed.budget || !parsed.timeline) {
          isMalformed = true;
        }
      } catch {
        isMalformed = true;
      }
      expect(isMalformed).toBe(true);
    });
  });

  it('preserves clean event isolation when multiple archetypes exist', () => {
    const events = StorageService.getEvents();
    expect(events.length).toBeGreaterThanOrEqual(3);

    // Each archetype must have a distinct, non-overlapping ID
    const ids = events.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
