/**
 * Party planning domain types for Monster Mash
 *
 * WHY: These types represent the core domain model extracted from data-model.md
 * and validated through spike experiments. They define what a "party plan" looks
 * like and what constraints users can provide.
 */

/**
 * User-provided constraints for party planning session
 *
 * WHY: These are the inputs users provide via CLI (FR-001). All agents receive
 * these constraints and must generate proposals that respect them.
 */
export interface PartyConstraints {
  /** Total budget in USD */
  budget: number;
  /** Number of expected guests */
  guestCount: number;
  /** Party date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Optional dietary restrictions (e.g., ['vegetarian', 'gluten-free']) */
  dietaryRestrictions?: string[];
  /** Optional venue constraints */
  venue?: {
    indoor?: boolean;
    capacity?: number;
    address?: string;
  };
  /** Optional personality style for agents ('frugal' | 'perfectionist' | 'adventurous' | 'default') */
  personality?: "frugal" | "perfectionist" | "adventurous" | "default";
}

/**
 * Party theme with description and aesthetic details
 *
 * WHY: Spike 2 showed LLM generates rich, evocative themes. This structure
 * captures both human-readable description and structured aesthetic details
 * for other agents to reference.
 */
export interface Theme {
  /** Short name (e.g., "Gothic Vampire Soirée") */
  name: string;
  /** Detailed description with atmosphere and vibe */
  description: string;
  /** Confidence score from ThemeAgent (0.0-1.0) */
  confidence: number;
  /** Color palette for decorations */
  colors?: string[];
  /** Mood keywords (e.g., ['elegant', 'mysterious', 'dramatic']) */
  mood?: string[];
}

/**
 * Food menu item with description and cost estimate
 *
 * WHY: FoodAgent generates menu items that align with theme. Cost tracking
 * is essential for PurchaserAgent to stay within budget constraint.
 */
export interface MenuItem {
  /** Item name (e.g., "Vampire's Velvet Cake") */
  name: string;
  /** Detailed description including preparation method */
  description: string;
  /** Estimated cost per serving in USD */
  costPerServing: number;
  /** Number of servings this recipe yields */
  servings: number;
  /** Confidence score from FoodAgent (0.0-1.0) */
  confidence: number;
  /** Dietary tags (e.g., ['vegetarian', 'gluten-free']) */
  dietaryTags?: string[];
}

/**
 * Decoration item with description and estimated cost
 *
 * WHY: DecoratorAgent generates decoration suggestions that match theme.
 * Cost tracking helps stay within budget.
 */
export interface DecorationItem {
  /** Item name (e.g., "Candlelit chandeliers") */
  name: string;
  /** Detailed description and placement suggestions */
  description: string;
  /** Estimated total cost in USD */
  estimatedCost: number;
  /** Confidence score from DecoratorAgent (0.0-1.0) */
  confidence: number;
  /** Quantity needed */
  quantity?: number;
}

/**
 * Music playlist with themed songs
 *
 * WHY: DJAgent generates playlists that match theme atmosphere. Spike 2-3
 * showed LLM can suggest creative song choices with rationale.
 */
export interface Playlist {
  /** Playlist name (e.g., "Gothic Vampire Evening Soundscape") */
  name: string;
  /** Playlist description and vibe */
  description: string;
  /** List of song titles or descriptions */
  songs: string[];
  /** Confidence score from DJAgent (0.0-1.0) */
  confidence: number;
  /** Estimated playlist duration in minutes */
  durationMinutes?: number;
}

/**
 * Contact management suggestion from ContactManagerAgent
 *
 * WHY: ContactManagerAgent provides templates and suggestions for guest
 * communication. Rules-based (not LLM) per plan.md.
 */
export interface ContactSuggestion {
  /** Suggested invitation message template */
  invitationTemplate: string;
  /** RSVP tracking method suggestion */
  rsvpMethod: "email" | "phone" | "online-form" | "paper";
  /** Suggested timeline for sending invitations (days before party) */
  sendTimelineDays: number;
  /** Follow-up reminder suggestions */
  reminderSchedule?: number[];
}

/**
 * Purchase list item with cost and source
 *
 * WHY: PurchaserAgent aggregates all costs and suggests where to buy items.
 * Web scraping for prices (US4) will populate estimatedPrice.
 */
export interface PurchaseItem {
  /** Item name */
  name: string;
  /** Item category ('food' | 'decoration' | 'supplies' | 'other') */
  category: "food" | "decoration" | "supplies" | "other";
  /** Quantity needed */
  quantity: number;
  /** Unit of measurement (e.g., 'lbs', 'each', 'dozen') */
  unit: string;
  /** Estimated price per unit in USD */
  estimatedPrice: number;
  /** Where to purchase (e.g., 'grocery store', 'party supply store') */
  source?: string;
  /** URL if from web scraping (US4) */
  url?: string;
}

/**
 * Budget breakdown showing cost allocation
 *
 * WHY: PurchaserAgent must ensure total costs stay within budget constraint
 * (FR-045). This breakdown provides transparency for users.
 */
export interface BudgetBreakdown {
  /** Total budget provided by user */
  totalBudget: number;
  /** Food costs */
  food: number;
  /** Decoration costs */
  decorations: number;
  /** Music/entertainment costs (if applicable) */
  entertainment: number;
  /** Miscellaneous supplies */
  supplies: number;
  /** Total estimated cost */
  estimatedTotal: number;
  /** Remaining budget (or overage if negative) */
  remaining: number;
  /** Is budget constraint satisfied? (within 5% tolerance per SC-008) */
  withinBudget: boolean;
}

/**
 * Complete party plan output after agent coordination
 *
 * WHY: This is the final deliverable (FR-001). All 6 agents contribute their
 * decisions to create a cohesive, budget-compliant party plan.
 */
export interface PartyPlan {
  /** User constraints used for this plan */
  constraints: PartyConstraints;
  /** Selected theme (from ThemeAgent) */
  theme: Theme;
  /** Menu items (from FoodAgent) */
  menu: MenuItem[];
  /** Decoration items (from DecoratorAgent) */
  decorations: DecorationItem[];
  /** Playlist (from DJAgent) */
  playlist: Playlist;
  /** Contact suggestions (from ContactManagerAgent) */
  contact: ContactSuggestion;
  /** Purchase list (from PurchaserAgent) */
  purchaseList: PurchaseItem[];
  /** Budget breakdown (from PurchaserAgent) */
  budget: BudgetBreakdown;
  /** Planning session metadata */
  metadata: {
    /** When was this plan created? */
    createdAt: Date;
    /** How long did planning take? (milliseconds) */
    planningDurationMs: number;
    /** How many messages were exchanged? */
    messageCount: number;
    /** Did agents reach consensus? */
    consensusAchieved: boolean;
  };
}
