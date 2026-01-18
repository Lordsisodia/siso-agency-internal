import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Circle, Edit3, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { TimelineTask } from '../hooks/useTimelineTasks';

interface TimelineTaskCardProps {
  task: TimelineTask;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: TimelineTask) => void;
  onDelete: (taskId: string) => void;
}

const categoryColors = {
  'morning': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'light-work': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'deep-work': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'wellness': 'bg-green-500/20 text-green-300 border-green-500/30'
};

const priorityColors = {
  'low': 'bg-gray-500/20 text-gray-300',
  'medium': 'bg-orange-500/20 text-orange-300',
  'high': 'bg-red-500/20 text-red-300'
};

const categoryIcons = {
  'morning': '🌅',
  'light-work': '⚡',
  'deep-work': '🧠',
  'wellness': '💪'
};

export function TimelineTaskCard({ task, onToggleComplete, onEdit, onDelete }: TimelineTaskCardProps) {
  const categoryColor = categoryColors[task.category];
  const priorityColor = priorityColors[task.priority];
  const categoryIcon = categoryIcons[task.category];

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-all duration-200 ${
        task.completed ? 'opacity-70' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Main Content */}
            <div className="flex-1 space-y-2">
              {/* Title and Completion Toggle */}
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="mt-1 text-gray-400 hover:text-white transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                
                <div className="flex-1">
                  <h3 className={`text-white font-medium ${
                    task.completed ? 'line-through text-gray-400' : ''
                  }`}>
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className="text-gray-400 text-sm mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Badges and Metadata */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Badge */}
                <Badge variant="outline" className={categoryColor}>
                  <span className="mr-1">{categoryIcon}</span>
                  {task.category.replace('-', ' ')}
                </Badge>

                {/* Priority Badge */}
                <Badge variant="outline" className={priorityColor}>
                  {task.priority}
                </Badge>

                {/* Duration */}
                {task.estimatedDuration && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-3 h-3" />
                    {formatDuration(task.estimatedDuration)}
                  </div>
                )}

                {/* Date if different from current */}
                {task.originalDate !== task.currentDate && (
                  <div className="text-gray-500 text-xs">
                    Originally: {format(parseISO(task.originalDate), 'MMM d')}
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500">
                Created: {format(task.createdAt, 'MMM d, yyyy h:mm a')}
                {task.updatedAt && task.updatedAt.getTime() !== task.createdAt.getTime() && (
                  <span className="ml-3">
                    Updated: {format(task.updatedAt, 'MMM d, h:mm a')}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}