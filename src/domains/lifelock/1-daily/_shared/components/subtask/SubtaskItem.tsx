/**
 * 📝 SubtaskItem Component
 *
 * Individual subtask with checkbox, editable title, and metadata
 * Handles completion toggle, inline editing, and calendar popup
 * Features satisfying completion animations with Framer Motion
 * Supports recursive nested sub-subtasks (2-level hierarchy)
 */

import React from 'react';
import { Check, Sparkles, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskSeparator } from '../task/TaskSeparator';
import { SubtaskMetadata } from './SubtaskMetadata';

/** Recursive subtask type supporting nested sub-subtasks */
export interface SubtaskData {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority?: string;
  estimatedTime?: string;
  description?: string;
  tools?: string[];
  /** Nested sub-subtasks (2-level hierarchy) */
  subtasks?: SubtaskData[];
}

interface SubtaskItemProps {
  subtask: SubtaskData;
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
  /** Nesting depth level (0 = top-level subtask, 1 = nested sub-subtask) */
  depth?: number;
  /** Whether this subtask is expanded to show nested sub-subtasks */
  isExpanded?: boolean;
  /** ID of the subtask currently being added to (for nested sub-subtasks) */
  addingSubtaskToSubtaskId?: string | null;
  newSubtaskTitle?: string;
  onToggleCompletion: (taskId: string, subtaskId: string, depth?: number) => void;
  onStartEditing: (subtaskId: string, currentTitle: string, depth?: number) => void;
  onEditTitleChange: (title: string) => void;
  onSaveEdit: (taskId: string, subtaskId: string, depth?: number) => void;
  onKeyDown: (e: React.KeyboardEvent, type: 'subtask', taskId: string, subtaskId?: string, depth?: number) => void;
  onCalendarToggle: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string, depth?: number) => void;
  onPriorityChange?: (subtaskId: string, priority: string, depth?: number) => void;
  onEstimatedTimeChange?: (subtaskId: string, estimatedTime: string, depth?: number) => void;
  /** Toggle expansion of nested sub-subtasks */
  onToggleExpansion?: (subtaskId: string) => void;
  /** Start adding a nested sub-subtask */
  onStartAddingSubSubtask?: (parentSubtaskId: string) => void;
  /** Change new sub-subtask title */
  onNewSubSubtaskTitleChange?: (title: string) => void;
  /** Save new nested sub-subtask */
  onSaveNewSubSubtask?: (parentSubtaskId: string) => void;
  /** Key down handler for new sub-subtask input */
  onNewSubSubtaskKeyDown?: (e: React.KeyboardEvent, parentSubtaskId: string) => void;
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

/** Get indentation classes based on nesting depth */
const getIndentationClasses = (depth: number): string => {
  switch (depth) {
    case 0:
      return 'pl-0';
    case 1:
      return 'pl-4 border-l-2 border-gray-700/50 ml-3';
    case 2:
      return 'pl-4 border-l-2 border-gray-700/30 ml-6';
    default:
      return `pl-4 border-l-2 border-gray-700/20 ml-${Math.min(depth * 3, 12)}`;
  }
};

/** Get checkbox size based on depth */
const getCheckboxSize = (depth: number): string => {
  switch (depth) {
    case 0:
      return 'h-4 w-4';
    case 1:
      return 'h-3.5 w-3.5';
    default:
      return 'h-3 w-3';
  }
};

