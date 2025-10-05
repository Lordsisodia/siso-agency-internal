import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  CheckSquare, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCompactNumber } from '@/lib/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: {
    value: string | number;
    positive: boolean;
  };
  loading?: boolean;
  bgColor: string;
  textColor: string;
}

function StatCard({ title, value, icon, change, loading, bgColor, textColor }: StatCardProps) {
  return (
    <Card className={`border-0 ${bgColor} shadow-md hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
              <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full bg-white/10 flex items-center justify-center ${textColor}`}>
            {icon}
          </div>
        </div>
        
        {!loading && (
          <div className="flex items-center mt-4">
            <Badge 
              variant={change.positive ? "success" : "destructive"} 
              className={`flex items-center ${change.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {change.positive ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {change.value}
            </Badge>
            <span className="text-xs text-neutral-100 ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardKPI() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-kpi-stats'],
    queryFn: async () => {
      // This would normally fetch real data from your backend
      // For now using mock data with a small delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        clients: 34,
        clientsChange: 12.5,
        revenue: 24650,
        revenueChange: 8.3,
        tasks: 78,
        tasksChange: -5.2,
        conversionRate: 64,
        conversionChange: 3.7
      };
    },
  });
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Clients"
        value={isLoading ? '' : formatCompactNumber(stats?.clients || 0)}
        icon={<Users className="h-6 w-6" />}
        change={{ value: `${stats?.clientsChange || 0}%`, positive: (stats?.clientsChange || 0) > 0 }}
        loading={isLoading}
        bgColor="bg-gradient-to-br from-blue-900/40 to-blue-700/20"
        textColor="text-blue-300"
      />
      
      <StatCard
        title="Monthly Revenue"
        value={isLoading ? '' : `$${formatCompactNumber(stats?.revenue || 0)}`}
        icon={<CreditCard className="h-6 w-6" />}
        change={{ value: `${stats?.revenueChange || 0}%`, positive: (stats?.revenueChange || 0) > 0 }}
        loading={isLoading}
        bgColor="bg-gradient-to-br from-emerald-900/40 to-emerald-700/20"
        textColor="text-emerald-300"
      />
      
      <StatCard
        title="Active Tasks"
        value={isLoading ? '' : formatCompactNumber(stats?.tasks || 0)}
        icon={<CheckSquare className="h-6 w-6" />}
        change={{ value: `${Math.abs(stats?.tasksChange || 0)}%`, positive: (stats?.tasksChange || 0) > 0 }}
        loading={isLoading}
        bgColor="bg-gradient-to-br from-amber-900/40 to-amber-700/20"
        textColor="text-amber-300"
      />
      
      <StatCard
        title="Conversion Rate"
        value={isLoading ? '' : `${stats?.conversionRate || 0}%`}
        icon={<TrendingUp className="h-6 w-6" />}
        change={{ value: `${stats?.conversionChange || 0}%`, positive: (stats?.conversionChange || 0) > 0 }}
        loading={isLoading}
        bgColor="bg-gradient-to-br from-purple-900/40 to-purple-700/20"
        textColor="text-purple-300"
      />
    </div>
  );
}
