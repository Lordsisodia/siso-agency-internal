
import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorOption {
  name: string;
  value: string;
}

interface ColorPickerProps {
  title: string;
  colors: ColorOption[];
  selectedColor: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ 
  title, 
  colors, 
  selectedColor, 
  onChange 
}: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="mb-2 flex items-center gap-2">
        <Palette className="h-4 w-4 text-siso-orange" />
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-siso-text/10 bg-black/30 px-3 py-2 text-sm text-white"
      >
        <div className="flex items-center gap-2">
          <div 
            className="h-4 w-4 rounded-full" 
            style={{ backgroundColor: selectedColor }}
          />
          <span>{colors.find(c => c.value === selectedColor)?.name || 'Custom'}</span>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-siso-text/10 bg-black/90 p-2 shadow-lg backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  onChange(color.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex h-10 items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-white/5",
                  selectedColor === color.value ? "ring-1 ring-siso-orange" : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-white">{color.name}</span>
                </div>
                {selectedColor === color.value && (
                  <Check className="h-3 w-3 text-siso-orange" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
