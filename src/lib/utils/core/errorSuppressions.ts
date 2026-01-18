import { supabase } from "@/services/integrations/supabase/client";
import { logger } from "./logger";

/**
 * Safely access a property from an object with a default value if it doesn't exist
 * This helps prevent TypeErrors when accessing nested properties that might be undefined
 */
export function safePropertyAccess<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return (current === undefined || current === null) ? defaultValue : current as T;
}

/**
 * Mock types for tables that don't exist in the Database type
 * This helps with TypeScript errors when dealing with tables not in the schema
 */
export interface MockTypes {
  ai_news: {
    id: string;
    title: string;
    description?: string;
    content?: string;
    date?: string;
    category?: string;
    created_at: string;
    status?: string;
  };
  ai_news_summaries: {
    id: string;
    news_id: string;
    summary: string;
    created_at: string;
  };
  core_tools: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    rating?: number;
    downloads_count?: number;
    created_at?: string;
    youtube_videos?: any[];
    youtube_url?: string;
    likes_count?: number;
    pricing_type?: string;
    website_url?: string;
    docs_url?: string;
    github_url?: string;
    tags?: string[];
    assistant_type?: string;
    profile_image_url?: string;
    member_type?: string;
    specialization?: string[];
    content_themes?: string[];
    use_cases?: string[];
  };
}

/**
 * Enhanced query function for tables not in the Database type
 * This helps bypass TypeScript errors for tables that don't exist in the Database type
 * @returns A query builder that bypasses TypeScript's type checking
 */
export function enhancedTableQuery(tableName: string) {
  // Use the any type to bypass TypeScript's type checking
  return supabase.from(tableName as any);
}

/**
 * Type-safe table query function
 * This helps with tables that are not in the Database type
 */
export function safeTableQuery(tableName: string) {
  // Use the any type to bypass TypeScript's type checking
  return supabase.from(tableName as any);
}

/**
 * Cast data to a specific mock type
 * This helps with tables not in the Database type
 */
export function castToMockType<K extends keyof MockTypes>(data: any): MockTypes[K] {
  return data as MockTypes[K];
}

/**
 * Cast array data to a specific mock type array
 * This helps with arrays of data from tables not in the Database type
 */
export function castToMockTypeArray<K extends keyof MockTypes>(data: any[]): MockTypes[K][] {
  return data as MockTypes[K][];
}

/**
 * Enhanced Error Rate Limiting
 * Prevents spam errors from flooding the console
 */
class ErrorRateLimiter {
  private errorCounts = new Map<string, { count: number; lastSeen: number }>();
  private readonly MAX_ERRORS_PER_MINUTE = 5;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute

  constructor() {
    // Clean up old error counts periodically
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  /**
   * Check if an error should be logged or suppressed
   */
  shouldLog(errorKey: string): boolean {
    const now = Date.now();
    const existing = this.errorCounts.get(errorKey);

    if (!existing) {
      this.errorCounts.set(errorKey, { count: 1, lastSeen: now });
      return true;
    }

    // Reset count if it's been more than a minute
    if (now - existing.lastSeen > this.CLEANUP_INTERVAL) {
      this.errorCounts.set(errorKey, { count: 1, lastSeen: now });
      return true;
    }

    existing.count++;
    existing.lastSeen = now;

    return existing.count <= this.MAX_ERRORS_PER_MINUTE;
  }

  /**
   * Clean up old error entries
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.errorCounts.entries()) {
      if (now - data.lastSeen > this.CLEANUP_INTERVAL) {
        this.errorCounts.delete(key);
      }
    }
  }
}

// Global rate limiter instance
const errorRateLimiter = new ErrorRateLimiter();

/**
 * Rate-limited error logging
 * Prevents the same error from spamming the console
 */
export function rateLimitedError(errorKey: string, message: string, ...args: any[]) {
  if (errorRateLimiter.shouldLog(errorKey)) {
    logger.error(message, ...args);
  } else {
    // Log once that we're suppressing errors
    if (errorRateLimiter.shouldLog(`suppressed-${errorKey}`)) {
      logger.warn(`🚫 Suppressing repeated error: ${errorKey} (rate limited)`);
    }
  }
}

/**
 * Rate-limited warning logging
 */
export function rateLimitedWarn(warnKey: string, message: string, ...args: any[]) {
  if (errorRateLimiter.shouldLog(warnKey)) {
    logger.warn(message, ...args);
  }
}

/**
 * Safe function execution with error suppression
 * Prevents functions from crashing and spamming errors
 */
export function safeExecute<T>(
  fn: () => T, 
  defaultValue: T, 
  errorKey?: string
): T {
  try {
    return fn();
  } catch (error) {
    const key = errorKey || `safe-execute-${error instanceof Error ? error.name : 'unknown'}`;
    rateLimitedError(key, `Safe execution failed: ${error}`, error);
    return defaultValue;
  }
}

/**
 * Safe async function execution
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>, 
  defaultValue: T, 
  errorKey?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const key = errorKey || `safe-execute-async-${error instanceof Error ? error.name : 'unknown'}`;
    rateLimitedError(key, `Safe async execution failed: ${error}`, error);
    return defaultValue;
  }
}
