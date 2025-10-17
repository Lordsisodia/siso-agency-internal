/**
 * Meditation Tracker Component
 *
 * Tracks daily meditation duration with +/- buttons and full-screen timer.
 * Part of "Meditation" task in morning routine.
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Timer } from 'lucide-react';
import { MeditationTimer } from './MeditationTimer';

interface MeditationTrackerProps {
  duration: string;
  onChange: (duration: string) => void;
}

export const MeditationTracker: React.FC<MeditationTrackerProps> = ({
  duration,
  onChange
}) => {
  const [showTimer, setShowTimer] = useState(false);

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

  const handleTimerComplete = (durationMinutes: number) => {
    onChange(durationMinutes.toString());
    setShowTimer(false);
  };

  return (
    <>
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

            {/* Timer Button */}
            <Button
              onClick={() => setShowTimer(true)}
              className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300"
            >
              <Timer className="h-4 w-4 mr-2" />
              Open Meditation Timer
            </Button>
          </div>
          <p className="text-[10px] text-yellow-400/50 mt-1 text-center">
            Use timer for guided session or adjust manually
          </p>
        </div>
      </div>

      {/* Full-Screen Meditation Timer */}
      <MeditationTimer
        isOpen={showTimer}
        onClose={() => setShowTimer(false)}
        onComplete={handleTimerComplete}
      />
    </>
  );
};
