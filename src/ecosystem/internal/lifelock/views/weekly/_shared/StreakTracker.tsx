/**
 * StreakTracker Component
 * 
 * Visual display of active streaks
 */

import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface Streak {
  name: string;
  count: number;
  emoji: string;
}

interface StreakTrackerProps {
  streaks: Streak[];
  className?: string;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ streaks, className }) => {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {streaks.map((streak, idx) => (
        <motion.div
          key={streak.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className={cn(
            'relative bg-gradient-to-br from-orange-500/10 to-red-500/10',
            'border border-orange-500/30 rounded-xl p-3',
            'hover:scale-105 transition-all duration-200',
            'hover:shadow-lg hover:shadow-orange-500/20'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{streak.emoji}</span>
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {streak.count}
          </div>
          
          <div className="text-xs text-gray-300 font-medium">
            {streak.name}
          </div>
          
          {streak.count >= 7 && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
              🔥 Hot!
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
