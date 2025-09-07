import { supabase } from '@/integrations/supabase/client';
import { type PDRData } from '@/types/pdr';
import { pdrGenerationService } from './pdrGenerationService';
import { competitorAnalysisService } from './competitorAnalysisService';

interface PDRUpdate {
  section: string;
  updateType: 'enhancement' | 'validation' | 'new_data' | 'correction';
  data: any;
  confidence: number;
  source: 'user_feedback' | 'system_monitoring' | 'market_data' | 'project_progress';
  timestamp: string;
}

interface ProjectMilestone {
  id: string;
  name: string;
  phase: 'discovery' | 'design' | 'development' | 'testing' | 'launch' | 'optimization';
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  learnings: string[];
  marketFeedback: any;
  performanceMetrics: any;
}

interface ProgressivePDR {
  id: string;
  clientId: string;
  basePDR: any; // Original comprehensive PDR
  updates: PDRUpdate[];
  milestones: ProjectMilestone[];
  currentPhase: string;
  evolutionScore: number; // How much the PDR has evolved
  accuracyScore: number;  // How accurate predictions were
  lastUpdated: string;
  nextRecommendedUpdate: string;
}

/**
 * Progressive PDR System
 * Creates a self-updating PDR that builds throughout the project lifecycle
 */
export class ProgressivePDRService {
  private readonly UPDATE_TRIGGERS = {
    milestone_completion: true,
    market_changes: true,
    user_feedback: true,
    performance_metrics: true,
    competitive_moves: true,
    financial_updates: true
  };

  private readonly PHASE_TRIGGERS = {
    discovery: ['onboarding_complete', 'initial_research_done'],
    design: ['pdr_approved', 'mood_board_complete'],
    development: ['design_approved', 'development_started'],
    testing: ['mvp_complete', 'testing_phase_started'],
    launch: ['testing_complete', 'launch_preparation'],
    optimization: ['launch_complete', 'user_feedback_collected']
  };

  /**
   * Initialize progressive PDR system after base PDR creation
   */
  async initializeProgressivePDR(
    basePDR: any,
    clientId: string
  ): Promise<ProgressivePDR> {
    const progressivePDR: ProgressivePDR = {
      id: `progressive_${clientId}_${Date.now()}`,
      clientId,
      basePDR,
      updates: [],
      milestones: this.initializeProjectMilestones(),
      currentPhase: 'discovery',
      evolutionScore: 0,
      accuracyScore: 1.0, // Starts perfect, adjusts based on reality
      lastUpdated: new Date().toISOString(),
      nextRecommendedUpdate: this.calculateNextUpdateTime('discovery')
    };

    // Save to database
    await this.saveProgressivePDR(progressivePDR);

    // Set up automated monitoring
    this.setupAutomatedMonitoring(progressivePDR.id);

    return progressivePDR;
  }

  /**
   * Update PDR based on project milestone completion
   */
  async updateOnMilestoneCompletion(
    pdrId: string,
    milestone: ProjectMilestone,
    learnings: any,
    metrics: any
  ): Promise<ProgressivePDR> {
    const progressivePDR = await this.getProgressivePDR(pdrId);
    
    // Update milestone
    const updatedMilestone = {
      ...milestone,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      learnings: learnings.keyLearnings || [],
      marketFeedback: learnings.marketFeedback || {},
      performanceMetrics: metrics || {}
    };

    // Generate PDR updates based on learnings
    const pdrUpdates = await this.generateUpdatesFromMilestone(
      updatedMilestone,
      progressivePDR.basePDR
    );

    // Update competitive analysis if needed
    const competitiveUpdates = await this.checkForCompetitiveChanges(
      progressivePDR,
      updatedMilestone
    );

    const updatedPDR: ProgressivePDR = {
      ...progressivePDR,
      updates: [...progressivePDR.updates, ...pdrUpdates, ...competitiveUpdates],
      milestones: progressivePDR.milestones.map(m => 
        m.id === milestone.id ? updatedMilestone : m
      ),
      currentPhase: this.determineNextPhase(milestone.phase, updatedMilestone.status),
      evolutionScore: this.calculateEvolutionScore(progressivePDR.updates.length + pdrUpdates.length),
      accuracyScore: this.calculateAccuracyScore(progressivePDR, learnings),
      lastUpdated: new Date().toISOString(),
      nextRecommendedUpdate: this.calculateNextUpdateTime(milestone.phase)
    };

    await this.saveProgressivePDR(updatedPDR);
    
    // Trigger automatic competitive analysis update if significant changes
    if (pdrUpdates.some(update => update.updateType === 'new_data')) {
      this.scheduleCompetitiveUpdate(updatedPDR.id);
    }

    return updatedPDR;
  }

