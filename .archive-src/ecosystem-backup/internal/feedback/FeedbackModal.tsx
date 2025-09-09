import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Send, Loader2, Camera, AlertTriangle, Lightbulb, Bug, Heart, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';

import { 
  FEEDBACK_CATEGORIES, 
  FEEDBACK_TYPES, 
  FEEDBACK_PRIORITIES,
  type FeedbackCategory,
  type FeedbackType,
  type FeedbackPriority,
  type CreateFeedbackRequest 
} from '@/types/feedback';
import { feedbackService } from '@/services/data/feedbackService';

const feedbackSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Please provide more details (at least 10 characters)').max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['UI_UX', 'PERFORMANCE', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL', 'MOBILE', 'ACCESSIBILITY']),
  feedbackType: z.enum(['BUG', 'SUGGESTION', 'IMPROVEMENT', 'COMPLAINT', 'PRAISE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      priority: 'MEDIUM',
      feedbackType: 'SUGGESTION',
      category: 'GENERAL',
    },
  });

  const watchedType = watch('feedbackType');
  const watchedCategory = watch('category');

  const getBrowserInfo = () => {
    const { userAgent } = navigator;
    const { width, height } = screen;
    return {
      browserInfo: userAgent,
      deviceInfo: `${width}x${height}`,
    };
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      const { browserInfo, deviceInfo } = getBrowserInfo();
      
      const feedbackData: CreateFeedbackRequest = {
        ...data,
        page: location.pathname,
      };

      await feedbackService.createFeedback(feedbackData, browserInfo, deviceInfo);

      toast({
        title: '✅ Feedback submitted!',
        description: 'Thank you for your feedback. We\'ll review it and get back to you.',
      });

      reset();
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: '❌ Failed to submit feedback',
        description: 'Please try again or contact support if the issue persists.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = FEEDBACK_TYPES.find(t => t.value === watchedType);
  const selectedCategory = FEEDBACK_CATEGORIES.find(c => c.value === watchedCategory);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Share Your Feedback</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Help us improve SISO Internal by sharing your thoughts, reporting bugs, or suggesting new features.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="feedbackType">What type of feedback is this?</Label>
            <Select 
              value={watchedType} 
              onValueChange={(value: FeedbackType) => setValue('feedbackType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.emoji}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <Badge variant="secondary" className="text-xs">
                {selectedType.emoji} {selectedType.label}
              </Badge>
            )}
            {errors.feedbackType && (
              <p className="text-sm text-red-600">{errors.feedbackType.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={watchedCategory} 
              onValueChange={(value: FeedbackCategory) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    <div>
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <p className="text-xs text-gray-600">{selectedCategory.description}</p>
            )}
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              defaultValue="MEDIUM"
              onValueChange={(value: FeedbackPriority) => setValue('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_PRIORITIES.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <span className={`font-medium ${priority.color}`}>
                      {priority.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback..."
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your feedback. What happened? What did you expect? Steps to reproduce (for bugs)..."
              rows={4}
              {...register('description')}
              className={`resize-none ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Context Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Context Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Page:</strong> {location.pathname}</div>
              <div><strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
              <div><strong>Screen:</strong> {screen.width}×{screen.height}</div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};