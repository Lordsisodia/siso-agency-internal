/**
 * Day Progress Bar Component
 *
 * Horizontal mini-timeline showing day's progress with color-coded segments
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Hourglass } from 'lucide-react';

export interface DaySegment {
  id: string;
  category: string;
  widthPercent: number;
  status: 'completed' | 'current' | 'upcoming';
  duration: number;
  title: string;
}

export interface DayProgress {
  segments: DaySegment[];
  totalPlannedMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  currentTimePercent: number;
  plannedHours: number;
  doneHours: number;
  leftHours: number;
}

interface DayProgressBarProps {
  dayProgress: DayProgress;
}

// Category color mapping
const CATEGORY_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  'morning': {
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    glow: 'shadow-amber-500/50'
  },
  'deep-work': {
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    glow: 'shadow-blue-500/50'
  },
  'light-work': {
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    glow: 'shadow-emerald-500/50'
  },
  'wellness': {
    bg: 'bg-teal-500',
    border: 'border-teal-400',
    glow: 'shadow-teal-500/50'
  },
  'admin': {
    bg: 'bg-indigo-500',
    border: 'border-indigo-400',
    glow: 'shadow-indigo-500/50'
  }
};

const getCategoryColors = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['admin'];
};

const getStatusOpacity = (status: string): number => {
  switch (status) {
    case 'completed':
      return 1;
    case 'current':
      return 1;
    case 'upcoming':
      return 0.5;
    default:
      return 0.5;
  }
};

const DayProgressBarComponent: React.FC<DayProgressBarProps> = ({ dayProgress }) => {
  const { segments, currentTimePercent, plannedHours, doneHours, leftHours } = dayProgress;

  // Don't render if no tasks
  if (segments.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      {/* Progress Bar Container */}
      <div className="relative">
        {/* Main Progress Bar */}
        <div className="h-4 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden flex">
          {segments.map((segment, index) => {
            const colors = getCategoryColors(segment.category);
            const opacity = getStatusOpacity(segment.status);
            const isCurrent = segment.status === 'current';

            return (
              <motion.div
                key={segment.id}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                style={{
                  width: `${segment.widthPercent}%`,
                  opacity
                }}
                className={`
                  h-full relative
                  ${colors.bg}
                  ${isCurrent ? 'animate-pulse' : ''}
                  ${index === 0 ? 'rounded-l-full' : ''}
                  ${index === segments.length - 1 ? 'rounded-r-full' : ''}
                `}
                title={`${segment.title} (${Math.round(segment.duration / 60 * 10) / 10}h) - ${segment.status}`}
              >
                {/* Subtle border between segments */}
                {index > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-white/20" />
                )}

                {/* Current task indicator */}
                {isCurrent && (
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* "You are here" marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${currentTimePercent}%` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          {/* Marker dot */}
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-lg shadow-sky-500/50" />
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-sky-500/30 animate-ping" />
          </div>

          {/* Tooltip */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="bg-sky-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-lg">
              You are here
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {/* Planned */}
          <div className="flex items-center gap-1.5 text-white/60">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{plannedHours}h planned</span>
          </div>

          {/* Divider */}
          <div className="w-px h-3 bg-white/20" />

          {/* Done */}
          <div className="flex items-center gap-1.5 text-white/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className={doneHours > 0 ? 'text-green-400' : ''}>{doneHours}h done</span>
          </div>

          {/* Divider */}
          <div className="w-px h-3 bg-white/20" />

          {/* Left */}
          <div className="flex items-center gap-1.5 text-white/60">
            <Hourglass className="w-3.5 h-3.5 text-amber-400" />
            <span>{leftHours}h left</span>
          </div>
        </div>

        {/* Completion percentage */}
        <div className="text-white/40">
          {plannedHours > 0 ? Math.round((doneHours / plannedHours) * 100) : 0}% complete
        </div>
      </div>
    </div>
  );
};

export const DayProgressBar = memo(DayProgressBarComponent);
