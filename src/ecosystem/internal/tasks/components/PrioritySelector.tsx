import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { TASK_PRIORITY_CONFIG } from '@/ecosystem/internal/tasks/constants/taskConstants';

export type PriorityLevel = keyof typeof TASK_PRIORITY_CONFIG;

interface PrioritySelectorProps {
  value: PriorityLevel;
  onChange: (priority: PriorityLevel) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ 
  value, 
  onChange, 
  size = 'sm',
  disabled = false
}) => {
  // Ensure we have a valid priority value
  const validValue = value && TASK_PRIORITY_CONFIG[value] ? value : 'medium';
  const config = TASK_PRIORITY_CONFIG[validValue];
  
  const handleChange = (newValue: PriorityLevel) => {
    onChange(newValue);
  };

  // Prevent event bubbling to parent elements
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div onClick={handleClick} className="relative z-10">
      <Select value={validValue} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger 
          className={`
            ${size === 'sm' ? 'h-6 text-xs px-2' : 'h-8 text-sm px-3'} 
            ${config.bgColor} ${config.textColor} 
            border-0 font-medium rounded-full min-w-0 w-auto
            hover:opacity-90 transition-opacity
            disabled:opacity-50 disabled:cursor-not-allowed
            relative z-10
          `}
        >
          <SelectValue>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-xs">{config.icon}</span>
              <span className="hidden sm:inline">{config.label}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          className="bg-gray-800 border border-gray-700 min-w-[120px] z-[99999]"
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
        >
          {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
            <SelectItem 
              key={key} 
              value={key}
              className="text-white hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PrioritySelector;