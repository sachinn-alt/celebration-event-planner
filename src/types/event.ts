// TypeScript Domain Models for EventiQ (Celebration & Event Planner)

export type EventType = 'wedding' | 'birthday' | 'community';

export type BudgetCategoryKey =
  | 'venue'
  | 'catering'
  | 'photo_video'
  | 'music_entertainment'
  | 'decor_florals'
  | 'attire_beauty'
  | 'favors_invites'
  | 'contingency';

export interface BudgetCategoryMeta {
  key: BudgetCategoryKey;
  label: string;
  recommendedPercent: Record<EventType, number>;
  icon: string;
  color: string;
}

export type ExpenseStatus = 'estimated' | 'quoted' | 'paid';

export interface BudgetItem {
  id: string;
  category: BudgetCategoryKey;
  name: string;
  estimatedCost: number;
  actualCost: number;
  status: ExpenseStatus;
  notes?: string;
  isContingency?: boolean;
}

export interface EventBudget {
  totalBudget: number;
  currency: string;
  contingencyPercent: number; // e.g. 10%
  items: BudgetItem[];
}

export type TimelinePhase =
  | 'macro_months'  // 6-12 months out
  | 'macro_weeks'   // 2-8 weeks out
  | 'countdown_days'// 1-7 days out
  | 'day_of';       // Day-of minute-by-minute run of show

export interface TimelineMilestone {
  id: string;
  phase: TimelinePhase;
  timeframe: string; // e.g. "6 Months Before", "2 Weeks Before", "14:00 - 15:00"
  title: string;
  description: string;
  category: BudgetCategoryKey | 'general' | 'ceremony' | 'logistics';
  completed: boolean;
  priority: 'critical' | 'normal' | 'optional';
  assignedTo?: string;
  completedAt?: string;
}

export type VendorPipelineStatus =
  | 'wishlist'
  | 'contacted'
  | 'quote_received'
  | 'deposit_paid'
  | 'confirmed';

export interface Vendor {
  id: string;
  category: BudgetCategoryKey;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  status: VendorPipelineStatus;
  quotedAmount: number;
  depositPaid: number;
  rating?: number;
  notes?: string;
  aiSuggestedQuestions: string[];
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'neutral';
}

export interface InvitationDraft {
  id: string;
  style: 'classic_formal' | 'warm_heartfelt' | 'modern_playful' | 'poetic_editorial';
  headline: string;
  body: string;
  rsvpNote: string;
}

export interface SpeechDraft {
  id: string;
  role: string; // e.g. "Maid of Honor", "Host / Best Friend", "Committee Chair"
  title: string;
  tone: 'humorous' | 'emotional' | 'inspiring' | 'welcoming';
  content: string;
  speakingTimeMin: number;
  deliveryTips: string[];
}

export interface ActivityIdea {
  id: string;
  title: string;
  category: 'icebreaker' | 'toast' | 'game' | 'ceremony' | 'crowd_interactive';
  description: string;
  durationMin: number;
  suppliesNeeded?: string[];
}

export interface CreativeSuite {
  themeName: string;
  tagline: string;
  moodDescription: string;
  palette: ColorSwatch[];
  invitationDrafts: InvitationDraft[];
  speechDrafts: SpeechDraft[];
  activities: ActivityIdea[];
  signatureDrinks: {
    name: string;
    type: 'cocktail' | 'mocktail';
    description: string;
    ingredients: string[];
  }[];
}

export interface EventPlan {
  id: string;
  type: EventType;
  title: string;
  date: string;
  location: string;
  guestCount: number;
  vibe: string;
  budget: EventBudget;
  timeline: TimelineMilestone[];
  vendors: Vendor[];
  creative: CreativeSuite;
  aiContextNotes: string[];
  lastModified: string;
}
