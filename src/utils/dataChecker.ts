/**
 * Data Checker Utility
 * Helps find and display user data that was recently saved
 */

interface SavedData {
  businessOnboarding?: any;
  clientProfile?: any;
  workflowTasks?: string[];
  planBuilder?: any;
  userProject?: any;
  generatedAppPlans?: any[];
  latestAppPlan?: any;
  lastUpdated?: string;
}

/**
 * Checks all localStorage locations for user data
 */
export const checkAllSavedData = (): SavedData => {
  const result: SavedData = {};
  
  try {
    // Check business onboarding data
    const businessData = localStorage.getItem('business-onboarding-data');
    if (businessData) {
      result.businessOnboarding = JSON.parse(businessData);
    }
    
    // Check client profile data
    const clientProfile = localStorage.getItem('client-profile');
    if (clientProfile) {
      result.clientProfile = JSON.parse(clientProfile);
    }
    
    // Check completed workflow tasks
    const workflowTasks = localStorage.getItem('workflow-completed-tasks');
    if (workflowTasks) {
      result.workflowTasks = JSON.parse(workflowTasks);
    }
    
    // Check plan builder data
    const planData = localStorage.getItem('plan-builder-data');
    if (planData) {
      result.planBuilder = JSON.parse(planData);
    }
    
    // Check user project data
    const projectData = localStorage.getItem('user-project-data');
    if (projectData) {
      result.userProject = JSON.parse(projectData);
    }
    
    // Check generated app plans (NEW)
    const appPlans = localStorage.getItem('generated-app-plans');
    if (appPlans) {
      result.generatedAppPlans = JSON.parse(appPlans);
    }
    
    // Check latest app plan (NEW)
    const latestPlan = localStorage.getItem('latest-app-plan');
    if (latestPlan) {
      result.latestAppPlan = JSON.parse(latestPlan);
    }
    
    result.lastUpdated = new Date().toISOString();
    
  } catch (error) {
    console.error('Error checking saved data:', error);
  }
  
  return result;
};

/**
 * Gets a summary of what data was found
 */
export const getDataSummary = (): string => {
  const data = checkAllSavedData();
  const summary: string[] = [];
  
  if (data.businessOnboarding) {
    const biz = data.businessOnboarding;
    summary.push(`✅ Business Info: ${biz.businessName || 'Unknown'}`);
    if (biz.appPurpose) summary.push(`   📱 App Purpose: ${biz.appPurpose}`);
    if (biz.industry) summary.push(`   🏢 Industry: ${biz.industry}`);
    if (biz.targetAudience) summary.push(`   👥 Target: ${biz.targetAudience}`);
    if (biz.completedAt) summary.push(`   ⏰ Completed: ${new Date(biz.completedAt).toLocaleString()}`);
  }
  
  if (data.clientProfile) {
    const profile = data.clientProfile;
    summary.push(`✅ Client Profile: ${profile.company_name || 'Unknown'}`);
    if (profile.communication_preference) {
      summary.push(`   💬 Prefers: ${profile.communication_preference}`);
    }
  }
  
  if (data.workflowTasks && data.workflowTasks.length > 0) {
    summary.push(`✅ Completed Tasks: ${data.workflowTasks.length}/9`);
    summary.push(`   Tasks: ${data.workflowTasks.join(', ')}`);
  }
  
  if (data.planBuilder) {
    summary.push(`✅ Plan Builder Data: Available`);
  }
  
  if (data.userProject) {
    summary.push(`✅ User Project: Available`);
  }
  
  // NEW: App Plan tracking
  if (data.latestAppPlan) {
    const plan = data.latestAppPlan;
    summary.push(`🤖 AI App Plan: ${plan.businessName || 'Generated'}`);
    summary.push(`   📊 Features: ${plan.features?.length || 0} planned`);
    summary.push(`   💰 Cost: ${plan.costBreakdown?.total ? `£${plan.costBreakdown.total.toLocaleString()}` : 'TBD'}`);
    summary.push(`   ⏱️ Timeline: ${plan.totalTimelineWeeks || 'TBD'} weeks`);
    summary.push(`   🎯 Confidence: ${plan.confidence || 0}%`);
    summary.push(`   📅 Generated: ${plan.generatedAt ? new Date(plan.generatedAt).toLocaleString() : 'Unknown'}`);
  }
  
  if (data.generatedAppPlans && data.generatedAppPlans.length > 1) {
    summary.push(`🗂️ Total App Plans: ${data.generatedAppPlans.length} versions`);
  }
  
  if (summary.length === 0) {
    return "❌ No saved data found";
  }
  
  return summary.join('\n');
};

/**
 * Console logs all found data for debugging
 */
export const logAllData = (): void => {
  const data = checkAllSavedData();
  console.log('🔍 All Saved User Data:', data);
  console.log('📋 Data Summary:');
  console.log(getDataSummary());
}; 