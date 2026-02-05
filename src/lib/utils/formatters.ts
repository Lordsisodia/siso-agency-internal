/**
 * 🎨 Data Formatting Utilities
 *
 * Non-date formatting functions (currency, numbers, text, etc.)
 * Date formatting moved to utils/date.ts
 */

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Formats numbers in a compact form (e.g., 1.2k, 3.5M)
 */
export function formatCompactNumber(num: number): string {
  if (num === null || num === undefined) return '0';

  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
}

/**
 * Formats a number with commas as thousand separators
 */
export function formatNumber(num: number): string {
  if (num === null || num === undefined) return '0';

  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Formats a percentage value
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Formats currency values
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Gets the first line of text
 */
export function getFirstLine(text: string): string {
  const lines = text.split('\n');
  return lines[0] || '';
}

/**
 * Converts a string to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Sanitizes HTML to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

/**
 * Formats bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Formats a date to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}
