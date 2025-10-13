/**
 * 🕐 TimeBlock Form Modal
 * 
 * Modal component for creating and editing time blocks
 * Features conflict detection, validation, and beautiful UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Save,
  X,
  Trash2,
  Zap,
  Target,
  Coffee,
  BookOpen,
  Heart,
  Users,
  Settings,
  Lightbulb,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import {
  TimeBlockCategory,
  CreateTimeBlockInput,
  UpdateTimeBlockInput,
  TimeBlock,
  TimeBlockConflict,
  TimeBlockUtils
} from '@/api/timeblocksApi.offline';

export interface TimeBlockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CreateTimeBlockInput, 'userId' | 'date'>) => Promise<boolean>;
  onUpdate?: (id: string, data: UpdateTimeBlockInput) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  existingBlock?: TimeBlock;
  conflicts?: TimeBlockConflict[];
  onCheckConflicts?: (startTime: string, endTime: string, excludeId?: string) => Promise<TimeBlockConflict[]>;
}

const categoryIcons: Record<TimeBlockCategory, React.ComponentType<{ className?: string }>> = {
  DEEP_WORK: Zap,
  LIGHT_WORK: Target,
  MEETING: Users,
  BREAK: Coffee,
  PERSONAL: Heart,
  HEALTH: Heart,
  LEARNING: BookOpen,
  ADMIN: Settings
};

const categoryColors: Record<TimeBlockCategory, string> = {
  DEEP_WORK: 'from-blue-600/20 to-indigo-600/20 border-blue-500/40',
  LIGHT_WORK: 'from-emerald-600/20 to-green-600/20 border-emerald-500/40',
  MEETING: 'from-orange-600/20 to-red-600/20 border-orange-500/40',
  BREAK: 'from-lime-600/20 to-green-600/20 border-lime-500/40',
  PERSONAL: 'from-purple-600/20 to-pink-600/20 border-purple-500/40',
  HEALTH: 'from-teal-600/20 to-cyan-600/20 border-teal-500/40',
  LEARNING: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/40',
  ADMIN: 'from-indigo-600/20 to-purple-600/20 border-indigo-500/40'
};

export const TimeBlockFormModal: React.FC<TimeBlockFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  existingBlock,
  conflicts = [],
  onCheckConflicts
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    category: 'DEEP_WORK' as TimeBlockCategory,
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [currentConflicts, setCurrentConflicts] = useState<TimeBlockConflict[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [linkedTask, setLinkedTask] = useState<any>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [addBuffer, setAddBuffer] = useState(true); // Buffer time toggle

  // Get smart default duration based on category and history
  const getSmartDefaultDuration = useCallback((category: TimeBlockCategory): number => {
    try {
      const cached = localStorage.getItem('timebox-avg-durations');
      if (cached) {
        const avgDurations = JSON.parse(cached);
        return avgDurations[category] || 60;
      }
    } catch (error) {
      console.warn('Failed to load smart defaults:', error);
    }
    
    // Fallback defaults
    const defaultDurations: Record<TimeBlockCategory, number> = {
      'DEEP_WORK': 120,
      'LIGHT_WORK': 45,
      'MEETING': 60,
      'BREAK': 15,
      'PERSONAL': 30,
      'HEALTH': 45,
      'LEARNING': 90,
      'ADMIN': 30
    };
    
    return defaultDurations[category] || 60;
  }, []);

  // Update endTime when category changes (apply smart defaults)
  useEffect(() => {
    if (!existingBlock && formData.startTime && formData.category) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const smartDuration = getSmartDefaultDuration(formData.category);
      const endMinutes = startMinutes + smartDuration;
      
      if (endMinutes < 24 * 60) {
        const formatTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, endTime: formatTime(endMinutes) }));
      }
    }
  }, [formData.category, existingBlock, getSmartDefaultDuration]);

  // Initialize form data when modal opens or existing block changes
  useEffect(() => {
    if (existingBlock) {
      setFormData({
        title: existingBlock.title,
        description: existingBlock.description || '',
        startTime: existingBlock.startTime,
        endTime: existingBlock.endTime,
        category: existingBlock.category,
        notes: existingBlock.notes || ''
      });
      
      // Fetch linked task if taskId exists
      if (existingBlock.taskId) {
        fetchLinkedTask(existingBlock.taskId);
      } else {
        setLinkedTask(null);
      }
    } else {
      // Reset form for new block with smart defaults
      const now = new Date();
      const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), roundedMinutes);
      
      // Use smart default duration based on category
      const defaultDuration = getSmartDefaultDuration('DEEP_WORK');
      const endTime = new Date(startTime.getTime() + defaultDuration * 60 * 1000);
      
      setFormData({
        title: '',
        description: '',
        startTime: startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        category: 'DEEP_WORK',
        notes: ''
      });
      setLinkedTask(null);
    }
    
    setCurrentConflicts([]);
    setValidationErrors([]);
  }, [existingBlock, isOpen]);

  // Fetch linked task data
  const fetchLinkedTask = async (taskId: string) => {
    setLoadingTask(true);
    try {
      // Import the tasks service
      const { unifiedDataService } = await import('@/shared/services/unified-data.service');
      
      // Fetch the task - we need to find it in deep work or light work tasks
      const deepWorkTasks = await unifiedDataService.getDeepWorkTasks();
      const lightWorkTasks = await unifiedDataService.getLightWorkTasks();
      
      const task = [...deepWorkTasks, ...lightWorkTasks].find(t => t.id === taskId);
      
      if (task) {
        setLinkedTask(task);
      }
    } catch (error) {
      console.error('Failed to fetch linked task:', error);
    } finally {
      setLoadingTask(false);
    }
  };

  // Update conflicts from props
  useEffect(() => {
    setCurrentConflicts(conflicts);
  }, [conflicts]);

  // Validation
  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('Title is required');
    }
    
    if (!formData.startTime || !formData.endTime) {
      errors.push('Start and end times are required');
    }
    
    if (formData.startTime >= formData.endTime) {
      errors.push('End time must be after start time');
    }
    
    const duration = TimeBlockUtils.calculateDuration(formData.startTime, formData.endTime);
    if (duration < 5) {
      errors.push('Minimum duration is 5 minutes');
    }
    if (duration > 720) {
      errors.push('Maximum duration is 12 hours');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);

  // Check for conflicts when time changes
  const checkConflicts = useCallback(async () => {
    if (!onCheckConflicts || !formData.startTime || !formData.endTime) return;
    
    setCheckingConflicts(true);
    try {
      const conflicts = await onCheckConflicts(
        formData.startTime,
        formData.endTime,
        existingBlock?.id
      );
      setCurrentConflicts(conflicts);
    } catch (error) {
      console.error('Failed to check conflicts:', error);
    } finally {
      setCheckingConflicts(false);
    }
  }, [formData.startTime, formData.endTime, onCheckConflicts, existingBlock?.id]);

  // Debounced conflict checking
  useEffect(() => {
    const timeoutId = setTimeout(checkConflicts, 300);
    return () => clearTimeout(timeoutId);
  }, [checkConflicts]);

  // Auto-fit: Find next free slot by shifting +15min
  const autoFit = useCallback(async () => {
    if (!onCheckConflicts || !formData.startTime || !formData.endTime) return;
    
    const duration = TimeBlockUtils.calculateDuration(formData.startTime, formData.endTime);
    let attempts = 0;
    const maxAttempts = 12; // Search up to 3 hours ahead
    
    let currentStart = formData.startTime;
    
    while (attempts < maxAttempts) {
      const [hour, min] = currentStart.split(':').map(Number);
      const startMinutes = hour * 60 + min;
      const endMinutes = startMinutes + duration;
      
      // Check if we'd go past midnight
      if (endMinutes >= 24 * 60) {
        toast?.error?.('No free slot found before midnight');
        return;
      }
      
      const formatTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
      const testEnd = formatTime(endMinutes);
      
      // Check for conflicts
      const conflicts = await onCheckConflicts(currentStart, testEnd, existingBlock?.id);
      
      if (!conflicts || conflicts.length === 0) {
        // Found a free slot!
        handleInputChange('startTime', currentStart);
        handleInputChange('endTime', testEnd);
        setCurrentConflicts([]);
        toast?.success?.(`Auto-fit: Moved to ${currentStart}`);
        return;
      }
      
      // Try next 15-minute slot
      const nextStartMinutes = startMinutes + 15;
      currentStart = formatTime(nextStartMinutes);
      attempts++;
    }
    
    toast?.error?.('No free slot found in next 3 hours');
  }, [formData, onCheckConflicts, existingBlock?.id]); // Removed handleInputChange - not needed in deps

  // Handle input changes (MOVED HERE before functions that use it)
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      let success = false;
      
      if (existingBlock && onUpdate) {
        success = await onUpdate(existingBlock.id, formData);
      } else {
        success = await onSubmit(formData);
      }
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, existingBlock, onUpdate, onSubmit, onClose]);

  // Handle delete with confirmation
  const handleDelete = useCallback(async () => {
    if (!existingBlock || !onDelete) return;
    
    if (!confirm(`Delete time block "${formData.title}"? This cannot be undone.`)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await onDelete(existingBlock.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete time block:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [existingBlock, onDelete, formData.title, onClose]);

  if (!isOpen) return null;

  const duration = formData.startTime && formData.endTime ? 
    TimeBlockUtils.calculateDuration(formData.startTime, formData.endTime) : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border-purple-500/30 shadow-2xl backdrop-blur-md">
            <CardHeader className="border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-purple-400" />
                  {existingBlock ? 'Edit Time Block' : 'Create Time Block'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-white font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Deep Work Session, Team Meeting..."
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500"
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white font-medium">Start Time</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white font-medium">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Duration Display */}
                {duration > 0 && (
                  <div className="flex items-center justify-center">
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/40">
                      <Clock className="h-3 w-3 mr-1" />
                      Duration: {TimeBlockUtils.formatDuration(duration)}
                    </Badge>
                  </div>
                )}

                {/* Quick Duration Buttons */}
                <div className="space-y-2">
                  <label className="text-white font-medium text-sm">Quick Duration</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: '15m', minutes: 15 },
                      { label: '30m', minutes: 30 },
                      { label: '1h', minutes: 60 },
                      { label: '2h', minutes: 120 },
                      { label: '3h', minutes: 180 }
                    ].map(({ label, minutes }) => (
                      <Button
                        key={label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.startTime) return;
                          const [startHour, startMin] = formData.startTime.split(':').map(Number);
                          const totalMinutes = startHour * 60 + startMin + minutes;
                          const endHour = Math.floor(totalMinutes / 60);
                          const endMin = totalMinutes % 60;
                          if (endHour >= 24) return; // Don't go past midnight
                          handleInputChange('endTime', `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`);
                        }}
                        className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-purple-600/20 hover:border-purple-500"
                        disabled={!formData.startTime}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Duration Adjustment Buttons */}
                <div className="space-y-2">
                  <label className="text-white font-medium text-sm">Adjust Duration</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!formData.endTime) return;
                        const [endHour, endMin] = formData.endTime.split(':').map(Number);
                        const totalMinutes = endHour * 60 + endMin - 15;
                        if (totalMinutes < 0) return;
                        const newHour = Math.floor(totalMinutes / 60);
                        const newMin = totalMinutes % 60;
                        handleInputChange('endTime', `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`);
                      }}
                      className="flex-1 bg-gray-800/50 border-gray-600/50 text-white hover:bg-red-600/20 hover:border-red-500"
                      disabled={!formData.endTime}
                    >
                      -15 min
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!formData.endTime) return;
                        const [endHour, endMin] = formData.endTime.split(':').map(Number);
                        const totalMinutes = endHour * 60 + endMin + 15;
                        if (totalMinutes >= 24 * 60) return; // Don't go past midnight
                        const newHour = Math.floor(totalMinutes / 60);
                        const newMin = totalMinutes % 60;
                        handleInputChange('endTime', `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`);
                      }}
                      className="flex-1 bg-gray-800/50 border-gray-600/50 text-white hover:bg-green-600/20 hover:border-green-500"
                      disabled={!formData.endTime}
                    >
                      +15 min
                    </Button>
                  </div>
                </div>

                {/* Buffer Time Option */}
                <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <div>
                      <label className="text-white font-medium text-sm">Add Transition Buffer</label>
                      <p className="text-gray-400 text-xs">Add 10min gap after this block</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addBuffer}
                      onChange={(e) => setAddBuffer(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-white font-medium">Description (Optional)</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of what you'll be working on..."
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500 min-h-[80px]"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-white font-medium">Notes (Optional)</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes or preparation needed..."
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500 min-h-[60px]"
                  />
                </div>

                {/* Linked Task Subtasks */}
                {linkedTask && linkedTask.subtasks && linkedTask.subtasks.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-white font-medium flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-purple-400" />
                      Subtasks ({linkedTask.subtasks.length})
                    </label>
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 space-y-2 max-h-[200px] overflow-y-auto">
                      {linkedTask.subtasks.map((subtask: any) => (
                        <motion.div
                          key={subtask.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-700/30 transition-colors"
                        >
                          {subtask.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm",
                              subtask.completed 
                                ? "text-gray-400 line-through" 
                                : "text-gray-200"
                            )}>
                              {subtask.title}
                            </p>
                            {subtask.description && (
                              <p className="text-xs text-gray-500 mt-1">{subtask.description}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {loadingTask && (
                  <div className="text-center py-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block h-5 w-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                    />
                    <p className="text-gray-400 text-sm mt-2">Loading subtasks...</p>
                  </div>
                )}

                {/* Conflicts Warning */}
                {currentConflicts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-red-300 font-medium">Time Conflicts Detected</h4>
                          <Button
                            type="button"
                            size="sm"
                            onClick={autoFit}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Auto-fit
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {currentConflicts.map(conflict => (
                            <p key={conflict.id} className="text-red-200/80 text-sm">
                              • "{conflict.title}" ({conflict.startTime} - {conflict.endTime})
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-300 font-medium mb-2">Validation Errors</h4>
                        <div className="space-y-1">
                          {validationErrors.map((error, index) => (
                            <p key={index} className="text-yellow-200/80 text-sm">• {error}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-700/30">
                  {/* Delete button (only for existing blocks) */}
                  {existingBlock && onDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}

                  {/* Right-side buttons */}
                  <div className={cn("flex space-x-3", !existingBlock && "ml-auto")}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || checkingConflicts || validationErrors.length > 0}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Saving...' : existingBlock ? 'Update Block' : 'Create Block'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};