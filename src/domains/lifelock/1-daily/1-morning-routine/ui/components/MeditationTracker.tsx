/**
 * Meditation Tracker Component
 *
 * Tracks daily meditation duration with +/- buttons and full-screen timer.
 * Part of "Meditation" task in morning routine.
 *
 * ENHANCED: Duration presets, streak tracking, actionable tips
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Timer, X, Flame } from 'lucide-react';
import { MeditationTimer } from './MeditationTimer';
import { cn } from '@/lib/utils';

interface MeditationTrackerProps {
  duration: string;
  onChange: (duration: string) => void;
  selectedDate?: Date;
  streak?: number; // Consecutive days meditated
  lastSession?: string; // Last session duration for comparison
}

const DURATION_PRESETS = [
  { minutes: 2, label: '2 min', recommended: true },
  { minutes: 5, label: '5 min', recommended: false },
  { minutes: 10, label: '10 min', recommended: false },
  { minutes: 15, label: '15 min', recommended: false },
];

export const MeditationTracker: React.FC<MeditationTrackerProps> = ({
  duration,
  onChange,
  selectedDate,
  streak = 0,
  lastSession
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

  const handleClear = () => {
    onChange('');
  };

  const handlePresetClick = (minutes: number) => {
    onChange(minutes.toString());
  };

  const handleTimerComplete = (durationMinutes: number) => {
    onChange(durationMinutes.toString());
    setShowTimer(false);
  };

  // Get actionable tip based on state
  const getTip = () => {
    const currentMins = parseInt(duration) || 0;

    if (currentMins === 0) {
      return '💡 Tip: Even 2 minutes of meditation boosts focus & clarity!';
    }
    if (currentMins < 5) {
      return '✨ Great start! Try extending to 5 min for deeper benefits.';
    }
    if (currentMins < 10) {
      return '🧘 Excellent! You\'re building a solid meditation practice.';
    }
    return '🔥 Wow! Dedicated practice - you\'re crushing it!';
  };

  const currentMins = parseInt(duration) || 0;

  return (
    <>
      <div className="mt-2 flex justify-center">
        <div className="w-full max-w-sm">
          <div className="space-y-3">
            {/* Duration Presets */}
            <div className="flex flex-wrap gap-2 justify-center">
              {DURATION_PRESETS.map((preset) => {
                const isSelected = currentMins === preset.minutes;
                return (
                  <button
                    key={preset.minutes}
                    onClick={() => handlePresetClick(preset.minutes)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95",
                      isSelected
                        ? "bg-orange-600/30 border-2 border-orange-400/60 text-orange-200 shadow-lg shadow-orange-500/20"
                        : "bg-orange-900/20 border border-orange-600/40 text-orange-300 hover:bg-orange-900/30 hover:border-orange-500/50"
                    )}
                  >
                    {preset.recommended && !isSelected && '⭐ '}
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom duration display and controls */}
            {!DURATION_PRESETS.some(p => p.minutes === currentMins) && currentMins > 0 && (
              <div className="flex items-center space-x-2 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDecrement}
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs active:scale-95 transition-transform"
                >
                  -1
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-yellow-100 font-bold text-base">
                    {currentMins} min
                  </div>
                  <div className="text-[10px] text-yellow-400/60">Custom</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleIncrement}
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs active:scale-95 transition-transform"
                >
                  +1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleIncrementFive}
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 px-2 flex-shrink-0 text-xs active:scale-95 transition-transform"
                >
                  +5
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClear}
                  className="border-red-600/50 text-red-400 hover:bg-red-900/20 hover:border-red-500 h-7 px-2 flex-shrink-0 active:scale-95 transition-transform"
                  title="Clear meditation time"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Streak badge */}
            {streak > 0 && (
              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs text-orange-300 font-medium">
                  {streak} day streak{streak > 1 ? '!' : ''}
                </span>
              </div>
            )}

            {/* Last session comparison */}
            {lastSession && (
              <div className="text-xs text-gray-400 text-center">
                Last session: {lastSession}
              </div>
            )}

            {/* Timer Button */}
            <Button
              onClick={() => setShowTimer(true)}
              className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 active:scale-95 transition-transform"
            >
              <Timer className="h-4 w-4 mr-2" />
              Open Meditation Timer
            </Button>
          </div>

          {/* Actionable tip */}
          <p className="text-[10px] text-yellow-400/70 mt-2 text-center italic">
            {getTip()}
          </p>
        </div>
      </div>

      {/* Full-Screen Meditation Timer */}
      <MeditationTimer
        isOpen={showTimer}
        onClose={() => setShowTimer(false)}
        onComplete={handleTimerComplete}
        selectedDate={selectedDate}
      />
    </>
  );
};
