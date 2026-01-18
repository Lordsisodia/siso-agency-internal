import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/services/integrations/supabase/client';
import { useAdminCheck } from '@/domains/admin/hooks/useAdminCheck';
import { sampleIndustries } from '@/lib/data/sampleIndustries';
import type {
  IndustriesListParams,
  IndustriesListState,
  IndustryWithMeta,
} from '@/domains/agency/industries/types/industry.types';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_COLUMN: NonNullable<IndustriesListParams['sortColumn']> = 'updated_at';

const OPEN_TASK_STATUSES = ['todo', 'in_progress', 'blocked'];

interface FetchIndustriesArgs extends IndustriesListParams {
  isAdmin: boolean;
}

const buildSearchFilter = (searchQuery?: string): string | null => {
  if (!searchQuery) {
    return null;
  }

  const normalized = searchQuery.trim();

  if (!normalized) {
    return null;
  }

  // Search across name, description, positioning and go-to-market notes
  const encoded = normalized.replace(/,/g, '');
  return `name.ilike.%${encoded}%,description.ilike.%${encoded}%,positioning.ilike.%${encoded}%,go_to_market_notes.ilike.%${encoded}%`;
};

const mapCounts = <T extends { industry_id: string }>(rows: T[] | null | undefined): Record<string, number> => {
  if (!rows) {
    return {};
  }

  return rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.industry_id] = (accumulator[row.industry_id] ?? 0) + 1;
    return accumulator;
  }, {});
};

const mergeMetrics = (
  industries: IndustryWithMeta[],
  clientCounts: Record<string, number>,
  openTaskCounts: Record<string, number>,
  documentCounts: Record<string, number>
): IndustryWithMeta[] =>
  industries.map((industry) => ({
    ...industry,
    clientsCount: clientCounts[industry.id] ?? industry.clientsCount ?? 0,
    openTasksCount: openTaskCounts[industry.id] ?? industry.openTasksCount ?? 0,
    documentsCount: documentCounts[industry.id] ?? industry.documentsCount ?? 0,
  }));

const fetchIndustries = async ({
  isAdmin,
  searchQuery,
  statusFilter,
  focusFilter,
  sortColumn = DEFAULT_SORT_COLUMN,
  sortDirection = 'desc',
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: FetchIndustriesArgs): Promise<{ industries: IndustryWithMeta[]; totalCount: number }> => {
  if (!isAdmin) {
    return { industries: [], totalCount: 0 };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('industries')
    .select('*', { count: 'exact' })
    .order(sortColumn, { ascending: sortDirection === 'asc' })
    .range(from, to);

  const searchFilter = buildSearchFilter(searchQuery);
  if (searchFilter) {
    query = query.or(searchFilter);
  }

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (focusFilter && focusFilter !== 'all') {
    query = query.eq('focus_level', focusFilter);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching industries from database:', error);
    return { industries: sampleIndustries, totalCount: sampleIndustries.length };
  }

  if (!data) {
    return { industries: [], totalCount: 0 };
  }

  const industries: IndustryWithMeta[] = data.map((row) => ({
    ...row,
    clientsCount: 0,
    openTasksCount: 0,
    documentsCount: 0,
  }));

  if (!industries.length) {
    return { industries, totalCount: count ?? 0 };
  }

  const industryIds = industries.map((industry) => industry.id);

  const [clientsResult, tasksResult, documentsResult] = await Promise.all([
    supabase
      .from('industry_clients')
      .select('industry_id')
      .in('industry_id', industryIds),
    supabase
      .from('industry_tasks')
      .select('industry_id, status')
      .in('industry_id', industryIds)
      .in('status', OPEN_TASK_STATUSES),
    supabase
      .from('industry_documents')
      .select('industry_id')
      .in('industry_id', industryIds),
  ]);

  const clientCounts = mapCounts(clientsResult.data);
  const openTaskCounts = mapCounts(tasksResult.data);
  const documentCounts = mapCounts(documentsResult.data);

  return {
    industries: mergeMetrics(industries, clientCounts, openTaskCounts, documentCounts),
    totalCount: count ?? industries.length,
  };
};

const applySampleFilters = (
  data: IndustryWithMeta[],
  {
    searchQuery,
    statusFilter,
    focusFilter,
    sortColumn = DEFAULT_SORT_COLUMN,
    sortDirection = 'desc',
  }: IndustriesListParams
): IndustryWithMeta[] => {
  let filtered = [...data];

  if (searchQuery) {
    const normalized = searchQuery.toLowerCase();
    filtered = filtered.filter((industry) =>
      [industry.name, industry.description, industry.positioning, industry.go_to_market_notes]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalized))
    );
  }

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((industry) => industry.status === statusFilter);
  }

  if (focusFilter && focusFilter !== 'all') {
    filtered = filtered.filter((industry) => industry.focus_level === focusFilter);
  }

  filtered.sort((a, b) => {
    const column = sortColumn ?? DEFAULT_SORT_COLUMN;
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (column === 'pipeline_value') {
      const aValue = a.pipeline_value ?? 0;
      const bValue = b.pipeline_value ?? 0;
      return (aValue - bValue) * direction;
    }

    const aValue = (a[column] ?? '') as string;
    const bValue = (b[column] ?? '') as string;

    return aValue.localeCompare(bValue) * direction;
  });

  return filtered;
};

