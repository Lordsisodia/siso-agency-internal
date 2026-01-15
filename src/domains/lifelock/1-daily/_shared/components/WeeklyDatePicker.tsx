/**
 * WeeklyDatePicker Component
 *
 * A weekly date picker inspired by fitness/health apps with:
 * - Day headers (Mon-Sun) at the top
 * - Date pills aligned below each day
 * - Hides bottom navigation when open
 * - Clean, modern dark theme
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, isSameWeek } from 'date-fns';
import { cn } from '@/lib/utils';

export interface WeeklyDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  // Optional: Map of dates to completion percentages for indicators
  dateCompletionMap?: Record<string, number>;
}

export const WeeklyDatePicker: React.FC<WeeklyDatePickerProps> = ({
  selectedDate,
  onDateChange,
  isOpen,
  onClose,
  className = '',
  dateCompletionMap = {}
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(selectedDate, { weekStartsOn: 1 }));

  // Update current week when selected date changes
  useEffect(() => {
    if (!isSameWeek(selectedDate, currentWeekStart, { weekStartsOn: 1 })) {
      setCurrentWeekStart(startOfWeek(selectedDate, { weekStartsOn: 1 }));
    }
  }, [selectedDate, currentWeekStart]);

  // Generate the week dates
  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(currentWeekStart, i));
    }
    return dates;
  }, [currentWeekStart]);

  // Day headers
  const dayHeaders = useMemo(() => {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }, []);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    onClose();
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    onDateChange(today);
    onClose();
  };

  return (
    <>
      {/* Hide bottom nav when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Main Picker Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-[70] bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl shadow-2xl',
              className
            )}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    {format(currentWeekStart, 'MMMM yyyy')}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Navigation arrows */}
                  <motion.button
                    onClick={handlePreviousWeek}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>

                  <motion.button
                    onClick={handleNextWeek}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>

                  <motion.button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all ml-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {dayHeaders.map((day) => (
                  <div key={day} className="text-center">
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wide">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Date Pills */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const isSelected = isSameDay(date, selectedDate);
                  const isDayToday = isToday(date);
                  const completion = dateCompletionMap[dateKey] || 0;

                  return (
                    <motion.button
                      key={dateKey}
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        'relative flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-200',
                        isSelected
                          ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                          : 'bg-white/5 hover:bg-white/10'
                      )}
                      whileHover={{ scale: isSelected ? 1.02 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Date number */}
                      <span className={cn(
                        'text-lg font-bold',
                        isSelected ? 'text-white' : 'text-white/90'
                      )}>
                        {format(date, 'd')}
                      </span>

                      {/* Today indicator */}
                      {isDayToday && (
                        <div className="mt-1">
                          <span className={cn(
                            'text-[10px] font-medium',
                            isSelected ? 'text-white/80' : 'text-blue-400'
                          )}>
                            Today
                          </span>
                        </div>
                      )}

                      {/* Completion dot indicator */}
                      {!isDayToday && completion > 0 && (
                        <div className="mt-1.5 flex gap-0.5">
                          {completion >= 100 && (
                            <div className="w-1 h-1 rounded-full bg-green-400" />
                          )}
                          {completion >= 50 && completion < 100 && (
                            <div className="w-1 h-1 rounded-full bg-yellow-400" />
                          )}
                          {completion < 50 && completion > 0 && (
                            <div className="w-1 h-1 rounded-full bg-orange-400" />
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="px-5 pb-8 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={handleToday}
                  className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Today
                </motion.button>

                <motion.button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium text-sm transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Done
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

WeeklyDatePicker.displayName = 'WeeklyDatePicker';
