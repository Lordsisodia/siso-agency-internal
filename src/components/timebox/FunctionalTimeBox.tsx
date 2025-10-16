/**
 * Functional TimeBox - Real time allocation system for LifeLock tasks
 * Drag-and-drop scheduling with real task data and timers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Clock,
  Calendar,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Brain,
  Coffee,
  Zap,
  Timer,
  BarChart3,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  ListChecks,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { timeboxApi, TimeBoxTask, TimeSlot, DaySchedule, TimeBoxStats } from '@/api/timeboxApi';
import { cn } from '@/shared/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';

// Drag and drop types
const ItemTypes = {
  TASK: 'task'
};

interface DragItem {
  type: string;
  taskId: string;
  task: TimeBoxTask;
}

// Task item component with drag capability
const DraggableTask: React.FC<{
  task: TimeBoxTask;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  isActive: boolean;
  activeDuration: number;
  onOpenSubtasks: (task: TimeBoxTask) => void;
}> = ({ task, onStart, onComplete, isActive, activeDuration, onOpenSubtasks }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { type: ItemTypes.TASK, taskId: task.id, task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const selectedSubtasks = (task.subtasks || []).filter(subtask =>
    (task.visibleSubtaskIds || []).includes(subtask.id)
  );

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'deep_work': return <Brain className="h-4 w-4" />;
      case 'light_work': return <Coffee className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'deep_work': return 'from-purple-500/20 to-indigo-500/20 border-purple-400/30';
      case 'light_work': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-400/30';
    }
  };

  return (
    <motion.div
      ref={drag}
      className={cn(
        "p-3 rounded-lg border bg-gradient-to-r cursor-move transition-all",
        getTaskTypeColor(task.taskType),
        isDragging ? "opacity-50 scale-95" : "hover:scale-102",
        task.completed ? "opacity-60" : ""
      )}
      onClick={() => onOpenSubtasks(task)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getTaskTypeIcon(task.taskType)}
            <span className="font-medium text-white text-sm">{task.title}</span>
            {task.priority === 'HIGH' && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs">High</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Timer className="h-3 w-3" />
            <span>{task.estimatedDuration}min</span>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/40 text-xs">
              {task.xpReward}XP
            </Badge>
          </div>
          
          {isActive && (
            <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Running: {activeDuration}min</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {!task.completed && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  if (isActive) {
                    onComplete(task.id);
                  } else {
                    onStart(task.id);
                  }
                }}
                className="h-6 w-6 p-0"
              >
                {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  onComplete(task.id);
                }}
                className="h-6 w-6 p-0"
              >
                <Circle className="h-3 w-3" />
              </Button>
            </>
          )}
          {task.completed && (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          )}
        </div>
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 rounded-md border border-white/5 bg-black/20 p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-purple-200">
            <div className="flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5" />
              <span>TimeBox subtasks</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-purple-200 hover:text-purple-100"
              onClick={(event) => {
                event.stopPropagation();
                onOpenSubtasks(task);
              }}
            >
              Edit
            </Button>
          </div>

          {selectedSubtasks.length > 0 ? (
            <ul className="space-y-1 text-xs text-gray-200">
              {selectedSubtasks.map(subtask => (
                <li key={subtask.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      subtask.completed ? 'bg-green-400' : 'bg-blue-400'
                    )}
                  />
                  <span className={cn(
                    'truncate',
                    subtask.completed && 'line-through opacity-75'
                  )}>
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-gray-500">
              No subtasks selected. Click to choose which subtasks appear in TimeBox.
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Time slot component with drop capability
const TimeSlotDropZone: React.FC<{
  slot: TimeSlot;
  task?: TimeBoxTask;
  onDrop: (taskId: string, slot: TimeSlot) => void;
  onRemove: (taskId: string) => void;
  onOpenSubtasks?: (task: TimeBoxTask) => void;
}> = ({ slot, task, onDrop, onRemove, onOpenSubtasks }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: DragItem) => {
      if (!task) {
        onDrop(item.taskId, slot);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const selectedSubtasks = task?.subtasks?.filter(subtask =>
    (task.visibleSubtaskIds || []).includes(subtask.id)
  ) || [];

  return (
    <div
      ref={drop}
      className={cn(
        "h-16 border border-gray-600 rounded-lg transition-all",
        isOver && !task ? "border-blue-400 bg-blue-500/10" : "",
        task ? "border-gray-500" : "border-dashed border-gray-700"
      )}
    >
      <div className="p-2 h-full">
        <div className="text-xs text-gray-400 mb-1">{slot.startTime}</div>

        {task ? (
          <div
            className="h-full cursor-pointer rounded-md border border-transparent p-1 transition-colors hover:border-purple-400/40 hover:bg-purple-500/5"
            onClick={() => onOpenSubtasks?.(task)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpenSubtasks?.(task);
              }
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <div className="text-xs font-medium text-white truncate">{task.title}</div>
                <div className="text-xs text-gray-400">{task.estimatedDuration}min</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(task.id);
                }}
                className="h-4 w-4 p-0 text-gray-400 hover:text-red-400"
              >
                ×
              </Button>
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-1">
                {selectedSubtasks.length > 0 ? (
                  <ul className="space-y-1 text-[11px] text-gray-400">
                    {selectedSubtasks.slice(0, 3).map(subtask => (
                      <li key={subtask.id} className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            subtask.completed ? 'bg-green-400' : 'bg-blue-400'
                          )}
                        />
                        <span className={cn(
                          'truncate',
                          subtask.completed && 'line-through opacity-75'
                        )}>
                          {subtask.title}
                        </span>
                      </li>
                    ))}
                    {selectedSubtasks.length > 3 && (
                      <li className="text-[11px] text-gray-500">+ {selectedSubtasks.length - 3} more</li>
                    )}
                  </ul>
                ) : (
                  <p className="text-[11px] italic text-gray-500">
                    No subtasks selected
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center mt-2">
            Drop task here
          </div>
        )}
      </div>
    </div>
  );
};

interface SubtaskVisibilityModalProps {
  open: boolean;
  task: TimeBoxTask | null;
  selectedSubtaskIds: Set<string>;
  onToggle: (subtaskId: string, checked: boolean) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  errorMessage?: string | null;
}

const SubtaskVisibilityModal: React.FC<SubtaskVisibilityModalProps> = ({
  open,
  task,
  selectedSubtaskIds,
  onToggle,
  onClose,
  onSave,
  isSaving,
  errorMessage
}) => {
  const subtasks = task?.subtasks || [];
  const handleCheckedChange = (subtaskId: string) => (checked: boolean | 'indeterminate') => {
    onToggle(subtaskId, checked === true);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit TimeBox subtasks</DialogTitle>
          <DialogDescription>
            Choose which subtasks from <span className="font-medium text-foreground">{task?.title}</span> should appear beneath the main task in your TimeBox view.
          </DialogDescription>
        </DialogHeader>

        {!task && (
          <p className="text-sm text-muted-foreground">Select a task to manage its subtasks.</p>
        )}

        {task && subtasks.length === 0 && (
          <div className="rounded-md border border-dashed border-purple-400/40 bg-purple-500/5 p-4 text-sm text-muted-foreground">
            This task does not have any subtasks yet. Add subtasks from the task manager to make them available here.
          </div>
        )}

        {task && subtasks.length > 0 && (
          <div className="space-y-3">
            <div className="rounded-lg border border-white/5 bg-slate-900/40 p-3">
              <p className="text-xs font-medium text-slate-200">
                Showing {selectedSubtaskIds.size} of {subtasks.length} subtasks in TimeBox
              </p>
            </div>

            <div className="space-y-2">
              {subtasks.map(subtask => {
                const isChecked = selectedSubtaskIds.has(subtask.id);
                return (
                  <div
                    key={subtask.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border border-white/5 bg-slate-900/40 p-3 transition-colors',
                      isChecked ? 'border-purple-400/60 bg-purple-500/10' : 'hover:border-purple-400/40'
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={handleCheckedChange(subtask.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label className={cn('text-sm font-medium text-white', subtask.completed && 'line-through opacity-70')}>
                        {subtask.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {subtask.completed ? 'Completed subtask' : 'Pending subtask'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving || !task}>
            {isSaving ? 'Saving...' : 'Save selection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Functional TimeBox component
export const FunctionalTimeBox: React.FC = () => {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [stats, setStats] = useState<TimeBoxStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Set<string>>(new Set());
  const [timerDurations, setTimerDurations] = useState<Map<string, number>>(new Map());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [subtaskEditorTask, setSubtaskEditorTask] = useState<TimeBoxTask | null>(null);
  const [selectedVisibleSubtaskIds, setSelectedVisibleSubtaskIds] = useState<Set<string>>(new Set());
  const [isSavingSubtasks, setIsSavingSubtasks] = useState(false);
  const [subtaskModalError, setSubtaskModalError] = useState<string | null>(null);

  // Load schedule and stats
  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const [daySchedule, timeBoxStats] = await Promise.all([
        timeboxApi.getDaySchedule(selectedDate),
        timeboxApi.getTimeBoxStats(selectedDate)
      ]);
      
      setSchedule(daySchedule);
      setStats(timeBoxStats);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Timer update effect
  useEffect(() => {
    const interval = setInterval(() => {
      const newDurations = new Map();
      activeTimers.forEach(taskId => {
        const { duration } = timeboxApi.getActiveTimer(taskId);
        newDurations.set(taskId, duration);
      });
      setTimerDurations(newDurations);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers]);

  // Task handlers
  const handleTaskDrop = async (taskId: string, slot: TimeSlot) => {
    try {
      await timeboxApi.scheduleTask(taskId, slot);
      await loadSchedule();
    } catch (error) {
      console.error('Failed to schedule task:', error);
    }
  };

  const handleTaskRemove = async (taskId: string) => {
    try {
      await timeboxApi.unscheduleTask(taskId, selectedDate);
      await loadSchedule();
    } catch (error) {
      console.error('Failed to unschedule task:', error);
    }
  };

  const handleStartTimer = (taskId: string) => {
    timeboxApi.startTimer(taskId);
    setActiveTimers(prev => new Set([...prev, taskId]));
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const duration = timeboxApi.stopTimer(taskId);
      await timeboxApi.completeTask(taskId, duration);
      setActiveTimers(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      await loadSchedule();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleAutoSchedule = async () => {
    setLoading(true);
    try {
      const newSchedule = await timeboxApi.autoScheduleTasks(selectedDate);
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Failed to auto-schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubtaskEditor = (task: TimeBoxTask) => {
    if (!task) return;
    const filteredVisible = (task.visibleSubtaskIds || []).filter(subtaskId =>
      (task.subtasks || []).some(subtask => subtask.id === subtaskId)
    );

    setSubtaskModalError(null);
    setSubtaskEditorTask(task);
    setSelectedVisibleSubtaskIds(new Set(filteredVisible));
    setIsSubtaskModalOpen(true);
  };

  const handleToggleVisibleSubtask = (subtaskId: string, checked: boolean) => {
    setSelectedVisibleSubtaskIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(subtaskId);
      } else {
        next.delete(subtaskId);
      }
      return next;
    });
  };

  const handleCloseSubtaskModal = () => {
    setIsSubtaskModalOpen(false);
    setSubtaskEditorTask(null);
    setSelectedVisibleSubtaskIds(new Set());
    setSubtaskModalError(null);
  };

  const handleSaveSubtaskVisibility = async () => {
    if (!subtaskEditorTask) return;

    setIsSavingSubtasks(true);
    setSubtaskModalError(null);

    try {
      await timeboxApi.updateTaskVisibleSubtasks(
        subtaskEditorTask.id,
        Array.from(selectedVisibleSubtaskIds),
        subtaskEditorTask.metadata || {}
      );

      await loadSchedule();
      handleCloseSubtaskModal();
    } catch (error) {
      console.error('Failed to update subtask visibility:', error);
      setSubtaskModalError('Failed to save subtask visibility. Please try again.');
    } finally {
      setIsSavingSubtasks(false);
    }
  };

  if (!schedule) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Functional TimeBox</h1>
              <p className="text-gray-400 text-sm">Drag & drop task scheduling with real data</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={loadSchedule} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            
            <Button 
              onClick={handleAutoSchedule} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Auto Schedule
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-3"
          >
            <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-400/30">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-blue-300">{stats.tasksCompleted}</div>
                <div className="text-xs text-blue-400">Completed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/30">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-purple-300">{Math.round(stats.completionRate)}%</div>
                <div className="text-xs text-purple-400">Success Rate</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-400/30">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-green-300">{stats.totalFocusTime}min</div>
                <div className="text-xs text-green-400">Focus Time</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-400/30">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-yellow-300">{stats.xpEarned}</div>
                <div className="text-xs text-yellow-400">XP Earned</div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unscheduled Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Available Tasks
                  </h3>
                  <Badge className="bg-blue-500/20 text-blue-300">
                    {schedule.unscheduledTasks.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {schedule.unscheduledTasks.map(task => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        onStart={handleStartTimer}
                        onComplete={handleCompleteTask}
                        isActive={activeTimers.has(task.id)}
                        activeDuration={timerDurations.get(task.id) || 0}
                        onOpenSubtasks={handleOpenSubtaskEditor}
                      />
                    ))}
                    
                    {schedule.unscheduledTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>All tasks scheduled!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Schedule Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-400" />
                    Daily Schedule
                  </h3>
                  <Badge className="bg-purple-500/20 text-purple-300">
                    {format(new Date(selectedDate), 'MMM d, yyyy')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 gap-2">
                    {schedule.timeSlots.map(slot => {
                      const scheduledTask = slot.task || schedule.scheduledTasks?.find(
                        task => task.scheduledSlot?.id === slot.id
                      );

                      return (
                        <TimeSlotDropZone
                          key={slot.id}
                          slot={slot}
                          task={scheduledTask}
                          onDrop={handleTaskDrop}
                          onRemove={handleTaskRemove}
                          onOpenSubtasks={handleOpenSubtaskEditor}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-300 mb-2">How to Use Functional TimeBox</h4>
                  <ul className="text-xs text-indigo-400/80 space-y-1">
                    <li>• <strong>Drag tasks</strong> from Available Tasks to time slots</li>
                    <li>• <strong>Click Play</strong> to start timers and track real work time</li>
                    <li>• <strong>Auto Schedule</strong> optimizes task placement by priority</li>
                    <li>• <strong>Complete tasks</strong> to earn XP and update your progress</li>
                    <li>• Tasks sync with your LifeLock light work and deep work lists</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <SubtaskVisibilityModal
        open={isSubtaskModalOpen}
        task={subtaskEditorTask}
        selectedSubtaskIds={selectedVisibleSubtaskIds}
        onToggle={handleToggleVisibleSubtask}
        onClose={handleCloseSubtaskModal}
        onSave={handleSaveSubtaskVisibility}
        isSaving={isSavingSubtasks}
        errorMessage={subtaskModalError}
      />
    </DndProvider>
  );
};

export default FunctionalTimeBox;