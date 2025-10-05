import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import StatsCard from '@/components/dashboard/StatsCard';
import CommissionCalculator from '@/components/partnership/CommissionCalculator';
import { RecentActivityCard } from '@/components/dashboard/cards/RecentActivityCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { useState } from 'react';
// import { Charts } from '@/components/ui/charts'; // Create this component or use alternative

const AdminPartnershipReferrals = () => {
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const [showCommissionCalculator, setShowCommissionCalculator] = useState(false);

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: "Total Referrals",
      value: "342",
      trend: "+45 this week",
      icon: Users,
      trendUp: true
    },
    {
      title: "Pending Commission",
      value: "$18,750",
      trend: "24 referrals pending",
      icon: Clock,
      trendUp: true
    },
    {
      title: "Conversion Rate",
      value: "32%",
      trend: "+5% vs last month",
      icon: TrendingUp,
      trendUp: true
    },
    {
      title: "Avg Deal Size",
      value: "$4,250",
      trend: "+$350 increase",
      icon: DollarSign,
      trendUp: true
    }
  ];

  const referralData = [
    {
      id: '1',
      clientName: 'ABC Corporation',
      partnerName: 'Michael Chen',
      partnerTier: 'platinum',
      submissionDate: '2024-01-15',
      status: 'qualified',
      estimatedValue: 12500,
      commission: 2500,
      leadSource: 'website',
      priority: 'hot',
      notes: 'Interested in full digital transformation'
    },
    {
      id: '2',
      clientName: 'XYZ Industries',
      partnerName: 'Sarah Johnson',
      partnerTier: 'gold',
      submissionDate: '2024-01-14',
      status: 'proposal',
      estimatedValue: 8000,
      commission: 1200,
      leadSource: 'social',
      priority: 'warm',
      notes: 'Looking for mobile app development'
    },
    {
      id: '3',
      clientName: 'Tech Startup Inc',
      partnerName: 'Alex Rivera',
      partnerTier: 'gold',
      submissionDate: '2024-01-13',
      status: 'contacted',
      estimatedValue: 5500,
      commission: 825,
      leadSource: 'referral',
      priority: 'warm',
      notes: 'MVP development project'
    },
    {
      id: '4',
      clientName: 'Global Enterprises',
      partnerName: 'Emma Davis',
      partnerTier: 'silver',
      submissionDate: '2024-01-12',
      status: 'closed_won',
      estimatedValue: 15000,
      commission: 1875,
      leadSource: 'cold_outreach',
      priority: 'hot',
      notes: 'Successfully closed - enterprise solution'
    },
    {
      id: '5',
      clientName: 'Local Business Co',
      partnerName: 'James Wilson',
      partnerTier: 'silver',
      submissionDate: '2024-01-11',
      status: 'submitted',
      estimatedValue: 3500,
      commission: 437.50,
      leadSource: 'website',
      priority: 'cold',
      notes: 'Small business website redesign'
    }
  ];

  const columns = [
    { key: 'clientName', label: 'Client Name', sortable: true },
    { key: 'partnerName', label: 'Partner', sortable: true },
    { 
      key: 'partnerTier', 
      label: 'Tier',
      render: (value: string) => (
        <Badge variant={value === 'platinum' ? 'default' : 'secondary'} className="capitalize">
          {value}
        </Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => {
        const statusConfig = {
          submitted: { color: 'bg-gray-500', label: 'Submitted' },
          qualified: { color: 'bg-blue-500', label: 'Qualified' },
          contacted: { color: 'bg-yellow-500', label: 'Contacted' },
          proposal: { color: 'bg-purple-500', label: 'Proposal' },
          closed_won: { color: 'bg-green-500', label: 'Closed Won' },
          closed_lost: { color: 'bg-red-500', label: 'Closed Lost' }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        return (
          <Badge className={`${config.color} text-white`}>
            {config.label}
          </Badge>
        );
      }
    },
    { 
      key: 'estimatedValue', 
      label: 'Deal Value',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'commission', 
      label: 'Commission',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { key: 'submissionDate', label: 'Submitted', sortable: true },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (value: string) => {
        const priorityConfig = {
          hot: { icon: '🔥', color: 'text-red-500' },
          warm: { icon: '🌡️', color: 'text-yellow-500' },
          cold: { icon: '❄️', color: 'text-blue-500' }
        };
        const config = priorityConfig[value as keyof typeof priorityConfig];
        return (
          <span className={`${config.color} font-medium`}>
            {config.icon} {value}
          </span>
        );
      }
    }
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'New referral submitted',
      description: 'ABC Corporation by Michael Chen',
      timestamp: new Date(),
      icon: 'plus-circle',
      type: 'referral' as const
    },
    {
      id: '2',
      title: 'Referral status updated',
      description: 'XYZ Industries moved to Proposal stage',
      timestamp: new Date(Date.now() - 3600000),
      icon: 'refresh-cw',
      type: 'status' as const
    },
    {
      id: '3',
      title: 'Commission approved',
      description: '$1,875 for Global Enterprises deal',
      timestamp: new Date(Date.now() - 7200000),
      icon: 'check-circle',
      type: 'payment' as const
    },
    {
      id: '4',
      title: 'Lead converted',
      description: 'Global Enterprises closed successfully',
      timestamp: new Date(Date.now() - 10800000),
      icon: 'award',
      type: 'conversion' as const
    }
  ];

  // Pipeline data for chart
  const pipelineData = [
    { stage: 'Submitted', count: 45, value: 135000 },
    { stage: 'Qualified', count: 32, value: 96000 },
    { stage: 'Contacted', count: 28, value: 84000 },
    { stage: 'Proposal', count: 18, value: 54000 },
    { stage: 'Closed Won', count: 12, value: 36000 }
  ];

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on`, selectedReferrals);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageTitle 
          title="Partnership Referrals" 
          description="Manage and track all partner referrals"
        />

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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referrals Table - 2 columns wide */}
          <div className="lg:col-span-2">
            <Card className="bg-siso-bg-alt border-siso-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Referral Pipeline</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" className="bg-siso-primary hover:bg-siso-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Referral
                    </Button>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedReferrals.length > 0 && (
                  <div className="mb-4 p-3 bg-siso-bg rounded-lg border border-siso-border flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {selectedReferrals.length} referrals selected
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('approve')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('reject')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('update')}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Update Status
                      </Button>
                    </div>
                  </div>
                )}

                <EnhancedTable
                  data={referralData}
                  columns={columns}
                  onSelectionChange={setSelectedReferrals}
                  selectable
                />
              </div>
            </Card>

            {/* Pipeline Visualization */}
            <Card className="mt-6 p-6 bg-siso-bg-alt border-siso-border">
              <h3 className="text-lg font-semibold text-white mb-4">Pipeline Analysis</h3>
              <div className="h-64 flex items-center justify-center bg-siso-bg rounded-lg border border-siso-border">
                <p className="text-gray-400">Pipeline visualization chart will be implemented</p>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <RecentActivityCard
              activities={recentActivities}
              title="Recent Referral Activity"
            />

            {/* Commission Calculator */}
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Commission Calculator</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommissionCalculator(!showCommissionCalculator)}
                >
                  {showCommissionCalculator ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showCommissionCalculator && <CommissionCalculator />}
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-siso-bg-alt border-siso-border">
              <h3 className="text-lg font-semibold text-white mb-4">Conversion Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Avg Time to Close</span>
                  <span className="text-sm font-medium text-white">18 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Lead Quality Score</span>
                  <span className="text-sm font-medium text-white">8.2/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Partner Satisfaction</span>
                  <span className="text-sm font-medium text-white">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Commission Payout Time</span>
                  <span className="text-sm font-medium text-white">3-5 days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPartnershipReferrals;