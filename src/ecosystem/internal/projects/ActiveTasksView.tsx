import React, { useState, useEffect } from 'react';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/shared/ui/kanban";
import { TaskCard } from './TaskCard';
import { TaskDetailsSheet } from './TaskDetailsSheet';
import { MobileTasksView } from '@/ecosystem/internal/tasks/management/MobileTasksView';
import { useToast } from '@/shared/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useIsMobile } from '@/shared/hooks/use-mobile';

const taskStatuses = [
  { id: "1", name: "Awaiting Your Action", color: "#FF0000" },
  { id: "2", name: "In Development", color: "#F59E0B" },
  { id: "3", name: "Done", color: "#10B981" },
];

// Client-focused tasks
const clientTasks = [
  {
    id: "1",
    name: "Collect Project Information",
    description: "Please fill out the form with your business details, project goals, and technical specs to help us create your app plan.",
    startAt: new Date(Date.now()),
    endAt: new Date(Date.now()),
    category: "Onboarding: 0%",
    priority: "high" as const,
    owner: {
      name: "Your Project Manager",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=PM",
    },
    status: { name: "Awaiting Your Action", color: "#FF0000" },
    actionButton: "Complete Now",
    actionLink: "/onboarding"
  },
  {
    id: "2",
    name: "Approve App Plan",
    description: "We've created a proposed app plan with milestones and costs. Review it and let us know if any changes are needed.",
    startAt: new Date(Date.now()),
    endAt: new Date(Date.now() + 86400000), // tomorrow
    category: "Planning: 50%",
    priority: "high" as const,
    owner: {
      name: "Your Project Manager",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=PM",
    },
    status: { name: "Awaiting Your Action", color: "#FF0000" },
    actionButton: "Review Now",
    actionLink: "/onboarding-chat"
  },
  {
    id: "3",
    name: "Make Deposit Payment",
    description: "A £1,000 deposit is required to start development. You can pay securely using Stripe or crypto (with a 20% SISO coin bonus).",
    startAt: new Date(Date.now()),
    endAt: new Date(Date.now() + 172800000), // 2 days
    category: "Deposit: £1,000",
    priority: "high" as const,
    owner: {
      name: "Finance Team",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=FT",
    },
    status: { name: "Awaiting Your Action", color: "#FF0000" },
    actionButton: "Pay Now",
    actionLink: "/financial"
  },
  {
    id: "4",
    name: "Phase 1: Initial Development",
    description: "Our team is currently designing the UI and wireframes for your app. You'll be able to review them soon.",
    startAt: new Date(Date.now()),
    endAt: new Date(Date.now() + 30 * 86400000), // 1 month
    category: "Phase 1: 30%",
    priority: "medium" as const,
    owner: {
      name: "Development Team",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=DT",
    },
    status: { name: "In Development", color: "#F59E0B" },
    actionButton: "View Progress",
    actionLink: "/projects/ubahcrypt"
  },
  {
    id: "5",
    name: "Phase 2: Core Development",
    description: "We're building the core functionality of your app, including user login and payment gateway integration.",
    startAt: new Date(Date.now()),
    endAt: new Date(Date.now() + 60 * 86400000), // 2 months
    category: "Phase 2: 0%",
    priority: "medium" as const,
    owner: {
      name: "Development Team",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=DT",
    },
    status: { name: "In Development", color: "#F59E0B" },
    actionButton: "View Progress",
    actionLink: "/projects/ubahcrypt"
  },
  {
    id: "6",
    name: "Client Kickoff Call",
    description: "We discussed your project goals and expectations during the kickoff call.",
    startAt: new Date("2025-04-30"),
    endAt: new Date("2025-04-30"),
    category: "Completed",
    priority: "medium" as const,
    owner: {
      name: "Your Project Manager",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=PM",
    },
    status: { name: "Done", color: "#10B981" },
    completedAt: new Date("2025-04-30")
  },
  {
    id: "7",
    name: "Review Phase 1 Deliverables",
    description: "We've completed the UI designs and wireframes. Please review and provide feedback or approval.",
    startAt: new Date(Date.now()),
    endAt: new Date(Date.now() + 5 * 86400000), // 5 days
    category: "Phase 1: 50%",
    priority: "high" as const,
    owner: {
      name: "Your Project Manager",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=PM",
    },
    status: { name: "Awaiting Your Action", color: "#FF0000" },
    actionButton: "Review Now",
    actionLink: "/projects/ubahcrypt"
  },
  {
    id: "8",
    name: "Collect Phase 1 Instalment",
    description: "A £1,500 instalment is due for the completion of Phase 1. Pay securely to continue development.",
    startAt: new Date(Date.now()),
    endAt: new Date(Date.now() + 3 * 86400000), // 3 days
    category: "Instalment: £1,500",
    priority: "high" as const,
    owner: {
      name: "Finance Team",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=FT",
    },
    status: { name: "Awaiting Your Action", color: "#FF0000" },
    actionButton: "Pay Now",
    actionLink: "/financial"
  },
  {
    id: "9",
    name: "Phase 3: Final Development",
    description: "We're polishing the app, adding final features, and preparing for launch.",
    startAt: new Date(Date.now()),
    endAt: new Date(Date.now() + 30 * 86400000), // 1 month
    category: "Phase 3: 0%",
    priority: "medium" as const,
    owner: {
      name: "Development Team",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=DT",
    },
    status: { name: "In Development", color: "#F59E0B" },
    actionButton: "View Progress",
    actionLink: "/projects/ubahcrypt"
  },
  {
    id: "10",
    name: "Project Completed",
    description: "Congratulations! Your app has been successfully launched and transferred to your hosting provider.",
    startAt: new Date("2025-05-30"),
    endAt: new Date("2025-05-30"),
    category: "Completed",
    priority: "low" as const,
    owner: {
      name: "Your Project Manager",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=PM",
    },
    status: { name: "Done", color: "#10B981" },
    completedAt: new Date("2025-05-30")
  }
];

