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

  // Pattern 1: ```json\n{...}\n``` (with or without newline)
  if (cleaned.startsWith("```json")) {
    // Remove ```json (and optional newline) from start
    cleaned = cleaned.replace(/^```json\s*/, "");
    // Remove ``` from end
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3).trim();
    }
  }
  // Pattern 2: ```\n{...}\n```
  else if (cleaned.startsWith("```")) {
    // Remove ``` (and optional newline) from start
    cleaned = cleaned.replace(/^```\s*/, "");
    // Remove ``` from end
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3).trim();
    }
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

  // Find first { or [ to start of JSON
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  let startIndex = -1;
  let isObject = true;

  if (firstBrace !== -1 && firstBracket !== -1) {
    // Both found, use whichever comes first
    startIndex = Math.min(firstBrace, firstBracket);
    isObject = firstBrace < firstBracket;
  } else if (firstBrace !== -1) {
    startIndex = firstBrace;
    isObject = true;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    isObject = false;
  } else {
    // No JSON found
    return cleaned;
  }

  // Find matching closing brace/bracket by counting nesting depth
  let depth = 0;
  const openChar = isObject ? "{" : "[";
  const closeChar = isObject ? "}" : "]";
  let inString = false;
  let escapeNext = false;

  for (let i = startIndex; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === openChar) {
      depth++;
    } else if (char === closeChar) {
      depth--;
      if (depth === 0) {
        // Found matching closing character
        return cleaned.substring(startIndex, i + 1);
      }
    }
  }

  // Couldn't find complete JSON
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
        // All parsing attempts failed - show first 500 chars and actual error
        const preview =
          text.length > 500 ? text.substring(0, 500) + "..." : text;
        const actualError =
          thirdError instanceof Error ? thirdError.message : String(thirdError);
        throw new Error(
          `Failed to parse JSON after 3 attempts. Parse error: ${actualError}. Original text: ${preview}`
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
