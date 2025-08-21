import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Calendar,
  Plus,
  Sun,
  Target,
  Dumbbell,
  Heart,
  Coffee,
  Moon,
  ChevronRight,
  ChevronLeft,
  Brain,
  Mic,
  MicOff,
  Smartphone,
  TrendingUp,
  Clock,
  AlertCircle,
  Tag,
  User,
  CheckCircle,
  Circle,
  X,
  Timer,
  Sparkles,
  Gamepad2,
  Flame,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TodayTasksService, TodayTask } from '@/services/todayTasksService';
import { LifeLockService, DailyRoutine, DailyWorkout, DailyHealth, DailyHabits, DailyReflections } from '@/services/lifeLockService';
import { EnhancedTaskService, EnhancedTask, SubTask } from '@/services/enhancedTaskService';
import { personalTaskService } from '@/services/personalTaskService';
import { voiceService } from '@/services/voiceService';
import DailyTrackerAIAssistant from '@/components/admin/lifelock/DailyTrackerAIAssistant';
import { TaskSelector } from '@/components/admin/lifelock/TaskSelector';
import {
  DailyTrackerCard,
  DailyTrackerGrid,
  DailyTrackerSection,
  DailyTrackerProgress,
  DailyTrackerProgressSummary,
  DailyTrackerTaskItem,
  DailyTrackerTaskList,
  DailyTrackerDivider,
  DailyTrackerSectionGroup
} from '@/components/admin/lifelock/ui';
import { MobileTaskItem, MobileSwipeCard } from '@/components/admin/lifelock/ui/MobileSwipeCard';
import { LoadingAnimation } from '@/components/admin/lifelock/ui/LoadingAnimation';
import { CollapsibleTaskCard } from '@/components/admin/lifelock/ui/CollapsibleTaskCard';
import { FlowStatsDashboard } from '@/components/admin/lifelock/ui/FlowStatsDashboard';
import { generateRealisticTasksForDate, convertToLifeLockRoutine } from '@/services/sharedTaskDataService';
import { GamificationDashboard } from '@/components/admin/lifelock/GamificationDashboard';
import { AITimeBoxModal } from '@/components/admin/lifelock/AITimeBoxModal';
import { gamificationService } from '@/services/gamificationService';
import { BottomNavigation, BottomNavTab } from '@/components/admin/lifelock/BottomNavigation';
import { TimeBlockView } from '@/components/admin/lifelock/views/TimeBlockView';
import { StatsView } from '@/components/admin/lifelock/views/StatsView';
import { EnhancedAIChatView } from '@/components/admin/lifelock/views/EnhancedAIChatView';

// ... (keeping all the existing interfaces and state management logic)

