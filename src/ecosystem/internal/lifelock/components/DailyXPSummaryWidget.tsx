/**
 * Daily XP Summary Widget - Collapsible
 * Shows today's XP breakdown at bottom of LifeLock Daily
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/ui/card';
import { ChevronDown, ChevronUp, Trophy, Zap } from 'lucide-react';
import { GamificationService } from '@/services/gamificationService';

interface DailyXPSummaryWidgetProps {
  date: Date;
  morningXP: number;
  lightWorkXP: number;
  deepWorkXP: number;
  wellnessXP: number;
  checkoutXP: number;
}

export const DailyXPSummaryWidget: React.FC<DailyXPSummaryWidgetProps> = ({
  morningXP,
  lightWorkXP,
  deepWorkXP,
  wellnessXP,
  checkoutXP
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const levelInfo = GamificationService.getLevelInfo();
  const progress = GamificationService.getUserProgress();
  const totalXP = morningXP + lightWorkXP + deepWorkXP + wellnessXP + checkoutXP;

  const sections = [
    { name: 'Morning', emoji: '🌅', xp: morningXP, color: 'text-yellow-300' },
    { name: 'Wellness', emoji: '💪', xp: wellnessXP, color: 'text-rose-300' },
    { name: 'Checkout', emoji: '🌙', xp: checkoutXP, color: 'text-purple-300' },
    { name: 'Light', emoji: '🌱', xp: lightWorkXP, color: 'text-green-300' },
    { name: 'Deep', emoji: '🧠', xp: deepWorkXP, color: 'text-blue-300' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <Card className="bg-gradient-to-br from-yellow-900/10 via-purple-900/10 to-blue-900/10 border-yellow-700/30">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-yellow-900/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-yellow-300">📊 Today's XP Summary</h3>
              {!isExpanded && (
                <p className="text-sm text-yellow-400/70">
                  {totalXP} XP • Level {levelInfo.level} • {progress.currentStreak} day streak 🔥
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-300">{totalXP} XP</div>
              <div className="text-xs text-yellow-400/60">Level {levelInfo.level}</div>
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5 text-yellow-400" /> : <ChevronDown className="h-5 w-5 text-yellow-400" />}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-6 space-y-4">
                {/* Level Progress */}
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-yellow-300">Progress to Level {levelInfo.level + 1}</span>
                    <span className="text-yellow-400/70">{levelInfo.currentXP} / {levelInfo.nextLevelXP} XP</span>
                  </div>
                  <div className="w-full bg-yellow-900/20 rounded-full h-3 border border-yellow-600/30">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all"
                      style={{ width: `${levelInfo.progress}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-yellow-600/20"></div>

                {/* XP Grid */}
                <div>
                  <h4 className="text-sm font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> XP by Section
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {sections.slice(0, 3).map(s => (
                      <div key={s.name} className="bg-black/20 border border-yellow-600/20 rounded-lg p-2 text-center">
                        <div className="text-xl">{s.emoji}</div>
                        <div className="text-xs text-gray-400">{s.name}</div>
                        <div className={`text-base font-bold ${s.color}`}>{s.xp} XP</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sections.slice(3).map(s => (
                      <div key={s.name} className="bg-black/20 border border-yellow-600/20 rounded-lg p-2 text-center">
                        <div className="text-xl">{s.emoji}</div>
                        <div className="text-xs text-gray-400">{s.name}</div>
                        <div className={`text-base font-bold ${s.color}`}>{s.xp} XP</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <div>
                      <div className="text-yellow-300 font-semibold">{progress.currentStreak} days</div>
                      <div className="text-xs text-yellow-400/60">Streak</div>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-yellow-600/30"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <div className="text-yellow-300 font-semibold">{progress.achievements.filter(a => a.unlocked).length}</div>
                      <div className="text-xs text-yellow-400/60">Achievements</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
