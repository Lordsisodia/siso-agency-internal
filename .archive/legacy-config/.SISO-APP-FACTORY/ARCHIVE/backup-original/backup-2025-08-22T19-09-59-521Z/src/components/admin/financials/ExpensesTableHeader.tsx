
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, FileDown, FilePlus } from "lucide-react";
import { ColumnCustomization } from "./table/ColumnCustomization";
import { SavedViewsManager } from "./table/SavedViewsManager";
import { TableColumn } from "@/hooks/useTableColumns";
import { SavedView } from "@/hooks/useTableViews";

interface ExpensesTableHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddExpense?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
  columns: TableColumn[];
  onColumnVisibilityChange: (columns: TableColumn[]) => void;
  savedViews: SavedView[];
  onViewSelect: (view: SavedView) => void;
  onViewSave: (name: string) => void;
}

export function ExpensesTableHeader({ 
  searchQuery, 
  onSearchChange,
  onAddExpense,
  onExport,
  onFilter,
  columns,
  onColumnVisibilityChange,
  savedViews,
  onViewSelect,
  onViewSave
}: ExpensesTableHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Expenses Tracking</h2>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses..."
            className="pl-8 w-[250px]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <ColumnCustomization 
          columns={columns} 
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
        
        <SavedViewsManager
          views={savedViews}
          onViewSelect={onViewSelect}
          onViewSave={onViewSave}
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9"
          onClick={onFilter}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9"
          onClick={onExport}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button 
          size="sm" 
          className="h-9"
          onClick={onAddExpense}
        >
          <FilePlus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>
    </div>
  );
}
