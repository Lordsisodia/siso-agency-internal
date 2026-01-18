import { useEffect, useState } from "react";

import { useAdminCheck } from "@/domains/admin/hooks/useAdminCheck";
import { sampleClients } from "@/lib/data/sampleClients";
import { supabase } from "@/services/integrations/supabase/client";
import { ClientData, ClientsListParams, ClientsListResponse, TodoItem } from "@/domains/client/domain/types";

/**
 * Hook to fetch a list of all clients (admin only)
 */
export function useClientsList(params: ClientsListParams = {}): ClientsListResponse & {
  isLoading: boolean;
  refetch: () => Promise<void>;
} {
  const { isAdmin, isLoading: adminCheckLoading } = useAdminCheck();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const {
    searchQuery = "",
    statusFilter = "",
    sortColumn = "updated_at",
    sortDirection = "desc",
    page = 1,
    pageSize = 10,
  } = params;

  const fetchClients = async (): Promise<void> => {
    if (!isAdmin) {
      setClients([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // TEMPORARY: Force sample data for testing pipeline calculation
      const filteredSampleClients = applySampleDataFilters(sampleClients, { searchQuery, statusFilter });
      setClients(filteredSampleClients);
      setTotalCount(filteredSampleClients.length);
      setLoading(false);
      return;

      // Database logic preserved for future use
      /*
      let query = supabase.from('client_onboarding').select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`company_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%`);
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.order(sortColumn, { ascending: sortDirection === 'asc' }).range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        const fallback = applySampleDataFilters(sampleClients, { searchQuery, statusFilter });
        setClients(fallback);
        setTotalCount(fallback.length);
        return;
      }

      const processedClients: ClientData[] = data.map((item) => {
        let parsedTodos: TodoItem[] = [];
        if (item.todos) {
          try {
            if (typeof item.todos === "string") {
              parsedTodos = JSON.parse(item.todos);
            } else if (Array.isArray(item.todos)) {
              parsedTodos = item.todos.map((todo: any) => ({
                id: todo.id || crypto.randomUUID(),
                text: todo.text || "",
                completed: Boolean(todo.completed),
                priority: todo.priority || "medium",
                due_date: todo.due_date,
                related_to: todo.related_to,
                assigned_to: todo.assigned_to,
              }));
            }
          } catch (e) {
            parsedTodos = [];
          }
        }

        return {
          id: item.id,
          full_name: item.contact_name || "Unknown",
          email: item.email || null,
          business_name: item.company_name || null,
          phone: null,
          avatar_url: null,
          status: item.status,
          progress: (item as any).progress || "Not Started",
          current_step: item.current_step,
          total_steps: item.total_steps,
          completed_steps: item.completed_steps || [],
          created_at: item.created_at,
          updated_at: item.updated_at,
          website_url: item.website_url || null,
          professional_role: null,
          bio: null,
          project_name: item.project_name || null,
          company_niche: item.company_niche || null,
          development_url: null,
          mvp_build_status: null,
          notion_plan_url: null,
          payment_status: null,
          estimated_price: (item as any).estimated_price || null,
          initial_contact_date: null,
          start_date: null,
          estimated_completion_date: null,
          todos: parsedTodos,
          next_steps: null,
          key_research: null,
          priority: null,
          contact_name: item.contact_name || null,
          company_name: item.company_name || null,
        } as ClientData;
      });

      setClients(processedClients);
      setTotalCount(count || 0);
      */
    } catch (err) {
      const fallback = applySampleDataFilters(sampleClients, { searchQuery, statusFilter });
      setClients(fallback);
      setTotalCount(fallback.length);
    } finally {
      setLoading(false);
    }
  };

  const applySampleDataFilters = (
    data: ClientData[],
    filters: { searchQuery: string; statusFilter: string }
  ): ClientData[] => {
    let filtered = [...data];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.business_name?.toLowerCase().includes(query) ||
          client.full_name?.toLowerCase().includes(query) ||
          client.project_name?.toLowerCase().includes(query)
      );
    }

    if (filters.statusFilter && filters.statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === filters.statusFilter);
    }

    filtered.sort((a, b) => {
      const aIsArchived = a.status === "archived";
      const bIsArchived = b.status === "archived";

      if (aIsArchived !== bIsArchived) {
        return aIsArchived ? 1 : -1;
      }

      const fieldA = (a as any)[sortColumn];
      const fieldB = (b as any)[sortColumn];

      if (fieldA === fieldB) return 0;
      const compare = fieldA > fieldB ? 1 : -1;
      return sortDirection === "asc" ? compare : -compare;
    });

    return filtered;
  };

  useEffect(() => {
    fetchClients();
  }, [isAdmin, adminCheckLoading, searchQuery, statusFilter, sortColumn, sortDirection, page, pageSize]);

  return {
    clients,
    totalCount,
    isLoading: loading,
    refetch: fetchClients,
  };
}
