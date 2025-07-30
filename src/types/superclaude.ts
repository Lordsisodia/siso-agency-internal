/**
 * SuperClaude Integration Types
 * 
 * Types for integrating SuperClaude framework with Claudia
 * Provides 19 specialized commands and 9 cognitive personas
 */

export interface SuperClaudeCommand {
  id: string;
  name: string;
  category: 'development' | 'analysis' | 'operations' | 'design';
  description: string;
  flags: SuperClaudeFlag[];
  examples: string[];
  mcpSupport: boolean;
}

export interface SuperClaudeFlag {
  name: string;
  type: 'boolean' | 'string' | 'number';
  description: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
}

export interface SuperClaudePersona {
  id: string;
  name: string;
  focusArea: string;
  tools: string[];
  useCases: string[];
  flag: string;
}

export interface SuperClaudeExecution {
  id: string;
  command: string;
  flags: string[];
  persona?: string;
  projectPath: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  duration?: number;
}

export interface SuperClaudeWorkflow {
  id: string;
  name: string;
  description: string;
  steps: SuperClaudeWorkflowStep[];
  category: 'code-review' | 'architecture' | 'security' | 'performance' | 'deployment';
}

export interface SuperClaudeWorkflowStep {
  command: string;
  flags: string[];
  persona?: string;
  description: string;
  order: number;
}

