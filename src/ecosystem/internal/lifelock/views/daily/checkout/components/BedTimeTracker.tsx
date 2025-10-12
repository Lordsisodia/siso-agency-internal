/**
 * Bed Time Tracker Component
 * Similar pattern to WakeUpTimeTracker from morning routine
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Clock } from 'lucide-react';

interface BedTimeTrackerProps {
  time: string;
  isEditing: boolean;
  onChange: (time: string) => void;
  onToggleEdit: () => void;
  onUseNow: () => void;
  getCurrentTime: () => string;
}

export const BedTimeTracker: React.FC<BedTimeTrackerProps> = ({
  time,
  isEditing,
  onChange,
  onToggleEdit,
  onUseNow,
  getCurrentTime
}) => {
  return (
    <div className="space-y-2">
      {time && !isEditing ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-transparent border border-purple-700/50 rounded-md px-3 py-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <span className="text-purple-100 font-semibold">
              Bed time: {time}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleEdit}
            className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
          >
            Edit
          </Button>
        </div>
      ) : null}

      {(!time || isEditing) && (
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter bed time (e.g., 11:30 PM)"
            value={time}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border-purple-700/50 text-purple-100 text-sm placeholder:text-gray-400 focus:border-purple-600 flex-1"
          />
          <Button
            size="sm"
            onClick={onUseNow}
            className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap"
          >
            Use Now ({getCurrentTime()})
          </Button>
        </div>
      )}
    </div>
  );
};
