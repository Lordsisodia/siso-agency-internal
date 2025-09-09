/**
 * 🎯 Common Types
 */

export const AI_INTERFACE = {
  purpose: "Common type definitions",
  exports: ["ID", "Timestamp", "Status"],
  patterns: ["types-only"]
};

export type ID = string;
export type Timestamp = string;
export type Status = 'pending' | 'completed' | 'failed';
