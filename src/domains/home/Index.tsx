
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/integrations/supabase/client';
import { checkIsAdmin } from '@/services/shared/data.service';
import { PageLoader } from '@/components/ui/PageLoader';

const Index = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const isAdmin = await checkIsAdmin(session.user.id);
          if (isAdmin) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/admin/life-lock-overview', { replace: true });
          }
        } else {
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth', { replace: true });
      } finally {
        setAuthChecked(true);
      }
    };

    const timeout = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeout);
  }, [navigate]);

  // Show loading while checking auth
  return <PageLoader />;
};

export default Index;
