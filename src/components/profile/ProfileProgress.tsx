
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User } from '@supabase/supabase-js';

interface ProfileProgressProps {
  profile: any;
  user: User | null;
}

export const ProfileProgress = ({ profile, user }: ProfileProgressProps) => {
  const calculateCompletion = () => {
    if (!profile || !user) return 0;
    
    const fields = [
      profile.full_name,
      profile.bio,
      profile.professional_role,
      profile.business_name,
      profile.linkedin_url,
      profile.website_url,
      profile.avatar_url
    ];
    
    const filledFields = fields.filter(field => !!field).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = calculateCompletion();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-siso-text/70">Profile Completion</span>
        <Badge variant="outline" className="bg-siso-orange/10 text-siso-orange border-none">
          {completion}%
        </Badge>
      </div>
      <Progress value={completion} className="h-2" />
      {completion < 100 && (
        <p className="text-xs text-siso-text/60">
          Complete your profile to unlock all features
        </p>
      )}
    </div>
  );
};
