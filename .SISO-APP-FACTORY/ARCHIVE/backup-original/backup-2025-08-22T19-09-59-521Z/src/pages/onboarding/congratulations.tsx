
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Congratulations() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to access this page",
        });
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-siso-bg to-black p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-siso-text/10 shadow-xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto bg-gradient-to-r from-siso-red to-siso-orange w-16 h-16 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="h-8 w-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-center text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-siso-red to-siso-orange">
              Congratulations!
            </span>
          </h1>
          
          <p className="text-siso-text text-center mb-8">
            Your onboarding is complete. You're all set to start using your new Agency Management Platform!
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/home')}
              className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/plan-builder')}
              className="w-full border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10"
            >
              Create Your First Plan
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
