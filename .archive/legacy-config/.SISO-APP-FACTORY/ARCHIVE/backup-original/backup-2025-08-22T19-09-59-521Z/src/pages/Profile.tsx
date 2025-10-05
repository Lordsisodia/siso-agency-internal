
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { PointsHistory } from '@/components/profile/PointsHistory';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { ProfileMetrics } from '@/components/profile/ProfileMetrics';
import { ProfileProgress } from '@/components/profile/ProfileProgress';
import { useProfileData } from '@/hooks/useProfileData';
import { SignOutButton } from '@/components/auth/SignOutButton';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    user,
    profile,
    loading,
    isEditing,
    formData,
    handleFormChange
  } = useProfileData();

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user || !profile) {
    return (
      <ProfileLayout>
        <div className="text-center text-siso-text">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p>Unable to load profile data. Please try again later.</p>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm border border-siso-text/10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-siso-text-bold">My Profile</h1>
            <SignOutButton />
          </div>
          <ProfileProgress profile={profile} user={user} />
        </div>

        {/* Profile Header with Banner & Avatar */}
        <div className="bg-black/20 rounded-xl overflow-hidden border border-siso-text/10">
          <ProfileHeader
            fullName={profile?.full_name}
            email={user?.email}
            points={profile?.points || 0}
            rank={profile?.rank || 'Bronze'}
            avatarUrl={profile?.avatar_url}
            bannerUrl={profile?.banner_url}
            user={user}
            onUpdateProfile={() => window.location.reload()}
            onLogout={async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                navigate('/');
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Error signing out",
                  description: error.message,
                });
              }
            }}
            onBackToHome={() => navigate('/')}
          />
        </div>

        {/* Grid Layout for Metrics, Info, and History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfileMetrics 
            userId={user.id}
            solanaWalletAddress={profile?.solana_wallet_address}
          />

          <div className="md:col-span-2">
            <ProfileInfo
              email={user?.email}
              fullName={profile?.full_name}
              points={profile?.points || 0}
              rank={profile?.rank || 'Bronze'}
              businessName={profile?.business_name}
              businessType={profile?.business_type}
              industry={profile?.industry}
              interests={profile?.interests}
              bio={profile?.bio}
              linkedinUrl={profile?.linkedin_url}
              websiteUrl={profile?.website_url}
              youtubeUrl={profile?.youtube_url}
              instagramUrl={profile?.instagram_url}
              twitterUrl={profile?.twitter_url}
              professionalRole={profile?.professional_role}
              isEditing={isEditing}
              formData={formData}
              onFormChange={handleFormChange}
            />
          </div>
          
          <div className="md:col-span-1">
            {user && <PointsHistory userId={user.id} />}
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
