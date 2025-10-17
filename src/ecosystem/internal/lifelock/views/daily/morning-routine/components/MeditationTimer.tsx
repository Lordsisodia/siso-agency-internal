/**
 * Meditation Timer Component
 *
 * Full-screen meditation timer with start/stop/reset functionality.
 * Automatically saves duration and logs sessions to Supabase.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { format } from 'date-fns';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface MeditationTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (durationMinutes: number) => void;
  selectedDate?: Date;
}

export const MeditationTimer: React.FC<MeditationTimerProps> = ({
  isOpen,
  onClose,
  onComplete,
  selectedDate
}) => {
  const { user } = useClerkUser();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    if (!sessionStartTime) {
      // First start - record session start time
      setSessionStartTime(new Date());
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setSessionStartTime(null);
  };

  const logMeditationSession = async (durationSeconds: number, startTime: Date) => {
    if (!user?.id || durationSeconds === 0) return;

    try {
      const completedAt = new Date();
      const dateString = format(selectedDate || new Date(), 'yyyy-MM-dd');

      console.log('🧘 Logging meditation session to Supabase...', {
        duration: durationSeconds,
        durationMinutes: Math.ceil(durationSeconds / 60),
        startTime,
        completedAt
      });

      const response = await fetch('/api/meditation/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          date: dateString,
          startedAt: startTime.toISOString(),
          completedAt: completedAt.toISOString(),
          durationSeconds: durationSeconds,
          completed: true
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Meditation session logged successfully:', result.data);
      } else {
        console.error('❌ Failed to log meditation session:', result.error);
      }
    } catch (error) {
      console.error('❌ Error logging meditation session:', error);
    }
  };

  const handleComplete = async () => {
    setIsRunning(false);
    const durationMinutes = Math.ceil(seconds / 60);

    // Log session to Supabase if we have a start time
    if (sessionStartTime && seconds > 0) {
      await logMeditationSession(seconds, sessionStartTime);
    }

    // Call parent callback to update morning routine duration
    if (onComplete && seconds > 0) {
      onComplete(durationMinutes);
    }

    // Reset and close
    setSeconds(0);
    setSessionStartTime(null);
    onClose();
  };

  const handleCancel = () => {
    setIsRunning(false);
    setSeconds(0);
    setSessionStartTime(null);
    onClose();
  };

  // Format time as MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-full h-screen p-0 bg-gray-900 border-none">
        <VisuallyHidden>
          <DialogTitle>Meditation timer</DialogTitle>
          <DialogDescription>
            Start, pause, or complete your meditation session to log it to your wellness history.
          </DialogDescription>
        </VisuallyHidden>
        {/* Full-screen timer view */}
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900">

          {/* Close button */}
          <button
            onClick={handleCancel}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Timer display */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8"
          >
            {/* Breathing circle animation */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  scale: isRunning ? [1, 1.2, 1] : 1,
                  opacity: isRunning ? [0.3, 0.6, 0.3] : 0.5
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-64 h-64 rounded-full bg-orange-500/20 blur-3xl"
              />
              <div className="relative z-10 text-8xl font-light text-white tracking-wider">
                {formatTime(seconds)}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-gray-400 text-lg max-w-md mx-auto px-6">
              {!isRunning && seconds === 0 && (
                <p>Press Start when you're ready to begin your meditation</p>
              )}
              {isRunning && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Breathe deeply... Focus on the present moment...
                </motion.p>
              )}
              {!isRunning && seconds > 0 && (
                <p>Paused - Resume or complete your session</p>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-4 pt-8">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-full"
                >
                  <Play className="h-6 w-6 mr-2" />
                  {seconds === 0 ? 'Start' : 'Resume'}
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  size="lg"
                  variant="outline"
                  className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8 py-6 text-lg rounded-full"
                >
                  <Pause className="h-6 w-6 mr-2" />
                  Pause
                </Button>
              )}

              {seconds > 0 && (
                <>
                  <Button
                    onClick={handleReset}
                    size="lg"
                    variant="outline"
                    className="border-gray-600 text-gray-400 hover:bg-gray-800 px-6 py-6 text-lg rounded-full"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>

                  {!isRunning && (
                    <Button
                      onClick={handleComplete}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-full"
                    >
                      Complete
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Duration hint */}
            {seconds > 0 && (
              <div className="text-sm text-gray-500 pt-4">
                {Math.ceil(seconds / 60)} minute{Math.ceil(seconds / 60) !== 1 ? 's' : ''} elapsed
              </div>
            )}

            {/* Session tracking indicator */}
            {sessionStartTime && (
              <div className="text-xs text-orange-400/60 pt-2">
                Session will be saved to your meditation history
              </div>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
