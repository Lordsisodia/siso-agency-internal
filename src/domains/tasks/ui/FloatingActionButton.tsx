import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Mic, 
  Calendar, 
  Camera, 
  Clock, 
  Target,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService } from '@/services/voice';

interface FloatingActionButtonProps {
  onQuickAdd?: () => void;
  onVoiceInput?: (command: string) => void;
  onQuickTimer?: () => void;
  onQuickPhoto?: () => void;
  onTodayView?: () => void;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onQuickAdd,
  onVoiceInput,
  onQuickTimer,
  onQuickPhoto,
  onTodayView,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceAction = async () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      try {
        await voiceService.startListening(
          (transcript, isFinal) => {
            if (isFinal && transcript.trim()) {
              onVoiceInput?.(transcript);
              setIsListening(false);
              setIsExpanded(false);
            }
          },
          (error) => {
            console.error('Voice error:', error);
            setIsListening(false);
          },
          {
            language: 'en-US',
            continuous: true,
            interimResults: true
          }
        );
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  };

  // Put voice input first to make it the primary action
  const actions = [
    {
      id: 'voice',
      icon: Mic,
      label: isListening ? 'Stop Recording' : 'Voice Input',
      onClick: handleVoiceAction,
      color: isListening 
        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
        : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600',
      available: !!onVoiceInput
    },
    {
      id: 'add',
      icon: Plus,
      label: 'Add Task',
      onClick: onQuickAdd,
      color: 'bg-gray-700 hover:bg-gray-600',
      available: !!onQuickAdd
    },
    {
      id: 'timer',
      icon: Clock,
      label: 'Quick Timer',
      onClick: onQuickTimer,
      color: 'bg-green-500 hover:bg-green-600',
      available: !!onQuickTimer
    },
    {
      id: 'photo',
      icon: Camera,
      label: 'Photo Log',
      onClick: onQuickPhoto,
      color: 'bg-purple-500 hover:bg-purple-600',
      available: !!onQuickPhoto
    },
    {
      id: 'today',
      icon: Calendar,
      label: 'Today View',
      onClick: onTodayView,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      available: !!onTodayView
    }
  ].filter(action => action.available);

  const handleMainAction = () => {
    if (actions.length === 1) {
      actions[0].onClick?.();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 block sm:hidden', className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 flex flex-col items-end space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 50, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.5 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-gray-700/50">
                  <span className="text-white text-sm font-medium">
                    {action.label}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    action.onClick?.();
                    setIsExpanded(false);
                  }}
                  className={cn(
                    'h-12 w-12 rounded-full shadow-lg',
                    action.color,
                    'hover:scale-110 transition-transform duration-200'
                  )}
                >
                  <action.icon className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          onClick={handleMainAction}
          className={cn(
            'h-14 w-14 rounded-full shadow-xl',
            'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600',
            'border-2 border-orange-400/50',
            'hover:shadow-2xl hover:shadow-orange-500/30',
            'transition-all duration-300'
          )}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {actions.length === 1 ? (
                  React.createElement(actions[0].icon, { className: "h-6 w-6" })
                ) : (
                  <Plus className="h-6 w-6" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 animate-pulse -z-10"></div>
    </div>
  );
};

// Quick Timer Component
export const QuickTimer: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  onStart: (minutes: number) => void;
}> = ({ isVisible, onClose, onStart }) => {
  const [selectedTime, setSelectedTime] = useState(25);
  const quickTimes = [5, 15, 25, 45, 60];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 right-6 bg-black/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-xl z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Quick Timer</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {quickTimes.map((time) => (
              <Button
                key={time}
                size="sm"
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => setSelectedTime(time)}
                className={cn(
                  'text-xs',
                  selectedTime === time 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                )}
              >
                {time}m
              </Button>
            ))}
          </div>

          <Button
            onClick={() => onStart(selectedTime)}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Start {selectedTime}min Timer
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingActionButton;