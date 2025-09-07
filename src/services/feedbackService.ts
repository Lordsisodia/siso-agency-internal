import { supabase } from '@/shared/lib/supabase';
import { 
  UserFeedback, 
  CreateFeedbackRequest, 
  FeedbackStatus,
  FeedbackCategory,
  FeedbackPriority 
} from '@/types/feedback';

class FeedbackService {
  private tableName = 'user_feedback';

  // Create the feedback table if it doesn't exist
  async ensureTableExists(): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_feedback_table_if_not_exists');
      if (error) {
        console.log('Table creation RPC not available, assuming table exists or will be created manually');
      }
    } catch (error) {
      console.log('Table creation check skipped:', error);
    }
  }

  async createFeedback(
    feedbackData: CreateFeedbackRequest, 
    browserInfo?: string, 
    deviceInfo?: string
  ): Promise<UserFeedback> {
    try {
      // Get current user from Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const feedbackPayload = {
        user_id: user.id,
        title: feedbackData.title,
        description: feedbackData.description,
        category: feedbackData.category,
        priority: feedbackData.priority,
        feedback_type: feedbackData.feedbackType,
        page: feedbackData.page,
        browser_info: browserInfo,
        device_info: deviceInfo,
        screenshots: feedbackData.screenshots || [],
        status: 'OPEN' as FeedbackStatus,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(feedbackPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create feedback: ${error.message}`);
      }

      return this.mapToFeedback(data);
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  async getUserFeedback(userId: string, limit = 50): Promise<UserFeedback[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch feedback: ${error.message}`);
      }

      return data.map(this.mapToFeedback);
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      throw error;
    }
  }

  async getAllFeedback(
    filters?: {
      status?: FeedbackStatus;
      category?: FeedbackCategory;
      priority?: FeedbackPriority;
      limit?: number;
    }
  ): Promise<UserFeedback[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch feedback: ${error.message}`);
      }

      return data.map(this.mapToFeedback);
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
  }

  async updateFeedbackStatus(
    feedbackId: string, 
    status: FeedbackStatus, 
    adminResponse?: string
  ): Promise<UserFeedback> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (adminResponse) {
        updateData.admin_response = adminResponse;
      }

      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', feedbackId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update feedback: ${error.message}`);
      }

      return this.mapToFeedback(data);
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', feedbackId);

      if (error) {
        throw new Error(`Failed to delete feedback: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  async getFeedbackStats(): Promise<{
    totalFeedback: number;
    openFeedback: number;
    resolvedFeedback: number;
    feedbackByCategory: Record<FeedbackCategory, number>;
    feedbackByPriority: Record<FeedbackPriority, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, category, priority');

      if (error) {
        throw new Error(`Failed to fetch feedback stats: ${error.message}`);
      }

      const stats = {
        totalFeedback: data.length,
        openFeedback: data.filter(f => f.status === 'OPEN' || f.status === 'REVIEWING' || f.status === 'IN_PROGRESS').length,
        resolvedFeedback: data.filter(f => f.status === 'RESOLVED' || f.status === 'CLOSED').length,
        feedbackByCategory: {} as Record<FeedbackCategory, number>,
        feedbackByPriority: {} as Record<FeedbackPriority, number>,
      };

      data.forEach(feedback => {
        stats.feedbackByCategory[feedback.category as FeedbackCategory] = 
          (stats.feedbackByCategory[feedback.category as FeedbackCategory] || 0) + 1;
        
        stats.feedbackByPriority[feedback.priority as FeedbackPriority] = 
          (stats.feedbackByPriority[feedback.priority as FeedbackPriority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }
  }

  private mapToFeedback(data: any): UserFeedback {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      feedbackType: data.feedback_type,
      page: data.page,
      browserInfo: data.browser_info,
      deviceInfo: data.device_info,
      screenshots: data.screenshots || [],
      status: data.status,
      adminResponse: data.admin_response,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at,
    };
  }
}

export const feedbackService = new FeedbackService();