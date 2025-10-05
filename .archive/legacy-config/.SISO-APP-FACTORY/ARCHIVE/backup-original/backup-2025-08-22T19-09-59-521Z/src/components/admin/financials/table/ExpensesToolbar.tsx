
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TableColumn } from "@/hooks/useTableColumns";
import { SavedView } from "@/hooks/useTableViews";
import { ColumnCustomization } from "./ColumnCustomization";
import { SavedViewsManager } from "./SavedViewsManager";

interface ExpensesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  columns: TableColumn[];
  onColumnVisibilityChange: (columns: TableColumn[]) => void;
  savedViews: SavedView[];
  onViewSelect: (view: SavedView) => void;
  onViewSave: (name: string) => void;
}

export function ExpensesToolbar({ 
  searchQuery, 
  onSearchChange, 
  columns,
  onColumnVisibilityChange,
  savedViews,
  onViewSelect,
  onViewSave
}: ExpensesToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="relative flex-grow max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search expenses..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <ColumnCustomization 
          columns={columns} 
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
        
        <SavedViewsManager
          views={savedViews}
          onViewSelect={onViewSelect}
          onViewSave={onViewSave}
        />
      </div>
    </div>
  );
}
