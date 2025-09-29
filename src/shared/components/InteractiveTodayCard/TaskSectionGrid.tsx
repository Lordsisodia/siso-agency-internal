import React from 'react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Flame, 
  Zap, 
  Clock, 
  CheckCircle, 
  CheckCircle2
} from 'lucide-react';
import SisoDeepFocusPlan from '@/components/ui/siso-deep-focus-plan';

interface TaskSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  progress: number;
  completedCount: number;
  totalCount: number;
  metrics?: {
    hoursLogged?: number;
    targetHours?: number;
    streak?: number;
    efficiency?: number;
    completionTime?: string;
  };
}

interface TaskSectionGridProps {
  taskSections: TaskSection[];
  expandedSection: string | null;
  showDeepFocusSession: boolean;
  isMobile?: boolean;
  onSectionToggle: (sectionId: string) => void;
  onToggleDeepFocusSession: () => void;
}

/**
 * TaskSectionGrid - Desktop grid layout for task sections
 * 
 * Extracted from InteractiveTodayCard.tsx (1,232 lines → focused component)
 * Handles desktop task section grid rendering with enhanced features
 */
export const TaskSectionGrid: React.FC<TaskSectionGridProps> = ({
  taskSections,
  expandedSection,
  showDeepFocusSession,
  isMobile = false,
  onSectionToggle,
  onToggleDeepFocusSession
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      yellow: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30 hover:border-yellow-500/50',
      orange: 'text-orange-400 bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30 hover:border-orange-500/50',
      red: 'text-red-400 bg-red-500/20 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50',
      pink: 'text-pink-400 bg-pink-500/20 border-pink-500/30 hover:bg-pink-500/30 hover:border-pink-500/50',
      green: 'text-green-400 bg-green-500/20 border-green-500/30 hover:bg-green-500/30 hover:border-green-500/50 shadow-green-500/20',
    };
    return colors[color as keyof typeof colors] || colors.orange;
  };

  return (
    <div className={cn(
      'gap-3 mb-4',
      isMobile ? 'grid grid-cols-1' : 'grid grid-cols-2'
    )}>
      {taskSections.map((section, index) => {
        const isCompleted = section.progress === 100;
        const isMorningRoutine = section.id === 'morning';
        const isDeepFocus = section.id === 'deep-focus';
        
        // Render enhanced deep focus session card if enabled
        if (isDeepFocus && showDeepFocusSession) {
          return (
            <motion.div
              key="deep-focus-enhanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="col-span-full"
            >
              <SisoDeepFocusPlan
                onStartFocusSession={(taskId, intensity) => {
                  console.log('Starting deep focus session:', { taskId, intensity });
                  // Start flow state timer with specified intensity
                }}
              />
            </motion.div>
          );
        }
        
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden',
              getColorClasses(section.color),
              expandedSection === section.id && 'ring-2 ring-orange-500/50',
              isCompleted && 'animate-pulse-subtle shadow-lg',
              isMorningRoutine && isCompleted && 'bg-gradient-to-br from-green-900/30 to-yellow-900/20'
            )}
            onClick={() => onSectionToggle(section.id)}
          >
            {/* Completion Celebration Effect */}
            {isCompleted && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            )}
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'p-1.5 rounded-full transition-all duration-300',
                  isCompleted ? 'bg-green-500/20 animate-pulse' : 'bg-black/20'
                )}>
                  <section.icon className={cn(
                    'h-4 w-4 transition-all duration-300',
                    isCompleted && isMorningRoutine ? 'text-green-400' : ''
                  )} />
                </div>
                <span className={cn(
                  'text-sm font-medium transition-all duration-300',
                  isCompleted ? 'text-green-300' : 'text-white'
                )}>
                  {section.title}
                </span>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <Sparkles className="h-3 w-3 text-yellow-400" />
                  </motion.div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {section.metrics?.streak && (
                  <div className="flex items-center space-x-1">
                    <Flame className={cn(
                      'h-3 w-3 transition-all duration-300',
                      section.metrics.streak > 7 ? 'text-red-400' : 'text-orange-400'
                    )} />
                    <span className={cn(
                      'text-xs font-semibold',
                      section.metrics.streak > 7 ? 'text-red-400' : 'text-orange-400'
                    )}>
                      {section.metrics.streak}
                    </span>
                  </div>
                )}
                {isDeepFocus && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDeepFocusSession();
                    }}
                    className={cn(
                      'h-6 w-6 p-0 transition-all duration-300',
                      showDeepFocusSession
                        ? 'text-orange-400 bg-orange-500/20 hover:bg-orange-500/30'
                        : 'text-gray-400 hover:text-orange-400 hover:bg-orange-500/20'
                    )}
                    title="Toggle Enhanced Focus Session"
                  >
                    <Zap className="h-3 w-3" />
                  </Button>
                )}
                <span className={cn(
                  'text-xs font-semibold px-2 py-1 rounded-full',
                  isCompleted 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-black/30 text-white'
                )}>
                  {Math.round(section.progress)}%
                </span>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="w-full bg-black/40 rounded-full h-2 mb-2 overflow-hidden">
              <motion.div 
                className={cn(
                  'h-2 rounded-full transition-all duration-700',
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-500 via-yellow-400 to-green-500' 
                    : 'bg-gradient-to-r from-orange-500 to-yellow-400'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${section.progress}%` }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
              >
                {isCompleted && (
                  <div className="w-full h-full bg-gradient-to-r from-white/30 to-transparent animate-pulse" />
                )}
              </motion.div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                {section.metrics?.hoursLogged && (
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{section.metrics.hoursLogged}h</span>
                  </span>
                )}
                {section.metrics?.completionTime && (
                  <span className="text-green-400 font-medium">
                    ✓ {section.metrics.completionTime}
                  </span>
                )}
              </div>
              <div className={cn(
                'border rounded-full px-3 py-1 text-xs font-medium transition-all duration-300',
                isCompleted 
                  ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                  : 'bg-black/40 border-gray-600/50 text-white'
              )}>
                {isCompleted ? (
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Complete!</span>
                  </span>
                ) : (
                  <span>{section.completedCount} of {section.totalCount}</span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};