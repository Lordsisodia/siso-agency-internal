import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks/use-toast';

// Admin credentials - for internal staff use only
const ADMIN_CREDENTIALS = {
  email: "admin@sisoagency.com",
  password: "SisoAdmin2024!"
};

export const AdminAutoLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const performAdminLogin = async () => {
      try {
        console.log('AdminAutoLogin - Attempting auto login...');
        
        // Check if already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('AdminAutoLogin - Already logged in, redirecting to admin...');
          navigate('/admin/clients', { replace: true });
          return;
        }

        // Perform admin login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password,
        });

        if (error) {
          console.error('AdminAutoLogin - Login error:', error);
          throw error;
        }

        console.log('AdminAutoLogin - Login successful, redirecting...');
        
        toast({
          title: "Admin Access Granted",
          description: "Welcome to SISO Admin Dashboard",
        });

        // Redirect to admin dashboard
        navigate('/admin/clients', { replace: true });

      } catch (error: any) {
        console.error('AdminAutoLogin - Error:', error);
        
        toast({
          variant: "destructive",
          title: "Admin Login Failed",
          description: "Please contact IT support or use manual login",
        });
        
        // Fallback to regular auth page
        navigate('/auth', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    performAdminLogin();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-siso-bg to-black/95">
        <div className="text-center space-y-6">
          <img
            src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png"
            alt="SISO Agency"
            className="h-20 w-20 mx-auto rounded-xl border border-siso-orange/60 shadow-lg bg-black/40"
          />
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-siso-orange mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-siso-text mb-2">Admin Login</h2>
            <p className="text-siso-text-muted">Authenticating admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};