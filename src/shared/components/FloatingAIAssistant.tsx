import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowLeft, Sparkles, Mic } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { SisoIcon } from '@/shared/ui/icons/SisoIcon';
import { EnhancedAIAssistantTab } from '../../ai-first/features/tasks/components/EnhancedAIAssistantTab';
import { AIAssistantFeatureFlags, getDefaultFeatureFlags } from '../../ai-first/shared/utils/feature-flags';

interface FloatingAIAssistantProps {
  /** Current page context for contextual AI responses */
  context?: 'lifelock' | 'morning' | 'work' | 'wellness' | 'timebox' | 'checkout';
  /** Callback when AI creates tasks */
  onTaskCreated?: (task: string) => void;
  /** Callback when AI session completes */
  onSessionComplete?: (session: any) => void;
  /** Custom class names */
  className?: string;
}

/**
 * Floating AI Assistant for LifeLock
 * 
 * Mobile Behavior:
 * - Small floating bubble in bottom-right corner
 * - Tap to open full-screen AI chat interface
 * - Back arrow in top-left to return to LifeLock
 * 
 * Desktop Behavior:
 * - Floating bubble expands to overlay panel
 * - Click outside to close
 * - Maintains LifeLock context
 */
export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  context = 'lifelock',
  onTaskCreated,
  onSessionComplete,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<AIAssistantFeatureFlags>(() => {
    // Enable core features for LifeLock integration
    return {
      ...getDefaultFeatureFlags(),
      enableChatThreads: true,
      enablePersonalChatMode: true,
      enableMorningRoutineTimer: context === 'morning',
      enableVoiceToText: true,
      enableAIProcessing: true,
      enableTaskCreation: true
    };
  });

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Context-aware initial messages
  const getContextualMessage = () => {
    const timeOfDay = new Date().getHours();
    const isEarlyMorning = timeOfDay >= 6 && timeOfDay < 10;
    const isWorkHours = timeOfDay >= 9 && timeOfDay < 17;
    const isEvening = timeOfDay >= 17;

    switch (context) {
      case 'morning':
        return isEarlyMorning 
          ? "Good morning! Ready to start your 23-minute morning routine? I can help you organize your thoughts and create your daily tasks." 
          : "Let's plan your morning routine for tomorrow or catch up on today's goals.";
      
      case 'work':
        return isWorkHours
          ? "Time for deep work! I can help you break down complex projects into manageable tasks or start a focus session."
          : "Let's review your work goals and plan your next productive session.";
      
      case 'wellness':
        return "How are you feeling today? I can help you plan wellness activities, track habits, or set health goals.";
      
      case 'timebox':
        return "Let's optimize your schedule! I can help you timeblock your tasks and create a productive daily structure.";
      
      case 'checkout':
        return isEvening
          ? "Time to reflect on your day! Let's review what you accomplished and plan for tomorrow."
          : "Ready to do a quick daily review? I can help you process today's progress.";
      
      default:
        return isEarlyMorning
          ? "Good morning! What would you like to accomplish today?"
          : "Hi there! I'm your AI assistant. I can help you organize tasks, plan routines, or process your thoughts.";
    }
  };

  // Show notification for contextual suggestions
  useEffect(() => {
    const timeOfDay = new Date().getHours();
    const shouldShowNotification = 
      (context === 'morning' && timeOfDay >= 6 && timeOfDay < 9) ||
      (context === 'checkout' && timeOfDay >= 17 && timeOfDay < 20);
    
    setHasNotification(shouldShowNotification);
    
    // Auto-hide notification after 30 seconds
    if (shouldShowNotification) {
      const timer = setTimeout(() => setHasNotification(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [context]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNotification(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleTaskCreated = (task: string) => {
    onTaskCreated?.(task);
    // Show success feedback
    console.log('✅ Task created via AI:', task);
  };

  const handleSessionComplete = (session: any) => {
    onSessionComplete?.(session);
    // Auto-minimize on mobile after session completion
    if (isMobile) {
      setTimeout(() => setIsOpen(false), 2000);
    }
  };

  return (
    <>
      {/* Floating AI Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed bottom-6 right-6 z-[60] ${className}`}
          >
            <Button
              onClick={handleOpen}
              size="lg"
              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Main Icon */}
              <div className="relative">
                <SisoIcon className="w-8 h-8 text-white" />
                
                {/* Pulsing effect */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-400 rounded-full opacity-20"
                />
              </div>
              
              {/* Notification Badge */}
              {hasNotification && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </Badge>
                </motion.div>
              )}
              
              {/* Hover Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                  AI Assistant
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                </div>
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Full-Screen AI Chat */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-gray-900"
          >
            {/* Mobile Header with Back Arrow */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                LifeLock
              </Button>
              
              <div className="flex items-center gap-2">
                <SisoIcon className="w-6 h-6" />
                <span className="font-semibold">AI Assistant</span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {context}
              </Badge>
            </div>

            {/* Full AI Chat Interface */}
            <div className="flex-1 h-full pb-16">
              <EnhancedAIAssistantTab
                featureFlags={featureFlags}
                initialMessage={getContextualMessage()}
                onTaskCreated={handleTaskCreated}
                onSessionComplete={handleSessionComplete}
                className="h-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Overlay Panel */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/20 z-[55]"
            />
            
            {/* AI Panel */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, x: 20, y: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: 20, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[60] overflow-hidden"
            >
              {/* Desktop Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <SisoIcon className="w-5 h-5" />
                  <span className="font-semibold">AI Assistant</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {context}
                  </Badge>
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* AI Chat Interface */}
              <div className="h-full pb-16">
                <EnhancedAIAssistantTab
                  featureFlags={featureFlags}
                  initialMessage={getContextualMessage()}
                  onTaskCreated={handleTaskCreated}
                  onSessionComplete={handleSessionComplete}
                  className="h-full"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIAssistant;