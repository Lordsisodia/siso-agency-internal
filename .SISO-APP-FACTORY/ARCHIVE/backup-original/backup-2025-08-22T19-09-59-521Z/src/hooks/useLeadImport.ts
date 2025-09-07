
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImportMode } from './useBulkImport';

export interface ImportLead {
  username: string;
  full_name?: string | null;
  followers_count?: number | null;
  following_count?: number | null;
  posts_count?: number | null;
  bio?: string | null;
  profile_url?: string | null;
  status?: string;
}

interface ImportResults {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  updatedUsernames: string[];
}

interface ImportLeadsParams {
  leads: ImportLead[];
  mode: ImportMode;
}

export const useLeadImport = () => {
  const importLeads = useMutation({
    mutationFn: async ({ leads, mode }: ImportLeadsParams): Promise<ImportResults> => {
      const validLeads = leads.filter(lead => lead.username);
      
      if (validLeads.length === 0) {
        throw new Error('No valid leads to import');
      }

      const results: ImportResults = {
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: [],
        updatedUsernames: []
      };

      // First, check which usernames already exist
      const allUsernames = validLeads.map(lead => lead.username.toLowerCase());
      const { data: existingLeads } = await supabase
        .from('instagram_leads')
        .select('username')
        .in('username', allUsernames);
      
      const existingUsernameSet = new Set(existingLeads?.map(lead => lead.username.toLowerCase()) || []);

      // Filter leads based on import mode
      const leadsToProcess = validLeads.filter(lead => {
        const username = lead.username.toLowerCase();
        const exists = existingUsernameSet.has(username);

        if (exists) {
          if (mode === 'skip') {
            results.skipped++;
            return false;
          } else if (mode === 'fail') {
            results.errors.push(`Username "${lead.username}" already exists`);
            return false;
          }
          // For update and merge modes, we'll process the lead
          return true;
        }
        return true;
      });

      if (mode === 'fail' && results.errors.length > 0) {
        throw new Error('Duplicate usernames found');
      }

      if (leadsToProcess.length === 0) {
        return results;
      }

      const BATCH_SIZE = 50;
      for (let i = 0; i < leadsToProcess.length; i += BATCH_SIZE) {
        const batch = leadsToProcess.slice(i, i + BATCH_SIZE);
        const formattedBatch = batch.map(lead => ({
          ...lead,
          username: lead.username.toLowerCase(),
          status: lead.status || 'new',
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }));
        
        const { data, error } = await supabase
          .from('instagram_leads')
          .upsert(formattedBatch, {
            onConflict: 'username',
            ignoreDuplicates: mode === 'skip'
          })
          .select();

        if (error) {
          console.error('Batch import error:', error);
          results.errors.push(`Error importing batch: ${error.message}`);
          continue;
        }

        if (data) {
          data.forEach(record => {
            const username = record.username.toLowerCase();
            if (existingUsernameSet.has(username)) {
              results.updated++;
              results.updatedUsernames.push(username);
            } else {
              results.inserted++;
            }
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const message = [
        results.inserted > 0 ? `${results.inserted} leads added` : '',
        results.updated > 0 ? `${results.updated} leads updated` : '',
        results.skipped > 0 ? `${results.skipped} leads skipped` : ''
      ].filter(Boolean).join(', ');

      toast.success(`Import complete: ${message}`);
    },
    onError: (error: Error) => {
      toast.error(`Import failed: ${error.message}`);
      console.error('Lead import error:', error);
    }
  });

  return {
    importLeads,
    isImporting: importLeads.isPending
  };
};
