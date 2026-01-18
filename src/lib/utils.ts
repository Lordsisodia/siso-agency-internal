
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AnyFunction = (...args: any[]) => void;

export interface DebouncedFunction<T extends AnyFunction> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

/**
 * Creates a debounced wrapper around the provided callback.
 * Subsequent calls within the delay window reset the timer.
 * The wrapped callback is never invoked after `cancel` is called.
 */
export function debounce<T extends AnyFunction>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      func(...args);
    }, Math.max(delay, 0));
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced as DebouncedFunction<T>;
}
