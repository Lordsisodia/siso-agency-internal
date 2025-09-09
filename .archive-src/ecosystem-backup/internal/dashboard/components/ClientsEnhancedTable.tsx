
import React from 'react';
import { ClientsTable } from './ClientsTable';
import { ClientViewPreferenceProvider } from './providers/ClientViewPreferenceProvider';
import { useViewPreference } from './context/ViewPreferenceContext';

interface ClientsEnhancedTableProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  viewMode?: "table" | "cards";
  setViewMode?: (mode: "table" | "cards") => void;
}

function ClientsTableContent({ 
  searchQuery, 
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  viewMode,
  setViewMode
}: ClientsEnhancedTableProps) {
  const { viewPreference, handleViewPreferenceChange } = useViewPreference();

  return (
    <ClientsTable
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      viewPreference={viewPreference}
      onViewPreferenceChange={handleViewPreferenceChange}
      onSearchChange={onSearchChange}
      onStatusFilterChange={onStatusFilterChange}
      viewMode={viewMode}
      setViewMode={setViewMode}
    />
  );
}

export function ClientsEnhancedTable(props: ClientsEnhancedTableProps) {
  return (
    <ClientViewPreferenceProvider>
      <ClientsTableContent {...props} />
    </ClientViewPreferenceProvider>
  );
}

