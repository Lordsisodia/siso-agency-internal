/**
 * TasksSidebar Component
 * Collapsible sidebar with filters, quick actions, and navigation
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Calendar,
  Tag,
  Folder,
  Plus,
  Settings,
  Archive,
  Trash2,
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasks, useTasksFilters } from '../../../.@/lib/stores/tasks/taskProviderCompat';
import { TaskStatus, TaskPriority, TaskCategory } from '@/domains/tasks/types/task.types';
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, TASK_CATEGORY_CONFIG } from '@/domains/tasks/constants/taskConstants';

interface TasksSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  onCreateTask?: () => void;
  onSettings?: () => void;
}

interface SidebarSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  badge?: string | number;
}

interface QuickFilterProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  active?: boolean;
  onClick: () => void;
}

// Quick filter item component
const QuickFilter: React.FC<QuickFilterProps> = ({
  icon: Icon,
  label,
  count,
  active = false,
  onClick
}) => (
  <Button
    variant={active ? "default" : "ghost"}
    size="sm"
    onClick={onClick}
    className={cn(
      "w-full justify-between px-3 py-2 h-auto",
      active ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "hover:bg-gray-100"
    )}
  >
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </div>
    <Badge 
      variant={active ? "default" : "secondary"}
      className={cn(
        "text-xs px-1.5 py-0.5",
        active ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-600"
      )}
    >
      {count}
    </Badge>
  </Button>
);

// Sidebar section component
const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  collapsible = true,
  badge
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 flex-1">{title}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          {children}
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md">
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 flex-1">{title}</span>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const TasksSidebar: React.FC<TasksSidebarProps> = ({
  className,
  collapsed = false,
  onToggle,
  onCreateTask,
  onSettings
}) => {
  const { tasks } = useTasks();
  const { filters, setFilters } = useTasksFilters();

  // Calculate counts for different filters
  const counts = {
    all: tasks.length,
    starred: tasks.filter(t => t.is_starred).length,
    today: tasks.filter(t => {
      const today = new Date().toDateString();
      return t.due_date && new Date(t.due_date).toDateString() === today;
    }).length,
    overdue: tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length,
    completed: tasks.filter(t => t.status === 'completed').length,
    assigned: tasks.filter(t => t.assigned_to).length,
    unassigned: tasks.filter(t => !t.assigned_to).length
  };

  // Status counts
  const statusCounts = Object.keys(TASK_STATUS_CONFIG).reduce((acc, status) => {
    acc[status as TaskStatus] = tasks.filter(t => t.status === status).length;
    return acc;
  }, {} as Record<TaskStatus, number>);

  // Priority counts
  const priorityCounts = Object.keys(TASK_PRIORITY_CONFIG).reduce((acc, priority) => {
    acc[priority as TaskPriority] = tasks.filter(t => t.priority === priority).length;
    return acc;
  }, {} as Record<TaskPriority, number>);

  // Category counts
  const categoryCounts = Object.keys(TASK_CATEGORY_CONFIG).reduce((acc, category) => {
    acc[category as TaskCategory] = tasks.filter(t => t.category === category).length;
    return acc;
  }, {} as Record<TaskCategory, number>);

  // Quick filter handlers
  const handleQuickFilter = (filterType: string, value?: any) => {
    switch (filterType) {
      case 'all':
        setFilters({});
        break;
      case 'starred':
        setFilters({ is_starred: true });
        break;
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        setFilters({ 
          due_date_range: { start: today, end: today }
        });
        break;
      case 'overdue':
        setFilters({ is_overdue: true });
        break;
      case 'completed':
        setFilters({ status: ['completed'] });
        break;
      case 'assigned':
        setFilters({ has_assignee: true });
        break;
      case 'unassigned':
        setFilters({ has_assignee: false });
        break;
      case 'status':
        setFilters({ status: [value] });
        break;
      case 'priority':
        setFilters({ priority: [value] });
        break;
      case 'category':
        setFilters({ category: [value] });
        break;
    }
  };

  if (collapsed) {
    return (
      <div className={cn(
        "tasks-sidebar-collapsed bg-white border-r border-gray-200 w-16 p-2",
        className
      )}>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateTask}
            className="w-full p-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full p-2"
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="w-full p-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "tasks-sidebar bg-white border-r border-gray-200 w-80 flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={onCreateTask}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Quick Filters */}
          <SidebarSection
            title="Quick Filters"
            icon={Filter}
            collapsible={false}
          >
            <div className="space-y-1">
              <QuickFilter
                icon={BarChart3}
                label="All Tasks"
                count={counts.all}
                active={Object.keys(filters).length === 0}
                onClick={() => handleQuickFilter('all')}
              />
              <QuickFilter
                icon={Star}
                label="Starred"
                count={counts.starred}
                active={filters.is_starred === true}
                onClick={() => handleQuickFilter('starred')}
              />
              <QuickFilter
                icon={Calendar}
                label="Due Today"
                count={counts.today}
                active={!!filters.due_date_range}
                onClick={() => handleQuickFilter('today')}
              />
              <QuickFilter
                icon={AlertTriangle}
                label="Overdue"
                count={counts.overdue}
                active={filters.is_overdue === true}
                onClick={() => handleQuickFilter('overdue')}
              />
              <QuickFilter
                icon={CheckCircle2}
                label="Completed"
                count={counts.completed}
                active={filters.status?.includes('completed')}
                onClick={() => handleQuickFilter('completed')}
              />
            </div>
          </SidebarSection>

          <Separator />

          {/* Status Filters */}
          <SidebarSection
            title="By Status"
            icon={CheckCircle2}
            badge={statusCounts.in_progress}
          >
            <div className="space-y-1">
              {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => (
                <QuickFilter
                  key={status}
                  icon={() => <span className={cn('w-3 h-3 rounded-full', config.bgColor)} />}
                  label={config.label}
                  count={statusCounts[status as TaskStatus]}
                  active={filters.status?.includes(status as TaskStatus)}
                  onClick={() => handleQuickFilter('status', status)}
                />
              ))}
            </div>
          </SidebarSection>

          {/* Priority Filters */}
          <SidebarSection
            title="By Priority"
            icon={AlertTriangle}
            badge={priorityCounts.urgent + priorityCounts.high}
          >
            <div className="space-y-1">
              {Object.entries(TASK_PRIORITY_CONFIG).map(([priority, config]) => (
                <QuickFilter
                  key={priority}
                  icon={() => <span className="text-sm">{config.icon}</span>}
                  label={config.label}
                  count={priorityCounts[priority as TaskPriority]}
                  active={filters.priority?.includes(priority as TaskPriority)}
                  onClick={() => handleQuickFilter('priority', priority)}
                />
              ))}
            </div>
          </SidebarSection>

          {/* Category Filters */}
          <SidebarSection
            title="By Category"
            icon={Folder}
            badge={Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)}
          >
            <div className="space-y-1">
              {Object.entries(TASK_CATEGORY_CONFIG).map(([category, config]) => (
                <QuickFilter
                  key={category}
                  icon={() => <span className="text-sm">{config.icon}</span>}
                  label={config.label}
                  count={categoryCounts[category as TaskCategory]}
                  active={filters.category?.includes(category as TaskCategory)}
                  onClick={() => handleQuickFilter('category', category)}
                />
              ))}
            </div>
          </SidebarSection>

          {/* Assignment Filters */}
          <SidebarSection
            title="By Assignment"
            icon={Users}
          >
            <div className="space-y-1">
              <QuickFilter
                icon={Users}
                label="Assigned"
                count={counts.assigned}
                active={filters.has_assignee === true}
                onClick={() => handleQuickFilter('assigned')}
              />
              <QuickFilter
                icon={Users}
                label="Unassigned"
                count={counts.unassigned}
                active={filters.has_assignee === false}
                onClick={() => handleQuickFilter('unassigned')}
              />
            </div>
          </SidebarSection>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onSettings}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <Archive className="w-4 h-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TasksSidebar;