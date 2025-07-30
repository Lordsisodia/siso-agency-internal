
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { CommunitySearch } from '@/components/community/CommunitySearch';
import { CommunityMemberCard } from '@/components/community/CommunityMemberCard';
import { CommunityMemberDetails } from '@/components/community/CommunityMemberDetails';
import { CommunityMember } from '@/types/community';

export default function Community() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);

  // Use mock data instead of querying database
  const { data: members, isLoading, error } = useQuery({
    queryKey: ['community-members'],
    queryFn: async () => {
      console.log('Fetching mock community members...');
      
      // Return mock data
      const mockData: CommunityMember[] = [
        {
          id: '1',
          name: 'Jane Smith',
          description: 'AI researcher and developer',
          member_type: 'Community Member',
          youtube_url: 'https://youtube.com/@janesmith',
          youtube_videos: [
            { title: 'Introduction to AI', url: 'https://youtube.com/watch?v=123', thumbnailUrl: '' }
          ],
          website_url: 'https://janesmith.com',
          specialization: ['Machine Learning', 'NLP'],
          content_themes: ['Education', 'Research'],
          profile_image_url: '',
          platform: 'YouTube',
          member_count: null,
          join_url: null,
          points: 250,
          rank: 'Expert',
          contribution_count: 12,
          referral_count: 3,
          slug: 'jane-smith'
        },
        {
          id: '2',
          name: 'AI Enthusiasts Group',
          description: 'Community for AI enthusiasts',
          member_type: 'Community',
          website_url: 'https://ai-enthusiasts.com',
          profile_image_url: '',
          platform: 'Discord',
          member_count: 1200,
          join_url: 'https://discord.gg/ai-enthusiasts',
          points: 0,
          contribution_count: 0,
          referral_count: 0,
          slug: 'ai-enthusiasts'
        }
      ];
      
      return mockData;
    },
  });

  const filteredMembers = members?.filter(member => 
    !searchQuery || 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    console.error('Error in component:', error);
    return <div className="text-red-500">Error loading community members. Please try again later.</div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-siso-bg to-siso-bg/95">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-siso-red to-siso-orange text-transparent bg-clip-text">
                The AI Community
              </h1>
              <CommunitySearch 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-siso-text">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMembers?.map((member) => (
                <CommunityMemberCard
                  key={member.id}
                  member={member}
                  onClick={setSelectedMember}
                />
              ))}
            </div>
          )}

          <CommunityMemberDetails
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        </div>
      </div>
    </div>
  );
}
