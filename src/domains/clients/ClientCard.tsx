import { useNavigate } from 'react-router-dom';
import { ClientData, ClientStatus } from '@/types/client.types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  client: ClientData;
}

const statusColorMap: Record<ClientStatus | 'default', string> = {
  potential: 'bg-gray-500/20 text-gray-300 border-transparent',
  onboarding: 'bg-yellow-500/20 text-yellow-300 border-transparent',
  active: 'bg-green-500/20 text-green-300 border-transparent',
  completed: 'bg-blue-500/20 text-blue-300 border-transparent',
  archived: 'bg-slate-700/50 text-slate-400 border-transparent',
  default: 'bg-slate-700/50 text-slate-300 border-transparent',
};

export function ClientCard({ client }: ClientCardProps) {
  const navigate = useNavigate();

  const status = (client.status?.toLowerCase() || 'default') as ClientStatus | 'default';
  const statusStyles = statusColorMap[status] ?? statusColorMap.default;

  return (
    <button
      type="button"
      onClick={() => navigate(`/admin/clients/${client.id}`)}
      className="w-full rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-4 text-left transition hover:border-blue-500/40 hover:bg-gray-900/80"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-white">
            {client.business_name || client.full_name || 'Untitled Client'}
          </p>
          {client.type && (
            <p className="mt-1 truncate text-xs text-gray-400">{client.type}</p>
          )}
        </div>
        <Badge variant="outline" className={cn('capitalize', statusStyles)}>
          {client.status || 'Unknown'}
        </Badge>
      </div>

      {client.estimated_price != null && (
        <p className="mt-3 text-sm font-medium text-gray-300">
          ${client.estimated_price.toLocaleString()}
        </p>
      )}
    </button>
  );
}
