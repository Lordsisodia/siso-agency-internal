import React, { useState, useEffect, useRef } from 'react';
// Removed framer-motion for performance optimization
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { grokTaskService } from '@/services/shared/task.service';
import { voiceService } from '@/services/voice';
import { aiTaskAgent } from '@/services/shared/task.service';
import { chatMemoryService } from '@/services/chatMemoryService';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Check, Play, Paperclip, Brain, ChevronUp } from 'lucide-react';

// Simple types to avoid import issues
interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'overdue' | 'due-today' | 'upcoming' | 'in-progress' | 'blocked' | 'not-started' | 'started' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  category: 'development' | 'design' | 'marketing' | 'client' | 'admin';
  tags?: string[];
  estimatedHours?: number;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AITaskChatProps {
  tasks: Task[];
  chatMessages: ChatMessage[];
  onTasksUpdate: (tasks: Task[]) => void;
  onChatUpdate: (messages: ChatMessage[]) => void;
  onTaskRefresh?: () => void;
}

export const AITaskChat: React.FC<AITaskChatProps> = ({
  tasks,
  chatMessages,
  onTasksUpdate,
  onChatUpdate,
  onTaskRefresh
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatMode, setChatMode] = useState<'agent' | 'chat'>('agent');
  const [selectedModel, setSelectedModel] = useState('grok');
  const [showModelMenu, setShowModelMenu] = useState(false);

  // Voice state - simplified
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isMemoryInitialized, setIsMemoryInitialized] = useState(false);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Initialize memory service and cleanup on unmount
  useEffect(() => {
    const initializeMemory = async () => {
      try {
        await chatMemoryService.initialize();
        setIsMemoryInitialized(true);
        console.log('✅ [AI TASK CHAT] Memory service initialized');
      } catch (error) {
        console.error('❌ [AI TASK CHAT] Failed to initialize memory:', error);
      }
    };

    initializeMemory();

    return () => {
      voiceService.cleanup();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Voice output handler
  const speakMessage = async (text: string) => {
    if (!voiceService.isTTSSupported()) return;

    console.log('🔊 [AI TASK] Manual voice playback requested');
    console.log('📝 [AI TASK] Text to speak:', text.substring(0, 50) + '...');

    try {
      setIsSpeaking(true);
      await voiceService.speak(
        text,
        { voice: 'Fritz-PlayAI', rate: 1, pitch: 1 },
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        (error) => {
          console.error('TTS Error:', error);
          setIsSpeaking(false);
        }
      );
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  // Enhanced voice input handler for PromptInputBox integration
  const handleVoiceInput = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!voiceService.isSpeechRecognitionSupported()) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      let finalTranscript = '';

      voiceService.startListening(
        (transcript, isFinal) => {
          if (isFinal) {
            finalTranscript = transcript;
            resolve(transcript);
          }
        },
        (error) => {
          reject(new Error(error));
        },
        {
          language: 'en-US',
          continuous: false,
          interimResults: true
        }
      ).catch(reject);
    });
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);

    console.log('🧠 [AI TASK] User Message Received');
    console.log('🔍 [AI TASK] Input:', message);
    console.log('🔍 [AI TASK] Message Analysis:', {
      length: message.length,
      wordCount: message.split(' ').length,
      hasQuestion: message.includes('?'),
      isCommand: message.toLowerCase().startsWith('create') || message.toLowerCase().startsWith('add'),
      containsKeywords: {
        task: message.toLowerCase().includes('task'),
        project: message.toLowerCase().includes('project'),
        deadline: message.toLowerCase().includes('deadline'),
        priority: message.toLowerCase().includes('priority')
      }
    });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    // Save to memory service
    if (isMemoryInitialized) {
      await chatMemoryService.saveMessage(userMessage);
    }

    onChatUpdate([...chatMessages, userMessage]);

    try {
      console.log('🎯 [AI TASK] Processing AI Response...');
      console.log('🔄 [AI TASK] Context Setup:', {
        currentMessages: chatMessages.length,
        voiceEnabled,
        hasTaskContext: !!tasks.find(t => t.id === message.split(' ')[0]),
        taskId: message.split(' ')[0]
      });

      // Use AI Task Agent for intelligent task processing
      console.log('🤖 [AI TASK] Using AI Task Agent for processing...');
      
      let aiResponse = '';
      let taskActionPerformed = false;
      
      try {
        // Check if this is a task-related command
        const lowerMessage = message.toLowerCase().trim();
        const isTaskCommand = lowerMessage.includes('delete') || 
                             lowerMessage.includes('create') || 
                             lowerMessage.includes('add') || 
                             lowerMessage.includes('complete') || 
                             lowerMessage.includes('status') ||
                             lowerMessage.includes('clear') ||
                             lowerMessage.includes('remove') ||
                             lowerMessage.includes('finish') ||
                             lowerMessage.includes('done') ||
                             lowerMessage.startsWith('show') ||
                             lowerMessage.includes('task') ||
                             lowerMessage.includes('how many');
        
        if (isTaskCommand) {
          console.log('🎯 [AI TASK] Task command detected, processing with AI Task Agent...');
          console.log('🔍 [AI TASK] Original message:', message);
          console.log('🔍 [AI TASK] Processed message:', lowerMessage);
          console.log('🔍 [AI TASK] Available task context:', tasks.length, 'tasks');
          
          // Create conversation context using memory service
          const conversationContext = isMemoryInitialized 
            ? chatMemoryService.getConversationContext(5) // Get last 5 user messages
            : chatMessages
                .filter(msg => msg.sender === 'user')
                .slice(-3) // Fallback to current chat messages
                .map(msg => msg.content);
          
          console.log('🧠 [AI TASK CHAT] Using conversation context:', conversationContext);
          
          const agentResponse = await aiTaskAgent.processInput(message, conversationContext);
          console.log('🤖 [AI TASK] Agent response received:', agentResponse);
          
          if (agentResponse.success) {
            aiResponse = `✅ **Task Action Completed**\n\n${agentResponse.message}`;
            taskActionPerformed = true;
            
            // If tasks were modified, trigger a refresh of the task list
            if (agentResponse.affectedCount && agentResponse.affectedCount > 0) {
              console.log('🔄 [AI TASK] Tasks modified, triggering refresh...');
              
              // Trigger task refresh to update the UI immediately
              if (onTaskRefresh) {
                // Invalidate React Query cache to force refresh
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['taskStats'] });
                console.log('🔄 [AI TASK] Query cache invalidated');
                
                // Immediate refresh since database write is now synchronous
                onTaskRefresh();
                console.log('✅ [AI TASK] Task refresh triggered');
                
                // Also trigger a delayed refresh to catch any delayed updates
                setTimeout(() => {
                  onTaskRefresh();
                  console.log('✅ [AI TASK] Secondary task refresh triggered');
                }, 1000);
              }
            }
          } else {
            aiResponse = `❌ **Task Action Failed**\n\n${agentResponse.message}`;
          }
          
          console.log('✅ [AI TASK] AI Task Agent response:', agentResponse);
        } else {
          // Fall back to conversational responses for non-task commands
          console.log('💬 [AI TASK] Non-task command, using conversational response...');
          
          if (message.toLowerCase().includes('help')) {
            aiResponse = `I'm here to help you manage your tasks efficiently! Here's what I can do:

🔹 **Task Creation**: "Create a new task for..." or "Add task..."
🔹 **Task Deletion**: "Delete all tasks" or "Clear all main tasks"
🔹 **Task Completion**: "Complete all tasks" or "Finish all daily tasks"
🔹 **Status Checking**: "Show task status" or "How many tasks do I have?"
🔹 **Voice Commands**: Use voice for hands-free operation

**Examples:**
• "Delete all high priority tasks"
• "Create a new development task for API integration"
• "Complete all daily tasks"
• "Show me task status"

What would you like me to help you with?`;
          } else if (message.toLowerCase().includes('status') || message.toLowerCase().includes('how many')) {
            // Use AI Task Agent for status even if not detected as command
            const conversationContext = chatMessages
              .filter(msg => msg.sender === 'user')
              .slice(-3)
              .map(msg => msg.content);
            
            const agentResponse = await aiTaskAgent.processInput('status', conversationContext);
            aiResponse = agentResponse.success ? agentResponse.message : 
              `Let me check your current task status...\n\n- Active tasks: ${tasks.filter(t => !t.completed).length}\n- Completed tasks: ${tasks.filter(t => t.completed).length}`;
          } else {
            const responses = [
              `I understand your request about "${message}". Let me help you with your task management needs.`,
              `Thanks for that input! I can help you create, manage, or organize tasks related to "${message}".`,
              `Interesting point about "${message}". Would you like me to create a task or help organize this into your workflow?`,
              `I see you mentioned "${message}". I can help you turn this into actionable tasks or provide status updates.`
            ];
            
            aiResponse = responses[Math.floor(Math.random() * responses.length)] + 
              `\n\n💡 **Quick Actions:**\n• Say "create task..." to add new tasks\n• Say "delete all tasks" to clear your list\n• Say "status" to see your task overview`;
          }
        }
      } catch (agentError) {
        console.error('❌ [AI TASK] AI Task Agent error:', agentError);
        aiResponse = `I encountered an issue processing your task request: ${agentError instanceof Error ? agentError.message : 'Unknown error'}. Please try again or rephrase your request.`;
      }

      console.log('📤 [AI TASK] Final AI Response:', aiResponse.substring(0, 100) + '...');
      console.log('🎭 [AI TASK] Response Characteristics:', {
        length: aiResponse.length,
        wordCount: aiResponse.split(' ').length,
        hasActionItems: aiResponse.includes('•') || aiResponse.includes('🔹'),
        tone: aiResponse.includes('!') ? 'enthusiastic' : 'professional'
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      // Save AI response to memory service
      if (isMemoryInitialized) {
        await chatMemoryService.saveMessage(aiMessage);
      }

      onChatUpdate([...chatMessages, userMessage, aiMessage]);

      // Voice response logic with detailed logging - DISABLED FOR VOICE INPUT ONLY MODE
      console.log('🔇 [AI TASK] Auto-voice response DISABLED - Voice input only mode');
      console.log('💬 [AI TASK] Response available for manual playback via message buttons');
      
      // Note: Automatic voice response removed per user preference
      // User can still play voice manually using the play button on each message
      /* REMOVED AUTO-VOICE RESPONSE
      if (voiceEnabled) {
        console.log('🔊 [AI TASK] Voice Response Enabled - Starting TTS');
        console.log('🎵 [AI TASK] TTS Config:', {
          textLength: aiResponse.length,
          voiceServiceReady: voiceService.isTTSSupported(),
          backgroundMode: false
        });
        
        try {
          await speakMessage(aiResponse);
          console.log('✅ [AI TASK] Voice response completed successfully');
        } catch (voiceError) {
          console.error('❌ [AI TASK] Voice response failed:', voiceError);
        }
      } else {
        console.log('🔇 [AI TASK] Voice response disabled by user');
      }
      */

    } catch (error) {
      console.error('❌ [AI TASK] Error processing message:', error);
      console.log('🔧 [AI TASK] Error Context:', {
        userInput: message,
        messagesCount: chatMessages.length,
        timestamp: new Date().toISOString()
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: 'I apologize, but I encountered an error processing your request. Please try again, and I\'ll do my best to help you.',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      // Save error message to memory service
      if (isMemoryInitialized) {
        await chatMemoryService.saveMessage(errorMessage);
      }
      
      onChatUpdate([...chatMessages, userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('🏁 [AI TASK] Message processing completed');
    }
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Group consecutive messages from the same sender
  const groupedMessages = chatMessages.reduce((groups: ChatMessage[][], message, index) => {
    const prevMessage = chatMessages[index - 1];
    if (prevMessage && prevMessage.sender === message.sender) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }
    return groups;
  }, []);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="h-full flex flex-col min-h-0" style={{ backgroundColor: '#252525' }}>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Remove grey bar header completely */}
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center mb-8">
              <div className="mx-auto mb-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                  alt="SISO" 
                  className="w-40 h-40 rounded-md object-cover" 
                />
              </div>
              
              <h2 className="text-4xl text-white mb-4 font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wide">
                TALK TO LEGACY
              </h2>
              
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                I can help you create tasks, analyze your workload, suggest priorities, and optimize your productivity.
              </p>
              
              
              {/* Enhanced Task Stats */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/30 rounded-xl text-sm font-semibold backdrop-blur-sm shadow-lg">
                  <span className="text-orange-200">{activeTasks.length}</span> Active
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 rounded-xl text-sm font-semibold backdrop-blur-sm shadow-lg">
                  <span className="text-green-200">{completedTasks.length}</span> Completed
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm font-semibold backdrop-blur-sm shadow-lg">
                  <span className="text-red-200">{tasks.filter(t => t.status === 'overdue').length}</span> Overdue
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            ref={chatContainerRef}
            className="flex-1 p-6 overflow-y-auto admin-scrollbar min-h-0"
          >
            <div className="space-y-6">
              {groupedMessages.map((messageGroup, groupIndex) => (
                  <div key={`group-${groupIndex}`} className={`flex ${messageGroup[0].sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-3 max-w-[85%] ${messageGroup[0].sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 mb-1">
                        {messageGroup[0].sender === 'user' ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-orange-500/30 shadow-lg">
                            <img 
                              src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                              alt="SISO" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
                            <img 
                              src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                              alt="SISO" 
                              className="w-5 h-5 rounded-md object-cover" 
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Message Group */}
                      <div className="space-y-2">
                        {messageGroup.map((message, messageIndex) => (
                          <div
                            key={message.id}
                            className="group relative"
                          >
                            <div className={`relative p-4 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl ${
                              message.sender === 'user' 
                                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/20' 
                                : 'bg-orange-500/20 text-gray-100 border border-orange-500/30 shadow-orange-500/10'
                            }`}>
                              <div className="flex items-start gap-3">
                                {message.sender === 'assistant' && (
                                  <img 
                                    src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                                    alt="SISO" 
                                    className="w-4 h-4 rounded-sm object-cover flex-shrink-0 mt-0.5" 
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm leading-relaxed whitespace-pre-line font-medium">
                                    {message.content}
                                  </p>
                                  <div className="flex items-center justify-between mt-3">
                                    <p className="text-xs opacity-70 font-medium">
                                      {message.timestamp.toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                    
                                    <div className="flex items-center gap-2">
                                      {/* Voice playback button for AI messages */}
                                      {message.sender === 'assistant' && voiceService.isTTSSupported() && (
                                        <button
                                          onClick={() => speakMessage(message.content)}
                                          disabled={isSpeaking}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-white/10 text-xs disabled:opacity-50"
                                          title="Play voice"
                                        >
                                          <Play className="w-3 h-3" />
                                        </button>
                                      )}
                                      
                                      {/* Copy button */}
                                      <button
                                        onClick={() => handleCopyMessage(message.id, message.content)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-white/10 text-xs"
                                        title="Copy message"
                                      >
                                        {copiedMessageId === message.id ? (
                                          <Check className="w-3 h-3" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              
              {/* Enhanced Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-3 max-w-[85%]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
                      <img 
                        src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                        alt="SISO" 
                        className="w-5 h-5 rounded-md object-cover animate-pulse" 
                      />
                    </div>
                    <div className="bg-orange-500/20 text-gray-100 p-4 rounded-2xl border border-orange-500/30 backdrop-blur-sm shadow-lg">
                      <div className="flex items-center gap-3">
                        <img 
                          src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                          alt="SISO" 
                          className="w-4 h-4 rounded-sm object-cover" 
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-300 font-medium">Thinking</span>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>
      
      {/* Clean Chat Input */}
      <div className="p-4" style={{ backgroundColor: '#252525' }}>
        {/* Background behind input box */}
        <div className="bg-gradient-to-r from-orange-600 to-yellow-400 rounded-3xl pt-2 px-2 pb-10 relative">
          <div className="relative z-10">
            <PromptInputBox 
              onSend={(message, files) => handleSendMessage(message)} 
              placeholder="Message Legacy..."
              isLoading={isLoading}
              className="bg-white border-gray-200 shadow-xl [&_.flex.items-center.gap-1]:hidden [&_.flex.items-center.gap-2]:justify-end [&_.flex.items-center.gap-2]:items-center"
            />
          </div>
          
          {/* Model selector and Agent/Chat mode toggle - left side */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
            {/* Model selector with drop up menu */}
            <div className="relative pointer-events-auto">
              <button 
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1"
              >
                {selectedModel}
                <ChevronUp className="h-3 w-3" />
              </button>
              
              {/* Drop up menu */}
              {showModelMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-32 z-50">
                  <div className="py-1">
                    {['grok', 'claude', 'gpt-4', 'gemini'].map((model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          selectedModel === model 
                            ? 'bg-orange-50 text-orange-600' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Agent/Chat mode toggle */}
            <div className="pointer-events-auto">
              <button 
                onClick={() => setChatMode(chatMode === 'agent' ? 'chat' : 'agent')}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full transition-colors"
              >
                {chatMode === 'agent' ? 'Agent' : 'Chat'}
              </button>
            </div>
          </div>
          
          {/* Action buttons with labels - bottom right of orange container */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
            <div className="pointer-events-auto">
              <button 
                className="flex items-center gap-1 text-white cursor-pointer px-2 py-1 rounded-full transition-colors hover:bg-white/20 text-xs"
                title="Attach files"
              >
                <Paperclip className="h-3 w-3" />
                <span>Files</span>
              </button>
            </div>
            <div className="pointer-events-auto">
              <button 
                className="flex items-center gap-1 text-white cursor-pointer px-2 py-1 rounded-full transition-colors hover:bg-white/20 text-xs"
                title="AI Assistant"
              >
                <Brain className="h-3 w-3" />
                <span>AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};