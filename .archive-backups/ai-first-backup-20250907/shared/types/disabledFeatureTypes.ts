
/**
 * This file contains type definitions for features that might be disabled
 * or not fully implemented yet. It helps reduce TypeScript errors for these features.
 */

// Additional shape for edge function responses that might have a message field
export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string; // Optional message field for error reporting
  error?: string;   // Optional error field for backward compatibility
}

// Type for handling feature tables that might not exist in the database
export interface FeatureTableData<T = any> {
  [key: string]: any;
  data?: T[];
}

// Helper function to safely access properties in API responses with unknown/any types
export function safePropertyExtract<T = any>(data: any, defaultValue: T): T {
  if (!data) return defaultValue;
  return data as unknown as T;
}

// Helper function to convert any type to a specific type (useful for mocked responses)
export function asType<T>(data: any): T {
  return data as unknown as T;
}