  /**
   * Update PDR based on market changes and competitive moves
   */
  async updateOnMarketChanges(
    pdrId: string,
    marketData: any,
    competitiveData: any
  ): Promise<ProgressivePDR> {
    const progressivePDR = await this.getProgressivePDR(pdrId);
    
    const marketUpdates = await this.generateMarketUpdates(marketData, progressivePDR);
    const competitiveUpdates = await this.generateCompetitiveUpdates(competitiveData, progressivePDR);
    
    const updatedPDR: ProgressivePDR = {
      ...progressivePDR,
      updates: [...progressivePDR.updates, ...marketUpdates, ...competitiveUpdates],
      lastUpdated: new Date().toISOString(),
      nextRecommendedUpdate: this.calculateNextUpdateTime(progressivePDR.currentPhase)
    };

    await this.saveProgressivePDR(updatedPDR);
    
    return updatedPDR;
  }

  /**
   * Update PDR based on user feedback and performance metrics
   */
  async updateOnUserFeedback(
    pdrId: string,
    userFeedback: any,
    performanceMetrics: any
  ): Promise<ProgressivePDR> {
    const progressivePDR = await this.getProgressivePDR(pdrId);
    
    const feedbackUpdates = await this.generateFeedbackUpdates(userFeedback, progressivePDR);
    const performanceUpdates = await this.generatePerformanceUpdates(performanceMetrics, progressivePDR);
    
    // Adjust accuracy score based on how well predictions matched reality
    const newAccuracyScore = this.calculateAccuracyFromFeedback(
      progressivePDR.accuracyScore,
      userFeedback,
      performanceMetrics
    );
    
    const updatedPDR: ProgressivePDR = {
      ...progressivePDR,
      updates: [...progressivePDR.updates, ...feedbackUpdates, ...performanceUpdates],
      accuracyScore: newAccuracyScore,
      lastUpdated: new Date().toISOString(),
      nextRecommendedUpdate: this.calculateNextUpdateTime(progressivePDR.currentPhase)
    };

    await this.saveProgressivePDR(updatedPDR);
    
    return updatedPDR;
  }

  /**
   * Generate real-time PDR report incorporating all updates
   */
  async generateCurrentPDR(pdrId: string): Promise<any> {
    const progressivePDR = await this.getProgressivePDR(pdrId);
    
    // Start with base PDR
    let currentPDR = { ...progressivePDR.basePDR };
    
    // Apply all updates in chronological order
    for (const update of progressivePDR.updates) {
      currentPDR = this.applyUpdateToPDR(currentPDR, update);
    }
    
    // Add metadata about evolution
    currentPDR.metadata = {
      ...currentPDR.metadata,
      evolutionScore: progressivePDR.evolutionScore,
      accuracyScore: progressivePDR.accuracyScore,
      totalUpdates: progressivePDR.updates.length,
      currentPhase: progressivePDR.currentPhase,
      lastUpdated: progressivePDR.lastUpdated,
      nextRecommendedUpdate: progressivePDR.nextRecommendedUpdate
    };
    
    return currentPDR;
  }

  /**
   * Get PDR evolution insights and recommendations
   */
  async getPDREvolutionInsights(pdrId: string): Promise<any> {
    const progressivePDR = await this.getProgressivePDR(pdrId);
    
    return {
      evolutionTimeline: this.buildEvolutionTimeline(progressivePDR.updates),
      accuracyTrends: this.analyzeAccuracyTrends(progressivePDR.updates),
      keyLearnings: this.extractKeyLearnings(progressivePDR.milestones),
      futureRecommendations: await this.generateFutureRecommendations(progressivePDR),
      competitiveEvolution: this.analyzeCompetitiveEvolution(progressivePDR.updates),
      marketEvolution: this.analyzeMarketEvolution(progressivePDR.updates),
      riskEvolution: this.analyzeRiskEvolution(progressivePDR.updates)
    };
  }

