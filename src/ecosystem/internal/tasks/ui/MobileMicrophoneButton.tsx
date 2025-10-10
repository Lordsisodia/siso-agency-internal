import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService } from '@/services/voice';

interface MobileMicrophoneButtonProps {
  onVoiceCommand?: (command: string) => void;
  disabled?: boolean;
  className?: string;
}

export const MobileMicrophoneButton: React.FC<MobileMicrophoneButtonProps> = ({
  onVoiceCommand,
  disabled = false,
  className
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isListening) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    
    return () => clearInterval(interval);
  }, [isListening]);

  const handleVoiceToggle = async () => {
    if (disabled) return;
    
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      setTranscript('');
    } else {
      setError(null);
      
      try {
        await voiceService.startListening(
          (transcript, isFinal) => {
            setTranscript(transcript);
            
            if (isFinal && transcript.trim()) {
              onVoiceCommand?.(transcript);
              setTranscript('');
              setIsListening(false);
            }
          },
          (errorMsg) => {
            setError(errorMsg);
            setIsListening(false);
            setTranscript('');
          },
          {
            language: 'en-US',
            continuous: true, // Allow longer recordings
            interimResults: true,
            maxAlternatives: 1
          }
        );
        
        setIsListening(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Voice recognition failed');
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Mobile-only microphone button in bottom right */}
      <div className={cn(
        'fixed bottom-8 right-6 z-40 block sm:hidden',
        className
      )}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={cn(
              'relative h-14 w-14 rounded-full shadow-2xl transition-all duration-300 border-2',
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse border-red-300/50 shadow-red-500/50' 
                : disabled
                ? 'bg-gray-600 border-gray-500/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 border-orange-300/50 shadow-orange-500/50'
            )}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MicOff className="h-6 w-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mic className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Recording indicator */}
            {isListening && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-red-600 rounded-full animate-pulse" />
            )}
          </Button>
        </motion.div>
        
        {/* Recording duration */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white"
          >
            {formatDuration(recordingDuration)}
          </motion.div>
        )}
        
        {/* Transcript preview */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-lg px-4 py-2 max-w-[200px] text-xs text-white"
          >
            <div className="font-medium mb-1">Listening...</div>
            <div className="text-gray-300 line-clamp-3">{transcript}</div>
          </motion.div>
        )}
        
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-8 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-sm rounded-lg px-4 py-2 max-w-[200px] text-xs text-white"
          >
            {error}
          </motion.div>
        )}
      </div>
    </>
  );
};