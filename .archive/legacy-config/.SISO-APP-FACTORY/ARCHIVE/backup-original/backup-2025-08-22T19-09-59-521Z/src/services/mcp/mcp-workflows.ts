import { MCPWorkflow } from './mcp-orchestrator';

/**
 * Predefined MCP workflows for common operations
 */
export const MCPWorkflows = {
  /**
   * Deploy a new feature across all systems
   */
  deployFeature: {
    id: 'deploy-feature',
    name: 'Deploy Feature',
    description: 'Create branches, setup database, fetch docs, and create tasks',
    parallel: true,
    onError: 'stop',
    steps: [
      {
        id: 'create-github-branch',
        mcp: 'github',
        action: 'createBranch',
        params: {
          branchName: '{{featureName}}',
          baseBranch: 'main'
        }
      },
      {
        id: 'create-supabase-branch',
        mcp: 'supabase',
        action: 'createBranch',
        params: {
          name: '{{featureName}}',
          confirmCostId: '{{costConfirmation}}'
        }
      },
      {
        id: 'fetch-relevant-docs',
        mcp: 'context7',
        action: 'getLibraryDocs',
        params: {
          libraries: '{{requiredLibraries}}',
          topic: '{{featureName}}'
        }
      },
      {
        id: 'create-notion-tasks',
        mcp: 'notion',
        action: 'createPage',
        params: {
          parentId: '{{projectPageId}}',
          title: 'Tasks for {{featureName}}',
          parentType: 'page'
        }
      }
    ]
  } as MCPWorkflow,

  /**
   * Comprehensive code review workflow
   */
  codeReview: {
    id: 'code-review',
    name: 'Code Review',
    description: 'Analyze PR changes, run security checks, search best practices',
    parallel: false,
    onError: 'continue',
    steps: [
      {
        id: 'get-pr-changes',
        mcp: 'github',
        action: 'getPullRequest',
        params: {
          prNumber: '{{prNumber}}'
        }
      },
      {
        id: 'analyze-database-changes',
        mcp: 'supabase',
        action: 'getAdvisors',
        params: {
          type: 'security',
          projectId: '{{projectId}}'
        },
        dependsOn: ['get-pr-changes'],
        condition: (prev) => prev['get-pr-changes']?.files?.some((f: any) => 
          f.filename.includes('migration') || f.filename.includes('schema')
        )
      },
      {
        id: 'search-best-practices',
        mcp: 'exa',
        action: 'webSearch',
        params: {
          query: '{{language}} best practices {{codePatterns}}',
          numResults: 3
        },
        dependsOn: ['get-pr-changes']
      },
      {
        id: 'create-review-summary',
        mcp: 'notion',
        action: 'createPage',
        params: {
          parentId: '{{reviewsPageId}}',
          title: 'Review: PR #{{prNumber}}',
          parentType: 'page',
          content: '{{reviewSummary}}'
        },
        dependsOn: ['analyze-database-changes', 'search-best-practices']
      }
    ]
  } as MCPWorkflow,

  /**
   * Research and document a new technology
   */
  technologyResearch: {
    id: 'tech-research',
    name: 'Technology Research',
    description: 'Research technology, find examples, create documentation',
    parallel: true,
    onError: 'continue',
    steps: [
      {
        id: 'search-documentation',
        mcp: 'context7',
        action: 'resolveLibraryId',
        params: {
          libraryName: '{{technology}}'
        }
      },
      {
        id: 'fetch-official-docs',
        mcp: 'context7',
        action: 'getLibraryDocs',
        params: {
          context7CompatibleLibraryID: '{{libraryId}}',
          topic: '{{specificTopic}}',
          tokens: 15000
        },
        dependsOn: ['search-documentation']
      },
      {
        id: 'search-github-examples',
        mcp: 'github',
        action: 'searchRepositories',
        params: {
          query: '{{technology}} example',
          searchType: 'repositories'
        }
      },
      {
        id: 'search-tutorials',
        mcp: 'exa',
        action: 'webSearch',
        params: {
          query: '{{technology}} tutorial {{year}}',
          numResults: 5
        }
      },
      {
        id: 'deep-research',
        mcp: 'exa',
        action: 'deepResearcherStart',
        params: {
          instructions: 'Research {{technology}} focusing on {{specificTopic}}',
          model: 'exa-research-pro'
        },
        retryConfig: {
          maxRetries: 2,
          backoffMs: 5000
        }
      },
      {
        id: 'create-research-doc',
        mcp: 'notion',
        action: 'createPage',
        params: {
          parentId: '{{researchPageId}}',
          title: '{{technology}} Research',
          parentType: 'page',
          properties: {
            Technology: { title: [{ text: { content: '{{technology}}' } }] },
            Status: { select: { name: 'Researching' } }
          }
        },
        dependsOn: ['fetch-official-docs', 'search-tutorials']
      }
    ]
  } as MCPWorkflow,

  /**
   * Daily project sync workflow
   */
  dailyProjectSync: {
    id: 'daily-sync',
    name: 'Daily Project Sync',
    description: 'Sync project status across all platforms',
    parallel: true,
    onError: 'continue',
    steps: [
      {
        id: 'get-github-activity',
        mcp: 'github',
        action: 'getRepoActivity',
        params: {
          repo: '{{repoName}}',
          since: '{{yesterday}}'
        }
      },
      {
        id: 'get-database-stats',
        mcp: 'supabase',
        action: 'executeSql',
        params: {
          query: `
            SELECT 
              COUNT(*) as total_records,
              MAX(created_at) as last_activity
            FROM tasks 
            WHERE created_at > '{{yesterday}}'
          `
        }
      },
      {
        id: 'get-notion-updates',
        mcp: 'notion',
        action: 'queryDatabase',
        params: {
          databaseId: '{{projectDatabaseId}}',
          filter: {
            property: 'Last edited time',
            date: { after: '{{yesterday}}' }
          }
        }
      },
      {
        id: 'notify-team',
        mcp: 'slack',
        action: 'postMessage',
        params: {
          channel: '{{projectChannel}}',
          text: 'Daily Sync Complete',
          blocks: '{{syncSummaryBlocks}}'
        },
        dependsOn: ['get-github-activity', 'get-database-stats', 'get-notion-updates']
      }
    ]
  } as MCPWorkflow,

  /**
   * Client onboarding workflow
   */
  clientOnboarding: {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    description: 'Set up new client across all systems',
    parallel: false,
    onError: 'rollback',
    steps: [
      {
        id: 'create-database-entry',
        mcp: 'supabase',
        action: 'executeSql',
        params: {
          query: `
            INSERT INTO client_onboarding (name, email, company, status)
            VALUES ('{{clientName}}', '{{clientEmail}}', '{{company}}', 'active')
            RETURNING id
          `
        }
      },
      {
        id: 'create-notion-workspace',
        mcp: 'notion',
        action: 'createDatabase',
        params: {
          parentId: '{{clientsPageId}}',
          title: '{{company}} - Projects',
          properties: {
            Name: { title: {} },
            Status: { select: { options: [{ name: 'Active' }, { name: 'Completed' }] } },
            'Due Date': { date: {} }
          }
        },
        dependsOn: ['create-database-entry']
      },
      {
        id: 'create-github-repo',
        mcp: 'github',
        action: 'createRepository',
        params: {
          name: '{{company}}-project',
          private: true,
          description: 'Client project for {{company}}'
        },
        dependsOn: ['create-database-entry']
      },
      {
        id: 'send-welcome-email',
        mcp: 'slack',
        action: 'postMessage',
        params: {
          channel: '{{salesChannel}}',
          text: 'New client onboarded: {{company}}'
        },
        dependsOn: ['create-notion-workspace', 'create-github-repo']
      }
    ]
  } as MCPWorkflow,

  /**
   * Bug investigation workflow
   */
  bugInvestigation: {
    id: 'bug-investigation',
    name: 'Bug Investigation',
    description: 'Investigate and document bug reports',
    parallel: true,
    onError: 'continue',
    steps: [
      {
        id: 'search-similar-issues',
        mcp: 'github',
        action: 'searchIssues',
        params: {
          query: '{{bugDescription}}',
          state: 'all'
        }
      },
      {
        id: 'check-logs',
        mcp: 'supabase',
        action: 'getLogs',
        params: {
          service: 'api',
          projectId: '{{projectId}}'
        }
      },
      {
        id: 'search-error-solutions',
        mcp: 'exa',
        action: 'webSearch',
        params: {
          query: '{{errorMessage}} solution',
          numResults: 5
        }
      },
      {
        id: 'check-documentation',
        mcp: 'context7',
        action: 'getLibraryDocs',
        params: {
          libraryName: '{{affectedLibrary}}',
          topic: '{{errorContext}}'
        }
      },
      {
        id: 'create-bug-report',
        mcp: 'notion',
        action: 'createPage',
        params: {
          parentId: '{{bugsPageId}}',
          title: 'Bug: {{bugTitle}}',
          parentType: 'page',
          content: '{{investigationSummary}}'
        },
        dependsOn: ['search-similar-issues', 'check-logs', 'search-error-solutions']
      }
    ]
  } as MCPWorkflow,

  /**
   * Content creation workflow
   */
  contentCreation: {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'Research and create content across platforms',
    parallel: false,
    onError: 'continue',
    steps: [
      {
        id: 'research-topic',
        mcp: 'exa',
        action: 'deepResearcherStart',
        params: {
          instructions: 'Research {{topic}} for blog post',
          model: 'exa-research'
        }
      },
      {
        id: 'check-research-status',
        mcp: 'exa',
        action: 'deepResearcherCheck',
        params: {
          taskId: '{{researchTaskId}}'
        },
        dependsOn: ['research-topic'],
        retryConfig: {
          maxRetries: 10,
          backoffMs: 5000
        }
      },
      {
        id: 'find-related-content',
        mcp: 'notion',
        action: 'search',
        params: {
          query: '{{topic}}',
          filter: { property: 'object', value: 'page' }
        }
      },
      {
        id: 'create-draft',
        mcp: 'notion',
        action: 'createPage',
        params: {
          parentId: '{{draftsPageId}}',
          title: '{{contentTitle}}',
          parentType: 'page',
          content: '{{draftContent}}'
        },
        dependsOn: ['check-research-status', 'find-related-content']
      }
    ]
  } as MCPWorkflow
};

