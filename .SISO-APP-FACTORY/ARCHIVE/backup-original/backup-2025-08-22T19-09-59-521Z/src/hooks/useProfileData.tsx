
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { safeGet } from '@/utils/typeHelpers';

// Enhanced profile form data interface with all possible fields
export interface ProfileFormData {
  fullName: string;
  businessName: string;
  businessType: string;
  industry: string;
  interests: string;
  bio: string;
  linkedinUrl: string;
  websiteUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  professionalRole: string;
}

export const useProfileData = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    businessName: '',
    businessType: '',
    industry: '',
    interests: '',
    bio: '',
    linkedinUrl: '',
    websiteUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    professionalRole: '',
  });

  useEffect(() => {
    let isSubscribed = true;

    const getProfile = async () => {
      try {
        // [Analysis] Only fetch profile if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Profile] Session error:', sessionError);
          return;
        }
        
        if (session?.user && isSubscribed) {
          console.log('[Profile] Session found:', session.user.id);
          setUser(session.user);

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('[Profile] Profile fetch error:', profileError);
            return;
          }

          if (profileData && isSubscribed) {
            console.log('[Profile] Profile data found:', profileData);
            setProfile(profileData);
            
            // Use safe property access for fields that might not exist in the DB schema
            setFormData({
              fullName: safeGet(profileData, 'full_name', ''),
              businessName: safeGet(profileData, 'business_name', ''),
              businessType: safeGet(profileData, 'business_type', ''),
              industry: safeGet(profileData, 'industry', ''),
              interests: Array.isArray(safeGet(profileData, 'interests', [])) 
                ? safeGet(profileData, 'interests', []).join(', ') 
                : '',
              bio: safeGet(profileData, 'bio', ''),
              linkedinUrl: safeGet(profileData, 'linkedin_url', ''),
              websiteUrl: safeGet(profileData, 'website_url', ''),
              youtubeUrl: safeGet(profileData, 'youtube_url', ''),
              instagramUrl: safeGet(profileData, 'instagram_url', ''),
              twitterUrl: safeGet(profileData, 'twitter_url', ''),
              professionalRole: safeGet(profileData, 'professional_role', ''),
            });
          }
        }
      } catch (error: any) {
        console.error('[Profile] Error in getProfile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    getProfile();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    user,
    profile,
    loading,
    isEditing,
    formData,
    handleFormChange,
    setIsEditing
  };
};
