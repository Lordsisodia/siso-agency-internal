/**
 * XP Stat Card - Reusable Component
 *
 * A glassmorphic card component for displaying XP statistics
 * with consistent styling across the analytics dashboard
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface XPStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  iconColor?: string;
  gradient?: string;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_STYLES = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function XPStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-400',
  gradient = 'from-indigo-500/10 to-purple-500/10',
  trend,
  className,
  children,
  onClick,
  size = 'md',
}: XPStatCardProps) {
  const sizeClass = SIZE_STYLES[size];

  return (
    <motion.div
      className={cn(
        'relative bg-gradient-to-br border border-white/10 rounded-2xl backdrop-blur-sm',
        gradient,
        sizeClass,
        onClick && 'cursor-pointer hover:scale-[1.02] hover:border-white/20',
        className
      )}
      whileHover={onClick ? { scale: 1.02 } : {}}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
        {Icon && (
          <div className={cn('flex-shrink-0', iconColor)}>
            {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              trend.value > 0 ? 'text-green-400' : trend.value < 0 ? 'text-red-400' : 'text-gray-400'
            )}
          >
            {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </span>
          {trend.label && <span className="text-xs text-gray-500">{trend.label}</span>}
        </div>
      )}

      {/* Children */}
      {children}
    </motion.div>
  );
}
