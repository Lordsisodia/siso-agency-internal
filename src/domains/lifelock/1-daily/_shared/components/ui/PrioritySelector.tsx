import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TASK_PRIORITY_CONFIG } from '@/domains/lifelock/1-daily/_shared/utils/taskConstants';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Ensure we have a valid priority value
  const validValue = value && TASK_PRIORITY_CONFIG[value] ? value : 'medium';
  const config = TASK_PRIORITY_CONFIG[validValue];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (priority: PriorityLevel) => {
    onChange(priority);
    setIsOpen(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Calculate position dynamically
  const getDropdownStyle = (): React.CSSProperties => {
    if (!buttonRef.current) return {};

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 250; // Max estimated height
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // Position above if not enough space below
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      return {
        bottom: `${window.innerHeight - buttonRect.top + 8}px`,
        left: `${buttonRect.left}px`,
      };
    }

    // Default: position below
    return {
      top: `${buttonRect.bottom + 8}px`,
      left: `${buttonRect.left}px`,
    };
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={disabled}
        className={`
          ${size === 'sm' ? 'h-6 text-xs px-2' : 'h-8 text-sm px-3'}
          ${config.bgColor} ${config.textColor}
          border-0 font-medium rounded-full min-w-0 w-auto
          hover:opacity-90 transition-opacity
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-1 whitespace-nowrap
        `}
      >
        <span className="text-xs">{config.icon}</span>
        <span className="hidden sm:inline">{config.label}</span>
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-1 min-w-[140px] z-[99999] max-h-[280px] overflow-y-auto"
          style={getDropdownStyle()}
        >
          {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(key as PriorityLevel);
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white
                hover:bg-gray-700 rounded transition-colors
                ${key === validValue ? 'bg-gray-700' : ''}
              `}
            >
              <span className="text-base">{cfg.icon}</span>
              <span className="font-medium">{cfg.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default PrioritySelector;
