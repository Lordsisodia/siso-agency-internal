import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface FeedbackItem {
  id: string;
  text: string;
  submitted: boolean;
  created_at: string;
}

interface SimpleFeedbackListProps {
  className?: string;
  title?: string;
  onSubmit?: (items: FeedbackItem[]) => Promise<void>;
}

export function SimpleFeedbackList({ 
  className, 
  title = "Feedback List",
  onSubmit 
}: SimpleFeedbackListProps) {
  const [feedbackItems, setFeedbackItems] = useLocalStorage<FeedbackItem[]>('simple-feedback-list', []);
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const pendingItems = feedbackItems.filter(item => !item.submitted);
  const submittedItems = feedbackItems.filter(item => item.submitted);

  const handleAddFeedback = () => {
    if (newFeedbackText.trim()) {
      const newItem: FeedbackItem = {
        id: Date.now().toString(),
        text: newFeedbackText.trim(),
        submitted: false,
        created_at: new Date().toISOString()
      };
      setFeedbackItems(prev => [...prev, newItem]);
      setNewFeedbackText('');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setFeedbackItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddFeedback();
    }
  };

  const handleSubmitAll = async () => {
    if (pendingItems.length === 0) {
      toast({
        title: '⚠️ No feedback to submit',
        description: 'Add some feedback first.',
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
        title: '✅ Feedback submitted!',
        description: `${pendingItems.length} feedback item(s) submitted.`,
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: '❌ Failed to submit',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("bg-white/95 backdrop-blur-sm border-0 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-700">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add New Feedback - Simple Input */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Add feedback..."
            value={newFeedbackText}
            onChange={(e) => setNewFeedbackText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 border-b border-gray-300 rounded-none bg-transparent placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-gray-600 text-sm text-black"
          />
          <Button
            onClick={handleAddFeedback}
            size="sm"
            className="h-8 w-8 p-0 bg-gray-600 hover:bg-gray-700 rounded-full shrink-0"
            disabled={!newFeedbackText.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Feedback List - Just like tasks */}
        <div className="space-y-2">
          <AnimatePresence>
            {pendingItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-3 py-2 rounded-full border bg-white border-gray-300 hover:border-gray-400 transition-all duration-200 hover:shadow-sm"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></span>
                
                <span className="flex-1 text-sm text-gray-800 truncate" title={item.text}>
                  {item.text}
                </span>
                
                <Button
                  onClick={() => handleDeleteItem(item.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        {pendingItems.length > 0 && (
          <div className="pt-2 border-t border-gray-200 space-y-3">
            <p className="text-sm text-gray-600 font-medium italic">
              {pendingItems.length} feedback item{pendingItems.length !== 1 ? 's' : ''} ready to submit
            </p>
            <Button
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
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
                  Submit Feedback ({pendingItems.length})
                </>
              )}
            </Button>
          </div>
        )}

        {/* Submitted Items (Simple View) */}
        {submittedItems.length > 0 && (
          <details className="group pt-2 border-t border-gray-100">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ✅ {submittedItems.length} submitted
            </summary>
            <div className="mt-2 space-y-1 pl-4">
              {submittedItems.slice(-5).map((item) => (
                <div key={item.id} className="text-xs text-gray-400 truncate">
                  • {item.text}
                </div>
              ))}
              {submittedItems.length > 5 && (
                <div className="text-xs text-gray-400">
                  ... and {submittedItems.length - 5} more
                </div>
              )}
            </div>
          </details>
        )}

        {/* Empty State */}
        {feedbackItems.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm italic">
            Start typing feedback above to add items to your list
          </div>
        )}
      </CardContent>
    </Card>
  );
}