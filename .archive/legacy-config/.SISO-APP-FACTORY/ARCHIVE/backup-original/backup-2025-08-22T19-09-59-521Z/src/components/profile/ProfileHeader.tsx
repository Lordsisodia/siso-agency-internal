
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Edit } from 'lucide-react';

interface ProfileHeaderProps {
  fullName?: string | null;
  email?: string | null;
  points: number;
  rank: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  user: User | null;
  onUpdateProfile: () => void;
  onLogout: () => void;
  onBackToHome: () => void;
}

export const ProfileHeader = ({
  fullName,
  email,
  points,
  rank,
  avatarUrl,
  bannerUrl,
  user,
  onUpdateProfile,
  onBackToHome
}: ProfileHeaderProps) => {
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="h-48 w-full overflow-hidden relative">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-siso-orange/20 to-siso-red/20" />
        )}
      </div>

      {/* Avatar and Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 relative">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-black/20 overflow-hidden bg-black/40">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-siso-orange/20 to-siso-red/20" />
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-siso-text-bold truncate">
              {fullName || email?.split('@')[0]}
            </h2>
            <p className="text-sm text-siso-text/70">{email}</p>
          </div>

          {/* Stats & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-4 sm:mt-0">
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-siso-orange/10 text-siso-orange border-none">
                {points} Points
              </Badge>
              <Badge variant="outline" className="bg-siso-orange/10 text-siso-orange border-none">
                {rank}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-siso-text hover:text-siso-text-bold"
                onClick={onBackToHome}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-siso-text hover:text-siso-text-bold"
                onClick={onUpdateProfile}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
