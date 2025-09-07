
/**
 * Base interface for simple entity with ID
 */
export interface BaseEntity {
  id: string;
}

/**
 * Client data interface
 */
export interface ClientData {
  full_name?: string;
  business_name?: string;
}

/**
 * Invoice filters interface
 */
export interface InvoiceFilters {
  client_id?: string;
  status?: string;
  payment_method_id?: string;
  [key: string]: any;
}
