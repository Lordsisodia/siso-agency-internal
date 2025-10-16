import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap } from 'lucide-react';

interface StreakSummaryCardProps {
  streak: number;
  xp: number;
}

export const StreakSummaryCard: React.FC<StreakSummaryCardProps> = ({ streak, xp }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
    <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-4 rounded-xl border border-purple-700/30">
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-3xl">🔥</span>
            <span className="text-3xl font-bold text-purple-200">{streak}</span>
          </div>
          <p className="text-xs text-purple-400">Day Streak</p>
        </div>
        <div className="h-12 w-px bg-purple-700/50"></div>
        <div className="text-center">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-6 w-6 text-yellow-400" />
            <span className="text-3xl font-bold text-yellow-400">+{xp}</span>
          </div>
          <p className="text-xs text-yellow-300">XP Tonight</p>
        </div>
      </div>
      <Award className="h-8 w-8 text-purple-400 opacity-50" />
    </div>
  </motion.div>
);
