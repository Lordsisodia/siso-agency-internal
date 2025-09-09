import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { LifeLockTask, ThoughtDumpResult } from '@/services/lifeLockVoiceTaskProcessor';
import { Brain, Zap, Clock, Tag, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThoughtDumpResultsProps {
  result: ThoughtDumpResult;
  onClose: () => void;
  onAddToSchedule?: () => void;
  className?: string;
}

export const ThoughtDumpResults: React.FC<ThoughtDumpResultsProps> = ({
  result,
  onClose,
  onAddToSchedule,
  className = ''
}) => {
  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 max-w-md ${className}`}
      >
        <Card className="bg-red-900/20 border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-sm">Processing Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300 text-sm">{result.message}</p>
            <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
              Close
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const TaskList: React.FC<{ tasks: LifeLockTask[]; title: string; icon: React.ReactNode; color: string }> = ({
    tasks,
    title,
    icon,
    color
  }) => (
    <div className={`bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-xl p-4 border ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-white">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      
      {tasks.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No tasks in this category</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/30 rounded-lg p-3 border border-gray-700/50"
            >
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-200 line-clamp-2">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={task.priority === 'urgent' ? 'destructive' : 
                              task.priority === 'high' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                    
                    {task.estimatedDuration && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {task.estimatedDuration < 60 
                          ? `${task.estimatedDuration}m`
                          : `${Math.round(task.estimatedDuration / 60)}h`
                        }
                      </div>
                    )}
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {task.tags.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {task.subtasks.slice(0, 3).map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-2 text-xs text-gray-400">
                          <Circle className="h-2 w-2" />
                          <span className="line-clamp-1">{subtask.title}</span>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {subtask.workType}
                          </Badge>
                        </div>
                      ))}
                      {task.subtasks.length > 3 && (
                        <div className="text-xs text-gray-500 ml-4">
                          +{task.subtasks.length - 3} more subtasks
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-4 z-50 flex items-center justify-center ${className}`}
    >
      <div className="bg-black/60 backdrop-blur-sm absolute inset-0" onClick={onClose} />
      
      <Card className="relative max-w-4xl w-full max-h-[80vh] overflow-hidden bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 border-orange-500/30">
        <CardHeader className="border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Thought Dump Processed
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              ✕
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>📝 {result.totalTasks} tasks created</span>
            <span>🔥 {result.deepTasks.length} deep work</span>
            <span>⚡ {result.lightTasks.length} light work</span>
          </div>
          
          {result.processingNotes && (
            <p className="text-sm text-orange-300/80 mt-2">
              💡 {result.processingNotes}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskList
              tasks={result.deepTasks}
              title="Deep Work Tasks"
              icon={<Brain className="h-5 w-5 text-purple-400" />}
              color="border-purple-500/30"
            />
            
            <TaskList
              tasks={result.lightTasks}
              title="Light Work Tasks"
              icon={<Zap className="h-5 w-5 text-blue-400" />}
              color="border-blue-500/30"
            />
          </div>
          
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              onClick={() => {
                onAddToSchedule?.();
                onClose();
              }}
            >
              Tasks Added to Today ✓
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};