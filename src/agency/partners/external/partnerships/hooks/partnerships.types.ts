/**
 * Partnerships Types
 */

export const AI_INTERFACE = {
  purpose: "Type definitions for partnerships feature",
  exports: ["PartnershipsProps", "PartnershipsState"],
  patterns: ["types-only"]
};

export interface PartnershipsProps {
  className?: string;
}

export interface PartnershipsState {
  isLoading: boolean;
}
