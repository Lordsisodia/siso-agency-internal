import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PartnerAuthGuardProps {
  children: React.ReactNode;
}

export const PartnerAuthGuard = ({ children }: PartnerAuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkPartnerAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login without using navigate to avoid loops
          window.location.href = '/auth/login';
          return;
        }
        
      } catch (error) {
        console.error('Partner auth check error:', error);
        if (isMounted) {
          window.location.href = '/auth/login';
          return;
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkPartnerAuth();

    // Simple auth state listener without complex logic
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = '/auth/login';
      } else if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by the useEffect
  }

  return <>{children}</>;
}; 