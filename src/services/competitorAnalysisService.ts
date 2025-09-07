import { supabase } from '@/integrations/supabase/client';
import { type PDRData } from '@/types/pdr';

interface CompetitorProfile {
  id: string;
  name: string;
  website?: string;
  description: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  fundingStage: string;
  foundedYear?: number;
  location: string;
  keyFeatures: string[];
  pricingModel: any;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  recentNews: any[];
  socialMedia: any;
  techStack: string[];
  competitiveScore: number;
  lastUpdated: string;
}

interface CompetitorAnalysisResult {
  directCompetitors: CompetitorProfile[];
  indirectCompetitors: CompetitorProfile[];
  marketGaps: string[];
  competitiveAdvantages: string[];
  threats: string[];
  opportunities: string[];
  positioningRecommendations: string[];
  pricingIntelligence: any;
  featureMatrix: any;
  marketPositioning: any;
  confidenceScore: number;
  analysisDate: string;
}

/**
 * Automated Competitor Analysis Service
 * Leverages multiple data sources to build comprehensive competitive intelligence
 */
export class CompetitorAnalysisService {
  private readonly DATA_SOURCES = {
    web_scraping: true,
    social_media: true,
    news_monitoring: true,
    patent_analysis: false, // Would require specialized APIs
    financial_data: false,  // Would require premium data sources
    app_store_analysis: true,
    tech_stack_analysis: true
  };

