/**
 * Supabase Database Adapter
 * Implements DatabaseAdapter interface using Supabase client
 */

import { supabase, TABLES } from '@/shared/lib/supabase';
import type {
  DatabaseAdapter,
  LightWorkTask,
  LightWorkSubtask,
  DeepWorkTask,
  DeepWorkSubtask,
  MorningRoutineTask,
  DailyReflection,
  TaskFilters,
  CreateTaskData,
  UpdateTaskData,
  CreateSubtaskData,
  UpdateSubtaskData,
  Priority
} from './types';

export class SupabaseAdapter implements DatabaseAdapter {
  
  // Light Work Tasks
  async getLightWorkTasks(filters: TaskFilters): Promise<LightWorkTask[]> {
    let query = supabase
      .from(TABLES.LIGHT_WORK_TASKS)
      .select(`
        *,
        subtasks:light_work_subtasks(*)
      `)
      .eq('userId', filters.userId)
      .order('createdAt', { ascending: false });

    if (filters.date && !filters.showAllIncomplete) {
      query = query.eq('currentDate', filters.date);
    }

    if (filters.showAllIncomplete) {
      query = query.eq('completed', false);
    }

    if (filters.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching light work tasks:', error);
      throw new Error(`Failed to fetch light work tasks: ${error.message}`);
    }

    return this.transformLightWorkTasks(data || []);
  }

  async createLightWorkTask(data: CreateTaskData): Promise<LightWorkTask> {
    const { data: result, error } = await supabase
      .from(TABLES.LIGHT_WORK_TASKS)
      .insert({
        userId: data.userId,
        title: data.title,
        description: data.description,
        priority: data.priority || Priority.MEDIUM,
        originalDate: data.originalDate,
        currentDate: data.currentDate,
        completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating light work task:', error);
      throw new Error(`Failed to create light work task: ${error.message}`);
    }

    return this.transformLightWorkTask(result);
  }

  async updateLightWorkTask(id: string, data: UpdateTaskData): Promise<LightWorkTask> {
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.currentDate !== undefined) updateData.currentDate = data.currentDate;
    
    updateData.updatedAt = new Date().toISOString();

    const { data: result, error } = await supabase
      .from(TABLES.LIGHT_WORK_TASKS)
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        subtasks:light_work_subtasks(*)
      `)
      .single();

    if (error) {
      console.error('Error updating light work task:', error);
      throw new Error(`Failed to update light work task: ${error.message}`);
    }

    return this.transformLightWorkTask(result);
  }

  async deleteLightWorkTask(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.LIGHT_WORK_TASKS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting light work task:', error);
      throw new Error(`Failed to delete light work task: ${error.message}`);
    }
  }

  // Light Work Subtasks
  async createLightWorkSubtask(data: CreateSubtaskData): Promise<LightWorkSubtask> {
    const { data: result, error } = await supabase
      .from(TABLES.LIGHT_WORK_SUBTASKS)
      .insert({
        taskId: data.taskId,
        title: data.title,
        completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating light work subtask:', error);
      throw new Error(`Failed to create light work subtask: ${error.message}`);
    }

    return this.transformLightWorkSubtask(result);
  }

  async updateLightWorkSubtask(id: string, data: UpdateSubtaskData): Promise<LightWorkSubtask> {
    const updateData: any = { updatedAt: new Date().toISOString() };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.completed !== undefined) updateData.completed = data.completed;

    const { data: result, error } = await supabase
      .from(TABLES.LIGHT_WORK_SUBTASKS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating light work subtask:', error);
      throw new Error(`Failed to update light work subtask: ${error.message}`);
    }

    return this.transformLightWorkSubtask(result);
  }

  async deleteLightWorkSubtask(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.LIGHT_WORK_SUBTASKS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting light work subtask:', error);
      throw new Error(`Failed to delete light work subtask: ${error.message}`);
    }
  }

  // Deep Work Tasks (similar pattern)
  async getDeepWorkTasks(filters: TaskFilters): Promise<DeepWorkTask[]> {
    let query = supabase
      .from(TABLES.DEEP_WORK_TASKS)
      .select(`
        *,
        subtasks:deep_work_subtasks(*)
      `)
      .eq('userId', filters.userId)
      .order('createdAt', { ascending: false });

    if (filters.date && !filters.showAllIncomplete) {
      query = query.eq('currentDate', filters.date);
    }

    if (filters.showAllIncomplete) {
      query = query.eq('completed', false);
    }

    if (filters.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching deep work tasks:', error);
      throw new Error(`Failed to fetch deep work tasks: ${error.message}`);
    }

    return this.transformDeepWorkTasks(data || []);
  }

  async createDeepWorkTask(data: CreateTaskData): Promise<DeepWorkTask> {
    const { data: result, error } = await supabase
      .from(TABLES.DEEP_WORK_TASKS)
      .insert({
        userId: data.userId,
        title: data.title,
        description: data.description,
        priority: data.priority || Priority.MEDIUM,
        originalDate: data.originalDate,
        currentDate: data.currentDate,
        completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deep work task:', error);
      throw new Error(`Failed to create deep work task: ${error.message}`);
    }

    return this.transformDeepWorkTask(result);
  }

  async updateDeepWorkTask(id: string, data: UpdateTaskData): Promise<DeepWorkTask> {
    const updateData: any = { updatedAt: new Date().toISOString() };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.currentDate !== undefined) updateData.currentDate = data.currentDate;

    const { data: result, error } = await supabase
      .from(TABLES.DEEP_WORK_TASKS)
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        subtasks:deep_work_subtasks(*)
      `)
      .single();

