import { supabase } from '@/shared/lib/supabase';
import { Database } from '@/types/supabase';

type WorkoutItem = Database['public']['Tables']['workout_items']['Row'];
type WorkoutItemInsert = Database['public']['Tables']['workout_items']['Insert'];
type WorkoutItemUpdate = Database['public']['Tables']['workout_items']['Update'];

export class SupabaseWorkoutService {
  
  /**
   * Get all workout items for a specific user and date
   */
  async getWorkoutItems(userId: string, workoutDate: string): Promise<WorkoutItem[]> {
    try {
      const { data, error } = await supabase
        .from('workout_items')
        .select('*')
        .eq('user_id', userId)
        .eq('workout_date', workoutDate)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching workout items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch workout items:', error);
      throw error;
    }
  }

  /**
   * Create or update workout items for a specific date
   */
  async upsertWorkoutItems(userId: string, workoutDate: string, items: Omit<WorkoutItemInsert, 'user_id' | 'workout_date'>[]): Promise<WorkoutItem[]> {
    try {
      // First, delete existing items for this date
      await supabase
        .from('workout_items')
        .delete()
        .eq('user_id', userId)
        .eq('workout_date', workoutDate);

      // Then insert the new items
      const itemsToInsert = items.map(item => ({
        ...item,
        user_id: userId,
        workout_date: workoutDate,
      }));

      const { data, error } = await supabase
        .from('workout_items')
        .insert(itemsToInsert)
        .select('*');

      if (error) {
        console.error('Error upserting workout items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to upsert workout items:', error);
      throw error;
    }
  }

  /**
   * Update a specific workout item
   */
  async updateWorkoutItem(id: string, updates: WorkoutItemUpdate): Promise<WorkoutItem> {
    try {
      const { data, error } = await supabase
        .from('workout_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating workout item:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update workout item:', error);
      throw error;
    }
  }

  /**
   * Toggle completion status of a workout item
   */
  async toggleWorkoutItem(id: string, completed: boolean): Promise<WorkoutItem> {
    return this.updateWorkoutItem(id, { completed });
  }

  /**
   * Update logged value for a workout item
   */
  async updateLoggedValue(id: string, logged: string): Promise<WorkoutItem> {
    return this.updateWorkoutItem(id, { logged });
  }

  /**
   * Create default workout items for a date if none exist
   */
  async createDefaultWorkoutItems(userId: string, workoutDate: string): Promise<WorkoutItem[]> {
    const defaultItems = [
      {
        title: 'Push-ups',
        target: '200',
        completed: false,
        logged: '0',
      },
      {
        title: 'Squats',
        target: '100',
        completed: false,
        logged: '0',
      },
      {
        title: 'Planks',
        target: '300',
        completed: false,
        logged: '0',
      },
      {
        title: 'Sit-ups',
        target: '100',
        completed: false,
        logged: '0',
      },
    ];

    return this.upsertWorkoutItems(userId, workoutDate, defaultItems);
  }
}

// Export singleton instance
export const supabaseWorkoutService = new SupabaseWorkoutService();