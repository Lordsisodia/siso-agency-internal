/**
 * CalendarGrid Component
 * 
 * 31-day calendar grid with performance indicators
 */

import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { DayData } from './types';

interface CalendarGridProps {
  days: DayData[];
  onDayClick?: (date: Date) => void;
  className?: string;
}

const getCompletionColor = (completion: number): string => {
  if (completion >= 95) return 'bg-gradient-to-br from-green-500 to-emerald-600 text-white';
  if (completion >= 85) return 'bg-gradient-to-br from-green-600 to-green-700 text-white';
  if (completion >= 75) return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
  if (completion >= 65) return 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white';
  return 'bg-gradient-to-br from-red-500 to-rose-600 text-white';
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({ days, onDayClick, className }) => {
  // Add empty slots for days before month starts
  const firstDayOfMonth = days[0]?.date.getDay() || 0;
  const emptySlots = Array(firstDayOfMonth).fill(null);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-gray-400 text-center">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm">
        {/* Empty slots before month starts */}
        {emptySlots.map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Actual days */}
        {days.map((day, idx) => (
          <motion.div
            key={day.date.toISOString()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.01 }}
            className={cn(
              'aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer',
              'transition-all duration-200 hover:scale-110 hover:shadow-lg relative',
              getCompletionColor(day.completionPercentage),
              day.isToday && 'ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-900'
            )}
            onClick={() => onDayClick?.(day.date)}
          >
            <div className="font-bold text-sm sm:text-base">
              {day.date.getDate()}
            </div>
            <div className="text-xs opacity-90">
              {day.grade}
            </div>
            
            {day.events.length > 0 && (
              <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
