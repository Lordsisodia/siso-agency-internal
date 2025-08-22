import React, { useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScrollableTable } from '../../clients/ScrollableTable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, CheckCircle, XCircle, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactNumber } from '@/lib/formatters';
import { LeadTableColumn } from '../types';

interface LeadsTableProps {
  visibleColumns: LeadTableColumn[];
  pinnedColumns: LeadTableColumn[];
  filteredLeads: any[];
  selectedLeads: string[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  onSelectAll: () => void;
  onSelectLead: (leadId: string) => void;
  onRowClick: (leadId: string) => void;
  isLoading?: boolean;
}

export const LeadsTable = ({
  visibleColumns,
  pinnedColumns,
  filteredLeads,
  selectedLeads,
  sortColumn,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectLead,
  onRowClick,
  isLoading
}: LeadsTableProps) => {
  const renderCellContent = (lead: any, key: string) => {
    switch (key) {
      case 'username':
        return (
          <div className="flex items-center">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white mr-2">
              {lead.username.charAt(0).toUpperCase()}
            </div>
            <span>@{lead.username}</span>
          </div>
        );
      
      case 'followers_count':
        return lead.followers_count 
          ? formatCompactNumber(lead.followers_count) 
          : 'N/A';
          
      case 'status':
        return getStatusBadge(lead.status);
        
      case 'created_at':
        return new Date(lead.created_at).toLocaleDateString();
        
      case 'source':
        return <Badge variant="outline">Instagram</Badge>;
        
      case 'followed':
        return lead.followed ? (
          <div className="bg-green-500/10 text-green-500 w-5 h-5 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3" />
          </div>
        ) : (
          <div className="bg-muted w-5 h-5 rounded-full flex items-center justify-center">
            <XCircle className="h-3 w-3 text-muted-foreground/50" />
          </div>
        );
        
      case 'commented':
        return lead.commented ? (
          <div className="bg-green-500/10 text-green-500 w-5 h-5 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3" />
          </div>
        ) : (
          <div className="bg-muted w-5 h-5 rounded-full flex items-center justify-center">
            <XCircle className="h-3 w-3 text-muted-foreground/50" />
          </div>
        );
        
      case 'messaged':
        return lead.messaged ? (
          <div className="bg-green-500/10 text-green-500 w-5 h-5 rounded-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3" />
          </div>
        ) : (
          <div className="bg-muted w-5 h-5 rounded-full flex items-center justify-center">
            <XCircle className="h-3 w-3 text-muted-foreground/50" />
          </div>
        );
        
      case 'outreach_account':
        return lead.outreach_account || (
          <span className="text-muted-foreground">Not assigned</span>
        );
        
      case 'app_plan_status':
        if (lead.app_plan_status === 'completed') {
          return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>;
        } else if (lead.app_plan_status === 'in_progress') {
          return <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>;
        } else {
          return <Badge variant="outline">Not Started</Badge>;
        }
        
      case 'app_plan_url':
        return lead.app_plan_url ? (
          <a 
            href={lead.app_plan_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center"
            onClick={e => e.stopPropagation()}
          >
            <FileText className="h-4 w-4 mr-1" />
            View Plan
          </a>
        ) : '-';
        
      case 'last_interaction':
        return lead.last_interaction_at ? (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            {new Date(lead.last_interaction_at).toLocaleDateString()}
          </div>
        ) : '-';
        
      case 'assigned_to':
        return lead.assigned_to || '-';
        
      case 'notes':
        return lead.notes || '-';
        
      default:
        return lead[key] || '-';
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'contacted':
        return <Badge className="bg-blue-500/20 text-blue-400">Contacted</Badge>;
      case 'converted':
        return <Badge className="bg-green-500/20 text-green-400">Converted</Badge>;
      case 'new':
      default:
        return <Badge className="bg-amber-500/20 text-amber-400">New</Badge>;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ScrollableTable pinnedColumns={pinnedColumns} className="max-h-[calc(100vh-300px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 sticky left-0 bg-background z-20">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={onSelectAll}
                    className="rounded border-muted"
                  />
                </div>
              </TableHead>
              
              {visibleColumns.map((column, index) => {
                const isPinned = !!column.pinned;
                const isSorted = sortColumn === column.key;
                let leftPosition = 40;
                
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
                      "font-medium",
                      isPinned ? "sticky bg-background z-20" : ""
                    )}
                    style={{
                      minWidth: `${column.width || 150}px`,
                      width: `${column.width || 150}px`,
                      left: isPinned ? `${leftPosition}px` : undefined
                    }}
                    onClick={() => onSort(column.key)}
                  >
                    <div className="flex items-center cursor-pointer">
                      {column.label}
                      {isSorted && (
                        <ChevronDown 
                          className={cn(
                            "ml-1 h-4 w-4 transition-transform",
                            sortDirection === 'desc' ? "transform rotate-180" : ""
                          )}
                        />
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center py-10">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center py-10">
                  No leads found. Add your first lead.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onRowClick(lead.id)}
                >
                  <TableCell 
                    className="sticky left-0 bg-background z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead.id);
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => {}}
                        className="rounded border-muted"
                      />
                    </div>
                  </TableCell>
                  
                  {visibleColumns.map((column, index) => {
                    const isPinned = !!column.pinned;
                    let leftPosition = 40;
                    
                    if (isPinned) {
                      for (let i = 0; i < index; i++) {
                        if (visibleColumns[i].pinned) {
                          leftPosition += visibleColumns[i].width || 150;
                        }
                      }
                    }
                    
                    return (
                      <TableCell 
                        key={`${lead.id}-${column.key}`}
                        className={cn(
                          isPinned ? "sticky bg-background z-10" : ""
                        )}
                        style={{
                          left: isPinned ? `${leftPosition}px` : undefined,
                          maxWidth: `${column.width || 150}px`
                        }}
                      >
                        {renderCellContent(lead, column.key)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollableTable>
    </DndProvider>
  );
};
