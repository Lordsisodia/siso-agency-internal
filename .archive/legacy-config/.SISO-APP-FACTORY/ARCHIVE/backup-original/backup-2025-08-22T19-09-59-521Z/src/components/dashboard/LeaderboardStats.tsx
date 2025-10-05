import { Card } from '@/components/ui/card';
import StatsCard from '@/components/dashboard/StatsCard';
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

interface LeaderboardStatsData {
  totalPartners: number;
  activePartners: number;
  topPerformerEarnings: number;
  averageEarnings: number;
  totalCommissionsPaid: number;
  monthlyGrowth: number;
  conversionRate: number;
  topReferrer: {
    name: string;
    referrals: number;
  };
}

interface LeaderboardStatsProps {
  stats: LeaderboardStatsData;
  period: string;
}

export const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({
  stats,
  period
}) => {
  const statsCards = [
    {
      title: "Total Partners",
      value: stats.totalPartners.toString(),
      trend: `${stats.activePartners} active`,
      icon: Users,
      trendUp: true
    },
    {
      title: "Top Performer",
      value: `$${stats.topPerformerEarnings.toLocaleString()}`,
      trend: `vs $${stats.averageEarnings.toLocaleString()} avg`,
      icon: Award,
      trendUp: true
    },
    {
      title: "Total Commissions",
      value: `$${stats.totalCommissionsPaid.toLocaleString()}`,
      trend: `+${stats.monthlyGrowth.toFixed(1)}% growth`,
      icon: DollarSign,
      trendUp: stats.monthlyGrowth > 0
    },
    {
      title: "Program Conv. Rate",
      value: `${stats.conversionRate}%`,
      trend: `Best: ${stats.topReferrer.name}`,
      icon: TrendingUp,
      trendUp: true
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Partnership Program Overview</h2>
        <span className="text-sm text-gray-400 capitalize">Period: {period}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
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

      {/* Additional insights */}
      <Card className="p-4 bg-siso-bg-alt border-siso-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-siso-primary">
              {((stats.activePartners / stats.totalPartners) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400">Partner Retention Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-siso-primary">
              {stats.topReferrer.referrals}
            </p>
            <p className="text-sm text-gray-400">Most Referrals by {stats.topReferrer.name}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-siso-primary">
              ${(stats.totalCommissionsPaid / stats.totalPartners).toFixed(0)}
            </p>
            <p className="text-sm text-gray-400">Avg Commission per Partner</p>
          </div>
        </div>
      </Card>
    </div>
  );
};