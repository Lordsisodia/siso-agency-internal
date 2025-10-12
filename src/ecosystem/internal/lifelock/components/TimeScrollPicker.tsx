import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface TimeScrollPickerProps {
  value: string; // Format: "7:30 AM"
  onChange: (time: string) => void;
  onClose: () => void;
}

export const TimeScrollPicker: React.FC<TimeScrollPickerProps> = ({
  value,
  onChange,
  onClose
}) => {
  // Parse initial value
  const parseTime = (timeString: string) => {
    if (!timeString) return { hour: 7, minute: 0, period: 'AM' };

    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      return {
        hour: parseInt(match[1]),
        minute: parseInt(match[2]),
        period: match[3].toUpperCase()
      };
    }
    return { hour: 7, minute: 0, period: 'AM' };
  };

  const { hour: initialHour, minute: initialMinute, period: initialPeriod } = parseTime(value);

  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initialPeriod as 'AM' | 'PM');

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  const ITEM_HEIGHT = 40;

  // Scroll to initial values
  useEffect(() => {
    if (hourRef.current) {
      hourRef.current.scrollTop = (selectedHour - 1) * ITEM_HEIGHT;
    }
    if (minuteRef.current) {
      minuteRef.current.scrollTop = selectedMinute * ITEM_HEIGHT;
    }
    if (periodRef.current) {
      periodRef.current.scrollTop = (selectedPeriod === 'PM' ? 1 : 0) * ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    setter: (val: any) => void,
    values: any[]
  ) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));

    setter(values[clampedIndex]);

    // Snap to position
    ref.current.scrollTop = clampedIndex * ITEM_HEIGHT;
  };

  const handleConfirm = () => {
    const formattedTime = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
    onChange(formattedTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 border border-yellow-600/50 rounded-lg p-4 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-yellow-400 font-semibold mb-4 text-center">Select Wake-up Time</h3>

        <div className="flex gap-2 mb-4">
          {/* Hours */}
          <div className="flex-1">
            <div className="text-xs text-yellow-400/60 text-center mb-1">Hour</div>
            <div className="relative h-[120px] overflow-hidden">
              {/* Gradient overlays */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10" />

              {/* Selection highlight */}
              <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-yellow-500/10 border-y border-yellow-600/30 pointer-events-none" />

              {/* Scrollable container */}
              <div
                ref={hourRef}
                className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                onScroll={() => handleScroll(hourRef, setSelectedHour, hours)}
                style={{ paddingTop: '40px', paddingBottom: '40px' }}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "h-10 flex items-center justify-center snap-center text-lg transition-all",
                      hour === selectedHour ? "text-yellow-400 font-bold" : "text-gray-500"
                    )}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Minutes */}
          <div className="flex-1">
            <div className="text-xs text-yellow-400/60 text-center mb-1">Min</div>
            <div className="relative h-[120px] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10" />
              <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-yellow-500/10 border-y border-yellow-600/30 pointer-events-none" />

              <div
                ref={minuteRef}
                className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                onScroll={() => handleScroll(minuteRef, setSelectedMinute, minutes)}
                style={{ paddingTop: '40px', paddingBottom: '40px' }}
              >
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    className={cn(
                      "h-10 flex items-center justify-center snap-center text-lg transition-all",
                      minute === selectedMinute ? "text-yellow-400 font-bold" : "text-gray-500"
                    )}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AM/PM */}
          <div className="flex-1">
            <div className="text-xs text-yellow-400/60 text-center mb-1">Period</div>
            <div className="relative h-[120px] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10" />
              <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-yellow-500/10 border-y border-yellow-600/30 pointer-events-none" />

              <div
                ref={periodRef}
                className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                onScroll={() => handleScroll(periodRef, setSelectedPeriod, periods)}
                style={{ paddingTop: '40px', paddingBottom: '40px' }}
              >
                {periods.map((period) => (
                  <div
                    key={period}
                    className={cn(
                      "h-10 flex items-center justify-center snap-center text-lg transition-all",
                      period === selectedPeriod ? "text-yellow-400 font-bold" : "text-gray-500"
                    )}
                  >
                    {period}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
