/**
 * DecoratorAgent - Generates themed decoration suggestions
 *
 * WHY: FR-032 to FR-037 require decoration planning that matches theme
 */

import { getAnthropicClient } from "../llm/anthropic-client";
import { combinePrompts, getPersonality } from "../llm/personalities";
import { createDecorationPrompt } from "../llm/prompts";
import type { Agent, Decision } from "../types/agent";
import type { VerbalizeSamplingOutput } from "../types/llm";
import type { DecorationItem, PartyConstraints, Theme } from "../types/party";

export class DecoratorAgent implements Agent {
  id = "decor";
  private client = getAnthropicClient();

  async decide(input: any): Promise<Decision[]> {
    const { theme, constraints } = input as {
      theme: Theme;
      constraints: PartyConstraints;
    };

    const personality = getPersonality(constraints.personality);

    const userPrompt = createDecorationPrompt(theme, {
      budget: constraints.budget,
      venue: constraints.venue,
    });

    const systemPrompt = combinePrompts(
      "You are a decoration expert specializing in Halloween party aesthetics.",
      personality
    );

    const fallback: VerbalizeSamplingOutput<DecorationItem> = {
      options: [
        {
          description: "Halloween String Lights",
          confidence: 0.9,
          data: {
            name: "Halloween String Lights",
            description: "Orange and purple LED string lights",
            estimatedCost: 25,
            confidence: 0.9,
            quantity: 3,
          },
        },
        {
          description: "Pumpkin Centerpieces",
          confidence: 0.85,
          data: {
            name: "Pumpkin Centerpieces",
            description: "Carved pumpkins for table centerpieces",
            estimatedCost: 30,
            confidence: 0.85,
            quantity: 5,
          },
        },
      ],
    };

    const response = await this.client.generateWithFallback<
      VerbalizeSamplingOutput<DecorationItem>
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
        `⚠️  DecorAgent: LLM failed, using fallback templates (${response.latencyMs}ms)`
      );
    } else {
      console.log(
        `✅ DecorAgent: LLM generated decorations successfully (${response.latencyMs}ms)`
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
