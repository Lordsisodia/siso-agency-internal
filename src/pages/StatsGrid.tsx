import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { selectImplementation } from '@/migration/feature-flags';
import { theme } from '@/styles/theme';

export interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  activeReferrals: number;
  conversionRate: number;
}

export interface StatsGridProps {
  stats: DashboardStats;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Earnings',
      value: `£${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      change: '+12% from last month',
      changeIcon: ArrowUpRight,
      color: 'orange'
    },
    {
      title: 'This Month',
      value: `£${stats.monthlyEarnings.toLocaleString()}`,
      icon: Calendar,
      change: '+8% from last month',
      changeIcon: ArrowUpRight,
      color: 'orange'
    },
    {
      title: 'Active Referrals',
      value: stats.activeReferrals.toString(),
      icon: Users,
      change: 'In progress',
      changeIcon: Clock,
      color: 'orange'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      change: '+5% from last month',
      changeIcon: ArrowUpRight,
      color: 'orange'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="row-3-cards"
    >
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const ChangeIcon = stat.changeIcon;
        
        return (
          <Card 
            key={stat.title}
            className={selectImplementation(
              'useUnifiedThemeSystem',
              `border-orange-500/20 ${theme.backgrounds.solid.black}`,
              'bg-black border-orange-500/20'
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${stat.color}-${index === 0 ? '500' : '400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {stat.value}
              </div>
              <div className={`flex items-center text-xs text-${stat.color}-400 mt-1`}>
                <ChangeIcon className="w-3 h-3 mr-1" />
                {stat.change}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </motion.div>
  );
};

export default StatsGrid;