import { useMemo, useState } from 'react';
import { AirtableClientsTable } from './AirtableClientsTable';
import { ClientsCardGrid } from './ClientsCardGrid';
import { useClientsList } from '@/shared/hooks/client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ClientStatus } from '@/types/client.types';

interface AdminClientsViewProps {
  isAdmin: boolean;
}

const STATUS_FILTERS: Array<ClientStatus | 'all'> = [
  'all',
  'potential',
  'onboarding',
  'active',
  'completed',
  'archived',
];

export function AdminClientsView({ isAdmin }: AdminClientsViewProps) {
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const { clients = [], isLoading } = useClientsList({
    searchQuery,
    statusFilter,
    sortColumn: 'updated_at',
    sortDirection: 'desc',
  });

  const totalClients = clients.length;
  const totalValue = useMemo(
    () =>
      clients.reduce((sum, client) => {
        return sum + (client.estimated_price ?? 0);
      }, 0),
    [clients]
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Clients</h1>
              <p className="text-sm text-gray-400">
                {totalClients} clients · ${totalValue.toLocaleString()} total value
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                className="border-gray-700 bg-gray-900 text-gray-200 hover:bg-gray-800"
              >
                {viewMode === 'table' ? '📇 Cards' : '📊 Table'}
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-500">+ Add Client</Button>
            </div>
          </header>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search clients..."
              className="max-w-sm border-gray-800 bg-gray-900 text-white placeholder:text-gray-500"
            />
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                  size="sm"
                  className={
                    statusFilter === status
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800'
                  }
                >
                  {status === 'all'
                    ? 'All'
                    : `${status.charAt(0).toUpperCase()}${status.slice(1)}`}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-4">
            {viewMode === 'table' ? (
              <AirtableClientsTable clients={clients} isLoading={isLoading} />
            ) : (
              <ClientsCardGrid clients={clients} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