export interface UiTask {
  id: string;
  name: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  owner: {
    name: string;
    image: string;
  };
  status: {
    name: string;
    color: string;
  };
  actionButton?: string;
  actionLink?: string;
  completedAt?: Date;
}

export function ActiveTasksView() {
  const [tasks, setTasks] = useState<UiTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<UiTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthSession();
  const isMobile = useIsMobile();

  // Function to convert database task to UI task format
  const convertDbTaskToUiTask = (dbTask: any): UiTask => {
    const statusMap: { [key: string]: { name: string; color: string } } = {
      'pending': { name: 'Awaiting Your Action', color: '#FF0000' },
      'in_progress': { name: 'In Development', color: '#F59E0B' },
      'completed': { name: 'Done', color: '#10B981' }
    };

    const priorityColor = {
      'urgent': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢'
    };

    return {
      id: dbTask.id,
      name: dbTask.title,
      description: dbTask.description || 'No description provided',
      startAt: new Date(dbTask.created_at || Date.now()),
      endAt: new Date(dbTask.due_date || Date.now() + 7 * 24 * 60 * 60 * 1000),
      category: `${priorityColor[dbTask.priority || 'medium']} ${dbTask.category?.toUpperCase() || 'GENERAL'}`,
      priority: dbTask.priority || 'medium',
      owner: {
        name: 'SISO Team',
        image: 'https://api.dicebear.com/7.x/initials/svg?seed=SISO'
      },
      status: statusMap[dbTask.status || 'pending'],
      completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined
    };
  };

  // Fetch tasks from database
  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('Fetching tasks for user:', user?.id);
      
      let query = supabase
        .from('tasks')
        .select('id, title, description, created_at, due_date, category, priority, status, completed_at, assigned_to, created_by');
      
      // Filter by user ID if available, otherwise get all tasks for admins
      if (user?.id) {
        query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading tasks',
          description: 'Could not load tasks from database. Using sample data.'
        });
        // Fallback to sample tasks
        setTasks(clientTasks);
      } else {
        // Convert database tasks to UI format
        const uiTasks = data.map(convertDbTaskToUiTask);
        setTasks(uiTasks.length > 0 ? uiTasks : clientTasks);
      }
    } catch (error) {
      console.error('Database connection error:', error);
      toast({
        variant: 'destructive',
        title: 'Database connection error',
        description: 'Using sample data while connection is restored.'
      });
      setTasks(clientTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    // Map UI status to database status
    const dbStatusMap: { [key: string]: string } = {
      'Awaiting Your Action': 'pending',
      'In Development': 'in_progress',
      'Done': 'completed'
    };

    const newDbStatus = dbStatusMap[over.id];
    
    try {
      // Update in database
      const { error } = await supabase
        .from('tasks')
        .update({ status: newDbStatus })
        .eq('id', active.id);

      if (error) {
        toast({
          variant: 'destructive',
          title: "Error updating task",
          description: "Could not update task status in database."
        });
        return;
      }

      // Update local state
      setTasks(currentTasks => {
        return currentTasks.map(task => {
          if (task.id === active.id) {
            const statusColor = 
              over.id === 'Awaiting Your Action' ? '#FF0000' :
              over.id === 'In Development' ? '#F59E0B' :
              '#10B981';
              
            const updatedTask = {
              ...task,
              status: {
                name: over.id,
                color: statusColor
              }
            };
            
            // Show success toast
            toast({
              title: "Task Status Updated",
              description: `"${task.name}" moved to ${over.id}`,
            });
            
            return updatedTask;
          }
          return task;
        });
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        variant: 'destructive',
        title: "Update failed",
        description: "Could not update task status."
      });
    }
  };

  const handleUpdateTask = (updatedTask: UiTask) => {
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    
    setSelectedTask(null);
    toast({
      title: "Task updated",
      description: "Task details have been updated successfully."
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-muted-foreground">Loading tasks...</span>
      </div>
    );
  }


  // Mobile view
  if (isMobile) {
    return (
      <MobileTasksView
        tasks={tasks}
        loading={loading}
        onUpdateTask={handleUpdateTask}
        onDragEnd={handleDragEnd}
      />
    );
  }

  // Desktop view
  return (
    <div className="p-4">
      <TaskDetailsSheet
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks Kanban Board */}
        <div className="lg:col-span-2">
          <KanbanProvider onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {taskStatuses.filter(status => status.name !== "Done").map((status) => (
                <KanbanBoard 
                  key={status.name} 
                  id={status.name}
                  className="bg-[#1A1A1A]/80 border border-[#333] hover:border-[#444] rounded-xl"
                >
                  <KanbanHeader 
                    name={status.name} 
                    color={status.name === "Awaiting Your Action" ? "#FF5555" : "#FFAA33"} 
                  />
                  <KanbanCards>
                    {tasks
                      .filter((task) => task.status.name === status.name)
                      .map((task, index, filteredTasks) => (
                        <React.Fragment key={task.id}>
                          <KanbanCard
                            id={task.id}
                            name={task.name}
                            parent={status.name}
                            index={index}
                            className="bg-transparent shadow-none p-0"
                          >
                            <div onClick={() => setSelectedTask(task)}>
                              <TaskCard 
                                {...task} 
                                completedAt={task.completedAt}
                                onDueDateChange={async (date) => {
                                  if (date) {
                                    try {
                                      // Update in database
                                      const { error } = await supabase
                                        .from('tasks')
                                        .update({ due_date: date.toISOString() })
                                        .eq('id', task.id);

                                      if (error) {
                                        toast({
                                          variant: 'destructive',
                                          title: "Error updating due date",
                                          description: "Could not update task due date."
                                        });
                                        return;
                                      }

                                      // Update local state
                                      setTasks(currentTasks => 
                                        currentTasks.map(t => 
                                          t.id === task.id ? { ...t, endAt: date } : t
                                        )
                                      );

                                      toast({
                                        title: "Due date updated",
                                        description: `Task due date changed to ${date.toLocaleDateString()}`
                                      });
                                    } catch (error) {
                                      console.error('Error updating due date:', error);
                                      toast({
                                        variant: 'destructive',
                                        title: "Update failed",
                                        description: "Could not update due date."
                                      });
                                    }
                                  }
                                }}
                              />
                            </div>
                          </KanbanCard>
                          {index < filteredTasks.length - 1 && (
                            <div className="h-px bg-white/40 my-3 mx-4" />
                          )}
                        </React.Fragment>
                      ))}
                      
                    {tasks.filter((task) => task.status.name === status.name).length === 0 && (
                      <div className="flex items-center justify-center h-28 border border-dashed border-[#333] rounded-lg bg-[#1f2533]/30 text-sm text-muted-foreground">
                        No tasks in this section
                      </div>
                    )}
                  </KanbanCards>
                </KanbanBoard>
              ))}
            </div>
          </KanbanProvider>
        </div>

        {/* Completed Tasks Section */}
        <div className="lg:col-span-1">
          <div className="bg-[#1A1A1A]/80 border border-[#333] hover:border-[#444] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Completed Tasks</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                {showCompletedTasks ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Completed ({tasks.filter(task => task.status.name === "Done").length})
                  </>
                )}
              </Button>
            </div>
            
            {showCompletedTasks && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tasks.filter(task => task.status.name === "Done").length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No completed tasks yet.
                  </div>
                ) : (
                  tasks
                    .filter(task => task.status.name === "Done")
                    .map((completedTask, index, completedTasks) => (
                      <React.Fragment key={completedTask.id}>
                        <div onClick={() => setSelectedTask(completedTask)}>
                          <TaskCard 
                            {...completedTask}
                            onDueDateChange={async (date) => {
                              if (date) {
                                try {
                                  // Update in database
                                  const { error } = await supabase
                                    .from('tasks')
                                    .update({ due_date: date.toISOString() })
                                    .eq('id', completedTask.id);

                                  if (error) {
                                    toast({
                                      variant: 'destructive',
                                      title: "Error updating due date",
                                      description: "Could not update task due date."
                                    });
                                    return;
                                  }

                                  // Update local state
                                  setTasks(currentTasks => 
                                    currentTasks.map(t => 
                                      t.id === completedTask.id ? { ...t, endAt: date } : t
                                    )
                                  );

                                  toast({
                                    title: "Due date updated",
                                    description: `Task due date changed to ${date.toLocaleDateString()}`
                                  });
                                } catch (error) {
                                  console.error('Error updating due date:', error);
                                  toast({
                                    variant: 'destructive',
                                    title: "Update failed",
                                    description: "Could not update due date."
                                  });
                                }
                              }
                            }}
                          />
                        </div>
                        {index < completedTasks.length - 1 && (
                          <div className="h-px bg-white/40 my-3 mx-4" />
                        )}
                      </React.Fragment>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
