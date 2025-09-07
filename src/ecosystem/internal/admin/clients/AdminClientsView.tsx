import { useState, useMemo } from 'react';
import { AirtableClientsTable } from './AirtableClientsTable';
import { ClientsCardGrid } from './ClientsCardGrid';
import { ClientViewPreference } from '@/types/client.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useClientsList } from '@/hooks/client';
import { DashboardStats } from './DashboardStats';
import { PriorityListing } from './PriorityListing';
import { ClientsHeader } from './ClientsHeader';
import { notionSpacing } from '@/lib/design-tokens';

const defaultViewPreference: ClientViewPreference = {
  columns: [
    { key: 'business_name', label: 'Business Name', visible: true, width: 200, pinned: true },
    { key: 'progress', label: 'Progress', visible: true, width: 150 },
    { key: 'status', label: 'Status', visible: true, width: 120, pinned: true },
    { key: 'project_name', label: 'Project', visible: true, width: 180 },
    { key: 'estimated_price', label: 'Balance', visible: true, width: 120 },
    { key: 'development_url', label: 'Website', visible: false, width: 150 },
    { key: 'next_steps', label: 'Next Steps', visible: false, width: 200 },
    { key: 'key_research', label: 'Key Research', visible: false, width: 180 },
    { key: 'updated_at', label: 'Updated', visible: true, width: 150 },
    { key: 'start_date', label: 'Start Date', visible: false, width: 150 },
    { key: 'estimated_completion_date', label: 'Est. Completion', visible: false, width: 150 },
  ],
  sortColumn: 'updated_at',
  sortDirection: 'desc',
  pageSize: 20,
  showAllColumns: false,
};

interface AdminClientsViewProps {
  isAdmin: boolean;
}

export function AdminClientsView({ isAdmin }: AdminClientsViewProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewPreference, setViewPreference] = useLocalStorage<ClientViewPreference>(
    'client_view_preference_v2',
    defaultViewPreference
  );
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");

  const { clients = [], isLoading, refetch } = useClientsList({
    searchQuery,
    statusFilter,
    sortColumn: viewPreference.sortColumn,
    sortDirection: viewPreference.sortDirection,
    pageSize: 1000,
  });
  
  const statsTotalClients = clients.length;
  const statsProjectValue = useMemo(() => {
    const total = clients.reduce((acc, curr) => {
      const price = curr.estimated_price || 0;
      console.log(`Client: ${curr.business_name}, Price: ${price}`);
      return acc + price;
    }, 0);
    console.log('Total calculated project value:', total);
    console.log('All clients data:', clients.map(c => ({ name: c.business_name, price: c.estimated_price })));
    return total;
  }, [clients]);

  // Adapter for view preference
  const handleViewPreferenceChange = (updates: Partial<ClientViewPreference>) => {
    setViewPreference(prev => ({ ...prev, ...updates }));
  };

  const handleRefetch = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Dashboard stats */}
          <DashboardStats
            totalClients={statsTotalClients}
            totalProjectValue={statsProjectValue}
          />
          
          {/* Priority Clients */}
          <PriorityListing limit={3} />

          {/* Controls with ClientsHeader */}
          <ClientsHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            viewPreference={viewPreference}
            onViewPreferenceChange={handleViewPreferenceChange}
            onAddClient={() => {}}
            onRefetch={handleRefetch}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Content View (Table or Cards) - Full Height */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 h-[calc(100vh-16rem)] flex flex-col">
            <div className="flex-1 overflow-hidden">
              {viewMode === "table" ? (
                <AirtableClientsTable
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  onSearchChange={setSearchQuery}
                  onStatusFilterChange={setStatusFilter}
                />
              ) : (
                <ClientsCardGrid
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  sortColumn={viewPreference.sortColumn}
                  sortDirection={viewPreference.sortDirection}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
