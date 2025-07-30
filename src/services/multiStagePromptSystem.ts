/**
 * Multi-Stage Prompt System for App Development Planning
 * Implements Initial Research -> Refined Research -> App Plan workflow with structured outputs
 */

import { AppPlanInput } from '@/types/appPlan.types';
import { supabase } from '@/integrations/supabase/client';

export interface ResearchPromptInput {
  companyName: string;
  industry: string;
  location: string;
  productsServices: string;
  targetUsers: string;
}

export interface InitialResearchReport {
  id: string;
  companyName: string;
  generatedAt: string;
  industryOverview: {
    marketSize: string;
    keyTrends: string[];
    growthDrivers: string[];
  };
  competitorLandscape: {
    directCompetitors: CompetitorInfo[];
    indirectCompetitors: CompetitorInfo[];
    competitorCount: number;
  };
  marketOpportunities: {
    identifiedGaps: string[];
    targetMarketInsights: string[];
    technologyTrends: string[];
  };
  locationAnalysis: {
    localMarketDynamics: string;
    regionalCompetitors: string[];
    consumerBehaviorInsights: string;
  };
  nextSteps: string[];
  rawMarkdown: string;
}

export interface RefinedResearchReport {
  id: string;
  companyName: string;
  generatedAt: string;
  basedOnInitialResearch: string; // ID of initial research
  detailedCompetitorAnalysis: {
    featureMatrix: DetailedFeatureMatrix;
    pricingAnalysis: PricingAnalysis;
    userExperienceComparison: UXComparison[];
    marketPositioning: MarketPositioning[];
  };
  deepMarketAnalysis: {
    validatedOpportunities: ValidatedOpportunity[];
    riskAssessment: RiskFactor[];
    marketSizingData: MarketSizing;
    customerPersonas: CustomerPersona[];
  };
  strategicRecommendations: {
    differentiationStrategy: string;
    featurePriorities: FeaturePriority[];
    marketEntryStrategy: string;
    competitiveAdvantages: string[];
  };
  technicalConsiderations: {
    requiredIntegrations: string[];
    platformConsiderations: string[];
    scalabilityFactors: string[];
  };
  rawMarkdown: string;
}

export interface DeepSearchReport {
  id: string;
  companyName: string;
  generatedAt: string;
  industryContext: {
    trends: string[];
    consumerPreferences: string[];
    technologicalAdvancements: string[];
    marketGaps: string[];
  };
  competitors: {
    local: CompetitorInfo[];
    national: CompetitorInfo[];
  };
  featureComparison: FeatureComparisonTable;
  locationInsights: {
    localCompetitors: string;
    consumerBehavior: string;
    opportunities: string;
  };
  nextSteps: string[];
  rawMarkdown: string;
}

// New interfaces for refined research
export interface DetailedFeatureMatrix {
  features: string[];
  competitors: { [competitorName: string]: { [feature: string]: string } };
}

export interface PricingAnalysis {
  averagePrice: string;
  pricingModels: string[];
  premiumFeatures: string[];
}

export interface UXComparison {
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  userRatings: string;
}

export interface MarketPositioning {
  competitor: string;
  position: string;
  targetMarket: string;
  keyDifferentiators: string[];
}

export interface ValidatedOpportunity {
  opportunity: string;
  marketEvidence: string;
  potentialImpact: string;
  implementationComplexity: string;
}

export interface RiskFactor {
  risk: string;
  likelihood: string;
  impact: string;
  mitigation: string;
}

export interface MarketSizing {
  totalAddressableMarket: string;
  serviceableAddressableMarket: string;
  serviceableObtainableMarket: string;
}

export interface CustomerPersona {
  name: string;
  demographics: string;
  needs: string[];
  painPoints: string[];
  preferredFeatures: string[];
}

export interface FeaturePriority {
  feature: string;
  priority: 'High' | 'Medium' | 'Low';
  rationale: string;
  competitiveDifferentiator: boolean;
}

export interface CompetitorInfo {
  name: string;
  location?: string;
  appFeatures: string[];
  digitalEngagement: string[];
  hasApp: boolean;
}

export interface FeatureComparisonTable {
  headers: string[];
  competitors: CompetitorFeatureRow[];
}

export interface CompetitorFeatureRow {
  name: string;
  features: { [key: string]: string };
}

