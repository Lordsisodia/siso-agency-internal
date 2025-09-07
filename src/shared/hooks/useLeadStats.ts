
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadStats {
  total: number;
  engaged: number;
  outreached: number;
  plansViewed: number;
  converted: number;
}

export const useLeadStats = () => {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: async (): Promise<LeadStats> => {
      const { data: allLeads, error: leadsError } = await supabase
        .from('instagram_leads')
        .select('*');

      if (leadsError) throw leadsError;

      const engagedLeads = allLeads.filter(lead => 
        lead.followed || lead.commented || lead.messaged
      );

      const outreachedLeads = allLeads.filter(lead => 
        lead.status === 'contacted'
      );

      const plansViewedLeads = allLeads.filter(lead => 
        lead.app_plan_status !== null
      );

      const convertedLeads = allLeads.filter(lead => 
        lead.status === 'converted'
      );

      return {
        total: allLeads.length,
        engaged: engagedLeads.length,
        outreached: outreachedLeads.length,
        plansViewed: plansViewedLeads.length,
        converted: convertedLeads.length
      };
    }
  });
};
