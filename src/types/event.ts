/**
 * ============================================================================
 * EventiQ — Intelligent Celebration & Event Planner
 * Domain Model Definitions & Core Contracts (`src/types/event.ts`)
 * ============================================================================
 * 
 * Domain-Driven Design (DDD) specifications for celebration management:
 * - Aggregate Root: EventPlan
 * - Domain Entities: BudgetItem, TimelineMilestone, Vendor, SpeechDraft, InvitationDraft
 * - Value Objects: ColorSwatch, BudgetCategoryMeta, EventPalette, ActivityIdea
 * - Domain Enums/Unions: EventType, BudgetCategoryKey, ExpenseStatus, TimelinePhase, VendorPipelineStatus
 */

/**
 * Supported celebration archetypes.
 * Each archetype dictates distinct industry allocation benchmarks, default milestones, and sensory palettes.
 */
export type EventType = 'wedding' | 'birthday' | 'community';

/**
 * Standard budget category partition keys across all event types.
 */
export type BudgetCategoryKey =
  | 'venue'
  | 'catering'
  | 'photo_video'
  | 'music_entertainment'
  | 'decor_florals'
  | 'attire_beauty'
  | 'favors_invites'
  | 'contingency';

/**
 * Metadata descriptor for each budget category including archetype-specific benchmarks.
 */
export interface BudgetCategoryMeta {
  /** Unique category identifier matching BudgetCategoryKey */
  key: BudgetCategoryKey;
  /** Human-readable category label (e.g. "Venue & Rental") */
  label: string;
  /** Industry benchmark percentage allocation partitioned by event archetype */
  recommendedPercent: Record<EventType, number>;
  /** Lucide icon identifier */
  icon: string;
  /** Neo-brutalist accent color hex */
  color: string;
}

/**
 * Lifecycle payment status of a budget line item.
 * Progression follows: estimated -> quoted -> paid.
 */
export type ExpenseStatus = 'estimated' | 'quoted' | 'paid';

/**
 * Individual expense line item within an event's financial plan.
 */
export interface BudgetItem {
  /** Unique item identifier */
  id: string;
  /** Category bucket */
  category: BudgetCategoryKey;
  /** Line item title or description */
  name: string;
  /** Projected or benchmark cost */
  estimatedCost: number;
  /** Confirmed quote or actual disbursed amount */
  actualCost: number;
  /** Current payment lifecycle state */
  status: ExpenseStatus;
  /** Contextual notes or vendor quotes */
  notes?: string;
  /** Flag designating whether this item represents the contingency reserve */
  isContingency?: boolean;
}

/**
 * Financial plan containing total budget, contingency reserve percentage, and line items.
 */
export interface EventBudget {
  /** Total monetary budget ceiling allocated for the event */
  totalBudget: number;
  /** Currency symbol (e.g. "$", "€", "£") */
  currency: string;
  /** Locked contingency reserve percentage (typically 10-15%) */
  contingencyPercent: number;
  /** Collection of individual expense items */
  items: BudgetItem[];
}

/**
 * Calculated budget analytics produced by the StorageService calculation engine.
 */
export interface BudgetAnalytics {
  /** Total budget ceiling */
  totalBudget: number;
  /** Sum of all actual/disbursed costs */
  actualSpent: number;
  /** Sum of all projected/estimated costs */
  estimatedSpent: number;
  /** Solvency buffer remaining: totalBudget - actualSpent */
  remaining: number;
  /** Monetary contingency reserve locked: (totalBudget * contingencyPercent) / 100 */
  contingencyReserved: number;
  /** Average spend per attendee */
  perGuestSpend: number;
  /** Percentage of total budget allocated (clamped to 100 max) */
  percentSpent: number;
  /** Breakdown of estimated vs actual spend grouped by category */
  categoryTotals: Record<BudgetCategoryKey, { estimated: number; actual: number }>;
}

/**
 * Temporal phases for milestone tracking across dual horizons:
 * - Macro countdowns: months out, weeks out, days out
 * - Micro execution: day-of minute-by-minute run of show
 */
export type TimelinePhase =
  | 'macro_months'   // 6-12 months out
  | 'macro_weeks'    // 2-8 weeks out
  | 'countdown_days' // 1-7 days out
  | 'day_of';        // Day-of minute-by-minute run of show

/**
 * Milestone or run-of-show cue item.
 */
export interface TimelineMilestone {
  /** Unique milestone identifier */
  id: string;
  /** Planning phase horizon */
  phase: TimelinePhase;
  /** Timeframe string (e.g. "6 Months Out", "14:00 - 15:00") */
  timeframe: string;
  /** Milestone title */
  title: string;
  /** Concrete execution details or instructions */
  description: string;
  /** Domain category or operational track */
  category: BudgetCategoryKey | 'general' | 'ceremony' | 'logistics';
  /** Completion flag */
  completed: boolean;
  /** Urgency ranking */
  priority: 'critical' | 'normal' | 'optional';
  /** Stakeholder or coordinator assigned to this task */
  assignedTo?: string;
  /** ISO timestamp recording when the milestone was checked off */
  completedAt?: string;
}

/**
 * Calculated timeline analytics produced by the StorageService.
 */
