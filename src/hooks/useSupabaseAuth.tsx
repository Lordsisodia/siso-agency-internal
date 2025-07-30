import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { signOut } from '@/utils/authUtils';

export const useSupabaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Initiating email sign in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Email sign in error:', error);
        throw error;
      }

      // Check profile and redirect
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Handle profile data safely
        const hasCompletedOnboarding = profile && profile.onboarding_completed === true;
        
        // Check if user has any projects
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1);
        
        // Determine if user is new - hasn't completed onboarding or has no projects
        const isNewUser = !hasCompletedOnboarding || (projects && projects.length === 0);

        if (isNewUser) {
          toast({
            title: "Welcome to SISO!",
            description: "Let's get you set up with your first project."
          });
          navigate('/onboarding-chat');
        } else {
          toast({
            title: "Successfully signed in",
            description: "Welcome back to SISO!"
          });
          navigate('/profile');
        }
      }

      return data;

    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "There was a problem signing in",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      console.log('Initiating sign out...');
      
      const { error } = await signOut();
      if (error) throw error;
      
      navigate('/');
      toast({
        title: "Signed out",
        description: "Come back soon!",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "There was a problem signing out",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleEmailSignIn,
    handleSignOut
  };
};
