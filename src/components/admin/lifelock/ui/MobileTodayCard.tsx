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
import { toggleTaskForDate } from '@/services/sharedTaskDataService';
import { CustomTaskInput } from './CustomTaskInput';

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
  onCustomTaskAdd?: (task: { title: string; priority: 'low' | 'medium' | 'high' }) => void;
  className?: string;
}

export const MobileTodayCard: React.FC<MobileTodayCardProps> = ({
  card,
  onViewDetails,
  onQuickAdd,
  onTaskToggle,
  onCustomTaskAdd,
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
      <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/80 to-gray-900/95 backdrop-blur-xl border-2 border-orange-400/30 shadow-2xl shadow-orange-500/25 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"></div>
        <CardContent className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-300/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">Today's Progress</h3>
                <p className="text-gray-300 text-sm font-medium">
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
                  'text-sm px-3 py-1.5 font-bold',
                  completionRate === 100 
                    ? 'border-emerald-400/60 text-emerald-300 bg-emerald-500/20 shadow-sm' 
                    : 'border-orange-400/60 text-orange-200 bg-orange-500/20 shadow-sm'
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
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-3 font-medium">
              <span className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>{completedTasks}/{totalTasks} tasks</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-orange-400" />
                <span className="text-orange-400">{timeRemaining}</span>
              </span>
            </div>
            <div className="w-full bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-sm rounded-full h-4 shadow-inner border border-orange-400/40 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent rounded-full"></div>
              <motion.div 
                className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 h-full rounded-full relative overflow-hidden shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10"></div>
              </motion.div>
            </div>
            
            {/* Motivational Message */}
            <motion.div 
              className="mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm font-semibold leading-relaxed">
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

          {/* Custom Task Input */}
          {onCustomTaskAdd && (
            <CustomTaskInput 
              onAddTask={onCustomTaskAdd}
              className="mb-4"
            />
          )}

          {/* Task Preview or Empty State */}
          <div className="mb-6">
            <div className="space-y-2">
              {card.tasks.length > 0 ? (
                // Show actual tasks when they exist
                <>
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
                          task.completed ? 'line-through text-gray-400' : 'text-gray-200'
                        )}>
                          {task.title}
                        </span>
                      </motion.div>
                    ))
                  )}
                  {card.tasks.length > 3 && (
                    <div className="text-sm text-gray-400 ml-7 font-semibold">
                      +{card.tasks.length - 3} more tasks
                    </div>
                  )}
                </>
              ) : (
                // Show empty task slots when no tasks exist
                <div className="space-y-2">
                  {[1, 2, 3].map((slot) => (
                    <motion.div
                      key={`empty-slot-${slot}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: slot * 0.1 }}
                      className="flex items-center space-x-2 text-xs p-3 border-2 border-dashed border-gray-600/50 rounded-lg bg-gray-800/30 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-200 cursor-pointer group"
                      onClick={onQuickAdd}
                    >
                      <Circle className="h-4 w-4 text-gray-500 group-hover:text-orange-400 flex-shrink-0 transition-colors" />
                      <span className="text-gray-500 group-hover:text-orange-300 italic transition-colors">
                        {slot === 1 ? "Tap microphone or add a task..." : 
                         slot === 2 ? "Empty task slot" : 
                         "Add more tasks..."}
                      </span>
                    </motion.div>
                  ))}
                  
                  {/* Voice input hint */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-500/20"
                  >
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="text-orange-300 font-medium">🎤</span>
                      <span className="text-orange-200 text-xs">
                        Use the microphone button to add tasks with your voice!
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onViewDetails(card)}
              className="flex-1 text-sm px-4 py-3 border-orange-400/50 text-orange-200 bg-orange-500/5 hover:bg-orange-500/20 hover:border-orange-400/70 transition-all duration-200 font-semibold"
            >
              <Clock className="h-3 w-3 mr-1" />
              View Details
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
            <Button 
              size="sm" 
              onClick={onQuickAdd}
              className="flex-1 text-sm px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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