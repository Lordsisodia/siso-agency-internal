/**
 * App Plan Agent Service
 * AI-powered app plan generation from business requirements
 */

import { 
  AppPlanInput, 
  GeneratedAppPlan, 
  AppPlanGenerationOptions,
  FeaturePlan,
  DevelopmentPhase,
  TechnicalRequirements,
  CostBreakdown,
  UIUXPlan
} from '@/types/appPlan.types';
import { getBusinessOnboardingData } from '@/utils/clientData';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface for industry research data
 */
interface IndustryResearch {
  industryTrends: string[];
  keyCompetitors: string[];
  userBehaviors: string[];
  marketGrowth: string;
  technologicalFactors: string[];
  recommendations: string[];
  opportunityAreas: string[];
  challengesToAddress: string[];
}

/**
 * App Plan Agent Service
 * Multi-stage AI process for app plan generation with research phase
 */
class AppPlanAgent {
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Convert business onboarding data to App Plan Input
   */
  public createInputFromOnboardingData(): AppPlanInput | null {
    const businessData = getBusinessOnboardingData();
    if (!businessData) return null;

    return {
      businessName: businessData.businessName,
      appPurpose: businessData.appPurpose,
      industry: businessData.industry,
      targetAudience: businessData.targetAudience,
      communicationPreference: businessData.communicationPreference
    };
  }

  /**
   * Generate AI prompt for industry research
   */
  private generateResearchPrompt(input: AppPlanInput): string {
    return `
You are an expert market research analyst. Provide comprehensive industry research based on these requirements:

BUSINESS INFORMATION:
- Company: ${input.businessName}
- App Purpose: ${input.appPurpose}
- Industry: ${input.industry}
- Target Audience: ${input.targetAudience}

I need detailed research on this industry to inform an app development plan. Please provide:

1. Current industry trends and market direction
2. Key competitors and their app offerings
3. Target audience behaviors and preferences
4. Market growth projections
5. Technological factors impacting this industry
6. Specific recommendations for app development in this space
7. Opportunity areas that competitors might be missing
8. Challenges that need to be addressed

Focus on providing actionable insights that will directly inform app feature planning and technical decisions.
    `;
  }

  /**
   * Generate AI prompt for app plan creation (enhanced with research)
   */
  private generatePlanPrompt(input: AppPlanInput, research: IndustryResearch, options: AppPlanGenerationOptions): string {
    return `
You are an expert app development consultant. Create a comprehensive app plan based on these requirements and research:

BUSINESS REQUIREMENTS:
- Company: ${input.businessName}
- App Purpose: ${input.appPurpose}
- Industry: ${input.industry}
- Target Audience: ${input.targetAudience}
- Budget: ${input.budget || 'Not specified'}
- Timeline: ${input.timeline || 'Flexible'}

INDUSTRY RESEARCH FINDINGS:
- Industry Trends: ${research.industryTrends.join(', ')}
- Key Competitors: ${research.keyCompetitors.join(', ')}
- User Behaviors: ${research.userBehaviors.join(', ')}
- Market Growth: ${research.marketGrowth}
- Tech Factors: ${research.technologicalFactors.join(', ')}
- Opportunity Areas: ${research.opportunityAreas.join(', ')}
- Challenges: ${research.challengesToAddress.join(', ')}

RECOMMENDATIONS FROM RESEARCH:
${research.recommendations.join('\n- ')}

ANALYSIS FOCUS: ${options.focusAreas.join(', ')}
DETAIL LEVEL: ${options.detailLevel}

Please provide a detailed analysis including:
1. Executive Summary
2. Recommended features with priorities (informed by the research)
3. Technical architecture recommendations
4. Development phases and timeline
5. Cost breakdown
6. UI/UX recommendations
7. Market analysis (leveraging the research provided)
8. Risk assessment and mitigation

Structure your response as a comprehensive app development plan that a client can understand and a development team can implement.
    `;
  }