export interface AppPlanOutput {
  id: string;
  companyName: string;
  generatedAt: string;
  basedOnRefinedResearch: string; // ID of refined research
  overview: {
    purpose: string;
    industry: string;
    objective: string;
    problemSolved: string;
  };
  targetAudience: {
    users: string;
    needs: string[];
    benefits: string[];
  };
  features: {
    essential: FeatureDetail[];
    additionalAddOns: FeatureDetail[];
    prioritizationNote: string;
  };
  competitiveAnalysis: {
    competitors: string;
    differentiation: string;
  };
  businessBenefits: {
    revenueEngagement: string;
    efficiency: string;
    scalability: string;
  };
  developmentProcess: DevelopmentPhase[];
  timeline: {
    totalDuration: string;
    breakdown: string;
    note: string;
  };
  budget: {
    estimatedCost: string;
    paymentTerms: string;
    flexibilityNote: string;
  };
  technicalStack: {
    hosting: string;
    codeManagement: string;
    database: string;
  };
  nextSteps: string[];
  rawMarkdown: string;
}

export interface FeatureDetail {
  name: string;
  description: string;
}

export interface DevelopmentPhase {
  name: string;
  duration: string;
  description: string;
}

export class MultiStagePromptSystem {
  private generateInitialResearchPrompt(input: ResearchPromptInput): string {
    return `You are an expert market researcher conducting the INITIAL PHASE of research for an app development project. Your goal is to provide a comprehensive overview that will serve as the foundation for deeper research in the next phase.

**OBJECTIVE**: Conduct broad market research to understand the competitive landscape, industry trends, and market opportunities for ${input.companyName} in the ${input.industry} sector.

**Company Information**:
- **Company Name**: ${input.companyName}
- **Industry**: ${input.industry}
- **Location**: ${input.location}
- **Products/Services**: ${input.productsServices}
- **Target Users**: ${input.targetUsers}

**Research Requirements**:

1. **Industry Overview** - Provide market size, key trends, and growth drivers
2. **Competitor Landscape** - Identify 5-8 direct and indirect competitors
3. **Market Opportunities** - Identify gaps and technology trends
4. **Location Analysis** - Local market dynamics and consumer behavior

**Output Format**: Structure as Notion-ready markdown with callout boxes (use > ℹ️ format).

# 🔍 Initial Research Report for ${input.companyName}

**Note**: Copy and paste this report into Notion. For callout boxes (marked with > and an emoji), select the block and type \`/callout\` to convert.

---

## 📊 Industry Overview
> 📈 **Market Context**: Understanding the ${input.industry} landscape  
- **Market Size**: [Current market size and projections]  
- **Key Trends**: [3-4 major industry trends]  
- **Growth Drivers**: [What's driving market growth]  
- **Market Maturity**: [Is this a mature or emerging market?]

---

## 🏪 Competitor Landscape
### Direct Competitors
> 🎯 **Direct Competition**: Companies offering similar products/services  
- **[Competitor 1]**: [Brief description and key differentiators]  
- **[Competitor 2]**: [Brief description and key differentiators]  
- **[Competitor 3]**: [Brief description and key differentiators]

### Indirect Competitors
> 🔄 **Indirect Competition**: Alternative solutions customers might choose  
- **[Alternative 1]**: [How it competes indirectly]  
- **[Alternative 2]**: [How it competes indirectly]

---

## 💡 Market Opportunities
> 🚀 **Identified Gaps**: Potential areas for differentiation  
- **Gap 1**: [Market gap and opportunity]  
- **Gap 2**: [Market gap and opportunity]  
- **Technology Trends**: [Relevant tech trends to leverage]  
- **Target Market Insights**: [Key insights about target users]

---

## 🌍 Location Analysis (${input.location})
> 📍 **Local Market Dynamics**:  
- **Regional Competitors**: [Key local players]  
- **Consumer Behavior**: [Local preferences and habits]  
- **Market Penetration**: [How saturated is the local market?]  
- **Opportunities**: [Location-specific advantages]

---

## 🔚 Next Steps for Deeper Research
- **Detailed Feature Analysis**: Deep dive into competitor app features  
- **User Experience Review**: Analyze competitor UX/UI strategies  
- **Pricing Research**: Understand pricing models and strategies  
- **Customer Feedback Analysis**: Review user reviews and feedback  

---`;
  }

