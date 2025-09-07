import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { Card } from '@/components/ui/card';
import StatsCard from '@/components/dashboard/StatsCard';
import { RecentActivityCard } from '@/components/dashboard/cards/RecentActivityCard';
import { EnhancedProgressCard } from '@/components/dashboard/EnhancedProgressCard';
import { LeaderboardPreviewCard } from '@/components/dashboard/LeaderboardPreviewCard';
import { DollarSign, Users, TrendingUp, Award, Target, Activity, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminPartnershipDashboard = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: "Total Partners",
      value: "156",
      trend: "+12 this month",
      icon: Users,
      trendUp: true
    },
    {
      title: "Total Earnings",
      value: "$45,320",
      trend: "+$8,450 this month",
      icon: DollarSign,
      trendUp: true
    },
    {
      title: "Active Referrals",
      value: "342",
      trend: "+45 this week",
      icon: TrendingUp,
      trendUp: true
    },
    {
      title: "Avg Conversion",
      value: "32%",
      trend: "+5% vs last month",
      icon: Target,
      trendUp: true
    }
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'New partner registered',
      description: 'Sarah Johnson joined the partnership program',
      timestamp: new Date(),
      icon: 'user-plus',
      type: 'partner' as const
    },
    {
      id: '2',
      title: 'Commission payment processed',
      description: '$2,400 paid to 12 partners',
      timestamp: new Date(Date.now() - 3600000),
      icon: 'dollar-sign',
      type: 'payment' as const
    },
    {
      id: '3',
      title: 'Partner tier upgrade',
      description: 'Michael Chen reached Gold tier',
      timestamp: new Date(Date.now() - 7200000),
      icon: 'award',
      type: 'achievement' as const
    },
    {
      id: '4',
      title: 'New referral converted',
      description: 'ABC Corp signed up via partner referral',
      timestamp: new Date(Date.now() - 10800000),
      icon: 'check-circle',
      type: 'conversion' as const
    }
  ];

  const tierProgress = {
    bronze: { current: 45, total: 50, percentage: 90 },
    silver: { current: 28, total: 40, percentage: 70 },
    gold: { current: 12, total: 20, percentage: 60 },
    platinum: { current: 3, total: 10, percentage: 30 }
  };

  const leaderboardData = [
    { rank: 1, name: "Michael Chen", earnings: 12450, trend: "+15%", avatar: "/avatars/1.jpg" },
    { rank: 2, name: "Sarah Johnson", earnings: 10200, trend: "+8%", avatar: "/avatars/2.jpg" },
    { rank: 3, name: "Alex Rivera", earnings: 8900, trend: "+12%", avatar: "/avatars/3.jpg" },
    { rank: 4, name: "Emma Davis", earnings: 7800, trend: "-3%", avatar: "/avatars/4.jpg" },
    { rank: 5, name: "James Wilson", earnings: 6500, trend: "+5%", avatar: "/avatars/5.jpg" }
  ];

  const quickActions = [
    { label: "View All Partners", icon: Users, path: "/admin/partnership/partners" },
    { label: "Pending Referrals", icon: Activity, path: "/admin/partnership/referrals" },
    { label: "Process Payments", icon: DollarSign, path: "/admin/partnership/payments" },
    { label: "Training Content", icon: BookOpen, path: "/admin/partnership/training" }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageTitle 
          title="Partnership Dashboard" 
          description="Manage and monitor your partnership program performance"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              trendValue={stat.trend}
              icon={stat.icon}
              trend={stat.trendUp ? 'up' : 'down'}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Left Column */}
          <div className="lg:col-span-1">
            <RecentActivityCard
              activities={recentActivities}
              title="Recent Partnership Activity"
              viewAllLink="/admin/partnership/activity"
            />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tier Distribution */}
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <h3 className="text-lg font-semibold text-white mb-4">Partner Tier Distribution</h3>
              <EnhancedProgressCard
                title="Partnership Tiers"
                progress={[
                  { label: "Bronze", value: tierProgress.bronze.percentage, color: "bg-orange-600" },
                  { label: "Silver", value: tierProgress.silver.percentage, color: "bg-gray-400" },
                  { label: "Gold", value: tierProgress.gold.percentage, color: "bg-yellow-500" },
                  { label: "Platinum", value: tierProgress.platinum.percentage, color: "bg-purple-600" }
                ]}
                showPercentage
              />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Bronze Partners:</span>
                  <span className="text-white">{tierProgress.bronze.current}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Silver Partners:</span>
                  <span className="text-white">{tierProgress.silver.current}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Gold Partners:</span>
                  <span className="text-white">{tierProgress.gold.current}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Platinum Partners:</span>
                  <span className="text-white">{tierProgress.platinum.current}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="flex items-center gap-2 justify-start h-auto py-3"
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <LeaderboardPreviewCard
              partners={leaderboardData}
              title="Top Partners This Month"
              viewAllLink="/admin/partnership/leaderboard"
            />
          </div>
        </div>

        {/* Program Overview */}
        <Card className="p-6 bg-siso-bg-alt border-siso-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Program Overview</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/partnership/settings')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Program Settings
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
              <p className="text-2xl font-bold text-siso-primary">$125K</p>
              <p className="text-sm text-gray-400">Total Commissions Paid</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
              <p className="text-2xl font-bold text-siso-primary">892</p>
              <p className="text-sm text-gray-400">Total Referrals</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
              <p className="text-2xl font-bold text-siso-primary">68%</p>
              <p className="text-sm text-gray-400">Partner Retention</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-siso-bg border border-siso-border">
              <p className="text-2xl font-bold text-siso-primary">4.8</p>
              <p className="text-sm text-gray-400">Avg Partner Rating</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPartnershipDashboard;