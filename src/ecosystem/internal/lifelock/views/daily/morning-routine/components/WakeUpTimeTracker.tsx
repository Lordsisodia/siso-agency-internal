/**
 * Wake Up Time Tracker Component
 *
 * Tracks wake-up time with TimeScrollPicker integration and "Use Now" quick action.
 * Part of "Wake Up" task in morning routine.
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Clock } from 'lucide-react';

interface WakeUpTimeTrackerProps {
  time: string;
  onTimeChange: (time: string) => void;
  onOpenPicker: () => void;
  onUseNow: () => void;
  getCurrentTime: () => string;
}

export const WakeUpTimeTracker: React.FC<WakeUpTimeTrackerProps> = ({
  time,
  onTimeChange,
  onOpenPicker,
  onUseNow,
  getCurrentTime
}) => {
  return (
    <div className="mt-2">
      <div className="space-y-2">
        {time ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-transparent border border-yellow-700/50 rounded-md px-3 py-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-100 font-semibold">
                Woke up at: {time}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenPicker}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
            >
              Edit
            </Button>
          </div>
        ) : null}

        {!time && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenPicker}
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Set Wake-up Time
            </Button>
            <Button
              size="sm"
              onClick={onUseNow}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm px-2 sm:px-4"
            >
              Now ({getCurrentTime()})
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-400 italic">
          Track your wake-up time to build better morning routine habits.
        </p>
      </div>
    </div>
  );
};
