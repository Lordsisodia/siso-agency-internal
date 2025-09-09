/**
 * Enhanced ListView Component
 * Modern, clean task view using EnhancedTaskItem with beautiful animations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu';
import { 
  Plus,
  SortAsc,
  SortDesc,
  Filter,
  CheckSquare,
  Archive,
  Trash2
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Task } from '../../types/task.types';
import { useTasksSelection } from '../providers/TasksProvider';
import { TaskCardAdapter } from '@/components/admin/tasks/TaskCardAdapter';

interface EnhancedListViewProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onCreateTask?: () => void;
}


export const EnhancedListView: React.FC<EnhancedListViewProps> = ({
  tasks,
  onTaskSelect,
  onTaskEdit,
  onCreateTask
}) => {
  const { selectedTasks, toggleTaskSelection, selectAllTasks, clearSelection } = useTasksSelection();
  const [sortBy, setSortBy] = useState<keyof Task>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort tasks
  const sortedTasks = React.useMemo(() => {
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

  const handleTaskToggle = (taskId: string) => {
    // Handle task completion toggle
    console.log('Toggle task:', taskId);
  };


  const handleDateChange = (taskId: string, date: Date | undefined) => {
    console.log('Date change:', taskId, date);
  };

  const isAllSelected = tasks.length > 0 && selectedTasks.size === tasks.length;
  const isPartiallySelected = selectedTasks.size > 0 && selectedTasks.size < tasks.length;

  return (
    <div className="enhanced-list-view h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isPartiallySelected}
            onCheckedChange={handleSelectAll}
            className="border-gray-600"
          />
          <h2 className="text-lg font-semibold text-white">
            Tasks ({tasks.length})
          </h2>
          {selectedTasks.size > 0 && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40">
              {selectedTasks.size} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectedTasks.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {sortDirection === 'asc' ? (
                  <SortAsc className="w-4 h-4 mr-2" />
                ) : (
                  <SortDesc className="w-4 h-4 mr-2" />
                )}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => setSortBy('title')} className="text-gray-300">
                Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('status')} className="text-gray-300">
                Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('priority')} className="text-gray-300">
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('due_date')} className="text-gray-300">
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('updated_at')} className="text-gray-300">
                Last Updated
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="text-gray-300"
              >
                {sortDirection === 'asc' ? 'Descending' : 'Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Task */}
          {onCreateTask && (
            <Button
              onClick={onCreateTask}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-6 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
                className="mb-4"
              >
                <div className="relative">
                  {/* Selection overlay */}
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-lg transition-all duration-200 pointer-events-none z-10",
                      selectedTasks.has(task.id) && "ring-2 ring-orange-500/50 bg-orange-500/5"
                    )}
                  />
                  
                  {/* Selection checkbox */}
                  <div 
                    className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskSelection(task.id);
                    }}
                  >
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={() => toggleTaskSelection(task.id)}
                      className="border-gray-600"
                    />
                  </div>

                  {/* Clean Task Card */}
                  <div className="group hover:scale-[1.01] transition-transform duration-200">
                    <TaskCardAdapter
                      task={task}
                      onToggle={handleTaskToggle}
                      onEdit={(task) => onTaskEdit?.(task.id)}
                      onDateChange={handleDateChange}
                      isLast={index === sortedTasks.length - 1}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {sortedTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-sm mt-2">Get started by creating your first task.</p>
              </div>
              {onCreateTask && (
                <Button
                  onClick={onCreateTask}
                  className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedListView;