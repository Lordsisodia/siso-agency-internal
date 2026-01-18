import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  KanbanView,
  CalendarView,
  ListView
} from '@/tasks';
import { 
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { EnhancedTaskItem } from '@/domains/admin/tasks/EnhancedTaskItem';

// Types extracted from AdminTasks.tsx
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'overdue' | 'due-today' | 'upcoming' | 'in-progress' | 'blocked' | 'not-started' | 'started' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  category: 'development' | 'design' | 'marketing' | 'client' | 'admin';
  tags?: string[];
  estimatedHours?: number;
  subtasks?: Subtask[];
  progress?: number;
  description?: string;
}

type ViewType = 'list' | 'kanban' | 'calendar';

interface TaskListManagerProps {
  tasks: Task[];
  filteredTasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  currentView: ViewType;
  selectedFilter: string;
  selectedPriority: string;
  filterCategories: any;
  user: any;
  // Task operations
  toggleTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => Promise<void>;
  handleCreateTask: (taskData: Partial<Task>) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleEditTask: (task: Task) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  handleDateChange: (taskId: string, date: Date | undefined) => void;
  openEditTask: (task: Task) => void;
  // Mutations
  createTaskMutation: any;
  deleteTaskMutation: any;
  // Filter handlers
  setSelectedFilter: (filter: string) => void;
  setSelectedPriority: (priority: string) => void;
}

/**
 * TaskListManager - Task list rendering and management component
 * 
 * Extracted from AdminTasks.tsx (1,338 lines → focused component)
 * Handles all task list rendering, operations, and view switching
 */
