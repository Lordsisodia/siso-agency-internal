import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

interface MobileSectionCardProps {
  section: TaskSection;
  onToggle: (sectionId: string) => void;
  onTaskToggle: (sectionId: string, taskId: string) => void;
  onQuickAdd?: (sectionId: string) => void;
  isExpanded: boolean;
}

/**
 * MobileSectionCard - Mobile-optimized section display
 * 
 * Extracted from InteractiveTodayCard.tsx (1,232 lines → focused component)
 * Handles mobile task section rendering with touch interactions
 */
export const MobileSectionCard: React.FC<MobileSectionCardProps> = ({
  section,
  onToggle,
  onTaskToggle,
  onQuickAdd,
  isExpanded
}) => {
  const isCompleted = section.progress === 100;
  
  return (
    <motion.div
      className={cn(
        'p-4 rounded-lg border transition-all duration-300 relative overflow-hidden',
        isCompleted 
          ? 'bg-green-500/20 border-green-500/30' 
          : 'bg-orange-500/20 border-orange-500/30'
      )}
      layout
    >
      <div className="flex items-center justify-between mb-3" onClick={() => onToggle(section.id)}>
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-2 rounded-full transition-all duration-300',
            isCompleted ? 'bg-green-500/20' : 'bg-orange-500/20'
          )}>
            <section.icon className={cn(
              'h-5 w-5',
              isCompleted ? 'text-green-400' : 'text-orange-400'
            )} />
          </div>
          <div>
            <h3 className={cn(
              'font-semibold transition-all duration-300',
              isCompleted ? 'text-green-300' : 'text-white'
            )}>
              {section.title}
            </h3>
            <p className="text-xs text-gray-400">
              {section.completedCount} of {section.totalCount} tasks completed
            </p>
            {section.tasks.length > 0 && (
              <p className="text-xs text-blue-400 mt-1">
                📋 {section.tasks.length} total tasks {isCompleted ? '✅' : '📝'}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            'text-lg font-bold px-3 py-1 rounded-full',
            isCompleted 
              ? 'text-green-400 bg-green-500/20' 
              : 'text-orange-400 bg-orange-500/20'
          )}>
            {Math.round(section.progress)}%
          </div>
          {section.metrics?.hoursLogged && (
            <div className="text-xs text-gray-400 mt-1">
              ⏱️ {section.metrics.hoursLogged}h logged
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-black/40 rounded-full h-2 mb-3">
        <motion.div 
          className={cn(
            'h-2 rounded-full',
            isCompleted 
              ? 'bg-gradient-to-r from-green-500 to-green-400' 
              : 'bg-gradient-to-r from-orange-500 to-yellow-400'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${section.progress}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Tasks List (when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              {section.tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                    task.completed 
                      ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/15" 
                      : "hover:bg-white/5 border border-transparent hover:border-gray-600/30"
                  )}
                  onClick={() => onTaskToggle(section.id, task.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  {task.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 hover:text-gray-300" />
                  )}
                  <span className={cn(
                    'text-sm flex-1 font-medium transition-all duration-200',
                    task.completed 
                      ? 'line-through text-green-300' 
                      : 'text-gray-200'
                  )}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="text-xs text-green-400 font-semibold px-2 py-1 bg-green-500/20 rounded-full">
                        Done
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {onQuickAdd && (
              <Button
                onClick={() => onQuickAdd(section.id)}
                size="sm"
                variant="ghost"
                className="w-full mt-3 text-gray-400 hover:text-white border-dashed border border-gray-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};