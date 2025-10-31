#!/usr/bin/env node
/**
 * CLI entry point for Monster Mash party planning
 *
 * WHY: FR-001 requires CLI interface for party planning. User provides constraints
 * via command-line arguments, system coordinates 6 agents, outputs complete plan.
 *
 * Usage: npx tsx src/main.ts --budget 500 --guests 50 --date 2025-10-31
 */

import { ContactManagerAgent } from "./agents/contact-agent";
import { DecoratorAgent } from "./agents/decor-agent";
import { DJAgent } from "./agents/dj-agent";
import { FoodAgent } from "./agents/food-agent";
import { PurchaserAgent } from "./agents/purchase-agent";
import { ThemeAgent } from "./agents/theme-agent";
import { Coordinator } from "./coordinator/coordinator";
import type { PartyConstraints } from "./types/party";
import { getLogger } from "./utils/logger";
import { getStateManager } from "./utils/state-manager";

/**
 * Parse command-line arguments
 *
 * WHY: Simple argument parsing without Commander.js dependency (constitution: minimal ceremony)
 */
function parseArgs(): {
  constraints: PartyConstraints;
  output?: string;
  verbose: boolean;
} {
  const args = process.argv.slice(2);
  const constraints: Partial<PartyConstraints> = {};
  let output: string | undefined;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--budget":
        constraints.budget = parseFloat(next);
        i++;
        break;
      case "--guests":
        constraints.guestCount = parseInt(next, 10);
        i++;
        break;
      case "--date":
        constraints.date = next;
        i++;
        break;
      case "--personality":
        constraints.personality = next as any;
        i++;
        break;
      case "--output":
        output = next;
        i++;
        break;
      case "--verbose":
        verbose = true;
        break;
      case "--help":
        printHelp();
        process.exit(0);
    }
  }

  // Validate required arguments
  if (!constraints.budget || !constraints.guestCount || !constraints.date) {
    console.error("Error: Missing required arguments\n");
    printHelp();
    process.exit(1);
  }

  return {
    constraints: constraints as PartyConstraints,
    output,
    verbose,
  };
}

/**
 * Print CLI help text
 *
 * WHY: Users need to know how to use the CLI
 */
function printHelp(): void {
  console.log(`
Monster Mash - Halloween Party Planning with Multi-Agent Coordination

Usage:
  npx tsx src/main.ts --budget <amount> --guests <count> --date <YYYY-MM-DD> [options]

Required Arguments:
  --budget <amount>     Total party budget in USD (e.g., 500)
  --guests <count>      Number of expected guests (e.g., 50)
  --date <YYYY-MM-DD>   Party date (e.g., 2025-10-31)

Optional Arguments:
  --personality <type>  Agent personality style:
                        - frugal: Budget-conscious, mentions prices
                        - perfectionist: Quality-focused, premium options
                        - adventurous: Creative, unconventional ideas
                        - default: Balanced approach (default)
  --output <file>       Save plan to JSON file (e.g., party-plan.json)
  --verbose             Show detailed agent communications
  --help                Show this help message

Examples:
  # Basic usage
  npx tsx src/main.ts --budget 500 --guests 50 --date 2025-10-31

  # With frugal personality
  npx tsx src/main.ts --budget 300 --guests 30 --date 2025-10-31 --personality frugal

  # With verbose logging and file output
  npx tsx src/main.ts --budget 1000 --guests 75 --date 2025-10-31 --verbose --output my-party.json

Environment Variables:
  ANTHROPIC_API_KEY    Required. Your Anthropic API key for Claude Haiku 4.5

For more information, see README.md
`);
}

/**
 * Format and display party plan
 *
 * WHY: User needs to see complete plan in readable format
 */
