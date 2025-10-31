/**
 * Base prompts and verbalized sampling instructions
 *
 * WHY: FR-014 to FR-017a require verbalized sampling (3-5 options with confidence).
 * FR-053c requires explicit "no code fences" instruction. This module provides
 * reusable prompt templates validated in Spike 2-3.
 */

/**
 * Base verbalized sampling instructions for all agents
 *
 * WHY: Every agent must generate multiple options with confidence scores.
 * This instruction block ensures consistent output format across all agents.
 * Validated in Spike 2-3.
 */
export const VERBALIZED_SAMPLING_INSTRUCTIONS = `
IMPORTANT - Verbalized Sampling: You MUST always generate multiple options (minimum 3, recommended 3-5) with confidence scores from 0.0 to 1.0.

Confidence Score Guidelines:
- High confidence (0.8-1.0): Strong, mainstream, proven options
- Medium confidence (0.5-0.7): Viable alternatives, creative but reasonable
- Lower confidence (0.3-0.4): Experimental, risky, or compromise options

Your response must be valid JSON with this structure:
{
  "options": [
    {
      "description": "Brief human-readable description",
      "confidence": 0.92,
      "data": { ...detailed structured data... }
    }
  ]
}
`.trim();

/**
 * JSON formatting instructions (no code fences)
 *
 * WHY: FR-053c requires instructing Claude NOT to use code fences around JSON.
 * This prevents parsing issues validated in Spike 2.
 */
export const JSON_FORMAT_INSTRUCTIONS = `
CRITICAL: Output ONLY valid JSON. Do NOT wrap your response in markdown code fences like \`\`\`json or \`\`\`. Output the JSON directly.
`.trim();

/**
 * Theme generation prompt template
 *
 * WHY: FR-018 to FR-023 require ThemeAgent to generate party themes.
 * This template incorporates verbalized sampling and user constraints.
 */
export function createThemePrompt(constraints: {
  date: string;
  guestCount: number;
  budget: number;
}): string {
  return `
Generate 3-5 unique Halloween party theme options for a party with these constraints:
- Date: ${constraints.date}
- Guest Count: ${constraints.guestCount}
- Budget: $${constraints.budget}

Each theme should be creative, evocative, and feasible within the budget. Include:
- A memorable theme name
- Detailed description with atmosphere and vibe
- Suggested color palette
- Mood keywords

${VERBALIZED_SAMPLING_INSTRUCTIONS}

${JSON_FORMAT_INSTRUCTIONS}

Example output structure:
{
  "options": [
    {
      "description": "Gothic Vampire Soirée",
      "confidence": 0.92,
      "data": {
        "name": "Gothic Vampire Soirée",
        "description": "Elegant darkness with candlelit ambiance, deep crimson décor, and sophisticated eeriness",
        "colors": ["crimson", "black", "gold"],
        "mood": ["elegant", "mysterious", "dramatic"]
      }
    }
  ]
}
`.trim();
}

/**
 * Menu generation prompt template
 *
 * WHY: FR-024 to FR-031 require FoodAgent to generate theme-appropriate menu.
 * This template ensures menu items align with theme and respect constraints.
 */
export function createMenuPrompt(
  theme: { name: string; description: string },
  constraints: {
    guestCount: number;
    budget: number;
    dietaryRestrictions?: string[];
  }
): string {
  const dietaryText = constraints.dietaryRestrictions?.length
    ? `\n- Dietary Restrictions: ${constraints.dietaryRestrictions.join(", ")}`
    : "";

  return `
Generate 4-6 Halloween-themed menu items for a "${theme.name}" party:
Theme Description: ${theme.description}
- Guest Count: ${constraints.guestCount}
- Budget: $${constraints.budget}${dietaryText}

Each menu item should:
- Align with the theme atmosphere
- Be creative and festive
- Include estimated cost per serving
- Be feasible to prepare or purchase

${VERBALIZED_SAMPLING_INSTRUCTIONS}

${JSON_FORMAT_INSTRUCTIONS}

Example output structure:
{
  "options": [
    {
      "description": "Bloody Mary Cocktail Bar",
      "confidence": 0.91,
      "data": {
        "name": "Bloody Mary Cocktail Bar",
        "description": "Interactive station with tomato juice, vodka, creative garnishes shaped like fangs and bats",
        "costPerServing": 3.50,
        "servings": ${constraints.guestCount},
        "dietaryTags": ["vegetarian", "gluten-free"]
      }
    }
  ]
}
`.trim();
}

