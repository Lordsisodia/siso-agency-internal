import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Interface definitions for LifeLock data structures
export interface DailyRoutineItem {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  logField?: string;
  logValue?: string;
}

export interface DailyRoutine {
  id?: string;
  user_id?: string;
  date: string;
  routine_type: 'morning' | 'evening';
  items: DailyRoutineItem[];
  completed_count: number;
  total_count: number;
  completion_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutExercise {
  id: string;
  title: string;
  completed: boolean;
  target: string;
  logged: string;
}

export interface DailyWorkout {
  id?: string;
  user_id?: string;
  date: string;
  exercises: WorkoutExercise[];
  total_exercises: number;
  completed_exercises: number;
  completion_percentage: number;
  duration_minutes?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HealthItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Meals {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface Macros {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

export interface DailyHealth {
  id?: string;
  user_id?: string;
  date: string;
  health_checklist: HealthItem[];
  meals: Meals;
  macros: Macros;
  water_intake_ml: number;
  milk_intake_ml: number;
  sleep_hours: number;
  energy_level?: number;
  mood_level?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyHabits {
  id?: string;
  user_id?: string;
  date: string;
  screen_time_minutes: number;
  bullshit_content_minutes: number;
  no_weed: boolean;
  no_scrolling: boolean;
  deep_work_hours: number;
  light_work_hours: number;
  habits_data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface DailyReflections {
  id?: string;
  user_id?: string;
  date: string;
  went_well: string[];
  even_better_if: string[];
  analysis: string[];
  patterns: string[];
  changes: string[];
  overall_rating?: number;
  key_learnings?: string;
  tomorrow_focus?: string;
  created_at?: string;
  updated_at?: string;
}

export class LifeLockService {
  
  /**
   * Get or create daily routine for a specific date
   */
  static async getDailyRoutine(date: Date = new Date(), routineType: 'morning' | 'evening' = 'morning'): Promise<DailyRoutine | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const dateStr = format(date, 'yyyy-MM-dd');
      
      let { data, error } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .eq('routine_type', routineType)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily routine:', error);
        return null;
      }

      // If no routine exists, create default morning routine
      if (!data) {
        const defaultItems: DailyRoutineItem[] = [
          { id: '1', title: 'Wake Up', completed: false, description: 'Start the day before midday to maximize productivity.' },
          { id: '2', title: 'Get Blood Flowing (5 min)', completed: false, description: 'Max rep push-ups (Target PB: 30).', logField: 'Log reps: ____' },
          { id: '3', title: 'Hydrate (5 min)', completed: false, description: 'Drink 500 ml water to start the day.' },
          { id: '4', title: 'Supplements & Pre-Workout (5 min)', completed: false, description: 'Take omega-3, multivitamin, ashwagandha, and pre-workout.' },
          { id: '5', title: 'Shower (15 min)', completed: false, description: 'Cold shower to wake up and energize.' },
          { id: '6', title: 'Brush Teeth (5 min)', completed: false, description: 'Maintain dental hygiene and fresh breath.' },
          { id: '7', title: 'Review & Plan Day (15 min)', completed: false, description: 'Go through tasks, prioritize, and allocate time slots.' },
          { id: '8', title: 'Meditation (2 min)', completed: false, description: 'Meditate to set an innovative mindset for creating business value.' }
        ];

        const newRoutine = {
          user_id: user.id,
          date: dateStr,
          routine_type: routineType,
          items: defaultItems,
          completed_count: 0,
          total_count: defaultItems.length,
          completion_percentage: 0
        };

        const { data: created, error: createError } = await supabase
          .from('daily_routines')
          .insert(newRoutine)
          .select()
          .single();

        if (createError) {
          console.error('Error creating daily routine:', createError);
          return null;
        }

        data = created;
      }

      return {
        ...data,
        date: data.date,
        items: data.items || []
      };

    } catch (error) {
      console.error('Failed to get daily routine:', error);
      return null;
    }
  }

  /**
   * Update daily routine
   */
  static async updateDailyRoutine(routine: DailyRoutine): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const completedCount = routine.items.filter(item => item.completed).length;
      const completionPercentage = routine.items.length > 0 ? (completedCount / routine.items.length) * 100 : 0;

      const { error } = await supabase
        .from('daily_routines')
        .update({
          items: routine.items,
          completed_count: completedCount,
          total_count: routine.items.length,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', routine.date)
        .eq('routine_type', routine.routine_type);

      if (error) {
        console.error('Error updating daily routine:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update daily routine:', error);
      return false;
    }
  }

  /**
   * Get or create daily workout for a specific date
   */
  static async getDailyWorkout(date: Date = new Date()): Promise<DailyWorkout | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const dateStr = format(date, 'yyyy-MM-dd');
      
      let { data, error } = await supabase
        .from('daily_workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily workout:', error);
        return null;
      }

      // If no workout exists, create default
      if (!data) {
        const defaultExercises: WorkoutExercise[] = [
          { id: '1', title: 'Push-ups', completed: false, target: '50 reps', logged: '' },
          { id: '2', title: 'Squats', completed: false, target: '100 reps', logged: '' },
          { id: '3', title: 'Plank', completed: false, target: '2 minutes', logged: '' },
          { id: '4', title: 'Burpees', completed: false, target: '20 reps', logged: '' },
          { id: '5', title: 'Mountain Climbers', completed: false, target: '50 reps', logged: '' }
        ];

        const newWorkout = {
          user_id: user.id,
          date: dateStr,
          exercises: defaultExercises,
          total_exercises: defaultExercises.length,
          completed_exercises: 0,
          completion_percentage: 0
        };

        const { data: created, error: createError } = await supabase
          .from('daily_workouts')
          .insert(newWorkout)
          .select()
          .single();

        if (createError) {
          console.error('Error creating daily workout:', createError);
          return null;
        }

        data = created;
      }

      return {
        ...data,
        exercises: data.exercises || []
      };

    } catch (error) {
      console.error('Failed to get daily workout:', error);
      return null;
    }
  }

