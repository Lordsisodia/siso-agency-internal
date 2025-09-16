import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InstagramLead {
  id: string;
  username: string;
  followers_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  full_name: string | null;
  status: string | null;
  created_at: string;
  profile_url: string | null;
  bio: string | null;
  last_updated: string | null;
  outreach_account?: string | null;
  followed?: boolean;
  commented?: boolean;
  messaged?: boolean;
  app_plan_status?: string | null;
  app_plan_url?: string | null;
  last_interaction_at?: string | null;
  assigned_to?: string | null;
  notes?: string | null;
}

interface AddLeadPayload {
  username: string;
}

interface UpdateLeadPayload {
  id: string;
  data: Partial<InstagramLead>;
}

export const useInstagramLeads = (limit: number = 10) => {
  const queryClient = useQueryClient();
  
  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['instagram-leads', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as InstagramLead[];
    },
  });

  const addLead = useMutation({
    mutationFn: async (payload: AddLeadPayload) => {
      const { data, error } = await supabase
        .from('instagram_leads')
        .insert([{ username: payload.username, status: 'new' }])
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate the query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['instagram-leads'] });
    },
  });
  
  const updateLead = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InstagramLead> }) => {
      const { data: updated, error } = await supabase
        .from('instagram_leads')
        .update(data)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-leads'] });
    },
  });

  return { 
    leads, 
    isLoading, 
    error, 
    refetch, 
    addLead, 
    updateLead 
  };
};
