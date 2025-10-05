/**
 * ListView Component
 * Modern list view for task display with sorting, selection, and actions
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flag,
  Play,
  Edit,
  Trash2,
  Copy,
  Archive,
  Star,
  StarOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '../../types/task.types';
import { useTasksSelection } from '../providers/TasksProvider';
import { 
  getStatusColor, 
  getPriorityColor, 
  getCategoryColor,
  formatDueDate,
  calculateTaskProgress,
  isTaskOverdue,
  isTaskDueToday
} from '../../utils/taskHelpers';

interface ListViewProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onCreateTask?: () => void;
}

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
}

// Individual task item component
const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected,
  onSelect,
  onTaskSelect,
  onTaskEdit
}) => {
  const [isStarred, setIsStarred] = useState(false);
  
  const progress = calculateTaskProgress(task);
  const dueInfo = formatDueDate(task.due_date);
  const isOverdue = isTaskOverdue(task);
  const isDueToday = isTaskDueToday(task);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('[role="button"]')) {
      return;
    }
    onTaskSelect?.(task.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskEdit?.(task.id);
  };

  const handleStarToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStarred(!isStarred);
  };

  return (
    <Card 
      className={cn(
        'group hover:shadow-md transition-all duration-200 cursor-pointer border',
        isSelected && 'border-orange-300 bg-orange-50',
        isOverdue && 'border-red-200 bg-red-50',
        isDueToday && !isOverdue && 'border-orange-200 bg-orange-50'
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Selection Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-medium text-gray-900 mb-1 line-clamp-2',
                  task.status === 'completed' && 'line-through text-gray-500'
                )}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStarToggle}
                  className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto',
                    isStarred && 'opacity-100 text-yellow-500'
                  )}
                >
                  {isStarred ? (
                    <Star className="w-4 h-4 fill-current" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEditClick}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Play className="w-4 h-4 mr-2" />
                      Start Timer
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
              </div>
            </div>

            {/* Status and Priority Badges */}
            <div className="flex items-center gap-2 mb-3">
              <Badge className={cn(
                'text-xs px-2 py-1',
                getStatusColor(task.status)
              )}>
                {task.status.replace('_', ' ')}
              </Badge>
              
              <Badge className={cn(
                'text-xs px-2 py-1',
                getPriorityColor(task.priority)
              )}>
                <Flag className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>
              
              <Badge className={cn(
                'text-xs px-2 py-1',
                getCategoryColor(task.category)
              )}>
                {task.category}
              </Badge>
            </div>

            {/* Progress Bar */}
            {progress > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}

            {/* Task Meta Information */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {/* Due Date */}
                {task.due_date && dueInfo && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          'flex items-center gap-1',
                          dueInfo.color
                        )}>
                          <Calendar className="w-3 h-3" />
                          <span>{dueInfo.text}</span>
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Assignee */}
                {task.assigned_to && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assigned_to}</span>
                  </div>
                )}

                {/* Estimated Hours */}
                {task.estimated_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{task.estimated_hours}h</span>
                  </div>
                )}

                {/* Subtasks Count */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      {task.subtasks.filter(st => st.status === 'completed').length}/
                      {task.subtasks.length}
                    </span>
                  </div>
                )}

                {/* Comments Count */}
                {task.comments && task.comments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{task.comments.length}</span>
                  </div>
                )}

                {/* Attachments Count */}
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <span>{task.attachments.length}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span className="max-w-32 truncate">
                    {task.tags.slice(0, 2).join(', ')}
                    {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onTaskSelect,
  onTaskEdit,
  onCreateTask
}) => {
  const { selectedTasks, toggleTaskSelection, selectAllTasks, clearSelection } = useTasksSelection();
  const [sortBy, setSortBy] = useState<keyof Task>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortBy, sortDirection]);

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      clearSelection();
    } else {
      selectAllTasks();
    }
  };

  const isAllSelected = tasks.length > 0 && selectedTasks.size === tasks.length;
  const isPartiallySelected = selectedTasks.size > 0 && selectedTasks.size < tasks.length;

  return (
    <div className="list-view h-full flex flex-col">
      {/* List Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isPartiallySelected}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium text-gray-700">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
          {selectedTasks.size > 0 && (
            <span className="text-sm text-orange-600">
              ({selectedTasks.size} selected)
            </span>
          )}
        </div>

        {/* Sort Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Sort by {sortBy.replace('_', ' ')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('title')}>
              Title
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('status')}>
              Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('priority')}>
              Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('due_date')}>
              Due Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('updated_at')}>
              Last Updated
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
              {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTasks.has(task.id)}
              onSelect={(checked) => toggleTaskSelection(task.id)}
              onTaskSelect={onTaskSelect}
              onTaskEdit={onTaskEdit}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListView;