/**
 * QuarterCard Component
 * 
 * Displays quarterly performance summary
 */

import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { QuarterData } from './types';

interface QuarterCardProps {
  quarter: QuarterData;
  index: number;
  className?: string;
}

const getQuarterColor = (grade: string): string => {
  if (grade.startsWith('A')) return 'from-green-500/10 to-emerald-500/10 border-green-500/30';
  if (grade.startsWith('B')) return 'from-blue-500/10 to-sky-500/10 border-blue-500/30';
  return 'from-yellow-500/10 to-amber-500/10 border-yellow-500/30';
};

const getGradeTextColor = (grade: string): string => {
  if (grade.startsWith('A')) return 'text-green-400';
  if (grade.startsWith('B')) return 'text-blue-400';
  return 'text-yellow-400';
};

export const QuarterCard: React.FC<QuarterCardProps> = ({ quarter, index, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'bg-gradient-to-br rounded-xl p-4 sm:p-6 border',
        'transition-all duration-200 hover:scale-105 hover:shadow-lg',
        getQuarterColor(quarter.grade),
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-gray-300">
          {quarter.name}
        </div>
        <div className={cn('text-2xl font-bold', getGradeTextColor(quarter.grade))}>
          {quarter.grade}
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Avg Completion:</span>
          <span className="font-semibold text-gray-300">{quarter.averageCompletion}%</span>
        </div>
        <div className="flex justify-between">
          <span>Total XP:</span>
          <span className="font-semibold text-gray-300">{quarter.totalXP.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Best Month:</span>
          <span className="font-semibold text-gray-300">{format(quarter.bestMonth, 'MMM')}</span>
        </div>
      </div>

      <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full',
            quarter.averageCompletion >= 90 ? 'bg-green-500' :
            quarter.averageCompletion >= 80 ? 'bg-blue-500' :
            'bg-yellow-500'
          )}
          style={{ width: `${quarter.averageCompletion}%` }}
        />
      </div>
    </motion.div>
  );
};
