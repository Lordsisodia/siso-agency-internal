
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// [Analysis] Custom hook that provides the current authenticated user data
// [Q] Should we add more user-related functionality here?
export const useUser = () => {
  const [user, setUser] = useState<{
    id: string | null;
    email: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // [Framework] Setup auth state tracking with cleanup on unmount
    const getUser = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
