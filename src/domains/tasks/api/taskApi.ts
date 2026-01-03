/**
 * Advanced Task API Layer
 * Modern API client with React Query integration, optimistic updates, and caching
 */

import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/integrations/supabase/client';
import { calculateTaskProgress } from '@/domains/tasks/utils/taskCardUtils';
import { isFeatureEnabled } from '@/migration/feature-flags';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilters, 
  BulkTaskUpdate,
  TaskAnalytics,
  TaskEvent,
  TaskEventType
} from '@/domains/tasks/types/task.types';

// Query keys for better cache management
export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: TaskFilters) => [...TASK_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
  analytics: () => [...TASK_QUERY_KEYS.all, 'analytics'] as const,
  search: (query: string) => [...TASK_QUERY_KEYS.all, 'search', query] as const,
  user: (userId: string) => [...TASK_QUERY_KEYS.all, 'user', userId] as const,
  project: (projectId: string) => [...TASK_QUERY_KEYS.all, 'project', projectId] as const
} as const;

// Advanced Task API Class
export class TaskAPI {
  private queryClient: QueryClient;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private subscriptions = new Map<string, any>();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.setupRealtimeSubscriptions();
  }

  // Cache management
  private setCache(key: string, data: any, ttl = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCache(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Real-time subscriptions
  private setupRealtimeSubscriptions() {
    const tasksSubscription = supabase
      .channel('tasks_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' }, 
        (payload) => this.handleTaskChange(payload)
      )
      .subscribe();

    this.subscriptions.set('tasks', tasksSubscription);
  }

  private handleTaskChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Invalidate relevant queries
    this.queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    
    // Emit event for external subscribers
    this.emitTaskEvent({
      type: this.mapEventType(eventType),
      task_id: newRecord?.id || oldRecord?.id,
      user_id: newRecord?.assigned_to || oldRecord?.assigned_to || 'system',
      timestamp: new Date().toISOString(),
      data: { new: newRecord, old: oldRecord }
    });
  }

  private mapEventType(supabaseEvent: string): TaskEventType {
    switch (supabaseEvent) {
      case 'INSERT': return TaskEventType.TASK_CREATED;
      case 'UPDATE': return TaskEventType.TASK_UPDATED;
      case 'DELETE': return TaskEventType.TASK_DELETED;
      default: return TaskEventType.TASK_UPDATED;
    }
  }

  private emitTaskEvent(event: TaskEvent) {
    window.dispatchEvent(new CustomEvent('taskEvent', { detail: event }));
  }

  // CRUD Operations with optimistic updates
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const cacheKey = `tasks-${JSON.stringify(filters)}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    let query = supabase.from('tasks').select(`
      *,
      subtasks:tasks!parent_task_id(*),
      dependencies:task_dependencies(*),
      attachments:task_attachments(*),
      comments:task_comments(*)
    `);

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }
    if (filters?.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }
    if (filters?.assigned_to && filters.assigned_to.length > 0) {
      query = query.in('assigned_to', filters.assigned_to);
    }
    if (filters?.project_id && filters.project_id.length > 0) {
      query = query.in('project_id', filters.project_id);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters?.due_date_range) {
      query = query
        .gte('due_date', filters.due_date_range.start)
        .lte('due_date', filters.due_date_range.end);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Transform and compute additional fields
    const tasks = this.transformTasks(data || []);
    this.setCache(cacheKey, tasks);
    
    return tasks;
  }

  async getTask(id: string): Promise<Task> {
    const cached = this.getCache(`task-${id}`);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks:tasks!parent_task_id(*),
        dependencies:task_dependencies(*),
        attachments:task_attachments(*),
        comments:task_comments(*),
        history:task_history(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const task = this.transformTask(data);
    this.setCache(`task-${id}`, task);
    
    return task;
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = this.createOptimisticTask(tempId, taskData);
    
    this.queryClient.setQueryData(TASK_QUERY_KEYS.lists(), (old: Task[] = []) => [
      optimisticTask,
      ...old
    ]);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      const newTask = this.transformTask(data);
      
      // Replace optimistic update with real data
      this.queryClient.setQueryData(TASK_QUERY_KEYS.lists(), (old: Task[] = []) =>
        old.map(task => task.id === tempId ? newTask : task)
      );

      // Cache the new task
      this.setCache(`task-${newTask.id}`, newTask);
      
      return newTask;
    } catch (error) {
      // Revert optimistic update
      this.queryClient.setQueryData(TASK_QUERY_KEYS.lists(), (old: Task[] = []) =>
        old.filter(task => task.id !== tempId)
      );
      throw error;
    }
  }

  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    // Optimistic update
    this.queryClient.setQueryData(TASK_QUERY_KEYS.detail(id), (old: Task) => 
      old ? { ...old, ...updates, updated_at: new Date().toISOString() } : undefined
    );

    this.queryClient.setQueryData(TASK_QUERY_KEYS.lists(), (old: Task[] = []) =>
      old.map(task => 
        task.id === id 
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      )
    );

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTask = this.transformTask(data);
      
      // Update cache with real data
      this.setCache(`task-${id}`, updatedTask);
      this.queryClient.setQueryData(TASK_QUERY_KEYS.detail(id), updatedTask);
      
      return updatedTask;
    } catch (error) {
      // Revert optimistic updates
      this.queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(id) });
      this.queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    // Optimistic update
    this.queryClient.setQueryData(TASK_QUERY_KEYS.lists(), (old: Task[] = []) =>
      old.filter(task => task.id !== id)
    );

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from cache
      this.cache.delete(`task-${id}`);
      this.queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.detail(id) });
      
    } catch (error) {
      // Revert optimistic update
      this.queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      throw error;
    }
  }

  // Bulk operations with transaction support
  async bulkUpdateTasks(updates: BulkTaskUpdate[]): Promise<Task[]> {
    // Optimistic updates
    updates.forEach(({ id, updates: taskUpdates }) => {
      this.queryClient.setQueryData(TASK_QUERY_KEYS.detail(id), (old: Task) => 
        old ? { ...old, ...taskUpdates, updated_at: new Date().toISOString() } : undefined
      );
    });

    this.queryClient.setQueryData(TASK_QUERY_KEYS.lists(), (old: Task[] = []) =>
      old.map(task => {
        const update = updates.find(u => u.id === task.id);
        return update 
          ? { ...task, ...update.updates, updated_at: new Date().toISOString() }
          : task;
      })
    );

    try {
      const { data, error } = await supabase.rpc('bulk_update_tasks', {
        updates: updates.map(u => ({ 
          id: u.id, 
          ...u.updates,
          updated_at: new Date().toISOString()
        }))
      });

      if (error) throw error;

      const updatedTasks = data.map(this.transformTask);
      
      // Update cache
      updatedTasks.forEach(task => {
        this.setCache(`task-${task.id}`, task);
      });
      
      return updatedTasks;
    } catch (error) {
      // Revert optimistic updates
      this.queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      throw error;
    }
  }

  async bulkDeleteTasks(ids: string[]): Promise<void> {
    // Optimistic updates
    this.queryClient.setQueryData(TASK_QUERY_KEYS.lists(), (old: Task[] = []) =>
      old.filter(task => !ids.includes(task.id))
    );

    try {
      const { error } = await supabase.rpc('bulk_delete_tasks', { task_ids: ids });

      if (error) throw error;

      // Remove from cache
      ids.forEach(id => {
        this.cache.delete(`task-${id}`);
        this.queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.detail(id) });
      });
      
    } catch (error) {
      // Revert optimistic update
      this.queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
      throw error;
    }
  }

  // AI-powered features
  async searchTasksAI(query: string, context?: any): Promise<Task[]> {
    const cacheKey = `ai-search-${query}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) return cached;

    const { data, error } = await supabase.functions.invoke('ai-task-search', {
      body: { query, context }
    });

    if (error) throw error;

    const tasks = data.map(this.transformTask);
    this.setCache(cacheKey, tasks, 2 * 60 * 1000); // 2 min cache for AI results
    
    return tasks;
  }

  // Analytics and insights
  async getTaskAnalytics(filters?: TaskFilters, timeRange?: { start: string; end: string }): Promise<TaskAnalytics> {
    const cacheKey = `analytics-${JSON.stringify({ filters, timeRange })}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) return cached;

    const { data, error } = await supabase.rpc('get_task_analytics', {
      filters: filters || {},
      time_range: timeRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    });

    if (error) throw error;

    this.setCache(cacheKey, data);
    return data;
  }

  // Transform raw database data to Task interface
  private transformTask(raw: any): Task {
    return {
      ...raw,
      // Compute additional fields
      is_overdue: raw.due_date ? new Date(raw.due_date) < new Date() : false,
      days_until_due: raw.due_date 
        ? Math.ceil((new Date(raw.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0,
      completion_status: this.calculateCompletionStatus(raw),
      progress_percentage: this.calculateProgressPercentage(raw),
      time_tracked: raw.actual_hours || 0,
      blocked_by: [], // TODO: Calculate from dependencies
      blocking: [], // TODO: Calculate from dependencies
      can_edit: true, // TODO: Calculate based on permissions
      can_delete: true, // TODO: Calculate based on permissions
      can_complete: true, // TODO: Calculate based on status and permissions
      
      // Ensure arrays exist
      subtasks: raw.subtasks || [],
      dependencies: raw.dependencies || [],
      attachments: raw.attachments || [],
      comments: raw.comments || [],
      history: raw.history || [],
      tags: raw.tags || []
    };
  }

  private transformTasks(rawTasks: any[]): Task[] {
    return rawTasks.map(raw => this.transformTask(raw));
  }

  private createOptimisticTask(id: string, data: CreateTaskRequest): Task {
    const now = new Date().toISOString();
    return {
      id,
      title: data.title,
      description: data.description || '',
      status: data.status || 'not_started',
      priority: data.priority || 'medium',
      category: data.category || 'admin',
      due_date: data.due_date,
      created_at: now,
      updated_at: now,
      assigned_to: data.assigned_to,
      project_id: data.project_id,
      parent_task_id: data.parent_task_id,
      estimated_hours: data.estimated_hours || 0,
      actual_hours: 0,
      completion_percentage: 0,
      tags: data.tags || [],
      metadata: {},
      
      // Relations
      subtasks: [],
      dependencies: [],
      attachments: [],
      comments: [],
      history: [],
      
      // Computed
      is_overdue: false,
      days_until_due: 0,
      completion_status: 'not_started',
      progress_percentage: 0,
      time_tracked: 0,
      blocked_by: [],
      blocking: [],
      can_edit: true,
      can_delete: true,
      can_complete: true
    } as Task;
  }

  private calculateCompletionStatus(task: any) {
    if (task.status === 'completed') return 'complete';
    if (task.status === 'in_progress') {
      if (task.completion_percentage >= 90) return 'nearly_complete';
      return 'in_progress';
    }
    if (task.is_overdue) return 'overdue';
    return 'not_started';
  }

  private calculateProgressPercentage(task: any): number {
    // Feature flag: Use refactored progress calculation or fallback to original
    if (isFeatureEnabled('useTaskCardUtils')) {
      // NEW: Use centralized utility function
      const taskForCalculation = {
        id: task.id,
        title: task.title,
        completed: task.status === 'completed',
        subtasks: task.subtasks?.map((st: any) => ({
          id: st.id,
          title: st.title,
          completed: st.status === 'completed'
        })) || []
      };
      return calculateTaskProgress(taskForCalculation).percentage;
    } else {
      // OLD: Original calculation logic (fallback)
      if (task.completion_percentage !== undefined) {
        return task.completion_percentage;
      }
      
      if (task.subtasks && task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter((st: any) => st.status === 'completed').length;
        return Math.round((completedSubtasks / task.subtasks.length) * 100);
      }
      
      return task.status === 'completed' ? 100 : 0;
    }
  }

  // Cleanup
  destroy() {
    // Unsubscribe from real-time updates
    this.subscriptions.forEach(subscription => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
    
    // Clear cache
    this.cache.clear();
  }
}

// Singleton instance
let taskAPI: TaskAPI | null = null;

export const getTaskAPI = (queryClient: QueryClient): TaskAPI => {
  if (!taskAPI) {
    taskAPI = new TaskAPI(queryClient);
  }
  return taskAPI;
};

// React Query hooks
export const useTasksQuery = (filters?: TaskFilters) => {
  const queryClient = useQueryClient();
  const api = getTaskAPI(queryClient);
  
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(filters),
    queryFn: () => api.getTasks(filters),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000 // 5 minutes
  });
};

export const useTaskQuery = (id: string) => {
  const queryClient = useQueryClient();
  const api = getTaskAPI(queryClient);
  
  return useQuery({
    queryKey: TASK_QUERY_KEYS.detail(id),
    queryFn: () => api.getTask(id),
    enabled: !!id,
    staleTime: 30 * 1000
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  const api = getTaskAPI(queryClient);
  
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => api.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    }
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  const api = getTaskAPI(queryClient);
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTaskRequest }) => 
      api.updateTask(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    }
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  const api = getTaskAPI(queryClient);
  
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    }
  });
};

export const useBulkUpdateTasksMutation = () => {
  const queryClient = useQueryClient();
  const api = getTaskAPI(queryClient);
  
  return useMutation({
    mutationFn: (updates: BulkTaskUpdate[]) => api.bulkUpdateTasks(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    }
  });
};

export const useTaskAnalyticsQuery = (filters?: TaskFilters, timeRange?: { start: string; end: string }) => {
  const queryClient = useQueryClient();
  const api = getTaskAPI(queryClient);
  
  return useQuery({
    queryKey: [...TASK_QUERY_KEYS.analytics(), { filters, timeRange }],
    queryFn: () => api.getTaskAnalytics(filters, timeRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};