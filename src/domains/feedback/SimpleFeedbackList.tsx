import { AnimatePresence, motion } from "framer-motion";
import { Plus, Send, X } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useToast } from "@/lib/hooks/use-toast";

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

export function SimpleFeedbackList({ className, title = "Feedback List", onSubmit }: SimpleFeedbackListProps) {
  const [feedbackItems, setFeedbackItems] = useLocalStorage<FeedbackItem[]>("simple-feedback-list", []);
  const [newFeedbackText, setNewFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const pendingItems = feedbackItems.filter((item) => !item.submitted);
  const submittedItems = feedbackItems.filter((item) => item.submitted);

  const handleAddFeedback = () => {
    if (newFeedbackText.trim()) {
      const newItem: FeedbackItem = {
        id: Date.now().toString(),
        text: newFeedbackText.trim(),
        submitted: false,
        created_at: new Date().toISOString(),
      };
      setFeedbackItems((prev) => [...prev, newItem]);
      setNewFeedbackText("");
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setFeedbackItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddFeedback();
    }
  };

  const handleSubmitAll = async () => {
    if (pendingItems.length === 0) {
      toast({
        title: "⚠️ No feedback to submit",
        description: "Add some feedback first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(pendingItems);
      }

      setFeedbackItems((prev) => prev.map((item) => (!item.submitted ? { ...item, submitted: true } : item)));

      toast({
        title: "✅ Feedback submitted!",
        description: `${pendingItems.length} feedback item(s) submitted.`,
      });
    } catch (error) {
      toast({
        title: "❌ Failed to submit",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("rounded-xl border-0 bg-white/95 shadow-lg backdrop-blur-sm", className)}>
      <CardHeader className="px-6 pt-6 pb-3">
        <CardTitle className="text-lg font-bold text-gray-700">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-6">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Add feedback..."
            value={newFeedbackText}
            onChange={(e) => setNewFeedbackText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 border-b border-gray-300 bg-transparent text-sm text-black placeholder:text-gray-500 focus-visible:border-gray-600 focus-visible:ring-0"
          />
          <Button
            onClick={handleAddFeedback}
            size="sm"
            className="h-8 w-8 shrink-0 rounded-full bg-gray-600 p-0 hover:bg-gray-700"
            disabled={!newFeedbackText.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {pendingItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:border-gray-400"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500"></span>

                <span className="flex-1 truncate text-sm text-gray-800" title={item.text}>
                  {item.text}
                </span>

                <Button
                  onClick={() => handleDeleteItem(item.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 shrink-0 rounded-full p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {pendingItems.length > 0 && (
          <div className="space-y-3 border-t border-gray-200 pt-2">
            <p className="text-sm font-medium italic text-gray-600">
              {pendingItems.length} feedback item{pendingItems.length !== 1 ? "s" : ""} ready to submit
            </p>
            <Button onClick={handleSubmitAll} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback ({pendingItems.length})
                </>
              )}
            </Button>
          </div>
        )}

        {submittedItems.length > 0 && (
          <details className="group border-t border-gray-100 pt-2">
            <summary className="cursor-pointer text-sm text-gray-500 transition-colors hover:text-gray-700">
              ✅ {submittedItems.length} submitted
            </summary>
            <div className="mt-2 space-y-1 pl-4">
              {submittedItems.slice(-5).map((item) => (
                <div key={item.id} className="text-xs text-gray-400 truncate">
                  • {item.text}
                </div>
              ))}
              {submittedItems.length > 5 && (
                <div className="text-xs text-gray-400">+{submittedItems.length - 5} more</div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
