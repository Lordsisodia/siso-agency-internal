/**
 * TasksFilters Component
 * Advanced filtering interface for task management
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Calendar } from '@/domains/calendar/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  Users,
  Tag,
  Folder,
  Clock,
  AlertTriangle,
  CheckSquare,
  Search,
  Sliders
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasksFilters, useTasks } from '../../../.@/lib/stores/tasks/taskProviderCompat';
import { 
  TaskStatus, 
  TaskPriority, 
  TaskCategory, 
  TaskFilters 
} from '@/domains/tasks/types/task.types';
import { 
  TASK_STATUS_CONFIG, 
  TASK_PRIORITY_CONFIG, 
  TASK_CATEGORY_CONFIG 
} from '@/domains/tasks/constants/taskConstants';

interface TasksFiltersProps {
  className?: string;
  compact?: boolean;
  collapsible?: boolean;
  showPresets?: boolean;
  showAdvanced?: boolean;
}

// Filter presets for quick access
const FILTER_PRESETS = [
  {
    id: 'my-tasks',
    label: 'My Tasks',
    icon: Users,
    filters: { assigned_to: ['current_user'] }
  },
  {
    id: 'overdue',
    label: 'Overdue',
    icon: AlertTriangle,
    filters: { is_overdue: true }
  },
  {
    id: 'due-today',
    label: 'Due Today',
    icon: Clock,
    filters: { 
      due_date_range: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    }
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    icon: CheckSquare,
    filters: { status: ['in_progress'] }
  },
  {
    id: 'high-priority',
    label: 'High Priority',
    icon: AlertTriangle,
    filters: { priority: ['urgent', 'high'] }
  }
];

export const TasksFilters: React.FC<TasksFiltersProps> = ({
  className,
  compact = false,
  collapsible = false,
  showPresets = true,
  showAdvanced = true
}) => {
  const { filters, setFilters } = useTasksFilters();
  const { tasks } = useTasks();
  
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({
    from: filters.due_date_range ? new Date(filters.due_date_range.start) : undefined,
    to: filters.due_date_range ? new Date(filters.due_date_range.end) : undefined
  });

  // Get unique values for dropdowns
  const uniqueAssignees = [...new Set(tasks.map(t => t.assigned_to).filter(Boolean))];
  const uniqueProjects = [...new Set(tasks.map(t => t.project_id).filter(Boolean))];
  const uniqueTags = [...new Set(tasks.flatMap(t => t.tags))];

  // Handle filter changes
  const handleStatusChange = (status: TaskStatus, checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    setFilters({ 
      status: newStatuses.length > 0 ? newStatuses : undefined 
    });
  };

  const handlePriorityChange = (priority: TaskPriority, checked: boolean) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority);
    
    setFilters({ 
      priority: newPriorities.length > 0 ? newPriorities : undefined 
    });
  };

  const handleCategoryChange = (category: TaskCategory, checked: boolean) => {
    const currentCategories = filters.category || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    
    setFilters({ 
      category: newCategories.length > 0 ? newCategories : undefined 
    });
  };

  const handleAssigneeChange = (assignee: string, checked: boolean) => {
    const currentAssignees = filters.assigned_to || [];
    const newAssignees = checked
      ? [...currentAssignees, assignee]
      : currentAssignees.filter(a => a !== assignee);
    
    setFilters({ 
      assigned_to: newAssignees.length > 0 ? newAssignees : undefined 
    });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const currentTags = filters.tags || [];
    const newTags = checked
      ? [...currentTags, tag]
      : currentTags.filter(t => t !== tag);
    
    setFilters({ 
      tags: newTags.length > 0 ? newTags : undefined 
    });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    
    if (range.from && range.to) {
      setFilters({
        due_date_range: {
          start: range.from.toISOString().split('T')[0],
          end: range.to.toISOString().split('T')[0]
        }
      });
    } else {
      setFilters({ due_date_range: undefined });
    }
  };

  const handlePresetClick = (preset: typeof FILTER_PRESETS[0]) => {
    setFilters(preset.filters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters({ search: value.trim() || undefined });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    setDateRange({ from: undefined, to: undefined });
  };

  const getActiveFilterCount = () => {
    return [
      filters.status?.length || 0,
      filters.priority?.length || 0,
      filters.category?.length || 0,
      filters.assigned_to?.length || 0,
      filters.project_id?.length || 0,
      filters.tags?.length || 0,
      filters.search ? 1 : 0,
      filters.due_date_range ? 1 : 0,
      filters.is_overdue ? 1 : 0,
      filters.has_subtasks !== undefined ? 1 : 0
    ].reduce((sum, count) => sum + count, 0);
  };

  const activeFilterCount = getActiveFilterCount();

  const FilterContent = () => (
    <div className={cn(
      'space-y-6',
      compact ? 'space-y-4' : 'space-y-6'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className={cn(
            'font-medium text-gray-900',
            compact ? 'text-sm' : 'text-base'
          )}>
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter Presets */}
      {showPresets && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Quick Filters</Label>
          <div className="grid grid-cols-1 gap-2">
            {FILTER_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="justify-start text-left h-auto py-2"
                >
                  <Icon className="w-4 h-4 mr-2 text-gray-500" />
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Basic Filters */}
      <Accordion type="multiple" defaultValue={['status', 'priority']} className="w-full">
        {/* Status Filter */}
        <AccordionItem value="status">
          <AccordionTrigger className="text-sm font-medium text-gray-700">
            Status
            {filters.status && filters.status.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {filters.status.length}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`status-${status}`}
                    checked={filters.status?.includes(status as TaskStatus) || false}
                    onChange={(e) => handleStatusChange(status as TaskStatus, e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label 
                    htmlFor={`status-${status}`}
                    className="text-sm text-gray-600 cursor-pointer flex items-center gap-2"
                  >
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      config.bgColor.replace('bg-', 'bg-')
                    )} />
                    {config.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Priority Filter */}
        <AccordionItem value="priority">
          <AccordionTrigger className="text-sm font-medium text-gray-700">
            Priority
            {filters.priority && filters.priority.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                {filters.priority.length}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Object.entries(TASK_PRIORITY_CONFIG).map(([priority, config]) => (
                <div key={priority} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`priority-${priority}`}
                    checked={filters.priority?.includes(priority as TaskPriority) || false}
                    onChange={(e) => handlePriorityChange(priority as TaskPriority, e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label 
                    htmlFor={`priority-${priority}`}
                    className="text-sm text-gray-600 cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-sm">{config.icon}</span>
                    {config.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-medium text-gray-700">
            Category
            {filters.category && filters.category.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                {filters.category.length}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Object.entries(TASK_CATEGORY_CONFIG).map(([category, config]) => (
                <div key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={filters.category?.includes(category as TaskCategory) || false}
                    onChange={(e) => handleCategoryChange(category as TaskCategory, e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label 
                    htmlFor={`category-${category}`}
                    className="text-sm text-gray-600 cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-sm">{config.icon}</span>
                    {config.label}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            {/* Due Date Filter */}
            <AccordionItem value="due-date">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                Due Date
                {filters.due_date_range && (
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                    Range
                  </Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                          ) : (
                            dateRange.from.toLocaleDateString()
                          )
                        ) : (
                          'Select date range'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range) => handleDateRangeChange(range || {})}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Assignee Filter */}
            {uniqueAssignees.length > 0 && (
              <AccordionItem value="assignee">
                <AccordionTrigger className="text-sm font-medium text-gray-700">
                  Assignee
                  {filters.assigned_to && filters.assigned_to.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                      {filters.assigned_to.length}
                    </Badge>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {uniqueAssignees.map((assignee) => (
                        <div key={assignee} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`assignee-${assignee}`}
                            checked={filters.assigned_to?.includes(assignee) || false}
                            onChange={(e) => handleAssigneeChange(assignee, e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label 
                            htmlFor={`assignee-${assignee}`}
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            {assignee}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Tags Filter */}
            {uniqueTags.length > 0 && (
              <AccordionItem value="tags">
                <AccordionTrigger className="text-sm font-medium text-gray-700">
                  Tags
                  {filters.tags && filters.tags.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                      {filters.tags.length}
                    </Badge>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {uniqueTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`tag-${tag}`}
                            checked={filters.tags?.includes(tag) || false}
                            onChange={(e) => handleTagChange(tag, e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label 
                            htmlFor={`tag-${tag}`}
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            #{tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Special Filters */}
            <AccordionItem value="special">
              <AccordionTrigger className="text-sm font-medium text-gray-700">
                Special Filters
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="overdue" className="text-sm text-gray-600">
                      Show overdue tasks only
                    </Label>
                    <Switch
                      id="overdue"
                      checked={filters.is_overdue || false}
                      onCheckedChange={(checked) => setFilters({ is_overdue: checked || undefined })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-subtasks" className="text-sm text-gray-600">
                      Has subtasks
                    </Label>
                    <Switch
                      id="has-subtasks"
                      checked={filters.has_subtasks || false}
                      onCheckedChange={(checked) => setFilters({ has_subtasks: checked || undefined })}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Accordion>
    </div>
  );

  if (collapsible) {
    return (
      <div className={cn('tasks-filters border-r border-gray-200 bg-white', className)}>
        <Accordion type="single" collapsible>
          <AccordionItem value="filters" className="border-0">
            <AccordionTrigger className="px-4 py-3 border-b border-gray-200 hover:no-underline">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <FilterContent />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return (
    <div className={cn(
      'tasks-filters',
      compact ? 'p-4' : 'p-6',
      className
    )}>
      <FilterContent />
    </div>
  );
};

export default TasksFilters;