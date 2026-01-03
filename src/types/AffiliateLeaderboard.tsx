import React from 'react';
import { motion } from 'framer-motion';
import { PartnershipLayout } from '@/components/partnership/PartnershipLayout';
import { LeaderboardTemplate, LeaderboardEntry } from '@/components/ui/leaderboard-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardGreetingCard } from '@/components/ui/dashboard-templates';
import { 
  Trophy, 
  Star,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AffiliateLeaderboard = () => {
  const navigate = useNavigate();
  
  // Convert partner data to leaderboard format
  const leaderboardEntries: LeaderboardEntry[] = [
    {
      id: 'partner-1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      points: 2450,
      rank: 'Gold Partner',
      spending: 12450,
      contributions: 24,
      referrals: 24,
      tokens: 15000,
      lastActive: '2024-01-15T10:30:00Z',
      trend: { direction: 'up', value: 18 },
      achievements: ['Top Performer', 'Gold Tier'],
      tier: 'gold',
      bio: 'Leading partner'
    },
    {
      id: 'partner-2', 
      name: 'Mike Chen',
      email: 'mike@example.com',
      points: 1890,
      rank: 'Silver Partner',
      spending: 9890,
      contributions: 18,
      referrals: 18,
      tokens: 12000,
      lastActive: '2024-01-14T15:20:00Z',
      trend: { direction: 'up', value: 12 },
      achievements: ['Consistent Growth'],
      tier: 'silver',
      bio: 'Growth focused'
    },
    {
      id: 'partner-3',
      name: 'Emma Davis', 
      email: 'emma@example.com',
      points: 1650,
      rank: 'Silver Partner',
      spending: 8750,
      contributions: 15,
      referrals: 15,
      tokens: 10500,
      lastActive: '2024-01-13T09:15:00Z',
      trend: { direction: 'up', value: 8 },
      achievements: ['Quality Referrals'],
      tier: 'silver',
      bio: 'Quality partner'
    },
    {
      id: 'partner-4',
      name: 'James Wilson',
      email: 'james@example.com', 
      points: 1200,
      rank: 'Bronze Partner',
      spending: 6200,
      contributions: 12,
      referrals: 12,
      tokens: 8000,
      lastActive: '2024-01-12T14:45:00Z',
      trend: { direction: 'up', value: 5 },
      achievements: ['Steady Growth'],
      tier: 'bronze',
      bio: 'Reliable partner'
    },
    {
      id: 'partner-5',
      name: 'Lisa Brown',
      email: 'lisa@example.com',
      points: 1050,
      rank: 'Bronze Partner', 
      spending: 5100,
      contributions: 10,
      referrals: 10,
      tokens: 6500,
      lastActive: '2024-01-11T11:30:00Z',
      trend: { direction: 'up', value: 15 },
      achievements: ['Rising Star'],
      tier: 'bronze',
      bio: 'Fast growing'
    },
    {
      id: 'partner-6',
      name: 'David Miller',
      email: 'david@example.com',
      points: 890,
      rank: 'Bronze Partner',
      spending: 4200,
      contributions: 8,
      referrals: 8,
      tokens: 5000,
      lastActive: '2024-01-10T16:20:00Z',
      trend: { direction: 'down', value: 2 },
      achievements: ['New Partner'],
      tier: 'bronze',
      bio: 'Getting started'
    },
    {
      id: 'partner-7',
      name: 'Current User (You)',
      email: 'you@example.com',
      points: 750,
      rank: 'Bronze Partner',
      spending: 3450,
      contributions: 7,
      referrals: 7,
      tokens: 4200,
      lastActive: '2024-01-16T08:00:00Z',
      trend: { direction: 'up', value: 22 },
      achievements: ['Monthly Growth'],
      tier: 'bronze',
      bio: 'Your progress'
    },
    {
      id: 'partner-8',
      name: 'Anna Thompson',
      email: 'anna@example.com',
      points: 650,
      rank: 'Bronze Partner',
      spending: 2800,
      contributions: 5,
      referrals: 5,
      tokens: 3500,
      lastActive: '2024-01-09T13:45:00Z',
      trend: { direction: 'down', value: 1 },
      achievements: ['First Steps'],
      tier: 'bronze'
    }
  ];

  const handlePartnerClick = (partner: LeaderboardEntry) => {
    // Navigate to partner details or profile
    navigate(`/partner/profile/${partner.id}`);
  };

  return (
    <PartnershipLayout>
      <div className="space-y-6">
      
        {/* Smart Dashboard Greeting Card - New Header */}
        <DashboardGreetingCard 
          pageTitle="Partner Leaderboard"
          pageSubtitle="See how you stack up against other partners"
          showDate={true}
          pageContext={{
            pageType: 'leaderboard',
            keyMetrics: {
              primary: { value: '#18', label: 'Current Rank', trend: 'Up 5 positions' },
              secondary: { value: '£3,247', label: 'Monthly Revenue' }
            }
          }}
        />
        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">#7</div>
              <p className="text-xs text-gray-400 mt-1">Out of {leaderboardEntries.length} partners</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">This Month</CardTitle>
              <Users className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">7</div>
              <p className="text-xs text-orange-400 mt-1">Referrals completed</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Earnings</CardTitle>
              <Target className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">£3,450</div>
              <p className="text-xs text-orange-400 mt-1">+£500 this month</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+22%</div>
              <p className="text-xs text-orange-400 mt-1">vs last month</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <LeaderboardTemplate
            title="Partnership Leaderboard"
            subtitle="Rankings based on referrals, earnings, and overall performance"
            entries={leaderboardEntries}
            onUserClick={handlePartnerClick}
            showSearch={true}
            showFilters={true}
            showRankBadges={true}
            currencySymbol="£"
            tokenSymbol="PARTNER"
            searchPlaceholder="Search partners..."
            maxEntries={50}
          />
        </motion.div>

        {/* Achievement Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Target className="h-6 w-6 mr-2 text-orange-500" />
                Monthly Goals & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-900 border border-orange-500/20 rounded-lg">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Bronze Tier</h3>
                  <p className="text-sm text-gray-400">Current status - Growing strong! 🎯</p>
                </div>
                
                <div className="text-center p-6 bg-gray-900 border border-orange-500/20 rounded-lg">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">10 Referrals</h3>
                  <p className="text-sm text-gray-400">7/10 completed</p>
                </div>
                
                <div className="text-center p-6 bg-gray-900 border border-orange-500/20 rounded-lg">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">£5K Earnings</h3>
                  <p className="text-sm text-gray-400">£3.4K achieved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PartnershipLayout>
  );
};

export default AffiliateLeaderboard; 