import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export interface LifeLockDateNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

const LifeLockDateNavigation: React.FC<LifeLockDateNavigationProps> = ({
  currentDate,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onToday,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreviousDay}
          className="text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-white/80" />
          <h2 className="text-xl font-semibold text-white">
            {formatDate(currentDate)}
          </h2>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextDay}
          className="text-white hover:bg-white/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {!isToday(currentDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="text-white border-white/30 hover:bg-white/20"
          >
            Today
          </Button>
        )}
        
        <input
          type="date"
          value={currentDate.toISOString().split('T')[0]}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="bg-white/10 border border-white/30 rounded px-3 py-1 text-white text-sm"
        />
      </div>
    </div>
  );
};

export default LifeLockDateNavigation;
