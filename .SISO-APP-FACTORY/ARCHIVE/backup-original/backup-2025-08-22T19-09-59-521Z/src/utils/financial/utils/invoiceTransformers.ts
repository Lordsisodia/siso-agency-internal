
import { PaymentMethod, Invoice } from '../types';
import { isValidRelationship, createClientData } from './relationshipUtils';

/**
 * Transforms raw invoice data from Supabase into the Invoice type
 * Uses explicit type handling to prevent deep instantiation chains
 */
export function transformInvoiceData(item: any): Invoice {
  // Extract payment method with type checking
  const paymentMethod = isValidRelationship(item.payment_method) 
    ? item.payment_method as PaymentMethod
    : undefined;

  // Create a properly typed object
  return {
    ...item,
    status: item.status as 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled',
    client: createClientData(item.client),
    payment_method: paymentMethod
  };
}
