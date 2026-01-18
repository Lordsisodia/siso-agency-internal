export type FeedbackCategory = 
  | 'UI_UX'
  | 'PERFORMANCE' 
  | 'FEATURE_REQUEST'
  | 'BUG_REPORT'
  | 'GENERAL'
  | 'MOBILE'
  | 'ACCESSIBILITY';

export type FeedbackPriority = 
  | 'LOW'
  | 'MEDIUM' 
  | 'HIGH'
  | 'URGENT';

export type FeedbackType = 
  | 'BUG'
  | 'SUGGESTION'
  | 'IMPROVEMENT'
  | 'COMPLAINT'
  | 'PRAISE';

export type FeedbackStatus = 
  | 'OPEN'
  | 'REVIEWING'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export interface UserFeedback {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  feedbackType: FeedbackType;
  page?: string;
  browserInfo?: string;
  deviceInfo?: string;
  screenshots: string[];
  status: FeedbackStatus;
  adminResponse?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateFeedbackRequest {
  title: string;
  description: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  feedbackType: FeedbackType;
  page?: string;
  screenshots?: string[];
}

export const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string; description: string }[] = [
  { value: 'UI_UX', label: 'UI/UX', description: 'User interface and experience issues' },
  { value: 'PERFORMANCE', label: 'Performance', description: 'Speed, loading, or responsiveness issues' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request', description: 'New feature suggestions' },
  { value: 'BUG_REPORT', label: 'Bug Report', description: 'Something is broken or not working' },
  { value: 'MOBILE', label: 'Mobile', description: 'Mobile-specific issues' },
  { value: 'ACCESSIBILITY', label: 'Accessibility', description: 'Accessibility improvements' },
  { value: 'GENERAL', label: 'General', description: 'General feedback or suggestions' },
];

export const FEEDBACK_TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'BUG', label: 'Bug Report', emoji: '🐛' },
  { value: 'SUGGESTION', label: 'Suggestion', emoji: '💡' },
  { value: 'IMPROVEMENT', label: 'Improvement', emoji: '✨' },
  { value: 'COMPLAINT', label: 'Complaint', emoji: '😤' },
  { value: 'PRAISE', label: 'Praise', emoji: '👏' },
];

export const FEEDBACK_PRIORITIES: { value: FeedbackPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'text-green-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
  { value: 'HIGH', label: 'High', color: 'text-orange-600' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-600' },
];