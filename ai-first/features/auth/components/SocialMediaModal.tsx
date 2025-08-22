import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Linkedin, Globe, Youtube, Instagram } from 'lucide-react';

interface SocialMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void;
  userId: string;
}

export const SocialMediaModal = ({ isOpen, onClose, onSkip, userId }: SocialMediaModalProps) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getFilledLinksCount = () => {
    return [linkedinUrl, websiteUrl, youtubeUrl, instagramUrl]
      .filter(url => url.trim().length > 0).length;
  };

  const handleSubmit = async () => {
    try {
      if (!userId) {
        throw new Error('No user ID provided');
      }

      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          linkedin_url: linkedinUrl || null,
          website_url: websiteUrl || null,
          youtube_url: youtubeUrl || null,
          instagram_url: instagramUrl || null,
          has_completed_social_info: true,
          social_info_completed_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Profile updated successfully",
        description: "Thank you for providing your social media information!",
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-siso-bg border-siso-border">
        <DialogHeader>
          <div className="absolute -top-10 left-0 w-full flex justify-center text-siso-text/70">
            <span className="px-4 py-1 rounded-full bg-siso-bg-alt border border-siso-border text-sm">
              Step 2 of 3
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
            Enhance Your Profile
          </DialogTitle>
          <DialogDescription className="text-siso-text/70">
            Connect your social media accounts to unlock additional features and earn points. You can always update these later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative group">
            <div className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0A66C2] transition-colors group-hover:text-[#0A66C2]/80" />
              <Input
                placeholder="LinkedIn URL"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="bg-siso-bg-alt border-siso-border text-siso-text flex-1 transition-all focus:ring-1 focus:ring-siso-red/50"
              />
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-siso-red/10 to-siso-orange/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
          
          <div className="relative group">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500 transition-colors group-hover:text-emerald-400" />
              <Input
                placeholder="Website URL"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="bg-siso-bg-alt border-siso-border text-siso-text flex-1 transition-all focus:ring-1 focus:ring-siso-red/50"
              />
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-siso-red/10 to-siso-orange/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
          
          <div className="relative group">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-600 transition-colors group-hover:text-red-500" />
              <Input
                placeholder="YouTube URL"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="bg-siso-bg-alt border-siso-border text-siso-text flex-1 transition-all focus:ring-1 focus:ring-siso-red/50"
              />
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-siso-red/10 to-siso-orange/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
          
          <div className="relative group">
            <div className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500 transition-colors group-hover:text-pink-400" />
              <Input
                placeholder="Instagram URL"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="bg-siso-bg-alt border-siso-border text-siso-text flex-1 transition-all focus:ring-1 focus:ring-siso-red/50"
              />
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-siso-red/10 to-siso-orange/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-sm text-siso-text/70 mb-1">
              <span>Profile completion</span>
              <span>{Math.min(25 * getFilledLinksCount(), 100)}%</span>
            </div>
            <div className="h-2 bg-siso-bg-alt rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-siso-red to-siso-orange transition-all duration-500 ease-out"
                style={{ width: `${Math.min(25 * getFilledLinksCount(), 100)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-3">
          {onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-siso-text/70 hover:text-siso-text hover:bg-siso-bg-alt"
            >
              Skip for now
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-siso-border text-siso-text hover:bg-siso-bg-alt"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white"
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};