// Portfolio types for the leaderboard-style display
export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  client_name: string;
  development_status: 'completed' | 'in_progress' | 'pending' | 'near_complete';
  project_status: 'Confirmed' | 'Pending' | 'Declined';
  live_url: string;
  notion_url?: string;
  technologies: string[];
  highlights: string[];
  category_id?: string;
  estimated_value?: number;
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioLeaderboardEntry {
  id: string;
  rank: number;
  project_name: string;
  client_name: string;
  status: string;
  completion_percentage: number;
  value: number;
  technology_stack: string[];
  live_url: string;
  notion_url?: string;
  highlights: string[];
  created_date: string;
  category: string;
}

// Existing portfolio types
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  live_url: string;
  client_name: string;
  development_status: string;
  highlights: string[];
  user_id: string;
  image_url: string;
  category_id?: string;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
