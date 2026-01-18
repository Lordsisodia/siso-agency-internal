import React, { useState } from 'react';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { SimpleFeedbackList } from './SimpleFeedbackList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { MessageSquare, X } from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';

interface FeedbackItem {
  id: string;
  text: string;
  submitted: boolean;
  created_at: string;
}

interface SimpleFeedbackButtonProps {
  onSubmit?: (items: FeedbackItem[]) => Promise<void>;
  variant?: 'icon' | 'bar';
  className?: string;
}

export function SimpleFeedbackButton({ onSubmit, variant = 'icon', className = '' }: SimpleFeedbackButtonProps) {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFeedbackSubmission = async (items: FeedbackItem[]) => {
    if (!internalUserId) {
      console.error('User not authenticated');
      return;
    }

    if (onSubmit) {
      await onSubmit(items);
    } else {
      // Default: use existing feedback service
      for (const item of items) {
        try {
          await feedbackService.createFeedbackWithUserId(internalUserId, {
            title: item.text,
            description: item.text,
            category: 'GENERAL',
            feedbackType: 'SUGGESTION',
            priority: 'MEDIUM',
            page: window.location.pathname,
          }, navigator.userAgent, `${screen.width}x${screen.height}`);
        } catch (error) {
          console.error('Failed to submit feedback:', error);
          throw error;
        }
      }
    }
    
    // Close modal after submission
    setTimeout(() => setShowFeedback(false), 1000);
  };

  return (
    <>
      {/* Feedback button - icon or bar variant */}
      {variant === 'icon' ? (
        <Button
          onClick={() => setShowFeedback(true)}
          className={`w-10 h-10 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 p-0 ${className}`}
          size="sm"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={() => setShowFeedback(true)}
          className={`shadow-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-medium ${className}`}
          size="default"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      )}

      {/* Simple modal */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-md p-0">
          <VisuallyHidden>
            <DialogTitle>Quick Feedback</DialogTitle>
            <DialogDescription>Add feedback items to your list and submit them.</DialogDescription>
          </VisuallyHidden>
          <div className="relative">
            <Button
              onClick={() => setShowFeedback(false)}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full p-0"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="p-4">
              <SimpleFeedbackList 
                title="Quick Feedback"
                onSubmit={handleFeedbackSubmission}
                className="border-0 shadow-none bg-transparent"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
