
import { TableHead, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, MoreHorizontal } from "lucide-react";
import { TableColumn } from "@/hooks/useTableColumns";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ExpensesTableHeaderProps {
  visibleColumns: TableColumn[];
  onSort: (field: string) => void;
  selectedExpenses: string[];
  expenses: any[];
  onSelectAll: () => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onColumnResize?: (columnKey: string, width: number) => void;
}

export function ExpensesTableHeader({ 
  visibleColumns,
  onSort,
  selectedExpenses,
  expenses,
  onSelectAll,
  sortColumn,
  sortDirection,
  onColumnResize
}: ExpensesTableHeaderProps) {
  return (
    <TableRow className="hover:bg-transparent border-border/30 bg-muted/30">
      <TableHead className="w-12 bg-muted/30 backdrop-blur-sm sticky left-0 z-30 h-12 px-4 border-r border-border/10">
        <Checkbox 
          checked={selectedExpenses.length === expenses.length && expenses.length > 0}
          onCheckedChange={onSelectAll}
          aria-label="Select all expenses"
          className={selectedExpenses.length > 0 && selectedExpenses.length < expenses.length ? "opacity-80" : ""}
        />
      </TableHead>
      
      {visibleColumns.map((col, index) => {
        const isPinned = !!col.pinned;
        let leftPosition = 48; // Adjusted for checkbox column width
        
        if (isPinned) {
          for (let i = 0; i < index; i++) {
            if (visibleColumns[i].pinned) {
              leftPosition += 150; // Use a fixed width or dynamic if implemented
            }
          }
        }
        
        const isSorted = sortColumn === col.key;
        
        return (
          <TableHead
            key={col.key}
            className={cn(
              "text-xs font-medium text-muted-foreground tracking-wider uppercase h-12",
              "border-r border-border/10 bg-muted/30",
              isPinned ? "sticky z-20 backdrop-blur-sm" : ""
            )}
            style={isPinned ? { left: `${leftPosition}px` } : undefined}
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => onSort(col.key)}
              >
                {col.label}
                {isSorted ? (
                  sortDirection === "asc" ? (
                    <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" />
                  ) : (
                    <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />
                  )
                ) : (
                  <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-30" />
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Hide column
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Filter by this column
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Sort ascending
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Sort descending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Column resize handle */}
            <div 
              className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary opacity-0 hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                if (onColumnResize) {
                  const startX = e.clientX;
                  const currentWidth = e.currentTarget.parentElement?.offsetWidth || 150;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const newWidth = currentWidth + (moveEvent.clientX - startX);
                    if (newWidth >= 80) { // Minimum width
                      onColumnResize(col.key, newWidth);
                    }
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }
              }}
            />
          </TableHead>
        );
      })}
      
      <TableHead className="text-xs font-medium text-muted-foreground tracking-wider uppercase bg-muted/30 text-right">
        Actions
      </TableHead>
    </TableRow>
  );
}
