/**
 * Type Helper Utilities
 */

/**
 * Safely get a nested property from an object
 */
export function safeGet<T = any>(obj: any, path: string, defaultValue?: T): T {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T;
    }
    result = result[key];
  }

  return result !== undefined ? result : (defaultValue as T);
}

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if a value is not empty
 */
export function isNotEmpty<T>(value: T | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' || Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Type guard for checking if something is a promise
 */
export function isPromise<T>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function';
}
