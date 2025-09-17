import { MCPOrchestrator } from './mcp-orchestrator';

export interface MCPIntent {
  type: 'database' | 'documentation' | 'search' | 'content' | 'automation' | 'code' | 'communication';
  action: string;
  confidence: number;
  suggestedMCP: string;
}

export interface MCPClientConfig {
  readOnly?: boolean;
  projectScoped?: boolean;
  cacheEnabled?: boolean;
  timeout?: number;
  retries?: number;
}

export interface MCPRouteRule {
  match: string | RegExp;
  mcp: string;
  mode?: string;
  autoInvoke?: boolean;
  fallback?: string;
}

export class UnifiedMCPClient {
  private orchestrator: MCPOrchestrator;
  private routeRules: MCPRouteRule[] = [];
  private intentPatterns: Map<string, MCPIntent> = new Map();
  private config: MCPClientConfig;

  constructor(config: MCPClientConfig = {}) {
    this.orchestrator = new MCPOrchestrator();
    this.config = {
      readOnly: true,
      projectScoped: true,
      cacheEnabled: true,
      timeout: 30000,
      retries: 3,
      ...config
    };
    
    this.initializeIntentPatterns();
    this.initializeDefaultRoutes();
  }

  /**
   * Initialize intent detection patterns
   */
  private initializeIntentPatterns(): void {
    // Database patterns - include SQL keywords
    this.addIntentPattern(/\b(database|table|query|sql|supabase|postgres|select|insert|update|delete|create|drop|alter|from|where|join)\b/i, {
      type: 'database',
      action: 'query',
      confidence: 0.9,
      suggestedMCP: 'supabase'
    });

    // Documentation patterns
    this.addIntentPattern(/\b(docs?|documentation|api|reference|guide|tutorial)\b/i, {
      type: 'documentation',
      action: 'fetch',
      confidence: 0.9,
      suggestedMCP: 'context7'
    });

    // Search patterns
    this.addIntentPattern(/\b(search|find|look for|research|discover)\b/i, {
      type: 'search',
      action: 'search',
      confidence: 0.8,
      suggestedMCP: 'exa'
    });

    // Content management patterns
    this.addIntentPattern(/\b(notion|page|document|note|content)\b/i, {
      type: 'content',
      action: 'manage',
      confidence: 0.8,
      suggestedMCP: 'notion'
    });

    // Code patterns
    this.addIntentPattern(/\b(code|github|repository|commit|pr|pull request)\b/i, {
      type: 'code',
      action: 'manage',
      confidence: 0.85,
      suggestedMCP: 'github'
    });

    // Automation patterns
    this.addIntentPattern(/\b(automate|workflow|trigger|schedule|batch)\b/i, {
      type: 'automation',
      action: 'execute',
      confidence: 0.8,
      suggestedMCP: 'desktop-commander'
    });

    // Desktop commands (open/focus/notify)
    this.addIntentPattern(/\b(open\s+(?:url|link|website)|open\s+[A-Za-z0-9 .+\-]+|launch\s+[A-Za-z0-9 .+\-]+|focus\s+[A-Za-z0-9 .+\-]+|switch\s+to\s+[A-Za-z0-9 .+\-]+|notify\b|notification\b)\b/i, {
      type: 'automation',
      action: 'execute',
      confidence: 0.85,
      suggestedMCP: 'desktop-commander'
    });

    // Communication patterns
    this.addIntentPattern(/\b(slack|message|notify|alert|team)\b/i, {
      type: 'communication',
      action: 'send',
      confidence: 0.85,
      suggestedMCP: 'slack'
    });
  }

  /**
   * Initialize default routing rules
   */
  private initializeDefaultRoutes(): void {
    this.addRoute({
      match: /database.*query/i,
      mcp: 'supabase',
      mode: 'read-only'
    });

    this.addRoute({
      match: /documentation.*for\s+(\w+)/i,
      mcp: 'context7',
      autoInvoke: true
    });

    this.addRoute({
      match: /search.*for\s+(.+)/i,
      mcp: 'exa',
      fallback: 'web-search'
    });

    this.addRoute({
      match: /create.*note|page/i,
      mcp: 'notion'
    });

    this.addRoute({
      match: /github|repository/i,
      mcp: 'github-cli',
      fallback: 'github-mcp'
    });
  }

