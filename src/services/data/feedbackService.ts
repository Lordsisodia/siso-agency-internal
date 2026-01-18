/**
 * Feedback Service
 *
 * Handles user feedback CRUD operations
 */

import { supabase } from '@/services/integrations/supabase/client';
import type { UserFeedback, FeedbackStatus } from '@/types/feedback';

interface GetAllFeedbackOptions {
  limit?: number;
  offset?: number;
  status?: FeedbackStatus;
  category?: string;
}

interface FeedbackStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

export const feedbackService = {
  /**
   * Get all feedback with optional filtering
   */
  async getAllFeedback(options: GetAllFeedbackOptions = {}): Promise<UserFeedback[]> {
    const { limit = 50, offset = 0, status, category } = options;

    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      category: item.category,
      priority: item.priority,
      status: item.status,
      type: item.type,
      message: item.message,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  },

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(
    feedbackId: string,
    status: FeedbackStatus,
    adminResponse?: string
  ): Promise<UserFeedback> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminResponse) {
      updates.admin_response = adminResponse;
    }

    const { data, error } = await supabase
      .from('feedback')
      .update(updates)
      .eq('id', feedbackId)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      priority: data.priority,
      status: data.status,
      type: data.type,
      message: data.message,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Get feedback statistics
   */
  async getFeedbackStats(): Promise<FeedbackStats> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*');

    if (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }

    const feedback = data || [];

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    feedback.forEach(item => {
      // Count by status
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;

      // Count by category
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;

      // Count by priority
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
    });

    return {
      total: feedback.length,
      byStatus,
      byCategory,
      byPriority,
    };
  },

  /**
   * Create new feedback
   */
  async createFeedback(feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserFeedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: feedback.userId,
        category: feedback.category,
        priority: feedback.priority,
        status: feedback.status,
        type: feedback.type,
        message: feedback.message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      priority: data.priority,
      status: data.status,
      type: data.type,
      message: data.message,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId: string): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', feedbackId);

    if (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },
};
