export interface UserFeedback {
  id: string;
  userId: string;
  category: string;
  priority: string;
  status: FeedbackStatus;
  type: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FeedbackStatus = 'pending' | 'in-progress' | 'resolved' | 'closed';

export const FEEDBACK_CATEGORIES = ['bug', 'feature', 'improvement', 'other'] as const;
export const FEEDBACK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const FEEDBACK_TYPES = ['ui', 'ux', 'performance', 'functionality', 'other'] as const;
