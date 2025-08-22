
// [Analysis] Main index file that re-exports all types
// [Framework] Re-export pattern for easier imports while maintaining separation

export type { Category, ContentCategory } from './category';
export type { TechnicalComplexity, ArticleImpact } from './complexity';
export { complexityColors } from './complexity';
export type { NewsItem, EnhancedNewsItem } from './news-item';
export type { ArticleSection } from './article-section';
export type { NewsComment } from './comment';
export type { NewsAnalysis, AIAnalysis } from './analysis';
export type { Summary, Views } from './summary';

// Define BlogPost interface for admin operations
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at?: string;
  updated_at?: string;
}
