import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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
  const totalXP = morningXP + lightWorkXP + deepWorkXP + wellnessXP + checkoutXP;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      <div className="w-full rounded-2xl bg-white/6 border border-white/12 backdrop-blur-xl px-5 py-4 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-md" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Today&apos;s XP</p>
              <p className="text-sm text-white/50">Keep stacking wins</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[30px] leading-none font-semibold text-white">
              {totalXP.toLocaleString()}
            </span>
            <span className="ml-1 text-sm font-medium text-white/60">XP</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
