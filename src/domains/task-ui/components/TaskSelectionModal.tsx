/**
 * 📋 Task Selection Modal
 * 
 * Modal component for selecting existing tasks/subtasks to schedule in timebox
 * Features tabbed browsing, smart time suggestions, and seamless integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  X,
  Plus,
  Search,
  Filter,
  Zap,
  Target,
  Coffee,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Types for our modal
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  estimatedDuration?: number;
  subtasks?: Subtask[];
  currentDate: string;
  rollovers?: number;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
}

interface TimeSlot {
  start: string;
  end: string;
  duration: number;
  label: string;
}

export interface TaskSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onScheduleTask: (task: Task | Subtask, timeSlot: TimeSlot, taskType: 'light' | 'deep') => void;
}

const TaskSelectionModal: React.FC<TaskSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onScheduleTask
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'light' | 'deep'>('light');
  const [lightWorkTasks, setLightWorkTasks] = useState<Task[]>([]);
  const [deepWorkTasks, setDeepWorkTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | Subtask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch tasks when modal opens
  const fetchTasks = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Fetch Light Work tasks
      const lightResponse = await fetch(`http://localhost:3001/api/light-work/tasks?userId=user_31c4PuaPdFf9abejhmzrN9kcill&date=${dateStr}`);
      const lightData = await lightResponse.json();
      if (lightData.success) {
        setLightWorkTasks(lightData.data || []);
      }
      
      // Fetch Deep Work tasks
      const deepResponse = await fetch(`http://localhost:3001/api/deep-work/tasks?userId=user_31c4PuaPdFf9abejhmzrN9kcill&date=${dateStr}`);
      const deepData = await deepResponse.json();
      if (deepData.success) {
        setDeepWorkTasks(deepData.data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Generate suggested time slots
  const generateTimeSlots = (task: Task | Subtask): TimeSlot[] => {
    const now = new Date();
    const currentHour = now.getHours();
    const slots: TimeSlot[] = [];
    
    // Estimate duration based on task type and data
    let duration = 30; // Default 30 minutes
    if ('estimatedDuration' in task && task.estimatedDuration) {
      duration = task.estimatedDuration;
    } else if (activeTab === 'deep') {
      duration = 120; // Deep work default to 2 hours
    }

    // Generate slots for rest of day
    for (let hour = Math.max(currentHour + 1, 9); hour <= 22; hour += 2) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endHour = hour + Math.floor(duration / 60);
      const endMin = duration % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      if (endHour <= 23) {
        slots.push({
          start: startTime,
          end: endTime,
          duration,
          label: `${startTime} - ${endTime} (${duration}min)`
        });
      }
    }

    return slots.slice(0, 4); // Return top 4 suggestions
  };

  // Filter tasks based on search
  const filterTasks = (tasks: Task[]) => {
    if (!searchQuery) return tasks;
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const currentTasks = activeTab === 'light' ? lightWorkTasks : deepWorkTasks;
  const filteredTasks = filterTasks(currentTasks);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Handle task scheduling
  const handleScheduleTask = (task: Task | Subtask, timeSlot: TimeSlot) => {
    onScheduleTask(task, timeSlot, activeTab);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
           style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Schedule Task for Today</h2>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('light')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'light'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Coffee className="h-4 w-4" />
                <span>Light Work Tasks</span>
                <Badge variant="outline" className="ml-2">{lightWorkTasks.length}</Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('deep')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'deep'
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Deep Work Tasks</span>
                <Badge variant="outline" className="ml-2">{deepWorkTasks.length}</Badge>
              </div>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex h-96">
            {/* Task List */}
            <div className="flex-1 p-4 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Loading tasks...</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks found</p>
                  <p className="text-sm">Try adjusting your search or create new tasks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTask?.id === task.id
                          ? 'bg-blue-500/20 border-blue-500/50'
                          : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.estimatedDuration && (
                              <Badge variant="outline" className="text-gray-400">
                                {task.estimatedDuration}min
                              </Badge>
                            )}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <Badge variant="outline" className="text-gray-400">
                                {task.subtasks.length} subtasks
                              </Badge>
                            )}
                            {task.rollovers && task.rollovers > 0 && (
                              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                Rolled over {task.rollovers}x
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subtasks */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {task.subtasks.slice(0, 3).map((subtask) => (
                            <div
                              key={subtask.id}
                              className={`text-sm p-2 rounded border cursor-pointer ${
                                selectedTask?.id === subtask.id
                                  ? 'bg-blue-500/20 border-blue-500/50'
                                  : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(subtask);
                              }}
                            >
                              <span className={subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                          {task.subtasks.length > 3 && (
                            <p className="text-xs text-gray-500">+ {task.subtasks.length - 3} more subtasks</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Time Selection */}
            {selectedTask && (
              <div className="w-80 border-l border-gray-700 p-4">
                <div className="mb-4">
                  <h3 className="font-medium text-white mb-2">Selected Task</h3>
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
                    <p className="text-sm text-white font-medium">{selectedTask.title}</p>
                    {'priority' in selectedTask && (
                      <Badge className={getPriorityColor(selectedTask.priority)} size="sm">
                        {selectedTask.priority}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-white mb-3">Suggested Time Slots</h3>
                  <div className="space-y-2">
                    {generateTimeSlots(selectedTask).map((slot, index) => (
                      <Button
                        key={index}
                        onClick={() => handleScheduleTask(selectedTask, slot)}
                        variant="outline"
                        className="w-full justify-start text-left bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Select a task and choose a time slot to schedule it
            </p>
            <div className="flex space-x-2">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskSelectionModal;