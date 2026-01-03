/**
 * 📅 Date Utilities
 */

export const AI_INTERFACE = {
  purpose: "Date manipulation utilities",
  exports: ["formatDate", "parseDate", "isToday"],
  patterns: ["pure-functions"]
};

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
