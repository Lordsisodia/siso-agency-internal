import { useEffect, useState, useCallback, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AccessibilityPreferences {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersReducedTransparency: boolean;
  prefersLargeCursor: boolean;
  prefersNoAutoplay: boolean;
  colorScheme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
}

interface AccessibilityFeatures {
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  voiceControl: boolean;
  eyeTracking: boolean;
  switchControl: boolean;
  touchAccommodations: boolean;
  cognitiveSupport: boolean;
}

interface AccessibilityMetrics {
  focusTraversalTime: number[];
  interactionErrors: number;
  completionRate: number;
  timeToComplete: number;
  assistiveTechDetected: string[];
}

interface ExceptionalAccessibilityOptions {
  enableMetrics?: boolean;
  enableAdaptiveInterface?: boolean;
  enableCognitiveSupport?: boolean;
  onAccessibilityIssue?: (issue: { type: string; severity: 'low' | 'medium' | 'high'; description: string }) => void;
}

/**
 * Exceptional Accessibility Hook
 * 
 * Provides comprehensive accessibility features with adaptive interface adjustments,
 * assistive technology detection, and accessibility metrics tracking.
 */
export const useExceptionalAccessibility = (options: ExceptionalAccessibilityOptions = {}) => {
  const {
    enableMetrics = true,
    enableAdaptiveInterface = true,
    enableCognitiveSupport = true,
    onAccessibilityIssue
  } = options;

  const prefersReducedMotion = useReducedMotion();
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion,
    prefersHighContrast: false,
    prefersReducedTransparency: false,
    prefersLargeCursor: false,
    prefersNoAutoplay: false,
    colorScheme: 'auto',
    fontSize: 'medium',
    focusVisible: true
  });

  const [features, setFeatures] = useState<AccessibilityFeatures>({
    screenReaderSupport: false,
    keyboardNavigation: false,
    voiceControl: false,
    eyeTracking: false,
    switchControl: false,
    touchAccommodations: false,
    cognitiveSupport: enableCognitiveSupport
  });

  const [metrics, setMetrics] = useState<AccessibilityMetrics>({
    focusTraversalTime: [],
    interactionErrors: 0,
    completionRate: 0,
    timeToComplete: 0,
    assistiveTechDetected: []
  });

  const [announcements, setAnnouncements] = useState<string[]>([]);
  const lastFocusTime = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);
  const completedInteractions = useRef<number>(0);
  const totalInteractions = useRef<number>(0);

  // Detect user preferences from system settings
  const detectSystemPreferences = useCallback(() => {
    const mediaQueries = {
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)'),
      prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)'),
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)')
    };

    setPreferences(prev => ({
      ...prev,
      prefersReducedMotion: mediaQueries.prefersReducedMotion.matches,
      prefersHighContrast: mediaQueries.prefersHighContrast.matches,
      prefersReducedTransparency: mediaQueries.prefersReducedTransparency.matches,
      colorScheme: mediaQueries.colorScheme.matches ? 'dark' : 'light'
    }));

    // Listen for changes
    Object.entries(mediaQueries).forEach(([key, query]) => {
      query.addEventListener('change', detectSystemPreferences);
    });

    return () => {
      Object.entries(mediaQueries).forEach(([key, query]) => {
        query.removeEventListener('change', detectSystemPreferences);
      });
    };
  }, []);

  // Detect assistive technologies
  const detectAssistiveTech = useCallback(() => {
    const detected: string[] = [];

    // Screen reader detection
    if (navigator.userAgent.includes('NVDA') || 
        navigator.userAgent.includes('JAWS') || 
        navigator.userAgent.includes('VoiceOver') ||
        'speechSynthesis' in window) {
      detected.push('screen-reader');
      setFeatures(prev => ({ ...prev, screenReaderSupport: true }));
    }

    // Touch device detection
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      detected.push('touch-device');
      setFeatures(prev => ({ ...prev, touchAccommodations: true }));
    }

    // Voice control detection (experimental)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      detected.push('speech-recognition');
      setFeatures(prev => ({ ...prev, voiceControl: true }));
    }

    // Switch control detection (via keyboard patterns)
    const detectSwitchControl = () => {
      let switchPattern = 0;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          switchPattern++;
          if (switchPattern > 10) {
            detected.push('switch-control');
            setFeatures(prev => ({ ...prev, switchControl: true }));
            document.removeEventListener('keydown', handleKeyDown);
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
    };

    detectSwitchControl();

    setMetrics(prev => ({ ...prev, assistiveTechDetected: detected }));
  }, []);

  // Focus management and tracking
  const manageFocus = useCallback(() => {
    const focusTraversalTimes: number[] = [];

    const handleFocusIn = (e: FocusEvent) => {
      const now = performance.now();
      if (lastFocusTime.current > 0) {
        const traversalTime = now - lastFocusTime.current;
        focusTraversalTimes.push(traversalTime);
        
        // Keep only last 20 measurements
        if (focusTraversalTimes.length > 20) {
          focusTraversalTimes.shift();
        }

        // Alert if focus traversal is too slow (accessibility issue)
        if (traversalTime > 3000) {
          onAccessibilityIssue?.({
            type: 'slow_focus_traversal',
            severity: traversalTime > 5000 ? 'high' : 'medium',
            description: `Focus traversal took ${Math.round(traversalTime)}ms`
          });
        }
      }
      lastFocusTime.current = now;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      setFeatures(prev => ({ ...prev, keyboardNavigation: true }));
      
      // Track Tab navigation patterns
      if (e.key === 'Tab') {
        const now = performance.now();
        if (lastFocusTime.current > 0) {
          const traversalTime = now - lastFocusTime.current;
          focusTraversalTimes.push(traversalTime);
        }
        lastFocusTime.current = now;
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown);

    // Update metrics periodically
    const updateMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        focusTraversalTime: [...focusTraversalTimes]
      }));
    };

    const metricsInterval = setInterval(updateMetrics, 5000);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(metricsInterval);
    };
  }, [onAccessibilityIssue]);

  // ARIA live announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, `${priority}:${message}`]);
    
    // Clean up old announcements
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(ann => ann !== `${priority}:${message}`));
    }, 5000);
  }, []);

  // Interaction tracking for completion metrics
  const trackInteractionStart = useCallback(() => {
    interactionStartTime.current = performance.now();
    totalInteractions.current++;
  }, []);

  const trackInteractionComplete = useCallback((successful: boolean = true) => {
    if (successful) {
      completedInteractions.current++;
    } else {
      setMetrics(prev => ({ ...prev, interactionErrors: prev.interactionErrors + 1 }));
    }

    const completionTime = performance.now() - interactionStartTime.current;
    const completionRate = (completedInteractions.current / totalInteractions.current) * 100;

    setMetrics(prev => ({
      ...prev,
      completionRate,
      timeToComplete: completionTime
    }));

    // Alert on low completion rate
    if (completionRate < 80 && totalInteractions.current > 5) {
      onAccessibilityIssue?.({
        type: 'low_completion_rate',
        severity: completionRate < 60 ? 'high' : 'medium',
        description: `Completion rate: ${Math.round(completionRate)}%`
      });
    }
  }, [onAccessibilityIssue]);

  // Adaptive interface adjustments
  const getAdaptiveStyles = useCallback(() => {
    const styles: any = {};

    if (preferences.prefersHighContrast) {
      styles['--contrast-multiplier'] = '1.5';
      styles['--border-width'] = '2px';
    }

    if (preferences.prefersReducedTransparency) {
      styles['--backdrop-opacity'] = '1';
      styles['--glass-opacity'] = '0.95';
    }

    if (preferences.prefersLargeCursor) {
      styles.cursor = 'pointer';
      styles['--cursor-size'] = '24px';
    }

    const fontSizeMultipliers = {
      small: 0.875,
      medium: 1,
      large: 1.125,
      'extra-large': 1.25
    };
    styles['--font-size-multiplier'] = fontSizeMultipliers[preferences.fontSize];

    return styles;
  }, [preferences]);

  // Cognitive support features
  const getCognitiveSupport = useCallback(() => {
    if (!enableCognitiveSupport) return {};

    return {
      showProgressIndicators: true,
      showTimeRemaining: true,
      simplifyLanguage: true,
      reduceChoice: preferences.prefersReducedMotion,
      provideClearFeedback: true,
      allowUndoActions: true,
      showTooltips: true,
      highlightImportantActions: true
    };
  }, [enableCognitiveSupport, preferences.prefersReducedMotion]);

  // Initialize accessibility features
  useEffect(() => {
    const cleanup1 = detectSystemPreferences();
    detectAssistiveTech();
    const cleanup2 = manageFocus();

    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  }, [detectSystemPreferences, detectAssistiveTech, manageFocus]);

  // Public API
  return {
    // Current state
    preferences,
    features,
    metrics,
    announcements,

    // Adaptive interface
    adaptiveStyles: getAdaptiveStyles(),
    cognitiveSupport: getCognitiveSupport(),

    // Control functions
    updatePreferences: (updates: Partial<AccessibilityPreferences>) => 
      setPreferences(prev => ({ ...prev, ...updates })),
    
    announce,
    
    // Interaction tracking
    trackInteractionStart,
    trackInteractionComplete,
    
    // Utility functions
    isAccessibilityOptimized: () => {
      const criticalFeatures = [
        features.screenReaderSupport || features.keyboardNavigation,
        !preferences.prefersReducedMotion || preferences.prefersReducedMotion,
        metrics.completionRate > 90 || totalInteractions.current < 5
      ];
      return criticalFeatures.every(Boolean);
    },

    getAccessibilityScore: () => {
      let score = 100;
      
      if (metrics.interactionErrors > 5) score -= 20;
      if (metrics.completionRate < 90) score -= 15;
      if (metrics.focusTraversalTime.some(time => time > 3000)) score -= 10;
      if (!features.keyboardNavigation && !features.touchAccommodations) score -= 25;
      
      return Math.max(0, score);
    },

    // ARIA helpers
    createAriaLabel: (baseLabel: string, context?: string) => {
      const parts = [baseLabel];
      if (context) parts.push(context);
      if (preferences.prefersReducedMotion) parts.push('(reduced motion)');
      return parts.join(', ');
    },

    createAriaDescription: (description: string, actionHint?: string) => {
      const parts = [description];
      if (actionHint && features.keyboardNavigation) {
        parts.push(`Press Enter or Space to ${actionHint}`);
      }
      return parts.join('. ');
    },

    // Focus management
    requestFocus: (element: HTMLElement, options?: { preventScroll?: boolean }) => {
      element.focus(options);
      announce(`Focused on ${element.ariaLabel || element.textContent || 'element'}`);
    },

    // Error handling
    handleAccessibilityError: (error: Error, context: string) => {
      setMetrics(prev => ({ ...prev, interactionErrors: prev.interactionErrors + 1 }));
      announce(`Error: ${error.message}`, 'assertive');
      onAccessibilityIssue?.({
        type: 'interaction_error',
        severity: 'high',
        description: `${context}: ${error.message}`
      });
    }
  };
};

export default useExceptionalAccessibility;