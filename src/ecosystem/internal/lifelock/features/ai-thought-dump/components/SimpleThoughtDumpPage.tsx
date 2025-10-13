import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { voiceService } from '@/services/voice';
import { lifeLockVoiceTaskProcessor } from '../services/ai/taskProcessor.service';
import { gpt5NanoService } from '../services/ai/gpt5Nano.service';
import { ALL_MORNING_AI_TOOLS, MorningThoughtDumpToolExecutor } from '../services/tools';
import { chatMemoryService } from '../services/ai/conversationManager.service';
import { GREETING_MESSAGE, MORNING_ROUTINE_SYSTEM_PROMPT, ERROR_MESSAGE, DEFAULT_AI_CONFIG } from '../config/prompts';
import { VOICE_CONFIG_DEFAULTS } from '../config/constants';
import type { Message } from '../types';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';

interface SimpleThoughtDumpPageProps {
  selectedDate: Date;
  onBack: () => void;
  onComplete?: (tasks: any) => void;
}

// Message type now imported from ../types

export const SimpleThoughtDumpPage: React.FC<SimpleThoughtDumpPageProps> = ({
  selectedDate,
  onBack,
  onComplete
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false); // NEW: Whisper is processing audio
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // Audio quality indicator (0-5)
  const [conversationState, setConversationState] = useState<'greeting' | 'energy_check' | 'deadline_check' | 'gathering' | 'prioritizing' | 'scheduling' | 'reviewing'>('greeting');
  const [showCommandHints, setShowCommandHints] = useState(true); // Command hints pill
  const [userEnergy, setUserEnergy] = useState<number | null>(null); // Track user's energy level
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toolExecutor = useRef<MorningThoughtDumpToolExecutor | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      // Same pattern as MorningRoutineSection - early return if no user ID
      if (!internalUserId || !selectedDate) return;

      await chatMemoryService.initialize();
      toolExecutor.current = new MorningThoughtDumpToolExecutor(internalUserId, selectedDate);

      // Set initial greeting message only once (text only - no autoplay)
      if (messages.length === 0) {
        setMessages([{ role: 'assistant', content: GREETING_MESSAGE, timestamp: new Date() }]);
        // Don't autoplay audio - browsers block it without user interaction
      }
    };
    init();
  }, [internalUserId, selectedDate, messages.length]);

  const getAIResponse = async (userMessage: string) => {
    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);

    // Stop any currently playing TTS before processing new message
    if (isSpeaking) {
      console.log('🛑 [AI RESPONSE] Stopping previous TTS before new response');
      voiceService.stopTTS();
      setIsSpeaking(false);
    }

    try {
      // ===== AMBIENT CONTEXT AWARENESS =====
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      const peakFocusTime = hour >= 9 && hour <= 11;
      const postLunchSlump = hour >= 13 && hour <= 14;
      const endOfDay = hour >= 17;

      const ambientContext = `\n\nCurrent context:
- Time: ${hour}:00 (${timeOfDay})
- Day: ${dayNames[day]}
- Peak focus window: ${peakFocusTime ? 'YES - optimal for deep work!' : 'No'}
- Post-lunch energy dip: ${postLunchSlump ? 'YES - schedule lighter tasks' : 'No'}
- End of day: ${endOfDay ? 'YES - wrap-up mode' : 'No'}

Productivity patterns to reference:
- Monday mornings: Usually high energy, great for tackling hard tasks
- Tuesday-Thursday: Peak productivity days, consistent focus
- Friday afternoons: Lower energy, better for light work and wrap-up
- Mornings (9-11am): Best focus time for deep work
- Early mornings (before 10am): Peak cognitive performance
- Post-lunch (1-2pm): Energy dip, avoid scheduling complex tasks
- Evenings (after 5pm): Wind-down time, light tasks only

Use this context to make smart suggestions.
Example: "It's Monday morning - perfect time for that complex task!"`;

      // ===== AI MEMORY ACROSS DAYS =====
      let historicalContext = '';
      if (internalUserId) {
        const recentConversations = await chatMemoryService.getRecentConversations(internalUserId, 7);
        if (recentConversations.length > 0) {
          historicalContext = `\n\nRecent conversation history (last 7 days):\n${recentConversations.map((conv, i) => `${i + 1}. ${conv}`).join('\n')}\n\nUse this context to personalize responses and remember user preferences.`;
          console.log('🧠 [AI MEMORY] Loaded context from', recentConversations.length, 'past conversations');
        }
      }

      console.log('🌍 [CONTEXT] Time:', timeOfDay, '| Day:', dayNames[day], '| Peak focus:', peakFocusTime);
      console.log('📊 [STATE] Conversation state:', conversationState);

      // ===== CONVERSATION STATE CONTEXT =====
      const stateContext = `\n\nCurrent conversation state: ${conversationState}
State-specific guidance:
- greeting: Friendly welcome, ask about energy
- energy_check: Waiting for energy rating, call save_energy_level()
- deadline_check: Call check_upcoming_deadlines() if not done yet
- gathering: Collect tasks, ask "What else?"
- prioritizing: Ask about importance/urgency
- scheduling: Add tasks to timebox
- reviewing: Confirm plan, ask "Sound good?"

Progress to next state naturally based on conversation.`;

      // System prompt to guide conversation
      const systemPrompt = {
        role: 'system',
        content: MORNING_ROUTINE_SYSTEM_PROMPT + ambientContext + historicalContext + stateContext
      };

      const gptMessages = [systemPrompt];

      gptMessages.push(...messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.tool_call_id && { tool_call_id: m.tool_call_id, name: m.name })
      })));

      gptMessages.push({ role: 'user', content: userMessage });

      const response = await gpt5NanoService.chat({
        messages: gptMessages,
        tools: ALL_MORNING_AI_TOOLS,
        ...DEFAULT_AI_CONFIG
      });

      const assistantMessage = response.choices[0]?.message;

      if (assistantMessage.tool_calls?.length > 0) {
        console.log('🤖 [AI] Calling tools:', assistantMessage.tool_calls.map(tc => tc.function.name));

        const toolResults = await Promise.all(
          assistantMessage.tool_calls.map(async (toolCall) => {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await toolExecutor.current?.executeTool(toolCall.function.name, args);

            // Track energy level when saved
            if (toolCall.function.name === 'save_energy_level' && result.success) {
              setUserEnergy(result.energyLevel);
              console.log('⚡ [ENERGY] Saved:', result.energyLevel, '/10');
            }

            return {
              role: 'tool' as const,
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify(result)
            };
          })
        );

        const finalResponse = await gpt5NanoService.chat({
          messages: [
            ...gptMessages,
            { role: 'assistant', content: assistantMessage.content || '', tool_calls: assistantMessage.tool_calls },
            ...toolResults
          ],
          ...DEFAULT_AI_CONFIG
        });

        const finalMessage = finalResponse.choices[0]?.message?.content || "I understand. What else?";
        const toolNames = assistantMessage.tool_calls?.map(tc => tc.function.name) || [];

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: finalMessage,
          timestamp: new Date(),
          toolCalls: toolNames.length > 0 ? toolNames : undefined
        }]);

        // ===== CONVERSATION STATE TRANSITIONS =====
        // Move between states based on tool calls and conversation progress

        if (conversationState === 'greeting' && messages.length >= 1) {
          setConversationState('energy_check');
          console.log('📊 [STATE] Transition: greeting → energy_check');
        } else if (conversationState === 'energy_check' && toolNames.includes('save_energy_level')) {
          setConversationState('deadline_check');
          console.log('📊 [STATE] Transition: energy_check → deadline_check');
        } else if (conversationState === 'deadline_check' && toolNames.includes('check_upcoming_deadlines')) {
          setConversationState('gathering');
          console.log('📊 [STATE] Transition: deadline_check → gathering');
        } else if (conversationState === 'gathering' && toolNames.includes('get_todays_tasks')) {
          setConversationState('prioritizing');
          console.log('📊 [STATE] Transition: gathering → prioritizing');
        } else if (conversationState === 'prioritizing' && messages.length >= 4) {
          setConversationState('scheduling');
          console.log('📊 [STATE] Transition: prioritizing → scheduling');
        } else if (conversationState === 'scheduling' && toolNames.includes('schedule_task_to_timebox')) {
          setConversationState('reviewing');
          console.log('📊 [STATE] Transition: scheduling → reviewing');
        }

        // Stop any previous TTS before starting new one (prevent simultaneous playback)
        voiceService.stopTTS();

        if (voiceService.isTTSSupported()) {
          setIsSpeaking(true);
          await voiceService.speak(finalMessage, {}, () => {}, () => setIsSpeaking(false), () => setIsSpeaking(false));
        }

        await chatMemoryService.saveMessage({
          id: Date.now().toString(),
          content: userMessage,
          sender: 'user',
          timestamp: new Date()
        });
        await chatMemoryService.saveMessage({
          id: (Date.now() + 1).toString(),
          content: finalMessage,
          sender: 'assistant',
          timestamp: new Date()
        });

      } else {
        const aiMessage = assistantMessage.content || "I understand. What else?";
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: aiMessage,
          timestamp: new Date(),
          toolCalls: undefined
        }]);

        // Stop any previous TTS before starting new one
        voiceService.stopTTS();

        if (voiceService.isTTSSupported()) {
          setIsSpeaking(true);
          await voiceService.speak(aiMessage, {}, () => {}, () => setIsSpeaking(false), () => setIsSpeaking(false));
        }
      }

    } catch (error) {
      console.error('❌ [AI] Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: ERROR_MESSAGE,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicToggle = async () => {
    console.log('🎤 [UI] handleMicToggle called, current isListening:', isListening);

    if (isListening) {
      // Stop continuous listening
      console.log('🛑 [UI] User clicked stop - stopping listening');
      voiceService.stopListening();
      setIsListening(false);
      setTranscript('');
    } else {
      // Start continuous real-time transcription
      console.log('▶️ [UI] User clicked start - starting listening');
      setTranscript('');
      setIsTranscribing(false);

      try {
        await voiceService.startListening(
          (text, isFinal) => {
            // Real-time: Show words as they appear (interim results)
            console.log(`📝 [UI UPDATE] ${isFinal ? 'FINAL' : 'interim'} transcript:`, text);

            // VOICE INTERRUPTION: If user starts speaking while AI is talking, stop AI!
            if (!isFinal && text.trim() && isSpeaking) {
              console.log('🛑 [INTERRUPTION] User speaking - stopping AI voice');
              voiceService.stopTTS();
              setIsSpeaking(false);
            }

            // Audio quality indicator - estimate level from transcript activity
            if (!isFinal && text.trim()) {
              // Interim results = actively speaking, show high audio
              const wordCount = text.split(' ').length;
              const level = Math.min(5, Math.max(1, Math.ceil(wordCount / 3)));
              setAudioLevel(level);
            }

            setTranscript(text);

            // When sentence is finalized, send to AI and keep listening
            if (isFinal && text.trim()) {
              console.log('🎤 [CONVERSATION] Sentence finalized:', text);

              // ===== BACKCHANNELING FILTER =====
              const FILLER_WORDS = ['um', 'uh', 'yeah', 'okay', 'hmm', 'uh-huh', 'mm-hmm', 'mhmm'];
              const cleanText = text.trim().toLowerCase();

              // Filter pure filler words
              if (FILLER_WORDS.includes(cleanText)) {
                console.log('🗑️ [FILTER] Ignored filler word:', text);
                setTranscript('');
                return;
              }

              // ===== QUICK COMMANDS =====
              const cmd = cleanText;

              // Start over
              if (cmd.includes('start over') || cmd.includes('restart')) {
                setMessages([{ role: 'assistant', content: GREETING_MESSAGE, timestamp: new Date() }]);
                voiceService.speak("Starting fresh! What's on your mind?");
                setTranscript('');
                return;
              }

              // Never mind / Cancel
              if (cmd.includes('never mind') || cmd.includes('forget it') || cmd.includes('cancel')) {
                voiceService.stopTTS();
                voiceService.speak("Okay, moving on.");
                setTranscript('');
                return;
              }

              // Repeat last message
              if (cmd.includes('repeat') || cmd.includes('say that again')) {
                const lastAI = messages.filter(m => m.role === 'assistant').pop();
                if (lastAI) {
                  voiceService.speak(lastAI.content);
                }
                setTranscript('');
                return;
              }

              // Stop talking
              if (cmd.includes('stop talking') || cmd === 'stop' || cmd === 'quiet' || cmd === 'shh') {
                voiceService.stopTTS();
                setIsSpeaking(false);
                setTranscript('');
                return;
              }

              // Done / Finish
              if (cmd.includes('done') || cmd.includes('finish') || cmd.includes("that's all") || cmd.includes('thats all')) {
                voiceService.speak("Great! Organizing your tasks now.");
                setTimeout(() => handleComplete(), 2000);
                setTranscript('');
                return;
              }

              // ===== PROCESS WITH AI =====
              getAIResponse(text);

              // Clear transcript for next sentence (but keep listening!)
              setTimeout(() => setTranscript(''), 100); // Small delay so user sees final text
            }
          },
          (error) => {
            if (!error.includes('no-speech')) {
              console.error('Voice error:', error);
              setIsListening(false);
              setTranscript('');
            }
          },
          VOICE_CONFIG_DEFAULTS
        );
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start listening:', error);
        setIsListening(false);
      }
    }
  };

  const handleComplete = async () => {
    const fullTranscript = messages.filter(m => m.role === 'user').map(m => m.content).join('. ');
    if (fullTranscript.trim()) {
      const result = await lifeLockVoiceTaskProcessor.processThoughtDump(fullTranscript);
      if (onComplete) onComplete(result);
    }
    // Clear session storage before closing
    sessionStorage.removeItem('thoughtDumpOpen');
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Cleaner Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
        <Button
          variant="ghost"
          onClick={() => {
            sessionStorage.removeItem('thoughtDumpOpen');
            onBack();
          }}
          className="text-gray-400 hover:text-white hover:bg-white/5 -ml-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h1 className="text-base font-semibold text-white">AI Thought Dump</h1>
            <p className="text-xs text-gray-500">
              {conversationState === 'greeting' && 'Starting...'}
              {conversationState === 'energy_check' && 'Energy Check'}
              {conversationState === 'deadline_check' && 'Checking Deadlines'}
              {conversationState === 'gathering' && 'Gathering Tasks'}
              {conversationState === 'prioritizing' && 'Prioritizing'}
              {conversationState === 'scheduling' && 'Scheduling'}
              {conversationState === 'reviewing' && 'Reviewing Plan'}
            </p>
          </div>
        </div>

        <div className="w-10"></div>
      </div>

      {/* Progress Bar - Conversation Flow */}
      <div className="px-4 py-3 bg-black/60 border-b border-gray-800/30">
        <div className="flex items-center justify-center gap-2 text-xs">
          <div className={cn(
            "px-3 py-1.5 rounded-full transition-all",
            ['greeting', 'energy_check'].includes(conversationState)
              ? "bg-green-600 text-white font-medium"
              : "bg-gray-800 text-gray-500"
          )}>
            ⚡ Energy
          </div>
          <div className={cn("h-0.5 w-6", conversationState === 'energy_check' || conversationState === 'deadline_check' || conversationState === 'gathering' || conversationState === 'prioritizing' || conversationState === 'scheduling' || conversationState === 'reviewing' ? "bg-green-600" : "bg-gray-700")} />
          <div className={cn(
            "px-3 py-1.5 rounded-full transition-all",
            ['deadline_check', 'gathering'].includes(conversationState)
              ? "bg-green-600 text-white font-medium"
              : "bg-gray-800 text-gray-500"
          )}>
            📝 Tasks
          </div>
          <div className={cn("h-0.5 w-6", conversationState === 'prioritizing' || conversationState === 'scheduling' || conversationState === 'reviewing' ? "bg-green-600" : "bg-gray-700")} />
          <div className={cn(
            "px-3 py-1.5 rounded-full transition-all",
            ['scheduling'].includes(conversationState)
              ? "bg-green-600 text-white font-medium"
              : "bg-gray-800 text-gray-500"
          )}>
            📅 Schedule
          </div>
          <div className={cn("h-0.5 w-6", conversationState === 'reviewing' ? "bg-green-600" : "bg-gray-700")} />
          <div className={cn(
            "px-3 py-1.5 rounded-full transition-all",
            conversationState === 'reviewing'
              ? "bg-green-600 text-white font-medium"
              : "bg-gray-800 text-gray-500"
          )}>
            ✅ Review
          </div>
        </div>

        {/* Context Badges - Show current state */}
        <div className="flex items-center justify-center gap-2 mt-2 pb-2">
          {userEnergy !== null && (
            <span className="px-2 py-1 bg-green-900/50 border border-green-700/50 rounded-full text-green-300 text-xs font-medium">
              ⚡ {userEnergy}/10
            </span>
          )}
          <span className="px-2 py-1 bg-blue-900/50 border border-blue-700/50 rounded-full text-blue-300 text-xs">
            🕐 {new Date().toLocaleTimeString([], { hour: 'numeric', hour12: true })}
          </span>
          <span className="px-2 py-1 bg-orange-900/50 border border-orange-700/50 rounded-full text-orange-300 text-xs">
            📅 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]}
          </span>
          {new Date().getHours() >= 9 && new Date().getHours() <= 11 && (
            <span className="px-2 py-1 bg-purple-900/50 border border-purple-700/50 rounded-full text-purple-300 text-xs animate-pulse">
              🎯 Peak Focus
            </span>
          )}
        </div>
      </div>

      {/* Command Hints Pill - Dismissible */}
      {showCommandHints && messages.length < 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-20 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700/70 rounded-xl p-3 text-xs max-w-xs shadow-2xl z-10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-300 flex items-center gap-1">
              💬 Voice Commands
            </span>
            <button
              onClick={() => setShowCommandHints(false)}
              className="text-gray-500 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="space-y-1.5 text-gray-400">
            <div>"<span className="text-blue-400 font-medium">Start over</span>" - Reset conversation</div>
            <div>"<span className="text-blue-400 font-medium">Never mind</span>" - Cancel action</div>
            <div>"<span className="text-blue-400 font-medium">Repeat that</span>" - Re-hear message</div>
            <div>"<span className="text-blue-400 font-medium">Stop talking</span>" - Silence AI</div>
            <div>"<span className="text-blue-400 font-medium">I'm done</span>" - Finish planning</div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700/50 text-gray-500 text-[10px]">
            Tip: Just talk naturally - AI understands context
          </div>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(m => m.role !== 'tool').map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar - AI */}
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                🤖
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100 border border-gray-700'
            }`}>
              <div className="text-sm leading-relaxed">{msg.content}</div>

              {/* Tool Call Indicators - Show which database queries AI made */}
              {msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2 pt-2 border-t border-gray-700/30">
                  {msg.toolCalls.map((toolName, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 bg-purple-900/40 border border-purple-700/40 rounded-full text-purple-300"
                    >
                      🔧 {toolName.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Avatar - User */}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </motion.div>
        ))}

        {isListening && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl p-4 bg-blue-600/50 text-white border-2 border-blue-400 animate-pulse">
              {/* Audio Quality Indicator */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 rounded-full transition-all duration-200",
                        audioLevel > i ? "h-4 bg-blue-300" : "h-2 bg-blue-800/50"
                      )}
                    />
                  ))}
                </div>
                {audioLevel < 2 && transcript && (
                  <span className="text-xs text-yellow-300">🔉 Speak louder</span>
                )}
              </div>

              <div className="text-sm font-semibold">{transcript || '🎤 Listening... speak naturally'}</div>
              <div className="text-xs mt-2 text-blue-200">Words appear as you speak • Pause to send</div>
              <div className="text-xs mt-1 text-blue-200/70">Using Deepgram real-time AI</div>
            </div>
          </motion.div>
        )}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400 ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="flex justify-start">
            <div className="bg-green-900/30 border border-green-600/50 rounded-2xl px-4 py-2">
              <span className="text-sm text-green-400">🔊 AI is speaking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800/50 bg-black/80 backdrop-blur-md p-4 pb-20 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            onClick={handleMicToggle}
            disabled={isProcessing || isSpeaking}
            className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'} h-12 px-6`}
          >
            {isListening ? <><MicOff className="h-5 w-5 mr-2" />End Conversation</> : <><Mic className="h-5 w-5 mr-2" />Start Talking</>}
          </Button>
          {messages.length > 2 && (
            <Button onClick={handleComplete} disabled={isTranscribing} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-12">
              ✓ Done - Organize into Timebox
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
