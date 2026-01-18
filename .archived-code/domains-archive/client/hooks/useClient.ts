import useSWR from 'swr';
import { supabase } from '@/services/integrations/supabase/client';
import { ClientData, OnboardingProgress } from '@/types/client.types';
import { sampleClients } from '@/lib/data/sampleClients';

const DEFAULT_PROGRESS: OnboardingProgress = {
  initial_contact: false,
  talked_to: false,
  proposal_created: false,
  quote_given: false,
  mvp_created: false,
  deposit_collected: false,
  project_live: false,
};

const parseTodos = (rawTodos: unknown): ClientData['todos'] => {
  if (!rawTodos) {
    return [];
  }

  try {
    if (typeof rawTodos === 'string') {
      return JSON.parse(rawTodos);
    }

    if (Array.isArray(rawTodos)) {
      return rawTodos as ClientData['todos'];
    }
  } catch (parseError) {
    console.warn('Unable to parse client todos', parseError);
  }

  return [];
};

const mapDatabaseClientToClientData = (record: Record<string, any>): ClientData => {
  return {
    id: record.id,
    full_name: record.contact_name || record.full_name || 'Unknown',
    email: record.email || null,
    business_name: record.company_name || record.business_name || null,
    phone: record.phone || null,
    avatar_url: record.avatar_url || null,
    status: record.status ?? 'potential',
    progress: record.progress ?? 'Not Started',
    current_step: record.current_step ?? 0,
    total_steps: record.total_steps ?? 0,
    completed_steps: Array.isArray(record.completed_steps) ? record.completed_steps : [],
    created_at: record.created_at,
    updated_at: record.updated_at,
    website_url: record.website_url || null,
    professional_role: record.professional_role || null,
    bio: record.bio || null,
    project_name: record.project_name || null,
    company_niche: record.company_niche || null,
    development_url: record.development_url || null,
    mvp_build_status: record.mvp_build_status || null,
    notion_plan_url: record.notion_plan_url || null,
    payment_status: record.payment_status || null,
    estimated_price: record.estimated_price ?? null,
    initial_contact_date: record.initial_contact_date || null,
    start_date: record.start_date || null,
    estimated_completion_date: record.estimated_completion_date || null,
    todos: parseTodos(record.todos),
    next_steps: record.next_steps || null,
    key_research: record.key_research || null,
    priority: record.priority || null,
    contact_name: record.contact_name || null,
    company_name: record.company_name || null,
    type: record.type || null,
    brief: record.brief || null,
    onboarding_progress: record.onboarding_progress ?? DEFAULT_PROGRESS,
  } as ClientData;
};

const fetchClient = async (clientId: string): Promise<ClientData | null> => {
  const { data, error } = await supabase
    .from('client_onboarding')
    .select('*')
    .eq('id', clientId)
    .maybeSingle();

  if (error) {
    console.warn('Falling back to sample client after Supabase error', error);
  }

  if (!data) {
    const sample = sampleClients.find((client) => client.id === clientId);
    return sample ?? null;
  }

  return mapDatabaseClientToClientData(data);
};

export function useClient(clientId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    clientId ? ['client', clientId] : null,
    () => fetchClient(clientId!)
  );

  return {
    client: data,
    error,
    isLoading,
    mutate,
  };
}
