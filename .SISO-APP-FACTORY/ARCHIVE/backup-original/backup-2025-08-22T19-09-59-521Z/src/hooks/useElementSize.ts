
import { useState, useCallback, useEffect, useRef } from 'react';

export function useElementSize<T extends HTMLElement = HTMLDivElement>(
  ref: React.RefObject<T>
) {
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });
  
  const handleResize = useCallback(() => {
    if (ref.current) {
      setSize({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight
      });
    }
  }, [ref]);
  
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    
    handleResize();
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(ref.current);
    
    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
    };
  }, [ref, handleResize]);
  
  return size;
}