export interface TimelineAnalytics {
  /** Total count of milestone cues */
  total: number;
  /** Count of completed milestone cues */
  completed: number;
  /** Completion percentage [0 - 100] */
  percent: number;
  /** Day-of minute-by-minute cues */
  dayOfCues: TimelineMilestone[];
  /** Macro countdown milestones */
  macroCues: TimelineMilestone[];
}

/**
 * Five-stage Kanban pipeline for vendor acquisition and contract lifecycle.
 */
export type VendorPipelineStatus =
  | 'wishlist'
  | 'contacted'
  | 'quote_received'
  | 'deposit_paid'
  | 'confirmed';

/**
 * Vendor record within the Vendor Pipeline Matrix.
 */
export interface Vendor {
  /** Unique vendor identifier */
  id: string;
  /** Service category */
  category: BudgetCategoryKey;
  /** Vendor business or individual name */
  name: string;
  /** Primary contact person */
  contactPerson?: string;
  /** Phone contact */
  phone?: string;
  /** Email address */
  email?: string;
  /** Pipeline acquisition stage */
  status: VendorPipelineStatus;
  /** Quoted or contracted monetary amount */
  quotedAmount: number;
  /** Deposit amount paid */
  depositPaid: number;
  /** Evaluation rating [1 - 5] */
  rating?: number;
  /** Contract notes, deliverables, and terms */
  notes?: string;
  /** Contextual interview and vetting questions */
  aiSuggestedQuestions: string[];
}

/**
 * Color swatch for theme palettes.
 */
export interface ColorSwatch {
  /** Descriptive color name (e.g. "Velvet Charcoal") */
  name: string;
  /** 6-digit hex code (e.g. "#1A1A1A") */
  hex: string;
  /** Structural color role */
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'neutral';
}

/**
 * Invitation copy draft.
 */
export interface InvitationDraft {
  /** Unique draft identifier */
  id: string;
  /** Editorial tone style */
  style: 'classic_formal' | 'warm_heartfelt' | 'modern_playful' | 'poetic_editorial';
  /** Primary invitation headline */
  headline: string;
  /** Body prose containing event details */
  body: string;
  /** RSVP instructions and deadline */
  rsvpNote: string;
}

/**
 * Generated toast or keynote speech draft with delivery coaching.
 */
export interface SpeechDraft {
  /** Unique draft identifier */
  id: string;
  /** Speaker role (e.g. "Maid of Honor", "Host / Best Friend", "Committee Chair") */
  role: string;
  /** Speech title */
  title: string;
  /** Emotional tone */
  tone: 'humorous' | 'emotional' | 'inspiring' | 'welcoming';
  /** Full speech script with stage delivery cues */
  content: string;
  /** Estimated speaking time in minutes */
  speakingTimeMin: number;
  /** Professional stage delivery tips and body language guidance */
  deliveryTips: string[];
}

/**
 * Interactive crowd activity or entertainment idea.
 */
export interface ActivityIdea {
  /** Unique activity identifier */
  id: string;
  /** Activity title */
  title: string;
  /** Category classification */
  category: 'icebreaker' | 'toast' | 'game' | 'ceremony' | 'crowd_interactive';
  /** Execution instructions */
  description: string;
  /** Estimated duration in minutes */
  durationMin: number;
  /** Required supplies or props */
  suppliesNeeded?: string[];
}

/**
 * Sensory Creative Suite containing aesthetic themes, copywriting, and hospitality assets.
 */
export interface CreativeSuite {
  /** Cohesive theme name */
  themeName: string;
  /** Short punchy celebration tagline */
  tagline: string;
  /** Sensory mood description */
  moodDescription: string;
  /** Five-swatch harmonized color palette */
  palette: ColorSwatch[];
  /** Multi-tone invitation drafts */
  invitationDrafts: InvitationDraft[];
  /** Custom toasts and speeches */
  speechDrafts: SpeechDraft[];
  /** Curated crowd activities */
  activities: ActivityIdea[];
  /** Signature cocktail and mocktail recipes */
  signatureDrinks: {
    name: string;
    type: 'cocktail' | 'mocktail';
    description: string;
    ingredients: string[];
  }[];
}

/**
 * EventPlan Aggregate Root — Top-level domain model representing an entire celebration.
 */
export interface EventPlan {
  /** Unique event identifier */
  id: string;
  /** Archetype classification */
  type: EventType;
  /** Event title (e.g. "Aura Vineyard Autumn Wedding") */
  title: string;
  /** Scheduled celebration date (ISO format: YYYY-MM-DD) */
  date: string;
  /** Venue location or city */
  location: string;
  /** Projected attendee count */
  guestCount: number;
  /** Sensory aesthetic description */
  vibe: string;
  /** Financial budget and expense ledger */
  budget: EventBudget;
  /** Dual-horizon countdown and day-of timeline */
  timeline: TimelineMilestone[];
  /** Vendor procurement pipeline */
  vendors: Vendor[];
  /** Creative studio assets */
  creative: CreativeSuite;
  /** Persistent AI copilot context notes */
  aiContextNotes: string[];
  /** Last modification timestamp */
  lastModified: string;
}
