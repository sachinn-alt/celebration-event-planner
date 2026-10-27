import { describe, it, expect, beforeEach } from 'vitest';
import { AiService } from '../services/aiService';
import { StorageService } from '../services/storage';
import { PRESET_EVENTS } from '../data/presets';
import type { EventPlan } from '../types/event';

describe('AiService & Heuristic Expert Engine', () => {
  beforeEach(() => {
    StorageService.clearMemory();
    StorageService.setApiKey('');
  });

  const weddingEvent = PRESET_EVENTS[0];

  it('flags budget overrun when expenses exceed total budget', () => {
    const overrunEvent: EventPlan = {
      ...weddingEvent,
      budget: {
        ...weddingEvent.budget,
        totalBudget: 10000,
        items: [
          {
            id: 'expensive-venue',
            category: 'venue',
            name: 'Luxury Estate Rental',
            estimatedCost: 15000,
            actualCost: 15000,
            status: 'paid',
          },
        ],
      },
    };

    const insights = AiService.runHeuristicAudit(overrunEvent);
    const deficitInsight = insights.find((i) => i.id === 'audit-budget-overrun');

    expect(deficitInsight).toBeDefined();
    expect(deficitInsight?.severity).toBe('critical');
    expect(deficitInsight?.title).toContain('Budget Deficit');
  });

  it('warns when contingency buffer is below 10%', () => {
    const lowContingencyEvent: EventPlan = {
      ...weddingEvent,
      budget: {
        ...weddingEvent.budget,
        contingencyPercent: 5,
      },
    };

    const insights = AiService.runHeuristicAudit(lowContingencyEvent);
    const contingencyInsight = insights.find((i) => i.id === 'audit-contingency-low');

    expect(contingencyInsight).toBeDefined();
    expect(contingencyInsight?.severity).toBe('warning');
  });

  it('generates structured speech with delivery tips', () => {
    const speech = AiService.generateDeterministicSpeech(weddingEvent, {
      role: 'Maid of Honor',
      tone: 'emotional',
      durationMinutes: 3,
      anecdotes: 'College road trips and late night talks',
    });

    expect(speech.title).toContain('Maid of Honor');
    expect(speech.content).toContain('College road trips');
    expect(speech.deliveryTips.length).toBeGreaterThan(0);
  });

  it('provides archetype-specific cost cutting strategies', () => {
    const weddingStrategies = AiService.getCostCuttingStrategies(weddingEvent);
    expect(weddingStrategies.length).toBeGreaterThan(0);
    expect(weddingStrategies[0].saving).toBeDefined();

    const birthdayEvent = PRESET_EVENTS[1];
    const bdayStrategies = AiService.getCostCuttingStrategies(birthdayEvent);
    expect(bdayStrategies.length).toBeGreaterThan(0);
  });

  it('consultDirector falls back gracefully to Heuristic Engine when offline', async () => {
    const response = await AiService.consultDirector(weddingEvent, 'How can I save money on catering?', 'budget');

    expect(response.strategicAdvice).toBeDefined();
    expect(response.insights.length).toBeGreaterThan(0);
  });
});
