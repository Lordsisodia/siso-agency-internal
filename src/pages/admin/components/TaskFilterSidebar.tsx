import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { 
  Filter,
  Plus,
  Flag,
  BarChart3,
  FolderCode,
  Users
} from 'lucide-react';

// Types extracted from AdminTasks.tsx
interface TaskCounts {
  all: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
  development: number;
  marketing: number;
  design: number;
  client: number;
  admin: number;
}

interface TaskFilterSidebarProps {
  selectedFilter: string;
  selectedPriority: string;
  onFilterChange: (filter: string, priority?: string) => void;
  taskCounts: TaskCounts;
  onAddProject: (projectName: string) => Promise<void>;
}

/**
 * TaskFilterSidebar - Left sidebar filtering component
 * 
 * Extracted from AdminTasks.tsx (1,338 lines → focused component)
 * Handles all task filtering logic and project management
 */
export const TaskFilterSidebar: React.FC<TaskFilterSidebarProps> = ({
  selectedFilter,
  selectedPriority,
  onFilterChange,
  taskCounts,
  onAddProject
}) => {
  const [newProjectName, setNewProjectName] = React.useState('');
  const [isAddingProject, setIsAddingProject] = React.useState(false);

  // Filter configuration - extracted from AdminTasks.tsx
  const filterCategories = {
    general: [
      { value: 'all', label: 'All Tasks', icon: '📋', color: 'bg-gray-600' },
      { value: 'active', label: 'Active Tasks', icon: '🔄', color: 'bg-blue-600' },
      { value: 'completed', label: 'Completed Tasks', icon: '✅', color: 'bg-green-600' }
    ],
    priority: [
      { value: 'urgent', label: 'Urgent', icon: '🔥', color: 'bg-red-500' },
      { value: 'high', label: 'High Priority', icon: '🔴', color: 'bg-red-500' },
      { value: 'medium', label: 'Medium Priority', icon: '🟡', color: 'bg-yellow-500' },
      { value: 'low', label: 'Low Priority', icon: '🟢', color: 'bg-green-500' }
    ],
    projects: [
      { value: 'ubahcrypt', label: 'Ubahcrypt', icon: '🔐', color: 'bg-purple-500' },
      { value: 'siso-agency', label: 'SISO Agency App', icon: '🏢', color: 'bg-blue-500' },
      { value: 'excursions', label: 'We Are Excursions', icon: '🏝️', color: 'bg-teal-500' },
      { value: 'instagram', label: 'Instagram Marketing', icon: '📱', color: 'bg-pink-500' },
      { value: 'business-ops', label: 'Business Operations', icon: '💼', color: 'bg-orange-500' },
      { value: 'siso-life', label: 'SISO Life', icon: '🌟', color: 'bg-indigo-500' }
    ]
  };

  const categoryOptions = [
    { value: 'development', label: 'Development', icon: FolderCode, count: taskCounts.development },
    { value: 'marketing', label: 'Marketing', icon: BarChart3, count: taskCounts.marketing },
    { value: 'design', label: 'Design', icon: '🎨', count: taskCounts.design },
    { value: 'client', label: 'Client Work', icon: Users, count: taskCounts.client },
    { value: 'admin', label: 'Admin', icon: '⚙️', count: taskCounts.admin }
  ];

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    
    setIsAddingProject(true);
    try {
      await onAddProject(newProjectName.trim());
      setNewProjectName('');
    } finally {
      setIsAddingProject(false);
    }
  };

  const getTaskCount = (filterValue: string) => {
    switch (filterValue) {
      case 'all': return taskCounts.all;
      case 'urgent': return taskCounts.urgent;
      case 'high': return taskCounts.high;
      case 'medium': return taskCounts.medium;
      case 'low': return taskCounts.low;
      case 'development': return taskCounts.development;
      case 'marketing': return taskCounts.marketing;
      case 'design': return taskCounts.design;
      case 'client': return taskCounts.client;
      case 'admin': return taskCounts.admin;
      default: return 0;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-medium text-gray-200">Task Filters</h3>
        </div>
        
        {/* Add Project Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-orange-400">
              <Plus className="w-3 h-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-200">Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={handleAddProject}
                  disabled={!newProjectName.trim() || isAddingProject}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isAddingProject ? 'Adding...' : 'Add Project'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* General Filters */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">General</h4>
          <div className="space-y-1">
            {filterCategories.general.map((filter) => {
              const isSelected = selectedFilter === filter.value;
              const taskCount = getTaskCount(filter.value);
              
              return (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{filter.icon}</span>
                    <span>{filter.label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                    {taskCount}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Filters */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Priority</h4>
          <div className="space-y-1">
            {filterCategories.priority.map((filter) => {
              const isSelected = selectedFilter === filter.value;
              const taskCount = getTaskCount(filter.value);
              
              return (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{filter.icon}</span>
                    <span>{filter.label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                    {taskCount}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Filters */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Projects</h4>
          <div className="space-y-1">
            {filterCategories.projects.map((filter) => {
              const isSelected = selectedFilter === filter.value;
              // Project task counts would need to be calculated differently
              // For now, showing 0 as placeholder
              const taskCount = 0;
              
              return (
                <button
                  key={filter.value}
                  onClick={() => onFilterChange(filter.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{filter.icon}</span>
                    <span>{filter.label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                    {taskCount}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Categories</h4>
          <div className="space-y-1">
            {categoryOptions.map((category) => {
              const isSelected = selectedFilter === category.value;
              const IconComponent = typeof category.icon === 'string' ? 
                () => <span>{category.icon}</span> : category.icon;
              
              return (
                <button
                  key={category.value}
                  onClick={() => onFilterChange(category.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <span>{category.label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                    {category.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Total Tasks:</span>
            <span className="text-gray-300">{taskCounts.all}</span>
          </div>
          <div className="flex justify-between">
            <span>High Priority:</span>
            <span className="text-red-400">{taskCounts.high + taskCounts.urgent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};