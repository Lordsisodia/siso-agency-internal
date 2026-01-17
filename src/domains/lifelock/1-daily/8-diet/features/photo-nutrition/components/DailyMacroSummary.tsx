/**
 * Daily Macro Summary Component
 * Auto-aggregated totals from all photos (no manual input needed)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Check, AlertTriangle } from 'lucide-react';
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

    // Determine status pill
    const getStatusPill = () => {
      if (!goal) return null;
      if (progress >= 100) {
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30"
          >
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span className="text-xs font-semibold text-green-300">On Track</span>
          </motion.div>
        );
      }
      if (progress >= 75) {
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-300">Almost There</span>
          </motion.div>
        );
      }
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30"
        >
          <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
          <span className="text-xs font-semibold text-orange-300">Keep Going</span>
        </motion.div>
      );
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-green-100">{label}</span>
          {getStatusPill()}
        </div>

        <div className="flex justify-between items-baseline mb-3">
          <div className="text-right">
            <span className="text-2xl font-bold text-green-100 tracking-tight">{value}</span>
            <span className="text-sm font-medium text-green-400 ml-1.5">{unit}</span>
            {goal && (
              <span className="text-xs text-green-500 ml-2">/ {goal}{unit}</span>
            )}
          </div>
          {goal && (
            <span className="text-sm font-bold text-green-300">{Math.round(progress)}%</span>
          )}
        </div>

        {goal && (
          <div className="w-full bg-green-950/50 rounded-full h-2 overflow-hidden">
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
      className="bg-gradient-to-br from-green-900/30 to-green-950/30 border-2 border-green-600/40 rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-green-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-green-300">
          Daily Totals
        </h3>
        <span className="ml-auto text-xs text-green-500 bg-green-950/50 px-2 py-1 rounded-full">
          {totals.photoCount} {totals.photoCount === 1 ? 'meal' : 'meals'}
        </span>
      </div>

      {/* Macro Bars */}
      <div className="space-y-5">
        <MacroBar
          label="Calories"
          value={totals.calories}
          unit=""
          goal={goals?.calories}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <MacroBar
          label="Protein"
          value={totals.protein}
          unit="g"
          goal={goals?.protein}
          color="bg-gradient-to-r from-emerald-500 to-emerald-600"
        />
        <MacroBar
          label="Carbs"
          value={totals.carbs}
          unit="g"
          goal={goals?.carbs}
          color="bg-gradient-to-r from-teal-500 to-teal-600"
        />
        <MacroBar
          label="Fats"
          value={totals.fats}
          unit="g"
          goal={goals?.fats}
          color="bg-gradient-to-r from-lime-500 to-lime-600"
        />
      </div>

      {/* Empty State Message */}
      {totals.photoCount === 0 && (
        <div className="text-center py-4 text-green-400/60 text-sm">
          Add your first meal photo to start tracking
        </div>
      )}
    </motion.div>
  );
};
