import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskDetailsSheet } from '@/components/projects/TaskDetailsSheet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
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
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UiTask } from '@/components/projects/ActiveTasksView';

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
  const [showChatBot, setShowChatBot] = useState(false);
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-muted-foreground">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="pb-4 min-h-screen">
      {/* Mobile Header - Full Width */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'Awaiting Your Action', 'In Development', 'Done'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="whitespace-nowrap"
            >
              {status === 'all' ? 'All' : status}
              {status !== 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {tasks.filter(t => t.status.name === status).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Task List - Full Screen */}
      <div className="px-4 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'No tasks match the current filter'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className="p-4 cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors"
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Task Status and Priority */}
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(task.status.name)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Task Title */}
                  <h3 className="font-semibold text-sm leading-tight mb-1 pr-2">
                    {task.name}
                  </h3>

                  {/* Task Category */}
                  <p className="text-xs text-muted-foreground mb-2">
                    {task.category}
                  </p>

                  {/* Task Description Preview */}
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {task.description}
                    </p>
                  )}

                  {/* Task Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.owner.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.endAt.toLocaleDateString()}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3">
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
                        className="text-xs h-7"
                      >
                        {task.status.name === 'Awaiting Your Action' ? 'Start' : 'Complete'}
                      </Button>
                    )}
                    {task.actionButton && task.actionLink && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = task.actionLink!;
                        }}
                        className="text-xs h-7"
                      >
                        {task.actionButton}
                      </Button>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Floating Chat Button */}
      <Button
        onClick={() => setShowChatBot(!showChatBot)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Task Details Sheet */}
      <TaskDetailsSheet
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={onUpdateTask}
      />

      {/* Simple Chat Bot Modal */}
      {showChatBot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-background rounded-t-lg w-full h-3/4 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Task Assistant</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChatBot(false)}
              >
                ✕
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Chat integration coming soon! <br />
                For now, click on tasks to view details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}