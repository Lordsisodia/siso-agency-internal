import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import StatsCard from '@/components/dashboard/StatsCard';
// import { Charts } from '@/components/ui/charts'; // Create this component or use alternative
import { Card } from '@/components/ui/card';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import { EnhancedProgressCard } from '@/components/dashboard/EnhancedProgressCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPartnershipStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('earnings');

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: "Total Revenue",
      value: "$125,320",
      trend: "+23% vs last period",
      icon: DollarSign,
      trendUp: true
    },
    {
      title: "Active Partners",
      value: "134",
      trend: "+8 new this month",
      icon: Users,
      trendUp: true
    },
    {
      title: "Conversion Rate",
      value: "32%",
      trend: "+5% improvement",
      icon: Target,
      trendUp: true
    },
    {
      title: "Avg Partner Value",
      value: "$936",
      trend: "+$125 increase",
      icon: TrendingUp,
      trendUp: true
    }
  ];

  // Chart data
  const earningsChartData = [
    { month: 'Jan', earnings: 12500, referrals: 45, conversions: 14 },
    { month: 'Feb', earnings: 15200, referrals: 52, conversions: 17 },
    { month: 'Mar', earnings: 18900, referrals: 61, conversions: 20 },
    { month: 'Apr', earnings: 22100, referrals: 68, conversions: 22 },
    { month: 'May', earnings: 25400, referrals: 74, conversions: 24 },
    { month: 'Jun', earnings: 28750, referrals: 82, conversions: 26 }
  ];

  const tierDistributionData = [
    { name: 'Bronze', value: 45, percentage: 29 },
    { name: 'Silver', value: 48, percentage: 31 },
    { name: 'Gold', value: 35, percentage: 23 },
    { name: 'Platinum', value: 28, percentage: 17 }
  ];

  const sourcePerformanceData = [
    { source: 'Website', leads: 125, conversions: 42, rate: 33.6 },
    { source: 'Social Media', leads: 98, conversions: 28, rate: 28.6 },
    { source: 'Referral', leads: 67, conversions: 31, rate: 46.3 },
    { source: 'Cold Outreach', leads: 52, conversions: 12, rate: 23.1 }
  ];

  const partnerPerformanceData = [
    {
      id: '1',
      partnerName: 'Michael Chen',
      tier: 'platinum',
      totalEarnings: 12450,
      monthlyEarnings: 3200,
      referrals: 28,
      conversions: 18,
      conversionRate: 64.3,
      avgDealSize: 4250,
      performance: 'excellent'
    },
    {
      id: '2',
      partnerName: 'Sarah Johnson',
      tier: 'gold',
      totalEarnings: 10200,
      monthlyEarnings: 2800,
      referrals: 22,
      conversions: 14,
      conversionRate: 63.6,
      avgDealSize: 3850,
      performance: 'excellent'
    },
    {
      id: '3',
      partnerName: 'Alex Rivera',
      tier: 'gold',
      totalEarnings: 8900,
      monthlyEarnings: 2100,
      referrals: 19,
      conversions: 11,
      conversionRate: 57.9,
      avgDealSize: 3500,
      performance: 'good'
    },
    {
      id: '4',
      partnerName: 'Emma Davis',
      tier: 'silver',
      totalEarnings: 7800,
      monthlyEarnings: 1800,
      referrals: 15,
      conversions: 8,
      conversionRate: 53.3,
      avgDealSize: 3200,
      performance: 'good'
    },
    {
      id: '5',
      partnerName: 'James Wilson',
      tier: 'silver',
      totalEarnings: 6500,
      monthlyEarnings: 1500,
      referrals: 12,
      conversions: 6,
      conversionRate: 50.0,
      avgDealSize: 2800,
      performance: 'average'
    }
  ];

  const columns = [
    { key: 'partnerName', label: 'Partner', sortable: true },
    { 
      key: 'tier', 
      label: 'Tier',
      render: (value: string) => (
        <Badge variant={value === 'platinum' ? 'default' : 'secondary'} className="capitalize">
          {value}
        </Badge>
      )
    },
    { 
      key: 'monthlyEarnings', 
      label: 'Monthly Earnings',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'totalEarnings', 
      label: 'Total Earnings',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { key: 'referrals', label: 'Referrals', sortable: true },
    { key: 'conversions', label: 'Conversions', sortable: true },
    { 
      key: 'conversionRate', 
      label: 'Conv. Rate',
      sortable: true,
      render: (value: number) => `${value.toFixed(1)}%`
    },
    { 
      key: 'avgDealSize', 
      label: 'Avg Deal',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    {
      key: 'performance',
      label: 'Performance',
      render: (value: string) => {
        const colors = {
          excellent: 'bg-green-500',
          good: 'bg-blue-500',
          average: 'bg-yellow-500',
          poor: 'bg-red-500'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-white capitalize`}>
            {value}
          </Badge>
        );
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <AdminPageTitle 
            title="Partnership Statistics" 
            description="Comprehensive analytics and performance metrics"
          />
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              icon={stat.icon}
              trendUp={stat.trendUp}
            />
          ))}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="sources">Lead Sources</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-siso-bg-alt border-siso-border">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Performance
                </h3>
                <div className="h-72 flex items-center justify-center bg-siso-bg rounded-lg border border-siso-border">
                  <p className="text-gray-400">Revenue performance chart will be implemented</p>
                </div>
              </Card>

              <Card className="p-6 bg-siso-bg-alt border-siso-border">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Referral Activity
                </h3>
                <div className="h-72 flex items-center justify-center bg-siso-bg rounded-lg border border-siso-border">
                  <p className="text-gray-400">Referral activity chart will be implemented</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-siso-bg-alt border-siso-border">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Partner Tier Distribution
                </h3>
                <div className="space-y-4">
                  {tierDistributionData.map((tier) => (
                    <div key={tier.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-white">{tier.name}</span>
                        <span className="text-sm text-gray-400">
                          {tier.value} partners ({tier.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-siso-bg rounded-full h-2">
                        <div 
                          className="bg-siso-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${tier.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-siso-bg-alt border-siso-border">
                <h3 className="text-lg font-semibold text-white mb-4">Goal Progress</h3>
                <EnhancedProgressCard
                  title="Q2 Partnership Goals"
                  progress={[
                    { label: "New Partners", value: 75, color: "bg-blue-500" },
                    { label: "Revenue Target", value: 85, color: "bg-green-500" },
                    { label: "Conversion Rate", value: 92, color: "bg-purple-500" },
                    { label: "Partner Retention", value: 68, color: "bg-orange-500" }
                  ]}
                  showPercentage
                />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <h3 className="text-lg font-semibold text-white mb-4">Lead Source Performance</h3>
              <div className="space-y-4">
                {sourcePerformanceData.map((source) => (
                  <div key={source.source} className="flex items-center justify-between p-3 rounded-lg bg-siso-bg border border-siso-border">
                    <div>
                      <p className="font-medium text-white">{source.source}</p>
                      <p className="text-sm text-gray-400">{source.leads} leads</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{source.conversions} conversions</p>
                      <p className="text-sm text-siso-primary">{source.rate}% rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
              <div className="h-72 flex items-center justify-center bg-siso-bg rounded-lg border border-siso-border">
                <p className="text-gray-400">Performance trends chart will be implemented</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Partner Performance Table */}
        <Card className="bg-siso-bg-alt border-siso-border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Partner Performance Analysis</h3>
            <EnhancedTable
              data={partnerPerformanceData}
              columns={columns}
            />
          </div>
        </Card>

        {/* Insights & Recommendations */}
        <Card className="p-6 bg-siso-bg-alt border-siso-border">
          <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-siso-bg border border-siso-border">
              <h4 className="font-medium text-white mb-2">🎯 Top Opportunity</h4>
              <p className="text-sm text-gray-400">
                Referral source partners have 46.3% conversion rate. Consider increasing focus on referral-based recruitment.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-siso-bg border border-siso-border">
              <h4 className="font-medium text-white mb-2">📈 Growth Trend</h4>
              <p className="text-sm text-gray-400">
                Revenue has grown 23% month-over-month. Maintain current partner engagement strategies.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-siso-bg border border-siso-border">
              <h4 className="font-medium text-white mb-2">⚠️ Action Required</h4>
              <p className="text-sm text-gray-400">
                32% of Bronze partners haven't submitted referrals in 30+ days. Consider re-engagement campaign.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPartnershipStatistics;