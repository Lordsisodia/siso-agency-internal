/**
 * SISO IDE UI Enhancement Integration Configuration
 * Combines best features from multiple AI-powered IDE projects
 */

export const sisoIDEConfig = {
  // Core Components
  core: {
    ui: {
      framework: 'react', // From Claude Code UI
      editor: 'monaco-editor', // VSCode's editor
      terminal: 'xterm.js', // Professional terminal
      fileExplorer: 'custom-react-tree', // From Claude Code UI
      themes: ['dark', 'light', 'siso-custom']
    },
    
    backend: {
      server: 'express', // From Claude Code UI
      websocket: 'socket.io', // Real-time communication
      database: 'sqlite', // Local session storage
      auth: 'jwt' // Secure authentication
    }
  },

  // AI Providers (Multi-provider support)
  providers: {
    anthropic: {
      models: ['claude-3.5-sonnet', 'claude-opus-4.1'],
      endpoint: 'https://api.anthropic.com',
      features: ['chat', 'code-completion', 'refactoring']
    },
    openai: {
      models: ['gpt-4', 'gpt-5'],
      endpoint: 'https://api.openai.com',
      features: ['chat', 'code-completion', 'embeddings']
    },
    local: {
      models: ['codellama', 'mixtral', 'deepseek-coder'],
      endpoint: 'http://localhost:11434', // Ollama
      features: ['chat', 'code-completion', 'offline-mode']
    },
    custom: {
      models: [], // User-defined models
      endpoint: process.env.CUSTOM_LLM_ENDPOINT,
      features: ['configurable']
    }
  },

  // Feature Modules
  features: {
    // From Claude Code UI
    projectManagement: {
      enabled: true,
      autoDiscovery: true,
      projectPath: '~/.siso/projects/',
      sessionManagement: true
    },

    // From Continue.dev
    contextAwareness: {
      enabled: true,
      indexing: 'tree-sitter',
      contextWindow: 128000,
      smartContext: true
    },

    // From Aider
    gitIntegration: {
      enabled: true,
      autoCommit: false,
      conventionalCommits: true,
      gitFlow: true
    },

    // From Cline
    autonomousMode: {
      enabled: true,
      taskRunner: true,
      fileOperations: true,
      systemCommands: true,
      requireApproval: true
    },

    // From Zed
    collaboration: {
      enabled: true,
      realtime: true,
      voiceChat: false,
      screenShare: false
    },

    // From Open Interpreter
    naturalLanguage: {
      enabled: true,
      codeExecution: true,
      systemControl: false,
      sandboxed: true
    },

    // MCP Support
    mcp: {
      enabled: true,
      servers: [
        'filesystem',
        'git',
        'sequential-thinking',
        'notion',
        'supabase'
      ],
      autoConnect: true
    },

    // Custom SISO Features
    siso: {
      brainMode: true,
      multiAgent: true,
      tokenOptimization: true,
      advancedMemory: true,
      cognitiveArchetypes: true
    }
  },

  // UI Components
  components: {
    // Main Layout
    layout: {
      type: 'flexible', // Adaptive layout
      sidebar: {
        position: 'left',
        collapsible: true,
        defaultWidth: 250
      },
      activityBar: {
        position: 'left',
        items: ['files', 'search', 'git', 'debug', 'extensions', 'ai']
      },
      statusBar: {
        position: 'bottom',
        items: ['model', 'tokens', 'branch', 'errors', 'warnings']
      },
      panels: {
        terminal: { defaultOpen: false },
        output: { defaultOpen: false },
        problems: { defaultOpen: false },
        aiChat: { defaultOpen: true }
      }
    },

    // Editor Configuration
    editor: {
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, monospace',
      tabSize: 2,
      wordWrap: 'on',
      minimap: true,
      lineNumbers: true,
      formatOnSave: true,
      autoSave: 'afterDelay',
      autoSaveDelay: 1000
    },

    // AI Assistant
    aiAssistant: {
      position: 'right',
      defaultWidth: 400,
      streaming: true,
      codeBlocks: true,
      markdown: true,
      voice: false,
      suggestions: true
    }
  },

  // Integrations
  integrations: {
    // IDE Integrations
    vscode: {
      enabled: true,
      extensions: ['siso-ide', 'continue', 'cline']
    },
    cursor: {
      enabled: true,
      rules: true,
      composer: true
    },
    neovim: {
      enabled: false,
      plugin: 'siso.nvim'
    },

    // Service Integrations
    github: {
      enabled: true,
      oauth: true,
      gists: true,
      copilot: false
    },
    gitlab: {
      enabled: false
    },
    notion: {
      enabled: true,
      workspace: process.env.NOTION_WORKSPACE
    },
    slack: {
      enabled: false,
      webhook: process.env.SLACK_WEBHOOK
    }
  },

  // Performance
  performance: {
    caching: {
      enabled: true,
      strategy: 'lru',
      maxSize: '500mb'
    },
    indexing: {
      enabled: true,
      incremental: true,
      workers: 4
    },
    gpu: {
      enabled: false, // Future: Zed-style GPU acceleration
      renderer: 'webgpu'
    }
  },

  // Security
  security: {
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm'
    },
    apiKeys: {
      storage: 'secure-keychain',
      rotation: true
    },
    sandbox: {
      codeExecution: true,
      systemAccess: false
    }
  },

  // Telemetry
  telemetry: {
    enabled: false,
    anonymous: true,
    events: ['errors', 'performance'],
    endpoint: null
  },

  // Plugins
  plugins: {
    enabled: true,
    marketplace: 'https://siso-ide.com/plugins',
    autoUpdate: true,
    sandboxed: true
  },

  // Shortcuts
  shortcuts: {
    'cmd+k': 'ai.chat',
    'cmd+i': 'ai.inline',
    'cmd+shift+l': 'ai.explain',
    'cmd+shift+r': 'ai.refactor',
    'cmd+shift+t': 'ai.test',
    'cmd+shift+d': 'ai.debug',
    'cmd+shift+g': 'git.commit',
    'cmd+p': 'quickOpen',
    'cmd+shift+p': 'commandPalette'
  }
};

// Environment-specific overrides
export const environmentConfig = {
  development: {
    telemetry: { enabled: false },
    security: { sandbox: { systemAccess: true } },
    features: { autonomousMode: { requireApproval: false } }
  },
  production: {
    telemetry: { enabled: true },
    security: { sandbox: { systemAccess: false } },
    features: { autonomousMode: { requireApproval: true } }
  }
};

// Export initialization function
export function initializeSisoIDE(customConfig = {}) {
  const env = process.env.NODE_ENV || 'development';
  const envConfig = environmentConfig[env] || {};
  
  return {
    ...sisoIDEConfig,
    ...envConfig,
    ...customConfig
  };
}