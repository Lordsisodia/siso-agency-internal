/**
 * Enhanced AI Prompting Strategies for App Plan Generation
 * Industry-specific prompts with market analysis and technical recommendations
 */

import { AppPlanInput } from '@/types/appPlan.types';

interface IndustryPromptConfig {
  industry: string;
  keywords: string[];
  commonFeatures: string[];
  technicalRecommendations: string[];
  marketInsights: string[];
  averageBudgetRange: { min: number; max: number };
  timelineMultiplier: number;
}

// Industry-specific configuration database
const INDUSTRY_CONFIGS: IndustryPromptConfig[] = [
  {
    industry: 'fitness',
    keywords: ['gym', 'fitness', 'workout', 'exercise', 'health', 'training'],
    commonFeatures: [
      'Class booking system', 'Member management', 'Payment processing',
      'Workout tracking', 'Progress analytics', 'Social features',
      'Nutrition tracking', 'Personal trainer booking', 'Live streaming classes'
    ],
    technicalRecommendations: [
      'Real-time booking system', 'Payment gateway integration', 'Push notifications',
      'Wearable device integration', 'Video streaming capabilities', 'Analytics dashboard'
    ],
    marketInsights: [
      'UK fitness app market worth £1.2B', 'Average user retention 6 months',
      'Key competitor: MyFitnessPal, Strava', 'Premium subscriptions drive 70% revenue'
    ],
    averageBudgetRange: { min: 8000, max: 25000 },
    timelineMultiplier: 1.2
  },
  {
    industry: 'restaurant',
    keywords: ['restaurant', 'food', 'dining', 'menu', 'delivery', 'takeaway'],
    commonFeatures: [
      'Online ordering', 'Table reservations', 'Menu management',
      'Delivery tracking', 'Loyalty program', 'Payment integration',
      'Kitchen display system', 'Customer reviews', 'Inventory management'
    ],
    technicalRecommendations: [
      'Real-time order management', 'GPS tracking', 'POS integration',
      'Kitchen workflow optimization', 'Customer communication system'
    ],
    marketInsights: [
      'UK food delivery market £8.3B annually', 'Commission fees 15-30%',
      'Key competitors: Deliveroo, Uber Eats', 'Direct ordering saves 20-25% costs'
    ],
    averageBudgetRange: { min: 6000, max: 20000 },
    timelineMultiplier: 1.0
  },
  {
    industry: 'construction',
    keywords: ['construction', 'building', 'contractor', 'project', 'site', 'management'],
    commonFeatures: [
      'Project management', 'Time tracking', 'Resource allocation',
      'Document management', 'Progress reporting', 'Client communication',
      'Invoice generation', 'Site photos', 'Compliance tracking'
    ],
    technicalRecommendations: [
      'Offline functionality', 'Cloud document storage', 'GPS tracking',
      'Photo compression and sync', 'Real-time collaboration tools'
    ],
    marketInsights: [
      'UK construction tech market £2.1B', 'Digital adoption increased 300% post-COVID',
      'Average project delay reduced 25% with digital tools', 'ROI typically 200-400%'
    ],
    averageBudgetRange: { min: 12000, max: 40000 },
    timelineMultiplier: 1.5
  },
  {
    industry: 'fintech',
    keywords: ['finance', 'banking', 'payment', 'crypto', 'investment', 'trading'],
    commonFeatures: [
      'Secure authentication', 'Transaction processing', 'Portfolio tracking',
      'Real-time analytics', 'Compliance reporting', 'KYC verification',
      'Multi-currency support', 'API integrations', 'Audit trails'
    ],
    technicalRecommendations: [
      'Bank-grade security', 'Blockchain integration', 'Real-time data feeds',
      'Regulatory compliance systems', 'Advanced encryption', 'Multi-factor authentication'
    ],
    marketInsights: [
      'UK fintech sector worth £11B', 'Regulatory requirements FCA compliant',
      'Security paramount - average breach costs £3.2M', 'API-first architecture essential'
    ],
    averageBudgetRange: { min: 20000, max: 80000 },
    timelineMultiplier: 2.0
  }
];

/**
 * Generate industry-specific AI prompt for app plan creation
 */