// SuperClaude Commands (19 total)
export const SUPERCLAUDE_COMMANDS: SuperClaudeCommand[] = [
  // Development Commands (3)
  {
    id: 'build',
    name: 'Build',
    category: 'development',
    description: 'Project builder with stack templates and AI components',
    flags: [
      { name: 'react', type: 'boolean', description: 'React development' },
      { name: 'magic', type: 'boolean', description: 'AI-generated UI components' },
      { name: 'tdd', type: 'boolean', description: 'Test-driven development' },
      { name: 'watch', type: 'boolean', description: 'Watch mode for changes' },
      { name: 'feature', type: 'string', description: 'Feature name to build' }
    ],
    examples: [
      '/build --react --magic --tdd',
      '/build --feature auth --watch'
    ],
    mcpSupport: true
  },
  {
    id: 'dev-setup',
    name: 'Dev Setup',
    category: 'development',
    description: 'Development environment setup with CI/CD integration',
    flags: [
      { name: 'ci', type: 'boolean', description: 'CI/CD setup' },
      { name: 'monitor', type: 'boolean', description: 'Monitoring setup' },
      { name: 'docker', type: 'boolean', description: 'Docker configuration' }
    ],
    examples: [
      '/dev-setup --ci --monitor',
      '/dev-setup --docker'
    ],
    mcpSupport: false
  },
  {
    id: 'test',
    name: 'Test',
    category: 'development',
    description: 'Testing framework with coverage and E2E support',
    flags: [
      { name: 'coverage', type: 'boolean', description: 'Code coverage analysis' },
      { name: 'e2e', type: 'boolean', description: 'End-to-end testing' },
      { name: 'pup', type: 'boolean', description: 'Puppeteer integration' },
      { name: 'strict', type: 'boolean', description: 'Strict testing mode' }
    ],
    examples: [
      '/test --coverage --e2e --pup',
      '/test --strict'
    ],
    mcpSupport: true
  },

  // Analysis & Quality Commands (5)
  {
    id: 'review',
    name: 'Review',
    category: 'analysis',
    description: 'AI-powered code review with evidence-based recommendations',
    flags: [
      { name: 'quality', type: 'boolean', description: 'Quality analysis' },
      { name: 'evidence', type: 'boolean', description: 'Evidence-based review' },
      { name: 'security', type: 'boolean', description: 'Security focus' }
    ],
    examples: [
      '/review --quality --evidence',
      '/review --security'
    ],
    mcpSupport: true
  },
  {
    id: 'analyze',
    name: 'Analyze',
    category: 'analysis',
    description: 'Code and system analysis with architecture insights',
    flags: [
      { name: 'code', type: 'boolean', description: 'Code analysis' },
      { name: 'architecture', type: 'boolean', description: 'Architecture analysis' },
      { name: 'seq', type: 'boolean', description: 'Sequential reasoning' },
      { name: 'think', type: 'boolean', description: 'Deep thinking mode' }
    ],
    examples: [
      '/analyze --architecture --seq',
      '/analyze --code --think'
    ],
    mcpSupport: true
  },
  {
    id: 'troubleshoot',
    name: 'Troubleshoot',
    category: 'analysis',
    description: 'Debugging and issue resolution with root cause analysis',
    flags: [
      { name: 'prod', type: 'boolean', description: 'Production environment' },
      { name: 'investigate', type: 'boolean', description: 'Investigation mode' },
      { name: 'five-whys', type: 'boolean', description: 'Five whys methodology' },
      { name: 'introspect', type: 'boolean', description: 'Framework self-analysis' }
    ],
    examples: [
      '/troubleshoot --prod --investigate',
      '/troubleshoot --five-whys'
    ],
    mcpSupport: true
  },
  {
    id: 'improve',
    name: 'Improve',
    category: 'analysis',
    description: 'Enhancement and optimization with performance focus',
    flags: [
      { name: 'performance', type: 'boolean', description: 'Performance optimization' },
      { name: 'iterate', type: 'boolean', description: 'Iterative improvement' },
      { name: 'threshold', type: 'string', description: 'Performance threshold' },
      { name: 'uc', type: 'boolean', description: 'Ultra compressed mode' }
    ],
    examples: [
      '/improve --performance --threshold 95%',
      '/improve --iterate --uc'
    ],
    mcpSupport: true
  },
  {
    id: 'explain',
    name: 'Explain',
    category: 'analysis',
    description: 'Documentation and explanations with visual aids',
    flags: [
      { name: 'depth', type: 'string', description: 'Explanation depth (basic|expert)' },
      { name: 'visual', type: 'boolean', description: 'Visual documentation' },
      { name: 'examples', type: 'boolean', description: 'Include examples' }
    ],
    examples: [
      '/explain --depth expert --visual',
      '/explain --examples'
    ],
    mcpSupport: true
  },

  // Operations Commands (6)
  {
    id: 'deploy',
    name: 'Deploy',
    category: 'operations',
    description: 'Application deployment with environment planning',
    flags: [
      { name: 'env', type: 'string', description: 'Environment (dev|staging|prod)' },
      { name: 'plan', type: 'boolean', description: 'Deployment planning' },
      { name: 'rollback', type: 'boolean', description: 'Rollback capability' }
    ],
    examples: [
      '/deploy --env prod --plan',
      '/deploy --env staging --rollback'
    ],
    mcpSupport: false
  },
  {
    id: 'scan',
    name: 'Scan',
    category: 'operations',
    description: 'Security and validation scanning with OWASP support',
    flags: [
      { name: 'security', type: 'boolean', description: 'Security scanning' },
      { name: 'owasp', type: 'boolean', description: 'OWASP guidelines' },
      { name: 'deps', type: 'boolean', description: 'Dependency scanning' },
      { name: 'validate', type: 'boolean', description: 'Validation checks' }
    ],
    examples: [
      '/scan --security --owasp --deps',
      '/scan --validate'
    ],
    mcpSupport: true
  },
  {
    id: 'migrate',
    name: 'Migrate',
    category: 'operations',
    description: 'Database and code migrations with rollback support',
    flags: [
      { name: 'dry-run', type: 'boolean', description: 'Dry run mode' },
      { name: 'rollback', type: 'boolean', description: 'Rollback migration' },
      { name: 'database', type: 'boolean', description: 'Database migration' }
    ],
    examples: [
      '/migrate --dry-run --database',
      '/migrate --rollback'
    ],
    mcpSupport: false
  },
  {
    id: 'estimate',
    name: 'Estimate',
    category: 'operations',
    description: 'Project estimation with detailed analysis',
    flags: [
      { name: 'detailed', type: 'boolean', description: 'Detailed estimation' },
      { name: 'worst-case', type: 'boolean', description: 'Worst case scenario' },
      { name: 'resources', type: 'boolean', description: 'Resource planning' }
    ],
    examples: [
      '/estimate --detailed --worst-case',
      '/estimate --resources'
    ],
    mcpSupport: true
  },
  {
    id: 'cleanup',
    name: 'Cleanup',
    category: 'operations',
    description: 'Project maintenance and cleanup tasks',
    flags: [
      { name: 'all', type: 'boolean', description: 'Full cleanup' },
      { name: 'validate', type: 'boolean', description: 'Validate before cleanup' },
      { name: 'deps', type: 'boolean', description: 'Dependency cleanup' }
    ],
    examples: [
      '/cleanup --all --validate',
      '/cleanup --deps'
    ],
    mcpSupport: false
  },
  {
    id: 'git',
    name: 'Git',
    category: 'operations',
    description: 'Git workflow management with checkpoint support',
    flags: [
      { name: 'checkpoint', type: 'boolean', description: 'Git checkpoint' },
      { name: 'branch', type: 'string', description: 'Branch name' },
      { name: 'merge', type: 'boolean', description: 'Merge operation' }
    ],
    examples: [
      '/git --checkpoint',
      '/git --branch feature/auth --merge'
    ],
    mcpSupport: false
  },

  // Design & Workflow Commands (5)
  {
    id: 'design',
    name: 'Design',
    category: 'design',
    description: 'System architecture and API design',
    flags: [
      { name: 'api', type: 'boolean', description: 'API design' },
      { name: 'ddd', type: 'boolean', description: 'Domain-driven design' },
      { name: 'bounded-context', type: 'boolean', description: 'Bounded context' },
      { name: 'ui', type: 'boolean', description: 'UI design' }
    ],
    examples: [
      '/design --api --ddd --bounded-context',
      '/design --ui'
    ],
    mcpSupport: true
  },
  {
    id: 'spawn',
    name: 'Spawn',
    category: 'design',
    description: 'Parallel task execution and workflow spawning',
    flags: [
      { name: 'parallel', type: 'boolean', description: 'Parallel execution' },
      { name: 'tasks', type: 'string', description: 'Number of tasks' }
    ],
    examples: [
      '/spawn --parallel --tasks 4',
      '/spawn --parallel'
    ],
    mcpSupport: true
  },
  {
    id: 'document',
    name: 'Document',
    category: 'design',
    description: 'Documentation creation and maintenance',
    flags: [
      { name: 'api', type: 'boolean', description: 'API documentation' },
      { name: 'readme', type: 'boolean', description: 'README generation' },
      { name: 'wiki', type: 'boolean', description: 'Wiki documentation' }
    ],
    examples: [
      '/document --api --readme',
      '/document --wiki'
    ],
    mcpSupport: true
  },
  {
    id: 'load',
    name: 'Load',
    category: 'design',
    description: 'Project context loading and initialization',
    flags: [
      { name: 'context', type: 'boolean', description: 'Load full context' },
      { name: 'files', type: 'string', description: 'Specific files to load' }
    ],
    examples: [
      '/load --context',
      '/load --files src/'
    ],
    mcpSupport: false
  },
  {
    id: 'task',
    name: 'Task',
    category: 'design',
    description: 'Task management and workflow coordination',
    flags: [
      { name: 'create', type: 'boolean', description: 'Create new task' },
      { name: 'list', type: 'boolean', description: 'List tasks' },
      { name: 'complete', type: 'string', description: 'Complete task by ID' }
    ],
    examples: [
      '/task --create',
      '/task --list',
      '/task --complete task-123'
    ],
    mcpSupport: false
  }
];

