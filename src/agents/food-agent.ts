/**
 * FoodAgent - Generates themed menu items
 *
 * WHY: FR-024 to FR-031 require menu generation that aligns with theme.
 * Validated in Spike 2-3 with theme-specific menu items.
 */

import { getAnthropicClient } from "../llm/anthropic-client";
import { combinePrompts, getPersonality } from "../llm/personalities";
import { createMenuPrompt } from "../llm/prompts";
import type { Agent, Decision } from "../types/agent";
import type { VerbalizeSamplingOutput } from "../types/llm";
import type { MenuItem, PartyConstraints, Theme } from "../types/party";

export class FoodAgent implements Agent {
  id = "food";
  private client = getAnthropicClient();

  async decide(input: any): Promise<Decision[]> {
    const { theme, constraints } = input as {
      theme: Theme;
      constraints: PartyConstraints;
    };

    const personality = getPersonality(constraints.personality);

    const userPrompt = createMenuPrompt(theme, {
      guestCount: constraints.guestCount,
      budget: constraints.budget,
      dietaryRestrictions: constraints.dietaryRestrictions,
    });

    const systemPrompt = combinePrompts(
      "You are a menu planning expert specializing in themed Halloween food.",
      personality
    );

    const fallback: VerbalizeSamplingOutput<MenuItem> = {
      options: [
        {
          description: "Halloween Punch",
          confidence: 0.85,
          data: {
            name: "Halloween Punch",
            description:
              "Orange and black layered fruit punch with dry ice effect",
            costPerServing: 1.5,
            servings: constraints.guestCount,
            confidence: 0.85,
            dietaryTags: ["vegetarian", "vegan"],
          },
        },
        {
          description: "Monster Sandwiches",
          confidence: 0.8,
          data: {
            name: "Monster Sandwiches",
            description: "Assorted sandwiches cut into monster shapes",
            costPerServing: 2.5,
            servings: constraints.guestCount,
            confidence: 0.8,
          },
        },
      ],
    };

    const response = await this.client.generateWithFallback<
      VerbalizeSamplingOutput<MenuItem>
    >(
      {
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 1536,
        temperature: 0.7,
        responseFormat: "json",
      },
      fallback
    );

    // Log LLM success/failure for observability
    if (response.source === "fallback") {
      console.log(
        `⚠️  FoodAgent: LLM failed, using fallback templates (${response.latencyMs}ms)`
      );
    } else {
      console.log(
        `✅ FoodAgent: LLM generated menu successfully (${response.latencyMs}ms)`
      );
    }

    if (!response.success || !response.data) {
      return fallback.options.map((opt) => ({
        agentId: this.id,
        description: opt.description,
        confidence: opt.confidence,
        data: opt.data,
      }));
    }

    return response.data.options.map((opt) => ({
      agentId: this.id,
      description: opt.description,
      confidence: opt.confidence,
      data: opt.data,
    }));
  }
}
