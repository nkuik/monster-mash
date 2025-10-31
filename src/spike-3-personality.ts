/**
 * SPIKE 3: LLM Personality Testing
 *
 * Hypothesis: Different personality traits in LLM system prompts produce
 * observably different agent behaviors and decision outputs
 *
 * Learn:
 * - Do Claude system prompts reliably shape LLM behavior across calls?
 * - Are personality-driven variations meaningful or superficial?
 * - Would personality debates (frugal vs perfectionist) be engaging to observe?
 * - Is the prompt engineering complexity worth the personality benefits?
 *
 * Success Criteria:
 * - Frugal personality mentions budget/cost in menu suggestions
 * - Perfectionist personality emphasizes quality/aesthetics and premium ingredients
 * - Adventurous personality suggests unconventional or creative menu ideas
 * - Outputs are observably different (not just rephrased versions)
 * - Personality differences create variations that would make agent debates engaging
 */

import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

// Type definitions
type Personality = {
  name: string;
  systemPrompt: string;
};

type MenuItem = {
  description: string;
  confidence: number;
};

type MenuOutput = {
  personality: string;
  theme: string;
  menuItems: MenuItem[];
  rawResponse: string;
  timestamp: Date;
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model configuration (reuse from spike-2)
const MODEL = "claude-haiku-4-5";
const MODEL_NAME = "Claude Haiku 4.5";

/**
 * Strip markdown code fences from LLM response
 * Claude sometimes wraps JSON in ```json ... ``` and adds extra text
 */
function stripMarkdownCodeFences(text: string): string {
  // First, try to extract JSON from code fence if present
  const codeFenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeFenceMatch) {
    return codeFenceMatch[1].trim();
  }

  // Otherwise, just remove any leading/trailing code fence markers
  return text
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}

/**
 * Extract JSON object from text that may contain explanatory text
 * Looks for the first complete JSON object in the response
 */
function extractJSON(text: string): any {
  // Try to find JSON object pattern
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("No JSON object found in response");
}

/**
 * Define 3 distinct personality types for testing
 */
const personalities: Personality[] = [
  {
    name: "Frugal Budget-Conscious",
    systemPrompt:
      "You are a budget-conscious party planner who prioritizes cost savings and value. " +
      "Always suggest affordable options and mention approximate prices. " +
      "Be practical and frugal in recommendations. " +
      "Focus on getting the best bang for your buck.\n\n" +
      "IMPORTANT - Verbalized Sampling: You MUST always generate multiple options (minimum 3) with confidence scores. " +
      "For each option, provide a confidence score from 0.0 to 1.0 indicating how well it fits the requirements. " +
      "Higher scores (0.8-1.0) indicate strong confidence, medium scores (0.5-0.7) indicate viable alternatives, " +
      "lower scores (0.3-0.4) indicate compromises. Present diverse alternatives to enable informed decision-making.",
  },
  {
    name: "Perfectionist Quality-Focused",
    systemPrompt:
      "You are a perfectionist party planner who prioritizes quality and aesthetics above all. " +
      "Suggest premium options and emphasize visual impact and attention to detail. " +
      "Be quality-driven in recommendations. " +
      "Don't compromise on excellence for cost savings.\n\n" +
      "IMPORTANT - Verbalized Sampling: You MUST always generate multiple options (minimum 3) with confidence scores. " +
      "For each option, provide a confidence score from 0.0 to 1.0 indicating how well it meets your quality standards. " +
      "Higher scores (0.8-1.0) indicate exceptional quality, medium scores (0.5-0.7) indicate acceptable quality, " +
      "lower scores (0.3-0.4) indicate compromises on aesthetics or craftsmanship. Present diverse quality tiers to enable choice.",
  },
  {
    name: "Adventurous Risk-Taker",
    systemPrompt:
      "You are an adventurous party planner who loves unique and bold ideas. " +
      "Suggest unconventional options and creative risks. " +
      "Be innovative and daring in recommendations. " +
      "Think outside the box and surprise guests.\n\n" +
      "IMPORTANT - Verbalized Sampling: You MUST always generate multiple options (minimum 3) with confidence scores. " +
      "For each option, provide a confidence score from 0.0 to 1.0 indicating how bold and innovative it is. " +
      "Higher scores (0.8-1.0) indicate truly daring ideas, medium scores (0.5-0.7) indicate moderately adventurous choices, " +
      "lower scores (0.3-0.4) indicate safer creative options. Present a range of risk levels to enable informed boldness.",
  },
];

