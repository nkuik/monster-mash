/**
 * Core agent types for Monster Mash multi-agent party planning framework
 *
 * WHY: These types define the contract for agent communication and decision-making
 * across the entire system. Extracted from Spike 1 learnings where simple function-based
 * agents proved sufficient for coordination.
 */

/**
 * Message passed between agents via EventEmitter message bus
 *
 * WHY: Lightweight message format validated in Spike 1. No need for JSON-RPC or
 * HTTP-style messages since we're using in-process EventEmitter.
 */
export interface Message {
  /** Unique identifier for message tracing */
  id: string;
  /** Agent ID sending the message */
  from: string;
  /** Agent ID receiving the message (or 'broadcast' for all) */
  to: string;
  /** Message type for routing (e.g., 'propose', 'vote', 'decide') */
  type: "propose" | "vote" | "decide" | "query" | "response" | "broadcast";
  /** Message payload - flexible to support different agent needs */
  content: any;
  /** Timestamp when message was created */
  timestamp: Date;
}

/**
 * Decision made by an agent with confidence score (verbalized sampling)
 *
 * WHY: Represents single option in verbalized sampling output. Confidence scores
 * enable majority voting and help coordinator select best options.
 */
export interface Decision {
  /** Agent ID that made this decision */
  agentId: string;
  /** Human-readable description of the decision */
  description: string;
  /** Confidence score 0.0-1.0 (higher = more confident) */
  confidence: number;
  /** Structured data for this decision (theme details, menu items, etc.) */
  data: any;
  /** Optional rationale explaining WHY this decision was made */
  rationale?: string;
}

/**
 * Agent interface - all agents must implement this contract
 *
 * WHY: Minimal interface validated in Spike 1. Each agent is a simple TypeScript
 * class with id and decide() method. No need for complex lifecycle methods yet.
 */
export interface Agent {
  /** Unique agent identifier (e.g., 'theme', 'food', 'decor') */
  id: string;
  /** Agent's decision-making function - receives input, returns decision(s) */
  decide: (input: any) => Promise<Decision | Decision[]>;
}

/**
 * Vote cast by an agent during consensus process
 *
 * WHY: Majority voting is rule-based (not LLM-based) per plan.md. Each agent
 * votes for their preferred option from the available choices.
 */
export interface Vote {
  /** Agent ID casting this vote */
  agentId: string;
  /** ID or description of option being voted for */
  choice: string;
  /** Optional reasoning for this vote (for observability) */
  reasoning?: string;
  /** Timestamp when vote was cast */
  timestamp: Date;
}

/**
 * Consensus result after voting round
 *
 * WHY: Coordinator needs to track which option won majority vote and which
 * agents supported it for observability (US3).
 */
export interface Consensus {
  /** The winning option that achieved majority */
  winner: string;
  /** Number of votes for the winning option */
  votes: number;
  /** Total number of voting agents */
  totalVoters: number;
  /** List of agent IDs that voted for winner */
  supporters: string[];
  /** Was consensus unanimous? */
  unanimous: boolean;
}
