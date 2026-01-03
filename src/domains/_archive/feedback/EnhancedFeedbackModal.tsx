import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Send, Loader2, Camera, AlertTriangle, Lightbulb, Bug, Heart, MessageSquare, Monitor, Smartphone, Zap, Palette, Accessibility, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

import { 
  FEEDBACK_CATEGORIES, 
  FEEDBACK_TYPES, 
  FEEDBACK_PRIORITIES,
  type FeedbackCategory,
  type FeedbackType,
  type FeedbackPriority,
  type CreateFeedbackRequest 
} from '@/types/feedback';
import { feedbackService } from '@/services/feedbackService';

const feedbackSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Please provide more details (at least 10 characters)').max(1000, 'Description must be less than 1000 characters'),
  category: z.enum(['UI_UX', 'PERFORMANCE', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL', 'MOBILE', 'ACCESSIBILITY']),
  feedbackType: z.enum(['BUG', 'SUGGESTION', 'IMPROVEMENT', 'COMPLAINT', 'PRAISE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface EnhancedFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons = {
  BUG: Bug,
  SUGGESTION: Lightbulb,
  IMPROVEMENT: Zap,
  COMPLAINT: AlertTriangle,
  PRAISE: Heart,
};

const categoryIcons = {
  UI_UX: Palette,
  PERFORMANCE: Zap,
  FEATURE_REQUEST: Plus,
  BUG_REPORT: Bug,
  GENERAL: MessageSquare,
  MOBILE: Smartphone,
  ACCESSIBILITY: Accessibility,
};

const priorityColors = {
  LOW: 'from-green-400 to-green-600',
  MEDIUM: 'from-yellow-400 to-yellow-600', 
  HIGH: 'from-orange-400 to-orange-600',
  URGENT: 'from-red-400 to-red-600',
};

export const EnhancedFeedbackModal = ({ isOpen, onClose }: EnhancedFeedbackModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
  const watchedPriority = watch('priority');

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
        title: '🎉 Feedback submitted successfully!',
        description: 'Thank you for helping us improve SISO Internal.',
      });

      reset();
      setCurrentStep(1);
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const selectedTypeIcon = typeIcons[watchedType];
  const selectedCategoryIcon = categoryIcons[watchedCategory];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Share Your Feedback
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  Help us improve SISO Internal with your insights
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-lg font-semibold">What type of feedback is this?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Choose the option that best describes your feedback</p>
                </div>

                {/* Feedback Type Selection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FEEDBACK_TYPES.map(type => {
                    const Icon = typeIcons[type.value];
                    const isSelected = watchedType === type.value;
                    return (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => setValue('feedbackType', type.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${
                            isSelected ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                          <div className="space-y-1">
                            <span className="text-2xl">{type.emoji}</span>
                            <p className="font-medium text-sm">{type.label}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {errors.feedbackType && (
                  <p className="text-sm text-red-600 text-center">{errors.feedbackType.message}</p>
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-lg font-semibold">Category & Priority</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Help us categorize and prioritize your feedback</p>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FEEDBACK_CATEGORIES.map(category => {
                      const Icon = categoryIcons[category.value];
                      const isSelected = watchedCategory === category.value;
                      return (
                        <Card
                          key={category.value}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                          onClick={() => setValue('category', category.value)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${
                                isSelected ? 'text-blue-600' : 'text-slate-400'
                              }`} />
                              <div>
                                <p className="font-medium text-xs">{category.label}</p>
                                <p className="text-xs text-slate-500">{category.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {FEEDBACK_PRIORITIES.map(priority => {
                      const isSelected = watchedPriority === priority.value;
                      return (
                        <div
                          key={priority.value}
                          className={`cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
                            isSelected 
                              ? `bg-gradient-to-r ${priorityColors[priority.value]} text-white shadow-lg transform scale-105` 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                          onClick={() => setValue('priority', priority.value)}
                        >
                          <p className={`font-medium text-center ${
                            isSelected ? 'text-white' : priority.color
                          }`}>
                            {priority.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-lg font-semibold">Tell us more</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Provide details about your feedback</p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of your feedback..."
                    {...register('title')}
                    className={`transition-all duration-200 ${
                      errors.title ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                    }`}
                  />
                  {errors.title && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600"
                    >
                      {errors.title.message}
                    </motion.p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your feedback. What happened? What did you expect? Steps to reproduce (for bugs)..."
                    rows={5}
                    {...register('description')}
                    className={`resize-none transition-all duration-200 ${
                      errors.description ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                    }`}
                  />
                  {errors.description && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600"
                    >
                      {errors.description.message}
                    </motion.p>
                  )}
                </div>

                {/* Context Info */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Context Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                    <div><strong>Page:</strong> {location.pathname}</div>
                    <div><strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
                    <div><strong>Screen:</strong> {screen.width}×{screen.height}</div>
                    <div className="text-xs text-slate-500 pt-2">
                      This information helps us understand the context of your feedback
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!watchedType && currentStep === 1}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
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
            )}

            {currentStep === 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};