  /**
   * Update daily workout
   */
  static async updateDailyWorkout(workout: DailyWorkout): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const completedCount = workout.exercises.filter(ex => ex.completed).length;
      const completionPercentage = workout.exercises.length > 0 ? (completedCount / workout.exercises.length) * 100 : 0;

      const { error } = await supabase
        .from('daily_workouts')
        .update({
          exercises: workout.exercises,
          completed_exercises: completedCount,
          total_exercises: workout.exercises.length,
          completion_percentage: completionPercentage,
          duration_minutes: workout.duration_minutes,
          notes: workout.notes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', workout.date);

      if (error) {
        console.error('Error updating daily workout:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update daily workout:', error);
      return false;
    }
  }

  /**
   * Get or create daily health record for a specific date
   */
  static async getDailyHealth(date: Date = new Date()): Promise<DailyHealth | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const dateStr = format(date, 'yyyy-MM-dd');
      
      let { data, error } = await supabase
        .from('daily_health')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily health:', error);
        return null;
      }

      // If no health record exists, create default
      if (!data) {
        const defaultHealthItems: HealthItem[] = [
          { id: '1', title: 'Take vitamins/supplements', completed: false },
          { id: '2', title: 'Drink 2L+ water', completed: false },
          { id: '3', title: 'No smoking THC', completed: false },
          { id: '4', title: 'Eat balanced meals', completed: false },
          { id: '5', title: 'Get 7+ hours sleep', completed: false }
        ];

        const newHealth = {
          user_id: user.id,
          date: dateStr,
          health_checklist: defaultHealthItems,
          meals: { breakfast: '', lunch: '', dinner: '', snacks: '' },
          macros: { calories: '', protein: '', carbs: '', fats: '' },
          water_intake_ml: 0,
          milk_intake_ml: 0,
          sleep_hours: 0
        };

        const { data: created, error: createError } = await supabase
          .from('daily_health')
          .insert(newHealth)
          .select()
          .single();

        if (createError) {
          console.error('Error creating daily health:', createError);
          return null;
        }

        data = created;
      }

