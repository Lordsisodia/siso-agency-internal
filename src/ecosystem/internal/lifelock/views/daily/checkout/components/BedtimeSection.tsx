import React from 'react';
import { Moon } from 'lucide-react';

import { Button } from '@/shared/ui/button';

interface BedtimeSectionProps {
  bedTime: string;
  isEditing: boolean;
  onEditChange: (value: boolean) => void;
  onBedTimeChange: (value: string) => void;
  onUseCurrentTime: () => void;
  getCurrentTimeLabel: () => string;
}

export const BedtimeSection: React.FC<BedtimeSectionProps> = ({
  bedTime,
  isEditing,
  onEditChange,
  onBedTimeChange,
  onUseCurrentTime,
  getCurrentTimeLabel
}) => {
  const currentTimeLabel = getCurrentTimeLabel();

  if (!bedTime && !isEditing) {
    return (
      <div className="p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl hover:border-purple-600/50 transition-colors space-y-3">
        <div className="flex items-center space-x-3">
          <Moon className="h-5 w-5 text-purple-400" />
          <span className="text-purple-200 font-medium">Ready for bed?</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" onClick={onUseCurrentTime} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
            Log Bedtime Now: {currentTimeLabel}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditChange(true)}
            className="border-purple-600 text-purple-400 hover:bg-purple-900/20 w-full sm:w-auto"
          >
            Custom Time
          </Button>
        </div>
      </div>
    );
  }

  if (bedTime && !isEditing) {
    return (
      <div className="flex items-center justify-between p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl">
        <div className="flex items-center space-x-3">
          <Moon className="h-5 w-5 text-purple-400" />
          <span className="text-purple-200">
            Bedtime: <span className="font-semibold text-purple-100">{bedTime}</span>
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditChange(true)}
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
        >
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl space-y-3">
      <div className="flex items-center space-x-3 mb-2">
        <Moon className="h-5 w-5 text-purple-400" />
        <span className="text-purple-200 font-medium">Set Bedtime</span>
      </div>
      <div className="flex items-center space-x-2">
        <select
          value={bedTime}
          onChange={(event) => onBedTimeChange(event.target.value)}
          className="flex-1 bg-purple-900/20 border border-purple-700/50 text-purple-100 rounded-md px-3 py-2 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 outline-none"
        >
          <option value="">Select time...</option>
          <option value="9:00 PM">9:00 PM</option>
          <option value="9:30 PM">9:30 PM</option>
          <option value="10:00 PM">10:00 PM</option>
          <option value="10:30 PM">10:30 PM</option>
          <option value="11:00 PM">11:00 PM</option>
          <option value="11:30 PM">11:30 PM</option>
          <option value="12:00 AM">12:00 AM</option>
          <option value="12:30 AM">12:30 AM</option>
          <option value="1:00 AM">1:00 AM</option>
          <option value="1:30 AM">1:30 AM</option>
          <option value="2:00 AM">2:00 AM</option>
        </select>
        <Button size="sm" onClick={onUseCurrentTime} className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap">
          Use Now: {currentTimeLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditChange(false)}
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
