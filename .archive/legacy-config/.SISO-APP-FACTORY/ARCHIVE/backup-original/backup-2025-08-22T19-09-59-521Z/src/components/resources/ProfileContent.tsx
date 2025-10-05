
import { useProfileData } from '@/hooks/useProfileData';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { User, Settings, Bell, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const {
    user,
    profile,
    loading,
    isEditing,
    formData,
    handleFormChange,
    setIsEditing
  } = useProfileData();

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          business_name: formData.businessName,
          business_type: formData.businessType,
          industry: formData.industry,
          bio: formData.bio,
          interests: formData.interests ? formData.interests.split(',').map(i => i.trim()) : [],
          linkedin_url: formData.linkedinUrl,
          website_url: formData.websiteUrl,
          youtube_url: formData.youtubeUrl,
          instagram_url: formData.instagramUrl,
          twitter_url: formData.twitterUrl,
          professional_role: formData.professionalRole,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: 'There was an error updating your profile',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-siso-orange"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and account settings</p>
      </div>

      <Tabs defaultValue="profile" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>User Profile</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Account Settings</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          {isEditing ? (
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}
          
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
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="bg-black/20 border-siso-text/10 backdrop-blur-sm p-6">
            <h3 className="text-lg font-medium mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="current-password" className="text-sm">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  className="bg-siso-bg border border-siso-border rounded-md px-3 py-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="new-password" className="text-sm">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  className="bg-siso-bg border border-siso-border rounded-md px-3 py-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="confirm-password" className="text-sm">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className="bg-siso-bg border border-siso-border rounded-md px-3 py-2"
                />
              </div>
              <Button>Update Password</Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card className="bg-black/20 border-siso-text/10 backdrop-blur-sm p-6">
            <h3 className="text-lg font-medium mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-siso-text/70">Receive emails about your account activity</p>
                </div>
                <div className="h-6 w-12 bg-siso-text/20 rounded-full cursor-pointer relative">
                  <div className="h-5 w-5 bg-siso-orange rounded-full absolute left-1 top-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-siso-text/70">Receive push notifications on your device</p>
                </div>
                <div className="h-6 w-12 bg-siso-text/20 rounded-full cursor-pointer relative">
                  <div className="h-5 w-5 bg-siso-text/60 rounded-full absolute right-1 top-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Communications</p>
                  <p className="text-sm text-siso-text/70">Receive updates about new features and offers</p>
                </div>
                <div className="h-6 w-12 bg-siso-text/20 rounded-full cursor-pointer relative">
                  <div className="h-5 w-5 bg-siso-orange rounded-full absolute left-1 top-0.5"></div>
                </div>
              </div>
              <Button>Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="bg-black/20 border-siso-text/10 backdrop-blur-sm p-6">
            <h3 className="text-lg font-medium mb-4">Notification History</h3>
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-3 border-b border-siso-text/10">
                  <div className="h-10 w-10 rounded-full bg-siso-orange/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-siso-orange" />
                  </div>
                  <div>
                    <p className="font-medium">Payment Successful</p>
                    <p className="text-sm text-siso-text/70">Your payment for invoice INV-00{i+1} has been processed successfully.</p>
                    <p className="text-xs text-siso-text/50 mt-1">
                      {new Date(Date.now() - i*86400000).toLocaleDateString()} at {new Date(Date.now() - i*86400000).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
