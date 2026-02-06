/**
 * Natural Language Date Parser
 * Parses human-readable date strings like "tomorrow", "next week", "in 3 days"
 * Returns a Date object or null if parsing fails
 */

import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek, nextMonday, isValid, parse, parseISO } from 'date-fns';

export interface ParsedDate {
  date: Date;
  label: string;
  relative: string;
}

export interface DateSuggestion {
  label: string;
  date: Date;
  shortcut?: string;
}

// Common date patterns and their handlers
const DATE_PATTERNS: Array<{
  pattern: RegExp;
  handler: (match: RegExpMatchArray, referenceDate: Date) => Date | null;
  label: string;
}> = [
  // Today
  {
    pattern: /^today$/i,
    handler: (_, ref) => ref,
    label: 'Today',
  },
  // Tomorrow
  {
    pattern: /^tomorrow$/i,
    handler: (_, ref) => addDays(ref, 1),
    label: 'Tomorrow',
  },
  // Yesterday
  {
    pattern: /^yesterday$/i,
    handler: (_, ref) => addDays(ref, -1),
    label: 'Yesterday',
  },
  // Next week
  {
    pattern: /^next\s+week$/i,
    handler: (_, ref) => nextMonday(ref),
    label: 'Next week',
  },
  // This week
  {
    pattern: /^this\s+week$/i,
    handler: (_, ref) => startOfWeek(ref, { weekStartsOn: 1 }),
    label: 'This week',
  },
  // End of week
  {
    pattern: /^(end\s+of\s+week|eow)$/i,
    handler: (_, ref) => endOfWeek(ref, { weekStartsOn: 1 }),
    label: 'End of week',
  },
  // Next month
  {
    pattern: /^next\s+month$/i,
    handler: (_, ref) => addMonths(ref, 1),
    label: 'Next month',
  },
  // In X days
  {
    pattern: /^in\s+(\d+)\s+days?$/i,
    handler: (match, ref) => addDays(ref, parseInt(match[1], 10)),
    label: 'In X days',
  },
  // X days from now
  {
    pattern: /^(\d+)\s+days?\s+from\s+now$/i,
    handler: (match, ref) => addDays(ref, parseInt(match[1], 10)),
    label: 'X days from now',
  },
  // In X weeks
  {
    pattern: /^in\s+(\d+)\s+weeks?$/i,
    handler: (match, ref) => addWeeks(ref, parseInt(match[1], 10)),
    label: 'In X weeks',
  },
  // Next Monday/Tuesday/etc
  {
    pattern: /^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
    handler: (match, ref) => getNextDayOfWeek(ref, match[1]),
    label: 'Next day of week',
  },
  // This Monday/Tuesday/etc
  {
    pattern: /^this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i,
    handler: (match, ref) => getThisDayOfWeek(ref, match[1]),
    label: 'This day of week',
  },
];

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getNextDayOfWeek(referenceDate: Date, dayName: string): Date | null {
  const targetDay = DAY_NAMES.indexOf(dayName.toLowerCase());
  if (targetDay === -1) return null;

  const currentDay = referenceDate.getDay();
  let daysUntil = targetDay - currentDay;

  // If the day has already passed this week, go to next week
  if (daysUntil <= 0) {
    daysUntil += 7;
  }

  return addDays(referenceDate, daysUntil);
}

function getThisDayOfWeek(referenceDate: Date, dayName: string): Date | null {
  const targetDay = DAY_NAMES.indexOf(dayName.toLowerCase());
  if (targetDay === -1) return null;

  const currentDay = referenceDate.getDay();
  let daysUntil = targetDay - currentDay;

  // If the day has already passed this week, go to next occurrence
  if (daysUntil < 0) {
    daysUntil += 7;
  }

  return addDays(referenceDate, daysUntil);
}

