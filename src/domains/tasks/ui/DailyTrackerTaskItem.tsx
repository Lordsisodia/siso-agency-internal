import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Circle,
  Eye,
  Timer
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompletedTasksModal } from '@/domains/analytics/components/CompletedTasksModal';

interface DailyTrackerTaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  dueDate?: string;
  logField?: string;
  logValue?: string;
  completedAt?: Date;
  onToggle: (id: string) => void;
  onUpdate?: (id: string, field: string, value: any) => void;
  onDelete?: (id: string) => void;
  onStartFocusSession?: (id: string) => void;
  editable?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  color?: 'yellow' | 'purple' | 'green' | 'red' | 'pink' | 'indigo' | 'orange' | 'blue';
  className?: string;
  completedTasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    description?: string;
    dueDate?: string;
  }>;
}

const priorityConfig = {
  low: {
    color: 'text-green-400',
    icon: <Circle className="h-3 w-3" />
  },
  medium: {
    color: 'text-yellow-400',
    icon: <Clock className="h-3 w-3" />
  },
  high: {
    color: 'text-orange-400',
    icon: <AlertCircle className="h-3 w-3" />
  },
  urgent: {
    color: 'text-red-400',
    icon: <AlertCircle className="h-3 w-3 animate-pulse" />
  }
};

const colorConfig = {
  yellow: 'bg-yellow-900/10 border-transparent hover:bg-yellow-900/15 hover:border-white',
  purple: 'bg-purple-900/10 border-transparent hover:bg-purple-900/15 hover:border-white',
  green: 'bg-green-900/10 border-transparent hover:bg-green-900/15 hover:border-white',
  red: 'bg-red-900/10 border-transparent hover:bg-red-900/15 hover:border-white',
  pink: 'bg-pink-900/10 border-transparent hover:bg-pink-900/15 hover:border-white',
  indigo: 'bg-indigo-900/10 border-transparent hover:bg-indigo-900/15 hover:border-white',
  orange: 'bg-orange-900/10 border-transparent hover:bg-orange-900/15 hover:border-white',
  blue: 'bg-blue-900/10 border-transparent hover:bg-blue-900/15 hover:border-white'
};

export const DailyTrackerTaskItem: React.FC<DailyTrackerTaskItemProps> = ({
  id,
  title,
  completed,
  description,
  priority,
  category,
  dueDate,
  logField,
  logValue,
  completedAt,
  onToggle,
  onUpdate,
  onDelete,
  onStartFocusSession,
  editable = false,
  variant = 'default',
  color = 'yellow',
  className,
  completedTasks = []
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(title);
  const [showCompletedModal, setShowCompletedModal] = React.useState(false);

  const handleSaveEdit = () => {
    if (onUpdate && editTitle.trim()) {
      onUpdate(id, 'title', editTitle);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(title);
      setIsEditing(false);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'flex items-center space-x-2 p-2 rounded-md transition-colors',
          colorConfig[color],
          completed && 'opacity-60',
          className
        )}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 5 }}
      >
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          className={cn(
            'border-gray-600',
            completed && 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600'
          )}
        />
        <span className={cn(
          'text-sm text-gray-200 flex-1',
          completed && 'line-through'
        )}>
          {title}
        </span>
        {priority && (
          <div className={cn('flex items-center', priorityConfig[priority].color)}>
            {priorityConfig[priority].icon}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        'p-3 sm:p-4 rounded-lg border transition-all',
        colorConfig[color],
        completed && 'opacity-70',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          className={cn(
            'mt-1 border-gray-600',
            completed && 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600'
          )}
        />
        
        <div className="flex-1 space-y-2">
          {/* Title */}
          <div className="flex items-start justify-between">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-gray-600 text-white text-sm sm:text-base"
                autoFocus
              />
            ) : (
              <h4 className={cn(
                'font-medium text-sm sm:text-base',
                completed ? 'text-gray-400 line-through' : 'text-white'
              )}>
                {title}
              </h4>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem
                  onClick={() => setShowCompletedModal(true)}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Show Completed Tasks
                </DropdownMenuItem>
                {onStartFocusSession && !completed && (category === 'deep_focus' || category === 'light_focus') && (
                  <DropdownMenuItem
                    onClick={() => onStartFocusSession(id)}
                    className="text-orange-400 hover:text-orange-300 hover:bg-gray-700"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Start Focus Session
                  </DropdownMenuItem>
                )}
                {editable && (
                  <DropdownMenuItem
                    onClick={() => setIsEditing(true)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(id)}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {priority && (
              <div className={cn('flex items-center', priorityConfig[priority].color)}>
                {priorityConfig[priority].icon}
              </div>
            )}
            {category && (
              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400 bg-blue-500/10">
                {category}
              </Badge>
            )}
            {dueDate && (
              <Badge variant="outline" className="text-xs border-gray-500/50 text-gray-400 bg-gray-500/10">
                <Clock className="h-3 w-3 mr-1" />
                {dueDate}
              </Badge>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className={cn(
              'text-xs sm:text-sm leading-relaxed',
              completed ? 'text-gray-500' : 'text-gray-300'
            )}>
              {description}
            </p>
          )}

          {/* Log field */}
          {logField && (
            <div className="mt-3 space-y-1">
              <label className="text-xs text-gray-400">{logField}</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={logValue || ''}
                  onChange={(e) => onUpdate?.(id, 'logValue', e.target.value)}
                  placeholder="Enter value..."
                  className="bg-gray-800 border border-gray-600 text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-gray-600 rounded px-2"
                  disabled={completed}
                />
                {!completed && (
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const currentValue = parseInt(logValue || '0');
                        const newValue = Math.max(0, currentValue - 5);
                        onUpdate?.(id, 'logValue', newValue.toString());
                      }}
                      className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-2 min-w-[28px]"
                    >
                      -5
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const currentValue = parseInt(logValue || '0');
                        const newValue = currentValue + 5;
                        onUpdate?.(id, 'logValue', newValue.toString());
                      }}
                      className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-2 min-w-[28px]"
                    >
                      +5
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const currentValue = parseInt(logValue || '0');
                        const newValue = currentValue + 10;
                        onUpdate?.(id, 'logValue', newValue.toString());
                      }}
                      className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-2 min-w-[28px]"
                    >
                      +10
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Completed Tasks Modal */}
      <CompletedTasksModal
        isOpen={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        completedTasks={completedTasks}
        onTaskReopen={(taskId) => {
          // Handle task reopening if needed
          onUpdate?.(taskId, 'completed', false);
          setShowCompletedModal(false);
        }}
      />
    </motion.div>
  );
};

// Task list wrapper component
export const DailyTrackerTaskList: React.FC<{
  tasks: Array<Omit<DailyTrackerTaskItemProps, 'onToggle' | 'onUpdate' | 'onDelete' | 'onStartFocusSession'>>;
  onToggle: (id: string) => void;
  onUpdate?: (id: string, field: string, value: any) => void;
  onDelete?: (id: string) => void;
  onStartFocusSession?: (id: string) => void;
  onClick?: (task: any) => void;
  variant?: 'default' | 'compact' | 'detailed';
  color?: DailyTrackerTaskItemProps['color'];
  emptyMessage?: string;
  className?: string;
  completedTasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    description?: string;
    dueDate?: string;
  }>;
}> = ({ 
  tasks, 
  onToggle, 
  onUpdate, 
  onDelete, 
  onStartFocusSession,
  onClick,
  variant = 'default',
  color,
  emptyMessage = 'No tasks yet',
  className,
  completedTasks = []
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      variant === 'compact' ? 'space-y-1' : 'space-y-3',
      className
    )}>
      {tasks.map((task, index) => (
        <div
          key={task.id}
          onClick={() => onClick?.(task)}
          className={onClick ? 'cursor-pointer' : ''}
        >
          <DailyTrackerTaskItem
            {...task}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onStartFocusSession={onStartFocusSession}
            variant={variant}
            color={color}
            completedTasks={completedTasks}
          />
        </div>
      ))}
    </div>
  );
};

export default DailyTrackerTaskItem;