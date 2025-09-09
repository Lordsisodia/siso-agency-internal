
export interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  featured?: boolean;
  pricing_type?: 'free' | 'paid' | 'freemium';
  rating?: number;
  downloads_count?: number;
  created_at?: string;
  website_url?: string;
  docs_url?: string;
  github_url?: string;
  tags?: string[];
  youtube_videos?: {
    id: string;
    title: string;
    url: string;
    thumbnailUrl: string;
  }[];
  
  // Additional properties needed by components
  assistant_type?: string;
  youtube_url?: string;
  profile_image_url?: string;
  member_type?: string;
  specialization?: string[];
  content_themes?: string[];
  use_cases?: string[];
  likes_count?: number;
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  category: string;
  platform: string;
  setup_guide?: string;
  complexity?: 'simple' | 'medium' | 'advanced';
  integration_time?: string;
}

export type SortOption = 'rating' | 'name' | 'newest' | 'popular';
