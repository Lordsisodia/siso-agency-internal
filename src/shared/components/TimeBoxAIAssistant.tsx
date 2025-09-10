/**
 * TimeBox AI Assistant - Specialized AI for task scheduling and time management
 * Integrates with TimeBox API to help users schedule existing Supabase tasks
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  ArrowLeft, 
  Send, 
  Mic,
  MicOff,
  Calendar,
  Clock,
  Brain,
  Sparkles,
  Target,
  Zap,
  CheckCircle2,
  Timer,
  TrendingUp,
  Coffee
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { timeboxApi, TimeBoxTask, DaySchedule } from '@/api/timeboxApi';
import { timeboxAiService, ChatMessage, TaskAction, TaskSuggestion } from '@/services/timeboxAiService';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

export interface TimeBoxAIAssistantProps {
  context?: 'timebox';
  onTaskScheduled?: (taskId: string) => void;
  onScheduleChanged?: () => void;
  className?: string;
}

// Remove duplicate interfaces - using ones from timeboxAiService

export const TimeBoxAIAssistant: React.FC<TimeBoxAIAssistantProps> = ({
  context = 'timebox',
  onTaskScheduled,
  onScheduleChanged,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [availableTasks, setAvailableTasks] = useState<TimeBoxTask[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  // Initialize AI service and load data
  useEffect(() => {
    const initializeAI = async () => {
      if (!isOpen || isInitialized) return;
      
      try {
        setIsLoading(true);
        
        // Initialize AI service with context
        const context = await timeboxAiService.initializeContext();
        setSchedule(context.schedule);
        setAvailableTasks(context.availableTasks);
        
        // Load conversation history
        const history = timeboxAiService.loadConversationHistory();
        if (history.length > 0) {
          setMessages(history);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAI();
  }, [isOpen, isInitialized]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `👋 Hi! I'm your TimeBox AI assistant. I can help you schedule your ${availableTasks.length} unscheduled tasks. Try saying things like:

• "Schedule my high priority tasks for this morning"
• "Auto-schedule everything for today"  
• "When should I do my deep work tasks?"
• "Find time for my light work"

What would you like me to help you with?`,
        type: 'assistant',
        timestamp: new Date(),
        suggestions: availableTasks.slice(0, 3).map(task => ({
          task,
          suggestedTime: '09:00',
          reason: 'Based on task priority and your energy levels',
          priority: task.priority === 'HIGH' ? 'high' : 'medium'
        }))
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, availableTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setInput('');
    setIsLoading(true);

    try {
      // Process message through real AI service
      const response = await timeboxAiService.processUserMessage(input);
      setMessages(prev => [...prev, response]);

      // Save conversation history
      timeboxAiService.saveConversationHistory();

      // Auto-execute high confidence actions
      if (response.actions) {
        for (const action of response.actions) {
          if (action.confidence > 0.8) {
            await executeTaskAction(action);
          }
        }
      }

      // Refresh context after actions
      const context = timeboxAiService.getContext();
      if (context) {
        setSchedule(context.schedule);
        setAvailableTasks(context.availableTasks);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        type: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const executeSchedulingAction = async (action: SchedulingAction) => {
    try {
      switch (action.type) {
        case 'auto_schedule':
          await timeboxApi.autoScheduleTasks();
          onScheduleChanged?.();
          break;
        case 'schedule':
          if (action.taskId && action.timeSlot) {
            // Implementation would schedule specific task
            onTaskScheduled?.(action.taskId);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to execute scheduling action:', error);
    }
  };

  const handleSuggestionClick = (suggestion: TaskSuggestion) => {
    setInput(`Schedule "${suggestion.task.title}" for ${suggestion.suggestedTime}`);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!isOpen) {
    return (
      <motion.div
        className={cn("fixed z-50", className)}
        style={{
          bottom: isMobile ? '20px' : '24px',
          right: isMobile ? '20px' : '24px'
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg border-2 border-purple-400/50"
        >
          <div className="relative">
            <Calendar className="h-6 w-6 text-white" />
            {availableTasks.length > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{availableTasks.length}</span>
              </div>
            )}
          </div>
        </Button>
      </motion.div>
    );
  }

  // Mobile full-screen view
  if (isMobile) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to TimeBox
          </Button>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <span className="text-white font-medium">TimeBox AI</span>
          </div>
          <div></div>
        </div>

        {/* Schedule Overview */}
        <div className="p-4 border-b border-gray-800">
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-blue-300">{availableTasks.length}</div>
                <div className="text-xs text-blue-400">Unscheduled</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-green-300">{schedule?.scheduledTasks.length || 0}</div>
                <div className="text-xs text-green-400">Scheduled</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-purple-300">{Math.round(schedule?.productivityScore || 0)}%</div>
                <div className="text-xs text-purple-400">Complete</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn(
                "flex",
                message.type === 'user' ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.type === 'user' 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-800 text-gray-100"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Task Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-300">Suggested tasks:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full justify-start text-left bg-gray-700/50 border-gray-600 hover:bg-gray-600"
                        >
                          <div className="flex items-center space-x-2">
                            {suggestion.task.taskType === 'deep_work' ? (
                              <Brain className="h-3 w-3 text-purple-400" />
                            ) : (
                              <Coffee className="h-3 w-3 text-blue-400" />
                            )}
                            <span className="font-medium">{suggestion.task.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.suggestedTime}
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => executeSchedulingAction(action)}
                          className="w-full bg-blue-600/20 border-blue-500/40 hover:bg-blue-600/30"
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          {action.description}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to schedule your tasks..."
                className="bg-gray-800 border-gray-700 text-white pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-red-400" />
                ) : (
                  <Mic className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </motion.div>
    );
  }

  // Desktop overlay view
  return (
    <motion.div
      className="fixed bottom-20 right-6 z-50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="w-96 h-96 bg-gray-900 border-purple-400/30 shadow-2xl">
        <CardHeader className="pb-3 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <span className="font-medium text-white">TimeBox AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-80">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-2 text-sm",
                    message.type === 'user' 
                      ? "bg-purple-600 text-white" 
                      : "bg-gray-800 text-gray-100"
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Suggestions and Actions similar to mobile */}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800">
            <div className="flex items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Schedule tasks..."
                className="bg-gray-800 border-gray-700 text-white text-sm"
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// AI Processing Logic for TimeBox Requests
async function processTimeBoxRequest(
  input: string, 
  availableTasks: TimeBoxTask[], 
  schedule: DaySchedule | null
): Promise<{
  content: string;
  actions?: SchedulingAction[];
  suggestions?: TaskSuggestion[];
}> {
  const lowercaseInput = input.toLowerCase();
  
  // Auto-schedule request
  if (lowercaseInput.includes('auto') && lowercaseInput.includes('schedule')) {
    return {
      content: `🤖 I'll automatically schedule your ${availableTasks.length} tasks based on priority and estimated duration. This will optimize your day for maximum productivity!`,
      actions: [{
        type: 'auto_schedule',
        confidence: 0.9,
        description: 'Auto-schedule all tasks'
      }]
    };
  }
  
  // High priority tasks
  if (lowercaseInput.includes('high priority') || lowercaseInput.includes('important')) {
    const highPriorityTasks = availableTasks.filter(t => t.priority === 'HIGH');
    return {
      content: `🎯 I found ${highPriorityTasks.length} high-priority tasks. I recommend scheduling these during your peak energy hours (9-11 AM) for maximum focus and productivity.`,
      suggestions: highPriorityTasks.slice(0, 3).map(task => ({
        task,
        suggestedTime: '09:00',
        reason: 'Peak energy hours for high-priority work',
        priority: 'high'
      }))
    };
  }
  
  // Deep work requests
  if (lowercaseInput.includes('deep work') || lowercaseInput.includes('focus')) {
    const deepWorkTasks = availableTasks.filter(t => t.taskType === 'deep_work');
    return {
      content: `🧠 You have ${deepWorkTasks.length} deep work tasks. I suggest scheduling these in 90-minute blocks during your most focused hours, with breaks between sessions.`,
      suggestions: deepWorkTasks.slice(0, 2).map((task, index) => ({
        task,
        suggestedTime: index === 0 ? '09:00' : '14:00',
        reason: index === 0 ? 'Peak morning focus' : 'Post-lunch concentration',
        priority: 'high'
      }))
    };
  }
  
  // Light work requests
  if (lowercaseInput.includes('light work') || lowercaseInput.includes('quick tasks')) {
    const lightWorkTasks = availableTasks.filter(t => t.taskType === 'light_work');
    return {
      content: `☕ You have ${lightWorkTasks.length} light work tasks. These are perfect for filling gaps between meetings or when your energy is lower.`,
      suggestions: lightWorkTasks.slice(0, 3).map((task, index) => ({
        task,
        suggestedTime: ['11:00', '13:00', '16:00'][index] || '16:00',
        reason: 'Good for transition periods',
        priority: 'medium'
      }))
    };
  }
  
  // Morning scheduling
  if (lowercaseInput.includes('morning') || lowercaseInput.includes('am')) {
    return {
      content: `🌅 Morning is perfect for your most important work! I'll prioritize high-energy tasks between 8-12 PM when your focus is strongest.`,
      suggestions: availableTasks
        .filter(t => t.priority === 'HIGH' || t.taskType === 'deep_work')
        .slice(0, 3)
        .map((task, index) => ({
          task,
          suggestedTime: ['08:00', '09:30', '11:00'][index] || '08:00',
          reason: 'Optimal morning energy',
          priority: 'high'
        }))
    };
  }
  
  // Default response
  return {
    content: `💡 I can help you schedule your ${availableTasks.length} unscheduled tasks. Try asking me about:

• Auto-scheduling everything optimally
• Scheduling high-priority tasks  
• Finding time for deep work or light work
• Organizing your morning or afternoon

What would you like to focus on first?`,
    suggestions: availableTasks.slice(0, 3).map(task => ({
      task,
      suggestedTime: '09:00',
      reason: 'Next available optimal time slot',
      priority: task.priority === 'HIGH' ? 'high' : 'medium'
    }))
  };
}