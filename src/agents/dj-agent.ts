/**
 * DJAgent - Curates themed music playlists
 *
 * WHY: FR-046 to FR-049 require playlist generation matching theme atmosphere
 */

import { getAnthropicClient } from "../llm/anthropic-client";
import { combinePrompts, getPersonality } from "../llm/personalities";
import { createPlaylistPrompt } from "../llm/prompts";
import type { Agent, Decision } from "../types/agent";
import type { VerbalizeSamplingOutput } from "../types/llm";
import type { PartyConstraints, Playlist, Theme } from "../types/party";

export class DJAgent implements Agent {
  id = "dj";
  private client = getAnthropicClient();

  async decide(input: any): Promise<Decision> {
    const { theme, constraints } = input as {
      theme: Theme;
      constraints: PartyConstraints;
    };

    const personality = getPersonality(constraints.personality);

    const userPrompt = createPlaylistPrompt(theme);

    const systemPrompt = combinePrompts(
      "You are a music curation expert specializing in Halloween party atmospheres.",
      personality
    );

    const fallback: VerbalizeSamplingOutput<Playlist> = {
      options: [
        {
          description: "Classic Halloween Hits",
          confidence: 0.85,
          data: {
            name: "Classic Halloween Hits",
            description:
              "Mix of Halloween classics and spooky atmosphere tracks",
            songs: [
              "Monster Mash - Bobby Pickett",
              "Thriller - Michael Jackson",
              "Ghostbusters - Ray Parker Jr.",
              "Somebody's Watching Me - Rockwell",
              "Time Warp - Rocky Horror",
            ],
            confidence: 0.85,
            durationMinutes: 120,
          },
        },
      ],
    };

    const response = await this.client.generateWithFallback<
      VerbalizeSamplingOutput<Playlist>
    >(
      {
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 1536,
        temperature: 0.8,
        responseFormat: "json",
      },
      fallback
    );

    if (!response.success || !response.data) {
      return {
        agentId: this.id,
        description: fallback.options[0].description,
        confidence: fallback.options[0].confidence,
        data: fallback.options[0].data,
      };
    }

    const firstOption = response.data.options[0];
    return {
      agentId: this.id,
      description: firstOption.description,
      confidence: firstOption.confidence,
      data: firstOption.data,
    };
  }
}
