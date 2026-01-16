/**
 * Diet Section Design Tokens
 *
 * Centralized design system constants for consistent spacing, typography,
 * and styling across the diet tracking feature.
 */

/**
 * Spacing tokens for consistent padding and margins
 */
export const DIET_SPACING = {
  card: {
    xs: 'p-3',   // 12px - small inner cards
    sm: 'p-4',   // 16px - default cards
    md: 'p-5',   // 20px - emphasis cards
    lg: 'p-6',   // 24px - featured sections
  },
  section: {
    vertical: 'space-y-4',  // between major sections
    card: 'space-y-6',      // between cards
    element: 'space-y-3',   // within cards
    macroBar: 'space-y-5',  // between macro bars
  },
  button: {
    padding: 'py-3 px-5',   // 12px vertical, 20px horizontal
    gap: 'gap-2.5',         // 10px between icon/text
  },
  header: {
    padding: 'px-5 py-5',   // 20px horizontal, 20px vertical
    iconGap: 'gap-4',       // 16px between icon and text
  },
  tab: {
    padding: 'py-3 px-4',   // 12px vertical, 16px horizontal
    minHeight: 'min-h-[44px]', // WCAG 2.1 AAA touch target minimum
    iconSize: 'h-5 w-5',    // 20px icon size
  }
};

/**
 * Typography tokens for consistent font sizing and weights
 */
export const DIET_TYPOGRAPHY = {
  heading: {
    h1: 'text-2xl font-bold tracking-tight',    // Page headers
    h2: 'text-xl font-semibold tracking-tight',  // Card titles
    h3: 'text-lg font-semibold',                 // Section headers
  },
  body: {
    large: 'text-base font-normal leading-relaxed',  // Emphasized body
    default: 'text-sm font-normal',                  // Default body
    small: 'text-xs font-medium',                    // Supporting text
  },
  label: {
    default: 'text-sm font-semibold',            // Form labels
    muted: 'text-xs font-medium text-white/50',  // Secondary labels
    macro: 'text-sm font-semibold',              // Macro labels
  },
  value: {
    large: 'text-2xl font-bold tracking-tight',  // Large values (macros)
    default: 'text-xl font-bold tracking-tight', // Default values
    small: 'text-lg font-bold',                  // Small values
  }
};

/**
 * Color tokens for consistent theming
 */
export const DIET_COLORS = {
  primary: {
    DEFAULT: 'text-green-400',
    hover: 'text-green-300',
    muted: 'text-green-400/80',
  },
  background: {
    DEFAULT: 'bg-green-500/20',
    hover: 'bg-green-500/30',
    border: 'border-green-500/30',
  },
  text: {
    primary: 'text-green-100',    // High contrast (WCAG AA)
    secondary: 'text-green-200',  // Medium contrast
    muted: 'text-green-400',      // Low contrast
  }
};

/**
 * Border radius tokens
 */
export const DIET_RADIUS = {
  sm: 'rounded-lg',     // 8px
  md: 'rounded-xl',     // 12px
  lg: 'rounded-2xl',    // 16px
  full: 'rounded-full', // Pill shape
};

/**
 * Animation tokens
 */
export const DIET_ANIMATION = {
  duration: {
    fast: 0.15,
    normal: 0.2,
    slow: 0.3,
  },
  easing: {
    default: 'easeOut',
    inOut: 'easeInOut',
  }
};

/**
 * Touch target sizes (WCAG 2.1 AAA)
 */
export const DIET_TOUCH_TARGET = {
  min: 'min-h-[44px] min-w-[44px]',
  comfortable: 'min-h-[48px] min-w-[48px]',
  large: 'min-h-[56px] min-w-[56px]',
};
