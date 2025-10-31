/**
 * ThemeAgent - Generates party theme options
 *
 * WHY: FR-018 to FR-023 require theme generation with verbalized sampling.
 * This agent uses Claude Haiku 4.5 to generate creative, evocative themes
 * validated in Spike 2-3.
 */

import { getAnthropicClient } from "../llm/anthropic-client";
import { combinePrompts, getPersonality } from "../llm/personalities";
import { createThemePrompt } from "../llm/prompts";
import type { Agent, Decision } from "../types/agent";
import type { VerbalizeSamplingOutput } from "../types/llm";
import type { PartyConstraints, Theme } from "../types/party";

/**
 * ThemeAgent implementation
 *
 * WHY: First agent in planning flow. Generates 3-5 theme options with confidence
 * scores. Other agents use selected theme to guide their decisions.
 */
export class ThemeAgent implements Agent {
  id = "theme";
  private client = getAnthropicClient();

  /**
   * Generate theme options based on party constraints
   *
   * WHY: FR-018 requires multiple theme options for voting. Uses verbalized
   * sampling to generate 3-5 options with confidence scores.
   */
  async decide(input: any): Promise<Decision[]> {
    const constraints = input as PartyConstraints;

    // Get personality if specified
    const personality = getPersonality(constraints.personality);

    // Build prompt
    const userPrompt = createThemePrompt({
      date: constraints.date,
      guestCount: constraints.guestCount,
      budget: constraints.budget,
    });

    const systemPrompt = combinePrompts(
      "You are a theme generation expert for Halloween parties.",
      personality
    );

    // Call LLM with fallback
    // WHY: Randomize fallback order to prevent first-option bias
    const fallbackOptions = [
      {
        description: "Classic Spooky Halloween",
        confidence: 0.9,
        data: {
          name: "Classic Spooky Halloween",
          description:
            "Traditional Halloween atmosphere with pumpkins, ghosts, and witches",
          confidence: 0.9,
          colors: ["orange", "black", "purple"],
          mood: ["spooky", "fun", "traditional"],
        },
      },
      {
        description: "Elegant Masquerade Ball",
        confidence: 0.8,
        data: {
          name: "Elegant Masquerade Ball",
          description:
            "Sophisticated Halloween evening with mystery and elegance",
          confidence: 0.8,
          colors: ["black", "gold", "burgundy"],
          mood: ["elegant", "mysterious", "sophisticated"],
        },
      },
      {
        description: "Playful Monster Bash",
        confidence: 0.75,
        data: {
          name: "Playful Monster Bash",
          description:
            "Fun and friendly Halloween with cartoon monsters and bright colors",
          confidence: 0.75,
          colors: ["green", "purple", "orange"],
          mood: ["playful", "fun", "lighthearted"],
        },
      },
    ];

    // Shuffle options to prevent deterministic first-option bias
    const shuffledOptions = [...fallbackOptions].sort(
      () => Math.random() - 0.5
    );

    const fallback: VerbalizeSamplingOutput<Theme> = {
      options: shuffledOptions,
    };

    const response = await this.client.generateWithFallback<
      VerbalizeSamplingOutput<Theme>
    >(
      {
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 1024,
        temperature: 0.8, // Higher temperature for more creative themes
        responseFormat: "json",
      },
      fallback
    );

    // Log LLM success/failure for observability
    if (response.source === "fallback") {
      console.log(
        `⚠️  ThemeAgent: LLM failed, using fallback templates (${response.latencyMs}ms)`
      );
      if (response.error) {
        console.log(`   Error: ${response.error}`);
      }
    } else {
      console.log(
        `✅ ThemeAgent: LLM generated themes successfully (${response.latencyMs}ms)`
      );
    }

    // Convert to Decision array
    if (!response.success || !response.data) {
      // Use fallback
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
      rationale:
        response.source === "llm" ? "LLM-generated" : "Fallback template",
    }));
  }
}
