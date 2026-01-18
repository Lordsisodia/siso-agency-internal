/**
 * 📅 Comprehensive Date Utilities
 *
 * Consolidated date formatting and manipulation utilities.
 * Merged from: date-utils.ts, formatters.ts, utils/date.utils.ts
 */

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Formats a date for display in the UI
 * @example formatDate(new Date()) // "Today at 14:30"
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }

  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }

  return format(dateObj, 'MMM d, yyyy HH:mm');
}

/**
 * Formats a date with specified format length
 */
export function formatDateWithOptions(
  dateString: string,
  formatType: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return 'Invalid date';

  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric' },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  }[formatType];

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Formats a date as relative time using date-fns
 * @example formatRelativeTime(new Date()) // "2 hours ago"
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Formats a timestamp for display
 */
export function formatTimestamp(timestamp: string | number): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  return formatDate(date);
}

/**
 * Formats duration in milliseconds to human readable format
 * @example formatDuration(3661000) // "1h 1m 1s"
 */
export function formatDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  return `${seconds}s`;
}

/**
 * Formats a Unix timestamp to a human-readable date string
 * @example formatUnixTimestamp(1735555200) // "Dec 30, 2024"
 */
export function formatUnixTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();

  if (isTodayCheck(date)) {
    return formatTime(date);
  }

  if (isYesterdayCheck(date)) {
    return `Yesterday, ${formatTime(date)}`;
  }

  if (isWithinWeek(date)) {
    return `${getDayName(date)}, ${formatTime(date)}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats an ISO timestamp string to a human-readable date
 * @example formatISOTimestamp("2025-01-04T10:13:29.000Z") // "Jan 4, 2025"
 */
export function formatISOTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return formatUnixTimestamp(Math.floor(date.getTime() / 1000));
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Checks if a date string is valid
 */
export function isValidDate(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Checks if a date is today
 */
export function isTodayCheck(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Checks if a date is yesterday
 */
export function isYesterdayCheck(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Checks if a date is within the last week
 */
export function isWithinWeek(date: Date): boolean {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return date > weekAgo;
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Parses a date string into a Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats time portion of a date
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Gets the day name for a date
 */
function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}
