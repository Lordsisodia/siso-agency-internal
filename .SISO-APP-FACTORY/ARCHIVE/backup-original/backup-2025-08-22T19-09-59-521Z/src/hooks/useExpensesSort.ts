
import { useState, useMemo } from "react";
import { FinancialTransaction } from "@/utils/financial";

type SortField = "name" | "category" | "amount" | "date";
type SortDirection = "asc" | "desc";

export function useExpensesSort(expenses: FinancialTransaction[]) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle sort toggling
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort expenses based on current sort state
  const sortedExpenses = useMemo(() => {
    // Ensure we have a valid array to sort
    if (!expenses || !Array.isArray(expenses)) {
      console.warn("Invalid expenses data provided to useExpensesSort");
      return [];
    }

    return [...expenses].sort((a, b) => {
      if (sortField === "amount") {
        // Ensure numeric comparison
        const aAmount = typeof a.amount === 'number' ? a.amount : 0;
        const bAmount = typeof b.amount === 'number' ? b.amount : 0;
        return sortDirection === "asc" 
          ? aAmount - bAmount 
          : bAmount - aAmount;
      } else if (sortField === "date") {
        // Handle potential invalid dates
        const aDate = a.date ? new Date(a.date).getTime() : 0;
        const bDate = b.date ? new Date(b.date).getTime() : 0;
        return sortDirection === "asc" 
          ? aDate - bDate 
          : bDate - aDate;
      } else if (sortField === "name") {
        const aVal = a.description || "";
        const bVal = b.description || "";
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      } else if (sortField === "category") {
        const aVal = a.category?.name || "";
        const bVal = b.category?.name || "";
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [expenses, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedExpenses
  };
}
