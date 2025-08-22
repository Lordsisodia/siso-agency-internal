// Removed unused import: invoke from @tauri-apps/api/core

export interface AnalysisResult {
  hasErrors: boolean;
  errors: string[];
  hasTests: boolean;
  testResults: TestResult[];
  codeQuality: CodeQualityMetrics;
  suggestions: string[];
  completionScore: number; // 0-100
  nextActions: string[];
}

export interface TestResult {
  framework: string;
  passed: number;
  failed: number;
  total: number;
  failureDetails: string[];
}

export interface CodeQualityMetrics {
  complexity: number;
  maintainability: number;
  hasDocumentation: boolean;
  hasErrorHandling: boolean;
  followsConventions: boolean;
}

export class ResultAnalyzer {
  async analyzeAgentOutput(output: string, projectPath: string): Promise<AnalysisResult> {
    const analysis: AnalysisResult = {
      hasErrors: false,
      errors: [],
      hasTests: false,
      testResults: [],
      codeQuality: {
        complexity: 0,
        maintainability: 0,
        hasDocumentation: false,
        hasErrorHandling: false,
        followsConventions: false
      },
      suggestions: [],
      completionScore: 0,
      nextActions: []
    };

    // Analyze for errors
    analysis.hasErrors = this.detectErrors(output);
    analysis.errors = this.extractErrors(output);

    // Analyze for tests
    analysis.hasTests = this.detectTests(output);
    analysis.testResults = await this.parseTestResults(output, projectPath);

    // Analyze code quality
    analysis.codeQuality = await this.analyzeCodeQuality(output, projectPath);

    // Generate suggestions
    analysis.suggestions = this.generateSuggestions(analysis);

    // Calculate completion score
    analysis.completionScore = this.calculateCompletionScore(analysis);

    // Determine next actions
    analysis.nextActions = this.determineNextActions(analysis);

    return analysis;
  }

  private detectErrors(output: string): boolean {
    const errorPatterns = [
      /error:/gi,
      /failed:/gi,
      /exception:/gi,
      /traceback/gi,
      /\d+ failing/gi,
      /compilation error/gi,
      /syntax error/gi
    ];

    return errorPatterns.some(pattern => pattern.test(output));
  }

  private extractErrors(output: string): string[] {
    const errors: string[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (/error:|failed:|exception:/gi.test(line)) {
        errors.push(line.trim());
      }
    }

    return errors;
  }

  private detectTests(output: string): boolean {
    const testPatterns = [
      /test.*pass/gi,
      /test.*fail/gi,
      /\d+ tests?/gi,
      /jest|mocha|vitest|pytest|cargo test/gi,
      /\.test\.|\.spec\./gi
    ];

    return testPatterns.some(pattern => pattern.test(output));
  }

  private async parseTestResults(output: string, _projectPath: string): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    // Jest/Vitest pattern
    const jestMatch = output.match(/Tests:\s*(\d+)\s*failed,\s*(\d+)\s*passed,\s*(\d+)\s*total/gi);
    if (jestMatch) {
      const [, failed, passed, total] = jestMatch[0].match(/(\d+)/g) || [];
      results.push({
        framework: 'Jest/Vitest',
        passed: parseInt(passed),
        failed: parseInt(failed),
        total: parseInt(total),
        failureDetails: this.extractTestFailures(output)
      });
    }

    // Python pytest pattern
    const pytestMatch = output.match(/(\d+)\s*failed,\s*(\d+)\s*passed/gi);
    if (pytestMatch) {
      const [, failed, passed] = pytestMatch[0].match(/(\d+)/g) || [];
      results.push({
        framework: 'pytest',
        passed: parseInt(passed),
        failed: parseInt(failed),
        total: parseInt(passed) + parseInt(failed),
        failureDetails: this.extractTestFailures(output)
      });
    }

