import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Settings,
  Search,
  Clock,
  User,
  Flag,
  AlertTriangle,
  Target,
  Heart,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';

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

interface CalendarViewProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskCreate?: (task: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  // Filter props to match AdminTasks functionality
  selectedFilter?: string;
  selectedPriority?: string;
  onFilterChange?: (filter: string) => void;
  onPriorityChange?: (priority: string) => void;
  filterCategories?: FilterCategories;
}

// Day card data interface
interface DayCardData {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
  hasLifeLockData: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskEdit,
  onTaskCreate,
  onTaskDelete,
  selectedFilter = 'all',
  selectedPriority = 'all',
  onFilterChange,
  onPriorityChange,
  filterCategories
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get calendar month data
  const monthData = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get all days from the first Monday before month start to the last Sunday after month end
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay()); // Go to Sunday
    
    const calendarEnd = new Date(monthEnd);
    calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay())); // Go to Saturday
    
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return allDays.map(date => {
      // Filter tasks for this date
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        return isSameDay(new Date(task.dueDate), date);
      });

      // Apply filters to day tasks
      let filteredDayTasks = dayTasks;
      if (selectedFilter && selectedFilter !== 'all') {
        if (selectedFilter.startsWith('priority-')) {
          const priority = selectedFilter.replace('priority-', '');
          filteredDayTasks = filteredDayTasks.filter(task => task.priority === priority);
        } else if (selectedFilter.startsWith('status-')) {
          const status = selectedFilter.replace('status-', '');
          filteredDayTasks = filteredDayTasks.filter(task => task.status === status);
        } else if (selectedFilter.startsWith('category-')) {
          const category = selectedFilter.replace('category-', '');
          filteredDayTasks = filteredDayTasks.filter(task => task.category === category);
        }
      }

      if (selectedPriority && selectedPriority !== 'all') {
        filteredDayTasks = filteredDayTasks.filter(task => task.priority === selectedPriority);
      }

      if (searchTerm) {
        filteredDayTasks = filteredDayTasks.filter(task =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return {
        date,
        tasks: filteredDayTasks,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        hasLifeLockData: Math.random() > 0.7 // Simulated - you can replace with actual LifeLock data check
      } as DayCardData;
    });
  }, [currentDate, tasks, selectedFilter, selectedPriority, searchTerm]);

  // Handle day click - navigate to LifeLock day view
  const handleDayClick = (dayData: DayCardData) => {
    const dateString = format(dayData.date, 'yyyy-MM-dd');
    navigate(`/admin/life-lock/day?date=${dateString}`);
  };

  // Handle task click
  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Priority dot color
  const getPriorityDotColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-900 rounded-lg border border-orange-500/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Calendar View</h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-800 border-gray-600" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-white">General</label>
                  <Select value={selectedFilter} onValueChange={onFilterChange}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="All Tasks" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {filterCategories?.general.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={selectedPriority} onValueChange={onPriorityChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {filterCategories?.priority.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-600">
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Month Navigation */}
          <div className="flex items-center gap-2 border border-gray-600 rounded-md bg-gray-800">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth} className="text-white hover:bg-gray-700">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="px-4 text-white hover:bg-gray-700">
              {format(currentDate, 'MMMM yyyy')}
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNextMonth} className="text-white hover:bg-gray-700">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Add Task */}
          {onTaskCreate && (
            <Button size="sm" onClick={() => onTaskCreate({ 
              title: 'New Task',
              dueDate: new Date().toISOString(),
              status: 'not-started',
              priority: 'medium',
              category: 'admin'
            })} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-gray-900 rounded-lg border border-orange-500/30 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-700 bg-gray-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-300 border-r border-gray-700 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 h-full">
          {monthData.map((dayData, index) => (
            <div
              key={index}
              className={cn(
                "border-r border-b border-gray-700 last:border-r-0 p-2 cursor-pointer transition-all duration-200 hover:bg-gray-800 flex flex-col min-h-[120px] bg-gray-900",
                !dayData.isCurrentMonth && "bg-gray-800/50 text-gray-500",
                dayData.isToday && "bg-orange-500/20 border-orange-400"
              )}
              onClick={() => handleDayClick(dayData)}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium text-gray-300",
                  dayData.isToday && "bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                )}>
                  {format(dayData.date, 'd')}
                </span>
                
                {/* LifeLock Indicator */}
                {dayData.hasLifeLockData && (
                  <div className="flex gap-1">
                    <Target className="w-3 h-3 text-orange-500" />
                    <Heart className="w-3 h-3 text-red-500" />
                    <Brain className="w-3 h-3 text-purple-500" />
                  </div>
                )}
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-1">
                {dayData.tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded bg-gray-800 hover:bg-gray-700 flex items-center gap-1 cursor-pointer text-gray-300"
                    onClick={(e) => handleTaskClick(task, e)}
                  >
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getPriorityDotColor(task.priority))} />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                
                {/* Show more indicator */}
                {dayData.tasks.length > 3 && (
                  <div className="text-xs text-gray-400 pl-3">
                    +{dayData.tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-orange-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <CalendarIcon className="w-5 h-5 text-orange-400" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-white">{selectedTask.title}</h3>
                  <p className="text-gray-300 mb-4">{selectedTask.description}</p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn("text-white", getPriorityDotColor(selectedTask.priority))}
                >
                  {selectedTask.priority}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Due: {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'MMM dd, yyyy') : 'No due date'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline">
                    {selectedTask.status}
                  </Badge>
                </div>
                {selectedTask.assignee && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedTask.assignee}</span>
                  </div>
                )}
                {selectedTask.estimatedHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedTask.estimatedHours}h estimated</span>
                  </div>
                )}
              </div>

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  onTaskEdit(selectedTask);
                  setIsTaskModalOpen(false);
                }}>
                  Edit Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;