import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  Calendar,
  X,
  Trophy
} from 'lucide-react';

interface CompletedTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  description?: string;
  dueDate?: string;
}

interface CompletedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTasks: CompletedTask[];
  onTaskReopen?: (taskId: string) => void;
}

const priorityConfig = {
  low: {
    color: 'text-green-400',
    icon: <Clock className="h-3 w-3" />
  },
  medium: {
    color: 'text-yellow-400',
    icon: <AlertCircle className="h-3 w-3" />
  },
  high: {
    color: 'text-orange-400',
    icon: <AlertTriangle className="h-3 w-3" />
  },
  urgent: {
    color: 'text-red-400',
    icon: <AlertTriangle className="h-3 w-3 animate-pulse" />
  }
};

const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays > 0) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  } else if (diffInHours > 0) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else if (diffInMinutes > 0) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  } else {
    return 'Just now';
  }
};

const CompletedTaskCard: React.FC<{
  task: CompletedTask;
  onReopen?: (taskId: string) => void;
}> = ({ task, onReopen }) => {
  const completedDate = task.completedAt || new Date();
  const timeAgo = getTimeAgo(completedDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-900/10 border border-green-500/20 rounded-lg p-4 hover:bg-green-900/15 transition-all"
    >
      <div className="flex items-start space-x-3">
        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          {/* Title and Priority */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm text-green-100 line-through decoration-green-500/50">
              {task.title}
            </h4>
            {task.priority && (
              <div className={cn('flex items-center', priorityConfig[task.priority].color)}>
                {priorityConfig[task.priority].icon}
              </div>
            )}
          </div>

          {/* Category and Completion Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.category && (
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/10">
                  {task.category}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-green-300">
              <Calendar className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-green-200/70 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Completion Details */}
          <div className="bg-green-500/10 rounded-md p-2 border border-green-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-300/80">Completed on:</span>
              <span className="text-green-300 font-medium">
                {completedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Reopen Button */}
          {onReopen && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReopen(task.id)}
              className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50"
            >
              Reopen Task
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const CompletedTasksModal: React.FC<CompletedTasksModalProps> = ({
  isOpen,
  onClose,
  completedTasks,
  onTaskReopen
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-green-400">
              <Trophy className="h-5 w-5" />
              Completed Tasks
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                {completedTasks.length}
              </Badge>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg font-medium">No completed tasks yet</p>
              <p className="text-gray-500 text-sm mt-2">Complete some tasks to see them here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks
                .sort((a, b) => {
                  const dateA = a.completedAt || new Date();
                  const dateB = b.completedAt || new Date();
                  return dateB.getTime() - dateA.getTime(); // Most recent first
                })
                .map((task) => (
                  <CompletedTaskCard
                    key={task.id}
                    task={task}
                    onReopen={onTaskReopen}
                  />
                ))}
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Total completed: {completedTasks.length} tasks</span>
              <span>Keep up the great work! 🎉</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CompletedTasksModal;