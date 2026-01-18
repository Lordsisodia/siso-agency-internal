/**
 * Circular Progress Component
 *
 * Animated circular progress ring for displaying XP progress
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  gradient?: string;
  backgroundColor?: string;
  showAnimation?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  gradient = 'from-indigo-500 to-purple-500',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showAnimation = true,
  className,
  children,
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${size})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={showAnimation ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          className="drop-shadow-lg"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${size}`} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={gradient.includes('from-') ? gradient.split('from-')[1]?.split('-')[0]?.replace(' to-', ' ')?.split(' ')[0] === '500' ? '#6366F1' : '#8B5CF6' : '#6366F1'} />
            <stop offset="100%" stopColor={gradient.includes('to-') ? gradient.split('to-')[1]?.split('-')[0]?.replace(' ', '') === '400' ? '#A78BFA' : '#EC4899' : '#EC4899'} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
