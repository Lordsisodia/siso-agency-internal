// Define types for the leaderboard component
export interface LeaderboardEntry {
  id: string;
  user_id: string;
  points: number;
  rank: string | number; // Support both string and number rank types
  achievements: Achievement[];
  siso_tokens: number;
  updated_at: string;
  contribution_count: number;
  referral_count: number;
  profile: UserProfile;
}

export interface Achievement {
  name: string;
  icon: string;
}

export interface UserProfile {
  full_name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  linkedin_url?: string;
  website_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  professional_role?: string;
  business_name?: string;
  industry?: string;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalUsers: number;
  totalPoints: number;
  totalTokens: number;
}

export interface LeaderboardFilter {
  timeframe: string;
  timeRange?: 'all' | 'week' | 'month' | 'year';
  category?: string;
}

export interface TrendStats {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  points: number;
  users: number;
  tokens: number;
}
