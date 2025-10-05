
import { useState, useMemo, useEffect } from "react";
import { FinancialTransaction } from "@/utils/financial";

export function useExpensesTableData(expenses: FinancialTransaction[] = []) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Log expenses received for debugging
  useEffect(() => {
    console.log(`useExpensesTableData received ${expenses.length} expenses`);
  }, [expenses]);
  
  // Filter expenses based on search query and category filter
  const filteredExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) {
      console.warn("Invalid expenses data provided to useExpensesTableData");
      return [];
    }
    
    return expenses.filter(expense => {
      if (!expense) return false;
      
      // Apply search query filter
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        expense.description?.toLowerCase().includes(lowerQuery) ||
        expense.category?.name?.toLowerCase().includes(lowerQuery) ||
        expense.vendor?.name?.toLowerCase().includes(lowerQuery) ||
        `${expense.amount}`.includes(searchQuery);
      
      // Apply category filter if one is selected
      const matchesCategory = !categoryFilter || 
        (expense.detected_category === categoryFilter);
      
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, categoryFilter]);

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    viewDetailsId,
    setViewDetailsId,
    filteredExpenses,
  };
}
