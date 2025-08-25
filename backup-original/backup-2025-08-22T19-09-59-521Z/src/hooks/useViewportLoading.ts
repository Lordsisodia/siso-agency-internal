
import { useEffect, useRef, useState } from 'react';

export const useViewportLoading = (options = { threshold: 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use Intersection Observer API for efficient detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && !isLoaded) {
          // Add a small delay for smoother animation
          setTimeout(() => {
            setIsLoaded(true);
          }, 100);
        }
      },
      {
        threshold: options.threshold,
        rootMargin: '400px 0px', // Increased from 300px for even earlier loading
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, isLoaded]);

  return { elementRef, isVisible, isLoaded };
};
