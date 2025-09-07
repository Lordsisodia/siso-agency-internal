import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Calendar } from 'lucide-react';
import { MobileTodayCard } from '../mobile/MobileTodayCard';

interface TodayProgressSectionProps {
  todayCard: any;
  onViewDetails: (card: any) => void;
  onQuickAdd: () => void;
  onTaskToggle: (taskId: string) => void;
  onCustomTaskAdd: (task: { title: string; priority: 'low' | 'medium' | 'high' }) => void;
}

export const TodayProgressSection: React.FC<TodayProgressSectionProps> = ({
  todayCard,
  onViewDetails,
  onQuickAdd,
  onTaskToggle,
  onCustomTaskAdd
}) => {
  return (
    <div className="space-y-6">
      {/* Life Lock Header */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border border-orange-400/20 p-6 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-300/20">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Life<span className="text-orange-400">Lock</span>
            </h1>
            <p className="text-gray-300 text-sm">Your daily command center</p>
          </div>
        </div>
      </div>

      {/* Morning Routine Card */}
      <MobileTodayCard
        card={todayCard}
        onViewDetails={onViewDetails}
        onQuickAdd={onQuickAdd}
        onTaskToggle={onTaskToggle}
        onCustomTaskAdd={onCustomTaskAdd}
      />

      {/* Today's Progress Enhanced Display */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/15 to-orange-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-12 border border-orange-500/30 shadow-2xl shadow-orange-500/10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4 shadow-lg shadow-orange-500/25">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Today's Progress
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Track your daily momentum and achievements
            </p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-orange-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Active Session</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Day {Math.floor((new Date().getTime() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24)) + 1} of 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};