    return results;
  }

  private extractTestFailures(output: string): string[] {
    const failures: string[] = [];
    const lines = output.split('\n');
    let inFailure = false;
    
    for (const line of lines) {
      if (/FAIL|FAILED|✗|×/gi.test(line)) {
        inFailure = true;
        failures.push(line.trim());
      } else if (inFailure && line.trim() === '') {
        inFailure = false;
      } else if (inFailure) {
        failures.push(line.trim());
      }
    }

    return failures;
  }

  private async analyzeCodeQuality(output: string, _projectPath: string): Promise<CodeQualityMetrics> {
    return {
      complexity: this.estimateComplexity(output),
      maintainability: this.estimateMaintainability(output),
      hasDocumentation: this.hasDocumentation(output),
      hasErrorHandling: this.hasErrorHandling(output),
      followsConventions: this.followsConventions(output)
    };
  }

  private estimateComplexity(output: string): number {
    // Simple heuristic based on control structures
    const complexityIndicators = [
      /if\s*\(/gi,
      /for\s*\(/gi,
      /while\s*\(/gi,
      /switch\s*\(/gi,
      /catch\s*\(/gi,
      /\?\s*:/gi // ternary
    ];

    let score = 0;
    for (const pattern of complexityIndicators) {
      const matches = output.match(pattern);
      if (matches) score += matches.length;
    }

    return Math.min(score, 10); // Cap at 10
  }

  private estimateMaintainability(output: string): number {
    let score = 5; // Start at middle

    // Positive indicators
    if (this.hasDocumentation(output)) score += 2;
    if (this.hasErrorHandling(output)) score += 2;
    if (this.followsConventions(output)) score += 1;

    // Negative indicators
    if (this.estimateComplexity(output) > 7) score -= 2;
    if (this.detectErrors(output)) score -= 3;

    return Math.max(0, Math.min(10, score));
  }

  private hasDocumentation(output: string): boolean {
    const docPatterns = [
      /\/\*\*[\s\S]*?\*\//g, // JSDoc
      /"""[\s\S]*?"""/g,     // Python docstring
      /'''[\s\S]*?'''/g,     // Python docstring
      /#.*?$/gm,             // Comments
      /\/\/.*?$/gm           // Single line comments
    ];

    return docPatterns.some(pattern => pattern.test(output));
  }

  private hasErrorHandling(output: string): boolean {
    const errorHandlingPatterns = [
      /try\s*{/gi,
      /catch\s*\(/gi,
      /except:/gi,
      /throw\s+/gi,
      /raise\s+/gi,
      /Result<.*>/gi,
      /Option<.*>/gi
    ];

    return errorHandlingPatterns.some(pattern => pattern.test(output));
  }

  private followsConventions(output: string): boolean {
    // Simple heuristics for common conventions
    const conventionChecks = [
      /function\s+[a-z][a-zA-Z0-9]*\s*\(/g, // camelCase functions
      /class\s+[A-Z][a-zA-Z0-9]*\s*{/g,     // PascalCase classes
      /const\s+[A-Z_]+\s*=/g,               // CONSTANT naming
    ];

    let score = 0;
    for (const pattern of conventionChecks) {
      if (pattern.test(output)) score++;
    }

    return score >= 2;
  }

  private generateSuggestions(analysis: AnalysisResult): string[] {
    const suggestions: string[] = [];

    if (analysis.hasErrors) {
      suggestions.push("Fix the compilation/runtime errors before proceeding");
    }

    if (!analysis.hasTests) {
      suggestions.push("Add comprehensive test coverage");
    }

    if (analysis.testResults.some(t => t.failed > 0)) {
      suggestions.push("Fix failing tests");
    }

    if (!analysis.codeQuality.hasDocumentation) {
      suggestions.push("Add documentation and comments");
    }

    if (!analysis.codeQuality.hasErrorHandling) {
      suggestions.push("Implement proper error handling");
    }

    if (analysis.codeQuality.complexity > 7) {
      suggestions.push("Reduce code complexity through refactoring");
    }

    if (analysis.completionScore < 70) {
      suggestions.push("Implementation needs significant improvement");
    }

    return suggestions;
  }

  private calculateCompletionScore(analysis: AnalysisResult): number {
    let score = 50; // Base score

    // Deduct for errors
    if (analysis.hasErrors) score -= 30;

    // Add for tests
    if (analysis.hasTests) score += 20;

    // Add for passing tests
    const totalTests = analysis.testResults.reduce((sum, t) => sum + t.total, 0);
    const passedTests = analysis.testResults.reduce((sum, t) => sum + t.passed, 0);
    if (totalTests > 0) {
      score += (passedTests / totalTests) * 20;
    }

    // Add for code quality
    score += analysis.codeQuality.maintainability;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private determineNextActions(analysis: AnalysisResult): string[] {
    const actions: string[] = [];

    if (analysis.hasErrors) {
      actions.push("Debug and fix all errors");
      return actions; // Stop here if there are errors
    }

    if (!analysis.hasTests) {
      actions.push("Create comprehensive test suite");
    }

    if (analysis.testResults.some(t => t.failed > 0)) {
      actions.push("Fix failing tests");
    }

    if (analysis.completionScore < 80) {
      if (!analysis.codeQuality.hasErrorHandling) {
        actions.push("Add error handling and edge cases");
      }
      if (!analysis.codeQuality.hasDocumentation) {
        actions.push("Add documentation and examples");
      }
      if (analysis.codeQuality.complexity > 6) {
        actions.push("Refactor for better maintainability");
      }
    }

    if (analysis.completionScore >= 80 && actions.length === 0) {
      actions.push("Implementation looks good - consider optimization or additional features");
    }

    return actions;
  }
}

export const resultAnalyzer = new ResultAnalyzer();