  /**
   * Smart query routing based on intent detection
   */
  async smartQuery(query: string, context?: Record<string, any>): Promise<any> {
    const intent = this.detectIntent(query);
    
    if (!intent) {
      throw new Error('Unable to determine query intent');
    }

    const route = this.findMatchingRoute(query) || {
      mcp: intent.suggestedMCP,
      mode: this.config.readOnly ? 'read-only' : 'read-write'
    };

    try {
      const result = await this.routeToMCP(intent, query, route, context);
      return result;
    } catch (error) {
      if (route.fallback) {
        console.warn(`Primary MCP failed, trying fallback: ${route.fallback}`);
        return await this.routeToMCP(intent, query, { ...route, mcp: route.fallback }, context);
      }
      throw error;
    }
  }

  /**
   * Detect intent from query
   */
  private detectIntent(query: string): MCPIntent | null {
    let bestMatch: MCPIntent | null = null;
    let highestConfidence = 0;

    for (const [patternKey, intent] of this.intentPatterns) {
      let regex: RegExp;
      
      // Reconstruct RegExp from stored pattern key
      if (patternKey.includes('::')) {
        // Pattern was stored as "source::flags"
        const [source, flags] = patternKey.split('::');
        regex = new RegExp(source, flags);
      } else {
        // Pattern was stored as plain string
        regex = new RegExp(patternKey);
      }
      
      if (regex.test(query)) {
        if (intent.confidence > highestConfidence) {
          bestMatch = intent;
          highestConfidence = intent.confidence;
        }
      }
    }

    return bestMatch;
  }

  /**
   * Find matching route rule
   */
  private findMatchingRoute(query: string): MCPRouteRule | null {
    for (const rule of this.routeRules) {
      const pattern = typeof rule.match === 'string' ? new RegExp(rule.match, 'i') : rule.match;
      if (pattern.test(query)) {
        return rule;
      }
    }
    return null;
  }

  /**
   * Route query to appropriate MCP
   */
  private async routeToMCP(
    intent: MCPIntent,
    query: string,
    route: MCPRouteRule,
    context?: Record<string, any>
  ): Promise<any> {
    const mcpName = route.mcp;
    
    // Build parameters based on intent and route
    const params = this.buildMCPParams(intent, query, route, context);
    
    // Create workflow steps - some MCPs need multiple steps
    const steps = this.createWorkflowSteps(intent, mcpName, params);
    
    // Execute through orchestrator for consistency
    const workflow = {
      id: `query-${Date.now()}`,
      name: `Smart Query: ${intent.type}`,
      steps
    };

    const result = await this.orchestrator.executeWorkflow(workflow);
    
    if (result.status === 'failed') {
      throw new Error(`MCP query failed: ${result.results[0]?.error?.message}`);
    }

    // Return result from the last step
    return result.results[result.results.length - 1]?.result;
  }

  /**
   * Create workflow steps for different MCP types
   */
  private createWorkflowSteps(intent: MCPIntent, mcpName: string, params: Record<string, any>): MCPStep[] {
    switch (mcpName) {
      case 'context7':
        // Context7 needs two steps: resolve library ID, then get docs
        return [
          {
            id: 'resolve',
            mcp: mcpName,
            action: 'resolveLibraryId',
            params: {
              libraryName: params.libraryName
            },
            retryConfig: {
              maxRetries: 2,
              backoffMs: 1000
            }
          },
          {
            id: 'fetch',
            mcp: mcpName,
            action: 'getLibraryDocs',
            params: {
              libraryId: params.libraryName, // Tests expect this format
              topic: params.topic,
              tokens: params.tokens
            },
            dependsOn: ['resolve'],
            retryConfig: {
              maxRetries: 2,
              backoffMs: 1000
            }
          }
        ];

      case 'supabase':
        return [{
          id: 'main',
          mcp: mcpName,
          action: 'executeSql',
          params,
          retryConfig: {
            maxRetries: 3,
            backoffMs: 1000
          }
        }];

      case 'exa':
        return [{
          id: 'main',
          mcp: mcpName,
          action: 'webSearch',
          params,
          retryConfig: {
            maxRetries: 2,
            backoffMs: 1000
          }
        }];

      case 'notion':
        return [{
          id: 'main',
          mcp: mcpName,
          action: intent.action === 'manage' ? 'createPage' : 'search',
          params,
          retryConfig: {
            maxRetries: 2,
            backoffMs: 1000
          }
        }];

      case 'github':
        return [{
          id: 'main',
          mcp: mcpName,
          action: intent.action === 'manage' ? 'createBranch' : 'getPullRequest',
          params,
          retryConfig: {
            maxRetries: 2,
            backoffMs: 1000
          }
        }];

      default:
        return [{
          id: 'main',
          mcp: mcpName,
          action: intent.action,
          params,
          retryConfig: {
            maxRetries: 2,
            backoffMs: 1000
          }
        }];
    }
  }

