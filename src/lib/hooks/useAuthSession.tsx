import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/integrations/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';
import { checkIsAdmin } from '@/services/shared/data.service';

export const useAuthSession = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🚀 MEMOIZED AUTH STATE - Prevents cascading re-renders
  const authState = useMemo(() => ({
    user, loading, isAdmin
  }), [user, loading, isAdmin]);
  // Track initialization vs auth events separately
  const isInitialized = useRef(false);
  const profileCache = useRef<any>(null);

  // Memoized profile check to prevent unnecessary API calls
  const checkProfile = useCallback(async (userId: string) => {
    if (profileCache.current) {
      return profileCache.current;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error checking profile:', error);
        return null;
      }
      
      if (profile) {
        profileCache.current = profile;
      }
      
      return profile;
    } catch (error) {
      console.error('Error in checkProfile:', error);
      return null;
    }
  }, []);

  // Initialize session state without triggering navigation
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Prevent multiple initializations
        if (isInitialized.current) return;
        
        // 🔇 SILENT AUTH - Only log errors, not every render
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Check admin status
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        
        isInitialized.current = true;
        setLoading(false);
      } catch (error) {
        console.error('Error initializing session:', error);
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Handle auth state changes separately from initialization
  useEffect(() => {
    if (!isInitialized.current) return;

    // 🎯 MEMOIZED AUTH LISTENER - Prevents duplicate subscriptions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only log significant auth events, not every change

      if (event === 'SIGNED_IN') {
        if (session?.user) {
          setUser(session.user);
          
          // Check admin status
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
          
          // Check if user has completed onboarding
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          // Check if user has any projects
          const { data: projects } = await supabase
            .from('projects')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);
          
          // Determine if user is new - they haven't completed onboarding or have no projects
          const isNewUser = !profile?.onboarding_completed || (projects && projects.length === 0);
          
          // Redirect admin users to the admin dashboard
          if (adminStatus) {
            toast({
              title: "Admin Access Detected",
              description: "Redirecting to admin dashboard."
            });
            navigate('/admin', { replace: true });
          } 
          // Redirect new users to onboarding
          else if (isNewUser) {
            toast({
              title: "Welcome to SISO!",
              description: "Let's get you set up with your first project."
            });
            navigate('/onboarding-chat', { replace: true });
          }
          // Redirect existing users to home
          else {
            toast({
              title: "Successfully signed in",
              description: "Welcome to SISO Resource Hub!",
            });
            navigate('/home', { replace: true });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        profileCache.current = null;
        navigate('/', { replace: true });
        toast({
          title: "Signed out",
          description: "Come back soon!",
        });
      } else if (event === 'TOKEN_REFRESHED') {
        // Just update the user without navigation
        if (session?.user) {
          setUser(session.user);
          // Re-check admin status
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // 🎯 EMPTY DEPS - Prevent re-render cascade from navigate/toast

  const handleSignOut = async () => {
    // 🔇 SILENT SIGN OUT - No console spam
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      profileCache.current = null;
      toast({
        title: "Signed out",
        description: "Come back soon!",
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
      });
    }
  };

  return {
    user,
    loading,
    isAdmin,
    handleSignOut,
  };
};