/**
 * Parse a natural language date string
 * @param input - The natural language date string
 * @param referenceDate - The date to use as reference (defaults to now)
 * @returns ParsedDate object or null if parsing fails
 */
export function parseNaturalDate(input: string, referenceDate: Date = new Date()): ParsedDate | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try pattern matching first
  for (const { pattern, handler, label } of DATE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const date = handler(match, referenceDate);
      if (date && isValid(date)) {
        return {
          date,
          label,
          relative: getRelativeLabel(date, referenceDate),
        };
      }
    }
  }

  // Try parsing as ISO date
  const isoDate = parseISO(trimmed);
  if (isValid(isoDate)) {
    return {
      date: isoDate,
      label: format(isoDate, 'yyyy-MM-dd'),
      relative: getRelativeLabel(isoDate, referenceDate),
    };
  }

  // Try parsing with date-fns parse
  const formats = ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'MMM d', 'MMMM d', 'MMM d, yyyy', 'MMMM d, yyyy'];
  for (const fmt of formats) {
    const parsed = parse(trimmed, fmt, referenceDate);
    if (isValid(parsed)) {
      return {
        date: parsed,
        label: format(parsed, 'yyyy-MM-dd'),
        relative: getRelativeLabel(parsed, referenceDate),
      };
    }
  }

  return null;
}

/**
 * Get a human-readable relative label for a date
 */
function getRelativeLabel(date: Date, referenceDate: Date): string {
  const diffDays = Math.round((date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays >= 7 && diffDays < 14) return 'Next week';
  if (diffDays >= 14) return `In ${Math.round(diffDays / 7)} weeks`;
  if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= -7) return `${Math.round(Math.abs(diffDays) / 7)} weeks ago`;

  return format(date, 'MMM d');
}

/**
 * Get common date suggestions for quick selection
 */
export function getDateSuggestions(referenceDate: Date = new Date()): DateSuggestion[] {
  return [
    { label: 'Today', date: referenceDate, shortcut: 'T' },
    { label: 'Tomorrow', date: addDays(referenceDate, 1), shortcut: 'M' },
    { label: 'Next week', date: nextMonday(referenceDate), shortcut: 'N' },
    { label: 'In 3 days', date: addDays(referenceDate, 3) },
    { label: 'In a week', date: addWeeks(referenceDate, 1) },
    { label: 'Next month', date: addMonths(referenceDate, 1) },
  ];
}

/**
 * Check if a string looks like it might be a date
 * Useful for showing date picker suggestions
 */
export function looksLikeDate(input: string): boolean {
  const dateWords = ['today', 'tomorrow', 'yesterday', 'week', 'month', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'next', 'this', 'in'];
  const lower = input.toLowerCase();
  return dateWords.some(word => lower.includes(word)) || /\d{1,2}[\/\-]\d{1,2}/.test(input);
}

/**
 * Format a date range in natural language
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = format(startDate, 'MMM d');
  const end = format(endDate, 'MMM d');
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const currentYear = new Date().getFullYear();

  if (startYear !== currentYear) {
    return `${format(startDate, 'MMM d, yyyy')} - ${endYear !== startYear ? format(endDate, 'MMM d, yyyy') : end}`;
  }

  return `${start} - ${end}`;
}

/**
 * Get quick date options for dropdowns/selects
 */
export function getQuickDateOptions(referenceDate: Date = new Date()): Array<{ label: string; value: string; date: Date }> {
  return [
    { label: 'Today', value: 'today', date: referenceDate },
    { label: 'Tomorrow', value: 'tomorrow', date: addDays(referenceDate, 1) },
    { label: 'Next week', value: 'next-week', date: nextMonday(referenceDate) },
    { label: 'In 2 weeks', value: 'in-2-weeks', date: addWeeks(referenceDate, 2) },
    { label: 'Next month', value: 'next-month', date: addMonths(referenceDate, 1) },
    { label: 'Custom date', value: 'custom', date: referenceDate },
  ];
}
