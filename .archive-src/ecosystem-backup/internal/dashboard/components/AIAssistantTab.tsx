import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Brain,
  MessageSquare,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { MobileMicrophoneButton } from '../ui/MobileMicrophoneButton';
import { ThoughtDumpResults } from '../ui/ThoughtDumpResults';
import { TabProps } from '../DayTabContainer';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  taskCount?: number;
}

const quickPrompts = [
  { 
    id: 'morning-plan', 
    text: 'Help me plan my morning routine', 
    icon: '🌅',
    category: 'planning'
  },
  { 
    id: 'task-breakdown', 
    text: 'Break down this complex task for me', 
    icon: '🔧',
    category: 'productivity'
  },
  { 
    id: 'priority-help', 
    text: 'What should I focus on today?', 
    icon: '🎯',
    category: 'focus'
  },
  { 
    id: 'thought-dump', 
    text: 'I need to dump all my thoughts', 
    icon: '🧠',
    category: 'brainstorm'
  },
  { 
    id: 'workflow-optimize', 
    text: 'How can I optimize my workflow?', 
    icon: '⚡',
    category: 'efficiency'
  },
  { 
    id: 'energy-boost', 
    text: 'I\'m feeling low energy, help me', 
    icon: '🔋',
    category: 'wellness'
  }
];

export const AIAssistantTab: React.FC<TabProps> = ({
  user,
  todayCard,
  refreshTrigger,
  onVoiceCommand,
  isProcessingVoice,
  lastThoughtDumpResult
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI productivity assistant. I can help you organize tasks, break down complex projects, process your thoughts, and optimize your workflow. What would you like to work on?',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showThoughtDumpModal, setShowThoughtDumpModal] = useState(false);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Process with voice command handler for thought dumps
    onVoiceCommand?.(content.trim());

    // Simulate AI response (in real implementation, this would call your AI service)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(content.trim()),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInputMessage('');
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('plan') || lowerMessage.includes('schedule')) {
      return 'I\'d be happy to help you plan! Based on your current tasks, I suggest focusing on your high-priority items first. Would you like me to organize your tasks using the Eisenhower Matrix?';
    } else if (lowerMessage.includes('task') || lowerMessage.includes('work')) {
      return 'Let me help you break that down into manageable steps. I\'ve processed your request and created some tasks for you. Check your task list to see the breakdown!';
    } else if (lowerMessage.includes('focus') || lowerMessage.includes('priority')) {
      return 'For maximum focus today, I recommend starting with your deep work sessions during your peak energy hours. Would you like me to analyze your current task priorities?';
    } else {
      return 'I understand what you\'re working on. I\'ve processed your thoughts and created actionable tasks from them. You can review and organize them in your task management system.';
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleVoiceInput = (command: string) => {
    sendMessage(command);
  };

  // Show thought dump results when available
  React.useEffect(() => {
    if (lastThoughtDumpResult && lastThoughtDumpResult.success) {
      setShowThoughtDumpModal(true);
    }
  }, [lastThoughtDumpResult]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-gray-700/50"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
            <p className="text-gray-400 text-sm">Your intelligent productivity companion</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>AI Powered</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-teal-400" />
            <span>{messages.length} messages</span>
          </div>
          {isProcessingVoice && (
            <div className="flex items-center space-x-2">
              <motion.div 
                className="h-2 w-2 bg-orange-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-orange-400">Processing...</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 border-b border-gray-700/50"
      >
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Prompts</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt(prompt.text)}
              className="justify-start text-left h-auto p-3 border-gray-600/50 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-xs"
            >
              <span className="mr-2 text-base">{prompt.icon}</span>
              <span className="text-gray-300">{prompt.text}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] p-3 rounded-2xl shadow-lg
              ${message.type === 'user' 
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white ml-12' 
                : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 mr-12'
              }
            `}>
              {message.type === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-cyan-400 font-medium">AI Assistant</span>
                </div>
              )}
              
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-xs opacity-70">
                  {formatTime(message.timestamp)}
                </span>
                {message.taskCount && (
                  <Badge size="sm" className="bg-green-500/20 text-green-300 border-green-500/40">
                    {message.taskCount} tasks created
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isProcessingVoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 rounded-2xl mr-12">
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="h-2 w-2 bg-cyan-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="h-2 w-2 bg-cyan-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="h-2 w-2 bg-cyan-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                />
                <span className="text-xs text-cyan-400">Processing your thoughts...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Ask me anything about productivity, tasks, or planning..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputMessage);
                }
              }}
              className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 resize-none pr-12"
              rows={2}
            />
            <Button
              size="sm"
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isProcessingVoice}
              className="absolute bottom-2 right-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Voice Input Button */}
          <div className="flex flex-col items-center">
            <MobileMicrophoneButton 
              onVoiceCommand={handleVoiceInput}
              disabled={isProcessingVoice}
              className="relative"
            />
            <span className="text-xs text-gray-500 mt-1">Voice</span>
          </div>
        </div>
        
        {/* Input hints */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
            💡 Tip: Try "I need to organize my thoughts about..."
          </Badge>
          <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
            🎯 Or: "Help me prioritize these tasks..."
          </Badge>
        </div>
      </div>

      {/* Thought Dump Results Modal */}
      {showThoughtDumpModal && lastThoughtDumpResult && (
        <ThoughtDumpResults
          result={lastThoughtDumpResult}
          onClose={() => setShowThoughtDumpModal(false)}
          onAddToSchedule={() => {
            setShowThoughtDumpModal(false);
            // Add success message to chat
            const successMessage: ChatMessage = {
              id: Date.now().toString(),
              type: 'assistant',
              content: `Great! I've processed your thoughts and created ${lastThoughtDumpResult.totalTasks} tasks for you. ${lastThoughtDumpResult.deepTasks.length} deep focus tasks and ${lastThoughtDumpResult.lightTasks.length} light tasks have been added to your schedule.`,
              timestamp: new Date(),
              taskCount: lastThoughtDumpResult.totalTasks
            };
            setMessages(prev => [...prev, successMessage]);
          }}
        />
      )}
    </div>
  );
};