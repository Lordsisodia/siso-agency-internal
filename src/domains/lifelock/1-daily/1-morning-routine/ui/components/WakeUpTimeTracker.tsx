/**
 * Wake Up Time Tracker Component
 *
 * Tracks wake-up time with TimeScrollPicker integration and "Use Now" quick action.
 * Part of "Wake Up" task in morning routine.
 *
 * COLOR: Orange theme
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface WakeUpTimeTrackerProps {
  time: string;
  onOpenPicker: () => void;
  onUseNow: () => void;
}

export const WakeUpTimeTracker: React.FC<WakeUpTimeTrackerProps> = ({
  time,
  onOpenPicker,
  onUseNow
}) => {

  return (
    <div className="mt-2">
      {time ? (
        <div
          onClick={onOpenPicker}
          className="group flex items-center justify-between px-3 py-2 bg-orange-900/10 border border-orange-700/30 rounded-md cursor-pointer hover:bg-orange-900/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-400" />
            <span className="text-orange-100 font-semibold">{time}</span>
          </div>
          <span className="text-xs text-orange-400/60 group-hover:text-orange-400">Edit</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenPicker}
            className="flex-1 bg-orange-900/10 border border-orange-700/30 text-orange-400 hover:bg-orange-900/20 h-10"
          >
            <Clock className="h-4 w-4 mr-2" />
            Set Time
          </Button>
          <Button
            onClick={onUseNow}
            className="bg-orange-600 hover:bg-orange-700 text-white h-10 px-4"
          >
            Now
          </Button>
        </div>
      )}
    </div>
  );
};
