
import { TableRow } from "@/components/ui/table";
import { ExpenseRowActions } from "../ExpenseRowActions";
import { CategoryBadgeCell } from "./CategoryBadgeCell";
import { RecurringBadgeCell } from "./RecurringBadgeCell";
import { VendorCell } from "./VendorCell";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { EditableCell } from "../table/EditableCell";
import { TableColumn } from "@/hooks/useTableColumns";
import { FinancialTransaction } from "@/utils/financial";

interface SpreadsheetExpenseRowProps {
  expense: FinancialTransaction;
  visibleColumns: TableColumn[];
  isSelected: boolean;
  onSelectExpense: (id: string) => void;
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateExpense: (expenseId: string, field: string, value: any) => void;
}

export function SpreadsheetExpenseRow({
  expense,
  visibleColumns,
  isSelected,
  onSelectExpense,
  onViewDetails,
  onDelete,
  onUpdateExpense
}: SpreadsheetExpenseRowProps) {
  // Notion/Airtable-like: subtle row highlight, custom border for each row ("eline")
  // Freeze first two columns
  let stickyStyleDesc = { left: 48 };
  let stickyStyleCat = { left: 220 };

  // Check if expense is due within the next few days
  const isDueSoon = () => {
    if (!expense.date) return false;
    
    const dueDate = new Date(expense.date);
    const today = new Date();
    const differenceInTime = dueDate.getTime() - today.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    
    return differenceInDays > 0 && differenceInDays <= 7;
  };

  return (
    <>
      <TableRow
        key={expense.id}
        className={cn(
          "group transition-colors",
          isSelected ? "bg-amber-900/20 selected-row" : isDueSoon() ? "bg-amber-800/10 hover:bg-amber-800/20" : "hover:bg-blue-950/30",
        )}
        data-state={isSelected ? "selected" : undefined}
        style={{
          borderBottom: isSelected 
            ? "2px solid #ffc46b" 
            : isDueSoon() 
              ? "2px solid #ff884b40" 
              : "2px solid #3e3763", // Vivid Notion-like horizontal eline
          boxShadow: "0 1.5px 0 0 #3e3763", // Makes eline more visible
        }}
      >
        {/* Checkbox sticky left */}
        <td className="sticky left-0 bg-background z-30 w-10 p-2 text-center border-r border-amber-400/50 border-solid">
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
                    "sticky bg-background z-20 shadow-[2px_0px_4px_-2px_rgba(0,0,0,0.01)]",
                    isDueSoon() && "text-amber-300 font-semibold"
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
    </>
  );
}
