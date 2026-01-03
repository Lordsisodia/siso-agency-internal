/**
 * XP Footer Summary Component
 *
 * Shows complete XP breakdown at bottom of morning routine
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Trophy, Target } from 'lucide-react';

interface XPBreakdown {
  wakeUp: number;
  freshenUp: number;
  getBloodFlowing: number;
  powerUpBrain: number;
  planDay: number;
  meditation: number;
  priorities: number;
  bonuses: {
    freshenUpSpeed?: number;
    pushupPB?: number;
    pushupSpeed?: number;
    weekend?: boolean;
  };
}

interface XPFooterSummaryProps {
  breakdown: XPBreakdown;
  totalXP: number;
}

export const XPFooterSummary: React.FC<XPFooterSummaryProps> = ({ breakdown, totalXP }) => {
  const hasBonuses =
    (breakdown.bonuses.freshenUpSpeed || 0) > 0 ||
    (breakdown.bonuses.pushupPB || 0) > 0 ||
    (breakdown.bonuses.pushupSpeed || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-6"
    >
      <Card className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-700/40">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center text-yellow-300 text-base">
            <Trophy className="h-5 w-5 mr-2" />
            📊 Today's XP Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 text-sm">
            {/* Individual task XP */}
            {breakdown.wakeUp > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-100/90">Wake Up</span>
                <span className="text-yellow-300 font-bold">{breakdown.wakeUp} XP 💎</span>
              </div>
            )}

            {breakdown.freshenUp > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-100/90">
                  Freshen Up
                  {breakdown.bonuses.freshenUpSpeed && <span className="text-xs text-green-300 ml-2">🎁 +{breakdown.bonuses.freshenUpSpeed} speed</span>}
                </span>
                <span className="text-blue-300 font-bold">{breakdown.freshenUp} XP ⚡</span>
              </div>
            )}

            {breakdown.getBloodFlowing > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-100/90">
                  Get Blood Flowing
                  {breakdown.bonuses.pushupPB && <span className="text-xs text-purple-300 ml-2">🏆 +{breakdown.bonuses.pushupPB} PB</span>}
                  {breakdown.bonuses.pushupSpeed && <span className="text-xs text-green-300 ml-2">⚡ +{breakdown.bonuses.pushupSpeed} speed</span>}
                </span>
                <span className="text-purple-300 font-bold">{breakdown.getBloodFlowing} XP 💪</span>
              </div>
            )}

            {breakdown.powerUpBrain > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-100/90">Power Up Brain</span>
                <span className="text-blue-300 font-bold">{breakdown.powerUpBrain} XP 🧠</span>
              </div>
            )}

            {breakdown.planDay > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-100/90">Plan Day</span>
                <span className="text-green-300 font-bold">{breakdown.planDay} XP 📅</span>
              </div>
            )}

            {breakdown.meditation > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-100/90">Meditation</span>
                <span className="text-purple-300 font-bold">{breakdown.meditation} XP 🧘</span>
              </div>
            )}

            {breakdown.priorities > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-100/90">Top 3 Priorities</span>
                <span className="text-green-300 font-bold">{breakdown.priorities} XP 🎯</span>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-yellow-600/30 pt-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-yellow-200 font-semibold">Total XP Today</span>
                <span className="text-yellow-300 font-bold text-lg">{totalXP} XP 🏆</span>
              </div>
            </div>

            {/* Bonus summary */}
            {hasBonuses && (
              <div className="mt-3 p-3 bg-yellow-900/10 border border-yellow-600/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-yellow-200 font-medium">Bonus XP Earned</span>
                </div>
                <div className="space-y-1 text-xs text-yellow-100/80">
                  {breakdown.bonuses.freshenUpSpeed && (
                    <div>🎁 Freshen Up Speed: +{breakdown.bonuses.freshenUpSpeed} XP</div>
                  )}
                  {breakdown.bonuses.pushupPB && (
                    <div>🏆 New Push-up PB: +{breakdown.bonuses.pushupPB} XP</div>
                  )}
                  {breakdown.bonuses.pushupSpeed && (
                    <div>⚡ Get Blood Flowing Speed: +{breakdown.bonuses.pushupSpeed} XP</div>
                  )}
                  {breakdown.bonuses.weekend && (
                    <div>🎉 Weekend Bonus: +20% XP</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
