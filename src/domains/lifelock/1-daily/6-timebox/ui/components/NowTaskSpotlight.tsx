/**
 * Now Task Spotlight Component
 *
 * Sticky header showing current or next upcoming task with Focus Mode
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2, Clock, Plus, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CurrentTaskInfo, TimeboxTask } from '../../domain/types';
import { getTaskColor, formatTimeDisplay } from '../../domain/utils';

interface NowTaskSpotlightProps {
  currentTaskInfo: CurrentTaskInfo;
  onToggleComplete: (taskId: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
  onExtend: (taskId: string, minutes: number) => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

export const NowTaskSpotlight: React.FC<NowTaskSpotlightProps> = ({
  currentTaskInfo,
  onToggleComplete,
  onSnooze,
  onExtend,
  isFocusMode,
  onToggleFocusMode
}) => {
  const { task, isCurrent, timeRemaining, nextTask } = currentTaskInfo;

  // Determine which task to display (current or next)
  const displayTask = task || nextTask;
  const isNextTask = !task && !!nextTask;

  // If no task at all, don't show the spotlight
  if (!displayTask) {
    return null;
  }

  const taskColorClass = getTaskColor(displayTask.category, displayTask.completed);
  const leadingEmojiMatch = displayTask.title.match(/^(\p{Extended_Pictographic}+)\s+(.*)$/u);
  const leadingEmoji = leadingEmojiMatch?.[1] ?? null;
  const titleWithoutEmoji = leadingEmojiMatch?.[2] ?? displayTask.title;

  // Format time remaining
  const formatTimeRemaining = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min remaining`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m remaining` : `${hours}h remaining`;
  };

  // Format time range
  const timeRange = `${formatTimeDisplay(displayTask.startTime)} - ${formatTimeDisplay(displayTask.endTime)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 px-3 py-3"
    >
      <Card
        className={cn(
          "relative overflow-hidden border-2 backdrop-blur-md transition-all duration-500",
          isFocusMode ? "shadow-2xl shadow-sky-500/30 border-sky-500/50" : "shadow-lg"
        )}
      >
        {/* Gradient Background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r",
            taskColorClass
          )}
        />

        {/* Focus Mode Overlay */}
        <AnimatePresence>
          {isFocusMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative p-4">
          {/* Header Row: Status Badge and Focus Mode Toggle */}
          <div className="flex items-center justify-between mb-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                isCurrent
                  ? "bg-green-500/90 text-white shadow-lg shadow-green-500/30"
                  : isNextTask
                    ? "bg-amber-500/90 text-white shadow-lg shadow-amber-500/30"
                    : "bg-slate-500/90 text-white"
              )}
            >
              {isCurrent ? 'Now' : isNextTask ? 'Next Up' : 'Task'}
            </motion.div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFocusMode}
              className={cn(
                "h-8 px-2 text-xs font-medium transition-all duration-300",
                isFocusMode
                  ? "bg-sky-500/30 text-sky-200 hover:bg-sky-500/40 hover:text-sky-100"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              )}
            >
              {isFocusMode ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                  Focus On
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Focus
                </>
              )}
            </Button>
          </div>

          {/* Task Title */}
          <div className="mb-2">
            <h2 className="text-xl font-bold text-white leading-tight">
              {leadingEmoji && (
                <span className="mr-2">{leadingEmoji}</span>
              )}
              {titleWithoutEmoji}
            </h2>
          </div>

          {/* Time Info */}
          <div className="flex items-center gap-2 text-sm text-white/80 mb-4">
            <Clock className="h-4 w-4" />
            <span>{timeRange}</span>
            <span className="text-white/50">•</span>
            <span className={cn(
              "font-medium",
              isCurrent && timeRemaining < 15 && "text-amber-300",
              isCurrent && timeRemaining < 5 && "text-red-300"
            )}>
              {isCurrent
                ? formatTimeRemaining(timeRemaining)
                : `${displayTask.duration} min`
              }
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Complete Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggleComplete(displayTask.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                displayTask.completed
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-green-500/90 text-white hover:bg-green-500 shadow-lg shadow-green-500/20"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              {displayTask.completed ? 'Completed' : 'Complete'}
            </motion.button>

            {/* Snooze Button (+15m) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSnooze(displayTask.id, 15)}
              disabled={displayTask.completed}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                displayTask.completed
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-amber-500/80 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/20"
              )}
            >
              <Clock className="h-4 w-4" />
              +15m
            </motion.button>

            {/* Extend Button (+30m) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onExtend(displayTask.id, 30)}
              disabled={displayTask.completed}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                displayTask.completed
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-blue-500/80 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              +30m
            </motion.button>
          </div>

          {/* Progress Bar for Current Task */}
          {isCurrent && (
            <div className="mt-4">
              <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/90 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((displayTask.duration - timeRemaining) / displayTask.duration) * 100}%`
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
