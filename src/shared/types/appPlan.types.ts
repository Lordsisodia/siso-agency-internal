/**
 * App Plan Agent Types
 * Defines the structure for AI-generated app plans
 */

export interface AppPlanInput {
  businessName: string;
  appPurpose: string;
  industry: string;
  targetAudience: string;
  communicationPreference?: 'email' | 'phone' | 'chat' | 'voice';
  budget?: string;
  timeline?: string;
  moreInfo?: string;
}

export interface TechnicalRequirements {
  platform: 'web' | 'mobile' | 'cross-platform';
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    apis: string[];
  };
  architecture: string;
  scalability: string;
  security: string[];
  integrations: string[];
}

export interface FeaturePlan {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedHours: number;
  dependencies: string[];
  userStories: string[];
}

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  features: string[]; // Feature IDs
  estimatedDuration: string;
  milestones: string[];
  deliverables: string[];
}

export interface CostBreakdown {
  development: number;
  design: number;
  testing: number;
  deployment: number;
  maintenance: number;
  total: number;
  currency: string;
}

export interface UIUXPlan {
  designSystem: string;
  colorScheme: string;
  typography: string;
  userFlow: string[];
  wireframes: string[];
  accessibility: string[];
}

export interface IndustryResearch {
  industryTrends: string[];
  keyCompetitors: string[];
  userBehaviors: string[];
  marketGrowth: string;
  technologicalFactors: string[];
  recommendations: string[];
  opportunityAreas: string[];
  challengesToAddress: string[];
}

export interface GeneratedAppPlan {
  id: string;
  clientId: string;
  businessName: string;
  
  // Core Plan Data
  executiveSummary: string;
  features: FeaturePlan[];
  technicalRequirements: TechnicalRequirements;
  developmentPhases: DevelopmentPhase[];
  costBreakdown: CostBreakdown;
  uiuxPlan: UIUXPlan;
  
  // Timeline & Implementation
  totalTimelineWeeks: number;
  mvpTimelineWeeks: number;
  recommendedMVPFeatures: string[]; // Feature IDs
  
  // Business Insights
  marketAnalysis: string;
  competitorInsights: string[];
  revenueModel: string[];
  risksAndMitigation: string[];
  
  // Meta Information
  generatedAt: string;
  modelUsed: string;
  version: string;
  confidence: number; // 0-100 AI confidence score
  status: 'draft' | 'reviewed' | 'approved' | 'implemented';
  industryResearch?: IndustryResearch;
}

export interface AppPlanGenerationOptions {
  model: string;
  includeMarketAnalysis?: boolean;
  includeCostEstimates?: boolean;
  includeWireframes?: boolean;
  detailLevel: 'brief' | 'standard' | 'detailed';
  focusAreas: ('technical' | 'business' | 'design' | 'marketing')[];
}

export interface AppPlanAgent {
  generatePlan: (input: AppPlanInput, options?: AppPlanGenerationOptions) => Promise<GeneratedAppPlan>;
  refinePlan: (planId: string, feedback: string) => Promise<GeneratedAppPlan>;
  getStoredPlan: (planId: string) => GeneratedAppPlan | null;
  getAllClientPlans: (clientId: string) => GeneratedAppPlan[];
} 