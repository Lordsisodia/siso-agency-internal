import type { Database } from '@/integrations/supabase/types';

import type { Database } from '@/integrations/supabase/types';

export type IndustryRow = Database['public']['Tables']['industries']['Row'];
export type IndustryInsert = Database['public']['Tables']['industries']['Insert'];
export type IndustryUpdate = Database['public']['Tables']['industries']['Update'];

export type IndustryTaskRow = Database['public']['Tables']['industry_tasks']['Row'];
export type IndustryDocumentRow = Database['public']['Tables']['industry_documents']['Row'];
export type IndustryClientRow = Database['public']['Tables']['industry_clients']['Row'];

export interface LinkedClientSummary {
  id: string;
  business_name: string | null;
  status: string | null;
  estimated_price: number | null;
  updated_at: string | null;
}

export interface IndustryClientSummary extends IndustryClientRow {
  client?: LinkedClientSummary;
}


export interface IndustryWithMeta extends IndustryRow {
  clientsCount: number;
  openTasksCount: number;
  documentsCount: number;
}

export interface IndustriesListParams {
  searchQuery?: string;
  statusFilter?: string;
  focusFilter?: string;
  sortColumn?: keyof Pick<IndustryRow, 'name' | 'status' | 'focus_level' | 'created_at' | 'updated_at' | 'pipeline_value'>;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface IndustriesListState {
  industries: IndustryWithMeta[];
  totalCount: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}
