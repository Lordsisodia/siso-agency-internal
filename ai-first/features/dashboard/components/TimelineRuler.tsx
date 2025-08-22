
import React from 'react';
import { cn } from '@/lib/utils';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimelineRulerProps {
  currentHour: number;
  hourHeight?: number;
  onTimeSlotClick?: (hour: number) => void;
}

export function TimelineRuler({ currentHour, hourHeight: propHourHeight, onTimeSlotClick }: TimelineRulerProps) {
  const { handleDrop, handleDragOver, isDragging } = useTaskDragDrop();
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const isMobile = useIsMobile();
  const hourHeight = propHourHeight || (isMobile ? 60 : 80);

  const handleTimeSlotClick = (hour: number) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(hour);
    }
  };

  return (
    <div className="h-full">
      {timeSlots.map((hour) => (
        <div
          key={hour}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, e.currentTarget)}
          onClick={() => handleTimeSlotClick(hour)}
          className={cn(
            "flex items-center justify-center text-xs sm:text-sm relative cursor-pointer",
            hour === currentHour && "bg-purple-100/10 font-bold",
            isDragging && "hover:bg-purple-100/5",
            "hover:bg-purple-100/5"
          )}
          style={{
            height: `${hourHeight}px`,
            touchAction: 'manipulation'
          }}
        >
          {`${hour.toString().padStart(2, '0')}:00`}
          {isDragging && (
            <div className="absolute inset-0 border-2 border-purple-500/20 border-dashed pointer-events-none" />
          )}
        </div>
      ))}
    </div>
  );
}
