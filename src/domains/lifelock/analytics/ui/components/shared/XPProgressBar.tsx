/**
 * XP Progress Bar Component
 *
 * Horizontal progress bar with gradient and animation
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  value: number; // 0-100
  maxValue?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  gradient?: string;
  backgroundColor?: string;
  showAnimation?: boolean;
  className?: string;
}

const SIZE_STYLES = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function XPProgressBar({
  value,
  maxValue = 100,
  showLabel = false,
  label,
  size = 'md',
  gradient = 'from-indigo-500 to-purple-500',
  backgroundColor = 'bg-white/10',
  showAnimation = true,
  className,
}: XPProgressBarProps) {
  const normalizedValue = Math.min(maxValue, Math.max(0, value));
  const percent = (normalizedValue / maxValue) * 100;
  const sizeClass = SIZE_STYLES[size];

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-400">{label}</span>}
          {showLabel && (
            <span className="text-sm font-semibold text-white">
              {normalizedValue}/{maxValue}
            </span>
          )}
        </div>
      )}

      <div className={cn('relative w-full rounded-full overflow-hidden', backgroundColor, sizeClass)}>
        <motion.div
          className={cn('h-full bg-gradient-to-r rounded-full relative overflow-hidden', gradient)}
          initial={showAnimation ? { width: 0 } : { width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-200%', '200%'] }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
