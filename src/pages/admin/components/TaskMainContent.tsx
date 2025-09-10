import React from 'react';
import { TaskViewSelector } from './TaskViewSelector';
import { TaskListManager } from './TaskListManager';

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
  subtasks?: any[];
  progress?: number;
  description?: string;
}

interface TaskMainContentProps {
  selectedFilter: string;
  currentView: 'list' | 'kanban' | 'calendar';
  onViewChange: (view: 'list' | 'kanban' | 'calendar') => void;
  showViewDropdown: boolean;
  onToggleViewDropdown: (show: boolean) => void;
  tasks: Task[];
  filteredTasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  selectedPriority: string;
  filterCategories: any;
  user: any;
  toggleTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  handleCreateTask: (taskData: Partial<Task>) => void;
  handleDeleteTask: (taskId: string) => void;
  handleEditTask: (task: Task) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  handleDateChange: (taskId: string, date: Date | undefined) => void;
  openEditTask: (task: Task) => void;
  createTaskMutation: any;
  deleteTaskMutation: any;
  setSelectedFilter: (filter: string) => void;
  setSelectedPriority: (priority: string) => void;
}

const TaskMainContent: React.FC<TaskMainContentProps> = ({
  selectedFilter,
  currentView,
  onViewChange,
  showViewDropdown,
  onToggleViewDropdown,
  tasks,
  filteredTasks,
  activeTasks,
  completedTasks,
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
  const getFilterDisplayName = () => {
    if (selectedFilter === 'all') return 'ALL TASKS';
    if (selectedFilter === 'high') return 'HIGH PRIORITY';
    if (selectedFilter === 'medium') return 'MEDIUM PRIORITY';
    if (selectedFilter === 'low') return 'LOW PRIORITY';
    if (selectedFilter === 'overdue') return 'OVERDUE';
    if (selectedFilter === 'due-today') return 'DUE TODAY';
    if (selectedFilter === 'development') return 'DEVELOPMENT';
    if (selectedFilter === 'design') return 'DESIGN';
    if (selectedFilter === 'marketing') return 'MARKETING';
    if (selectedFilter === 'client') return 'CLIENT';
    if (selectedFilter === 'admin') return 'ADMIN';
    return selectedFilter.toUpperCase();
  };

  return (
    <div className="flex-1 overflow-hidden min-h-0 flex" style={{ backgroundColor: '#252525' }}>
      {/* Tasks List Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Today's Tasks Card */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-sm font-medium">
              <span className="text-gray-400">SISO AGENCY</span>
              <span className="text-white"> / {getFilterDisplayName()}</span>
            </h2>
            
            {/* View Dropdown */}
            <TaskViewSelector
              currentView={currentView}
              onViewChange={onViewChange}
              showViewDropdown={showViewDropdown}
              onToggleDropdown={onToggleViewDropdown}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Add your today's tasks card component here */}
          </div>
        </div>
        
        {/* Task List Management - Extracted Component */}
        <TaskListManager
          tasks={tasks}
          filteredTasks={filteredTasks}
          activeTasks={activeTasks}
          completedTasks={completedTasks}
          currentView={currentView}
          selectedFilter={selectedFilter}
          selectedPriority={selectedPriority}
          filterCategories={filterCategories}
          user={user}
          toggleTask={toggleTask}
          updateTaskStatus={updateTaskStatus}
          handleCreateTask={handleCreateTask}
          handleDeleteTask={handleDeleteTask}
          handleEditTask={handleEditTask}
          toggleSubtask={toggleSubtask}
          handleDateChange={handleDateChange}
          openEditTask={openEditTask}
          createTaskMutation={createTaskMutation}
          deleteTaskMutation={deleteTaskMutation}
          setSelectedFilter={setSelectedFilter}
          setSelectedPriority={setSelectedPriority}
        />
      </div>
    </div>
  );
};

export default TaskMainContent;