export interface FeedbackEntry {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'rejected' | 'in-progress';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  screenId?: string;
  screenName?: string;
  comments?: FeedbackComment[];
  tags?: string[];
}

export interface FeedbackComment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
}

export const sampleFeedbackData: FeedbackEntry[] = [
  {
    id: 'fb-001',
    title: 'Add loading state to user profile',
    description: 'The user profile currently shows blank while loading, which is jarring. We should add a skeleton loader.',
    status: 'open',
    priority: 'medium',
    createdAt: '2023-08-15T14:30:00Z',
    authorId: 'user-1',
    authorName: 'Sarah Johnson',
    authorAvatar: '/avatars/sarah.jpg',
    screenId: 'screen-profile',
    screenName: 'User Profile',
    tags: ['ux-improvement', 'loading-state'],
    comments: [
      {
        id: 'comment-1',
        content: 'I agree, we should implement this with our skeleton component library.',
        createdAt: '2023-08-15T15:45:00Z',
        authorId: 'user-2',
        authorName: 'Alex Chen',
        authorAvatar: '/avatars/alex.jpg'
      },
      {
        id: 'comment-2',
        content: 'This shouldn\'t be too hard to implement. I\'ll create a PR tomorrow.',
        createdAt: '2023-08-15T16:20:00Z',
        authorId: 'user-3',
        authorName: 'Michael Wong',
        authorAvatar: '/avatars/michael.jpg'
      }
    ]
  },
  {
    id: 'fb-002',
    title: 'Dashboard is too cluttered on mobile',
    description: 'The dashboard has too many elements squeezed onto the mobile view. We should prioritize and maybe move some widgets to expandable sections.',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2023-08-10T09:15:00Z',
    updatedAt: '2023-08-12T11:30:00Z',
    authorId: 'user-4',
    authorName: 'Jessica Taylor',
    authorAvatar: '/avatars/jessica.jpg',
    screenId: 'screen-dashboard',
    screenName: 'Main Dashboard',
    tags: ['mobile', 'ux-improvement', 'responsive-design'],
    comments: [
      {
        id: 'comment-3',
        content: 'I\'ve started working on this. First focusing on the stats widgets.',
        createdAt: '2023-08-11T10:20:00Z',
        authorId: 'user-2',
        authorName: 'Alex Chen',
        authorAvatar: '/avatars/alex.jpg'
      }
    ]
  },
  {
    id: 'fb-003',
    title: 'Add dark mode toggle in settings',
    description: 'Users have requested a dark mode option. We should add a toggle in the settings panel to switch between light and dark themes.',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2023-08-05T16:45:00Z',
    updatedAt: '2023-08-09T13:20:00Z',
    authorId: 'user-5',
    authorName: 'David Kim',
    authorAvatar: '/avatars/david.jpg',
    screenId: 'screen-settings',
    screenName: 'User Settings',
    tags: ['dark-mode', 'themes', 'user-request'],
    comments: [
      {
        id: 'comment-4',
        content: 'I\'ve added this to our UI system, it should be easy to implement now.',
        createdAt: '2023-08-06T11:15:00Z',
        authorId: 'user-6',
        authorName: 'Emma Wilson',
        authorAvatar: '/avatars/emma.jpg'
      },
      {
        id: 'comment-5',
        content: 'PR is up for review, all tests pass.',
        createdAt: '2023-08-08T14:30:00Z',
        authorId: 'user-6',
        authorName: 'Emma Wilson',
        authorAvatar: '/avatars/emma.jpg'
      },
      {
        id: 'comment-6',
        content: 'Looks good, merged! This is now available in the development build.',
        createdAt: '2023-08-09T13:20:00Z',
        authorId: 'user-1',
        authorName: 'Sarah Johnson',
        authorAvatar: '/avatars/sarah.jpg'
      }
    ]
  },
  {
    id: 'fb-004',
    title: 'Payment form does not validate AMEX cards correctly',
    description: 'American Express cards are getting rejected even when they are valid. We need to fix the validation for 15-digit cards.',
    status: 'open',
    priority: 'high',
    createdAt: '2023-08-14T08:30:00Z',
    authorId: 'user-7',
    authorName: 'Robert Garcia',
    authorAvatar: '/avatars/robert.jpg',
    screenId: 'screen-checkout',
    screenName: 'Payment Checkout',
    tags: ['bug', 'payments', 'validation'],
    comments: []
  },
  {
    id: 'fb-005',
    title: 'Notifications are not showing up on Safari',
    description: 'The notifications bell seems to be broken on Safari browsers. No new alerts are displaying when they should.',
    status: 'rejected',
    priority: 'low',
    createdAt: '2023-08-02T13:40:00Z',
    updatedAt: '2023-08-04T09:15:00Z',
    authorId: 'user-8',
    authorName: 'Linda Chen',
    authorAvatar: '/avatars/linda.jpg',
    screenId: 'screen-header',
    screenName: 'App Header',
    tags: ['safari', 'bug', 'notifications'],
    comments: [
      {
        id: 'comment-7',
        content: 'After investigation, this is actually working as expected. The issue is with notification permissions in Safari.',
        createdAt: '2023-08-03T15:20:00Z',
        authorId: 'user-3',
        authorName: 'Michael Wong',
        authorAvatar: '/avatars/michael.jpg'
      },
      {
        id: 'comment-8',
        content: 'Closing this as it\'s not a bug in our app, but we should add better guidance for Safari users.',
        createdAt: '2023-08-04T09:15:00Z',
        authorId: 'user-1',
        authorName: 'Sarah Johnson',
        authorAvatar: '/avatars/sarah.jpg'
      }
    ]
  }
]; 