
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePlanViewTracking = (planId: string) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        await supabase
          .from('plan_views')
          .insert({
            plan_id: planId,
            viewer_ip: 'anonymous', // For privacy, we're not storing actual IPs
            user_agent: navigator.userAgent
          });
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [planId]);
};