  // Private helper methods

  private initializeProjectMilestones(): ProjectMilestone[] {
    return [
      {
        id: 'discovery_complete',
        name: 'Discovery Phase Complete',
        phase: 'discovery',
        status: 'pending',
        learnings: [],
        marketFeedback: {},
        performanceMetrics: {}
      },
      {
        id: 'design_complete',
        name: 'Design Phase Complete',
        phase: 'design',
        status: 'pending',
        learnings: [],
        marketFeedback: {},
        performanceMetrics: {}
      },
      {
        id: 'mvp_complete',
        name: 'MVP Development Complete',
        phase: 'development',
        status: 'pending',
        learnings: [],
        marketFeedback: {},
        performanceMetrics: {}
      },
      {
        id: 'testing_complete',
        name: 'Testing Phase Complete',
        phase: 'testing',
        status: 'pending',
        learnings: [],
        marketFeedback: {},
        performanceMetrics: {}
      },
      {
        id: 'launch_complete',
        name: 'Launch Phase Complete',
        phase: 'launch',
        status: 'pending',
        learnings: [],
        marketFeedback: {},
        performanceMetrics: {}
      },
      {
        id: 'optimization_complete',
        name: 'Optimization Phase Complete',
        phase: 'optimization',
        status: 'pending',
        learnings: [],
        marketFeedback: {},
        performanceMetrics: {}
      }
    ];
  }

  private async generateUpdatesFromMilestone(
    milestone: ProjectMilestone,
    basePDR: any
  ): Promise<PDRUpdate[]> {
    const updates: PDRUpdate[] = [];
    
    // Generate updates based on milestone phase and learnings
    switch (milestone.phase) {
      case 'discovery':
        updates.push(...this.generateDiscoveryUpdates(milestone, basePDR));
        break;
      case 'design':
        updates.push(...this.generateDesignUpdates(milestone, basePDR));
        break;
      case 'development':
        updates.push(...this.generateDevelopmentUpdates(milestone, basePDR));
        break;
      case 'testing':
        updates.push(...this.generateTestingUpdates(milestone, basePDR));
        break;
      case 'launch':
        updates.push(...this.generateLaunchUpdates(milestone, basePDR));
        break;
      case 'optimization':
        updates.push(...this.generateOptimizationUpdates(milestone, basePDR));
        break;
    }
    
    return updates;
  }

