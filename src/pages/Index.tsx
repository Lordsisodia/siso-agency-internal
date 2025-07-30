
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '@/components/landing/LandingPage';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminCheck();
  
  useEffect(() => {
    // Check if the user is already logged in and redirect accordingly
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
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    
    if (!isLoading) {
      checkAuth();
    }
  }, [navigate, isAdmin, isLoading]);

  return <LandingPage />;
};

export default Index;
