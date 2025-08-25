
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface SpreadsheetExpensesEmptyProps {
  showAddButton?: boolean;
  onAddExpense?: () => void;
}

export function SpreadsheetExpensesEmpty({ showAddButton, onAddExpense }: SpreadsheetExpensesEmptyProps) {
  return (
    <tr>
      <td colSpan={1000} className="py-12">
        <div className="flex flex-col items-center justify-center gap-3 select-none">
          <div className="rounded-xl border-2 border-amber-400/60 bg-amber-900/20 px-8 py-5 shadow-xl flex items-center gap-2 animate-fade-in">
            <Info className="mr-2 h-6 w-6 text-amber-300" />
            <span className="text-amber-100 font-semibold text-lg tracking-wide">
              No expenses found
            </span>
          </div>
          <div className="text-base text-amber-200/80 mt-1 text-center max-w-xs">
            {showAddButton ? (
              <button 
                onClick={onAddExpense}
                className="text-amber-300 font-bold hover:text-amber-200 transition-colors cursor-pointer"
              >
                Add your first expense
              </button>
            ) : (
              <>
                Try adjusting your filters or <span className="text-amber-300 font-bold">add a new expense</span>.
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
