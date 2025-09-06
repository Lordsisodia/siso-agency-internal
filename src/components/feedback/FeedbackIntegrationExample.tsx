import React, { useState } from 'react';
import { CleanFeedbackManager } from './CleanFeedbackManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'suggestion' | 'improvement' | 'complaint' | 'praise';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  submitted: boolean;
}

export function FeedbackIntegrationExample() {
  const [showFeedback, setShowFeedback] = useState(false);

  // Example of how to handle feedback submission
  const handleFeedbackSubmission = async (items: FeedbackItem[]) => {
    console.log('📝 Submitting feedback items:', items);
    
    // Here you can integrate with your existing feedback service:
    // - Send to your API
    // - Save to database
    // - Send to analytics
    // - Email notifications
    
    // Example integration:
    // for (const item of items) {
    //   await yourFeedbackAPI.submit({
    //     title: item.title,
    //     description: item.description,
    //     type: item.type,
    //     priority: item.priority,
    //     source: 'clean-feedback-manager',
    //     page: window.location.pathname,
    //     userAgent: navigator.userAgent
    //   });
    // }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ Feedback submitted successfully!');
  };

  return (
    <>
      {/* Trigger Button - can be placed anywhere */}
      <Button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        size="lg"
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Give Feedback
      </Button>

      {/* Modal Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="relative">
            <Button
              onClick={() => setShowFeedback(false)}
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full p-0"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="p-6">
              <CleanFeedbackManager 
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

// Alternative: Embedded version (no modal)
export function EmbeddedFeedbackExample() {
  const handleFeedbackSubmission = async (items: FeedbackItem[]) => {
    console.log('Submitting embedded feedback:', items);
    // Your submission logic here
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Page Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is your main page content...</p>
        </CardContent>
      </Card>
      
      {/* Embedded Feedback Manager */}
      <CleanFeedbackManager onSubmit={handleFeedbackSubmission} />
      
      <Card>
        <CardHeader>
          <CardTitle>More Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>More content below the feedback manager...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Example: Sidebar version
export function SidebarFeedbackExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleFeedbackSubmission = async (items: FeedbackItem[]) => {
    console.log('Submitting sidebar feedback:', items);
    // Your submission logic here
    setIsOpen(false); // Close sidebar after submission
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        Feedback
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Feedback</h2>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <CleanFeedbackManager 
                  onSubmit={handleFeedbackSubmission}
                  className="border-0 shadow-none bg-transparent"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}