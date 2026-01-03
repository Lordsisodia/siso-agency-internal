import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { LeaderboardTable } from '@/components/dashboard/LeaderboardTable';
import { LeaderboardStats } from '@/components/dashboard/LeaderboardStats';
import { LeaderboardFilters } from '@/components/dashboard/LeaderboardFilters';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const AdminPartnershipLeaderboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API calls
  const leaderboardData = [
    {
      rank: 1,
      name: "Michael Chen",
      avatar: "/avatars/1.jpg",
      spending: 12450,
      transactions: 45,
      trend: { value: 15, direction: "up" as const },
      badge: "platinum" as const,
      achievements: 12,
      referrals: 28,
      conversions: 18,
      conversionRate: 64.3
    },
    {
      rank: 2,
      name: "Sarah Johnson",
      avatar: "/avatars/2.jpg",
      spending: 10200,
      transactions: 38,
      trend: { value: 8, direction: "up" as const },
      badge: "gold" as const,
      achievements: 9,
      referrals: 22,
      conversions: 14,
      conversionRate: 63.6
    },
    {
      rank: 3,
      name: "Alex Rivera",
      avatar: "/avatars/3.jpg",
      spending: 8900,
      transactions: 32,
      trend: { value: 12, direction: "up" as const },
      badge: "gold" as const,
      achievements: 8,
      referrals: 19,
      conversions: 11,
      conversionRate: 57.9
    },
    {
      rank: 4,
      name: "Emma Davis",
      avatar: "/avatars/4.jpg",
      spending: 7800,
      transactions: 28,
      trend: { value: 3, direction: "down" as const },
      badge: "silver" as const,
      achievements: 6,
      referrals: 15,
      conversions: 8,
      conversionRate: 53.3
    },
    {
      rank: 5,
      name: "James Wilson",
      avatar: "/avatars/5.jpg",
      spending: 6500,
      transactions: 24,
      trend: { value: 5, direction: "up" as const },
      badge: "silver" as const,
      achievements: 5,
      referrals: 12,
      conversions: 6,
      conversionRate: 50.0
    },
    {
      rank: 6,
      name: "Lisa Anderson",
      avatar: "/avatars/6.jpg",
      spending: 5200,
      transactions: 20,
      trend: { value: 2, direction: "up" as const },
      badge: "bronze" as const,
      achievements: 4,
      referrals: 10,
      conversions: 4,
      conversionRate: 40.0
    },
    {
      rank: 7,
      name: "Robert Martinez",
      avatar: "/avatars/7.jpg",
      spending: 4800,
      transactions: 18,
      trend: { value: 7, direction: "down" as const },
      badge: "bronze" as const,
      achievements: 3,
      referrals: 8,
      conversions: 3,
      conversionRate: 37.5
    },
    {
      rank: 8,
      name: "Jennifer Lee",
      avatar: "/avatars/8.jpg",
      spending: 4200,
      transactions: 16,
      trend: { value: 0, direction: "same" as const },
      badge: "bronze" as const,
      achievements: 3,
      referrals: 7,
      conversions: 2,
      conversionRate: 28.6
    }
  ];

  const leaderboardStats = {
    totalPartners: 156,
    activePartners: 134,
    topPerformerEarnings: 12450,
    averageEarnings: 3875,
    totalCommissionsPaid: 125320,
    monthlyGrowth: 15.3,
    conversionRate: 32,
    topReferrer: {
      name: "Michael Chen",
      referrals: 28
    }
  };

  // Filter data based on search
  const filteredData = leaderboardData.filter(partner => 
    partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilterChange = (filters: any) => {
    setSelectedCategory(filters.category || 'all');
    // Apply additional filters as needed
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Fetch data for the selected period
  };

  const handlePartnerClick = (partner: any) => {
    // Navigate to partner details
    console.log('View partner:', partner);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageTitle 
          title="Partnership Leaderboard" 
          description="Track and reward your top-performing partners"
        />

        {/* Statistics Overview */}
        <LeaderboardStats 
          stats={leaderboardStats}
          period={selectedPeriod}
        />

        {/* Filtering Controls */}
        <LeaderboardFilters 
          onFilterChange={handleFilterChange}
          onPeriodChange={handlePeriodChange}
          onSearchChange={setSearchQuery}
        />

        {/* Achievement Showcase */}
        <Card className="p-6 bg-siso-bg-alt border-siso-border">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-siso-bg border border-siso-border">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-white">Monthly Champion</p>
                <p className="text-xs text-gray-400">Michael Chen</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-siso-bg border border-siso-border">
              <Medal className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-white">Rising Star</p>
                <p className="text-xs text-gray-400">Alex Rivera</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-siso-bg border border-siso-border">
              <Award className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-white">Most Referrals</p>
                <p className="text-xs text-gray-400">Michael Chen (28)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-siso-bg border border-siso-border">
              <Star className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-white">Best Conversion</p>
                <p className="text-xs text-gray-400">Michael Chen (64.3%)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Rankings Table */}
        <Card className="bg-siso-bg-alt border-siso-border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Partner Rankings</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {filteredData.length} Partners
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {selectedPeriod}
                </Badge>
              </div>
            </div>
            <LeaderboardTable 
              rankings={filteredData}
              currentUser={null} // Admin view doesn't highlight a specific user
              onPartnerClick={handlePartnerClick}
              showAdminControls={true}
            />
          </div>
        </Card>

        {/* Hall of Fame Section */}
        <Card className="p-6 bg-siso-bg-alt border-siso-border">
          <h3 className="text-lg font-semibold text-white mb-4">Hall of Fame</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
              <h4 className="text-sm font-medium text-gray-400 mb-2">All-Time Earnings Leader</h4>
              <p className="text-xl font-bold text-siso-primary">Michael Chen</p>
              <p className="text-sm text-gray-400">$78,450 total</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Most Referrals (All-Time)</h4>
              <p className="text-xl font-bold text-siso-primary">Sarah Johnson</p>
              <p className="text-sm text-gray-400">142 referrals</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Highest Conversion Rate</h4>
              <p className="text-xl font-bold text-siso-primary">Alex Rivera</p>
              <p className="text-sm text-gray-400">71.2% conversion</p>
            </div>
          </div>
        </Card>

        {/* Admin Actions */}
        <Card className="p-6 bg-siso-bg-alt border-siso-border">
          <h3 className="text-lg font-semibold text-white mb-4">Leaderboard Management</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              Export Rankings
            </Button>
            <Button variant="outline" size="sm">
              Send Recognition Emails
            </Button>
            <Button variant="outline" size="sm">
              Schedule Awards Ceremony
            </Button>
            <Button variant="outline" size="sm">
              Generate Performance Reports
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPartnershipLeaderboard;