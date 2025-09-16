import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { CustomTaskInput } from '../ui/CustomTaskInput';
import { InteractiveTaskItem } from '../ui/InteractiveTaskItem';
import { TabProps } from '../DayTabContainer';

interface LightTask {
  id: string;
  title: string;
  category: 'email' | 'admin' | 'communication' | 'quick' | 'other';
  estimatedTime: string;
  completed: boolean;
  urgent: boolean;
  createdAt: Date;
}

const mockLightTasks: LightTask[] = [
  { id: '1', title: 'Reply to client emails', category: 'email', estimatedTime: '15m', completed: false, urgent: true, createdAt: new Date() },
  { id: '2', title: 'Update project timeline', category: 'admin', estimatedTime: '10m', completed: false, urgent: false, createdAt: new Date() },
  { id: '3', title: 'Schedule team meeting', category: 'communication', estimatedTime: '5m', completed: true, urgent: false, createdAt: new Date() },
  { id: '4', title: 'Review and approve expenses', category: 'admin', estimatedTime: '20m', completed: false, urgent: false, createdAt: new Date() },
  { id: '5', title: 'Quick code review', category: 'quick', estimatedTime: '15m', completed: false, urgent: true, createdAt: new Date() },
];

const categoryConfig = {
  email: { name: 'Email', icon: Mail, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-300', bgColor: 'bg-blue-500/20 border-blue-400/50' },
  admin: { name: 'Admin', icon: FileText, color: 'from-purple-500 to-purple-600', textColor: 'text-purple-300', bgColor: 'bg-purple-500/20 border-purple-400/50' },
  communication: { name: 'Communication', icon: MessageSquare, color: 'from-green-500 to-green-600', textColor: 'text-green-300', bgColor: 'bg-green-500/20 border-green-400/50' },
  quick: { name: 'Quick Task', icon: Zap, color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-300', bgColor: 'bg-yellow-500/20 border-yellow-400/50' },
  other: { name: 'Other', icon: Circle, color: 'from-gray-500 to-gray-600', textColor: 'text-gray-300', bgColor: 'bg-gray-500/20 border-gray-400/50' }
};

export const LightWorkTab: React.FC<TabProps> = ({
  user,
  todayCard,
  refreshTrigger,
  onRefresh,
  onTaskToggle,
  onQuickAdd,
  onCustomTaskAdd
}) => {
  const [lightTasks, setLightTasks] = useState<LightTask[]>(mockLightTasks);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const toggleTask = (taskId: string) => {
    setLightTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    onTaskToggle?.(taskId);
  };

  const addLightTask = (task: { title: string; priority: 'low' | 'medium' | 'high' }) => {
    const newTask: LightTask = {
      id: Date.now().toString(),
      title: task.title,
      category: 'other',
      estimatedTime: '15m',
      completed: false,
      urgent: task.priority === 'high',
      createdAt: new Date()
    };
    setLightTasks(prev => [newTask, ...prev]);
    onCustomTaskAdd?.(task);
  };

  const filteredTasks = lightTasks.filter(task => {
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    if (!showCompleted && task.completed) return false;
    return true;
  });

  const completedTasks = lightTasks.filter(t => t.completed).length;
  const urgentTasks = lightTasks.filter(t => t.urgent && !t.completed).length;
  const totalEstimatedTime = lightTasks
    .filter(t => !t.completed)
    .reduce((acc, task) => acc + parseInt(task.estimatedTime), 0);

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Light Work</h1>
            <p className="text-gray-400 text-sm">Quick tasks & admin work</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span>{completedTasks}/{lightTasks.length} completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-400" />
            <span>~{totalEstimatedTime}m remaining</span>
          </div>
          {urgentTasks > 0 && (
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-red-400" />
              <span>{urgentTasks} urgent</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-400/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-300">{completedTasks}</div>
            <div className="text-xs text-green-400">Completed Today</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-400/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-300">{urgentTasks}</div>
            <div className="text-xs text-orange-400">Urgent Tasks</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-gray-600/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Categories</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className="text-xs"
              >
                All ({lightTasks.length})
              </Button>
              {Object.entries(categoryConfig).map(([key, config]) => {
                const count = lightTasks.filter(t => t.category === key).length;
                if (count === 0) return null;
                
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(key)}
                    className="text-xs"
                  >
                    <config.icon className="h-3 w-3 mr-1" />
                    {config.name} ({count})
                  </Button>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-700/50">
              <input
                type="checkbox"
                id="showCompleted"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded text-green-500"
              />
              <label htmlFor="showCompleted" className="text-sm text-gray-400 cursor-pointer">
                Show completed tasks
              </label>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add New Task */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-blue-400/30">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Add Light Task</h3>
            </div>
          </CardHeader>
          <CardContent>
            <CustomTaskInput 
              onAddTask={addLightTask}
              placeholder="Add a quick task or admin item..."
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Task List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-green-400/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">
                  Light Tasks ({filteredTasks.length})
                </h3>
              </div>
              {urgentTasks > 0 && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/40 animate-pulse">
                  {urgentTasks} urgent
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => {
                const config = categoryConfig[task.category];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                      ${task.completed 
                        ? 'bg-green-500/20 border-green-400/50' 
                        : task.urgent 
                          ? 'bg-red-500/10 border-red-400/30 shadow-md shadow-red-500/10' 
                          : 'bg-gray-800/40 border-gray-700/50 hover:border-green-400/30'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className={`
                            font-medium transition-colors
                            ${task.completed ? 'text-green-300 line-through' : 'text-white'}
                          `}>
                            {task.title}
                          </h4>
                          {task.urgent && !task.completed && (
                            <Badge size="sm" className="bg-red-500/20 text-red-300 border-red-500/40">
                              urgent
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge 
                            size="sm"
                            className={config.bgColor}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {config.name}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {task.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!task.completed && (
                      <Button
                        size="sm"
                        className="bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30 text-xs"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {selectedCategory !== 'all' 
                    ? `No ${categoryConfig[selectedCategory as keyof typeof categoryConfig]?.name.toLowerCase()} tasks`
                    : 'No light tasks yet'
                  }
                </p>
                <Button 
                  onClick={onQuickAdd}
                  className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Light Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 pt-4"
      >
        <Button 
          onClick={onQuickAdd}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Light Task
        </Button>
        
        {urgentTasks > 0 && (
          <Button 
            onClick={() => setSelectedCategory('all')}
            variant="outline"
            className="w-full border-red-400/50 text-red-300 hover:bg-red-500/20 font-semibold py-3 rounded-xl"
          >
            <Zap className="h-5 w-5 mr-2" />
            Focus on {urgentTasks} Urgent Task{urgentTasks > 1 ? 's' : ''}
          </Button>
        )}
      </motion.div>
    </div>
  );
};