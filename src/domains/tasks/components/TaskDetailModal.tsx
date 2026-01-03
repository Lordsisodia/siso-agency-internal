import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimeboxTask {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: 'morning' | 'deep-work' | 'light-work' | 'wellness' | 'admin';
  description?: string;
  completed: boolean;
  color: string;
}

interface TaskDetailModalProps {
  task: TimeboxTask | null;
  onClose: () => void;
  onToggleComplete: (taskId: string) => void;
}

const categoryConfig = {
  'morning': { 
    icon: '🌅',
    label: 'Morning Routine',
    textColor: 'text-orange-300',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-500/40'
  },
  'deep-work': { 
    icon: '🧠',
    label: 'Deep Work',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/40'
  },
  'light-work': { 
    icon: '☕',
    label: 'Light Work',
    textColor: 'text-green-300',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/40'
  },
  'wellness': { 
    icon: '💪',
    label: 'Wellness',
    textColor: 'text-teal-300',
    bgColor: 'bg-teal-900/20',
    borderColor: 'border-teal-500/40'
  },
  'admin': { 
    icon: '📋',
    label: 'Administrative',
    textColor: 'text-indigo-300',
    bgColor: 'bg-indigo-900/20',
    borderColor: 'border-indigo-500/40'
  }
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onToggleComplete
}) => {
  if (!task) return null;

  const config = categoryConfig[task.category];
  const durationHours = Math.floor(task.duration / 60);
  const durationMinutes = task.duration % 60;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg mx-4"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          <Card className="bg-gray-900/95 border-gray-700/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg mb-2 pr-8">
                    {task.title}
                  </CardTitle>
                  
                  {/* Category Badge */}
                  <Badge 
                    className={cn(
                      "mb-3",
                      config.bgColor,
                      config.borderColor,
                      config.textColor,
                      "border"
                    )}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {config.icon} {config.label}
                  </Badge>
                </div>
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-t border-gray-700/50 pt-4">
                {/* Time Information */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-sm">
                      {task.startTime} - {task.endTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                    <span className="text-sm">
                      Duration: {durationHours > 0 && `${durationHours}h `}{durationMinutes > 0 && `${durationMinutes}m`}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Description */}
              {task.description && (
                <div className="mb-6">
                  <h4 className="text-gray-300 text-sm font-medium mb-2">Description</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Status and Actions */}
              <div className="space-y-4">
                <div className="border-t border-gray-700/50 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-500" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        task.completed ? "text-green-400" : "text-gray-400"
                      )}>
                        {task.completed ? "Completed" : "Not Completed"}
                      </span>
                    </div>

                    {/* Toggle Completion Button */}
                    <Button
                      onClick={() => onToggleComplete(task.id)}
                      size="sm"
                      variant={task.completed ? "outline" : "default"}
                      className={cn(
                        "transition-all duration-200",
                        task.completed 
                          ? "border-green-500/40 text-green-400 hover:bg-green-900/20" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      {task.completed ? "Mark Incomplete" : "Mark Complete"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};