
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';

/**
 * Hook to check if the current user is linked to a client
 */
export function useIsClient() {
  const { user, loading: userLoading } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkClientStatus = async () => {
      if (!user?.id) {
        setIsClient(false);
        setClientId(null);
        setLoading(false);
        return;
      }

      try {
        // Query the client_user_links table to check if this user is linked to a client
        const { data, error } = await supabase
          .from('client_user_links')
          .select('client_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking client status:', error);
          setIsClient(false);
          setLoading(false);
          return;
        }

        if (data?.client_id) {
          setIsClient(true);
          setClientId(data.client_id);
        } else {
          setIsClient(false);
          setClientId(null);
        }
      } catch (err) {
        console.error('Unexpected error checking client status:', err);
        setIsClient(false);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      checkClientStatus();
    }
  }, [user?.id, userLoading]);

  return {
    isClient,
    clientId,
    loading: loading || userLoading
  };
}
