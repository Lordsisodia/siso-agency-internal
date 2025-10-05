/**
 * Batch Progress Section Template
 * 
 * A reusable batch progress component that displays step-by-step progress tracking
 * with organized tasks in batches. Perfect for onboarding flows, multi-step processes,
 * and guided user experiences.
 * 
 * Key Features:
 * - Batch-based organization (1 of 3, 2 of 3, etc.)
 * - Individual task tracking with completion states
 * - Progress bar visualization
 * - Priority indicators for tasks
 * - Animated task interactions
 * - Customizable task actions and descriptions
 * - Responsive card layout
 * 
 * Usage:
 * <BatchProgressSection 
 *   title="Get Started"
 *   currentBatch={1}
 *   totalBatches={3}
 *   tasks={batchTasks}
 *   onTaskAction={(taskId) => handleTaskAction(taskId)}
 * />
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BatchTask {
  id: string;
  text: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  actionText: string;
  onAction: () => void;
}

interface BatchProgressSectionProps {
  /** Title for the progress section */
  title?: string;
  /** Current batch number */
  currentBatch: number;
  /** Total number of batches */
  totalBatches: number;
  /** Tasks for the current batch */
  tasks: BatchTask[];
  /** Custom CSS classes */
  className?: string;
  /** Whether to show the refresh button */
  showRefresh?: boolean;
  /** Callback when refresh is clicked */
  onRefresh?: () => void;
  /** Custom completion message */
  completionMessage?: string;
}

export function BatchProgressSection({
  title = "Get Started",
  currentBatch,
  totalBatches,
  tasks,
  className = "",
  showRefresh = true,
  onRefresh,
  completionMessage
}: BatchProgressSectionProps) {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const isAllCompleted = completedTasks === totalTasks && totalTasks > 0;

  // If all tasks are completed, show completion state
  if (isAllCompleted && completionMessage) {
    return (
      <Card className={cn("bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {completionMessage}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-300">
            <p className="text-green-400 mb-2">🎉 Great progress!</p>
            <p className="text-sm text-gray-400">
              You've completed batch {currentBatch} of {totalBatches}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          {title} - Batch {currentBatch} of {totalBatches}
          <span className="text-sm font-normal text-gray-400">
            ({completedTasks}/{totalTasks} complete)
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Batch Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Batch Progress</span>
            <div className="flex items-center gap-2">
              <span>{Math.round(progressPercentage)}%</span>
              {showRefresh && onRefresh && (
                <Button
                  onClick={onRefresh}
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 text-gray-400 hover:text-orange-400"
                  title="Refresh completion status"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task, index) => {
              const TaskIcon = task.icon;
              const isCompleted = task.completed;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className={cn(
                    "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.01]",
                    isCompleted 
                      ? "bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30 shadow-green-500/10" 
                      : "bg-gradient-to-r from-black/40 to-gray-900/20 border-white/10 hover:border-orange-500/40 hover:shadow-orange-500/10"
                  )}
                >
                  {/* Priority indicator */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300",
                    task.priority === 'high' && !isCompleted && "bg-red-500",
                    task.priority === 'medium' && !isCompleted && "bg-yellow-500", 
                    task.priority === 'low' && !isCompleted && "bg-blue-500",
                    isCompleted && "bg-green-500"
                  )} />
                  
                  <div className="relative">
                    <Checkbox
                      id={task.id}
                      checked={isCompleted}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-5 w-5 transition-all duration-200"
                      disabled={true}
                    />
                    {!isCompleted && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full animate-pulse shadow-lg" />
                    )}
                  </div>
                  
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isCompleted 
                      ? "bg-green-500/20 border border-green-500/40"
                      : "bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30"
                  )}>
                    <TaskIcon className={cn(
                      "h-5 w-5 transition-colors duration-300",
                      isCompleted ? "text-green-400" : "text-orange-400"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className={cn(
                          "font-semibold text-sm transition-colors duration-300",
                          isCompleted ? "text-green-300 line-through" : "text-white"
                        )}>
                          {task.text}
                        </h4>
                        <p className={cn(
                          "text-xs mt-1 transition-colors duration-300",
                          isCompleted ? "text-green-400/70" : "text-gray-400"
                        )}>
                          {task.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
                          task.priority === 'high' && !isCompleted && "bg-red-500/20 text-red-300",
                          task.priority === 'medium' && !isCompleted && "bg-yellow-500/20 text-yellow-300",
                          task.priority === 'low' && !isCompleted && "bg-blue-500/20 text-blue-300",
                          isCompleted && "bg-green-500/20 text-green-300"
                        )}>
                          {isCompleted ? 'Completed' : `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`}
                        </span>
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800/50 rounded-full">
                          {task.category}
                        </span>
                      </div>
                    </div>
                    
                    {!isCompleted && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          onClick={task.onAction}
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs px-3 py-1 h-auto transition-all duration-200 hover:scale-105"
                        >
                          {task.actionText}
                        </Button>
                        <span className="text-xs text-gray-500 self-center">
                          Action Required
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}