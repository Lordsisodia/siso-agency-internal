import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MessageSquare, X } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useClerkUser } from "@/lib/hooks/auth/useClerkUser";
import { useToast } from "@/lib/hooks/ui/useToast";
import { useSupabaseUserId } from "@/lib/supabase-clerk";
import { feedbackService } from "@/services/feedbackService";

import { SimpleFeedbackList } from "./SimpleFeedbackList";

interface FeedbackItem {
  id: string;
  text: string;
  submitted: boolean;
  created_at: string;
}

interface SimpleFeedbackButtonProps {
  onSubmit?: (items: FeedbackItem[]) => Promise<void>;
  variant?: "icon" | "bar";
  className?: string;
}

export function SimpleFeedbackButton({ onSubmit, variant = "icon", className = "" }: SimpleFeedbackButtonProps) {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  const handleFeedbackSubmission = async (items: FeedbackItem[]) => {
    if (!internalUserId) {
      toast({ title: "Not signed in", description: "Please log in to submit feedback", variant: "destructive" });
      return;
    }

    if (onSubmit) {
      await onSubmit(items);
    } else {
      for (const item of items) {
        try {
          await feedbackService.createFeedbackWithUserId(
            internalUserId,
            {
              title: item.text,
              description: item.text,
              category: "GENERAL",
              feedbackType: "SUGGESTION",
              priority: "MEDIUM",
              page: window.location.pathname,
            },
            navigator.userAgent,
            `${screen.width}x${screen.height}`
          );
        } catch (error) {
          console.error("Failed to submit feedback:", error);
          throw error;
        }
      }
    }

    setTimeout(() => setShowFeedback(false), 1000);
  };

  return (
    <>
      {variant === "icon" ? (
        <Button
          onClick={() => setShowFeedback(true)}
          className={`h-10 w-10 rounded-full bg-blue-600 p-0 shadow-lg hover:bg-blue-700 ${className}`}
          size="sm"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={() => setShowFeedback(true)}
          className={`px-6 py-3 text-sm font-medium shadow-lg bg-blue-600 hover:bg-blue-700 ${className}`}
          size="default"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
      )}

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-md p-0">
          <VisuallyHidden>
            <DialogTitle>Quick Feedback</DialogTitle>
            <DialogDescription>Add feedback items to your list and submit them.</DialogDescription>
          </VisuallyHidden>
          <div className="relative">
            <Button
              onClick={() => setShowFeedback(false)}
              className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full p-0"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="p-4">
              <SimpleFeedbackList title="Quick Feedback" onSubmit={handleFeedbackSubmission} className="border-0 bg-transparent shadow-none" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
