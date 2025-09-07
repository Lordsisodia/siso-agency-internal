import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
// Removed framer-motion for performance optimization
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { PromptInputBox } from '@/shared/ui/ai-prompt-box';
import { AITaskChat } from '@/ecosystem/internal/tasks/views/AITaskChat';
import { EnhancedTaskItem } from '@/ecosystem/internal/tasks/views/EnhancedTaskItem';
import { AdminTaskDetailModal } from '@/ecosystem/internal/tasks/modals/AdminTaskDetailModal';
import { KanbanBoard } from '@/ecosystem/internal/tasks/views/KanbanBoard';
import CalendarView from '@/ecosystem/internal/tasks/views/CalendarView';
import { TaskFilterSidebar } from '@/ecosystem/internal/tasks/views/TaskFilterSidebar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/shared/ui/resizable';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { useToast } from '@/shared/ui/use-toast';
import { useTasks } from '@/shared/hooks/useTasks';
import { useTaskOperations } from '@/shared/hooks/useTaskOperations';
import {
  Calendar,
  Clock,
  Filter,
  Plus,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Archive,
  ChevronDown,
  List,
  Columns3,
  Grid3X3,
  Grid,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
  Flag,
  Users,
  BarChart3,
  Eye,
  EyeOff,
  Paperclip,
  Globe,
  Brain,
  FolderCode,
  X
} from 'lucide-react';

// Local types to avoid import conflicts
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'overdue' | 'due-today' | 'upcoming' | 'in-progress' | 'blocked' | 'not-started' | 'started' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  category: 'development' | 'design' | 'marketing' | 'client' | 'admin';
  tags?: string[];
  estimatedHours?: number;
  subtasks?: Subtask[];
  progress?: number;
  description?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type ViewType = 'list' | 'kanban' | 'calendar';

