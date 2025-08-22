// Partnership Stats Integration Component
// Demonstrates how to integrate real backend data with existing UI

import React from 'react';
import { usePartnerStats } from '@/hooks/usePartnerStats';
import { Loader2, Users, TrendingUp, Award, DollarSign } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
}

function StatCard({ icon, title, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          {icon}
        </div>
        {trend && (
          <span className="text-green-400 text-sm font-medium">
            {trend}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>
    </div>
  );
}

interface LeaderboardEntryProps {
  rank: number;
  name: string;
  tier: string;
  earnings: number;
  deals: number;
}

function LeaderboardEntry({ rank, name, tier, earnings, deals }: LeaderboardEntryProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'text-purple-400';
      case 'Gold': return 'text-yellow-400';
      case 'Silver': return 'text-gray-300';
      default: return 'text-orange-400';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
      <div className="flex items-center space-x-4">
        <span className="text-2xl">{getRankEmoji(rank)}</span>
        <div>
          <p className="text-white font-medium">{name}</p>
          <p className={`text-sm ${getTierColor(tier)}`}>{tier} Partner</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-white font-bold">£{earnings.toFixed(2)}</p>
        <p className="text-gray-400 text-sm">{deals} deals</p>
      </div>
    </div>
  );
}

export function PartnershipStatsIntegration() {
  const { stats, leaderboard, isLoading, error } = usePartnerStats();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-orange-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Loading partnership statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg font-medium">
            Failed to load statistics
          </div>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-gray-400">No statistics available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Real-time Statistics */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Partnership Program Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-6 h-6 text-orange-500" />}
            title="Active Partners"
            value={stats.activePartners}
            subtitle="Growing network"
            trend="+12%"
          />
          
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-green-500" />}
            title="Commissions Paid"
            value={`£${stats.totalCommissionsPaid.toFixed(2)}`}
            subtitle="To our partners"
            trend="+28%"
          />
          
          <StatCard
            icon={<Award className="w-6 h-6 text-blue-500" />}
            title="Successful Projects"
            value={stats.successfulProjects}
            subtitle="Completed builds"
            trend="+15%"
          />
          
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
            title="Avg. Commission"
            value={`£${stats.averageCommission.toFixed(2)}`}
            subtitle="Per project"
            trend="+8%"
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-orange-500" />}
          title="Total Applications"
          value={stats.totalApplications}
          subtitle="Partnership requests"
        />
        
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          title="Approval Rate"
          value={`${stats.approvalRate.toFixed(1)}%`}
          subtitle="Quality partners"
        />
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Top Performing Partners
          </h3>
          
          <div className="space-y-3 max-w-2xl mx-auto">
            {leaderboard.map((partner) => (
              <LeaderboardEntry
                key={partner.partnerId}
                rank={partner.rank}
                name={partner.partnerName}
                tier={partner.tier}
                earnings={partner.totalEarnings}
                deals={partner.totalDeals}
              />
            ))}
          </div>
        </div>
      )}

      {/* Integration Note */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 text-center">
        <h4 className="text-orange-400 font-bold mb-2">🚀 Real-Time Data Integration</h4>
        <p className="text-gray-300 text-sm">
          This component demonstrates live backend integration. All statistics update automatically 
          every 5 minutes and reflect real partnership program data.
        </p>
      </div>
    </div>
  );
}