import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusIcon } from './StatusIcon';
import type { SubTaskListProps } from '../types';

export const SubTaskList: React.FC<SubTaskListProps> = ({
  task,
  isExpanded,
  isAddingSubtask,
  newSubtaskTitle,
  prefersReducedMotion,
  onToggleSubtaskStatus,
  onDeleteSubtask,
  onSetIsAddingSubtask,
  onSetNewSubtaskTitle,
  onAddNewSubtask
}) => {
  // Animation variants
  const subtaskListVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      overflow: "hidden" 
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      overflow: "visible",
      transition: { 
        duration: 0.25, 
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren"
      }
    }
  };

  const subtaskVariants = {
    hidden: { 
      opacity: 0, 
      x: prefersReducedMotion ? 0 : -10 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: prefersReducedMotion ? "tween" : "spring", 
        stiffness: 500, 
        damping: 25,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    }
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className="relative overflow-hidden"
          variants={subtaskListVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          layout
        >
          {/* Connecting line */}
          <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-green-500/30" />
          
          <div className="ml-8 mr-4 pb-4 space-y-2">
            {task.subTasks.map((subtask) => (
              <motion.div
                key={subtask.id}
                className="group flex items-center space-x-3 p-2 hover:bg-green-900/10 rounded-lg transition-all duration-200"
                variants={subtaskVariants}
                layout
              >
                <motion.div
                  className="cursor-pointer"
                  onClick={() => onToggleSubtaskStatus(task.id, subtask.id)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <StatusIcon status={subtask.status} size="h-3.5 w-3.5" />
                </motion.div>
                
                <span className={cn(
                  "text-sm font-medium flex-1",
                  subtask.completed 
                    ? "text-gray-500 line-through" 
                    : "text-green-100/90"
                )}>
                  {subtask.title}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
            
            {/* Add Subtask */}
            <div className="flex items-center space-x-3 p-2">
              {isAddingSubtask === task.id ? (
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="New subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => onSetNewSubtaskTitle(e.target.value)}
                    className="bg-green-900/20 border-green-700/50 text-green-100 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onAddNewSubtask(task.id);
                      if (e.key === 'Escape') {
                        onSetIsAddingSubtask(null);
                        onSetNewSubtaskTitle('');
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => onAddNewSubtask(task.id)}
                    className="bg-green-600 hover:bg-green-700 h-8"
                  >
                    Add
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSetIsAddingSubtask(task.id)}
                  className="text-green-400 hover:text-green-300 hover:bg-green-900/20 h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Subtask
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};