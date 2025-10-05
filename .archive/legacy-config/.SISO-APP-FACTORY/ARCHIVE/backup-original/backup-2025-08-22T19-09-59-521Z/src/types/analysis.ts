
// [Analysis] News analysis metadata
export interface NewsAnalysis {
  id: string;
  article_id: string;
  summary: string;
  key_points: string[];
  technical_significance: string;
  market_impact: string;
  source_credibility: string;
  ai_importance_score: number;
  metadata: Record<string, any>;
  created_at: string;
}

// [Analysis] Enhanced structure for AI analysis
export interface AIAnalysis {
  // Original fields
  market_impact?: string;
  technical_predictions?: string[];
  related_technologies?: string[];
  business_implications?: string;
  key_points?: string[];
  confidence_score?: number;
  summary?: string;
  industry_impacts?: Record<string, string>;
  recommended_actions?: string[];
  
  // [Analysis] Enhanced fields for agency owners
  agency_relevance_score?: number;
  implementation_timeline?: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
  market_opportunity?: {
    score: number;
    description: string;
    potential_revenue_impact: string;
    target_client_industries: string[];
  };
  competitive_analysis?: {
    current_adoption: string;
    market_leaders: string[];
    differentiation_opportunities: string[];
  };
  client_messaging?: {
    value_propositions: string[];
    key_selling_points: string[];
    objection_handling: Record<string, string>;
    case_study_ideas: string[];
  };
  implementation_details?: {
    resource_requirements: string[];
    technical_complexity: string;
    integration_challenges: string[];
    tech_stack_recommendations: string[];
  };
  cost_benefit_analysis?: {
    estimated_implementation_cost: string;
    potential_roi_metrics: string[];
    time_to_value: string;
    scalability_factors: string[];
  };
}
