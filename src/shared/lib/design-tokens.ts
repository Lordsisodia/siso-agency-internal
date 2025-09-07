// Notion-Inspired Design System
export const notionColors = {
  // Backgrounds
  background: '#F7F6F3',
  cardBackground: '#FFFFFF',
  hoverBackground: '#F8F9FA',
  
  // Text Colors
  textPrimary: '#37352F',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#D1D5DB',
  
  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderHover: '#D1D5DB',
  
  // Accent Colors (Muted)
  accent: '#2563EB',        // Soft blue
  accentLight: '#DBEAFE',   // Light blue
  success: '#059669',       // Muted green
  successLight: '#D1FAE5',  // Light green
  warning: '#D97706',       // Soft orange
  warningLight: '#FED7AA',  // Light orange
  error: '#DC2626',         // Soft red
  errorLight: '#FEE2E2',    // Light red
  
  // Status Colors (Notion-style)
  statusNotStarted: '#6B7280',
  statusInProgress: '#2563EB',
  statusCompleted: '#059669',
  statusDeclined: '#DC2626',
  statusWaiting: '#D97706',
} as const;

export const notionShadows = {
  card: 'shadow-sm',
  cardHover: 'shadow-md',
  dropdown: 'shadow-lg',
  modal: 'shadow-xl',
} as const;

export const notionBorders = {
  radius: 'rounded-md',
  radiusLg: 'rounded-lg',
  width: 'border',
  color: 'border-gray-200',
} as const;

export const notionSpacing = {
  cardPadding: 'p-6',
  sectionGap: 'space-y-6',
  elementGap: 'space-y-4',
  tight: 'space-y-2',
} as const;

export const notionTypography = {
  heading1: 'text-2xl font-semibold text-gray-900',
  heading2: 'text-xl font-medium text-gray-900', 
  heading3: 'text-lg font-medium text-gray-900',
  body: 'text-sm text-gray-700',
  bodySecondary: 'text-sm text-gray-500',
  caption: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
} as const; 