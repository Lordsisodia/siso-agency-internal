import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Ensure we have a valid priority value
  const validValue = value && TASK_PRIORITY_CONFIG[value] ? value : 'medium';
  const config = TASK_PRIORITY_CONFIG[validValue];

  // Calculate smart dropdown position
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return 'bottom';

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 250; // Estimated max dropdown height
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // If not enough space below but more space above, show above
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      return 'top';
    }

    return 'bottom';
  };

  // Debug: Log component mount and state changes
  useEffect(() => {
    console.log('🎯 [PrioritySelector] Component mounted/updated', {
      value,
      validValue,
      disabled,
      isOpen,
      buttonExists: !!buttonRef.current,
      dropdownExists: !!dropdownRef.current
    });
  }, [value, validValue, disabled, isOpen]);

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
    console.log('🎯 [PrioritySelector] Option selected:', priority);
    onChange(priority);
    setIsOpen(false);
    console.log('✅ [PrioritySelector] Dropdown closed after selection');
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('🔍 [PrioritySelector] Button clicked!', {
      disabled,
      currentIsOpen: isOpen,
      willToggleTo: !isOpen,
      target: e.target,
      currentTarget: e.currentTarget,
      eventType: e.type,
      timestamp: new Date().toISOString()
    });
    e.stopPropagation();
    if (!disabled) {
      // Calculate position before opening
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
      setIsOpen(!isOpen);
      console.log('✅ [PrioritySelector] State toggled to:', !isOpen, 'Position:', position);
    } else {
      console.log('⚠️ [PrioritySelector] Button disabled, click ignored');
    }
  };

  return (
    <div
      className="relative"
      onClick={(e) => {
        console.log('🔍 [PrioritySelector] Wrapper div clicked!', {
          target: e.target,
          currentTarget: e.currentTarget,
          isButton: e.target === buttonRef.current
        });
      }}
    >
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={disabled}
        onMouseEnter={() => console.log('👆 [PrioritySelector] Mouse entered button')}
        onMouseLeave={() => console.log('👋 [PrioritySelector] Mouse left button')}
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
          className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-1 min-w-[120px] z-[99999] max-h-[250px] overflow-y-auto"
          style={{
            ...(dropdownPosition === 'bottom'
              ? {
                  top: buttonRef.current
                    ? `${buttonRef.current.getBoundingClientRect().bottom + 8}px`
                    : '0px',
                }
              : {
                  bottom: buttonRef.current
                    ? `${window.innerHeight - buttonRef.current.getBoundingClientRect().top + 8}px`
                    : '0px',
                }),
            left: buttonRef.current
              ? `${buttonRef.current.getBoundingClientRect().left}px`
              : '0px',
          }}
        >
          {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(key as PriorityLevel);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default PrioritySelector;
