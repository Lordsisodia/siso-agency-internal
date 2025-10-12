/**
 * Water Tracker Component
 *
 * Tracks daily water intake with +/- 100ml increment buttons.
 * Part of "Power Up Brain" section in morning routine.
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Minus, Plus } from 'lucide-react';

interface WaterTrackerProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  value,
  onIncrement,
  onDecrement
}) => {
  return (
    <div className="mt-2 mb-3 flex justify-center">
      <div className="w-64">
        <div className="flex items-center space-x-2 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <Button
            size="sm"
            variant="outline"
            onClick={onDecrement}
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 w-7 p-0 flex-shrink-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="flex-1 text-center">
            <div className="text-yellow-100 font-bold text-base">{value}ml</div>
            <div className="text-[10px] text-yellow-400/60">Daily intake</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onIncrement}
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30 h-7 w-7 p-0 flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-[10px] text-yellow-400/50 mt-1 text-center">
          Click + to add 100ml or - to remove 100ml
        </p>
      </div>
    </div>
  );
};
