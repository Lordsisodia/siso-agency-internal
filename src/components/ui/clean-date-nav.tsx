import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

interface CleanDateNavProps {
  selectedDate: Date;
  className?: string;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

export const CleanDateNav: React.FC<CleanDateNavProps> = ({
  selectedDate,
  className = '',
  onPreviousDate,
  onNextDate
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
    
    const formattedDate = format(selectedDate, 'MMM dd, yyyy');
    
    return { relativeDay, emoji, formattedDate };
  }, [selectedDate]);
  
  return (
    <motion.div
      className={`bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl ${className}`}
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
    </motion.div>
  );
};