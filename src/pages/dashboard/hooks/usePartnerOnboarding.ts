import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UsePartnerOnboardingReturn {
  isOnboardingComplete: boolean | null;
  isLoading: boolean;
  checkOnboardingStatus: () => Promise<void>;
  handleOnboardingComplete: (data: any) => Promise<void>;
  handleOnboardingSkip: () => void;
}

const usePartnerOnboarding = (): UsePartnerOnboardingReturn => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsOnboardingComplete(profile.onboarding_completed || false);
      } else {
        setIsOnboardingComplete(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOnboardingComplete = useCallback(async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          partner_type: data.partnerType || 'standard',
          business_focus: data.businessFocus || '',
          target_market: data.targetMarket || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating onboarding status:', error);
        toast.error('Failed to complete onboarding');
        return;
      }

      setIsOnboardingComplete(true);
      toast.success('Welcome! Your partner dashboard is ready.');
      
    } catch (error) {
      console.error('Error in onboarding completion:', error);
      toast.error('An unexpected error occurred');
    }
  }, []);

  const handleOnboardingSkip = useCallback(() => {
    setIsOnboardingComplete(true);
    toast.info('Onboarding skipped. You can complete it later in settings.');
  }, []);

  return {
    isOnboardingComplete,
    isLoading,
    checkOnboardingStatus,
    handleOnboardingComplete,
    handleOnboardingSkip
  };
};

export default usePartnerOnboarding;