export function generateEnhancedPrompt(input: AppPlanInput): string {
  const industryConfig = detectIndustry(input.industry, input.appPurpose);
  const userPersona = generateUserPersona(input.targetAudience);
  
  return `
# EXPERT APP DEVELOPMENT CONSULTANT BRIEFING

You are a senior app development consultant with 10+ years experience delivering successful applications across multiple industries. Generate a comprehensive app development plan that a client can understand and a development team can implement.

## CLIENT REQUIREMENTS
**Company**: ${input.businessName}
**App Purpose**: ${input.appPurpose}
**Industry**: ${input.industry}
**Target Audience**: ${input.targetAudience}
**Budget**: ${input.budget || 'To be determined'}
**Timeline**: ${input.timeline || 'Flexible'}
**Communication Style**: ${input.communicationPreference || 'Professional'}

## INDUSTRY ANALYSIS
${industryConfig ? `
**Industry**: ${industryConfig.industry}
**Market Size**: ${industryConfig.marketInsights[0]}
**Key Insights**: ${industryConfig.marketInsights.slice(1).join(' | ')}
**Typical Budget Range**: £${industryConfig.averageBudgetRange.min.toLocaleString()} - £${industryConfig.averageBudgetRange.max.toLocaleString()}
` : '**Industry**: General business application'}

## TARGET USER ANALYSIS
${userPersona}

## REQUIRED DELIVERABLES

### 1. EXECUTIVE SUMMARY (2-3 paragraphs)
Provide a clear, client-friendly overview of the recommended solution, highlighting the business value and competitive advantages.

### 2. RECOMMENDED FEATURES (Priority-based)
List 8-12 features in priority order:
- **High Priority (MVP)**: 4-6 essential features for launch
- **Medium Priority**: 3-4 features for Phase 2
- **Low Priority**: 2-3 nice-to-have features for future releases

For each feature, include:
- Feature name and brief description
- Business justification
- Technical complexity (Simple/Moderate/Complex)
- Estimated development hours
- User stories (2-3 per feature)

### 3. TECHNICAL ARCHITECTURE
Recommend:
- **Platform**: Native iOS/Android vs Cross-platform (React Native/Flutter) vs Web App
- **Backend**: Technology stack and hosting recommendations
- **Database**: Type and structure recommendations
- **Integrations**: Required third-party services and APIs
- **Security**: Industry-specific security requirements
- **Scalability**: Growth planning and performance considerations

### 4. DEVELOPMENT PHASES & TIMELINE
Break down into phases:
- **Phase 1 (MVP)**: Core functionality for market validation
- **Phase 2**: Enhanced features and optimization
- **Phase 3**: Advanced features and scaling

For each phase:
- Duration in weeks
- Key deliverables
- Success milestones
- Testing and deployment plans

### 5. COST BREAKDOWN (in GBP)
Provide detailed costs:
- **Development**: Frontend, backend, testing
- **Design**: UI/UX, branding, assets
- **Infrastructure**: Hosting, third-party services
- **Launch**: App store fees, marketing setup
- **Maintenance**: First year ongoing costs
- **Total Investment**: Complete cost with contingency

### 6. UI/UX RECOMMENDATIONS
- **Design System**: Color scheme, typography, component library
- **User Experience**: Navigation patterns, user flow optimization
- **Accessibility**: WCAG compliance and inclusive design
- **Brand Integration**: How to reflect company brand in the app

### 7. BUSINESS ANALYSIS
- **Revenue Model**: How the app can generate income
- **Market Position**: Competitive advantages and differentiation
- **Success Metrics**: KPIs to track post-launch
- **Risk Mitigation**: Potential challenges and solutions

${industryConfig ? `
### 8. INDUSTRY-SPECIFIC CONSIDERATIONS
**Common Features in ${industryConfig.industry}**: ${industryConfig.commonFeatures.slice(0, 6).join(', ')}
**Technical Requirements**: ${industryConfig.technicalRecommendations.slice(0, 4).join(', ')}
**Regulatory Considerations**: Industry compliance and legal requirements
` : ''}

## OUTPUT FORMAT
Structure your response as a professional app development proposal that:
1. Uses clear, business-friendly language
2. Provides specific, actionable recommendations
3. Includes realistic timelines and budgets
4. Demonstrates deep industry knowledge
5. Shows clear understanding of the client's business goals

Focus on delivering exceptional value while being transparent about costs, timelines, and technical requirements.
`;
}

/**
 * Detect industry from input data
 */
function detectIndustry(industry: string, appPurpose: string): IndustryPromptConfig | null {
  const combinedText = `${industry} ${appPurpose}`.toLowerCase();
  
  for (const config of INDUSTRY_CONFIGS) {
    for (const keyword of config.keywords) {
      if (combinedText.includes(keyword)) {
        return config;
      }
    }
  }
  
  return null;
}

/**
 * Generate user persona analysis
 */
function generateUserPersona(targetAudience: string): string {
  const personas = {
    'consumers': 'General consumers expect intuitive design, fast performance, and seamless mobile experience. Priority on user onboarding and retention.',
    'businesses': 'Business users need productivity tools, reporting capabilities, and workflow optimization. Focus on efficiency and ROI.',
    'professionals': 'Professional users require advanced features, customization, and integration capabilities. Emphasis on reliability and scalability.',
    'students': 'Student users want engaging, affordable solutions with social features and gamification elements.',
    'seniors': 'Senior users need simple, accessible interfaces with large text, clear navigation, and phone support options.'
  };
  
  const audienceKey = Object.keys(personas).find(key => 
    targetAudience.toLowerCase().includes(key)
  );
  
  return audienceKey ? personas[audienceKey as keyof typeof personas] : 
    `Target audience: ${targetAudience}. Recommend conducting user research to optimize experience for this specific demographic.`;
}

/**
 * Generate follow-up prompts for plan refinement
 */
export function generateRefinementPrompt(
  originalPlan: string, 
  feedback: string, 
  focusArea: 'features' | 'cost' | 'timeline' | 'technical'
): string {
  const focusPrompts = {
    features: 'Focus on feature prioritization, user stories, and functionality details.',
    cost: 'Focus on cost optimization, budget alternatives, and ROI justification.',
    timeline: 'Focus on delivery schedule, milestone planning, and resource allocation.',
    technical: 'Focus on technical architecture, scalability, and implementation details.'
  };
  
  return `
# APP PLAN REFINEMENT REQUEST

## ORIGINAL PLAN CONTEXT
${originalPlan.substring(0, 1000)}...

## CLIENT FEEDBACK
${feedback}

## REFINEMENT FOCUS
${focusPrompts[focusArea]}

## INSTRUCTIONS
Based on the client feedback, update and refine the app plan. Maintain the professional structure but address the specific concerns raised. Provide detailed explanations for any changes and ensure the updated plan remains comprehensive and actionable.

Focus particularly on ${focusArea} while maintaining consistency with other aspects of the plan.
`;
} 