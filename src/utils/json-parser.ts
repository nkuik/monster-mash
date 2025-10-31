/**
 * JSON parser utilities with robust code fence stripping
 *
 * WHY: FR-053c requires handling Claude's tendency to wrap JSON in ```json fences.
 * Spike 2-3 validated these helper functions ensure reliable JSON parsing even
 * when Claude adds markdown formatting.
 */

/**
 * Strip markdown code fences from text
 *
 * WHY: Claude sometimes wraps JSON responses in ```json...``` or ```...``` blocks.
 * This removes those wrappers to get clean JSON for parsing.
 * Validated in Spike 2.
 */
export function stripMarkdownCodeFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  let cleaned = text.trim();

  // Pattern 1: ```json\n{...}\n```
  if (cleaned.startsWith("```json") && cleaned.endsWith("```")) {
    cleaned = cleaned.slice(7, -3).trim();
  }
  // Pattern 2: ```\n{...}\n```
  else if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    cleaned = cleaned.slice(3, -3).trim();
  }

  return cleaned;
}

/**
 * Extract JSON object from text that may contain explanatory text
 *
 * WHY: Sometimes Claude adds explanatory text before/after JSON like
 * "Here's the menu: {...}". This extracts the first complete JSON object.
 * Validated in Spike 3.
 */
export function extractJSON(text: string): string {
  // First strip any code fences
  const cleaned = stripMarkdownCodeFences(text);

  // Try to find JSON object or array using regex
  // Look for {...} or [...]
  const objectMatch = cleaned.match(/\{[\s\S]*\}/)?.[0];
  if (objectMatch) {
    return objectMatch;
  }

  const arrayMatch = cleaned.match(/\[[\s\S]*\]/)?.[0];
  if (arrayMatch) {
    return arrayMatch;
  }

  // If no match, return cleaned text as-is
  return cleaned;
}

/**
 * Parse JSON with robust error handling and code fence stripping
 *
 * WHY: Main parsing function used throughout codebase. Combines code fence
 * stripping, JSON extraction, and error handling in one place.
 */
export function parseJSON<T = any>(text: string): T {
  try {
    // Try direct parse first (fast path)
    return JSON.parse(text);
  } catch (firstError) {
    try {
      // Strip code fences and try again
      const stripped = stripMarkdownCodeFences(text);
      return JSON.parse(stripped);
    } catch (secondError) {
      try {
        // Extract JSON from explanatory text and try again
        const extracted = extractJSON(text);
        return JSON.parse(extracted);
      } catch (thirdError) {
        // All parsing attempts failed
        throw new Error(
          `Failed to parse JSON after 3 attempts. Original text: ${text.substring(
            0,
            200
          )}...`
        );
      }
    }
  }
}

/**
 * Safely parse JSON with fallback value
 *
 * WHY: Sometimes we want to gracefully handle parse failures without throwing.
 * Returns fallback value if parsing fails.
 */
export function parseJSONSafe<T = any>(text: string, fallback: T): T {
  try {
    return parseJSON<T>(text);
  } catch (error) {
    return fallback;
  }
}

/**
 * Validate that parsed JSON matches expected structure
 *
 * WHY: Even if JSON parses successfully, it might not have expected fields.
 * This validates presence of required keys.
 */
export function validateJSONStructure(
  obj: any,
  requiredKeys: string[]
): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  for (const key of requiredKeys) {
    if (!(key in obj)) {
      return false;
    }
  }

  return true;
}

/**
 * Parse and validate JSON in one step
 *
 * WHY: Convenience function combining parsing and validation. Throws descriptive
 * error if validation fails.
 */
export function parseAndValidateJSON<T = any>(
  text: string,
  requiredKeys: string[]
): T {
  const parsed = parseJSON<T>(text);

  if (!validateJSONStructure(parsed, requiredKeys)) {
    throw new Error(
      `JSON validation failed. Missing required keys: ${requiredKeys.join(
        ", "
      )}`
    );
  }

  return parsed;
}
