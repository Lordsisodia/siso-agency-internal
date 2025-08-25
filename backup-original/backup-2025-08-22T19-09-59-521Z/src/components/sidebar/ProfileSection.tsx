import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePoints } from '@/hooks/usePoints';
import { useBasicUserData } from '@/hooks/useBasicUserData';

interface ProfileSectionProps {
  collapsed: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ProfileSection = ({ collapsed, onOpenChange }: ProfileSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData, loading } = useBasicUserData();
  const { points, rank } = usePoints(userData.id || '');

  // [Analysis] Handle navigation with proper state updates
  const handleItemClick = (path: string) => {
    // Save current location for back navigation
    const currentPath = window.location.pathname;
    
    navigate(path, {
      state: { from: currentPath }
    });
    
    // Close dropdown after navigation
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/', { replace: true });
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-12 animate-pulse bg-siso-text/5 rounded-lg" />
    );
  }

  if (!userData.id) return null;

  const displayName = userData.fullName || userData.email?.split('@')[0] || 'User';

  // [Analysis] For collapsed state, use direct navigation instead of dropdown
  if (collapsed) {
    return (
      <div className="px-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full aspect-square p-0 hover:bg-siso-text/5 transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleItemClick('/profile');
          }}
        >
          {userData.avatarUrl ? (
            <img
              src={supabase.storage.from('avatars').getPublicUrl(userData.avatarUrl).data.publicUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-siso-red/20 to-siso-orange/20 flex items-center justify-center">
              <span className="text-sm font-medium text-siso-text">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-2 relative">
      <DropdownMenu 
        onOpenChange={onOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full px-2 py-4 hover:bg-siso-text/5 transition-colors duration-200"
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-center gap-3 w-full">
              {userData.avatarUrl ? (
                <img
                  src={supabase.storage.from('avatars').getPublicUrl(userData.avatarUrl).data.publicUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-siso-red/20 to-siso-orange/20 flex items-center justify-center">
                  <span className="text-lg font-medium text-siso-text">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 text-left">
                <div className="font-medium text-siso-text-bold truncate">
                  {displayName}
                </div>
                <div className="flex items-center gap-2 text-sm text-siso-text/90">
                  <Trophy className="w-3 h-3 text-siso-orange" />
                  <span>{points}</span>
                  <Star className="w-3 h-3 text-siso-orange ml-1" />
                  <span>{rank}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-siso-text/70" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right"
          className="w-56 bg-siso-bg-alt border-siso-border z-[100]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DropdownMenuItem
            className="text-siso-text hover:text-siso-text-bold hover:bg-siso-text/5 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              handleItemClick('/profile');
            }}
          >
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-siso-text hover:text-siso-text-bold hover:bg-siso-text/5 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              handleItemClick('/economy/leaderboards');
            }}
          >
            Leaderboard
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-siso-text hover:text-siso-text-bold hover:bg-siso-text/5 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              handleItemClick('/how-to-earn');
            }}
          >
            How to Earn Points
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-siso-border" />
          <DropdownMenuItem
            className="text-red-500 hover:text-red-400 hover:bg-red-500/5 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              handleSignOut();
            }}
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