/** Get text size based on depth */
const getTextSize = (depth: number): string => {
  switch (depth) {
    case 0:
      return 'text-xs';
    case 1:
      return 'text-[11px]';
    default:
      return 'text-[10px]';
  }
};

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  taskId,
  themeConfig,
  isEditing,
  editTitle,
  calendarSubtaskId,
  depth = 0,
  isExpanded = false,
  addingSubtaskToSubtaskId,
  newSubtaskTitle = '',
  onToggleCompletion,
  onStartEditing,
  onEditTitleChange,
  onSaveEdit,
  onKeyDown,
  onCalendarToggle,
  onDeleteSubtask,
  onPriorityChange,
  onEstimatedTimeChange,
  onToggleExpansion,
  onStartAddingSubSubtask,
  onNewSubSubtaskTitleChange,
  onSaveNewSubSubtask,
  onNewSubSubtaskKeyDown,
  children
}) => {
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [showSparkles, setShowSparkles] = React.useState(false);

  const hasNestedSubtasks = subtask.subtasks && subtask.subtasks.length > 0;
  const canNestDeeper = depth < 1; // Max 2 levels (depth 0 and 1)

  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!subtask.completed) {
      // Starting completion - trigger animations
      setIsCompleting(true);
      setShowSparkles(true);

      // Delay the actual completion to let animation play
      setTimeout(() => {
        onToggleCompletion(taskId, subtask.id, depth);
        setIsCompleting(false);
      }, 300);

      // Hide sparkles after animation
      setTimeout(() => {
        setShowSparkles(false);
      }, 600);
    } else {
      // Unchecking - immediate
      onToggleCompletion(taskId, subtask.id, depth);
    }
  };

  const handleToggleExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpansion?.(subtask.id);
  };

  const indentClasses = getIndentationClasses(depth);
  const checkboxSize = getCheckboxSize(depth);
  const textSize = getTextSize(depth);

  return (
    <div className={indentClasses}>
      <motion.div
        className="group flex items-start gap-2 py-2 px-2 hover:bg-gray-700/20 rounded-lg transition-all duration-200 w-full"
        variants={subtaskVariants}
        initial="initial"
        animate={subtask.completed ? "completed" : "initial"}
        exit="exit"
        layout
      >
        {/* Expand/Collapse button for nested subtasks */}
        {hasNestedSubtasks ? (
          <motion.button
            onClick={handleToggleExpansion}
            className="relative flex-shrink-0 hover:scale-105 active:scale-95 transition-all duration-150 min-h-[24px] min-w-[24px] flex items-center justify-center mt-0.5 hover:bg-gray-600/30 rounded-md touch-manipulation"
            whileTap={{ scale: 0.85 }}
          >
            {isExpanded ? (
              <ChevronDown className={`${checkboxSize} ${themeConfig.colors.textSecondary}`} />
            ) : (
              <ChevronRight className={`${checkboxSize} ${themeConfig.colors.textSecondary}`} />
            )}
          </motion.button>
        ) : (
          <div className="min-h-[24px] min-w-[24px]" /> // Spacer for alignment
        )}

        <motion.button
          onClick={handleToggleCompletion}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          className="relative flex-shrink-0 hover:scale-105 active:scale-95 transition-all duration-150 min-h-[24px] min-w-[24px] flex items-center justify-center mt-0.5 hover:bg-gray-600/30 active:bg-gray-500/40 rounded-md touch-manipulation"
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
                <Check className={`${checkboxSize} ${themeConfig.colors.text} drop-shadow-sm`} />

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
                className={`${checkboxSize} rounded-full border-2 border-gray-300 hover:${themeConfig.colors.border} hover:border-opacity-90 transition-all duration-200 bg-gray-800/10 hover:bg-gray-700/20`}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, 'subtask', taskId, subtask.id, depth)}
            onBlur={() => onSaveEdit(taskId, subtask.id, depth)}
            autoFocus
            className={`flex-1 ${textSize} bg-gray-700/50 border ${themeConfig.colors.input} rounded px-2 py-1 text-white focus:outline-none focus:ring-1 min-h-[28px]`}
          />
        ) : (
          <div className="flex-1 min-w-0 pr-1">
            {/* Subtask Title */}
            <div className="w-full mb-1">
              <span
                className={`block ${textSize} font-normal cursor-pointer hover:${themeConfig.colors.textSecondary} transition-colors leading-relaxed break-words ${
                  subtask.completed ? 'line-through text-gray-400' : 'text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEditing(subtask.id, subtask.title, depth);
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
              onDeleteSubtask={(id) => onDeleteSubtask(id, depth)}
              onPriorityChange={(id, priority) => onPriorityChange?.(id, priority, depth)}
              onEstimatedTimeChange={(id, time) => onEstimatedTimeChange?.(id, time, depth)}
            >
              {children}
            </SubtaskMetadata>
          </div>
        )}
      </motion.div>

      {/* Nested sub-subtasks */}
      <AnimatePresence>
        {(isExpanded || !hasNestedSubtasks) && hasNestedSubtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1"
          >
            {subtask.subtasks?.map((nestedSubtask) => (
              <SubtaskItem
                key={nestedSubtask.id}
                subtask={nestedSubtask}
                taskId={taskId}
                themeConfig={themeConfig}
                isEditing={false} // Nested subtasks don't support inline editing for simplicity
                editTitle=""
                calendarSubtaskId={calendarSubtaskId}
                depth={depth + 1}
                isExpanded={false}
                onToggleCompletion={onToggleCompletion}
                onStartEditing={onStartEditing}
                onEditTitleChange={onEditTitleChange}
                onSaveEdit={onSaveEdit}
                onKeyDown={onKeyDown}
                onCalendarToggle={onCalendarToggle}
                onDeleteSubtask={onDeleteSubtask}
                onPriorityChange={onPriorityChange}
                onEstimatedTimeChange={onEstimatedTimeChange}
              />
            ))}

            {/* Add nested sub-subtask button (only at depth 0) */}
            {canNestDeeper && (
              <div className="pl-4 border-l-2 border-gray-700/50 ml-3 mt-1">
                {addingSubtaskToSubtaskId === subtask.id ? (
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => onNewSubSubtaskTitleChange?.(e.target.value)}
                    onKeyDown={(e) => onNewSubSubtaskKeyDown?.(e, subtask.id)}
                    onBlur={() => onSaveNewSubSubtask?.(subtask.id)}
                    placeholder="Enter sub-subtask..."
                    className={`w-full ${textSize} bg-gray-700/50 border ${themeConfig.colors.input} rounded px-2 py-1 text-white focus:outline-none focus:ring-1`}
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => onStartAddingSubSubtask?.(subtask.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${themeConfig.colors.textSecondary} hover:bg-gray-700/30 transition-colors`}
                  >
                    <Plus className="h-3 w-3" />
                    Add sub-task
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubtaskItem;