    if (error) {
      console.error('Error updating deep work task:', error);
      throw new Error(`Failed to update deep work task: ${error.message}`);
    }

    return this.transformDeepWorkTask(result);
  }

  async deleteDeepWorkTask(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.DEEP_WORK_TASKS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting deep work task:', error);
      throw new Error(`Failed to delete deep work task: ${error.message}`);
    }
  }

  // Deep Work Subtasks
  async createDeepWorkSubtask(data: CreateSubtaskData): Promise<DeepWorkSubtask> {
    const { data: result, error } = await supabase
      .from(TABLES.DEEP_WORK_SUBTASKS)
      .insert({
        taskId: data.taskId,
        title: data.title,
        completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deep work subtask:', error);
      throw new Error(`Failed to create deep work subtask: ${error.message}`);
    }

    return this.transformDeepWorkSubtask(result);
  }

  async updateDeepWorkSubtask(id: string, data: UpdateSubtaskData): Promise<DeepWorkSubtask> {
    const updateData: any = { updatedAt: new Date().toISOString() };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.completed !== undefined) updateData.completed = data.completed;

    const { data: result, error } = await supabase
      .from(TABLES.DEEP_WORK_SUBTASKS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deep work subtask:', error);
      throw new Error(`Failed to update deep work subtask: ${error.message}`);
    }

    return this.transformDeepWorkSubtask(result);
  }

  async deleteDeepWorkSubtask(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.DEEP_WORK_SUBTASKS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting deep work subtask:', error);
      throw new Error(`Failed to delete deep work subtask: ${error.message}`);
    }
  }

  // Morning Routine Tasks
  async getMorningRoutineTasks(userId: string, date: string): Promise<MorningRoutineTask[]> {
    const { data, error } = await supabase
      .from(TABLES.MORNING_ROUTINE_TASKS)
      .select('*')
      .eq('userId', userId)
      .eq('date', date)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching morning routine tasks:', error);
      throw new Error(`Failed to fetch morning routine tasks: ${error.message}`);
    }

    return this.transformMorningRoutineTasks(data || []);
  }

  async createMorningRoutineTask(data: Omit<MorningRoutineTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MorningRoutineTask> {
    const { data: result, error } = await supabase
      .from(TABLES.MORNING_ROUTINE_TASKS)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error creating morning routine task:', error);
      throw new Error(`Failed to create morning routine task: ${error.message}`);
    }

    return this.transformMorningRoutineTask(result);
  }

  async updateMorningRoutineTask(id: string, data: Partial<MorningRoutineTask>): Promise<MorningRoutineTask> {
    const updateData = { ...data, updatedAt: new Date().toISOString() };

    const { data: result, error } = await supabase
      .from(TABLES.MORNING_ROUTINE_TASKS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating morning routine task:', error);
      throw new Error(`Failed to update morning routine task: ${error.message}`);
    }

    return this.transformMorningRoutineTask(result);
  }

  // Daily Reflections
  async getDailyReflection(userId: string, date: string): Promise<DailyReflection | null> {
    const { data, error } = await supabase
      .from(TABLES.DAILY_REFLECTIONS)
      .select('*')
      .eq('userId', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching daily reflection:', error);
      throw new Error(`Failed to fetch daily reflection: ${error.message}`);
    }

    return data ? this.transformDailyReflection(data) : null;
  }

  async createDailyReflection(data: Omit<DailyReflection, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyReflection> {
    const { data: result, error } = await supabase
      .from(TABLES.DAILY_REFLECTIONS)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error creating daily reflection:', error);
      throw new Error(`Failed to create daily reflection: ${error.message}`);
    }

    return this.transformDailyReflection(result);
  }

  async updateDailyReflection(id: string, data: Partial<DailyReflection>): Promise<DailyReflection> {
    const updateData = { ...data, updatedAt: new Date().toISOString() };

    const { data: result, error } = await supabase
      .from(TABLES.DAILY_REFLECTIONS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating daily reflection:', error);
      throw new Error(`Failed to update daily reflection: ${error.message}`);
    }

    return this.transformDailyReflection(result);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.LIGHT_WORK_TASKS)
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  // Transform methods to convert Supabase data to our interface format
  private transformLightWorkTasks(data: any[]): LightWorkTask[] {
    return data.map(task => this.transformLightWorkTask(task));
  }

  private transformLightWorkTask(data: any): LightWorkTask {
    return {
      id: data.id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      priority: data.priority as Priority,
      completed: data.completed,
      originalDate: data.originalDate,
      currentDate: data.currentDate,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      subtasks: data.subtasks ? data.subtasks.map((st: any) => this.transformLightWorkSubtask(st)) : []
    };
  }

  private transformLightWorkSubtask(data: any): LightWorkSubtask {
    return {
      id: data.id,
      taskId: data.taskId,
      title: data.title,
      completed: data.completed,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  private transformDeepWorkTasks(data: any[]): DeepWorkTask[] {
    return data.map(task => this.transformDeepWorkTask(task));
  }

  private transformDeepWorkTask(data: any): DeepWorkTask {
    return {
      id: data.id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      priority: data.priority as Priority,
      completed: data.completed,
      originalDate: data.originalDate,
      currentDate: data.currentDate,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      subtasks: data.subtasks ? data.subtasks.map((st: any) => this.transformDeepWorkSubtask(st)) : []
    };
  }

  private transformDeepWorkSubtask(data: any): DeepWorkSubtask {
    return {
      id: data.id,
      taskId: data.taskId,
      title: data.title,
      completed: data.completed,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  private transformMorningRoutineTasks(data: any[]): MorningRoutineTask[] {
    return data.map(task => this.transformMorningRoutineTask(task));
  }

  private transformMorningRoutineTask(data: any): MorningRoutineTask {
    return {
      id: data.id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      completed: data.completed,
      date: data.date,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  private transformDailyReflection(data: any): DailyReflection {
    return {
      id: data.id,
      userId: data.userId,
      date: data.date,
      content: data.content,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }
}