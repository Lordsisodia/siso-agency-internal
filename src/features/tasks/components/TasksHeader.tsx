/**
 * TasksHeader Component
 * Modern header with view controls, search, filters, and actions
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/shared/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Separator } from '@/shared/ui/separator';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Grid3X3,
  List,
  Calendar,
  Download,
  Upload,
  Settings,
  Archive,
  Trash2,
  CheckSquare,
  Clock,
  Users,
  SortAsc,
  SortDesc,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTasks, useTasksSelection, useTasksFilters, useTasksView } from './TasksProvider';
import { TaskViewType, TaskStatus, TaskPriority, TaskCategory } from '../../types/task.types';
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, TASK_CATEGORY_CONFIG } from '../constants/taskConstants';

interface TasksHeaderProps {
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewSwitcher?: boolean;
  showActions?: boolean;
  compact?: boolean;
  
  // Custom handlers
  onCreateTask?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSettings?: () => void;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  className,
  showSearch = true,
  showFilters = true,
  showViewSwitcher = true,
  showActions = true,
  compact = false,
  onCreateTask,
  onExport,
  onImport,
  onSettings
}) => {
  const { tasks, filteredTasks, isLoading } = useTasks();
  const { selectedTasks, clearSelection } = useTasksSelection();
  const { filters, setFilters } = useTasksFilters();
  const { currentView, setCurrentView } = useTasksView();
  
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // View options
  const viewOptions = [
    { value: 'list' as TaskViewType, label: 'List', icon: List },
    { value: 'kanban' as TaskViewType, label: 'Kanban', icon: Grid3X3 },
    { value: 'calendar' as TaskViewType, label: 'Calendar', icon: Calendar }
  ];

  // Sort options
  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'created_at', label: 'Created' },
    { value: 'updated_at', label: 'Updated' }
  ];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters({ search: value.trim() || undefined });
  };

  // Handle view change
  const handleViewChange = (view: TaskViewType) => {
    setCurrentView(view);
  };

  // Handle filter changes
  const handleStatusFilter = (status: TaskStatus, checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    setFilters({ 
      status: newStatuses.length > 0 ? newStatuses : undefined 
    });
  };

  const handlePriorityFilter = (priority: TaskPriority, checked: boolean) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority);
    
    setFilters({ 
      priority: newPriorities.length > 0 ? newPriorities : undefined 
    });
  };

  const handleCategoryFilter = (category: TaskCategory, checked: boolean) => {
    const currentCategories = filters.category || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    
    setFilters({ 
      category: newCategories.length > 0 ? newCategories : undefined 
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
    setSearchValue('');
  };

  // Calculate active filter count
  const activeFilterCount = [
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

  const hasSelectedTasks = selectedTasks.size > 0;

  return (
    <div className={cn(
      'tasks-header bg-white border-b border-gray-200 px-6 py-4',
      compact && 'px-4 py-3',
      className
    )}>
      <div className="flex items-center justify-between gap-4">
        {/* Left Section - Title & Stats */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className={cn(
              'font-semibold text-gray-900',
              compact ? 'text-lg' : 'text-xl'
            )}>
              Tasks
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{filteredTasks.length} of {tasks.length}</span>
              {hasSelectedTasks && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-orange-600">{selectedTasks.size} selected</span>
                </>
              )}
              {isLoading && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <RefreshCw className="w-3 h-3 animate-spin" />
                </>
              )}
            </div>
          </div>

          {/* Active filters indicator */}
          {activeFilterCount > 0 && (
            <Badge 
              variant="secondary" 
              className="bg-orange-100 text-orange-700 border border-orange-200"
            >
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-64 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "border-gray-200 text-gray-700",
                    activeFilterCount > 0 && "border-orange-300 bg-orange-50 text-orange-700"
                  )}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 bg-orange-200 text-orange-800 text-xs px-1.5 py-0.5"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Filters</h4>
                    {activeFilterCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Status filters */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => (
                        <div key={status} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`status-${status}`}
                            checked={filters.status?.includes(status as TaskStatus) || false}
                            onChange={(e) => handleStatusFilter(status as TaskStatus, e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label 
                            htmlFor={`status-${status}`}
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            {config.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Priority filters */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(TASK_PRIORITY_CONFIG).map(([priority, config]) => (
                        <div key={priority} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`priority-${priority}`}
                            checked={filters.priority?.includes(priority as TaskPriority) || false}
                            onChange={(e) => handlePriorityFilter(priority as TaskPriority, e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label 
                            htmlFor={`priority-${priority}`}
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            {config.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Category filters */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(TASK_CATEGORY_CONFIG).map(([category, config]) => (
                        <div key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`category-${category}`}
                            checked={filters.category?.includes(category as TaskCategory) || false}
                            onChange={(e) => handleCategoryFilter(category as TaskCategory, e.target.checked)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <label 
                            htmlFor={`category-${category}`}
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            {config.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-700">
                {sortDirection === 'asc' ? (
                  <SortAsc className="w-4 h-4 mr-2" />
                ) : (
                  <SortDesc className="w-4 h-4 mr-2" />
                )}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {sortOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={sortBy === option.value}
                  onCheckedChange={() => setSortBy(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={sortDirection === 'asc'}
                onCheckedChange={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Switcher */}
          {showViewSwitcher && (
            <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
              {viewOptions.map((view) => {
                const Icon = view.icon;
                return (
                  <Button
                    key={view.value}
                    variant={currentView === view.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewChange(view.value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium',
                      currentView === view.value 
                        ? 'bg-white shadow-sm text-gray-900 border-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {!compact && view.label}
                  </Button>
                );
              })}
            </div>
          )}

          <Separator orientation="vertical" className="h-6" />

          {/* Bulk Actions (when tasks are selected) */}
          {hasSelectedTasks && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Actions ({selectedTasks.size})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Clock className="w-4 h-4 mr-2" />
                    Update Status
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    Assign To
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear selection
              </Button>

              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Actions Menu */}
          {showActions && (
            <>
              <Button
                onClick={onCreateTask}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onImport}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Tasks
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Zap className="w-4 h-4 mr-2" />
                    AI Insights
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSettings}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksHeader;