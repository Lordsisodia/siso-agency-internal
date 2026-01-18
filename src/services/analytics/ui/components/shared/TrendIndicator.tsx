/**
 * Trend Indicator Component
 *
 * Displays trend direction with icon and percentage
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrendDirection } from '../../../types/xpAnalytics.types';

interface TrendIndicatorProps {
  trend: TrendDirection;
  percent: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const SIZE_STYLES = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function TrendIndicator({
  trend,
  percent,
  label,
  size = 'md',
  showIcon = true,
  className,
}: TrendIndicatorProps) {
  const sizeClass = SIZE_STYLES[size];
  const iconSize = ICON_SIZES[size];

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    stable: {
      icon: Minus,
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
    },
  };

  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {showIcon && (
        <div className={cn('flex items-center justify-center rounded-full', config.bg, size === 'sm' ? 'p-1' : 'p-1.5')}>
          <Icon className={cn(iconSize, config.color)} />
        </div>
      )}
      <span className={cn('font-semibold', sizeClass, config.color)}>
        {trend === 'up' && '+'}
        {Math.round(percent)}%
      </span>
      {label && <span className={cn('text-gray-500', sizeClass)}>{label}</span>}
    </div>
  );
}