  private generateRefinedResearchPrompt(input: ResearchPromptInput, initialResearch: InitialResearchReport): string {
    return `You are an expert market researcher conducting the REFINED RESEARCH PHASE. Using the initial research findings, conduct a deeper analysis to inform app development strategy.

**CONTEXT FROM INITIAL RESEARCH**:
Based on the initial research for ${initialResearch.companyName}, we identified:
- **Key Competitors**: ${initialResearch.competitorLandscape.directCompetitors.map(c => c.name).join(', ')}
- **Market Opportunities**: ${initialResearch.marketOpportunities.identifiedGaps.join(', ')}
- **Industry Trends**: ${initialResearch.industryOverview.keyTrends.join(', ')}

**REFINED RESEARCH OBJECTIVES**:
1. **Detailed Competitor Analysis** - Feature matrices, pricing, UX comparison
2. **Deep Market Analysis** - Validate opportunities, assess risks, size markets
3. **Strategic Recommendations** - Differentiation strategy and feature priorities
4. **Technical Considerations** - Integration requirements and platform decisions

**Output Format**: Notion-ready markdown with detailed analysis tables and callout boxes.

# 🎯 Refined Research Report for ${input.companyName}

**Note**: Copy and paste this report into Notion. For callout boxes (marked with > and an emoji), select the block and type \`/callout\` to convert.

---

## 🔬 Detailed Competitor Analysis

### Feature Matrix
> 📊 **Comprehensive Feature Comparison**:  

| Feature | ${initialResearch.competitorLandscape.directCompetitors.slice(0, 4).map(c => c.name).join(' | ')} |
|---------|${initialResearch.competitorLandscape.directCompetitors.slice(0, 4).map(() => '-------').join('|')}|
| Mobile App | [Yes/No for each] |
| Online Ordering | [Yes/No for each] |
| Loyalty Program | [Yes/No for each] |
| Payment Integration | [Yes/No for each] |
| User Accounts | [Yes/No for each] |

### Pricing Analysis
> 💰 **Market Pricing Insights**:  
- **Average Price Range**: [Price range analysis]  
- **Pricing Models**: [Subscription, one-time, freemium, etc.]  
- **Premium Features**: [What features command premium pricing]  
- **Value Perception**: [How customers perceive value]

### User Experience Comparison
> 🎨 **UX/UI Analysis**:  
- **[Competitor 1]**: Strengths: [list] | Weaknesses: [list] | User Rating: [rating]  
- **[Competitor 2]**: Strengths: [list] | Weaknesses: [list] | User Rating: [rating]  
- **[Competitor 3]**: Strengths: [list] | Weaknesses: [list] | User Rating: [rating]

---

## 📈 Deep Market Analysis

### Validated Opportunities
> ✅ **Evidence-Based Opportunities**:  
1. **[Opportunity 1]**: Market Evidence: [data] | Impact: [High/Medium/Low] | Complexity: [rating]  
2. **[Opportunity 2]**: Market Evidence: [data] | Impact: [High/Medium/Low] | Complexity: [rating]  
3. **[Opportunity 3]**: Market Evidence: [data] | Impact: [High/Medium/Low] | Complexity: [rating]

### Risk Assessment
> ⚠️ **Market Risks**:  
- **[Risk 1]**: Likelihood: [High/Medium/Low] | Impact: [description] | Mitigation: [strategy]  
- **[Risk 2]**: Likelihood: [High/Medium/Low] | Impact: [description] | Mitigation: [strategy]

### Market Sizing
> 📊 **Market Size Analysis**:  
- **TAM (Total Addressable Market)**: [size and description]  
- **SAM (Serviceable Addressable Market)**: [size and description]  
- **SOM (Serviceable Obtainable Market)**: [realistic capture estimate]

### Customer Personas
> 👥 **Target User Profiles**:  
- **Primary Persona**: [Demographics, needs, pain points, preferred features]  
- **Secondary Persona**: [Demographics, needs, pain points, preferred features]

---

## 🎯 Strategic Recommendations

### Differentiation Strategy
> 🌟 **Competitive Advantage**:  
[Detailed strategy for standing out in the market]

### Feature Priorities
> 🏆 **Development Roadmap**:  
- **High Priority**: [Feature] - Rationale: [why] - Differentiator: [Yes/No]  
- **Medium Priority**: [Feature] - Rationale: [why] - Differentiator: [Yes/No]  
- **Low Priority**: [Feature] - Rationale: [why] - Differentiator: [Yes/No]

### Market Entry Strategy
> 🚀 **Go-to-Market Approach**:  
[Strategy for entering the market and acquiring users]

---

## 🔧 Technical Considerations

### Required Integrations
> 🔌 **System Requirements**:  
- **Payment Processing**: [Requirements and recommendations]  
- **Third-party APIs**: [Necessary integrations]  
- **Analytics**: [Tracking and measurement needs]

### Platform Considerations
> 📱 **Technology Decisions**:  
- **Mobile Strategy**: [Native, hybrid, web app recommendations]  
- **Backend Requirements**: [Database, hosting, scaling needs]  
- **Security Considerations**: [Data protection, compliance needs]

---

## 🔚 Ready for App Plan Development
This refined research provides the strategic foundation for creating a comprehensive app development plan with evidence-based feature recommendations and competitive positioning.

---`;
  }

