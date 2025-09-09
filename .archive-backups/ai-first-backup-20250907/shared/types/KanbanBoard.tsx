import React, { useState, useMemo } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Clock,
  User,
  Flag,
  Calendar,
  Edit2,
  MoreHorizontal,
  AlertTriangle,
  AlertCircle,
  CheckSquare,
  Search,
  Plus,
  Filter,
  Settings,
  Trash2,
  Copy,
  Archive,
  Eye,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Task interfaces matching AdminTasks.tsx
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
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  category: 'development' | 'design' | 'marketing' | 'client' | 'admin';
  tags?: string[];
  estimatedHours?: number;
  subtasks?: Subtask[];
  progress?: number;
  description?: string;
}

// Filter types from AdminTasks.tsx
interface FilterOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface FilterCategories {
  general: FilterOption[];
  priority: FilterOption[];
  projects: FilterOption[];
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
  onTaskCreate?: (task: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDuplicate?: (task: Task) => void;
  // Filter props to match AdminTasks functionality
  selectedFilter?: string;
  selectedPriority?: string;
  onFilterChange?: (filter: string) => void;
  onPriorityChange?: (priority: string) => void;
  filterCategories?: FilterCategories;
}

interface KanbanColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
  onTaskCreate?: (status: Task['status']) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDuplicate?: (task: Task) => void;
  color: string;
  icon: React.ReactNode;
  selectedTasks?: Set<string>;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
  bulkActionsMode?: boolean;
}

