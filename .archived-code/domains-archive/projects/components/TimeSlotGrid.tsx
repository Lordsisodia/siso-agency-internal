/**
 * Time Slot Grid - Visual time boxing interface for daily planning
 * 
 * This component provides:
 * 1. Visual grid of time slots for the day (e.g., 9:00-9:30, 9:30-10:00)
 * 2. Drag and drop assignment of tasks to time slots
 * 3. Visual feedback for time conflicts and overruns
 * 4. Unscheduled tasks sidebar
 * 5. Time utilization analytics
 */

import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Plus, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TimeSlot, 
  DailyPlan, 
  TaskWithEstimation 
} from '../hooks/useDailyPlanning';

interface TimeSlotGridProps {
  dailyPlan: DailyPlan;
  availableTasks: TaskWithEstimation[];
  unscheduledTasks: TaskWithEstimation[];
  onAssignTaskToSlot: (taskId: string, slotId: string) => void;
  onRemoveTaskFromSlot: (slotId: string) => void;
  validation: {
    isValid: boolean;
    conflicts: string[];
    warnings: string[];
  };
}

export function TimeSlotGrid({
  dailyPlan,
  availableTasks,
  unscheduledTasks,
  onAssignTaskToSlot,
  onRemoveTaskFromSlot,
  validation
}: TimeSlotGridProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<string | null>(null);

  // Get task by ID
  const getTask = (taskId: string) => {
    return availableTasks.find(task => task.id === taskId);
  };

  // Format time display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Check if slot has conflicts
  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.assignedTaskId) return 'empty';
    
    const task = getTask(slot.assignedTaskId);
    if (!task) return 'error';
    
    if (task.estimatedDuration > slot.duration) return 'overrun';
    if (task.completed) return 'completed';
    
    return 'assigned';
  };

  // Get slot color based on status
  const getSlotColor = (status: string) => {
    switch (status) {
      case 'empty': return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
      case 'assigned': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'overrun': return 'bg-red-50 border-red-300 hover:bg-red-100';
      case 'completed': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-100 border-red-400';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Handle slot click for task assignment
  const handleSlotClick = (slotId: string) => {
    if (selectedTask) {
      onAssignTaskToSlot(selectedTask, slotId);
      setSelectedTask(null);
    }
  };

  // Handle task selection from unscheduled list
  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  };

  // Calculate time utilization
  const utilization = {
    plannedTime: dailyPlan.totalPlannedTime,
    availableTime: dailyPlan.totalAvailableTime,
    utilizationRate: (dailyPlan.totalPlannedTime / dailyPlan.totalAvailableTime) * 100,
    freeTime: dailyPlan.totalAvailableTime - dailyPlan.totalPlannedTime
  };

  // Group time slots by hour for better display
  const groupSlotsByHour = () => {
    const groups: { [hour: string]: TimeSlot[] } = {};
    
    dailyPlan.timeSlots.forEach(slot => {
      const hour = slot.startTime.split(':')[0];
      if (!groups[hour]) groups[hour] = [];
      groups[hour].push(slot);
    });
    
    return groups;
  };

  const slotGroups = groupSlotsByHour();

  return (
    <div className="space-y-6">
      {/* Header with Analytics */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Time Boxing for {dailyPlan.date}</h2>
            <p className="text-sm text-gray-600">
              {Object.keys(slotGroups).length} hours • {dailyPlan.timeSlots.length} time slots
            </p>
          </div>
          
          {/* Time Utilization */}
          <div className="text-right">
            <p className="text-sm font-medium">
              Time Utilization: {Math.round(utilization.utilizationRate)}%
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={utilization.utilizationRate} className="w-24 h-2" />
              <span className="text-xs text-gray-500">
                {Math.floor(utilization.freeTime / 60)}h {utilization.freeTime % 60}m free
              </span>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {(!validation.isValid || validation.warnings.length > 0) && (
          <div className="space-y-2">
            {validation.conflicts.map((conflict, index) => (
              <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {conflict}
              </div>
            ))}
            
            {validation.warnings.map((warning, index) => (
              <div key={index} className="flex items-center gap-2 text-yellow-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {warning}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Time Slots Grid */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Slots
              {selectedTask && (
                <Badge variant="secondary" className="text-xs">
                  Click a slot to assign selected task
                </Badge>
              )}
            </h3>
            
            <div className="space-y-6">
              {Object.entries(slotGroups).map(([hour, slots]) => (
                <div key={hour} className="space-y-2">
                  {/* Hour Header */}
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-sm text-gray-700 w-20">
                      {formatTime(`${hour}:00`)}
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  
                  {/* Time Slots for this hour */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-24">
                    {slots.map(slot => {
                      const status = getSlotStatus(slot);
                      const task = slot.assignedTaskId ? getTask(slot.assignedTaskId) : null;
                      const isHighlighted = highlightedSlot === slot.id;
                      
                      return (
                        <Card
                          key={slot.id}
                          className={`p-3 cursor-pointer transition-all ${getSlotColor(status)} ${
                            isHighlighted ? 'ring-2 ring-blue-400' : ''
                          } ${selectedTask ? 'cursor-pointer' : ''}`}
                          onClick={() => handleSlotClick(slot.id)}
                          onMouseEnter={() => selectedTask && setHighlightedSlot(slot.id)}
                          onMouseLeave={() => setHighlightedSlot(null)}
                        >
                          {/* Slot Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {slot.duration}m
                            </div>
                          </div>
                          
                          {/* Assigned Task */}
                          {task ? (
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{task.title}</p>
                                  {task.description && (
                                    <p className="text-xs text-gray-600 truncate">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveTaskFromSlot(slot.id);
                                  }}
                                  className="h-6 w-6 p-0 ml-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={task.priority === 'high' ? 'destructive' : 
                                             task.priority === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {task.priority}
                                  </Badge>
                                  
                                  <Badge variant="outline" className="text-xs">
                                    {task.category}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  {task.estimatedDuration}m
                                  {status === 'overrun' && (
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-16 text-gray-400">
                              {selectedTask ? (
                                <div className="text-center">
                                  <Plus className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Click to assign</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="w-6 h-6 mx-auto mb-1 border-2 border-dashed border-gray-300 rounded" />
                                  <p className="text-xs">Empty slot</p>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Unscheduled Tasks Sidebar */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Unscheduled Tasks ({unscheduledTasks.length})
            </h3>
            
            {unscheduledTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All tasks scheduled!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unscheduledTasks.map(task => (
                  <Card
                    key={task.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedTask === task.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleTaskSelect(task.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : 
                                   task.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs ml-2"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {task.estimatedDuration}m
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {selectedTask && (
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  📌 Task Selected
                </p>
                <p className="text-xs text-blue-600">
                  Click any time slot to assign this task
                </p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start text-xs"
                onClick={() => setSelectedTask(null)}
              >
                Clear Selection
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start text-xs"
                disabled={unscheduledTasks.length === 0}
              >
                Auto-Schedule Remaining
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}