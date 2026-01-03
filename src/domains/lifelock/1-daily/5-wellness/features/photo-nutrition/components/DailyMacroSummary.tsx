/**
 * Daily Macro Summary Component
 * Auto-aggregated totals from all photos (no manual input needed)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import type { DailyMacroTotals } from '../types';

interface DailyMacroSummaryProps {
  totals: DailyMacroTotals;
  goals?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export const DailyMacroSummary: React.FC<DailyMacroSummaryProps> = ({
  totals,
  goals
}) => {
  const calculateProgress = (current: number, goal?: number) => {
    if (!goal) return 0;
    return Math.min(100, (current / goal) * 100);
  };

  const MacroBar = ({
    label,
    value,
    unit,
    goal,
    color
  }: {
    label: string;
    value: number;
    unit: string;
    goal?: number;
    color: string;
  }) => {
    const progress = calculateProgress(value, goal);

    return (
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-medium text-pink-200">{label}</span>
          <div className="text-right">
            <span className="text-xl font-bold text-pink-100">{value}</span>
            <span className="text-sm text-pink-400 ml-1">{unit}</span>
            {goal && (
              <span className="text-xs text-pink-500 ml-2">/ {goal}{unit}</span>
            )}
          </div>
        </div>

        {goal && (
          <div className="w-full bg-pink-950/50 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${color}`}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-pink-900/30 to-pink-950/30 border-2 border-pink-600/40 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-pink-400" />
        <h3 className="text-lg font-semibold text-pink-300">
          Daily Totals
        </h3>
        <span className="ml-auto text-xs text-pink-500 bg-pink-950/50 px-2 py-1 rounded-full">
          {totals.photoCount} {totals.photoCount === 1 ? 'meal' : 'meals'}
        </span>
      </div>

      {/* Macro Bars */}
      <div className="space-y-4">
        <MacroBar
          label="Calories"
          value={totals.calories}
          unit=""
          goal={goals?.calories}
          color="bg-gradient-to-r from-pink-500 to-pink-600"
        />
        <MacroBar
          label="Protein"
          value={totals.protein}
          unit="g"
          goal={goals?.protein}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <MacroBar
          label="Carbs"
          value={totals.carbs}
          unit="g"
          goal={goals?.carbs}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <MacroBar
          label="Fats"
          value={totals.fats}
          unit="g"
          goal={goals?.fats}
          color="bg-gradient-to-r from-amber-500 to-amber-600"
        />
      </div>

      {/* Empty State Message */}
      {totals.photoCount === 0 && (
        <div className="text-center py-4 text-pink-400/60 text-sm">
          Add your first meal photo to start tracking
        </div>
      )}
    </motion.div>
  );
};
