import React from 'react';
import { motion } from 'framer-motion';

interface DailyXPSummaryWidgetProps {
  morningXP: number;
  lightWorkXP: number;
  deepWorkXP: number;
  wellnessXP: number;
  checkoutXP: number;
}

const DAILY_TARGET = 500; // soft target for progress visualization

export const DailyXPSummaryWidget: React.FC<DailyXPSummaryWidgetProps> = ({
  morningXP,
  lightWorkXP,
  deepWorkXP,
  wellnessXP,
  checkoutXP
}) => {
  const totalXP = morningXP + lightWorkXP + deepWorkXP + wellnessXP + checkoutXP;
  const progress = Math.min(totalXP / DAILY_TARGET, 1);
  const progressPercent = Math.round(progress * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/60">
          <span>Today&apos;s XP</span>
          <span>{totalXP.toLocaleString()} XP</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 shadow-[0_0_12px_rgba(168,85,247,0.45)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
          <span>{progressPercent}% of 500 XP goal</span>
          <span>Goal: {DAILY_TARGET} XP</span>
        </div>
      </div>
    </motion.div>
  );
};
