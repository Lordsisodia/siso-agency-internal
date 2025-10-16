import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/shared/hooks/useAuthSession';

export interface ClientData {
  id: string;
  company_name: string | null;
  project_name: string | null;
  contact_name: string | null;
  email: string | null;
  website_url: string | null;
  company_niche: string | null;
  status: string;
  current_step: number | null;
  total_steps: number | null;
  todos: any | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Hook to fetch client data for the authenticated user
 * Returns client information if user is linked to a client record
 */
export const useClientData = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: ['clientData', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // First, check if user is directly linked to a client via client_user_links
      const { data: userLink, error: linkError } = await supabase
        .from('client_user_links')
        .select('client_id')
        .eq('user_id', user.id)
        .single();

      // Silently return null if table doesn't exist (internal app doesn't have client tables)
      if (linkError && linkError.code === '42P01') { // Table doesn't exist
        return null;
      }

      if (linkError && linkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        // Silently fail for other errors
        return null;
      }

      let clientId = userLink?.client_id;

      // If no direct link, check client_onboarding table for user_id match
      if (!clientId) {
        const { data: clientRecord, error: clientError } = await supabase
          .from('client_onboarding')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Silently return null if table doesn't exist
        if (clientError && clientError.code === '42P01') {
          return null;
        }

        if (clientError && clientError.code !== 'PGRST116') {
          // Silently fail
          return null;
        }

        clientId = clientRecord?.id;
      }

      // If still no client found, return null (user is not a client)
      if (!clientId) {
        return null;
      }

      // Fetch full client data
      const { data: clientData, error: dataError } = await supabase
        .from('client_onboarding')
        .select('*')
        .eq('id', clientId)
        .single();

      if (dataError) {
        // Silently return null instead of throwing
        return null;
      }

      return clientData as ClientData;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Hook to determine if the current user is a client
 */
export const useIsClient = () => {
  const { data: clientData, isLoading, error } = useClientData();
  
  return {
    isClient: !!clientData,
    clientData,
    loading: isLoading,
    error
  };
}; 