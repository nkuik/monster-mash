/**
 * SPIKE 2: LLM Content Generation Testing
 *
 * Hypothesis: Claude Haiku 4.5 generates higher quality, more creative party options
 * than hardcoded templates
 *
 * Learn:
 * - Does LLM add enough value to justify API cost and latency?
 * - Are confidence scores meaningful?
 * - How does creativity compare to Spike 1 hardcoded options?
 *
 * Success Criteria:
 * - Claude API returns structured JSON with 3+ theme options
 * - Menu generation incorporates theme context
 * - Fallback templates activate on API failure
 * - Total execution time <10s
 * - LLM options more creative than ["Spooky", "Elegant", "Playful"]
 * - Token usage logged for cost estimation
 */

import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

// Type definitions
type VerbalizeSamplingOutput = {
  context: string;
  options: Array<{ description: string; confidence: number }>;
  timestamp: Date;
  source: "llm" | "fallback";
  tokenUsage?: {
    input: number;
    output: number;
  };
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model configuration
const MODEL = "claude-haiku-4-5";
const MODEL_NAME = "Claude Haiku 4.5"; // For display purposes

/**
 * Strip markdown code fences from LLM response
 * Claude sometimes wraps JSON in ```json ... ```
 */
function stripMarkdownCodeFences(text: string): string {
  // Remove ```json or ``` at start and ``` at end
  return text
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}

/**
 * Generate Halloween party theme options using Claude Haiku 4.5
 * Falls back to template themes if API call fails
 */
async function generateThemeOptions(): Promise<VerbalizeSamplingOutput> {
  try {
    console.log(`🤖 Calling ${MODEL_NAME} for theme options...`);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a creative party planner. Generate 3 unique Halloween party theme options with confidence scores (0-1 scale, where 1.0 is highest confidence).

Return ONLY valid JSON in this exact format:
{
  "options": [
    {"description": "Theme name and brief description", "confidence": 0.9},
    {"description": "Theme name and brief description", "confidence": 0.8},
    {"description": "Theme name and brief description", "confidence": 0.7}
  ]
}

Be creative and specific. Each theme should be distinct and evocative.`,
        },
      ],
    });

    // Parse structured JSON response
    const content = response.content[0];
    if (content.type === "text") {
      const cleanedText = stripMarkdownCodeFences(content.text);
      const parsed = JSON.parse(cleanedText);

      return {
        context: "Halloween party theme selection",
        options: parsed.options,
        timestamp: new Date(),
        source: "llm",
        tokenUsage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      };
    }

    throw new Error("Unexpected response format from Claude");
  } catch (error) {
    console.error(
      "❌ LLM call failed, using fallback templates:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Fallback to templates (same quality as Spike 1 for comparison)
    return {
      context: "Halloween party theme selection (fallback)",
      options: [
        { description: "Spooky Haunted Mansion", confidence: 0.8 },
        { description: "Elegant Masquerade Ball", confidence: 0.7 },
        { description: "Playful Monster Bash", confidence: 0.6 },
      ],
      timestamp: new Date(),
      source: "fallback",
    };
  }
}

/**
 * Generate menu items for a given theme using Claude Haiku 4.5
 * Falls back to template menu items if API call fails
 */
async function generateMenu(theme: string): Promise<VerbalizeSamplingOutput> {
  try {
    console.log(`\n🤖 Calling ${MODEL_NAME} for menu items...`);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a creative party planner. Generate 4 creative menu items for a "${theme}" Halloween party. Each item should be thematic and party-appropriate.

Return ONLY valid JSON in this exact format:
{
  "options": [
    {"description": "Menu item name and brief description", "confidence": 0.9},
    {"description": "Menu item name and brief description", "confidence": 0.85},
    {"description": "Menu item name and brief description", "confidence": 0.8},
    {"description": "Menu item name and brief description", "confidence": 0.75}
  ]
}

Be creative and incorporate the theme throughout. Make it fun and memorable!`,
        },
      ],
    });

    // Parse structured JSON response
    const content = response.content[0];
    if (content.type === "text") {
      const cleanedText = stripMarkdownCodeFences(content.text);
      const parsed = JSON.parse(cleanedText);

      return {
        context: `Menu for ${theme} party`,
        options: parsed.options,
        timestamp: new Date(),
        source: "llm",
        tokenUsage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      };
    }

    throw new Error("Unexpected response format from Claude");
  } catch (error) {
    console.error(
      "❌ LLM call failed, using fallback templates:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Fallback to simple templates (like Spike 1)
    return {
      context: `Menu for ${theme} party (fallback)`,
      options: [
        { description: `${theme} Punch`, confidence: 0.8 },
        { description: `${theme} Sandwiches`, confidence: 0.7 },
        { description: `${theme} Dessert`, confidence: 0.6 },
        { description: `${theme} Snacks`, confidence: 0.5 },
      ],
      timestamp: new Date(),
      source: "fallback",
    };
  }
}

