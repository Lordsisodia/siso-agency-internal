/**
 * Personal Bests Card
 *
 * Displays all-time records: best day, week, month, and total
 */

import { motion } from 'framer-motion';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PersonalBests } from '../../../types/xpAnalytics.types';

interface PersonalBestsCardProps {
  data: PersonalBests;
}

const RECORDS = [
  { key: 'day', icon: Trophy, color: 'from-yellow-500 to-amber-400', bgColor: 'bg-yellow-500/10', label: 'Best Day' },
  { key: 'week', icon: Award, color: 'from-purple-500 to-violet-400', bgColor: 'bg-purple-500/10', label: 'Best Week' },
  { key: 'month', icon: Medal, color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-500/10', label: 'Best Month' },
  { key: 'total', icon: Star, color: 'from-green-500 to-emerald-400', bgColor: 'bg-green-500/10', label: 'Total XP' },
] as const;

export function PersonalBestsCard({ data }: PersonalBestsCardProps) {
  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Personal Bests</h3>
          <p className="text-sm text-gray-400">All-time records</p>
        </div>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-2 gap-4">
        {RECORDS.map((record, index) => {
          const Icon = record.icon;
          const recordData = data[record.key] as { xp: number; dateFormatted?: string; formatted?: string };

          return (
            <motion.div
              key={record.key}
              className={cn('relative overflow-hidden rounded-xl p-4 border', record.bgColor, 'border-white/10')}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              {/* Background gradient */}
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-20', record.color)} />

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('w-4 h-4', record.color.split(' ')[0].replace('from-', 'text-'))} />
                  <span className="text-xs font-medium text-gray-400">{record.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{recordData.xp.toLocaleString()} XP</p>
                <p className="text-xs text-gray-500 mt-1">
                  {recordData.dateFormatted || recordData.formatted}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
