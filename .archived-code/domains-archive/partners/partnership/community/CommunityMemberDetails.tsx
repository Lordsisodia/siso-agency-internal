import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ExternalLink, Users, X, Youtube, Crown, Lock, Globe, Linkedin, Instagram, Twitter } from "lucide-react";
import { CommunityMember } from "./types";

interface CommunityMemberDetailsProps {
  member: CommunityMember | null;
  onClose: () => void;
}

export const CommunityMemberDetails = ({ member, onClose }: CommunityMemberDetailsProps) => {
  if (!member) return null;

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.includes('watch?v=') 
      ? url.split('watch?v=')[1].split('&')[0]
      : url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Sheet open={!!member} onOpenChange={onClose}>
      <SheetContent className="bg-siso-bg border-l border-siso-text/10 w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {member.profile_image_url ? (
                <img 
                  src={member.profile_image_url} 
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-siso-orange/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-siso-red/20 to-siso-orange/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-siso-orange" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-2xl font-bold text-siso-text-bold">
                    {member.name}
                  </SheetTitle>
                  {member.rank === "Diamond" && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-siso-text/80">
                  <span className="capitalize">{member.member_type || 'Member'}</span>
                  {member.platform && (
                    <>
                      <span>•</span>
                      <span>{member.platform}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Stats */}
          {(member.points !== undefined || member.contribution_count !== undefined || member.referral_count !== undefined) && (
            <div className="grid grid-cols-3 gap-4">
              {member.points !== undefined && (
                <div className="bg-siso-text/5 rounded-lg p-4 text-center">
                  <div className="text-xl font-bold text-siso-text-bold">
                    {member.points}
                  </div>
                  <div className="text-sm text-siso-text/80">Points</div>
                </div>
              )}
              {member.contribution_count !== undefined && (
                <div className="bg-siso-text/5 rounded-lg p-4 text-center">
                  <div className="text-xl font-bold text-siso-text-bold">
                    {member.contribution_count}
                  </div>
                  <div className="text-sm text-siso-text/80">Contributions</div>
                </div>
              )}
              {member.referral_count !== undefined && (
                <div className="bg-siso-text/5 rounded-lg p-4 text-center">
                  <div className="text-xl font-bold text-siso-text-bold">
                    {member.referral_count}
                  </div>
                  <div className="text-sm text-siso-text/80">Referrals</div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {member.description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-siso-text-bold">About</h3>
              <div className="text-siso-text space-y-4 whitespace-pre-line">
                {member.description}
              </div>
            </div>
          )}

          {/* Links */}
          {(member.website_url || member.youtube_url || member.join_url) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-siso-text-bold flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-siso-orange" />
                Links
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {member.website_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-siso-text/20 hover:bg-siso-text/5"
                    onClick={() => window.open(member.website_url!, '_blank')}
                  >
                    <Globe className="h-4 w-4 text-green-500" />
                    Website
                  </Button>
                )}
                {member.youtube_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-siso-text/20 hover:bg-siso-text/5"
                    onClick={() => window.open(member.youtube_url!, '_blank')}
                  >
                    <Youtube className="h-4 w-4 text-red-500" />
                    YouTube Channel
                  </Button>
                )}
                {member.join_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-siso-text/20 hover:bg-siso-text/5"
                    onClick={() => window.open(member.join_url!, '_blank')}
                  >
                    <Users className="h-4 w-4 text-blue-500" />
                    Join Community
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-siso-text/10 text-sm text-siso-text/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Type:</span>
              <span className="text-siso-text capitalize">{member.member_type || 'Community'}</span>
            </div>
            {member.member_count && (
              <span>{formatMemberCount(member.member_count)} members</span>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};