/**
 * useLongPress Hook
 *
 * Detects long-press gestures on both mobile (touch) and desktop (mouse)
 * Returns event handlers that trigger the callback after a specified duration
 */

import { useRef, useEffect, useCallback } from 'react';

interface UseLongPressProps {
  onLongPress: () => void;
  ms?: number; // Duration in milliseconds (default: 500ms)
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export const useLongPress = ({
  onLongPress,
  ms = 500,
  onTouchStart,
  onTouchEnd,
}: UseLongPressProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const start = useCallback(() => {
    onTouchStart?.();
    isLongPressTriggeredRef.current = false;

    timerRef.current = setTimeout(() => {
      onLongPress();
      isLongPressTriggeredRef.current = true;
    }, ms);
  }, [onLongPress, ms, onTouchStart]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Only call onTouchEnd if it wasn't a long press
    if (!isLongPressTriggeredRef.current) {
      onTouchEnd?.();
    }

    isLongPressTriggeredRef.current = false;
  }, [onTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
};
