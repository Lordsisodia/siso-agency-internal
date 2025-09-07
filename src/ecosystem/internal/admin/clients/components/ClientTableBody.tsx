
import React from 'react';
import { TableBody, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ClientColumnPreference, ClientData } from '@/types/client.types';
import { ClientTableCell, TableCell } from './ClientTableCell';
import { cn } from '@/lib/utils';
import { tableRowStyles } from '@/components/ui/table-styles';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientTableBodyProps {
  clients: ClientData[];
  visibleColumns: ClientColumnPreference[];
  selectedClients: string[];
  editingCell: { id: string; field: string; } | null;
  editValue: string;
  editInputRef: React.RefObject<HTMLInputElement>;
  onEditValueChange: (value: string) => void;
  onSelectClient: (clientId: string) => void;
  onStartEdit: (client: ClientData, field: string) => void;
  onSaveEdit: (params: { id: string; field: string; value: string; }) => void;
}

export function ClientTableBody({
  clients,
  visibleColumns,
  selectedClients,
  editingCell,
  editValue,
  editInputRef,
  onEditValueChange,
  onSelectClient,
  onStartEdit,
  onSaveEdit
}: ClientTableBodyProps) {
  const navigate = useNavigate();

  const handleRowClick = (client: ClientData, event: React.MouseEvent) => {
    // Prevent navigation if clicking checkbox or editing
    const isCheckbox = (event.target as HTMLElement).closest('[role="checkbox"]');
    const isEditingAction = (event.target as HTMLElement).closest('button');
    if (isCheckbox || isEditingAction || editingCell) return;
    
    // Navigate to client detail page
    navigate(`/admin/clients/${client.id}`);
  };

  if (clients.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell 
            colSpan={visibleColumns.length + 1} 
            className="h-[300px] text-center bg-background/30"
          >
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Users className="h-8 w-8 opacity-50" />
              <p className="text-sm">No clients found matching your search criteria</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {clients.map((client) => (
        <TableRow 
          key={client.id} 
          className={cn(
            tableRowStyles(),
            "group transition-all duration-200 hover:bg-muted/10 border-border/20 cursor-pointer"
          )}
          onClick={(e) => handleRowClick(client, e)}
        >
          <TableCell className="sticky left-0 bg-background z-10">
            <Checkbox 
              checked={selectedClients.includes(client.id)}
              onCheckedChange={() => onSelectClient(client.id)}
              aria-label={`Select ${client.full_name}`}
            />
          </TableCell>
          
          {visibleColumns.map((column, colIndex) => {
            const isPinned = !!column.pinned;
            let leftPosition = 40;
            if (isPinned) {
              for (let i = 0; i < colIndex; i++) {
                if (visibleColumns[i].pinned) {
                  leftPosition += visibleColumns[i].width || 150;
                }
              }
            }
            
            const isEditing = editingCell?.id === client.id && editingCell?.field === column.key;
            
            return (
              <TableCell 
                key={column.key}
                className={cn(
                  "group-hover:bg-muted/40 transition-colors duration-200",
                  isPinned ? 'sticky bg-background z-10' : '',
                  "p-4 align-middle [&:has([role=checkbox])]:pr-0 whitespace-nowrap overflow-hidden text-ellipsis"
                )}
                style={{ 
                  left: isPinned ? `${leftPosition}px` : undefined,
                  maxWidth: `${column.width || 150}px`
                }}
              >
                <ClientTableCell
                  client={client}
                  columnKey={column.key}
                  isEditing={isEditing}
                  editValue={editValue}
                  editInputRef={editInputRef}
                  onEditValueChange={onEditValueChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editingCell) {
                      onSaveEdit({
                        id: editingCell.id,
                        field: editingCell.field,
                        value: editValue
                      });
                    }
                  }}
                  onDoubleClick={() => onStartEdit(client, column.key)}
                  onSaveEdit={onSaveEdit}
                />
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
}
