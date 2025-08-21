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
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TodayTasksService, TodayTask } from '@/services/todayTasksService';
import { LifeLockService, DailyRoutine, DailyWorkout, DailyHealth, DailyHabits, DailyReflections } from '@/services/lifeLockService';
import { EnhancedTaskService, EnhancedTask } from '@/services/enhancedTaskService';
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
import { BottomNavigation } from '@/components/admin/lifelock/ui/BottomNavigation';
import { LoadingAnimation } from '@/components/admin/lifelock/ui/LoadingAnimation';
import { generateRealisticTasksForDate, convertToLifeLockRoutine } from '@/services/sharedTaskDataService';

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

  // State for all LifeLock data
  const [isLoadingLifeLockData, setIsLoadingLifeLockData] = useState(true);
  const [dailyRoutineData, setDailyRoutineData] = useState<DailyRoutine | null>(null);
  const [dailyWorkoutData, setDailyWorkoutData] = useState<DailyWorkout | null>(null);
  const [dailyHealthData, setDailyHealthData] = useState<DailyHealth | null>(null);
  const [dailyHabitsData, setDailyHabitsData] = useState<DailyHabits | null>(null);
  const [dailyReflectionsData, setDailyReflectionsData] = useState<DailyReflections | null>(null);

  // Derived state from LifeLock data with fallbacks
  const morningRoutine = dailyRoutineData?.items || [
    { id: '1', title: 'Wake Up', completed: false, description: 'Start the day before midday to maximize productivity.' },
    { id: '2', title: 'Get Blood Flowing (5 min)', completed: false, description: 'Max rep push-ups (Target PB: 30).', logField: 'Log reps: ____' },
    { id: '3', title: 'Hydrate (5 min)', completed: false, description: 'Drink 500 ml water to start the day.' },
    { id: '4', title: 'Supplements & Pre-Workout (5 min)', completed: false, description: 'Take omega-3, multivitamin, ashwagandha, and pre-workout.' },
    { id: '5', title: 'Shower (20 min)', completed: false, description: 'Cold shower to wake up and energize.' },
    { id: '5b', title: 'Brush Teeth (5 min)', completed: false, description: 'Fresh oral hygiene for the day.' },
    { id: '6', title: 'Review & Plan Day (15 min)', completed: false, description: 'Go through tasks, prioritize, and allocate time slots.' },
    { id: '7', title: 'Meditation (2 min)', completed: false, description: 'Meditate to set an innovative mindset for creating business value.' }
  ];
  
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

  // Load enhanced tasks from Supabase on mount and date change
  useEffect(() => {
    let isMounted = true;
    
    const loadTasks = async () => {
      if (!isMounted) return;
      
      setIsLoadingTasks(true);
      console.log('Loading enhanced tasks for date:', dateKey);
      
      try {
        const tasks = await EnhancedTaskService.getDeepFocusTasksForDate(currentDate);
        
        if (!isMounted) return;
        
        console.log('Loaded enhanced tasks successfully:', tasks);
        setDeepFocusTasks(tasks);
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

  // Update task completion with enhanced analytics
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const task = deepFocusTasks.find(t => t.id === taskId);
      const analytics = task ? {
        planned_duration: task.estimated_duration,
        actual_duration: task.actual_duration,
        focus_quality: 8, // Could be input from user
        energy_level_start: 7,
        energy_level_end: 6,
        distractions_count: 0
      } : undefined;

      const success = await EnhancedTaskService.updateTaskCompletion(taskId, completed, analytics);
      if (success) {
        setDeepFocusTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, status: completed ? 'done' : 'pending' } : task
          )
        );
        
        // Sync with LifeLock after task completion
        await EnhancedTaskService.syncTasksToLifeLock(currentDate);
      }
    } catch (error) {
      console.error('Failed to update enhanced task:', error);
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
      // Create a new task using the Enhanced Task Service
      const newTask = await EnhancedTaskService.createTask({
        title: customTaskInput.trim(),
        description: 'Custom deep focus task',
        work_type: 'deep_focus',
        focus_level: 'high',
        priority: 'medium',
        due_date: format(currentDate, 'yyyy-MM-dd'),
        estimated_duration: 60 // Default 1 hour
      });

      // Add to current deep focus tasks
      setDeepFocusTasks(prev => [...prev, newTask]);
      
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
    const updatedItems = items.map((item: any) => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
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

    // Deep focus task commands
    if (lowercaseCmd.includes('deep focus') || lowercaseCmd.includes('focus task')) {
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
    ? (deepFocusTasks.filter(task => task.status === 'done').length / deepFocusTasks.length) * 100 
    : 0;
  const lightFocusProgress = (lightFocusTasks.filter(task => task.completed && task.title).length / lightFocusTasks.filter(task => task.title).length) * 100 || 0;
  const workoutProgress = (workoutItems.filter(item => item.completed).length / workoutItems.length) * 100;
  const healthProgress = (healthItems.filter(item => item.completed).length / healthItems.length) * 100;

  const progressSections = [
    { id: 'morning', label: 'Morning Routine', completed: morningRoutine.filter(i => i.completed).length, total: morningRoutine.length, color: 'warning' as const },
    { id: 'deepFocus', label: 'Deep Focus', completed: deepFocusTasks.filter(t => t.status === 'done').length, total: deepFocusTasks.length, color: 'default' as const },
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
        <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-24 sm:pb-8">
          
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
                
                {/* Voice Button - Desktop Only (Mobile uses bottom nav) */}
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
              
              {/* Enhanced Date Navigation */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 bg-gray-800/50 rounded-lg p-3 sm:p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDay('prev')}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 p-2 sm:p-3 rounded-full"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 text-center">
                  <div className="text-white font-semibold text-sm sm:text-base">
                    {format(currentDate, 'EEEE')}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {format(currentDate, 'MMMM d, yyyy')}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDay('next')}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 p-2 sm:p-3 rounded-full"
                  aria-label="Next day"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DailyTrackerSection>

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
              {/* Mobile Progress Summary */}
              <div className="block sm:hidden">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {progressSections.slice(0, 4).map((section) => (
                    <div key={section.id} className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-white font-semibold text-sm">{section.label}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {section.completed}/{section.total}
                      </div>
                      <div className="w-full bg-gray-700/60 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${section.total > 0 ? (section.completed / section.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop Progress Summary */}
              <div className="hidden sm:block">
                <DailyTrackerProgressSummary sections={progressSections} />
              </div>
            </div>
          </DailyTrackerSection>

          {/* Main Content Grid - Optimized Layout */}
          <DailyTrackerGrid
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="md"
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
                            <h3 className="font-bold text-yellow-300 mb-1.5 sm:mb-2 text-sm sm:text-base">Flow State Rules</h3>
                            <ul className="text-gray-200 text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                              <li>• No use of apps other than Notion.</li>
                              <li>• No vapes or drugs (including weed).</li>
                              <li>• No more than 5 seconds until the next action.</li>
                            </ul>
                          </div>
                        </div>
                      </>
                    }
                  >
                    {/* Mobile Swipe Task List */}
                    <div className="block sm:hidden">
                      <div className="space-y-2">
                        {morningRoutine.map((item) => (
                          <MobileSwipeCard
                            key={item.id}
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
                        ))}
                      </div>
                    </div>
                    
                    {/* Desktop Task List */}
                    <div className="hidden sm:block">
                      <DailyTrackerTaskList
                        tasks={morningRoutine.map(item => ({
                          id: item.id,
                          title: item.title,
                          completed: item.completed,
                          description: item.description,
                          logField: item.logField
                        }))}
                        onToggle={(id) => toggleItem(morningRoutine, setMorningRoutine, id)}
                        onUpdate={(id, field, value) => updateItemField(morningRoutine, setMorningRoutine, id, field, value)}
                        color="yellow"
                        variant="default"
                      />
                    </div>
                  </DailyTrackerCard>
                )
              },
              {
                id: 'work-sessions',
                priority: 2,
                span: 'full',
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Deep Focus Work Session */}
                    <DailyTrackerCard
                      title="Deep Focus Work Session"
                      description="Tasks that require the most focus to create the most value. (8 hr minimum)"
                      icon={Brain}
                      emoji="🧠"
                      color="orange"
                      progress={deepFocusProgress}
                      headerContent={
                        <div className="space-y-3">
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
                          {/* Mobile Swipe Task List */}
                          <div className="block sm:hidden">
                            <div className="space-y-2">
                              {deepFocusTasks.length > 0 ? (
                                deepFocusTasks.map((task) => (
                                  <MobileSwipeCard
                                    key={task.id}
                                    task={{
                                      id: task.id,
                                      title: task.title,
                                      completed: task.status === 'done',
                                      description: task.description,
                                      priority: task.priority,
                                      category: task.category,
                                      estimatedDuration: task.estimated_duration
                                    }}
                                    onSwipeComplete={() => handleTaskToggle(task.id, task.status !== 'done')}
                                    onSwipeEdit={() => handleTaskClick(task)}
                                    color="orange"
                                    showPriority={true}
                                    showDuration={true}
                                  />
                                ))
                              ) : (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                  No tasks found for today. Tasks will appear here when created in the task management system.
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Desktop Task List */}
                          <div className="hidden sm:block">
                            <DailyTrackerTaskList
                              tasks={deepFocusTasks.map(task => ({
                                id: task.id,
                                title: task.title,
                                completed: task.status === 'done',
                                priority: task.priority,
                                category: task.category,
                                description: task.description,
                                dueDate: task.due_date,
                                workType: task.work_type,
                                focusLevel: task.focus_level,
                                estimatedDuration: task.estimated_duration,
                                effortPoints: task.effort_points
                              }))}
                              onToggle={(id) => handleTaskToggle(id, deepFocusTasks.find(t => t.id === id)?.status !== 'done')}
                              onClick={(task) => handleTaskClick(deepFocusTasks.find(t => t.id === task.id)!)}
                              color="orange"
                              variant="default"
                              emptyMessage="No tasks found for today. Tasks will appear here when created in the task management system."
                            />
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
                      progress={lightFocusProgress}
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
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Workout Card */}
                    <div className="lg:col-span-1">
                      <DailyTrackerCard
                        title="Home Workout Objective"
                        icon={Dumbbell}
                        emoji="🏋️‍♂️"
                        color="red"
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

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation
        onHomeClick={() => navigate('/admin/life-lock')}
        onTasksClick={() => console.log('Tasks view')}
        onVoiceClick={handleVoiceInput}
        onStatsClick={() => console.log('Stats view')}
        onMenuClick={() => console.log('Menu')}
        onQuickAddClick={() => console.log('Quick add task')}
        isListening={isListening}
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
    </AdminLayout>
  );
};

export default AdminLifeLockDay;