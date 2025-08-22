
import { useEffect } from 'react';

// Define web vitals metric types for better type safety
interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

export const usePerformanceMetrics = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const recordMetrics = async () => {
      try {
        // Get Web Vitals metrics
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(async (entry) => {
            // Type guard to handle different performance entry types
            let metricValue: number | undefined;
            
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                metricValue = entry.startTime;
                break;
              case 'first-input':
                const firstInputEntry = entry as PerformanceEventTiming;
                metricValue = firstInputEntry.processingStart - firstInputEntry.startTime;
                break;
              case 'layout-shift':
                // For CLS, we need to access the value differently since it's part of the entry object
                metricValue = (entry as any).value;
                break;
            }

            if (metricValue !== undefined) {
              // Log metrics for debugging instead of storing in database
              console.log('Performance metric:', {
                type: entry.entryType,
                value: metricValue,
                page: window.location.pathname
              });
              
              // In a real implementation, we would store this in a database
              // But we're just mocking this here
              /*
              await safeSupabase.from('performance_metrics').insert([{
                page_url: window.location.pathname,
                metric_type: entry.entryType,
                metric_value: metricValue,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
              }]);
              */
            }
          });
        });

        // Observe LCP, FID, and CLS
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

        // Record TTFB
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          console.log('TTFB:', {
            page: window.location.pathname,
            ttfb: navigationEntry.responseStart - navigationEntry.requestStart
          });
          
          // Mock storing TTFB in database
          /*
          await safeSupabase.from('performance_metrics').insert([{
            page_url: window.location.pathname,
            ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
            timestamp: new Date().toISOString()
          }]);
          */
        }
      } catch (error) {
        console.error('Error in performance monitoring:', error);
      }
    };

    recordMetrics();
  }, []);
};