  /**
   * Execute comprehensive competitor analysis triggered by onboarding data
   */
  async analyzeCompetitors(pdrData: PDRData): Promise<CompetitorAnalysisResult> {
    try {
      console.log('🔍 Starting automated competitor analysis...');
      
      // Extract analysis parameters from PDR data
      const analysisParams = this.extractAnalysisParameters(pdrData);
      
      // Discover competitors using multiple methods
      const competitors = await this.discoverCompetitors(analysisParams);
      
      // Analyze each competitor in detail
      const competitorProfiles = await this.analyzeCompetitorProfiles(competitors);
      
      // Categorize competitors
      const categorized = this.categorizeCompetitors(competitorProfiles, analysisParams);
      
      // Perform competitive intelligence analysis
      const analysis = await this.performCompetitiveIntelligence(categorized, pdrData);
      
      // Save analysis results
      await this.saveAnalysisResults(analysis, pdrData);
      
      return analysis;
    } catch (error) {
      console.error('Competitor analysis failed:', error);
      throw new Error(`Competitor analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract analysis parameters from PDR data
   */
  private extractAnalysisParameters(pdrData: PDRData): any {
    const { companyIntelligence, businessAnalysis, marketIntelligence } = pdrData;
    
    return {
      industry: companyIntelligence?.industryCategory,
      businessModel: businessAnalysis?.revenueModel,
      targetMarket: marketIntelligence?.targetCustomers,
      geographicFocus: marketIntelligence?.geographicMarkets,
      companySize: companyIntelligence?.companySize,
      appConcept: businessAnalysis?.businessDescription,
      keyFeatures: businessAnalysis?.coreFeatures || [],
      searchKeywords: this.generateSearchKeywords(pdrData)
    };
  }

  /**
   * Generate search keywords for competitor discovery
   */
  private generateSearchKeywords(pdrData: PDRData): string[] {
    const { companyIntelligence, businessAnalysis } = pdrData;
    
    const baseKeywords = [
      companyIntelligence?.industryCategory,
      businessAnalysis?.businessDescription,
      ...businessAnalysis?.coreFeatures || []
    ].filter(Boolean);

    // Expand with related terms
    const expandedKeywords = baseKeywords.flatMap(keyword => [
      keyword,
      `${keyword} app`,
      `${keyword} software`,
      `${keyword} platform`,
      `${keyword} solution`,
      `${keyword} service`
    ]);

    return [...new Set(expandedKeywords)].slice(0, 20); // Dedupe and limit
  }

  /**
   * Discover competitors using multiple discovery methods
   */
  private async discoverCompetitors(params: any): Promise<string[]> {
    const discoveryMethods = [
      this.searchEngineDiscovery(params),
      this.appStoreDiscovery(params),
      this.socialMediaDiscovery(params),
      this.industryDirectoryDiscovery(params),
      this.patentDiscovery(params) // If available
    ];

    const results = await Promise.allSettled(discoveryMethods);
    
    const allCompetitors = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value as string[]);

    // Deduplicate and rank by frequency
    const competitorCounts = allCompetitors.reduce((acc, competitor) => {
      acc[competitor] = (acc[competitor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(competitorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50) // Limit to top 50
      .map(([competitor]) => competitor);
  }

  /**
   * Search engine-based competitor discovery
   */
  private async searchEngineDiscovery(params: any): Promise<string[]> {
    // Simulate search engine API calls
    await this.simulateAPICall(1500, 3000);
    
    // Mock search results based on industry
    const mockResults = this.getMockCompetitorsByIndustry(params.industry);
    
    return mockResults.slice(0, 15);
  }

  /**
   * App store competitor discovery
   */
  private async appStoreDiscovery(params: any): Promise<string[]> {
    await this.simulateAPICall(2000, 4000);
    
    // Mock app store search results
    return [
      'TechSolution Pro',
      'IndustryApp Connect',
      'BusinessFlow Master',
      'Enterprise Helper',
      'SmartBusiness Tools'
    ];
  }

  /**
   * Social media competitor discovery
   */
  private async socialMediaDiscovery(params: any): Promise<string[]> {
    await this.simulateAPICall(1800, 3500);
    
    // Mock social media mentions and hashtag analysis
    return [
      'SocialBiz Platform',
      'TrendingApp Suite',
      'ViralBusiness Tool',
      'ConnectPro Solutions'
    ];
  }

  /**
   * Industry directory discovery
   */
  private async industryDirectoryDiscovery(params: any): Promise<string[]> {
    await this.simulateAPICall(2500, 4500);
    
    return [
      'Directory Leader Corp',
      'Industry Standard Solutions',
      'Professional Services Hub',
      'B2B Excellence Platform'
    ];
  }

  /**
   * Patent-based discovery (if available)
   */
  private async patentDiscovery(params: any): Promise<string[]> {
    // Would integrate with patent databases
    return [];
  }

  /**
   * Analyze competitor profiles in detail
   */
  private async analyzeCompetitorProfiles(competitors: string[]): Promise<CompetitorProfile[]> {
    const analysisPromises = competitors.slice(0, 25).map(async (competitor, index) => {
      await this.simulateAPICall(1000, 2500);
      
      return this.buildCompetitorProfile(competitor, index);
    });

    return Promise.all(analysisPromises);
  }

  /**
   * Build detailed competitor profile
   */
  private buildCompetitorProfile(competitorName: string, index: number): CompetitorProfile {
    // Mock comprehensive competitor analysis
    const mockProfile: CompetitorProfile = {
      id: `comp_${competitorName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name: competitorName,
      website: `https://${competitorName.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `${competitorName} provides innovative solutions in their market segment with focus on customer experience and technical excellence.`,
      industry: this.inferIndustry(competitorName),
      size: this.inferCompanySize(index),
      fundingStage: this.inferFundingStage(index),
      foundedYear: 2020 - Math.floor(Math.random() * 10),
      location: this.getRandomLocation(),
      keyFeatures: this.generateKeyFeatures(competitorName),
      pricingModel: this.inferPricingModel(index),
      strengths: this.generateStrengths(competitorName),
      weaknesses: this.generateWeaknesses(competitorName),
      marketShare: Math.random() * 15 + 1, // 1-16%
      recentNews: this.generateRecentNews(competitorName),
      socialMedia: this.generateSocialMediaData(competitorName),
      techStack: this.generateTechStack(index),
      competitiveScore: Math.random() * 0.4 + 0.6, // 60-100%
      lastUpdated: new Date().toISOString()
    };

    return mockProfile;
  }

  /**
   * Categorize competitors into direct/indirect
   */
  private categorizeCompetitors(
    competitors: CompetitorProfile[], 
    params: any
  ): { direct: CompetitorProfile[], indirect: CompetitorProfile[] } {
    const direct = competitors.filter(comp => 
      comp.industry === params.industry && 
      comp.competitiveScore > 0.7
    ).slice(0, 10);

    const indirect = competitors.filter(comp => 
      !direct.includes(comp) && 
      comp.competitiveScore > 0.6
    ).slice(0, 15);

    return { direct, indirect };
  }

  /**
   * Perform comprehensive competitive intelligence analysis
   */
  private async performCompetitiveIntelligence(
    categorized: { direct: CompetitorProfile[], indirect: CompetitorProfile[] },
    pdrData: PDRData
  ): Promise<CompetitorAnalysisResult> {
    const { direct, indirect } = categorized;
    
    return {
      directCompetitors: direct,
      indirectCompetitors: indirect,
      marketGaps: this.identifyMarketGaps(direct, pdrData),
      competitiveAdvantages: this.identifyCompetitiveAdvantages(direct, pdrData),
      threats: this.identifyThreats(direct, pdrData),
      opportunities: this.identifyOpportunities(direct, indirect, pdrData),
      positioningRecommendations: this.generatePositioningRecommendations(direct, pdrData),
      pricingIntelligence: this.analyzePricingLandscape(direct),
      featureMatrix: this.buildFeatureMatrix(direct, pdrData),
      marketPositioning: this.analyzeMarketPositioning(direct, pdrData),
      confidenceScore: this.calculateAnalysisConfidence(direct, indirect),
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * Identify market gaps and opportunities
   */
  private identifyMarketGaps(competitors: CompetitorProfile[], pdrData: PDRData): string[] {
    return [
      'Underserved SMB segment with specific pain points',
      'Mobile-first solutions lacking in current offerings',
      'AI/ML integration opportunities not fully exploited',
      'Real-time analytics and reporting gaps',
      'Integration ecosystem incomplete among competitors'
    ];
  }

  /**
   * Identify competitive advantages
   */
  private identifyCompetitiveAdvantages(competitors: CompetitorProfile[], pdrData: PDRData): string[] {
    return [
      'Superior user experience design approach',
      'More comprehensive feature integration',
      'Stronger customer support and onboarding',
      'Better pricing flexibility for different segments',
      'Advanced technology stack and performance'
    ];
  }

  /**
   * Identify competitive threats
   */
  private identifyThreats(competitors: CompetitorProfile[], pdrData: PDRData): string[] {
    return [
      'Well-funded competitors with strong market presence',
      'Rapid feature development and innovation cycles',
      'Aggressive pricing strategies from market leaders',
      'Strong brand recognition and customer loyalty',
      'Extensive partner and integration ecosystems'
    ];
  }

  /**
   * Identify market opportunities
   */
  private identifyOpportunities(
    direct: CompetitorProfile[], 
    indirect: CompetitorProfile[], 
    pdrData: PDRData
  ): string[] {
    return [
      'Geographic expansion to underserved markets',
      'Vertical specialization opportunities',
      'Partnership opportunities with complementary services',
      'Technology differentiator through modern architecture',
      'Customer experience improvements over existing solutions'
    ];
  }

  /**
   * Generate positioning recommendations
   */
  private generatePositioningRecommendations(competitors: CompetitorProfile[], pdrData: PDRData): string[] {
    return [
      'Position as the customer-centric alternative to enterprise-focused solutions',
      'Emphasize modern, intuitive design versus legacy interfaces',
      'Highlight superior integration capabilities and API ecosystem',
      'Focus on value-based pricing with transparent cost structure',
      'Leverage AI-first approach as key differentiator'
    ];
  }

  /**
   * Analyze pricing landscape
   */
  private analyzePricingLandscape(competitors: CompetitorProfile[]): any {
    return {
      averagePricing: {
        starter: '£25-50/month',
        professional: '£75-150/month',
        enterprise: '£200-500/month'
      },
      pricingStrategies: {
        freemium: competitors.filter(c => c.pricingModel.type === 'freemium').length,
        subscription: competitors.filter(c => c.pricingModel.type === 'subscription').length,
        usage_based: competitors.filter(c => c.pricingModel.type === 'usage_based').length
      },
      recommendedStrategy: 'Value-based subscription with freemium entry point'
    };
  }

  /**
   * Build feature comparison matrix
   */
  private buildFeatureMatrix(competitors: CompetitorProfile[], pdrData: PDRData): any {
    const allFeatures = [
      ...new Set(competitors.flatMap(c => c.keyFeatures))
    ].slice(0, 20);

    const matrix = allFeatures.map(feature => ({
      feature,
      competitors: competitors.map(comp => ({
        name: comp.name,
        hasFeature: comp.keyFeatures.includes(feature),
        quality: Math.random() * 0.4 + 0.6 // Mock quality score
      })),
      marketCoverage: (competitors.filter(c => c.keyFeatures.includes(feature)).length / competitors.length) * 100
    }));

    return {
      features: matrix,
      ourAdvantages: allFeatures.filter(() => Math.random() > 0.7), // Mock advantages
      marketGaps: allFeatures.filter(() => Math.random() > 0.8) // Mock gaps
    };
  }

  /**
   * Analyze market positioning
   */
  private analyzeMarketPositioning(competitors: CompetitorProfile[], pdrData: PDRData): any {
    return {
      positioningMap: {
        axes: {
          x: 'Price (Low → High)',
          y: 'Features (Basic → Advanced)'
        },
        competitors: competitors.map(comp => ({
          name: comp.name,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: comp.marketShare || 5
        }))
      },
      recommendedPosition: {
        x: 35, // Mid-market pricing
        y: 75, // High features
        rationale: 'Premium features at competitive pricing'
      }
    };
  }

  /**
   * Calculate overall analysis confidence
   */
  private calculateAnalysisConfidence(
    direct: CompetitorProfile[], 
    indirect: CompetitorProfile[]
  ): number {
    const totalCompetitors = direct.length + indirect.length;
    const dataQuality = (direct.length * 0.8 + indirect.length * 0.6) / totalCompetitors;
    const coverage = Math.min(totalCompetitors / 20, 1); // Optimal at 20+ competitors
    
    return (dataQuality * 0.7 + coverage * 0.3) * 0.9; // 90% max due to mock data
  }

  /**
   * Save analysis results to database
   */
  private async saveAnalysisResults(analysis: CompetitorAnalysisResult, pdrData: PDRData): Promise<void> {
    try {
      const { error } = await supabase.from('competitor_analyses').insert({
        client_id: pdrData.companyIntelligence?.companyName?.toLowerCase().replace(/\s+/g, '_'),
        analysis_data: analysis,
        confidence_score: analysis.confidenceScore,
        created_at: analysis.analysisDate
      });

      if (error) {
        console.error('Failed to save competitor analysis:', error);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  // Helper methods for mock data generation
  
  private async simulateAPICall(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private getMockCompetitorsByIndustry(industry: string): string[] {
    const industryCompetitors: Record<string, string[]> = {
      'technology': ['TechCorp Solutions', 'InnovateNow Platform', 'DigitalForce App', 'CloudMaster Pro'],
      'fintech': ['FinanceFlow', 'MoneyMaster App', 'InvestSmart Platform', 'BankingPro Solutions'],
      'healthcare': ['HealthTech Connect', 'MedAssist Pro', 'CareFlow Platform', 'HealthData Solutions'],
      'ecommerce': ['ShopFlow Pro', 'RetailMaster', 'EcommerceHub', 'SalesBooster Platform'],
      'education': ['EduTech Pro', 'LearningSuite', 'SkillBuilder App', 'KnowledgeHub Platform']
    };

    return industryCompetitors[industry] || [
      'IndustryLeader Pro',
      'MarketMaster Solutions',
      'BusinessFlow App',
      'ProfessionalSuite Platform'
    ];
  }

  private inferIndustry(name: string): string {
    if (name.toLowerCase().includes('tech')) return 'technology';
    if (name.toLowerCase().includes('finance') || name.toLowerCase().includes('money')) return 'fintech';
    if (name.toLowerCase().includes('health') || name.toLowerCase().includes('med')) return 'healthcare';
    if (name.toLowerCase().includes('shop') || name.toLowerCase().includes('retail')) return 'ecommerce';
    if (name.toLowerCase().includes('edu') || name.toLowerCase().includes('learn')) return 'education';
    return 'technology'; // Default
  }

  private inferCompanySize(index: number): CompetitorProfile['size'] {
    const sizes: CompetitorProfile['size'][] = ['startup', 'small', 'medium', 'large', 'enterprise'];
    return sizes[index % sizes.length];
  }

  private inferFundingStage(index: number): string {
    const stages = ['Bootstrapped', 'Seed', 'Series A', 'Series B', 'Growth Stage'];
    return stages[index % stages.length];
  }

  private getRandomLocation(): string {
    const locations = ['London, UK', 'San Francisco, US', 'Berlin, Germany', 'Amsterdam, Netherlands', 'Dublin, Ireland'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private generateKeyFeatures(name: string): string[] {
    const commonFeatures = [
      'Dashboard Analytics', 'Real-time Reporting', 'User Management', 'API Integration',
      'Mobile App', 'Cloud Storage', 'Security Features', 'Custom Workflows',
      'Team Collaboration', 'Data Export', 'Third-party Integrations', 'Automated Notifications'
    ];
    
    return commonFeatures.slice(0, 4 + Math.floor(Math.random() * 4));
  }

  private inferPricingModel(index: number): any {
    const models = [
      { type: 'freemium', startingPrice: 0 },
      { type: 'subscription', startingPrice: 25 },
      { type: 'usage_based', startingPrice: 50 },
      { type: 'enterprise', startingPrice: 200 }
    ];
    
    return models[index % models.length];
  }

  private generateStrengths(name: string): string[] {
    const strengths = [
      'Strong brand recognition', 'Comprehensive feature set', 'Excellent customer support',
      'Scalable architecture', 'Strong integration ecosystem', 'User-friendly interface',
      'Competitive pricing', 'Regular feature updates', 'Strong security'
    ];
    
    return strengths.slice(0, 3 + Math.floor(Math.random() * 3));
  }

  private generateWeaknesses(name: string): string[] {
    const weaknesses = [
      'Limited customization options', 'Steep learning curve', 'Expensive for small teams',
      'Limited mobile functionality', 'Slow customer support response', 'Outdated interface',
      'Limited integrations', 'Performance issues at scale', 'Complex pricing structure'
    ];
    
    return weaknesses.slice(0, 2 + Math.floor(Math.random() * 2));
  }

  private generateRecentNews(name: string): any[] {
    return [
      {
        title: `${name} raises Series A funding`,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'TechCrunch'
      },
      {
        title: `${name} launches new enterprise features`,
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Industry News'
      }
    ];
  }

  private generateSocialMediaData(name: string): any {
    return {
      twitter: {
        handle: `@${name.replace(/\s+/g, '').toLowerCase()}`,
        followers: Math.floor(Math.random() * 50000) + 1000
      },
      linkedin: {
        followers: Math.floor(Math.random() * 25000) + 500
      }
    };
  }

  private generateTechStack(index: number): string[] {
    const techStacks = [
      ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      ['Vue.js', 'Python', 'MongoDB', 'Azure'],
      ['Angular', 'Java', 'MySQL', 'Google Cloud'],
      ['React Native', 'Ruby', 'Redis', 'Heroku']
    ];
    
    return techStacks[index % techStacks.length];
  }
}

// Export singleton instance
export const competitorAnalysisService = new CompetitorAnalysisService();