/**
 * Main orchestration function
 * Tests LLM integration and compares to Spike 1 baseline
 */
async function main() {
  console.log("🎃 SPIKE 2: Testing LLM Content Generation vs Templates\n");
  console.log("============================================================\n");

  const startTime = Date.now();
  let totalTokens = { input: 0, output: 0 };

  // Step 1: Generate themes with LLM
  console.log("STEP 1: Generate Theme Options");
  console.log("--------------------------------");
  const themeOutput = await generateThemeOptions();

  if (themeOutput.tokenUsage) {
    totalTokens.input += themeOutput.tokenUsage.input;
    totalTokens.output += themeOutput.tokenUsage.output;
  }

  console.log(
    `\n📊 Theme Options (${
      themeOutput.source === "llm" ? "LLM-Generated" : "FALLBACK"
    }):`
  );
  console.log(JSON.stringify(themeOutput.options, null, 2));

  if (themeOutput.tokenUsage) {
    console.log(
      `\n💰 Tokens Used: ${themeOutput.tokenUsage.input} input + ${themeOutput.tokenUsage.output} output`
    );
  }

  // Step 2: Select highest confidence theme
  const selectedTheme = themeOutput.options.reduce((prev, curr) =>
    curr.confidence > prev.confidence ? curr : prev
  );
  console.log(
    `\n✅ Selected Theme: "${selectedTheme.description}" (confidence: ${selectedTheme.confidence})`
  );

  // Step 3: Generate menu with LLM
  console.log("\n\nSTEP 2: Generate Menu Items");
  console.log("--------------------------------");
  const menuOutput = await generateMenu(selectedTheme.description);

  if (menuOutput.tokenUsage) {
    totalTokens.input += menuOutput.tokenUsage.input;
    totalTokens.output += menuOutput.tokenUsage.output;
  }

  console.log(
    `\n🍽️ Menu Options (${
      menuOutput.source === "llm" ? "LLM-Generated" : "FALLBACK"
    }):`
  );
  console.log(JSON.stringify(menuOutput.options, null, 2));

  if (menuOutput.tokenUsage) {
    console.log(
      `\n💰 Tokens Used: ${menuOutput.tokenUsage.input} input + ${menuOutput.tokenUsage.output} output`
    );
  }

  // Performance and cost summary
  const endTime = Date.now();
  const executionTime = endTime - startTime;

  // Cost calculation (Claude Haiku 4.5 pricing as of 2025-10-31)
  const inputCost = (totalTokens.input / 1000000) * 1.0; // $1.00 per million input tokens
  const outputCost = (totalTokens.output / 1000000) * 5.0; // $5.00 per million output tokens
  const totalCost = inputCost + outputCost;

  console.log(
    "\n\n============================================================"
  );
  console.log("SPIKE 2 RESULTS");
  console.log("============================================================\n");

  console.log(
    `⏱️  Total Execution Time: ${executionTime}ms (${(
      executionTime / 1000
    ).toFixed(2)}s)`
  );
  console.log(
    `${executionTime < 10000 ? "✅" : "❌"} Performance: ${
      executionTime < 10000 ? "PASS" : "FAIL"
    } (<10s requirement)`
  );

  if (totalTokens.input > 0 || totalTokens.output > 0) {
    console.log(
      `\n💰 Total Tokens: ${totalTokens.input} input + ${
        totalTokens.output
      } output = ${totalTokens.input + totalTokens.output} total`
    );
    console.log(`💵 Estimated Cost: $${totalCost.toFixed(4)}`);
    console.log(`   - Input: $${inputCost.toFixed(4)}`);
    console.log(`   - Output: $${outputCost.toFixed(4)}`);
  }

  console.log("\n📝 LEARNINGS:");
  console.log("-------------");

  if (themeOutput.source === "llm" && menuOutput.source === "llm") {
    console.log(
      "✅ LLM Integration: Both theme and menu generated successfully"
    );
    console.log("🎨 Creativity Comparison:");
    console.log('   Spike 1 (hardcoded): ["Spooky", "Elegant", "Playful"]');
    console.log(
      `   Spike 2 (LLM): [${themeOutput.options
        .map((o) => `"${o.description.split(/[,.!]/)[0]}"`)
        .join(", ")}]`
    );
    console.log("\n📊 Quality Assessment:");
    console.log("   - Are LLM themes more descriptive and evocative?");
    console.log("   - Does menu incorporate theme details (not generic)?");
    console.log("   - Are confidence scores meaningful or random?");
  } else {
    console.log("⚠️  LLM Integration: Fallback templates were used");
    console.log(
      "❓ API Key Status: Check if ANTHROPIC_API_KEY is set correctly"
    );
    console.log(
      `   Current value: ${
        process.env.ANTHROPIC_API_KEY
          ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + "..."
          : "NOT SET"
      }`
    );
  }

  console.log("\n🤔 DECISION CRITERIA:");
  console.log("--------------------");
  console.log("Continue with LLM if:");
  console.log(
    `  ${
      executionTime < 5000 ? "✅" : "❌"
    } Latency acceptable (<5s per agent): ${(executionTime / 1000).toFixed(2)}s`
  );
  console.log(
    `  ${
      totalTokens.input + totalTokens.output > 0 && totalCost < 0.5
        ? "✅"
        : totalTokens.input + totalTokens.output === 0
        ? "❓"
        : "❌"
    } Cost reasonable (<$0.50 per plan): $${totalCost.toFixed(4)}`
  );
  console.log(
    `  ${
      themeOutput.source === "llm" && menuOutput.source === "llm" ? "✅" : "❌"
    } Creativity significantly better than templates`
  );
  console.log(
    `  ${
      themeOutput.source === "llm" &&
      themeOutput.options.some((o) => o.description.length > 30)
        ? "✅"
        : "❌"
    } Content quality and detail superior`
  );

  console.log("\nPivot to templates if:");
  console.log(
    `  ${executionTime > 10000 ? "✅" : "❌"} Too slow (>10s): ${(
      executionTime / 1000
    ).toFixed(2)}s`
  );
  console.log(
    `  ${
      totalCost > 0.5 ? "✅" : "❌"
    } Too expensive (>$0.50 per plan): $${totalCost.toFixed(4)}`
  );
  console.log(
    `  ${
      themeOutput.source === "fallback" || menuOutput.source === "fallback"
        ? "✅"
        : "❌"
    } API reliability issues`
  );
  console.log(
    `  ${
      themeOutput.source === "llm" &&
      themeOutput.options.every((o) => o.description.length < 30)
        ? "✅"
        : "❌"
    } Marginal quality improvement`
  );

  console.log(
    "\n============================================================\n"
  );
}

// Execute spike
main().catch(console.error);
