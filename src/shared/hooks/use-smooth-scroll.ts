
import { useEffect } from 'react';

interface SmoothScrollOptions {
  onScroll?: (scrollLeft: number, scrollTop: number) => void;
  threshold?: number;
}

export const useSmoothScroll = (
  ref: React.RefObject<HTMLElement>,
  options: SmoothScrollOptions = {}
) => {
  useEffect(() => {
    const { onScroll, threshold = 0 } = options;
    const element = ref.current;

    if (!element) return;
    
    // Add CSS for smooth scrolling
    element.style.scrollBehavior = 'auto';
    
    const handleScroll = () => {
      if (element && onScroll) {
        onScroll(element.scrollLeft, element.scrollTop);
      }
    };

    // Add scroll event listener
    element.addEventListener('scroll', handleScroll);
    
    // Initial call
    handleScroll();
    
    // Cleanup
    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
    };
  }, [ref, options]);
};
