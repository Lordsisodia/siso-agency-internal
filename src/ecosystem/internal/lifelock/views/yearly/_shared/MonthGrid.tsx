/**
 * MonthGrid Component
 * 
 * Displays a 12-month grid with performance indicators
 */

import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { MonthData } from './types';

interface MonthGridProps {
  months: MonthData[];
  onMonthClick?: (month: Date) => void;
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

export const MonthGrid: React.FC<MonthGridProps> = ({ months, onMonthClick, className }) => {
  return (
    <div className={cn('grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3', className)}>
      {months.map((month, idx) => (
        <motion.div
          key={month.month.toISOString()}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className={cn(
            'relative group cursor-pointer',
            'bg-gradient-to-br rounded-xl p-3 sm:p-4',
            'border transition-all duration-200',
            'hover:scale-105 hover:shadow-lg',
            getGradeColor(month.grade),
            month.isCurrent && 'ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-900'
          )}
          onClick={() => onMonthClick?.(month.month)}
        >
          {/* Month name */}
          <div className="text-xs sm:text-sm font-semibold text-gray-300 mb-1">
            {month.name.slice(0, 3)}
          </div>
          
          {/* Grade */}
          <div className={cn('text-xl sm:text-2xl font-bold mb-1', getGradeTextColor(month.grade))}>
            {month.grade}
          </div>
          
          {/* Completion percentage */}
          <div className="text-xs text-gray-400 mb-2">
            {month.completionPercentage}%
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            <motion.div
              className={cn('h-1.5 rounded-full', 
                month.completionPercentage >= 90 ? 'bg-green-500' :
                month.completionPercentage >= 80 ? 'bg-blue-500' :
                month.completionPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${month.completionPercentage}%` }}
              transition={{ delay: idx * 0.05 + 0.2, duration: 0.5 }}
            />
          </div>
          
          {/* Current month indicator */}
          {month.isCurrent && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              NOW
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
