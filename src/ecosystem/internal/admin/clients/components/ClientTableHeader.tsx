
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Checkbox } from '@/shared/ui/checkbox';
import { ClientColumnPreference } from '@/types/client.types';
import { DraggableColumnHeader } from '../DraggableColumnHeader';
import { cn } from '@/shared/lib/utils';

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
    <TableHeader className="sticky top-0 z-30">
      <TableRow className="hover:bg-transparent border-b border-white/10 bg-[#0F0E16]/95 backdrop-blur-sm">
        <TableHead className="sticky left-0 top-0 z-40 h-12 w-12 bg-[#0F0E16]/95 px-4 backdrop-blur-sm">
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
                "sticky top-0 z-30 h-12 text-xs font-medium uppercase tracking-wider text-white/70 bg-[#0F0E16]/95 backdrop-blur-sm border-b border-white/10",
                isPinned ? 'z-40' : ''
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

        <TableHead
          className="sticky top-0 right-0 z-30 h-12 w-28 bg-[#0F0E16]/95 text-xs font-medium uppercase tracking-wider text-white/60 backdrop-blur-sm"
        >
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