// SuperClaude Personas (9 total)
export const SUPERCLAUDE_PERSONAS: SuperClaudePersona[] = [
  {
    id: 'architect',
    name: 'Architect',
    focusArea: 'System design',
    tools: ['Sequential', 'Context7'],
    useCases: ['Architecture planning', 'System design', 'Technical leadership'],
    flag: '--persona-architect'
  },
  {
    id: 'frontend',
    name: 'Frontend',
    focusArea: 'User experience',
    tools: ['Magic', 'Puppeteer', 'Context7'],
    useCases: ['UI development', 'User experience', 'Component design'],
    flag: '--persona-frontend'
  },
  {
    id: 'backend',
    name: 'Backend',
    focusArea: 'Server systems',
    tools: ['Context7', 'Sequential'],
    useCases: ['API development', 'Database design', 'Server architecture'],
    flag: '--persona-backend'
  },
  {
    id: 'security',
    name: 'Security',
    focusArea: 'Security analysis',
    tools: ['Sequential', 'Context7'],
    useCases: ['Security reviews', 'Vulnerability analysis', 'Compliance'],
    flag: '--persona-security'
  },
  {
    id: 'analyzer',
    name: 'Analyzer',
    focusArea: 'Problem solving',
    tools: ['All MCP tools'],
    useCases: ['Debugging', 'Root cause analysis', 'Performance analysis'],
    flag: '--persona-analyzer'
  },
  {
    id: 'qa',
    name: 'QA',
    focusArea: 'Quality assurance',
    tools: ['Puppeteer', 'Context7'],
    useCases: ['Testing', 'Quality reviews', 'Test automation'],
    flag: '--persona-qa'
  },
  {
    id: 'performance',
    name: 'Performance',
    focusArea: 'Optimization',
    tools: ['Puppeteer', 'Sequential'],
    useCases: ['Performance tuning', 'Optimization', 'Monitoring'],
    flag: '--persona-performance'
  },
  {
    id: 'refactorer',
    name: 'Refactorer',
    focusArea: 'Code quality',
    tools: ['Sequential', 'Context7'],
    useCases: ['Code improvement', 'Refactoring', 'Technical debt'],
    flag: '--persona-refactorer'
  },
  {
    id: 'mentor',
    name: 'Mentor',
    focusArea: 'Knowledge sharing',
    tools: ['Context7', 'Sequential'],
    useCases: ['Documentation', 'Teaching', 'Knowledge transfer'],
    flag: '--persona-mentor'
  }
];

