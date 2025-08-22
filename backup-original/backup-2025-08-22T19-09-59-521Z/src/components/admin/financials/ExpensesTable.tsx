
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
  Send,
  Clock,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useExpensesTableData } from "@/hooks/useExpensesTableData";
import { FinancialTransaction } from "@/utils/financial";
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { deleteTransaction } from "@/utils/financial";
import { toast } from "@/components/ui/use-toast";
import { CreateExpenseDialog } from "./expense/CreateExpenseDialog";
import { categorizeExpenses } from "@/utils/financial/expenseCategories";

interface ExpensesTableProps {
  expenses: FinancialTransaction[];
  isLoading: boolean;
  onDataChange: () => Promise<void>;
}

// Define columns for the table
const columns: ColumnDef<FinancialTransaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "category.name",
    header: "Category",
  },
  {
    accessorKey: "vendor.name",
    header: "Vendor",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatCurrency(row.getValue("amount") as number, "GBP"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const expense = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(expense.id)}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                // Get the expensesTable component to access the onDataChange prop
                const tableComponent = document.querySelector('[data-expenses-table]');
                if (tableComponent) {
                  // Use the handler from the component's instance, not from data attribute
                  const table = e.currentTarget.closest('[data-expenses-table-id]');
                  const tableId = table?.getAttribute('data-expenses-table-id');
                  
                  // Delete transaction and refresh data
                  const handleDelete = async () => {
                    const success = await deleteTransaction(expense.id);
                    if (success) {
                      // Use global event to notify the table to refresh
                      const event = new CustomEvent('expense-deleted', { 
                        detail: { id: expense.id } 
                      });
                      document.dispatchEvent(event);
                    }
                  };
                  
                  handleDelete();
                }
              }}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ExpensesTable({ expenses, isLoading, onDataChange }: ExpensesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    viewDetailsId,
    setViewDetailsId,
    filteredExpenses,
  } = useExpensesTableData(expenses);

  // Listen for expense-deleted events
  useEffect(() => {
    const handleExpenseDeleted = (event: Event) => {
      onDataChange();
    };
    
    document.addEventListener('expense-deleted', handleExpenseDeleted);
    
    return () => {
      document.removeEventListener('expense-deleted', handleExpenseDeleted);
    };
  }, [onDataChange]);

  // Auto categorize expenses
  const categorizedExpenses = useMemo(() => {
    return categorizeExpenses(expenses);
  }, [expenses]);

  // Get category summary data
  const categorySummary: [string, number][] = Object.entries(
    categorizedExpenses.reduce((acc: Record<string, number>, expense) => {
      const category = expense.detected_category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  // Handle category filter change
  const handleCategoryChange = (category: string | null) => {
    setCategoryFilter(category);
  };

  // Create a function to handle deletion via the dropdown menu
  const handleDelete = async (id: string) => {
    const success = await deleteTransaction(id);
    if (success) {
      await onDataChange();
    }
  };

  const table = useReactTable({
    data: filteredExpenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <Card data-expenses-table-id="expenses-main-table">
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>
          Manage your company expenses. Total expenses:{" "}
          {formatCurrency(
            expenses.reduce((acc, expense) => acc + expense.amount, 0),
            "GBP"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <Input
            type="search"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10">
                  {categoryFilter || "Filter by Category"}
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleCategoryChange(null)}>
                  All Categories
                </DropdownMenuItem>
                {categorySummary.map(([category, total]) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category} ({formatCurrency(total, "GBP")})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <CreateExpenseDialog onDataChange={onDataChange} />
          </div>
        </div>

        <div className="relative w-full overflow-auto mt-4">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id} className="px-4 py-2 text-left">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-4 italic text-muted-foreground"
                  >
                    Loading expenses...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-4 italic text-muted-foreground"
                  >
                    No expenses found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
