
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Define the expected transaction input type
export type ExpenseTransactionInput = {
  description: string; 
  amount: number; 
  date: string; 
  category: string;
  vendor: string;
  type: 'expense';
  recurring_type?: 'one-time' | 'monthly' | 'annual';
};

// Bulk insert method for multiple transactions
export async function addMultipleTransactions(transactions: ExpenseTransactionInput[]): Promise<boolean> {
  try {
    // First, find the category and vendor IDs
    const categoryPromises = transactions.map(async (transaction) => {
      const { data: categoryData, error: categoryError } = await supabase
        .from('expense_categories')
        .select('id')
        .eq('name', transaction.category)
        .single();

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('name', transaction.vendor)
        .single();

      if (categoryError || vendorError) {
        console.error('Error finding category or vendor:', categoryError || vendorError);
        return null;
      }

      return {
        ...transaction,
        category_id: categoryData?.id,
        vendor_id: vendorData?.id
      };
    });

    const processedTransactions = await Promise.all(categoryPromises);

    // Filter out any transactions that couldn't be processed
    const validTransactions = processedTransactions.filter(t => t !== null);

    // Bulk insert the transactions
    const { error } = await supabase
      .from('financial_transactions')
      .insert(validTransactions.map(t => ({
        id: uuidv4(),
        description: t.description,
        amount: t.amount,
        date: t.date,
        type: 'expense',
        category_id: t.category_id,
        vendor_id: t.vendor_id,
        status: 'completed',
        currency: 'GBP',
        recurring_type: t.recurring_type || 'one-time'
      })));

    if (error) {
      console.error('Error inserting transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expenses',
        variant: 'destructive'
      });
      return false;
    }

    toast({
      title: 'Success',
      description: 'Expenses added successfully',
    });
    return true;
  } catch (err) {
    console.error('Unexpected error adding transactions:', err);
    toast({
      title: 'Error',
      description: 'An unexpected error occurred',
      variant: 'destructive'
    });
    return false;
  }
}
