import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Circle, Clock, Trophy, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DailyTrackerProgressProps {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular' | 'radial';
  color?: 'default' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  showIcon?: boolean;
  animate?: boolean;
  className?: string;
}

const colorClasses = {
  default: {
    bg: 'bg-gray-700',
    fill: 'bg-gray-400',
    text: 'text-gray-400',
    ring: 'ring-gray-600'
  },
  success: {
    bg: 'bg-green-900/30',
    fill: 'bg-green-500',
    text: 'text-green-400',
    ring: 'ring-green-600'
  },
  warning: {
    bg: 'bg-yellow-900/30',
    fill: 'bg-yellow-500',
    text: 'text-yellow-400',
    ring: 'ring-yellow-600'
  },
  danger: {
    bg: 'bg-red-900/30',
    fill: 'bg-red-500',
    text: 'text-red-400',
    ring: 'ring-red-600'
  }
};

const sizeClasses = {
  sm: {
    height: 'h-2',
    text: 'text-xs',
    icon: 'h-3 w-3',
    circular: 'h-12 w-12'
  },
  md: {
    height: 'h-3',
    text: 'text-sm',
    icon: 'h-4 w-4',
    circular: 'h-16 w-16'
  },
  lg: {
    height: 'h-4',
    text: 'text-base',
    icon: 'h-5 w-5',
    circular: 'h-20 w-20'
  }
};

// Linear progress bar
const LinearProgress: React.FC<DailyTrackerProgressProps> = ({
  value,
  max = 100,
  label,
  size = 'md',
  color = 'default',
  showPercentage = true,
  showIcon = false,
  animate = true,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className={cn('font-medium', sizes.text, colors.text)}>
              {label}
            </span>
          )}
          <div className="flex items-center gap-2">
            {showIcon && percentage === 100 && (
              <Check className={cn(sizes.icon, 'text-green-500')} />
            )}
            {showPercentage && (
              <span className={cn(sizes.text, colors.text)}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        colors.bg,
        sizes.height
      )}>
        <motion.div
          className={cn('h-full rounded-full', colors.fill)}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Circular progress indicator
const CircularProgress: React.FC<DailyTrackerProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'default',
  showPercentage = true,
  animate = true,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = colorClasses[color];
  const sizes = sizeClasses[size];
  
  const radius = size === 'sm' ? 18 : size === 'md' ? 26 : 34;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', sizes.circular, className)}>
      <svg className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={cn('text-gray-700')}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors.text}
          initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(sizes.text, colors.text, 'font-semibold')}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Main progress component
export const DailyTrackerProgress: React.FC<DailyTrackerProgressProps> = (props) => {
  const { variant = 'linear' } = props;

  switch (variant) {
    case 'circular':
      return <CircularProgress {...props} />;
    case 'linear':
    default:
      return <LinearProgress {...props} />;
  }
};

// Progress summary card
export const DailyTrackerProgressSummary: React.FC<{
  sections: Array<{
    id: string;
    label: string;
    completed: number;
    total: number;
    icon?: React.ReactNode;
    color?: 'default' | 'success' | 'warning' | 'danger';
  }>;
  className?: string;
}> = ({ sections, className }) => {
  const totalCompleted = sections.reduce((sum, section) => sum + section.completed, 0);
  const totalItems = sections.reduce((sum, section) => sum + section.total, 0);
  const overallPercentage = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;

  return (
    <div className={cn(
      'bg-gray-800/50 rounded-lg p-4 sm:p-6 space-y-4',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Daily Progress
        </h3>
        <span className="text-2xl font-bold text-orange-400">
          {Math.round(overallPercentage)}%
        </span>
      </div>

      <DailyTrackerProgress
        value={overallPercentage}
        color={overallPercentage === 100 ? 'success' : overallPercentage >= 70 ? 'warning' : 'default'}
        size="lg"
        showPercentage={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {sections.map((section) => {
          const percentage = section.total > 0 ? (section.completed / section.total) * 100 : 0;
          return (
            <motion.div
              key={section.id}
              className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              {section.icon || <Check className="h-4 w-4 text-gray-400" />}
              <div className="flex-1">
                <p className="text-sm text-gray-300">{section.label}</p>
                <p className="text-xs text-gray-500">
                  {section.completed}/{section.total} completed
                </p>
              </div>
              <DailyTrackerProgress
                value={percentage}
                variant="circular"
                size="sm"
                color={section.color || (percentage === 100 ? 'success' : 'default')}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Streak indicator
export const DailyTrackerStreak: React.FC<{
  days: number;
  label?: string;
  showTrend?: boolean;
  className?: string;
}> = ({ days, label = 'Day Streak', showTrend = true, className }) => {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-lg p-3 sm:p-4',
        'border border-orange-600/30',
        className
      )}
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-orange-600/30 flex items-center justify-center">
          <span className="text-xl font-bold text-orange-400">{days}</span>
        </div>
        {days > 0 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full animate-pulse" />
        )}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {showTrend && days > 0 && (
          <div className="flex items-center gap-1 text-xs text-orange-400">
            <TrendingUp className="h-3 w-3" />
            <span>Keep it going!</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyTrackerProgress;