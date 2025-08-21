import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageSquare, 
  Phone, 
  Bot, 
  Cog, 
  Activity, 
  Database,
  Smartphone,
  Send,
  Mic,
  MicOff,
  Loader2,
  Zap,
  Eye,
  BarChart3,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastActivity: string;
  data?: any;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  systemData?: {
    source: string;
    data: any;
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
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userInput = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
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

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Here you would integrate with voice recognition
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
      {/* Header */}
      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-purple-900/90 via-blue-900/80 to-purple-900/90 border-x border-t border-purple-500/20 p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                Legacy AI
              </h2>
              <p className="text-xs text-purple-200/80">
                Hyper-intelligent system monitor
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="border-x border-purple-500/20 bg-gray-900/60 p-3">
        <div className="flex flex-wrap gap-2">
          {systemStatuses.map((system) => (
            <div
              key={system.id}
              className={cn(
                "flex items-center space-x-1 px-2 py-1 rounded-lg text-xs border",
                getStatusColor(system.status),
                "border-current/30"
              )}
            >
              {getStatusIcon(system.status)}
              <span className="font-medium">{system.name}</span>
              <span className="opacity-70">• {system.lastActivity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border-x border-purple-500/20 bg-gray-900/40 p-4 space-y-4">
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
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  message.type === 'user' 
                    ? "bg-purple-600/80 text-white ml-4" 
                    : message.type === 'system'
                    ? "bg-blue-900/60 text-blue-200 border border-blue-500/30"
                    : "bg-gray-800/80 text-gray-200 mr-4"
                )}
              >
                {message.type !== 'user' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {message.type === 'system' ? (
                        <Cog className="h-3 w-3 text-white" />
                      ) : (
                        <Brain className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-xs opacity-70">
                      {message.type === 'system' ? 'System' : 'Legacy AI'}
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-line">{message.content}</div>
                {message.systemData && (
                  <div className="mt-2 p-2 bg-black/30 rounded text-xs border border-gray-600/30">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Database className="h-3 w-3" />
                      <span>Data from {message.systemData.source}</span>
                    </div>
                  </div>
                )}
                
                {/* AI Response Feedback */}
                {message.type === 'assistant' && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-6 w-6 p-0",
                          message.userFeedback === 'positive' 
                            ? "text-green-400 bg-green-400/20" 
                            : "text-gray-500 hover:text-green-400"
                        )}
                        onClick={() => handleFeedback(message.id, 'positive')}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-6 w-6 p-0",
                          message.userFeedback === 'negative' 
                            ? "text-red-400 bg-red-400/20" 
                            : "text-gray-500 hover:text-red-400"
                        )}
                        onClick={() => handleFeedback(message.id, 'negative')}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {message.type !== 'assistant' && (
                  <div className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800/80 text-gray-200 rounded-lg p-3 text-sm flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Legacy AI is analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border border-purple-500/20 border-t-0 rounded-b-xl bg-gray-900/80 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask Legacy AI about your systems..."
              className="bg-gray-800/60 border-purple-500/30 text-white placeholder-gray-400 pr-12"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleVoiceToggle}
              className={cn(
                "absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0",
                isListening ? "text-red-400 bg-red-400/20" : "text-gray-400 hover:text-white"
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            size="sm"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-purple-900/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            onClick={() => setInput('Check system status')}
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            System Status
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-blue-900/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
            onClick={() => setInput('Summarize WhatsApp messages')}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-green-900/20 border-green-500/30 text-green-300 hover:bg-green-500/20"
            onClick={() => setInput('Check agent system performance')}
          >
            <Bot className="h-3 w-3 mr-1" />
            Agents
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-amber-900/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            onClick={() => setInput('Show automation dev status')}
          >
            <Zap className="h-3 w-3 mr-1" />
            Automation
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-indigo-900/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20"
            onClick={() => setInput('Analyze Telegram channels')}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Telegram
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-red-900/20 border-red-500/30 text-red-300 hover:bg-red-500/20"
            onClick={() => setInput('Show critical alerts and recommendations')}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alerts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LegacyAI;