/**
 * Decoration prompt template
 *
 * WHY: FR-032 to FR-037 require DecoratorAgent to suggest decorations
 */
export function createDecorationPrompt(
  theme: { name: string; description: string; colors?: string[] },
  constraints: { budget: number; venue?: { indoor?: boolean } }
): string {
  const venueText = constraints.venue?.indoor
    ? " (indoor venue)"
    : " (outdoor venue)";
  const colorText = theme.colors?.length
    ? `\nTheme Colors: ${theme.colors.join(", ")}`
    : "";

  return `
Generate 4-6 decoration items for a "${theme.name}" party${venueText}:
Theme Description: ${theme.description}${colorText}
- Budget: $${constraints.budget}

Each decoration should:
- Enhance the theme atmosphere
- Be visually impactful
- Include estimated cost
- Be feasible to source or DIY

${VERBALIZED_SAMPLING_INSTRUCTIONS}

${JSON_FORMAT_INSTRUCTIONS}

Example output structure:
{
  "options": [
    {
      "description": "Candlelit chandeliers",
      "confidence": 0.88,
      "data": {
        "name": "Candlelit chandeliers",
        "description": "Dramatic hanging chandeliers with LED candles for safe ambiance",
        "estimatedCost": 75.00,
        "quantity": 3
      }
    }
  ]
}
`.trim();
}

/**
 * Playlist curation prompt template
 *
 * WHY: FR-046 to FR-049 require DJAgent to curate themed playlist
 */
export function createPlaylistPrompt(theme: {
  name: string;
  description: string;
  mood?: string[];
}): string {
  const moodText = theme.mood?.length
    ? `\nTheme Mood: ${theme.mood.join(", ")}`
    : "";

  return `
Curate a Halloween party playlist for a "${theme.name}" party:
Theme Description: ${theme.description}${moodText}

IMPORTANT: Generate 1-2 playlist options ONLY. Each playlist should have 5-8 songs.
Keep descriptions concise (1-2 sentences maximum).

The playlist should:
- Match the theme atmosphere perfectly
- Mix classic Halloween tracks with theme-appropriate music
- Consider pacing (energetic vs atmospheric)

${VERBALIZED_SAMPLING_INSTRUCTIONS}

${JSON_FORMAT_INSTRUCTIONS}

Example output structure:
{
  "options": [
    {
      "description": "Gothic Vampire Evening Soundscape",
      "confidence": 0.89,
      "data": {
        "name": "Gothic Vampire Evening Soundscape",
        "description": "Classical and dark ambient tracks creating eeriness",
        "songs": [
          "Toccata and Fugue in D Minor - Bach",
          "Moonlight Sonata - Beethoven",
          "Carmina Burana - Carl Orff",
          "Danse Macabre - Saint-Saëns",
          "Night on Bald Mountain - Mussorgsky"
        ],
        "durationMinutes": 180
      }
    }
  ]
}
`.trim();
}

/**
 * Get base system prompt for all agents
 *
 * WHY: Common instructions that apply to all agents regardless of role
 */
export function getBaseSystemPrompt(): string {
  return `
You are an expert party planning agent specializing in Halloween events. Your role is to provide creative, feasible, and budget-conscious suggestions.

Always consider:
- Theme coherence across all elements
- Budget constraints
- Guest experience and safety
- Feasibility of implementation

${VERBALIZED_SAMPLING_INSTRUCTIONS}

${JSON_FORMAT_INSTRUCTIONS}
`.trim();
}
