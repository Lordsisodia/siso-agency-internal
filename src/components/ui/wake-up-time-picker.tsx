import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import type { WheelPickerOption } from "@/components/ui/wheel-picker";
import { WheelPicker, WheelPickerWrapper } from "@/components/ui/wheel-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WakeUpTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  onClose: () => void;
  getCurrentTime: () => string;
}

const createArray = (length: number, add = 0): WheelPickerOption[] =>
  Array.from({ length }, (_, i) => {
    const value = i + add;
    return {
      label: value.toString().padStart(2, "0"),
      value: value.toString().padStart(2, "0"), // Make sure values are padded like labels
    };
  });

const hourOptions = createArray(12, 1); // 1-12 for hours
const minuteOptions = createArray(60, 0); // 0-59 for minutes
const meridiemOptions: WheelPickerOption[] = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
];

export const WakeUpTimePicker: React.FC<WakeUpTimePickerProps> = ({
  value,
  onChange,
  onClose,
  getCurrentTime
}) => {
  // Parse current time or default to 7:00 AM
  const parseTime = (timeString: string) => {
    if (!timeString) return { hour: "07", minute: "00", meridiem: "AM" };
    
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      const [, hour, minute, meridiem] = match;
      // Convert hour to 12-hour format and pad
      let hourNum = parseInt(hour);
      if (hourNum === 0) hourNum = 12; // Convert 0 to 12 for 12AM
      if (hourNum > 12) hourNum = hourNum - 12; // Convert 24-hour to 12-hour
      
      return {
        hour: hourNum.toString().padStart(2, "0"),
        minute: minute.padStart(2, "0"),
        meridiem: meridiem.toUpperCase()
      };
    }
    return { hour: "07", minute: "00", meridiem: "AM" };
  };

  const { hour: initialHour, minute: initialMinute, meridiem: initialMeridiem } = parseTime(value);
  console.log('parseTime result:', { initialHour, initialMinute, initialMeridiem, originalValue: value });
  
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const [selectedMeridiem, setSelectedMeridiem] = useState(initialMeridiem);

  const handleSave = () => {
    console.log('handleSave:', { selectedHour, selectedMinute, selectedMeridiem });
    const formattedTime = `${selectedHour}:${selectedMinute} ${selectedMeridiem}`;
    onChange(formattedTime);
    onClose();
  };

  const handleUseNow = () => {
    const currentTime = getCurrentTime();
    onChange(currentTime);
    onClose();
  };

  return (
    <Card className="bg-yellow-900/20 border-yellow-700/50 shadow-xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-4 w-4 text-yellow-400" />
          <h3 className="text-yellow-100 font-semibold">Set Wake-up Time</h3>
        </div>
        
        <div className="flex justify-center">
          <WheelPickerWrapper className="bg-yellow-900/30 ring-yellow-600/30">
            <WheelPicker 
              options={hourOptions} 
              infinite
              value={selectedHour}
              onValueChange={(option) => setSelectedHour(option.value)}
              classNames={{
                optionItem: "text-yellow-400/70",
                highlightWrapper: "bg-yellow-600/20 text-yellow-100 border border-yellow-500/30"
              }}
            />
            <WheelPicker 
              options={minuteOptions} 
              infinite
              value={selectedMinute}
              onValueChange={(option) => setSelectedMinute(option.value)}
              classNames={{
                optionItem: "text-yellow-400/70",
                highlightWrapper: "bg-yellow-600/20 text-yellow-100 border border-yellow-500/30"
              }}
            />
            <WheelPicker 
              options={meridiemOptions}
              value={selectedMeridiem}
              onValueChange={(option) => setSelectedMeridiem(option.value)}
              classNames={{
                optionItem: "text-yellow-400/70",
                highlightWrapper: "bg-yellow-600/20 text-yellow-100 border border-yellow-500/30"
              }}
            />
          </WheelPickerWrapper>
        </div>

        <div className="text-center">
          <div className="text-yellow-100 font-medium text-lg mb-4">
            {selectedHour}:{selectedMinute} {selectedMeridiem}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleUseNow}
            variant="outline"
            className="flex-1 border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
          >
            Use Now ({getCurrentTime()})
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Set Time
          </Button>
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full text-gray-400 hover:text-gray-300"
        >
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
};