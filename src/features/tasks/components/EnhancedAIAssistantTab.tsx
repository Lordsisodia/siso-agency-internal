import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle2,
  Plus,
  MessageCircle,
  Timer,
  Settings,
  Archive,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { MobileMicrophoneButton } from '../ui/MobileMicrophoneButton';
import { ThoughtDumpResults } from "@/shared/components/ui";
import { useFeatureFlags } from '@/shared/utils/feature-flags';
import { EnhancedTabProps, ChatThread, ChatMessage, EnhancedChatMessage } from '@/shared/types/ai-chat.types';

// Preserve existing interface for backward compatibility
interface OriginalChatMessage {
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
    text: 'Let me dump my thoughts and create tasks', 
    icon: '🧠',
    category: 'processing'
  },
  { 
    id: 'time-block', 
    text: 'Help me time-block my schedule', 
    icon: '📅',
    category: 'scheduling'
  },
  { 
    id: 'energy-check', 
    text: 'Assess my energy and optimize my day', 
    icon: '⚡',
    category: 'optimization'
  }
];

// Chat Thread Management Component
const ChatThreadManager: React.FC<{
  threads: ChatThread[];
  activeThread: ChatThread | null;
  onThreadSelect: (thread: ChatThread) => void;
  onThreadCreate: (title: string, type: ChatThread['type']) => void;
  onThreadDelete: (threadId: string) => void;
}> = ({ threads, activeThread, onThreadSelect, onThreadCreate, onThreadDelete }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadType, setNewThreadType] = useState<ChatThread['type']>('general');

  const handleCreateThread = () => {
    if (newThreadTitle.trim()) {
      onThreadCreate(newThreadTitle.trim(), newThreadType);
      setNewThreadTitle('');
      setIsCreating(false);
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Chat Threads</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsCreating(!isCreating)}
          className="h-6 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          New
        </Button>
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 p-2 bg-gray-900/50 rounded border border-gray-600"
        >
          <input
            type="text"
            placeholder="Thread title..."
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            className="w-full mb-2 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateThread()}
          />
          <div className="flex items-center gap-2">
            <select
              value={newThreadType}
              onChange={(e) => setNewThreadType(e.target.value as ChatThread['type'])}
              className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
            >
              <option value="general">General</option>
              <option value="morning_routine">Morning Routine</option>
              <option value="task_planning">Task Planning</option>
              <option value="project_specific">Project Specific</option>
            </select>
            <Button size="sm" onClick={handleCreateThread} className="h-6 px-2 text-xs">
              Create
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-1 max-h-32 overflow-y-auto">
        {threads.map((thread) => (
          <motion.div
            key={thread.id}
            whileHover={{ scale: 1.02 }}
            className={`p-2 rounded cursor-pointer transition-colors ${
              activeThread?.id === thread.id
                ? 'bg-blue-600/30 border border-blue-500/50'
                : 'bg-gray-700/30 hover:bg-gray-600/30'
            }`}
            onClick={() => onThreadSelect(thread)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{thread.title}</div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {thread.type.replace('_', ' ')}
                  </Badge>
                  <span>{thread.messageCount} messages</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onThreadDelete(thread.id);
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Morning Routine Timer Component
const MorningRoutineTimer: React.FC<{
  duration: number; // in seconds
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  onCancel: () => void;
}> = ({ duration, isActive, onStart, onPause, onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [phase, setPhase] = useState<'planning' | 'priorities' | 'timeboxing'>('planning');

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhasePrompt = (phase: string) => {
    switch (phase) {
      case 'planning':
        return "Let's plan your day. What's on your mind?";
      case 'priorities':
        return "What are your top 3 priorities today?";
      case 'timeboxing':
        return "Let's schedule these tasks in your calendar.";
      default:
        return "Let's optimize your day together.";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4 p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-500/30"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-white">Morning Routine</span>
          <Badge variant="outline" className="text-xs px-1 py-0 text-orange-400 border-orange-500">
            {phase}
          </Badge>
        </div>
        <div className="text-lg font-mono text-orange-400">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="text-xs text-gray-300 mb-3">
        {getPhasePrompt(phase)}
      </div>

      <div className="flex items-center gap-2">
        {!isActive ? (
          <Button size="sm" onClick={onStart} className="text-xs">
            Start Routine
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onPause} className="text-xs">
            Pause
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onCancel} className="text-xs text-gray-400">
          Cancel
        </Button>
        
        {/* Phase indicators */}
        <div className="flex-1 flex justify-end gap-1">
          {['planning', 'priorities', 'timeboxing'].map((p) => (
            <div
              key={p}
              className={`w-2 h-2 rounded-full ${
                p === phase ? 'bg-orange-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced AI Assistant Tab Component
export const EnhancedAIAssistantTab: React.FC<EnhancedTabProps> = ({
  // Preserve all existing props
  user,
  selectedDate,
  todayCard,
  weekCards = [],
  refreshTrigger,
  onRefresh,
  onTaskToggle,
  onQuickAdd,
  onCustomTaskAdd,
  onVoiceCommand,
  onCardClick,
  onNavigateWeek,
  onOrganizeTasks,
  isProcessingVoice,
  isAnalyzingTasks = false,
  lastThoughtDumpResult,
  eisenhowerResult,
  showEisenhowerModal = false,
  onCloseEisenhowerModal,
  onApplyOrganization,
  onReanalyze,
  
  // New enhanced features (all optional)
  enablePersonalChatMode = false,
  enableChatThreads = false,
  enableConversationHistory = false,
  enableMorningRoutineTimer = false,
  enableAILearning = false,
  
  // New enhanced callbacks
  onThreadSelect,
  onThreadCreate,
  onMorningRoutineStart,
  onPersonalityUpdate,
}) => {
  const featureFlags = useFeatureFlags();
  
  // PRESERVE: All existing state and functionality
  const [messages, setMessages] = useState<OriginalChatMessage[]>([
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

  // NEW: Enhanced features state (only active when enabled)
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [morningRoutineTimer, setMorningRoutineTimer] = useState<{
    duration: number;
    isActive: boolean;
  } | null>(null);
  const [personalChatMode, setPersonalChatMode] = useState(false);

  // PRESERVE: All existing methods unchanged
  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: OriginalChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // PRESERVE: Process with voice command handler for thought dumps
    onVoiceCommand?.(content.trim());

    // PRESERVE: Simulate AI response (in real implementation, this would call your AI service)
    setTimeout(() => {
      const assistantMessage: OriginalChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(content.trim()),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInputMessage('');
  };

  // PRESERVE: Existing AI response generation
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

  // PRESERVE: Existing handlers
  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleVoiceInput = (command: string) => {
    sendMessage(command);
  };

  // PRESERVE: Show thought dump results when available
  useEffect(() => {
    if (lastThoughtDumpResult && lastThoughtDumpResult.success) {
      setShowThoughtDumpModal(true);
    }
  }, [lastThoughtDumpResult]);

  // NEW: Enhanced features handlers (only when enabled)
  const handleThreadSelect = (thread: ChatThread) => {
    setActiveThread(thread);
    onThreadSelect?.(thread.id);
    // Load thread messages here
  };

  const handleThreadCreate = (title: string, type: ChatThread['type']) => {
    const newThread: ChatThread = {
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      title,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessageAt: new Date(),
      messageCount: 0,
      isArchived: false,
    };
    
    setChatThreads(prev => [newThread, ...prev]);
    setActiveThread(newThread);
    onThreadCreate?.(title, type);
  };

  const handleThreadDelete = (threadId: string) => {
    setChatThreads(prev => prev.filter(t => t.id !== threadId));
    if (activeThread?.id === threadId) {
      setActiveThread(null);
    }
  };

  const handleMorningRoutineStart = () => {
    setMorningRoutineTimer({
      duration: 23 * 60, // 23 minutes in seconds
      isActive: true
    });
    onMorningRoutineStart?.();
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Determine which features to show based on flags
  const showChatThreads = (enableChatThreads || featureFlags.enableChatThreads) && !personalChatMode;
  const showMorningTimer = (enableMorningRoutineTimer || featureFlags.enableMorningRoutineTimer);
  const showPersonalMode = (enablePersonalChatMode || featureFlags.enablePersonalChatMode);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* NEW: Mode Toggle (only if personal mode is enabled) */}
      {showPersonalMode && (
        <div className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={!personalChatMode ? 'default' : 'outline'}
              onClick={() => setPersonalChatMode(false)}
              className="text-xs"
            >
              🎯 Task Mode
            </Button>
            <Button
              size="sm"
              variant={personalChatMode ? 'default' : 'outline'}
              onClick={() => setPersonalChatMode(true)}
              className="text-xs"
            >
              💬 Personal Chat
            </Button>
          </div>
        </div>
      )}

      {/* NEW: Chat Threads (only when enabled and not in personal mode) */}
      {showChatThreads && (
        <ChatThreadManager
          threads={chatThreads}
          activeThread={activeThread}
          onThreadSelect={handleThreadSelect}
          onThreadCreate={handleThreadCreate}
          onThreadDelete={handleThreadDelete}
        />
      )}

      {/* NEW: Morning Routine Timer (only when enabled) */}
      {showMorningTimer && morningRoutineTimer && (
        <MorningRoutineTimer
          duration={morningRoutineTimer.duration}
          isActive={morningRoutineTimer.isActive}
          onStart={() => setMorningRoutineTimer(prev => prev ? {...prev, isActive: true} : null)}
          onPause={() => setMorningRoutineTimer(prev => prev ? {...prev, isActive: false} : null)}
          onComplete={() => setMorningRoutineTimer(null)}
          onCancel={() => setMorningRoutineTimer(null)}
        />
      )}

      {/* PRESERVE: Original header and quick prompts - UNCHANGED */}
      <div className="text-center py-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Bot className="h-6 w-6 text-blue-400" />
          AI Assistant
          {activeThread && (
            <Badge variant="outline" className="text-xs">
              {activeThread.title}
            </Badge>
          )}
        </h2>
        <p className="text-gray-400">
          {selectedDate ? new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }).format(selectedDate) : 'AI Productivity Assistant'}
        </p>

        {/* NEW: Morning routine starter button */}
        {showMorningTimer && !morningRoutineTimer && (
          <Button
            size="sm"
            onClick={handleMorningRoutineStart}
            className="mt-2 text-xs bg-gradient-to-r from-orange-500 to-yellow-500"
          >
            <Timer className="h-3 w-3 mr-1" />
            Start 23-Min Morning Routine
          </Button>
        )}
      </div>

      {/* PRESERVE: Quick prompts section - UNCHANGED */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map((prompt) => (
            <motion.div
              key={prompt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(prompt.text)}
                className="h-auto py-3 px-3 bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-left justify-start"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{prompt.icon}</span>
                    <span className="text-xs font-medium">{prompt.category}</span>
                  </div>
                  <div className="text-xs text-gray-400">{prompt.text}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PRESERVE: Messages area - UNCHANGED */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-400" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.taskCount && (
                    <Badge variant="outline" className="mt-2 text-green-400 border-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {message.taskCount} tasks created
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* PRESERVE: Processing indicator */}
        {isProcessingVoice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-blue-400" />
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-400 animate-pulse" />
                <span className="text-sm text-gray-300">Processing your thoughts...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* PRESERVE: Input area - UNCHANGED */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Share your thoughts, ask for help, or describe what you're working on..."
            className="flex-1 min-h-[60px] bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputMessage);
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isProcessingVoice}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsListening(!isListening)}
              className={isListening ? "bg-red-500/20 border-red-500" : ""}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* PRESERVE: Mobile microphone button - UNCHANGED */}
      <MobileMicrophoneButton 
        onVoiceCommand={handleVoiceInput}
        disabled={isProcessingVoice}
      />

      {/* PRESERVE: Thought dump results modal - UNCHANGED */}
      {showThoughtDumpModal && lastThoughtDumpResult && (
        <ThoughtDumpResults
          result={lastThoughtDumpResult}
          onClose={() => setShowThoughtDumpModal(false)}
          onAddToSchedule={() => {
            setShowThoughtDumpModal(false);
            // Add any additional logic for adding to schedule
          }}
        />
      )}
    </div>
  );
};

// Export for backward compatibility
export const AIAssistantTab = EnhancedAIAssistantTab;