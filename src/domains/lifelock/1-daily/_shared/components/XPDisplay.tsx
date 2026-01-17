import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPDisplayProps {
  xp: number;
  icon?: React.ReactNode;
  className?: string;
  activeTab?: string;
}

export const XPDisplay: React.FC<XPDisplayProps> = ({
  xp = 0,
  icon,
  className = '',
  activeTab = 'timebox'
}) => {
  // Dynamic color system based on active tab
  const getTabColors = useMemo(() => {
    switch (activeTab) {
      case 'morning':
        return {
          gradient: 'from-orange-500 to-amber-400',
          text: 'text-orange-400'
        };
      case 'work':
        return {
          gradient: 'from-blue-500 to-cyan-400',
          text: 'text-cyan-400'
        };
      case 'light-work':
        return {
          gradient: 'from-emerald-500 to-teal-400',
          text: 'text-teal-400'
        };
      case 'timebox':
        return {
          gradient: 'from-indigo-500 to-cyan-400',
          text: 'text-cyan-400'
        };
      case 'wellness':
        return {
          gradient: 'from-rose-500 to-pink-400',
          text: 'text-pink-400'
        };
      case 'checkout':
        return {
          gradient: 'from-purple-500 to-pink-400',
          text: 'text-pink-400'
        };
      case 'diet':
        return {
          gradient: 'from-green-500 to-emerald-400',
          text: 'text-emerald-400'
        };
      default:
        return {
          gradient: 'from-indigo-500 to-cyan-400',
          text: 'text-cyan-400'
        };
    }
  }, [activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10',
        className
      )}
    >
      {/* Icon with colored background */}
      <div className={cn(
        'w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
        getTabColors.gradient
      )}>
        {icon || <Trophy className="h-3 w-3 text-white" />}
      </div>

      {/* XP Value */}
      <span className={cn(
        'text-sm font-semibold',
        getTabColors.text
      )}>
        +{xp.toLocaleString()}
      </span>
    </motion.div>
  );
};

XPDisplay.displayName = 'XPDisplay';
