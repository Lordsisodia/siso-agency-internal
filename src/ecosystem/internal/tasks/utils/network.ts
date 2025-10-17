export function isBrowserOnline(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  try {
    return navigator.onLine ?? false;
  } catch (error) {
    console.warn('[network] Failed to read navigator.onLine:', error);
    return false;
  }
}

