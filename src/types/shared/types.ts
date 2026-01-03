
// Types for financial data
export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  contact_email?: string;
  payment_terms?: string;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
}

export interface FinancialTransaction {
  id: string;
  type: 'expense' | 'revenue';
  amount: number;
  currency: string;
  date: string;
  description?: string;
  category_id?: string;
  vendor_id?: string;
  payment_method_id?: string;
  recurring_type?: 'one-time' | 'monthly' | 'annual' | null;
  status: string;
  receipt_url?: string;
  notes?: string;
  
  // Joined data
  category?: ExpenseCategory;
  vendor?: Vendor;
  payment_method?: PaymentMethod;
  
  // Added for categorization
  detected_category?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  amount: number;
  currency: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method_id?: string;
  notes?: string;
  
  // Joined data
  client?: {
    full_name: string;
    business_name?: string;
  };
  payment_method?: PaymentMethod;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  profitMargin: number;
  outstandingAmount: number;
  revenueByMonth: { name: string; revenue: number; expense: number }[];
}
