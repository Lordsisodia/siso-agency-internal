import { supabase } from '@/shared/lib/supabase';
import { offlineDb } from '@/shared/offline/offlineDb';
import { Database } from '@/types/supabase';

const isBrowser = typeof window !== 'undefined';
const isOnline = () => (isBrowser ? navigator.onLine : true);

const DEFAULT_WORKOUT_ITEMS = [
  { title: 'Push-ups', target: '200', completed: false, logged: '0' },
  { title: 'Squats', target: '100', completed: false, logged: '0' },
  { title: 'Planks', target: '300', completed: false, logged: '0' },
  { title: 'Sit-ups', target: '100', completed: false, logged: '0' },
];

type WorkoutItem = Database['public']['Tables']['workout_items']['Row'];
type WorkoutItemUpdate = Database['public']['Tables']['workout_items']['Update'];

type WorkoutSessionRecord = {
  id: string;
  user_id: string;
  date: string;
  items: Array<{
    id?: string;
    title: string;
    target?: string | null;
    logged?: string | null;
    completed: boolean;
  }>;
  completed_count: number;
  total_count: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
};

const buildSessionRecord = (
  userId: string,
  date: string,
  items: WorkoutSessionRecord['items'],
  id: string = `session-${userId}-${date}`,
): WorkoutSessionRecord => {
  const total = items.length;
  const completed = items.filter(item => item.completed).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const now = new Date().toISOString();

  return {
    id,
    user_id: userId,
    date,
    items,
    completed_count: completed,
    total_count: total,
    completion_percentage: completionPercentage,
    created_at: now,
    updated_at: now,
  };
};

const mapSessionToItems = (session: WorkoutSessionRecord): WorkoutItem[] => {
  return session.items.map((item, index) => ({
    id: item.id ?? `${session.id}-${index}`,
    user_id: session.user_id,
    workout_date: session.date,
    title: item.title,
    target: item.target ?? null,
    logged: item.logged ?? null,
    completed: item.completed,
    created_at: session.created_at,
    updated_at: session.updated_at,
  }));
};

const saveSessionOffline = async (session: WorkoutSessionRecord, markForSync: boolean) => {
  await offlineDb.saveWorkoutSession(
    {
      id: session.id,
      user_id: session.user_id,
      workout_date: session.date,
      items: session.items,
      total_exercises: session.total_count,
      completed_exercises: session.completed_count,
      created_at: session.created_at,
      updated_at: session.updated_at,
    },
    markForSync,
  );
};

const buildSessionFromItems = (userId: string, date: string, rows: WorkoutItem[]): WorkoutSessionRecord => {
  const items = rows.map((item, index) => ({
    id: item.id ?? `${date}-${index}`,
    title: item.title,
    target: item.target,
    logged: item.logged,
    completed: Boolean(item.completed),
  }));

  const completedCount = items.filter(item => item.completed).length;

  return {
    id: `session-${userId}-${date}`,
    user_id: userId,
    date,
    items,
    completed_count: completedCount,
    total_count: items.length,
    completion_percentage: items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0,
    created_at: rows[0]?.created_at ?? new Date().toISOString(),
    updated_at: rows[0]?.updated_at ?? new Date().toISOString(),
  };
};

