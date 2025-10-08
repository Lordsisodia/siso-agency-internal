import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

type ColorScheme = 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red';

interface AnimatedDateHeaderProps {
  selectedDate: Date;
  earnedXP?: number;
  potentialXP?: number;
  currentLevel?: number;
  streakDays?: number;
  badgeCount?: number;
  className?: string;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
  colorScheme?: ColorScheme;
}

const colorSchemes = {
  orange: { from: 'from-orange-500', via: 'via-orange-400', to: 'to-yellow-400', text: 'text-orange-400', bg: 'bg-orange-500', glow: 'bg-orange-400/30' },
  yellow: { from: 'from-yellow-500', via: 'via-yellow-400', to: 'to-amber-400', text: 'text-yellow-400', bg: 'bg-yellow-500', glow: 'bg-yellow-400/30' },
  green: { from: 'from-green-500', via: 'via-emerald-400', to: 'to-teal-400', text: 'text-green-400', bg: 'bg-green-500', glow: 'bg-green-400/30' },
  blue: { from: 'from-blue-500', via: 'via-blue-400', to: 'to-cyan-400', text: 'text-blue-400', bg: 'bg-blue-500', glow: 'bg-blue-400/30' },
  purple: { from: 'from-purple-500', via: 'via-purple-400', to: 'to-indigo-400', text: 'text-purple-400', bg: 'bg-purple-500', glow: 'bg-purple-400/30' },
  pink: { from: 'from-pink-500', via: 'via-pink-400', to: 'to-rose-400', text: 'text-pink-400', bg: 'bg-pink-500', glow: 'bg-pink-400/30' },
  red: { from: 'from-red-500', via: 'via-red-400', to: 'to-orange-400', text: 'text-red-400', bg: 'bg-red-500', glow: 'bg-red-400/30' },
};

export const AnimatedDateHeader: React.FC<AnimatedDateHeaderProps> = ({
  selectedDate,
  earnedXP = 0,
  potentialXP = 0,
  currentLevel = 1,
  streakDays = 0,
  badgeCount = 0,
  className = '',
  onPreviousDate,
  onNextDate,
  colorScheme = 'orange'
}) => {
  const colors = colorSchemes[colorScheme];
  // Navigation props validation (development only)
  if (process.env.NODE_ENV === 'development') {
    // Only log if there's an issue with navigation props
    if ((!onPreviousDate || !onNextDate) && (onPreviousDate || onNextDate)) {
      console.warn('⚠️ AnimatedDateHeader - Incomplete navigation props:', {
        hasPrevious: !!onPreviousDate,
        hasNext: !!onNextDate,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
    }
  }
  
  // Smart date display logic
  const dateInfo = useMemo(() => {
    let relativeDay = '';
    let emoji = '';
    
    if (isToday(selectedDate)) {
      relativeDay = 'Today';
      emoji = '🌟';
    } else if (isTomorrow(selectedDate)) {
      relativeDay = 'Tomorrow';
      emoji = '🚀';
    } else if (isYesterday(selectedDate)) {
      relativeDay = 'Yesterday';
      emoji = '📊';
    } else {
      // For other days, just show the day name
      relativeDay = format(selectedDate, 'EEEE');
      emoji = '📅';
    }
    
    const formattedDate = format(selectedDate, 'MMM dd, yyyy');
    const fullDate = format(selectedDate, 'EEEE, MMMM dd, yyyy');
    
    return { relativeDay, emoji, formattedDate, fullDate };
  }, [selectedDate]);

  // Calculate current level from XP (simple calculation)
  const totalXP = earnedXP + potentialXP;
  const progressToNextLevel = earnedXP % 100; // Every 100 XP = new level
  const actualLevel = Math.floor(earnedXP / 100) + 1;
  
  // Calculate time-based progress for today (6 AM to 11 PM = 17 hour active day)
  const dayProgress = useMemo(() => {
    if (!isToday(selectedDate)) return 0;
    
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(6, 0, 0, 0); // 6:00 AM
    const dayEnd = new Date(now);
    dayEnd.setHours(23, 0, 0, 0); // 11:00 PM
    
    if (now < dayStart) return 0; // Before 6 AM
    if (now > dayEnd) return 100; // After 11 PM
    
    const totalDayMs = dayEnd.getTime() - dayStart.getTime();
    const elapsedMs = now.getTime() - dayStart.getTime();
    return Math.min(100, Math.max(0, (elapsedMs / totalDayMs) * 100));
  }, [selectedDate]);
  
  return (
    <motion.div
      className={`bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-6 shadow-2xl ${className}`}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Left: Level Circle + Date with Navigation */}
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${colors.bg} to-${colorScheme}-600 rounded-full flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xl font-bold">{actualLevel}</span>
            </div>
            {/* Level indicator glow */}
            <div className={`absolute inset-0 ${colors.glow} rounded-full blur-md animate-pulse`} />
          </motion.div>
          
          <div className="flex items-center gap-3">
            {/* Previous Date Button - Small and subtle */}
            {onPreviousDate && (
              <motion.button
                onClick={onPreviousDate}
                className="w-6 h-6 text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            )}
            
            <div>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={dateInfo.relativeDay}
                  className="text-2xl font-bold text-white mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  {dateInfo.relativeDay}
                </motion.h1>
              </AnimatePresence>
              
              <motion.p
                className="text-gray-400 text-sm flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Calendar className="h-3 w-3" />
                {dateInfo.formattedDate}
              </motion.p>
            </div>
            
            {/* Next Date Button - Small and subtle */}
            {onNextDate && (
              <motion.button
                onClick={onNextDate}
                className="w-6 h-6 text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-6">
          {/* Streak */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className={`flex items-center gap-1 ${colors.text} mb-1`}>
              <Flame className="h-4 w-4" />
              <span className="font-bold">{streakDays}</span>
            </div>
          </motion.div>
          
          {/* Badges */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-1 text-yellow-400 mb-1">
              <Trophy className="h-4 w-4" />
              <span className="font-bold">{badgeCount}</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Row: XP Progress */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">
            {earnedXP} XP {isToday(selectedDate) ? 'today' : 'total'}
          </span>
          <span className="text-gray-400 text-sm">Level {actualLevel}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-700/60 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${colors.from} ${colors.via} ${colors.to} rounded-full relative`}
              initial={{ width: 0 }}
              animate={{ width: `${isToday(selectedDate) ? dayProgress : (progressToNextLevel / 100) * 100}%` }}
              transition={{ delay: 1.1, duration: 1.2, ease: "easeOut" }}
            >
              {/* Progress bar glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.from}/50 ${colors.to}/50 blur-sm`} />
            </motion.div>
          </div>
          
          {isToday(selectedDate) && (
            <motion.div
              className="text-xs text-gray-500 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              {potentialXP > 0 && `+${potentialXP} XP available • `}
              {Math.round(dayProgress)}% through the day
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function to calculate level from XP
export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

// Helper function to calculate XP needed for next level
export const xpToNextLevel = (xp: number): number => {
  const currentLevelXP = xp % 100;
  return 100 - currentLevelXP;
};