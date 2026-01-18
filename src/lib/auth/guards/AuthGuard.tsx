
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/services/integrations/supabase/client';
import { checkIsAdmin } from '@/services/shared/data.service';
import { useToast } from '@/lib/hooks/ui/useToast';

interface AuthGuardProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const AuthGuard = ({ children, adminOnly = false }: AuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthGuard - Session error:', sessionError);
          navigate('/auth', { replace: true });
          return;
        }
        
        if (!session) {
          
          navigate('/auth', { replace: true });
          return;
        } 
        
        
        setIsAuthenticated(true);
        
        // Always check admin status for all authenticated users
        try {
          const adminStatus = await checkIsAdmin();
          
          
          setIsAdmin(adminStatus);
          
          // Auto-redirect admin users to admin dashboard if they're on the home page
          if (adminStatus && location.pathname === '/home') {
            
            toast({
              title: "Admin Access",
              description: "Redirecting to admin dashboard."
            });
            navigate('/admin', { replace: true });
            return;
          }
          
          // If this is an admin-only route and user is not an admin, redirect
          if (adminOnly && !adminStatus) {
            
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "You don't have admin privileges to access this page."
            });
            navigate('/home', { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error in admin check:', error);
          if (adminOnly) {
            toast({
              variant: "destructive",
              title: "Access Check Failed",
              description: "There was a problem verifying your access permissions."
            });
            navigate('/home', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth', { replace: true });
      } else if (event === 'SIGNED_IN') {
        // Re-check admin status when user signs in
        checkIsAdmin().then(status => {
          setIsAdmin(status);
          // Auto-redirect if admin and on home page
          if (status && location.pathname === '/home') {
            navigate('/admin', { replace: true });
          } else if (adminOnly && !status) {
            navigate('/home', { replace: true });
          }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, adminOnly, toast, location.pathname]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-siso-orange"></div>
    </div>;
  }

  if (adminOnly && !isAdmin) {
    return null; // Will be redirected by the useEffect
  }

  return <>{children}</>;
};
