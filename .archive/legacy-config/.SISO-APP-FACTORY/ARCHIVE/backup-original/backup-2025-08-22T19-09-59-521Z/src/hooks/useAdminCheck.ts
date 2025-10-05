
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkIsAdmin } from '@/utils/supabaseHelpers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminCheck = () => {
  const [isAuthStateReady, setIsAuthStateReady] = useState(false);
  const authStateSubscription = useRef<{ unsubscribe: () => void } | null>(null);
  const { toast } = useToast();

  // Setup auth state change listener
  useEffect(() => {
    // Get initial auth state
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthStateReady(!!data.session);
    });

    // Setup listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'Session exists:', !!session);
      setIsAuthStateReady(!!session);
    });

    authStateSubscription.current = subscription;

    return () => {
      if (authStateSubscription.current) {
        authStateSubscription.current.unsubscribe();
      }
    };
  }, []);

  // Create a memoized checkAdmin function that will be stable between renders
  const checkAdminStatus = useCallback(async () => {
    console.log('Executing admin check query function');
    try {
      const isAdmin = await checkIsAdmin();
      console.log('Admin check result:', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, []);

  // Only run the query when auth state is ready
  const { data: isAdmin, isLoading, refetch } = useQuery({
    queryKey: ['admin-check'],
    queryFn: checkAdminStatus,
    // Don't run until auth state is ready
    enabled: isAuthStateReady,
    // Cache the result for 2 minutes (shorter time to avoid stale data)
    staleTime: 2 * 60 * 1000,
    // Retry failed checks once
    retry: 1,
    // Handle errors using meta for latest @tanstack/react-query version
    meta: {
      errorHandler: (error: Error) => {
        console.error('Admin check query error:', error);
        toast({
          variant: "destructive",
          title: "Admin check failed",
          description: "There was a problem verifying your admin status."
        });
      }
    }
  });

  // Force refetch on specific events or conditions
  const forceRefresh = useCallback(() => {
    console.log('Force refreshing admin status');
    refetch();
  }, [refetch]);

  return { 
    isAdmin: !!isAdmin, 
    isLoading: !isAuthStateReady || isLoading,
    refreshAdminStatus: forceRefresh
  };
};
