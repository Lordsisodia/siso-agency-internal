
import { TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { EditableCell } from "../table/EditableCell";
import { ExpenseRowActions } from "../ExpenseRowActions";
import { CategoryBadgeCell } from "./CategoryBadgeCell";
import { RecurringBadgeCell } from "./RecurringBadgeCell";
import { VendorCell } from "./VendorCell";
import { TableColumn } from "@/hooks/useTableColumns";
import { FinancialTransaction } from "@/utils/financial";

interface SpreadsheetExpensesRowProps {
  expense: FinancialTransaction;
  visibleColumns: TableColumn[];
  isSelected: boolean;
  onSelectExpense: (id: string) => void;
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateExpense: (expenseId: string, field: string, value: any) => void;
}

export function SpreadsheetExpensesRow({
  expense,
  visibleColumns,
  isSelected,
  onSelectExpense,
  onViewDetails,
  onDelete,
  onUpdateExpense
}: SpreadsheetExpensesRowProps) {
  // Freeze first (description), second (category) columns
  let stickyStyleDesc = { left: 48 };
  let stickyStyleCat = { left: 220 };

  return (
    <TableRow
      key={expense.id}
      className={cn(
        "transition-colors hover:bg-muted/5 group",
        isSelected ? "bg-muted/20" : ""
      )}
      data-state={isSelected ? "selected" : undefined}
    >
      {/* Checkbox sticky left */}
      <td className="sticky left-0 bg-background z-30 w-10 p-2 text-center border-r border-border/15">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onSelectExpense(expense.id)}
          aria-label={`Select ${expense.description}`}
        />
      </td>

      {/* Spreadsheet Columns */}
      {visibleColumns.map((column) => {
        switch (column.key) {
          case "description":
            return (
              <EditableCell
                key={`${expense.id}-desc`}
                value={expense.description || ""}
                onChange={(value) => onUpdateExpense(expense.id, "description", value)}
                className={cn(
                  "font-medium group-hover:bg-vivid-purple/10 focus-within:bg-vivid-purple/20 aria-[editing=true]:bg-vivid-purple/30 transition-colors min-w-[160px] max-w-[260px]",
                  "sticky bg-background z-20 shadow-[2px_0px_4px_-2px_rgba(0,0,0,0.01)]"
                )}
                style={stickyStyleDesc}
                inputClassName="font-normal"
              />
            );
          case "category":
            return (
              <EditableCell
                key={`${expense.id}-cat`}
                value={expense.category?.name || "Uncategorized"}
                onChange={(value) => onUpdateExpense(expense.id, "category_id", value)}
                type="select"
                options={[
                  { value: "", label: "Uncategorized" },
                  { value: "office", label: "Office Supplies" },
                  { value: "software", label: "Software" },
                  { value: "marketing", label: "Marketing" },
                  { value: "travel", label: "Travel" },
                  { value: "utilities", label: "Utilities" }
                ]}
                formatter={(value) => <CategoryBadgeCell value={value} />}
                className={cn(
                  "min-w-[140px] max-w-[180px] group-hover:bg-vivid-purple/10 focus-within:bg-vivid-purple/20 aria-[editing=true]:bg-vivid-purple/30 transition-colors",
                  "sticky bg-background z-20 shadow-[2px_0px_4px_-2px_rgba(0,0,0,0.01)]"
                )}
                style={stickyStyleCat}
                inputClassName="font-normal"
              />
            );
          case "amount":
            return (
              <EditableCell
                key={`${expense.id}-amt`}
                value={expense.amount}
                onChange={(value) => onUpdateExpense(expense.id, "amount", value)}
                type="currency"
                align="right"
                className="font-medium min-w-[100px] max-w-[140px] text-right group-hover:bg-green-800/10"
              />
            );
          case "date":
            return (
              <EditableCell
                key={`${expense.id}-date`}
                value={expense.date}
                onChange={(value) => onUpdateExpense(expense.id, "date", value)}
                type="date"
                className="min-w-[116px] max-w-[140px] group-hover:bg-blue-900/10"
              />
            );
          case "recurring_type":
            return (
              <EditableCell
                key={`${expense.id}-rec`}
                value={expense.recurring_type || "one-time"}
                onChange={(value) => onUpdateExpense(expense.id, "recurring_type", value)}
                type="select"
                options={[
                  { value: "one-time", label: "One-Time" },
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual" }
                ]}
                formatter={(value) => <RecurringBadgeCell value={value} />}
                className="min-w-[106px] max-w-[120px] group-hover:bg-orange-900/10"
              />
            );
          case "vendor":
            return (
              <td
                key={`${expense.id}-vendor`}
                className="border-r border-border/10 px-3 py-2.5 min-w-[110px] max-w-[200px] whitespace-nowrap"
              >
                <VendorCell name={expense.vendor?.name} />
              </td>
            );
          case "payment_method":
            return (
              <EditableCell
                key={`${expense.id}-pay`}
                value={expense.payment_method?.name || "—"}
                onChange={(value) => onUpdateExpense(expense.id, "payment_method_id", value)}
                className="min-w-[110px] max-w-[160px] group-hover:bg-gray-600/10"
              />
            );
          default:
            return (
              <td
                key={`${expense.id}-${column.key}`}
                className="border-r border-border/10 px-3 py-2.5 min-w-[90px]"
              >—</td>
            );
        }
      })}

      <td className="text-right bg-background sticky right-0 z-20 min-w-[64px]">
        <ExpenseRowActions 
          expenseId={expense.id}
          onViewDetails={onViewDetails}
          onDelete={onDelete}
        />
      </td>
    </TableRow>
  );
}
