
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
 * Formats a date string as relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle invalid dates
  if (isNaN(date.getTime())) return 'Invalid date';

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  // Handle future dates
  if (seconds < 0) {
    const absSeconds = Math.abs(seconds);
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const count = Math.floor(absSeconds / interval.seconds);
      if (count > 0) {
        return `in ${count} ${interval.label}${count !== 1 ? 's' : ''}`;
      }
    }
    return 'just now';
  }

  // Handle past dates
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Formats a date for display
 */
export function formatDate(dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return 'Invalid date';
  
  let options: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case 'short':
      options = { month: 'numeric', day: 'numeric' };
      break;
    case 'long':
      options = { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
      };
      break;
    case 'medium':
    default:
      options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
      };
      break;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Formats currency values
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}
