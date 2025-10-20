import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  IndustryClientSummary,
  IndustryDocumentRow,
  IndustryRow,
  IndustryTaskRow,
} from '@/ecosystem/internal/admin/industries/types/industry.types';

interface IndustryDetailState {
  industry: IndustryRow | null;
  tasks: IndustryTaskRow[];
  documents: IndustryDocumentRow[];
  clients: IndustryClientSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const OPEN_TASK_STATUSES = ['todo', 'in_progress', 'blocked'];

export const useIndustryDetail = (industryId: string | null): IndustryDetailState => {
  const [industry, setIndustry] = useState<IndustryRow | null>(null);
  const [tasks, setTasks] = useState<IndustryTaskRow[]>([]);
  const [documents, setDocuments] = useState<IndustryDocumentRow[]>([]);
  const [clients, setClients] = useState<IndustryClientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!industryId) {
      setIndustry(null);
      setTasks([]);
      setDocuments([]);
      setClients([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [{ data: industryData, error: industryError }, tasksResult, documentsResult, clientsResult] = await Promise.all([
        supabase
          .from('industries')
          .select('*')
          .eq('id', industryId)
          .maybeSingle(),
        supabase
          .from('industry_tasks')
          .select('*')
          .eq('industry_id', industryId)
          .order('due_date', { ascending: true, nullsFirst: false }),
        supabase
          .from('industry_documents')
          .select('*')
          .eq('industry_id', industryId)
          .order('created_at', { ascending: false }),
        supabase
          .from('industry_clients')
          .select('id, industry_id, client_id, relationship_notes, created_at, updated_at, user_id, client:client_onboarding(id, business_name, status, estimated_price, updated_at)')
          .eq('industry_id', industryId),
      ]);

      if (industryError) {
        throw industryError;
      }

      if (!industryData) {
        setIndustry(null);
        setTasks([]);
        setDocuments([]);
        setClients([]);
        return;
      }

      setIndustry(industryData);
      setTasks(tasksResult.data ?? []);
      setDocuments(documentsResult.data ?? []);

      const clientSummaries: IndustryClientSummary[] = (clientsResult.data ?? []).map((entry) => ({
        ...entry,
        client: entry.client
          ? {
              id: entry.client.id,
              business_name: entry.client.business_name,
              status: entry.client.status,
              estimated_price: entry.client.estimated_price,
              updated_at: entry.client.updated_at,
            }
          : undefined,
      }));

      setClients(clientSummaries);
    } catch (err) {
      console.error('Error fetching industry detail:', err);
      setError('Unable to load industry details.');
    } finally {
      setIsLoading(false);
    }
  }, [industryId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  return useMemo(() => ({
    industry,
    tasks,
    documents,
    clients,
    isLoading,
    error,
    refresh: fetchDetail,
  }), [industry, tasks, documents, clients, isLoading, error, fetchDetail]);
};
