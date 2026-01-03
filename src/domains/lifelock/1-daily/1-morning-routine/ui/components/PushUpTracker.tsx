/**
 * Push-Up Tracker Component
 *
 * Tracks daily push-up reps with automatic Personal Best (PB) tracking.
 * Part of "Get Blood Flowing" section in morning routine.
 */

import React from 'react';
import { Button } from '@/components/ui/button';

interface PushUpTrackerProps {
  reps: number;
  personalBest: number;
  onUpdateReps: (reps: number) => void;
}

export const PushUpTracker: React.FC<PushUpTrackerProps> = ({
  reps,
  personalBest,
  onUpdateReps
}) => {
  return (
    <div className="mt-2 mb-3 flex justify-center">
      <div className="w-64">
        <div className="space-y-2">
          {/* Rep counter with buttons */}
          <div className="flex items-center space-x-2 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateReps(Math.max(0, reps - 1))}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs"
            >
              -1
            </Button>
            <div className="flex-1 text-center">
              <div className="text-yellow-100 font-bold text-base">
                {reps} reps
              </div>
              <div className="text-[10px] text-yellow-400/60">Today</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateReps(reps + 1)}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs"
            >
              +1
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateReps(reps + 5)}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs"
            >
              +5
            </Button>
          </div>

          {/* PB Display */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-yellow-400/60">Personal Best:</span>
            <span className="text-yellow-300 font-bold">{personalBest} reps</span>
          </div>

          {/* New PB celebration */}
          {reps > 0 && reps === personalBest && reps > 30 && (
            <div className="text-center text-xs text-green-400 font-semibold animate-pulse">
              🎉 New Personal Best!
            </div>
          )}
        </div>
        <p className="text-[10px] text-yellow-400/50 mt-1 text-center">
          Use buttons to track reps - PB auto-updates when beaten
        </p>
      </div>
    </div>
  );
};
