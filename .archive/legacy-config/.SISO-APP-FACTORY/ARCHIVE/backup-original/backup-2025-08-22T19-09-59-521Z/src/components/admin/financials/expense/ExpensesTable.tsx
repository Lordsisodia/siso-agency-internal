import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialTransaction, deleteTransaction, updateTransaction } from "@/utils/financial";
import { Input } from "@/components/ui/input";
import { useExpensesTableData } from "@/hooks/useExpensesTableData";
import { formatCurrency } from "@/lib/formatters";
import { CreateExpenseDialog } from "./CreateExpenseDialog";
import { categorizeExpenses } from "@/utils/financial/expenseCategories";
import { TableColumn } from "@/hooks/useTableColumns";
import { Search, ViewIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpensesTableHeader } from "./ExpensesTableHeader";
import { AirtableExpensesGrid } from "./AirtableExpensesGrid";
import { toast } from "@/components/ui/use-toast";
import { ExpensesFinanceToolbar } from "../table/ExpensesFinanceToolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExpensesTableProps {
  expenses: FinancialTransaction[];
  isLoading: boolean;
  onDataChange: () => Promise<void>;
}

export function ExpensesTable({ expenses, isLoading, onDataChange }: ExpensesTableProps) {
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(true);
  
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    filteredExpenses,
  } = useExpensesTableData(expenses);

  // Auto categorize expenses
  const categorizedExpenses = useMemo(() => {
    return categorizeExpenses(expenses);
  }, [expenses]);
  
  // Define columns for the table
  const defaultColumns: TableColumn[] = [
    { key: "description", label: "Description", visible: true, pinned: true },
    { key: "category", label: "Category", visible: true },
    { key: "amount", label: "Amount", visible: true },
    { key: "date", label: "Date", visible: true },
    { key: "recurring_type", label: "Frequency", visible: true },
    { key: "vendor", label: "Vendor", visible: true },
    { key: "payment_method", label: "Payment Method", visible: true },
  ];
  
  const [columns, setColumns] = useState<TableColumn[]>(defaultColumns);
  
  // Listen for expense-deleted events
  useEffect(() => {
    const handleExpenseDeleted = () => {
      onDataChange();
    };
    
    document.addEventListener('expense-deleted', handleExpenseDeleted);
    
    return () => {
      document.removeEventListener('expense-deleted', handleExpenseDeleted);
    };
  }, [onDataChange]);

  // Handle expense view details
  const handleViewDetails = (id: string) => {
    setViewDetailsId(id);
  };

  // Create a function to handle deletion via the dropdown menu
  const handleDelete = async (id: string) => {
    const success = await deleteTransaction(id);
    if (success) {
      await onDataChange();
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the expense.",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating an expense
  const handleUpdateExpense = async (expenseId: string, field: string, value: any) => {
    try {
      const updates = { [field]: value };
      const success = await updateTransaction(expenseId, updates);
      if (success) {
        await onDataChange();
      }
    } catch (error) {
      toast({
        title: "Error updating expense",
        description: "There was a problem updating the expense.",
        variant: "destructive"
      });
    }
  };

  // Toggle between grid and table views
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const visibleColumns = columns.filter(col => col.visible);

  return (
    <Card data-expenses-table-id="expenses-main-table" className="bg-siso-bg-alt/50 border-siso-border/50">
      <CardHeader>
        <CardTitle className="text-siso-text-bold">Expenses</CardTitle>
        <CardDescription className="text-siso-text-muted">
          Manage your company expenses. Total expenses:{" "}
          <span className="text-siso-orange font-medium">
            {formatCurrency(
              expenses.reduce((acc, expense) => acc + expense.amount, 0),
              "GBP"
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEditMode}
              >
                <ViewIcon className="h-4 w-4 mr-2" />
                {editMode ? "Switch to Table" : "Switch to Spreadsheet"}
              </Button>
              <CreateExpenseDialog onDataChange={onDataChange} />
            </div>
          </div>
          
          <ExpensesFinanceToolbar 
            columns={columns}
            onColumnVisibilityChange={setColumns}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            expenses={expenses}
          />
          
          {editMode ? (
            <AirtableExpensesGrid
              expenses={filteredExpenses}
              visibleColumns={visibleColumns}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
              onAddExpense={() => document.getElementById('create-expense-dialog-trigger')?.click()}
              onUpdateExpense={handleUpdateExpense}
            />
          ) : (
            <div className="relative w-full overflow-auto mt-4">
              <Table className="w-full table-auto border-collapse text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-2 text-left">Date</TableHead>
                    <TableHead className="px-4 py-2 text-left">Description</TableHead>
                    <TableHead className="px-4 py-2 text-left">Category</TableHead>
                    <TableHead className="px-4 py-2 text-left">Vendor</TableHead>
                    <TableHead className="px-4 py-2 text-left">Amount</TableHead>
                    <TableHead className="px-4 py-2 text-left">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 italic text-muted-foreground">
                        Loading expenses...
                      </TableCell>
                    </TableRow>
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 italic text-muted-foreground">
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="px-4 py-2">{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell className="px-4 py-2">{expense.description}</TableCell>
                        <TableCell className="px-4 py-2">{expense.category?.name}</TableCell>
                        <TableCell className="px-4 py-2">{expense.vendor?.name}</TableCell>
                        <TableCell className="px-4 py-2">£{expense.amount.toFixed(2)}</TableCell>
                        <TableCell className="px-4 py-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(expense.id)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
