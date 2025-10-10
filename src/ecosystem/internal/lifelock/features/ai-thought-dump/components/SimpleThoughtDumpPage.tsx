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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toolExecutor = useRef<MorningThoughtDumpToolExecutor | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      await chatMemoryService.initialize();

      if (internalUserId && selectedDate) {
        toolExecutor.current = new MorningThoughtDumpToolExecutor(internalUserId, selectedDate);
      } else {
        console.error('❌ Missing internalUserId or selectedDate:', { internalUserId, selectedDate });
      }

      setMessages([{ role: 'assistant', content: GREETING_MESSAGE, timestamp: new Date() }]);

      if (voiceService.isTTSSupported()) {
        setIsSpeaking(true);
        voiceService.speak(GREETING_MESSAGE, {}, () => {}, () => setIsSpeaking(false), () => setIsSpeaking(false));
      }
    };
    init();
  }, [internalUserId, selectedDate]);

  const getAIResponse = async (userMessage: string) => {
    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);

    try {
      // System prompt to guide conversation
      const systemPrompt = {
        role: 'system',
        content: MORNING_ROUTINE_SYSTEM_PROMPT
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
        setMessages(prev => [...prev, { role: 'assistant', content: finalMessage, timestamp: new Date() }]);

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
        setMessages(prev => [...prev, { role: 'assistant', content: aiMessage, timestamp: new Date() }]);

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
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      if (transcript.trim()) {
        await getAIResponse(transcript);
        setTranscript('');
      }
    } else {
      setTranscript(''); // Clear for new input
      try {
        await voiceService.startListening(
          (text, isFinal) => {
            // Always show the complete accumulated transcript
            setTranscript(text);
            
            // Log progress but DON'T auto-stop - let user control when to stop
            if (isFinal) {
              console.log('🎤 Sentence completed:', text);
              // Keep listening for more sentences!
            }
          },
          (error) => {
            if (!error.includes('no-speech')) {
              console.error('Voice error:', error);
              setIsListening(false);
            }
          },
          VOICE_CONFIG_DEFAULTS
        );
        setIsListening(true);
      } catch (error) {
        console.error('Failed:', error);
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
            <p className="text-xs text-gray-500">GPT-5 Nano</p>
          </div>
        </div>
        
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(m => m.role !== 'tool').map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100 border border-gray-700'
            }`}>
              <div className="text-sm leading-relaxed">{msg.content}</div>
              <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}

        {isListening && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl p-4 bg-blue-600/50 text-white border-2 border-blue-400 animate-pulse">
              <div className="text-sm">{transcript || 'Listening... speak now'}</div>
              <div className="text-xs mt-2 text-blue-200">🎤 Microphone Active</div>
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
            className={`${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'} h-12 px-6`}
          >
            {isListening ? <><MicOff className="h-5 w-5 mr-2" />Stop</> : <><Mic className="h-5 w-5 mr-2" />Speak</>}
          </Button>
          {messages.length > 2 && (
            <Button onClick={handleComplete} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-12">
              ✓ Done - Organize into Timebox
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