const fetchSessionFromSupabase = async (userId: string, date: string): Promise<WorkoutSessionRecord | null> => {
  const { data, error } = await supabase
    .from('home_workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error && error.code !== '42P01') {
    console.warn('[WorkoutService] Supabase home_workouts fetch failed:', error.message);
  }

  if (data) {
    return {
      id: data.id,
      user_id: data.user_id,
      date: data.date,
      items: data.workout_items ?? [],
      completed_count: data.completed_count ?? 0,
      total_count: data.total_count ?? (data.workout_items?.length ?? 0),
      completion_percentage: data.completion_percentage ?? 0,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    };
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from('workout_items')
    .select('*')
    .eq('user_id', userId)
    .eq('workout_date', date)
    .order('created_at', { ascending: true });

  if (itemsError) {
    console.warn('[WorkoutService] workout_items fetch failed:', itemsError.message);
    return null;
  }

  if (!itemsData || itemsData.length === 0) {
    return null;
  }

  return buildSessionFromItems(userId, date, itemsData);
};

export class SupabaseWorkoutService {
  private async loadSession(userId: string, date: string): Promise<WorkoutSessionRecord | null> {
    try {
      const sessions = await offlineDb.getWorkoutSessions(date);
      const session = sessions.find(entry => entry.user_id === userId);
      if (session) {
        return buildSessionRecord(userId, session.workout_date, session.items as WorkoutSessionRecord['items'], session.id);
      }
    } catch (error) {
      console.warn('[WorkoutService] Failed to read offline workout session:', error);
    }

    if (!isOnline()) {
      return null;
    }

    const remote = await fetchSessionFromSupabase(userId, date);
    if (remote) {
      await saveSessionOffline(remote, false);
      return remote;
    }

    return null;
  }

  private async persistSession(session: WorkoutSessionRecord): Promise<void> {
    const online = isOnline();
    await saveSessionOffline(session, !online);

    if (!online) {
      return;
    }

    const { error } = await supabase
      .from('home_workouts')
      .upsert({
        id: session.id,
        user_id: session.user_id,
        date: session.date,
        workout_items: session.items,
        completed_count: session.completed_count,
        total_count: session.total_count,
        completion_percentage: session.completion_percentage,
        created_at: session.created_at,
        updated_at: session.updated_at,
      }, { onConflict: 'user_id,date' });

    if (error) {
      if (error.code !== '42P01') {
        console.warn('[WorkoutService] Failed to sync session to home_workouts:', error.message);
      }

      await this.persistSessionToItems(session);
      return;
    }

    await saveSessionOffline({ ...session, updated_at: new Date().toISOString() }, false);
  }

  private async persistSessionToItems(session: WorkoutSessionRecord): Promise<void> {
    const { error: deleteError } = await supabase
      .from('workout_items')
      .delete()
      .eq('user_id', session.user_id)
      .eq('workout_date', session.date);

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.warn('[WorkoutService] Failed to clear existing workout items:', deleteError.message);
      return;
    }

    const rows = session.items.map((item, index) => {
      const base = {
        user_id: session.user_id,
        workout_date: session.date,
        title: item.title,
        target: item.target ?? null,
        logged: item.logged ?? null,
        completed: item.completed,
        created_at: session.created_at,
        updated_at: session.updated_at,
      };

      if (item.id) {
        return { id: item.id, ...base };
      }

      return { ...base, id: `session-${session.date}-${index}` };
    });

    if (rows.length === 0) {
      return;
    }

    const sanitizedRows = rows.map(({ id, ...rest }) => (id ? { id, ...rest } : rest));
    const { error: insertError } = await supabase.from('workout_items').insert(sanitizedRows);
    if (insertError) {
      console.warn('[WorkoutService] Failed to persist workout items fallback:', insertError.message);
    }
  }

  async getWorkoutItems(userId: string, workoutDate: string): Promise<WorkoutItem[]> {
    let session = await this.loadSession(userId, workoutDate);

    if (!session) {
      session = buildSessionRecord(userId, workoutDate, DEFAULT_WORKOUT_ITEMS);
      await this.persistSession(session);
    }

    return mapSessionToItems(session);
  }

  async upsertWorkoutItems(
    userId: string,
    workoutDate: string,
    items: Array<{ title: string; completed: boolean; target?: string; logged?: string }>,
  ): Promise<WorkoutItem[]> {
    const session = buildSessionRecord(userId, workoutDate, items);
    await this.persistSession(session);
    return mapSessionToItems(session);
  }

  async updateWorkoutItem(id: string, updates: WorkoutItemUpdate): Promise<WorkoutItem> {
    const userId = updates.user_id;
    const date = updates.workout_date;

    if (!userId || !date) {
      throw new Error('user_id and workout_date are required to update a workout item');
    }

    const session = await this.loadSession(userId, date);
    if (!session) {
      throw new Error('Workout session not found');
    }

    const items = session.items.map(item =>
      item.id === id
        ? {
            ...item,
            title: updates.title ?? item.title,
            completed: updates.completed ?? item.completed,
            target: updates.target ?? item.target,
            logged: updates.logged ?? item.logged,
          }
        : item,
    );

    const updatedSession = buildSessionRecord(session.user_id, session.date, items, session.id);
    await this.persistSession(updatedSession);

    const updatedItem = mapSessionToItems(updatedSession).find(item => item.id === id);
    if (!updatedItem) {
      throw new Error('Updated workout item not found');
    }

    return updatedItem;
  }

  async toggleWorkoutItem(id: string, completed: boolean): Promise<WorkoutItem> {
    return this.updateWorkoutItem(id, { completed });
  }

  async updateLoggedValue(id: string, logged: string): Promise<WorkoutItem> {
    return this.updateWorkoutItem(id, { logged });
  }

  async createDefaultWorkoutItems(userId: string, workoutDate: string): Promise<WorkoutItem[]> {
    const session = buildSessionRecord(userId, workoutDate, DEFAULT_WORKOUT_ITEMS);
    await this.persistSession(session);
    return mapSessionToItems(session);
  }
}

export const supabaseWorkoutService = new SupabaseWorkoutService();
