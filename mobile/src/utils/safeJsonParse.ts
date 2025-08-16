/**
 * Safe JSON parsing utilities to prevent crashes
 */

/**
 * Safely parse JSON with fallback
 * @param jsonString - String to parse
 * @param fallback - Default value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Safely stringify JSON
 * @param obj - Object to stringify
 * @param fallback - Default string if stringify fails
 * @returns JSON string or fallback
 */
export function safeJsonStringify(obj: any, fallback: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('JSON stringify error:', error);
    return fallback;
  }
}

/**
 * Parse JSON and validate with a schema
 * @param jsonString - String to parse
 * @param validator - Function to validate parsed object
 * @param fallback - Default value if parsing/validation fails
 */
export function parseAndValidate<T>(
  jsonString: string | null | undefined,
  validator: (obj: any) => obj is T,
  fallback: T
): T {
  const parsed = safeJsonParse(jsonString, null);
  if (parsed && validator(parsed)) {
    return parsed;
  }
  return fallback;
}