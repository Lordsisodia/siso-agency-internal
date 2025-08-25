
import { SpreadsheetExpenseRow } from "./SpreadsheetExpenseRow";
import { SpreadsheetExpensesEmpty } from "./SpreadsheetExpensesEmpty";
import { FinancialTransaction } from "@/utils/financial";
import { TableColumn } from "@/hooks/useTableColumns";

interface SpreadsheetExpensesBodyProps {
  expenses: FinancialTransaction[];
  visibleColumns: TableColumn[];
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  selectedExpenses: string[];
  onSelectExpense: (id: string) => void;
  onUpdateExpense: (expenseId: string, field: string, value: any) => void;
}

export function SpreadsheetExpensesBody({
  expenses,
  visibleColumns,
  onViewDetails,
  onDelete,
  selectedExpenses,
  onSelectExpense,
  onUpdateExpense
}: SpreadsheetExpensesBodyProps) {
  if (expenses.length === 0) {
    return <SpreadsheetExpensesEmpty />;
  }

  return (
    <>
      {expenses.map(expense => (
        <SpreadsheetExpenseRow
          key={expense.id}
          expense={expense}
          visibleColumns={visibleColumns}
          isSelected={selectedExpenses.includes(expense.id)}
          onSelectExpense={onSelectExpense}
          onViewDetails={onViewDetails}
          onDelete={onDelete}
          onUpdateExpense={onUpdateExpense}
        />
      ))}
    </>
  );
}
