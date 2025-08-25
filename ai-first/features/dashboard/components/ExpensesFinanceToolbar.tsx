
import React from 'react';
import { TableColumn } from '@/hooks/useTableColumns';
import { Button } from '@/components/ui/button';
import { ColumnCustomization } from './ColumnCustomization';
import { FinancialTransaction } from '@/utils/financial';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, FileDown, FileText, ArrowDownUp, Save, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { categorizeExpenses } from '@/utils/financial/expenseCategories';

interface ExpensesFinanceToolbarProps {
  columns: TableColumn[];
  onColumnVisibilityChange: (columns: TableColumn[]) => void;
  categoryFilter: string | null;
  onCategoryFilterChange: (category: string | null) => void;
  expenses: FinancialTransaction[];
}

export function ExpensesFinanceToolbar({
  columns,
  onColumnVisibilityChange,
  categoryFilter,
  onCategoryFilterChange,
  expenses
}: ExpensesFinanceToolbarProps) {
  // Auto categorize expenses to get category summary
  const categorizedExpenses = React.useMemo(() => {
    return categorizeExpenses(expenses);
  }, [expenses]);

  // Get category summary data
  const categorySummary: [string, number][] = React.useMemo(() => {
    return Object.entries(
      categorizedExpenses.reduce((acc: Record<string, number>, expense) => {
        const category = expense.detected_category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]);
  }, [categorizedExpenses]);

  // Handle category filter change
  const handleCategoryChange = (category: string | null) => {
    onCategoryFilterChange(category);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <div className="flex items-center gap-1">
        <Badge variant={categoryFilter ? "default" : "outline"} className="h-7 px-2">
          {categoryFilter || "All Categories"}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span className="sr-only md:not-sr-only md:inline-block">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleCategoryChange(null)}
              className="flex justify-between"
            >
              All Categories
              {!categoryFilter && <span>✓</span>}
            </DropdownMenuItem>
            {categorySummary.map(([category, total]) => (
              <DropdownMenuItem
                key={category}
                onClick={() => handleCategoryChange(category)}
                className="flex justify-between"
              >
                <div>{category}</div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {formatCurrency(total, "GBP")}
                  </span>
                  {categoryFilter === category && <span>✓</span>}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <Save className="h-3.5 w-3.5" />
          <span className="sr-only md:not-sr-only md:inline-block">Save View</span>
        </Button>
        
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span className="sr-only md:not-sr-only md:inline-block">History</span>
        </Button>
        
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <FileText className="h-3.5 w-3.5" />
          <span className="sr-only md:not-sr-only md:inline-block">Report</span>
        </Button>
        
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <FileDown className="h-3.5 w-3.5" />
          <span className="sr-only md:not-sr-only md:inline-block">Export</span>
        </Button>
        
        <ColumnCustomization 
          columns={columns} 
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
        
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <ArrowDownUp className="h-3.5 w-3.5" />
          <span className="sr-only md:not-sr-only md:inline-block">Sort</span>
        </Button>
      </div>
    </div>
  );
}