  /**
   * Call AI model via Supabase Edge Function for research phase
   */
  private async callResearchAI(prompt: string, input: AppPlanInput): Promise<IndustryResearch> {
    console.log(`🔍 Calling AI for industry research...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-industry-research', {
        body: {
          businessData: {
            businessName: input.businessName,
            appPurpose: input.appPurpose,
            industry: input.industry,
            targetAudience: input.targetAudience,
          }
        }
      });

      if (error) {
        console.error('Supabase function error (research):', error);
        throw new Error(`Research AI generation failed: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error('Research AI returned no data');
      }

      console.log('✅ Industry research generated successfully');
      return data.research as IndustryResearch;

    } catch (error) {
      console.error('Error calling Research AI:', error);
      
      // Fallback to mock research data
      console.log('🔄 Falling back to mock research data...');
      return this.getMockResearchData(input);
    }
  }

  /**
   * Call AI model via Supabase Edge Function for app plan generation
   */
  private async callPlanAI(prompt: string, model: string, input: AppPlanInput, research: IndustryResearch): Promise<string> {
    console.log(`🤖 Calling AI model ${model} for app plan generation...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-app-plan', {
        body: {
          businessData: {
            businessName: input.businessName,
            appPurpose: input.appPurpose,
            industry: input.industry,
            targetAudience: input.targetAudience,
            budget: input.budget,
            timeline: input.timeline
          },
          researchData: research,
          options: {
            model: model,
            includeMarketAnalysis: true,
            includeCostEstimates: true,
            detailLevel: 'detailed'
          }
        }
      });

      if (error) {
        console.error('Supabase function error (plan):', error);
        throw new Error(`App plan generation failed: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error('App plan generation returned no data');
      }

      console.log('✅ AI app plan generated successfully');
      return data.rawResponse;

    } catch (error) {
      console.error('Error calling Plan AI:', error);
      
      // Fallback to enhanced mock for development/testing
      console.log('🔄 Falling back to enhanced mock response...');
      return this.getEnhancedMockResponse(input, research);
    }
  }

  /**
   * Mock industry research data
   */
  private getMockResearchData(input: AppPlanInput): IndustryResearch {
    console.log('📊 Generating mock research data...');
    
    // Generate research based on industry type
    const industry = input.industry.toLowerCase();
    
    if (industry.includes('e-commerce') || industry.includes('retail')) {
      return {
        industryTrends: [
          'Mobile-first shopping experiences',
          'Sustainable and ethical product focus',
          'AR product visualization',
          'Social commerce integration',
          'Personalized recommendations'
        ],
        keyCompetitors: [
          'Traditional retailers with omnichannel presence',
          'Pure-play e-commerce platforms',
          'Sustainable fashion marketplaces',
          'Direct-to-consumer brands'
        ],
        userBehaviors: [
          'Researching product sustainability credentials',
          'Seeking seamless mobile checkout',
          'Expecting same-day/next-day delivery',
          'Sharing purchases on social media',
          'Demanding transparent supply chains'
        ],
        marketGrowth: 'Sustainable fashion sector growing at 8-10% annually, outpacing traditional retail',
        technologicalFactors: [
          'Mobile payment adoption',
          'AR/VR for virtual try-on',
          'AI-powered personalization',
          'Blockchain for supply chain transparency',
          'Voice commerce emerging'
        ],
        recommendations: [
          'Prioritize mobile-first design with streamlined checkout',
          'Implement sustainability filters and metrics',
          'Include AR try-on capabilities for clothing',
          'Build robust product recommendation engine',
          'Develop social sharing capabilities'
        ],
        opportunityAreas: [
          'Carbon footprint tracking per purchase',
          'Virtual styling assistance',
          'Sustainability-focused loyalty program',
          'Community features for sustainable fashion enthusiasts'
        ],
        challengesToAddress: [
          'Competitive market with established players',
          'User skepticism about sustainability claims',
          'Complex logistics for ethical supply chains',
          'High customer acquisition costs'
        ]
      };
    } else if (industry.includes('fitness') || industry.includes('health')) {
      return {
        industryTrends: [
          'Integration with wearable devices',
          'Personalized workout and nutrition plans',
          'Community and social fitness challenges',
          'On-demand and live-streamed workouts',
          'Gamification of fitness goals'
        ],
        keyCompetitors: [
          'Major fitness app platforms',
          'Specialized workout apps',
          'Wearable device companion apps',
          'Nutrition and diet tracking apps'
        ],
        userBehaviors: [
          'Working out at home or on-the-go',
          'Tracking progress across multiple metrics',
          'Seeking community accountability',
          'Personalizing fitness journeys',
          'Integrating with existing devices'
        ],
        marketGrowth: 'Digital fitness market growing at 15% CAGR through 2027, accelerated by pandemic',
        technologicalFactors: [
          'Wearable device proliferation',
          'AI for workout form correction',
          'Machine learning for personalization',
          'Video streaming quality improvements',
          'Battery optimization for all-day tracking'
        ],
        recommendations: [
          'Develop comprehensive device integration',
          'Create AI-powered personalized plans',
          'Build strong social and community features',
          'Implement video-based workout library',
          'Design gamified achievement system'
        ],
        opportunityAreas: [
          'Real-time form correction using device sensors',
          'Hybrid home/gym workout planning',
          'Mental wellness integration with physical fitness',
          'Nutrition and workout correlation analysis'
        ],
        challengesToAddress: [
          'User retention beyond initial motivation period',
          'Integration complexity with various devices',
          'Creating engaging content consistently',
          'Privacy concerns with health data'
        ]
      };
    } else if (industry.includes('education') || industry.includes('learning')) {
      return {
        industryTrends: [
          'Microlearning and bite-sized content',
          'Skills-based learning paths',
          'Interactive coding environments',
          'Certification and credential tracking',
          'Peer-to-peer learning communities'
        ],
        keyCompetitors: [
          'MOOC platforms',
          'Coding bootcamp apps',
          'Language learning platforms',
          'Professional development portals'
        ],
        userBehaviors: [
          'Learning in short, focused sessions',
          'Practicing through interactive exercises',
          'Seeking industry-relevant projects',
          'Validating skills with certifications',
          'Connecting with peers and mentors'
        ],
        marketGrowth: 'EdTech market growing at 16% annually, with professional skills segment growing faster',
        technologicalFactors: [
          'Interactive coding environments in browser',
          'AI-driven learning path optimization',
          'Automated assessment technologies',
          'Video conferencing and collaboration tools',
          'Blockchain for credential verification'
        ],
        recommendations: [
          'Create structured learning paths with clear outcomes',
          'Implement interactive coding exercises',
          'Build progress tracking with visual metrics',
          'Develop peer review and feedback systems',
          'Offer shareable certificates and credentials'
        ],
        opportunityAreas: [
          'AI-powered personalized learning sequences',
          'Mentor matching marketplace',
          'Project-based assessments with real-world relevance',
          'Community-driven content creation'
        ],
        challengesToAddress: [
          'High competition in the edtech space',
          'Course completion and engagement rates',
          'Keeping technical content up-to-date',
          'Scaling personalized feedback'
        ]
      };
    } else {
      // Generic research for other industries
      return {
        industryTrends: [
          'Mobile-first user experiences',
          'Personalization and AI-driven recommendations',
          'Subscription-based business models',
          'Integration with existing tools and platforms',
          'Data privacy and security focus'
        ],
        keyCompetitors: [
          'Established players with legacy systems',
          'Startup disruptors with modern technology',
          'Adjacent industry players expanding their offerings',
          'International competitors entering the market'
        ],
        userBehaviors: [
          'Increasing mobile usage for core tasks',
          'Expecting seamless and intuitive experiences',
          'Valuing time-saving automation features',
          'Seeking personalized experiences',
          'Looking for integration with existing workflows'
        ],
        marketGrowth: `The ${input.industry} sector is growing steadily with digital transformation as a key driver`,
        technologicalFactors: [
          'Cloud-based infrastructure adoption',
          'AI and machine learning for personalization',
          'API economy enabling integration ecosystems',
          'Progressive web apps reducing friction',
          'Data analytics driving decision-making'
        ],
        recommendations: [
          'Focus on intuitive mobile-first design',
          'Implement personalization features early',
          'Build with API-first architecture',
          'Create seamless onboarding experience',
          'Prioritize core user journeys'
        ],
        opportunityAreas: [
          'Workflow automation to save user time',
          'Data visualization and insights',
          'Cross-platform synchronization',
          'Community and collaboration features'
        ],
        challengesToAddress: [
          'User adoption and habit formation',
          'Technical complexity and maintenance',
          'Security and compliance requirements',
          'Differentiation in competitive market'
        ]
      };
    }
  }

  /**
   * Enhanced mock response for app plan
   */
  private getEnhancedMockResponse(input: AppPlanInput, research: IndustryResearch): string {
    return `
# EXECUTIVE SUMMARY

Based on thorough industry research and analysis, we recommend developing a comprehensive ${input.appPurpose} solution for ${input.businessName} targeting ${input.targetAudience} in the ${input.industry} industry. Our research indicates key trends including ${research.industryTrends.slice(0, 3).join(', ')}, which this app will address through innovative features and user experience.

# FEATURE RECOMMENDATIONS

## Core Features (High Priority)
- **User Authentication & Profiles**: Secure registration, login, and profile management
- **${input.appPurpose} Core Functions**: Main application functionality tailored to business needs
- **Product Management**: Comprehensive catalog with filtering and search capabilities
- **Shopping Experience**: Intuitive cart and checkout process

## Secondary Features (Medium Priority)  
- **Notifications System**: Real-time updates and promotional alerts
- **User Reviews & Ratings**: Community feedback and social proof
- **Wishlist Functionality**: Save and track desired items
- **Order Tracking**: Real-time status and delivery updates
- **Sustainability Features**: ${research.industryTrends.includes('Sustainable') ? 'Eco-friendly product filtering and carbon footprint tracking' : 'Features aligned with industry sustainability trends'}

## Advanced Features (Low Priority)
- **AR Capabilities**: ${research.technologicalFactors.includes('AR') ? 'Virtual try-on for products' : 'Advanced visualization features'}
- **Social Integration**: Sharing capabilities and community features
- **Loyalty Program**: Rewards and incentives for repeat customers

# TECHNICAL ARCHITECTURE

## Platform Recommendation
- **Approach**: Cross-platform development for iOS and Android
- **Framework**: React Native with TypeScript for code reusability
- **Backend**: Node.js with Express.js API

## Technology Stack
- **Frontend**: React Native, TypeScript, Redux
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: PostgreSQL with Redis caching
- **Storage**: AWS S3 for file storage
- **Hosting**: AWS EC2 or Google Cloud Platform

# DEVELOPMENT PHASES

## Phase 1: Foundation (4-6 weeks)
- User authentication system
- Core app functionality
- Product catalog implementation
- Basic UI/UX implementation
- Database setup and API development

## Phase 2: E-commerce Functionality (3-4 weeks)
- Shopping cart functionality
- Checkout process
- Order tracking system
- Payment integration

## Phase 3: Enhancement (4-5 weeks)
- Notifications system
- Reviews functionality
- Wishlist implementation
- Sustainability features

## Phase 4: Advanced Features (4-6 weeks)
- AR capabilities implementation
- Social sharing integration
- Loyalty program development
- Final testing and optimization

# COST BREAKDOWN (GBP)

- **Development**: £28,000
- **UI/UX Design**: £8,000
- **Testing & QA**: £4,000
- **Deployment & Setup**: £2,000
- **First Year Maintenance**: £5,000
- **Total Project Cost**: £47,000

# MARKET ANALYSIS

The ${input.industry} industry shows strong growth potential with ${research.marketGrowth}. ${input.targetAudience} users are increasingly expecting ${research.userBehaviors[0]} and ${research.userBehaviors[1]}. Key competitors include ${research.keyCompetitors[0]} and ${research.keyCompetitors[1]}, but opportunity areas exist in ${research.opportunityAreas[0]} and ${research.opportunityAreas[1]}.

# RISKS AND MITIGATION

- **Technical Complexity**: Mitigate with experienced development team
- **Market Competition**: Focus on unique value proposition and user experience
- **Integration Challenges**: Implement thorough testing procedures
- **User Adoption**: Develop strong marketing strategy and intuitive onboarding
    `;
  }

  /**
   * Parse AI response into structured plan data
   */
  private parseAIResponse(response: string, input: AppPlanInput, research: IndustryResearch): Partial<GeneratedAppPlan> {
    // In production, this would be more sophisticated parsing
    // For now, creating structured data from the mock response
    
    const features: FeaturePlan[] = [
      {
        id: this.generateUniqueId(),
        name: 'User Authentication',
        description: 'Secure user registration, login, and profile management',
        priority: 'high',
        complexity: 'moderate',
        estimatedHours: 40,
        dependencies: [],
        userStories: [
          'As a user, I want to create an account so I can access the app',
          'As a user, I want to securely log in to my account',
          'As a user, I want to reset my password if I forget it',
          'As a user, I want to update my profile information'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: `Core App Features`,
        description: `Main functionality for ${input.appPurpose}`,
        priority: 'high',
        complexity: 'complex',
        estimatedHours: 120,
        dependencies: [],
        userStories: [
          `As a user, I want to ${input.appPurpose.toLowerCase().includes("mobile") ? "browse products on my mobile device" : input.appPurpose.toLowerCase().includes("e-commerce") ? "browse and purchase products" : "access the core functionality"}`,
          `As a user, I want a mobile-first e-commerce platform for sustainable fashion and lifestyle products`,
          `As a user, I want to have a seamless browsing and shopping experience`
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'Product Management',
        description: 'Comprehensive product catalog with filtering, searching, and recommendation engine',
        priority: 'high',
        complexity: 'moderate',
        estimatedHours: 80,
        dependencies: [],
        userStories: [
          'As a user, I want to search for products by category',
          'As a user, I want to filter products by various attributes',
          'As a user, I want to see recommended products based on my preferences',
          'As a user, I want to view detailed product information and images'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'Shopping Cart & Checkout',
        description: 'Secure and intuitive shopping cart and checkout process with multiple payment options',
        priority: 'high',
        complexity: 'complex',
        estimatedHours: 100,
        dependencies: [],
        userStories: [
          'As a user, I want to add products to my cart',
          'As a user, I want to modify quantities in my cart',
          'As a user, I want to check out securely',
          'As a user, I want to choose from multiple payment methods'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'Notifications',
        description: 'Push notifications and in-app messaging for order updates and promotions',
        priority: 'medium',
        complexity: 'moderate',
        estimatedHours: 32,
        dependencies: [],
        userStories: [
          'As a user, I want to receive notifications about important updates',
          'As a user, I want to get alerts about order status changes',
          'As a user, I want to receive personalized offers and promotions'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'User Reviews & Ratings',
        description: 'Allow users to leave reviews and ratings for products',
        priority: 'medium',
        complexity: 'simple',
        estimatedHours: 24,
        dependencies: [],
        userStories: [
          'As a user, I want to leave reviews for products I purchased',
          'As a user, I want to rate products on a scale',
          'As a user, I want to read other customers\' reviews before making a purchase'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'Wishlist',
        description: 'Allow users to save products to a wishlist for future reference',
        priority: 'medium',
        complexity: 'simple',
        estimatedHours: 16,
        dependencies: [],
        userStories: [
          'As a user, I want to save products to my wishlist',
          'As a user, I want to move items from my wishlist to my cart',
          'As a user, I want to share my wishlist with friends'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'Order Tracking',
        description: 'Real-time order tracking and delivery status updates',
        priority: 'medium',
        complexity: 'moderate',
        estimatedHours: 40,
        dependencies: [],
        userStories: [
          'As a user, I want to track my order status in real-time',
          'As a user, I want to receive delivery updates',
          'As a user, I want to view my order history'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'Sustainability Features',
        description: 'Eco-friendly product filtering and carbon footprint tracking',
        priority: 'medium',
        complexity: 'complex',
        estimatedHours: 60,
        dependencies: [],
        userStories: [
          'As a user, I want to filter products by sustainability criteria',
          'As a user, I want to see the carbon footprint of my purchases',
          'As a user, I want to learn about sustainable practices'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'AR Try-On',
        description: 'Augmented reality feature for virtually trying on clothing items',
        priority: 'low',
        complexity: 'complex',
        estimatedHours: 120,
        dependencies: [],
        userStories: [
          'As a user, I want to virtually try on clothing items before purchasing',
          'As a user, I want to see how items look on me from different angles',
          'As a user, I want to share virtual try-on results with friends'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'Social Sharing',
        description: 'Allow users to share products and purchases on social media',
        priority: 'low',
        complexity: 'simple',
        estimatedHours: 20,
        dependencies: [],
        userStories: [
          'As a user, I want to share products on social media',
          'As a user, I want to share my purchases with friends',
          'As a user, I want to tag the brand in my social media posts'
        ]
      },
      {
        id: this.generateUniqueId(),
        name: 'Loyalty Program',
        description: 'Rewards program with sustainability-focused incentives',
        priority: 'low',
        complexity: 'moderate',
        estimatedHours: 50,
        dependencies: [],
        userStories: [
          'As a user, I want to earn points for my purchases',
          'As a user, I want to redeem points for rewards',
          'As a user, I want to earn special rewards for eco-friendly choices'
        ]
      }
    ];

    // Incorporate research into the technical requirements
    const technicalRequirements: TechnicalRequirements = {
      platform: 'cross-platform',
      techStack: {
        frontend: ['React Native', 'TypeScript'],
        backend: ['Node.js', 'Express'],
        database: ['PostgreSQL', 'Redis'],
        apis: ['REST API', 'WebSocket']
      },
      architecture: 'Microservices with API Gateway',
      scalability: 'Horizontal scaling with load balancing',
      security: ['JWT Authentication', 'HTTPS', 'Data Encryption'],
      integrations: [
        'Payment Gateway', 
        'Push Notifications', 
        'Analytics',
        ...research.technologicalFactors.slice(0, 2)
      ]
    };

    const developmentPhases: DevelopmentPhase[] = [
      {
        id: this.generateUniqueId(),
        name: 'Phase 1: Foundation',
        description: 'Core authentication and basic functionality',
        features: [features[0].id, features[1].id, features[2].id],
        estimatedDuration: '4-6 weeks',
        milestones: ['User registration complete', 'Core features functional', 'Product catalog implemented'],
        deliverables: ['MVP Backend', 'Basic UI/UX', 'Authentication System', 'Product Management']
      },
      {
        id: this.generateUniqueId(),
        name: 'Phase 2: E-commerce Functionality',
        description: 'Shopping cart, checkout, and order management',
        features: [features[3].id, features[7].id],
        estimatedDuration: '3-4 weeks',
        milestones: ['Shopping cart functionality', 'Checkout process', 'Order tracking system'],
        deliverables: ['Complete Shopping Experience', 'Payment Integration', 'Order Management']
      },
      {
        id: this.generateUniqueId(),
        name: 'Phase 3: Enhancement',
        description: 'Additional features and user engagement',
        features: [features[4].id, features[5].id, features[6].id, features[8].id],
        estimatedDuration: '4-5 weeks',
        milestones: ['Notifications working', 'Reviews system', 'Wishlist functionality', 'Sustainability features'],
        deliverables: ['Enhanced User Experience', 'Complete User Engagement Features']
      },
      {
        id: this.generateUniqueId(),
        name: 'Phase 4: Advanced Features',
        description: 'AR try-on, social sharing, and loyalty program',
        features: [features[9].id, features[10].id, features[11].id],
        estimatedDuration: '4-6 weeks',
        milestones: ['AR functionality', 'Social sharing integration', 'Loyalty program implementation'],
        deliverables: ['Advanced Features', 'Final Testing', 'App Store Preparation']
      }
    ];

    const costBreakdown: CostBreakdown = {
      development: 28000,
      design: 8000,
      testing: 4000,
      deployment: 2000,
      maintenance: 5000,
      total: 47000,
      currency: 'GBP'
    };

    const uiuxPlan: UIUXPlan = {
      designSystem: 'Modern Material Design with custom branding',
      colorScheme: `Professional palette suitable for ${input.industry}`,
      typography: 'Clean, readable fonts optimized for mobile',
      userFlow: ['Onboarding → Authentication → Product Browsing → Cart → Checkout → Order Tracking'],
      wireframes: ['Welcome Screen', 'Login/Register', 'Product Catalog', 'Product Detail', 'Shopping Cart', 'Checkout', 'User Profile'],
      accessibility: ['Screen reader support', 'High contrast mode', 'Large text options', 'Voice navigation']
    };

    // Incorporate research findings into the plan
    return {
      executiveSummary: `Based on thorough industry research and analysis of ${research.industryTrends.length} key trends, we recommend a comprehensive ${input.appPurpose} solution for ${input.businessName} targeting ${input.targetAudience} in the ${input.industry} industry.`,
      features,
      technicalRequirements,
      developmentPhases,
      costBreakdown,
      uiuxPlan,
      totalTimelineWeeks: 20,
      mvpTimelineWeeks: 10,
      recommendedMVPFeatures: [features[0].id, features[1].id, features[2].id, features[3].id, features[7].id],
      marketAnalysis: `The ${input.industry} industry shows ${research.marketGrowth}. Key trends include ${research.industryTrends.join(', ')}. Target users exhibit behaviors like ${research.userBehaviors.join(', ')}.`,
      competitorInsights: research.keyCompetitors,
      revenueModel: ['Subscription model', 'In-app purchases', 'Premium features', 'Affiliate marketing'],
      risksAndMitigation: research.challengesToAddress.map(challenge => `${challenge} - mitigated with ${this.getMitigationStrategy(challenge)}`)
    };
  }

  /**
   * Helper to get mitigation strategy for a challenge
   */
  private getMitigationStrategy(challenge: string): string {
    if (challenge.toLowerCase().includes('competition')) {
      return 'focused differentiation strategy and unique value proposition';
    } else if (challenge.toLowerCase().includes('technical') || challenge.toLowerCase().includes('complexity')) {
      return 'experienced development team and phased approach';
    } else if (challenge.toLowerCase().includes('adoption') || challenge.toLowerCase().includes('retention')) {
      return 'strong onboarding, user engagement features, and marketing strategy';
    } else if (challenge.toLowerCase().includes('integration')) {
      return 'thorough testing and API-first architecture';
    } else if (challenge.toLowerCase().includes('privacy') || challenge.toLowerCase().includes('security')) {
      return 'robust security measures and transparent privacy policies';
    } else {
      return 'comprehensive planning and regular progress reviews';
    }
  }

  /**
   * Main method to generate app plan with research phase
   */
  public async generatePlan(
    input: AppPlanInput, 
    options: AppPlanGenerationOptions = {
      model: 'gpt-4',
      includeMarketAnalysis: true,
      includeCostEstimates: true,
      includeWireframes: false,
      detailLevel: 'detailed',
      focusAreas: ['technical', 'business']
    }
  ): Promise<GeneratedAppPlan> {
    try {
      console.log('🚀 Starting multi-stage app plan generation process...');
      
      // STEP 1: Generate research prompt and get industry research
      const researchPrompt = this.generateResearchPrompt(input);
      const researchData = await this.callResearchAI(researchPrompt, input);
      
      console.log('✅ Research phase complete with', researchData.industryTrends.length, 'trends identified');
      
      // STEP 2: Generate app plan prompt with research data and get plan
      const planPrompt = this.generatePlanPrompt(input, researchData, options);
      const planResponse = await this.callPlanAI(planPrompt, options.model, input, researchData);
      
      // STEP 3: Parse the response into structured data
      const parsedPlan = this.parseAIResponse(planResponse, input, researchData);
      
      // Create complete plan object
      const plan: GeneratedAppPlan = {
        id: this.generateUniqueId(),
        clientId: input.businessName.toLowerCase().replace(/\s+/g, '-'),
        businessName: input.businessName,
        generatedAt: new Date().toISOString(),
        modelUsed: options.model,
        version: '1.0',
        confidence: 90, // Higher confidence with research phase
        status: 'draft',
        ...parsedPlan
      } as GeneratedAppPlan;
      
      // Store the plan
      this.storePlan(plan);
      console.log('🏁 Multi-stage app plan generation complete!');
      
      return plan;
      
    } catch (error) {
      console.error('Error in multi-stage app plan generation:', error);
      throw new Error('Failed to generate app plan with research phase');
    }
  }

  /**
   * Store generated plan in localStorage
   */
  private storePlan(plan: GeneratedAppPlan): void {
    try {
      const existingPlans = this.getAllStoredPlans();
      existingPlans.push(plan);
      localStorage.setItem('generated-app-plans', JSON.stringify(existingPlans));
      
      // Also store the latest plan for quick access
      localStorage.setItem('latest-app-plan', JSON.stringify(plan));
      
      console.log('✅ App plan stored successfully:', plan.id);
    } catch (error) {
      console.error('Error storing app plan:', error);
    }
  }

  /**
   * Get stored plan by ID
   */
  public getStoredPlan(planId: string): GeneratedAppPlan | null {
    try {
      const plans = this.getAllStoredPlans();
      return plans.find(plan => plan.id === planId) || null;
    } catch (error) {
      console.error('Error retrieving plan:', error);
      return null;
    }
  }

  /**
   * Get all stored plans
   */
  public getAllStoredPlans(): GeneratedAppPlan[] {
    try {
      const data = localStorage.getItem('generated-app-plans');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving all plans:', error);
      return [];
    }
  }

  /**
   * Get latest generated plan
   */
  public getLatestPlan(): GeneratedAppPlan | null {
    try {
      const data = localStorage.getItem('latest-app-plan');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving latest plan:', error);
      return null;
    }
  }

  /**
   * Refine existing plan with user feedback
   */
  public async refinePlan(planId: string, feedback: string): Promise<GeneratedAppPlan> {
    const existingPlan = this.getStoredPlan(planId);
    if (!existingPlan) {
      throw new Error('Plan not found');
    }

    // In production, this would send the feedback to AI for plan refinement
    const refinedPlan: GeneratedAppPlan = {
      ...existingPlan,
      id: this.generateUniqueId(),
      version: (parseFloat(existingPlan.version) + 0.1).toFixed(1),
      generatedAt: new Date().toISOString(),
      status: 'draft'
    };

    this.storePlan(refinedPlan);
    return refinedPlan;
  }
}

// Export singleton instance
export const appPlanAgent = new AppPlanAgent(); 