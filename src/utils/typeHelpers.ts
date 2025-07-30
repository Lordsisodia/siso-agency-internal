
// Type helpers for working with potentially undefined database query results

/**
 * Safely access property from an object that might be null/undefined
 */
export function safeGet<T>(obj: any, prop: string, defaultValue: T): T {
  if (!obj || typeof obj !== 'object') return defaultValue;
  return (obj[prop] !== undefined && obj[prop] !== null) ? obj[prop] : defaultValue;
}

/**
 * Safely access property from an object that might be null/undefined
 * This is an alias for safeGet to maintain backward compatibility
 */
export function safePropertyAccess<T>(obj: any, prop: string, defaultValue: T): T {
  return safeGet(obj, prop, defaultValue);
}

/**
 * Type utilities for working with database query results
 */
export const typeHelpers = {
  /**
   * Safely cast a database result to any type
   */
  safeCast: <T>(data: unknown): T => {
    return data as T;
  },
  
  /**
   * Extract an id from a potentially problematic query result
   */
  getEntityId: (entity: any): string => {
    if (!entity) return '';
    if (typeof entity === 'object' && 'id' in entity) return String(entity.id);
    if (typeof entity === 'string') return entity;
    return '';
  },
  
  /**
   * Check if a database query result has data
   */
  hasData: (queryResult: any): boolean => {
    return !!queryResult && !!queryResult.data && !queryResult.error;
  }
};