const AdminTasks: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedTaskForDate, setSelectedTaskForDate] = useState<string | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showProjectContextCard, setShowProjectContextCard] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectContexts, setProjectContexts] = useState<{ [key: string]: string }>({
    'siso-agency': '',
    'ubahcrypt': '',
    'excursions': '',
    'instagram': ''
  });
  const { user } = useAuthSession();
  const { toast } = useToast();
  
  // Load project contexts from localStorage on component mount
  useEffect(() => {
    const savedContexts = localStorage.getItem('projectContexts');
    if (savedContexts) {
      setProjectContexts(JSON.parse(savedContexts));
    }
  }, []);

  // Auto-save project contexts to localStorage
  const saveProjectContext = (projectKey: string, context: string) => {
    const updatedContexts = { ...projectContexts, [projectKey]: context };
    setProjectContexts(updatedContexts);
    localStorage.setItem('projectContexts', JSON.stringify(updatedContexts));
    
    // Send context to AI agent
    console.log(`Updated ${projectKey} context:`, context);
    // TODO: Integrate with AI service to update context
  };

  // Get current project context
  const getCurrentProjectContext = () => {
    return projectContexts[selectedProject] || '';
  };
  
  // Use React Query for task management
  const { useTaskQuery, useUpdateTask } = useTasks();
  const { useCreateTask, useDeleteTask } = useTaskOperations();
  const { data: dbTasks = [], isLoading, error, refetch: refetchTasks } = useTaskQuery(undefined, user?.id);
  const updateTaskMutation = useUpdateTask();
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();

  // Filter options organized by categories
  const filterCategories = {
    general: [
      { value: 'all', label: 'All Tasks', icon: '📋', color: 'bg-gray-600' },
      { value: 'active', label: 'Active Tasks', icon: '🔄', color: 'bg-blue-600' },
      { value: 'completed', label: 'Completed Tasks', icon: '✅', color: 'bg-green-600' }
    ],
    priority: [
      { value: 'high', label: 'High Priority', icon: '🔴', color: 'bg-red-500' },
      { value: 'medium', label: 'Medium Priority', icon: '🟡', color: 'bg-yellow-500' },
      { value: 'low', label: 'Low Priority', icon: '🟢', color: 'bg-green-500' }
    ],
    projects: [
      { value: 'ubahcrypt', label: 'Ubahcrypt', icon: '🔐', color: 'bg-purple-500' },
      { value: 'siso-agency', label: 'SISO Agency App', icon: '🏢', color: 'bg-blue-500' },
      { value: 'excursions', label: 'We Are Excursions', icon: '🏝️', color: 'bg-teal-500' },
      { value: 'instagram', label: 'Instagram Marketing', icon: '📱', color: 'bg-pink-500' },
      { value: 'business-ops', label: 'Business Operations', icon: '💼', color: 'bg-orange-500' }
    ]
  };

  // Priority sub-filters
  const priorityOptions = [
    { value: 'all', label: 'All Priorities', icon: '📊' },
    { value: 'urgent', label: 'Urgent', icon: '🔥' },
    { value: 'high', label: 'High', icon: '🟠' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'low', label: 'Low', icon: '🟢' },
    { value: 'backlog', label: 'Backlog', icon: '📥' }
  ];

  // Filter tasks based on selected filter and priority
  const getFilteredTasks = () => {
    let filteredTasks = tasks;
    
    // Apply main filter
    if (selectedFilter !== 'all') {
      // Status filters (active/completed)
      if (selectedFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
      } else if (selectedFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
      }
      // Priority filters
      else if (['urgent', 'high', 'medium', 'low'].includes(selectedFilter)) {
        filteredTasks = tasks.filter(task => task.priority === selectedFilter);
      } else {
        // Project filters - Use VERY STRICT filtering based on categories and titles
        const projectFilters: { [key: string]: { 
          categories: string[], 
          strictTitleKeywords: string[],
          excludeKeywords?: string[]
        } } = {
          'ubahcrypt': {
            categories: [], // No specific category for crypto tasks
            strictTitleKeywords: ['ubahcrypt', 'uber', 'crypt', 'crypto'],
            excludeKeywords: ['excursion', 'siso', 'partnership', 'instagram']
          },
          'siso-agency': {
            categories: ['siso_app_dev', 'onboarding_app'],
            strictTitleKeywords: ['siso', 'agency', 'partnership'],
            excludeKeywords: ['excursion', 'crypto', 'instagram', 'birthday', 'reset']
          },
          'excursions': {
            categories: [], // No specific category for excursions
            strictTitleKeywords: ['excursion', 'birthday', 'reset workshop'],
            excludeKeywords: ['siso', 'crypto', 'partnership', 'instagram']
          },
          'instagram': {
            categories: ['instagram'],
            strictTitleKeywords: ['instagram', 'social'],
            excludeKeywords: ['excursion', 'crypto', 'siso', 'birthday', 'reset']
          },
          'siso-life': {
            categories: [], // No specific category for siso life
            strictTitleKeywords: ['siso life', 'lifelock'],
            excludeKeywords: ['excursion', 'crypto', 'partnership', 'instagram']
          }
        };
        
        const filterConfig = projectFilters[selectedFilter];
        if (filterConfig) {
          filteredTasks = tasks.filter(task => {
            const taskTitle = task.title.toLowerCase();
            const taskCategory = (task as any).category || '';
            
            // Check if task belongs to excluded projects first
            if (filterConfig.excludeKeywords) {
              const hasExcludedKeyword = filterConfig.excludeKeywords.some(keyword => 
                taskTitle.includes(keyword.toLowerCase())
              );
              if (hasExcludedKeyword) {
                return false;
              }
            }
            
            // Priority 1: Category match (most reliable for database tasks)
            const categoryMatch = filterConfig.categories.length > 0 && 
              filterConfig.categories.includes(taskCategory);
            
            // Priority 2: STRICT title matching for specific project keywords
            const titleMatch = filterConfig.strictTitleKeywords.some(keyword => {
              return taskTitle.includes(keyword.toLowerCase());
            });
            
            // Only return tasks that have definitive project identification
            return categoryMatch || titleMatch;
          });
          
          console.log(`Project ${selectedFilter}: Found ${filteredTasks.length} tasks`);
          if (filteredTasks.length === 0) {
            console.log(`No tasks found for project: ${selectedFilter}`);
          } else {
            console.log(`Tasks for ${selectedFilter}:`, filteredTasks.map(t => t.title));
          }
        } else {
          // Handle dynamic projects from database - no project_id exists, so return empty
          filteredTasks = [];
          console.log(`Unknown project filter: ${selectedFilter}, returning empty array`);
        }
      }
    }
    
    // Apply priority sub-filter (only when not already filtering by priority)
    if (selectedPriority !== 'all' && !['urgent', 'high', 'medium', 'low'].includes(selectedFilter)) {
      filteredTasks = filteredTasks.filter(task => task.priority === selectedPriority);
    }
    
    return filteredTasks;
  };

  // Convert database task to admin task format
  const convertDbTaskToAdminTask = (dbTask: any): Task => {
    const statusMap: { [key: string]: Task['status'] } = {
      'pending': 'not-started',
      'in_progress': 'in-progress',
      'completed': 'done'
    };

    const categoryMap: { [key: string]: Task['category'] } = {
      'siso_app_dev': 'development',
      'onboarding_app': 'development',
      'main': 'admin',
      'instagram': 'marketing',
      'weekly': 'admin',
      'daily': 'admin'
    };

    return {
      id: dbTask.id,
      title: dbTask.title,
      completed: dbTask.status === 'completed',
      status: statusMap[dbTask.status || 'pending'] || 'not-started',
      priority: dbTask.priority || 'medium',
      assignee: 'SISO Team',
      dueDate: dbTask.due_date,
      category: categoryMap[dbTask.category] || 'admin',
      tags: [],
      estimatedHours: Math.round((dbTask.duration || 60) / 60),
      description: dbTask.description || 'No description provided',
      subtasks: [],
      progress: 0
    };
  };

  // Handle loading and error states
  if (error) {
    console.error('Error fetching tasks:', error);
    toast({
      variant: 'destructive',
      title: 'Error loading tasks',
      description: 'Could not load tasks from database.'
    });
  }

  // Sample tasks as fallback
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Design landing page with portfolio showcase',
      completed: false,
      status: 'overdue',
      priority: 'high',
      assignee: 'Design Team',
      dueDate: '2025-01-15',
      category: 'design',
      tags: ['ui', 'portfolio'],
      estimatedHours: 12,
      description: 'Create a modern, responsive landing page that showcases our portfolio work with smooth animations and interactive elements. The design should be mobile-first and align with our brand guidelines.',
      subtasks: [
        { id: '1.1', title: 'Create wireframes for landing page', completed: true },
        { id: '1.2', title: 'Design hero section with animations', completed: true },
        { id: '1.3', title: 'Create portfolio grid layout', completed: false },
        { id: '1.4', title: 'Design mobile responsive views', completed: false }
      ]
    },
    {
      id: '2',
      title: 'Create portfolio showcase section',
      completed: false,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Frontend Team',
      dueDate: '2025-01-20',
      category: 'development',
      tags: ['react', 'showcase'],
      estimatedHours: 8,
      description: 'Build an interactive portfolio showcase with image galleries, filtering capabilities, and lightbox functionality. Use React components with smooth animations and ensure mobile responsiveness.',
      subtasks: [
        { id: '2.1', title: 'Set up React component structure', completed: true },
        { id: '2.2', title: 'Implement image gallery with lightbox', completed: false },
        { id: '2.3', title: 'Add filtering and sorting functionality', completed: false }
      ]
    },
    {
      id: '3',
      title: 'Develop client specification collection system',
      completed: false,
      status: 'not-started',
      priority: 'medium',
      assignee: 'Backend Team',
      dueDate: '2025-01-25',
      category: 'development',
      tags: ['api', 'forms'],
      estimatedHours: 16,
      description: 'Create a comprehensive system for collecting and managing client specifications including forms, validation, database storage, and automated email notifications. Include proper API documentation and testing.',
      subtasks: [
        { id: '3.1', title: 'Design database schema for specifications', completed: false },
        { id: '3.2', title: 'Create REST API endpoints', completed: false },
        { id: '3.3', title: 'Implement form validation', completed: false },
        { id: '3.4', title: 'Set up email notifications', completed: false },
        { id: '3.5', title: 'Write API documentation', completed: false }
      ]
    }
  ];

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  
  // Convert database tasks to admin task format - no fallback to sample tasks
  const tasks = dbTasks.length > 0 
    ? dbTasks.map(convertDbTaskToAdminTask)
    : [];
  
  // Get filtered tasks
  const filteredTasks = getFilteredTasks();
  
  // For active/completed split, we need to consider the current view context
  // If we're filtering by a specific project/priority, apply it to both active and completed
  // If we want to show "all completed" regardless of filter, we'd use all tasks
  const activeTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);
  
  // For total counts (ignoring current filters), use all tasks
  const allActiveTasks = tasks.filter(task => !task.completed);
  const allCompletedTasks = tasks.filter(task => task.completed);
  
  // AI Integration
  const [isAIEnabled, setIsAIEnabled] = useState(true);

  // Get current filter option for display
  const getCurrentFilterOption = () => {
    // Check all categories for the selected filter
    const allOptions = [
      ...filterCategories.general,
      ...filterCategories.priority,
      ...filterCategories.projects
    ];
    return allOptions.find(option => option.value === selectedFilter) || filterCategories.general[0];
  };

  const currentFilterOption = getCurrentFilterOption();


  const toggleTask = async (taskId: string) => {
    // Find task from the converted tasks list
    const task = getFilteredTasks().find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    // Determine new status based on current completed state
    const newStatus = task.completed ? 'pending' : 'completed';
    
    console.log('Toggling task:', taskId, 'from completed:', task.completed, 'to status:', newStatus);
    
    try {
      // Convert to database format for mutation
      const updateData = {
        id: taskId,
        status: newStatus as any, // Cast to satisfy TypeScript
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      };
      
      await updateTaskMutation.mutateAsync(updateData);

      toast({
        title: 'Task updated',
        description: `Task marked as ${newStatus === 'completed' ? 'completed' : 'pending'}.`
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Could not update task status.'
      });
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    // TODO: Implement with React Query mutation
    console.log('Toggle subtask:', taskId, subtaskId);
  };

  const handleDateChange = (taskId: string, date: Date | undefined) => {
    // TODO: Implement with React Query mutation
    console.log('Handle date change:', taskId, date);
  };

  const handleToggleComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(taskId);
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      // Map admin task status to database status
      const statusMap: { [key: string]: string } = {
        'not-started': 'pending',
        'in-progress': 'in_progress',
        'blocked': 'in_progress', // Keep as in_progress but could add blocked status to DB
        'done': 'completed',
        'started': 'in_progress',
        'upcoming': 'pending'
      };

      const dbStatus = statusMap[newStatus] || 'pending';
      
      const updateData = {
        id: taskId,
        status: dbStatus as any,
        completed_at: dbStatus === 'completed' ? new Date().toISOString() : null
      };
      
      await updateTaskMutation.mutateAsync(updateData);

      toast({
        title: 'Task updated',
        description: `Task status changed to ${newStatus.replace('-', ' ')}.`
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Could not update task status.'
      });
    }
  };

  const sendMessage = (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages([...chatMessages, userMessage]);
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I understand you need help with: "' + message + '". Let me assist you with that task.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const openEditTask = (task: Task) => {
    setSelectedTaskForModal(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskModalSave = (updatedTask: Task) => {
    // TODO: Implement with React Query mutation
    console.log('Handle task modal save:', updatedTask);
    setIsTaskModalOpen(false);
    setSelectedTaskForModal(null);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
    setSelectedTaskForModal(null);
  };

  // Calendar view handlers
  const handleEditTask = (task: Task) => {
    setSelectedTaskForModal(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = {
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'main',
        due_date: taskData.dueDate || null,
        assigned_to: user?.id || null
      };
      
      console.log('Creating task with data:', newTask);
      await createTaskMutation.mutateAsync(newTask);
      toast({
        title: "Task created",
        description: "New task has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'due-today':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'upcoming':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
      case 'blocked':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'medium':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      default:
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (showFilterDropdown && !target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
      
      if (showViewDropdown && !target.closest('.view-dropdown-container')) {
        setShowViewDropdown(false);
      }
      
      if (showContextMenu && !target.closest('.context-menu-container')) {
        setShowContextMenu(false);
      }
      
      if (showOptionsMenu && !target.closest('.options-menu-container')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown, showViewDropdown, showContextMenu, showOptionsMenu]);

  return (
    <AdminLayout>
      <div className="h-screen text-white overflow-hidden" style={{ backgroundColor: '#252525' }}>
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Filters + AI Task Assistant */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60} className="min-h-0" style={{ backgroundColor: '#252525' }}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Task Filter Sidebar - Resizable */}
              <ResizablePanel defaultSize={35} minSize={20} maxSize={50} className="min-h-0">
                <TaskFilterSidebar
                  selectedFilter={selectedFilter}
                  selectedPriority={selectedPriority}
                  onFilterChange={(filter, priority) => {
                    setSelectedFilter(filter);
                    if (priority) setSelectedPriority(priority);
                  }}
                  taskCounts={{
                    all: filteredTasks.length,
                    urgent: filteredTasks.filter(t => t.priority === 'urgent').length,
                    high: filteredTasks.filter(t => t.priority === 'high').length,
                    medium: filteredTasks.filter(t => t.priority === 'medium').length,
                    low: filteredTasks.filter(t => t.priority === 'low').length,
                    development: filteredTasks.filter(t => t.category === 'development').length,
                    marketing: filteredTasks.filter(t => t.category === 'marketing').length,
                    design: filteredTasks.filter(t => t.category === 'design').length,
                    client: filteredTasks.filter(t => t.category === 'client').length,
                    admin: filteredTasks.filter(t => t.category === 'admin').length
                  }}
                  onAddProject={async (projectName) => {
                    try {
                      const { data: userData } = await supabase.auth.getUser();
                      if (!userData?.user) {
                        toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
                        return;
                      }

                      const { data, error } = await supabase
                        .from('projects')
                        .insert({
                          name: projectName,
                          user_id: userData.user.id,
                          status: 'active',
                          description: `Project: ${projectName}`,
                          completion_percentage: 0
                        })
                        .select()
                        .single();

                      if (error) throw error;

                      toast({ 
                        title: "Success", 
                        description: `Project "${projectName}" created successfully!` 
                      });
                      
                      // Refresh tasks or update state as needed
                      refreshTasks();
                    } catch (error) {
                      console.error('Error creating project:', error);
                      toast({ 
                        title: "Error", 
                        description: "Failed to create project", 
                        variant: "destructive" 
                      });
                    }
                  }}
                />
              </ResizablePanel>

              {/* Resizable Handle between Filter and Chat */}
              <ResizableHandle className="bg-gray-700 hover:bg-orange-500 transition-colors duration-200" />
              
              {/* AI Chat - Right Side of Left Panel */}
              <ResizablePanel defaultSize={65} minSize={50} maxSize={80} className="min-h-0">
                <div className="h-full">
                {isAIEnabled ? (
                  <AITaskChat
                    tasks={tasks}
                    chatMessages={chatMessages}
                    onTasksUpdate={(updatedTasks) => console.log('Tasks updated:', updatedTasks)}
                    onChatUpdate={setChatMessages}
                    onTaskRefresh={refetchTasks}
                  />
                ) : (
              <div className="h-full flex flex-col" style={{ backgroundColor: '#252525' }}>
                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                  {chatMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                          <div className="w-16 h-16 border-2 border-orange-500/30 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-sm shadow-lg">
                            <div className="w-8 h-8 border-l-2 border-t-2 border-orange-400 transform rotate-45"></div>
                          </div>
                        </div>
                        <h2 className="text-2xl text-white mb-8 font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          What can I help with?
                        </h2>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      <div className="space-y-6">
                        {chatMessages.map((message, index) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-end gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                              {/* Avatar/Logo */}
                              <div className="flex-shrink-0 mb-1">
                                {message.sender === 'user' ? (
                                  <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-orange-500/30 shadow-lg">
                                    <img 
                                      src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                                      alt="SISO" 
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
                                    <div className="w-5 h-5 border-l-2 border-t-2 border-orange-400 transform rotate-45"></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Message Bubble */}
                              <div className={`relative p-4 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl ${
                                message.sender === 'user' 
                                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/20' 
                                  : 'bg-gray-800/80 text-gray-100 border border-gray-700/50 shadow-gray-900/20'
                              }`}>
                                <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                                <p className="text-xs opacity-70 mt-2 font-medium">
                                  {message.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Chat Input with Background */}
                <div className="p-4 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
                  {/* Background behind input box - simplified approach */}
                  <div className="bg-red-500 rounded-3xl p-4">
                    <PromptInputBox 
                      onSend={(message, files) => sendMessage(message)} 
                      placeholder="Message SISO..." 
                      className="shadow-xl backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle className="bg-gray-700 hover:bg-orange-500 transition-colors duration-200" />

          {/* Right Panel - Tasks Section */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="h-full p-4 flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col w-full max-w-4xl h-[calc(100vh-2rem)] mx-4">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-black">SISO AGENCY</h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Task Count Pill */}
                <div className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                  {completedTasks.length} completed, {activeTasks.length} active
                </div>
                
                {/* Project Context Icon */}
                <div className="relative context-menu-container">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowContextMenu(!showContextMenu)}
                    className="text-black hover:bg-gray-100 px-2 py-2 h-8"
                    title="Project Context"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  
                  {showContextMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Project Context</p>
                        <p className="text-xs text-gray-500">Select active project</p>
                      </div>
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            setSelectedProject('siso-agency');
                            setShowProjectContextCard(true);
                            setShowContextMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-800"
                        >
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">SISO Agency App</span>
                          <span className="ml-auto text-orange-500 text-lg">●</span>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedProject('ubahcrypt');
                            setShowProjectContextCard(true);
                            setShowContextMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-800"
                        >
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="font-medium">Ubahcrypt</span>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedProject('excursions');
                            setShowProjectContextCard(true);
                            setShowContextMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-800"
                        >
                          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                          <span className="font-medium">We Are Excursions</span>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedProject('instagram');
                            setShowProjectContextCard(true);
                            setShowContextMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-800"
                        >
                          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                          <span className="font-medium">Instagram Marketing</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Three Dots Menu */}
                <div className="relative options-menu-container">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="text-black hover:bg-gray-100 px-2 py-2 h-8"
                    title="More Options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  
                  {showOptionsMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px] overflow-hidden">
                      <button 
                        onClick={() => {
                          setShowCompletedTasks(!showCompletedTasks);
                          setShowOptionsMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-800"
                      >
                        {showCompletedTasks ? (
                          <>
                            <EyeOff className="h-4 w-4 text-gray-700" />
                            <span className="font-medium">Hide Completed</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 text-gray-700" />
                            <span className="font-medium">Show Completed ({completedTasks.length})</span>
                          </>
                        )}
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-800">
                        <Archive className="h-4 w-4 text-gray-700" />
                        <span className="font-medium">Archive Tasks</span>
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-800">
                        <BarChart3 className="h-4 w-4 text-gray-700" />
                        <span className="font-medium">Task Analytics</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Add Task Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCreateTask({ title: 'New Task', priority: 'medium', category: 'admin' })}
                  className="text-black hover:bg-gray-100 px-2 py-2 h-8"
                  title="Add Task"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="flex-1 overflow-hidden min-h-0 flex" style={{ backgroundColor: '#252525' }}>
              {/* Tasks List Area */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {/* Today's Tasks Card */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-sm font-medium">
                      <span className="text-gray-400">SISO AGENCY</span>
                      <span className="text-white"> / {(() => {
                        if (selectedFilter === 'all') return 'ALL TASKS';
                        if (selectedFilter === 'high') return 'HIGH PRIORITY';
                        if (selectedFilter === 'medium') return 'MEDIUM PRIORITY';
                        if (selectedFilter === 'low') return 'LOW PRIORITY';
                        if (selectedFilter === 'overdue') return 'OVERDUE';
                        if (selectedFilter === 'due-today') return 'DUE TODAY';
                        if (selectedFilter === 'development') return 'DEVELOPMENT';
                        if (selectedFilter === 'design') return 'DESIGN';
                        if (selectedFilter === 'marketing') return 'MARKETING';
                        if (selectedFilter === 'client') return 'CLIENT';
                        if (selectedFilter === 'admin') return 'ADMIN';
                        return selectedFilter.toUpperCase();
                      })()}</span>
                    </h2>
                    
                    {/* View Dropdown */}
                    <div className="relative view-dropdown-container">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowViewDropdown(!showViewDropdown)}
                        className="text-xs px-3 py-1 bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 shadow-sm"
                      >
                        <span className="mr-2">
                          {currentView === 'list' && <List className="h-3 w-3" />}
                          {currentView === 'calendar' && <Calendar className="h-3 w-3" />}
                          {currentView === 'kanban' && <Grid className="h-3 w-3" />}
                        </span>
                        {currentView === 'list' && 'LIST VIEW'}
                        {currentView === 'calendar' && 'CALENDAR VIEW'}
                        {currentView === 'kanban' && 'KANBAN VIEW'}
                        <ChevronDown className="h-3 w-3 ml-2" />
                      </Button>
                      
                      {showViewDropdown && (
                        <div className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden">
                          <button
                            onClick={() => {
                              setCurrentView('list');
                              setShowViewDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center gap-3 transition-colors text-gray-300"
                          >
                            <List className="h-4 w-4 text-gray-400" />
                            <span>List View</span>
                            {currentView === 'list' && <span className="ml-auto text-orange-500">●</span>}
                          </button>
                          <button
                            onClick={() => {
                              setCurrentView('calendar');
                              setShowViewDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center gap-3 transition-colors text-gray-300"
                          >
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Calendar View</span>
                            {currentView === 'calendar' && <span className="ml-auto text-orange-500">●</span>}
                          </button>
                          <button
                            onClick={() => {
                              setCurrentView('kanban');
                              setShowViewDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center gap-3 transition-colors text-gray-300"
                          >
                            <Grid className="h-4 w-4 text-gray-400" />
                            <span>Kanban View</span>
                            {currentView === 'kanban' && <span className="ml-auto text-orange-500">●</span>}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Add your today's tasks card component here */}
                  </div>
                </div>
                
                {/* Task Items Container with better padding */}
                <div className="px-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="ml-3 text-white">Loading tasks...</span>
                    </div>
                  ) : (
                    <>
                      {currentView === 'list' && activeTasks.map((task, index) => (
                      <EnhancedTaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onEdit={openEditTask}
                        onSubtaskToggle={toggleSubtask}
                        onDateChange={handleDateChange}
                        showSubtasksOnHover={true}
                        isLast={index === activeTasks.length - 1}
                      />
                    ))}
                  </>
                )}
                
                {currentView === 'kanban' && (
                  <KanbanBoard
                    tasks={activeTasks}
                    onTaskToggle={toggleTask}
                    onTaskEdit={openEditTask}
                    onTaskStatusUpdate={updateTaskStatus}
                    onTaskCreate={async (taskData) => {
                      try {
                        // Map admin task format to database format
                        const dbTask = {
                          title: taskData.title || 'New Task',
                          description: taskData.description || '',
                          status: taskData.status === 'not-started' ? 'pending' : 
                                  taskData.status === 'in-progress' ? 'in_progress' : 
                                  taskData.status === 'done' ? 'completed' : 'pending',
                          priority: taskData.priority || 'medium',
                          category: taskData.category === 'development' ? 'siso_app_dev' :
                                   taskData.category === 'marketing' ? 'instagram' :
                                   taskData.category === 'design' ? 'siso_app_dev' :
                                   taskData.category === 'client' ? 'main' : 'main',
                          assigned_to: user?.id,
                          due_date: taskData.dueDate,
                          duration: (taskData.estimatedHours || 1) * 60 // Convert hours to minutes
                        };
                        
                        await createTaskMutation.mutateAsync(dbTask);
                        
                        toast({
                          title: 'Task created',
                          description: 'New task has been created successfully.'
                        });
                      } catch (error) {
                        console.error('Error creating task:', error);
                        toast({
                          variant: 'destructive',
                          title: 'Creation failed',
                          description: error instanceof Error ? error.message : 'Could not create task.'
                        });
                      }
                    }}
                    onTaskDelete={async (taskId) => {
                      try {
                        await deleteTaskMutation.mutateAsync(taskId);
                        
                        toast({
                          title: 'Task deleted',
                          description: 'Task has been deleted successfully.'
                        });
                      } catch (error) {
                        console.error('Error deleting task:', error);
                        toast({
                          variant: 'destructive',
                          title: 'Deletion failed',
                          description: error instanceof Error ? error.message : 'Could not delete task.'
                        });
                      }
                    }}
                    onTaskDuplicate={async (task) => {
                      try {
                        // Create a duplicate task
                        const duplicateTask = {
                          title: `${task.title} (Copy)`,
                          description: task.description || '',
                          status: 'pending',
                          priority: task.priority,
                          category: task.category === 'development' ? 'siso_app_dev' :
                                   task.category === 'marketing' ? 'instagram' :
                                   task.category === 'design' ? 'siso_app_dev' :
                                   task.category === 'client' ? 'main' : 'main',
                          assigned_to: user?.id,
                          due_date: task.dueDate,
                          duration: (task.estimatedHours || 1) * 60
                        };
                        
                        await createTaskMutation.mutateAsync(duplicateTask);
                        
                        toast({
                          title: 'Task duplicated',
                          description: 'Task has been duplicated successfully.'
                        });
                      } catch (error) {
                        console.error('Error duplicating task:', error);
                        toast({
                          variant: 'destructive',
                          title: 'Duplication failed',
                          description: error instanceof Error ? error.message : 'Could not duplicate task.'
                        });
                      }
                    }}
                    selectedFilter={selectedFilter}
                    selectedPriority={selectedPriority}
                    onFilterChange={setSelectedFilter}
                    onPriorityChange={setSelectedPriority}
                    filterCategories={filterCategories}
                  />
                )}
                
                {currentView === 'calendar' && (
                  <CalendarView
                    tasks={filteredTasks}
                    onTaskEdit={handleEditTask}
                    onTaskCreate={handleCreateTask}
                    onTaskDelete={handleDeleteTask}
                    selectedFilter={selectedFilter}
                    selectedPriority={selectedPriority}
                    onFilterChange={setSelectedFilter}
                    onPriorityChange={setSelectedPriority}
                    filterCategories={filterCategories}
                  />
                )}
                </div>
              </div>
            </div>

            {/* Completed Tasks Toggle Section */}
            <div className="flex-shrink-0 border-t border-white/20" style={{ backgroundColor: '#252525' }}>
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <button 
                  onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                  className="flex items-center gap-2 text-sm text-green-300 hover:text-green-200 transition-colors"
                  data-toggle-completed-tasks
                >
                  {showCompletedTasks ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hide Completed Tasks</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Show Completed Tasks ({completedTasks.length})</span>
                    </>
                  )}
                </button>
                
                <div className="text-xs text-gray-400">
                  <span className="text-orange-300 font-medium">{activeTasks.length}</span> active, 
                  <span className="text-green-300 font-medium ml-1">{completedTasks.length}</span> completed
                </div>
              </div>
            </div>

            {/* Completed Tasks List */}
            {showCompletedTasks && (
              <div className="flex-shrink-0 border-t border-white/20" style={{ backgroundColor: '#1a1a1a' }} data-completed-tasks-section>
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Completed Tasks</h3>
                  <div className="space-y-2">
                    {completedTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                        <p className="text-gray-400">No completed tasks yet</p>
                        <p className="text-gray-500 text-sm mt-1">Complete some tasks to see them here!</p>
                      </div>
                    ) : (
                      completedTasks.map((task, index) => (
                        <EnhancedTaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          onSubtaskToggle={toggleSubtask}
                          onDateChange={handleDateChange}
                          showSubtasksOnHover={true}
                          isLast={index === completedTasks.length - 1}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Task Detail Modal */}
        <AdminTaskDetailModal
          task={selectedTaskForModal}
          isOpen={isTaskModalOpen}
          onClose={handleTaskModalClose}
          onSave={handleTaskModalSave}
          onSubtaskToggle={toggleSubtask}
        />

        {/* Project Context Card Overlay */}
        {showProjectContextCard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedProject === 'siso-agency' ? 'SISO Agency App' : 
                       selectedProject === 'ubahcrypt' ? 'Ubahcrypt' :
                       selectedProject === 'excursions' ? 'We Are Excursions' :
                       selectedProject === 'instagram' ? 'Instagram Marketing' : 'Project'} Context
                    </h2>
                    <p className="text-white/80 text-sm">Set context for AI assistance</p>
                  </div>
                  <button
                    onClick={() => setShowProjectContextCard(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Project Information
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Provide context about your current project to help the AI assistant understand your work better.
                    </p>
                  </div>

                  <div>
                    <textarea
                      value={getCurrentProjectContext()}
                      onChange={(e) => saveProjectContext(selectedProject, e.target.value)}
                      placeholder="Describe your project, goals, constraints, current status, tech stack, or any other relevant context..."
                      className="w-full h-40 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {getCurrentProjectContext().length}/1000 characters
                    </div>
                    <div className="flex gap-3">
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <span>✓</span>
                        Auto-saved
                      </div>
                      <button
                        onClick={() => setShowProjectContextCard(false)}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all duration-200 font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTasks;