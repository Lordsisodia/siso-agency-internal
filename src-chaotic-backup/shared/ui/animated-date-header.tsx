import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Calendar, Zap, TrendingUp } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { OfflineIndicator } from '@/shared/components/OfflineIndicator';

interface AnimatedDateHeaderProps {
  selectedDate: Date;
  earnedXP?: number;
  potentialXP?: number;
  currentLevel?: number;
  streakDays?: number;
  badgeCount?: number;
  className?: string;
}

export const AnimatedDateHeader: React.FC<AnimatedDateHeaderProps> = ({
  selectedDate,
  earnedXP = 0,
  potentialXP = 0,
  currentLevel = 1,
  streakDays = 0,
  badgeCount = 0,
  className = ''
}) => {
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
    
    const formattedDate = format(selectedDate, 'MMM dd');
    const fullDate = format(selectedDate, 'EEEE, MMMM dd, yyyy');
    
    return { relativeDay, emoji, formattedDate, fullDate };
  }, [selectedDate]);

  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-900/50 via-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Date Section */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-3xl"
          >
            {dateInfo.emoji}
          </motion.div>
          
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.h1
                key={dateInfo.relativeDay}
                className="text-2xl md:text-3xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {dateInfo.relativeDay}
              </motion.h1>
            </AnimatePresence>
            
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-400 text-sm md:text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {dateInfo.formattedDate}
              </p>
              
              {/* Offline Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <OfflineIndicator />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right: XP Section */}
        <div className="text-right">
          <motion.div
            className="flex items-center gap-2 justify-end mb-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
          >
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl md:text-3xl font-bold text-yellow-400">
              {earnedXP}
            </span>
            <span className="text-lg text-yellow-300/80">XP</span>
          </motion.div>
          
          {potentialXP > 0 && (
            <motion.div
              className="flex items-center gap-1 justify-end text-sm text-gray-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <TrendingUp className="h-3 w-3" />
              <span>+{potentialXP} potential</span>
            </motion.div>
          )}
          
          <motion.div
            className="text-xs text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            {isToday(selectedDate) ? 'Earned Today' : 
             isTomorrow(selectedDate) ? 'Available Tomorrow' :
             isYesterday(selectedDate) ? 'Earned Yesterday' : 
             'Total XP'}
          </motion.div>
        </div>
      </div>
      
      {/* Progress bar for today */}
      {isToday(selectedDate) && potentialXP > 0 && (
        <motion.div
          className="mt-4 pt-4 border-t border-gray-700/50"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Daily Progress</span>
            <span>{Math.round((earnedXP / (earnedXP + potentialXP)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedXP / (earnedXP + potentialXP)) * 100}%` }}
              transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
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