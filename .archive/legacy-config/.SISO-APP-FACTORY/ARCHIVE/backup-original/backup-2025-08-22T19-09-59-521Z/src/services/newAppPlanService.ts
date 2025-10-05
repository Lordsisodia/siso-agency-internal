import { supabase } from '@/integrations/supabase/client';
import { GeneratedAppPlan } from '@/types/appPlan.types';

export interface NewAppPlanData {
  title: string;
  description: string;
  business_type?: string;
  target_audience?: string;
  app_concept: string;
  features?: any[];
  technical_requirements?: any;
  timeline?: string;
  budget_range?: string;
  development_phases?: any[];
  ui_ux_plan?: any;
  market_analysis?: any;
  revenue_model?: any;
  risk_mitigation?: any;
  metadata?: any;
}

export interface SavedAppPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  business_type?: string;
  target_audience?: string;
  app_concept: string;
  features?: any[];
  technical_requirements?: any;
  timeline?: string;
  budget_range?: string;
  development_phases?: any[];
  ui_ux_plan?: any;
  market_analysis?: any;
  revenue_model?: any;
  risk_mitigation?: any;
  status: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export async function saveNewAppPlan(data: NewAppPlanData): Promise<SavedAppPlan> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to save app plans');
  }

  const appPlanData = {
    user_id: user.id,
    title: data.title,
    description: data.description,
    business_type: data.business_type,
    target_audience: data.target_audience,
    app_concept: data.app_concept,
    features: data.features || [],
    technical_requirements: data.technical_requirements,
    timeline: data.timeline,
    budget_range: data.budget_range,
    development_phases: data.development_phases || [],
    ui_ux_plan: data.ui_ux_plan,
    market_analysis: data.market_analysis,
    revenue_model: data.revenue_model,
    risk_mitigation: data.risk_mitigation,
    status: 'completed',
    metadata: data.metadata || {}
  };

  const { data: savedPlan, error } = await supabase
    .from('app_plans')
    .insert(appPlanData)
    .select()
    .single();

  if (error) {
    console.error('Error saving app plan:', error);
    throw new Error('Failed to save app plan');
  }

  return savedPlan;
}

export async function getUserAppPlans(userId?: string): Promise<SavedAppPlan[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user && !userId) {
    throw new Error('User must be authenticated');
  }

  const targetUserId = userId || user?.id;

  const { data: plans, error } = await supabase
    .from('app_plans')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching app plans:', error);
    throw new Error('Failed to fetch app plans');
  }

  return plans || [];
}

export async function getAppPlanById(planId: string): Promise<SavedAppPlan | null> {
  const { data: plan, error } = await supabase
    .from('app_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    console.error('Error fetching app plan:', error);
    return null;
  }

  return plan;
}

export async function deleteAppPlan(planId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await supabase
    .from('app_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting app plan:', error);
    throw new Error('Failed to delete app plan');
  }
}

// Convert from GeneratedAppPlan to our database format
export function convertGeneratedAppPlanToSaveable(plan: GeneratedAppPlan): NewAppPlanData {
  return {
    title: plan.businessName,
    description: plan.executiveSummary,
    app_concept: plan.executiveSummary,
    features: plan.features,
    technical_requirements: plan.technicalRequirements,
    timeline: `${plan.totalTimelineWeeks} weeks`,
    budget_range: `£${plan.costBreakdown.total?.toLocaleString() || '50,000'} - £${((plan.costBreakdown.total || 50000) * 1.3).toLocaleString()}`,
    development_phases: plan.developmentPhases,
    ui_ux_plan: plan.uiuxPlan,
    market_analysis: plan.marketAnalysis,
    revenue_model: plan.revenueModel,
    risk_mitigation: plan.risksAndMitigation,
    metadata: {
      modelUsed: plan.modelUsed,
      version: plan.version,
      confidence: plan.confidence,
      generatedAt: plan.generatedAt
    }
  };
}