/**
 * 🔧 Application Constants
 *
 * Centralized constants from across the codebase.
 * Previously scattered in: supabase-clerk.ts, feature-flags.ts, api-config.ts
 */

// ============================================================================
// AUTHENTICATION & USER CONSTANTS
// ============================================================================

/**
 * Public user ID for demo/testing access
 * Used when no user is authenticated (demo mode)
 */
export const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

// ============================================================================
// ENVIRONMENT CONSTANTS
// ============================================================================

/**
 * Check if running in production environment
 */
export const isProduction = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('vercel.app') || hostname !== 'localhost';
};

/**
 * Check if running in development environment
 */
export const isDevelopment = (): boolean => !isProduction();

// ============================================================================
// API CONSTANTS
// ============================================================================

/**
 * Get API base URL
 * Uses relative paths - Vite proxy handles local development routing
 */
export const API_BASE_URL = '';

/**
 * Create full API URL with base URL handling
 */
export const createApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature flag configuration
 * Add new features here to enable/disable them globally
 */
export const FEATURE_FLAGS = {
  // Enable AI-powered features
  enableAI: true,

  // Enable real-time updates
  enableRealtime: true,

  // Enable analytics
  enableAnalytics: isProduction(),

  // Enable debug mode
  enableDebug: isDevelopment(),

  // Enable experimental features
  enableExperimental: false,
} as const;

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

// ============================================================================
// DATABASE CONSTANTS
// ============================================================================

/**
 * Supabase table names
 */
export const TABLES = {
  USERS: 'users',
  TASKS: 'tasks',
  PROJECTS: 'projects',
  TIMEBLOCKS: 'timeblocks',
  MORNING_ROUTINE: 'morning_routine',
  NIGHTLY_CHECKOUT: 'nightly_checkout',
  HEALTH_DATA: 'health_data',
  WORKOUTS: 'workouts',
  NUTRITION: 'nutrition',
  REFLECTIONS: 'reflections',
} as const;

/**
 * Row Level Security (RLS) policy names
 */
export const RLS_POLICIES = {
  USERS: {
    READ: 'users_read_policy',
    INSERT: 'users_insert_policy',
    UPDATE: 'users_update_policy',
    DELETE: 'users_delete_policy',
  },
  TASKS: {
    READ: 'tasks_read_policy',
    INSERT: 'tasks_insert_policy',
    UPDATE: 'tasks_update_policy',
    DELETE: 'tasks_delete_policy',
  },
} as const;

// ============================================================================
// DATE & TIME CONSTANTS
// ============================================================================

/**
 * Time intervals in milliseconds
 */
export const TIME_INTERVALS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Breakpoint values for responsive design
 */
export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// ============================================================================
// ERROR CONSTANTS
// ============================================================================

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to log in to access this resource.',
  FORBIDDEN: 'You don\'t have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again.',
  UNKNOWN: 'An unexpected error occurred.',
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Validation rules
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILE_NAME_LENGTH: 255,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Select between primary and fallback implementations
 */
export function selectImplementation<T>(impls: { primary: T; fallback?: T }): T {
  return impls.primary ?? impls.fallback as T;
}
