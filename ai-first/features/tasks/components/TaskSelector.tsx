import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Import, 
  Filter, 
  Clock, 
  Zap, 
  Target,
  CheckSquare,
  Square
} from 'lucide-react';
import { EnhancedTaskService, EnhancedTask } from '@/ai-first/core/task.service';
import { format } from 'date-fns';

interface TaskSelectorProps {
  workType: 'deep_focus' | 'light_focus';
  onTasksImport: (tasks: EnhancedTask[]) => void;
  currentDate: Date;
  existingTaskIds?: string[];
}

export const TaskSelector: React.FC<TaskSelectorProps> = ({
  workType,
  onTasksImport,
  currentDate,
  existingTaskIds = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<EnhancedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<EnhancedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load available tasks when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableTasks();
    }
  }, [isOpen, workType]);

  // Filter tasks based on search and filters
  useEffect(() => {
    let filtered = availableTasks.filter(task => {
      // Exclude already imported tasks
      if (existingTaskIds.includes(task.id)) return false;
      
      // Work type filter
      if (task.work_type !== workType) return false;
      
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      
      return true;
    });

    setFilteredTasks(filtered);
  }, [availableTasks, searchQuery, categoryFilter, priorityFilter, workType, existingTaskIds]);

  const loadAvailableTasks = async () => {
    setIsLoading(true);
    try {
      // Get all tasks for the user (not just today's)
      const tasks = await EnhancedTaskService.getTasksForDate(currentDate, workType);
      
      // Also get pending tasks from other dates that could be moved to today
      const allPendingTasks = await EnhancedTaskService.getTasksForDate(
        new Date(), // Get all pending tasks
        workType
      );
      
      // Combine and deduplicate
      const allTasks = [...tasks, ...allPendingTasks].filter((task, index, self) =>
        index === self.findIndex(t => t.id === task.id)
      );
      
      setAvailableTasks(allTasks);
    } catch (error) {
      console.error('Failed to load available tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleImportTasks = () => {
    const tasksToImport = availableTasks.filter(task => selectedTasks.includes(task.id));
    
    // Update the due date to current date for imported tasks
    const updatedTasks = tasksToImport.map(task => ({
      ...task,
      due_date: format(currentDate, 'yyyy-MM-dd')
    }));
    
    onTasksImport(updatedTasks);
    setSelectedTasks([]);
    setIsOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'urgent': return 'bg-orange-600 text-white';
      case 'high': return 'bg-yellow-600 text-white';
      case 'medium': return 'bg-blue-600 text-white';
      case 'low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const workTypeConfig = {
    deep_focus: {
      title: 'Deep Focus Tasks',
      description: 'Import tasks that require deep concentration and focus',
      icon: <Target className="h-4 w-4" />,
      color: 'orange'
    },
    light_focus: {
      title: 'Light Focus Tasks', 
      description: 'Import tasks for lighter cognitive load work',
      icon: <Zap className="h-4 w-4" />,
      color: 'green'
    }
  };

  const config = workTypeConfig[workType];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`
            border-2 transition-all duration-200 hover:scale-105
            ${workType === 'deep_focus' 
              ? 'border-orange-500 text-orange-400 hover:bg-orange-500/10' 
              : 'border-green-500 text-green-400 hover:bg-green-500/10'
            }
          `}
        >
          <Import className="h-3 w-3 mr-1" />
          Import Tasks
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white hover:bg-gray-700">All Categories</SelectItem>
                <SelectItem value="main" className="text-white hover:bg-gray-700">Main</SelectItem>
                <SelectItem value="deep_focus" className="text-white hover:bg-gray-700">Deep Focus</SelectItem>
                <SelectItem value="light_focus" className="text-white hover:bg-gray-700">Light Focus</SelectItem>
                <SelectItem value="client_work" className="text-white hover:bg-gray-700">Client Work</SelectItem>
                <SelectItem value="business_dev" className="text-white hover:bg-gray-700">Business Dev</SelectItem>
                <SelectItem value="learning" className="text-white hover:bg-gray-700">Learning</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white hover:bg-gray-700">All Priorities</SelectItem>
                <SelectItem value="critical" className="text-white hover:bg-gray-700">Critical</SelectItem>
                <SelectItem value="urgent" className="text-white hover:bg-gray-700">Urgent</SelectItem>
                <SelectItem value="high" className="text-white hover:bg-gray-700">High</SelectItem>
                <SelectItem value="medium" className="text-white hover:bg-gray-700">Medium</SelectItem>
                <SelectItem value="low" className="text-white hover:bg-gray-700">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Selected Tasks Summary */}
          {selectedTasks.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <span className="text-blue-300 text-sm">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                onClick={handleImportTasks}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Import Selected
              </Button>
            </div>
          )}
        </div>
        
        {/* Tasks List */}
        <ScrollArea className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading tasks...</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Filter className="h-8 w-8 mb-2 opacity-50" />
              <p>No tasks found matching your criteria</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:border-opacity-80
                    ${selectedTasks.includes(task.id)
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-800'
                    }
                  `}
                  onClick={() => handleTaskToggle(task.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {selectedTasks.includes(task.id) ? (
                        <CheckSquare className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white leading-relaxed">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        {task.estimated_duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimated_duration}m
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Focus: {task.focus_level}/5
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Flow: {task.flow_state_potential}/5
                        </div>
                        
                        {task.effort_points && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                              {task.effort_points}pt
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                              {tag}
                            </Badge>
                          ))}
                          {task.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                              +{task.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <span className="text-sm text-gray-400">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} available
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleImportTasks}
              disabled={selectedTasks.length === 0}
              className={`
                ${workType === 'deep_focus' 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-green-600 hover:bg-green-700'
                } text-white
              `}
            >
              Import {selectedTasks.length > 0 ? `(${selectedTasks.length})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};