import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, MicOff, Sparkles, Clock, User, Database, Loader2, CheckCircle2 } from 'lucide-react';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useTimeBlocks } from '@/lib/hooks/useTimeBlocks';
import { format } from 'date-fns';
import type { TimeBlock } from '@/services/api/timeblocksApi.offline';
import { VoiceService } from '@/services/voice/voice.service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

type ToolCallStatus = 'idle' | 'fetching_tasks' | 'creating_timeblocks' | 'syncing';

interface ToolCallState {
  status: ToolCallStatus;
  message: string;
  details?: string;
}

interface PlanningAssistantProps {
  selectedDate: Date;
  createTimeBlock: (data: Omit<any, 'userId' | 'date'>) => Promise<boolean>;
  timeBlocks: TimeBlock[];
}

export const PlanningAssistant: React.FC<PlanningAssistantProps> = ({
  selectedDate,
  createTimeBlock,
  timeBlocks
}) => {
  const { user } = useClerkUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolCallStatus, setToolCallStatus] = useState<ToolCallState>({ status: 'idle', message: '' });
  const [voiceService, setVoiceService] = useState<VoiceService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize voice service
  useEffect(() => {
    const vs = new VoiceService();
    setVoiceService(vs);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm here to help you plan your day for ${format(selectedDate, 'MMMM d')}. \n\nI can see you have ${timeBlocks.length} existing timeblocks.\n\nHow can I help you today? You can:\n• Tell me your available hours\n• Ask me to read your tasks\n• Tell me what to add to your schedule`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, timeBlocks.length, selectedDate, messages.length]);

  const handleVoiceInput = async () => {
    if (!voiceService) {
      console.error('Voice service not initialized');
      return;
    }

    if (isListening) {
      // Stop listening
      setIsListening(false);
      return;
    }

    // Check if speech recognition is supported
    if (!voiceService.isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    // Check microphone permissions
    const hasPermission = await voiceService.checkMicrophonePermissions();
    if (!hasPermission) {
      alert('Microphone permission is required for voice input. Please allow microphone access.');
      return;
    }

    setIsListening(true);

    // Start listening
    voiceService.startListening(
      (transcript) => {
        setInputValue(transcript);
        setIsListening(false);
      },
      (interim) => {
        setInputValue(interim);
      }
    );
  };

  const processUserMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Detect if we're running locally (development) or on Vercel (production)
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // Show fetching tasks status
      setToolCallStatus({
        status: 'fetching_tasks',
        message: '📊 Fetching your tasks...',
        details: 'Connecting to Supabase to get your pending tasks'
      });

      let result;

      if (isLocal) {
        // For local development, use local API server (runs on port 3001)
        const response = await fetch('http://localhost:3001/api/ai-planning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            context: {
              date: format(selectedDate, 'yyyy-MM-dd'),
              userId: user?.id,
              existingTimeblocks: timeBlocks.map(block => ({
                title: block.title,
                startTime: block.startTime,
                endTime: block.endTime,
                category: block.category,
              })),
              conversationHistory: messages.slice(-5).map(m => ({
                role: m.role,
                content: m.content,
              })),
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        result = await response.json();
      } else {
        // Call Vercel API route for production
        const response = await fetch('/api/ai-planning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            context: {
              date: format(selectedDate, 'yyyy-MM-dd'),
              userId: user?.id,
              existingTimeblocks: timeBlocks.map(block => ({
                title: block.title,
                startTime: block.startTime,
                endTime: block.endTime,
                category: block.category,
              })),
              conversationHistory: messages.slice(-5).map(m => ({
                role: m.role,
                content: m.content,
              })),
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        result = await response.json();
      }

      // Clear status - AI thinking phase
      setToolCallStatus({ status: 'idle', message: '' });

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If AI created timeblocks, show sync status and create them
      if (result.createdTimeblocks && result.createdTimeblocks.length > 0) {
        setToolCallStatus({
          status: 'syncing',
          message: `💾 Saving ${result.createdTimeblocks.length} timeblock${result.createdTimeblocks.length > 1 ? 's' : ''} to Supabase...`,
          details: result.createdTimeblocks.map((b: any) => `• ${b.title} (${b.startTime} - ${b.endTime})`).join('\n')
        });

        for (const block of result.createdTimeblocks) {
          await createTimeBlock({
            title: block.title,
            startTime: block.startTime,
            endTime: block.endTime,
            category: block.category as any,
            description: block.description,
          });
        }

        // Show success briefly before clearing
        setToolCallStatus({
          status: 'idle',
          message: `✅ Successfully saved ${result.createdTimeblocks.length} timeblock${result.createdTimeblocks.length > 1 ? 's' : ''}!`,
          details: result.createdTimeblocks.map((b: any) => `• ${b.title}`).join('\n')
        });

        setTimeout(() => {
          setToolCallStatus({ status: 'idle', message: '' });
        }, 3000);
      } else {
        setToolCallStatus({ status: 'idle', message: '' });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setToolCallStatus({ status: 'idle', message: '' });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I had trouble processing that. ${error instanceof Error ? error.message : 'Could you try again?'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processUserMessage(inputValue);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full shadow-2xl flex items-center justify-center text-white"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] sm:w-96 h-[600px] max-h-[70vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Planning Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        {message.isVoice && (
                          <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                            <Mic className="w-3 h-3" />
                            <span>Voice message</span>
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <User className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] opacity-50 mt-1">
                      {format(message.timestamp, 'h:mm a')}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">Thinking...</span>
                  </div>
                </motion.div>
              )}

              {/* Tool Call Status Indicator */}
              <AnimatePresence>
                {toolCallStatus.status !== 'idle' && toolCallStatus.message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                      toolCallStatus.status === 'syncing'
                        ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700/50'
                        : toolCallStatus.status === 'fetching_tasks'
                        ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-700/50'
                        : 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-700/50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {toolCallStatus.status === 'syncing' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Database className="w-4 h-4 text-green-400" />
                            </motion.div>
                          ) : toolCallStatus.status === 'fetching_tasks' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="w-4 h-4 text-blue-400" />
                            </motion.div>
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white mb-1">
                            {toolCallStatus.message}
                          </p>
                          {toolCallStatus.details && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="text-[10px] text-gray-300 whitespace-pre-line"
                            >
                              {toolCallStatus.details}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-700 p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type or speak your plan..."
                  className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                  disabled={isProcessing}
                />
                <button
                  onClick={handleVoiceInput}
                  disabled={isProcessing || !voiceService}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  } ${!voiceService ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => processUserMessage(inputValue)}
                  disabled={!inputValue.trim() || isProcessing}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 text-center">
                Tell me when you're free, what tasks to add, or ask me to read your schedule
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlanningAssistant;
