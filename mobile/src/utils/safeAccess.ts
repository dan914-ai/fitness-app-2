/**
 * Safe property access utilities to prevent crashes from null/undefined
 */

/**
 * Safely access nested object properties
 * @param obj - Object to access
 * @param path - Property path (e.g., 'user.profile.name')
 * @param defaultValue - Default value if path doesn't exist
 */
export function safeGet<T = any>(obj: any, path: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result ?? defaultValue;
}

/**
 * Safe array access with bounds checking
 * @param array - Array to access
 * @param index - Index to access
 * @param defaultValue - Default value if index is out of bounds
 */
export function safeArrayAccess<T>(array: T[] | null | undefined, index: number, defaultValue: T | null = null): T | null {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index];
}

/**
 * Check if value is non-null and non-undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safe property check
 */
export function hasProperty(obj: any, prop: string): boolean {
  return obj != null && typeof obj === 'object' && prop in obj;
}

/**
 * Safe function call with error handling
 */
export async function safeTry<T>(
  fn: () => T | Promise<T>,
  defaultValue: T,
  errorHandler?: (error: any) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      console.warn('Safe try caught error:', error);
    }
    return defaultValue;
  }
}