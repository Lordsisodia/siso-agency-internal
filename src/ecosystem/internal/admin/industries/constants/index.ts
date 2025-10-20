export const INDUSTRY_STATUS_OPTIONS = [
  'research',
  'prospecting',
  'in_development',
  'launched',
  'paused',
] as const;

export const INDUSTRY_FOCUS_LEVELS = [
  'primary',
  'secondary',
  'experimental',
] as const;

export const STATUS_LABELS: Record<(typeof INDUSTRY_STATUS_OPTIONS)[number], string> = {
  research: 'Research',
  prospecting: 'Prospecting',
  in_development: 'In Development',
  launched: 'Launched',
  paused: 'Paused',
};

export const FOCUS_LABELS: Record<(typeof INDUSTRY_FOCUS_LEVELS)[number], string> = {
  primary: 'Primary Focus',
  secondary: 'Secondary Focus',
  experimental: 'Experimental',
};

export const DEFAULT_INDUSTRY_PAGE_SIZE = 10;
