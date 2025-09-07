
import { useClientsList } from '@/hooks/client';
import { ClientCard } from './ClientCard';
import { ClientDetailSheet } from './ClientDetailSheet';
import { useState } from 'react';

interface ClientsCardGridProps {
  searchQuery?: string;
  statusFilter?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
}

export function ClientsCardGrid({
  searchQuery = '',
  statusFilter = 'all',
  sortColumn = 'updated_at',
  sortDirection = 'desc',
  viewMode,
  setViewMode
}: ClientsCardGridProps) {
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  const { 
    clients,
    isLoading,
    refetch
  } = useClientsList({
    searchQuery,
    statusFilter,
    sortColumn,
    sortDirection,
    pageSize: 100, // We want to show more clients in card view
  });

  return (
    <>
      {/* Card grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 8 }).map((_, index) => (
            <div 
              key={`skeleton-${index}`} 
              className="bg-background border rounded-lg shadow-sm p-4 animate-pulse h-52"
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-muted rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="h-6 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-8"></div>
              </div>
            </div>
          ))
        ) : clients.length === 0 ? (
          <div className="col-span-full p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          clients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onClick={() => setActiveClientId(client.id)}
            />
          ))
        )}
      </div>
      
      {/* Client detail sheet */}
      <ClientDetailSheet 
        clientId={activeClientId}
        isOpen={activeClientId !== null}
        onClose={() => {
          setActiveClientId(null);
          refetch().catch(console.error);
        }}
      />
    </>
  );
}
