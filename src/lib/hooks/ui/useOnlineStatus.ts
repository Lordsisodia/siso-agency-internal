import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastOnlineAt: Date | null;
  connectionType: 'fast' | 'slow' | 'offline';
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );
  const [connectionType, setConnectionType] = useState<'fast' | 'slow' | 'offline'>('offline');

  useEffect(() => {
    const handleOnline = () => {
      setIsConnecting(true);
      setIsOnline(true);
      setLastOnlineAt(new Date());
      
      // Test connection speed
      testConnectionSpeed().then(speed => {
        setConnectionType(speed);
        setIsConnecting(false);
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnecting(false);
      setConnectionType('offline');
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection speed test if online
    if (navigator.onLine) {
      testConnectionSpeed().then(setConnectionType);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isConnecting, lastOnlineAt, connectionType };
}

async function testConnectionSpeed(): Promise<'fast' | 'slow' | 'offline'> {
  try {
    const start = Date.now();
    const response = await fetch('/favicon.ico?t=' + Date.now(), {
      method: 'HEAD',
      cache: 'no-cache'
    });
    const duration = Date.now() - start;
    
    if (!response.ok) return 'offline';
    
    // Consider connection fast if favicon loads in under 1 second
    return duration < 1000 ? 'fast' : 'slow';
  } catch {
    return 'offline';
  }
}