/**
 * Generate menu items for a theme using a specific personality
 */
async function generateMenuWithPersonality(
  theme: string,
  personality: Personality
): Promise<MenuOutput> {
  try {
    console.log(
      `🤖 Calling ${MODEL_NAME} with ${personality.name} personality...`
    );

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: personality.systemPrompt, // Personality shapes LLM behavior (includes verbalized sampling instructions)
      messages: [
        {
          role: "user",
          content: `Generate 3 menu items for a "${theme}" Halloween party.

IMPORTANT: Return ONLY valid JSON in this exact format with no additional text:
{"items": [
  {"description": "item 1 description", "confidence": 0.9},
  {"description": "item 2 description", "confidence": 0.8},
  {"description": "item 3 description", "confidence": 0.7}
]}

Each item must have a description and a confidence score (0.0-1.0). Do not include explanations outside the JSON object.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      const cleanedText = stripMarkdownCodeFences(content.text);

      try {
        // Try extracting JSON if there's extra text
        const parsed = extractJSON(cleanedText);

        // Parse items - handle both old format (string[]) and new format (MenuItem[])
        const items = parsed.items || [];
        const menuItems: MenuItem[] = items.map((item: any) => {
          if (typeof item === "string") {
            // Backward compatibility: old format was just strings
            return { description: item, confidence: 0.0 };
          }
          // New format: objects with description and confidence
          return {
            description: item.description || String(item),
            confidence: item.confidence || 0.0,
          };
        });

        return {
          personality: personality.name,
          theme,
          menuItems,
          rawResponse: content.text,
          timestamp: new Date(),
        };
      } catch (parseError) {
        console.warn(
          `⚠️  JSON parsing failed for ${personality.name}, using raw text`
        );
        // Fallback: return raw response if JSON parsing fails
        return {
          personality: personality.name,
          theme,
          menuItems: [{ description: content.text, confidence: 0.0 }],
          rawResponse: content.text,
          timestamp: new Date(),
        };
      }
    }

    throw new Error("Unexpected response format from Claude");
  } catch (error) {
    console.error(
      `❌ LLM call failed for ${personality.name}:`,
      error instanceof Error ? error.message : error
    );

    // Fallback to generic menu items
    return {
      personality: personality.name,
      theme,
      menuItems: [
        { description: "Halloween-themed appetizers", confidence: 0.0 },
        { description: "Seasonal main dish", confidence: 0.0 },
        { description: "Spooky dessert", confidence: 0.0 },
      ],
      rawResponse: `Error: ${error}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Main execution: Test same theme with all 3 personalities
 */
async function main() {
  console.log("=".repeat(80));
  console.log("SPIKE 3: LLM Personality Testing");
  console.log("=".repeat(80));
  console.log(`Model: ${MODEL_NAME}`);
  console.log(`Theme: Testing with same Halloween party theme`);
  console.log(`Personalities: ${personalities.length} variations\n`);

  const theme = "Spooky Haunted Mansion";
  const results: MenuOutput[] = [];

  const startTime = Date.now();

  // Test each personality sequentially
  for (const personality of personalities) {
    console.log("\n" + "=".repeat(60));
    console.log(`Personality: ${personality.name}`);
    console.log("=".repeat(60) + "\n");

    const output = await generateMenuWithPersonality(theme, personality);
    results.push(output);

    console.log("Menu Items:");
    output.menuItems.forEach((item, index) => {
      console.log(
        `  ${index + 1}. [${item.confidence.toFixed(2)}] ${item.description}`
      );
    });

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const endTime = Date.now();
  const executionTime = endTime - startTime;

  // Summary comparison
  console.log("\n" + "=".repeat(80));
  console.log("COMPARISON SUMMARY");
  console.log("=".repeat(80) + "\n");

  results.forEach((result) => {
    console.log(`${result.personality}:`);
    result.menuItems.forEach((item) =>
      console.log(`  - [${item.confidence.toFixed(2)}] ${item.description}`)
    );
    console.log();
  });

  // Analysis
  console.log("=".repeat(80));
  console.log("LEARNINGS & EVALUATION");
  console.log("=".repeat(80) + "\n");

  console.log(`⏱️  Total execution time: ${executionTime}ms\n`);

  console.log("QUESTIONS TO EVALUATE:\n");

  console.log("1. Are outputs observably different across personalities?");
  console.log(
    "   → Compare menu items above - do they reflect different priorities?\n"
  );

  console.log('2. Does "Frugal" personality mention costs/budget?');
  const frugalResult = results.find((r) => r.personality.includes("Frugal"));
  const mentionsCost =
    frugalResult?.menuItems.some((item) =>
      /\$|budget|cheap|affordable|cost|price/i.test(item.description)
    ) ||
    frugalResult?.rawResponse.includes("$") ||
    frugalResult?.rawResponse.includes("budget");
  console.log(
    `   → ${mentionsCost ? "✅ YES" : "❌ NO"} - Check items above\n`
  );

  console.log(
    '3. Does "Perfectionist" personality emphasize quality/aesthetics?'
  );
  const perfectionistResult = results.find((r) =>
    r.personality.includes("Perfectionist")
  );
  const emphasizesQuality =
    perfectionistResult?.menuItems.some((item) =>
      /premium|artisan|gourmet|elegant|quality|craft|detail|aesthetic/i.test(
        item.description
      )
    ) ||
    perfectionistResult?.rawResponse.match(
      /premium|artisan|gourmet|elegant|quality/i
    );
  console.log(
    `   → ${emphasizesQuality ? "✅ YES" : "❌ NO"} - Check items above\n`
  );

  console.log(
    '4. Does "Adventurous" personality suggest unconventional ideas?'
  );
  const adventurousResult = results.find((r) =>
    r.personality.includes("Adventurous")
  );
  const suggestsUnique =
    adventurousResult?.menuItems.some((item) =>
      /unique|bold|daring|unconventional|creative|surprising|exotic|unusual/i.test(
        item.description
      )
    ) ||
    adventurousResult?.rawResponse.match(
      /unique|bold|daring|unconventional|creative/i
    );
  console.log(
    `   → ${suggestsUnique ? "✅ YES" : "❌ NO"} - Check items above\n`
  );

  console.log(
    "5. Would personality-driven debates be engaging to observe in agent logs?"
  );
  console.log(
    "   → Imagine agents arguing these different approaches - compelling?\n"
  );

  console.log("6. Is the prompt engineering complexity worth the benefit?");
  console.log(
    "   → Compare value of personality variety vs simpler neutral prompts\n"
  );

  // Decision recommendation
  console.log("=".repeat(80));
  console.log("DECISION RECOMMENDATION");
  console.log("=".repeat(80) + "\n");

  const allDifferent = results.every(
    (r1, i) =>
      !results
        .slice(i + 1)
        .some((r2) => r1.menuItems.join() === r2.menuItems.join())
  );

  if (allDifferent && (mentionsCost || emphasizesQuality || suggestsUnique)) {
    console.log("✅ RECOMMEND: KEEP LLM PERSONALITIES");
    console.log("   Rationale: Outputs show meaningful behavioral differences");
    console.log("   - Personality traits are observable in generated content");
    console.log("   - Agent debates would be engaging and diverse");
    console.log(
      "   - System prompt engineering adds value to user experience\n"
    );
  } else {
    console.log("⚠️  RECOMMEND: SKIP PERSONALITIES (Use Neutral Prompts)");
    console.log(
      "   Rationale: Personality differences are superficial or minimal"
    );
    console.log("   - Outputs too similar across personalities");
    console.log("   - Prompt complexity not justified by behavioral variety");
    console.log("   - Simpler neutral prompts would suffice\n");
  }

  console.log("Next Steps:");
  console.log("- [ ] Document findings in docs/spike-results.md");
  console.log("- [ ] Update plan.md with personality decision");
  console.log("- [ ] If keeping personalities: Implement in full agent system");
  console.log(
    "- [ ] If skipping personalities: Use single neutral prompt for all agents\n"
  );
}

// Run the spike
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
