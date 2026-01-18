import { useState, useEffect, useCallback } from 'react';
import { useAuthSession } from '@/lib/hooks/auth/useAuthSession';
import { useToast } from '@/components/ui/use-toast';
import { useTasks } from '@/tasks';
import { useTaskOperations } from '@/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD';

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

export interface UseAdminTasksReturn {
  // View state
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  
  // Task selection state
  selectedTaskForDate: string | null;
  setSelectedTaskForDate: (id: string | null) => void;
  selectedTaskForEdit: string | null;
  setSelectedTaskForEdit: (id: string | null) => void;
  selectedTaskForModal: Task | null;
  setSelectedTaskForModal: (task: Task | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  
  // Filter state
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  
  // Dropdown state
  showFilterDropdown: boolean;
  setShowFilterDropdown: (show: boolean) => void;
  showViewDropdown: boolean;
  setShowViewDropdown: (show: boolean) => void;
  showContextMenu: boolean;
  setShowContextMenu: (show: boolean) => void;
  showOptionsMenu: boolean;
  setShowOptionsMenu: (show: boolean) => void;
  
  // Project context state
  showProjectContextCard: boolean;
  setShowProjectContextCard: (show: boolean) => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  projectContexts: { [key: string]: string };
  
  // Calendar state
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  
  // Chat state
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  
  // AI state
  isAIEnabled: boolean;
  setIsAIEnabled: (enabled: boolean) => void;
  
  // Task data and operations
  tasks: Task[];
  filteredTasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  allActiveTasks: Task[];
  allCompletedTasks: Task[];
  isLoading: boolean;
  error: any;
  
  // Task operations
  toggleTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => Promise<void>;
  handleCreateTask: (taskData: Partial<Task>) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleEditTask: (task: Task) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  handleDateChange: (taskId: string, date: Date | undefined) => void;
  openEditTask: (task: Task) => void;
  handleTaskModalSave: (updatedTask: Task) => void;
  handleTaskModalClose: () => void;
  sendMessage: (message: string) => void;
  
  // Project context operations
  saveProjectContext: (projectKey: string, context: string) => void;
  getCurrentProjectContext: () => string;
  
  // Filter categories and options
  filterCategories: any;
  priorityOptions: any;
  getCurrentFilterOption: () => any;
  
  // Mutations
  updateTaskMutation: any;
  createTaskMutation: any;
  deleteTaskMutation: any;
  refetchTasks: () => void;
}

const useAdminTasks = (): UseAdminTasksReturn => {
  // View state
  const [currentView, setCurrentView] = useState<ViewType>('list');
  
  // Task selection state
  const [selectedTaskForDate, setSelectedTaskForDate] = useState<string | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<string | null>(null);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  
  // Dropdown state
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  // Project context state
  const [showProjectContextCard, setShowProjectContextCard] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectContexts, setProjectContexts] = useState<{ [key: string]: string }>({
    'siso-agency': '',
    'ubahcrypt': '',
    'excursions': '',
    'instagram': ''
  });
  
  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // AI state
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  
  // External hooks
  const { user } = useAuthSession();
  const { toast } = useToast();
  
  // Task management hooks
  const { useTaskQuery, useUpdateTask } = useTasks();
  const { useCreateTask, useDeleteTask } = useTaskOperations();
  const { data: dbTasks = [], isLoading, error, refetch: refetchTasks } = useTaskQuery(undefined, user?.id);
  const updateTaskMutation = useUpdateTask();
  const createTaskMutation = useCreateTask();
  const deleteTaskMutation = useDeleteTask();
  
  // Load project contexts from localStorage on component mount
  useEffect(() => {
    const savedContexts = localStorage.getItem('projectContexts');
    if (savedContexts) {
      setProjectContexts(JSON.parse(savedContexts));
    }
  }, []);
  
  // Filter categories
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
  