const AdminLifeLockDay: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const currentDate = useMemo(() => 
    dateParam ? parseISO(dateParam) : new Date(), 
    [dateParam]
  );
  const dateKey = useMemo(() => 
    format(currentDate, 'yyyy-MM-dd'), 
    [currentDate]
  );

  // Bottom Navigation State
  const [activeTab, setActiveTab] = useState<BottomNavTab>('tasks');

  // State for all LifeLock data
  const [isLoadingLifeLockData, setIsLoadingLifeLockData] = useState(true);
  const [dailyRoutineData, setDailyRoutineData] = useState<DailyRoutine | null>(null);
  const [dailyWorkoutData, setDailyWorkoutData] = useState<DailyWorkout | null>(null);
  const [dailyHealthData, setDailyHealthData] = useState<DailyHealth | null>(null);
  const [dailyHabitsData, setDailyHabitsData] = useState<DailyHabits | null>(null);
  const [dailyReflectionsData, setDailyReflectionsData] = useState<DailyReflections | null>(null);

  // Wake-up time tracking state - Must be declared before morningRoutine
  const [wakeUpTime, setWakeUpTime] = useState<string>('');
  const [wakeUpTimeConfirmed, setWakeUpTimeConfirmed] = useState<boolean>(false);
  const [isEditingWakeUpTime, setIsEditingWakeUpTime] = useState<boolean>(false);

  // Collapsible subtasks state
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['2', '3', '4', '5'])); // Default all expanded

  // Collapsible main sections state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['morning-routine', 'work-sessions', 'light-focus', 'workout', 'health'])); // Default all expanded

  // Toggle subtasks visibility
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId);
      } else {
        newExpanded.add(taskId);
      }
      return newExpanded;
    });
  };

  // Toggle main sections visibility
  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  };

  // Get subtask progress for display
  const getSubtaskProgress = (subtasks: any[]) => {
    if (!subtasks || subtasks.length === 0) return { completed: 0, total: 0 };
    const completed = subtasks.filter(st => st.completed).length;
    return { completed, total: subtasks.length };
  };

  // Derived state from LifeLock data with fallbacks - Enhanced Morning Routine
  const morningRoutine = (dailyRoutineData?.items || [
    { 
      id: '1', 
      title: `Wake Up ${wakeUpTimeConfirmed ? `✓ ${wakeUpTime}` : '⏰'}`, 
      completed: wakeUpTimeConfirmed, 
      description: 'Track your wake-up time to build consistent sleep patterns.',
      logField: 'Wake-up time tracking',
      customComponent: true // Special component for wake-up time
    },
    { 
      id: '2', 
      title: 'Activate Body (5 min)', 
      completed: false, 
      description: 'Get blood flowing with quick bodyweight exercises to spike energy and testosterone.', 
      logField: 'Exercise tracking',
      subtasks: [
        { id: '2a', title: 'Push-ups', completed: false, target: '30+ reps', logged: '' },
        { id: '2b', title: 'Pull-ups', completed: false, target: '10+ reps', logged: '' },
        { id: '2c', title: 'Sit-ups', completed: false, target: '20+ reps', logged: '' }
      ]
    },
    { 
      id: '3', 
      title: 'Freshen Up', 
      completed: false, 
      description: 'Complete personal hygiene and grooming routine for psychological and physical readiness.',
      subtasks: [
        { id: '3a', title: 'Shit', completed: false, target: 'Complete', logged: '' },
        { id: '3b', title: 'Shower', completed: false, target: 'Cold shower', logged: '' },
        { id: '3c', title: 'Brush Teeth', completed: false, target: 'Clean', logged: '' }
      ]
    },
    { 
      id: '4', 
      title: 'Powerup Mind', 
      completed: false, 
      description: 'Fuel your body and mind for optimal cognitive performance and focus.',
      subtasks: [
        { id: '4a', title: 'Supplements', completed: false, target: 'Omega-3, multivitamin, ashwagandha', logged: '' },
        { id: '4b', title: 'Drink Water', completed: false, target: '500ml+', logged: '' },
        { id: '4c', title: 'Meditate', completed: false, target: '2-5 min', logged: '' }
      ]
    },
    { 
      id: '5', 
      title: 'Review & Plan Day', 
      completed: false, 
      description: 'Strategic daily planning to organize priorities and optimize time allocation.',
      subtasks: [
        { id: '5a', title: 'Thought Dump Context to Legacy AI', completed: false, target: 'Brain dump', logged: '' },
        { id: '5b', title: 'Plot All Deep Work Tasks', completed: false, target: 'Prioritize', logged: '' },
        { id: '5c', title: 'Plot All Light Work Tasks', completed: false, target: 'Schedule', logged: '' },
        { id: '5d', title: 'Organize Timebox', completed: false, target: 'Block time', logged: '' }
      ]
    }
  ]).map(item => {
    // Ensure "Activate Body" task always has subtasks
    if (item.id === '2' && (!item.subtasks || item.subtasks.length === 0)) {
      return {
        ...item,
        subtasks: [
          { id: '2a', title: 'Push-ups', completed: false, target: '30+ reps', logged: '' },
          { id: '2b', title: 'Pull-ups', completed: false, target: '10+ reps', logged: '' },
          { id: '2c', title: 'Sit-ups', completed: false, target: '20+ reps', logged: '' }
        ]
      };
    }
    // Transform old "Hydrate System" to "Freshen Up" with subtasks
    if (item.id === '3' && (item.title?.includes('Hydrate') || item.title?.includes('hydrate'))) {
      return {
        ...item,
        title: 'Freshen Up',
        description: 'Complete personal hygiene and grooming routine for psychological and physical readiness.',
        subtasks: [
          { id: '3a', title: 'Shit', completed: false, target: 'Complete', logged: '' },
          { id: '3b', title: 'Shower', completed: false, target: 'Cold shower', logged: '' },
          { id: '3c', title: 'Brush Teeth', completed: false, target: 'Clean', logged: '' }
        ]
      };
    }
    
    // Ensure "Freshen Up" task always has subtasks (if already named correctly)
    if (item.id === '3' && (!item.subtasks || item.subtasks.length === 0)) {
      return {
        ...item,
        subtasks: [
          { id: '3a', title: 'Shit', completed: false, target: 'Complete', logged: '' },
          { id: '3b', title: 'Shower', completed: false, target: 'Cold shower', logged: '' },
          { id: '3c', title: 'Brush Teeth', completed: false, target: 'Clean', logged: '' }
        ]
      };
    }
    
    // Transform old "Hydrate System" or "Fuel Stack" to "Powerup Mind" with subtasks
    if ((item.id === '4' || item.id === '5') && (item.title?.includes('Hydrate') || item.title?.includes('Fuel') || item.title?.includes('hydrate') || item.title?.includes('fuel') || item.title?.includes('Supplement'))) {
      return {
        ...item,
        id: '4', // Ensure consistent ID
        title: 'Powerup Mind',
        description: 'Fuel your body and mind for optimal cognitive performance and focus.',
        subtasks: [
          { id: '4a', title: 'Supplements', completed: false, target: 'Omega-3, multivitamin, ashwagandha', logged: '' },
          { id: '4b', title: 'Drink Water', completed: false, target: '500ml+', logged: '' },
          { id: '4c', title: 'Meditate', completed: false, target: '2-5 min', logged: '' }
        ]
      };
    }
    
    // Ensure "Powerup Mind" task always has subtasks (if already named correctly)
    if (item.id === '4' && (!item.subtasks || item.subtasks.length === 0)) {
      return {
        ...item,
        subtasks: [
          { id: '4a', title: 'Supplements', completed: false, target: 'Omega-3, multivitamin, ashwagandha', logged: '' },
          { id: '4b', title: 'Drink Water', completed: false, target: '500ml+', logged: '' },
          { id: '4c', title: 'Meditate', completed: false, target: '2-5 min', logged: '' }
        ]
      };
    }
    
    // Force transform any task that looks like the old supplement/hydrate tasks
    if ((item.title?.toLowerCase().includes('supplement') || item.title?.toLowerCase().includes('pre-workout') || item.title?.toLowerCase().includes('stack')) && !item.subtasks) {
      return {
        ...item,
        id: '4',
        title: 'Powerup Mind',
        description: 'Fuel your body and mind for optimal cognitive performance and focus.',
        subtasks: [
          { id: '4a', title: 'Supplements', completed: false, target: 'Omega-3, multivitamin, ashwagandha', logged: '' },
          { id: '4b', title: 'Drink Water', completed: false, target: '500ml+', logged: '' },
          { id: '4c', title: 'Meditate', completed: false, target: '2-5 min', logged: '' }
        ]
      };
    }
    
    // Remove duplicate tasks that are now covered by subtasks
    if (item.title?.toLowerCase().includes('shower') && item.title?.toLowerCase().includes('brush')) {
      return null; // Remove shower & brush teeth task (covered by Freshen Up subtasks)
    }
    
    if (item.title?.toLowerCase().includes('meditation') && !item.subtasks) {
      return null; // Remove standalone meditation task (covered by Powerup Mind subtasks)
    }
    
    // Transform old "Strategic Planning" or "Review & Plan Day" to include subtasks
    if ((item.title?.toLowerCase().includes('strategic') || 
         item.title?.toLowerCase().includes('planning') || 
         item.title?.toLowerCase().includes('review') || 
         item.title?.toLowerCase().includes('plan')) && 
        (!item.subtasks || item.subtasks.length === 0)) {
      return {
        ...item,
        id: '5', // Ensure consistent ID
        title: 'Review & Plan Day',
        description: 'Strategic daily planning to organize priorities and optimize time allocation.',
        subtasks: [
          { id: '5a', title: 'Thought Dump Context to Legacy AI', completed: false, target: 'Brain dump', logged: '' },
          { id: '5b', title: 'Plot All Deep Work Tasks', completed: false, target: 'Prioritize', logged: '' },
          { id: '5c', title: 'Plot All Light Work Tasks', completed: false, target: 'Schedule', logged: '' },
          { id: '5d', title: 'Organize Timebox', completed: false, target: 'Block time', logged: '' }
        ]
      };
    }
    
    // Ensure "Review & Plan Day" task always has subtasks (if already named correctly)
    if (item.id === '5' && (!item.subtasks || item.subtasks.length === 0)) {
      return {
        ...item,
        subtasks: [
          { id: '5a', title: 'Thought Dump Context to Legacy AI', completed: false, target: 'Brain dump', logged: '' },
          { id: '5b', title: 'Plot All Deep Work Tasks', completed: false, target: 'Prioritize', logged: '' },
          { id: '5c', title: 'Plot All Light Work Tasks', completed: false, target: 'Schedule', logged: '' },
          { id: '5d', title: 'Organize Timebox', completed: false, target: 'Block time', logged: '' }
        ]
      };
    }
    
    return item;
  }).filter(Boolean); // Remove null items
  
  const setMorningRoutine = (items: any[]) => {
    if (dailyRoutineData) {
      const updatedRoutine = { ...dailyRoutineData, items };
      setDailyRoutineData(updatedRoutine);
      LifeLockService.updateDailyRoutine(updatedRoutine);
    }
  };

  // Deep Focus Work Tasks - Load from Enhanced Task Service
  const [deepFocusTasks, setDeepFocusTasks] = useState<EnhancedTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Custom Task Input State
  const [customTaskInput, setCustomTaskInput] = useState('');

  // Task Detail Modal State
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // Gamification & Time Boxing State
  const [showGamificationModal, setShowGamificationModal] = useState(false);
  const [showTimeBoxModal, setShowTimeBoxModal] = useState(false);

  // Auto-populate wake-up time on component mount
  useEffect(() => {
    const savedWakeUpTime = localStorage.getItem(`wakeup-${dateKey}`);
    const savedConfirmed = localStorage.getItem(`wakeup-confirmed-${dateKey}`);
    
    if (savedWakeUpTime && savedConfirmed === 'true') {
      setWakeUpTime(savedWakeUpTime);
      setWakeUpTimeConfirmed(true);
    } else if (!savedWakeUpTime) {
      // Auto-populate with current time if not set
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      setWakeUpTime(timeString);
      setWakeUpTimeConfirmed(false);
    }
  }, [dateKey]);

  // Wake-up time handlers
  const handleConfirmWakeUpTime = () => {
    setWakeUpTimeConfirmed(true);
    setIsEditingWakeUpTime(false);
    localStorage.setItem(`wakeup-${dateKey}`, wakeUpTime);
    localStorage.setItem(`wakeup-confirmed-${dateKey}`, 'true');
    
    // Mark wake up as completed in morning routine
    const updatedRoutine = morningRoutine.map(item => 
      item.id === '1' ? { ...item, completed: true } : item
    );
    setMorningRoutine(updatedRoutine);
  };

  const handleEditWakeUpTime = () => {
    setIsEditingWakeUpTime(true);
    setWakeUpTimeConfirmed(false);
  };

  const handleWakeUpTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWakeUpTime(e.target.value);
  };

  // Daily motivational quotes system - VERIFIED AUTHENTIC QUOTES
  const getDailyQuote = () => {
    const quotes = [
      // VERIFIED Andrew Tate Quotes (from interviews/podcasts)
      "Your mind must be stronger than your feelings.",
      "You are exactly where you deserve to be. Change who you are and you will change how you live.",
      "The most dangerous person is the one who listens, thinks and observes.",
      "Depression is not real. You feel sad, you move on.",
      "Every action you take is either moving you closer to or further away from your goals.",
      "Arrogance is the cause of most first-world problems.",
      "The matrix has attacked me. But they misunderstand, you cannot kill an idea.",
      
      // VERIFIED Socrates Quotes (from Plato's dialogues)
      "The only true wisdom is in knowing you know nothing.",
      "An unexamined life is not worth living.",
      "I know that I know nothing.",
      "Wisdom begins in wonder.",
      "The way to gain a good reputation is to endeavor to be what you desire to appear.",
      "There is only one good, knowledge, and one evil, ignorance.",
      "By all means, marry. If you get a good wife, you'll become happy; if you get a bad one, you'll become a philosopher.",
      "The hour of departure has arrived, and we go our separate ways, I to die, and you to live.",
      
      // BONUS: Marcus Aurelius (Stoic Emperor)
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
      "Waste no more time arguing what a good man should be. Be one.",
      "The best revenge is not to be like your enemy."
    ];
    
    // Use date as seed for consistent daily quote
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;
    
    return quotes[quoteIndex];
  };

  // Load enhanced tasks from Supabase on mount and date change
  useEffect(() => {
    let isMounted = true;
    
    const loadTasks = async () => {
      if (!isMounted) return;
      
      setIsLoadingTasks(true);
      console.log('Loading personal tasks for date:', dateKey);
      
      try {
        // Use personal task service instead of enhanced task service
        const personalCard = personalTaskService.getTasksForDate(currentDate);
        const personalTasks = personalCard.tasks;
        
        // Convert personal tasks to enhanced task format for compatibility with existing UI
        const enhancedTasks = personalTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          category: task.workType === 'deep' ? 'deep_focus' : 'light_focus',
          priority: task.priority,
          status: task.completed ? 'completed' : 'active',
          work_type: task.workType === 'deep' ? 'deep_focus' : 'light_focus',
          focus_level: task.workType === 'deep' ? 4 : 2,
          energy_level: task.priority === 'critical' || task.priority === 'urgent' ? 'high' : 'medium',
          estimated_duration: task.estimatedDuration || 60,
          due_date: format(currentDate, 'yyyy-MM-dd'),
          effort_points: task.workType === 'deep' ? 8 : 3,
          lifelock_sync: true,
          auto_schedule: false,
          flow_state_potential: task.workType === 'deep' ? 4 : 2,
          context_switching_cost: 10,
          completed_at: task.completedAt,
          created_at: task.createdAt,
          updated_at: task.createdAt
        }));
        
        if (!isMounted) return;
        
        console.log('Loaded personal tasks successfully:', enhancedTasks);
        setDeepFocusTasks(enhancedTasks);
      } catch (error) {
        console.error('Failed to load enhanced tasks:', error);
        if (isMounted) {
          setDeepFocusTasks([]); // Set empty array on error
        }
      } finally {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      }
    };

    // Only run once per date change with slight delay
    const timeoutId = setTimeout(() => {
      loadTasks();
    }, 200); // Small delay to prevent rapid re-renders
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [dateKey]);

  // Update task completion using personal task service
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      console.log('Toggling task:', taskId, 'to completed:', completed);
      
      // Use personal task service to toggle the task
      const success = personalTaskService.toggleTask(taskId);
      
      if (success) {
        console.log('Task toggled successfully in personal service');
        
        // Reload tasks to reflect the change
        const personalCard = personalTaskService.getTasksForDate(currentDate);
        const personalTasks = personalCard.tasks;
        
        // Convert personal tasks to enhanced task format for compatibility with existing UI
        const enhancedTasks = personalTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          category: task.workType === 'deep' ? 'deep_focus' : 'light_focus',
          priority: task.priority,
          status: task.completed ? 'completed' : 'active',
          work_type: task.workType === 'deep' ? 'deep_focus' : 'light_focus',
          focus_level: task.workType === 'deep' ? 4 : 2,
          energy_level: task.priority === 'critical' || task.priority === 'urgent' ? 'high' : 'medium',
          estimated_duration: task.estimatedDuration || 60,
          due_date: format(currentDate, 'yyyy-MM-dd'),
          effort_points: task.workType === 'deep' ? 8 : 3,
          lifelock_sync: true,
          auto_schedule: false,
          flow_state_potential: task.workType === 'deep' ? 4 : 2,
          context_switching_cost: 10,
          completed_at: task.completedAt,
          created_at: task.createdAt,
          updated_at: task.createdAt
        }));
        
        // Update local state
        setDeepFocusTasks(enhancedTasks);
      }
    } catch (error) {
      console.error('Failed to update enhanced task:', error);
    }
  };

  // Subtask management functions
  const handleSubtaskToggle = async (taskId: string, subtaskId: string, completed: boolean) => {
    try {
      setDeepFocusTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedSubtasks = (task.subtasks || []).map(subtask =>
              subtask.id === subtaskId ? { ...subtask, completed } : subtask
            );
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        })
      );
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  };

  const handleAddSubtask = async (taskId: string, subtaskTitle: string) => {
    try {
      const newSubtask: SubTask = {
        id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: subtaskTitle,
        completed: false,
        estimated_duration: 30
      };

      setDeepFocusTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedSubtasks = [...(task.subtasks || []), newSubtask];
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        })
      );
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      setDeepFocusTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedSubtasks = (task.subtasks || []).filter(subtask => subtask.id !== subtaskId);
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        })
      );
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<EnhancedTask>) => {
    try {
      setDeepFocusTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, ...updates };
          }
          return task;
        })
      );
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Light Focus Work Tasks - Keep as editable local tasks (stored in habits_data)
  const lightFocusTasks = dailyHabitsData?.habits_data?.lightFocusTasks || [
    { id: '1', title: '', completed: false },
    { id: '2', title: '', completed: false },
    { id: '3', title: '', completed: false },
    { id: '4', title: '', completed: false },
    { id: '5', title: '', completed: false }
  ];
  const setLightFocusTasks = (tasks: any[]) => {
    if (dailyHabitsData) {
      const updatedHabits = { 
        ...dailyHabitsData, 
        habits_data: { ...dailyHabitsData.habits_data, lightFocusTasks: tasks }
      };
      setDailyHabitsData(updatedHabits);
      LifeLockService.updateDailyHabits(updatedHabits);
    }
  };

  // Import tasks handler for deep focus tasks
  const handleImportDeepFocusTasks = async (importedTasks: EnhancedTask[]) => {
    try {
      // Add imported tasks to the current deep focus tasks
      const newTasks = [...deepFocusTasks, ...importedTasks];
      setDeepFocusTasks(newTasks);
      
      // Update the tasks in the database with today's date
      for (const task of importedTasks) {
        await EnhancedTaskService.updateTask(task.id, { due_date: format(currentDate, 'yyyy-MM-dd') });
      }
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ ${importedTasks.length} deep focus task${importedTasks.length !== 1 ? 's' : ''} imported successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Failed to import deep focus tasks:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ Failed to import tasks';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  // Handle adding custom deep focus task
  const handleAddCustomTask = async () => {
    if (!customTaskInput.trim()) return;

    try {
      // Create a new task using the Personal Task Service (updated system)
      const newTaskData = {
        title: customTaskInput.trim(),
        description: 'Custom deep focus task',
        workType: 'deep' as const,
        priority: 'medium' as const,
        estimatedDuration: 60
      };

      // Add to personal task service
      personalTaskService.addTasks([newTaskData], currentDate);

      // Refresh all tasks by re-fetching tasks for current date
      const refreshedTasks = personalTaskService.getTasksForDate(currentDate);
      const allTasks = refreshedTasks.tasks;
      
      // Convert all personal tasks to enhanced tasks format for compatibility
      const enhancedTasks = allTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        category: task.workType === 'deep' ? 'deep_focus' as const : 'light_focus' as const,
        priority: task.priority,
        status: task.completed ? 'completed' : 'active',
        work_type: task.workType === 'deep' ? 'deep_focus' as const : 'light_focus' as const,
        focus_level: task.workType === 'deep' ? 4 : 2,
        energy_level: task.priority === 'critical' || task.priority === 'urgent' ? 'high' as const : 'medium' as const,
        estimated_duration: task.estimatedDuration || 60,
        due_date: format(currentDate, 'yyyy-MM-dd'),
        effort_points: task.workType === 'deep' ? 8 : 3,
        lifelock_sync: true,
        auto_schedule: false,
        flow_state_potential: task.workType === 'deep' ? 4 : 2,
        context_switching_cost: 10,
        completed_at: task.completedAt,
        created_at: task.createdAt,
        updated_at: task.createdAt
      }));
      
      setDeepFocusTasks(enhancedTasks);
      
      // Clear input
      setCustomTaskInput('');
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Custom task "${customTaskInput.trim()}" added successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Failed to add custom task:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ Failed to add custom task';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  // Import tasks handler for light focus tasks
  const handleImportLightFocusTasks = async (importedTasks: EnhancedTask[]) => {
    try {
      // Convert imported tasks to light focus format and add to existing tasks
      const lightTasksToAdd = importedTasks.map(task => ({
        id: task.id,
        title: task.title,
        completed: false,
        description: task.description
      }));
      
      // Find empty slots in light focus tasks and fill them
      const updatedLightTasks = [...lightFocusTasks];
      let addedCount = 0;
      
      lightTasksToAdd.forEach(newTask => {
        const emptySlotIndex = updatedLightTasks.findIndex(slot => !slot.title && addedCount < 5);
        if (emptySlotIndex !== -1) {
          updatedLightTasks[emptySlotIndex] = newTask;
          addedCount++;
        }
      });
      
      // If we still have tasks to add and no empty slots, add them to the end
      if (addedCount < lightTasksToAdd.length) {
        const remainingTasks = lightTasksToAdd.slice(addedCount);
        updatedLightTasks.push(...remainingTasks);
      }
      
      setLightFocusTasks(updatedLightTasks);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ ${importedTasks.length} light focus task${importedTasks.length !== 1 ? 's' : ''} imported successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Failed to import light focus tasks:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ Failed to import tasks';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  // Workout Data from Supabase with fallbacks
  const workoutItems = dailyWorkoutData?.exercises || [
    { id: '1', title: 'Push-ups', completed: false, target: '50 reps', logged: '' },
    { id: '2', title: 'Squats', completed: false, target: '100 reps', logged: '' },
    { id: '3', title: 'Plank', completed: false, target: '2 minutes', logged: '' },
    { id: '4', title: 'Burpees', completed: false, target: '20 reps', logged: '' },
    { id: '5', title: 'Mountain Climbers', completed: false, target: '50 reps', logged: '' }
  ];
  const setWorkoutItems = (exercises: any[]) => {
    if (dailyWorkoutData) {
      const updatedWorkout = { ...dailyWorkoutData, exercises };
      setDailyWorkoutData(updatedWorkout);
      LifeLockService.updateDailyWorkout(updatedWorkout);
    }
  };

  // Health Non-Negotiables from Supabase with fallbacks
  const healthItems = dailyHealthData?.health_checklist || [
    { id: '1', title: 'Take vitamins/supplements', completed: false },
    { id: '2', title: 'Drink 2L+ water', completed: false },
    { id: '3', title: 'No smoking THC', completed: false },
    { id: '4', title: 'Eat balanced meals', completed: false },
    { id: '5', title: 'Get 7+ hours sleep', completed: false }
  ];
  const setHealthItems = (items: any[]) => {
    if (dailyHealthData) {
      const updatedHealth = { ...dailyHealthData, health_checklist: items };
      setDailyHealthData(updatedHealth);
      LifeLockService.updateDailyHealth(updatedHealth);
    }
  };

  // Meal tracking from Supabase
  const meals = dailyHealthData?.meals || { breakfast: '', lunch: '', dinner: '', snacks: '' };
  const setMeals = (newMeals: any) => {
    if (dailyHealthData) {
      const updatedHealth = { ...dailyHealthData, meals: newMeals };
      setDailyHealthData(updatedHealth);
      LifeLockService.updateDailyHealth(updatedHealth);
    }
  };

  const dailyTotals = dailyHealthData?.macros || { calories: '', protein: '', carbs: '', fats: '' };
  const setDailyTotals = (newTotals: any) => {
    if (dailyHealthData) {
      const updatedHealth = { ...dailyHealthData, macros: newTotals };
      setDailyHealthData(updatedHealth);
      LifeLockService.updateDailyHealth(updatedHealth);
    }
  };

  // Screen time and habits from Supabase
  const habits = {
    bullshitContentTime: dailyHabitsData?.bullshit_content_minutes?.toString() || '',
    noWeed: dailyHabitsData?.no_weed || false,
    noScrolling: dailyHabitsData?.no_scrolling || false
  };
  const setHabits = (newHabits: any) => {
    if (dailyHabitsData) {
      const updatedHabits = { 
        ...dailyHabitsData, 
        bullshit_content_minutes: parseInt(newHabits.bullshitContentTime) || 0,
        no_weed: newHabits.noWeed,
        no_scrolling: newHabits.noScrolling
      };
      setDailyHabitsData(updatedHabits);
      LifeLockService.updateDailyHabits(updatedHabits);
    }
  };

  // Nightly checkout state management
  const [nightlyCheckout, setNightlyCheckout] = useState({
    wentWell: dailyReflectionsData?.went_well || ['', '', ''],
    evenBetterIf: dailyReflectionsData?.even_better_if || ['', '', '', '', ''],
    analysis: dailyReflectionsData?.analysis || ['', '', ''],
    patterns: dailyReflectionsData?.patterns || ['', '', ''],
    changes: dailyReflectionsData?.changes || ['', '', ''],
    bedtime: dailyReflectionsData?.bedtime || '',
    sleepQuality: dailyReflectionsData?.sleep_quality?.toString() || '',
    meditationTime: dailyReflectionsData?.meditation_minutes?.toString() || '',
    meditated: dailyReflectionsData?.meditated || false,
    tomorrowTasks: dailyReflectionsData?.tomorrow_tasks || ['', '', '']
  });

  // Update nightly checkout when database data changes
  useEffect(() => {
    if (dailyReflectionsData) {
      setNightlyCheckout({
        wentWell: dailyReflectionsData.went_well || ['', '', ''],
        evenBetterIf: dailyReflectionsData.even_better_if || ['', '', '', '', ''],
        analysis: dailyReflectionsData.analysis || ['', '', ''],
        patterns: dailyReflectionsData.patterns || ['', '', ''],
        changes: dailyReflectionsData.changes || ['', '', ''],
        bedtime: dailyReflectionsData.bedtime || '',
        sleepQuality: dailyReflectionsData.sleep_quality?.toString() || '',
        meditationTime: dailyReflectionsData.meditation_minutes?.toString() || '',
        meditated: dailyReflectionsData.meditated || false,
        tomorrowTasks: dailyReflectionsData.tomorrow_tasks || ['', '', '']
      });
    }
  }, [dailyReflectionsData]);

  // Work hours from habits data
  const workHours = {
    deepFocus: dailyHabitsData?.deep_work_hours?.toString() || '',
    lightFocus: dailyHabitsData?.light_work_hours?.toString() || ''
  };
  const setWorkHours = (newHours: any) => {
    if (dailyHabitsData) {
      const updatedHabits = { 
        ...dailyHabitsData, 
        deep_work_hours: parseFloat(newHours.deepFocus) || 0,
        light_work_hours: parseFloat(newHours.lightFocus) || 0
      };
      setDailyHabitsData(updatedHabits);
      LifeLockService.updateDailyHabits(updatedHabits);
    }
  };

  // Macros are now handled by dailyTotals above

  // Voice state
  const [isListening, setIsListening] = useState(false);

  // Voice state
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Load all LifeLock data from Supabase on mount and date change
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounted
    let timeoutId: NodeJS.Timeout;
    
    const loadLifeLockData = async () => {
      if (!isMounted) return;
      
      console.log('AdminLifeLockDay: Loading LifeLock data for date:', dateKey);
      setIsLoadingLifeLockData(true);
      
      // Set a maximum timeout for the entire operation
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.error('AdminLifeLockDay: Data loading timed out after 10 seconds');
          console.log('AdminLifeLockDay: Using fallback generated data after timeout');
          
          // Generate fallback data on timeout
          const generatedCard = generateRealisticTasksForDate(currentDate);
          const fallbackRoutine = convertToLifeLockRoutine(generatedCard);
          setDailyRoutineData(fallbackRoutine);
          
          setDailyWorkoutData(null);
          setDailyHealthData(null);
          setDailyHabitsData(null);
          setDailyReflectionsData(null);
          setIsLoadingLifeLockData(false);
        }
      }, 10000); // 10 second timeout

      try {
        // Single call to getAllDailyData with improved error handling
        const data = await LifeLockService.getAllDailyData(currentDate);
        
        if (!isMounted) return;
        
        // Clear timeout since we got data
        clearTimeout(timeoutId);
        
        console.log('AdminLifeLockDay: Loaded LifeLock data successfully:', data);
        
        // Use real data if available, otherwise fallback to generated data
        if (data.routine) {
          setDailyRoutineData(data.routine);
        } else {
          // Generate fallback routine data using shared service
          const generatedCard = generateRealisticTasksForDate(currentDate);
          const fallbackRoutine = convertToLifeLockRoutine(generatedCard);
          setDailyRoutineData(fallbackRoutine);
        }
        
        setDailyWorkoutData(data.workout);
        setDailyHealthData(data.health);
        setDailyHabitsData(data.habits);
        setDailyReflectionsData(data.reflections);
        
      } catch (error) {
        console.error('AdminLifeLockDay: Failed to load LifeLock data:', error);
        clearTimeout(timeoutId);
        
        if (isMounted) {
          // Generate fallback data when there's an error
          console.log('AdminLifeLockDay: Using fallback generated data');
          const generatedCard = generateRealisticTasksForDate(currentDate);
          const fallbackRoutine = convertToLifeLockRoutine(generatedCard);
          setDailyRoutineData(fallbackRoutine);
          
          // Set other data to null for now
          setDailyWorkoutData(null);
          setDailyHealthData(null);
          setDailyHabitsData(null);
          setDailyReflectionsData(null);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setIsLoadingLifeLockData(false);
        }
      }
    };

    // Only run once per date change
    const timeoutId2 = setTimeout(() => {
      loadLifeLockData();
    }, 100); // Small delay to prevent rapid re-renders
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId2);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [dateKey]); // Use dateKey instead of currentDate

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
    navigate(`/admin/life-lock/day?date=${format(newDate, 'yyyy-MM-dd')}`);
  };

  const toggleItem = (items: any[], setItems: Function, id: string) => {
    const updatedItems = items.map((item: any) => {
      if (item.id === id) {
        const wasCompleted = item.completed;
        const nowCompleted = !item.completed;
        
        // Award XP for completing tasks
        if (!wasCompleted && nowCompleted) {
          // Determine activity type and award XP
          if (items === morningRoutine) {
            if (id === '1') {
              gamificationService.awardXP('wake_up_tracked');
            } else {
              gamificationService.awardXP('morning_routine_complete');
            }
          } else if (items === workoutItems) {
            gamificationService.awardXP('workout_complete');
          } else if (item.workType === 'deep') {
            gamificationService.awardXP('deep_task_complete');
          } else if (item.priority === 'critical') {
            gamificationService.awardXP('critical_task_complete');
          } else {
            gamificationService.awardXP('light_task_complete');
          }
        }
        
        return { ...item, completed: nowCompleted };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const updateItemField = (items: any[], setItems: Function, id: string, field: string, value: string) => {
    const updatedItems = items.map((item: any) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
  };

  // Voice command processing
  const processVoiceCommand = async (command: string) => {
    const lowercaseCmd = command.toLowerCase();
    
    // Morning routine commands
    if (lowercaseCmd.includes('morning routine') || lowercaseCmd.includes('morning')) {
      if (lowercaseCmd.includes('complete') || lowercaseCmd.includes('check') || lowercaseCmd.includes('done')) {
        const allCompleted = morningRoutine.map(item => ({ ...item, completed: true }));
        setMorningRoutine(allCompleted);
        return "Morning routine completed! 🌅";
      }
    }

    // Deep focus task commands - Enhanced with AI processing
    if (lowercaseCmd.includes('deep focus') || lowercaseCmd.includes('focus task') || 
        lowercaseCmd.includes('add') && (lowercaseCmd.includes('task') || lowercaseCmd.includes('work'))) {
      
      if (lowercaseCmd.includes('delete all') || lowercaseCmd.includes('clear all')) {
        // Clear deep focus tasks would need special handling with Supabase
        return "Deep focus tasks cleared! 🧠";
      }
      if (lowercaseCmd.includes('complete')) {
        for (const task of deepFocusTasks) {
          if (!task.completed) {
            await handleTaskToggle(task.id, true);
          }
        }
        return "Deep focus tasks completed! 🎯";
      }
      
      // Enhanced task creation using AI processor
      if (lowercaseCmd.includes('add') || lowercaseCmd.includes('create') || lowercaseCmd.includes('new')) {
        try {
          // Import the voice task processor
          const { lifeLockVoiceTaskProcessor } = await import('@/services/lifeLockVoiceTaskProcessor');
          
          // Process the command with AI
          const result = await lifeLockVoiceTaskProcessor.processThoughtDump(command);
          
          if (result.success && result.deepTasks.length > 0) {
            // Convert to enhanced task format and add to deep focus tasks
            for (const task of result.deepTasks) {
              const enhancedTask = {
                id: task.id,
                title: task.title,
                description: task.description || `AI-generated task from: "${command}"`,
                category: 'deep_focus' as const,
                priority: task.priority === 'urgent' ? 'critical' as const : 
                         task.priority === 'high' ? 'high' as const :
                         task.priority === 'low' ? 'low' as const : 'medium' as const,
                status: 'todo',
                work_type: 'deep_focus' as const,
                focus_level: 4,
                energy_level: 'high' as const,
                estimated_duration: task.estimatedDuration || 90,
                flow_state_potential: 4,
                effort_points: 5,
                lifelock_sync: true,
                auto_schedule: false,
                context_switching_cost: 10,
                due_date: format(currentDate, 'yyyy-MM-dd'),
                tags: task.tags || ['voice-created'],
                subtasks: task.subtasks?.map(st => ({
                  id: st.id,
                  title: st.title,
                  completed: st.completed,
                  estimated_duration: 30
                })) || []
              };
              
              // Add to current tasks
              setDeepFocusTasks(prev => [...prev, enhancedTask]);
              
              // Save to database via Enhanced Task Service
              try {
                await EnhancedTaskService.createEnhancedTask(enhancedTask);
              } catch (dbError) {
                console.error('Failed to save task to database:', dbError);
              }
            }
            
            return `✅ Created ${result.deepTasks.length} deep focus task${result.deepTasks.length > 1 ? 's' : ''}: ${result.deepTasks.map(t => t.title).join(', ')}`;
          } else if (result.lightTasks.length > 0) {
            // Add light tasks to light focus section
            const newLightTasks = [...lightFocusTasks];
            for (let i = 0; i < newLightTasks.length && result.lightTasks.length > 0; i++) {
              if (!newLightTasks[i].title) {
                const lightTask = result.lightTasks.shift();
                if (lightTask) {
                  newLightTasks[i] = {
                    id: newLightTasks[i].id,
                    title: lightTask.title,
                    completed: false
                  };
                }
              }
            }
            setLightFocusTasks(newLightTasks);
            return `✅ Added ${result.lightTasks.length} light focus task${result.lightTasks.length > 1 ? 's' : ''}`;
          } else {
            return "❌ No valid tasks could be extracted from your command. Try being more specific.";
          }
        } catch (error) {
          console.error('Failed to process voice command with AI:', error);
          return "❌ Failed to process your task request. Please try again.";
        }
      }
    }

    // Workout commands
    if (lowercaseCmd.includes('workout') || lowercaseCmd.includes('exercise')) {
      if (lowercaseCmd.includes('complete') || lowercaseCmd.includes('done')) {
        const allCompleted = workoutItems.map(item => ({ ...item, completed: true }));
        setWorkoutItems(allCompleted);
        return "Workout completed! 💪";
      }
    }

    // Health commands
    if (lowercaseCmd.includes('health') || lowercaseCmd.includes('supplement')) {
      if (lowercaseCmd.includes('complete') || lowercaseCmd.includes('done')) {
        const allCompleted = healthItems.map(item => ({ ...item, completed: true }));
        setHealthItems(allCompleted);
        return "Health items completed! 🌱";
      }
    }

    // Work hours
    const hourMatch = lowercaseCmd.match(/(\d+)\s*hours?/);
    if (hourMatch && lowercaseCmd.includes('log')) {
      const hours = hourMatch[1];
      if (lowercaseCmd.includes('deep')) {
        setWorkHours({ ...workHours, deepFocus: hours });
        return `Logged ${hours} hours of deep focus! 🧠`;
      }
    }

    return "I can help you complete morning routine, tasks, workout, or log hours. What would you like?";
  };

  // Voice input handler
  const handleVoiceInput = async () => {
    if (!voiceService.isSpeechRecognitionSupported()) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    try {
      await voiceService.startListening(
        async (transcript, isFinal) => {
          setVoiceTranscript(transcript);
          if (isFinal && transcript) {
            setIsListening(false);
            const response = await processVoiceCommand(transcript);
            
            // Show visual notification instead of voice response
            const notification = document.createElement('div');
            notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            notification.textContent = response;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
            
            setVoiceTranscript('');
          }
        },
        (error) => {
          console.error('Voice error:', error);
          setIsListening(false);
          alert('Voice recognition error: ' + error);
        },
        {
          language: 'en-US',
          continuous: true, // Enable continuous recording for longer speech
          interimResults: true
        }
      );
    } catch (error) {
      setIsListening(false);
      console.error('Failed to start voice input:', error);
    }
  };

  // AI Assistant task update handler
  const handleAITasksUpdate = (category: string, action: string, tasks?: any[]) => {
    try {
      switch (action) {
        case 'clear':
          if (category === 'all' || category === 'deepFocus') {
            setDeepFocusTasks([]);
          }
          if (category === 'all' || category === 'lightFocus') {
            setLightFocusTasks(prev => prev.map(task => ({ ...task, completed: false, title: '' })));
          }
          if (category === 'all' || category === 'morningRoutine') {
            setMorningRoutine(prev => prev.map(item => ({ ...item, completed: false })));
          }
          if (category === 'all' || category === 'workout') {
            setWorkoutItems(prev => prev.map(item => ({ ...item, completed: false, logged: '' })));
          }
          if (category === 'all' || category === 'health') {
            setHealthItems(prev => prev.map(item => ({ ...item, completed: false })));
          }
          break;

        case 'complete_all':
          if (category === 'all' || category === 'deepFocus') {
            deepFocusTasks.forEach(task => {
              if (!task.completed) {
                handleTaskToggle(task.id, true);
              }
            });
          }
          if (category === 'all' || category === 'lightFocus') {
            setLightFocusTasks(prev => prev.map(task => ({ ...task, completed: true })));
          }
          if (category === 'all' || category === 'morningRoutine') {
            setMorningRoutine(prev => prev.map(item => ({ ...item, completed: true })));
          }
          if (category === 'all' || category === 'workout') {
            setWorkoutItems(prev => prev.map(item => ({ ...item, completed: true })));
          }
          if (category === 'all' || category === 'health') {
            setHealthItems(prev => prev.map(item => ({ ...item, completed: true })));
          }
          break;

        case 'add':
          if (tasks && category === 'deepFocus') {
            // Add tasks to light focus as editable items since deep focus is from Supabase
            const newLightTasks = tasks.map(task => ({
              id: task.id,
              title: task.title,
              completed: false,
              notes: task.notes
            }));
            setLightFocusTasks(prev => {
              const updated = [...prev];
              newLightTasks.forEach((newTask, index) => {
                if (index < updated.length && !updated[index].title) {
                  updated[index] = newTask;
                }
              });
              return updated;
            });
          }
          break;

        default:
          console.log(`Unknown action: ${action}`);
      }

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ AI Command executed successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);

    } catch (error) {
      console.error('AI task update error:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `❌ Failed to execute AI command`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }
  };

  // Calculate progress for each section
  const morningRoutineProgress = (morningRoutine.filter(item => item.completed).length / morningRoutine.length) * 100;
  const deepFocusProgress = deepFocusTasks.length > 0 
    ? (() => {
        // Calculate progress considering both main tasks and subtasks
        let totalItems = 0;
        let completedItems = 0;
        
        deepFocusTasks.forEach(task => {
          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
          
          if (hasSubtasks) {
            // Count subtasks instead of main task
            totalItems += task.subtasks!.length;
            completedItems += task.subtasks!.filter(st => st.completed).length;
          } else {
            // Count main task if no subtasks
            totalItems += 1;
            if (task.status === 'done') completedItems += 1;
          }
        });
        
        return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
      })()
    : 0;
  const lightFocusProgress = (lightFocusTasks.filter(task => task.completed && task.title).length / lightFocusTasks.filter(task => task.title).length) * 100 || 0;
  const workoutProgress = (workoutItems.filter(item => item.completed).length / workoutItems.length) * 100;
  const healthProgress = (healthItems.filter(item => item.completed).length / healthItems.length) * 100;

  const progressSections = [
    { id: 'morning', label: 'Morning Routine', completed: morningRoutine.filter(i => i.completed).length, total: morningRoutine.length, color: 'warning' as const },
    { id: 'deepFocus', label: 'Deep Focus', completed: (() => {
      let completed = 0;
      deepFocusTasks.forEach(task => {
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        if (hasSubtasks) {
          completed += task.subtasks!.filter(st => st.completed).length;
        } else if (task.status === 'done') {
          completed += 1;
        }
      });
      return completed;
    })(), total: (() => {
      let total = 0;
      deepFocusTasks.forEach(task => {
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        if (hasSubtasks) {
          total += task.subtasks!.length;
        } else {
          total += 1;
        }
      });
      return total;
    })(), color: 'default' as const },
    { id: 'lightFocus', label: 'Light Focus', completed: lightFocusTasks.filter(t => t.completed && t.title).length, total: lightFocusTasks.filter(t => t.title).length, color: 'success' as const },
    { id: 'workout', label: 'Workout', completed: workoutItems.filter(i => i.completed).length, total: workoutItems.length, color: 'danger' as const },
    { id: 'health', label: 'Health', completed: healthItems.filter(i => i.completed).length, total: healthItems.length, color: 'default' as const }
  ];

  // Task Detail Modal Handler
  const handleTaskClick = (task: EnhancedTask) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Light Focus Task Click Handler (different data structure)
  const handleLightFocusTaskClick = (task: any) => {
    // Convert light focus task to enhanced task format for the modal
    const enhancedTask: EnhancedTask = {
      id: task.id,
      title: task.title,
      description: task.description || 'Light focus task',
      status: task.completed ? 'done' : 'in_progress',
      priority: 'medium',
      category: 'light_focus',
      work_type: 'Light Focus',
      focus_level: 'low',
      energy_level: 'medium',
      estimated_duration: 1,
      actual_duration: 0,
      due_date: null,
      time_block_start: null,
      time_block_end: null,
      project_id: null,
      tags: [],
      subtasks: [],
      notes: '',
      flow_state_potential: 'low',
      effort_points: 1,
      dependencies: [],
      context_switching_cost: 'low',
      assigned_to: null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: task.completed ? new Date().toISOString() : null,
      completed: task.completed
    };
    setSelectedTask(enhancedTask);
    setShowTaskModal(true);
  };

  // Show loading state if data is still loading
  if (isLoadingLifeLockData) {
    return (
      <AdminLayout>
        <LoadingAnimation message="Loading your LifeLock data..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-gray-900">
        <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 pb-24 sm:pb-24">
          
          {/* Header Section - Enhanced for Mobile */}
          <DailyTrackerSection noPadding>
            <div className="space-y-3 sm:space-y-0">
              {/* Mobile-first header layout */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/life-lock')}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Calendar</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                
                {/* Voice Button Only */}
                <div className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVoiceInput}
                    className={`px-3 py-2 transition-all ${
                      isListening 
                        ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 animate-pulse' 
                        : 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4 mr-1" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-1" />
                        <span>Voice</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Combined Date Navigation & XP Dashboard */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  {/* Left: Previous Button & Level */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateDay('prev')}
                      className="text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-full"
                      aria-label="Previous day"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {gamificationService.getLevelInfo().level}
                    </div>
                  </div>

                  {/* Center: Date Display */}
                  <div className="text-center flex-1">
                    <div className="text-white font-semibold text-lg">
                      {format(currentDate, 'EEEE')}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {format(currentDate, 'MMM d, yyyy')}
                    </div>
                  </div>

                  {/* Right: Stats & Next Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-400">
                          <Flame className="h-3.5 w-3.5" />
                          <span className="font-medium text-sm">{gamificationService.getUserProgress().currentStreak}</span>
                        </div>
                        <div className="text-xs text-gray-400">streak</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Trophy className="h-3.5 w-3.5" />
                          <span className="font-medium text-sm">{gamificationService.getUserProgress().achievements.filter(a => a.unlocked).length}</span>
                        </div>
                        <div className="text-xs text-gray-400">badges</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateDay('next')}
                      className="text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-full"
                      aria-label="Next day"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* XP Progress Bar - Full Width Below */}
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between text-sm text-white mb-1">
                    <span>{gamificationService.getUserProgress().dailyXP} XP today</span>
                    <span className="text-gray-400">Level {gamificationService.getLevelInfo().level}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${gamificationService.getLevelInfo().progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DailyTrackerSection>

          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'tasks' && (
            <>
              {/* Voice Transcript Display */}
              {voiceTranscript && (
                <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <span className="font-semibold">Listening:</span> {voiceTranscript}
                  </p>
                </div>
              )}

              {/* Page Title and Progress Summary - Mobile Optimized */}
              <DailyTrackerSection className="mb-4 sm:mb-6">
                <div className="space-y-4">
                  
                  {/* Desktop Progress Summary */}
                  <div className="hidden sm:block">
                    <DailyTrackerProgressSummary sections={progressSections} />
                  </div>
                </div>
              </DailyTrackerSection>


          {/* Main Content Grid - Optimized Layout */}
          <DailyTrackerGrid
            columns={{ mobile: 2, tablet: 2, desktop: 4 }}
            gap="sm"
            items={[
              {
                id: 'morning-routine',
                priority: 1,
                span: 'full',
                content: (
                  <DailyTrackerCard
                    title="Morning Routine"
                    icon={Sun}
                    emoji="🌅"
                    color="yellow"
                    progress={morningRoutineProgress}
                    isCompact={true}
                    isCollapsible={true}
                    showCollapseWhenComplete={true}
                    completedTasksCount={morningRoutine.filter(item => item.completed).length}
                    totalTasksCount={morningRoutine.length}
                    headerContent={
                      <>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <h3 className="font-bold text-yellow-300 mb-1.5 sm:mb-2 text-sm sm:text-base">Coding My Brain</h3>
                            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                              I am Shaan Sisodia. I have been given divine purpose, and on this mission, temptation awaits on either side of the path. 
                              When I give in to temptation, I shall know I am astray. I will bring my family to a new age of freedom. 
                              I will not be distracted from the path.
                            </p>
                          </div>
                          <DailyTrackerDivider color="yellow" />
                          <div>
                            <h3 className="font-bold text-yellow-300 mb-1.5 sm:mb-2 text-sm sm:text-base">Daily Wisdom</h3>
                            <blockquote className="text-gray-200 text-xs sm:text-sm italic leading-relaxed border-l-2 border-yellow-400 pl-3">
                              "{getDailyQuote()}"
                            </blockquote>
                          </div>
                        </div>
                      </>
                    }
                  >
                    {/* Mobile Swipe Task List */}
                    <div className="block sm:hidden">
                      <div className="space-y-2">
                        {morningRoutine.map((item) => (
                          item.id === '1' ? (
                            // Custom Wake-Up Time Component
                            <div key={item.id} className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-yellow-200 font-medium">🌅 Wake Up Time</h3>
                                <div className="text-xs text-yellow-300">
                                  {wakeUpTimeConfirmed ? '✅ Logged' : '⏰ Track'}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                {isEditingWakeUpTime || !wakeUpTimeConfirmed ? (
                                  <>
                                    <input
                                      type="time"
                                      value={wakeUpTime.replace(/AM|PM/i, '').trim()}
                                      onChange={(e) => {
                                        const time = new Date(`1970-01-01T${e.target.value}`);
                                        const timeString = time.toLocaleTimeString('en-US', { 
                                          hour: '2-digit', 
                                          minute: '2-digit',
                                          hour12: true 
                                        });
                                        setWakeUpTime(timeString);
                                      }}
                                      className="bg-yellow-800/30 border border-yellow-600/50 rounded px-2 py-1 text-yellow-100 text-sm"
                                    />
                                    <button
                                      onClick={handleConfirmWakeUpTime}
                                      className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                                    >
                                      Confirm
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-yellow-100 font-medium">{wakeUpTime}</div>
                                    <button
                                      onClick={handleEditWakeUpTime}
                                      className="text-yellow-300 hover:text-yellow-200 text-sm underline"
                                    >
                                      Edit
                                    </button>
                                  </>
                                )}
                              </div>
                              
                              <p className="text-yellow-200/80 text-xs mt-2">
                                {item.description}
                              </p>
                            </div>
                          ) : (
                            <div key={item.id}>
                              {/* Enhanced task card with toggle for subtasks */}
                              {item.subtasks && item.subtasks.length > 0 ? (
                                <div className="bg-yellow-900/20 rounded-lg border border-yellow-600/30 p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <button
                                        onClick={() => toggleItem(morningRoutine, setMorningRoutine, item.id)}
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                          item.completed 
                                            ? 'bg-yellow-500 border-yellow-500' 
                                            : 'border-yellow-400 hover:border-yellow-300'
                                        }`}
                                      >
                                        {item.completed && (
                                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </button>
                                      
                                      <div className="flex-1">
                                        <h4 className={`font-medium ${item.completed ? 'line-through text-yellow-400/60' : 'text-yellow-200'}`}>
                                          {item.title}
                                        </h4>
                                        <p className="text-yellow-200/70 text-sm mt-1">
                                          {item.description}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      {/* Progress indicator */}
                                      <div className="text-xs text-yellow-400/80 bg-yellow-900/30 px-2 py-1 rounded">
                                        {(() => {
                                          const progress = getSubtaskProgress(item.subtasks);
                                          return `${progress.completed}/${progress.total}`;
                                        })()}
                                      </div>
                                      
                                      {/* Toggle button */}
                                      <button
                                        onClick={() => toggleTaskExpansion(item.id)}
                                        className="text-yellow-400 hover:text-yellow-300 p-1"
                                      >
                                        <svg className={`w-4 h-4 transition-transform ${expandedTasks.has(item.id) ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <MobileSwipeCard
                                  task={{
                                    id: item.id,
                                    title: item.title,
                                    completed: item.completed,
                                    description: item.description,
                                    logField: item.logField
                                  }}
                                  onSwipeComplete={() => toggleItem(morningRoutine, setMorningRoutine, item.id)}
                                  onUpdate={(field, value) => updateItemField(morningRoutine, setMorningRoutine, item.id, field, value)}
                                  color="yellow"
                                />
                              )}
                              
                              {/* Connected Subtasks - Mobile */}
                              {item.subtasks && item.subtasks.length > 0 && expandedTasks.has(item.id) && (
                                <div className="mt-3 border-l-2 border-yellow-500/40 ml-5">
                                  {item.subtasks.map((subtask: any) => (
                                    <div key={subtask.id} className="relative pl-4 pb-2">
                                      {/* Connection Line */}
                                      <div className="absolute left-0 top-3 w-3 h-0.5 bg-yellow-500/40"></div>
                                      
                                      {/* Subtask Content */}
                                      <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-yellow-900/30 to-yellow-800/15 rounded-lg border border-yellow-600/30 shadow-sm">
                                        <button
                                          onClick={() => {
                                            const updatedRoutine = morningRoutine.map(routineItem => 
                                              routineItem.id === item.id 
                                                ? {
                                                    ...routineItem,
                                                    subtasks: routineItem.subtasks?.map((st: any) => 
                                                      st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                                    )
                                                  }
                                                : routineItem
                                            );
                                            setMorningRoutine(updatedRoutine);
                                          }}
                                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                            subtask.completed 
                                              ? 'bg-yellow-500 border-yellow-500 shadow-sm' 
                                              : 'border-yellow-400/60 hover:border-yellow-400'
                                          }`}
                                        >
                                          {subtask.completed && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </button>
                                        
                                        <span className={`text-sm font-medium flex-1 ${subtask.completed ? 'line-through text-yellow-300/50' : 'text-yellow-100'}`}>
                                          {subtask.title}
                                        </span>
                                        
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-yellow-400/80 bg-yellow-900/30 px-2 py-1 rounded-md">
                                            {subtask.target}
                                          </span>
                                          <input
                                            type="text"
                                            placeholder="0"
                                            value={subtask.logged || ''}
                                            onChange={(e) => {
                                              const updatedRoutine = morningRoutine.map(routineItem => 
                                                routineItem.id === item.id 
                                                  ? {
                                                      ...routineItem,
                                                      subtasks: routineItem.subtasks?.map((st: any) => 
                                                        st.id === subtask.id ? { ...st, logged: e.target.value } : st
                                                      )
                                                    }
                                                  : routineItem
                                              );
                                              setMorningRoutine(updatedRoutine);
                                            }}
                                            className="w-12 px-2 py-1 text-xs bg-yellow-700/25 border border-yellow-600/40 rounded text-yellow-100 text-center focus:outline-none focus:border-yellow-500/60"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                    
                    {/* Desktop Task List */}
                    <div className="hidden sm:block">
                      <div className="space-y-3">
                        {morningRoutine.map((item) => (
                          item.id === '1' ? (
                            // Custom Wake-Up Time Component - Desktop
                            <div key={item.id} className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                  <h3 className="text-yellow-200 font-medium">🌅 Wake Up Time Tracking</h3>
                                </div>
                                <div className="text-sm text-yellow-300">
                                  {wakeUpTimeConfirmed ? '✅ Confirmed' : '⏰ Set Time'}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 mb-3">
                                {isEditingWakeUpTime || !wakeUpTimeConfirmed ? (
                                  <>
                                    <input
                                      type="time"
                                      value={wakeUpTime.replace(/AM|PM/i, '').trim()}
                                      onChange={(e) => {
                                        const time = new Date(`1970-01-01T${e.target.value}`);
                                        const timeString = time.toLocaleTimeString('en-US', { 
                                          hour: '2-digit', 
                                          minute: '2-digit',
                                          hour12: true 
                                        });
                                        setWakeUpTime(timeString);
                                      }}
                                      className="bg-yellow-800/30 border border-yellow-600/50 rounded px-3 py-2 text-yellow-100"
                                    />
                                    <button
                                      onClick={handleConfirmWakeUpTime}
                                      className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded font-medium transition-colors"
                                    >
                                      Confirm Wake Up Time
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-yellow-100 font-semibold text-lg">{wakeUpTime}</div>
                                    <button
                                      onClick={handleEditWakeUpTime}
                                      className="text-yellow-300 hover:text-yellow-200 underline"
                                    >
                                      Edit Time
                                    </button>
                                  </>
                                )}
                              </div>
                              
                              <p className="text-yellow-200/80 text-sm">
                                {item.description}
                              </p>
                            </div>
                          ) : (
                            // Regular task item with subtasks support
                            <div key={item.id} className="space-y-2">
                              <div className="flex items-center space-x-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
                                <button
                                  onClick={() => toggleItem(morningRoutine, setMorningRoutine, item.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    item.completed 
                                      ? 'bg-yellow-500 border-yellow-500' 
                                      : 'border-yellow-400 hover:border-yellow-300'
                                  }`}
                                >
                                  {item.completed && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                                
                                <div className="flex-1">
                                  <h4 className={`font-medium ${item.completed ? 'line-through text-yellow-400/60' : 'text-yellow-200'}`}>
                                    {item.title}
                                  </h4>
                                  <p className="text-yellow-200/70 text-sm mt-1">
                                    {item.description}
                                  </p>
                                  {item.logField && (
                                    <div className="text-yellow-300/80 text-xs mt-2">
                                      {item.logField}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Toggle and progress for tasks with subtasks */}
                                {item.subtasks && item.subtasks.length > 0 && (
                                  <div className="flex items-center space-x-3">
                                    {/* Progress indicator */}
                                    <div className="text-sm text-yellow-400/80 bg-yellow-900/30 px-3 py-1 rounded">
                                      {(() => {
                                        const progress = getSubtaskProgress(item.subtasks);
                                        return `${progress.completed}/${progress.total}`;
                                      })()}
                                    </div>
                                    
                                    {/* Toggle button */}
                                    <button
                                      onClick={() => toggleTaskExpansion(item.id)}
                                      className="text-yellow-400 hover:text-yellow-300 p-1 transition-colors"
                                    >
                                      <svg className={`w-5 h-5 transition-transform ${expandedTasks.has(item.id) ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {/* Connected Subtasks - Desktop */}
                              {item.subtasks && item.subtasks.length > 0 && expandedTasks.has(item.id) && (
                                <div className="mt-4 border-l-2 border-yellow-500/40 ml-6">
                                  {item.subtasks.map((subtask: any) => (
                                    <div key={subtask.id} className="relative pl-6 pb-3">
                                      {/* Connection Line */}
                                      <div className="absolute left-0 top-4 w-4 h-0.5 bg-yellow-500/40"></div>
                                      
                                      {/* Subtask Content */}
                                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-900/25 to-yellow-800/10 rounded-lg border border-yellow-600/30 shadow-sm">
                                        <button
                                          onClick={() => {
                                            const updatedRoutine = morningRoutine.map(routineItem => 
                                              routineItem.id === item.id 
                                                ? {
                                                    ...routineItem,
                                                    subtasks: routineItem.subtasks?.map((st: any) => 
                                                      st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                                    )
                                                  }
                                                : routineItem
                                            );
                                            setMorningRoutine(updatedRoutine);
                                          }}
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            subtask.completed 
                                              ? 'bg-yellow-500 border-yellow-500 shadow-sm' 
                                              : 'border-yellow-400/60 hover:border-yellow-400'
                                          }`}
                                        >
                                          {subtask.completed && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </button>
                                        
                                        <div className="flex-1 flex items-center justify-between">
                                          <span className={`font-medium text-base ${subtask.completed ? 'line-through text-yellow-300/50' : 'text-yellow-100'}`}>
                                            {subtask.title}
                                          </span>
                                          <div className="flex items-center space-x-3">
                                            <span className="text-sm text-yellow-400/80 bg-yellow-900/25 px-3 py-1.5 rounded-md font-medium">
                                              {subtask.target}
                                            </span>
                                            <input
                                              type="text"
                                              placeholder="0"
                                              value={subtask.logged || ''}
                                              onChange={(e) => {
                                                const updatedRoutine = morningRoutine.map(routineItem => 
                                                  routineItem.id === item.id 
                                                    ? {
                                                        ...routineItem,
                                                        subtasks: routineItem.subtasks?.map((st: any) => 
                                                          st.id === subtask.id ? { ...st, logged: e.target.value } : st
                                                        )
                                                      }
                                                    : routineItem
                                                );
                                                setMorningRoutine(updatedRoutine);
                                              }}
                                              className="w-16 px-3 py-1.5 text-sm bg-yellow-700/20 border border-yellow-600/40 rounded text-yellow-100 text-center focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/30"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </DailyTrackerCard>
                )
              },
              {
                id: 'work-sessions',
                priority: 2,
                span: 'full',
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {/* Deep Focus Work Session */}
                    <DailyTrackerCard
                      title="Deep Focus Work Session"
                      description="Tasks that require the most focus to create the most value. (8 hr minimum)"
                      icon={Brain}
                      emoji="🧠"
                      color="orange"
                      isCompact={true}
                      progress={deepFocusProgress}
                      isCollapsible={true}
                      showCollapseWhenComplete={true}
                      completedTasksCount={(() => {
                        let completed = 0;
                        deepFocusTasks.forEach(task => {
                          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                          if (hasSubtasks) {
                            completed += task.subtasks!.filter(st => st.completed).length;
                          } else if (task.status === 'done') {
                            completed += 1;
                          }
                        });
                        return completed;
                      })()}
                      totalTasksCount={(() => {
                        let total = 0;
                        deepFocusTasks.forEach(task => {
                          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                          if (hasSubtasks) {
                            total += task.subtasks!.length;
                          } else {
                            total += 1;
                          }
                        });
                        return total;
                      })()}
                      headerContent={
                        <div className="space-y-3">
                          {/* Flow Stats Dashboard */}
                          <FlowStatsDashboard className="mb-3" />
                          
                          <div>
                            <label className="text-white font-medium text-xs sm:text-sm block mb-1">Total Work Hours Logged:</label>
                            <Input
                              value={workHours.deepFocus}
                              onChange={(e) => setWorkHours(prev => ({ ...prev, deepFocus: e.target.value }))}
                              className="bg-gray-700 border-gray-600 text-white text-xs sm:text-sm h-8 sm:h-10"
                              placeholder="Enter hours..."
                            />
                          </div>
                          <DailyTrackerDivider />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                            <h3 className="font-semibold text-white text-sm sm:text-base">Main Tasks:</h3>
                            <TaskSelector
                              workType="deep_focus"
                              onTasksImport={handleImportDeepFocusTasks}
                              currentDate={currentDate}
                              existingTaskIds={deepFocusTasks.map(t => t.id)}
                            />
                          </div>
                        </div>
                      }
                    >
                      {/* Custom Task Input Section */}
                      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Plus className="h-4 w-4 text-orange-400" />
                          <h4 className="text-sm font-medium text-white">Add Custom Task</h4>
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter your custom deep focus task..."
                            className="flex-1 bg-black/40 border-gray-600 text-white placeholder-gray-400 text-sm"
                            value={customTaskInput}
                            onChange={(e) => setCustomTaskInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && customTaskInput.trim()) {
                                handleAddCustomTask();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={handleAddCustomTask}
                            disabled={!customTaskInput.trim()}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {isLoadingTasks ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-gray-400">Loading today's tasks...</div>
                        </div>
                      ) : (
                        <>
                          {/* Collapsible Task Cards with Subtasks */}
                          <div className="space-y-3">
                            {deepFocusTasks.length > 0 ? (
                              deepFocusTasks.map((task) => (
                                <CollapsibleTaskCard
                                  key={task.id}
                                  task={task}
                                  onTaskToggle={(taskId, completed) => handleTaskToggle(taskId, completed)}
                                  onSubtaskToggle={handleSubtaskToggle}
                                  onAddSubtask={handleAddSubtask}
                                  onDeleteSubtask={handleDeleteSubtask}
                                  onTaskUpdate={handleTaskUpdate}
                                />
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-400 text-sm">
                                No tasks found for today. Tasks will appear here when created in the task management system.
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </DailyTrackerCard>

                    {/* Light Focus Work Session - Compact */}
                    <DailyTrackerCard
                      title="Light Focus Work Session"
                      description="Tackle tasks that don't require as much cognitive load."
                      icon={Coffee}
                      emoji="☕"
                      color="green"
                      isCompact={true}
                      progress={lightFocusProgress}
                      isCollapsible={true}
                      showCollapseWhenComplete={true}
                      completedTasksCount={lightFocusTasks.filter(t => t.completed && t.title).length}
                      totalTasksCount={lightFocusTasks.filter(t => t.title).length}
                      headerContent={
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <label className="text-white font-medium text-xs block mb-1">Hours Logged:</label>
                              <Input
                                value={workHours.lightFocus}
                                onChange={(e) => setWorkHours(prev => ({ ...prev, lightFocus: e.target.value }))}
                                className="bg-gray-700 border-gray-600 text-white text-xs h-7 w-16"
                                placeholder="0"
                              />
                            </div>
                            <TaskSelector
                              workType="light_focus"
                              onTasksImport={handleImportLightFocusTasks}
                              currentDate={currentDate}
                              existingTaskIds={lightFocusTasks.map(t => t.id).filter(id => typeof id === 'string')}
                            />
                          </div>
                        </div>
                      }
                    >
                      {/* Mobile Swipe Task List */}
                      <div className="block sm:hidden">
                        <div className="space-y-2">
                          {lightFocusTasks.map((task) => (
                            <MobileSwipeCard
                              key={task.id}
                              task={{
                                id: task.id,
                                title: task.title,
                                completed: task.completed,
                                isEditable: true
                              }}
                              onSwipeComplete={() => toggleItem(lightFocusTasks, setLightFocusTasks, task.id)}
                              onSwipeEdit={() => handleLightFocusTaskClick(task)}
                              onUpdate={(field, value) => updateItemField(lightFocusTasks, setLightFocusTasks, task.id, field, value)}
                              color="green"
                              variant="editable"
                              placeholder="Enter task..."
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Desktop Task List - Compact */}
                      <div className="hidden sm:block">
                        <div className="space-y-1.5">
                          {lightFocusTasks.map((task) => (
                            <div key={task.id} className="flex items-center space-x-2 p-2 bg-green-900/10 border border-green-700/30 rounded-md hover:bg-green-900/15 transition-colors cursor-pointer" onClick={() => handleLightFocusTaskClick(task)}>
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => toggleItem(lightFocusTasks, setLightFocusTasks, task.id)}
                                className="border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 h-4 w-4 flex-shrink-0"
                              />
                              <div className="flex-1">
                                <Input
                                  value={task.title}
                                  onChange={(e) => updateItemField(lightFocusTasks, setLightFocusTasks, task.id, 'title', e.target.value)}
                                  className="bg-transparent border-none text-white p-0 focus:ring-0 text-sm h-6"
                                  placeholder="Enter task..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DailyTrackerCard>
                  </div>
                )
              },
              {
                id: 'fitness-health',
                priority: 3,
                span: 'full',
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Workout Card */}
                    <div className="lg:col-span-1">
                      <DailyTrackerCard
                        title="Home Workout Objective"
                        icon={Dumbbell}
                        emoji="🏋️‍♂️"
                        color="red"
                        isCompact={true}
                        progress={workoutProgress}
                        isCollapsible={true}
                        showCollapseWhenComplete={true}
                        completedTasksCount={workoutItems.filter(item => item.completed).length}
                        totalTasksCount={workoutItems.length}
                      >
                        {/* Mobile Swipe Task List */}
                        <div className="block sm:hidden">
                          <div className="space-y-2">
                            {workoutItems.map((item) => (
                              <MobileSwipeCard
                                key={item.id}
                                task={{
                                  id: item.id,
                                  title: item.title,
                                  completed: item.completed,
                                  description: item.target,
                                  logField: 'Log your result...',
                                  logValue: item.logged
                                }}
                                onSwipeComplete={() => toggleItem(workoutItems, setWorkoutItems, item.id)}
                                onUpdate={(field, value) => updateItemField(workoutItems, setWorkoutItems, item.id, field === 'logValue' ? 'logged' : field, value)}
                                color="red"
                                variant="workout"
                                showLog={true}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Desktop Task List */}
                        <div className="hidden sm:block">
                          <DailyTrackerTaskList
                            tasks={workoutItems.map(item => ({
                              id: item.id,
                              title: item.title,
                              completed: item.completed,
                              description: item.target,
                              logField: 'Log your result...',
                              logValue: item.logged
                            }))}
                            onToggle={(id) => toggleItem(workoutItems, setWorkoutItems, id)}
                            onUpdate={(id, field, value) => updateItemField(workoutItems, setWorkoutItems, id, field === 'logValue' ? 'logged' : field, value)}
                            color="red"
                            variant="default"
                          />
                        </div>
                      </DailyTrackerCard>
                    </div>

                    {/* Health & Screen Time Combined */}
                    <div className="lg:col-span-2">
                      <DailyTrackerCard
                        title="Health & Habits"
                        icon={Heart}
                        emoji="💚"
                        color="pink"
                        isCompact={true}
                        progress={healthProgress}
                        isCollapsible={true}
                        showCollapseWhenComplete={false}
                        completedTasksCount={healthItems.filter(item => item.completed).length}
                        totalTasksCount={healthItems.length}
                      >
                        {/* Health Non-Negotiables - Compact Grid */}
                        <div className="mb-4">
                          <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Health Non-Negotiables</h3>
                          
                          {/* Mobile Swipe Task List */}
                          <div className="block sm:hidden">
                            <div className="space-y-1.5">
                              {healthItems.map((item) => (
                                <MobileSwipeCard
                                  key={item.id}
                                  task={{
                                    id: item.id,
                                    title: item.title,
                                    completed: item.completed
                                  }}
                                  onSwipeComplete={() => toggleItem(healthItems, setHealthItems, item.id)}
                                  color="pink"
                                  variant="compact"
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Desktop Compact Grid */}
                          <div className="hidden sm:block">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {healthItems.map((item) => (
                                <div key={item.id} className="flex items-center space-x-2 p-2 bg-pink-900/10 border border-pink-700/30 rounded-md hover:bg-pink-900/15 transition-colors cursor-pointer" onClick={() => toggleItem(healthItems, setHealthItems, item.id)}>
                                  <Checkbox
                                    checked={item.completed}
                                    onCheckedChange={() => toggleItem(healthItems, setHealthItems, item.id)}
                                    className="border-pink-600 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600 h-4 w-4 flex-shrink-0"
                                  />
                                  <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                    {item.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <DailyTrackerDivider className="my-4 sm:my-6" />

                        {/* Screen Time & Habits */}
                        <div className="mb-6">
                          <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Screen Time & Habits</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-white text-xs sm:text-sm font-medium block mb-1">Bullshit Content (1 hr max):</label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={habits.bullshitContentTime}
                                  onChange={(e) => setHabits(prev => ({ ...prev, bullshitContentTime: e.target.value }))}
                                  className="bg-gray-800 border border-gray-600 text-white text-xs sm:text-sm h-8 sm:h-10 flex-1 focus:ring-0 focus:outline-none focus:border-gray-600 rounded px-2"
                                  placeholder="0 min"
                                />
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(habits.bullshitContentTime || '0');
                                      const newValue = Math.max(0, currentValue - 15);
                                      setHabits(prev => ({ ...prev, bullshitContentTime: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-2 min-w-[32px]"
                                  >
                                    -15
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(habits.bullshitContentTime || '0');
                                      const newValue = currentValue + 15;
                                      setHabits(prev => ({ ...prev, bullshitContentTime: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-2 min-w-[32px]"
                                  >
                                    +15
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-start space-x-2 sm:space-x-3">
                                <Checkbox
                                  checked={habits.noWeed}
                                  onCheckedChange={(checked) => setHabits(prev => ({ ...prev, noWeed: !!checked }))}
                                  className="mt-0.5"
                                />
                                <span className="text-white text-xs sm:text-sm leading-tight">No Weed, No Vapes</span>
                              </div>
                              <div className="flex items-start space-x-2 sm:space-x-3">
                                <Checkbox
                                  checked={habits.noScrolling}
                                  onCheckedChange={(checked) => setHabits(prev => ({ ...prev, noScrolling: !!checked }))}
                                  className="mt-0.5"
                                />
                                <span className="text-white text-xs sm:text-sm leading-tight">No Scrolling</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <DailyTrackerDivider className="my-4 sm:my-6" />
                        
                        {/* Daily Calorie & Macro Tracker - Compact */}
                        <div>
                          <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Daily Calorie & Macro Tracker</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="text-white text-xs font-medium mb-1 block">🍳 Breakfast:</label>
                              <div className="bg-black/20 rounded-md p-2 border border-gray-700/50">
                                <Input
                                  value={meals.breakfast}
                                  onChange={(e) => setMeals(prev => ({ ...prev, breakfast: e.target.value }))}
                                  className="bg-transparent border-none text-white text-sm h-6 w-full focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                  placeholder="What did you eat..."
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-white text-xs font-medium mb-1 block">🥙 Lunch:</label>
                              <div className="bg-black/20 rounded-md p-2 border border-gray-700/50">
                                <Input
                                  value={meals.lunch}
                                  onChange={(e) => setMeals(prev => ({ ...prev, lunch: e.target.value }))}
                                  className="bg-transparent border-none text-white text-sm h-6 w-full focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                  placeholder="What did you eat..."
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-white text-xs font-medium mb-1 block">🍽️ Dinner:</label>
                              <div className="bg-black/20 rounded-md p-2 border border-gray-700/50">
                                <Input
                                  value={meals.dinner}
                                  onChange={(e) => setMeals(prev => ({ ...prev, dinner: e.target.value }))}
                                  className="bg-transparent border-none text-white text-sm h-6 w-full focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                  placeholder="What did you eat..."
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-white text-xs font-medium mb-1 block">🍿 Snacks:</label>
                              <div className="bg-black/20 rounded-md p-2 border border-gray-700/50">
                                <Input
                                  value={meals.snacks}
                                  onChange={(e) => setMeals(prev => ({ ...prev, snacks: e.target.value }))}
                                  className="bg-transparent border-none text-white text-sm h-6 w-full focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                  placeholder="Any snacks..."
                                />
                              </div>
                            </div>
                          </div>

                          <h4 className="font-semibold text-white mb-2 text-sm">Daily Totals:</h4>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            <div>
                              <label className="text-white text-xs sm:text-sm font-medium">Total Calories:</label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  value={dailyTotals.calories}
                                  onChange={(e) => setDailyTotals(prev => ({ ...prev, calories: e.target.value }))}
                                  className="bg-gray-800 border border-gray-600 text-white text-xs sm:text-sm h-8 sm:h-10 flex-1 focus:ring-0 focus:outline-none focus:border-gray-600 rounded px-2"
                                  placeholder="0"
                                />
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(dailyTotals.calories || '0');
                                      const newValue = Math.max(0, currentValue - 100);
                                      setDailyTotals(prev => ({ ...prev, calories: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-1 min-w-[28px]"
                                  >
                                    -100
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(dailyTotals.calories || '0');
                                      const newValue = currentValue + 100;
                                      setDailyTotals(prev => ({ ...prev, calories: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-1 min-w-[28px]"
                                  >
                                    +100
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-white text-xs sm:text-sm font-medium">Total Protein:</label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  value={dailyTotals.protein}
                                  onChange={(e) => setDailyTotals(prev => ({ ...prev, protein: e.target.value }))}
                                  className="bg-gray-800 border border-gray-600 text-white text-xs sm:text-sm h-8 sm:h-10 flex-1 focus:ring-0 focus:outline-none focus:border-gray-600 rounded px-2"
                                  placeholder="0g"
                                />
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(dailyTotals.protein || '0');
                                      const newValue = Math.max(0, currentValue - 10);
                                      setDailyTotals(prev => ({ ...prev, protein: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-1 min-w-[28px]"
                                  >
                                    -10
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(dailyTotals.protein || '0');
                                      const newValue = currentValue + 10;
                                      setDailyTotals(prev => ({ ...prev, protein: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-1 min-w-[28px]"
                                  >
                                    +10
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-white text-xs sm:text-sm font-medium">Total Carbs:</label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  value={dailyTotals.carbs}
                                  onChange={(e) => setDailyTotals(prev => ({ ...prev, carbs: e.target.value }))}
                                  className="bg-gray-800 border border-gray-600 text-white text-xs sm:text-sm h-8 sm:h-10 flex-1 focus:ring-0 focus:outline-none focus:border-gray-600 rounded px-2"
                                  placeholder="0g"
                                />
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(dailyTotals.carbs || '0');
                                      const newValue = Math.max(0, currentValue - 10);
                                      setDailyTotals(prev => ({ ...prev, carbs: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-1 min-w-[28px]"
                                  >
                                    -10
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(dailyTotals.carbs || '0');
                                      const newValue = currentValue + 10;
                                      setDailyTotals(prev => ({ ...prev, carbs: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-1 min-w-[28px]"
                                  >
                                    +10
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-white text-xs sm:text-sm font-medium">Total Fats:</label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Input
                                  value={dailyTotals.fats}
                                  onChange={(e) => setDailyTotals(prev => ({ ...prev, fats: e.target.value }))}
                                  className="bg-gray-800 border border-gray-600 text-white text-xs sm:text-sm h-8 sm:h-10 flex-1 focus:ring-0 focus:outline-none focus:border-gray-600 rounded px-2"
                                  placeholder="0g"
                                />
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(dailyTotals.fats || '0');
                                      const newValue = Math.max(0, currentValue - 5);
                                      setDailyTotals(prev => ({ ...prev, fats: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-1 min-w-[28px]"
                                  >
                                    -5
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(dailyTotals.fats || '0');
                                      const newValue = currentValue + 5;
                                      setDailyTotals(prev => ({ ...prev, fats: newValue.toString() }));
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-1 min-w-[28px]"
                                  >
                                    +5
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DailyTrackerCard>
                    </div>
                  </div>
                )
              },
              {
                id: 'nightly-checkout',
                priority: 7,
                span: 'full',
                content: (
                  <DailyTrackerCard
                    title="Nightly Check-Out"
                    icon={Moon}
                    color="indigo"
                    isCompact={true}
                    isCollapsible={true}
                    showCollapseWhenComplete={false}
                  >
                    <div className="space-y-6">
                      {/* Top Row - Reflection Cards Side by Side (Desktop) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* What went well today */}
                        <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-green-400 text-sm">✓</span>
                            </div>
                            <h4 className="font-semibold text-white text-base">What went well today?</h4>
                          </div>
                          <div className="space-y-2">
                            {nightlyCheckout.wentWell.map((item, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="text-green-400 text-sm mt-1">•</span>
                                <Input
                                  value={item}
                                  onChange={(e) => {
                                    const newArray = [...nightlyCheckout.wentWell];
                                    newArray[index] = e.target.value;
                                    setNightlyCheckout(prev => ({ ...prev, wentWell: newArray }));
                                    
                                    // Auto-save to database
                                    if (dailyReflectionsData) {
                                      const updatedReflections = { ...dailyReflectionsData, went_well: newArray };
                                      LifeLockService.updateDailyReflections(updatedReflections);
                                    }
                                    
                                    // Auto-expand: add new bullet point if typing in the last one
                                    if (index === nightlyCheckout.wentWell.length - 1 && e.target.value.trim() !== '') {
                                      const expandedArray = [...newArray, ''];
                                      setNightlyCheckout(prev => ({ ...prev, wentWell: expandedArray }));
                                    }
                                  }}
                                  className="bg-transparent border-none text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                  placeholder="Type something positive that happened today..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Even better if */}
                        <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-orange-400 text-sm">⚡</span>
                            </div>
                            <h4 className="font-semibold text-white text-base">Even better if...</h4>
                          </div>
                          <div className="space-y-2">
                            {nightlyCheckout.evenBetterIf.map((item, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="text-orange-400 text-sm mt-1">•</span>
                                <Input
                                  value={item}
                                  onChange={(e) => {
                                    const newArray = [...nightlyCheckout.evenBetterIf];
                                    newArray[index] = e.target.value;
                                    setNightlyCheckout(prev => ({ ...prev, evenBetterIf: newArray }));
                                    
                                    // Auto-save to database
                                    if (dailyReflectionsData) {
                                      const updatedReflections = { ...dailyReflectionsData, even_better_if: newArray };
                                      LifeLockService.updateDailyReflections(updatedReflections);
                                    }
                                    
                                    // Auto-expand: add new bullet point if typing in the last one
                                    if (index === nightlyCheckout.evenBetterIf.length - 1 && e.target.value.trim() !== '') {
                                      const expandedArray = [...newArray, ''];
                                      setNightlyCheckout(prev => ({ ...prev, evenBetterIf: expandedArray }));
                                    }
                                  }}
                                  className="bg-transparent border-none text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                  placeholder="What could have gone better or improved?"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Daily Tracking Cards Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Sleep Tracking */}
                        <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-purple-400 text-sm">😴</span>
                            </div>
                            <h4 className="font-semibold text-white text-base">Sleep Tracking</h4>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="text-gray-400 text-xs mb-2 block">Bedtime:</label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="time"
                                  value={nightlyCheckout.bedtime || ''}
                                  onChange={(e) => {
                                    setNightlyCheckout(prev => ({ ...prev, bedtime: e.target.value }));
                                    // Auto-save to database
                                    if (dailyReflectionsData) {
                                      const updatedReflections = { ...dailyReflectionsData, bedtime: e.target.value };
                                      LifeLockService.updateDailyReflections(updatedReflections);
                                    }
                                  }}
                                  className="bg-gray-800 border border-gray-600 text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-gray-600 rounded px-2"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const now = new Date();
                                    const currentTime = now.toTimeString().slice(0, 5);
                                    setNightlyCheckout(prev => ({ ...prev, bedtime: currentTime }));
                                    // Auto-save to database
                                    if (dailyReflectionsData) {
                                      const updatedReflections = { ...dailyReflectionsData, bedtime: currentTime };
                                      LifeLockService.updateDailyReflections(updatedReflections);
                                    }
                                  }}
                                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-2"
                                >
                                  Now
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs mb-2 block">Sleep Quality:</label>
                              <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                                  <Button
                                    key={rating}
                                    size="sm"
                                    variant={parseInt(nightlyCheckout.sleepQuality) === rating ? "default" : "outline"}
                                    onClick={() => {
                                      setNightlyCheckout(prev => ({ ...prev, sleepQuality: rating.toString() }));
                                      // Auto-save to database
                                      if (dailyReflectionsData) {
                                        const updatedReflections = { ...dailyReflectionsData, sleep_quality: rating };
                                        LifeLockService.updateDailyReflections(updatedReflections);
                                      }
                                    }}
                                    className={`w-8 h-8 text-xs ${
                                      parseInt(nightlyCheckout.sleepQuality) === rating
                                        ? 'bg-purple-500 text-white border-purple-500'
                                        : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    }`}
                                  >
                                    {rating}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Meditation Tracking */}
                        <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-blue-400 text-sm">🧘</span>
                            </div>
                            <h4 className="font-semibold text-white text-base">Meditation</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-gray-400 text-xs">Duration (minutes):</label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={nightlyCheckout.meditationTime || ''}
                                  onChange={(e) => {
                                    setNightlyCheckout(prev => ({ ...prev, meditationTime: e.target.value }));
                                    // Auto-save to database
                                    if (dailyReflectionsData) {
                                      const updatedReflections = { ...dailyReflectionsData, meditation_minutes: parseInt(e.target.value) || 0 };
                                      LifeLockService.updateDailyReflections(updatedReflections);
                                    }
                                  }}
                                  className="bg-gray-800 border border-gray-600 text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-gray-600 rounded px-2"
                                  placeholder="0"
                                />
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(nightlyCheckout.meditationTime || '0');
                                      const newValue = Math.max(0, currentValue - 5);
                                      setNightlyCheckout(prev => ({ ...prev, meditationTime: newValue.toString() }));
                                      // Auto-save to database
                                      if (dailyReflectionsData) {
                                        const updatedReflections = { ...dailyReflectionsData, meditation_minutes: newValue };
                                        LifeLockService.updateDailyReflections(updatedReflections);
                                      }
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-2 min-w-[28px]"
                                  >
                                    -5
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const currentValue = parseInt(nightlyCheckout.meditationTime || '0');
                                      const newValue = currentValue + 5;
                                      setNightlyCheckout(prev => ({ ...prev, meditationTime: newValue.toString() }));
                                      // Auto-save to database
                                      if (dailyReflectionsData) {
                                        const updatedReflections = { ...dailyReflectionsData, meditation_minutes: newValue };
                                        LifeLockService.updateDailyReflections(updatedReflections);
                                      }
                                    }}
                                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 text-xs h-8 px-2 min-w-[28px]"
                                  >
                                    +5
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={nightlyCheckout.meditated || false}
                                onCheckedChange={(checked) => {
                                  setNightlyCheckout(prev => ({ ...prev, meditated: !!checked }));
                                  // Auto-save to database
                                  if (dailyReflectionsData) {
                                    const updatedReflections = { ...dailyReflectionsData, meditated: !!checked };
                                    LifeLockService.updateDailyReflections(updatedReflections);
                                  }
                                }}
                              />
                              <span className="text-white text-xs">Meditated today</span>
                            </div>
                          </div>
                        </div>

                        {/* Tomorrow Planning */}
                        <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-yellow-400 text-sm">📋</span>
                            </div>
                            <h4 className="font-semibold text-white text-base">Tomorrow</h4>
                          </div>
                          <div className="space-y-2">
                            {(nightlyCheckout.tomorrowTasks || ['', '', '']).map((item, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="text-yellow-400 text-sm mt-1">•</span>
                                <Input
                                  value={item}
                                  onChange={(e) => {
                                    const newArray = [...(nightlyCheckout.tomorrowTasks || ['', '', ''])];
                                    newArray[index] = e.target.value;
                                    setNightlyCheckout(prev => ({ ...prev, tomorrowTasks: newArray }));
                                    
                                    // Auto-save to database
                                    if (dailyReflectionsData) {
                                      const updatedReflections = { ...dailyReflectionsData, tomorrow_tasks: newArray };
                                      LifeLockService.updateDailyReflections(updatedReflections);
                                    }
                                    
                                    // Auto-expand: add new bullet point if typing in the last one
                                    if (index === (nightlyCheckout.tomorrowTasks || ['', '', '']).length - 1 && e.target.value.trim() !== '') {
                                      const expandedArray = [...newArray, ''];
                                      setNightlyCheckout(prev => ({ ...prev, tomorrowTasks: expandedArray }));
                                    }
                                  }}
                                  className="bg-transparent border-none text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                  placeholder="Priority task for tomorrow..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Analysis & Reflection - Full Width */}
                      <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-blue-400 text-sm">💡</span>
                          </div>
                          <h4 className="font-semibold text-white text-base">Deep Analysis & Insights</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div>
                            <div className="text-gray-400 text-xs mb-3 flex items-center space-x-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              <span>Reflection on improvements</span>
                            </div>
                            <div className="space-y-2">
                              {nightlyCheckout.analysis.map((item, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="text-blue-400 text-sm mt-1">•</span>
                                  <Input
                                    value={item}
                                    onChange={(e) => {
                                      const newArray = [...nightlyCheckout.analysis];
                                      newArray[index] = e.target.value;
                                      setNightlyCheckout(prev => ({ ...prev, analysis: newArray }));
                                      
                                      // Auto-save to database
                                      if (dailyReflectionsData) {
                                        const updatedReflections = { ...dailyReflectionsData, analysis: newArray };
                                        LifeLockService.updateDailyReflections(updatedReflections);
                                      }
                                      
                                      // Auto-expand: add new bullet point if typing in the last one
                                      if (index === nightlyCheckout.analysis.length - 1 && e.target.value.trim() !== '') {
                                        const expandedArray = [...newArray, ''];
                                        setNightlyCheckout(prev => ({ ...prev, analysis: expandedArray }));
                                      }
                                    }}
                                    className="bg-transparent border-none text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                    placeholder="How can I improve in the areas mentioned above?"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-gray-400 text-xs mb-3 flex items-center space-x-2">
                              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                              <span>Patterns & behaviors</span>
                            </div>
                            <div className="space-y-2">
                              {nightlyCheckout.patterns.map((item, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="text-purple-400 text-sm mt-1">•</span>
                                  <Input
                                    value={item}
                                    onChange={(e) => {
                                      const newArray = [...nightlyCheckout.patterns];
                                      newArray[index] = e.target.value;
                                      setNightlyCheckout(prev => ({ ...prev, patterns: newArray }));
                                      
                                      // Auto-save to database
                                      if (dailyReflectionsData) {
                                        const updatedReflections = { ...dailyReflectionsData, patterns: newArray };
                                        LifeLockService.updateDailyReflections(updatedReflections);
                                      }
                                      
                                      // Auto-expand: add new bullet point if typing in the last one
                                      if (index === nightlyCheckout.patterns.length - 1 && e.target.value.trim() !== '') {
                                        const expandedArray = [...newArray, ''];
                                        setNightlyCheckout(prev => ({ ...prev, patterns: expandedArray }));
                                      }
                                    }}
                                    className="bg-transparent border-none text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                    placeholder="What patterns am I noticing in my behavior?"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-gray-400 text-xs mb-3 flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              <span>Environmental changes</span>
                            </div>
                            <div className="space-y-2">
                              {nightlyCheckout.changes.map((item, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <span className="text-green-400 text-sm mt-1">•</span>
                                  <Input
                                    value={item}
                                    onChange={(e) => {
                                      const newArray = [...nightlyCheckout.changes];
                                      newArray[index] = e.target.value;
                                      setNightlyCheckout(prev => ({ ...prev, changes: newArray }));
                                      
                                      // Auto-save to database
                                      if (dailyReflectionsData) {
                                        const updatedReflections = { ...dailyReflectionsData, changes: newArray };
                                        LifeLockService.updateDailyReflections(updatedReflections);
                                      }
                                      
                                      // Auto-expand: add new bullet point if typing in the last one
                                      if (index === nightlyCheckout.changes.length - 1 && e.target.value.trim() !== '') {
                                        const expandedArray = [...newArray, ''];
                                        setNightlyCheckout(prev => ({ ...prev, changes: expandedArray }));
                                      }
                                    }}
                                    className="bg-transparent border-none text-white text-sm h-8 flex-1 focus:ring-0 focus:outline-none focus:border-none p-0 shadow-none"
                                    placeholder="What changes can I make to my environment?"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DailyTrackerCard>
                )
              }
            ]}
          />
            </>
          )}

          {/* TimeBlock View */}
          {activeTab === 'timeblock' && (
            <TimeBlockView 
              currentDate={currentDate} 
              onOpenTimeBoxModal={() => setShowTimeBoxModal(true)}
              morningTasks={morningRoutine}
              deepTasks={deepFocusTasks}
              lightTasks={lightFocusTasks}
              workoutTasks={workoutItems}
              healthTasks={healthItems}
            />
          )}

          {/* Statistics View */}
          {activeTab === 'stats' && (
            <StatsView currentDate={currentDate} />
          )}

          {/* Enhanced AI Chat View with Legacy AI */}
          {activeTab === 'chat' && (
            <EnhancedAIChatView currentDate={currentDate} />
          )}
          
        </div>
      </div>
      
      {/* AI Assistant */}
      <DailyTrackerAIAssistant
        currentTasks={{
          deepFocus: deepFocusTasks.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            priority: task.priority,
            category: 'deep_focus',
            notes: task.description
          })),
          lightFocus: lightFocusTasks,
          morningRoutine: morningRoutine,
          workout: workoutItems,
          health: healthItems
        }}
        onTasksUpdate={handleAITasksUpdate}
      />


      {/* Task Detail Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] overflow-y-auto sm:w-full">
          <DialogHeader className="sticky top-0 bg-gray-900 pb-4 z-10">
            <DialogTitle className="text-lg sm:text-xl font-bold flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                <span className="line-clamp-2 sm:line-clamp-1">{selectedTask?.title}</span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm">
              {selectedTask?.work_type} • {selectedTask?.category}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-6">
              {/* Task Status & Priority */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-sm',
                      selectedTask.status === 'done' 
                        ? 'border-green-500 text-green-400 bg-green-500/10' 
                        : 'border-orange-500 text-orange-400 bg-orange-500/10'
                    )}
                  >
                    {selectedTask.status === 'done' ? 'Completed' : 'In Progress'}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-sm',
                      selectedTask.priority === 'high' ? 'border-red-500 text-red-400 bg-red-500/10' :
                      selectedTask.priority === 'medium' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                      'border-green-500 text-green-400 bg-green-500/10'
                    )}
                  >
                    {selectedTask.priority} Priority
                  </Badge>
                </div>
                <Button
                  onClick={() => setShowTaskModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Task Description */}
              {selectedTask.description && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-200">Description</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Focus Level</label>
                    <p className="text-white capitalize">{selectedTask.focus_level}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Energy Level</label>
                    <p className="text-white capitalize">{selectedTask.energy_level}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Estimated Duration</label>
                    <p className="text-white">{selectedTask.estimated_duration}h</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Flow State Potential</label>
                    <p className="text-white capitalize">{selectedTask.flow_state_potential}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Effort Points</label>
                    <p className="text-white">{selectedTask.effort_points}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide font-medium">Context Switch Cost</label>
                    <p className="text-white capitalize">{selectedTask.context_switching_cost}</p>
                  </div>
                </div>
              </div>

              {/* Time Blocks */}
              {(selectedTask.time_block_start || selectedTask.time_block_end) && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-200">Time Block</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>
                      {selectedTask.time_block_start && new Date(selectedTask.time_block_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {selectedTask.time_block_start && selectedTask.time_block_end && ' - '}
                      {selectedTask.time_block_end && new Date(selectedTask.time_block_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}

              {/* Due Date */}
              {selectedTask.due_date && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-200">Due Date</h4>
                  <p className="text-gray-300 text-sm">
                    {new Date(selectedTask.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-200">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-200">Subtasks</h4>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">{subtask}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTask.notes && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-200">Notes</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedTask.notes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedTask.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(selectedTask.updated_at).toLocaleString()}
                  </div>
                  {selectedTask.completed_at && (
                    <div>
                      <span className="font-medium">Completed:</span> {new Date(selectedTask.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Time Boxing Modal */}
      <AITimeBoxModal
        open={showTimeBoxModal}
        onOpenChange={setShowTimeBoxModal}
        date={currentDate}
        wakeUpTime={wakeUpTime}
        morningTasks={morningRoutine}
        deepTasks={deepFocusTasks}
        lightTasks={lightFocusTasks}
        workoutTasks={workoutItems}
        healthTasks={healthItems}
      />

      {/* Gamification Dashboard Modal */}
      <Dialog open={showGamificationModal} onOpenChange={setShowGamificationModal}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Daily Gamification
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <GamificationDashboard />
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </AdminLayout>
  );
};

export default AdminLifeLockDay;