export const useIndustriesList = (params: IndustriesListParams = {}): IndustriesListState => {
  const {
    searchQuery = '',
    statusFilter = 'all',
    focusFilter = 'all',
    sortColumn = DEFAULT_SORT_COLUMN,
    sortDirection = 'desc',
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params;

  const { isAdmin, isLoading: adminCheckLoading } = useAdminCheck();
  const [industries, setIndustries] = useState<IndustryWithMeta[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const effectivePageSize = pageSize ?? DEFAULT_PAGE_SIZE;

  const refetch = useMemo(
    () =>
      async () => {
        if (!isAdmin) {
          setIndustries([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          const { industries: fetchedIndustries, totalCount: fetchedTotalCount } = await fetchIndustries({
            isAdmin,
            searchQuery,
            statusFilter,
            focusFilter,
            sortColumn,
            sortDirection,
            page,
            pageSize: effectivePageSize,
          });
          if (fetchedIndustries === sampleIndustries) {
            const filtered = applySampleFilters(sampleIndustries, {
              searchQuery,
              statusFilter,
              focusFilter,
              sortColumn,
              sortDirection,
            });
            const pageIndex = Math.max(page - 1, 0);
            const start = pageIndex * effectivePageSize;
            const end = start + effectivePageSize;
            setIndustries(filtered.slice(start, end));
            setTotalCount(filtered.length);
          } else {
            setIndustries(fetchedIndustries);
            setTotalCount(fetchedTotalCount ?? fetchedIndustries.length);
          }
        } catch (error) {
          console.error('Unexpected error fetching industries:', error);
          const filtered = applySampleFilters(sampleIndustries, {
            searchQuery,
            statusFilter,
            focusFilter,
            sortColumn,
            sortDirection,
          });
          const pageIndex = Math.max(page - 1, 0);
          const start = pageIndex * effectivePageSize;
          const end = start + effectivePageSize;
          setIndustries(filtered.slice(start, end));
          setTotalCount(filtered.length);
        } finally {
          setLoading(false);
        }
      },
    [effectivePageSize, isAdmin, searchQuery, statusFilter, focusFilter, sortColumn, sortDirection, page]
  );

  useEffect(() => {
    if (!adminCheckLoading) {
      void refetch();
    }
  }, [adminCheckLoading, refetch]);

  return {
    industries,
    totalCount,
    isLoading: loading || adminCheckLoading,
    refetch,
  };
};
