/**
 * 🕐 TimeBlock Form Modal
 * 
 * Modal component for creating and editing time blocks
 * Features conflict detection, validation, and beautiful UI
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { format as formatDate, parseISO } from 'date-fns';
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
  userId?: string | null;
  dateKey?: string;
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

const categoryThemes: Record<TimeBlockCategory, { header: string; accent: string; chip: string; icon: string }> = {
  DEEP_WORK: {
    header: 'from-indigo-600/35 via-indigo-500/15 to-transparent',
    accent: 'text-indigo-100',
    chip: 'bg-indigo-500/15 text-indigo-100 border-indigo-400/30',
    icon: 'bg-indigo-500/25 border-indigo-400/40'
  },
  LIGHT_WORK: {
    header: 'from-emerald-600/35 via-emerald-500/15 to-transparent',
    accent: 'text-emerald-100',
    chip: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/30',
    icon: 'bg-emerald-500/20 border-emerald-400/40'
  },
  MEETING: {
    header: 'from-orange-600/35 via-orange-500/15 to-transparent',
    accent: 'text-orange-100',
    chip: 'bg-orange-500/15 text-orange-100 border-orange-400/30',
    icon: 'bg-orange-500/20 border-orange-400/40'
  },
  BREAK: {
    header: 'from-lime-500/30 via-lime-400/10 to-transparent',
    accent: 'text-lime-100',
    chip: 'bg-lime-500/15 text-lime-100 border-lime-400/30',
    icon: 'bg-lime-500/20 border-lime-400/40'
  },
  PERSONAL: {
    header: 'from-purple-600/35 via-pink-500/15 to-transparent',
    accent: 'text-pink-100',
    chip: 'bg-pink-500/15 text-pink-100 border-pink-400/30',
    icon: 'bg-pink-500/20 border-pink-400/40'
  },
  HEALTH: {
    header: 'from-teal-600/35 via-teal-500/15 to-transparent',
    accent: 'text-teal-100',
    chip: 'bg-teal-500/15 text-teal-100 border-teal-400/30',
    icon: 'bg-teal-500/25 border-teal-400/40'
  },
  LEARNING: {
    header: 'from-cyan-600/35 via-cyan-500/15 to-transparent',
    accent: 'text-cyan-100',
    chip: 'bg-cyan-500/15 text-cyan-100 border-cyan-400/30',
    icon: 'bg-cyan-500/20 border-cyan-400/40'
  },
  ADMIN: {
    header: 'from-purple-600/35 via-purple-500/15 to-transparent',
    accent: 'text-purple-100',
    chip: 'bg-purple-500/15 text-purple-100 border-purple-400/30',
    icon: 'bg-purple-500/20 border-purple-400/40'
  }
};

export const TimeBlockFormModal: React.FC<TimeBlockFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  existingBlock,
  conflicts = [],
  onCheckConflicts,
  userId,
  dateKey
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

  const SelectedIcon = useMemo(() => categoryIcons[formData.category] ?? Clock, [formData.category]);
  const theme = useMemo(() => categoryThemes[formData.category] ?? categoryThemes.DEEP_WORK, [formData.category]);
  const dateLabel = useMemo(() => {
    if (!dateKey) return '';
    try {
      return formatDate(parseISO(dateKey), 'EEE, MMM d');
    } catch {
      return dateKey;
    }
  }, [dateKey]);

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
  // CRITICAL: Only reset when modal actually opens (isOpen changes from false to true)
  // or when existingBlock.id changes - NOT on every render!
  const prevIsOpen = React.useRef(false);
  const prevBlockId = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only initialize if:
    // 1. Modal just opened (isOpen changed from false to true), OR
    // 2. Block ID changed (different block being edited)
    const justOpened = isOpen && !prevIsOpen.current;
    const blockChanged = existingBlock?.id !== prevBlockId.current;

    prevIsOpen.current = isOpen;
    prevBlockId.current = existingBlock?.id;

    if (!justOpened && !blockChanged) {
      return; // Don't reset form data unnecessarily
    }

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
      if (existingBlock.taskId && userId) {
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
  }, [existingBlock, isOpen, userId, dateKey]);

  // Fetch linked task data
  const fetchLinkedTask = async (taskId: string) => {
    if (!userId) return;

    setLoadingTask(true);
    try {
      // Import the tasks service
      const { unifiedDataService } = await import('@/shared/services/unified-data.service');

      // Fetch the task - we need to find it in deep work or light work tasks
      const [deepWorkTasks, lightWorkTasks] = await Promise.all([
        unifiedDataService.getDeepWorkTasks(userId, dateKey),
        unifiedDataService.getLightWorkTasks(userId, dateKey)
      ]);
      
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
          <Card className="bg-gray-950/95 border-gray-800/70 shadow-2xl backdrop-blur-xl overflow-hidden">
            <CardHeader className={cn('relative border-b border-white/5 px-6 py-5 overflow-hidden', theme.header)}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent)] opacity-30 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center border', theme.icon)}>
                    <SelectedIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-1">
                      {existingBlock ? 'Edit Timebox' : 'New Timebox'}
                    </p>
                    <CardTitle className="text-2xl font-semibold text-white">
                      {formData.title || 'Untitled Block'}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap md:justify-end">
                  {dateLabel && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/20 text-white/75 border border-white/10">
                      <Calendar className="inline h-3.5 w-3.5 mr-1" />
                      {dateLabel}
                    </span>
                  )}
                  {formData.startTime && formData.endTime && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/20 text-white/75 border border-white/10">
                      <Clock className="inline h-3.5 w-3.5 mr-1" />
                      {formData.startTime} – {formData.endTime}
                    </span>
                  )}
                  {duration > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/15 text-white border border-white/20">
                      {TimeBlockUtils.formatDuration(duration)}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-5 space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white" htmlFor="timebox-title">Title</label>
                        <Input
                          id="timebox-title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="e.g., Deep Work Sprint, Team Sync..."
                          className="bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white" htmlFor="timebox-description">Description</label>
                        <Textarea
                          id="timebox-description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Add context, goals, or prep notes for this block..."
                          className="bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-0 min-h-[88px]"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-white" htmlFor="timebox-start">Start</label>
                          <Input
                            id="timebox-start"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => handleInputChange('startTime', e.target.value)}
                            className="bg-black/40 border-white/10 text-white focus:border-white/40 focus:ring-0"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-white" htmlFor="timebox-end">End</label>
                          <Input
                            id="timebox-end"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => handleInputChange('endTime', e.target.value)}
                            className="bg-black/40 border-white/10 text-white focus:border-white/40 focus:ring-0"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {duration > 0 ? (
                          <Badge className="bg-white/10 text-white border-white/20">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Duration · {TimeBlockUtils.formatDuration(duration)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-white/50">Choose start and end time to see duration</span>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={autoFit}
                          className="border-white/20 text-white/80 hover:bg-white/10"
                        >
                          <Zap className="h-4 w-4 mr-2" /> Smart auto-fit
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-5 space-y-2">
                      <label className="text-sm font-semibold text-white" htmlFor="timebox-notes">Notes (Optional)</label>
                      <Textarea
                        id="timebox-notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Add checklists, reminders, or outcomes to capture..."
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-0 min-h-[72px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.32em] text-white/50">Time Helpers</span>
                      </div>
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
                            onClick={async () => {
                              if (!formData.startTime) {
                                toast?.error?.('Please set a start time first');
                                return;
                              }
                              const [startHour, startMin] = formData.startTime.split(':').map(Number);
                              const totalMinutes = startHour * 60 + startMin + minutes;
                              const endHour = Math.floor(totalMinutes / 60);
                              const endMin = totalMinutes % 60;
                              if (endHour >= 24) {
                                toast?.error?.('End time would exceed midnight');
                                return;
                              }
                              const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
                              console.log('🕐 Quick duration change:', label, 'New end time:', newEndTime);

                              // Auto-save immediately for quick duration buttons
                              if (existingBlock && onUpdate) {
                                const updatedData = { ...formData, endTime: newEndTime };
                                const success = await onUpdate(existingBlock.id, updatedData);
                                if (success) {
                                  toast?.success?.(`Duration updated to ${label}`);
                                  onClose(); // Close modal after successful save
                                } else {
                                  toast?.error?.('Failed to update duration');
                                }
                              } else {
                                // For new blocks, just update the form (they still need to click Save)
                                handleInputChange('endTime', newEndTime);
                              }
                            }}
                            className={cn(
                              "border-white/15 bg-black/30 text-white/80 hover:border-white/40 hover:bg-white/10 transition-all",
                              !formData.startTime && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!formData.startTime}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!formData.endTime) return;
                            const [endHour, endMin] = formData.endTime.split(':').map(Number);
                            const totalMinutes = endHour * 60 + endMin - 15;
                            if (totalMinutes < 0) return;
                            const newHour = Math.floor(totalMinutes / 60);
                            const newMin = totalMinutes % 60;
                            const newEndTime = `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`;

                            // Auto-save for existing blocks
                            if (existingBlock && onUpdate) {
                              const updatedData = { ...formData, endTime: newEndTime };
                              const success = await onUpdate(existingBlock.id, updatedData);
                              if (success) {
                                toast?.success?.('Duration decreased by 15 min');
                                onClose();
                              }
                            } else {
                              handleInputChange('endTime', newEndTime);
                            }
                          }}
                          className="flex-1 border-white/15 bg-black/30 text-white/80 hover:border-red-400/60 hover:bg-red-500/20"
                          disabled={!formData.endTime}
                        >
                          -15 min
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!formData.endTime) return;
                            const [endHour, endMin] = formData.endTime.split(':').map(Number);
                            const totalMinutes = endHour * 60 + endMin + 15;
                            if (totalMinutes >= 24 * 60) return;
                            const newHour = Math.floor(totalMinutes / 60);
                            const newMin = totalMinutes % 60;
                            const newEndTime = `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`;

                            // Auto-save for existing blocks
                            if (existingBlock && onUpdate) {
                              const updatedData = { ...formData, endTime: newEndTime };
                              const success = await onUpdate(existingBlock.id, updatedData);
                              if (success) {
                                toast?.success?.('Duration increased by 15 min');
                                onClose();
                              }
                            } else {
                              handleInputChange('endTime', newEndTime);
                            }
                          }}
                          className="flex-1 border-white/15 bg-black/30 text-white/80 hover:border-emerald-400/60 hover:bg-emerald-500/20"
                          disabled={!formData.endTime}
                        >
                          +15 min
                        </Button>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-white/60" />
                          <div>
                            <p className="text-sm font-semibold text-white">Add transition buffer</p>
                            <p className="text-xs text-white/40">Reserve a 10min cool-down after this block</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addBuffer}
                            onChange={(e) => setAddBuffer(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 rounded-full bg-white/10 transition peer-focus:outline-none peer-checked:bg-emerald-500">
                            <div className="absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                          </div>
                        </label>
                      </div>
                    </div>

                    {loadingTask && (
                      <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-5 flex items-center gap-3 text-sm text-white/70">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block h-5 w-5 border-2 border-white/20 border-t-white rounded-full"
                        />
                        Loading linked task...
                      </div>
                    )}

                    {linkedTask && (
                      <div className="rounded-2xl border border-white/5 bg-gray-900/70 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-sm font-semibold">Linked task</span>
                          </div>
                          <Badge className="bg-white/10 text-white border-white/20">{linkedTask.priority || 'TASK'}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white">{linkedTask.title}</p>
                          {linkedTask.description && (
                            <p className="text-xs text-white/50 leading-relaxed">{linkedTask.description}</p>
                          )}
                        </div>
                        {linkedTask.subtasks && linkedTask.subtasks.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-wider text-white/40">Subtasks</p>
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                              {linkedTask.subtasks.map((subtask: any) => (
                                <div key={subtask.id} className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80">
                                  {subtask.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-white/30 mt-0.5" />
                                  )}
                                  <span>{subtask.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {currentConflicts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-300 mt-0.5" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-red-100">Time conflicts detected</h4>
                          <Button
                            type="button"
                            size="sm"
                            onClick={autoFit}
                            className="bg-yellow-500/20 text-yellow-100 hover:bg-yellow-500/30"
                          >
                            <Zap className="h-3.5 w-3.5 mr-1" /> Resolve automatically
                          </Button>
                        </div>
                        <div className="space-y-1 text-sm text-red-100/90">
                          {currentConflicts.map(conflict => (
                            <p key={conflict.id}>• "{conflict.title}" ({conflict.startTime} - {conflict.endTime})</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {validationErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-200 mt-0.5" />
                      <div className="space-y-2 text-sm text-yellow-100/90">
                        <h4 className="text-sm font-semibold text-yellow-100">Please fix the issues below</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  {existingBlock && onDelete ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="border-red-500/50 text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  ) : (
                    <span className="text-xs text-white/40">Buffers and adjustments apply automatically on save.</span>
                  )}
                  <div className="flex gap-3 sm:ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="border-white/20 text-white/80 hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || checkingConflicts || validationErrors.length > 0}
                      className="bg-white text-black hover:bg-white/80"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Saving…' : existingBlock ? 'Update Block' : 'Create Block'}
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