  private generateAppPlanPrompt(input: AppPlanInput, refinedResearch?: RefinedResearchReport): string {
    const researchContext = refinedResearch ? `
**RESEARCH INSIGHTS FROM REFINED ANALYSIS**:
Based on comprehensive research including:
- **Validated Opportunities**: ${refinedResearch.deepMarketAnalysis.validatedOpportunities.map(o => o.opportunity).join(', ')}
- **Strategic Differentiation**: ${refinedResearch.strategicRecommendations.differentiationStrategy}
- **High Priority Features**: ${refinedResearch.strategicRecommendations.featurePriorities.filter(f => f.priority === 'High').map(f => f.feature).join(', ')}
- **Technical Requirements**: ${refinedResearch.technicalConsiderations.requiredIntegrations.join(', ')}
- **Market Entry Strategy**: ${refinedResearch.strategicRecommendations.marketEntryStrategy}
` : '';

    return `You are an expert app development planner creating a CLIENT-FACING app development plan. This plan will be delivered directly to the client and must be professional, comprehensive, and actionable.

${researchContext}

**IMPORTANT**: This plan is informed by comprehensive market research and competitor analysis, ensuring evidence-based recommendations and strategic positioning.

The development process is accelerated:
- **Discovery & Feature Confirmation**: 2-3 days
- **Design**: 5 days
- **MVP Development**: 7 days (includes wireframes and basic functionality)
- **Review Call**: 1 day
- **Full Development**: 14 days
- **Launch**: 1 day

The technology stack includes:
- **Hosting**: Self-hosted
- **Code Management**: GitHub
- **Database**: Supabase

The budget estimate ranges from $500 to $2,500. Include a callout box emphasizing that the budget is flexible and can be adjusted by modifying the scope or features to meet the client's needs.

**User Input**:
- Company Name: ${input.businessName}
- Industry: ${input.industry}
- App Purpose: ${input.appPurpose}
- Target Users: ${input.targetAudience}
- Budget: ${input.budget || '$500-$2,500'}
- Timeline: ${input.timeline || '30 days'}

**Output Format**:
# 📱 App Development Plan for ${input.businessName}

**Note**: Copy and paste this plan into Notion. For callout boxes (marked with > and an emoji), select the block and type \`/callout\` to convert.

> 🔬 **Research-Backed Plan**: This development plan is based on comprehensive market research and competitor analysis to ensure strategic positioning and evidence-based feature recommendations.

---

## 📱 App Overview
> ℹ️ **Purpose**: ${input.appPurpose}  
- **Company**: ${input.businessName}  
- **Industry**: ${input.industry}  
- **Objective**: [Summarize the app's strategic goal based on research]  
- **Problem Solved**: [Describe the validated market need]  
- **Competitive Advantage**: [Key differentiators identified through research]

---

## 👥 Target Audience
> 🎯 **Research-Validated Users**: ${input.targetAudience}  
- **Primary Users**: [Detailed persona based on research]  
- **User Needs**:  
  - [Research-validated need 1]  
  - [Research-validated need 2]  
  - [Research-validated need 3]  
- **Key Benefits**:  
  - [Evidence-based benefit 1]  
  - [Evidence-based benefit 2]  
  - [Evidence-based benefit 3]

---

## ✨ Key Features
> 🏆 **Evidence-Based Feature Set**: Features prioritized based on competitor analysis and market research

### Essential Features (MVP)
- **[High Priority Feature 1]**: [Description with competitive rationale]  
- **[High Priority Feature 2]**: [Description with competitive rationale]  
- **[High Priority Feature 3]**: [Description with competitive rationale]

### Additional Add-ons (Phase 2)
- **[Medium Priority Feature 1]**: [Description and strategic value]  
- **[Medium Priority Feature 2]**: [Description and strategic value]  
- **[Enhancement Feature]**: [Future enhancement opportunity]

> 🔑 **Feature Prioritization**: Essential features form the MVP foundation based on competitive analysis. Add-ons provide differentiation opportunities and can be implemented in future phases based on user feedback and budget.

---

## 🏆 Competitive Analysis
> 🔍 **Market Position**: Based on comprehensive competitor research  
- **Key Competitors**: [Research-identified competitors]  
- **Our Differentiation**: [Strategic advantages from research]  
- **Market Opportunity**: [Validated market gaps we're addressing]  
- **Competitive Moat**: [How we maintain advantage]

---

## 💼 Benefits to the Business
> 💰 **Strategic Value Delivery**:  
- **Revenue Growth**: [Specific revenue opportunities identified]  
- **Market Position**: [Competitive positioning advantages]  
- **Customer Engagement**: [Engagement enhancement strategies]  
- **Operational Efficiency**: [Process improvement benefits]  
- **Future Scalability**: [Growth and expansion opportunities]

---

## 🚀 Development Process
> 🚀 **Proven Methodology**:  
1. **Discovery & Research Validation** (2-3 days)  
   - Confirm research findings with stakeholders  
   - Finalize feature specifications  
   - Validate technical requirements  

2. **Strategic Design** (5 days)  
   - Create wireframes based on competitive insights  
   - Design user experience flows  
   - Develop visual identity aligned with positioning  

3. **MVP Development** (7 days)  
   - Build core functionality  
   - Implement essential features  
   - Create working prototype  

4. **Stakeholder Review** (1 day)  
   - Present MVP for feedback  
   - Gather input and refinements  
   - Plan final development phase  

5. **Full Development** (14 days)  
   - Complete all planned features  
   - Implement additional functionality  
   - Conduct thorough testing  

6. **Launch & Deployment** (1 day)  
   - Final testing and optimization  
   - Deploy to production  
   - Launch preparation and monitoring

---

## ⏳ Timeline
> ⏰ **Estimated Duration**: ~30 days total  
- **Phase 1**: Discovery & Design (7-8 days)  
- **Phase 2**: Development & Testing (22-23 days)  
- **Note**: Timeline assumes standard complexity; sophisticated features may extend development time

---

## 💰 Budget Estimate
> 💡 **Flexible Investment**: Budget can be adjusted based on feature scope and priorities  
- **Estimated Range**: ${input.budget || '$500-$2,500'}  
- **Payment Structure**: Milestone-based payments aligned with development phases  
- **Scope Flexibility**: Features can be prioritized or deferred to meet budget constraints  
- **Value Optimization**: Research insights ensure maximum ROI from development investment

---

## 🔧 Technical Stack
> ⚙️ **Modern, Scalable Architecture**:  
- **Hosting**: Self-hosted for full control and customization  
- **Code Management**: GitHub for version control and collaboration  
- **Database**: Supabase for real-time data and authentication  
- **Frontend**: React with TypeScript for robust user interfaces  
- **Deployment**: Automated CI/CD for reliable updates

---

## 👉 Next Steps
> 🎯 **Project Initiation**:  
1. **Client Review**: Review this plan and provide feedback  
2. **Kickoff Meeting**: Schedule discovery session to begin project  
3. **Research Validation**: Confirm market insights with your team  
4. **Development Start**: Begin Phase 1 upon agreement  
5. **Ongoing Collaboration**: Regular check-ins throughout development

---

## 📞 Ready to Begin?
This research-backed plan provides a strategic foundation for your app development. The comprehensive market analysis ensures we're building features that matter to your users and differentiate you from competitors.

**Contact us to start your project**: [Contact information]

---`;
  }

