import React from 'react';
import { voiceService } from '@/domains/lifelock/services';

export interface UseVoiceInputReturn {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  isProcessing: boolean;
  startRecording: () => Promise<string>;
  stopRecording: () => void;
  clearError: () => void;
}

/**
 * Enhanced voice input hook for real speech-to-text with stability improvements
 * Extracted from ai-prompt-box.tsx for reusability
 */
export const useVoiceInput = (): UseVoiceInputReturn => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const startRecording = React.useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!voiceService.isSpeechRecognitionSupported()) {
        const errorMsg = 'Speech recognition not supported in this browser';
        setError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      if (isProcessing) {
        console.warn('⚠️ [VOICE INPUT] Already processing voice input, ignoring duplicate request');
        return;
      }

      setIsRecording(true);
      setIsProcessing(true);
      setError(null);
      setTranscript('');

      let finalTranscript = '';
      let hasResolved = false;

      voiceService.startListening(
        (currentTranscript, isFinal) => {
          console.log('📝 [VOICE INPUT] Transcript update:', { 
            text: currentTranscript, 
            isFinal, 
            length: currentTranscript.length 
          });
          
          setTranscript(currentTranscript);
          
          if (isFinal && currentTranscript.trim() && !hasResolved) {
            hasResolved = true;
            finalTranscript = currentTranscript;
            setIsRecording(false);
            setIsProcessing(false);
            
            // Add delay to prevent multiple rapid submissions
            setTimeout(() => {
              resolve(finalTranscript);
            }, 200);
          }
        },
        (errorMsg) => {
          if (!hasResolved) {
            setError(errorMsg);
            setIsRecording(false);
            setIsProcessing(false);
            setTranscript('');
            reject(new Error(errorMsg));
          }
        },
        {
          language: 'en-US',
          continuous: false,
          interimResults: true
        }
      ).catch((err) => {
        if (!hasResolved) {
          setError(err.message);
          setIsRecording(false);
          setIsProcessing(false);
          reject(err);
        }
      });
    });
  }, [isProcessing]);

  const stopRecording = React.useCallback(() => {
    voiceService.stopListening();
    setIsRecording(false);
    setIsProcessing(false);
    setTranscript('');
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    isProcessing,
    clearError
  };
};