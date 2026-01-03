import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakIndicatorProps {
  streakDays: number;
  className?: string;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ streakDays, className }) => {
  if (streakDays < 2) return null;

  const getStreakColor = () => {
    if (streakDays >= 7) return 'from-red-500 to-orange-500';
    if (streakDays >= 3) return 'from-orange-500 to-yellow-500';
    return 'from-yellow-500 to-yellow-600';
  };

  const getStreakIcon = () => {
    if (streakDays >= 7) return Trophy;
    if (streakDays >= 3) return Flame;
    return Star;
  };

  const Icon = getStreakIcon();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={cn(
        'flex items-center space-x-1 px-2 py-1 rounded-full',
        `bg-gradient-to-r ${getStreakColor()} shadow-lg`,
        className
      )}
    >
      <Icon className="h-3 w-3 text-white" />
      <span className="text-xs font-bold text-white">{streakDays}</span>
    </motion.div>
  );
};

interface CompletionRingProps {
  percentage: number;
  size?: 'small' | 'medium' | 'large';
  strokeWidth?: number;
  showPercentage?: boolean;
  className?: string;
}

export const CompletionRing: React.FC<CompletionRingProps> = ({
  percentage,
  size = 'medium',
  strokeWidth = 3,
  showPercentage = true,
  className
}) => {
  const sizes = {
    small: { dimension: 40, fontSize: 'text-xs' },
    medium: { dimension: 56, fontSize: 'text-sm' },
    large: { dimension: 72, fontSize: 'text-base' }
  };

  const { dimension, fontSize } = sizes[size];
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage === 100) return '#10b981'; // green-500
    if (percentage >= 75) return '#f59e0b'; // amber-500
    if (percentage >= 50) return '#fb923c'; // orange-400
    return '#64748b'; // slate-500
  };

  return (
    <div className={cn('relative', className)}>
      <svg
        className="transform -rotate-90"
        width={dimension}
        height={dimension}
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={getColor()}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      
      {showPercentage && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          fontSize
        )}>
          <span className="font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

interface WeekProgressBarProps {
  weekCards: Array<{
    completed: boolean;
    tasks: Array<{ completed: boolean }>;
  }>;
  className?: string;
}

export const WeekProgressBar: React.FC<WeekProgressBarProps> = ({ weekCards, className }) => {
  const totalTasks = weekCards.reduce((sum, card) => sum + card.tasks.length, 0);
  const completedTasks = weekCards.reduce((sum, card) => 
    sum + card.tasks.filter(task => task.completed).length, 0
  );
  const weekCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Week Progress</span>
        <span>{completedTasks}/{totalTasks} tasks</span>
      </div>
      <div className="w-full bg-black/40 backdrop-blur-sm rounded-full h-2 shadow-inner border border-orange-500/20 overflow-hidden">
        <motion.div 
          className="bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 h-full rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${weekCompletion}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
        </motion.div>
      </div>
    </div>
  );
};