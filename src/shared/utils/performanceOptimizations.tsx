import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';

// Performance-optimized wrapper for expensive components
export const withPerformanceOptimization = <T extends {}>(
  Component: React.ComponentType<T>,
  options: {
    memoize?: boolean;
    displayName?: string;
    shouldUpdate?: (prevProps: T, nextProps: T) => boolean;
  } = {}
) => {
  const { memoize = true, displayName, shouldUpdate } = options;
  
  const OptimizedComponent = memoize 
    ? memo(Component, shouldUpdate)
    : Component;
  
  if (displayName) {
    OptimizedComponent.displayName = displayName;
  }
  
  return OptimizedComponent;
};

// Hook for expensive computations
export function useExpensiveComputation<T>(
  computeFn: () => T,
  deps: React.DependencyList
): T {
  return useMemo(() => {
    const start = performance.now();
    const result = computeFn();
    const end = performance.now();
    
    if (end - start > 16) { // Longer than 1 frame
      console.warn(`Expensive computation took ${end - start}ms`);
    }
    
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Optimized event handler hook
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
  
  const handleScroll = useOptimizedCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return { visibleItems, handleScroll };
}

// Debounced state hook for search/filter inputs
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return [value, debouncedValue, setValue];
}

// Performance monitoring component
export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.duration > 16) {
            console.warn(`Performance issue: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      return () => observer.disconnect();
    }
  }, []);
  
  return <>{children}</>;
});

// Optimized list component
export const OptimizedList = memo(<T,>({
  items,
  renderItem,
  keyExtractor,
  itemHeight = 50,
  containerHeight = 400,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  itemHeight?: number;
  containerHeight?: number;
}) => {
  const { visibleItems, handleScroll } = useVirtualScrolling(items, itemHeight, containerHeight);
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleItems.offsetY}px)` }}>
          {visibleItems.items.map((item, index) => (
            <div key={keyExtractor(item, visibleItems.startIndex + index)}>
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Performance-optimized button component
export const OptimizedButton = memo(React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, children, ...props }, ref) => {
  const handleClick = useOptimizedCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick?.(e);
  }, [onClick]);
  
  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}));

OptimizedButton.displayName = 'OptimizedButton';