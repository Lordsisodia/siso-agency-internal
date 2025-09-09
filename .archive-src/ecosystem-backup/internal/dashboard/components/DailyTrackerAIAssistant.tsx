import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dailyTrackerAI } from '@/services/core/ai.service';
import { voiceService } from '@/services/integrations/voiceService';

interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  notes?: string;
}

interface AIAssistantProps {
  currentTasks: {
    deepFocus: DailyTask[];
    lightFocus: DailyTask[];
    morningRoutine: DailyTask[];
    workout: DailyTask[];
    health: DailyTask[];
  };
  onTasksUpdate: (category: string, action: string, tasks?: DailyTask[]) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{
    type: string;
    description: string;
    executed: boolean;
  }>;
  tasks?: DailyTask[];
}

export const DailyTrackerAIAssistant: React.FC<AIAssistantProps> = ({
  currentTasks,
  onTasksUpdate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [serviceStatus, setServiceStatus] = useState({ grokReady: false, fallbackReady: true });
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check AI service status
    const status = dailyTrackerAI.getServiceStatus();
    setServiceStatus(status);

    // Check voice support
    const checkVoiceSupport = async () => {
      const speechSupported = voiceService.isSpeechRecognitionSupported();
      let micPermission = false;
      
      try {
        micPermission = await voiceService.checkMicrophonePermissions();
      } catch (error) {
        console.warn('🎤 [AI ASSISTANT] Microphone check failed:', error);
      }
      
      const supported = speechSupported && micPermission;
      setVoiceSupported(supported);
      
      console.log('🎤 [AI ASSISTANT] Voice support:', {
        speechSupported,
        micPermission,
        supported
      });
    };

    checkVoiceSupport();

    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: `🤖 **Daily Tracker AI Ready!**\n\nI can help you manage your daily tasks with natural language commands:\n\n• "**Complete all morning routine**"\n• "**Add high priority task review client proposals**"\n• "**Delete all deep focus tasks**"\n• "**Clear all light work**"\n\nJust tell me what you want to do!${voiceSupported ? '\n\n🎤 **Voice commands are supported!**' : ''}`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await dailyTrackerAI.processCommand(input, currentTasks);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        actions: response.actions,
        tasks: response.tasks
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute the actions
      if (response.success && response.actions) {
        executeActions(response.actions, response.tasks);
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeActions = (actions: any[], tasks?: DailyTask[]) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'clear_tasks':
          // Determine which category to clear
          Object.keys(currentTasks).forEach(category => {
            onTasksUpdate(category, 'clear');
          });
          break;
        
        case 'complete_tasks':
          // Mark all tasks as completed
          Object.keys(currentTasks).forEach(category => {
            onTasksUpdate(category, 'complete_all');
          });
          break;
        
        default:
          if (tasks) {
            // Add new tasks
            onTasksUpdate('deepFocus', 'add', tasks);
          }
      }
    });
  };

  const handleVoiceInput = async () => {
    console.log('🎤 [AI ASSISTANT] Voice input requested');
    setVoiceError(null);

    if (!voiceSupported) {
      const errorMsg = 'Voice recognition not supported. Please use Chrome, Edge, or Safari with microphone permissions.';
      setVoiceError(errorMsg);
      console.error('❌ [AI ASSISTANT] Voice not supported:', errorMsg);
      return;
    }

    if (isListening) {
      console.log('🛑 [AI ASSISTANT] Stopping voice input');
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    console.log('🎤 [AI ASSISTANT] Starting voice input');
    setIsListening(true);
    
    try {
      await voiceService.startListening(
        async (transcript, isFinal) => {
          console.log('📝 [AI ASSISTANT] Voice transcript:', { transcript, isFinal });
          
          if (isFinal && transcript.trim()) {
            console.log('✅ [AI ASSISTANT] Final voice input received:', transcript);
            setIsListening(false);
            setInput(transcript);
            
            // Add user voice message to chat
            const userMessage: ChatMessage = {
              id: Date.now().toString(),
              type: 'user',
              content: `🎤 ${transcript}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);
            
            // Auto-submit voice input after a brief delay
            setTimeout(() => {
              const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
              setInput(transcript); // Ensure input is set
              handleSubmit(fakeEvent);
            }, 200);
          }
        },
        (error) => {
          console.error('❌ [AI ASSISTANT] Voice error:', error);
          setVoiceError(error);
          setIsListening(false);
          
          // Add error message to chat
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'assistant',
            content: `❌ **Voice Error**: ${error}\n\nPlease try again or use text input.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        },
        {
          language: 'en-US',
          continuous: false,
          interimResults: true
        }
      );
    } catch (error) {
      setIsListening(false);
      const errorMsg = error instanceof Error ? error.message : 'Voice input failed';
      setVoiceError(errorMsg);
      console.error('❌ [AI ASSISTANT] Failed to start voice input:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ **Voice Setup Failed**: ${errorMsg}\n\nPlease check your microphone permissions and try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const quickCommands = [
    { label: 'Complete Morning Routine', command: 'complete all morning routine' },
    { label: 'Clear Deep Focus', command: 'delete all deep focus tasks' },
    { label: 'Add High Priority Task', command: 'add high priority task ' },
    { label: 'Complete All Tasks', command: 'complete all tasks' }
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  if (!isOpen) {
    return (
      <motion.div 
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`fixed bottom-6 right-6 z-50 ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="w-96 h-[500px] bg-gray-900/95 border-orange-500/50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-orange-400 text-lg">
              <Brain className="h-5 w-5 mr-2" />
              Daily Tracker AI
              <div className="flex items-center ml-2 space-x-1">
                <div className={`h-2 w-2 rounded-full ${serviceStatus.grokReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {serviceStatus.grokReady ? 'Enhanced' : 'Basic'}
                </span>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
          
          {/* Quick Commands */}
          <div className="flex flex-wrap gap-1 mt-2">
            {quickCommands.map((cmd, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(cmd.command)}
                className="text-xs h-6 px-2 bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {cmd.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col h-full p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 space-y-3 max-h-80">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Show actions if present */}
                    {message.actions && (
                      <div className="mt-2 space-y-1">
                        {message.actions.map((action, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-300">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            {action.description}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Show created tasks if present */}
                    {message.tasks && (
                      <div className="mt-2 space-y-1">
                        {message.tasks.map((task, index) => (
                          <div key={index} className="text-xs bg-gray-700/50 rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{task.title}</span>
                              {task.priority && (
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </Badge>
                              )}
                            </div>
                            {task.notes && (
                              <div className="text-gray-400 mt-1">{task.notes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-orange-400" />
                  <span className="text-sm text-gray-300">Processing...</span>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me what to do with your tasks..."
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500"
                disabled={isProcessing}
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                className={`px-3 transition-all ${
                  isListening 
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                type="submit"
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white px-3"
                disabled={isProcessing || !input.trim()}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyTrackerAIAssistant;