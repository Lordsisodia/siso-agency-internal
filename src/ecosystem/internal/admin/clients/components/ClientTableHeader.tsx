
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ClientColumnPreference } from '@/types/client.types';
import { DraggableColumnHeader } from '../DraggableColumnHeader';
import { cn } from '@/lib/utils';

interface ClientTableHeaderProps {
  visibleColumns: ClientColumnPreference[];
  selectedClients: string[];
  clients: any[];
  onSelectAll: () => void;
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
}

export function ClientTableHeader({
  visibleColumns,
  selectedClients,
  clients,
  onSelectAll,
  onSort,
  sortColumn,
  sortDirection,
  moveColumn
}: ClientTableHeaderProps) {
  return (
    <TableHeader className="sticky top-0 z-20">
      <TableRow className="hover:bg-transparent border-border/30">
        <TableHead className="w-12 bg-background/95 backdrop-blur-sm sticky left-0 z-30 h-12 px-4">
          <Checkbox 
            checked={selectedClients.length === clients.length && clients.length > 0}
            onCheckedChange={onSelectAll}
            aria-label="Select all clients"
            className={selectedClients.length > 0 && selectedClients.length < clients.length ? "opacity-80" : ""}
          />
        </TableHead>
        
        {visibleColumns.map((column, index) => {
          const isPinned = !!column.pinned;
          let leftPosition = 48; // Adjusted for checkbox column width
          if (isPinned) {
            for (let i = 0; i < index; i++) {
              if (visibleColumns[i].pinned) {
                leftPosition += visibleColumns[i].width || 150;
              }
            }
          }
          
          return (
            <TableHead 
              key={column.key}
              className={cn(
                "text-xs font-medium text-muted-foreground tracking-wider uppercase h-12",
                isPinned ? 'sticky z-20 bg-background/95 backdrop-blur-sm' : ''
              )}
              style={{ 
                minWidth: `${column.width || 150}px`,
                width: `${column.width || 150}px`,
                left: isPinned ? `${leftPosition}px` : undefined
              }}
            >
              <DraggableColumnHeader
                column={column}
                index={index}
                moveColumn={moveColumn}
                onSort={() => onSort(column.key)}
                isSorted={sortColumn === column.key}
                sortDirection={sortDirection}
              />
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
