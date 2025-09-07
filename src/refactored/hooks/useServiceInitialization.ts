/**
 * useServiceInitialization Hook - Service Setup & Initialization
 * 
 * Extracted from useLifeLockData.ts (lines 35-46, ~12 lines)
 * Focused responsibility: Service initialization and setup
 * 
 * Benefits:
 * - Single responsibility: Only handles service initialization
 * - Better performance: Initialization happens once, doesn't cause re-renders
 * - Easier testing: Service setup can be tested independently
 * - Reusability: Service initialization can be shared across components
 */

import { useEffect, useState } from 'react';
import { ClerkHybridTaskService } from '@/core/auth.service';

export interface UseServiceInitializationReturn {
  // Initialization state
  isInitializing: boolean;
  isInitialized: boolean;
  initializationError: string | null;
  
  // Retry functionality
  retryInitialization: () => Promise<void>;
}

/**
 * Custom hook for service initialization
 * Handles Clerk hybrid service and other service setup
 */
export const useServiceInitialization = (): UseServiceInitializationReturn => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Initialize services
  const initializeServices = async () => {
    setIsInitializing(true);
    setInitializationError(null);
    
    try {
      console.log('🔧 Initializing services...');
      
      await ClerkHybridTaskService.initialize();
      
      setIsInitialized(true);
      console.log('✅ [APP] Hybrid service initialized');
    } catch (error) {
      console.error('❌ [APP] Hybrid service initialization failed:', error);
      setInitializationError(error instanceof Error ? error.message : 'Service initialization failed');
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeServices();
  }, []);

  // Retry initialization function
  const retryInitialization = async () => {
    await initializeServices();
  };

  return {
    // Initialization state
    isInitializing,
    isInitialized,
    initializationError,
    
    // Retry functionality
    retryInitialization,
  };
};