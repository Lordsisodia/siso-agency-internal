/**
 * ⏱️ TaskTimer Component
 *
 * Simple, clean timer for tracking time on tasks
 * Shows in task detail modal
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTaskTimer } from '@/lib/hooks/useTaskTimer';
import { motion } from 'framer-motion';

interface TaskTimerProps {
  taskId: string;
  userId: string;
  timeblockId?: string;
  estimatedDuration?: number; // minutes
  onSessionComplete?: (totalSeconds: number) => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({
  taskId,
  userId,
  timeblockId,
  estimatedDuration,
  onSessionComplete
}) => {
  const {
    isActive,
    isPaused,
    formattedTime,
    elapsedSeconds,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getTotalTimeSpent,
    isRunning,
    canStart,
    canPause,
    canResume,
    canStop
  } = useTaskTimer({
    taskId,
    userId,
    timeblockId,
    onSessionComplete: (session) => {
      onSessionComplete?.(session.totalSeconds);
    }
  });

  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [showVariance, setShowVariance] = useState(false);

  // Load total time spent on mount
  useEffect(() => {
    getTotalTimeSpent().then(setTotalTimeSpent);
  }, [getTotalTimeSpent]);

  // Calculate variance
  const estimatedSeconds = (estimatedDuration || 0) * 60;
  const actualSeconds = totalTimeSpent + elapsedSeconds;
  const varianceSeconds = actualSeconds - estimatedSeconds;
  const variancePercent = estimatedSeconds > 0
    ? Math.round((varianceSeconds / estimatedSeconds) * 100)
    : 0;

  const handleStop = async () => {
    const session = await stopTimer();
    if (session) {
      // Refresh total time
      const newTotal = await getTotalTimeSpent();
      setTotalTimeSpent(newTotal);
    }
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-6">
      <div className="text-center space-y-4">
        {/* Timer Display */}
        <div className="relative">
          <motion.div
            className={cn(
              "text-6xl font-mono font-bold tracking-tight",
              isRunning ? "text-green-400" : isPaused ? "text-yellow-400" : "text-gray-400"
            )}
            animate={isRunning ? {
              scale: [1, 1.02, 1],
            } : {}}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {formattedTime}
          </motion.div>

          {/* Status Badge */}
          <div className="absolute -top-2 -right-2">
            <Badge
              className={cn(
                "text-xs font-medium",
                isRunning && "bg-green-500/20 text-green-300 border-green-500/40",
                isPaused && "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
                !isActive && "bg-gray-500/20 text-gray-400 border-gray-500/40"
              )}
            >
              {isRunning ? "🔴 LIVE" : isPaused ? "⏸️ PAUSED" : "⭘ NOT STARTED"}
            </Badge>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          {canStart && (
            <Button
              onClick={startTimer}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Timer
            </Button>
          )}

          {canPause && (
            <Button
              onClick={pauseTimer}
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}

          {canResume && (
            <Button
              onClick={resumeTimer}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
          )}

          {canStop && (
            <Button
              onClick={handleStop}
              size="lg"
              variant="outline"
              className="border-red-500/40 text-red-300 hover:bg-red-500/20 px-8"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop & Save
            </Button>
          )}
        </div>

        {/* Time Comparison */}
        {estimatedDuration && (
          <div className="pt-4 border-t border-gray-700/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Estimated</div>
                <div className="text-lg font-semibold text-white">
                  {estimatedDuration}m
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Actual (Total)</div>
                <div className="text-lg font-semibold text-white">
                  {Math.round((totalTimeSpent + elapsedSeconds) / 60)}m
                </div>
              </div>
            </div>

            {/* Variance Indicator */}
            {actualSeconds > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowVariance(!showVariance)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showVariance ? 'Hide' : 'Show'} variance
                </button>

                {showVariance && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-2 rounded-full transition-all',
                          varianceSeconds <= 0 ? 'bg-green-500' :
                          variancePercent < 20 ? 'bg-yellow-500' :
                          'bg-red-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.abs(variancePercent))}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className={cn(
                      "text-xs mt-1",
                      varianceSeconds <= 0 ? 'text-green-400' :
                      variancePercent < 20 ? 'text-yellow-400' :
                      'text-red-400'
                    )}>
                      {varianceSeconds <= 0
                        ? `${Math.abs(Math.round(varianceSeconds / 60))}m under estimate`
                        : `${Math.round(varianceSeconds / 60)}m over estimate (${variancePercent > 0 ? '+' : ''}${variancePercent}%)`
                      }
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Session Info */}
        {isActive && (
          <div className="text-xs text-gray-500 pt-2">
            Started: {state.startedAt?.toLocaleTimeString()}
            {state.interruptions > 0 && ` • ${state.interruptions} interruption${state.interruptions > 1 ? 's' : ''}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTimer;
