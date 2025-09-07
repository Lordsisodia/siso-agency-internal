import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  color?: 'orange' | 'green' | 'blue' | 'purple';
  subtitle?: string;
}

export function StatCard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color = 'orange',
  subtitle 
}: StatCardProps) {
  const colorClasses = {
    orange: 'text-orange-500 bg-orange-500/10',
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10'
  };

  const trendColor = trend && trend > 0 ? 'text-green-400' : trend && trend < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <Card className="bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              colorClasses[color]
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">{title}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
          {trend !== undefined && (
            <div className={cn("text-sm font-medium", trendColor)}>
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 