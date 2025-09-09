
/**
 * Summary period type - either month or year
 */
export type SummaryPeriod = 'month' | 'year' | 'all';

/**
 * Summary filters for financial data
 */
export interface SummaryFilters {
  category?: string;
  vendor?: string;
  paymentMethod?: string;
  [key: string]: any;
}
