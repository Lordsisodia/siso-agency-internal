
import { TechnicalComplexity } from './complexity';

// [Analysis] Article section for structured content
export interface ArticleSection {
  id: string;
  article_id: string;
  title: string;
  content: string;
  section_order: number;
  order_index?: number;
  importance_level?: 'low' | 'medium' | 'high';
  technical_complexity?: TechnicalComplexity;
  subsection_type?: string;
  category?: string;
  source_references?: Record<string, any>;
  key_details?: string[];
  implications?: string[];
  created_at?: string;
  updated_at?: string;
  last_updated?: string;
  reading_time_minutes?: number;
  overview?: string;
  bullet_points?: string[];
  related_topics?: string[];
  key_figures?: Record<string, any>;
  is_featured?: boolean;
  metadata?: Record<string, any>;
  ai_analysis?: {
    market_impact: any;
    technical_predictions: any[];
    related_technologies: any[];
    business_implications: any;
  };
  detailed_metadata?: {
    research_papers: any[];
    industry_reports: any[];
    expert_quotes: any[];
    market_data: any[];
  };
  implementation_timeline?: {
    short_term: any[];
    medium_term: any[];
    long_term: any[];
  };
  market_analysis?: {
    market_size: any;
    growth_projections: any;
    competitive_landscape: any[];
    investment_metrics: Record<string, any>;
  };
}
