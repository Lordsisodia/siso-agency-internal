import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { format } from 'date-fns';
import { Clock, CheckSquare, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CleanTaskCardProps {
  name: string;
  startAt: Date;
  endAt: Date;
  category: string;
  owner?: {
    name: string;
    image?: string;
  };
  priority: 'low' | 'medium' | 'high';
  status?: {
    name: string;
    color: string;
  };
  description?: string;
  actionButton?: string;
  actionLink?: string;
  onClick?: () => void;
  completedAt?: Date;
  onDueDateChange?: (date: Date | undefined) => void;
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

export const CleanTaskCard = React.memo(function CleanTaskCard({ 
  name, 
  startAt, 
  endAt, 
  category, 
  owner, 
  priority,
  status,
  actionButton,
  actionLink,
  onClick,
  completedAt,
  onDueDateChange
}: CleanTaskCardProps) {
  const navigate = useNavigate();
  const daysLeft = Math.ceil((endAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isCompleted = status?.name === "Done" || status?.name === "completed";
  
  // Default owner if not provided
  const defaultOwner = owner || { name: 'Unassigned', image: '' };
  
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
  
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (actionLink) {
      navigate(actionLink);
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2.5 p-5 rounded-lg backdrop-blur-sm cursor-pointer animate-fade-in shadow-md will-change-transform transition-[border-color,box-shadow] duration-200",
        isCompleted 
          ? "bg-gradient-to-br from-[#1a2e1a]/90 to-[#2a4a2a]/90 border-2 border-transparent hover:border-white hover:shadow-green-500/20 hover:shadow-lg ring-1 ring-green-500/20"
          : "bg-gradient-to-br from-[#1f2533]/90 to-[#252229]/90 border border-transparent hover:border-white hover:shadow-lg"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <h3 className={cn(
            "text-[15px] font-medium text-gray-100",
            isCompleted && "line-through decoration-green-500/70 decoration-2"
          )}>{name}</h3>
          <div className="flex items-center gap-1.5">
            <div className={cn('flex items-center', priorityColors[priority])}>
              {priorityIcons[priority]}
            </div>
            
            {status && (
              <Badge 
                className="text-[10px] py-0.5"
                style={{ 
                  backgroundColor: `${status.color}20`, 
                  color: status.color 
                }}
              >
                {status.name}
              </Badge>
            )}
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-7 w-7 ring-1 ring-[#9b87f5]/30">
                <AvatarImage src={defaultOwner.image} />
                <AvatarFallback className="bg-[#1f2533] text-xs">{defaultOwner.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assigned to {defaultOwner.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="w-fit text-[10px] py-0.5 bg-purple-500/20 text-purple-400 border-purple-500/30"
            >
              {category}
            </Badge>
            
            {/* Due Date Pill */}
            <Popover>
              <PopoverTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="w-fit text-[10px] py-0.5 bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                >
                  <CalendarIcon className="h-3 w-3" />
                  {format(endAt, 'MMM d')}
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endAt}
                  onSelect={(date) => {
                    if (onDueDateChange && date) {
                      onDueDateChange(date);
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
        
        {actionButton && (
          <Button 
            size="sm" 
            className="w-full mt-2 bg-[#0078D4] hover:bg-[#1A91FF] text-white transition-colors duration-200 font-medium"
            onClick={handleActionClick}
          >
            {actionButton}
          </Button>
        )}
        
        {!actionButton && !isCompleted && (
          <span className="text-xs text-[#aaadb0] mt-1">
            {format(startAt, 'MMM d')} - {format(endAt, 'MMM d, yyyy')}
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
                  {completedAt ? format(completedAt, 'MMM d, yyyy') : format(endAt, 'MMM d, yyyy')}
                </span>
              </div>
              {completedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-300/80">Completed:</span>
                  <span className="text-green-300">
                    {getCompletedTimeAgo(completedAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-300/80">Duration:</span>
                <span className="text-green-300">
                  {Math.ceil(((completedAt || endAt).getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});