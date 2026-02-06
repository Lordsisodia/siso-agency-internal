/**
 * Time Utilities for Today's Tasks
 *
 * Helper functions for parsing and formatting time estimates.
 */

/**
 * Parse a time estimate string into minutes
 * Supports formats like:
 * - "2h 30m"
 * - "1.5 hours"
 * - "45 mins"
 * - "90" (assumes minutes)
 */
export function parseTimeEstimateToMinutes(value?: string | null): number {
  if (!value) return 0;
  const normalized = value.toString().toLowerCase();
  let minutes = 0;

  const hourMatches = normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/g);
  for (const match of hourMatches) {
    minutes += Math.round(parseFloat(match[1]) * 60);
  }

  const minuteMatches = normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/g);
  for (const match of minuteMatches) {
    minutes += Math.round(parseFloat(match[1]));
  }

  if (minutes === 0) {
    const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
    if (numberMatch) {
      minutes = Math.round(parseFloat(numberMatch[1]));
    }
  }

  return minutes;
}

/**
 * Format minutes into a human-readable string
 * e.g., 90 -> "1h 30m", 45 -> "45m", 120 -> "2h"
 */
export function formatMinutes(totalMinutes: number): string {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Normalize a date string to YYYY-MM-DD format
 */
export function normalizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

/**
 * Check if a date string represents today
 */
export function isToday(dateStr: string | null | undefined, todayStr: string): boolean {
  const normalized = normalizeDate(dateStr);
  return normalized === todayStr;
}

/**
 * Format a duration in milliseconds to a clock string (HH:MM:SS)
 */
export function formatMsAsClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ];

  return parts.join(':');
}

/**
 * Calculate remaining time for a task based on estimate and elapsed time
 */
export function calculateRemainingTime(
  timeEstimate: string | null | undefined,
  elapsedMs: number
): { remainingMinutes: number; isOverdue: boolean } {
  const estimatedMinutes = parseTimeEstimateToMinutes(timeEstimate);
  const elapsedMinutes = elapsedMs / (1000 * 60);
  const remainingMinutes = Math.max(0, estimatedMinutes - elapsedMinutes);
  const isOverdue = elapsedMinutes > estimatedMinutes && estimatedMinutes > 0;

  return { remainingMinutes, isOverdue };
}
