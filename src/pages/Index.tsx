
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { PageLoader } from '@/components/ui/PageLoader';

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminCheck();
  
  useEffect(() => {
    // Skip landing page - redirect directly based on auth status
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // If the user is an admin, redirect to the admin clients page  
          if (isAdmin) {
            navigate('/admin/clients', { replace: true });
          } else {
            navigate('/home', { replace: true });
          }
        } else {
          // Not logged in - redirect directly to login
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // On error, redirect to login
        navigate('/auth', { replace: true });
      }
    };
    
    if (!isLoading) {
      checkAuth();
    }
  }, [navigate, isAdmin, isLoading]);

  // Show loading while checking auth
  return <PageLoader />;
};

export default Index;
