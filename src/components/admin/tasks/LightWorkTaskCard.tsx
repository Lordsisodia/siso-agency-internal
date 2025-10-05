/**
 * Light Work Task Card Component
 * Clean task card with the 5 action buttons (Voice, Timer, Photo, View Details, Quick Add)
 * Adapted from LightWorkTab.tsx with modern task integration
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { format } from 'date-fns';
import { 
  Clock, 
  CheckSquare, 
  AlertTriangle, 
  Calendar as CalendarIcon,
  Mic,
  Timer,
  Camera,
  Settings,
  Plus
} from 'lucide-react';
import { Task } from '@/ecosystem/internal/tasks/types/task.types';

interface LightWorkTaskCardProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
  onVoiceInput?: () => void;
  onStartTimer?: () => void;
  onQuickPhoto?: () => void;
  onViewDetails?: () => void;
  onQuickAdd?: () => void;
  isLast?: boolean;
}

const priorityColors = {
  low: 'text-green-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
};

const priorityIcons = {
  low: <Clock className="h-3.5 w-3.5" />,
  medium: <CheckSquare className="h-3.5 w-3.5" />,
  high: <AlertTriangle className="h-3.5 w-3.5" />,
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'done':
      return '#10b981'; // green
    case 'in_progress':
      return '#3b82f6'; // blue
    case 'pending':
      return '#f59e0b'; // amber
    case 'cancelled':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

export const LightWorkTaskCard: React.FC<LightWorkTaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDateChange,
  onVoiceInput,
  onStartTimer,
  onQuickPhoto,
  onViewDetails,
  onQuickAdd,
  isLast
}) => {
  const startDate = task.created_at ? new Date(task.created_at) : new Date();
  const endDate = task.due_date ? new Date(task.due_date) : new Date();
  const completedDate = task.completed_at ? new Date(task.completed_at) : undefined;
  
  const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isCompleted = task.status === 'completed' || task.status === 'done';
  
  // Default owner if not provided
  const defaultOwner = task.assigned_to ? { 
    name: task.assigned_to, 
    image: '' 
  } : { 
    name: 'Unassigned', 
    image: '' 
  };
  
  // Calculate time ago for completed tasks
  const getCompletedTimeAgo = (completedDate: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <Card 
      onClick={() => onEdit?.(task)}
      className={cn(
        "cursor-pointer animate-fade-in shadow-md will-change-transform transition-[border-color,box-shadow] duration-200",
        isCompleted 
          ? "bg-gradient-to-br from-[#1a2e1a]/90 to-[#2a4a2a]/90 border-2 border-transparent hover:border-white hover:shadow-green-500/20 hover:shadow-lg ring-1 ring-green-500/20"
          : "bg-gradient-to-br from-[#1f2533]/90 to-[#252229]/90 border border-transparent hover:border-white hover:shadow-lg"
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-2.5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <h3 className={cn(
                "text-[15px] font-medium text-gray-100",
                isCompleted && "line-through decoration-green-500/70 decoration-2"
              )}>
                {task.title}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className={cn('flex items-center', priorityColors[task.priority as keyof typeof priorityColors])}>
                  {priorityIcons[task.priority as keyof typeof priorityIcons]}
                </div>
                
                <Badge 
                  className="text-[10px] py-0.5"
                  style={{ 
                    backgroundColor: `${getStatusColor(task.status)}20`, 
                    color: getStatusColor(task.status)
                  }}
                >
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-7 w-7 ring-1 ring-[#9b87f5]/30">
                    <AvatarImage src={defaultOwner.image} />
                    <AvatarFallback className="bg-[#1f2533] text-xs">
                      {defaultOwner.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assigned to {defaultOwner.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Content */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="w-fit text-[10px] py-0.5 bg-purple-500/20 text-purple-400 border-purple-500/30"
                >
                  {task.category || 'Task'}
                </Badge>
                
                {/* Due Date Pill */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="w-fit text-[10px] py-0.5 bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {format(endDate, 'MMM d')}
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        if (onDateChange && date) {
                          onDateChange(task.id, date);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <span className={cn(
                "text-xs px-2.5 py-1 rounded-full",
                isOverdue 
                  ? "bg-red-500/20 text-red-400" 
                  : daysLeft <= 2 
                  ? "bg-amber-500/20 text-amber-400" 
                  : "bg-green-500/20 text-green-400"
              )}>
                {isOverdue 
                  ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'}` 
                  : daysLeft === 0 
                  ? "Due today" 
                  : isCompleted
                  ? "Completed"
                  : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
              </span>
            </div>
            
            {/* 5 Action Buttons - The key feature! */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="mt-3"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-500/20 border-purple-400/50 text-purple-300 hover:bg-purple-500/30 flex items-center gap-1.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVoiceInput?.();
                  }}
                >
                  <Mic className="h-3.5 w-3.5" />
                  Voice
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-500/20 border-blue-400/50 text-blue-300 hover:bg-blue-500/30 flex items-center gap-1.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartTimer?.();
                  }}
                >
                  <Timer className="h-3.5 w-3.5" />
                  Timer
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-500/20 border-green-400/50 text-green-300 hover:bg-green-500/30 flex items-center gap-1.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickPhoto?.();
                  }}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Photo
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-500/20 border-gray-400/50 text-gray-300 hover:bg-gray-500/30 flex items-center gap-1.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.();
                  }}
                >
                  <Settings className="h-3.5 w-3.5" />
                  View Details
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-orange-500/20 border-orange-400/50 text-orange-300 hover:bg-orange-500/30 flex items-center gap-1.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd?.();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Quick Add
                </Button>
              </div>
            </motion.div>
            
            {!isCompleted && (
              <span className="text-xs text-[#aaadb0] mt-1">
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            )}
            
            {isCompleted && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Task Completed</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-300/80">Completion Date:</span>
                    <span className="text-green-300 font-medium">
                      {completedDate ? format(completedDate, 'MMM d, yyyy') : format(endDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                  {completedDate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-300/80">Completed:</span>
                      <span className="text-green-300">
                        {getCompletedTimeAgo(completedDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-300/80">Duration:</span>
                    <span className="text-green-300">
                      {Math.ceil(((completedDate || endDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LightWorkTaskCard;