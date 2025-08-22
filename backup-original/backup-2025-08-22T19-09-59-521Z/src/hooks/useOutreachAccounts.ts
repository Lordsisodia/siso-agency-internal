
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OutreachAccount } from '@/types/outreach';
import { toast } from 'sonner';

export const useOutreachAccounts = () => {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['outreach-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outreach_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OutreachAccount[];
    },
  });

  const addAccount = useMutation({
    mutationFn: async (newAccount: Omit<OutreachAccount, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('outreach_accounts')
        .insert([newAccount])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-accounts'] });
      toast.success('Account added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add account');
      console.error('Error adding account:', error);
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...data }: Partial<OutreachAccount> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('outreach_accounts')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-accounts'] });
      toast.success('Account updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update account');
      console.error('Error updating account:', error);
    },
  });

  return {
    accounts,
    isLoading,
    addAccount,
    updateAccount,
  };
};
