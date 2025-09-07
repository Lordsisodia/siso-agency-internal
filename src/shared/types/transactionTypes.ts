
/**
 * Transaction filters interface
 */
export interface TransactionFilters {
  type?: string;
  category_id?: string;
  vendor_id?: string;
  status?: string;
  [key: string]: any;
}