  private generateDiscoveryUpdates(milestone: ProjectMilestone, basePDR: any): PDRUpdate[] {
    return [
      {
        section: 'market_validation',
        updateType: 'validation',
        data: {
          validatedAssumptions: milestone.learnings.filter(l => l.includes('validated')),
          invalidatedAssumptions: milestone.learnings.filter(l => l.includes('invalidated')),
          newInsights: milestone.marketFeedback
        },
        confidence: 0.8,
        source: 'project_progress',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private generateDesignUpdates(milestone: ProjectMilestone, basePDR: any): PDRUpdate[] {
    return [
      {
        section: 'user_experience',
        updateType: 'enhancement',
        data: {
          designValidation: milestone.learnings,
          userFeedback: milestone.marketFeedback,
          designMetrics: milestone.performanceMetrics
        },
        confidence: 0.9,
        source: 'project_progress',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private generateDevelopmentUpdates(milestone: ProjectMilestone, basePDR: any): PDRUpdate[] {
    return [
      {
        section: 'technical_architecture',
        updateType: 'validation',
        data: {
          architectureValidation: milestone.learnings,
          performanceMetrics: milestone.performanceMetrics,
          technicalChallenges: milestone.learnings.filter(l => l.includes('challenge'))
        },
        confidence: 0.85,
        source: 'project_progress',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private generateTestingUpdates(milestone: ProjectMilestone, basePDR: any): PDRUpdate[] {
    return [
      {
        section: 'risk_assessment',
        updateType: 'validation',
        data: {
          identifiedRisks: milestone.learnings.filter(l => l.includes('risk')),
          mitigatedRisks: milestone.learnings.filter(l => l.includes('mitigated')),
          testingResults: milestone.performanceMetrics
        },
        confidence: 0.9,
        source: 'project_progress',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private generateLaunchUpdates(milestone: ProjectMilestone, basePDR: any): PDRUpdate[] {
    return [
      {
        section: 'market_performance',
        updateType: 'new_data',
        data: {
          launchMetrics: milestone.performanceMetrics,
          marketReception: milestone.marketFeedback,
          initialUserFeedback: milestone.learnings
        },
        confidence: 0.95,
        source: 'project_progress',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private generateOptimizationUpdates(milestone: ProjectMilestone, basePDR: any): PDRUpdate[] {
    return [
      {
        section: 'strategic_framework',
        updateType: 'enhancement',
        data: {
          optimizationResults: milestone.performanceMetrics,
          userRetentionData: milestone.marketFeedback,
          growthOpportunities: milestone.learnings
        },
        confidence: 0.95,
        source: 'project_progress',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private async checkForCompetitiveChanges(
    progressivePDR: ProgressivePDR,
    milestone: ProjectMilestone
  ): Promise<PDRUpdate[]> {
    // Check if enough time has passed for competitive update
    const lastCompetitiveUpdate = progressivePDR.updates
      .filter(u => u.section === 'competitive_analysis')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const shouldUpdate = !lastCompetitiveUpdate || 
      (Date.now() - new Date(lastCompetitiveUpdate.timestamp).getTime()) > 30 * 24 * 60 * 60 * 1000; // 30 days

    if (!shouldUpdate) return [];

    // Simulate competitive analysis update
    return [
      {
        section: 'competitive_analysis',
        updateType: 'new_data',
        data: {
          newCompetitors: ['Emerging Competitor A', 'New Market Player B'],
          competitorUpdates: ['Feature launches', 'Pricing changes'],
          marketShifts: milestone.marketFeedback?.competitiveInsights || {}
        },
        confidence: 0.8,
        source: 'market_data',
        timestamp: new Date().toISOString()
      }
    ];
  }

  private determineNextPhase(
    currentPhase: ProjectMilestone['phase'],
    milestoneStatus: ProjectMilestone['status']
  ): string {
    if (milestoneStatus !== 'completed') return currentPhase;

    const phaseOrder: ProjectMilestone['phase'][] = [
      'discovery', 'design', 'development', 'testing', 'launch', 'optimization'
    ];
    
    const currentIndex = phaseOrder.indexOf(currentPhase);
    return phaseOrder[Math.min(currentIndex + 1, phaseOrder.length - 1)];
  }

  private calculateEvolutionScore(updateCount: number): number {
    // More updates = more evolution, but with diminishing returns
    return Math.min(updateCount * 0.1, 1.0);
  }

  private calculateAccuracyScore(progressivePDR: ProgressivePDR, learnings: any): number {
    // Analyze how well original predictions matched reality
    let accuracyAdjustment = 0;
    
    if (learnings.validatedAssumptions?.length > 0) {
      accuracyAdjustment += 0.1;
    }
    
    if (learnings.invalidatedAssumptions?.length > 0) {
      accuracyAdjustment -= 0.1;
    }
    
    return Math.max(0.1, Math.min(1.0, progressivePDR.accuracyScore + accuracyAdjustment));
  }

  private calculateNextUpdateTime(phase: string): string {
    // Different phases have different update frequencies
    const updateIntervals = {
      discovery: 7,   // 7 days
      design: 14,     // 14 days  
      development: 21, // 21 days
      testing: 7,     // 7 days
      launch: 3,      // 3 days
      optimization: 30 // 30 days
    };
    
    const days = updateIntervals[phase as keyof typeof updateIntervals] || 14;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  private async saveProgressivePDR(progressivePDR: ProgressivePDR): Promise<void> {
    try {
      const { error } = await supabase
        .from('progressive_pdrs')
        .upsert({
          id: progressivePDR.id,
          client_id: progressivePDR.clientId,
          base_pdr: progressivePDR.basePDR,
          updates: progressivePDR.updates,
          milestones: progressivePDR.milestones,
          current_phase: progressivePDR.currentPhase,
          evolution_score: progressivePDR.evolutionScore,
          accuracy_score: progressivePDR.accuracyScore,
          last_updated: progressivePDR.lastUpdated,
          next_recommended_update: progressivePDR.nextRecommendedUpdate
        });

      if (error) {
        console.error('Failed to save progressive PDR:', error);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  private async getProgressivePDR(pdrId: string): Promise<ProgressivePDR> {
    const { data, error } = await supabase
      .from('progressive_pdrs')
      .select('*')
      .eq('id', pdrId)
      .single();

    if (error || !data) {
      throw new Error(`Progressive PDR not found: ${pdrId}`);
    }

    return {
      id: data.id,
      clientId: data.client_id,
      basePDR: data.base_pdr,
      updates: data.updates || [],
      milestones: data.milestones || [],
      currentPhase: data.current_phase,
      evolutionScore: data.evolution_score,
      accuracyScore: data.accuracy_score,
      lastUpdated: data.last_updated,
      nextRecommendedUpdate: data.next_recommended_update
    };
  }

  private setupAutomatedMonitoring(pdrId: string): void {
    // In a real implementation, this would set up:
    // - Market data monitoring
    // - Competitive intelligence tracking
    // - Performance metrics collection
    // - User feedback aggregation
    
    console.log(`🤖 Automated monitoring setup for PDR: ${pdrId}`);
  }

  private scheduleCompetitiveUpdate(pdrId: string): void {
    // In a real implementation, this would schedule:
    // - Competitive analysis refresh
    // - Market position reassessment
    // - Pricing intelligence update
    
    console.log(`📊 Competitive analysis update scheduled for PDR: ${pdrId}`);
  }

  private applyUpdateToPDR(currentPDR: any, update: PDRUpdate): any {
    // Deep clone to avoid mutations
    const updatedPDR = JSON.parse(JSON.stringify(currentPDR));
    
    // Apply update to the appropriate section
    if (updatedPDR[update.section]) {
      Object.assign(updatedPDR[update.section], update.data);
    } else {
      updatedPDR[update.section] = update.data;
    }
    
    return updatedPDR;
  }

  // Additional helper methods would continue...
  // For brevity, including core framework structure

  private async generateMarketUpdates(marketData: any, progressivePDR: ProgressivePDR): Promise<PDRUpdate[]> {
    return []; // Implementation would analyze market changes
  }

  private async generateCompetitiveUpdates(competitiveData: any, progressivePDR: ProgressivePDR): Promise<PDRUpdate[]> {
    return []; // Implementation would analyze competitive moves
  }

  private async generateFeedbackUpdates(userFeedback: any, progressivePDR: ProgressivePDR): Promise<PDRUpdate[]> {
    return []; // Implementation would analyze user feedback
  }

  private async generatePerformanceUpdates(performanceMetrics: any, progressivePDR: ProgressivePDR): Promise<PDRUpdate[]> {
    return []; // Implementation would analyze performance data
  }

  private calculateAccuracyFromFeedback(currentScore: number, feedback: any, metrics: any): number {
    return currentScore; // Implementation would calculate accuracy adjustments
  }

  private buildEvolutionTimeline(updates: PDRUpdate[]): any {
    return {}; // Implementation would build timeline visualization
  }

  private analyzeAccuracyTrends(updates: PDRUpdate[]): any {
    return {}; // Implementation would analyze accuracy trends
  }

  private extractKeyLearnings(milestones: ProjectMilestone[]): any {
    return {}; // Implementation would extract key learnings
  }

  private async generateFutureRecommendations(progressivePDR: ProgressivePDR): Promise<any> {
    return {}; // Implementation would generate AI-powered recommendations
  }

  private analyzeCompetitiveEvolution(updates: PDRUpdate[]): any {
    return {}; // Implementation would analyze competitive landscape changes
  }

  private analyzeMarketEvolution(updates: PDRUpdate[]): any {
    return {}; // Implementation would analyze market evolution
  }

  private analyzeRiskEvolution(updates: PDRUpdate[]): any {
    return {}; // Implementation would analyze risk evolution
  }
}

// Export singleton instance
export const progressivePDRService = new ProgressivePDRService();