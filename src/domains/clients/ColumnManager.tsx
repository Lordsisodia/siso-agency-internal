import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, CheckCircle, Circle, Plus, Pin, PinOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientColumnPreference } from '@/types/client.types';
import { ColumnCustomizationModal } from './ColumnCustomizationModal';

interface ColumnManagerProps {
  columns: ClientColumnPreference[];
  onColumnsChange: (columns: ClientColumnPreference[]) => void;
  showAllColumns?: boolean;
  onToggleShowAll?: () => void;
}

export function ColumnManager({ 
  columns, 
  onColumnsChange,
  showAllColumns,
  onToggleShowAll
}: ColumnManagerProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);

  const handleToggleColumn = (key: string) => {
    const newColumns = columns.map(col => {
      if (col.key === key) {
        return { ...col, visible: !col.visible };
      }
      return col;
    });
    
    onColumnsChange(newColumns);
  };
  
  const handleTogglePin = (key: string) => {
    const newColumns = columns.map(col => {
      if (col.key === key) {
        return { ...col, pinned: !col.pinned };
      }
      return col;
    });
    
    onColumnsChange(newColumns);
  };
  
  const resetToDefault = () => {
    const defaultColumns = columns.map(col => {
      // Default visible columns
      const defaultVisible = [
        'business_name', 
        'progress',
        'status', 
        'project_name', 
        'updated_at'
      ].includes(col.key);
      
      const defaultPinned = [
        'business_name',
        'status'
      ].includes(col.key);
      
      return { 
        ...col, 
        visible: defaultVisible,
        pinned: defaultPinned && defaultVisible
      };
    });
    
    onColumnsChange(defaultColumns);
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Table Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {onToggleShowAll && (
            <>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  onToggleShowAll();
                }}
                className="flex items-center justify-between cursor-pointer font-medium"
              >
                <span>{showAllColumns ? "Show only selected columns" : "Show all columns"}</span>
                {showAllColumns && <CheckCircle className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {columns.map((column) => (
              <DropdownMenuItem 
                key={column.key}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleColumn(column.key);
                    }}
                  >
                    {column.visible ? 
                      <CheckCircle className="h-4 w-4 text-primary" /> : 
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                  <span>{column.label || column.key.replace(/_/g, ' ')}</span>
                </div>
                
                {column.visible && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-60 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(column.key);
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
            onClick={(e) => {
              e.preventDefault();
              setIsCustomizationModalOpen(true);
            }}
            className="text-center justify-center font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Customize Columns
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => {
              e.preventDefault();
              resetToDefault();
            }}
            className="text-center justify-center font-medium"
          >
            Reset to Default
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ColumnCustomizationModal
        open={isCustomizationModalOpen}
        onOpenChange={setIsCustomizationModalOpen}
        columns={columns}
        onColumnsChange={onColumnsChange}
      />
    </>
  );
}