/**
 * Workflow templates that can be customized
 */
export const WorkflowTemplates = {
  /**
   * Generic data sync template
   */
  dataSync: (source: string, destination: string) => ({
    id: `sync-${source}-to-${destination}`,
    name: `Sync ${source} to ${destination}`,
    steps: [
      {
        id: 'fetch-source',
        mcp: source,
        action: 'getData',
        params: { /* source specific */ }
      },
      {
        id: 'transform-data',
        mcp: 'transformer',
        action: 'transform',
        params: { /* transformation rules */ },
        dependsOn: ['fetch-source']
      },
      {
        id: 'update-destination',
        mcp: destination,
        action: 'updateData',
        params: { /* destination specific */ },
        dependsOn: ['transform-data']
      }
    ]
  }),

  /**
   * Generic notification template
   */
  notification: (channels: string[]) => ({
    id: 'multi-channel-notification',
    name: 'Multi-Channel Notification',
    parallel: true,
    steps: channels.map(channel => ({
      id: `notify-${channel}`,
      mcp: channel,
      action: 'sendNotification',
      params: {
        message: '{{message}}',
        priority: '{{priority}}'
      }
    }))
  })
};

/**
 * Helper to create custom workflows
 */
export class WorkflowBuilder {
  private workflow: MCPWorkflow;

  constructor(id: string, name: string) {
    this.workflow = {
      id,
      name,
      steps: [],
      parallel: false,
      onError: 'stop'
    };
  }

  setDescription(description: string): this {
    this.workflow.description = description;
    return this;
  }

  setParallel(parallel: boolean): this {
    this.workflow.parallel = parallel;
    return this;
  }

  setErrorHandling(onError: 'continue' | 'stop' | 'rollback'): this {
    this.workflow.onError = onError;
    return this;
  }

  addStep(step: {
    id: string;
    mcp: string;
    action: string;
    params?: any;
    dependsOn?: string[];
    condition?: (prev: Record<string, any>) => boolean;
    retryConfig?: { maxRetries: number; backoffMs: number };
  }): this {
    this.workflow.steps.push(step);
    return this;
  }

  build(): MCPWorkflow {
    return { ...this.workflow };
  }
}