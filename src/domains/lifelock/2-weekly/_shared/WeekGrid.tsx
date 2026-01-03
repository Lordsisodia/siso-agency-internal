/**
 * WeekGrid Component
 * 
 * Displays a 7-day grid with performance indicators
 */

import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DailyData } from './types';

interface WeekGridProps {
  dailyData: DailyData[];
  className?: string;
}

const getGradeColor = (grade: string): string => {
  if (grade.startsWith('A')) return 'from-green-500/20 to-emerald-500/20 border-green-500/40';
  if (grade.startsWith('B')) return 'from-blue-500/20 to-sky-500/20 border-blue-500/40';
  if (grade.startsWith('C')) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40';
  return 'from-red-500/20 to-rose-500/20 border-red-500/40';
};

const getGradeTextColor = (grade: string): string => {
  if (grade.startsWith('A')) return 'text-green-400';
  if (grade.startsWith('B')) return 'text-blue-400';
  if (grade.startsWith('C')) return 'text-yellow-400';
  return 'text-red-400';
};

export const WeekGrid: React.FC<WeekGridProps> = ({ dailyData, className }) => {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {dailyData.map((day, idx) => (
        <motion.div
          key={day.date.toISOString()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={cn(
            'relative group cursor-pointer',
            'bg-gradient-to-br rounded-xl p-3',
            'border transition-all duration-200',
            'hover:scale-105 hover:shadow-lg',
            getGradeColor(day.grade)
          )}
        >
          {/* Day name */}
          <div className="text-xs font-semibold text-gray-300 mb-1">
            {format(day.date, 'EEE')}
          </div>
          
          {/* Date */}
          <div className="text-xs text-gray-400 mb-2">
            {format(day.date, 'MMM d')}
          </div>
          
          {/* Grade */}
          <div className={cn('text-2xl font-bold mb-1', getGradeTextColor(day.grade))}>
            {day.grade}
          </div>
          
          {/* XP */}
          <div className="text-xs text-gray-300">
            {day.xpEarned} XP
          </div>
          
          {/* Completion percentage */}
          <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1.5">
            <motion.div
              className={cn('h-1.5 rounded-full', 
                day.completionPercentage >= 90 ? 'bg-green-500' :
                day.completionPercentage >= 75 ? 'bg-blue-500' :
                day.completionPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${day.completionPercentage}%` }}
              transition={{ delay: idx * 0.05 + 0.2, duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {day.completionPercentage}%
          </div>
        </motion.div>
      ))}
    </div>
  );
};