function displayPlan(plan: any, logger: any): void {
  logger.info("\n========================================");
  logger.success("🎃 Party Plan Complete! 🎃");
  logger.info("========================================\n");

  // Theme
  logger.logPhase("Theme");
  console.log(`  ${plan.theme.name}`);
  console.log(`  ${plan.theme.description}`);
  if (plan.theme.colors) {
    console.log(`  Colors: ${plan.theme.colors.join(", ")}`);
  }
  console.log();

  // Menu
  logger.logPhase("Menu");
  for (const item of plan.menu) {
    console.log(
      `  • ${item.name} - $${item.costPerServing.toFixed(2)}/serving`
    );
    console.log(`    ${item.description}`);
  }
  console.log();

  // Decorations
  logger.logPhase("Decorations");
  for (const item of plan.decorations) {
    console.log(`  • ${item.name} - $${item.estimatedCost.toFixed(2)}`);
    console.log(`    ${item.description}`);
  }
  console.log();

  // Playlist
  logger.logPhase("Playlist");
  console.log(`  ${plan.playlist.name}`);
  console.log(`  Songs (${plan.playlist.songs.length}):`);
  for (const song of plan.playlist.songs.slice(0, 5)) {
    console.log(`    - ${song}`);
  }
  if (plan.playlist.songs.length > 5) {
    console.log(`    ... and ${plan.playlist.songs.length - 5} more`);
  }
  console.log();

  // Budget
  logger.logPhase("Budget Breakdown");
  console.log(`  Total Budget:    $${plan.budget.totalBudget.toFixed(2)}`);
  console.log(`  Food:            $${plan.budget.food.toFixed(2)}`);
  console.log(`  Decorations:     $${plan.budget.decorations.toFixed(2)}`);
  console.log(`  Supplies:        $${plan.budget.supplies.toFixed(2)}`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Estimated Total: $${plan.budget.estimatedTotal.toFixed(2)}`);
  console.log(`  Remaining:       $${plan.budget.remaining.toFixed(2)}`);
  console.log(
    `  Status:          ${
      plan.budget.withinBudget ? "✅ Within Budget" : "⚠️  Over Budget"
    }`
  );
  console.log();

  // Metadata
  logger.logPhase("Planning Session Stats");
  console.log(
    `  Duration:        ${(plan.metadata.planningDurationMs / 1000).toFixed(
      1
    )}s`
  );
  console.log(`  Messages:        ${plan.metadata.messageCount}`);
  console.log(
    `  Consensus:       ${plan.metadata.consensusAchieved ? "✅ Yes" : "❌ No"}`
  );
  console.log();
}

/**
 * Main entry point
 *
 * WHY: Orchestrates entire planning session from CLI input to final output
 */
async function main(): Promise<void> {
  // Parse arguments
  const { constraints, output, verbose } = parseArgs();

  // Initialize logger
  const logger = getLogger({ colors: true, verbose });

  // Welcome message
  logger.info("🎃 Monster Mash - Halloween Party Planner 🎃");
  logger.info(
    `Budget: $${constraints.budget} | Guests: ${constraints.guestCount} | Date: ${constraints.date}`
  );
  if (constraints.personality && constraints.personality !== "default") {
    logger.info(`Personality: ${constraints.personality}`);
  }
  console.log();

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    logger.error("ANTHROPIC_API_KEY environment variable not set");
    console.log("\nPlease set your Anthropic API key:");
    console.log("  export ANTHROPIC_API_KEY=your-key-here");
    console.log("\nOr create a .env file:");
    console.log("  ANTHROPIC_API_KEY=your-key-here");
    process.exit(1);
  }

  try {
    // Initialize coordinator
    const coordinator = new Coordinator();

    // Register all 6 agents
    coordinator.registerAgent(new ThemeAgent());
    coordinator.registerAgent(new FoodAgent());
    coordinator.registerAgent(new DecoratorAgent());
    coordinator.registerAgent(new PurchaserAgent());
    coordinator.registerAgent(new DJAgent());
    coordinator.registerAgent(new ContactManagerAgent());

    // Subscribe to message bus for logging
    if (verbose) {
      coordinator.getMessageBus().subscribeAll((message) => {
        logger.logMessage(
          message.from,
          message.to,
          message.type,
          message.content
        );
      });
    }

    logger.info("Starting planning session...\n");

    // Run planning session
    const plan = await coordinator.runPlanningSession(constraints);

    // Display plan
    displayPlan(plan, logger);

    // Save to file if requested
    if (output) {
      const stateManager = getStateManager();
      const filepath = await stateManager.savePlan(plan, output);
      logger.success(`Plan saved to: ${filepath}`);
    }

    logger.success("✨ Planning session complete! ✨");
  } catch (error) {
    logger.error("Planning session failed", error as Error);
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
