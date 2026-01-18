/**
 * Task Selector - Browse and select tasks for daily planning
 * 
 * This component allows users to:
 * 1. Browse all available tasks by category
 * 2. Select tasks they want to do today
 * 3. Estimate time for tasks without durations
 * 4. See selected vs available tasks
 * 5. Quick select by priority or category
 */

import React, { useState } from 'react';
import { Check, Clock, Plus, Filter, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskWithEstimation } from '../hooks/useDailyPlanning';

interface TaskSelectorProps {
  availableTasks: TaskWithEstimation[];
  selectedTaskIds: string[];
  onSelectTask: (taskId: string) => void;
  onDeselectTask: (taskId: string) => void;
  onUpdateEstimation: (taskId: string, duration: number) => void;
}

export function TaskSelector({
  availableTasks,
  selectedTaskIds,
  onSelectTask,
  onDeselectTask,
  onUpdateEstimation
}: TaskSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Group tasks by category
  const tasksByCategory = {
    morning: availableTasks.filter(t => t.category === 'morning'),
    'light-work': availableTasks.filter(t => t.category === 'light-work'),
    'deep-work': availableTasks.filter(t => t.category === 'deep-work'),
    wellness: availableTasks.filter(t => t.category === 'wellness')
  };

  // Filter tasks based on search and filters
  const filterTasks = (tasks: TaskWithEstimation[]) => {
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      // Priority filter
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      // Completed filter
      const matchesCompleted = showCompleted || !task.completed;
      
      return matchesSearch && matchesPriority && matchesCompleted;
    });
  };

  // Quick select functions
  const selectAllByPriority = (priority: 'high' | 'medium') => {
    availableTasks
      .filter(task => task.priority === priority && !task.completed && !selectedTaskIds.includes(task.id))
      .forEach(task => onSelectTask(task.id));
  };

  const selectAllByCategory = (category: string) => {
    tasksByCategory[category as keyof typeof tasksByCategory]
      .filter(task => !task.completed && !selectedTaskIds.includes(task.id))
      .forEach(task => onSelectTask(task.id));
  };

  // Task time estimation component
  const TaskTimeEstimation = ({ task }: { task: TaskWithEstimation }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempDuration, setTempDuration] = useState(task.estimatedDuration);

    const handleSave = () => {
      onUpdateEstimation(task.id, tempDuration);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={tempDuration}
            onChange={(e) => setTempDuration(parseInt(e.target.value) || 30)}
            className="w-16 h-6 text-xs"
            min="5"
            max="480"
          />
          <Button size="sm" onClick={handleSave} className="h-6 px-2 text-xs">
            Save
          </Button>
        </div>
      );
    }

    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-100 ${
          task.hasUserEstimate ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <Clock className="h-3 w-3" />
        {task.estimatedDuration}m
        {!task.hasUserEstimate && <span className="text-xs text-gray-400">(est)</span>}
      </button>
    );
  };

  // Individual task component
  const TaskItem = ({ task }: { task: TaskWithEstimation }) => {
    const isSelected = selectedTaskIds.includes(task.id);
    
    return (
      <Card className={`p-3 transition-all ${isSelected ? 'border-blue-300 bg-blue-50' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Selection Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectTask(task.id);
              } else {
                onDeselectTask(task.id);
              }
            }}
            disabled={task.completed}
            className="mt-1"
          />
          
          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h4>
              
              <Badge 
                variant={task.priority === 'high' ? 'destructive' : 
                         task.priority === 'medium' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {task.priority}
              </Badge>
              
              {task.completed && (
                <Badge variant="outline" className="text-xs text-green-600">
                  Done
                </Badge>
              )}
            </div>
            
            {task.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            )}
            
            {/* Time Estimation */}
            <TaskTimeEstimation task={task} />
          </div>
        </div>
      </Card>
    );
  };

  // Category panel component
  const CategoryPanel = ({ 
    category, 
    tasks, 
    title, 
    icon 
  }: { 
    category: string;
    tasks: TaskWithEstimation[];
    title: string;
    icon: string;
  }) => {
    const filteredTasks = filterTasks(tasks);
    const selectedCount = filteredTasks.filter(t => selectedTaskIds.includes(t.id)).length;
    const availableCount = filteredTasks.filter(t => !t.completed).length;
    
    return (
      <div className="space-y-3">
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <h3 className="font-medium">{title}</h3>
            <Badge variant="outline" className="text-xs">
              {selectedCount}/{availableCount}
            </Badge>
          </div>
          
          {availableCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectAllByCategory(category)}
              className="text-xs h-6 px-2"
            >
              Select All
            </Button>
          )}
        </div>
        
        {/* Tasks List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No tasks found
            </p>
          ) : (
            filteredTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </div>
      </div>
    );
  };

  const selectedCount = selectedTaskIds.length;
  const totalAvailable = availableTasks.filter(t => !t.completed).length;

  return (
    <div className="space-y-4">
      {/* Header with Selection Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Select Tasks for Today</h2>
          <p className="text-sm text-gray-600">
            {selectedCount} selected of {totalAvailable} available tasks
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => selectAllByPriority('high')}
            className="flex items-center gap-1"
          >
            <Zap className="h-3 w-3" />
            High Priority
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => selectAllByPriority('medium')}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Medium Priority
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Priority:</Label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {/* Show Completed */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            />
            <Label htmlFor="show-completed" className="text-sm">
              Show completed
            </Label>
          </div>
        </div>
      </Card>

      {/* Tasks by Category */}
      <Tabs defaultValue="morning" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="morning">🌅 Morning</TabsTrigger>
          <TabsTrigger value="light-work">📝 Light Work</TabsTrigger>
          <TabsTrigger value="deep-work">💻 Deep Work</TabsTrigger>
          <TabsTrigger value="wellness">💪 Wellness</TabsTrigger>
        </TabsList>
        
        <TabsContent value="morning" className="mt-4">
          <CategoryPanel
            category="morning"
            tasks={tasksByCategory.morning}
            title="Morning Routine"
            icon="🌅"
          />
        </TabsContent>
        
        <TabsContent value="light-work" className="mt-4">
          <CategoryPanel
            category="light-work"
            tasks={tasksByCategory['light-work']}
            title="Light Work Tasks"
            icon="📝"
          />
        </TabsContent>
        
        <TabsContent value="deep-work" className="mt-4">
          <CategoryPanel
            category="deep-work"
            tasks={tasksByCategory['deep-work']}
            title="Deep Work Tasks"
            icon="💻"
          />
        </TabsContent>
        
        <TabsContent value="wellness" className="mt-4">
          <CategoryPanel
            category="wellness"
            tasks={tasksByCategory.wellness}
            title="Wellness & Exercise"
            icon="💪"
          />
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-green-600" />
            <h3 className="font-medium text-green-800">Selected for Today</h3>
          </div>
          
          <div className="text-sm text-green-700">
            {selectedCount} tasks selected • Next step: Assign time slots
          </div>
        </Card>
      )}
    </div>
  );
}