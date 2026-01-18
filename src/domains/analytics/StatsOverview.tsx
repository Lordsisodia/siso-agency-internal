import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, BarChart3, TrendingUp } from "lucide-react";
import { formatCompactNumber } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/integrations/supabase/client";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  trend?: "up" | "down";
  loading?: boolean;
  delay?: number;
}

const StatCard = React.memo(function StatCard({ title, value, icon, change, trend, loading, delay = 0 }: StatCardProps) {
  return (
    <div className="transform hover:-translate-y-1 transition-transform duration-200">
      <Card className="bg-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-white text-sm">{title}</p>
              {loading ? (
                <div className="h-8 w-24 bg-gray-900 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center text-orange-400">
              {icon}
            </div>
          </div>
          {!loading && change && (
            <div className="flex items-center mt-4">
              <span className={`text-xs font-medium flex items-center ${
                trend === "up" ? "text-orange-400" : "text-orange-600"
              }`}>
                {trend === "up" ? "↑" : "↓"} {change}
              </span>
              <span className="text-xs text-neutral-100 ml-2">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export const StatsOverview = React.memo(function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: clients } = await supabase
        .from('client_onboarding')
        .select('count');
        
      const { data: leads } = await supabase
        .from('instagram_leads')
        .select('count');
        
      const { data: tasks } = await supabase
        .from('tasks')
        .select('count')
        .eq('status', 'pending');

      return {
        clients: clients?.[0]?.count || 0,
        leads: leads?.[0]?.count || 0,
        tasks: tasks?.[0]?.count || 0,
        revenue: 25000 // This would come from your financial data in a real implementation
      };
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Clients"
        value={isLoading ? "" : formatCompactNumber(stats?.clients || 0)}
        icon={<Users className="h-6 w-6" />}
        change="12%"
        trend="up"
        loading={isLoading}
        delay={0}
      />
      <StatCard
        title="Active Leads"
        value={isLoading ? "" : formatCompactNumber(stats?.leads || 0)}
        icon={<BarChart3 className="h-6 w-6" />}
        change="8%"
        trend="up"
        loading={isLoading}
        delay={1}
      />
      <StatCard
        title="Pending Tasks"
        value={isLoading ? "" : formatCompactNumber(stats?.tasks || 0)}
        icon={<TrendingUp className="h-6 w-6" />}
        change="5%"
        trend="down"
        loading={isLoading}
        delay={2}
      />
      <StatCard
        title="Monthly Revenue"
        value={isLoading ? "" : formatCompactNumber(stats?.revenue || 0)}
        icon={<CreditCard className="h-6 w-6" />}
        change="15%"
        trend="up"
        loading={isLoading}
        delay={3}
      />
    </div>
  );
});
