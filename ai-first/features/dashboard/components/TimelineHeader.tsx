
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimelineHeaderProps {
  onCreateTask: () => void;
  currentDate?: Date;
  className?: string; // Added className prop
}

export function TimelineHeader({ onCreateTask, currentDate = new Date(), className }: TimelineHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
        <h2 className="text-base sm:text-lg font-semibold truncate">
          Schedule for {format(currentDate, 'EEEE, MMMM d')}
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <Filter className="h-4 w-4 mr-1" /> 
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>All Tasks</DropdownMenuItem>
            <DropdownMenuItem>High Priority</DropdownMenuItem>
            <DropdownMenuItem>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          onClick={onCreateTask} 
          size="sm" 
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" /> 
          <span className="hidden sm:inline">Create Task</span>
        </Button>
      </div>
    </div>
  );
}
