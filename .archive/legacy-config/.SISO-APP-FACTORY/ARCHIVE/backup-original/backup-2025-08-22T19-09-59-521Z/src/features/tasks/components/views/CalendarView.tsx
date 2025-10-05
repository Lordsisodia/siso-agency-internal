/**
 * CalendarView Component
 * Calendar view for task management with due date visualization
 */

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '../../types/task.types';
import { getPriorityColor, isTaskOverdue } from '../../utils/taskHelpers';

interface CalendarViewProps {
  tasks: Task[];
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onCreateTask?: () => void;
}

interface CalendarTaskProps {
  task: Task;
  onTaskSelect?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
}

const CalendarTask: React.FC<CalendarTaskProps> = ({
  task,
  onTaskSelect,
  onTaskEdit
}) => {
  const isOverdue = isTaskOverdue(task);
  
  const handleClick = () => {
    onTaskSelect?.(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskEdit?.(task.id);
  };

  return (
    <div
      className={cn(
        'p-2 mb-1 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow',
        isOverdue ? 'bg-red-100 border border-red-200' : 'bg-blue-100 border border-blue-200'
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate flex-1 pr-1">
          {task.title}
        </span>
        <Badge className={cn(
          'text-xs px-1 py-0',
          getPriorityColor(task.priority)
        )}>
          {task.priority.charAt(0).toUpperCase()}
        </Badge>
      </div>
      {task.assigned_to && (
        <div className="text-gray-600 mt-1 truncate">
          {task.assigned_to}
        </div>
      )}
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskSelect,
  onTaskEdit,
  onCreateTask
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      const dateKey = new Date(task.due_date).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  // Get tasks for selected date
  const selectedDateTasks = tasksByDate[selectedDate.toDateString()] || [];

  // Navigate months
  const previousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Custom day renderer to show task indicators
  const renderDay = (date: Date) => {
    const dateKey = date.toDateString();
    const dayTasks = tasksByDate[dateKey] || [];
    const hasOverdue = dayTasks.some(task => isTaskOverdue(task));
    
    return (
      <div className="relative w-full h-full">
        <span>{date.getDate()}</span>
        {dayTasks.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              hasOverdue ? 'bg-red-500' : 'bg-blue-500'
            )} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-view h-full p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {currentMonth.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousMonth}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextMonth}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setCurrentMonth(today);
                      setSelectedDate(today);
                    }}
                  >
                    Today
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full"
                components={{
                  Day: ({ date }) => renderDay(date)
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Task List for Selected Date */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateTask}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedDateTasks.length > 0 && (
                <Badge variant="secondary">
                  {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedDateTasks.map((task) => (
                  <CalendarTask
                    key={task.id}
                    task={task}
                    onTaskSelect={onTaskSelect}
                    onTaskEdit={onTaskEdit}
                  />
                ))}
                
                {selectedDateTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm mb-2">No tasks scheduled</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateTask}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add task
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;