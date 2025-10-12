/**
 * Meditation Tracker Component
 *
 * Tracks daily meditation duration with +/- buttons.
 * Part of "Meditation" task in morning routine.
 */

import React from 'react';
import { Button } from '@/shared/ui/button';

interface MeditationTrackerProps {
  duration: string;
  onChange: (duration: string) => void;
}

export const MeditationTracker: React.FC<MeditationTrackerProps> = ({
  duration,
  onChange
}) => {
  const handleDecrement = () => {
    const current = parseInt(duration) || 0;
    onChange(Math.max(0, current - 1).toString());
  };

  const handleIncrement = () => {
    const current = parseInt(duration) || 0;
    onChange((current + 1).toString());
  };

  const handleIncrementFive = () => {
    const current = parseInt(duration) || 0;
    onChange((current + 5).toString());
  };

  return (
    <div className="mt-2 flex justify-center">
      <div className="w-64">
        <div className="space-y-2">
          {/* Duration display and controls */}
          <div className="flex items-center space-x-2 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecrement}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs"
            >
              -1
            </Button>
            <div className="flex-1 text-center">
              <div className="text-yellow-100 font-bold text-base">
                {duration || '0'} min
              </div>
              <div className="text-[10px] text-yellow-400/60">Duration</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleIncrement}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs"
            >
              +1
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleIncrementFive}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs"
            >
              +5
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-yellow-400/50 mt-1 text-center">
          Track actual meditation time - use buttons to adjust
        </p>
      </div>
    </div>
  );
};
