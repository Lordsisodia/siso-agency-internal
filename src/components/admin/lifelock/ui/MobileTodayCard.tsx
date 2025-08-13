import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { InteractiveTaskItem } from './InteractiveTaskItem';

interface TaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

interface MobileTodayCardProps {
  card: TaskCard;
  onViewDetails: (card: TaskCard) => void;
  onQuickAdd: () => void;
  onTaskToggle?: (taskId: string) => void;
  className?: string;
}

export const MobileTodayCard: React.FC<MobileTodayCardProps> = ({
  card,
  onViewDetails,
  onQuickAdd,
  onTaskToggle,
  className
}) => {
  const completedTasks = card.tasks.filter(task => task.completed).length;
  const totalTasks = card.tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const [timeRemaining, setTimeRemaining] = useState('');
  
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m left today`);
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('block sm:hidden', className)}
    >
      <Card className="bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl border border-orange-500/30 shadow-lg shadow-orange-500/10">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Today's Progress</h3>
                <p className="text-gray-400 text-xs">
                  {card.date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs px-2 py-1',
                  completionRate === 100 
                    ? 'border-green-500/50 text-green-400 bg-green-500/10' 
                    : 'border-orange-500/50 text-orange-400 bg-orange-500/10'
                )}
              >
                {Math.round(completionRate)}%
              </Badge>
              {card.completed && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>{completedTasks}/{totalTasks} tasks</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-orange-400" />
                <span className="text-orange-400">{timeRemaining}</span>
              </span>
            </div>
            <div className="w-full bg-black/40 backdrop-blur-sm rounded-full h-3 shadow-inner border border-orange-500/20 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 h-full rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
              </motion.div>
            </div>
            
            {/* Motivational Message */}
            <motion.div 
              className="mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs font-medium">
                {completionRate === 100 ? (
                  <span className="text-green-400 flex items-center justify-center space-x-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Perfect day! All tasks completed!</span>
                  </span>
                ) : completionRate >= 75 ? (
                  <span className="text-yellow-400 flex items-center justify-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Outstanding progress! Almost there!</span>
                  </span>
                ) : completionRate >= 50 ? (
                  <span className="text-orange-400">Good momentum! Keep it up!</span>
                ) : completionRate >= 25 ? (
                  <span className="text-gray-300">You're making progress!</span>
                ) : (
                  <span className="text-gray-400">Let's get started! You got this!</span>
                )}
              </p>
            </motion.div>
          </div>

          {/* Quick Task Preview */}
          <div className="mb-4">
            <div className="space-y-1">
              {onTaskToggle ? (
                // Interactive tasks
                card.tasks.slice(0, 3).map((task, index) => (
                  <InteractiveTaskItem
                    key={task.id}
                    task={task}
                    onToggle={onTaskToggle}
                    index={index}
                  />
                ))
              ) : (
                // Static tasks (fallback)
                card.tasks.slice(0, 3).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 text-xs p-2"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={cn(
                      'truncate',
                      task.completed ? 'line-through text-gray-500' : 'text-gray-300'
                    )}>
                      {task.title}
                    </span>
                  </motion.div>
                ))
              )}
              {card.tasks.length > 3 && (
                <div className="text-xs text-gray-500 ml-7">
                  +{card.tasks.length - 3} more tasks
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onViewDetails(card)}
              className="flex-1 text-xs px-3 py-2 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50"
            >
              <Clock className="h-3 w-3 mr-1" />
              View Details
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
            <Button 
              size="sm" 
              onClick={onQuickAdd}
              className="flex-1 text-xs px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-3 w-3 mr-1" />
              Quick Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MobileTodayCard;