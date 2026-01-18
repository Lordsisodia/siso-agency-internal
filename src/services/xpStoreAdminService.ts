/**
 * XP Store Admin Service
 * Handles CRUD operations for XP store rewards
 */

import { supabaseAnon } from '@/lib/services/supabase/clerk-integration';

// Types
export interface StoreReward {
  id: string;
  category: 'SOCIAL' | 'FOOD' | 'ENTERTAINMENT' | 'WELLNESS' | 'RECOVERY' | 'REST' | 'GROWTH' | 'INDULGENCE' | 'CUSTOM';
  name: string;
  description: string | null;
  icon_emoji: string;
  base_price: number;
  current_price: number;
  unlock_at: number | null;
  max_daily_use: number | null;
  availability_window: string | null;
  is_active: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRewardData {
  category: StoreReward['category'];
  name: string;
  description: string;
  icon_emoji: string;
  base_price: number;
  current_price: number;
  unlock_at?: number;
  max_daily_use?: number;
  availability_window?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateRewardData extends Partial<CreateRewardData> {
  id: string;
}

export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  loading?: boolean;
}

/**
 * XP Store Admin Service Class
 */
class XPStoreAdminService {
  /**
   * Get all rewards from the database
   */
  async getRewards(): Promise<ServiceResponse<StoreReward[]>> {
    try {
      const { data, error } = await supabaseAnon
        .from('xp_store_rewards')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching rewards:', error);
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching rewards:', error);
      return { error: 'Failed to fetch rewards' };
    }
  }

  /**
   * Get active rewards only (for public store)
   */
  async getActiveRewards(): Promise<ServiceResponse<StoreReward[]>> {
    try {
      const { data, error } = await supabaseAnon
        .from('xp_store_rewards')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching active rewards:', error);
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching active rewards:', error);
      return { error: 'Failed to fetch rewards' };
    }
  }

  /**
   * Get a single reward by ID
   */
  async getReward(id: string): Promise<ServiceResponse<StoreReward>> {
    try {
      const { data, error } = await supabaseAnon
        .from('xp_store_rewards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching reward:', error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Unexpected error fetching reward:', error);
      return { error: 'Failed to fetch reward' };
    }
  }

  /**
   * Create a new reward
   */
  async addReward(rewardData: CreateRewardData): Promise<ServiceResponse<StoreReward>> {
    try {
      const { data, error } = await supabaseAnon
        .from('xp_store_rewards')
        .insert({
          category: rewardData.category,
          name: rewardData.name,
          description: rewardData.description,
          icon_emoji: rewardData.icon_emoji,
          base_price: rewardData.base_price,
          current_price: rewardData.current_price,
          unlock_at: rewardData.unlock_at || null,
          max_daily_use: rewardData.max_daily_use || 1,
          availability_window: rewardData.availability_window || null,
          is_active: rewardData.is_active !== undefined ? rewardData.is_active : true,
          sort_order: rewardData.sort_order || 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reward:', error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Unexpected error creating reward:', error);
      return { error: 'Failed to create reward' };
    }
  }

  /**
   * Update an existing reward
   */
  async updateReward(rewardData: UpdateRewardData): Promise<ServiceResponse<StoreReward>> {
    try {
      const { id, ...updateData } = rewardData;

      const { data, error } = await supabaseAnon
        .from('xp_store_rewards')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reward:', error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Unexpected error updating reward:', error);
      return { error: 'Failed to update reward' };
    }
  }

  /**
   * Delete a reward
   */
  async deleteReward(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabaseAnon
        .from('xp_store_rewards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reward:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Unexpected error deleting reward:', error);
      return { error: 'Failed to delete reward' };
    }
  }

  /**
   * Toggle reward active status
   */
  async toggleRewardActive(id: string, isActive: boolean): Promise<ServiceResponse<StoreReward>> {
    try {
      const { data, error } = await supabaseAnon
        .from('xp_store_rewards')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling reward:', error);
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Unexpected error toggling reward:', error);
      return { error: 'Failed to toggle reward' };
    }
  }

  /**
   * Reorder rewards (update sort_order)
   */
  async reorderRewards(rewardIds: string[]): Promise<ServiceResponse<void>> {
    try {
      const updates = rewardIds.map((id, index) =>
        supabaseAnon
          .from('xp_store_rewards')
          .update({ sort_order: index, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      await Promise.all(updates);

      return {};
    } catch (error) {
      console.error('Unexpected error reordering rewards:', error);
      return { error: 'Failed to reorder rewards' };
    }
  }
}

// Export singleton instance
export const xpStoreAdminService = new XPStoreAdminService();
