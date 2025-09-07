/**
 * 🔌 API Types
 */

export const AI_INTERFACE = {
  purpose: "API request/response types",
  exports: ["APIResponse", "APIError"],
  patterns: ["types-only"]
};

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface APIError {
  code: string;
  message: string;
}
