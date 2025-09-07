// Define types for the leaderboard component
export interface LeaderboardEntry {
  id: string;
  user_id: string;
  points: number;
  rank: string | number;
  level: number;
  streak_days: number;
  siso_tokens: number;
  updated_at: string;
  contribution_count: number;
  referral_count: number;
  achievements: Achievement[];
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

export interface LeaderboardStats {
  totalParticipants: number;
  avgPoints: number;
  topScore: number;
}

export interface TrendStats {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  points: number;
  users: number;
  tokens: number;
}

export interface LeaderboardFilter {
  timeframe: 'day' | 'week' | 'month' | 'year' | 'all';
  category?: string;
  search?: string;
}
