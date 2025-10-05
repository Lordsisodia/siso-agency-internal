
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// [Analysis] Lightweight hook for basic user data needed in shared components
export const useBasicUserData = () => {
  const [userData, setUserData] = useState<{
    id: string | null;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  }>({
    id: null,
    email: null,
    fullName: null,
    avatarUrl: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    let debounceTimeout: NodeJS.Timeout;

    const fetchBasicUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user || !isSubscribed) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (isSubscribed) {
          setUserData({
            id: session.user.id,
            email: session.user.email,
            fullName: profile?.full_name || null,
            avatarUrl: profile?.avatar_url || null,
          });
        }
      } catch (error) {
        console.error('[BasicUserData] Error fetching user data:', error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    // Debounce the fetch to prevent rapid successive calls
    debounceTimeout = setTimeout(fetchBasicUserData, 100);

    return () => {
      isSubscribed = false;
      clearTimeout(debounceTimeout);
    };
  }, []);

  return { userData, loading };
};
