
import { useMemo } from 'react';
import { ClientData } from '@/types/client.types';

interface ClientAnalyticsProps {
  clients: ClientData[];
  totalCount: number;
}

export function useClientAnalytics({ clients, totalCount }: ClientAnalyticsProps) {
  return useMemo(() => {
    const activeClientsCount = clients.filter(c => c.status === 'active').length;
    const pipelineClientsCount = clients.filter(c => ['pending', 'proposal', 'negotiation'].includes(c.status)).length;
    const pipelineValue = clients
      .filter(c => ['pending', 'proposal', 'negotiation'].includes(c.status))
      .reduce((sum, client) => sum + (client.estimated_price || 0), 0);
    const conversionRate = totalCount > 0 ? Math.round((activeClientsCount / totalCount) * 100) : 0;

    return {
      activeClients: activeClientsCount,
      pipelineClients: pipelineClientsCount,
      pipelineValue,
      conversionRate
    };
  }, [clients, totalCount]);
}
