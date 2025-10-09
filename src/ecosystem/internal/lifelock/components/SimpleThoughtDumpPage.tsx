import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService } from '@/services/voiceService';
import { lifeLockVoiceTaskProcessor } from '@/services/lifeLockVoiceTaskProcessor';

interface SimpleThoughtDumpPageProps {
  onBack: () => void;
  onComplete?: (tasks: any) => void;
}

export const SimpleThoughtDumpPage: React.FC<SimpleThoughtDumpPageProps> = ({
  onBack,
  onComplete
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<any>(null);

  const handleStartListening = async () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);

      // Process the transcript
      if (transcript.trim()) {
        setIsProcessing(true);
        try {
          const result = await lifeLockVoiceTaskProcessor.processThoughtDump(transcript);
          setParsedTasks(result);
          setAiResponse(`Got it! I've organized ${result.totalTasks} tasks:\n• Deep Work: ${result.deepTasks.length}\n• Light Work: ${result.lightTasks.length}`);
        } catch (error) {
          setAiResponse('Sorry, I had trouble processing that. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      }
    } else {
      setTranscript('');
      setAiResponse('');
      setParsedTasks(null);

      try {
        await voiceService.startListening(
          (text, isFinal) => {
            setTranscript(text);
            if (isFinal) {
              console.log('Final transcript:', text);
            }
          },
          (error) => {
            console.error('Voice error:', error);
            setIsListening(false);
          },
          {
            language: 'en-US',
            continuous: true,
            interimResults: true
          }
        );
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  };

  const handleComplete = () => {
    if (onComplete && parsedTasks) {
      onComplete(parsedTasks);
    }
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Morning Routine
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">🧠 AI Thought Dump</h1>
          <p className="text-gray-400">
            Speak your thoughts - I'll organize them into your timebox
          </p>
        </motion.div>

        {/* Microphone Button */}
        <motion.button
          onClick={handleStartListening}
          disabled={isProcessing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-32 h-32 rounded-full mb-8 transition-all duration-300 ${
            isListening
              ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-orange-500/50'
          }`}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <MicOff className="h-12 w-12 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Mic className="h-12 w-12 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="text-center text-sm text-gray-400 mb-8">
          {isListening ? '🎤 Listening... (tap to stop)' : 'Tap to start speaking'}
        </div>

        {/* Real-Time Transcript - Always visible */}
        <div className="w-full mb-6">
          <Card className="bg-gray-800/50 border-blue-500/30 p-4 min-h-[120px]">
            <div className="text-blue-400 text-sm font-medium mb-2">📝 Real-Time Transcript:</div>
            <div className="text-white text-base leading-relaxed">
              {transcript || (
                <span className="text-gray-500 italic">
                  Your words will appear here as you speak...
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* AI Response - Always visible */}
        <div className="w-full mb-6">
          <Card className="bg-gray-800/50 border-green-500/30 p-4 min-h-[120px]">
            <div className="text-green-400 text-sm font-medium mb-2">🤖 AI Response:</div>
            <div className="text-white text-base leading-relaxed whitespace-pre-line">
              {aiResponse || (
                <span className="text-gray-500 italic">
                  AI will organize your tasks here...
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="text-yellow-400 text-sm animate-pulse">
            🧠 Processing your thoughts...
          </div>
        )}

        {/* Complete Button */}
        {parsedTasks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-6 text-lg"
            >
              ✓ Done - Add to Timebox
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
