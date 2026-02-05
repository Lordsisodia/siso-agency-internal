import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useTotalXP } from '@/domains/lifelock/_shared/hooks/useTotalXP';

interface XPBalanceDisplayProps {
  className?: string;
}

export const XPBalanceDisplay: React.FC<XPBalanceDisplayProps> = ({
  className = ''
}) => {
  const totalXP = useTotalXP();

  // Format XP with comma separators (e.g., 2,450)
  const formattedXP = totalXP.toLocaleString();

  return (
    <motion.div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      <span className="text-white font-semibold text-sm">
        {formattedXP} <span className="hidden sm:inline">XP</span>
      </span>
    </motion.div>
  );
};

XPBalanceDisplay.displayName = 'XPBalanceDisplay';
