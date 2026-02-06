/**
 * 📝 SubtaskItem Component
 *
 * Individual subtask with checkbox, editable title, and metadata
 * Handles completion toggle, inline editing, and calendar popup
 * Features satisfying completion animations with Framer Motion
 */

import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskSeparator } from './TaskSeparator';
import { SubtaskMetadata } from './SubtaskMetadata';

interface SubtaskItemProps {
  subtask: {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
    priority?: string;
    estimatedTime?: string;
  };
  taskId: string;
  themeConfig: {
    colors: {
      text: string;
      border: string;
      input: string;
      textSecondary: string;
    };
  };
  isEditing: boolean;
  editTitle: string;
  calendarSubtaskId: string | null;
  onToggleCompletion: (taskId: string, subtaskId: string) => void;
  onStartEditing: (subtaskId: string, currentTitle: string) => void;
  onEditTitleChange: (title: string) => void;
  onSaveEdit: (taskId: string, subtaskId: string) => void;
  onKeyDown: (e: React.KeyboardEvent, type: 'subtask', taskId: string, subtaskId?: string) => void;
  onCalendarToggle: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onPriorityChange?: (subtaskId: string, priority: string) => void;
  onEstimatedTimeChange?: (subtaskId: string, estimatedTime: string) => void;
  children?: React.ReactNode; // For calendar popup
}

// Animation variants for satisfying completion
const subtaskVariants = {
  initial: { opacity: 1, x: 0, scale: 1 },
  completed: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.4,
      ease: [0.2, 0.65, 0.3, 0.9]
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: [0.2, 0.65, 0.3, 0.9]
    }
  }
};

const checkboxVariants = {
  unchecked: { scale: 1, rotate: 0 },
  checking: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    rotate: [0, -10, 10, -5, 0],
    transition: {
      duration: 0.4,
      ease: [0.2, 0.65, 0.3, 0.9]
    }
  },
  checked: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.2
    }
  }
};

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.1 }
    }
  }
};

const sparkleVariants = {
  initial: { scale: 0, opacity: 0, rotate: 0 },
  animate: {
    scale: [0, 1.5, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 0.6,
      ease: [0.2, 0.65, 0.3, 0.9]
    }
  }
};

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  taskId,
  themeConfig,
  isEditing,
  editTitle,
  calendarSubtaskId,
  onToggleCompletion,
  onStartEditing,
  onEditTitleChange,
  onSaveEdit,
  onKeyDown,
  onCalendarToggle,
  onDeleteSubtask,
  onPriorityChange,
  onEstimatedTimeChange,
  children
}) => {
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [showSparkles, setShowSparkles] = React.useState(false);

  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!subtask.completed) {
      // Starting completion - trigger animations
      setIsCompleting(true);
      setShowSparkles(true);

      // Delay the actual completion to let animation play
      setTimeout(() => {
        onToggleCompletion(taskId, subtask.id);
        setIsCompleting(false);
      }, 300);

      // Hide sparkles after animation
      setTimeout(() => {
        setShowSparkles(false);
      }, 600);
    } else {
      // Unchecking - immediate
      onToggleCompletion(taskId, subtask.id);
    }
  };

  return (
    <motion.div
      className="group flex items-start gap-3 py-2 px-3 hover:bg-gray-700/20 rounded-lg transition-all duration-200 w-full"
      variants={subtaskVariants}
      initial="initial"
      animate={subtask.completed ? "completed" : "initial"}
      exit="exit"
      layout
      onClick={(e) => {
        console.log('🔍 [SubtaskItem] Top-level container clicked!', {
          subtaskId: subtask.id,
          target: e.target,
          currentTarget: e.currentTarget,
          targetTagName: (e.target as HTMLElement).tagName
        });
      }}
    >
      <motion.button
        onClick={handleToggleCompletion}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        className="relative flex-shrink-0 hover:scale-105 active:scale-95 transition-all duration-150 min-h-[32px] min-w-[32px] flex items-center justify-center mt-0.5 hover:bg-gray-600/30 active:bg-gray-500/40 rounded-md touch-manipulation"
        style={{ touchAction: 'manipulation' }}
        aria-label={subtask.completed ? "Mark subtask as incomplete" : "Mark subtask as complete"}
        role="checkbox"
        aria-checked={subtask.completed}
        variants={checkboxVariants}
        initial="unchecked"
        animate={isCompleting ? "checking" : subtask.completed ? "checked" : "unchecked"}
        whileTap={{ scale: 0.85 }}
      >
        <AnimatePresence mode="wait">
          {subtask.completed || isCompleting ? (
            <motion.div
              key="checked"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="relative"
            >
              <Check className={`h-4 w-4 ${themeConfig.colors.text} drop-shadow-sm`} />

              {/* Sparkle effects on completion */}
              <AnimatePresence>
                {showSparkles && (
                  <>
                    <motion.div
                      className="absolute -top-1 -right-1 text-yellow-400"
                      variants={sparkleVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Sparkles className="h-3 w-3" />
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-1 -left-1 text-green-400"
                      variants={sparkleVariants}
                      initial="initial"
                      animate="animate"
                      style={{ animationDelay: '0.1s' }}
                    >
                      <Sparkles className="h-2 w-2" />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
              className={`h-4 w-4 rounded-full border-2 border-gray-300 hover:${themeConfig.colors.border} hover:border-opacity-90 transition-all duration-200 bg-gray-800/10 hover:bg-gray-700/20`}
            />
          )}
        </AnimatePresence>
      </motion.button>
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, 'subtask', taskId, subtask.id)}
          onBlur={() => onSaveEdit(taskId, subtask.id)}
          autoFocus
          className={`flex-1 text-xs bg-gray-700/50 border ${themeConfig.colors.input} rounded px-2 py-1 text-white focus:outline-none focus:ring-1 min-h-[32px]`}
        />
      ) : (
        <div
          className="flex-1 min-w-0 pr-1"
          onClick={(e) => {
            console.log('🔍 [SubtaskItem] Content container (flex-1) clicked!', {
              subtaskId: subtask.id,
              target: e.target,
              targetTagName: (e.target as HTMLElement).tagName,
              targetClassName: (e.target as HTMLElement).className
            });
          }}
        >
          {/* Subtask Title */}
          <div className="w-full mb-1.5">
            <span
              className={`block text-xs font-normal cursor-pointer hover:${themeConfig.colors.textSecondary} transition-colors leading-relaxed break-words ${
                subtask.completed ? 'line-through text-gray-400' : 'text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onStartEditing(subtask.id, subtask.title);
              }}
              title="Click to edit"
            >
              {subtask.title}
            </span>
          </div>

          {/* Light, thin separator line */}
          <TaskSeparator thickness="thin" opacity="light" spacing="tight" />

          {/* Metadata row: Due date, priority, time, and Delete button */}
          <SubtaskMetadata
            subtask={subtask}
            calendarSubtaskId={calendarSubtaskId}
            onCalendarToggle={onCalendarToggle}
            onDeleteSubtask={onDeleteSubtask}
            onPriorityChange={onPriorityChange}
            onEstimatedTimeChange={onEstimatedTimeChange}
          >
            {children}
          </SubtaskMetadata>
        </div>
      )}
    </motion.div>
  );
};
