import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeaderboardContent } from '@/components/leaderboard/components/LeaderboardContent';
import { LeaderboardStats } from '@/components/leaderboard/LeaderboardStats';
import { useLeaderboardData } from '@/components/leaderboard/hooks/useLeaderboardData';
import { useUser } from '@/hooks/useUser';
import { Spotlight } from '@/components/ui/spotlight';
import { LeaderboardEntry } from '@/components/leaderboard/types';

export default function LeaderboardPage() {
  const { 
    entries, 
    stats, 
    trends,
    loading, 
    filter, 
    setFilter, 
    refreshLeaderboard 
  } = useLeaderboardData();
  
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter the entries based on search query and filters
  const filteredEntries = entries.filter(entry => {
    const nameMatch = entry.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || searchQuery === '';
  });

  // Handle user click - navigate to client app details
  const handleUserClick = (entry: LeaderboardEntry) => {
    if (entry.id) {
      navigate(`/client-app/${entry.id}`);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setFilter({
      ...filter,
      timeframe: period,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Calculate total stats from entries
  const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0);
  const totalUsers = entries.length;
  const totalSisoTokens = entries.reduce((sum, entry) => sum + (entry.siso_tokens || 0), 0);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Spotlight className="-top-40 left-0" />
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent mb-2">
                Community Leaderboard
              </h1>
              <p className="text-gray-300">
                Track community contributions, points earned, and rewards across the SISO platform. 
                <span className="text-white font-medium ml-1">Click on any user to view their app details!</span>
              </p>
            </div>
            
            <LeaderboardStats
              totalUsers={stats.totalParticipants}
              totalPoints={totalPoints}
              totalSisoTokens={totalSisoTokens}
            />
            
            <LeaderboardContent 
              filteredData={filteredEntries}
              onUserClick={handleUserClick}
              onSearchChange={handleSearchChange}
              onPeriodChange={handlePeriodChange}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