  /**
   * Execute the complete three-stage workflow
   */
  async executeThreeStageWorkflow(
    researchInput: ResearchPromptInput, 
    appPlanInput: AppPlanInput,
    onProgress?: (stage: string, progress: number, message: string) => void
  ): Promise<{ 
    initialResearch: InitialResearchReport; 
    refinedResearch: RefinedResearchReport;
    appPlan: AppPlanOutput 
  }> {
    try {
      // Stage 1: Initial Research
      if (onProgress) onProgress('initial-research', 15, 'Conducting initial market research...');
      const initialResearch = await this.executeInitialResearch(researchInput);
      
      // Stage 2: Refined Research
      if (onProgress) onProgress('refined-research', 50, 'Performing detailed analysis and validation...');
      const refinedResearch = await this.executeRefinedResearch(researchInput, initialResearch);
      
      // Stage 3: App Plan Generation
      if (onProgress) onProgress('app-plan', 85, 'Generating comprehensive app development plan...');
      const appPlan = await this.executeAppPlan(appPlanInput, undefined, refinedResearch);
      
      if (onProgress) onProgress('complete', 100, 'Three-stage process complete!');
      
      return {
        initialResearch,
        refinedResearch,
        appPlan
      };
    } catch (error) {
      console.error('Three-stage workflow error:', error);
      throw new Error(`Three-stage workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute initial research phase
   */
  async executeInitialResearch(input: ResearchPromptInput): Promise<InitialResearchReport> {
    const prompt = this.generateInitialResearchPrompt(input);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-app-plan', {
        body: {
          businessData: {
            businessName: input.companyName,
            industry: input.industry,
            targetAudience: input.targetUsers,
            appPurpose: `Initial research for ${input.productsServices}`,
            location: input.location
          },
          options: {
            customPrompt: prompt,
            isInitialResearchPhase: true,
            model: 'gemini-2.0-flash'
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Initial research generation failed');
      }

      // Parse the research response
      const parsedReport = this.parseInitialResearchResponse(data.rawResponse, input);
      
      // Store the research report
      await this.storeInitialResearchReport(parsedReport);
      
      return parsedReport;
    } catch (error) {
      console.error('Initial research execution error:', error);
      throw error;
    }
  }

  /**
   * Execute refined research phase
   */
  async executeRefinedResearch(input: ResearchPromptInput, initialResearch: InitialResearchReport): Promise<RefinedResearchReport> {
    const prompt = this.generateRefinedResearchPrompt(input, initialResearch);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-app-plan', {
        body: {
          businessData: {
            businessName: input.companyName,
            industry: input.industry,
            targetAudience: input.targetUsers,
            appPurpose: `Refined research for ${input.productsServices}`,
            location: input.location
          },
          options: {
            customPrompt: prompt,
            isRefinedResearchPhase: true,
            model: 'gemini-2.0-flash',
            includeInitialResearch: true,
            initialResearchData: initialResearch
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Refined research generation failed');
      }

      // Parse the refined research response
      const parsedReport = this.parseRefinedResearchResponse(data.rawResponse, input, initialResearch);
      
      // Store the refined research report
      await this.storeRefinedResearchReport(parsedReport);
      
      return parsedReport;
    } catch (error) {
      console.error('Refined research execution error:', error);
      throw error;
    }
  }

  /**
   * Execute app plan generation phase - updated to support refined research
   */
  async executeAppPlan(input: AppPlanInput, legacyResearchData?: DeepSearchReport, refinedResearch?: RefinedResearchReport): Promise<AppPlanOutput> {
    const prompt = this.generateAppPlanPrompt(input, refinedResearch);
    
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
          options: {
            customPrompt: prompt,
            isAppPlanPhase: true,
            model: 'gemini-2.0-flash',
            includeRefinedResearch: !!refinedResearch,
            refinedResearchData: refinedResearch
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'App plan generation failed');
      }

      // Parse the app plan response
      const parsedPlan = this.parseAppPlanResponse(data.rawResponse, input, refinedResearch?.id);
      
      // Store the app plan
      await this.storeAppPlan(parsedPlan);
      
      return parsedPlan;
    } catch (error) {
      console.error('App plan execution error:', error);
      throw error;
    }
  }

  /**
   * Parse initial research response into structured data
   */
  private parseInitialResearchResponse(response: string, input: ResearchPromptInput): InitialResearchReport {
    return {
      id: `initial_research_${Date.now()}`,
      companyName: input.companyName,
      generatedAt: new Date().toISOString(),
      industryOverview: {
        marketSize: this.extractSectionText(response, 'Market Size'),
        keyTrends: this.extractListFromSection(response, 'Key Trends'),
        growthDrivers: this.extractListFromSection(response, 'Growth Drivers')
      },
      competitorLandscape: {
        directCompetitors: this.extractCompetitors(response, 'Direct Competitors'),
        indirectCompetitors: this.extractCompetitors(response, 'Indirect Competitors'),
        competitorCount: this.extractCompetitors(response, 'Direct Competitors').length
      },
      marketOpportunities: {
        identifiedGaps: this.extractListFromSection(response, 'Gap'),
        targetMarketInsights: this.extractListFromSection(response, 'Target Market Insights'),
        technologyTrends: this.extractListFromSection(response, 'Technology Trends')
      },
      locationAnalysis: {
        localMarketDynamics: this.extractSectionText(response, 'Local Market Dynamics'),
        regionalCompetitors: this.extractListFromSection(response, 'Regional Competitors'),
        consumerBehaviorInsights: this.extractSectionText(response, 'Consumer Behavior')
      },
      nextSteps: this.extractListFromSection(response, 'Next Steps'),
      rawMarkdown: response
    };
  }

  /**
   * Parse refined research response into structured data
   */
  private parseRefinedResearchResponse(response: string, input: ResearchPromptInput, initialResearch: InitialResearchReport): RefinedResearchReport {
    return {
      id: `refined_research_${Date.now()}`,
      companyName: input.companyName,
      generatedAt: new Date().toISOString(),
      basedOnInitialResearch: initialResearch.id,
      detailedCompetitorAnalysis: {
        featureMatrix: this.extractFeatureMatrix(response),
        pricingAnalysis: this.extractPricingAnalysis(response),
        userExperienceComparison: this.extractUXComparison(response),
        marketPositioning: this.extractMarketPositioning(response)
      },
      deepMarketAnalysis: {
        validatedOpportunities: this.extractValidatedOpportunities(response),
        riskAssessment: this.extractRiskFactors(response),
        marketSizingData: this.extractMarketSizing(response),
        customerPersonas: this.extractCustomerPersonas(response)
      },
      strategicRecommendations: {
        differentiationStrategy: this.extractSectionText(response, 'Differentiation Strategy'),
        featurePriorities: this.extractFeaturePriorities(response),
        marketEntryStrategy: this.extractSectionText(response, 'Market Entry Strategy'),
        competitiveAdvantages: this.extractListFromSection(response, 'Competitive Advantage')
      },
      technicalConsiderations: {
        requiredIntegrations: this.extractListFromSection(response, 'Required Integrations'),
        platformConsiderations: this.extractListFromSection(response, 'Platform Considerations'),
        scalabilityFactors: this.extractListFromSection(response, 'Scalability')
      },
      rawMarkdown: response
    };
  }

  /**
   * Parse app plan response into structured data - updated to include refined research ID
   */
  private parseAppPlanResponse(response: string, input: AppPlanInput, refinedResearchId?: string): AppPlanOutput {
    return {
      id: `plan_${Date.now()}`,
      companyName: input.businessName,
      generatedAt: new Date().toISOString(),
      basedOnRefinedResearch: refinedResearchId || '',
      overview: {
        purpose: this.extractSectionText(response, 'Purpose'),
        industry: input.industry,
        objective: this.extractSectionText(response, 'Objective'),
        problemSolved: this.extractSectionText(response, 'Problem Solved')
      },
      targetAudience: {
        users: this.extractSectionText(response, 'Users'),
        needs: this.extractListFromSection(response, 'Needs'),
        benefits: this.extractListFromSection(response, 'Benefits')
      },
      features: {
        essential: this.extractFeatures(response, 'Essential Features'),
        additionalAddOns: this.extractFeatures(response, 'Additional Add-ons'),
        prioritizationNote: this.extractSectionText(response, 'Feature Prioritization')
      },
      competitiveAnalysis: {
        competitors: this.extractSectionText(response, 'Competitors'),
        differentiation: this.extractSectionText(response, 'Differentiation')
      },
      businessBenefits: {
        revenueEngagement: this.extractSectionText(response, 'Revenue/Engagement'),
        efficiency: this.extractSectionText(response, 'Efficiency'),
        scalability: this.extractSectionText(response, 'Scalability')
      },
      developmentProcess: this.extractDevelopmentPhases(response),
      timeline: {
        totalDuration: this.extractSectionText(response, 'Estimated Duration'),
        breakdown: this.extractSectionText(response, 'Total'),
        note: this.extractSectionText(response, 'Note')
      },
      budget: {
        estimatedCost: this.extractSectionText(response, 'Estimated Cost'),
        paymentTerms: this.extractSectionText(response, 'Payment Terms'),
        flexibilityNote: this.extractSectionText(response, 'Flexible Pricing')
      },
      technicalStack: {
        hosting: this.extractSectionText(response, 'Hosting'),
        codeManagement: this.extractSectionText(response, 'Code Management'),
        database: this.extractSectionText(response, 'Database')
      },
      nextSteps: this.extractListFromSection(response, 'Next Steps'),
      rawMarkdown: response
    };
  }

  // Helper methods for parsing
  private extractSectionText(text: string, sectionName: string): string {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*:?\\s*([^\\n]*(?:\\n(?!\\*\\*)[^\\n]*)*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractListFromSection(text: string, sectionName: string): string[] {
    const sectionText = this.extractSectionText(text, sectionName);
    return sectionText.split(/[-*]/).map(item => item.trim()).filter(item => item.length > 0);
  }

  private extractCompetitors(text: string, sectionName: string): CompetitorInfo[] {
    // Simple extraction - can be enhanced with more sophisticated parsing
    const competitors: CompetitorInfo[] = [];
    const sectionRegex = new RegExp(`### ${sectionName}([\\s\\S]*?)(?=###|---|\n\n## |$)`, 'i');
    const sectionMatch = text.match(sectionRegex);
    
    if (sectionMatch) {
      const lines = sectionMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
      lines.forEach(line => {
        const nameMatch = line.match(/\*\*(.*?)\*\*/);
        if (nameMatch) {
          competitors.push({
            name: nameMatch[1],
            appFeatures: [],
            digitalEngagement: [],
            hasApp: line.toLowerCase().includes('app')
          });
        }
      });
    }
    
    return competitors;
  }

  private extractFeatureTable(text: string): FeatureComparisonTable {
    // Extract table data - simplified version
    return {
      headers: ['Competitor', 'Online Ordering', 'Loyalty Program', 'Nutritional Info', 'Push Notifications', 'Other Features'],
      competitors: [] // Would need more sophisticated table parsing
    };
  }

  private extractFeatures(text: string, sectionName: string): FeatureDetail[] {
    const features: FeatureDetail[] = [];
    const regex = new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\*\\*|Additional Add-ons|$)`, 'i');
    const match = text.match(regex);
    
    if (match) {
      const lines = match[1].split('\n').filter(line => line.trim().startsWith('-'));
      lines.forEach(line => {
        const featureMatch = line.match(/\*\*(.*?)\*\*:?\s*(.*)/);
        if (featureMatch) {
          features.push({
            name: featureMatch[1],
            description: featureMatch[2] || ''
          });
        }
      });
    }
    
    return features;
  }

  private extractDevelopmentPhases(text: string): DevelopmentPhase[] {
    const phases: DevelopmentPhase[] = [];
    const regex = /\d+\.\s*\*\*(.*?)\*\*\s*\((.*?)\)\s*\n\s*-\s*(.*)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      phases.push({
        name: match[1],
        duration: match[2],
        description: match[3]
      });
    }
    
    return phases;
  }

  // Helper methods for parsing new data structures
  private extractFeatureMatrix(text: string): DetailedFeatureMatrix {
    return {
      features: ['Mobile App', 'Online Ordering', 'Loyalty Program', 'Payment Integration'],
      competitors: {} // Simplified - would need table parsing
    };
  }

  private extractPricingAnalysis(text: string): PricingAnalysis {
    return {
      averagePrice: this.extractSectionText(text, 'Average Price'),
      pricingModels: this.extractListFromSection(text, 'Pricing Models'),
      premiumFeatures: this.extractListFromSection(text, 'Premium Features')
    };
  }

  private extractUXComparison(text: string): UXComparison[] {
    return []; // Simplified - would need more complex parsing
  }

  private extractMarketPositioning(text: string): MarketPositioning[] {
    return []; // Simplified - would need more complex parsing
  }

  private extractValidatedOpportunities(text: string): ValidatedOpportunity[] {
    return []; // Simplified - would need more complex parsing
  }

  private extractRiskFactors(text: string): RiskFactor[] {
    return []; // Simplified - would need more complex parsing
  }

  private extractMarketSizing(text: string): MarketSizing {
    return {
      totalAddressableMarket: this.extractSectionText(text, 'TAM'),
      serviceableAddressableMarket: this.extractSectionText(text, 'SAM'),
      serviceableObtainableMarket: this.extractSectionText(text, 'SOM')
    };
  }

  private extractCustomerPersonas(text: string): CustomerPersona[] {
    return []; // Simplified - would need more complex parsing
  }

  private extractFeaturePriorities(text: string): FeaturePriority[] {
    return []; // Simplified - would need more complex parsing
  }

  private async storeResearchReport(report: DeepSearchReport): Promise<void> {
    // Store research report locally and potentially in database
    localStorage.setItem(`research_${report.id}`, JSON.stringify(report));
  }

  private async storeInitialResearchReport(report: InitialResearchReport): Promise<void> {
    localStorage.setItem(`initial_research_${report.id}`, JSON.stringify(report));
  }

  private async storeRefinedResearchReport(report: RefinedResearchReport): Promise<void> {
    localStorage.setItem(`refined_research_${report.id}`, JSON.stringify(report));
  }

  private async storeAppPlan(plan: AppPlanOutput): Promise<void> {
    // Store app plan locally and potentially in database
    localStorage.setItem(`plan_${plan.id}`, JSON.stringify(plan));
  }
}

export const multiStagePromptSystem = new MultiStagePromptSystem(); 