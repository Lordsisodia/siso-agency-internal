import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPPillProps {
  xp: number;                       // XP value to display
  maxXP?: number;                   // Maximum XP for the bar (default: 1000)
  icon?: React.ReactNode;           // Optional custom icon
  label?: string;                   // Default: "XP"
  className?: string;
  activeTab?: string;               // For dynamic coloring
}

export const XPPill: React.FC<XPPillProps> = ({
  xp = 0,
  maxXP = 1000,
  icon,
  label = "XP",
  className = '',
  activeTab = 'timebox'
}) => {
  // Calculate XP percentage for the progress bar
  const xpPercentage = Math.min(100, Math.max(0, (xp / maxXP) * 100));
  // Dynamic color system based on active tab
  const getTabColors = useMemo(() => {
    switch (activeTab) {
      case 'morning':
        return {
          gradient: 'from-orange-500 to-amber-400'
        };
      case 'work':
        return {
          gradient: 'from-blue-500 to-cyan-400'
        };
      case 'light-work':
        return {
          gradient: 'from-emerald-500 to-teal-400'
        };
      case 'timebox':
        return {
          gradient: 'from-blue-500 to-cyan-400'
        };
      case 'wellness':
        return {
          gradient: 'from-rose-500 to-pink-400'
        };
      case 'checkout':
        return {
          gradient: 'from-purple-500 to-pink-400'
        };
      case 'diet':
        return {
          gradient: 'from-green-500 to-emerald-400'
        };
      // Health section
      case 'stats':
        return {
          gradient: 'from-emerald-500 to-green-400'
        };
      case 'fitness':
        return {
          gradient: 'from-rose-500 to-orange-400'
        };
      case 'nutrition':
        return {
          gradient: 'from-amber-500 to-orange-400'
        };
      default:
        return {
          gradient: 'from-blue-500 to-cyan-400'
        };
    }
  }, [activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-white/5 border border-white/10 rounded-full px-3.5 py-2.5"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2.5">
        {/* Icon with colored background */}
        <div className={cn(
          'w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
          getTabColors.gradient
        )}>
          {icon || <Trophy className="h-3.5 w-3.5 text-white" />}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Text Row */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-gray-400">
              {label}
            </span>
            <span className="text-[11px] font-medium text-white">
              {xp.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden relative shadow-inner">
            <motion.div
              className={cn(
                'h-full bg-gradient-to-r rounded-full relative overflow-hidden',
                getTabColors.gradient
              )}
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
            >
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{
                  duration: 2,
                  ease: "linear",
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
              />
              {/* Strong pulsing glow effect */}
              <motion.div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
                  'blur-md'
                )}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.03, 1]
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
              />
              {/* Additional outer glow */}
              <motion.div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
                  'blur-lg'
                )}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

XPPill.displayName = 'XPPill';