      return {
        ...data,
        health_checklist: data.health_checklist || [],
        meals: data.meals || { breakfast: '', lunch: '', dinner: '', snacks: '' },
        macros: data.macros || { calories: '', protein: '', carbs: '', fats: '' }
      };

    } catch (error) {
      console.error('Failed to get daily health:', error);
      return null;
    }
  }

  /**
   * Update daily health record
   */
  static async updateDailyHealth(health: DailyHealth): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('daily_health')
        .update({
          health_checklist: health.health_checklist,
          meals: health.meals,
          macros: health.macros,
          water_intake_ml: health.water_intake_ml,
          milk_intake_ml: health.milk_intake_ml,
          sleep_hours: health.sleep_hours,
          energy_level: health.energy_level,
          mood_level: health.mood_level,
          notes: health.notes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', health.date);

      if (error) {
        console.error('Error updating daily health:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update daily health:', error);
      return false;
    }
  }

  /**
   * Update milk intake for a specific date
   */
  static async updateMilkIntake(date: Date, milkIntakeMl: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const dateStr = format(date, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('daily_health')
        .update({
          milk_intake_ml: milkIntakeMl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', dateStr);

      if (error) {
        console.error('Error updating milk intake:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update milk intake:', error);
      return false;
    }
  }

  /**
   * Get or create daily habits for a specific date
   */
  static async getDailyHabits(date: Date = new Date()): Promise<DailyHabits | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const dateStr = format(date, 'yyyy-MM-dd');
      
      let { data, error } = await supabase
        .from('daily_habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily habits:', error);
        return null;
      }

      // If no habits record exists, create default
      if (!data) {
        const newHabits = {
          user_id: user.id,
          date: dateStr,
          screen_time_minutes: 0,
          bullshit_content_minutes: 0,
          no_weed: false,
          no_scrolling: false,
          deep_work_hours: 0,
          light_work_hours: 0,
          habits_data: {
            lightFocusTasks: [
              { id: '1', title: '', completed: false },
              { id: '2', title: '', completed: false },
              { id: '3', title: '', completed: false },
              { id: '4', title: '', completed: false },
              { id: '5', title: '', completed: false }
            ]
          }
        };

        const { data: created, error: createError } = await supabase
          .from('daily_habits')
          .insert(newHabits)
          .select()
          .single();

        if (createError) {
          console.error('Error creating daily habits:', createError);
          return null;
        }

        data = created;
      }

      // Ensure habits_data has the expected structure
      if (!data.habits_data || !data.habits_data.lightFocusTasks) {
        data.habits_data = {
          ...data.habits_data,
          lightFocusTasks: [
            { id: '1', title: '', completed: false },
            { id: '2', title: '', completed: false },
            { id: '3', title: '', completed: false },
            { id: '4', title: '', completed: false },
            { id: '5', title: '', completed: false }
          ]
        };
      }

      return data;

    } catch (error) {
      console.error('Failed to get daily habits:', error);
      return null;
    }
  }

  /**
   * Update daily habits
   */
  static async updateDailyHabits(habits: DailyHabits): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('daily_habits')
        .update({
          screen_time_minutes: habits.screen_time_minutes,
          bullshit_content_minutes: habits.bullshit_content_minutes,
          no_weed: habits.no_weed,
          no_scrolling: habits.no_scrolling,
          deep_work_hours: habits.deep_work_hours,
          light_work_hours: habits.light_work_hours,
          habits_data: habits.habits_data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', habits.date);

      if (error) {
        console.error('Error updating daily habits:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update daily habits:', error);
      return false;
    }
  }

  /**
   * Get or create daily reflections for a specific date
   */
  static async getDailyReflections(date: Date = new Date()): Promise<DailyReflections | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const dateStr = format(date, 'yyyy-MM-dd');
      
      let { data, error } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily reflections:', error);
        return null;
      }

      // If no reflections record exists, create default
      if (!data) {
        const newReflections = {
          user_id: user.id,
          date: dateStr,
          went_well: ['', '', ''],
          even_better_if: ['', '', '', '', ''],
          analysis: ['', '', ''],
          patterns: ['', '', ''],
          changes: ['', '', '']
        };

        const { data: created, error: createError } = await supabase
          .from('daily_reflections')
          .insert(newReflections)
          .select()
          .single();

        if (createError) {
          console.error('Error creating daily reflections:', createError);
          return null;
        }

        data = created;
      }

      return data;

    } catch (error) {
      console.error('Failed to get daily reflections:', error);
      return null;
    }
  }

  /**
   * Update daily reflections
   */
  static async updateDailyReflections(reflections: DailyReflections): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('daily_reflections')
        .update({
          went_well: reflections.went_well,
          even_better_if: reflections.even_better_if,
          analysis: reflections.analysis,
          patterns: reflections.patterns,
          changes: reflections.changes,
          overall_rating: reflections.overall_rating,
          key_learnings: reflections.key_learnings,
          tomorrow_focus: reflections.tomorrow_focus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('date', reflections.date);

      if (error) {
        console.error('Error updating daily reflections:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update daily reflections:', error);
      return false;
    }
  }

  /**
   * Migrate localStorage data to Supabase
   */
  static async migrateLocalStorageData(date: Date = new Date()): Promise<boolean> {
    try {
      const dateKey = format(date, 'yyyy-MM-dd');
      
      // Helper function to get localStorage data
      const getLocalData = (key: string, defaultValue: any) => {
        try {
          const stored = localStorage.getItem(`lifelock-${dateKey}-${key}`);
          return stored ? JSON.parse(stored) : defaultValue;
        } catch {
          return defaultValue;
        }
      };

      // Migrate morning routine
      const morningRoutineData = getLocalData('morningRoutine', null);
      if (morningRoutineData) {
        const routine: DailyRoutine = {
          date: dateKey,
          routine_type: 'morning',
          items: morningRoutineData,
          completed_count: morningRoutineData.filter((item: any) => item.completed).length,
          total_count: morningRoutineData.length,
          completion_percentage: (morningRoutineData.filter((item: any) => item.completed).length / morningRoutineData.length) * 100
        };
        await this.updateDailyRoutine(routine);
      }

      // Migrate workout data
      const workoutData = getLocalData('workoutItems', null);
      if (workoutData) {
        const workout: DailyWorkout = {
          date: dateKey,
          exercises: workoutData,
          total_exercises: workoutData.length,
          completed_exercises: workoutData.filter((item: any) => item.completed).length,
          completion_percentage: (workoutData.filter((item: any) => item.completed).length / workoutData.length) * 100
        };
        await this.updateDailyWorkout(workout);
      }

      // Migrate health data
      const healthItems = getLocalData('healthItems', null);
      const macros = getLocalData('macros', { calories: '', protein: '', carbs: '', fats: '' });
      if (healthItems) {
        const health: DailyHealth = {
          date: dateKey,
          health_checklist: healthItems,
          meals: { breakfast: '', lunch: '', dinner: '', snacks: '' },
          macros: macros,
          water_intake_ml: 0,
          milk_intake_ml: 0,
          sleep_hours: 0
        };
        await this.updateDailyHealth(health);
      }

      // Migrate work hours to habits
      const workHours = getLocalData('workHours', { deepFocus: '', lightFocus: '' });
      const lightFocusTasks = getLocalData('lightFocusTasks', [
        { id: '1', title: '', completed: false },
        { id: '2', title: '', completed: false },
        { id: '3', title: '', completed: false },
        { id: '4', title: '', completed: false },
        { id: '5', title: '', completed: false }
      ]);
      
      const habits: DailyHabits = {
        date: dateKey,
        screen_time_minutes: 0,
        bullshit_content_minutes: 0,
        no_weed: false,
        no_scrolling: false,
        deep_work_hours: parseFloat(workHours.deepFocus) || 0,
        light_work_hours: parseFloat(workHours.lightFocus) || 0,
        habits_data: {
          lightFocusTasks: lightFocusTasks
        }
      };
      await this.updateDailyHabits(habits);

      console.log(`✅ Successfully migrated localStorage data for ${dateKey}`);
      return true;

    } catch (error) {
      console.error('Failed to migrate localStorage data:', error);
      return false;
    }
  }

  /**
   * Get all daily data for a specific date with improved error handling
   */
  static async getAllDailyData(date: Date = new Date()) {
    console.log('LifeLockService: Starting getAllDailyData for', format(date, 'yyyy-MM-dd'));
    
    // Check authentication first
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('LifeLockService: Authentication failed:', error);
        return {
          routine: null,
          workout: null,
          health: null,
          habits: null,
          reflections: null
        };
      }
      console.log('LifeLockService: User authenticated:', user.id);
    } catch (authError) {
      console.error('LifeLockService: Authentication error:', authError);
      return {
        routine: null,
        workout: null,
        health: null,
        habits: null,
        reflections: null
      };
    }

    // Load data sequentially with individual error handling to prevent total failure
    const results = {
      routine: null as DailyRoutine | null,
      workout: null as DailyWorkout | null,
      health: null as DailyHealth | null,
      habits: null as DailyHabits | null,
      reflections: null as DailyReflections | null
    };

    // Load routine data with timeout
    try {
      console.log('LifeLockService: Loading routine data...');
      const routinePromise = this.getDailyRoutine(date);
      const routineTimeout = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Routine timeout')), 5000)
      );
      results.routine = await Promise.race([routinePromise, routineTimeout]);
      console.log('LifeLockService: Routine data loaded successfully');
    } catch (error) {
      console.error('LifeLockService: Failed to load routine data:', error);
      results.routine = null;
    }

    // Load workout data with timeout
    try {
      console.log('LifeLockService: Loading workout data...');
      const workoutPromise = this.getDailyWorkout(date);
      const workoutTimeout = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Workout timeout')), 5000)
      );
      results.workout = await Promise.race([workoutPromise, workoutTimeout]);
      console.log('LifeLockService: Workout data loaded successfully');
    } catch (error) {
      console.error('LifeLockService: Failed to load workout data:', error);
      results.workout = null;
    }

    // Load health data with timeout
    try {
      console.log('LifeLockService: Loading health data...');
      const healthPromise = this.getDailyHealth(date);
      const healthTimeout = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Health timeout')), 5000)
      );
      results.health = await Promise.race([healthPromise, healthTimeout]);
      console.log('LifeLockService: Health data loaded successfully');
    } catch (error) {
      console.error('LifeLockService: Failed to load health data:', error);
      results.health = null;
    }

    // Load habits data with timeout
    try {
      console.log('LifeLockService: Loading habits data...');
      const habitsPromise = this.getDailyHabits(date);
      const habitsTimeout = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Habits timeout')), 5000)
      );
      results.habits = await Promise.race([habitsPromise, habitsTimeout]);
      console.log('LifeLockService: Habits data loaded successfully');
    } catch (error) {
      console.error('LifeLockService: Failed to load habits data:', error);
      results.habits = null;
    }

    // Load reflections data with timeout
    try {
      console.log('LifeLockService: Loading reflections data...');
      const reflectionsPromise = this.getDailyReflections(date);
      const reflectionsTimeout = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Reflections timeout')), 5000)
      );
      results.reflections = await Promise.race([reflectionsPromise, reflectionsTimeout]);
      console.log('LifeLockService: Reflections data loaded successfully');
    } catch (error) {
      console.error('LifeLockService: Failed to load reflections data:', error);
      results.reflections = null;
    }

    console.log('LifeLockService: Completed getAllDailyData with results:', results);
    return results;
  }
}