import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

interface PerformanceMetrics {
  animationFrames: number;
  droppedFrames: number;
  averageFPS: number;
  memoryUsage?: number;
  interactionLatency: number[];
  renderTime: number[];
  componentMountTime: number;
}

interface PerformanceThresholds {
  minFPS: number;
  maxDroppedFrames: number;
  maxInteractionLatency: number;
  maxMemoryUsageMB: number;
}

interface ExceptionalPerformanceOptions {
  enableMemoryMonitoring?: boolean;
  enableFPSMonitoring?: boolean;
  enableInteractionTracking?: boolean;
  reportingInterval?: number;
  thresholds?: Partial<PerformanceThresholds>;
  onPerformanceIssue?: (issue: { type: string; severity: 'low' | 'medium' | 'high'; metrics: Partial<PerformanceMetrics> }) => void;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFPS: 30,
  maxDroppedFrames: 5,
  maxInteractionLatency: 100, // ms
  maxMemoryUsageMB: 50
};

/**
 * Exceptional Performance Monitor Hook
 * 
 * Provides real-time performance monitoring for exceptional UX components
 * with automatic degradation strategies when performance issues are detected.
 */
export const useExceptionalPerformanceMonitor = (options: ExceptionalPerformanceOptions = {}) => {
  const {
    enableMemoryMonitoring = true,
    enableFPSMonitoring = true,
    enableInteractionTracking = true,
    reportingInterval = 5000,
    thresholds = {},
    onPerformanceIssue
  } = options;

  const prefersReducedMotion = useReducedMotion();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    animationFrames: 0,
    droppedFrames: 0,
    averageFPS: 60,
    interactionLatency: [],
    renderTime: [],
    componentMountTime: 0
  });

  const [performanceMode, setPerformanceMode] = useState<'exceptional' | 'standard' | 'minimal'>('exceptional');
  const [isMonitoring, setIsMonitoring] = useState(!prefersReducedMotion);

  const frameRef = useRef<number>();
  const lastFrameTime = useRef<number>(performance.now());
  const frameCount = useRef<number>(0);
  const droppedFrameCount = useRef<number>(0);
  const mountTime = useRef<number>(performance.now());
  const interactionTimes = useRef<number[]>([]);
  const renderTimes = useRef<number[]>([]);

  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Memory monitoring
  const getMemoryUsage = useCallback((): number | undefined => {
    if (!enableMemoryMonitoring) return undefined;
    
    // Check for performance.memory API (Chrome/Edge)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    
    return undefined;
  }, [enableMemoryMonitoring]);

  // FPS monitoring with frame dropping detection
  const monitorFrameRate = useCallback(() => {
    if (!enableFPSMonitoring || !isMonitoring) return;

    const now = performance.now();
    const deltaTime = now - lastFrameTime.current;
    
    frameCount.current++;
    
    // Detect dropped frames (assuming 60fps target)
    const expectedFrameTime = 1000 / 60; // ~16.67ms
    if (deltaTime > expectedFrameTime * 2) {
      droppedFrameCount.current++;
    }
    
    lastFrameTime.current = now;
    
    // Calculate FPS every 60 frames
    if (frameCount.current % 60 === 0) {
      const fps = 1000 / deltaTime;
      const droppedPercentage = (droppedFrameCount.current / frameCount.current) * 100;
      
      setMetrics(prev => ({
        ...prev,
        animationFrames: frameCount.current,
        droppedFrames: droppedFrameCount.current,
        averageFPS: Math.round(fps)
      }));

      // Check for performance issues
      if (fps < finalThresholds.minFPS || droppedPercentage > finalThresholds.maxDroppedFrames) {
        onPerformanceIssue?.({
          type: 'low_fps',
          severity: fps < 20 ? 'high' : fps < 30 ? 'medium' : 'low',
          metrics: { averageFPS: fps, droppedFrames: droppedFrameCount.current }
        });
        
        // Automatic performance degradation
        if (fps < 20 && performanceMode === 'exceptional') {
          setPerformanceMode('minimal');
        } else if (fps < 30 && performanceMode === 'exceptional') {
          setPerformanceMode('standard');
        }
      }
    }
    
    frameRef.current = requestAnimationFrame(monitorFrameRate);
  }, [enableFPSMonitoring, isMonitoring, finalThresholds, onPerformanceIssue, performanceMode]);

  // Interaction latency tracking
  const trackInteraction = useCallback((startTime: number, endTime?: number) => {
    if (!enableInteractionTracking || !isMonitoring) return;
    
    const latency = (endTime || performance.now()) - startTime;
    interactionTimes.current.push(latency);
    
    // Keep only last 20 interactions
    if (interactionTimes.current.length > 20) {
      interactionTimes.current.shift();
    }
    
    if (latency > finalThresholds.maxInteractionLatency) {
      onPerformanceIssue?.({
        type: 'high_latency',
        severity: latency > 200 ? 'high' : latency > 150 ? 'medium' : 'low',
        metrics: { interactionLatency: [latency] }
      });
    }
  }, [enableInteractionTracking, isMonitoring, finalThresholds, onPerformanceIssue]);

  // Render time tracking
  const trackRender = useCallback((renderStart: number, renderEnd?: number) => {
    const renderTime = (renderEnd || performance.now()) - renderStart;
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 renders
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }
  }, []);

  // Comprehensive performance report
  const generateReport = useCallback((): PerformanceMetrics => {
    const avgLatency = interactionTimes.current.length > 0 
      ? interactionTimes.current.reduce((a, b) => a + b, 0) / interactionTimes.current.length 
      : 0;
    
    const avgRenderTime = renderTimes.current.length > 0
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      : 0;

    return {
      animationFrames: frameCount.current,
      droppedFrames: droppedFrameCount.current,
      averageFPS: metrics.averageFPS,
      memoryUsage: getMemoryUsage(),
      interactionLatency: [...interactionTimes.current],
      renderTime: [...renderTimes.current],
      componentMountTime: performance.now() - mountTime.current
    };
  }, [metrics.averageFPS, getMemoryUsage]);

  // Adaptive quality settings based on performance
  const getOptimalSettings = useCallback(() => {
    return {
      shouldUseComplexAnimations: performanceMode === 'exceptional',
      shouldUseParticleEffects: performanceMode === 'exceptional' && metrics.averageFPS > 45,
      shouldUseBlurEffects: performanceMode !== 'minimal',
      shouldUseHapticFeedback: performanceMode !== 'minimal',
      shouldUseShadowEffects: performanceMode === 'exceptional',
      maxConcurrentAnimations: performanceMode === 'exceptional' ? 10 : performanceMode === 'standard' ? 5 : 2,
      animationDuration: performanceMode === 'exceptional' ? 1 : performanceMode === 'standard' ? 0.7 : 0.4
    };
  }, [performanceMode, metrics.averageFPS]);

  // Start monitoring
  useEffect(() => {
    if (!isMonitoring || prefersReducedMotion) return;
    
    frameRef.current = requestAnimationFrame(monitorFrameRate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isMonitoring, prefersReducedMotion, monitorFrameRate]);

  // Periodic reporting
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      const report = generateReport();
      setMetrics(report);
      
      // Memory usage check
      if (report.memoryUsage && report.memoryUsage > finalThresholds.maxMemoryUsageMB) {
        onPerformanceIssue?.({
          type: 'high_memory',
          severity: report.memoryUsage > finalThresholds.maxMemoryUsageMB * 2 ? 'high' : 'medium',
          metrics: { memoryUsage: report.memoryUsage }
        });
      }
    }, reportingInterval);
    
    return () => clearInterval(interval);
  }, [isMonitoring, reportingInterval, generateReport, finalThresholds, onPerformanceIssue]);

  // Public API
  return {
    // Current metrics
    metrics,
    performanceMode,
    isMonitoring,
    
    // Settings based on performance
    optimalSettings: getOptimalSettings(),
    
    // Control functions
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false),
    resetMetrics: () => {
      frameCount.current = 0;
      droppedFrameCount.current = 0;
      interactionTimes.current = [];
      renderTimes.current = [];
      mountTime.current = performance.now();
    },
    
    // Tracking functions
    trackInteraction,
    trackRender,
    
    // Reporting
    generateReport,
    
    // Manual performance mode override
    setPerformanceMode: (mode: 'exceptional' | 'standard' | 'minimal') => setPerformanceMode(mode),
    
    // Utility functions
    isPerformanceGood: () => metrics.averageFPS >= finalThresholds.minFPS && 
                           (metrics.droppedFrames / Math.max(metrics.animationFrames, 1)) * 100 <= finalThresholds.maxDroppedFrames,
    
    getPerformanceGrade: () => {
      const fps = metrics.averageFPS;
      const dropRate = (metrics.droppedFrames / Math.max(metrics.animationFrames, 1)) * 100;
      
      if (fps >= 55 && dropRate <= 2) return 'A+';
      if (fps >= 45 && dropRate <= 5) return 'A';
      if (fps >= 35 && dropRate <= 10) return 'B';
      if (fps >= 25 && dropRate <= 15) return 'C';
      return 'D';
    }
  };
};

export default useExceptionalPerformanceMonitor;