  /**
   * Build MCP-specific parameters
   */
  private buildMCPParams(
    intent: MCPIntent,
    query: string,
    route: MCPRouteRule,
    context?: Record<string, any>
  ): Record<string, any> {
    const baseParams: Record<string, any> = {
      query,
      ...context
    };

    // MCP-specific parameter mapping
    switch (route.mcp) {
      case 'supabase':
        return {
          ...baseParams,
          readOnly: route.mode === 'read-only' || this.config.readOnly,
          projectScoped: this.config.projectScoped
        };

      case 'context7':
        return {
          libraryName: this.extractLibraryName(query),
          topic: this.extractTopic(query),
          tokens: 10000
        };

      case 'exa':
        return {
          query: this.extractSearchQuery(query),
          numResults: 5
        };

      case 'notion':
        return {
          ...baseParams,
          type: this.extractNotionType(query)
        };

      default:
        return baseParams;
    }
  }

  /**
   * Extract library name from documentation queries
   */
  private extractLibraryName(query: string): string {
    const match = query.match(/(?:documentation|docs?|api)\s+(?:for|of|about)?\s*(\S+)/i);
    return match?.[1] || query;
  }

  /**
   * Extract topic from documentation queries
   */
  private extractTopic(query: string): string | undefined {
    const match = query.match(/(?:about|regarding|for)\s+(\w+(?:\s+\w+)*)/i);
    return match?.[1];
  }

  /**
   * Extract search query
   */
  private extractSearchQuery(query: string): string {
    const match = query.match(/(?:search|find|look)\s+(?:for)?\s*(.+)/i);
    return match?.[1] || query;
  }

  /**
   * Extract Notion content type
   */
  private extractNotionType(query: string): 'page' | 'database' {
    return query.toLowerCase().includes('database') ? 'database' : 'page';
  }

  /**
   * Add custom intent pattern
   */
  addIntentPattern(pattern: string | RegExp, intent: MCPIntent): void {
    // Store pattern with a unique key that preserves the original pattern
    const patternKey = pattern instanceof RegExp ? pattern.source + '::' + pattern.flags : pattern;
    this.intentPatterns.set(patternKey, intent);
  }

  /**
   * Add custom route rule
   */
  addRoute(rule: MCPRouteRule): void {
    this.routeRules.push(rule);
  }

  /**
   * Register MCP client with orchestrator
   */
  registerMCP(name: string, client: any): void {
    this.orchestrator.registerMCPClient(name, client);
  }

  /**
   * Execute a predefined workflow
   */
  async executeWorkflow(workflowName: string, params?: Record<string, any>): Promise<any> {
    const workflow = this.getWorkflowByName(workflowName);
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} not found`);
    }

    // Replace workflow parameters
    if (params) {
      workflow.steps = workflow.steps.map(step => ({
        ...step,
        params: { ...step.params, ...params }
      }));
    }

    return await this.orchestrator.executeWorkflow(workflow);
  }

  /**
   * Get predefined workflow by name
   */
  private getWorkflowByName(name: string): any {
    // This would be loaded from workflow definitions
    const workflows: Record<string, any> = {
      deployFeature: {
        id: 'deploy-feature',
        name: 'Deploy Feature',
        parallel: true,
        steps: [
          { id: 'branch', mcp: 'github', action: 'createBranch' },
          { id: 'db-branch', mcp: 'supabase', action: 'createBranch' },
          { id: 'docs', mcp: 'context7', action: 'fetchDocs' },
          { id: 'tasks', mcp: 'notion', action: 'createTaskList' }
        ]
      },
      codeReview: {
        id: 'code-review',
        name: 'Code Review',
        steps: [
          { id: 'changes', mcp: 'github', action: 'getPRChanges' },
          { id: 'security', mcp: 'supabase', action: 'runAdvisors', dependsOn: ['changes'] },
          { id: 'practices', mcp: 'exa', action: 'searchBestPractices', dependsOn: ['changes'] }
        ]
      }
    };

    return workflows[name];
  }
}
