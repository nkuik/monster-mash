/**
 * Claude Haiku 4.5 API client with retry logic and error handling
 *
 * WHY: Spike 2 validated Claude Haiku 4.5 works well for party planning
 * (1.85s latency, $0.003 per call). This wrapper adds retry logic, token
 * tracking, and graceful error handling.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  CostEstimate,
  LLMPricing,
  LLMRequest,
  LLMResponse,
  TokenUsage,
} from "../types/llm";
import { parseJSON } from "../utils/json-parser";

// Claude Haiku 4.5 pricing (validated in Spike 2)
const HAIKU_PRICING: LLMPricing = {
  model: "claude-haiku-4-5",
  inputPricePerMillion: 1.0, // $1 per million input tokens
  outputPricePerMillion: 5.0, // $5 per million output tokens
};

/**
 * Anthropic API client wrapper
 *
 * WHY: Centralized LLM integration point. All agents use this client to
 * generate content. Handles API key, retry logic, token tracking.
 */
export class AnthropicClient {
  private client: Anthropic;
  private totalTokenUsage: TokenUsage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };
  private callCount = 0;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate content from Claude with retry logic
   *
   * WHY: Main generation method. Returns structured response with success status,
   * data, token usage, and latency for monitoring.
   */
  async generate<T = any>(request: LLMRequest): Promise<LLMResponse<T>> {
    const startTime = Date.now();
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: request.model || HAIKU_PRICING.model,
          max_tokens: request.maxTokens || 1024,
          temperature: request.temperature ?? 0.7,
          system: request.systemPrompt,
          messages: [
            {
              role: "user",
              content: request.prompt,
            },
          ],
        });

        // Extract text content
        const textContent = response.content
          .filter((c) => c.type === "text")
          .map((c) => ("text" in c ? c.text : ""))
          .join("");

        // Track token usage
        const tokenUsage: TokenUsage = {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens:
            response.usage.input_tokens + response.usage.output_tokens,
        };

        this.totalTokenUsage.inputTokens += tokenUsage.inputTokens;
        this.totalTokenUsage.outputTokens += tokenUsage.outputTokens;
        this.totalTokenUsage.totalTokens += tokenUsage.totalTokens;
        this.callCount++;

        // Parse JSON if expected format is JSON
        let data: T;
        if (request.responseFormat === "json") {
          data = parseJSON<T>(textContent);
        } else {
          data = textContent as T;
        }

        const latencyMs = Date.now() - startTime;

        return {
          success: true,
          data,
          tokenUsage,
          latencyMs,
          source: "llm",
        };
      } catch (error) {
        lastError = error as Error;

        // If rate limited, wait before retry with exponential backoff
        if (
          error instanceof Anthropic.APIError &&
          error.status === 429 &&
          attempt < maxRetries - 1
        ) {
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // Other errors, don't retry
        break;
      }
    }

    // All retries failed
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      error: lastError?.message || "Unknown error",
      latencyMs,
      source: "llm",
    };
  }

  /**
   * Generate with automatic fallback to template
   *
   * WHY: FR-050d requires graceful degradation. If LLM fails, use template fallback.
   * Spike 2 validated this pattern works well.
   */
  async generateWithFallback<T = any>(
    request: LLMRequest,
    fallback: T
  ): Promise<LLMResponse<T>> {
    const response = await this.generate<T>(request);

    if (response.success) {
      return response;
    }

    // LLM failed, return fallback
    return {
      success: true,
      data: fallback,
      latencyMs: response.latencyMs,
      source: "fallback",
      error: response.error, // Pass through error for logging
    };
  }

  /**
   * Get total token usage across all calls
   *
   * WHY: SC-016 to SC-019 require cost monitoring. This tracks cumulative token usage.
   */
  getTotalTokenUsage(): TokenUsage {
    return { ...this.totalTokenUsage };
  }

  /**
   * Get call count
   *
   * WHY: Useful for metrics and debugging
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Calculate cost estimate for current session
   *
   * WHY: SC-019 requires cost tracking. This calculates total cost based on
   * token usage and Haiku 4.5 pricing.
   */
  getCostEstimate(): CostEstimate {
    const inputCost =
      (this.totalTokenUsage.inputTokens / 1_000_000) *
      HAIKU_PRICING.inputPricePerMillion;
    const outputCost =
      (this.totalTokenUsage.outputTokens / 1_000_000) *
      HAIKU_PRICING.outputPricePerMillion;
    const totalCost = inputCost + outputCost;

    return {
      inputCost,
      outputCost,
      totalCost,
      callCount: this.callCount,
      avgCostPerCall: this.callCount > 0 ? totalCost / this.callCount : 0,
    };
  }

  /**
   * Reset token usage and call count
   *
   * WHY: Useful for starting fresh session or testing
   */
  reset(): void {
    this.totalTokenUsage = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    };
    this.callCount = 0;
  }
}

/**
 * Singleton instance for global access
 *
 * WHY: Most agents will use same API key and want shared token tracking.
 * This singleton pattern makes it easy to access client anywhere.
 */
let globalClient: AnthropicClient | null = null;

export function getAnthropicClient(): AnthropicClient {
  if (!globalClient) {
    globalClient = new AnthropicClient();
  }
  return globalClient;
}

export function resetAnthropicClient(): void {
  globalClient = null;
}
