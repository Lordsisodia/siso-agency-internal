import { NewsItem } from './blog';
import type { ContentCategory, TechnicalComplexity, ArticleImpact } from './blog';
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  category: ContentCategory;
  technical_complexity: TechnicalComplexity;
  article_impact: ArticleImpact;
  target_audience: string;
  keywords: string[];
  example_articles: NewsItem[];
  sections: SectionTemplate[];
  key_takeaways: string[];
  suggested_images: string[];
  monetization_strategy: string;
  style_guide: StyleGuide;
  optimization_tips: OptimizationTips;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface SectionTemplate {
  id: string;
  template_id: string;
  title: string;
  description: string;
  section_order: number;
  content_type: string;
  example_content: string;
  length_guideline: string;
  keywords: string[];
  ai_prompt: string;
  tone_and_style: string;
  sources: string[];
  optimization_tips: OptimizationTips;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface StyleGuide {
  tone: string;
  voice: string;
  grammar: string;
  sentence_structure: string;
  paragraph_length: string;
  readability: string;
}

export interface OptimizationTips {
  seo_keywords: string[];
  meta_description: string;
  title_tags: string[];
  image_optimization: string;
  internal_linking: string;
  external_linking: string;
  social_sharing: string;
}
