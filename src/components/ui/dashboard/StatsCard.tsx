import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  isLoading = false,
  className,
  onClick
}) => {
  const variantStyles = {
    default: 'border-gray-700 bg-gray-800',
    success: 'border-green-600 bg-green-900/20',
    warning: 'border-yellow-600 bg-yellow-900/20',
    danger: 'border-red-600 bg-red-900/20',
    info: 'border-blue-600 bg-blue-900/20'
  };

  const trendStyles = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  if (isLoading) {
    return (
      <div className={cn(
        'p-4 sm:p-6 rounded-lg border bg-gray-800 border-gray-700 animate-pulse',
        className
      )}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="h-3 sm:h-4 bg-gray-700 rounded w-20 sm:w-24"></div>
          <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 sm:h-8 bg-gray-700 rounded w-16 sm:w-20"></div>
          <div className="h-2 sm:h-3 bg-gray-700 rounded w-12 sm:w-16"></div>
        </div>
        <div className="flex items-center mt-3 sm:mt-4 space-x-2">
          <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-700 rounded"></div>
          <div className="h-2 sm:h-3 bg-gray-700 rounded w-10 sm:w-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'p-4 sm:p-6 rounded-lg border transition-all duration-200 hover:shadow-lg hover:scale-105 touch-manipulation',
        'min-h-[120px] sm:min-h-[140px]',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:border-orange-500 active:scale-100 active:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wide truncate pr-2">
          {title}
        </h3>
        {Icon && (
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 flex-shrink-0" />
        )}
      </div>

      {/* Main Value */}
      <div className="space-y-1">
        <p className="text-2xl sm:text-3xl font-bold text-white break-all">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>

      {/* Trend Indicator */}
      {trend && trendValue && (
        <div className="flex items-center mt-3 sm:mt-4 space-x-2">
          <TrendIcon className={cn('h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0', trendStyles[trend])} />
          <span className={cn('text-xs sm:text-sm font-medium truncate', trendStyles[trend])}>
            {trendValue}
          </span>
          <span className="text-xs text-gray-500 hidden sm:inline">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard; 