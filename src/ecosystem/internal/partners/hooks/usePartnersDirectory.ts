import { useEffect, useMemo, useState, useCallback } from 'react';
import { partnerDirectoryService } from '../services/partnerDirectoryService';
import type { PartnerSummary } from '../types/partner.types';
import type { PartnerDirectoryAggregates } from '../services/partnerDirectoryService';

interface UsePartnersDirectoryState {
  partners: PartnerSummary[];
  isLoading: boolean;
  error: Error | null;
  filters: {
    status: string | null;
    tier: string | null;
    search: string;
  };
  setFilters: (updater: (prev: UsePartnersDirectoryState['filters']) => UsePartnersDirectoryState['filters']) => void;
  aggregates: PartnerDirectoryAggregates;
  refresh: () => Promise<void>;
}

const DEFAULT_FILTERS: UsePartnersDirectoryState['filters'] = {
  status: null,
  tier: null,
  search: '',
};

export function usePartnersDirectory(): UsePartnersDirectoryState {
  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [filters, updateFilters] = useState(DEFAULT_FILTERS);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aggregates, setAggregates] = useState<PartnerDirectoryAggregates>({
    activePartners: 0,
    totalRevenue: 0,
    totalCommission: 0,
  });

  const load = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { partners: partnerData, aggregates: aggregateData } =
          await partnerDirectoryService.getPartnersWithAggregates(filters);
        setPartners(partnerData);
        setAggregates(aggregateData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unable to load partners'));
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const setFilters = (updater: (prev: typeof filters) => typeof filters) => {
    updateFilters((prev) => updater(prev));
  };

  return {
    partners,
    isLoading,
    error,
    filters,
    setFilters,
    aggregates,
    refresh: load,
  };
}
