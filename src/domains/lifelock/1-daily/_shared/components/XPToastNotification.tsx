import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPToast {
  id: string;
  amount: number;
  source: string;
  timestamp: number;
}

interface XPToastNotificationProps {
  toasts: XPToast[];
  onRemove: (id: string) => void;
  className?: string;
}

const TOAST_DURATION = 4000; // 4 seconds
const MAX_TOASTS = 3;

export const XPToastNotification: React.FC<XPToastNotificationProps> = ({
  toasts,
  onRemove,
  className = ''
}) => {
  // Auto-remove toasts after duration
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, TOAST_DURATION);

      return () => clearTimeout(timer);
    });
  }, [toasts, onRemove]);

  // Only show the most recent toasts
  const visibleToasts = toasts.slice(-MAX_TOASTS);

  return (
    <div
      className={cn(
        'fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              layout: { duration: 0.3 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
              y: { duration: 0.3 }
            }}
            className="relative pointer-events-auto"
            style={{
              zIndex: 100 - index // Stack newer toasts on top
            }}
          >
            {/* Toast Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/30 rounded-2xl shadow-2xl shadow-yellow-500/20 overflow-hidden min-w-[280px]">
              {/* Progress bar for auto-dismiss */}
              <motion.div
                className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-yellow-500 to-amber-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
              />

              {/* Content */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* XP Icon with glow */}
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white">
                    +{toast.amount.toLocaleString()} XP
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {toast.source}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={() => onRemove(toast.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
            </div>

            {/* Particle effects */}
            <div className="absolute -top-2 -right-2 w-4 h-4">
              <motion.div
                className="absolute inset-0 bg-yellow-400 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 0, 0],
                  y: [0, -20, -40]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.1
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

// Hook to manage XP toasts
export const useXPToasts = () => {
  const [toasts, setToasts] = useState<XPToast[]>([]);

  const addToast = (amount: number, source: string) => {
    const newToast: XPToast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      amount,
      source,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, newToast]);

    // Play sound effect if available
    if (typeof window !== 'undefined' && 'Audio' in window) {
      // Could add a subtle sound effect here
      // const audio = new Audio('/sounds/xp-gain.mp3');
      // audio.play().catch(() => {}); // Ignore autoplay errors
    }

    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll
  };
};

XPToastNotification.displayName = 'XPToastNotification';
