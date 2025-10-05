
import { TableRow, TableCell } from "@/components/ui/table";
import { FinancialTransaction } from "@/utils/financial";
import { ExpenseRowActions } from "../ExpenseRowActions";
import { TableColumn } from "@/hooks/useTableColumns";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ExpensesTableBodyProps {
  expenses: FinancialTransaction[];
  visibleColumns: TableColumn[];
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  selectedExpenses: string[];
  onSelectExpense: (id: string) => void;
}

export function ExpensesTableBody({ 
  expenses, 
  visibleColumns, 
  onViewDetails, 
  onDelete,
  selectedExpenses,
  onSelectExpense
}: ExpensesTableBodyProps) {
  if (expenses.length === 0) {
    return (
      <TableRow>
        <TableCell 
          colSpan={visibleColumns.length + 2} 
          className="text-center py-8 text-muted-foreground"
        >
          No expenses found. Try adjusting your filters or add a new expense.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {expenses.map(expense => {
        const isSelected = selectedExpenses.includes(expense.id);
        
        return (
          <TableRow 
            key={expense.id}
            className={cn(
              "transition-all duration-200 border-border/20",
              isSelected ? "bg-muted/20" : "hover:bg-muted/10"
            )}
          >
            <TableCell className="sticky left-0 bg-inherit z-10">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => onSelectExpense(expense.id)}
                aria-label={`Select ${expense.description}`}
              />
            </TableCell>
            
            {visibleColumns.map((col, colIndex) => {
              const isPinned = !!col.pinned;
              let leftPosition = 48; // Checkbox width
              
              if (isPinned) {
                for (let i = 0; i < colIndex; i++) {
                  if (visibleColumns[i].pinned) {
                    leftPosition += 150; // Use a fixed width or dynamic if implemented
                  }
                }
              }
              
              let cellContent;
              
              switch (col.key) {
                case "description":
                  cellContent = <span className="font-medium">{expense.description}</span>;
                  break;
                case "category":
                  cellContent = (
                    <Badge variant="outline" className="bg-blue-100/50 text-blue-800 border-blue-200">
                      {expense.category?.name || "Uncategorized"}
                    </Badge>
                  );
                  break;
                case "amount":
                  cellContent = <span className="font-medium">£{expense.amount.toFixed(2)}</span>;
                  break;
                case "date":
                  cellContent = new Date(expense.date).toLocaleDateString();
                  break;
                case "recurring_type":
                  cellContent = (
                    <Badge className={cn(
                      "font-medium",
                      expense.recurring_type === 'monthly' ? 'bg-green-100/50 text-green-800 border-green-200' : 
                      expense.recurring_type === 'annual' ? 'bg-purple-100/50 text-purple-800 border-purple-200' : 
                      'bg-amber-100/50 text-amber-800 border-amber-200'
                    )}>
                      {expense.recurring_type === 'monthly' ? 'Monthly' : 
                       expense.recurring_type === 'annual' ? 'Annual' : 'One-Time'}
                    </Badge>
                  );
                  break;
                case "vendor":
                  cellContent = expense.vendor?.name || "—";
                  break;
                case "payment_method":
                  cellContent = expense.payment_method?.name || "—";
                  break;
                default:
                  cellContent = "—";
              }
              
              return (
                <TableCell
                  key={col.key}
                  className={cn(
                    isPinned ? "sticky bg-inherit z-10" : "",
                    "p-4 align-middle"
                  )}
                  style={isPinned ? { left: `${leftPosition}px` } : undefined}
                >
                  {cellContent}
                </TableCell>
              );
            })}
            
            <TableCell className="text-right">
              <ExpenseRowActions 
                expenseId={expense.id}
                onViewDetails={onViewDetails}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
