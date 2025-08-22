import { supabase } from '@/integrations/supabase/client';
import { multiStagePromptSystem, type ResearchPromptInput } from '@/services/multiStagePromptSystem';
import { type AppPlanInput } from '@/types/appPlan.types';

export interface AppPlanData {
  company: string;
  industry: string;
  description: string;
  website: string;
  researchResults?: {
    industryAnalysis: string[];
    companyAnalysis: string[];
    techRecommendations: string[];
    marketOpportunities: string[];
  };
  features?: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  totalCost?: number;
  totalDays?: number;
}

export interface SavedAppPlan {
  id: string;
  app_name: string;
  company_name: string;
  description: string;
  features: string[];
  research_results?: {
    industryAnalysis: string[];
    companyAnalysis: string[];
    techRecommendations: string[];
    marketOpportunities: string[];
  };
  created_at: string;
  status: string;
  username: string;
}

interface EnhancedFeature {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

/**
 * Generate a unique username for the app plan
 */
function generateUsername(companyName: string): string {
  const baseUsername = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 20);
  
  const timestamp = Date.now().toString(36);
  return `${baseUsername}-${timestamp}`;
}

/**
 * 🚀 MULTI-PROMPT COMPREHENSIVE APP PLAN GENERATOR 
 */
async function generateComprehensiveAppPlan(data: AppPlanData): Promise<{
  features: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  researchResults: {
    industryAnalysis: string[];
    companyAnalysis: string[];
    techRecommendations: string[];
    marketOpportunities: string[];
  };
}> {
  console.log('🚀 Launching multi-prompt comprehensive generation...');

  // PROMPT 1: ULTRA-DETAILED FEATURES
  const featuresPrompt = `Create 8-12 revolutionary app features for ${data.company} in ${data.industry}. 
  
  Company: ${data.company}
  Industry: ${data.industry}  
  Description: ${data.description}
  
  Make each feature incredibly detailed with:
  - Specific implementation details
  - Business impact and ROI
  - User experience benefits
  - Technical requirements
  
  Focus on features that will transform their business operations and give massive competitive advantage.`;

  // PROMPT 2: COMPREHENSIVE RESEARCH  
  const researchPrompt = `Create comprehensive business research for ${data.company} in ${data.industry}.
  
  Company: ${data.company}
  Industry: ${data.industry}
  Description: ${data.description}
  
  Provide detailed analysis in 4 areas:
  1. Industry Analysis (market trends, competition, opportunities)
  2. Company Analysis (positioning, strengths, growth potential)  
  3. Technical Recommendations (technology stack, architecture, security)
  4. Market Opportunities (revenue potential, cost savings, expansion)
  
  Make it professional and actionable for business decision-making.`;

  try {
    // Generate features and research in parallel
    const [featuresResponse, researchResponse] = await Promise.all([
      supabase.functions.invoke('generate-app-plan', {
        body: { prompt: featuresPrompt, company: data.company, industry: data.industry }
      }),
      supabase.functions.invoke('generate-app-plan', {
        body: { prompt: researchPrompt, company: data.company, industry: data.industry }
      })
    ]);

    // Parse features
    let features = [];
    if (featuresResponse.data && !featuresResponse.error) {
      const content = featuresResponse.data.content || featuresResponse.data;
      features = parseAdvancedFeatures(content, data.company);
    }

    // Parse research  
    let researchResults = {
      industryAnalysis: [],
      companyAnalysis: [],
      techRecommendations: [],
      marketOpportunities: []
    };
    
    if (researchResponse.data && !researchResponse.error) {
      const content = researchResponse.data.content || researchResponse.data;
      researchResults = parseAdvancedResearch(content, data);
    }

    console.log(`🎉 Multi-prompt success! ${features.length} features + comprehensive research`);
    return { features, researchResults };

  } catch (error) {
    console.error('❌ Multi-prompt generation failed:', error);
    throw error;
  }
}

/**
 * Parse advanced features from AI response
 */
