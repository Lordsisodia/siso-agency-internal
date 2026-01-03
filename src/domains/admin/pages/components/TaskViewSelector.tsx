import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  List,
  Calendar,
  Grid,
  ChevronDown
} from 'lucide-react';

// Types extracted from AdminTasks.tsx
type ViewType = 'list' | 'kanban' | 'calendar';

interface TaskViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  showViewDropdown: boolean;
  onToggleDropdown: (show: boolean) => void;
}

/**
 * TaskViewSelector - View switching component for task management
 * 
 * Extracted from AdminTasks.tsx (1,338 lines → focused component)
 * Handles all view switching logic (list, calendar, kanban)
 */
export const TaskViewSelector: React.FC<TaskViewSelectorProps> = ({
  currentView,
  onViewChange,
  showViewDropdown,
  onToggleDropdown
}) => {
  const viewOptions = [
    {
      value: 'list' as ViewType,
      label: 'List View',
      shortLabel: 'LIST VIEW',
      icon: List
    },
    {
      value: 'calendar' as ViewType,
      label: 'Calendar View',
      shortLabel: 'CALENDAR VIEW',
      icon: Calendar
    },
    {
      value: 'kanban' as ViewType,
      label: 'Kanban View',
      shortLabel: 'KANBAN VIEW',
      icon: Grid
    }
  ];

  const currentViewOption = viewOptions.find(option => option.value === currentView);
  const IconComponent = currentViewOption?.icon || List;

  const handleViewSelect = (view: ViewType) => {
    onViewChange(view);
    onToggleDropdown(false);
  };

  return (
    <div className="relative view-dropdown-container">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleDropdown(!showViewDropdown)}
        className="text-xs px-3 py-1 bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 shadow-sm"
      >
        <span className="mr-2">
          <IconComponent className="h-3 w-3" />
        </span>
        {currentViewOption?.shortLabel || 'LIST VIEW'}
        <ChevronDown className="h-3 w-3 ml-2" />
      </Button>
      
      {showViewDropdown && (
        <div className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden">
          {viewOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleViewSelect(option.value)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center gap-3 transition-colors text-gray-300"
              >
                <OptionIcon className="h-4 w-4 text-gray-400" />
                <span>{option.label}</span>
                {currentView === option.value && (
                  <span className="ml-auto text-orange-500">●</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};