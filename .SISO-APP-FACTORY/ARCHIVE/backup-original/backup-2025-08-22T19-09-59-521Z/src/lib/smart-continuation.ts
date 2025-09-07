import { AutoContinuationConfig } from './auto-continuation';
import { resultAnalyzer, AnalysisResult } from './result-analyzer';

export interface SmartContinuationConfig extends AutoContinuationConfig {
  adaptiveStrategy: boolean;
  qualityThreshold: number; // 0-100, stop when this quality is reached
  contextAwareness: boolean;
  learningEnabled: boolean;
}

export interface ContinuationContext {
  iteration: number;
  previousResults: string[];
  cumulativeAnalysis: AnalysisResult[];
  projectType: 'web' | 'api' | 'library' | 'script' | 'unknown';
  detectedFrameworks: string[];
  userGoals: string[];
}

export class SmartContinuationManager {
  private context: ContinuationContext;
  private config: SmartContinuationConfig;

  constructor(config: SmartContinuationConfig) {
    this.config = config;
    this.context = {
      iteration: 0,
      previousResults: [],
      cumulativeAnalysis: [],
      projectType: 'unknown',
      detectedFrameworks: [],
      userGoals: []
    };
  }

  async generateIntelligentPrompt(
    lastResult: string,
    projectPath: string
  ): Promise<string> {
    // Analyze the latest result
    const analysis = await resultAnalyzer.analyzeAgentOutput(lastResult, projectPath);
    this.context.cumulativeAnalysis.push(analysis);
    this.context.previousResults.push(lastResult);
    this.context.iteration++;

    // Update project understanding
    this.updateProjectContext(lastResult);

    // Determine best strategy
    const strategy = this.determineOptimalStrategy(analysis);

    // Generate context-aware prompt
    return this.generateContextualPrompt(strategy, analysis);
  }

  private updateProjectContext(result: string): void {
    // Detect project type
    if (this.detectWebProject(result)) {
      this.context.projectType = 'web';
    } else if (this.detectApiProject(result)) {
      this.context.projectType = 'api';
    } else if (this.detectLibraryProject(result)) {
      this.context.projectType = 'library';
    }

    // Detect frameworks
    this.context.detectedFrameworks = this.detectFrameworks(result);
  }

  private detectWebProject(result: string): boolean {
    const webIndicators = [
      /react|vue|angular|svelte/gi,
      /html|css|dom/gi,
      /component|jsx|tsx/gi,
      /router|routing/gi
    ];
    return webIndicators.some(pattern => pattern.test(result));
  }

  private detectApiProject(result: string): boolean {
    const apiIndicators = [
      /express|fastapi|flask|django/gi,
      /endpoint|route|api/gi,
      /http|rest|graphql/gi,
      /middleware|cors/gi
    ];
    return apiIndicators.some(pattern => pattern.test(result));
  }

  private detectLibraryProject(result: string): boolean {
    const libIndicators = [
      /export|module|package/gi,
      /library|util|helper/gi,
      /npm|pip|cargo|gem/gi
    ];
    return libIndicators.some(pattern => pattern.test(result));
  }