const KanbanCard: React.FC<{
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStatusUpdate: (taskId: string, newStatus: Task['status']) => void;
  onDelete?: (taskId: string) => void;
  onDuplicate?: (task: Task) => void;
  isSelected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
  bulkActionsMode?: boolean;
  onPreview?: (task: Task) => void;
}> = ({ 
  task, 
  onToggle, 
  onEdit, 
  onStatusUpdate, 
  onDelete, 
  onDuplicate, 
  isSelected = false, 
  onSelect, 
  bulkActionsMode = false,
  onPreview 
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (bulkActionsMode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (bulkActionsMode) {
      e.preventDefault();
      onSelect?.(task.id, !isSelected);
    } else if (onPreview) {
      onPreview(task);
    }
  };

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!bulkActionsMode) {
      onEdit(task);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-300';
      case 'medium':
        return 'text-orange-300';
      case 'low':
        return 'text-green-300';
      default:
        return 'text-orange-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'medium':
        return <AlertCircle className="h-3 w-3" />;
      case 'low':
        return <Clock className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'design':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'marketing':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'client':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'admin':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} days`, color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-400' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-400' };
    return { text: `Due in ${diffDays} days`, color: 'text-green-400' };
  };

  const dueDateInfo = formatDueDate(task.dueDate);
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div 
      draggable={!bulkActionsMode}
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      className={cn(
        "bg-gradient-to-br from-[#1f2533]/90 to-[#252229]/90 border rounded-lg p-3 mb-3 transition-all duration-200 group relative",
        bulkActionsMode ? "cursor-pointer" : "cursor-move",
        isSelected ? "border-[#9b87f5] ring-2 ring-[#9b87f5]/30" : "border-transparent hover:border-white"
      )}
    >
      {/* Bulk Selection Checkbox */}
      {bulkActionsMode && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(task.id, Boolean(checked))}
            className="bg-[#1f2533] border-[#3a3942]"
          />
        </div>
      )}

      {/* Header - Compact */}
      <div className={cn("flex items-start justify-between mb-2", bulkActionsMode && "ml-6")}>
        <h4 className="text-sm font-medium text-gray-100 line-clamp-1 flex-1 mr-2">
          {task.title}
        </h4>
        
        {!bulkActionsMode && (
          <div className="flex items-center gap-1">
            {/* Quick Actions on Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview?.(task);
                }}
                className="h-5 w-5 p-0 text-gray-400 hover:text-gray-200 hover:bg-blue-500/20"
                title="Quick Preview"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="h-5 w-5 p-0 text-gray-400 hover:text-gray-200 hover:bg-[#9b87f5]/20"
                title="Edit Task"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              
              {/* More Actions Dropdown */}
              <Popover open={showQuickActions} onOpenChange={setShowQuickActions}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-500/20"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1 bg-white border-gray-200 shadow-lg" align="end">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate?.(task);
                        setShowQuickActions(false);
                      }}
                      className="w-full justify-start text-xs text-gray-700 hover:bg-gray-100"
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task.id);
                        setShowQuickActions(false);
                      }}
                      className="w-full justify-start text-xs text-gray-700 hover:bg-gray-100"
                    >
                      <Archive className="h-3 w-3 mr-2" />
                      {task.completed ? 'Mark Pending' : 'Mark Complete'}
                    </Button>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(task.id);
                          setShowQuickActions(false);
                        }}
                        className="w-full justify-start text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>

      {/* Tags Row (if tags exist) */}
      {task.tags && task.tags.length > 0 && (
        <div className={cn("flex flex-wrap gap-1 mb-2", bulkActionsMode && "ml-6")}>
          {task.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 bg-[#9b87f5]/10 text-[#9b87f5] border-[#9b87f5]/30">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-500/10 text-gray-400 border-gray-500/30">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Second Line: Priority, Category, Time, Assignee */}
      <div className={cn("flex items-center justify-between mb-2", bulkActionsMode && "ml-6")}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)}
          </div>
          <span className="text-xs text-gray-400 capitalize">{task.category}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {task.estimatedHours && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimatedHours}h
            </span>
          )}
          {task.assignee && (
            <Avatar className="h-4 w-4">
              <AvatarFallback className="bg-[#1f2533] text-xs text-gray-300 text-[10px]">
                {task.assignee.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Progress Bar (if has subtasks) - Very Compact */}
      {totalSubtasks > 0 && (
        <div className={cn("mb-2", bulkActionsMode && "ml-6")}>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{completedSubtasks}/{totalSubtasks} tasks</span>
            <span>{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
          </div>
          <div className="w-full bg-[#1f2533]/50 rounded-full h-1">
            <div
              className="bg-[#9b87f5] h-1 rounded-full transition-all duration-300"
              style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Due Date (if exists) */}
      {dueDateInfo && (
        <div className={cn("text-xs", bulkActionsMode && "ml-6")}>
          <span className={cn("flex items-center gap-1", dueDateInfo.color)}>
            <Calendar className="h-3 w-3" />
            {dueDateInfo.text}
          </span>
        </div>
      )}
    </div>
  );
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  onTaskToggle,
  onTaskEdit,
  onTaskStatusUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskDuplicate,
  color,
  icon,
  selectedTasks = new Set(),
  onTaskSelect,
  bulkActionsMode = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && taskId.trim()) {
      onTaskStatusUpdate(taskId, status);
    }
  };

  const handleCreateTask = () => {
    if (onTaskCreate) {
      onTaskCreate(status);
    }
  };

  return (
    <div className="flex-1 min-w-[300px] max-w-[350px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color.replace('bg-', 'bg-')}`}></div>
          <h3 className="font-medium text-gray-200 text-sm">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-transparent border-gray-600/50 text-gray-400 text-xs px-2 py-0.5">
            {tasks.length}
          </Badge>
          
          {/* Add Task Button */}
          {onTaskCreate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCreateTask}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200 hover:bg-[#9b87f5]/20 rounded"
              title={`Add task to ${title}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Tasks Container */}
      <div 
        className={cn(
          "min-h-[400px] p-3 rounded-lg transition-all duration-200",
          isDragOver ? "bg-[#9b87f5]/10 border-2 border-[#9b87f5]/50 border-dashed" : "border-2 border-transparent"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onToggle={onTaskToggle}
            onEdit={onTaskEdit}
            onStatusUpdate={onTaskStatusUpdate}
            onDelete={onTaskDelete}
            onDuplicate={onTaskDuplicate}
            isSelected={selectedTasks.has(task.id)}
            onSelect={onTaskSelect}
            bulkActionsMode={bulkActionsMode}
            onPreview={onTaskEdit} // Use edit as preview for now
          />
        ))}
        
        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="mb-4">
              {icon}
            </div>
            <p className="text-sm mb-2">No {title.toLowerCase()}</p>
            {onTaskCreate && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateTask}
                className="text-xs text-gray-400 border-gray-600/50 hover:border-[#9b87f5]/60 hover:text-[#9b87f5]"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Task
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskToggle,
  onTaskEdit,
  onTaskStatusUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskDuplicate,
  selectedFilter = 'all',
  selectedPriority = 'all',
  onFilterChange,
  onPriorityChange,
  filterCategories
}) => {
  // Local state for board features
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkActionsMode, setBulkActionsMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBoardSettings, setShowBoardSettings] = useState(false);
  const [columnOrder, setColumnOrder] = useState(['not-started', 'in-progress', 'blocked', 'done']);

  // Default filter categories if not provided
  const defaultFilterCategories: FilterCategories = {
    general: [
      { value: 'all', label: 'All Tasks', icon: '📋', color: 'bg-gray-600' }
    ],
    priority: [
      { value: 'high', label: 'High Priority', icon: '🔴', color: 'bg-red-500' },
      { value: 'medium', label: 'Medium Priority', icon: '🟡', color: 'bg-yellow-500' },
      { value: 'low', label: 'Low Priority', icon: '🟢', color: 'bg-green-500' }
    ],
    projects: [
      { value: 'ubahcrypt', label: 'Ubahcrypt', icon: '🔐', color: 'bg-purple-500' },
      { value: 'siso-agency', label: 'SISO Agency App', icon: '🏢', color: 'bg-blue-500' },
      { value: 'excursions', label: 'We Are Excursions', icon: '🏝️', color: 'bg-teal-500' },
      { value: 'instagram', label: 'Instagram Marketing', icon: '📱', color: 'bg-pink-500' },
      { value: 'business-ops', label: 'Business Operations', icon: '💼', color: 'bg-orange-500' }
    ]
  };

  const categories = filterCategories || defaultFilterCategories;

  // Define columns with their corresponding statuses
  const allColumns = [
    {
      title: 'Not Started',
      status: 'not-started' as const,
      color: 'bg-gray-600',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      title: 'In Progress',
      status: 'in-progress' as const,
      color: 'bg-blue-600',
      icon: <Clock className="h-4 w-4" />
    },
    {
      title: 'Blocked',
      status: 'blocked' as const,
      color: 'bg-purple-600',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      title: 'Done',
      status: 'done' as const,
      color: 'bg-green-600',
      icon: <CheckSquare className="h-4 w-4" />
    }
  ];

  // Reorder columns based on user preference
  const columns = columnOrder.map(statusId => 
    allColumns.find(col => col.status === statusId)
  ).filter(Boolean) as typeof allColumns;

  // Apply filters and search to tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.assignee?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply main filter
    if (selectedFilter !== 'all') {
      // Priority filters
      if (['high', 'medium', 'low'].includes(selectedFilter)) {
        filtered = filtered.filter(task => task.priority === selectedFilter);
      } else {
        // Project filters
        const projectFilters: { [key: string]: string[] } = {
          'ubahcrypt': ['[Ubahcrypt]'],
          'siso-agency': ['[SISO Agency App]'],
          'excursions': ['[We Are Excursions]'],
          'instagram': ['[Instagram Marketing]'],
          'business-ops': ['[Business Operations]']
        };
        
        const keywords = projectFilters[selectedFilter];
        if (keywords) {
          filtered = filtered.filter(task => 
            keywords.some(keyword => task.title.includes(keyword))
          );
        }
      }
    }

    // Apply priority sub-filter (only when not already filtering by priority)
    if (selectedPriority !== 'all' && !['high', 'medium', 'low'].includes(selectedFilter)) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    return filtered;
  }, [tasks, searchQuery, selectedFilter, selectedPriority]);

  // Group filtered tasks by status
  const getTasksForStatus = (status: Task['status']) => {
    return filteredTasks.filter(task => {
      // Map different status values to column statuses
      switch (status) {
        case 'not-started':
          return task.status === 'not-started' || task.status === 'upcoming';
        case 'in-progress':
          return task.status === 'in-progress' || task.status === 'started';
        case 'blocked':
          return task.status === 'blocked';
        case 'done':
          return task.status === 'done' || task.completed;
        default:
          return false;
      }
    });
  };

  // Bulk actions handlers
  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkAction = (action: 'delete' | 'complete' | 'move') => {
    selectedTasks.forEach(taskId => {
      switch (action) {
        case 'delete':
          onTaskDelete?.(taskId);
          break;
        case 'complete':
          onTaskToggle(taskId);
          break;
        case 'move':
          // For now, just move to in-progress
          onTaskStatusUpdate(taskId, 'in-progress');
          break;
      }
    });
    setSelectedTasks(new Set());
    setBulkActionsMode(false);
  };

  const handleCreateTaskInColumn = (status: Task['status']) => {
    if (onTaskCreate) {
      const newTask: Partial<Task> = {
        status,
        priority: 'medium',
        category: 'admin',
        title: '',
        completed: false
      };
      onTaskCreate(newTask);
    }
  };

  // Get current filter option for display
  const getCurrentFilterOption = () => {
    const allOptions = [
      ...categories.general,
      ...categories.priority,
      ...categories.projects
    ];
    return allOptions.find(option => option.value === selectedFilter) || categories.general[0];
  };

  const currentFilterOption = getCurrentFilterOption();

  return (
    <div className="h-full flex flex-col">
      {/* Keep only essential search functionality */}
      <div className="flex-shrink-0 p-4 border-b border-[#3a3942]/30 bg-[#1f2533]/50">
        {/* Search Only */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-10 bg-[#1f2533]/50 border-[#3a3942]/50 text-gray-200 placeholder-gray-500 text-sm"
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0 text-gray-400 hover:text-gray-200"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-4 px-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              title={column.title}
              status={column.status}
              tasks={getTasksForStatus(column.status)}
              onTaskToggle={onTaskToggle}
              onTaskEdit={onTaskEdit}
              onTaskStatusUpdate={onTaskStatusUpdate}
              onTaskCreate={handleCreateTaskInColumn}
              onTaskDelete={onTaskDelete}
              onTaskDuplicate={onTaskDuplicate}
              color={column.color}
              icon={column.icon}
              selectedTasks={selectedTasks}
              onTaskSelect={handleTaskSelect}
              bulkActionsMode={bulkActionsMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};