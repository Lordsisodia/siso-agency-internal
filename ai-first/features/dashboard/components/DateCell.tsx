
import React from 'react';
import { CalendarClock } from 'lucide-react';

interface DateCellProps {
  date: string | null | undefined;
  showIcon?: boolean;
}

export const DateCell = ({ date, showIcon }: DateCellProps) => {
  if (!date) {
    return <span>-</span>;
  }

  return (
    <div className="flex items-center">
      {showIcon && <CalendarClock className="h-4 w-4 mr-1" />}
      {new Date(date).toLocaleDateString()}
    </div>
  );
};
