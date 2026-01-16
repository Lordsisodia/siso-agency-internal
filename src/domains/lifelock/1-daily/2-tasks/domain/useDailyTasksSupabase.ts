import { useCallback, useEffect, useMemo, useState } from 'react';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/lib/supabase-clerk';

export type DailyTaskStatus = 'pending' | 'completed';

export interface DailyTask {
  id: string;
  title: string;
  status: DailyTaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string | null;
}

interface UseDailyTasksSupabaseProps {
  selectedDate: Date;
}

const formatDateRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    dateKey: start.toISOString().split('T')[0],
  };
};

export function useDailyTasksSupabase({ selectedDate }: UseDailyTasksSupabaseProps) {
  const { user, isSignedIn } = useClerkUser();
  const supabase = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const { startIso, endIso, dateKey } = useMemo(() => formatDateRange(selectedDate ?? new Date()), [selectedDate]);

  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !internalUserId || !supabase) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load regular daily tasks
      const { data: dailyTasks, error: dailyError } = await supabase
        .from('tasks')
        .select('id, title, status, completed_at, due_date, created_at')
        .eq('created_by', internalUserId)
        .eq('category', 'daily')
        .gte('due_date', startIso)
        .lt('due_date', endIso)
        .order('created_at', { ascending: true });

      if (dailyError) {
        throw dailyError;
      }

      // Load deep work tasks scheduled for today
      const todayDate = new Date().toISOString().split('T')[0];
      const { data: deepWorkTasks, error: deepWorkError } = await supabase
        .from('deep_work_tasks')
        .select('id, title, completed, task_date, created_at')
        .eq('user_id', internalUserId)
        .eq('completed', false)
        .lte('task_date', todayDate) // Today or overdue
        .order('task_date', { ascending: true }); // Overdue first

      if (deepWorkError) {
        console.warn('⚠️ Failed to load deep work tasks:', deepWorkError);
      }

      // Map daily tasks
      const mappedDaily: DailyTask[] =
        dailyTasks?.map((task) => ({
          id: task.id,
          title: task.title,
          status: (task.status as DailyTaskStatus) ?? 'pending',
          dueDate: task.due_date,
          completedAt: task.completed_at,
          createdAt: task.created_at,
        })) ?? [];

      // Map deep work tasks (only those that aren't already in daily tasks)
      const mappedDeepWork: DailyTask[] =
        deepWorkTasks
          ?.filter((dw) => !mappedDaily.some((dt) => dt.title === dw.title))
          .map((task) => ({
            id: `dw-${task.id}`, // Prefix to distinguish from regular tasks
            title: task.title,
            status: 'pending' as DailyTaskStatus,
            dueDate: task.task_date,
            completedAt: null,
            createdAt: task.created_at,
          })) ?? [];

      // Combine tasks: deep work first (overdue prioritized), then daily tasks
      const allTasks = [...mappedDeepWork, ...mappedDaily];
      setTasks(allTasks);
    } catch (fetchErr) {
      console.error('❌ Failed to load daily tasks', fetchErr);
      setError(fetchErr instanceof Error ? fetchErr.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, supabase, startIso, endIso]);

  const addTask = useCallback(
    async (title: string) => {
      if (!title.trim() || !supabase) return null;
      if (!internalUserId) {
        setError('User not available for creating tasks.');
        return null;
      }
      setSaving(true);

      const trimmed = title.trim();
      const now = new Date().toISOString();

      try {
        const { data, error: insertError } = await supabase
          .from('tasks')
          .insert({
            title: trimmed,
            status: 'pending',
            category: 'daily',
            priority: 'medium',
            // Must reference auth.users.id (internal supabase user id)
            created_by: internalUserId,
            due_date: startIso,
            work_type: 'deep_focus',
            energy_level: 'medium',
            focus_level: 3,
            effort_points: 1,
            lifelock_sync: true,
            created_at: now,
            updated_at: now,
          })
          .select('id, title, status, completed_at, due_date, created_at')
          .single();

        if (insertError || !data) {
          throw insertError ?? new Error('Failed to create task');
        }

        const mapped: DailyTask = {
          id: data.id,
          title: data.title,
          status: (data.status as DailyTaskStatus) ?? 'pending',
          dueDate: data.due_date,
          completedAt: data.completed_at,
          createdAt: data.created_at,
        };

        setTasks((prev) => [...prev, mapped]);
        return mapped;
      } catch (insertErr) {
        console.error('❌ Failed to add task', insertErr);
        setError(insertErr instanceof Error ? insertErr.message : 'Failed to add task');
        return null;
      } finally {
        setSaving(false);
      }
    },
    [internalUserId, supabase, startIso],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!supabase || !internalUserId) return false;

      // optimistic
      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('created_by', internalUserId);

      if (deleteError) {
        console.error('❌ Failed to delete task', deleteError);
        setError(deleteError.message);
        // reload to restore state
        void loadTasks();
        return false;
      }

      return true;
    },
    [supabase, internalUserId, loadTasks],
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      if (!supabase || !internalUserId) return null;
      const existing = tasks.find((t) => t.id === taskId);
      if (!existing) return null;

      const nextStatus: DailyTaskStatus = existing.status === 'completed' ? 'pending' : 'completed';
      const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;

      // optimistic update
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: nextStatus, completedAt } : task,
        ),
      );

      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({
          status: nextStatus,
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('created_by', internalUserId)
        .select('id, title, status, completed_at, due_date, created_at')
        .single();

      if (updateError) {
        console.error('❌ Failed to toggle task', updateError);
        setError(updateError.message);
        void loadTasks();
        return null;
      }

      const mapped: DailyTask = {
        id: data.id,
        title: data.title,
        status: (data.status as DailyTaskStatus) ?? 'pending',
        dueDate: data.due_date,
        completedAt: data.completed_at,
        createdAt: data.created_at,
      };

      setTasks((prev) => prev.map((task) => (task.id === taskId ? mapped : task)));
      return mapped;
    },
    [supabase, internalUserId, tasks, loadTasks],
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks, dateKey]);

  return {
    tasks,
    loading,
    error,
    saving,
    dateKey,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    reload: loadTasks,
  };
}
