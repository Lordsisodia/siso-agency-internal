/**
 * Date Utilities - Timezone-safe date formatting
 *
 * CRITICAL: These functions preserve local dates without UTC conversion.
 * This prevents the common bug where selecting a date in a calendar
 * results in the previous day being stored due to timezone offset.
 */

/**
 * Formats a Date object to YYYY-MM-DD string in LOCAL time (not UTC)
 *
 * ❌ WRONG: date.toISOString().split('T')[0]  // Converts to UTC first!
 * ✅ CORRECT: formatLocalDate(date)            // Uses local date values
 *
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format (local timezone)
 *
 * @example
 * // User in PST (UTC-8) clicks October 13, 2025 in calendar
 * const selectedDate = new Date(2025, 9, 13); // October 13, 2025 00:00:00 local
 *
 * // WRONG WAY - shifts date due to UTC conversion:
 * selectedDate.toISOString().split('T')[0]  // "2025-10-12" ❌
 *
 * // CORRECT WAY - preserves local date:
 * formatLocalDate(selectedDate)              // "2025-10-13" ✅
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely formats a Date to YYYY-MM-DD or returns null
 * @param date - The date to format (or null)
 * @returns Formatted date string or null
 */
export function formatLocalDateOrNull(date: Date | null): string | null {
  return date ? formatLocalDate(date) : null;
}

/**
 * Safely formats a Date to YYYY-MM-DD or returns undefined
 * @param date - The date to format (or null)
 * @returns Formatted date string or undefined
 */
export function formatLocalDateOrUndefined(date: Date | null): string | undefined {
  return date ? formatLocalDate(date) : undefined;
}
