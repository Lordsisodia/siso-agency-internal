import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { FinancialTransaction } from "./types";
import { transformTransactionData } from "./utils/transactionTransformers";

export async function fetchTransactions(): Promise<FinancialTransaction[]> {
  try {
    console.log("Starting to fetch transactions");
    
    // For admin dashboard, we don't require authentication - fetch all transactions
    console.log("Fetching all transactions for admin dashboard");

    // Simple query first - we'll join relationships separately to avoid potential RLS recursion issues
    const { data: transactionData, error } = await supabase
      .from("financial_transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions: " + error.message,
        variant: "destructive"
      });
      return [];
    }

    console.log("Found transactions:", transactionData?.length || 0);
    
    if (!transactionData || transactionData.length === 0) {
      return [];
    }

    // Now fetch related data separately
    const transactions = await Promise.all(transactionData.map(async (transaction) => {
      // Get category if exists
      let category = null;
      if (transaction.category_id) {
        const { data } = await supabase
          .from("expense_categories")
          .select("*")
          .eq("id", transaction.category_id)
          .single();
        category = data;
      }
      
      // Get vendor if exists
      let vendor = null;
      if (transaction.vendor_id) {
        const { data } = await supabase
          .from("vendors")
          .select("*")
          .eq("id", transaction.vendor_id)
          .single();
        vendor = data;
      }
      
      // Get payment method if exists
      let paymentMethod = null;
      if (transaction.payment_method_id) {
        const { data } = await supabase
          .from("payment_methods")
          .select("*")
          .eq("id", transaction.payment_method_id)
          .single();
        paymentMethod = data;
      }
      
      // Combine transaction with its relationships
      const enrichedTransaction = {
        ...transaction,
        category,
        vendor,
        payment_method: paymentMethod
      };
      
      return transformTransactionData(enrichedTransaction);
    }));
    
    console.log("Transformed transactions:", transactions);
    
    return transactions;
  } catch (err) {
    console.error("Unexpected error fetching transactions:", err);
    toast({
      title: "Error",
      description: "An unexpected error occurred while fetching transactions: " + String(err),
      variant: "destructive"
    });
    return [];
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("financial_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete the transaction",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    });
    return true;
  } catch (err) {
    console.error("Unexpected error deleting transaction:", err);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}

export async function createTransaction(transaction: Omit<FinancialTransaction, 'id'>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create transactions",
        variant: "destructive"
      });
      return false;
    }

    const { error } = await supabase
      .from("financial_transactions")
      .insert({
        ...transaction,
        user_id: user.id
      });

    if (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to create the transaction",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Transaction created successfully",
    });
    return true;
  } catch (err) {
    console.error("Unexpected error creating transaction:", err);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}

export async function updateTransaction(id: string, updates: Partial<FinancialTransaction>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("financial_transactions")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to update the transaction",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Transaction updated successfully",
    });
    return true;
  } catch (err) {
    console.error("Unexpected error updating transaction:", err);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}