export const TaskListManager: React.FC<TaskListManagerProps> = ({
  tasks,
  filteredTasks,
  activeTasks,
  completedTasks,
  currentView,
  selectedFilter,
  selectedPriority,
  filterCategories,
  user,
  toggleTask,
  updateTaskStatus,
  handleCreateTask,
  handleDeleteTask,
  handleEditTask,
  toggleSubtask,
  handleDateChange,
  openEditTask,
  createTaskMutation,
  deleteTaskMutation,
  setSelectedFilter,
  setSelectedPriority
}) => {
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const { toast } = useToast();

  // Helper function to map admin task categories to database categories
  const mapCategoryToDb = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'development': 'siso_app_dev',
      'marketing': 'instagram',
      'design': 'siso_app_dev',
      'client': 'main',
      'admin': 'main'
    };
    return categoryMap[category] || 'main';
  };

  // Helper function to map admin task status to database status
  const mapStatusToDb = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'not-started': 'pending',
      'in-progress': 'in_progress',
      'done': 'completed',
      'blocked': 'in_progress',
      'started': 'in_progress',
      'upcoming': 'pending'
    };
    return statusMap[status] || 'pending';
  };

  // Enhanced task create handler for kanban
  const handleKanbanTaskCreate = async (taskData: Partial<Task>) => {
    try {
      const dbTask = {
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        status: mapStatusToDb(taskData.status || 'not-started'),
        priority: taskData.priority || 'medium',
        category: mapCategoryToDb(taskData.category || 'admin'),
        assigned_to: user?.id,
        due_date: taskData.dueDate,
        duration: (taskData.estimatedHours || 1) * 60 // Convert hours to minutes
      };
      
      await createTaskMutation.mutateAsync(dbTask);
      
      toast({
        title: 'Task created',
        description: 'New task has been created successfully.'
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: 'destructive',
        title: 'Creation failed',
        description: error instanceof Error ? error.message : 'Could not create task.'
      });
    }
  };

  // Enhanced task delete handler for kanban
  const handleKanbanTaskDelete = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      
      toast({
        title: 'Task deleted',
        description: 'Task has been deleted successfully.'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Could not delete task.'
      });
    }
  };

  // Task duplicate handler for kanban
  const handleKanbanTaskDuplicate = async (task: Task) => {
    try {
      const duplicateTask = {
        title: `${task.title} (Copy)`,
        description: task.description || '',
        status: 'pending',
        priority: task.priority,
        category: mapCategoryToDb(task.category),
        assigned_to: user?.id,
        due_date: task.dueDate,
        duration: (task.estimatedHours || 1) * 60
      };
      
      await createTaskMutation.mutateAsync(duplicateTask);
      
      toast({
        title: 'Task duplicated',
        description: 'Task has been duplicated successfully.'
      });
    } catch (error) {
      console.error('Error duplicating task:', error);
      toast({
        variant: 'destructive',
        title: 'Duplication failed',
        description: error instanceof Error ? error.message : 'Could not duplicate task.'
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Main Task Content */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        {activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl text-gray-300 mb-2">No active tasks</h3>
            <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
              {selectedFilter === 'all' 
                ? "You're all caught up! Create a new task to get started."
                : `No tasks found for the current filter: ${selectedFilter}`
              }
            </p>
          </div>
        ) : (
          <>
            {currentView === 'list' && activeTasks.map((task, index) => (
              <EnhancedTaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={openEditTask}
                onSubtaskToggle={toggleSubtask}
                onDateChange={handleDateChange}
                showSubtasksOnHover={true}
                isLast={index === activeTasks.length - 1}
              />
            ))}
          </>
        )}
        
        {currentView === 'kanban' && (
          <KanbanView
            tasks={activeTasks}
            onTaskToggle={toggleTask}
            onTaskEdit={openEditTask}
            onTaskStatusUpdate={updateTaskStatus}
            onTaskCreate={handleKanbanTaskCreate}
            onTaskDelete={handleKanbanTaskDelete}
            onTaskDuplicate={handleKanbanTaskDuplicate}
            selectedFilter={selectedFilter}
            selectedPriority={selectedPriority}
            onFilterChange={setSelectedFilter}
            onPriorityChange={setSelectedPriority}
            filterCategories={filterCategories}
          />
        )}
        
        {currentView === 'calendar' && (
          <CalendarView
            tasks={filteredTasks}
            onTaskEdit={handleEditTask}
            onTaskCreate={handleCreateTask}
            onTaskDelete={handleDeleteTask}
            selectedFilter={selectedFilter}
            selectedPriority={selectedPriority}
            onFilterChange={setSelectedFilter}
            onPriorityChange={setSelectedPriority}
            filterCategories={filterCategories}
          />
        )}
      </div>

      {/* Completed Tasks Toggle Section */}
      <div className="flex-shrink-0 border-t border-white/20" style={{ backgroundColor: '#252525' }}>
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <button 
            onClick={() => setShowCompletedTasks(!showCompletedTasks)}
            className="flex items-center gap-2 text-sm text-green-300 hover:text-green-200 transition-colors"
            data-toggle-completed-tasks
          >
            {showCompletedTasks ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide Completed Tasks</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Show Completed Tasks ({completedTasks.length})</span>
              </>
            )}
          </button>
          
          <div className="text-xs text-gray-400">
            <span className="text-orange-300 font-medium">{activeTasks.length}</span> active, 
            <span className="text-green-300 font-medium ml-1">{completedTasks.length}</span> completed
          </div>
        </div>
      </div>

      {/* Completed Tasks List */}
      {showCompletedTasks && (
        <div className="flex-shrink-0 border-t border-white/20" style={{ backgroundColor: '#1a1a1a' }} data-completed-tasks-section>
          <div className="p-3 sm:p-4">
            <h3 className="text-lg font-semibold text-green-400 mb-4">Completed Tasks</h3>
            <div className="space-y-2">
              {completedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400">No completed tasks yet</p>
                  <p className="text-gray-500 text-sm mt-1">Complete some tasks to see them here!</p>
                </div>
              ) : (
                completedTasks.map((task, index) => (
                  <EnhancedTaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onSubtaskToggle={toggleSubtask}
                    onDateChange={handleDateChange}
                    showSubtasksOnHover={false}
                    isLast={index === completedTasks.length - 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};