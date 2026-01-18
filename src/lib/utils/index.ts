/**
 * Utils Module
 *
 * Central exports for all utility functions.
 */

// Core utilities
export { cn, debounce, type DebouncedFunction } from '../utils';

// Formatting utilities
export {
  formatCompactNumber,
  formatNumber,
  formatPercentage,
  formatCurrency,
  truncateText,
  getFirstLine,
  slugify,
  sanitizeHTML,
  formatFileSize
} from './formatters';

// Date utilities
export {
  formatDate,
  formatDateWithOptions,
  formatRelativeTime,
  formatTimestamp,
  formatDuration,
  formatUnixTimestamp,
  formatISOTimestamp,
  isValidDate,
  isTodayCheck,
  isYesterdayCheck,
  isWithinWeek,
  parseDate
} from './date';

// Constants
export {
  PUBLIC_USER_ID,
  isProduction,
  isDevelopment,
  API_BASE_URL,
  createApiUrl,
  FEATURE_FLAGS,
  isFeatureEnabled,
  TABLES,
  RLS_POLICIES,
  TIME_INTERVALS,
  BREAKPOINTS,
  ANIMATION_DURATION,
  ERROR_MESSAGES,
  VALIDATION,
  selectImplementation
} from './constants';
