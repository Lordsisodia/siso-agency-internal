import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskHeaderProps {
  onAddTask?: () => void;
  onFilterChange?: (filter: string) => void;
  onExport?: () => void;
}

export function TaskHeaderDashboard({ onAddTask, onFilterChange, onExport }: TaskHeaderProps) {
  return (
    <div className="mb-6">
      {/* All header content removed as requested by user */}
    </div>
  );
}