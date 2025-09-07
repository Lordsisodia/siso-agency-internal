
// [Analysis] Technical complexity and impact level types
export type TechnicalComplexity = 
  | 'basic'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'mixed';

export type ContentCategory = 
  | 'ai_research'
  | 'breakthrough_technologies'
  | 'industry_applications'
  | 'policy_ethics'
  | 'products_launches'
  | 'tutorial_guides';

export type ArticleImpact = 
  | 'low'
  | 'medium'
  | 'high'
  | 'revolutionary';

// [Analysis] Colors for different complexity levels (moved from constants file)
export const complexityColors: Record<string, string> = {
  basic: "bg-green-500/10 text-green-400 border-green-500/30",
  beginner: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  intermediate: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  advanced: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  expert: "bg-red-500/10 text-red-400 border-red-500/30",
  mixed: "bg-amber-500/10 text-amber-400 border-amber-500/30"
};
