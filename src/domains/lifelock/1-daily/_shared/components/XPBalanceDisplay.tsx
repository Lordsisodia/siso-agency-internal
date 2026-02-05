import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.span
      className={`text-white font-semibold text-sm ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {formattedXP} <span className="text-white/50 text-xs">XP</span>
    </motion.span>
  );
};

XPBalanceDisplay.displayName = 'XPBalanceDisplay';
