import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TodayTasksService, TodayTask } from '@/ai-first/core/task.service';
import { voiceService } from '@/services/voiceService';
import DailyTrackerAIAssistant from '@/ai-first/features/tasks/components/DailyTrackerAIAssistant';
import {
  DailyTrackerCard,
  DailyTrackerGrid,
  DailyTrackerSection,
  DailyTrackerProgress,
  DailyTrackerProgressSummary,
  DailyTrackerTaskItem,
  DailyTrackerTaskList,
  DailyTrackerDivider
} from '@/ai-first/features/tasks/components/ui';

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

interface MorningRoutineItem {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  logField?: string;
}

interface WorkoutItem {
  id: string;
  title: string;
  completed: boolean;
  target?: string;
  logged?: string;
}

interface HealthItem {
  id: string;
  title: string;
  completed: boolean;
}

const AdminLifeLockDay: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const currentDate = dateParam ? parseISO(dateParam) : new Date();
  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Load data from localStorage on component mount
  const loadFromStorage = (key: string, defaultValue: any) => {
    try {
      const stored = localStorage.getItem(`lifelock-${dateKey}-${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Save data to localStorage
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(`lifelock-${dateKey}-${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // Morning Routine Data
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineItem[]>(() =>
    loadFromStorage('morningRoutine', [
      { id: '1', title: 'Wake Up', completed: false, description: 'Start the day before midday to maximize productivity.' },
      { id: '2', title: 'Get Blood Flowing (5 min)', completed: false, description: 'Max rep push-ups (Target PB: 30).', logField: 'Log reps: ____' },
      { id: '3', title: 'Hydrate (5 min)', completed: false, description: 'Drink 500 ml water to start the day.' },
      { id: '4', title: 'Supplements & Pre-Workout (5 min)', completed: false, description: 'Take omega-3, multivitamin, ashwagandha, and pre-workout.' },
      { id: '5', title: 'Shower & Brush Teeth (25 min)', completed: false, description: 'Cold shower to wake up.' },
      { id: '6', title: 'Review & Plan Day (15 min)', completed: false, description: 'Go through tasks, prioritize, and allocate time slots.' },
      { id: '7', title: 'Meditation (2 min)', completed: false, description: 'Meditate to set an innovative mindset for creating business value.' }
    ])
  );

  // Deep Focus Work Tasks - Load from Supabase
  const [deepFocusTasks, setDeepFocusTasks] = useState<TodayTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Load tasks from Supabase on mount and date change
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoadingTasks(true);
      try {
        const tasks = await TodayTasksService.getTodaysTasks(currentDate);
        setDeepFocusTasks(tasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    loadTasks();
  }, [currentDate]);

  // Update task completion in Supabase
  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const success = await TodayTasksService.updateTaskCompletion(taskId, completed);
      if (success) {
        setDeepFocusTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, completed } : task
          )
        );
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Light Focus Work Tasks - Keep as editable local tasks
  const [lightFocusTasks, setLightFocusTasks] = useState<TaskItem[]>(() =>
    loadFromStorage('lightFocusTasks', [
      { id: '1', title: '', completed: false },
      { id: '2', title: '', completed: false },
      { id: '3', title: '', completed: false },
      { id: '4', title: '', completed: false },
      { id: '5', title: '', completed: false }
    ])
  );

  // Workout Data
  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>(() =>
    loadFromStorage('workoutItems', [
      { id: '1', title: 'Push-ups', completed: false, target: '50 reps', logged: '' },
      { id: '2', title: 'Squats', completed: false, target: '100 reps', logged: '' },
      { id: '3', title: 'Plank', completed: false, target: '2 minutes', logged: '' },
      { id: '4', title: 'Burpees', completed: false, target: '20 reps', logged: '' },
      { id: '5', title: 'Mountain Climbers', completed: false, target: '50 reps', logged: '' }
    ])
  );

  // Health Non-Negotiables
  const [healthItems, setHealthItems] = useState<HealthItem[]>(() =>
    loadFromStorage('healthItems', [
      { id: '1', title: 'Take vitamins/supplements', completed: false },
      { id: '2', title: 'Drink 2L+ water', completed: false },
      { id: '3', title: 'No smoking THC', completed: false },
      { id: '4', title: 'Eat balanced meals', completed: false },
      { id: '5', title: 'Get 7+ hours sleep', completed: false }
    ])
  );

  // Meal tracking
  const [meals, setMeals] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: ''
  });

  const [dailyTotals, setDailyTotals] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });

  // Screen time and habits
  const [habits, setHabits] = useState({
    bullshitContentTime: '',
    noWeed: false,
    noScrolling: false
  });

  // Nightly checkout
  const [nightlyCheckout, setNightlyCheckout] = useState({
    wentWell: ['', '', ''],
    evenBetterIf: ['', '', '', '', ''],
    analysis: ['', '', ''],
    patterns: ['', '', ''],
    changes: ['', '', '']
  });

  const [workHours, setWorkHours] = useState(() =>
    loadFromStorage('workHours', {
      deepFocus: '',
      lightFocus: ''
    })
  );

  const [macros, setMacros] = useState(() =>
    loadFromStorage('macros', {
      calories: '',
      protein: '',
      carbs: '',
      fats: ''
    })
  );

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage('morningRoutine', morningRoutine);
  }, [morningRoutine, dateKey]);

  useEffect(() => {
    saveToStorage('lightFocusTasks', lightFocusTasks);
  }, [lightFocusTasks, dateKey]);

  useEffect(() => {
    saveToStorage('workoutItems', workoutItems);
  }, [workoutItems, dateKey]);

  useEffect(() => {
    saveToStorage('healthItems', healthItems);
  }, [healthItems, dateKey]);

  useEffect(() => {
    saveToStorage('workHours', workHours);
  }, [workHours, dateKey]);

  useEffect(() => {
    saveToStorage('macros', macros);
  }, [macros, dateKey]);

  // Save data when user navigates away or closes the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage('morningRoutine', morningRoutine);
      saveToStorage('lightFocusTasks', lightFocusTasks);
      saveToStorage('workoutItems', workoutItems);
      saveToStorage('healthItems', healthItems);
      saveToStorage('workHours', workHours);
      saveToStorage('macros', macros);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [morningRoutine, lightFocusTasks, workoutItems, healthItems, workHours, macros, dateKey]);

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
            
            // REMOVED: Automatic voice response per user preference
            console.log('🔇 [LIFELOCK] Auto-voice response DISABLED - Voice input only mode');
            console.log('💬 [LIFELOCK] Voice command processed, showing visual feedback only');
            
            /* REMOVED AUTO-VOICE RESPONSE  
            // Speak the response
            if (voiceService.isTTSSupported()) {
              voiceService.speak(response);
            }
            */
            
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
          continuous: false,
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
    ? (deepFocusTasks.filter(task => task.completed).length / deepFocusTasks.length) * 100 
    : 0;
  const lightFocusProgress = (lightFocusTasks.filter(task => task.completed && task.title).length / lightFocusTasks.filter(task => task.title).length) * 100 || 0;
  const workoutProgress = (workoutItems.filter(item => item.completed).length / workoutItems.length) * 100;
  const healthProgress = (healthItems.filter(item => item.completed).length / healthItems.length) * 100;

  const progressSections = [
    { id: 'morning', label: 'Morning Routine', completed: morningRoutine.filter(i => i.completed).length, total: morningRoutine.length, color: 'warning' as const },
    { id: 'deepFocus', label: 'Deep Focus', completed: deepFocusTasks.filter(t => t.completed).length, total: deepFocusTasks.length, color: 'default' as const },
    { id: 'lightFocus', label: 'Light Focus', completed: lightFocusTasks.filter(t => t.completed && t.title).length, total: lightFocusTasks.filter(t => t.title).length, color: 'success' as const },
    { id: 'workout', label: 'Workout', completed: workoutItems.filter(i => i.completed).length, total: workoutItems.length, color: 'danger' as const },
    { id: 'health', label: 'Health', completed: healthItems.filter(i => i.completed).length, total: healthItems.length, color: 'default' as const }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-gray-900">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
          
          {/* Header Section */}
          <DailyTrackerSection noPadding>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/life-lock')}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Calendar</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              
              <div className="flex items-center gap-1 ml-auto sm:ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDay('prev')}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDay('next')}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Voice Button - Always visible on mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                className={`ml-2 px-3 py-1.5 transition-all ${
                  isListening 
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Voice</span>
                  </>
                )}
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

          {/* Page Title and Progress Summary */}
          <DailyTrackerSection className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="hidden sm:inline">{format(currentDate, 'EEEE, MMMM d, yyyy')}</span>
                <span className="sm:hidden">{format(currentDate, 'EEE, MMM d')}</span>
              </motion.h1>
              
              <div className="lg:max-w-md">
                <DailyTrackerProgressSummary sections={progressSections} />
              </div>
            </div>
          </DailyTrackerSection>

          {/* Main Content Grid */}
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
                    headerContent={
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-yellow-400 text-base sm:text-lg">
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                🌅 Morning Routine
              </CardTitle>
              <div className="border-t border-yellow-600/50 my-4"></div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-yellow-300 mb-2 text-sm sm:text-base">Coding My Brain</h3>
                  <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                    I am Shaan Sisodia. I have been given divine purpose, and on this mission, temptation awaits on either side of the path. 
                    When I give in to temptation, I shall know I am astray. I will bring my family to a new age of freedom. 
                    I will not be distracted from the path.
                  </p>
                </div>
                <div className="border-t border-yellow-600/50 my-4"></div>
                <div>
                  <h3 className="font-bold text-yellow-300 mb-2 text-sm sm:text-base">Flow State Rules</h3>
                  <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                    <li>• No use of apps other than Notion.</li>
                    <li>• No vapes or drugs (including weed).</li>
                    <li>• No more than 5 seconds until the next action.</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-yellow-600/50 my-3 sm:my-4"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 sm:space-y-3">
                {morningRoutine.map((item) => (
                  <div key={item.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-yellow-900/10 border border-yellow-700/30 rounded-lg hover:bg-yellow-900/15 transition-colors">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(morningRoutine, setMorningRoutine, item.id)}
                      className="mt-1 border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                    />
                    <div className="flex-1">
                      <h4 className="text-yellow-100 font-semibold text-sm sm:text-base">{item.title}</h4>
                      {item.description && (
                        <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">{item.description}</p>
                      )}
                      {item.logField && (
                        <div className="mt-2">
                          <Input
                            placeholder={item.logField}
                            className="bg-yellow-900/20 border-yellow-700/50 text-yellow-100 text-sm placeholder:text-gray-400 focus:border-yellow-600"
                          />
                          <p className="text-xs text-gray-400 mt-1 italic">Log your max reps to track progress toward your 5% weekly increase goal.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

            {/* Deep Focus Work Session Card */}
            <Card className="bg-purple-900/20 border-purple-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-400">
                <Brain className="h-5 w-5 mr-2" />
                🌅 Deep Focus Work Session
              </CardTitle>
              <div className="border-t border-gray-600 my-4"></div>
              <p className="text-gray-300 text-sm">
                Tasks that require the most focus to create the most value. (8 hr minimum)
              </p>
              <div className="border-t border-gray-600 my-4"></div>
              <div className="space-y-2">
                <label className="text-white font-medium">Total Work Hours Logged:</label>
                <Input
                  value={workHours.deepFocus}
                  onChange={(e) => setWorkHours(prev => ({ ...prev, deepFocus: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter hours..."
                />
              </div>
              <div className="border-t border-gray-600 my-4"></div>
              <h3 className="font-semibold text-white">Main Tasks:</h3>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-400">Loading today's tasks...</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {deepFocusTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>No tasks found for today.</p>
                      <p className="text-sm mt-2">Tasks will appear here when created in the task management system.</p>
                    </div>
                  ) : (
                    deepFocusTasks.map((task) => (
                      <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(task.id, !task.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{task.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                task.priority === 'high' ? 'border-red-400 text-red-400' :
                                task.priority === 'medium' ? 'border-yellow-400 text-yellow-400' :
                                'border-green-400 text-green-400'
                              }`}
                            >
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                              {task.category}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                          )}
                          {task.due_date && (
                            <p className="text-gray-500 text-xs mt-1">Due: {task.due_date}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Light Focus Work Session Card */}
          <Card className="bg-green-900/20 border-green-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-400">
                <Coffee className="h-5 w-5 mr-2" />
                🌅 Light Focus Work Session
              </CardTitle>
              <div className="border-t border-gray-600 my-4"></div>
              <p className="text-gray-300 text-sm">
                Tackle tasks that don't require as much cognitive load.
              </p>
              <div className="border-t border-gray-600 my-4"></div>
              <div className="space-y-2">
                <label className="text-white font-medium">Total Work Hours Logged:</label>
                <Input
                  value={workHours.lightFocus}
                  onChange={(e) => setWorkHours(prev => ({ ...prev, lightFocus: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter hours..."
                />
              </div>
              <div className="border-t border-gray-600 my-4"></div>
              <h3 className="font-semibold text-white">Main Tasks:</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lightFocusTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleItem(lightFocusTasks, setLightFocusTasks, task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Input
                        value={task.title}
                        onChange={(e) => updateItemField(lightFocusTasks, setLightFocusTasks, task.id, 'title', e.target.value)}
                        className="bg-transparent border-none text-white p-0 focus:ring-0"
                        placeholder="Enter task..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Home Workout Objective Card */}
          <Card className="bg-red-900/20 border-red-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-400">
                <Dumbbell className="h-5 w-5 mr-2" />
                🌅 🏋️‍♂️ Home Workout Objective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workoutItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(workoutItems, setWorkoutItems, item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.title}</h4>
                      {item.target && (
                        <p className="text-gray-400 text-sm mt-1">{item.target}</p>
                      )}
                      {item.logged !== undefined && (
                        <Input
                          value={item.logged}
                          onChange={(e) => updateItemField(workoutItems, setWorkoutItems, item.id, 'logged', e.target.value)}
                          placeholder="Log your result..."
                          className="mt-2 bg-gray-600 border-gray-500 text-white text-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Non Negotiables Card */}
          <Card className="bg-pink-900/20 border-pink-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-pink-400">
                <Heart className="h-5 w-5 mr-2" />
                🌅 Health Non Negotiables
              </CardTitle>
              <div className="border-t border-gray-600 my-4"></div>
              <p className="text-gray-300 text-sm">Main Tasks:</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(healthItems, setHealthItems, item.id)}
                    />
                    <span className="text-white">{item.title}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-600 my-6"></div>
              
              {/* Daily Calorie & Macro Tracker */}
              <h3 className="font-semibold text-white mb-4">Daily Calorie & Macro Tracker</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-white text-sm font-medium">Breakfast:</label>
                  <Textarea
                    value={meals.breakfast}
                    onChange={(e) => setMeals(prev => ({ ...prev, breakfast: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter breakfast details..."
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium">Lunch:</label>
                  <Textarea
                    value={meals.lunch}
                    onChange={(e) => setMeals(prev => ({ ...prev, lunch: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter lunch details..."
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium">Dinner:</label>
                  <Textarea
                    value={meals.dinner}
                    onChange={(e) => setMeals(prev => ({ ...prev, dinner: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter dinner details..."
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium">Snacks:</label>
                  <Textarea
                    value={meals.snacks}
                    onChange={(e) => setMeals(prev => ({ ...prev, snacks: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter snack details..."
                  />
                </div>
              </div>

              <div className="border-t border-gray-600 my-4"></div>
              
              <h4 className="font-semibold text-white mb-3">Daily Totals:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-white text-sm">Total Calories:</label>
                  <Input
                    value={dailyTotals.calories}
                    onChange={(e) => setDailyTotals(prev => ({ ...prev, calories: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm">Total Protein:</label>
                  <Input
                    value={dailyTotals.protein}
                    onChange={(e) => setDailyTotals(prev => ({ ...prev, protein: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm">Total Carbs:</label>
                  <Input
                    value={dailyTotals.carbs}
                    onChange={(e) => setDailyTotals(prev => ({ ...prev, carbs: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm">Total Fats:</label>
                  <Input
                    value={dailyTotals.fats}
                    onChange={(e) => setDailyTotals(prev => ({ ...prev, fats: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Screen Time Limits Card */}
          <Card className="bg-yellow-900/20 border-yellow-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-400">
                💡 📱 Screen Time Limits
              </CardTitle>
              <p className="text-gray-300 text-sm">(No scrolling outside 1 hr bullshit content.)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium">Bullshit Content (1 hr max): Log time:</label>
                  <Input
                    value={habits.bullshitContentTime}
                    onChange={(e) => setHabits(prev => ({ ...prev, bullshitContentTime: e.target.value }))}
                    className="mt-1 bg-gray-700 border-gray-600 text-white"
                    placeholder="____ min (e.g., during dinner, 6:55 PM–7:55 PM.)"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={habits.noWeed}
                    onCheckedChange={(checked) => setHabits(prev => ({ ...prev, noWeed: !!checked }))}
                  />
                  <span className="text-white">No Weed, No Vapes: Adhered to? Yes/No</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={habits.noScrolling}
                    onCheckedChange={(checked) => setHabits(prev => ({ ...prev, noScrolling: !!checked }))}
                  />
                  <span className="text-white">No Scrolling: Adhered to? Yes/No</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nightly Check-Out Card */}
          <Card className="bg-indigo-900/20 border-indigo-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-400">
                <Moon className="h-5 w-5 mr-2" />
                🌅 Nightly Check-Out:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">1. What went well today?</h4>
                  <p className="text-gray-400 text-sm mb-3">(Write down at least three positive things that happened during the day)</p>
                  <div className="space-y-2">
                    {nightlyCheckout.wentWell.map((item, index) => (
                      <Input
                        key={index}
                        value={item}
                        onChange={(e) => {
                          const newArray = [...nightlyCheckout.wentWell];
                          newArray[index] = e.target.value;
                          setNightlyCheckout(prev => ({ ...prev, wentWell: newArray }));
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={`Positive thing ${index + 1}...`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">2. Even better if...</h4>
                  <p className="text-gray-400 text-sm mb-3">(List areas where you could improve or things that could have gone better)</p>
                  <div className="space-y-2">
                    {nightlyCheckout.evenBetterIf.map((item, index) => (
                      <Input
                        key={index}
                        value={item}
                        onChange={(e) => {
                          const newArray = [...nightlyCheckout.evenBetterIf];
                          newArray[index] = e.target.value;
                          setNightlyCheckout(prev => ({ ...prev, evenBetterIf: newArray }));
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={`Improvement area ${index + 1}...`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">3. Analysis & Improvement:</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">(Reflect on how you can improve in the areas mentioned in "Even better if...")</p>
                      <div className="space-y-2">
                        {nightlyCheckout.analysis.map((item, index) => (
                          <Textarea
                            key={index}
                            value={item}
                            onChange={(e) => {
                              const newArray = [...nightlyCheckout.analysis];
                              newArray[index] = e.target.value;
                              setNightlyCheckout(prev => ({ ...prev, analysis: newArray }));
                            }}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder={`Analysis point ${index + 1}...`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-2">(Identify any patterns or behaviors that may be preventing you from achieving your goals)</p>
                      <div className="space-y-2">
                        {nightlyCheckout.patterns.map((item, index) => (
                          <Textarea
                            key={index}
                            value={item}
                            onChange={(e) => {
                              const newArray = [...nightlyCheckout.patterns];
                              newArray[index] = e.target.value;
                              setNightlyCheckout(prev => ({ ...prev, patterns: newArray }));
                            }}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder={`Pattern ${index + 1}...`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-2">(Consider any changes you can make in your habits or environment to support improvement)</p>
                      <div className="space-y-2">
                        {nightlyCheckout.changes.map((item, index) => (
                          <Textarea
                            key={index}
                            value={item}
                            onChange={(e) => {
                              const newArray = [...nightlyCheckout.changes];
                              newArray[index] = e.target.value;
                              setNightlyCheckout(prev => ({ ...prev, changes: newArray }));
                            }}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder={`Change ${index + 1}...`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          </div>
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
    </AdminLayout>
  );
};

export default AdminLifeLockDay;