/**
 * Majority voting consensus mechanism for agent coordination
 *
 * WHY: FR-008 requires rule-based (not LLM-based) consensus. Spike 1 validated
 * that simple majority voting works well for 6 agents. This module handles
 * vote collection, tallying, and determining winners.
 */

import type { Consensus, Decision, Vote } from "../types/agent";

/**
 * Collect votes from agents and determine consensus
 *
 * WHY: Coordinator needs to determine which option wins majority vote. This
 * function handles the voting logic and produces Consensus result.
 */
export function tallyVotes(votes: Vote[]): Consensus {
  if (votes.length === 0) {
    throw new Error("Cannot tally votes: no votes provided");
  }

  // Count votes for each choice
  const voteCounts = new Map<string, number>();
  const supporters = new Map<string, string[]>();

  for (const vote of votes) {
    const current = voteCounts.get(vote.choice) || 0;
    voteCounts.set(vote.choice, current + 1);

    const currentSupporters = supporters.get(vote.choice) || [];
    currentSupporters.push(vote.agentId);
    supporters.set(vote.choice, currentSupporters);
  }

  // Find winner (choice with most votes)
  let winner = "";
  let maxVotes = 0;

  for (const [choice, count] of voteCounts.entries()) {
    if (count > maxVotes) {
      maxVotes = count;
      winner = choice;
    }
  }

  const winnerSupporters = supporters.get(winner) || [];
  const unanimous = maxVotes === votes.length;

  return {
    winner,
    votes: maxVotes,
    totalVoters: votes.length,
    supporters: winnerSupporters,
    unanimous,
  };
}

/**
 * Select best decision from multiple options based on confidence scores
 *
 * WHY: When agents generate multiple options (verbalized sampling), we need to
 * pick the best one. This uses confidence scores to rank options.
 */
export function selectBestOption(decisions: Decision[]): Decision {
  if (decisions.length === 0) {
    throw new Error("Cannot select best option: no decisions provided");
  }

  // Sort by confidence score (descending)
  const sorted = [...decisions].sort((a, b) => b.confidence - a.confidence);

  return sorted[0];
}

/**
 * Determine if consensus threshold is met
 *
 * WHY: Sometimes we want to require more than simple majority (e.g., 2/3 threshold
 * for important decisions). This checks if vote count meets a custom threshold.
 */
export function hasConsensus(
  votes: number,
  totalVoters: number,
  threshold: number = 0.5
): boolean {
  if (totalVoters === 0) return false;
  const percentage = votes / totalVoters;
  return percentage > threshold;
}

/**
 * Create a vote record for an agent's choice
 *
 * WHY: Helper function to ensure Vote objects are created consistently with
 * all required fields.
 */
export function createVote(
  agentId: string,
  choice: string,
  reasoning?: string
): Vote {
  return {
    agentId,
    choice,
    reasoning,
    timestamp: new Date(),
  };
}

/**
 * Aggregate decisions from multiple agents for voting round
 *
 * WHY: After agents generate options (verbalized sampling), we need to collect
 * all unique options for other agents to vote on. This deduplicates and
 * aggregates options.
 */
export function aggregateOptions<T>(
  decisions: Array<Decision | Decision[]>
): Decision[] {
  const flattened: Decision[] = [];

  for (const decision of decisions) {
    if (Array.isArray(decision)) {
      flattened.push(...decision);
    } else {
      flattened.push(decision);
    }
  }

  // Deduplicate by description (case-insensitive)
  const seen = new Set<string>();
  const unique: Decision[] = [];

  for (const decision of flattened) {
    const key = decision.description.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(decision);
    }
  }

  return unique;
}

/**
 * Calculate confidence-weighted score for a decision
 *
 * WHY: When breaking ties in voting, we can use confidence scores as tiebreaker.
 * This calculates weighted score based on confidence.
 */
export function calculateWeightedScore(decision: Decision): number {
  // Simple weighted score: confidence score itself
  // Can be extended with additional factors (e.g., agent reputation)
  return decision.confidence;
}
