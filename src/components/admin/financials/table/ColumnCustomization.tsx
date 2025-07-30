
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Circle, Pin, PinOff, Settings2 } from "lucide-react";

interface Column {
  key: string;
  label: string;
  visible: boolean;
  pinned?: boolean;
}

interface ColumnCustomizationProps {
  columns: Column[];
  onColumnVisibilityChange: (columns: Column[]) => void;
}

export function ColumnCustomization({ columns, onColumnVisibilityChange }: ColumnCustomizationProps) {
  const [localColumns, setLocalColumns] = useState(columns);

  const toggleColumn = (columnKey: string) => {
    const updatedColumns = localColumns.map(col => {
      if (col.key === columnKey) {
        return { ...col, visible: !col.visible };
      }
      return col;
    });
    setLocalColumns(updatedColumns);
    onColumnVisibilityChange(updatedColumns);
  };
  
  const togglePinColumn = (columnKey: string) => {
    const updatedColumns = localColumns.map(col => {
      if (col.key === columnKey) {
        return { ...col, pinned: !col.pinned };
      }
      return col;
    });
    setLocalColumns(updatedColumns);
    onColumnVisibilityChange(updatedColumns);
  };
  
  const resetToDefault = () => {
    const defaultColumns = localColumns.map(col => {
      const defaultVisible = col.key !== 'payment_method';
      const defaultPinned = col.key === 'description';
      return { 
        ...col, 
        visible: defaultVisible,
        pinned: defaultPinned && defaultVisible
      };
    });
    
    setLocalColumns(defaultColumns);
    onColumnVisibilityChange(defaultColumns);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings2 className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Table Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {localColumns.map((column) => (
            <DropdownMenuItem
              key={column.key}
              className="flex items-center justify-between cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => toggleColumn(column.key)}
                >
                  {column.visible ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span>{column.label}</span>
              </div>
              
              {column.visible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinColumn(column.key);
                  }}
                  title={column.pinned ? "Unpin column" : "Pin column"}
                >
                  {column.pinned ? (
                    <PinOff className="h-3 w-3" />
                  ) : (
                    <Pin className="h-3 w-3" />
                  )}
                </Button>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={resetToDefault}
          className="justify-center text-center"
        >
          Reset to Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
