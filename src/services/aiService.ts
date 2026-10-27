import type { EventPlan, BudgetCategoryKey, TimelineMilestone } from '../types/event';
import { BUDGET_CATEGORIES } from '../data/presets';
import { StorageService } from './storage';

export interface AgentInsight {
  id: string;
  category: 'budget' | 'timeline' | 'vendor' | 'creative' | 'contingency';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  suggestedAction?: string;
  actionable?: boolean;
}

export interface AiResponse {
  strategicAdvice: string;
  insights: AgentInsight[];
  draftContent?: string;
}

export class AiService {
  /**
   * Evaluates the event plan using the deterministic Heuristic Rule Engine.
   * Completely offline, instant, zero network dependencies.
   */
  static runHeuristicAudit(plan: EventPlan): AgentInsight[] {
    const insights: AgentInsight[] = [];
    const analytics = StorageService.calculateBudgetAnalytics(plan);

    // 1. Overall Budget Solvency Check
    if (analytics.remaining < 0) {
      insights.push({
        id: 'audit-budget-overrun',
        category: 'budget',
        severity: 'critical',
        title: `Budget Deficit: ${plan.budget.currency}${Math.abs(analytics.remaining).toLocaleString()}`,
        description: `Total allocated expenses (${plan.budget.currency}${analytics.actualSpent.toLocaleString()}) exceed the total budget ceiling of ${plan.budget.currency}${analytics.totalBudget.toLocaleString()}.`,
        suggestedAction: 'Review non-essential line items in Decor or Favors to restore positive buffer balance.',
        actionable: true,
      });
    }

    // 2. Contingency Shield Check
    if (plan.budget.contingencyPercent < 10) {
      insights.push({
        id: 'audit-contingency-low',
        category: 'contingency',
        severity: 'warning',
        title: `Contingency Shield Below Safe Threshold (${plan.budget.contingencyPercent}%)`,
        description: `Industry gold standard recommends reserving at least 10–12% to cushion against unexpected vendor service fees, overtime, and weather contingencies.`,
        suggestedAction: 'Increase contingency buffer to at least 10% in the budget manager.',
        actionable: true,
      });
    }

    // 3. Category Allocation Imbalance vs Archetype Benchmarks
    BUDGET_CATEGORIES.forEach((catMeta) => {
      const catSpend = analytics.categoryTotals[catMeta.key]?.actual || 0;
      const catPercent = (catSpend / analytics.totalBudget) * 100;
      const recommended = catMeta.recommendedPercent[plan.type];

      if (catPercent > recommended + 5) {
        insights.push({
          id: `audit-cat-over-${catMeta.key}`,
          category: 'budget',
          severity: 'warning',
          title: `${catMeta.label} Exceeds Benchmark (${Math.round(catPercent)}% vs ${recommended}%)`,
          description: `You have allocated ${Math.round(catPercent)}% of total budget to ${catMeta.label}. For a ${plan.type}, industry standard is ${recommended}%.`,
          suggestedAction: `Audit ${catMeta.label} line items for potential supplier negotiations.`,
          actionable: true,
        });
      }
    });

    // 4. Day-Of Timeline Collisions & Zero-Buffer Transitions
    const timelineConflicts = this.detectTimelineConflicts(plan.timeline);
    timelineConflicts.forEach((conflict, idx) => {
      insights.push({
        id: `audit-timeline-conflict-${idx}`,
        category: 'timeline',
        severity: conflict.type === 'overlap' ? 'critical' : 'warning',
        title: conflict.type === 'overlap' ? 'Day-of Schedule Collision' : 'Zero Buffer Warning',
        description: conflict.message,
        suggestedAction: conflict.suggestion,
        actionable: true,
      });
    });

    // 5. Critical Vendor Sourcing Check
    const criticalCategories: BudgetCategoryKey[] =
      plan.type === 'wedding'
        ? ['venue', 'catering', 'photo_video']
        : plan.type === 'birthday'
        ? ['venue', 'catering', 'music_entertainment']
        : ['venue', 'catering', 'music_entertainment'];

    criticalCategories.forEach((catKey) => {
      const vendorForCat = plan.vendors.filter((v) => v.category === catKey);
      const isSecured = vendorForCat.some((v) => v.status === 'deposit_paid' || v.status === 'confirmed');

      if (!isSecured) {
        const catName = BUDGET_CATEGORIES.find((c) => c.key === catKey)?.label || catKey;
        insights.push({
          id: `audit-vendor-unsecured-${catKey}`,
          category: 'vendor',
          severity: 'warning',
          title: `Critical Vendor Unsecured: ${catName}`,
          description: `No confirmed contract or deposit logged for ${catName}. High-demand vendors book 4–9 months in advance.`,
          suggestedAction: `Advance prospective vendors in the Vendor Pipeline Matrix.`,
          actionable: true,
        });
      }
    });

    // 6. Overdue / Critical Milestones
    const criticalIncomplete = plan.timeline.filter((m) => m.priority === 'critical' && !m.completed);
    if (criticalIncomplete.length > 0) {
      insights.push({
        id: 'audit-milestones-critical',
        category: 'timeline',
        severity: 'info',
        title: `${criticalIncomplete.length} High-Priority Milestones Pending`,
        description: `Key preparation steps including "${criticalIncomplete[0].title}" require your attention.`,
        suggestedAction: 'Review the Milestone Horizon checklist.',
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Minute-by-minute conflict detection engine for Day-Of Run of Show.
   */
  static detectTimelineConflicts(timeline: TimelineMilestone[]): Array<{
    type: 'overlap' | 'zero_buffer';
    message: string;
    suggestion: string;
  }> {
    const conflicts: Array<{ type: 'overlap' | 'zero_buffer'; message: string; suggestion: string }> = [];
    const dayOfItems = timeline.filter((m) => m.phase === 'day_of');

    // Parse timeframes like "14:00 - 15:00" or "14:00"
    const parsed = dayOfItems
      .map((item) => {
        const match = item.timeframe.match(/(\d{1,2}):(\d{2})\s*(?:-\s*(\d{1,2}):(\d{2}))?/);
        if (!match) return null;
        const startMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        let endMin = startMin + 45; // default 45 min if no end time
        if (match[3] && match[4]) {
          endMin = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
        }
        return { item, startMin, endMin };
      })
      .filter((p): p is { item: TimelineMilestone; startMin: number; endMin: number } => p !== null)
      .sort((a, b) => a.startMin - b.startMin);

    for (let i = 0; i < parsed.length - 1; i++) {
      const current = parsed[i];
      const next = parsed[i + 1];

      if (current.endMin > next.startMin) {
        conflicts.push({
          type: 'overlap',
          message: `"${current.item.title}" (${current.item.timeframe}) overlaps with "${next.item.title}" (${next.item.timeframe}) by ${current.endMin - next.startMin} minutes.`,
          suggestion: `Shift "${next.item.title}" start time to at least ${Math.floor(current.endMin / 60)}:${String(current.endMin % 60).padStart(2, '0')}.`,
        });
      } else if (current.endMin === next.startMin) {
        conflicts.push({
          type: 'zero_buffer',
          message: `Zero transition buffer between "${current.item.title}" and "${next.item.title}". Any delay will cascade into the rest of the schedule.`,
          suggestion: `Add a 10–15 minute buffer for guest movement or contingency delays.`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Deterministic Speech Ghostwriter for toasts and remarks.
   */
  static generateDeterministicSpeech(
    plan: EventPlan,
    params: {
      role: string;
      tone: 'humorous' | 'emotional' | 'inspiring' | 'welcoming';
      durationMinutes: number;
      anecdotes?: string;
    }
  ): { title: string; content: string; deliveryTips: string[] } {
    const hostOrCouple =
      plan.type === 'wedding' ? 'the newlyweds' : plan.type === 'birthday' ? 'the guest of honor' : 'our esteemed community';

    let content = '';
    const tips = [
      'Take a deep breath and make direct eye contact with the guest of honor before speaking.',
      'Pause for 2-3 seconds after punchlines or emotional beats to allow room for laughter or applause.',
      'Hold your glass at chest height, then raise it on the closing toast cue.',
    ];

    if (params.tone === 'humorous') {
      content = `Good evening everyone! For those who don’t know me, I’m the ${params.role}. 

When I was first asked to give this speech, I was told to keep it under ${params.durationMinutes} minutes, which is roughly how long it took ${hostOrCouple} to decide on the cocktail menu. [Pause for laughter]

${params.anecdotes ? `I still remember when: ${params.anecdotes}. It was pure chaos, but it proved one undeniable truth: nobody handles life with more style, heart, and undeniable charm.` : `They say the secret to great events is surrounding yourself with people who will make you look good, and looking around this gorgeous room, I'd say the mission has been accomplished with flying colors.`}

All jokes aside, seeing everyone gathered here tonight at ${plan.location} is a testament to how deeply ${hostOrCouple} is loved.

So please, let us all raise our glasses: To unforgettable memories, boundless joy, and celebrating tonight to the absolute fullest. Cheers!`;
    } else if (params.tone === 'emotional') {
      content = `Good evening family and friends. Standing here tonight as the ${params.role}, my heart is completely full.

They say that the greatest celebrations aren’t defined by lavish settings, but by the quiet moments of connection between the people inside them. 

${params.anecdotes ? `Thinking about ${params.anecdotes}, I am reminded of how steadfast, generous, and loving ${hostOrCouple} truly is.` : `Watching the journey unfold leading up to tonight has been one of the greatest privileges of my life.`}

[Look directly at the honoree/couple, pause] Thank you for being our beacon of warmth and grace. May the days ahead be filled with as much light as we feel in this room tonight.

Everyone, please raise your glasses with me: To love, to lifelong friendship, and to the wonderful journey ahead. Cheers!`;
    } else if (params.tone === 'inspiring') {
      content = `Welcome honored guests and friends. Tonight marks not just a gathering, but a milestone celebration of purpose, resilience, and fellowship.

As the ${params.role}, I want to acknowledge every volunteer, partner, and supporter who made this evening at ${plan.location} possible. 

${params.anecdotes ? `When we reflect on: ${params.anecdotes}, we see the tangible power of community in action.` : `When passionate people unite around a shared vision, extraordinary celebrations take flight.`}

Let this evening remind us that our brightest chapters are still ahead. 

Please raise your glasses: To our shared community, to transformative milestones, and to an extraordinary night together!`;
    } else {
      // Welcoming
      content = `Good evening and welcome everyone! On behalf of the entire host team, thank you so much for joining us tonight.

We have guests who have traveled near and far to be here, and your presence transforms this gathering into a true celebration.

Tonight is all about magnificent food, great music, and creating memories that will outlast the evening. 

${params.anecdotes ? `As a quick reminder of why we're here: ${params.anecdotes}.` : `Please relax, enjoy the wine, and celebrate with us.`}

Let’s raise a glass: To good company, warm laughter, and a night to remember!`;
    }

    return {
      title: `${params.role}'s ${params.tone.toUpperCase()} Speech (${params.durationMinutes} min)`,
      content,
      deliveryTips: tips,
    };
  }

  /**
   * Deterministic Cost-Cutting Strategies based on Archetype.
   */
  static getCostCuttingStrategies(plan: EventPlan): Array<{ title: string; saving: string; tip: string }> {
    if (plan.type === 'wedding') {
      return [
        {
          title: 'Repurpose Ceremony Florals to Reception Tables',
          saving: '$800 – $1,500',
          tip: 'Ask your florist or coordinator to move aisle arrangements and arbor greenery to the head table and bar during cocktail hour.',
        },
        {
          title: 'BYO Alcohol with Corkage Fee Negotiation',
          saving: '$1,200 – $2,500',
          tip: 'Purchasing wine directly from distributors or local vineyards and paying a flat $15/bottle corkage often saves 40% over hotel open-bar packages.',
        },
        {
          title: 'Sheet Cake Behind the Scenes',
          saving: '$400 – $700',
          tip: 'Order a small, exquisite 2-tier display cake for cake-cutting photos, paired with matching kitchen sheet cakes for guest dessert service.',
        },
      ];
    } else if (plan.type === 'birthday') {
      return [
        {
          title: 'Curated Signature Cocktail Duo',
          saving: '$600 – $1,200',
          tip: 'Limit the bar to two custom themed cocktails (plus beer and wine) rather than a full liquor well to cut ingredient spoilage and bartender prep time.',
        },
        {
          title: 'Digital Invitations with Velvet Foil Keepsake',
          saving: '$300 – $600',
          tip: 'Send luxury animated digital invites (Paperless Post or custom web) while printing only 10 commemorative keepsake suites for VIPs and photo memories.',
        },
        {
          title: 'Strategic Lighting Over Structural Decor',
          saving: '$500 – $1,000',
          tip: 'Warm amber uplighting and candle groupings transform an empty venue with far greater visual impact and lower cost than floral centerpieces.',
        },
      ];
    } else {
      return [
        {
          title: 'In-Kind Beverage & Audio Sponsorships',
          saving: '$2,000 – $5,000',
          tip: 'Offer local breweries and AV production companies prominent program booklet logo placements and VIP tickets in exchange for donated hospitality.',
        },
        {
          title: 'Staggered Performer Roster',
          saving: '$1,000 – $2,000',
          tip: 'Contract local jazz ensembles for early reception doors and reserve the headline DJ strictly for the final 2.5 hours of open dancing.',
        },
        {
          title: 'Digital Auction Catalog & QR Bidding',
          saving: '$800 – $1,500',
          tip: 'Eliminate heavy multi-page color printed auction programs in favor of elegant tabletop QR cards linking to mobile bidding platforms.',
        },
      ];
    }
  }

  /**
   * Main query entry point: checks if Live Gemini API key exists, otherwise executes Heuristic Engine.
   */
  static async consultDirector(
    plan: EventPlan,
    prompt: string,
    currentTab: string
  ): Promise<AiResponse> {
    const apiKey = StorageService.getApiKey();

    if (apiKey) {
      try {
        const liveResult = await this.callGeminiApi(apiKey, plan, prompt, currentTab);
        return liveResult;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to heuristic engine:', err);
      }
    }

    // Heuristic Engine Fallback
    return this.consultHeuristicDirector(plan, prompt, currentTab);
  }

  /**
   * Live Gemini 1.5 Flash endpoint call with timeout & resilient JSON parsing.
   */
  private static async callGeminiApi(
    apiKey: string,
    plan: EventPlan,
    userPrompt: string,
    currentTab: string
  ): Promise<AiResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const contextPayload = {
      archetype: plan.type,
      title: plan.title,
      date: plan.date,
      guestCount: plan.guestCount,
      totalBudget: plan.budget.totalBudget,
      currency: plan.budget.currency,
      contingencyPercent: plan.budget.contingencyPercent,
      activeTab: currentTab,
      itemsCount: plan.budget.items.length,
      milestonesCount: plan.timeline.length,
      vendorsCount: plan.vendors.length,
    };

    const systemInstruction = `You are the EventiQ Director, an elite celebration producer. You provide mathematically grounded, culturally attuned, and actionable event advice.
Respond strictly in JSON matching this schema:
{
  "strategicAdvice": "Direct, executive summary of your advice",
  "insights": [
    {
      "category": "budget" | "timeline" | "vendor" | "creative" | "contingency",
      "severity": "info" | "warning" | "critical",
      "title": "Short title",
      "description": "Concrete explanation",
      "suggestedAction": "Immediate step"
    }
  ],
  "draftContent": "Optional ready-to-use speech or copy if requested"
}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nEVENT CONTEXT:\n${JSON.stringify(contextPayload)}\n\nUSER PROMPT:\n${userPrompt}` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Empty response from Gemini API');
    }

    // Clean JSON markdown fences if present
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      strategicAdvice: parsed.strategicAdvice || 'Strategic audit complete.',
      insights: (parsed.insights || []).map((ins: AgentInsight, idx: number) => ({
        id: `gemini-insight-${idx}-${Date.now()}`,
        category: ins.category || 'budget',
        severity: ins.severity || 'info',
        title: ins.title || 'Event Recommendation',
        description: ins.description || '',
        suggestedAction: ins.suggestedAction,
        actionable: true,
      })),
      draftContent: parsed.draftContent,
    };
  }

  /**
   * Deterministic Copilot Advice Generator.
   */
  private static consultHeuristicDirector(
    plan: EventPlan,
    userPrompt: string,
    _currentTab: string
  ): AiResponse {
    const auditInsights = this.runHeuristicAudit(plan);
    const pLower = userPrompt.toLowerCase();

    // Case 1: Speech / Toast request
    if (pLower.includes('speech') || pLower.includes('toast') || pLower.includes('roast')) {
      const speech = this.generateDeterministicSpeech(plan, {
        role: plan.type === 'wedding' ? 'Maid of Honor / Best Man' : 'Event Host',
        tone: pLower.includes('funny') || pLower.includes('humor') ? 'humorous' : 'emotional',
        durationMinutes: 3,
        anecdotes: 'Our unforgettable road trip and always being the life of the party',
      });

      return {
        strategicAdvice: `I have crafted a bespoke 3-minute toast tailored to ${plan.title}. It features structured storytelling beats, delivery pauses, and a stirring closing toast cue.`,
        insights: [
          {
            id: 'heuristic-speech-01',
            category: 'creative',
            severity: 'info',
            title: 'Toast Framework Ready',
            description: 'Structured to balance lighthearted warmth with genuine emotional resonance.',
            suggestedAction: 'Review and customize the text in Creative Studio.',
            actionable: true,
          },
        ],
        draftContent: speech.content,
      };
    }

    // Case 2: Budget or savings request
    if (pLower.includes('save') || pLower.includes('cut') || pLower.includes('budget') || pLower.includes('rebalance')) {
      const strategies = this.getCostCuttingStrategies(plan);
      return {
        strategicAdvice: `Analyzed your ${plan.budget.currency}${plan.budget.totalBudget.toLocaleString()} budget. Here are 3 tactical, high-impact cost optimizations that preserve guest luxury:`,
        insights: strategies.map((s, idx) => ({
          id: `heuristic-saving-${idx}`,
          category: 'budget',
          severity: 'info',
          title: `${s.title} (Est. Saving: ${s.saving})`,
          description: s.tip,
          suggestedAction: 'Apply recommended adjustment to line items.',
          actionable: true,
        })),
      };
    }

    // Case 3: Timeline audit or schedule collision request
    if (pLower.includes('timeline') || pLower.includes('schedule') || pLower.includes('collision') || pLower.includes('buffer')) {
      const conflicts = this.detectTimelineConflicts(plan.timeline);
      return {
        strategicAdvice: conflicts.length
          ? `Detected ${conflicts.length} timeline friction points in your Day-of Run of Show. Resolving these now prevents day-of schedule collapse.`
          : 'Your Day-of Run of Show is well sequenced with healthy transition buffers between key moments.',
        insights: auditInsights.filter((i) => i.category === 'timeline'),
      };
    }

    // Default Case: Comprehensive executive audit
    return {
      strategicAdvice: `EventiQ Director audit for "${plan.title}": Financial allocation is at ${StorageService.calculateBudgetAnalytics(plan).percentSpent}% of total budget. ${auditInsights.length} operational recommendations flagged below.`,
      insights: auditInsights,
    };
  }
}
