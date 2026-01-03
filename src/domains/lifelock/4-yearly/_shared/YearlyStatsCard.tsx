/**
 * YearlyStatsCard Component
 * 
 * Reusable stats card with orange theme callout box styling
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface YearlyStatsCardProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export const YearlyStatsCard: React.FC<YearlyStatsCardProps> = ({
  title,
  icon: Icon,
  value,
  subtitle,
  trend,
  className,
  children
}) => {
  return (
    <section className={cn('relative', className)}>
      {/* Gradient background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
      
      {/* Card content */}
      <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-orange-400 flex items-center justify-between">
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-2" />
              {title}
            </div>
            {trend && (
              <div className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                trend.direction === 'up' ? 'bg-green-500/20 text-green-400' :
                trend.direction === 'down' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              )}>
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-gray-400">
              {subtitle}
            </div>
          )}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </CardContent>
      </div>
    </section>
  );
};
