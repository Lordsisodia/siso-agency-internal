
import { FinancialTransaction, ExpenseCategory, Vendor, PaymentMethod } from '../types';
import { isValidRelationship } from './relationshipUtils';

export function transformTransactionData(item: any): FinancialTransaction {
  if (!item) {
    console.error("Received null or undefined transaction data");
    return {} as FinancialTransaction;
  }

  // Log the raw data for debugging
  console.log("Processing transaction data:", item.id);

  // Safely extract relations - these might be null for new design
  const category = item.category ? {
    id: item.category.id,
    name: item.category.name,
    description: item.category.description || '',
    is_active: item.category.is_active || true
  } : undefined;
    
  const vendor = item.vendor ? {
    id: item.vendor.id,
    name: item.vendor.name,
    is_active: item.vendor.is_active || true
  } : undefined;
    
  const paymentMethod = item.payment_method ? {
    id: item.payment_method.id,
    name: item.payment_method.name,
    is_active: item.payment_method.is_active || true
  } : undefined;

  // Return transformed data with all required fields
  return {
    id: item.id,
    type: item.type || 'expense',
    amount: item.amount || 0,
    currency: item.currency || 'GBP',
    date: item.date,
    description: item.description || '',
    status: item.status || 'completed',
    recurring_type: item.recurring_type || null,
    notes: item.notes || '',
    receipt_url: item.receipt_url || '',
    category_id: item.category_id,
    vendor_id: item.vendor_id,
    payment_method_id: item.payment_method_id,
    category,
    vendor,
    payment_method: paymentMethod
  };
}
