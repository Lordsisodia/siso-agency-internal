
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { FinancialTransaction } from "@/utils/financial";
import { TableColumn } from "@/hooks/useTableColumns";
import { SpreadsheetExpensesBody } from "./SpreadsheetExpensesBody";
import { ExpensesTableHeader } from "./ExpensesTableHeader";
import {
  Table,
  TableHeader,
  TableBody
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useExpensesSort } from '@/hooks/useExpensesSort';

interface AirtableExpensesGridProps {
  expenses: FinancialTransaction[];
  visibleColumns: TableColumn[];
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  onAddExpense?: () => void;
  className?: string;
  onUpdateExpense: (expenseId: string, field: string, value: any) => void;
}

export function AirtableExpensesGrid({
  expenses,
  visibleColumns,
  onViewDetails,
  onDelete,
  onAddExpense,
  className,
  onUpdateExpense
}: AirtableExpensesGridProps) {
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const { sortField, sortDirection, handleSort, sortedExpenses } = useExpensesSort(expenses);

  const handleSelectExpense = (id: string) => {
    setSelectedExpenses(prev => {
      if (prev.includes(id)) {
        return prev.filter(expId => expId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map(exp => exp.id));
    }
  };

  const handleColumnResize = (columnKey: string, width: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: width
    }));
  };

  return (
    <div className={cn(
      "relative border border-border/30 rounded-lg overflow-hidden airtable-grid",
      className
    )}>
      <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
        <div className="relative">
          <Table>
            <TableHeader>
              <ExpensesTableHeader
                visibleColumns={visibleColumns}
                onSort={handleSort}
                selectedExpenses={selectedExpenses}
                expenses={expenses}
                onSelectAll={handleSelectAll}
                sortColumn={sortField}
                sortDirection={sortDirection}
                onColumnResize={handleColumnResize}
              />
            </TableHeader>
            <TableBody>
              <SpreadsheetExpensesBody
                expenses={sortedExpenses}
                visibleColumns={visibleColumns.map(col => ({
                  ...col,
                  width: columnWidths[col.key] || col.width
                }))}
                onViewDetails={onViewDetails}
                onDelete={onDelete}
                selectedExpenses={selectedExpenses}
                onSelectExpense={handleSelectExpense}
                onUpdateExpense={onUpdateExpense}
              />
            </TableBody>
          </Table>
          
          {onAddExpense && (
            <Button 
              onClick={onAddExpense}
              variant="ghost" 
              className="add-row-button w-full flex items-center justify-center gap-2 py-2 border-t border-border/10"
            >
              <Plus className="h-4 w-4" /> Add Expense
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
