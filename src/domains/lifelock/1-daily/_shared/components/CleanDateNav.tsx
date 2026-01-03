import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

interface CleanDateNavProps {
  selectedDate: Date;
  completionPercentage?: number;
  className?: string;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
  activeTab?: string; // Add active tab prop for dynamic colors
  totalXP?: number; // Total XP earned today
}

export const CleanDateNav: React.FC<CleanDateNavProps> = ({
  selectedDate,
  completionPercentage = 0,
  className = '',
  onPreviousDate,
  onNextDate,
  activeTab = 'dashboard',
  totalXP
}) => {
  // Dynamic color system based on active tab
  const getTabColors = useMemo(() => {
    switch (activeTab) {
      case 'morning':
        return {
          primary: 'from-orange-500 via-yellow-400 to-amber-300',
          glow: 'bg-orange-300/50',
          shimmer: 'via-yellow-200/40',
          pulse: 'bg-orange-400/40',
          ring: 'bg-orange-400/30',
          light: 'orange-300'
        };
      case 'work':
        return {
          primary: 'from-blue-600 via-blue-400 to-cyan-300',
          glow: 'bg-blue-300/50',
          shimmer: 'via-cyan-200/40',
          pulse: 'bg-blue-400/40',
          ring: 'bg-blue-400/30',
          light: 'blue-300'
        };
      case 'light-work':
        return {
          primary: 'from-green-500 via-emerald-400 to-teal-300',
          glow: 'bg-emerald-300/50',
          shimmer: 'via-teal-200/40',
          pulse: 'bg-emerald-400/40',
          ring: 'bg-emerald-400/30',
          light: 'emerald-300'
        };
      case 'timebox':
        return {
          primary: 'from-indigo-500 via-blue-400 to-cyan-300',
          glow: 'bg-blue-300/50',
          shimmer: 'via-cyan-200/40',
          pulse: 'bg-indigo-400/40',
          ring: 'bg-indigo-400/30',
          light: 'blue-300'
        };
      case 'wellness':
        return {
          primary: 'from-rose-500 via-pink-400 to-pink-300',
          glow: 'bg-pink-300/50',
          shimmer: 'via-pink-200/40',
          pulse: 'bg-rose-400/40',
          ring: 'bg-rose-400/30',
          light: 'pink-300'
        };
      case 'checkout':
        return {
          primary: 'from-purple-500 via-purple-400 to-pink-300',
          glow: 'bg-purple-300/50',
          shimmer: 'via-purple-200/40',
          pulse: 'bg-purple-400/40',
          ring: 'bg-purple-400/30',
          light: 'purple-300'
        };
      default:
        return {
          primary: 'from-green-500 via-emerald-400 to-teal-300',
          glow: 'bg-emerald-300/50',
          shimmer: 'via-teal-200/40',
          pulse: 'bg-emerald-400/40',
          ring: 'bg-emerald-400/30',
          light: 'emerald-300'
        };
    }
  }, [activeTab]);

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
    
    return { relativeDay, emoji, formattedDate };
  }, [selectedDate]);
  
  return (
    <motion.div
      className={`bg-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between p-4">
        {/* Left Arrow */}
        <div className="flex-shrink-0">
          {onPreviousDate ? (
            <motion.button
              onClick={onPreviousDate}
              className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
          ) : (
            <div className="w-10 h-10" /> // Spacer to maintain layout
          )}
        </div>

        {/* Center Content */}
        <div className="flex-1 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={dateInfo.relativeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-white mb-1">
                {dateInfo.relativeDay}
              </h1>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                {dateInfo.formattedDate}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <div className="flex-shrink-0">
          {onNextDate ? (
            <motion.button
              onClick={onNextDate}
              className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          ) : (
            <div className="w-10 h-10" /> // Spacer to maintain layout
          )}
        </div>
      </div>

      {/* Day Completion Progress Bar */}
      {completionPercentage >= 0 && (
        <motion.div 
          className="px-4 pb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Day Progress</span>
              <span className="text-xs text-gray-300 font-medium">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            
            {/* Progress Bar Container with Enhanced Neon Effect */}
            <div className="w-full bg-gray-700/60 rounded-full h-3 overflow-hidden relative shadow-inner">
              {/* Main Progress Bar with Dynamic Colors */}
              <motion.div
                className={`h-full bg-gradient-to-r ${getTabColors.primary} rounded-full relative overflow-hidden shadow-lg`}
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }}
              >
                {/* Intense Breathing Glow Layer */}
                <motion.div 
                  className={`absolute inset-0 ${getTabColors.glow} blur-sm rounded-full`}
                  animate={{ 
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 1.8,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                />
                
                {/* Fast Neon Shimmer Wave */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r from-transparent ${getTabColors.shimmer} to-transparent rounded-full`}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 2,
                    ease: "linear",
                    repeat: Infinity,
                    repeatDelay: 0.3
                  }}
                />
                
                {/* Double Heartbeat Pulse */}
                <motion.div
                  className={`absolute inset-0 ${getTabColors.pulse} rounded-full`}
                  animate={{ 
                    opacity: [0, 0.8, 0, 0.4, 0],
                    scale: [0.96, 1.06, 0.96, 1.02, 0.96]
                  }}
                  transition={{
                    duration: 2.2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    times: [0, 0.2, 0.4, 0.7, 1]
                  }}
                />
                
                {/* Intense Outer Glow Ring */}
                <motion.div
                  className={`absolute -inset-1 ${getTabColors.ring} blur-lg rounded-full`}
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                />
                
                {/* Lightning Spark Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                  animate={{ 
                    x: ['-100%', '100%'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
                
                {/* Flowing Energy Particles */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full"
                  animate={{ 
                    x: ['-50%', '150%'],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};