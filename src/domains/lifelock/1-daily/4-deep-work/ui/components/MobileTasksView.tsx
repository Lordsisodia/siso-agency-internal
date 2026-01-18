import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskDetailsSheet } from '@/domains/projects/components/TaskDetailsSheet';
import { useToast } from '@/lib/hooks/ui/useToast';
import { supabase } from '@/services/integrations/supabase/client';
import { useAuthSession } from '@/lib/hooks/auth/useAuthSession';
import { 
  Loader2, 
  Filter, 
  MessageSquare, 
  ChevronRight,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Play,
  Search,
  List,
  Settings
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UiTask } from '@/domains/projects/pages/ActiveTasksView';

interface MobileTasksViewProps {
  tasks: UiTask[];
  loading: boolean;
  onUpdateTask: (task: UiTask) => void;
  onDragEnd?: (event: any) => void;
}

export function MobileTasksView({ tasks, loading, onUpdateTask }: MobileTasksViewProps) {
  const [selectedTask, setSelectedTask] = useState<UiTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const { toast } = useToast();

  // Filter tasks based on status and search
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status.name === filterStatus;
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Awaiting Your Action':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'In Development':
        return <Play className="h-4 w-4 text-orange-500" />;
      case 'Done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const handleTaskClick = (task: UiTask) => {
    setSelectedTask(task);
  };

  const handleStatusChange = async (task: UiTask, newStatus: string) => {
    const statusMap: { [key: string]: string } = {
      'Awaiting Your Action': 'pending',
      'In Development': 'in_progress', 
      'Done': 'completed'
    };

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: statusMap[newStatus] })
        .eq('id', task.id);

      if (error) {
        toast({
          variant: 'destructive',
          title: "Error updating task",
          description: "Could not update task status."
        });
        return;
      }

      const statusColor = 
        newStatus === 'Awaiting Your Action' ? '#FF0000' :
        newStatus === 'In Development' ? '#F59E0B' :
        '#10B981';

      const updatedTask = {
        ...task,
        status: { name: newStatus, color: statusColor }
      };

      onUpdateTask(updatedTask);
      
      toast({
        title: "Task updated",
        description: `"${task.name}" moved to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        variant: 'destructive',
        title: "Update failed",
        description: "Could not update task status."
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] p-4 space-y-4 bg-background">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`mobile-task-skeleton-${index}`} className="border border-border/40 bg-card/60 backdrop-blur">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40 bg-blue-400/20" />
                <Skeleton className="h-4 w-16 bg-blue-400/20" />
              </div>
              <Skeleton className="h-3 w-full bg-blue-400/10" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20 bg-blue-400/15" />
                <Skeleton className="h-4 w-24 bg-blue-400/15" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* iPhone-Optimized Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        {/* Tab Navigation - Bottom iPhone Style */}
        <div className="flex-1 overflow-hidden">
          {/* Tasks Tab */}
          <TabsContent value="tasks" className="h-full mt-0 p-0">
            <div className="h-full flex flex-col">
              {/* Header with quick filter */}
              <div className="p-4 border-b bg-background">
                <h1 className="text-xl font-bold mb-3">My Tasks</h1>
                <div className="flex gap-2 overflow-x-auto">
                  {['all', 'Awaiting Your Action', 'In Development', 'Done'].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="whitespace-nowrap text-xs"
                    >
                      {status === 'all' ? 'All' : status.split(' ')[0]}
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {status === 'all' ? tasks.length : tasks.filter(t => t.status.name === status).length}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Task List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tasks</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery ? 'Try adjusting your search' : 'No tasks in this category'}
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <Card 
                      key={task.id} 
                      className="p-4 cursor-pointer active:bg-accent transition-colors border-l-4"
                      style={{ borderLeftColor: task.status.color }}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="space-y-2">
                        {/* Status and Priority */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status.name)}
                            <span className="text-xs font-medium" style={{ color: task.status.color }}>
                              {task.status.name}
                            </span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>

                        {/* Task Title */}
                        <h3 className="font-semibold text-base leading-tight">
                          {task.name}
                        </h3>

                        {/* Category */}
                        <p className="text-sm text-muted-foreground">
                          {task.category}
                        </p>

                        {/* Quick Action */}
                        {task.status.name !== 'Done' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus = task.status.name === 'Awaiting Your Action' 
                                ? 'In Development' 
                                : 'Done';
                              handleStatusChange(task, nextStatus);
                            }}
                            className="w-full"
                          >
                            {task.status.name === 'Awaiting Your Action' ? 'Start Task' : 'Mark Complete'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="h-full mt-0 p-0">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h1 className="text-xl font-bold">Task Assistant</h1>
                <p className="text-sm text-muted-foreground">Get help with your tasks</p>
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Chat Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    AI-powered task assistance will be available here soon. 
                    For now, tap on tasks to view details.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters" className="h-full mt-0 p-0">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h1 className="text-xl font-bold">Filters & Search</h1>
                <p className="text-sm text-muted-foreground">Organize your tasks</p>
              </div>
              <div className="flex-1 p-4 space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Tasks</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Filter by Status</label>
                  <div className="space-y-2">
                    {['all', 'Awaiting Your Action', 'In Development', 'Done'].map((status) => (
                      <Button
                        key={status}
                        variant={filterStatus === status ? "default" : "outline"}
                        onClick={() => setFilterStatus(status)}
                        className="w-full justify-between"
                      >
                        <span>{status === 'all' ? 'All Tasks' : status}</span>
                        <Badge variant="secondary">
                          {status === 'all' ? tasks.length : tasks.filter(t => t.status.name === status).length}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Stats</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="p-3 text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {tasks.filter(t => t.status.name === 'Awaiting Your Action').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </Card>
                    <Card className="p-3 text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {tasks.filter(t => t.status.name === 'Done').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>

        {/* Bottom Tab Bar - iPhone Style */}
        <TabsList className="grid w-full grid-cols-3 h-16 bg-background border-t rounded-none">
          <TabsTrigger value="tasks" className="flex-col gap-1 h-full">
            <List className="h-5 w-5" />
            <span className="text-xs">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-col gap-1 h-full">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex-col gap-1 h-full">
            <Settings className="h-5 w-5" />
            <span className="text-xs">Filters</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task Details Sheet */}
      <TaskDetailsSheet
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={onUpdateTask}
      />
    </div>
  );
}