  private detectFrameworks(result: string): string[] {
    const frameworks: string[] = [];
    const frameworkPatterns = {
      'React': /import.*react|jsx|tsx/gi,
      'Vue': /import.*vue|\.vue/gi,
      'Express': /express|app\.get|app\.post/gi,
      'Jest': /jest|describe|it\(|test\(/gi,
      'TypeScript': /interface|type.*=|\.ts/gi,
      'Python': /def |import |\.py/gi,
      'Rust': /fn |use |\.rs/gi,
      'Next.js': /next|getServerSideProps/gi,
      'Tailwind': /tailwind|tw-|className=/gi
    };

    for (const [name, pattern] of Object.entries(frameworkPatterns)) {
      if (pattern.test(result)) {
        frameworks.push(name);
      }
    }

    return frameworks;
  }

  private determineOptimalStrategy(analysis: AnalysisResult): string {
    if (!this.config.adaptiveStrategy) {
      return this.config.strategy;
    }

    // Priority-based strategy selection
    if (analysis.hasErrors) {
      return 'debugging';
    }

    if (!analysis.hasTests && this.context.iteration <= 2) {
      return 'testing';
    }

    if (analysis.testResults.some(t => t.failed > 0)) {
      return 'test-fixing';
    }

    if (analysis.completionScore < this.config.qualityThreshold) {
      if (analysis.codeQuality.complexity > 7) {
        return 'refactoring';
      }
      if (!analysis.codeQuality.hasErrorHandling) {
        return 'robustness';
      }
      if (!analysis.codeQuality.hasDocumentation) {
        return 'documentation';
      }
    }

    // Advanced strategies based on project type
    switch (this.context.projectType) {
      case 'web':
        return this.getWebProjectStrategy(analysis);
      case 'api':
        return this.getApiProjectStrategy(analysis);
      case 'library':
        return this.getLibraryProjectStrategy(analysis);
      default:
        return 'comprehensive';
    }
  }

  private getWebProjectStrategy(_analysis: AnalysisResult): string {
    const strategies = ['accessibility', 'performance', 'responsive-design', 'user-experience'];
    return strategies[this.context.iteration % strategies.length];
  }

  private getApiProjectStrategy(_analysis: AnalysisResult): string {
    const strategies = ['security', 'performance', 'validation', 'documentation'];
    return strategies[this.context.iteration % strategies.length];
  }

  private getLibraryProjectStrategy(_analysis: AnalysisResult): string {
    const strategies = ['api-design', 'documentation', 'examples', 'performance'];
    return strategies[this.context.iteration % strategies.length];
  }

  private generateContextualPrompt(strategy: string, analysis: AnalysisResult): string {
    const basePrompts = this.getStrategyPrompts(strategy);
    const contextualPrompt = this.addProjectContext(basePrompts[0]);
    const frameworkPrompt = this.addFrameworkContext(contextualPrompt);
    
    return this.addAnalysisContext(frameworkPrompt, analysis);
  }

  private getStrategyPrompts(strategy: string): string[] {
    const strategyMap: Record<string, string[]> = {
      'debugging': [
        'Carefully analyze and fix all errors, warnings, and compilation issues. Provide detailed explanations for each fix.',
      ],
      'testing': [
        'Create comprehensive tests including unit tests, integration tests, and edge cases. Ensure high coverage.',
      ],
      'test-fixing': [
        'Fix all failing tests. Analyze why they\'re failing and implement proper solutions.',
      ],
      'refactoring': [
        'Refactor the code to reduce complexity, improve readability, and follow best practices.',
      ],
      'robustness': [
        'Add comprehensive error handling, input validation, and edge case management.',
      ],
      'documentation': [
        'Add thorough documentation including inline comments, API docs, and usage examples.',
      ],
      'accessibility': [
        'Improve accessibility with ARIA labels, keyboard navigation, and screen reader support.',
      ],
      'performance': [
        'Optimize performance including load times, memory usage, and algorithm efficiency.',
      ],
      'security': [
        'Implement security best practices including input sanitization, authentication, and authorization.',
      ],
      'user-experience': [
        'Enhance user experience with better UI/UX, loading states, and error messages.',
      ]
    };

    return strategyMap[strategy] || strategyMap['comprehensive'] || [
      'Review and improve the implementation with testing, documentation, and best practices.'
    ];
  }

  private addProjectContext(prompt: string): string {
    const projectContext = this.context.projectType !== 'unknown' 
      ? ` Focus on ${this.context.projectType} development best practices.`
      : '';
    
    return prompt + projectContext;
  }

  private addFrameworkContext(prompt: string): string {
    if (this.context.detectedFrameworks.length > 0) {
      const frameworks = this.context.detectedFrameworks.join(', ');
      return prompt + ` Consider ${frameworks} specific patterns and conventions.`;
    }
    return prompt;
  }

  private addAnalysisContext(prompt: string, analysis: AnalysisResult): string {
    let context = prompt;

    if (analysis.suggestions.length > 0) {
      context += ` Pay special attention to: ${analysis.suggestions.join(', ')}.`;
    }

    if (analysis.nextActions.length > 0) {
      context += ` Next actions should include: ${analysis.nextActions.join(', ')}.`;
    }

    return context;
  }

  shouldContinue(analysis: AnalysisResult): boolean {
    // Quality threshold check
    if (analysis.completionScore >= this.config.qualityThreshold) {
      return false;
    }

    // Max iterations check
    if (this.context.iteration >= this.config.maxIterations) {
      return false;
    }

    // Stop conditions check
    const resultText = this.context.previousResults[this.context.previousResults.length - 1];
    for (const condition of this.config.stopConditions) {
      if (resultText.toLowerCase().includes(condition.toLowerCase())) {
        return false;
      }
    }

    // Don't continue if no meaningful improvements
    if (this.context.iteration > 2) {
      const recentScores = this.context.cumulativeAnalysis
        .slice(-3)
        .map(a => a.completionScore);
      
      const isImproving = recentScores[recentScores.length - 1] > recentScores[0];
      if (!isImproving && analysis.completionScore > 60) {
        return false;
      }
    }

    return true;
  }

  getProgress(): {
    currentStrategy: string;
    completionScore: number;
    iteration: number;
    projectType: string;
    frameworks: string[];
    suggestions: string[];
  } {
    const latestAnalysis = this.context.cumulativeAnalysis[this.context.cumulativeAnalysis.length - 1];
    
    return {
      currentStrategy: this.config.strategy,
      completionScore: latestAnalysis?.completionScore || 0,
      iteration: this.context.iteration,
      projectType: this.context.projectType,
      frameworks: this.context.detectedFrameworks,
      suggestions: latestAnalysis?.suggestions || []
    };
  }
}

export const DEFAULT_SMART_CONFIG: SmartContinuationConfig = {
  enabled: true,
  maxIterations: 7,
  strategy: 'comprehensive',
  stopConditions: ['production ready', 'fully implemented', 'all tests passing'],
  iterationDelay: 3000,
  adaptiveStrategy: true,
  qualityThreshold: 85,
  contextAwareness: true,
  learningEnabled: true
};