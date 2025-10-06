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
  Lightbulb
} from 'lucide-react';
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
    } else {
      // Reset form for new block
      const now = new Date();
      const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), roundedMinutes);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour
      
      setFormData({
        title: '',
        description: '',
        startTime: startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        category: 'DEEP_WORK',
        notes: ''
      });
    }
    
    setCurrentConflicts([]);
    setValidationErrors([]);
  }, [existingBlock, isOpen]);

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

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  }, []);

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

                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-white font-medium">Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(categoryIcons).map(([category, Icon]) => (
                      <motion.button
                        key={category}
                        type="button"
                        onClick={() => handleInputChange('category', category)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.category === category
                            ? `bg-gradient-to-r ${categoryColors[category as TimeBlockCategory]} shadow-lg scale-105`
                            : 'bg-gray-800/30 border-gray-600/30 hover:border-gray-500/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-5 w-5 ${
                            formData.category === category ? 'text-white' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            formData.category === category ? 'text-white' : 'text-gray-300'
                          }`}>
                            {TimeBlockUtils.getCategoryLabel(category as TimeBlockCategory)}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
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

                {/* Conflicts Warning */}
                {currentConflicts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-red-300 font-medium mb-2">Time Conflicts Detected</h4>
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