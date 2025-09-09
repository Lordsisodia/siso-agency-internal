
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Plus, Filter, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

interface TaskHeaderProps {
  onAddTask?: () => void;
  onFilterChange?: (filter: string) => void;
  onExport?: () => void;
}

export function TaskHeader({ onAddTask, onFilterChange, onExport }: TaskHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Super Light Work</h1>
        <p className="text-gray-300">Focus on lighter tasks and productivity</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select defaultValue="all" onValueChange={onFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="all" className="text-gray-200 hover:bg-gray-700">All Tasks</SelectItem>
            <SelectItem value="main" className="text-gray-200 hover:bg-gray-700">Main Tasks</SelectItem>
            <SelectItem value="weekly" className="text-gray-200 hover:bg-gray-700">Weekly Tasks</SelectItem>
            <SelectItem value="daily" className="text-gray-200 hover:bg-gray-700">Daily Tasks</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={onExport}>
          <Download className="h-4 w-4" />
        </Button>

        <Button onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
