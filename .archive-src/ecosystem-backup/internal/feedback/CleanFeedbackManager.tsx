import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Plus, X, Send, Lightbulb, Bug, Heart, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { useToast } from '@/shared/hooks/use-toast';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'suggestion' | 'improvement' | 'complaint' | 'praise';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  submitted: boolean;
}

interface CleanFeedbackManagerProps {
  className?: string;
  onSubmit?: (items: FeedbackItem[]) => Promise<void>;
}

const feedbackTypes = [
  { value: 'bug' as const, label: 'Bug', icon: Bug, color: 'text-red-500', bg: 'bg-red-50' },
  { value: 'suggestion' as const, label: 'Suggestion', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { value: 'improvement' as const, label: 'Improvement', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'complaint' as const, label: 'Issue', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  { value: 'praise' as const, label: 'Praise', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
];

const priorityOptions = [
  { value: 'low' as const, label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium' as const, label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high' as const, label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent' as const, label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export function CleanFeedbackManager({ className, onSubmit }: CleanFeedbackManagerProps) {
  const [feedbackItems, setFeedbackItems] = useLocalStorage<FeedbackItem[]>('feedback-items', []);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    type: 'suggestion' as const,
    priority: 'medium' as const,
  });
  const { toast } = useToast();

  const pendingItems = feedbackItems.filter(item => !item.submitted);
  const submittedItems = feedbackItems.filter(item => item.submitted);

  const handleAddItem = () => {
    if (newItem.title.trim() && newItem.description.trim()) {
      const item: FeedbackItem = {
        id: Date.now().toString(),
        title: newItem.title.trim(),
        description: newItem.description.trim(),
        type: newItem.type,
        priority: newItem.priority,
        created_at: new Date().toISOString(),
        submitted: false,
      };
      
      setFeedbackItems(prev => [...prev, item]);
      setNewItem({
        title: '',
        description: '',
        type: 'suggestion',
        priority: 'medium',
      });
      setIsAddingNew(false);
      
      toast({
        title: '✅ Feedback added',
        description: 'Your feedback has been added to the list.',
      });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setFeedbackItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmitAll = async () => {
    if (pendingItems.length === 0) {
      toast({
        title: '⚠️ No feedback to submit',
        description: 'Add some feedback items first.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(pendingItems);
      }
      
      // Mark items as submitted
      setFeedbackItems(prev => 
        prev.map(item => 
          !item.submitted ? { ...item, submitted: true } : item
        )
      );

      toast({
        title: '🎉 Feedback submitted successfully!',
        description: `${pendingItems.length} feedback item(s) have been submitted.`,
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: '❌ Failed to submit feedback',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: FeedbackItem['type']) => {
    const typeData = feedbackTypes.find(t => t.value === type);
    return typeData ? typeData.icon : Lightbulb;
  };

  const getTypeColor = (type: FeedbackItem['type']) => {
    const typeData = feedbackTypes.find(t => t.value === type);
    return typeData ? typeData.color : 'text-gray-500';
  };

  const getPriorityColor = (priority: FeedbackItem['priority']) => {
    const priorityData = priorityOptions.find(p => p.value === priority);
    return priorityData ? priorityData.color : 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className={cn("bg-white/95 backdrop-blur-sm border-0 shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800">Feedback Manager</CardTitle>
          <div className="flex items-center gap-2">
            {pendingItems.length > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {pendingItems.length} pending
              </Badge>
            )}
            <Button
              onClick={() => setIsAddingNew(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Feedback
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add New Feedback Form */}
        <AnimatePresence>
          {isAddingNew && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="space-y-4">
                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {feedbackTypes.map(type => {
                      const Icon = type.icon;
                      const isSelected = newItem.type === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewItem(prev => ({ ...prev, type: type.value }))}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                            isSelected
                              ? `${type.bg} ${type.color} border-current`
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <div className="flex gap-2">
                    {priorityOptions.map(priority => {
                      const isSelected = newItem.priority === priority.value;
                      return (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => setNewItem(prev => ({ ...prev, priority: priority.value }))}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium transition-all border-2",
                            isSelected
                              ? `${priority.color} border-current`
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {priority.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of your feedback..."
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed information about your feedback..."
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddItem}
                    disabled={!newItem.title.trim() || !newItem.description.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                  <Button
                    onClick={() => setIsAddingNew(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending Feedback Items */}
        {pendingItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Pending Feedback ({pendingItems.length})
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {pendingItems.map((item) => {
                  const Icon = getTypeIcon(item.type);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", getTypeColor(item.type))} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", getPriorityColor(item.priority))}>
                                {item.priority}
                              </Badge>
                              <Button
                                onClick={() => handleDeleteItem(item.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                          <p className="text-xs text-gray-400">
                            Added {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {pendingItems.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit All Feedback ({pendingItems.length})
                </>
              )}
            </Button>
          </div>
        )}

        {/* Submitted Items (Collapsed) */}
        {submittedItems.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
              View Submitted Feedback ({submittedItems.length})
            </summary>
            <div className="mt-3 space-y-2 pl-4">
              {submittedItems.map((item) => {
                const Icon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 opacity-75">
                    <div className="flex items-start gap-3">
                      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", getTypeColor(item.type))} />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <Badge className="text-xs bg-green-100 text-green-700">Submitted</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {/* Empty State */}
        {feedbackItems.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No feedback items yet</p>
            <Button
              onClick={() => setIsAddingNew(true)}
              variant="outline"
              className="border-dashed border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Feedback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}