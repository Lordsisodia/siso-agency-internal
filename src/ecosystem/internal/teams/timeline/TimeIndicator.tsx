
import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeIndicatorProps {
  currentTime: Date;
  position: number;
}

export function TimeIndicator({ currentTime, position }: TimeIndicatorProps) {
  const isMobile = useIsMobile();
  
  return (
    <div
      className="absolute left-0 right-2 sm:right-4 pointer-events-none z-10"
      style={{ top: `${position}px` }}
    >
      <div className="flex items-center">
        <div className="w-full h-px bg-red-400 opacity-70" />
        <div className="flex-shrink-0 bg-red-500/90 text-white rounded-md px-1.5 py-1 shadow-md text-xs flex items-center gap-1">
          <Clock className={`h-${isMobile ? 3 : 4} w-${isMobile ? 3 : 4}`} />
          <span>{format(currentTime, isMobile ? 'H:mm' : 'h:mm a')}</span>
        </div>
      </div>
    </div>
  );
}
