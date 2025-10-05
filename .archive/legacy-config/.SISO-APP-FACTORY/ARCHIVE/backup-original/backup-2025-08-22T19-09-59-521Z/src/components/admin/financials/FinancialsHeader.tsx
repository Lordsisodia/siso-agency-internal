
import { Button } from "@/components/ui/button";
import { Filter, Import } from "lucide-react";
import { BulkImportDialog } from "./import/BulkImportDialog";
import { AddExpenseDialog } from "./expense/AddExpenseDialog";

interface FinancialsHeaderProps {
  onFilterChange?: (filters: any) => void;
  onDataChange?: () => void;
}

export function FinancialsHeader({ onFilterChange, onDataChange }: FinancialsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Finances</h2>
        <p className="text-sm text-muted-foreground">
          Manage your expenses and revenue
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => onFilterChange?.({})}>
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <BulkImportDialog onImportComplete={onDataChange} />
        <AddExpenseDialog onExpenseAdded={onDataChange} />
      </div>
    </div>
  );
}
