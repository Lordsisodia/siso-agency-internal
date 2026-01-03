/**
 * Drag and Drop Time Slot Grid - Enhanced time boxing with drag and drop
 * 
 * Features:
 * 1. Drag tasks from unscheduled list to time slots
 * 2. Drag tasks between time slots to reschedule
 * 3. Visual feedback during drag operations
 * 4. Drop validation and conflict prevention
 * 5. Mobile-friendly touch support
 */

import React, { useState, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, X, GripVertical, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TimeSlot, 
  DailyPlan, 
  TaskWithEstimation 
} from '../hooks/useDailyPlanning';

interface DragDropTimeSlotGridProps {
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

interface DragState {
  isDragging: boolean;
  draggedTaskId: string | null;
  draggedFromSlot: string | null;
  dropTargetSlot: string | null;
}

export function DragDropTimeSlotGrid({
  dailyPlan,
  availableTasks,
  unscheduledTasks,
  onAssignTaskToSlot,
  onRemoveTaskFromSlot,
  validation
}: DragDropTimeSlotGridProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTaskId: null,
    draggedFromSlot: null,
    dropTargetSlot: null
  });

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

  // Check if task can be dropped in slot
  const canDropInSlot = (taskId: string, slotId: string) => {
    const task = getTask(taskId);
    const slot = dailyPlan.timeSlots.find(s => s.id === slotId);
    
    if (!task || !slot) return false;
    
    // Allow if slot is empty or contains the same task
    if (!slot.assignedTaskId || slot.assignedTaskId === taskId) return true;
    
    return false;
  };

  // Get drop validation message
  const getDropValidation = (taskId: string, slotId: string) => {
    const task = getTask(taskId);
    const slot = dailyPlan.timeSlots.find(s => s.id === slotId);
    
    if (!task || !slot) return { valid: false, message: 'Invalid drop' };
    
    if (slot.assignedTaskId && slot.assignedTaskId !== taskId) {
      return { valid: false, message: 'Slot already occupied' };
    }
    
    if (task.estimatedDuration > slot.duration) {
      return { 
        valid: true, 
        message: `⚠️ Task (${task.estimatedDuration}m) exceeds slot (${slot.duration}m)` 
      };
    }
    
    return { valid: true, message: '✅ Good fit' };
  };

  // Drag handlers for tasks
  const handleTaskDragStart = (e: React.DragEvent, taskId: string, fromSlot?: string) => {
    setDragState({
      isDragging: true,
      draggedTaskId: taskId,
      draggedFromSlot: fromSlot || null,
      dropTargetSlot: null
    });
    
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleTaskDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedTaskId: null,
      draggedFromSlot: null,
      dropTargetSlot: null
    });
  };

  // Drop handlers for slots
  const handleSlotDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    
    if (dragState.draggedTaskId && canDropInSlot(dragState.draggedTaskId, slotId)) {
      e.dataTransfer.dropEffect = 'move';
      setDragState(prev => ({ ...prev, dropTargetSlot: slotId }));
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleSlotDragLeave = () => {
    setDragState(prev => ({ ...prev, dropTargetSlot: null }));
  };

  const handleSlotDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (canDropInSlot(taskId, slotId)) {
      // If task was moved from another slot, remove it first
      if (dragState.draggedFromSlot) {
        onRemoveTaskFromSlot(dragState.draggedFromSlot);
      }
      
      onAssignTaskToSlot(taskId, slotId);
    }
    
    setDragState({
      isDragging: false,
      draggedTaskId: null,
      draggedFromSlot: null,
      dropTargetSlot: null
    });
  };

  // Get slot appearance based on drag state
  const getSlotAppearance = (slot: TimeSlot) => {
    const isDropTarget = dragState.dropTargetSlot === slot.id;
    const canDrop = dragState.draggedTaskId ? canDropInSlot(dragState.draggedTaskId, slot.id) : false;
    
    if (isDropTarget && canDrop) {
      return 'border-green-400 bg-green-50 border-2 border-dashed';
    } else if (isDropTarget && !canDrop) {
      return 'border-red-400 bg-red-50 border-2 border-dashed';
    } else if (dragState.isDragging && canDrop) {
      return 'border-blue-300 bg-blue-25 border-dashed';
    }
    
    // Default slot appearance
    if (!slot.assignedTaskId) return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    
    const task = getTask(slot.assignedTaskId);
    if (!task) return 'bg-red-100 border-red-400';
    
    if (task.estimatedDuration > slot.duration) return 'bg-orange-50 border-orange-300';
    if (task.completed) return 'bg-green-50 border-green-200';
    
    return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
  };

  // Draggable task component
  const DraggableTask = ({ 
    task, 
    fromSlot, 
    showGrip = false 
  }: { 
    task: TaskWithEstimation; 
    fromSlot?: string;
    showGrip?: boolean;
  }) => {
    const isDraggedTask = dragState.draggedTaskId === task.id;
    
    return (
      <div
        draggable
        onDragStart={(e) => handleTaskDragStart(e, task.id, fromSlot)}
        onDragEnd={handleTaskDragEnd}
        className={`cursor-move select-none ${isDraggedTask ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start gap-2">
          {showGrip && (
            <GripVertical className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <p className="font-medium text-sm truncate">{task.title}</p>
              {fromSlot && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTaskFromSlot(fromSlot);
                  }}
                  className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {task.description && (
              <p className="text-xs text-gray-600 truncate mb-2">
                {task.description}
              </p>
            )}
            
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
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {task.estimatedDuration}m
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate time utilization
  const utilization = {
    plannedTime: dailyPlan.totalPlannedTime,
    availableTime: dailyPlan.totalAvailableTime,
    utilizationRate: (dailyPlan.totalPlannedTime / dailyPlan.totalAvailableTime) * 100,
    freeTime: dailyPlan.totalAvailableTime - dailyPlan.totalPlannedTime
  };

  // Group time slots by hour
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
            <h2 className="text-xl font-semibold">Daily Time Boxing</h2>
            <p className="text-sm text-gray-600">
              Drag tasks to time slots • {dailyPlan.date}
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

        {/* Drag Instructions */}
        {!dragState.isDragging && unscheduledTasks.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded">
            <Zap className="h-4 w-4" />
            Drag unscheduled tasks to time slots to create your daily plan
          </div>
        )}

        {/* Drag Feedback */}
        {dragState.isDragging && dragState.draggedTaskId && (
          <div className="flex items-center gap-2 text-sm bg-yellow-50 p-3 rounded">
            <div className="flex items-center gap-2">
              <span>📋</span>
              Dragging: {getTask(dragState.draggedTaskId)?.title}
            </div>
            {dragState.dropTargetSlot && (
              <div className="ml-auto">
                {(() => {
                  const validation = getDropValidation(dragState.draggedTaskId, dragState.dropTargetSlot);
                  return (
                    <span className={validation.valid ? 'text-green-600' : 'text-red-600'}>
                      {validation.message}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Validation Status */}
        {(!validation.isValid || validation.warnings.length > 0) && (
          <div className="space-y-2 mt-3">
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
                      const task = slot.assignedTaskId ? getTask(slot.assignedTaskId) : null;
                      const slotAppearance = getSlotAppearance(slot);
                      
                      return (
                        <Card
                          key={slot.id}
                          className={`p-3 transition-all min-h-[100px] ${slotAppearance}`}
                          onDragOver={(e) => handleSlotDragOver(e, slot.id)}
                          onDragLeave={handleSlotDragLeave}
                          onDrop={(e) => handleSlotDrop(e, slot.id)}
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
                            <DraggableTask 
                              task={task} 
                              fromSlot={slot.id}
                              showGrip={true}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-16 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                              <div className="text-center">
                                <div className="text-xs">Drop task here</div>
                              </div>
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
              <span>📋</span>
              Unscheduled Tasks ({unscheduledTasks.length})
            </h3>
            
            {unscheduledTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All tasks scheduled!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 mb-3">
                  Drag these tasks to time slots
                </p>
                
                {unscheduledTasks.map(task => (
                  <Card
                    key={task.id}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <DraggableTask task={task} showGrip={true} />
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}