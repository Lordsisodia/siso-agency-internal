import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { ClientData, OnboardingProgress } from '@/types/client.types';
import { sampleClients } from '@/data/sampleClients';

const DEFAULT_PROGRESS: OnboardingProgress = {
  initial_contact: false,
  talked_to: false,
  proposal_created: false,
  quote_given: false,
  mvp_created: false,
  deposit_collected: false,
  project_live: false,
};

const fetchClient = async (clientId: string): Promise<ClientData | null> => {
  const { data, error } = await supabase
    .from('clients')
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

  return {
    ...data,
    status: data.status ?? 'potential',
    onboarding_progress: data.onboarding_progress ?? DEFAULT_PROGRESS,
  } as ClientData;
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
