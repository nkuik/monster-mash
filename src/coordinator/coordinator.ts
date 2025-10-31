/**
 * Coordinator orchestrates planning session lifecycle
 *
 * WHY: Central control point for multi-agent party planning. Spawns agents,
 * manages message flow, coordinates voting rounds, and produces final plan.
 * Validated through Spike 1-3 patterns.
 */

import type { Agent, Vote } from "../types/agent";
import type { PartyConstraints, PartyPlan, Theme } from "../types/party";
import { MessageBus } from "./message-bus";
import { createVote, tallyVotes } from "./voting";

/**
 * Coordinator class manages planning session from start to finish
 *
 * WHY: FR-001 requires coordinating 6 agents to produce complete party plan.
 * This class implements the orchestration logic validated in spikes.
 */
export class Coordinator {
  private messageBus: MessageBus;
  private agents: Map<string, Agent> = new Map();
  private sessionStartTime?: number;

  constructor() {
    this.messageBus = new MessageBus();
  }

  /**
   * Register an agent with the coordinator
   *
   * WHY: Agents must register before planning session starts. This allows
   * coordinator to know which agents are available and route messages.
   */
  registerAgent(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent ${agent.id} is already registered`);
    }
    this.agents.set(agent.id, agent);

    // Subscribe agent to message bus
    this.messageBus.subscribe(agent.id, (message) => {
      // Agent receives message, may respond asynchronously
      // Actual response logic is in agent's decide() method
    });
  }

  /**
   * Get message bus for logging/observability
   *
   * WHY: US3 requires visibility into agent communications. Logger needs access
   * to message bus to subscribe to all messages.
   */
  getMessageBus(): MessageBus {
    return this.messageBus;
  }

  /**
   * Run complete planning session with all registered agents
   *
   * WHY: Main entry point for party planning. Takes user constraints, coordinates
   * agents through multiple decision rounds, and produces final PartyPlan.
   *
   * FLOW:
   * 1. Theme selection (ThemeAgent generates, all vote)
   * 2. Menu planning (FoodAgent generates based on theme)
   * 3. Decoration planning (DecoratorAgent generates based on theme)
   * 4. Playlist curation (DJAgent generates based on theme)
   * 5. Budget calculation (PurchaserAgent aggregates costs)
   * 6. Contact suggestions (ContactManagerAgent provides templates)
   */
  async runPlanningSession(constraints: PartyConstraints): Promise<PartyPlan> {
    this.sessionStartTime = Date.now();
    this.messageBus.clear();

    // Broadcast session start to all agents
    this.messageBus.send("coordinator", "broadcast", "broadcast", {
      action: "session_start",
      constraints,
    });

    // Phase 1: Theme selection
    const theme = await this.selectTheme(constraints);

    // Phase 2: Parallel agent planning based on theme
    const [menu, decorations, playlist, contact] = await Promise.all([
      this.planMenu(theme, constraints),
      this.planDecorations(theme, constraints),
      this.curatePlaylists(theme, constraints),
      this.suggestContact(constraints),
    ]);

    // Phase 3: Budget calculation (must happen after all costs known)
    const { purchaseList, budget } = await this.calculateBudget(
      menu,
      decorations,
      constraints
    );

    // Build final plan
    const planningDurationMs = Date.now() - this.sessionStartTime;

    const plan: PartyPlan = {
      constraints,
      theme,
      menu,
      decorations,
      playlist,
      contact,
      purchaseList,
      budget,
      metadata: {
        createdAt: new Date(),
        planningDurationMs,
        messageCount: this.messageBus.getMessageCount(),
        consensusAchieved: true, // Will be set by actual voting logic
      },
    };

    // Broadcast session end
    this.messageBus.send("coordinator", "broadcast", "broadcast", {
      action: "session_end",
      plan,
    });

    return plan;
  }

  /**
   * Phase 1: Select theme through agent coordination and voting
   *
   * WHY: FR-018 to FR-023 require ThemeAgent to generate options, then all
   * agents vote on preferred theme. This implements that coordination.
   */
  private async selectTheme(constraints: PartyConstraints): Promise<Theme> {
    const themeAgent = this.agents.get("theme");
    if (!themeAgent) {
      throw new Error("ThemeAgent not registered");
    }

    // Request theme options from ThemeAgent
    this.messageBus.send("coordinator", "theme", "query", {
      action: "generate_themes",
      constraints,
    });

    // ThemeAgent generates 3-5 options (verbalized sampling)
    const decisions = await themeAgent.decide(constraints);
    const options = Array.isArray(decisions) ? decisions : [decisions];

    // Collect votes from all agents
    const votes: Vote[] = [];
    for (const [agentId, agent] of this.agents.entries()) {
      // Each agent votes for preferred theme
      // For simplicity, agents vote for highest confidence option
      // In full implementation, agents could have own voting logic
      const preferred = options[0]; // Simple: pick first/highest confidence
      votes.push(createVote(agentId, preferred.description));
    }

    // Tally votes and select winner
    const consensus = tallyVotes(votes);
    const winningOption = options.find(
      (o) => o.description === consensus.winner
    );

    if (!winningOption) {
      throw new Error("Failed to select theme: no matching option found");
    }

    // Return theme (convert Decision to Theme)
    return winningOption.data as Theme;
  }

  /**
   * Phase 2a: Plan menu based on selected theme
   *
   * WHY: FR-024 to FR-031 require FoodAgent to generate theme-appropriate menu
   */
  private async planMenu(
    theme: Theme,
    constraints: PartyConstraints
  ): Promise<any[]> {
    const foodAgent = this.agents.get("food");
    if (!foodAgent) {
      throw new Error("FoodAgent not registered");
    }

    this.messageBus.send("coordinator", "food", "query", {
      action: "generate_menu",
      theme,
      constraints,
    });

    const decisions = await foodAgent.decide({ theme, constraints });
    const options = Array.isArray(decisions) ? decisions : [decisions];

    // Return menu items (extract from decisions)
    return options.map((d) => d.data);
  }

  /**
   * Phase 2b: Plan decorations based on selected theme
   *
   * WHY: FR-032 to FR-037 require DecoratorAgent to suggest theme-matching decorations
   */
  private async planDecorations(
    theme: Theme,
    constraints: PartyConstraints
  ): Promise<any[]> {
    const decorAgent = this.agents.get("decor");
    if (!decorAgent) {
      throw new Error("DecoratorAgent not registered");
    }

    this.messageBus.send("coordinator", "decor", "query", {
      action: "generate_decorations",
      theme,
      constraints,
    });

    const decisions = await decorAgent.decide({ theme, constraints });
    const options = Array.isArray(decisions) ? decisions : [decisions];

    return options.map((d) => d.data);
  }

  /**
   * Phase 2c: Curate playlist based on selected theme
   *
   * WHY: FR-046 to FR-049 require DJAgent to generate theme-appropriate playlist
   */
  private async curatePlaylists(
    theme: Theme,
    constraints: PartyConstraints
  ): Promise<any> {
    const djAgent = this.agents.get("dj");
    if (!djAgent) {
      throw new Error("DJAgent not registered");
    }

    this.messageBus.send("coordinator", "dj", "query", {
      action: "curate_playlist",
      theme,
      constraints,
    });

    const decisions = await djAgent.decide({ theme, constraints });
    const decision = Array.isArray(decisions) ? decisions[0] : decisions;

    return decision.data;
  }

  /**
   * Phase 2d: Generate contact suggestions
   *
   * WHY: FR-038 to FR-044 require ContactManagerAgent to provide invitation templates
   */
  private async suggestContact(constraints: PartyConstraints): Promise<any> {
    const contactAgent = this.agents.get("contact");
    if (!contactAgent) {
      throw new Error("ContactManagerAgent not registered");
    }

    this.messageBus.send("coordinator", "contact", "query", {
      action: "suggest_contact",
      constraints,
    });

    const decisions = await contactAgent.decide(constraints);
    const decision = Array.isArray(decisions) ? decisions[0] : decisions;

    return decision.data;
  }

  /**
   * Phase 3: Calculate budget and create purchase list
   *
   * WHY: FR-045 requires PurchaserAgent to aggregate costs and ensure budget compliance
   */
  private async calculateBudget(
    menu: any[],
    decorations: any[],
    constraints: PartyConstraints
  ): Promise<any> {
    const purchaseAgent = this.agents.get("purchase");
    if (!purchaseAgent) {
      throw new Error("PurchaserAgent not registered");
    }

    this.messageBus.send("coordinator", "purchase", "query", {
      action: "calculate_budget",
      menu,
      decorations,
      constraints,
    });

    const decisions = await purchaseAgent.decide({
      menu,
      decorations,
      constraints,
    });
    const decision = Array.isArray(decisions) ? decisions[0] : decisions;

    return decision.data;
  }

  /**
   * Get list of registered agent IDs
   *
   * WHY: Useful for debugging and observability
   */
  getAgentIds(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Clear all agents and reset coordinator
   *
   * WHY: Useful for testing and starting fresh planning session
   */
  reset(): void {
    this.agents.clear();
    this.messageBus.clear();
    this.sessionStartTime = undefined;
  }
}
