import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { PromptInputBox } from '@/shared/ui/ai-prompt-box';
import { 
  Brain, 
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastActivity: string;
  data?: Record<string, unknown>;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  systemData?: {
    source: string;
    data: Record<string, unknown>;
  };
  userFeedback?: 'positive' | 'negative' | 'neutral';
}

interface LegacyAIProps {
  className?: string;
}

export const LegacyAI: React.FC<LegacyAIProps> = ({ className }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Legacy AI initialized. Connected to 7 systems. Ready for commands.',
      timestamp: new Date()
    }
  ]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([
    { id: 'whatsapp', name: 'WhatsApp', status: 'online', lastActivity: '2 min ago' },
    { id: 'telegram', name: 'Telegram', status: 'online', lastActivity: '5 min ago' },
    { id: 'agents', name: 'Agent System', status: 'online', lastActivity: '1 min ago' },
    { id: 'automation', name: 'Automation Dev', status: 'warning', lastActivity: '15 min ago' },
    { id: 'database', name: 'Database', status: 'online', lastActivity: 'Just now' },
    { id: 'analytics', name: 'Analytics', status: 'online', lastActivity: '3 min ago' },
    { id: 'monitoring', name: 'System Monitor', status: 'online', lastActivity: 'Just now' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh system statuses
  useEffect(() => {
    const refreshSystems = async () => {
      try {
        const { legacyAIService } = await import('@/services/legacyAIService');
        const newStatuses = await legacyAIService.getSystemStatus();
        setSystemStatuses(newStatuses);
      } catch (error) {
        console.error('Failed to refresh system statuses:', error);
      }
    };

    // Initial refresh
    refreshSystems();

    // Set up interval for auto-refresh every 30 seconds
    const interval = setInterval(refreshSystems, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative' | 'neutral') => {
    try {
      const { intelligentAgentCore } = await import('@/services/intelligentAgentCore');
      
      // Find the message and its corresponding user query
      const messageIndex = messages.findIndex(m => m.id === messageId);
      const message = messages[messageIndex];
      const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
      
      if (message && userMessage && userMessage.type === 'user') {
        // Learn from the feedback
        intelligentAgentCore.learnFromInteraction(userMessage.content, message.content, feedback);
        
        // Update the message with feedback
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, userFeedback: feedback } : m
        ));
        
        console.log(`Legacy AI: Feedback '${feedback}' recorded for message about "${userMessage.content}"`);
      }
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  };

  const handleSendMessage = async (userInput: string, files?: File[]) => {
    if (!userInput.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Process with Legacy AI service
    try {
      const aiResponse = await generateAIResponse(userInput);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I encountered an issue processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<Message> => {
    try {
      // Import the service dynamically
      const { legacyAIService } = await import('@/services/legacyAIService');
      
      // Use the intelligent analysis from the service
      const analysis = await legacyAIService.generateIntelligentAnalysis(userInput);
      
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `${analysis.summary}\n\n**Key Insights:**\n${analysis.insights.map(insight => `• ${insight}`).join('\n')}\n\n**Recommended Actions:**\n${analysis.actionItems.map(action => `• ${action}`).join('\n')}\n\n*Confidence: ${Math.round(analysis.confidence * 100)}%*`,
        timestamp: new Date(),
        systemData: {
          source: Object.keys(analysis.systemData)[0] || 'legacy_ai',
          data: analysis.systemData
        }
      };
    } catch (error) {
      console.error('Legacy AI Error:', error);
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I understand you're asking about "${userInput}". I'm analyzing your connected systems and data sources to provide the most relevant information. What specific aspect would you like me to focus on?`,
        timestamp: new Date()
      };
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-emerald-400 bg-emerald-400/20';
      case 'warning': return 'text-amber-400 bg-amber-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Simplified Header */}
      <div className="bg-gray-800/50 border-b border-gray-700/50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
              <Brain className="h-3 w-3 text-white" />
            </div>
            <h2 className="text-sm font-medium text-white">Legacy AI</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-green-400">7 systems</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-900/50 p-3 space-y-2">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-2 text-sm",
                  message.type === 'user' 
                    ? "bg-purple-600 text-white ml-4" 
                    : message.type === 'system'
                    ? "bg-gray-700/70 text-gray-200"
                    : "bg-gray-800/70 text-gray-200 mr-4"
                )}
              >
                {message.type !== 'user' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500">
                      {message.type === 'system' ? 'System' : 'AI'}
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-line">{message.content}</div>
                
                {/* AI Response Feedback - Minimal */}
                {message.type === 'assistant' && (
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-5 w-5 p-0",
                          message.userFeedback === 'positive' 
                            ? "text-green-400" 
                            : "text-gray-600 hover:text-green-400"
                        )}
                        onClick={() => handleFeedback(message.id, 'positive')}
                      >
                        <ThumbsUp className="h-2 w-2" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-5 w-5 p-0",
                          message.userFeedback === 'negative' 
                            ? "text-red-400" 
                            : "text-gray-600 hover:text-red-400"
                        )}
                        onClick={() => handleFeedback(message.id, 'negative')}
                      >
                        <ThumbsDown className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {message.type !== 'assistant' && (
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800/70 text-gray-200 rounded-lg p-2 text-sm flex items-center space-x-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Prompt Input Area */}
      <div className="bg-gray-800/50 border-t border-gray-700/50 p-3">
        <PromptInputBox
          onSend={handleSendMessage}
          isLoading={isProcessing}
          placeholder="Ask Legacy AI about your systems..."
          className="w-full"
        />
        
        {/* Quick Actions - Minimal */}
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-gray-400 hover:text-white h-6 px-2"
            onClick={() => handleSendMessage('Check system status')}
          >
            Status
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-gray-400 hover:text-white h-6 px-2"
            onClick={() => handleSendMessage('Check alerts')}
          >
            Alerts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LegacyAI;