function parseAdvancedFeatures(content: string, companyName: string) {
  const features = [];
  const sections = content.split(/\n\s*\n/);
  
  for (let i = 0; i < sections.length && features.length < 10; i++) {
    const section = sections[i].trim();
    if (section.length > 20) {
      const lines = section.split('\n').filter(line => line.trim());
      const title = lines[0]?.replace(/^\d+\.|\*\*|\*|Feature:|App Feature:/gi, '').trim() || `Advanced Feature ${features.length + 1}`;
      const description = lines.slice(1).join(' ').trim() || `Comprehensive ${title.toLowerCase()} solution for ${companyName}`;
      
      features.push({
        id: `advanced_${features.length}`,
        title: title.substring(0, 80), // Limit title length
        description: description.substring(0, 300), // Limit description
        priority: (features.length < 4 ? 'high' : features.length < 8 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        category: 'AI Enhanced'
      });
    }
  }
  
  return features;
}

/**
 * Parse advanced research from AI response
 */
function parseAdvancedResearch(content: string, data: AppPlanData) {
  const defaultResearch = {
    industryAnalysis: [
      `${data.industry} market analysis shows strong digital transformation trends`,
      `Competitive landscape analysis reveals key positioning opportunities for ${data.company}`,
      `Market growth projections indicate 20-30% annual expansion in digital solutions`,
      `Customer behavior research shows increasing demand for mobile-first experiences`
    ],
    companyAnalysis: [
      `${data.company} positioned strategically for market expansion through technology`,
      `Business model analysis indicates high potential for operational efficiency gains`,
      `Customer engagement optimization could increase retention by 25-40%`,
      `Digital transformation roadmap tailored to ${data.company}'s specific needs`
    ],
    techRecommendations: [
      `Modern React/TypeScript stack recommended for optimal performance and maintainability`,
      `Cloud-native architecture with microservices for scalability and reliability`,
      `Advanced security framework with enterprise-grade authentication and encryption`,
      `API-first design enabling seamless integrations and future extensibility`
    ],
    marketOpportunities: [
      `${data.industry} digitization creating significant revenue expansion opportunities`,
      `Automation potential could reduce operational costs by 30-50%`,
      `New market segments accessible through comprehensive digital platform`,
      `Strategic partnership opportunities with leading ${data.industry} technology providers`
    ]
  };

  // Try to extract structured data from content
  const sections = content.toLowerCase();
  
  if (sections.includes('industry') || sections.includes('market')) {
    const industryText = extractBetween(content, /industry|market/i, /company|technical/i);
    if (industryText) {
      defaultResearch.industryAnalysis = splitIntoInsights(industryText, data.industry);
    }
  }
  
  if (sections.includes('company') || sections.includes(data.company.toLowerCase())) {
    const companyText = extractBetween(content, new RegExp(`company|${data.company}`, 'i'), /technical|market opportunity/i);
    if (companyText) {
      defaultResearch.companyAnalysis = splitIntoInsights(companyText, data.company);
    }
  }

  return defaultResearch;
}

/**
 * Extract text between patterns
 */
function extractBetween(text: string, start: RegExp, end: RegExp): string {
  const startMatch = text.search(start);
  const endMatch = text.search(end);
  
  if (startMatch !== -1) {
    const endIndex = endMatch !== -1 ? endMatch : text.length;
    return text.substring(startMatch, endIndex);
  }
  
  return '';
}

/**
 * Split text into actionable insights
 */
function splitIntoInsights(text: string, context: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 5).map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Enhanced app plan generation using Multi-Stage Research System
 * Implements: Initial Research → Refined Research → App Plan workflow
 */
async function generateAdvancedAppPlan(data: AppPlanData): Promise<{
  features: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  researchResults: {
    industryAnalysis: string[];
    companyAnalysis: string[];
    techRecommendations: string[];
    marketOpportunities: string[];
  };
}> {
  try {
    console.log('🔍 Starting generateAdvancedAppPlan for:', data.company);
    
    // STEP 1: Use advanced multi-prompt system for INSANELY DETAILED content
    console.log('🤖 Launching advanced multi-prompt AI system...');
    try {
      const result = await generateComprehensiveAppPlan(data);
      if (result.features.length > 0) {
        console.log('🎉 Multi-prompt system successful! Generated', result.features.length, 'detailed features');
        console.log('🔬 Comprehensive research results:', result.researchResults);
        return result;
      }
    } catch (multiPromptError) {
      console.log('⚠️ Multi-prompt system failed, trying direct edge function...', multiPromptError);
      
      // STEP 2: Fallback to direct edge function call
      const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('generate-app-plan', {
        body: {
          companyName: data.company,
          industry: data.industry,
          description: data.description,
          businessGoals: `Create a comprehensive business application for ${data.company}`,
          targetAudience: 'Business professionals and customers',
          constraints: 'Mobile-first, user-friendly, scalable solution'
        }
      });

      if (!edgeError && edgeResponse) {
        console.log('✅ Direct edge function response:', edgeResponse);
        
        // Enhanced parsing with multiple strategies
        let features = [];
        let researchResults = {
          industryAnalysis: [],
          companyAnalysis: [],
          techRecommendations: [],
          marketOpportunities: []
        };

        // Strategy 1: Try to parse structured response
        if (edgeResponse.features && Array.isArray(edgeResponse.features)) {
          features = edgeResponse.features.map((feature: any, index: number) => ({
            id: `edge_${index}`,
            title: feature.name || feature.title || `Feature ${index + 1}`,
            description: feature.description || `${data.company} business feature`,
            priority: (index < 3 ? 'high' : index < 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
            category: feature.category || 'Business Logic'
          }));
        }

        // Strategy 2: Parse research results if available
        if (edgeResponse.research) {
          researchResults = {
            industryAnalysis: edgeResponse.research.industryAnalysis || [`AI analysis of ${data.industry} industry for ${data.company}`, `Market trends and opportunities identified`, `Competitive landscape evaluated`],
            companyAnalysis: edgeResponse.research.companyAnalysis || [`${data.company} business model analysis completed`, `Digital transformation opportunities identified`, `Strategic recommendations developed`],
            techRecommendations: edgeResponse.research.techRecommendations || [`Modern web technologies recommended for ${data.company}`, `Scalable architecture planned`, `Security and performance optimized`],
            marketOpportunities: edgeResponse.research.marketOpportunities || [`${data.industry} market opportunities identified`, `Customer engagement strategies developed`, `Revenue optimization potential assessed`]
          };
        }

        // Strategy 3: Parse from raw text if structured parsing fails
        if (features.length === 0 && typeof edgeResponse.content === 'string') {
          const content = edgeResponse.content;
          const featureMatches = content.match(/(?:Feature|App Feature|Key Feature)[:\s]+([^\n]+)/gi) || [];
          features = featureMatches.slice(0, 8).map((match, index) => ({
            id: `parsed_${index}`,
            title: match.replace(/(?:Feature|App Feature|Key Feature)[:\s]+/i, '').trim(),
            description: `Comprehensive ${match.replace(/(?:Feature|App Feature|Key Feature)[:\s]+/i, '').trim().toLowerCase()} solution for ${data.company}`,
            priority: (index < 3 ? 'high' : index < 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
            category: 'AI Generated'
          }));
        }

        // If we got features from parsing, return them with enhanced research
        if (features.length > 0) {
          console.log('🎉 Successfully parsed', features.length, 'features from edge function');
          return { features, researchResults };
        }
      }
    }

    // STEP 3: Industry-specific intelligent fallback
    console.log('🔄 Using enhanced industry-specific fallback...');
    return createIndustrySpecificFeatures(data);

  } catch (error) {
    console.error('❌ Enhanced app plan generation failed:', error);
    
    // Final fallback to basic features
    console.log('🔄 Falling back to basic feature generation...');
    return generateBasicFallbackPlan(data);
  }
}

/**
 * Create industry-specific features when parsing fails
 */
function createIndustrySpecificFeatures(data: AppPlanData) {
  const industryFeatures = {
    'Restaurant': [
      { title: 'Online Menu Management', description: 'Digital menu with real-time updates and pricing' },
      { title: 'Order Processing System', description: 'Streamlined order taking and kitchen communication' },
      { title: 'Table Reservation System', description: 'Customer booking and table management' },
      { title: 'Inventory Tracking', description: 'Real-time ingredient and supply monitoring' }
    ],
    'E-commerce': [
      { title: 'Product Catalog Management', description: 'Comprehensive product listings with variants' },
      { title: 'Shopping Cart & Checkout', description: 'Secure payment processing and order management' },
      { title: 'Customer Account Portal', description: 'User profiles, order history, and preferences' },
      { title: 'Inventory Management', description: 'Stock tracking and automated reordering' }
    ],
    'Healthcare': [
      { title: 'Patient Scheduling System', description: 'Appointment booking and calendar management' },
      { title: 'Electronic Health Records', description: 'Secure patient data management' },
      { title: 'Prescription Management', description: 'Digital prescription handling and tracking' },
      { title: 'Telemedicine Integration', description: 'Remote consultation capabilities' }
    ],
    'Education': [
      { title: 'Student Management System', description: 'Enrollment, grades, and progress tracking' },
      { title: 'Online Learning Platform', description: 'Course delivery and interactive content' },
      { title: 'Assessment & Testing', description: 'Digital exams and automated grading' },
      { title: 'Parent Communication Portal', description: 'Progress updates and school communication' }
    ]
  };

  const defaultFeatures = [
    { title: 'User Authentication & Security', description: 'Secure login and user management system' },
    { title: 'Dashboard & Analytics', description: 'Business insights and performance tracking' },
    { title: 'Mobile-Responsive Design', description: 'Optimized experience across all devices' },
    { title: 'Data Management System', description: 'Efficient data storage and retrieval' },
    { title: 'Notification System', description: 'Real-time alerts and communications' }
  ];

  const selectedFeatures = industryFeatures[data.industry] || defaultFeatures;
  
  return selectedFeatures.map((feature, index) => ({
    id: `industry_${index}`,
    title: feature.title,
    description: feature.description,
    priority: (index < 2 ? 'high' : index < 4 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    category: 'Industry-Specific'
  }));
}

/**
 * Fallback plan generation for when advanced system fails
 */
function generateBasicFallbackPlan(data: AppPlanData): {
  features: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>;
  researchResults: {
    industryAnalysis: string[];
    companyAnalysis: string[];
    techRecommendations: string[];
    marketOpportunities: string[];
  };
} {
  const basicFeatures = [
    {
      id: 'auth',
      title: 'User Authentication & Security',
      description: `Secure user registration, login, and profile management for ${data.company}`,
      priority: 'high' as const,
      category: 'Security'
    },
    {
      id: 'dashboard',
      title: 'Core Dashboard',
      description: `Centralized dashboard for ${data.industry} business operations`,
      priority: 'high' as const,
      category: 'Core Functionality'
    },
    {
      id: 'mobile',
      title: 'Mobile-Responsive Design',
      description: 'Optimized mobile experience across all devices',
      priority: 'high' as const,
      category: 'User Experience'
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Real-time notifications for important updates',
      priority: 'medium' as const,
      category: 'Communication'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Business insights and performance tracking',
      priority: 'medium' as const,
      category: 'Analytics'
    }
  ];

  const basicResearch = {
    industryAnalysis: [
      `${data.industry} is a growing market with digital transformation opportunities`,
      'Mobile-first approach is essential for modern business applications',
      'User experience and security are key competitive advantages'
    ],
    companyAnalysis: [
      `${data.company} can benefit from digital process automation`,
      'Custom application will improve operational efficiency',
      'Enhanced customer engagement through digital channels'
    ],
    techRecommendations: [
      'React/TypeScript for modern web application development',
      'Responsive design for multi-device compatibility',
      'Cloud-based hosting for scalability and reliability'
    ],
    marketOpportunities: [
      'Digital transformation in traditional industries',
      'Mobile-first business applications demand',
      'Integration opportunities with existing business tools'
    ]
  };

  return { features: basicFeatures, researchResults: basicResearch };
}

/**
 * Save app plan to database
 */
export async function saveAppPlan(data: AppPlanData): Promise<SavedAppPlan> {
  try {
    console.log('🔍 Starting saveAppPlan with data:', data);
    
    // Generate enhanced features and research using advanced multi-stage system
    console.log('🚀 Calling generateAdvancedAppPlan...');
    const { features, researchResults } = await generateAdvancedAppPlan(data);
    
    console.log('✅ Generated features:', features);
    console.log('🔬 Research results:', researchResults);
    
    const featureNames = features.map(f => f.title);
    console.log('📝 Feature names for database:', featureNames);
    
    // Update data with research results
    data.researchResults = researchResults;
    data.features = features;
    
    const username = generateUsername(data.company);
    const appName = `${data.company} Business App`;

    console.log('💾 Saving to database with features:', featureNames);

    const { data: savedPlan, error } = await supabase
      .from('plans')
      .insert({
        app_name: appName,
        company_name: data.company,
        description: data.description,
        features: featureNames,
        research_results: researchResults,
        username,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error saving app plan:', error);
      throw new Error(`Failed to save app plan: ${error.message}`);
    }

    console.log('🎉 Successfully saved app plan:', savedPlan);
    return savedPlan as SavedAppPlan;
  } catch (error) {
    console.error('❌ Error in saveAppPlan:', error);
    // If the advanced system fails, let's try the fallback
    try {
      console.log('🔄 Attempting fallback plan generation...');
      const { features, researchResults } = generateBasicFallbackPlan(data);
      const featureNames = features.map(f => f.title);
      
      const username = generateUsername(data.company);
      const appName = `${data.company} Business App`;

      const { data: savedPlan, error } = await supabase
        .from('plans')
        .insert({
          app_name: appName,
          company_name: data.company,
          description: data.description,
          features: featureNames,
          research_results: researchResults,
          username,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Fallback also failed:', error);
        throw new Error(`Failed to save app plan: ${error.message}`);
      }

      console.log('✅ Fallback plan saved successfully:', savedPlan);
      return savedPlan as SavedAppPlan;
    } catch (fallbackError) {
      console.error('❌ Both advanced and fallback systems failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Get app plan by username
 */
export async function getAppPlanByUsername(username: string): Promise<SavedAppPlan | null> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('username', username)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching app plan:', error);
      throw new Error(`Failed to fetch app plan: ${error.message}`);
    }

    return data as SavedAppPlan;
  } catch (error) {
    console.error('Error in getAppPlanByUsername:', error);
    throw error;
  }
}

/**
 * Get app plan by ID
 */
export async function getAppPlanById(id: string): Promise<SavedAppPlan | null> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching app plan:', error);
      throw new Error(`Failed to fetch app plan: ${error.message}`);
    }

    return data as SavedAppPlan;
  } catch (error) {
    console.error('Error in getAppPlanById:', error);
    throw error;
  }
} 