
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OutreachCampaign } from '@/types/outreach';
import { toast } from 'sonner';

export const useOutreachCampaigns = () => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['outreach-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outreach_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OutreachCampaign[];
    },
  });

  const addCampaign = useMutation({
    mutationFn: async (newCampaign: Omit<OutreachCampaign, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('outreach_campaigns')
        .insert([newCampaign])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-campaigns'] });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create campaign');
      console.error('Error creating campaign:', error);
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...data }: Partial<OutreachCampaign> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('outreach_campaigns')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-campaigns'] });
      toast.success('Campaign updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update campaign');
      console.error('Error updating campaign:', error);
    },
  });

  return {
    campaigns,
    isLoading,
    addCampaign,
    updateCampaign,
  };
};
