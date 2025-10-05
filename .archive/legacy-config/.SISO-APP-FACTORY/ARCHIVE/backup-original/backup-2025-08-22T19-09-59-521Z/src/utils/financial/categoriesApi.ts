
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ExpenseCategory } from './types';

// Fetch expense categories
export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    toast({
      title: 'Error',
      description: 'Failed to load expense categories',
      variant: 'destructive',
    });
    return [];
  }
}

// Add a new expense category
export async function addExpenseCategory(category: Omit<ExpenseCategory, 'id'>): Promise<ExpenseCategory | null> {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert(category)
      .select()
      .single();
      
    if (error) throw error;
    
    toast({
      title: 'Success',
      description: 'Expense category added successfully',
    });
    
    return data;
  } catch (error) {
    console.error('Error adding expense category:', error);
    toast({
      title: 'Error',
      description: 'Failed to add expense category',
      variant: 'destructive',
    });
    return null;
  }
}