// Pre-defined team workflows
export const SUPERCLAUDE_WORKFLOWS: SuperClaudeWorkflow[] = [
  {
    id: 'code-review',
    name: 'Code Review Workflow',
    description: 'Complete code review process with quality and security checks',
    category: 'code-review',
    steps: [
      {
        command: 'analyze',
        flags: ['--code', '--think'],
        persona: 'analyzer',
        description: 'Initial code analysis',
        order: 1
      },
      {
        command: 'review',
        flags: ['--quality', '--evidence'],
        persona: 'qa',
        description: 'Quality review with evidence',
        order: 2
      },
      {
        command: 'scan',
        flags: ['--security', '--validate'],
        persona: 'security',
        description: 'Security validation',
        order: 3
      }
    ]
  },
  {
    id: 'architecture-review',
    name: 'Architecture Review',
    description: 'Comprehensive architecture analysis and design review',
    category: 'architecture',
    steps: [
      {
        command: 'analyze',
        flags: ['--architecture', '--seq'],
        persona: 'architect',
        description: 'Architecture analysis',
        order: 1
      },
      {
        command: 'design',
        flags: ['--api', '--ddd'],
        persona: 'architect',
        description: 'Design validation',
        order: 2
      },
      {
        command: 'document',
        flags: ['--api', '--wiki'],
        persona: 'mentor',
        description: 'Documentation update',
        order: 3
      }
    ]
  },
  {
    id: 'security-audit',
    name: 'Security Audit',
    description: 'Complete security audit with OWASP compliance',
    category: 'security',
    steps: [
      {
        command: 'scan',
        flags: ['--security', '--owasp', '--deps'],
        persona: 'security',
        description: 'Security scan with OWASP',
        order: 1
      },
      {
        command: 'analyze',
        flags: ['--code', '--seq'],
        persona: 'security',
        description: 'Code security analysis',
        order: 2
      },
      {
        command: 'review',
        flags: ['--security', '--evidence'],
        persona: 'security',
        description: 'Security review',
        order: 3
      }
    ]
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    description: 'Performance analysis and optimization workflow',
    category: 'performance',
    steps: [
      {
        command: 'analyze',
        flags: ['--code', '--think'],
        persona: 'performance',
        description: 'Performance analysis',
        order: 1
      },
      {
        command: 'improve',
        flags: ['--performance', '--threshold', '95%'],
        persona: 'performance',
        description: 'Performance improvement',
        order: 2
      },
      {
        command: 'test',
        flags: ['--e2e', '--pup'],
        persona: 'qa',
        description: 'Performance testing',
        order: 3
      }
    ]
  },
  {
    id: 'deployment-pipeline',
    name: 'Deployment Pipeline',
    description: 'Complete deployment workflow with validation',
    category: 'deployment',
    steps: [
      {
        command: 'test',
        flags: ['--coverage', '--e2e'],
        persona: 'qa',
        description: 'Pre-deployment testing',
        order: 1
      },
      {
        command: 'scan',
        flags: ['--security', '--validate'],
        persona: 'security',
        description: 'Security validation',
        order: 2
      },
      {
        command: 'deploy',
        flags: ['--env', 'staging', '--plan'],
        description: 'Staging deployment',
        order: 3
      },
      {
        command: 'deploy',
        flags: ['--env', 'prod', '--plan'],
        description: 'Production deployment',
        order: 4
      }
    ]
  }
];