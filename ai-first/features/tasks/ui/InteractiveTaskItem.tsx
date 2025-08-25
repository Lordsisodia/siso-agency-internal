import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveTaskItemProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
  };
  onToggle: (taskId: string) => void;
  index: number;
}

export const InteractiveTaskItem: React.FC<InteractiveTaskItemProps> = ({
  task,
  onToggle,
  index
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleClick = () => {
    if (!task.completed) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
    onToggle(task.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center space-x-3 w-full text-left p-3 rounded-lg transition-all duration-200",
          "hover:bg-orange-500/10 hover:shadow-sm hover:border hover:border-orange-500/20",
          "bg-gradient-to-r from-transparent via-gray-800/20 to-transparent",
          task.completed && "opacity-75"
        )}
      >
        <div className="relative">
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div
                key="completed"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="uncompleted"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <Circle className="h-5 w-5 text-gray-400" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Completion animation */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="absolute inset-0 bg-green-500 rounded-full blur-md" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <span className={cn(
          'text-base transition-all duration-200 font-medium leading-relaxed',
          task.completed ? 'line-through text-gray-400' : 'text-gray-200'
        )}>
          {task.title}
        </span>
        
        {/* Sparkle effect on completion */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-2"
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
};