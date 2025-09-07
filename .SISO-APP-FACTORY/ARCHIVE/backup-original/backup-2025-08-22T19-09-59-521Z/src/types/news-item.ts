
import { ContentCategory, TechnicalComplexity } from './complexity';
import { ArticleImpact } from './complexity';
import { AIAnalysis } from './analysis';
import { ArticleSection } from './article-section';

// [Analysis] Core news item type
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  categories?: string[];
  url: string;
  image_url?: string;
  thumbnail_url?: string;
  source: string;
  source_icon?: string;
  date?: string;
  published_at?: string;
  author?: string;
  views?: number;
  comments?: number;
  likes?: number;
  saves?: number;
  featured?: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  summary?: string;
  has_summary?: boolean;
  position?: number;
  
  // Enhanced duplicate detection fields
  isDuplicate?: boolean;
  duplicateOf?: string;
  similarity?: number;
  duplicateGroup?: string;
  similarArticles?: string[];
  
  // Add missing properties used in components
  impact?: ArticleImpact;
  bookmarks?: number;
  reading_time?: number;
  estimated_reading_time?: number;
  source_credibility?: string;
  technical_complexity?: TechnicalComplexity;
  article_type?: string;
  category?: string;
  tags?: string[];
  template_type?: string;
  sources?: string[];

  // AI analysis properties
  ai_importance_score?: number;
  ai_analysis_id?: string;
  has_ai_analysis?: boolean;
  analysis_date?: string;
  
  // AI analysis content structure - enhanced for richer information
  ai_analysis?: AIAnalysis;
}

// [Analysis] Enhanced NewsItem with sections and additional data
export interface EnhancedNewsItem extends NewsItem {
  sections: ArticleSection[];
  key_takeaways?: string[];
  related_articles?: NewsItem[];
  table_of_contents?: {
    id: string;
    title: string;
    level: number;
  }[];
  technical_details?: Record<string, any>;
}
