
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
    <div className="mb-6">
      {/* All header content removed as requested by user */}
    </div>
  );
}
