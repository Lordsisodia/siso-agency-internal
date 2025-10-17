import { ClientData } from '@/types/client.types';
import { Skeleton } from '@/shared/ui/skeleton';
import { ClientCard } from './ClientCard';

interface ClientsCardGridProps {
  clients: ClientData[];
  isLoading: boolean;
}

export function ClientsCardGrid({ clients, isLoading }: ClientsCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl bg-gray-800/60" />
        ))}
      </div>
    );
  }

  if (!clients.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/60 text-sm text-gray-400">
        No clients match your filters yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
