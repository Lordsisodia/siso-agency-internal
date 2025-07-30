
import React from 'react';
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { CommunityMember } from '@/types/community';
import { LeaderboardEntry } from './types';
import { Badge } from '@/components/ui/badge';
import { SparklesIcon } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  loading: boolean;
}

const Leaderboard = ({ entries, loading }: LeaderboardProps) => {
  if (loading) {
    return <p>Loading leaderboard...</p>;
  }

  if (!entries || entries.length === 0) {
    return <p>No entries found.</p>;
  }

  const renderAsCommunityMember = (entry: LeaderboardEntry): CommunityMember => {
    return {
      id: entry.id,
      name: entry.profile?.full_name || "Anonymous User",
      description: entry.profile?.bio || "",
      member_type: "Contributor",
      youtube_url: entry.profile?.youtube_url || "",
      website_url: entry.profile?.website_url || "",
      profile_image_url: entry.profile?.avatar_url || "",
      platform: "AI Enthusiast",
      points: entry.points,
      rank: entry.rank?.toString() || "", // Convert rank to string explicitly 
      contribution_count: entry.contribution_count || 0,
      referral_count: entry.referral_count || 0,
      slug: entry.id
    };
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Points
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Streak
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contributions
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Referrals
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry, index) => {
            const communityMember: CommunityMember = renderAsCommunityMember(entry);

            return (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{communityMember.rank}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={communityMember.profile_image_url} alt={communityMember.name} />
                        <AvatarFallback>{communityMember.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{communityMember.name}</div>
                      <div className="text-sm text-gray-500">{communityMember.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{communityMember.points}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.level}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.streak_days}</div>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.contribution_count}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.referral_count}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
