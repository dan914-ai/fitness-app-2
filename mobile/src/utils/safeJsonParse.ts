/**
 * Safe JSON parsing utilities to prevent crashes with enhanced date handling
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
 * Safely parse JSON with automatic date conversion
 * @param jsonString - String to parse
 * @param fallback - Default value if parsing fails
 * @returns Parsed object with dates converted
 */
export function safeJsonParseWithDates<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    const parsed = JSON.parse(jsonString, (key, value) => {
      // Convert ISO date strings back to Date objects
      if (typeof value === 'string' && isISODateString(value)) {
        return new Date(value);
      }
      return value;
    });
    return parsed;
  } catch (error) {
    console.warn('JSON parse with dates error:', error);
    return fallback;
  }
}

/**
 * Safely stringify JSON with date preservation
 * @param obj - Object to stringify
 * @param fallback - Default string if stringify fails
 * @returns JSON string with dates as ISO strings
 */
export function safeJsonStringifyWithDates(obj: any, fallback: string = '{}'): string {
  try {
    return JSON.stringify(obj, (key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  } catch (error) {
    console.warn('JSON stringify with dates error:', error);
    return fallback;
  }
}

/**
 * Check if a string is a valid ISO date string
 * @param str - String to check
 * @returns True if valid ISO date string
 */
function isISODateString(str: string): boolean {
  // ISO date format: YYYY-MM-DDTHH:mm:ss.sssZ
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoDateRegex.test(str)) return false;
  
  // Verify it's a valid date
  const date = new Date(str);
  return !isNaN(date.getTime());
}

/**
 * Deep clone an object with date preservation
 * @param obj - Object to clone
 * @returns Deep cloned object
 */
export function deepCloneWithDates<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj) as any;
  if (Array.isArray(obj)) return obj.map(item => deepCloneWithDates(item)) as any;
  
  const cloned = {} as any;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepCloneWithDates(obj[key]);
    }
  }
  return cloned;
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