  // Priority options
  const priorityOptions = [
    { value: 'all', label: 'All Priorities', icon: '📊' },
    { value: 'urgent', label: 'Urgent', icon: '🔥' },
    { value: 'high', label: 'High', icon: '🟠' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'low', label: 'Low', icon: '🟢' },
    { value: 'backlog', label: 'Backlog', icon: '📥' }
  ];
  
  // Convert database task to admin task format
  const convertDbTaskToAdminTask = useCallback((dbTask: any): Task => {
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
  }, []);
  
  // Convert database tasks to admin task format
  const tasks = dbTasks.length > 0 ? dbTasks.map(convertDbTaskToAdminTask) : [];
  
  // Filter tasks based on selected filter and priority
  const getFilteredTasks = useCallback(() => {
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
        // Project filters
        const projectFilters: { [key: string]: { 
          categories: string[], 
          strictTitleKeywords: string[],
          excludeKeywords?: string[]
        } } = {
          'ubahcrypt': {
            categories: [],
            strictTitleKeywords: ['ubahcrypt', 'uber', 'crypt', 'crypto'],
            excludeKeywords: ['excursion', 'siso', 'partnership', 'instagram']
          },
          'siso-agency': {
            categories: ['siso_app_dev', 'onboarding_app'],
            strictTitleKeywords: ['siso', 'agency', 'partnership'],
            excludeKeywords: ['excursion', 'crypto', 'instagram', 'birthday', 'reset']
          },
          'excursions': {
            categories: [],
            strictTitleKeywords: ['excursion', 'birthday', 'reset workshop'],
            excludeKeywords: ['siso', 'crypto', 'partnership', 'instagram']
          },
          'instagram': {
            categories: ['instagram'],
            strictTitleKeywords: ['instagram', 'social'],
            excludeKeywords: ['excursion', 'crypto', 'siso', 'birthday', 'reset']
          },
          'siso-life': {
            categories: [],
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
            
            // Priority 1: Category match
            const categoryMatch = filterConfig.categories.length > 0 && 
              filterConfig.categories.includes(taskCategory);
            
            // Priority 2: Title matching
            const titleMatch = filterConfig.strictTitleKeywords.some(keyword => {
              return taskTitle.includes(keyword.toLowerCase());
            });
            
            return categoryMatch || titleMatch;
          });
        } else {
          filteredTasks = [];
        }
      }
    }
    
    // Apply priority sub-filter
    if (selectedPriority !== 'all' && !['urgent', 'high', 'medium', 'low'].includes(selectedFilter)) {
      filteredTasks = filteredTasks.filter(task => task.priority === selectedPriority);
    }
    
    return filteredTasks;
  }, [tasks, selectedFilter, selectedPriority]);
  
  const filteredTasks = getFilteredTasks();
  const activeTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);
  const allActiveTasks = tasks.filter(task => !task.completed);
  const allCompletedTasks = tasks.filter(task => task.completed);
  
  // Auto-save project contexts to localStorage
  const saveProjectContext = useCallback((projectKey: string, context: string) => {
    const updatedContexts = { ...projectContexts, [projectKey]: context };
    setProjectContexts(updatedContexts);
    localStorage.setItem('projectContexts', JSON.stringify(updatedContexts));
    
    console.log(`Updated ${projectKey} context:`, context);
  }, [projectContexts]);
  
  // Get current project context
  const getCurrentProjectContext = useCallback(() => {
    return projectContexts[selectedProject] || '';
  }, [projectContexts, selectedProject]);
  
  // Get current filter option for display
  const getCurrentFilterOption = useCallback(() => {
    const allOptions = [
      ...filterCategories.general,
      ...filterCategories.priority,
      ...filterCategories.projects
    ];
    return allOptions.find(option => option.value === selectedFilter) || filterCategories.general[0];
  }, [selectedFilter, filterCategories]);
  
  // Task operations
  const toggleTask = useCallback(async (taskId: string) => {
    const task = filteredTasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    const newStatus = task.completed ? 'pending' : 'completed';
    
    try {
      const updateData = {
        id: taskId,
        status: newStatus as any,
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
  }, [filteredTasks, updateTaskMutation, toast]);
  
  const updateTaskStatus = useCallback(async (taskId: string, newStatus: Task['status']) => {
    try {
      const statusMap: { [key: string]: string } = {
        'not-started': 'pending',
        'in-progress': 'in_progress',
        'blocked': 'in_progress',
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
  }, [updateTaskMutation, toast]);
  
  const handleCreateTask = useCallback(async (taskData: Partial<Task>) => {
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
  }, [createTaskMutation, toast, user?.id]);
  
  const handleDeleteTask = useCallback(async (taskId: string) => {
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
  }, [deleteTaskMutation, toast]);
  
  const handleEditTask = useCallback((task: Task) => {
    setSelectedTaskForModal(task);
    setIsTaskModalOpen(true);
  }, []);
  
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    console.log('Toggle subtask:', taskId, subtaskId);
  }, []);
  
  const handleDateChange = useCallback((taskId: string, date: Date | undefined) => {
    console.log('Handle date change:', taskId, date);
  }, []);
  
  const openEditTask = useCallback((task: Task) => {
    setSelectedTaskForModal(task);
    setIsTaskModalOpen(true);
  }, []);
  
  const handleTaskModalSave = useCallback((updatedTask: Task) => {
    console.log('Handle task modal save:', updatedTask);
    setIsTaskModalOpen(false);
    setSelectedTaskForModal(null);
  }, []);
  
  const handleTaskModalClose = useCallback(() => {
    setIsTaskModalOpen(false);
    setSelectedTaskForModal(null);
  }, []);
  
  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
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
  }, []);
  
  // Handle error state
  useEffect(() => {
    if (error) {
      console.error('Error fetching tasks:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading tasks',
        description: 'Could not load tasks from database.'
      });
    }
  }, [error, toast]);
  
  return {
    // View state
    currentView,
    setCurrentView,
    
    // Task selection state
    selectedTaskForDate,
    setSelectedTaskForDate,
    selectedTaskForEdit,
    setSelectedTaskForEdit,
    selectedTaskForModal,
    setSelectedTaskForModal,
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    setEditingTask,
    
    // Filter state
    selectedFilter,
    setSelectedFilter,
    selectedPriority,
    setSelectedPriority,
    
    // Dropdown state
    showFilterDropdown,
    setShowFilterDropdown,
    showViewDropdown,
    setShowViewDropdown,
    showContextMenu,
    setShowContextMenu,
    showOptionsMenu,
    setShowOptionsMenu,
    
    // Project context state
    showProjectContextCard,
    setShowProjectContextCard,
    selectedProject,
    setSelectedProject,
    projectContexts,
    
    // Calendar state
    calendarDate,
    setCalendarDate,
    
    // Chat state
    chatMessages,
    setChatMessages,
    
    // AI state
    isAIEnabled,
    setIsAIEnabled,
    
    // Task data
    tasks,
    filteredTasks,
    activeTasks,
    completedTasks,
    allActiveTasks,
    allCompletedTasks,
    isLoading,
    error,
    
    // Task operations
    toggleTask,
    updateTaskStatus,
    handleCreateTask,
    handleDeleteTask,
    handleEditTask,
    toggleSubtask,
    handleDateChange,
    openEditTask,
    handleTaskModalSave,
    handleTaskModalClose,
    sendMessage,
    
    // Project context operations
    saveProjectContext,
    getCurrentProjectContext,
    
    // Filter data
    filterCategories,
    priorityOptions,
    getCurrentFilterOption,
    
    // Mutations
    updateTaskMutation,
    createTaskMutation,
    deleteTaskMutation,
    refetchTasks
  };
};

export default useAdminTasks;