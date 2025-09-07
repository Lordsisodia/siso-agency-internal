
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/core/data.service';
import { PageLoader } from '@/shared/ui/PageLoader';

const Index = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Skip landing page - redirect directly based on auth status
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Check admin status directly to avoid hook dependency issues
          const isAdmin = await checkIsAdmin();
          
          // If the user is an admin, redirect to preferred page (default: Life Lock today's page)  
          if (isAdmin) {
            // Check if user has a preferred admin page stored
            const preferredAdminPage = localStorage.getItem('preferredAdminPage') || '/admin/life-lock/day';
            navigate(preferredAdminPage, { replace: true });
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
      } finally {
        setAuthChecked(true);
      }
    };

    // Add a timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!authChecked) {
        console.warn('Auth check taking too long, redirecting to auth');
        navigate('/auth', { replace: true });
      }
    }, 5000);
    
    checkAuth();
    
    return () => clearTimeout(timeout);
  }, [navigate]);

  // Show loading while checking auth
  return <PageLoader />;
};

export default Index;
