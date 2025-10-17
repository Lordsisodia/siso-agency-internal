import React, { useRef } from 'react';
import { Table } from '@/shared/ui/table';
import { ClientViewPreference } from '@/types/client.types';
import { ClientAddForm } from './ClientAddForm';
// import { ClientAnalyticsCards } from './ClientAnalyticsCards'; // Removed import of analytics cards to avoid unused import warning
// import { ClientsHeader } from './ClientsHeader'; // Removed duplicate header rendering!
import { ScrollableTable } from './ScrollableTable';
import { useClientTable } from './hooks/useClientTable';
// Removed import of clientAnalytics hook since analytics cards are removed
import { ClientTableHeader } from './components/ClientTableHeader';
import { ClientTableBody } from './components/ClientTableBody';
import { ClientTablePagination } from './components/ClientTablePagination';
import { cn } from "@/shared/lib/utils";
import { tableStyles } from '@/shared/ui/table-styles';
import { BulkActionsBar } from './BulkActionsBar';
import { ClientsTableSkeleton } from './ClientsTableSkeleton';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';

interface ClientsTableProps {
  searchQuery?: string;
  statusFilter?: string;
  viewPreference: ClientViewPreference;
  onViewPreferenceChange: (preference: Partial<ClientViewPreference>) => void;
  onSearchChange?: (query: string) => void;
  onStatusFilterChange?: (status: string) => void;
  viewMode?: "table" | "cards";
  setViewMode?: (mode: "table" | "cards") => void;
  onMetricsChange?: (metrics: { totalCount: number; pipelineValue: number; isLoading: boolean }) => void;
  onStatusValuesChange?: (statuses: string[]) => void;
  onRefetchReady?: (refetch: () => Promise<void>) => void;
}

export function ClientsTable({ 
  searchQuery = '', 
  statusFilter = 'all',
  viewPreference,
  onViewPreferenceChange,
  onSearchChange,
  onStatusFilterChange,
  viewMode,
  setViewMode,
  onMetricsChange,
  onStatusValuesChange,
  onRefetchReady,
}: ClientsTableProps) {
  const [isAddClientOpen, setIsAddClientOpen] = React.useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const tableElementRef = useRef<HTMLTableElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const {
    page,
    setPage,
    selectedClients,
    editingCell,
    editValue,
    setEditValue,
    editInputRef,
    clients,
    isLoading,
    totalCount,
    handleSort,
    handleSelectAll,
    handleSelectClient,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteSelected,
    refetch
  } = useClientTable(searchQuery, statusFilter, viewPreference, onViewPreferenceChange);

  React.useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  const visibleColumns = React.useMemo(() => 
    viewPreference.columns.filter(col => col.visible),
    [viewPreference.columns]
  );

  const pinnedColumns = React.useMemo(() => 
    visibleColumns.filter(col => col.pinned),
    [visibleColumns]
  );

  const totalPages = Math.ceil(totalCount / viewPreference.pageSize);

  const pipelineValue = React.useMemo(() => {
    return clients.reduce((sum, client) => sum + (client.estimated_price ?? 0), 0);
  }, [clients]);

  React.useEffect(() => {
    if (onMetricsChange) {
      onMetricsChange({ totalCount, pipelineValue, isLoading });
    }
  }, [onMetricsChange, totalCount, pipelineValue, isLoading]);

  const statusValues = React.useMemo(() => {
    const unique = new Set<string>();
    clients.forEach((client) => {
      if (client.status) {
        unique.add(String(client.status));
      }
    });
    return Array.from(unique);
  }, [clients]);

  React.useEffect(() => {
    if (onStatusValuesChange) {
      onStatusValuesChange(statusValues);
    }
  }, [statusValues, onStatusValuesChange]);

  const handleClientAddSuccess = () => {
    refetch();
  };

  const moveColumn = React.useCallback((dragIndex: number, hoverIndex: number) => {
    onViewPreferenceChange({
      columns: Array.from(viewPreference.columns, (col, idx) => {
        if (idx === dragIndex) {
          return viewPreference.columns[hoverIndex];
        }
        if (idx === hoverIndex) {
          return viewPreference.columns[dragIndex];
        }
        return col;
      }),
    });
  }, [viewPreference.columns, onViewPreferenceChange]);

  if (isLoading) {
    return <ClientsTableSkeleton />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full flex-col">
        {selectedClients.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedClients.length}
            onDeleteSelected={handleDeleteSelected}
            onExportSelected={() => {
              // Placeholder for export logic
            }}
          />
        )}

        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">Records</p>
            <p className="text-sm text-white/60">
              {totalCount} total · page {page} of {totalPages || 1}
            </p>
          </div>
          <Button
            size="sm"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setIsAddClientOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New client
          </Button>
        </div>
        
        <ScrollableTable pinnedColumns={pinnedColumns}>
          <div ref={tableContainerRef} className="relative">
            <Table ref={tableElementRef} noWrapper className={cn(
              tableStyles(),
              "w-auto min-w-[1200px] backdrop-blur-sm [&_th]:bg-gray-900/95 [&_th]:text-gray-100 [&_th]:border-gray-700 [&_td]:bg-transparent [&_td]:border-gray-800 [&_tr:hover]:bg-gray-800/50 [&_tr:nth-child(even)]:bg-gray-900/30"
            )}>
              <ClientTableHeader
                visibleColumns={visibleColumns}
                selectedClients={selectedClients}
                clients={clients}
                onSelectAll={handleSelectAll}
                onSort={handleSort}
                sortColumn={viewPreference.sortColumn}
                sortDirection={viewPreference.sortDirection}
                moveColumn={moveColumn}
              />
              <ClientTableBody
                clients={clients}
                visibleColumns={visibleColumns}
                selectedClients={selectedClients}
                editingCell={editingCell}
                editValue={editValue}
                editInputRef={editInputRef}
                onEditValueChange={setEditValue}
                onSelectClient={handleSelectClient}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
              />
            </Table>
          </div>
        </ScrollableTable>

        <div className="mt-4">
          <ClientTablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
        
        <ClientAddForm 
          open={isAddClientOpen} 
          onOpenChange={setIsAddClientOpen} 
          onSuccess={handleClientAddSuccess}
        />
      </div>
    </DndProvider>
  );
}
