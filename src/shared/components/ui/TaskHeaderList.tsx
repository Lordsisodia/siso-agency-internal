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

export function TaskHeaderList({ onAddTask, onFilterChange, onExport }: TaskHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold">Task Tracker</h1>
        <p className="text-muted-foreground">Manage and organize team tasks</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select defaultValue="all" onValueChange={onFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-700 hover:bg-gray-100">All Tasks</SelectItem>
            <SelectItem value="main" className="text-gray-700 hover:bg-gray-100">Main Tasks</SelectItem>
            <SelectItem value="weekly" className="text-gray-700 hover:bg-gray-100">Weekly Tasks</SelectItem>
            <SelectItem value="daily" className="text-gray-700 hover:bg-gray-100">Daily Tasks</SelectItem>
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