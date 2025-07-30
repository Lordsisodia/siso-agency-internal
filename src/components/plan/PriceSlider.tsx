
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface PriceSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  className?: string;
  description?: string;
}

export const PriceSlider = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit = "", 
  className,
  description
}: PriceSliderProps) => {
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          {description && <p className="text-xs text-siso-text mt-1">{description}</p>}
        </div>
        <div className="text-siso-orange font-medium">
          {value}{unit}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
        className="py-1"
      />
    </div>
  );
};
