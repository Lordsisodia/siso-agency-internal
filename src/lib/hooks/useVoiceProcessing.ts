/**
 * useVoiceProcessing Hook - Voice Command Handling
 * 
 * Extracted from useLifeLockData.ts (lines 158-169, ~12 lines)
 * Focused responsibility: Voice command processing and thought dumps
 * 
 * Benefits:
 * - Single responsibility: Only handles voice processing
 * - Better performance: Components not using voice won't re-render for voice state changes
 * - Easier testing: Voice logic can be tested independently
 * - Reusability: Voice processing can be used across different components
 */

import { useState, useCallback } from 'react';
import { lifeLockVoiceTaskProcessor, ThoughtDumpResult } from '@/domains/lifelock/_shared/services/lifeLockVoiceTaskProcessor';
import { instrumentLifeLockEvent } from '@/domains/lifelock/utils/lifeLockTelemetry';

export interface UseVoiceProcessingReturn {
  // Voice processing
  handleVoiceCommand: (command: string) => Promise<void>;
  
  // State
  isProcessingVoice: boolean;
  lastThoughtDumpResult: ThoughtDumpResult | null;
  
  // Actions
  clearThoughtDumpResult: () => void;
  
  // Error handling
  voiceError: string | null;
  clearVoiceError: () => void;
}

/**
 * Custom hook for voice command processing
 * Handles voice input processing and thought dump results
 */
export const useVoiceProcessing = (selectedDate: Date, onTaskChange?: () => void): UseVoiceProcessingReturn => {
  // State
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [lastThoughtDumpResult, setLastThoughtDumpResult] = useState<ThoughtDumpResult | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Clear voice error
  const clearVoiceError = useCallback(() => {
    setVoiceError(null);
  }, []);

  // Clear thought dump result
  const clearThoughtDumpResult = useCallback(() => {
    setLastThoughtDumpResult(null);
  }, []);

  // Handle voice command processing
  const handleVoiceCommand = useCallback(async (command: string) => {
    if (!command.trim()) {
      setVoiceError('Voice command cannot be empty');
      return;
    }

    setIsProcessingVoice(true);
    setVoiceError(null);

    try {
      console.log('🎤 Processing voice command:', command);
      
      const result = await instrumentLifeLockEvent(
        'voice_task_processor',
        () => lifeLockVoiceTaskProcessor.processVoiceInput(command, selectedDate),
        { commandLength: command.length }
      );
      
      setLastThoughtDumpResult(result);
      
      // Trigger refresh in parent component if tasks were added/modified
      if (result && (result.tasksAdded || result.tasksModified)) {
        onTaskChange?.();
      }
      
      console.log('✅ Voice command processed successfully');
    } catch (error) {
      console.error('❌ Voice processing failed:', error);
      setVoiceError(error instanceof Error ? error.message : 'Voice processing failed');
    } finally {
      setIsProcessingVoice(false);
    }
  }, [selectedDate, onTaskChange]);

  return {
    // Voice processing
    handleVoiceCommand,
    
    // State
    isProcessingVoice,
    lastThoughtDumpResult,
    
    // Actions
    clearThoughtDumpResult,
    
    // Error handling
    voiceError,
    clearVoiceError,
  };
};