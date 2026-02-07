/**
 * Quantifiable Subtask Component
 *
 * Unified checkbox + tracker for measurable morning routine items.
 * Combines the satisfaction of checking with precise tracking.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantifiableSubtaskProps {
  title: string;
  unit: string;
  goal?: number;
  value: number;
  onChange: (value: number) => void;
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
  incrementStep?: number;
  quickAddButtons?: number[];
}

export const QuantifiableSubtask: React.FC<QuantifiableSubtaskProps> = ({
  title,
  unit,
  goal,
  value,
  onChange,
  checked,
  onCheckChange,
  incrementStep = 1,
  quickAddButtons = []
}) => {
  const isComplete = value > 0;
  const progressPercent = goal && goal > 0 ? Math.min(100, (value / goal) * 100) : 0;

  // Note: Auto-check logic removed to prevent conflicts with manual checkbox toggle
  // The parent component now handles the relationship between value and checked state

  return (
    <div className="space-y-2">
      {/* Main Row: Checkbox + Title + Tracker - Compact inline layout */}
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-1 rounded-lg transition-all duration-200",
          "border border-transparent",
          isComplete
            ? "bg-orange-900/10 border-orange-600/20"
            : "bg-transparent hover:bg-orange-900/5"
        )}
      >
        {/* Checkbox - Visual confirmation - ROUNDED */}
        <motion.button
          onClick={() => onCheckChange(!checked)}
          className={cn(
            "flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200",
            "flex items-center justify-center",
            checked
              ? "bg-orange-500 border-orange-500"
              : "border-orange-400/50 hover:border-orange-400"
          )}
          whileTap={{ scale: 0.95 }}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </motion.button>

        {/* Title - More compact */}
        <span
          className={cn(
            "text-sm font-medium transition-all duration-200 flex-shrink-0",
            checked ? "text-orange-200/70 line-through" : "text-orange-100"
          )}
        >
          {title}
        </span>

        {/* Progress mini bar (if goal set) - takes remaining space */}
        {goal && goal > 0 && (
          <div className="flex-1 mx-2">
            <div className="h-1.5 bg-orange-900/30 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progressPercent >= 100
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : "bg-gradient-to-r from-orange-400 to-orange-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tracker Controls - Compact */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Decrement */}
          <motion.button
            onClick={() => onChange(Math.max(0, value - incrementStep))}
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center",
              "border border-orange-600/50 text-orange-400",
              "hover:bg-orange-900/30 transition-colors",
              value === 0 && "opacity-50 cursor-not-allowed"
            )}
            whileTap={{ scale: 0.9 }}
            disabled={value === 0}
          >
            <Minus className="w-3 h-3" />
          </motion.button>

          {/* Value Display - Compact */}
          <div className="min-w-[50px] text-center px-1">
            <span className="text-orange-100 font-semibold text-sm">
              {value}
            </span>
            <span className="text-orange-400/60 text-[10px] ml-0.5">{unit}</span>
          </div>

          {/* Increment */}
          <motion.button
            onClick={() => onChange(value + incrementStep)}
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center",
              "border border-orange-600/50 text-orange-400",
              "hover:bg-orange-900/30 transition-colors"
            )}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-3 h-3" />
          </motion.button>

          {/* Quick Add Buttons - More compact */}
          {quickAddButtons.slice(0, 1).map((amount) => (
            <motion.button
              key={amount}
              onClick={() => onChange(value + amount)}
              className={cn(
                "h-6 px-1.5 rounded text-[10px] font-medium",
                "border border-orange-600/50 text-orange-400",
                "hover:bg-orange-900/30 transition-colors"
              )}
              whileTap={{ scale: 0.9 }}
            >
              +{amount}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Goal reached indicator - subtle */}
      {goal && goal > 0 && value >= goal && (
        <div className="px-1">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-green-400 font-medium"
          >
            Goal reached! 🎯
          </motion.span>
        </div>
      )}
    </div>
  );
};
